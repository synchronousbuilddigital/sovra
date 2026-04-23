import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { formatPrice } from '../utils/currency';


const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReturnForm, setShowReturnForm] = useState(false);
    const [returnReason, setReturnReason] = useState('');
    const [submittingReturn, setSubmittingReturn] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/orders/${id}`);
            setOrder(data);
        } catch (error) {
            toast.error('Could not retrieve order details from the archives.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    
    const cancelOrderHandler = async () => {
        if (window.confirm('Are you sure you wish to cancel this acquisition from House Sovra? This action is permanent.')) {
            try {
                const { data } = await api.put(`/orders/${id}/cancel`);
                setOrder(data);
                toast.success('Acquisition successfully cancelled.');
            } catch (error) {
                toast.error(error.response?.data?.message || 'Cancellation failed. Please contact the Maison.');
            }
        }
    };

    const returnOrderHandler = async (e) => {
        e.preventDefault();
        try {
            setSubmittingReturn(true);
            const { data } = await api.post(`/orders/${id}/return`, { reason: returnReason });
            setOrder(data);
            setShowReturnForm(false);
            toast.success('Return Request Logged in Archive');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Return request failed');
        } finally {
            setSubmittingReturn(false);
        }
    };


    if (loading) return <div className="pt-40 text-center font-headline text-2xl italic opacity-30">Consulting the Ledger...</div>;
    if (!order) return <div className="pt-40 text-center">Order not found in House Sovra records.</div>;

    const statusSteps = [
        { label: 'Pending', icon: 'pending_actions' },
        { label: 'Processing', icon: 'precision_manufacturing' },
        { label: 'Shipped', icon: 'local_shipping' },
        { label: 'Delivered', icon: 'verified' }
    ];

    const currentStepIndex = statusSteps.findIndex(s => s.label === order.status);

    return (
        <div className="pt-32 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto font-body selection:bg-primary-container selection:text-on-primary-container min-h-screen">
            <header className="mb-16 flex flex-col md:flex-row justify-between items-end gap-8">
                <div>
                    <Link to="/account" className="font-label text-[9px] uppercase tracking-widest text-primary/60 hover:text-primary mb-6 inline-flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">arrow_back</span> Return to Vault
                    </Link>
                    <h1 className="font-headline text-5xl md:text-6xl italic font-light tracking-tight mb-4">Curation Detail</h1>
                    <p className="font-label text-[10px] uppercase tracking-[0.3em] text-secondary font-black opacity-40">Identification: {order._id}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-4">
                    <span className="font-label text-[10px] uppercase tracking-widest text-primary bg-primary/5 px-4 py-2 border border-primary/10">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    <Link 
                        to={`/order/${order._id}/invoice`}
                        className="font-label text-[9px] uppercase tracking-widest text-primary/60 hover:text-primary transition-all underline underline-offset-4"
                    >
                        Download Acquisition Record
                    </Link>
                </div>

            </header>

            {/* Tracking Timeline */}
            <section className="mb-20 bg-surface-container-low p-12 shadow-sm border border-black/5">
                <h2 className="font-headline text-2xl italic mb-12 border-b border-black/5 pb-4">Artisanal Progress</h2>
                <div className="flex flex-col md:flex-row justify-between relative gap-12">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-[22px] left-0 w-full h-[1px] bg-black/5 -z-10"></div>

                    {statusSteps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;

                        return (
                            <div key={step.label} className="flex flex-col items-center gap-4 flex-1">
                                <div className={`w-12 h-12 flex items-center justify-center rounded-full transition-all duration-1000 ${isCompleted ? 'bg-primary text-white shadow-lg' : 'bg-white border border-black/5 text-black/20'}`}>
                                    <span className="material-symbols-outlined text-xl">{step.icon}</span>
                                </div>
                                <div className="text-center">
                                    <p className={`font-label text-[10px] uppercase tracking-widest font-black mb-1 ${isCompleted ? 'opacity-100' : 'opacity-20'}`}>{step.label}</p>
                                    {(isCurrent && step.label !== 'Delivered') && <p className="text-[9px] italic text-primary animate-pulse">In Progress</p>}
                                    {(isCurrent && step.label === 'Delivered') && <p className="text-[9px] italic text-primary">Masterwork Received</p>}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {order.trackingNumber && (
                    <div className="mt-12 pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div>
                            <p className="font-label text-[10px] uppercase tracking-[0.4em] font-black opacity-40 mb-2">Registry Logistics</p>
                            <h3 className="font-headline text-3xl italic">{order.carrier}: {order.trackingNumber}</h3>
                        </div>
                        <a 
                            href={`https://www.google.com/search?q=${order.carrier}+${order.trackingNumber}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-primary text-on-primary px-12 py-4 font-label text-[10px] uppercase tracking-widest font-black shadow-lux hover:opacity-90 transition-all"
                        >
                            Track My Piece
                        </a>
                    </div>
                )}
            </section>


            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                {/* Items & Shipping */}
                <div className="lg:col-span-8 space-y-16">
                    <div>
                        <h2 className="font-headline text-3xl italic mb-10 border-b border-black/5 pb-6">Curated Pieces</h2>
                        <div className="space-y-10">
                            {order.orderItems.map((item) => (
                                <div key={item.product} className="flex flex-col md:flex-row gap-8 items-center group">
                                    <div className="w-full md:w-32 aspect-[3/4] bg-surface-container overflow-hidden shadow-sm">
                                        <img src={item.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={item.name} />
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <h3 className="font-headline text-2xl italic">{item.name}</h3>
                                        <p className="text-[10px] uppercase tracking-widest opacity-40 font-bold">Ref: {item.product}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-body text-lg italic opacity-80">{formatPrice(item.price)} × {item.qty}</p>
                                        <p className="font-headline text-2xl font-light text-primary">{formatPrice(item.price * item.qty)}</p>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="bg-surface-container-low p-10 border border-black/5">
                            <h3 className="font-label text-[10px] uppercase tracking-[0.2em] font-black opacity-40 mb-8 pb-4 border-b border-black/5">Delivery Destination</h3>
                            <div className="font-body italic text-secondary leading-relaxed">
                                <p>{order.shippingAddress.address}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                <p>{order.shippingAddress.country}</p>
                            </div>
                        </div>
                        <div className="bg-surface-container-low p-10 border border-black/5">
                            <h3 className="font-label text-[10px] uppercase tracking-[0.2em] font-black opacity-40 mb-8 pb-4 border-b border-black/5">Payment Method</h3>
                            <div className="font-body italic text-secondary leading-relaxed">
                                <p>{order.paymentMethod}</p>
                                <p className={order.isPaid ? 'text-primary font-bold not-italic font-label text-[10px] uppercase' : 'text-error font-bold not-italic font-label text-[10px] uppercase'}>
                                    {order.isPaid ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}` : order.status === 'Delivered' ? 'Settled on Delivery' : 'Awaiting Settlement'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Financial Summary Overlay */}
                <div className="lg:col-span-4">
                    <div className="bg-primary text-on-primary p-12 shadow-lux space-y-12 sticky top-40">
                        <h2 className="font-headline text-3xl italic tracking-tight opacity-90">Order Value</h2>
                        <div className="space-y-6">
                            <div className="flex justify-between text-[11px] uppercase tracking-[0.2em] font-bold opacity-60"><span>Curation Subtotal</span><span>{formatPrice(order.totalPrice)}</span></div>
                            <div className="flex justify-between text-[11px] uppercase tracking-[0.2em] font-bold opacity-60"><span>White-Glove Shipping</span><span>{formatPrice(0)}</span></div>
                            <div className="pt-8 border-t border-white/10">
                                <div className="flex justify-between items-baseline mb-4">
                                    <span className="font-headline text-2xl italic font-light opacity-80">Total</span>
                                    <span className="font-headline text-5xl font-light">{formatPrice(order.totalPrice)}</span>
                                </div>
                                <p className="text-[9px] uppercase tracking-widest opacity-40 animate-pulse">Ref: Transaction Verified</p>
                            </div>
                        </div>


                        {/* Action Buttons */}
                        {(order.status === 'Pending' || order.status === 'Processing') && (
                            <div className="pt-10">
                                <button 
                                    onClick={cancelOrderHandler}
                                    className="w-full py-4 border border-white/20 text-white font-label text-[10px] uppercase tracking-[0.3em] font-black hover:bg-white hover:text-primary transition-all duration-500"
                                >
                                    Cancel Acquisition
                                </button>
                                <p className="font-body text-xs italic opacity-40 mt-6 leading-relaxed text-center">
                                    Cancellations are only available during the "Pending" or "Processing" stages of artisanal creation.
                                </p>
                            </div>
                        )}
                        
                        {(order.status === 'Delivered' && !order.returnRequest?.isRequested) && (
                           <div className="pt-10">
                               {showReturnForm ? (
                                   <form onSubmit={returnOrderHandler} className="space-y-6">
                                       <div className="space-y-2">
                                           <label className="text-[9px] uppercase tracking-widest font-black opacity-60">Provenance Return Reason</label>
                                           <textarea 
                                               required
                                               value={returnReason}
                                               onChange={e => setReturnReason(e.target.value)}
                                               className="w-full bg-white/10 border border-white/20 p-4 text-white font-body italic text-sm outline-none focus:border-white resize-none"
                                               placeholder="State the reason for return..."
                                               rows={3}
                                           ></textarea>
                                       </div>
                                       <button 
                                            disabled={submittingReturn}
                                            type="submit"
                                            className="w-full py-4 bg-white text-primary font-label text-[10px] uppercase tracking-widest font-black hover:opacity-90 disabled:opacity-50"
                                       >
                                           Secure Return Request
                                       </button>
                                       <button 
                                            type="button"
                                            onClick={() => setShowReturnForm(false)}
                                            className="w-full text-center text-[8px] uppercase tracking-widest font-black opacity-40 hover:opacity-100"
                                       >
                                           Cancel Form
                                       </button>
                                   </form>
                               ) : (
                                   <button 
                                       onClick={() => setShowReturnForm(true)}
                                       className="w-full py-4 border border-white/20 text-white font-label text-[10px] uppercase tracking-[0.3em] font-black hover:bg-white hover:text-primary transition-all duration-500"
                                   >
                                       Initiate Provenance Return
                                   </button>
                               )}
                               <p className="font-body text-xs italic opacity-40 mt-6 leading-relaxed text-center">
                                   Returns may be initiated for delivered masterpieces within 14 days of receipt.
                                </p>
                           </div>
                        )}

                        {order.returnRequest?.isRequested && (
                            <div className="pt-10 text-center bg-white/5 p-8 border border-white/10">
                                <span className="font-label text-[8px] uppercase tracking-[0.4em] text-white/40 block mb-4">Provenance Status</span>
                                <h3 className="font-headline text-2xl italic text-white mb-2">Return {order.returnRequest.status}</h3>
                                <p className="font-body text-xs italic text-white/60">Requested on {new Date(order.returnRequest.requestedAt).toLocaleDateString()}</p>
                                {order.returnRequest.status === 'Pending' && (
                                    <div className="mt-8 pt-6 border-t border-white/5">
                                        <p className="text-[9px] uppercase tracking-widest font-black opacity-30 animate-pulse italic">Maison Review in Progress</p>
                                    </div>
                                )}
                                {order.statusUpdateReason && (
                                    <div className="mt-6 p-4 bg-white/5 border border-white/10 italic text-[11px] opacity-70">
                                        Maison Note: {order.statusUpdateReason}
                                    </div>
                                )}
                            </div>
                        )}
                        
                        {order.status === 'Cancelled' && (
                           <div className="pt-10 text-center">
                               <p className="font-headline text-2xl italic text-white/40 mb-2">Acquisition Voided</p>
                               <p className="font-label text-[9px] uppercase tracking-widest text-white/20 mb-6">This order has been officially cancelled.</p>
                               {order.statusUpdateReason && (
                                   <div className="p-6 bg-white/5 border border-white/10 italic text-[11px] opacity-60 text-left">
                                       <span className="font-label text-[8px] uppercase not-italic block mb-2 opacity-40">Reason for Void</span>
                                       {order.statusUpdateReason}
                                   </div>
                               )}
                           </div>
                        )}

                        <div className="pt-10">
                            <p className="font-body text-xs italic leading-relaxed opacity-60 text-center">
                                "The value of a piece is measured by the heritage it represents and the moments it commemorates."
                            </p>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
