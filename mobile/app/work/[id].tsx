import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, TextInput, StyleSheet, Dimensions, Platform, Animated, Easing } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Share2, Clock, Music, Pause, Play, Sparkles, Send, Tag, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Sharing from 'expo-sharing';
import api from '@services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getImageUrl } from '../../utils/imageHelper';
import { colors, shadowStyles, typography } from '../../constants/designSystem';

const { width } = Dimensions.get('window');

// Configure Audio for playback in silent mode
Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
});

export default function WorkDetailScreen() {
    const { id, focusComment } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Scroll Ref
    const scrollViewRef = useRef<ScrollView>(null);
    const commentsYRef = useRef<number>(0);

    const [work, setWork] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
    const soundRef = useRef<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisData, setAnalysisData] = useState<any>(null);

    const [comments, setComments] = useState<any[]>([]);
    const [commentText, setCommentText] = useState('');

    // Auto-scroll to comments if requested
    useEffect(() => {
        if (focusComment === 'true' && !loading && work) {
            // Small delay to ensure layout is ready
            setTimeout(() => {
                if (scrollViewRef.current && commentsYRef.current > 0) {
                    scrollViewRef.current.scrollTo({ y: commentsYRef.current, animated: true });
                }
            }, 500);
        }
    }, [focusComment, loading, work]);

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

    // ================================================================================
    // CRITICAL RULE: Audio Cleanup
    // - Music MUST stop when user leaves the work page
    // - Implemented via useFocusEffect (screen blur) + useEffect (unmount)
    // - Both methods call stopAsync() then unloadAsync() for complete cleanup
    // ================================================================================
    
    // Track if screen is focused to prevent playing after leave
    const isFocusedRef = useRef(true);

    useFocusEffect(
        React.useCallback(() => {
            isFocusedRef.current = true;
            return () => {
                isFocusedRef.current = false;
                // Cleanup when screen loses focus
                if (soundRef.current) {
                    console.log('[Audio] Unloading sound on blur');
                    soundRef.current.stopAsync().catch(() => {});
                    soundRef.current.unloadAsync().catch(() => {});
                    soundRef.current = null;
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

            // Ensure id is a string (expo-router params can be string | string[])
            const postId = Array.isArray(id) ? id[0] : id;
            
            // Fetch specific post details directly
            const foundWork = await api.getPost(postId);

            if (foundWork) {
                setWork(foundWork);
                loadComments(foundWork.id);

                if (foundWork.music_url) {
                    playMusic(foundWork.music_url); // Auto-play attempt
                }

                if (foundWork.is_analyzed && foundWork.ai_summary) {
                    setAnalysisData({
                        ...foundWork,
                        ai_summary: foundWork.ai_summary,
                    });
                    setIsResultVisible(true); // Show immediately without animation
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
            // Cancel/Unload previous sound if any
            if (soundRef.current) {
                await soundRef.current.unloadAsync();
            }
            
            console.log('Loading sound:', url);
            
            // Create sound but don't auto-play yet if we want strict control, 
            // but `shouldPlay: true` is convenient. 
            // We'll stick to `shouldPlay: true` but immediately unload if race condition detected.
            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: url },
                { shouldPlay: true, isLooping: true }
            );

            // AUTO-CORRECTION: If user left the screen while loading...
            if (!isFocusedRef.current) {
                console.log('[Audio] Loaded after blur. Unloading immediately.');
                await newSound.stopAsync();
                await newSound.unloadAsync();
                return;
            }

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

    // Determine active display data (Analysis vs Default)
    const effectiveData = analysisData || work;

    // AI Animation State
    const [isResultVisible, setIsResultVisible] = useState(false);



    // Toast State
    const [toastVisible, setToastVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const showToast = (message: string) => {
        setToastMessage(message);
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
    };

    // ================================================================================
    // CRITICAL RULE: AI Analysis Behavior
    // - Button "AI 작품 분석 받아보기" displays EXISTING Posts.ai_summary from database
    // - NEVER creates new analysis
    // - If ai_summary exists: Show "완료" toast + display result after 1.5s animation
    // - If ai_summary is NULL: Show "AI가 작품을 분석 중입니다. 잠시만 기다려 주세요!"
    // - Uses ONLY Posts.ai_summary field (NO analysis_id or art_analysis table)
    // ================================================================================
    const handleAnalyze = async () => {
        if (isAnalyzing || !work) return;
        
        setIsAnalyzing(true);

        try {
            // Call API to get ai_summary and chart data
            const response = await api.analyzePost(work.id);

            // Check if analysis is available
            if (response.has_analysis && response.ai_summary) {
                // Analysis available - wait for animation
                const result = response.result || {};
                
                // 1. Artificial Delay for Animation (1.5s)
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // 2. Prepare Data (Flatten styles for UI)
                const styles = result.styles || [];
                const flattenedData = {
                    ai_summary: response.ai_summary,
                    is_analyzed: true,
                    style1: styles[0]?.name, score1: styles[0]?.score,
                    style2: styles[1]?.name, score2: styles[1]?.score,
                    style3: styles[2]?.name, score3: styles[2]?.score,
                };

                // 3. Show Result & Toast
                setAnalysisData(flattenedData);
                setIsResultVisible(true);
                
                // Show toast AFTER result is displayed
                showToast("AI 작품 요약이 완료되었습니다!");
                
            } else {
                // No analysis available
                showToast("AI가 작품을 분석 중입니다. 잠시만 기다려 주세요!");
            }

        } catch (e) {
            console.error('[Analysis Error]', e);
            showToast("AI가 작품을 분석 중입니다. 잠시만 기다려 주세요!");
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
    
    // Prepare tags
    let tags: string[] = [];
    try {
        if (effectiveData && effectiveData.tags) {
            if (Array.isArray(effectiveData.tags)) {
                // If it's already an array, check if it's objects or strings
                tags = effectiveData.tags.map((t: any) => {
                    if (typeof t === 'string') return t;
                    if (typeof t === 'object' && t.label) return t.label; // Handle {"id":.., "label":..}
                    if (typeof t === 'object' && t.value) return t.value;
                    return JSON.stringify(t);
                }).filter(Boolean);
            } else if (typeof effectiveData.tags === 'string') {
                const raw = effectiveData.tags.trim();
                // Try parsing as JSON first
                if (raw.startsWith('[') || raw.startsWith('{')) {
                    try {
                        const parsed = JSON.parse(raw);
                        if (Array.isArray(parsed)) {
                            tags = parsed.map((t: any) => {
                                if (typeof t === 'string') return t;
                                if (typeof t === 'object' && t.label) return t.label;
                                return '';
                            }).filter(Boolean);
                        }
                    } catch (e) {
                        // Fallback to split by comma if JSON parse fails or it's just a comma list
                        tags = raw.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
                    }
                } else {
                    // Simple comma separated string
                    tags = raw.split(',').map((t: string) => t.trim()).filter((t: string) => t.length > 0);
                }
            }
        }
    } catch (e) {
        console.log('Tag parse fallback', e);
        tags = [];
    }

    // Helper: Get Chart Data (Handle legacy/mock/simple data)
    const getChartData = () => {
        // CRITICAL RULE: Only show charts if genre is "그림" (Painting)
        if (effectiveData.genre && effectiveData.genre !== '그림') {
            return [];
        }

        // If we have explicit style scores (from handleAnalyze state), use them
        if (effectiveData.style1) {
            return [
                { name: effectiveData.style1, score: effectiveData.score1 || 0.85 },
                { name: effectiveData.style2, score: effectiveData.score2 || 0.10 },
                { name: effectiveData.style3, score: effectiveData.score3 || 0.05 },
            ].filter(item => item.name);
        }

        // Otherwise, derive from the single 'style' field in Posts
        if (effectiveData.style) {
            return [
                { name: effectiveData.style, score: 0.92 }, // Main style
                { name: '구성', score: 0.05 },
                { name: '색채', score: 0.03 }
            ];
        }
        
        // Final fallback if even 'style' is missing but analyzed
        return [
            { name: effectiveData.genre || '작품', score: 0.80 },
            { name: '표현', score: 0.20 }
        ];
    };

    const renderAnalysisContent = () => {
        // Case 1: Result is ready and animation is done -> Show Result
        if (effectiveData.is_analyzed && (isResultVisible || !isAnalyzing)) {
            // NOTE: If isResultVisible is false but it is analyzed (e.g. revisited), we show it.
            // But we need to handle the initial fade in if needed. 
            // Simplified: If analyzed, just show it. 
            
            const chartData = getChartData();
            const hasCharts = chartData.length > 0;

            return (
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
                        <Text style={styles.analysisTitle}>AI 작품 분석</Text>
                    </View>
                    
                    <Text style={[styles.analysisText, !hasCharts && { marginBottom: 0 }]}>
                        {effectiveData.ai_summary}
                    </Text>

                    {/* Charts (Restored & Robust) */}
                    {hasCharts && (
                        <View style={styles.chartContainer}>
                            {chartData.map((data, i) => (
                                <View key={i} style={styles.chartRow}>
                                    <View style={styles.chartLabelRow}>
                                        <Text style={styles.chartLabel}>{data.name}</Text>
                                        <Text style={styles.chartScore}>{Math.round(data.score * 100)}%</Text>
                                    </View>
                                    <View style={styles.chartTrack}>
                                        <LinearGradient
                                            colors={['#818cf8', '#a855f7']}
                                            start={{x:0, y:0}} end={{x:1, y:0}}
                                            style={[styles.chartBar, { width: `${data.score * 100}%` }]}
                                        />
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </LinearGradient>
            );
        }

        // Case 2: Analysis is in progress (API calling) OR Data ready but waiting for animation -> Show "Analyzing..."
        if (isAnalyzing || (effectiveData.is_analyzed && !isResultVisible)) {
            return (
                <LinearGradient
                    colors={['#f5f3ff', '#fff', '#fdf2f8']}
                    start={{x:0, y:0}} end={{x:1, y:1}}
                    style={[styles.analysisBox, { minHeight: 150, justifyContent: 'center', alignItems: 'center' }]}
                >
                    <ActivityIndicator size="large" color="#8b5cf6" style={{ marginBottom: 16 }} />
                    <Text style={{ fontFamily: typography.sansBold, color: '#4b5563', fontSize: 16 }}>
                        AI가 작품을 분석 중입니다
                    </Text>
                    <Text style={{ fontFamily: typography.sans, color: '#9ca3af', fontSize: 12, marginTop: 4 }}>
                        잠시만 기다려주세요...
                    </Text>
                </LinearGradient>
            );
        }

        // Case 3: Not analyzed -> Show Button
        return (
            <TouchableOpacity
                onPress={handleAnalyze}
                disabled={isAnalyzing}
            >
                <LinearGradient
                    colors={['#6366f1', '#a855f7', '#ec4899']}
                    start={{x:0, y:0}} end={{x:1, y:0}}
                    style={styles.analyzeButton}
                >
                   <Sparkles size={20} color={colors.white} style={{ marginRight: 8 }} />
                   <Text style={styles.analyzeButtonText}>AI 작품 분석 받아보기</Text>
                </LinearGradient>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Toast Notification */}
            {toastVisible && (
                <View style={{
                    position: 'absolute',
                    top: 100, // Adjust based on header height
                    left: 0, 
                    right: 0,
                    alignItems: 'center',
                    zIndex: 100
                }}>
                    <View style={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        paddingHorizontal: 20,
                        paddingVertical: 12,
                        borderRadius: 24,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 4.65,
                        elevation: 8,
                    }}>
                        <Sparkles size={16} color="#FACC15" />
                        <Text style={{
                            color: 'white',
                            fontSize: 14,
                            fontFamily: typography.sansBold
                        }}>
                            {toastMessage}
                        </Text>
                    </View>
                </View>
            )}
            {/* ... (Keep Header) ... */}
            <View style={styles.imageContainer}>
                {/* ... (Keep Image code) ... */}
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

            <ScrollView 
                ref={scrollViewRef}
                style={styles.bodyScroll} 
                contentContainerStyle={styles.bodyContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ... (Keep Title & Meta) ... */}
                 <View style={styles.metaSection}>
                    {/* ... (Keep existing meta content) ... */}
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
                        
                        <View style={styles.actionButtons}>
                             <TouchableOpacity onPress={togglePlayback} activeOpacity={0.8}>
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
                        <Text style={[styles.infoText, { color: colors.primary, fontWeight: '600' }]}>
                            {work.artist_name || 'Unknown Artist'}
                        </Text>
                        
                        {(work.exhibition_name || work.location_city || work.location_province) && (
                            <>
                                <View style={styles.dot} />
                                <View style={styles.locationBadge}>
                                    <MapPin size={12} color={colors.iMeryBlue || '#4F46E5'} style={{ marginRight: 2 }} />
                                    <Text style={[styles.infoText, { color: colors.gray500, fontSize: 13 }]}>
                                        {work.exhibition_name || work.location_city || work.location_province}
                                    </Text>
                                </View>
                            </>
                        )}
                    </View>
                    
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

                {/* AI Analysis Section - REPLACED LOGIC */}
                <View style={styles.section}>
                    {renderAnalysisContent()}
                </View>
                
                {/* ... (Keep Review & Comments) ... */}
                 {/* Review */}
                <View style={styles.section}>
                    <Text style={styles.sectionHeader}>감상평</Text>
                    <View style={styles.reviewBox}>
                        <Text style={styles.reviewText}>{work.description || work.review || '작성된 감상평이 없습니다.'}</Text>
                    </View>
                </View>
                
                {/* Location Container Removed (Moved to Header) */}
                
                {/* Comments */}
                <View 
                    style={[styles.section, { marginBottom: 40 }]}
                    onLayout={(event) => {
                         const layout = event.nativeEvent.layout;
                         commentsYRef.current = layout.y;
                    }}
                >
                    <Text style={styles.sectionHeader}>댓글</Text>
                    {/* ... (Keep comment content) ... */}
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
        position: 'relative', // Ensure absolute children position relative to this
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
        position: 'absolute',
        right: 0,
        top: -18,
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
    locationContainer: {
        marginBottom: 24, // Adjusted spacing
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    locationIcon: {
        marginRight: 8,
    },
    locationText: {
        fontSize: 14,
        fontFamily: typography.sans,
        color: colors.secondary,
        flex: 1,
    },
    locationBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        // Removed background/border as requested
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
