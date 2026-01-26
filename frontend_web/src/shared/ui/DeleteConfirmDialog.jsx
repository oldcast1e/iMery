import { X, AlertTriangle } from 'lucide-react';

const DeleteConfirmDialog = ({ isOpen, onClose, onConfirm, workTitle }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white rounded-3xl shadow-2xl z-50 overflow-hidden">
                {/* Icon Header */}
                <div className="flex flex-col items-center p-6 bg-red-50">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-3">
                        <AlertTriangle size={32} className="text-red-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">작품 삭제</h2>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-center text-gray-700 mb-2">
                        정말로 이 작품을 삭제하시겠습니까?
                    </p>
                    {workTitle && (
                        <p className="text-center font-semibold text-gray-900 mb-4">
                            "{workTitle}"
                        </p>
                    )}
                    <p className="text-center text-sm text-gray-500">
                        이 작업은 되돌릴 수 없습니다.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                    >
                        삭제
                    </button>
                </div>
            </div>
        </>
    );
};

export default DeleteConfirmDialog;
