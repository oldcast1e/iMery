import React, { useState, useEffect, useRef } from 'react';
import { 
    View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, 
    FlatList, Modal, Animated, PanResponder, TextInput, Pressable, Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ticket, Star, StarHalf, Edit3, Check } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '@services/api';
import { colors, typography, shadowStyles } from '../../constants/designSystem';
import Svg, { Path } from 'react-native-svg';

// ... (Existing Imports and Constants remain)

// Include Exhibition Interface (assuming it's here or I need to preserve it if I replaced the whole file? 
// No, I am observing line 1-800. I need to be careful with replace_file_content to not wipe out imports if I start later.
// But I am replacing lines logic via chunk. 
// Wait, I will use REPLACE_FILE_CONTENT with specific chunks to avoid huge rewrite.

// CHUNK 1: Imports
// CHUNK 2: FlipTicket Logic Update

// Let's grab imports first. I need DateTimePicker.
// I will target the top file imports.
// Then FlipTicket logic.

// Actually, let's just use MultiReplace or multiple calls. 
// Step 1: Add import.
// Step 2: Update FlipTicket.

// Implementation below.


const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const GRID_SPACING = 12; // Gap between items
const HORIZONTAL_PADDING = 20;
// Calculate item width: (Screen Width - Padding*2 - Spacing*(Cols-1)) / Cols
const ITEM_WIDTH = (width - (HORIZONTAL_PADDING * 2) - (GRID_SPACING * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

interface Exhibition {
    id: number;
    name: string;
    visit_date: string; // 'YYYY.MM.DD'
    location?: string;
    representative_image?: string;
    representative_artist_name?: string;
    representative_title?: string;
    bg_color?: string;
    rating?: number;
    avg_rating?: number;
    review?: string;
    user_nickname?: string;
    director?: string;
    cast_members?: string;
    inferred_cast?: string;
    visit_time?: string;
}

interface IMemoySectionProps {
    userId: number;
}

// Visual Assets
// Visual Assets
const TicketEdge = ({ width, height = 10, color = '#FFF', position = 'top' }: { width: number, height?: number, color?: string, position?: 'top' | 'bottom' }) => {
    const toothWidth = 10; 
    const teethCount = Math.ceil(width / toothWidth);
    
    // Generate Softer Rounded Square Path
    // Pattern: Flat Peak -> Soft Curve Down -> Soft Curve Up -> Flat Peak
    
    let d = ``;
    if (position === 'top') {
        d = `M0 0`;
        for (let i = 0; i < teethCount; i++) {
            const x = i * toothWidth;
            // 1. Flat Top (Ticket Peak)
            d += ` L${x + 4} 0`; 
            // 2. Curve Down (Left side of gap)
            // Start at (x+4, 0). Control1 (x+6, 0). Control2 (x+5, h). End (x+7.5, h).
            d += ` C${x + 6} 0, ${x + 5} ${height}, ${x + 7.5} ${height}`; 
            // 3. Curve Up (Right side of gap)
            // Start at (x+7.5, h). Control1 (x+10, h). Control2 (x+9, 0). End (x+11, 0).
            d += ` C${x + 10} ${height}, ${x + 9} 0, ${x + 11} 0`; 
            // 4. Flat Top (Next Peak)
            d += ` L${x + toothWidth} 0`;
        }
        d += ` Z`;
    } else {
        // Bottom Edge Mask (Inverted)
        d = `M0 ${height}`;
        for (let i = 0; i < teethCount; i++) {
            const x = i * toothWidth;
            // 1. Flat Bottom (Ticket Edge)
            d += ` L${x + 4} ${height}`;
            // 2. Curve Up
            d += ` C${x + 6} ${height}, ${x + 5} 0, ${x + 7.5} 0`; 
            // 3. Curve Down
            d += ` C${x + 10} 0, ${x + 9} ${height}, ${x + 11} ${height}`; 
            // 4. Flat Bottom
            d += ` L${x + toothWidth} ${height}`;
        }
        d += ` Z`;
    }

    return (
        <Svg width={width} height={height} style={{ position: 'absolute', [position]: 0, zIndex: 10 }}>
            <Path d={d} fill={color} /> 
        </Svg>
    );
};

// Utils for Color
const getSafeBgColor = (hex?: string) => {
    const DEFAULT_COLOR = '#EAD5B7';
    
    if (!hex) return DEFAULT_COLOR;
    let color = hex.toLowerCase().trim();
    
    // Explicit White Check
    if (color === '#ffffff' || color === '#fff' || color === 'white') return DEFAULT_COLOR;

    // Luminance Check
    let r = 0, g = 0, b = 0;
    
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    color = color.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    if (color.startsWith('#')) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
        if (result) {
            r = parseInt(result[1], 16);
            g = parseInt(result[2], 16);
            b = parseInt(result[3], 16);
        } else {
             // Invalid Hex -> Default
             return DEFAULT_COLOR;
        }
    } else {
        // Assume default if not hex (skipping named colors parsing for now unless 'white')
        return DEFAULT_COLOR;
    }

    // Perceived brightness formula
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // Stricter Threshold: > 220 is too bright
    if (brightness > 220) {
        return DEFAULT_COLOR;
    }

    return '#' + color.replace('#',''); 
};

const getTextColor = (hex: string) => {
    // Simple luminance check
    const c = hex.substring(1);      // strip #
    const rgb = parseInt(c, 16);   // convert rrggbb to decimal
    const r = (rgb >> 16) & 0xff;  // extract red
    const g = (rgb >>  8) & 0xff;  // extract green
    const b = (rgb >>  0) & 0xff;  // extract blue

    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b; // per ITU-R BT.709

    return luma < 140 ? '#FFFFFF' : '#1a1a1a'; // if dark, white text. if light, dark text.
};


// --- 1. Mini Ticket Component (For Grid) ---
const MiniTicket = ({ item, onPress }: { item: Exhibition, onPress: () => void }) => {
    // Format Date
    const dateStr = item.visit_date ? item.visit_date.replace(/-/g, '.') : 'YYYY.MM.DD';
    
    // Safety check for rating
    const ratingScore = Number(item.avg_rating || item.rating || 0);

    const bgColor = getSafeBgColor(item.bg_color);
    const textColor = getTextColor(bgColor);
    const borderColor = textColor;

    return (
        <View style={{ width: ITEM_WIDTH, alignItems: 'center', marginBottom: 20 }}>
            <TouchableOpacity 
                activeOpacity={0.9} 
                onPress={onPress}
                style={[styles.miniTicketContainer, { backgroundColor: bgColor }]}
            >
                {/* Top Edge */}
                <TicketEdge width={ITEM_WIDTH} height={6} position="top" color={colors.background} />
                
                <View style={{ flex: 1, padding: 8, alignItems: 'center' }}>
                    {/* 1. Header: Nickname & Artist */}
                    <Text style={[styles.mtNickname, { color: textColor }]} numberOfLines={1}>
                        @{item.user_nickname || 'User'}
                    </Text>
                    <Text style={[styles.mtArtist, { color: textColor }]} numberOfLines={1}>
                        {item.representative_artist_name || 'Artist'}
                    </Text>

                    {/* 2. Image */}
                    <View style={styles.mtImageContainer}> 
                        {item.representative_image ? (
                            <Image source={{ uri: item.representative_image }} style={styles.ftImage} />
                        ) : (
                            <View style={styles.miniPlaceholder}>
                                 <Ticket color={textColor} size={16} style={{ opacity: 0.2 }} />
                            </View>
                        )}
                    </View>

                    {/* 3. Info Table (Simplified for Mini) */}
                    <View style={[styles.mtInfoBox, { borderColor: borderColor, borderRadius: 3, overflow: 'hidden' }]}>
                        <View style={[styles.mtInfoRow, { borderBottomWidth: 0.5, borderColor: borderColor }]}>
                             <View style={[styles.mtRatingBox, { borderRightWidth: 0.5, borderColor: borderColor }]}>
                                <Text style={[styles.mtInfoText, { color: textColor, fontFamily: typography.serif }]}>★ {ratingScore.toFixed(1)}</Text>
                             </View>
                             <View style={styles.mtTitleBox}>
                                <Text style={[styles.mtInfoText, { color: textColor, fontFamily: typography.serif }]} numberOfLines={1}>
                                    {item.name}
                                </Text>
                             </View>
                        </View>
                        <View style={styles.mtReviewBox}>
                             <Text style={[styles.mtReviewText, { 
                                 color: (!item.review || item.review.trim() === '' || item.review === '나의 전시 기록') ? (textColor === '#FFFFFF' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)') : textColor, 
                                 fontFamily: typography.serif 
                             }]} numberOfLines={1}>
                                {(!item.review || item.review.trim() === '' || item.review === '나의 전시 기록') ? "전시회 한 줄 평을 입력하세요." : item.review}
                             </Text>
                        </View>
                    </View>

                    {/* 4. Date */}
                    <Text style={[styles.mtDate, { color: textColor }]}>{dateStr}</Text>
                    
                    {/* 5. iMery Logo */}
                    <Text style={[styles.mtLogo, { color: textColor }]}>iMery</Text>
                </View>

                {/* Bottom Edge */}
                <TicketEdge width={ITEM_WIDTH} height={6} position="bottom" color={colors.background} />
            </TouchableOpacity>
        </View>
    );
};

// --- 2. Flip Ticket Component (Modal) ---
const FlipTicket = ({ item, onClose, onUpdate }: { item: Exhibition, onClose: () => void, onUpdate?: (item: Exhibition) => void }) => {
    // Dimensions
    const ticketWidth = width * 0.85;
    const ticketHeight = ticketWidth * 1.8; 
    const overlayColor = 'rgba(0,0,0,0.9)'; 

    // Animation
    const animatedValue = useRef(new Animated.Value(0)).current;
    const [isFlipped, setIsFlipped] = useState(false);
    
    // Local State
    const [localReview, setLocalReview] = useState(item.review || '');
    const [localDirector, setLocalDirector] = useState(item.director || '');
    const [localCast, setLocalCast] = useState(item.cast_members || item.inferred_cast || '');
    const [localTime, setLocalTime] = useState(item.visit_time || ''); // Format 'HH:mm'
    
    // Time Picker State
    const [timePickerDate, setTimePickerDate] = useState(() => {
        if (item.visit_time) {
            const [h, m] = item.visit_time.split(':');
            const d = new Date();
            d.setHours(Number(h), Number(m));
            return d;
        }
        return new Date();
    });
    const [showTimePicker, setShowTimePicker] = useState(false);

    const saveChanges = async () => {
        try {
            await api.updateExhibition(item.id, {
                review: localReview,
                director: localDirector,
                cast_members: localCast,
                visit_time: localTime
            });
            // Update local item mutation
            item.review = localReview;
            item.director = localDirector;
            item.cast_members = localCast;
            item.visit_time = localTime;
            
            if (onUpdate) onUpdate(item);
        } catch (e) {
            console.error('Failed to save ticket details', e);
        }
    };

    const flipCard = () => {
        if (isFlipped) {
             saveChanges();
             Animated.spring(animatedValue, {
                toValue: 0,
                friction: 8,
                tension: 10,
                useNativeDriver: true
            }).start();
            setIsFlipped(false);
        } else {
             Animated.spring(animatedValue, {
                toValue: 180,
                friction: 8,
                tension: 10,
                useNativeDriver: true
            }).start();
            setIsFlipped(true);
        }
    };

    const frontInterpolate = animatedValue.interpolate({
        inputRange: [0, 180],
        outputRange: ['0deg', '180deg'],
    });
    const backInterpolate = animatedValue.interpolate({
        inputRange: [0, 180],
        outputRange: ['180deg', '360deg'],
    });

    const bgColor = getSafeBgColor(item.bg_color);
    const textColor = getTextColor(bgColor); 
    const borderColor = textColor;
    const dateStr = item.visit_date ? item.visit_date.replace(/-/g, '.') : 'YYYY.MM.DD';
    const year = item.visit_date ? item.visit_date.split('-')[0].split('.')[0] : '2026';
    const ratingScore = Number(item.avg_rating || item.rating || 0);

    const renderFront = () => (
        <Animated.View style={[styles.flipCard, { 
            width: ticketWidth, height: ticketHeight, backgroundColor: bgColor,
            transform: [{ rotateY: frontInterpolate }],
            zIndex: isFlipped ? 0 : 1 
        }]}>
             <TicketEdge width={ticketWidth} height={6} position="top" color={overlayColor} />
             <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24, alignItems: 'center' }}>
                <Text style={[styles.ftTopNickname, { color: textColor }]}>@{item.user_nickname || 'User'}</Text>
                <Text style={[styles.ftTopArtist, { color: textColor, fontFamily: typography.serif }]}>
                    {item.representative_artist_name ? `${item.representative_artist_name}` : 'Unknown Artist'}
                </Text>

                <View style={styles.ftImageContainer}>
                     {item.representative_image ? (
                         <Image source={{ uri: item.representative_image }} style={styles.ftImage} />
                     ) : (
                         <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.1)' }} />
                     )}
                </View>

                <View style={[styles.ftInfoBox, { borderColor: borderColor, borderRadius: 12 }]}>
                    <View style={[styles.ftInfoRow, { borderBottomWidth: 1, borderColor: borderColor }]}>
                        <View style={[styles.ftRatingContainer, { borderRightWidth: 1, borderColor: borderColor, paddingHorizontal: 8 }]}>
                            <Star size={13} color={textColor} fill={textColor} style={{ marginRight: 4 }} />
                            <Text style={[styles.ftRatingText, { color: textColor, fontFamily: typography.serif }]}>{ratingScore.toFixed(1)}</Text>
                        </View>
                        <View style={styles.ftTitleContainer}>
                            <Text style={[styles.ftTitleText, { color: textColor, fontFamily: typography.serif }]} numberOfLines={1}>
                                {item.name}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.ftReviewContainer}>
                         <Text style={{ 
                             fontFamily: typography.serif, 
                             fontSize: 13, 
                             color: (!localReview || localReview.trim() === '' || localReview === '나의 전시 기록') 
                                ? (textColor === '#FFFFFF' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)') 
                                : textColor, 
                             fontWeight: 'bold', 
                             marginBottom: 4 
                         }}>
                             {(!localReview || localReview.trim() === '' || localReview === '나의 전시 기록') ? "전시회 한 줄 평을 입력하세요." : localReview}
                         </Text>
                    </View>
                </View>

                <Text style={[styles.ftBottomDate, { color: textColor }]}>{dateStr}</Text>
                <View style={{ marginTop: 'auto' }}>
                     <Text style={[styles.ftBottomLogo, { color: textColor }]}>iMery</Text>
                </View>
             </View>
             <TicketEdge width={ticketWidth} height={6} position="bottom" color={overlayColor} />
             
             {!isFlipped && (
                 <TouchableOpacity style={StyleSheet.absoluteFill} onPress={flipCard} activeOpacity={1} />
             )}
        </Animated.View>
    );

    const roundedRating = Math.round(ratingScore * 2) / 2; 
    
    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            if (roundedRating >= i) {
                stars.push(<Star key={i} size={16} fill={textColor} color={textColor} style={{ marginHorizontal: 2 }} />);
            } else if (roundedRating >= i - 0.5) {
                stars.push(<StarHalf key={i} size={16} fill={textColor} color={textColor} style={{ marginHorizontal: 2 }} />);
            } else {
                stars.push(<Star key={i} size={16} color={textColor} style={{ marginHorizontal: 2 }} />);
            }
        }
        return stars;
    };

    const [isEditing, setIsEditing] = useState(false);

    const toggleEdit = () => {
        if (isEditing) {
            saveChanges();
            setIsEditing(false);
            setShowTimePicker(false); // Close picker if open
        } else {
            setIsEditing(true);
        }
    };

    const handleTimeChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setTimePickerDate(selectedDate);
            // Format HH:mm
            const h = selectedDate.getHours().toString().padStart(2, '0');
            const m = selectedDate.getMinutes().toString().padStart(2, '0');
            setLocalTime(`${h}:${m}`);
        }
    };

    // Shared Edit Style
    const editStyle = {
        borderBottomWidth: 1,
        borderColor: textColor,
        // paddingBottom: 2, // slightly reduced padding to keep alignment
    };

    const renderBack = () => (
        <Animated.View style={[styles.flipCard, styles.flipCardBack, { 
            width: ticketWidth, height: ticketHeight, backgroundColor: bgColor,
            transform: [{ rotateY: backInterpolate }],
            zIndex: isFlipped ? 1 : 0 
        }]}>
            <TicketEdge width={ticketWidth} height={6} position="top" color={overlayColor} />
            <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 24, zIndex: 50, pointerEvents: 'box-none' }}>
                
                {/* 1. Header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, alignItems: 'center', zIndex: 51 }}>
                     <View>
                        <Text style={{ fontFamily: typography.serif, fontSize: 10, letterSpacing: 1, color: textColor, fontWeight: 'bold' }}>
                             IMERY ORIGINAL TICKET
                        </Text>
                        <Text style={{ fontFamily: typography.serif, fontSize: 10, color: textColor }}>
                             No. {100 + item.id}
                        </Text>
                     </View>
                     
                     <TouchableOpacity 
                        onPress={toggleEdit} 
                        style={{ padding: 8 }}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                     >
                        {isEditing ? <Check size={18} color={textColor} /> : <Edit3 size={18} color={textColor} />}
                     </TouchableOpacity>
                </View>

                {/* 2. Main Title */}
                <View style={{ alignItems: 'center', marginBottom: 16 }}>
                     <Text style={{ fontFamily: typography.serif, fontSize: 24, color: textColor, marginBottom: 4, textAlign: 'center' }}>
                         {item.name}
                     </Text>
                     <Text style={{ fontFamily: typography.serif, fontSize: 12, color: textColor, opacity: 0.7 }}>
                         : {year}
                     </Text>
                </View>

                {/* 3. Info List */}
                <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: textColor, paddingVertical: 12, marginBottom: 16 }}>
                    <View style={styles.backInfoRow}>
                        <Text style={[styles.backLabel, { color: textColor }]}>Date</Text>
                        <Text style={[styles.backValue, { color: textColor }]}>{dateStr}</Text>
                    </View>
                    <View style={styles.backInfoRow}>
                        <Text style={[styles.backLabel, { color: textColor }]}>Director</Text>
                        {isEditing ? (
                            <TextInput 
                                value={localDirector}
                                onChangeText={setLocalDirector}
                                placeholder="Director"
                                placeholderTextColor={textColor + '60'}
                                style={[styles.backInput, { color: textColor }, isEditing && editStyle]}
                            />
                        ) : (
                             <Text style={[styles.backValue, { color: textColor }]} numberOfLines={1}>{localDirector || '-'}</Text>
                        )}
                    </View>
                    <View style={styles.backInfoRow}>
                        <Text style={[styles.backLabel, { color: textColor }]}>Cast</Text>
                        {isEditing ? (
                            <TextInput 
                                value={localCast}
                                onChangeText={setLocalCast}
                                placeholder="Use comma"
                                placeholderTextColor={textColor + '60'}
                                style={[styles.backInput, { color: textColor }, isEditing && editStyle]}
                            />
                         ) : (
                             <Text style={[styles.backValue, { color: textColor }]} numberOfLines={1}>{localCast || '-'}</Text>
                        )}
                    </View>
                </View>

                {/* 4. Rating & Review & Time */}
                <View style={{ flex: 1 }}>
                     <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: textColor, paddingBottom: 8, marginBottom: 8 }}>
                         <Text style={{ fontFamily: typography.serif, fontSize: 14, color: textColor, marginRight: 12 }}>Rating</Text>
                         <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                            {renderStars()}
                         </View>
                         <Text style={{ fontFamily: typography.serif, fontSize: 14, color: textColor }}>( {roundedRating.toFixed(1)} / 5 )</Text>
                     </View>

                     <View style={{ flex: 1, flexDirection: 'row' }}>
                         {/* Review */}
                         <View style={{ flex: 3, borderRightWidth: 1, borderColor: textColor, paddingRight: 8 }}>
                             <Text style={{ fontFamily: typography.serif, fontSize: 12, color: textColor, marginBottom: 4 }}>Review</Text>
                             {isEditing ? (
                                <TextInput 
                                    multiline
                                    value={localReview}
                                    onChangeText={setLocalReview}
                                    placeholder="전시회 한줄 평을 입력하세요."
                                    placeholderTextColor={textColor + '60'}
                                    style={{ fontFamily: typography.serif, fontSize: 13, color: textColor, lineHeight: 18, flex: 1, textAlignVertical: 'top', borderBottomWidth: 1, borderColor: textColor, paddingBottom: 4 }}
                                />
                             ) : (
                                <Text style={{ 
                                    fontFamily: typography.serif, 
                                    fontSize: 13, 
                                    color: (!localReview || localReview.trim() === '' || localReview === '나의 전시 기록') 
                                       ? (textColor === '#FFFFFF' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)') 
                                       : textColor, 
                                    lineHeight: 18 
                                }} numberOfLines={6}>
                                    {(!localReview || localReview.trim() === '' || localReview === '나의 전시 기록') ? "전시회 한 줄 평을 입력하세요." : localReview}
                                </Text>
                             )}
                         </View>
                         
                         {/* Time Section */}
                         <View style={{ flex: 2, paddingLeft: 12 }}>
                             <View style={{ marginBottom: 12 }}>
                                 <Text style={{ fontFamily: typography.serif, fontSize: 12, color: textColor }}>Time</Text>
                                 {isEditing ? (
                                    <TouchableOpacity onPress={() => setShowTimePicker(true)}>
                                        <Text style={{ fontFamily: typography.serif, fontSize: 16, color: textColor, marginTop: 4, ...editStyle, fontWeight: 'bold' }}>
                                            {localTime || 'Add Time'}
                                        </Text>
                                    </TouchableOpacity>
                                 ) : (
                                     <Text style={{ fontFamily: typography.serif, fontSize: 16, color: textColor, marginTop: 4 }}>
                                        {localTime || '-'}
                                     </Text>
                                 )}
                             </View>
                         </View>
                     </View>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 }}>
                     <Text style={{ fontFamily: typography.serif, fontSize: 10, color: textColor, opacity: 0.8, fontStyle: 'italic', flex: 1 }}>Listen to the work</Text>
                     <Text style={[styles.ftBottomLogo, { color: textColor, fontSize: 14, marginBottom: 0 }]}>iMery</Text>
                     <Text style={{ fontFamily: typography.serif, fontSize: 10, color: textColor, opacity: 0.8, fontStyle: 'italic', flex: 1, textAlign: 'right' }} numberOfLines={1}>Images & Memories</Text>
                </View>
            </View>
            <TicketEdge width={ticketWidth} height={6} position="bottom" color={overlayColor} />
            
            {!isEditing && (
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={flipCard} />
            )}
        </Animated.View>
    );

    return (
        <View style={{ width, height: ticketHeight, alignItems: 'center', justifyContent: 'center' }}>
            {renderBack()}
            {renderFront()}

            {/* Time Picker Overlay Modal */}
            <Modal
                transparent={true}
                visible={showTimePicker}
                animationType="slide"
                onRequestClose={() => setShowTimePicker(false)}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}>
                    <TouchableOpacity 
                        style={{ flex: 1 }} 
                        activeOpacity={1} 
                        onPress={() => setShowTimePicker(false)} 
                    />
                    <View style={{ backgroundColor: 'white', paddingBottom: Platform.OS === 'ios' ? 40 : 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                        {/* Toolbar */}
                        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: 16, borderBottomWidth: 1, borderColor: '#eee' }}>
                            <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                                <Text style={{ color: '#007AFF', fontSize: 16, fontWeight: '600', fontFamily: typography.sansBold }}>Done</Text>
                            </TouchableOpacity>
                        </View>
                        {/* Picker */}
                        <View style={{ alignItems: 'center' }}>
                            <DateTimePicker 
                                value={timePickerDate}
                                mode="time"
                                display="spinner"
                                onChange={handleTimeChange}
                                textColor="#000000"
                                style={{ height: 200, width: '100%', backgroundColor: 'white' }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};


