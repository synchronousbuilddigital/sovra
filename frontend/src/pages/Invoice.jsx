import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatPrice } from '../utils/currency';
import { Printer, ArrowLeft, ShieldCheck, Mail, Phone, Globe, CheckCircle2 } from 'lucide-react';

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
            <div className="h-screen flex flex-col items-center justify-center bg-white font-sans text-stone-500 gap-3">
                <div className="w-8 h-8 border-2 border-stone-300 border-t-black rounded-full animate-spin"></div>
                <p className="text-xs uppercase tracking-widest font-semibold">Generating Tax Invoice...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-white font-sans text-stone-600 gap-4">
                <p className="text-base font-medium">Invoice record not found.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 border border-stone-300 text-xs uppercase tracking-wider font-semibold rounded hover:bg-stone-50"
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
        <div className="min-h-screen bg-stone-100/70 text-stone-900 font-sans print:bg-white print:p-0 py-8 px-4 sm:px-6 md:px-10">
            {/* Top Action Bar (Hidden in Print) */}
            <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-stone-600 hover:text-black transition-colors"
                >
                    <ArrowLeft size={16} /> Back to Order
                </button>
                <div className="flex items-center gap-3">
                    <span className="hidden sm:inline text-xs text-stone-500">
                        Tip: Choose "Save as PDF" in the print dialog to export
                    </span>
                    <button
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider bg-black hover:bg-stone-800 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all cursor-pointer"
                    >
                        <Printer size={15} /> Print Invoice
                    </button>
                </div>
            </div>

            {/* Printable Invoice Sheet */}
            <div className="print-invoice-sheet max-w-4xl mx-auto bg-white border border-stone-200/80 shadow-xl rounded-2xl p-6 sm:p-10 md:p-12 relative overflow-hidden">
                
                {/* Header Gold Accent Hairline */}
                <div className="h-1 w-full bg-gradient-to-r from-[#855e23] via-[#d4af37] to-[#855e23] rounded-full mb-8"></div>

                {/* Header: Brand Logo & Information + Tax Invoice Title */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b border-stone-200">
                    {/* Left: Brand Identity with Gold Logo */}
                    <div className="flex items-center gap-4">
                        <img
                            src="/sovra-gold-logo.jpg"
                            alt="SOVRA Jewellery"
                            className="h-20 w-20 rounded-2xl object-cover shadow-md border border-stone-900/10 flex-shrink-0"
                        />
                        <div>
                            <h1 className="font-serif text-3xl font-medium tracking-[0.18em] text-stone-950 uppercase leading-none">
                                SOVRA
                            </h1>
                            <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-[#855e23] mt-1">
                                Adorn Your Story • Everyday Luxury
                            </p>
                            <div className="text-[11px] text-stone-500 space-y-0.5 mt-2 leading-tight">
                                <p className="font-semibold text-stone-800">Sovra Lifestyle Private Limited</p>
                                <p>23, Pulla Beside Platinum Square, RK Circle, Udaipur - 313001</p>
                                <p>support@sovra.in • +91 9571746435 • www.sovra.in</p>
                                <p className="font-mono text-stone-700 font-bold pt-0.5">
                                    GSTIN: 08AAECS1234F1Z5 • State Code: 08 (Rajasthan)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Tax Invoice Details */}
                    <div className="sm:text-right w-full sm:w-auto">
                        <div className="inline-block sm:text-right">
                            <span className="font-serif text-2xl font-normal tracking-[0.22em] text-stone-950 uppercase block">
                                TAX INVOICE
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 block mt-0.5">
                                Original for Recipient
                            </span>
                        </div>

                        <div className="mt-3 space-y-1 text-xs">
                            <div className="flex justify-between sm:justify-end gap-3">
                                <span className="text-stone-400">Invoice No:</span>
                                <span className="font-mono font-bold text-stone-900">{invoiceNumber}</span>
                            </div>
                            <div className="flex justify-between sm:justify-end gap-3">
                                <span className="text-stone-400">Order ID:</span>
                                <span className="font-mono font-bold text-stone-900">{orderNumber}</span>
                            </div>
                            <div className="flex justify-between sm:justify-end gap-3">
                                <span className="text-stone-400">Invoice Date:</span>
                                <span className="font-medium text-stone-800">{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex justify-between sm:justify-end gap-3">
                                <span className="text-stone-400">Payment Mode:</span>
                                <span className="font-semibold text-stone-900 uppercase">
                                    {order.paymentMethod || 'Online Prepaid'}
                                </span>
                            </div>
                            <div className="flex justify-between sm:justify-end gap-3 items-center pt-1.5">
                                <span className="text-stone-400">Status:</span>
                                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    order.status === 'Cancelled'
                                        ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                        : order.isPaid
                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                                }`}>
                                    {order.status === 'Cancelled' ? 'Cancelled (Void)' : order.isPaid ? 'Paid' : 'Payment Pending'}
                                </span>
                            </div>
                            {order.razorpayPaymentId && (
                                <div className="flex justify-between sm:justify-end gap-3 text-[10px] pt-0.5">
                                    <span className="text-stone-400">Txn Ref ID:</span>
                                    <span className="font-mono text-stone-600">{order.razorpayPaymentId}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Section: Customer & Delivery Information (Clean Modern 2-Column Card) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 p-6 bg-[#faf9f6] rounded-2xl border border-stone-200/70">
                    {/* Billed To */}
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#855e23] block mb-2">
                            Billed To (Customer Details)
                        </span>
                        <p className="text-sm font-bold text-stone-900">
                            {order.shippingAddress?.fullName || order.user?.name || 'Valued Customer'}
                        </p>
                        <div className="text-xs text-stone-600 space-y-0.5 mt-1.5 leading-relaxed">
                            <p>{order.shippingAddress?.address}</p>
                            <p>
                                {order.shippingAddress?.city}
                                {order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''} - {order.shippingAddress?.postalCode}
                            </p>
                            <p>{order.shippingAddress?.country || 'India'}</p>
                            {order.user?.email && (
                                <p className="text-stone-500 pt-0.5">Email: {order.user.email}</p>
                            )}
                            {(order.shippingAddress?.phone || order.user?.phone) && (
                                <p className="text-stone-500">Phone: {order.shippingAddress?.phone || order.user?.phone}</p>
                            )}
                            <p className="text-[10px] text-stone-400 pt-1">
                                Place of Supply: {order.shippingAddress?.state || 'Rajasthan'} ({isRajasthan ? 'State Code: 08' : 'Inter-State'})
                            </p>
                        </div>
                    </div>

                    {/* Shipped To */}
                    <div className="sm:border-l sm:border-stone-200/80 sm:pl-6">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#855e23] block mb-2">
                            Shipped To (Delivery Destination)
                        </span>
                        <p className="text-sm font-bold text-stone-900">
                            {order.shippingAddress?.fullName || order.user?.name || 'Valued Customer'}
                        </p>
                        <div className="text-xs text-stone-600 space-y-0.5 mt-1.5 leading-relaxed">
                            <p>{order.shippingAddress?.address}</p>
                            <p>
                                {order.shippingAddress?.city}
                                {order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ''} - {order.shippingAddress?.postalCode}
                            </p>
                            <p>{order.shippingAddress?.country || 'India'}</p>
                            <div className="pt-2 text-[11px] text-stone-600 space-y-0.5">
                                <p><span className="text-stone-400">Logistics:</span> <strong>{order.carrier || 'Insured Express Courier'}</strong></p>
                                {order.trackingNumber && (
                                    <p className="font-mono"><span className="text-stone-400">AWB Number:</span> <strong>{order.trackingNumber}</strong></p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Items Table (Clean E-Commerce Style) */}
                <div className="my-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-stone-200 text-stone-400 text-[10px] uppercase tracking-[0.2em] font-bold">
                                <th className="py-3 px-3 text-center w-12">#</th>
                                <th className="py-3 px-3">Item Description</th>
                                <th className="py-3 px-3 text-center w-24">HSN Code</th>
                                <th className="py-3 px-3 text-center w-16">Qty</th>
                                <th className="py-3 px-3 text-right w-28">Unit Rate</th>
                                <th className="py-3 px-3 text-right w-32">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100 text-xs">
                            {order.orderItems?.map((item, index) => {
                                const lineTotal = item.price * item.qty;
                                const itemSku = item.product ? `SOV-${item.product.slice(-6).toUpperCase()}` : 'SOV-JEWEL';

                                return (
                                    <tr key={item.product || index} className="hover:bg-stone-50/50 transition-colors">
                                        <td className="py-4 px-3 text-center text-stone-400 font-mono">
                                            {index + 1}
                                        </td>
                                        <td className="py-4 px-3">
                                            <p className="font-semibold text-stone-900 text-sm">{item.name}</p>
                                            <div className="flex flex-wrap items-center gap-2 text-[10px] text-stone-500 mt-1">
                                                <span className="font-mono">SKU: {itemSku}</span>
                                                <span>•</span>
                                                <span>18K PVD Gold Plating</span>
                                                <span>•</span>
                                                <span className="text-emerald-700 font-medium">3% GST Included</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-3 text-center font-mono text-stone-600">
                                            7117
                                        </td>
                                        <td className="py-4 px-3 text-center font-bold text-stone-900 font-mono">
                                            {item.qty}
                                        </td>
                                        <td className="py-4 px-3 text-right font-mono text-stone-700">
                                            {formatPrice(item.price)}
                                        </td>
                                        <td className="py-4 px-3 text-right font-mono font-bold text-stone-950 text-sm">
                                            {formatPrice(lineTotal)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Section: Calculation Summary & Notes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-stone-200">
                    {/* Left: Amount in Words, Tax Breakdown & Policy Highlights */}
                    <div className="space-y-4">
                        <div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 block mb-1">
                                Amount in Words
                            </span>
                            <p className="text-xs font-serif italic text-stone-800 bg-[#faf9f6] p-3 rounded-xl border border-stone-200/60">
                                {numberToWords(grandTotal)}
                            </p>
                        </div>

                        {/* GST Breakdown (Compact & Clean) */}
                        <div className="bg-[#faf9f6] p-4 rounded-xl border border-stone-200/60 text-xs space-y-1.5">
                            <span className="font-bold text-[#855e23] uppercase tracking-[0.2em] text-[10px] block mb-1.5">
                                Tax Summary Breakdown (3% GST All-Inclusive)
                            </span>
                            <div className="space-y-1 font-mono text-[11px] text-stone-600">
                                <div className="flex justify-between">
                                    <span>Taxable Value (Before Tax):</span>
                                    <span>{formatPrice(netTaxable)}</span>
                                </div>
                                {isRajasthan ? (
                                    <>
                                        <div className="flex justify-between">
                                            <span>CGST @ 1.5% (State: 08):</span>
                                            <span>{formatPrice(cgst)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>SGST @ 1.5% (State: 08):</span>
                                            <span>{formatPrice(sgst)}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex justify-between">
                                        <span>IGST @ 3.0% (Inter-State):</span>
                                        <span>{formatPrice(totalGst)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-stone-800 pt-1.5 border-t border-stone-200">
                                    <span>Total Included GST (3.0%):</span>
                                    <span>{formatPrice(totalGst)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Totals Column */}
                    <div className="space-y-2.5 text-xs">
                        <div className="flex justify-between items-center py-1.5 border-b border-stone-100 text-stone-600">
                            <span>Subtotal (Items Total):</span>
                            <span className="font-mono font-medium text-stone-900">{formatPrice(itemsTotal)}</span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between items-center py-1.5 border-b border-stone-100 text-emerald-700">
                                <span>Coupon Discount {order.promoCode ? `(${order.promoCode})` : ''}:</span>
                                <span className="font-mono font-bold">- {formatPrice(discountAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center py-1.5 border-b border-stone-100 text-stone-600">
                            <span>Insured Shipping & Handling:</span>
                            <span className="font-mono font-bold text-emerald-700">
                                {shippingAmount > 0 ? formatPrice(shippingAmount) : 'FREE'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-stone-100 text-stone-400 text-[11px]">
                            <span>Included GST (3%):</span>
                            <span className="font-mono">{formatPrice(totalGst)}</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-4 pb-1 border-t-2 border-stone-900">
                            <div>
                                <span className="font-serif text-lg font-medium text-stone-950 uppercase tracking-wider block">
                                    Grand Total
                                </span>
                                <span className="text-[10px] text-stone-400 font-sans">Inclusive of all applicable taxes</span>
                            </div>
                            <span className="font-serif text-3xl font-medium text-stone-950 font-mono">
                                {formatPrice(grandTotal)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Section: Terms, Brand Guarantee & Authorized Signatory */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 mt-6 border-t border-stone-200 text-stone-600">
                    {/* Terms & Return Policy */}
                    <div className="space-y-1.5 text-[11px] leading-relaxed">
                        <span className="font-bold uppercase tracking-[0.2em] text-[#855e23] text-[10px] block">
                            Sovra Brand Assurance & Guarantee
                        </span>
                        <p>1. <strong>Certified 18K PVD Gold Plating:</strong> Anti-tarnish, waterproof, sweatproof, and hypoallergenic everyday fine jewellery.</p>
                        <p>2. <strong>48-Hour Exchange Guarantee:</strong> In accordance with Sovra policy, exchanges are provided for damaged or defective items with a continuous uncut unboxing video.</p>
                        <p>3. <strong>Concierge Care:</strong> Questions? Reach us at <strong className="text-stone-800">support@sovra.in</strong> or WhatsApp <strong className="text-stone-800">+91 9571746435</strong>.</p>
                        <p className="text-[9px] text-stone-400 italic pt-1">
                            Tax payable under reverse charge: No. Computer generated tax invoice issued under Rule 48 of CGST Rules, 2017.
                        </p>
                    </div>

                    {/* Authorized Signatory */}
                    <div className="sm:text-right flex flex-col items-start sm:items-end justify-between pt-2 sm:pt-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-stone-800">
                            For SOVRA
                        </p>
                        <div className="my-2 text-center sm:text-right">
                            <span className="font-serif italic text-2xl font-normal text-stone-800 tracking-wider">
                                Sovra
                            </span>
                            <div className="h-0.5 w-36 bg-stone-300 mt-1 sm:ml-auto"></div>
                        </div>
                        <div className="text-[10px] text-stone-500">
                            <p className="font-semibold text-stone-800">Authorized Signatory</p>
                            <p className="text-[9px] italic">Digitally Signed & Validated</p>
                            <p className="text-[9px]">Udaipur, Rajasthan</p>
                        </div>
                    </div>
                </div>

                {/* Footer Stamp */}
                <div className="mt-8 pt-4 border-t border-stone-100 text-center text-[9px] text-stone-400 font-mono tracking-[0.25em] uppercase">
                    SOVRA • UDAIPUR, RAJASTHAN • WWW.SOVRA.IN • ADORN YOUR STORY
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
                        border: none !important;
                        padding: 12px !important;
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