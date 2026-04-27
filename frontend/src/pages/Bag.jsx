import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useShop } from '../context/ShopContext'
import { formatPrice } from '../utils/currency'
import { trackBeginCheckout } from '../utils/analytics'


const Bag = () => {
    const navigate = useNavigate();
    const { cart, removeFromCart, updateCartQty, loading } = useShop();

    const subtotal = cart.reduce((acc, item) => acc + ((item.product?.price || 0) * (item.qty || 0)), 0)
    const taxes = (subtotal || 0) * 0.08
    const total = (subtotal || 0) + (taxes || 0)

    const handleUpdateQty = (id, currentQty, delta, stock) => {
        const newQty = currentQty + delta;
        if (newQty >= 1 && (!stock || newQty <= stock)) {
            updateCartQty(id, newQty);
        }
    }

    if (loading && cart.length === 0) return (
        <div className="pt-40 text-center min-h-screen">
            <p className="font-headline text-2xl italic opacity-30">Summoning your collection...</p>
        </div>
    );

    return (
        <div className="pt-40 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto min-h-screen font-body selection:bg-primary-container selection:text-on-primary-container">
            <header className="mb-12 md:mb-20">
                <h1 className="font-headline text-4xl md:text-6xl font-light tracking-tight mb-4 md:mb-6 italic">Your Shopping Bag</h1>
                <p className="text-secondary font-body tracking-[0.25em] uppercase text-[10px] font-bold opacity-60">
                    {cart.length} pieces curated for your collection
                </p>
            </header>

            {cart.length === 0 ? (
                <div className="py-32 text-center border border-dashed border-primary/10">
                    <p className="font-headline text-3xl italic opacity-30 mb-8">Your bag is as light as air.</p>
                    <Link to="/shop" className="bg-primary text-on-primary px-12 py-5 font-label uppercase tracking-[0.3em] text-[10px] font-black">Begin Curating</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-start">
                    {/* Cart Items List */}
                    <section className="lg:col-span-7 space-y-12 md:space-y-16">
                        {cart.map((item, idx) => (
                            <motion.div
                                key={item._id || idx}

                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`flex flex-col md:flex-row gap-10 pb-16 ${idx > 0 ? 'border-t border-outline-variant/10 pt-16' : ''}`}
                            >
                                <div className="w-full md:w-56 aspect-[3/4] bg-surface-container overflow-hidden group relative shadow-sm">
                                    <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={item.product?.images?.[0] || 'https://via.placeholder.com/400'} alt={item.product?.name} />
                                    <div className="absolute inset-0 bg-surface-container-highest/20 opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
                                </div>

                                <div className="flex-1 flex flex-col justify-between py-2">
                                    <div className="space-y-4 md:space-y-6">
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                                            <h3 className="text-2xl md:text-3xl font-light tracking-tight italic">{item.product?.name || 'Untitled Piece'}</h3>
                                            <span className="text-xl font-light text-primary">{formatPrice(item.product?.price || 0)}</span>
                                        </div>

                                        <p className="text-secondary text-base leading-relaxed max-w-sm italic opacity-85">{item.product?.description?.substring(0, 80)}...</p>
                                    </div>

                                    <div className="flex justify-between items-center mt-8 md:mt-12">
                                        <div className="flex items-center space-x-4 md:space-x-10 border-b border-outline-variant/20 pb-3">
                                            <span className="text-[10px] uppercase tracking-widest text-secondary font-bold opacity-60 hidden md:inline">Quantity</span>
                                            <div className="flex items-center gap-6">
                                                <button onClick={() => handleUpdateQty(item.product?._id, item.qty, -1, item.product?.stock)} className="hover:text-primary transition-colors hover:scale-120 duration-300">
                                                    <span className="material-symbols-outlined text-sm">remove</span>
                                                </button>
                                                <span className="text-sm font-bold tracking-widest">{item.qty}</span>
                                                <button onClick={() => handleUpdateQty(item.product?._id, item.qty, 1, item.product?.stock)} className="hover:text-primary transition-colors hover:scale-120 duration-300">
                                                    <span className="material-symbols-outlined text-sm">add</span>
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.product?._id)}
                                            className="text-[10px] uppercase tracking-[0.25em] text-secondary hover:text-error transition-all flex items-center gap-4 font-bold italic opacity-60 hover:opacity-100"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </section>

                    {/* Order Summary Sidebar */}
                    <aside className="lg:col-span-5 lg:sticky lg:top-36">
                        <div className="bg-surface-container-low p-6 md:p-12 space-y-8 md:space-y-12 shadow-lux border border-outline-variant/5">
                            <h2 className="font-headline text-2xl md:text-4xl font-light tracking-tight italic">Order Summary</h2>
                            <div className="space-y-6 md:space-y-8">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-secondary uppercase tracking-[0.2em] font-bold opacity-60">Subtotal</span>
                                    <span className="font-bold tracking-widest text-primary">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-secondary uppercase tracking-[0.2em] font-bold opacity-60">Shipping</span>
                                    <span className="font-black italic text-primary">Complimentary</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-secondary uppercase tracking-[0.2em] font-bold opacity-60">Estimated Taxes</span>
                                    <span className="font-bold tracking-widest text-primary">{formatPrice(taxes)}</span>
                                </div>
                            </div>

                            <div className="pt-8 md:pt-10 border-t border-outline-variant/20">
                                <div className="flex justify-between items-end mb-10 md:mb-16">
                                    <span className="text-xl md:text-2xl font-light tracking-tight italic">Total</span>
                                    <span className="text-2xl md:text-4xl text-primary font-light">{formatPrice(total)}</span>
                                </div>


                                <button
                                    onClick={() => {
                                        // GA4: begin_checkout
                                        trackBeginCheckout(cart, total)
                                        navigate('/checkout')
                                    }}
                                    className="w-full bg-primary text-on-primary py-7 px-10 flex justify-between items-center group transition-all duration-700 hover:bg-primary-dim hover:pr-14 shadow-lux"
                                >
                                    <span className="text-[10px] uppercase tracking-[0.4rem] font-black">Proceed to Checkout</span>
                                    <span className="material-symbols-outlined group-hover:translate-x-4 transition-transform duration-700">arrow_forward</span>
                                </button>
                            </div>
                        </div>

                        <div className="mt-10 text-center">
                            <Link className="text-[10px] uppercase tracking-[0.3em] text-secondary hover:text-primary transition-all underline underline-offset-[8px] decoration-1 font-bold opacity-60 hover:opacity-100" to="/shop">
                                Continue Shopping
                            </Link>
                        </div>
                    </aside>
                </div>
            )}
        </div>
    )
}

export default Bag
