import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useShop } from '../context/ShopContext'
import { Heart, ShoppingBag, ArrowRight, ArrowLeft, Sparkles, Eye, Trash2, Check } from 'lucide-react'
import { formatPrice } from '../utils/currency'
import { getOptimizedImage } from '../utils/imageUtils'
import { toast } from 'react-toastify'
import { trackAddToCart } from '../utils/analytics'

const Wishlist = () => {
    const navigate = useNavigate()
    const { wishlist, removeFromWishlist, addToCart } = useShop()
    const [addingAll, setAddingAll] = useState(false)

    const handleAddAllToCart = async () => {
        if (!wishlist || wishlist.length === 0) return
        try {
            setAddingAll(true)
            for (const item of wishlist) {
                await addToCart(item._id, 1)
                trackAddToCart(item, 1)
            }
            toast.success('All wishlist items moved to your bag.')
        } catch (err) {
            toast.error('Failed to move some items to bag.')
        } finally {
            setAddingAll(false)
        }
    }

    return (
        <div className="pt-32 sm:pt-36 md:pt-40 pb-28 px-5 sm:px-8 md:px-12 max-w-[1400px] mx-auto min-h-screen font-body selection:bg-primary-container selection:text-on-primary-container text-stone-900">
            {/* Header Section */}
            <header className="mb-10 md:mb-14 pb-6 border-b border-[#111110]/8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                            <span className="font-mono text-[10px] tracking-[0.25em] uppercase font-bold text-rose-700">
                                Curated Selection
                            </span>
                        </div>
                        <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl font-light tracking-tight italic text-[#111110]">
                            My Wishlist
                        </h1>
                        <p className="font-sans text-xs text-[#7a7670] mt-2">
                            {wishlist.length} {wishlist.length === 1 ? 'piece' : 'pieces'} saved in your private selection
                        </p>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/shop"
                            className="bg-stone-100 hover:bg-stone-200 text-stone-800 transition-all px-5 py-2.5 rounded-xl font-sans text-xs tracking-wider uppercase font-bold flex items-center gap-2"
                        >
                            <span>Explore Store</span>
                            <ArrowRight size={14} />
                        </Link>

                        {wishlist.length > 0 && (
                            <button
                                onClick={handleAddAllToCart}
                                disabled={addingAll}
                                className="bg-[#111110] hover:bg-primary text-[#fffcf7] transition-all px-5 py-2.5 rounded-xl font-sans text-xs tracking-wider uppercase font-bold flex items-center gap-2 shadow-sm disabled:opacity-50"
                            >
                                <ShoppingBag size={14} />
                                <span>{addingAll ? 'Moving...' : 'Move All to Bag'}</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {wishlist.length === 0 ? (
                /* Empty Wishlist State */
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="py-24 px-6 bg-white rounded-3xl border border-dashed border-stone-200 text-center max-w-2xl mx-auto shadow-sm"
                >
                    <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200/60 flex items-center justify-center mx-auto mb-4 text-rose-500">
                        <Heart size={28} strokeWidth={1.5} className="fill-rose-100" />
                    </div>
                    <h2 className="font-headline text-3xl italic text-stone-800 mb-2 font-light">Your Wishlist is Empty</h2>
                    <p className="font-sans text-xs text-stone-500 max-w-md mx-auto mb-8 leading-relaxed">
                        Curate your personal jewelry collection by tapping the heart icon on any design while browsing our atelier catalog.
                    </p>

                    <div className="flex flex-wrap justify-center gap-2.5 mb-8">
                        {['Earrings', 'Necklaces', 'Rings', 'Bracelets'].map(cat => (
                            <Link
                                key={cat}
                                to={`/shop/${cat.toLowerCase()}`}
                                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-sans font-bold uppercase tracking-wider transition-all"
                            >
                                {cat}
                            </Link>
                        ))}
                    </div>

                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 bg-[#111110] text-[#fffcf7] hover:bg-primary px-8 py-3.5 rounded-xl font-sans text-xs uppercase tracking-[0.2em] font-bold shadow-md transition-all active:scale-98"
                    >
                        <span>Explore Collection</span>
                        <ArrowRight size={15} />
                    </Link>
                </motion.div>
            ) : (
                /* Wishlist Cards Grid */
                <div className="space-y-12">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                        <AnimatePresence mode="popLayout">
                            {wishlist.map((product, idx) => (
                                <motion.div
                                    key={product._id}
                                    layout
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                                    className="bg-white rounded-2xl border border-[#111110]/8 overflow-hidden shadow-[0_4px_20px_rgba(110,91,68,0.04)] hover:shadow-[0_8px_30px_rgba(110,91,68,0.08)] transition-all flex flex-col justify-between group"
                                >
                                    {/* Thumbnail & Remove Heart Overlay */}
                                    <div className="relative aspect-[4/5] overflow-hidden bg-stone-100 cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
                                        <img
                                            src={getOptimizedImage(product.images?.[0] || product.img || product.image, 600)}
                                            alt={product.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />

                                        {/* Remove Button */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                removeFromWishlist(product._id)
                                            }}
                                            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-rose-500 hover:text-red-600 flex items-center justify-center backdrop-blur-sm shadow-md transition-all z-10"
                                            title="Remove from Wishlist"
                                        >
                                            <Heart size={16} className="fill-rose-500" />
                                        </button>
                                    </div>

                                    {/* Product Details & Actions */}
                                    <div className="p-5 flex flex-col flex-1 justify-between">
                                        <div className="mb-4">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="font-sans text-[9px] uppercase tracking-wider font-bold text-stone-400">
                                                    {product.category || 'Fine Jewelry'}
                                                </span>
                                                <span className="font-sans text-[9px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                                    In Stock
                                                </span>
                                            </div>

                                            <h3
                                                onClick={() => navigate(`/product/${product._id}`)}
                                                className="font-headline text-lg sm:text-xl text-stone-900 group-hover:text-primary transition-colors cursor-pointer truncate"
                                            >
                                                {product.name}
                                            </h3>

                                            <p className="font-headline text-xl italic text-stone-900 font-light mt-1">
                                                {formatPrice(product.price || 0)}
                                            </p>
                                        </div>

                                        {/* Dual Touch-Friendly Action Buttons */}
                                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-stone-100">
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/product/${product._id}`)}
                                                className="w-full bg-stone-100 hover:bg-stone-200 text-stone-800 py-2.5 rounded-xl text-[10px] font-sans font-bold uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5"
                                            >
                                                <Eye size={13} />
                                                <span>Details</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    addToCart(product._id, 1)
                                                    trackAddToCart(product, 1)
                                                }}
                                                className="w-full bg-[#111110] hover:bg-primary text-[#fffcf7] py-2.5 rounded-xl text-[10px] font-sans font-bold uppercase tracking-wider transition-all text-center shadow-sm flex items-center justify-center gap-1.5 active:scale-98"
                                            >
                                                <ShoppingBag size={13} />
                                                <span>Add to Bag</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Bottom Discovery Footer Card */}
                    <div className="bg-stone-50/80 rounded-3xl p-8 border border-stone-200/60 text-center flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="text-left">
                            <span className="font-sans text-[10px] uppercase tracking-wider font-bold text-primary block mb-1">
                                Atelier Curations
                            </span>
                            <h4 className="font-headline text-2xl italic text-stone-900 font-light">
                                Looking for bespoke custom creations?
                            </h4>
                            <p className="font-sans text-xs text-stone-500 mt-1">
                                Explore all Italian and Tuscan high jewelry collections crafted by master artisans.
                            </p>
                        </div>
                        <Link
                            to="/shop"
                            className="bg-[#111110] hover:bg-primary text-[#fffcf7] px-6 py-3 rounded-xl font-sans text-xs uppercase tracking-wider font-bold transition-all whitespace-nowrap shadow-sm"
                        >
                            Browse All Designs
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Wishlist
