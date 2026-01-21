import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// In Expo Go on physical device, localhost refers to the device itself.
// You MUST use your computer's local network IP.
// Update this IP if your network changes.
const HOST = '192.168.50.51'; // Update to your machine's local IP
const PORT = '3001';
const BASE_URL = `http://${HOST}:${PORT}`;

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the auth token to every request
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const auth = {
    signup: async (email, password, nickname) => {
        const response = await api.post('/api/auth/signup', { email, password, nickname });
        return response.data;
    },
    login: async (email, password) => {
        const response = await api.post('/api/auth/login', { email, password });
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('user', JSON.stringify(response.data.user)); // Store basic user info
        return response.data.user;
    },
    logout: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
    },
    getMe: async () => { // Verify token and get user data
        const response = await api.get('/api/auth/me');
        return response.data;
    }
};

export const posts = {
    getAll: async () => {
        const response = await api.get('/api/posts');
        return response.data;
    },
    create: async (formData) => {
        // For image upload, Content-Type must be multipart/form-data
        // Axios usually handles this automatically if data is FormData, but explicit setting is safer or sometimes required.
        const response = await api.post('/api/posts', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    getDetail: async (id) => {
        const response = await api.get(`/api/posts/${id}`);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/api/posts/${id}`);
        return response.data;
    }
};

export const social = {
    getFriends: async (userId) => {
        const response = await api.get(`/api/friends/${userId}`);
        return response.data;
    },
    getFriendRequests: async (userId) => { // Pending requests
        // This endpoint might need to be created or filtered from getFriends
        // For now, assuming getFriends returns all and we filter client side or backend handles it.
        // Based on server/index.js: /api/friends/:userId returns all relationships
        const response = await api.get(`/api/friends/${userId}`);
        return response.data;
    },
    requestFriend: async (requesterId, addresseeId) => {
        const response = await api.post('/api/friends/request', { requester_id: requesterId, addressee_id: addresseeId });
        return response.data;
    },
    respondFriend: async (id, status) => { // id is relationship ID
        const response = await api.put(`/api/friends/respond/${id}`, { status });
        return response.data;
    }
};

export const interactions = {
    toggleLike: async (postId, userId) => {
        const response = await api.post('/api/likes/toggle', { post_id: postId, user_id: userId });
        return response.data;
    },
    getMyLikes: async (userId) => {
        const response = await api.get(`/api/likes/${userId}`);
        return response.data.map(like => like.post_id);
    },
    addComment: async (postId, userId, content) => {
        const response = await api.post('/api/comments', { post_id: postId, user_id: userId, content });
        return response.data;
    },
    getComments: async (postId) => {
        const response = await api.get(`/api/comments/${postId}`);
        return response.data;
    }
};

export const user = {
    getStats: async (userId) => {
        // Mocking stats for now or fetching from real endpoint if added
        // Let's implement a basic stats fetch or mock
        // Server doesn't have a dedicated stats endpoint yet, so we'll mock or calculate client side
        // For v2.0 MVP, returning mock 0s is verified behavior from v1.0
        return { posts: 0, followers: 0, following: 0 };
    }
}

// Consolidate default export
export default {
    ...auth,
    ...posts,
    ...social,
    ...interactions,
    getUserStats: user.getStats,
    // Alias for backward compatibility if I used api.getPosts
    getPosts: posts.getAll,
    createPost: posts.create,
    getPostDetail: posts.getDetail,
    deletePost: posts.delete,
};
