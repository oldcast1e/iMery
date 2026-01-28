import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ArrowLeft, LogOut, Lock, ChevronRight, User, Shield, Info } from 'lucide-react-native';
import api from '@services/api';
import { colors, shadowStyles, typography } from '../../constants/designSystem';

export default function SettingsScreen() {
    const router = useRouter();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        Alert.alert(
            "로그아웃",
            "정말 로그아웃 하시겠습니까?",
            [
                { text: "취소", style: "cancel" },
                {
                    text: "로그아웃",
                    style: "destructive",
                    onPress: async () => {
                        await AsyncStorage.removeItem('imery-user');
                        router.replace('/(auth)/login');
                    }
                }
            ]
        );
    };

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', '모든 필드를 입력해주세요.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', '새 비밀번호가 일치하지 않습니다.');
            return;
        }

        setLoading(true);
        try {
            const userJson = await AsyncStorage.getItem('imery-user');
            if (!userJson) return;
            const user = JSON.parse(userJson);

            await api.changePassword(user.user_id || user.id, oldPassword, newPassword);
            
            Alert.alert('Success', '비밀번호가 변경되었습니다.', [
                { text: 'OK', onPress: () => {
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                }}
            ]);
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.detail || '비밀번호 변경 실패');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>설정</Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Account Section */}
                <Text style={styles.sectionTitle}>계정 보안</Text>
                
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                         <Shield size={20} color={colors.primary} />
                         <Text style={styles.cardTitle}>비밀번호 변경</Text>
                    </View>
                    <View style={styles.divider} />
                    
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>현재 비밀번호</Text>
                        <TextInput 
                            style={styles.input}
                            value={oldPassword}
                            onChangeText={setOldPassword}
                            secureTextEntry
                            placeholder="현재 비밀번호 입력"
                            placeholderTextColor={colors.gray400}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>새 비밀번호</Text>
                        <TextInput 
                            style={styles.input}
                            value={newPassword}
                            onChangeText={setNewPassword}
                            secureTextEntry
                            placeholder="새 비밀번호 입력"
                            placeholderTextColor={colors.gray400}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>새 비밀번호 확인</Text>
                        <TextInput 
                            style={styles.input}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            placeholder="새 비밀번호 다시 입력"
                            placeholderTextColor={colors.gray400}
                        />
                    </View>

                    <TouchableOpacity 
                        style={[styles.actionButton, loading && styles.disabledButton]}
                        onPress={handleChangePassword}
                        disabled={loading}
                    >
                        {loading ? (
                             <Text style={styles.actionButtonText}>처리 중...</Text>
                        ) : (
                             <>
                                <Lock size={16} color="white" />
                                <Text style={styles.actionButtonText}>비밀번호 변경하기</Text>
                             </>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Other Section */}
                <Text style={styles.sectionTitle}>기타</Text>
                <TouchableOpacity style={styles.menuCard} onPress={() => {}}>
                    <View style={styles.menuRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <Info size={20} color={colors.primary} />
                            <Text style={styles.menuText}>앱 정보</Text>
                        </View>
                        <ChevronRight size={20} color={colors.gray400} />
                    </View>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.menuCard, { marginTop: 12 }]} onPress={handleLogout}>
                    <View style={styles.menuRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <LogOut size={20} color="#ef4444" />
                            <Text style={[styles.menuText, { color: '#ef4444' }]}>로그아웃</Text>
                        </View>
                        <ChevronRight size={20} color={colors.gray400} />
                    </View>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    backButton: {
        marginRight: 16,
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: typography.sansBold,
        color: colors.primary,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontFamily: typography.sansBold,
        color: colors.gray400,
        marginBottom: 12,
        marginLeft: 4,
        marginTop: 8,
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: 24,
        ...shadowStyles.premium,
        marginBottom: 32,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: typography.sansBold,
        color: colors.primary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray100,
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontFamily: typography.sansMedium,
        color: colors.gray500,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: colors.gray100,
        borderRadius: 16,
        padding: 16,
        fontSize: 15,
        fontFamily: typography.sans,
        color: colors.primary,
    },
    actionButton: {
        backgroundColor: '#000', // Match login
        borderRadius: 12,        // Match login
        paddingVertical: 14,     // Match login
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        gap: 8,
        ...shadowStyles.sm,
    },
    disabledButton: {
        opacity: 0.7,
    },
    actionButtonText: {
        color: 'white',
        fontFamily: typography.sansBold,
        fontSize: 15,
    },
    menuCard: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 20,
        ...shadowStyles.sm,
    },
    menuRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    menuText: {
        fontSize: 16,
        fontFamily: typography.sansMedium,
        color: colors.primary,
    },
});
