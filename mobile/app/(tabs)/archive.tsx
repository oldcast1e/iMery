import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList, Modal, TextInput, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import { Calendar as CalendarIcon, Image as ImageIcon, Users, Search, UserMinus, Folder, FolderPlus, X, Check } from 'lucide-react-native';
import api from '@services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, shadowStyles, typography } from '../../constants/designSystem';
import WorkCardList from '../../components/work/WorkCardList';
import { getImageUrl } from '../../utils/imageHelper';

// Setup Calendar Locale
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
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const userJson = await AsyncStorage.getItem('imery-user');
            if (userJson) {
                const u = JSON.parse(userJson);
                setUser(u);
                const postsData = await api.getPosts();
                const posts = Array.isArray(postsData) ? postsData : (postsData.posts || []);
                setWorks(posts);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setRefreshing(false);
        }
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        loadData();
    }, [loadData]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

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
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <View style={styles.header}>
                <View style={styles.tabContainer}>
                    {renderTabButton('feed', '피드', ImageIcon)}
                    {renderTabButton('calendar', '달력', CalendarIcon)}
                    {renderTabButton('friends', '친구', Users)}
                </View>
            </View>

            <View style={styles.content}>
                {activeTab === 'feed' && <FeedTab user={user} works={works} refreshing={refreshing} onRefresh={onRefresh} />}
                {activeTab === 'calendar' && <CalendarTab user={user} works={works} router={router} refreshing={refreshing} onRefresh={onRefresh} />}
                {activeTab === 'friends' && <FriendsTab user={user} refreshing={refreshing} onRefresh={onRefresh} />}
            </View>
        </SafeAreaView>
    );
}

// --- Sub Components ---

function FeedTab({ user, works, refreshing, onRefresh }: any) {
    const [friendWorks, setFriendWorks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const fetchFriends = async () => {
             try {
                const friendList = await api.getFriends(user.user_id || user.id);
                if (Array.isArray(friendList)) {
                    // Filter works from friends
                    const acceptedFriends = friendList.filter((f:any) => f.status === 'ACCEPTED');
                    const friendUserIds = acceptedFriends.map((f:any) => String(f.user_id || f.id || f.friend_id));
                    const fWorks = works.filter((w:any) => friendUserIds.includes(String(w.user_id)));
                    setFriendWorks(fWorks);
                }
             } catch(e) {
                 console.log(e);
             } finally {
                 setLoading(false);
             }
        };
        fetchFriends();
    }, [user, works]);

    if (loading) return (
        <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading Feed...</Text>
        </View>
    );
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
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
    );
}

