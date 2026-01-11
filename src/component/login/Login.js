import React, { useState } from 'react'
import './login.css'
import { Link, useNavigate } from 'react-router-dom'
import {auth} from '../../firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { toast } from 'react-toastify'

const Login = () => {
  const [email,setEmail] = useState('')
  const [password,setPassword] = useState('')
  const [isLoading,setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const navigate = useNavigate()

  const validateForm = () => {
    const newErrors = {}
    
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const submitHandler = (e)=>{
    e.preventDefault();
    
    if (!validateForm()) {
      return
    }
    
    setLoading(true)
    setErrors({})
    
    signInWithEmailAndPassword(auth,email,password)
    .then((userCredential) => {
      const user = userCredential.user;
      localStorage.setItem('cName',user.displayName || 'User')
      localStorage.setItem('photoURL',user.photoURL || 'https://via.placeholder.com/90')
      localStorage.setItem('email',user.email)
      localStorage.setItem('phoneNumber',user.phoneNumber || '')
      localStorage.setItem('uid',user.uid)
      toast.success('Login successful!')
      navigate('/dashboard')
      setLoading(false)
    })
    .catch((error) => {
      console.log(error)
      setLoading(false)
      let errorMessage = 'An error occurred. Please try again.'
      
      switch(error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.'
          break
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password.'
          break
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.'
          break
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.'
          break
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.'
          break
        default:
          errorMessage = error.message || errorMessage
      }
      
      toast.error(errorMessage)
      setErrors({ submit: errorMessage })
    });
  }
  
  return (
    <div className='login-wrapper'>
        <div className='login-container'>
            <div className='login-boxes login-left'>
              <div className='login-left-content'>
                <h1>Invoice Manager</h1>
                <p>Streamline your invoicing process with our professional invoice management system.</p>
                <div className='login-features'>
                  <div className='feature-item'>
                    <i className="fa-solid fa-check-circle"></i>
                    <span>Easy Invoice Creation</span>
                  </div>
                  <div className='feature-item'>
                    <i className="fa-solid fa-check-circle"></i>
                    <span>Professional Templates</span>
                  </div>
                  <div className='feature-item'>
                    <i className="fa-solid fa-check-circle"></i>
                    <span>Secure Cloud Storage</span>
                  </div>
                </div>
              </div>
            </div>
            <div className='login-boxes login-right'>
                <div className='login-form-wrapper'>
                  <h2 className='login-heading'>Welcome Back</h2>
                  <p className='login-subheading'>Sign in to your account</p>
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
                        <label>Password</label>
                        <div className='password-input-wrapper'>
                          <input 
                            type={showPassword ? 'text' : 'password'}
                            className={`login-input ${errors.password ? 'error' : ''}`}
                            placeholder='Enter your password'
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
                      
                      <button 
                        className='login-btn' 
                        type='submit'
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <i className="fa-solid fa-spinner fa-spin"></i> Signing in...
                          </>
                        ) : (
                          <>
                            Sign In
                          </>
                        )}
                      </button>
                  </form>
                  <p className='register-link-text'>
                    Don't have an account? <Link to='/register' className='register-link'>Create Account</Link>
                  </p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Login
