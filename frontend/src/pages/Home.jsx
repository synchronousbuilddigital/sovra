import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import EditorialHero from '../components/EditorialHero'
import { useShop } from '../context/ShopContext'
import { Heart, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatPrice } from '../utils/currency'
import { getOptimizedImage } from '../utils/imageUtils'
import api from '../utils/api'
import { Helmet } from 'react-helmet-async'
import Skeleton from '../components/Skeleton'
import CustomerStories from '../components/CustomerStories'
import TrendingReels from '../components/TrendingReels'

const NewsletterForm = () => {
    // ... existing code ...
    const [email, setEmail] = React.useState('')
    const [status, setStatus] = React.useState('idle') // idle, submitting, success

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email) return
        setStatus('submitting')

        try {
            await api.post('/newsletter/subscribe', { email })
            setStatus('success')
        } catch (error) {
            console.error('Newsletter Error:', error)
            setStatus('idle')
            alert('Failed to join the Inner Circle. Please try again later.')
        }
    }

    if (status === 'success') {
        return (
            <m.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
            >
                <span className="font-headline text-3xl italic text-primary block mb-4">Welcome to the Circle.</span>
                <p className="font-label text-[10px] kerning-widest uppercase opacity-60 italic">A confirmation has been sent to {email}</p>
            </m.div>
        )
    }

    return (
        <form className="flex flex-col gap-5 md:gap-10 w-full" onSubmit={handleSubmit}>
            <div className="relative group max-w-md mx-auto w-full px-2 sm:px-0">
                <input
                    className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-3 md:py-6 text-[10px] md:text-[11px] font-label kerning-widest focus:ring-0 focus:border-primary transition-all placeholder:text-outline/40 uppercase text-center hover:placeholder:text-primary/60 outline-none"
                    placeholder="YOUR EMAIL ADDRESS"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-primary scale-x-0 group-hover:scale-x-100 group-focus-within:scale-x-100 transition-transform duration-700 origin-center"></div>
            </div>
            <div className="flex justify-center">
                <button
                    disabled={status === 'submitting'}
                    className="font-label text-[10px] md:text-[11px] kerning-widest uppercase text-primary border border-primary/30 px-6 sm:px-16 md:px-24 py-2.5 sm:py-3.5 md:py-6 hover:bg-primary hover:text-on-primary transition-all duration-500 md:duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] shadow-sm hover:shadow-xl disabled:opacity-50 tracking-[0.2em]"
                >
                    {status === 'submitting' ? 'Processing...' : 'Request Access'}
                </button>
            </div>
        </form>
    )
}

