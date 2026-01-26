const FolderCard = ({ folder, onFolderClick }) => {
    return (
        <div
            onClick={() => onFolderClick(folder)}
            className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
        >
            {/* Representative Image Background */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"
                style={{
                    backgroundImage: folder.representativeImage
                        ? `url(${folder.representativeImage})`
                        : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            {/* Semi-transparent Overlay */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />

            {/* Folder Info */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                <div className="text-center">
                    <div className="text-4xl mb-2">📁</div>
                    <h3 className="font-bold text-lg text-black mb-1 truncate max-w-full">
                        {folder.name}
                    </h3>
                    <p className="text-sm text-gray-700">
                        {folder.workIds?.length || 0}개의 작품
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FolderCard;
