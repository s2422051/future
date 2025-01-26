import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TrainInfoDetail = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDirection, setSelectedDirection] = useState('direction2');
  const [voteCounts, setVoteCounts] = useState({
    '平常': 0,
    '一時停車\n~10分': 0,
    '~30分': 0,
    '30分\n以上': 0,
    '運転\n見合せ': 0,
  });
  const [userVote, setUserVote] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedVote, setSelectedVote] = useState(null);

  const voteLabels = ['平常', '一時停車\n~10分', '~30分', '30分\n以上', '運転\n見合せ'];

  const [trainStatus] = useState({
    status: '平常運転',
    direction1: '新木場方面',
    direction2: '大崎方面',
    lastUpdated: new Date().toLocaleString(),
  });

  useEffect(() => {
    loadVoteData();
  }, []);

  const loadVoteData = async () => {
    try {
      const savedVote = await AsyncStorage.getItem('userVote');
      const savedCounts = await AsyncStorage.getItem('voteCounts');
      if (savedVote) setUserVote(JSON.parse(savedVote));
      if (savedCounts) setVoteCounts(JSON.parse(savedCounts));
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
    }
  };

  const saveVoteData = async (newVote, newCounts) => {
    try {
      await AsyncStorage.setItem('userVote', JSON.stringify(newVote));
      await AsyncStorage.setItem('voteCounts', JSON.stringify(newCounts));
    } catch (error) {
      console.error('データの保存に失敗しました:', error);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadVoteData();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleBack = () => {
    router.push('/train_info');
  };

  const handleDirectionChange = (direction) => {
    setSelectedDirection(direction);
  };

  const handleVotePress = (label) => {
    setSelectedVote(label);
    setShowConfirmModal(true);
  };

  const handleVoteConfirm = async () => {
    if (userVote === selectedVote) {
      Alert.alert('エラー', 'すでに同じ選択肢に投票済みです。');
      return;
    }

    const newCounts = { ...voteCounts };
    if (userVote) {
      newCounts[userVote]--;
    }
    newCounts[selectedVote]++;
    
    setVoteCounts(newCounts);
    setUserVote(selectedVote);
    await saveVoteData(selectedVote, newCounts);
    setShowConfirmModal(false);
    Alert.alert('完了', '投票が完了しました！');
  };

  const handleVoteCancel = async () => {
    if (!userVote) {
      Alert.alert('エラー', '取り消す投票がありません。');
      return;
    }

    Alert.alert(
      '投票の取り消し',
      '投票を取り消しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '取り消す',
          style: 'destructive',
          onPress: async () => {
            const newCounts = { ...voteCounts };
            newCounts[userVote]--;
            setVoteCounts(newCounts);
            setUserVote(null);
            await saveVoteData(null, newCounts);
            Alert.alert('完了', '投票を取り消しました。');
          }
        }
      ]
    );
  };

  const renderVoteButton = (label, index) => {
    const isVoted = userVote === label;
    return (
      <TouchableOpacity 
        key={index} 
        style={styles.voteButton}
        onPress={() => handleVotePress(label)}
      >
        <View style={[
          styles.voteCircle,
          isVoted && styles.voteCircleVoted
        ]}>
          <Text style={[
            styles.voteLabel,
            isVoted && styles.voteLabelVoted
          ]}>
            {label}
          </Text>
        </View>
        <Text style={styles.voteCount}>{voteCounts[label]}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>運行情報</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.lineTitleContainer}>
          <Text style={styles.lineSubtitle}>りんかいせん</Text>
          <Text style={styles.lineTitle}>りんかい線</Text>
        </View>

        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>遅延・運休</Text>
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>{trainStatus.status}</Text>
            <Text style={styles.statusDetail}>
              現在、事故・遅延に関する情報はありません。
            </Text>
          </View>
        </View>

        <View style={styles.directionSection}>
          <View style={styles.directionButtons}>
            <TouchableOpacity 
              style={[
                styles.directionButton,
                selectedDirection === 'direction1' && styles.directionButtonActive
              ]}
              onPress={() => handleDirectionChange('direction1')}
            >
              <Text style={[
                styles.directionText,
                selectedDirection === 'direction1' && styles.directionTextActive
              ]}>
                {trainStatus.direction1}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.directionButton,
                selectedDirection === 'direction2' && styles.directionButtonActive
              ]}
              onPress={() => handleDirectionChange('direction2')}
            >
              <Text style={[
                styles.directionText,
                selectedDirection === 'direction2' && styles.directionTextActive
              ]}>
                {trainStatus.direction2}
              </Text>
            </TouchableOpacity>
            </View>
        </View>

        <View style={styles.votingSection}>
          <Text style={styles.votingTitle}>今の運行状況は？ボタンを押して投票！</Text>
          <View style={styles.voteButtons}>
            {voteLabels.map((label, index) => renderVoteButton(label, index))}
          </View>
          {userVote && (
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleVoteCancel}
            >
              <Text style={styles.cancelButtonText}>投票を取り消す</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.updateTime}>
          画面を引き下げて最新に更新({trainStatus.lastUpdated}更新)
        </Text>
      </ScrollView>

      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>投票の確認</Text>
            <Text style={styles.modalText}>「{selectedVote}」に投票しますか？</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalButtonText}>キャンセル</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleVoteConfirm}
              >
                <Text style={styles.modalButtonText}>投票する</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1976D2',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  backButton: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  lineTitleContainer: {
    padding: 16,
  },
  lineSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  lineTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statusSection: {
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  statusDetail: {
    color: '#666',
  },
  directionSection: {
    padding: 16,
  },
  directionButtons: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  directionButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
  },
  directionButtonActive: {
    backgroundColor: '#1976D2',
  },
  directionText: {
    color: '#1976D2',
  },
  directionTextActive: {
    color: '#fff',
  },
  votingSection: {
    padding: 16,
  },
  votingTitle: {
    fontSize: 16,
    marginBottom: 16,
  },
  voteButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  voteButton: {
    alignItems: 'center',
    marginHorizontal: 8,
    marginBottom: 16,
  },
  voteCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  voteCircleVoted: {
    backgroundColor: '#1976D2',
  },
  voteLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  voteLabelVoted: {
    color: '#fff',
  },
  voteCount: {
    fontSize: 12,
    color: '#666',
  },
  updateTime: {
    textAlign: 'center',
    color: '#666',
    padding: 16,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#999',
  },
  modalButtonConfirm: {
    backgroundColor: '#1976D2',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#ff6b6b',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  }
});

export default TrainInfoDetail;