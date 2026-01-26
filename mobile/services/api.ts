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

export default {
    // Auth
    login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        return data;
    },

    register: async (email, password, nickname) => {
        const { data } = await api.post('/auth/register', { email, password, nickname });
        return data;
    },

    // Posts
    getPosts: async () => {
        const { data } = await api.get('/posts/');
        return data;
    },

    createPost: async (formData) => {
        const { data } = await api.post('/posts/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    updatePost: async (id, formData) => {
        const { data } = await api.put(`/posts/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },

    deletePost: async (id) => {
        const { data } = await api.delete(`/posts/${id}`);
        return data;
    },

    // AI Analysis
    analyzePost: async (postId) => {
        const { data } = await api.post(`/analyze/${postId}`);
        return data;
    },

    // Social
    searchUsers: async (nickname) => {
        const { data } = await api.get(`/users/search?nickname=${nickname}`);
        return data;
    },

    sendFriendRequest: async (requesterId, addresseeId) => {
        const { data } = await api.post('/friends/request', { requesterId, addresseeId });
        return data;
    },

    getFriends: async (userId) => {
        const { data } = await api.get(`/friends/${userId}`);
        return data;
    },

    respondToFriendRequest: async (friendshipId, status) => {
        // Current API might use different endpoint, adhering to README instructions if available
        // Assuming standard REST for now, verifying with backend later
        const { data } = await api.post(`/friends/respond`, { friendshipId, status });
        return data;
    },

    // Interactions
    toggleLike: async (postId, userId) => {
        const { data } = await api.post('/likes/toggle', { postId, userId });
        return data;
    },

    toggleBookmark: async (userId, postId) => {
        const { data } = await api.post('/bookmarks/toggle', { userId, postId });
        return data;
    },

    getComments: async (postId) => {
        const { data } = await api.get(`/comments/${postId}`);
        return data;
    },

    addComment: async (postId, userId, content) => {
        const { data } = await api.post('/comments/', { postId, userId, content });
        return data;
    },
};
