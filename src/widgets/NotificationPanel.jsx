import { X, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/client';

const NotificationPanel = ({ isOpen, onClose, notifications, onUnreadCountChange }) => {
    const [localNotifications, setLocalNotifications] = useState([]);

    useEffect(() => {
        setLocalNotifications(notifications || []);
    }, [notifications]);
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Use props or default to empty
    // If we want to keep some sample ones, we can merge or just use props.
    // Let's assume passed props are the source of truth.
    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!confirm('이 알림을 삭제하시겠습니까?')) return;
        try {
            await api.deleteNotification(id);
            setLocalNotifications(prev => prev.filter(n => n.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    const displayNotifications = localNotifications;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={onClose}
            />

            {/* Sliding Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold">알림</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Close notifications"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto h-[calc(100%-73px)]">
                    {displayNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.type === 'work'
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-purple-100 text-purple-600'
                                        }`}
                                >
                                    {notification.type === 'work' ? '🎨' : '📢'}
                                </div>

                                {/* Content */}
                                <div className="flex-grow min-w-0">
                                    <h3 className="font-semibold text-sm text-black">
                                        {notification.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {notification.time}
                                    </p>
                                </div>
                            </div>

                            {/* Delete Button */}
                            <button
                                onClick={(e) => handleDelete(notification.id, e)}
                                className="text-gray-300 hover:text-red-500 p-1 transition-colors self-center"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default NotificationPanel;
