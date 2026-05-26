import React from 'react'
import { Text, View } from 'react-native'
import { IconSymbol } from '../ui/IconSymbol'
import { HeaderStyle } from './styles'

export default function Setting() {
    return (
        <View style={[HeaderStyle.headerContainer, { gap: 18 }]}>
            <View>
                <IconSymbol name='settings' size={26} color={"#B0BEC5"} />
            </View>
            <Text style={HeaderStyle.headerTitle}>
                Settings
            </Text>
        </View>
    )
}