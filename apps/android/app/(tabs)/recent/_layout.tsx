import Recent from '@/components/header/Recent';
import { Colors } from '@/constants/Colors';
import { Stack } from 'expo-router';
import React from 'react';

export default function RecentLayout() {
    return (
        <Stack
            screenOptions={{
                animation: "fade",
                gestureEnabled: true,
                gestureDirection: "horizontal",
                headerTitle: () => <Recent />,
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