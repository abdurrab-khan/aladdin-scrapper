import SignOut from '@/components/buttons/SignOut';
import React from 'react';
import { ScrollView, View } from 'react-native';

export default function Settings() {
    return (
        <ScrollView style={{ padding: 8, }}>
            <View>
                <SignOut />
            </View>
        </ScrollView>
    )
}