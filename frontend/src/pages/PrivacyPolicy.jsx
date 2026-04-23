import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Eye, Database, Share2, MousePointer2, UserCheck, Clock, RefreshCcw, Mail } from 'lucide-react'

const PrivacyPolicy = () => {
    const sections = [
        {
            id: 1,
            icon: MousePointer2,
            h: "PERSONAL INFORMATION WE COLLECT",
            p: [
                "When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you browse the Site, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the Site, and information about how you interact with the Site. We refer to this automatically-collected information as “Device Information”.",
                "We collect Device Information using technologies: “Cookies” are data files that are placed on your device, “Log files” track actions occurring on the Site, and “Web beacons”, “tags”, and “pixels” are electronic files used to record information about how you browse the Site.",
                "Additionally, when you make a purchase or attempt to make a purchase through the Website, we collect certain information from you, including your name, billing address, shipping address, payment information (including credit card numbers), email address, and phone number. But we do not store your credit card and other payment details with us. We refer to this information as “Order Information”."
            ]
        },
        {
            id: 2,
            icon: Eye,
            h: "HOW DO WE USE YOUR PERSONAL INFORMATION?",
            p: [
                "We use the Order Information that we collect generally to fulfil any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).",
                "Additionally, we use this Order Information to: Communicate with you; Screen our orders for potential risk or fraud; and provide you with information or advertising relating to our products or services.",
                "We use the Device Information that we collect to help us screen for potential risk and fraud, and more generally to improve and optimize our Site."
            ]
        },
        {
            id: 3,
            icon: Share2,
            h: "SHARING YOUR PERSONAL INFORMATION",
            p: [
                "We share your Personal Information with third parties to help us use your Personal Information, as described above. For example, we use Google Analytics to help us understand how our customers use the Site.",
                "Finally, we may also share your Personal Information to comply with applicable laws and regulations, to respond to a subpoena, search warrant or other lawful request for information we receive, or to otherwise protect our rights."
            ]
        },
        {
            id: 4,
            icon: UserCheck,
            h: "YOUR RIGHTS",
            p: [
                "Prior to the creation of account and sharing your information, you have an option to not provide the same. However, in such a scenario, we reserve the right, at our sole discretion, to not provide any goods or services.",
                "If you are a European resident, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted.",
                "In case you want to review your personal information or want your personal data corrected/deleted, please email to sorvrajewellery@gmail.com with subject “Review/Changes of my Personal Data”. We will make necessary changes within 60 days of receipt."
            ]
        },
        {
            id: 5,
            icon: Clock,
            h: "DATA RETENTION",
            p: [
                "When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information."
            ]
        },
        {
            id: 6,
            icon: RefreshCcw,
            h: "CHANGES",
            p: [
                "We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons."
            ]
        },
        {
            id: 7,
            icon: Database,
            h: "AGREEMENT TO RECEIVE COMMUNICATION",
            p: [
                "By accepting these Terms of Service, you consent to receive communications from us through various channels, including in-app messages, SMS, RCS, emails, promotional and marketing calls, and newsletters."
            ]
        },
        {
            id: 8,
            icon: Mail,
            h: "CONTACT US",
            p: [
                "For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e‑mail at sorvrajewellery@gmail.com or by mail at: 23, Pulla Beside Platinum Square, RK Circle, Udaipur-313001"
            ]
        }
    ]

    return (
        <div className="pt-32 pb-24 bg-[#fffcf7] min-h-screen selection:bg-primary/10">
            <main className="max-w-[1200px] mx-auto px-6 md:px-12">
                <header className="mb-20 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-headline text-5xl md:text-6xl text-[#111110] font-light tracking-tight mb-4"
                    >
                        Privacy Manifesto
                    </motion.h1>
                    <div className="max-w-3xl mx-auto">
                        <p className="font-body text-md text-[#656464] opacity-80 italic font-light leading-relaxed">
                            This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from SOVRA (the “Site”).
                        </p>
                    </div>
                </header>

                <div className="bg-white p-10 md:p-16 shadow-sm border border-[#111110]/5 relative overflow-hidden">
                    <div className="space-y-16 relative z-10">
                        <div className="space-y-4">
                            <h2 className="font-headline text-3xl md:text-4xl text-[#111110] font-light tracking-tight flex items-center gap-4">
                                <Shield className="text-primary" size={32} />
                                Privacy Policy
                            </h2>
                            <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-primary font-black opacity-60">Data Sovereignty Protocol</p>
                        </div>

                        <div className="grid grid-cols-1 gap-14">
                            {sections.map((section) => (
                                <div key={section.id} className="space-y-6">
                                    <div className="flex items-center gap-3">
                                        <section.icon className="text-primary/40" size={18} />
                                        <h3 className="font-headline text-lg tracking-wider text-[#111110] uppercase opacity-90">{section.h}</h3>
                                    </div>
                                    <div className="space-y-4 border-l-2 border-primary/5 pl-8">
                                        {section.p.map((para, idx) => (
                                            <p key={idx} className="font-body text-md text-[#656464] leading-relaxed max-w-4xl opacity-90">
                                                {para}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="absolute top-0 right-0 p-12 opacity-[0.02] select-none pointer-events-none">
                        <Shield size={400} />
                    </div>
                </div>

                <footer className="mt-20 pt-12 border-t border-[#111110]/5 text-center">
                    <p className="font-body text-sm text-[#656464] italic">Last updated: April 2026</p>
                    <div className="mt-12 flex flex-col items-center gap-4">
                        <p className="font-body text-lg text-[#111110]/80">Need to exercise your data rights?</p>
                        <a href="mailto:sorvrajewellery@gmail.com" className="font-sans text-sm uppercase tracking-[0.3em] font-black text-primary hover:opacity-70 transition-opacity">
                            sorvrajewellery@gmail.com
                        </a>
                    </div>
                </footer>
            </main>
        </div>
    )
}

export default PrivacyPolicy
