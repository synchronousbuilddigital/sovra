import React from 'react'
import { motion } from 'framer-motion'

const Ethics = () => {
    return (
        <div className="pt-40 pb-48 bg-background font-body selection:bg-primary-container selection:text-on-primary-container">
            {/* Hero Section */}
            <section className="px-12 mb-32 max-w-[1440px] mx-auto text-center">
                <motion.span 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="font-label text-xs tracking-[0.4em] uppercase text-primary font-bold block mb-10"
                >
                    Responsible Curation
                </motion.span>
                <motion.h1 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="font-headline text-5xl md:text-[10rem] leading-none tracking-tight italic italic underline decoration-primary/5"
                >
                    Origin
                </motion.h1>
            </section>

            {/* Content Blocks */}
            <div className="max-w-[1440px] mx-auto px-12 space-y-48">
                
                {/* Recycled Gold */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
                    <div className="relative overflow-hidden aspect-square shadow-2xl">
                        <img 
                            src="/recycled_gold_marble_1775039820004_new_1775042813019.png" 
                            alt="18k Recycled Gold" 
                            className="w-full h-full object-cover grayscale brightness-90"
                        />
                    </div>
                    <div className="space-y-10">
                        <h2 className="font-headline text-5xl italic font-light italic">Recycled 18k Gold</h2>
                        <p className="text-on-surface-variant text-2xl font-light leading-relaxed italic opacity-85">
                            Our entire collection is crafted using recycled 18k and 14k gold, minimizing our environmental footprint without ever compromising the material's eternal brilliance.
                        </p>
                        <p className="text-secondary text-[10px] tracking-[0.3em] font-black uppercase opacity-60">Sustainable luxury is the only true luxury.</p>
                    </div>
                </section>

                {/* Conflict-Free Stones */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
                    <div className="order-2 md:order-1 space-y-10">
                        <h2 className="font-headline text-5xl italic font-light italic">Conflict-Free Stones</h2>
                        <p className="text-on-surface-variant text-2xl font-light leading-relaxed italic opacity-85">
                            Every diamond and gem used in a Sovra piece is ethically sourced, adhering to the Kimberly Process and ensuring transparency at every stage of the journey. 
                            We only partner with suppliers who prioritize the fair treatment of their artisans and communities.
                        </p>
                    </div>
                    <div className="order-1 md:order-2 relative overflow-hidden aspect-[3/4] shadow-lux">
                        <img 
                            src="/diamond_inspection_macro_1775039820005_new_1775042830984.png" 
                            alt="Conflict-Free Diamond Detail" 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-grayscale duration-1000"
                        />
                    </div>
                </section>
            </div>
            
            {/* Signature CTA */}
            <section className="mt-64 border-t border-outline-variant/10 py-32 text-center text-primary group">
                <p className="font-headline text-3xl italic italic mb-10 group-hover:tracking-widest transition-all duration-1000">Eternal Brilliance, Eternal Ethics.</p>
                <a href="/shop" className="font-label text-[10px] tracking-[0.4em] uppercase text-on-surface/40 font-black underline underline-offset-8 transition-all hover:text-primary">Discover The Collective</a>
            </section>
        </div>
    )
}

export default Ethics
