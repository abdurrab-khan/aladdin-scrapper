import SafeContainer from '@/components/layout/SafeContainer'
import { Slot } from 'expo-router'
import React from 'react'
import { GestureResponderEvent, Image, Keyboard, KeyboardAvoidingView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native'

export default function AuthLayout() {
    const handleKeyboardDismiss = (k: GestureResponderEvent) => {
        if (!Keyboard.isVisible()) return;

        // Dismiss the keyboard if already visible
        Keyboard.dismiss()
    }

    return (
        <SafeContainer>
            <KeyboardAvoidingView style={[styles.main]} behavior='height'>
                <TouchableWithoutFeedback onPress={handleKeyboardDismiss} accessible={false}>
                    <View style={styles.mainContainer}>
                        {/* App Logo */}
                        <View style={styles.logoImage}>
                            <Image
                                style={styles.logo}
                                source={require('@/assets/images/icon.png')}
                            />
                        </View>

                        {/* Auth Section */}
                        <View style={styles.authSection}>
                            <Slot />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </SafeContainer>
    )
}



const styles = StyleSheet.create({
    main: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    mainContainer: {
        width: "100%",
        alignItems: "center",
    },
    logoImage: {
        height: 200,
        width: 200
    },
    logo: {
        height: "100%",
        width: "100%"
    },
    authSection: {
        width: "85%",
    },
});