import { Tabs } from 'expo-router';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

export default function MainLayout() {
  return (
    <Tabs
      initialRouteName="select"
      screenOptions={{
        tabBarActiveTintColor: '#1976D2',
        tabBarInactiveTintColor: '#757575',
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#1976D2',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: 'マップ',
          tabBarLabel: 'マップ',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="map" size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="train_info"
        options={{
          title: '運行情報',
          tabBarLabel: '運行情報',
          tabBarIcon: ({ color }) => (
            <Ionicons name="information-circle-outline" size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="select"
        options={{
          title: '路線登録',
          tabBarLabel: '路線登録',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="train" size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="timetable"
        options={{
          title: '時刻表',
          tabBarLabel: '時刻表',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="clock-outline" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}