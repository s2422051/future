import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  SafeAreaView, 
  StatusBar,
  Pressable,
  TouchableOpacity
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// 仮のデータ（より詳細な情報を追加）
const DUMMY_TIMETABLE = [
  {
    id: '1',
    time: '07:00',
    destination: '東京',
    type: '普通',
    platform: '1',
    status: 'on-time', // 定時
    cars: 10,
    nextStations: ['品川', '浜松町', '新橋']
  },
  {
    id: '2',
    time: '07:15',
    destination: '横浜',
    type: '急行',
    platform: '2',
    status: 'delayed', // 遅延
    cars: 11,
    nextStations: ['品川', '川崎']
  },
  {
    id: '3',
    time: '07:30',
    destination: '東京',
    type: '特急',
    platform: '1',
    status: 'on-time',
    cars: 12,
    nextStations: ['品川', '東京']
  },
  {
    id: '4',
    time: '07:45',
    destination: '横浜',
    type: '普通',
    platform: '3',
    status: 'suspended', // 運転見合わせ
    cars: 10,
    nextStations: ['品川', '川崎', '鶴見']
  },
  {
    id: '5',
    time: '08:00',
    destination: '東京',
    type: '快速',
    platform: '2',
    status: 'on-time',
    cars: 11,
    nextStations: ['品川', '浜松町', '新橋']
  },
];

// 列車種別に応じた色を返す関数
const getTrainTypeColor = (type) => {
  switch (type) {
    case '特急':
      return '#FF4B4B';
    case '急行':
      return '#FF8C00';
    case '快速':
      return '#4169E1';
    default:
      return '#666666';
  }
};

// 運行状態に応じたステータス表示を返す関数
const getStatusDisplay = (status) => {
  switch (status) {
    case 'delayed':
      return { text: '遅延', color: '#FF4B4B' };
    case 'suspended':
      return { text: '運転見合わせ', color: '#FF0000' };
    case 'on-time':
      return { text: '定時', color: '#008000' };
    default:
      return { text: '不明', color: '#666666' };
  }
};

// 時刻表の各行のコンポーネント
const TimeTableRow = ({ item, onPress }) => {
  const statusInfo = getStatusDisplay(item.status);
  
  return (
    <TouchableOpacity 
      style={styles.row}
      onPress={() => onPress(item)}
    >
      <View style={styles.timeContainer}>
        <Text style={styles.time}>{item.time}</Text>
        <Text style={styles.status} color={statusInfo.color}>
          {statusInfo.text}
        </Text>
      </View>
      
      <View style={styles.mainInfo}>
        <View style={styles.typeContainer}>
          <Text style={[
            styles.type,
            { color: getTrainTypeColor(item.type) }
          ]}>
            {item.type}
          </Text>
        </View>
        <Text style={styles.destination}>{item.destination}</Text>
      </View>

      <View style={styles.platformContainer}>
        <Text style={styles.platformLabel}>番線</Text>
        <Text style={styles.platform}>{item.platform}</Text>
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );
};

export default function TimeTableScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleTrainPress = (train) => {
    // 列車詳細への遷移処理
    Alert.alert(
      `${train.type} ${train.destination}行き`,
      `次の停車駅: ${train.nextStations.join(' → ')}\n車両数: ${train.cars}両`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>時刻表</Text>
          <Text style={styles.subtitle}>
            {selectedDate.toLocaleDateString('ja-JP', {
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </Text>
        </View>

        {/* フィルターオプション */}
        <View style={styles.filterContainer}>
          <Pressable style={styles.filterButton}>
            <Ionicons name="filter" size={20} color="#007AFF" />
            <Text style={styles.filterButtonText}>絞り込み</Text>
          </Pressable>
          
          <Pressable style={styles.filterButton}>
            <Ionicons name="time-outline" size={20} color="#007AFF" />
            <Text style={styles.filterButtonText}>時間帯</Text>
          </Pressable>
        </View>

        {/* ヘッダー行 */}
        <View style={styles.headerRow}>
          <Text style={styles.headerText}>時刻</Text>
          <Text style={styles.headerText}>種別/行先</Text>
          <Text style={styles.headerText}>番線</Text>
        </View>

        <FlatList
          data={DUMMY_TIMETABLE}
          renderItem={({ item }) => (
            <TimeTableRow 
              item={item} 
              onPress={handleTrainPress}
            />
          )}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
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
      backgroundColor: '#f5f5f5',
    },
    header: {
      padding: 16,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#333',
    },
    subtitle: {
      fontSize: 14,
      color: '#666',
      marginTop: 4,
    },
    filterContainer: {
      flexDirection: 'row',
      padding: 12,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f0f0f0',
      padding: 8,
      borderRadius: 16,
      marginRight: 8,
    },
    filterButtonText: {
      color: '#007AFF',
      marginLeft: 4,
      fontSize: 14,
    },
    headerRow: {
      flexDirection: 'row',
      padding: 12,
      backgroundColor: '#f8f8f8',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    headerText: {
      fontWeight: '600',
      fontSize: 13,
      color: '#666',
    },
    listContainer: {
      paddingBottom: 16,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    timeContainer: {
      width: 80,
    },
    time: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
    },
    status: {
      fontSize: 12,
      marginTop: 2,
    },
    mainInfo: {
      flex: 1,
      marginHorizontal: 12,
    },
    typeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    type: {
      fontSize: 14,
      fontWeight: '600',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 4,
      overflow: 'hidden',
      backgroundColor: '#f8f8f8',
    },
    destination: {
      fontSize: 15,
      color: '#333',
    },
    platformContainer: {
      alignItems: 'center',
      marginRight: 12,
    },
    platformLabel: {
      fontSize: 11,
      color: '#666',
      marginBottom: 2,
    },
    platform: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
    },
  });