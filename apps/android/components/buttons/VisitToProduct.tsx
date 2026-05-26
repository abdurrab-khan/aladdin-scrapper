import { Colors } from '@/constants/Colors';
import { getPlatformLogo } from '@/lib/getCustomComponents';
import React, { useState } from 'react';
import { Linking, StyleSheet, ToastAndroid, TouchableOpacity, View } from 'react-native';
import Dialog from '../dialog/Dialog';

interface VisitToProductProps {
    size?: number,
    uri: string,
    plateForm: string,
}

export default function VisitToProduct({ size = 64, uri, plateForm }: VisitToProductProps) {
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const PlateFormLogo = getPlatformLogo(plateForm.toLowerCase());


    const handleVisitToProduct = async () => {
        await Linking.openURL(uri)
    }

    const toggleDialogVisibility = async () => {
        // Validate: Check is url is valid or not.
        setLoading(true);
        try {
            const supported = await Linking.canOpenURL(uri);

            if (supported) {
                setVisible(true)
            } else {
                throw new Error("Don't know how to open");
            }
        } catch (err) {
            const msg = err instanceof Error ? err.message : "An error occurred while opening the link.";
            ToastAndroid.show(msg, 0.4)
        } finally {
            setLoading(false)
        }
    }

    return (
        <React.Fragment>
            <Dialog
                visible={visible}
                isLoading={loading}
                title='Are you sure you want to visit this product?'
                btnTitle='Visit'
                btnAction={handleVisitToProduct}
                setVisible={setVisible}
            />
            <View style={styles.logoContainer}>
                <TouchableOpacity onPress={toggleDialogVisibility} style={styles.logoStyle}>
                    <PlateFormLogo width={size} height={size * 0.33} />
                </TouchableOpacity>
            </View>
        </React.Fragment>
    )
}


const styles = StyleSheet.create({
    logoContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    logoStyle: {
        borderWidth: 0.5,
        borderColor: Colors.dark.borderColor,
        borderRadius: 999,
        paddingVertical: 4,
        paddingHorizontal: 8,
        backgroundColor: "lightblue"
    }
})