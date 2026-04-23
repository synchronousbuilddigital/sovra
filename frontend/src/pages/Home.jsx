import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { m } from 'framer-motion'
import EditorialHero from '../components/EditorialHero'
import { useShop } from '../context/ShopContext'
import { Heart } from 'lucide-react'
import { formatPrice } from '../utils/currency'
import { getOptimizedImage } from '../utils/imageUtils'
import api from '../utils/api'
import { Helmet } from 'react-helmet-async'

const NewsletterForm = () => {
// ... existing code ...
    const [email, setEmail] = React.useState('')
    const [status, setStatus] = React.useState('idle') // idle, submitting, success

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

    if (status === 'success') {
        return (
            <m.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
            >
                <span className="font-headline text-3xl italic text-primary block mb-4">Welcome to the Circle.</span>
                <p className="font-label text-[10px] kerning-widest uppercase opacity-60 italic">A confirmation has been sent to {email}</p>
            </m.div>
        )
    }

    return (
        <form className="flex flex-col gap-10 w-full" onSubmit={handleSubmit}>
            <div className="relative group max-w-md mx-auto w-full">
                <input
                    className="w-full bg-transparent border-0 border-b border-outline-variant/30 py-6 text-[11px] font-label kerning-widest focus:ring-0 focus:border-primary transition-all placeholder:text-outline/40 uppercase text-center hover:placeholder:text-primary/60 outline-none"
                    placeholder="YOUR EMAIL ADDRESS"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <div className="absolute bottom-0 left-0 h-[1px] bg-primary scale-x-0 group-hover:scale-x-100 group-focus-within:scale-x-100 transition-transform duration-700 origin-center"></div>
            </div>
            <div className="flex justify-center">
                <button
                    disabled={status === 'submitting'}
                    className="font-label text-[11px] kerning-widest uppercase text-primary border border-primary/30 px-16 md:px-24 py-5 md:py-6 hover:bg-primary hover:text-on-primary transition-all duration-[1200ms] ease-[cubic-bezier(0.19,1,0.22,1)] shadow-sm hover:shadow-xl disabled:opacity-50"
                >
                    {status === 'submitting' ? 'Processing...' : 'Request Access'}
                </button>
            </div>
        </form>
    )
}

