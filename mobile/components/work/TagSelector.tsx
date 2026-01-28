import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Tag as TagIcon, X, ChevronRight } from 'lucide-react-native';
import { TAG_DATA } from '../../constants/tagData';
import { colors, typography } from '../../constants/designSystem';

interface Tag {
    id: string;
    label: string;
    path: string[];
}

interface TagSelectorProps {
    selectedTags: Tag[];
    onTagsChange: (tags: Tag[]) => void;
}

export default function TagSelector({ selectedTags, onTagsChange }: TagSelectorProps) {
    const [activeHigh, setActiveHigh] = useState<string | null>(null);
    const [activeMiddle, setActiveMiddle] = useState<string | null>(null);

    const handleHighClick = (high: string) => {
        if (activeHigh === high) {
            setActiveHigh(null);
            setActiveMiddle(null);
        } else {
            setActiveHigh(high);
            setActiveMiddle(null);
        }
    };

    const handleMiddleClick = (middle: string) => {
        if (!activeHigh) return;
        
        if (activeMiddle !== middle) {
            setActiveMiddle(middle);
        }

        const path = [activeHigh, middle];
        const id = path.join('-');

        const isLeafSelected = selectedTags.some(t => t.id === id);
        const hasChildSelected = selectedTags.some(t => t.id.startsWith(id + '-'));

        if (isLeafSelected) {
            onTagsChange(selectedTags.filter(t => t.id !== id));
        } else if (!hasChildSelected) {
            if (selectedTags.length >= 5) {
                Alert.alert('알림', '최대 5개의 태그만 선택할 수 있습니다.');
                return;
            }
            onTagsChange([...selectedTags, { id, label: middle, path }]);
        }
    };

    const toggleLowTag = (low: string, path: string[]) => {
        const id = path.join('-');
        const middleId = path.slice(0, 2).join('-');

        if (selectedTags.some(t => t.id === id)) {
            onTagsChange(selectedTags.filter(t => t.id !== id));
            return;
        }

        if (selectedTags.length >= 5) {
            Alert.alert('알림', '최대 5개의 태그만 선택할 수 있습니다.');
            return;
        }

        // Remove parent middle tag if it was selected as a leaf
        const filtered = selectedTags.filter(t => t.id !== middleId);
        onTagsChange([...filtered, { id, label: low, path }]);
    };

    const removeTag = (id: string) => {
        onTagsChange(selectedTags.filter(t => t.id !== id));
    };

    return (
        <View style={styles.container}>
            {/* 1. Selected Tags (Chips) */}
            <View style={styles.selectedContainer}>
                {selectedTags.map((tag) => (
                    <View key={tag.id} style={styles.chip}>
                        <TagIcon size={12} color="#9CA3AF" />
                        <Text style={styles.chipText}>{tag.label}</Text>
                        <TouchableOpacity onPress={() => removeTag(tag.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <X size={14} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            {/* 2. Selection Navigation */}
            <View style={styles.selectorBox}>
                {/* High Categories (Tabs) */}
                <View style={styles.highTabs}>
                    {Object.keys(TAG_DATA).map((high) => (
                        <TouchableOpacity
                            key={high}
                            onPress={() => handleHighClick(high)}
                            style={[
                                styles.highTab,
                                activeHigh === high && styles.highTabActive
                            ]}
                        >
                            <Text style={[
                                styles.highTabText,
                                activeHigh === high && styles.highTabTextActive
                            ]}>
                                {high}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Middle Categories */}
                {activeHigh && (
                    <View style={styles.middleGrid}>
                        {Object.keys(TAG_DATA[activeHigh]).map((middle) => {
                            const id = `${activeHigh}-${middle}`;
                            const isLeaf = selectedTags.some(t => t.id === id);
                            const hasChild = selectedTags.some(t => t.id.startsWith(id + '-'));
                            const isActive = activeMiddle === middle;

                            return (
                                <TouchableOpacity
                                    key={middle}
                                    onPress={() => handleMiddleClick(middle)}
                                    style={[
                                        styles.middleButton,
                                        isActive && styles.middleButtonActive,
                                        (isLeaf || hasChild) && !isActive && styles.middleButtonSelectedLeaf
                                    ]}
                                >
                                    <Text style={[
                                        styles.middleText,
                                        isActive && styles.middleTextActive,
                                        (isLeaf || hasChild) && !isActive && styles.middleTextSelectedLeaf
                                    ]}>
                                        {middle}
                                    </Text>
                                    
                                    {isActive ? (
                                        <ChevronRight size={14} color="#FFF" />
                                    ) : (isLeaf || hasChild) ? (
                                        <View style={styles.dot} />
                                    ) : (
                                        <ChevronRight size={14} color="#D1D5DB" />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {/* Low Categories */}
                {activeHigh && activeMiddle && TAG_DATA[activeHigh]?.[activeMiddle] && (
                    <View style={styles.lowContainer}>
                        {TAG_DATA[activeHigh][activeMiddle].map((low) => {
                            const path = [activeHigh, activeMiddle, low];
                            const id = path.join('-');
                            const isSelected = selectedTags.some(t => t.id === id);

                            return (
                                <TouchableOpacity
                                    key={low}
                                    onPress={() => toggleLowTag(low, path)}
                                    style={[
                                        styles.lowButton,
                                        isSelected && styles.lowButtonActive
                                    ]}
                                >
                                    <Text style={[
                                        styles.lowText,
                                        isSelected && styles.lowTextActive
                                    ]}>
                                        {low}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
    },
    selectedContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        minHeight: 32,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        backgroundColor: '#F3F4F6',
        borderRadius: 9999,
    },
    chipText: {
        fontSize: 12,
        fontFamily: typography.sansBold,
        color: '#374151',
    },
    selectorBox: {
        backgroundColor: '#F9FAFB', // gray-50
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        gap: 16,
    },
    highTabs: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        padding: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        justifyContent: 'space-between',
        gap: 4,
    },
    highTab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    highTabActive: {
        backgroundColor: '#111827', // black
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    highTabText: {
        fontSize: 12,
        fontFamily: typography.sansBold,
        color: '#9CA3AF',
    },
    highTabTextActive: {
        color: '#FFFFFF',
    },
    middleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    middleButton: {
        width: '48%', // Approx 2 columns
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    middleButtonActive: {
        backgroundColor: '#111827',
        borderColor: '#111827',
    },
    middleButtonSelectedLeaf: {
        borderColor: '#111827',
        backgroundColor: '#FFFFFF',
    },
    middleText: {
        fontSize: 12,
        fontFamily: typography.sansBold,
        color: '#6B7280',
    },
    middleTextActive: {
        color: '#FFFFFF',
    },
    middleTextSelectedLeaf: {
        color: '#111827',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#111827',
    },
    lowContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        justifyContent: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    lowButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    lowButtonActive: {
        backgroundColor: '#111827',
        borderColor: '#111827',
    },
    lowText: {
        fontSize: 12,
        fontFamily: typography.sans,
        color: '#9CA3AF',
    },
    lowTextActive: {
        color: '#FFFFFF',
        fontFamily: typography.sansBold,
    },
});
