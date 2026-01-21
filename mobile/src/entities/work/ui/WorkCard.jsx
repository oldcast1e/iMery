import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Heart } from 'lucide-react-native';

export default function WorkCard({ work, onPress, onLike }) {
    return (
        <TouchableOpacity onPress={onPress} className="mb-6 bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
            <Image
                source={{ uri: work.image_url }}
                className="w-full h-64 bg-gray-200"
                contentFit="cover"
            />
            <View className="p-4">
                <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1 mr-2">
                        <Text className="text-lg font-bold text-black" numberOfLines={1}>{work.title}</Text>
                        <Text className="text-gray-500 text-sm">{work.artist}</Text>
                    </View>
                    {onLike && (
                        <TouchableOpacity onPress={onLike} className="p-1">
                            <Heart
                                size={24}
                                color={work.is_liked ? '#E11D48' : '#9CA3AF'}
                                fill={work.is_liked ? '#E11D48' : 'none'}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                {work.review && (
                    <Text className="text-gray-600 text-sm mb-3" numberOfLines={2}>
                        {work.review}
                    </Text>
                )}

                <View className="flex-row justify-between items-center mt-2">
                    <View className="flex-row items-center gap-2">
                        <Text className="text-xs text-gray-400">{work.date}</Text>
                        <Text className="text-xs font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md">{work.genre || '그림'}</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Text className="text-xs text-gray-500 mr-1">★ {work.rating}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}
