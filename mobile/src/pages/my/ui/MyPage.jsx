import { View, Text, TouchableOpacity, Image, ScrollView, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback, useEffect } from 'react';
import useUserStore from '../../../entities/user/model/useUserStore';
import api from '../../../shared/api/client';

export default function MyPage() {
    const { user, logout } = useUserStore();
    const router = useRouter();
    const [stats, setStats] = useState({ posts: 0, followers: 0, following: 0 });
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = useCallback(async () => {
        if (!user) return;
        try {
            const data = await api.getUserStats(user.user_id);
            setStats(data);
        } catch (e) {
            console.error(e);
        } finally {
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const handleLogout = () => {
        logout();
        router.replace('/(auth)/login');
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    return (
        <ScrollView
            className="flex-1 bg-white"
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View className="items-center py-10 px-6 border-b border-gray-100">
                <View className="w-24 h-24 bg-gray-200 rounded-full mb-4 items-center justify-center overflow-hidden">
                    {user?.profile_image_url ? (
                        <Image source={{ uri: user.profile_image_url }} className="w-full h-full" />
                    ) : (
                        <Text className="text-3xl text-gray-400 font-bold">{user?.nickname?.[0]}</Text>
                    )}
                </View>
                <Text className="text-2xl font-bold mb-1">{user?.nickname}</Text>
                <Text className="text-gray-500 text-sm mb-6">{user?.email}</Text>

                <View className="flex-row w-full justify-around mb-8">
                    <View className="items-center">
                        <Text className="text-lg font-bold">{stats.posts}</Text>
                        <Text className="text-gray-500 text-sm">기록</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-lg font-bold">{stats.followers}</Text>
                        <Text className="text-gray-500 text-sm">팔로워</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-lg font-bold">{stats.following}</Text>
                        <Text className="text-gray-500 text-sm">팔로잉</Text>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleLogout}
                    className="w-full bg-gray-100 py-3 rounded-xl items-center"
                >
                    <Text className="text-black font-medium">로그아웃</Text>
                </TouchableOpacity>
            </View>

            <View className="p-6">
                <Text className="text-lg font-bold mb-4">내 활동</Text>
                <TouchableOpacity className="py-4 border-b border-gray-50">
                    <Text>북마크한 작품</Text>
                </TouchableOpacity>
                <TouchableOpacity className="py-4 border-b border-gray-50">
                    <Text>내가 쓴 댓글</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
