import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Clock, Heart, Share2, Sparkles } from 'lucide-react'
import api from '../utils/api'

const Magazine = () => {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState('idle') // idle, submitting, success

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

    const articles = [
        {
            id: 1,
            category: "Heritage",
            title: "The Art of the Archive: Redefining British Craftsmanship",
            subtitle: "An intimate look into the centuries-old techniques used in our latest series.",
            image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2070&auto=format&fit=crop",
            date: "April 2026",
            readTime: "8 min read",
            size: "large"
        },
        {
            id: 2,
            category: "Discovery",
            title: "Celestial Alignments: The Inspiration Behind Nova Heart",
            subtitle: "Mapping the stars to the stones.",
            image: "https://images.unsplash.com/photo-1515562141207-7a88fb0ce33e?q=80&w=2070&auto=format&fit=crop",
            date: "March 2026",
            readTime: "5 min read",
            size: "medium"
        },
        {
            id: 3,
            category: "Archive",
            title: "Fluidity in Gold",
            subtitle: "How motion dictates the form of modern bracelets.",
            image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=2070&auto=format&fit=crop",
            date: "March 2026",
            readTime: "6 min read",
            size: "small"
        },
        {
            id: 4,
            category: "Sustainability",
            title: "The Ethics of Radiance",
            subtitle: "Our journey to 100% recycled 18k gold.",
            image: "https://images.unsplash.com/photo-1531995811006-35cb42e1a022?q=80&w=2070&auto=format&fit=crop",
            date: "Feb 2026",
            readTime: "12 min read",
            size: "medium"
        }
    ]

    return (
        <div className="pt-32 pb-24 bg-[#fffcf7] min-h-screen selection:bg-primary/10">
            <main className="max-w-[1920px] mx-auto px-12 md:px-24">
                
                {/* Magazine Header: Vogue-esque Editorial Feel */}
                <header className="mb-24 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="w-16 h-16 mb-8 border border-primary/20 rounded-full flex items-center justify-center italic font-premium text-primary/40 text-2xl"
                    >
                        S
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-6 mb-8"
                    >
                        <div className="w-12 h-[1px] bg-primary/20" />
                        <span className="font-sans text-[11px] tracking-[0.5em] uppercase text-[#7a7670] font-black italic">
                            The Sovereignty of Style
                        </span>
                        <div className="w-12 h-[1px] bg-primary/20" />
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        className="font-premium text-7xl md:text-[10rem] text-[#111110] leading-[0.8] mb-12 italic font-light lowercase tracking-tighter"
                    >
                        Magaz<span className="not-italic font-normal">ine.</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="max-w-2xl font-body text-lg leading-relaxed text-[#656464] font-light italic"
                    >
                        A digital journal exploring the intersections of heritage jewellery, contemporary art, and the soul of artisan craftsmanship.
                    </motion.p>
                </header>

                {/* FEATURED STORY (Vogue Layout) */}
                <section className="mb-40 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                    <motion.div 
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1.2 }}
                        className="lg:col-span-7 relative group"
                    >
                        <div className="aspect-[16/10] overflow-hidden rounded-t-[10rem] md:rounded-t-[20rem] shadow-lux bg-[#f5f0e8]">
                            <img 
                                src={articles[0].image} 
                                alt={articles[0].title}
                                className="w-full h-full object-cover grayscale-[0.3] hover:grayscale-0 transition-all duration-[2.5s] group-hover:scale-105"
                            />
                        </div>
                        <div className="absolute -bottom-10 -right-10 bg-[#fffcf7] p-12 hidden md:block border border-primary/5 shadow-lux rounded-2xl">
                             <Sparkles className="text-primary/20 mb-4" size={24} />
                             <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#7a7670] font-black">Issue No. 04</span>
                        </div>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 1.2, delay: 0.2 }}
                        className="lg:col-span-5 space-y-8"
                    >
                        <span className="font-sans text-[10px] tracking-[0.4em] uppercase text-primary font-black block">Featured Narrative</span>
                        <h2 className="font-premium text-6xl text-[#111110] leading-tight italic font-light">
                            {articles[0].title}
                        </h2>
                        <p className="font-body text-xl text-[#656464] leading-relaxed italic opacity-85 font-light">
                            {articles[0].subtitle}
                        </p>
                        <div className="flex items-center gap-8 pt-4">
                            <span className="font-sans text-[9px] tracking-widest uppercase text-[#7a7670] font-black flex items-center gap-2">
                                <Clock size={12} /> {articles[0].readTime}
                            </span>
                            <div className="w-[1px] h-4 bg-primary/10" />
                            <button className="font-sans text-[10px] tracking-[0.3em] uppercase text-[#111110] font-black flex items-center gap-4 group">
                                Begin Reading
                                <ArrowRight size={14} className="transition-transform group-hover:translate-x-2" />
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* MAGAZINE GRID */}
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-32 gap-x-12 mb-40">
                    {articles.slice(1).map((article, idx) => (
                        <motion.article 
                            key={article.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            className="group"
                        >
                            <div className="relative aspect-[4/5] overflow-hidden bg-[#f5f0e8] mb-12 rounded-t-full shadow-sm group-hover:shadow-lux transition-all duration-[1.5s]">
                                <img 
                                    src={article.image} 
                                    alt={article.title}
                                    className="w-full h-full object-cover transition-all duration-[2s] group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-all duration-1000 flex items-center justify-center translate-y-10 group-hover:translate-y-0">
                                     <BookOpen className="text-white" size={32} />
                                </div>
                            </div>
                            <div className="px-4 space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="font-sans text-[8px] tracking-[0.3em] uppercase text-primary font-black">{article.category}</span>
                                    <div className="flex gap-4">
                                        <Heart size={12} className="text-[#7a7670]/40 hover:text-error transition-colors cursor-pointer" />
                                        <Share2 size={12} className="text-[#7a7670]/40 hover:text-primary transition-colors cursor-pointer" />
                                    </div>
                                </div>
                                <h3 className="font-premium text-3xl text-[#111110] leading-none italic font-light group-hover:opacity-60 transition-opacity">
                                    {article.title}
                                </h3>
                                <p className="font-body text-sm text-[#656464]/80 leading-relaxed italic line-clamp-2">
                                    {article.subtitle}
                                </p>
                                <div className="pt-4 border-t border-primary/5 flex justify-between items-center">
                                     <span className="font-sans text-[8px] tracking-widest text-[#7a7670] uppercase font-black">{article.date}</span>
                                     <button className="font-sans text-[8px] tracking-[0.2em] uppercase text-[#111110] font-black hover:opacity-50 transition-opacity">Full Story</button>
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </section>

                {/* Newsletter / Journal Opt-in */}
                <section className="bg-[#111110] p-16 md:p-32 rounded-[3.5rem] text-center space-y-12 relative overflow-hidden group">
                     <div className="absolute inset-0 opacity-10 group-hover:opacity-25 transition-opacity duration-1000 pointer-events-none">
                          <img src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover scale-150 rotate-12 blur-3xl" />
                     </div>
                     <motion.span 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="font-sans text-[10px] tracking-[0.6em] uppercase text-white/40 block font-black"
                     >
                        The SOVRA Circular
                     </motion.span>
                     <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="font-premium text-5xl md:text-7xl text-[#f5f0e8] italic font-light max-w-4xl mx-auto"
                     >
                        "Receive the whispers of our Udaipur studio in your inbox."
                     </motion.h2>
                     <div className="max-w-xl mx-auto pt-8">
                         {status === 'success' ? (
                             <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-[#f5f0e8] py-8"
                             >
                                 <h3 className="font-premium text-3xl mb-4 italic">Welcome to the inner circle.</h3>
                                 <p className="font-sans text-[10px] tracking-widest uppercase opacity-60">A confirmation has been sent to {email}</p>
                             </motion.div>
                         ) : (
                             <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-6 justify-center items-center">
                                 <input 
                                    placeholder="Your email address" 
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-full px-8 py-5 font-body text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 hover:bg-white/10 hover:border-white/30 transition-all text-sm outline-none"
                                 />
                                 <button 
                                    type="submit"
                                    disabled={status === 'submitting'}
                                    className="w-full md:w-auto bg-[#f5f0e8] text-[#111110] px-12 py-5 rounded-full font-sans text-[10px] tracking-widest uppercase font-black hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 whitespace-nowrap"
                                 >
                                     {status === 'submitting' ? 'Joining...' : 'Join the Circle'}
                                 </button>
                             </form>
                         )}
                     </div>
                </section>
            </main>
        </div>
    )
}

export default Magazine
