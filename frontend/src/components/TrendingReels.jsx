import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import api from '../utils/api'

const reelsData = [
    {
        id: 'reel-1',
        name: 'Abstract Emerald Drop Earring',
        category: 'Earrings',
        image: '/reels/reel-1.jpg',
        productId: '69d3b01f5ae9ac6e70b3f4b3',
        price: '₹9,500',
    },
    {
        id: 'reel-2',
        name: 'Nova Edge 18K Gold Band',
        category: 'Rings',
        image: '/reels/reel-2.jpg',
        productId: '69d3b01f5ae9ac6e70b3f4a7',
        price: '₹9,500',
    },
    {
        id: 'reel-3',
        name: 'Starlit Solitaire Pearl Chain',
        category: 'Necklaces',
        image: '/reels/reel-3.jpg',
        productId: '69d3b01f5ae9ac6e70b3f493',
        price: '₹18,500',
    },
    {
        id: 'reel-4',
        name: 'Luna Glow Heritage Cuff',
        category: 'Bracelets',
        image: '/reels/reel-4.jpg',
        productId: '69d3b01f5ae9ac6e70b3f49b',
        price: '₹18,500',
    },
    {
        id: 'reel-5',
        name: 'Bloomy Moon Blossom Ring',
        category: 'Rings',
        image: '/reels/reel-5.png',
        productId: '69d3b01f5ae9ac6e70b3f4a9',
        price: '₹8,500',
    },
]

