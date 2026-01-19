import { useState, useEffect } from 'react';
import { Search as SearchIcon, X, Edit2 } from 'lucide-react';

const SearchView = ({ works, initialTags = [], onTagsChange, onWorkClick, onEditClick }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState(initialTags);

    // Update selected tags when initialTags change
    useEffect(() => {
        if (initialTags && initialTags.length > 0) {
            setSelectedTags(initialTags);
        }
    }, [initialTags]);

    // Filter works based on search query and selected tags
    const filteredWorks = works.filter(work => {
        const matchesQuery = !searchQuery ||
            work.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (work.tags && work.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))) ||
            (work.category && work.category.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesTags = selectedTags.length === 0 ||
            (work.tags && selectedTags.some(tag => work.tags.includes(tag))) ||
            (work.category && selectedTags.includes(work.category));

        return matchesQuery && matchesTags;
    });

    const handleRemoveTag = (tagToRemove) => {
        const newTags = selectedTags.filter(tag => tag !== tagToRemove);
        setSelectedTags(newTags);
        if (onTagsChange) {
            onTagsChange(newTags);
        }
    };

    return (
        <div className="px-4">
            <h2 className="text-2xl font-bold mb-6">검색</h2>

            {/* Search Input */}
            <div className="relative mb-4">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="작품 제목, 태그로 검색..."
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                />
            </div>

            {/* Selected Tags as Chips */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {selectedTags.map((tag, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-full text-sm font-medium"
                        >
                            {tag}
                            <button
                                onClick={() => handleRemoveTag(tag)}
                                className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Results */}
            {searchQuery || selectedTags.length > 0 ? (
                <div className="space-y-3 pb-6">
                    <p className="text-sm text-gray-500 mb-4">
                        {filteredWorks.length}개의 결과
                    </p>
                    {filteredWorks.map((work) => (
                        <div
                            key={work.id}
                            className="flex gap-3 p-3 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-shadow"
                        >
                            {/* Thumbnail - clickable */}
                            <div onClick={() => onWorkClick && onWorkClick(work)} className="cursor-pointer">
                                <img
                                    src={work.thumbnail}
                                    alt={work.title}
                                    className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                                />
                            </div>

                            {/* Content - clickable */}
                            <div onClick={() => onWorkClick && onWorkClick(work)} className="flex-grow min-w-0 cursor-pointer">
                                <h3 className="font-semibold text-black truncate">{work.title}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">{work.date}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {work.tags && work.tags.map((tag, idx) => (
                                        <span key={idx} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Edit Button - Right Side */}
                            {onEditClick && (
                                <div className="flex items-center">
                                    <button
                                        onClick={() => onEditClick(work)}
                                        className="p-3 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={18} className="text-gray-600" />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-gray-400">
                    <SearchIcon size={48} className="mx-auto mb-3 opacity-30" />
                    <p>작품을 검색해보세요</p>
                </div>
            )}
        </div>
    );
};

export default SearchView;
