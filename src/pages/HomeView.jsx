import HighlightCarousel from '../widgets/HighlightCarousel';
import CategoryTabs from '../entities/CategoryTabs';
import ActionBar from '../entities/ActionBar';
import FilterChips from '../entities/FilterChips';
import WorksList from '../widgets/WorksList';
import { useMemo, useState } from 'react';

const HomeView = ({
    works,
    onUploadClick,
    onWorkClick,
    onTagClick,
    onEditClick,
    onDeleteClick,
    bookmarkedIds,
    onBookmarkToggle,
    selectedRating,
    onRatingChange,
    sortBy,
    onSortChange,
    layout,
    onLayoutChange,
    selectedCategory,
    onCategoryChange,
    onViewChange,
    onNavigateBookmark // New Prop
}) => {
    const [searchQuery, setSearchQuery] = useState(''); // Local search state
    const [visibleCount, setVisibleCount] = useState(5); // Local pagination

    const handleMoreClick = () => {
        if (onViewChange) {
            onViewChange('works');
            // Optimal "Drag Up" effect
            setTimeout(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 100);
        }
    };

    // Filter and sort works
    const processedWorks = useMemo(() => {
        let filtered = works;

        // Search Filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(w =>
                w.title.toLowerCase().includes(query) ||
                w.artist.toLowerCase().includes(query) ||
                (w.category && w.category.toLowerCase().includes(query)) ||
                (w.tags && w.tags.some(t => t.toLowerCase().includes(query)))
            );
        }

        // Filter by rating
        if (selectedRating !== 'All') {
            filtered = filtered.filter(work => {
                const ratingNum = parseInt(selectedRating.replace('★', ''));
                return work.rating === ratingNum;
            });
        }

        // Category Filter
        if (selectedCategory !== '전체') {
            filtered = filtered.filter(w => w.category === selectedCategory);
        }

        // Sort
        if (sortBy === 'latest') {
            filtered = [...filtered].sort((a, b) => {
                // Use created_at for strict upload time sorting (Latest first)
                // Fallback to ID if created_at is missing for some reason
                if (a.created_at && b.created_at) {
                    return new Date(b.created_at) - new Date(a.created_at);
                }
                return b.id - a.id;
            });
        } else if (sortBy === 'name') {
            filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
        }

        return filtered;
    }, [works, selectedRating, sortBy, searchQuery, selectedCategory]);

    const displayWorks = useMemo(() => {
        if (layout === 'list') {
            return processedWorks.slice(0, visibleCount);
        }
        return processedWorks;
    }, [processedWorks, layout, visibleCount]);

    const handleSeeMore = () => {
        if (onViewChange) {
            onViewChange('works');

            // "Drag Up" effect: Immediate scroll to bottom then smooth scroll to top
            // This creates a sense of the list being pulled up
            const scrollToTop = () => {
                const duration = 800;
                const start = window.pageYOffset;
                const startTime = performance.now();

                const easeOutQuart = (t) => 1 - (--t) * t * t * t;

                const animate = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const easedProgress = easeOutQuart(progress);

                    window.scrollTo(0, start * (1 - easedProgress));

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    }
                };

                requestAnimationFrame(animate);
            };

            // Delay slightly to allow view change state to propagate
            setTimeout(scrollToTop, 10);
        }
    };

    return (
        <>
            {/* Highlight Carousel */}
            <HighlightCarousel
                works={works}
                onWorkClick={onWorkClick}
                onMoreClick={handleMoreClick}
            />

            {/* Category Tabs */}
            <CategoryTabs
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
                onTagClick={onTagClick}
            />

            {/* Divider */}
            <div className="border-t border-gray-200 my-6"></div>

            {/* Action Bar */}
            <ActionBar
                onUploadClick={onUploadClick}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onBookmarkClick={onNavigateBookmark}
            />

            {/* Filter Chips */}
            <FilterChips
                selectedRating={selectedRating}
                onRatingChange={onRatingChange}
                sortBy={sortBy}
                onSortChange={onSortChange}
                layout={layout}
                onLayoutChange={onLayoutChange}
            />

            {/* Stored Works Header (Navigation) */}
            <div className="flex justify-between items-center px-5 mb-4 mt-2">
                <h2 className="text-xl font-bold font-serif tracking-tight text-gray-900">저장된 작품</h2>
                <button
                    onClick={handleSeeMore}
                    className="text-xs font-bold text-gray-400 hover:text-black flex items-center gap-0.5 transition-colors group"
                >
                    더보기
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right group-hover:translate-x-0.5 transition-transform"><path d="m9 18 6-6-6-6"></path></svg>
                </button>
            </div>

            {/* Works List */}
            <WorksList
                works={displayWorks}
                onWorkClick={onWorkClick}
                onTagClick={onTagClick}
                onEditClick={onEditClick}
                onDeleteClick={onDeleteClick}
                bookmarkedIds={bookmarkedIds}
                onBookmarkToggle={onBookmarkToggle}
                layout={layout}
                showPagination={false} // Managed locally in HomeView
            />

            {/* Local Pagination See More Button */}
            {layout === 'list' && processedWorks.length > visibleCount && (
                <div className="mt-8 mb-12 flex justify-center px-4">
                    <button
                        onClick={() => setVisibleCount(prev => Math.min(prev + 5, processedWorks.length))}
                        className="w-full py-4 bg-white border border-gray-100 rounded-2xl shadow-apple hover:shadow-premium transition-all active:scale-95 flex items-center justify-center gap-2 group text-gray-700 font-bold"
                    >
                        <span>더보기</span>
                        <span className="text-xs font-medium text-gray-400 group-hover:text-black transition-colors">
                            {processedWorks.length - visibleCount}개 더 보기
                        </span>
                    </button>
                </div>
            )}
        </>
    );
};

export default HomeView;
