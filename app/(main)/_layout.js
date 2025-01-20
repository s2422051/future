import { Tabs, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../../src/config/firebase';
import { useRouter, useSegments } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AppLayout() {
  const [user, setUser] = useState(null);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        if (segments[0] === '(auth)') {
          router.replace('/(main)/home');
        }
      } else {
        router.replace('/(auth)/login');
      }
    });

    return () => unsubscribe();
  }, []);

  // ユーザーが認証されていない場合は認証画面のみ表示
  if (!user) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      </Stack>
    );
  }

  // ユーザーが認証されている場合はタブナビゲーションを表示
  return (
    <Tabs
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
        },
        headerShown: false,
        headerStyle: {
          backgroundColor: '#1976D2',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
        
      <Tabs.Screen
        name="map"
        options={{
          title: 'マップ',
          tabBarLabel: 'マップ',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: '運行情報',
          tabBarLabel: '運行情報',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="train" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="timetable"
        options={{
          title: '時刻表',
          tabBarLabel: '時刻表',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clock-outline" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}