export default function IMemoySection({ userId }: IMemoySectionProps) {
    const router = useRouter();
    const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Viewer State
    const [viewerVisible, setViewerVisible] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const pan = useRef(new Animated.ValueXY()).current;
    
    useEffect(() => {
        fetchExhibitions();
    }, [userId]);

    const fetchExhibitions = async () => {
        try {
            const data = await api.getUserExhibitions(userId);
            // Sort by date desc
            const sorted = data.sort((a: any, b: any) => 
                new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime()
            );
            setExhibitions(sorted);
        } catch (e) {
            console.error('Failed to fetch exhibitions', e);
        } finally {
            setLoading(false);
        }
    };

    // --- Data Processing for Grid ---
    const processedData = React.useMemo(() => {
        const groups: { [key: string]: Exhibition[] } = {};
        
        exhibitions.forEach(item => {
            const dateStr = item.visit_date ? item.visit_date.replace(/-/g, '.') : 'Unknown';
            const monthKey = dateStr.substring(0, 7); // "2024.01"
            if (!groups[monthKey]) groups[monthKey] = [];
            groups[monthKey].push(item);
        });

        const infoList: any[] = [];
        const sortedMonths = Object.keys(groups).sort((a, b) => b.localeCompare(a)); 

        sortedMonths.forEach(month => {
            infoList.push({ type: 'header', month });
            const items = groups[month];
            for (let i = 0; i < items.length; i += COLUMN_COUNT) {
                const chunk = items.slice(i, i + COLUMN_COUNT);
                infoList.push({ type: 'row', items: chunk });
            }
        });

        return infoList;
    }, [exhibitions]);

    const openViewer = (index: number) => {
        setSelectedIndex(index);
        setViewerVisible(true);
    };

    const handleUpdate = (updatedItem: Exhibition) => {
        setExhibitions(prev => prev.map(ex => ex.id === updatedItem.id ? { ...ex, ...updatedItem } : ex));
    };

    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
            },
            onPanResponderMove: Animated.event(
                [null, { dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 120) { 
                    const currentItem = exhibitions[selectedIndex];
                    setViewerVisible(false);
                    router.push(`/work/exhibition/${currentItem.id}`);
                } else {
                    Animated.spring(pan, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: false
                    }).start();
                }
            }
        })
    ).current;

    useEffect(() => {
        if (viewerVisible) {
            pan.setValue({ x: 0, y: 0 });
        }
    }, [viewerVisible]);


    const renderGridItem = ({ item }: { item: any }) => {
        if (item.type === 'header') {
            return (
                <View style={styles.headerContainer}>
                    <View style={styles.headerLine} />
                    <View style={styles.headerMonthContainer}>
                        <Text style={styles.headerMonthText}>{item.month}</Text>
                    </View>
                    <View style={styles.headerLine} />
                </View>
            );
        }

        return (
            <View style={styles.rowContainer}>
                {item.items.map((exhibition: Exhibition, idx: number) => {
                    const globalIndex = exhibitions.findIndex(e => e.id === exhibition.id);
                    return (
                        <MiniTicket 
                            key={exhibition.id} 
                            item={exhibition} 
                            onPress={() => openViewer(globalIndex)} 
                        />
                    );
                })}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.titleContainer}>
                <Text style={styles.titleText}>MY TICKETS</Text>
                <Text style={styles.subtitleText}>{exhibitions.length}개의 기억이 담겨있습니다</Text>
            </View>

            <FlatList
                data={processedData}
                renderItem={renderGridItem}
                keyExtractor={(item, index) => item.type + index}
                contentContainerStyle={{ paddingHorizontal: HORIZONTAL_PADDING, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            />

            <Modal visible={viewerVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <TouchableOpacity 
                        style={styles.closeArea} 
                        onPress={() => setViewerVisible(false)} 
                        activeOpacity={1}
                    />
                    
                    <FlatList
                        data={exhibitions}
                        horizontal
                        pagingEnabled
                        initialScrollIndex={selectedIndex}
                        getItemLayout={(data, index) => ({ length: width, offset: width * index, index })}
                        showsHorizontalScrollIndicator={false}
                        onMomentumScrollEnd={(ev) => {
                            const newIndex = Math.floor(ev.nativeEvent.contentOffset.x / width);
                            setSelectedIndex(newIndex);
                        }}
                        renderItem={({ item }) => (
                            <Pressable 
                                style={{ width, height: '100%', justifyContent: 'center', alignItems: 'center' }}
                                onPress={() => setViewerVisible(false)}
                            >
                                <View onStartShouldSetResponder={() => true} onTouchEnd={(e) => e.stopPropagation()}>
                                     <FlipTicket item={item} onClose={() => setViewerVisible(false)} onUpdate={handleUpdate} />
                                </View>
                                
                                <TouchableOpacity 
                                    onPress={() => setViewerVisible(false)} 
                                    style={{ position: 'absolute', bottom: 50 }}
                                >
                                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ color: '#FFF', fontSize: 24 }}>×</Text>
                                    </View>
                                </TouchableOpacity>
                            </Pressable>
                        )}
                    />
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    titleContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    titleText: {
        fontSize: 24,
        fontFamily: typography.serif,
        fontWeight: 'bold',
        color: '#1a1a1a',
    },
    subtitleText: {
        fontSize: 14,
        color: colors.gray500,
        marginTop: 4,
    },

    // Grid System
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    headerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    headerMonthContainer: {
        paddingHorizontal: 12,
    },
    headerMonthText: {
        fontFamily: typography.sansBold,
        fontSize: 16,
        color: '#374151',
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: GRID_SPACING,
        marginBottom: 8,
    },
    
    // Mini Ticket
    miniDateText: {
        fontSize: 12,
        fontFamily: typography.sansBold,
        color: '#1a1a1a',
        marginBottom: 6,
    },
    // Mini Ticket Styles (UPDATED)
    miniTicketContainer: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH * 1.8, // Taller to fit content
        borderRadius: 4,
        overflow: 'hidden',
        ...shadowStyles.sm,
    },
    mtNickname: {
        fontSize: 8,
        fontFamily: typography.sans,
        opacity: 0.8,
        marginBottom: 2,
    },
    mtArtist: {
        fontSize: 10,
        fontFamily: typography.serif,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    mtImageContainer: {
        width: '100%',
        flex: 1, // Take available space
        backgroundColor: '#eee',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 8,
    },
    mtInfoBox: {
        width: '100%',
        borderWidth: 0.5,
        marginBottom: 6,
    },
    mtInfoRow: {
        flexDirection: 'row',
        height: 20,
    },
    mtRatingBox: {
        width: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mtTitleBox: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    mtInfoText: {
        fontSize: 8,
        fontFamily: typography.sansBold,
    },
    mtReviewBox: {
        height: 20,
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    mtReviewText: {
        fontSize: 8,
        fontFamily: typography.serif,
        fontStyle: 'italic',
        opacity: 0.9,
    },
    mtDate: {
        fontSize: 8,
        fontFamily: typography.serif,
        marginBottom: 2,
    },
    mtLogo: {
        fontSize: 12,
        fontFamily: typography.sansBold,
        opacity: 0.5,
        marginBottom: 2,
    },

    miniPlaceholder: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.05)',
    },

    // Modal Details
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
    },
    closeArea: {
        position: 'absolute',
        top: 0, left: 0, right: 0, height: 100,
        zIndex: 1,
    },
    swipeHint: {
        color: 'rgba(255,255,255,0.6)',
        marginTop: 20,
        fontSize: 14,
        fontFamily: typography.sans,
    },

    // Flip Ticket Styles
    flipCard: {
        borderRadius: 0,
        overflow: 'hidden',
        ...shadowStyles.premium,
        backfaceVisibility: 'hidden',
        position: 'absolute', // For Overlaying Front/Back
        top: 0,
    },
    // Back Face Specifics
    flipCardBack: {
        // transform is handled inline
    },
    backInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    backLabel: {
        fontFamily: typography.serif,
        fontSize: 12,
        width: 60,
        opacity: 0.7,
    },
    backValue: {
        fontFamily: typography.serif, 
        fontSize: 14,
        fontWeight: 'bold',
    },
    backInput: {
        flex: 1,
        fontFamily: typography.serif,
        fontSize: 14,
        fontWeight: 'bold',
        padding: 0,
    },

    // Front Ticket Styles (Updated)
    fullTicketContainer: {
        // Deprecated, using flipCard logic instead
        borderRadius: 0, 
        overflow: 'hidden',
        ...shadowStyles.premium,
    },
    ftTopNickname: {
        fontFamily: typography.sans,
        fontSize: 12,
        marginBottom: 4,
    },
    ftTopArtist: {
        fontFamily: typography.serif,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 16,
    },
    ftImageContainer: {
        width: '100%',
        aspectRatio: 3/4, 
        backgroundColor: 'rgba(0,0,0,0.05)',
        marginBottom: 20,
        borderRadius: 2,
        overflow: 'hidden',
    },
    ftImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    ftInfoBox: {
        width: '100%',
        borderWidth: 1,
        marginBottom: 16,
    },
    ftInfoRow: {
        flexDirection: 'row',
        height: 40,
    },
    ftRatingContainer: {
        width: 80,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ftRatingText: {
        fontSize: 14,
        fontFamily: typography.sansBold,
    },
    ftTitleContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    ftTitleText: {
        fontSize: 14,
        fontFamily: typography.sansBold,
    },
    ftReviewContainer: {
        padding: 10,
        minHeight: 50,
        justifyContent: 'center',
        alignItems: 'center', // Center content
    },
    ftReviewText: {
        fontSize: 12,
        fontFamily: typography.serif,
        lineHeight: 16,
        fontStyle: 'italic',
    },
    ftSubTitleText: {
        fontSize: 10,
        fontFamily: typography.sans,
    },
    // ...
    ftBottomDate: {
        fontSize: 16,
        fontFamily: typography.serif, // Changed to Serif as requested
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 4,
    },
    ftBottomLogo: {
        fontSize: 24,
        fontFamily: typography.serif, // Changed to Serif
        fontWeight: 'bold',
        letterSpacing: -1,
        marginBottom: 4,
    },
});
