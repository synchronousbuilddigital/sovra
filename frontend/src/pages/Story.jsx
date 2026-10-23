import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    Sparkles,
    Droplets,
    ShieldCheck,
    Tag,
    Heart,
    MapPin,
    Truck,
    CheckCircle2,
    Mail,
    Phone,
    ArrowRight
} from 'lucide-react'
import api from '../utils/api'
import { formatPrice } from '../utils/currency'
import { getOptimizedImage } from '../utils/imageUtils'

const defaultFeaturedLineups = [
    {
        _id: '69d3b01f5ae9ac6e70b3f498',
        name: 'Goated Pearl Necklace',
        category: 'NECKLACES',
        price: 22000,
        img: 'https://res.cloudinary.com/dylkhqjgm/image/upload/v1775543841/sovra_products/xowkj5ltuiorbmdnq60d.webp'
    },
    {
        _id: '69d3b01f5ae9ac6e70b3f4b7',
        name: 'Echo Pearl Twist',
        category: 'EARRINGS',
        price: 7500,
        img: 'https://res.cloudinary.com/dylkhqjgm/image/upload/v1775535556/sovra_products/maienvisloxgndpbsnd5.webp'
    },
    {
        _id: '69d3b01f5ae9ac6e70b3f49e',
        name: 'Bonded bracelet',
        category: 'BRACELETS',
        price: 17500,
        img: 'https://res.cloudinary.com/dylkhqjgm/image/upload/v1775543187/sovra_products/wrybxmdqseigfgeogp69.webp'
    },
    {
        _id: '69d3b01f5ae9ac6e70b3f4a9',
        name: 'Bloomy moon Ring',
        category: 'RINGS',
        price: 8500,
        img: 'https://res.cloudinary.com/dylkhqjgm/image/upload/v1775541345/sovra_products/mtycl2kupgcd07glk7sc.webp'
    }
]

