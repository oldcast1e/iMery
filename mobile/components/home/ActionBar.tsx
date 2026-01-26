import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Search, Bookmark } from 'lucide-react-native';
import { colors, typography } from '../../constants/designSystem';

interface Props {
    searchQuery: string;
    onSearchChange: (text: string) => void;
    onBookmarkClick?: () => void;
}

export default function ActionBar({ searchQuery, onSearchChange, onBookmarkClick }: Props) {
    return (
        <View style={styles.container}>
            {/* Search Input */}
            <View style={styles.searchContainer}>
                <Search size={20} color={colors.gray400} style={styles.searchIcon} />
                <TextInput
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    placeholder="Search works..."
                    placeholderTextColor={colors.gray400}
                    style={styles.input}
                    autoCapitalize="none"
                />
            </View>

            {/* Bookmark Button */}
            <TouchableOpacity onPress={onBookmarkClick} style={styles.bookmarkButton}>
                <Bookmark size={20} color={colors.primary} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray100, // bg-gray-50 equivalent
        borderRadius: 16,
        paddingHorizontal: 12,
        height: 48,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontFamily: typography.sansMedium,
        fontSize: 14,
        color: colors.primary,
        height: '100%',
    },
    bookmarkButton: {
        width: 48,
        height: 48,
        backgroundColor: colors.gray100,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.gray200,
    },
});
