import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Invoice Manager</h3>
          <p>Professional invoice management system for your business needs.</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/dashboard/home">Dashboard</a></li>
            <li><a href="/dashboard/invoices">Invoices</a></li>
            <li><a href="/dashboard/new-invoice">Create Invoice</a></li>
            <li><a href="/dashboard/setting">Settings</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Connect</h4>
          <div className="social-links">
            <a 
              href="https://github.com/satyamyadav6286" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <i className="fab fa-github"></i>
            </a>
            <a 
              href="https://www.linkedin.com/in/satyamgovindyadav/" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <i className="fab fa-linkedin"></i>
            </a>
            <a 
              href="mailto:satyamyadav6286@gmail.com" 
              aria-label="Email"
            >
              <i className="fas fa-envelope"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          &copy; {currentYear} <strong>Satyam Govind Yadav</strong>. All rights reserved.
        </p>
        <div className="footer-badges">
          <a 
            href="https://github.com/satyamyadav6286" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-badge"
          >
            <img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
          </a>
          <a 
            href="https://www.linkedin.com/in/satyamgovindyadav/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="footer-badge"
          >
            <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
          </a>
          <a 
            href="mailto:satyamyadav6286@gmail.com" 
            className="footer-badge"
          >
            <img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
