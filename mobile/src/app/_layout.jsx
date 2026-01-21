import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useEffect, useState } from 'react';
import useUserStore from '../entities/user/model/useUserStore';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../../global.css';

export default function RootLayout() {
    const { user } = useUserStore();
    const segments = useSegments();
    const router = useRouter();

    const navigationState = useRootNavigationState();
    const [isNavigationReady, setIsNavigationReady] = useState(false);

    useEffect(() => {
        if (!isNavigationReady && navigationState?.key) {
            setIsNavigationReady(true);
        }
    }, [navigationState?.key]);

    useEffect(() => {
        if (!isNavigationReady) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!user && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (user && inAuthGroup) {
            router.replace('/(tabs)/home');
        }
    }, [user, segments, isNavigationReady]);

    return (
        <SafeAreaProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="works/upload" options={{ presentation: 'modal' }} />
                <Stack.Screen name="works/[id]" />
            </Stack>
        </SafeAreaProvider>
    );
}
