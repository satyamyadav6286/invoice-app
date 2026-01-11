import React, { useState, useEffect } from 'react'
import {db} from '../../firebase'
import { Timestamp, doc, updateDoc } from 'firebase/firestore'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import './NewInvoice.css'

const EditInvoice = () => {
    const location = useLocation()
    const invoiceData = location.state
    const navigation = useNavigate()
    
    const [customerName, setCustomerName] = useState(invoiceData?.customerName || invoiceData?.to || '')
    const [phone, setPhone] = useState(invoiceData?.phone || '')
    const [address, setAddress] = useState(invoiceData?.address || '')
    const [email, setEmail] = useState(invoiceData?.email || '')
    const [invoiceNumber, setInvoiceNumber] = useState(invoiceData?.invoiceNumber || '')
    
    const formatDateForInput = (dateField) => {
        if (!dateField) return format(new Date(), 'yyyy-MM-dd')
        try {
            const date = dateField.toDate ? dateField.toDate() : new Date(dateField.seconds * 1000)
            return format(date, 'yyyy-MM-dd')
        } catch {
            return format(new Date(), 'yyyy-MM-dd')
        }
    }
    
    const [invoiceDate, setInvoiceDate] = useState(formatDateForInput(invoiceData?.invoiceDate || invoiceData?.date))
    const [dueDate, setDueDate] = useState(formatDateForInput(invoiceData?.dueDate))
    const [status, setStatus] = useState(invoiceData?.status || 'draft')
    const [notes, setNotes] = useState(invoiceData?.notes || '')
    
    const [productName, setProductName] = useState('')
    const [productPrice, setProductPrice] = useState('')
    const [productQty, setProductQty] = useState(1)
    
    const [products, setProducts] = useState(invoiceData?.products || invoiceData?.product || [])
    const [subtotal, setSubtotal] = useState(0)
    const [taxRate, setTaxRate] = useState(invoiceData?.taxRate || 0)
    const [discountType, setDiscountType] = useState(invoiceData?.discountType || 'percentage')
    const [discount, setDiscount] = useState(invoiceData?.discount || 0)
    const [taxAmount, setTaxAmount] = useState(0)
    const [discountAmount, setDiscountAmount] = useState(0)
    const [total, setTotal] = useState(0)
    
    const [isLoading, setLoading] = useState(false)

    useEffect(() => {
        calculateTotals()
    }, [products, taxRate, discount, discountType])

    useEffect(() => {
        // Recalculate totals when component mounts with existing data
        if (invoiceData) {
            calculateTotals()
        }
    }, [])

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

    const updateData = async () => {
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
            await updateDoc(doc(db, 'invoices', invoiceData.id), {
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
                updatedAt: Timestamp.fromDate(new Date())
            })
            
            toast.success('Invoice updated successfully!')
            navigation('/dashboard/invoices')
        } catch (error) {
            console.error(error)
            toast.error('Error updating invoice. Please try again.')
            setLoading(false)
        }
    }

    if (!invoiceData) {
        return (
            <div className='new-invoice-page'>
                <div className='invoice-page-header'>
                    <h1 className='page-title'>Edit Invoice</h1>
                    <button 
                        onClick={() => navigation('/dashboard/invoices')} 
                        className='btn btn-secondary'
                    >
                        <i className="fa-solid fa-arrow-left"></i> Back to Invoices
                    </button>
                </div>
                <div style={{textAlign: 'center', padding: '2rem'}}>
                    <p>No invoice data found. Please select an invoice to edit.</p>
                </div>
            </div>
        )
    }

    return (
        <div className='new-invoice-page'>
            <div className='invoice-page-header'>
                <h1 className='page-title'>Edit Invoice</h1>
                <div className='header-actions'>
                    <button 
                        onClick={() => navigation('/dashboard/invoices')} 
                        className='btn btn-secondary'
                        disabled={isLoading}
                    >
                        <i className="fa-solid fa-times"></i> Cancel
                    </button>
                    <button 
                        onClick={updateData} 
                        className='btn btn-primary'
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin"></i> Updating...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-save"></i> Update Invoice
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
                                    {products.map((product, index) => (
                                        <tr key={product.id || index}>
                                            <td>{index + 1}</td>
                                            <td>{product.name}</td>
                                            <td>₹{product.price.toFixed(2)}</td>
                                            <td>{product.qty}</td>
                                            <td>₹{(product.price * product.qty).toFixed(2)}</td>
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
                                    ))}
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
                            <span>₹{subtotal.toFixed(2)}</span>
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
                            <span>- ₹{discountAmount.toFixed(2)}</span>
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
                            <span>+ ₹{taxAmount.toFixed(2)}</span>
                        </div>

                        <div className='summary-row summary-total'>
                            <span>Total Amount:</span>
                            <span>₹{total.toFixed(2)}</span>
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

export default EditInvoice
