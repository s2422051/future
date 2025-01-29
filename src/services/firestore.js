import { db } from '../config/firebase';
import { doc, updateDoc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

// 投票データを更新する関数
export const updateVoteCount = async (trainId, newCount) => {
  const voteRef = doc(db, 'votes', trainId);
  try {
    const docSnap = await getDoc(voteRef);
    if (docSnap.exists()) {
      await updateDoc(voteRef, { count: newCount });
    } else {
      await setDoc(voteRef, { count: newCount });
    }
  } catch (error) {
    console.error("Error updating vote count: ", error);
  }
};

// 投票をリアルタイムで監視する関数
export const subscribeToVotes = (trainId, callback) => {
  const voteRef = doc(db, 'votes', trainId);
  return onSnapshot(voteRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data().count);
    }
  });
};