import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, Gem, Disc } from 'lucide-react'

const collections = [
    {
        id: 'necklaces',
        title: 'Celestial Necklaces',
        subtitle: 'The Archive I',
        desc: 'Handcrafted silhouettes inspired by the deep-blue night sky. Each piece is a testament to eternal elegance and refined craftsmanship.',
        image: '/necklace_hero.png',
        count: '24 Pieces'
    },
    {
        id: 'bracelets',
        title: 'Ether Bracelets',
        subtitle: 'The Archive II',
        desc: 'Fluid curves of 18k gold and high-clarity gemstones. Designed to follow the natural movement of the spirit.',
        image: '/bracelet_hero.png',
        count: '18 Pieces'
    },
    {
        id: 'rings',
        title: 'Heritage Rings',
        subtitle: 'The Archive III',
        desc: 'Modern tokens of individual stories. Forged in the heart of London using centuries-old techniques met with contemporary vision.',
        image: '/ring_hero.png',
        count: '32 Pieces'
    },
    {
        id: 'earrings',
        title: 'Stellar Earrings',
        subtitle: 'The Archive IV',
        desc: 'Subtle signatures of brilliance. Sculpted light to frame the face with an unmatched radiance.',
        image: '/earring_hero.png',
        count: '15 Pieces'
    }
]

const Collections = () => {
    return (
        <div className="pt-32 pb-24 bg-[#fffcf7] min-h-screen selection:bg-primary/10">
            <main className="max-w-[1920px] mx-auto px-12 md:px-24">
                {/* Editorial Header */}
                <header className="mb-32 text-center max-w-4xl mx-auto">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-sans text-[10px] tracking-[0.4em] uppercase text-[#7a7670] mb-8 block font-black"
                    >
                        Our Masterwork Curation
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-premium text-7xl md:text-9xl text-[#111110] leading-[0.9] mb-12 italic font-light"
                    >
                        The <span className="not-italic font-normal">Archive</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="font-sans text-lg text-[#656464] leading-relaxed max-w-2xl mx-auto font-light"
                    >
                        Explore our categorized masterpieces. Each collection represents a distinct chapter in the SOVRA story, where British heritage meets celestial inspiration.
                    </motion.p>
                </header>

                {/* Collections List */}
                <div className="space-y-32">
                    {collections.map((item, index) => (
                        <motion.section
                            key={item.id}
                            initial={{ opacity: 0, y: 100 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-20 md:gap-32`}
                        >
                            {/* Image Side */}
                            <div className="relative w-full md:w-1/2 group overflow-hidden bg-[#f5f0e8] rounded-sm border border-[#111110]/5">
                                <Link to={`/shop/${item.id}`} className="block overflow-hidden h-[700px]">
                                    <motion.img
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-all duration-1000 grayscale-[0.2] group-hover:grayscale-0"
                                    />
                                </Link>
                                <div className="absolute top-12 left-12 md:left-24 z-10 flex flex-col items-start gap-4 pointer-events-none">
                                    <div className="w-16 h-16 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-sm bg-white/10">
                                        {item.id === 'necklaces' && <Sparkles className="text-white" size={20} />}
                                        {item.id === 'bracelets' && <Disc className="text-white" size={20} />}
                                        {item.id === 'rings' && <Gem className="text-white" size={20} />}
                                        {item.id === 'earrings' && <Sparkles className="text-white" size={20} />}
                                    </div>
                                    <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-white font-black">{item.count}</span>
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className="w-full md:w-1/2 space-y-10">
                                <div>
                                    <span className="font-premium text-2xl text-[#6e5b44] italic mb-4 block">{item.subtitle}</span>
                                    <h2 className="font-premium text-5xl md:text-7xl text-[#111110] leading-none mb-8 tracking-tight">{item.title}</h2>
                                    <p className="font-sans text-base leading-[1.8] text-[#7a7670] max-w-lg font-light">
                                        {item.desc}
                                    </p>
                                </div>
                                <div className="pt-6">
                                    <Link
                                        to={`/shop/${item.id}`}
                                        className="group inline-flex items-center gap-6 text-[10px] tracking-[0.4em] uppercase font-sans text-[#111110] border-b border-[#111110] pb-4 transition-all hover:gap-10"
                                    >
                                        Explore Collection
                                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-2" />
                                    </Link>
                                </div>
                            </div>
                        </motion.section>
                    ))}
                </div>

                {/* Bottom CTA */}
                <section className="mt-4 py-8 border-t border-[#111110]/5 text-center">
                    <h3 className="font-premium text-5xl text-[#111110] mb-12 italic">Searching for something <br /><span className="not-italic">Specific?</span></h3>
                    <Link to="/shop" className="bg-[#111110] text-[#f5f0e8] px-12 py-6 text-[10px] tracking-[0.4em] uppercase font-sans hover:opacity-90 transition-opacity rounded-full">
                        View Fine Jewellery Shop
                    </Link>
                </section>
            </main>
        </div>
    )
}

export default Collections
