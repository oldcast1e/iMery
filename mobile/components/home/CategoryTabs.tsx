import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, typography } from '../../constants/designSystem';

interface Props {
    selectedGenre: string;
    onGenreChange: (genre: string) => void;
}

const genres = ['전체', '그림', '조각', '사진', '판화', '기타'];

export default function CategoryTabs({ selectedGenre, onGenreChange }: Props) {
    return (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
            style={styles.scrollView}
        >
            {genres.map((genre) => {
                const isSelected = selectedGenre === genre;
                return (
                    <TouchableOpacity
                        key={genre}
                        onPress={() => onGenreChange(genre)}
                        style={[
                            styles.tab,
                            isSelected && styles.activeTab
                        ]}
                    >
                        <Text style={[
                            styles.text,
                            isSelected && styles.activeText
                        ]}>
                            {genre}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        marginBottom: 16,
    },
    container: {
        paddingHorizontal: 16,
        gap: 8,
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 12,
        backgroundColor: colors.gray100,
    },
    activeTab: {
        backgroundColor: colors.primary,
    },
    text: {
        fontSize: 14,
        fontFamily: typography.sansMedium,
        color: colors.primary,
    },
    activeText: {
        color: colors.white,
    },
});
