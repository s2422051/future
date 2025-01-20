import { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable, 
  Image, 
  ActivityIndicator, 
  Alert,
  SafeAreaView,
  StatusBar 
} from 'react-native';
import { router } from 'expo-router';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore'; // collectionを追加
import { auth, db } from '../../src/config/firebase';

const TRAIN_LINES = [
{ id: '1', name: '山手線', company: 'JR東日本', image: require('../../assets/yamanote.png') },
{ id: '2', name: '京浜東北線', company: 'JR東日本', image: require('../../assets/keihintouhoku.png') },
{ id: '3', name: '中央線快速', company: 'JR東日本', image: require('../../assets/tyuou.png') },
{ id: '4', name: '東海道線', company: 'JR東日本', image: require('../../assets/toukaidou.png') },
{ id: '5', name: '武蔵野線', company: 'JR東日本', image: require('../../assets/musashino.png') },
{ id: '6', name: '中央・総武線', company: 'JR東日本', image: require('../../assets/soubu.png') },
{ id: '7', name: '湘南新宿ライン', company: 'JR東日本', image: require('../../assets/syounansinjuku.png') },
{ id: '8', name: 'りんかい線', company: '東京臨海高速鉄道', image: require('../../assets/rinkai.jpeg') },
];

export default function SelectScreen() {
  const [selectedTrains, setSelectedTrains] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSelection = useCallback((train) => {
    setSelectedTrains(prevSelected => {
      if (prevSelected.some(t => t.id === train.id)) {
        return prevSelected.filter(t => t.id !== train.id);
      }
      return [...prevSelected, train];
    });
  }, []);

  const addToFavorites = async () => {
    if (selectedTrains.length === 0) {
      Alert.alert('選択エラー', '路線を選択してください。');
      return;
    }

    setIsLoading(true);

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error('認証エラー: ユーザーがログインしていません');
      }

      const favoritesRef = collection(db, 'favorites'); // コレクション参照を作成
      const timestamp = serverTimestamp();

      // 一件ずつ処理する方式に変更
      for (const train of selectedTrains) {
        try {
          await setDoc(doc(favoritesRef, `${userId}_${train.id}`), {
            userId,
            trainId: train.id,
            trainName: train.name,
            company: train.company,
            createdAt: timestamp,
            updatedAt: timestamp,
          });
          console.log(`Added favorite: ${train.name}`); // デバッグログ
        } catch (err) {
          console.error(`Error adding ${train.name}:`, err);
          throw err;
        }
      }

      Alert.alert(
        '登録完了',
        `${selectedTrains.length}件の路線をお気に入りに追加しました`,
        [{ 
          text: 'OK', 
          onPress: () => router.replace('/(main)/home'),
          style: 'default'
        }]
      );

    } catch (error) {
      console.error('Firestore error:', error);
      Alert.alert(
        'エラー',
        'お気に入りの登録に失敗しました。\nインターネット接続を確認して、もう一度お試しください。',
        [{ text: '閉じる', style: 'cancel' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderTrainItem = useCallback(({ item }) => {
    const isSelected = selectedTrains.some(t => t.id === item.id);
    
    return (
      <Pressable
        style={[
          styles.trainItem,
          isSelected && styles.selectedItem
        ]}
        onPress={() => toggleSelection(item)}
      >
        <Image 
          source={item.image} 
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.trainInfo}>
          <Text style={styles.trainName}>{item.name}</Text>
          <Text style={styles.company}>{item.company}</Text>
        </View>
        <View style={[
          styles.selectButton,
          isSelected && styles.selectedButton
        ]}>
          <Text style={[
            styles.selectButtonText,
            isSelected && styles.selectedButtonText
          ]}>
            {isSelected ? '✓' : ''}
          </Text>
        </View>
      </Pressable>
    );
  }, [selectedTrains, toggleSelection]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>お気に入りに登録中...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <Text style={styles.title}>普段使う路線を選択</Text>
        <FlatList
          data={TRAIN_LINES}
          renderItem={renderTrainItem}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
        {selectedTrains.length > 0 && (
          <Pressable 
            style={styles.saveButton} 
            onPress={addToFavorites}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              選択した{selectedTrains.length}件を追加
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    paddingBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    marginTop: 8,
  },
  trainItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedItem: {
    backgroundColor: '#e3f2fd',
    borderColor: '#007AFF',
    borderWidth: 1,
  },
  image: {
    width: 60,
    height: 60,
    marginRight: 16,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
  },
  trainInfo: {
    flex: 1,
  },
  trainName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  company: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  selectButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  selectedButton: {
    backgroundColor: '#007AFF',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedButtonText: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});