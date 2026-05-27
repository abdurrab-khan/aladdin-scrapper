import { Colors } from '@/constants/Colors';
import { CaptionDetailsSchema } from '@/api/schemas/caption.schema';
import { SocialMedia } from '@/types';
import React from 'react';
import { Control, useController } from 'react-hook-form';
import { ActivityIndicator, Image, ScrollView, StyleProp, StyleSheet, Text, TextInput, TextStyle, TouchableOpacity, View } from 'react-native';
import * as z from 'zod';


const platformImages: Record<SocialMedia, any> = {
    telegram: require('../../../../assets/images/icons/social-media/telegram.png'),
    instagram: require('../../../../assets/images/icons/social-media/instagram.png'),
    facebook: require('../../../../assets/images/icons/social-media/facebook.png'),
    x: require('../../../../assets/images/icons/social-media/x.png'),
};

interface CaptionDetailsControls {
    control: Control<z.infer<typeof CaptionDetailsSchema>>;
}
interface CaptionDetailsProps extends CaptionDetailsControls {
    imageLoading: boolean,
    mergedImage: string,
}
interface InputProps extends CaptionDetailsControls {
    name: keyof z.infer<typeof CaptionDetailsSchema>;
    label: string;
    placeholder: string;
    textInputStyle: StyleProp<TextStyle>;
    [key: string]: any;
}

interface PlatformViewProps {
    platform: SocialMedia;
    active: boolean;
    onPress: (platform: SocialMedia) => void;
}

// ============== Input Component ===============
const Input: React.FC<InputProps> = ({ name, control, label, textInputStyle, placeholder, ...props }) => {
    const {
        field,
        fieldState: { error },
        formState: { errors }
    } = useController({ control, name });

    const handleTextChange = (text: string) => {
        let inputText = text;

        if (name === 'tags') {
            // If user is typing in tags field and adds space, append a "#" for easy tagging
            if (inputText.length > (field.value as string).length && inputText.endsWith(' ')) {
                inputText += " #";
            }

            // If there is no text previously and user adds text, prepend a "#"
            if ((field.value as string).length === 0 && inputText.length > 0 && !inputText.startsWith('#')) {
                inputText = "#" + inputText;
            }
        }

        field.onChange(inputText);
    }

    return (
        <View style={inputStyle.labelView}>
            {/* Input Label */}
            <Text style={inputStyle.labelText}>
                {label}
            </Text>

            {/* Actual Input */}
            <TextInput
                value={field.value as string}
                onChangeText={handleTextChange}
                onBlur={field.onBlur}
                placeholder={placeholder}
                style={[
                    inputStyle.inputText,
                    textInputStyle,
                ]}
                blurOnSubmit={false}
                returnKeyType={name === 'tags' ? 'done' : 'next'}
                {...props}
            />

            {/* Show validation error */}
            {error && (
                <Text style={inputStyle.errorText}>
                    {error.message}
                </Text>
            )}

            {/* Fallback error display */}
            {!error && errors[name] && (
                <Text style={inputStyle.errorText}>
                    {errors[name]?.message as string}
                </Text>
            )}
        </View>
    )
}

// ============== Platform Selector Component ===============
const PlatformView = ({ platform, active, onPress }: PlatformViewProps) => {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            style={[
                platformStyle.platformView,
                {
                    backgroundColor: Colors.dark.header + (active ? 'ff' : '99'),
                    opacity: active ? 1 : 0.35,
                }
            ]}
            onPress={() => onPress(platform)}
        >
            {/* Platform Image */}
            <Image
                source={platformImages[platform as keyof typeof platformImages]}
                style={platformStyle.platformImage}
                resizeMode="contain"
            />

            {/* Platform Name */}
            <Text style={platformStyle.platformName}>
                {platform}
            </Text>
        </TouchableOpacity>
    )
}

