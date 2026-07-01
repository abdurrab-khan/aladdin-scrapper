import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Alert,
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { IconSymbol } from "@/components/ui/IconSymbol";

import toast from "@/utils";

import { supabase } from "@/api/clients/supabase";
import queryClient from "@/api/clients/queryClient";
import {
  deleteAffiliateLink,
  setDefaultAffiliateLink,
} from "@/api/services/affiliate";

import { Affiliate } from "@/types/product";
import { Colors } from "@/constants/Colors";

interface AffiliatesProps {
  productId: string;
  isGrouped: boolean;
  groupedAffiliateUrls: Affiliate[];
  setGroupedAffiliateUrls: React.Dispatch<React.SetStateAction<Affiliate[]>>;
}

const SkeletonItem = () => {
  const opacity = useRef(new Animated.Value(0.3));

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity.current, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity.current, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, []);

  return (
    <Animated.View style={[styles.linkItem, { opacity: opacity.current }]}>
      <View style={{ flex: 1, marginRight: 8, gap: 8 }}>
        <View
          style={{
            height: 14,
            width: "70%",
            borderRadius: 4,
            backgroundColor: "rgba(255,255,255,0.12)",
          }}
        />
        <View
          style={{
            height: 11,
            width: "40%",
            borderRadius: 4,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />
      </View>
      <View style={[styles.linkActions, { alignItems: "center" }]}>
        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />
      </View>
    </Animated.View>
  );
};

function Affiliates({
  productId,
  isGrouped,
  groupedAffiliateUrls,
  setGroupedAffiliateUrls,
}: AffiliatesProps) {
  const { data: affiliateUrls, isLoading } = useQuery({
    queryKey: ["affiliateUrls", productId],
    queryFn: async () => {
      const affiliateUrls = await supabase
        .from("affiliate_urls")
        .select("*")
        .eq("product_id", productId)
        .order("created_at");

      return affiliateUrls?.data ?? [];
    },
    select: (data: any) =>
      data.map((au: any) => ({
        id: au.affiliate_id,
        url: au.affiliate_url,
        productId: au.product_id,
        createdAt: au.created_at,
        isDefault: au.is_default,
      })) as Affiliate[],
    enabled: !!productId && !isGrouped,
  });

  const validAffiliateUrls = affiliateUrls || groupedAffiliateUrls;

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
              if (isGrouped) {
                const updatedGroupedAffiliateUrls = groupedAffiliateUrls.filter(
                  (au) => au.id !== affiliateId,
                );
                setGroupedAffiliateUrls(updatedGroupedAffiliateUrls);

                // All existing affiliate links.
                const existingAffiliateUrls = JSON.parse(
                  (await AsyncStorage.getItem("grouped_affiliate_urls")) ??
                    "{}",
                );

                await AsyncStorage.setItem(
                  "grouped_affiliate_urls",
                  JSON.stringify({
                    ...existingAffiliateUrls,
                    [productId]: updatedGroupedAffiliateUrls,
                  }),
                );
              } else {
                await deleteAffiliateLink(affiliateId);
                // Remove the deleted link from the cache
                queryClient.invalidateQueries({
                  queryKey: ["affiliateUrls", productId],
                });
              }

              toast("Link deleted successfully");
            } catch (e) {
              toast((e as Error).message);
            }
          },
        },
      ],
    );
  };

  const handleSetDefault = async (affiliateId: string) => {
    try {
      if (isGrouped) {
        // Updating the grouped affiliate URLs in state and AsyncStorage
        const updatedGroupedAffiliateUrls = groupedAffiliateUrls.map((au) =>
          au.id === affiliateId
            ? { ...au, isDefault: true }
            : {
                ...au,
                isDefault: false,
              },
        );
        setGroupedAffiliateUrls(updatedGroupedAffiliateUrls);

        // All existing affiliate links
        const existingAffiliateUrls = JSON.parse(
          (await AsyncStorage.getItem("grouped_affiliate_urls")) ?? "{}",
        );

        await AsyncStorage.setItem(
          "grouped_affiliate_urls",
          JSON.stringify({
            ...existingAffiliateUrls,
            [productId]: updatedGroupedAffiliateUrls,
          }),
        );
      } else {
        await setDefaultAffiliateLink(affiliateId, productId);
        // Invalidate the query to trigger a refetch of the affiliate links
        queryClient.invalidateQueries({
          queryKey: ["affiliateUrls", productId],
        });
      }

      toast("Default link updated");
    } catch (e) {
      toast((e as Error).message);
    }
  };

  const renderLinkItem = ({ item }: { item: Affiliate }) => (
    <View style={styles.linkItem}>
      <View style={{ flex: 1, marginRight: 8 }}>
        <Text style={styles.linkUrl} numberOfLines={1} ellipsizeMode="middle">
          {item.url}
        </Text>
        <Text style={styles.linkDate}>
          {new Date(item.createdAt).toLocaleDateString()} •{" "}
          {new Date(item.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
      <View style={styles.linkActions}>
        <TouchableOpacity
          onPress={() => handleSetDefault(item.id)}
          style={styles.actionIconButton}
        >
          <IconSymbol
            name={item.isDefault ? "checkmark-circle" : "ellipse-outline"}
            size={20}
            color={item.isDefault ? "#4CAF50" : Colors.dark.text}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDeleteLink(item.id)}
          style={styles.actionIconButton}
        >
          <IconSymbol name="trash-outline" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.linksSection}>
      <Text style={styles.sectionTitle}>
        Existing Links ({validAffiliateUrls?.length ?? 0})
      </Text>
      {isLoading ? (
        <View style={{ gap: 8 }}>
          <SkeletonItem />
          <SkeletonItem />
          <SkeletonItem />
        </View>
      ) : validAffiliateUrls && validAffiliateUrls?.length > 0 ? (
        <FlatList
          data={affiliateUrls || groupedAffiliateUrls}
          renderItem={renderLinkItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No affiliate links found</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  linksSection: {
    gap: 8,
    maxHeight: 172,
  },
  sectionTitle: {
    fontSize: 13,
    color: Colors.dark.titleText,
    fontWeight: "600",
    opacity: 0.7,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  linkItem: {
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "space-between",
  },
  linkUrl: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: "500",
  },
  linkDate: {
    color: Colors.dark.text,
    fontSize: 11,
    opacity: 0.5,
    marginTop: 4,
  },
  linkActions: {
    flexDirection: "row",
    gap: 4,
  },
  actionIconButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  emptyText: {
    color: Colors.dark.text,
    opacity: 0.4,
    fontSize: 14,
    fontStyle: "italic",
  },
});

export default Affiliates;
