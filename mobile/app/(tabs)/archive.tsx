import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList, Modal, TextInput, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar as CalendarIcon, Image as ImageIcon, Users, Search, UserMinus, Folder, FolderPlus, X, Check, Plus, ArrowLeft } from 'lucide-react-native';
import api from '@services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, shadowStyles, typography } from '../../constants/designSystem';
import WorkCardList from '../../components/work/WorkCardList'; 
import { getImageUrl } from '../../utils/imageHelper';
import { folderColors } from '../../constants/folderColors';

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
    // Tabs: Folder, Calendar, Friends
    const [activeTab, setActiveTab] = useState<'folder' | 'calendar' | 'friends'>('folder');
    const [user, setUser] = useState<any>(null);
    const [works, setWorks] = useState<any[]>([]); // User's works
    const [refreshing, setRefreshing] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const userJson = await AsyncStorage.getItem('imery-user');
            if (userJson) {
                const u = JSON.parse(userJson);
                setUser(u);
                
                // Fetch ALL posts, then filter for "My Works"
                const postsData = await api.getPosts(); 
                const allPosts = Array.isArray(postsData) ? postsData : (postsData.posts || []);
                const myWorks = allPosts.filter((p: any) => String(p.user_id) === String(u.user_id || u.id));
                setWorks(myWorks);
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
                    {renderTabButton('folder', '폴더', Folder)}
                    {renderTabButton('calendar', '달력', CalendarIcon)}
                    {renderTabButton('friends', '친구', Users)}
                </View>
            </View>

            <View style={styles.content}>
                {activeTab === 'folder' && <FolderTab user={user} works={works} refreshing={refreshing} onRefresh={onRefresh} />}
                {activeTab === 'calendar' && <CalendarTab user={user} works={works} router={router} refreshing={refreshing} onRefresh={onRefresh} />}
                {activeTab === 'friends' && <FriendsTab user={user} refreshing={refreshing} onRefresh={onRefresh} />}
            </View>
        </SafeAreaView>
    );
}

// --- Sub Components ---

