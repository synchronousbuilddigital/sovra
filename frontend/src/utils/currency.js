/**
 * Currency Formatting Utility for House Sovra
 * 
 * This utility handles the formatting of prices in INR (₹)
 * using the Indian numbering system.
 */

export const formatPrice = (amount) => {
    if (amount === undefined || amount === null) return '₹0';
    
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

