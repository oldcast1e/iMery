import { Search, Bookmark, Plus } from 'lucide-react';

const ActionBar = ({ onUploadClick, searchQuery, onSearchChange, onBookmarkClick }) => {
    return (
        <div className="flex items-center gap-3 mb-5 px-4">
            {/* Search Input */}
            <div className="flex-grow relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    value={searchQuery || ''}
                    onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                    placeholder="Search works..."
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all text-sm font-medium"
                />
            </div>

            {/* Bookmark Button */}
            <button
                onClick={onBookmarkClick}
                className="p-3 bg-gray-50 border border-gray-200 rounded-2xl hover:bg-gray-100 transition-colors"
            >
                <Bookmark size={20} />
            </button>
        </div>
    );
};

export default ActionBar;
