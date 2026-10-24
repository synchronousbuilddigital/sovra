import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, Link } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { useShop } from '../context/ShopContext'
import { ArrowLeft, Sparkles, Heart, Minus, Plus, ShoppingBag, X, Check } from 'lucide-react'
import api from '../utils/api'
import { formatPrice } from '../utils/currency'
import { getOptimizedImage } from '../utils/imageUtils'
import { toast } from 'react-toastify'
import Skeleton from '../components/Skeleton'
import { trackAddToCart, trackWishlist, trackViewItem } from '../utils/analytics'

const ProductDetail = () => {
    const { id } = useParams()
    const { cart, addToCart, addToWishlist, wishlist, removeFromWishlist } = useShop();
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [quantity, setQuantity] = useState(1)
    const [selectedImage, setSelectedImage] = useState(null)
    const [similarProducts, setSimilarProducts] = useState([])
    const [loadingSimilar, setLoadingSimilar] = useState(true)

    // Review States
    const [rating, setRating] = useState(5)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [submittingReview, setSubmittingReview] = useState(false)
    const [showReviewForm, setShowReviewForm] = useState(false)

    const isWishlisted = wishlist.some(item => (item._id || item) === id);
    const cartItem = cart.find(item => (item.product?._id || item.product) === id);
    const currentInCart = cartItem ? cartItem.qty : 0;
    const isOutOfStock = !product || Number(product.stock) <= 0;
    const availableToAdd = product && !isOutOfStock ? Math.max(0, Number(product.stock) - currentInCart) : 0;

    useEffect(() => {
        window.scrollTo(0, 0)
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
            setProduct({
                _id: id,
                name: "Nova Heart Necklace",
                series: "Celestial Body",
                price: 1250.00,
                description: '"A delicate and timeless heart silhouette, meticulously crafted for the modern romantic. The Nova Heart Necklace combines effortless elegance with everyday resilience."',
                material: "Stainless Steel",
                plating: "Gold 18K PVD Plating",
                stone: "Natural",
                length: "46 cm",
                weight: "6g",
                features: ["Sweatproof", "Anti Tarnish", "Water proof", "Hypoallergenic"],
                images: ["https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=2070&auto=format&fit=crop"],
                reviews: []
            })
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
                    {/* Gallery Skeleton: 2-Column Grid */}
                    <div className="w-full lg:w-[60%] xl:w-[62%] grid grid-cols-2 gap-2 sm:gap-4 md:gap-5">
                        {[1, 2, 3, 4].map(i => (
                            <Skeleton key={i} height="auto" className="aspect-[4/5] rounded-xl sm:rounded-2xl" />
                        ))}
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

    const displayImages = Array.from(new Set([product.img || product.image, ...(product.images || [])].filter(Boolean)));

    return (
        <div className="product-page pt-16 sm:pt-20 md:pt-28 pb-12 md:pb-20 bg-[#fffcf7] min-h-screen selection:bg-primary/10">
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
            <main className="max-w-[1600px] mx-auto px-3.5 sm:px-6 md:px-10 lg:px-12">

                {/* Editorial Top Navigation */}
                <Link to="/shop" className="inline-flex items-center gap-2 sm:gap-3 font-sans text-[8.5px] sm:text-[9px] tracking-[0.3em] sm:tracking-[0.35em] uppercase text-[#7a7670] mb-3 sm:mb-5 md:mb-8 hover:text-[#111110] transition-colors group font-bold">
                    <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-1.5" />
                    Back to Curation
                </Link>

                <div className="flex flex-col lg:flex-row gap-6 md:gap-10 xl:gap-14 items-start">

                    {/* GALLERY: Responsive Product Images Grid */}
                    <div className="w-full lg:w-[60%] xl:w-[62%]">
                        <div className={`grid ${displayImages.length === 1 ? 'grid-cols-1 max-w-lg mx-auto' : 'grid-cols-2'} gap-2 sm:gap-4 md:gap-5`}>
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
                                <span className="font-sans text-[10px] sm:text-[11px] text-[#78736a] uppercase tracking-wider font-medium">
                                    • Taxes Included
                                </span>
                                <span className="font-sans text-[9.5px] sm:text-[10.5px] text-[#15803d] font-semibold bg-[#eef8f1] px-2 sm:px-2.5 py-0.5 rounded-full border border-[#d1ebd7]">
                                    Free Insured Delivery
                                </span>
                            </div>

                            <p className="font-plex text-[13.5px] sm:text-[15px] text-[#3d3a35] leading-relaxed font-normal">
                                {product.description || product.details}
                            </p>
                        </header>

                        {/* Elevated Atelier Specifications & Standards Card */}
                        <div className="bg-[#faf8f4] rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-[#e8e3d8] shadow-[0_2px_16px_rgba(0,0,0,0.02)] space-y-3 sm:space-y-4">
                            <div className="flex items-center justify-between border-b border-[#111110]/8 pb-2">
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <Sparkles size={12} className="text-[#a88243]" />
                                    <span className="font-sans text-[9.5px] sm:text-[10.5px] tracking-[0.18em] sm:tracking-[0.2em] uppercase text-[#615c54] font-bold">
                                        Atelier Specifications
                                    </span>
                                </div>
                                <span className="font-sans text-[8.5px] sm:text-[9px] uppercase tracking-wider text-[#a88243] font-bold bg-[#a88243]/10 px-2 py-0.5 rounded">
                                    18K PVD Certified
                                </span>
                            </div>

                            {/* 2-Column Specification Micro-Tiles */}
                            <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5">
                                {[
                                    { label: 'Material', value: product.material || 'Stainless Steel' },
                                    { label: 'Plating', value: product.plating || 'Gold 18K PVD Plating' },
                                    { label: 'Stone / Pearl', value: product.stone || 'Natural' },
                                    { label: 'Length', value: product.length || '46 cm' },
                                    { label: 'Weight', value: product.weight || '5g/pair' }
                                ].map(spec => (
                                    <div key={spec.label} className="bg-white/95 rounded-lg sm:rounded-xl px-2.5 sm:px-3.5 py-2 sm:py-2.5 border border-[#111110]/6 flex flex-col justify-center">
                                        <span className="font-sans text-[8.5px] sm:text-[9.5px] tracking-[0.15em] uppercase text-[#7a756c] font-semibold block mb-0.5">
                                            {spec.label}
                                        </span>
                                        <span className="font-plex text-[12px] sm:text-[14px] text-[#1c1b18] font-medium tracking-tight truncate">
                                            {spec.value}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Maison Quality Standards Hallmarks */}
                            <div className="pt-2 sm:pt-3 border-t border-[#111110]/8">
                                <span className="font-sans text-[9.5px] sm:text-[10px] tracking-[0.16em] uppercase text-[#615c54] font-bold block mb-1.5 sm:mb-2">
                                    Maison Quality Standards
                                </span>
                                <div className="flex flex-wrap gap-1 sm:gap-1.5">
                                    {(product.features || ['Sweatproof', 'Anti Tarnish', 'Water proof', 'Hypoallergenic']).map(feature => (
                                        <div 
                                            key={feature} 
                                            className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white border border-[#e2dcd0] shadow-xs text-[#1c1b18]"
                                        >
                                            <Check size={10} className="text-[#a88243]" strokeWidth={2.5} />
                                            <span className="font-sans text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold">
                                                {feature}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Action Area (Quantity + Add to Bag + Wishlist) */}
                        <div className="space-y-2.5 sm:space-y-3.5 pt-0.5 sm:pt-1">
                            <div className="flex items-center justify-between text-[9.5px] sm:text-[10.5px] tracking-wider uppercase text-[#615c54] font-bold px-1">
                                <span className="inline-flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${isOutOfStock ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`} />
                                    {isOutOfStock ? 'Out of Stock' : (availableToAdd > 0 ? 'In Stock' : 'In Bag')}
                                </span>
                                {!isOutOfStock && Number(product.stock) < 10 && (
                                    <span className="text-[#a88243] font-bold">
                                        {availableToAdd > 0 ? `${availableToAdd} units left` : 'All in your bag'}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="flex items-center border border-[#111110]/15 rounded-full px-2.5 sm:px-3.5 h-11 sm:h-13.5 bg-white/80 backdrop-blur-sm shrink-0 shadow-xs">
                                    <button
                                        disabled={isOutOfStock || availableToAdd === 0}
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-1 hover:opacity-50 transition-opacity disabled:opacity-20"
                                        aria-label="Decrease quantity"
                                    >
                                        <Minus size={12} />
                                    </button>
                                    <span className="px-2 sm:px-4 font-sans font-bold text-xs text-[#111110]">
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

                                <button
                                    disabled={isOutOfStock || availableToAdd === 0}
                                    onClick={() => {
                                        if (isOutOfStock) return;
                                        addToCart(product._id, quantity)
                                        // GA4: add_to_cart
                                        trackAddToCart(product, quantity)
                                    }}
                                    className={`flex-1 h-11 sm:h-13.5 ${
                                        isOutOfStock
                                            ? 'bg-stone-200 text-stone-500 border border-stone-300 cursor-not-allowed shadow-none'
                                            : (availableToAdd === 0
                                                ? 'bg-[#111110]/20 text-stone-400 cursor-not-allowed'
                                                : 'bg-[#111110] hover:bg-black text-[#f5f0e8] shadow-lux-sm active:scale-[0.99]')
                                    } px-3 sm:px-6 text-[10px] sm:text-[11px] tracking-[0.16em] sm:tracking-[0.2em] uppercase font-sans font-bold flex items-center justify-center gap-2 sm:gap-3 transition-all rounded-full disabled:cursor-not-allowed`}
                                >
                                    <ShoppingBag size={14} />
                                    <span>
                                        {isOutOfStock ? 'Out of Stock' : (availableToAdd === 0 ? 'In Bag' : 'Buy Now')}
                                    </span>
                                </button>

                                <button
                                    onClick={handleWishlist}
                                    aria-label="Wishlist item"
                                    className={`h-11 w-11 sm:h-13.5 sm:w-13.5 rounded-full border border-[#111110]/15 flex items-center justify-center transition-all duration-300 shrink-0 ${isWishlisted ? 'bg-primary/10 border-primary/30 text-error shadow-inner' : 'bg-white hover:bg-[#111110] text-[#111110] hover:text-white shadow-xs'
                                        }`}
                                >
                                    <Heart size={15} className={isWishlisted ? 'fill-current' : ''} />
                                </button>
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
