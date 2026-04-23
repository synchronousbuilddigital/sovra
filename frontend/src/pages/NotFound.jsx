import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Compass } from 'lucide-react'

const NotFound = () => {
    return (
        <div className="min-h-screen bg-[#fffcf7] flex items-center justify-center px-6 selection:bg-primary/10">
            <div className="max-w-4xl w-full text-center space-y-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                    className="relative inline-block"
                >
                    <span className="font-premium text-[20vw] md:text-[15rem] leading-none text-[#111110]/5 italic select-none">404</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Compass size={80} strokeWidth={0.5} className="text-primary/20 animate-spin-slow" />
                    </div>
                </motion.div>

                <div className="space-y-8">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="font-sans text-[10px] tracking-[0.6em] uppercase text-[#7a7670] block font-black"
                    >
                        Error Code: 404
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="font-premium text-6xl md:text-8xl text-[#111110] italic font-light tracking-tighter"
                    >
                        The Lost <span className="not-italic font-normal">Archive</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="font-body text-lg text-[#656464] leading-relaxed max-w-lg mx-auto font-light italic"
                    >
                        The coordinates you provided do not exist within our celestial registry. This piece of history remains unwritten.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="flex flex-col md:flex-row items-center justify-center gap-8"
                >
                    <Link 
                        to="/" 
                        className="bg-[#111110] text-[#f5f0e8] px-12 py-6 text-[10px] tracking-[0.4em] uppercase font-sans hover:opacity-90 transition-all rounded-full shadow-lux-sm"
                    >
                        Return to Origin
                    </Link>
                    <Link 
                        to="/shop" 
                        className="group flex items-center gap-6 text-[10px] tracking-[0.4em] uppercase font-sans text-[#111110] border-b border-[#111110] pb-4 transition-all hover:gap-10"
                    >
                        Explore the Vault
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-2" />
                    </Link>
                </motion.div>
            </div>

            {/* Background Decorative Fragments */}
            <div className="fixed top-12 left-12 opacity-10 pointer-events-none select-none">
                <span className="font-premium text-sm italic tracking-widest uppercase">Maison Sovra</span>
            </div>
            <div className="fixed bottom-12 right-12 opacity-10 pointer-events-none select-none">
                <span className="font-sans text-[8px] tracking-[1em] uppercase font-black">Celestial Registry</span>
            </div>
        </div>
    )
}

export default NotFound
