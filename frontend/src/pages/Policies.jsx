import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Truck, RefreshCw } from 'lucide-react'

const Policies = () => {
    const [activeTab, setActiveTab] = useState('shipping')

    const tabs = [
        { id: 'shipping', label: 'Shipping & Logistics', icon: Truck },
        { id: 'returns', label: 'Returns & Exchange', icon: RefreshCw }
    ]

    const content = {
        shipping: {
            title: "Archival Dispatch Protocol",
            subtitle: "Global Logistics & Handling",
            sections: [
                {
                    h: "Processing Timeline",
                    p: "Every masterpiece undergoes a final artisanal audit before dispatch. Orders are typically processed within 24-48 hours. During limited capsule launches, please allow up to 72 hours for archival preparation."
                },
                {
                    h: "Celestial Delivery Tracking",
                    p: "Upon dispatch, you will receive a secure tracking signature via email. All shipments are insured and require a signature upon arrival to ensure vault-to-vault security."
                },
                {
                    h: "Global Reach",
                    p: "We offer complimentary express shipping on all acquisitions over ₹10,000. International duties and taxes are calculated at checkout for a seamless acquisition experience."
                }
            ]
        },
        returns: {
            title: "Curation Reversal",
            subtitle: "Exchanges & Redemptions",
            sections: [
                {
                    h: "The 14-Day Window",
                    p: "If a masterpiece does not perfectly align with your essence, you may initiate a return within 14 days of receipt. The item must remain in its original, unworn state with all archival packaging intact."
                },
                {
                    h: "Pierced Masterpieces",
                    p: "Please note that earrings (for hygiene protocols) are exempt from our standard return policy unless a structural anomaly exists."
                }
            ]
        }
    }

    return (
        <div className="pt-32 pb-24 bg-[#fffcf7] min-h-screen selection:bg-primary/10">
            <main className="max-w-[1200px] mx-auto px-6 md:px-12">
                <header className="mb-20 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-headline text-5xl md:text-6xl text-[#111110] font-light tracking-tight mb-4"
                    >
                        Maison Logistics
                    </motion.h1>
                    <p className="font-body text-md text-[#656464] opacity-70 italic font-light">Shipping protocols and return standards of the Maison.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Navigation Buttons */}
                    <div className="lg:col-span-4 space-y-3">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full group px-6 py-6 flex items-center justify-between border transition-all duration-500 ${activeTab === tab.id ? 'bg-[#111110] border-[#111110] text-[#f5f0e8] shadow-md' : 'border-[#111110]/5 hover:border-primary/20 bg-white'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <tab.icon size={16} strokeWidth={activeTab === tab.id ? 2 : 1.5} className={activeTab === tab.id ? 'text-primary' : 'text-[#111110]/20'} />
                                    <span className={`font-body text-sm font-medium ${activeTab === tab.id ? 'text-[#f5f0e8]' : 'text-[#111110]/60'}`}>
                                        {tab.label}
                                    </span>
                                </div>
                                <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${activeTab === tab.id ? 'bg-primary scale-125' : 'bg-transparent'}`} />
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-8 bg-white p-10 md:p-16 shadow-sm border border-[#111110]/5 relative overflow-hidden min-h-[500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-12 relative z-10"
                            >
                                <div className="space-y-4">
                                    <h2 className="font-headline text-3xl md:text-4xl text-[#111110] font-light tracking-tight">{content[activeTab].title}</h2>
                                    <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-primary font-black opacity-60">{content[activeTab].subtitle}</p>
                                </div>

                                <div className="space-y-10">
                                    {content[activeTab].sections.map((section, i) => (
                                        <div key={i} className="space-y-3 max-w-2xl">
                                            <h3 className="font-headline text-xl text-[#111110] pb-2 border-b border-[#111110]/5 inline-block">{section.h}</h3>
                                            <p className="font-body text-md text-[#656464] leading-relaxed">{section.p}</p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="absolute bottom-0 right-0 p-8 opacity-[0.01] select-none pointer-events-none">
                            <span className="font-premium text-[15rem] leading-none italic uppercase">{activeTab.charAt(0)}</span>
                        </div>
                    </div>
                </div>

                <div className="mt-48 text-center bg-primary/5 p-16 border border-primary/10">
                    <p className="font-body text-lg italic text-[#111110]/60 mb-4 font-light">Questions regarding these protocols?</p>
                    <p className="font-sans text-[11px] uppercase tracking-widest font-black text-[#111110]">Direct Inquiries: sorvrajewellery@gmail.com</p>
                </div>
            </main>
        </div>
    )
}

export default Policies
