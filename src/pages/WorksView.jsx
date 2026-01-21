import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import FolderCard from '../entities/FolderCard';
import FolderCreationDialog from '../features/FolderCreationDialog';

const WorksView = ({ works, folders, setFolders, onWorkClick, onEditClick, onDeleteClick, bookmarkedIds = [] }) => {
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);

    const handleSaveFolder = (newFolder) => {
        setFolders([...folders, newFolder]);
    };

    const handleFolderClick = (folder) => {
        setSelectedFolder(folder);
    };

    // Get works for current folder
    const displayedWorks = selectedFolder
        ? works.filter(work => selectedFolder.workIds?.includes(work.id))
        : works;

    // Bookmarked works
    const bookmarkedWorks = works.filter(work => bookmarkedIds.includes(work.id));

    if (selectedFolder) {
        // Show folder contents
        return (
            <div className="px-4">
                {/* Back to folders */}
                <button
                    onClick={() => setSelectedFolder(null)}
                    className="mb-6 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-black rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                >
                    ← 폴더로 돌아가기
                </button>

                <h2 className="text-2xl font-bold mb-6">{selectedFolder.name}</h2>

                {/* Grid Layout */}
                <div className="grid grid-cols-2 gap-4 pb-6">
                    {displayedWorks.map((work) => (
                        <div key={work.id} className="relative">
                            <div
                                onClick={() => onWorkClick && onWorkClick(work)}
                                className="relative aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                            >
                                <img
                                    src={work.thumbnail}
                                    alt={work.title}
                                    className="w-full h-full object-cover"
                                />

                                {/* Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 glass-overlay p-3">
                                    <p className="text-sm font-bold text-black truncate">{work.title}</p>
                                    <p className="text-[10px] text-gray-700 truncate">{work.artist} • {work.date}</p>

                                    {/* Tags Display */}
                                    {work.tags && work.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                            {work.tags.map((tag, idx) => {
                                                const label = typeof tag === 'object' ? tag.label : tag;
                                                const id = typeof tag === 'object' ? tag.id : `old-${idx}`;
                                                return (
                                                    <span key={id} className="px-1.5 py-0.5 bg-white/60 text-gray-600 rounded-[4px] text-[8px] font-bold border border-white/40">
                                                        {label}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Overlay Edit/Delete Buttons */}
                            {(onEditClick || onDeleteClick) && (
                                <div className="absolute top-2 right-2 flex gap-1 z-10">
                                    {onEditClick && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onEditClick(work); }}
                                            className="p-1.5 bg-black/50 hover:bg-black text-white rounded-full backdrop-blur-sm transition-colors"
                                        >
                                            <Edit2 size={12} />
                                        </button>
                                    )}
                                    {onDeleteClick && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDeleteClick(work); }}
                                            className="p-1.5 bg-white/80 hover:bg-white text-red-500 rounded-full backdrop-blur-sm transition-colors"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                    ))}
                </div>
            </div >
        );
    }

    // Show folder list
    return (
        <div className="px-4">
            <h2 className="text-2xl font-bold mb-6">작품 폴더</h2>

            {/* Folder Grid */}
            <div className="grid grid-cols-2 gap-4 pb-6">
                {/* All Works Folder */}
                <div
                    onClick={() => handleFolderClick({ name: '전체 작품', workIds: works.map(w => w.id) })}
                    className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-100 to-purple-100"
                >
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <div className="text-center">
                            <div className="text-4xl mb-2">🎨</div>
                            <h3 className="font-bold text-lg text-black mb-1">전체 작품</h3>
                            <p className="text-sm text-gray-700">{works.length}개의 작품</p>
                        </div>
                    </div>
                </div>

                {/* Bookmarks Folder */}
                <div
                    onClick={() => handleFolderClick({ name: '북마크', workIds: bookmarkedIds })}
                    className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow bg-gradient-to-br from-yellow-100 to-orange-100"
                >
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                        <div className="text-center">
                            <div className="text-4xl mb-2">🔖</div>
                            <h3 className="font-bold text-lg text-black mb-1">북마크</h3>
                            <p className="text-sm text-gray-700">{bookmarkedWorks.length}개의 작품</p>
                        </div>
                    </div>
                </div>

                {/* Custom Folders */}
                {folders.map((folder) => (
                    <FolderCard
                        key={folder.id}
                        folder={folder}
                        onFolderClick={handleFolderClick}
                    />
                ))}

                {/* New Folder Button */}
                <div
                    onClick={() => setIsCreatingFolder(true)}
                    className="relative aspect-square rounded-2xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center justify-center"
                >
                    <div className="text-center">
                        <Plus size={32} className="mx-auto mb-2 text-gray-400" />
                        <p className="font-semibold text-gray-600">새 폴더</p>
                    </div>
                </div>
            </div>

            {/* Folder Creation Dialog */}
            <FolderCreationDialog
                isOpen={isCreatingFolder}
                onClose={() => setIsCreatingFolder(false)}
                works={works}
                onSave={handleSaveFolder}
            />
        </div>
    );
};

export default WorksView;
