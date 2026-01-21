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

                            {/* [UI CHANGE] Wrap content with w-fit for a background that 'hugs' the text */}
                            <div className="absolute bottom-1.5 left-0 right-0 flex justify-center px-2">
                                <div className="bg-white/60 backdrop-blur-md px-2 py-1 rounded-xl shadow-sm border border-white/20 w-fit max-w-full">
                                    {/* Tag: Minimal spacing (mb-0.5) */}
                                    <div
                                        className="bg-black text-white inline-block px-1 py-0.5 mb-0.5 shadow-sm"
                                        style={{
                                            clipPath: 'polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)',
                                            paddingRight: '8px'
                                        }}
                                    >
                                        <p className="text-[7px] font-serif font-bold tracking-tight leading-none">{work.genre || '그림'}</p>
                                    </div>
                                    {/* Title: tight leading and font size */}
                                    <p className="text-[11px] font-serif font-bold text-black truncate leading-none">
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
