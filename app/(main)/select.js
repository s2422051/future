import { useState, useEffect, useMemo, useCallback } from 'react';
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
  StatusBar,
  TextInput
} from 'react-native';
import { collection, doc, setDoc, deleteDoc, getDocs, serverTimestamp } from 'firebase/firestore';
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
  const [registeredLines, setRegisteredLines] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setRegisteredLines([]);
        return;
      }

      setIsLoading(true);
      try {
        const linesRef = collection(db, `users/${user.uid}/selectedLines`);
        const snapshot = await getDocs(linesRef);
        
        const lines = snapshot.docs.map(doc => {
          const data = doc.data();
          return TRAIN_LINES.find(line => line.id === data.id);
        }).filter(Boolean);

        setRegisteredLines(lines);
      } catch (error) {
        console.error("Error fetching lines:", error);
        Alert.alert("エラー", "路線情報の取得に失敗しました");
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const filteredLines = useMemo(() => {
    const filtered = TRAIN_LINES.filter(line =>
      line.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      line.company.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return {
      registered: filtered.filter(line => 
        registeredLines.some(r => r.id === line.id)
      ),
      unregistered: filtered.filter(line => 
        !registeredLines.some(r => r.id === line.id)
      )
    };
  }, [searchQuery, registeredLines]);

  const toggleLineRegistration = async (line) => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("エラー", "ログインが必要です");
      return;
    }

    setIsLoading(true);
    try {
      const lineRef = doc(db, `users/${user.uid}/selectedLines/${line.id}`);
      const isRegistered = registeredLines.some(l => l.id === line.id);

      if (isRegistered) {
        await deleteDoc(lineRef);
        setRegisteredLines(prev => prev.filter(l => l.id !== line.id));
      } else {
        await setDoc(lineRef, {
          id: line.id,
          name: line.name,
          selectedAt: serverTimestamp()
        });
        setRegisteredLines(prev => [...prev, line]);
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("エラー", "操作に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const renderLineItem = useCallback(({ item, isRegistered }) => (
    <Pressable
      key={item.id}
      style={[styles.lineItem, isRegistered && styles.registeredItem]}
      onPress={() => toggleLineRegistration(item)}
    >
      <Image source={item.image} style={styles.lineImage} />
      <View style={styles.lineInfo}>
        <Text style={styles.lineName}>{item.name}</Text>
        <Text style={styles.company}>{item.company}</Text>
      </View>
      <View style={[styles.statusBadge, isRegistered && styles.registeredBadge]}>
        <Text style={[styles.statusText, isRegistered && styles.registeredStatusText]}>
          {isRegistered ? '登録済み' : '未登録'}
        </Text>
      </View>
    </Pressable>
  ), []);

  const renderSections = () => (
    <FlatList
      style={styles.listContainer}
      ListHeaderComponent={() => (
        <>
          <Text style={styles.title}>路線登録</Text>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="路線名または会社名で検索"
              value={searchQuery}
              onChangeText={setSearchQuery}
              clearButtonMode="while-editing"
            />
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>登録済みの路線</Text>
            {filteredLines.registered.length === 0 && (
              <Text style={styles.emptyText}>登録された路線はありません</Text>
            )}
            {filteredLines.registered.map(item => 
              renderLineItem({ item, isRegistered: true })
            )}
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>未登録の路線</Text>
          </View>
        </>
      )}
      data={filteredLines.unregistered}
      renderItem={({ item }) => renderLineItem({ item, isRegistered: false })}
      keyExtractor={item => item.id}
    />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        renderSections()
      )}
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
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    color: '#333',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    paddingHorizontal: 16,
    color: '#333',
  },
  lineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  registeredItem: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
    borderWidth: 1,
  },
  lineImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  lineInfo: {
    flex: 1,
  },
  lineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  company: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginLeft: 8,
  },
  registeredBadge: {
    backgroundColor: '#2196F3',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  registeredStatusText: {
    color: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 16,
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});