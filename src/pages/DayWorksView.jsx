import { ArrowLeft } from 'lucide-react';
import WorksList from '../widgets/WorksList';
import { useMemo } from 'react';

const DayWorksView = ({ date, works, onBack, onWorkClick, onLikeToggle, bookmarkedIds, onBookmarkToggle }) => {

    const dayWorks = useMemo(() => {
        if (!date) return [];
        return works.filter(w => {
            // Normalize date strings: '2023-10-25' or '2023.10.25'
            const workDate = (w.work_date || w.date || '').replace(/\./g, '-');
            const targetDate = date.replace(/\./g, '-');
            return workDate.startsWith(targetDate);
        });
    }, [works, date]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-serif font-bold pt-1">{date}</h2>
            </div>

            <div className="p-4">
                <div className="flex justify-between items-center mb-4 px-2">
                    <span className="text-sm font-medium text-gray-500">
                        총 <span className="text-black font-bold">{dayWorks.length}</span>개의 작품
                    </span>
                </div>

                {dayWorks.length > 0 ? (
                    <WorksList
                        works={dayWorks}
                        onWorkClick={onWorkClick}
                        onLikeToggle={onLikeToggle}
                        bookmarkedIds={bookmarkedIds}
                        onBookmarkToggle={onBookmarkToggle}
                        layout="list"
                    />
                ) : (
                    <div className="text-center py-20 text-gray-400">
                        기록된 작품이 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DayWorksView;
