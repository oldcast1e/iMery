import { View, Text, FlatList, RefreshControl, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bookmark, Heart, MessageCircle } from 'lucide-react-native';
import api from '@/shared/api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export const CommunityScreen = () => {
    const router = useRouter();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);

    const loadData = async () => {
        try {
            const userJson = await AsyncStorage.getItem('imery-user');
            const user = userJson ? JSON.parse(userJson) : null;
            setCurrentUser(user);

            if (user) {
                const allPosts = await api.getPosts();
                const otherPosts = allPosts.filter((p: any) => String(p.user_id) !== String(user.user_id || user.id));
                setPosts(otherPosts.reverse());
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadData();
    }, []);

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            className="bg-white mb-4 mx-4 rounded-xl shadow-sm overflow-hidden"
            onPress={() => router.push({ pathname: '/work/[id]', params: { id: item.id } })}
        >
            <View className="flex-row items-center p-3 border-b border-gray-100">
                <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center mr-2">
                    <Text className="text-gray-500 font-bold">{item.nickname ? item.nickname[0] : 'U'}</Text>
                </View>
                <Text className="font-semibold text-gray-800">{item.nickname || 'Unknown User'}</Text>
            </View>

            <Image
                source={{ uri: item.image_url }}
                className="w-full h-72 bg-gray-200"
                resizeMode="cover"
            />

            <View className="p-3">
                <View className="flex-row justify-between mb-2">
                    <View className="flex-row gap-4">
                        <TouchableOpacity>
                            <Heart size={24} color="#333" />
                        </TouchableOpacity>
                        <TouchableOpacity>
                            <MessageCircle size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity>
                        <Bookmark size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                <Text className="font-bold text-base mb-1">{item.title}</Text>
                <Text className="text-gray-600 mb-2" numberOfLines={2}>{item.description}</Text>
                <Text className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <View className="px-4 py-3 bg-white border-b border-gray-200 mb-2">
                <Text className="text-xl font-bold text-gray-900">Community</Text>
            </View>

            {loading && !refreshing ? (
                <ActivityIndicator size="large" color="#23549D" className="mt-10" />
            ) : (
                <FlatList
                    data={posts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center py-20">
                            <Text className="text-gray-400">No community posts yet.</Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};
