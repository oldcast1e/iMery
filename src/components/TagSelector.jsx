import React, { useState } from 'react';
import { X, ChevronRight, Tag as TagIcon } from 'lucide-react';
import { TAG_DATA } from '../constants/tagData';

const TagSelector = ({ selectedTags, onTagsChange }) => {
    const [activeHigh, setActiveHigh] = useState(null);
    const [activeMiddle, setActiveMiddle] = useState(null);

    const handleHighClick = (high) => {
        if (activeHigh === high) {
            setActiveHigh(null);
            setActiveMiddle(null);
        } else {
            setActiveHigh(high);
            setActiveMiddle(null);
        }
    };

    const handleMiddleClick = (middle) => {
        const path = [activeHigh, middle];
        const id = path.join('-');

        if (activeMiddle !== middle) {
            setActiveMiddle(middle);
        }

        const isLeafSelected = selectedTags.some(t => t.id === id);
        const hasChildSelected = selectedTags.some(t => t.id.startsWith(id + '-'));

        if (isLeafSelected) {
            onTagsChange(selectedTags.filter(t => t.id !== id));
        } else if (!hasChildSelected) {
            if (selectedTags.length >= 5) {
                alert('최대 5개의 태그만 선택할 수 있습니다.');
                return;
            }
            onTagsChange([...selectedTags, { id, label: middle, path }]);
        }
    };

    const toggleLowTag = (low, path) => {
        const id = path.join('-');
        const middleId = path.slice(0, 2).join('-');

        if (selectedTags.some(t => t.id === id)) {
            onTagsChange(selectedTags.filter(t => t.id !== id));
            return;
        }

        if (selectedTags.length >= 5) {
            alert('최대 5개의 태그만 선택할 수 있습니다.');
            return;
        }

        // Add new tag, remove parent middle if it was selected as a leaf
        const filtered = selectedTags.filter(t => t.id !== middleId);
        onTagsChange([...filtered, { id, label: low, path }]);
    };

    const removeTag = (id) => {
        onTagsChange(selectedTags.filter(t => t.id !== id));
    };

    return (
        <div className="space-y-2">
            {/* 1. Selected Tags (Premium Chips) */}
            <div className="flex flex-wrap gap-2 min-h-[44px] p-1 items-center">
                {selectedTags.length === 0 && (
                    <span className="text-[10px] text-gray-300 font-medium px-2 italic mb-1">태그를 선택하여 작품에 생동감을 불어넣으세요 (최대 5개)</span>
                )}
                {selectedTags.map((tag) => (
                    <div
                        key={tag.id}
                        className="group flex items-center gap-1.5 px-3 py-1.5 bg-gray-100/80 hover:bg-gray-200/80 text-gray-700 rounded-full transition-all cursor-default"
                    >
                        <TagIcon size={10} className="text-gray-400" />
                        <span className="text-[11px] font-bold tracking-tight">{tag.label}</span>
                        <button
                            type="button"
                            onClick={() => removeTag(tag.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors ml-0.5"
                        >
                            <X size={12} strokeWidth={2.5} />
                        </button>
                    </div>
                ))}
            </div>

            {/* 2. Selection Navigation */}
            <div className="space-y-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                {/* High Categories (Themed Tabs) */}
                <div className="flex p-1 bg-white/80 backdrop-blur-sm border border-gray-100 rounded-xl gap-1 shadow-sm">
                    {Object.keys(TAG_DATA).map((high) => (
                        <button
                            key={high}
                            type="button"
                            onClick={() => handleHighClick(high)}
                            className={`flex-1 py-2 text-[11px] font-black tracking-widest uppercase transition-all rounded-lg ${activeHigh === high
                                ? 'bg-black text-white shadow-lg scale-[1.02]'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {high}
                        </button>
                    ))}
                </div>

                {/* Middle Categories (Sub-cards) */}
                {activeHigh && (
                    <div className="grid grid-cols-2 gap-2 animate-slide-up">
                        {Object.keys(TAG_DATA[activeHigh]).map((middle) => {
                            const id = `${activeHigh}-${middle}`;
                            const isLeaf = selectedTags.some(t => t.id === id);
                            const hasChild = selectedTags.some(t => t.id.startsWith(id + '-'));

                            return (
                                <button
                                    key={middle}
                                    type="button"
                                    onClick={() => handleMiddleClick(middle)}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all group ${activeMiddle === middle
                                        ? 'bg-black border-black text-white shadow-premium scale-100'
                                        : (isLeaf || hasChild)
                                            ? 'bg-white border-black text-black ring-1 ring-black'
                                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'
                                        }`}
                                >
                                    <span className="text-xs font-bold">{middle}</span>
                                    {activeMiddle === middle ? (
                                        <ChevronRight size={14} className="opacity-100" />
                                    ) : (isLeaf || hasChild) ? (
                                        <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                                    ) : (
                                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Low Categories (Minimalist tags) */}
                {activeMiddle && (
                    <div className="flex flex-wrap gap-2 pt-2 justify-center animate-fade-in">
                        {TAG_DATA[activeHigh][activeMiddle].map((low) => {
                            const path = [activeHigh, activeMiddle, low];
                            const id = path.join('-');
                            const isSelected = selectedTags.some(t => t.id === id);

                            return (
                                <button
                                    key={low}
                                    type="button"
                                    onClick={() => toggleLowTag(low, path)}
                                    className={`px-3 py-2 rounded-lg text-[11px] font-bold transition-all border ${isSelected
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white border-gray-200 text-gray-400 hover:border-gray-800 hover:text-black'
                                        }`}
                                >
                                    {low}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TagSelector;
