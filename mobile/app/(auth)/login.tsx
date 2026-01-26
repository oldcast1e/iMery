import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Image, StyleSheet } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { useAuthStore } from '../../stores/authStore';

export default function LoginScreen() {
    const { login } = useAuthStore();
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
             // Store handles AsyncStorage and state update
            await login(response);
            // router.replace will be handled by _layout effect
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
            style={styles.container}
        >
            <View style={styles.contentContainer}>
                <View style={styles.headerSection}>
                    <Image 
                        source={require('../../assets/images/iMery_Log_Main_3.png')} 
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>iMery</Text>
                    <Text style={styles.subtitle}>당신의 감각을 기록하세요</Text>
                </View>

                <View style={styles.formSection}>
                    <View style={styles.inputGroup}>
                        <TextInput
                            style={styles.input}
                            placeholder="이메일 (ID)"
                            placeholderTextColor="#9CA3AF"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <TextInput
                            style={styles.input}
                            placeholder="비밀번호"
                            placeholderTextColor="#9CA3AF"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleLogin}
                        disabled={loading}
                        style={[styles.loginButton, loading && styles.disabledButton]}
                    >
                        <Text style={styles.loginButtonText}>
                            {loading ? '로그인 중...' : '로그인'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>아직 계정이 없으신가요? </Text>
                    <Link href="/(auth)/signup" asChild>
                        <TouchableOpacity>
                            <Text style={styles.signUpText}>회원가입</Text>
                        </TouchableOpacity>
                    </Link>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f7', // Cream-50 from web design
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    headerSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logo: {
        width: 56, // w-14 (14 * 4px)
        height: 56,
        marginBottom: 12,
    },
    title: {
        fontSize: 36, // text-4xl
        fontWeight: 'bold',
        fontFamily: 'PlayfairDisplay-Bold', // Use custom font
        marginBottom: 8,
        color: '#1a1a1a',
    },
    subtitle: {
        fontSize: 16,
        fontFamily: 'Outfit-Regular',
        color: '#6B7280', // text-gray-500
    },
    formSection: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 16, // space-y-4
    },
    input: {
        width: '100%',
        backgroundColor: '#F9FAFB', // bg-gray-50
        borderWidth: 1,
        borderColor: '#E5E7EB', // border-gray-200
        borderRadius: 12, // rounded-xl
        paddingVertical: 12, // py-3
        paddingHorizontal: 16, // px-4
        fontSize: 16,
        fontFamily: 'Outfit-Regular',
        color: '#1a1a1a',
    },
    loginButton: {
        width: '100%',
        backgroundColor: '#000000', // bg-black
        borderRadius: 12, // rounded-xl
        paddingVertical: 14, // py-3.5
        alignItems: 'center',
        marginTop: 24,
    },
    disabledButton: {
        backgroundColor: '#9CA3AF',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Outfit-Bold', // or SemiBold
    },
    footer: {
        marginTop: 24,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerText: {
        color: '#6B7280', // text-gray-500
        fontSize: 14,
        fontFamily: 'Outfit-Regular',
    },
    signUpText: {
        color: '#000000',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Outfit-SemiBold',
    },
});
