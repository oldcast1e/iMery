import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bookmark, Heart, MessageCircle, LogOut, Camera } from 'lucide-react';
import api from '../api/client';
import PostCard from '../entities/PostCard';
import EditProfileModal from '../features/EditProfileModal';
import SettingsModal from '../features/SettingsModal';

export default function MyView({ works, user, onLogout }) {
    const [activeTab, setActiveTab] = useState('bookmarks');
    const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
    const [profile, setProfile] = useState(null);

    // Modal State
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Tab Data
    const [bookmarks, setBookmarks] = useState([]);
    const [myLikes, setMyLikes] = useState([]);
    const [myComments, setMyComments] = useState([]);

    useEffect(() => {
        if (user) {
            loadProfile();
            loadStats();
            loadTabData(activeTab);
        }
    }, [user, activeTab]);

    const loadProfile = async () => {
        try {
            const data = await api.getUserProfile(user.user_id);
            setProfile(data);
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    };

    const loadStats = async () => {
        try {
            const s = await api.getUserStats(user.user_id);
            setStats(s);
        } catch (e) { console.error(e); }
    };

    const loadTabData = async (tab) => {
        try {
            if (tab === 'bookmarks') {
                const res = await api.getBookmarks(user.user_id);
                setBookmarks(res);
            } else if (tab === 'likes') {
                // We have getMyLikes but it returns IDs. We need full objects.
                // But for "Activity", usually we want to see the POSTS we liked.
                // We can filter `works` prop (which contains all posts) by liked IDs.
                const likedIds = await api.getMyLikes(user.user_id);
                const likedPosts = works.filter(w => likedIds.includes(w.id));
                setMyLikes(likedPosts);
            } else if (tab === 'comments') {
                const res = await api.getMyComments(user.user_id);
                setMyComments(res);
            }
        } catch (e) { console.error(e); }
    };

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Profile Header */}
            <div className="pt-20 pb-8 px-6 text-center bg-cream-50 rounded-b-3xl shadow-sm relative">

                {/* Settings Icon */}
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="absolute top-20 right-6 text-gray-400 hover:text-black transition-colors"
                >
                    <Settings size={22} />
                </button>

                <div className="relative w-24 h-24 mx-auto mb-4">
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-white shadow-md bg-gray-200">
                        <img
                            src={profile?.profile_image_url || user.profile_image_url || `https://ui-avatars.com/api/?name=${user.nickname}&background=000&color=fff`}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <button
                        onClick={() => setIsEditProfileOpen(true)}
                        className="absolute bottom-0 right-0 bg-black text-white p-1.5 rounded-full shadow-lg"
                    >
                        <Camera size={14} />
                    </button>
                </div>

                <h1 className="text-2xl font-serif font-bold text-primary-900 mb-1">{profile?.nickname || user.nickname}</h1>
                <p className="text-sm text-gray-500 mb-6 px-8">{profile?.bio || user.bio || "자기소개를 입력해주세요."}</p>

                <div className="flex justify-center gap-8 text-center divide-x divide-gray-200">
                    <div className="px-4">
                        <span className="block font-bold text-lg">{stats.posts}</span>
                        <span className="text-xs text-gray-400">Works</span>
                    </div>
                    <div className="px-4">
                        <span className="block font-bold text-lg">{stats.followers}</span>
                        <span className="text-xs text-gray-400">Followers</span>
                    </div>
                    <div className="px-4">
                        <span className="block font-bold text-lg">{stats.following}</span>
                        <span className="text-xs text-gray-400">Following</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 bg-white sticky top-16 z-20">
                <TabButton active={activeTab === 'bookmarks'} onClick={() => setActiveTab('bookmarks')} icon={<Bookmark size={20} />} />
                <TabButton active={activeTab === 'likes'} onClick={() => setActiveTab('likes')} icon={<Heart size={20} />} />
                <TabButton active={activeTab === 'comments'} onClick={() => setActiveTab('comments')} icon={<MessageCircle size={20} />} />
            </div>

            {/* Content */}
            <div className="p-4">
                {activeTab === 'bookmarks' && (
                    <ActivityList items={bookmarks} emptyMessage="북마크한 작품이 없습니다." type="bookmark" />
                )}
                {activeTab === 'likes' && (
                    <ActivityList items={myLikes} emptyMessage="좋아요한 작품이 없습니다." type="like" />
                )}
                {activeTab === 'comments' && (
                    <ActivityList items={myComments} emptyMessage="작성한 댓글이 없습니다." type="comment" />
                )}
            </div>

            {/* Settings / Logout */}
            <div className="px-6 py-8">
                <button
                    onClick={onLogout}
                    className="flex items-center gap-2 text-red-500 font-medium text-sm hover:bg-red-50 p-3 rounded-lg w-full transition-colors"
                >
                    <LogOut size={18} />
                    로그아웃
                </button>
            </div>

            {/* Modals */}
            <EditProfileModal
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
                user={user}
                currentBio={user.bio}
                onUpdateSuccess={() => {
                    loadProfile(); // Refresh profile without reload
                }}
            />

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                user={user}
                onLogout={onLogout}
            />

        </div>
    );
}

function TabButton({ active, onClick, icon }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 flex justify-center py-4 relative ${active ? 'text-black' : 'text-gray-300'}`}
        >
            {icon}
            {active && <motion.div layoutId="tab-indicator" className="absolute bottom-0 w-8 h-0.5 bg-black" />}
        </button>
    );
}

function ActivityList({ items, emptyMessage, type }) {
    if (items.length === 0) return <EmptyState message={emptyMessage} />;

    return (
        <div className="space-y-4">
            {items.map(item => (
                <div key={item.id || item.created_at} className="flex gap-4 p-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    {/* Image */}
                    <div className="w-20 h-20 shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                        <img
                            src={(item.image_url || item.thumbnail || item.post_image)?.startsWith('http') ? (item.image_url || item.thumbnail || item.post_image) : `http://localhost:3001${item.image_url || item.thumbnail || item.post_image}`}
                            alt={item.title || item.post_title}
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="font-bold text-black truncate">{item.title || item.post_title}</h3>
                        <p className="text-xs text-gray-500 mb-1">{item.artist || item.artist_name || 'Unknown Artist'}</p>

                        {/* Rating if available */}
                        {(item.rating !== undefined) && (
                            <div className="flex text-yellow-400 mb-1">
                                {[...Array(5)].map((_, i) => (
                                    <Heart key={i} size={10} className={i < item.rating ? "fill-yellow-400" : "text-gray-200 fill-gray-200"} />
                                    // Using Heart as placeholder star, or use Star icon if imported
                                ))}
                            </div>
                        )}

                        {/* Specifics for Comments */}
                        {type === 'comment' && (
                            <p className="text-sm text-gray-800 line-clamp-1">"{item.content}"</p>
                        )}

                        {/* Description for Bookmarks/Likes if needed */}
                        {(type === 'bookmark' || type === 'like') && (item.review || item.description) && (
                            <p className="text-[11px] text-gray-600 line-clamp-1 italic mt-0.5">
                                "{item.review || item.description}"
                            </p>
                        )}

                        {/* Stats / Date */}
                        <div className="text-[10px] text-gray-400 mt-auto flex gap-2">
                            <span>{type === 'bookmark' ? `Bookmarked: ${item.bookmarked_at?.split('T')[0]}` :
                                type === 'like' ? `Liked: ${item.created_at?.split('T')[0] || 'Recently'}` :
                                    item.created_at?.split('T')[0]}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div className="py-20 text-center text-gray-400 text-sm">
            {message}
        </div>
    );
}
