// Automatically detect if running on localhost or network IP
const BASE_URL = window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : `http://${window.location.hostname}:3001`;

const getAuthHeaders = () => {
    const user = JSON.parse(localStorage.getItem('imery-user'));
    return user && user.token ? { 'Authorization': `Bearer ${user.token}` } : {};
};

const api = {
    signup: async (username, password, nickname) => {
        try {
            const response = await fetch(`${BASE_URL}/users/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, nickname }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || '회원가입 실패');
            return data;
        } catch (error) {
            throw error;
        }
    },

    login: async (username, password) => {
        try {
            const response = await fetch(`${BASE_URL}/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || '로그인 실패');
            return data;
        } catch (error) {
            throw error;
        }
    },

    updateProfile: async (userId, profileData) => {
        const isFormData = profileData instanceof FormData;
        const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
        Object.assign(headers, getAuthHeaders());

        // Ensure user_id is present
        let body;
        if (isFormData) {
            if (!profileData.has('user_id')) profileData.append('user_id', userId);
            body = profileData;
        } else {
            const parsed = { ...profileData };
            if (!parsed.user_id) parsed.user_id = userId;
            body = JSON.stringify(parsed);
        }

        const response = await fetch(`${BASE_URL}/users/profile`, {
            method: 'PUT',
            headers,
            body
        });
        if (!response.ok) throw new Error('Profile update failed');
        return response.json();
    },

    getUserStats: async (userId) => {
        const response = await fetch(`${BASE_URL}/users/${userId}/stats`, { headers: getAuthHeaders() });
        return response.json();
    },

    deleteAccount: async (userId) => {
        const response = await fetch(`${BASE_URL}/users/${userId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return response.json();
    },

    getPosts: async () => {
        try {
            const response = await fetch(`${BASE_URL}/posts/`, {
                headers: getAuthHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error('데이터 불러오기 실패');
            return data.posts;
        } catch (error) {
            throw error;
        }
    },

    createPost: async (postData) => {
        try {
            const isFormData = postData instanceof FormData;
            const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
            // Add Auth Header
            const auth = getAuthHeaders();
            Object.assign(headers, auth);

            const body = isFormData ? postData : JSON.stringify(postData);

            const response = await fetch(`${BASE_URL}/posts/`, {
                method: 'POST',
                headers: headers,
                body: body,
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || '업로드 실패');
            return data;
        } catch (error) {
            throw error;
        }
    },

    getPostDetail: async (id) => {
        const response = await fetch(`${BASE_URL}/posts/${id}`, { headers: getAuthHeaders() });
        return response.json();
    },

    analyzePost: async (id) => {
        try {
            const response = await fetch(`${BASE_URL}/posts/${id}/analyze`, {
                method: 'POST',
                headers: getAuthHeaders(),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || '분석 실패');
            return data;
        } catch (error) {
            throw error;
        }
    },

    // --- Social APIs ---

    searchUsers: async (nickname) => {
        const response = await fetch(`${BASE_URL}/users/search?nickname=${nickname}`, { headers: getAuthHeaders() });
        const data = await response.json();
        // Ensure we always return an array
        return Array.isArray(data) ? data : (data.users || []);
    },

    requestFriend: async (requester_id, addressee_id) => {
        const response = await fetch(`${BASE_URL}/friends/request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ requester_id, addressee_id })
        });
        if (!response.ok) throw new Error('Request failed');
        return response.json();
    },

    getFriends: async (userId) => {
        const response = await fetch(`${BASE_URL}/friends/${userId}`, { headers: getAuthHeaders() });
        return response.json();
    },

    getUserProfile: async (userId) => {
        const response = await fetch(`${BASE_URL}/users/${userId}`, { headers: getAuthHeaders() });
        if (!response.ok) throw new Error('Failed to fetch profile');
        return response.json();
    },

    updateProfile: async (userId, formData) => {
        const response = await fetch(`${BASE_URL}/users/profile`, {
            method: 'PUT',
            headers: getAuthHeaders(), // FormData automatically sets Content-Type to undefined/multipart
            body: formData
        });
        if (!response.ok) throw new Error('Failed to update profile');
        return response.json();
    },

    deleteFriend: async (friendshipId) => {
        const response = await fetch(`${BASE_URL}/friends/${friendshipId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return response.json();
    },

    acceptFriend: async (friendshipId) => {
        const response = await fetch(`${BASE_URL}/friends/accept`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ id: friendshipId })
        });
        return response.json();
    },

    toggleLike: async (postId, userId) => {
        const response = await fetch(`${BASE_URL}/posts/${postId}/likes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ user_id: userId })
        });
        return response.json();
    },

    addComment: async (postId, userId, content) => {
        const response = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ user_id: userId, content })
        });
        return response.json();
    },

    getComments: async (postId) => {
        const response = await fetch(`${BASE_URL}/posts/${postId}/comments`, { headers: getAuthHeaders() });
        return response.json();
    },

    getMyLikes: async (userId) => {
        const response = await fetch(`${BASE_URL}/users/${userId}/likes`, { headers: getAuthHeaders() });
        return response.json();
    },

    toggleBookmark: async (userId, postId) => {
        const response = await fetch(`${BASE_URL}/bookmarks`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ user_id: userId, post_id: postId })
        });
        return response.json();
    },

    getBookmarks: async (userId) => {
        const response = await fetch(`${BASE_URL}/users/${userId}/bookmarks`, { headers: getAuthHeaders() });
        return response.json();
    },

    getMyComments: async (userId) => {
        const response = await fetch(`${BASE_URL}/users/${userId}/comments`, { headers: getAuthHeaders() });
        return response.json();
    },

    deletePost: async (postId) => {
        const response = await fetch(`${BASE_URL}/posts/${postId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete');
        return response.json();
    },

    updatePost: async (postId, postData) => {
        const isFormData = postData instanceof FormData;
        const headers = isFormData ? {} : { 'Content-Type': 'application/json' };
        const auth = getAuthHeaders();
        Object.assign(headers, auth);

        const response = await fetch(`${BASE_URL}/posts/${postId}`, {
            method: 'PUT',
            headers,
            body: isFormData ? postData : JSON.stringify(postData)
        });
        if (!response.ok) throw new Error('Failed to update');
        return response.json();
    },

    getNotifications: async (userId) => {
        const response = await fetch(`${BASE_URL}/notifications/${userId}`, { headers: getAuthHeaders() });
        return response.json();
    },

    deleteNotification: async (id) => {
        const response = await fetch(`${BASE_URL}/notifications/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete notification');
        return response.json();
    }
};

export default api;
