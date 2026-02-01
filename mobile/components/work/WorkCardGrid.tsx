import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { colors, shadowStyles, typography } from '../../constants/designSystem';
import { getImageUrl } from '../../utils/imageHelper';

// ...

export default function WorkCardGrid({ work, onPress, layout = 'medium' }: Props) {
    const imageUrl = getImageUrl(work.image_url || work.thumbnail || work.image);
    
    // Calculate size based on padding (assume 16px screen padding, 12px gap)
    // Small (3 cols) vs Medium (2 cols)
    // To enable dynamic grid in FlatList, better to let Parent style width?
    // But for standalone card, we stick to flexible width
    
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={styles.card}
        >
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: imageUrl || 'https://via.placeholder.com/150' }}
                    style={styles.image}
                    resizeMode="cover"
                />
                
                {/* Gradient Overlay for Text */}
                <View style={styles.overlay}>
                    <Text style={styles.title} numberOfLines={1}>{work.title}</Text>
                    <Text style={styles.artist} numberOfLines={1}>{work.artist}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        // flex: 1 removed to prevent collapse in non-flex-height containers
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.gray100,
        marginBottom: 12,
    },
    imageContainer: {
        width: '100%',
        aspectRatio: 1, // Square
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    overlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.9)', // Fallback if blur not avail
        padding: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.5)',
    },
    title: {
        fontSize: 12,
        fontFamily: typography.sansBold,
        color: colors.primary,
    },
    artist: {
        fontSize: 10,
        fontFamily: typography.sans,
        color: 'rgba(0,0,0,0.7)',
    },
});
