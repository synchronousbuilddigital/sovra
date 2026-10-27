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
    RotateCcw
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
        try {
            setSubmittingReturn(true);
            const { data } = await api.post(`/orders/${id}/return`, { reason: returnReason });
            setOrder(data);
            setShowReturnForm(false);
            toast.success('Return request submitted successfully.');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Could not submit return request.');
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
                                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-50 p-4 rounded-xl">
                                    <div>
                                        <span className="text-[11px] uppercase font-bold text-gray-500 tracking-wider block">
                                            Courier Delivery Details
                                        </span>
                                        <p className="text-sm font-bold text-gray-900 mt-0.5">
                                            {order.carrier || 'Express Courier'}: <span className="font-mono">{order.trackingNumber}</span>
                                        </p>
                                    </div>
                                    <a
                                        href={`https://www.google.com/search?q=${encodeURIComponent((order.carrier || '') + ' tracking ' + order.trackingNumber)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-black hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors"
                                    >
                                        Track Package <ExternalLink size={13} />
                                    </a>
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

                            {/* Return Request Button */}
                            {order.status === 'Delivered' && !order.returnRequest?.isRequested && (
                                <div className="pt-2 border-t border-gray-100">
                                    <button
                                        onClick={() => setShowReturnForm(!showReturnForm)}
                                        className="w-full py-2.5 border border-gray-300 text-gray-800 hover:bg-gray-50 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                                    >
                                        <RotateCcw size={14} /> Request a Return
                                    </button>
                                    <p className="text-[11px] text-gray-400 text-center mt-1.5">
                                        Returns can be requested within 7 days of delivery.
                                    </p>
                                </div>
                            )}

                            {/* Return Form (Expandable) */}
                            {showReturnForm && (
                                <form onSubmit={handleReturnOrder} className="pt-3 border-t border-gray-100 space-y-3">
                                    <label className="text-xs font-bold text-gray-700 block">
                                        Reason for Return:
                                    </label>
                                    <textarea
                                        required
                                        value={returnReason}
                                        onChange={(e) => setReturnReason(e.target.value)}
                                        placeholder="Please tell us why you wish to return this item..."
                                        rows={3}
                                        className="w-full text-xs p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-black resize-none"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={submittingReturn}
                                            className="flex-1 py-2 bg-black text-white text-xs font-bold rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                        >
                                            {submittingReturn ? 'Submitting...' : 'Submit Request'}
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

                            {/* Return Status if already requested */}
                            {order.returnRequest?.isRequested && (
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1">
                                    <p className="font-bold text-gray-800">
                                        Return Status: <span className="capitalize">{order.returnRequest.status}</span>
                                    </p>
                                    <p className="text-gray-500">
                                        Requested on {new Date(order.returnRequest.requestedAt).toLocaleDateString()}
                                    </p>
                                    {order.statusUpdateReason && (
                                        <p className="text-gray-600 bg-white p-2 rounded border border-gray-200 mt-2">
                                            Store note: {order.statusUpdateReason}
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
