import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import '../global.css'; // Import global CSS for NativeWind
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';
import { cssInterop } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';

// Configure NativeWind for 3rd party components
cssInterop(SafeAreaView, { className: 'style' });

// Prevent the splash screen from auto-hiding before asset loading is complete.
try {
  SplashScreen.preventAutoHideAsync();
} catch (e) {
  // Ignore error if already shown/hidden
}


import { useAuthStore } from '../stores/authStore';

// ... (imports remain)

import { useFonts as useGoogleFonts, PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold } from '@expo-google-fonts/outfit';

// ...

export default function RootLayout() {
  const [fontsLoaded] = useGoogleFonts({
    'PlayfairDisplay-Regular': PlayfairDisplay_400Regular,
    'PlayfairDisplay-Bold': PlayfairDisplay_700Bold,
    'Outfit-Regular': Outfit_400Regular,
    'Outfit-Medium': Outfit_500Medium,
    'Outfit-SemiBold': Outfit_600SemiBold,
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [isSplashScreenHidden, setIsSplashScreenHidden] = useState(false);
  const { user, isLoading, checkAuth } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (fontsLoaded && !isLoading && !isSplashScreenHidden) {
      SplashScreen.hideAsync().then(() => {
        setIsSplashScreenHidden(true);
      }).catch(() => {
        setIsSplashScreenHidden(true); // Still mark as hidden if it error'd (likely already hidden)
      });
    }
  }, [fontsLoaded, isLoading, isSplashScreenHidden]);

  // --- NFC Deep Link Handler ---
  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      console.log('🔗 Deep Link Detected:', url);
      // Format: imery://artwork/view/{nfc_uuid}
      if (url && url.includes('artwork/view/')) {
        const nfcUuid = url.split('artwork/view/')[1];
        if (!nfcUuid) return;

        console.log('📍 NFC UUID:', nfcUuid);

        // Check Auth (using existing authStore)
        if (user) {
           // Navigate to Detail Page
           router.push({
             pathname: '/work/[id]', // Maps to work/[id].tsx
             params: { 
               id: 'nfc_temp', // Fallback ID if needed, or query logic
               nfcUuid: nfcUuid, 
               source: 'NFC' 
             }
           });
        } else {
           // Redirect to Login with params
           router.replace({
             pathname: '/(auth)/login',
             params: { redirectUuid: nfcUuid }
           });
        }
      }
    };

    // 1. Cold Start
    import('expo-linking').then(Linking => {
        Linking.getInitialURL().then((url) => {
            if (url) handleDeepLink({ url });
        });
        // 2. Listener
        const subscription = Linking.addEventListener('url', handleDeepLink);
        return () => subscription.remove();
    });
  }, [user]); // Re-run if user auth state changes (though typical deep link might come before auth check completes, but checked inside)

  useEffect(() => {
    if (fontsLoaded && !isLoading) {
      const inAuthGroup = segments[0] === '(auth)';

      if (!user && !inAuthGroup) {
        // Redirect to login if not authenticated
        router.replace('/(auth)/login');
      } else if (user && inAuthGroup) {
        // Redirect to tabs if authenticated
        router.replace('/(tabs)');
      }
    }
  }, [fontsLoaded, isLoading, user, segments]);

  if (!fontsLoaded || isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#23549D" />
      </View>
    );
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="work/upload" options={{ presentation: 'transparentModal', headerShown: false }} />
        <Stack.Screen name="work/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="notifications" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
