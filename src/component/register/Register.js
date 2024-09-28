import React, { useRef, useState } from 'react'
import '../login/login.css'
import { Link, useNavigate } from 'react-router-dom'
import {auth,storage,db} from '../../firebase'
import {createUserWithEmailAndPassword, updateProfile} from 'firebase/auth'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'
import { doc, setDoc } from 'firebase/firestore'

const Register = () => {
    const fileInputRef = useRef(null)
    const [email,setEmail] = useState('')
    const [password,setPassword] = useState('') 
    const [file,setFile] = useState(null)
    const [displayName,setDisplayName] = useState('')

    const navigate = useNavigate()

    const submitHandler = (e)=> {
        e.preventDefault()
        console.log(email,password)

        createUserWithEmailAndPassword(auth,email,password)
        .then(newUser=>{
            console.log(newUser)
            const date = new Date().getTime()
            const storageRef = ref(storage,`${displayName + date}`)
            uploadBytesResumable(storageRef,file)
            .then(res=>{
              console.log(res)
              getDownloadURL(storageRef)
              .then(downloadedUrl=>{
                console.log(downloadedUrl)

                updateProfile(newUser.user,{
                    displayName:displayName,
                    photoURL:downloadedUrl
                  })

                  setDoc(doc(db,"users",newUser.user.uid),{
                    uid:newUser.user.uid,
                    displayName:displayName,
                    email:email,
                    photoURL:downloadedUrl
                  })
                  navigate('/dashboard')

            })
        })
        .catch(error=>{
            console.log(error)
          })
        })
        .catch(err=>{
          console.log(err)
        })
      }
     return (
        <div className='login-wrapper'>
            <div className='login-container'>
                <div className='login-boxes login-left'>

                </div>
                <div className='login-boxes login-right'>
                    <h2 className='login-heading'>Create your Account</h2>

                    <form onSubmit={submitHandler}>
                        <input onChange={(e)=>{setEmail(e.target.value)}} className='login-input' type='text' placeholder='Email' />
                        <input onChange={(e)=>{setDisplayName(e.target.value)}} className='login-input' type='text' placeholder='Company Name' />
                        <input onChange={(e)=>{setPassword(e.target.value)}} className='login-input' type='password' placeholder='Password' />
                        <input onChange={(e)=>{setFile(e.target.files[0])}} style={{display:'none'}} className='login-input' type='file' ref={fileInputRef} />
                        <input className='login-input' type='button' value='Select your Logo' onClick={()=>{fileInputRef.current.click()}} />
                        <input className='login-input login-btn' type='submit' />

                    </form>
                    <Link to='/login' className='register-link'>Login with your Account</Link>
                </div>
            </div>
            
        </div>
    )
}

export default Register