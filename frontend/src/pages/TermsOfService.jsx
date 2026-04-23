import React from 'react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'

const TermsOfService = () => {
    const sections = [
        {
            id: 1,
            h: "SECTION 1 - ONLINE WEBSITE/STORE TERMS",
            p: [
                "By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence, or that you are the age of majority in your state or province of residence and you have given us your consent to allow any of your minor dependents to use this site.",
                "You may not use our products for any illegal or unauthorized purpose nor may you, in the use of the Service, violate any laws in your jurisdiction (including but not limited to copyright laws).",
                "You must not transmit any worms or viruses or any code of a destructive nature.",
                "A breach or violation of any of the Terms will result in an immediate termination of your Services."
            ]
        },
        {
            id: 2,
            h: "SECTION 2 - GENERAL CONDITIONS",
            p: [
                "We reserve the right to refuse service to anyone for any reason at any time.",
                "You understand that your content (not including credit card information), may be transferred unencrypted and involve (a) transmissions over various networks; and (b) changes to conform and adapt to technical requirements of connecting networks or devices. Credit card information is always encrypted during transfer over networks.",
                "You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service, use of the Service, or access to the Service or any contact on the website through which the service is provided, without express written permission by us.",
                "The headings used in this agreement are included for convenience only and will not limit or otherwise affect these Terms."
            ]
        },
        {
            id: 3,
            h: "SECTION 3 - ACCURACY, COMPLETENESS AND TIMELINESS OF INFORMATION",
            p: [
                "We are not responsible if information made available on this site is not accurate, complete or current. The material on this site is provided for general information only and should not be relied upon or used as the sole basis for making decisions without consulting primary, more accurate, more complete or more timely sources of information.",
                "Any reliance on the material on this site is at your own risk.",
                "This site may contain certain historical information. Historical information, necessarily, is not current and is provided for your reference only. We reserve the right to modify the contents of this site at any time, but we have no obligation to update any information on our site. You agree that it is your responsibility to monitor changes to our site."
            ]
        },
        {
            id: 4,
            h: "SECTION 4 - MODIFICATIONS TO THE SERVICE AND PRICES",
            p: [
                "Prices for our products are subject to change without notice.",
                "We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.",
                "We shall not be liable to you or to any third-party for any modification, price change, suspension or discontinuance of the Service."
            ]
        },
        {
            id: 5,
            h: "SECTION 5 - PRODUCTS OR SERVICES (if applicable)",
            p: [
                "Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy.",
                "We have made every effort to display as accurately as possible the colors and images of our products that appear at the store. We cannot guarantee that your computer monitor's display of any color will be accurate.",
                "We reserve the right, but are not obligated, to limit the sales of our products or Services to any person, geographic region or jurisdiction. We may exercise this right on a case-by-case basis. We reserve the right to limit the quantities of any products or services that we offer. All descriptions of products or product pricing are subject to change at anytime without notice, at the sole discretion of us. We reserve the right to discontinue any product at any time.",
                "We do not warrant that the quality of any products, services, information, or other material purchased or obtained by you will meet your expectations, or that any errors in the Service will be corrected."
            ]
        },
        {
            id: 6,
            h: "SECTION 6 - ACCURACY OF BILLING AND ACCOUNT INFORMATION",
            p: [
                "We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order. These restrictions may include orders placed by or under the same customer account, the same credit card, and/or orders that use the same billing and/or shipping address. In the event that we make a change to or cancel an order, we may attempt to notify you by contacting the e‑mail and/or billing address/phone number provided at the time the order was made.",
                "You agree to provide current, complete and accurate purchase and account information for all purchases made at our store. You agree to promptly update your account and other information, including your email address and credit card numbers and expiration dates, so that we can complete your transactions and contact you as needed."
            ]
        },
        {
            id: 7,
            h: "SECTION 7 - OPTIONAL TOOLS",
            p: [
                "We may provide you with access to third-party tools over which we neither monitor nor have any control nor input.",
                "You acknowledge and agree that we provide access to such tools ”as is” and “as available” without any warranties, representations or conditions of any kind and without any endorsement. We shall have no liability whatsoever arising from or relating to your use of optional third-party tools.",
                "Any use by you of optional tools offered through the site is entirely at your own risk and discretion and you should ensure that you are familiar with and approve of the terms on which tools are provided by the relevant third-party provider(s)."
            ]
        },
        {
            id: 8,
            h: "SECTION 8 - THIRD-PARTY LINKS",
            p: [
                "Certain content, products and services available via our Service may include materials from third-parties.",
                "Third-party links on this site may direct you to third-party websites that are not affiliated with us. We are not responsible for examining or evaluating the content or accuracy and we do not warrant and will not have any liability or responsibility for any third-party materials or websites, or for any other materials, products, or services of third-parties.",
                "We are not liable for any harm or damages related to the purchase or use of goods, services, resources, content, or any other transactions made in connection with any third-party websites. Please review carefully the third-party's policies and practices."
            ]
        },
        {
            id: 9,
            h: "SECTION 9 - USER COMMENTS, FEEDBACK AND OTHER SUBMISSIONS",
            p: [
                "If, at our request, you send certain specific submissions (for example contest entries) or without a request from us you send creative ideas, suggestions, proposals, plans, or other materials, you agree that we may, at any time, without restriction, edit, copy, publish, distribute, translate and otherwise use in any medium any comments that you forward to us.",
                "We may, but have no obligation to, monitor, edit or remove content that we determine in our sole discretion are unlawful, offensive, threatening, libellous, defamatory, pornographic, obscene or otherwise objectionable or violates any party’s intellectual property.",
                "You agree that your comments will not violate any right of any third-party, including copyright, trademark, privacy, personality or other personal or proprietary right."
            ]
        },
        {
            id: 10,
            h: "SECTION 10 - PERSONAL INFORMATION",
            p: [
                "Your submission of personal information through the store is governed by our Privacy Policy."
            ]
        },
        {
            id: 11,
            h: "SECTION 11 - ERRORS, INACCURACIES AND OMISSIONS",
            p: [
                "Occasionally there may be information on our site or in the Service that contains typographical errors, inaccuracies or omissions that may relate to product descriptions, pricing, promotions, offers, product shipping charges, transit times and availability. We reserve the right to correct any errors, inaccuracies or omissions, and to change or update information or cancel orders if any information in the Service or on any related website is inaccurate at any time without prior notice."
            ]
        },
        {
            id: 12,
            h: "SECTION 12 - PROHIBITED USES",
            p: [
                "In addition to other prohibitions as set forth in the Terms of Service, you are prohibited from using the site or its content: (a) for any unlawful purpose; (b) to solicit others to perform or participate in any unlawful acts; (c) to violate any international, federal, provincial or state regulations, rules, laws, or local ordinances; (d) to infringe upon or violate our intellectual property rights; (e) to harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate based on gender, sexual orientation, religion, ethnicity, race, age, national origin, or disability; (f) to submit false or misleading information..."
            ]
        },
        {
            id: 13,
            h: "SECTION 13 - DISCLAIMER OF WARRANTIES; LIMITATION OF LIABILITY",
            p: [
                "We do not guarantee, represent or warrant that your use of our service will be uninterrupted, timely, secure or error-free.",
                "You expressly agree that your use of, or inability to use, the service is at your sole risk. The service and all products and services delivered to you through the service are (except as expressly stated by us) provided 'as is' and 'as available' for your use.",
                "In no case shall Sovra Jewelry, our directors, officers, employees, affiliates, agents, contractors, interns, suppliers, service providers or licensors be liable for any injury, loss, claim, or any direct, indirect, incidental, punitive, special, or consequential damages of any kind."
            ]
        },
        {
            id: 14,
            h: "SECTION 14 - INDEMNIFICATION",
            p: [
                "You agree to indemnify, defend and hold harmless Sovra Jewelry and our parent, subsidiaries, affiliates, partners, officers, directors, agents, contractors, licensors, service providers, subcontractors, suppliers, interns and employees, harmless from any claim or demand."
            ]
        },
        {
            id: 18,
            h: "SECTION 18 - GOVERNING LAW",
            p: [
                "These Terms of Service and any separate agreements whereby we provide you Services shall be governed by and construed in accordance with the laws of India."
            ]
        },
        {
            id: 20,
            h: "SECTION 20 - CONTACT INFORMATION",
            p: [
                "Questions about the Terms of Service should be sent to us at sorvrajewellery@gmail.com or by mail at: 23, Pulla Beside Platinum Square, RK Circle, Udaipur-313001"
            ]
        },
        {
            id: 21,
            h: "SECTION 21 – AGREEMENT TO RECEIVE COMMUNICATION",
            p: [
                "By accepting these Terms of Service, you consent to receive communications from us through various channels, including in-app messages, SMS (Short Message Service), RCS (Rich Communication Services), emails, promotional and marketing calls, and newsletters."
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
                        Maison Governance
                    </motion.h1>
                    <div className="max-w-3xl mx-auto space-y-6">
                        <p className="font-body text-md text-[#656464] opacity-80 italic font-light leading-relaxed">
                            This website is operated by Mirran Collections. Throughout the site, the terms “we”, “us” and “our” refer to SOVRA Jewellery. SOVRA Jewellery offers this website, including all information, tools and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies and notices stated here.
                        </p>
                        <p className="font-body text-sm text-[#656464] opacity-70 leading-relaxed italic">
                            By visiting our website and/ or purchasing something from us, you engage in our “Service” and agree to be bound by the following terms and conditions (“Terms of Service”, “Terms”), including those additional terms and conditions and policies referenced herein and/or available by hyperlink.
                        </p>
                    </div>
                </header>

                <div className="bg-white p-10 md:p-16 shadow-sm border border-[#111110]/5 relative overflow-hidden">
                    <div className="space-y-16 relative z-10">
                        <div className="space-y-4">
                            <h2 className="font-headline text-3xl md:text-4xl text-[#111110] font-light tracking-tight flex items-center gap-4">
                                <FileText className="text-primary" size={32} />
                                Terms of Service
                            </h2>
                            <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-primary font-black opacity-60">Complete Legal Agreement</p>
                        </div>

                        <div className="grid grid-cols-1 gap-12">
                            {sections.map((section) => (
                                <div key={section.id} className="space-y-4 border-b border-[#111110]/5 pb-12 last:border-0">
                                    <h3 className="font-headline text-lg tracking-wider text-[#111110] uppercase opacity-90">{section.h}</h3>
                                    <div className="space-y-4">
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
                        <FileText size={400} />
                    </div>
                </div>

                <footer className="mt-20 pt-12 border-t border-[#111110]/5 text-center">
                    <p className="font-body text-sm text-[#656464] italic">Last updated: April 2026</p>
                    <div className="mt-12 flex flex-col items-center gap-4">
                        <p className="font-body text-lg text-[#111110]/80">Questions regarding these protocols?</p>
                        <a href="mailto:sorvrajewellery@gmail.com" className="font-sans text-sm uppercase tracking-[0.3em] font-black text-primary hover:opacity-70 transition-opacity">
                            sorvrajewellery@gmail.com
                        </a>
                    </div>
                </footer>
            </main>
        </div>
    )
}

export default TermsOfService
