import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { colors } from '../../constants/designSystem';
import api from '../../services/api';
import { Palette, Brush, User, Calendar } from 'lucide-react-native';

interface IRecordSectionProps {
    userId: number;
}

const { width } = Dimensions.get('window');

export default function IRecordSection({ userId }: IRecordSectionProps) {
    const [stats, setStats] = useState<{ genres: any[], styles: any[], artists: any[], activity: any[] }>({ genres: [], styles: [], artists: [], activity: [] });
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

    const renderBarChart = (title: string, data: any[], icon: React.ReactNode, color: string) => {
        if (!data || data.length === 0) return null;

        const maxCount = data[0]?.count || 1;

        return (
            <View style={styles.chartSection}>
                <View style={styles.sectionHeader}>
                    {icon}
                    <Text style={styles.chartTitle}>{title}</Text>
                </View>
                {data.map((item, index) => {
                    const percentage = (item.count / maxCount) * 100;
                    return (
                        <View key={index} style={styles.barItem}>
                            <View style={styles.barHeader}>
                                <Text style={styles.barLabel}>{item.label}</Text>
                                <Text style={styles.barValue}>{item.count} works</Text>
                            </View>
                            <View style={styles.barTrack}>
                                <View 
                                    style={[
                                        styles.barFill, 
                                        { 
                                            width: `${percentage}%`,
                                            backgroundColor: index === 0 ? color : colors.gray300 
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

    const renderArtistList = () => {
        if (!stats.artists || stats.artists.length === 0) return null;

        return (
            <View style={styles.chartSection}>
                <View style={styles.sectionHeader}>
                    <User size={18} color={colors.primary} />
                    <Text style={styles.chartTitle}>선호하는 작가</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.artistList}>
                    {stats.artists.map((item, index) => (
                        <View key={index} style={styles.artistCard}>
                            <View style={styles.artistPlaceholder}>
                                <Text style={styles.artistInitials}>{item.label.substring(0, 1)}</Text>
                            </View>
                            <Text style={styles.artistName} numberOfLines={1}>{item.label}</Text>
                            <Text style={styles.artistCount}>{item.count} works</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
        );
    };

    const renderSummary = () => {
        const topGenre = stats.genres[0]?.label;
        const topArtist = stats.artists[0]?.label;

        if (!topGenre && !topArtist) return null;

        return (
            <View style={styles.summaryContainer}>
                <Text style={styles.summaryText}>
                    당신은{' '}
                    {topGenre && <Text style={styles.highlight}>{topGenre}</Text>}
                    {topGenre && topArtist && '와 '}
                    {topArtist && <Text style={styles.highlight}>{topArtist}</Text>}
                    {topArtist ? '의 작품을' : '을'}
                    {'\n'}특별히 사랑하는 컬렉터시군요! 🎨
                </Text>
            </View>
        );
    };

    const renderHeatmap = () => {
        // Configuration
        const today = new Date();
        const weeksToDisplay = 20; // Approx 5 months
        const daysToDisplay = weeksToDisplay * 7;
        
        // Calculate Start Date (ensure it starts on a Sunday/Monday aligned?) 
        // Let's just go back N days.
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - daysToDisplay + 1); // +1 to include today

        // Prepare Grid Data
        const grid = [];
        let currentWeek: { date: string; count: number }[] = [];
        const monthLabels: { label: string; index: number }[] = [];
        let lastMonth = -1;

        for (let i = 0; i < daysToDisplay; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            
            // Loose matching: Check if dateStr is contained in the returned DB date string
            // Because DB might return "2024-02-01 00:00:00" or just "2024-02-01"
            const activity = stats.activity?.find(a => 
                a.date && String(a.date).includes(dateStr)
            );
            const count = activity ? activity.count : 0;
            
            // Month Label Logic (Check 1st day of week)
            if (currentWeek.length === 0) {
                 const month = d.getMonth();
                 if (month !== lastMonth) {
                     monthLabels.push({ 
                         label: d.toLocaleString('en-US', { month: 'short' }), 
                         index: grid.length 
                     });
                     lastMonth = month;
                 }
            }

            currentWeek.push({ date: dateStr, count });

            if (currentWeek.length === 7) {
                grid.push(currentWeek);
                currentWeek = [];
            }
        }
        // Push remaining days if any (though logic above should be 7-aligned if strict)
        if (currentWeek.length > 0) grid.push(currentWeek);

        const getColor = (count: number) => {
            // Signature Blue Scale
            if (count === 0) return '#F3F4F6'; 
            if (count <= 1) return '#BFDBFE'; // blue200
            if (count <= 3) return '#60A5FA'; // blue400
            if (count <= 5) return '#2563EB'; // blue600
            return '#1E3A8A'; // blue900
        };

        return (
            <View style={styles.chartSection}>
                 <View style={styles.sectionHeader}>
                    <Calendar size={18} color={colors.primary} />
                    <Text style={styles.chartTitle}>작품 활동</Text>
                </View>
                
                <View style={styles.heatmapWrapper}>
                    {/* Day Labels (Left) */}
                    <View style={styles.dayLabels}>
                        <Text style={styles.dayLabelText}> </Text>
                        <Text style={styles.dayLabelText}>Mon</Text>
                        <Text style={styles.dayLabelText}> </Text>
                        <Text style={styles.dayLabelText}>Wed</Text>
                        <Text style={styles.dayLabelText}> </Text>
                        <Text style={styles.dayLabelText}>Fri</Text>
                         <Text style={styles.dayLabelText}> </Text>
                    </View>

                    {/* Grid + Month Labels (Right) */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View>
                            {/* Month Labels Row */}
                            <View style={styles.monthLabelRow}>
                                {monthLabels.map((m, i) => (
                                    <Text key={i} style={[styles.monthLabelText, { left: m.index * 15 }]}>
                                        {m.label}
                                    </Text>
                                ))}
                            </View>

                            {/* The Grid */}
                            <View style={styles.heatmapContainer}>
                                {grid.map((week, wIndex) => (
                                    <View key={wIndex} style={styles.heatmapColumn}>
                                        {week.map((day, dIndex) => (
                                            <View 
                                                key={dIndex} 
                                                style={[
                                                    styles.heatmapCell, 
                                                    { backgroundColor: getColor(day.count) }
                                                ]} 
                                            />
                                        ))}
                                    </View>
                                ))}
                            </View>
                        </View>
                    </ScrollView>
                </View>

                {/* Legend */}
                <View style={styles.heatmapLegend}>
                    <Text style={styles.legendText}>Less</Text>
                    <View style={[styles.legendCell, { backgroundColor: '#F3F4F6' }]} />
                    <View style={[styles.legendCell, { backgroundColor: '#BFDBFE' }]} />
                    <View style={[styles.legendCell, { backgroundColor: '#60A5FA' }]} />
                    <View style={[styles.legendCell, { backgroundColor: '#2563EB' }]} />
                    <View style={[styles.legendCell, { backgroundColor: '#1E3A8A' }]} />
                    <Text style={styles.legendText}>More</Text>
                </View>
            </View>
        );
    };

    if (loading) return <View style={styles.loadingContainer}><Text>Analysing...</Text></View>;

    const isEmpty = stats.genres.length === 0 && stats.styles.length === 0 && stats.artists.length === 0 && (!stats.activity || stats.activity.length === 0);

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.content}>
                {isEmpty ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>아직 분석할 데이터가 충분하지 않아요.{'\n'}좋아요와 북마크를 통해 취향을 알려주세요!</Text>
                    </View>
                ) : (
                    <>
                        {renderSummary()}
                        {renderArtistList()}
                        
                        {/* Charts - Full Width */}
                        {renderBarChart('가장 많이 본 장르', stats.genres, <Palette size={16} color={colors.primary} />, colors.blue500)}
                        {renderBarChart('선호하는 화풍', stats.styles, <Brush size={16} color={colors.primary} />, '#8B5CF6')}

                        {renderHeatmap()}
                    </>
                )}
            </View>
            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    content: {
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: 200,
    },
    summaryContainer: {
        marginBottom: 24,
        padding: 16,
        backgroundColor: colors.primary + '10', // Light primary
        borderRadius: 16,
        alignItems: 'center',
    },
    summaryText: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333',
        textAlign: 'center',
        fontWeight: '500',
    },
    highlight: {
        fontWeight: 'bold',
        color: colors.primary,
        fontSize: 18,
    },
    chartSection: {
        marginBottom: 32,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 6,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    barItem: {
        marginBottom: 16,
    },
    barHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    barLabel: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    barValue: {
        fontSize: 12,
        color: colors.gray500,
    },
    barTrack: {
        height: 10,
        backgroundColor: '#F3F4F6',
        borderRadius: 5,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 5,
    },
    artistList: {
        paddingRight: 20,
    },
    artistCard: {
        marginRight: 16,
        alignItems: 'center',
        width: 80,
    },
    artistPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#eee',
    },
    artistInitials: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
    artistName: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        textAlign: 'center',
        marginBottom: 2,
    },
    artistCount: {
        fontSize: 11,
        color: colors.gray400,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        color: colors.gray500,
        textAlign: 'center',
        lineHeight: 24,
    },
    // Heatmap
    heatmapWrapper: {
        flexDirection: 'row',
        marginTop: 10,
    },
    dayLabels: {
        marginTop: 20, // Offset for month labels
        marginRight: 8,
        justifyContent: 'space-between',
        height: 102, // 7 cells * (12+3) - last gap? Approx 15 * 7 = 105
        paddingBottom: 4,
    },
    dayLabelText: {
        fontSize: 9,
        color: colors.gray400,
        height: 12,
        lineHeight: 12,
    },
    monthLabelRow: {
        flexDirection: 'row',
        height: 20,
        position: 'relative',
        marginBottom: 4,
    },
    monthLabelText: {
        position: 'absolute',
        fontSize: 10,
        color: colors.gray500,
    },
    heatmapContainer: {
        flexDirection: 'row',
        gap: 3,
    },
    heatmapColumn: {
        gap: 3,
    },
    heatmapCell: {
        width: 12,
        height: 12,
        borderRadius: 2,
    },
    heatmapLegend: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 12,
        gap: 4,
    },
    legendCell: {
        width: 10,
        height: 10,
        borderRadius: 2,
    },
    legendText: {
        fontSize: 10,
        color: colors.gray500,
        marginHorizontal: 4,
    },
    rowContainer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 24,
    },
    halfColumn: {
        flex: 1,
    }
});
