import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, MapPin, Phone, Mail, Sparkles } from 'lucide-react'
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
        <div className="pt-32 pb-24 bg-[#fffcf7] min-h-screen selection:bg-primary/10">
            <main className="max-w-[1920px] mx-auto px-6 md:px-12 lg:px-24">
                <header className="mb-24 text-center max-w-4xl mx-auto">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-sans text-[10px] tracking-[0.5em] uppercase text-[#7a7670] mb-6 block font-black italic"
                    >
                        Direct Correspondence
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-premium text-7xl md:text-9xl text-[#111110] leading-[0.8] mb-12 italic font-light tracking-tighter"
                    >
                        Connect with the <span className="not-italic font-normal">Maison</span>
                    </motion.h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
                    {/* Info Side */}
                    <div className="space-y-16">
                        <section className="space-y-8">
                            <h2 className="font-premium text-4xl italic text-[#111110]">A Personal Connection</h2>
                            <p className="font-body text-lg text-[#656464] leading-relaxed italic font-light">
                                "Whether you seek professional guidance on our archival collections or require assistance with an acquisition, our specialists are at your disposal."
                            </p>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {[
                                { icon: Mail, label: 'Correspondence', value: 'sorvrajewellery@gmail.com' },
                                { icon: Phone, label: 'Private Line', value: '+91 9571746435' },
                                { icon: MapPin, label: 'Maison Address', value: '23, Pulla Beside Platinum Square\nRK Circle, Udaipur-313001' },
                                { icon: Sparkles, label: 'Availability', value: 'Mon - Fri, 10am - 6pm GMT' }
                            ].map((item, i) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + (i * 0.1) }}
                                    className="space-y-4"
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
                                        <item.icon size={16} strokeWidth={1.5} />
                                    </div>
                                    <h3 className="font-sans text-[9px] uppercase tracking-widest font-black opacity-40">{item.label}</h3>
                                    <p className="font-premium text-xl italic text-[#111110] whitespace-pre-line">{item.value}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Form Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-12 md:p-16 shadow-lux-soft border border-[#111110]/5 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-12 opacity-[0.02] select-none pointer-events-none">
                            <span className="font-premium text-[15rem] leading-none italic">S.</span>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-4">
                                    <label className="text-[9px] uppercase tracking-[0.4em] font-black opacity-40">Your Name</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-transparent border-b border-[#111110]/10 py-3 font-body text-lg italic outline-none focus:border-primary transition-colors"
                                        placeholder="Enter your name..."
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[9px] uppercase tracking-[0.4em] font-black opacity-40">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full bg-transparent border-b border-[#111110]/10 py-3 font-body text-lg italic outline-none focus:border-primary transition-colors"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[9px] uppercase tracking-[0.4em] font-black opacity-40">Nature of Inquiry</label>
                                <select
                                    className="w-full bg-transparent border-b border-[#111110]/10 py-3 font-body text-lg italic outline-none focus:border-primary transition-colors appearance-none"
                                    value={formData.subject}
                                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                >
                                    <option>General Inquiry</option>
                                    <option>Archival Sizing</option>
                                    <option>Shipping & Logistics</option>
                                </select>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[9px] uppercase tracking-[0.4em] font-black opacity-40">Message</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={formData.message}
                                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full bg-transparent border-b border-[#111110]/10 py-3 font-body text-lg italic outline-none focus:border-primary transition-colors resize-none"
                                    placeholder="How may we assist you today?"
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={status === 'sending'}
                                className="w-full bg-[#111110] text-[#f5f0e8] py-6 px-10 text-[10px] tracking-[0.5em] uppercase font-sans font-black flex items-center justify-center gap-4 hover:opacity-95 transition-all shadow-lux-sm active:scale-[0.98] disabled:opacity-50"
                            >
                                <Send size={14} />
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
