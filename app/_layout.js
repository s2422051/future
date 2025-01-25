import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth'; // signOutを追加
import { auth } from '../src/config/firebase';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 初回起動時に強制的にログアウト
    signOut(auth).then(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setIsLoading(false);
        
        if (!user) {
          setTimeout(() => {
            router.replace('/(auth)/login');
          }, 0);
        }
      });

      return () => unsubscribe();
    });
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1976D2" />
      </View>
    );
  }

  return (
    <Stack 
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="(auth)" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="(main)" 
        options={{ headerShown: false }} 
      />
    </Stack>
  );
}