const TrendingReels = ({ shopProducts = [] }) => {
    const [reels, setReels] = useState(reelsData)
    const [activeIndex, setActiveIndex] = useState(0)
    const [isPaused, setIsPaused] = useState(false)

    useEffect(() => {
        let isMounted = true
        const fetchReels = async () => {
            try {
                const { data } = await api.get('/reels?home=true')
                if (isMounted && Array.isArray(data) && data.length > 0) {
                    setReels(data)
                }
            } catch (e) {
                // retain default reelsData
            }
        }
        fetchReels()
        return () => { isMounted = false }
    }, [])

    const totalReels = reels.length || 1

    // Auto-scroll reels every 3.5s, pausing when user hovers or touches
    useEffect(() => {
        if (isPaused || totalReels <= 1) return

        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % totalReels)
        }, 3500)

        return () => clearInterval(timer)
    }, [isPaused, totalReels, activeIndex])

    const handlePrev = () => {
        setActiveIndex((prev) => (prev - 1 + totalReels) % totalReels)
    }

    const handleNext = () => {
        setActiveIndex((prev) => (prev + 1) % totalReels)
    }

    // Match exact product details if live shop products exist
    const getProductLink = (reel) => {
        const liveMatch = shopProducts.find(
            p => (p._id && p._id === reel.productId) ||
                 (p.name && p.name.trim().toLowerCase() === reel.name.trim().toLowerCase())
        )
        return `/product/${liveMatch?._id || liveMatch?.id || reel.productId}`
    }

    // Calculate relative position of each reel relative to active item (-2, -1, 0, 1, 2)
    const getCardProps = (index) => {
        let diff = index - activeIndex
        if (diff < -Math.floor(totalReels / 2)) diff += totalReels
        if (diff > Math.floor(totalReels / 2)) diff -= totalReels

        // Configuration based on relative position
        switch (diff) {
            case 0: // Active center card
                return {
                    x: '0%',
                    scale: 1,
                    zIndex: 30,
                    opacity: 1,
                    isCenter: true,
                    clickable: false,
                }
            case -1: // Immediate left
                return {
                    x: '-70%',
                    scale: 0.88,
                    zIndex: 20,
                    opacity: 0.9,
                    isCenter: false,
                    clickable: true,
                }
            case 1: // Immediate right
                return {
                    x: '70%',
                    scale: 0.88,
                    zIndex: 20,
                    opacity: 0.9,
                    isCenter: false,
                    clickable: true,
                }
            case -2: // Far left
                return {
                    x: '-135%',
                    scale: 0.76,
                    zIndex: 10,
                    opacity: 0.7,
                    isCenter: false,
                    clickable: true,
                }
            case 2: // Far right
                return {
                    x: '135%',
                    scale: 0.76,
                    zIndex: 10,
                    opacity: 0.7,
                    isCenter: false,
                    clickable: true,
                }
            default:
                return {
                    x: '0%',
                    scale: 0.5,
                    zIndex: 0,
                    opacity: 0,
                    isCenter: false,
                    clickable: false,
                }
        }
    }

    return (
        <section id="reels" className="pt-8 pb-3 md:py-20 bg-[#ffffff] overflow-hidden select-none scroll-mt-24">
            <div className="max-w-[1720px] mx-auto px-6 md:px-12 lg:px-16">
                
                {/* Heading: Exactly like reference 'Trending Styles' */}
                <div className="text-center mb-10 md:mb-14">
                    <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-light text-[#111110] tracking-tight mb-2">
                        Trending Styles
                    </h2>
                    <Link
                        to="/reels"
                        className="inline-flex items-center gap-1.5 font-sans text-[10.5px] sm:text-[11px] tracking-[0.2em] uppercase text-[#a88243] hover:text-[#111110] font-semibold border-b border-[#a88243]/30 hover:border-[#111110] pb-0.5 transition-all group"
                    >
                        <span>Explore All Maison Reels</span>
                        <span className="transition-transform group-hover:translate-x-1">&rarr;</span>
                    </Link>
                </div>

                {/* Coverflow 3D Carousel Stage */}
                <div
                    className="relative w-full max-w-[1280px] mx-auto h-[480px] sm:h-[540px] md:h-[600px] flex items-center justify-center"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                >
                    
                    {/* Left Navigation Arrow */}
                    <button
                        onClick={handlePrev}
                        aria-label="Previous style"
                        className="absolute left-2 sm:left-6 md:left-12 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/45 hover:bg-black/80 text-white flex items-center justify-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                        <ChevronLeft size={22} />
                    </button>

                    {/* Right Navigation Arrow */}
                    <button
                        onClick={handleNext}
                        aria-label="Next style"
                        className="absolute right-2 sm:right-6 md:right-12 top-1/2 -translate-y-1/2 z-40 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/45 hover:bg-black/80 text-white flex items-center justify-center shadow-lg backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                        <ChevronRight size={22} />
                    </button>

                    {/* 5 Layered Cards */}
                    <div className="relative w-full h-full flex items-center justify-center">
                        {reels.map((reel, index) => {
                            const config = getCardProps(index)
                            const productLink = getProductLink(reel)
                            const reelTitle = reel.name || reel.title || 'SOVRA Exclusive Reel'

                            return (
                                <Motion.div
                                    key={reel._id || reel.id || index}
                                    initial={false}
                                    animate={{
                                        x: config.x,
                                        scale: config.scale,
                                        zIndex: config.zIndex,
                                        opacity: config.opacity,
                                    }}
                                    transition={{
                                        duration: 0.55,
                                        ease: [0.25, 1, 0.5, 1],
                                    }}
                                    onClick={() => {
                                        if (config.clickable) setActiveIndex(index)
                                    }}
                                    className={`absolute w-[220px] sm:w-[260px] md:w-[300px] h-[380px] sm:h-[460px] md:h-[520px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl origin-center ${
                                        config.clickable ? 'cursor-pointer' : ''
                                    }`}
                                >
                                    {/* Reel Video Still Photo */}
                                    <img
                                        src={reel.image}
                                        alt={reelTitle}
                                        className="w-full h-full object-cover select-none"
                                        draggable="false"
                                    />

                                    {/* Play Icon Badge on Side Cards */}
                                    {!config.isCenter && (
                                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                            <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white/90">
                                                <Play size={16} className="translate-x-0.5 fill-white" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Bottom Overlay & View Button - Visible on Center Card (Exactly like Screenshot) */}
                                    {config.isCenter && (
                                        <Motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15, duration: 0.3 }}
                                            className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 sm:p-5 flex flex-col items-center text-center z-10"
                                        >
                                            {/* Product Title */}
                                            <h3 className="font-plex text-white text-xs sm:text-[13.5px] font-medium tracking-wide truncate w-full mb-3 text-shadow">
                                                {reelTitle}
                                            </h3>

                                            {/* View CTA Button */}
                                            <Link
                                                to={productLink}
                                                className="w-full py-2.5 sm:py-3 bg-black hover:bg-neutral-900 text-white text-xs sm:text-[13px] font-medium tracking-wider text-center rounded-sm transition-all shadow-md block group"
                                            >
                                                <span className="underline underline-offset-4 group-hover:no-underline">
                                                    View
                                                </span>
                                            </Link>
                                        </Motion.div>
                                    )}
                                </Motion.div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default TrendingReels
