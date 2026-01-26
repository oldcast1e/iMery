import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Music, Star, Bookmark } from 'lucide-react-native';
import { colors, shadowStyles, typography } from '../../constants/designSystem';
import { getImageUrl } from '../../utils/imageHelper';

// ...

export default function WorkCardList({ work, onPress, onBookmarkToggle, isBookmarked }: Props) {
    const imageUrl = getImageUrl(work.image_url || work.thumbnail || work.image);
     // Handle tag parsing broadly
    const displayTags = Array.isArray(work.tags) 
        ? work.tags.map(t => typeof t === 'object' ? t.label : t) 
        : [];

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={styles.card}
        >
            {/* Thumbnail */}
            <Image
                source={{ uri: imageUrl || 'https://via.placeholder.com/150' }}
                style={styles.thumbnail}
            />

            {/* Content */}
            <View style={styles.content}>
                <View style={styles.headerRow}>
                    <Text style={styles.title} numberOfLines={1}>
                        {work.title}
                    </Text>
                    {work.music_url && <Music size={14} color={colors.gray400} />}
                </View>

                <View style={styles.metaRow}>
                    <Text style={[styles.metaText, styles.artistText]}>{work.artist || 'Unknown'}</Text>
                    <Text style={styles.dot}>•</Text>
                    <Text style={styles.metaText}>{work.date || '2024.01.01'}</Text>
                </View>

                {/* Tags */}
                {displayTags.length > 0 && (
                    <View style={styles.tagRow}>
                        {displayTags.slice(0, 3).map((tag, idx) => (
                            <View key={idx} style={styles.tagBadge}>
                                <Text style={styles.tagText}>{tag}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Rating */}
                <View style={styles.ratingRow}>
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={12}
                            fill={i < (work.rating || 0) ? '#FBBF24' : 'transparent'} // Yellow-400
                            color={i < (work.rating || 0) ? '#FBBF24' : colors.gray200}
                        />
                    ))}
                </View>
            </View>

            {/* Actions */}
            <View style={styles.actions}>
                {onBookmarkToggle && (
                    <TouchableOpacity 
                        onPress={(e) => {
                            // Stop propagation handled by parent usually, but here we just call handler
                             onBookmarkToggle(work.id);
                        }}
                        style={styles.actionBtn}
                    >
                        <Bookmark
                            size={18}
                            color={isBookmarked ? colors.primary : colors.gray400}
                            fill={isBookmarked ? colors.primary : 'transparent'}
                        />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.gray100,
        marginBottom: 12,
        // Optional: Add shadow if desired, but web has hover shadow, simple border usually enough on mobile
        ...shadowStyles.apple, 
    },
    thumbnail: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: colors.gray200,
    },
    content: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    title: {
        fontSize: 16,
        fontFamily: typography.sansBold,
        color: colors.primary,
        maxWidth: '85%',
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 2,
    },
    metaText: {
        fontSize: 12,
        fontFamily: typography.sans,
        color: colors.gray500,
    },
    artistText: {
        color: colors.primary,
        fontFamily: typography.sansMedium,
    },
    dot: {
        marginHorizontal: 4,
        color: colors.gray400,
        fontSize: 10,
    },
    tagRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 6,
    },
    tagBadge: {
        backgroundColor: colors.gray100,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    tagText: {
        fontSize: 10,
        fontFamily: typography.sansBold, // Web uses bold for tags
        color: colors.gray400,
    },
    ratingRow: {
        flexDirection: 'row',
        marginTop: 6,
        gap: 1,
    },
    actions: {
        justifyContent: 'flex-start',
        paddingTop: 4,
    },
    actionBtn: {
        padding: 4,
    },
});
