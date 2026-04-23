import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    // Dynamic userInfo check
    const getUserInfo = () => localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

    useEffect(() => {
        const currentUser = getUserInfo();
        if (currentUser) {
            setUser(currentUser);
            fetchUserProfile();
        }
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users/profile');
            setCart(data.cart || []);
            setWishlist(data.wishlist || []);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            // Clear state on error (e.g., 401 Unauthorized)
            setCart([]);
            setWishlist([]);
        } finally {
            setLoading(false);
        }
    };

    // --- Wishlist Actions ---
    const addToWishlist = async (productId) => {
        const currentUser = getUserInfo();
        if (!currentUser) {
            toast.info('Please sign in to save items to your wishlist');
            return;
        }
        try {
            const { data } = await api.post('/users/wishlist', { productId });
            setWishlist(data);
            toast.success('Added to wishlist');
        } catch (error) {
            toast.error('Failed to add to wishlist');
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            const { data } = await api.delete(`/users/wishlist/${productId}`);
            setWishlist(data);
        } catch (error) {
            toast.error('Failed to remove from wishlist');
        }
    };

    // --- Cart Actions ---
    const addToCart = async (productId, qty = 1) => {
        const currentUser = getUserInfo();
        if (!currentUser) {
            toast.info('Please sign in to shop with us');
            return;
        }
        try {
            const { data } = await api.post('/users/cart', { productId, qty });
            setCart(data);
            toast.success('Added to bag');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to add to bag';
            toast.error(message);
        }
    };

    const removeFromCart = async (productId) => {
        try {
            const { data } = await api.delete(`/users/cart/${productId}`);
            setCart(data);
        } catch (error) {
            toast.error('Failed to remove from bag');
        }
    };

    const updateCartQty = async (productId, qty) => {
        try {
            const { data } = await api.put(`/users/cart/${productId}`, { qty });
            setCart(data);
        } catch (error) {
            toast.error('Failed to update quantity');
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        setCart([]);
        setWishlist([]);
        toast.info('Logged out successfully');
    };

    const refreshProfile = () => {

        const currentUser = getUserInfo();
        setUser(currentUser);
        if (currentUser) fetchUserProfile();
    };

    return (
        <ShopContext.Provider value={{
            cart,
            wishlist,
            loading,
            user,
            isAdmin: user?.isAdmin || false,
            addToWishlist,
            removeFromWishlist,
            addToCart,
            removeFromCart,
            updateCartQty,
            refreshProfile,
            logout
        }}>

            {children}
        </ShopContext.Provider>
    );
};
