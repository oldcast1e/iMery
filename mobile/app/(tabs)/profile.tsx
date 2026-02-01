import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, StyleSheet, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Settings, LogOut, Camera, X, ChevronRight, Map, Activity, BarChart2, Ticket } from 'lucide-react-native';
import api from '@services/api';
import { colors, shadowStyles, typography } from '../../constants/designSystem';

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
    
    // Level Logic
    const getLevelInfo = (count: number) => {
        const level = Math.floor(count / 10) + 1;
        const remainder = count % 10;
        
        let title = '예술의 방랑자';
        if (count >= 90) title = '기억의 마스터';
        else if (count >= 80) title = '위대한 기록자';
        else if (count >= 70) title = '심미의 설계자';
        else if (count >= 60) title = '예술의 동행자';
        else if (count >= 50) title = '안목의 소유자';
        else if (count >= 40) title = '영감의 해석자';
        else if (count >= 30) title = '안목의 개척자';
        else if (count >= 20) title = '미학의 추적자';
        else if (count >= 10) title = '예술의 입문자';

        return { level, title, remainder };
    };

    const { level, title, remainder } = getLevelInfo(stats.posts);
    const progressPercent = (remainder / 10) * 100;
    
    // Edit Profile
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [newBio, setNewBio] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        loadUser();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadUser();
        }, [])
    );

    useEffect(() => {
        if (user) {
            loadProfile();
            loadStats();
        }
    }, [user]);

    const loadUser = async () => {
        try {
            const userJson = await AsyncStorage.getItem('imery-user');
            if (userJson) setUser(JSON.parse(userJson));
        } catch (e) {
            console.error(e);
        }
    };

    const loadProfile = async () => {
        try {
            const data = await api.getUserProfile(user.user_id || user.id);
            setProfile(data);
        } catch (e) {
            console.error(e);
        }
    };

    const loadStats = async () => {
        try {
            const data = await api.getUserStats(user.user_id || user.id);
            setStats(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('imery-user');
        router.replace('/');
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            handleUpdateProfile(result.assets[0].uri);
        }
    };

    const handleUpdateProfile = async (imageUri?: string) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('user_id', user.user_id || user.id);
            if (imageUri) {
                const filename = imageUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename || '');
                const type = match ? `image/${match[1]}` : `image`;
                // @ts-ignore
                formData.append('profileImage', { uri: imageUri, name: filename, type });
            }
            if (newBio) formData.append('bio', newBio);

            await api.updateProfile(user.user_id || user.id, formData);
            loadProfile();
            setEditModalVisible(false);
            Alert.alert('프로필이 업데이트되었습니다.');
        } catch (e) {
            console.error(e);
            Alert.alert('업데이트 실패');
        } finally {
            setUploading(false);
        }
    };

    const navigateToSection = (path: string) => {
        router.push({
            pathname: path as any,
            params: { userId: user.user_id || user.id }
        });
    };

    if (!user) {
        return (
            <SafeAreaView style={styles.container}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerBar}>
                <Text style={styles.headerTitle}>프로필</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity onPress={handleLogout} style={styles.iconButton}>
                        <LogOut size={24} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Settings size={24} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* 1. Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.profileImageContainer}>
                        <Image
                            source={{ uri: profile?.profile_image_url || 'https://via.placeholder.com/100' }}
                            style={styles.profileImage}
                        />
                        <TouchableOpacity style={styles.editIcon} onPress={() => {
                            setNewBio(profile?.bio || '');
                            setEditModalVisible(true);
                        }}>
                            <Camera size={16} color="white" />
                        </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.nickname}>{user.nickname}</Text>
                    <Text style={styles.bio}>{profile?.bio || '한줄 소개를 입력해주세요.'}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>WORKS</Text>
                            <Text style={styles.statValue}>{stats.posts}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>FOLLOWERS</Text>
                            <Text style={styles.statValue}>{stats.followers}</Text>
                        </View>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>FOLLOWINGS</Text>
                            <Text style={styles.statValue}>{stats.following}</Text>
                        </View>
                    </View>
                </View>

                {/* 2. Navigation Menu */}
                <View style={styles.menuSection}>
                    {/* 1. I-Memory (Redesigned) */}
                    <TouchableOpacity 
                        style={[styles.menuItem, { flexDirection: 'column', alignItems: 'stretch', padding: 20 }]} 
                        onPress={() => navigateToSection('/profile/memory' as any)}
                    >
                        {/* Header */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' }}>I-Memory</Text>
                            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#FF6B6B', marginLeft: 4 }}>{stats.posts}</Text>
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                            {/* Left Image Placeholder */}
                            <View style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: '#F3F4F6', marginRight: 16, alignItems: 'center', justifyContent: 'center' }}>
                                 <Ticket size={32} color={colors.gray400} />
                            </View>

                            {/* Right Content */}
                            <View style={{ flex: 1 }}>
                                <View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                         <Activity size={16} color="#FF6B6B" style={{ marginRight: 6 }} /> 
                                         <Text style={{ fontSize: 14, fontWeight: '600', color: '#1A1A1A' }}>Lv.{level} {title}</Text>
                                    </View>
                                    
                                    {/* Progress Bar */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{ flex: 1, height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden', marginRight: 8 }}>
                                            <View style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#FF6B6B' }} />
                                        </View>
                                        <Text style={{ fontSize: 12, color: '#9CA3AF' }}>{remainder}/10</Text>
                                    </View>
                                </View>

                                {/* Action Button */}
                                <View style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginTop: 12 }}>
                                     <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                         <Text style={{ fontSize: 13, fontWeight: '500', color: '#4B5563' }}>🎫 전시회 티켓을 확인해보세요.</Text>
                                     </View>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.menuItem, { paddingVertical: 20 }]}
                        onPress={() => navigateToSection('/profile/activity' as any)}
                    >
                        <View style={styles.menuLeft}>
                            <View style={[styles.iconBox, { backgroundColor: '#FFF0F0' }]}>
                                <Activity size={20} color="#FF6B6B" />
                            </View>
                            <View>
                                <Text style={styles.menuText}>I-Activity</Text>
                                <Text style={{ fontSize: 12, color: '#9CA3AF ' }}>나의 메모리 활동 모아보기!</Text>
                            </View>
                        </View>
                        <ChevronRight size={20} color={colors.gray400} />
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => navigateToSection('/profile/record')}
                    >
                        <View style={styles.menuLeft}>
                            <View style={[styles.iconBox, { backgroundColor: '#F0F9FF' }]}>
                                <BarChart2 size={20} color="#0EA5E9" />
                            </View>
                            <View>
                                <Text style={styles.menuText}>I-Record</Text>
                                <Text style={{ fontSize: 12, color: '#9CA3AF ' }}>다녀온 전시회 통계를 확인해보세요.</Text>
                            </View>
                        </View>
                        <ChevronRight size={20} color={colors.gray400} />
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={editModalVisible}
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>프로필 수정</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <X size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        
                        <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
                            <Text style={styles.imagePickerText}>프로필 사진 변경</Text>
                        </TouchableOpacity>

                        <TextInput
                            style={styles.input}
                            placeholder="한줄 소개"
                            value={newBio}
                            onChangeText={setNewBio}
                            multiline
                        />

                        <TouchableOpacity 
                            style={styles.saveBtn}
                            onPress={() => handleUpdateProfile()}
                            disabled={uploading}
                        >
                            <Text style={styles.saveBtnText}>{uploading ? '저장 중...' : '저장'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 0,
        backgroundColor: colors.background,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    headerRight: {
        flexDirection: 'row',
        gap: 15,
    },
    iconButton: {
        padding: 4,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: colors.background,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 12,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: 'white',
        ...shadowStyles.apple,
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary,
        padding: 8,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'white',
    },
    nickname: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    bio: {
        fontSize: 14,
        color: colors.gray600,
        marginBottom: 16,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
    statsRow: {
        flexDirection: 'row',
        width: '100%',
        paddingHorizontal: 40,
        marginBottom: 10,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: colors.gray500,
        marginBottom: 2,
        textAlign: 'center',
    },
    statValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1a1a1a',
        textAlign: 'center',
    },
    menuSection: {
        marginTop: 10,
        paddingHorizontal: 20,
    },
    menuItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        marginBottom: 12,
        borderRadius: 16,
        ...shadowStyles.apple,
    },
    menuLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    menuText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        minHeight: 300,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    imagePickerBtn: {
        alignItems: 'center',
        padding: 15,
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: 10,
        marginBottom: 15,
    },
    imagePickerText: {
        color: colors.primary,
        fontWeight: '600',
    },
    input: {
        borderWidth: 1,
        borderColor: colors.gray200,
        borderRadius: 10,
        padding: 15,
        height: 100,
        textAlignVertical: 'top',
        marginBottom: 20,
    },
    saveBtn: {
        backgroundColor: colors.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    saveBtnText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});