const Home = () => {
    const { addToWishlist, removeFromWishlist, wishlist } = useShop()
    const isWishlisted = (id) => wishlist.some(item => item._id === id || item === id)

    const toggleWishlist = (e, id) => {
        e.preventDefault()
        e.stopPropagation()
        if (isWishlisted(id)) {
            removeFromWishlist(id)
        } else {
            addToWishlist(id)
        }
    }

    const carouselRef = useRef(null)
    const [shopProducts, setShopProducts] = useState(() => {
        try {
            const cached = sessionStorage.getItem('sovra_home_products')
            if (cached) {
                const parsed = JSON.parse(cached)
                if (Array.isArray(parsed) && parsed.length > 0) return parsed
            }
        } catch {
            // ignore
        }
        return []
    })
    const [loadingProducts, setLoadingProducts] = useState(() => {
        try {
            const cached = sessionStorage.getItem('sovra_home_products')
            if (cached) {
                const parsed = JSON.parse(cached)
                if (Array.isArray(parsed) && parsed.length > 0) return false
            }
        } catch {
            // ignore
        }
        return true
    })

    const scrollCarousel = (direction) => {
        if (carouselRef.current) {
            const scrollAmount = direction === 'left' ? -280 : 280
            carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        }
    }

    useEffect(() => {
        let isMounted = true
        const fetchShopProducts = async () => {
            try {
                const { data } = await api.get('/products/home')
                const list = Array.isArray(data) ? data : (data.products || [])
                if (isMounted && list && list.length > 0) {
                    setShopProducts(list.slice(0, 8))
                    try {
                        sessionStorage.setItem('sovra_home_products', JSON.stringify(list.slice(0, 8)))
                    } catch {
                        // ignore quota
                    }
                }
            } catch (err) {
                console.error('Failed to load shop products:', err)
            } finally {
                if (isMounted) setLoadingProducts(false)
            }
        }
        fetchShopProducts()
        return () => { isMounted = false }
    }, [])
    useEffect(() => {
        const observerOptions = { threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const DEFAULT_CATEGORIES_LIST = [
        {
            id: 'rings',
            name: 'Rings',
            tagline: 'Collection Alpha',
            count: '12 Pieces',
            link: '/shop/rings',
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAkXJLhnNmK6xvBpC0QYgMtgFm4EjXPbd1mChYNGxRizSftvUBqJpKAY_ZDce4SNeaccK64kFO5_5Yv_nbMHt52UZRQ1oRTgfv1My8JfbfFCwc6WxDGYLK-7gfr89S19Du1aYqUAsw0g5QaPy2AjEHLkuoglqa6550Cb6iw1G6VFS_a6GiN5lpBApPlJ1aVRiyuin5AtoszSKQ7gTXXMf_fzoAxHctQnZcxr13MiwUAjTFt7h-_H1nsd9cu3yf6_4Adm9Fnx7VIwHhb"
        },
        {
            id: 'earrings',
            name: 'Earrings',
            tagline: 'Signature Ornaments',
            count: '08 Pieces',
            link: '/shop/earrings',
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBe1TJaSxbCjPeBOwrYEK4VNhCj-0xVe78ZJaC6QgYI1qtnh7AF-fmFo-fXuETFNZ8pUM9n_qWsO3AfMtvCn5uHlMypBEi0GIlopHr49Lbm7R7-2ucWwE0tXurU45Z1x2xiTWYIOA4JaFRxrx5DXIgdEnPkvmGsduNUPoS-gzKudmNiD0SGQGWYcmUzYT949bg4vDSrdZUPTkL2eyYWliaU7pQR5wVb0DOIjGHdSEy1KClZcrKhBHZ__FJc0xszjO4TqTLJxp0L86VE"
        },
        {
            id: 'necklaces',
            name: 'Necklaces',
            tagline: 'Luminous Chains',
            count: '15 Pieces',
            link: '/shop/necklaces',
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBv9_mVnLSdhf6SKw5pIeTcYIvJXoOVoSa3qX3Fbfwt7dcHmW79gcV-3lACiTAMsFuMPhTLN7iT1UvcGV6unWAXJzBmsLWHtD0xKd2wi8WUHB4rhedHLKd4EbgqUxag1Kj2te7n9rgHRaSOdu7zeQfwnR4vYLs8bGvJ1xaqDiVyO5oX7GCdOY8QAxZpNJeskhYjfpiBwwlQLeDQatcAatJ8eT85s48qrZI2QAvi1qLGZx3XDXh2gor68pmQ7382lMBdZA7OT3SGPKm0"
        },
        {
            id: 'bracelets',
            name: 'Bracelets',
            tagline: 'Architectural Cuffs',
            count: '10 Pieces',
            link: '/shop/bracelets',
            image: "/bracelet_hero.png"
        }
    ]

    const [categoriesList, setCategoriesList] = useState(DEFAULT_CATEGORIES_LIST)

    useEffect(() => {
        let isMounted = true
        const fetchHomeCategories = async () => {
            try {
                const { data } = await api.get('/categories/home')
                if (data && data.length > 0 && isMounted) {
                    const formatted = data.map((cat, idx) => ({
                        id: cat._id || cat.slug || idx,
                        name: cat.name,
                        tagline: cat.tagline || cat.subtitle || 'Signature Collection',
                        count: cat.count || 'Fine Jewelry',
                        link: `/shop/${cat.slug || cat.name.toLowerCase()}`,
                        image: cat.homeImage || DEFAULT_CATEGORIES_LIST[idx % 4]?.image
                    }))
                    setCategoriesList(formatted)
                }
            } catch (err) {
                // Silently maintain DEFAULT_CATEGORIES_LIST
            }
        }
        fetchHomeCategories()
        return () => { isMounted = false }
    }, [])



    return (
        <div className="bg-surface selection:bg-primary/10 font-body">
            <Helmet>
                <title>SOVRA | Fine Jewellery Archive & Ethereal Vision</title>
                <meta name="description" content="Discover SOVRA, where ancestral craftsmanship meets ethereal vision. Explore our curated archive of fine jewellery born from the golden silence of the Aravalli hills." />
                <meta property="og:title" content="SOVRA | Fine Jewellery Archive" />
                <meta property="og:description" content="Ancestral craftsmanship meets ethereal vision. Explore the SOVRA archive." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://sovra-topaz.vercel.app/" />
            </Helmet>
            <EditorialHero />

            {/* Spotlight Collection Banner & Carousel */}
            <section className="py-4 md:py-12 px-3 sm:px-6 md:px-12 lg:px-16">
                <div className="max-w-[1720px] mx-auto rounded-2xl md:rounded-3xl overflow-hidden border border-[#111110]/10 shadow-[0_12px_40px_rgba(0,0,0,0.04)] flex flex-col lg:flex-row bg-[#fbf9f5]">

                    {/* Left: Editorial Promo Banner with earring_hero.png */}
                    <div className="relative w-full lg:w-[42%] h-[210px] sm:h-[280px] lg:h-auto lg:min-h-[440px] overflow-hidden flex flex-col justify-end p-4 sm:p-7 md:p-12 group bg-[#f5f1e8]">
                        {/* Crisp Background Photo: /earring_hero.png */}
                        <img
                            src="/earring_hero.png"
                            alt="Earring Collection"
                            className="absolute inset-0 w-full h-full object-cover object-[center_25%] transition-transform duration-700 ease-out group-hover:scale-105"
                        />

                        {/* Clean SHOP NOW Link */}
                        <div className="relative z-10">
                            <Link
                                to="/shop"
                                className="inline-flex items-center gap-2 font-sans text-[11px] md:text-[12px] tracking-[0.2em] uppercase text-[#26201a] font-bold border-b-2 border-[#26201a]/60 pb-1 hover:border-[#26201a] hover:gap-3 transition-all duration-300 drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]"
                            >
                                <span>SHOP NOW</span>
                                <span className="text-[10px]">&#9658;</span>
                            </Link>
                        </div>
                    </div>

                    {/* Right: Live Shop Products Carousel */}
                    <div className="w-full lg:w-[58%] p-3.5 sm:p-6 md:p-8 flex flex-col justify-between bg-[#f8f5ee] border-t lg:border-t-0 lg:border-l border-[#111110]/8">

                        {/* Products Horizontal Slider (Shop Page Products Only) */}
                        <div
                            ref={carouselRef}
                            className="flex gap-2.5 sm:gap-4 overflow-x-auto scroll-smooth py-0.5 px-0.5"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {loadingProducts && shopProducts.length === 0 ? (
                                [1, 2, 3, 4].map((i) => (
                                    <div
                                        key={`carousel-skel-${i}`}
                                        className="shrink-0 w-[145px] sm:w-[185px] md:w-[210px] bg-white rounded-xl p-2.5 sm:p-3.5 flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-[#111110]/8 animate-pulse"
                                    >
                                        <div className="w-full aspect-square rounded-lg bg-[#faf8f4] p-1 sm:p-1.5 flex items-center justify-center mb-2 sm:mb-3">
                                            <Skeleton height="100%" className="w-full h-full rounded-md" />
                                        </div>
                                        <div className="space-y-1.5 sm:space-y-2">
                                            <Skeleton width="60%" height="14px" />
                                            <Skeleton width="85%" height="11px" />
                                            <Skeleton width="45%" height="9px" />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                shopProducts.map((product) => (
                                    <Link
                                        key={product._id || product.id}
                                        to={`/product/${product._id || product.id}`}
                                        className="group/card shrink-0 w-[145px] sm:w-[185px] md:w-[210px] bg-white rounded-xl p-2.5 sm:p-3.5 flex flex-col justify-between shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[#111110]/8 hover:border-[#111110]/25"
                                    >
                                        {/* Product Image from Shop Page */}
                                        <div className="w-full aspect-square rounded-lg bg-[#faf8f4] p-1 sm:p-1.5 flex items-center justify-center overflow-hidden mb-2 sm:mb-2.5">
                                            <img
                                                src={getOptimizedImage(product.img || product.image || (product.images && product.images[0]), 360)}
                                                alt={product.name}
                                                loading="lazy"
                                                className="w-full h-full object-cover rounded-md transition-transform duration-500 ease-out group-hover/card:scale-105"
                                            />
                                        </div>

                                        {/* Real Price and Details from Shop Page */}
                                        <div className="space-y-0.5 sm:space-y-1">
                                            <div className="flex items-baseline gap-1.5 flex-wrap">
                                                <span className="font-label text-xs sm:text-base font-bold text-primary">
                                                    {formatPrice(product.price)}
                                                </span>
                                                {Number(product.mrp) > Number(product.price) ? (
                                                    <span className="text-[10px] sm:text-xs font-mono text-secondary/50 line-through">
                                                        {formatPrice(product.mrp)}
                                                    </span>
                                                ) : null}
                                            </div>
                                            <h4 className="text-[11px] sm:text-xs font-medium text-primary/90 truncate group-hover/card:text-primary transition-colors">
                                                {product.name}
                                            </h4>
                                            <p className="text-[9px] sm:text-[10px] text-secondary/60 truncate capitalize">
                                                {product.category || 'Fine Jewellery'} • {product.stone || product.material || '18K Gold'}
                                            </p>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>

                        {/* Bottom Controls Row: Minimalist Luxury Arrows + Shop Now Button */}
                        <div className="flex items-center justify-between pt-2.5 sm:pt-4 mt-2 sm:mt-3 border-t border-[#111110]/8">
                            {/* Navigation Arrows */}
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <button
                                    onClick={() => scrollCarousel('left')}
                                    aria-label="Scroll left"
                                    className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#111110] hover:bg-black text-[#f5f0e8] flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-105"
                                >
                                    <ChevronLeft size={14} />
                                </button>
                                <button
                                    onClick={() => scrollCarousel('right')}
                                    aria-label="Scroll right"
                                    className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#111110] hover:bg-black text-[#f5f0e8] flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-105"
                                >
                                    <ChevronRight size={14} />
                                </button>
                            </div>

                            {/* Shop Now Primary Button */}
                            <Link
                                to="/shop"
                                className="px-4 sm:px-6 py-1.5 sm:py-2.5 bg-[#111110] hover:bg-black text-[#f5f0e8] rounded-md font-sans text-[10px] sm:text-[11px] tracking-wider sm:tracking-widest uppercase font-semibold transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02]"
                            >
                                Shop Now
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="pt-5 pb-2 md:py-16 px-3.5 sm:px-6 md:px-12 lg:px-16">
                <div className="max-w-[1720px] mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2 md:gap-4 mb-6 md:mb-10">
                        <div>
                            <span className="font-label text-[9px] md:text-[11px] kerning-widest uppercase text-secondary tracking-[0.25em] block mb-1 md:mb-2 opacity-70">
                                Curated Silhouettes
                            </span>
                            <h2 className="font-headline text-2xl sm:text-4xl md:text-5xl font-light text-primary tracking-tight">
                                Categories
                            </h2>
                        </div>
                        <Link
                            to="/shop"
                            className="group inline-flex items-center gap-1.5 md:gap-2 font-label text-[9px] md:text-[11px] kerning-widest uppercase text-primary border-b border-primary/20 pb-0.5 md:pb-1 hover:border-primary transition-all duration-300"
                        >
                            <span>Explore All Masterpieces</span>
                            <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 opacity-60 group-hover:opacity-100" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                        {categoriesList.map((cat, index) => (
                            <Motion.div
                                key={cat.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group flex flex-col"
                            >
                                <Link
                                    to={cat.link}
                                    className="relative block overflow-hidden rounded-md md:rounded-sm bg-surface-container aspect-[3/4] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-700"
                                >
                                    <img
                                        alt={cat.name}
                                        loading="lazy"
                                        src={getOptimizedImage(cat.image)}
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                                        <span className="font-label text-[9px] uppercase tracking-widest font-medium">Discover</span>
                                        <ArrowUpRight size={14} />
                                    </div>
                                </Link>

                                <div className="pt-2.5 md:pt-3.5 space-y-1.5 md:space-y-2">
                                    <div className="flex justify-between items-baseline px-0.5">
                                        <Link to={cat.link} className="font-headline text-base sm:text-lg md:text-xl italic text-primary group-hover:text-primary/75 transition-colors truncate">
                                            {cat.name}
                                        </Link>
                                        {/* Number of pieces: hidden on phone view, visible on desktop */}
                                        <span className="hidden md:inline font-label text-[9px] md:text-[10px] kerning-widest uppercase text-secondary/60 shrink-0">
                                            {cat.count}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-primary/10 pt-1.5 md:pt-2 px-0.5 gap-2">
                                        <span className="font-label text-[8px] md:text-[9px] kerning-widest uppercase text-secondary font-medium tracking-wider truncate">
                                            {cat.tagline}
                                        </span>
                                        <Link to={cat.link} className="font-label text-[8px] md:text-[9px] kerning-widest uppercase text-primary/70 hover:text-primary flex items-center gap-1 group/btn shrink-0">
                                            <span>View</span>
                                            <span className="transition-transform duration-300 group-hover/btn:translate-x-0.5">&rarr;</span>
                                        </Link>
                                    </div>
                                </div>
                            </Motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Shop Showcase Section: 3 rows x 4 columns (12 products from Shop) */}
            <section className="pt-1 sm:pt-2 pb-8 md:py-20 bg-surface-container-low/30 overflow-hidden">
                <div className="max-w-[1720px] mx-auto px-3 sm:px-6 md:px-12 lg:px-16">
                    <div className="text-center mb-4 md:mb-14 scroll-reveal">
                        <h2 className="font-headline text-2xl sm:text-4xl md:text-5xl font-light italic text-primary tracking-tight">
                            Shop the Collection
                        </h2>
                        <p className="font-body text-[11px] sm:text-xs md:text-sm text-secondary/70 mt-1 md:mt-2 max-w-lg mx-auto italic px-2">
                            Handcrafted pieces born from fine precious metals and natural gemstones.
                        </p>
                    </div>

                    {/* 2 rows x 4 columns = 8 items */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 lg:gap-8">
                        {loadingProducts && shopProducts.length === 0 ? (
                            [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                <div
                                    key={`grid-skel-${i}`}
                                    className="flex flex-col bg-white rounded-xl overflow-hidden border border-[#111110]/8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] animate-pulse"
                                >
                                    <div className="relative aspect-[4/5] bg-[#faf8f4]">
                                        <Skeleton height="100%" className="w-full h-full" />
                                    </div>
                                    <div className="p-3 sm:p-3.5 md:p-4 space-y-2">
                                        <div className="h-9 md:h-auto flex items-start">
                                            <Skeleton width="85%" height="16px" />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <Skeleton width="45%" height="14px" />
                                            <Skeleton width="30%" height="10px" />
                                        </div>
                                        <div className="border-t border-[#111110]/8 pt-2 flex justify-between items-center mt-auto">
                                            <Skeleton width="50%" height="10px" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            shopProducts.slice(0, 8).map((product, index) => (
                                <Motion.div
                                    key={product._id || product.id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
                                    className="group flex flex-col bg-white rounded-xl overflow-hidden border border-[#111110]/8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-500"
                                >
                                    <div className="relative aspect-[4/5] overflow-hidden bg-[#faf8f4]">
                                        <Link to={`/product/${product._id || product.id}`} className="block w-full h-full">
                                            <img
                                                alt={product.name}
                                                loading="lazy"
                                                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                                src={getOptimizedImage(product.img || product.image || (product.images && product.images[0]), 500)}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                        </Link>

                                        {/* Wishlist Button */}
                                        <button
                                            onClick={(e) => toggleWishlist(e, product._id || product.id)}
                                            aria-label="Save to wishlist"
                                            className="absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2.5 bg-white/80 hover:bg-white backdrop-blur-md border border-white/40 rounded-full shadow-sm z-20 transition-all hover:scale-110"
                                        >
                                            <Heart
                                                size={13}
                                                className={`${isWishlisted(product._id || product.id) ? 'fill-red-500 text-red-500' : 'text-primary/70'} sm:w-3.5 sm:h-3.5`}
                                                strokeWidth={2}
                                            />
                                        </button>

                                        {/* Subtle Hover Action Bar */}
                                        <Link
                                            to={`/product/${product._id || product.id}`}
                                            className="absolute bottom-3 left-3 right-3 py-2.5 bg-[#111110]/95 hover:bg-[#111110] text-[#f5f0e8] font-sans text-[9px] tracking-[0.25em] uppercase text-center font-medium shadow-md opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                                        >
                                            View Details
                                        </Link>
                                    </div>

                                    <div className="p-2.5 sm:p-3.5 md:p-4 flex flex-col justify-between flex-1 space-y-1.5 sm:space-y-2">
                                        <div className="space-y-1">
                                            {/* Uniform height title container to ensure perfect horizontal alignment */}
                                            <div className="h-9 md:h-auto flex items-start">
                                                <Link 
                                                    to={`/product/${product._id || product.id}`} 
                                                    className="font-sans text-xs sm:text-sm md:text-base font-medium text-[#111110] group-hover:text-primary transition-colors line-clamp-2 leading-snug block"
                                                    title={product.name}
                                                >
                                                    {product.name}
                                                </Link>
                                            </div>

                                            {/* Price & MRP */}
                                            <div className="pt-0.5 flex items-baseline gap-2">
                                                <span className="font-sans text-xs sm:text-sm font-semibold text-[#111110]">
                                                    {formatPrice(product.price)}
                                                </span>
                                                {Number(product.mrp) > Number(product.price) ? (
                                                    <span className="font-sans text-[10px] sm:text-xs text-stone-400 line-through">
                                                        {formatPrice(product.mrp)}
                                                    </span>
                                                ) : null}
                                            </div>

                                            {/* Category & Material: clean unified line without collisions */}
                                            <div className="text-[9px] md:text-[10px] text-secondary/65 capitalize truncate pt-0.5">
                                                <span className="font-sans uppercase tracking-wider font-medium text-[8.5px] md:text-[9.5px]">
                                                    {product.category || 'Jewellery'}
                                                </span>
                                                <span className="mx-1 opacity-40">•</span>
                                                <span className="font-body italic text-[9px] md:text-[10px]">
                                                    {product.stone || product.plating || product.material || '18K Gold'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Footer Link: Pinned to bottom with mt-auto */}
                                        <div className="border-t border-[#111110]/8 pt-2 md:pt-2.5 flex justify-between items-center mt-auto">
                                            <Link to={`/product/${product._id || product.id}`} className="font-sans text-[8.5px] md:text-[9px] tracking-widest uppercase text-primary/70 hover:text-primary flex items-center gap-1 group/link">
                                                <span>Explore Piece</span>
                                                <span className="transition-transform duration-300 group-hover/link:translate-x-0.5">&rarr;</span>
                                            </Link>
                                            <span className="hidden sm:inline font-sans text-[8px] uppercase tracking-wider text-primary/40">Maison Archive</span>
                                        </div>
                                    </div>
                                </Motion.div>
                            )))}
                    </div>

                    {/* Explore More Products CTA Button */}
                    <div className="flex justify-center mt-6 md:mt-16">
                        <Link
                            to="/shop"
                            className="group inline-flex items-center gap-2.5 sm:gap-3 px-6 sm:px-12 py-3 sm:py-4 bg-[#111110] text-[#f5f0e8] hover:bg-black font-sans text-[11px] sm:text-xs tracking-[0.25em] uppercase font-medium rounded-md transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5"
                        >
                            <span>Explore More Products</span>
                            <ArrowUpRight size={13} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Trending Styles Reels Coverflow Section */}
            <TrendingReels shopProducts={shopProducts} />

            {/* Customer Review Stories Section */}
            <CustomerStories shopProducts={shopProducts} />

            {/* Newsletter Subscription */}
            <section className="py-8 sm:py-12 md:py-24 relative group overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#f8dec1_0%,transparent_70%)] opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
                <div className="max-w-[800px] mx-auto text-center px-4 sm:px-6 md:px-8 relative z-10 scroll-reveal">
                    <h2 className="font-headline text-2xl sm:text-4xl md:text-5xl mb-2 sm:mb-4 md:mb-8 font-light italic text-primary">The Inner Circle</h2>
                    <p className="font-body text-secondary-dim text-[8.5px] sm:text-[9.5px] md:text-[11px] kerning-widest uppercase mb-5 md:mb-12 opacity-80 leading-relaxed md:leading-loose max-w-md md:max-w-none mx-auto">
                        A sanctuary for connoisseurs. Be the first to witness new collections <br className="hidden md:block" />and read our seasonal SOVRA journal.
                    </p>

                    <div className="min-h-0 md:min-h-[200px] flex items-center justify-center">
                        <NewsletterForm />
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home
