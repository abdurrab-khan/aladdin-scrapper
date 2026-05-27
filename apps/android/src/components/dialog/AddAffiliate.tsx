import { Colors } from '@/constants/Colors';
import { affiliateProvider } from '@/constants/const';
import useAppContext from '@/context/AppContext';
import { addAffiliateLink } from '@/api/services/affiliate';
import { updateProduct } from '@/api/services/product';
import { useProductStore } from '@/store/useProductStore';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Platform, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';
import ModalContainer from './ModalContainer';

interface AddAffiliateProps {
    visible: boolean,
    productId: string | string[],
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
}

interface InputProps {
    value: string,
    placeHolder?: string,
    [key: string]: any;
}

const Input: React.FC<InputProps> = ({ placeHolder, value, ...props }) => {
    return (
        <View style={inputStyle.inputContainer}>
            {
                placeHolder && (
                    <View>
                        <Text style={inputStyle.placeHolderTitle}>
                            {placeHolder}
                        </Text>
                    </View>
                )
            }
            <TextInput
                value={value}
                style={styles.inputText}
                placeholder={placeHolder}
                autoCorrect={false}
                autoCapitalize='none'
                keyboardType='default'
                enablesReturnKeyAutomatically
                placeholderTextColor={Colors.dark.text}
                {...props}
            />
        </View>
    )
}

