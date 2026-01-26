import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ArchiveScreen() {
    const router = useRouter();
    const [markedDates, setMarkedDates] = useState({});

    useEffect(() => {
        loadMarkedDates();
    }, []);

    const loadMarkedDates = async () => {
        try {
            const userJson = await AsyncStorage.getItem('imery-user');
            const user = userJson ? JSON.parse(userJson) : null;
            if (user) {
                const posts = await api.getPosts();
                // Filter by user and map to calendar dates
                const myWorks = posts.filter(p => String(p.user_id) === String(user.user_id || user.id));

                const marks = {};
                myWorks.forEach(work => {
                    if (work.work_date) {
                        // Assume work_date is YYYY-MM-DD
                        const dateStr = work.work_date.substring(0, 10);
                        marks[dateStr] = { marked: true, dotColor: '#23549D' };
                    } else if (work.created_at) {
                        const dateStr = work.created_at.substring(0, 10);
                        marks[dateStr] = { marked: true, dotColor: '#23549D' };
                    }
                });
                setMarkedDates(marks);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
            <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1e293b' }}>Archive</Text>
            </View>

            <Calendar
                markedDates={markedDates}
                onDayPress={day => {
                    // Navigate to day view
                    // router.push({ pathname: '/work/day', params: { date: day.dateString } });
                    console.log('selected day', day);
                }}
                theme={{
                    todayTextColor: '#23549D',
                    selectedDayBackgroundColor: '#23549D',
                    arrowColor: '#23549D',
                    dotColor: '#23549D',
                }}
            />

            <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ color: '#94a3b8' }}>Select a date to view saved works</Text>
            </View>
        </SafeAreaView>
    );
}
