import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const Story = () => {
    useEffect(() => {
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className="bg-surface text-on-surface antialiased overflow-x-hidden selection:bg-primary-container selection:text-on-primary-container">
            <main>
                {/* Hero Section - The Legacy */}
                <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <img
                            alt="Crafting process"
                            className="w-full h-full object-cover filter brightness-[0.7] contrast-[1.1]"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAzBEPON0VvXFr2osNYft9QkA83WUikiuNKL7Vjo1aUliuf486yp9Uey1s7TVQNQvwL9ptGqppp_K78wZeBvclegCwhMU1I6Vcdw48JQfResUQJevmWf3rA5y-2e3MywXx1Yp4GlYrRW_1cONdZgcabUtnVdWXpcwzZ1kJMahh5W2hswYJQWKoOwmG77jBHkrzdC4B8kRLqnKNEzn_kgIhToCcgYns7XvJMzk9sncQNtWnRN4JAV-G4YWPkOT2W6I8j0TpNoAUdci7"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface/40"></div>
                    </div>
                    <div className="relative z-10 text-center px-4">
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="font-sans uppercase tracking-[0.6em] text-xs mb-8 text-on-primary font-bold opacity-80"
                        >
                            Established 1924
                        </motion.p>
                        <motion.h1
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="font-headline text-[clamp(3.5rem,12vw,10rem)] leading-none -tracking-[0.03em] text-on-primary italic font-light"
                        >
                            The Sovra Legacy
                        </motion.h1>
                    </div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ delay: 2 }}
                        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-6"
                    >
                        <span className="font-label text-[9px] uppercase tracking-[0.4em] text-on-primary/60 font-bold">The Heritage</span>
                        <div className="w-px h-24 bg-gradient-to-b from-primary/60 to-transparent"></div>
                    </motion.div>
                </section>

                {/* The Philosophy - The Ethereal Curator */}
                <section className="bg-surface py-32 px-6 md:px-24 overflow-hidden">
                    <div className="max-w-7xl mx-auto grid grid-cols-12 gap-10">
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="col-span-12 lg:col-span-8 lg:col-start-3 text-center space-y-12"
                        >
                            <h2 className="font-headline text-5xl md:text-7xl mb-8 text-on-surface leading-tight italic font-light">
                                The Ethereal Curator: <br />Where ancient technique meets modern vision.
                            </h2>
                            <div className="font-body text-xl md:text-2xl leading-relaxed space-y-10 text-secondary font-light italic">
                                <p>We do not merely create jewellery; we curate moments of light. At the heart of Sovra lies the concept of the "Ethereal Curator"—a philosophy that views every gemstone not as a product, but as a celestial fragment waiting to be released through the hands of a master.</p>
                                <p>Our vision is born from the intersection of ancestral craftsmanship and contemporary clarity. We believe that true luxury is quiet, felt through the weight of hand-forged gold and the precision of a cut that honors the stone's natural soul.</p>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Heritage & Generations - Timeline */}
                <section className="bg-surface-container-low py-32 overflow-hidden border-y border-outline-variant/10">
                    <div className="max-w-[1720px] mx-auto px-6 md:px-24 flex flex-col lg:flex-row items-center gap-16 md:gap-24">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="w-full lg:w-1/2 relative"
                        >
                            <div className="absolute -top-16 -left-16 w-64 h-64 bg-primary/5 -z-10 rounded-full blur-3xl"></div>
                            <img
                                alt="SOVRA London"
                                className="w-full aspect-[4/5] object-cover grayscale brightness-90 shadow-2xl transition-all duration-[3s] hover:grayscale-0"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUWQHZ982rZ6JgLQwdyd1woQhDp8OnmFrrktrGOVVhpAE_ePKgT_voBpiMTMKBM1Xgq4ApKuQr9lSUFaxQry6zGnPBd5h9KB28PK_wbx7ohuw6K566qHIgVt26NrjaKCgtSOyg2vIW7Hi89kCfAZ6C9CG_UEwZWlorJIHDKvVd7YplmNOdyyU7iSZo9DrOdbyWIVxLg_ps6gMuuAHkhOGjE-e8gxejdxPxAmRmnh9gto97inL_P_2pEzEZCzNBa3rKJuZmIbUx99xI"
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.5 }}
                                className="absolute bottom-12 -right-12 p-10 bg-white/90 backdrop-blur-xl max-w-sm hidden md:block shadow-lux border border-outline-variant/5"
                            >
                                <p className="font-headline text-[1.1rem] italic leading-relaxed text-on-surface">"In the heart of Udaipur, our story began with a single hammer and a vision of perfection."</p>
                                <div className="mt-4 w-12 h-px bg-primary"></div>
                            </motion.div>
                        </motion.div>

                        <div className="w-full lg:w-1/2 space-y-12">
                            <div className="space-y-6">
                                <span className="font-label uppercase tracking-[0.4em] text-[10px] text-primary font-bold">Generations of Excellence</span>
                                <h2 className="font-headline text-6xl text-on-surface font-light italic">Udaipur, 2026</h2>
                            </div>

                            <div className="space-y-10 border-l border-outline-variant/20 pl-12 relative">
                                {[
                                    { year: '1924', title: 'The Founding', desc: 'Lucien Sovra opens his first SOVRA, blending classical artisan techniques with experimental aesthetics.', active: true },
                                    { year: '1958', title: 'The Expansion', desc: 'Under Marcelle Sovra, the brand becomes a synonym for "Modern Baroque," captivating the elite of the city.', active: false },
                                    { year: '2024', title: 'The New Era', desc: 'Today, led by the third generation, we continue to push the boundaries of conscious luxury and digital artistry.', active: false }
                                ].map((item, idx) => (
                                    <motion.div
                                        key={item.year}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.2 }}
                                        className="relative"
                                    >
                                        <div className={`absolute -left-[53px] top-1.5 w-4 h-4 shadow-sm border border-white ${item.active ? 'bg-primary' : 'bg-outline-variant/30'}`}></div>
                                        <h3 className="font-headline text-3xl mb-4 italic font-light">{item.title}</h3>
                                        <p className="font-body text-lg text-secondary leading-relaxed font-light italic">{item.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Artisanal Craftsmanship (The SOVRA Experience) */}
                <section className="bg-surface py-32 px-6 md:px-24">
                    <div className="max-w-[1720px] mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12 text-center md:text-left">
                            <h2 className="font-headline text-6xl md:text-8xl leading-none italic font-light">The SOVRA Experience</h2>
                            <p className="max-w-md font-body text-xl text-secondary font-light italic leading-relaxed opacity-70">
                                Every piece is hand-forged in our private sanctuary, where time is the most valuable material.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                            {[
                                { title: 'The Precision', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBp0KqqkSBWYfglRf4jHIxJos2FwrQovp84vIkruLxmKFO30xGw_tuMROykyTebNeXW_1tk1kAOnxTQXsOmgD7pFl2vhFsp-Vg7QKhiYPCvgj2_pOmLx8vmByGzFwO2DUKQLrTBp4DUOe3jp2XlAK9u17j8Ef7qA9kANaYZPvplGdbsWMN_gQHXcTESNC2TLkFySUSOYIwj0xrYE4c71CSI46FtvWkRA_nonpIT4TIiN1VECEhO39TUAPxNwi_DhRK0KoVXbH76N9Se' },
                                { title: 'The Fire', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDEjALVWm4p5jouHDcrYQPdkHC6XVGpjcCStcm2psVHc0rDwrU9FBQCxwpfQNIyLovKQd8BruI3RAJKIrv4jiCv6TxKJZhJivZUgpw2fbfakw1o-FbrEteR1Sgf3ggW1BLw9Q-ZJJFsQOGCSvH6o4b7M_KBNr8jkuuR2k50vpLRRQF-H3fON_AfBzVnKGmWjKNQh6EfqDRnwhYWpsCk_f3CSfayOMSfFR5uoRjoPh0QenW9qtGV7AtouLWj5bXgSt73OcjFQwqu1JO3', offset: true },
                                { title: 'The Soul', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmIlTM8FoDtoXjLUEiVJlTIK94UOo0zZzE7tjv6kKSRe3FBISr2Z7Sk42R0v6NyTfAqUdollJ6DXvd7l1CB_okKT8LZxPaBJ_YRRMjTgSjL1JEAo28aGmzzboo1ZkhonX3q40q_duYUCU71Kp0OflEoErUU1oreV7hD1ThoCazACpeJ28kZOw4-mybRuTsLx5KJB24Ob7W3l3xk2QPRK4k8Jv5c7j3zGWnXnK8Og1I3Hs--H-JeQh7tLpz5lpPCGKtBHBAJ-ueJKNm' }
                            ].map((card, idx) => (
                                <motion.div
                                    key={card.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.2 }}
                                    className={`group relative overflow-hidden h-[700px] shadow-sm ${card.offset ? 'md:-translate-y-16' : ''}`}
                                >
                                    <img
                                        alt={card.title}
                                        className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105"
                                        src={card.img}
                                    />
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-1000 flex flex-col justify-center items-center text-center p-8 backdrop-blur-[2px]">
                                        <p className="font-headline text-3xl text-on-primary italic font-light">{card.title}</p>
                                        <div className="w-16 h-px bg-on-primary/60 mt-6"></div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Conscious Luxury - Tonal Statement */}
                <section className="bg-on-surface text-surface py-32 px-12 text-center">
                    <div className="max-w-4xl mx-auto space-y-10">
                        <motion.span
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 0.6 }}
                            className="font-label uppercase tracking-[0.5em] text-[10px] font-bold"
                        >
                            Ethical Vision
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            className="font-headline text-5xl md:text-7xl italic font-light leading-tight"
                        >
                            Conscious Luxury
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 0.8 }}
                            className="font-body text-xl md:text-2xl leading-relaxed italic font-light opacity-80"
                        >
                            We believe that beauty cannot exist without integrity. Every diamond and gemstone in a Sovra piece is sourced through strictly audited, conflict-free channels. Our gold is recycled and refined within our own workshop to ensure its journey is as pure as its final form.
                        </motion.p>
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            className="pt-10"
                        >
                            <Link to="/ethics" className="inline-block border-b border-primary/40 pb-2 font-label uppercase tracking-[0.5em] text-xs font-bold transition-all hover:text-primary hover:border-primary">
                                Our Transparency Report
                            </Link>
                        </motion.div>
                    </div>
                </section>

                {/* The Visionaries - Directing Grace */}
                <section className="bg-surface py-32 px-6 md:px-24">
                    <div className="max-w-[1720px] mx-auto flex flex-col lg:flex-row gap-20 items-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="w-full lg:w-2/5 shadow-2xl relative"
                        >
                            <img
                                alt="Creative Director"
                                className="w-full aspect-[3/4] object-cover grayscale brightness-105 contrast-[1.05]"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMxwul1oMpHpZEbw9y4nc26qZd8kIIqwmMCG1m0YRii4o8Nv8FnblR4g7cK-gUhUEWmYX0_K5k46b82shrC_KF3yVrxgv6KTHeFJUE5hvhzkR-wvBFS6RydUhynwllkYnu7wNCLjuioq8nYfFaC1W6LH12LqR13JnRodcbFZ1z-nHZ_mk47ArusBuJ6jVqy0n98otEgCsM-lvnbl3WsLGXSGd3iQCjL5O_6-LTnXtCii69FvjYXAn2UWE1bTzWFW5RggA9eZKFeD0s"
                            />
                            <div className="absolute inset-0 border-[20px] border-white/10 pointer-events-none"></div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="w-full lg:w-3/5 space-y-12"
                        >
                            <div className="space-y-4">
                                <h2 className="font-headline text-7xl text-primary font-light italic">sir</h2>
                                <p className="font-label uppercase tracking-[0.4em] text-[10px] text-outline font-bold">Creative Director & Lead Curator</p>
                            </div>
                            <div className="font-headline text-3xl md:text-4xl leading-relaxed italic text-secondary font-light max-w-2xl border-l-[3px] border-primary/20 pl-12 py-4">
                                "Jewellery is the most intimate form of art. It rests against the skin, absorbs the warmth of the wearer, and carries their story through time. My role is simply to ensure that story is told with the utmost grace."
                            </div>
                            <Link to="/shop" className="inline-block bg-primary text-on-primary px-16 py-6 font-label uppercase tracking-[0.4em] text-xs font-bold shadow-lux hover:bg-primary-dim transition-all duration-700">
                                Discover the Collections
                            </Link>
                        </motion.div>
                    </div>
                </section>
            </main>
        </div>
    )
}

export default Story
