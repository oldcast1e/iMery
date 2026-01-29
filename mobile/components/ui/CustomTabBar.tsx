import React from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet, Image, Keyboard, Platform } from 'react-native';
import { Home, Grid3x3, Archive, User, Plus, Newspaper } from 'lucide-react-native';
import { useRouter, usePathname } from 'expo-router';
import { colors, shadowStyles } from '../../constants/designSystem';

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const router = useRouter();
  
  // Define the exact tabs as per Web Design
  // Web: [Home, Works, Add, Archive, My]
  const tabs = [
    { id: 'index', label: '홈', icon: Home },
    { id: 'community', label: '피드', icon: Newspaper }, // Changed to Newspaper and '피드'
    { id: 'add', label: '추가', icon: Plus, isAction: true },
    { id: 'archive', label: '아카이브', icon: Archive },
    { id: 'profile', label: '마이', icon: User },
  ];

  // Optional: Hide tab bar when keyboard is open
  const [visible, setVisible] = React.useState(true);
  
  React.useEffect(() => {
    if (Platform.OS === 'android') {
        const show = Keyboard.addListener('keyboardDidShow', () => setVisible(false));
        const hide = Keyboard.addListener('keyboardDidHide', () => setVisible(true));
        return () => { show.remove(); hide.remove(); };
    }
  }, []);

  if (!visible) return null;

  return (
    <View style={styles.overlayContainer}>
      <View style={styles.container}>
        {tabs.map((tab) => {
          if (tab.isAction) {
             return (
               <TouchableOpacity
                 key={tab.id}
                 onPress={() => router.push('/work/upload')}
                 style={styles.actionButtonWrapper}
                 activeOpacity={0.8}
               >
                 <View style={styles.actionButton}>
                   <Plus size={32} color={colors.white} strokeWidth={3} />
                 </View>
               </TouchableOpacity>
             );
          }

          // Find the route in the navigation state that matches the tab id
          const route = state.routes.find(r => r.name === tab.id);
          
          // If a route doesn't exist for a tab item (shouldn't happen if configured correctly), don't render it or render disabled
          if (!route) return null;

          const isFocused = state.index === state.routes.indexOf(route);

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const Icon = tab.icon;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={onPress}
              style={styles.tabItem}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                isFocused && styles.activeIconContainer
              ]}>
                <Icon 
                    size={24} 
                    color={isFocused ? colors.white : colors.gray400} 
                    strokeWidth={isFocused ? 2.5 : 2}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    bottom: 30, // Floating distance
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 100, // Full rounded
    paddingHorizontal: 16,
    height: 72,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  tabItem: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1, // Distribute space
  },
  iconContainer: {
    padding: 12,
    borderRadius: 20,
  },
  activeIconContainer: {
    backgroundColor: '#000',
    transform: [{ scale: 1.1 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonWrapper: {
    top: 0, // In web it's inside nicely. Let's keep it centered in flex.
    // If we want it to float UP, we can set top: -20
    // But web design shows plain row. Let's check web code again.
    // Web: "items-center ... relative ... h-[72px]"
    // Web Action: "w-14 h-14 bg-black rounded-full"
    // So it fits inside comfortably.
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
