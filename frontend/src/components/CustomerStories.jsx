import React from 'react'
import { Link } from 'react-router-dom'
import { Star, Check } from 'lucide-react'
import { getOptimizedImage } from '../utils/imageUtils'

const storiesData = [
    {
        id: 'story-1',
        customerName: 'Deepa Shree',
        verified: true,
        customerImage: '/reviews/review-ring.jpg',
        review: 'I customized it for Size 14, mainly I wear it on my middle finger. Loved it, classy, and the dual-wave curved prongs look so architectural. The solid gold luster is breathtaking!',
        productName: 'Nova Edge Ring',
        productId: '69d3b01f5ae9ac6e70b3f4a7',
        productImg: 'https://res.cloudinary.com/dylkhqjgm/image/upload/v1775542535/sovra_products/dkbpf8foxp9vunlnnelk.webp',
        rating: '4.8',
    },
    {
        id: 'story-2',
        customerName: 'Deepa Kumar',
        verified: true,
        customerImage: '/reviews/review-earring.jpg',
        review: 'This earring is so pretty! The geometric emerald green top combined with the hammered molten gold open hoop is pure art. Sits comfortably on the ear and got so many compliments!',
        productName: 'Abstract Emerald earring',
        productId: '69d3b01f5ae9ac6e70b3f4b3',
        productImg: 'https://res.cloudinary.com/dylkhqjgm/image/upload/v1775538698/sovra_products/lq7nbwrsjxg7yepnli2q.webp',
        rating: '5',
    },
    {
        id: 'story-3',
        customerName: 'Suwarna Kishor',
        verified: true,
        customerImage: '/reviews/review-necklace.jpg',
        review: 'The service was very nice and the packaging was top notch. The sleek gold snake chain with the heart slider and hanging pearl drop is so graceful on the neckline. Love it!',
        productName: 'Starlit Solitaire Necklace',
        productId: '69d3b01f5ae9ac6e70b3f493',
        productImg: 'https://res.cloudinary.com/dylkhqjgm/image/upload/v1775543961/sovra_products/f5ql3m0fnl6eygsvutal.webp',
        rating: '4.9',
    },
    {
        id: 'story-4',
        customerName: 'Surabhi Jain',
        verified: true,
        customerImage: '/reviews/review-bracelet.jpg',
        review: 'Beautiful cuff bracelet! The double band with the bezel crystal row and the chevron herringbone ribbed gold texture looks royal. Fits my wrist perfectly and locks with ease.',
        productName: 'Luna Glow Bracelet',
        productId: '69d3b01f5ae9ac6e70b3f49b',
        productImg: 'https://res.cloudinary.com/dylkhqjgm/image/upload/v1775542920/sovra_products/mmew7jvph5f0vl6rpylu.webp',
        rating: '5',
    },
    {
        id: 'story-5',
        customerName: 'Ananya Sen',
        verified: true,
        customerImage: '/reviews/review-flower-ring.jpg',
        review: 'The intricate floral openwork is pure perfection. The central pearl adds such a regal vintage charm, and it feels astonishingly lightweight on the finger. By far my favorite piece!',
        productName: 'Bloomy moon Ring',
        productId: '69d3b01f5ae9ac6e70b3f4a9',
        productImg: 'https://res.cloudinary.com/dylkhqjgm/image/upload/v1775541345/sovra_products/mtycl2kupgcd07glk7sc.webp',
        rating: '5',
    },
]

