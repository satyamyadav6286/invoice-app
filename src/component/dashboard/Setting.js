import React, { useRef, useState } from 'react';
import { storage, auth, db } from '../../firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

const Setting = () => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [displayName, setDisplayName] = useState(localStorage.getItem('cName'));
  const [imageUrl, setImageUrl] = useState(localStorage.getItem('photoURL'));

  // Update Company Name
  const updateCompanyName = () => {
    updateProfile(auth.currentUser, {
      displayName: displayName,
    }).then(() => {
      localStorage.setItem('cName', displayName);
      updateDoc(doc(db, 'users', localStorage.getItem('uid')), {
        displayName: displayName,
      }).then(() => {
        window.location.reload(); // Reload to reflect changes
      });
    });
  };

  // Handle File Selection
  const onSelectFile = (e) => {
    setFile(e.target.files[0]);
    setImageUrl(URL.createObjectURL(e.target.files[0])); // Update preview with selected image
  };

  // Upload new Profile Picture and Update Firebase
  const updateLogo = () => {
    if (!file) return;

    // Create a unique storage path for the user's profile image
    const fileRef = ref(storage, `profile-pictures/${auth.currentUser.uid}/${file.name}`);

    // Start the file upload
    const uploadTask = uploadBytesResumable(fileRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Optional: Handle progress of the upload if needed
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      },
      (error) => {
        console.error('File upload failed:', error);
      },
      () => {
        // Get the file's download URL after upload is complete
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // Update the user's profile picture in Firebase Authentication
          updateProfile(auth.currentUser, {
            photoURL: downloadURL,
          }).then(() => {
            // Update the profile picture URL in Firestore
            updateDoc(doc(db, 'users', localStorage.getItem('uid')), {
              photoURL: downloadURL,
            }).then(() => {
              localStorage.setItem('photoURL', downloadURL); // Update local storage
              window.location.reload(); // Reload to reflect changes
            });
          });
        });
      }
    );
  };

  return (
    <div>
      <p>Setting</p>
      <div className='setting-wrapper'>
        <div className='profile-info update-cName'>
          {/* Profile picture preview */}
          <img
            onClick={() => fileInputRef.current.click()}
            className='pro'
            alt='profile-pic'
            src={imageUrl}
          />
          {/* Hidden file input for profile picture upload */}
          <input
            onChange={onSelectFile}
            style={{ display: 'none' }}
            type='file'
            ref={fileInputRef}
          />
          {/* Show update button if a file is selected */}
          {file && (
            <button
              onClick={updateLogo}
              style={{ width: '30%', padding: '10px', backgroundColor: 'hotpink' }}
            >
              Update Profile Pic
            </button>
          )}
        </div>

        <div className='update-cName'>
          {/* Company name input and update button */}
          <input
            onChange={(e) => setDisplayName(e.target.value)}
            type='text'
            placeholder='Company name'
            value={displayName}
          />
          <button onClick={updateCompanyName}>Update Company Name</button>
        </div>
      </div>
    </div>
  );
};

export default Setting;
