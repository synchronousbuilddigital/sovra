import React, { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { useShop } from '../context/ShopContext'
import { 
    ArrowLeft, 
    ArrowRight, 
    Heart, 
    Share2, 
    Minus, 
    Plus, 
    ShoppingBag, 
    X, 
    ChevronDown, 
    ChevronUp, 
    ChevronLeft, 
    ChevronRight, 
    Sparkles, 
    FileText, 
    Truck, 
    Maximize2 
} from 'lucide-react'
import api from '../utils/api'
import { formatPrice } from '../utils/currency'
import { getOptimizedImage } from '../utils/imageUtils'
import { toast } from 'react-toastify'
import Skeleton from '../components/Skeleton'
import { trackAddToCart, trackWishlist, trackViewItem } from '../utils/analytics'

const ProductDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { cart, addToCart, addToWishlist, wishlist, removeFromWishlist } = useShop()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const [selectedImage, setSelectedImage] = useState(null)
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const [isImagePaused, setIsImagePaused] = useState(false)
    const [isDescExpanded, setIsDescExpanded] = useState(false)
    const [similarProducts, setSimilarProducts] = useState([])
    const [loadingSimilar, setLoadingSimilar] = useState(true)
    const thumbnailListRef = useRef(null)

    const displayImages = product 
        ? Array.from(new Set([product.img || product.image, ...(product.images || [])].filter(Boolean))) 
        : []

    // Auto-advance main image every 3 seconds
    useEffect(() => {
        if (isImagePaused || displayImages.length <= 1) return

        const timer = setInterval(() => {
            setActiveImageIndex(prev => (prev + 1) % displayImages.length)
        }, 3000)

        return () => clearInterval(timer)
    }, [isImagePaused, displayImages.length])

    // Review States
    const [rating, setRating] = useState(5)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [submittingReview, setSubmittingReview] = useState(false)
    const [showReviewForm, setShowReviewForm] = useState(false)

    // Accordion State ('specs', 'shipping', 'care')
    const [openAccordion, setOpenAccordion] = useState('specs')
    const toggleAccordion = (section) => {
        setOpenAccordion(prev => prev === section ? null : section)
    }

    const isWishlisted = wishlist.some(item => (item._id || item) === id)
    const cartItem = cart.find(item => (item.product?._id || item.product) === id)
    const currentInCart = cartItem ? cartItem.qty : 0
    const isOutOfStock = !product || Number(product.stock) <= 0
    const availableToAdd = product && !isOutOfStock ? Math.max(0, Number(product.stock) - currentInCart) : 0

    const handleBuyNow = async () => {
        if (isOutOfStock) return
        if (availableToAdd > 0) {
            await addToCart(product._id, quantity)
            trackAddToCart(product, quantity)
        }
        navigate('/checkout')
    }

    const handleShare = async () => {
        const shareData = {
            title: product?.name || 'SOVRA Jewellery',
            text: product?.name ? `Discover ${product.name} at SOVRA` : 'Discover fine jewellery at SOVRA',
            url: window.location.href,
        }
        if (navigator.share) {
            try {
                await navigator.share(shareData)
            } catch (err) {
                // User cancelled or share dismissed
            }
        } else {
            navigator.clipboard.writeText(window.location.href)
            toast.success('Product link copied to clipboard')
        }
    }

    const handlePrevImage = () => {
        if (displayImages.length <= 1) return
        setActiveImageIndex(prev => (prev === 0 ? displayImages.length - 1 : prev - 1))
    }

    const handleNextImage = () => {
        if (displayImages.length <= 1) return
        setActiveImageIndex(prev => (prev === displayImages.length - 1 ? 0 : prev + 1))
    }

    const scrollThumbnails = (direction) => {
        if (!thumbnailListRef.current) return
        const amount = direction === 'up' ? -180 : 180
        thumbnailListRef.current.scrollBy({ top: amount, behavior: 'smooth' })
    }

    useEffect(() => {
        window.scrollTo(0, 0)
        setActiveImageIndex(0)
        setIsDescExpanded(false)
        fetchProduct()
        trackView()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    useEffect(() => {
        if (product && product.category) {
            fetchSimilarProducts()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product])

    const trackView = async () => {
        try {
            if (localStorage.getItem('userInfo')) {
                await api.post('/users/recently-viewed', { productId: id })
            }
        } catch (error) {
            console.error('Observation error:', error)
        }
    }

    const fetchProduct = async () => {
        try {
            setLoading(true)
            const { data } = await api.get(`/products/${id}`)
            setProduct(data)
            trackViewItem(data)
        } catch (error) {
            console.error('Fetch failed:', error)
            setProduct(null)
        } finally {
            setLoading(false)
        }
    }

    const fetchSimilarProducts = async () => {
        try {
            setLoadingSimilar(true)
            const { data } = await api.get(`/products?category=${product.category}&pageSize=10`)
            const filtered = (data.products || []).filter(p => p._id !== id).slice(0, 4)
            setSimilarProducts(filtered)
        } catch (error) {
            console.error('Similar pieces retrieval failure:', error)
        } finally {
            setLoadingSimilar(false)
        }
    }

    const submitReviewHandler = async (e) => {
        e.preventDefault()
        try {
            setSubmittingReview(true)
            await api.post(`/products/${id}/reviews`, { rating, comment })
            toast.success('Thank you! Your review has been submitted.')
            setComment('')
            setRating(5)
            setShowReviewForm(false)
            fetchProduct()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Review submission failed')
        } finally {
            setSubmittingReview(false)
        }
    }

    const handleWishlist = () => {
        if (isWishlisted) {
            removeFromWishlist(id)
            if (product) trackWishlist(product, 'remove')
        } else {
            addToWishlist(id)
            if (product) trackWishlist(product, 'add')
        }
    }

    if (loading) return (
        <div className="pt-20 sm:pt-24 md:pt-28 pb-16 bg-[#faf7f2] min-h-screen">
            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12">
                <div className="flex items-center justify-between pb-6">
                    <Skeleton width="160px" height="14px" />
                    <div className="flex gap-2">
                        <Skeleton width="38px" height="38px" className="rounded-full" />
                        <Skeleton width="38px" height="38px" className="rounded-full" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-14 items-start">
                    <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
                        <div className="flex sm:flex-col gap-3">
                            {[1, 2, 3, 4].map(i => (
                                <Skeleton key={i} width="72px" height="72px" className="rounded-xl" />
                            ))}
                        </div>
                        <div className="flex-1">
                            <Skeleton height="auto" className="aspect-square w-full rounded-2xl" />
                        </div>
                    </div>
                    <div className="lg:col-span-5 space-y-6">
                        <Skeleton width="90px" height="12px" />
                        <Skeleton width="80%" height="40px" />
                        <Skeleton width="220px" height="28px" />
                        <Skeleton width="100%" height="80px" />
                        <div className="flex gap-3">
                            <Skeleton width="100px" height="48px" className="rounded-xl" />
                            <Skeleton width="100%" height="48px" className="rounded-xl" />
                            <Skeleton width="100%" height="48px" className="rounded-xl" />
                        </div>
                        <Skeleton width="100%" height="180px" className="rounded-xl" />
                    </div>
                </div>
            </main>
        </div>
    )

    if (!product) return (
        <div className="pt-64 text-center bg-[#faf7f2] min-h-screen px-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-[#1c1917] mb-6">Piece not found in the collection.</h2>
            <Link to="/shop" className="font-sans text-xs tracking-widest uppercase border-b border-[#1c1917] pb-1 font-bold hover:opacity-70 transition-opacity">
                Return to Gallery
            </Link>
        </div>
    )

    return (
        <div className="product-page pt-16 sm:pt-20 md:pt-22 pb-14 md:pb-20 bg-[#faf7f2] min-h-screen selection:bg-stone-200 w-full max-w-full overflow-x-clip text-[#1c1917]">
            {product && (
                <Helmet>
                    <title>{`${product.name} | SOVRA`}</title>
                    <meta name="description" content={product.description || product.details} />
                    <meta property="og:title" content={`${product.name} | SOVRA`} />
                    <meta property="og:description" content={product.description || product.details} />
                    <meta property="og:image" content={product.img || product.image} />
                    <meta property="og:type" content="product" />
                    <meta property="og:url" content={`https://www.sovrajewellery.com/product/${product._id}`} />
                    <meta name="twitter:card" content="summary_large_image" />
                </Helmet>
            )}

            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 w-full min-w-0">

                {/* Top Navigation Row: Back to Curation on Left | Share on Right */}
                <div className="flex items-center justify-between pb-2.5 sm:pb-3 pt-1 border-b border-stone-200/50 mb-3 sm:mb-4 gap-2">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-stone-500 font-sans text-[11px] sm:text-xs min-w-0">
                        <Link 
                            to="/shop" 
                            className="inline-flex items-center gap-1 uppercase tracking-[0.16em] sm:tracking-[0.2em] font-bold text-stone-700 hover:text-stone-950 transition-colors group shrink-0"
                        >
                            <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-1" />
                            <span>Back to Curation</span>
                        </Link>
                        {product.category && (
                            <>
                                <span className="text-stone-300">/</span>
                                <span className="uppercase tracking-wider text-[#855e23] font-semibold truncate">
                                    {product.category}
                                </span>
                            </>
                        )}
                    </div>

                    <button
                        onClick={handleShare}
                        aria-label="Share piece"
                        className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 hover:text-stone-950 flex items-center justify-center transition-all shadow-2xs shrink-0"
                    >
                        <Share2 size={14} />
                    </button>
                </div>

                {/* Main Product Showcase: Left Gallery Mosaic | Right Details */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-start w-full min-w-0">

                    {/* GALLERY (Left 7 Cols on desktop): Left Vertical Strip + Right Main Showcase Image */}
                    <div className="lg:col-span-7 flex flex-row gap-2 sm:gap-3.5 md:gap-4 items-start w-full min-w-0">
                        
                        {/* 1. Left Vertical Thumbnail Strip (Up to 7 thumbnails, 7th shows +N if more) */}
                        {displayImages.length > 1 && (
                            <div className="flex flex-col gap-1.5 sm:gap-2.5 shrink-0 w-11 sm:w-16 md:w-[68px] lg:w-[74px]">
                                {displayImages.slice(0, 7).map((img, idx) => {
                                    const isActive = activeImageIndex === idx
                                    const isSeventhWithMore = idx === 6 && displayImages.length > 7
                                    const moreCount = displayImages.length - 6

                                    return (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                if (isSeventhWithMore) {
                                                    setSelectedImage(img)
                                                } else {
                                                    setActiveImageIndex(idx)
                                                }
                                            }}
                                            aria-label={isSeventhWithMore ? `View ${moreCount} more images` : `View image ${idx + 1}`}
                                            className={`relative aspect-square w-full rounded-lg sm:rounded-2xl overflow-hidden shrink-0 transition-all bg-[#fbf9f6] ${
                                                isActive 
                                                    ? 'ring-2 ring-stone-900 border-2 border-stone-900 shadow-sm opacity-100 scale-[1.02]' 
                                                    : 'border border-stone-200/80 opacity-70 hover:opacity-100 hover:border-stone-400'
                                            }`}
                                        >
                                            <img
                                                src={getOptimizedImage(img, 240)}
                                                alt={`Thumbnail ${idx + 1}`}
                                                className="w-full h-full object-cover select-none"
                                                draggable="false"
                                            />
                                            {isSeventhWithMore && (
                                                <div className="absolute inset-0 bg-black/60 backdrop-blur-2xs flex items-center justify-center">
                                                    <span className="text-white font-sans text-[10px] sm:text-sm font-bold">
                                                        +{moreCount}
                                                    </span>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        {/* 2. Main Showcase Image Card (Aspect-square, matching the thumbnail strip layout) */}
                        <div 
                            onMouseEnter={() => setIsImagePaused(true)}
                            onMouseLeave={() => setIsImagePaused(false)}
                            onTouchStart={() => setIsImagePaused(true)}
                            onTouchEnd={() => setTimeout(() => setIsImagePaused(false), 2000)}
                            className="relative flex-1 min-w-0 aspect-square bg-[#fbf9f6] rounded-xl sm:rounded-3xl overflow-hidden border border-stone-200/80 shadow-sm group"
                        >
                            <AnimatePresence mode="wait">
                                <Motion.img
                                    key={activeImageIndex}
                                    src={getOptimizedImage(displayImages[activeImageIndex] || product.img, 1400)}
                                    alt={product.name}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-full h-full object-cover select-none cursor-zoom-in"
                                    onClick={() => setSelectedImage(displayImages[activeImageIndex] || product.img)}
                                    draggable="false"
                                />
                            </AnimatePresence>

                            {/* Wishlist Heart Button - Pinned at Top Right of Main Image */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleWishlist()
                                }}
                                aria-label="Wishlist piece"
                                className={`absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all z-10 shadow-md ${
                                    isWishlisted 
                                        ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                                        : 'bg-white/90 hover:bg-white text-stone-700 hover:text-stone-950 border border-stone-100'
                                }`}
                            >
                                <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
                            </button>

                            {/* Bottom-Right Maximize Button */}
                            <button
                                type="button"
                                onClick={() => setSelectedImage(displayImages[activeImageIndex] || product.img)}
                                aria-label="Expand image fullscreen"
                                className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-stone-900/70 hover:bg-stone-900 text-white shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-10"
                            >
                                <Maximize2 size={15} />
                            </button>
                        </div>
                    </div>

                    {/* PRODUCT DETAILS (Right 5 Cols on desktop) */}
                    <div className="lg:col-span-5 space-y-5 sm:space-y-6">
                        
                        {/* Header: Category & Title */}
                        <div>
                            <span className="font-sans text-[11px] sm:text-xs tracking-[0.25em] uppercase text-[#855e23] font-bold block mb-1.5">
                                {product.category || product.series || 'Fine Jewellery'}
                            </span>
                            <h1 className="font-serif text-3xl sm:text-4xl lg:text-[40px] text-[#1c1917] font-normal tracking-tight leading-[1.15] mb-3">
                                {product.name}
                            </h1>

                            {/* Price Line + Taxes + Free Insured Delivery */}
                            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-1">
                                <span className="font-sans text-2xl sm:text-3xl font-bold text-[#1c1917] tracking-tight">
                                    {formatPrice(product.price)}
                                </span>
                                {Number(product.mrp) > Number(product.price) && (
                                    <span className="font-sans text-sm sm:text-base text-stone-400 line-through font-normal">
                                        {formatPrice(product.mrp)}
                                    </span>
                                )}
                                <span className="text-stone-300 hidden sm:inline">|</span>
                                <span className="font-sans text-[11px] uppercase tracking-wider text-stone-500 font-semibold">
                                    Taxes Included
                                </span>
                                <span className="inline-flex items-center gap-1.5 font-sans text-[11px] sm:text-xs text-[#166534] font-semibold bg-[#eaf7ee] border border-[#bbf7d0] px-2.5 sm:px-3 py-1 rounded-full">
                                    <Truck size={13} className="text-[#166534]" />
                                    <span>Free Insured Delivery</span>
                                </span>
                            </div>
                        </div>

                        {/* Description with Read more / Read less toggle */}
                        {(() => {
                            const descriptionText = product.details || product.description || ''
                            const isLongDesc = descriptionText.length > 90
                            return (
                                <div className="pt-1">
                                    <p className={`font-sans text-stone-600 text-sm sm:text-[15px] leading-relaxed ${!isDescExpanded && isLongDesc ? 'line-clamp-3' : ''}`}>
                                        {descriptionText}
                                    </p>
                                    {isLongDesc && (
                                        <button
                                            type="button"
                                            onClick={() => setIsDescExpanded(!isDescExpanded)}
                                            className="mt-1.5 text-xs font-semibold text-stone-800 hover:text-stone-950 inline-flex items-center gap-1 transition-colors cursor-pointer"
                                        >
                                            <span>{isDescExpanded ? 'Read less' : 'Read more'}</span>
                                            <ChevronDown size={14} className={`transition-transform duration-200 ${isDescExpanded ? 'rotate-180' : ''}`} />
                                        </button>
                                    )}
                                </div>
                            )
                        })()}

                        {/* Purchase Section: Stock Status + Quantity & Action Buttons */}
                        <div className="space-y-2.5 pt-2 border-t border-stone-200/50">
                            {/* Stock Status Bar + Mobile Quantity Selector */}
                            <div className="flex items-center justify-between text-xs tracking-wider uppercase font-bold">
                                <div className="inline-flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-rose-500' : 'bg-emerald-600'}`} />
                                    <span className={isOutOfStock ? 'text-rose-600' : 'text-stone-800'}>
                                        {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                                    </span>
                                </div>

                                {/* Mobile Quantity Selector: Compact & Tidy */}
                                <div className="flex sm:hidden items-center border border-stone-300 rounded-xl px-2 h-9 bg-white shadow-2xs">
                                    <button
                                        disabled={isOutOfStock || availableToAdd === 0}
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-1 text-stone-600 hover:text-stone-950 transition-colors disabled:opacity-30"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus size={12} />
                                    </button>
                                    <span className="px-2 font-sans font-bold text-xs text-stone-900 min-w-[16px] text-center select-none">
                                        {isOutOfStock ? 0 : (availableToAdd === 0 ? 0 : quantity)}
                                    </span>
                                    <button
                                        disabled={isOutOfStock || availableToAdd === 0 || quantity >= availableToAdd}
                                        onClick={() => setQuantity(Math.min(availableToAdd, quantity + 1))}
                                        className="p-1 text-stone-600 hover:text-stone-950 transition-colors disabled:opacity-30"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus size={12} />
                                    </button>
                                </div>
                            </div>

                            {/* Actions Row: Desktop Quantity Selector + ADD TO BAG + BUY NOW */}
                            <div className="flex items-center gap-2 sm:gap-3">
                                {/* Desktop Quantity Selector (hidden on mobile, shown on sm+) */}
                                <div className="hidden sm:flex items-center border border-stone-300 rounded-xl px-2.5 sm:px-3 h-12 sm:h-12.5 bg-white shrink-0 shadow-2xs">
                                    <button
                                        disabled={isOutOfStock || availableToAdd === 0}
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-1 text-stone-600 hover:text-stone-950 transition-colors disabled:opacity-30"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus size={13} />
                                    </button>
                                    <span className="px-2.5 sm:px-3 font-sans font-bold text-xs sm:text-sm text-stone-900 min-w-[18px] text-center select-none">
                                        {isOutOfStock ? 0 : (availableToAdd === 0 ? 0 : quantity)}
                                    </span>
                                    <button
                                        disabled={isOutOfStock || availableToAdd === 0 || quantity >= availableToAdd}
                                        onClick={() => setQuantity(Math.min(availableToAdd, quantity + 1))}
                                        className="p-1 text-stone-600 hover:text-stone-950 transition-colors disabled:opacity-30"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus size={13} />
                                    </button>
                                </div>

                                {/* ADD TO BAG Button (Single line on all devices, generous width on mobile) */}
                                <button
                                    disabled={isOutOfStock || availableToAdd === 0}
                                    onClick={() => {
                                        if (isOutOfStock) return
                                        addToCart(product._id, quantity)
                                        trackAddToCart(product, quantity)
                                    }}
                                    className={`flex-1 h-11.5 sm:h-12.5 rounded-xl text-[11px] sm:text-xs tracking-wider uppercase font-sans font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-sm whitespace-nowrap min-w-0 ${
                                        isOutOfStock
                                            ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                            : (availableToAdd === 0
                                                ? 'bg-stone-300 text-stone-600 cursor-not-allowed'
                                                : 'bg-[#241e17] hover:bg-[#120f0c] text-white active:scale-[0.99]')
                                    }`}
                                >
                                    <ShoppingBag size={14} className="shrink-0" />
                                    <span className="truncate">
                                        {isOutOfStock ? 'Out of Stock' : (availableToAdd === 0 ? 'In Bag' : 'Add to Bag')}
                                    </span>
                                </button>

                                {/* BUY NOW Button */}
                                {!isOutOfStock && (
                                    <button
                                        onClick={handleBuyNow}
                                        className="flex-1 h-11.5 sm:h-12.5 rounded-xl bg-[#8c6239] hover:bg-[#734f2d] text-white text-[11px] sm:text-xs tracking-wider uppercase font-sans font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all shadow-sm active:scale-[0.99] whitespace-nowrap min-w-0"
                                    >
                                        <span>Buy Now</span>
                                        <ArrowRight size={14} className="shrink-0" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Collapsible Accordions: Product Specifications, Delivery & Returns, Product Care */}
                        <div className="border-t border-stone-200/80 divide-y divide-stone-200/80 pt-2">
                            
                            {/* Accordion 1: Product Specifications */}
                            <div className="py-1">
                                <button
                                    type="button"
                                    onClick={() => toggleAccordion('specs')}
                                    className="w-full py-3.5 flex items-center justify-between text-left group transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText size={17} className="text-stone-700 group-hover:text-stone-950 transition-colors" />
                                        <span className="font-sans text-xs sm:text-[13px] tracking-wider uppercase font-bold text-stone-900 group-hover:text-[#855e23] transition-colors">
                                            Product Specifications
                                        </span>
                                    </div>
                                    <ChevronDown
                                        size={16}
                                        className={`text-stone-500 transition-transform duration-300 ${openAccordion === 'specs' ? 'rotate-180 text-stone-900' : ''}`}
                                    />
                                </button>

                                <AnimatePresence initial={false}>
                                    {openAccordion === 'specs' && (
                                        <Motion.div
                                            key="specs-drawer"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pb-4 pt-1 space-y-3">
                                                {/* Header Badge */}
                                                <div className="flex items-center justify-between pb-2 border-b border-stone-200/60">
                                                    <span className="font-sans text-[10px] tracking-wider uppercase text-stone-500 font-semibold">Standard Reference</span>
                                                    <span className="font-sans text-[10px] sm:text-[10.5px] uppercase tracking-wider text-[#855e23] font-bold border border-[#855e23]/35 bg-[#fbf6ec] px-2.5 py-0.5 rounded-full">
                                                        {product.certification || '18K PVD Certified'}
                                                    </span>
                                                </div>

                                                {/* Hairline Specification Rows */}
                                                <div className="divide-y divide-stone-200/60 text-xs sm:text-[13px]">
                                                    {[
                                                        { label: 'MATERIAL', value: product.material || 'Stainless Steel' },
                                                        { label: 'PLATING FINISH', value: product.plating || 'Gold 18K PVD Plating' },
                                                        { label: 'STONE / PEARL', value: product.stone || 'Natural Gemstone' },
                                                        { label: 'LENGTH / DIMENSIONS', value: product.length || '46 cm' },
                                                        { label: 'WEIGHT', value: product.weight || '18g' }
                                                    ].map(spec => (
                                                        <div key={spec.label} className="py-2.5 flex items-center justify-between gap-4">
                                                            <span className="font-sans text-[10.5px] tracking-wider uppercase text-stone-600 font-semibold">
                                                                {spec.label}
                                                            </span>
                                                            <span className="font-sans text-stone-900 font-medium text-right">
                                                                {spec.value}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Hallmarks Row (No emojis, clean typographic text) */}
                                                <div className="pt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-stone-200/60 text-[10.5px] sm:text-[11px] font-sans uppercase tracking-wider text-stone-700 font-bold">
                                                    {(product.features || ['Sweatproof', 'Anti Tarnish', 'Water proof', 'Hypoallergenic']).map((feature, idx) => (
                                                        <span key={feature} className="inline-flex items-center gap-2">
                                                            {idx > 0 && <span className="text-[#855e23]">•</span>}
                                                            <span>{feature}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </Motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Accordion 2: Delivery & Returns */}
                            <div className="py-1">
                                <button
                                    type="button"
                                    onClick={() => toggleAccordion('shipping')}
                                    className="w-full py-3.5 flex items-center justify-between text-left group transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Truck size={17} className="text-stone-700 group-hover:text-stone-950 transition-colors" />
                                        <span className="font-sans text-xs sm:text-[13px] tracking-wider uppercase font-bold text-stone-900 group-hover:text-[#855e23] transition-colors">
                                            Delivery & Returns
                                        </span>
                                    </div>
                                    <ChevronDown
                                        size={16}
                                        className={`text-stone-500 transition-transform duration-300 ${openAccordion === 'shipping' ? 'rotate-180 text-stone-900' : ''}`}
                                    />
                                </button>

                                <AnimatePresence initial={false}>
                                    {openAccordion === 'shipping' && (
                                        <Motion.div
                                            key="shipping-drawer"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pb-4 pt-1 space-y-2.5 font-sans text-xs sm:text-[13px] text-stone-600 leading-relaxed">
                                                <p className="flex items-start gap-2.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#855e23] shrink-0 mt-1.5" />
                                                    <span><strong>Free Insured Express Courier</strong> across India with live GPS tracking dispatch.</span>
                                                </p>
                                                <p className="flex items-start gap-2.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#855e23] shrink-0 mt-1.5" />
                                                    <span>Delivered in signature SOVRA luxury rigid gift packaging and protective velvet travel pouch.</span>
                                                </p>
                                                <p className="flex items-start gap-2.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#855e23] shrink-0 mt-1.5" />
                                                    <span>Hassle-free 7-day return policy and doorstep exchange assurance.</span>
                                                </p>
                                            </div>
                                        </Motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Accordion 3: Product Care */}
                            <div className="py-1">
                                <button
                                    type="button"
                                    onClick={() => toggleAccordion('care')}
                                    className="w-full py-3.5 flex items-center justify-between text-left group transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Sparkles size={17} className="text-stone-700 group-hover:text-stone-950 transition-colors" />
                                        <span className="font-sans text-xs sm:text-[13px] tracking-wider uppercase font-bold text-stone-900 group-hover:text-[#855e23] transition-colors">
                                            Product Care
                                        </span>
                                    </div>
                                    <ChevronDown
                                        size={16}
                                        className={`text-stone-500 transition-transform duration-300 ${openAccordion === 'care' ? 'rotate-180 text-stone-900' : ''}`}
                                    />
                                </button>

                                <AnimatePresence initial={false}>
                                    {openAccordion === 'care' && (
                                        <Motion.div
                                            key="care-drawer"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pb-4 pt-1 space-y-2.5 font-sans text-xs sm:text-[13px] text-stone-600 leading-relaxed">
                                                <p className="flex items-start gap-2.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#855e23] shrink-0 mt-1.5" />
                                                    <span>Crafted with multi-layer 18K PVD vacuum deposition for continuous daily wear.</span>
                                                </p>
                                                <p className="flex items-start gap-2.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#855e23] shrink-0 mt-1.5" />
                                                    <span>100% waterproof and sweatproof. Safe to wear in showers, workouts, and swimming.</span>
                                                </p>
                                                <p className="flex items-start gap-2.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#855e23] shrink-0 mt-1.5" />
                                                    <span>To clean and restore mirror shine, gently polish using the provided SOVRA microfiber cloth.</span>
                                                </p>
                                            </div>
                                        </Motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Lightbox Modal */}
                {selectedImage && (
                    <div 
                        className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
                        onClick={() => setSelectedImage(null)}
                    >
                        <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                            <img 
                                src={getOptimizedImage(selectedImage, 1600)} 
                                alt="Zoomed view"
                                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl" 
                            />
                            <button
                                onClick={() => setSelectedImage(null)}
                                aria-label="Close preview"
                                className="absolute -top-12 right-0 text-white/80 hover:text-white flex items-center gap-2 font-sans text-xs tracking-widest uppercase font-bold"
                            >
                                Close <X size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Similar Products Section (Placed directly after product) */}
                <section className="mt-10 sm:mt-14 md:mt-16 pt-8 sm:pt-10 border-t border-stone-200/70">
                    <div className="flex flex-col items-center mb-5 sm:mb-7 text-center space-y-1.5">
                        <span className="font-sans text-[10px] tracking-[0.35em] uppercase text-stone-500 font-bold">Complete the Curation</span>
                        <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#1c1917] font-normal">You May Also Like</h2>
                        <div className="w-8 h-[1px] bg-[#855e23]/40 mt-1.5 mx-auto" />
                    </div>

                    {loadingSimilar ? (
                        <div className="flex justify-center p-8">
                            <div className="w-7 h-7 border border-stone-300 border-t-stone-800 rounded-full animate-spin" />
                        </div>
                    ) : similarProducts.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                            {similarProducts.map((p, idx) => (
                                <Motion.div
                                    key={p._id}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                                    viewport={{ once: true }}
                                    className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-stone-200/80 shadow-2xs hover:shadow-md transition-all duration-300"
                                >
                                    <Link to={`/product/${p._id}`} className="relative aspect-square overflow-hidden bg-[#fbf9f6]">
                                        <img
                                            src={getOptimizedImage(p.img || p.image, 600)}
                                            alt={p.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    </Link>

                                    <div className="p-3.5 sm:p-4.5 flex flex-col flex-1 text-center justify-center items-center gap-1 sm:gap-1.5">
                                        <span className="text-[9.5px] uppercase tracking-wider font-bold text-stone-400">{p.category}</span>
                                        <Link to={`/product/${p._id}`}>
                                            <h3 className="font-serif text-sm sm:text-base font-normal text-stone-900 group-hover:text-[#855e23] transition-colors line-clamp-1">{p.name}</h3>
                                        </Link>
                                        <span className="font-sans font-bold text-sm sm:text-base text-stone-900 tracking-tight">{formatPrice(p.price)}</span>
                                    </div>
                                </Motion.div>
                            ))}
                        </div>
                    ) : null}
                </section>

                {/* Customer Reviews Section */}
                <section className="mt-10 sm:mt-14 md:mt-16 pt-8 sm:pt-10 border-t border-stone-200/70 pb-6 sm:pb-12">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
                        <header className="space-y-1.5">
                            <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-stone-500 block font-bold">Verified Feedback</span>
                            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[#1c1917] font-normal">Customer Reviews</h2>
                            <div className="flex items-center gap-3 pt-0.5">
                                <div className="flex text-amber-600">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Sparkles key={star} size={14} className={star <= Math.round(product.rating || 5) ? 'fill-current' : 'text-stone-300'} />
                                    ))}
                                </div>
                                <span className="font-sans text-xs tracking-wider font-bold text-stone-800">
                                    {product.rating ? product.rating.toFixed(1) : '5.0'} / 5.0
                                </span>
                                <span className="text-xs text-stone-400">•</span>
                                <span className="font-sans text-xs tracking-wider font-medium text-stone-500">
                                    {product.numReviews || 0} {product.numReviews === 1 ? 'Review' : 'Reviews'}
                                </span>
                            </div>
                        </header>

                        <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="inline-flex items-center justify-center gap-2 bg-[#1c1917] text-white hover:bg-black px-4.5 py-2.5 rounded-xl text-xs tracking-wider uppercase font-sans font-bold transition-all shadow-xs self-start sm:self-auto shrink-0"
                        >
                            {showReviewForm ? 'Close Form' : 'Write a Review'}
                        </button>
                    </div>

                    {/* Review Submission Form */}
                    {showReviewForm && (
                        <div className="mb-8 sm:mb-10 bg-white p-5 sm:p-7 rounded-2xl border border-stone-200 shadow-sm max-w-2xl">
                            {localStorage.getItem('userInfo') ? (
                                <form onSubmit={submitReviewHandler} className="space-y-4">
                                    <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                                        <h3 className="font-serif text-xl sm:text-2xl text-stone-900 font-normal">Share Your Experience</h3>
                                        <button 
                                            type="button" 
                                            onClick={() => setShowReviewForm(false)}
                                            className="text-stone-400 hover:text-stone-900 p-1"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs uppercase tracking-wider font-bold text-stone-500 block">Your Rating</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onMouseEnter={() => setHoverRating(s)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    onClick={() => setRating(s)}
                                                    className="p-1 transition-transform hover:scale-125 focus:outline-none"
                                                >
                                                    <Sparkles 
                                                        size={18} 
                                                        className={(hoverRating || rating) >= s ? 'text-amber-600 fill-current' : 'text-stone-300'} 
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs uppercase tracking-wider font-bold text-stone-500 block">Your Review</label>
                                        <textarea
                                            required
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            rows={3}
                                            className="w-full bg-[#fbf9f6] border border-stone-200 rounded-xl p-3 sm:p-4 font-sans text-sm outline-none focus:border-stone-900 focus:bg-white transition-all resize-none text-stone-900"
                                            placeholder="Write your honest reflection of this piece..."
                                        />
                                    </div>

                                    <button
                                        disabled={submittingReview}
                                        type="submit"
                                        className="bg-[#1c1917] text-white px-6 py-2.5 text-xs tracking-wider uppercase font-bold hover:bg-black transition-all rounded-xl shadow-xs disabled:opacity-50"
                                    >
                                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-4 space-y-3">
                                    <p className="font-serif text-lg text-stone-800">Please sign in to leave a review.</p>
                                    <Link to="/login" className="inline-block bg-[#1c1917] text-white px-6 py-2 rounded-xl text-xs tracking-wider uppercase font-bold hover:bg-black transition-all">
                                        Sign In
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reviews List */}
                    {!product.reviews || product.reviews.length === 0 ? (
                        <div className="py-8 sm:py-10 px-6 text-center bg-white rounded-2xl border border-stone-200/80 max-w-xl mx-auto flex flex-col items-center justify-center gap-2.5">
                            <Sparkles size={22} className="text-stone-400" />
                            <h3 className="font-serif text-xl text-stone-900 font-normal">No reviews yet</h3>
                            <p className="font-sans text-xs sm:text-sm text-stone-500 max-w-sm">Be the first to share your experience with this piece.</p>
                            {!showReviewForm && (
                                <button
                                    onClick={() => setShowReviewForm(true)}
                                    className="mt-1 text-xs tracking-wider uppercase font-bold text-[#855e23] border-b border-[#855e23]/40 pb-0.5 hover:border-[#855e23] transition-all"
                                >
                                    Write the First Review
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                            {product.reviews.map((review, idx) => (
                                <div
                                    key={review._id || idx}
                                    className="p-4.5 sm:p-6 bg-white border border-stone-200/80 rounded-2xl shadow-2xs space-y-2.5"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex text-amber-600">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Sparkles key={s} size={13} className={s <= review.rating ? 'fill-current' : 'text-stone-300'} />
                                            ))}
                                        </div>
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    <p className="font-sans text-sm text-stone-700 leading-relaxed font-normal">
                                        "{review.comment}"
                                    </p>

                                    <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between">
                                        <span className="font-serif text-sm font-medium text-stone-900">{review.name}</span>
                                        <span className="font-sans text-[10px] tracking-wider uppercase text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Verified Client</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </main>
        </div>
    )
}

export default ProductDetail
