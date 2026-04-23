import React, { useEffect, useState } from 'react'
import { m, useSpring, useMotionValue } from 'framer-motion'

const CustomCursor = () => {
    const [isHovering, setIsHovering] = useState(false)
    const [isMouseDown, setIsMouseDown] = useState(false)

    // Motion values for smooth tracking
    const cursorX = useMotionValue(-100)
    const cursorY = useMotionValue(-100)

    const springConfig = { damping: 25, stiffness: 250 }
    const dotX = useSpring(cursorX, springConfig)
    const dotY = useSpring(cursorY, springConfig)
    
    const ringSpringConfig = { damping: 20, stiffness: 150 }
    const ringX = useSpring(cursorX, ringSpringConfig)
    const ringY = useSpring(cursorY, ringSpringConfig)

    useEffect(() => {
        const moveCursor = (e) => {
            cursorX.set(e.clientX)
            cursorY.set(e.clientY)
        }

        const handleMouseOver = (e) => {
            if (e.target.tagName === 'A' || 
                e.target.tagName === 'BUTTON' || 
                e.target.closest('button') || 
                e.target.closest('a') ||
                e.target.classList.contains('cursor-pointer')) {
                setIsHovering(true)
            } else {
                setIsHovering(false)
            }
        }

        const handleMouseDown = () => setIsMouseDown(true)
        const handleMouseUp = () => setIsMouseDown(false)

        window.addEventListener('mousemove', moveCursor)
        window.addEventListener('mouseover', handleMouseOver)
        window.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('mouseup', handleMouseUp)

        return () => {
            window.removeEventListener('mousemove', moveCursor)
            window.removeEventListener('mouseover', handleMouseOver)
            window.removeEventListener('mousedown', handleMouseDown)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [cursorX, cursorY])

    return (
        <div className="fixed inset-0 pointer-events-none z-[10000] hidden md:block">
            {/* Outer Ring */}
            <m.div
                className="absolute top-0 left-0 w-10 h-10 border border-[#6e5b44] rounded-full flex items-center justify-center translate-[-50%]"
                style={{
                    x: ringX,
                    y: ringY,
                    translateX: '-50%',
                    translateY: '-50%',
                    scale: isHovering ? 1.5 : 1,
                    backgroundColor: isHovering ? 'rgba(110, 91, 68, 0.05)' : 'transparent',
                    borderWidth: isMouseDown ? '2px' : '1px'
                }}
                transition={{
                    scale: { type: 'spring', stiffness: 300, damping: 20 },
                    backgroundColor: { duration: 0.2 }
                }}
            />

            {/* Core Dot */}
            <m.div
                className="absolute top-0 left-0 w-2.5 h-2.5 bg-[#6e5b44] rounded-full translate-[-50%]"
                style={{
                    x: dotX,
                    y: dotY,
                    translateX: '-50%',
                    translateY: '-50%',
                    scale: isHovering ? 0.5 : 1,
                    opacity: isMouseDown ? 0.5 : 1
                }}
            />
        </div>
    )
}

export default CustomCursor
