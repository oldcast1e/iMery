import { X, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api/client';

const NotificationPanel = ({ isOpen, onClose, notifications, user }) => {
    const [localNotifications, setLocalNotifications] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);

    useEffect(() => {
        setLocalNotifications(notifications || []);
    }, [notifications]);

    // Fetch Friend Requests
    useEffect(() => {
        if (isOpen && user) {
            const fetchRequests = async () => {
                try {
                    const friends = await api.getFriends(user.user_id);
                    // Filter: Status PENDING and I am NOT the requester (so I am the addressee)
                    const requests = friends.filter(f =>
                        f.status === 'PENDING' && Number(f.requester_id) !== Number(user.user_id)
                    );
                    setFriendRequests(requests);
                } catch (e) {
                    console.error("Failed to fetch friend requests", e);
                }
            };
            fetchRequests();
        }
    }, [isOpen, user]);

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

    const handleAccept = async (friendshipId, nickname) => {
        try {
            await api.acceptFriend(friendshipId);
            alert(`${nickname}님과 친구가 되었습니다!`);
            setFriendRequests(prev => prev.filter(r => r.friendship_id !== friendshipId));
        } catch (e) {
            alert('수락 실패');
        }
    };

    const handleDecline = async (friendshipId) => {
        if (!confirm('친구 요청을 거절하시겠습니까?')) return;
        try {
            await api.deleteFriend(friendshipId);
            setFriendRequests(prev => prev.filter(r => r.friendship_id !== friendshipId));
        } catch (e) {
            alert('거절 실패');
        }
    };

    const displayNotifications = localNotifications;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            {/* Sliding Panel */}
            <div
                className={`fixed top-4 right-4 bottom-4 w-full max-w-sm bg-white/90 backdrop-blur-xl shadow-premium rounded-[2.5rem] z-[100] transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) border border-white/50 overflow-hidden flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-[120%]'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 bg-white/50 border-b border-gray-100 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-serif font-bold tracking-tight text-gray-900">알림</h2>
                        <p className="text-xs text-gray-500 font-medium mt-1">
                            {friendRequests.length > 0 ? `${friendRequests.length}개의 친구 요청` : displayNotifications.length > 0 ? `${displayNotifications.length}개의 새로운 소식` : '새로운 알림이 없습니다'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/80 hover:bg-white text-gray-400 hover:text-black rounded-full transition-all shadow-sm border border-gray-100 active:scale-90"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content Container */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">

                    {/* Friend Requests Section */}
                    {friendRequests.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">친구 요청</h3>
                            {friendRequests.map(req => (
                                <div key={req.friendship_id} className="p-4 bg-white border border-blue-100 rounded-3xl shadow-sm">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center font-bold">
                                            {req.nickname[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">{req.nickname}</p>
                                            <p className="text-xs text-gray-500">친구 요청을 보냈습니다.</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAccept(req.friendship_id, req.nickname)}
                                            className="flex-1 bg-black text-white py-2 rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors"
                                        >
                                            수락
                                        </button>
                                        <button
                                            onClick={() => handleDecline(req.friendship_id)}
                                            className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                                        >
                                            거절
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <div className="border-t border-gray-100 my-2"></div>
                        </div>
                    )}

                    {/* Notifications List */}
                    <div className="space-y-3">
                        {friendRequests.length > 0 && <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">활동 알림</h3>}
                        {displayNotifications.length === 0 && friendRequests.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                    <span className="text-2xl">💤</span>
                                </div>
                                <p className="text-xs font-medium">모든 알림을 확인했습니다</p>
                            </div>
                        )}

                        {displayNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className="group relative p-4 bg-white/60 hover:bg-white border boundary-gray-100 rounded-3xl transition-all hover:shadow-lg active:scale-[0.98] cursor-pointer"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div
                                        className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm text-lg ${notification.type === 'work'
                                            ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white'
                                            : notification.type === 'like'
                                                ? 'bg-gradient-to-br from-red-500 to-pink-500 text-white'
                                                : 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white'
                                            }`}
                                    >
                                        {notification.type === 'work' ? '🎨' : notification.type === 'like' ? '❤️' : '💬'}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-grow min-w-0 pt-0.5">
                                        <p className="text-sm text-gray-800 leading-snug line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-2 font-medium">
                                            {notification.time || notification.created_at?.split('T')[0]}
                                        </p>
                                    </div>

                                    {/* Delete Button - Shows on Hover */}
                                    <button
                                        onClick={(e) => handleDelete(notification.id, e)}
                                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 rounded-full"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default NotificationPanel;
