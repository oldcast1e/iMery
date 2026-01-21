import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import useUserStore from '../../../entities/user/model/useUserStore';
import api from '../../../shared/api/client';
import WorkCard from '../../../entities/work/ui/WorkCard';

export default function HomePage() {
    const { user } = useUserStore();
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchWorks = useCallback(async () => {
        if (!user) return;
        try {
            const allPosts = await api.getPosts();
            const myWorks = allPosts.filter(p => Number(p.user_id) === Number(user.user_id));
            const myLikes = await api.getMyLikes(user.user_id);

            const mapped = myWorks.map(post => ({
                ...post,
                image_url: post.image_url,
                artist: post.artist_name || 'Unknown',
                genre: post.genre || post.category || '그림', // Sync Genre
                date: post.work_date || post.created_at?.split('T')[0],
                review: post.description,
                is_liked: myLikes.includes(post.id)
            }));

            setWorks(mapped);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchWorks();
    }, [fetchWorks]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchWorks();
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color="black" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white px-4 pt-4">
            <View className="mb-4">
                <Text className="text-2xl font-bold text-black">나의 기록</Text>
                <Text className="text-gray-500">총 {works.length}개의 감각이 기록되었습니다.</Text>
            </View>

            <FlatList
                data={works}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <WorkCard
                        work={item}
                        onPress={() => router.push(`/works/${item.id}`)}
                        onLike={async () => {
                            await api.toggleLike(item.id, user.user_id);
                            fetchWorks(); // Simple refresh
                        }}
                    />
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View className="py-20 items-center">
                        <Text className="text-gray-400">아직 기록된 작품이 없습니다.</Text>
                    </View>
                }
            />

            <TouchableOpacity
                onPress={() => router.push('/works/upload')}
                className="absolute bottom-6 right-6 w-14 h-14 bg-black rounded-full items-center justify-center shadow-lg"
            >
                <Text className="text-white text-3xl font-light mb-1">+</Text>
            </TouchableOpacity>
        </View>
    );
}
