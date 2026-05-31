import { Colors } from '../../constants/Colors';
import { affiliateProvider } from '../../constants/const';
import { addAffiliateLink, deleteAffiliateLink, getAffiliateLinks, setDefaultAffiliateLink } from '../../api/services/affiliate';
import { updateProduct } from '../../api/services/product';
import { useProductStore } from '../../store/useProductStore';
import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View, FlatList, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { IconSymbol } from '../ui/IconSymbol';
import ModalContainer from './ModalContainer';
import toast from '../../utils/toast';
import { getWebsiteName } from '../../utils/utils';
import useAppContext from '../../context/AppContext';
import { useQuery } from '@tanstack/react-query';
import queryClient from '../../api/clients/queryClient';
import { Affiliate } from '../../types';

interface AddAffiliateProps {
    visible: boolean,
    productId: string,
    productURL: string,
    isGrouped: boolean,
    platformId: string,
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
    productURL,
    isGrouped,
    platformId,
    setVisible,
}: AddAffiliateProps) {
    const { setProductSelectionData } = useProductStore();
    const [affiliateUrl, setAffiliateUrl] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { app } = useAppContext();

    const { data: links = [], isLoading: isLoadingLinks, refetch: refetchLinks } = useQuery({
        queryKey: ['affiliateLinks', productId],
        queryFn: () => getAffiliateLinks(productId),
        enabled: visible && !!productId
    });

    const platformName = getWebsiteName(productURL);
    const affiliateInputRef = React.useRef<TextInput>(null);

    // Function to handle affiliate link submission
    const handleAffiliateLinkSubmit = async () => {
        if (!affiliateUrl.trim()) {
            toast('Please enter a valid affiliate link.');
            return;
        }

        try {
            setIsLoading(true)

            if (isGrouped) {
                const updateGroupRes = await updateProduct(productId, { "groupAffiliateUrl": affiliateUrl });
                if (!updateGroupRes) {
                    toast('Failed to update grouped product with affiliate link.');
                    return;
                }
            } else {
                const response = await addAffiliateLink(app?.id!, productId, platformId, affiliateUrl);
                if (!response) {
                    toast('Failed to add affiliate link.');
                    return;
                }
                setAffiliateUrl("");
                refetchLinks();
            }

            setProductSelectionData(prev => {
                const updated = new Map(prev);
                const prevData = updated.get(productId);
                if (prevData) {
                    updated.set(productId, { ...prevData, hasAffiliateLink: true });
                }
                return updated;
            });

            queryClient.setQueryData(['products'], (oldData: any) => {
                if (!oldData) return oldData;
                return oldData.map((p: any) => p.product_id === productId ? { ...p, has_affiliate: true } : p);
            });

        } catch (e) {
            toast((e as Error).message, ToastAndroid.LONG);
        } finally {
            setIsLoading(false);
        }
    }

    const handleDeleteLink = async (affiliateId: string) => {
        Alert.alert(
            "Delete Link",
            "Are you sure you want to delete this affiliate link?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            await deleteAffiliateLink(affiliateId);
                            const updatedLinks = await refetchLinks();

                            if (!updatedLinks.data || updatedLinks.data.length === 0) {
                                setProductSelectionData(prev => {
                                    const updated = new Map(prev);
                                    const prevData = updated.get(productId);
                                    if (prevData) {
                                        updated.set(productId, { ...prevData, hasAffiliateLink: false });
                                    }
                                    return updated;
                                });

                                queryClient.setQueryData(['products'], (oldData: any) => {
                                    if (!oldData) return oldData;
                                    return oldData.map((p: any) => p.product_id === productId ? { ...p, has_affiliate: false } : p);
                                });
                            }
                            toast("Link deleted successfully");
                        } catch (e) {
                            toast((e as Error).message);
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    }

    const handleSetDefault = async (affiliateId: string) => {
        try {
            setIsLoading(true);
            await setDefaultAffiliateLink(affiliateId, productId);
            await refetchLinks();
            toast("Default link updated");
        } catch (e) {
            toast((e as Error).message);
        } finally {
            setIsLoading(false);
        }
    }

    const getAffiliateLink = async () => {
        let affiliateUrl: string = "";
        if (platformName === 'Amazon') {
            affiliateUrl = productURL
        } else {
            affiliateUrl = affiliateProvider[platformName.toLowerCase()]
        }

        if (!affiliateUrl) {
            toast(`No affiliate provider configured for ${platformName}`);
            return;
        }

        const canOpen = await Linking.canOpenURL(affiliateUrl);
        if (canOpen) {
            Linking.openURL(affiliateUrl).catch(() => toast(`Failed to open link.`));
        } else {
            toast(`Invalid link.`);
        }
    }

    const handleCopyUrl = async () => {
        try {
            await Clipboard.setStringAsync(productURL);
            toast('Product URL copied!');
        } catch {
            toast('Failed to copy');
        }
    }

    useEffect(() => {
        if (!visible) return;
        if (affiliateInputRef.current) {
            affiliateInputRef.current.focus();
        }
    }, [visible]);

    const renderLinkItem = ({ item }: { item: Affiliate }) => (
        <View style={styles.linkItem}>
            <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.linkUrl} numberOfLines={1} ellipsizeMode="middle">{item.affiliate_url}</Text>
                <Text style={styles.linkDate}>{new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </View>
            <View style={styles.linkActions}>
                <TouchableOpacity onPress={() => handleSetDefault(item.affiliate_id)} style={styles.actionIconButton}>
                    <IconSymbol
                        name={item.is_default ? 'checkmark-circle' : 'ellipse-outline'}
                        size={20}
                        color={item.is_default ? '#4CAF50' : Colors.dark.text}
                    />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteLink(item.affiliate_id)} style={styles.actionIconButton}>
                    <IconSymbol name='trash-outline' size={20} color='#F44336' />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ModalContainer isLoading={isLoading} visible={visible} setVisible={setVisible} animationType='slide' modelStyle={[styles.modalSize, { height: 'auto', maxHeight: '98%' }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ width: '100%' }}
            >
                <View style={styles.mainContainer}>
                    <Text style={styles.titleText}>Manage Affiliate Links</Text>
                    <View style={styles.contentContainer}>
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Product URL</Text>
                            <View style={styles.inputRow}>
                                <View style={{ flex: 1 }}>
                                    <Input
                                        value={productURL}
                                        readOnly
                                    />
                                </View>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={handleCopyUrl}
                                    style={styles.rowActionButton}
                                >
                                    <IconSymbol name='copy-outline' size={18} color={Colors.dark.header} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.linksSection}>
                            <Text style={styles.sectionTitle}>Existing Links ({links.length})</Text>
                            {isLoadingLinks ? (
                                <ActivityIndicator color={Colors.dark.text} style={{ padding: 20 }} />
                            ) : links.length > 0 ? (
                                <FlatList
                                    data={links}
                                    renderItem={renderLinkItem}
                                    keyExtractor={(item) => item.affiliate_id}
                                    style={styles.linkList}
                                    contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
                                    showsVerticalScrollIndicator={true}
                                    nestedScrollEnabled={true}
                                    keyboardShouldPersistTaps="handled"
                                />
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Text style={styles.emptyText}>No affiliate links found</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Add New Link</Text>
                            <View style={styles.inputRow}>
                                <View style={{ flex: 1 }}>
                                    <Input
                                        value={affiliateUrl}
                                        placeHolder='Enter affiliate link...'
                                        onChangeText={setAffiliateUrl}
                                        ref={affiliateInputRef}
                                    />
                                </View>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={getAffiliateLink}
                                    style={styles.rowActionButton}
                                >
                                    <IconSymbol name='link-outline' size={18} color={Colors.dark.header} />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.submitButton}
                                activeOpacity={0.7}
                                onPress={handleAffiliateLinkSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color={Colors.dark.header} />
                                ) : (
                                    <Text style={styles.btnText}>Add Link</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </ModalContainer>
    )
}

const styles = StyleSheet.create({
    modalSize: {
        maxHeight: '85%',
        width: '90%',
        padding: 20,
    },
    mainContainer: {
        paddingBottom: 10,
    },
    titleText: {
        fontSize: 20,
        color: Colors.dark.titleText,
        fontWeight: '700',
        marginBottom: 20,
    },
    contentContainer: {
        gap: 20,
    },
    section: {
        gap: 8,
    },
    linksSection: {
        gap: 8,
        maxHeight: 180,
    },
    linkList: {
        flexGrow: 0,
    },
    sectionTitle: {
        fontSize: 13,
        color: Colors.dark.titleText,
        fontWeight: '600',
        opacity: 0.7,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    inputText: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 48,
        borderColor: 'rgba(255,255,255,0.2)',
        color: Colors.dark.text,
        fontSize: 14,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    rowActionButton: {
        width: 48,
        height: 48,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.dark.text,
    },
    linkItem: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    linkUrl: {
        color: Colors.dark.text,
        fontSize: 14,
        fontWeight: '500',
    },
    linkDate: {
        color: Colors.dark.text,
        fontSize: 11,
        opacity: 0.5,
        marginTop: 4,
    },
    linkActions: {
        flexDirection: 'row',
        gap: 4,
    },
    actionIconButton: {
        padding: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: 12,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    emptyText: {
        color: Colors.dark.text,
        opacity: 0.4,
        fontSize: 14,
        fontStyle: 'italic',
    },
    submitButton: {
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.dark.text,
        marginTop: 14,
    },
    btnText: {
        color: Colors.dark.header,
        fontSize: 16,
        fontWeight: '700',
    }
});

const inputStyle = StyleSheet.create({
    inputContainer: {
        gap: 4
    },
    placeHolderTitle: {
        fontSize: 13,
        color: Colors.dark.titleText,
        fontWeight: '500',
    }
})