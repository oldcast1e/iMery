import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../../../shared/api/client';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ username: '', password: '', nickname: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async () => {
        if (!formData.username || !formData.password || !formData.nickname) {
            Alert.alert('오류', '모든 정보를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            await api.signup(formData.username, formData.password, formData.nickname);
            Alert.alert('가입 성공', '회원가입이 완료되었습니다! 로그인해주세요.', [
                { text: '확인', onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert('가입 실패', error.response?.data?.detail || '회원가입에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white items-center justify-center px-6">
            <View className="w-full max-w-sm">
                <View className="mb-10 items-center">
                    <Text className="text-3xl font-bold mb-2 text-black">회원가입</Text>
                    <Text className="text-gray-500 text-lg">iMery의 회원이 되어보세요</Text>
                </View>

                <View className="space-y-4">
                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">이메일</Text>
                        <TextInput
                            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-base"
                            placeholder="example@email.com"
                            value={formData.username}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">비밀번호</Text>
                        <TextInput
                            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-base"
                            placeholder="비밀번호"
                            value={formData.password}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                            secureTextEntry
                        />
                    </View>

                    <View>
                        <Text className="text-sm font-medium text-gray-700 mb-1 ml-1">닉네임</Text>
                        <TextInput
                            className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-base"
                            placeholder="닉네임"
                            value={formData.nickname}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, nickname: text }))}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleSignup}
                        disabled={isLoading}
                        className={`w-full py-4 rounded-xl items-center mt-6 ${isLoading ? 'bg-gray-400' : 'bg-black'}`}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">가입하기</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View className="mt-8 flex-row justify-center">
                    <Text className="text-gray-500">이미 계정이 있으신가요? </Text>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text className="text-black font-bold">로그인</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
