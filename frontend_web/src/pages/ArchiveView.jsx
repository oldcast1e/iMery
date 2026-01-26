import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Calendar as CalendarIcon, Image as ImageIcon, UserMinus, Search, Music, Share2, Sparkles, Pause } from 'lucide-react';
import PostCard from '../entities/PostCard';
import api from '../api/client';

export default function ArchiveView({ works, user, onLikeToggle, bookmarkedIds, onBookmarkToggle, onDateClick }) {
    const [activeTab, setActiveTab] = useState('feed'); // feed, calendar, friends
    const audioRef = useRef(null);
    const [currentMusic, setCurrentMusic] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Auto-play music logic
    useEffect(() => {
        // Find latest work with music_url
        const workWithMusic = works.find(w => w.music_url && w.music_url.trim() !== "");
        if (workWithMusic) {
            setCurrentMusic(workWithMusic);
        }
    }, [works]);

    useEffect(() => {
        if (currentMusic && audioRef.current) {
            audioRef.current.volume = 0.5;
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    setIsPlaying(true);
                }).catch(error => {
                    console.log("Auto-play was prevented:", error);
                    setIsPlaying(false);
                });
            }

            // Loop approx 10s
            const loopInterval = setInterval(() => {
                if (audioRef.current.currentTime >= 10) {
                    audioRef.current.currentTime = 0;
                }
            }, 100);

            return () => clearInterval(loopInterval);
        }
    }, [currentMusic]);

    const handleMusicToggle = () => {
        if (!currentMusic?.music_url) {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="min-h-screen bg-cream-50 pb-20">
            {/* Background Music */}
            <audio ref={audioRef} src={currentMusic?.music_url} loop />

            {/* Toast for Music Generation */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: -20, x: "-50%" }}
                        className="fixed top-28 left-1/2 z-[100] bg-black/80 text-white px-8 py-4 rounded-full text-sm font-bold shadow-2xl backdrop-blur-md flex items-center gap-3 whitespace-nowrap border border-white/10"
                    >
                        <Sparkles size={18} className="text-yellow-400 animate-pulse" />
                        AI가 노래를 생성 중입니다!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Tabs & Actions */}
            <div className="sticky top-16 z-30 glass border-b border-white/20 p-2 flex justify-between items-center px-4">
                <div className="w-0 md:w-20" /> {/* Spacer for centering tabs, hidden on mobile */}

                <div className="bg-gray-100/50 p-1 rounded-full flex gap-1 transform scale-90 md:scale-100 transition-transform origin-center">
                    <TabButton
                        active={activeTab === 'feed'}
                        onClick={() => setActiveTab('feed')}
                        icon={<ImageIcon size={16} />}
                        label="피드"
                    />
                    <TabButton
                        active={activeTab === 'calendar'}
                        onClick={() => setActiveTab('calendar')}
                        icon={<CalendarIcon size={16} />}
                        label="달력"
                    />
                    <TabButton
                        active={activeTab === 'friends'}
                        onClick={() => setActiveTab('friends')}
                        icon={<Users size={16} />}
                        label="친구"
                    />
                </div>

                {/* Music & Share Actions */}
                <div className="flex items-center gap-2 w-auto md:w-20 justify-end">
                    <button
                        onClick={handleMusicToggle}
                        className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-300
                            ${isPlaying
                                ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white scale-110 shadow-lg ring-2 ring-purple-200'
                                : 'bg-white text-gray-400 hover:text-indigo-500 hover:bg-indigo-50'}`}
                    >
                        {isPlaying ? <Music size={16} className="animate-pulse" /> : <Music size={16} />}
                    </button>
                    <button className="w-9 h-9 rounded-full bg-white text-gray-400 flex items-center justify-center shadow-sm hover:text-black transition-colors hover:bg-gray-50 border border-transparent hover:border-gray-200">
                        <Share2 size={18} />
                    </button>
                </div>
            </div>

            <div className="p-4">
                <AnimatePresence mode="wait">
                    {activeTab === 'feed' && (
                        <FeedTab
                            key="feed"
                            works={works}
                            user={user}
                            onLikeToggle={onLikeToggle}
                            bookmarkedIds={bookmarkedIds}
                            onBookmarkToggle={onBookmarkToggle}
                        />
                    )}
                    {activeTab === 'calendar' && (
                        <CalendarTab key="calendar" works={works} user={user} onDateClick={onDateClick} />
                    )}
                    {activeTab === 'friends' && (
                        <FriendsTab key="friends" user={user} />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 md:px-6 py-2 rounded-full transition-all duration-400 whitespace-nowrap ${active
                ? 'bg-white text-black shadow-premium scale-100'
                : 'text-gray-400 hover:text-gray-600'
                }`}
        >
            {icon}
            <span className="text-sm font-semibold tracking-tight">{label}</span>
        </button>
    );
}

