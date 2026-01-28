import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '@services/api';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../../constants/designSystem';

export default function SignupScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (!email || !password || !nickname) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await api.register(email, password, nickname);
            Alert.alert('Success', 'Account created! Please log in.', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert('Signup Failed', 'Could not create account. Try a different email/nickname.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, backgroundColor: 'white' }}
        >
            <View style={{ flex: 1, padding: 24, paddingTop: insets.top }}>
                <TouchableOpacity onPress={() => router.back()} className="mb-8">
                    <ArrowLeft color={colors.primary} size={24} />
                </TouchableOpacity>

                <Text className="text-3xl font-bold text-gray-900 mb-2">Create Account</Text>
                <Text className="text-gray-500 mb-8">Sign up to start archiving your art journey.</Text>

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
                        <Text className="text-gray-700 mb-1 ml-1">Nickname</Text>
                        <TextInput
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-base"
                            placeholder="Vincent"
                            value={nickname}
                            onChangeText={setNickname}
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
                        onPress={handleSignup}
                        disabled={loading}
                        className={`w-full bg-main rounded-xl p-4 items-center mt-4 ${loading ? 'opacity-70' : ''}`}
                    >
                        <Text className="text-white font-bold text-lg">
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row justify-center mt-8">
                    <Text className="text-gray-500">Already have an account? </Text>
                    <Link href="/(auth)/login" asChild>
                        <TouchableOpacity>
                            <Text className="text-main font-bold">Log In</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
