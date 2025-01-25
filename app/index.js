import { Redirect } from 'expo-router';

export default function Page() {
  // より明示的なパスを指定
  return <Redirect href="/(auth)/login" replace />;
}