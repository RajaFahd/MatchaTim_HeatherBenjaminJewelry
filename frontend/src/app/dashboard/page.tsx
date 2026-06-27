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

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;
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
      alert('Order successfully deleted.');
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleArchive = async (id: string) => {
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
      alert('Order successfully archived.');
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
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
      alert('Order successfully restored.');
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const statusColor: Record<string, string> = {
    'Pending': 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400',
    'Uploaded': 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400',
    'Reviewed': 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400',
    'Production': 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
    'In Production': 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
    'QC': 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
    'Packing': 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400',
    'Shipping': 'bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400',
    'Completed': 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400',
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
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${statusColor[o.status] || 'bg-bg-main text-txt-muted'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {viewMode === 'active' && (
                          <>
                            <a href={`/review/${o.id}`} className="text-primary-gold hover:underline text-xs font-semibold uppercase tracking-wider transition">
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
                            <a href={`/review/${o.id}`} className="text-primary-gold hover:underline text-xs font-semibold uppercase tracking-wider transition font-semibold">
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
    </main>
  );
}
