import { useState } from 'react';
import { X, Lock, Trash2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/client';

export default function SettingsModal({ isOpen, onClose, user, onLogout }) {
    const [activeTab, setActiveTab] = useState('password'); // password, delete
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden"
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                    <h2 className="font-serif font-bold text-lg">계정 설정</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('password')}
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === 'password' ? 'text-black border-b-2 border-black' : 'text-gray-400'}`}
                    >
                        비밀번호 변경
                    </button>
                    <button
                        onClick={() => setActiveTab('delete')}
                        className={`flex-1 py-3 text-sm font-medium ${activeTab === 'delete' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-400'}`}
                    >
                        계정 삭제
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'password' && <ChangePasswordForm user={user} onClose={onClose} />}
                    {activeTab === 'delete' && <DeleteAccountForm user={user} onLogout={onLogout} />}
                </div>
            </motion.div>
        </div>
    );
}

function ChangePasswordForm({ user, onClose }) {
    const [currentPass, setCurrentPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [showPass, setShowPass] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPass !== confirmPass) {
            alert("새 비밀번호가 일치하지 않습니다.");
            return;
        }
        try {
            // Assuming api.updateProfile logic handles password or separate endpoint
            // We didn't add updatePassword to client.js but we verified backend has PUT /users/password
            // Let's add inline fetch or assume client.updatePassword exists (it doesn't yet).
            // We'll use raw fetch here or add to client.js properly in next step.
            // For now, raw fetch to keep this file self-contained or use client.js if we add it.
            // Strategy: I will add updatePassword to client.js in next step.
            await api.updatePassword(user.user_id, currentPass, newPass);
            alert("비밀번호가 변경되었습니다.");
            onClose();
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">현재 비밀번호</label>
                <div className="relative">
                    <input
                        type={showPass ? "text" : "password"}
                        value={currentPass} onChange={e => setCurrentPass(e.target.value)}
                        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                        required
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">새 비밀번호</label>
                <input
                    type={showPass ? "text" : "password"}
                    value={newPass} onChange={e => setNewPass(e.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">새 비밀번호 확인</label>
                <input
                    type={showPass ? "text" : "password"}
                    value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-black"
                    required
                />
            </div>

            <div className="flex items-center gap-2 mb-4">
                <input type="checkbox" id="showPass" checked={showPass} onChange={e => setShowPass(e.target.checked)} />
                <label htmlFor="showPass" className="text-xs text-gray-500 select-none">비밀번호 표시</label>
            </div>

            <button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-medium text-sm">
                변경하기
            </button>
        </form>
    );
}

function DeleteAccountForm({ user, onLogout }) {
    const [confirm, setConfirm] = useState('');

    const handleDelete = async () => {
        if (confirm !== user.nickname) return;
        if (!window.confirm("정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) return;

        try {
            await api.deleteAccount(user.user_id);
            alert("탈퇴가 완료되었습니다.");
            onLogout();
        } catch (e) {
            alert(e.message);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-red-50 p-4 rounded-xl flex gap-3 items-start">
                <AlertTriangle className="text-red-500 shrink-0" size={20} />
                <div>
                    <h4 className="text-sm font-bold text-red-700">주의사항</h4>
                    <p className="text-xs text-red-600 mt-1">
                        계정을 삭제하면 모든 기록(작품, 댓글, 북마크)이 영구적으로 삭제됩니다.
                    </p>
                </div>
            </div>

            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                    확인을 위해 닉네임 <strong>{user.nickname}</strong>을(를) 입력하세요.
                </label>
                <input
                    type="text"
                    value={confirm} onChange={e => setConfirm(e.target.value)}
                    placeholder={user.nickname}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500"
                />
            </div>

            <button
                onClick={handleDelete}
                disabled={confirm !== user.nickname}
                className="w-full bg-red-500 disabled:bg-gray-300 text-white py-3 rounded-xl font-medium text-sm transition-colors"
            >
                계정 삭제
            </button>
        </div>
    );
}
