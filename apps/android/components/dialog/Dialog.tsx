import { Colors, DARK_GRADIENT_BUTTON, LIGHT_GRADIENT_BUTTON } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ModalContainer from "./ModalContainer";

interface btnStyles {
    gradientColor: string[]
}


interface DialogProps {
    isLoading?: boolean,
    visible: boolean
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
    title: string,
    btnTitle: string,
    btnStyle?: {
        action?: Partial<btnStyles>,
        close?: Partial<btnStyles>
    },
    btnAction: () => void
}

interface ActionButtonProps {
    title: string,
    isLoading?: boolean,
    btnStyle: Partial<btnStyles>,
    btnAction: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ title, isLoading, btnStyle, btnAction }) => {
    return (
        <TouchableOpacity onPress={btnAction} style={actionButtonStyles.button}>
            <LinearGradient style={actionButtonStyles.gradientContainer} colors={btnStyle?.gradientColor ?? LIGHT_GRADIENT_BUTTON}>
                {
                    isLoading ? (
                        <ActivityIndicator />
                    ) : (
                        <Text style={actionButtonStyles.text}>
                            {title}
                        </Text>
                    )
                }
            </LinearGradient>
        </TouchableOpacity>
    )
}

export default function Dialog({
    isLoading,
    visible,
    title,
    btnTitle,
    btnStyle = {
        action: {
            gradientColor: LIGHT_GRADIENT_BUTTON
        },
        close: {
            gradientColor: DARK_GRADIENT_BUTTON
        }
    },
    setVisible,
    btnAction,
}: DialogProps) {

    const closeDialog = () => {
        if (isLoading) return;

        setVisible(false)
    }

    return (
        <ModalContainer visible={visible} isLoading={isLoading} setVisible={setVisible} animationType='slide'>
            <View>
                {/* title and action button */}
                <View style={dialogStyles.descriptionContainer}>
                    {/* Dialog title */}
                    <View style={dialogStyles.titleContainer}>
                        <Text style={dialogStyles.title}>
                            {title}
                        </Text>
                    </View>

                    {/* Action buttons */}
                    <View style={dialogStyles.buttonContainer}>
                        {/* Close */}
                        <ActionButton title="Close" btnStyle={btnStyle.close ?? {}} btnAction={closeDialog} />

                        {/* Main Action */}
                        <ActionButton title={btnTitle} btnStyle={btnStyle.action ?? {}} btnAction={btnAction} isLoading={isLoading} />
                    </View>
                </View>
            </View>
        </ModalContainer>

    )
}

const dialogStyles = StyleSheet.create({
    descriptionContainer: {
        gap: 20,
        flexDirection: "column"
    },
    titleContainer: {
        width: '100%',
        flexShrink: 1,
    },
    title: {
        color: Colors.dark.text,
        fontSize: 20,
        fontWeight: "600",
        flexWrap: 'wrap', // Allow text to wrap to multiple lines
    },
    status: {
        marginTop: 6,
        fontSize: 16,
        color: "lightgreen",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between"
    },
    imageContainer: {
        position: "relative",
        width: "100%",
        height: 90,
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        height: "100%",
        width: "100%",
        objectFit: "contain",
    },
})

const actionButtonStyles = StyleSheet.create({
    button: {
        borderWidth: 0.5,
        borderRadius: 999,
        overflow: "hidden",
        borderColor: "lightgray",
    },
    gradientContainer: {
        paddingVertical: 8,
        paddingHorizontal: 30,
    },
    text: {
        color: "lightblue",
        fontWeight: "600"
    }
})