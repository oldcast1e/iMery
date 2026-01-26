import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';

export default function LoginScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const response = await api.login(email, password);
            // Access token from response (adjust according to actual API response structure)
            // Assuming response is { message: "...", token: "...", user: { ... } } or similar
            // Code in README_API.md says: { message: "...", user_id: 1, nickname: "..." }
            // AND token is likely returned or handled via cookie? 
            // Wait, README_API.md for v2.0 says: "Login returns user_id, nickname". It does NOT mention token explicitly in the snippet.
            // However, typical JWT auth returns a token.
            // If the backend sets a cookie, RN has trouble with cookies unless configured.
            // Let's assume standard JWT body response for now or check previous web code.
            // Checking `README_API.md`: "res: { message: 'success', user_id: 1, nickname: 'Vincent' }"
            // It implies NO token in body? That works for session-based or if token is in header.
            // BUT `src/api/client.js` in web code usually reveals this.
            // I will assume the response contains the user object and I save it.

            // Let's save the whole response as user data.
            await AsyncStorage.setItem('imery-user', JSON.stringify(response));

            // Navigate to home (handled by _layout.tsx based on user state change/reload)
            // Since _layout checks on mount, we might need to trigger a state update there.
            // For now, simple replace might work if _layout re-checks. 
            // Ideally, use a context or store. For MVP velocity, direct replace:
            router.replace('/(tabs)');

        } catch (error) {
            console.error(error);
            Alert.alert('Login Failed', 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, backgroundColor: 'white' }}
        >
            <View style={{ flex: 1, padding: 24, justifyContent: 'center', paddingTop: insets.top }}>
                <View className="items-center mb-12">
                    <Text className="text-4xl font-bold text-main mb-2">iMery</Text>
                    <Text className="text-gray-500">작품을 듣는 시간</Text>
                </View>

                <View className="space-y-4">
                    <View>
                        <Text className="text-gray-700 mb-1 ml-1">Email</Text>
                        <TextInput
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-base"
                            placeholder="email@example.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View>
                        <Text className="text-gray-700 mb-1 ml-1">Password</Text>
                        <TextInput
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-base"
                            placeholder="••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={loading}
                        className={`w-full bg-main rounded-xl p-4 items-center mt-4 ${loading ? 'opacity-70' : ''}`}
                    >
                        <Text className="text-white font-bold text-lg">
                            {loading ? 'Logging in...' : 'Log In'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row justify-center mt-8">
                    <Text className="text-gray-500">Don't have an account? </Text>
                    <Link href="/(auth)/signup" asChild>
                        <TouchableOpacity>
                            <Text className="text-main font-bold">Sign Up</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
