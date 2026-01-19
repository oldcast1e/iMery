import { useState } from 'react';
import { X } from 'lucide-react';

const FolderCreationDialog = ({ isOpen, onClose, works, onSave }) => {
    const [folderName, setFolderName] = useState('');
    const [selectedWorkIds, setSelectedWorkIds] = useState([]);
    const [representativeImage, setRepresentativeImage] = useState('');

    if (!isOpen) return null;

    const handleToggleWork = (workId) => {
        setSelectedWorkIds(prev =>
            prev.includes(workId)
                ? prev.filter(id => id !== workId)
                : [...prev, workId]
        );
    };

    const handleSave = () => {
        if (!folderName.trim()) {
            alert('폴더 이름을 입력해주세요.');
            return;
        }

        const selectedWorks = works.filter(w => selectedWorkIds.includes(w.id));
        const repImage = representativeImage || (selectedWorks.length > 0 ? selectedWorks[0].thumbnail : '');

        onSave({
            id: Date.now(),
            name: folderName,
            workIds: selectedWorkIds,
            representativeImage: repImage,
            createdAt: new Date().toISOString(),
        });

        // Reset form
        setFolderName('');
        setSelectedWorkIds([]);
        setRepresentativeImage('');
        onClose();
    };

    const selectedWorks = works.filter(w => selectedWorkIds.includes(w.id));

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-lg mx-auto bg-white rounded-3xl shadow-2xl z-50 max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold">새 폴더 만들기</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {/* Folder Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            폴더 이름
                        </label>
                        <input
                            type="text"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            placeholder="예: 좋아하는 작품들"
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                        />
                    </div>

                    {/* Work Selection */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            작품 선택 ({selectedWorkIds.length}개 선택됨)
                        </label>
                        <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-2">
                            {works.map((work) => (
                                <label
                                    key={work.id}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedWorkIds.includes(work.id)}
                                        onChange={() => handleToggleWork(work.id)}
                                        className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black"
                                    />
                                    <img
                                        src={work.thumbnail}
                                        alt={work.title}
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                    <div className="flex-grow min-w-0">
                                        <p className="font-medium text-sm truncate">{work.title}</p>
                                        <p className="text-xs text-gray-500">{work.date}</p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Representative Image Selection */}
                    {selectedWorks.length > 0 && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                대표 이미지 선택
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {selectedWorks.map((work) => (
                                    <div
                                        key={work.id}
                                        onClick={() => setRepresentativeImage(work.thumbnail)}
                                        className={`relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all ${(representativeImage === work.thumbnail || (!representativeImage && work.id === selectedWorks[0].id))
                                                ? 'ring-4 ring-black'
                                                : 'hover:opacity-80'
                                            }`}
                                    >
                                        <img
                                            src={work.thumbnail}
                                            alt={work.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
                    >
                        생성
                    </button>
                </div>
            </div>
        </>
    );
};

export default FolderCreationDialog;
