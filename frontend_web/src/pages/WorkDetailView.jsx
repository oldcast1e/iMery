import { Share2, Clock, Tag, Bookmark, Edit2, Play, Pause, Music, Sparkles } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';

const WorkDetailView = ({ work, onBack, user }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisData, setAnalysisData] = useState(null);
    const [analysisError, setAnalysisError] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const audioRef = useRef(null);
    const loopTimerRef = useRef(null); // Ref for loop interval

    // 1. Auto-Reveal Analysis State
    useEffect(() => {
        // Strict check: Only reveal if backend says is_analyzed is true
        // This ensures if user never clicked, they see the button first
        if (work.is_analyzed && work.ai_summary) {
            setAnalysisData({
                ...work,
                ai_summary: work.ai_summary,
                ai_genre: work.genre,
                style1: work.style1, score1: work.score1,
                style2: work.style2, score2: work.score2,
                style3: work.style3, score3: work.score3,
                style4: work.style4, score4: work.score4,
                style5: work.style5, score5: work.score5,
                is_analyzed: true
            });
        }
    }, [work.id, work.is_analyzed, work.ai_summary]);

    // 2. Auto-Play Music & Scroll to Top (Only on mount/Work change)
    useEffect(() => {
        // Force scroll to top when entering this view
        window.scrollTo(0, 0);

        loadComments();

        if (work.music_url) {
            // Unconditional Autoplay (No delay, immediate attempt)
            if (audioRef.current) {
                audioRef.current.play()
                    .then(() => setIsPlaying(true))
                    .catch(e => {
                        console.log("Autoplay blocked (will retry on interaction):", e);
                        // Optional: Show "Click to play" toast if blocked?
                        // For now, adhere to "Unconditional" intent by trying.
                    });
            }
        }
    }, [work.id, work.music_url]); // Trigger if work ID OR music URL changes

    // Cleanup loop timer on unmount
    useEffect(() => {
        return () => {
            if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
        };
    }, []);

    const handleAudioEnded = () => {
        setIsPlaying(false);
        // Loop after 1 second delay (1000ms)
        loopTimerRef.current = setTimeout(() => {
            if (audioRef.current) {
                audioRef.current.play()
                    .then(() => setIsPlaying(true))
                    .catch(e => console.log("Loop replay blocked:", e));
            }
        }, 1000);
    };

    const handleAnalyze = async () => {
        if (isAnalyzing) return;
        setIsAnalyzing(true);
        setAnalysisError(null);

        try {
            // Artificial delay to show "generating" effect (2 seconds)
            const delayPromise = new Promise(resolve => setTimeout(resolve, 2000));

            // 1. Check if we already have the summary locally (Optimization & Resilience)
            if (work.ai_summary && work.ai_summary !== "AI가 그림을 분석 중이에요!") {
                console.log('Using existing AI summary from prop (Resilience Mode)');

                // Construct analysis data from work prop
                // We use existing work data as the analysis result
                const localData = {
                    ...work,
                    ai_genre: work.genre,
                    ai_summary: work.ai_summary,
                    // Use existing styles
                    style1: work.style1, score1: work.score1,
                    style2: work.style2, score2: work.score2,
                    style3: work.style3, score3: work.score3,
                    style4: work.style4, score4: work.score4,
                    style5: work.style5, score5: work.score5,
                    is_analyzed: true
                };

                await delayPromise;
                setAnalysisData(localData);

                // Try to persist the reveal state to backend
                // If this fails (e.g. old server code), we catch it but users still see the result!
                try {
                    await api.analyzePost(work.id);
                } catch (e) {
                    console.warn("Backend persistence failed, but showing local result:", e);
                    // Do NOT setAnalysisError here, because we successfully showed the data!
                }

                setIsAnalyzing(false);
                return;
            }

            // 2. Local Description Fallback
            let data;

            if (work.description) {
                // Determine if we should use description as fallback
                // But usually we prefer API if we want "AI" feeling. 
                // However, preserving existing logic while adding delay:
                console.log('Using existing description');
                data = {
                    result: {
                        genre: work.genre || '그림',
                        styles: [] // We might not have styles if just using description
                    },
                    ai_summary: work.description
                };
            } else {
                data = await api.analyzePost(work.id);
            }

            // Wait for delay to finish
            await delayPromise;

            // The API returns { result: { genre, styles, ... }, ai_summary, ... }
            const flattened = {
                ...data.result,
                ai_genre: data.result?.genre,
                ai_summary: data.ai_summary,
                // Map styles array to style1~5 for the chart
                ...(data.result?.styles || []).reduce((acc, s, i) => ({
                    ...acc,
                    [`style${i + 1}`]: s.name,
                    [`score${i + 1}`]: s.score
                }), {}),
                is_analyzed: true // Mark as revealed
            };
            setAnalysisData(flattened);
            setAnalysisError(null);

            if (work.onAnalysisComplete) {
                work.onAnalysisComplete();
            }
        } catch (e) {
            console.error('[AI Analysis Error]:', e);
            setAnalysisError(e.message || 'AI 분석 중 오류가 발생했습니다.');
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
        if (!work.music_url) {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Debug: Check if style1 exists in work object
    console.log('Work object:', {
        id: work.id,
        title: work.title,
        genre: work.genre,
        style: work.style,
        style1: work.style1,
        all_keys: Object.keys(work)
    });

    return (
        <div className="bg-white min-h-screen pb-6">
            {/* Audio Element moved to root level for stability */}
            {/* Added autoPlay attribute as fallback */}
            <audio
                ref={audioRef}
                src={work.music_url || ''}
                autoPlay
                loop={false}
                onEnded={handleAudioEnded}
                className="hidden"
            />

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
                {/* Analysis Error Toast */}
                {analysisError && (
                    <motion.div
                        initial={{ opacity: 0, y: -20, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: -20, x: "-50%" }}
                        className="fixed top-28 left-1/2 z-[100] bg-red-500/90 text-white px-6 py-3.5 rounded-full text-sm font-bold shadow-2xl backdrop-blur-md flex items-center gap-3 whitespace-nowrap border border-white/10"
                        onClick={() => setAnalysisError(null)}
                    >
                        <svg className="w-5 h-5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {analysisError}
                    </motion.div>
                )}
            </AnimatePresence>
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
                <div className="bg-white rounded-t-3xl p-6 shadow-lg min-h-[30vh]">
                    {/* Title & Meta */}
                    <div className="mb-6">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <div className="flex gap-2 mb-2 flex-wrap items-center">
                                    <span className="flex items-center justify-center h-6 px-3 bg-black text-white text-xs font-bold rounded-full">
                                        {work.genre || '그림'}
                                    </span>
                                    {(work.style1 || work.style) && (
                                        <span className="flex items-center justify-center h-6 px-3 text-white text-xs font-bold rounded-full shadow-sm" style={{ backgroundColor: 'rgb(35, 84, 157)' }}>
                                            {work.style1 || work.style}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                                    {work.title}
                                </h1>
                            </div>
                            <div className="flex gap-2 items-center">
                                <button
                                    onClick={handlePlayToggle}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-300 relative overflow-hidden
                                        ${isPlaying
                                            ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white scale-110 shadow-lg ring-2 ring-purple-200'
                                            : 'bg-white text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 border border-gray-100'}`}
                                >
                                    {isPlaying && (
                                        <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                                    )}
                                    {isPlaying ? <Music size={16} className="relative z-10 animate-bounce" /> : <Music size={16} />}
                                </button>
                                <button className="w-9 h-9 rounded-full flex items-center justify-center shadow-md transition-all duration-300 bg-white text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 border border-gray-100">
                                    <Share2 size={18} />
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

                    {/* AI Analysis Button or Summary Display */}
                    {/* Check is_analyzed flag: Show result ONLY if revealed OR just analyzed locally */}
                    {((work.is_analyzed || analysisData?.is_analyzed) && (work.ai_summary || analysisData?.ai_summary) && !isAnalyzing && (work.ai_summary !== "AI가 그림을 분석 중이에요!" && analysisData?.ai_summary !== "AI가 그림을 분석 중이에요!")) ? (
                        /* AI Summary Display - Actual Result */
                        <div className="w-full py-4 px-5 mb-4 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-200 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                                    <Sparkles size={20} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
                                        <span>AI 분석 결과</span>
                                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-[10px] font-bold rounded-full">완료</span>
                                    </h4>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {analysisData?.ai_summary || work.ai_summary}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* AI Analysis Button (Loading or Initial) */
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing}
                            className={`w-full py-4 mb-4 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all transform active:scale-95 relative overflow-hidden ${isAnalyzing
                                ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 text-white cursor-wait'
                                : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:shadow-xl hover:scale-[1.02]'
                                }`}
                        >
                            {isAnalyzing && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                            )}
                            {isAnalyzing ? (
                                <>
                                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                    <span className="text-sm sm:text-base font-bold">
                                        AI가 작품을 감상 중입니다...
                                        <span className="hidden sm:inline"> (약 90초 소요)</span>
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} className="animate-pulse" />
                                    <span className="text-sm sm:text-base">AI 분석 받아보기</span>
                                </>
                            )}
                        </button>
                    )}



                    {/* AI Analysis Results Visualizer */}
                    {analysisData && analysisData.style1 && (
                        <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Style Probability Charts */}
                            <div className="space-y-2">
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
                        </div>
                    )}

                    {/* Review Content */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold mb-3 border-b border-gray-100 pb-2">감상평</h3>
                            <div className="bg-gray-50 rounded-xl px-4 py-3">
                                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap w-full">
                                    {work.review}
                                </p>
                            </div>
                        </div>



                        {/* Comments Section */}
                        {/* Reduced spacing as requested */}
                        <div className="pt-2 mt-2">
                            <h3 className="text-lg font-bold mb-4 border-b border-gray-100 pb-2">댓글</h3>

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
            </div >
        </div >
    );
};

export default WorkDetailView;
