import { useState } from 'react';

const CategoryTabs = ({ selectedGenre, onGenreChange, onTagClick }) => {
    // No local state, controlled by HomeView/App.jsx

    const genres = ['전체', '그림', '조각', '사진', '판화', '기타'];

    const handleGenreClick = (genre) => {
        if (onGenreChange) {
            onGenreChange(genre);
        }
        // Navigate to search when a tag is clicked
        if (onTagClick && genre !== '전체') {
            onTagClick(genre);
        }
    };

    return (
        <div className="px-4 mb-5">
            <div className="grid grid-cols-6 gap-2">
                {genres.map((genre) => (
                    <button
                        key={genre}
                        onClick={() => handleGenreClick(genre)}
                        className={`py-2 rounded-xl text-sm font-medium transition-colors ${selectedGenre === genre
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-black hover:bg-gray-200'
                            }`}
                    >
                        {genre}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryTabs;
