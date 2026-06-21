import {
  useScrapeCategoriesQuery,
  useScrapeMutation,
} from "@/api/hooks/useScrape";
import React, { useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  ActivityIndicator,
  Switch,
} from "react-native";
import Slider from "@react-native-community/slider";
import { LinearGradient } from "expo-linear-gradient";
import { Colors, LIGHT_GRADIENT_BUTTON } from "@/constants/Colors";
import Modal from "../ui/Modal";
import CSlider from "../ui/Slider";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const filterSchema = z.object({
  available: z.boolean().optional().default(false),
  rating: z.coerce.number().min(0).max(5).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  maxDiscount: z.coerce.number().min(0).optional(),
  maxBrandDiscount: z.coerce.number().min(0).optional(),
  maxDiscountForFullPageScreenshot: z.coerce.number().min(0).optional(),
});

const scrapeFormSchema = z.object({
  category: z.string().min(1, "Category is required"),
  subCategoryName: z.string().min(1, "Sub-category is required"),
  websites: z.array(z.string()).min(1, "Select at least one website"),
  maxProducts: z.coerce.number().min(1).default(10),
  filters: filterSchema.optional(),
});

type ScrapeFormValues = z.infer<typeof scrapeFormSchema>;

interface ScrapeDialogProps {
  visible: boolean;
  onToggleVisible: (visible: boolean) => void;
}

