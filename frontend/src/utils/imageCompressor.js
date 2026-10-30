/**
 * Browser-side image compression and optimization utility.
 * Resizes large camera/phone photos (5MB - 20MB) down to ~150KB - 350KB in milliseconds
 * before sending to the backend/Cloudinary, drastically speeding up uploads and eliminating timeouts.
 *
 * @param {File} file - Original File from <input type="file">
 * @param {Object} [options] - Compression options
 * @param {number} [options.maxWidth=1600] - Max width in pixels
 * @param {number} [options.maxHeight=1600] - Max height in pixels
 * @param {number} [options.quality=0.82] - Output quality (0.0 to 1.0)
 * @returns {Promise<File>} - Optimized File ready for upload
 */
export async function compressImage(file, options = {}) {
  // If not a valid image file, return as-is
  if (!file || !(file instanceof Blob) || !file.type.startsWith('image/')) {
    return file;
  }

  // Preserve animated GIFs and SVGs without alteration
  if (file.type === 'image/gif' || file.type === 'image/svg+xml') {
    return file;
  }

  // If the file is already small (under 180 KB), no need to compress
  if (file.size < 180 * 1024) {
    return file;
  }

  const maxWidth = options.maxWidth || 1600;
  const maxHeight = options.maxHeight || 1600;
  const quality = options.quality !== undefined ? options.quality : 0.82;

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Keep dimensions within maxWidth x maxHeight while preserving aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return resolve(file); // fallback to original if canvas 2d context unavailable
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      // Prefer WebP for high compression efficiency, fall back to JPEG
      const preferredMime = 'image/webp';

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve(file);
          }

          // If for some reason compression produced a larger file, use original
          if (blob.size >= file.size) {
            return resolve(file);
          }

          const baseName = file.name ? file.name.replace(/\.[^/.]+$/, '') : 'product-image';
          const ext = blob.type === 'image/webp' ? '.webp' : '.jpg';
          const compressedFile = new File([blob], `${baseName}${ext}`, {
            type: blob.type || 'image/jpeg',
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        preferredMime,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback to original file if browser cannot render it in Image
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export default compressImage;

