import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/designSystem';
import api from '../../services/api';

interface IRecordSectionProps {
    userId: number;
}

export default function IRecordSection({ userId }: IRecordSectionProps) {
    const [stats, setStats] = useState<{ genres: any[], styles: any[] }>({ genres: [], styles: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            fetchStats();
        }
    }, [userId]);

    const fetchStats = async () => {
        try {
            const data = await api.getAnalysisStats(userId);
            setStats(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderBarChart = (title: string, data: any[]) => {
        if (!data || data.length === 0) return null;

        // Sort by count desc
        const sorted = [...data].sort((a, b) => b.count - a.count).slice(0, 5); // Top 5
        const maxCount = sorted[0]?.count || 1;

        return (
            <View style={styles.chartSection}>
                <Text style={styles.chartTitle}>{title}</Text>
                {sorted.map((item, index) => {
                    const percentage = (item.count / maxCount) * 100;
                    return (
                        <View key={index} style={styles.barItem}>
                            <View style={styles.barHeader}>
                                <Text style={styles.barLabel}>{item.genre || item.style}</Text>
                                <Text style={styles.barValue}>{item.count}</Text>
                            </View>
                            <View style={styles.barTrack}>
                                <View 
                                    style={[
                                        styles.barFill, 
                                        { 
                                            width: `${percentage}%`,
                                            backgroundColor: index === 0 ? colors.blue500 : colors.gray400 
                                        }
                                    ]} 
                                />
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>I - Record</Text>
                <Text style={styles.subtitle}>나의 취향 분석</Text>
            </View>

            <View style={styles.content}>
                {stats.genres.length === 0 && stats.styles.length === 0 ? (
                    <Text style={styles.emptyText}>아직 분석할 데이터가 부족해요.</Text>
                ) : (
                    <>
                        {renderBarChart('주로 감상한 장르', stats.genres)}
                        <View style={{ height: 24 }} />
                        {renderBarChart('선호하는 스타일', stats.styles)}
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        marginBottom: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.gray600,
    },
    content: {
        paddingVertical: 10,
    },
    chartSection: {
        marginBottom: 10,
    },
    chartTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 12,
    },
    barItem: {
        marginBottom: 12,
    },
    barHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
    },
    barLabel: {
        fontSize: 13,
        color: colors.gray800,
    },
    barValue: {
        fontSize: 13,
        fontWeight: '600',
        color: colors.gray600,
    },
    barTrack: {
        height: 8,
        backgroundColor: colors.gray100,
        borderRadius: 4,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 4,
    },
    emptyText: {
        color: colors.gray400,
        textAlign: 'center',
        padding: 20,
    }
});
