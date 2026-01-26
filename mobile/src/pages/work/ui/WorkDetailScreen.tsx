import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Share2, Clock, Music, Pause, Sparkles, Send } from 'lucide-react-native';
import api from '@/shared/api/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import * as Sharing from 'expo-sharing';

export const WorkDetailScreen = () => {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [work, setWork] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [sound, setSound] = useState<Audio.Sound>();
    const [isPlaying, setIsPlaying] = useState(false);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisData, setAnalysisData] = useState<any>(null);

    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState('');

    useEffect(() => {
        loadWorkDetails();
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [id]);

    const loadWorkDetails = async () => {
        try {
            const userJson = await AsyncStorage.getItem('imery-user');
            if (userJson) setUser(JSON.parse(userJson));

            const allPosts = await api.getPosts();
            const foundWork = allPosts.find((p: any) => String(p.id) === String(id));

            if (foundWork) {
                setWork(foundWork);
                loadComments(foundWork.id);

                if (foundWork.music_url) {
                    playMusic(foundWork.music_url);
                }

                if (foundWork.is_analyzed && foundWork.ai_summary) {
                    setAnalysisData({
                        ...foundWork,
                        ai_summary: foundWork.ai_summary,
                    });
                }
            } else {
                Alert.alert('Error', 'Work not found');
                router.back();
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to load work details');
        } finally {
            setLoading(false);
        }
    };

    const loadComments = async (workId: any) => {
        try {
            const data = await api.getComments(workId);
            setComments(data);
        } catch (e) {
            console.error(e);
        }
    };

    const playMusic = async (url: string) => {
        try {
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: url },
                { shouldPlay: true, isLooping: true }
            );
            setSound(newSound);
            setIsPlaying(true);
        } catch (e) {
            console.log('Audio play failed', e);
        }
    };

    const togglePlayback = async () => {
        if (!sound) {
            if (work?.music_url) await playMusic(work.music_url);
            return;
        }
        if (isPlaying) {
            await sound.pauseAsync();
            setIsPlaying(false);
        } else {
            await sound.playAsync();
            setIsPlaying(true);
        }
    };

    const handleAnalyze = async () => {
        if (isAnalyzing || !work) return;
        setIsAnalyzing(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 2000));

            const response = await api.analyzePost(work.id);
            const result = response.result || {};

            const flattened = {
                ...result,
                ai_summary: response.ai_summary || result.ai_summary || 'Analysis complete.',
                ...(result.styles || []).reduce((acc: any, s: any, i: number) => ({
                    ...acc,
                    [`style${i + 1}`]: s.name,
                    [`score${i + 1}`]: s.score
                }), {}),
                is_analyzed: true
            };

            setAnalysisData(flattened);

            if (response.music_url) {
                playMusic(response.music_url);
            }

        } catch (e) {
            Alert.alert('Analysis Failed', 'Could not analyze artwork.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAddComment = async () => {
        if (!user || !commentText.trim()) return;
        try {
            await api.addComment(work.id, user.user_id || user.id, commentText);
            setCommentText('');
            loadComments(work.id);
        } catch (e) {
            Alert.alert('Error', 'Failed to post comment');
        }
    };

    const handleShare = async () => {
        if (work?.image_url) {
            await Sharing.shareAsync(work.image_url);
        }
    };

    if (loading || !work) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-900">
                <ActivityIndicator color="white" size="large" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <View className="h-[45vh] bg-gray-900 relative">
                <Image
                    source={{ uri: work.image_url }}
                    className="w-full h-full"
                    resizeMode="contain"
                />
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="absolute top-12 left-4 w-10 h-10 bg-black/20 rounded-full items-center justify-center backdrop-blur-md"
                    style={{ marginTop: insets.top > 20 ? 0 : 20 }}
                >
                    <ArrowLeft color="white" size={24} />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 -mt-8 bg-white rounded-t-[32px] pt-8 px-6">
                <View className="flex-row justify-between items-start mb-6">
                    <View className="flex-1 mr-4">
                        <View className="flex-row gap-2 mb-2 flex-wrap">
                            <View className="bg-black px-3 py-1 rounded-full">
                                <Text className="text-white text-xs font-bold">{work.genre || 'Art'}</Text>
                            </View>
                            {(work.style || work.style1) && (
                                <View className="bg-main px-3 py-1 rounded-full">
                                    <Text className="text-white text-xs font-bold">{work.style || work.style1}</Text>
                                </View>
                            )}
                        </View>
                        <Text className="text-2xl font-bold text-gray-900">{work.title}</Text>
                    </View>

                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={togglePlayback}
                            disabled={!work.music_url}
                            className={`w-10 h-10 rounded-full items-center justify-center shadow-md ${isPlaying ? 'bg-indigo-500' : 'bg-white border border-gray-100'}`}
                        >
                            {isPlaying ? (
                                <Pause size={16} color="white" />
                            ) : (
                                <Music size={16} color={work.music_url ? "#4f46e5" : "#ccc"} />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleShare}
                            className="w-10 h-10 rounded-full bg-white border border-gray-100 items-center justify-center shadow-md"
                        >
                            <Share2 size={18} color="#9ca3af" />
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="flex-row items-center gap-4 mb-6">
                    <View className="flex-row items-center gap-1">
                        <Clock size={14} color="#6b7280" />
                        <Text className="text-gray-500 text-sm">{work.work_date || work.created_at?.substring(0, 10)}</Text>
                    </View>
                    <Text className="font-bold text-gray-900">{work.artist_name || 'Unknown Artist'}</Text>
                </View>

                <View className="mb-8">
                    {(analysisData?.is_analyzed || work.is_analyzed) ? (
                        <View className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                            <View className="flex-row items-center gap-2 mb-2">
                                <Sparkles size={16} color="#4f46e5" />
                                <Text className="font-bold text-indigo-900">AI Analysis Result</Text>
                            </View>
                            <Text className="text-gray-700 leading-relaxed text-sm">
                                {analysisData?.ai_summary || work.ai_summary}
                            </Text>

                            <View className="mt-4 space-y-2">
                                {[1, 2, 3, 4, 5].map(i => {
                                    const styleKey = `style${i}`;
                                    const scoreKey = `score${i}`;
                                    const name = analysisData?.[styleKey] || work[styleKey];
                                    const score = analysisData?.[scoreKey] || work[scoreKey];
                                    if (!name) return null;
                                    return (
                                        <View key={i}>
                                            <View className="flex-row justify-between mb-1">
                                                <Text className="text-xs font-bold text-gray-600">{name}</Text>
                                                <Text className="text-xs font-bold text-indigo-500">{Math.round(score * 100)}%</Text>
                                            </View>
                                            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <View
                                                    className="h-full bg-indigo-500"
                                                    style={{ width: `${score * 100}%` }}
                                                />
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={handleAnalyze}
                            disabled={isAnalyzing}
                            className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex-row items-center justify-center gap-2 shadow-lg"
                            style={{ backgroundColor: '#23549D' }}
                        >
                            {isAnalyzing ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Sparkles size={20} color="white" />
                                    <Text className="text-white font-bold">Analyze Artwork</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                <View className="mb-8">
                    <Text className="font-bold text-lg mb-2">Review</Text>
                    <View className="bg-gray-50 p-4 rounded-xl">
                        <Text className="text-gray-600 leading-relaxed">{work.description || work.review}</Text>
                    </View>
                </View>

                <View className="mb-20">
                    <Text className="font-bold text-lg mb-4">Comments</Text>

                    <View className="flex-row gap-2 mb-6">
                        <TextInput
                            value={commentText}
                            onChangeText={setCommentText}
                            placeholder={user ? "Write a comment..." : "Login to comment"}
                            editable={!!user}
                            className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-base"
                        />
                        <TouchableOpacity
                            onPress={handleAddComment}
                            disabled={!user || !commentText.trim()}
                            className={`bg-black items-center justify-center w-12 rounded-xl ${(!user || !commentText.trim()) ? 'opacity-50' : ''}`}
                        >
                            <Send size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    {comments.map((c: any) => (
                        <View key={c.id} className="bg-gray-50 p-3 rounded-xl mb-3">
                            <Text className="font-bold text-sm mb-1">{c.nickname}</Text>
                            <Text className="text-gray-700">{c.content}</Text>
                            <Text className="text-xs text-gray-400 mt-1">{new Date(c.created_at).toLocaleDateString()}</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};
