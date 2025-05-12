import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faCircle } from '@fortawesome/free-solid-svg-icons';
import './Notifications.css';

const Notifications = ({ userId }) => {
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNotifications = async () => {
        if (!userId) {
            console.log('No userId provided to Notifications component');
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            console.log('Fetching notifications for userId:', userId);
            const response = await axios.get(`http://192.168.221.249/social_api/api/notifications.php?user_id=${userId}`);
            console.log('Notifications response:', response.data);
            
            if (Array.isArray(response.data)) {
                setNotifications(response.data);
                const unread = response.data.filter(notif => notif.status === 'unread').length;
                setUnreadCount(unread);
            } else {
                console.error('Invalid notifications data format:', response.data);
                setError('Invalid data format received');
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('Notifications component mounted with userId:', userId);
        if (userId) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 30000);
            return () => clearInterval(interval);
        }
    }, [userId]);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'just now';
        if (diff < 3600000) return `${Math.floor(diff/60000)} minutes ago`;
        if (diff < 86400000) return `${Math.floor(diff/3600000)} hours ago`;
        return `${Math.floor(diff/86400000)} days ago`;
    };

    const markAsRead = async (notificationId) => {
        try {
            console.log('Marking notification as read:', notificationId);
            const response = await axios.post('http://localhost/social_api/api/mark_notification.php', {
                notification_id: notificationId,
                user_id: userId
            });
            console.log('Mark as read response:', response.data);
            
            if (response.data.success) {
                fetchNotifications();
            } else {
                setError('Failed to mark notification as read');
            }
        } catch (error) {
            console.error('Error marking notification as read:', error);
            setError(error.message);
        }
    };

    return (
        <div className="notifications-container">
            <div 
                className="notifications-icon" 
                onClick={() => {
                    console.log('Toggling notifications dropdown');
                    setShowNotifications(!showNotifications);
                }}
            >
                <FontAwesomeIcon icon={faBell} className="bell-icon" />
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount}
                    </span>
                )}
            </div>

            {showNotifications && (
                <div className="notifications-dropdown">
                    <div className="notifications-header">
                        <h3>Notifications</h3>
                        {notifications.length > 0 && (
                            <button 
                                onClick={() => markAsRead('all')} 
                                className="mark-all-read"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="notifications-list">
                        {loading ? (
                            <div className="notifications-loading">Loading...</div>
                        ) : error ? (
                            <div className="notifications-error">{error}</div>
                        ) : notifications.length > 0 ? (
                            notifications.map(notification => (
                                <div 
                                    key={notification.id} 
                                    className={`notification-item ${notification.status === 'unread' ? 'unread' : ''}`}
                                    onClick={() => markAsRead(notification.id)}
                                >
                                    {notification.status === 'unread' && (
                                        <FontAwesomeIcon icon={faCircle} className="unread-dot" />
                                    )}
                                    <div className="notification-content">
                                        <p>{notification.message}</p>
                                        <span className="notification-time">
                                            {formatTime(notification.created_at)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="no-notifications">
                                No notifications
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