function CalendarTab({ user, works, router, refreshing, onRefresh }: any) {
    // Filter my works
    const myWorks = works.filter(w => String(w.user_id) === String(user?.user_id || user?.id));

    // Map works to days (Robust Regex Parsing like Web)
    const worksByDay: { [key: string]: any[] } = {};
    
    myWorks.forEach((w: any) => {
        const rawDate = w.work_date || w.date || w.created_at || "";
        // Match YYYY.MM.DD or YYYY-MM-DD or YYYY/MM/DD
        const match = rawDate.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
        
        if (match) {
             const y = parseInt(match[1]);
             const m = parseInt(match[2]);
             const d = parseInt(match[3]);
             
             // Convert to YYYY-MM-DD string for comparison/storage
             const dateKey = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
             
             if (!worksByDay[dateKey]) worksByDay[dateKey] = [];
             worksByDay[dateKey].push(w);
        }
    });

    const onDayPress = (day: any) => {
        const dateKey = day.dateString;
        const dayWorks = worksByDay[dateKey];
        if (dayWorks && dayWorks.length > 0) {
            router.push({ pathname: '/work/day', params: { date: dateKey } });
        }
    };

    return (
        <View style={styles.container}>
             <ScrollView 
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
             >
                 <View style={styles.calendarContainer}>
                     <Calendar
                        key={myWorks.length} // Force re-render on data change
                        theme={{
                            todayTextColor: colors.primary,
                            arrowColor: colors.primary,
                            textMonthFontFamily: typography.serif,
                            textDayFontFamily: typography.sans,
                            textDayHeaderFontFamily: typography.sans,
                            textMonthFontSize: 20,
                            textMonthFontWeight: 'bold',
                        }}
                        dayComponent={({ date, state }: any) => {
                            const dateStr = date.dateString; // YYYY-MM-DD
                            const dayWorks = worksByDay[dateStr] || [];
                            const count = dayWorks.length;
                            // Sort by created_at desc (or match web logic: earliest first?)
                            // Web sorts earliest first. Let's match Web.
                            const displayWork = dayWorks.length > 0 ? [...dayWorks].sort((a:any, b:any) => {
                                 const tA = new Date(a.created_at || 0).getTime();
                                 const tB = new Date(b.created_at || 0).getTime();
                                 return tA - tB;
                            })[0] : null;

                            return (
                                <TouchableOpacity 
                                    style={styles.dayContainer}
                                    onPress={() => onDayPress(date)}
                                    activeOpacity={0.7}
                                    disabled={count === 0}
                                >
                                    <View style={[
                                        styles.cellContent, 
                                        count > 0 ? styles.hasWorkCell : null 
                                    ]}>
                                        {displayWork && (
                                            <Image 
                                                source={{ uri: getImageUrl(displayWork.image_url || displayWork.thumbnail) }}
                                                style={[StyleSheet.absoluteFill, { borderRadius: 8, opacity: 0.8 }]} // 0.8 opacity
                                                resizeMode="cover"
                                            />
                                        )}
                                        
                                        <Text style={[
                                            styles.dayText, 
                                            state === 'today' && styles.todayText,
                                            displayWork && styles.onImageText
                                        ]}>
                                            {date.day}
                                        </Text>

                                        {count > 1 && (
                                            <View style={styles.badge}>
                                                <Text style={styles.badgeText}>+{count - 1}</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                     />
                 </View>

                 <View style={styles.statsContainer}>
                    <Text style={styles.statsLabel}>TOTAL RECORDS</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
                        <Text style={styles.statsValue}>
                            {Object.values(worksByDay).flat().length}
                        </Text>
                        <Text style={styles.statsUnit}> Works</Text>
                    </View>
                 </View>
             </ScrollView>
        </View>
    );
}

function FriendsTab({ user, refreshing, onRefresh }: any) {
    const [friends, setFriends] = useState<any[]>([]);
    
    useEffect(() => {
        if(user) {
            api.getFriends(user.user_id || user.id)
                .then((list:any) => {
                    const data = Array.isArray(list) ? list : [];
                    setFriends(data.filter((f:any) => f.status === 'ACCEPTED'));
                })
                .catch(() => setFriends([]));
        }
    }, [user]);

    return (
        <ScrollView 
            style={{ flex: 1, padding: 16 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
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
    centerLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    headerTitle: {
        fontSize: 32,
        fontFamily: typography.serif,
        color: colors.primary,
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
    dayContainer: {
        width: '100%',
        aspectRatio: 1,
        padding: 2,
    },
    cellContent: {
        flex: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        overflow: 'hidden',
    },
    todayContainer: {
        // borderWidth: 1,
        // borderColor: colors.primary,
        // borderRadius: 4,
    },
    dayText: {
        fontSize: 12,
        fontFamily: typography.sans,
    },
    defaultText: {
        color: colors.secondary,
    },
    disabledText: {
        color: colors.gray200,
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    badgeText: {
        color: 'white',
        fontSize: 8,
        fontWeight: 'bold',
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
        lineHeight: 38,
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
    // Folders Tab
    newFolderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        marginBottom: 24,
        gap: 8,
    },
    newFolderText: {
        fontFamily: typography.sansBold,
        color: colors.primary,
        fontSize: 16,
    },
    folderGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    folderCard: {
        width: '47%',
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        ...shadowStyles.sm,
        marginBottom: 8,
    },
    folderName: {
        fontFamily: typography.sansBold,
        color: colors.primary,
        marginTop: 8,
        fontSize: 14,
    },
    folderCount: {
        fontFamily: typography.sans,
        color: colors.gray400,
        fontSize: 12,
        marginTop: 2,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: 24,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: typography.serif,
        color: colors.primary,
    },
    modalBody: {
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 14,
        fontFamily: typography.sansBold,
        color: colors.gray500,
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: colors.gray100,
        padding: 12,
        borderRadius: 12,
        fontSize: 16,
        fontFamily: typography.sans,
    },
    workSelectionList: {
        maxHeight: 120,
    },
    workSelectCard: {
        width: 80,
        height: 80,
        marginRight: 8,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    workSelectImage: {
        width: '100%',
        height: '100%',
    },
    workSelected: {
        borderWidth: 3,
        borderColor: colors.primary,
    },
    checkOverlay: {
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    createBtn: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 12,
    },
    disabledBtn: {
        opacity: 0.5,
    },
    createBtnText: {
        color: colors.white,
        fontFamily: typography.sansBold,
        fontSize: 16,
    },
    // Calendar Styles Added
    calendarWrapper: {
        marginBottom: 24,
    },
    hasWorkCell: {
        // borderBottomWidth: 2,
        // borderBottomColor: colors.primary
    },
    todayText: {
        color: colors.primary,
        fontFamily: typography.sansBold,
    },
    defaultDayText: {
        color: colors.secondary,
    },
    onImageText: {
        color: 'white',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
});
