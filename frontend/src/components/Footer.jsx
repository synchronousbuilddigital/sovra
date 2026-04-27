import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className="bg-[#f6f4ec] dark:bg-[#1a1a18] w-full py-12 md:py-16 px-6 md:px-12 mt-auto border-t border-outline-variant/10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 max-w-[1720px] mx-auto text-left font-body">
                <div className="space-y-4">
                    <span className="font-headline text-6xl sm:text-7xl md:text-8xl tracking-[0.1em] text-[#373831] dark:text-[#eae9de] uppercase block -ml-1">SOVRA</span>
                    <p className="font-body text-[10px] tracking-widest uppercase leading-[1.6] text-[#6e5b44] dark:text-[#babab0] max-w-xs font-bold">
                        Adorn Your Story • Tuscan SOVRA
                    </p>
                    <p style={{fontSize: '9px'}} className="font-body tracking-widest uppercase leading-[1.8] text-[#656464] dark:text-[#babab0] max-w-sm font-light opacity-80 pt-4">
                        Crafting timeless elegance for the modern soul. Inspired by the stars and forged at 23, Pulla Beside Platinum Square, RK Circle, Udaipur-313001.
                    </p>
                </div>

                <div className="flex flex-col gap-6">
                    <h4 className="font-label text-xs tracking-widest uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">Explore</h4>
                    <Link className="text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] transition-colors font-bold" to="/story">About Us</Link>
                    <Link className="text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] transition-colors font-bold" to="/story">SOVRA Story</Link>
                </div>

                <div className="flex flex-col gap-6">
                    <h4 className="font-label text-xs tracking-widest uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">Assistance</h4>
                    <Link className="text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] transition-colors font-bold" to="/faq">F.A.Q.</Link>
                    <Link className="text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] transition-colors font-bold" to="/policies">Shipping & Returns</Link>
                    <Link className="text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] transition-colors font-bold" to="/size-guide">Size Guide</Link>
                    <Link className="text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] transition-colors font-bold" to="/contact">Contact</Link>
                </div>

                <div className="flex flex-col gap-6">
                    <h4 className="font-label text-xs tracking-widest uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">Journal</h4>
                    <Link className="text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] transition-colors font-bold" to="#">Instagram</Link>
                    <Link className="text-xs tracking-widest uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] transition-colors font-bold" to="#">Pinterest</Link>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-20 pt-8 border-t border-[#111110]/5 dark:border-[#eae9de]/5 flex flex-col md:flex-row justify-between items-center gap-6 max-w-[1720px] mx-auto">
                <p className="font-label text-[10px] tracking-widest uppercase text-[#656464]/60 dark:text-[#babab0]/40 font-bold">
                    © 2024 SOVRA. ALL RIGHTS RESERVED.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 text-center items-center">
                    <Link className="text-[10px] tracking-[0.2em] uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] transition-colors font-bold" to="/privacy-policy">Privacy Policy</Link>
                    <Link className="text-[10px] tracking-[0.2em] uppercase text-[#656464] dark:text-[#babab0] hover:text-[#6e5b44] transition-colors font-bold" to="/terms-of-service">Terms & Conditions</Link>
                </div>
            </div>
        </footer>
    )
}

export default Footer
