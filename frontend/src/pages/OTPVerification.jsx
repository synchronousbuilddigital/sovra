import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { useShop } from '../context/ShopContext';

const OTPVerification = () => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const navigate = useNavigate();
    const { refreshProfile } = useShop();

    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
        } else if (userInfo.isVerified) {
            navigate('/account');
        }
    }, [userInfo, navigate]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value !== '') {
            element.nextSibling.focus();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        if (otpValue.length < 6) {
            toast.error('Please enter complete OTP');
            return;
        }

        try {
            setLoading(true);
            const { data } = await api.post('/users/verify-otp', { otp: otpValue });
            
            // Update local storage verification status
            const updatedUserInfo = { ...userInfo, isVerified: true };
            localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo));
            
            toast.success(data.message);
            await refreshProfile();
            navigate('/account');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setResending(true);
            const { data } = await api.post('/users/resend-otp');
            toast.success(data.message);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center justify-center bg-[#fdfaf5]">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-md bg-white p-12 shadow-lux border border-primary/5 rounded-sm"
            >
                <div className="text-center mb-12">
                    <h1 className="font-headline text-5xl md:text-6xl mb-4 italic tracking-tight font-light">Verify Access</h1>
                    <p className="font-label text-secondary tracking-[0.2em] uppercase text-[9px] font-black opacity-50 mb-2">We've shared a code to your email</p>
                    <p className="font-body text-[10px] text-primary/60 italic">(Check your backend terminal for the development OTP)</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="flex justify-between gap-2">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength="1"
                                value={data}
                                onChange={(e) => handleChange(e.target, index)}
                                onFocus={(e) => e.target.select()}
                                className="w-12 h-16 text-center text-2xl font-headline italic border-b-2 border-primary/10 focus:border-primary outline-none bg-transparent transition-all"
                            />
                        ))}
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        className="w-full bg-primary text-on-primary py-5 font-label uppercase tracking-[0.3em] text-[10px] font-black transition-all duration-700 hover:bg-primary-dim shadow-lux disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Validate Entry'}
                    </motion.button>
                </form>

                <div className="mt-12 pt-8 border-t border-primary/5 text-center">
                    <button 
                        onClick={handleResend}
                        disabled={resending}
                        className="font-body text-[11px] text-primary hover:underline uppercase tracking-widest font-bold disabled:opacity-30"
                    >
                        {resending ? 'Sharing new code...' : "Haven't received? Share again"}
                    </button>
                    <div className="mt-6">
                        <button 
                            onClick={() => navigate('/login')}
                            className="text-[9px] text-on-surface/40 uppercase tracking-widest hover:text-primary transition-colors"
                        >
                            Return to Sign In
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default OTPVerification;
