import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, FlatList, StyleSheet, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Settings, LogOut, Bookmark, Heart, MessageCircle, Camera, X } from 'lucide-react-native';
import api from '@services/api';
import { colors, shadowStyles, typography } from '../../constants/designSystem';
import WorkCardGrid from '../../components/work/WorkCardGrid';

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
    const [activeTab, setActiveTab] = useState<'bookmarks' | 'likes' | 'comments'>('bookmarks');
    
    // Edit Profile
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [newBio, setNewBio] = useState('');
    const [uploading, setUploading] = useState(false);

    // Data List
    const [listData, setListData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

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
            loadTabData();
        }
    }, [user, activeTab]);

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

    const loadTabData = async () => {
        setLoading(true);
        try {
            const userId = user.user_id || user.id;
            let data = [];
            
            if (activeTab === 'bookmarks') {
                 data = await api.getBookmarks(userId);
            } else if (activeTab === 'likes') {
                 try {
                    const likedIds = await api.getMyLikes(userId);
                    const allPosts = await api.getPosts();
                    data = allPosts.filter((w: any) => likedIds.includes(w.id));
                 } catch(e) {
                     data = []; 
                 }
            } else if (activeTab === 'comments') {
                 data = await api.getMyComments(userId);
            }
            setListData(data);
        } catch (e) {
            console.error(e);
            setListData([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
             Alert.alert('Permission needed', 'Gallery permission is required to change profile picture.');
             return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            handleUpdateProfileImage(result.assets[0]);
        }
    };

    const handleUpdateProfileImage = async (asset: any) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('user_id', user.user_id || user.id);
            formData.append('bio', profile?.bio || user?.bio || '');
            
            const fileCheck = {
                uri: asset.uri,
                type: 'image/jpeg',
                name: 'profile.jpg',
            } as any;
            
            formData.append('image', fileCheck);

            const res = await api.updateProfile(user.user_id || user.id, formData);
            setProfile(res.user);
            Alert.alert('Success', '프로필 사진이 변경되었습니다.');
        } catch (e) {
            Alert.alert('Error', '프로필 사진 변경 실패');
        } finally {
            setUploading(false);
        }
    };

    const handleUpdateBio = async () => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('user_id', user.user_id || user.id);
            formData.append('bio', newBio);
            
            const res = await api.updateProfile(user.user_id || user.id, formData);
            setProfile(res.user);
            setEditModalVisible(false);
            Alert.alert('Success', '자신을 소개하는 글이 변경되었습니다.');
        } catch (e) {
            Alert.alert('Error', '프로필 수정 실패');
        } finally {
            setUploading(false);
        }
    };

    const openEditBio = () => {
        setNewBio(profile?.bio || user?.bio || '');
        setEditModalVisible(true);
    };

    const handleLogout = async () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: async () => {
                        await AsyncStorage.removeItem('imery-user');
                        router.replace('/(auth)/login');
                    }
                }
            ]
        );
    };

    const getImageUrl = (url: string | null) => {
        if (!url) return 'https://ui-avatars.com/api/?background=000&color=fff';
        return url.startsWith('http') ? url : `http://localhost:3001${url}`; // Adjust for Android/iOS if needed via api config ideally
    };

    const renderHeader = () => (
        <View style={styles.headerContainer}>
            {/* Settings */}
            <TouchableOpacity 
                style={styles.settingsButton}
                onPress={() => router.push('/settings')}
            >
                <Settings size={22} color={colors.gray400} />
            </TouchableOpacity>

            {/* Profile Image */}
            <View style={styles.profileImageWrapper}>
                <Image 
                    source={{ uri: user ? getImageUrl(profile?.profile_image_url || user.profile_image_url || null) : undefined }}
                    style={styles.profileImage}
                />
                <TouchableOpacity style={styles.editButton} onPress={handlePickImage} disabled={uploading}>
                    {uploading ? <ActivityIndicator size="small" color="#FFF" /> : <Camera size={14} color="#FFF" />}
                </TouchableOpacity>
            </View>

            {/* Info */}
            <TouchableOpacity onPress={openEditBio} style={{ alignItems: 'center' }}>
                <Text style={styles.nickname}>{profile?.nickname || user?.nickname || 'Guest'}</Text>
                <Text style={styles.bio}>{profile?.bio || user?.bio || "자기소개를 입력해주세요."}</Text>
            </TouchableOpacity>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.posts}</Text>
                    <Text style={styles.statLabel}>WORKS</Text>
                </View>
                <View style={styles.statSeparator} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.followers}</Text>
                    <Text style={styles.statLabel}>FOLLOWERS</Text>
                </View>
                <View style={styles.statSeparator} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.following}</Text>
                    <Text style={styles.statLabel}>FOLLOWING</Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
                <TouchableOpacity 
                    style={[styles.tabButton, activeTab === 'bookmarks' && styles.activeTabButton]}
                    onPress={() => setActiveTab('bookmarks')}
                >
                    <Bookmark size={20} color={activeTab === 'bookmarks' ? colors.primary : colors.gray400} />
                    {activeTab === 'bookmarks' && <View style={styles.activeIndicator} />}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.tabButton, activeTab === 'likes' && styles.activeTabButton]}
                    onPress={() => setActiveTab('likes')}
                >
                    <Heart size={20} color={activeTab === 'likes' ? colors.primary : colors.gray400} />
                    {activeTab === 'likes' && <View style={styles.activeIndicator} />}
                </TouchableOpacity>

                <TouchableOpacity 
                    style={[styles.tabButton, activeTab === 'comments' && styles.activeTabButton]}
                    onPress={() => setActiveTab('comments')}
                >
                    <MessageCircle size={20} color={activeTab === 'comments' ? colors.primary : colors.gray400} />
                    {activeTab === 'comments' && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderItem = ({ item }: { item: any }) => {
        if (activeTab === 'comments') {
            return (
                <View style={styles.commentItem}>
                    <View style={styles.commentContent}>
                        <Text style={styles.commentText}>"{item.content}"</Text>
                        <Text style={styles.dateText}>{new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                </View>
            );
        }

        return (
             <TouchableOpacity 
                style={styles.listItem}
                onPress={() => router.push({ pathname: '/work/[id]', params: { id: item.id || item.post_id } })}
             >
                <Image 
                    source={{ uri: getImageUrl(item.image_url || item.thumbnail || item.post_image || item.image) }}
                    style={styles.listImage}
                />
                <View style={styles.listContent}>
                    <Text style={styles.itemTitle}>{item.title || item.post_title}</Text>
                    <Text style={styles.itemArtist}>{item.artist || item.artist_name || 'Unknown Artist'}</Text>
                    
                    {/* Tags */}
                    {item.tags && Array.isArray(item.tags) && (
                        <View style={styles.tagRow}>
                            {item.tags.slice(0, 3).map((tag: any, i: number) => (
                                <View key={i} style={styles.tagBadge}>
                                    <Text style={styles.tagText}>{typeof tag === 'object' ? tag.label : tag}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View style={styles.itemFooter}>
                        {activeTab === 'bookmarks' && <Text style={styles.dateText}>Bookmarked: {new Date(item.bookmarked_at || Date.now()).toLocaleDateString()}</Text>}
                        {activeTab === 'likes' && <Text style={styles.dateText}>Liked: {new Date(item.created_at).toLocaleDateString()}</Text>}
                    </View>
                </View>
             </TouchableOpacity>
        );
    };

    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
             <FlatList
                data={listData}
                keyExtractor={(item, index) => String(item.id || index)}
                renderItem={renderItem}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={{ paddingBottom: 100 }}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {activeTab === 'bookmarks' ? '북마크한 작품이 없습니다.' : 
                             activeTab === 'likes' ? '좋아요한 작품이 없습니다.' : '작성한 댓글이 없습니다.'}
                        </Text>
                    </View>
                }
                ListFooterComponent={<View style={{ height: 100 }} />}
             />

            {/* Edit Bio Modal */}
            <Modal
                transparent={true}
                visible={editModalVisible}
                animationType="fade"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>자기소개 수정</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <X size={24} color={colors.gray500} />
                            </TouchableOpacity>
                        </View>
                        <TextInput 
                            style={styles.bioInput}
                            value={newBio}
                            onChangeText={setNewBio}
                            placeholder="자신을 자유롭게 소개해 보세요."
                            multiline
                            maxLength={100}
                        />
                        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateBio} disabled={uploading}>
                            <Text style={styles.saveBtnText}>{uploading ? '저장 중...' : '저장'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        backgroundColor: '#fffbeb', // cream-50ish
        paddingTop: 20,
        paddingBottom: 0,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        alignItems: 'center',
        ...shadowStyles.apple,
        marginBottom: 8,
    },
    settingsButton: {
        position: 'absolute',
        top: 10,
        right: 20,
        padding: 8,
    },
    profileImageWrapper: {
        width: 100,
        height: 100,
        marginBottom: 16,
        position: 'relative',
    },
    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 50,
        borderWidth: 2,
        borderColor: colors.white,
    },
    editButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.primary,
        padding: 6,
        borderRadius: 20,
        ...shadowStyles.apple,
    },
    nickname: {
        fontSize: 24,
        fontFamily: typography.serif,
        color: colors.primary,
        marginBottom: 4,
    },
    bio: {
        fontSize: 14,
        fontFamily: typography.sans,
        color: colors.gray500,
        marginBottom: 24,
        paddingHorizontal: 32,
        textAlign: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        width: '100%',
        justifyContent: 'center',
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    statValue: {
        fontSize: 20,
        fontFamily: typography.sansBold,
        color: colors.primary,
    },
    statLabel: {
        fontSize: 10,
        fontFamily: typography.sansBold,
        color: colors.gray400,
        marginTop: 4,
    },
    statSeparator: {
        width: 1,
        height: 24,
        backgroundColor: colors.gray200,
    },
    tabRow: {
        flexDirection: 'row',
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 16,
        position: 'relative',
    },
    activeTabButton: {
        // bg color if needed
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 0,
        width: 40,
        height: 3,
        backgroundColor: colors.primary,
        borderRadius: 2,
    },
    // List Items
    listItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        gap: 16,
    },
    listImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: colors.gray200,
    },
    listContent: {
        flex: 1,
        justifyContent: 'center',
    },
    itemTitle: {
        fontSize: 16,
        fontFamily: typography.sansBold,
        color: colors.primary,
        marginBottom: 4,
    },
    itemArtist: {
        fontSize: 12,
        fontFamily: typography.sans,
        color: colors.gray500,
        marginBottom: 8,
    },
    tagRow: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 6,
    },
    tagBadge: {
        backgroundColor: colors.gray100,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    tagText: {
        fontSize: 10,
        fontFamily: typography.sansBold,
        color: colors.gray400,
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    dateText: {
        fontSize: 10,
        fontFamily: typography.sans,
        color: colors.gray400,
    },
    // Comments
    commentItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    commentContent: {
        backgroundColor: colors.gray100,
        padding: 16,
        borderRadius: 12,
    },
    commentText: {
        fontSize: 14,
        fontFamily: typography.sansMedium,
        color: colors.primary,
        marginBottom: 8,
        fontStyle: 'italic',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: colors.gray400,
        fontFamily: typography.sans,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 12,
        backgroundColor: '#fef2f2',
        gap: 8,
    },
    logoutText: {
        color: '#ef4444',
        fontFamily: typography.sansBold,
        fontSize: 14,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '85%',
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: 24,
        ...shadowStyles.premium,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: typography.serif,
        color: colors.primary,
    },
    bioInput: {
        backgroundColor: colors.gray100,
        borderRadius: 12,
        padding: 16,
        minHeight: 100,
        fontSize: 14,
        fontFamily: typography.sans,
        textAlignVertical: 'top',
        marginBottom: 24,
    },
    saveBtn: {
        backgroundColor: colors.primary,
        padding: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveBtnText: {
        color: colors.white,
        fontFamily: typography.sansBold,
        fontSize: 14,
    }
});
