import React from 'react'
import { motion } from 'framer-motion'
import {
    Truck,
    Clock,
    MapPin,
    Package,
    Search,
    AlertCircle,
    Mail,
    Globe,
    Calendar,
    Tag,
    CheckCircle2
} from 'lucide-react'

const ShippingPolicy = () => {
    return (
        <div className="pt-28 md:pt-36 pb-24 bg-[#fffcf7] dark:bg-[#121211] min-h-screen selection:bg-primary/10">
            <main className="max-w-[1100px] mx-auto px-5 sm:px-8 md:px-12">
                {/* Header */}
                <header className="mb-14 md:mb-20 text-center">
                    <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-headline tracking-[0.3em] uppercase text-xs md:text-sm text-[#6e5b44] dark:text-[#ead0b3] font-bold mb-3"
                    >
                        SOVRA
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="font-headline text-4xl sm:text-5xl md:text-6xl text-[#111110] dark:text-[#eae9de] font-light tracking-tight mb-6"
                    >
                        Shipping Policy
                    </motion.h1>

                    {/* Metadata Badges */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="inline-flex flex-wrap items-center justify-center gap-3 md:gap-6 bg-[#f6f4ec] dark:bg-[#1a1a18] border border-[#111110]/8 dark:border-[#eae9de]/10 px-5 py-2.5 rounded-full text-xs font-body text-[#656464] dark:text-[#babab0]"
                    >
                        <span className="flex items-center gap-1.5 font-medium">
                            <Calendar size={13} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <span>Effective Date: <strong className="text-[#111110] dark:text-[#eae9de] font-semibold">April 2025</strong></span>
                        </span>
                        <span className="hidden sm:inline text-[#111110]/20 dark:text-[#eae9de]/20">•</span>
                        <span className="flex items-center gap-1.5 font-medium">
                            <Globe size={13} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <span>Applies to all orders on <strong className="text-[#111110] dark:text-[#eae9de] font-semibold">sovra.in</strong></span>
                        </span>
                    </motion.div>
                </header>

                {/* Content Container */}
                <div className="bg-white dark:bg-[#181816] rounded-2xl p-6 sm:p-10 md:p-16 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-[#111110]/6 dark:border-[#eae9de]/8 relative overflow-hidden space-y-12 md:space-y-16">
                    {/* Background Decorative Truck */}
                    <div className="absolute top-0 right-0 p-8 md:p-12 opacity-[0.02] dark:opacity-[0.03] select-none pointer-events-none">
                        <Truck size={420} />
                    </div>

                    {/* Section: Overview */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Overview
                            </span>
                        </div>
                        <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight mb-4">
                            We ship Pan India
                        </h2>
                        <div className="bg-[#faf8f2] dark:bg-[#1f1f1d] border-l-4 border-[#6e5b44] dark:border-[#ead0b3] p-5 md:p-6 rounded-r-xl mb-8">
                            <p className="font-body text-sm md:text-base text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed">
                                At Sovra, we deliver to all states and union territories across India. Every order is packed with care and dispatched through trusted courier partners to ensure your jewellery reaches you safely and on time.
                            </p>
                        </div>

                        {/* Highlight Metric Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-5 md:p-6 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5 flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-[#6e5b44]/10 dark:bg-[#ead0b3]/10 text-[#6e5b44] dark:text-[#ead0b3] flex-shrink-0">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[#6e5b44] dark:text-[#ead0b3] font-bold block mb-1">
                                        Delivery Timeframe
                                    </span>
                                    <h3 className="font-headline text-xl md:text-2xl font-semibold text-[#111110] dark:text-[#eae9de]">
                                        4–6 Working Days
                                    </h3>
                                    <p className="font-body text-xs text-[#656464] dark:text-[#babab0] mt-1">
                                        From the date of dispatch
                                    </p>
                                </div>
                            </div>

                            <div className="p-5 md:p-6 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5 flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-[#6e5b44]/10 dark:bg-[#ead0b3]/10 text-[#6e5b44] dark:text-[#ead0b3] flex-shrink-0">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <span className="font-label text-[10px] uppercase tracking-[0.2em] text-[#6e5b44] dark:text-[#ead0b3] font-bold block mb-1">
                                        Shipping Coverage
                                    </span>
                                    <h3 className="font-headline text-xl md:text-2xl font-semibold text-[#111110] dark:text-[#eae9de]">
                                        Pan India
                                    </h3>
                                    <p className="font-body text-xs text-[#656464] dark:text-[#babab0] mt-1">
                                        All states & union territories
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section: Order Processing */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Order Processing
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <Package size={22} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                What happens after you place an order
                            </h2>
                        </div>

                        <div className="space-y-3.5 mb-6">
                            {[
                                "An order confirmation is sent to your registered email and/or WhatsApp within minutes of placing the order.",
                                "Your order is verified, quality checked and packed within 1–2 business days.",
                                "Once dispatched, a tracking link is shared with you via email or WhatsApp.",
                                "Your order arrives within 4–6 working days from the date of dispatch."
                            ].map((step, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-4 p-4 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5"
                                >
                                    <div className="w-7 h-7 rounded-full bg-[#6e5b44] dark:bg-[#ead0b3] text-white dark:text-[#111110] font-headline text-xs font-semibold flex items-center justify-center flex-shrink-0">
                                        {idx + 1}
                                    </div>
                                    <p className="font-body text-xs md:text-sm text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed pt-0.5">
                                        {step}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Please Note Box */}
                        <div className="p-4 md:p-5 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#6e5b44]/20 dark:border-[#ead0b3]/20 flex items-start gap-3">
                            <AlertCircle size={18} className="text-[#6e5b44] dark:text-[#ead0b3] mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="font-label text-[10px] uppercase tracking-widest text-[#6e5b44] dark:text-[#ead0b3] font-bold block mb-1">
                                    Please Note
                                </span>
                                <p className="font-body text-xs md:text-sm text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed">
                                    Working days exclude Sundays and public holidays. Delivery timelines may vary slightly during festive seasons or due to circumstances beyond our control. We will proactively inform you of any delays.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section: Shipping Charges */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Shipping Charges
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <Tag size={22} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                Delivery fee
                            </h2>
                        </div>
                        <p className="font-body text-sm md:text-base text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed max-w-4xl">
                            Shipping charges, if applicable, are displayed clearly at the checkout page before you make payment. We periodically offer free shipping — keep an eye on the website banner for current offers.
                        </p>
                    </section>

                    {/* Section: Tracking Your Order */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Tracking Your Order
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <Search size={22} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                Stay updated
                            </h2>
                        </div>
                        <div className="p-5 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5 max-w-4xl">
                            <p className="font-body text-sm md:text-base text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed">
                                Once your order is dispatched, you will receive a tracking number and a direct link to monitor your shipment. If you have not received tracking details within 2 business days of placing your order, please contact us at{' '}
                                <a href="mailto:support@sovra.in" className="font-semibold text-[#6e5b44] dark:text-[#ead0b3] hover:underline">
                                    support@sovra.in
                                </a>.
                            </p>
                        </div>
                    </section>

                    {/* Section: Delivery Issues */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Delivery Issues
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle size={22} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                What to do if there is a problem
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {[
                                "If your order shows as delivered but has not arrived, please contact us within 48 hours.",
                                "If the package is visibly damaged on the outside at the time of delivery, do not accept it — contact us immediately with photos.",
                                "For any delivery-related concerns, email support@sovra.in with your order number."
                            ].map((issue, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-3.5 p-4 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5"
                                >
                                    <span className="w-2 h-2 rounded-full bg-[#6e5b44] dark:bg-[#ead0b3] mt-2 flex-shrink-0" />
                                    <p className="font-body text-xs md:text-sm text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed">
                                        {issue}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section: Contact */}
                    <section className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Contact
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <Mail size={22} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                Questions about your shipment?
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                            <a
                                href="mailto:support@sovra.in"
                                className="p-4 md:p-5 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5 hover:border-[#6e5b44]/30 dark:hover:border-[#ead0b3]/30 transition-colors group"
                            >
                                <span className="font-label text-[10px] uppercase tracking-widest text-[#6e5b44] dark:text-[#ead0b3] font-bold block mb-1">
                                    Email
                                </span>
                                <span className="font-body text-sm font-semibold text-[#111110] dark:text-[#eae9de] group-hover:text-[#6e5b44] transition-colors">
                                    support@sovra.in
                                </span>
                            </a>
                            <div className="p-4 md:p-5 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5">
                                <span className="font-label text-[10px] uppercase tracking-widest text-[#6e5b44] dark:text-[#ead0b3] font-bold block mb-1">
                                    Response Time
                                </span>
                                <span className="font-body text-sm font-semibold text-[#111110] dark:text-[#eae9de]">
                                    Within 24–48 business hours
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default ShippingPolicy
