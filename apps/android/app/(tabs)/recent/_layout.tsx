import { Stack } from 'expo-router';
import RecentHeader from './_components/RecentHeader';

export default function RecentLayout() {
  return (
    <Stack
      screenOptions={{
        header: () => <RecentHeader />,
      }}
    />
  );
}