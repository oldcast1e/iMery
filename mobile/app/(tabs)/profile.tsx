import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Settings, LogOut, UserPlus, FileText, Heart, Bookmark } from 'lucide-react-native';
import api from '../../services/api';

export default function ProfileScreen() {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ works: 0, likes: 0, bookmarks: 0 });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const userJson = await AsyncStorage.getItem('imery-user');
            if (userJson) {
                const userData = JSON.parse(userJson);
                setUser(userData);

                // Fetch verify simple stats (e.g. counting works)
                const allPosts = await api.getPosts();
                const myWorks = allPosts.filter(p => String(p.user_id) === String(userData.user_id || userData.id));
                setStats({
                    works: myWorks.length,
                    likes: 0, // API limitation in v1.5, mocked for now
                    bookmarks: 0 // API limitation
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: async () => {
                        await AsyncStorage.removeItem('imery-user');
                        router.replace('/(auth)/login');
                    }
                }
            ]
        );
    };

    if (!user) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center">
                <ActivityIndicator />
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView>
                {/* Header Profile Info */}
                <View className="items-center py-8 bg-white border-b border-gray-100">
                    <View className="w-24 h-24 rounded-full bg-main/10 items-center justify-center mb-4">
                        <Text className="text-4xl font-bold text-main">{user.nickname ? user.nickname[0] : 'U'}</Text>
                    </View>
                    <Text className="text-2xl font-bold text-gray-900">{user.nickname}</Text>
                    <Text className="text-gray-500">{user.email}</Text>
                </View>

                {/* Stats Row */}
                <View className="flex-row justify-around py-6 border-b border-gray-100">
                    <View className="items-center">
                        <Text className="text-xl font-bold text-gray-900">{stats.works}</Text>
                        <Text className="text-xs text-gray-500 uppercase tracking-wider">Works</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-xl font-bold text-gray-900">{stats.likes}</Text>
                        <Text className="text-xs text-gray-500 uppercase tracking-wider">Likes</Text>
                    </View>
                    <View className="items-center">
                        <Text className="text-xl font-bold text-gray-900">{stats.bookmarks}</Text>
                        <Text className="text-xs text-gray-500 uppercase tracking-wider">Saved</Text>
                    </View>
                </View>

                {/* Menu Items */}
                <View className="p-4 space-y-2">
                    <TouchableOpacity
                        className="flex-row items-center p-4 bg-gray-50 rounded-xl"
                        onPress={() => Alert.alert('Coming Soon', 'Friend management will be available shortly.')}
                    >
                        <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-4">
                            <UserPlus color="#23549D" size={20} />
                        </View>
                        <Text className="flex-1 text-base font-medium text-gray-900">Find Friends</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center p-4 bg-gray-50 rounded-xl">
                        <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-4">
                            <Bookmark color="#9333ea" size={20} />
                        </View>
                        <Text className="flex-1 text-base font-medium text-gray-900">Saved Works</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-row items-center p-4 bg-gray-50 rounded-xl">
                        <View className="w-10 h-10 rounded-full bg-orange-100 items-center justify-center mr-4">
                            <Settings color="#ea580c" size={20} />
                        </View>
                        <Text className="flex-1 text-base font-medium text-gray-900">Settings</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center p-4 bg-red-50 rounded-xl mt-4"
                        onPress={handleLogout}
                    >
                        <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-4">
                            <LogOut color="#ef4444" size={20} />
                        </View>
                        <Text className="flex-1 text-base font-medium text-red-600">Log Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
