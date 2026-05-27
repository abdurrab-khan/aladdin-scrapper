import { Colors, LIGHT_GRADIENT_BUTTON } from '@/constants/Colors';
import { useScrapeCategoriesQuery, useScrapeMutation } from '@/api/hooks/useScrape';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import ModalContainer from './ModalContainer';
import { LinearGradient } from 'expo-linear-gradient';

interface ScrapeDialogProps {
    visible: boolean;
    setVisible: (visible: boolean) => void;
}

export default function ScrapeDialog({ visible, setVisible }: ScrapeDialogProps) {
    const { data: categories, isLoading: isLoadingCats } = useScrapeCategoriesQuery();
    const { mutate: startScrape, isPending: isScraping } = useScrapeMutation();

    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedSubCategory, setSelectedSubCategory] = useState<string>('');
    const [selectedWebsites, setSelectedWebsites] = useState<string[]>(['amazon', 'flipkart']);
    const [maxProducts, setMaxProducts] = useState<string>('10');

    const subCategories = categories?.find(c => c.id === selectedCategory)?.subCategories || [];

    useEffect(() => {
        if (categories && categories.length > 0 && !selectedCategory) {
            setSelectedCategory(categories[0].id);
        }
    }, [categories]);

    useEffect(() => {
        if (subCategories.length > 0) {
            setSelectedSubCategory(subCategories[0]);
        }
    }, [selectedCategory, subCategories]);

    const toggleWebsite = (site: string) => {
        if (selectedWebsites.includes(site)) {
            setSelectedWebsites(selectedWebsites.filter(s => s !== site));
        } else {
            setSelectedWebsites([...selectedWebsites, site]);
        }
    };

    const handleStartScrape = () => {
        if (!selectedCategory || !selectedSubCategory || selectedWebsites.length === 0) return;

        startScrape({
            category: selectedCategory,
            subCategoryName: selectedSubCategory,
            websites: selectedWebsites as any,
            maxProducts: parseInt(maxProducts) || 10
        }, {
            onSuccess: () => setVisible(false)
        });
    };

    return (
        <ModalContainer visible={visible} setVisible={setVisible} title="New Scrape Job">
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.chipContainer}>
                    {categories?.map((cat) => (
                        <TouchableOpacity
                            key={cat.id}
                            style={[styles.chip, selectedCategory === cat.id && styles.selectedChip]}
                            onPress={() => setSelectedCategory(cat.id)}
                        >
                            <Text style={[styles.chipText, selectedCategory === cat.id && styles.selectedChipText]}>
                                {cat.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Sub-Category</Text>
                <View style={styles.chipContainer}>
                    {subCategories.map((sub) => (
                        <TouchableOpacity
                            key={sub}
                            style={[styles.chip, selectedSubCategory === sub && styles.selectedChip]}
                            onPress={() => setSelectedSubCategory(sub)}
                        >
                            <Text style={[styles.chipText, selectedSubCategory === sub && styles.selectedChipText]}>
                                {sub}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Websites</Text>
                <View style={styles.chipContainer}>
                    {['amazon', 'flipkart'].map((site) => (
                        <TouchableOpacity
                            key={site}
                            style={[styles.chip, selectedWebsites.includes(site) && styles.selectedChip]}
                            onPress={() => toggleWebsite(site)}
                        >
                            <Text style={[styles.chipText, selectedWebsites.includes(site) && styles.selectedChipText]}>
                                {site.charAt(0).toUpperCase() + site.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>Max Products</Text>
                <TextInput
                    style={styles.input}
                    value={maxProducts}
                    onChangeText={setMaxProducts}
                    keyboardType="numeric"
                    placeholder="10"
                    placeholderTextColor="gray"
                />

                <TouchableOpacity
                    style={styles.startButton}
                    onPress={handleStartScrape}
                    disabled={isScraping || selectedWebsites.length === 0}
                >
                    <LinearGradient
                        colors={LIGHT_GRADIENT_BUTTON}
                        style={styles.gradient}
                    >
                        {isScraping ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text style={styles.startButtonText}>Start Scrape</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </ScrollView>
        </ModalContainer>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 20,
    },
    label: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#1a3a4a',
        borderWidth: 1,
        borderColor: '#2a4a5a',
    },
    selectedChip: {
        backgroundColor: Colors.dark.tint,
        borderColor: Colors.dark.tint,
    },
    chipText: {
        color: '#ccc',
        fontSize: 14,
    },
    selectedChipText: {
        color: 'white',
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: '#1a3a4a',
        borderRadius: 8,
        padding: 12,
        color: 'white',
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#2a4a5a',
    },
    startButton: {
        marginTop: 24,
        borderRadius: 12,
        overflow: 'hidden',
    },
    gradient: {
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    startButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
