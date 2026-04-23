import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useShop } from '../context/ShopContext';

const NotificationTray = () => {
    const { user } = useShop();
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        if (!user) return;
        try {
            const { data } = await api.get('/users/notifications');
            setNotifications(data || []);
            setUnreadCount((data || []).filter(n => !n.isRead).length);
        } catch (error) {
            // Silently handle 401s for guests or expired sessions
            if (error.response?.status !== 401) {
                console.error('Archival notification error:', error);
            }
        }
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 60000);
            return () => clearInterval(interval);
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user]);

    const markAsRead = async (id) => {
        try {
            await api.put(`/users/notifications/${id}/read`);
            setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Registry update failed.');
        }
    };

    return (
        <div className="relative flex items-center">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative group flex items-center hover:scale-110 transition-all"
            >
                <span className="material-symbols-outlined text-[24px] group-hover:text-primary transition-colors">
                    {unreadCount > 0 ? 'notifications_active' : 'notifications'}
                </span>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-lux border-2 border-[#fffcf7]" />
                )}
            </button>


            <AnimatePresence>
                {isOpen && (
                    <>
                        <m.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px]"
                        />
                        <m.div
                            initial={{ opacity: 0, scale: 0.95, y: 10, x: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10, x: -20 }}
                            className="absolute right-0 top-12 w-80 max-h-[400px] bg-[#fffcf7] border border-outline-variant/10 shadow-lux z-50 overflow-y-auto no-scrollbar"
                        >
                            <div className="p-6 border-b border-black/5 flex justify-between items-center bg-white/40">
                                <h3 className="font-label text-[10px] uppercase tracking-[0.3em] font-black italic">Archival Reports</h3>
                                {unreadCount > 0 && <span className="font-label text-[8px] uppercase font-black text-primary animate-pulse">{unreadCount} New</span>}
                            </div>

                            <div className="divide-y divide-black/5">
                                {notifications.length > 0 ? notifications.map(notif => (
                                    <div
                                        key={notif._id}
                                        className={`p-6 hover:bg-primary/[0.02] transition-colors cursor-pointer ${!notif.isRead ? 'border-l-2 border-primary' : ''}`}
                                        onClick={() => markAsRead(notif._id)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <p className={`font-headline text-md italic ${!notif.isRead ? 'text-primary' : 'opacity-60'}`}>{notif.title}</p>
                                            <span className="text-[8px] opacity-30 uppercase font-black">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="font-body text-[11px] opacity-60 leading-relaxed italic">{notif.message}</p>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center">
                                        <p className="font-body text-xs italic opacity-30">No archives currently reports.</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-primary/[0.03] text-center border-t border-black/5">
                                <Link to="/account" onClick={() => setIsOpen(false)} className="font-label text-[8px] uppercase tracking-widest font-black text-primary/60 hover:text-primary transition-all">View All Activity</Link>
                            </div>
                        </m.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationTray;
