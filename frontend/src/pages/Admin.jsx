import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import api from '../utils/api'
import Skeleton from '../components/Skeleton'

const Admin = () => {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [orderSearch, setOrderSearch] = useState('')
    const [orderFilter, setOrderFilter] = useState('All')
    const [loading, setLoading] = useState(true)

    // Inventory CRUD States
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [currentProduct, setCurrentProduct] = useState({
        name: '',
        category: 'Necklaces',
        price: '',
        details: '',
        material: 'Stainless Steel',
        plating: 'Gold 18K PVD Plating',
        stone: 'Natural',
        length: '46 cm',
        weight: '6g',
        features: ['Sweatproof', 'Anti Tarnish', 'Water proof', 'Hypoallergenic'],
        stock: 0,
        img: '',
        images: ['', '', '', ''],
        hero: false
    })
    const [uploadingIdx, setUploadingIdx] = useState(null)

    // Real Data States
    const [stats, setStats] = useState({
        totalRevenue: '₹0',
        totalOrders: 0,
        totalUsers: 0
    })

    const [products, setProducts] = useState([])
    const [productPage, setProductPage] = useState(1)
    const [productPages, setProductPages] = useState(1)
    const [productTotal, setProductTotal] = useState(0)
    const [orders, setOrders] = useState([])
    const [customers, setCustomers] = useState([])
    const [promos, setPromos] = useState([])

    const [revenueData, setRevenueData] = useState([])

    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
    const [orderNotes, setOrderNotes] = useState('')
    const [savingNotes, setSavingNotes] = useState(false)
    const [statusReason, setStatusReason] = useState('')
    const [trackingNumber, setTrackingNumber] = useState('')
    const [carrier, setCarrier] = useState('')
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
    const [abandonedCarts, setAbandonedCarts] = useState([])

    // Return Management
    const [returnAdminNotes, setReturnAdminNotes] = useState('');

    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false)
    const [currentPromo, setCurrentPromo] = useState({
        code: '',
        discount: 10,
        expiryDate: '',
        limit: 100
    })
    const [isSavingPromo, setIsSavingPromo] = useState(false)


    // Data Fetching Central
    useEffect(() => {
        fetchAdminData()
    }, [activeTab, productPage])

    const fetchAdminData = async () => {
        try {
            setLoading(true)
            const [statsRes, productsRes, ordersRes, usersRes, revenueRes, promosRes, abandonedRes] = await Promise.all([
                api.get('/analytics/stats'),
                api.get(`/products?pageSize=10&pageNumber=${productPage}`),
                api.get('/orders'),
                api.get('/users'),
                api.get('/analytics/revenue'),
                api.get('/promos').catch(() => ({ data: [] })),
                api.get('/users/admin/abandoned-carts').catch(() => ({ data: [] }))
            ])



            setStats(statsRes.data)
            setProducts(productsRes.data.products || [])
            setProductPages(productsRes.data.pages || 1)
            setProductTotal(productsRes.data.total || 0)
            setOrders(ordersRes.data)
            setCustomers(usersRes.data)
            setPromos(promosRes.data || [])
            setAbandonedCarts(abandonedRes.data || [])



            // Map revenue data for the chart
            const fullYear = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, revenue: 0 }))
            revenueRes.data.forEach(item => {
                const index = fullYear.findIndex(f => f.month === item._id)
                if (index !== -1) fullYear[index].revenue = item.revenue
            })
            setRevenueData(fullYear)

        } catch (error) {
            console.error('Fetch admin data failed:', error)
            toast.error('SOVRA archives are temporarily unreachable.')
        } finally {
            setLoading(false)
        }
    }

    // Real-time polling for Abandoned Vaults when the tab is active
    useEffect(() => {
        let interval;
        if (activeTab === 'abandoned') {
            interval = setInterval(async () => {
                try {
                    const { data } = await api.get('/users/admin/abandoned-carts')
                    setAbandonedCarts(data)
                } catch (error) {
                    console.error('Vault polling failed')
                }
            }, 30000) // Poll every 30 seconds
        }
        return () => clearInterval(interval)
    }, [activeTab])

    const handleUpdateOrderStatus = async (id, status) => {
        try {
            await api.put(`/orders/${id}/status`, {
                status,
                trackingNumber: status === 'Shipped' ? trackingNumber : undefined,
                carrier: status === 'Shipped' ? carrier : undefined,
                reason: (status === 'Cancelled' || status === 'Return Requested') ? statusReason : undefined
            })
            toast.success('Archival ledger updated.');
            setOrders(orders.map(o => o._id === id ? { ...o, status, trackingNumber, carrier, statusUpdateReason: statusReason } : o))
            if (selectedOrder && selectedOrder._id === id) {
                setSelectedOrder({ ...selectedOrder, status, trackingNumber, carrier, statusUpdateReason: statusReason })
            }
            // Clear logistical inputs after update
            if (status !== 'Shipped') { setTrackingNumber(''); setCarrier(''); }
            if (status !== 'Cancelled') setStatusReason('');
        } catch (error) {
            toast.error('Registry update failed.')
        }
    }

    const handleUpdateReturnStatus = async (orderId, newStatus) => {
        try {
            const { data } = await api.put(`/orders/${orderId}/return-status`, {
                status: newStatus,
                adminNotes: returnAdminNotes
            });
            toast.success(`Return request ${newStatus.toLowerCase()} successfully.`);
            setOrders(orders.map(o => o._id === orderId ? data : o));
            if (selectedOrder && selectedOrder._id === orderId) {
                setSelectedOrder(data);
            }
            setReturnAdminNotes('');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Archival update failure.');
        }
    };


    const handleUpdateOrderNotes = async () => {
        try {
            setSavingNotes(true)
            await api.put(`/orders/${selectedOrder._id}/notes`, { notes: orderNotes })
            toast.success('Internal ledger note secured.')
            setOrders(orders.map(o => o._id === selectedOrder._id ? { ...o, internalNotes: orderNotes } : o))
            setSelectedOrder({ ...selectedOrder, internalNotes: orderNotes })
            const { data: abandonedData } = await api.get('/users/admin/abandoned-carts')
            setAbandonedCarts(abandonedData)
        } catch (error) {
            toast.error('Vault data retrieval failure.')
        } finally {
            setLoading(false)
        }
    }

    const handleSendRecovery = async (userId) => {
        try {
            await api.post(`/users/admin/send-recovery/${userId}`)
            toast.success('Maison Reminder delivered.')
            setAbandonedCarts(abandonedCarts.filter(c => c._id !== userId))
        } catch (error) {
            toast.error('Correspondence failed.')
        }
    }


    const handlePrintInvoice = (orderId) => {
        window.open(`${api.defaults.baseURL}/orders/${orderId}/invoice`, '_blank')
    }

    const handleAddProduct = () => {
        setEditMode(false)
        setCurrentProduct({
            name: '', category: 'Necklaces', price: '', details: '', material: 'Stainless Steel',
            plating: 'Gold 18K PVD Plating', stone: 'Natural', length: '46 cm', weight: '6g',
            features: ['Sweatproof', 'Anti Tarnish', 'Water proof', 'Hypoallergenic'],
            stock: 0, img: '', images: ['', '', '', ''], hero: false
        })
        setIsModalOpen(true)
    }

    const handleEditProduct = (product) => {
        setEditMode(true)
        // Ensure images registry is correctly initialized with 4 slots
        const gallery = Array.isArray(product.images) ? [...product.images] : []
        while (gallery.length < 4) gallery.push('')

        setCurrentProduct({
            ...product,
            images: gallery
        })
        setIsModalOpen(true)
    }

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you certain you wish to remove this masterpiece from the archive?')) {
            try {
                await api.delete(`/products/${id}`)
                toast.success('Piece removed from archival.')
                fetchAdminData()
            } catch (error) {
                toast.error('Deletion failed.')
            }
        }
    }

    const handleFileUpload = async (e, idx = null) => {
        const file = e.target.files[0]
        if (!file) return
        const formData = new FormData()
        formData.append('image', file)
        try {
            setUploadingIdx(idx === null ? 'main' : idx)
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            if (idx === null) {
                setCurrentProduct({ ...currentProduct, img: data.url })
            } else {
                const newImages = [...(currentProduct.images || ['', '', ''])]
                newImages[idx] = data.url
                setCurrentProduct({ ...currentProduct, images: newImages })
            }
            toast.success('Archival asset secured.')
        } catch (error) {
            toast.error('Upload failed.')
        } finally {
            setUploadingIdx(null)
        }
    }

    const handleSaveProduct = async (e) => {
        e.preventDefault()
        try {
            if (editMode) {
                const { data } = await api.put(`/products/${currentProduct._id}`, currentProduct)
                setProducts(products.map(p => p._id === data._id ? data : p))
                toast.success('Masterpiece refined.')
            } else {
                const { data } = await api.post('/products', currentProduct)
                toast.success('New Piece cataloged.')
                fetchAdminData()
            }
            setIsModalOpen(false)
        } catch (error) {
            toast.error('Saving failed.')
        }
    }

    const handleSavePromo = async (e) => {
        e.preventDefault()
        try {
            setIsSavingPromo(true)
            const { data } = await api.post('/promos', currentPromo)
            setPromos([data, ...promos])
            setIsPromoModalOpen(false)
            toast.success('Artisanal code engraved.')
            setCurrentPromo({ code: '', discount: 10, expiryDate: '', limit: 100 })
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registry failed.')
        } finally {
            setIsSavingPromo(false)
        }
    }

    const handleDeletePromo = async (id) => {
        if (!window.confirm('Strike this code from the archives?')) return
        try {
            await api.delete(`/promos/${id}`)
            setPromos(promos.filter(p => p._id !== id))
            toast.success('Code redacted.')
        } catch (error) {
            toast.error('Deletion failed.')
        }
    }

    const handleAction = (label) => {
        if (label === 'Create Promo') {
            setIsPromoModalOpen(true)
        } else {
            alert(`${label} simulation initiated.`);
        }
    }

    const handleToggleAdmin = async (id, isAdmin) => {
        try {
            await api.put(`/users/${id}`, { isAdmin });
            toast.success('User privileges updated.');
            setCustomers(customers.map(c => c._id === id ? { ...c, isAdmin } : c));
        } catch (error) {
            toast.error('Privilege update failed.');
        }
    }


    const renderDashboard = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-surface-container-low p-12 border border-outline-variant/10">
                            <Skeleton width="100%" height="150px" />
                        </div>
                    ))
                ) : (
                    [
                        { label: "Total Revenue", value: stats.totalRevenue ? `₹${stats.totalRevenue.toLocaleString()}` : "₹0", icon: "payments", trend: stats.revenueTrend || "+0%" },
                        { label: "Total Orders", value: stats.totalOrders || 0, icon: "order_approve", trend: stats.orderTrend || "+0%" },
                        { label: "Active Clients", value: stats.totalUsers || 0, icon: "diamond", trend: "High Value" }
                    ].map((stat) => (
                        <div key={stat.label} className="bg-surface-container-low p-12 shadow-sm border border-outline-variant/10 group hover:border-primary/40 transition-all duration-700">
                            <div className="flex justify-between items-start mb-8">
                                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">{stat.icon}</span>
                                <span className="font-label text-[10px] text-primary font-black">{stat.trend}</span>
                            </div>
                            <p className="font-label text-[11px] uppercase tracking-[0.25em] text-secondary mb-4 font-black opacity-60">{stat.label}</p>
                            <h3 className="font-headline text-4xl italic font-light tracking-tight">{stat.value}</h3>
                        </div>
                    ))
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-8 bg-surface-container-low p-16 border border-outline-variant/10 shadow-sm">
                    <h2 className="font-headline text-3xl italic mb-12 border-b border-black/5 pb-6">Revenue Performance</h2>
                    {loading ? (
                        <Skeleton width="100%" height="320px" />
                    ) : (
                        <div className="h-80 flex items-end gap-1 px-6">
                            {revenueData.map((item, i) => {
                                const maxHeight = Math.max(...revenueData.map(d => d.revenue)) || 1
                                const hRatio = (item.revenue / maxHeight) * 100
                                return (
                                    <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${hRatio || 2}%` }} transition={{ delay: i * 0.05, duration: 1 }} className="flex-1 bg-primary/20 hover:bg-primary transition-colors cursor-help group relative">
                                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity font-label text-[10px] font-black">₹{item.revenue.toLocaleString()}</span>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </div>
                <div className="lg:col-span-4 bg-surface-container-low p-16 border border-outline-variant/10 shadow-sm flex flex-col items-center justify-center text-center">
                    <h2 className="font-headline text-3xl italic mb-12 border-b border-black/5 pb-6 w-full text-left">System Status</h2>
                    <span className="material-symbols-outlined text-primary text-6xl mb-6">shield_checkered</span>
                    <p className="font-body text-sm opacity-40 italic font-black uppercase tracking-widest text-primary animate-pulse">All systems are secure.</p>
                </div>
            </div>
        </motion.div>
    )

    const renderOrders = () => {
        const filtered = orders.filter(o => {
            const matchesSearch = o._id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                o.user?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                o.user?.email?.toLowerCase().includes(orderSearch.toLowerCase());
            const matchesFilter = orderFilter === 'All' || o.status === orderFilter;
            return matchesSearch && matchesFilter;
        })

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
                <div className="border-b border-outline-variant/10 pb-12 flex flex-col md:flex-row justify-between items-baseline gap-12">
                    <h2 className="font-headline text-6xl italic font-light tracking-tight">Active Shipments</h2>
                    <div className="flex-1 w-full max-w-2xl">
                        <input
                            type="text"
                            placeholder="Search by Order ID, Name or Email..."
                            value={orderSearch}
                            onChange={(e) => setOrderSearch(e.target.value)}
                            className="w-full bg-surface-container-low border border-outline-variant/20 p-6 font-body text-sm focus:ring-1 focus:ring-primary outline-none italic"
                        />
                    </div>
                </div>

                {orders.filter(o => o.returnRequest?.isRequested && o.returnRequest?.status === 'Pending').length > 0 && (
                    <div className="bg-primary/5 border border-primary/10 p-6 flex items-center justify-between group cursor-pointer hover:bg-primary/10 transition-all" onClick={() => setOrderFilter('Return Requested')}>
                        <div className="flex items-center gap-6">
                            <span className="material-symbols-outlined text-primary animate-bounce">assignment_return</span>
                            <p className="font-label text-[10px] uppercase tracking-widest font-black text-primary">
                                {orders.filter(o => o.returnRequest?.isRequested && o.returnRequest?.status === 'Pending').length} Pending Return Requests
                            </p>
                        </div>
                        <span className="material-symbols-outlined group-hover:translate-x-3 transition-transform">arrow_forward</span>
                    </div>
                )}

                <div className="flex flex-wrap gap-4 border-b border-outline-variant/5 pb-12">
                    {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested'].map(status => (
                        <button
                            key={status}
                            onClick={() => setOrderFilter(status)}
                            className={`px-10 py-4 font-label text-[10px] uppercase tracking-[0.3em] font-black transition-all ${orderFilter === status ? 'bg-primary text-on-primary shadow-lux' : 'bg-surface-container-low text-secondary hover:text-primary'}`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="space-y-8">
                    {filtered.map(o => (
                        <motion.div layout key={o._id} className="bg-surface-container-low p-12 border border-outline-variant/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-10 group hover:shadow-lux transition-all duration-700">
                            <div className="space-y-2 cursor-pointer flex-1" onClick={() => { setSelectedOrder(o); setOrderNotes(o.internalNotes || ''); setIsOrderModalOpen(true); }}>
                                <p className="font-label text-[10px] text-primary tracking-[0.3em] font-black uppercase mb-3">Order #{o._id.slice(-6)}</p>
                                <h3 className="font-headline text-3xl italic font-light group-hover:text-primary transition-colors flex items-center gap-4">
                                    {o.user?.name || 'Guest Member'}
                                    <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100">visibility</span>
                                </h3>
                                <p className="font-label text-[11px] uppercase tracking-[0.2em] opacity-40 font-black italic">
                                    {o.orderItems?.length || 0} Pieces • {new Date(o.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-20">
                                <div className="text-right">
                                    <p className="font-label text-[10px] uppercase opacity-40 font-black">Total</p>
                                    <p className="font-headline text-3xl font-light">₹{o.totalPrice.toLocaleString()}</p>
                                </div>
                                <select
                                    value={o.status}
                                    onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                                    className="px-8 py-4 border border-primary/20 text-primary font-label text-[10px] uppercase tracking-[0.3em] font-black italic bg-transparent outline-none focus:border-primary"
                                >
                                    {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested'].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        )
    }

    const renderAbandonedCarts = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            <header className="flex justify-between items-end border-b border-outline-variant/10 pb-12">
                <div>
                    <h2 className="font-headline text-6xl italic font-light tracking-tight mb-4">Abandoned Vaults</h2>
                    <p className="font-label text-[10px] uppercase tracking-[0.3em] font-black opacity-40 italic">Clients with inactive curations over 24 hours.</p>
                </div>
            </header>

            <div className="bg-surface-container-low border border-outline-variant/10 p-12">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-outline-variant/10 font-label text-[9px] uppercase tracking-widest font-black opacity-40">
                            <th className="pb-6 pl-6">Client</th>
                            <th className="pb-6">Last Active</th>
                            <th className="pb-6 text-center">Vault Depth</th>
                            <th className="pb-6 pr-6 text-right">Strategic Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {abandonedCarts.map(cart => (
                            <tr key={cart._id} className="group hover:bg-primary/[0.02] transition-all">
                                <td className="py-10 pl-6">
                                    <div className="font-headline text-2xl italic">{cart.name}</div>
                                    <div className="font-label text-[9px] opacity-40 uppercase">{cart.email}</div>
                                </td>
                                <td className="py-10 font-label text-[10px] opacity-40 italic font-black">
                                    {new Date(cart.cartLastUpdated).toLocaleDateString()}
                                </td>
                                <td className="py-10 text-center">
                                    <span className="bg-primary/5 px-4 py-2 font-label text-[10px] font-black tracking-widest border border-primary/10">
                                        {cart.cart?.length || 0} PIECES
                                    </span>
                                </td>
                                <td className="py-10 pr-6 text-right">
                                    <button
                                        onClick={() => handleSendRecovery(cart._id)}
                                        className="bg-primary text-on-primary px-8 py-3 font-label text-[9px] uppercase tracking-widest font-black shadow-lux-sm hover:translate-y-[-2px] transition-all"
                                    >
                                        Send Maison Reminder (5% Code)
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {abandonedCarts.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-32 text-center font-headline text-2xl italic opacity-20 italic">No inactive vaults detected in the current cycle.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
    )



    const renderPromos = () => (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-16">
            <div className="flex flex-col md:flex-row justify-between items-baseline border-b border-outline-variant/10 pb-12 gap-8">
                <div>
                    <h2 className="font-headline text-6xl italic font-light tracking-tight">Promotional Vault</h2>
                    <p className="font-label text-[11px] uppercase tracking-[0.4em] font-black opacity-40 mt-6 italic">Fiscal Incentives & Coded Access</p>
                </div>
                <button onClick={() => handleAction('Create Promo')} className="bg-primary text-on-primary px-16 py-6 font-label uppercase tracking-[0.3em] text-[10px] font-black shadow-lux">+ Generate Code</button>
            </div>
            <div className="space-y-8">
                {promos.map(p => (
                    <div key={p._id} className="bg-surface-container-low p-10 border border-outline-variant/10 flex items-center justify-between group hover:shadow-lux-sm transition-all">
                        <div className="flex items-center gap-12">
                            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary font-headline text-2xl italic">%</div>
                            <div>
                                <h3 className="font-headline text-3xl italic mb-2 tracking-wide uppercase">{p.code} <span className="bg-primary/20 px-3 py-1 font-label text-[10px] text-primary ml-4 normal-case tracking-normal">{p.discount}% OFF</span></h3>
                                <p className="font-label text-[10px] uppercase font-black opacity-40">Persistence: {p.usedCount || 0} / {p.limit || '∞'} Redemptions</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-10">
                            <div className={`w-3 h-3 rounded-full ${p.isActive ? 'bg-green-500' : 'bg-red-500'}`} title={p.isActive ? 'Registry Active' : 'Registry Inactive'} />
                            <button
                                onClick={() => handleDeletePromo(p._id)}
                                className="w-12 h-12 flex items-center justify-center text-secondary hover:text-error transition-all opacity-0 group-hover:opacity-100 hover:scale-125"
                            >
                                <span className="material-symbols-outlined text-xl">delete</span>
                            </button>
                        </div>

                    </div>
                ))}
            </div>
        </motion.div>
    )

    const renderPieceManager = () => (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
            <div className="flex flex-col md:flex-row justify-between items-baseline border-b border-outline-variant/10 pb-12 gap-8">
                <div>
                    <h2 className="font-headline text-6xl italic font-light tracking-tight">Inventory Manager</h2>
                    <p className="font-label text-[11px] uppercase opacity-40 font-black mt-6 italic tracking-[0.3em]">{productTotal} Masterpieces cataloged</p>
                </div>
                <button onClick={handleAddProduct} className="bg-primary text-on-primary px-16 py-6 font-label uppercase tracking-[0.3em] text-[10px] font-black shadow-lux">+ Catalog Piece</button>
            </div>
            <div className="overflow-x-auto bg-surface-container-low p-12 border border-outline-variant/10">
                <table className="w-full text-left min-w-[800px]">
                    <thead>
                        <tr className="border-b border-outline-variant/10 text-outline uppercase tracking-[0.3em] text-[11px] font-black">
                            <th className="py-12 pl-6">Piece</th>
                            <th className="py-12 px-6">SKU</th>
                            <th className="py-12 px-6">Category</th>
                            <th className="py-12 px-6 text-right">Price</th>
                            <th className="py-12 px-6 text-right">Stock</th>
                            <th className="py-12 pr-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {products.map(p => (
                            <tr key={p._id} className="group hover:bg-surface-container/50 transition-all">
                                <td className="py-12 pl-6 flex items-center gap-8">
                                    <div className="w-20 h-20 bg-surface-container overflow-hidden group-hover:grayscale-0 transition-all border border-black/5">
                                        <img src={p.img || p.image} alt={p.name} className="w-full h-full object-cover" />
                                    </div>
                                    <h3 className="font-headline text-2xl italic group-hover:text-primary transition-colors">{p.name}</h3>
                                </td>
                                <td className="py-12 px-6 font-mono text-[10px] tracking-wider opacity-60 uppercase">{p.sku || 'N/A'}</td>
                                <td className="py-12 px-6 font-label text-[10px] uppercase font-black opacity-60 italic">{p.category}</td>
                                <td className="py-12 px-6 text-right font-headline text-2xl font-light">₹{p.price?.toLocaleString()}</td>
                                <td className="py-12 px-6 text-right font-label text-[11px] font-black tracking-widest">{p.stock || 0} Units</td>
                                <td className="py-12 pr-6 text-right">
                                    <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditProduct(p)} className="material-symbols-outlined text-xl text-primary/60 hover:text-primary">edit</button>
                                        <button onClick={() => handleDeleteProduct(p._id)} className="material-symbols-outlined text-xl text-outline/40 hover:text-red-500">delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between items-center pt-10">
                <p className="font-label text-[10px] uppercase font-black opacity-40">Page {productPage} of {productPages}</p>
                <div className="flex gap-4">
                    <button
                        disabled={productPage === 1}
                        onClick={() => {
                            setProductPage(prev => Math.max(prev - 1, 1));
                            window.scrollTo(0, 0);
                        }}
                        className="px-8 py-3 border border-primary/20 text-primary font-label text-[9px] uppercase tracking-widest font-black disabled:opacity-20 hover:bg-primary/5 transition-all"
                    >
                        Previous
                    </button>
                    <button
                        disabled={productPage === productPages}
                        onClick={() => {
                            setProductPage(prev => Math.min(prev + 1, productPages));
                            window.scrollTo(0, 0);
                        }}
                        className="px-8 py-3 bg-primary text-on-primary font-label text-[9px] uppercase tracking-widest font-black disabled:opacity-20 hover:shadow-lux-sm transition-all"
                    >
                        Next
                    </button>
                </div>
            </div>
        </motion.div>
    )

    const renderCustomers = () => (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-20">
            <div className="flex flex-col md:flex-row justify-between items-baseline border-b border-outline-variant/10 pb-8 gap-6">
                <h2 className="font-headline text-5xl italic font-light tracking-tight">Client Registry</h2>
                <p className="font-label text-[11px] uppercase tracking-[0.4em] opacity-40 font-black italic">{customers.length} Members</p>
            </div>
            <div className="overflow-x-auto bg-surface-container-low p-12 border border-outline-variant/10 shadow-sm">
                <table className="w-full text-left min-w-[900px]">
                    <thead>
                        <tr className="border-b border-outline-variant/10 text-outline uppercase tracking-[0.3em] text-[11px] font-black">
                            <th className="py-10 pl-6">Member</th>
                            <th className="py-10 px-6 font-center">Status</th>
                            <th className="py-10 px-6">Preference</th>
                            <th className="py-10 px-6 text-right">Total Value</th>
                            <th className="py-10 pr-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {customers.map(c => (
                            <tr key={c._id} className="group hover:bg-surface-container/50">
                                <td className="py-10 pl-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-headline text-xl italic">{c.name.charAt(0)}</div>
                                        <div>
                                            <h4 className="font-headline text-xl italic">{c.name}</h4>
                                            <p className="font-body text-[11px] opacity-60">{c.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-10 px-6">
                                    <span className={`px-4 py-1 text-[8px] uppercase tracking-[0.2em] font-black ${c.isAdmin ? 'bg-primary text-on-primary' : 'bg-outline-variant/10'}`}>{c.isAdmin ? 'Admin' : (c.status || 'Client')}</span>
                                </td>
                                <td className="py-10 px-6 font-label text-[10px] uppercase font-black opacity-60 italic">{c.preference || 'General'}</td>
                                <td className="py-10 px-6 text-right font-headline text-2xl italic font-light">₹{c.spend?.toLocaleString() || 0}</td>
                                <td className="py-10 pr-6 text-right">
                                    <button onClick={() => { setSelectedCustomer(c); setIsCustomerModalOpen(true); }} className="material-symbols-outlined text-xl opacity-0 group-hover:opacity-100 text-outline hover:text-primary">account_circle</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </motion.div>
    )

    const renderSettings = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-24">
            <div className="border-b border-outline-variant/10 pb-12">
                <h2 className="font-headline text-6xl italic font-light tracking-tight">Admin Settings</h2>
                <p className="font-label text-[11px] uppercase tracking-[0.4em] font-black opacity-40 mt-4 italic">Maison Governance & Configuration</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                {/* Store Configuration */}
                <div className="space-y-12">
                    <section className="bg-surface-container-low p-12 border border-outline-variant/10 space-y-8">
                        <h3 className="font-label text-[11px] uppercase tracking-[0.4em] font-black border-b border-black/5 pb-4">Store Configuration</h3>
                        <div className="space-y-8">
                            <div className="flex justify-between items-center group">
                                <div>
                                    <h4 className="font-headline text-2xl italic">Archive Mode</h4>
                                    <p className="font-body text-xs opacity-60 italic">Toggle "Exhibition Only" for collection launches.</p>
                                </div>
                                <div className="w-14 h-8 bg-black/5 border border-black/10 rounded-full relative cursor-pointer group-hover:border-primary/40 transition-all">
                                    <div className="absolute top-1 left-1 w-6 h-6 bg-primary/20 rounded-full" />
                                </div>
                            </div>
                            <div className="flex justify-between items-center group opacity-40 cursor-not-allowed">
                                <div>
                                    <h4 className="font-headline text-2xl italic">Global GST/Tax</h4>
                                    <p className="font-body text-xs italic">Set unified tax rate for all curations.</p>
                                </div>
                                <span className="font-headline text-xl">18%</span>
                            </div>
                        </div>
                    </section>

                    <section className="bg-secondary/5 p-12 border border-secondary/10 space-y-6">
                        <h3 className="font-label text-[11px] uppercase tracking-[0.4em] font-black border-b border-black/5 pb-4">Fiscal Audit</h3>
                        <p className="font-body text-sm italic opacity-60">Export the entire Maison registry for accounting.</p>
                        <button onClick={() => handleAction('Export CSV')} className="w-full py-5 border border-secondary/40 text-secondary font-label text-[10px] uppercase tracking-[0.5em] font-black hover:bg-secondary hover:text-white transition-all shadow-lux-sm">Download Archival Records (.CSV)</button>
                    </section>
                </div>

                {/* Staff Roles */}
                <section className="bg-surface-container-low p-12 border border-outline-variant/10 space-y-8">
                    <h3 className="font-label text-[11px] uppercase tracking-[0.4em] font-black border-b border-black/5 pb-4">Staff Roles (Privileges)</h3>
                    <div className="space-y-6 max-h-[600px] overflow-y-auto no-scrollbar">
                        {customers.map(c => (
                            <div key={c._id} className="flex justify-between items-center p-6 bg-white/40 border border-black/5 hover:border-primary/20 transition-all group">
                                <div className="flex items-center gap-6">
                                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary font-headline text-lg italic">{c.name.charAt(0)}</div>
                                    <div>
                                        <h4 className="font-headline text-xl italic">{c.name}</h4>
                                        <p className="font-label text-[8px] uppercase font-black opacity-40">{c.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggleAdmin(c._id, !c.isAdmin)}
                                    className={`px-6 py-2 font-label text-[9px] uppercase tracking-widest font-black transition-all ${c.isAdmin ? 'bg-primary text-on-primary' : 'border border-primary/20 text-primary hover:bg-primary/5'}`}
                                >
                                    {c.isAdmin ? 'Revoke Admin' : 'Grant Admin'}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </motion.div>
    )

    const renderCustomerModal = () => (
        <AnimatePresence>
            {isCustomerModalOpen && selectedCustomer && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCustomerModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-4xl bg-[#fffcf7] shadow-lux border border-outline-variant/10 p-8 md:p-16 overflow-y-auto max-h-[90vh] no-scrollbar">
                        <div className="flex justify-between items-start mb-12">
                            <div className="flex items-center gap-8">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-headline text-4xl italic">{selectedCustomer.name.charAt(0)}</div>
                                <div>
                                    <h2 className="font-headline text-4xl italic font-light">{selectedCustomer.name}</h2>
                                    <p className="font-label text-[10px] uppercase tracking-[0.3em] font-black opacity-40 mt-2">{selectedCustomer.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsCustomerModalOpen(false)} className="material-symbols-outlined text-3xl opacity-20 hover:opacity-100">close</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            {/* Client Activity */}
                            <div className="space-y-12">
                                <section>
                                    <h3 className="font-label text-[11px] uppercase tracking-[0.4em] font-black border-b border-black/5 pb-4 mb-6">Archival Interests (Wishlist)</h3>
                                    <div className="space-y-6">
                                        {selectedCustomer.wishlist?.length > 0 ? selectedCustomer.wishlist.map(item => (
                                            <div key={item._id} className="flex gap-6 items-center group">
                                                <img src={item.img} className="w-16 h-16 object-cover grayscale group-hover:grayscale-0 transition-all" />
                                                <div>
                                                    <p className="font-headline text-lg italic">{item.name}</p>
                                                    <p className="font-label text-[9px] uppercase font-black opacity-40">₹{item.price.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        )) : <p className="font-body text-sm opacity-40 italic">No pieces saved yet.</p>}
                                    </div>
                                </section>

                                <section>
                                    <h3 className="font-label text-[11px] uppercase tracking-[0.4em] font-black border-b border-black/5 pb-4 mb-6">Recent Observations</h3>
                                    <div className="space-y-6 opacity-60">
                                        {selectedCustomer.recentlyViewed?.length > 0 ? selectedCustomer.recentlyViewed.map((view, i) => (
                                            <div key={i} className="flex gap-6 items-center">
                                                <div className="w-12 h-12 bg-black/5 flex items-center justify-center text-xs italic">{i + 1}</div>
                                                <div>
                                                    <p className="font-headline text-md italic">{view.product?.name}</p>
                                                    <p className="font-label text-[8px] uppercase font-black opacity-40">{new Date(view.viewedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        )) : <p className="font-body text-sm opacity-40 italic">No recent activity recorded.</p>}
                                    </div>
                                </section>
                            </div>

                            {/* CRM Actions */}
                            <div className="space-y-12">
                                <section className="p-8 bg-primary/[0.03] border border-primary/5 space-y-6">
                                    <h3 className="font-label text-[11px] uppercase tracking-[0.2em] font-black">Strategic Incentives</h3>
                                    <p className="font-body text-xs italic opacity-60">Send a personalized archival discount to this member.</p>
                                    <div className="flex gap-4">
                                        <input placeholder="Code..." className="flex-1 bg-white border border-black/5 p-3 text-xs outline-none" />
                                        <button className="bg-primary text-on-primary px-6 text-[9px] font-black uppercase tracking-widest">Send</button>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h3 className="font-label text-[11px] uppercase tracking-[0.4em] font-black border-b border-black/5 pb-4">Membership Artifacts</h3>
                                    <div className="flex justify-between text-[11px] uppercase font-black opacity-40 italic"><span>Account Status</span><span>{selectedCustomer.status || 'Active Member'}</span></div>
                                    <div className="flex justify-between text-[11px] uppercase font-black opacity-40 italic"><span>Lifetime Treasury</span><span>₹{selectedCustomer.spend?.toLocaleString() || 0}</span></div>
                                    <div className="flex justify-between text-[11px] uppercase font-black opacity-40 italic"><span>Maison Registry</span><span>{new Date(selectedCustomer.createdAt).toLocaleDateString()}</span></div>
                                </section>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )


    const renderOrderModal = () => (
        <AnimatePresence>
            {isOrderModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOrderModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-4xl bg-[#fffcf7] shadow-lux border border-outline-variant/10 p-8 md:p-16 overflow-y-auto max-h-[90vh] no-scrollbar">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <h2 className="font-headline text-4xl italic font-light">Order Details</h2>
                                <p className="font-label text-[10px] uppercase tracking-[0.3em] font-black opacity-40 mt-2">Registry Node #{selectedOrder._id.slice(-6)}</p>
                            </div>
                            <button onClick={() => setIsOrderModalOpen(false)} className="material-symbols-outlined text-3xl opacity-20 hover:opacity-100">close</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
                            <div className="space-y-8">
                                <h3 className="font-label text-[11px] uppercase tracking-[0.4em] font-black border-b border-black/5 pb-4">Client Information</h3>
                                <p className="font-headline text-2xl italic">{selectedOrder.user?.name || 'Guest'}</p>
                                <p className="font-body text-sm opacity-60 italic">{selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.country}</p>
                            </div>
                            <div className="space-y-8">
                                <h3 className="font-label text-[11px] uppercase tracking-[0.4em] font-black border-b border-black/5 pb-4">Status & Logistics</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-[10px] uppercase font-black opacity-40"><span>Payment</span><span className={selectedOrder.isPaid ? 'text-primary' : 'text-orange-500'}>{selectedOrder.isPaid ? 'Completed' : 'Pending'}</span></div>
                                    <div className="flex justify-between text-[10px] uppercase font-black opacity-40"><span>Delivery</span><span className={selectedOrder.isDelivered ? 'text-primary' : 'text-blue-500'}>{selectedOrder.status}</span></div>

                                    {/* Return Request Section */}
                                    {selectedOrder.returnRequest?.isRequested && (
                                        <div className="mt-8 pt-6 border-t border-amber-500/20 bg-amber-500/[0.04] p-6 border border-amber-500/10 space-y-6 animate-in fade-in slide-in-from-top-4">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-label text-[9px] uppercase font-black text-amber-600">Return Application</h4>
                                                <span className={`text-[8px] uppercase tracking-widest font-black px-3 py-1 border ${
                                                    selectedOrder.returnRequest.status === 'Approved' ? 'border-green-500 text-green-600 bg-green-50' :
                                                    selectedOrder.returnRequest.status === 'Rejected' ? 'border-red-500 text-red-600 bg-red-50' :
                                                    'border-amber-500 text-amber-600'
                                                }`}>
                                                    {selectedOrder.returnRequest.status}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-black opacity-40">Reason</p>
                                                <p className="font-headline text-lg italic">{selectedOrder.returnRequest.reason}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-black opacity-40">Client Details</p>
                                                <p className="font-body text-[11px] italic opacity-70 leading-relaxed">{selectedOrder.returnRequest.details || 'No additional details.'}</p>
                                            </div>

                                            {selectedOrder.returnRequest.status === 'Pending' && (
                                                <div className="space-y-4 pt-2">
                                                    <textarea 
                                                        value={returnAdminNotes}
                                                        onChange={e => setReturnAdminNotes(e.target.value)}
                                                        className="w-full bg-white border border-black/5 p-3 text-[10px] italic min-h-[50px] outline-none focus:border-amber-500"
                                                        placeholder="Admin response note..."
                                                    />
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleUpdateReturnStatus(selectedOrder._id, 'Approved')}
                                                            className="flex-1 bg-green-600 text-white py-3 font-label text-[8px] uppercase tracking-widest font-black"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateReturnStatus(selectedOrder._id, 'Rejected')}
                                                            className="flex-1 bg-red-600 text-white py-3 font-label text-[8px] uppercase tracking-widest font-black"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedOrder.returnRequest.adminNotes && (
                                                <div className="pt-2 border-t border-black/5">
                                                    <p className="text-[10px] uppercase font-black opacity-40">Staff Note</p>
                                                    <p className="font-body text-[11px] italic opacity-70">{selectedOrder.returnRequest.adminNotes}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Logistical Inputs */}
                                    <div className="pt-6 space-y-4 border-t border-black/5">
                                        <label className="block font-label text-[9px] uppercase font-black opacity-40">Update Logistics</label>
                                        <select
                                            value={selectedOrder.status}
                                            onChange={(e) => handleUpdateOrderStatus(selectedOrder._id, e.target.value)}
                                            className="w-full px-4 py-2 border border-primary/20 text-primary font-label text-[9px] uppercase tracking-[0.2em] font-black italic bg-transparent outline-none"
                                        >
                                            {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested'].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>

                                        {selectedOrder.status === 'Shipped' && (
                                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                                <input
                                                    placeholder="Tracking Number..."
                                                    value={trackingNumber || selectedOrder.trackingNumber || ''}
                                                    onChange={e => setTrackingNumber(e.target.value)}
                                                    className="w-full bg-white border border-black/5 p-3 text-[10px] italic outline-none focus:border-primary"
                                                />
                                                <input
                                                    placeholder="Courier (e.g. FedEx)..."
                                                    value={carrier || selectedOrder.carrier || ''}
                                                    onChange={e => setCarrier(e.target.value)}
                                                    className="w-full bg-white border border-black/5 p-3 text-[10px] italic outline-none focus:border-primary"
                                                />
                                            </div>
                                        )}

                                        {(selectedOrder.status === 'Cancelled' || selectedOrder.status === 'Return Requested') && (
                                            <textarea
                                                placeholder="Reason for cancellation/rejection..."
                                                value={statusReason || selectedOrder.statusUpdateReason || ''}
                                                onChange={e => setStatusReason(e.target.value)}
                                                className="w-full bg-white border border-black/5 p-3 text-[10px] italic min-h-[60px] outline-none focus:border-primary"
                                            />
                                        )}

                                        {(trackingNumber || statusReason) && (
                                            <button
                                                onClick={() => handleUpdateOrderStatus(selectedOrder._id, selectedOrder.status)}
                                                className="w-full py-2 bg-primary text-on-primary font-label text-[9px] uppercase tracking-widest font-black"
                                            >
                                                Sync Logistics
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="space-y-8">
                            <h3 className="font-label text-[11px] uppercase tracking-[0.4em] font-black border-b border-black/5 pb-4">Archived Pieces</h3>
                            {selectedOrder.orderItems?.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-8 py-4 border-b border-black/5 last:border-0">
                                    <img src={item.image} className="w-20 h-20 object-cover grayscale" />
                                    <div className="flex-1">
                                        <h4 className="font-headline text-xl italic">{item.name}</h4>
                                        <p className="font-label text-[10px] uppercase opacity-40">Qty: {item.qty}</p>
                                    </div>
                                    <p className="font-headline text-xl font-light">₹{(item.price * item.qty).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>

                        {/* Internal Notes Section */}
                        <div className="mt-16 pt-12 border-t border-black/5 space-y-8 bg-primary/[0.02] p-8 border border-primary/5">
                            <h3 className="font-label text-[11px] uppercase tracking-[0.4em] font-black opacity-40">Internal Archival Notes</h3>
                            <textarea
                                value={orderNotes}
                                onChange={(e) => setOrderNotes(e.target.value)}
                                className="w-full bg-white border border-black/5 p-6 font-body text-sm italic min-h-[120px] outline-none focus:border-primary"
                                placeholder="Staff memo (Gift wrap, Express curation, etc.)..."
                            />
                            <div className="flex justify-between items-center">
                                <p className="font-body text-[9px] opacity-30 italic">Visible only to the Maison staff.</p>
                                <button onClick={handleUpdateOrderNotes} disabled={savingNotes} className="bg-primary/10 text-primary px-8 py-3 font-label text-[9px] uppercase tracking-widest font-black hover:bg-primary hover:text-white transition-all disabled:opacity-50">
                                    {savingNotes ? 'Syncing...' : 'Secure Archival Note'}
                                </button>
                            </div>
                        </div>

                        <div className="mt-12 flex flex-col md:flex-row gap-4 pt-12 border-t border-black/5">
                            <button onClick={() => handlePrintInvoice(selectedOrder._id)} className="flex-1 bg-[#111110] text-white py-5 font-label text-[10px] uppercase tracking-[0.4em] font-black hover:opacity-90 transition-all">Print Invoice</button>
                            <button onClick={() => handleAction('Packing Slip')} className="flex-1 border border-[#111110]/20 py-5 font-label text-[10px] uppercase tracking-[0.4em] font-black hover:bg-[#111110] hover:text-white transition-all">Packing Slip</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )

    const renderInventoryModal = () => (
        <AnimatePresence>
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-4xl bg-[#fffcf7] shadow-lux border border-outline-variant/10 p-8 md:p-16 overflow-y-auto max-h-[90vh] no-scrollbar">
                        <h2 className="font-headline text-4xl italic mb-12">{editMode ? 'Refine Masterpiece' : 'Catalog New Piece'}</h2>
                        <form onSubmit={handleSaveProduct} className="space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <input type="text" required value={currentProduct.name} onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-3 font-headline text-2xl italic outline-none focus:border-primary" placeholder="Title..." />
                                <select value={currentProduct.category} onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-3 font-label text-[12px] uppercase font-black">
                                    {['Necklaces', 'Rings', 'Earrings', 'Bracelets', 'Collections'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                                <input type="number" required value={currentProduct.price} onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-3 font-headline text-2xl outline-none focus:border-primary" placeholder="Price (₹)..." />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-black/5 pt-10">
                                <div className="space-y-4">
                                    <label className="font-label text-[9px] uppercase tracking-widest opacity-40">Archival SKU</label>
                                    <input type="text" value={currentProduct.sku} onChange={(e) => setCurrentProduct({ ...currentProduct, sku: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-2 text-sm italic outline-none focus:border-primary" placeholder="TG-2026..." />
                                </div>
                                <div className="space-y-4">
                                    <label className="font-label text-[9px] uppercase tracking-widest opacity-40">Base Material</label>
                                    <input type="text" value={currentProduct.material} onChange={(e) => setCurrentProduct({ ...currentProduct, material: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-2 text-sm italic outline-none focus:border-primary" placeholder="22K Gold..." />
                                </div>
                                <div className="space-y-4">
                                    <label className="font-label text-[9px] uppercase tracking-widest opacity-40">Stone/Pearl</label>
                                    <input type="text" value={currentProduct.stone} onChange={(e) => setCurrentProduct({ ...currentProduct, stone: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-2 text-sm italic outline-none focus:border-primary" placeholder="Emerald..." />
                                </div>
                                <div className="space-y-4">
                                    <label className="font-label text-[9px] uppercase tracking-widest opacity-40">Net Weight</label>
                                    <input type="text" value={currentProduct.weight} onChange={(e) => setCurrentProduct({ ...currentProduct, weight: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-2 text-sm italic outline-none focus:border-primary" placeholder="14.5g..." />
                                </div>
                                <div className="space-y-4">
                                    <label className="font-label text-[9px] uppercase tracking-widest opacity-40">Archival Length</label>
                                    <input type="text" value={currentProduct.length} onChange={(e) => setCurrentProduct({ ...currentProduct, length: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-2 text-sm italic outline-none focus:border-primary" placeholder="18-inch..." />
                                </div>
                                <div className="space-y-4">
                                    <label className="font-label text-[9px] uppercase tracking-widest opacity-40">Vault Stock</label>
                                    <input type="number" value={currentProduct.stock} onChange={(e) => setCurrentProduct({ ...currentProduct, stock: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-2 text-sm font-black outline-none focus:border-primary" />
                                </div>
                                <div className="flex items-end pb-2 gap-4">
                                    <label className="font-label text-[9px] uppercase tracking-widest opacity-40">Curated Hero</label>
                                    <input type="checkbox" checked={currentProduct.isHero} onChange={(e) => setCurrentProduct({ ...currentProduct, isHero: e.target.checked })} className="w-4 h-4 accent-primary" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                                {[0, 1, 2, 3, 4].map((idx) => {
                                    const isMain = idx === 0;
                                    const url = isMain ? currentProduct.img : (currentProduct.images && currentProduct.images[idx - 1]);
                                    return (
                                        <div key={idx} className="aspect-[4/5] border border-dashed border-primary/20 bg-primary/5 flex flex-col items-center justify-center relative overflow-hidden group">
                                            {url ? (
                                                <>
                                                    <img src={url} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (isMain) setCurrentProduct({ ...currentProduct, img: '' });
                                                            else {
                                                                const newImgs = [...currentProduct.images];
                                                                newImgs.splice(idx - 1, 1);
                                                                setCurrentProduct({ ...currentProduct, images: newImgs });
                                                            }
                                                        }}
                                                        className="absolute top-2 right-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">close</span>
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 opacity-30">
                                                    <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                                                    <span className="text-[8px] uppercase tracking-widest font-black">Archive</span>
                                                </div>
                                            )}
                                            {uploadingIdx === (isMain ? 'main' : idx - 1) && <div className="absolute inset-0 bg-white/80 flex items-center justify-center animate-spin z-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>}
                                            <input type="file" onChange={(e) => handleFileUpload(e, isMain ? null : idx - 1)} className="absolute inset-0 opacity-0 cursor-pointer z-5" />
                                        </div>
                                    )
                                })}
                            </div>

                            <textarea required value={currentProduct.details} onChange={(e) => setCurrentProduct({ ...currentProduct, details: e.target.value })} className="w-full bg-surface-container-low border border-black/5 p-6 text-sm italic min-h-[120px] outline-none focus:border-primary" placeholder="Describe the craftsmanship..." />

                            <div className="flex justify-end gap-6 pt-8 border-t border-black/10">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 font-label text-[10px] uppercase font-black opacity-40">Cancel</button>
                                <button type="submit" disabled={!!uploadingIdx} className="bg-primary text-on-primary px-16 py-5 font-label text-[10px] uppercase tracking-[0.3em] font-black shadow-lux hover:bg-primary-dim transition-all">Verify & Catalog</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )

    const renderPromoModal = () => (
        <AnimatePresence>
            {isPromoModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPromoModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-[#fffcf7] shadow-lux border border-outline-variant/10 p-8 md:p-16">
                        <h2 className="font-headline text-4xl italic mb-12">Engrave Artisanal Code</h2>
                        <form onSubmit={handleSavePromo} className="space-y-12">
                            <div className="space-y-8">
                                <div className="group">
                                    <label className="font-label text-[9px] uppercase tracking-widest font-black opacity-40">Artisanal Code</label>
                                    <input required type="text" value={currentPromo.code} onChange={(e) => setCurrentPromo({ ...currentPromo, code: e.target.value.toUpperCase() })} className="w-full bg-transparent border-b border-black/10 py-3 font-headline text-3xl italic outline-none focus:border-primary" placeholder="e.g. SOLSTICE24" />
                                </div>

                                <div className="grid grid-cols-2 gap-12">
                                    <div className="group">
                                        <label className="font-label text-[9px] uppercase tracking-widest font-black opacity-40">Discount (%)</label>
                                        <input required type="number" value={currentPromo.discount} onChange={(e) => setCurrentPromo({ ...currentPromo, discount: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-3 font-headline text-2xl outline-none focus:border-primary" />
                                    </div>
                                    <div className="group">
                                        <label className="font-label text-[9px] uppercase tracking-widest font-black opacity-40">Usage Limit</label>
                                        <input required type="number" value={currentPromo.limit} onChange={(e) => setCurrentPromo({ ...currentPromo, limit: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-3 font-headline text-2xl outline-none focus:border-primary" />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="font-label text-[9px] uppercase tracking-widest font-black opacity-40">Expiration Date (Optional)</label>
                                    <input type="date" value={currentPromo.expiryDate} onChange={(e) => setCurrentPromo({ ...currentPromo, expiryDate: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-3 font-label text-[12px] uppercase outline-none focus:border-primary" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-6 pt-8 border-t border-black/10">
                                <button type="button" onClick={() => setIsPromoModalOpen(false)} className="px-8 font-label text-[10px] uppercase font-black opacity-40 hover:opacity-100 transition-all">Cancel</button>
                                <button type="submit" disabled={isSavingPromo} className="bg-primary text-on-primary px-16 py-5 font-label text-[10px] uppercase tracking-[0.3em] font-black shadow-lux hover:bg-primary-dim transition-all">
                                    {isSavingPromo ? 'Securing Registry...' : 'Authorize Code'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )

    const tabs = [
        { id: 'dashboard', name: 'Main', icon: 'grid_view' },
        { id: 'products', name: 'Pieces', icon: 'inventory' },
        { id: 'orders', name: 'Orders', icon: 'shopping_cart' },
        { id: 'abandoned', name: 'Abandoned', icon: 'shopping_basket' },
        { id: 'promos', name: 'Promos', icon: 'sell' },
        { id: 'customers', name: 'Clients', icon: 'diversity_1' },
        { id: 'settings', name: 'Settings', icon: 'settings' }
    ];



    return (
        <div className="flex flex-col lg:flex-row bg-[#fffcf7] min-h-screen selection:bg-primary-container">
            {renderInventoryModal()}
            {renderOrderModal()}
            {renderCustomerModal()}
            {renderPromoModal()}



            <aside className="lg:w-80 lg:fixed lg:h-screen border-r border-black/5 flex flex-col pt-44 bg-white/40 backdrop-blur-3xl">
                <div className="px-12 mb-20">
                    <h1 className="font-headline text-5xl italic font-light opacity-85">Admin Control</h1>
                </div>
                <nav className="flex flex-col px-8 space-y-3">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-6 px-8 py-5 transition-all ${activeTab === tab.id ? 'bg-primary text-on-primary shadow-lux scale-[1.02]' : 'hover:bg-black/5'}`}>
                            <span className="material-symbols-outlined">{tab.icon}</span>
                            <span className="font-label text-[10px] uppercase tracking-[0.3em] font-black">{tab.name}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            <main className="flex-1 lg:ml-80 pt-44 pb-32 px-16 lg:px-24">
                <div className="max-w-[1400px] mx-auto">
                    {loading ? (
                        <div className="py-32 text-center opacity-40 font-label text-[14px] uppercase tracking-widest italic animate-pulse">Consulting the Ledger...</div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {activeTab === 'dashboard' && renderDashboard()}
                            {activeTab === 'products' && renderPieceManager()}
                            {activeTab === 'orders' && renderOrders()}
                            {activeTab === 'abandoned' && renderAbandonedCarts()}
                            {activeTab === 'customers' && renderCustomers()}
                            {activeTab === 'promos' && renderPromos()}
                            {activeTab === 'settings' && renderSettings()}
                        </AnimatePresence>
                    )}
                </div>
            </main>
        </div>
    )
}

export default Admin
