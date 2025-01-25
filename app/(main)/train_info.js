import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity,
  Image 
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../src/config/firebase';
import { useRouter } from 'expo-router';

const TrainInfo = () => {
  const [registeredLines, setRegisteredLines] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchRegisteredLines = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const userLinesRef = collection(db, `users/${userId}/selectedLines`);
      const snapshot = await getDocs(userLinesRef);
      const lines = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRegisteredLines(lines);
    };

    fetchRegisteredLines();
  }, []);

  const renderLineItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.lineItem}
      onPress={() => router.push(`/line_detail?id=${item.lineId}`)}
    >
      <Image 
        source={item.imageUrl} 
        style={styles.lineImage}
      />
      <View style={styles.lineInfo}>
        <Text style={styles.lineName}>{item.lineName}</Text>
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
  lineItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
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