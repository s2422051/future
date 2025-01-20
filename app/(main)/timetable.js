import { View, Text, StyleSheet, FlatList } from 'react-native';
import { router } from 'expo-router';

// 仮のデータ
const DUMMY_TIMETABLE = [
  {
    id: '1',
    time: '07:00',
    destination: '東京',
    type: '普通',
    platform: '1'
  },
  {
    id: '2',
    time: '07:15',
    destination: '横浜',
    type: '急行',
    platform: '2'
  },
  {
    id: '3',
    time: '07:30',
    destination: '東京',
    type: '特急',
    platform: '1'
  },
  {
    id: '4',
    time: '07:45',
    destination: '横浜',
    type: '普通',
    platform: '3'
  },
  {
    id: '5',
    time: '08:00',
    destination: '東京',
    type: '快速',
    platform: '2'
  },
];

// 時刻表の各行のコンポーネント
const TimeTableRow = ({ item }) => (
  <View style={styles.row}>
    <Text style={styles.time}>{item.time}</Text>
    <Text style={styles.type}>{item.type}</Text>
    <Text style={styles.destination}>{item.destination}</Text>
    <Text style={styles.platform}>#{item.platform}</Text>
  </View>
);

export default function TimeTableScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>時刻表</Text>
      
      {/* ヘッダー行 */}
      <View style={[styles.row, styles.headerRow]}>
        <Text style={styles.headerText}>時刻</Text>
        <Text style={styles.headerText}>種別</Text>
        <Text style={styles.headerText}>行先</Text>
        <Text style={styles.headerText}>番線</Text>
      </View>

      <FlatList
        data={DUMMY_TIMETABLE}
        renderItem={({ item }) => <TimeTableRow item={item} />}
        keyExtractor={item => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  headerRow: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  time: {
    flex: 1,
    fontSize: 16,
    textAlign: 'center',
  },
  type: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
  destination: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
  platform: {
    flex: 1,
    fontSize: 14,
    textAlign: 'center',
  },
});