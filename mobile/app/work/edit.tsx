import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Image as ImageIcon, ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import api from '@services/api';
import { getImageUrl } from '../../utils/imageHelper';
import { colors } from '../../constants/designSystem';

export default function EditWorkScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const workId = Array.isArray(id) ? id[0] : id;
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        isUnknownArtist: false,
        style: '',
        date: '',
        genre: '그림',
        rating: 5,
        review: '',
        tags: [] as string[],
    });

    const genres = ['그림', '조각', '사진', '판화', '기타'];
    const predefinedTags = ['유화', '수채화', '풍경', '인물', '추상', '모던', '고전'];

    useEffect(() => {
        if (workId) loadWork();
    }, [workId]);

    const loadWork = async () => {
        try {
            const data = await api.getPost(workId); 
            // Ensure data structure
            const work = data; 
            
            setImageUri(getImageUrl(work.image_url));
            setFormData({
                title: work.title,
                artist: work.artist_name || work.artist,
                isUnknownArtist: work.artist_name === '작가 미상',
                style: work.style || '',
                date: work.work_date || work.date || '',
                genre: work.genre || '그림',
                rating: work.rating || 0,
                review: work.description || '',
                tags: typeof work.tags === 'string' ? JSON.parse(work.tags) : (work.tags || []),
            });
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to load work details');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8 
        });

        if (!result.canceled) {
            const manipResult = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [{ resize: { width: 1080 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );
            setImageUri(manipResult.uri);
        }
    };

    const toggleTag = (tag: string) => {
        const current = formData.tags;
        if (current.includes(tag)) {
            setFormData({ ...formData, tags: current.filter(t => t !== tag) });
        } else {
            if (current.length >= 5) return;
            setFormData({ ...formData, tags: [...current, tag] });
        }
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) { Alert.alert('Missing Info', 'Please enter a title'); return; }

        setSubmitting(true);
        try {
            const data = new FormData();
            // Don't need user_id for update usually, but server might check ownership via token.
            data.append('title', formData.title);
            data.append('artist_name', formData.isUnknownArtist ? '작가 미상' : formData.artist);
            data.append('description', formData.review);
            data.append('work_date', formData.date.replace(/-/g, '.'));
            data.append('genre', formData.genre);
            data.append('style', formData.style);
            data.append('rating', String(formData.rating));
            data.append('tags', JSON.stringify(formData.tags));

            // Only append image if changed (local uri)
            if (imageUri && !imageUri.startsWith('http')) {
                const filename = imageUri.split('/').pop() || 'upload.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                data.append('image', { uri: imageUri, name: filename, type } as any);
            } else {
                data.append('image_url', imageUri || '');
            }

            await api.updatePost(workId, data);
            Alert.alert('Success', 'Artwork updated!', [
                { text: 'OK', onPress: () => router.back() }
            ]);

        } catch (e) {
            console.error(e);
            Alert.alert('Update Failed', 'Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()} className="p-2" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <ArrowLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text className="font-bold text-lg font-serif text-primary">Edit Artwork</Text>
                <TouchableOpacity onPress={handleSubmit} disabled={submitting}>
                    <Text className={`font-bold text-lg text-primary ${submitting ? 'opacity-50' : ''}`}>Save</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="flex-1 px-6 py-6">

                    <View className="h-64 rounded-xl overflow-hidden mb-8 bg-gray-100 relative">
                        <Image source={{ uri: imageUri! }} className="w-full h-full" resizeMode="cover" />
                        <TouchableOpacity
                            onPress={pickImage}
                            className="absolute bottom-4 right-4 bg-white/80 px-4 py-2 rounded-full backdrop-blur-md"
                        >
                            <Text className="font-bold text-xs">Change Photo</Text>
                        </TouchableOpacity>
                    </View>

                    <View className="space-y-6 mb-12">
                        <View>
                            <Text className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Title</Text>
                            <TextInput
                                value={formData.title}
                                onChangeText={t => setFormData({ ...formData, title: t })}
                                placeholder="Artwork Title"
                                className="bg-gray-50 p-4 rounded-xl text-base"
                            />
                        </View>

                        <View>
                            <View className="flex-row justify-between items-center mb-2 ml-1">
                                <Text className="text-xs font-bold text-gray-400 uppercase">Artist</Text>
                                <TouchableOpacity
                                    onPress={() => setFormData(prev => ({ ...prev, isUnknownArtist: !prev.isUnknownArtist }))}
                                    className={`px-3 py-1 rounded-full border ${formData.isUnknownArtist ? 'bg-black border-black' : 'bg-white border-gray-200'}`}
                                >
                                    <Text className={`text-[10px] font-bold ${formData.isUnknownArtist ? 'text-white' : 'text-gray-500'}`}>Unknown Artist</Text>
                                </TouchableOpacity>
                            </View>
                            {!formData.isUnknownArtist && (
                                <TextInput
                                    value={formData.artist}
                                    onChangeText={t => setFormData({ ...formData, artist: t })}
                                    placeholder="Artist Name"
                                    className="bg-gray-50 p-4 rounded-xl text-base"
                                />
                            )}
                        </View>

                        <View>
                            <Text className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Style</Text>
                            <TextInput
                                value={formData.style}
                                onChangeText={t => setFormData({ ...formData, style: t })}
                                placeholder="e.g. Impressionism, Oil..."
                                className="bg-gray-50 p-4 rounded-xl text-base"
                            />
                        </View>

                        <View>
                            <Text className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Date</Text>
                            <TextInput
                                value={formData.date}
                                onChangeText={t => setFormData({ ...formData, date: t })}
                                placeholder="YYYY-MM-DD"
                                className="bg-gray-50 p-4 rounded-xl text-base"
                                keyboardType="numbers-and-punctuation"
                            />
                        </View>

                        <View>
                            <Text className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Genre</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                                {genres.map(g => (
                                    <TouchableOpacity
                                        key={g}
                                        onPress={() => setFormData({ ...formData, genre: g })}
                                        className={`px-4 py-2 rounded-xl border ${formData.genre === g ? 'bg-black border-black' : 'bg-white border-gray-200'}`}
                                    >
                                        <Text className={`text-xs font-bold ${formData.genre === g ? 'text-white' : 'text-gray-500'}`}>{g}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View>
                            <Text className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Rating</Text>
                            <View className="flex-row gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity 
                                        key={star} 
                                        onPress={() => setFormData({ ...formData, rating: star })}
                                    >
                                        <Text style={{ fontSize: 24, color: star <= formData.rating ? '#FBBF24' : '#E5E7EB' }}>★</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View>
                            <Text className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Tags (Max 5)</Text>
                            <View className="flex-row flex-wrap gap-2">
                                {predefinedTags.map(tag => (
                                    <TouchableOpacity
                                        key={tag}
                                        onPress={() => toggleTag(tag)}
                                        className={`px-3 py-1.5 rounded-lg border ${formData.tags.includes(tag) ? 'bg-main border-main' : 'bg-white border-gray-200'}`}
                                    >
                                        <Text className={`text-xs ${formData.tags.includes(tag) ? 'text-white font-bold' : 'text-gray-500'}`}>#{tag}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <View>
                            <Text className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Review</Text>
                            <TextInput
                                value={formData.review}
                                onChangeText={t => setFormData({ ...formData, review: t })}
                                placeholder="Write your thoughts..."
                                className="bg-gray-50 p-4 rounded-xl text-base h-32"
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                    </View>
                    <View className="h-20" />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
