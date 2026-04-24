import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useShop } from '../context/ShopContext'
import { ArrowLeft, Sparkles, Heart, Minus, Plus, ShoppingBag } from 'lucide-react'
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
    const [activeImg, setActiveImg] = useState(0)
    const [similarProducts, setSimilarProducts] = useState([])
    const [loadingSimilar, setLoadingSimilar] = useState(true)

    // Review States
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [submittingReview, setSubmittingReview] = useState(false)

    const isWishlisted = wishlist.some(item => (item._id || item) === id);
    const cartItem = cart.find(item => (item.product?._id || item.product) === id);
    const currentInCart = cartItem ? cartItem.qty : 0;
    const availableToAdd = product ? Math.max(0, product.stock - currentInCart) : 0;

    useEffect(() => {
        window.scrollTo(0, 0)
        fetchProduct()
        trackView()
    }, [id])

    useEffect(() => {
        if (product && product.category) {
            fetchSimilarProducts()
        }
    }, [product])

    const trackView = async () => {
        try {
            if (localStorage.getItem('userInfo')) {
                await api.post('/users/recently-viewed', { productId: id })
            }
        } catch (error) {
            console.error('Archival observation error:', error)
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
                images: ["https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?q=80&w=2070&auto=format&fit=crop"],
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
            toast.success('Review Received by the Archive');
            setComment('');
            setRating(5);
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
        <div className="pt-32 pb-24 bg-[#fffcf7] min-h-screen">
            <main className="max-w-[1920px] mx-auto px-12 md:px-24">
                <div className="flex flex-col lg:flex-row gap-24 items-start">
                    {/* Gallery Skeleton */}
                    <div className="w-full lg:w-[45%] space-y-8">
                        <Skeleton height="auto" className="aspect-square rounded-2xl" />
                        <div className="grid grid-cols-5 gap-4">
                            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} height="auto" className="aspect-square rounded-2xl" />)}
                        </div>
                    </div>
                    {/* Content Skeleton */}
                    <div className="w-full lg:w-[55%] space-y-12 pt-10">
                        <div className="space-y-6">
                            <Skeleton width="100px" height="10px" />
                            <Skeleton width="80%" height="80px" />
                            <Skeleton width="150px" height="30px" />
                            <Skeleton width="100%" height="100px" />
                        </div>
                        <div className="py-12 border-y border-[#111110]/5 grid grid-cols-2 gap-x-12 gap-y-10">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="space-y-4">
                                    <Skeleton width="60px" height="8px" />
                                    <Skeleton width="120px" height="24px" />
                                </div>
                            ))}
                        </div>
                        <div className="space-y-8">
                            <Skeleton width="200px" height="50px" className="rounded-full" />
                            <Skeleton width="100%" height="70px" className="rounded-full" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )

    if (!product) return (
        <div className="pt-64 text-center bg-[#fffcf7] min-h-screen px-12">
            <h2 className="font-premium text-4xl italic mb-8">Piece not found in the archives.</h2>
            <Link to="/shop" className="font-sans text-[10px] tracking-widest uppercase border-b border-[#111110] pb-2 font-black">Return to Gallery</Link>
        </div>
    )

    const displayImages = [product.img || product.image, ...(product.images || [])].filter(url => !!url);

    return (
        <div className="pt-32 pb-24 bg-[#fffcf7] min-h-screen selection:bg-primary/10">
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
            <main className="max-w-[1920px] mx-auto px-12 md:px-24">

                {/* Editorial Top Navigation */}
                <Link to="/shop" className="inline-flex items-center gap-4 font-sans text-[9px] tracking-[0.4em] uppercase text-[#7a7670] mb-16 hover:text-[#111110] transition-colors group font-black">
                    <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-2" />
                    Back to Curation
                </Link>

                <div className="flex flex-col lg:flex-row gap-24 items-start">

                    {/* GALLERY Side */}
                    <div className="w-full lg:w-[45%] flex flex-col gap-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            className="relative aspect-square bg-[#f5f0e8] rounded-2xl overflow-hidden shadow-lux-sm"
                        >
                            <img
                                src={getOptimizedImage(displayImages[activeImg], 1200)}
                                alt={product.name}
                                className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-grayscale duration-500 hover:scale-105"
                            />


                            {/* Wishlist Toggle on Image */}
                            <button
                                onClick={handleWishlist}
                                className={`absolute top-12 right-12 w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-500 z-10 ${isWishlisted ? 'bg-primary text-white shadow-lux' : 'bg-white/20 text-white/60 hover:bg-white/40 border border-white/10 hover:text-white'
                                    }`}
                            >
                                <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
                            </button>
                        </motion.div>

                        {/* Detail views thumbnails */}
                        {displayImages.length > 1 && (
                            <div className="grid grid-cols-5 gap-4">
                                {displayImages.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImg(i)}
                                        className={`relative aspect-square overflow-hidden bg-[#f5f0e8] rounded-2xl transition-all duration-500 border ${activeImg === i ? 'border-[#111110] p-1 scale-95' : 'border-transparent opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={getOptimizedImage(img, 200)} alt="Detail" className="w-full h-full object-cover rounded-xl" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* CONTENT SIDE */}
                    <div className="w-full lg:w-[55%] lg:sticky lg:top-40 space-y-12 pt-10">
                        <header>
                            <motion.span
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                className="font-sans text-[10px] tracking-[0.4em] uppercase text-[#7a7670] block mb-6 font-black"
                            >
                                {product.series || product.category || 'Fine Jewellery Archive'}
                            </motion.span>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="font-premium text-6xl md:text-7xl text-[#111110] leading-none mb-8 italic"
                            >
                                {product.name}
                            </motion.h1>
                            <div className="flex items-center gap-6 mb-8 text-[#111110] font-black italic text-2xl">
                                <span>{formatPrice(product.price)}</span>
                                <div className="w-12 h-[1px] bg-[#111110]/10" />
                            </div>
                            <p className="font-body text-lg text-[#656464] leading-relaxed italic opacity-85 font-light">
                                {product.description || product.details}
                            </p>
                        </header>

                        <div className="py-12 border-y border-[#111110]/5 space-y-12">
                            <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                                {[
                                    { label: 'Material', value: product.material || 'Stainless Steel' },
                                    { label: 'Plating', value: product.plating || 'Gold 18K PVD Plating' },
                                    { label: 'Stone/Pearl', value: product.stone || 'Natural' },
                                    { label: 'Length', value: product.length || '46 cm' },
                                    { label: 'Weight', value: product.weight || '6g' }
                                ].map(spec => (
                                    <div key={spec.label} className="space-y-2 group/spec">
                                        <span className="font-sans text-[8px] tracking-[0.4em] uppercase text-[#7a7670] font-black opacity-60 italic group-hover/spec:text-primary transition-colors">{spec.label}</span>
                                        <p className="font-premium text-xl text-[#373831] font-light italic leading-tight">{spec.value}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-10 border-t border-[#111110]/5">
                                <span className="font-sans text-[8px] tracking-[0.4em] uppercase text-[#7a7670] font-black opacity-60 italic block mb-8 px-1">Maison Standards</span>
                                <div className="flex flex-wrap gap-4">
                                    {(product.features || ['Sweatproof', 'Anti Tarnish', 'Water proof', 'Hypoallergenic']).map(feature => (
                                        <div key={feature} className="bg-primary/5 px-6 py-2 rounded-full border border-primary/10 group/feat hover:bg-primary transition-all duration-700">
                                            <span className="font-sans text-[9px] tracking-widest uppercase text-primary font-black italic group-hover/feat:text-on-primary transition-colors">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8 pt-4">
                            <div className="flex items-center gap-12">
                                <div className="flex items-center border border-[#111110]/10 rounded-full px-6 py-3">
                                    <button
                                        disabled={availableToAdd === 0}
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-2 hover:opacity-50 transition-opacity disabled:opacity-20"
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className="px-8 font-sans font-black text-xs">{availableToAdd === 0 ? 0 : quantity}</span>
                                    <button
                                        disabled={availableToAdd === 0 || quantity >= availableToAdd}
                                        onClick={() => setQuantity(Math.min(availableToAdd, quantity + 1))}
                                        className="p-2 hover:opacity-50 transition-opacity disabled:opacity-20"
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-sans text-[9px] tracking-widest uppercase text-[#7a7670] font-black">
                                        {product.stock > 0 ? (availableToAdd > 0 ? 'Limited Edition Piece' : 'Vault Limit Reached') : 'Currently Unavailable'}
                                    </span>
                                    {product.stock > 0 && product.stock < 10 && (
                                        <span className="font-sans text-[8px] tracking-wider uppercase text-primary font-black mt-1 italic">
                                            {availableToAdd > 0 ? `Only ${availableToAdd} more pieces available for you` : 'All available units are in your bag'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                                <button
                                    disabled={availableToAdd === 0}
                                    onClick={() => {
                                        addToCart(product._id, quantity)
                                        // GA4: add_to_cart
                                        trackAddToCart(product, quantity)
                                    }}
                                    className={`flex-1 ${availableToAdd === 0 ? 'bg-[#111110]/20' : 'bg-[#111110]'} text-[#f5f0e8] py-6 px-10 text-[10px] tracking-[0.4em] uppercase font-sans font-black flex items-center justify-center gap-4 hover:opacity-95 transition-all rounded-full shadow-lux-sm active:scale-95 disabled:cursor-not-allowed`}
                                >
                                    <ShoppingBag size={14} />
                                    {product.stock === 0 ? 'Vault Empty' : (availableToAdd === 0 ? 'In Bag' : 'Begin Acquisition')}
                                </button>
                                <button
                                    onClick={handleWishlist}
                                    className={`w-full md:w-20 h-20 rounded-full border flex items-center justify-center transition-all duration-500 ${isWishlisted ? 'bg-primary/5 border-primary/20 text-error shadow-inner' : 'border-[#111110]/10 text-[#111110] hover:bg-[#111110] hover:text-white'
                                        }`}
                                >
                                    <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Narrative Detail Section */}
                <div className="mt-48 pt-32 border-t border-[#111110]/5 max-w-4xl">
                    <span className="font-sans text-[10px] tracking-[0.5em] uppercase text-[#7a7670] block mb-12 font-black">The Visionary Process</span>
                    <p className="font-premium text-4xl md:text-5xl text-[#111110] leading-tight italic font-light">
                        "For every masterpiece, there's a whisper of celestial inspiration. Our artisans spend weeks hand-sculpting each curve to ensure it captures the exact radiance of the Aravalli hills."
                    </p>
                </div>

                {/* Reviews Section */}
                <section className="mt-48 pt-32 border-t border-[#111110]/10 overflow-hidden">
                    <div className="flex flex-col lg:flex-row gap-24">
                        <div className="w-full lg:w-1/3 space-y-12">
                            <header className="space-y-6">
                                <span className="font-sans text-[10px] tracking-[0.5em] uppercase text-[#7a7670] block font-black">Client Reflections</span>
                                <h2 className="font-premium text-6xl italic leading-none">Voices of the Archive</h2>
                                <div className="flex items-center gap-6">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Sparkles key={star} size={20} className={star <= Math.round(product.rating || 0) ? 'text-primary fill-current' : 'text-[#111110]/10'} />
                                        ))}
                                    </div>
                                    <span className="font-sans text-xs tracking-widest font-black opacity-40 uppercase">{product.numReviews || 0} Acquisitions</span>
                                </div>
                            </header>

                            {/* Review Form */}
                            {localStorage.getItem('userInfo') ? (
                                <form onSubmit={submitReviewHandler} className="bg-white p-12 shadow-lux-soft border border-[#111110]/5 space-y-10 group">
                                    <h3 className="font-premium text-2xl italic">Leave your record</h3>

                                    <div className="space-y-4">
                                        <label className="text-[9px] uppercase tracking-[0.4em] font-black opacity-40">Star Rating</label>
                                        <div className="flex gap-4">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setRating(s)}
                                                    className={`transition-all duration-500 ${rating >= s ? 'text-primary scale-125' : 'text-[#111110]/10'}`}
                                                >
                                                    <Sparkles size={24} className={rating >= s ? 'fill-current' : ''} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[9px] uppercase tracking-[0.4em] font-black opacity-40">Your Correspondence</label>
                                        <textarea
                                            required
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            className="w-full bg-transparent border-b border-[#111110]/10 py-4 font-body text-lg italic outline-none focus:border-primary min-h-[120px] resize-none"
                                            placeholder="Write your reflection of this piece..."
                                        ></textarea>
                                    </div>

                                    <button
                                        disabled={submittingReview}
                                        type="submit"
                                        className="w-full bg-primary text-on-primary py-5 text-[10px] tracking-[0.5em] uppercase font-black hover:opacity-95 transition-all shadow-lux disabled:opacity-50"
                                    >
                                        {submittingReview ? 'Syncing...' : 'Secure Review'}
                                    </button>
                                </form>
                            ) : (
                                <div className="p-12 border border-dashed border-[#111110]/20 text-center space-y-8">
                                    <p className="font-premium text-2xl italic opacity-30">Login to leave your reflection.</p>
                                    <Link to="/login" className="inline-block bg-[#111110] text-white px-12 py-5 text-[10px] tracking-widest uppercase font-black">Identify Yourself</Link>
                                </div>
                            )}
                        </div>

                        <div className="w-full lg:w-2/3 space-y-16">
                            {product.reviews?.length === 0 ? (
                                <div className="py-40 text-center border-l border-[#111110]/5 pl-12 flex flex-col items-center justify-center gap-8">
                                    <Sparkles size={48} className="text-[#111110]/5" />
                                    <p className="font-premium text-4xl italic opacity-20">The archive is silent. Be the first to speak.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {product.reviews?.map((review, idx) => (
                                        <motion.div
                                            key={review._id}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="p-10 bg-[#fbf9f6] border border-[#111110]/5 shadow-sm space-y-8 relative overflow-hidden group"
                                        >
                                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] select-none pointer-events-none group-hover:opacity-[0.08] transition-opacity duration-1000">
                                                <span className="font-premium text-8xl italic">S.</span>
                                            </div>

                                            <div className="flex justify-between items-start relative z-10">
                                                <div className="flex">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Sparkles key={s} size={14} className={s <= review.rating ? 'text-primary fill-current' : 'text-[#111110]/10'} />
                                                    ))}
                                                </div>
                                                <span className="text-[8px] uppercase tracking-widest font-black opacity-30">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>

                                            <p className="font-body text-lg italic text-[#656464] leading-relaxed relative z-10">
                                                "{review.comment}"
                                            </p>

                                            <div className="pt-6 border-t border-[#111110]/5 relative z-10">
                                                <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-primary font-black block mb-2">Verified Client</span>
                                                <span className="font-premium text-xl italic text-[#111110]">{review.name}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Similar Products section */}
                <section className="mt-48 pt-32 border-t border-[#111110]/10 overflow-hidden pb-48">
                    <div className="flex flex-col items-center mb-16 text-center space-y-6">
                        <span className="font-sans text-[10px] tracking-[0.6em] uppercase text-[#7a7670] block font-black">Complete the Curation</span>
                        <h2 className="font-premium text-6xl italic leading-none">Similar Archives</h2>
                        <div className="w-16 h-[1px] bg-primary/30 mt-4 mx-auto" />
                    </div>

                    {loadingSimilar ? (
                        <div className="flex justify-center p-24">
                            <div className="w-8 h-8 border border-primary/20 border-t-primary rounded-full animate-spin" />
                        </div>
                    ) : similarProducts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                            {similarProducts.map((p, idx) => (
                                <motion.div
                                    key={p._id}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1, duration: 1 }}
                                    viewport={{ once: true }}
                                    className="group flex flex-col h-full bg-white shadow-lux-soft hover:shadow-lux transition-all duration-700 rounded-3xl overflow-hidden border border-[#111110]/5"
                                >
                                    <Link to={`/product/${p._id}`} className="relative aspect-[3/4] overflow-hidden bg-[#f5f0e8]">
                                        <img
                                            src={getOptimizedImage(p.img || p.image, 600)}
                                            alt={p.name}
                                            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-grayscale duration-[1.5s] group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                                        <div className="absolute bottom-6 left-6 right-6 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 z-10">
                                            <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-full text-center">
                                                <span className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#111110] font-black">Observe Masterpiece</span>
                                            </div>
                                        </div>
                                    </Link>

                                    <div className="p-10 flex flex-col flex-1 text-center justify-center items-center gap-4">
                                        <span className="text-[8px] uppercase tracking-[0.4em] font-black opacity-40">{p.category}</span>
                                        <Link to={`/product/${p._id}`}>
                                            <h3 className="font-premium text-2xl italic text-[#111110] group-hover:text-primary transition-colors duration-500 line-clamp-1">{p.name}</h3>
                                        </Link>
                                        <span className="font-sans font-black text-xs text-[#111110] italic">{formatPrice(p.price)}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 px-8 border border-dashed border-[#111110]/10 rounded-3xl">
                            <p className="font-premium text-2xl italic opacity-30 italic">No similar pieces found in this niche of the archive.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}

export default ProductDetail