function FeedTab({ works, user, onLikeToggle, bookmarkedIds, onBookmarkToggle }) {
    const [acceptedFriendIds, setAcceptedFriendIds] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFriends = async () => {
            if (!user) return;
            try {
                const friendList = await api.getFriends(user.user_id);
                const accepted = friendList
                    .filter(f => f.status === 'ACCEPTED')
                    .map(f => Number(f.id));
                setAcceptedFriendIds(accepted);
            } catch (e) {
                console.error("Failed to fetch friends for feed:", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFriends();
    }, [user]);

    // Filter Works: Show works where user_id is in acceptedFriendIds
    const friendWorks = works.filter(w => acceptedFriendIds.includes(Number(w.user_id)));

    if (isLoading) {
        return <div className="p-10 text-center text-gray-400">Loading feed...</div>;
    }

    if (friendWorks.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-20 text-gray-400"
            >
                <p>친구들의 새 작품이 없습니다.</p>
                <p className="text-xs mt-2">친구를 추가해보세요!</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 max-w-sm mx-auto" // REDUCED SIZE as requested
        >
            {friendWorks.map(work => (
                <PostCard
                    key={work.id}
                    work={work}
                    onClick={() => { }}
                    onLikeToggle={() => onLikeToggle(work)}
                    bookmarkedIds={bookmarkedIds}
                    onBookmarkToggle={onBookmarkToggle}
                />
            ))}
        </motion.div>
    );
}

function CalendarTab({ works, user, onDateClick }) {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    // Filter to only show USER's own works (not friends)
    const myWorks = works.filter(w => Number(w.user_id) === Number(user.user_id));

    // Map works to days
    const worksByDay = {};
    myWorks.forEach(w => {
        // use work_date if available, else date
        const dateStr = w.work_date || w.date || "";
        // More robust parsing: extract first three number groups (y, m, d)
        const match = dateStr.match(/(\d{4})[.-](\d{1,2})[.-](\d{1,2})/);
        if (match) {
            const y = parseInt(match[1]);
            const m = parseInt(match[2]);
            const d = parseInt(match[3]);

            if (y === today.getFullYear() && m === today.getMonth() + 1) {
                if (!worksByDay[d]) worksByDay[d] = [];
                worksByDay[d].push(w);
            }
        }
    });

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 max-w-lg mx-auto"
        >
            <h2 className="text-2xl font-serif font-bold mb-6 text-center">
                {today.getFullYear()}.{String(today.getMonth() + 1).padStart(2, '0')}
            </h2>

            <div className="grid grid-cols-7 gap-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} className="text-center text-xs text-gray-400 font-medium py-2">
                        {d}
                    </div>
                ))}
                {days.map(day => {
                    const dayWorks = worksByDay[day] || [];
                    const count = dayWorks.length;

                    // Sort by time (earliest first) for the thumbnail
                    // In a real app, 'created_at' or a specific time field would be used.
                    // Here we assume dayWorks[0] is fine for now, or sort if we have timestamps.
                    const displayWork = dayWorks.length > 0 ? [...dayWorks].sort((a, b) => {
                        const timeA = new Date(a.created_at || 0).getTime();
                        const timeB = new Date(b.created_at || 0).getTime();
                        return timeA - timeB;
                    })[0] : null;

                    return (
                        <div
                            key={day}
                            onClick={() => count > 0 && onDateClick && onDateClick(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
                            className={`aspect-square relative rounded-xl overflow-hidden transition-all duration-300 border
                ${count > 0 ? 'cursor-pointer bg-white border-gray-100 shadow-sm hover:scale-105 hover:shadow-md' : 'bg-gray-50 border-transparent'} 
              `}
                        >
                            {/* Background Thumbnail */}
                            {displayWork && (
                                <div className="absolute inset-0 opacity-60">
                                    <img
                                        src={displayWork.thumbnail?.startsWith('http') || displayWork.thumbnail?.startsWith('data:') ? displayWork.thumbnail : `http://localhost:3001${displayWork.thumbnail}`}
                                        className="w-full h-full object-cover"
                                        alt=""
                                    />
                                    <div className="absolute inset-0 bg-white/20"></div>
                                </div>
                            )}

                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className={`text-[11px] z-10 ${displayWork ? 'font-black text-black drop-shadow-sm' : 'text-gray-400'}`}>
                                    {day}
                                </span>
                            </div>

                            {/* +n indicator for >1 works */}
                            {count > 1 && (
                                <div className="absolute top-1 right-1 z-20">
                                    <span className="text-[9px] font-bold bg-black text-white px-1 py-0.5 rounded-[4px] shadow-sm">
                                        +{count - 1}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 flex justify-between items-end">
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Records</h3>
                    <p className="text-3xl font-serif text-black leading-none">
                        {Object.values(worksByDay).flat().length} <span className="text-base font-sans font-normal text-gray-400">Works</span>
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

function FriendsTab({ user }) {
    const [friends, setFriends] = useState([]);
    const [search, setSearch] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        if (user) {
            loadFriends();
        }
    }, [user]);

    const loadFriends = async () => {
        try {
            const list = await api.getFriends(user.user_id);
            setFriends(list.filter(f => f.status === 'ACCEPTED'));
        } catch (e) { console.error(e); }
    };

    const handleSearch = async () => {
        if (!search.trim()) return;
        try {
            const res = await api.searchUsers(search);
            setSearchResults(res.filter(u => u.id !== user.user_id));
        } catch (e) { alert(e.message); }
    };

    const handleUnfollow = async (relId) => {
        if (!confirm("정말 친구를 삭제하시겠습니까?")) return;
        try {
            await api.deleteFriend(relId);
            loadFriends();
        } catch (e) { alert(e.message); }
    };

    const handleRequest = async (targetId) => {
        try {
            await api.requestFriend(user.user_id, targetId);
            alert("친구 요청을 보냈습니다.");
            setSearchResults([]);
            setSearch('');
        } catch (e) { alert("이미 요청했거나 친구입니다."); }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-lg mx-auto">
            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="닉네임으로 친구 찾기..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-10 pr-4 focus:outline-none focus:border-black transition-colors shadow-sm text-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                    <h3 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider px-1">검색 결과</h3>
                    <ul className="space-y-3">
                        {searchResults.map(u => (
                            <li key={u.id} className="flex justify-between items-center px-1">
                                <span className="font-semibold text-black text-sm">{u.nickname}</span>
                                <button
                                    onClick={() => handleRequest(u.id)}
                                    className="text-[11px] bg-black text-white px-4 py-1.5 rounded-full font-bold shadow-sm"
                                >
                                    친구 요청
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* My Friends List */}
            <div>
                <h3 className="text-lg font-serif font-bold mb-4 px-1">My Friends ({friends.length})</h3>
                <ul className="space-y-3">
                    {friends.map(f => (
                        <li key={f.friendship_id} className="flex justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm transition-all hover:border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                                    <img src={`https://ui-avatars.com/api/?name=${f.nickname}&background=random`} alt={f.nickname} className="w-full h-full object-cover" />
                                </div>
                                <span className="font-semibold text-sm">{f.nickname}</span>
                            </div>
                            <button
                                onClick={() => handleUnfollow(f.friendship_id)}
                                className="text-gray-300 hover:text-red-500 transition-colors p-2"
                            >
                                <UserMinus size={18} />
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </motion.div>
    );
}
