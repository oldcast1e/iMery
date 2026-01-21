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
    signup: async (username, password, nickname) => {
        const response = await api.post('/users/signup', { username, password, nickname });
        return response.data;
    },
    login: async (username, password) => {
        const response = await api.post('/users/login', { username, password });
        const { token, user_id, nickname } = response.data;
        const user = { user_id, nickname };
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
        return { ...user, token };
    },
    logout: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
    },
    getMe: async () => {
        const response = await api.get('/users/me'); // Assuming this exists or will be added
        return response.data;
    }
};

export const posts = {
    getAll: async () => {
        const response = await api.get('/posts/');
        return response.data.posts;
    },
    create: async (formData) => {
        const response = await api.post('/posts/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
    getDetail: async (id) => {
        const response = await api.get(`/posts/${id}`);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/posts/${id}`);
        return response.data;
    }
};

export const social = {
    getFriends: async (userId) => {
        const response = await api.get(`/friends/${userId}`);
        return response.data;
    },
    requestFriend: async (requesterId, addresseeId) => {
        const response = await api.post('/friends/request', { requester_id: requesterId, addressee_id: addresseeId });
        return response.data;
    },
    respondFriend: async (id, status) => {
        const response = await api.put('/friends/accept', { id }); // Align with server: accepts id only
        return response.data;
    }
};

export const interactions = {
    toggleLike: async (postId, userId) => {
        const response = await api.post(`/posts/${postId}/likes`, { user_id: userId });
        return response.data;
    },
    getMyLikes: async (userId) => {
        const response = await api.get(`/users/${userId}/likes`);
        return response.data;
    },
    addComment: async (postId, userId, content) => {
        const response = await api.post(`/posts/${postId}/comments`, { user_id: userId, content });
        return response.data;
    },
    getComments: async (postId) => {
        const response = await api.get(`/posts/${postId}/comments`);
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
