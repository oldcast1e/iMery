import { useState } from 'react';
import api from '../api/client';
import logo from '../assets/iMery_Log_Main_1.png';

const SignupView = ({ onSignupSuccess, onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        username: '', // Email
        password: '',
        nickname: ''
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await api.signup(formData.username, formData.password, formData.nickname);
            alert('회원가입이 완료되었습니다! 로그인해주세요.');
            onSignupSuccess();
        } catch (err) {
            setError(err.message || '회원가입에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8 flex flex-col items-center">
                    <img src={logo} alt="iMery Icon" className="w-12 h-12 object-contain mb-2" />
                    <h1 className="text-3xl font-bold mb-2">회원가입</h1>
                    <p className="text-gray-500">iMery의 회원이 되어보세요</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                        <input
                            type="email"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="example@email.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">닉네임</label>
                        <input
                            type="text"
                            value={formData.nickname}
                            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="사용할 닉네임을 입력하세요"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400 mt-2"
                    >
                        {isLoading ? '가입 중...' : '가입하기'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm">
                        이미 계정이 있으신가요?{' '}
                        <button
                            onClick={onSwitchToLogin}
                            className="text-black font-semibold hover:underline"
                        >
                            로그인
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupView;
