import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ScrollView, Modal, Pressable, FlatList } from 'react-native';
import { Bookmark, Heart, MessageCircle, ChevronDown, Check, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
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
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'likes' | 'comments' | 'bookmarks'>('likes');
    const [originalData, setOriginalData] = useState<any[]>([]); // Store original for filtering
    const [listData, setListData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Filters
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    
    // Date Filter
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month' | 'year' | 'custom'>('all');
    
    // Author Filter
    const [showAuthorFilter, setShowAuthorFilter] = useState(false);
    const [selectedAuthors, setSelectedAuthors] = useState<string[]>([]);
    const [uniqueAuthors, setUniqueAuthors] = useState<string[]>([]);


    useEffect(() => {
        if (userId) {
            loadTabData();
        }
    }, [userId, activeTab]); 

    // Re-apply filters when filter state changes
    useEffect(() => {
        applyFilters(originalData, sortOrder, dateFilter, selectedAuthors);
    }, [sortOrder, dateFilter, selectedAuthors, originalData]);

    const applyFilters = (data: any[], sort: string, date: string, authors: string[]) => {
        let filtered = [...data];

        // 1. Author Filter
        if (authors.length > 0) {
            filtered = filtered.filter(item => {
                const author = item.artist_name || item.artist || 'Unknown';
                return authors.includes(author);
            });
        }

        // 2. Date Filter
        if (date !== 'all') {
            const now = new Date();
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.created_at || item.work_date);
                const diffTime = Math.abs(now.getTime() - itemDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
                
                if (date === 'week') return diffDays <= 7;
                if (date === 'month') return diffDays <= 30;
                if (date === 'year') return diffDays <= 365;
                return true;
            });
        }

        // 3. Sort
        if (activeTab === 'likes' || activeTab === 'bookmarks') {
            filtered.sort((a: any, b: any) => {
                const dateA = new Date(a.created_at || a.work_date).getTime();
                const dateB = new Date(b.created_at || b.work_date).getTime();
                return sort === 'newest' ? dateB - dateA : dateA - dateB;
            });
        }

        setListData(filtered);
    };

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
            
            setOriginalData(data);
            applyFilters(data, sortOrder, dateFilter, selectedAuthors);
            
            // Extract Authors
            if (activeTab === 'likes' || activeTab === 'bookmarks') {
                const authors = Array.from(new Set(data.map((item: any) => item.artist_name || item.artist || 'Unknown'))).filter(Boolean) as string[];
                setUniqueAuthors(authors);
            }
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
                <TouchableOpacity 
                    style={[styles.filterChip, dateFilter !== 'all' && styles.filterChipActive]}
                    onPress={() => setShowDateFilter(true)}
                >
                    <Text style={[styles.filterText, dateFilter !== 'all' && styles.filterTextActive]}>
                        {dateFilter === 'all' ? '모든 날짜' : 
                         dateFilter === 'week' ? '지난 주' :
                         dateFilter === 'month' ? '지난 달' :
                         dateFilter === 'year' ? '최근 1년' : '기간'}
                    </Text>
                    <ChevronDown size={14} color={dateFilter !== 'all' ? colors.primary : "#333"} />
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.filterChip, selectedAuthors.length > 0 && styles.filterChipActive]}
                    onPress={() => setShowAuthorFilter(true)}
                >
                    <Text style={[styles.filterText, selectedAuthors.length > 0 && styles.filterTextActive]}>
                        {selectedAuthors.length > 0 ? `${selectedAuthors.length}명 선택됨` : '모든 작성자'}
                    </Text>
                    <ChevronDown size={14} color={selectedAuthors.length > 0 ? colors.primary : "#333"} />
                </TouchableOpacity>
            </View>

            {/* Date Filter Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showDateFilter}
                onRequestClose={() => setShowDateFilter(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowDateFilter(false)}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>날짜별 필터링</Text>
                            <TouchableOpacity onPress={() => setShowDateFilter(false)}>
                                <X size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        {['all', 'week', 'month', 'year'].map((opt) => (
                            <TouchableOpacity 
                                key={opt}
                                style={styles.modalOption} 
                                onPress={() => {
                                    setDateFilter(opt as any);
                                    setShowDateFilter(false);
                                }}
                            >
                                <Text style={[styles.modalOptionText, dateFilter === opt && styles.modalOptionTextActive]}>
                                    {opt === 'all' ? '모든 날짜' : 
                                     opt === 'week' ? '지난 주' :
                                     opt === 'month' ? '지난 달' : '최근 1년'}
                                </Text>
                                {dateFilter === opt && <Check size={20} color={colors.primary} />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </Pressable>
            </Modal>

            {/* Author Filter Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showAuthorFilter}
                onRequestClose={() => setShowAuthorFilter(false)}
            >
                <Pressable style={styles.modalOverlay} onPress={() => setShowAuthorFilter(false)}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>작성자로 필터링</Text>
                            <TouchableOpacity onPress={() => setShowAuthorFilter(false)}>
                                <X size={24} color="#333" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 300 }}>
                            <TouchableOpacity 
                                style={styles.modalOption} 
                                onPress={() => setSelectedAuthors([])}
                            >
                                <Text style={[styles.modalOptionText, selectedAuthors.length === 0 && styles.modalOptionTextActive]}>
                                    모든 작성자
                                </Text>
                                {selectedAuthors.length === 0 && <Check size={20} color={colors.primary} />}
                            </TouchableOpacity>
                            {uniqueAuthors.map((author) => {
                                const isSelected = selectedAuthors.includes(author);
                                return (
                                    <TouchableOpacity 
                                        key={author}
                                        style={styles.modalOption} 
                                        onPress={() => {
                                            if (isSelected) {
                                                setSelectedAuthors(prev => prev.filter(p => p !== author));
                                            } else {
                                                setSelectedAuthors(prev => [...prev, author]);
                                            }
                                        }}
                                    >
                                        <Text style={[styles.modalOptionText, isSelected && styles.modalOptionTextActive]}>
                                            {author}
                                        </Text>
                                        {isSelected && <Check size={20} color={colors.primary} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                </Pressable>
            </Modal>
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
                                    <TouchableOpacity 
                                        key={item.id} 
                                        style={styles.bookmarkItem}
                                        onPress={() => router.push(`/work/${item.post_id || item.id}`)}
                                    >
                                        <Image source={{ uri: item.image_url }} style={styles.bookmarkImage} />
                                        <View style={{ flex: 1, justifyContent: 'center' }}>
                                            <Text style={styles.bookmarkTitle}>{item.title}</Text>
                                            <Text style={styles.bookmarkArtist}>{item.artist_name}</Text>
                                            <Text style={styles.bookmarkDate}>{item.work_date}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            // Likes: Instagram Style Grid (Image Only, No gaps)
                            <View style={styles.gridWrapper}>
                                {listData.map((item) => (
                                    <TouchableOpacity 
                                        key={item.id} 
                                        style={{ 
                                            width: GRID_ITEM_WIDTH, 
                                            height: GRID_ITEM_WIDTH, 
                                            borderWidth: 0.5, 
                                            borderColor: '#fff' 
                                        }}
                                        onPress={() => router.push(`/work/${item.post_id || item.id}`)}
                                    >
                                       <Image source={{ uri: item.image_url }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                    </TouchableOpacity>
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
    filterChipActive: {
        backgroundColor: colors.primary + '10',
        borderColor: colors.primary,
        borderWidth: 1,
    },
    filterTextActive: {
        color: colors.primary,
        fontWeight: '700',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 40,
        maxHeight: '80%',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    modalOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 4,
        borderBottomWidth: 0.5,
        borderBottomColor: '#f5f5f5',
    },
    modalOptionText: {
        fontSize: 16,
        color: '#333',
    },
    modalOptionTextActive: {
        color: colors.primary,
        fontWeight: '600',
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
