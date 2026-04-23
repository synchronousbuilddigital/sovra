import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Search } from 'lucide-react'

const faqData = [
    {
        category: 'Materials & Craftsmanship',
        questions: [
            {
                q: "What materials do you use for your pieces?",
                a: "Our archival collections primarily feature surgical-grade Stainless Steel base, layered with our signature 18K PVD Gold Plating. This process ensures exceptional durability, sweat-proofing, and a lifelong golden luster that far exceeds standard gold plating."
            },
            {
                q: "Are the gemstones natural?",
                a: "We curate a mix of high-grade natural stones and ethically sourced lab-grown brilliance. Each product description specifies the exact nature of the stones used."
            },
            {
                q: "Is your jewellery hypoallergenic?",
                a: "Yes. All SOVRA pieces are 100% hypoallergenic, lead-free, and nickel-free, making them safe for even the most sensitive skin types."
            }
        ]
    },
    {
        category: 'Sizing & Care',
        questions: [
            {
                q: "How do I find my ring size?",
                a: "Please refer to our dedicated Size Guide page. We provide detailed measurements in millimeters for both circumference and diameter to ensure a celestial fit."
            },
            {
                q: "How should I care for my archive pieces?",
                a: "While our pieces are water and sweatproof, we recommend rinsing with fresh water after contact with seawater or chlorine. Clean gently with a soft microfiber cloth and store in your SOVRA travel pouch when not in exhibition."
            }
        ]
    },
    {
        category: 'Shipping & Logistics',
        questions: [
            {
                q: "Do you ship internationally?",
                a: "We offer global archival dispatch to over 150 countries. Shipping times vary by continent, typically ranging from 3-7 business days."
            },
            {
                q: "How can I track my acquisition?",
                a: "Once your piece is dispatched from our Maison, a celestial tracking link will be sent to your registered email and appear in your 'Vault' dashboard."
            }
        ]
    }
]

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState('0-0')
    const [searchQuery, setSearchQuery] = useState('')

    const toggle = (id) => {
        setOpenIndex(openIndex === id ? null : id)
    }

    return (
        <div className="pt-32 pb-24 bg-[#fffcf7] min-h-screen selection:bg-primary/10">
            <main className="max-w-[1200px] mx-auto px-6 md:px-12">
                <header className="mb-20 text-center max-w-2xl mx-auto space-y-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-headline text-5xl md:text-6xl text-[#111110] font-light tracking-tight"
                    >
                        Common Inquiries
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="font-body text-md text-[#656464] opacity-70"
                    >
                        Detailed information on archival care, materials, and global logistics.
                    </motion.p>

                    <div className="relative pt-6">
                        <Search className="absolute left-6 top-[2.75rem] text-[#111110]/20" size={16} />
                        <input 
                            type="text" 
                            placeholder="Find an answer..."
                            className="w-full bg-white border border-[#111110]/5 py-4 pl-14 pr-6 font-body text-sm outline-none focus:border-primary shadow-sm transition-all rounded-full"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Navigation Sidebar */}
                    <div className="hidden lg:block space-y-6 sticky top-32 h-fit">
                        <h3 className="font-sans text-[9px] uppercase tracking-widest font-black opacity-30">Categories</h3>
                        <nav className="flex flex-col gap-4">
                            {faqData.map((cat, idx) => (
                                <button 
                                    key={cat.category}
                                    onClick={() => document.getElementById(`cat-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                                    className="text-left font-body text-sm text-[#111110]/60 hover:text-primary transition-colors"
                                >
                                    {cat.category}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3 space-y-20">
                        {faqData.map((category, catIdx) => (
                            <section key={catIdx} id={`cat-${catIdx}`} className="space-y-8">
                                <h2 className="font-headline text-2xl text-[#111110] border-b border-[#111110]/5 pb-4">{category.category}</h2>
                                <div className="space-y-px">
                                    {category.questions.map((item, qIdx) => {
                                        const id = `${catIdx}-${qIdx}`
                                        const isOpen = openIndex === id
                                        
                                        if (searchQuery && !item.q.toLowerCase().includes(searchQuery.toLowerCase()) && !item.a.toLowerCase().includes(searchQuery.toLowerCase())) return null

                                        return (
                                            <div key={id} className={`group border-b border-[#111110]/5 transition-all duration-500`}>
                                                <button 
                                                    onClick={() => toggle(id)}
                                                    className="w-full py-6 flex justify-between items-center text-left"
                                                >
                                                    <span className={`font-body text-md transition-colors ${isOpen ? 'text-primary' : 'text-[#111110] hover:text-primary'}`}>{item.q}</span>
                                                    <span className={`transition-transform duration-500 ${isOpen ? 'rotate-180 text-primary' : 'text-[#111110]/20'}`}>
                                                        {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                                                    </span>
                                                </button>
                                                <AnimatePresence>
                                                    {isOpen && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            <div className="pb-8 font-body text-sm text-[#656464] leading-relaxed max-w-2xl">
                                                                {item.a}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )
                                    })}
                                </div>
                            </section>
                        ))}
                    </div>
                </div>

                {/* Footer Link */}
                <div className="mt-32 py-16 border-t border-[#111110]/5 text-center">
                    <p className="font-body text-sm text-[#656464] mb-6">Can't find what you're looking for?</p>
                    <button className="font-sans text-[9px] tracking-widest uppercase border-b border-[#111110] pb-1 font-black">
                        Contact our Specialists
                    </button>
                </div>
            </main>
        </div>
    )
}

export default FAQ
