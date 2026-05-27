import React from 'react'
import { Text, View } from 'react-native'
import { IconSymbol } from '@/components/ui/IconSymbol'
import { HeaderStyle } from '@/components/header/styles'

export default function Recent() {
    return (
        <View style={[HeaderStyle.headerContainer, { gap: 18 }]}>
            <View>
                <IconSymbol name='time' size={26} color={"#B0BEC5"} />
            </View>
            <Text style={HeaderStyle.headerTitle}>
                Recent Post
            </Text>
        </View>
    )
}