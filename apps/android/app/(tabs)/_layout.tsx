import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Tabs } from 'expo-router';
import React from 'react';


export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: Colors.dark.background,
                },
                sceneStyle: {
                    backgroundColor: Colors.dark.background
                }
            }}
        >
            {/* Hide the index route from tabs */}
            <Tabs.Screen
                name="index"
                options={{
                    href: null, // This hides the tab from the tab bar
                }}
            />

            {/* Home */}
            <Tabs.Screen
                name="home"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, focused }) => <IconSymbol name={focused ? "home" : "home-outline"} color={color} key={'home'} />,
                }}
            />

            {/* Recent */}
            <Tabs.Screen
                name='recent'
                options={{
                    title: "Recent",
                    tabBarIcon: ({ color, focused }) => <IconSymbol name={focused ? "time" : "time-outline"} color={color} key={'recent'} />
                }}
            />

            {/* Setting */}
            <Tabs.Screen
                name='settings'
                options={{
                    title: "Settings",
                    tabBarIcon: ({ color, focused }) => <IconSymbol name={focused ? "settings" : "settings-outline"} color={color} key={'settings'} />
                }}
            />
        </Tabs>
    )
}