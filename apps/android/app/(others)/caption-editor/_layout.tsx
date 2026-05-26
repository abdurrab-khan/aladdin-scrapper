import HeaderBack from '@/components/buttons/HeaderBack'
import { Colors } from '@/constants/Colors'
import { Stack } from 'expo-router'
import React from 'react'

export default function _layout() {
    return (
        <Stack
            screenOptions={
                {
                    animation: "fade",
                    title: "Edit Caption",
                    headerTitleStyle: {
                        color: Colors.dark.titleText
                    },
                    headerStyle: {
                        backgroundColor: Colors.dark.header
                    },
                    contentStyle: {
                        backgroundColor: Colors.dark.background
                    },
                    headerLeft: () => <HeaderBack iconName='close-outline' />,
                }
            }
        />
    )
}