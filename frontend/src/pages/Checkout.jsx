import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { formatPrice } from '../utils/currency';
import { trackPurchase } from '../utils/analytics';

const Checkout = () => {

    const { cart, refreshProfile } = useShop();
    const navigate = useNavigate();
    
    const [step, setStep] = useState(1); // 1: Info/Address, 2: Confirmation
    const [orderInfo, setOrderInfo] = useState(null);
    const [loading, setLoading] = useState(false);

    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');

    const [promoCode, setPromoCode] = useState('');
    const [promoDiscount, setPromoDiscount] = useState(0); // percentage
    const [isApplying, setIsApplying] = useState(false);

    const subtotal = cart.reduce((acc, item) => acc + item.product?.price * item.qty, 0);
    const discountAmount = (subtotal * promoDiscount) / 100;
    const taxes = (subtotal - discountAmount) * 0.08;
    const total = subtotal - discountAmount + taxes;

    const sovraQuotes = [
        "\"Jewellery is not an accessory, but a conversation between time and art.\"",
        "\"A Maison is built on details; a life is built on moments of brilliance.\"",
        "\"Luxury is the silence that follows a statement piece.\"",
        "\"Crafted for the few who understand that true beauty never shouts.\""
    ];

    const currentQuote = sovraQuotes[Math.floor(Math.random() * sovraQuotes.length)];

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        try {
            setIsApplying(true);
            const { data } = await api.get(`/promos/validate/${promoCode}`);
            setPromoDiscount(data.discount);
            toast.success(`Artisanal code applied: ${data.discount}% OFF`);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid code.');
            setPromoDiscount(0);
        } finally {
            setIsApplying(false);
        }
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const orderData = {
                orderItems: cart.map(item => ({
                    name: item.product.name,
                    qty: item.qty,
                    image: item.product.img || item.product.image,
                    price: item.product.price,
                    product: item.product._id
                })),
                shippingAddress: { address, city, postalCode, country },
                paymentMethod: 'Credit Card', // Mock
                itemsPrice: subtotal,
                taxPrice: taxes,
                shippingPrice: 0,
                totalPrice: total,
                promoCode: promoDiscount > 0 ? promoCode : undefined,
                discountPrice: discountAmount
            };

            const { data } = await api.post('/orders', orderData);
            setOrderInfo(data);
            setStep(2);
            // GA4: purchase event
            trackPurchase(data._id, cart, total, taxes)
            refreshProfile(); // Clear cart in context
            toast.success('Your curation has been secured.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Transaction failed');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0 && step === 1) {
        return (
            <div className="pt-40 text-center min-h-screen">
                <p className="font-headline text-3xl italic opacity-30">Your bag is empty. There is no curation to finalize.</p>
                <button onClick={() => navigate('/shop')} className="mt-8 font-label text-[10px] uppercase tracking-widest underline underline-offset-8">Return to Shop</button>
            </div>
        );
    }

    return (
        <div className="pt-32 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen">
            <AnimatePresence mode="wait">
                {step === 1 ? (
                    <motion.div 
                        key="checkout"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-20"
                    >
                        {/* Final Review & Address */}
                        <div className="lg:col-span-7 space-y-16">
                            <header>
                                <h1 className="font-headline text-5xl md:text-6xl italic font-light tracking-tight mb-4">Complete Curation</h1>
                                <p className="font-label text-[10px] uppercase tracking-[0.3em] text-secondary font-black opacity-40">Finalize your selection for dispatch</p>
                            </header>

                            <form onSubmit={handlePlaceOrder} className="space-y-12">
                                <div className="space-y-8">
                                    <h2 className="font-headline text-2xl italic border-b border-black/5 pb-4">Shipping Destination</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="md:col-span-2 space-y-2 group">
                                            <label className="font-label text-[10px] uppercase tracking-widest font-black opacity-50">Street Address</label>
                                            <input required value={address} onChange={e=>setAddress(e.target.value)} type="text" className="w-full bg-transparent border-b border-primary/10 py-3 font-body text-lg outline-none focus:border-primary italic" />
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="font-label text-[10px] uppercase tracking-widest font-black opacity-50">City</label>
                                            <input required value={city} onChange={e=>setCity(e.target.value)} type="text" className="w-full bg-transparent border-b border-primary/10 py-3 font-body text-lg outline-none focus:border-primary italic" />
                                        </div>
                                        <div className="space-y-2 group">
                                            <label className="font-label text-[10px] uppercase tracking-widest font-black opacity-50">Postal Code</label>
                                            <input required value={postalCode} onChange={e=>setPostalCode(e.target.value)} type="text" className="w-full bg-transparent border-b border-primary/10 py-3 font-body text-lg outline-none focus:border-primary italic" />
                                        </div>
                                        <div className="md:col-span-2 space-y-2 group">
                                            <label className="font-label text-[10px] uppercase tracking-widest font-black opacity-50">Country</label>
                                            <input required value={country} onChange={e=>setCountry(e.target.value)} type="text" className="w-full bg-transparent border-b border-primary/10 py-3 font-body text-lg outline-none focus:border-primary italic" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <button 
                                        disabled={loading}
                                        className="w-full bg-primary text-on-primary py-7 px-10 flex justify-between items-center group transition-all duration-700 hover:bg-primary-dim shadow-lux disabled:opacity-50"
                                    >
                                        <span className="text-[10px] uppercase tracking-[0.4rem] font-black">{loading ? 'Securing Transaction...' : 'Finalize & Secure Curation'}</span>
                                        <span className="material-symbols-outlined group-hover:translate-x-4 transition-transform duration-700">lock</span>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Order Summary Sidebar */}
                        <div className="lg:col-span-5">
                            <div className="bg-surface-container-low p-12 space-y-12 shadow-lux border border-outline-variant/5 sticky top-32">
                                <h2 className="font-headline text-3xl italic tracking-tight">Curation Summary</h2>
                                <div className="space-y-8 divide-y divide-black/5">
                                    {cart.map(item => (
                                        <div key={item.product._id} className="flex gap-6 pt-6 first:pt-0">
                                            <img src={item.product.img || item.product.image} className="w-16 h-20 object-cover grayscale" alt={item.name} />
                                            <div className="flex-1">
                                                <h4 className="font-headline text-lg italic">{item.product.name}</h4>
                                                <p className="text-[10px] uppercase tracking-widest opacity-50 font-bold">Qty: {item.qty} • {formatPrice(item.product.price)}</p>
                                            </div>

                                        </div>
                                    ))}
                                </div>

                                <div className="pt-8 border-t border-black/5">
                                    <div className="flex gap-4 items-end">
                                        <div className="flex-1 space-y-2">
                                            <label className="font-label text-[9px] uppercase tracking-widest opacity-40 font-black">Promotion Vault</label>
                                            <input 
                                                value={promoCode}
                                                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                                                placeholder="ENTER CODE..."
                                                className="w-full bg-transparent border-b border-black/10 py-2 font-headline italic outline-none focus:border-primary text-lg" 
                                            />
                                        </div>
                                        <button 
                                            onClick={handleApplyPromo}
                                            disabled={isApplying || !promoCode}
                                            className="bg-primary/10 text-primary px-6 py-2 font-label text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                                        >
                                            {isApplying ? 'Checking...' : 'Apply'}
                                        </button>
                                    </div>
                                    {promoDiscount > 0 && <p className="mt-2 font-label text-[8px] uppercase font-black text-green-600 animate-pulse">Artisanal Code Captured: {promoDiscount}% Saved</p>}
                                </div>

                                <div className="pt-8 border-t border-black/10 space-y-4">
                                    <div className="flex justify-between text-sm italic opacity-60"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                                    {promoDiscount > 0 && (
                                        <div className="flex justify-between text-sm italic text-green-600"><span>Artisanal Discount ({promoDiscount}%)</span><span>-{formatPrice(discountAmount)}</span></div>
                                    )}
                                    <div className="flex justify-between text-sm italic opacity-60"><span>Taxes (8%)</span><span>{formatPrice(taxes)}</span></div>
                                    <div className="flex justify-between text-2xl font-light italic pt-4"><span>Total Value</span><span className="text-primary">{formatPrice(total)}</span></div>
                                </div>

                                
                                <div className="pt-8 border-t border-black/5">
                                    <p className="font-body text-sm italic text-center opacity-40 leading-relaxed">
                                        {currentQuote}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-3xl mx-auto text-center py-20 bg-white shadow-lux border border-primary/5 p-16"
                    >
                        <span className="material-symbols-outlined text-6xl text-primary mb-8 animate-pulse">check_circle</span>
                        <h1 className="font-headline text-6xl italic font-light mb-6">Curation Secured</h1>
                        <p className="font-body text-lg italic opacity-70 mb-12 leading-relaxed">
                            Your selection has been successfully reserved at our SOVRA. A personal shopper will oversee the artisanal packaging and dispatch of your pieces.
                        </p>
                        
                        <div className="bg-surface-container-low p-10 mb-12 space-y-4 text-left border-l-4 border-primary">
                            <p className="font-label text-[10px] uppercase tracking-widest font-black opacity-40">Order Identification</p>
                            <h3 className="font-headline text-3xl tracking-wider select-all">{orderInfo?._id}</h3>
                            <div className="pt-4 grid grid-cols-2 gap-8 text-[11px] uppercase tracking-widest font-bold">
                                <div>
                                    <p className="opacity-40 mb-1">Status</p>
                                    <p className="text-primary">{orderInfo?.status}</p>
                                </div>
                                <div>
                                    <p className="opacity-40 mb-1">Total Value</p>
                                    <p className="text-primary">{formatPrice(orderInfo?.totalPrice)}</p>
                                </div>

                            </div>
                        </div>

                        <div className="mb-12">
                            <p className="font-headline text-xl italic opacity-60">
                                {sovraQuotes[Math.floor(Math.random() * sovraQuotes.length)]}
                            </p>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 justify-center">
                            <button onClick={()=>navigate('/account')} className="bg-primary text-on-primary px-12 py-5 font-label uppercase tracking-widest text-[10px] font-black">View My Vault</button>
                            <button onClick={()=>navigate('/shop')} className="border border-primary/20 text-primary px-12 py-5 font-label uppercase tracking-widest text-[10px] font-black">Explore Further</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Checkout;
