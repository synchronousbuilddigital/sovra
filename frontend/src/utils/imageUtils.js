/**
 * Optimizes image URLs for Cloudinary, Google UserContent, and Unsplash by adding transformation parameters.
 * Automatically requests WebP/AVIF and optimal responsive widths.
 * @param {string} url - The original image URL.
 * @param {number} width - The desired width (default 500).
 * @returns {string} - The optimized image URL.
 */
export const getOptimizedImage = (url, width = 500) => {
    if (!url) return '';

    // If it's a Cloudinary URL
    if (url.includes('res.cloudinary.com')) {
        // Insert optimization parameters: auto format (WebP/AVIF), auto quality, custom responsive width
        return url.replace('/upload/', `/upload/w_${width},c_fill,g_auto,q_auto,f_auto/`);
    }

    // If it's an Unsplash URL
    if (url.includes('images.unsplash.com')) {
        try {
            const urlObj = new URL(url);
            urlObj.searchParams.set('w', width.toString());
            urlObj.searchParams.set('q', '75');
            urlObj.searchParams.set('auto', 'format');
            urlObj.searchParams.set('fit', 'crop');
            return urlObj.toString();
        } catch (e) {
            return url;
        }
    }

    // If it's a Google Photos / UserContent URL (lh3.googleusercontent.com)
    if (url.includes('lh3.googleusercontent.com')) {
        // -rw requests modern WebP format from Google's image edge servers
        return url.split('=')[0] + `=w${width}-rw`;
    }

    return url;
};
