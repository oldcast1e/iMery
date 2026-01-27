import { View, Text, FlatList, RefreshControl, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@services/api';
import HighlightCarousel from '../../components/home/HighlightCarousel';
import CategoryTabs from '../../components/home/CategoryTabs';
import ActionBar from '../../components/home/ActionBar';
import FilterChips from '../../components/home/FilterChips';
import WorkCardList from '../../components/work/WorkCardList';
import WorkCardGrid from '../../components/work/WorkCardGrid';
import { colors, typography } from '../../constants/designSystem';

export default function HomeScreen() {
    const router = useRouter();
    const [works, setWorks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('전체');
    const [selectedRating, setSelectedRating] = useState('All');
    const [sortBy, setSortBy] = useState<'latest' | 'name'>('latest');
    const [layout, setLayout] = useState<'list' | 'large' | 'medium' | 'small'>('list');
    
    // Bookmark State (basic local persistence for UI)
    const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);

    const loadData = async () => {
        try {
            const userJson = await AsyncStorage.getItem('imery-user');
            const currentUser = userJson ? JSON.parse(userJson) : null;

            if (currentUser) {
                setUser(currentUser);
                const [postsData, bookmarksData] = await Promise.all([
                    api.getPosts(),
                    api.getBookmarks(currentUser.user_id || currentUser.id)
                ]);
                
                const posts = Array.isArray(postsData) ? postsData : (postsData.posts || []);
                const userWorks = posts.filter((w: any) => String(w.user_id) === String(currentUser.user_id || currentUser.id));
                // Explicitly sort by created_at descending (latest first)
                const sortedWorks = [...userWorks].sort((a, b) => 
                    new Date(b.created_at || b.work_date).getTime() - new Date(a.created_at || a.work_date).getTime()
                );
                setWorks(sortedWorks);

                if (Array.isArray(bookmarksData)) {
                    setBookmarkedIds(bookmarksData.map((b: any) => b.post_id || b.id));
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, []);

    useEffect(() => {
        loadData();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    // Derived State (Filtering)
    const processedWorks = useMemo(() => {
        let filtered = works;

        // Search
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(w =>
                w.title?.toLowerCase().includes(query) ||
                w.artist?.toLowerCase().includes(query) ||
                (w.genre && w.genre.toLowerCase().includes(query))
            );
        }

        // Genre
        if (selectedGenre !== '전체') {
            filtered = filtered.filter(w => w.genre === selectedGenre);
        }

        // Rating
        if (selectedRating !== 'All') {
            const ratingNum = parseInt(selectedRating.replace('★', ''));
            filtered = filtered.filter(w => w.rating === ratingNum);
        }

        // Sort
        if (sortBy === 'latest') {
            filtered = [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (sortBy === 'name') {
            filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
        }

        return filtered;
    }, [works, searchQuery, selectedGenre, selectedRating, sortBy]);

    const handleBookmarkToggle = (id: number) => {
        if (!user) return;
        setBookmarkedIds(prev => 
            prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
        );
        api.toggleBookmark(user.user_id || user.id, id).catch(() => {});
    };

    const handleDeleteWork = async (id: number) => {
        Alert.alert("삭제", "정말 삭제하시겠습니까?", [
            { text: "취소", style: "cancel" },
            { 
                text: "삭제", 
                style: "destructive", 
                onPress: async () => {
                    try {
                        await api.deletePost(id);
                        setWorks(prev => prev.filter(w => w.id !== id));
                        // Also remove from processed if needed, handled by useMemo
                    } catch (e) {
                        Alert.alert("오류", "삭제 실패");
                    }
                }
            }
        ]);
    };

    // Render Items
    const renderItem = ({ item }: { item: any }) => {
        const isBookmarked = bookmarkedIds.includes(item.id);
        const onPress = () => router.push({ pathname: '/work/[id]', params: { id: item.id } });

        if (layout === 'list') {
            return (
                <View style={{ paddingHorizontal: 16 }}>
                    <WorkCardList 
                        work={item} 
                        onPress={onPress}
                        onBookmarkToggle={handleBookmarkToggle}
                        isBookmarked={isBookmarked}
                        onEdit={() => router.push({ pathname: '/work/edit', params: { id: item.id } })}
                        onDelete={() => handleDeleteWork(item.id)}
                    />
                </View>
            );
        } 
        
        // Grid Layout logic handled better by key changes in FlatList usually, but here we can stick to list for now
        // or wrap in view style.
        // For simplicity in this step, if layout != list, we use Grid style
        // Note: Changing numColumns dynamically in FlatList requires changing key prop.
        return (
            <View style={{ flex: 1, padding: 6 }}>
                 <WorkCardGrid work={item} onPress={onPress} layout={layout as any} />
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {loading && !refreshing ? (
                <View style={styles.centerLoading}>
                    <ActivityIndicator size="large" color={colors.iMeryBlue} />
                </View>
            ) : (
                <FlatList
                    key={layout} // Force re-render when columns change
                    data={processedWorks}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    numColumns={layout === 'list' ? 1 : (layout === 'medium' ? 2 : 3)}
                    contentContainerStyle={{ paddingBottom: 100 }} // Space for TabBar
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListHeaderComponent={
                        <>
                            <HighlightCarousel 
                                works={works} 
                                onWorkClick={(work) => router.push({ pathname: '/work/[id]', params: { id: work.id } })}
                                onMoreClick={() => router.push({ pathname: '/(tabs)/community', params: { openFolder: 'all' } })}
                            />
                            
                            {/* CategoryTabs has bottom padding inside or we just rely on tight spacing */}
                            <CategoryTabs 
                                selectedGenre={selectedGenre} 
                                onGenreChange={setSelectedGenre} 
                            />
                            
                            {/* Removed Divider */}

                            <ActionBar 
                                searchQuery={searchQuery} 
                                onSearchChange={setSearchQuery} 
                                onBookmarkClick={() => router.push({ pathname: '/(tabs)/community', params: { openFolder: 'bookmark' } })}
                            />

                            <FilterChips 
                                selectedRating={selectedRating} 
                                onRatingChange={setSelectedRating}
                                sortBy={sortBy}
                                onSortChange={setSortBy}
                                layout={layout}
                                onLayoutChange={setLayout}
                            />

                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>저장된 작품</Text>
                                {/* See More button logic can go here */}
                            </View>
                        </>
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>아직 기록된 작품이 없습니다.</Text>
                            <Text style={styles.emptySubText}>당신의 감각을 깨우는 작품을 찾아 기록해보세요.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background, // Cream-50
    },
    centerLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray100,
        marginVertical: 24,
    },
    sectionHeader: {
        paddingHorizontal: 16,
        marginBottom: 8,
        marginTop: 0, // Consistent section spacing via previous element bottom margin
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: typography.serif,
        color: colors.secondary,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontFamily: typography.sansBold,
        color: colors.primary,
        marginBottom: 8,
    },
    emptySubText: {
        fontSize: 14,
        fontFamily: typography.sans,
        color: colors.gray500,
    },
});
