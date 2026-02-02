import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, ScrollView, Animated } from 'react-native';
import { colors, shadowStyles, typography } from '../../constants/designSystem';

const { width } = Dimensions.get('window');
const CARD_MARGIN = 16;
const CARD_WIDTH = width - (CARD_MARGIN * 2);

const BANNERS = [
    {
        id: 1,
        title: "신규 작가 소개:\n빛의 화가 모네",
        subtitle: "대표작 50선 공개",
        badge: "Curating",
        image: "https://images.unsplash.com/photo-1574169208507-84376144848b?q=80&w=2879&auto=format&fit=crop", // Impressionism
    },
    {
        id: 2,
        title: "SMARCLE x IOT COSS\n플랫폼 출시",
        subtitle: "10% 쿠폰 | 3% 적립",
        badge: "New Release",
        image: "https://images.unsplash.com/photo-1555596899-d644477b611f?q=80&w=2940&auto=format&fit=crop", // Streetwear vibes
    },
    {
        id: 3,
        title: "현대미술의 거장\n데이비드 호크니전",
        subtitle: "얼리버드 티켓 오픈",
        badge: "Exhibition",
        image: "https://images.unsplash.com/photo-1545989253-02cc26577f8d?q=80&w=2920&auto=format&fit=crop", // Museum Interior
    },
    {
        id: 4,
        title: "2026 서울 아트 위크\nVIP 초청 이벤트",
        subtitle: "단 3일간의 혜택",
        badge: "Event",
        image: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?q=80&w=2809&auto=format&fit=crop", // Art Fair
    },
    {
        id: 5,
        title: "iMery 방명록 오픈!\n여러분의 이야기를 남겨주세요",
        subtitle: "참여자 전원 포인트 지급",
        badge: "Notice",
        image: "https://images.unsplash.com/photo-1456324504439-367cee10d632?q=80&w=2940&auto=format&fit=crop", // Notebook/Writing
    },
];

export default function HomeBannerSlider() {
    const [active, setActive] = React.useState(0);

    const onScroll = (event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        setActive(roundIndex);
    };

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                contentContainerStyle={styles.scrollContent}
            >
                {BANNERS.map((banner) => (
                    <View key={banner.id} style={styles.cardContainer}>
                        <View style={styles.card}>
                            <Image 
                                source={{ uri: banner.image }} 
                                style={styles.bgImage} 
                            />
                            <View style={styles.overlay}>
                                <View style={styles.content}>
                                    {banner.badge && (
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>{banner.badge}</Text>
                                        </View>
                                    )}
                                    <Text style={styles.title}>{banner.title}</Text>
                                    <Text style={styles.subtitle}>{banner.subtitle}</Text>
                                </View>
                                
                                <View style={styles.paginationBadge}>
                                    <Text style={styles.paginationText}>{banner.id} / {BANNERS.length}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    scrollContent: {
        // No padding here for pagingEnabled to work perfectly full width
    },
    cardContainer: {
        width: width, // Full width for paging
        paddingHorizontal: 16,
    },
    card: {
        height: 150, // Reduced height per request
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
        position: 'relative',
    },
    bgImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        opacity: 0.8, // Slightly darker for better text contrast
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        padding: 20, // Reduced padding
        justifyContent: 'center', // Center content vertically
        backgroundColor: 'rgba(0,0,0,0.25)', 
    },
    content: {
        marginTop: 0, // Remove top margin
        justifyContent: 'center',
    },
    badge: {
        display: 'none', 
    },
    badgeText: {
        color : '#FFF',
    },
    title: {
        fontSize: 22, // Reduced from 32
        fontFamily: typography.sansBold,
        color: '#FFFFFF',
        lineHeight: 28,
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    subtitle: {
        fontSize: 14, // Reduced from 16
        fontFamily: typography.sans,
        color: '#E0E0E0', 
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    paginationBadge: {
        position: 'absolute',
        bottom: 16,
        right: 16,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        // Removed alignSelf to position absolutely
    },
    paginationText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: 'bold',
    },
});
