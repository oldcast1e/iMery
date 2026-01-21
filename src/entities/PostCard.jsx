import { useState } from 'react';
import { Star, Bookmark, Edit2, Trash2, Play, Pause, Music, User } from 'lucide-react';

export default function PostCard({ work, onClick, onTagClick, onEditClick, onDeleteClick, bookmarkedIds = [], onBookmarkToggle, onLikeToggle, layout = 'large' }) {
    const [playingWorkId, setPlayingWorkId] = useState(null);

    const isBookmarked = bookmarkedIds.includes(work.id);

    const handlePlayToggle = (e) => {
        e.stopPropagation();
        if (playingWorkId === work.id) {
            setPlayingWorkId(null);
        } else {
            setPlayingWorkId(work.id);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            {/* Feed Header */}
            <div className="flex items-center gap-2 px-1">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {work.user_image ? (
                        <img src={work.user_image} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <User size={16} className="text-gray-500" />
                    )}
                </div>
                <div>
                    <p className="text-sm font-bold">{work.nickname || 'Unknown User'}</p>
                    <p className="text-xs text-gray-500">{work.date || work.work_date || work.created_at}</p>
                </div>
            </div>

            <div className="relative group rounded-3xl overflow-hidden glass shadow-premium bg-white">
                {/* Image Wrapper */}
                <div
                    onClick={() => onClick && onClick(work)}
                    className="relative aspect-square cursor-pointer bg-gray-50 overflow-hidden"
                >
                    <img
                        src={work.thumbnail?.startsWith('http') || work.thumbnail?.startsWith('data:') ? work.thumbnail : `http://localhost:3001${work.thumbnail}`}
                        alt={work.title}
                        className="w-full h-full object-cover transition-transform duration-700" // REMOVED group-hover:scale-110 per request
                    />

                    {/* Category Badge */}
                    {work.category && (
                        <div className="absolute top-4 right-4 z-10">
                            <div className="px-3 py-1.5 glass rounded-full border border-white/40 shadow-premium">
                                <span className="text-[10px] font-bold text-black tracking-tight">{work.category}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Feed Content */}
                <div className="p-5 bg-gray-50/50 border-t border-gray-100/50">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="text-lg font-bold">{work.title}</h3>
                            <p className="text-sm text-gray-600 mb-2">{work.artist}</p>
                            {/* Tags Display */}
                            {work.tags && work.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {work.tags.map((tag, idx) => {
                                        const label = typeof tag === 'object' ? tag.label : tag;
                                        const id = typeof tag === 'object' ? tag.id : `old-${idx}`;
                                        return (
                                            <span key={id} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold">
                                                {label}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} size={16} className={i < work.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                            ))}
                        </div>
                    </div>

                    {/* Description Preview */}
                    {work.review && (
                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{work.review}</p>
                    )}

                    {/* Audio Player */}
                    {work.music_url && (
                        <div className="mt-3 bg-gray-50 rounded-xl p-2 flex items-center gap-3">
                            <button
                                onClick={handlePlayToggle}
                                className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800"
                            >
                                {playingWorkId === work.id ? <Pause size={14} /> : <Play size={14} />}
                            </button>
                            <div className="flex-1 overflow-hidden">
                                <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                                    <div className={`h-full bg-black ${playingWorkId === work.id ? 'animate-pulse w-2/3' : 'w-0'}`} />
                                </div>
                            </div>
                            {playingWorkId === work.id && (
                                <audio src={work.music_url} autoPlay onEnded={() => setPlayingWorkId(null)} />
                            )}
                        </div>
                    )}

                    {/* Action Bar */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={(e) => { e.stopPropagation(); onLikeToggle && onLikeToggle(work); }}
                                className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
                            >
                                <svg
                                    width="20" height="20" viewBox="0 0 24 24"
                                    fill={work.is_liked ? "currentColor" : "none"}
                                    stroke="currentColor" strokeWidth="2"
                                    className={work.is_liked ? "text-red-500" : ""}
                                >
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                <span className="text-sm font-medium">{work.like_count || 0}</span>
                            </button>

                            <button
                                onClick={() => onBookmarkToggle && onBookmarkToggle(work.id)}
                                className="flex items-center gap-1 text-gray-500 hover:text-black"
                            >
                                <Bookmark size={20} className={isBookmarked ? 'fill-black text-black' : ''} />
                            </button>
                        </div>

                        {(onEditClick || onDeleteClick) && (
                            <div className="flex gap-2">
                                {onEditClick && <button onClick={() => onEditClick(work)} className="p-2 hover:bg-gray-100 rounded-full"><Edit2 size={18} /></button>}
                                {onDeleteClick && <button onClick={() => onDeleteClick(work)} className="p-2 hover:bg-red-50 text-red-500 rounded-full"><Trash2 size={18} /></button>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
