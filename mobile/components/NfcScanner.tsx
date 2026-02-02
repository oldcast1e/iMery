import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform, Alert } from 'react-native';

// import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import { X, Wifi } from 'lucide-react-native';

// Safe Import for Expo Go / Web
let NfcManager: any = {
    isSupported: async () => false,
    start: async () => {},
    requestTechnology: async () => {},
    getTag: async () => null,
    cancelTechnologyRequest: async () => {},
};
let NfcTech: any = { Ndef: 'Ndef' };
let Ndef: any = {
    text: {
        decodePayload: () => ''
    }
};

try {
    const nfcModule = require('react-native-nfc-manager');
    NfcManager = nfcModule.default;
    NfcTech = nfcModule.NfcTech || { Ndef: 'Ndef' };
    Ndef = nfcModule.Ndef || { text: { decodePayload: () => '' } };
} catch (e) {
    console.warn("react-native-nfc-manager not found. NFC features will be disabled.");
}

interface NfcScannerProps {
    visible: boolean;
    onRead: (data: any) => void;
    onClose: () => void;
}

export const NfcScanner: React.FC<NfcScannerProps> = ({ visible, onRead, onClose }) => {
    const [status, setStatus] = useState('Ready to Scan');

    useEffect(() => {
        if (visible) {
            startScan();
        } else {
            cancelScan();
        }

        return () => {
            cancelScan();
        };
    }, [visible]);

    const startScan = async () => {
        try {
            // Ensure NFC is supported
            const supported = await NfcManager.isSupported();
            if (!supported) {
                Alert.alert('NFC Not Supported', 'This device does not support NFC.');
                onClose();
                return;
            }

            await NfcManager.start();
            setStatus('Ready to Scan... Tap your tag');
            
            // Request NDEF technology
            // iOS: Shows system bottom sheet automatically
            // Android: We need our own UI (which is this Modal)
            await NfcManager.requestTechnology(NfcTech.Ndef, {
                 alertMessage: 'Ready to Scan... Tap your artwork tag' 
            });

            const tag = await NfcManager.getTag();
            if (tag) {
                setStatus('Tag Found! Reading...');
                // Process NDEF
                // Assuming the first record is Text containing JSON
                // or just standard Text Record
                
                // Helper to decode text record
                const decodeNdef = (tag: any) => {
                    if (tag.ndefMessage && tag.ndefMessage.length > 0) {
                        const ndefRecord = tag.ndefMessage[0];
                        // Decode TNF=1 (Well Known), Type=T (Text)
                        // Ndef.text.decodePayload returns string
                        // We try to parse it as JSON
                        try {
                            // First, try standard Ndef decode
                             const text = Ndef.text.decodePayload(ndefRecord.payload);
                             return JSON.parse(text);
                        } catch (e) {
                             console.log('JSON Parse Error', e);
                             return null;
                        }
                    }
                    return null;
                };

                const data = decodeNdef(tag);

                if (data) {
                    onRead(data); // Success
                } else {
                    Alert.alert('오류', '태그에서 작품 정보를 읽을 수 없습니다.');
                }
            }
        } catch (ex) {
            console.warn('NFC Scan Error/Cancel', ex);
            // On iOS, user cancel throws error
        } finally {
            NfcManager.cancelTechnologyRequest();
            onClose();
        }
    };

    const cancelScan = async () => {
        NfcManager.cancelTechnologyRequest();
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.modalContent}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                        <X size={24} color="#000" />
                    </TouchableOpacity>
                    
                    <View style={styles.iconContainer}>
                        <Wifi size={48} color="#2563EB" /> 
                    </View>

                    <Text style={styles.title}>NFC 태그 스캔</Text>
                    <Text style={styles.description}>
                        작품에 부착된 NFC 태그에{'\n'}휴대폰 뒷면을 가까이 대주세요.
                    </Text>
                     
                    {Platform.OS === 'android' && (
                        <TouchableOpacity style={styles.scanButton} onPress={onClose}>
                             <Text style={styles.scanButtonText}>취소</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    closeButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        padding: 4,
    },
    iconContainer: {
        marginBottom: 16,
        padding: 16,
        backgroundColor: '#EFF6FF', // blue-50
        borderRadius: 50,
    },
    title: {
        fontSize: 20,
        fontFamily: 'Outfit-Bold',
        marginBottom: 8,
        color: '#1a1a1a',
    },
    description: {
        fontSize: 16,
        fontFamily: 'Outfit-Regular',
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 24,
    },
    scanButton: {
        paddingVertical: 12,
        paddingHorizontal: 32,
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    scanButtonText: {
        fontSize: 16,
        fontFamily: 'Outfit-Medium',
        color: '#374151',
    },
});
