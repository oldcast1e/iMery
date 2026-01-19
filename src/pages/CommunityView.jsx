import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, User, Send } from 'lucide-react';
import api from '../api/client';

const FeedCard = ({ work, user, onLikeToggle }) => {
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [loadingComments, setLoadingComments] = useState(false);

    const loadComments = async () => {
        if (loadingComments) return;
        setLoadingComments(true);
        try {
            const data = await api.getComments(work.id);
            setComments(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingComments(false);
        }
    };

    const handleToggleComments = () => {
        if (!isCommentsOpen) {
            loadComments();
        }
        setIsCommentsOpen(!isCommentsOpen);
    };

    const handleSubmitComment = async () => {
        if (!commentText.trim()) return;
        try {
            await api.addComment(work.id, user.user_id, commentText);
            setCommentText('');
            loadComments(); // Refresh comments
        } catch (e) {
            alert('댓글 작성 실패');
        }
    };

    return (
        <div className="bg-white border-b border-gray-100 last:border-0 pb-6 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <User size={16} className="text-gray-500" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">{work.nickname}</p>
                        <p className="text-xs text-gray-500">{work.date}</p>
                    </div>
                </div>
                <button className="text-gray-400">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {/* Image */}
            <div className="w-full aspect-square bg-gray-50 relative overflow-hidden">
                <img
                    src={work.thumbnail?.startsWith('http') || work.thumbnail?.startsWith('data:') ? work.thumbnail : `http://localhost:3001${work.thumbnail}`}
                    alt={work.title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Actions */}
            <div className="px-4 py-3 flex items-center gap-4">
                <button
                    onClick={() => onLikeToggle(work)}
                    className={`flex items-center gap-1 transition-colors ${work.is_liked ? 'text-red-500' : 'text-gray-800'}`}
                >
                    <Heart size={24} className={work.is_liked ? 'fill-red-500' : ''} />
                </button>
                <button
                    onClick={handleToggleComments}
                    className="text-gray-800"
                >
                    <MessageCircle size={24} />
                </button>
                <button className="text-gray-800">
                    <Share2 size={24} />
                </button>
            </div>

            {/* Content */}
            <div className="px-4">
                <p className="text-sm font-bold mb-1">{work.like_count || 0}명이 좋아합니다</p>
                <div className="mb-2">
                    <span className="font-bold text-sm mr-2">{work.nickname}</span>
                    <span className="text-sm">{work.review}</span>
                </div>
                {work.title && (
                    <p className="text-xs text-gray-500 mb-2">작품명: {work.title}</p>
                )}

                {/* Comments Section */}
                <button
                    onClick={handleToggleComments}
                    className="text-gray-500 text-sm mb-2"
                >
                    {isCommentsOpen ? '댓글 접기' : '댓글 모두 보기'}
                </button>

                {isCommentsOpen && (
                    <div className="space-y-3 mb-4">
                        {comments.map(c => (
                            <div key={c.id} className="flex gap-2">
                                <span className="font-bold text-sm text-xs">{c.nickname}</span>
                                <span className="text-sm text-xs">{c.content}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Comment Input */}
                <div className="flex gap-2 items-center mt-2">
                    <input
                        type="text"
                        placeholder="댓글 달기..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1 text-sm bg-transparent outline-none py-1"
                    />
                    <button
                        onClick={handleSubmitComment}
                        disabled={!commentText.trim()}
                        className="text-blue-500 text-sm font-semibold disabled:opacity-50"
                    >
                        게시
                    </button>
                </div>
            </div>
        </div>
    );
};

const CommunityView = ({ works, user, onLikeToggle }) => {
    return (
        <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
            {works.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <p>아직 새로운 소식이 없습니다.</p>
                    <p className="text-sm mt-2">친구를 추가해보세요!</p>
                </div>
            ) : (
                works.map(work => (
                    <FeedCard
                        key={work.id}
                        work={work}
                        user={user}
                        onLikeToggle={onLikeToggle}
                    />
                ))
            )}
        </div>
    );
};

export default CommunityView;
