import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { useShop } from '../context/ShopContext'
import { Search, Filter, X, ChevronDown, ArrowRight, Sparkles, Heart } from 'lucide-react'
import api from '../utils/api'
import { formatPrice } from '../utils/currency'
import { getOptimizedImage } from '../utils/imageUtils'
import Skeleton from '../components/Skeleton'


const Shop = () => {
    const { category } = useParams()
    const [searchParams] = useSearchParams()
    const { addToWishlist, removeFromWishlist, wishlist } = useShop();
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const keyword = searchParams.get('keyword') || ''

    // Filter & Sort States
    const [activeSort, setActiveSort] = useState('shuffle')
    const [activePrice, setActivePrice] = useState('all')
    const [isFilterOpen, setIsFilterOpen] = useState(false)
    const [isSortOpen, setIsSortOpen] = useState(false)

    const activeFilter = category || 'all'

    // Click Away Listener
    useEffect(() => {
        const handleClickAway = (e) => {
            if (!e.target.closest('.dropdown-container')) {
                setIsFilterOpen(false)
                setIsSortOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickAway)
        return () => document.removeEventListener('mousedown', handleClickAway)
    }, [])

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true)
                let minPrice = '', maxPrice = ''
                if (activePrice === 'low') { maxPrice = 1000 }
                else if (activePrice === 'mid') { minPrice = 1000; maxPrice = 2000 }
                else if (activePrice === 'high') { minPrice = 2000 }

                // Fetch all products without pagination for this category
                const { data } = await api.get(`/products?pageSize=all&category=${activeFilter === 'all' ? '' : activeFilter}&sort=${activeSort}&minPrice=${minPrice}&maxPrice=${maxPrice}&keyword=${keyword}`)

                const productsArray = Array.isArray(data) ? data : (data.products || [])
                setProducts(productsArray)
            } catch (error) {
                console.error('Fetch failed:', error)
                setProducts([])
            } finally {
                setLoading(false)
            }
        }
        fetchProducts()
    }, [activeFilter, activeSort, activePrice, keyword])

    const isWishlisted = (id) => wishlist.some(item => item._id === id || item === id);

    const toggleWishlist = (e, id) => {
        e.preventDefault();
        e.stopPropagation();
        if (isWishlisted(id)) {
            removeFromWishlist(id);
        } else {
            addToWishlist(id);
        }
    }

    const categories = [
        { id: 'all', name: 'ALL', subtitle: 'Our Complete Curation' },
        { id: 'necklaces', name: 'Necklaces', subtitle: 'Celestial Silhouettes' },
        { id: 'bracelets', name: 'Bracelets', subtitle: 'Fluid Movements' },
        { id: 'rings', name: 'Rings', subtitle: 'Eternal Sigils' },
        { id: 'earrings', name: 'Earrings', subtitle: 'Luminous Accents' }
    ]

    const sortOptions = [
        { id: 'shuffle', name: 'Shuffle Selection' },
        { id: 'newest', name: 'Newest Arrivals' },
        { id: 'price-low', name: 'Price: Low to High' },
        { id: 'price-high', name: 'Price: High to Low' },
        { id: 'alphabetical', name: 'Alphabetical' }
    ]

    const activeCategoryInfo = categories.find(c => c.id === activeFilter) || categories[0]

    return (
        <div className="pt-16 sm:pt-20 md:pt-32 bg-[#fffcf7] min-h-screen selection:bg-primary/10 relative">
            <Helmet>
                <title>{activeCategoryInfo.id === 'all' ? 'All Pieces | SOVRA' : `${activeCategoryInfo.name} | SOVRA`}</title>
                <meta name="description" content={`Explore our curated collection of ${activeCategoryInfo.name.toLowerCase()}. ${activeCategoryInfo.subtitle}. Meticulously crafted fine jewellery from Maison SOVRA.`} />
                <meta property="og:title" content={`${activeCategoryInfo.name} | SOVRA`} />
                <meta property="og:description" content={activeCategoryInfo.subtitle} />
                <meta property="og:url" content={`https://sovra-topaz.vercel.app/shop${category ? '/' + category : ''}`} />
            </Helmet>

            <main className="max-w-[1920px] mx-auto px-3 sm:px-6 md:px-12 lg:px-20">

                {/* Search indicator if searching */}
                {keyword && (
                    <div className="pt-2 pb-1 md:pt-4 md:pb-2 text-center">
                        <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#7a7670] block mb-1">Search Results</span>
                        <h2 className="font-headline text-2xl md:text-3xl italic text-[#111110]">"{keyword}"</h2>
                    </div>
                )}

                {/* Refined Navigation & Filter Bar */}
                <div 
                    onMouseDown={(e) => { if (e.button === 1) e.preventDefault(); }}
                    className="sticky top-[54px] sm:top-[60px] md:top-[112px] z-40 bg-[#fffcf7]/95 backdrop-blur-xl border-b border-[#111110]/8 -mx-3 px-3 sm:-mx-6 sm:px-6 md:-mx-12 md:px-12 lg:-mx-20 lg:px-20 mb-3 sm:mb-5 md:mb-8 transition-all duration-300"
                >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center py-2 sm:py-2.5 md:py-4 gap-2.5 sm:gap-3.5 md:gap-6">
                        <div 
                            className="flex items-center gap-4 sm:gap-6 lg:gap-10 overflow-x-auto overflow-y-hidden no-scrollbar w-full md:w-auto py-0.5 sm:py-1"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {categories.map((cat) => (
                                <Link
                                    key={cat.id}
                                    to={cat.id === 'all' ? '/shop' : `/shop/${cat.id}`}
                                    className={`font-sans text-[9px] md:text-[10px] tracking-[0.25em] sm:tracking-[0.3em] uppercase transition-all duration-300 relative group font-black whitespace-nowrap py-1 sm:py-1.5 ${activeFilter === cat.id ? 'text-[#111110]' : 'text-[#7a7670]/40 hover:text-[#111110]'
                                        }`}
                                >
                                    {cat.name}
                                    {activeFilter === cat.id && (
                                        <Motion.div
                                            layoutId="shopFilterLinePremium"
                                            className="absolute bottom-0 left-0 w-full h-[2px] bg-primary"
                                        />
                                    )}
                                </Link>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 md:gap-8 w-full lg:w-auto justify-between lg:justify-end">
                            <div className="flex items-center gap-4 md:gap-8">
                                <div className="hidden lg:flex items-center gap-4">
                                    <span className="font-sans text-[8px] md:text-[9px] tracking-[0.25em] uppercase text-[#7a7670] font-black">{activeCategoryInfo.id === 'all' ? 'All Pieces' : activeCategoryInfo.name} ({products.length})</span>
                                </div>
                                <div className="h-4 w-[1px] bg-[#111110]/10 hidden lg:block" />

                                <div className="flex items-center gap-4 sm:gap-6 relative">
                                    {/* Filter Button with Dropdown logic */}
                                    <div className="relative dropdown-container">
                                        <button
                                            onClick={() => { setIsFilterOpen(!isFilterOpen); setIsSortOpen(false); }}
                                            className={`flex items-center gap-2 font-sans text-[9px] md:text-[10px] tracking-[0.3em] uppercase font-black group transition-colors px-4 py-1.5 border rounded-full transition-all duration-300 ${isFilterOpen ? 'border-primary text-primary bg-primary/5' : 'border-black/10 text-[#111110] hover:border-black/30'}`}
                                        >
                                            <Filter size={13} strokeWidth={1.5} />
                                            Refine
                                        </button>

                                        <AnimatePresence>
                                            {isFilterOpen && (
                                                <Motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                                    className="absolute top-full left-0 md:left-auto md:right-0 mt-4 w-[calc(100vw-3rem)] sm:w-[420px] bg-white shadow-lux border border-black/5 p-6 md:p-8 z-50 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
                                                >
                                                    <div className="space-y-3 md:space-y-4">
                                                        <p className="text-[9px] uppercase tracking-widest font-black opacity-30 italic mb-2">By Category</p>
                                                        {categories.map(cat => (
                                                            <Link
                                                                key={cat.id}
                                                                to={cat.id === 'all' ? '/shop' : `/shop/${cat.id}`}
                                                                onClick={() => setIsFilterOpen(false)}
                                                                className={`block font-headline text-xl italic hover:text-primary transition-all ${activeFilter === cat.id ? 'text-primary' : 'text-gray-400'}`}
                                                            >
                                                                {cat.name}
                                                            </Link>
                                                        ))}
                                                    </div>

                                                    <div className="space-y-3 md:space-y-4">
                                                        <p className="text-[9px] uppercase tracking-widest font-black opacity-30 italic mb-2">Price Range</p>
                                                        <div className="space-y-2 md:space-y-3">
                                                            {[
                                                                { id: 'all', name: 'Original State' },
                                                                { id: 'low', name: 'Under ₹1000' },
                                                                { id: 'mid', name: '₹1000 - ₹2000' },
                                                                { id: 'high', name: 'Over ₹2000' }
                                                            ].map(tier => (
                                                                <button
                                                                    key={tier.id}
                                                                    className={`block font-headline text-xl italic hover:text-primary transition-all text-left ${activePrice === tier.id ? 'text-primary' : 'text-gray-400'}`}
                                                                    onClick={() => { setActivePrice(tier.id); setIsFilterOpen(false); }}
                                                                >
                                                                    {tier.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </Motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Sort Button with Dropdown */}
                                    <div className="relative dropdown-container">
                                        <button
                                            onClick={() => { setIsSortOpen(!isSortOpen); setIsFilterOpen(false); }}
                                            className={`flex items-center gap-2 font-sans text-[9px] md:text-[10px] tracking-[0.3em] uppercase font-black group transition-colors px-4 py-1.5 border rounded-full transition-all duration-300 ${isSortOpen ? 'border-primary text-primary bg-primary/5' : 'border-black/10 text-[#111110] hover:border-black/30'}`}
                                        >
                                            Sort
                                            <ChevronDown size={13} strokeWidth={1.5} className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180 text-primary' : ''}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isSortOpen && (
                                                <Motion.div
                                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 10, scale: 0.98 }}
                                                    className="absolute top-full right-0 mt-4 w-[calc(100vw-3rem)] sm:w-60 bg-white shadow-lux border border-black/5 p-5 md:p-6 z-50 rounded-2xl"
                                                >
                                                    <p className="text-[9px] uppercase tracking-widest font-black opacity-30 italic mb-3">Arrange the Vault</p>
                                                    <div className="space-y-3">
                                                        {sortOptions.map(opt => (
                                                            <button
                                                                key={opt.id}
                                                                onClick={() => { setActiveSort(opt.id); setIsSortOpen(false); }}
                                                                className={`block w-full text-left font-headline text-lg italic hover:text-primary transition-all ${activeSort === opt.id ? 'text-primary' : 'text-gray-400'}`}
                                                            >
                                                                {opt.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </Motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Catalog Grid */}
                <div className="relative pb-10 sm:pb-16 md:pb-32">
                    {loading ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-4 sm:gap-y-6 md:gap-y-10 lg:gap-y-12 gap-x-2.5 sm:gap-x-4 md:gap-x-6 lg:gap-x-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div key={i} className="space-y-2 sm:space-y-3 text-center flex flex-col items-center">
                                    <Skeleton height="auto" className="aspect-[4/5] w-full rounded-sm" />
                                    <div className="space-y-1.5 sm:space-y-2 px-2 sm:px-4 w-full flex flex-col items-center">
                                        <Skeleton width="40%" height="8px" />
                                        <Skeleton width="80%" height="16px" />
                                        <Skeleton width="30%" height="14px" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-4 sm:gap-y-6 md:gap-y-10 lg:gap-y-12 gap-x-2.5 sm:gap-x-4 md:gap-x-6 lg:gap-x-8">
                                <AnimatePresence mode="popLayout">
                                    {products.map((product, idx) => (
                                        <Motion.div
                                            key={product._id}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true, margin: "-30px" }}
                                            transition={{ duration: 0.8, delay: (idx % 4) * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                            className="group"
                                        >
                                            <Link to={`/product/${product._id}`} className="block text-center px-0.5 sm:px-2">
                                                {/* Architectural Frame with Hover Interaction */}
                                                <div className="relative aspect-[4/5] overflow-hidden bg-white mb-2 sm:mb-4 shadow-sm transition-all duration-700 group-hover:shadow-lux group-hover:-translate-y-1 rounded-sm border border-[#111110]/5 p-0.5">
                                                    <div className="w-full h-full rounded-[inherit] overflow-hidden relative">
                                                        <img
                                                            alt={product.name}
                                                            className="w-full h-full object-cover transition-all duration-[2s] scale-[1.01] group-hover:scale-105"
                                                            src={getOptimizedImage(product.img || product.image, 600)}
                                                        />

                                                        {/* Glass Overlay on Hover */}
                                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                        {/* Floating Action Buttons */}
                                                        <button
                                                            onClick={(e) => toggleWishlist(e, product._id)}
                                                            className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 p-2 sm:p-2.5 bg-white/40 hover:bg-white backdrop-blur-md border border-white/20 rounded-full shadow-md z-20 transition-all hover:scale-110"
                                                        >
                                                            <Heart
                                                                size={14}
                                                                className={`${isWishlisted(product._id) ? 'fill-red-500 text-red-500' : 'text-primary/70 group-hover:text-primary'}`}
                                                                strokeWidth={2}
                                                            />
                                                        </button>

                                                        {/* Quick Add / Details Label */}
                                                        <div className="absolute inset-x-0 bottom-0 py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-10">
                                                            <div className="mx-auto w-fit bg-[#111110] text-[#f5f0e8] px-5 py-2 text-[8px] sm:text-[9px] tracking-[0.3em] uppercase font-bold shadow-xl backdrop-blur-md">
                                                                View Piece
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Product Details with Premium Typography */}
                                                <div className="space-y-1 sm:space-y-1.5">
                                                    <span className="font-sans text-[7px] sm:text-[8px] tracking-[0.2em] uppercase text-[#7a7670] block font-medium opacity-70 truncate">
                                                        {product.category || 'Collective'} • {product.weight || '18K Gold'}
                                                    </span>
                                                    <h2 className="font-premium text-sm sm:text-base md:text-lg lg:text-xl text-[#111110] font-light italic leading-tight group-hover:opacity-60 transition-opacity truncate">
                                                        {product.name}
                                                    </h2>

                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="w-3 sm:w-6 h-[1px] bg-[#111110]/10 transition-all group-hover:w-8 duration-500" />
                                                        <span className="font-sans text-xs sm:text-sm font-semibold text-[#111110]">
                                                            {formatPrice(product.price)}
                                                        </span>
                                                        <div className="w-3 sm:w-6 h-[1px] bg-[#111110]/10 transition-all group-hover:w-8 duration-500" />
                                                    </div>

                                                    <div className="pt-0.5 hidden sm:block">
                                                        <span className="font-sans text-[7px] tracking-[0.2em] uppercase text-primary/70 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                                            Available for Acquisition
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </Motion.div>
                                    ))}
                                </AnimatePresence>

                                {products.length === 0 && (
                                    <div className="col-span-full py-20 sm:py-36 md:py-64 text-center flex flex-col items-center gap-6 md:gap-10">
                                        <Motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                        >
                                            <Sparkles size={48} strokeWidth={0.5} className="text-primary/20 sm:w-16 sm:h-16" />
                                        </Motion.div>
                                        <p className="font-premium text-3xl sm:text-4xl md:text-5xl italic font-light text-[#111110]/40">The vault is currently silent.</p>
                                        <Link to="/shop" className="font-sans text-[10px] tracking-[0.4em] sm:tracking-[0.6em] uppercase text-primary border-b border-primary/30 pb-2 sm:pb-4 font-black hover:tracking-[0.8em] transition-all">
                                            Return to Source
                                        </Link>
                                    </div>
                                )}
                            </div>

                        </>
                    )}

                    {/* Bottom Status Area */}
                    {!loading && products.length > 0 && (
                        <Motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="mt-8 sm:mt-12 md:mt-28 flex flex-col items-center gap-4 sm:gap-6 text-center"
                        >
                            <div className="w-[1px] h-10 sm:h-20 bg-gradient-to-b from-[#111110]/20 to-transparent" />
                            <p className="font-sans text-[8.5px] sm:text-[10px] tracking-[0.3em] sm:tracking-[0.35em] uppercase text-[#7a7670] font-bold">
                                All {products.length} {activeCategoryInfo.id === 'all' ? 'Creations' : activeCategoryInfo.name} Displayed
                            </p>
                        </Motion.div>
                    )}
                </div>
            </main>

            {/* Architectural Grid Markers (Premium Branding) */}
            <div className="fixed top-0 bottom-0 left-12 w-[1px] bg-[#111110]/5 pointer-events-none hidden 2xl:block" />
            <div className="fixed top-0 bottom-0 right-12 w-[1px] bg-[#111110]/5 pointer-events-none hidden 2xl:block" />

            <div className="fixed top-1/2 left-0 -translate-y-1/2 -rotate-90 origin-left pl-20 pointer-events-none opacity-20 hidden 2xl:block">
                <span className="font-sans text-[8px] tracking-[1em] uppercase font-black">SOVRA LONDON ARCHIVE</span>
            </div>

            {/* Floating Decorative Elements */}
            <div className="absolute top-[20%] left-[5%] opacity-[0.03] pointer-events-none">
                <svg width="400" height="400" viewBox="0 0 400 400" fill="none">
                    <circle cx="200" cy="200" r="199" stroke="#111110" strokeWidth="1" strokeDasharray="10 10" />
                </svg>
            </div>
        </div>
    )
}

export default Shop
