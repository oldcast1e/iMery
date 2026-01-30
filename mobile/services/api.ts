import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import Constants from 'expo-constants';
import * as Device from 'expo-device';

// Dynamic Host Configuration
// - Simulators: "localhost" (Stable)
// - Physical Devices: "LAN IP" (dynamic hostUri)
const debuggerHost = Constants.expoConfig?.hostUri;
const lanIp = debuggerHost?.split(':')[0] || 'localhost';

const API_BASE_URL = (() => {
    if (!Device.isDevice) {
        // Simulator / Emulator
        return Platform.select({
            android: 'http://10.0.2.2:3001',
            default: 'http://localhost:3001',
        });
    } else {
        // Physical Device
        return `http://${lanIp}:3001`;
    }
})();

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

    changePassword: async (userId: string | number, oldPassword: string, newPassword: string) => {
        const { data } = await api.put('/users/password', { user_id: userId, oldPassword, newPassword });
        return data;
    },

    // Posts
    getPosts: async () => {
        const { data } = await api.get('/posts/');
        return data.posts;
    },

    getPost: async (id: string | number) => {
        const { data } = await api.get(`/posts/${id}`);
        return data;
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
        // Server: app.post('/posts/:id/analyze')
        const { data } = await api.post(`/posts/${postId}/analyze`);
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

    // TODO: Update server to handle decline/respond specifically if needed. 
    // Currently mapping respond to accept or delete based on status is complex here without changing server.
    // Leaving as is for now, but note potential issue if server only has /friends/accept
    respondToFriendRequest: async (friendshipId: string | number, status: string) => {
        // Server has app.put('/friends/accept', { id })
        if (status === 'ACCEPTED') {
             const { data } = await api.put(`/friends/accept`, { id: friendshipId });
             return data;
        } else {
             // Assuming decline = delete
             const { data } = await api.delete(`/friends/${friendshipId}`);
             return data;
        }
    },

    // Interactions
    toggleLike: async (postId: string | number, userId: string | number) => {
        // Server: app.post('/posts/:id/like') - Uses token for auth
        const { data } = await api.post(`/posts/${postId}/like`);
        return data;
    },

    toggleBookmark: async (userId: string | number, postId: string | number) => {
        // Server: app.post('/bookmarks', { user_id, post_id })
        const { data } = await api.post('/bookmarks', { user_id: userId, post_id: postId });
        return data;
    },

    getComments: async (postId: string | number) => {
        // Server: app.get('/posts/:id/comments')
        const { data } = await api.get(`/posts/${postId}/comments`);
        return data;
    },

    addComment: async (postId: string | number, userId: string | number, content: string) => {
        // Server: app.post('/posts/:id/comments', { user_id, content })
        const { data } = await api.post(`/posts/${postId}/comments`, { user_id: userId, content });
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

    // Notifications
    getNotifications: async (userId: string | number) => {
        // Assuming this endpoint exists based on web usage
        const { data } = await api.get(`/notifications/${userId}`);
        return data;
    },

    deleteNotification: async (id: string | number) => {
        const { data } = await api.delete(`/notifications/${id}`);
        return data;
    },

    // Folders
    getFolders: async (userId: string | number) => {
        const { data } = await api.get(`/users/${userId}/folders`);
        return data;
    },

    createFolder: async (payload: { user_id: string | number, name: string, post_ids: (string | number)[], color?: string }) => {
        const { data } = await api.post('/folders', payload);
        return data;
    },

    getFolderItems: async (folderId: string | number) => {
        const { data } = await api.get(`/folders/${folderId}/items`);
        return data;
    },

    getFeed: async (type: 'community' | 'following', userId?: number | string) => {
        const { data } = await api.get('/posts/', {
            params: { 
                type, 
                user_id: userId,
                viewer_id: userId // Fix: Pass viewer_id for is_liked check
            }
        });
        return data.posts;
    },
    // Feed Interactions
    likePost: async (postId: string | number) => {
        // Fix: Route mismatch (server is singular /like)
        const { data } = await api.post(`/posts/${postId}/like`);
        return data;
    },

    bookmarkPost: async (postId: string | number) => {
        const { data } = await api.post(`/posts/${postId}/bookmark`);
        return data;
    },

    // Duplicates removed
};
