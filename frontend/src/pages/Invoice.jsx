import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatPrice } from '../utils/currency';
import { Printer, ArrowLeft, ShieldCheck, Mail, Phone, Globe, MapPin, CheckCircle2 } from 'lucide-react';

const Invoice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                setOrder(data);
            } catch (error) {
                console.error('Failed to fetch invoice:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    // Helper: Convert number to Indian currency words
    const numberToWords = (num) => {
        if (!num || isNaN(num)) return 'Zero Rupees Only';
        const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        const inWords = (n) => {
            if (n === 0) return '';
            if (n < 20) return a[n];
            const digit = n % 10;
            return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
        };

        let n = Math.floor(Math.abs(num));
        if (n === 0) return 'Zero Rupees Only';

        let str = '';
        const crore = Math.floor(n / 10000000);
        n %= 10000000;
        const lakh = Math.floor(n / 100000);
        n %= 100000;
        const thousand = Math.floor(n / 1000);
        n %= 1000;
        const hundred = Math.floor(n / 100);
        const rest = n % 100;

        if (crore > 0) str += inWords(crore) + ' Crore ';
        if (lakh > 0) str += inWords(lakh) + ' Lakh ';
        if (thousand > 0) str += inWords(thousand) + ' Thousand ';
        if (hundred > 0) str += inWords(hundred) + ' Hundred ';
        if (rest > 0) {
            if (str !== '') str += 'and ';
            str += inWords(rest) + ' ';
        }
        return 'INR ' + str.trim() + ' Only';
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-white font-sans text-gray-500 gap-3">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
                <p className="text-xs uppercase tracking-widest font-semibold">Generating Tax Invoice...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-white font-sans text-gray-600 gap-4">
                <p className="text-base font-medium">Invoice record not found.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 border border-gray-300 text-xs uppercase tracking-wider font-semibold rounded hover:bg-gray-50"
                >
                    Return
                </button>
            </div>
        );
    }

    // Calculations
    const itemsTotal = order.orderItems?.reduce((acc, item) => acc + (item.price * item.qty), 0) || 0;
    const shippingAmount = order.shippingPrice || 0;
    const discountAmount = order.discountPrice || 0;
    const grandTotal = order.totalPrice || 0;

    // GST calculation (Jewellery standard in India: 3% GST inclusive)
    const netTaxable = Math.round(((grandTotal - shippingAmount) / 1.03) * 100) / 100;
    const totalGst = Math.max(0, Math.round(((grandTotal - shippingAmount) - netTaxable) * 100) / 100);
    const isRajasthan = (order.shippingAddress?.state || '').toLowerCase().includes('rajasthan');
    const cgst = Math.round((totalGst / 2) * 100) / 100;
    const sgst = Math.round((totalGst - cgst) * 100) / 100;

    const invoiceNumber = `INV-SOV-${order._id.slice(-8).toUpperCase()}`;
    const orderNumber = `#SOV-${order._id.slice(-8).toUpperCase()}`;

    return (
        <div className="min-h-screen bg-gray-100/70 text-[#111110] font-sans print:bg-white print:p-0 py-8 px-4 sm:px-6 md:px-10">
            {/* Top Action Bar (Hidden in Print) */}
            <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-gray-600 hover:text-black transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Order
                </button>
                <div className="flex items-center gap-3">
                    <span className="hidden sm:inline text-xs text-gray-500">
                        Tip: Choose "Save as PDF" in the print dialog to export
                    </span>
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-md shadow-sm transition-all cursor-pointer"
                    >
                        <Printer size={15} /> Print Invoice
                    </button>
                </div>
            </div>

            {/* Printable Invoice Sheet */}
            <div className="print-invoice-sheet max-w-4xl mx-auto bg-white border border-gray-200 shadow-lg rounded-none p-6 sm:p-10 md:p-12 relative overflow-hidden">
                
                {/* Header: Company Logo & Details + Invoice Title Box */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b-2 border-gray-900">
                    {/* Left: Brand Logo & Business Information */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-3.5">
                            <img
                                src="/logo.png"
                                alt="SOVRA Logo"
                                className="h-16 w-auto object-contain mix-blend-multiply"
                            />
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <h1 className="font-headline text-3xl font-bold tracking-wider text-black uppercase leading-none">
                                        SOVRA
                                    </h1>
                                    <span className="text-[10px] font-sans font-extrabold uppercase tracking-widest text-[#6e5b44] bg-[#faf6f0] px-2 py-0.5 rounded border border-[#6e5b44]/20">
                                        Jewellery
                                    </span>
                                </div>
                                <p className="text-[11px] font-medium tracking-wide text-gray-600 mt-0.5">
                                    Demi-Fine Everyday Jewellery • Udaipur
                                </p>
                            </div>
                        </div>

                        <div className="text-[11px] text-gray-600 leading-snug pt-1">
                            <p className="font-semibold text-gray-800">Sovra Lifestyle Private Limited</p>
                            <p>23, Pulla Beside Platinum Square, RK Circle</p>
                            <p>Udaipur - 313001, Rajasthan, India</p>
                            <p className="text-gray-500">
                                <strong>Email:</strong> support@sovra.in | <strong>Phone:</strong> +91 9571746435 | <strong>Web:</strong> www.sovra.in
                            </p>
                            <p className="text-gray-800 font-mono font-bold mt-1">
                                GSTIN: <span className="text-black">08AAECS1234F1Z5</span> &nbsp;|&nbsp; State Code: 08 (Rajasthan)
                            </p>
                        </div>
                    </div>

                    {/* Right: Tax Invoice Details Box */}
                    <div className="sm:text-right w-full sm:w-auto bg-gray-50 sm:bg-transparent p-4 sm:p-0 rounded border sm:border-0 border-gray-200">
                        <div className="inline-block sm:text-right">
                            <span className="inline-block font-headline text-2xl font-extrabold tracking-tight text-black uppercase">
                                TAX INVOICE
                            </span>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                                Original for Recipient
                            </p>
                        </div>

                        <div className="mt-3 space-y-1 text-xs">
                            <div className="flex justify-between sm:justify-end gap-3">
                                <span className="text-gray-500 font-medium">Invoice No:</span>
                                <span className="font-mono font-bold text-gray-900">{invoiceNumber}</span>
                            </div>
                            <div className="flex justify-between sm:justify-end gap-3">
                                <span className="text-gray-500 font-medium">Invoice Date:</span>
                                <span className="font-semibold text-gray-900">{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex justify-between sm:justify-end gap-3">
                                <span className="text-gray-500 font-medium">Order ID:</span>
                                <span className="font-mono font-bold text-gray-900">{orderNumber}</span>
                            </div>
                            <div className="flex justify-between sm:justify-end gap-3">
                                <span className="text-gray-500 font-medium">Payment Mode:</span>
                                <span className="font-semibold text-gray-900 uppercase">
                                    {order.paymentMethod || 'Online Prepaid'}
                                </span>
                            </div>
                            <div className="flex justify-between sm:justify-end gap-3 items-center pt-1">
                                <span className="text-gray-500 font-medium">Payment Status:</span>
                                <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                                    order.status === 'Cancelled'
                                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                        : order.isPaid
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : order.paymentMethod?.toLowerCase().includes('cod')
                                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}>
                                    {order.status === 'Cancelled' ? 'CANCELLED (VOID)' : order.isPaid ? 'PAID' : (order.paymentMethod?.toLowerCase().includes('cod') ? 'PAY ON DELIVERY' : 'UNPAID')}
                                </span>
                            </div>
                            {order.razorpayPaymentId && (
                                <div className="flex justify-between sm:justify-end gap-3 text-[10px]">
                                    <span className="text-gray-500 font-medium">Txn Ref ID:</span>
                                    <span className="font-mono text-gray-700">{order.razorpayPaymentId}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section: Billed To and Shipped To (Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-gray-200">
                    {/* Billed To */}
                    <div className="bg-gray-50/70 p-4 rounded border border-gray-200">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 block mb-1">
                            Billed To (Customer Details)
                        </span>
                        <p className="text-sm font-bold text-gray-900">
                            {order.shippingAddress?.fullName || order.user?.name || 'Valued Customer'}
                        </p>
                        <div className="text-xs text-gray-600 space-y-0.5 mt-1 leading-relaxed">
                            <p>{order.shippingAddress?.address}</p>
                            <p>
                                {order.shippingAddress?.city}
                                {order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''} - {order.shippingAddress?.postalCode}
                            </p>
                            <p>{order.shippingAddress?.country || 'India'}</p>
                            {order.user?.email && (
                                <p className="pt-0.5"><strong className="text-gray-700">Email:</strong> {order.user.email}</p>
                            )}
                            {(order.shippingAddress?.phone || order.user?.phone) && (
                                <p><strong className="text-gray-700">Phone:</strong> {order.shippingAddress?.phone || order.user?.phone}</p>
                            )}
                            <p className="text-[10px] text-gray-500 font-medium pt-1">
                                Place of Supply: {order.shippingAddress?.state || 'Rajasthan'} ({isRajasthan ? 'State Code: 08' : 'Inter-State'})
                            </p>
                        </div>
                    </div>

                    {/* Shipped To */}
                    <div className="bg-gray-50/70 p-4 rounded border border-gray-200">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 block mb-1">
                            Shipped To (Delivery Address)
                        </span>
                        <p className="text-sm font-bold text-gray-900">
                            {order.shippingAddress?.fullName || order.user?.name || 'Valued Customer'}
                        </p>
                        <div className="text-xs text-gray-600 space-y-0.5 mt-1 leading-relaxed">
                            <p>{order.shippingAddress?.address}</p>
                            <p>
                                {order.shippingAddress?.city}
                                {order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''} - {order.shippingAddress?.postalCode}
                            </p>
                            <p>{order.shippingAddress?.country || 'India'}</p>
                            {(order.shippingAddress?.phone || order.user?.phone) && (
                                <p className="pt-0.5"><strong className="text-gray-700">Contact:</strong> {order.shippingAddress?.phone || order.user?.phone}</p>
                            )}
                            <div className="pt-1 text-[10px] text-gray-500 flex flex-wrap gap-x-4">
                                <span><strong>Logistics Partner:</strong> {order.carrier || 'Standard Express'}</span>
                                {order.trackingNumber && (
                                    <span><strong>AWB / Tracking:</strong> {order.trackingNumber}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Items Table */}
                <div className="mt-5 mb-5 overflow-x-auto">
                    <table className="w-full text-left border-collapse border border-gray-300">
                        <thead>
                            <tr className="bg-gray-100 text-gray-800 text-[10px] uppercase font-bold tracking-wider border-b border-gray-300">
                                <th className="py-2.5 px-3 border-r border-gray-300 text-center w-10">#</th>
                                <th className="py-2.5 px-3 border-r border-gray-300">Item Description</th>
                                <th className="py-2.5 px-3 border-r border-gray-300 text-center w-20">HSN</th>
                                <th className="py-2.5 px-3 border-r border-gray-300 text-center w-14">Qty</th>
                                <th className="py-2.5 px-3 border-r border-gray-300 text-right w-24">Gross Rate</th>
                                <th className="py-2.5 px-3 border-r border-gray-300 text-right w-24">Taxable</th>
                                <th className="py-2.5 px-3 border-r border-gray-300 text-right w-24">GST (3%)</th>
                                <th className="py-2.5 px-3 text-right w-28">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-xs">
                            {order.orderItems?.map((item, index) => {
                                const lineGross = item.price * item.qty;
                                const lineTaxable = Math.round((lineGross / 1.03) * 100) / 100;
                                const lineGst = Math.round((lineGross - lineTaxable) * 100) / 100;
                                const itemSku = item.product ? `SOV-${item.product.slice(-6).toUpperCase()}` : 'SOV-JEWEL';

                                return (
                                    <tr key={item.product || index} className="hover:bg-gray-50/50">
                                        <td className="py-3 px-3 text-center border-r border-gray-200 text-gray-500 font-mono">
                                            {index + 1}
                                        </td>
                                        <td className="py-3 px-3 border-r border-gray-200">
                                            <div className="font-semibold text-gray-900">{item.name}</div>
                                            <div className="text-[10px] font-mono text-gray-500 mt-0.5">
                                                SKU: {itemSku} &nbsp;•&nbsp; 18K PVD Gold Plated
                                            </div>
                                        </td>
                                        <td className="py-3 px-3 text-center border-r border-gray-200 font-mono text-gray-600 text-[11px]">
                                            7117
                                        </td>
                                        <td className="py-3 px-3 text-center border-r border-gray-200 font-semibold text-gray-900">
                                            {item.qty}
                                        </td>
                                        <td className="py-3 px-3 text-right border-r border-gray-200 font-mono text-gray-700">
                                            {formatPrice(item.price)}
                                        </td>
                                        <td className="py-3 px-3 text-right border-r border-gray-200 font-mono text-gray-700">
                                            {formatPrice(lineTaxable)}
                                        </td>
                                        <td className="py-3 px-3 text-right border-r border-gray-200 font-mono text-gray-700">
                                            {formatPrice(lineGst)}
                                        </td>
                                        <td className="py-3 px-3 text-right font-mono font-bold text-gray-900">
                                            {formatPrice(lineGross)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Section: Calculation Summary & Amount in Words */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-4 border-t border-b border-gray-200">
                    {/* Left: Words, Tax Breakdown Table, Barcode */}
                    <div className="space-y-4">
                        <div>
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 block mb-0.5">
                                Amount in Words
                            </span>
                            <p className="text-xs font-semibold text-gray-800 bg-gray-50 p-2.5 rounded border border-gray-200 italic">
                                {numberToWords(grandTotal)}
                            </p>
                        </div>

                        {/* GST Breakdown Box */}
                        <div className="bg-gray-50 p-3 rounded border border-gray-200 text-[10px] text-gray-600">
                            <span className="font-bold text-gray-700 uppercase tracking-wider block mb-1.5">
                                Tax Summary Breakdown (Included in Price)
                            </span>
                            {isRajasthan ? (
                                <div className="space-y-1 font-mono">
                                    <div className="flex justify-between">
                                        <span>CGST @ 1.5% (State: 08):</span>
                                        <span>{formatPrice(cgst)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>SGST @ 1.5% (State: 08):</span>
                                        <span>{formatPrice(sgst)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-gray-800 border-t border-gray-200 pt-1">
                                        <span>Total GST (3.0%):</span>
                                        <span>{formatPrice(totalGst)}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1 font-mono">
                                    <div className="flex justify-between">
                                        <span>IGST @ 3.0% (Inter-State):</span>
                                        <span>{formatPrice(totalGst)}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-gray-800 border-t border-gray-200 pt-1">
                                        <span>Total GST (3.0%):</span>
                                        <span>{formatPrice(totalGst)}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Barcode representation */}
                        <div className="pt-1">
                            <svg className="w-44 h-8" viewBox="0 0 160 32" fill="currentColor">
                                <rect x="0" y="0" width="2" height="32" />
                                <rect x="4" y="0" width="1" height="32" />
                                <rect x="7" y="0" width="3" height="32" />
                                <rect x="13" y="0" width="1" height="32" />
                                <rect x="16" y="0" width="2" height="32" />
                                <rect x="21" y="0" width="3" height="32" />
                                <rect x="26" y="0" width="1" height="32" />
                                <rect x="30" y="0" width="4" height="32" />
                                <rect x="37" y="0" width="2" height="32" />
                                <rect x="41" y="0" width="1" height="32" />
                                <rect x="45" y="0" width="3" height="32" />
                                <rect x="51" y="0" width="2" height="32" />
                                <rect x="56" y="0" width="4" height="32" />
                                <rect x="63" y="0" width="1" height="32" />
                                <rect x="67" y="0" width="2" height="32" />
                                <rect x="72" y="0" width="3" height="32" />
                                <rect x="78" y="0" width="1" height="32" />
                                <rect x="82" y="0" width="4" height="32" />
                                <rect x="89" y="0" width="2" height="32" />
                                <rect x="94" y="0" width="1" height="32" />
                                <rect x="98" y="0" width="3" height="32" />
                                <rect x="104" y="0" width="2" height="32" />
                                <rect x="109" y="0" width="4" height="32" />
                                <rect x="116" y="0" width="1" height="32" />
                                <rect x="120" y="0" width="3" height="32" />
                                <rect x="126" y="0" width="2" height="32" />
                                <rect x="131" y="0" width="4" height="32" />
                                <rect x="138" y="0" width="1" height="32" />
                                <rect x="142" y="0" width="3" height="32" />
                                <rect x="148" y="0" width="2" height="32" />
                                <rect x="153" y="0" width="1" height="32" />
                                <rect x="157" y="0" width="3" height="32" />
                            </svg>
                            <span className="font-mono text-[9px] tracking-widest text-gray-500 block mt-1">
                                SOV-{order._id.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    {/* Right: Totals Column */}
                    <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-gray-600">Subtotal (Items Total):</span>
                            <span className="font-mono font-medium text-gray-900">{formatPrice(itemsTotal)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between items-center py-1 border-b border-gray-100 text-emerald-700">
                                <span className="flex items-center gap-1.5">
                                    Coupon Discount {order.promoCode ? `(${order.promoCode})` : ''}:
                                </span>
                                <span className="font-mono font-bold">- {formatPrice(discountAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center py-1 border-b border-gray-100">
                            <span className="text-gray-600">Shipping & Handling:</span>
                            <span className="font-mono font-medium text-gray-900">
                                {shippingAmount > 0 ? formatPrice(shippingAmount) : 'FREE'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-1 border-b border-gray-100 text-gray-500 text-[11px]">
                            <span>Applicable Taxes (GST 3% Included):</span>
                            <span className="font-mono">{formatPrice(totalGst)}</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-2 pb-1 border-t-2 border-black">
                            <div>
                                <span className="font-headline text-lg font-bold text-black uppercase">
                                    Grand Total:
                                </span>
                                <p className="text-[10px] text-gray-500 font-sans">Inclusive of all applicable taxes</p>
                            </div>
                            <span className="font-headline text-2xl sm:text-3xl font-extrabold text-black font-mono">
                                {formatPrice(grandTotal)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Section: Terms, Guarantee & Authorized Signatory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-5 text-gray-600">
                    {/* Terms & Return Policy */}
                    <div className="space-y-1.5 text-[10px] leading-relaxed">
                        <span className="font-bold uppercase tracking-wider text-gray-800 block">
                            Terms & Conditions & Brand Assurance
                        </span>
                        <p>1. <strong>Quality Guarantee:</strong> Certified 18K PVD Gold Plating over hypoallergenic premium base — waterproof, sweatproof, and anti-tarnish.</p>
                        <p>2. <strong>7-Day Returns & Exchanges:</strong> Unworn pieces in original pouch and security packaging are eligible for return/exchange within 7 days of delivery.</p>
                        <p>3. <strong>Customer Concierge:</strong> For support, queries, or warranty, email <strong className="text-gray-800">support@sovra.in</strong> or WhatsApp <strong className="text-gray-800">+91 9571746435</strong>.</p>
                        <p className="text-[9px] text-gray-400 italic pt-1">
                            Whether tax is payable under reverse charge: No. This is a computer-generated tax invoice issued under Rule 48 of the CGST Rules, 2017.
                        </p>
                    </div>

                    {/* Authorized Signatory */}
                    <div className="sm:text-right flex flex-col items-start sm:items-end justify-between pt-2 sm:pt-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-800">
                            For SOVRA JEWELLERY
                        </p>
                        <div className="my-2 text-center sm:text-right">
                            <span className="font-serif italic text-2xl font-semibold text-gray-800 tracking-wider">
                                Sovra Studio
                            </span>
                            <div className="h-0.5 w-36 bg-gray-400 mt-1 sm:ml-auto"></div>
                        </div>
                        <div className="text-[10px] text-gray-500">
                            <p className="font-semibold text-gray-800">Authorized Signatory</p>
                            <p className="text-[9px] italic">Digitally Signed & Validated</p>
                            <p className="text-[9px]">Udaipur Atelier, Rajasthan</p>
                        </div>
                    </div>
                </div>

                {/* Footer Stamp */}
                <div className="mt-8 pt-4 border-t border-gray-200 text-center text-[9px] text-gray-400 font-mono tracking-widest uppercase">
                    SOVRA JEWELLERY • UDAIPUR • WWW.SOVRA.IN • THANK YOU FOR SHOPPING WITH US
                </div>
            </div>

            {/* Print Stylesheet */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 10mm 10mm 10mm 10mm;
                    }
                    body {
                        background-color: #ffffff !important;
                        background-image: none !important;
                        color: #000000 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .print-hidden {
                        display: none !important;
                    }
                    .print-invoice-sheet {
                        box-shadow: none !important;
                        border: 1px solid #d1d5db !important;
                        padding: 18px !important;
                        margin: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        border-radius: 0 !important;
                    }
                }
            `}} />
        </div>
    );
};

export default Invoice;
