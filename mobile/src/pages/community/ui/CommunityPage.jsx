import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import useUserStore from '../../../entities/user/model/useUserStore';
import api from '../../../shared/api/client';
import WorkCard from '../../../entities/work/ui/WorkCard';

export default function CommunityPage() {
    const { user } = useUserStore();
    const [works, setWorks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();

    const fetchCommunityWorks = useCallback(async () => {
        if (!user) return;
        try {
            const allPosts = await api.getPosts();
            const friends = await api.getFriends(user.user_id);

            const friendIds = friends
                .filter(f => f.status === 'ACCEPTED')
                .map(f => Number(f.id));

            const communityWorks = allPosts.filter(p =>
                friendIds.includes(Number(p.user_id)) &&
                Number(p.user_id) !== Number(user.user_id)
            );

            const myLikes = await api.getMyLikes(user.user_id);

            const mapped = communityWorks.map(post => ({
                ...post,
                image_url: post.image_url,
                artist: post.artist_name || 'Unknown',
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
        fetchCommunityWorks();
    }, [fetchCommunityWorks]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchCommunityWorks();
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
                <Text className="text-2xl font-bold text-black">커뮤니티</Text>
                <Text className="text-gray-500">친구들의 새로운 감각을 발견하세요.</Text>
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
                            fetchCommunityWorks();
                        }}
                    />
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View className="py-20 items-center">
                        <Text className="text-gray-400">친구들의 소식이 없습니다.</Text>
                    </View>
                }
            />
        </View>
    );
}
