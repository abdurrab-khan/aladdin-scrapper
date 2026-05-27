import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { LIGHT_GRADIENT_BUTTON } from '@/constants/Colors';
import ScrapeDialog from '@/components/dialog/ScrapeDialog';

export default function ScrapeFAB() {
    const [dialogVisible, setDialogVisible] = useState(false);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setDialogVisible(true)}
                style={styles.button}
            >
                <LinearGradient
                    colors={LIGHT_GRADIENT_BUTTON}
                    style={styles.gradient}
                >
                    <IconSymbol name="cloud-download-outline" color="white" size={28} />
                </LinearGradient>
            </TouchableOpacity>

            {dialogVisible && (
                <ScrapeDialog
                    visible={dialogVisible}
                    setVisible={setDialogVisible}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        zIndex: 999,
    },
    button: {
        borderRadius: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    gradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
