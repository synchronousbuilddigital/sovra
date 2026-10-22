import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useShop } from '../context/ShopContext'
import { toast } from 'react-toastify'
import api from '../utils/api'
import { formatPrice } from '../utils/currency'
import { trackPurchase } from '../utils/analytics'
import {
    MapPin, Phone, User, Check, Plus, ShieldCheck, Truck, Lock,
    ArrowRight, ArrowLeft, Tag, ShoppingBag, CreditCard, Banknote,
    QrCode, AlertCircle, CheckCircle2, ChevronRight, X, Building, Mail,
    Sparkles, Ticket
} from 'lucide-react'

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi (NCR)', 'Chandigarh', 'Puducherry', 'Jammu & Kashmir', 'Ladakh'
]

const Checkout = () => {
    const { cart, refreshProfile } = useShop()
    const navigate = useNavigate()

    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null

    const [step, setStep] = useState(1) // 1: Checkout Form, 2: Order Confirmation
    const [orderInfo, setOrderInfo] = useState(null)
    const [loading, setLoading] = useState(false)

    // Saved Addresses
    const [savedAddresses, setSavedAddresses] = useState([])
    const [selectedAddressId, setSelectedAddressId] = useState(null)
    const [isCustomAddress, setIsCustomAddress] = useState(false)
    const [saveAddressToAccount, setSaveAddressToAccount] = useState(false)
    const [addressName, setAddressName] = useState('Home')

    // Address Form Inputs
    const [fullName, setFullName] = useState(userInfo?.name || '')
    const [phone, setPhone] = useState(userInfo?.phone || '')
    const [address, setAddress] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('Maharashtra')
    const [postalCode, setPostalCode] = useState('')
    const [country, setCountry] = useState('India')

    // Payment Method
    const [paymentMethod, setPaymentMethod] = useState('Online Card / NetBanking')

    // Promo Code & Available Vouchers
    const [promoCode, setPromoCode] = useState('')
    const [promoDiscount, setPromoDiscount] = useState(0)
    const [isApplying, setIsApplying] = useState(false)
    const [availablePromos, setAvailablePromos] = useState([])
    const [loadingPromos, setLoadingPromos] = useState(false)

    const subtotal = cart.reduce((acc, item) => acc + ((item.product?.price || 0) * (item.qty || 0)), 0)
    const discountAmount = (subtotal * promoDiscount) / 100
    const taxes = (subtotal - discountAmount) * 0.08
    const total = subtotal - discountAmount + taxes

    // Fetch active/available promos for the customer
    useEffect(() => {
        const fetchAvailablePromos = async () => {
            try {
                setLoadingPromos(true)
                const { data } = await api.get('/promos/active')
                if (Array.isArray(data)) {
                    setAvailablePromos(data)
                }
            } catch (err) {
                console.error('Failed to load active vouchers:', err)
            } finally {
                setLoadingPromos(false)
            }
        }
        fetchAvailablePromos()
    }, [])

    // Fetch user's saved addresses on mount
    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const { data } = await api.get('/users/addresses')
                if (Array.isArray(data) && data.length > 0) {
                    setSavedAddresses(data)
                    // Auto-select default address or first address
                    const defaultAddr = data.find(a => a.isDefault) || data[0]
                    if (defaultAddr) {
                        applySavedAddress(defaultAddr)
                    }
                } else {
                    setIsCustomAddress(true)
                }
            } catch (err) {
                console.error('Failed to load saved addresses:', err)
                setIsCustomAddress(true)
            }
        }
        fetchAddresses()
    }, [])

    const applySavedAddress = (addr) => {
        setSelectedAddressId(addr._id)
        setIsCustomAddress(false)
        setAddress(addr.address || '')
        setCity(addr.city || '')
        setPostalCode(String(addr.postalCode || ''))
        setCountry(addr.country || 'India')
        if (addr.state) setState(addr.state)
    }

    const handleSelectCustomAddress = () => {
        setSelectedAddressId(null)
        setIsCustomAddress(true)
        setAddress('')
        setCity('')
        setPostalCode('')
        setCountry('India')
    }

    // Phone: only numeric digits (max 10 digits for Indian numbers)
    const handlePhoneChange = (e) => {
        const numeric = e.target.value.replace(/\D/g, '').slice(0, 10)
        setPhone(numeric)
    }

    // Pincode: only numeric digits (max 6 digits for Indian PIN codes)
    const handlePincodeChange = (e) => {
        const numeric = e.target.value.replace(/\D/g, '').slice(0, 6)
        setPostalCode(numeric)
    }

    const handleApplyPromo = async (codeOverride) => {
        const codeToValidate = (typeof codeOverride === 'string' ? codeOverride : promoCode).trim().toUpperCase()
        if (!codeToValidate) return
        try {
            setIsApplying(true)
            const { data } = await api.get(`/promos/validate/${codeToValidate}?subtotal=${subtotal}`)
            setPromoCode(data.code || codeToValidate)
            setPromoDiscount(data.discount)
            toast.success(`Coupon code applied: ${data.discount}% OFF`)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid coupon code.')
            setPromoDiscount(0)
        } finally {
            setIsApplying(false)
        }
    }

    const handleRemovePromo = () => {
        setPromoDiscount(0)
        setPromoCode('')
        toast.info('Coupon voucher removed.')
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault()

        if (!fullName.trim()) {
            return toast.error('Please enter the recipient full name.')
        }

        if (!phone || phone.length < 10) {
            return toast.error('Please enter a valid 10-digit mobile number for delivery updates.')
        }

        if (!address.trim()) {
            return toast.error('Please provide a street address for delivery.')
        }

        if (!city.trim()) {
            return toast.error('Please enter delivery city.')
        }

        if (!postalCode || postalCode.length < 6) {
            return toast.error('Please enter a valid 6-digit postal PIN code.')
        }

        try {
            setLoading(true)

            // If user checked "Save this address to my account" for a custom address
            if (isCustomAddress && saveAddressToAccount) {
                try {
                    await api.post('/users/addresses', {
                        addressName: addressName || 'Home',
                        address,
                        city,
                        postalCode,
                        country,
                        isDefault: savedAddresses.length === 0
                    })
                } catch (saveErr) {
                    console.error('Failed to auto-save address:', saveErr)
                }
            }

            // Also sync phone to user profile if it was empty
            if (!userInfo?.phone && phone) {
                try {
                    await api.put('/users/profile', { phone })
                    const updated = { ...userInfo, phone }
                    localStorage.setItem('userInfo', JSON.stringify(updated))
                } catch (phoneErr) {
                    console.error('Failed to sync phone:', phoneErr)
                }
            }

            const orderData = {
                orderItems: cart.map(item => ({
                    name: item.product.name,
                    qty: item.qty,
                    image: item.product.images?.[0] || item.product.img || item.product.image,
                    price: item.product.price,
                    product: item.product._id
                })),
                shippingAddress: {
                    fullName,
                    phone,
                    address,
                    city,
                    state,
                    postalCode,
                    country
                },
                paymentMethod,
                itemsPrice: subtotal,
                taxPrice: taxes,
                shippingPrice: 0,
                totalPrice: total,
                promoCode: promoDiscount > 0 ? promoCode.toUpperCase() : undefined,
                discountPrice: discountAmount
            }

            const { data } = await api.post('/orders', orderData)
            setOrderInfo(data)
            setStep(2)
            trackPurchase(data._id, cart, total, taxes)
            refreshProfile()
            toast.success('Your order has been successfully placed.')
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (error) {
            toast.error(error.response?.data?.message || 'Transaction could not be completed.')
        } finally {
            setLoading(false)
        }
    }

    if (cart.length === 0 && step === 1) {
        return (
            <div className="pt-40 pb-24 px-6 text-center min-h-screen flex flex-col items-center justify-center">
                <ShoppingBag size={48} className="text-stone-300 mb-4" strokeWidth={1.5} />
                <h2 className="font-headline text-3xl italic text-stone-800 mb-2 font-light">Your Bag is Empty</h2>
                <p className="font-sans text-xs text-stone-500 max-w-sm mx-auto mb-6">There are no items currently awaiting checkout.</p>
                <button
                    onClick={() => navigate('/shop')}
                    className="inline-flex items-center gap-2 bg-[#111110] text-[#fffcf7] hover:bg-primary px-8 py-3.5 rounded-xl font-sans text-xs uppercase tracking-[0.2em] font-bold shadow-md transition-all"
                >
                    <span>Return to Shop</span>
                    <ArrowRight size={14} />
                </button>
            </div>
        )
    }

    return (
        <div className="pt-32 sm:pt-36 md:pt-40 pb-28 px-5 sm:px-8 md:px-12 max-w-[1400px] mx-auto font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen text-stone-900">
            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div
                        key="checkout"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* Header & Steps Bar */}
                        <header className="mb-10 pb-6 border-b border-[#111110]/8">
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="font-mono text-[10px] tracking-[0.25em] uppercase font-bold text-primary/80">
                                            Secured Dispatch
                                        </span>
                                    </div>
                                    <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-light tracking-tight italic text-[#111110]">
                                        Checkout & Delivery
                                    </h1>
                                    <p className="font-sans text-xs text-[#7a7670] mt-2">
                                        Provide delivery information and finalize your jewelry acquisition
                                    </p>
                                </div>

                                {/* Step Indicator */}
                                <div className="hidden sm:flex items-center gap-3 font-sans text-[11px] uppercase tracking-wider font-bold">
                                    <Link to="/bag" className="flex items-center gap-2 text-stone-500 hover:text-primary pb-1">
                                        <Check size={14} className="text-emerald-600" />
                                        Bag Review
                                    </Link>
                                    <span className="text-stone-300">/</span>
                                    <span className="flex items-center gap-2 text-primary border-b-2 border-primary pb-1">
                                        <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-mono">2</span>
                                        Shipping & Payment
                                    </span>
                                    <span className="text-stone-300">/</span>
                                    <span className="flex items-center gap-2 text-stone-400 pb-1">
                                        <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-600 text-[10px] flex items-center justify-center font-mono">3</span>
                                        Confirmation
                                    </span>
                                </div>
                            </div>
                        </header>

                        {/* 2-Column Checkout Layout */}
                        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                            {/* Left Column: Delivery Details & Payment (7 cols) */}
                            <div className="lg:col-span-7 space-y-8">
                                {/* Saved Addresses Selector (if user has saved addresses) */}
                                {savedAddresses.length > 0 && (
                                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#111110]/8 shadow-[0_4px_24px_rgba(110,91,68,0.05)] space-y-4">
                                        <div className="flex justify-between items-center pb-3 border-b border-stone-100">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={18} className="text-primary" />
                                                <h2 className="font-headline text-xl sm:text-2xl italic text-[#111110]">
                                                    Saved Delivery Addresses
                                                </h2>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleSelectCustomAddress}
                                                className={`font-sans text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-xl border transition-all ${
                                                    isCustomAddress
                                                        ? 'bg-primary text-white border-primary shadow-sm'
                                                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                                                }`}
                                            >
                                                + New Address
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                                            {savedAddresses.map((addr) => {
                                                const isSelected = selectedAddressId === addr._id && !isCustomAddress
                                                return (
                                                    <div
                                                        key={addr._id}
                                                        onClick={() => applySavedAddress(addr)}
                                                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                                                            isSelected
                                                                ? 'border-primary bg-primary/[0.03] shadow-sm'
                                                                : 'border-stone-200/70 hover:border-stone-300 bg-stone-50/50'
                                                        }`}
                                                    >
                                                        <div>
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="font-sans text-xs font-bold uppercase tracking-wider text-stone-900">
                                                                    {addr.addressName || 'Address'}
                                                                </span>
                                                                {addr.isDefault && (
                                                                    <span className="font-sans text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                                                                        Default
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="font-sans text-xs text-stone-600 line-clamp-2 leading-relaxed">
                                                                {addr.address}, {addr.city}, {addr.postalCode}
                                                            </p>
                                                        </div>

                                                        <div className="mt-3 pt-2.5 border-t border-stone-200/50 flex items-center justify-between text-[11px] font-sans">
                                                            <span className="font-bold text-stone-500">{addr.country}</span>
                                                            <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                                                isSelected ? 'border-primary bg-primary text-white' : 'border-stone-300'
                                                            }`}>
                                                                {isSelected && <Check size={10} strokeWidth={3} />}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Recipient & Shipping Address Form */}
                                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#111110]/8 shadow-[0_4px_24px_rgba(110,91,68,0.05)] space-y-6">
                                    <div className="pb-3 border-b border-stone-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <User size={18} className="text-primary" />
                                            <h2 className="font-headline text-xl sm:text-2xl italic text-[#111110]">
                                                {isCustomAddress ? 'Delivery Destination' : 'Recipient & Address Details'}
                                            </h2>
                                        </div>
                                        {isCustomAddress && savedAddresses.length > 0 && (
                                            <span className="font-sans text-[10px] uppercase tracking-wider text-primary font-bold">
                                                Custom Address Mode
                                            </span>
                                        )}
                                    </div>

                                    {/* Recipient Details Row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Full Name */}
                                        <div className="space-y-1.5">
                                            <label className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">
                                                Full Name / Recipient <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="Enter recipient full name"
                                                    value={fullName}
                                                    onChange={e => setFullName(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Phone Number (Integer only) */}
                                        <div className="space-y-1.5">
                                            <label className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">
                                                Phone Number <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative flex items-center">
                                                <span className="absolute left-3 font-mono text-xs font-bold text-stone-500 border-r border-stone-200 pr-2">
                                                    +91
                                                </span>
                                                <input
                                                    required
                                                    type="tel"
                                                    inputMode="numeric"
                                                    pattern="[0-9]*"
                                                    placeholder="10-digit mobile number"
                                                    value={phone}
                                                    onChange={handlePhoneChange}
                                                    className="w-full pl-14 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Street Address */}
                                    <div className="space-y-1.5">
                                        <label className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">
                                            Street Address / Flat / Building <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Apartment / Villa, Street, Landmark, Area"
                                            value={address}
                                            onChange={e => setAddress(e.target.value)}
                                            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>

                                    {/* City & State */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">
                                                City / Town <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                placeholder="e.g. Mumbai, Jaipur, Bengaluru"
                                                value={city}
                                                onChange={e => setCity(e.target.value)}
                                                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">
                                                State / Province <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                required
                                                value={state}
                                                onChange={e => setState(e.target.value)}
                                                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                                            >
                                                {INDIAN_STATES.map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Postal PIN Code (Integer only) & Country */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">
                                                PIN Code / Postal Code <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                placeholder="6-digit postal code"
                                                value={postalCode}
                                                onChange={handlePincodeChange}
                                                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-stone-500">
                                                Country
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                value={country}
                                                onChange={e => setCountry(e.target.value)}
                                                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-sans text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Option to save new address to account */}
                                    {isCustomAddress && (
                                        <div className="pt-3 border-t border-stone-100 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    id="saveAddressCheck"
                                                    checked={saveAddressToAccount}
                                                    onChange={e => setSaveAddressToAccount(e.target.checked)}
                                                    className="w-4 h-4 accent-primary rounded cursor-pointer"
                                                />
                                                <label htmlFor="saveAddressCheck" className="font-sans text-xs font-bold text-stone-700 cursor-pointer">
                                                    Save this address to my account for future orders
                                                </label>
                                            </div>

                                            {saveAddressToAccount && (
                                                <div className="pl-7 flex items-center gap-3 max-w-xs">
                                                    <span className="font-sans text-[10px] uppercase font-bold text-stone-400">Label:</span>
                                                    <input
                                                        type="text"
                                                        placeholder="e.g. Home, Office, Studio"
                                                        value={addressName}
                                                        onChange={e => setAddressName(e.target.value)}
                                                        className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-sans text-stone-800"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Payment Method Selection */}
                                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#111110]/8 shadow-[0_4px_24px_rgba(110,91,68,0.05)] space-y-4">
                                    <div className="pb-3 border-b border-stone-100 flex items-center gap-2">
                                        <CreditCard size={18} className="text-primary" />
                                        <h2 className="font-headline text-xl sm:text-2xl italic text-[#111110]">
                                            Payment Method
                                        </h2>
                                    </div>

                                    <div className="space-y-2.5">
                                        {[
                                            { id: 'Online Card / NetBanking', name: 'Credit / Debit Card or NetBanking', icon: CreditCard, sub: 'Visa, Mastercard, RuPay, Amex' },
                                            { id: 'UPI / QR', name: 'UPI / QR Code', icon: QrCode, sub: 'Google Pay, PhonePe, Paytm, BHIM' },
                                            { id: 'Cash on Delivery', name: 'Cash on Delivery (COD)', icon: Banknote, sub: 'Pay with cash upon white-glove arrival' }
                                        ].map(method => (
                                            <div
                                                key={method.id}
                                                onClick={() => setPaymentMethod(method.id)}
                                                className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                                                    paymentMethod === method.id
                                                        ? 'border-primary bg-primary/[0.03] shadow-sm'
                                                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3.5">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                                        paymentMethod === method.id ? 'bg-primary text-white' : 'bg-stone-100 text-stone-600'
                                                    }`}>
                                                        <method.icon size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-sans text-xs font-bold text-stone-900">{method.name}</p>
                                                        <p className="font-sans text-[11px] text-stone-500">{method.sub}</p>
                                                    </div>
                                                </div>

                                                <span className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                                    paymentMethod === method.id ? 'border-primary bg-primary text-white' : 'border-stone-300'
                                                }`}>
                                                    {paymentMethod === method.id && <Check size={10} strokeWidth={3} />}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Order Curation Summary (5 cols, Sticky) */}
                            <div className="lg:col-span-5 lg:sticky lg:top-36 space-y-6">
                                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#111110]/8 shadow-[0_4px_24px_rgba(110,91,68,0.06)] space-y-6">
                                    <div>
                                        <h2 className="font-headline text-2xl sm:text-3xl italic text-[#111110]">
                                            Order Curation
                                        </h2>
                                        <p className="font-sans text-xs text-[#7a7670] mt-1">
                                            {cart.length} {cart.length === 1 ? 'piece' : 'pieces'} being prepared for dispatch
                                        </p>
                                    </div>

                                    {/* Items List Accordion/Display */}
                                    <div className="space-y-3.5 divide-y divide-stone-100 max-h-[280px] overflow-y-auto pr-1">
                                        {cart.map((item, idx) => {
                                            const piece = item.product || {}
                                            return (
                                                <div key={piece._id || idx} className="pt-3.5 first:pt-0 flex gap-3.5 items-center">
                                                    <div className="w-14 h-16 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-black/5">
                                                        <img
                                                            src={piece.images?.[0] || piece.img || piece.image}
                                                            alt={piece.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-headline text-sm italic text-stone-900 truncate">
                                                            {piece.name}
                                                        </h4>
                                                        <p className="font-mono text-xs text-stone-500">
                                                            Qty: {item.qty} × {formatPrice(piece.price || 0)}
                                                        </p>
                                                    </div>
                                                    <span className="font-headline text-sm italic text-stone-900 font-light">
                                                        {formatPrice((piece.price || 0) * (item.qty || 1))}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {/* Promotion Voucher Section */}
                                    <div className="pt-4 border-t border-stone-100 space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <label className="font-sans text-[10px] uppercase tracking-[0.2em] font-bold text-stone-400 block">
                                                Promotion Voucher
                                            </label>
                                            {availablePromos.length > 0 && (
                                                <span className="font-sans text-[9.5px] font-semibold tracking-wider uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 flex items-center gap-1">
                                                    <Sparkles size={10} className="text-amber-600" />
                                                    {availablePromos.length} {availablePromos.length === 1 ? 'Voucher' : 'Vouchers'} Available
                                                </span>
                                            )}
                                        </div>

                                        {/* Input Box and Apply Button */}
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                                                <input
                                                    type="text"
                                                    placeholder="Enter coupon code..."
                                                    value={promoCode}
                                                    onChange={e => setPromoCode(e.target.value.toUpperCase())}
                                                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 font-mono text-xs uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleApplyPromo()}
                                                disabled={isApplying || !promoCode.trim()}
                                                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:bg-stone-100 disabled:text-stone-400"
                                            >
                                                {isApplying ? 'Checking...' : 'Apply'}
                                            </button>
                                        </div>

                                        {/* Applied Coupon Status Banner */}
                                        {promoDiscount > 0 && (
                                            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 font-sans shadow-sm">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 size={15} className="text-emerald-600 flex-shrink-0" />
                                                    <div>
                                                        <span className="font-bold">{promoCode} Applied: </span>
                                                        <span className="text-emerald-700 font-medium">{promoDiscount}% OFF (-{formatPrice(discountAmount)})</span>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleRemovePromo}
                                                    className="p-1 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg transition-colors"
                                                    title="Remove voucher"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        )}

                                        {/* Customer Available Vouchers */}
                                        {availablePromos.length > 0 && (
                                            <div className="pt-1.5 space-y-2">
                                                <span className="font-sans text-[10px] uppercase tracking-[0.16em] font-semibold text-stone-400 block">
                                                    Available For You
                                                </span>
                                                <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
                                                    {availablePromos.map((promo) => {
                                                        const isApplied = promoDiscount > 0 && promoCode.toUpperCase() === promo.code.toUpperCase()
                                                        const minMet = !promo.minOrderAmount || subtotal >= promo.minOrderAmount
                                                        const isRedeemed = promo.alreadyUsed

                                                        return (
                                                            <div
                                                                key={promo._id || promo.code}
                                                                className={`p-2.5 rounded-xl border transition-all text-xs ${
                                                                    isApplied
                                                                        ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400/20'
                                                                        : isRedeemed
                                                                        ? 'bg-stone-50/60 border-stone-200 opacity-60'
                                                                        : minMet
                                                                        ? 'bg-white hover:bg-amber-50/30 border-dashed border-stone-300 hover:border-amber-400 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
                                                                        : 'bg-stone-50/70 border-dashed border-stone-200'
                                                                }`}
                                                                onClick={() => {
                                                                    if (!isApplied && !isRedeemed && minMet && !isApplying) {
                                                                        handleApplyPromo(promo.code)
                                                                    }
                                                                }}
                                                            >
                                                                <div className="flex items-start justify-between gap-2">
                                                                    <div className="space-y-1">
                                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                                            <span className="font-mono font-bold text-[10.5px] px-2 py-0.5 bg-stone-900 text-[#fffcf7] rounded-md tracking-wider uppercase inline-flex items-center gap-1">
                                                                                <Ticket size={11} className="text-amber-400" />
                                                                                {promo.code}
                                                                            </span>
                                                                            <span className="font-sans font-bold text-emerald-800 text-xs">
                                                                                {promo.discount}% OFF
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-[11px] text-stone-500 font-sans leading-tight">
                                                                            {promo.minOrderAmount > 0
                                                                                ? `Valid on orders above ${formatPrice(promo.minOrderAmount)}`
                                                                                : 'No minimum order required'}
                                                                            {promo.maxDiscountAmount && ` (up to ${formatPrice(promo.maxDiscountAmount)})`}
                                                                        </p>
                                                                        {!minMet && promo.minOrderAmount > 0 && (
                                                                            <p className="text-[10px] text-amber-700 font-sans font-medium">
                                                                                Add {formatPrice(promo.minOrderAmount - subtotal)} more to unlock
                                                                            </p>
                                                                        )}
                                                                        {isRedeemed && (
                                                                            <p className="text-[10px] text-stone-400 font-sans">
                                                                                Already redeemed on a previous order
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex-shrink-0 pt-0.5">
                                                                        {isApplied ? (
                                                                            <span className="inline-flex items-center gap-1 text-[11px] font-sans font-bold text-emerald-700 bg-emerald-100/70 px-2 py-1 rounded-lg">
                                                                                <Check size={12} /> Applied
                                                                            </span>
                                                                        ) : isRedeemed ? (
                                                                            <span className="text-[10px] font-sans text-stone-400 px-2 py-1 bg-stone-100 rounded-lg">
                                                                                Redeemed
                                                                            </span>
                                                                        ) : (
                                                                            <button
                                                                                type="button"
                                                                                disabled={!minMet || isApplying}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation()
                                                                                    handleApplyPromo(promo.code)
                                                                                }}
                                                                                className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-[10px] font-sans font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                                                            >
                                                                                {isApplying && promoCode === promo.code ? '...' : 'Apply'}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Cost Breakdown */}
                                    <div className="space-y-3 pt-3 border-t border-stone-100 font-sans text-xs">
                                        <div className="flex justify-between items-center text-stone-600">
                                            <span className="uppercase tracking-wider font-bold text-[10px] text-stone-400">Subtotal</span>
                                            <span className="font-mono text-sm font-semibold text-stone-800">{formatPrice(subtotal)}</span>
                                        </div>

                                        {promoDiscount > 0 && (
                                            <div className="flex justify-between items-center text-emerald-700 font-semibold">
                                                <span>Coupon Discount ({promoDiscount}%)</span>
                                                <span className="font-mono">-{formatPrice(discountAmount)}</span>
                                            </div>
                                        )}

                                        <div className="flex justify-between items-center text-stone-600">
                                            <span className="uppercase tracking-wider font-bold text-[10px] text-stone-400">Delivery</span>
                                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                                Free Delivery
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-center text-stone-600">
                                            <span className="uppercase tracking-wider font-bold text-[10px] text-stone-400">Estimated Taxes (GST 8%)</span>
                                            <span className="font-mono text-sm font-semibold text-stone-800">{formatPrice(taxes)}</span>
                                        </div>
                                    </div>

                                    {/* Grand Total */}
                                    <div className="pt-4 border-t border-stone-100 flex justify-between items-baseline">
                                        <div>
                                            <span className="font-sans text-xs uppercase tracking-[0.2em] font-bold text-stone-900 block">
                                                Total Value
                                            </span>
                                            <span className="font-sans text-[10px] text-stone-400">Final amount inclusive of taxes</span>
                                        </div>
                                        <span className="font-headline text-3xl sm:text-4xl italic text-stone-900 font-light">
                                            {formatPrice(total)}
                                        </span>
                                    </div>

                                    {/* Finalize Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#111110] hover:bg-primary text-[#fffcf7] py-4 px-6 rounded-xl font-sans text-xs uppercase tracking-[0.25em] font-bold flex items-center justify-between transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-50 group"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Lock size={14} className="text-amber-200" />
                                            <span>{loading ? 'Securing Order...' : 'Confirm & Place Order'}</span>
                                        </span>
                                        <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                                    </button>

                                    <div className="text-center pt-2">
                                        <Link
                                            to="/bag"
                                            className="font-sans text-xs uppercase tracking-wider font-bold text-stone-500 hover:text-stone-800 transition-colors inline-flex items-center gap-1.5"
                                        >
                                            <ArrowLeft size={13} />
                                            <span>Modify Bag Items</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                ) : (
                    /* Step 2: Order Confirmed Screen */
                    <motion.div
                        key="confirmation"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#111110]/8 shadow-[0_8px_40px_rgba(110,91,68,0.08)] text-center space-y-8">
                            <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                                <Check size={36} strokeWidth={2.5} />
                            </div>

                            <div>
                                <span className="font-mono text-xs uppercase tracking-[0.25em] font-bold text-emerald-700 block mb-2">
                                    Order Successfully Confirmed
                                </span>
                                <h1 className="font-headline text-4xl sm:text-5xl italic text-stone-900 font-light">
                                    Thank You for Your Acquisition
                                </h1>
                                <p className="font-sans text-xs text-stone-500 max-w-lg mx-auto mt-3 leading-relaxed">
                                    Your order has been recorded at the SOVRA atelier. Our jewelers will inspect, package, and dispatch your pieces with white-glove security.
                                </p>
                            </div>

                            {/* Order Details Ledger */}
                            <div className="bg-stone-50/80 rounded-2xl p-6 text-left border border-stone-200/60 space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200/60">
                                    <div>
                                        <span className="font-sans text-[10px] uppercase tracking-wider font-bold text-stone-400 block">
                                            Order Ledger ID
                                        </span>
                                        <span className="font-mono font-bold text-sm text-stone-900 select-all">
                                            #{orderInfo?._id}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-sans text-[10px] uppercase tracking-wider font-bold text-stone-400 block">
                                            Total Amount
                                        </span>
                                        <span className="font-headline text-xl italic text-stone-900 font-bold">
                                            {formatPrice(orderInfo?.totalPrice)}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans pt-1">
                                    <div>
                                        <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                                            Delivery Destination
                                        </span>
                                        <p className="font-bold text-stone-900">{orderInfo?.shippingAddress?.fullName || fullName}</p>
                                        <p className="text-stone-600">{orderInfo?.shippingAddress?.address || address}</p>
                                        <p className="text-stone-600">
                                            {orderInfo?.shippingAddress?.city || city}, {orderInfo?.shippingAddress?.postalCode || postalCode}
                                        </p>
                                        <p className="text-stone-600 font-mono mt-1">
                                            Contact: +91 {orderInfo?.shippingAddress?.phone || phone}
                                        </p>
                                    </div>

                                    <div>
                                        <span className="text-stone-400 font-bold uppercase tracking-wider text-[10px] block mb-1">
                                            Order Status & Payment
                                        </span>
                                        <p className="font-bold text-emerald-700 capitalize">
                                            {orderInfo?.status || 'Processing / Confirmed'}
                                        </p>
                                        <p className="text-stone-600">{orderInfo?.paymentMethod || paymentMethod}</p>
                                        <p className="text-emerald-700 font-semibold mt-1">Free Insured Delivery</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                                <button
                                    onClick={() => navigate('/account')}
                                    className="bg-[#111110] hover:bg-primary text-[#fffcf7] px-8 py-3.5 rounded-xl font-sans text-xs uppercase tracking-[0.2em] font-bold shadow-md transition-all active:scale-98"
                                >
                                    View in My Orders
                                </button>
                                <button
                                    onClick={() => navigate('/shop')}
                                    className="bg-stone-100 hover:bg-stone-200 text-stone-800 px-8 py-3.5 rounded-xl font-sans text-xs uppercase tracking-[0.2em] font-bold transition-all"
                                >
                                    Explore Further
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Checkout
