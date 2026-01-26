import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// API Base URL Configuration
// Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator
// For physical device testing, replace with your computer's local IP (e.g., http://192.168.1.100:3001)
const API_BASE_URL = Platform.select({
    ios: 'http://localhost:3001',
    android: 'http://10.0.2.2:3001',
    default: 'http://localhost:3001',
});

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth Interceptor
api.interceptors.request.use(async (config) => {
    try {
        const userJson = await AsyncStorage.getItem('imery-user');
        if (userJson) {
            const user = JSON.parse(userJson);
            if (user.token) {
                config.headers.Authorization = `Bearer ${user.token}`;
            }
        }
    } catch (error) {
        console.error('Error fetching token:', error);
    }
    return config;
});

// Response Interceptor for Debugging
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
             console.error(`[API Error] ${error.response.status} ${error.config.url}`, error.response.data);
        } else {
             console.error(`[API Error] Network/Unknown ${error.message}`);
        }
        return Promise.reject(error);
    }
);

export default {
    // Auth
    login: async (email: string, password: string) => {
        const { data } = await api.post('/users/login', { username: email, password });
        return data;
    },

    register: async (email: string, password: string, nickname: string) => {
        const { data } = await api.post('/users/signup', { username: email, password, nickname });
        return data;
    },

    // Posts
    getPosts: async () => {
        const { data } = await api.get('/posts/');
        return data.posts;
    },

    createPost: async (formData: any) => {
        const { data } = await api.post('/posts/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    updatePost: async (id: string | number, formData: any) => {
        const { data } = await api.put(`/posts/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    deletePost: async (id: string | number) => {
        const { data } = await api.delete(`/posts/${id}`);
        return data;
    },

    // AI Analysis
    analyzePost: async (postId: string | number) => {
        const { data } = await api.post(`/analyze/${postId}`);
        return data;
    },

    // Social
    searchUsers: async (nickname: string) => {
        const { data } = await api.get(`/users/search?nickname=${nickname}`);
        return data;
    },

    sendFriendRequest: async (requesterId: string | number, addresseeId: string | number) => {
        const { data } = await api.post('/friends/request', { requesterId, addresseeId });
        return data;
    },

    getFriends: async (userId: string | number) => {
        const { data } = await api.get(`/friends/${userId}`);
        return data;
    },

    respondToFriendRequest: async (friendshipId: string | number, status: string) => {
        const { data } = await api.post(`/friends/respond`, { friendshipId, status });
        return data;
    },

    // Interactions
    toggleLike: async (postId: string | number, userId: string | number) => {
        const { data } = await api.post('/likes/toggle', { postId, userId });
        return data;
    },

    toggleBookmark: async (userId: string | number, postId: string | number) => {
        const { data } = await api.post('/bookmarks/toggle', { userId, postId });
        return data;
    },

    getComments: async (postId: string | number) => {
        const { data } = await api.get(`/comments/${postId}`);
        return data;
    },

    addComment: async (postId: string | number, userId: string | number, content: string) => {
        const { data } = await api.post('/comments/', { postId, userId, content });
        return data;
    },

    // User Profile & Stats
    getUserProfile: async (userId: string | number) => {
        const { data } = await api.get(`/users/${userId}`);
        return data;
    },

    updateProfile: async (userId: string | number, formData: any) => {
        // FormData handling
        const { data } = await api.put(`/users/profile`, formData, {
             headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    getUserStats: async (userId: string | number) => {
        const { data } = await api.get(`/users/${userId}/stats`);
        return data;
    },

    getBookmarks: async (userId: string | number) => {
        const { data } = await api.get(`/users/${userId}/bookmarks`);
        return data;
    },

    getMyLikes: async (userId: string | number) => {
        const { data } = await api.get(`/users/${userId}/likes`);
        return data;
    },

    getMyComments: async (userId: string | number) => {
        const { data } = await api.get(`/users/${userId}/comments`);
        return data;
    },
};