export default function AddAffiliate({
    visible,
    productId,
    setVisible,
}: AddAffiliateProps) {
    const { setProductSelectionData } = useProductStore();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [affiliateUrl, setAffiliateUrl] = useState<string>("");

    const { updateProduct: updateContextProduct, getProductById } = useAppContext();

    const affiliateInputRef = React.useRef<TextInput>(null);

    const productSendDetails = useMemo(() => {
        const id = Array.isArray(productId) ? productId[0] : productId;
        return getProductById(id);
    }, [getProductById, productId]);

    // Cross-platform toast function
    const showToast = (message: string) => {
        if (Platform.OS === 'android') {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert('Info', message);
        }
    };

    // Function to handle affiliate link submission
    const handleAffiliateLinkSubmit = async () => {
        const pId = Array.isArray(productId) ? productId[0] : productId;
        const product = getProductById(pId); // Get product details

        if (!product) {
            showToast('Product not found.');
            return;
        }

        // Basic validation
        if (!affiliateUrl.trim() || !product.url.trim()) {
            showToast('Please enter a valid affiliate link and product URL.');
            return;
        }

        try {
            setIsLoading(true)

            if (product.isGrouped) {
                const updateGroupRes = await updateProduct(pId, { "groupAffiliateUrl": affiliateUrl });

                if (!updateGroupRes) {
                    showToast('Failed to update grouped product with affiliate link.');
                    return;
                }

                // Update the product in the context
                updateContextProduct(pId, { "groupAffiliateUrl": affiliateUrl });
            } else {
                // Add affiliate link into the database
                const response = await addAffiliateLink(product.url, affiliateUrl, product.platformInfo.id);

                if (response.status === 201 && response.data) {
                    const updateProductRes = await updateProduct(pId, { "affiliateLinkId": response.data[0].id });

                    if (!updateProductRes) {
                        showToast('Failed to update product with affiliate link.');
                        return;
                    }

                    // Update the product in the context
                    updateContextProduct(pId, { "affiliateInfo": response.data[0] });
                }
            }

            // Update store selection data hasAffiliateLink property
            setProductSelectionData(prev => {
                const updated = new Map(prev);
                const prevData = updated.get(pId);

                // Update hasAffiliateLink to true
                if (prevData) {
                    updated.set(pId, { ...prevData, hasAffiliateLink: true });
                }

                return updated;
            });
        } catch (e) {
            showToast((e as Error).message);
        } finally {
            setIsLoading(false);
            setVisible(false);
        }
    }

    // Function to get affiliate link
    const getAffiliateLink = async () => {
        if (!productSendDetails) return;
        const platformName = productSendDetails.platformInfo.name;
        const productUrl = productSendDetails.url;

        let affiliateUrl: string = "";
        if (platformName === 'Amazon') {
            affiliateUrl = productUrl
        } else {
            affiliateUrl = affiliateProvider[platformName.toLowerCase()]
        }

        const canOpen = await Linking.canOpenURL(affiliateUrl);

        if (canOpen) {
            Linking.openURL(affiliateUrl)
                .catch(() => showToast(`Failed to open ${platformName} link.`));
        } else {
            showToast(`Invalid ${platformName} link.`);
        }
    }

    // Function to copy url into the clipboard
    const handleCopyUrl = async () => {
        if (!productSendDetails) return;
        try {
            await Clipboard.setStringAsync(productSendDetails.url);
            showToast('Product URL copied to clipboard!');
        } catch {
            showToast('Failed to copy URL');
        }
    }

    useEffect(() => {
        if (!visible) return;

        if (affiliateInputRef.current) {
            affiliateInputRef.current.focus();
        }
    }, [visible]);

    if (productSendDetails == null) return null;

    return (
        <ModalContainer isLoading={isLoading} visible={visible} setVisible={setVisible} animationType='slide'>
            <View>
                {/* Title for pop up */}
                <Text style={styles.titleText}>
                    Add Affiliate Link for this product.
                </Text>

                {/* Affiliate and Product Url container */}
                <View style={styles.mainInputContainer}>
                    {/*  */}
                    <View style={styles.affiliateInputContainer}>
                        {/* Input to add original url */}
                        <View style={{ flex: 0.8 }}>
                            <Input
                                placeHolder='Enter product url'
                                value={productSendDetails.url}
                                readOnly
                            />
                        </View>

                        {/* Button to copy url */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={handleCopyUrl}
                            style={styles.getAffiliateLink}
                        >
                            <IconSymbol name='copy-outline' size={20} color={Colors.dark.header} />
                        </TouchableOpacity>
                    </View>

                    {/* Input Container to add affiliate link */}
                    <View style={styles.affiliateInputContainer}>
                        {/* Input to add affiliate link */}
                        <View style={{ flex: 0.8 }}>
                            <Input
                                value={affiliateUrl}
                                placeHolder='Enter affiliate link'
                                onChangeText={(t: string) => setAffiliateUrl(t)}
                                onEndEditing={getAffiliateLink}
                                ref={affiliateInputRef}
                            />
                        </View>

                        {/* Button to get affiliate link */}
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={getAffiliateLink}
                            style={styles.getAffiliateLink}
                        >
                            <IconSymbol name='link-outline' size={20} color={Colors.dark.header} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Button Container to insert affiliate link */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.buttonStyle} activeOpacity={0.7} onPress={handleAffiliateLinkSubmit}>
                        {
                            isLoading ? (
                                <Text style={styles.btnText}>Submitting...</Text>
                            ) : (
                                <Text style={styles.btnText}>Add Affiliate Link</Text>
                            )
                        }
                    </TouchableOpacity>
                </View>
            </View>
        </ModalContainer>
    )
}

const styles = StyleSheet.create({
    titleText: {
        fontSize: 20,
        color: Colors.dark.titleText,
        fontWeight: 500,
    },
    mainInputContainer: {
        marginTop: 16,
        gap: 8,
    },
    affiliateInputContainer: {
        gap: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    inputText: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderColor: Colors.dark.text,
        color: Colors.dark.text,
    },
    getAffiliateLink: {
        flex: 0.2,
        borderRadius: 6,
        paddingVertical: 11,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.dark.text,
    },
    buttonContainer: {
        marginTop: 12,
        alignItems: 'center',
    },
    buttonStyle: {
        width: '100%',
        borderRadius: 8,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.dark.text,
    },
    btnText: {
        color: Colors.dark.header,
        fontSize: 14,
        fontWeight: '600',
    }
});

const inputStyle = StyleSheet.create({
    inputContainer: {
        gap: 6
    },
    placeHolderTitle: {
        fontSize: 16,
        color: Colors.dark.titleText
    }
})