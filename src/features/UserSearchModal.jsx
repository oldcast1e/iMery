import { useState } from 'react';
import { Search, UserPlus, X, UserCheck } from 'lucide-react';
import api from '../api/client';

const UserSearchModal = ({ isOpen, onClose, currentUser }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sentRequests, setSentRequests] = useState([]);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        try {
            const users = await api.searchUsers(query);
            // Filter out self
            const filtered = users.filter(u => u.id !== currentUser.user_id);
            setResults(filtered);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleRequest = async (targetUserId) => {
        try {
            await api.requestFriend(currentUser.user_id, targetUserId);
            setSentRequests(prev => [...prev, targetUserId]);
            alert('친구 요청을 보냈습니다.');
        } catch (error) {
            alert('친구 요청 실패: ' + error.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold">친구 찾기</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full">
                        <X size={20} />
                    </button>
                </div>

                {/* Search Bar */}
                <div className="p-4 bg-gray-50">
                    <div className="flex gap-2">
                        <div className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 flex items-center gap-2">
                            <Search size={18} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="닉네임으로 검색"
                                className="flex-1 outline-none text-sm"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            disabled={loading}
                            className="bg-black text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 disabled:opacity-50"
                        >
                            검색
                        </button>
                    </div>
                </div>

                {/* Results */}
                <div className="h-64 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div></div>
                    ) : results.length === 0 ? (
                        <div className="text-center text-gray-400 py-10 text-sm">검색 결과가 없습니다.</div>
                    ) : (
                        <div className="space-y-4">
                            {results.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl hover:shadow-sm transition-shadow">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                            <span className="font-bold text-gray-500">{user.nickname[0]}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{user.nickname}</p>
                                        </div>
                                    </div>
                                    {sentRequests.includes(user.id) ? (
                                        <button disabled className="text-gray-400 flex items-center gap-1 text-xs font-medium px-3 py-1.5 bg-gray-50 rounded-full">
                                            <UserCheck size={14} /> 요청됨
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleRequest(user.id)}
                                            className="text-white bg-blue-500 hover:bg-blue-600 flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
                                        >
                                            <UserPlus size={14} /> 추가
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserSearchModal;
