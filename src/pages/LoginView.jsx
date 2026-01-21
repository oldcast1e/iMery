import { useState } from 'react';
import logo from '../assets/iMery_Log_Main_3.png';

const LoginView = ({ onLogin, onSwitchToSignup }) => {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await onLogin(formData.username, formData.password);
        } catch (err) {
            setError(err.message || '로그인에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <div className="text-center mb-8 flex flex-col items-center">
                    <img src={logo} alt="iMery Icon" className="w-14 h-14 object-contain mb-3" />
                    <h1 className="text-4xl font-serif font-bold mb-2">iMery</h1>
                    <p className="text-gray-500">당신의 감각을 기록하세요</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="이메일 (ID)"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="비밀번호"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                    >
                        {isLoading ? '로그인 중...' : '로그인'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-500 text-sm">
                        아직 계정이 없으신가요?{' '}
                        <button
                            onClick={onSwitchToSignup}
                            className="text-black font-semibold hover:underline"
                        >
                            회원가입
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginView;
