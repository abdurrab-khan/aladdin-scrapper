import React from 'react';
import { Stack } from 'expo-router';
import useAppContext from '@/context/AppContext';
import { getAppData } from '@/api/services/app';


export default function HomeLayout() {
    const { session } = useAppContext();


    getAppData(session?.id!).then((data) => {
        console.log('App Data:', data);
    }).catch((error) => {
        console.error('Error fetching app data:', error);
    });


    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="index"
            />
        </Stack>
    )
}