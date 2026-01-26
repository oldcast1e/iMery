import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Bell } from 'lucide-react-native';
import { colors, typography } from '../constants/designSystem';

// Mock Notifications
const MOCK_NOTIFICATIONS = [
    { id: '1', type: 'like', message: 'UserA liked your work "Starry Night".', time: '2m ago' },
    { id: '2', type: 'comment', message: 'UserB commented on "The Kiss": "Beautiful!"', time: '1h ago' },
    { id: '3', type: 'follow', message: 'UserC started following you.', time: '1d ago' },
];

export default function NotificationsScreen() {
    const router = useRouter();

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.item}>
             <View style={[styles.iconContainer, { backgroundColor: item.type === 'like' ? '#fee2e2' : '#e0e7ff' }]}>
                 <Bell size={16} color={colors.primary} />
             </View>
             <View style={styles.content}>
                 <Text style={styles.message}>{item.message}</Text>
                 <Text style={styles.time}>{item.time}</Text>
             </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.title}>Notifications</Text>
            </View>
            
            <FlatList
                data={MOCK_NOTIFICATIONS}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontFamily: typography.serif, // Changed from serifBold
        color: colors.primary,
    },
    list: {
        padding: 16,
    },
    item: {
        flexDirection: 'row',
        padding: 12,
        marginBottom: 12,
        backgroundColor: colors.gray100, // gray-50 equivalent ish
        borderRadius: 16,
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    content: {
        flex: 1,
    },
    message: {
        fontSize: 14,
        fontFamily: typography.sansMedium,
        color: colors.primary,
        marginBottom: 4,
    },
    time: {
        fontSize: 12,
        fontFamily: typography.sans,
        color: colors.gray500,
    },
});
