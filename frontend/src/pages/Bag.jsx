import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useShop } from '../context/ShopContext'
import { formatPrice } from '../utils/currency'
import { trackBeginCheckout, trackRemoveFromCart } from '../utils/analytics'
import {
    ShoppingBag, Trash2, Plus, Minus, ArrowRight, ArrowLeft,
    Truck, Lock
} from 'lucide-react'

const Bag = () => {
    const navigate = useNavigate()
    const { cart, removeFromCart, updateCartQty, loading } = useShop()

    const subtotal = cart.reduce((acc, item) => acc + ((item.product?.price || 0) * (item.qty || 0)), 0)
    const taxes = (subtotal || 0) * 0.08
    const total = (subtotal || 0) + (taxes || 0)
    const totalItems = cart.reduce((acc, item) => acc + (item.qty || 1), 0)

    const handleRemoveItem = (piece, qty) => {
        if (piece) {
            trackRemoveFromCart(piece, qty || 1)
            removeFromCart(piece._id)
        }
    }

    const handleUpdateQty = (id, currentQty, delta, stock) => {
        const newQty = currentQty + delta
        if (newQty >= 1 && (!stock || newQty <= stock)) {
            updateCartQty(id, newQty)
        }
    }

    if (loading && cart.length === 0) {
        return (
            <div className="pt-40 pb-24 px-6 max-w-7xl mx-auto min-h-screen text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-6" />
                <p className="font-headline text-2xl italic text-stone-600 font-light">Retrieving your bag...</p>
            </div>
        )
    }

    return (
        <div className="pt-16 sm:pt-20 md:pt-40 pb-16 md:pb-28 px-3.5 sm:px-8 md:px-12 max-w-[1400px] mx-auto min-h-screen font-body selection:bg-primary-container selection:text-on-primary-container text-stone-900">
            {/* Header & Steps */}
            <header className="mb-6 sm:mb-10 md:mb-14 pb-4 sm:pb-6 border-b border-[#111110]/8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
                    <div>
                        <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="font-mono text-[9.5px] sm:text-[10px] tracking-[0.22em] sm:tracking-[0.25em] uppercase font-bold text-primary/80">
                                Atelier Bag
                            </span>
                        </div>
                        <h1 className="font-headline text-2xl sm:text-5xl md:text-6xl font-light tracking-tight italic text-[#111110]">
                            Your Shopping Bag
                        </h1>
                        <p className="font-sans text-[11px] sm:text-xs text-[#7a7670] mt-1 sm:mt-2">
                            {totalItems} {totalItems === 1 ? 'piece' : 'pieces'} curated for your private collection
                        </p>
                    </div>

                    {/* Step Indicator */}
                    <div className="hidden sm:flex items-center gap-3 font-sans text-[11px] uppercase tracking-wider font-bold">
                        <span className="flex items-center gap-2 text-primary border-b-2 border-primary pb-1">
                            <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] flex items-center justify-center font-mono">1</span>
                            Bag Review
                        </span>
                        <span className="text-stone-300">/</span>
                        <span className="flex items-center gap-2 text-stone-400 pb-1">
                            <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-600 text-[10px] flex items-center justify-center font-mono">2</span>
                            Checkout & Shipping
                        </span>
                        <span className="text-stone-300">/</span>
                        <span className="flex items-center gap-2 text-stone-400 pb-1">
                            <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-600 text-[10px] flex items-center justify-center font-mono">3</span>
                            Confirmation
                        </span>
                    </div>
                </div>

                {/* Free Shipping Assurance Ribbon */}
                {cart.length > 0 && (
                    <div className="mt-4 sm:mt-6 py-2 px-3 sm:py-2.5 sm:px-4 bg-emerald-50/80 border border-emerald-200/60 rounded-lg sm:rounded-xl flex items-center justify-between gap-2.5 sm:gap-3 text-[11px] sm:text-xs font-sans text-emerald-900">
                        <div className="flex items-center gap-2">
                            <Truck size={14} className="text-emerald-700 flex-shrink-0" />
                            <span>
                                <strong>Free Delivery:</strong> Unlocked for this order.
                            </span>
                        </div>
                        <span className="hidden md:inline font-mono font-bold text-[10px] uppercase tracking-wider text-emerald-800 bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
                            Free Delivery
                        </span>
                    </div>
                )}
            </header>

            {cart.length === 0 ? (
                /* Empty Bag State */
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="py-12 sm:py-24 px-4 sm:px-6 bg-white rounded-2xl sm:rounded-3xl border border-dashed border-stone-200 text-center max-w-2xl mx-auto shadow-sm"
                >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-stone-50 border border-stone-200/60 flex items-center justify-center mx-auto mb-3 sm:mb-4 text-stone-400">
                        <ShoppingBag size={24} className="sm:w-7 sm:h-7" strokeWidth={1.5} />
                    </div>
                    <h2 className="font-headline text-2xl sm:text-3xl italic text-stone-800 mb-1.5 sm:mb-2 font-light">Your Bag is Empty</h2>
                    <p className="font-sans text-[11px] sm:text-xs text-stone-500 max-w-md mx-auto mb-6 sm:mb-8 leading-relaxed">
                        Discover handcrafted fine jewelry pieces, created with Tuscan heritage and modern aesthetic precision.
                    </p>

                    <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mb-6 sm:mb-8">
                        {['Earrings', 'Necklaces', 'Rings', 'Bracelets'].map(cat => (
                            <Link
                                key={cat}
                                to={`/shop/${cat.toLowerCase()}`}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-sans font-bold uppercase tracking-wider transition-all"
                            >
                                {cat}
                            </Link>
                        ))}
                    </div>

                    <Link
                        to="/shop"
                        className="inline-flex items-center gap-2 bg-[#111110] text-[#fffcf7] hover:bg-primary px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl font-sans text-[10.5px] sm:text-xs uppercase tracking-[0.2em] font-bold shadow-md transition-all active:scale-98"
                    >
                        <span>Explore Collection</span>
                        <ArrowRight size={14} />
                    </Link>
                </motion.div>
            ) : (
                /* 2-Column Split: Items List & Order Summary */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-start">
                    {/* Cart Items List (7 cols) */}
                    <section className="lg:col-span-7 space-y-3 sm:space-y-4">
                        <div className="hidden sm:grid grid-cols-12 text-[10px] font-sans uppercase tracking-[0.2em] font-bold text-stone-400 pb-3 px-4 border-b border-stone-200/60">
                            <span className="col-span-7">Piece</span>
                            <span className="col-span-3 text-center">Quantity</span>
                            <span className="col-span-2 text-right">Subtotal</span>
                        </div>

                        <AnimatePresence>
                            {cart.map((item, idx) => {
                                const piece = item.product || {}
                                const itemTotal = (piece.price || 0) * (item.qty || 1)
                                const isMaxStock = piece.stock && item.qty >= piece.stock

                                return (
                                    <motion.div
                                        key={item._id || piece._id || idx}
                                        layout
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-[#111110]/8 shadow-[0_4px_20px_rgba(110,91,68,0.04)] hover:shadow-[0_8px_30px_rgba(110,91,68,0.08)] transition-all flex flex-col sm:flex-row gap-3 sm:gap-6 items-start sm:items-center justify-between"
                                    >
                                        {/* Product Thumbnail & Details */}
                                        <div className="flex gap-3 sm:gap-4 items-center flex-1 w-full sm:w-auto">
                                            <Link
                                                to={`/product/${piece._id}`}
                                                className="w-16 h-20 sm:w-24 sm:h-28 rounded-lg sm:rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-black/5 relative group cursor-pointer"
                                            >
                                                <img
                                                    src={piece.images?.[0] || piece.img || piece.image || 'https://via.placeholder.com/400'}
                                                    alt={piece.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </Link>

                                            <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                                                <span className="font-sans text-[8.5px] sm:text-[9px] uppercase tracking-wider font-bold text-primary/80 block">
                                                    {piece.category || 'Fine Jewelry'}
                                                </span>
                                                <Link
                                                    to={`/product/${piece._id}`}
                                                    className="font-headline text-base sm:text-xl italic text-stone-900 hover:text-primary transition-colors block truncate"
                                                >
                                                    {piece.name || 'Untitled Piece'}
                                                </Link>
                                                <p className="font-mono text-[11px] sm:text-xs text-stone-500">
                                                    Unit: {formatPrice(piece.price || 0)}
                                                </p>
                                                <div className="flex items-center gap-1.5 pt-0.5">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    <span className="font-sans text-[9px] sm:text-[10px] text-emerald-800 font-semibold truncate">
                                                        In Stock • Ready to Dispatch
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quantity Stepper & Price / Remove */}
                                        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                                            {/* Quantity Pill Stepper */}
                                            <div className="flex items-center border border-stone-200 rounded-lg sm:rounded-xl bg-stone-50/80 p-0.5 sm:p-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdateQty(piece._id, item.qty, -1, piece.stock)}
                                                    disabled={item.qty <= 1}
                                                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg flex items-center justify-center text-stone-600 hover:bg-white hover:text-stone-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                                    title="Decrease quantity"
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span className="w-6 sm:w-8 text-center font-mono text-[11px] sm:text-xs font-bold text-stone-800">
                                                    {item.qty}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleUpdateQty(piece._id, item.qty, 1, piece.stock)}
                                                    disabled={isMaxStock}
                                                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg flex items-center justify-center text-stone-600 hover:bg-white hover:text-stone-900 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                                    title={isMaxStock ? 'Maximum stock reached' : 'Increase quantity'}
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>

                                            {/* Line Item Total */}
                                            <div className="text-right min-w-[70px] sm:min-w-[80px]">
                                                <p className="font-headline text-base sm:text-xl italic text-stone-900 font-light">
                                                    {formatPrice(itemTotal)}
                                                </p>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(piece, item.qty)}
                                                className="p-1.5 sm:p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg sm:rounded-xl transition-all"
                                                title="Remove item"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>

                        {/* Continue Shopping Link */}
                        <div className="pt-2 sm:pt-4 flex items-center justify-between">
                            <Link
                                to="/shop"
                                className="inline-flex items-center gap-1.5 sm:gap-2 font-sans text-[10.5px] sm:text-xs uppercase tracking-wider font-bold text-stone-600 hover:text-primary transition-colors group"
                            >
                                <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" />
                                <span>Continue Exploring Collection</span>
                            </Link>
                            <span className="font-mono text-[10px] sm:text-xs text-stone-400">
                                {totalItems} total {totalItems === 1 ? 'item' : 'items'}
                            </span>
                        </div>
                    </section>

                    {/* Order Summary Sidebar (5 cols, Sticky) */}
                    <aside className="lg:col-span-5 lg:sticky lg:top-36 w-full">
                        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-[#111110]/8 shadow-sm sm:shadow-[0_4px_24px_rgba(110,91,68,0.06)] space-y-4 sm:space-y-6">
                            <div>
                                <h2 className="font-headline text-xl sm:text-3xl italic text-[#111110]">Order Summary</h2>
                                <p className="font-sans text-[10.5px] sm:text-xs text-[#7a7670] mt-0.5 sm:mt-1">Pricing breakdown & secure payment calculation</p>
                            </div>

                            {/* Summary Rows */}
                            <div className="space-y-2.5 sm:space-y-3.5 pt-1.5 sm:pt-2 border-t border-stone-100 font-sans text-xs">
                                <div className="flex justify-between items-center text-stone-600">
                                    <span className="uppercase tracking-wider font-bold text-[9.5px] sm:text-[10px] text-stone-400">Subtotal</span>
                                    <span className="font-mono text-xs sm:text-sm font-semibold text-stone-800">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-stone-600">
                                    <span className="uppercase tracking-wider font-bold text-[9.5px] sm:text-[10px] text-stone-400">Insured Shipping</span>
                                    <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-200 text-[10px] sm:text-xs">
                                        Free Delivery
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-stone-600">
                                    <span className="uppercase tracking-wider font-bold text-[9.5px] sm:text-[10px] text-stone-400">Estimated Taxes (GST 8%)</span>
                                    <span className="font-mono text-xs sm:text-sm font-semibold text-stone-800">{formatPrice(taxes)}</span>
                                </div>
                            </div>

                            {/* Total Line */}
                            <div className="pt-3 sm:pt-4 border-t border-stone-100 flex justify-between items-baseline">
                                <div>
                                    <span className="font-sans text-[11px] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.2em] font-bold text-stone-900 block">
                                        Estimated Total
                                    </span>
                                    <span className="font-sans text-[9px] sm:text-[10px] text-stone-400">Includes all applicable duties & taxes</span>
                                </div>
                                <span className="font-headline text-2xl sm:text-4xl italic text-stone-900 font-light">
                                    {formatPrice(total)}
                                </span>
                            </div>

                            {/* Proceed to Checkout Button */}
                            <button
                                onClick={() => {
                                    trackBeginCheckout(cart, total)
                                    navigate('/checkout')
                                }}
                                className="w-full bg-[#111110] hover:bg-primary text-[#fffcf7] py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-sans text-[10.5px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] font-bold flex items-center justify-between transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.99] group"
                            >
                                <span className="flex items-center gap-1.5 sm:gap-2">
                                    <Lock size={13} className="text-amber-200" />
                                    <span>Proceed to Checkout</span>
                                </span>
                                <ArrowRight size={15} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                            </button>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    )
}

export default Bag
