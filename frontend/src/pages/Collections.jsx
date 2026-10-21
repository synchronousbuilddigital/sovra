import React from 'react'
import { motion as Motion } from 'framer-motion'
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
        <div className="pt-20 sm:pt-24 md:pt-28 pb-20 md:pb-28 bg-[#fffcf7] min-h-screen selection:bg-primary/10">
            <main className="max-w-[1500px] mx-auto px-6 sm:px-10 md:px-14 lg:px-20">
                {/* Collections List */}
                <div className="space-y-16 sm:space-y-20 md:space-y-28">
                    {collections.map((item, index) => (
                        <Motion.section
                            key={item.id}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            className={`flex flex-col ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8 sm:gap-12 md:gap-14 lg:gap-20`}
                        >
                            {/* Image Side */}
                            <div className="relative w-full md:w-1/2 group overflow-hidden bg-[#f5f0e8] rounded-xl sm:rounded-2xl border border-[#111110]/8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)] transition-all duration-700">
                                <Link to={`/shop/${item.id}`} className="block overflow-hidden aspect-[4/5] max-h-[480px] lg:max-h-[520px] w-full">
                                    <Motion.img
                                        whileHover={{ scale: 1.04 }}
                                        transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-all duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                </Link>

                                {/* Luxury Frosted Pill Badge */}
                                <div className="absolute top-4 left-4 sm:top-5 sm:left-5 z-10 pointer-events-none">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-white/50 shadow-sm">
                                        {item.id === 'necklaces' && <Sparkles size={11} className="text-[#6e5b44]" />}
                                        {item.id === 'bracelets' && <Disc size={11} className="text-[#6e5b44]" />}
                                        {item.id === 'rings' && <Gem size={11} className="text-[#6e5b44]" />}
                                        {item.id === 'earrings' && <Sparkles size={11} className="text-[#6e5b44]" />}
                                        <span className="font-sans text-[9px] tracking-[0.2em] uppercase font-bold text-[#111110]">
                                            {item.count}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Content Side */}
                            <div className="w-full md:w-1/2 flex flex-col justify-center space-y-4 sm:space-y-5 md:px-4 lg:px-8">
                                <div className="space-y-2.5 sm:space-y-3">
                                    <div className="flex items-center gap-2.5">
                                        <span className="h-[1px] w-6 bg-[#6e5b44]/40" />
                                        <span className="font-sans text-[10px] sm:text-[11px] tracking-[0.25em] uppercase text-[#6e5b44] font-semibold">
                                            {item.subtitle}
                                        </span>
                                    </div>

                                    <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#111110] font-light italic leading-[1.08] tracking-tight">
                                        {item.title}
                                    </h2>

                                    <p className="font-body text-xs sm:text-sm md:text-base leading-relaxed text-[#656464] font-light max-w-md pt-1">
                                        {item.desc}
                                    </p>
                                </div>

                                <div className="pt-2 sm:pt-3">
                                    <Link
                                        to={`/shop/${item.id}`}
                                        className="group inline-flex items-center gap-3 px-6 sm:px-7 py-3 sm:py-3.5 bg-[#111110] hover:bg-black text-[#f5f0e8] text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-sans font-medium rounded-md transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5"
                                    >
                                        <span>Explore Collection</span>
                                        <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
                                    </Link>
                                </div>
                            </div>
                        </Motion.section>
                    ))}
                </div>

                {/* Bottom CTA */}
                <section className="mt-20 md:mt-28 py-12 md:py-16 border-t border-[#111110]/8 text-center max-w-2xl mx-auto">
                    <span className="font-sans text-[9px] sm:text-[10px] tracking-[0.3em] uppercase text-[#7a7670] block mb-2 font-medium">Bespoke Curation</span>
                    <h3 className="font-headline text-2xl sm:text-3xl md:text-4xl text-[#111110] mb-6 font-light italic leading-tight">
                        Searching for something <span className="not-italic font-normal">specific?</span>
                    </h3>
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-3 bg-[#111110] hover:bg-black text-[#f5f0e8] px-8 sm:px-10 py-3.5 text-[10px] sm:text-[11px] tracking-[0.25em] uppercase font-sans font-medium rounded-md transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5"
                    >
                        <span>View All Fine Jewellery</span>
                        <ArrowRight size={13} />
                    </Link>
                </section>
            </main>
        </div>
    )
}

export default Collections
