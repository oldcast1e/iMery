import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import MapView, { Polygon, PROVIDER_DEFAULT } from 'react-native-maps';
import { colors } from '../../constants/designSystem';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAP_WIDTH = SCREEN_WIDTH - 40;
const MAP_HEIGHT = MAP_WIDTH * 1.3;

interface KoreaMapProps {
    locations: any;
    onRegionPress?: (region: string) => void;
}

// Simplified GeoJSON coordinates for South Korean provinces
// Coordinates: [latitude, longitude]
const PROVINCE_COORDINATES: { [key: string]: { name: string; coords: [number, number][] } } = {
    'Seoul': {
        name: '서울특별시',
        coords: [
            [37.70, 126.73], [37.70, 127.18], [37.42, 127.18], [37.42, 126.73]
        ]
    },
    'Busan': {
        name: '부산광역시',
        coords: [
            [35.33, 128.93], [35.33, 129.27], [35.00, 129.27], [35.00, 128.93]
        ]
    },
    'Incheon': {
        name: '인천광역시',
        coords: [
            [37.65, 126.35], [37.65, 126.88], [37.30, 126.88], [37.30, 126.35]
        ]
    },
    'Daegu': {
        name: '대구광역시',
        coords: [
            [36.00, 128.45], [36.00, 128.75], [35.70, 128.75], [35.70, 128.45]
        ]
    },
    'Gwangju': {
        name: '광주광역시',
        coords: [
            [35.25, 126.75], [35.25, 127.00], [35.05, 127.00], [35.05, 126.75]
        ]
    },
    'Daejeon': {
        name: '대전광역시',
        coords: [
            [36.45, 127.28], [36.45, 127.52], [36.25, 127.52], [36.25, 127.28]
        ]
    },
    'Ulsan': {
        name: '울산광역시',
        coords: [
            [35.65, 129.15], [35.65, 129.45], [35.35, 129.45], [35.35, 129.15]
        ]
    },
    'Sejong': {
        name: '세종특별자치시',
        coords: [
            [36.60, 127.20], [36.60, 127.35], [36.40, 127.35], [36.40, 127.20]
        ]
    },
    'Gyeonggi-do': {
        name: '경기도',
        coords: [
            [38.00, 126.50], [38.30, 127.50], [37.80, 127.80], 
            [37.00, 127.50], [37.00, 126.50]
        ]
    },
    'Gangwon-do': {
        name: '강원도',
        coords: [
            [38.60, 127.40], [38.60, 129.00], [37.20, 129.50], [37.20, 127.40]
        ]
    },
    'Chungcheongbuk-do': {
        name: '충청북도',
        coords: [
            [37.20, 127.40], [37.20, 128.80], [36.20, 128.50], [36.20, 127.40]
        ]
    },
    'Chungcheongnam-do': {
        name: '충청남도',
        coords: [
            [37.00, 125.90], [37.00, 127.40], [36.00, 127.20], [36.00, 125.90]
        ]
    },
    'Jeollabuk-do': {
        name: '전라북도',
        coords: [
            [36.20, 126.40], [36.20, 127.70], [35.30, 127.50], [35.30, 126.40]
        ]
    },
    'Jeollanam-do': {
        name: '전라남도',
        coords: [
            [35.30, 125.90], [35.30, 127.50], [34.20, 126.50], [34.20, 125.90]
        ]
    },
    'Gyeongsangbuk-do': {
        name: '경상북도',
        coords: [
            [37.20, 128.00], [37.20, 129.50], [35.70, 129.50], [35.70, 128.00]
        ]
    },
    'Gyeongsangnam-do': {
        name: '경상남도',
        coords: [
            [35.70, 127.70], [35.70, 129.30], [34.60, 128.50], [34.60, 127.70]
        ]
    },
    'Jeju': {
        name: '제주특별자치도',
        coords: [
            [33.60, 126.15], [33.60, 126.95], [33.10, 126.95], [33.10, 126.15]
        ]
    },
};

// Color palette for each province (similar to reference image)
const PROVINCE_COLORS: { [key: string]: string } = {
    'Seoul': '#FFB74D',           // Orange
    'Busan': '#90A4AE',           // Gray
    'Incheon': '#FF8A65',         // Light Orange
    'Daegu': '#A1887F',           // Brown
    'Gwangju': '#BA68C8',         // Purple
    'Daejeon': '#81C784',         // Light Green
    'Ulsan': '#4DD0E1',           // Cyan
    'Sejong': '#DCE775',          // Lime
    'Gyeonggi-do': '#FFD54F',     // Yellow
    'Gangwon-do': '#FFA726',      // Deep Orange
    'Chungcheongbuk-do': '#9CCC65', // Green
    'Chungcheongnam-do': '#AED581', // Light Green
    'Jeollabuk-do': '#4DB6AC',    // Teal
    'Jeollanam-do': '#F48FB1',    // Pink
    'Gyeongsangbuk-do': '#7986CB', // Blue
    'Gyeongsangnam-do': '#66BB6A', // Green
    'Jeju': '#00695C',            // Dark Teal
};

const KoreaMap: React.FC<KoreaMapProps> = ({ locations, onRegionPress }) => {
    
    // Create a set of active provinces from the passed locations
    const activeProvinces = useMemo(() => {
        const visited = new Set<string>();
        if (!locations) return visited;

        Object.keys(locations).forEach(province => {
            if (locations[province] && Object.keys(locations[province]).length > 0) {
                visited.add(province);
            }
        });

        return visited;
    }, [locations]);

    const handleProvincePress = (provinceKey: string) => {
        const provinceName = PROVINCE_COORDINATES[provinceKey]?.name || provinceKey;
        
        if (onRegionPress) {
            onRegionPress(provinceKey);
        } else {
            Alert.alert('지역 선택', `${provinceName}을(를) 선택했습니다.`);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    provider={PROVIDER_DEFAULT}
                    initialRegion={{
                        latitude: 36.5,
                        longitude: 127.5,
                        latitudeDelta: 6,
                        longitudeDelta: 6,
                    }}
                    scrollEnabled={true}
                    zoomEnabled={true}
                    rotateEnabled={false}
                    pitchEnabled={false}
                    showsUserLocation={false}
                    showsMyLocationButton={false}
                    showsCompass={false}
                    toolbarEnabled={false}
                >
                    {Object.entries(PROVINCE_COORDINATES).map(([key, province]) => {
                        const isActive = activeProvinces.has(key);
                        const baseColor = PROVINCE_COLORS[key] || '#90A4AE';
                        
                        return (
                            <Polygon
                                key={key}
                                coordinates={province.coords.map(([lat, lng]) => ({
                                    latitude: lat,
                                    longitude: lng
                                }))}
                                fillColor={isActive ? baseColor : `${baseColor}80`}
                                strokeColor="#2C2C2C"
                                strokeWidth={3}
                                tappable={true}
                                onPress={() => handleProvincePress(key)}
                            />
                        );
                    })}
                </MapView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 10,
    },
    mapContainer: {
        width: MAP_WIDTH,
        height: MAP_HEIGHT,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    map: {
        width: '100%',
        height: '100%',
    },
});

export default KoreaMap;
