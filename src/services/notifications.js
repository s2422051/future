import * as Notifications from 'expo-notifications';

// 通知の設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false, // エミュレータではサウンドをオフに
    shouldSetBadge: false,
  }),
});

// 通知を送信する関数
export const sendLocalNotification = async (title, body) => {
  try {
    // エミュレータでもテストできるように、Device.isDeviceチェックを完全に削除
    const notification = await Notifications.presentNotificationAsync({  // scheduleNotificationAsyncの代わりに
      content: {
        title: title,
        body: body,
        data: { data: 'goes here' },
      },
    });
    console.log('Notification presented:', notification);
    return notification;
  } catch (error) {
    console.error('Notification error:', error);
  }
};