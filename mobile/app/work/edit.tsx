import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, Alert, ActivityIndicator, Platform, KeyboardAvoidingView, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, Image as ImageIcon, ArrowLeft, Star } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import api from '@services/api';
import { getImageUrl } from '../../utils/imageHelper';
import { colors, shadowStyles } from '../../constants/designSystem';
import TagSelector from '../../components/work/TagSelector';

export default function EditWorkScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const workId = Array.isArray(id) ? id[0] : id;
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        isUnknownArtist: false,
        style: '',
        date: '',
        genre: '그림',
        rating: 5,
        review: '',
        tags: [] as { id: string; label: string; path: string[] }[],
    });

    const genres = ['그림', '조각', '사진', '판화', '기타'];

    useEffect(() => {
        if (workId) loadWork();
    }, [workId]);

    const loadWork = async () => {
        try {
            const data = await api.getPost(workId); 
            // Ensure data structure
            const work = data; 
            
            setImageUri(getImageUrl(work.image_url));
            setFormData({
                title: work.title,
                artist: work.artist_name || work.artist,
                isUnknownArtist: work.artist_name === '작가 미상',
                style: work.style || '',
                date: work.work_date || work.date || '',
                genre: work.genre || '그림',
                rating: work.rating || 0,
                review: work.description || '',
                // Parse tags, fallback to empty array. Expecting Tag[] structure.
                tags: typeof work.tags === 'string' ? JSON.parse(work.tags) : (work.tags || []),
            });
        } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Failed to load work details');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8 
        });

        if (!result.canceled) {
            const manipResult = await ImageManipulator.manipulateAsync(
                result.assets[0].uri,
                [{ resize: { width: 1080 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );
            setImageUri(manipResult.uri);
        }
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) { Alert.alert('Missing Info', 'Please enter a title'); return; }

        setSubmitting(true);
        try {
            const data = new FormData();
            // Don't need user_id for update usually, but server might check ownership via token.
            data.append('title', formData.title);
            data.append('artist_name', formData.isUnknownArtist ? '작가 미상' : formData.artist);
            data.append('description', formData.review);
            data.append('work_date', formData.date.replace(/-/g, '.'));
            data.append('genre', formData.genre);
            data.append('style', formData.style);
            data.append('rating', String(formData.rating));
            data.append('tags', JSON.stringify(formData.tags));

            // Only append image if changed (local uri)
            if (imageUri && !imageUri.startsWith('http')) {
                const filename = imageUri.split('/').pop() || 'upload.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                data.append('image', { uri: imageUri, name: filename, type } as any);
            } else {
                data.append('image_url', imageUri || '');
            }

            await api.updatePost(workId, data);
            Alert.alert('Success', 'Artwork updated!', [
                { text: 'OK', onPress: () => router.back() }
            ]);

        } catch (e) {
            console.error(e);
            Alert.alert('Update Failed', 'Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <Stack.Screen options={{ headerShown: false }} />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <ArrowLeft size={24} color={colors.primary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Artwork</Text>
                <TouchableOpacity 
                    onPress={handleSubmit} 
                    disabled={submitting}
                    style={[styles.submitButton, { backgroundColor: colors.primary }]}
                >
                    {submitting ? (
                        <ActivityIndicator color="#FFF" size="small" />
                    ) : (
                        <Text style={styles.submitText}>Save</Text>
                    )}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent}>

                    {/* Image Preview */}
                    <View style={styles.imagePreviewContainer}>
                        <Image source={{ uri: imageUri! }} style={styles.previewImage} />
                        <TouchableOpacity
                            onPress={pickImage}
                            style={styles.changeImageButton}
                        >
                            <Text style={styles.changeImageText}>Change Photo</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formSection}>
                        {/* Title */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.labelText}>TITLE</Text>
                            <TextInput
                                value={formData.title}
                                onChangeText={t => setFormData({ ...formData, title: t })}
                                placeholder="Artwork Title"
                                style={styles.input}
                                placeholderTextColor={colors.gray400}
                            />
                        </View>

                        {/* Artist */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.labelText}>ARTIST</Text>
                                <TouchableOpacity
                                    onPress={() => setFormData(prev => ({ ...prev, isUnknownArtist: !prev.isUnknownArtist }))}
                                    style={[
                                        styles.unknownBadge,
                                        formData.isUnknownArtist ? styles.unknownBadgeActive : styles.unknownBadgeInactive
                                    ]}
                                >
                                    <Text style={[
                                        styles.unknownText,
                                        formData.isUnknownArtist ? styles.unknownTextActive : styles.unknownTextInactive
                                    ]}>Unknown Artist</Text>
                                </TouchableOpacity>
                            </View>
                            {!formData.isUnknownArtist && (
                                <TextInput
                                    value={formData.artist}
                                    onChangeText={t => setFormData({ ...formData, artist: t })}
                                    placeholder="Artist Name"
                                    style={styles.input}
                                    placeholderTextColor={colors.gray400}
                                />
                            )}
                        </View>

                        {/* Style */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.labelText}>STYLE</Text>
                            <TextInput
                                value={formData.style}
                                onChangeText={t => setFormData({ ...formData, style: t })}
                                placeholder="e.g. Impressionism, Oil..."
                                style={styles.input}
                                placeholderTextColor={colors.gray400}
                            />
                        </View>

                        {/* Date */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.labelText}>DATE</Text>
                            <TextInput
                                value={formData.date}
                                onChangeText={t => setFormData({ ...formData, date: t })}
                                placeholder="YYYY.MM.DD"
                                style={styles.input}
                                placeholderTextColor={colors.gray400}
                                keyboardType="numbers-and-punctuation"
                            />
                        </View>

                        {/* Genre */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.labelText}>GENRE</Text>
                            <View style={styles.genreRow}>
                                {genres.map(g => (
                                    <TouchableOpacity
                                        key={g}
                                        onPress={() => setFormData({ ...formData, genre: g })}
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

                        {/* Rating */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.labelText}>RATING</Text>
                            <View style={[styles.ratingContainer, { paddingVertical: 12 }]}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity 
                                        key={star} 
                                        onPress={() => setFormData({ ...formData, rating: star })}
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

                        {/* Tags */}
                        <View style={styles.inputGroup}>
                            <View style={styles.labelRow}>
                                <Text style={styles.labelText}>TAGS</Text>
                                <Text style={styles.helperText}>Max 5</Text>
                            </View>
                            <TagSelector 
                                selectedTags={formData.tags}
                                onTagsChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                            />
                        </View>

                        {/* Review */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.labelText}>REVIEW</Text>
                            <TextInput
                                value={formData.review}
                                onChangeText={t => setFormData({ ...formData, review: t })}
                                placeholder="Write your thoughts..."
                                style={styles.textArea}
                                placeholderTextColor={colors.gray400}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>

                    </View>
                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
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
        fontWeight: 'bold', // Match visual
        fontFamily: Platform.OS === 'ios' ? 'Times New Roman' : 'serif', // Match serif look
        color: '#1a1a1a',
    },
    submitButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    submitText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: 'bold',
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
        fontWeight: 'bold',
        color: '#9CA3AF',
        letterSpacing: 1,
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
    genreRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    genreChip: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 12,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 50,
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
    // Tags
    tagsAddButton: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    tagsAddText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#374151',
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
