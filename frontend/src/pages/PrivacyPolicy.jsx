import React from 'react'
import { motion } from 'framer-motion'
import {
    Shield,
    Database,
    Eye,
    Cookie,
    Share2,
    Lock,
    UserCheck,
    Mail,
    Globe,
    Clock,
    Sparkles,
    Calendar
} from 'lucide-react'

const PrivacyPolicy = () => {
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
                        Privacy Policy
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
                    {/* Background Decorative Shield */}
                    <div className="absolute top-0 right-0 p-8 md:p-12 opacity-[0.02] dark:opacity-[0.03] select-none pointer-events-none">
                        <Shield size={420} />
                    </div>

                    {/* Section: Introduction */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Introduction
                            </span>
                        </div>
                        <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight mb-4">
                            Your privacy matters to us
                        </h2>
                        <div className="bg-[#faf8f2] dark:bg-[#1f1f1d] border-l-4 border-[#6e5b44] dark:border-[#ead0b3] p-5 md:p-6 rounded-r-xl">
                            <p className="font-body text-sm md:text-base text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed">
                                Sovra (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is committed to protecting your personal information. This Privacy Policy explains what data we collect when you visit <strong className="text-[#111110] dark:text-[#eae9de] font-semibold">sovra.in</strong>, how we use it, and your rights as a customer. By using our website or placing an order, you agree to the practices described in this policy.
                            </p>
                        </div>
                    </section>

                    {/* Section: Information We Collect */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Information We Collect
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <Database size={22} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                What we gather when you shop
                            </h2>
                        </div>
                        <p className="font-body text-sm md:text-base text-[#656464] dark:text-[#babab0] mb-6">
                            We collect the following information to process and fulfil your orders:
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {[
                                "Full name and contact number",
                                "Email address",
                                "Delivery address and PIN code",
                                "Payment details — processed securely by our payment gateway partners; we do not store card or UPI credentials",
                                "Order history and transaction records",
                                "Browsing and click behaviour on our website (via cookies)",
                                "Device information and IP address for security and fraud prevention"
                            ].map((item, idx) => (
                                <li
                                    key={idx}
                                    className={`flex items-start gap-3 p-3.5 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5 ${idx === 3 ? 'md:col-span-2' : ''}`}
                                >
                                    <span className="w-2 h-2 rounded-full bg-[#6e5b44] dark:bg-[#ead0b3] mt-2 flex-shrink-0" />
                                    <span className="font-body text-xs md:text-sm text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed">
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Section: How We Use Your Information */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — How We Use Your Information
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-4">
                            <Eye size={22} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                Why we need your data
                            </h2>
                        </div>
                        <div className="space-y-3">
                            {[
                                "To confirm, process and deliver your orders",
                                "To send order confirmations, dispatch notifications and tracking updates",
                                "To respond to your queries, complaints or exchange requests",
                                "To improve our website, product range and overall shopping experience",
                                "To send promotional offers and new arrival updates — only if you have opted in (you may opt out at any time)",
                                "To prevent fraud and ensure platform security",
                                "To comply with applicable legal and regulatory requirements"
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-3 p-3.5 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#6e5b44] dark:bg-[#ead0b3] mt-2 flex-shrink-0" />
                                    <p className="font-body text-xs md:text-sm text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed">
                                        {item}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section: Cookies */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Cookies
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <Cookie size={22} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                How we use cookies
                            </h2>
                        </div>
                        <p className="font-body text-sm md:text-base text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed max-w-4xl">
                            Our website uses cookies to remember your preferences, keep items in your cart and understand how you interact with our pages. You can manage or disable cookies through your browser settings. Disabling cookies may affect some features of the website.
                        </p>
                    </section>

                    {/* Section: Data Sharing */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Data Sharing
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <Share2 size={22} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                Who we share your data with
                            </h2>
                        </div>
                        <p className="font-body text-sm md:text-base text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed mb-5 max-w-4xl">
                            We do not sell, rent or trade your personal information to third parties for marketing purposes. We share your data only where necessary with:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {[
                                { title: "Courier & logistics partners", desc: "To deliver your order seamlessly" },
                                { title: "Payment gateway providers", desc: "To process your payment securely" },
                                { title: "Technology service providers", desc: "Who help run our website and operations, bound by confidentiality obligations" },
                                { title: "Legal authorities", desc: "Where required by law or court order" }
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5"
                                >
                                    <h3 className="font-headline text-sm md:text-base font-semibold text-[#111110] dark:text-[#eae9de] mb-1">
                                        • {item.title}
                                    </h3>
                                    <p className="font-body text-xs md:text-sm text-[#656464] dark:text-[#babab0] leading-relaxed">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section: Data Security */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Data Security
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <Lock size={22} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                How we protect your information
                            </h2>
                        </div>
                        <p className="font-body text-sm md:text-base text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed max-w-4xl">
                            We use industry-standard SSL encryption on our website and work only with payment partners who comply with PCI-DSS standards. While we take reasonable precautions, no method of internet transmission is 100% secure. We encourage you to contact us immediately if you notice any unauthorised activity on your account.
                        </p>
                    </section>

                    {/* Section: Your Rights */}
                    <section className="relative z-10 border-b border-[#111110]/6 dark:border-[#eae9de]/8 pb-10 md:pb-12">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3]">
                                — Your Rights
                            </span>
                        </div>
                        <div className="flex items-center gap-3 mb-3">
                            <UserCheck size={22} className="text-[#6e5b44] dark:text-[#ead0b3]" />
                            <h2 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                What you can ask us to do
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                            {[
                                "Access a copy of the personal data we hold about you",
                                "Request correction of any inaccurate or incomplete information",
                                "Request deletion of your data, subject to any legal obligations we may have",
                                "Withdraw your consent to marketing communications at any time"
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-start gap-3 p-3.5 rounded-xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#111110]/5 dark:border-[#eae9de]/5"
                                >
                                    <span className="w-2 h-2 rounded-full bg-[#6e5b44] dark:bg-[#ead0b3] mt-2 flex-shrink-0" />
                                    <span className="font-body text-xs md:text-sm text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed">
                                        {item}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <div className="bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#6e5b44]/20 dark:border-[#ead0b3]/20 p-4 md:p-5 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <p className="font-body text-xs md:text-sm text-[#4a4947] dark:text-[#d4d3cc]">
                                To exercise any of these rights, email us at{' '}
                                <a href="mailto:support@sovra.in" className="font-semibold text-[#6e5b44] dark:text-[#ead0b3] hover:underline">
                                    support@sovra.in
                                </a>
                                . We will respond within <strong>7 business days</strong>.
                            </p>
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
                                Questions about this policy?
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

                {/* Footer Note */}
                <footer className="mt-12 text-center text-xs font-body text-[#656464] dark:text-[#babab0] opacity-80 max-w-2xl mx-auto space-y-2">
                    <p>
                        We may update this Privacy Policy from time to time. Any changes will be published on this page with a revised effective date.
                    </p>
                </footer>
            </main>
        </div>
    )
}

export default PrivacyPolicy
