import { Stack } from 'expo-router'
import SettingHeader from './_components/SettingHeader'

export default function SettingLayout() {
  return (
    <Stack
      screenOptions={{
        header: () => <SettingHeader />,
      }}
    />
  );
}