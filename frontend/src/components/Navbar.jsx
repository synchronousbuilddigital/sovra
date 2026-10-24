import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { useShop } from '../context/ShopContext'
import NotificationTray from './NotificationTray'

const Navbar = () => {
    const { isAdmin, cart } = useShop()
    const location = useLocation()
    const navigate = useNavigate()
    const [isScrolled, setIsScrolled] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchKeyword, setSearchKeyword] = useState('')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768)
        }
        window.addEventListener('scroll', handleScroll)
        window.addEventListener('resize', handleResize)
        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('resize', handleResize)
        }
    }, [])

    const navLinks = [
        { name: 'Collections', path: '/collections' },
        { name: 'Shop', path: '/shop' },
        { name: 'Reels', path: '/reels' },
        { name: 'Magazine', path: '/magazine' },
        { name: 'About Us', path: '/about' }
    ]

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchKeyword.trim()) {
            navigate(`/shop?keyword=${searchKeyword.trim()}`)
            setSearchKeyword('')
            setIsSearchOpen(false)
        }
    }

    // Close mobile menu on route change
    const [prevPath, setPrevPath] = useState(location.pathname)
    if (prevPath !== location.pathname) {
        setPrevPath(location.pathname)
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false)
        }
    }

    // Do not mount storefront floating navbar within the admin panel
    if (location.pathname.startsWith('/admin')) {
        return null
    }

    return (
        <header
            className="fixed top-0 w-full z-50 flex justify-center pointer-events-none"
        >
            <Motion.nav
                initial={false}
                animate={{
                    width: isMobile ? (isScrolled ? '95%' : '100%') : (isScrolled ? '92%' : '100%'),
                    maxWidth: isScrolled ? '1200px' : '2500px',
                    borderRadius: isScrolled ? (isMobile ? '32px' : '100px') : '0px',
                    marginTop: isScrolled ? (isMobile ? '0.4rem' : '1.5rem') : '0rem',
                    backgroundColor: isScrolled ? 'rgba(255, 252, 247, 0.96)' : 'rgba(255, 252, 247, 0.98)',
                    boxShadow: isScrolled ? '0 10px 30px -10px rgba(0,0,0,0.08)' : '0 0px 0px rgba(0,0,0,0)',
                    paddingLeft: isMobile ? '12px' : (isScrolled ? 'clamp(16px, 4vw, 48px)' : 'clamp(16px, 6vw, 80px)'),
                    paddingRight: isMobile ? '12px' : (isScrolled ? 'clamp(16px, 4vw, 48px)' : 'clamp(16px, 6vw, 80px)'),
                    height: isMobile ? (isScrolled ? '54px' : '60px') : (isScrolled ? '76px' : 'clamp(70px, 8vh, 108px)'),
                    borderWidth: '1px',
                    borderColor: isScrolled ? 'rgba(110, 91, 68, 0.1)' : 'rgba(110, 91, 68, 0.05)'
                }}
                transition={{
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1]
                }}
                className={`pointer-events-auto flex items-center justify-between backdrop-blur-xl border-primary/5 font-body border-b-primary/10`}
            >
                {/* Left Logo & Mobile Toggle */}
                <div className="flex-initial flex items-center pr-1 md:pr-8 gap-2 md:gap-0">
                    <button
                        className="md:hidden flex items-center text-primary hover:opacity-70 transition-opacity p-1"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle Navigation Menu"
                    >
                        <span className="material-symbols-outlined text-[22px]">
                            {isMobileMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                    <Link to="/" className="flex items-center group">
                        <Motion.img
                            initial={false}
                            animate={{
                                height: isMobile ? (isScrolled ? 34 : 40) : (isScrolled ? 56 : 96)
                            }}
                            transition={{
                                duration: 0.8,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                            src="/logo.jpg"
                            alt="SOVRA"
                            className="mix-blend-multiply w-auto"
                        />
                    </Link>
                </div>

                {/* Center Links */}
                <Motion.div
                    initial={false}
                    animate={{
                        fontSize: isScrolled ? '15px' : '18px'
                    }}
                    transition={{
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1]
                    }}
                    className="flex-auto hidden md:flex items-center justify-center gap-6 lg:gap-8 font-headline tracking-tight"
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className={`whitespace-nowrap transition-colors duration-400 relative group font-medium ${location.pathname === link.path ? 'text-primary' : 'text-[#656464] hover:text-[#373831]'
                                }`}
                        >
                            {link.name}
                            {location.pathname === link.path && (
                                <Motion.span
                                    layoutId="navUnderline"
                                    className="absolute -bottom-1 left-0 w-full h-[1px] bg-primary"
                                />
                            )}
                            {location.pathname !== link.path && (
                                <span className="absolute -bottom-1 left-0 h-[1px] bg-primary w-0 group-hover:w-full transition-all duration-500"></span>
                            )}
                        </Link>
                    ))}
                </Motion.div>

                <div className={`flex-initial flex items-center justify-end text-[#6e5b44] ${isScrolled ? 'pl-1 md:pl-10' : 'pl-0'}`}>
                    <div className="flex items-center gap-2 sm:gap-3.5 md:gap-6 lg:gap-8">
                        {/* Search Bar */}
                        <div className="flex items-center relative">
                            <AnimatePresence>
                                {isSearchOpen && (
                                    <Motion.form
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: isMobile ? 130 : (isScrolled ? 200 : 250), opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        onSubmit={handleSearch}
                                        className="absolute right-full mr-2 md:mr-4 flex items-center bg-surface/90 rounded-full px-2 py-0.5 border border-primary/20"
                                    >
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Search..."
                                            value={searchKeyword}
                                            onChange={(e) => setSearchKeyword(e.target.value)}
                                            className="bg-transparent border-none py-0.5 px-1 text-xs focus:outline-none w-full font-body placeholder:text-[#6e5b44]/40"
                                        />
                                    </Motion.form>
                                )}
                            </AnimatePresence>
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="flex items-center hover:opacity-70 transition-all hover:scale-110 p-0.5"
                                aria-label="Search"
                            >
                                <Motion.span
                                    initial={false}
                                    animate={{ fontSize: isMobile ? '20px' : (isScrolled ? '24px' : '26px') }}
                                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                    className="material-symbols-outlined"
                                >
                                    {isSearchOpen ? 'close' : 'search'}
                                </Motion.span>
                            </button>
                        </div>

                        <div className="flex items-center">
                            <NotificationTray />
                        </div>

                        <Link to="/wishlist" className="flex items-center hover:opacity-70 transition-all hover:scale-110 p-0.5" title="Wishlist">
                            <Motion.span
                                initial={false}
                                animate={{ fontSize: isMobile ? '20px' : (isScrolled ? '24px' : '26px') }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="material-symbols-outlined"
                            >
                                favorite
                            </Motion.span>
                        </Link>

                        <Link
                            to={isAdmin ? "/admin" : "/account"}
                            className="flex items-center hover:opacity-70 transition-all hover:scale-110 p-0.5"
                            title={isAdmin ? "Admin Panel" : "My Account"}
                        >
                            <Motion.span
                                initial={false}
                                animate={{ fontSize: isMobile ? '20px' : (isScrolled ? '24px' : '26px') }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="material-symbols-outlined"
                            >
                                person
                            </Motion.span>
                        </Link>
                        <Link to="/bag" className="flex items-center hover:opacity-70 transition-all relative hover:scale-110 p-0.5">
                            <Motion.span
                                initial={false}
                                animate={{ fontSize: isMobile ? '20px' : (isScrolled ? '24px' : '26px') }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="material-symbols-outlined block"
                            >
                                shopping_bag
                            </Motion.span>
                            <span className="absolute -top-1 -right-1 text-[8px] bg-primary text-on-primary rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold shadow-sm border border-[#fffcf7]">
                                {cart.reduce((acc, item) => acc + item.qty, 0)}
                            </span>
                        </Link>
                    </div>
                </div>

            </Motion.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <Motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="pointer-events-auto fixed top-[66px] left-3 right-3 bg-surface/98 backdrop-blur-xl border border-primary/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-3 z-40 md:hidden"
                    >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`text-lg font-headline tracking-tight transition-colors duration-400 py-2 border-b border-primary/5 ${location.pathname === link.path ? 'text-primary' : 'text-[#656464]'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </Motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}

export default Navbar
