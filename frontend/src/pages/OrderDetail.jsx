import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { formatPrice } from '../utils/currency';
import { loadRazorpayScript } from '../utils/razorpay';
import {
    ArrowLeft,
    FileText,
    CheckCircle2,
    Clock,
    Package,
    Truck,
    MapPin,
    CreditCard,
    AlertCircle,
    XCircle,
    ExternalLink,
    ShieldCheck,
    RotateCcw,
    RefreshCw,
    Copy,
    Check
} from 'lucide-react';

const OrderDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [showReturnForm, setShowReturnForm] = useState(false);
    const [returnReason, setReturnReason] = useState('');
    const [submittingReturn, setSubmittingReturn] = useState(false);
    const [returnDetails, setReturnDetails] = useState('');
    const [hasUnboxingVideo, setHasUnboxingVideo] = useState(false);
    const [unboxingVideoUrl, setUnboxingVideoUrl] = useState('');
    const [uploadingVideo, setUploadingVideo] = useState(false);

    const handleVideoUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('video/')) {
            return toast.error('Please select a valid video file (MP4, MOV, WebM).');
        }

        if (file.size > 100 * 1024 * 1024) {
            return toast.error('Video size must be less than 100MB.');
        }

        const formData = new FormData();
        formData.append('media', file);

        try {
            setUploadingVideo(true);
            const { data } = await api.post('/upload/exchange-media', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setUnboxingVideoUrl(data.url);
            setHasUnboxingVideo(true);
            toast.success('Unboxing video uploaded successfully!');
        } catch (err) {
            console.error('Video upload error:', err);
            toast.error(err.response?.data?.message || 'Video upload failed. Please try again.');
        } finally {
            setUploadingVideo(false);
        }
    };

    const isWithin48Hours = () => {
        if (!order || (!order.isDelivered && order.status !== 'Delivered')) return false;
        const deliveryDate = order.deliveredAt || order.updatedAt;
        const diffHours = (Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60);
        return diffHours <= 48;
    };

    const getRemainingHours = () => {
        if (!order) return 0;
        const deliveryDate = order.deliveredAt || order.updatedAt;
        const diffHours = (Date.now() - new Date(deliveryDate).getTime()) / (1000 * 60 * 60);
        return Math.max(0, Math.ceil(48 - diffHours));
    };
    const [showTrackingModal, setShowTrackingModal] = useState(false);
    const [trackingData, setTrackingData] = useState(null);
    const [loadingTracking, setLoadingTracking] = useState(false);
    const [copiedAwb, setCopiedAwb] = useState(false);

    const handleOpenTracking = async () => {
        setShowTrackingModal(true);
        setLoadingTracking(true);
        try {
            const { data } = await api.get(`/shipping/order/${order._id}/track`);
            setTrackingData(data);
        } catch (err) {
            console.error('Tracking fetch error:', err);
            toast.error(err.response?.data?.message || 'Could not fetch live tracking.');
        } finally {
            setLoadingTracking(false);
        }
    };

    const handleCopyAwb = (awb) => {
        navigator.clipboard.writeText(awb);
        setCopiedAwb(true);
        toast.success('AWB copied to clipboard');
        setTimeout(() => setCopiedAwb(false), 2000);
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/orders/${id}`);
            setOrder(data);
        } catch (error) {
            toast.error('Could not find order details.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayNow = async () => {
        try {
            setPaying(true);
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                toast.error('Could not load payment gateway. Please check your internet connection.');
                return;
            }

            const { data: rzpOrder } = await api.post(`/payment/create-order/${order._id}`);

            const options = {
                key: rzpOrder.keyId,
                amount: rzpOrder.amount,
                currency: rzpOrder.currency || 'INR',
                name: 'SOVRA Jewellery',
                description: `Payment for Order #${order._id.slice(-8).toUpperCase()}`,
                order_id: rzpOrder.razorpayOrderId,
                handler: async function (response) {
                    try {
                        const verifyRes = await api.post('/payment/verify', {
                            orderId: order._id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        setOrder(verifyRes.data.order || { ...order, isPaid: true, status: 'Processing' });
                        toast.success('Payment completed successfully!');
                    } catch (verifyErr) {
                        console.error('Payment verification error:', verifyErr);
                        toast.error(verifyErr.response?.data?.message || 'Payment verification failed.');
                    }
                },
                prefill: {
                    name: order.shippingAddress?.fullName || order.user?.name || '',
                    email: order.user?.email || '',
                    contact: order.shippingAddress?.phone || order.user?.phone || ''
                },
                theme: {
                    color: '#111110'
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                toast.error(`Payment failed: ${response.error?.description || 'Transaction declined'}`);
            });
            rzp.open();
        } catch (err) {
            console.error('Failed to initiate payment:', err);
            toast.error(err.response?.data?.message || 'Failed to start payment.');
        } finally {
            setPaying(false);
        }
    };

    const handleCancelOrder = async () => {
        try {
            setCancelling(true);
            const { data } = await api.put(`/orders/${id}/cancel`, {
                reason: cancelReason || 'Cancelled by customer'
            });
            setOrder(data);
            setShowCancelModal(false);
            toast.success('Order cancelled successfully.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not cancel order. Please contact support.');
        } finally {
            setCancelling(false);
        }
    };

    const handleReturnOrder = async (e) => {
        e.preventDefault();
        if (!unboxingVideoUrl) {
            return toast.error('Please upload your continuous uncut unboxing video as required by Sovra policy.');
        }
        if (!hasUnboxingVideo) {
            return toast.error('You must confirm having a continuous uncut unboxing video as required by Sovra policy.');
        }
        try {
            setSubmittingReturn(true);
            const { data } = await api.post(`/orders/${id}/return`, {
                reason: returnReason || 'Damaged in transit',
                details: returnDetails,
                video: unboxingVideoUrl,
                hasUnboxingVideo: true,
            });
            setOrder(data);
            setShowReturnForm(false);
            toast.success('Exchange request submitted successfully. Our concierge will review your unboxing video.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not submit exchange request.');
        } finally {
            setSubmittingReturn(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-40 pb-20 flex flex-col items-center justify-center font-sans gap-3">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-gray-500">Loading your order details...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen pt-40 pb-20 max-w-lg mx-auto text-center font-sans px-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <Package size={28} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
                <p className="text-sm text-gray-500 mb-6">We could not find any details for this order number.</p>
                <Link
                    to="/account"
                    className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                    <ArrowLeft size={16} /> Back to My Orders
                </Link>
            </div>
        );
    }

    // Step definitions for order tracking
    const steps = [
        { key: 'Pending', label: 'Order Placed', desc: 'We received your order' },
        { key: 'Processing', label: 'Packing & Quality Check', desc: 'Preparing your items' },
        { key: 'Shipped', label: 'Shipped', desc: 'On its way to you' },
        { key: 'Delivered', label: 'Delivered', desc: 'Package delivered' }
    ];

    const getStepIndex = (status) => {
        switch (status) {
            case 'Pending': return 0;
            case 'Processing': return 1;
            case 'Shipped': return 2;
            case 'Delivered': return 3;
            case 'Cancelled': return -1;
            default: return 0;
        }
    };

    const currentStep = getStepIndex(order.status);
    const isCancelled = order.status === 'Cancelled';

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Delivered':
                return 'bg-emerald-50 text-emerald-800 border-emerald-200';
            case 'Shipped':
                return 'bg-blue-50 text-blue-800 border-blue-200';
            case 'Processing':
                return 'bg-amber-50 text-amber-800 border-amber-200';
            case 'Cancelled':
                return 'bg-rose-50 text-rose-800 border-rose-200';
            default:
                return 'bg-purple-50 text-purple-800 border-purple-200';
        }
    };

    const itemsTotal = order.orderItems?.reduce((acc, item) => acc + (item.price * item.qty), 0) || 0;
    const orderNumber = `SOV-${order._id.slice(-8).toUpperCase()}`;

    return (
        <div className="bg-[#faf9f6] min-h-screen text-[#111110] font-sans pt-28 md:pt-32 pb-24 px-4 sm:px-6 md:px-10">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Top Navigation & Header */}
                <div>
                    <Link
                        to="/account"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-black mb-4 transition-colors"
                    >
                        <ArrowLeft size={14} /> Back to My Orders
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                                    Order #{orderNumber}
                                </h1>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${getStatusBadge(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3">
                            <Link
                                to={`/order/${order._id}/invoice`}
                                className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400 px-4 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase shadow-xs transition-colors"
                            >
                                <FileText size={15} /> View Invoice
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Order Progress Stepper */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
                    <h2 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Truck size={18} className="text-gray-700" /> Order Tracking
                    </h2>

                    {isCancelled ? (
                        <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                            <XCircle size={22} className="text-rose-600 mt-0.5 shrink-0" />
                            <div>
                                <h3 className="text-base font-bold text-rose-900">Order Cancelled</h3>
                                <p className="text-xs text-rose-700 mt-1 leading-relaxed">
                                    {order.statusUpdateReason && order.statusUpdateReason.trim() !== 'no' && order.statusUpdateReason.trim() !== 'Cancelled by user/admin request.'
                                        ? `Reason: ${order.statusUpdateReason}`
                                        : 'This order was cancelled by customer request. No payment was charged.'}
                                </p>
                                <p className="text-[11px] text-rose-600 mt-1">
                                    If any amount was deducted, it will be refunded to your original payment method within 5–7 working days.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            {/* Horizontal Steps */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-2 relative">
                                {steps.map((step, idx) => {
                                    const isDone = idx <= currentStep;
                                    const isCurrent = idx === currentStep;

                                    return (
                                        <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                                            <div
                                                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-2 transition-all ${
                                                    isDone
                                                        ? 'bg-black text-white shadow-xs'
                                                        : 'bg-gray-100 text-gray-400 border border-gray-200'
                                                }`}
                                            >
                                                {isDone ? <CheckCircle2 size={18} /> : <span>{idx + 1}</span>}
                                            </div>
                                            <p className={`text-xs font-bold ${isCurrent ? 'text-black' : isDone ? 'text-gray-800' : 'text-gray-400'}`}>
                                                {step.label}
                                            </p>
                                            <p className="text-[11px] text-gray-400 mt-0.5 hidden sm:block">
                                                {step.desc}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Tracking Info if Shipped */}
                            {order.trackingNumber && (
                                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-stone-50 to-amber-50/30 p-5 rounded-2xl border border-stone-200/60">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-primary/10 text-primary border border-primary/20">
                                                <Truck size={11} /> {order.carrier || 'Express Logistics'}
                                            </span>
                                            {order.ad2ship?.shipmentStatus && (
                                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                                    {order.ad2ship.shipmentStatus}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm font-bold text-stone-900 flex items-center gap-2">
                                            AWB: <span className="font-mono tracking-wider text-primary">{order.trackingNumber}</span>
                                            <button
                                                onClick={() => handleCopyAwb(order.trackingNumber)}
                                                className="text-stone-400 hover:text-stone-700 transition-colors p-1"
                                                title="Copy AWB Number"
                                            >
                                                {copiedAwb ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                                            </button>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={handleOpenTracking}
                                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 text-xs font-bold text-white bg-stone-900 hover:bg-black px-4 py-2.5 rounded-xl shadow-sm transition-all"
                                        >
                                            <Truck size={13} /> Live Tracking
                                        </button>
                                        <a
                                            href={`https://www.google.com/search?q=${encodeURIComponent((order.carrier || '') + ' tracking ' + order.trackingNumber)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center p-2.5 rounded-xl border border-stone-200 hover:bg-white text-stone-600 transition-colors"
                                            title="External Courier Link"
                                        >
                                            <ExternalLink size={13} />
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Main Content Grid: Items (Left) + Summary & Actions (Right) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left: Ordered Items & Addresses */}
                    <div className="lg:col-span-8 space-y-6">
                        
                        {/* Items in this order */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-8 shadow-xs">
                            <h2 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Package size={18} className="text-gray-700" /> Items in this Order ({order.orderItems?.length || 0})
                            </h2>

                            <div className="divide-y divide-gray-100">
                                {order.orderItems?.map((item) => (
                                    <div key={item.product} className="py-4 first:pt-0 last:pb-0 flex items-center gap-4 sm:gap-6">
                                        <Link to={`/product/${item.product}`} className="shrink-0 group">
                                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                        </Link>

                                        <div className="flex-1 min-w-0">
                                            <Link
                                                to={`/product/${item.product}`}
                                                className="text-sm sm:text-base font-bold text-gray-900 hover:text-[#6e5b44] transition-colors truncate block"
                                            >
                                                {item.name}
                                            </Link>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                SKU: SOV-{item.product.slice(-6).toUpperCase()} • 18K Gold Plated
                                            </p>
                                            <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
                                                <span>Qty: <strong>{item.qty}</strong></span>
                                                <span>•</span>
                                                <span>Price: <strong>{formatPrice(item.price)}</strong></span>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
                                            <p className="text-sm sm:text-base font-bold text-gray-900">
                                                {formatPrice(item.price * item.qty)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Addresses & Payment Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Shipping Address */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                                    <MapPin size={15} /> Delivery Address
                                </h3>
                                <p className="text-sm font-bold text-gray-900">
                                    {order.shippingAddress?.fullName || order.user?.name || 'Customer'}
                                </p>
                                <div className="text-xs text-gray-600 space-y-1 mt-1 leading-relaxed">
                                    <p>{order.shippingAddress?.address}</p>
                                    <p>
                                        {order.shippingAddress?.city}
                                        {order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''} - {order.shippingAddress?.postalCode}
                                    </p>
                                    <p>{order.shippingAddress?.country || 'India'}</p>
                                    {(order.shippingAddress?.phone || order.user?.phone) && (
                                        <p className="pt-1">
                                            <strong>Phone:</strong> {order.shippingAddress?.phone || order.user?.phone}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Payment Information */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                                    <CreditCard size={15} /> Payment Method
                                </h3>
                                <p className="text-sm font-bold text-gray-900 capitalize">
                                    {order.paymentMethod || 'Online Payment'}
                                </p>
                                <div className="mt-3">
                                    {isCancelled ? (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                                            <XCircle size={13} />
                                            <span>Order Cancelled (Unpaid)</span>
                                        </div>
                                    ) : order.isPaid ? (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                            <CheckCircle2 size={13} />
                                            <span>Paid {order.paidAt ? `on ${new Date(order.paidAt).toLocaleDateString()}` : ''}</span>
                                        </div>
                                    ) : order.paymentMethod?.toLowerCase().includes('cod') ? (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                            <Clock size={13} />
                                            <span>Pay on Delivery</span>
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                            <AlertCircle size={13} />
                                            <span>Payment Pending</span>
                                        </div>
                                    )}
                                </div>
                                {order.razorpayPaymentId && (
                                    <p className="text-[11px] text-gray-400 font-mono mt-2">
                                        Txn ID: {order.razorpayPaymentId}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Summary Card & Action Buttons */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* Order Summary Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
                            <h2 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
                                Order Summary
                            </h2>

                            <div className="space-y-2.5 text-xs text-gray-600">
                                <div className="flex justify-between">
                                    <span>Items Subtotal:</span>
                                    <span className="font-semibold text-gray-900">{formatPrice(itemsTotal)}</span>
                                </div>
                                {order.discountPrice > 0 && (
                                    <div className="flex justify-between text-emerald-700">
                                        <span>Discount {order.promoCode ? `(${order.promoCode})` : ''}:</span>
                                        <span className="font-bold">- {formatPrice(order.discountPrice)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Delivery Fee:</span>
                                    <span className="font-semibold text-gray-900">
                                        {order.shippingPrice > 0 ? formatPrice(order.shippingPrice) : 'FREE'}
                                    </span>
                                </div>
                                <div className="flex justify-between text-[11px] text-gray-400">
                                    <span>Taxes (3% GST Included):</span>
                                    <span>Included</span>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                                <span className="text-sm font-bold text-gray-900">Total Amount:</span>
                                <span className="text-2xl font-extrabold text-gray-900">
                                    {formatPrice(order.totalPrice)}
                                </span>
                            </div>

                            {/* Pay Now Button for unpaid online orders */}
                            {!order.isPaid && !isCancelled && !order.paymentMethod?.toLowerCase().includes('cod') && (
                                <div className="pt-2">
                                    <button
                                        onClick={handlePayNow}
                                        disabled={paying}
                                        className="w-full py-3 bg-black hover:bg-gray-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        <CreditCard size={15} />
                                        <span>{paying ? 'Processing...' : 'Pay Now with Razorpay'}</span>
                                    </button>
                                    <p className="text-[10px] text-gray-400 text-center mt-2 flex items-center justify-center gap-1">
                                        <ShieldCheck size={12} className="text-emerald-600" /> 100% Secure Payment via Razorpay
                                    </p>
                                </div>
                            )}

                            {/* Cancel Order Button */}
                            {(order.status === 'Pending' || order.status === 'Processing') && (
                                <div className="pt-2 border-t border-gray-100">
                                    <button
                                        onClick={() => setShowCancelModal(true)}
                                        className="w-full py-2.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                                    >
                                        Cancel Order
                                    </button>
                                    <p className="text-[11px] text-gray-400 text-center mt-1.5">
                                        You can cancel your order before it gets shipped.
                                    </p>
                                </div>
                            )}

                            {/* Exchange Request Section (Strictly 48 Hours & Unboxing Video) */}
                            {order.status === 'Delivered' && !order.returnRequest?.isRequested && (
                                <div className="pt-2 border-t border-gray-100 space-y-2">
                                    {isWithin48Hours() ? (
                                        <>
                                            <button
                                                onClick={() => setShowReturnForm(!showReturnForm)}
                                                className="w-full py-2.5 border border-amber-300/80 bg-amber-50/50 hover:bg-amber-50 text-amber-900 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                            >
                                                <RotateCcw size={14} /> Request an Exchange
                                            </button>
                                            <div className="text-[11px] text-stone-500 text-center leading-relaxed">
                                                <span>Exchange window closes in <strong>{getRemainingHours()} hours</strong>.</span>
                                                <p className="text-[10px] text-stone-400 mt-0.5">
                                                    Exchanges provided for transit damage or defect with mandatory unboxing video (no returns/refunds).
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="p-3 bg-stone-50 rounded-xl text-center text-xs text-stone-500 border border-stone-200">
                                            <span>The 48-hour exchange window for this delivery has concluded.</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Exchange Form (Expandable) */}
                            {showReturnForm && isWithin48Hours() && (
                                <form onSubmit={handleReturnOrder} className="pt-3 border-t border-gray-100 space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-800 block">
                                            Reason for Exchange:
                                        </label>
                                        <select
                                            value={returnReason}
                                            onChange={(e) => setReturnReason(e.target.value)}
                                            className="w-full text-xs p-2.5 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:border-black bg-white"
                                        >
                                            <option value="Damaged in transit">Damaged in transit</option>
                                            <option value="Defective / Quality flaw">Defective / Quality flaw</option>
                                            <option value="Wrong piece delivered">Wrong piece delivered</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-800 block">
                                            Details of the defect/damage:
                                        </label>
                                        <textarea
                                            required
                                            value={returnDetails}
                                            onChange={(e) => setReturnDetails(e.target.value)}
                                            placeholder="Please describe the defect or transit damage clearly..."
                                            rows={3}
                                            className="w-full text-xs p-3 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-800 block mb-1">
                                            Upload Mandatory Unboxing Video <span className="text-red-500">*</span>:
                                        </label>
                                        <p className="text-[11px] text-gray-500 mb-2">
                                            Continuous, uncut video showing the sealed courier package and item inspection (MP4, MOV, WebM, Max 100MB).
                                        </p>

                                        {unboxingVideoUrl ? (
                                            <div className="space-y-2 p-3 bg-gray-50 rounded-xl border border-gray-200">
                                                <video
                                                    src={unboxingVideoUrl}
                                                    controls
                                                    className="w-full max-h-52 rounded-lg bg-black"
                                                    preload="metadata"
                                                />
                                                <div className="flex justify-between items-center pt-1">
                                                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                                                        ✓ Unboxing video uploaded
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => { setUnboxingVideoUrl(''); setHasUnboxingVideo(false); }}
                                                        className="text-[11px] text-red-600 font-bold hover:underline"
                                                    >
                                                        Replace Video
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative border-2 border-dashed border-gray-300 hover:border-black rounded-xl p-4 text-center transition-colors bg-white">
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    required
                                                    disabled={uploadingVideo}
                                                    onChange={handleVideoUpload}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                />
                                                {uploadingVideo ? (
                                                    <div className="flex flex-col items-center justify-center gap-2 py-3">
                                                        <div className="w-5 h-5 border-2 border-[#855e23] border-t-transparent rounded-full animate-spin" />
                                                        <span className="text-xs font-semibold text-[#855e23]">Uploading unboxing video... Please wait...</span>
                                                        <span className="text-[10px] text-gray-400">Do not refresh</span>
                                                    </div>
                                                ) : (
                                                    <div className="py-2 flex flex-col items-center">
                                                        <span className="text-2xl mb-1">📹</span>
                                                        <span className="text-xs font-bold text-gray-800">Click or tap to upload unboxing video</span>
                                                        <span className="text-[10px] text-gray-400 mt-0.5">MP4, MOV, WebM up to 100MB</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200/80 flex items-start gap-2">
                                        <input
                                            type="checkbox"
                                            id="unboxingCheck"
                                            required
                                            checked={hasUnboxingVideo}
                                            onChange={(e) => setHasUnboxingVideo(e.target.checked)}
                                            className="mt-0.5 accent-[#855e23] cursor-pointer"
                                        />
                                        <label htmlFor="unboxingCheck" className="text-[11px] text-amber-900 leading-snug cursor-pointer font-medium">
                                            I confirm this is a continuous, uncut unboxing video showing the sealed package being opened (Mandatory as per Sovra Exchange Policy).
                                        </label>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={submittingReturn || uploadingVideo || !unboxingVideoUrl || !hasUnboxingVideo}
                                            className="flex-1 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                        >
                                            {submittingReturn ? 'Submitting...' : 'Submit Exchange Request'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowReturnForm(false)}
                                            className="px-3 py-2 border border-gray-300 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Exchange Status if already requested */}
                            {order.returnRequest?.isRequested && (
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
                                    <p className="font-bold text-gray-800">
                                        Exchange Status: <span className="capitalize">{order.returnRequest.status}</span>
                                    </p>
                                    <p className="text-gray-500">
                                        Requested on {new Date(order.returnRequest.requestedAt).toLocaleDateString()}
                                    </p>
                                    <p className="text-[11px] text-stone-500">
                                        Reason: {order.returnRequest.reason}
                                    </p>
                                    {order.returnRequest.video && (
                                        <div className="pt-2">
                                            <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">Your Uploaded Unboxing Video:</p>
                                            <div className="rounded-lg overflow-hidden bg-black max-w-sm">
                                                <video src={order.returnRequest.video} controls className="w-full max-h-48 object-contain" />
                                            </div>
                                            <a href={order.returnRequest.video} target="_blank" rel="noreferrer" className="text-[11px] text-stone-600 underline hover:text-black mt-1 inline-block">
                                                View full video in new tab ↗
                                            </a>
                                        </div>
                                    )}
                                    {order.statusUpdateReason && (
                                        <p className="text-gray-600 bg-white p-2 rounded border border-gray-200 mt-2">
                                            Concierge note: {order.statusUpdateReason}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Customer Support Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs text-xs space-y-2">
                            <h3 className="font-bold text-gray-900">Need help with this order?</h3>
                            <p className="text-gray-500 leading-relaxed">
                                Our support team is here to assist you with tracking, sizing, or any delivery questions.
                            </p>
                            <div className="pt-2 text-gray-700 space-y-1 font-medium">
                                <p>Email: <a href="mailto:support@sovra.in" className="text-black font-semibold underline">support@sovra.in</a></p>
                                <p>Phone: <a href="tel:9571746435" className="text-black font-semibold underline">+91 9571746435</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live Shipment Tracking Modal */}
            {showTrackingModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-100 space-y-6 max-h-[85vh] flex flex-col">
                        <div className="flex items-start justify-between border-b border-stone-100 pb-4">
                            <div>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-primary">Shipment Tracking</span>
                                <h3 className="text-xl font-bold text-stone-900 mt-0.5 flex items-center gap-2">
                                    <Truck size={20} className="text-primary" /> {order.carrier || 'Express Courier'}
                                </h3>
                                <p className="text-xs font-mono text-stone-500 mt-1">AWB: {order.trackingNumber}</p>
                            </div>
                            <button
                                onClick={() => setShowTrackingModal(false)}
                                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors"
                            >
                                <XCircle size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                            {loadingTracking ? (
                                <div className="py-12 text-center space-y-3">
                                    <RefreshCw size={24} className="animate-spin text-primary mx-auto" />
                                    <p className="text-xs font-semibold text-stone-500">Fetching live courier scans...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-stone-400">Current Status</p>
                                            <p className="text-sm font-bold text-stone-900 mt-0.5">
                                                {trackingData?.status || order.ad2ship?.shipmentStatus || order.status}
                                            </p>
                                        </div>
                                        <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                                    </div>

                                    {/* Timeline events */}
                                    <div className="space-y-3 pt-2">
                                        <p className="text-[10px] uppercase font-bold tracking-wider text-stone-400">Scan History</p>
                                        {trackingData?.data?.scans && trackingData.data.scans.length > 0 ? (
                                            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                                                {trackingData.data.scans.map((scan, idx) => (
                                                    <div key={idx} className="relative space-y-1">
                                                        <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10" />
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-xs font-bold text-stone-800">{scan.status || scan.activity}</p>
                                                            <span className="text-[10px] text-stone-400 font-mono">{scan.date || scan.time || ''}</span>
                                                        </div>
                                                        {scan.location && (
                                                            <p className="text-[11px] text-stone-500 flex items-center gap-1">
                                                                <MapPin size={11} /> {scan.location}
                                                            </p>
                                                        )}
                                                        {scan.remarks && (
                                                            <p className="text-[11px] text-stone-400 italic">{scan.remarks}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : order.ad2ship?.trackingHistory && order.ad2ship.trackingHistory.length > 0 ? (
                                            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                                                {order.ad2ship.trackingHistory.map((scan, idx) => (
                                                    <div key={idx} className="relative space-y-1">
                                                        <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10" />
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-xs font-bold text-stone-800">{scan.status || scan.statusDescription}</p>
                                                            <span className="text-[10px] text-stone-400 font-mono">{scan.eventDate}</span>
                                                        </div>
                                                        {scan.location && (
                                                            <p className="text-[11px] text-stone-500 flex items-center gap-1">
                                                                <MapPin size={11} /> {scan.location}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-6 bg-stone-50 rounded-2xl border border-stone-100">
                                                <Package size={24} className="text-stone-300 mx-auto mb-2" />
                                                <p className="text-xs text-stone-500 font-medium">Package registered with {order.carrier || 'Courier'}.</p>
                                                <p className="text-[11px] text-stone-400 mt-0.5">Live transit scans usually reflect within 4-6 hours of pickup handover.</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                            <button
                                onClick={handleOpenTracking}
                                disabled={loadingTracking}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 hover:text-stone-900"
                            >
                                <RefreshCw size={12} className={loadingTracking ? 'animate-spin' : ''} /> Refresh Scans
                            </button>
                            <button
                                onClick={() => setShowTrackingModal(false)}
                                className="px-5 py-2 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Order Confirmation Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
                        <div className="flex items-center gap-3 text-rose-600">
                            <AlertCircle size={24} />
                            <h3 className="text-lg font-bold text-gray-900">Cancel Order</h3>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Are you sure you want to cancel order <strong>#{orderNumber}</strong>? Once cancelled, this action cannot be undone.
                        </p>
                        <div>
                            <label className="text-xs font-semibold text-gray-700 block mb-1">
                                Reason for cancellation (Optional):
                            </label>
                            <input
                                type="text"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="E.g., Ordered by mistake, wrong address"
                                className="w-full text-xs p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowCancelModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50"
                            >
                                Keep Order
                            </button>
                            <button
                                type="button"
                                disabled={cancelling}
                                onClick={handleCancelOrder}
                                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold hover:bg-rose-700 disabled:opacity-50"
                            >
                                {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetail;
