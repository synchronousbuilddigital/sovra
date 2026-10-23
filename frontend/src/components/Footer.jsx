import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className="bg-[#f6f4ec] dark:bg-[#1a1a18] w-full py-8 md:py-12 px-4 sm:px-6 md:px-12 mt-auto border-t border-outline-variant/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-7 md:gap-8 lg:gap-12 max-w-[1720px] mx-auto text-left font-body">
                {/* Brand Identity & Location */}
                <div className="col-span-2 md:col-span-1 space-y-3 pb-4 md:pb-0 border-b md:border-b-0 border-[#111110]/8 dark:border-[#eae9de]/8">
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 overflow-hidden rounded-xl bg-white dark:bg-[#252522] p-1 flex items-center justify-center border border-[#111110]/8 dark:border-[#eae9de]/10 shadow-xs shrink-0">
                            <img
                                src="/logo.jpg"
                                alt="SOVRA Logo"
                                className="w-16 h-16 max-w-none object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                        <div>
                            <span className="font-headline text-2xl sm:text-3xl md:text-4xl tracking-[0.08em] text-[#373831] dark:text-[#eae9de] uppercase block group-hover:text-[#6e5b44] dark:group-hover:text-[#ead0b3] transition-colors leading-none">
                                SOVRA
                            </span>
                            <span className="font-body text-[8.5px] sm:text-[9px] tracking-widest uppercase text-[#6e5b44] dark:text-[#ead0b3] font-bold block mt-1">
                                Adorn Your Story • Udaipur
                            </span>
                        </div>
                    </Link>
                    <p className="font-body text-[8.5px] md:text-[9.5px] tracking-wider uppercase leading-relaxed text-[#656464] dark:text-[#babab0] max-w-sm font-light opacity-80 pt-1">
                        Crafting timeless elegance for the modern soul. Inspired by the stars and forged at 23, Pulla Beside Platinum Square, RK Circle, Udaipur-313001.
                    </p>
                </div>

                {/* Explore Links */}
                <div className="col-span-1 flex flex-col gap-2 md:gap-3">
                    <h4 className="font-label text-[11px] md:text-xs tracking-widest uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3] mb-1">
                        Explore
                    </h4>
                    <Link className="text-[10px] md:text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] dark:hover:text-[#ead0b3] transition-colors font-medium" to="/about">
                        About Us
                    </Link>
                    <Link className="text-[10px] md:text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] dark:hover:text-[#ead0b3] transition-colors font-medium" to="/about">
                        SOVRA Story
                    </Link>
                </div>

                {/* Policies Links */}
                <div className="col-span-1 flex flex-col gap-2 md:gap-3">
                    <h4 className="font-label text-[11px] md:text-xs tracking-widest uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3] mb-1">
                        Policies
                    </h4>
                    <Link className="text-[10px] md:text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] dark:hover:text-[#ead0b3] transition-colors font-medium" to="/privacy-policy">
                        Privacy Policy
                    </Link>
                    <Link className="text-[10px] md:text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] dark:hover:text-[#ead0b3] transition-colors font-medium" to="/shipping-policy">
                        Shipping Policy
                    </Link>
                    <Link className="text-[10px] md:text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] dark:hover:text-[#ead0b3] transition-colors font-medium" to="/terms-of-service">
                        Terms Of Service
                    </Link>
                    <Link className="text-[10px] md:text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] dark:hover:text-[#ead0b3] transition-colors font-medium" to="/contact">
                        Contact Information
                    </Link>
                    <Link className="text-[10px] md:text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] dark:hover:text-[#ead0b3] transition-colors font-medium" to="/returns-policy">
                        Return & Exchange Policy
                    </Link>
                </div>

                {/* Journal / Socials */}
                <div className="col-span-2 md:col-span-1 flex flex-col gap-2 md:gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#111110]/6 dark:border-[#eae9de]/6">
                    <h4 className="font-label text-[11px] md:text-xs tracking-widest uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3] mb-1">
                        Journal
                    </h4>
                    <div className="flex flex-row md:flex-col gap-4 md:gap-3">
                        <Link className="text-[10px] md:text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] dark:hover:text-[#ead0b3] transition-colors font-medium" to="#">
                            Instagram
                        </Link>
                        <Link className="text-[10px] md:text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] dark:hover:text-[#ead0b3] transition-colors font-medium" to="#">
                            Pinterest
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Legal / Copyright Section */}
            <div className="mt-6 md:mt-10 pt-4 md:pt-6 border-t border-[#111110]/6 dark:border-[#eae9de]/6 flex flex-col md:flex-row justify-between items-center gap-3.5 md:gap-6 max-w-[1720px] mx-auto">
                <p className="font-label text-[9px] md:text-[10px] tracking-widest uppercase text-[#656464]/60 dark:text-[#babab0]/40 font-bold order-2 md:order-1 text-center md:text-left">
                    © 2024 SOVRA. ALL RIGHTS RESERVED.
                </p>
                <div className="flex flex-row gap-5 sm:gap-10 text-center items-center order-1 md:order-2">
                    <Link className="text-[9.5px] md:text-[10px] tracking-[0.18em] uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] dark:hover:text-[#ead0b3] transition-colors font-semibold" to="/privacy-policy">
                        Privacy Policy
                    </Link>
                    <span className="text-[#656464]/30 dark:text-[#babab0]/30 text-xs sm:hidden">•</span>
                    <Link className="text-[9.5px] md:text-[10px] tracking-[0.18em] uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] dark:hover:text-[#ead0b3] transition-colors font-semibold" to="/terms-of-service">
                        Terms & Conditions
                    </Link>
                </div>
            </div>
        </footer>
    )
}

export default Footer