// ============== Platform Selector Component ===============
const PlatformSelector = ({ control }: CaptionDetailsControls) => {
    const {
        field,
        fieldState: { error },
    } = useController({
        control,
        name: 'platforms'
    });

    const handleSelectPlatform = (platform: SocialMedia) => {
        // Toggle platform selection
        if (field.value.includes(platform)) {
            field.onChange(field.value.filter((p: string) => p !== platform));
        } else {
            field.onChange([...field.value, platform]);
        }
    }

    return (
        <View style={inputStyle.labelView}>
            {/* Label for Select Platform */}
            <Text style={inputStyle.labelText}>
                Select Platforms
            </Text>

            {/* Showing to select them */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={[
                    platformStyle.scrollView,
                ]}
            >
                {
                    (["telegram", "facebook", "instagram", 'x'] as SocialMedia[]).map((platform) => (
                        <PlatformView
                            key={platform}
                            platform={platform}
                            active={field.value.includes(platform)}
                            onPress={handleSelectPlatform}
                        />
                    ))
                }
            </ScrollView>

            {/* Show validation error */}
            {error && (
                <Text style={inputStyle.errorText}>
                    {error.message}
                </Text>
            )}
        </View>
    )
}

// ============== Main Caption Editor Component ===============
export default function CaptionEditorForm({
    control,
    imageLoading,
    mergedImage
}: CaptionDetailsProps) {
    return (
        <View style={{ marginTop: 8 }}>
            {/* Display Image */}
            <View style={styles.imgView}>
                {
                    (imageLoading) ? (
                        // Show loading indicator while image is being processed
                        <View style={{ padding: 20 }}>
                            <ActivityIndicator size="large" color="#636368ff" />
                        </View>
                    ) : (
                        <Image
                            source={{ uri: mergedImage ?? 'https://via.placeholder.com/150' }}
                            style={styles.img}
                            resizeMode="contain"
                        />
                    )
                }
            </View>

            {/* Select platform to send */}
            <PlatformSelector control={control} />

            {/* TextArea to add caption */}
            <Input
                name='caption'
                control={control}
                label='Add Caption'
                placeholder='Write your caption here...'
                textInputStyle={{ height: 160, textAlignVertical: 'top' }}
                multiline
                numberOfLines={8}
                placeholderTextColor={Colors.dark.text + '99'}
                textContentType="none"
                autoCorrect={true}
                autoCapitalize="sentences"
            />

            {/* TextArea to add tags */}
            <Input
                name='tags'
                control={control}
                label='Tags (Optional)'
                placeholder='Add some tags...'
                textInputStyle={{ height: 80, textAlignVertical: 'top' }}
                multiline
                numberOfLines={4}
                placeholderTextColor={Colors.dark.text + '99'}
                textContentType="none"
                autoCorrect={false}
                autoCapitalize="none"
            />
        </View>
    )
}

// ============== Styles ===============
const styles = StyleSheet.create({
    imgView: {
        width: "100%",
        minHeight: 200,
        borderRadius: 12,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",
        marginVertical: 20,
        backgroundColor: Colors.dark.header
    },
    img: {
        height: 200,
        width: "100%",
        borderRadius: 12,
        resizeMode: "contain",
    },
    platformStyle: {
        padding: 6,
        marginVertical: 5,
        marginHorizontal: 10,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.dark.header,
    },
    notActivePlatform: {
        opacity: 0.2,
    }
});

const inputStyle = StyleSheet.create({
    labelView: {
        gap: 6,
        marginBottom: 12,
        flexDirection: "column",
        alignItems: "flex-start",
    },
    labelText: {
        fontSize: 16,
        fontWeight: "600",
        color: Colors.dark.text
    },
    inputText: {
        width: "100%",
        color: "#fefffc",
        padding: 12,
        fontSize: 14,
        borderRadius: 8,
        textAlignVertical: "top",
        backgroundColor: Colors.dark.header,
    },
    errorText: {
        color: '#e23030ff',
        fontSize: 12,
        marginTop: 4,
        fontWeight: '500'
    }
});

const platformStyle = StyleSheet.create({
    scrollView: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
    },
    platformView: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 12,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: Colors.dark.header
    },
    platformImage: {
        width: 30,
        height: 30,
    },
    platformName: {
        color: Colors.dark.text,
        fontSize: 16,
        fontWeight: "500",
        textTransform: "capitalize"
    }
});