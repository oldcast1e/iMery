import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, shadowStyles, typography } from '../../constants/designSystem';
import { getImageUrl } from '../../utils/imageHelper';

// ...

interface Props {
    works: any[];
    onWorkClick: (work: any) => void;
    onMoreClick?: () => void;
}

export default function HighlightCarousel({ works = [], onWorkClick, onMoreClick }: Props) {
    // Show only the 5 most recent works
    const recentWorks = works.slice(0, 5);
    const hasMore = works.length > 5;
    const moreCount = works.length - 5;

    if (works.length === 0) return null;

    return (
        <View style={styles.container}>
            {/* Section Header */}
            <View style={styles.header}>
                <Text style={styles.title}>저장된 작품</Text>
                <Text style={styles.subtitle}>목록</Text>
            </View>

            {/* Carousel */}
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {recentWorks.map((work) => (
                    <TouchableOpacity
                        key={work.id}
                        onPress={() => onWorkClick(work)}
                        activeOpacity={0.9}
                        style={styles.card}
                    >
                        <Image
                            source={{ uri: getImageUrl(work.image_url || work.thumbnail || work.image) }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                        
                        {/* Text Overlay */}
                        <View style={styles.overlayContainer}>
                            <View style={styles.textWrapper}>
                                <View style={styles.badgeContainer}>
                                    <Text style={styles.badgeText}>
                                        {work.genre || work.tag || '그림'}
                                    </Text>
                                    {/* Clip path imitation with a simple shape or view for now */}
                                </View>
                                <Text style={styles.workTitle} numberOfLines={1}>
                                    {work.title}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                {/* More Button */}
                {hasMore && (
                    <TouchableOpacity
                        onPress={onMoreClick}
                        style={styles.moreCard}
                    >
                        <ChevronRight size={32} color={colors.gray500} />
                        <Text style={styles.moreText}>더보기</Text>
                        <Text style={styles.moreCount}>{moreCount}개 더 보기</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
        marginBottom: 8,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 24,
        fontFamily: typography.serifRegular, // Changed to serif to match Web h2 "Playfair Display"
        fontWeight: 'bold',
        color: colors.primary,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: typography.sans,
        color: colors.gray500,
    },
    scrollContent: {
        paddingHorizontal: 16,
        gap: 12,
    },
    card: {
        width: 160,
        height: 160,
        borderRadius: 16,
        overflow: 'hidden',
        ...shadowStyles.apple,
        backgroundColor: colors.white,
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    overlayContainer: {
        position: 'absolute',
        bottom: 10,
        left: 10,
        right: 10,
    },
    textWrapper: {
        backgroundColor: 'rgba(255, 255, 255, 0.75)', // Glass imitation
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    badgeContainer: {
        backgroundColor: colors.iMeryBlue,
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 4,
        // For simple clip-path imitation, just using rounded rect for MVP
    },
    badgeText: {
        color: colors.white,
        fontSize: 10,
        fontWeight: 'bold',
        fontFamily: typography.sansBold,
    },
    workTitle: {
        fontSize: 12,
        fontFamily: typography.sansBold,
        color: colors.primary,
    },
    moreCard: {
        width: 160,
        height: 160,
        borderRadius: 16,
        backgroundColor: colors.gray100,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
    },
    moreText: {
        fontSize: 16,
        fontFamily: typography.sansBold,
        color: colors.secondary,
    },
    moreCount: {
        fontSize: 12,
        fontFamily: typography.sans,
        color: colors.gray500,
    },
});
