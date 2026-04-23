import React from 'react'

const Skeleton = ({ className, width, height, circle }) => {
    return (
        <div 
            className={`skeleton ${className}`}
            style={{ 
                width: width || '100%', 
                height: height || '20px',
                borderRadius: circle ? '50%' : '8px'
            }}
        />
    )
}

export default Skeleton
