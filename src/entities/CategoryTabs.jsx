import { useState } from 'react';

const CategoryTabs = ({ selectedCategory, onCategoryChange, onTagClick }) => {
    // No local state, controlled by HomeView/App.jsx

    const categories = ['전체', '그림', '조각', '사진', '판화', '기타'];

    const handleCategoryClick = (category) => {
        if (onCategoryChange) {
            onCategoryChange(category);
        }
        // Navigate to search when a tag is clicked
        if (onTagClick && category !== '전체') {
            onTagClick(category);
        }
    };

    return (
        <div className="px-4 mb-5">
            <div className="grid grid-cols-6 gap-2">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => handleCategoryClick(category)}
                        className={`py-2 rounded-xl text-sm font-medium transition-colors ${selectedCategory === category
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-black hover:bg-gray-200'
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryTabs;
