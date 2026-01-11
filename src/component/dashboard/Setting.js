import React, { useRef, useState, useEffect } from 'react';
import { storage, auth, db } from '../../firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import './Setting.css';

const Setting = () => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(localStorage.getItem('photoURL') || 'https://via.placeholder.com/150');
  
  const [formData, setFormData] = useState({
    displayName: localStorage.getItem('cName') || '',
    email: localStorage.getItem('email') || '',
    phone: '',
    address: '',
    taxId: '',
    website: '',
    invoicePrefix: 'INV',
    defaultTaxRate: 0,
    defaultPaymentTerms: 30,
    invoiceNotes: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', localStorage.getItem('uid')));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setFormData(prev => ({
          ...prev,
          displayName: userData.displayName || prev.displayName,
          email: userData.email || prev.email,
          phone: userData.phone || '',
          address: userData.address || '',
          taxId: userData.taxId || '',
          website: userData.website || '',
          invoicePrefix: userData.invoicePrefix || 'INV',
          defaultTaxRate: userData.defaultTaxRate || 0,
          defaultPaymentTerms: userData.defaultPaymentTerms || 30,
          invoiceNotes: userData.invoiceNotes || ''
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onSelectFile = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      if (!selectedFile.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile));
    }
  };

  const updateLogo = async () => {
    if (!file) {
      toast.error('Please select a logo file');
      return;
    }

    setIsLoading(true);
    try {
      const fileRef = ref(storage, `profile-pictures/${auth.currentUser.uid}/${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
        },
        (error) => {
          console.error('File upload failed:', error);
          toast.error('Error uploading logo');
          setIsLoading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            await updateProfile(auth.currentUser, {
              photoURL: downloadURL,
            });
            await updateDoc(doc(db, 'users', localStorage.getItem('uid')), {
              photoURL: downloadURL,
            });
            localStorage.setItem('photoURL', downloadURL);
            setFile(null);
            toast.success('Logo updated successfully!');
            setIsLoading(false);
          } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Error updating logo');
            setIsLoading(false);
          }
        }
      );
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error uploading logo');
      setIsLoading(false);
    }
  };

  const updateCompanyInfo = async () => {
    if (!formData.displayName) {
      toast.error('Company name is required');
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: formData.displayName,
      });

      await updateDoc(doc(db, 'users', localStorage.getItem('uid')), {
        displayName: formData.displayName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        taxId: formData.taxId,
        website: formData.website,
        invoicePrefix: formData.invoicePrefix,
        defaultTaxRate: parseFloat(formData.defaultTaxRate) || 0,
        defaultPaymentTerms: parseInt(formData.defaultPaymentTerms) || 30,
        invoiceNotes: formData.invoiceNotes,
        updatedAt: new Date().toISOString()
      });

      localStorage.setItem('cName', formData.displayName);
      localStorage.setItem('email', formData.email);
      toast.success('Company information updated successfully!');
      setIsLoading(false);
    } catch (error) {
      console.error('Error updating company info:', error);
      toast.error('Error updating company information');
      setIsLoading(false);
    }
  };

  return (
    <div className='settings-page'>
      <h1 className='page-title'>Settings</h1>

      <div className='settings-container'>
        <div className='settings-section'>
          <h2 className='section-title'>
            <i className="fa-solid fa-image"></i> Company Logo
          </h2>
          <div className='logo-section'>
            <div className='logo-preview'>
              <img
                src={imageUrl}
                alt='Company Logo'
                className='logo-image'
              />
              <button
                onClick={() => fileInputRef.current.click()}
                className='btn btn-secondary'
                disabled={isLoading}
              >
                <i className="fa-solid fa-upload"></i> Change Logo
              </button>
              <input
                onChange={onSelectFile}
                style={{ display: 'none' }}
                type='file'
                accept='image/*'
                ref={fileInputRef}
              />
              {file && (
                <button
                  onClick={updateLogo}
                  className='btn btn-primary'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Uploading...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-check"></i> Save Logo
                    </>
                  )}
                </button>
              )}
            </div>
            <p className='help-text'>Recommended size: 200x200px. Maximum file size: 5MB</p>
          </div>
        </div>

        <div className='settings-section'>
          <h2 className='section-title'>
            <i className="fa-solid fa-building"></i> Company Information
          </h2>
          <div className='form-grid'>
            <div className='form-group'>
              <label>Company Name *</label>
              <input
                type='text'
                name='displayName'
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder='Enter company name'
                className='form-input'
                required
              />
            </div>

            <div className='form-group'>
              <label>Email Address</label>
              <input
                type='email'
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                placeholder='company@email.com'
                className='form-input'
              />
            </div>

            <div className='form-group'>
              <label>Phone Number</label>
              <input
                type='tel'
                name='phone'
                value={formData.phone}
                onChange={handleInputChange}
                placeholder='+1234567890'
                className='form-input'
              />
            </div>

            <div className='form-group'>
              <label>Website</label>
              <input
                type='url'
                name='website'
                value={formData.website}
                onChange={handleInputChange}
                placeholder='https://www.example.com'
                className='form-input'
              />
            </div>

            <div className='form-group form-group-full'>
              <label>Address</label>
              <textarea
                name='address'
                value={formData.address}
                onChange={handleInputChange}
                placeholder='Enter company address'
                className='form-input'
                rows={3}
              />
            </div>

            <div className='form-group'>
              <label>Tax ID / VAT Number</label>
              <input
                type='text'
                name='taxId'
                value={formData.taxId}
                onChange={handleInputChange}
                placeholder='Enter tax ID'
                className='form-input'
              />
            </div>
          </div>
        </div>

        <div className='settings-section'>
          <h2 className='section-title'>
            <i className="fa-solid fa-file-invoice"></i> Invoice Settings
          </h2>
          <div className='form-grid'>
            <div className='form-group'>
              <label>Invoice Number Prefix</label>
              <input
                type='text'
                name='invoicePrefix'
                value={formData.invoicePrefix}
                onChange={handleInputChange}
                placeholder='INV'
                className='form-input'
                maxLength={10}
              />
              <p className='help-text-small'>Prefix for invoice numbers (e.g., INV-0001)</p>
            </div>

            <div className='form-group'>
              <label>Default Tax Rate (%)</label>
              <input
                type='number'
                name='defaultTaxRate'
                value={formData.defaultTaxRate}
                onChange={handleInputChange}
                placeholder='0'
                className='form-input'
                min='0'
                max='100'
                step='0.01'
              />
            </div>

            <div className='form-group'>
              <label>Default Payment Terms (days)</label>
              <input
                type='number'
                name='defaultPaymentTerms'
                value={formData.defaultPaymentTerms}
                onChange={handleInputChange}
                placeholder='30'
                className='form-input'
                min='1'
              />
            </div>

            <div className='form-group form-group-full'>
              <label>Default Invoice Notes / Terms</label>
              <textarea
                name='invoiceNotes'
                value={formData.invoiceNotes}
                onChange={handleInputChange}
                placeholder='Enter default notes or terms and conditions to appear on invoices...'
                className='form-input'
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className='settings-actions'>
          <button
            onClick={updateCompanyInfo}
            className='btn btn-primary btn-large'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Saving...
              </>
            ) : (
              <>
                <i className="fa-solid fa-save"></i> Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Setting;
