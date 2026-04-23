import React, { useState, useEffect } from 'react'
import { m, AnimatePresence } from 'framer-motion'
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
    const [currentIndex, setCurrentIndex] = useState(0)

    // Auto-cycle effect - delayed to reduce initial mount TBT
    useEffect(() => {
        const timeout = setTimeout(() => {
            const interval = setInterval(() => {
                setCurrentIndex((prevIndex) => {
                    const nextIndex = (prevIndex + 1) % categories.length;
                    setActiveTab(categories[nextIndex]);
                    return nextIndex;
                });
            }, 3000);
            return () => clearInterval(interval);
        }, 2000); // Wait 2s before starting auto-cycle

        return () => clearTimeout(timeout);
    }, []);

    // Manual selection updates the index too
    const handleTabClick = (item, index) => {
        setActiveTab(item);
        setCurrentIndex(index);
    };

    return (
        <section className="relative w-full min-h-screen bg-[#f5f0e8] overflow-hidden flex flex-col md:flex-row items-center justify-between pt-20">
            {/* Topbar Avatars - Positioned below the global navbar */}
            <div className="absolute top-36 left-12 md:left-24 z-30 flex items-center">
                {categories.map((item, i) => (
                    <m.div
                        key={item.id}
                        onMouseEnter={() => handleTabClick(item, i)}
                        whileHover={{ y: -5, scale: 1.1 }}
                        className="group relative cursor-pointer"
                    >
                        <div className={`w-14 h-14 rounded-full border-2 border-[#f5f0e8] overflow-hidden ${i > 0 ? '-ml-4' : ''} bg-white shadow-sm transition-all duration-500 ${activeTab.id === item.id ? 'z-50 scale-110 shadow-xl border-[#111110]/20' : 'z-10'} group-hover:z-50 group-hover:shadow-xl`}>
                            <img src={getOptimizedImage(item.image, 100)} alt={item.name} loading="lazy" className={`w-full h-full object-cover transition-all duration-700 ${activeTab.id === item.id ? 'grayscale-0' : 'grayscale-[0.6]'} group-hover:grayscale-0`} />
                        </div>
                        <div className={`absolute -bottom-8 left-1/2 -translate-x-1/2 transition-all duration-500 pointer-events-none ${activeTab.id === item.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                            <span className="text-[9px] kerning-widest uppercase font-sans text-[#111110] bg-white/80 backdrop-blur-sm px-2 py-1 rounded">
                                {item.name}
                            </span>
                        </div>
                    </m.div>
                ))}
                <div className="w-10 h-10 rounded-full border border-[#7a7670]/20 flex items-center justify-center ml-4 text-[#7a7670] hover:bg-[#111110] hover:text-white transition-all cursor-pointer">
                    <ArrowRight size={14} />
                </div>
            </div>

            {/* Editorial Nav Preview - Positioned in the "Dashboard" Area (Right Top) */}
            <div className="absolute top-36 right-12 md:right-48 z-30 flex flex-col items-end">
                {/* Image Frame (Updates on interaction) */}
                <div className="relative w-36 h-[90px] rounded-full overflow-hidden mb-6 border border-black/5 shadow-lg bg-white">
                    <AnimatePresence>
                        <m.img
                            key={activeTab.id}
                            initial={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)', position: 'absolute', top: 0, left: 0 }}
                            transition={{ duration: 1 }}
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
                        {categories.map((cat, index) => (
                            <li
                                key={cat.id}
                                onMouseEnter={() => handleTabClick(cat, index)}
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
            <div className="relative z-10 flex flex-col justify-between h-[85vh] pl-24 md:pl-[180px] py-24 order-2 md:order-1">
                <m.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="font-premium text-[clamp(4.5rem,15vw,13rem)] font-light uppercase text-[#111110] leading-[0.8] tracking-[0.1em]"
                >
                    JEW
                </m.div>

                <m.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    className="max-w-[280px] space-y-8"
                >
                    <p className="font-sans text-sm leading-relaxed text-[#7a7670] font-light">
                        Jewelry business is highly competitive. Many new and established companies are competing in the market armed.
                    </p>

                    <a href="/shop" className="group inline-flex items-center gap-6 bg-[#111110] text-[#f5f0e8] px-8 py-5 text-xs tracking-widest uppercase font-sans transition-all duration-500 hover:gap-10">
                        Explore Now
                        <span className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center transition-transform group-hover:scale-110">
                            <Play size={12} fill="white" stroke="none" />
                        </span>
                    </a>
                </m.div>
            </div>

            {/* Center Model Frame */}
            <div className="absolute inset-x-0 bottom-0 top-0 md:relative flex items-end justify-center w-full md:w-[45vw] h-screen z-0 order-1 md:order-2 md:-translate-x-[40px]">
                <div className="relative w-full h-[95vh] rounded-t-full overflow-hidden">
                    <AnimatePresence>
                        <m.img
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
                    {/* Gradient Overlay for better text readability and depth */}
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#f5f0e8] to-transparent pointer-events-none"></div>
                </div>
            </div>

            {/* Right Word Fragment */}
            <div className="relative z-10 flex flex-col justify-end h-[85vh] pr-24 md:pr-56 py-24 order-3 overflow-hidden text-right">
                <m.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="font-premium text-[clamp(4.5rem,15vw,13rem)] font-light uppercase text-[#111110] leading-[0.8] tracking-[0.1em]"
                >
                    ELRY
                </m.div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute left-1/2 bottom-0 w-[1px] h-20 bg-gradient-to-t from-[#111110] to-transparent animate-bounce opacity-40"></div>
        </section>
    )
}

export default EditorialHero