const Home = () => {
    const { addToWishlist, removeFromWishlist, wishlist } = useShop()
    const isWishlisted = (id) => wishlist.some(item => item._id === id || item === id)

    const toggleWishlist = (e, id) => {
        e.preventDefault()
        e.stopPropagation()
        if (isWishlisted(id)) {
            removeFromWishlist(id)
        } else {
            addToWishlist(id)
        }
    }
    useEffect(() => {
        const observerOptions = { threshold: 0.1 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const featuredWorks = [
        {
            id: 1,
            title: "Astral Bangle Stack",
            tag: "Bangle Stack",
            specs: "18k Gold & Engraved Diamonds",
            price: 4500,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDP9sY5kV-iT2L0PsRLnDMUX_fNnJVPEPVKmBPfYFNCLKimMzo6yeR-GZj2py7XVplxHlFe9yidum3dNTDPb_cIBc0YCp78mAUFAEC84qC-vaw5ShD2kSjpMqI3StA5AFN7HzbsyMocDpgWh11Kk6CMgSn1NcNjgCRV5OdwW2NpoZPA2M30ZgVHNwmp3zM3qaTg-Qk9PMxX-zYrX5zfAdo7hiYwnpOViwwTXktlgHACKT-FjpiYLBA0slioAv-e7aeRcgfmNy30T3sZ"
        },
        {
            id: 2,
            title: "Solstice Sunburst",
            tag: "Sunburst Necklace",
            specs: "18k Solid Gold & Brilliant Diamond",
            price: 2100,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBv9_mVnLSdhf6SKw5pIeTcYIvJXoOVoSa3qX3Fbfwt7dcHmW79gcV-3lACiTAMsFuMPhTLN7iT1UvcGV6unWAXJzBmsLWHtD0xKd2wi8WUHB4rhedHLKd4EbgqUxag1Kj2te7n9rgHRaSOdu7zeQfwnR4vYLs8bGvJ1xaqDiVyO5oX7GCdOY8QAxZpNJeskhYjfpiBwwlQLeDQatcAatJ8eT85s48qrZI2QAvi1qLGZx3XDXh2gor68pmQ7382lMBdZA7OT3SGPKm0"
        },
        {
            id: 3,
            title: "Celestial Star Drops",
            tag: "Star Drops",
            specs: "18k Gold, Opal & Diamond",
            price: 1850,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBe1TJaSxbCjPeBOwrYEK4VNhCj-0xVe78ZJaC6QgYI1qtnh7AF-fmFo-fXuETFNZ8pUM9n_qWsO3AfMtvCn5uHlMypBEi0GIlopHr49Lbm7R7-2ucWwE0tXurU45Z1x2xiTWYIOA4JaFRxrx5DXIgdEnPkvmGsduNUPoS-gzKudmNiD0SGQGWYcmUzYT949bg4vDSrdZUPTkL2eyYWliaU7pQR5wVb0DOIjGHdSEy1KClZcrKhBHZ__FJc0xszjO4TqTLJxp0L86VE"
        }

    ]

    return (
        <div className="bg-surface selection:bg-primary/10 font-body">
            <Helmet>
                <title>SOVRA | Fine Jewellery Archive & Ethereal Vision</title>
                <meta name="description" content="Discover SOVRA, where ancestral craftsmanship meets ethereal vision. Explore our curated archive of fine jewellery born from the golden silence of the Aravalli hills." />
                <meta property="og:title" content="SOVRA | Fine Jewellery Archive" />
                <meta property="og:description" content="Ancestral craftsmanship meets ethereal vision. Explore the SOVRA archive." />
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://sovra-topaz.vercel.app/" />
            </Helmet>
            <EditorialHero />

            {/* Manifesto Section */}
            <section className="py-20 px-8">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center gap-16 scroll-reveal text-on-surface">
                    <div className="w-full md:w-1/3 flex justify-center">
                        <div className="w-32 h-[1px] bg-primary/30 rotate-90 md:rotate-0"></div>
                    </div>
                    <div className="w-full md:w-2/3">
                        <span className="font-headline italic text-2xl text-primary mb-6 block opacity-70">The SOVRA</span>
                        <h2 className="font-headline text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.1] mb-8 font-light">Poetry in Metal & Stone</h2>
                        <p className="font-body text-2xl leading-relaxed text-secondary-dim font-light italic max-w-2xl">
                            "Born from the golden silence of the Aravalli hills, SOVRA represents the intersection of ancestral craftsmanship and ethereal vision. Every piece is a whispered secret between the artisan and the earth."
                        </p>
                    </div>
                </div>
            </section>

            {/* Curated Gallery Grid */}
            <section className="pb-20 px-8 md:px-16">
                <div className="max-w-[1720px] mx-auto">
                    <div className="flex justify-between items-baseline mb-12 scroll-reveal">
                        <h3 className="font-headline text-5xl font-light">The Archive</h3>
                        <Link to="/shop" className="font-label text-[11px] kerning-widest uppercase border-b border-primary/20 pb-2 hover:border-primary transition-all duration-500">Explore All Masterpieces</Link>
                    </div>
                    <div className="grid grid-cols-12 gap-8 lg:gap-16 items-stretch">
                        {/* Rings Category */}
                        <m.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="col-span-12 md:col-span-4 flex flex-col h-full relative"
                        >
                            <Link to="/shop/rings" className="relative group overflow-hidden bg-surface-container aspect-[3/4.5] shadow-lux-sm hover:shadow-lux transition-all duration-700">
                                <m.div
                                    animate={{
                                        y: [0, -10, 0],
                                    }}
                                    transition={{
                                        duration: 6,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="w-full h-full"
                                >
                                    <img alt="Rings" loading="lazy" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" src={getOptimizedImage("https://lh3.googleusercontent.com/aida-public/AB6AXuAkXJLhnNmK6xvBpC0QYgMtgFm4EjXPbd1mChYNGxRizSftvUBqJpKAY_ZDce4SNeaccK64kFO5_5Yv_nbMHt52UZRQ1oRTgfv1My8JfbfFCwc6WxDGYLK-7gfr89S19Du1aYqUAsw0g5QaPy2AjEHLkuoglqa6550Cb6iw1G6VFS_a6GiN5lpBApPlJ1aVRiyuin5AtoszSKQ7gTXXMf_fzoAxHctQnZcxr13MiwUAjTFt7h-_H1nsd9cu3yf6_4Adm9Fnx7VIwHhb")} />
                                </m.div>
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                                {/* Decorative 2D SVG Animation */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-40" viewBox="0 0 100 100">
                                    <m.circle
                                        cx="50" cy="50" r="45"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="0.1"
                                        className="text-primary"
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        whileInView={{ pathLength: 1, opacity: 1 }}
                                        transition={{ duration: 2, ease: "easeInOut" }}
                                    />
                                </svg>
                            </Link>
                            <div className="mt-auto pt-4 space-y-4">
                                <div className="flex justify-between items-baseline px-1">
                                    <h4 className="font-headline text-2xl italic text-primary leading-none">The Circle</h4>
                                    <span className="font-label text-[10px] kerning-widest uppercase opacity-40">12 Pieces</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-black/5 pt-4 px-1">
                                    <span className="font-label text-[9px] kerning-widest uppercase text-secondary font-bold">Collection Alpha</span>
                                    <span className="font-label text-[9px] kerning-widest uppercase text-secondary">Masterpiece</span>
                                </div>
                            </div>
                        </m.div>

                        {/* Earrings Category */}
                        <div className="col-span-12 md:col-span-4 flex flex-col h-full scroll-reveal" style={{ transitionDelay: '0.1s' }}>
                            <Link to="/shop/earrings" className="relative group overflow-hidden bg-surface-container aspect-[3/4.5]">
                                <img alt="Earrings" loading="lazy" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" src={getOptimizedImage("https://lh3.googleusercontent.com/aida-public/AB6AXuBe1TJaSxbCjPeBOwrYEK4VNhCj-0xVe78ZJaC6QgYI1qtnh7AF-fmFo-fXuETFNZ8pUM9n_qWsO3AfMtvCn5uHlMypBEi0GIlopHr49Lbm7R7-2ucWwE0tXurU45Z1x2xiTWYIOA4JaFRxrx5DXIgdEnPkvmGsduNUPoS-gzKudmNiD0SGQGWYcmUzYT949bg4vDSrdZUPTkL2eyYWliaU7pQR5wVb0DOIjGHdSEy1KClZcrKhBHZ__FJc0xszjO4TqTLJxp0L86VE")} />
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                            </Link>
                            <div className="mt-auto pt-4 space-y-4">
                                <div className="flex justify-between items-baseline px-1">
                                    <h4 className="font-headline text-2xl italic text-primary leading-none">Earrings</h4>
                                    <span className="font-label text-[10px] kerning-widest uppercase opacity-40">08 Pieces</span>
                                </div>
                                <div className="flex justify-between items-center border-t border-black/5 pt-4 px-1">
                                    <span className="font-label text-[9px] kerning-widest uppercase text-secondary font-bold">Ornaments</span>
                                    <span className="font-label text-[9px] kerning-widest uppercase text-secondary">Signature</span>
                                </div>
                            </div>
                        </div>

                        {/* Combined Column - Necklaces & Bracelets */}
                        <div className="col-span-12 md:col-span-4 flex flex-col justify-between gap-6 scroll-reveal" style={{ transitionDelay: '0.2s' }}>
                            {/* Necklaces */}
                            <m.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="flex flex-col group relative"
                            >
                                <Link to="/shop/necklaces" className="relative group overflow-hidden bg-surface-container aspect-[16/9] shadow-lux-sm hover:shadow-lux transition-all duration-700">
                                    <m.div
                                        animate={{
                                            scale: [1, 1.05, 1],
                                        }}
                                        transition={{
                                            duration: 10,
                                            repeat: Infinity,
                                            ease: "linear"
                                        }}
                                        className="w-full h-full"
                                    >
                                        <img alt="Necklaces" loading="lazy" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110" src={getOptimizedImage("https://lh3.googleusercontent.com/aida-public/AB6AXuBv9_mVnLSdhf6SKw5pIeTcYIvJXoOVoSa3qX3Fbfwt7dcHmW79gcV-3lACiTAMsFuMPhTLN7iT1UvcGV6unWAXJzBmsLWHtD0xKd2wi8WUHB4rhedHLKd4EbgqUxag1Kj2te7n9rgHRaSOdu7zeQfwnR4vYLs8bGvJ1xaqDiVyO5oX7GCdOY8QAxZpNJeskhYjfpiBwwlQLeDQatcAatJ8eT85s48qrZI2QAvi1qLGZx3XDXh2gor68pmQ7382lMBdZA7OT3SGPKm0")} />
                                    </m.div>
                                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                                    {/* Decorative 2D SVG Line Animation */}
                                    <svg className="absolute bottom-0 left-0 w-full h-12 pointer-events-none opacity-30" viewBox="0 0 100 20">
                                        <m.path
                                            d="M0 10 Q 25 2, 50 10 T 100 10"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="0.2"
                                            className="text-primary"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                        />
                                    </svg>
                                </Link>
                                <div className="mt-4 mb-2 space-y-3">
                                    <div className="flex justify-between items-baseline px-1">
                                        <h4 className="font-headline text-2xl italic text-primary leading-none">Necklaces</h4>
                                        <span className="font-label text-[10px] kerning-widest uppercase opacity-40">15 Pieces</span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-black/5 pt-3 px-1">
                                        <span className="font-label text-[9px] kerning-widest uppercase text-secondary font-bold">Necklines</span>
                                        <Link to="/shop/necklaces" className="material-symbols-outlined text-xs opacity-40 group-hover:opacity-100 transition-opacity">arrow_forward</Link>
                                    </div>
                                </div>
                            </m.div>

                            {/* Bracelets */}
                            <div className="flex flex-col group mt-auto">
                                <Link to="/shop/bracelets" className="relative group overflow-hidden bg-surface-container aspect-[16/9] shadow-lux-sm">
                                    <img alt="Bracelets" loading="lazy" className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" src="/bracelet_hero.png" />
                                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                </Link>
                                <div className="mt-4 space-y-3">
                                    <div className="flex justify-between items-baseline px-1">
                                        <h4 className="font-headline text-2xl italic text-primary leading-none">Bracelets</h4>
                                        <span className="font-label text-[10px] kerning-widest uppercase opacity-40">10 Pieces</span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-black/5 pt-3 px-1">
                                        <span className="font-label text-[9px] kerning-widest uppercase text-secondary font-bold">Cuffs</span>
                                        <Link to="/shop/bracelets" className="material-symbols-outlined text-xs opacity-40 group-hover:opacity-100 transition-opacity">arrow_forward</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Systematic Selected Works Showcase */}
            <section className="py-24 bg-surface-container-low/30 overflow-hidden">
                <div className="max-w-[1720px] mx-auto px-8 md:px-16">
                    <div className="text-center mb-16 scroll-reveal">
                        <span className="font-label text-[11px] kerning-widest uppercase text-secondary mb-6 block">Masterwork Showcase</span>
                        <h2 className="font-headline text-6xl md:text-7xl font-light tracking-tight italic text-primary">Ethereal Essentials</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
                        {featuredWorks.map((work, index) => (
                            <div key={work.id} className="group flex flex-col scroll-reveal" style={{ transitionDelay: `${index * 0.15}s` }}>
                                <Link to="/shop" className="relative aspect-[3/4] overflow-hidden mb-8 bg-white shadow-lux-sm group-hover:shadow-lux transition-all duration-[1s]">
                                    <img alt={work.title} loading="lazy" className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 group-hover:scale-105 transition-transform duration-[1s]" src={getOptimizedImage(work.image, 800)} />
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>

                                    {/* Heart Button for Wishlist */}
                                    <button
                                        onClick={(e) => toggleWishlist(e, work.id)}
                                        className="absolute top-8 right-8 p-4 bg-white/20 backdrop-blur-md border border-white/10 rounded-full shadow-lg z-20 transition-all hover:scale-110"
                                    >
                                        <Heart
                                            size={16}
                                            className={`${isWishlisted(work.id) ? 'fill-red-500 text-red-500' : 'text-white/60 group-hover:text-white'}`}
                                            strokeWidth={2}
                                        />
                                    </button>

                                    {/* Hover Overlay Button */}
                                    <div className="absolute inset-0 flex items-center justify-center translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                                        <div className="bg-primary text-on-primary px-16 py-6 text-[10px] kerning-widest uppercase font-label tracking-[0.3em] font-black shadow-lux">Details</div>
                                    </div>
                                </Link>

                                <div className="space-y-4 px-2">
                                    <div className="flex justify-between items-start border-b border-black/5 pb-4 min-h-[5.5rem]">
                                        <h4 className="font-headline text-2xl italic font-light text-primary pr-4">{work.title}</h4>
                                        <span className="font-label text-[10px] text-primary kerning-widest font-black uppercase whitespace-nowrap pt-2">{formatPrice(work.price)}</span>

                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-label text-[11px] text-primary tracking-[0.2em] uppercase font-bold">{work.tag}</span>
                                        <span className="font-body text-[11px] opacity-60 italic">{work.specs}</span>
                                    </div>
                                    <Link to="/shop" className="inline-block font-label text-[9px] kerning-widest uppercase border-b border-primary/20 pb-1 hover:border-primary transition-all font-bold opacity-60 hover:opacity-100 pt-4">View Collection</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Newsletter Subscription */}
            <section className="py-24 relative group overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#f8dec1_0%,transparent_70%)] opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
                <div className="max-w-[800px] mx-auto text-center px-8 relative z-10 scroll-reveal">
                    <h2 className="font-headline text-4xl md:text-5xl mb-8 font-light italic text-primary">The Inner Circle</h2>
                    <p className="font-body text-secondary-dim text-[10px] md:text-[11px] kerning-widest uppercase mb-12 opacity-80 leading-loose">
                        A sanctuary for connoisseurs. Be the first to witness new collections<br className="hidden md:block" />and read our seasonal SOVRA journal.
                    </p>

                    <div className="min-h-[200px] flex items-center justify-center">
                        <NewsletterForm />
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home
