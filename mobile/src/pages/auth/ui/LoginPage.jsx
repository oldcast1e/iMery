import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../../shared/api/client';
import useUserStore from '../../../entities/user/model/useUserStore';

export default function LoginPage() {
    const router = useRouter();
    const { setUser } = useUserStore();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!formData.username || !formData.password) {
            Alert.alert('오류', '아이디와 비밀번호를 입력해주세요.');
            return;
        }

        setIsLoading(true);
        try {
            const data = await api.login(formData.username, formData.password);
            setUser(data);
            // Redirect handled by Root Layout
        } catch (error) {
            console.error('Login error:', error);
            const errorMsg = error.response?.data?.detail || error.response?.data?.error || '로그인에 실패했습니다.';
            Alert.alert('로그인 실패', errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-1 items-center justify-center px-6">
                <View className="w-full max-w-sm">
                    <View className="mb-10 items-center">
                        <Text className="text-5xl font-bold mb-3 text-black tracking-tight italic">iMery</Text>
                        <Text className="text-gray-400 text-lg font-medium">당신의 감각을 기록하세요</Text>
                    </View>

                    <View className="gap-y-4">
                        <TextInput
                            className="w-full h-14 px-4 bg-gray-50 border border-gray-100 rounded-2xl text-base text-black"
                            placeholder="이메일 (ID)"
                            placeholderTextColor="#9CA3AF"
                            value={formData.username}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, username: text }))}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        <TextInput
                            className="w-full h-14 px-4 bg-gray-50 border border-gray-100 rounded-2xl text-base text-black"
                            placeholder="비밀번호"
                            placeholderTextColor="#9CA3AF"
                            value={formData.password}
                            onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                            secureTextEntry
                        />

                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={isLoading}
                            activeOpacity={0.8}
                            className={`w-full h-14 rounded-2xl items-center justify-center mt-4 shadow-sm ${isLoading ? 'bg-gray-800' : 'bg-black'}`}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">로그인</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    <View className="mt-10 flex-row justify-center items-center">
                        <Text className="text-gray-400">아직 계정이 없으신가요? </Text>
                        <TouchableOpacity onPress={() => router.push('/(auth)/signup')} activeOpacity={0.7}>
                            <Text className="text-black font-bold border-b border-black">회원가입</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
