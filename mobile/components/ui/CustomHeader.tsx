import React from 'react';
import { View, Text, TouchableOpacity, Image, SafeAreaView, Platform, StyleSheet } from 'react-native';
import { Bell, Globe } from 'lucide-react-native';

export default function CustomHeader() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Logo Section */}
                <View style={styles.logoSection}>
                    <Image 
                        source={require('../../assets/images/iMery_Log_Main_3.png')}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>iMery</Text>
                </View>

                {/* Right Actions */}
                <View style={styles.actionSection}>
                    {/* Language Toggle (Static for now) */}
                    <TouchableOpacity style={styles.langButton}>
                        <Globe size={16} color="#6B7280" />
                        <Text style={[styles.langText, styles.activeLang]}>KO</Text>
                        <Text style={styles.langDivider}>/</Text>
                        <Text style={styles.langText}>EN</Text>
                    </TouchableOpacity>

                    {/* Notification */}
                    <TouchableOpacity style={styles.notifButton}>
                        <Bell size={22} color="#1a1a1a" />
                        <View style={styles.badge} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6', // border-gray-100
        paddingTop: Platform.OS === 'android' ? 40 : 0,
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#fff',
    },
    logoSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logo: {
        width: 24, // w-6
        height: 24,
    },
    title: {
        fontSize: 24, // text-2xl
        fontFamily: 'PlayfairDisplay-Bold', // Serif font
        color: '#1a1a1a',
    },
    actionSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    langButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#F3F4F6', // bg-gray-100
        paddingHorizontal: 12, // px-3
        paddingVertical: 6, // py-1.5
        borderRadius: 9999, // full
    },
    langText: {
        fontSize: 14,
        fontFamily: 'Outfit-Regular',
        color: '#6B7280',
    },
    activeLang: {
        fontFamily: 'Outfit-Bold',
        color: '#1a1a1a',
    },
    langDivider: {
        color: '#9CA3AF',
        fontSize: 14,
    },
    notifButton: {
        position: 'relative',
        padding: 8,
    },
    badge: {
        position: 'absolute',
        top: 4,
        right: 4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444', // red-500
    },
});
