import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { format } from 'date-fns';

interface NotificationBellProps {
    username?: string;
}

interface Notification {
    id: number;
    message: string;
    is_read: boolean;
    created_at: string;
    purchase_request_id: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ username = 'Guest' }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        // Fetch existing notifications
        fetchNotifications();

        // Get token from localStorage
        const token = localStorage.getItem('token');

        if (!token) {
            console.error('No authentication token found');
            return;
        }

        // Setup WebSocket connection with token
        const ws = new WebSocket(`ws://192.168.222.43:8080/ws/notifications/?token=${token}`);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('WebSocket Connected');
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        const handleMessage = (event: MessageEvent) => {
            const data = JSON.parse(event.data) as Notification;
            setNotifications(prev => [data, ...prev]);
            setUnreadCount(prev => prev + 1);
        };

        ws.onmessage = handleMessage;

        return () => {
            if (wsRef.current) {
                if ("close" in wsRef.current) {
                    wsRef.current.close();
                }
            }
        };
    }, []);

    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                console.error('No authentication token found');
                return;
            }

            const response = await fetch('http://192.168.222.43:8080/api/notifications/', {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json() as Notification[];
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            const token = localStorage.getItem('token');

            if (!token) {
                console.error('No authentication token found');
                return;
            }

            const response = await fetch(`http://192.168.222.43:8080/api/notifications/${id}/mark-read/`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => prev - 1);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    return (
        <div className="h-16 bg-blue-600 text-white px-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold"></h1>
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div
                        className="cursor-pointer relative"
                        onClick={() => setShowDropdown(!showDropdown)}
                    >
                        <Bell className="w-5 h-5"/>
                        {unreadCount > 0 && (
                            <div className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                                {unreadCount}
                            </div>
                        )}
                    </div>

                    {showDropdown && (
                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg text-gray-800 z-50 max-h-96 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                                            !notification.is_read ? 'bg-blue-50' : ''
                                        }`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <p className="text-sm">{notification.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {format(new Date(notification.created_at), 'MMM d, yyyy h:mm a')}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="p-4 text-center text-gray-500">
                                    No notifications
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"/>
                    <div>
                        <div className="text-sm font-medium">{username}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationBell;