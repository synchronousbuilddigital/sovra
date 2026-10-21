import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className="bg-[#f6f4ec] dark:bg-[#1a1a18] w-full py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-12 mt-auto border-t border-outline-variant/10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-7 md:gap-12 max-w-[1720px] mx-auto text-left font-body">
                {/* Brand Identity & Location */}
                <div className="col-span-2 md:col-span-1 space-y-2.5 md:space-y-4 pb-4 md:pb-0 border-b md:border-b-0 border-[#111110]/8 dark:border-[#eae9de]/8">
                    <span className="font-headline text-4xl sm:text-6xl md:text-8xl tracking-[0.06em] md:tracking-[0.1em] text-[#373831] dark:text-[#eae9de] uppercase block -ml-0.5 md:-ml-1">
                        SOVRA
                    </span>
                    <p className="font-body text-[9.5px] md:text-[10px] tracking-widest uppercase leading-[1.6] text-[#6e5b44] dark:text-[#babab0] max-w-xs font-bold">
                        Adorn Your Story • Tuscan SOVRA
                    </p>
                    <p className="font-body text-[8.5px] md:text-[9px] tracking-wider uppercase leading-relaxed text-[#656464] dark:text-[#babab0] max-w-sm font-light opacity-80 pt-1 md:pt-4">
                        Crafting timeless elegance for the modern soul. Inspired by the stars and forged at 23, Pulla Beside Platinum Square, RK Circle, Udaipur-313001.
                    </p>
                </div>

                {/* Explore Links */}
                <div className="col-span-1 flex flex-col gap-2.5 md:gap-6">
                    <h4 className="font-label text-[11px] md:text-xs tracking-widest uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                        Explore
                    </h4>
                    <Link className="text-[10px] md:text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] transition-colors font-semibold md:font-bold" to="/story">
                        About Us
                    </Link>
                    <Link className="text-[10px] md:text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] transition-colors font-semibold md:font-bold" to="/story">
                        SOVRA Story
                    </Link>
                </div>

                {/* Assistance Links */}
                <div className="col-span-1 flex flex-col gap-2.5 md:gap-6">
                    <h4 className="font-label text-[11px] md:text-xs tracking-widest uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                        Assistance
                    </h4>
                    <Link className="text-[10px] md:text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] transition-colors font-semibold md:font-bold" to="/faq">
                        F.A.Q.
                    </Link>
                    <Link className="text-[10px] md:text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] transition-colors font-semibold md:font-bold" to="/policies">
                        Shipping & Returns
                    </Link>
                    <Link className="text-[10px] md:text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] transition-colors font-semibold md:font-bold" to="/size-guide">
                        Size Guide
                    </Link>
                    <Link className="text-[10px] md:text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] transition-colors font-semibold md:font-bold" to="/contact">
                        Contact
                    </Link>
                </div>

                {/* Journal / Socials */}
                <div className="col-span-2 md:col-span-1 flex flex-col gap-2.5 md:gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-[#111110]/6 dark:border-[#eae9de]/6">
                    <h4 className="font-label text-[11px] md:text-xs tracking-widest uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                        Journal
                    </h4>
                    <div className="flex flex-row md:flex-col gap-5 md:gap-6">
                        <Link className="text-[10px] md:text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] transition-colors font-semibold md:font-bold" to="#">
                            Instagram
                        </Link>
                        <Link className="text-[10px] md:text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] transition-colors font-semibold md:font-bold" to="#">
                            Pinterest
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Legal / Copyright Section */}
            <div className="mt-8 md:mt-20 pt-5 md:pt-8 border-t border-[#111110]/6 dark:border-[#eae9de]/6 flex flex-col md:flex-row justify-between items-center gap-3.5 md:gap-6 max-w-[1720px] mx-auto">
                <p className="font-label text-[9px] md:text-[10px] tracking-widest uppercase text-[#656464]/60 dark:text-[#babab0]/40 font-bold order-2 md:order-1 text-center md:text-left">
                    © 2024 SOVRA. ALL RIGHTS RESERVED.
                </p>
                <div className="flex flex-row gap-5 sm:gap-10 text-center items-center order-1 md:order-2">
                    <Link className="text-[9.5px] md:text-[10px] tracking-[0.18em] uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] transition-colors font-semibold md:font-bold" to="/privacy-policy">
                        Privacy Policy
                    </Link>
                    <span className="text-[#656464]/30 dark:text-[#babab0]/30 text-xs sm:hidden">•</span>
                    <Link className="text-[9.5px] md:text-[10px] tracking-[0.18em] uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] transition-colors font-semibold md:font-bold" to="/terms-of-service">
                        Terms & Conditions
                    </Link>
                </div>
            </div>
        </footer>
    )
}

export default Footer