const CustomerStories = ({ shopProducts = [] }) => {
    // Strictly match the exact product by ID or exact Name
    const getProductInfo = (story) => {
        const liveMatch = shopProducts.find(
            p => (p._id && p._id === story.productId) ||
                 (p.name && p.name.trim().toLowerCase() === story.productName.trim().toLowerCase())
        )
        if (liveMatch) {
            return {
                id: liveMatch._id || liveMatch.id || story.productId,
                name: liveMatch.name || story.productName,
                img: getOptimizedImage(liveMatch.img || liveMatch.image || (liveMatch.images && liveMatch.images[0]), 200) || story.productImg,
            }
        }
        return {
            id: story.productId,
            name: story.productName,
            img: story.productImg,
        }
    }

    // Duplicate the 5 reviews array to form a continuous, seamless infinite loop
    const repeatedStories = [...storiesData, ...storiesData]

    return (
        <section className="pt-2 pb-8 md:py-16 bg-[#ffffff] overflow-hidden select-none">
            {/* Inline CSS animation for buttery smooth 60fps infinite marquee and pause on hover */}
            <style>{`
                @keyframes storiesMarqueeScroll {
                    0% {
                        transform: translate3d(0, 0, 0);
                    }
                    100% {
                        transform: translate3d(-50%, 0, 0);
                    }
                }
                .stories-marquee-track {
                    display: flex;
                    width: max-content;
                    animation: storiesMarqueeScroll 38s linear infinite;
                    will-change: transform;
                }
                .stories-marquee-container:hover .stories-marquee-track {
                    animation-play-state: paused !important;
                }
            `}</style>

            <div className="max-w-[1720px] mx-auto px-4 md:px-12 lg:px-16 mb-3.5 md:mb-12">
                {/* Section Header */}
                <div className="text-center">
                    <h2 className="font-sans text-[11px] sm:text-sm md:text-[15px] font-medium tracking-[0.22em] md:tracking-[0.28em] uppercase text-[#a88243]">
                        OUR CUSTOMER STORIES
                    </h2>
                </div>
            </div>

            {/* Infinite Marquee Wrapper with pause on cursor hover */}
            <div className="relative w-full overflow-hidden stories-marquee-container py-1 sm:py-2">
                {/* Continuous Moving Track: fits 2 reviews at one time on phone view */}
                <div className="stories-marquee-track flex gap-2.5 sm:gap-4 md:gap-6 px-2 sm:px-4">
                    {repeatedStories.map((story, index) => {
                        const product = getProductInfo(story)
                        return (
                            <div
                                key={`${story.id}-loop-${index}`}
                                className="group w-[calc((100vw-36px)/2)] max-w-[210px] sm:w-[280px] md:w-[340px] shrink-0 bg-white rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 border border-[#e8e6e1] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-[#ded9ce] transition-all duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    {/* Top: Customer Photo with Rounded Corners */}
                                    <div className="relative aspect-[4/3.5] rounded-lg md:rounded-xl overflow-hidden bg-[#f7f5f0] mb-2 sm:mb-3.5">
                                        <img
                                            src={story.customerImage}
                                            alt={`${story.customerName} wearing ${product.name}`}
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        />
                                    </div>

                                    {/* Customer Name + Verified Buyer Pill */}
                                    <div className="flex items-center gap-1 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                                        <span className="font-sans text-[10.5px] sm:text-[13px] md:text-[14px] font-semibold text-[#1a1a1a] truncate max-w-[90px] sm:max-w-none">
                                            {story.customerName}
                                        </span>
                                        {story.verified && (
                                            <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] text-[#15803d] font-medium shrink-0">
                                                <span className="inline-flex items-center justify-center w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#dcfce7] text-[#15803d]">
                                                    <Check size={7} className="sm:hidden" strokeWidth={3} />
                                                    <Check size={9} className="hidden sm:block" strokeWidth={3} />
                                                </span>
                                                <span>Verified<span className="hidden sm:inline"> Buyer</span></span>
                                            </span>
                                        )}
                                    </div>

                                    {/* Customer Review Text: line-clamped on small phone screens for uniform height */}
                                    <p className="font-sans text-[9px] sm:text-[11.5px] md:text-[12.5px] text-[#4b5563] leading-snug sm:leading-relaxed mb-2 sm:mb-4 line-clamp-3 sm:line-clamp-4 md:line-clamp-none">
                                        {story.review}
                                    </p>
                                </div>

                                {/* Bottom Product Strip / Chip from Our Website */}
                                <Link
                                    to={`/product/${product.id}`}
                                    className="border border-[#ededed] bg-[#fcfbf9] hover:bg-[#f5f2eb] rounded-md sm:rounded-lg p-1.5 sm:p-2.5 flex items-center gap-1.5 sm:gap-3 transition-colors duration-200 mt-auto group/item"
                                    title={`View ${product.name}`}
                                >
                                    {/* Small Product Thumbnail */}
                                    <div className="w-7 h-7 sm:w-11 sm:h-11 rounded bg-white border border-[#eaeaea] p-0.5 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                        <img
                                            src={product.img}
                                            alt={product.name}
                                            loading="lazy"
                                            className="w-full h-full object-cover rounded"
                                        />
                                    </div>

                                    {/* Product Name & Purple Star Rating */}
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-plex text-[9.5px] sm:text-[12px] font-medium text-[#1a1a1a] truncate group-hover/item:text-[#a88243] transition-colors">
                                            {product.name}
                                        </h4>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <Star size={9} className="sm:hidden fill-[#8b5cf6] text-[#8b5cf6]" />
                                            <Star size={11} className="hidden sm:block fill-[#8b5cf6] text-[#8b5cf6]" />
                                            <span className="text-[9.5px] sm:text-[11px] font-semibold text-[#8b5cf6]">
                                                {story.rating}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default CustomerStories
