import { Platform } from 'react-native';

import Constants from 'expo-constants';
import * as Device from 'expo-device';

const debuggerHost = Constants.expoConfig?.hostUri;
const lanIp = debuggerHost?.split(':')[0] || 'localhost';

const API_BASE_URL = (() => {
    if (!Device.isDevice) {
        return Platform.select({
            android: 'http://10.0.2.2:3001',
            default: 'http://localhost:3001',
        });
    } else {
        return `http://${lanIp}:3001`;
    }
})();

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
