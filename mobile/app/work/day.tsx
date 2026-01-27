import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@services/api';
import WorkCardList from '../../components/work/WorkCardList';
import { colors, typography } from '../../constants/designSystem';

export default function DayWorksScreen() {
    const { date } = useLocalSearchParams();
    const router = useRouter();
    const [works, setWorks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [date]);

    const loadData = async () => {
        try {
            const userJson = await AsyncStorage.getItem('imery-user');
            const currentUser = userJson ? JSON.parse(userJson) : null;
            if (currentUser) {
                const allPosts = await api.getPosts();
                // Filter by user and date
                const targetDate = String(date);
                const dayWorks = allPosts.filter((w: any) => {
                    const isUser = String(w.user_id) === String(currentUser.user_id || currentUser.id);
                    if (!isUser) return false;

                    const rawDate = w.work_date || w.created_at || "";
                    const match = rawDate.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
                    if (match) {
                        const y = parseInt(match[1]);
                        const m = parseInt(match[2]);
                        const d = parseInt(match[3]);
                        const wDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                        return wDate === targetDate;
                    }
                    return false;
                });
                setWorks(dayWorks);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ title: String(date), headerBackTitle: 'Archive' }} />
            
            <View style={styles.header}>
                 <Text style={styles.title}>{date}</Text>
                 <Text style={styles.subtitle}>{works.length} works</Text>
            </View>

            {loading ? (
                <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
            ) : (
                <FlatList
                    data={works}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                         <View style={{ marginBottom: 16 }}>
                            <WorkCardList 
                                work={item} 
                                onPress={() => router.push({ pathname: '/work/[id]', params: { id: item.id } })} 
                            />
                        </View>
                    )}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={<Text style={styles.emptyText}>No works on this day.</Text>}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        backgroundColor: colors.white,
    },
    title: {
        fontSize: 24,
        fontFamily: typography.serif,
        color: colors.primary,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: typography.sans,
        color: colors.gray500,
        marginTop: 4,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 40,
        color: colors.gray400,
        fontFamily: typography.sans,
    },
});
