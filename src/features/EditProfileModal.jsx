import { useState } from 'react';
import { X, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/client';

export default function EditProfileModal({ isOpen, onClose, user, currentBio, onUpdateSuccess }) {
    const [bio, setBio] = useState(currentBio || '');
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('user_id', user.user_id);
            formData.append('bio', bio);
            if (imageFile) {
                formData.append('image', imageFile);
            }

            await api.updateProfile(user.user_id, formData);
            onUpdateSuccess();
            onClose();
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white rounded-2xl w-full max-w-sm shadow-xl p-6"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-serif font-bold text-xl">프로필 수정</h2>
                    <button onClick={onClose}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Image Upload */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-2 border-white shadow-md">
                                <img
                                    src={preview || user.profile_image_url || `https://ui-avatars.com/api/?name=${user.nickname}`}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <label className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-gray-800 transition-colors">
                                <Camera size={16} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>

                    {/* Bio Input */}
                    <div>
                        <label className="block text-sm font-bold mb-2">한줄 소개</label>
                        <textarea
                            value={bio}
                            onChange={e => setBio(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none h-24"
                            placeholder="자신을 표현해보세요."
                        />
                    </div>

                    <button type="submit" className="w-full bg-black text-white py-3.5 rounded-xl font-bold">
                        저장하기
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
