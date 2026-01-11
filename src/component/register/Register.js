import React, { useRef, useState } from 'react'
import '../login/login.css'
import { Link, useNavigate } from 'react-router-dom'
import {auth,storage,db} from '../../firebase'
import {createUserWithEmailAndPassword, updateProfile} from 'firebase/auth'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { doc, setDoc } from 'firebase/firestore'
import { toast } from 'react-toastify'

const Register = () => {
    const fileInputRef = useRef(null)
    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [file,setFile] = useState(null)
    const [displayName,setDisplayName] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [errors, setErrors] = useState({})

    const navigate = useNavigate()

    const validateForm = () => {
        const newErrors = {}
        
        if (!email) {
            newErrors.email = 'Email is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Please enter a valid email address'
        }
        
        if (!displayName) {
            newErrors.displayName = 'Company name is required'
        } else if (displayName.length < 2) {
            newErrors.displayName = 'Company name must be at least 2 characters'
        }
        
        if (!password) {
            newErrors.password = 'Password is required'
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters'
        }
        
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password'
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }
        
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const submitHandler = (e)=> {
        e.preventDefault()
        
        if (!validateForm()) {
            return
        }

        if (!file) {
            toast.error('Please select a company logo')
            return
        }

        setIsLoading(true)
        setErrors({})

        createUserWithEmailAndPassword(auth,email,password)
        .then(newUser=>{
            const date = new Date().getTime()
            const storageRef = ref(storage,`profile-pictures/${newUser.user.uid}/${displayName + date}`)
            
            uploadBytesResumable(storageRef,file)
            .then(res=>{
                getDownloadURL(storageRef)
                .then(downloadedUrl=>{
                    updateProfile(newUser.user,{
                        displayName:displayName,
                        photoURL:downloadedUrl
                    })

                    setDoc(doc(db,"users",newUser.user.uid),{
                        uid:newUser.user.uid,
                        displayName:displayName,
                        email:email,
                        photoURL:downloadedUrl,
                        createdAt: new Date().toISOString()
                    })
                    .then(() => {
                        localStorage.setItem('cName', displayName)
                        localStorage.setItem('photoURL', downloadedUrl)
                        localStorage.setItem('email', email)
                        localStorage.setItem('uid', newUser.user.uid)
                        toast.success('Account created successfully!')
                        navigate('/dashboard')
                        setIsLoading(false)
                    })
                })
            })
            .catch(error=>{
                console.log(error)
                setIsLoading(false)
                toast.error('Error uploading logo. Please try again.')
            })
        })
        .catch(err=>{
            console.log(err)
            setIsLoading(false)
            let errorMessage = 'An error occurred. Please try again.'
            
            switch(err.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'An account with this email already exists.'
                    break
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address.'
                    break
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak. Please use a stronger password.'
                    break
                default:
                    errorMessage = err.message || errorMessage
            }
            
            toast.error(errorMessage)
            setErrors({ submit: errorMessage })
        })
    }

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (selectedFile) {
            if (selectedFile.size > 5 * 1024 * 1024) {
                toast.error('File size should be less than 5MB')
                return
            }
            if (!selectedFile.type.startsWith('image/')) {
                toast.error('Please select an image file')
                return
            }
            setFile(selectedFile)
            setErrors({...errors, file: ''})
        }
    }
     
    return (
        <div className='login-wrapper'>
            <div className='login-container'>
                <div className='login-boxes login-left'>
                    <div className='login-left-content'>
                        <h1>Create Your Account</h1>
                        <p>Join thousands of businesses using our invoice management system to streamline their operations.</p>
                        <div className='login-features'>
                            <div className='feature-item'>
                                <i className="fa-solid fa-check-circle"></i>
                                <span>Free to Get Started</span>
                            </div>
                            <div className='feature-item'>
                                <i className="fa-solid fa-check-circle"></i>
                                <span>Secure & Reliable</span>
                            </div>
                            <div className='feature-item'>
                                <i className="fa-solid fa-check-circle"></i>
                                <span>24/7 Support</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='login-boxes login-right'>
                    <div className='login-form-wrapper'>
                        <h2 className='login-heading'>Sign Up</h2>
                        <p className='login-subheading'>Create your account to get started</p>

                        <form onSubmit={submitHandler} className='login-form'>
                            <div className='form-group'>
                                <label>Email Address</label>
                                <input 
                                    type='email' 
                                    className={`login-input ${errors.email ? 'error' : ''}`}
                                    placeholder='Enter your email'
                                    value={email}
                                    onChange={(e)=>{setEmail(e.target.value); setErrors({...errors, email: ''})}}
                                    disabled={isLoading}
                                />
                                {errors.email && <span className='error-message'>{errors.email}</span>}
                            </div>

                            <div className='form-group'>
                                <label>Company Name</label>
                                <input 
                                    type='text' 
                                    className={`login-input ${errors.displayName ? 'error' : ''}`}
                                    placeholder='Enter your company name'
                                    value={displayName}
                                    onChange={(e)=>{setDisplayName(e.target.value); setErrors({...errors, displayName: ''})}}
                                    disabled={isLoading}
                                />
                                {errors.displayName && <span className='error-message'>{errors.displayName}</span>}
                            </div>

                            <div className='form-group'>
                                <label>Password</label>
                                <div className='password-input-wrapper'>
                                    <input 
                                        type={showPassword ? 'text' : 'password'}
                                        className={`login-input ${errors.password ? 'error' : ''}`}
                                        placeholder='Create a password'
                                        value={password}
                                        onChange={(e)=>{setPassword(e.target.value); setErrors({...errors, password: ''})}}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type='button'
                                        className='password-toggle'
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                {errors.password && <span className='error-message'>{errors.password}</span>}
                            </div>

                            <div className='form-group'>
                                <label>Confirm Password</label>
                                <div className='password-input-wrapper'>
                                    <input 
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        className={`login-input ${errors.confirmPassword ? 'error' : ''}`}
                                        placeholder='Confirm your password'
                                        value={confirmPassword}
                                        onChange={(e)=>{setConfirmPassword(e.target.value); setErrors({...errors, confirmPassword: ''})}}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type='button'
                                        className='password-toggle'
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <i className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                                {errors.confirmPassword && <span className='error-message'>{errors.confirmPassword}</span>}
                            </div>

                            <div className='form-group'>
                                <label>Company Logo</label>
                                <input 
                                    onChange={handleFileChange}
                                    style={{display:'none'}} 
                                    type='file' 
                                    accept='image/*'
                                    ref={fileInputRef}
                                    disabled={isLoading}
                                />
                                <button 
                                    type='button'
                                    className='file-input-btn'
                                    onClick={()=>{fileInputRef.current.click()}}
                                    disabled={isLoading}
                                >
                                    <i className="fa-solid fa-upload"></i> {file ? file.name : 'Select Company Logo'}
                                </button>
                                {file && (
                                    <div className='file-preview'>
                                        <i className="fa-solid fa-check-circle"></i> Logo selected
                                    </div>
                                )}
                                {errors.file && <span className='error-message'>{errors.file}</span>}
                            </div>

                            <button 
                                className='login-btn' 
                                type='submit'
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin"></i> Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Create Account
                                    </>
                                )}
                            </button>
                        </form>
                        <p className='register-link-text'>
                            Already have an account? <Link to='/login' className='register-link'>Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Register
