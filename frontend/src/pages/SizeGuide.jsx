import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ruler, Maximize, Circle, Info } from 'lucide-react'

const RingModule = () => {
    const [activeSize, setActiveSize] = useState(7)
    const sizes = [
        { id: 5, d: 15.7, label: '5' },
        { id: 6, d: 16.5, label: '6' },
        { id: 7, d: 17.3, label: '7' },
        { id: 8, d: 18.1, label: '8' },
        { id: 9, d: 19.0, label: '9' }
    ]

    const selected = sizes.find(s => s.id === activeSize)

    return (
        <div className="relative aspect-[3/4] flex flex-col bg-white shadow-lux border border-[#111110]/5 overflow-hidden group">
            <div className="flex-1 flex items-center justify-center p-12 bg-[#faf9f6]">
                <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center">
                    {/* Ring Visual */}
                    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
                        {/* Shadow Blur */}
                        <defs>
                            <radialGradient id="ringGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                                <stop offset="0%" stopColor="#111110" stopOpacity="0.05" />
                                <stop offset="100%" stopColor="#111110" stopOpacity="0" />
                            </radialGradient>
                        </defs>

                        <circle cx="50" cy="50" r="45" fill="url(#ringGradient)" />

                        {/* Outer Band */}
                        <motion.circle
                            cx="50" cy="50"
                            animate={{ r: (selected.d / 15 * 30) + 2 }}
                            fill="none"
                            stroke="#111110"
                            strokeWidth="1.5"
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        />

                        {/* Inner Diameter Guide */}
                        <motion.circle
                            cx="50" cy="50"
                            animate={{ r: (selected.d / 15 * 30) }}
                            fill="white"
                            stroke="#7a7670"
                            strokeWidth="0.25"
                            strokeDasharray="1 1"
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                        />

                        {/* Diameter Indicator Line */}
                        <motion.g
                            initial={false}
                            animate={{ opacity: 1 }}
                        >
                            <motion.line
                                x1={50 - (selected.d / 15 * 30)} y1="50"
                                x2={50 + (selected.d / 15 * 30)} y2="50"
                                stroke="#111110"
                                strokeWidth="0.5"
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            />
                            <motion.circle
                                cx={50 - (selected.d / 15 * 30)} cy="50" r="0.8" fill="#111110"
                                animate={{ cx: 50 - (selected.d / 15 * 30) }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            />
                            <motion.circle
                                cx={50 + (selected.d / 15 * 30)} cy="50" r="0.8" fill="#111110"
                                animate={{ cx: 50 + (selected.d / 15 * 30) }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            />
                        </motion.g>
                    </svg>

                    {/* Stats Overlay */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSize}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="text-center mt-24"
                            >
                                <span className="font-premium text-4xl italic text-[#111110] block">{selected.d}mm</span>
                                <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-[#7a7670] font-black">Inner Diameter</span>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Selection UI */}
            <div className="p-8 border-t border-[#111110]/5 bg-white">
                <div className="flex justify-between items-center mb-6">
                    <span className="font-sans text-[10px] tracking-[0.2em] uppercase text-[#7a7670] font-black">Archive Scale Scan</span>
                    <span className="font-premium text-lg italic text-[#111110]">Size {selected.label}</span>
                </div>
                <div className="flex gap-2">
                    {sizes.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setActiveSize(s.id)}
                            className={`flex-1 py-3 text-[11px] font-sans border transition-all duration-500 ${activeSize === s.id
                                    ? 'bg-[#111110] text-[#f5f0e8] border-[#111110]'
                                    : 'bg-transparent text-[#111110] border-[#111110]/10 hover:border-[#111110]/40'
                                }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

const NecklaceModule = () => {
    const [activeLength, setActiveLength] = useState(45)

    // Mapping length to SVG path Y coordinate for the dip
    const lengths = [
        { val: 40, y: 42, label: '40cm', desc: 'Choker' },
        { val: 45, y: 52, label: '45cm', desc: 'Princess' },
        { val: 50, y: 65, label: '50cm', desc: 'Matinee' },
        { val: 60, y: 85, label: '60cm', desc: 'Opera' }
    ]

    const selected = lengths.find(l => l.val === activeLength)

    return (
        <div className="relative aspect-[3/4] flex flex-col bg-white shadow-lux border border-[#111110]/5 overflow-hidden group">
            <div className="flex-1 flex items-center justify-center bg-[#faf9f6] p-4 relative">
                {/* Silhouette SVG */}
                <svg viewBox="0 0 100 120" className="w-full h-full">
                    {/* Minimalist Torso Silhouette */}
                    <path
                        d="M20,120 L20,105 C20,95 25,85 35,80 L35,60 C35,45 40,40 50,40 C60,40 65,45 65,60 L65,80 C75,85 80,95 80,105 L80,120"
                        fill="none"
                        stroke="#111110"
                        strokeWidth="0.2"
                        strokeOpacity="0.2"
                    />
                    <path
                        d="M50,40 C35,40 30,25 30,10 L70,10 C70,25 65,40 50,40"
                        fill="none"
                        stroke="#111110"
                        strokeWidth="0.2"
                        strokeOpacity="0.2"
                    />

                    {/* All Length Reference Lines (Subtle) */}
                    {lengths.map(l => (
                        <path
                            key={`ref-${l.val}`}
                            d={`M35,60 Q50,${l.y} 65,60`}
                            fill="none"
                            stroke="#111110"
                            strokeWidth="0.1"
                            strokeDasharray="1 1"
                            strokeOpacity={activeLength === l.val ? 0 : 0.1}
                        />
                    ))}

                    {/* Active Chain Path */}
                    <motion.path
                        animate={{ d: `M35,60 Q50,${selected.y} 65,60` }}
                        fill="none"
                        stroke="#111110"
                        strokeWidth="1.2"
                        transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    />

                    {/* Pendant (Optional visual flare) */}
                    <motion.circle
                        animate={{ cy: selected.y }}
                        cx="50"
                        r="2.5"
                        fill="#111110"
                        transition={{ type: "spring", stiffness: 60, damping: 15 }}
                    />
                </svg>

                {/* Info Labels on the visual */}
                <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col gap-8 opacity-40">
                    {lengths.map(l => (
                        <div key={`label-${l.val}`} className={`text-[8px] font-sans tracking-widest font-black transition-all duration-500 ${activeLength === l.val ? 'opacity-100 text-primary' : 'opacity-20'}`}>
                            {l.val}CM
                        </div>
                    ))}
                </div>
            </div>

            {/* Selection UI */}
            <div className="p-8 border-t border-[#111110]/5 bg-white">
                <div className="grid grid-cols-2 gap-2">
                    {lengths.map(l => (
                        <button
                            key={l.val}
                            onClick={() => setActiveLength(l.val)}
                            className={`flex flex-col items-center justify-center p-4 border transition-all duration-500 ${activeLength === l.val
                                    ? 'bg-[#111110] text-[#f5f0e8] border-[#111110]'
                                    : 'bg-transparent text-[#111110] border-[#111110]/10 hover:border-[#111110]/40'
                                }`}
                        >
                            <span className="font-premium text-lg italic">{l.label}</span>
                            <span className="font-sans text-[8px] tracking-[0.2em] uppercase opacity-60">{l.desc}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

const SizeGuide = () => {
    return (
        <div className="pt-32 pb-24 bg-[#fffcf7] min-h-screen selection:bg-primary/10 text-selection-secondary">
            <main className="max-w-[1440px] mx-auto px-6 md:px-12">
                <header className="mb-24 text-center max-w-4xl mx-auto space-y-8">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-sans text-[10px] tracking-[0.5em] uppercase text-[#7a7670] block font-black"
                    >
                        Precision Fitting
                    </motion.span>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="font-premium text-7xl md:text-9xl text-[#111110] leading-[0.8] mb-12 italic font-light tracking-tighter"
                    >
                        Size <span className="not-italic font-normal">Manifesto</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="font-body text-xl text-[#656464] italic font-light max-w-2xl mx-auto leading-relaxed"
                    >
                        "A masterpiece is only complete when it fits the soul." Use our archival measurements to find your perfect alignment.
                    </motion.p>
                </header>

                <div className="space-y-48">
                    {/* Ring Sizing Section */}
                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
                        <div className="space-y-12">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                                    <Circle size={24} strokeWidth={1} />
                                </div>
                                <h2 className="font-premium text-5xl italic text-[#111110]">Ring Diameter</h2>
                            </div>

                            <div className="space-y-8 font-body text-lg text-[#656464] italic font-light leading-relaxed">
                                <p>To find your ring size, measure the inner diameter of a ring you already own. Alternatively, wrap a thin piece of paper around your finger and mark the overlap.</p>
                                <ul className="space-y-4 list-none">
                                    <li className="flex items-center gap-4 group">
                                        <div className="w-1.5 h-1.5 bg-primary/30 rounded-full group-hover:scale-150 transition-transform duration-500" />
                                        Measure in the evening when fingers are warmest.
                                    </li>
                                    <li className="flex items-center gap-4 group">
                                        <div className="w-1.5 h-1.5 bg-primary/30 rounded-full group-hover:scale-150 transition-transform duration-500" />
                                        Allow room for your knuckle.
                                    </li>
                                    <li className="flex items-center gap-4 group">
                                        <div className="w-1.5 h-1.5 bg-primary/30 rounded-full group-hover:scale-150 transition-transform duration-500" />
                                        If between sizes, always select the larger archive.
                                    </li>
                                </ul>
                            </div>

                            <div className="bg-white p-1 shadow-lux border border-[#111110]/5 overflow-x-auto">
                                <table className="w-full text-left font-sans text-[11px] uppercase tracking-widest font-black">
                                    <thead className="bg-[#111110] text-[#f5f0e8]">
                                        <tr>
                                            <th className="p-6">Archive Size</th>
                                            <th className="p-6">Diameter (mm)</th>
                                            <th className="p-6">Circumference (mm)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-black/5">
                                        {[
                                            { size: '5', d: '15.7', c: '49.3' },
                                            { size: '6', d: '16.5', c: '51.9' },
                                            { size: '7', d: '17.3', c: '54.4' },
                                            { size: '8', d: '18.1', c: '57.0' },
                                            { size: '9', d: '19.0', c: '59.5' }
                                        ].map(row => (
                                            <tr key={row.size} className="hover:bg-primary/5 transition-colors">
                                                <td className="p-6 italic">{row.size}</td>
                                                <td className="p-6 opacity-40">{row.d}</td>
                                                <td className="p-6 opacity-40">{row.c}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <RingModule />
                    </section>

                    {/* Necklace Sizing Section */}
                    <section className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start pt-24 border-t border-[#111110]/5">
                        <div className="lg:order-2 space-y-12">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center text-primary border border-primary/10">
                                    <Maximize size={24} strokeWidth={1} />
                                </div>
                                <h2 className="font-premium text-5xl italic text-[#111110]">Chain Lengths</h2>
                            </div>

                            <p className="font-body text-lg text-[#656464] italic font-light leading-relaxed">
                                Our necklaces are designed to drape across the neckline with celestial grace. Most pieces include an adjustable 5cm extension chain to customize your exhibition.
                            </p>

                            <div className="space-y-12">
                                {[
                                    { length: '40cm', pos: 'Choker style, sits at the base of the throat.' },
                                    { length: '45cm', pos: 'Classic length, falls just below the collarbone.' },
                                    { length: '50cm', pos: 'Matinee length, rests on the upper chest.' },
                                    { length: '60cm', pos: 'Opera length, hangs lower for layered compositions.' }
                                ].map(item => (
                                    <div key={item.length} className="flex gap-8 group">
                                        <div className="font-premium text-3xl italic text-[#111110]/20 group-hover:text-primary transition-colors duration-500">{item.length}</div>
                                        <div className="flex-1 border-b border-[#111110]/10 pb-6">
                                            <p className="font-body text-md italic text-[#656464] group-hover:text-[#111110] transition-colors">{item.pos}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:order-1">
                            <NecklaceModule />
                        </div>
                    </section>
                </div>

                {/* Call to Action */}
                <div className="mt-48 bg-[#111110] p-16 md:p-24 text-center space-y-12 flex flex-col items-center overflow-hidden relative">
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                        <div className="absolute top-10 left-10 w-64 h-64 border border-[#f5f0e8] rounded-full animate-pulse" />
                        <div className="absolute bottom-10 right-10 w-96 h-96 border border-[#f5f0e8] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                    </div>

                    <Ruler size={48} strokeWidth={0.5} className="text-[#f5f0e8]/20" />
                    <h2 className="font-premium text-5xl md:text-6xl italic text-[#f5f0e8] font-light max-w-2xl leading-tight">Still unsure about your celestial fit?</h2>
                    <p className="font-body text-lg text-[#f5f0e8]/50 italic font-light max-w-lg">
                        Request a physical sizing artifact or consult with our master artisans virtually.
                    </p>
                    <button className="relative z-10 border border-[#f5f0e8]/30 text-[#f5f0e8] px-16 py-6 text-[10px] tracking-[0.5em] uppercase font-sans hover:bg-[#f5f0e8] hover:text-[#111110] transition-all rounded-full font-black group">
                        <span className="relative z-10">Inquire Privately</span>
                        <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 rounded-full" />
                    </button>
                </div>
            </main>
        </div>
    )
}

export default SizeGuide

