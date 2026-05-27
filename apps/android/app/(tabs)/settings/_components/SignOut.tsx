import { Colors } from '@/constants/Colors';
import { supabase } from '@/api/clients/supabase';
import React, { useState } from 'react';
import { Text, ToastAndroid, TouchableOpacity } from 'react-native';
import Dialog from '@/components/dialog/Dialog';

export default function SignOut() {
    const [visible, setVisible] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    const handleSignOut = async () => {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signOut()

            if (error) {
                throw new Error(error.message)
            }
        } catch (err) {
            const errMsg = err instanceof Error ? err.message : "An error occurred while signing out.";
            ToastAndroid.show(errMsg, ToastAndroid.LONG)
        } finally {
            setLoading(false);
        }
    }

    return (
        <React.Fragment>
            <Dialog
                btnTitle='Confirm'
                btnAction={handleSignOut}
                title='Do you really want to sign out?'
                isLoading={loading}
                visible={visible}
                setVisible={setVisible}
            />

            <TouchableOpacity style={{
                gap: 8,
                backgroundColor: Colors.dark.header,
                marginTop: 12,
                paddingVertical: 8,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 8,
                flexDirection: "row",
            }} onPress={() => setVisible(true)}>
                <Text style={{ color: "white", fontSize: 16, fontWeight: "400", }}>
                    Sign Out
                </Text>
            </TouchableOpacity>
        </React.Fragment>
    )
}
