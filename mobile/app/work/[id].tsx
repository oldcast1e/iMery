import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, TextInput, StyleSheet, Dimensions, Platform, Animated, Easing } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Share2, Clock, Music, Pause, Play, Sparkles, Send, Tag } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Sharing from 'expo-sharing';
import api from '@services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getImageUrl } from '../../utils/imageHelper';
import { colors, shadowStyles, typography } from '../../constants/designSystem';

const { width } = Dimensions.get('window');

export default function WorkDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [work, setWork] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const soundRef = useRef<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisData, setAnalysisData] = useState<any>(null);

    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState('');

    // Clean up sound on unmount
    // Animation Values
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Music Animation Loop
    useEffect(() => {
        if (isPlaying) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 800,
                        useNativeDriver: true,
                        easing: Easing.inOut(Easing.ease)
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 800,
                        useNativeDriver: true,
                         easing: Easing.inOut(Easing.ease)
                    })
                ])
            ).start();
        } else {
            pulseAnim.setValue(1); // Reset
            pulseAnim.stopAnimation();
        }
    }, [isPlaying]);

    // Audio Cleanup on Leave (Focus Loss)
    useFocusEffect(
        React.useCallback(() => {
            return () => {
                if (soundRef.current) {
                    console.log('Unloading sound on blur');
                    soundRef.current.unloadAsync(); // Stop and unload
                    setIsPlaying(false);
                }
            };
        }, [])
    );

    // Load Data
    useEffect(() => {
        loadWorkDetails();
    }, [id]);

    const loadWorkDetails = async () => {
        try {
            const userJson = await AsyncStorage.getItem('imery-user');
            if (userJson) setUser(JSON.parse(userJson));

            const allPosts = await api.getPosts();
            const foundWork = allPosts.find((p: any) => String(p.id) === String(id));

            if (foundWork) {
                setWork(foundWork);
                loadComments(foundWork.id);

                if (foundWork.music_url) {
                    playMusic(foundWork.music_url); // Auto-play attempt
                }

                // Check for analysis on load
                if (foundWork.is_analyzed && foundWork.ai_summary) {
                    setAnalysisData({
                        ...foundWork,
                        ai_summary: foundWork.ai_summary,
                    });
                }
            } else {
                Alert.alert('Error', 'Work not found');
                router.back();
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to load work details');
        } finally {
            setLoading(false);
        }
    };

    const loadComments = async (workId: any) => {
        try {
            const data = await api.getComments(workId);
            setComments(data);
        } catch (e) {
            console.error(e);
        }
    };

    const playMusic = async (url: string) => {
        try {
            if (soundRef.current) {
                await soundRef.current.unloadAsync();
            }
            
            console.log('Loading sound:', url);
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: url },
                { shouldPlay: true, isLooping: true }
            );
            soundRef.current = newSound;
            setIsPlaying(true);
        } catch (e) {
            console.log('Audio play failed', e);
        }
    };

    const togglePlayback = async () => {
        if (!soundRef.current) {
            if (work?.music_url) await playMusic(work.music_url);
            return;
        }
        
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
            if (status.isPlaying) {
                await soundRef.current.pauseAsync();
                setIsPlaying(false);
            } else {
                await soundRef.current.playAsync();
                setIsPlaying(true);
            }
        }
    };

    const handleAnalyze = async () => {
        if (isAnalyzing || !work) return;
        setIsAnalyzing(true);

        try {
            // Simulate delay for effect
            await new Promise(resolve => setTimeout(resolve, 2000));

            const response = await api.analyzePost(work.id);
            // API usually returns { result: { styles: [], genre: ... }, ai_summary, music_url }
            // Adjust based on your actual API response structure
            const result = response.result || {};

            const flattened = {
                ...result,
                ai_summary: response.ai_summary || result.ai_summary || 'Analysis complete.',
                ...(result.styles || []).reduce((acc: any, s: any, i: number) => ({
                    ...acc,
                    [`style${i + 1}`]: s.name,
                    [`score${i + 1}`]: s.score
                }), {}),
                is_analyzed: true
            };

            setAnalysisData(flattened);

            if (response.music_url) {
                playMusic(response.music_url);
            }

        } catch (e) {
            Alert.alert('Analysis Failed', 'Could not analyze artwork.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleAddComment = async () => {
        if (!user || !commentText.trim()) return;
        try {
            await api.addComment(work.id, user.user_id || user.id, commentText);
            setCommentText('');
            loadComments(work.id);
        } catch (e) {
            Alert.alert('Error', 'Failed to post comment');
        }
    };

    const handleShare = async () => {
        if (work?.image_url) {
            await Sharing.shareAsync(work.image_url);
        }
    };

    if (loading || !work) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator color={colors.white} size="large" />
            </View>
        );
    }
    
    // Determine active display data (Analysis vs Default)
    const effectiveData = analysisData || work;
    
    // Parse Tags Robustly
    let tags: string[] = [];
    try {
        if (Array.isArray(work.tags)) {
            tags = work.tags.map((t: any) => typeof t === 'object' ? t.label : t);
        } else if (typeof work.tags === 'string') {
            // Handle "[ "tag1", "tag2" ]" string from DB
            const parsed = JSON.parse(work.tags);
            if (Array.isArray(parsed)) {
                tags = parsed.map((t: any) => typeof t === 'object' ? t.label : t);
            }
        }
    } catch (e) {
        console.log('Tag parse error', e);
        tags = [];
    }

    return (
        <View style={styles.container}>
            {/* Header Image */}
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: getImageUrl(work.image_url || work.thumbnail || work.image) }}
                    style={styles.image}
                    resizeMode="contain"
                />
                <LinearGradient
                    colors={['rgba(0,0,0,0.6)', 'transparent']}
                    style={[styles.headerGradient, { paddingTop: insets.top }]}
                >
                    <TouchableOpacity 
                        onPress={() => router.back()} 
                        style={styles.backButton}
                        hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                    >
                        <ArrowLeft color={colors.white} size={28} />
                    </TouchableOpacity>
                </LinearGradient>
            </View>

            {/* Content Body */}
            <ScrollView 
                style={styles.bodyScroll} 
                contentContainerStyle={styles.bodyContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Title & Meta Header */}
                <View style={styles.metaSection}>
                    <View style={styles.titleRow}>
                        <View style={{ flex: 1 }}>
                            <View style={styles.pillRow}>
                                <View style={styles.genrePill}>
                                    <Text style={styles.pillText}>{work.genre || '그림'}</Text>
                                </View>
                                {(effectiveData.style || effectiveData.style1) && (
                                    <View style={styles.stylePill}>
                                        <Text style={styles.pillText}>{effectiveData.style || effectiveData.style1}</Text>
                                    </View>
                                )}
                            </View>
                            <Text style={styles.title}>{work.title}</Text>
                        </View>
                        
                        {/* Audio & Share */}
                        <View style={styles.actionButtons}>
                            <TouchableOpacity
                                onPress={togglePlayback}
                                activeOpacity={0.8}
                            >
                                <Animated.View style={[
                                    styles.circleButton, 
                                    isPlaying && styles.activeCircleButton,
                                    { transform: [{ scale: pulseAnim }] }
                                ]}>
                                    {isPlaying ? (
                                        <Pause size={18} color={isPlaying ? colors.white : colors.primary} />
                                    ) : (
                                        <Music size={18} color={work.music_url ? "#4f46e5" : colors.gray400} />
                                    )}
                                </Animated.View>
                            </TouchableOpacity>
                             <TouchableOpacity onPress={handleShare} style={styles.circleButton}>
                                <Share2 size={18} color={colors.gray500} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <Clock size={14} color={colors.gray500} />
                        <Text style={styles.infoText}>{work.work_date || 'Unknown Date'}</Text>
                        <View style={styles.dot} />
                        <Text style={[styles.infoText, { color: colors.primary, fontWeight: '600' }]}>
                            {work.artist_name || 'Unknown Artist'}
                        </Text>
                    </View>
                    
                     {/* Tags - Moved Here & Styled */}
                    {tags.length > 0 && (
                        <View style={styles.tagRow}>
                            {tags.map((tag: string, i: number) => (
                                <View key={i} style={styles.tagBadge}>
                                    <Tag size={12} color={colors.gray400} style={{marginRight:4}} />
                                    <Text style={styles.tagText}>{tag}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>

                {/* AI Analysis Section */}
                <View style={styles.section}>
                    {(effectiveData.is_analyzed) ? (
                        <LinearGradient
                             colors={['#f5f3ff', '#fff', '#fdf2f8']} 
                             start={{x:0, y:0}} 
                             end={{x:1, y:1}}
                             style={styles.analysisBox}
                        >
                            <View style={styles.analysisHeader}>
                                <View style={styles.sparkleIcon}>
                                    <Sparkles size={16} color={colors.white} />
                                </View>
                                <Text style={styles.analysisTitle}>AI Analysis Result</Text>
                            </View>
                            
                            <Text style={styles.analysisText}>
                                {effectiveData.ai_summary}
                            </Text>

                            {/* Charts */}
                            <View style={styles.chartContainer}>
                                {[1, 2, 3, 4, 5].map(i => {
                                    const styleKey = `style${i}`;
                                    const scoreKey = `score${i}`;
                                    const name = effectiveData[styleKey];
                                    const score = effectiveData[scoreKey];
                                    
                                    if (!name) return null;
                                    
                                    return (
                                        <View key={i} style={styles.chartRow}>
                                            <View style={styles.chartLabelRow}>
                                                <Text style={styles.chartLabel}>{name}</Text>
                                                <Text style={styles.chartScore}>{Math.round(score * 100)}%</Text>
                                            </View>
                                            <View style={styles.chartTrack}>
                                                <LinearGradient
                                                    colors={['#818cf8', '#a855f7']}
                                                    start={{x:0, y:0}} end={{x:1, y:0}}
                                                    style={[styles.chartBar, { width: `${score * 100}%` }]}
                                                />
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>
                        </LinearGradient>
                    ) : (
                        <TouchableOpacity
                            onPress={handleAnalyze}
                            disabled={isAnalyzing}
                        >
                            <LinearGradient
                                colors={['#6366f1', '#a855f7', '#ec4899']}
                                start={{x:0, y:0}} end={{x:1, y:0}}
                                style={styles.analyzeButton}
                            >
                                {isAnalyzing ? (
                                    <ActivityIndicator color={colors.white} />
                                ) : (
                                    <>
                                        <Sparkles size={20} color={colors.white} style={{ marginRight: 8 }} />
                                        <Text style={styles.analyzeButtonText}>AI 분석 받아보기</Text>
                                    </>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Review */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>감상평</Text>
                    <View style={styles.reviewBox}>
                        <Text style={styles.reviewText}>{work.description || work.review || '작성된 감상평이 없습니다.'}</Text>
                    </View>
                </View>
                
                {/* Comments */}
                <View style={[styles.section, { marginBottom: 40 }]}>
                    <Text style={styles.sectionHeader}>댓글</Text>
                    
                    <View style={styles.commentInputRow}>
                        <TextInput
                            value={commentText}
                            onChangeText={setCommentText}
                            placeholder={user ? "댓글을 남겨보세요" : "로그인 후 작성 가능"}
                            editable={!!user}
                            style={styles.commentInput}
                            placeholderTextColor={colors.gray400}
                        />
                        <TouchableOpacity 
                            onPress={handleAddComment}
                            disabled={!user || !commentText.trim()}
                            style={[
                                styles.sendButton,
                                (!user || !commentText.trim()) && { opacity: 0.5 }
                            ]}
                        >
                            <Send size={18} color={colors.white} />
                        </TouchableOpacity>
                    </View>

                    {comments.map((c: any) => (
                        <View key={c.id} style={styles.commentItem}>
                            <Text style={styles.commentUser}>{c.nickname}</Text>
                            <Text style={styles.commentContent}>{c.content}</Text>
                            <Text style={styles.commentDate}>{new Date(c.created_at).toLocaleDateString()}</Text>
                        </View>
                    ))}
                     {comments.length === 0 && (
                        <Text style={styles.emptyComments}>첫 댓글을 남겨주세요.</Text>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: '#111827', // gray-900
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageContainer: {
        height: '45%',
        width: '100%',
        backgroundColor: '#111827',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    headerGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 100,
        paddingHorizontal: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        marginTop: 10,
    },
    bodyScroll: {
        flex: 1,
        marginTop: -30,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        backgroundColor: colors.white,
        overflow: 'hidden', // clips headers content
    },
    bodyContent: {
        paddingTop: 32,
        paddingHorizontal: 24,
        paddingBottom: 40,
    },
    metaSection: {
        marginBottom: 24,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    pillRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
    },
    genrePill: {
        backgroundColor: '#000',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    stylePill: {
        backgroundColor: colors.iMeryBlue,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    pillText: {
        color: colors.white,
        fontSize: 10,
        fontFamily: typography.sansBold,
    },
    title: {
        fontSize: 24,
        fontFamily: typography.serif,
        color: colors.primary,
        lineHeight: 32,
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    circleButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.gray200,
        ...shadowStyles.sharp,
    },
    activeCircleButton: {
        backgroundColor: '#6366f1', // Indigo-500
        borderColor: '#6366f1',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    infoText: {
        fontSize: 13,
        fontFamily: typography.sansMedium,
        color: colors.gray500,
    },
    dot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: colors.gray400,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    tagBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray100,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    tagText: {
        fontSize: 11,
        fontFamily: typography.sansBold,
        color: colors.gray500,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        fontSize: 18,
        fontFamily: typography.sansBold,
        color: colors.primary,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray100,
        paddingBottom: 8,
    },
    reviewBox: {
        backgroundColor: colors.gray100, // gray-50 roughly
        padding: 16,
        borderRadius: 16,
    },
    reviewText: {
        fontSize: 14,
        fontFamily: typography.sans,
        color: colors.secondary,
        lineHeight: 22,
    },
    // Analysis
    analyzeButton: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        ...shadowStyles.premium,
    },
    analyzeButtonText: {
        color: colors.white,
        fontSize: 16,
        fontFamily: typography.sansBold,
    },
    analysisBox: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#c7d2fe', // indigo-200
        ...shadowStyles.apple,
    },
    analysisHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 10,
    },
    sparkleIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    analysisTitle: {
        fontSize: 14,
        fontFamily: typography.sansBold,
        color: '#312e81', // indigo-900
    },
    analysisText: {
        fontSize: 14,
        fontFamily: typography.sans,
        color: colors.secondary,
        lineHeight: 22,
        marginBottom: 20,
    },
    chartContainer: {
        gap: 10,
    },
    chartRow: {
        gap: 4,
    },
    chartLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    chartLabel: {
        fontSize: 11,
        fontFamily: typography.sansBold,
        color: colors.gray500,
    },
    chartScore: {
        fontSize: 11,
        fontFamily: typography.sansBold,
        color: '#a855f7', // purple-500
    },
    chartTrack: {
        height: 8,
        backgroundColor: colors.gray200,
        borderRadius: 4,
        overflow: 'hidden',
    },
    chartBar: {
        height: '100%',
    },
    // Comments
    commentInputRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    commentInput: {
        flex: 1,
        backgroundColor: colors.gray100,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        fontFamily: typography.sans,
        color: colors.primary,
    },
    sendButton: {
        width: 44,
        backgroundColor: colors.primary,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    commentItem: {
        backgroundColor: colors.gray100,
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    commentUser: {
        fontSize: 12,
        fontFamily: typography.sansBold,
        color: colors.primary,
        marginBottom: 4,
    },
    commentContent: {
        fontSize: 13,
        fontFamily: typography.sans,
        color: colors.secondary,
        marginBottom: 4,
    },
    commentDate: {
        fontSize: 10,
        fontFamily: typography.sans,
        color: colors.gray400,
    },
    emptyComments: {
        textAlign: 'center',
        color: colors.gray400,
        fontSize: 12,
        marginVertical: 10,
    }
});
