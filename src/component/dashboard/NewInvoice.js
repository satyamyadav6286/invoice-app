import React, { useState, useEffect } from 'react'
import {db} from '../../firebase'
import { Timestamp, addDoc, collection, query, where, getDocs, orderBy, limit} from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import './NewInvoice.css'

const NewInvoice = () => {
    const [customerName, setCustomerName] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [email, setEmail] = useState('')
    const [invoiceNumber, setInvoiceNumber] = useState('')
    const [invoiceDate, setInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'))
    const [dueDate, setDueDate] = useState('')
    const [status, setStatus] = useState('draft')
    const [notes, setNotes] = useState('')
    
    const [productName, setProductName] = useState('')
    const [productPrice, setProductPrice] = useState('')
    const [productQty, setProductQty] = useState(1)
    
    const [products, setProducts] = useState([])
    const [subtotal, setSubtotal] = useState(0)
    const [taxRate, setTaxRate] = useState(0)
    const [discountType, setDiscountType] = useState('percentage')
    const [discount, setDiscount] = useState(0)
    const [taxAmount, setTaxAmount] = useState(0)
    const [discountAmount, setDiscountAmount] = useState(0)
    const [total, setTotal] = useState(0)
    
    const [isLoading, setLoading] = useState(false)
    const navigation = useNavigate()

    useEffect(() => {
        generateInvoiceNumber()
        const defaultDueDate = new Date()
        defaultDueDate.setDate(defaultDueDate.getDate() + 30)
        setDueDate(format(defaultDueDate, 'yyyy-MM-dd'))
    }, [])

    useEffect(() => {
        calculateTotals()
    }, [products, taxRate, discount, discountType])

    const generateInvoiceNumber = async () => {
        try {
            const q = query(
                collection(db, 'invoices'),
                where('uid', '==', localStorage.getItem('uid')),
                orderBy('invoiceNumber', 'desc'),
                limit(1)
            )
            const snapshot = await getDocs(q)
            
            if (snapshot.empty) {
                setInvoiceNumber('INV-0001')
            } else {
                const lastInvoice = snapshot.docs[0].data()
                const lastNumber = lastInvoice.invoiceNumber || 'INV-0000'
                const numPart = parseInt(lastNumber.split('-')[1]) + 1
                setInvoiceNumber(`INV-${String(numPart).padStart(4, '0')}`)
            }
        } catch (error) {
            console.log(error)
            setInvoiceNumber(`INV-${String(Date.now()).slice(-4)}`)
        }
    }

    const calculateTotals = () => {
        let sub = 0
        products.forEach(p => {
            sub += parseFloat(p.price || 0) * parseFloat(p.qty || 0)
        })
        setSubtotal(sub)

        let disc = 0
        if (discountType === 'percentage') {
            disc = (sub * parseFloat(discount || 0)) / 100
        } else {
            disc = parseFloat(discount || 0)
        }
        setDiscountAmount(disc)

        const afterDiscount = sub - disc
        const tax = (afterDiscount * parseFloat(taxRate || 0)) / 100
        setTaxAmount(tax)

        const finalTotal = afterDiscount + tax
        setTotal(finalTotal)
    }

    const addProduct = () => {
        if (!productName || !productPrice || !productQty) {
            toast.error('Please fill all product fields')
            return
        }

        const newProduct = {
            id: products.length > 0 ? Math.max(...products.map(p => p.id || 0)) + 1 : 0,
            name: productName,
            price: parseFloat(productPrice),
            qty: parseFloat(productQty)
        }
        
        setProducts([...products, newProduct])
        setProductName('')
        setProductPrice('')
        setProductQty(1)
        toast.success('Product added')
    }

    const removeProduct = (id) => {
        setProducts(products.filter(p => p.id !== id))
        toast.success('Product removed')
    }

    const saveData = async () => {
        if (!customerName || !phone || !address) {
            toast.error('Please fill in customer details')
            return
        }

        if (products.length === 0) {
            toast.error('Please add at least one product')
            return
        }

        if (!dueDate) {
            toast.error('Please select a due date')
            return
        }

        setLoading(true)

        try {
            await addDoc(collection(db, 'invoices'), {
                customerName: customerName,
                phone: phone,
                address: address,
                email: email,
                invoiceNumber: invoiceNumber,
                invoiceDate: Timestamp.fromDate(new Date(invoiceDate)),
                dueDate: Timestamp.fromDate(new Date(dueDate)),
                status: status,
                products: products,
                subtotal: subtotal,
                taxRate: taxRate,
                taxAmount: taxAmount,
                discountType: discountType,
                discount: discount,
                discountAmount: discountAmount,
                total: total,
                notes: notes,
                uid: localStorage.getItem('uid'),
                createdAt: Timestamp.fromDate(new Date())
            })
            
            toast.success('Invoice created successfully!')
            navigation('/dashboard/invoices')
        } catch (error) {
            console.error(error)
            toast.error('Error creating invoice. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className='new-invoice-page'>
            <div className='invoice-page-header'>
                <h1 className='page-title'>Create New Invoice</h1>
                <div className='header-actions'>
                    <button 
                        onClick={() => navigation('/dashboard/invoices')} 
                        className='btn btn-secondary'
                        disabled={isLoading}
                    >
                        <i className="fa-solid fa-times"></i> Cancel
                    </button>
                    <button 
                        onClick={saveData} 
                        className='btn btn-primary'
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin"></i> Saving...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-save"></i> Save Invoice
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className='invoice-form-container'>
                <div className='form-section'>
                    <h2 className='section-title'>Invoice Information</h2>
                    <div className='form-grid'>
                        <div className='form-group'>
                            <label>Invoice Number</label>
                            <input 
                                type='text' 
                                value={invoiceNumber}
                                onChange={(e) => setInvoiceNumber(e.target.value)}
                                className='form-input'
                                required
                            />
                        </div>
                        <div className='form-group'>
                            <label>Invoice Date</label>
                            <input 
                                type='date' 
                                value={invoiceDate}
                                onChange={(e) => setInvoiceDate(e.target.value)}
                                className='form-input'
                                required
                            />
                        </div>
                        <div className='form-group'>
                            <label>Due Date</label>
                            <input 
                                type='date' 
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className='form-input'
                                required
                            />
                        </div>
                        <div className='form-group'>
                            <label>Status</label>
                            <select 
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className='form-input'
                            >
                                <option value='draft'>Draft</option>
                                <option value='sent'>Sent</option>
                                <option value='paid'>Paid</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className='form-section'>
                    <h2 className='section-title'>Customer Information</h2>
                    <div className='form-grid'>
                        <div className='form-group'>
                            <label>Customer Name *</label>
                            <input 
                                type='text' 
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder='Enter customer name'
                                className='form-input'
                                required
                            />
                        </div>
                        <div className='form-group'>
                            <label>Email</label>
                            <input 
                                type='email' 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder='customer@email.com'
                                className='form-input'
                            />
                        </div>
                        <div className='form-group'>
                            <label>Phone *</label>
                            <input 
                                type='tel' 
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder='+1234567890'
                                className='form-input'
                                required
                            />
                        </div>
                        <div className='form-group form-group-full'>
                            <label>Address *</label>
                            <textarea 
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder='Enter full address'
                                className='form-input'
                                rows={3}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className='form-section'>
                    <h2 className='section-title'>Products / Services</h2>
                    <div className='add-product-form'>
                        <div className='form-grid'>
                            <div className='form-group'>
                                <label>Product Name</label>
                                <input 
                                    type='text' 
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    placeholder='Product or service name'
                                    className='form-input'
                                />
                            </div>
                            <div className='form-group'>
                                <label>Price</label>
                                <input 
                                    type='number' 
                                    value={productPrice}
                                    onChange={(e) => setProductPrice(e.target.value)}
                                    placeholder='0.00'
                                    className='form-input'
                                    step='0.01'
                                    min='0'
                                />
                            </div>
                            <div className='form-group'>
                                <label>Quantity</label>
                                <input 
                                    type='number' 
                                    value={productQty}
                                    onChange={(e) => setProductQty(e.target.value)}
                                    className='form-input'
                                    min='1'
                                    step='1'
                                />
                            </div>
                            <div className='form-group'>
                                <label>&nbsp;</label>
                                <button 
                                    type='button'
                                    onClick={addProduct}
                                    className='btn btn-secondary btn-block'
                                >
                                    <i className="fa-solid fa-plus"></i> Add Product
                                </button>
                            </div>
                        </div>
                    </div>

                    {products.length > 0 && (
                        <div className='products-table-wrapper'>
                            <table className='products-table'>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Product/Service</th>
                                        <th>Price</th>
                                        <th>Quantity</th>
                                        <th>Total</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product, index) => {
                                        const price = Number(product.price) || 0
                                        const qty = Number(product.qty) || 0
                                        return (
                                            <tr key={product.id}>
                                                <td>{index + 1}</td>
                                                <td>{product.name}</td>
                                                <td>₹{price.toFixed(2)}</td>
                                                <td>{qty}</td>
                                                <td>₹{(price * qty).toFixed(2)}</td>
                                                <td>
                                                    <button 
                                                        onClick={() => removeProduct(product.id)}
                                                        className='btn-icon btn-danger'
                                                        title='Remove'
                                                    >
                                                        <i className="fa-solid fa-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className='form-section'>
                    <h2 className='section-title'>Pricing Summary</h2>
                    <div className='pricing-summary'>
                        <div className='summary-row'>
                            <span>Subtotal:</span>
                            <span>₹{(Number(subtotal) || 0).toFixed(2)}</span>
                        </div>
                        
                        <div className='summary-row'>
                            <div className='summary-input-group'>
                                <label>Discount:</label>
                                <div className='discount-inputs'>
                                    <input 
                                        type='number'
                                        value={discount}
                                        onChange={(e) => setDiscount(e.target.value)}
                                        className='form-input-small'
                                        min='0'
                                        step='0.01'
                                    />
                                    <select 
                                        value={discountType}
                                        onChange={(e) => setDiscountType(e.target.value)}
                                        className='form-input-small'
                                    >
                                        <option value='percentage'>%</option>
                                        <option value='fixed'>₹</option>
                                    </select>
                                </div>
                            </div>
                            <span>- ₹{(Number(discountAmount) || 0).toFixed(2)}</span>
                        </div>

                        <div className='summary-row'>
                            <div className='summary-input-group'>
                                <label>Tax Rate:</label>
                                <input 
                                    type='number'
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(e.target.value)}
                                    className='form-input-small'
                                    min='0'
                                    step='0.01'
                                    placeholder='0'
                                />
                                <span>%</span>
                            </div>
                            <span>+ ₹{(Number(taxAmount) || 0).toFixed(2)}</span>
                        </div>

                        <div className='summary-row summary-total'>
                            <span>Total Amount:</span>
                            <span>₹{(Number(total) || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className='form-section'>
                    <h2 className='section-title'>Additional Notes</h2>
                    <div className='form-group'>
                        <textarea 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder='Add any additional notes or terms and conditions...'
                            className='form-input'
                            rows={4}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NewInvoice
