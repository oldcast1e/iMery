import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Heart, MessageCircle, Share2, MoreHorizontal, Globe, Users, Lock, Bookmark } from 'lucide-react-native';
import { colors, shadowStyles, typography } from '../../constants/designSystem';
import { getImageUrl } from '../../utils/imageHelper';

const { width } = Dimensions.get('window');

interface Props {
  work: any;
  onPress: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
}

export default function FeedCard({ work, onPress, onLike, onComment, onShare, onBookmark }: Props) {
    const imageUrl = getImageUrl(work.image_url || work.thumbnail || work.image);
    const userImage = getImageUrl(work.user_profile_image); // Assuming user data is joined
    
    // Visibility Icon Helper
    const getVisibilityIcon = (vis: string) => {
        switch(vis) {
            case 'friends': return <Users size={12} color={colors.gray400} />;
            case 'private': return <Lock size={12} color={colors.gray400} />;
            default: return <Globe size={12} color={colors.gray400} />;
        }
    };

    return (
        <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.userInfo}>
                    <Image 
                        source={{ uri: userImage || 'https://via.placeholder.com/40' }} 
                        style={styles.avatar} 
                    />
                    <View>
                        <Text style={styles.userName}>{work.nickname || 'Unknown User'}</Text>
                        <View style={styles.metaRow}>
                            <Text style={styles.timeText}>{work.work_date || 'Just now'}</Text>
                            <Text style={styles.dot}>•</Text>
                            {getVisibilityIcon(work.visibility)}
                        </View>
                    </View>
                </View>
                <TouchableOpacity style={styles.moreBtn}>
                    <MoreHorizontal size={20} color={colors.gray500} />
                </TouchableOpacity>
            </View>

            {/* Content Text */}
            {work.description ? (
                <View style={styles.textContainer}>
                    <Text style={styles.description} numberOfLines={3}>
                        {work.description}
                    </Text>
                </View>
            ) : null}

            {/* Content Image */}
            <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
                <Image
                    source={{ uri: imageUrl || 'https://via.placeholder.com/400' }}
                    style={styles.mainImage}
                    resizeMode="cover"
                />
            </TouchableOpacity>

            {/* Footer Stats (Optional, like FB) */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <View style={styles.likeIconBg}>
                        <Heart size={10} color="#FFF" fill="#FFF" />
                    </View>
                    <Text style={styles.statText}>{work.like_count || 0}</Text>
                </View>
                <Text style={styles.statText}>{work.comment_count || 0} comments</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
                <TouchableOpacity style={styles.actionBtn} onPress={onLike}>
                    <Heart 
                        size={20} 
                        color={work.is_liked ? '#EF4444' : colors.gray500} 
                        fill={work.is_liked ? '#EF4444' : 'none'}
                    />
                    <Text style={[styles.actionText, work.is_liked && styles.activeActionText]}>Like</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={onComment}>
                    <MessageCircle size={20} color={colors.gray500} />
                    <Text style={styles.actionText}>Comment</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={onBookmark}>
                    <Bookmark 
                        size={20} 
                        color={work.is_bookmarked ? colors.primary : colors.gray500} 
                        fill={work.is_bookmarked ? colors.primary : 'none'}
                    />
                    <Text style={[styles.actionText, work.is_bookmarked && styles.activeActionText]}>Save</Text>
                </TouchableOpacity>
                 <TouchableOpacity style={styles.actionBtn} onPress={onShare}>
                    <Share2 size={20} color={colors.gray500} />
                    {/* <Text style={styles.actionText}>Share</Text> */}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        marginBottom: 16,
        marginHorizontal: 16,
        borderRadius: 24, // Round corners
        padding: 12, // Internal padding
        ...shadowStyles.sm,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 12,
        paddingHorizontal: 4, // Align with padding
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.gray200,
    },
    userName: {
        fontSize: 15,
        fontFamily: typography.sansBold,
        color: colors.primary,
        marginBottom: 2,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontSize: 12,
        color: colors.gray500,
        fontFamily: typography.sans,
    },
    dot: {
        fontSize: 10,
        color: colors.gray400,
    },
    moreBtn: {
        padding: 4,
    },
    textContainer: {
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    description: {
        fontSize: 14,
        color: colors.primary,
        fontFamily: typography.sans,
        lineHeight: 20,
    },
    imageContainer: {
        marginTop: 4,
        borderRadius: 16,
        overflow: 'hidden',
    },
    mainImage: {
        width: '100%',
        aspectRatio: 1, 
        backgroundColor: colors.gray100,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 4,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    likeIconBg: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statText: {
        fontSize: 13,
        color: colors.gray500,
        fontFamily: typography.sans,
    },
    actionRow: {
        flexDirection: 'row',
        height: 48,
        alignItems: 'center',
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        height: '100%',
    },
    actionText: {
        fontSize: 14,
        color: colors.gray500,
        fontFamily: typography.sansMedium,
    },
    activeActionText: {
        color: '#EF4444',
        fontFamily: typography.sansBold,
    },
});
