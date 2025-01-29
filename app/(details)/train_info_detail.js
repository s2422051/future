import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../src/config/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot,
  collection 
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendLocalNotification } from '../../src/services/notifications';

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
  const [userId, setUserId] = useState(null);

  const [trainStatus] = useState({
    status: '平常運転',
    direction1: '新木場方面',
    direction2: '大崎方面',
    lastUpdated: new Date().toLocaleString(),
  });

  // 今日の日付を取得（YYYYMMDD形式）
  const getToday = () => {
    const date = new Date();
    return `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  };

// train_info_detail.js の先頭付近に追加
useEffect(() => {
  // 通知の設定
  const configureNotifications = async () => {
    await requestNotificationPermissions();
  };
  
  configureNotifications();
}, []);

  // ユーザーID初期化用のuseEffect
useEffect(() => {
  const initializeUser = async () => {
    let id = await AsyncStorage.getItem('userId');
    if (!id) {
      id = Math.random().toString(36).substr(2, 9);
      await AsyncStorage.setItem('userId', id);
    }
    setUserId(id);
  };
  initializeUser();
  fetchVotes();
}, []);

// 遅延情報監視用のuseEffect
useEffect(() => {
  const delayVotesRef = doc(db, 'delayVotes', `rinkai_${getToday()}`);
  
  const unsubscribe = onSnapshot(delayVotesRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      const votes = data.votes || {};
      setVoteCounts(votes); // リアルタイムで投票数を更新
      
      // 異常状態のチェック
      if (votes['運転\n見合せ'] > 0) {
        console.log("運転見合せ通知をトリガー"); // デバッグログ
        sendLocalNotification(
          '⚠️ りんかい線運転見合わせ',
          'りんかい線で運転見合わせが発生しています。'
        );
      } else {
        const abnormalVotes = {
          '一時停車\n~10分': votes['一時停車\n~10分'] || 0,
          '~30分': votes['~30分'] || 0,
          '30分\n以上': votes['30分\n以上'] || 0
        };
      
        const hasAbnormalStatus = Object.values(abnormalVotes).some(count => count > 0);
        
        if (hasAbnormalStatus) {
          console.log("遅延通知をトリガー", abnormalVotes); // デバッグログ
          const delayStatus = Object.entries(abnormalVotes)
            .filter(([_, count]) => count > 0)
            .map(([status]) => status.replace('\n', ' '))
            .join(', ');
      
          sendLocalNotification(
            '遅延情報',
            `りんかい線で${delayStatus}の遅延が報告されています。`
          );
        }
      }
    }
  });

  return () => unsubscribe();
}, []);

  // 投票データ取得
  const fetchVotes = async () => {
    try {
      const docRef = doc(db, 'delayVotes', `rinkai_${getToday()}`);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setVoteCounts(docSnap.data().votes);
        // ユーザーの過去の投票を確認
        const userVoteKey = `vote_rinkai_${getToday()}_${userId}`;
        const previousVote = await AsyncStorage.getItem(userVoteKey);
        if (previousVote) {
          setUserVote(previousVote);
        }
      } else {
        await setDoc(docRef, {
          votes: voteCounts,
          lastUpdated: new Date()
        });
      }
    } catch (error) {
      console.error("Error fetching votes: ", error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchVotes().then(() => setRefreshing(false));
  }, []);

  const handleVotePress = (label) => {
    setSelectedVote(label);
    setShowConfirmModal(true);
  };

  const handleVoteConfirm = async () => {
    try {
      if (!userId) return;

      const userVoteKey = `vote_rinkai_${getToday()}_${userId}`;
      const previousVote = await AsyncStorage.getItem(userVoteKey);

      if (previousVote === selectedVote) {
        Alert.alert('エラー', 'すでに同じ選択肢に投票済みです。');
        return;
      }

      const docRef = doc(db, 'delayVotes', `rinkai_${getToday()}`);
      const newVotes = { ...voteCounts };

      if (previousVote) {
        newVotes[previousVote]--;
      }
      newVotes[selectedVote]++;

      await updateDoc(docRef, {
        votes: newVotes,
        lastUpdated: new Date()
      });

      await AsyncStorage.setItem(userVoteKey, selectedVote);
      setUserVote(selectedVote);
      setVoteCounts(newVotes);
      setShowConfirmModal(false);
      Alert.alert('完了', '投票が完了しました！');
    } catch (error) {
      console.error("Error submitting vote: ", error);
      Alert.alert('エラー', '投票に失敗しました。');
    }
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
            try {
              const docRef = doc(db, 'delayVotes', `rinkai_${getToday()}`);
              const newVotes = { ...voteCounts };
              newVotes[userVote]--;

              await updateDoc(docRef, {
                votes: newVotes,
                lastUpdated: new Date()
              });

              const userVoteKey = `vote_rinkai_${getToday()}_${userId}`;
              await AsyncStorage.removeItem(userVoteKey);
              setUserVote(null);
              setVoteCounts(newVotes);
              Alert.alert('完了', '投票を取り消しました。');
            } catch (error) {
              console.error("Error canceling vote: ", error);
              Alert.alert('エラー', '投票の取り消しに失敗しました。');
            }
          }
        }
      ]
    );
  };

  // 前半のコードに続いて...

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/train_info')} style={styles.backButton}>
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
              {voteCounts['平常'] > Math.max(...Object.values(voteCounts).filter((v, i) => i !== 0)) 
                ? '現在、事故・遅延に関する情報はありません。'
                : '※利用者からの投票により遅延の可能性があります。'}
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
              onPress={() => setSelectedDirection('direction1')}
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
              onPress={() => setSelectedDirection('direction2')}
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
          <Text style={styles.votingTitle}>今の運行状況は？</Text>
          <View style={styles.voteButtons}>
            {Object.entries(voteCounts).map(([type, count]) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.voteCircle,
                  userVote === type && styles.voteCircleVoted
                ]}
                onPress={() => handleVotePress(type)}
              >
                <Text style={[
                  styles.voteLabel,
                  userVote === type && styles.voteLabelVoted
                ]}>
                  {type}
                </Text>
                <Text style={[
                  styles.voteCount,
                  userVote === type && styles.voteCountVoted
                ]}>
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
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
          最終更新: {trainStatus.lastUpdated}
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
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#00479d',
    padding: 15,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  lineTitleContainer: {
    backgroundColor: '#00479d',
    padding: 20,
    alignItems: 'center',
  },
  lineTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  lineSubtitle: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
  },
  statusSection: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  statusBox: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#00479d',
    marginBottom: 5,
  },
  statusDetail: {
    color: '#666',
    fontSize: 14,
  },
  directionSection: {
    margin: 15,
  },
  directionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  directionButton: {
    flex: 1,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  directionButtonActive: {
    backgroundColor: '#00479d',
  },
  directionText: {
    color: '#00479d',
    fontWeight: '600',
  },
  directionTextActive: {
    color: '#fff',
},
votingSection: {
    margin: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
},
votingTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
},
voteButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    gap: 15,
},
voteCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00479d',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
},
voteCircleVoted: {
    backgroundColor: '#00479d',
},
voteLabel: {
    textAlign: 'center',
    fontSize: 14,
    color: '#00479d',
    marginBottom: 5,
},
voteLabelVoted: {
    color: '#fff',
},
voteCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00479d',
},
voteCountVoted: {
    color: '#fff',
},
cancelButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#ff4444',
    borderRadius: 8,
    alignItems: 'center',
},
cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
},
updateTime: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 20,
    marginBottom: 30,
},
modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
},
modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
},
modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#00479d',
},
modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
},
modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
},
modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
},
modalButtonCancel: {
    backgroundColor: '#ddd',
},
modalButtonConfirm: {
    backgroundColor: '#00479d',
},
modalButtonText: {
    color: '#fff',
    fontWeight: '600',
},
});

export default TrainInfoDetail;