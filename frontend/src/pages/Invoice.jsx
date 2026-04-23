import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { formatPrice } from '../utils/currency';
import { Printer, ArrowLeft, Download } from 'lucide-react';

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

    if (loading) return <div className="h-screen flex items-center justify-center font-headline italic text-2xl opacity-30">Generating Dossier...</div>;
    if (!order) return <div className="h-screen flex items-center justify-center">Record not found.</div>;

    return (
        <div className="min-h-screen bg-white text-[#111110] font-body print:p-0 p-8 md:p-20">
            {/* Top Navigation (Hidden on Print) */}
            <div className="max-w-4xl mx-auto mb-12 flex justify-between items-center print:hidden border-b border-black/5 pb-8">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 font-label text-[10px] uppercase tracking-widest opacity-40 hover:opacity-100 transition-all"
                >
                    <ArrowLeft size={14} /> Back to Curation
                </button>
                <div className="flex gap-8">
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 font-label text-[10px] uppercase tracking-widest text-primary border border-primary/20 px-6 py-3 hover:bg-primary/5 transition-all"
                    >
                        <Printer size={14} /> Print Invoice
                    </button>
                </div>
            </div>

            {/* Invoice Content */}
            <div className="max-w-4xl mx-auto bg-white border border-black/10 p-12 md:p-24 shadow-lux-soft relative overflow-hidden">
                {/* Background Branding */}
                <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none select-none">
                    <span className="font-premium text-[20rem] italic leading-none font-light">S.</span>
                </div>

                <div className="flex flex-col md:flex-row justify-between gap-16 mb-24 relative z-10">
                    <div>
                        <h1 className="font-premium text-6xl italic font-light tracking-tighter mb-4">House Sovra</h1>
                        <p className="font-label text-[9px] uppercase tracking-[0.4em] opacity-40 mb-12 font-black">Official Acquisition Receipt</p>
                        
                        <div className="space-y-1 text-sm italic opacity-60">
                            <p>Unit 18, Mayfair Mews</p>
                            <p>London, W1J 7BR</p>
                            <p>United Kingdom</p>
                            <p>concierge@housesovra.com</p>
                        </div>
                    </div>

                    <div className="md:text-right space-y-6">
                        <div>
                            <p className="font-label text-[9px] uppercase tracking-widest opacity-40 font-black mb-1">Receipt Number</p>
                            <p className="font-premium text-2xl font-light italic">#SOV-{order._id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div>
                            <p className="font-label text-[9px] uppercase tracking-widest opacity-40 font-black mb-1">Date of Issuance</p>
                            <p className="font-premium text-2xl font-light italic">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between gap-16 mb-24 border-y border-black/5 py-12">
                    <div>
                        <p className="font-label text-[9px] uppercase tracking-widest opacity-40 font-black mb-4">Billed To</p>
                        <div className="font-premium text-2xl font-light italic mb-2">{order.user?.name}</div>
                        <div className="space-y-1 text-sm italic opacity-60">
                            <p>{order.user?.email}</p>
                        </div>
                    </div>
                    <div className="md:text-right">
                        <p className="font-label text-[9px] uppercase tracking-widest opacity-40 font-black mb-4">Delivery Port</p>
                        <div className="space-y-1 text-sm italic opacity-60">
                            <p>{order.shippingAddress.address}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                            <p>{order.shippingAddress.country}</p>
                        </div>
                    </div>
                </div>

                <table className="w-full mb-24">
                    <thead>
                        <tr className="border-b border-black/10">
                            <th className="text-left py-6 font-label text-[9px] uppercase tracking-[0.3em] font-black opacity-40">Item Description</th>
                            <th className="text-center py-6 font-label text-[9px] uppercase tracking-[0.3em] font-black opacity-40">Qty</th>
                            <th className="text-right py-6 font-label text-[9px] uppercase tracking-[0.3em] font-black opacity-40">Unit Investment</th>
                            <th className="text-right py-6 font-label text-[9px] uppercase tracking-[0.3em] font-black opacity-40">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {order.orderItems.map((item) => (
                            <tr key={item.product}>
                                <td className="py-8">
                                    <div className="font-premium text-xl italic">{item.name}</div>
                                    <div className="text-[8px] uppercase tracking-widest opacity-30 mt-1 font-black">ID: {item.product.slice(-8).toUpperCase()}</div>
                                </td>
                                <td className="py-8 text-center font-body italic opacity-60">{item.qty}</td>
                                <td className="py-8 text-right font-body italic opacity-60">{formatPrice(item.price)}</td>
                                <td className="py-8 text-right font-premium text-xl font-light">{formatPrice(item.price * item.qty)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="flex flex-col md:flex-row justify-between gap-16 relative">
                    <div className="md:w-1/2">
                         <div className="print:block h-32 opacity-10">
                                {/* Seal Area */}
                                <svg width="100" height="100" viewBox="0 0 100 100" className="opacity-40">
                                    <circle cx="50" cy="50" r="48" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="2 2" />
                                    <text x="50" y="55" fontSize="8" textAnchor="middle" className="font-sans tracking-widest uppercase font-black">SOVRA SEAL</text>
                                </svg>
                         </div>
                         <p className="font-body text-[10px] italic opacity-40 leading-relaxed max-w-xs mt-8">
                            This document serves as proof of acquisition from House Sovra. Each piece is guaranteed for its artisanal integrity and material excellence.
                         </p>
                    </div>

                    <div className="md:w-1/3 space-y-6">
                        <div className="flex justify-between items-baseline border-b border-black/5 pb-4">
                            <span className="font-label text-[9px] uppercase tracking-widest opacity-40 font-black">Subtotal</span>
                            <span className="font-body italic opacity-60">{formatPrice(order.totalPrice)}</span>
                        </div>
                        <div className="flex justify-between items-baseline border-b border-black/5 pb-4">
                            <span className="font-label text-[9px] uppercase tracking-widest opacity-40 font-black">White-Glove Shipping</span>
                            <span className="font-body italic opacity-60">{formatPrice(0)}</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-4">
                            <span className="font-headline text-2xl italic font-light">Acquisition Total</span>
                            <span className="font-headline text-4xl font-light text-primary">{formatPrice(order.totalPrice)}</span>
                        </div>
                    </div>
                </div>

                <footer className="mt-32 pt-12 border-t border-black/5 text-center">
                    <p className="font-sans text-[8px] tracking-[0.6em] uppercase font-black opacity-20">SOVRA LONDON ARCHIVE • EST. MMXXIV</p>
                </footer>
            </div>

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { margin: 0; }
                    body { -webkit-print-color-adjust: exact; background: white; }
                    .print-hidden { display: none !important; }
                }
            `}} />
        </div>
    );
};

export default Invoice;
