import React, { useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity,
  Image 
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../src/config/firebase';
import { useRouter } from 'expo-router';
// useFocusEffect と useCallback を追加
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const TRAIN_LINES = {
  '1': { name: '山手線', image: require('../../assets/yamanote.png') },
  '2': { name: '京浜東北線', image: require('../../assets/keihintouhoku.png') },
  '3': { name: '中央線快速', image: require('../../assets/tyuou.png') },
  '4': { name: '東海道線', image: require('../../assets/toukaidou.png') },
  '5': { name: '武蔵野線', image: require('../../assets/musashino.png') },
  '6': { name: '中央・総武線', image: require('../../assets/soubu.png') },
  '7': { name: '湘南新宿ライン', image: require('../../assets/syounansinjuku.png') },
  '8': { name: 'りんかい線', image: require('../../assets/rinkai.jpeg') },
};

const TrainInfo = () => {
  const [registeredLines, setRegisteredLines] = useState([]);
  const router = useRouter();

  // useEffect を useFocusEffect に置き換え
  useFocusEffect(
    useCallback(() => {
      const fetchRegisteredLines = async () => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        try {
          const userLinesRef = collection(db, `users/${userId}/selectedLines`);
          const snapshot = await getDocs(userLinesRef);
          const lines = snapshot.docs.map(doc => {
            const lineData = TRAIN_LINES[doc.id];
            return {
              id: doc.id,
              name: lineData?.name || doc.data().name,
              image: lineData?.image,
              ...doc.data()
            };
          });
          setRegisteredLines(lines);
        } catch (error) {
          console.error("Error fetching lines:", error);
        }
      };

      fetchRegisteredLines();
    }, []) // 依存配列は空のまま
  );

  // 以下のコードは同じ
  const renderLineItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.lineItem}
      onPress={() => router.push(`/line_detail?id=${item.id}`)}
    >
      <Image 
        source={item.image} 
        style={styles.lineImage}
      />
      <View style={styles.lineInfo}>
        <Text style={styles.lineName}>{item.name}</Text>
        <Text style={styles.lineStatus}>平常運転</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={registeredLines}
        renderItem={renderLineItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <Text style={styles.headerTitle}>登録路線一覧</Text>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              路線が登録されていません
            </Text>
            <TouchableOpacity 
              style={styles.registerButton}
              onPress={() => router.push('/select')}
            >
              <Text style={styles.registerButtonText}>
                路線を登録する
              </Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 16,
    color: '#333',
  },
  lineItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  lineImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  lineInfo: {
    marginLeft: 16,
    flex: 1,
  },
  lineName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  lineStatus: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  registerButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TrainInfo;