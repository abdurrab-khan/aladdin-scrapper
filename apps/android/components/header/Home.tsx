import { Colors } from '@/constants/Colors';
import useAppContext from '@/context/AppContext';
import useFetchProducts from '@/hooks/useFetchProducts';
import { getProductCategories } from '@/lib/actions/product';
import { LinearGradient } from 'expo-linear-gradient';
import debounce from 'lodash/debounce';
import React, { useCallback, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

interface HomeProps {
    query: string;
    category: string;
    setQuery: React.Dispatch<React.SetStateAction<string>>;
    setCategory: React.Dispatch<React.SetStateAction<string>>;
}

export default function Home({ category, query, setQuery, setCategory }: HomeProps) {
    const [categories, setCategories] = React.useState<string[]>([]);

    const { app, insertProducts } = useAppContext();
    const { isLoading, fetchProduct } = useFetchProducts();

    const searchByDebounce = useCallback(debounce(async (text: string) => {
        const products = await fetchProduct(
            0,
            9,
            false,
            text.length > 0 ? text : null,
            category === 'All' ? null : category
        );
        insertProducts(products);
    }, 500), []);

    const changeCategoryByDebounce = useCallback(debounce(async (cat: string) => {
        const products = await fetchProduct(
            0,
            9,
            false,
            query.length > 0 ? query : null,
            cat === 'All' ? null : cat
        );
        insertProducts(products);
    }, 500), [query, fetchProduct, insertProducts]);

    const handleSearchChange = (text: string) => {
        setQuery(text);
        searchByDebounce(text);
    }

    const handleCategoryChange = useCallback(async (cat: string) => {
        if (cat === category || isLoading) return;
        setCategory(cat);
        changeCategoryByDebounce(cat);
    }, [category, changeCategoryByDebounce, isLoading, setCategory]);

    useEffect(() => {
        if (!app) return;

        getProductCategories(app.id).then((cats) => {
            setCategories(['All', ...cats]);
        }).catch((err) => {
            console.error("Error fetching categories:", err);
        });
    }, [app]);

    return (
        <View style={homeStyle.main}>
            {/* Input field to search the product */}
            <TextInput
                value={query}
                inputMode='search'
                textContentType='name'
                style={homeStyle.input}
                keyboardType='ascii-capable'
                placeholder='Search Product'
                selectionColor={"#3da3ff"}
                placeholderTextColor={"#e0e3e79c"}
                onChangeText={handleSearchChange}
            />

            {/* Product Product based on category */}
            <ScrollView
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={homeStyle.categoryContainer}
            >
                {categories.map((cat) => (
                    <Pressable
                        key={cat}
                        disabled={isLoading}
                        onPress={() => handleCategoryChange(cat)}
                    >
                        <LinearGradient
                            start={{ x: 1, y: 0 }}
                            style={[homeStyle.categoryBadge]}
                            colors={cat === category ? ["#304bd6ff", "#0f28a577"] : ["#060B13", "#111C2F"]}
                        >
                            <Text style={homeStyle.categoryText}>
                                {cat}
                            </Text>
                        </LinearGradient>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    )
}

const homeStyle = StyleSheet.create({
    main: {
        gap: 12,
        padding: 8,
        width: '100%',
        alignItems: 'flex-start',
        flexDirection: 'column',
        backgroundColor: Colors.dark.background,
    },
    input: {
        height: 44,
        width: "100%",
        borderWidth: 1,
        color: "#ffffff",
        borderRadius: 9999,
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: Colors.dark.header,
        borderColor: Colors.dark.borderColor,
    },
    categoryContainer: {
        gap: 12,
        flexDirection: 'row',
    },
    categoryBadge: {
        borderWidth: 0.5,
        paddingVertical: 8,
        borderRadius: 9999,
        paddingHorizontal: 18,
        borderColor: "#9AAAFC",
    },
    categoryText: {
        color: "white",
        fontSize: 14,
        fontWeight: '500',
    }
});