import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { toast } from 'react-toastify'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import './InvoiceDetail.css'

const InvoiceDetail = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [data, setData] = useState(location.state || {})
  const [isLoading, setIsLoading] = useState(false)

  const formatDate = (dateField) => {
    if (!dateField) return 'N/A'
    try {
      const date = dateField.toDate ? dateField.toDate() : new Date(dateField.seconds * 1000)
      return format(date, 'MMMM dd, yyyy')
    } catch {
      return 'N/A'
    }
  }

  const printInvoice = () => {
    if (!data || !data.id) {
      toast.error('No invoice data available')
      return
    }
    setIsLoading(true)
    const input = document.getElementById('invoice')
    if (!input) {
      toast.error('Invoice element not found')
      setIsLoading(false)
      return
    }
    
    html2canvas(input, { useCORS: true, scale: 2 })
      .then((canvas) => {
        const imageData = canvas.toDataURL('image/png', 1.0)
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: [612, 792]
        })
        
        pdf.internal.scaleFactor = 1
        const imageProps = pdf.getImageProperties(imageData)
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = (imageProps.height * pdfWidth) / imageProps.width

        pdf.addImage(imageData, 'PNG', 0, 0, pdfWidth, pdfHeight)
        pdf.save(`invoice-${data.invoiceNumber || data.id}-${format(new Date(), 'yyyy-MM-dd')}.pdf`)
        toast.success('Invoice downloaded as PDF')
        setIsLoading(false)
      })
      .catch((error) => {
        console.error(error)
        toast.error('Error generating PDF')
        setIsLoading(false)
      })
  }

  const markAsPaid = async () => {
    if (!data || !data.id) {
      toast.error('No invoice data available')
      return
    }
    if (window.confirm('Mark this invoice as paid?')) {
      try {
        await updateDoc(doc(db, 'invoices', data.id), {
          status: 'paid'
        })
        setData({ ...data, status: 'paid' })
        toast.success('Invoice marked as paid')
      } catch (error) {
        console.error(error)
        toast.error('Error updating invoice status')
      }
    }
  }

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'paid':
        return 'status-paid'
      case 'sent':
        return 'status-sent'
      case 'draft':
        return 'status-draft'
      default:
        return 'status-draft'
    }
  }

  const products = data.products || data.product || []
  const subtotal = Number(data.subtotal) || Number(data.total) || 0
  const taxAmount = Number(data.taxAmount) || 0
  const discountAmount = Number(data.discountAmount) || 0
  const total = Number(data.total) || 0

  return (
    <div className='invoice-detail-page'>
      <div className='invoice-actions-bar'>
        <button onClick={() => navigate('/dashboard/invoices')} className='btn btn-secondary'>
          <i className="fa-solid fa-arrow-left"></i> Back to Invoices
        </button>
        <div className='action-buttons'>
          <button 
            onClick={() => navigate('/dashboard/edit-invoice', { state: data })} 
            className='btn btn-info'
          >
            <i className="fa-solid fa-edit"></i> Edit Invoice
          </button>
          {data.status !== 'paid' && (
            <button onClick={markAsPaid} className='btn btn-success'>
              <i className="fa-solid fa-check"></i> Mark as Paid
            </button>
          )}
          <button 
            onClick={printInvoice} 
            className='btn btn-primary'
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Generating PDF...
              </>
            ) : (
              <>
                <i className="fa-solid fa-download"></i> Download PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div id='invoice' className='invoice-wrapper'>
        <div className='invoice-header'>
          <div className='company-detail'>
            <img 
              className='company-logo' 
              alt='logo' 
              src={localStorage.getItem('photoURL') || 'https://via.placeholder.com/100'}
            />
            <h2 className='company-name'>{localStorage.getItem('cName') || 'Your Company'}</h2>
            <p className='company-info'>{localStorage.getItem('email') || ''}</p>
          </div>
          
          <div className='invoice-info'>
            <h1 className='invoice-title'>INVOICE</h1>
            <div className='invoice-meta'>
              <div className='meta-item'>
                <span className='meta-label'>Invoice #:</span>
                <span className='meta-value'>{data.invoiceNumber || `INV-${data.id?.slice(0, 8)}`}</span>
              </div>
              <div className='meta-item'>
                <span className='meta-label'>Date:</span>
                <span className='meta-value'>{formatDate(data.invoiceDate || data.date)}</span>
              </div>
              {data.dueDate && (
                <div className='meta-item'>
                  <span className='meta-label'>Due Date:</span>
                  <span className='meta-value'>{formatDate(data.dueDate)}</span>
                </div>
              )}
              <div className='meta-item'>
                <span className='meta-label'>Status:</span>
                <span className={`status-badge ${getStatusBadgeClass(data.status || 'draft')}`}>
                  {(data.status || 'draft').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='invoice-body'>
          <div className='billing-section'>
            <div className='bill-to'>
              <h3>Bill To:</h3>
              <p className='customer-name'>{data.customerName || data.to || 'N/A'}</p>
              {data.address && <p className='customer-address'>{data.address}</p>}
              {data.email && <p className='customer-email'>{data.email}</p>}
              {data.phone && <p className='customer-phone'>{data.phone}</p>}
            </div>
          </div>

          <table className='product-table'>
            <thead>
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id || index}>
                  <td>{index + 1}</td>
                  <td>{product.name}</td>
                  <td>₹{parseFloat(product.price || 0).toFixed(2)}</td>
                  <td>{product.qty || 1}</td>
                  <td>₹{(parseFloat(product.price || 0) * parseFloat(product.qty || 1)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className='invoice-totals'>
            <div className='total-row'>
              <span className='total-label'>Subtotal:</span>
              <span className='total-value'>₹{subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className='total-row'>
                <span className='total-label'>Discount:</span>
                <span className='total-value discount'>- ₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            {taxAmount > 0 && (
              <div className='total-row'>
                <span className='total-label'>Tax ({Number(data.taxRate) || 0}%):</span>
                <span className='total-value'>₹{taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className='total-row total-final'>
              <span className='total-label'>Total:</span>
              <span className='total-value'>₹{total.toFixed(2)}</span>
            </div>
          </div>

          {data.notes && (
            <div className='invoice-notes'>
              <h3>Notes:</h3>
              <p>{data.notes}</p>
            </div>
          )}
        </div>

        <div className='invoice-footer'>
          <p>Thank you for your business!</p>
        </div>
      </div>
    </div>
  )
}

export default InvoiceDetail
