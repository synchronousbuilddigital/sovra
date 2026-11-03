import React, { useState, useEffect } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
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
                className="relative group flex items-center hover:scale-110 transition-all p-0.5"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 md:w-6 md:h-6 group-hover:text-primary transition-colors" />
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
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 top-full mt-4 w-80 md:w-96 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-lux z-50 overflow-hidden font-body backdrop-blur-xl"
                        >
                            <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-high/40">
                                <h4 className="font-headline text-sm tracking-wider uppercase font-semibold text-on-surface">Maison Updates</h4>
                                {unreadCount > 0 && (
                                    <span className="text-[10px] tracking-widest uppercase font-mono px-2 py-0.5 bg-primary/10 text-primary rounded-full font-bold">
                                        {unreadCount} Unread
                                    </span>
                                )}
                            </div>

                            <div className="max-h-[360px] overflow-y-auto divide-y divide-outline-variant/10">
                                {notifications.length > 0 ? (
                                    notifications.map((n) => (
                                        <div
                                            key={n._id}
                                            onClick={() => markAsRead(n._id)}
                                            className={`p-4 transition-colors hover:bg-surface-container-low/40 cursor-pointer ${!n.isRead ? 'bg-primary/[0.03]' : ''}`}
                                        >
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <p className={`text-xs ${!n.isRead ? 'font-bold text-on-surface' : 'font-medium text-on-surface-variant'}`}>
                                                    {n.title}
                                                </p>
                                                <span className="text-[9px] font-mono opacity-50 shrink-0">
                                                    {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-on-surface-variant leading-relaxed line-clamp-2">
                                                {n.message}
                                            </p>
                                            {n.link && (
                                                <Link
                                                    to={n.link}
                                                    onClick={() => setIsOpen(false)}
                                                    className="inline-block mt-2 text-[10px] font-semibold text-primary hover:underline tracking-wider uppercase"
                                                >
                                                    View Details →
                                                </Link>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-on-surface-variant/60">
                                        <p className="text-xs italic font-serif">No new missives from the atelier.</p>
                                    </div>
                                )}
                            </div>
                        </m.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationTray;
