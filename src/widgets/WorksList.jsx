import { useState } from 'react';
import { Star, Bookmark, Edit2, Trash2, Play, Pause, Music, User } from 'lucide-react';

const WorksList = ({
    works = [],
    onWorkClick,
    onTagClick,
    onEditClick,
    onDeleteClick,
    bookmarkedIds = [],
    onBookmarkToggle,
    layout = 'list',
    onLikeToggle,
    showPagination = true
}) => {
    const [visibleCount, setVisibleCount] = useState(5);
    const [hoveredWork, setHoveredWork] = useState(null);
    const [playingWorkId, setPlayingWorkId] = useState(null);

    const handleLoadMore = () => {
        setVisibleCount(prev => Math.min(prev + 5, works.length));
    };

    const handlePlayToggle = (e, workId) => {
        e.stopPropagation();
        if (playingWorkId === workId) {
            setPlayingWorkId(null);
        } else {
            setPlayingWorkId(workId);
        }
    };

    const visibleWorks = works.slice(0, visibleCount);
    const hasMore = visibleCount < works.length;

    if (works.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">🎨</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">아직 기록된 작품이 없습니다</h3>
                <p className="text-gray-500 text-sm">
                    당신의 감각을 깨우는 작품을 찾아 기록해보세요.
                </p>
            </div>
        );
    }

    // List layout (Compact)
    if (layout === 'list') {
        return (
            <div className="px-4 pb-6">
                <div className="space-y-3">
                    {visibleWorks.map((work) => (
                        <div
                            key={work.id}
                            onMouseEnter={() => setHoveredWork(work.id)}
                            onMouseLeave={() => setHoveredWork(null)}
                            className="relative flex gap-3 p-3 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-shadow cursor-pointer"
                        >
                            {/* Thumbnail */}
                            <div onClick={() => onWorkClick && onWorkClick(work)}>
                                <img
                                    src={work.thumbnail?.startsWith('http') || work.thumbnail?.startsWith('data:') ? work.thumbnail : `http://localhost:3001${work.thumbnail}`}
                                    alt={work.title}
                                    className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                                />
                            </div>

                            {/* Content */}
                            <div onClick={() => onWorkClick && onWorkClick(work)} className="flex-grow min-w-0">
                                <h3 className="font-semibold text-black truncate">{work.title}</h3>
                                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                    <span className="font-medium text-black">{work.artist}</span>
                                    <span>•</span>
                                    <span>{work.date}</span>
                                </p>

                                {/* Tags */}
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                    {work.category && (
                                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                                            {work.category}
                                        </span>
                                    )}
                                </div>

                                {/* Stars */}
                                <div className="flex gap-0.5 mt-2">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={12}
                                            className={i < work.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col items-end justify-between py-1">
                                {onBookmarkToggle && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onBookmarkToggle(work.id);
                                        }}
                                        className={`transition-all ${hoveredWork === work.id || bookmarkedIds.includes(work.id) ? 'opacity-100' : 'opacity-0'}`}
                                    >
                                        <Bookmark size={18} className={bookmarkedIds.includes(work.id) ? 'fill-black text-black' : 'text-gray-400 hover:text-black'} />
                                    </button>
                                )}

                                {work.music_url && (
                                    <Music size={16} className="text-gray-400" />
                                )}

                                {(onEditClick || onDeleteClick) && (
                                    <div className="flex gap-1 mt-auto">
                                        {onEditClick && <button onClick={(e) => { e.stopPropagation(); onEditClick(work); }} className="p-1.5 hover:bg-gray-100 rounded-lg"><Edit2 size={14} className="text-gray-500" /></button>}
                                        {onDeleteClick && <button onClick={(e) => { e.stopPropagation(); onDeleteClick(work); }} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 size={14} className="text-red-500" /></button>}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {showPagination && hasMore && (
                    <div className="mt-6 flex justify-center">
                        <button onClick={handleLoadMore} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors">
                            더보기 ({works.length - visibleCount}개 더 보기)
                        </button>
                    </div>
                )}
            </div>
        );
    }

    // Grid layouts (large = Feed Style)
    const getGridCols = () => {
        switch (layout) {
            case 'large': return 'grid-cols-1';
            case 'medium': return 'grid-cols-2';
            case 'small': return 'grid-cols-3';
            default: return 'grid-cols-1';
        }
    };

    return (
        <div className="px-4 pb-6">
            <div className={`grid ${getGridCols()} gap-4`}>
                {visibleWorks.map((work) => (
                    <div
                        key={work.id}
                        className="flex flex-col gap-2"
                    >
                        {/* Feed Header (Only for Large Layout) */}
                        {layout === 'large' && (
                            <div className="flex items-center gap-2 px-1">
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User size={16} className="text-gray-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{work.nickname || 'Unknown User'}</p>
                                    <p className="text-xs text-gray-500">{work.date}</p>
                                </div>
                            </div>
                        )}

                        <div
                            className="relative group rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-white"
                        >
                            {/* Image Wrapper */}
                            <div
                                onClick={() => onWorkClick && onWorkClick(work)}
                                className={`relative ${layout === 'large' ? 'aspect-square' : 'aspect-square'} cursor-pointer`}
                            >
                                <img
                                    src={work.thumbnail?.startsWith('http') || work.thumbnail?.startsWith('data:') ? work.thumbnail : `http://localhost:3001${work.thumbnail}`}
                                    alt={work.title}
                                    className="w-full h-full object-cover"
                                />

                                {layout !== 'large' && (
                                    <div className="absolute bottom-0 left-0 right-0 glass-overlay p-3">
                                        <p className="text-sm font-bold text-black truncate">{work.title}</p>
                                        <p className="text-xs text-black/70 truncate">{work.artist}</p>
                                    </div>
                                )}
                            </div>

                            {/* Feed Content (Only for Large Layout) */}
                            {layout === 'large' && (
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-lg font-bold">{work.title}</h3>
                                            <p className="text-sm text-gray-600">{work.artist}</p>
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
                                                onClick={(e) => handlePlayToggle(e, work.id)}
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
                                                <Bookmark size={20} className={bookmarkedIds.includes(work.id) ? 'fill-black text-black' : ''} />
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
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {showPagination && hasMore && (
                <div className="mt-6 flex justify-center">
                    <button onClick={handleLoadMore} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors">
                        더보기 ({works.length - visibleCount}개 더 보기)
                    </button>
                </div>
            )}
        </div>
    );
};

export default WorksList;
