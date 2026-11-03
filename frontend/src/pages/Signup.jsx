import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { toast } from 'react-toastify';
import GoogleAuthButton from '../components/GoogleAuthButton';
import { trackSignUp } from '../utils/analytics';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [consentAuthorized, setConsentAuthorized] = useState(false);
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
        if (!consentAuthorized) {
            toast.error('Please authorize communications to create an account.');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            setLoading(true);
            const { data } = await api.post('/users', { name, email, password });
            localStorage.setItem('userInfo', JSON.stringify(data));
            trackSignUp('email');
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
                className="w-full max-w-md bg-white p-10 sm:p-12 shadow-lux shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)] border border-primary/5 rounded-2xl"
            >
                <div className="text-center mb-10">
                    <h1 className="font-headline text-5xl md:text-6xl mb-3 italic tracking-tight font-light">Join SOVRA</h1>
                    <p className="font-label text-secondary tracking-[0.3em] uppercase text-[9px] font-black opacity-50">Create your unique SOVRA profile</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2 group">
                        <label className="font-label text-[10px] uppercase tracking-widest font-black text-primary/60 group-focus-within:text-primary transition-colors">Full Name</label>
                        <input
                            type="text"
                            required
                            placeholder="Aurelia Vance"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-transparent border-b border-primary/10 py-3 font-body text-base outline-none focus:border-primary transition-all placeholder:opacity-20 italic"
                        />
                    </div>

                    <div className="space-y-2 group">
                        <label className="font-label text-[10px] uppercase tracking-widest font-black text-primary/60 group-focus-within:text-primary transition-colors">Email Address</label>
                        <input
                            type="email"
                            required
                            placeholder="Enter Your Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent border-b border-primary/10 py-3 font-body text-base outline-none focus:border-primary transition-all placeholder:opacity-20 italic"
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
                        {loading ? 'Creating Account...' : 'Continue to Profile'}
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
                    <GoogleAuthButton text="signup_with" label="Sign up with Google" />
                    {!consentAuthorized && (
                        <div 
                            onClick={() => toast.error('Please check the authorization box above to proceed with Sign Up.')}
                            className="absolute inset-0 z-10 cursor-not-allowed"
                            title="Please check the authorization box above to sign up"
                        />
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-primary/5 text-center">
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