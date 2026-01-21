import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { X, Upload as UploadIcon, Star } from 'lucide-react-native';
import api from '../../../shared/api/client';
import useUserStore from '../../../entities/user/model/useUserStore';

export default function UploadPage() {
    const router = useRouter();
    const { user } = useUserStore();
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        artist_name: '',
        description: '',
        genre: '그림', // Default
        rating: 0,
        work_date: new Date().toISOString().split('T')[0].replace(/-/g, '.'),
    });

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            setImage(result.assets[0]);
        }
    };

    const handleSubmit = async () => {
        if (!image || !formData.title) {
            Alert.alert('필수 입력', '이미지와 제목은 필수입니다.');
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append('user_id', user.user_id);
            data.append('title', formData.title);
            data.append('artist_name', formData.artist_name);
            data.append('description', formData.description);
            data.append('genre', formData.genre);
            data.append('rating', formData.rating);
            data.append('work_date', formData.work_date);

            // Append Image
            const filename = image.uri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            data.append('image', { uri: image.uri, name: filename, type });

            await api.createPost(data);
            Alert.alert('성공', '작품이 업로드되었습니다.', [
                { text: '확인', onPress: () => router.back() }
            ]);
        } catch (e) {
            Alert.alert('오류', '업로드 중 문제가 발생했습니다.');
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-100">
                <TouchableOpacity onPress={() => router.back()}>
                    <X size={24} color="black" />
                </TouchableOpacity>
                <Text className="text-lg font-bold">감각 기록하기</Text>
                <TouchableOpacity onPress={handleSubmit} disabled={loading}>
                    {loading ? <ActivityIndicator size="small" color="black" /> : <Text className="text-blue-600 font-bold text-lg">저장</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4 py-4">
                {/* Image Picker */}
                <TouchableOpacity
                    onPress={pickImage}
                    className="w-full h-80 bg-gray-100 rounded-xl items-center justify-center mb-6 overflow-hidden border-2 border-dashed border-gray-300"
                >
                    {image ? (
                        <Image source={{ uri: image.uri }} className="w-full h-full" contentFit="cover" />
                    ) : (
                        <View className="items-center">
                            <UploadIcon size={40} color="gray" />
                            <Text className="text-gray-500 mt-2">이미지 선택</Text>
                        </View>
                    )}
                </TouchableOpacity>

                {/* Form Fields */}
                <View className="space-y-4 mb-10">
                    <View>
                        <Text className="mb-2 font-medium text-gray-700">작품 제목</Text>
                        <TextInput
                            value={formData.title}
                            onChangeText={t => setFormData({ ...formData, title: t })}
                            className="w-full p-4 bg-gray-50 rounded-xl"
                            placeholder="제목을 입력하세요"
                        />
                    </View>

                    <View>
                        <Text className="mb-2 font-medium text-gray-700">작가 / 브랜드</Text>
                        <TextInput
                            value={formData.artist_name}
                            onChangeText={t => setFormData({ ...formData, artist_name: t })}
                            className="w-full p-4 bg-gray-50 rounded-xl"
                            placeholder="작가명"
                        />
                    </View>

                    <View>
                        <Text className="mb-2 font-medium text-gray-700">평점</Text>
                        <View className="flex-row">
                            {[1, 2, 3, 4, 5].map(star => (
                                <TouchableOpacity key={star} onPress={() => setFormData({ ...formData, rating: star })}>
                                    <Star
                                        size={32}
                                        color={star <= formData.rating ? "#FBBF24" : "#E5E7EB"}
                                        fill={star <= formData.rating ? "#FBBF24" : "none"}
                                        className="mr-2"
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View>
                        <Text className="mb-2 font-medium text-gray-700">장르</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {['그림', '조각', '사진', '판화', '기타'].map(g => (
                                <TouchableOpacity
                                    key={g}
                                    onPress={() => setFormData({ ...formData, genre: g })}
                                    className={`px-4 py-2 rounded-full border ${formData.genre === g ? 'bg-black border-black' : 'bg-white border-gray-200'}`}
                                >
                                    <Text className={formData.genre === g ? 'text-white font-bold' : 'text-gray-500'}>{g}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View>
                        <Text className="mb-2 font-medium text-gray-700">나의 감상</Text>
                        <TextInput
                            value={formData.description}
                            onChangeText={t => setFormData({ ...formData, description: t })}
                            className="w-full p-4 bg-gray-50 rounded-xl h-32"
                            placeholder="어떤 점이 좋았나요?"
                            multiline
                            textAlignVertical="top"
                        />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
