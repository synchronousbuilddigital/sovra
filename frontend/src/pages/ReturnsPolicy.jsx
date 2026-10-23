import React from 'react'
import { motion } from 'framer-motion'
import {
    RefreshCw,
    Video,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Clock,
    Truck,
    Calendar,
    Globe,
    Mail,
    Package,
    Lightbulb,
    FileCheck
} from 'lucide-react'

const ReturnsPolicy = () => {
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
                        Return & Exchange Policy
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
                            <span>Applies to: <strong className="text-[#111110] dark:text-[#eae9de] font-semibold">sovra.in</strong></span>
                        </span>
                    </motion.div>
                </header>

                {/* Content Container */}
                <div className="bg-white dark:bg-[#181816] rounded-2xl p-6 sm:p-10 md:p-16 shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-[#111110]/6 dark:border-[#eae9de]/8 relative overflow-hidden space-y-12 md:space-y-16">
                    {/* Background Decorative Icon */}
                    <div className="absolute top-0 right-0 p-8 md:p-12 opacity-[0.02] dark:opacity-[0.03] select-none pointer-events-none">
                        <RefreshCw size={420} />
                    </div>

                    {/* Section: Our Policy */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Our Policy
                            </span>
                        </div>
                        <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight mb-4">
                            Exchange only — we do not offer refunds
                        </h2>
                        <div className="bg-[#faf8f2] dark:bg-[#1f1f1d] border-l-4 border-[#6e5b44] dark:border-[#ead0b3] p-5 md:p-6 rounded-r-xl space-y-3 mb-6">
                            <p className="font-body text-sm md:text-base text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed">
                                At Sovra, every piece is carefully inspected before dispatch. We want you to love what you receive. In the rare event that your order arrives defective or damaged, we will make it right with an exchange.
                            </p>
                            <p className="font-body text-xs md:text-sm text-[#8c6b45] dark:text-[#e4be96] font-semibold">
                                Please note: Sovra does not offer refunds under any circumstances. All eligible claims will be resolved through a product exchange.
                            </p>
                        </div>

                        {/* Mandatory Requirement Callout */}
                        <div className="p-5 md:p-6 rounded-xl bg-[#fff8f0] dark:bg-[#231b14] border-2 border-[#d97706]/30 dark:border-[#d97706]/40 flex items-start gap-4">
                            <div className="p-2.5 rounded-lg bg-[#d97706]/10 text-[#d97706] flex-shrink-0 mt-0.5">
                                <Video size={22} />
                            </div>
                            <div>
                                <span className="font-label text-[11px] uppercase tracking-widest text-[#d97706] font-bold block mb-1">
                                    Mandatory Requirement — Unboxing Video
                                </span>
                                <p className="font-body text-xs md:text-sm text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed">
                                    You must record a clear, uncut video while opening your package. This video is required to process any exchange request. Requests raised without an unboxing video will not be accepted, regardless of the reason.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section: How to Record Your Unboxing Video */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Unboxing Video Protocol
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <Video size={22} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                How to record your unboxing video
                            </h2>
                        </div>
                        <p className="font-body text-xs md:text-sm text-[#656464] dark:text-[#babab0] mb-6">
                            Please record this video at the time of receiving your order — before opening the package:
                        </p>

                        <div className="space-y-3.5 mb-6">
                            {[
                                "Start recording before touching or cutting the package. The sealed outer packaging must be clearly visible at the start.",
                                "Keep the video uncut and continuous — do not pause, stop or edit the recording at any point.",
                                "Open the package fully on camera and show all sides of the product.",
                                "If there is a defect or damage, hold the product close to the camera so it is clearly visible in the video.",
                                "Save the video to your device immediately after recording."
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

                        {/* Tip Box */}
                        <div className="p-4 md:p-5 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#6e5b44]/20 dark:border-[#ead0b3]/20 flex items-start gap-3">
                            <Lightbulb size={18} className="text-[#6e5b44] dark:text-[#ead0b3] mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="font-label text-[10px] uppercase tracking-widest text-[#6e5b44] dark:text-[#ead0b3] font-bold block mb-1">
                                    Helpful Tip
                                </span>
                                <p className="font-body text-xs md:text-sm text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed">
                                    Record in a well-lit space so the product and any defect are clearly visible. Blurry or poorly lit videos may delay or invalidate your exchange request.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section: Eligibility (2 Columns) */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Verification Standards
                            </span>
                        </div>
                        <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight mb-6">
                            Exchange Eligibility
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Eligible */}
                            <div className="p-6 rounded-2xl bg-[#f7f9f6] dark:bg-[#1a201a] border border-[#16a34a]/20 dark:border-[#16a34a]/30 space-y-4">
                                <div className="flex items-center gap-2.5">
                                    <CheckCircle2 size={20} className="text-[#16a34a]" />
                                    <h3 className="font-headline text-lg font-semibold text-[#111110] dark:text-[#eae9de]">
                                        Eligible for Exchange
                                    </h3>
                                </div>
                                <p className="font-label text-[10px] uppercase tracking-wider text-[#16a34a] font-bold">
                                    When we will accept your request
                                </p>
                                <ul className="space-y-3 pt-2">
                                    {[
                                        "The product arrived visibly defective or damaged.",
                                        "The wrong product was delivered (different from what was ordered).",
                                        "You have a clear, uncut unboxing video showing the issue.",
                                        "The exchange request is raised within 48 hours of the delivery date.",
                                        "The product is unused, unworn and returned in its original packaging with all tags intact."
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#16a34a] mt-2 flex-shrink-0" />
                                            <span className="font-body text-xs md:text-sm text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed">
                                                {item}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Not Eligible */}
                            <div className="p-6 rounded-2xl bg-[#faf5f5] dark:bg-[#231a1a] border border-[#dc2626]/20 dark:border-[#dc2626]/30 space-y-4">
                                <div className="flex items-center gap-2.5">
                                    <XCircle size={20} className="text-[#dc2626]" />
                                    <h3 className="font-headline text-lg font-semibold text-[#111110] dark:text-[#eae9de]">
                                        Not Eligible for Exchange
                                    </h3>
                                </div>
                                <p className="font-label text-[10px] uppercase tracking-wider text-[#dc2626] font-bold">
                                    When we cannot accept a request
                                </p>
                                <ul className="space-y-3 pt-2">
                                    {[
                                        "No unboxing video is provided at the time of raising the request.",
                                        "The request is raised after 48 hours of the confirmed delivery date.",
                                        "The product shows signs of use, wear, damage or alteration after delivery.",
                                        "The issue is related to personal preference — for example, size, style or colour — rather than a product defect.",
                                        "Items purchased during promotional sales or at discounted prices, unless the item is defective.",
                                        "Damage caused by misuse, improper storage or external factors after delivery."
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#dc2626] mt-2 flex-shrink-0" />
                                            <span className="font-body text-xs md:text-sm text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed">
                                                {item}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section: Exchange Process & Timeline Stats */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Resolution Protocol
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <FileCheck size={22} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                Exchange Process
                            </h2>
                        </div>
                        <p className="font-body text-xs md:text-sm text-[#656464] dark:text-[#babab0] mb-6">
                            Step-by-step: how to raise a request
                        </p>

                        <div className="space-y-3.5 mb-8">
                            {[
                                "Record your unboxing video at the moment you open your package.",
                                "Email us at support@sovra.in within 48 hours of delivery.",
                                "Include your order number, a brief description of the issue and attach the unboxing video.",
                                "Our team will review your request within 2 business days and respond with next steps.",
                                "If your request is approved, we will arrange a reverse pickup at no extra cost to you.",
                                "Once the item is received and inspected, your replacement will be dispatched within 2–4 business days."
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

                        {/* 4 Highlight Stat Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 md:p-5 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5">
                                <span className="font-label text-[9px] uppercase tracking-widest text-[#6e5b44] dark:text-[#ead0b3] font-bold block mb-1">
                                    Request Window
                                </span>
                                <h4 className="font-headline text-lg font-semibold text-[#111110] dark:text-[#eae9de]">
                                    Within 48 Hours
                                </h4>
                                <p className="font-body text-xs text-[#656464] dark:text-[#babab0] mt-1">
                                    From confirmed delivery date
                                </p>
                            </div>

                            <div className="p-4 md:p-5 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5">
                                <span className="font-label text-[9px] uppercase tracking-widest text-[#6e5b44] dark:text-[#ead0b3] font-bold block mb-1">
                                    Review Time
                                </span>
                                <h4 className="font-headline text-lg font-semibold text-[#111110] dark:text-[#eae9de]">
                                    2 Business Days
                                </h4>
                                <p className="font-body text-xs text-[#656464] dark:text-[#babab0] mt-1">
                                    After we receive request
                                </p>
                            </div>

                            <div className="p-4 md:p-5 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5">
                                <span className="font-label text-[9px] uppercase tracking-widest text-[#6e5b44] dark:text-[#ead0b3] font-bold block mb-1">
                                    Replacement Dispatch
                                </span>
                                <h4 className="font-headline text-lg font-semibold text-[#111110] dark:text-[#eae9de]">
                                    2–4 Business Days
                                </h4>
                                <p className="font-body text-xs text-[#656464] dark:text-[#babab0] mt-1">
                                    After approval & pickup
                                </p>
                            </div>

                            <div className="p-4 md:p-5 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5">
                                <span className="font-label text-[9px] uppercase tracking-widest text-[#6e5b44] dark:text-[#ead0b3] font-bold block mb-1">
                                    Reverse Pickup
                                </span>
                                <h4 className="font-headline text-lg font-semibold text-[#111110] dark:text-[#eae9de]">
                                    Arranged by Sovra
                                </h4>
                                <p className="font-body text-xs text-[#656464] dark:text-[#babab0] mt-1">
                                    At no cost to the customer
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section: Important Notes */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Important Notes
                            </span>
                        </div>
                        <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight mb-4">
                            Please keep in mind
                        </h2>
                        <div className="space-y-3">
                            {[
                                "Exchanges are subject to product availability. If the same product is unavailable, we will offer an equivalent alternative.",
                                "Only one exchange is permitted per order.",
                                "Do not ship any item back to us without prior approval — unapproved returns will not be accepted.",
                                "Sovra reserves the right to reject any exchange request that does not meet the above criteria."
                            ].map((note, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-3.5 p-4 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5"
                                >
                                    <span className="w-2 h-2 rounded-full bg-[#6e5b44] dark:bg-[#ead0b3] mt-2 flex-shrink-0" />
                                    <p className="font-body text-xs md:text-sm text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed">
                                        {note}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section: Contact Us */}
                    <section className="relative z-10">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Contact Us
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <Mail size={22} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                We are here to help
                            </h2>
                        </div>
                        <p className="font-body text-sm text-[#656464] dark:text-[#babab0] mb-5">
                            If you have questions about your order or need to raise an exchange request, reach out to us:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                        <div className="mt-8 text-center">
                            <p className="font-body text-xs md:text-sm text-[#656464] dark:text-[#babab0] italic">
                                We are committed to making every Sovra experience a good one. Thank you for shopping with us.
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default ReturnsPolicy
