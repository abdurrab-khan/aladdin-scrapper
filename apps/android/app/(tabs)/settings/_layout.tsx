import Setting from '@/components/header/Setting'
import { Colors } from '@/constants/Colors'
import { Stack } from 'expo-router'
import React from 'react'

export default function SettingLayout() {
    return (
        <Stack
            screenOptions={{
                animation: "fade",
                gestureEnabled: true,
                gestureDirection: "horizontal",
                headerTitle: () => <Setting />,
                headerStyle: {
                    backgroundColor: Colors.dark.header,
                },
                contentStyle: {
                    backgroundColor: Colors.dark.background,
                },
            }}
        />
    )
}