function FolderTab({ user, works, refreshing, onRefresh }: any) {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [folders, setFolders] = useState<any[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<any>(null);
    const [bookmarkedWorks, setBookmarkedWorks] = useState<any[]>([]);
    
    const [modalVisible, setModalVisible] = useState(false);
    const [folderName, setFolderName] = useState('');
    const [selectedColor, setSelectedColor] = useState(folderColors[0]);
    const [selectedWorks, setSelectedWorks] = useState<number[]>([]);
    const [creating, setCreating] = useState(false);

    // Load Folders & Bookmarks
    const loadFolders = useCallback(async () => {
        if (!user) return;
        try {
            const [myFolders, bookmarks] = await Promise.all([
                api.getFolders(user.user_id || user.id),
                api.getBookmarks(user.user_id || user.id)
            ]);
            setFolders(myFolders);
            
            if (Array.isArray(bookmarks)) {
                setBookmarkedWorks(bookmarks);
            }
        } catch (e) {
            console.error('FolderTab Load Error', e);
        }
    }, [user]);

    useEffect(() => {
        loadFolders();
    }, [loadFolders, refreshing]);

    // Handle initial params
    useEffect(() => {
        if (params.openFolder === 'bookmark' && bookmarkedWorks.length > 0) {
            handleFolderClick({ name: '북마크', works: bookmarkedWorks, type: 'bookmark' });
        }
    }, [params.openFolder, bookmarkedWorks]);

    const handleFolderClick = async (folder: any) => {
        let folderWorks = folder.works;
        
        if (!folderWorks && folder.id && !folder.type) {
            try {
                const items = await api.getFolderItems(folder.id);
                folderWorks = items;
            } catch (e) {
                folderWorks = [];
            }
        }
        
        if (!folderWorks && folder.type === 'all') folderWorks = works;
        if (!folderWorks && folder.type === 'bookmark') folderWorks = bookmarkedWorks;

        setSelectedFolder({ ...folder, works: folderWorks });
    };

    const handleCreateFolder = async () => {
        if (!folderName.trim()) {
            Alert.alert('알림', '폴더 이름을 입력해주세요.');
            return;
        }

        setCreating(true);
        try {
            await api.createFolder({
                user_id: user.user_id || user.id,
                name: folderName,
                post_ids: selectedWorks,
                color: selectedColor
            });
            Alert.alert('성공', '새 폴더가 생성되었습니다.');
            setModalVisible(false);
            setFolderName('');
            setSelectedColor(folderColors[0]);
            setSelectedWorks([]);
            loadFolders(); // Refresh
        } catch (e) {
            Alert.alert('오류', '폴더 생성에 실패했습니다.');
        } finally {
            setCreating(false);
        }
    };

    const toggleWorkSelection = (id: number) => {
        setSelectedWorks(prev => 
            prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id]
        );
    };

    const renderGrid = () => (
        <ScrollView 
            contentContainerStyle={styles.gridContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.grid}>
                {/* All Works */}
                <TouchableOpacity 
                    style={[styles.FolderCard, { backgroundColor: '#e0e7ff' }]}
                    onPress={() => handleFolderClick({ name: '전체 작품', works: works, type: 'all' })}
                    activeOpacity={0.8}
                >
                    <View style={styles.folderContent}>
                        <Text style={styles.folderEmoji}>🎨</Text>
                        <Text style={styles.folderName}>전체 작품</Text>
                        <Text style={styles.folderCount}>{works.length}개</Text>
                    </View>
                </TouchableOpacity>

                {/* Bookmarks */}
                <TouchableOpacity 
                    style={[styles.FolderCard, { backgroundColor: '#fef3c7' }]}
                    onPress={() => handleFolderClick({ name: '북마크', works: bookmarkedWorks, type: 'bookmark' })}
                    activeOpacity={0.8}
                >
                    <View style={styles.folderContent}>
                        <Text style={styles.folderEmoji}>🔖</Text>
                        <Text style={styles.folderName}>북마크</Text>
                        <Text style={styles.folderCount}>{bookmarkedWorks.length}개</Text>
                    </View>
                </TouchableOpacity>

                {/* Custom Folders */}
                {folders.map(folder => (
                    <TouchableOpacity 
                        key={folder.id}
                        style={[styles.FolderCard, { backgroundColor: folder.color || colors.white }]}
                        onPress={() => handleFolderClick(folder)}
                        activeOpacity={0.8}
                    >
                        <View style={styles.folderContent}>
                            {/* If colored, use white icon/text, else default */}
                            <Folder size={32} color={folder.color ? 'white' : colors.secondary} fill={folder.color ? 'rgba(255,255,255,0.2)' : colors.background} />
                            <Text style={[styles.folderName, folder.color && { color: 'white' }]} numberOfLines={1}>{folder.name}</Text>
                            <Text style={[styles.folderCount, folder.color && { color: 'rgba(255,255,255,0.8)' }]}>{folder.item_count || 0}개</Text>
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Add Folder */}
                <TouchableOpacity 
                    style={[styles.FolderCard, styles.addFolderCard]}
                    onPress={() => setModalVisible(true)}
                >
                    <Plus size={32} color={colors.gray400} />
                    <Text style={styles.addFolderText}>새 폴더</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const renderDetail = () => {
         const displayWorks = (selectedFolder.works || []);
         return (
            <View style={{ flex: 1 }}>
                <View style={styles.detailHeader}>
                    <TouchableOpacity onPress={() => setSelectedFolder(null)} style={styles.backButton}>
                        <ArrowLeft size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.detailTitle}>{selectedFolder.name}</Text>
                </View>

                <FlatList
                    data={displayWorks}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                         <View style={{ paddingHorizontal: 16 }}>
                            <WorkCardList 
                                work={item} 
                                onPress={() => router.push({ pathname: '/work/[id]', params: { id: item.id } })}
                            />
                        </View>
                    )}
                    contentContainerStyle={{ paddingVertical: 10, paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>작품이 없습니다.</Text>
                        </View>
                    }
                />
            </View>
         );
    };

    return (
        <View style={styles.container}>
            {selectedFolder ? renderDetail() : renderGrid()}

             <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>새 폴더</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color={colors.gray400} />
                            </TouchableOpacity>
                        </View>
                        
                        <View style={styles.modalBody}>
                             <Text style={styles.inputLabel}>폴더 이름</Text>
                            <TextInput 
                                style={styles.input}
                                value={folderName}
                                onChangeText={setFolderName}
                                placeholder="폴더 이름을 입력하세요"
                            />

                            <Text style={styles.inputLabel}>폴더 색상</Text>
                            <View style={styles.colorRow}>
                                {folderColors.map(c => (
                                    <TouchableOpacity 
                                        key={c}
                                        style={[styles.colorCircle, { backgroundColor: c }, selectedColor === c && styles.colorSelected]}
                                        onPress={() => setSelectedColor(c)}
                                    />
                                ))}
                            </View>

                            <Text style={styles.inputLabel}>작품 선택 ({selectedWorks.length})</Text>
                            <ScrollView 
                                style={styles.workSelectionScroll} 
                                contentContainerStyle={styles.workSelectionGrid}
                                persistentScrollbar={true}
                            >
                                {works.map((work: any) => (
                                    <TouchableOpacity 
                                        key={work.id} 
                                        style={[
                                            styles.workSelectCard, 
                                            selectedWorks.includes(work.id) && styles.workSelected
                                        ]}
                                        onPress={() => toggleWorkSelection(work.id)}
                                    >
                                        <Image 
                                            source={{ uri: getImageUrl(work.image_url) }}
                                            style={styles.workSelectImage} 
                                        />
                                        {selectedWorks.includes(work.id) && (
                                            <View style={styles.checkOverlay}>
                                                <Check size={16} color="white" />
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity 
                                onPress={() => setModalVisible(false)}
                                style={styles.cancelBtn}
                            >
                                <Text style={styles.cancelBtnText}>취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.createBtn, creating && styles.disabledBtn]} 
                                onPress={handleCreateFolder}
                                disabled={creating}
                            >
                                {creating ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.createBtnText}>만들기</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function CalendarTab({ user, works, router, refreshing, onRefresh }: any) {
    const myWorks = works.filter((w: any) => String(w.user_id) === String(user?.user_id || user?.id));
    const worksByDay: { [key: string]: any[] } = {};
    
    myWorks.forEach((w: any) => {
        const rawDate = w.work_date || w.date || w.created_at || "";
        const match = rawDate.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
        
        if (match) {
             const y = parseInt(match[1]);
             const m = String(match[2]).padStart(2, '0');
             const d = String(match[3]).padStart(2, '0');
             const dateKey = `${y}-${m}-${d}`;
             
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
        <ScrollView 
            style={styles.container}
            contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
             <View style={styles.calendarContainer}>
                 <Calendar
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
                        const dateStr = date.dateString;
                        const dayWorks = worksByDay[dateStr] || [];
                        const count = dayWorks.length;
                        const displayWork = dayWorks[0]; 

                        return (
                            <TouchableOpacity 
                                style={styles.dayContainer}
                                onPress={() => onDayPress(date)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.cellContent]}>
                                    {displayWork && (
                                        <Image 
                                            source={{ uri: getImageUrl(displayWork.image_url || displayWork.thumbnail) }}
                                            style={[StyleSheet.absoluteFill, { borderRadius: 8, opacity: 0.8 }]}
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
        </ScrollView>
    );
}

function FriendsTab({ user, refreshing, onRefresh }: any) {
    const [friends, setFriends] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResult, setSearchResult] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    const loadFriends = useCallback(async () => {
        if(user) {
            try {
                const list = await api.getFriends(user.user_id || user.id);
                setFriends(Array.isArray(list) ? list.filter((f:any) => f.status === 'ACCEPTED') : []);
            } catch {
                setFriends([]);
            }
        }
    }, [user]);

    useEffect(() => {
        loadFriends();
    }, [loadFriends, refreshing]);

    const handleSearch = async () => {
         if(!searchTerm.trim()) return;
         setSearching(true);
         try {
             const results = await api.searchUsers(searchTerm);
             setSearchResult(results.filter((r:any) => String(r.id) !== String(user?.user_id || user?.id)));
         } catch(e) {
             Alert.alert('Error', '검색 실패');
         } finally {
             setSearching(false);
         }
    };
    
    const handleAddFriend = async (friendId: number) => {
        try {
            await api.sendFriendRequest(user.user_id || user.id, friendId);
            Alert.alert('성공', '친구 요청을 보냈습니다.');
            setSearchResult([]); 
            setSearchTerm('');
        } catch(e) {
            Alert.alert('오류', '요청 실패');
        }
    };

    return (
        <ScrollView 
            style={{ flex: 1, padding: 16 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
             <View style={styles.searchContainer}>
                 <TextInput 
                    style={styles.searchInput}
                    placeholder="친구 검색 (닉네임)"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    onSubmitEditing={handleSearch}
                 />
                 <TouchableOpacity onPress={handleSearch} style={styles.searchBtn}>
                     {searching ? <ActivityIndicator size="small" /> : <Search size={20} color={colors.primary} />}
                 </TouchableOpacity>
             </View>
             
             {searchResult.length > 0 && (
                 <View style={styles.searchResultBox}>
                     <Text style={styles.sectionTitle}>검색 결과</Text>
                     {searchResult.map((u: any) => (
                         <View key={u.id} style={styles.friendRow}>
                             <Text style={styles.friendName}>{u.nickname}</Text>
                             <TouchableOpacity onPress={() => handleAddFriend(u.id)} style={styles.addBtn}>
                                 <Plus size={16} color="white" />
                             </TouchableOpacity>
                         </View>
                     ))}
                 </View>
             )}

             <Text style={styles.sectionTitle}>내 친구 ({friends.length})</Text>
             {friends.map((f: any) => (
                 <View key={f.friendship_id} style={styles.friendRow}>
                     <View style={styles.friendInfo}>
                         <View style={styles.avatarPlaceholder} />
                         <Text style={styles.friendName}>{f.nickname}</Text>
                     </View>
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
        paddingTop: 10,
        paddingHorizontal: 20,
        paddingBottom: 10,
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
    gridContainer: {
        paddingBottom: 100,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        paddingTop: 16,
        gap: 16,
    },
    FolderCard: {
        width: '47%',
        aspectRatio: 1,
        borderRadius: 24,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        ...shadowStyles.apple,
        marginBottom: 16, // Increased spacing
    },
    folderContent: {
        alignItems: 'center',
    },
    folderEmoji: {
        fontSize: 32,
        marginBottom: 8,
    },
    folderName: {
        fontSize: 16,
        fontFamily: typography.sansBold,
        color: colors.primary,
        marginBottom: 4,
    },
    folderCount: {
        fontSize: 12,
        fontFamily: typography.sans,
        color: colors.gray500,
    },
    addFolderCard: {
        borderWidth: 2,
        borderColor: colors.gray200,
        borderStyle: 'dashed',
        shadowOpacity: 0,
        elevation: 0,
    },
    addFolderText: {
        marginTop: 8,
        fontSize: 14,
        fontFamily: typography.sansBold,
        color: colors.gray400,
    },
    calendarContainer: {
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: 16,
        ...shadowStyles.sm,
    },
    colorRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
        flexWrap: 'wrap',
    },
    colorCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
    colorSelected: {
        borderWidth: 3,
        borderColor: colors.gray400,
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
    dayText: {
        fontSize: 12,
        fontFamily: typography.sans,
    },
    todayText: {
        color: colors.primary,
        fontFamily: typography.sansBold,
    },
    onImageText: {
        color: 'white',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowRadius: 2,
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        backgroundColor: 'rgba(0,0,0,0.6)',
        borderRadius: 8,
        paddingHorizontal: 4,
    },
    badgeText: {
        color: 'white',
        fontSize: 8,
    },
    searchContainer: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        fontFamily: typography.sans,
    },
    searchBtn: {
        padding: 4,
    },
    searchResultBox: {
        marginBottom: 20,
        padding: 12,
        backgroundColor: colors.gray100,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: typography.serif,
        color: colors.primary,
        marginBottom: 12,
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
    friendName: {
        fontSize: 14,
        fontFamily: typography.sansBold,
        color: colors.primary,
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.gray200,
    },
    addBtn: {
        backgroundColor: colors.primary,
        padding: 8,
        borderRadius: 8,
    },
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
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: typography.serif,
    },
    modalBody: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 11,
        fontFamily: typography.sansBold,
        color: '#9CA3AF',
        letterSpacing: 1,
        marginBottom: 8,
        marginTop: 16,
    },
    input: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 14,
        color: '#1a1a1a',
        fontFamily: typography.sans,
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: 12,
        marginTop: 20,
    },
    cancelBtn: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    cancelBtnText: {
        color: colors.gray500,
        fontFamily: typography.sansMedium,
        fontSize: 14,
    },
    createBtn: {
        backgroundColor: '#1a1a1a',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 20,
    },
    createBtnText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    disabledBtn: {
        opacity: 0.5,
    },
    detailHeader: {
        padding: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    backText: {
        marginLeft: 4,
        color: colors.secondary,
        fontWeight: '600',
    },
    detailTitle: {
        fontSize: 24,
        fontFamily: typography.serif,
        color: colors.primary,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: colors.gray400,
    },
    workSelectionScroll: {
        maxHeight: 250, // Approx 2.5 rows visible, scroll for more
        marginTop: 8,
    },
    workSelectionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingBottom: 20,
    },
    workSelectCard: {
        width: '31%',
        aspectRatio: 1,
        borderRadius: 8,
        overflow: 'hidden',
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
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
