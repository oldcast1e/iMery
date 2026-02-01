import { Tabs } from 'expo-router';
import CustomTabBar from '../../components/ui/CustomTabBar';
import CustomHeader from '../../components/ui/CustomHeader';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}

      screenOptions={{
        header: () => <CustomHeader />,
        headerShown: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
        }}
      />
      <Tabs.Screen
        name="archive"
        options={{
          title: 'Archive',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'My',
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
