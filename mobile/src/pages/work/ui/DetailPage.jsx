import { View, Text, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ArrowLeft, Heart, Trash2, Calendar, User as UserIcon } from 'lucide-react-native';
import api from '../../../shared/api/client';
import useUserStore from '../../../entities/user/model/useUserStore';

export default function DetailPage() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useUserStore();
    const [work, setWork] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        loadWork();
    }, [id]);

    const loadWork = async () => {
        try {
            const data = await api.getPostDetail(id);
            const myLikes = await api.getMyLikes(user.user_id);
            setWork(data);
            setIsLiked(myLikes.includes(Number(id)));
        } catch (e) {
            console.error(e);
            Alert.alert('오류', '작품 정보를 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async () => {
        try {
            await api.toggleLike(id, user.user_id);
            setIsLiked(!isLiked);
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = () => {
        Alert.alert('삭제', '정말 이 기록을 삭제하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            {
                text: '삭제',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.deletePost(id);
                        router.back();
                    } catch (e) {
                        Alert.alert('삭제 실패', '삭제 중 오류가 발생했습니다.');
                    }
                }
            }
        ]);
    };

    if (loading) return <View className="flex-1 bg-white justify-center items-center"><ActivityIndicator color="black" /></View>;
    if (!work) return <View className="flex-1 bg-white justify-center items-center"><Text>작품을 찾을 수 없습니다.</Text></View>;

    const isOwner = Number(work.user_id) === Number(user.user_id);

    return (
        <View className="flex-1 bg-white">
            {/* Header - Absolute to float over image or separate? Let's make it separate for cleaner UI on mobile */}
            <View className="flex-row justify-between items-center px-4 py-4 z-10 bg-white">
                <TouchableOpacity onPress={() => router.back()}>
                    <ArrowLeft size={24} color="black" />
                </TouchableOpacity>
                <View className="flex-row gap-4">
                    {isOwner && (
                        <TouchableOpacity onPress={handleDelete}>
                            <Trash2 size={24} color="gray" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <ScrollView>
                <Image
                    source={{ uri: work.image_url }}
                    className="w-full h-96 bg-gray-200"
                    contentFit="cover"
                />

                <View className="p-6">
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1 mr-4">
                            <Text className="text-2xl font-bold bg-white">{work.title}</Text>
                            <Text className="text-lg text-gray-500">{work.artist_name}</Text>
                        </View>
                        <TouchableOpacity onPress={handleLike}>
                            <Heart
                                size={28}
                                color={isLiked ? "#E11D48" : "black"}
                                fill={isLiked ? "#E11D48" : "none"}
                            />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row items-center bg-gray-50 px-3 py-1 rounded-full">
                        <Text className="text-gray-600 font-bold text-xs">{work.genre || '그림'}</Text>
                    </View>
                    <View className="flex-row items-center bg-gray-50 px-3 py-1 rounded-full">
                        <Calendar size={14} color="gray" />
                        <Text className="text-gray-500 ml-2 text-xs">{work.work_date}</Text>
                    </View>
                    <View className="flex-row items-center bg-gray-50 px-3 py-1 rounded-full">
                        <Star size={14} color="#FBBF24" fill="#FBBF24" />
                        <Text className="text-black font-bold ml-1 text-xs">{work.rating}</Text>
                    </View>
                    <View className="flex-row items-center bg-gray-50 px-3 py-1 rounded-full">
                        <UserIcon size={14} color="gray" />
                        <Text className="text-gray-500 ml-2 text-xs">{work.nickname}</Text>
                    </View>

                    <Text className="text-lg leading-8 text-gray-800">
                        {work.description}
                    </Text>

                    {/* AI Summary Section (Mock) */}
                    {work.ai_summary && (
                        <View className="mt-8 p-4 bg-gray-50 rounded-xl">
                            <Text className="font-bold mb-2">✨ AI 요약</Text>
                            <Text className="text-gray-600 text-sm leading-6">{work.ai_summary}</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
