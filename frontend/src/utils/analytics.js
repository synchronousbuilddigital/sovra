/**
 * SOVRA — GA4 Deep Analytics Utility
 * Centralised event tracking for all key user interactions.
 * All events follow the GA4 e-commerce event schema.
 */

const GA_ID = import.meta.env.VITE_GA_ID || 'G-W76YXXTNS3';

/** Safe gtag wrapper — no-ops silently if gtag hasn't loaded yet */
const gtag = (...args) => {
  if (typeof window.gtag === 'function') {
    window.gtag(...args);
  }
  
  // Push to dataLayer for GTM Custom Event Triggers with both standard ecommerce & flat properties
  if (args[0] === 'event') {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: args[1], // e.g., 'add_to_cart', 'purchase', etc.
      ecommerce: args[2] || {},
      ...args[2]      // metadata/items
    });
  }
};

// ─── SPA Page View ───────────────────────────────────────────────────────────
export const trackPageView = (path, title) => {
  const currentTitle = title || document.title;
  if (typeof window.gtag === 'function') {
    window.gtag('config', GA_ID, {
      page_path: path,
      page_title: currentTitle,
    });
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'page_view',
    page_path: path,
    page_title: currentTitle,
    page_location: window.location.href,
  });
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

// ─── Remove from Cart ─────────────────────────────────────────────────────────
/**
 * @param {{ _id, name, price, category }} product
 * @param {number} quantity
 */
export const trackRemoveFromCart = (product, quantity = 1) => {
  if (!product) return;
  gtag('event', 'remove_from_cart', {
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

// ─── View Item List (Catalog / Collections) ──────────────────────────────────
/**
 * @param {Array} products
 * @param {string} listName
 */
export const trackViewItemList = (products = [], listName = 'Product Catalog') => {
  if (!Array.isArray(products) || products.length === 0) return;
  gtag('event', 'view_item_list', {
    item_list_name: listName,
    items: products.slice(0, 20).map((product, index) => ({
      item_id: product._id,
      item_name: product.name,
      item_category: product.category || 'Jewellery',
      price: product.price || 0,
      index: index + 1,
    })),
  });
};

// ─── Select Item (Clicked from grid) ─────────────────────────────────────────
/**
 * @param {{ _id, name, price, category }} product
 * @param {string} listName
 * @param {number} index
 */
export const trackSelectItem = (product, listName = 'Product Catalog', index = 1) => {
  if (!product) return;
  gtag('event', 'select_item', {
    item_list_name: listName,
    items: [
      {
        item_id: product._id,
        item_name: product.name,
        item_category: product.category || 'Jewellery',
        price: product.price || 0,
        index,
      },
    ],
  });
};

// ─── Auth Events ──────────────────────────────────────────────────────────────
/**
 * @param {'google' | 'email'} method
 */
export const trackLogin = (method = 'email') => {
  gtag('event', 'login', { method });
};

/**
 * @param {'google' | 'email'} method
 */
export const trackSignUp = (method = 'email') => {
  gtag('event', 'sign_up', { method });
};

