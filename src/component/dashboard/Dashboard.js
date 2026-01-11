import React from 'react'
import '../../component/dashboard/dashboard.css'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import {auth} from '../../firebase'
import {signOut} from 'firebase/auth'
import Footer from '../Footer'
import { toast } from 'react-toastify'

const Dashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const logout = ()=>{
    signOut(auth).then(() => {
      localStorage.clear()
      toast.success('Logged out successfully')
      navigate('/login')
    }).catch((error) => {
      console.log(error)
      toast.error('Error logging out')
    });
  }
  
  return (
    <div className='dashboard-wrapper'>
      <div className='side-nav'>
        <div className='profile-info'>
            <img src={localStorage.getItem('photoURL') || 'https://via.placeholder.com/90'} alt="Profile"/>
            <div>
            <p>{localStorage.getItem('cName') || 'User'}</p>
            <button onClick={logout} className='logout-btn'><i className="fa-solid fa-sign-out-alt"></i> Logout</button>
            </div>
        </div>
        <hr className='nav-divider'/>
        <div className='menu'>
        <Link to='/dashboard/home' className={`menu-link ${location.pathname === '/dashboard/home' || location.pathname === '/dashboard' ? 'active' : ''}`}>
          <i className="fa-solid fa-house"></i> <span>Home</span>
        </Link>
        <Link to='/dashboard/invoices' className={`menu-link ${location.pathname === '/dashboard/invoices' ? 'active' : ''}`}>
          <i className="fa-solid fa-file-invoice"></i> <span>Invoices</span>
        </Link>
        <Link to='/dashboard/new-invoice' className={`menu-link ${location.pathname === '/dashboard/new-invoice' ? 'active' : ''}`}>
          <i className="fa-solid fa-file-circle-plus"></i> <span>New Invoice</span>
        </Link>
        <Link to='/dashboard/clients' className={`menu-link ${location.pathname === '/dashboard/clients' ? 'active' : ''}`}>
          <i className="fa-solid fa-users"></i> <span>Clients</span>
        </Link>
        <Link to='/dashboard/setting' className={`menu-link ${location.pathname === '/dashboard/setting' ? 'active' : ''}`}>
          <i className="fa-solid fa-gear"></i> <span>Settings</span>
        </Link>
        </div>
      </div>

      <div className='main-container'>
        <div className='main-content'>
          <Outlet/>
        </div>
        <Footer/>
      </div>
    </div>
  )
}

export default Dashboard
