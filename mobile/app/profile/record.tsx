import React from 'react';
import { View, SafeAreaView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { colors } from '../../constants/designSystem';
import IRecordSection from '../../components/profile/IRecordSection';

export default function RecordScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const userId = params.userId as string;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>
            <IRecordSection userId={userId} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    backBtn: {
        padding: 4,
    }
});
