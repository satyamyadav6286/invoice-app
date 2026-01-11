import React, { useEffect, useState } from 'react'
import { db } from '../../firebase'
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import './Invoices.css'

const Invoices = () => {
  const [invoices, setInvoices] = useState([])
  const [filteredInvoices, setFilteredInvoices] = useState([])
  const [isLoading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc')

  const navigate = useNavigate()

  useEffect(() => {
    getData()
  }, [])

  useEffect(() => {
    filterAndSortInvoices()
  }, [invoices, searchTerm, statusFilter, sortBy])

  const getData = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, "invoices"), where('uid', "==", localStorage.getItem('uid')))
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setInvoices(data)
      setLoading(false)
    } catch (error) {
      console.error(error)
      toast.error('Error loading invoices')
      setLoading(false)
    }
  }

  const filterAndSortInvoices = () => {
    let filtered = [...invoices]

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(inv => 
        (inv.customerName || inv.to || '').toLowerCase().includes(term) ||
        (inv.invoiceNumber || '').toLowerCase().includes(term) ||
        (inv.phone || '').includes(term)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inv => {
        const invStatus = inv.status || 'draft'
        if (statusFilter === 'overdue') {
          if (invStatus === 'paid' || invStatus === 'cancelled') return false
          if (inv.dueDate) {
            const dueDate = inv.dueDate.toDate ? inv.dueDate.toDate() : new Date(inv.dueDate.seconds * 1000)
            return dueDate < new Date()
          }
          return false
        }
        return invStatus === statusFilter
      })
    }

    // Sort
    filtered.sort((a, b) => {
      switch(sortBy) {
        case 'date-desc':
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : (a.date?.toDate ? a.date.toDate() : new Date(a.createdAt || a.date))
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : (b.date?.toDate ? b.date.toDate() : new Date(b.createdAt || b.date))
          return dateB - dateA
        case 'date-asc':
          const dateA2 = a.createdAt?.toDate ? a.createdAt.toDate() : (a.date?.toDate ? a.date.toDate() : new Date(a.createdAt || a.date))
          const dateB2 = b.createdAt?.toDate ? b.createdAt.toDate() : (b.date?.toDate ? b.date.toDate() : new Date(b.createdAt || b.date))
          return dateA2 - dateB2
        case 'amount-desc':
          return (b.total || 0) - (a.total || 0)
        case 'amount-asc':
          return (a.total || 0) - (b.total || 0)
        case 'customer-asc':
          return ((a.customerName || a.to || '').toLowerCase()).localeCompare((b.customerName || b.to || '').toLowerCase())
        case 'customer-desc':
          return ((b.customerName || b.to || '').toLowerCase()).localeCompare((a.customerName || a.to || '').toLowerCase())
        default:
          return 0
      }
    })

    setFilteredInvoices(filtered)
  }

  const deleteInvoice = async (id) => {
    if (window.confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, 'invoices', id))
        toast.success('Invoice deleted successfully')
        getData()
      } catch (error) {
        console.error(error)
        toast.error('Error deleting invoice')
      }
    }
  }

  const getStatusBadgeClass = (status) => {
    const invStatus = status || 'draft'
    switch(invStatus) {
      case 'paid':
        return 'status-paid'
      case 'sent':
        return 'status-sent'
      case 'overdue':
        return 'status-overdue'
      case 'draft':
        return 'status-draft'
      default:
        return 'status-draft'
    }
  }

  const getStatusLabel = (invoice) => {
    if (invoice.status === 'paid' || invoice.status === 'cancelled') {
      return invoice.status
    }
    if (invoice.dueDate) {
      const dueDate = invoice.dueDate.toDate ? invoice.dueDate.toDate() : new Date(invoice.dueDate.seconds * 1000)
      if (dueDate < new Date()) {
        return 'overdue'
      }
    }
    return invoice.status || 'draft'
  }

  const formatDate = (dateField) => {
    if (!dateField) return 'N/A'
    try {
      const date = dateField.toDate ? dateField.toDate() : new Date(dateField.seconds * 1000)
      return format(date, 'MMM dd, yyyy')
    } catch {
      return 'N/A'
    }
  }

  return (
    <div className='invoices-page'>
      <div className='page-header'>
        <h1 className='page-title'>Invoices</h1>
        <button 
          onClick={() => navigate('/dashboard/new-invoice')} 
          className='btn btn-primary'
        >
          <i className="fa-solid fa-plus"></i> Create Invoice
        </button>
      </div>

      <div className='filters-section'>
        <div className='search-box'>
          <i className="fa-solid fa-search"></i>
          <input
            type='text'
            placeholder='Search by customer, invoice number, or phone...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='search-input'
          />
        </div>

        <div className='filter-group'>
          <label>Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className='filter-select'
          >
            <option value='all'>All Status</option>
            <option value='draft'>Draft</option>
            <option value='sent'>Sent</option>
            <option value='paid'>Paid</option>
            <option value='overdue'>Overdue</option>
          </select>
        </div>

        <div className='filter-group'>
          <label>Sort By:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className='filter-select'
          >
            <option value='date-desc'>Date (Newest)</option>
            <option value='date-asc'>Date (Oldest)</option>
            <option value='amount-desc'>Amount (High to Low)</option>
            <option value='amount-asc'>Amount (Low to High)</option>
            <option value='customer-asc'>Customer (A-Z)</option>
            <option value='customer-desc'>Customer (Z-A)</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className='loading-container'>
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Loading invoices...</p>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className='no-invoice-wrapper'>
          <i className="fa-solid fa-file-invoice"></i>
          <p>{invoices.length === 0 ? 'You have no invoices yet' : 'No invoices match your filters'}</p>
          {invoices.length === 0 && (
            <button 
              onClick={() => navigate('/dashboard/new-invoice')} 
              className='btn btn-primary'
            >
              Create Your First Invoice
            </button>
          )}
        </div>
      ) : (
        <>
          <div className='invoices-stats'>
            <p>Showing {filteredInvoices.length} of {invoices.length} invoices</p>
          </div>
          <div className='invoices-grid'>
            {filteredInvoices.map(invoice => {
              const status = getStatusLabel(invoice)
              return (
                <div key={invoice.id} className='invoice-card'>
                  <div className='invoice-card-header'>
                    <div>
                      <h3 className='invoice-number'>{invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8)}`}</h3>
                      <p className='invoice-customer'>{invoice.customerName || invoice.to || 'N/A'}</p>
                    </div>
                    <span className={`status-badge ${getStatusBadgeClass(status)}`}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                  </div>
                  
                  <div className='invoice-card-body'>
                    <div className='invoice-detail-row'>
                      <span className='detail-label'><i className="fa-solid fa-calendar"></i> Date:</span>
                      <span className='detail-value'>{formatDate(invoice.invoiceDate || invoice.date)}</span>
                    </div>
                    {invoice.dueDate && (
                      <div className='invoice-detail-row'>
                        <span className='detail-label'><i className="fa-solid fa-clock"></i> Due:</span>
                        <span className='detail-value'>{formatDate(invoice.dueDate)}</span>
                      </div>
                    )}
                    <div className='invoice-detail-row'>
                      <span className='detail-label'><i className="fa-solid fa-phone"></i> Phone:</span>
                      <span className='detail-value'>{invoice.phone || 'N/A'}</span>
                    </div>
                  </div>

                  <div className='invoice-card-footer'>
                    <div className='invoice-amount'>
                      <span className='amount-label'>Total:</span>
                      <span className='amount-value'>₹{invoice.total?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className='invoice-actions'>
                      <button 
                        onClick={() => navigate('/dashboard/invoice-detail', { state: invoice })} 
                        className='btn-icon btn-view'
                        title='View'
                      >
                        <i className="fa-solid fa-eye"></i>
                      </button>
                      <button 
                        onClick={() => navigate('/dashboard/edit-invoice', { state: invoice })} 
                        className='btn-icon btn-edit'
                        title='Edit'
                      >
                        <i className="fa-solid fa-edit"></i>
                      </button>
                      <button 
                        onClick={() => deleteInvoice(invoice.id)} 
                        className='btn-icon btn-delete'
                        title='Delete'
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default Invoices
