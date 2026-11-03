import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useShop } from '../context/ShopContext';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { trackLogin } from '../utils/analytics';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [consentAuthorized, setConsentAuthorized] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { refreshProfile } = useShop();

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
        if (userInfo) {
            navigate(userInfo.isAdmin ? '/admin' : '/account');
        }
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!consentAuthorized) {
            toast.error('Please authorize communications to continue signing in.');
            return;
        }

        try {
            setLoading(true);
            const { data } = await api.post('/users/login', { email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            trackLogin('email');
            await refreshProfile();
            toast.success(data.isAdmin ? 'Welcome to Admin Dashboard' : 'Login successful');
            if (data.isAdmin) {
                navigate('/admin');
            } else {
                navigate('/account');
            }
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
                className="w-full max-w-md bg-white p-10 sm:p-12 shadow-lux shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-primary/5 rounded-2xl"
            >
                <div className="text-center mb-10">
                    <h1 className="font-headline text-5xl md:text-6xl mb-3 italic tracking-tight font-light">Sign In</h1>
                    <p className="font-label text-secondary tracking-[0.3em] uppercase text-[9px] font-black opacity-50">Welcome back to SOVRA</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2 group">
                        <label className="font-label text-[10px] uppercase tracking-widest font-black text-primary/60 group-focus-within:text-primary transition-colors">Email Address</label>
                        <input 
                            type="email" 
                            required
                            placeholder="aurelia@sovra.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent border-b border-primary/10 py-3 font-body text-base outline-none focus:border-primary transition-all placeholder:opacity-20 italic"
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

                    {/* Compulsory Communication Consent Checkbox */}
                    <div className="pt-2">
                        <label className="flex items-start gap-3 cursor-pointer select-none group p-3 bg-stone-50/70 border border-stone-200/60 rounded-xl hover:bg-stone-50 transition-colors">
                            <input 
                                type="checkbox" 
                                required
                                checked={consentAuthorized}
                                onChange={(e) => setConsentAuthorized(e.target.checked)}
                                className="mt-0.5 h-4 w-4 rounded border-stone-300 text-stone-900 accent-[#855e23] focus:ring-[#855e23]/20 cursor-pointer flex-shrink-0"
                            />
                            <span className="font-body text-[11px] text-stone-600 leading-relaxed group-hover:text-stone-900 transition-colors">
                                I authorize Sovra Jewellery and its affiliates to send me promotional, transactional and account related information via WhatsApp, SMS, Email and RCS on my registered number.
                            </span>
                        </label>
                    </div>

                    <motion.button 
                        whileHover={consentAuthorized && !loading ? { scale: 1.01 } : {}}
                        whileTap={consentAuthorized && !loading ? { scale: 0.99 } : {}}
                        disabled={loading || !consentAuthorized}
                        className="w-full bg-primary text-on-primary py-4 rounded-xl font-label uppercase tracking-[0.3em] text-[10px] font-black transition-all duration-300 hover:bg-primary-dim shadow-lux mt-4 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading ? 'Signing In...' : 'Enter SOVRA'}
                    </motion.button>
                </form>

                {/* Elegant Luxury Divider */}
                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-stone-200/80" />
                    </div>
                    <div className="relative flex justify-center text-[9px] uppercase tracking-[0.25em] font-mono">
                        <span className="bg-white px-4 text-stone-400">or continue with</span>
                    </div>
                </div>

                {/* Google Sign In Button with Consent Protection */}
                <div className="relative w-full">
                    <GoogleAuthButton text="signin_with" label="Sign in with Google" />
                    {!consentAuthorized && (
                        <div 
                            onClick={() => toast.error('Please check the authorization box above to proceed with Sign In.')}
                            className="absolute inset-0 z-10 cursor-not-allowed"
                            title="Please check the authorization box above to sign in"
                        />
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-primary/5 text-center">
                    <p className="font-body text-[11px] text-on-surface/40 uppercase tracking-widest font-bold">
                        New to SOVRA? 
                        <Link to="/signup" className="text-primary hover:underline ml-2">Create a new account</Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;