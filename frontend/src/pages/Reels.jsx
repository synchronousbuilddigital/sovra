import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { Heart, Share2, ChevronUp, ChevronDown, ArrowUpRight } from 'lucide-react'
import { toast } from 'react-toastify'
import api from '../utils/api'

const reelsList = [
    {
        id: 'reel-1',
        title: 'Abstract Emerald Drop Earring',
        image: '/reels/reel-1.jpg',
        productId: '69d3b01f5ae9ac6e70b3f4b3',
        price: '₹9,500',
    },
    {
        id: 'reel-2',
        title: 'Nova Edge 18K Gold Band',
        image: '/reels/reel-2.jpg',
        productId: '69d3b01f5ae9ac6e70b3f4a7',
        price: '₹9,500',
    },
    {
        id: 'reel-3',
        title: 'Starlit Solitaire Pearl Chain',
        image: '/reels/reel-3.jpg',
        productId: '69d3b01f5ae9ac6e70b3f493',
        price: '₹18,500',
    },
    {
        id: 'reel-4',
        title: 'Luna Glow Heritage Cuff',
        image: '/reels/reel-4.jpg',
        productId: '69d3b01f5ae9ac6e70b3f49b',
        price: '₹18,500',
    },
    {
        id: 'reel-5',
        title: 'Bloomy Moon Blossom Ring',
        image: '/reels/reel-5.png',
        productId: '69d3b01f5ae9ac6e70b3f4a9',
        price: '₹8,500',
    },
]

const Reels = () => {
    const feedRef = useRef(null)
    const [reels, setReels] = useState(reelsList)
    const [likedReels, setLikedReels] = useState({})

    useEffect(() => {
        let isMounted = true
        const fetchReels = async () => {
            try {
                const { data } = await api.get('/reels')
                if (isMounted && Array.isArray(data) && data.length > 0) {
                    setReels(data)
                }
            } catch (err) {
                // retain fallback
            }
        }
        fetchReels()
        return () => { isMounted = false }
    }, [])

    const scrollReel = (direction) => {
        if (feedRef.current) {
            const scrollDistance = window.innerHeight * 0.85
            const scrollAmount = direction === 'up' ? -scrollDistance : scrollDistance
            feedRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' })
        }
    }

    const toggleLike = (e, id) => {
        e.stopPropagation()
        setLikedReels(prev => ({
            ...prev,
            [id]: !prev[id]
        }))
    }

    const handleShare = (e, reel) => {
        e.stopPropagation()
        if (navigator.share) {
            navigator.share({
                title: `SOVRA Reel`,
                url: window.location.href,
            }).catch(() => {})
        } else {
            navigator.clipboard.writeText(window.location.href)
            toast.success('Reel link copied!')
        }
    }

    return (
        <div className="relative w-full h-[100dvh] bg-[#faf7f2] bg-gradient-to-b from-[#faf7f2] via-[#fffcf7] to-[#f5efe6] text-[#111110] overflow-hidden select-none">
            <Helmet>
                <title>SOVRA | Reels</title>
                <meta name="description" content="SOVRA fine jewellery reels feed." />
            </Helmet>

            {/* Vertical Navigation Up & Down Controls */}
            <div className="hidden sm:flex fixed right-6 md:right-12 top-1/2 -translate-y-1/2 z-40 flex-col gap-3">
                <button
                    onClick={() => scrollReel('up')}
                    aria-label="Previous reel"
                    className="w-12 h-12 rounded-full bg-white/95 hover:bg-white text-[#6e5b44] backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-[0_8px_24px_rgba(110,91,68,0.12)] hover:scale-110 active:scale-95 border border-[#6e5b44]/15"
                >
                    <ChevronUp size={22} />
                </button>
                <button
                    onClick={() => scrollReel('down')}
                    aria-label="Next reel"
                    className="w-12 h-12 rounded-full bg-white/95 hover:bg-white text-[#6e5b44] backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-[0_8px_24px_rgba(110,91,68,0.12)] hover:scale-110 active:scale-95 border border-[#6e5b44]/15"
                >
                    <ChevronDown size={22} />
                </button>
            </div>

            {/* Pure Vertical Snap Feed (Full Height, Snaps per Reel, Zero Header/Paragraph Text) */}
            <div
                ref={feedRef}
                className="w-full h-full overflow-y-scroll snap-y snap-mandatory scroll-smooth pt-20 sm:pt-24 pb-6 px-3 flex flex-col items-center"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {reels.map((reel, index) => {
                    const reelId = reel._id || reel.id || index
                    const isLiked = likedReels[reelId]
                    const targetProduct = reel.productId ? `/product/${reel.productId}` : '/shop'

                    return (
                        <div
                            key={reelId}
                            className="relative w-full max-w-[420px] h-[calc(100dvh-5.5rem)] sm:h-[calc(100dvh-6.5rem)] max-h-[820px] shrink-0 snap-center snap-always rounded-[28px] overflow-hidden bg-white shadow-[0_24px_50px_rgba(110,91,68,0.14)] border border-[#6e5b44]/15 my-2 sm:my-3 flex flex-col justify-end"
                        >
                            {/* Reel Fullbleed Media */}
                            <img
                                src={reel.image}
                                alt={reel.title || reel.name || ''}
                                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                                draggable="false"
                            />

                            {/* Minimal Subtle Shadow Vignette for readability of actions */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/15 pointer-events-none" />

                            {/* Reel Title Overlay near bottom left */}
                            {(reel.title || reel.name) && (
                                <div className="absolute left-5 bottom-24 z-20 max-w-[70%]">
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-sans font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-sm border border-white/30">
                                        {reel.category || 'Jewellery'}
                                    </span>
                                    <h3 className="text-white font-headline text-lg italic mt-1 drop-shadow-md">
                                        {reel.title || reel.name}
                                    </h3>
                                    {reel.price && (
                                        <p className="text-amber-200 font-mono text-xs font-bold drop-shadow">
                                            {reel.price}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Right Floating Actions (Like & Share) */}
                            <div className="absolute right-3.5 bottom-24 flex flex-col items-center gap-3.5 z-20">
                                <button
                                    onClick={(e) => toggleLike(e, reelId)}
                                    aria-label="Like"
                                    className={`w-11 h-11 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.2)] active:scale-90 ${
                                        isLiked 
                                            ? 'bg-red-500 text-white' 
                                            : 'bg-white/85 text-[#111110] hover:bg-white hover:text-red-500 border border-white/50'
                                    }`}
                                >
                                    <Heart size={19} className={isLiked ? 'fill-white' : ''} />
                                </button>

                                <button
                                    onClick={(e) => handleShare(e, reel)}
                                    aria-label="Share"
                                    className="w-11 h-11 rounded-full bg-white/85 text-[#111110] hover:bg-white backdrop-blur-md flex items-center justify-center transition-all duration-300 shadow-[0_4px_16px_rgba(0,0,0,0.2)] active:scale-90 border border-white/50"
                                >
                                    <Share2 size={18} />
                                </button>
                            </div>

                            {/* Clean Bottom Buy Now Action Bar */}
                            <div className="relative z-20 p-4 sm:p-5 w-full">
                                <Link
                                    to={targetProduct}
                                    className="w-full py-3.5 bg-white text-[#111110] hover:bg-[#111110] hover:text-white font-sans text-xs sm:text-[13px] tracking-widest uppercase font-bold text-center rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-all duration-300 flex items-center justify-center gap-2 active:scale-98"
                                >
                                    <span>Buy Now</span>
                                    <ArrowUpRight size={15} />
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default Reels
