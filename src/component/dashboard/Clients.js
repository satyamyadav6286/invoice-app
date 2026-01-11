import React, { useEffect, useState } from 'react'
import { db } from '../../firebase'
import { collection, deleteDoc, doc, getDocs, query, where, addDoc, updateDoc } from 'firebase/firestore'
import { toast } from 'react-toastify'
import './Clients.css'

const Clients = () => {
  const [clients, setClients] = useState([])
  const [filteredClients, setFilteredClients] = useState([])
  const [isLoading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingClient, setEditingClient] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
    notes: ''
  })

  useEffect(() => {
    getClients()
  }, [])

  useEffect(() => {
    filterClients()
  }, [clients, searchTerm])

  const getClients = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, "clients"), where('uid', "==", localStorage.getItem('uid')))
      const querySnapshot = await getDocs(q)
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      setClients(data)
      setLoading(false)
    } catch (error) {
      console.error(error)
      toast.error('Error loading clients')
      setLoading(false)
    }
  }

  const filterClients = () => {
    if (!searchTerm) {
      setFilteredClients(clients)
      return
    }
    const term = searchTerm.toLowerCase()
    const filtered = clients.filter(client =>
      client.name?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.phone?.includes(term)
    )
    setFilteredClients(filtered)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const openModal = (client = null) => {
    if (client) {
      setEditingClient(client)
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        taxId: client.taxId || '',
        notes: client.notes || ''
      })
    } else {
      setEditingClient(null)
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        notes: ''
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingClient(null)
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      taxId: '',
      notes: ''
    })
  }

  const saveClient = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.phone) {
      toast.error('Name and phone are required')
      return
    }

    try {
      if (editingClient) {
        await updateDoc(doc(db, 'clients', editingClient.id), {
          ...formData,
          updatedAt: new Date().toISOString()
        })
        toast.success('Client updated successfully!')
      } else {
        await addDoc(collection(db, 'clients'), {
          ...formData,
          uid: localStorage.getItem('uid'),
          createdAt: new Date().toISOString()
        })
        toast.success('Client added successfully!')
      }
      closeModal()
      getClients()
    } catch (error) {
      console.error(error)
      toast.error('Error saving client')
    }
  }

  const deleteClient = async (id) => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'clients', id))
        toast.success('Client deleted successfully')
        getClients()
      } catch (error) {
        console.error(error)
        toast.error('Error deleting client')
      }
    }
  }

  return (
    <div className='clients-page'>
      <div className='page-header'>
        <h1 className='page-title'>Clients</h1>
        <button 
          onClick={() => openModal()} 
          className='btn btn-primary'
        >
          <i className="fa-solid fa-plus"></i> Add Client
        </button>
      </div>

      <div className='search-section'>
        <div className='search-box'>
          <i className="fa-solid fa-search"></i>
          <input
            type='text'
            placeholder='Search clients by name, email, or phone...'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='search-input'
          />
        </div>
        <div className='clients-count'>
          {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'}
        </div>
      </div>

      {isLoading ? (
        <div className='loading-container'>
          <i className="fa-solid fa-spinner fa-spin"></i>
          <p>Loading clients...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className='no-clients-wrapper'>
          <i className="fa-solid fa-users"></i>
          <p>{clients.length === 0 ? 'You have no clients yet' : 'No clients match your search'}</p>
          {clients.length === 0 && (
            <button 
              onClick={() => openModal()} 
              className='btn btn-primary'
            >
              Add Your First Client
            </button>
          )}
        </div>
      ) : (
        <div className='clients-grid'>
          {filteredClients.map(client => (
            <div key={client.id} className='client-card'>
              <div className='client-card-header'>
                <div className='client-avatar'>
                  {client.name?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div className='client-actions'>
                  <button 
                    onClick={() => openModal(client)} 
                    className='btn-icon btn-edit'
                    title='Edit'
                  >
                    <i className="fa-solid fa-edit"></i>
                  </button>
                  <button 
                    onClick={() => deleteClient(client.id)} 
                    className='btn-icon btn-delete'
                    title='Delete'
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
              
              <div className='client-card-body'>
                <h3 className='client-name'>{client.name}</h3>
                {client.email && (
                  <div className='client-info'>
                    <i className="fa-solid fa-envelope"></i>
                    <span>{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div className='client-info'>
                    <i className="fa-solid fa-phone"></i>
                    <span>{client.phone}</span>
                  </div>
                )}
                {client.address && (
                  <div className='client-info'>
                    <i className="fa-solid fa-map-marker-alt"></i>
                    <span>{client.address}</span>
                  </div>
                )}
                {client.taxId && (
                  <div className='client-info'>
                    <i className="fa-solid fa-id-card"></i>
                    <span>Tax ID: {client.taxId}</span>
                  </div>
                )}
              </div>

              {client.notes && (
                <div className='client-card-footer'>
                  <p className='client-notes'>{client.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className='modal-overlay' onClick={closeModal}>
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>{editingClient ? 'Edit Client' : 'Add New Client'}</h2>
              <button onClick={closeModal} className='modal-close'>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            
            <form onSubmit={saveClient} className='modal-body'>
              <div className='form-group'>
                <label>Client Name *</label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder='Enter client name'
                  className='form-input'
                  required
                />
              </div>

              <div className='form-group'>
                <label>Email</label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder='client@email.com'
                  className='form-input'
                />
              </div>

              <div className='form-group'>
                <label>Phone *</label>
                <input
                  type='tel'
                  name='phone'
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder='+1234567890'
                  className='form-input'
                  required
                />
              </div>

              <div className='form-group'>
                <label>Address</label>
                <textarea
                  name='address'
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder='Enter client address'
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

              <div className='form-group'>
                <label>Notes</label>
                <textarea
                  name='notes'
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder='Additional notes about this client...'
                  className='form-input'
                  rows={3}
                />
              </div>

              <div className='modal-actions'>
                <button type='button' onClick={closeModal} className='btn btn-secondary'>
                  Cancel
                </button>
                <button type='submit' className='btn btn-primary'>
                  {editingClient ? 'Update Client' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Clients
