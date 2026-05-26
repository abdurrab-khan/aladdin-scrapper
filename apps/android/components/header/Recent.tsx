import React from 'react'
import { Text, View } from 'react-native'
import { IconSymbol } from '../ui/IconSymbol'
import { HeaderStyle } from './styles'

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