import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, Platform, KeyboardAvoidingView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, Image as ImageIcon, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import api from '@services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UploadScreen() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        isUnknownArtist: false,
        style: '',
        date: new Date().toISOString().split('T')[0],
        genre: '그림',
        rating: 5,
        review: '',
        tags: [] as string[],
    });

    const genres = ['그림', '조각', '사진', '판화', '기타'];
    const predefinedTags = ['유화', '수채화', '풍경', '인물', '추상', '모던', '고전'];

    const pickImage = async (useCamera: boolean) => {
        const { status } = useCamera
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
            return;
        }

        const result = useCamera
            ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 })
            : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.8 });

        if (!result.canceled) {
            setLoading(true);
            try {
                const manipResult = await ImageManipulator.manipulateAsync(
                    result.assets[0].uri,
                    [{ resize: { width: 1080 } }],
                    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
                );
                setImageUri(manipResult.uri);
                setStep(2);
            } catch (e) {
                Alert.alert('Error', 'Failed to process image');
            } finally {
                setLoading(false);
            }
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
        if (!imageUri) return;
        if (!formData.title.trim()) { Alert.alert('Missing Info', 'Please enter a title'); return; }

        setLoading(true);
        try {
            const userJson = await AsyncStorage.getItem('imery-user');
            const user = userJson ? JSON.parse(userJson) : null;
            if (!user) {
                Alert.alert('Error', 'User not logged in');
                router.replace('/(auth)/login');
                return;
            }

            const data = new FormData();
            data.append('user_id', user.user_id || user.id);
            data.append('title', formData.title);
            data.append('artist_name', formData.isUnknownArtist ? '작가 미상' : formData.artist);
            data.append('description', formData.review);
            data.append('work_date', formData.date.replace(/-/g, '.'));
            data.append('genre', formData.genre);
            data.append('style', formData.style);
            data.append('rating', String(formData.rating));
            data.append('tags', JSON.stringify(formData.tags));

            const filename = imageUri.split('/').pop() || 'upload.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            data.append('image', { uri: imageUri, name: filename, type } as any);

            await api.createPost(data);
            Alert.alert('Success', 'Artwork uploaded!', [
                { text: 'OK', onPress: () => router.replace('/(tabs)') }
            ]);

        } catch (e) {
            console.error(e);
            Alert.alert('Upload Failed', 'Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (step === 1) {
        return (
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-[32px] p-8 h-[50vh]">
                    <View className="flex-row justify-between items-center mb-8">
                        <Text className="text-2xl font-bold font-serif">Upload Artwork</Text>
                        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-gray-100 rounded-full">
                            <X size={24} color="gray" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row gap-4 h-40">
                        <TouchableOpacity
                            onPress={() => pickImage(true)}
                            className="flex-1 bg-gray-50 rounded-3xl items-center justify-center border border-gray-200 active:bg-gray-100"
                        >
                            <View className="w-12 h-12 bg-black rounded-2xl items-center justify-center mb-2">
                                <Camera size={24} color="white" />
                            </View>
                            <Text className="font-bold">Camera</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => pickImage(false)}
                            className="flex-1 bg-gray-50 rounded-3xl items-center justify-center border border-gray-200 active:bg-gray-100"
                        >
                            <View className="w-12 h-12 bg-blue-500 rounded-2xl items-center justify-center mb-2">
                                <ImageIcon size={24} color="white" />
                            </View>
                            <Text className="font-bold">Gallery</Text>
                        </TouchableOpacity>
                    </View>

                    {loading && <ActivityIndicator className="mt-8" />}
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100">
                <TouchableOpacity onPress={() => setStep(1)}>
                    <Text className="text-gray-500 text-lg">Back</Text>
                </TouchableOpacity>
                <Text className="font-bold text-lg">New Artwork</Text>
                <TouchableOpacity onPress={handleSubmit} disabled={loading}>
                    <Text className={`font-bold text-lg text-main ${loading ? 'opacity-50' : ''}`}>Save</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="flex-1 px-6 py-6">

                    <View className="h-64 rounded-xl overflow-hidden mb-8 bg-gray-100 relative">
                        <Image source={{ uri: imageUri! }} className="w-full h-full" resizeMode="cover" />
                        <TouchableOpacity
                            onPress={() => setStep(1)}
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