const Story = () => {
    const [lineups, setLineups] = useState(() => {
        try {
            const cached = sessionStorage.getItem('sovra_about_featured')
            if (cached) {
                const parsed = JSON.parse(cached)
                if (Array.isArray(parsed) && parsed.length >= 4) {
                    return parsed.slice(0, 4)
                }
            }
        } catch (e) {
            // ignore
        }
        return defaultFeaturedLineups
    })

    useEffect(() => {
        window.scrollTo(0, 0)
        let isMounted = true

        const fetchLineups = async () => {
            try {
                const { data } = await api.get('/products?pageSize=4')
                const list = Array.isArray(data) ? data : (data.products || [])
                if (isMounted && list && list.length >= 4) {
                    const sliced = list.slice(0, 4)
                    setLineups(sliced)
                    try {
                        sessionStorage.setItem('sovra_about_featured', JSON.stringify(sliced))
                    } catch (e) {
                        // ignore
                    }
                }
            } catch (err) {
                // Silently fallback to default curated lineup
            }
        }

        fetchLineups()
        return () => { isMounted = false }
    }, [])

    return (
        <div className="pt-16 sm:pt-20 md:pt-24 pb-20 bg-[#fffcf7] dark:bg-[#121211] min-h-screen selection:bg-primary/10 text-[#111110] dark:text-[#eae9de]">
            <main className="max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12">
                {/* Top Header Block */}
                <header className="text-center max-w-4xl mx-auto flex flex-col items-center pt-2 md:pt-4">
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-center -mb-2 sm:-mb-3"
                    >
                        <div className="h-14 sm:h-16 md:h-20 overflow-hidden flex items-center justify-center">
                            <img
                                src="/logo.jpg"
                                alt="SOVRA Brand Logo"
                                className="h-28 sm:h-32 md:h-36 w-auto max-w-none object-contain mix-blend-multiply dark:mix-blend-normal dark:bg-[#fffcf7] dark:p-1.5 dark:rounded-xl"
                            />
                        </div>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold tracking-[0.08em] uppercase text-[#111110] dark:text-[#eae9de]"
                    >
                        About Us
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-body text-sm sm:text-base text-[#656464] dark:text-[#babab0] max-w-2xl mx-auto mt-2 leading-relaxed font-light"
                    >
                        Adorn Your Story — Crafting Long-Lasting, Waterproof & Skin-Safe Jewellery For Everyday Elegance.
                    </motion.p>
                </header>

                {/* Subtle Divider */}
                <div className="w-full max-w-5xl mx-auto h-px bg-[#111110]/8 dark:bg-[#eae9de]/10 my-8 md:my-10" />

                {/* Split Section: Corporate/Brand Profile (Left) & Featured Suite (Right) */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center mb-20 md:mb-28">
                    {/* Left Column: Brand Story & Profile */}
                    <div className="lg:col-span-6 space-y-6">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold bg-[#f6f4ec] dark:bg-[#1f1f1d] text-[#6e5b44] dark:text-[#ead0b3] border border-[#6e5b44]/20">
                            <Sparkles size={12} />
                            <span>Brand Profile</span>
                        </div>

                        <h2 className="font-headline text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#111110] dark:text-[#eae9de] leading-[1.15]">
                            Timeless Jewellery for{' '}
                            <span className="text-[#6e5b44] dark:text-[#ead0b3]">
                                Modern Living & Daily Wear.
                            </span>
                        </h2>

                        <div className="space-y-4 font-body text-sm sm:text-base text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed">
                            <p>
                                <strong className="text-[#111110] dark:text-[#eae9de] font-semibold">SOVRA®</strong> is an Indian demi-fine jewellery brand founded in Udaipur, Rajasthan. We specialize in 18K gold-plated, anti-tarnish, waterproof, and hypoallergenic everyday jewellery. Established with a commitment to quality and honest pricing, we make long-lasting jewellery accessible to jewellery lovers across India.
                            </p>
                            <p>
                                With our studio and quality team based in Udaipur, SOVRA® has designed pieces you never have to take off — whether you are showering, working out, or celebrating special moments — without fading, rusting, or turning your skin green.
                            </p>
                        </div>

                        {/* Badges Row */}
                        <div className="flex flex-wrap items-center gap-2.5 pt-2">
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-body font-medium bg-white dark:bg-[#181816] text-[#4a4947] dark:text-[#d4d3cc] border border-[#111110]/8 dark:border-[#eae9de]/10 shadow-sm">
                                <MapPin size={13} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                                <span>Udaipur HQ (India)</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-body font-medium bg-white dark:bg-[#181816] text-[#4a4947] dark:text-[#d4d3cc] border border-[#111110]/8 dark:border-[#eae9de]/10 shadow-sm">
                                <Truck size={13} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                                <span>Pan India Delivery</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-body font-medium bg-white dark:bg-[#181816] text-[#4a4947] dark:text-[#d4d3cc] border border-[#111110]/8 dark:border-[#eae9de]/10 shadow-sm">
                                <CheckCircle2 size={13} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                                <span>18K Real Gold Plated</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-body font-medium bg-white dark:bg-[#181816] text-[#4a4947] dark:text-[#d4d3cc] border border-[#111110]/8 dark:border-[#eae9de]/10 shadow-sm">
                                <Droplets size={13} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                                <span>100% Anti-Tarnish</span>
                            </span>
                        </div>
                    </div>

                    {/* Right Column: Encapsulated 2x2 Showcase Card (Matching Reference Layout) */}
                    <div className="lg:col-span-6">
                        <div className="bg-white dark:bg-[#181816] rounded-3xl p-5 sm:p-6 border border-[#111110]/8 dark:border-[#eae9de]/10 shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
                            {/* Card Header Bar */}
                            <div className="flex items-center justify-between pb-3.5 border-b border-[#111110]/6 dark:border-[#eae9de]/8">
                                <div className="flex items-center gap-2 text-xs font-headline tracking-wider uppercase font-bold text-[#111110] dark:text-[#eae9de]">
                                    <span className="w-2 h-2 rounded-full bg-[#6e5b44] dark:text-[#ead0b3] bg-[#6e5b44]"></span>
                                    <span>Featured Jewellery Suite</span>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#f6f4ec] dark:bg-[#252522] text-[#6e5b44] dark:text-[#ead0b3] border border-[#6e5b44]/20">
                                    4 Featured Lineups
                                </span>
                            </div>

                            {/* 2x2 Products Grid */}
                            <div className="grid grid-cols-2 gap-3.5 my-4">
                                {lineups.map((item) => (
                                    <Link
                                        key={item._id || item.name}
                                        to={`/product/${item._id}`}
                                        className="bg-[#faf8f2] dark:bg-[#1f1f1d] rounded-2xl p-3 border border-[#111110]/5 dark:border-[#eae9de]/5 hover:border-[#6e5b44]/30 dark:hover:border-[#ead0b3]/30 transition-all group flex flex-col justify-between"
                                    >
                                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#f0eee6] dark:bg-[#262624] mb-2.5 flex items-center justify-center">
                                            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/85 text-white text-[8px] font-bold tracking-widest uppercase z-10">
                                                {item.category || 'JEWELLERY'}
                                            </span>
                                            <img
                                                src={getOptimizedImage(item.img, 450)}
                                                alt={item.name}
                                                loading="eager"
                                                decoding="async"
                                                onError={(e) => {
                                                    e.currentTarget.onerror = null
                                                    e.currentTarget.src = '/necklace_hero.png'
                                                }}
                                                className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div>
                                            <h4 className="font-headline text-xs sm:text-sm font-semibold text-[#111110] dark:text-[#eae9de] line-clamp-1 group-hover:text-[#6e5b44] dark:group-hover:text-[#ead0b3] transition-colors">
                                                {item.name}
                                            </h4>
                                            <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-[#111110]/5 dark:border-[#eae9de]/5">
                                                <span className="text-xs font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                                    {formatPrice(item.price)}
                                                </span>
                                                <span className="text-[10px] font-bold text-[#111110] dark:text-[#eae9de] group-hover:text-[#6e5b44] dark:group-hover:text-[#ead0b3] transition-colors flex items-center gap-0.5">
                                                    View →
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {/* Card Bottom Bar */}
                            <div className="bg-[#f6f4ec] dark:bg-[#252522] rounded-xl px-4 py-2.5 flex items-center justify-between text-[11px] font-body text-[#656464] dark:text-[#babab0]">
                                <span className="flex items-center gap-1.5 font-medium">
                                    <Sparkles size={13} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                                    <span>Quality Certified 18K PVD</span>
                                </span>
                                <span className="font-bold text-[#111110] dark:text-[#eae9de]">
                                    Official SOVRA®
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* What Makes Us Different (4 Clean Cards) */}
                <section className="mb-20 md:mb-24">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3] block mb-2">
                            — Why Customers Choose Us
                        </span>
                        <h3 className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-[#111110] dark:text-[#eae9de]">
                            Crafted For Everyday Confidence
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#181816] border border-[#111110]/6 dark:border-[#eae9de]/8 shadow-sm space-y-2.5">
                            <div className="w-10 h-10 rounded-xl bg-[#6e5b44]/10 dark:bg-[#ead0b3]/10 flex items-center justify-center text-[#6e5b44] dark:text-[#ead0b3]">
                                <Droplets size={20} strokeWidth={1.75} />
                            </div>
                            <h4 className="font-headline text-lg font-semibold text-[#111110] dark:text-[#eae9de]">
                                Waterproof & Sweat-Proof
                            </h4>
                            <p className="font-body text-xs md:text-sm text-[#656464] dark:text-[#babab0] leading-relaxed">
                                Our 18K gold layer is vacuum-bonded to stainless steel. It won&apos;t fade, rust, or tarnish when exposed to water, sweat, or perfumes.
                            </p>
                        </div>

                        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#181816] border border-[#111110]/6 dark:border-[#eae9de]/8 shadow-sm space-y-2.5">
                            <div className="w-10 h-10 rounded-xl bg-[#6e5b44]/10 dark:bg-[#ead0b3]/10 flex items-center justify-center text-[#6e5b44] dark:text-[#ead0b3]">
                                <ShieldCheck size={20} strokeWidth={1.75} />
                            </div>
                            <h4 className="font-headline text-lg font-semibold text-[#111110] dark:text-[#eae9de]">
                                Zero Green Skin
                            </h4>
                            <p className="font-body text-xs md:text-sm text-[#656464] dark:text-[#babab0] leading-relaxed">
                                100% nickel-free and hypoallergenic. Perfect for sensitive skin — no irritation, no rashes, and no green discoloration ever.
                            </p>
                        </div>

                        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#181816] border border-[#111110]/6 dark:border-[#eae9de]/8 shadow-sm space-y-2.5">
                            <div className="w-10 h-10 rounded-xl bg-[#6e5b44]/10 dark:bg-[#ead0b3]/10 flex items-center justify-center text-[#6e5b44] dark:text-[#ead0b3]">
                                <Tag size={20} strokeWidth={1.75} />
                            </div>
                            <h4 className="font-headline text-lg font-semibold text-[#111110] dark:text-[#eae9de]">
                                Fair Online Pricing
                            </h4>
                            <p className="font-body text-xs md:text-sm text-[#656464] dark:text-[#babab0] leading-relaxed">
                                We cut out high retail showroom rents and middleman commissions to give you genuine demi-fine luxury at honest, accessible prices.
                            </p>
                        </div>

                        <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#181816] border border-[#111110]/6 dark:border-[#eae9de]/8 shadow-sm space-y-2.5">
                            <div className="w-10 h-10 rounded-xl bg-[#6e5b44]/10 dark:bg-[#ead0b3]/10 flex items-center justify-center text-[#6e5b44] dark:text-[#ead0b3]">
                                <Heart size={20} strokeWidth={1.75} />
                            </div>
                            <h4 className="font-headline text-lg font-semibold text-[#111110] dark:text-[#eae9de]">
                                Hand-Checked in Udaipur
                            </h4>
                            <p className="font-body text-xs md:text-sm text-[#656464] dark:text-[#babab0] leading-relaxed">
                                Every single piece undergoes an individual quality check and careful packaging at our Udaipur atelier before it leaves for your home.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Studio & Contact Card */}
                <section className="bg-white dark:bg-[#181816] rounded-3xl p-6 sm:p-10 border border-[#111110]/8 dark:border-[#eae9de]/10 shadow-[0_4px_30px_rgba(0,0,0,0.03)] mb-14">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                        <div className="lg:col-span-5 space-y-2">
                            <span className="font-label text-[10px] uppercase tracking-widest font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — The Atelier
                            </span>
                            <h3 className="font-headline text-2xl sm:text-3xl font-bold text-[#111110] dark:text-[#eae9de]">
                                Our Studio & Team
                            </h3>
                            <p className="font-body text-xs md:text-sm text-[#656464] dark:text-[#babab0] leading-relaxed">
                                Feel free to reach out with any questions about our designs, sizing, or your orders.
                            </p>
                        </div>

                        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            <div className="p-4 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5">
                                <div className="flex items-center gap-2 mb-1.5 text-[#6e5b44] dark:text-[#ead0b3]">
                                    <MapPin size={15} />
                                    <span className="font-label text-[9px] uppercase tracking-widest font-bold">Studio</span>
                                </div>
                                <p className="font-body text-xs text-[#111110] dark:text-[#eae9de] leading-snug">
                                    23, Pulla Beside Platinum Square RK Circle, Udaipur-313001
                                </p>
                            </div>

                            <a
                                href="mailto:support@sovra.in"
                                className="p-4 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5 hover:border-[#6e5b44]/30 transition-colors group"
                            >
                                <div className="flex items-center gap-2 mb-1.5 text-[#6e5b44] dark:text-[#ead0b3]">
                                    <Mail size={15} />
                                    <span className="font-label text-[9px] uppercase tracking-widest font-bold">Email</span>
                                </div>
                                <p className="font-body text-xs font-semibold text-[#111110] dark:text-[#eae9de] group-hover:text-[#6e5b44] dark:group-hover:text-[#ead0b3] transition-colors truncate">
                                    support@sovra.in
                                </p>
                            </a>

                            <a
                                href="tel:9571746435"
                                className="p-4 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5 hover:border-[#6e5b44]/30 transition-colors group"
                            >
                                <div className="flex items-center gap-2 mb-1.5 text-[#6e5b44] dark:text-[#ead0b3]">
                                    <Phone size={15} />
                                    <span className="font-label text-[9px] uppercase tracking-widest font-bold">Phone</span>
                                </div>
                                <p className="font-body text-xs font-semibold text-[#111110] dark:text-[#eae9de] group-hover:text-[#6e5b44] dark:group-hover:text-[#ead0b3] transition-colors">
                                    9571746435
                                </p>
                            </a>
                        </div>
                    </div>
                </section>

                {/* Bottom CTA */}
                <div className="text-center">
                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#111110] dark:bg-[#eae9de] text-[#fffcf7] dark:text-[#111110] text-xs font-headline uppercase tracking-widest font-bold hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <span>Explore Our Jewellery Collection</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </main>
        </div>
    )
}

export default Story
