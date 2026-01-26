import { Home, Grid3x3, Archive, User, Plus } from 'lucide-react';

const BottomNav = ({ onToast, activeView, onViewChange, onUploadClick, language }) => {
    const isKo = language !== 'EN';
    const navItems = [
        { id: 'home', label: isKo ? '홈' : 'Home', icon: Home },
        { id: 'works', label: isKo ? '작품' : 'Works', icon: Grid3x3 },
        { id: 'add', label: isKo ? '추가' : 'Add', icon: Plus, isAction: true }, // Special Action Item
        { id: 'archive', label: isKo ? '아카이브' : 'Archive', icon: Archive },
        { id: 'my', label: isKo ? '마이' : 'My', icon: User },
    ];

    const handleNavClick = (item) => {
        if (item.isAction) {
            onUploadClick && onUploadClick();
        } else {
            onViewChange(item.id);
        }
    };

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg">
            <div className="bg-white shadow-apple rounded-full px-6 flex justify-between items-center relative border border-gray-100 h-[72px]">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;

                    if (item.isAction) {
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item)}
                                className="flex flex-col items-center justify-center"
                            >
                                <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white shadow-premium hover:scale-110 active:scale-95 transition-all duration-300">
                                    <Plus size={30} strokeWidth={2.5} />
                                </div>
                            </button>
                        );
                    }

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item)}
                            className="group flex flex-col items-center justify-center gap-0.5 min-w-[50px] h-full transition-all duration-300 active:scale-90"
                        >
                            <div className={`p-3 rounded-2xl transition-all duration-300 
                                ${isActive
                                    ? 'bg-black text-white shadow-premium scale-110'
                                    : 'text-gray-400 opacity-60 group-hover:opacity-100 group-hover:bg-gray-100 group-hover:text-black'
                                }`}>
                                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNav;
