import Chart from 'chart.js/auto';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState, useRef } from 'react';
import { db } from '../../firebase';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [total, setTotal] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [totalMonthCollection, setTotalMonthCollection] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    getData();
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  const getData = async () => {
    try {
      const q = query(collection(db, "invoices"), where('uid', "==", localStorage.getItem('uid')));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setInvoices(data);
      calculateStats(data);
      monthWiseCollection(data);
    } catch (error) {
      console.error(error);
    }
  };

  const calculateStats = (invoiceList) => {
    let totalRevenue = 0;
    let monthRevenue = 0;
    let pending = 0;
    let overdue = 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    invoiceList.forEach(invoice => {
      const invTotal = invoice.total || 0;
      totalRevenue += invTotal;

      // Calculate month revenue
      try {
        const invDate = invoice.createdAt?.toDate ? invoice.createdAt.toDate() : 
                       (invoice.date?.toDate ? invoice.date.toDate() : 
                       new Date(invoice.createdAt || invoice.date));
        if (invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear) {
          monthRevenue += invTotal;
        }
      } catch (e) {
        console.error('Date parsing error', e);
      }

      // Calculate pending and overdue
      if (invoice.status !== 'paid' && invoice.status !== 'cancelled') {
        pending += invTotal;
        if (invoice.dueDate) {
          try {
            const dueDate = invoice.dueDate.toDate ? invoice.dueDate.toDate() : 
                           new Date(invoice.dueDate.seconds * 1000);
            if (dueDate < new Date()) {
              overdue++;
            }
          } catch (e) {
            console.error('Due date parsing error', e);
          }
        }
      }
    });

    setTotal(totalRevenue);
    setTotalInvoices(invoiceList.length);
    setTotalMonthCollection(monthRevenue);
    setPendingAmount(pending);
    setOverdueCount(overdue);
  };

  const monthWiseCollection = (data) => {
    const chartData = {
      January: 0,
      February: 0,
      March: 0,
      April: 0,
      May: 0,
      June: 0,
      July: 0,
      August: 0,
      September: 0,
      October: 0,
      November: 0,
      December: 0
    };

    data.forEach(d => {
      try {
        const invDate = d.createdAt?.toDate ? d.createdAt.toDate() : 
                       (d.date?.toDate ? d.date.toDate() : 
                       new Date(d.createdAt || d.date));
        if (invDate.getFullYear() === new Date().getFullYear()) {
          const monthName = format(invDate, 'MMMM');
          if (chartData.hasOwnProperty(monthName)) {
            chartData[monthName] += (d.total || 0);
          }
        }
      } catch (e) {
        console.error('Date parsing error', e);
      }
    });
    
    createChart(chartData);
  };

  const createChart = (chartData) => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current?.getContext('2d');
    if (!ctx) return;

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(chartData),
        datasets: [{
          label: 'Monthly Revenue (₹)',
          data: Object.values(chartData),
          backgroundColor: 'rgba(102, 126, 234, 0.8)',
          borderColor: 'rgba(102, 126, 234, 1)',
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '₹' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  };

  const formatDate = (dateField) => {
    if (!dateField) return 'N/A';
    try {
      const date = dateField.toDate ? dateField.toDate() : new Date(dateField.seconds * 1000);
      return format(date, 'MMM dd, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const recentInvoices = invoices
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : (a.date?.toDate ? a.date.toDate() : new Date(a.createdAt || a.date));
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : (b.date?.toDate ? b.date.toDate() : new Date(b.createdAt || b.date));
      return dateB - dateA;
    })
    .slice(0, 6);

  return (
    <div className='home-page'>
      <h1 className='page-title'>Dashboard</h1>
      
      <div className='stats-grid'>
        <div className='stat-card stat-card-primary'>
          <div className='stat-icon'>
            <i className="fa-solid fa-rupee-sign"></i>
          </div>
          <div className='stat-content'>
            <h3 className='stat-value'>₹{total.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
            <p className='stat-label'>Total Revenue</p>
          </div>
        </div>

        <div className='stat-card stat-card-success'>
          <div className='stat-icon'>
            <i className="fa-solid fa-file-invoice"></i>
          </div>
          <div className='stat-content'>
            <h3 className='stat-value'>{totalInvoices}</h3>
            <p className='stat-label'>Total Invoices</p>
          </div>
        </div>

        <div className='stat-card stat-card-info'>
          <div className='stat-icon'>
            <i className="fa-solid fa-calendar-check"></i>
          </div>
          <div className='stat-content'>
            <h3 className='stat-value'>₹{totalMonthCollection.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h3>
            <p className='stat-label'>This Month</p>
          </div>
        </div>

        <div className='stat-card stat-card-warning'>
          <div className='stat-icon'>
            <i className="fa-solid fa-exclamation-triangle"></i>
          </div>
          <div className='stat-content'>
            <h3 className='stat-value'>{overdueCount}</h3>
            <p className='stat-label'>Overdue Invoices</p>
          </div>
        </div>
      </div>

      <div className='dashboard-grid'>
        <div className='chart-container'>
          <div className='chart-header'>
            <h2>Monthly Revenue</h2>
          </div>
          <div className='chart-wrapper'>
            <canvas ref={chartRef} id="revenueChart"></canvas>
          </div>
        </div>

        <div className='recent-invoices-container'>
          <div className='recent-invoices-header'>
            <h2>Recent Invoices</h2>
            <button 
              onClick={() => navigate('/dashboard/invoices')}
              className='btn-link'
            >
              View All
            </button>
          </div>
          <div className='recent-invoices-list'>
            {recentInvoices.length === 0 ? (
              <div className='empty-state'>
                <i className="fa-solid fa-file-invoice"></i>
                <p>No invoices yet</p>
                <button 
                  onClick={() => navigate('/dashboard/new-invoice')}
                  className='btn btn-primary btn-sm'
                >
                  Create Invoice
                </button>
              </div>
            ) : (
              recentInvoices.map(invoice => (
                <div 
                  key={invoice.id} 
                  className='recent-invoice-item'
                  onClick={() => navigate('/dashboard/invoice-detail', { state: invoice })}
                >
                  <div className='invoice-item-info'>
                    <h4>{invoice.invoiceNumber || `INV-${invoice.id.slice(0, 8)}`}</h4>
                    <p>{invoice.customerName || invoice.to || 'N/A'}</p>
                  </div>
                  <div className='invoice-item-meta'>
                    <span className='invoice-date'>{formatDate(invoice.invoiceDate || invoice.date)}</span>
                    <span className='invoice-amount'>₹{(Number(invoice.total) || 0).toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
