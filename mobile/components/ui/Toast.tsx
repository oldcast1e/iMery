import React, { useEffect, useRef } from 'react';
import { Text, Animated, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ToastProps {
    visible: boolean;
    message: string;
    type?: 'success' | 'error' | 'info';
    onHide: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ 
    visible, 
    message, 
    type = 'error', 
    onHide, 
    duration = 3000 
}) => {
    const insets = useSafeAreaInsets();
    const opacity = useRef(new Animated.Value(0)).current;
    
    // Initial position above the screen
    const translateY = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        if (visible) {
            // Show animation
            Animated.parallel([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto hide
            const timer = setTimeout(() => {
                hide();
            }, duration);

            return () => clearTimeout(timer);
        } else {
            hide();
        }
    }, [visible]);

    const hide = () => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
             if (visible) onHide();
        });
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success': return '#10B981'; // green-500
            case 'error': return '#EF4444'; // red-500
            case 'info': return '#3B82F6'; // blue-500
            default: return '#1F2937'; // gray-800
        }
    };

    // Calculate top padding to sit nicely below status bar or dynamic island
    const topPadding = Platform.OS === 'ios' ? insets.top + 10 : 40;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: getBackgroundColor(),
                    top: topPadding,
                    opacity: opacity,
                    transform: [{ translateY: translateY }],
                },
            ]}
        >
            <Text style={styles.text}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 20,
        right: 20,
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 9999,
    },
    text: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Outfit-Medium',
        textAlign: 'center',
    },
});
