import { useState } from 'react';
import { ratingFilters } from '../data/mockData';
import { ArrowDownUp, SortAsc, List, LayoutGrid, Grid2X2, Grid3X3 } from 'lucide-react';

const FilterChips = ({
    selectedRating,
    onRatingChange,
    sortBy,
    onSortChange,
    layout,
    onLayoutChange
}) => {
    const handleSortToggle = () => {
        onSortChange(sortBy === 'latest' ? 'name' : 'latest');
    };

    const handleLayoutCycle = () => {
        const layouts = ['list', 'large', 'medium', 'small'];
        const currentIndex = layouts.indexOf(layout);
        const nextIndex = (currentIndex + 1) % layouts.length;
        onLayoutChange(layouts[nextIndex]);
    };

    const getLayoutIcon = () => {
        switch (layout) {
            case 'list':
                return <List size={20} />;
            case 'large':
                return <LayoutGrid size={20} />;
            case 'medium':
                return <Grid2X2 size={20} />;
            case 'small':
                return <Grid3X3 size={20} />;
            default:
                return <List size={20} />;
        }
    };

    return (
        <div className="mb-6 px-4">
            <div className="flex items-center gap-3">
                {/* Rating Filter Buttons - Full Width */}
                <div className="flex-grow glass rounded-2xl p-1.5 flex gap-1 shadow-sm border border-white/40">
                    {ratingFilters.map((filter) => (
                        <button
                            key={filter}
                            onClick={() => onRatingChange(filter)}
                            className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold tracking-tight transition-all duration-300 ${selectedRating === filter
                                ? 'bg-black text-white shadow-premium scale-[1.02]'
                                : 'bg-transparent text-gray-400 hover:text-black hover:bg-white/50'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Sort Icon Button */}
                <button
                    onClick={handleSortToggle}
                    className="p-3 glass hover:bg-white rounded-2xl shadow-sm border border-white/40 transition-all active:scale-95"
                    title={sortBy === 'latest' ? '최신순' : '이름순'}
                >
                    {sortBy === 'latest' ? <ArrowDownUp size={18} className="text-gray-600" /> : <SortAsc size={18} className="text-gray-600" />}
                </button>

                {/* Layout Icon Button */}
                <button
                    onClick={handleLayoutCycle}
                    className="p-3 glass hover:bg-white rounded-2xl shadow-sm border border-white/40 transition-all active:scale-95"
                    title={`레이아웃: ${layout}`}
                >
                    <div className="text-gray-600">{getLayoutIcon()}</div>
                </button>
            </div>
        </div>
    );
};

export default FilterChips;
