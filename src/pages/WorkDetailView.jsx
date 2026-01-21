import { Share2, Clock, Tag, Bookmark, Edit2, Play, Pause, Music, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import api from '../api/client';

const WorkDetailView = ({ work, onBack, user }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);
    const audioRef = useRef(null);

    useEffect(() => {
        loadComments();
        if (work.analysis_id) {
            setAnalysisData(work); // If already analyzed, work object contains analysis fields
        }
    }, [work.id, work.analysis_id]);

    const handleAnalyze = async () => {
        if (isAnalyzing) return;
        setIsAnalyzing(true);
        try {
            const data = await api.analyzePost(work.id);
            // The API returns { result: { genre, styles, ... }, ai_summary, ... }
            // We flattern it for easier UI binding
            const flattened = {
                ...data.result,
                ai_genre: data.result.genre,
                ai_summary: data.ai_summary,
                // Map styles array to style1~5 for the chart
                ...data.result.styles.reduce((acc, s, i) => ({
                    ...acc,
                    [`style${i + 1}`]: s.name,
                    [`score${i + 1}`]: s.score
                }), {})
            };
            setAnalysisData(flattened);
        } catch (e) {
            alert(e.message || '분석 중 오류가 발생했습니다.');
        } finally {
            setIsAnalyzing(false);
        }
    };

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
                                        {work.genre || '그림'}
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

                        {/* Tags moved here */}
                        {work.tags && work.tags.length > 0 && (
                            <div className="mb-6 animate-fade-in">
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

                    {/* AI Analysis Button */}
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className={`w-full py-3 mb-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 ${isAnalyzing
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90'
                            }`}
                    >
                        {isAnalyzing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                                <span>AI가 작품을 감상 중입니다... (약 90초 소요)</span>
                            </>
                        ) : (
                            <>
                                <Sparkles size={20} className="animate-pulse" />
                                <span>AI 분석 받아보기</span>
                            </>
                        )}
                    </button>

                    {/* AI Analysis Results Visualizer */}
                    {analysisData && (
                        <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Sparkles size={14} className="text-purple-500" />
                                    AI Analysis Result
                                </h3>
                                <span className="px-3 py-1 bg-purple-100 text-purple-600 text-[10px] font-bold rounded-full">
                                    {analysisData.genre || analysisData.ai_genre}
                                </span>
                            </div>

                            {/* Style Probability Charts */}
                            <div className="space-y-4 mb-6">
                                {[1, 2, 3, 4, 5].map(num => {
                                    const styleName = analysisData[`style${num}`];
                                    const score = analysisData[`score${num}`];
                                    if (!styleName) return null;

                                    return (
                                        <div key={num} className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="text-gray-600">{styleName}</span>
                                                <span className="text-purple-500">{Math.round(score * 100)}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full"
                                                    style={{ width: `${score * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Music Player Placeholder / Integration */}
                            {(analysisData.music_url || work.music_url) && (
                                <div className="p-4 bg-white rounded-xl border border-purple-100 flex items-center gap-3">
                                    <button
                                        onClick={handlePlayToggle}
                                        className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center flex-shrink-0 hover:bg-purple-700 transition-colors shadow-premium"
                                    >
                                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-purple-900 truncate">분석 기반 추천 음악</p>
                                        <p className="text-[10px] text-purple-400 truncate">이 작품의 분위기와 어울리는 AI 생성 곡</p>
                                    </div>
                                    <Music size={18} className="text-purple-200" />
                                    <audio
                                        ref={audioRef}
                                        src={analysisData.music_url || work.music_url}
                                        onEnded={() => setIsPlaying(false)}
                                        className="hidden"
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Review Content */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold mb-3 border-b border-gray-100 pb-2">감상평</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {work.review}
                            </p>
                        </div>

                        {/* AI Summary Text */}
                        {(analysisData?.ai_summary || work.ai_summary) && (
                            <div className="animate-in fade-in duration-700">
                                <h3 className="text-lg font-bold mb-3 border-b border-gray-100 pb-2 flex items-center gap-2">
                                    <span className="text-indigo-600">✨ AI Insight</span>
                                </h3>
                                <div className="bg-indigo-50/50 p-4 rounded-2xl text-sm text-gray-700 leading-relaxed border border-indigo-100/50 italic">
                                    "{analysisData?.ai_summary || work.ai_summary}"
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
