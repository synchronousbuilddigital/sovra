import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { useShop } from '../context/ShopContext'
import api from '../utils/api'
import { formatPrice } from '../utils/currency'
import Skeleton from '../components/Skeleton'
import {
    LayoutDashboard, ShoppingBag, MapPin, Heart, User, ShieldCheck,
    LogOut, Plus, Search, Eye, Edit3, Trash2, ExternalLink, FileText,
    CheckCircle2, AlertCircle, ArrowUpRight, RotateCcw,
    Check, X, ChevronRight, ArrowRight, Sparkles, Gem, Clock,
    CreditCard, Calendar, Mail, Phone, Lock, Filter, Package,
    ShoppingBag as CartIcon
} from 'lucide-react'

const Account = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { wishlist, removeFromWishlist, refreshProfile, logout, addToCart } = useShop()

    const [userInfo, setUserInfo] = useState(
        localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null
    )
    const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'dashboard')

    useEffect(() => {
        if (location.state?.activeTab) {
            setActiveTab(location.state.activeTab)
        }
    }, [location.state])

    // Profile States
    const [profileName, setProfileName] = useState(userInfo?.name || '')
    const [profileEmail, setProfileEmail] = useState(userInfo?.email || '')
    const [profilePhone, setProfilePhone] = useState(userInfo?.phone || '')
    const [profilePref, setProfilePref] = useState(userInfo?.preference || 'General')
    const [newsletter, setNewsletter] = useState(userInfo?.newsletter || false)
    const [savingProfile, setSavingProfile] = useState(false)

    // Security States
    const [password, setPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [savingPassword, setSavingPassword] = useState(false)

    // Orders States
    const [myOrders, setMyOrders] = useState([])
    const [ordersLoading, setOrdersLoading] = useState(true)
    const [orderSearch, setOrderSearch] = useState('')
    const [orderStatusFilter, setOrderStatusFilter] = useState('All')

    // Address Book States
    const [addresses, setAddresses] = useState([])
    const [addressesLoading, setAddressesLoading] = useState(false)
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [editingAddress, setEditingAddress] = useState(null)
    const [addrName, setAddrName] = useState('')
    const [addrStreet, setAddrStreet] = useState('')
    const [addrCity, setAddrCity] = useState('')
    const [addrZip, setAddrZip] = useState('')
    const [addrCountry, setAddrCountry] = useState('India')
    const [addrIsDefault, setAddrIsDefault] = useState(false)
    const [savingAddress, setSavingAddress] = useState(false)

    // Return Request States
    const [showReturnModal, setShowReturnModal] = useState(false)
    const [selectedReturnOrder, setSelectedReturnOrder] = useState(null)
    const [returnReason, setReturnReason] = useState('Artisanal Defect')
    const [returnDetails, setReturnDetails] = useState('')
    const [submittingReturn, setSubmittingReturn] = useState(false)

    useEffect(() => {
        const fetchMyOrders = async () => {
            try {
                setOrdersLoading(true)
                const { data } = await api.get('/orders/myorders')
                setMyOrders(data || [])
            } catch (error) {
                console.error('Failed to fetch orders:', error)
            } finally {
                setOrdersLoading(false)
            }
        }
        fetchMyOrders()
    }, [])

    useEffect(() => {
        if (activeTab === 'addresses' || activeTab === 'dashboard') {
            fetchAddresses()
        }
    }, [activeTab])

    const fetchAddresses = async () => {
        try {
            setAddressesLoading(true)
            const { data } = await api.get('/users/addresses')
            setAddresses(data || [])
        } catch (error) {
            console.error('Failed to fetch addresses:', error)
        } finally {
            setAddressesLoading(false)
        }
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        try {
            setSavingProfile(true)
            const { data } = await api.put('/users/profile', {
                name: profileName,
                email: profileEmail,
                phone: profilePhone,
                preference: profilePref,
                newsletter: newsletter
            })

            const updated = { ...userInfo, ...data }
            localStorage.setItem('userInfo', JSON.stringify(updated))
            setUserInfo(updated)
            refreshProfile()
            toast.success('Profile updated successfully.')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile.')
        } finally {
            setSavingProfile(false)
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            return toast.error('New passwords do not match.')
        }
        if (newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters.')
        }
        try {
            setSavingPassword(true)
            await api.put('/users/profile', { password: newPassword })
            toast.success('Password updated successfully.')
            setPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update password.')
        } finally {
            setSavingPassword(false)
        }
    }

    const handleAddressSubmit = async (e) => {
        e.preventDefault()
        try {
            setSavingAddress(true)
            const addressData = {
                addressName: addrName,
                address: addrStreet,
                city: addrCity,
                postalCode: addrZip,
                country: addrCountry,
                isDefault: addrIsDefault
            }

            if (editingAddress) {
                await api.put(`/users/addresses/${editingAddress._id}`, addressData)
                toast.success('Address updated successfully.')
            } else {
                await api.post('/users/addresses', addressData)
                toast.success('Address saved successfully.')
            }

            setShowAddressForm(false)
            setEditingAddress(null)
            resetAddressForm()
            fetchAddresses()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save address.')
        } finally {
            setSavingAddress(false)
        }
    }

    const deleteAddressHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            try {
                await api.delete(`/users/addresses/${id}`)
                toast.info('Address removed.')
                fetchAddresses()
            } catch (error) {
                toast.error('Failed to remove address.')
            }
        }
    }

    const editAddressHandler = (addr) => {
        setEditingAddress(addr)
        setAddrName(addr.addressName || '')
        setAddrStreet(addr.address || '')
        setAddrCity(addr.city || '')
        setAddrZip(addr.postalCode || '')
        setAddrCountry(addr.country || 'India')
        setAddrIsDefault(Boolean(addr.isDefault))
        setShowAddressForm(true)
    }

    const resetAddressForm = () => {
        setAddrName('')
        setAddrStreet('')
        setAddrCity('')
        setAddrZip('')
        setAddrCountry('India')
        setAddrIsDefault(false)
    }

    const handleReturnSubmit = async (e) => {
        e.preventDefault()
        try {
            setSubmittingReturn(true)
            await api.post(`/orders/${selectedReturnOrder._id}/return`, {
                reason: returnReason,
                details: returnDetails
            })
            toast.success('Return request submitted successfully.')
            setShowReturnModal(false)
            const { data } = await api.get('/orders/myorders')
            setMyOrders(data || [])
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit return request.')
        } finally {
            setSubmittingReturn(false)
        }
    }

    // Filtered orders for Order History tab
    const filteredOrders = useMemo(() => {
        return myOrders.filter(order => {
            const matchesSearch =
                order._id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                order.orderItems?.some(item => item.name?.toLowerCase().includes(orderSearch.toLowerCase()))

            const matchesStatus =
                orderStatusFilter === 'All' ||
                (orderStatusFilter === 'Delivered' && order.status === 'Delivered') ||
                (orderStatusFilter === 'Shipped' && order.status === 'Shipped') ||
                (orderStatusFilter === 'Return Requested' && order.status === 'Return Requested') ||
                (orderStatusFilter === 'Pending' && (!order.status || order.status === 'Pending' || order.status === 'Processing'))

            return matchesSearch && matchesStatus
        })
    }, [myOrders, orderSearch, orderStatusFilter])

    if (!userInfo) return null

    // Navigation Tabs Configuration (Styled exactly as in Admin.jsx)
    const tabs = [
        { id: 'dashboard', name: 'Overview', icon: LayoutDashboard },
        { id: 'orders', name: 'My Orders', icon: ShoppingBag, count: myOrders.length },
        { id: 'addresses', name: 'Saved Addresses', icon: MapPin, count: addresses.length },
        { id: 'wishlist', name: 'Wishlist', icon: Heart, count: wishlist.length },
        { id: 'details', name: 'Personal Details', icon: User },
        { id: 'password', name: 'Security & Access', icon: ShieldCheck }
    ]

    const userInitial = userInfo.name ? userInfo.name.trim().charAt(0).toUpperCase() : 'U'
    const defaultAddress = addresses.find(a => a.isDefault) || addresses[0]

    // Render Panels
    const renderDashboard = () => {
        const statCards = [
            {
                label: 'Total Purchases',
                value: `${myOrders.length} ${myOrders.length === 1 ? 'Order' : 'Orders'}`,
                icon: ShoppingBag,
                iconBg: 'bg-[#6e5b44]/10 text-[#6e5b44]',
                trend: myOrders.length > 0 ? 'Active Buyer' : 'New Member',
                trendColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                subtext: myOrders.length > 0 ? `Latest: #${myOrders[0]._id.slice(-6)}` : 'Ready for your first piece'
            },
            {
                label: 'Curated Wishlist',
                value: `${wishlist.length} ${wishlist.length === 1 ? 'Piece' : 'Pieces'}`,
                icon: Heart,
                iconBg: 'bg-rose-500/10 text-rose-700',
                trend: wishlist.length > 0 ? 'Saved Vault' : 'Empty',
                trendColor: wishlist.length > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-stone-50 text-stone-600 border-stone-200',
                subtext: 'Handpicked jewelry favorites'
            }
        ]

        return (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-[#111110]/8">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="font-sans text-[10px] tracking-[0.25em] uppercase font-bold text-emerald-700">Client Vault Active</span>
                        </div>
                        <h1 className="font-plex text-3xl md:text-4xl text-[#111110] font-light">
                            Welcome Back, <span className="font-normal">{userInfo.name?.split(' ')[0]}</span>
                        </h1>
                        <p className="font-sans text-xs text-[#7a7670] mt-1">Review your recent orders, curated wishlist, delivery addresses, and personal profile</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/shop"
                            className="bg-[#111110] text-[#fffcf7] hover:bg-[#6e5b44] transition-all px-5 py-2.5 rounded-xl font-sans text-xs tracking-wider uppercase font-bold flex items-center gap-2 shadow-sm active:scale-98"
                        >
                            <CartIcon size={15} />
                            <span>Explore Store</span>
                        </Link>
                    </div>
                </div>

                {/* 2 Precision Metric Cards */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-5">
                    {statCards.map((stat) => {
                        const Icon = stat.icon
                        return (
                            <div
                                key={stat.label}
                                className="bg-white rounded-2xl p-3.5 sm:p-5 border border-[#111110]/8 shadow-[0_4px_20px_rgba(110,91,68,0.05)] hover:shadow-[0_8px_30px_rgba(110,91,68,0.1)] transition-all duration-300 flex flex-col justify-between"
                            >
                                <div className="flex justify-between items-start mb-2.5 sm:mb-4">
                                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center ${stat.iconBg}`}>
                                        <Icon size={18} className="sm:w-5 sm:h-5" strokeWidth={1.8} />
                                    </div>
                                    <span className={`font-sans text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 rounded-full border ${stat.trendColor} truncate max-w-[85px] sm:max-w-none`}>
                                        {stat.trend}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[#7a7670] font-bold mb-0.5 sm:mb-1 truncate">{stat.label}</p>
                                    <h3 className="font-plex text-lg sm:text-2xl md:text-3xl font-light text-[#111110] tracking-tight mb-1 sm:mb-2">{stat.value}</h3>
                                    <p className="font-sans text-[10px] sm:text-[11px] text-[#7a7670]/80 font-medium border-t border-[#111110]/5 pt-1.5 sm:pt-2 flex items-center justify-between">
                                        <span className="truncate">{stat.subtext}</span>
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Recent Purchases Section */}
                <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl border border-[#111110]/8 shadow-[0_4px_20px_rgba(110,91,68,0.05)]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 pb-4 border-b border-[#111110]/5">
                        <div>
                            <h2 className="font-plex text-2xl text-[#111110]">Recent Purchases</h2>
                            <p className="font-sans text-xs text-[#7a7670]">Latest acquisitions from the SOVRA atelier</p>
                        </div>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className="font-sans text-xs font-bold text-primary hover:text-[#111110] flex items-center gap-1.5 transition-colors uppercase tracking-wider"
                        >
                            <span>View All Orders</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>

                    {ordersLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex justify-between items-center p-4 bg-stone-50/60 rounded-xl">
                                    <div className="flex gap-4 items-center">
                                        <Skeleton width="56px" height="56px" className="rounded-lg" />
                                        <div className="space-y-2">
                                            <Skeleton width="140px" height="14px" />
                                            <Skeleton width="180px" height="10px" />
                                        </div>
                                    </div>
                                    <Skeleton width="90px" height="24px" className="rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : myOrders.length === 0 ? (
                        <div className="py-16 text-center border border-dashed border-[#111110]/10 rounded-2xl bg-[#fffcf7]/60">
                            <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                            <h3 className="font-plex text-xl text-stone-700 mb-1">No Orders Recorded Yet</h3>
                            <p className="font-sans text-xs text-stone-400 mb-5 max-w-sm mx-auto">Explore our exclusive collections and start curating your personal archive today.</p>
                            <Link
                                to="/shop"
                                className="inline-flex items-center gap-2 bg-[#111110] text-[#fffcf7] hover:bg-primary transition-all px-6 py-2.5 rounded-xl font-sans text-xs uppercase tracking-wider font-bold shadow-sm"
                            >
                                <span>Browse Shop</span>
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-stone-100">
                            {myOrders.slice(0, 3).map(order => (
                                <div
                                    key={order._id}
                                    onClick={() => navigate(`/order/${order._id}`)}
                                    className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-stone-50/70 p-3 rounded-xl transition-all cursor-pointer group"
                                >
                                    <div className="flex gap-4 items-center">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-black/5">
                                            <img
                                                src={order.orderItems?.[0]?.image}
                                                alt={order.orderItems?.[0]?.name || 'Product'}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-mono text-[10px] text-stone-400 font-semibold">#{order._id.slice(-6).toUpperCase()}</span>
                                                <span className="text-stone-300">•</span>
                                                <span className="font-sans text-[11px] text-stone-500">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                            <h4 className="font-plex text-base text-stone-900 group-hover:text-primary transition-colors">
                                                {order.orderItems?.[0]?.name}
                                                {order.orderItems?.length > 1 && (
                                                    <span className="font-sans text-xs text-stone-500 font-normal ml-1">+{order.orderItems.length - 1} more</span>
                                                )}
                                            </h4>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 self-end sm:self-center">
                                        <div className="text-right">
                                            <p className="font-plex text-lg text-stone-900 font-light">{formatPrice(order.totalPrice)}</p>
                                            <span className={`inline-block font-sans text-[9px] uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full border ${
                                                order.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                order.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                order.status === 'Return Requested' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                'bg-stone-100 text-stone-700 border-stone-200'
                                            }`}>
                                                {order.status === 'Cancelled' ? 'Cancelled' : (order.status || (order.isPaid ? 'Paid' : 'Pending Payment'))}
                                            </span>
                                        </div>
                                        <ChevronRight size={18} className="text-stone-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 2-Column Split: Personal Details & Curated Wishlist Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Personal Details Snapshot */}
                    <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-[#111110]/8 shadow-[0_4px_20px_rgba(110,91,68,0.05)] flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center pb-4 mb-6 border-b border-[#111110]/5">
                                <div>
                                    <h3 className="font-plex text-2xl text-[#111110]">Profile Snapshot</h3>
                                    <p className="font-sans text-xs text-[#7a7670]">Personal information & preferences</p>
                                </div>
                                <button
                                    onClick={() => setActiveTab('details')}
                                    className="p-2 text-stone-500 hover:text-primary hover:bg-stone-100 rounded-xl transition-all"
                                    title="Edit Profile"
                                >
                                    <Edit3 size={16} />
                                </button>
                            </div>

                            <div className="space-y-4 font-sans text-xs">
                                <div className="flex justify-between items-center py-2.5 border-b border-stone-100">
                                    <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px]">Client Name</span>
                                    <span className="font-semibold text-stone-800">{userInfo.name}</span>
                                </div>
                                <div className="flex justify-between items-center py-2.5 border-b border-stone-100">
                                    <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px]">Email Address</span>
                                    <span className="font-mono text-stone-700">{userInfo.email}</span>
                                </div>
                                <div className="flex justify-between items-center py-2.5 border-b border-stone-100">
                                    <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px]">Contact Phone</span>
                                    <span className="font-mono text-stone-700">{userInfo.phone || 'Not Registered'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2.5 border-b border-stone-100">
                                    <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px]">Shopping Preference</span>
                                    <span className="font-semibold text-stone-800">{userInfo.preference || 'All Jewelry'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2.5">
                                    <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px]">VIP Newsletter</span>
                                    <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${userInfo.newsletter ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-stone-100 text-stone-600'}`}>
                                        {userInfo.newsletter ? 'Subscribed' : 'Not Subscribed'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-stone-100 flex items-center justify-between">
                            <button
                                onClick={() => setActiveTab('details')}
                                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 py-2.5 rounded-xl font-sans text-xs uppercase tracking-wider font-bold transition-all text-center"
                            >
                                Edit Profile Details
                            </button>
                        </div>
                    </div>

                    {/* Right: Curated Wishlist Preview */}
                    <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-[#111110]/8 shadow-[0_4px_20px_rgba(110,91,68,0.05)] flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center pb-4 mb-6 border-b border-[#111110]/5">
                                <div>
                                    <h3 className="font-plex text-2xl text-[#111110]">Curated Wishlist</h3>
                                    <p className="font-sans text-xs text-[#7a7670]">Saved pieces in your private vault</p>
                                </div>
                                <span className="font-sans text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                    {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}
                                </span>
                            </div>

                            {wishlist.length === 0 ? (
                                <div className="py-12 text-center border border-dashed border-stone-200 rounded-xl bg-stone-50/50">
                                    <Heart className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                                    <p className="font-sans text-xs text-stone-500 mb-3">No saved favorites in your wishlist yet.</p>
                                    <Link to="/shop" className="text-primary font-bold text-xs uppercase tracking-wider hover:underline">
                                        Explore Designs →
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-3 gap-3">
                                    {wishlist.slice(0, 3).map((item) => (
                                        <div
                                            key={item._id}
                                            onClick={() => navigate(`/product/${item._id}`)}
                                            className="group relative aspect-square rounded-xl overflow-hidden bg-stone-100 cursor-pointer border border-black/5"
                                        >
                                            <img
                                                src={item.images?.[0] || item.img || item.image}
                                                alt={item.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end">
                                                <p className="text-white text-[10px] font-sans font-bold truncate">{item.name}</p>
                                                <p className="text-amber-200 text-[9px] font-mono">{formatPrice(item.price || 0)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="pt-6 mt-6 border-t border-stone-100">
                            <button
                                onClick={() => setActiveTab('wishlist')}
                                className="w-full bg-primary text-white hover:bg-primary/90 py-2.5 rounded-xl font-sans text-xs uppercase tracking-wider font-bold transition-all shadow-sm"
                            >
                                View Complete Wishlist
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        )
    }

    const renderOrders = () => {
        return (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-[#111110]/8">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <span className="font-sans text-[10px] tracking-[0.25em] uppercase font-bold text-primary">Orders Archive</span>
                        </div>
                        <h1 className="font-plex text-3xl md:text-4xl text-[#111110] font-light">My Order History</h1>
                        <p className="font-sans text-xs text-[#7a7670] mt-1">Track and review all purchases, logistical status, invoices, and returns</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            to="/shop"
                            className="bg-[#111110] text-[#fffcf7] hover:bg-[#6e5b44] transition-all px-5 py-2.5 rounded-xl font-sans text-xs tracking-wider uppercase font-bold flex items-center gap-2 shadow-sm"
                        >
                            <Plus size={15} />
                            <span>New Order</span>
                        </Link>
                    </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="bg-white p-4 rounded-2xl border border-[#111110]/8 shadow-sm flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                            type="text"
                            placeholder="Search by Order ID or item title..."
                            value={orderSearch}
                            onChange={(e) => setOrderSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-sans text-stone-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        {orderSearch && (
                            <button onClick={() => setOrderSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {['All', 'Delivered', 'Shipped', 'Return Requested', 'Pending'].map(status => (
                            <button
                                key={status}
                                onClick={() => setOrderStatusFilter(status)}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-sans font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                                    orderStatusFilter === status
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Orders Content */}
                {ordersLoading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-stone-200/60 shadow-sm space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-stone-100">
                                    <Skeleton width="180px" height="18px" />
                                    <Skeleton width="100px" height="24px" className="rounded-full" />
                                </div>
                                <div className="flex gap-4 items-center">
                                    <Skeleton width="80px" height="80px" className="rounded-xl" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton width="220px" height="16px" />
                                        <Skeleton width="140px" height="12px" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white py-20 px-6 rounded-2xl border border-dashed border-stone-200 text-center">
                        <ShoppingBag className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                        <h3 className="font-plex text-2xl text-stone-800 mb-2">No Matching Orders</h3>
                        <p className="font-sans text-xs text-stone-500 max-w-md mx-auto mb-6">
                            {orderSearch || orderStatusFilter !== 'All'
                                ? 'No orders found matching your search and filter criteria.'
                                : 'You have not placed any orders yet. Discover our collection of timeless fine jewelry.'}
                        </p>
                        {orderSearch || orderStatusFilter !== 'All' ? (
                            <button
                                onClick={() => { setOrderSearch(''); setOrderStatusFilter('All'); }}
                                className="px-5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-sans font-bold uppercase tracking-wider"
                            >
                                Clear Filters
                            </button>
                        ) : (
                            <Link
                                to="/shop"
                                className="inline-flex items-center gap-2 bg-[#111110] text-[#fffcf7] hover:bg-primary px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-sm transition-all"
                            >
                                <span>Explore Catalog</span>
                                <ArrowRight size={14} />
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {filteredOrders.map(order => (
                            <div
                                key={order._id}
                                className="bg-white rounded-2xl border border-[#111110]/8 shadow-[0_4px_20px_rgba(110,91,68,0.05)] hover:shadow-[0_8px_30px_rgba(110,91,68,0.1)] transition-all duration-300 overflow-hidden"
                            >
                                {/* Top bar */}
                                <div className="bg-stone-50/70 px-4 py-3 sm:px-6 sm:py-4 border-b border-stone-200/60 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                                    <div className="flex flex-wrap items-center gap-4 text-xs font-sans">
                                        <div>
                                            <span className="text-stone-400 block text-[9px] uppercase tracking-wider font-bold">Order ID</span>
                                            <span className="font-mono font-bold text-stone-900">#{order._id.slice(-8).toUpperCase()}</span>
                                        </div>
                                        <div className="h-6 w-px bg-stone-200 hidden sm:block" />
                                        <div>
                                            <span className="text-stone-400 block text-[9px] uppercase tracking-wider font-bold">Date Placed</span>
                                            <span className="text-stone-700 font-medium">
                                                {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                        <div className="h-6 w-px bg-stone-200 hidden sm:block" />
                                        <div>
                                            <span className="text-stone-400 block text-[9px] uppercase tracking-wider font-bold">Total Amount</span>
                                            <span className="font-plex text-stone-900 font-bold">{formatPrice(order.totalPrice)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className={`font-sans text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border ${
                                            order.status === 'Cancelled' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                            order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            order.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            order.status === 'Return Requested' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                            'bg-stone-100 text-stone-700 border-stone-200'
                                        }`}>
                                            {order.status === 'Cancelled' ? 'Cancelled' : (order.status || (order.isPaid ? 'Paid' : 'Pending Payment'))}
                                        </span>
                                    </div>
                                </div>

                                {/* Order Items Body */}
                                <div className="p-4 sm:p-6">
                                    <div className="space-y-4">
                                        {order.orderItems?.map((item, idx) => (
                                            <div key={idx} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2 border-b border-stone-100 last:border-b-0">
                                                <div className="flex gap-4 items-center">
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-black/5">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-plex text-base text-stone-900">{item.name}</h4>
                                                        <p className="font-sans text-xs text-stone-500">
                                                            Qty: <span className="font-bold text-stone-700">{item.qty || 1}</span> • Price: <span className="font-mono text-stone-700">{formatPrice(item.price)}</span>
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 self-end sm:self-center">
                                                    {item.product && (
                                                        <Link
                                                            to={`/product/${item.product}`}
                                                            className="text-stone-500 hover:text-primary text-xs font-sans font-bold uppercase tracking-wider p-2 hover:bg-stone-100 rounded-lg transition-all"
                                                        >
                                                            View Piece
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Logistics / Tracking details */}
                                    {order.trackingNumber ? (
                                        <div className="mt-4 p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl flex items-center gap-2.5 text-xs font-sans text-blue-900">
                                            <Package size={17} className="text-blue-600 flex-shrink-0" />
                                            <div>
                                                <span className="font-semibold text-blue-950 block">Shipment Dispatched via {order.carrier || 'Express Courier'}</span>
                                                <span className="text-stone-600 font-mono text-[11px]">AWB / Tracking Number: <strong className="text-stone-900">{order.trackingNumber}</strong></span>
                                            </div>
                                        </div>
                                    ) : order.status !== 'Cancelled' ? (
                                        <div className="mt-4 px-3.5 py-2.5 bg-stone-50 border border-stone-200/60 rounded-xl flex items-center justify-between text-xs font-sans text-stone-600">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-stone-400 flex-shrink-0" />
                                                <span>Status: <strong className="text-stone-900 font-semibold">{order.status || (order.isPaid ? 'Confirmed' : 'Pending Payment')}</strong> — Preparing for dispatch</span>
                                            </div>
                                            <span className="text-[11px] text-stone-400 font-medium">Tracking available once shipped</span>
                                        </div>
                                    ) : null}

                                    {/* Order Action Buttons */}
                                    <div className="mt-4 sm:mt-6 pt-4 border-t border-stone-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                                            <button
                                                onClick={() => navigate(`/order/${order._id}/invoice`)}
                                                className="flex-1 sm:flex-none justify-center px-4 py-2 bg-[#111110] hover:bg-stone-800 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
                                            >
                                                <FileText size={14} />
                                                <span>Print / View Invoice</span>
                                            </button>
                                        </div>

                                        {order.status === 'Delivered' && !order.returnRequest?.isRequested && (
                                            <button
                                                onClick={() => { setSelectedReturnOrder(order); setShowReturnModal(true); }}
                                                className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 border border-amber-300/40 rounded-xl text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all"
                                            >
                                                <RotateCcw size={14} />
                                                <span>Request Return</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        )
    }

    const renderAddresses = () => {
        return (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-[#111110]/8">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <span className="font-sans text-[10px] tracking-[0.25em] uppercase font-bold text-primary">Logistics Vault</span>
                        </div>
                        <h1 className="font-plex text-3xl md:text-4xl text-[#111110] font-light">Saved Addresses</h1>
                        <p className="font-sans text-xs text-[#7a7670] mt-1">Manage delivery destinations for swift and discreet courier fulfillment</p>
                    </div>
                    {!showAddressForm && (
                        <button
                            onClick={() => { resetAddressForm(); setEditingAddress(null); setShowAddressForm(true); }}
                            className="bg-[#111110] text-[#fffcf7] hover:bg-[#6e5b44] transition-all px-5 py-2.5 rounded-xl font-sans text-xs tracking-wider uppercase font-bold flex items-center gap-2 shadow-sm"
                        >
                            <Plus size={15} />
                            <span>Add Address</span>
                        </button>
                    )}
                </div>

                {/* Address Form Card */}
                {showAddressForm ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-[#111110]/8 shadow-[0_4px_20px_rgba(110,91,68,0.05)]"
                    >
                        <div className="flex justify-between items-center pb-4 mb-6 border-b border-stone-100">
                            <div>
                                <h3 className="font-plex text-2xl text-[#111110]">{editingAddress ? 'Edit Address' : 'New Delivery Address'}</h3>
                                <p className="font-sans text-xs text-stone-500">Enter accurate shipping information for secure delivery</p>
                            </div>
                            <button
                                onClick={() => setShowAddressForm(false)}
                                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleAddressSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">Address Label</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Home, Studio, Executive Office"
                                    value={addrName}
                                    onChange={e => setAddrName(e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-1.5">
                                <label className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">Street Address</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Flat / Villa number, street, locality"
                                    value={addrStreet}
                                    onChange={e => setAddrStreet(e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">City</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Mumbai, New Delhi, Bengaluru"
                                    value={addrCity}
                                    onChange={e => setAddrCity(e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">Postal Code / PIN</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. 400001"
                                    value={addrZip}
                                    onChange={e => setAddrZip(e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-1.5">
                                <label className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">Country</label>
                                <input
                                    required
                                    type="text"
                                    value={addrCountry}
                                    onChange={e => setAddrCountry(e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                />
                            </div>

                            <div className="md:col-span-2 flex items-center gap-3 py-2">
                                <input
                                    type="checkbox"
                                    id="defaultAddrCheck"
                                    checked={addrIsDefault}
                                    onChange={e => setAddrIsDefault(e.target.checked)}
                                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                                />
                                <label htmlFor="defaultAddrCheck" className="font-sans text-xs font-bold text-stone-700 cursor-pointer">
                                    Set as default shipping address
                                </label>
                            </div>

                            <div className="md:col-span-2 pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddressForm(false)}
                                    className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={savingAddress}
                                    className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-50"
                                >
                                    {savingAddress ? 'Saving Address...' : (editingAddress ? 'Update Address' : 'Save Address')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                ) : null}

                {/* Addresses Grid */}
                {addressesLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2].map(i => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-stone-200/60 shadow-sm space-y-4">
                                <Skeleton width="120px" height="16px" />
                                <Skeleton width="220px" height="40px" />
                                <Skeleton width="100px" height="24px" />
                            </div>
                        ))}
                    </div>
                ) : addresses.length === 0 && !showAddressForm ? (
                    <div className="bg-white py-20 px-6 rounded-2xl border border-dashed border-stone-200 text-center">
                        <MapPin className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                        <h3 className="font-plex text-2xl text-stone-800 mb-2">No Saved Addresses</h3>
                        <p className="font-sans text-xs text-stone-500 max-w-md mx-auto mb-6">Save delivery destinations to expedite future checkouts and enjoy priority courier service.</p>
                        <button
                            onClick={() => setShowAddressForm(true)}
                            className="inline-flex items-center gap-2 bg-[#111110] text-[#fffcf7] hover:bg-primary px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-sm transition-all"
                        >
                            <Plus size={15} />
                            <span>Add First Address</span>
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map(addr => (
                            <div
                                key={addr._id}
                                className="bg-white rounded-2xl p-4 sm:p-6 border border-[#111110]/8 shadow-[0_4px_20px_rgba(110,91,68,0.05)] hover:shadow-[0_8px_30px_rgba(110,91,68,0.1)] transition-all flex flex-col justify-between relative group"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                                <MapPin size={16} />
                                            </span>
                                            <span className="font-sans text-xs uppercase tracking-wider font-bold text-stone-900">
                                                {addr.addressName || 'Address'}
                                            </span>
                                        </div>
                                        {addr.isDefault && (
                                            <span className="font-sans text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                                Default
                                            </span>
                                        )}
                                    </div>

                                    <div className="space-y-1 font-sans text-xs text-stone-600 pl-10 mb-6">
                                        <p className="font-bold text-stone-900">{userInfo.name}</p>
                                        <p>{addr.address}</p>
                                        <p>{addr.city}, {addr.postalCode}</p>
                                        <p>{addr.country}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                                    <button
                                        onClick={() => editAddressHandler(addr)}
                                        className="text-stone-500 hover:text-primary text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                                    >
                                        <Edit3 size={14} />
                                        <span>Edit Details</span>
                                    </button>
                                    <button
                                        onClick={() => deleteAddressHandler(addr._id)}
                                        className="text-stone-400 hover:text-red-600 text-xs font-sans font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                                    >
                                        <Trash2 size={14} />
                                        <span>Remove</span>
                                    </button>
                                </div>
                            </div>
                        ))}

                        {/* Add Address Dashed Card */}
                        <div
                            onClick={() => { resetAddressForm(); setEditingAddress(null); setShowAddressForm(true); }}
                            className="border-2 border-dashed border-stone-200 hover:border-primary/50 hover:bg-stone-50/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[200px]"
                        >
                            <div className="w-12 h-12 rounded-2xl bg-stone-100 group-hover:bg-primary/10 text-stone-400 group-hover:text-primary flex items-center justify-center mb-3 transition-colors">
                                <Plus size={20} />
                            </div>
                            <span className="font-sans text-xs uppercase tracking-wider font-bold text-stone-700 group-hover:text-primary transition-colors">
                                Add Another Address
                            </span>
                            <span className="font-sans text-[11px] text-stone-400 mt-1">Configure an alternate shipping destination</span>
                        </div>
                    </div>
                )}
            </motion.div>
        )
    }

    const renderWishlist = () => {
        return (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-[#111110]/8">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <span className="font-sans text-[10px] tracking-[0.25em] uppercase font-bold text-rose-600">Curated Atelier</span>
                        </div>
                        <h1 className="font-plex text-3xl md:text-4xl text-[#111110] font-light">My Wishlist</h1>
                        <p className="font-sans text-xs text-[#7a7670] mt-1">Handpicked jewelry pieces saved in your personal archive</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-sans text-xs font-bold px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                            {wishlist.length} {wishlist.length === 1 ? 'Piece Saved' : 'Pieces Saved'}
                        </span>
                    </div>
                </div>

                {wishlist.length === 0 ? (
                    <div className="bg-white py-24 px-6 rounded-2xl border border-dashed border-stone-200 text-center">
                        <Heart className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                        <h3 className="font-plex text-2xl text-stone-800 mb-2">Your Wishlist is Empty</h3>
                        <p className="font-sans text-xs text-stone-500 max-w-md mx-auto mb-6">
                            Tap the heart icon on any jewelry design while exploring to save your favorites here.
                        </p>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 bg-[#111110] text-[#fffcf7] hover:bg-primary px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-sm transition-all"
                        >
                            <span>Explore Shop</span>
                            <ArrowRight size={14} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6">
                        {wishlist.map((item) => (
                            <div
                                key={item._id}
                                className="bg-white rounded-2xl border border-[#111110]/8 overflow-hidden shadow-[0_4px_20px_rgba(110,91,68,0.05)] hover:shadow-[0_8px_30px_rgba(110,91,68,0.1)] transition-all flex flex-col justify-between group"
                            >
                                <div className="relative aspect-square overflow-hidden bg-stone-100 cursor-pointer" onClick={() => navigate(`/product/${item._id}`)}>
                                    <img
                                        src={item.images?.[0] || item.img || item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeFromWishlist(item._id); }}
                                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-400 hover:text-red-500 flex items-center justify-center backdrop-blur-sm shadow-sm transition-all z-10"
                                        title="Remove from Wishlist"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>

                                <div className="p-4 flex flex-col flex-1 justify-between">
                                    <div className="mb-3">
                                        <span className="font-sans text-[9px] uppercase tracking-wider font-bold text-stone-400 block mb-1">
                                            {item.category || 'Fine Jewelry'}
                                        </span>
                                        <h4
                                            onClick={() => navigate(`/product/${item._id}`)}
                                            className="font-plex text-base text-stone-900 group-hover:text-primary transition-colors cursor-pointer truncate"
                                        >
                                            {item.name}
                                        </h4>
                                        <p className="font-plex text-lg text-stone-900 font-light mt-1">
                                            {formatPrice(item.price || 0)}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2 pt-2 border-t border-stone-100">
                                        <button
                                            onClick={() => navigate(`/product/${item._id}`)}
                                            className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 py-1.5 sm:py-2 rounded-xl text-[10px] font-sans font-bold uppercase tracking-wider transition-all text-center"
                                        >
                                            Details
                                        </button>
                                        <button
                                            onClick={() => addToCart(item._id, 1)}
                                            className="w-full bg-primary hover:bg-primary/90 text-white py-1.5 sm:py-2 rounded-xl text-[10px] font-sans font-bold uppercase tracking-wider transition-all text-center shadow-sm"
                                        >
                                            Add to Bag
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>
        )
    }

    const renderDetails = () => {
        return (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8 max-w-3xl">
                {/* Header Section */}
                <div className="pb-2 border-b border-[#111110]/8">
                    <div className="flex items-center gap-2.5 mb-1">
                        <span className="font-sans text-[10px] tracking-[0.25em] uppercase font-bold text-primary">Member Identity</span>
                    </div>
                    <h1 className="font-plex text-3xl md:text-4xl text-[#111110] font-light">Personal Details</h1>
                    <p className="font-sans text-xs text-[#7a7670] mt-1">Update your client records, communication preferences, and shopping profile</p>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-[#111110]/8 shadow-[0_4px_20px_rgba(110,91,68,0.05)]">
                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">Full Name</label>
                            <input
                                required
                                type="text"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">Email Address</label>
                            <input
                                required
                                type="email"
                                value={profileEmail}
                                onChange={(e) => setProfileEmail(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">Phone Number</label>
                            <input
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={profilePhone}
                                onChange={(e) => setProfilePhone(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">Jewelry Preferences</label>
                            <select
                                value={profilePref}
                                onChange={(e) => setProfilePref(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                            >
                                <option value="General">All Jewelry (Earrings, Necklaces, Rings, Bracelets)</option>
                                <option value="High Jewellery">Fine Tuscan Gold & Diamonds</option>
                                <option value="Timepieces">Watches & Timepieces</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-3 py-3 border-y border-stone-100">
                            <input
                                type="checkbox"
                                id="newsletterCheck"
                                checked={newsletter}
                                onChange={(e) => setNewsletter(e.target.checked)}
                                className="w-4 h-4 accent-primary rounded cursor-pointer"
                            />
                            <label htmlFor="newsletterCheck" className="font-sans text-xs font-bold text-stone-700 cursor-pointer">
                                Receive invitations to private showroom previews and private drop notifications
                            </label>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={savingProfile}
                                className="px-8 py-3 bg-[#111110] hover:bg-primary text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-50"
                            >
                                {savingProfile ? 'Saving Changes...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        )
    }

    const renderPassword = () => {
        return (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8 max-w-3xl">
                {/* Header Section */}
                <div className="pb-2 border-b border-[#111110]/8">
                    <div className="flex items-center gap-2.5 mb-1">
                        <span className="font-sans text-[10px] tracking-[0.25em] uppercase font-bold text-primary">Security & Access</span>
                    </div>
                    <h1 className="font-plex text-3xl md:text-4xl text-[#111110] font-light">Change Password</h1>
                    <p className="font-sans text-xs text-[#7a7670] mt-1">Manage authentication credentials and keep your account secured</p>
                </div>

                <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-[#111110]/8 shadow-[0_4px_20px_rgba(110,91,68,0.05)]">
                    <form onSubmit={handleChangePassword} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">Current Password</label>
                            <input
                                type="password"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">New Password</label>
                            <input
                                required
                                type="password"
                                placeholder="Minimum 6 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">Confirm New Password</label>
                            <input
                                required
                                type="password"
                                placeholder="Re-type new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                        </div>

                        {/* Security Advisory */}
                        <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-start gap-3">
                            <ShieldCheck size={18} className="text-amber-700 flex-shrink-0 mt-0.5" />
                            <div className="text-xs font-sans text-amber-900 leading-relaxed">
                                <strong className="font-bold">Password Safeguard:</strong> Use a combination of uppercase letters, numbers, and symbols to maximize security for your account and order transactions.
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={savingPassword}
                                className="px-8 py-3 bg-[#111110] hover:bg-primary text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-50"
                            >
                                {savingPassword ? 'Updating Password...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        )
    }

    return (
        <div className="account-panel font-plex flex flex-col lg:flex-row bg-[#fffcf7] min-h-screen selection:bg-primary-container text-stone-900 pt-16 sm:pt-20 lg:pt-0" style={{ fontFamily: "'IBM Plex Serif', Georgia, serif" }}>
            {/* Mobile / Tablet Top Navigation Bar */}
            <div className="lg:hidden sticky top-[54px] sm:top-[60px] lg:top-0 z-30 bg-[#fffcf7]/95 backdrop-blur-xl border-b border-[#111110]/8 px-3.5 sm:px-6 py-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300">
                <div className="flex items-center justify-between mb-2.5 px-0.5">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-mono text-[10px] tracking-widest text-primary/70 font-semibold uppercase">
                            Client Vault • {userInfo.name?.split(' ')[0]}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        {userInfo.isAdmin && (
                            <>
                                <Link to="/admin" className="text-[10px] font-sans uppercase tracking-widest text-primary bg-primary/10 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-primary hover:text-white transition-all">
                                    <ShieldCheck className="w-3 h-3 text-amber-500" />
                                    <span>Admin</span>
                                </Link>
                                <span className="text-stone-300 text-xs">•</span>
                            </>
                        )}
                        <Link to="/shop" className="text-[10px] font-sans uppercase tracking-widest text-primary font-bold flex items-center gap-1 hover:underline">
                            <span>Shop</span>
                            <ExternalLink className="w-3 h-3" />
                        </Link>
                        <span className="text-stone-300 text-xs">•</span>
                        <button
                            onClick={handleLogout}
                            className="text-[10px] font-sans uppercase tracking-widest text-stone-500 hover:text-red-600 font-bold flex items-center gap-1 transition-colors"
                        >
                            <LogOut className="w-3 h-3" />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {tabs.map(tab => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-sans uppercase tracking-wider font-bold whitespace-nowrap transition-all ${
                                    isActive
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-white/90 text-stone-600 border border-black/5 hover:bg-stone-100'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{tab.name}</span>
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className={`text-[8px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-white/25 text-white' : 'bg-black/5 text-stone-600'}`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Desktop Fixed Studio Sidebar (Identical architectural structure to Admin.jsx) */}
            <aside className="hidden lg:flex lg:w-72 xl:w-80 lg:fixed lg:top-0 lg:bottom-0 border-r border-[#6e5b44]/10 flex-col pt-28 pb-8 px-6 bg-white/70 backdrop-blur-2xl z-20">
                {/* Brand / Client Header */}
                <div className="px-3 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-primary/70 font-semibold">SOVRA CLIENT PORTAL</span>
                    </div>
                    <h1 className="font-plex text-3xl font-light text-primary tracking-tight">My Account</h1>

                    {/* Member Profile Card Widget */}
                    <div className="mt-4 p-3 bg-stone-50/80 rounded-2xl border border-stone-200/60 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary text-white font-plex text-lg font-medium flex items-center justify-center flex-shrink-0 shadow-sm">
                            {userInitial}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-sans text-xs font-bold text-stone-900 truncate leading-snug">{userInfo.name}</p>
                            <p className="font-mono text-[10px] text-stone-500 truncate leading-snug">{userInfo.email}</p>
                        </div>
                    </div>

                    {/* Admin Dashboard Switcher for Administrators */}
                    {userInfo.isAdmin && (
                        <Link
                            to="/admin"
                            className="mt-3 w-full flex items-center justify-between px-4 py-2.5 bg-primary text-white rounded-xl text-[10px] font-sans font-bold uppercase tracking-wider shadow-sm hover:bg-primary/90 transition-all group"
                        >
                            <span className="flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                                <span>Switch to Admin Panel</span>
                            </span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                    )}
                </div>

                {/* Navigation items */}
                <nav className="flex-1 space-y-1.5 overflow-y-auto pr-1">
                    {tabs.map(tab => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                                    isActive
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'text-stone-700 hover:bg-stone-200/50 hover:text-stone-900'
                                }`}
                            >
                                <div className="flex items-center gap-3.5">
                                    <Icon className={`w-4 h-4 transition-transform duration-300 ${
                                        isActive ? 'text-amber-200 scale-110' : 'text-stone-400 group-hover:text-primary group-hover:scale-105'
                                    }`} />
                                    <span className="font-sans text-[11px] uppercase tracking-[0.2em] font-bold">
                                        {tab.name}
                                    </span>
                                </div>
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono tracking-wider font-semibold transition-colors ${
                                        isActive
                                            ? 'bg-white/20 text-white'
                                            : 'bg-stone-200/70 text-stone-600 group-hover:bg-primary/10 group-hover:text-primary'
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </nav>

                {/* Sidebar Footer Link & Logout */}
                <div className="pt-4 border-t border-stone-200/60 mt-auto px-1 space-y-2">
                    <Link
                        to="/shop"
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all duration-300 text-[10px] font-sans uppercase tracking-widest font-bold group"
                    >
                        <span className="flex items-center gap-2">
                            <span>Explore Store</span>
                        </span>
                        <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-stone-500 hover:text-red-600 hover:bg-red-50 text-[10px] font-sans uppercase tracking-widest font-bold transition-all group"
                    >
                        <span className="flex items-center gap-2">
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                        </span>
                    </button>

                    <p className="text-center font-mono text-[9px] text-stone-400 tracking-wider pt-1">
                        v2.4 Member Edition
                    </p>
                </div>
            </aside>

            {/* Main Content Area (Identical right-side output canvas to Admin.jsx) */}
            <main className="flex-1 lg:ml-72 xl:ml-80 pt-4 sm:pt-6 lg:pt-28 pb-20 sm:pb-32 px-3.5 sm:px-8 md:px-14 lg:px-16 min-h-screen">
                <div className="max-w-[1400px] mx-auto">
                    <AnimatePresence mode="wait">
                        {activeTab === 'dashboard' && renderDashboard()}
                        {activeTab === 'orders' && renderOrders()}
                        {activeTab === 'addresses' && renderAddresses()}
                        {activeTab === 'wishlist' && renderWishlist()}
                        {activeTab === 'details' && renderDetails()}
                        {activeTab === 'password' && renderPassword()}
                    </AnimatePresence>
                </div>
            </main>

            {/* Return Request Modal */}
            <AnimatePresence>
                {showReturnModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowReturnModal(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-[#fffcf7] p-5 sm:p-8 md:p-10 rounded-2xl shadow-2xl border border-[#111110]/10 z-10 max-h-[90vh] overflow-y-auto no-scrollbar mx-2 sm:mx-0"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                        <span className="font-mono text-[9px] uppercase tracking-widest text-primary/70 font-semibold">RETURN INITIATION</span>
                                    </div>
                                    <h2 className="font-plex text-3xl text-[#111110]">Request Return</h2>
                                    <p className="font-mono text-xs text-stone-500 mt-1">Order #{selectedReturnOrder?._id.slice(-8).toUpperCase()}</p>
                                </div>
                                <button
                                    onClick={() => setShowReturnModal(false)}
                                    className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleReturnSubmit} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">Reason for Request</label>
                                    <select
                                        value={returnReason}
                                        onChange={e => setReturnReason(e.target.value)}
                                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                                    >
                                        <option value="Artisanal Defect">Defective or Damaged Item</option>
                                        <option value="Dimensions mismatch">Wrong Size or Fit</option>
                                        <option value="Aesthetic variation">Did not match expectations</option>
                                        <option value="Incorrect masterpiece">Wrong item delivered</option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">Details & Feedback</label>
                                    <textarea
                                        required
                                        value={returnDetails}
                                        onChange={e => setReturnDetails(e.target.value)}
                                        rows={4}
                                        placeholder="Please provide specifics regarding the condition or reason for return..."
                                        className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-stone-800 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowReturnModal(false)}
                                        className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submittingReturn}
                                        className="px-6 py-2.5 bg-[#111110] hover:bg-primary text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider shadow-sm transition-all disabled:opacity-50"
                                    >
                                        {submittingReturn ? 'Submitting Request...' : 'Submit Return Request'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Account
