import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { Calendar as CalendarIcon, Image as ImageIcon, Users, Search, UserMinus } from 'lucide-react-native';
import api from '@services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, shadowStyles, typography } from '../../constants/designSystem';
import WorkCardList from '../../components/work/WorkCardList';

// Setup Calendar Locale if needed
LocaleConfig.locales['ko'] = {
  monthNames: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  monthNamesShort: ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'],
  dayNames: ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'],
  dayNamesShort: ['일','월','화','수','목','금','토'],
  today: '오늘'
};
LocaleConfig.defaultLocale = 'ko';

export default function ArchiveScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'feed' | 'calendar' | 'friends'>('feed');
    const [user, setUser] = useState<any>(null);
    const [works, setWorks] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const userJson = await AsyncStorage.getItem('imery-user');
            if (userJson) {
                const u = JSON.parse(userJson);
                setUser(u);
                const allPosts = await api.getPosts();
                setWorks(allPosts);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const renderTabButton = (id: string, label: string, Icon: any) => {
        const isActive = activeTab === id;
        return (
            <TouchableOpacity 
                onPress={() => setActiveTab(id as any)}
                style={[
                    styles.tabButton, 
                    isActive && styles.activeTabButton
                ]}
            >
                <Icon size={16} color={isActive ? colors.primary : colors.gray400} />
                <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{label}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.tabContainer}>
                    {renderTabButton('feed', '피드', ImageIcon)}
                    {renderTabButton('calendar', '달력', CalendarIcon)}
                    {renderTabButton('friends', '친구', Users)}
                </View>
            </View>

            <View style={styles.content}>
                {activeTab === 'feed' && <FeedTab user={user} works={works} />}
                {activeTab === 'calendar' && <CalendarTab user={user} works={works} />}
                {activeTab === 'friends' && <FriendsTab user={user} />}
            </View>
        </SafeAreaView>
    );
}

// --- Sub Components ---

function FeedTab({ user, works }: any) {
    const [friendWorks, setFriendWorks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchFriends = async () => {
             try {
                // Mock Fetch Friends or Real API
                const friendList = await api.getFriends(user.user_id || user.id);
                // Filter works
                const acceptedIds = friendList.filter((f:any) => f.status === 'ACCEPTED').map((f:any) => String(f.id));
                const fWorks = works.filter((w:any) => acceptedIds.includes(String(w.user_id)));
                setFriendWorks(fWorks);
             } catch(e) {
                 console.log(e);
             } finally {
                 setLoading(false);
             }
        };
        fetchFriends();
    }, [user, works]);

    if (loading) return <Text style={styles.loadingText}>Loading...</Text>;
    if (friendWorks.length === 0) {
        return (
            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>친구들의 새 작품이 없습니다.</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={friendWorks}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
                <View style={{ marginBottom: 16 }}>
                    <WorkCardList work={item} onPress={() => {}} />
                </View>
            )}
            contentContainerStyle={{ padding: 16 }}
        />
    );
}

function CalendarTab({ user, works }: any) {
    const [markedDates, setMarkedDates] = useState<any>({});
    const myWorks = React.useMemo(() => 
        works.filter((w:any) => String(w.user_id) === String(user?.user_id || user?.id)),
        [works, user]
    );

    useEffect(() => {
        const marks: any = {};
        myWorks.forEach((w: any) => {
            const dateStr = (w.work_date || w.created_at || '').substring(0, 10);
            if (dateStr) {
                if(!marks[dateStr]) marks[dateStr] = { marked: true, dotColor: colors.primary };
                else marks[dateStr].marked = true; // Simpler marking
            }
        });
        setMarkedDates(marks);
    }, [myWorks]);

    return (
        <ScrollView style={{ flex: 1, padding: 16 }}>
            <View style={styles.calendarContainer}>
                <Calendar
                    markedDates={markedDates}
                    theme={{
                        todayTextColor: colors.primary,
                        arrowColor: colors.primary,
                        dotColor: colors.primary,
                        textDayFontFamily: typography.sans,
                        textMonthFontFamily: typography.serif,
                        textDayHeaderFontFamily: typography.sansBold,
                    }}
                />
            </View>
            <View style={styles.statsContainer}>
                <Text style={styles.statsLabel}>TOTAL RECORDS</Text>
                <Text style={styles.statsValue}>{myWorks.length} <Text style={styles.statsUnit}>Works</Text></Text>
            </View>
        </ScrollView>
    );
}

function FriendsTab({ user }: any) {
    const [friends, setFriends] = useState<any[]>([]);
    
    useEffect(() => {
        if(user) api.getFriends(user.user_id || user.id).then((list:any) => setFriends(list.filter((f:any) => f.status === 'ACCEPTED'))).catch(() => {});
    }, [user]);

    return (
        <ScrollView style={{ flex: 1, padding: 16 }}>
             <Text style={styles.sectionTitle}>My Friends ({friends.length})</Text>
             {friends.map((f: any) => (
                 <View key={f.friendship_id} style={styles.friendRow}>
                     <View style={styles.friendInfo}>
                         <View style={styles.avatarPlaceholder} />
                         <Text style={styles.friendName}>{f.nickname}</Text>
                     </View>
                     <TouchableOpacity onPress={() => {}} style={styles.unfollowBtn}>
                         <UserMinus size={16} color={colors.gray400} />
                     </TouchableOpacity>
                 </View>
             ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.gray100,
        borderRadius: 24,
        padding: 4,
        alignSelf: 'center',
    },
    tabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        gap: 6,
    },
    activeTabButton: {
        backgroundColor: colors.white,
        ...shadowStyles.sm,
    },
    tabLabel: {
        fontSize: 13,
        fontFamily: typography.sansBold,
        color: colors.gray400,
    },
    activeTabLabel: {
        color: colors.primary,
    },
    content: {
        flex: 1,
    },
    loadingText: {
        textAlign: 'center',
        marginTop: 20,
        color: colors.gray400,
    },
    emptyState: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: colors.gray500,
        fontFamily: typography.sans,
    },
    // Calendar
    calendarContainer: {
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: 16,
        ...shadowStyles.sm,
        marginBottom: 24,
    },
    statsContainer: {
        paddingHorizontal: 8,
    },
    statsLabel: {
        fontSize: 12,
        fontFamily: typography.sansBold,
        color: colors.gray400,
        letterSpacing: 1,
        marginBottom: 4,
    },
    statsValue: {
        fontSize: 32,
        fontFamily: typography.serif,
        color: colors.primary,
    },
    statsUnit: {
        fontSize: 14,
        fontFamily: typography.sans,
        color: colors.gray400,
        fontWeight: 'normal',
    },
    // Friends
    sectionTitle: {
        fontSize: 18,
        fontFamily: typography.serif,
        color: colors.primary,
        marginBottom: 16,
    },
    friendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: 12,
        borderRadius: 16,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.gray100,
    },
    friendInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.gray200,
    },
    friendName: {
        fontSize: 14,
        fontFamily: typography.sansBold,
        color: colors.primary,
    },
    unfollowBtn: {
        padding: 8,
    },
});
