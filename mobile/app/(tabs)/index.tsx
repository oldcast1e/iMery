import { View, Text, FlatList, RefreshControl, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bookmark, Heart, Music, Search } from 'lucide-react-native';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);

  const loadData = async () => {
    try {
      // Get current user
      const userJson = await AsyncStorage.getItem('imery-user');
      const currentUser = userJson ? JSON.parse(userJson) : null;
      setUser(currentUser);

      if (currentUser) {
        // Fetch posts
        const data = await api.getPosts();
        // Filter by user_id logic (since API returns all)
        // Adjust filtering logic based on actual API behavior and user ID type
        const userWorks = data.filter(w => String(w.user_id) === String(currentUser.user_id || currentUser.id));
        setWorks(userWorks.reverse()); // Newest first
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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      className="bg-white mb-6 rounded-2xl overflow-hidden shadow-sm mx-4"
      onPress={() => router.push({ pathname: '/work/[id]', params: { id: item.id } })}
    >
      <View className="relative">
        <Image
          source={{ uri: item.image_url }}
          className="w-full h-64 bg-gray-200"
          resizeMode="cover"
        />
        {item.music_url && (
          <View className="absolute top-3 right-3 bg-black/50 rounded-full p-2">
            <Music color="white" size={16} />
          </View>
        )}
      </View>

      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1 mr-4">
            <Text className="text-xl font-bold text-gray-900" numberOfLines={1}>{item.title}</Text>
            <Text className="text-gray-500" numberOfLines={1}>{item.artist_name || 'Unknown Artist'}</Text>
          </View>
          <View className="flex-row space-x-3">
            {/* Actions could go here */}
          </View>
        </View>

        <View className="flex-row flex-wrap gap-2 mt-2">
          {item.style && (
            <View className="bg-gray-100 px-2 py-1 rounded-md">
              <Text className="text-xs text-gray-600">#{item.style}</Text>
            </View>
          )}
          {/* Parse tags if they are JSON string */}
          {/* Simplified for now */}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 mb-16">
      <View className="px-4 py-4 flex-row justify-between items-center bg-white border-b border-gray-100 mb-4">
        <Text className="text-2xl font-bold text-main">iMery</Text>
        <TouchableOpacity>
          {/* Add feature later */}
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#23549D" />
        </View>
      ) : (
        <FlatList
          data={works}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center py-20">
              <Text className="text-gray-400 text-lg">No works yet.</Text>
              <Text className="text-gray-400">Upload your first artwork!</Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-main rounded-full justify-center items-center shadow-lg z-50 elevation-5"
        onPress={() => router.push('/work/upload')}
      >
        <Text className="text-white text-3xl font-light mb-1">+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
