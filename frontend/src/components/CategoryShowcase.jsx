import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const categories = [
    { id: 'necklaces', name: 'Necklaces', image: '/nav-necklace.png', desc: 'Elegant pieces for a timeless silhouette.' },
    { id: 'bracelets', name: 'Bracelets', image: '/nav-bracelet.png', desc: 'Crafted loops of refined gold and stone.' },
    { id: 'rings', name: 'Rings', image: '/nav-ring.png', desc: 'Modern tokens for individual stories.' },
    { id: 'earrings', name: 'Earrings', image: '/nav-earrings.png', desc: 'The subtle signature of brilliance.' }
]

const CategoryShowcase = () => {
    const [activeTab, setActiveTab] = useState(categories[0])

    return (
        <section className="relative w-full py-32 px-12 md:px-24 bg-[#f5f0e8] overflow-hidden">
            <div className="max-w-[1720px] mx-auto flex flex-col md:flex-row items-center gap-20">
                
                {/* Left: Featured Image Container */}
                <div className="relative w-full md:w-1/2 h-[600px] md:h-[800px] group">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute inset-0 rounded-t-[200px] overflow-hidden shadow-2xl"
                        >
                            <img 
                                src={activeTab.image} 
                                alt={activeTab.name}
                                className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-1000 scale-105 hover:scale-100"
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Decorative Elements (Burst) - Matching user screenshot */}
                    <div className="absolute -top-6 -right-6 w-16 h-16 text-[#111110] z-20">
                         <svg viewBox="0 0 100 100" className="w-full h-full animate-spin-slow">
                            <path d="M50 0 L55 45 L100 50 L55 55 L50 100 L45 55 L0 50 L45 45 Z" fill="currentColor" />
                        </svg>
                    </div>

                    {/* Decorative Scribbles - Matching user screenshot */}
                    <div className="absolute -bottom-10 -left-10 w-48 h-32 opacity-30 z-20 pointer-events-none">
                        <svg viewBox="0 0 200 100" fill="none" stroke="#111110" strokeWidth="1">
                            <path d="M10 50 Q 50 10, 90 50 T 170 50" strokeDasharray="10 5" />
                        </svg>
                    </div>
                </div>

                {/* Right: Category Navigation */}
                <div className="relative w-full md:w-1/2 flex flex-col justify-center">
                    {/* The architectural "L" border from screenshot */}
                    <div className="absolute top-0 left-[-40px] w-[1px] h-full bg-[#111110]/10 hidden md:block">
                        <div className="absolute top-0 left-0 w-20 h-[1px] bg-[#111110]/10"></div>
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#111110]/10"></div>
                    </div>

                    <div className="space-y-12">
                        <div>
                            <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#7a7670] mb-4 block">Our Collections</span>
                            <h2 className="font-editorial text-5xl md:text-7xl text-[#111110] leading-tight">Featured <br/><span className="italic font-light">Categories</span></h2>
                        </div>

                        <ul className="space-y-6">
                            {categories.map((cat) => (
                                <li 
                                    key={cat.id}
                                    onMouseEnter={() => setActiveTab(cat)}
                                    className="relative group cursor-pointer"
                                >
                                    <div className="flex items-center gap-6">
                                        <span className={`font-editorial transition-all duration-500 ${
                                            activeTab.id === cat.id ? 'text-4xl md:text-5xl text-[#111110]' : 'text-xl md:text-2xl text-[#7a7670] opacity-50'
                                        }`}>
                                            {cat.name}
                                        </span>
                                        {activeTab.id === cat.id && (
                                            <motion.div 
                                                layoutId="arrow"
                                                className="w-10 h-10 rounded-full border border-[#111110] flex items-center justify-center"
                                            >
                                                <ArrowRight size={16} />
                                            </motion.div>
                                        )}
                                    </div>
                                    <p className={`mt-2 font-sans text-xs tracking-wider text-[#7a7670] transition-opacity duration-500 overflow-hidden ${
                                        activeTab.id === cat.id ? 'opacity-100 max-h-10' : 'opacity-0 max-h-0'
                                    }`}>
                                        {cat.desc}
                                    </p>
                                </li>
                            ))}
                        </ul>

                        <div className="pt-10">
                            <a href="/shop" className="inline-flex items-center gap-4 text-[10px] tracking-[0.4em] uppercase font-sans text-[#111110] border-b border-[#111110] pb-2 hover:opacity-70 transition-opacity">
                                Discover All Pieces
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default CategoryShowcase
