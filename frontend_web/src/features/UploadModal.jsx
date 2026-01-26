import { useState } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';

const UploadModal = ({ isOpen, onClose, onImageSelected }) => {
    const [previewImage, setPreviewImage] = useState(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
                onImageSelected(reader.result, file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClose = () => {
        setPreviewImage(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-md px-4 pb-24">
            <div className="w-full max-w-lg bg-white shadow-apple rounded-[2.5rem] p-8 animate-fade-in-up border border-gray-100">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-serif font-bold tracking-tight">작품 등록</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 glass hover:bg-white rounded-full transition-all active:scale-90 shadow-sm border border-white/20"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Preview */}
                {previewImage && (
                    <div className="mb-8 rounded-3xl overflow-hidden shadow-premium border-2 border-white">
                        <img
                            src={previewImage}
                            alt="Preview"
                            className="w-full h-48 object-cover translate-z-0"
                        />
                    </div>
                )}

                {/* Upload Options */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Camera */}
                    <label className="relative flex flex-col items-center justify-center p-6 bg-white/50 rounded-3xl border border-white/40 hover:bg-white hover:shadow-premium transition-all cursor-pointer group active:scale-95">
                        <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center mb-3 shadow-premium group-hover:scale-110 transition-transform">
                            <Camera size={24} />
                        </div>
                        <span className="text-xs font-bold text-gray-800">카메라</span>
                        <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </label>

                    {/* Gallery */}
                    <label className="relative flex flex-col items-center justify-center p-6 bg-white/50 rounded-3xl border border-white/40 hover:bg-white hover:shadow-premium transition-all cursor-pointer group active:scale-95">
                        <div className="w-12 h-12 bg-blue-500 text-white rounded-2xl flex items-center justify-center mb-3 shadow-premium group-hover:scale-110 transition-transform">
                            <ImageIcon size={24} />
                        </div>
                        <span className="text-xs font-bold text-gray-800">갤러리</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default UploadModal;
