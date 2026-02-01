import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Edit2, Share2, MoreVertical, Check, Star } from 'lucide-react-native';
import api from '../../../services/api';
import { colors, shadowStyles, typography } from '../../../constants/designSystem';

export default function ExhibitionDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    
    const [loading, setLoading] = useState(true);
    const [exhibition, setExhibition] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);

    const [isEditing, setIsEditing] = useState(false);
    const [editReview, setEditReview] = useState('');
    const [editColor, setEditColor] = useState('');

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            const data = await api.getExhibitionDetail(id as string);
            setExhibition(data.exhibition);
            setPosts(data.posts);
        } catch (e) {
            Alert.alert('오류', '전시회 정보를 불러오는데 실패했습니다.');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTicket = async () => {
        try {
            await api.updateExhibition(id as string, {
                review: editReview,
                bg_color: editColor
            });
            Alert.alert('성공', '티켓 정보가 수정되었습니다.');
            setIsEditing(false);
            fetchData();
        } catch (e) {
            Alert.alert('오류', '수정에 실패했습니다.');
        }
    };

    const handleSetRepresentative = async (postId: number) => {
        try {
            await api.updateExhibition(id as string, {
                representative_post_id: postId
            });
            Alert.alert('성공', '대표 작품이 설정되었습니다.');
            fetchData();
        } catch (e) {
            Alert.alert('오류', '대표 작품 설정 실패');
        }
    };

    const renderPost = ({ item }: { item: any }) => (
        <View style={styles.postCardWrapper}>
            <TouchableOpacity 
                style={styles.postCard}
                onPress={() => router.push(`/work/${item.id}` as any)}
            >
                <Image source={{ uri: item.image_url }} style={styles.postImage} />
                <Text style={styles.postTitle} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.postArtist} numberOfLines={1}>{item.artist_name || '작가 미상'}</Text>
            </TouchableOpacity>
            
            {/* Set Representative Button */}
            <TouchableOpacity 
                style={[styles.repBtn, exhibition.representative_post_id === item.id && styles.repBtnActive]}
                onPress={() => handleSetRepresentative(item.id)}
            >
                <Star size={16} color={exhibition.representative_post_id === item.id ? "white" : colors.gray400} fill={exhibition.representative_post_id === item.id ? "white" : "none"} />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000" />
            </View>
        );
    }

    if (!exhibition) return null;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <ArrowLeft size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>티켓 상세</Text>
                <TouchableOpacity style={styles.headerBtn} onPress={() => {
                    if (isEditing) handleUpdateTicket();
                    else {
                        setEditReview(exhibition.review || '');
                        setEditColor(exhibition.bg_color || '#F3F4F6');
                        setIsEditing(true);
                    }
                }}>
                    {isEditing ? <Check size={24} color={colors.blue500} /> : <Edit2 size={24} color="#1a1a1a" />}
                </TouchableOpacity>
            </View>

            <FlatList
                data={posts}
                renderItem={renderPost}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                columnWrapperStyle={styles.columnWrapper}
                contentContainerStyle={styles.content}
                ListHeaderComponent={
                    <View style={styles.infoContainer}>
                        <View style={[styles.ticketStub, { backgroundColor: isEditing ? editColor : (exhibition.bg_color || '#F3F4F6') }]}>
                            {/* Color Picker (Simple) if Editing */}
                            {isEditing && (
                                <View style={styles.colorPicker}>
                                    {['#FFD700', '#FFB3BA', '#BAFFC9', '#BAE1FF', '#E0E0E0'].map(c => (
                                        <TouchableOpacity 
                                            key={c} 
                                            style={[styles.colorDot, { backgroundColor: c }, editColor === c && styles.colorDotSelected]}
                                            onPress={() => setEditColor(c)}
                                        />
                                    ))}
                                </View>
                            )}

                            <View style={styles.ticketHeader}>
                                <Text style={styles.exhibitionTitle}>{exhibition.name}</Text>
                                <Text style={styles.exhibitionDate}>{exhibition.visit_date}</Text>
                            </View>
                            <Text style={styles.exhibitionLocation}>{exhibition.location || '장소 정보 없음'}</Text>
                            
                            <View style={styles.divider} />
                            
                            <Text style={styles.reviewLabel}>MY REVIEW</Text>
                            {isEditing ? (
                                <TextInput
                                    style={styles.reviewInput}
                                    value={editReview}
                                    onChangeText={setEditReview}
                                    multiline
                                    maxLength={50}
                                    placeholder="한 줄 관람평을 남겨주세요"
                                />
                            ) : (
                                <Text style={styles.reviewText}>{exhibition.review || '작성된 후기가 없습니다.'}</Text>
                            )}
                        </View>

                        <Text style={styles.sectionTitle}>
                            COLLECTED WORKS <Text style={{ color: colors.gray400 }}>({posts.length})</Text>
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    headerBtn: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    content: {
        paddingBottom: 40,
    },
    infoContainer: {
        padding: 20,
    },
    ticketStub: {
        borderRadius: 20,
        padding: 24,
        marginBottom: 32,
        ...shadowStyles.apple,
    },
    ticketHeader: {
        marginBottom: 8,
    },
    exhibitionTitle: {
        fontSize: 24,
        fontFamily: typography.serif,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    exhibitionDate: {
        fontSize: 14,
        color: 'rgba(0,0,0,0.6)',
        fontWeight: '600',
    },
    exhibitionLocation: {
        fontSize: 14,
        color: 'rgba(0,0,0,0.5)',
        marginBottom: 20,
    },
    divider: {
        height: 1,
        backgroundColor: 'rgba(0,0,0,0.1)',
        width: '100%',
        marginBottom: 20,
        // Dashed border usually needs specific implementation or image, keeping line for now
    },
    reviewLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'rgba(0,0,0,0.4)',
        marginBottom: 4,
        letterSpacing: 1,
    },
    reviewText: {
        fontSize: 16,
        color: '#1a1a1a',
        fontStyle: 'italic',
        lineHeight: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 16,
        fontFamily: typography.serif,
    },
    columnWrapper: {
        justifyContent: 'space-between',
        paddingHorizontal: 20,
    },
    postCardWrapper: {
        width: '48%',
        marginBottom: 20,
        position: 'relative',
    },
    postCard: {
        width: '100%',
        borderRadius: 12,
        backgroundColor: 'white',
        padding: 10,
        ...shadowStyles.sm,
    },
    postImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 8,
        resizeMode: 'cover',
    },
    postTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 2,
    },
    postArtist: {
        fontSize: 12,
        color: colors.gray500,
    },
    repBtn: {
        position: 'absolute',
        top: 8,
        right: 8,
        padding: 6,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderRadius: 20,
        ...shadowStyles.sm,
    },
    repBtnActive: {
        backgroundColor: '#FFD700',
    },
    colorPicker: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    colorDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'white',
    },
    colorDotSelected: {
        borderColor: '#333',
    },
    reviewInput: {
        fontSize: 16,
        color: '#1a1a1a',
        borderBottomWidth: 1,
        borderColor: 'rgba(0,0,0,0.2)',
        paddingVertical: 4,
    },
});
