import React from 'react'
import { motion } from 'framer-motion'
import {
    FileText,
    UserCheck,
    Tag,
    CreditCard,
    Shield,
    Scale,
    Gavel,
    RefreshCw,
    Mail,
    Globe,
    Calendar,
    AlertCircle,
    MessageSquare
} from 'lucide-react'

const TermsOfService = () => {
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
                        Terms of Service
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
                        <FileText size={420} />
                    </div>

                    {/* Section: Agreement */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Agreement
                            </span>
                        </div>
                        <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight mb-4">
                            By using our website, you agree to these terms
                        </h2>
                        <div className="bg-[#faf8f2] dark:bg-[#1f1f1d] border-l-4 border-[#6e5b44] dark:border-[#ead0b3] p-5 md:p-6 rounded-r-xl space-y-3">
                            <p className="font-body text-sm md:text-base text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed">
                                Welcome to Sovra. These Terms of Service (&ldquo;Terms&rdquo;) govern your use of our website at <strong className="text-[#111110] dark:text-[#eae9de] font-semibold">sovra.in</strong> and any purchases made through it. Please read these Terms carefully. By accessing our website or placing an order, you confirm that you have read, understood and agree to be bound by these Terms.
                            </p>
                            <p className="font-body text-xs md:text-sm text-[#8c6b45] dark:text-[#e4be96] font-medium pt-1 italic">
                                If you do not agree to these Terms, please do not use our website.
                            </p>
                        </div>
                    </section>

                    {/* Section: Eligibility */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Eligibility
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <UserCheck size={22} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                Who can shop with us
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {[
                                "You must be at least 18 years of age to place an order on Sovra.",
                                "By placing an order, you confirm that the information you provide is accurate and complete.",
                                "Sovra reserves the right to refuse service to anyone at its sole discretion."
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-3.5 p-4 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5"
                                >
                                    <span className="w-2 h-2 rounded-full bg-[#6e5b44] dark:bg-[#ead0b3] mt-2 flex-shrink-0" />
                                    <p className="font-body text-xs md:text-sm text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed">
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section: Products & Pricing */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Products & Pricing
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <Tag size={22} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                Product information and prices
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {[
                                "We make every effort to display product images, descriptions and details as accurately as possible. Slight variations in colour may occur due to screen settings.",
                                "All prices on sovra.in are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.",
                                "Sovra reserves the right to change prices at any time without prior notice. The price applicable to your order is the price displayed at the time of checkout.",
                                "In the event of a pricing error, we reserve the right to cancel the affected order and issue a full refund."
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-3.5 p-4 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5"
                                >
                                    <span className="w-2 h-2 rounded-full bg-[#6e5b44] dark:bg-[#ead0b3] mt-2 flex-shrink-0" />
                                    <p className="font-body text-xs md:text-sm text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed">
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section: Orders & Payments */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Orders & Payments
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <CreditCard size={22} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                Placing and paying for an order
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {[
                                "Placing an item in your cart does not guarantee availability. Orders are confirmed only upon successful payment.",
                                "We accept payments through the methods displayed at checkout, including cards, UPI and net banking.",
                                "All transactions are processed through secure, third-party payment gateways. Sovra does not store any payment credentials.",
                                "You will receive an order confirmation on your registered email address once payment is successfully processed.",
                                "Sovra reserves the right to cancel any order in the event of suspected fraud, incorrect pricing or stock unavailability. A full refund will be issued in such cases."
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-3.5 p-4 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5"
                                >
                                    <span className="w-2 h-2 rounded-full bg-[#6e5b44] dark:bg-[#ead0b3] mt-2 flex-shrink-0" />
                                    <p className="font-body text-xs md:text-sm text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed">
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section: Communications & Authorization */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Communications & Authorization
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <MessageSquare size={22} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                Consent for Communication
                            </h2>
                        </div>
                        <div className="p-4 md:p-5 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border-l-4 border-[#6e5b44] dark:border-[#ead0b3] border border-[#111110]/5 dark:border-[#eae9de]/5">
                            <p className="font-body text-xs md:text-sm text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed font-medium">
                                I authorize CBIS INDIA PVT LIMITED and its affiliates to contact me via WhatsApp, SMS, Email and RCS on my registered number.
                            </p>
                        </div>
                    </section>

                    {/* Section: Intellectual Property */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Intellectual Property
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <Shield size={22} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                Our content belongs to us
                            </h2>
                        </div>
                        <p className="font-body text-sm md:text-base text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed max-w-4xl">
                            All content on <strong className="text-[#111110] dark:text-[#eae9de] font-semibold">sovra.in</strong> — including product images, copy, logos, graphics and the website design — is the intellectual property of Sovra and is protected by applicable copyright and trademark laws. You may not reproduce, distribute or use any content from this website without our prior written permission.
                        </p>
                    </section>

                    {/* Section: Limitation of Liability */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Limitation of Liability
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <Scale size={22} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                Our responsibility to you
                            </h2>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 md:p-5 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5">
                                <p className="font-body text-xs md:text-sm text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed">
                                    To the maximum extent permitted by applicable law, Sovra shall not be liable for any indirect, incidental or consequential damages arising from your use of our website or products. Our total liability for any claim shall not exceed the value of the order in question.
                                </p>
                            </div>
                            <div className="p-4 md:p-5 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5">
                                <p className="font-body text-xs md:text-sm text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed">
                                    We are not responsible for delays or failures caused by events outside our control, including natural disasters, courier disruptions or payment gateway outages.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section: Governing Law */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Governing Law
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <Gavel size={22} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                Jurisdiction
                            </h2>
                        </div>
                        <p className="font-body text-sm md:text-base text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed max-w-4xl">
                            These Terms are governed by the laws of India. Any disputes arising from these Terms or your use of the website shall be subject to the exclusive jurisdiction of the courts in India.
                        </p>
                    </section>

                    {/* Section: Changes to Terms */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Changes to Terms
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <RefreshCw size={22} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                We may update these terms
                            </h2>
                        </div>
                        <p className="font-body text-sm md:text-base text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed max-w-4xl">
                            Sovra reserves the right to update or modify these Terms at any time. Changes will be posted on this page with a revised effective date. Continued use of the website after any changes constitutes your acceptance of the revised Terms.
                        </p>
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
                                Questions about these Terms?
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3">
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
                            <a
                                href="https://sovra.in"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-4 md:p-5 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5 hover:border-[#6e5b44]/30 dark:hover:border-[#ead0b3]/30 transition-colors group"
                            >
                                <span className="font-label text-[10px] uppercase tracking-widest text-[#6e5b44] dark:text-[#ead0b3] font-bold block mb-1">
                                    Website
                                </span>
                                <span className="font-body text-sm font-semibold text-[#111110] dark:text-[#eae9de] group-hover:text-[#6e5b44] transition-colors">
                                    sovra.in
                                </span>
                            </a>
                            <div className="p-4 md:p-5 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5">
                                <span className="font-label text-[10px] uppercase tracking-widest text-[#6e5b44] dark:text-[#ead0b3] font-bold block mb-1">
                                    Response Time
                                </span>
                                <span className="font-body text-sm font-semibold text-[#111110] dark:text-[#eae9de]">
                                    Within 48 business hours
                                </span>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    )
}

export default TermsOfService
