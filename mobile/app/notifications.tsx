import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell, Trash2, UserPlus, X, Check } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, shadowStyles } from '../constants/designSystem';
import api from '@services/api';

export default function NotificationsScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [friendRequests, setFriendRequests] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const userJson = await AsyncStorage.getItem('imery-user');
            if (userJson) {
                const u = JSON.parse(userJson);
                setUser(u);
                await fetchData(u);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchData = async (currentUser: any) => {
        try {
            const userId = currentUser.user_id || currentUser.id;
            
            // 1. Friend Requests
            const friends = await api.getFriends(userId);
            const requests = friends.filter((f: any) => 
                f.status === 'PENDING' && String(f.requester_id) !== String(userId)
            );
            setFriendRequests(requests);

            // 2. Activity Notifications
            try {
                const notifs = await api.getNotifications(userId);
                // Ensure array
                setNotifications(Array.isArray(notifs) ? notifs : []);
            } catch (e) {
                // If endpoint doesn't exist, ignore or keep empty
                // console.log("Notifications endpoint might not exist yet");
                setNotifications([]); 
            }

        } catch (e) {
            console.error("Error fetching notification data", e);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        if (user) await fetchData(user);
        else setRefreshing(false);
    };

    const handleAcceptFriend = async (friendshipId: any, nickname: string) => {
        try {
            await api.respondToFriendRequest(friendshipId, 'ACCEPTED');
            Alert.alert('Success', `${nickname}님과 친구가 되었습니다!`);
            setFriendRequests(prev => prev.filter(r => r.friendship_id !== friendshipId));
        } catch (e) {
            Alert.alert('Error', '수락 실패');
        }
    };

    const handleDeclineFriend = async (friendshipId: any) => {
        Alert.alert('Decline', '친구 요청을 거절하시겠습니까?', [
            { text: 'Cancel', style: 'cancel' },
            { 
                text: 'Decline', 
                style: 'destructive', 
                onPress: async () => {
                    try {
                        await api.respondToFriendRequest(friendshipId, 'DECLINED');
                        setFriendRequests(prev => prev.filter(r => r.friendship_id !== friendshipId));
                    } catch (e) {
                        Alert.alert('Error', '거절 실패');
                    }
                } 
            }
        ]);
    };

    const handleDeleteNotification = async (id: any) => {
        Alert.alert('Delete', '이 알림을 삭제하시겠습니까?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                   try {
                       await api.deleteNotification(id);
                       setNotifications(prev => prev.filter(n => n.id !== id));
                   } catch (e) {
                       // Alert.alert('Error', 'Failed to delete');
                       // Optimistic delete even if API fails (if mock)
                       setNotifications(prev => prev.filter(n => n.id !== id));
                   }
                }
            }
        ]);
    };

    // --- Render Items ---

    const renderFriendRequest = ({ item }: { item: any }) => (
        <View style={styles.requestCard}>
            <View style={styles.requestHeader}>
                <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>{item.nickname?.[0] || '?'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.requestName}>{item.nickname}</Text>
                    <Text style={styles.requestSub}>친구 요청을 보냈습니다.</Text>
                </View>
            </View>
            <View style={styles.actionRow}>
                <TouchableOpacity 
                    style={[styles.actionBtn, styles.acceptBtn]} 
                    onPress={() => handleAcceptFriend(item.friendship_id, item.nickname)}
                >
                    <Text style={styles.acceptBtnText}>수락</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.actionBtn, styles.declineBtn]}
                    onPress={() => handleDeclineFriend(item.friendship_id)}
                >
                    <Text style={styles.declineBtnText}>거절</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderNotification = ({ item }: { item: any }) => {
        const isWork = item.type === 'work';
        const isLike = item.type === 'like';
        
        return (
            <TouchableOpacity style={styles.notifCard} onLongPress={() => handleDeleteNotification(item.id)}>
                <View style={[
                    styles.iconBox,
                    isWork ? styles.iconWork : isLike ? styles.iconLike : styles.iconComment
                ]}>
                    <Text style={{ fontSize: 18 }}>
                        {isWork ? '🎨' : isLike ? '❤️' : '💬'}
                    </Text>
                </View>
                <View style={styles.notifContent}>
                    <Text style={styles.notifMessage} numberOfLines={2}>{item.message}</Text>
                    <Text style={styles.notifTime}>{item.time || item.created_at?.split('T')[0]}</Text>
                </View>
                <TouchableOpacity 
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteNotification(item.id)}
                >
                    <Trash2 size={16} color={colors.gray400} />
                </TouchableOpacity>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <ArrowLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.title}>알림</Text>
                    <Text style={styles.subtitle}>
                        {friendRequests.length > 0 
                            ? `${friendRequests.length}개의 친구 요청` 
                            : notifications.length > 0 
                                ? `${notifications.length}개의 새로운 소식` 
                                : '새로운 알림이 없습니다'}
                    </Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    {/* Combined List using ScrollView or SectionList properly, but simply putting requests on top manually here */}
                    <FlatList
                        data={notifications}
                        keyExtractor={item => item.id.toString()}
                        renderItem={renderNotification}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        contentContainerStyle={styles.listContent}
                        ListHeaderComponent={
                            <>
                                {friendRequests.length > 0 && (
                                    <View style={styles.sectionV}>
                                        <Text style={styles.sectionHeader}>친구 요청</Text>
                                        {friendRequests.map(req => (
                                            <View key={req.friendship_id}>
                                                {renderFriendRequest({ item: req })}
                                            </View>
                                        ))}
                                        <View style={styles.divider} />
                                    </View>
                                )}
                                {(notifications.length > 0 || friendRequests.length > 0) && (
                                    <Text style={[styles.sectionHeader, { marginTop: 8 }]}>활동 알림</Text>
                                )}
                            </>
                        }
                        ListEmptyComponent={
                             friendRequests.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <View style={styles.emptyIcon}>
                                        <Text style={{fontSize: 24}}>💤</Text>
                                    </View>
                                    <Text style={styles.emptyText}>모든 알림을 확인했습니다</Text>
                                </View>
                            ) : null
                        }
                    />
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        gap: 8,
    },
    backButton: {
        padding: 4,
        marginRight: 4,
    },
    title: {
        fontSize: 22,
        fontFamily: typography.serif,
        color: colors.primary,
        lineHeight: 28,
    },
    subtitle: {
        fontSize: 12,
        fontFamily: typography.sansMedium,
        color: colors.gray500,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    sectionV: {
        marginBottom: 16,
    },
    sectionHeader: {
        fontSize: 12,
        fontFamily: typography.sansBold,
        color: colors.gray400,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        marginLeft: 4,
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray100,
        marginVertical: 16,
    },
    // Request Card
    requestCard: {
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#dbeafe', // blue-100
        marginBottom: 10,
        ...shadowStyles.sm,
    },
    requestHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#eff6ff', // blue-50
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#3b82f6', // blue-500
        fontSize: 16,
        fontWeight: 'bold',
    },
    requestName: {
        fontSize: 15,
        fontFamily: typography.sansBold,
        color: colors.primary,
        marginBottom: 2,
    },
    requestSub: {
        fontSize: 13,
        fontFamily: typography.sans,
        color: colors.gray500,
    },
    actionRow: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptBtn: {
        backgroundColor: colors.primary,
    },
    declineBtn: {
        backgroundColor: colors.gray100,
    },
    acceptBtnText: {
        fontSize: 12,
        fontFamily: typography.sansBold,
        color: colors.white,
    },
    declineBtnText: {
        fontSize: 12,
        fontFamily: typography.sansBold,
        color: colors.gray500,
    },
    // Notification Card
    notifCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
        backgroundColor: colors.white, // simplified form of bg-white/60
        borderWidth: 1,
        borderColor: colors.gray100,
        borderRadius: 20,
        marginBottom: 8,
        gap: 12,
        ...shadowStyles.sm,
    },
    iconBox: {
        width: 44,
        height: 44,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconWork: {
        backgroundColor: '#e0f2fe', // sky-100 ish
    },
    iconLike: {
        backgroundColor: '#fee2e2', // red-100
    },
    iconComment: {
        backgroundColor: '#f3e8ff', // purple-100
    },
    notifContent: {
        flex: 1,
        paddingTop: 2,
    },
    notifMessage: {
        fontSize: 14,
        fontFamily: typography.sans,
        color: colors.secondary,
        lineHeight: 20,
        marginBottom: 4,
    },
    notifTime: {
        fontSize: 11,
        fontFamily: typography.sansMedium,
        color: colors.gray400,
    },
    deleteBtn: {
        padding: 4,
    },
    // Empty
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.gray100,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    emptyText: {
        fontSize: 13,
        fontFamily: typography.sansMedium,
        color: colors.gray400,
    },
});
