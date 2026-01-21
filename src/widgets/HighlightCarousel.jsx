import { ChevronRight } from 'lucide-react';

const HighlightCarousel = ({ works = [], onWorkClick, onMoreClick }) => {
    // Show only the 5 most recent works
    const recentWorks = works.slice(0, 5);

    return (
        <section className="mb-6">
            {/* Section Header */}
            <div className="flex items-baseline gap-2 mb-4 px-4 font-serif">
                <h2 className="text-2xl font-bold">저장된 작품</h2>
                <span className="text-sm text-gray-500 font-sans">목록</span>
            </div>

            {/* Carousel */}
            <div className="overflow-x-auto horizontal-scroll px-4">
                <div className="flex gap-3" style={{ width: 'max-content' }}>
                    {recentWorks.map((work) => (
                        <div
                            key={work.id}
                            onClick={() => onWorkClick(work)}
                            className="relative w-40 h-40 rounded-2xl overflow-hidden flex-shrink-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                        >
                            {/* Background Image */}
                            <img
                                src={work.thumbnail || work.image}
                                alt={work.title}
                                className="w-full h-full object-cover"
                            />

                            {/* [UI CHANGE] Tightened spacing and Butler font application */}
                            <div className="absolute bottom-1.5 left-1.5 right-1.5">
                                {/* [UI CHANGE] Minimized vertical padding (py-1) to make the background stick closely to the text */}
                                <div className="bg-white/60 backdrop-blur-md py-1 px-1.5 rounded-xl shadow-sm border border-white/20">
                                    {/* [UI CHANGE] Removed top padding (pt-0) and bottom margin (mb-0.5) for max tightness */}
                                    <div
                                        className="bg-black text-white inline-block px-0.5 pt-0 pb-0.5 mb-0.5 shadow-sm"
                                        style={{
                                            clipPath: 'polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)',
                                            paddingRight: '8px'
                                        }}
                                    >
                                        {/* [UI CHANGE] font-serif now uses 'Butler' font as configured in tailwind.config.js */}
                                        <p className="text-[7px] font-serif font-bold tracking-tight leading-none">{work.genre || '그림'}</p>
                                    </div>
                                    {/* [UI CHANGE] Reduced text size to 12px and tightened leading for a compact look */}
                                    <p className="text-xs font-serif font-bold text-black truncate leading-none">
                                        {work.title}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* More Button */}
                    {works.length > 5 && (
                        <div
                            onClick={onMoreClick}
                            className="w-40 h-40 rounded-2xl bg-gray-100 flex-shrink-0 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-200 transition-colors"
                        >
                            <ChevronRight size={32} className="text-gray-600" />
                            <p className="font-semibold text-gray-700">더보기</p>
                            <p className="text-xs text-gray-500">{works.length - 5}개 더 보기</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default HighlightCarousel;
