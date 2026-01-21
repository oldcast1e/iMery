import { useState, useEffect } from 'react';
import { X, Star, Check } from 'lucide-react';
import TagSelector from '../components/TagSelector';

const ReviewForm = ({ isOpen, onClose, imageData, onSave, existingWork = null }) => {
    const [formData, setFormData] = useState({
        artist: '',
        title: '',
        genre: '그림',
        rating: 5,
        review: '',
        tags: [],
        style: '',
        date: new Date().toISOString().split('T')[0] // local state YYYY-MM-DD
    });

    // UI state for "Unknown Artist"
    const [isUnknownArtist, setIsUnknownArtist] = useState(false);

    const genres = ['그림', '조각', '사진', '판화', '기타'];

    // Populate form when editing existing work
    useEffect(() => {
        if (existingWork) {
            setFormData({
                artist: existingWork.artist || existingWork.artist_name || '',
                title: existingWork.title || '',
                genre: existingWork.genre || existingWork.category || '그림',
                rating: existingWork.rating || 5,
                review: existingWork.review || existingWork.description || '',
                tags: existingWork.tags || [],
                style: existingWork.style || '',
                date: (existingWork.work_date || existingWork.date || '').replace(/\./g, '-').slice(0, 10) || new Date().toISOString().split('T')[0],
            });
            if (existingWork.artist === '작가 미상' || existingWork.artist_name === '작가 미상') {
                setIsUnknownArtist(true);
            } else {
                setIsUnknownArtist(false);
            }
        } else {
            // Reset for new work
            setFormData({
                artist: '',
                title: '',
                genre: '그림',
                rating: 5,
                review: '',
                tags: [],
                style: '',
                date: new Date().toISOString().split('T')[0],
            });
            setIsUnknownArtist(false);
        }
    }, [existingWork, isOpen]);

    const handleUnknownArtistToggle = () => {
        const newState = !isUnknownArtist;
        setIsUnknownArtist(newState);
        if (newState) {
            setFormData(prev => ({ ...prev, artist: '작가 미상' }));
        } else {
            setFormData(prev => ({ ...prev, artist: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title.trim()) {
            alert('작품 이름을 입력해주세요.');
            return;
        }
        if (!formData.artist.trim()) {
            alert('작가 이름을 입력해주세요.');
            return;
        }

        const workData = {
            ...formData,
            artist_name: formData.artist, // Map for API
            description: formData.review, // Map for API
            work_date: formData.date.replace(/-/g, '.'), // API expectation YYYY.MM.DD
        };

        if (existingWork) {
            // Editing existing work
            onSave({
                ...existingWork,
                ...workData,
                id: existingWork.id,
            }, formData.rawFile);
        } else {
            // Creating new work
            onSave({
                ...workData,
                id: Date.now(),
                date: formData.date.replace(/-/g, '.'),
                thumbnail: imageData,
                image_url: imageData,
            }, formData.rawFile);
        }

        onClose();
    };

    const handleStarClick = (rating) => {
        setFormData({ ...formData, rating });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-md px-4 pb-24">
            <div className="w-full max-w-lg bg-white shadow-apple rounded-[2.5rem] p-8 animate-fade-in-up border border-gray-100 max-h-[80vh] overflow-y-auto no-scrollbar">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-serif font-bold tracking-tight">
                        {existingWork ? '작품 수정' : '감상평 작성'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 glass hover:bg-white rounded-full transition-all active:scale-90 shadow-sm border border-white/20"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Image Preview */}
                {(imageData || existingWork?.thumbnail || existingWork?.image_url) && (
                    <div className="mb-8 rounded-3xl overflow-hidden shadow-premium border-2 border-white relative group">
                        <img
                            src={imageData instanceof File ? URL.createObjectURL(imageData) : (imageData || existingWork?.thumbnail || existingWork?.image_url)}
                            alt="Work"
                            className="w-full h-40 object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <label className="bg-white/90 text-black px-4 py-2 rounded-full text-xs font-bold shadow-lg cursor-pointer hover:bg-white active:scale-95 transition-all">
                                사진 변경
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    rawFile: file,
                                                    internal_preview: reader.result
                                                }));
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* 1. Artist Name */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[11px] font-bold text-gray-400 tracking-widest uppercase px-1">Artist</label>
                            <button
                                type="button"
                                onClick={handleUnknownArtistToggle}
                                className={`text-[10px] px-3 py-1 rounded-full font-bold transition-all border ${isUnknownArtist
                                    ? 'bg-black text-white border-black'
                                    : 'bg-white/50 text-gray-500 border-white/40 hover:bg-white hover:text-black'
                                    }`}
                            >
                                작가 미상
                            </button>
                        </div>
                        <input
                            type="text"
                            value={formData.artist}
                            onChange={(e) => {
                                setFormData({ ...formData, artist: e.target.value });
                                if (isUnknownArtist && e.target.value !== '작가 미상') {
                                    setIsUnknownArtist(false);
                                }
                            }}
                            placeholder="작가 이름을 입력하세요"
                            className="w-full px-5 py-3 glass rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 border-white/40 text-sm font-medium transition-all"
                            required
                        />
                    </div>

                    {/* 2. Title */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 tracking-widest uppercase px-1">Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="작품의 제목을 입력하세요"
                            className="w-full px-5 py-3 glass rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 border-white/40 text-sm font-medium transition-all"
                            required
                        />
                    </div>

                    {/* 2.1 Style */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 tracking-widest uppercase px-1">Style (화풍)</label>
                        <input
                            type="text"
                            value={formData.style}
                            onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                            placeholder="예: 인상주의, 표현주의, 추상화..."
                            className="w-full px-5 py-3 glass rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 border-white/40 text-sm font-medium transition-all"
                        />
                    </div>

                    {/* 2.5 Date */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 tracking-widest uppercase px-1">Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            max={new Date().toISOString().split('T')[0]}
                            onChange={(e) => {
                                const selectDate = e.target.value;
                                const today = new Date().toISOString().split('T')[0];
                                if (selectDate > today) {
                                    alert('미래의 날짜는 선택할 수 없습니다.');
                                    return;
                                }
                                setFormData({ ...formData, date: selectDate });
                            }}
                            className="w-full px-5 py-3 glass rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 border-white/40 text-sm font-medium transition-all"
                            required
                        />
                    </div>

                    {/* 3. Genre */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 tracking-widest uppercase px-1">Genre</label>
                        <div className="flex gap-2 flex-wrap">
                            {genres.map((genre) => (
                                <button
                                    key={genre}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, genre })}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${formData.genre === genre
                                        ? 'bg-black text-white shadow-premium'
                                        : 'bg-white/50 text-gray-400 hover:text-black hover:bg-white'
                                        }`}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3.5 Tags */}
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2 px-1">
                            <label className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">Tags</label>
                            <span className="text-[10px] text-gray-300 font-medium italic">태그를 선택하여 작품에 생동감을 불어넣으세요 (최대 5개)</span>
                        </div>
                        <TagSelector
                            selectedTags={formData.tags}
                            onTagsChange={(tags) => setFormData({ ...formData, tags })}
                        />
                    </div>

                    {/* 4. Rating */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 tracking-widest uppercase px-1">Rating</label>
                        <div className="flex justify-between items-center glass p-3 rounded-2xl border-white/40">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => handleStarClick(star)}
                                    className="flex-1 flex justify-center py-1 transition-transform active:scale-125"
                                >
                                    <Star
                                        size={28}
                                        className={`transition-all duration-300 ${star <= formData.rating
                                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]'
                                            : 'text-gray-200'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 5. Review */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 tracking-widest uppercase px-1">Review</label>
                        <textarea
                            value={formData.review}
                            onChange={(e) => setFormData({ ...formData, review: e.target.value })}
                            placeholder="작품을 보며 느낀 점을 기록하세요..."
                            rows={4}
                            className="w-full px-5 py-4 glass rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-black/5 border-white/40 text-sm font-medium leading-relaxed resize-none transition-all no-scrollbar"
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 glass text-black rounded-3xl font-bold text-sm tracking-tight hover:bg-white transition-all active:scale-95 border-white/40"
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="flex-[1.5] py-4 bg-black text-white rounded-3xl font-bold text-sm tracking-tight hover:bg-gray-800 transition-all active:scale-95 shadow-premium"
                        >
                            {existingWork ? '수정하기' : '기록하기'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReviewForm;