export default function ScrapeDialog({
  visible,
  onToggleVisible,
}: ScrapeDialogProps) {
  const { data: categories, isLoading: isLoadingCats } =
    useScrapeCategoriesQuery();
  const { mutate: startScrape, isPending: isScraping } = useScrapeMutation();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ScrapeFormValues>({
    resolver: zodResolver(scrapeFormSchema) as any,
    defaultValues: {
      category: "",
      subCategoryName: "",
      websites: [],
      maxProducts: 10,
      filters: {
        rating: 4,
        available: true,
        minPrice: 150,
        maxPrice: 600,
        maxDiscount: 50,
        maxBrandDiscount: 70,
        maxDiscountForFullPageScreenshot: 50,
      },
    },
  });

  const selectedCategory = watch("category");
  const selectedSubCategory = watch("subCategoryName");
  const selectedWebsites = watch("websites");

  const currentCategory = categories?.find((c) => c.id === selectedCategory);
  const subCategories = currentCategory?.subCategories || [];
  const currentSubCat = subCategories.find(
    (s) => s.name === selectedSubCategory,
  );

  // Clear subcategory if category changes
  useEffect(() => {
    if (selectedCategory) {
      setValue("subCategoryName", "");
      setValue("websites", []);
    }
  }, [selectedCategory, setValue]);

  const handleStartScrape = (data: ScrapeFormValues) => {
    // Clean up empty filters
    const cleanedFilters: any = {};
    if (data.filters) {
      Object.entries(data.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && (value as any) !== "") {
          cleanedFilters[key] = value;
        }
      });
    }

    startScrape(
      {
        category: data.category,
        subCategoryName: data.subCategoryName,
        websites: data.websites as any,
        maxProducts: data.maxProducts,
        filters:
          Object.keys(cleanedFilters).length > 0 ? cleanedFilters : undefined,
      },
      {
        onSuccess: () => {
          onToggleVisible(false);
          reset();
        },
      },
    );
  };

  const toggleWebsite = (site: string) => {
    const current = selectedWebsites || [];
    if (current.includes(site)) {
      setValue(
        "websites",
        current.filter((s) => s !== site),
      );
    } else {
      setValue("websites", [...current, site]);
    }
  };

  if (isLoadingCats) {
    return (
      <Modal isVisible={visible} onToggle={onToggleVisible}>
        <View
          style={[styles.container, { height: 200, justifyContent: "center" }]}
        >
          <ActivityIndicator size="large" color={Colors.dark.tint} />
        </View>
      </Modal>
    );
  }

  const gradientColors: [string, string, ...string[]] =
    LIGHT_GRADIENT_BUTTON && LIGHT_GRADIENT_BUTTON.length >= 2
      ? (LIGHT_GRADIENT_BUTTON as [string, string, ...string[]])
      : ["#1d4b88", "#2b6da0"];

  return (
    <Modal isVisible={visible} onToggle={onToggleVisible}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={[styles.label, { fontSize: 22 }]}>Category</Text>
        </View>

        <View style={styles.chipContainer}>
          {categories?.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.chip,
                selectedCategory === cat.id && styles.selectedChip,
              ]}
              onPress={() => setValue("category", cat.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedCategory === cat.id && styles.selectedChipText,
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.category && (
          <Text style={styles.errorText}>{errors.category.message}</Text>
        )}

        <Text style={styles.label}>Sub-Category</Text>
        <View style={styles.chipContainer}>
          {subCategories.map((sub) => (
            <TouchableOpacity
              key={sub.name}
              style={[
                styles.chip,
                selectedSubCategory === sub.name && styles.selectedChip,
              ]}
              onPress={() => setValue("subCategoryName", sub.name)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedSubCategory === sub.name && styles.selectedChipText,
                ]}
              >
                {sub.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {errors.subCategoryName && (
          <Text style={styles.errorText}>{errors.subCategoryName.message}</Text>
        )}

        {currentSubCat && (
          <>
            <Text style={styles.label}>Websites</Text>
            <View style={styles.chipContainer}>
              {currentSubCat.websites.map((site) => (
                <TouchableOpacity
                  key={site}
                  style={[
                    styles.chip,
                    selectedWebsites.includes(site) && styles.selectedChip,
                  ]}
                  onPress={() => toggleWebsite(site)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedWebsites.includes(site) &&
                        styles.selectedChipText,
                    ]}
                  >
                    {site.charAt(0).toUpperCase() + site.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.websites && (
              <Text style={styles.errorText}>{errors.websites.message}</Text>
            )}
          </>
        )}

        <View style={styles.inputRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>
              Max Products: {watch("maxProducts")}
            </Text>
            <Controller
              control={control}
              name="maxProducts"
              render={({ field: { onChange, value } }) => (
                <Slider
                  style={{ width: "100%", height: 40 }}
                  minimumValue={1}
                  maximumValue={50}
                  step={1}
                  value={value || 10}
                  onValueChange={onChange}
                  minimumTrackTintColor={Colors.dark.tint}
                  maximumTrackTintColor="#1a3a4a"
                  thumbTintColor={Colors.dark.tint}
                />
              )}
            />
          </View>
        </View>

        <View style={styles.divider} />

        <View style={{ rowGap: 16 }}>
          <Controller
            control={control}
            name="filters.minPrice"
            render={({ field: { value, onChange } }) => (
              <CSlider
                value={value}
                step={50}
                maximumValue={10000}
                onValueChange={onChange}
                label={`Min Price: ₹${value}`}
              />
            )}
          />

          <Controller
            control={control}
            name="filters.maxPrice"
            render={({ field: { value, onChange } }) => (
              <CSlider
                value={value}
                step={50}
                maximumValue={10000}
                onValueChange={onChange}
                label={`Max Price: ₹${value}`}
              />
            )}
          />

          <Controller
            control={control}
            name="filters.rating"
            render={({ field: { value, onChange } }) => (
              <CSlider
                value={value}
                step={1}
                minimumValue={1}
                maximumValue={5}
                onValueChange={onChange}
                label={`Min Rating: ${"⭐".repeat(Number(value ?? 0))}`}
              />
            )}
          />

          <Controller
            control={control}
            name="filters.maxDiscount"
            render={({ field: { value, onChange } }) => (
              <CSlider
                value={value}
                maximumValue={90}
                onValueChange={onChange}
                label={`Min Discount: ${value}%`}
              />
            )}
          />

          <Controller
            control={control}
            name="filters.maxBrandDiscount"
            render={({ field: { value, onChange } }) => (
              <CSlider
                value={value}
                onValueChange={onChange}
                label={`Min Brand Disc: ${value}%`}
              />
            )}
          />

          <Controller
            control={control}
            name="filters.maxDiscountForFullPageScreenshot"
            render={({ field: { value, onChange } }) => (
              <CSlider
                value={value}
                onValueChange={onChange}
                label={`Screenshot Disc: ${value}%`}
              />
            )}
          />
        </View>

        <View
          style={[
            styles.filterItem,
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 12,
              marginBottom: 12,
            },
          ]}
        >
          <Text style={styles.filterLabel}>Only Available</Text>
          <Controller
            control={control}
            name="filters.available"
            render={({ field: { onChange, value } }) => (
              <Switch
                value={value}
                onValueChange={onChange}
                trackColor={{ false: "#1a3a4a", true: Colors.dark.tint }}
                thumbColor={value ? "white" : "#ccc"}
              />
            )}
          />
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={handleSubmit(handleStartScrape)}
          disabled={isScraping}
        >
          <LinearGradient colors={gradientColors} style={styles.gradient}>
            {isScraping ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.startButtonText}>Start Scrape</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  label: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#1a3a4a",
    borderWidth: 1,
    borderColor: "#2a4a5a",
  },
  selectedChip: {
    backgroundColor: "#2a4a5a",
    borderColor: "gray",
  },
  chipText: {
    color: "#ccc",
    fontSize: 14,
  },
  selectedChipText: {
    color: "white",
    fontWeight: "bold",
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-end",
  },
  input: {
    backgroundColor: "#1a3a4a",
    borderRadius: 8,
    padding: 12,
    color: "white",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#2a4a5a",
  },
  infoBox: {
    backgroundColor: "#0d2a3a",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1d4b88",
    minWidth: 120,
  },
  infoTitle: {
    color: "#1d4b88",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  infoText: {
    color: "#aaa",
    fontSize: 12,
  },
  startButton: {
    borderRadius: 8,
    overflow: "hidden",
  },
  gradient: {
    paddingBlock: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  startButtonText: {
    fontSize: 16,
    color: "#85e2ff",
    fontWeight: 600,
  },
  divider: {
    height: 1,
    backgroundColor: "#2a4a5a",
    marginVertical: 20,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginTop: 4,
  },
  filterGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    color: "#aaa",
    fontSize: 12,
    marginBottom: 4,
  },
  smallInput: {
    backgroundColor: "#1a3a4a",
    borderRadius: 8,
    padding: 8,
    color: "white",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#2a4a5a",
  },
});
