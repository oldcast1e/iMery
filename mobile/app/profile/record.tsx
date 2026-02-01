import React from 'react';
import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../../constants/designSystem';
import IRecordSection from '../../components/profile/IRecordSection';

export default function RecordScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const userId = params.userId as string;

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>I - Record</Text>
            </View>
            <IRecordSection userId={Number(userId)} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 12,
        position: 'relative',
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    backBtn: {
        position: 'absolute',
        left: 20,
        padding: 4,
        zIndex: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
    }
});
