'use client'
import { useEffect, useState } from 'react'

interface OrderItem {
  id: string
}

interface Order {
  id: string
  poNumber: string
  customerName: string
  createdAt: string
  status: string
  items?: OrderItem[]
}

const getOrderViewRoute = (status: string, orderId: string) => {
  switch (status) {
    case 'Uploaded':
    case 'Reviewed':
      return `/review/${orderId}`
    case 'Production':
      return `/production/${orderId}`
    case 'QC':
    case 'Packing':
      return `/packing/${orderId}`
    case 'Shipping':
    case 'Completed':
      return `/tracking/${orderId}`
    default:
      return `/review/${orderId}`
  }
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [date, setDate] = useState('')
  const [customer, setCustomer] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [uniqueCustomers, setUniqueCustomers] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'active' | 'archived'>('active')
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    type: 'confirm-delete' | 'confirm-archive' | 'success' | 'error';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })

  // Fetch unique customers list on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/orders', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const customers = Array.from(new Set(data.map((o: any) => o.customerName))).filter(Boolean) as string[];
          setUniqueCustomers(customers);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Fetch filtered orders on filter changes (with debounce for search input)
  useEffect(() => {
    const fetchFilteredOrders = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        if (date) params.append('date', date);
        if (customer) params.append('customer', customer);
        if (sortBy) params.append('sortBy', sortBy);

        if (viewMode === 'archived') {
          params.append('isArchived', 'true');
        } else if (false) {
          params.append('isDeleted', 'true');
        } else {
          params.append('isArchived', 'false');
          params.append('isDeleted', 'false');
        }

        const res = await fetch(`/api/orders?${params.toString()}`, {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchFilteredOrders();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, status, date, customer, sortBy, viewMode]);

  const handleDelete = (id: string) => {
    setModalConfig({
      isOpen: true,
      type: 'confirm-delete',
      title: 'Delete Purchase Order',
      message: 'Are you sure you want to delete this order? This action cannot be undone and duplicate orders cannot be deleted.',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/orders/${id}`, {
            method: 'DELETE',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Failed to delete order');
          }
          setOrders(prev => prev.filter(o => o.id !== id));
          setModalConfig({
            isOpen: true,
            type: 'success',
            title: 'Deleted Successfully',
            message: 'The purchase order has been deleted.',
          });
        } catch (err: any) {
          setModalConfig({
            isOpen: true,
            type: 'error',
            title: 'Delete Failed',
            message: err.message || 'An unexpected error occurred.',
          });
        }
      }
    });
  };

  const handleArchive = (id: string) => {
    setModalConfig({
      isOpen: true,
      type: 'confirm-archive',
      title: 'Archive Purchase Order',
      message: 'Are you sure you want to archive this order? It will be moved to the archived section.',
      onConfirm: async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`/api/orders/${id}/archive`, {
            method: 'PUT',
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          });
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Failed to archive order');
          }
          setOrders(prev => prev.filter(o => o.id !== id));
          setModalConfig({
            isOpen: true,
            type: 'success',
            title: 'Archived Successfully',
            message: 'The purchase order has been archived.',
          });
        } catch (err: any) {
          setModalConfig({
            isOpen: true,
            type: 'error',
            title: 'Archive Failed',
            message: err.message || 'An unexpected error occurred.',
          });
        }
      }
    });
  };

  const handleRestore = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/orders/${id}/restore`, {
        method: 'PUT',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to restore order');
      }
      setOrders(prev => prev.filter(o => o.id !== id));
      setModalConfig({
        isOpen: true,
        type: 'success',
        title: 'Restored Successfully',
        message: 'The purchase order has been restored to active orders.',
      });
    } catch (err: any) {
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'Restore Failed',
        message: err.message || 'An unexpected error occurred.',
      });
    }
  };

  const getStatusColorClass = (status: string) => {
    const key = (status || '').trim().toLowerCase();
    switch (key) {
      case 'pending':
        return 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/40';
      case 'uploaded':
        return 'bg-purple-100 text-purple-900 border border-purple-300 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/40';
      case 'reviewed':
        return 'bg-indigo-100 text-indigo-900 border border-indigo-300 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/40';
      case 'production':
      case 'in production':
        return 'bg-blue-100 text-blue-900 border border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/40';
      case 'qc':
        return 'bg-orange-100 text-orange-900 border border-orange-300 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-900/40';
      case 'packing':
        return 'bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/40';
      case 'shipping':
        return 'bg-teal-100 text-teal-900 border border-teal-300 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-900/40';
      case 'completed':
        return 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40';
      default:
        return 'bg-bg-main text-txt-muted border border-border-main';
    }
  }

  const formatItemsCount = (items: OrderItem[] | undefined) => {
    if (!items) return '0 items'
    const count = items.length
    return `${count} item${count !== 1 ? 's' : ''}`
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  const isFiltered = !!(search || status || date || customer || sortBy !== 'newest');
  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setDate('');
    setCustomer('');
    setSortBy('newest');
  };

  return (
    <main className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-txt-main font-display">📋 Order Dashboard</h1>
          <p className="text-txt-muted text-sm mt-1">All incoming purchase orders and status tracking</p>
        </div>
        <a 
          href="/" 
          className="px-5 py-2.5 bg-primary-gold hover:bg-opacity-95 text-white rounded-btn text-xs font-semibold tracking-wide uppercase transition duration-300"
        >
          + Upload New PO
        </a>
      </div>

      {/* Tabs for Active/Archived/Deleted */}
      <div className="flex gap-6 border-b border-border-main mb-6">
        <button
          onClick={() => { setViewMode('active'); handleClearFilters(); }}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition duration-200 ${
            viewMode === 'active'
              ? 'border-primary-gold text-primary-gold'
              : 'border-transparent text-txt-muted hover:text-txt-main'
          }`}
        >
          📁 Active Orders
        </button>
        <button
          onClick={() => { setViewMode('archived'); handleClearFilters(); }}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition duration-200 ${
            viewMode === 'archived'
              ? 'border-primary-gold text-primary-gold'
              : 'border-transparent text-txt-muted hover:text-txt-main'
          }`}
        >
          🗄️ Archived
        </button>
        {/* <button
          onClick={() => { setViewMode('deleted'); handleClearFilters(); }}
          className={`pb-3 text-xs font-semibold uppercase tracking-wider border-b-2 transition duration-200 ${
            viewMode === 'deleted'
              ? 'border-primary-gold text-primary-gold'
              : 'border-transparent text-txt-muted hover:text-txt-main'
          }`}
        >
          🗑️ Trash
        </button> */}
      </div>

      {/* Search and Filters Panel */}
      <div className="bg-bg-card rounded-card border border-border-main p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {/* Search */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-txt-muted">Search</label>
          <input
            type="text"
            placeholder="PO#, customer, product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 px-3 bg-bg-main border border-border-main rounded-btn text-xs text-txt-main placeholder-txt-muted focus:outline-none focus:border-primary-gold transition"
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-txt-muted">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 px-3 bg-bg-main border border-border-main rounded-btn text-xs text-txt-main focus:outline-none focus:border-primary-gold transition cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="Uploaded">Uploaded</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Production">Production</option>
            <option value="QC">QC</option>
            <option value="Packing">Packing</option>
            <option value="Shipping">Shipping</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Customer Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-txt-muted">Customer</label>
          <select
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            className="h-10 px-3 bg-bg-main border border-border-main rounded-btn text-xs text-txt-main focus:outline-none focus:border-primary-gold transition cursor-pointer"
          >
            <option value="">All Customers</option>
            {uniqueCustomers.map((cust) => (
              <option key={cust} value={cust}>{cust}</option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-txt-muted">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-10 px-3 bg-bg-main border border-border-main rounded-btn text-xs text-txt-main focus:outline-none focus:border-primary-gold transition cursor-pointer"
          />
        </div>

        {/* Sorting */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-txt-muted">Sort By</label>
            {isFiltered && (
              <button 
                onClick={handleClearFilters}
                className="text-[10px] text-primary-gold hover:underline font-semibold bg-transparent border-none p-0 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-3 bg-bg-main border border-border-main rounded-btn text-xs text-txt-main focus:outline-none focus:border-primary-gold transition cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-8 h-8 border-2 border-primary-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-bg-card rounded-card border border-border-main p-16 text-center">
          <p className="text-5xl mb-4">{isFiltered ? '🔍' : '📭'}</p>
          <p className="text-lg font-medium text-txt-main font-display">
            {isFiltered ? 'No matching orders found' : 'No purchase orders found'}
          </p>
          <p className="text-sm text-txt-muted mt-2">
            {isFiltered 
              ? 'Try adjusting your search query or reset the filters.' 
              : 'Upload a PO file on the homepage to start processing.'}
          </p>
          {isFiltered && (
            <button
              onClick={handleClearFilters}
              className="mt-6 px-5 py-2.5 bg-primary-gold hover:bg-opacity-95 text-white text-xs font-semibold uppercase tracking-wider rounded-btn transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-bg-card rounded-card border border-border-main overflow-hidden transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-main border-b border-border-main text-txt-muted text-xs uppercase tracking-wider">
                <tr className="text-left">
                  <th className="px-6 py-4 font-semibold">PO Number</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Items</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-bg-main/40 transition-colors duration-200">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-primary-gold">{o.poNumber}</td>
                    <td className="px-6 py-4 text-txt-main font-medium">{o.customerName}</td>
                    <td className="px-6 py-4 text-txt-muted">{formatItemsCount(o.items)}</td>
                    <td className="px-6 py-4 text-txt-muted text-xs">{formatDate(o.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${getStatusColorClass(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {viewMode === 'active' && (
                          <>
                            <a href={getOrderViewRoute(o.status, o.id)} className="text-primary-gold hover:underline text-xs font-semibold uppercase tracking-wider transition">
                              View
                            </a>
                            <button
                              onClick={() => handleArchive(o.id)}
                              className="text-txt-muted hover:text-txt-main text-xs font-semibold uppercase tracking-wider transition bg-transparent border-none p-0 cursor-pointer"
                              title="Archive Order"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4.5 h-4.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg>
                            </button>
                            <button
                              onClick={() => handleDelete(o.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-semibold uppercase tracking-wider transition bg-transparent border-none p-0 cursor-pointer"
                              title="Delete Order"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4.5 h-4.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                            </button>
                          </>
                        )}
                        {viewMode === 'archived' && (
                          <>
                            <a href={getOrderViewRoute(o.status, o.id)} className="text-primary-gold hover:underline text-xs font-semibold uppercase tracking-wider transition font-semibold">
                              View
                            </a>
                            <button
                              onClick={() => handleRestore(o.id)}
                              className="text-txt-muted hover:text-txt-main text-xs font-semibold uppercase tracking-wider transition bg-transparent border-none p-0 cursor-pointer"
                              title="Restore Order"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4.5 h-4.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
                            </button>
                            <button
                              onClick={() => handleDelete(o.id)}
                              className="text-red-500 hover:text-red-700 text-xs font-semibold uppercase tracking-wider transition bg-transparent border-none p-0 cursor-pointer"
                              title="Delete Order"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4.5 h-4.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                            </button>
                          </>
                        )}
                        {false && (
                          <button
                            onClick={() => handleRestore(o.id)}
                            className="text-primary-gold hover:text-opacity-80 text-xs font-semibold uppercase tracking-wider transition bg-transparent border-none p-0 cursor-pointer"
                            title="Restore Order"
                          >
                            Restore Order
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {modalConfig.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-card border border-border-main rounded-card max-w-md w-full overflow-hidden shadow-2xl transition-all duration-300">
            {/* Header / Accent Bar */}
            <div className={`h-1.5 w-full ${
              modalConfig.type === 'confirm-delete' || modalConfig.type === 'error'
                ? 'bg-gradient-to-r from-red-500 to-rose-600'
                : modalConfig.type === 'confirm-archive'
                ? 'bg-gradient-to-r from-primary-gold to-amber-500'
                : 'bg-gradient-to-r from-green-500 to-emerald-600'
            }`} />
            
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Icon wrapper */}
                <div className={`p-2.5 rounded-full flex-shrink-0 ${
                  modalConfig.type === 'confirm-delete' || modalConfig.type === 'error'
                    ? 'bg-red-500/10 text-red-500'
                    : modalConfig.type === 'confirm-archive'
                    ? 'bg-primary-gold/10 text-primary-gold'
                    : 'bg-green-500/10 text-green-500'
                }`}>
                  {modalConfig.type === 'confirm-delete' && (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  {modalConfig.type === 'confirm-archive' && (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  )}
                  {modalConfig.type === 'success' && (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {modalConfig.type === 'error' && (
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-semibold text-txt-main font-display mb-1">{modalConfig.title}</h3>
                  <p className="text-sm text-txt-muted leading-relaxed">{modalConfig.message}</p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border-main">
                {modalConfig.type.startsWith('confirm-') ? (
                  <>
                    <button
                      onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                      className="px-4 py-2 text-xs font-semibold text-txt-muted hover:text-txt-main bg-transparent hover:bg-bg-main border border-border-main hover:border-txt-muted rounded-btn transition duration-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setModalConfig(prev => ({ ...prev, isOpen: false }));
                        if (modalConfig.onConfirm) modalConfig.onConfirm();
                      }}
                      className={`px-4 py-2 text-xs font-semibold text-white rounded-btn transition duration-200 cursor-pointer ${
                        modalConfig.type === 'confirm-delete'
                          ? 'bg-red-500 hover:bg-red-600'
                          : 'bg-primary-gold hover:bg-opacity-95'
                      }`}
                    >
                      {modalConfig.type === 'confirm-delete' ? 'Delete' : 'Archive'}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                    className="px-4 py-2 text-xs font-semibold text-white bg-primary-gold hover:bg-opacity-95 rounded-btn transition duration-200 cursor-pointer"
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
