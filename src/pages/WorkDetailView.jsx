import { Share2, Clock, Tag, Bookmark, Edit2, Play, Pause, Music, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import api from '../api/client';

const WorkDetailView = ({ work, onBack, user }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const audioRef = useRef(null);

    useEffect(() => {
        loadComments();
    }, [work.id]);

    const loadComments = async () => {
        try {
            const data = await api.getComments(work.id);
            setComments(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddComment = async () => {
        if (!user || !commentText.trim()) return;
        try {
            await api.addComment(work.id, user.user_id, commentText);
            setCommentText('');
            loadComments();
        } catch (e) {
            alert('댓글 작성 실패');
        }
    };

    const handlePlayToggle = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="bg-white min-h-screen pb-10">
            {/* Header Image */}
            <div className="relative w-full h-[50vh] bg-gray-900">
                <img
                    src={work.thumbnail}
                    alt={work.title}
                    className="w-full h-full object-contain"
                />
                <button
                    onClick={onBack}
                    className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-colors"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>
            </div>

            {/* Content Container */}
            <div className="px-5 -mt-8 relative z-10">
                <div className="bg-white rounded-t-3xl p-6 shadow-lg min-h-[50vh]">
                    {/* Title & Meta */}
                    <div className="mb-6">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="flex gap-2 mb-2">
                                    <span className="inline-block px-3 py-1 bg-black text-white text-xs font-bold rounded-full">
                                        {work.genre || work.category || '그림'}
                                    </span>
                                    {work.style && (
                                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full border border-gray-200">
                                            {work.style}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                                    {work.title}
                                </h1>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100">
                                    <Share2 size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                            <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {work.date}
                            </span>
                            <span className="font-medium text-black">
                                {work.artist || '작가 미상'}
                            </span>
                        </div>

                        {/* Audio Player if music_url exists */}
                        {work.music_url && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-2xl flex items-center gap-3 border border-gray-100">
                                <button
                                    onClick={handlePlayToggle}
                                    className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 hover:bg-gray-800 transition-colors"
                                >
                                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                                </button>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate">AI Generated Music</p>
                                    <p className="text-xs text-gray-500 truncate">Tap to listen to the analysis</p>
                                </div>
                                <Music size={20} className="text-gray-300" />
                                <audio ref={audioRef} src={work.music_url} onEnded={() => setIsPlaying(false)} className="hidden" />
                            </div>
                        )}

                        {/* Rating */}
                        <div className="flex gap-1 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg
                                    key={star}
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill={star <= work.rating ? "#FBBF24" : "#E5E7EB"}
                                    className="transition-colors"
                                >
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            ))}
                        </div>
                    </div>

                    {/* AI Analysis Button Placeholder */}
                    <button className="w-full py-4 mb-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity transform active:scale-95">
                        <Sparkles size={20} className="animate-pulse" />
                        AI 분석 받아보기
                        <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full ml-1">Coming Soon</span>
                    </button>

                    {/* Review Content */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold mb-3 border-b border-gray-100 pb-2">감상평</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {work.review}
                            </p>
                        </div>

                        {/* AI Summary Section */}
                        {work.ai_summary && (
                            <div>
                                <h3 className="text-lg font-bold mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
                                    <span className="text-blue-600">✨ AI 분석</span>
                                </h3>
                                <div className="bg-blue-50 p-4 rounded-xl text-sm text-gray-700 leading-relaxed">
                                    {work.ai_summary}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {work.tags && work.tags.length > 0 && (
                            <div className="pt-4 animate-fade-in">
                                <div className="flex flex-wrap gap-2">
                                    {work.tags.map((tag, idx) => {
                                        const label = typeof tag === 'object' ? tag.label : tag;
                                        const id = typeof tag === 'object' ? tag.id : `old-${idx}`;
                                        return (
                                            <span
                                                key={id}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-600 rounded-xl text-xs font-bold border border-gray-100 shadow-sm"
                                            >
                                                <Tag size={12} className="text-gray-400" />
                                                {label}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Comments Section */}
                        <div className="pt-8 mt-4 border-t border-gray-100">
                            <h3 className="text-lg font-bold mb-4">댓글</h3>

                            {/* Comment Input */}
                            <div className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="flex-1 bg-gray-50 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-black/5"
                                    placeholder={user ? "댓글을 남겨보세요" : "로그인 후 작성 가능합니다"}
                                    disabled={!user}
                                />
                                <button
                                    onClick={handleAddComment}
                                    disabled={!user || !commentText.trim()}
                                    className="bg-black text-white px-4 rounded-xl font-medium disabled:opacity-50"
                                >
                                    등록
                                </button>
                            </div>

                            {/* Comment List */}
                            <div className="space-y-4">
                                {comments.length === 0 ? (
                                    <p className="text-center text-gray-400 py-4 text-sm">첫 댓글을 남겨주세요.</p>
                                ) : (
                                    comments.map(c => (
                                        <div key={c.id} className="bg-gray-50 p-3 rounded-xl">
                                            <p className="font-bold text-sm mb-1">{c.nickname}</p>
                                            <p className="text-gray-700 text-sm">{c.content}</p>
                                            <p className="text-xs text-gray-400 mt-1">{new Date(c.created_at).toLocaleDateString()}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkDetailView;
