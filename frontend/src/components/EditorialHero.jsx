import React, { useState, useEffect } from 'react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Play } from 'lucide-react'
import { getOptimizedImage } from '../utils/imageUtils'

const categories = [
    { id: 1, name: 'Necklaces', image: '/necklace_hero.png' },
    { id: 2, name: 'Bracelets', image: '/bracelet_hero.png' },
    { id: 3, name: 'Rings', image: '/ring_hero.png' },
    { id: 4, name: 'Earrings', image: '/earring_hero.png' }
]

const EditorialHero = () => {
    const [activeTab, setActiveTab] = useState(categories[0])

    // Auto-cycle effect - delayed to reduce initial mount TBT
    useEffect(() => {
        const timeout = setTimeout(() => {
            const interval = setInterval(() => {
                setActiveTab((prev) => {
                    const currentIndex = categories.findIndex((c) => c.id === prev.id)
                    const nextIndex = (currentIndex + 1) % categories.length
                    return categories[nextIndex]
                })
            }, 3000)
            return () => clearInterval(interval)
        }, 2000)

        return () => clearTimeout(timeout)
    }, [])

    const handleTabClick = (item) => {
        setActiveTab(item)
    }

    return (
        <section className="relative w-full bg-[#f5f0e8] overflow-hidden flex flex-col md:flex-row items-center md:justify-between pt-[68px] pb-6 md:min-h-screen md:pt-20 md:pb-0">
            {/* Mobile View Only - Clean, Snug, No Wasted Space (< md) */}
            <div className="flex md:hidden flex-col items-center w-full px-5 text-center z-10 max-w-sm mx-auto space-y-4">
                {/* 1. Arched Model Frame - Arched at top like desktop */}
                <div className="relative w-[75vw] max-w-[270px] h-[310px] rounded-t-full overflow-hidden shadow-sm border border-[#111110]/5 bg-white shrink-0">
                    <AnimatePresence mode="wait">
                        <Motion.img
                            key={`mobile-hero-${activeTab.id}`}
                            initial={{ opacity: 0, scale: 1.04 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                            src={getOptimizedImage(activeTab.image, 800)}
                            alt={activeTab.name}
                            fetchpriority="high"
                            loading="eager"
                            className="w-full h-full object-cover object-[center_top]"
                        />
                    </AnimatePresence>
                </div>

                {/* 2. Category Thumbnails - Positioned Cleanly Below Arch (No Overlap) */}
                <div className="flex items-center justify-center gap-3 shrink-0 pt-1">
                    {categories.map((item) => {
                        const isActive = activeTab.id === item.id
                        return (
                            <button
                                key={`mob-cat-${item.id}`}
                                type="button"
                                onClick={() => handleTabClick(item)}
                                className={`flex flex-col items-center gap-1 transition-all ${
                                    isActive ? 'scale-105' : 'opacity-65 hover:opacity-100'
                                }`}
                            >
                                <div className={`w-11 h-11 rounded-full border-2 overflow-hidden bg-white transition-all ${
                                    isActive ? 'border-[#111110] shadow-sm ring-2 ring-[#111110]/15' : 'border-[#111110]/15'
                                }`}>
                                    <img
                                        src={getOptimizedImage(item.image, 100)}
                                        alt={item.name}
                                        className={`w-full h-full object-cover transition-all ${
                                            isActive ? 'grayscale-0' : 'grayscale-[0.4]'
                                        }`}
                                    />
                                </div>
                                <span className={`text-[8.5px] font-mono tracking-wider uppercase transition-colors ${
                                    isActive ? 'text-[#111110] font-bold' : 'text-[#7a7670]'
                                }`}>
                                    {item.name}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* 3. Text Headline, Description & CTA Button */}
                <div className="flex flex-col items-center gap-2 w-full shrink-0 pt-0.5">
                    <Motion.h1
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="font-premium text-3xl sm:text-4xl font-light uppercase text-[#111110] tracking-[0.16em] leading-none"
                    >
                        JEWELRY
                    </Motion.h1>

                    <Motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.7, delay: 0.15 }}
                        className="font-sans text-[11px] leading-relaxed text-[#7a7670] font-light max-w-[260px] line-clamp-2"
                    >
                        Jewelry business is highly competitive. Many new and established companies are competing in the market armed.
                    </Motion.p>

                    <Motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.25 }}
                        className="w-full flex justify-center pt-1"
                    >
                        <a
                            href="/shop"
                            className="group inline-flex items-center justify-center gap-4 bg-[#111110] text-[#f5f0e8] w-full max-w-[240px] py-3 px-6 text-[10px] tracking-[0.22em] uppercase font-sans hover:bg-[#222220] transition-all shadow-sm active:scale-98"
                        >
                            <span>Explore Now</span>
                            <span className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center transition-transform group-hover:scale-110">
                                <Play size={8} fill="white" stroke="none" className="translate-x-0.5" />
                            </span>
                        </a>
                    </Motion.div>
                </div>
            </div>

            {/* Desktop View Elements - 100% UNTOUCHED (md: and above) */}
            {/* Topbar Avatars - Positioned below the global navbar */}
            <div className="hidden md:flex absolute md:bottom-auto md:top-36 md:left-24 z-30 items-center origin-top-left md:scale-100">
                {categories.map((item, i) => (
                    <Motion.div
                        key={item.id}
                        onMouseEnter={() => handleTabClick(item)}
                        whileHover={{ y: -5, scale: 1.1 }}
                        className="group relative cursor-pointer"
                    >
                        <div className={`w-14 h-14 rounded-full border-2 border-[#f5f0e8] overflow-hidden ${i > 0 ? '-ml-4' : ''} bg-white shadow-sm transition-all duration-500 ${activeTab.id === item.id ? 'z-50 scale-110 shadow-xl border-[#111110]/20' : 'z-10'} group-hover:z-50 group-hover:shadow-xl`}>
                            <img src={getOptimizedImage(item.image, 100)} alt={item.name} loading="lazy" className={`w-full h-full object-cover transition-all duration-700 ${activeTab.id === item.id ? 'grayscale-0' : 'grayscale-[0.6]'} group-hover:grayscale-0`} />
                        </div>
                        <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 transition-all duration-500 pointer-events-none ${activeTab.id === item.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                            <span className="text-[9px] kerning-widest uppercase font-sans text-[#111110] bg-white px-2 py-1 rounded shadow-sm">
                                {item.name}
                            </span>
                        </div>
                    </Motion.div>
                ))}
                <div className="w-10 h-10 rounded-full border border-[#7a7670]/20 flex items-center justify-center ml-4 text-[#7a7670] hover:bg-[#111110] hover:text-white transition-all cursor-pointer">
                    <ArrowRight size={14} />
                </div>
            </div>

            {/* Editorial Nav Preview - Positioned in the "Dashboard" Area (Right Top) */}
            <div className="hidden md:flex absolute md:top-36 md:right-48 z-30 flex-col items-end origin-top-right md:scale-100">
                {/* Image Frame (Updates on interaction) */}
                <div className="relative w-36 h-[90px] rounded-full overflow-hidden mb-6 border border-black/5 shadow-lg bg-white hidden md:block">
                    <AnimatePresence>
                        <Motion.img
                            key={activeTab.id}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98, position: 'absolute', top: 0, left: 0 }}
                            transition={{ duration: 0.6 }}
                            src={getOptimizedImage(activeTab.image, 300)}
                            className="w-full h-full object-cover"
                            alt="Nav preview"
                        />
                    </AnimatePresence>
                </div>

                {/* Categories List - Positioned "Upward of the ELRY" */}
                <div className="relative mt-8 group">
                    {/* The architectural "L" border from screenshot */}
                    <div className="absolute top-0 right-[-24px] w-[60px] h-[60px] border-r border-t border-[#111110]/10 pointer-events-none"></div>

                    <ul className="flex flex-col items-end gap-5">
                        {categories.map((cat) => (
                            <li
                                key={cat.id}
                                onMouseEnter={() => handleTabClick(cat)}
                                className="relative pr-6"
                            >
                                <span className={`font-sans text-xs tracking-[0.2em] uppercase transition-all duration-300 cursor-pointer ${activeTab.id === cat.id ? 'text-[#111110] font-bold' : 'text-[#7a7670] opacity-60'
                                    }`}>
                                    {cat.name}
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Left Content */}
            <div className="hidden md:flex relative z-10 flex-col justify-between md:h-[85vh] md:pl-[180px] md:py-24 md:order-1 md:mt-0 md:w-auto md:text-left">
                <Motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="font-premium md:text-[clamp(4.5rem,15vw,13rem)] font-light uppercase text-[#111110] leading-[0.8] tracking-[0.1em]"
                >
                    <span className="hidden md:inline">JEW</span>
                </Motion.div>

                <Motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    className="max-w-[280px] mx-auto md:mx-0 space-y-6 md:space-y-8 mt-12 md:mt-0"
                >
                    <p className="font-sans text-sm leading-relaxed text-[#7a7670] font-light">
                        Jewelry business is highly competitive. Many new and established companies are competing in the market armed.
                    </p>

                    <a href="/shop" className="group inline-flex items-center justify-center md:justify-start gap-6 bg-[#111110] text-[#f5f0e8] px-8 py-5 text-xs tracking-widest uppercase font-sans transition-all duration-500 hover:gap-10 w-full md:w-auto">
                        Explore Now
                        <span className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center transition-transform group-hover:scale-110">
                            <Play size={12} fill="white" stroke="none" />
                        </span>
                    </a>
                </Motion.div>
            </div>

            {/* Center Model Frame */}
            <div className="hidden md:flex md:bottom-0 md:relative items-end justify-center md:w-[45vw] md:h-screen z-0 md:order-2 md:-translate-x-[40px]">
                <div className="relative w-[90%] md:w-full h-full md:h-[95vh] md:rounded-b-none md:rounded-t-full overflow-hidden mt-0 md:mt-0 mx-auto">
                    <AnimatePresence>
                        <Motion.img
                            key={activeTab.id}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98, position: 'absolute', inset: 0 }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            src={getOptimizedImage(activeTab.image, 1200)}
                            alt={activeTab.name}
                            fetchpriority="high"
                            loading="eager"
                            className="w-full h-full object-cover object-[center_top]"
                        />
                    </AnimatePresence>
                </div>
            </div>

            {/* Right Word Fragment */}
            <div className="relative z-10 hidden md:flex flex-col justify-start md:justify-end h-auto md:h-[85vh] px-6 md:pr-56 py-6 md:py-24 order-3 overflow-hidden text-center md:text-right w-full md:w-auto -mt-8 md:mt-0">
                <Motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="font-premium text-[clamp(4.5rem,15vw,13rem)] font-light uppercase text-[#111110] leading-[0.8] tracking-[0.1em]"
                >
                    ELRY
                </Motion.div>
            </div>

            {/* Scroll Indicator */}
            <div className="hidden md:block absolute left-1/2 md:bottom-0 w-[1px] md:h-20 bg-gradient-to-t from-[#111110] to-transparent animate-bounce opacity-40"></div>
        </section>
    )
}

export default EditorialHero
