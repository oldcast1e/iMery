import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, RefreshControl, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Globe } from 'lucide-react-native';
import api from '@services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, shadowStyles, typography } from '../../constants/designSystem';
import FeedCard from '../../components/feed/FeedCard';

const HEADER_HEIGHT = 60; // Height of the toggle area

export default function FeedScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'community' | 'following'>('community');
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [user, setUser] = useState<any>(null);

    // Animation Refs (Imperative control) - Fade Only
    const scrollY = useRef(new Animated.Value(0)).current;
    const headerOpacity = useRef(new Animated.Value(1)).current;
    const lastScrollY = useRef(0);
    const inactivityTimer = useRef<NodeJS.Timeout | null>(null);

    // Helpers
    const showHeader = () => {
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
        Animated.timing(headerOpacity, { 
            toValue: 1, 
            duration: 250, // Slightly slower for smoother fade
            useNativeDriver: true 
        }).start();
    };

    const hideHeader = () => {
        // Never hide at top
        if (lastScrollY.current < 50) return;

        Animated.timing(headerOpacity, { 
            toValue: 0, 
            duration: 250, 
            useNativeDriver: true 
        }).start();
    };

    const startInactivityTimer = () => {
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
        // Auto-hide after 3 seconds of inactivity (unless at top)
        inactivityTimer.current = setTimeout(() => {
            if (lastScrollY.current >= 50) { 
                hideHeader();
            }
        }, 3000);
    };

    // Interaction Handlers
    const handleTouchStart = () => {
        // User touched screen -> Show header
        showHeader();
    };

    const handleTouchEnd = () => {
        // User stopped touching -> Start timer to hide
        startInactivityTimer();
    };

    const handleScroll = Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        {
            useNativeDriver: true,
            listener: (e: any) => {
                const currentOffset = e.nativeEvent.contentOffset.y;
                const direction = currentOffset > lastScrollY.current ? 'down' : 'up';
                lastScrollY.current = currentOffset;

                // 1. Always visible at top
                if (currentOffset < 50) {
                    showHeader();
                    return; 
                }

                // 2. Hide on scroll down
                if (direction === 'down') {
                    hideHeader();
                    // Clear timer, we are hiding explicitly
                    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
                } 
                // 3. Show on scroll up
                else if (direction === 'up') {
                    showHeader();
                    // We are active, so restart timer (will trigger when scroll stops)
                    startInactivityTimer();
                }
            }
        }
    );

    const loadFeed = useCallback(async () => {
        try {
            const userJson = await AsyncStorage.getItem('imery-user');
            const u = userJson ? JSON.parse(userJson) : null;
            setUser(u);

            const fetched = await api.getFeed(activeTab, u?.user_id || u?.id);
            setPosts(fetched);
        } catch (e) {
            console.error('Failed to load feed:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [activeTab]);

    useEffect(() => {
        setLoading(true);
        loadFeed();
        showHeader(); // Force show on mount
    }, [activeTab]);

    useFocusEffect(
        useCallback(() => {
           loadFeed();
           showHeader(); // Force show on focus
        }, [loadFeed])
    );

    const onRefresh = () => {
        setRefreshing(true);
        loadFeed().then(() => {
            showHeader(); // Force show after refresh
        });
    };

    // Optimistic Update Helpers
    const handleLike = async (postId: number) => {
        // Optimistically update UI
        setPosts(prev => prev.map(p => {
             if (p.id === postId) {
                 const newLiked = !p.is_liked;
                 return { 
                     ...p, 
                     is_liked: newLiked,
                     like_count: newLiked ? p.like_count + 1 : p.like_count - 1 
                 };
             }
             return p;
        }));
        
        try {
            await api.likePost(postId);
        } catch (e) {
            // Revert on failure
             console.error('Like failed', e);
             loadFeed(); // Simple revert: reload
        }
    };

    const handleBookmark = async (postId: number) => {
        // Optimistically update UI
        setPosts(prev => prev.map(p => {
             if (p.id === postId) {
                 return { ...p, is_bookmarked: !p.is_bookmarked };
             }
             return p;
        }));
        
        try {
            await api.bookmarkPost(postId);
        } catch (e) {
             console.error('Bookmark failed', e);
             loadFeed();
        }
    };

    const renderTabButton = (id: 'community' | 'following', label: string, Icon: any) => {
        const isActive = activeTab === id;
        return (
            <TouchableOpacity 
                onPress={() => setActiveTab(id)}
                style={[styles.tabButton, isActive && styles.activeTabButton]}
            >
                <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>{label}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Dynamic Overlay Header */}
            <Animated.View 
                style={[
                    styles.header, 
                    { 
                        opacity: headerOpacity,
                        zIndex: 10, // Ensure overlay
                        // No transform here, just pure fade
                    }
                ]}
            >
                <View style={styles.tabContainer}>
                    {renderTabButton('community', 'Community', Globe)}
                    {renderTabButton('following', 'Following', Users)}
                </View>
            </Animated.View>

            {loading ? (
                <View style={styles.centerLoading}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <Animated.FlatList
                    data={posts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <FeedCard 
                            work={item} 
                            onPress={() => router.push(`/work/${item.id}`)} 
                            onLike={() => handleLike(item.id)}
                            onComment={() => router.push(`/work/${item.id}`)} // Navigate to detail for comments
                            onBookmark={() => handleBookmark(item.id)}
                        /> 
                    )}
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    
                    // Scroll Animation Props
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    
                    // Interaction Handlers for Auto-Hide Logic
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onScrollBeginDrag={handleTouchStart}
                    onScrollEndDrag={handleTouchEnd}
                    onMomentumScrollBegin={handleTouchStart}
                    onMomentumScrollEnd={handleTouchEnd}

                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {activeTab === 'community' 
                                    ? '게시된 작품이 없습니다.' 
                                    : '친구들의 새 작품이 없습니다.'}
                            </Text>
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
        backgroundColor: '#F9FAFB',
    },
    header: {
        position: 'absolute', // Float over content
        top: 10,
        left: 0,
        right: 0,
        height: HEADER_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        // Transparent to allow seeing cards underneath as requested "Overlay"
        backgroundColor: 'transparent', 
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#E5E7EB',
        borderRadius: 100,
        padding: 4,
        gap: 0, 
    },
    tabButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
    },
    activeTabButton: {
        backgroundColor: colors.white,
        ...shadowStyles.sm,
    },
    tabLabel: {
        fontSize: 14,
        fontFamily: typography.sansBold,
        color: colors.gray400,
    },
    activeTabLabel: {
        color: colors.primary,
    },
    centerLoading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingBottom: 20,
        // Added padding to ensure initial gap below header (True Overlay with init gap)
        paddingTop: 80, 
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
        marginTop: HEADER_HEIGHT, // push down empty state too
    },
    emptyText: {
        fontSize: 14,
        color: colors.gray500,
        fontFamily: typography.sans,
    },
});
