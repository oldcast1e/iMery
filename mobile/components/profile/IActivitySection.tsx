import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView } from 'react-native';
import { Bookmark, Heart, MessageCircle, ChevronDown } from 'lucide-react-native';
import { colors } from '../../constants/designSystem';
import api from '@services/api';
import WorkCardGrid from '../../components/work/WorkCardGrid';

const { width } = Dimensions.get('window');
const GAP = 1; 
const PADDING = 12; // Increased side padding
const GRID_ITEM_WIDTH = (width - (PADDING * 2)) / 3;

interface IActivitySectionProps {
    userId: number;
}

export default function IActivitySection({ userId }: IActivitySectionProps) {
    const [activeTab, setActiveTab] = useState<'likes' | 'comments' | 'bookmarks'>('likes');
    const [listData, setListData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

    useEffect(() => {
        if (userId) {
            loadTabData();
        }
    }, [userId, activeTab, sortOrder]); // Add sortOrder dep

    const loadTabData = async () => {
        setLoading(true);
        try {
            let data = [];
            if (activeTab === 'bookmarks') {
                 data = await api.getBookmarks(userId);
            } else if (activeTab === 'likes') {
                 const rawData = await api.getMyLikes(userId);
                 data = rawData.map((item: any) => ({
                     ...item,
                     artist: item.artist_name || item.artist
                 }));
            } else if (activeTab === 'comments') {
                 data = await api.getMyComments(userId);
            }
            
            // Apply Sort
            if (activeTab === 'likes' || activeTab === 'bookmarks') {
                data.sort((a: any, b: any) => {
                    const dateA = new Date(a.created_at || a.work_date).getTime();
                    const dateB = new Date(b.created_at || b.work_date).getTime();
                    return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
                });
            }

            setListData(data);
        } catch (e) {
            console.error(e);
            setListData([]);
        } finally {
            setLoading(false);
        }
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>아직 기록이 없어요.</Text>
        </View>
    );

    const renderFilters = () => (
        <View style={styles.filterContainer}>
            <View style={styles.filterRowCentered}> 
                <TouchableOpacity 
                    style={styles.filterChip}
                    onPress={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                >
                    <Text style={styles.filterText}>{sortOrder === 'newest' ? '최신순' : '오래된순'}</Text>
                    <ChevronDown size={14} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterChip}>
                    <Text style={styles.filterText}>모든 날짜</Text>
                    <ChevronDown size={14} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterChip}>
                    <Text style={styles.filterText}>모든 작성자</Text>
                    <ChevronDown size={14} color="#333" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScrollView 
            style={[styles.container, activeTab === 'likes' && { paddingHorizontal: PADDING }]}
            showsVerticalScrollIndicator={false}
        > 
            {/* Conditional padding: Likes tab uses full width for grid */}
            
            {/* Header Unified (Moved to activity.tsx) */}

            {/* Tabs */}
            <View style={styles.tabContainer}>
                 {/* Re-ordered and Styled Tabs */}
                 <TouchableOpacity 
                    style={[styles.tabItem, activeTab === 'likes' && styles.tabItemActive]}
                    onPress={() => setActiveTab('likes')}
                >
                    <Heart size={20} color={activeTab === 'likes' ? colors.primary : colors.gray400} />
                    <Text style={[styles.tabText, activeTab === 'likes' && styles.tabTextActive]}>좋아요</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tabItem, activeTab === 'comments' && styles.tabItemActive]}
                    onPress={() => setActiveTab('comments')}
                >
                    <MessageCircle size={20} color={activeTab === 'comments' ? colors.primary : colors.gray400} />
                    <Text style={[styles.tabText, activeTab === 'comments' && styles.tabTextActive]}>댓글</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tabItem, activeTab === 'bookmarks' && styles.tabItemActive]}
                    onPress={() => setActiveTab('bookmarks')}
                >
                    <Bookmark size={20} color={activeTab === 'bookmarks' ? colors.primary : colors.gray400} />
                    <Text style={[styles.tabText, activeTab === 'bookmarks' && styles.tabTextActive]}>북마크</Text>
                </TouchableOpacity>
            </View>

            {/* Filters (Likes only) */}
            {activeTab === 'likes' && renderFilters()}

            {/* List */}
            <View style={styles.listContainer}>
                {loading ? (
                    <Text style={styles.loadingText}>Loading...</Text>
                ) : (
                    listData.length === 0 ? renderEmptyState() : (
                        activeTab === 'comments' ? (
                            <View style={{ padding: 20 }}>
                                {listData.map((comment: any) => (
                                    <View key={comment.id} style={styles.commentItem}>
                                        <Text style={styles.commentContent}>{comment.content}</Text>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                                            <Text style={styles.commentTarget}>{comment.post_title || 'Unknown Work'}</Text>
                                            <Text style={styles.commentDate}>{new Date(comment.created_at).toLocaleDateString()}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : activeTab === 'bookmarks' ? (
                            <View style={{ padding: 20 }}>
                                {listData.map((item) => (
                                    <View key={item.id} style={styles.bookmarkItem}>
                                        <Image source={{ uri: item.image_url }} style={styles.bookmarkImage} />
                                        <View style={{ flex: 1, justifyContent: 'center' }}>
                                            <Text style={styles.bookmarkTitle}>{item.title}</Text>
                                            <Text style={styles.bookmarkArtist}>{item.artist_name}</Text>
                                            <Text style={styles.bookmarkDate}>{item.work_date}</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        ) : (
                            // Likes: Instagram Style Grid (Image Only, No gaps)
                            <View style={styles.gridWrapper}>
                                {listData.map((item) => (
                                    <View key={item.id} style={{ width: GRID_ITEM_WIDTH, height: GRID_ITEM_WIDTH, borderWidth: 0.5, borderColor: '#fff' }}>
                                       <Image source={{ uri: item.image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                    </View>
                                ))}
                            </View>
                        )
                    )
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
    },
    // Header styles removed as it's now handled in parent
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 0, 
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        justifyContent: 'space-around',
        backgroundColor: 'white',
    },
    tabItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 6,
        flex: 1,
        justifyContent: 'center',
    },
    tabItemActive: {
        borderBottomWidth: 2,
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: 15,
        color: colors.gray400,
        fontWeight: '500',
    },
    tabTextActive: {
        color: colors.primary,
        fontWeight: '600',
    },
    listContainer: {
        minHeight: 100,
    },
    loadingText: {
        textAlign: 'center',
        padding: 20,
        color: colors.gray500,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 50,
    },
    emptyText: {
        color: colors.gray400,
    },
    gridWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
    },
    // Filter Styles
    filterContainer: {
        paddingVertical: 12,
        backgroundColor: 'white',
    },
    filterRowCentered: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        gap: 4,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1F2937',
    },
    // Comment & Bookmark Styles
    commentItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    commentContent: {
        fontSize: 15,
        color: '#333',
        marginBottom: 8,
        lineHeight: 20,
    },
    commentTarget: {
        fontSize: 12,
        color: colors.primary,
        fontWeight: '600',
    },
    commentDate: {
        fontSize: 12,
        color: colors.gray400,
    },
    bookmarkItem: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        gap: 16,
    },
    bookmarkImage: {
        width: 60,
        height: 80,
        borderRadius: 8,
        backgroundColor: colors.gray100,
    },
    bookmarkTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    bookmarkArtist: {
        fontSize: 14,
        color: colors.gray600,
        marginBottom: 4,
    },
    bookmarkDate: {
        fontSize: 12,
        color: colors.gray400,
    },
});
