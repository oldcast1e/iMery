import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ArrowDownUp, Grid, List } from 'lucide-react-native';
import { colors, shadowStyles, typography } from '../../constants/designSystem';

interface Props {
    selectedRating: string;
    onRatingChange: (rating: string) => void;
    sortBy: 'latest' | 'name';
    onSortChange: (sort: 'latest' | 'name') => void;
    layout: 'list' | 'large' | 'medium' | 'small';
    onLayoutChange: (layout: any) => void;
}

const ratingFilters = ['All', '★5', '★4', '★3', '★2', '★1'];

export default function FilterChips({
    selectedRating,
    onRatingChange,
    sortBy,
    onSortChange,
    layout,
    onLayoutChange
}: Props) {
    
    const handleLayoutCycle = () => {
        const layouts = ['list', 'large', 'medium', 'small'];
        const currentIndex = layouts.indexOf(layout);
        const nextIndex = (currentIndex + 1) % layouts.length;
        onLayoutChange(layouts[nextIndex]);
    };

    const getLayoutIcon = () => {
        // Simple mapping for MVP icon
        if (layout === 'list') return <List size={20} color={colors.gray500} />;
        return <Grid size={20} color={colors.gray500} />;
    };

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                {/* Rating Filters */}
                <View style={styles.ratingContainer}>
                    {ratingFilters.map((filter) => {
                        const isSelected = selectedRating === filter;
                        return (
                            <TouchableOpacity
                                key={filter}
                                onPress={() => onRatingChange(filter)}
                                style={[
                                    styles.ratingButton,
                                    isSelected && styles.activeRatingButton
                                ]}
                            >
                                <Text style={[
                                    styles.ratingText,
                                    isSelected && styles.activeRatingText
                                ]}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Sort Button */}
                <TouchableOpacity
                    onPress={() => onSortChange(sortBy === 'latest' ? 'name' : 'latest')}
                    style={styles.iconButton}
                >
                    <ArrowDownUp size={18} color={colors.gray500} />
                </TouchableOpacity>

                {/* Layout Button */}
                <TouchableOpacity
                    onPress={handleLayoutCycle}
                    style={styles.iconButton}
                >
                    {getLayoutIcon()}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    ratingContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.6)', // Glass
        padding: 6,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        gap: 4,
    },
    ratingButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 6,
        borderRadius: 12,
    },
    activeRatingButton: {
        backgroundColor: colors.primary,
        ...shadowStyles.apple,
    },
    ratingText: {
        fontSize: 11,
        fontFamily: typography.sansBold,
        color: colors.gray400,
    },
    activeRatingText: {
        color: colors.white,
    },
    iconButton: {
        backgroundColor: 'rgba(255,255,255,0.6)',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
    },
});
