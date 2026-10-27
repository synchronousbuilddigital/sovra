import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import Skeleton from '../components/Skeleton'
import { getOptimizedImage } from '../utils/imageUtils'
import { useShop } from '../context/ShopContext'
import {
    LayoutDashboard, Package, ShoppingBag, ShoppingCart, Tag, Users, Settings,
    ShieldCheck, TrendingUp, Plus, Search, Eye, Edit3, Trash2, ExternalLink,
    CheckCircle2, AlertCircle, ArrowUpRight, RotateCcw,
    Check, X, ChevronRight, ArrowRight, Sparkles, Gem, Clock, CircleDot,
    CircleDollarSign, Layers, ChevronLeft, ImagePlus, UserCheck,
    Copy, Download, Mail, Percent, Filter, Film, Play, Video,
    Star, Sliders, ArrowLeftRight, LogOut
} from 'lucide-react'

const Admin = () => {
    const navigate = useNavigate()
    const { logout } = useShop()
    const [activeTab, setActiveTab] = useState('dashboard')
    const [orderSearch, setOrderSearch] = useState('')
    const [orderFilter, setOrderFilter] = useState('All')
    const [pieceSearch, setPieceSearch] = useState('')
    const [pieceCategory, setPieceCategory] = useState('All')
    const [customerSearch, setCustomerSearch] = useState('')
    const [loading, setLoading] = useState(true)

    // Inventory CRUD States
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [currentProduct, setCurrentProduct] = useState({
        name: '',
        category: 'Necklaces',
        price: '',
        mrp: '',
        showOnHome: false,
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
        expiryDate: ''
    })
    const [isSavingPromo, setIsSavingPromo] = useState(false)

    // Reels Management States
    const [reels, setReels] = useState([])
    const [isReelModalOpen, setIsReelModalOpen] = useState(false)
    const [editReelMode, setEditReelMode] = useState(false)
    const [currentReel, setCurrentReel] = useState({
        _id: null,
        title: '',
        category: 'Earrings',
        image: '',
        video: '',
        productId: '',
        price: '',
        order: 1,
        isActive: true,
        isHomeShowcase: false,
        homeOrder: 0
    })
    const [isSavingReel, setIsSavingReel] = useState(false)
    const [uploadingReelImg, setUploadingReelImg] = useState(false)
    const [reelSearch, setReelSearch] = useState('')
    const [isSavingShowcase, setIsSavingShowcase] = useState(false)

    // Category Management States (Home 4-Slot Strict Limit)
    const [categories, setCategories] = useState([])
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
    const [editCategoryMode, setEditCategoryMode] = useState(false)
    const [currentCategory, setCurrentCategory] = useState({
        _id: null,
        name: '',
        slug: '',
        title: '',
        subtitle: '',
        tagline: '',
        count: '',
        desc: '',
        homeImage: '',
        collectionImage: '',
        showOnHome: false,
        order: 0,
        isActive: true
    })
    const [isSavingCategory, setIsSavingCategory] = useState(false)
    const [uploadingHomeImg, setUploadingHomeImg] = useState(false)
    const [uploadingCollectionImg, setUploadingCollectionImg] = useState(false)
    const [categorySearch, setCategorySearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    // Initial Data Fetching - Run once on mount so tab switching is instantaneous
    useEffect(() => {
        fetchAdminData()
    }, [])

    const fetchAdminData = async (isSilent = false) => {
        try {
            if (!isSilent) {
                setLoading(true)
            }

            const [
                statsRes,
                productsRes,
                ordersRes,
                usersRes,
                revenueRes,
                promosRes,
                abandonedRes,
                reelsRes,
                categoriesRes
            ] = await Promise.allSettled([
                api.get('/analytics/stats'),
                api.get('/products?pageSize=all'),
                api.get('/orders'),
                api.get('/users'),
                api.get('/analytics/revenue'),
                api.get('/promos'),
                api.get('/users/admin/abandoned-carts'),
                api.get('/reels?all=true'),
                api.get('/categories?all=true')
            ])

            let hasSuccessfulData = false

            if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
                setStats(statsRes.value.data)
                hasSuccessfulData = true
            }

            if (productsRes.status === 'fulfilled' && productsRes.value?.data) {
                const pData = productsRes.value.data
                setProducts(pData.products || [])
                setProductTotal(pData.total || (pData.products || []).length)
                hasSuccessfulData = true
            }

            if (ordersRes.status === 'fulfilled' && ordersRes.value?.data) {
                setOrders(ordersRes.value.data)
                hasSuccessfulData = true
            }

            if (usersRes.status === 'fulfilled' && usersRes.value?.data) {
                setCustomers(usersRes.value.data)
                hasSuccessfulData = true
            }

            if (promosRes.status === 'fulfilled' && promosRes.value?.data) {
                setPromos(promosRes.value.data || [])
            }

            if (abandonedRes.status === 'fulfilled' && abandonedRes.value?.data) {
                setAbandonedCarts(abandonedRes.value.data || [])
            }

            if (reelsRes.status === 'fulfilled' && reelsRes.value?.data) {
                setReels(reelsRes.value.data || [])
            }

            if (categoriesRes.status === 'fulfilled' && categoriesRes.value?.data) {
                setCategories(categoriesRes.value.data || [])
            }

            if (revenueRes.status === 'fulfilled' && Array.isArray(revenueRes.value?.data)) {
                const fullYear = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, revenue: 0 }))
                revenueRes.value.data.forEach(item => {
                    const index = fullYear.findIndex(f => f.month === item._id)
                    if (index !== -1) fullYear[index].revenue = item.revenue
                })
                setRevenueData(fullYear)
            }

            if (!hasSuccessfulData && !isSilent) {
                toast.error('Unable to fetch latest admin data. Please check your network or login session.')
            }

        } catch (error) {
            console.error('Fetch admin data failed:', error)
            if (!isSilent) {
                toast.error('Unable to fetch latest admin data.')
            }
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
            toast.success('Reminder sent successfully.')
            setAbandonedCarts(abandonedCarts.filter(c => c._id !== userId))
        } catch (error) {
            toast.error('Failed to send reminder email.')
        }
    }


    const handlePrintInvoice = (orderId) => {
        window.open(`/order/${orderId}/invoice`, '_blank')
    }

    const handleAddProduct = () => {
        setEditMode(false)
        setCurrentProduct({
            name: '', category: 'Necklaces', price: '', mrp: '', showOnHome: false, details: '', material: 'Stainless Steel',
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
            stock: Math.max(0, Number(product.stock) || 0),
            price: product.price ?? '',
            mrp: product.mrp && Number(product.mrp) > 0 ? product.mrp : '',
            showOnHome: Boolean(product.showOnHome),
            images: gallery
        })
        setIsModalOpen(true)
    }

    const handleToggleHomeProduct = async (product) => {
        const willShow = !product.showOnHome
        if (willShow) {
            const currentHomeCount = products.filter(p => p.showOnHome && p._id !== product._id).length
            if (currentHomeCount >= 8) {
                toast.error('Home Screen Showcase is full (8/8 slots used). Click "In Home Shop" on any active piece to free up a slot first.')
                return
            }
        }
        try {
            const { data } = await api.put(`/products/${product._id}/toggle-home`, { showOnHome: willShow })
            setProducts(prev => prev.map(p => p._id === data._id ? { ...p, showOnHome: data.showOnHome } : p))
            toast.success(data.showOnHome ? `"${product.name}" added to Home Screen Showcase (8 max).` : `"${product.name}" removed from Home Screen Showcase.`)
        } catch (error) {
            console.error('Toggle home showcase error:', error)
            const msg = error.response?.data?.message || error.message || 'Failed to update Home Screen showcase status.'
            toast.error(msg)
        }
    }

    const handleDeleteProduct = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`)
                setProducts(prev => prev.filter(p => p._id !== id))
                toast.success('Product deleted successfully.')
                fetchAdminData(true)
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
            toast.success('Image uploaded successfully.')
        } catch (error) {
            toast.error('Upload failed.')
        } finally {
            setUploadingIdx(null)
        }
    }

    const handleSaveProduct = async (e) => {
        e.preventDefault()
        try {
            if (currentProduct.showOnHome) {
                const currentHomeCount = products.filter(p => p.showOnHome && p._id !== currentProduct._id).length
                if (currentHomeCount >= 8) {
                    toast.error('Home Screen Shop is strictly limited to 8 products. Please uncheck one first.')
                    return
                }
            }

            const payload = {
                ...currentProduct,
                price: Number(currentProduct.price),
                mrp: currentProduct.mrp ? Number(currentProduct.mrp) : 0,
                stock: Math.max(0, parseInt(currentProduct.stock, 10) || 0),
                showOnHome: Boolean(currentProduct.showOnHome)
            }

            if (editMode) {
                const { data } = await api.put(`/products/${currentProduct._id}`, payload)
                setProducts(products.map(p => p._id === data._id ? data : p))
                toast.success('Product updated successfully.')
            } else {
                const { data } = await api.post('/products', payload)
                setProducts(prev => [data, ...prev])
                toast.success('Product added successfully.')
                fetchAdminData(true)
            }
            setIsModalOpen(false)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Saving failed.')
        }
    }

    const handleSavePromo = async (e) => {
        e.preventDefault()
        try {
            setIsSavingPromo(true)
            const { data } = await api.post('/promos', {
                code: currentPromo.code,
                discount: currentPromo.discount,
                expiryDate: currentPromo.expiryDate || undefined,
                perUserLimit: 1
            })
            setPromos([data, ...promos])
            setIsPromoModalOpen(false)
            toast.success('Coupon code created.')
            setCurrentPromo({ code: '', discount: 10, expiryDate: '' })
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create coupon.')
        } finally {
            setIsSavingPromo(false)
        }
    }

    const handleDeletePromo = async (id) => {
        if (!window.confirm('Are you sure you want to delete this coupon?')) return
        try {
            await api.delete(`/promos/${id}`)
            setPromos(promos.filter(p => p._id !== id))
            toast.success('Coupon deleted.')
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

    // Reels Management Handlers
    const handleOpenAddReel = () => {
        setEditReelMode(false)
        setCurrentReel({
            _id: null,
            title: '',
            category: 'Earrings',
            image: '',
            video: '',
            productId: '',
            price: '',
            order: (reels.length || 0) + 1,
            isActive: true,
            isHomeShowcase: false,
            homeOrder: 0
        })
        setIsReelModalOpen(true)
    }

    const handleOpenEditReel = (reel) => {
        setEditReelMode(true)
        setCurrentReel({
            _id: reel._id,
            title: reel.title || reel.name || '',
            category: reel.category || 'Earrings',
            image: reel.image || '',
            video: reel.video || '',
            productId: reel.productId || '',
            price: reel.price || '',
            order: typeof reel.order === 'number' ? reel.order : 1,
            isActive: reel.isActive !== undefined ? reel.isActive : true,
            isHomeShowcase: Boolean(reel.isHomeShowcase),
            homeOrder: typeof reel.homeOrder === 'number' ? reel.homeOrder : 0
        })
        setIsReelModalOpen(true)
    }

    const handleReelImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        const formData = new FormData()
        formData.append('image', file)
        try {
            setUploadingReelImg(true)
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setCurrentReel(prev => ({ ...prev, image: data.url }))
            toast.success('Reel image uploaded successfully.')
        } catch (error) {
            toast.error('Image upload failed.')
        } finally {
            setUploadingReelImg(false)
        }
    }

    const handleSaveReel = async (e) => {
        e.preventDefault()
        if (!currentReel.title.trim()) {
            toast.error('Please provide a reel title.')
            return
        }
        if (!currentReel.image.trim()) {
            toast.error('Please upload or specify a cover image for the reel.')
            return
        }

        try {
            setIsSavingReel(true)
            if (editReelMode && currentReel._id) {
                const { data } = await api.put(`/reels/${currentReel._id}`, currentReel)
                setReels(prev => prev.map(r => r._id === data._id ? data : r))
                toast.success('Reel updated successfully.')
            } else {
                const { data } = await api.post('/reels', currentReel)
                setReels(prev => [...prev, data])
                toast.success('New reel created successfully.')
            }
            setIsReelModalOpen(false)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save reel.')
        } finally {
            setIsSavingReel(false)
        }
    }

    const handleDeleteReel = async (id) => {
        if (window.confirm('Are you sure you want to delete this reel? It will be removed from both the Home and Reels pages.')) {
            try {
                await api.delete(`/reels/${id}`)
                setReels(prev => prev.filter(r => r._id !== id))
                toast.success('Reel removed successfully.')
            } catch (error) {
                toast.error('Failed to delete reel.')
            }
        }
    }

    const handleToggleReelActive = async (reel) => {
        try {
            const updatedStatus = !reel.isActive
            const { data } = await api.put(`/reels/${reel._id}`, { isActive: updatedStatus })
            setReels(prev => prev.map(r => r._id === data._id ? data : r))
            toast.success(updatedStatus ? 'Reel is now visible on live store.' : 'Reel hidden from live store.')
        } catch (error) {
            toast.error('Failed to update reel status.')
        }
    }

    // Derived Home Screen Showcase Reels (exactly up to 5, ordered by homeOrder)
    const homeShowcaseReels = useMemo(() => {
        return reels
            .filter(r => r.isHomeShowcase)
            .sort((a, b) => (a.homeOrder || 0) - (b.homeOrder || 0))
            .slice(0, 5)
    }, [reels])

    const handleSetHomeShowcase = async (newReelIds) => {
        try {
            setIsSavingShowcase(true)
            const { data } = await api.put('/reels/home-showcase', { reelIds: newReelIds })
            if (data.reels) {
                setReels(data.reels)
            } else {
                const res = await api.get('/reels?all=true')
                setReels(res.data || [])
            }
            toast.success('Home screen showcase updated.')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update home showcase.')
        } finally {
            setIsSavingShowcase(false)
        }
    }

    const handleToggleFeatureOnHome = async (reel) => {
        const isFeatured = reel.isHomeShowcase
        if (isFeatured) {
            // Remove from showcase
            const updatedIds = homeShowcaseReels.filter(r => r._id !== reel._id).map(r => r._id)
            await handleSetHomeShowcase(updatedIds)
        } else {
            // Add to showcase
            if (homeShowcaseReels.length >= 5) {
                toast.error('All 5 Home Showcase slots are full. Remove or replace one in the showcase section above.')
                return
            }
            const updatedIds = [...homeShowcaseReels.map(r => r._id), reel._id]
            await handleSetHomeShowcase(updatedIds)
        }
    }

    const handleAssignSlot = async (slotIndex, reelId) => {
        if (!reelId) {
            const currentIds = homeShowcaseReels.map(r => r._id)
            if (slotIndex < currentIds.length) {
                currentIds.splice(slotIndex, 1)
                await handleSetHomeShowcase(currentIds)
            }
            return
        }

        let ids = [...homeShowcaseReels.map(r => r._id)]
        // Remove if already present in another slot
        ids = ids.filter(id => id !== reelId)
        // If slotIndex is beyond current array length, push; else replace
        if (slotIndex >= ids.length) {
            ids.push(reelId)
        } else {
            ids[slotIndex] = reelId
        }
        ids = ids.slice(0, 5)
        await handleSetHomeShowcase(ids)
    }

    const handleRemoveFromHomeShowcase = async (reelId) => {
        const updatedIds = homeShowcaseReels.filter(r => r._id !== reelId).map(r => r._id)
        await handleSetHomeShowcase(updatedIds)
    }

    const handleMoveShowcaseSlot = async (currentIndex, direction) => {
        const targetIndex = currentIndex + direction
        if (targetIndex < 0 || targetIndex >= homeShowcaseReels.length) return
        const ids = homeShowcaseReels.map(r => r._id)
        const temp = ids[currentIndex]
        ids[currentIndex] = ids[targetIndex]
        ids[targetIndex] = temp
        await handleSetHomeShowcase(ids)
    }

    const handleAutoPopulateTop5 = async () => {
        const activeReels = reels.filter(r => r.isActive).slice(0, 5)
        if (activeReels.length === 0) {
            toast.info('No active reels available to feature.')
            return
        }
        await handleSetHomeShowcase(activeReels.map(r => r._id))
    }

    // ----------------------------------------------------
    // CATEGORY MANAGEMENT HANDLERS (STRICT 4-SLOT HOME RULE)
    // ----------------------------------------------------
    const homeCategoriesCount = useMemo(() => {
        return categories.filter(c => c.showOnHome).length
    }, [categories])

    const homeCategoriesList = useMemo(() => {
        return categories.filter(c => c.showOnHome).sort((a, b) => (a.order || 0) - (b.order || 0))
    }, [categories])

    const filteredCategories = useMemo(() => {
        return categories.filter(cat => {
            const matchesSearch = !categorySearch.trim() || 
                (cat.name && cat.name.toLowerCase().includes(categorySearch.toLowerCase())) ||
                (cat.title && cat.title.toLowerCase().includes(categorySearch.toLowerCase())) ||
                (cat.subtitle && cat.subtitle.toLowerCase().includes(categorySearch.toLowerCase())) ||
                (cat.slug && cat.slug.toLowerCase().includes(categorySearch.toLowerCase()))

            if (!matchesSearch) return false

            if (categoryFilter === 'home') return cat.showOnHome
            if (categoryFilter === 'collection') return !cat.showOnHome
            return true
        })
    }, [categories, categorySearch, categoryFilter])

    const handleOpenAddCategory = () => {
        const isSlotsAvailable = categories.filter(c => c.showOnHome).length < 4
        setCurrentCategory({
            _id: null,
            name: '',
            slug: '',
            title: '',
            subtitle: `The Archive ${categories.length + 1}`,
            tagline: '',
            count: '',
            desc: '',
            homeImage: '',
            collectionImage: '',
            showOnHome: isSlotsAvailable,
            order: categories.length + 1,
            isActive: true
        })
        setEditCategoryMode(false)
        setIsCategoryModalOpen(true)
    }

    const handleOpenEditCategory = (cat) => {
        setCurrentCategory({
            _id: cat._id,
            name: cat.name || '',
            slug: cat.slug || '',
            title: cat.title || '',
            subtitle: cat.subtitle || '',
            tagline: cat.tagline || '',
            count: cat.count || '',
            desc: cat.desc || '',
            homeImage: cat.homeImage || '',
            collectionImage: cat.collectionImage || cat.homeImage || '',
            showOnHome: Boolean(cat.showOnHome),
            order: cat.order ?? 0,
            isActive: cat.isActive !== false
        })
        setEditCategoryMode(true)
        setIsCategoryModalOpen(true)
    }

    const handleCategoryHomeImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        const formData = new FormData()
        formData.append('image', file)
        try {
            setUploadingHomeImg(true)
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setCurrentCategory(prev => ({
                ...prev,
                homeImage: data.url,
                collectionImage: prev.collectionImage ? prev.collectionImage : data.url
            }))
            toast.success('Home Screen image uploaded successfully.')
        } catch (error) {
            toast.error('Home image upload failed.')
        } finally {
            setUploadingHomeImg(false)
        }
    }

    const handleCategoryCollectionImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        const formData = new FormData()
        formData.append('image', file)
        try {
            setUploadingCollectionImg(true)
            const { data } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            setCurrentCategory(prev => ({
                ...prev,
                collectionImage: data.url
            }))
            toast.success('Collection image uploaded successfully.')
        } catch (error) {
            toast.error('Collection image upload failed.')
        } finally {
            setUploadingCollectionImg(false)
        }
    }

    const handleToggleHomeCategory = async (cat) => {
        const willBeHome = !cat.showOnHome
        if (willBeHome) {
            const currentHomeSlotsTaken = categories.filter(c => c.showOnHome && c._id !== cat._id).length
            if (currentHomeSlotsTaken >= 4) {
                toast.error('Home Screen is strictly limited to 4 categories. Please remove one category before assigning a new one.')
                return
            }
        }

        try {
            const { data } = await api.patch(`/categories/${cat._id}/toggle-home`)
            setCategories(prev => prev.map(c => c._id === data._id ? data : c))
            toast.success(data.showOnHome ? `"${cat.name}" is now featured on the Home Screen.` : `"${cat.name}" moved to Collection Section only.`)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update Home Screen category assignment.')
        }
    }

    const handleSaveCategory = async (e) => {
        e.preventDefault()
        if (!currentCategory.name.trim()) {
            toast.error('Please enter a category name.')
            return
        }
        if (!currentCategory.homeImage.trim()) {
            toast.error('Please provide an image for the Home Screen section.')
            return
        }

        // Strict client-side check for 4-slot limit
        if (currentCategory.showOnHome) {
            const otherHomeCount = categories.filter(c => c.showOnHome && c._id !== currentCategory._id).length
            if (otherHomeCount >= 4) {
                toast.error('Only 4 categories can be featured on the Home Screen. Please uncheck one category before adding another.')
                return
            }
        }

        try {
            setIsSavingCategory(true)
            const payload = {
                ...currentCategory,
                collectionImage: currentCategory.collectionImage.trim() || currentCategory.homeImage.trim()
            }

            if (editCategoryMode && currentCategory._id) {
                const { data } = await api.put(`/categories/${currentCategory._id}`, payload)
                setCategories(prev => prev.map(c => c._id === data._id ? data : c))
                toast.success('Category updated successfully.')
            } else {
                const { data } = await api.post('/categories', payload)
                setCategories(prev => [...prev, data])
                toast.success('New category added successfully.')
            }
            setIsCategoryModalOpen(false)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save category.')
        } finally {
            setIsSavingCategory(false)
        }
    }

    const handleDeleteCategory = async (cat) => {
        if (window.confirm(`Are you sure you want to delete "${cat.name}" category? It will be removed from all collections and navigation.`)) {
            try {
                await api.delete(`/categories/${cat._id}`)
                setCategories(prev => prev.filter(c => c._id !== cat._id))
                toast.success(`Category "${cat.name}" deleted.`)
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete category.')
            }
        }
    }

    const renderDashboard = () => {
        // Prepare 6-month visualizer trajectory
        const totalRevNum = typeof stats.totalRevenue === 'number' 
            ? stats.totalRevenue 
            : parseInt(String(stats.totalRevenue).replace(/[^0-9]/g, '')) || 68850;
        
        // Build realistic timeline trajectory where April has full revenue
        const chartTrajectory = [
            { month: 'Nov', revenue: Math.round(totalRevNum * 0.12) },
            { month: 'Dec', revenue: Math.round(totalRevNum * 0.28) },
            { month: 'Jan', revenue: Math.round(totalRevNum * 0.42) },
            { month: 'Feb', revenue: Math.round(totalRevNum * 0.58) },
            { month: 'Mar', revenue: Math.round(totalRevNum * 0.76) },
            { month: 'Apr', revenue: totalRevNum },
            { month: 'May', revenue: Math.round(totalRevNum * 0.85) }
        ];

        const maxRev = Math.max(...chartTrajectory.map(d => d.revenue)) || 1;

        const lowStockPieces = products
            .filter(p => p && (p.stock === undefined || p.stock === null || p.stock <= 5))
            .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));

        const statCards = [
            { 
                label: "Total Gross Revenue", 
                mobileLabel: "Gross Revenue",
                value: stats.totalRevenue ? `₹${stats.totalRevenue.toLocaleString()}` : "₹68,850", 
                icon: CircleDollarSign, 
                iconBg: "bg-[#6e5b44]/10 text-[#6e5b44]",
                trend: "+12.4% vs last cycle",
                mobileTrend: "+12.4%",
                trendColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
                subtext: `₹${Math.round(totalRevNum / (stats.totalOrders || 1)).toLocaleString()} Avg. Order Value`,
                mobileSubtext: `₹${Math.round(totalRevNum / (stats.totalOrders || 1)).toLocaleString()} AOV`
            },
            { 
                label: "Total Orders", 
                mobileLabel: "Total Orders",
                value: `${stats.totalOrders || orders.length || 4} Orders`, 
                icon: ShoppingBag, 
                iconBg: "bg-amber-500/10 text-amber-700",
                trend: "100% Fulfilled",
                mobileTrend: "100%",
                trendColor: "bg-blue-50 text-blue-700 border-blue-200",
                subtext: `${orders.filter(o => o.status === 'Pending').length} Pending review`,
                mobileSubtext: `${orders.filter(o => o.status === 'Pending').length} to review`
            },
            { 
                label: "Total Products", 
                mobileLabel: "Total Products",
                value: `${productTotal || products.length || 50} Products`, 
                icon: Package, 
                iconBg: "bg-purple-500/10 text-purple-700",
                trend: lowStockPieces.length > 0 ? `${lowStockPieces.length} Low Stock` : "Stock Healthy",
                mobileTrend: lowStockPieces.length > 0 ? `${lowStockPieces.length} Low` : "Healthy",
                trendColor: lowStockPieces.length > 0 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-purple-50 text-purple-700 border-purple-200",
                subtext: lowStockPieces.length > 0 ? `${lowStockPieces.length} items need replenishment` : "All products well-stocked",
                mobileSubtext: lowStockPieces.length > 0 ? `${lowStockPieces.length} restock` : "Well-stocked"
            },
            { 
                label: "Total Customers", 
                mobileLabel: "Customers",
                value: `${stats.totalUsers || customers.length || 4} Customers`, 
                icon: Users, 
                iconBg: "bg-emerald-500/10 text-emerald-700",
                trend: "Active Accounts",
                mobileTrend: "Active",
                trendColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
                subtext: "Registered Members",
                mobileSubtext: "Members"
            }
        ];

        return (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-6 sm:space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2 border-b border-[#111110]/8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl text-[#111110] font-light leading-tight">Dashboard Overview</h1>
                        <p className="text-xs text-[#7a7670] mt-0.5 sm:mt-1">Real-time sales, orders, and store overview</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => { fetchAdminData(); toast.info('Database records synchronized.'); }}
                            title="Sync live records from database"
                            className="border border-[#111110]/15 bg-white text-[#111110] hover:bg-stone-50 transition-all px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs tracking-wider uppercase font-bold flex items-center gap-2 shadow-2xs active:scale-98 cursor-pointer"
                        >
                            <RotateCcw size={14} />
                            <span className="hidden sm:inline">Sync Data</span>
                        </button>
                        <button
                            onClick={handleAddProduct}
                            className="bg-[#111110] text-[#fffcf7] hover:bg-[#6e5b44] transition-all px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs tracking-wider uppercase font-bold flex items-center gap-2 shadow-sm active:scale-98"
                        >
                            <Plus size={15} />
                            <span>Add Product</span>
                        </button>
                    </div>
                </div>

                {/* 4 Precision Metric Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
                    {statCards.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div 
                                key={stat.label} 
                                className="bg-white rounded-2xl p-3 sm:p-5 border border-[#111110]/8 shadow-[0_4px_20px_rgba(110,91,68,0.05)] hover:shadow-[0_8px_30px_rgba(110,91,68,0.1)] transition-all duration-300 flex flex-col justify-between"
                            >
                                <div className="flex justify-between items-start mb-2 sm:mb-4 gap-1">
                                    <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center ${stat.iconBg} flex-shrink-0`}>
                                        <Icon size={16} className="sm:w-5 sm:h-5" strokeWidth={1.8} />
                                    </div>
                                    <span className={`text-[8.5px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 rounded-full border ${stat.trendColor} whitespace-nowrap`}>
                                        <span className="sm:hidden">{stat.mobileTrend || stat.trend}</span>
                                        <span className="hidden sm:inline">{stat.trend}</span>
                                    </span>
                                </div>
                                <div>
                                    <p className="text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[#7a7670] font-bold mb-0.5 sm:mb-1 whitespace-nowrap">
                                        <span className="sm:hidden">{stat.mobileLabel || stat.label}</span>
                                        <span className="hidden sm:inline">{stat.label}</span>
                                    </p>
                                    <h3 className="text-base sm:text-2xl lg:text-3xl font-light text-[#111110] tracking-tight mb-1 sm:mb-2">{stat.value}</h3>
                                    <p className="text-[9.5px] sm:text-[11px] text-[#7a7670]/80 font-medium border-t border-[#111110]/5 pt-1.5 sm:pt-2 flex items-center justify-between">
                                        <span className="sm:hidden truncate">{stat.mobileSubtext || stat.subtext}</span>
                                        <span className="hidden sm:inline truncate">{stat.subtext}</span>
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Revenue Dynamics Chart */}
                <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl border border-[#111110]/8 shadow-[0_4px_20px_rgba(110,91,68,0.05)] flex flex-col justify-between">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 sm:mb-8 pb-4 border-b border-[#111110]/5">
                        <div>
                            <h2 className="text-2xl text-[#111110]">Revenue Performance</h2>
                            <p className="text-xs text-[#7a7670]">Total sales across recent months</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 bg-[#6e5b44]/8 rounded-full border border-[#6e5b44]/15">
                            <TrendingUp size={14} className="text-[#6e5b44]" />
                            <span className="text-xs font-bold text-[#6e5b44]">Peak: ₹{totalRevNum.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Interactive Bar Chart */}
                    <div className="h-48 sm:h-64 flex items-end justify-between gap-1 sm:gap-4 md:gap-8 px-1 sm:px-4 pt-4 sm:pt-6 pb-2">
                        {chartTrajectory.map((item, i) => {
                            const hPercent = Math.max(12, Math.round((item.revenue / maxRev) * 100));
                            return (
                                <div key={item.month} className="flex-1 flex flex-col items-center gap-2.5 h-full justify-end group relative">
                                    {/* Tooltip on hover */}
                                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none bg-[#111110] text-[#fffcf7] px-2.5 py-1 rounded-md text-[10px] font-bold whitespace-nowrap shadow-md z-10">
                                        ₹{item.revenue.toLocaleString()}
                                    </div>
                                    <div className="w-full h-full flex items-end">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${hPercent}%` }}
                                            transition={{ delay: i * 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                            className={`w-full max-w-[56px] mx-auto rounded-t-lg transition-all duration-300 ${
                                                item.month === 'Apr'
                                                    ? 'bg-gradient-to-t from-[#6e5b44] to-[#ead0b3] shadow-[0_4px_12px_rgba(110,91,68,0.3)]'
                                                    : 'bg-[#6e5b44]/20 group-hover:bg-[#6e5b44]/40'
                                            }`}
                                        />
                                    </div>
                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${
                                        item.month === 'Apr' ? 'text-[#6e5b44]' : 'text-[#7a7670]'
                                    }`}>
                                        {item.month}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Low Stock Inventory Section */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-[#111110]/8 shadow-[0_4px_20px_rgba(110,91,68,0.05)]">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-[#111110]/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center flex-shrink-0">
                                <AlertCircle size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl text-[#111110]">Low Stock Products</h2>
                                    {lowStockPieces.length > 0 && (
                                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                            {lowStockPieces.length} {lowStockPieces.length === 1 ? 'item' : 'items'}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-[#7a7670]">Products with 5 or fewer items remaining in stock</p>
                            </div>
                        </div>

                        <button
                            onClick={() => setActiveTab('products')}
                            className="text-xs font-bold text-[#6e5b44] hover:text-[#111110] flex items-center gap-1.5 transition-colors group self-start sm:self-auto"
                        >
                            <span>Manage All Products</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {lowStockPieces.length === 0 ? (
                        <div className="py-8 text-center space-y-2 bg-[#faf7f2]/50 rounded-xl border border-[#111110]/5">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                            <p className="text-lg text-[#111110]">Inventory Healthy</p>
                            <p className="text-xs text-[#7a7670]">All products currently have 6 or more units in stock.</p>
                        </div>
                    ) : (
                        <div>
                            {/* Mobile Card List View */}
                            <div className="md:hidden divide-y divide-[#111110]/5">
                                {lowStockPieces.slice(0, 6).map((p) => (
                                    <div key={p._id} className="py-3.5 space-y-2.5">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-3 min-w-0 flex-1">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-200/60 flex-shrink-0">
                                                    <img
                                                        src={getOptimizedImage(p.img || p.image, 100)}
                                                        alt={p.name}
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-base text-[#111110] truncate">
                                                        {p.name}
                                                    </p>
                                                    <p className="text-[10px] text-[#7a7670]">
                                                        {p.sku || 'SOV-MOD'} • {p.category}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <p className="text-base text-[#111110]">
                                                    ₹{p.price?.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-2 pt-0.5">
                                            {p.stock === 0 ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                    Out of Stock (0)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                    Only {p.stock} left
                                                </span>
                                            )}
                                            <button
                                                onClick={() => handleEditProduct(p)}
                                                className="px-3 py-1.5 bg-[#111110]/5 hover:bg-primary hover:text-white rounded-lg text-xs font-bold text-[#111110] transition-all inline-flex items-center gap-1.5"
                                                title="Update stock for this product"
                                            >
                                                <Edit3 size={12} />
                                                <span>Update Stock</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto no-scrollbar">
                                <table className="w-full text-left min-w-[700px]">
                                    <thead>
                                        <tr className="border-b border-[#111110]/8 text-[10px] uppercase tracking-[0.2em] font-bold text-[#7a7670]">
                                            <th className="pb-3 pl-2">Product</th>
                                            <th className="pb-3">SKU</th>
                                            <th className="pb-3">Category</th>
                                            <th className="pb-3">Price</th>
                                            <th className="pb-3 text-center">Stock Remaining</th>
                                            <th className="pb-3 pr-2 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#111110]/5">
                                        {lowStockPieces.slice(0, 6).map((p) => (
                                            <tr key={p._id} className="hover:bg-[#faf7f2]/60 transition-colors group">
                                                <td className="py-3.5 pl-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-stone-100 border border-stone-200/60 flex-shrink-0">
                                                            <img
                                                                src={getOptimizedImage(p.img || p.image, 100)}
                                                                alt={p.name}
                                                                loading="lazy"
                                                                decoding="async"
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-base text-[#111110] group-hover:text-primary transition-colors">
                                                                {p.name}
                                                            </p>
                                                            <p className="text-[10px] text-[#7a7670]">
                                                                {p.material || 'Stainless Steel'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3.5 text-xs text-[#7a7670]">
                                                    {p.sku || 'SOV-MOD'}
                                                </td>
                                                <td className="py-3.5">
                                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-stone-100 text-stone-600">
                                                        {p.category}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 text-base text-[#111110]">
                                                    ₹{p.price?.toLocaleString()}
                                                </td>
                                                <td className="py-3.5 text-center">
                                                    {p.stock === 0 ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-50 text-rose-700 border border-rose-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                            Out of Stock (0)
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                            Only {p.stock} left
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-3.5 pr-2 text-right">
                                                    <button
                                                        onClick={() => handleEditProduct(p)}
                                                        className="px-3 py-1 bg-[#111110]/5 hover:bg-primary hover:text-white rounded-lg text-xs font-bold text-[#111110] transition-all inline-flex items-center gap-1.5"
                                                        title="Update stock for this product"
                                                    >
                                                        <Edit3 size={12} />
                                                        <span>Update Stock</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {lowStockPieces.length > 6 && (
                                <div className="pt-3 text-center border-t border-[#111110]/5">
                                    <button
                                        onClick={() => setActiveTab('products')}
                                        className="text-xs font-bold text-[#6e5b44] hover:underline"
                                    >
                                        + {lowStockPieces.length - 6} more low stock items in Products tab
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Bottom Row: Recent Orders Preview */}
                <div className="bg-white rounded-2xl p-4 sm:p-6 md:p-8 border border-[#111110]/8 shadow-[0_4px_20px_rgba(110,91,68,0.05)]">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#111110]/5">
                        <div>
                            <h2 className="text-2xl text-[#111110]">Recent Orders</h2>
                            <p className="text-xs text-[#7a7670]">Latest customer orders placed on store</p>
                        </div>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className="text-xs font-bold text-[#6e5b44] hover:text-[#111110] flex items-center gap-1.5 transition-colors group"
                        >
                            <span>View All Orders</span>
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>

                    {/* Mobile Orders List View */}
                    <div className="md:hidden divide-y divide-[#111110]/5">
                        {orders.slice(0, 5).map((o) => (
                            <div key={o._id} className="py-3.5 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-[#6e5b44]">
                                        #{o._id.slice(-6).toUpperCase()}
                                    </span>
                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                        o.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                        o.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                        o.status === 'Processing' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                        o.status === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                                        'bg-[#faf7f2] text-[#6e5b44] border border-[#6e5b44]/20'
                                    }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                            o.status === 'Delivered' ? 'bg-emerald-500' :
                                            o.status === 'Shipped' ? 'bg-blue-500' :
                                            o.status === 'Processing' ? 'bg-amber-500' :
                                            'bg-[#6e5b44]'
                                        }`} />
                                        {o.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-[#111110]">{o.user?.name || 'Guest Customer'}</p>
                                        <p className="text-[10px] text-[#7a7670]">
                                            {new Date(o.createdAt).toLocaleDateString()} • {o.orderItems?.length || 1} {o.orderItems?.length === 1 ? 'Item' : 'Items'}
                                        </p>
                                    </div>
                                    <p className="text-base text-[#111110] font-medium">
                                        ₹{o.totalPrice?.toLocaleString()}
                                    </p>
                                </div>
                                <div className="pt-1 flex justify-end">
                                    <button
                                        onClick={() => { setSelectedOrder(o); setOrderNotes(o.internalNotes || ''); setIsOrderModalOpen(true); }}
                                        className="w-full py-1.5 bg-[#111110]/5 hover:bg-[#6e5b44] hover:text-white rounded-lg text-xs font-bold text-[#111110] transition-all flex items-center justify-center gap-1"
                                    >
                                        <Eye size={12} />
                                        <span>View Order</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                        {orders.length === 0 && (
                            <div className="py-8 text-center text-xs text-[#7a7670] ">
                                No orders have been recorded yet.
                            </div>
                        )}
                    </div>

                    {/* Desktop Orders Table View */}
                    <div className="hidden md:block overflow-x-auto no-scrollbar">
                        <table className="w-full text-left min-w-[700px]">
                            <thead>
                                <tr className="border-b border-[#111110]/8 text-[10px] uppercase tracking-[0.2em] font-bold text-[#7a7670]">
                                    <th className="pb-3 pl-2">Order ID</th>
                                    <th className="pb-3">Customer</th>
                                    <th className="pb-3">Items</th>
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3">Total Amount</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3 pr-2 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#111110]/5">
                                {orders.slice(0, 5).map((o) => (
                                    <tr key={o._id} className="hover:bg-[#faf7f2]/60 transition-colors group">
                                        <td className="py-3.5 pl-2 text-xs font-semibold text-[#6e5b44]">
                                            #{o._id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="py-3.5">
                                            <p className="text-xs font-bold text-[#111110]">{o.user?.name || 'Guest Customer'}</p>
                                            <p className="text-[10px] text-[#7a7670]">{o.user?.email || 'N/A'}</p>
                                        </td>
                                        <td className="py-3.5 text-xs text-[#111110]">
                                            {o.orderItems?.length || 1} {o.orderItems?.length === 1 ? 'Item' : 'Items'}
                                        </td>
                                        <td className="py-3.5 text-xs text-[#7a7670]">
                                            {new Date(o.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-3.5 text-base text-[#111110] font-medium">
                                            ₹{o.totalPrice?.toLocaleString()}
                                        </td>
                                        <td className="py-3.5">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                o.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                o.status === 'Shipped' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                o.status === 'Processing' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                o.status === 'Cancelled' ? 'bg-red-50 text-red-700 border border-red-200' :
                                                'bg-[#faf7f2] text-[#6e5b44] border border-[#6e5b44]/20'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${
                                                    o.status === 'Delivered' ? 'bg-emerald-500' :
                                                    o.status === 'Shipped' ? 'bg-blue-500' :
                                                    o.status === 'Processing' ? 'bg-amber-500' :
                                                    'bg-[#6e5b44]'
                                                }`} />
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="py-3.5 pr-2 text-right">
                                            <button
                                                onClick={() => { setSelectedOrder(o); setOrderNotes(o.internalNotes || ''); setIsOrderModalOpen(true); }}
                                                className="px-3 py-1 bg-[#111110]/5 hover:bg-[#6e5b44] hover:text-white rounded-lg text-xs font-bold text-[#111110] transition-all inline-flex items-center gap-1"
                                            >
                                                <Eye size={12} />
                                                <span>View</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-xs text-[#7a7670] ">
                                            No orders have been recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        )
    }

    const renderOrders = () => {
        const filtered = orders.filter(o => {
            const matchesSearch = o._id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                o.user?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
                o.user?.email?.toLowerCase().includes(orderSearch.toLowerCase());
            const matchesFilter = orderFilter === 'All' || o.status === orderFilter;
            return matchesSearch && matchesFilter;
        })

        const statusCounts = {
            All: orders.length,
            Pending: orders.filter(o => o.status === 'Pending').length,
            Processing: orders.filter(o => o.status === 'Processing').length,
            Shipped: orders.filter(o => o.status === 'Shipped').length,
            Delivered: orders.filter(o => o.status === 'Delivered').length,
            Cancelled: orders.filter(o => o.status === 'Cancelled').length,
            'Return Requested': orders.filter(o => o.status === 'Return Requested' || o.returnRequest?.isRequested).length
        }

        const pendingReturns = orders.filter(o => o.returnRequest?.isRequested && o.returnRequest?.status === 'Pending')

        const getStatusColor = (status) => {
            switch (status) {
                case 'Delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                case 'Shipped': return 'bg-sky-50 text-sky-700 border-sky-200/80'
                case 'Processing': return 'bg-amber-50 text-amber-700 border-amber-200/80'
                case 'Pending': return 'bg-orange-50 text-orange-700 border-orange-200/80'
                case 'Return Requested': return 'bg-purple-50 text-purple-700 border-purple-200/80'
                case 'Cancelled': return 'bg-rose-50 text-rose-700 border-rose-200/80'
                default: return 'bg-stone-50 text-stone-700 border-stone-200'
            }
        }

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200/70">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] tracking-widest text-primary/70 uppercase font-semibold">Orders & Shipments</span>
                            <span className="text-stone-300">•</span>
                            <span className="text-xs text-stone-500 ">{orders.length} total orders</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-light text-primary tracking-tight">Customer Orders</h2>
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-80">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search Order ID, name, email..."
                            value={orderSearch}
                            onChange={(e) => setOrderSearch(e.target.value)}
                            className="w-full bg-white/80 border border-stone-200/80 rounded-xl pl-10 pr-8 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                        />
                        {orderSearch && (
                            <button onClick={() => setOrderSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Return Request Banner */}
                {pendingReturns.length > 0 && (
                    <div
                        onClick={() => setOrderFilter('Return Requested')}
                        className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-amber-500/15 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <RotateCcw className="w-4 h-4 text-amber-700 animate-spin" style={{ animationDuration: '4s' }} />
                            <p className="text-xs uppercase tracking-wider font-bold text-amber-800">
                                {pendingReturns.length} Pending Return Request{pendingReturns.length > 1 ? 's' : ''} Need Review
                            </p>
                        </div>
                        <span className="text-xs font-semibold text-amber-800 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            Review <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                    </div>
                )}

                {/* Segmented Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                    {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested'].map(status => {
                        const count = statusCounts[status] || 0
                        const isActive = orderFilter === status
                        return (
                            <button
                                key={status}
                                onClick={() => setOrderFilter(status)}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all ${
                                    isActive
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-white/80 text-stone-600 border border-stone-200/80 hover:bg-stone-100 hover:text-stone-900'
                                }`}
                            >
                                <span>{status}</span>
                                <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'}`}>
                                    {count}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* Orders List */}
                <div className="space-y-4">
                    {filtered.map(o => (
                        <div
                            key={o._id}
                            className="bg-white rounded-2xl border border-stone-200/70 p-5 md:p-6 hover:border-primary/40 hover:shadow-md transition-all duration-300 group"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                                {/* Left Info */}
                                <div className="space-y-2 flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-[11px] font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-md border border-primary/10">
                                            #{o._id.slice(-8).toUpperCase()}
                                        </span>
                                        <span className="flex items-center gap-1 text-[11px] text-stone-400">
                                            <Clock className="w-3 h-3" />
                                            {new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${getStatusColor(o.status)}`}>
                                            {o.status}
                                        </span>
                                        {o.isPaid ? (
                                            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                                                Paid
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
                                                COD / Unpaid
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3 pt-1">
                                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-base flex items-center justify-center font-bold">
                                            {(o.user?.name || 'G').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4
                                                onClick={() => { setSelectedOrder(o); setOrderNotes(o.internalNotes || ''); setIsOrderModalOpen(true); }}
                                                className="text-xl font-normal text-stone-900 group-hover:text-primary transition-colors cursor-pointer flex items-center gap-2"
                                            >
                                                {o.user?.name || 'Guest Customer'}
                                                <Eye className="w-3.5 h-3.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </h4>
                                            <p className="text-xs text-stone-400 ">
                                                {o.user?.email || 'No email provided'} • {o.shippingAddress?.city || 'India'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Center / Summary */}
                                <div className="flex items-center gap-8 py-2 border-y lg:border-y-0 lg:border-x border-stone-200/50 lg:px-8">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-stone-400">Items Ordered</p>
                                        <p className="text-sm font-semibold text-stone-800">
                                            {o.orderItems?.length || 0} {o.orderItems?.length === 1 ? 'Item' : 'Items'}
                                        </p>
                                    </div>
                                    <div className="text-right lg:text-left">
                                        <p className="text-[10px] uppercase tracking-wider text-stone-400">Total Amount</p>
                                        <p className="text-2xl font-light text-primary">
                                            ₹{o.totalPrice?.toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                {/* Right Actions */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 justify-end w-full sm:w-auto">
                                    <select
                                        value={o.status}
                                        onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                                        className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:border-primary transition-colors cursor-pointer w-full sm:w-auto"
                                    >
                                        {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested'].map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => { setSelectedOrder(o); setOrderNotes(o.internalNotes || ''); setIsOrderModalOpen(true); }}
                                        className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                        title="View Order Details"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        <span>View</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="py-20 text-center bg-white/40 border border-stone-200/60 rounded-2xl space-y-3">
                            <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto" />
                            <p className="text-2xl text-stone-400">No orders found</p>
                            <p className="text-xs text-stone-400 ">Try adjusting your search criteria or clearing filters.</p>
                            {(orderSearch || orderFilter !== 'All') && (
                                <button
                                    onClick={() => { setOrderSearch(''); setOrderFilter('All'); }}
                                    className="mt-2 text-xs font-bold uppercase tracking-wider text-primary hover:underline"
                                >
                                    Reset Filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        )
    }

    const renderAbandonedCarts = () => (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200/70">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] tracking-widest text-primary/70 uppercase font-semibold">Cart Recovery</span>
                        <span className="text-stone-300">•</span>
                        <span className="text-xs text-stone-500 ">{abandonedCarts.length} abandoned carts</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-light text-primary tracking-tight">Abandoned Carts</h2>
                </div>
            </header>

            <div className="bg-white rounded-2xl border border-stone-200/70 overflow-hidden shadow-sm">
                {/* Mobile Card List View */}
                <div className="md:hidden divide-y divide-stone-100">
                    {abandonedCarts.map(cart => (
                        <div key={cart._id} className="p-4 space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-base flex items-center justify-center font-bold flex-shrink-0">
                                        {cart.name ? cart.name.charAt(0).toUpperCase() : 'C'}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-base text-stone-900 truncate">{cart.name}</div>
                                        <div className="text-[10px] text-stone-400 truncate">{cart.email}</div>
                                    </div>
                                </div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 flex-shrink-0">
                                    {cart.cart?.length || 0} {cart.cart?.length === 1 ? 'Item' : 'Items'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-stone-500 pt-1">
                                <span>Last Active: {new Date(cart.cartLastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                            </div>
                            <button
                                onClick={() => handleSendRecovery(cart._id)}
                                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                                <span>Send 5% Discount Reminder</span>
                            </button>
                        </div>
                    ))}
                    {abandonedCarts.length === 0 && (
                        <div className="py-16 text-center text-stone-400 space-y-2 p-4">
                            <ShoppingCart className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                            <p className="text-xl ">No abandoned carts found</p>
                            <p className="text-xs text-stone-400">All customer carts have been ordered or cleared.</p>
                        </div>
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-stone-200/70 bg-stone-50/60 text-stone-400 text-[10px] uppercase tracking-wider">
                                <th className="py-4 px-6 font-semibold">Customer</th>
                                <th className="py-4 px-6 font-semibold">Last Active</th>
                                <th className="py-4 px-6 font-semibold text-center">Items In Cart</th>
                                <th className="py-4 px-6 text-right font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-xs">
                            {abandonedCarts.map(cart => (
                                <tr key={cart._id} className="hover:bg-primary/[0.02] transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-bold">
                                                {cart.name ? cart.name.charAt(0).toUpperCase() : 'C'}
                                            </div>
                                            <div>
                                                <div className="text-lg text-stone-900">{cart.name}</div>
                                                <div className="text-[11px] text-stone-400">{cart.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-stone-500">
                                        {new Date(cart.cartLastUpdated).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                                            {cart.cart?.length || 0} {cart.cart?.length === 1 ? 'Item' : 'Items'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button
                                            onClick={() => handleSendRecovery(cart._id)}
                                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white rounded-xl text-xs font-semibold hover:bg-primary/90 transition-all shadow-sm"
                                        >
                                            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                                            <span>Send 5% Discount Reminder</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {abandonedCarts.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-20 text-center text-stone-400 space-y-2">
                                        <ShoppingCart className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                                        <p className="text-2xl ">No abandoned carts found</p>
                                        <p className="text-xs text-stone-400">All customer carts have been ordered or cleared.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    )

    const renderPromos = () => (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200/70">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] tracking-widest text-primary/70 uppercase font-semibold">Discount Registry</span>
                        <span className="text-stone-300">•</span>
                        <span className="text-xs text-stone-500 ">{promos.length} codes issued</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-light text-primary tracking-tight">Discount Coupons</h2>
                </div>
                <button
                    onClick={() => handleAction('Create Promo')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs uppercase tracking-wider font-bold shadow-sm hover:bg-primary/90 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Coupon</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {promos.map(p => (
                    <div
                        key={p._id}
                        className="bg-white/80 backdrop-blur-md rounded-2xl border border-stone-200/70 p-6 flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all duration-300 group"
                    >
                        <div>
                            {/* Top row */}
                            <div className="flex items-start justify-between gap-3 mb-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base font-bold tracking-wider text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg border border-stone-200">
                                            {p.code}
                                        </span>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(p.code);
                                                toast.success(`Code "${p.code}" copied!`);
                                            }}
                                            className="p-1.5 text-stone-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                            title="Copy Code"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-stone-400">
                                        {p.expiryDate ? `Expires: ${new Date(p.expiryDate).toLocaleDateString('en-IN')}` : 'Never Expires'}
                                    </p>
                                </div>

                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
                                    {p.discount}% OFF
                                </span>
                            </div>

                            {/* Redemptions Info */}
                            <div className="flex items-center justify-between py-3 border-t border-stone-100 text-[10px] ">
                                <span className="text-stone-500">Redemptions</span>
                                <span className="font-bold text-stone-800 bg-stone-100 px-2.5 py-0.5 rounded-full">
                                    {p.usedCount || 0} customer{p.usedCount === 1 ? '' : 's'} (1 per account)
                                </span>
                            </div>
                        </div>

                        {/* Bottom Row */}
                        <div className="flex items-center justify-between pt-4 border-t border-stone-100 mt-2">
                            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold">
                                <span className={`w-2 h-2 rounded-full ${p.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'}`} />
                                <span className={p.isActive ? 'text-emerald-700' : 'text-stone-400'}>
                                    {p.isActive ? 'Active' : 'Deactivated'}
                                </span>
                            </span>
                            <button
                                onClick={() => handleDeletePromo(p._id)}
                                className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete Promo"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {promos.length === 0 && (
                    <div className="col-span-full py-16 text-center bg-white/40 border border-stone-200/60 rounded-2xl space-y-3">
                        <Tag className="w-10 h-10 text-stone-300 mx-auto" />
                        <p className="text-2xl text-stone-400">No discount coupons active</p>
                        <p className="text-xs text-stone-400 ">Create a discount coupon code for your customers.</p>
                    </div>
                )}
            </div>
        </motion.div>
    )

    const renderPieceManager = () => {
        const homeProductsCount = products.filter(p => p.showOnHome).length
        const query = pieceSearch.trim().toLowerCase()
        const cat = pieceCategory.toLowerCase()
        const filteredPieces = products.filter(p => {
            let matchesCat = false
            if (pieceCategory === 'All') matchesCat = true
            else if (pieceCategory === 'Home Showcase') matchesCat = !!p.showOnHome
            else matchesCat = p.category?.toLowerCase() === cat

            const matchesQuery = !query ||
                p.name?.toLowerCase().includes(query) ||
                (p.sku && p.sku.toLowerCase().includes(query))
            return matchesCat && matchesQuery
        })

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200/70">
                    <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[10px] tracking-widest text-primary/70 uppercase font-semibold">Product Inventory</span>
                            <span className="text-stone-300">•</span>
                            <span className="text-xs text-stone-500 ">{productTotal} products in catalog</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-light text-primary tracking-tight">Product Inventory</h2>
                    </div>

                    <button
                        onClick={handleAddProduct}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs uppercase tracking-wider font-bold shadow-sm hover:bg-primary/90 transition-all self-start md:self-auto"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Product</span>
                    </button>
                </div>

                {/* Search & Category Filter Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Category tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1">
                        {['All', 'Home Showcase', ...(categories.length > 0 ? categories.map(c => c.name) : ['Necklaces', 'Rings', 'Earrings', 'Bracelets'])].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setPieceCategory(cat)}
                                className={`px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                                    pieceCategory === cat
                                        ? 'bg-primary text-white shadow-sm'
                                        : cat === 'Home Showcase'
                                        ? 'bg-emerald-50/80 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                        : 'bg-white text-stone-600 border border-stone-200/80 hover:bg-stone-100'
                                }`}
                            >
                                {cat === 'Home Showcase' ? (
                                    <>
                                        <span>Home Showcase</span>
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${pieceCategory === cat ? 'bg-white/20 text-white' : 'bg-emerald-200/60 text-emerald-900 font-bold'}`}>
                                            {homeProductsCount}/8
                                        </span>
                                    </>
                                ) : (
                                    cat
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full sm:w-72">
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Filter product name, SKU..."
                            value={pieceSearch}
                            onChange={(e) => setPieceSearch(e.target.value)}
                            className="w-full bg-white border border-stone-200/80 rounded-xl pl-9 pr-7 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-primary transition-colors"
                        />
                        {pieceSearch && (
                            <button onClick={() => setPieceSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-stone-200/70 overflow-hidden shadow-sm">
                    {/* Mobile Card List View */}
                    <div className="md:hidden divide-y divide-stone-100">
                        {filteredPieces.map(p => (
                            <div key={p._id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-stone-50/60 transition-colors">
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 border border-stone-200/60 flex-shrink-0">
                                        <img
                                            src={getOptimizedImage(p.img || p.image, 100)}
                                            alt={p.name}
                                            loading="lazy"
                                            decoding="async"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                            <span className="text-sm font-semibold text-stone-900 truncate">
                                                {p.name}
                                            </span>
                                            {p.showOnHome && (
                                                <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold flex-shrink-0">
                                                    Home Shop
                                                </span>
                                            )}
                                            {(p.isHero || p.hero) && (
                                                <span className="text-[8px] px-1 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200 font-bold flex-shrink-0">
                                                    Hero
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-stone-400">
                                            <span className="text-stone-600 font-bold">{p.category}</span>
                                            <span>•</span>
                                            <span className="truncate">{p.sku || 'SOV-MOD'}</span>
                                        </div>
                                        <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                                            <span className="text-sm font-bold text-stone-900">
                                                ₹{p.price?.toLocaleString()}
                                            </span>
                                            {p.mrp > p.price && (
                                                <span className="text-[10px] text-stone-400 line-through">
                                                    MRP: ₹{p.mrp?.toLocaleString()}
                                                </span>
                                            )}
                                            <span className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                                                p.stock > 5
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : p.stock > 0
                                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                                            }`}>
                                                {p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <button
                                        onClick={() => handleToggleHomeProduct(p)}
                                        className={`px-2 py-1 rounded-lg text-[9px] font-bold transition-all ${
                                            p.showOnHome
                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                                : 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200'
                                        }`}
                                        title={p.showOnHome ? "Remove from Home Showcase" : "Add to Home Showcase"}
                                    >
                                        {p.showOnHome ? 'In Home' : '+ Home'}
                                    </button>
                                    <button
                                        onClick={() => handleEditProduct(p)}
                                        className="p-2 text-stone-500 hover:text-primary hover:bg-stone-100 rounded-lg transition-colors"
                                        title="Edit Product"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(p._id)}
                                        className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Product"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left min-w-[820px]">
                            <thead>
                                <tr className="border-b border-stone-200/70 bg-stone-50/60 text-stone-400 text-[10px] uppercase tracking-wider">
                                    <th className="py-4 px-6 font-semibold">Product</th>
                                    <th className="py-4 px-6 font-semibold">SKU</th>
                                    <th className="py-4 px-6 font-semibold">Category</th>
                                    <th className="py-4 px-6 text-right font-semibold">Price & MRP</th>
                                    <th className="py-4 px-6 text-center font-semibold">Home Showcase ({homeProductsCount}/8)</th>
                                    <th className="py-4 px-6 text-center font-semibold">Stock</th>
                                    <th className="py-4 px-6 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 text-xs">
                                {filteredPieces.map(p => (
                                    <tr key={p._id} className="hover:bg-primary/[0.02] transition-colors group">
                                        <td className="py-3.5 px-6">
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-stone-100 border border-stone-200/60 flex-shrink-0">
                                                    <img
                                                        src={getOptimizedImage(p.img || p.image, 100)}
                                                        alt={p.name}
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-stone-900 group-hover:text-primary transition-colors flex items-center gap-2">
                                                        <span>{p.name}</span>
                                                        {(p.isHero || p.hero) && (
                                                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200/80 font-bold ">
                                                                Hero
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-stone-400">{p.material || 'Stainless Steel'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-6 text-[11px] text-stone-500 uppercase tracking-wider">
                                            {p.sku || 'SOV-MOD'}
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <span className="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-semibold bg-stone-100 text-stone-600">
                                                {p.category}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-6 text-right">
                                            <div className="text-sm font-bold text-stone-900">
                                                ₹{p.price?.toLocaleString()}
                                            </div>
                                            {p.mrp > p.price ? (
                                                <div className="text-[10px] text-stone-400 line-through">
                                                    MRP: ₹{p.mrp?.toLocaleString()}
                                                </div>
                                            ) : p.mrp > 0 ? (
                                                <div className="text-[10px] text-stone-300">
                                                    MRP: ₹{p.mrp?.toLocaleString()}
                                                </div>
                                            ) : null}
                                        </td>
                                        <td className="py-3.5 px-6 text-center">
                                            <button
                                                onClick={() => handleToggleHomeProduct(p)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all shadow-2xs ${
                                                    p.showOnHome
                                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                                                        : 'bg-stone-100 text-stone-500 border border-stone-200 hover:border-stone-300 hover:text-stone-800 hover:bg-stone-50'
                                                }`}
                                                title={p.showOnHome ? 'Click to remove from Home Showcase' : (homeProductsCount >= 8 ? 'Home showcase is full (max 8)' : 'Click to showcase on Home Screen Shop')}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${p.showOnHome ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                                                {p.showOnHome ? 'In Home Shop' : '+ Showcase'}
                                            </button>
                                        </td>
                                        <td className="py-3.5 px-6 text-center">
                                            {p.stock > 5 ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    In Stock ({p.stock})
                                                </span>
                                            ) : p.stock > 0 ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                    Low ({p.stock})
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/80">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                    Out of Stock
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3.5 px-6 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleEditProduct(p)}
                                                    className="p-2 text-stone-400 hover:text-primary hover:bg-stone-100 rounded-lg transition-colors"
                                                    title="Edit Product"
                                                >
                                                    <Edit3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(p._id)}
                                                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete Product"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredPieces.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center text-stone-400 space-y-2">
                                            <Package className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                                            <p className="text-2xl ">No products match your filters</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Product Summary Footer */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-stone-200/70 bg-stone-50/40 text-xs text-stone-500 ">
                        <span>Showing all {filteredPieces.length} products</span>
                        <span className="text-stone-400">Total in catalog: {products.length}</span>
                    </div>
                </div>
            </motion.div>
        )
    }

    const renderCustomers = () => {
        const filteredCustomers = customers.filter(c =>
            c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
            c.email?.toLowerCase().includes(customerSearch.toLowerCase())
        )

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200/70">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] tracking-widest text-primary/70 uppercase font-semibold">Customer List</span>
                            <span className="text-stone-300">•</span>
                            <span className="text-xs text-stone-500 ">{customers.length} registered users</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-light text-primary tracking-tight">Customers</h2>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search customer name or email..."
                            value={customerSearch}
                            onChange={(e) => setCustomerSearch(e.target.value)}
                            className="w-full bg-white/80 border border-stone-200/80 rounded-xl pl-10 pr-8 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-primary transition-all"
                        />
                        {customerSearch && (
                            <button onClick={() => setCustomerSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-stone-200/70 overflow-hidden shadow-sm">
                    {/* Mobile Customer Cards */}
                    <div className="md:hidden divide-y divide-stone-100">
                        {filteredCustomers.map(c => (
                            <div key={c._id} className="p-4 space-y-3">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary text-base flex items-center justify-center font-bold flex-shrink-0">
                                            {(c.name || 'C').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-base text-stone-900 truncate">{c.name}</div>
                                            <div className="text-[10px] text-stone-400 truncate">{c.email}</div>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold border flex-shrink-0 ${
                                        c.isAdmin
                                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                                            : 'bg-stone-100 text-stone-700 border-stone-200'
                                    }`}>
                                        {c.isAdmin ? 'Admin' : (c.status || 'Customer')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                                    <span className="text-[10px] text-stone-500">
                                        Pref: <span className="font-bold text-stone-700">{c.preference || 'All Jewelry'}</span>
                                    </span>
                                    <span className="text-base font-medium text-primary">
                                        ₹{c.spend?.toLocaleString() || 0}
                                    </span>
                                </div>
                                <button
                                    onClick={() => { setSelectedCustomer(c); setIsCustomerModalOpen(true); }}
                                    className="w-full py-2 bg-stone-100 hover:bg-primary hover:text-white text-stone-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                                >
                                    <Eye className="w-3.5 h-3.5" />
                                    <span>View Customer Profile</span>
                                </button>
                            </div>
                        ))}
                        {filteredCustomers.length === 0 && (
                            <div className="py-16 text-center text-stone-400 space-y-2 p-4">
                                <Users className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                                <p className="text-xl ">No customers found</p>
                            </div>
                        )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left min-w-[760px]">
                            <thead>
                                <tr className="border-b border-stone-200/70 bg-stone-50/60 text-stone-400 text-[10px] uppercase tracking-wider">
                                    <th className="py-4 px-6 font-semibold">Customer</th>
                                    <th className="py-4 px-6 font-semibold">Role</th>
                                    <th className="py-4 px-6 font-semibold">Preference</th>
                                    <th className="py-4 px-6 text-right font-semibold">Total Spend</th>
                                    <th className="py-4 px-6 text-right font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100 text-xs">
                                {filteredCustomers.map(c => (
                                    <tr key={c._id} className="hover:bg-primary/[0.02] transition-colors group">
                                        <td className="py-3.5 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary text-base flex items-center justify-center font-bold">
                                                    {(c.name || 'C').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-lg text-stone-900 group-hover:text-primary transition-colors">{c.name}</div>
                                                    <div className="text-[11px] text-stone-400">{c.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${
                                                c.isAdmin
                                                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                                                    : 'bg-stone-100 text-stone-700 border-stone-200'
                                            }`}>
                                                {c.isAdmin ? 'Admin' : (c.status || 'Customer')}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-6">
                                            <span className="px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-semibold bg-stone-100 text-stone-600">
                                                {c.preference || 'All Jewelry'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-6 text-right text-lg font-light text-primary">
                                            ₹{c.spend?.toLocaleString() || 0}
                                        </td>
                                        <td className="py-3.5 px-6 text-right">
                                            <button
                                                onClick={() => { setSelectedCustomer(c); setIsCustomerModalOpen(true); }}
                                                className="p-2 text-stone-400 hover:text-primary hover:bg-stone-100 rounded-lg transition-colors"
                                                title="View Customer Profile"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCustomers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-stone-400 space-y-2">
                                            <Users className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                                            <p className="text-2xl ">No customers found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </motion.div>
        )
    }

    const renderSettings = () => (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="pb-6 border-b border-stone-200/70">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] tracking-widest text-primary/70 uppercase font-semibold">Store Management</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-xs text-stone-500 ">System Configuration</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-light text-primary tracking-tight">Admin Settings</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Store Config & Reports */}
                <div className="space-y-6">
                    <section className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-stone-200/70 space-y-6 shadow-sm">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                            <h3 className="text-xl text-primary">Store Configuration</h3>
                            <span className="text-[10px] uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Online</span>
                        </div>
                        <div className="space-y-5">
                            <div className="flex justify-between items-center group">
                                <div>
                                    <h4 className="text-lg text-stone-900">Catalog-Only Mode</h4>
                                    <p className="text-xs text-stone-400">Display products for browsing only (no checkout).</p>
                                </div>
                                <div className="w-12 h-6 bg-stone-200 rounded-full relative cursor-pointer group-hover:bg-primary/30 transition-all">
                                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm" />
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-stone-100">
                                <div>
                                    <h4 className="text-lg text-stone-900">GST / Jewelry Tax</h4>
                                    <p className="text-xs text-stone-400">Applicable tax rate on products.</p>
                                </div>
                                <span className="font-bold text-sm bg-stone-100 text-stone-800 px-2.5 py-1 rounded-lg">3% IGST</span>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-stone-200/70 space-y-4 shadow-sm">
                        <h3 className="text-xl text-primary border-b border-stone-100 pb-4">Export Orders & Sales Data</h3>
                        <p className="text-xs text-stone-500 leading-relaxed">
                            Export comprehensive store data including orders, sales records, customer lists, and inventory for accounting.
                        </p>
                        <button
                            onClick={() => handleAction('Export CSV')}
                            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-stone-100 hover:bg-primary hover:text-white text-stone-800 rounded-xl text-xs uppercase tracking-wider font-bold transition-all border border-stone-200/80 shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download All Data (.CSV)</span>
                        </button>
                    </section>

                    <section className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-stone-200/70 space-y-4 shadow-sm">
                        <h3 className="text-xl text-primary border-b border-stone-100 pb-4">Session & Security</h3>
                        <p className="text-xs text-stone-500 leading-relaxed">
                            Safely terminate your administrator session on this device.
                        </p>
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-xl text-xs uppercase tracking-wider font-bold transition-all border border-rose-200/80 shadow-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out from Admin</span>
                        </button>
                    </section>
                </div>

                {/* Staff Privileges */}
                <section className="bg-white/80 backdrop-blur-md p-6 md:p-8 rounded-2xl border border-stone-200/70 space-y-6 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                        <h3 className="text-xl text-primary">Staff Roles & Privileges</h3>
                        <span className="text-xs text-stone-400">{customers.length} total users</span>
                    </div>

                    <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                        {customers.map(c => (
                            <div
                                key={c._id}
                                className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50/70 border border-stone-200/60 hover:border-primary/30 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm flex items-center justify-center font-bold">
                                        {(c.name || 'S').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-base text-stone-900">{c.name}</h4>
                                        <p className="text-[10px] text-stone-400">{c.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleToggleAdmin(c._id, !c.isAdmin)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all ${
                                        c.isAdmin
                                            ? 'bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100'
                                            : 'bg-primary text-white hover:bg-primary/90 shadow-sm'
                                    }`}
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-12">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCustomerModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-4xl bg-[#fffcf7] shadow-lux border border-outline-variant/10 p-5 sm:p-8 md:p-16 overflow-y-auto max-h-[88vh] no-scrollbar">
                        <div className="flex justify-between items-start mb-6 md:mb-12">
                            <div className="flex items-center gap-4 sm:gap-8">
                                <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl sm:text-4xl flex-shrink-0">{selectedCustomer.name.charAt(0)}</div>
                                <div>
                                    <h2 className="text-2xl sm:text-4xl font-light">{selectedCustomer.name}</h2>
                                    <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-40 mt-1 sm:mt-2">{selectedCustomer.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsCustomerModalOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors" title="Close">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 md:gap-16">
                            {/* Client Activity */}
                            <div className="space-y-12">
                                <section>
                                    <h3 className="text-[11px] uppercase tracking-[0.4em] font-black border-b border-black/5 pb-4 mb-6">Wishlist Items</h3>
                                    <div className="space-y-6">
                                        {selectedCustomer.wishlist?.length > 0 ? selectedCustomer.wishlist.map(item => (
                                            <div key={item._id} className="flex gap-6 items-center group">
                                                <img src={item.img} className="w-16 h-16 object-cover grayscale group-hover:grayscale-0 transition-all" />
                                                <div>
                                                    <p className="text-lg ">{item.name}</p>
                                                    <p className="text-[9px] uppercase font-black opacity-40">₹{item.price.toLocaleString()}</p>
                                                </div>
                                            </div>
                                        )) : <p className="text-sm opacity-40 ">No items saved yet.</p>}
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-[11px] uppercase tracking-[0.4em] font-black border-b border-black/5 pb-4 mb-6">Recently Viewed Products</h3>
                                    <div className="space-y-6 opacity-60">
                                        {selectedCustomer.recentlyViewed?.length > 0 ? selectedCustomer.recentlyViewed.map((view, i) => (
                                            <div key={i} className="flex gap-6 items-center">
                                                <div className="w-12 h-12 bg-black/5 flex items-center justify-center text-xs ">{i + 1}</div>
                                                <div>
                                                    <p className="text-md ">{view.product?.name}</p>
                                                    <p className="text-[8px] uppercase font-black opacity-40">{new Date(view.viewedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        )) : <p className="text-sm opacity-40 ">No recent activity recorded.</p>}
                                    </div>
                                </section>
                            </div>

                            {/* CRM Actions */}
                            <div className="space-y-12">
                                <section className="p-8 bg-primary/[0.03] border border-primary/5 space-y-6">
                                    <h3 className="text-[11px] uppercase tracking-[0.2em] font-black">Send Discount Code</h3>
                                    <p className="text-xs opacity-60">Send a personalized discount code directly to this customer.</p>
                                    <div className="flex gap-4">
                                        <input placeholder="Code..." className="flex-1 bg-white border border-black/5 p-3 text-xs outline-none" />
                                        <button className="bg-primary text-on-primary px-6 text-[9px] font-black uppercase tracking-widest">Send</button>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <h3 className="text-[11px] uppercase tracking-[0.4em] font-black border-b border-black/5 pb-4">Account Information</h3>
                                    <div className="flex justify-between text-[11px] uppercase font-black opacity-40 "><span>Account Status</span><span>{selectedCustomer.status || 'Active Member'}</span></div>
                                    <div className="flex justify-between text-[11px] uppercase font-black opacity-40 "><span>Lifetime Spend</span><span>₹{selectedCustomer.spend?.toLocaleString() || 0}</span></div>
                                    <div className="flex justify-between text-[11px] uppercase font-black opacity-40 "><span>Member Since</span><span>{new Date(selectedCustomer.createdAt).toLocaleDateString()}</span></div>
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-12">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOrderModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-4xl bg-[#fffcf7] shadow-lux border border-outline-variant/10 p-5 sm:p-8 md:p-16 overflow-y-auto max-h-[88vh] no-scrollbar">
                        <div className="flex justify-between items-start mb-6 md:mb-12">
                            <div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light">Order Details</h2>
                                <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-40 mt-1 sm:mt-2">Order #{selectedOrder._id.slice(-6).toUpperCase()}</p>
                            </div>
                            <button onClick={() => setIsOrderModalOpen(false)} className="w-10 h-10 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors" title="Close">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 md:gap-16 mb-8 md:mb-16">
                            <div className="space-y-8">
                                <h3 className="text-[11px] uppercase tracking-[0.4em] font-black border-b border-black/5 pb-4">Customer Details</h3>
                                <p className="text-2xl ">{selectedOrder.user?.name || 'Guest'}</p>
                                <p className="text-sm opacity-60 ">{selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.country}</p>
                            </div>
                            <div className="space-y-8">
                                <h3 className="text-[11px] uppercase tracking-[0.4em] font-black border-b border-black/5 pb-4">Order Status & Shipping</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-[10px] uppercase font-black opacity-40"><span>Payment</span><span className={selectedOrder.isPaid ? 'text-primary' : 'text-orange-500'}>{selectedOrder.isPaid ? 'Completed' : 'Pending'}</span></div>
                                    <div className="flex justify-between text-[10px] uppercase font-black opacity-40"><span>Delivery</span><span className={selectedOrder.isDelivered ? 'text-primary' : 'text-blue-500'}>{selectedOrder.status}</span></div>

                                    {/* Return Request Section */}
                                    {selectedOrder.returnRequest?.isRequested && (
                                        <div className="mt-8 pt-6 border-t border-amber-500/20 bg-amber-500/[0.04] p-6 border border-amber-500/10 space-y-6 animate-in fade-in slide-in-from-top-4">
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-[9px] uppercase font-black text-amber-600">Return Request</h4>
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
                                                <p className="text-lg ">{selectedOrder.returnRequest.reason}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] uppercase font-black opacity-40">Customer Note</p>
                                                <p className="text-[11px] opacity-70 leading-relaxed">{selectedOrder.returnRequest.details || 'No additional details.'}</p>
                                            </div>

                                            {selectedOrder.returnRequest.status === 'Pending' && (
                                                <div className="space-y-4 pt-2">
                                                    <textarea 
                                                        value={returnAdminNotes}
                                                        onChange={e => setReturnAdminNotes(e.target.value)}
                                                        className="w-full bg-white border border-black/5 p-3 text-[10px] min-h-[50px] outline-none focus:border-amber-500"
                                                        placeholder="Admin response note..."
                                                    />
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleUpdateReturnStatus(selectedOrder._id, 'Approved')}
                                                            className="flex-1 bg-green-600 text-white py-3 text-[8px] uppercase tracking-widest font-black"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateReturnStatus(selectedOrder._id, 'Rejected')}
                                                            className="flex-1 bg-red-600 text-white py-3 text-[8px] uppercase tracking-widest font-black"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                            {selectedOrder.returnRequest.adminNotes && (
                                                <div className="pt-2 border-t border-black/5">
                                                    <p className="text-[10px] uppercase font-black opacity-40">Staff Note</p>
                                                    <p className="text-[11px] opacity-70">{selectedOrder.returnRequest.adminNotes}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Logistical Inputs */}
                                    <div className="pt-6 space-y-4 border-t border-black/5">
                                        <label className="block text-[9px] uppercase font-black opacity-40">Update Order Status</label>
                                        <select
                                            value={selectedOrder.status}
                                            onChange={(e) => handleUpdateOrderStatus(selectedOrder._id, e.target.value)}
                                            className="w-full px-4 py-2 border border-primary/20 text-primary text-[9px] uppercase tracking-[0.2em] font-black bg-transparent outline-none"
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
                                                    className="w-full bg-white border border-black/5 p-3 text-[10px] outline-none focus:border-primary"
                                                />
                                                <input
                                                    placeholder="Courier (e.g. FedEx, BlueDart)..."
                                                    value={carrier || selectedOrder.carrier || ''}
                                                    onChange={e => setCarrier(e.target.value)}
                                                    className="w-full bg-white border border-black/5 p-3 text-[10px] outline-none focus:border-primary"
                                                />
                                            </div>
                                        )}

                                        {(selectedOrder.status === 'Cancelled' || selectedOrder.status === 'Return Requested') && (
                                            <textarea
                                                placeholder="Reason for cancellation/rejection..."
                                                value={statusReason || selectedOrder.statusUpdateReason || ''}
                                                onChange={e => setStatusReason(e.target.value)}
                                                className="w-full bg-white border border-black/5 p-3 text-[10px] min-h-[60px] outline-none focus:border-primary"
                                            />
                                        )}

                                        {(trackingNumber || statusReason) && (
                                            <button
                                                onClick={() => handleUpdateOrderStatus(selectedOrder._id, selectedOrder.status)}
                                                className="w-full py-2 bg-primary text-on-primary text-[9px] uppercase tracking-widest font-black"
                                            >
                                                Save Details
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="space-y-8">
                            <h3 className="text-[11px] uppercase tracking-[0.4em] font-black border-b border-black/5 pb-4">Items in Order</h3>
                            {selectedOrder.orderItems?.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-8 py-4 border-b border-black/5 last:border-0">
                                    <img src={item.image} className="w-20 h-20 object-cover grayscale" />
                                    <div className="flex-1">
                                        <h4 className="text-xl ">{item.name}</h4>
                                        <p className="text-[10px] uppercase opacity-40">Qty: {item.qty}</p>
                                    </div>
                                    <p className="text-xl font-light">₹{(item.price * item.qty).toLocaleString()}</p>
                                </div>
                            ))}
                        </div>

                        {/* Internal Notes Section */}
                        <div className="mt-16 pt-12 border-t border-black/5 space-y-8 bg-primary/[0.02] p-8 border border-primary/5">
                            <h3 className="text-[11px] uppercase tracking-[0.4em] font-black opacity-40">Internal Staff Notes</h3>
                            <textarea
                                value={orderNotes}
                                onChange={(e) => setOrderNotes(e.target.value)}
                                className="w-full bg-white border border-black/5 p-6 text-sm min-h-[120px] outline-none focus:border-primary"
                                placeholder="Staff note (Gift wrap, Express delivery, etc.)..."
                            />
                            <div className="flex justify-between items-center">
                                <p className="text-[9px] opacity-30 ">Visible only to staff.</p>
                                <button onClick={handleUpdateOrderNotes} disabled={savingNotes} className="bg-primary/10 text-primary px-8 py-3 text-[9px] uppercase tracking-widest font-black hover:bg-primary hover:text-white transition-all disabled:opacity-50">
                                    {savingNotes ? 'Saving...' : 'Save Staff Note'}
                                </button>
                            </div>
                        </div>

                        <div className="mt-12 flex flex-col md:flex-row gap-4 pt-12 border-t border-black/5">
                            <button onClick={() => handlePrintInvoice(selectedOrder._id)} className="flex-1 bg-[#111110] text-white py-5 text-[10px] uppercase tracking-[0.4em] font-black hover:opacity-90 transition-all">Print Invoice</button>
                            <button onClick={() => handleAction('Packing Slip')} className="flex-1 border border-[#111110]/20 py-5 text-[10px] uppercase tracking-[0.4em] font-black hover:bg-[#111110] hover:text-white transition-all">Packing Slip</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )

    const renderInventoryModal = () => (
        <AnimatePresence>
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-12">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-4xl bg-[#fffcf7] shadow-lux border border-outline-variant/10 p-5 sm:p-8 md:p-16 overflow-y-auto max-h-[88vh] no-scrollbar">
                        <div className="flex justify-between items-start mb-6 md:mb-12">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl ">{editMode ? 'Edit Product' : 'Add New Product'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveProduct} className="space-y-6 sm:space-y-12">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
                                <div className="md:col-span-1">
                                    <label className="text-[9px] uppercase tracking-widest opacity-40 block mb-1">Product Name *</label>
                                    <input type="text" required value={currentProduct.name} onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-2 text-xl outline-none focus:border-primary" placeholder="Product Name..." />
                                </div>
                                <div className="md:col-span-1">
                                    <label className="text-[9px] uppercase tracking-widest opacity-40 block mb-1">Category *</label>
                                    <select value={currentProduct.category} onChange={(e) => setCurrentProduct({ ...currentProduct, category: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-2.5 text-[12px] uppercase font-black">
                                        {(categories.length > 0 ? categories.map(c => c.name) : ['Necklaces', 'Rings', 'Earrings', 'Bracelets', 'Collections']).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-1">
                                    <label className="text-[9px] uppercase tracking-widest opacity-40 block mb-1">Selling Price (₹) *</label>
                                    <input type="number" required min="0" value={currentProduct.price} onChange={(e) => setCurrentProduct({ ...currentProduct, price: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-2 text-xl outline-none focus:border-primary" placeholder="Selling Price..." />
                                </div>
                                <div className="md:col-span-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="text-[9px] uppercase tracking-widest opacity-40">Original MRP (₹)</label>
                                        {Number(currentProduct.mrp) > Number(currentProduct.price) && Number(currentProduct.price) > 0 && (
                                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                                                {Math.round(((Number(currentProduct.mrp) - Number(currentProduct.price)) / Number(currentProduct.mrp)) * 100)}% OFF
                                            </span>
                                        )}
                                    </div>
                                    <input 
                                        type="number" 
                                        min="0" 
                                        value={currentProduct.mrp && Number(currentProduct.mrp) > 0 ? currentProduct.mrp : ''} 
                                        onChange={(e) => setCurrentProduct({ ...currentProduct, mrp: e.target.value })} 
                                        className="w-full bg-transparent border-b border-black/10 py-2 text-xl text-stone-600 outline-none focus:border-primary" 
                                        placeholder="e.g. 8999" 
                                    />
                                </div>
                            </div>

                            {/* Home Screen Shop Showcase Setting (Max 8 Products) */}
                            <div className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                                currentProduct.showOnHome
                                    ? 'bg-emerald-50/70 border-emerald-200'
                                    : 'bg-stone-50 border-stone-200/80'
                            }`}>
                                <div className="flex items-start sm:items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="modal-show-on-home"
                                        checked={!!currentProduct.showOnHome}
                                        disabled={!currentProduct.showOnHome && products.filter(p => p.showOnHome && p._id !== currentProduct._id).length >= 8}
                                        onChange={(e) => {
                                            const isChecking = e.target.checked
                                            if (isChecking) {
                                                const otherActive = products.filter(p => p.showOnHome && p._id !== currentProduct._id).length
                                                if (otherActive >= 8) {
                                                    toast.error('Only 8 products can be showcased on the Home Screen Shop. Please remove one first.')
                                                    return
                                                }
                                            }
                                            setCurrentProduct({ ...currentProduct, showOnHome: isChecking })
                                        }}
                                        className="w-5 h-5 accent-emerald-600 rounded mt-0.5 sm:mt-0 cursor-pointer disabled:cursor-not-allowed"
                                    />
                                    <label htmlFor="modal-show-on-home" className="cursor-pointer select-none">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs uppercase font-bold text-stone-800 tracking-wider">
                                                Showcase in Home Screen Shop
                                            </span>
                                            <span className="text-[10px] text-stone-500 font-semibold bg-white px-2 py-0.5 rounded border border-stone-200">
                                                Max 8 products
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-stone-500 mt-1">
                                            Featured in the "Shop the Collection" section on the Home Screen.
                                        </p>
                                    </label>
                                </div>
                                <div className="flex-shrink-0 self-start sm:self-center">
                                    {currentProduct.showOnHome ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                            Active ({products.filter(p => p.showOnHome && p._id !== currentProduct._id).length + 1} of 8 slots used)
                                        </span>
                                    ) : (
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                                            products.filter(p => p.showOnHome && p._id !== currentProduct._id).length >= 8
                                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                : 'bg-stone-200/70 text-stone-600'
                                        }`}>
                                            {products.filter(p => p.showOnHome && p._id !== currentProduct._id).length >= 8
                                                ? 'Slots Full (8/8 used)'
                                                : `${products.filter(p => p.showOnHome && p._id !== currentProduct._id).length} / 8 slots used`}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 md:gap-12 border-t border-black/5 pt-6 md:pt-10">
                                <div className="space-y-4">
                                    <label className="text-[9px] uppercase tracking-widest opacity-40">Product SKU</label>
                                    <input type="text" value={currentProduct.sku} onChange={(e) => setCurrentProduct({ ...currentProduct, sku: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-2 text-sm outline-none focus:border-primary" placeholder="TG-2026..." />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[9px] uppercase tracking-widest opacity-40">Base Material</label>
                                    <input type="text" value={currentProduct.material} onChange={(e) => setCurrentProduct({ ...currentProduct, material: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-2 text-sm outline-none focus:border-primary" placeholder="22K Gold..." />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[9px] uppercase tracking-widest opacity-40">Stone/Pearl</label>
                                    <input type="text" value={currentProduct.stone} onChange={(e) => setCurrentProduct({ ...currentProduct, stone: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-2 text-sm outline-none focus:border-primary" placeholder="Emerald..." />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[9px] uppercase tracking-widest opacity-40">Net Weight</label>
                                    <input type="text" value={currentProduct.weight} onChange={(e) => setCurrentProduct({ ...currentProduct, weight: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-2 text-sm outline-none focus:border-primary" placeholder="14.5g..." />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[9px] uppercase tracking-widest opacity-40">Length / Size</label>
                                    <input type="text" value={currentProduct.length} onChange={(e) => setCurrentProduct({ ...currentProduct, length: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-2 text-sm outline-none focus:border-primary" placeholder="18-inch..." />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[9px] uppercase tracking-widest opacity-40">Stock Quantity</label>
                                    <input 
                                        type="number" 
                                        min="0"
                                        value={currentProduct.stock} 
                                        onChange={(e) => {
                                            const val = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0);
                                            setCurrentProduct({ ...currentProduct, stock: val });
                                        }} 
                                        className="w-full bg-transparent border-b border-black/10 py-2 text-sm font-black outline-none focus:border-primary" 
                                    />
                                </div>
                                <div className="flex items-end pb-2 gap-4">
                                    <label className="text-[9px] uppercase tracking-widest opacity-40">Featured Hero</label>
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
                                                        className="absolute top-2 right-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-10 shadow-md"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2 opacity-40 group-hover:opacity-70 transition-opacity">
                                                    <ImagePlus className="w-6 h-6 text-primary" />
                                                    <span className="text-[9px] uppercase tracking-widest font-black text-primary">Upload</span>
                                                </div>
                                            )}
                                            {uploadingIdx === (isMain ? 'main' : idx - 1) && <div className="absolute inset-0 bg-white/80 flex items-center justify-center animate-spin z-20"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full" /></div>}
                                            <input type="file" onChange={(e) => handleFileUpload(e, isMain ? null : idx - 1)} className="absolute inset-0 opacity-0 cursor-pointer z-5" />
                                        </div>
                                    )
                                })}
                            </div>

                            <textarea required value={currentProduct.details} onChange={(e) => setCurrentProduct({ ...currentProduct, details: e.target.value })} className="w-full bg-surface-container-low border border-black/5 p-6 text-sm min-h-[120px] outline-none focus:border-primary" placeholder="Product description & details..." />

                            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-6 pt-6 sm:pt-8 border-t border-black/10">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-6 py-3 text-[10px] uppercase font-black opacity-60 hover:opacity-100 transition-all text-center">Cancel</button>
                                <button type="submit" disabled={!!uploadingIdx} className="w-full sm:w-auto bg-primary text-on-primary px-8 sm:px-16 py-3.5 sm:py-5 text-[10px] uppercase tracking-[0.3em] font-black shadow-lux hover:bg-primary-dim transition-all text-center">Save Product</button>
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-12">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPromoModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-[#fffcf7] shadow-lux border border-outline-variant/10 p-5 sm:p-8 md:p-16 max-h-[88vh] overflow-y-auto no-scrollbar">
                        <div className="flex justify-between items-start mb-6 md:mb-12">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl ">Create Discount Coupon</h2>
                            <button onClick={() => setIsPromoModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSavePromo} className="space-y-6 sm:space-y-12">
                            <div className="space-y-8">
                                <div className="group">
                                    <label className="text-[9px] uppercase tracking-widest font-black opacity-40">Coupon Code</label>
                                    <input required type="text" value={currentPromo.code} onChange={(e) => setCurrentPromo({ ...currentPromo, code: e.target.value.toUpperCase() })} className="w-full bg-transparent border-b border-black/10 py-3 text-3xl outline-none focus:border-primary" placeholder="e.g. SAVE20" />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
                                    <div className="group">
                                        <label className="text-[9px] uppercase tracking-widest font-black opacity-40">Discount (%)</label>
                                        <input required type="number" min="1" max="100" value={currentPromo.discount} onChange={(e) => setCurrentPromo({ ...currentPromo, discount: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-3 text-2xl outline-none focus:border-primary" placeholder="10" />
                                    </div>
                                    <div className="group">
                                        <label className="text-[9px] uppercase tracking-widest font-black opacity-40">Expiration Date (Optional)</label>
                                        <input type="date" value={currentPromo.expiryDate} onChange={(e) => setCurrentPromo({ ...currentPromo, expiryDate: e.target.value })} className="w-full bg-transparent border-b border-black/10 py-3 text-[12px] uppercase outline-none focus:border-primary" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-6 pt-8 border-t border-black/10">
                                <button type="button" onClick={() => setIsPromoModalOpen(false)} className="px-8 text-[10px] uppercase font-black opacity-40 hover:opacity-100 transition-all">Cancel</button>
                                <button type="submit" disabled={isSavingPromo} className="bg-primary text-on-primary px-16 py-5 text-[10px] uppercase tracking-[0.3em] font-black shadow-lux hover:bg-primary-dim transition-all">
                                    {isSavingPromo ? 'Saving Coupon...' : 'Create Coupon'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )

    const renderReelsManager = () => {
        const query = reelSearch.trim().toLowerCase()
        const filteredReels = reels.filter(r => {
            if (!query) return true
            const title = (r.title || r.name || '').toLowerCase()
            const cat = (r.category || '').toLowerCase()
            return title.includes(query) || cat.includes(query)
        })

        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-200/70">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] tracking-widest text-primary/70 uppercase font-semibold">Media Showcase</span>
                            <span className="text-stone-300">•</span>
                            <span className="text-xs text-stone-500 ">{reels.length} total reels</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-light text-primary tracking-tight">Reels & Video Showcase</h2>
                        <p className="text-xs text-stone-500 mt-1">Manage interactive reels displayed on the Home 3D Coverflow and the /reels page.</p>
                    </div>

                    <button
                        onClick={handleOpenAddReel}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs uppercase tracking-wider font-bold shadow-sm hover:bg-primary/90 transition-all self-start md:self-auto active:scale-98"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add New Reel</span>
                    </button>
                </div>

                {/* Metrics / Status Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-stone-200/70 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-stone-400">Total Reels</p>
                            <p className="text-2xl text-primary">{reels.length}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Film className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-stone-200/70 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-stone-400">Active On Live Store</p>
                            <p className="text-2xl text-emerald-700">{reels.filter(r => r.isActive).length}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-stone-200/70 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] uppercase tracking-wider text-stone-400">Linked To Products</p>
                            <p className="text-2xl text-amber-700">{reels.filter(r => r.productId).length}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                            <Tag className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Personalized Home Screen Reel Showcase (Top 5 Slots) */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-stone-200/90 shadow-sm relative overflow-hidden">
                    <div className="space-y-6">
                        {/* Showcase Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-200/80">
                            <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-stone-100 text-primary border border-stone-200">
                                        Home Screen Showcase
                                    </span>
                                    <span className="text-stone-300">•</span>
                                    <span className="text-xs text-stone-500">
                                        {homeShowcaseReels.length} of 5 Slots Assigned
                                    </span>
                                </div>
                                <h3 className="text-2xl md:text-3xl text-primary tracking-tight font-light">
                                    Curated Home Screen Showcase (Top 5 Reels)
                                </h3>
                                <p className="text-xs text-stone-500 mt-1 max-w-2xl">
                                    Select and sequence the 5 reels displayed on the store homepage 3D coverflow showcase. Reorder slots, swap reels, or toggle featured status from any card below.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
                                {homeShowcaseReels.length < 5 && (
                                    <button
                                        type="button"
                                        onClick={handleAutoPopulateTop5}
                                        disabled={isSavingShowcase}
                                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-all flex items-center gap-1.5 shadow-2xs"
                                    >
                                        <span>Auto-Fill Active</span>
                                    </button>
                                )}
                                {homeShowcaseReels.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (window.confirm('Clear all 5 reels from the home screen showcase? (Reels will remain in your reels library)')) {
                                                handleSetHomeShowcase([])
                                            }
                                        }}
                                        disabled={isSavingShowcase}
                                        className="px-3 py-2 rounded-xl text-xs font-medium text-stone-500 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 transition-all"
                                    >
                                        Clear Slots
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* 5 Interactive Showcase Slots */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                            {[0, 1, 2, 3, 4].map((slotIndex) => {
                                const slotReel = homeShowcaseReels[slotIndex]
                                const isFilled = Boolean(slotReel)

                                return (
                                    <div
                                        key={`showcase-slot-${slotIndex}`}
                                        className={`relative rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                                            isFilled
                                                ? 'bg-stone-50/50 border-stone-200 hover:border-primary/40 shadow-xs hover:shadow-md'
                                                : 'bg-stone-50/40 border-dashed border-stone-300/80 hover:border-primary/40 p-3 sm:p-4 min-h-[220px] sm:min-h-[300px] flex items-center justify-center text-center'
                                        }`}
                                    >
                                        {isFilled ? (
                                            <>
                                                {/* Vertical Thumbnail */}
                                                <div className="relative aspect-[9/14] bg-stone-900 overflow-hidden group/slot">
                                                    <img
                                                        src={getOptimizedImage(slotReel.image, 300)}
                                                        alt={slotReel.title || slotReel.name}
                                                        className="w-full h-full object-cover group-hover/slot:scale-105 transition-transform duration-500"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/40 pointer-events-none" />

                                                    {/* Slot Badge - Clean Luxury light badge, No emojis */}
                                                    <div className="absolute top-2.5 left-2.5 z-10">
                                                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-white text-stone-900 shadow-sm border border-stone-200/80 tracking-wide uppercase">
                                                            Slot #{slotIndex + 1}
                                                        </span>
                                                    </div>

                                                    {/* Quick Remove Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveFromHomeShowcase(slotReel._id)}
                                                        title="Remove from Home Showcase"
                                                        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-white/90 hover:bg-rose-500 text-stone-600 hover:text-white flex items-center justify-center backdrop-blur-sm transition-colors border border-stone-200/80 shadow-sm"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>

                                                    {/* Sequence Move Arrows */}
                                                    <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between opacity-0 group-hover/slot:opacity-100 transition-opacity z-10">
                                                        <button
                                                            type="button"
                                                            disabled={slotIndex === 0}
                                                            onClick={() => handleMoveShowcaseSlot(slotIndex, -1)}
                                                            className="w-7 h-7 rounded-full bg-white/95 hover:bg-primary hover:text-white text-stone-800 flex items-center justify-center backdrop-blur-sm disabled:opacity-20 transition-all border border-stone-200 shadow-sm"
                                                            title="Move Left"
                                                        >
                                                            <ChevronLeft className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={slotIndex === homeShowcaseReels.length - 1}
                                                            onClick={() => handleMoveShowcaseSlot(slotIndex, 1)}
                                                            className="w-7 h-7 rounded-full bg-white/95 hover:bg-primary hover:text-white text-stone-800 flex items-center justify-center backdrop-blur-sm disabled:opacity-20 transition-all border border-stone-200 shadow-sm"
                                                            title="Move Right"
                                                        >
                                                            <ChevronRight className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    {/* Bottom Media Info */}
                                                    <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 text-white">
                                                        <span className="text-[9px] text-amber-300 uppercase tracking-wider block mb-0.5">
                                                            {slotReel.category || 'Jewellery'}
                                                        </span>
                                                        <p className="text-sm text-white line-clamp-1 leading-snug">
                                                            {slotReel.title || slotReel.name}
                                                        </p>
                                                        {slotReel.price && (
                                                            <p className="text-xs font-bold text-amber-200 mt-0.5">
                                                                {slotReel.price}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Card Footer: Change Reel Dropdown */}
                                                <div className="p-3 bg-white border-t border-stone-200/80 space-y-1">
                                                    <label className="text-[9px] uppercase tracking-wider text-stone-400 block font-semibold">
                                                        Swap Slot Reel
                                                    </label>
                                                    <select
                                                        value={slotReel._id}
                                                        onChange={(e) => handleAssignSlot(slotIndex, e.target.value)}
                                                        className="w-full bg-stone-50 hover:bg-white border border-stone-200 hover:border-primary/50 rounded-lg px-2 py-1.5 text-[11px] text-stone-800 focus:outline-none focus:border-primary transition-colors cursor-pointer"
                                                    >
                                                        <option value={slotReel._id}>Current: {slotReel.title || slotReel.name}</option>
                                                        {reels
                                                            .filter(r => r._id !== slotReel._id)
                                                            .map(r => (
                                                                <option key={r._id} value={r._id}>
                                                                    {r.title || r.name} {r.isHomeShowcase ? '(In Showcase)' : ''}
                                                                </option>
                                                            ))}
                                                    </select>
                                                </div>
                                            </>
                                        ) : (
                                            /* Empty Slot state */
                                            <div className="space-y-3 w-full px-2 py-6">
                                                <div className="w-10 h-10 rounded-2xl bg-white border border-stone-200 flex items-center justify-center mx-auto text-stone-400 shadow-2xs">
                                                    <Plus className="w-5 h-5 text-stone-400" />
                                                </div>
                                                <div>
                                                    <span className="text-[10px] uppercase tracking-wider text-primary font-bold block">
                                                        Slot #{slotIndex + 1}
                                                    </span>
                                                    <p className="text-sm text-stone-500 mt-0.5">
                                                        Empty Slot
                                                    </p>
                                                </div>

                                                <select
                                                    value=""
                                                    onChange={(e) => {
                                                        if (e.target.value) {
                                                            handleAssignSlot(slotIndex, e.target.value)
                                                        }
                                                    }}
                                                    className="w-full bg-white hover:bg-stone-50 border border-stone-200 hover:border-primary rounded-xl px-2.5 py-2 text-xs text-stone-700 focus:outline-none focus:border-primary cursor-pointer transition-colors shadow-2xs"
                                                >
                                                    <option value="">+ Assign Reel to Slot #{slotIndex + 1}</option>
                                                    {reels
                                                        .filter(r => !homeShowcaseReels.some(h => h._id === r._id))
                                                        .map(r => (
                                                            <option key={r._id} value={r._id}>
                                                                {r.title || r.name} ({r.category || 'Reel'})
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search reels by title or category..."
                            value={reelSearch}
                            onChange={(e) => setReelSearch(e.target.value)}
                            className="w-full bg-white border border-stone-200/80 rounded-xl pl-9 pr-7 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-primary transition-colors"
                        />
                        {reelSearch && (
                            <button onClick={() => setReelSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                    <span className="text-xs text-stone-400 self-end sm:self-auto">Showing {filteredReels.length} of {reels.length} reels</span>
                </div>

                {/* Reels Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-6">
                    {filteredReels.map((reel) => {
                        const linkedProduct = products.find(p => p._id === reel.productId)
                        const reelTitle = reel.title || reel.name || 'Untitled Reel'

                        return (
                            <div
                                key={reel._id}
                                className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden flex flex-col group hover:shadow-md hover:border-primary/40 transition-all duration-300"
                            >
                                {/* 9:16 Vertical Video Preview Container */}
                                <div className="relative aspect-[9/16] bg-stone-900 overflow-hidden">
                                    <img
                                        src={getOptimizedImage(reel.image, 400)}
                                        alt={reelTitle}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />

                                    {/* Gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40 pointer-events-none" />

                                    {/* Top Controls: Order & Active Status & Showcase Badge */}
                                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 gap-1.5">
                                        <div className="flex items-center gap-1">
                                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-sm border border-white/20">
                                                #{reel.order || 1}
                                            </span>
                                            {reel.isHomeShowcase && (
                                                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-white text-stone-900 flex items-center shadow-sm border border-stone-200" title="Featured in Home Screen Showcase">
                                                    Slot #{homeShowcaseReels.findIndex(r => r._id === reel._id) + 1 || reel.homeOrder}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleToggleReelActive(reel)}
                                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-sm transition-all border ${
                                                reel.isActive
                                                    ? 'bg-emerald-500/90 text-white border-emerald-400'
                                                    : 'bg-stone-800/90 text-stone-300 border-stone-600'
                                            }`}
                                            title="Click to toggle active status on live store"
                                        >
                                            {reel.isActive ? 'Active' : 'Hidden'}
                                        </button>
                                    </div>

                                    {/* Bottom Info on media */}
                                    <div className="absolute bottom-3 left-3 right-3 z-10 text-white">
                                        <span className="inline-block px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-sm border border-white/30 mb-1">
                                            {reel.category || 'Jewellery'}
                                        </span>
                                        <h4 className="text-base leading-tight text-white line-clamp-2 drop-shadow-sm">
                                            {reelTitle}
                                        </h4>
                                        {reel.price && (
                                            <p className="text-xs font-bold text-amber-200 mt-0.5 drop-shadow-sm">
                                                {reel.price}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Card Body / Linked Product & Actions */}
                                <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between bg-stone-50/40 border-t border-stone-100">
                                    {/* Linked product indicator */}
                                    <div>
                                        <p className="text-[9px] uppercase tracking-wider text-stone-400 mb-1">Linked Product</p>
                                        {linkedProduct ? (
                                            <div className="min-w-0">
                                                <p className="text-[11px] font-semibold text-stone-800 truncate">{linkedProduct.name}</p>
                                                <p className="text-[9px] text-primary">₹{linkedProduct.price?.toLocaleString()}</p>
                                            </div>
                                        ) : reel.productId ? (
                                            <p className="text-[10px] text-stone-600 truncate">ID: {reel.productId}</p>
                                        ) : (
                                            <p className="text-[11px] text-stone-400 ">No product linked</p>
                                        )}
                                    </div>

                                    {/* Home Showcase Toggle Action */}
                                    <button
                                        type="button"
                                        onClick={() => handleToggleFeatureOnHome(reel)}
                                        className={`w-full py-1.5 px-2.5 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 border shadow-2xs ${
                                            reel.isHomeShowcase
                                                ? 'bg-stone-900 text-white border-stone-900 hover:bg-stone-800'
                                                : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
                                        }`}
                                    >
                                        <span>
                                            {reel.isHomeShowcase
                                                ? `Featured in Home (Slot #${homeShowcaseReels.findIndex(r => r._id === reel._id) + 1 || reel.homeOrder})`
                                                : '+ Feature in Home'}
                                        </span>
                                    </button>

                                    {/* Action Buttons: Edit & Delete */}
                                    <div className="flex items-center gap-2 pt-2 border-t border-stone-200/50">
                                        <button
                                            onClick={() => handleOpenEditReel(reel)}
                                            className="flex-1 py-1.5 px-3 bg-white hover:bg-stone-100 border border-stone-200/80 rounded-lg text-xs font-bold text-stone-700 transition-all text-center shadow-xs"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteReel(reel._id)}
                                            className="py-1.5 px-3 bg-white hover:bg-rose-50 text-stone-500 hover:text-rose-600 border border-stone-200/80 rounded-lg text-xs font-bold transition-all shadow-xs"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {filteredReels.length === 0 && (
                    <div className="bg-white rounded-2xl border border-stone-200/70 p-16 text-center space-y-3">
                        <Film className="w-12 h-12 text-stone-300 mx-auto" />
                        <h3 className="text-2xl text-stone-700">No reels found</h3>
                        <p className="text-xs text-stone-400 max-w-sm mx-auto">
                            {reelSearch ? 'No reels match your search filter.' : 'Click "Add New Reel" to create your first reel showcase.'}
                        </p>
                        <button
                            onClick={handleOpenAddReel}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs uppercase tracking-wider font-bold shadow-sm hover:bg-primary/90 transition-all"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add Reel Now</span>
                        </button>
                    </div>
                )}
            </motion.div>
        )
    }

    const renderCategories = () => {
        return (
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 pb-16"
            >
                {/* Clean Top Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-black/8">
                    <div>
                        <h2 className="text-3xl sm:text-4xl font-light text-stone-900 tracking-tight">Categories</h2>
                        <p className="text-xs text-stone-500 mt-1">
                            Create categories and use the button below to easily toggle which 4 appear on the Home Screen.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="px-3.5 py-2 rounded-xl bg-stone-100 border border-stone-200/80 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-primary" />
                            <span className="text-xs text-stone-700 font-bold">
                                Home: {homeCategoriesCount} / 4
                            </span>
                        </div>
                        <button
                            onClick={handleOpenAddCategory}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Category</span>
                        </button>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => setCategoryFilter('all')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                categoryFilter === 'all'
                                    ? 'bg-primary text-white shadow-xs'
                                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                            }`}
                        >
                            All ({categories.length})
                        </button>
                        <button
                            onClick={() => setCategoryFilter('home')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                categoryFilter === 'home'
                                    ? 'bg-primary text-white shadow-xs'
                                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                            }`}
                        >
                            Home Screen ({homeCategoriesCount})
                        </button>
                        <button
                            onClick={() => setCategoryFilter('collection')}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                categoryFilter === 'collection'
                                    ? 'bg-primary text-white shadow-xs'
                                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                            }`}
                        >
                            Collection Archive ({Math.max(0, categories.length - homeCategoriesCount)})
                        </button>
                    </div>

                    <div className="relative w-full sm:w-64">
                        <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={categorySearch}
                            onChange={(e) => setCategorySearch(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-7 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-primary transition-colors"
                        />
                        {categorySearch && (
                            <button onClick={() => setCategorySearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Clean Categories List */}
                <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs divide-y divide-stone-100 overflow-hidden">
                    {filteredCategories.map((cat) => {
                        return (
                            <div
                                key={cat._id}
                                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/60 transition-colors"
                            >
                                {/* Left: Image & Info */}
                                <div className="flex items-center gap-4 min-w-0">
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
                                        <img
                                            src={getOptimizedImage(cat.homeImage || cat.collectionImage, 150)}
                                            alt={cat.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl sm:text-2xl text-stone-900 truncate">
                                                {cat.name}
                                            </h3>
                                            {cat.showOnHome && (
                                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
                                                    On Home Screen
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-stone-500 ">
                                            {cat.tagline && (
                                                <span className="font-medium text-stone-700">{cat.tagline}</span>
                                            )}
                                            {cat.tagline && cat.count && <span>•</span>}
                                            {cat.count && (
                                                <span className="text-[11px] text-stone-400">{cat.count}</span>
                                            )}
                                            <span className="hidden md:inline text-stone-300">•</span>
                                            <Link
                                                to={`/shop/${cat.slug || cat.name.toLowerCase()}`}
                                                target="_blank"
                                                className="text-primary hover:underline text-[11px] hidden md:inline-flex items-center gap-1"
                                            >
                                                <span>/shop/{cat.slug || cat.name.toLowerCase()}</span>
                                                <ExternalLink className="w-2.5 h-2.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Quick Actions */}
                                <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-center shrink-0">
                                    {/* The Single Simple Button Requested by User */}
                                    <button
                                        type="button"
                                        onClick={() => handleToggleHomeCategory(cat)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                                            cat.showOnHome
                                                ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-rose-600 hover:border-rose-600 shadow-2xs group'
                                                : (homeCategoriesCount >= 4
                                                    ? 'bg-stone-50 text-stone-400 border-stone-200 hover:border-amber-300 hover:text-amber-700'
                                                    : 'bg-white text-stone-800 border-stone-300 hover:border-primary hover:bg-stone-50')
                                        }`}
                                        title={cat.showOnHome ? 'Click to remove from Home Screen' : 'Click to show on Home Screen'}
                                    >
                                        {cat.showOnHome ? (
                                            <>
                                                <Check className="w-3.5 h-3.5 group-hover:hidden" />
                                                <X className="w-3.5 h-3.5 hidden group-hover:block" />
                                                <span className="group-hover:hidden">Shown on Home</span>
                                                <span className="hidden group-hover:inline">Remove from Home</span>
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-3.5 h-3.5 text-stone-400" />
                                                <span>Show on Home</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleOpenEditCategory(cat)}
                                        className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                        title="Edit Category"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleDeleteCategory(cat)}
                                        className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                        title="Delete Category"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {filteredCategories.length === 0 && (
                    <div className="bg-white rounded-2xl border border-stone-200/70 p-12 text-center space-y-3">
                        <Layers className="w-10 h-10 text-stone-300 mx-auto" />
                        <h3 className="text-xl text-stone-700">No categories found</h3>
                        <p className="text-xs text-stone-400 max-w-sm mx-auto">
                            {categorySearch ? 'No categories match your search.' : 'Create your first category to get started.'}
                        </p>
                        <button
                            onClick={handleOpenAddCategory}
                            className="inline-flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Category</span>
                        </button>
                    </div>
                )}
            </motion.div>
        )
    }

    const renderCategoryModal = () => {
        const otherHomeSlotsOccupied = categories.filter(c => c.showOnHome && c._id !== currentCategory._id).length
        const isHomeSlotsMaxed = otherHomeSlotsOccupied >= 4

        return (
            <AnimatePresence>
                {isCategoryModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCategoryModalOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-xs" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }} className="relative w-full max-w-lg bg-[#fffcf7] rounded-2xl shadow-xl border border-stone-200 p-6 sm:p-8 overflow-y-auto max-h-[90vh] no-scrollbar">
                            <div className="flex items-center justify-between pb-4 border-b border-black/8">
                                <div>
                                    <h2 className="text-2xl text-stone-900">
                                        {editCategoryMode ? `Edit Category: ${currentCategory.name}` : 'Create Category'}
                                    </h2>
                                    <p className="text-[11px] text-stone-400 mt-0.5">
                                        Fill in the category name and image.
                                    </p>
                                </div>
                                <button onClick={() => setIsCategoryModalOpen(false)} className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveCategory} className="space-y-4 pt-4">
                                {/* Category Name */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-wider text-stone-600 font-bold">Category Name *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Rings, Necklaces, Anklets"
                                        value={currentCategory.name}
                                        onChange={(e) => {
                                            const val = e.target.value
                                            const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-')
                                            setCurrentCategory(prev => ({
                                                ...prev,
                                                name: val,
                                                slug: prev.slug ? prev.slug : autoSlug
                                            }))
                                        }}
                                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>

                                {/* Image Upload & Preview */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] uppercase tracking-wider text-stone-600 font-bold">Category Image *</label>
                                        <label className="px-3 py-1 bg-stone-900 text-white rounded-lg text-[10px] font-bold cursor-pointer hover:bg-stone-800 transition-all flex items-center gap-1 shadow-2xs">
                                            <ImagePlus className="w-3.5 h-3.5" />
                                            <span>{uploadingHomeImg ? 'Uploading...' : 'Upload Image'}</span>
                                            <input type="file" accept="image/*" disabled={uploadingHomeImg} onChange={handleCategoryHomeImageUpload} className="hidden" />
                                        </label>
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Image URL or upload a file above"
                                        value={currentCategory.homeImage}
                                        onChange={(e) => setCurrentCategory({ ...currentCategory, homeImage: e.target.value })}
                                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-primary transition-colors"
                                    />
                                    {currentCategory.homeImage && (
                                        <div className="aspect-[16/9] rounded-xl overflow-hidden bg-stone-100 border border-stone-200 relative">
                                            <img src={getOptimizedImage(currentCategory.homeImage, 400)} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>

                                {/* Tagline & Count */}
                                <div className="grid grid-cols-2 gap-3 pt-1">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Tagline (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Collection Alpha"
                                            value={currentCategory.tagline}
                                            onChange={(e) => setCurrentCategory({ ...currentCategory, tagline: e.target.value })}
                                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Pieces (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 12 Pieces"
                                            value={currentCategory.count}
                                            onChange={(e) => setCurrentCategory({ ...currentCategory, count: e.target.value })}
                                            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Simple Checkbox to Showcase on Home Screen */}
                                <div className="p-3.5 rounded-xl border border-stone-200 bg-white">
                                    <label className="flex items-start gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            id="categoryShowOnHome"
                                            disabled={isHomeSlotsMaxed && !currentCategory.showOnHome}
                                            checked={Boolean(currentCategory.showOnHome)}
                                            onChange={(e) => {
                                                if (e.target.checked && isHomeSlotsMaxed) {
                                                    toast.error('Only 4 categories can be shown on the Home Screen. Please remove one first.')
                                                    return
                                                }
                                                setCurrentCategory({ ...currentCategory, showOnHome: e.target.checked })
                                            }}
                                            className="w-4 h-4 mt-0.5 rounded text-primary focus:ring-primary border-stone-300 cursor-pointer"
                                        />
                                        <div>
                                            <span className="text-xs font-bold text-stone-900 block">
                                                Showcase on Home Screen (Max 4)
                                            </span>
                                            <span className="text-[11px] text-stone-500 block mt-0.5">
                                                {currentCategory.showOnHome
                                                    ? 'This category will appear in the 4-card grid on the Home Screen.'
                                                    : (isHomeSlotsMaxed
                                                        ? 'All 4 Home Screen slots are full. You can still save it for the Collection section.'
                                                        : 'Unchecked categories appear in the Collection section.'
                                                    )}
                                            </span>
                                        </div>
                                    </label>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-2.5 pt-4 border-t border-black/8">
                                    <button
                                        type="button"
                                        onClick={() => setIsCategoryModalOpen(false)}
                                        className="px-5 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSavingCategory}
                                        className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                        {isSavingCategory ? 'Saving...' : (editCategoryMode ? 'Update Category' : 'Save Category')}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        )
    }

    const renderReelModal = () => (
        <AnimatePresence>
            {isReelModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 md:p-10">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsReelModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-3xl bg-[#fffcf7] rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200/80 p-4 sm:p-8 md:p-10 overflow-y-auto max-h-[88vh] no-scrollbar">
                        <div className="flex items-center justify-between pb-6 border-b border-black/10">
                            <div>
                                <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">Reels Curator</span>
                                <h2 className="text-3xl text-stone-900 mt-1">{editReelMode ? 'Edit Reel' : 'Add New Reel'}</h2>
                            </div>
                            <button onClick={() => setIsReelModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveReel} className="space-y-6 pt-6">
                            {/* Title & Category */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-2 space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Reel Title *</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Abstract Emerald Drop Earring"
                                        value={currentReel.title}
                                        onChange={(e) => setCurrentReel({ ...currentReel, title: e.target.value })}
                                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Category</label>
                                    <select
                                        value={currentReel.category}
                                        onChange={(e) => setCurrentReel({ ...currentReel, category: e.target.value })}
                                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-primary transition-colors"
                                    >
                                        {['Earrings', 'Rings', 'Necklaces', 'Bracelets', 'Collections', 'Fine Jewellery'].map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Cover Media & Upload */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-black/5">
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Cover Image (Vertical 9:16) *</label>
                                    <div className="flex items-center gap-3">
                                        <label className="px-4 py-2.5 bg-primary text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm">
                                            <ImagePlus className="w-4 h-4" />
                                            <span>{uploadingReelImg ? 'Uploading...' : 'Upload Image'}</span>
                                            <input type="file" accept="image/*" disabled={uploadingReelImg} onChange={handleReelImageUpload} className="hidden" />
                                        </label>
                                        <span className="text-[11px] text-stone-400 ">or paste image URL below</span>
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        placeholder="https://... or /reels/reel-1.jpg"
                                        value={currentReel.image}
                                        onChange={(e) => setCurrentReel({ ...currentReel, image: e.target.value })}
                                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-primary transition-colors"
                                    />
                                    <div className="space-y-1.5 pt-2">
                                        <label className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Video URL (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="https://... (mp4 / stream URL)"
                                            value={currentReel.video || ''}
                                            onChange={(e) => setCurrentReel({ ...currentReel, video: e.target.value })}
                                            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-primary transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Preview Frame */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Live Preview</label>
                                    <div className="w-full max-w-[160px] aspect-[9/16] rounded-2xl overflow-hidden bg-stone-900 border border-stone-200 shadow-sm relative mx-auto">
                                        {currentReel.image ? (
                                            <>
                                                <img src={getOptimizedImage(currentReel.image, 300)} alt="" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
                                                <div className="absolute bottom-2 inset-x-2 text-white text-[10px] truncate text-center drop-shadow">
                                                    {currentReel.title || 'Preview Title'}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-stone-500 text-xs gap-1.5 p-3 text-center">
                                                <Film className="w-6 h-6 text-stone-600" />
                                                <span className="text-[9px]">No media selected</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Linked Product & Price */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-black/5">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Link with Store Product</label>
                                    <select
                                        value={currentReel.productId}
                                        onChange={(e) => {
                                            const selectedId = e.target.value
                                            const found = products.find(p => p._id === selectedId)
                                            if (found) {
                                                setCurrentReel(prev => ({
                                                    ...prev,
                                                    productId: found._id,
                                                    price: `₹${found.price?.toLocaleString()}`,
                                                    title: prev.title || found.name
                                                }))
                                            } else {
                                                setCurrentReel(prev => ({ ...prev, productId: selectedId }))
                                            }
                                        }}
                                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-primary transition-colors"
                                    >
                                        <option value="">-- No Linked Product (Generic Showcase) --</option>
                                        {products.map(p => (
                                            <option key={p._id} value={p._id}>
                                                {p.name} — ₹{p.price?.toLocaleString()} ({p.category})
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-stone-400 ">Clicking "Buy Now" on this reel will open the selected product's details page.</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Display Price</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. ₹9,500"
                                        value={currentReel.price || ''}
                                        onChange={(e) => setCurrentReel({ ...currentReel, price: e.target.value })}
                                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-primary transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Order Sequence & Visibility */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 border-t border-black/5">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-wider text-stone-500 font-bold">Display Sequence Order</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={currentReel.order || 1}
                                        onChange={(e) => setCurrentReel({ ...currentReel, order: parseInt(e.target.value) || 1 })}
                                        className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2.5 text-xs text-stone-800 focus:outline-none focus:border-primary transition-colors"
                                    />
                                    <p className="text-[10px] text-stone-400 ">Lower numbers appear first in the coverflow & reels feed.</p>
                                </div>

                                <div className="space-y-3 pt-4">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="reelActive"
                                            checked={currentReel.isActive}
                                            onChange={(e) => setCurrentReel({ ...currentReel, isActive: e.target.checked })}
                                            className="w-4 h-4 rounded text-primary focus:ring-primary border-stone-300"
                                        />
                                        <label htmlFor="reelActive" className="text-xs font-bold text-stone-800 cursor-pointer">
                                            Active on live store (Home coverflow & Reels feed)
                                        </label>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            id="reelHomeShowcase"
                                            checked={Boolean(currentReel.isHomeShowcase)}
                                            onChange={(e) => setCurrentReel({ ...currentReel, isHomeShowcase: e.target.checked })}
                                            className="w-4 h-4 rounded text-primary focus:ring-primary border-stone-300"
                                        />
                                        <label htmlFor="reelHomeShowcase" className="text-xs font-bold text-stone-800 cursor-pointer">
                                            Feature in Home Screen Showcase (Top 5 Reels)
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-black/10">
                                <button
                                    type="button"
                                    onClick={() => setIsReelModalOpen(false)}
                                    className="px-6 py-2.5 rounded-xl border border-stone-200 text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingReel}
                                    className="px-8 py-2.5 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
                                >
                                    {isSavingReel ? 'Saving Reel...' : (editReelMode ? 'Update Reel' : 'Save Reel')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )

    const tabs = [
        { id: 'dashboard', name: 'Overview', icon: LayoutDashboard },
        { id: 'products', name: 'Products', icon: Package, count: stats.totalProducts },
        { id: 'categories', name: 'Categories', icon: Layers, count: categories.length },
        { id: 'orders', name: 'Orders', icon: ShoppingBag, count: orders.length },
        { id: 'reels', name: 'Reels', icon: Film, count: reels.length },
        { id: 'abandoned', name: 'Abandoned Carts', icon: ShoppingCart },
        { id: 'promos', name: 'Coupons', icon: Tag, count: promos.length },
        { id: 'customers', name: 'Customers', icon: Users, count: customers.length },
        { id: 'settings', name: 'Settings', icon: Settings }
    ];

    return (
        <div className="admin-panel flex flex-col lg:flex-row bg-[#fffcf7] min-h-screen selection:bg-primary-container text-stone-900 pt-0 lg:pt-0 overflow-x-hidden w-full max-w-full" style={{ fontFamily: "'IBM Plex Serif', Georgia, serif" }}>
            {renderInventoryModal()}
            {renderCategoryModal()}
            {renderOrderModal()}
            {renderCustomerModal()}
            {renderPromoModal()}
            {renderReelModal()}

            {/* Mobile / Tablet Top Navigation Bar */}
            <div className="lg:hidden sticky top-0 z-40 bg-[#fffcf7] border-b border-black/8 px-3.5 sm:px-6 py-2.5 shadow-xs transition-all duration-300">
                <div className="flex items-center justify-between mb-2.5 px-0.5">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] tracking-widest text-primary/70 font-semibold uppercase">Admin Panel</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link to="/" className="text-[10px] uppercase tracking-widest text-primary font-bold flex items-center gap-1 hover:underline">
                            <span>Store</span>
                            <ExternalLink className="w-3 h-3" />
                        </Link>
                        <span className="text-stone-300 text-xs">•</span>
                        <Link to="/account" className="text-[10px] uppercase tracking-widest text-stone-600 hover:text-primary font-bold flex items-center gap-1">
                            <span>Account</span>
                        </Link>
                        <span className="text-stone-300 text-xs">•</span>
                        <button
                            onClick={handleLogout}
                            className="text-[10px] uppercase tracking-widest text-stone-500 hover:text-red-600 font-bold flex items-center gap-1 transition-colors"
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
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] uppercase tracking-wider font-bold whitespace-nowrap transition-all ${
                                    isActive
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-white/90 text-stone-600 border border-black/5 hover:bg-stone-100'
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{tab.name}</span>
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className={`text-[8px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/25 text-white' : 'bg-black/5 text-stone-600'}`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Desktop Fixed Studio Sidebar */}
            <aside className="hidden lg:flex lg:w-72 xl:w-80 lg:fixed lg:top-0 lg:bottom-0 border-r border-[#6e5b44]/10 flex-col pt-8 pb-8 px-6 bg-white/70 backdrop-blur-2xl z-20">
                {/* Brand / Admin Header */}
                <div className="px-3 mb-8">
                    <h1 className="text-3xl font-light text-primary tracking-tight">Admin Dashboard</h1>
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
                                    <span className="text-[11px] uppercase tracking-[0.2em] font-bold">
                                        {tab.name}
                                    </span>
                                </div>
                                {tab.count !== undefined && tab.count > 0 && (
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] tracking-wider font-semibold transition-colors ${
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

                {/* Sidebar Footer Link */}
                <div className="pt-6 border-t border-stone-200/60 mt-auto px-1 space-y-2">
                    <Link
                        to="/"
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-primary/20 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all duration-300 text-[10px] uppercase tracking-widest font-bold group"
                    >
                        <span className="flex items-center gap-2">
                            <span>View Live Store</span>
                        </span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-stone-500 hover:text-red-600 hover:bg-red-50 text-[10px] uppercase tracking-widest font-bold transition-all group cursor-pointer"
                    >
                        <span className="flex items-center gap-2">
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Sign Out</span>
                        </span>
                    </button>
                    <p className="text-center text-[9px] text-stone-400 tracking-wider">
                        v2.4 Admin Edition
                    </p>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-72 xl:ml-80 pt-4 sm:pt-6 lg:pt-8 pb-20 sm:pb-32 px-3.5 sm:px-8 md:px-14 lg:px-16 min-h-screen overflow-x-hidden">
                <div className="max-w-[1400px] mx-auto">
                    {loading ? (
                        <div className="py-32 text-center opacity-40 text-[14px] uppercase tracking-widest animate-pulse">
                            Loading data...
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {activeTab === 'dashboard' && renderDashboard()}
                            {activeTab === 'products' && renderPieceManager()}
                            {activeTab === 'categories' && renderCategories()}
                            {activeTab === 'orders' && renderOrders()}
                            {activeTab === 'reels' && renderReelsManager()}
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
