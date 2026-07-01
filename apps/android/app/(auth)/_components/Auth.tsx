import { Colors } from '@/constants/Colors'
import React, { useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native'

type AuthData = Record<"email" | "password", string>

interface AuthProps {
    btnTitle: string
    isProcessing: boolean,
    handleSubmitForm: ({ email, password }: AuthData) => Promise<void>
}

interface InputFieldProps {
    value: AuthData,
    type: "Email" | "Password",
    setAuthData: React.Dispatch<React.SetStateAction<AuthData>>
}

const InputField: React.FC<InputFieldProps> = ({ value, type, setAuthData }) => {
    const [focus, setFocus] = useState<boolean>(false);

    const handleTextChange = (t: string) => {
        // Insert Text Input State
        setAuthData((prev) => ({
            ...prev,
            [type.toLowerCase()]: t.trim(),
        }))
    }

    return (
        <View style={[inputStyle.inputContainer, { outlineWidth: focus ? 1.5 : 0, outlineOffset: 2 }]}>
            <TextInput
                value={value[type.toLowerCase() as "email" | "password"]}
                style={inputStyle.input}
                placeholder={type}
                placeholderTextColor={'#408599'}
                autoCapitalize='none'
                keyboardType={type === "Email" ? "email-address" : "default"}
                inputMode={type === "Email" ? 'email' : 'text'}
                secureTextEntry={type === "Password"}
                onChangeText={handleTextChange}
                onFocus={() => setFocus(true)}
                onBlur={() => setFocus(false)}
            />
        </View>
    )
}

export default function Auth({ isProcessing, btnTitle, handleSubmitForm }: AuthProps) {
    const [authData, setAuthData] = useState<AuthData>({
        email: "",
        password: "",
    });

    const handleSubmit = () => {
        // Validate -- Whether email and password is valid or not
        if (!authData.email || !authData.password) {
            ToastAndroid.show("Email and Password are required", ToastAndroid.SHORT);
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(authData.email)) {
            ToastAndroid.show("Invalid email format", ToastAndroid.SHORT);
            return;
        }

        handleSubmitForm(authData);
    }

    return (
        <View style={styles.main}>
            {/* Form */}
            <View style={styles.formContainer}>
                {/* Email Input */}
                <InputField
                    value={authData}
                    type='Email'
                    setAuthData={setAuthData}
                />
                {/* Password Input */}
                <InputField
                    value={authData}
                    type='Password'
                    setAuthData={setAuthData}
                />
            </View>
            {/* Action Button */}
            <TouchableOpacity
                style={styles.btn}
                disabled={isProcessing}
                activeOpacity={0.8}
                onPress={handleSubmit}
            >
                <Text style={styles.btnText}>
                    {
                        isProcessing ? (
                            <ActivityIndicator size={24} />
                        ) : (
                            btnTitle
                        )
                    }
                </Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    main: {
        gap: 14,
        marginTop: 12,
    },
    btn: {
        borderRadius: 12,
        paddingVertical: 10,
        backgroundColor: "#00adc0"
    },
    btnText: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: "center",
        color: Colors.dark.titleText,
    },
    formContainer: {
        gap: 8
    }
})

const inputStyle = StyleSheet.create({
    inputContainer: {
        borderRadius: 12,
        backgroundColor: "#001e29",
        borderWidth: 0.5,
        outlineColor: "#00adc0",
        borderColor: Colors.dark.borderColor,
    },
    input: {
        paddingVertical: 14,
        paddingHorizontal: 14,
        color: "white",
    }
})