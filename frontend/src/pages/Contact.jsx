import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, MapPin, Phone, Mail, Building2, Clock } from 'lucide-react'
import { toast } from 'react-toastify'

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: 'General Inquiry',
        message: ''
    })
    const [status, setStatus] = useState('idle')

    const handleSubmit = (e) => {
        e.preventDefault()
        setStatus('sending')
        // Simulate API call
        setTimeout(() => {
            toast.success('Your correspondence has been received by the Maison.')
            setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' })
            setStatus('idle')
        }, 1500)
    }

    return (
        <div className="pt-28 md:pt-36 pb-24 bg-[#fffcf7] dark:bg-[#121211] min-h-screen selection:bg-primary/10">
            <main className="max-w-[1720px] mx-auto px-5 sm:px-8 md:px-12 lg:px-20">
                {/* Header */}
                <header className="mb-16 md:mb-24 text-center max-w-4xl mx-auto">
                    <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-headline tracking-[0.3em] uppercase text-xs md:text-sm text-[#6e5b44] dark:text-[#ead0b3] font-bold mb-3"
                    >
                        SOVRA
                    </motion.p>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="font-headline text-4xl sm:text-6xl md:text-7xl text-[#111110] dark:text-[#eae9de] font-light tracking-tight mb-6"
                    >
                        Contact Information
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-body text-sm md:text-base text-[#656464] dark:text-[#babab0] max-w-2xl mx-auto italic font-light"
                    >
                        Direct correspondence & official details of the Maison.
                    </motion.p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start max-w-7xl mx-auto">
                    {/* Info Side (Official Contact Information) */}
                    <div className="lg:col-span-6 space-y-10">
                        <section className="space-y-4">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3] block">
                                — Official Details
                            </span>
                            <h2 className="font-headline text-3xl md:text-4xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                A Personal Connection
                            </h2>
                            <p className="font-body text-sm md:text-base text-[#656464] dark:text-[#babab0] leading-relaxed">
                                Whether you seek guidance on our collections, require assistance with an acquisition, or have general inquiries, our team is at your disposal.
                            </p>
                        </section>

                        {/* Contact Information Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Trade Name */}
                            <div className="p-5 rounded-2xl bg-white dark:bg-[#181816] border border-[#111110]/6 dark:border-[#eae9de]/8 shadow-sm space-y-2.5">
                                <div className="w-10 h-10 rounded-full bg-[#6e5b44]/10 dark:bg-[#ead0b3]/10 flex items-center justify-center text-[#6e5b44] dark:text-[#ead0b3]">
                                    <Building2 size={18} strokeWidth={1.5} />
                                </div>
                                <span className="font-label text-[10px] uppercase tracking-widest text-[#6e5b44] dark:text-[#ead0b3] font-bold block">
                                    Trade Name
                                </span>
                                <p className="font-headline text-xl font-semibold text-[#111110] dark:text-[#eae9de]">
                                    Sovra
                                </p>
                            </div>

                            {/* Phone Number */}
                            <a
                                href="tel:9571746435"
                                className="p-5 rounded-2xl bg-white dark:bg-[#181816] border border-[#111110]/6 dark:border-[#eae9de]/8 shadow-sm space-y-2.5 hover:border-[#6e5b44]/40 dark:hover:border-[#ead0b3]/40 transition-colors group block"
                            >
                                <div className="w-10 h-10 rounded-full bg-[#6e5b44]/10 dark:bg-[#ead0b3]/10 flex items-center justify-center text-[#6e5b44] dark:text-[#ead0b3] group-hover:scale-105 transition-transform">
                                    <Phone size={18} strokeWidth={1.5} />
                                </div>
                                <span className="font-label text-[10px] uppercase tracking-widest text-[#6e5b44] dark:text-[#ead0b3] font-bold block">
                                    Phone Number
                                </span>
                                <p className="font-headline text-xl font-semibold text-[#111110] dark:text-[#eae9de] group-hover:text-[#6e5b44] dark:group-hover:text-[#ead0b3] transition-colors">
                                    9571746435
                                </p>
                            </a>

                            {/* Email */}
                            <a
                                href="mailto:support@sovra.in"
                                className="p-5 rounded-2xl bg-white dark:bg-[#181816] border border-[#111110]/6 dark:border-[#eae9de]/8 shadow-sm space-y-2.5 hover:border-[#6e5b44]/40 dark:hover:border-[#ead0b3]/40 transition-colors group block"
                            >
                                <div className="w-10 h-10 rounded-full bg-[#6e5b44]/10 dark:bg-[#ead0b3]/10 flex items-center justify-center text-[#6e5b44] dark:text-[#ead0b3] group-hover:scale-105 transition-transform">
                                    <Mail size={18} strokeWidth={1.5} />
                                </div>
                                <span className="font-label text-[10px] uppercase tracking-widest text-[#6e5b44] dark:text-[#ead0b3] font-bold block">
                                    Email
                                </span>
                                <p className="font-headline text-lg sm:text-xl font-semibold text-[#111110] dark:text-[#eae9de] group-hover:text-[#6e5b44] dark:group-hover:text-[#ead0b3] transition-colors truncate">
                                    support@sovra.in
                                </p>
                            </a>

                            {/* Physical Address */}
                            <div className="p-5 rounded-2xl bg-white dark:bg-[#181816] border border-[#111110]/6 dark:border-[#eae9de]/8 shadow-sm space-y-2.5">
                                <div className="w-10 h-10 rounded-full bg-[#6e5b44]/10 dark:bg-[#ead0b3]/10 flex items-center justify-center text-[#6e5b44] dark:text-[#ead0b3]">
                                    <MapPin size={18} strokeWidth={1.5} />
                                </div>
                                <span className="font-label text-[10px] uppercase tracking-widest text-[#6e5b44] dark:text-[#ead0b3] font-bold block">
                                    Physical Address
                                </span>
                                <p className="font-headline text-sm md:text-[15px] font-medium text-[#111110] dark:text-[#eae9de] leading-snug">
                                    23, Pulla Beside Platinum Square RK Circle, Udaipur-313001
                                </p>
                            </div>
                        </div>

                        {/* Response Time Reassurance Box */}
                        <div className="p-5 rounded-2xl bg-[#faf8f2] dark:bg-[#1f1f1d] border border-[#6e5b44]/20 dark:border-[#ead0b3]/20 flex items-start gap-3.5">
                            <Clock size={20} className="text-[#6e5b44] dark:text-[#ead0b3] mt-0.5 flex-shrink-0" />
                            <div>
                                <span className="font-label text-[10px] uppercase tracking-widest text-[#6e5b44] dark:text-[#ead0b3] font-bold block mb-1">
                                    Response Protocol
                                </span>
                                <p className="font-body text-xs md:text-sm text-[#4a4947] dark:text-[#d4d3cc] leading-relaxed">
                                    Our concierge responds to inquiries within <strong>24–48 business hours</strong>. For urgent delivery updates, please include your Order ID in the email subject.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form Side */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="lg:col-span-6 bg-white dark:bg-[#181816] p-8 sm:p-12 md:p-14 rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-[#111110]/6 dark:border-[#eae9de]/8 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] dark:opacity-[0.03] select-none pointer-events-none">
                            <span className="font-headline text-[14rem] leading-none">S</span>
                        </div>

                        <div className="relative z-10 mb-8">
                            <span className="font-label text-[10px] md:text-xs tracking-[0.25em] uppercase font-bold text-[#6e5b44] dark:text-[#ead0b3] block mb-2">
                                — Message Us
                            </span>
                            <h3 className="font-headline text-2xl md:text-3xl text-[#111110] dark:text-[#eae9de] font-normal tracking-tight">
                                Send a Correspondence
                            </h3>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#6e5b44] dark:text-[#ead0b3] block">
                                        Your Name
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-transparent border-b border-[#111110]/15 dark:border-[#eae9de]/15 py-2.5 font-body text-base text-[#111110] dark:text-[#eae9de] outline-none focus:border-[#6e5b44] dark:focus:border-[#ead0b3] transition-colors"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#6e5b44] dark:text-[#ead0b3] block">
                                        Email Address
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-transparent border-b border-[#111110]/15 dark:border-[#eae9de]/15 py-2.5 font-body text-base text-[#111110] dark:text-[#eae9de] outline-none focus:border-[#6e5b44] dark:focus:border-[#ead0b3] transition-colors"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#6e5b44] dark:text-[#ead0b3] block">
                                    Nature of Inquiry
                                </label>
                                <select
                                    className="w-full bg-transparent border-b border-[#111110]/15 dark:border-[#eae9de]/15 py-2.5 font-body text-base text-[#111110] dark:text-[#eae9de] outline-none focus:border-[#6e5b44] dark:focus:border-[#ead0b3] transition-colors dark:bg-[#181816]"
                                    value={formData.subject}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                >
                                    <option value="General Inquiry">General Inquiry</option>
                                    <option value="Order & Tracking">Order & Tracking</option>
                                    <option value="Returns & Exchange">Returns & Exchange</option>
                                    <option value="Custom Sizing">Custom Sizing</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#6e5b44] dark:text-[#ead0b3] block">
                                    Message
                                </label>
                                <textarea
                                    required
                                    rows="4"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-transparent border-b border-[#111110]/15 dark:border-[#eae9de]/15 py-2.5 font-body text-base text-[#111110] dark:text-[#eae9de] outline-none focus:border-[#6e5b44] dark:focus:border-[#ead0b3] transition-colors resize-none"
                                    placeholder="How may we assist you today?"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="w-full bg-[#111110] dark:bg-[#eae9de] text-[#f5f0e8] dark:text-[#111110] py-4 px-8 text-xs tracking-[0.3em] uppercase font-headline font-bold flex items-center justify-center gap-3 hover:opacity-90 transition-all rounded-xl active:scale-[0.99] disabled:opacity-50"
                            >
                                <Send size={15} />
                                {status === 'sending' ? 'Sending Correspondence...' : 'Deliver Message'}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </main>
        </div>
    )
}

export default Contact
