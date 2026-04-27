import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { m, AnimatePresence } from 'framer-motion'
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

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const navLinks = [
        { name: 'Collections', path: '/collections' },
        { name: 'Find Jewelry', path: '/shop' },
        { name: 'Magazine', path: '/magazine' },
        { name: 'Heritage', path: '/story' }
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
    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [location.pathname])

    return (
        <header
            className="fixed top-0 w-full z-50 flex justify-center pointer-events-none"
        >
            <m.nav
                initial={false}
                animate={{
                    width: isScrolled ? '92%' : '100%',
                    maxWidth: isScrolled ? '1200px' : '2500px',
                    borderRadius: isScrolled ? '100px' : '0px',
                    marginTop: isScrolled ? '1.5rem' : '0rem',
                    backgroundColor: isScrolled ? 'rgba(255, 252, 247, 0.95)' : 'rgba(255, 252, 247, 0.98)',
                    boxShadow: isScrolled ? '0 20px 40px -10px rgba(0,0,0,0.1)' : '0 0px 0px rgba(0,0,0,0)',
                    paddingLeft: isScrolled ? 'clamp(16px, 4vw, 48px)' : 'clamp(16px, 6vw, 80px)',
                    paddingRight: isScrolled ? 'clamp(16px, 4vw, 48px)' : 'clamp(16px, 6vw, 80px)',
                    height: isScrolled ? '76px' : 'clamp(70px, 8vh, 108px)',
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
                <div className="flex-initial flex items-center pr-2 md:pr-8 gap-3 md:gap-0">
                    <button
                        className="md:hidden flex items-center text-primary hover:opacity-70 transition-opacity"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        <span className="material-symbols-outlined text-2xl">
                            {isMobileMenuOpen ? 'close' : 'menu'}
                        </span>
                    </button>
                    <Link to="/" className="flex items-center group">
                        <m.img
                            initial={false}
                            animate={{
                                height: isScrolled ? 56 : 96 // h-14 (56px) and h-24 (96px)
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
                <m.div
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
                                <m.span
                                    layoutId="navUnderline"
                                    className="absolute -bottom-1 left-0 w-full h-[1px] bg-primary"
                                />
                            )}
                            {location.pathname !== link.path && (
                                <span className="absolute -bottom-1 left-0 h-[1px] bg-primary w-0 group-hover:w-full transition-all duration-500"></span>
                            )}
                        </Link>
                    ))}
                </m.div>

                <div className={`flex-initial flex items-center justify-end text-[#6e5b44] ${isScrolled ? 'pl-2 md:pl-10' : 'pl-0'}`}>
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
                        {/* Search Bar */}
                        <div className="flex items-center relative">
                            <AnimatePresence>
                                {isSearchOpen && (
                                    <m.form
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: isScrolled ? 200 : 250, opacity: 1 }}
                                        exit={{ width: 0, opacity: 0 }}
                                        onSubmit={handleSearch}
                                        className="absolute right-full mr-4 flex items-center"
                                    >
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Search the archive..."
                                            value={searchKeyword}
                                            onChange={(e) => setSearchKeyword(e.target.value)}
                                            className="bg-transparent border-b border-primary/30 py-1 px-2 text-sm focus:outline-none w-full font-body placeholder:text-[#6e5b44]/40"
                                        />
                                    </m.form>
                                )}
                            </AnimatePresence>
                            <button
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="flex items-center hover:opacity-70 transition-all hover:scale-110"
                            >
                                <m.span
                                    initial={false}
                                    animate={{ fontSize: isScrolled ? '24px' : '26px' }}
                                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                    className="material-symbols-outlined"
                                >
                                    {isSearchOpen ? 'close' : 'search'}
                                </m.span>
                            </button>
                        </div>

                        {isAdmin && (
                            <Link to="/admin" className="flex items-center hover:opacity-70 transition-all hover:scale-110" title="Admin Control">
                                <m.span
                                    initial={false}
                                    animate={{ fontSize: isScrolled ? '24px' : '26px' }}
                                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                    className="material-symbols-outlined"
                                >
                                    settings
                                </m.span>
                            </Link>
                        )}

                        <div className="flex items-center">
                            <NotificationTray />
                        </div>

                        <Link to="/wishlist" className="flex items-center hover:opacity-70 transition-all hover:scale-110" title="The Vault">
                            <m.span
                                initial={false}
                                animate={{ fontSize: isScrolled ? '24px' : '26px' }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="material-symbols-outlined"
                            >
                                favorite
                            </m.span>
                        </Link>

                        <Link to="/account" className="flex items-center hover:opacity-70 transition-all hover:scale-110">
                            <m.span
                                initial={false}
                                animate={{ fontSize: isScrolled ? '24px' : '26px' }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="material-symbols-outlined"
                            >
                                person
                            </m.span>
                        </Link>
                        <Link to="/bag" className="flex items-center hover:opacity-70 transition-all relative hover:scale-110">
                            <m.span
                                initial={false}
                                animate={{ fontSize: isScrolled ? '24px' : '26px' }}
                                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                                className="material-symbols-outlined block"
                            >
                                shopping_bag
                            </m.span>
                            <span className="absolute -top-1 -right-1 text-[8px] bg-primary text-on-primary rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold shadow-sm border border-[#fffcf7]">
                                {cart.reduce((acc, item) => acc + item.qty, 0)}
                            </span>
                        </Link>
                    </div>
                </div>

            </m.nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <m.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="pointer-events-auto fixed top-[110px] left-4 right-4 bg-surface/95 backdrop-blur-xl border border-primary/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 z-40 md:hidden"
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
                    </m.div>
                )}
            </AnimatePresence>
        </header>
    )
}

export default Navbar
