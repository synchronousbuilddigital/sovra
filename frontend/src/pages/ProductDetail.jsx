import React, { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { useShop } from '../context/ShopContext'
import { ArrowLeft, ArrowRight, Heart, Minus, Plus, ShoppingBag, X, ChevronDown, Sparkles } from 'lucide-react'
import api from '../utils/api'
import { formatPrice } from '../utils/currency'
import { getOptimizedImage } from '../utils/imageUtils'
import { toast } from 'react-toastify'
import Skeleton from '../components/Skeleton'
import { trackAddToCart, trackWishlist, trackViewItem } from '../utils/analytics'

const ProductDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { cart, addToCart, addToWishlist, wishlist, removeFromWishlist } = useShop();
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const [selectedImage, setSelectedImage] = useState(null)
    const [activeImageIndex, setActiveImageIndex] = useState(0)
    const [isMobilePaused, setIsMobilePaused] = useState(false)
    const [similarProducts, setSimilarProducts] = useState([])
    const [loadingSimilar, setLoadingSimilar] = useState(true)
    const mobileSliderRef = useRef(null)

    const displayImages = product 
        ? Array.from(new Set([product.img || product.image, ...(product.images || [])].filter(Boolean))) 
        : []

    // Mobile carousel auto-advance every 2 seconds
    useEffect(() => {
        if (isMobilePaused || displayImages.length <= 1) return

        const timer = setInterval(() => {
            setActiveImageIndex((prev) => {
                const next = (prev + 1) % displayImages.length
                if (mobileSliderRef.current) {
                    const width = mobileSliderRef.current.offsetWidth
                    if (width > 0) {
                        mobileSliderRef.current.scrollTo({
                            left: next * width,
                            behavior: 'smooth'
                        })
                    }
                }
                return next
            })
        }, 2000)

        return () => clearInterval(timer)
    }, [isMobilePaused, displayImages.length])

    const scrollToImage = (index) => {
        setActiveImageIndex(index)
        if (mobileSliderRef.current) {
            const width = mobileSliderRef.current.offsetWidth
            if (width > 0) {
                mobileSliderRef.current.scrollTo({
                    left: index * width,
                    behavior: 'smooth'
                })
            }
        }
    }

    // Review States
    const [rating, setRating] = useState(5)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [submittingReview, setSubmittingReview] = useState(false)
    const [showReviewForm, setShowReviewForm] = useState(false)

    // Luxury Accordion State (Cartier / Tiffany & Co. Style)
    const [openAccordion, setOpenAccordion] = useState('specs')
    const toggleAccordion = (section) => {
        setOpenAccordion(prev => prev === section ? null : section)
    }

    const isWishlisted = wishlist.some(item => (item._id || item) === id);
    const cartItem = cart.find(item => (item.product?._id || item.product) === id);
    const currentInCart = cartItem ? cartItem.qty : 0;
    const isOutOfStock = !product || Number(product.stock) <= 0;
    const availableToAdd = product && !isOutOfStock ? Math.max(0, Number(product.stock) - currentInCart) : 0;

    const handleBuyNow = async () => {
        if (isOutOfStock) return;
        if (availableToAdd > 0) {
            await addToCart(product._id, quantity);
            trackAddToCart(product, quantity);
        }
        navigate('/checkout');
    };

    useEffect(() => {
        window.scrollTo(0, 0)
        setActiveImageIndex(0)
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
            // GA4: product detail view
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
            // Filter out current product
            const filtered = (data.products || []).filter(p => p._id !== id).slice(0, 4)
            setSimilarProducts(filtered)
        } catch (error) {
            console.error('Similar pieces retrieval failure:', error)
        } finally {
            setLoadingSimilar(false)
        }
    }

    const submitReviewHandler = async (e) => {
        e.preventDefault();
        try {
            setSubmittingReview(true);
            await api.post(`/products/${id}/reviews`, { rating, comment });
            toast.success('Thank you! Your review has been submitted.');
            setComment('');
            setRating(5);
            setShowReviewForm(false);
            fetchProduct();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Review submission failed');
        } finally {
            setSubmittingReview(false);
        }
    }

    const handleWishlist = () => {
        if (isWishlisted) {
            removeFromWishlist(id)
            // GA4: remove from wishlist
            if (product) trackWishlist(product, 'remove')
        } else {
            addToWishlist(id)
            // GA4: add to wishlist
            if (product) trackWishlist(product, 'add')
        }
    }

    if (loading) return (
        <div className="pt-16 sm:pt-20 md:pt-28 pb-12 md:pb-20 bg-[#fffcf7] min-h-screen">
            <main className="max-w-[1600px] mx-auto px-3.5 sm:px-6 md:px-10 lg:px-12">
                <div className="flex flex-col lg:flex-row gap-6 md:gap-10 xl:gap-14 items-start">
                    {/* Gallery Skeleton: 1 card on mobile, 2-column grid on desktop */}
                    <div className="w-full lg:w-[60%] xl:w-[62%]">
                        <div className="lg:hidden">
                            <Skeleton height="auto" className="aspect-[4/5] w-full rounded-2xl" />
                        </div>
                        <div className="hidden lg:grid grid-cols-2 gap-4 md:gap-5">
                            {[1, 2, 3, 4].map(i => (
                                <Skeleton key={i} height="auto" className="aspect-[4/5] rounded-xl sm:rounded-2xl" />
                            ))}
                        </div>
                    </div>
                    {/* Content Skeleton: Sticky Info Panel */}
                    <div className="w-full lg:w-[40%] xl:w-[38%] space-y-7">
                        <div className="space-y-4">
                            <Skeleton width="100px" height="10px" />
                            <Skeleton width="75%" height="44px" />
                            <Skeleton width="130px" height="28px" />
                            <Skeleton width="95%" height="50px" />
                        </div>
                        <div className="py-6 border-y border-[#111110]/8 grid grid-cols-2 gap-6">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="space-y-1.5">
                                    <Skeleton width="50px" height="8px" />
                                    <Skeleton width="90px" height="20px" />
                                </div>
                            ))}
                        </div>
                        <div className="space-y-4 pt-2">
                            <Skeleton width="140px" height="10px" />
                            <div className="flex gap-3">
                                <Skeleton width="120px" height="52px" className="rounded-full" />
                                <Skeleton width="100%" height="52px" className="rounded-full" />
                                <Skeleton width="52px" height="52px" className="rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )

    if (!product) return (
        <div className="pt-64 text-center bg-[#fffcf7] min-h-screen px-12">
            <h2 className="font-plex text-3xl sm:text-4xl font-normal text-[#111110] mb-8">Piece not found in the collection.</h2>
            <Link to="/shop" className="font-sans text-[10px] tracking-widest uppercase border-b border-[#111110] pb-2 font-bold">Return to Gallery</Link>
        </div>
    )

    return (
        <div className="product-page pt-16 sm:pt-20 md:pt-28 pb-12 md:pb-20 bg-[#fffcf7] min-h-screen selection:bg-primary/10 w-full max-w-full overflow-x-clip">
            {product && (
                <Helmet>
                    <title>{`${product.name} | SOVRA SOVRA`}</title>
                    <meta name="description" content={product.description || product.details} />
                    <meta property="og:title" content={`${product.name} | SOVRA SOVRA`} />
                    <meta property="og:description" content={product.description || product.details} />
                    <meta property="og:image" content={product.img || product.image} />
                    <meta property="og:type" content="product" />
                    <meta property="og:url" content={`https://sovra-topaz.vercel.app/product/${product._id}`} />
                    <meta name="twitter:card" content="summary_large_image" />
                </Helmet>
            )}
            <main className="max-w-[1600px] mx-auto px-3.5 sm:px-6 md:px-10 lg:px-12 w-full min-w-0">

                {/* Editorial Top Navigation */}
                <Link to="/shop" className="inline-flex items-center gap-2 sm:gap-3 font-sans text-[8.5px] sm:text-[9px] tracking-[0.3em] sm:tracking-[0.35em] uppercase text-[#7a7670] mb-3 sm:mb-5 md:mb-8 hover:text-[#111110] transition-colors group font-bold">
                    <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1.5" />
                    Back to Curation
                </Link>

                <div className="flex flex-col lg:flex-row gap-6 md:gap-10 xl:gap-14 items-start">

                    {/* GALLERY: Responsive Product Images (Swipeable 2s Auto Slider on Mobile, 2-Col Grid on Desktop) */}
                    <div className="w-full lg:w-[60%] xl:w-[62%]">
                        {/* MOBILE GALLERY: Single-image height swipeable carousel with 2s auto-change & thumbnails */}
                        <div className="lg:hidden relative">
                            <div 
                                ref={mobileSliderRef}
                                onMouseEnter={() => setIsMobilePaused(true)}
                                onMouseLeave={() => setIsMobilePaused(false)}
                                onTouchStart={() => setIsMobilePaused(true)}
                                onTouchEnd={() => setTimeout(() => setIsMobilePaused(false), 3000)}
                                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none rounded-2xl relative shadow-lux-sm border border-[#111110]/5 bg-[#fbf9f6]"
                                onScroll={(e) => {
                                    const width = e.currentTarget.offsetWidth;
                                    if (width > 0) {
                                        const idx = Math.round(e.currentTarget.scrollLeft / width);
                                        setActiveImageIndex(idx);
                                    }
                                }}
                            >
                                {displayImages.map((img, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setSelectedImage(img)}
                                        className="w-full min-w-full aspect-[4/5] snap-center relative cursor-zoom-in"
                                    >
                                        <img
                                            src={getOptimizedImage(img, 1200)}
                                            alt={`${product.name} perspective ${i + 1}`}
                                            className="w-full h-full object-cover select-none"
                                            draggable="false"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Wishlist Button Pinned on Top Right of Mobile Image */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleWishlist()
                                }}
                                aria-label="Toggle Wishlist"
                                className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 z-10 ${
                                    isWishlisted 
                                        ? 'bg-primary text-white shadow-lux' 
                                        : 'bg-white/75 text-[#111110]/80 hover:bg-white hover:text-[#111110] border border-white/50 shadow-xs'
                                }`}
                            >
                                <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
                            </button>



                            {/* Mobile Clickable Thumbnails Row (All Images Visible At Once) */}
                            {displayImages.length > 1 && (
                                <div className="flex items-center gap-2 pt-2.5 overflow-x-auto scrollbar-none py-1">
                                    {displayImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                scrollToImage(idx)
                                                setIsMobilePaused(true)
                                                setTimeout(() => setIsMobilePaused(false), 3000)
                                            }}
                                            className={`relative w-12 h-14 sm:w-14 sm:h-16 rounded-xl overflow-hidden shrink-0 transition-all duration-300 ${
                                                activeImageIndex === idx 
                                                    ? 'ring-2 ring-[#111110] shadow-sm scale-105 opacity-100' 
                                                    : 'border border-[#111110]/15 opacity-55 hover:opacity-90'
                                            }`}
                                            aria-label={`Select image ${idx + 1}`}
                                        >
                                            <img
                                                src={getOptimizedImage(img, 200)}
                                                alt={`Thumbnail ${idx + 1}`}
                                                className="w-full h-full object-cover select-none"
                                                draggable="false"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* DESKTOP GALLERY: 2-Column Grid (Only on lg+) */}
                        <div className={`hidden lg:grid ${displayImages.length === 1 ? 'grid-cols-1 max-w-lg mx-auto' : 'grid-cols-2'} gap-4 md:gap-5`}>
                            {displayImages.map((img, i) => (
                                <Motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: i * 0.05 }}
                                    onClick={() => setSelectedImage(img)}
                                    className="relative aspect-[4/5] bg-[#fbf9f6] rounded-xl sm:rounded-2xl overflow-hidden shadow-lux-sm border border-[#111110]/5 cursor-zoom-in group"
                                >
                                    <img
                                        src={getOptimizedImage(img, 1200)}
                                        alt={`${product.name} perspective ${i + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />

                                    {/* Wishlist Toggle on First Image */}
                                    {i === 0 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleWishlist()
                                            }}
                                            aria-label="Toggle Wishlist"
                                            className={`absolute top-2.5 right-2.5 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 z-10 ${
                                                isWishlisted ? 'bg-primary text-white shadow-lux' : 'bg-white/70 text-[#111110]/70 hover:bg-white hover:text-[#111110] border border-white/40 shadow-xs'
                                            }`}
                                        >
                                            <Heart size={15} className={isWishlisted ? 'fill-current' : ''} />
                                        </button>
                                    )}
                                </Motion.div>
                            ))}
                        </div>
                    </div>

                    {/* CONTENT SIDE: Sticky Info & Purchase Panel */}
                    <div className="w-full lg:w-[40%] xl:w-[38%] lg:sticky lg:top-28 space-y-4 sm:space-y-6">
                        <header>
                            <Motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                className="flex items-center gap-2 mb-1.5 sm:mb-2"
                            >
                                <span className="font-sans text-[9.5px] sm:text-[10.5px] tracking-[0.25em] uppercase text-[#a88243] font-bold">
                                    {product.series || product.category || 'Fine Jewellery Archive'}
                                </span>
                            </Motion.div>
                            <Motion.h1
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 }}
                                className="font-plex text-2xl sm:text-4xl lg:text-[42px] text-[#111110] leading-[1.15] mb-2 sm:mb-3 font-medium tracking-tight"
                            >
                                {product.name}
                            </Motion.h1>
                            
                            {/* Price & Value Details */}
                            <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 mb-2.5 sm:mb-3.5">
                                <span className="font-plex text-2xl sm:text-3xl font-semibold text-[#111110] tracking-tight">
                                    {formatPrice(product.price)}
                                </span>
                                {Number(product.mrp) > Number(product.price) ? (
                                    <span className="font-plex text-sm sm:text-base text-stone-400 line-through font-normal">
                                        {formatPrice(product.mrp)}
                                    </span>
                                ) : null}
                                <span className="font-sans text-[11px] sm:text-[11.5px] text-[#4a463f] uppercase tracking-wider font-semibold">
                                    • Taxes Included
                                </span>
                                <span className="font-sans text-[10px] sm:text-[11px] text-[#166534] font-bold bg-[#eef8f1] px-2.5 sm:px-3 py-0.5 rounded-full border border-[#bbf7d0]">
                                    Free Insured Delivery
                                </span>
                            </div>

                            <p className="font-plex text-[14px] sm:text-[15.5px] text-[#24221f] leading-relaxed font-normal">
                                {product.description || product.details}
                            </p>
                        </header>

                        {/* Action Area (Quantity + Buy Now + Wishlist) - Placed Prominently Below Description */}
                        <div className="space-y-2.5 sm:space-y-3.5 pt-1 pb-3">
                            {/* Desktop Stock Line */}
                            <div className="hidden sm:flex items-center justify-between text-[11px] sm:text-[11.5px] tracking-wider uppercase text-[#33302b] font-bold px-1">
                                <span className="inline-flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-rose-500' : 'bg-emerald-600 animate-pulse'}`} />
                                    {isOutOfStock ? 'Out of Stock' : (availableToAdd > 0 ? 'In Stock' : 'In Bag')}
                                </span>
                                {!isOutOfStock && Number(product.stock) < 10 && (
                                    <span className="text-[#855e23] font-bold">
                                        {availableToAdd > 0 ? `${availableToAdd} units left` : 'All in your bag'}
                                    </span>
                                )}
                            </div>

                            {/* Mobile Stock Line + Quantity & Wishlist in One Elegant Row */}
                            <div className="flex sm:hidden items-center justify-between text-[10.5px] font-bold tracking-wider uppercase text-[#33302b] px-0.5 pb-1">
                                <div className="inline-flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-rose-500' : 'bg-emerald-600 animate-pulse'}`} />
                                    <span>{isOutOfStock ? 'Out of Stock' : (availableToAdd > 0 ? 'In Stock' : 'In Bag')}</span>
                                    {!isOutOfStock && Number(product.stock) < 10 && (
                                        <span className="text-[#855e23] font-semibold text-[9.5px]">({availableToAdd > 0 ? `${availableToAdd} left` : 'in bag'})</span>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center border border-[#111110]/15 rounded-full px-2 h-9 bg-white/95 backdrop-blur-sm shadow-2xs">
                                        <button
                                            disabled={isOutOfStock || availableToAdd === 0}
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="p-0.5 hover:opacity-50 transition-opacity disabled:opacity-20"
                                            aria-label="Decrease quantity"
                                        >
                                            <Minus size={11} />
                                        </button>
                                        <span className="px-2 font-sans font-bold text-xs text-[#111110] min-w-[14px] text-center select-none">
                                            {isOutOfStock ? 0 : (availableToAdd === 0 ? 0 : quantity)}
                                        </span>
                                        <button
                                            disabled={isOutOfStock || availableToAdd === 0 || quantity >= availableToAdd}
                                            onClick={() => setQuantity(Math.min(availableToAdd, quantity + 1))}
                                            className="p-0.5 hover:opacity-50 transition-opacity disabled:opacity-20"
                                            aria-label="Increase quantity"
                                        >
                                            <Plus size={11} />
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleWishlist}
                                        aria-label="Wishlist item"
                                        className={`h-9 w-9 rounded-full border border-[#111110]/15 flex items-center justify-center transition-all duration-300 shrink-0 ${isWishlisted ? 'bg-primary/10 border-primary/30 text-error shadow-inner' : 'bg-white hover:bg-[#111110] text-[#111110] hover:text-white shadow-2xs'
                                            }`}
                                    >
                                        <Heart size={14} className={isWishlisted ? 'fill-current' : ''} />
                                    </button>
                                </div>
                            </div>

                            {/* The Two Main Action Buttons Side-by-Side in ONE Line on All Devices */}
                            <div className="flex items-center gap-2 sm:gap-2.5 w-full">
                                {/* Desktop Quantity Selector */}
                                <div className="hidden sm:flex items-center border border-[#111110]/15 rounded-full px-2.5 sm:px-3 h-11 sm:h-12.5 bg-white/90 backdrop-blur-sm shrink-0 shadow-xs">
                                    <button
                                        disabled={isOutOfStock || availableToAdd === 0}
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-1 hover:opacity-50 transition-opacity disabled:opacity-20"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus size={12} />
                                    </button>
                                    <span className="px-1.5 sm:px-2.5 font-sans font-bold text-xs sm:text-sm text-[#111110] min-w-[14px] text-center select-none">
                                        {isOutOfStock ? 0 : (availableToAdd === 0 ? 0 : quantity)}
                                    </span>
                                    <button
                                        disabled={isOutOfStock || availableToAdd === 0 || quantity >= availableToAdd}
                                        onClick={() => setQuantity(Math.min(availableToAdd, quantity + 1))}
                                        className="p-1 hover:opacity-50 transition-opacity disabled:opacity-20"
                                        aria-label="Increase quantity"
                                    >
                                        <Plus size={12} />
                                    </button>
                                </div>

                                {/* Button 1: Add to Bag */}
                                <button
                                    disabled={isOutOfStock || availableToAdd === 0}
                                    onClick={() => {
                                        if (isOutOfStock) return;
                                        addToCart(product._id, quantity)
                                        trackAddToCart(product, quantity)
                                    }}
                                    className={`flex-1 h-11.5 sm:h-12.5 ${
                                        isOutOfStock
                                            ? 'bg-stone-200 text-stone-500 border border-stone-300 cursor-not-allowed shadow-none'
                                            : (availableToAdd === 0
                                                ? 'bg-[#111110]/20 text-stone-400 cursor-not-allowed'
                                                : 'bg-[#111110] hover:bg-black text-[#f5f0e8] shadow-lux-sm active:scale-[0.99]')
                                    } px-3 sm:px-5 text-[10.5px] sm:text-[11px] tracking-[0.14em] sm:tracking-[0.16em] uppercase font-sans font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all rounded-full disabled:cursor-not-allowed whitespace-nowrap min-w-0`}
                                >
                                    <ShoppingBag size={14} className="shrink-0" />
                                    <span>
                                        {isOutOfStock ? 'Out of Stock' : (availableToAdd === 0 ? 'In Bag' : 'Add to Bag')}
                                    </span>
                                </button>

                                {/* Button 2: Buy Now */}
                                {!isOutOfStock && (
                                    <button
                                        onClick={handleBuyNow}
                                        className="flex-1 h-11.5 sm:h-12.5 bg-[#855e23] hover:bg-[#6e4e1d] text-white text-[10.5px] sm:text-[11px] tracking-[0.14em] sm:tracking-[0.16em] uppercase font-sans font-bold flex items-center justify-center gap-1.5 sm:gap-2 rounded-full transition-all shadow-lux-sm active:scale-[0.99] whitespace-nowrap min-w-0"
                                    >
                                        <span>Buy Now</span>
                                        <ArrowRight size={14} className="shrink-0" />
                                    </button>
                                )}

                                {/* Desktop Wishlist Button */}
                                <button
                                    onClick={handleWishlist}
                                    aria-label="Wishlist item"
                                    className={`hidden sm:flex h-11 w-11 sm:h-12.5 sm:w-12.5 rounded-full border border-[#111110]/15 items-center justify-center transition-all duration-300 shrink-0 ${isWishlisted ? 'bg-primary/10 border-primary/30 text-error shadow-inner' : 'bg-white hover:bg-[#111110] text-[#111110] hover:text-white shadow-xs'
                                        }`}
                                >
                                    <Heart size={14} className={isWishlisted ? 'fill-current' : ''} />
                                </button>
                            </div>
                        </div>


                        {/* Product Specifications: Open Architectural Ledger */}
                        <div className="pt-2">
                            <div className="flex items-center justify-between pb-3 border-b border-[#111110]/15">
                                <h2 className="font-sans text-[11px] sm:text-[12px] tracking-[0.22em] uppercase font-bold text-[#111110]">
                                    Product Specifications
                                </h2>
                                <span className="font-sans text-[9.5px] sm:text-[10.5px] uppercase tracking-wider text-[#855e23] font-bold border border-[#855e23]/35 bg-[#fbf6ec] px-3 py-0.5 rounded-full shadow-2xs">
                                    {product.certification || '18K PVD Certified'}
                                </span>
                            </div>

                            {/* Hairline Specification Rows */}
                            <div className="divide-y divide-[#111110]/10">
                                {[
                                    { label: 'Material', value: product.material || 'Stainless Steel' },
                                    { label: 'Plating Finish', value: product.plating || 'Gold 18K PVD Plating' },
                                    { label: 'Stone / Pearl', value: product.stone || 'Natural Gemstone' },
                                    { label: 'Length / Dimensions', value: product.length || '46 cm' },
                                    { label: 'Weight', value: product.weight || '21g/pair' }
                                ].map(spec => (
                                    <div key={spec.label} className="py-3 flex items-center justify-between gap-4">
                                        <span className="font-sans text-[10.5px] sm:text-[11.5px] tracking-[0.16em] uppercase text-[#3d3a35] font-bold shrink-0">
                                            {spec.label}
                                        </span>
                                        <span className="font-plex text-[14px] sm:text-[15.5px] text-[#111110] font-semibold tracking-tight text-right">
                                            {spec.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Inline Quality Standards Hallmarks (Clean Typographic Text - No Emojis) */}
                            <div className="pt-3.5 pb-1 flex flex-wrap items-center gap-x-3.5 gap-y-2 border-t border-[#111110]/10">
                                {(product.features || ['Sweatproof', 'Anti Tarnish', 'Water proof', 'Hypoallergenic']).map((feature, idx) => (
                                    <span 
                                        key={feature} 
                                        className="inline-flex items-center gap-2 font-sans text-[10px] sm:text-[11px] tracking-wider uppercase text-[#1c1b18] font-bold"
                                    >
                                        {idx > 0 && <span className="text-[#855e23]">•</span>}
                                        <span>{feature}</span>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Collapsible Maison Service Drawers */}
                        <div className="border-t border-[#111110]/15 divide-y divide-[#111110]/10 pt-1">
                            {/* Drawer: Delivery & Atelier Packaging */}
                            <div className="py-0.5">
                                <button
                                    type="button"
                                    onClick={() => toggleAccordion('shipping')}
                                    className="w-full py-3.5 flex items-center justify-between text-left group transition-colors"
                                >
                                    <span className="font-sans text-[11px] sm:text-[12px] tracking-[0.18em] uppercase font-bold text-[#111110] group-hover:text-[#855e23] transition-colors">
                                        Complimentary Delivery & Assurance
                                    </span>
                                    <ChevronDown
                                        size={15}
                                        className={`text-[#4a463f] transition-transform duration-300 ${openAccordion === 'shipping' ? 'rotate-180 text-[#111110]' : ''}`}
                                    />
                                </button>

                                <AnimatePresence initial={false}>
                                    {openAccordion === 'shipping' && (
                                        <Motion.div
                                            key="shipping-drawer"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pb-3.5 pt-1 space-y-2 font-sans text-[12px] sm:text-[13px] text-[#33302b] leading-relaxed">
                                                <p className="flex items-center gap-2.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#966c2d] shrink-0" />
                                                    <span><strong>Free Insured Express Courier</strong> across India with real-time tracking.</span>
                                                </p>
                                                <p className="flex items-center gap-2.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#966c2d] shrink-0" />
                                                    <span>Includes signature SOVRA luxury gift packaging & protective travel pouch.</span>
                                                </p>
                                                <p className="flex items-center gap-2.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#966c2d] shrink-0" />
                                                    <span>Official certificate of authenticity included with each piece.</span>
                                                </p>
                                            </div>
                                        </Motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Drawer: Maison Care & Durability */}
                            <div className="py-0.5">
                                <button
                                    type="button"
                                    onClick={() => toggleAccordion('care')}
                                    className="w-full py-3.5 flex items-center justify-between text-left group transition-colors"
                                >
                                    <span className="font-sans text-[11px] sm:text-[12px] tracking-[0.18em] uppercase font-bold text-[#111110] group-hover:text-[#855e23] transition-colors">
                                        Maison Care & Durability Guide
                                    </span>
                                    <ChevronDown
                                        size={15}
                                        className={`text-[#4a463f] transition-transform duration-300 ${openAccordion === 'care' ? 'rotate-180 text-[#111110]' : ''}`}
                                    />
                                </button>

                                <AnimatePresence initial={false}>
                                    {openAccordion === 'care' && (
                                        <Motion.div
                                            key="care-drawer"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <div className="pb-3.5 pt-1 space-y-2 font-sans text-[12px] sm:text-[13px] text-[#33302b] leading-relaxed">
                                                <p className="flex items-center gap-2.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#966c2d] shrink-0" />
                                                    <span>Engineered with multi-layer 18K PVD vacuum deposition for continuous daily wear.</span>
                                                </p>
                                                <p className="flex items-center gap-2.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#966c2d] shrink-0" />
                                                    <span>100% resistant to water, heat, and sweat. Shower and workout safe.</span>
                                                </p>
                                                <p className="flex items-center gap-2.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#966c2d] shrink-0" />
                                                    <span>To restore peak mirror brilliance, gently wipe with the included SOVRA microfiber cloth.</span>
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

                {/* Reviews Section - Redesigned & Balanced */}
                <section className="mt-12 sm:mt-20 md:mt-28 pt-8 sm:pt-16 md:pt-20 border-t border-[#111110]/10">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-12">
                        <header className="space-y-2 sm:space-y-3">
                            <span className="font-sans text-[8.5px] sm:text-[9px] tracking-[0.35em] sm:tracking-[0.4em] uppercase text-[#7a7670] block font-bold">Verified Feedback</span>
                            <h2 className="font-plex text-2xl sm:text-4xl md:text-5xl leading-none text-[#111110] font-normal">Customer Reviews</h2>
                            <div className="flex items-center gap-3 sm:gap-4 pt-1">
                                <div className="flex text-primary">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Sparkles key={star} size={14} className={star <= Math.round(product.rating || 5) ? 'fill-current' : 'text-[#111110]/15'} />
                                    ))}
                                </div>
                                <span className="font-sans text-[11px] sm:text-xs tracking-wider font-bold text-[#111110]/80">
                                    {product.rating ? product.rating.toFixed(1) : '5.0'} / 5.0
                                </span>
                                <span className="text-xs text-[#7a7670]">•</span>
                                <span className="font-sans text-[11px] sm:text-xs tracking-wider font-medium text-[#7a7670]">
                                    {product.numReviews || 0} {product.numReviews === 1 ? 'Review' : 'Reviews'}
                                </span>
                            </div>
                        </header>

                        <button
                            onClick={() => setShowReviewForm(!showReviewForm)}
                            className="inline-flex items-center justify-center gap-2 bg-[#111110] text-[#f5f0e8] hover:bg-black px-4 sm:px-6 py-2 sm:py-3 rounded-full text-[8.5px] sm:text-[9px] tracking-[0.25em] sm:tracking-[0.3em] uppercase font-sans font-bold transition-all shadow-lux-sm self-start sm:self-auto shrink-0"
                        >
                            {showReviewForm ? 'Close Form' : 'Write a Review'}
                        </button>
                    </div>

                    {/* Review Submission Form (Expandable) */}
                    {showReviewForm && (
                        <div className="mb-8 sm:mb-14 bg-white p-4 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl border border-[#111110]/8 shadow-lux-soft max-w-3xl">
                            {localStorage.getItem('userInfo') ? (
                                <form onSubmit={submitReviewHandler} className="space-y-4 sm:space-y-6">
                                    <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#111110]/8">
                                        <h3 className="font-plex text-xl sm:text-2xl text-[#111110] font-medium">Share Your Experience</h3>
                                        <button 
                                            type="button" 
                                            onClick={() => setShowReviewForm(false)}
                                            className="text-[#7a7670] hover:text-[#111110] p-1"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <div className="space-y-1.5 sm:space-y-2">
                                        <label className="text-[8.5px] sm:text-[9px] uppercase tracking-[0.25em] sm:tracking-[0.3em] font-bold text-[#7a7670] block">Your Rating</label>
                                        <div className="flex gap-2 sm:gap-3">
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
                                                        className={(hoverRating || rating) >= s ? 'text-primary fill-current' : 'text-[#111110]/15'} 
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5 sm:space-y-2">
                                        <label className="text-[8.5px] sm:text-[9px] uppercase tracking-[0.25em] sm:tracking-[0.3em] font-bold text-[#7a7670] block">Your Review</label>
                                        <textarea
                                            required
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            rows={3}
                                            className="w-full bg-[#fbf9f6] border border-[#111110]/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 font-plex text-sm sm:text-base outline-none focus:border-primary focus:bg-white transition-all resize-none text-[#1c1b18]"
                                            placeholder="Write your honest reflection of this piece..."
                                        />
                                    </div>

                                    <button
                                        disabled={submittingReview}
                                        type="submit"
                                        className="bg-[#111110] text-white px-6 sm:px-8 py-2.5 sm:py-3.5 text-[8.5px] sm:text-[9px] tracking-[0.3em] uppercase font-bold hover:bg-black transition-all rounded-full shadow-lux disabled:opacity-50"
                                    >
                                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-4 sm:py-6 space-y-3 sm:space-y-4">
                                    <p className="font-plex text-lg sm:text-xl text-[#111110]/80">Please identify yourself to leave a review.</p>
                                    <Link to="/login" className="inline-block bg-[#111110] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-full text-[8.5px] sm:text-[9px] tracking-widest uppercase font-bold hover:bg-black transition-all">
                                        Sign In
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reviews List or Empty State */}
                    {!product.reviews || product.reviews.length === 0 ? (
                        <div className="py-10 sm:py-16 px-4 sm:px-6 text-center bg-[#fbf9f6] rounded-2xl sm:rounded-3xl border border-[#111110]/5 max-w-2xl mx-auto flex flex-col items-center justify-center gap-3 sm:gap-4">
                            <Sparkles size={26} className="text-primary/40" />
                            <h3 className="font-plex text-xl sm:text-2xl text-[#111110] font-medium">No reviews yet</h3>
                            <p className="font-plex text-xs sm:text-sm text-[#7a7670] max-w-sm">Be the first to share your experience with this creation.</p>
                            {!showReviewForm && (
                                <button
                                    onClick={() => setShowReviewForm(true)}
                                    className="mt-1 text-[8.5px] sm:text-[9px] tracking-[0.25em] sm:tracking-[0.3em] uppercase font-bold text-primary border-b border-primary/40 pb-1 hover:border-primary transition-all"
                                >
                                    Write the First Review
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            {product.reviews.map((review, idx) => (
                                <Motion.div
                                    key={review._id || idx}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-4 sm:p-8 bg-[#fbf9f6] border border-[#111110]/5 rounded-2xl sm:rounded-3xl shadow-xs space-y-3 sm:space-y-5 relative overflow-hidden"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex text-primary">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Sparkles key={s} size={13} className={s <= review.rating ? 'fill-current' : 'text-[#111110]/15'} />
                                            ))}
                                        </div>
                                        <span className="text-[7.5px] sm:text-[8px] uppercase tracking-widest font-bold text-[#7a7670]">{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    <p className="font-plex text-sm sm:text-base text-[#4a4947] leading-relaxed font-normal">
                                        "{review.comment}"
                                    </p>

                                    <div className="pt-3 sm:pt-4 border-t border-[#111110]/5 flex items-center justify-between">
                                        <span className="font-plex text-base sm:text-lg font-medium text-[#111110]">{review.name}</span>
                                        <span className="font-sans text-[7.5px] sm:text-[8px] tracking-[0.2em] sm:tracking-[0.25em] uppercase text-primary font-bold bg-primary/8 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">Verified Client</span>
                                    </div>
                                </Motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {/* Similar Products Section */}
                <section className="mt-14 sm:mt-24 md:mt-32 pt-10 sm:pt-16 md:pt-20 border-t border-[#111110]/10 overflow-hidden pb-16 sm:pb-32 md:pb-48">
                    <div className="flex flex-col items-center mb-6 sm:mb-12 md:mb-16 text-center space-y-2 sm:space-y-3">
                        <span className="font-sans text-[8.5px] sm:text-[9px] tracking-[0.4em] sm:tracking-[0.5em] uppercase text-[#7a7670] block font-bold">Complete the Curation</span>
                        <h2 className="font-plex text-2xl sm:text-4xl md:text-5xl leading-none text-[#111110] font-normal">You May Also Like</h2>
                        <div className="w-10 sm:w-12 h-[1px] bg-primary/40 mt-2 sm:mt-3 mx-auto" />
                    </div>

                    {loadingSimilar ? (
                        <div className="flex justify-center p-12 sm:p-20">
                            <div className="w-8 h-8 border border-primary/20 border-t-primary rounded-full animate-spin" />
                        </div>
                    ) : similarProducts.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 md:gap-8">
                            {similarProducts.map((p, idx) => (
                                <Motion.div
                                    key={p._id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.08, duration: 0.6 }}
                                    viewport={{ once: true }}
                                    className="group flex flex-col h-full bg-white shadow-lux-soft hover:shadow-lux transition-all duration-700 rounded-xl sm:rounded-3xl overflow-hidden border border-[#111110]/5"
                                >
                                    <Link to={`/product/${p._id}`} className="relative aspect-[3/4] overflow-hidden bg-[#f5f0e8]">
                                        <img
                                            src={getOptimizedImage(p.img || p.image, 600)}
                                            alt={p.name}
                                            className="w-full h-full object-cover grayscale-[0.1] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                        <div className="absolute bottom-3 sm:bottom-5 left-3 right-3 sm:left-5 sm:right-5 translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                                            <div className="bg-white/95 backdrop-blur-md px-3 sm:px-5 py-2 sm:py-3 rounded-full text-center shadow-sm">
                                                <span className="font-sans text-[7.5px] sm:text-[8px] tracking-[0.25em] sm:tracking-[0.3em] uppercase text-[#111110] font-bold">View Piece</span>
                                            </div>
                                        </div>
                                    </Link>

                                    <div className="p-3 sm:p-6 md:p-8 flex flex-col flex-1 text-center justify-center items-center gap-1.5 sm:gap-3">
                                        <span className="text-[7.5px] sm:text-[8px] uppercase tracking-[0.3em] font-bold opacity-40">{p.category}</span>
                                        <Link to={`/product/${p._id}`}>
                                            <h3 className="font-plex text-xs sm:text-sm md:text-base font-medium text-[#111110] group-hover:text-primary transition-colors duration-300 line-clamp-1">{p.name}</h3>
                                        </Link>
                                        <span className="font-plex font-semibold text-xs sm:text-sm text-[#111110]">{formatPrice(p.price)}</span>
                                    </div>
                                </Motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 sm:py-16 px-4 sm:px-8 border border-dashed border-[#111110]/10 rounded-2xl sm:rounded-3xl max-w-xl mx-auto">
                            <p className="font-plex text-lg sm:text-xl opacity-50">No similar pieces found in this collection.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}

export default ProductDetail
