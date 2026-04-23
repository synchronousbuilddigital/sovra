import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useShop } from '../context/ShopContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { refreshProfile } = useShop();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            navigate('/account');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            const { data } = await api.post('/users/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            await refreshProfile();
            toast.success('Login successful');
            navigate('/account');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid email or password');
            console.error('Login failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-center bg-[#fdfaf5]">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-md bg-white p-12 shadow- lux shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-primary/5 rounded-sm"
            >
                <div className="text-center mb-12">
                    <h1 className="font-headline text-5xl md:text-6xl mb-4 italic tracking-tight font-light">Sign In</h1>
                    <p className="font-label text-secondary tracking-[0.3em] uppercase text-[9px] font-black opacity-50">Welcome back to Sovra SOVRA</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2 group">
                        <label className="font-label text-[10px] uppercase tracking-widest font-black text-primary/60 group-focus-within:text-primary transition-colors">Email Address</label>
                        <input 
                            type="email" 
                            required
                            placeholder="aurelia@sovra.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent border-b border-primary/10 py-3 font-body text-base outline-none focus:border-primary transition-all placeholder:opacity-20 italic italic"
                        />
                    </div>

                    <div className="space-y-2 group">
                        <div className="flex justify-between items-baseline">
                            <label className="font-label text-[10px] uppercase tracking-widest font-black text-primary/60 group-focus-within:text-primary transition-colors">Password</label>
                            <Link to="/forgot-password" size="sm" className="font-label text-[9px] uppercase tracking-widest text-primary/40 hover:text-primary underline underline-offset-[4px] decoration-primary/5 transition-all">Forgot Piece?</Link>
                        </div>
                        <input 
                            type="password" 
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-transparent border-b border-primary/10 py-3 font-body text-base outline-none focus:border-primary transition-all placeholder:opacity-20"
                        />
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        className="w-full bg-primary text-on-primary py-5 font-label uppercase tracking-[0.3em] text-[10px] font-black transition-all duration-700 hover:bg-primary-dim shadow-lux mt-10 disabled:opacity-50"
                    >
                        {loading ? 'Signing In...' : 'Enter SOVRA'}
                    </motion.button>
                </form>

                <div className="mt-12 pt-8 border-t border-primary/5 text-center">
                    <p className="font-body text-[11px] text-on-surface/40 uppercase tracking-widest font-bold">
                        New to SOVRA? 
                        <Link to="/signup" className="text-primary hover:underline ml-2">Request Access</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
