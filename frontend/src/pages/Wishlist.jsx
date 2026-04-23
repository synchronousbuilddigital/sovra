import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useShop } from '../context/ShopContext'
import { Heart, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react'
import { formatPrice } from '../utils/currency'
import { getOptimizedImage } from '../utils/imageUtils'

const Wishlist = () => {
    const { wishlist, removeFromWishlist, addToCart } = useShop()

    return (
        <div className="pt-32 pb-24 bg-[#fffcf7] min-h-screen selection:bg-primary/10">
            <main className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
                {/* Header */}
                <header className="mb-20 text-center max-w-4xl mx-auto">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-sans text-[10px] tracking-[0.5em] uppercase text-[#7a7670] mb-6 block font-black italic"
                    >
                        Your Curated Selection
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-premium text-7xl md:text-9xl text-[#111110] leading-[0.8] mb-12 italic font-light tracking-tighter"
                    >
                        The <span className="not-italic font-normal">Vault</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="font-body text-lg text-[#656464] leading-relaxed max-w-2xl mx-auto font-light italic"
                    >
                        A personal archive of your most desired masterpieces. Secure them for acquisition or continue exploring the celestial collection.
                    </motion.p>
                </header>

                {wishlist.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="py-32 text-center flex flex-col items-center gap-10"
                    >
                        <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                            <Heart size={32} className="text-primary/20" />
                        </div>
                        <h2 className="font-premium text-4xl italic font-light text-[#111110]/40">Your vault is currently silent.</h2>
                        <Link to="/shop" className="group inline-flex items-center gap-6 text-[10px] tracking-[0.4em] uppercase font-sans text-[#111110] border-b border-[#111110] pb-4 transition-all hover:gap-10">
                            Explore the Archive
                            <ArrowRight size={14} className="transition-transform group-hover:translate-x-2" />
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-12 gap-y-24">
                        <AnimatePresence mode="popLayout">
                            {wishlist.map((product, idx) => (
                                <motion.div
                                    key={product._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                    className="group relative"
                                >
                                    <div className="relative aspect-[4/5] overflow-hidden bg-white mb-8 shadow-sm transition-all duration-700 group-hover:shadow-lux group-hover:-translate-y-2 rounded-sm border border-[#111110]/5 p-0.5">
                                        <Link to={`/product/${product._id}`} className="block w-full h-full relative overflow-hidden">
                                            <img
                                                src={getOptimizedImage(product.img || product.image, 600)}
                                                alt={product.name}
                                                className="w-full h-full object-cover transition-all duration-[2s] scale-[1.02] group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                                            />
                                        </Link>

                                        {/* Actions Overlay */}
                                        <div className="absolute top-6 right-6 z-20 flex flex-col gap-4">
                                            <button
                                                onClick={() => removeFromWishlist(product._id)}
                                                className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all border border-white/10"
                                                title="Remove from Vault"
                                            >
                                                <Heart size={18} className="fill-current" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => addToCart(product._id, 1)}
                                            className="absolute inset-x-0 bottom-0 py-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-10 bg-[#111110] text-[#f5f0e8] text-[9px] tracking-[0.4em] uppercase font-black"
                                        >
                                            Begin Acquisition
                                        </button>
                                    </div>

                                    <div className="text-center space-y-4">
                                        <span className="font-sans text-[8px] tracking-[0.4em] uppercase text-[#7a7670] font-black opacity-60">
                                            {product.category}
                                        </span>
                                        <Link to={`/product/${product._id}`}>
                                            <h3 className="font-premium text-3xl text-[#111110] italic font-light hover:text-primary transition-colors">{product.name}</h3>
                                        </Link>
                                        <p className="font-premium text-xl text-[#373831] font-light italic">{formatPrice(product.price)}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Bottom Suggestion */}
                {wishlist.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="mt-48 pt-32 border-t border-[#111110]/5 text-center flex flex-col items-center gap-12"
                    >
                        <Sparkles size={32} strokeWidth={0.5} className="text-primary/20 animate-pulse" />
                        <h3 className="font-premium text-4xl text-[#111110]/40 italic">Hungry for more?</h3>
                        <Link to="/shop" className="bg-[#111110] text-[#f5f0e8] px-12 py-6 text-[10px] tracking-[0.4em] uppercase font-sans hover:opacity-90 transition-opacity rounded-full shadow-lux-sm">
                            Discover New Arrivals
                        </Link>
                    </motion.div>
                )}
            </main>
        </div>
    )
}

export default Wishlist
