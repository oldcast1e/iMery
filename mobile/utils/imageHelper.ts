import { Platform } from 'react-native';

// Hardcoded for now based on api.ts
// In a real app, this should share the config with api.ts or env variables
const API_BASE_URL = Platform.select({
    ios: 'http://localhost:3001',
    android: 'http://10.0.2.2:3001',
    default: 'http://localhost:3001',
});

export const getImageUrl = (path: string | undefined | null): string => {
    if (!path) return 'https://via.placeholder.com/150';
    
    // If it's already a full URL (http/https or data URI), return it
    if (path.startsWith('http') || path.startsWith('data:')) {
        return path;
    }

    // Otherwise, append to base URL
    // Ensure path starts with / if needed, though usually standard
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_BASE_URL}${cleanPath}`;
};
