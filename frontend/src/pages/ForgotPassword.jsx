import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { toast } from 'react-toastify';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSendOTP = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const { data } = await api.post('/users/forgot-password', { email });
            toast.success(data.message);
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            const { data } = await api.post('/users/reset-password', { email, otp, password });
            toast.success(data.message);
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Reset failed');
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
                className="w-full max-w-md bg-white p-12 shadow-lux border border-primary/5 rounded-sm"
            >
                <div className="text-center mb-12">
                    <h1 className="font-headline text-5xl mb-4 italic tracking-tight font-light">Recover Access</h1>
                    <p className="font-label text-secondary tracking-[0.3em] uppercase text-[9px] font-black opacity-50">
                        {step === 1 ? 'Enter your registered email' : 'Verify identity & set new password'}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.form 
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleSendOTP} 
                            className="space-y-8"
                        >
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

                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                disabled={loading}
                                className="w-full bg-primary text-on-primary py-5 font-label uppercase tracking-[0.3em] text-[10px] font-black transition-all duration-700 hover:bg-primary-dim shadow-lux mt-10 disabled:opacity-50"
                            >
                                {loading ? 'Sending Request...' : 'Send Recovery Code'}
                            </motion.button>
                        </motion.form>
                    ) : (
                        <motion.form 
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleResetPassword} 
                            className="space-y-6"
                        >
                            <div className="space-y-2 group">
                                <label className="font-label text-[10px] uppercase tracking-widest font-black text-primary/60 group-focus-within:text-primary transition-colors">Verification Code (OTP)</label>
                                <input 
                                    type="text" 
                                    required
                                    maxLength="6"
                                    placeholder="******"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-transparent border-b border-primary/10 py-3 font-headline text-2xl tracking-[0.5em] outline-none focus:border-primary text-center italic"
                                />
                            </div>

                            <div className="space-y-2 group">
                                <label className="font-label text-[10px] uppercase tracking-widest font-black text-primary/60 group-focus-within:text-primary transition-colors">New Password</label>
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
                                <label className="font-label text-[10px] uppercase tracking-widest font-black text-primary/60 group-focus-within:text-primary transition-colors">Confirm New Password</label>
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
                                className="w-full bg-primary text-on-primary py-5 font-label uppercase tracking-[0.3em] text-[10px] font-black transition-all duration-700 hover:bg-primary-dim shadow-lux mt-6 disabled:opacity-50"
                            >
                                {loading ? 'Updating Vault...' : 'Reset Password'}
                            </motion.button>
                        </motion.form>
                    )}
                </AnimatePresence>

                <div className="mt-12 pt-8 border-t border-primary/5 text-center">
                    <Link to="/login" className="font-body text-[11px] text-on-surface/40 hover:text-primary uppercase tracking-widest font-bold">
                        Return to Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
