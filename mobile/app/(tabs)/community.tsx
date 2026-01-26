import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, FlatList, Alert } from 'react-native';
import { useRouter } from 'expo-router';
// We don't need top safe area if header is shown
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Plus, Folder, ArrowLeft, Bookmark } from 'lucide-react-native';
import api from '@services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, shadowStyles, typography } from '../../constants/designSystem';
import WorkCardGrid from '../../components/work/WorkCardGrid';

import { useLocalSearchParams } from 'expo-router';

export default function WorksScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [works, setWorks] = useState<any[]>([]);
    
    // ... state ...

    useEffect(() => {
        if (params.openFolder === 'bookmark') {
             // We need to wait for data load or just set selectedFolder type 'bookmark'
             // Ideally we load works first.
             // For now, let's just trigger it if works loaded or simple timeout
             if(works.length > 0) {
                 handleFolderClick({ name: '북마크', works: works.filter(w => bookmarkedIds.includes(w.id)), type: 'bookmark' });
             }
        }
    }, [params.openFolder, works]); // Run when works load or param changes
    const [folders, setFolders] = useState<any[]>([]); // Mock folders for now
    const [selectedFolder, setSelectedFolder] = useState<any>(null);
    const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const userJson = await AsyncStorage.getItem('imery-user');
            const user = userJson ? JSON.parse(userJson) : null;
            if (user) {
                const allPosts = await api.getPosts();
                // Filter my works
                const myWorks = allPosts.filter((p: any) => String(p.user_id) === String(user.user_id || user.id));
                setWorks(myWorks.reverse());
                
                // Mock custom folders logic or load from local storage
                // For now, just empty custom folders
            }
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleFolderClick = (folder: any) => {
        setSelectedFolder(folder);
    };

    const renderFolderGrid = () => (
        <ScrollView contentContainerStyle={styles.gridContainer}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>작품 폴더</Text>
            </View>

            <View style={styles.grid}>
                 {/* All Works */}
                <TouchableOpacity 
                    style={[styles.folderCard, { backgroundColor: '#e0e7ff' }]}
                    onPress={() => handleFolderClick({ name: '전체 작품', works: works, type: 'all' })}
                    activeOpacity={0.8}
                >
                    <View style={styles.folderContent}>
                        <Text style={styles.folderEmoji}>🎨</Text>
                        <Text style={styles.folderName}>전체 작품</Text>
                        <Text style={styles.folderCount}>{works.length}개의 작품</Text>
                    </View>
                </TouchableOpacity>

                 {/* Bookmarks */}
                 <TouchableOpacity 
                    style={[styles.folderCard, { backgroundColor: '#fef3c7' }]} // amber-100
                    onPress={() => handleFolderClick({ 
                        name: '북마크', 
                        works: works.filter(w => bookmarkedIds.includes(w.id)), // In real app, load bookmarks properly
                        type: 'bookmark' 
                    })}
                    activeOpacity={0.8}
                >
                    <View style={styles.folderContent}>
                         <Text style={styles.folderEmoji}>🔖</Text>
                        <Text style={styles.folderName}>북마크</Text>
                         {/* Mock count for bookmarks since we don't have full list here directly */}
                        <Text style={styles.folderCount}>{bookmarkedIds.length}개의 작품</Text>
                    </View>
                </TouchableOpacity>

                {/* Add Folder */}
                <TouchableOpacity 
                    style={[styles.folderCard, styles.addFolderCard]}
                    onPress={() => Alert.alert('알림', '폴더 생성 기능은 준비 중입니다.')}
                >
                     <Plus size={32} color={colors.gray400} />
                     <Text style={styles.addFolderText}>새 폴더</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );

    const renderFolderDetail = () => {
        const displayWorks = selectedFolder.type === 'all' 
            ? works 
            : (selectedFolder.works || []); // Handle filtered works

        return (
            <View style={{ flex: 1 }}>
                <View style={styles.detailHeader}>
                    <TouchableOpacity onPress={() => setSelectedFolder(null)} style={styles.backButton}>
                        <ArrowLeft size={20} color={colors.secondary} />
                        <Text style={styles.backText}>폴더로 돌아가기</Text>
                    </TouchableOpacity>
                    <Text style={styles.detailTitle}>{selectedFolder.name}</Text>
                </View>

                <FlatList
                    data={displayWorks}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    renderItem={({ item }) => (
                        <View style={{ flex: 1, padding: 6 }}>
                            <WorkCardGrid 
                                work={item} 
                                onPress={() => router.push({ pathname: '/work/[id]', params: { id: item.id } })}
                                layout="medium" 
                            />
                        </View>
                    )}
                    contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
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
            {selectedFolder ? renderFolderDetail() : renderFolderGrid()}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: typography.serif,
        color: colors.primary,
    },
    gridContainer: {
        paddingBottom: 100,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        gap: 16,
    },
    folderCard: {
        width: '47%', // roughly half minus gap
        aspectRatio: 1,
        borderRadius: 24,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadowStyles.apple,
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
        color: colors.gray600,
    },
    addFolderCard: {
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.gray200,
        borderStyle: 'dashed',
        shadowOpacity: 0, // No shadow for dashed
        elevation: 0,
    },
    addFolderText: {
        marginTop: 8,
        fontSize: 14,
        fontFamily: typography.sansBold,
        color: colors.gray400,
    },
    // Detail
    detailHeader: {
        padding: 16,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: colors.gray100,
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
    },
    backText: {
        marginLeft: 6,
        fontSize: 13,
        fontFamily: typography.sansBold,
        color: colors.secondary,
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
        fontFamily: typography.sans,
    },
});
