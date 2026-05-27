import { Colors } from "@/constants/Colors";
import useAppContext from "@/context/AppContext";
import { useProductCategoriesQuery } from "@/api/hooks/useProductCategoriesQuery";
import { useProductStore } from "@/store/useProductStore";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Home() {
  const { app } = useAppContext();
  const { data: rawCategories } = useProductCategoriesQuery(app?.id);
  const { searchQuery, currentCategory, setSearchQuery, setCategory } = useProductStore();

  const categories = useMemo(
    () => ["All", ...(rawCategories || [])],
    [rawCategories]
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const handleCategoryChange = useCallback(
    (cat: string) => {
      setCategory(cat);
    },
    [setCategory]
  );

  return (
    <View style={homeStyle.main}>
      {/* Input field to search the product */}
      <TextInput
        value={searchQuery}
        inputMode="search"
        textContentType="name"
        style={homeStyle.input}
        keyboardType="ascii-capable"
        placeholder="Search Product"
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
          <Pressable key={cat} onPress={() => handleCategoryChange(cat)}>
            <LinearGradient
              start={{ x: 1, y: 0 }}
              style={[homeStyle.categoryBadge]}
              colors={
                cat === currentCategory
                  ? ["#304bd6ff", "#0f28a577"]
                  : ["#060B13", "#111C2F"]
              }
            >
              <Text style={homeStyle.categoryText}>{cat}</Text>
            </LinearGradient>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const homeStyle = StyleSheet.create({
  main: {
    gap: 12,
    padding: 8,
    width: "100%",
    alignItems: "flex-start",
    flexDirection: "column",
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
    flexDirection: "row",
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
    fontWeight: "500",
  },
});
