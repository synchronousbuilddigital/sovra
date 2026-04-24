/**
 * SOVRA — GA4 Deep Analytics Utility
 * Centralised event tracking for all key user interactions.
 * All events follow the GA4 e-commerce event schema.
 */

const GA_ID = 'G-SJPL5MB07G';

/** Safe gtag wrapper — no-ops silently if gtag hasn't loaded yet */
const gtag = (...args) => {
  if (typeof window.gtag === 'function') {
    window.gtag(...args);
  }
};

// ─── Add to Cart ────────────────────────────────────────────────────────────
/**
 * @param {{ _id, name, price, category, quantity }} product
 */
export const trackAddToCart = (product, quantity = 1) => {
  gtag('event', 'add_to_cart', {
    currency: 'INR',
    value: (product.price || 0) * quantity,
    items: [
      {
        item_id: product._id,
        item_name: product.name,
        item_category: product.category || 'Jewellery',
        price: product.price || 0,
        quantity,
      },
    ],
  });
};

// ─── Wishlist ─────────────────────────────────────────────────────────────────
/**
 * @param {{ _id, name, price, category }} product
 * @param {'add' | 'remove'} action
 */
export const trackWishlist = (product, action = 'add') => {
  gtag('event', action === 'add' ? 'add_to_wishlist' : 'remove_from_wishlist', {
    currency: 'INR',
    value: product.price || 0,
    items: [
      {
        item_id: product._id,
        item_name: product.name,
        item_category: product.category || 'Jewellery',
        price: product.price || 0,
        quantity: 1,
      },
    ],
  });
};

// ─── Begin Checkout ──────────────────────────────────────────────────────────
/**
 * @param {Array} cartItems  — array of cart items from ShopContext
 * @param {number} total
 */
export const trackBeginCheckout = (cartItems, total) => {
  gtag('event', 'begin_checkout', {
    currency: 'INR',
    value: total,
    items: cartItems.map((item) => ({
      item_id: item.product?._id,
      item_name: item.product?.name,
      item_category: item.product?.category || 'Jewellery',
      price: item.product?.price || 0,
      quantity: item.qty || 1,
    })),
  });
};

// ─── Purchase / Place Order ──────────────────────────────────────────────────
/**
 * @param {string} orderId
 * @param {Array} cartItems
 * @param {number} total
 * @param {number} taxes
 */
export const trackPurchase = (orderId, cartItems, total, taxes) => {
  gtag('event', 'purchase', {
    transaction_id: orderId,
    currency: 'INR',
    value: total,
    tax: taxes,
    shipping: 0,
    items: cartItems.map((item) => ({
      item_id: item.product?._id,
      item_name: item.product?.name,
      item_category: item.product?.category || 'Jewellery',
      price: item.product?.price || 0,
      quantity: item.qty || 1,
    })),
  });
};

// ─── Product View ────────────────────────────────────────────────────────────
/**
 * @param {{ _id, name, price, category }} product
 */
export const trackViewItem = (product) => {
  gtag('event', 'view_item', {
    currency: 'INR',
    value: product.price || 0,
    items: [
      {
        item_id: product._id,
        item_name: product.name,
        item_category: product.category || 'Jewellery',
        price: product.price || 0,
        quantity: 1,
      },
    ],
  });
};
