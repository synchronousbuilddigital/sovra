import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useShop } from '../context/ShopContext';

const GoogleAuthButton = ({ text = 'continue_with', label = 'Continue with Google' }) => {
    const navigate = useNavigate();
    const { refreshProfile } = useShop();
    const googleButtonRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [scriptReady, setScriptReady] = useState(false);

    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '683695806409-mj8j9uik4lenauiuf4oc1mr8udfhqosq.apps.googleusercontent.com';

    useEffect(() => {
        let isMounted = true;
        let checkInterval = null;

        const initGoogle = () => {
            if (window.google?.accounts?.id && googleButtonRef.current) {
                try {
                    window.google.accounts.id.initialize({
                        client_id: clientId,
                        callback: handleGoogleSuccess,
                        auto_select: false,
                        cancel_on_tap_outside: true,
                    });

                    // Clear any previous render
                    googleButtonRef.current.innerHTML = '';

                    // Render official Google button
                    window.google.accounts.id.renderButton(googleButtonRef.current, {
                        type: 'standard',
                        theme: 'outline',
                        size: 'large',
                        text: text, // 'signin_with', 'signup_with', or 'continue_with'
                        shape: 'rectangular',
                        logo_alignment: 'left',
                        width: googleButtonRef.current.offsetWidth || 380,
                    });

                    if (isMounted) setScriptReady(true);
                    return true;
                } catch (err) {
                    console.error('Google Sign-In initialization failed:', err);
                }
            }
            return false;
        };

        // Try immediate init or poll until script is loaded
        if (!initGoogle()) {
            checkInterval = setInterval(() => {
                if (initGoogle()) {
                    clearInterval(checkInterval);
                }
            }, 200);
        }

        return () => {
            isMounted = false;
            if (checkInterval) clearInterval(checkInterval);
        };
    }, [clientId, text]);

    const handleGoogleSuccess = async (response) => {
        if (!response?.credential) {
            toast.error('Google authentication was cancelled.');
            return;
        }

        try {
            setLoading(true);
            const { data } = await api.post('/users/google-login', {
                credential: response.credential,
            });

            localStorage.setItem('userInfo', JSON.stringify(data));
            if (refreshProfile) {
                await refreshProfile();
            }

            toast.success(data.isAdmin ? `Welcome to Admin Panel, ${data.name ? data.name.split(' ')[0] : ''}!` : `Welcome to SOVRA, ${data.name ? data.name.split(' ')[0] : 'Patron'}!`);
            if (data.isAdmin) {
                navigate('/admin');
            } else {
                navigate('/account');
            }
        } catch (error) {
            console.error('Google Sign-in failed:', error);
            const errorMsg = error.response?.data?.message || 'Google sign-in failed. Please try again.';
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleFallbackClick = () => {
        if (window.google?.accounts?.id) {
            window.google.accounts.id.prompt();
        } else {
            toast.info('Connecting to Google Identity Services...');
        }
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* Native GIS Render Container */}
            <div 
                ref={googleButtonRef} 
                className={`w-full flex justify-center min-h-[44px] overflow-hidden ${loading ? 'opacity-40 pointer-events-none' : ''}`}
            />

            {/* Fallback button if GIS script hasn't rendered button yet */}
            {!scriptReady && (
                <button
                    type="button"
                    onClick={handleFallbackClick}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-stone-200 rounded-md bg-white hover:bg-stone-50 transition-all duration-300 text-stone-700 font-sans text-xs font-semibold shadow-xs hover:border-stone-300"
                >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                        />
                    </svg>
                    <span>{loading ? 'Verifying with Google...' : label}</span>
                </button>
            )}

            {loading && (
                <p className="font-mono text-[10px] text-primary/70 tracking-wider mt-2 animate-pulse">
                    Authenticating with Google...
                </p>
            )}
        </div>
    );
};

export default GoogleAuthButton;
