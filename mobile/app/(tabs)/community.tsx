import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, FlatList, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
// We don't need top safe area if header is shown
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Plus, Folder, ArrowLeft, Bookmark, X, Check } from 'lucide-react-native';
import api from '@services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, shadowStyles, typography } from '../../constants/designSystem';
import WorkCardGrid from '../../components/work/WorkCardGrid';

import { useLocalSearchParams } from 'expo-router';

export default function WorksScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // 1. State Declarations
    const [works, setWorks] = useState<any[]>([]);
    const [folders, setFolders] = useState<any[]>([]);
    const [selectedFolder, setSelectedFolder] = useState<any>(null);
    const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]); 
    const [bookmarkedWorks, setBookmarkedWorks] = useState<any[]>([]); 
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [folderName, setFolderName] = useState('');
    const [selectedWorks, setSelectedWorks] = useState<number[]>([]);
    const [creating, setCreating] = useState(false);

    // 2. Data Loading Functions
    const loadData = useCallback(async () => {
        try {
            const userJson = await AsyncStorage.getItem('imery-user');
            const u = userJson ? JSON.parse(userJson) : null;
            setUser(u);
            if (u) {
                const [allPosts, bookmarks, myFolders] = await Promise.all([
                    api.getPosts(),
                    api.getBookmarks(u.user_id || u.id),
                    api.getFolders(u.user_id || u.id)
                ]);

                // Filter my works
                const myWorks = allPosts.filter((p: any) => String(p.user_id) === String(u.user_id || u.id));
                const sortedMyWorks = [...myWorks].sort((a, b) => 
                    new Date(b.created_at || b.work_date || 0).getTime() - new Date(a.created_at || a.work_date || 0).getTime()
                );
                setWorks(sortedMyWorks);
                
                // Set Bookmarks & IDs
                 if (Array.isArray(bookmarks)) {
                    const sortedBookmarks = [...bookmarks].sort((a, b) => 
                        new Date(b.created_at || b.work_date || 0).getTime() - new Date(a.created_at || a.work_date || 0).getTime()
                    );
                    setBookmarkedWorks(sortedBookmarks); 
                    setBookmarkedIds(sortedBookmarks.map((b: any) => b.post_id || b.id)); 
                 }
                
                setFolders(myFolders);
            }
        } catch(e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleFolderClick = useCallback(async (folder: any) => {
        let folderWorks = folder.works;
        
        if (!folderWorks && folder.id && !folder.type) {
             try {
                const items = await api.getFolderItems(folder.id);
                folderWorks = [...items].sort((a, b) => 
                    new Date(b.created_at || b.work_date || 0).getTime() - new Date(a.created_at || a.work_date || 0).getTime()
                );
             } catch(e) {
                 folderWorks = [];
             }
        }
        setSelectedFolder({ ...folder, works: folderWorks });
    }, []);

    const handleCreateFolder = useCallback(async () => {
        if (!folderName.trim()) {
            Alert.alert('알림', '폴더 이름을 입력해주세요.');
            return;
        }

        setCreating(true);
        try {
            await api.createFolder({
                user_id: user.user_id || user.id,
                name: folderName,
                post_ids: selectedWorks
            });
            Alert.alert('성공', '새 폴더가 생성되었습니다.');
            setModalVisible(false);
            setFolderName('');
            setSelectedWorks([]);
            
            // Reload folders
            if (user) {
                const myFolders = await api.getFolders(user.user_id || user.id);
                setFolders(myFolders);
            }
        } catch (e) {
            Alert.alert('오류', '폴더 생성에 실패했습니다.');
        } finally {
            setCreating(false);
        }
    }, [user, folderName, selectedWorks]);

    const toggleWorkSelection = useCallback((id: number) => {
        setSelectedWorks(prev => 
            prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id]
        );
    }, []);

    // 3. Effects
    useEffect(() => {
        loadData();
    }, [loadData]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    useEffect(() => {
        if (params.openFolder === 'bookmark') {
             if(works.length > 0 || bookmarkedWorks.length > 0) {
                 handleFolderClick({ 
                    name: '북마크', 
                    works: bookmarkedWorks.length > 0 ? bookmarkedWorks : works.filter(w => bookmarkedIds.includes(w.id)), 
                    type: 'bookmark' 
                });
             }
        } else if (params.openFolder === 'all') {
            if (works.length > 0) {
                handleFolderClick({ name: '전체 작품', works: works, type: 'all' });
            }
        }
    }, [params.openFolder, works, bookmarkedWorks, bookmarkedIds, handleFolderClick]);

    const renderFolderGrid = () => (
        <ScrollView contentContainerStyle={styles.gridContainer}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>작품 폴더</Text>
            </View>

            <View style={styles.grid}>
                 {/* ... */}
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
                        works: bookmarkedWorks, // Use full list
                        type: 'bookmark' 
                    })}
                    activeOpacity={0.8}
                >
                    <View style={styles.folderContent}>
                        <Text style={styles.folderEmoji}>🔖</Text>
                        <Text style={styles.folderName}>북마크</Text>
                        <Text style={styles.folderCount}>{bookmarkedWorks.length}개의 작품</Text>
                    </View>
                </TouchableOpacity>

                {/* Custom Folders */}
                {folders.map(folder => (
                     <TouchableOpacity 
                        key={folder.id}
                        style={styles.folderCard}
                        onPress={() => handleFolderClick(folder)}
                     >
                         <Folder size={40} color={colors.secondary} fill={colors.background} />
                         <Text style={styles.folderName} numberOfLines={1}>{folder.name}</Text>
                         <Text style={styles.folderCount}>{folder.item_count} works</Text>
                     </TouchableOpacity>
                ))}

                {/* Add Folder */}
                <TouchableOpacity 
                    style={[styles.folderCard, styles.addFolderCard]}
                    onPress={() => setModalVisible(true)}
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
            : (selectedFolder.works || []); 

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

             {/* Create Folder Modal */}
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

                            <Text style={styles.inputLabel}>작품 선택 ({selectedWorks.length})</Text>
                            <ScrollView style={styles.workSelectionList} horizontal>
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
                                            source={{ uri: work.image_url ? work.image_url : 'https://via.placeholder.com/150' }}
                                            // Simple uri check, fix with helper if imported
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
                                style={[styles.createBtn, creating && styles.disabledBtn]} 
                                onPress={handleCreateFolder}
                                disabled={creating}
                            >
                                {creating ? <ActivityIndicator color="white" /> : <Text style={styles.createBtnText}>만들기</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        color: colors.gray500,
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
});
