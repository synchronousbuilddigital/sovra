import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { toast } from 'react-toastify';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            navigate('/account');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            const { data } = await api.post('/users', { name, email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.info(data.message || 'OTP shared to your credentials');
            navigate('/verify-otp');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
            console.error('Registration failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-center bg-[#fdfaf5]">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-md bg-white p-12 shadow- lux shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-primary/5 rounded-sm"
            >
                <div className="text-center mb-12">
                    <h1 className="font-headline text-5xl md:text-6xl mb-4 italic tracking-tight font-light">Join the SOVRA</h1>
                    <p className="font-label text-secondary tracking-[0.3em] uppercase text-[9px] font-black opacity-50">Create your unique SOVRA profile</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-2 group">
                        <label className="font-label text-[10px] uppercase tracking-widest font-black text-primary/60 group-focus-within:text-primary transition-colors">Full Name</label>
                        <input 
                            type="text" 
                            required
                            placeholder="Aurelia Sovra"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-transparent border-b border-primary/10 py-3 font-body text-base outline-none focus:border-primary transition-all placeholder:opacity-20 italic italic"
                        />
                    </div>

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
                        <label className="font-label text-[10px] uppercase tracking-widest font-black text-primary/60 group-focus-within:text-primary transition-colors">Create Password</label>
                        <input 
                            type="password" 
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-transparent border-b border-primary/10 py-3 font-body text-base outline-none focus:border-primary transition-all placeholder:opacity-20"
                        />
                    </div>

                    <div className="space-y-2 group">
                        <label className="font-label text-[10px] uppercase tracking-widest font-black text-primary/60 group-focus-within:text-primary transition-colors">Confirm Password</label>
                        <input 
                            type="password" 
                            required
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-transparent border-b border-primary/10 py-3 font-body text-base outline-none focus:border-primary transition-all placeholder:opacity-20"
                        />
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        className="w-full bg-primary text-on-primary py-5 font-label uppercase tracking-[0.3em] text-[10px] font-black transition-all duration-700 hover:bg-primary-dim shadow-lux mt-10 disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : 'Continue to Profile'}
                    </motion.button>
                </form>

                <div className="mt-12 pt-8 border-t border-primary/5 text-center">
                    <p className="font-body text-[11px] text-on-surface/40 uppercase tracking-widest font-bold">
                        Already a member? 
                        <Link to="/login" className="text-primary hover:underline ml-2">Sign In</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
