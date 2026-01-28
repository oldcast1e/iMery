import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, Platform, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, Image as ImageIcon, X, ArrowLeft, Star, Calendar } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '@services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, shadowStyles } from '../../constants/designSystem';
import TagSelector from '../../components/work/TagSelector';

export default function UploadScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    
    // Step 1: Image Selection | Step 2: Details Form
    const [step, setStep] = useState(1);
    
    // Data States
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        isUnknownArtist: false,
        style: '',
        date: new Date(),
        genre: '그림',
        rating: 5,
        review: '',
        tags: [] as { id: string; label: string; path: string[] }[],
    });

    // UI States
    const [showDatePicker, setShowDatePicker] = useState(false);

    const genres = ['그림', '조각', '사진', '판화', '기타'];

    // --- Image Handling ---
    const pickImage = async (useCamera: boolean) => {
        const { status } = useCamera
            ? await ImagePicker.requestCameraPermissionsAsync()
            : await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert('권한 필요', '사진을 업로드하려면 권한이 필요합니다.');
            return;
        }

        const result = useCamera
            ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.8 })
            : await ImagePicker.launchImageLibraryAsync({ 
                mediaTypes: ImagePicker.MediaType.Images, 
                allowsEditing: true, 
                aspect: [4, 3], 
                quality: 0.8 
            });

        if (!result.canceled) {
            processImage(result.assets[0].uri);
        }
    };

    const processImage = async (uri: string) => {
        setLoading(true);
        try {
            const manipResult = await ImageManipulator.manipulateAsync(
                uri,
                [{ resize: { width: 1080 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );
            setImageUri(manipResult.uri);
            if (step === 1) setStep(2);
        } catch (e) {
            Alert.alert('오류', '이미지 처리 중 문제가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // --- Form Handling ---
    const toggleUnknownArtist = () => {
        setFormData(prev => ({
            ...prev,
            isUnknownArtist: !prev.isUnknownArtist,
            artist: !prev.isUnknownArtist ? '작가 미상' : ''
        }));
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            if (selectedDate > new Date()) {
                Alert.alert('알림', '미래의 날짜는 선택할 수 없습니다.');
                return;
            }
            setFormData(prev => ({ ...prev, date: selectedDate }));
        }
    };

    const handleSubmit = async () => {
        if (!imageUri) return;
        if (!formData.title.trim()) { Alert.alert('알림', '작품 제목을 입력해주세요.'); return; }
        if (!formData.isUnknownArtist && !formData.artist.trim()) { Alert.alert('알림', '작가 이름을 입력해주세요.'); return; }

        setLoading(true);
        try {
            const userJson = await AsyncStorage.getItem('imery-user');
            const user = userJson ? JSON.parse(userJson) : null;
            if (!user) {
                Alert.alert('오류', '로그인이 필요합니다.');
                router.replace('/(tabs)/profile');
                return;
            }

            const data = new FormData();
            data.append('user_id', user.user_id || user.id);
            data.append('title', formData.title);
            data.append('artist_name', formData.isUnknownArtist ? '작가 미상' : formData.artist);
            data.append('description', formData.review);
            
            // Format Date -> YYYY.MM.DD
            const yyyy = formData.date.getFullYear();
            const mm = String(formData.date.getMonth() + 1).padStart(2, '0');
            const dd = String(formData.date.getDate()).padStart(2, '0');
            data.append('work_date', `${yyyy}.${mm}.${dd}`);

            data.append('genre', formData.genre);
            data.append('style', formData.style);
            data.append('rating', String(formData.rating));
            
            // Tags: Send array of labels or objects? ReviewForm sending array of objects, 
            // but mobile api usually expects JSON string if it's a complex object or just labels.
            // Following previous logic: send JSON string of tags array.
            data.append('tags', JSON.stringify(formData.tags));

            const filename = imageUri.split('/').pop() || 'upload.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            data.append('image', { uri: imageUri, name: filename, type } as any);

            await api.createPost(data);
            Alert.alert('성공', '작품이 업로드되었습니다!', [
                { text: '확인', onPress: () => router.back() }
            ]);
        } catch (e) {
            console.error(e);
            Alert.alert('실패', '작품 업로드에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // --- Render Scenarios ---

    // 1. Image Selection View (Bottom Sheet Style Mock)
    if (step === 1) {
        return (
            <View style={styles.container}>
                <TouchableOpacity style={styles.closeArea} onPress={() => router.back()} />
                <View style={styles.selectionSheet}>
                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>작품 등록</Text>
                        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                            <X size={24} color={colors.gray500 || '#6B7280'} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.selectionGrid}>
                        <TouchableOpacity 
                            style={styles.selectionCard} 
                            onPress={() => pickImage(true)}
                            activeOpacity={0.9}
                        >
                            <View style={styles.iconBoxDark}>
                                <Camera size={28} color="#FFF" />
                            </View>
                            <Text style={styles.selectionText}>카메라</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.selectionCard} 
                            onPress={() => pickImage(false)}
                            activeOpacity={0.9}
                        >
                            <View style={styles.iconBoxBlue}>
                                <ImageIcon size={28} color="#FFF" />
                            </View>
                            <Text style={styles.selectionText}>갤러리</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {loading && (
                    <View style={styles.loadingOverlay}>
                        <ActivityIndicator size="large" color="#FFF" />
                    </View>
                )}
            </View>
        );
    }

    // 2. Details Form View

    return (
        <View style={[styles.formContainer, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => {
                        // Confirm discard if user entered data? For now, exact request: Cancel & Return Home
                        // If "Home" specifically meant, we can use router.replace('/(tabs)')
                        // But router.back() closes the modal which is the standard "Cancel" behavior.
                        // Ideally checking if entry exists could be good UX, but sticking to prompt:
                        router.back(); 
                    }} 
                    style={styles.headerButton}
                >
                    <ArrowLeft size={24} color={colors.primary || '#111827'} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>기록하기</Text>
                <TouchableOpacity onPress={handleSubmit} disabled={loading} style={styles.submitButton}>
                     {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>완료</Text>}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView 
                behavior={Platform.OS === "ios" ? "padding" : "height"} 
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
            >
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Image Preview & Change */}
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: imageUri! }} style={styles.previewImage} />
                        <TouchableOpacity 
                            style={styles.changeImageButton} 
                            onPress={() => pickImage(false)}
                        >
                            <Text style={styles.changeImageText}>사진 변경</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Form Fields */}
                    <View style={styles.formSection}>
                        
                        {/* Artist */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.labelText}>ARTIST</Text>
                                <TouchableOpacity 
                                    onPress={toggleUnknownArtist}
                                    style={[
                                        styles.unknownBadge, 
                                        formData.isUnknownArtist ? styles.unknownBadgeActive : styles.unknownBadgeInactive
                                    ]}
                                >
                                    <Text style={[
                                        styles.unknownText,
                                        formData.isUnknownArtist ? styles.unknownTextActive : styles.unknownTextInactive
                                    ]}>작가 미상</Text>
                                </TouchableOpacity>
                            </View>
                            <TextInput
                                style={styles.input}
                                placeholder="작가 이름을 입력하세요"
                                value={formData.artist}
                                onChangeText={(text) => {
                                    setFormData(prev => ({ ...prev, artist: text }));
                                    if (formData.isUnknownArtist && text !== '작가 미상') {
                                        setFormData(prev => ({ ...prev, isUnknownArtist: false }));
                                    }
                                }}
                                placeholderTextColor={colors.gray400}
                                editable={!formData.isUnknownArtist}
                            />
                        </View>

                        {/* Title */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.labelText}>TITLE</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="작품의 제목을 입력하세요"
                                value={formData.title}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                                placeholderTextColor={colors.gray400}
                            />
                        </View>

                        {/* Style */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.labelText}>STYLE (화풍)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="예: 인상주의, 표현주의, 추상화..."
                                value={formData.style}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, style: text }))}
                                placeholderTextColor={colors.gray400}
                            />
                        </View>

                        {/* Date */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.labelText}>DATE</Text>
                            <TouchableOpacity 
                                style={styles.dateButton} 
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Calendar size={18} color={colors.gray500} />
                                <Text style={styles.dateText}>
                                    {formData.date.getFullYear()}. 
                                    {String(formData.date.getMonth() + 1).padStart(2, '0')}. 
                                    {String(formData.date.getDate()).padStart(2, '0')}
                                </Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={formData.date}
                                    mode="date"
                                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                    onChange={handleDateChange}
                                    maximumDate={new Date()}
                                />
                            )}
                        </View>

                        {/* Genre */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.labelText}>GENRE</Text>
                            <View style={styles.genreRow}>
                                {genres.map((g) => (
                                    <TouchableOpacity
                                        key={g}
                                        onPress={() => setFormData(prev => ({ ...prev, genre: g }))}
                                        style={[
                                            styles.genreChip,
                                            formData.genre === g && styles.genreChipActive
                                        ]}
                                    >
                                        <Text style={[
                                            styles.genreText,
                                            formData.genre === g && styles.genreTextActive
                                        ]}>{g}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Tags */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.labelText}>TAGS</Text>
                                <Text style={styles.helperText}>최대 5개</Text>
                            </View>
                            <TagSelector 
                                selectedTags={formData.tags} 
                                onTagsChange={(tags) => setFormData(prev => ({ ...prev, tags }))} 
                            />
                        </View>

                        {/* Rating */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.labelText}>RATING</Text>
                            <View style={styles.ratingContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity 
                                        key={star} 
                                        onPress={() => setFormData(prev => ({ ...prev, rating: star }))}
                                        style={styles.starButton}
                                    >
                                        <Star 
                                            size={28} 
                                            color={star <= formData.rating ? "#FACC15" : "#E5E7EB"} 
                                            fill={star <= formData.rating ? "#FACC15" : "none"} 
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Review */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.labelText}>REVIEW</Text>
                            <TextInput
                                style={styles.textArea}
                                placeholder="작품을 보며 느낀 점을 기록하세요..."
                                value={formData.review}
                                onChangeText={(text) => setFormData(prev => ({ ...prev, review: text }))}
                                placeholderTextColor={colors.gray400}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>
                        
                        <View style={{ height: 40 }} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    // Step 1 Styles
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'flex-end',
    },
    closeArea: {
        flex: 1,
    },
    selectionSheet: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: 40,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    sheetTitle: {
        fontSize: 22,
        fontFamily: typography.serif,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    closeButton: {
        padding: 4,
    },
    selectionGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    selectionCard: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: 24,
        padding: 24, // increased padding
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    iconBoxDark: {
        width: 48,
        height: 48,
        borderRadius: 16, // squircle
        backgroundColor: '#1a1a1a',
        alignItems: 'center',
        justifyContent: 'center',
        ...shadowStyles.sm,
    },
    iconBoxBlue: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#3B82F6',
        alignItems: 'center',
        justifyContent: 'center',
        ...shadowStyles.sm,
    },
    selectionText: {
        fontSize: 14,
        fontFamily: typography.sansBold,
        color: '#374151',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },

    // Step 2 Styles
    formContainer: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    headerButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: typography.serif,
        color: '#1a1a1a',
    },
    submitButton: {
        backgroundColor: '#1a1a1a',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    submitText: {
        color: '#FFF',
        fontSize: 14,
        fontFamily: typography.sansBold,
    },
    scrollContent: {
        padding: 20,
    },
    imagePreviewContainer: {
        height: 200,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: 24,
        position: 'relative',
        ...shadowStyles.apple,
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    changeImageButton: {
        position: 'absolute',
        bottom: 12,
        right: 12,
        backgroundColor: 'rgba(255,255,255,0.9)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        ...shadowStyles.sm,
    },
    changeImageText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    formSection: {
        gap: 24,
    },
    inputGroup: {
        gap: 8,
    },
    labelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    labelText: {
        fontSize: 11,
        fontFamily: typography.sansBold,
        color: '#9CA3AF',
        letterSpacing: 1, // tracking-widest
    },
    helperText: {
        fontSize: 10,
        color: '#D1D5DB',
        fontStyle: 'italic',
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
    textArea: {
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 16,
        fontSize: 14,
        color: '#1a1a1a',
        fontFamily: typography.sans,
        height: 120,
    },
    unknownBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    unknownBadgeActive: {
        backgroundColor: '#1a1a1a',
        borderColor: '#1a1a1a',
    },
    unknownBadgeInactive: {
        backgroundColor: '#FFF',
        borderColor: '#E5E7EB',
    },
    unknownText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
    unknownTextActive: { color: '#FFF' },
    unknownTextInactive: { color: '#6B7280' },
    
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    dateText: {
        fontSize: 14,
        color: '#1a1a1a',
        fontFamily: typography.sans,
    },
    
    genreRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    genreChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    genreChipActive: {
        backgroundColor: '#1a1a1a',
        borderColor: '#1a1a1a',
        ...shadowStyles.sm,
    },
    genreText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#9CA3AF',
    },
    genreTextActive: {
        color: '#FFF',
    },
    
    ratingContainer: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    starButton: {
        flex: 1,
        alignItems: 'center',
    },
});
