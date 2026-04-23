/**
 * Optimizes image URLs for Cloudinary and Unsplash by adding transformation parameters.
 * @param {string} url - The original image URL.
 * @param {number} width - The desired width (default 800).
 * @returns {string} - The optimized image URL.
 */
export const getOptimizedImage = (url, width = 800) => {
    if (!url) return '';

    // If it's a Cloudinary URL
    if (url.includes('res.cloudinary.com')) {
        // Insert optimization parameters
        // Example: .../upload/v1234/public_id.jpg -> .../upload/w_800,c_fill,g_auto,q_auto,f_auto/v1234/public_id.jpg
        return url.replace('/upload/', `/upload/w_${width},c_fill,g_auto,q_auto,f_auto/`);
    }

    // If it's an Unsplash URL
    if (url.includes('images.unsplash.com')) {
        // Replace existing w and q parameters
        try {
            const urlObj = new URL(url);
            urlObj.searchParams.set('w', width.toString());
            urlObj.searchParams.set('q', '80');
            urlObj.searchParams.set('auto', 'format');
            urlObj.searchParams.set('fit', 'crop');
            return urlObj.toString();
        } catch (e) {
            return url;
        }
    }

    // If it's a Google Photos URL (lh3.googleusercontent.com)
    if (url.includes('lh3.googleusercontent.com')) {
        // Google Photos supports =w<size> suffix
        // Remove existing size suffix if any and add new one
        return url.split('=')[0] + `=w${width}`;
    }

    return url;
};
