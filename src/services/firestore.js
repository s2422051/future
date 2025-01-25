import { doc, setDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const saveUserLine = async (userId, lineData) => {
  try {
    const userLineRef = doc(db, `users/${userId}/selectedLines/${lineData.id}`);
    await setDoc(userLineRef, {
      id: lineData.id,
      name: lineData.name,
      company: lineData.company,
      selectedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error saving line:', error);
    return false;
  }
};

export const getUserLines = async (userId) => {
  try {
    const linesRef = collection(db, `users/${userId}/selectedLines`);
    const snapshot = await getDocs(linesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting lines:', error);
    return [];
  }
};