import * as z from "zod";
import React, { RefObject, useRef } from "react";
import { Control, Controller, useController } from "react-hook-form";
import {
  Image,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";

import ProductPreview from "./ProductPreview";

import { SocialMedia } from "@/types";

import { Colors } from "@/constants/Colors";
import { CaptionDetailsSchema } from "@/api/schemas/caption.schema";

const platformImages: Record<SocialMedia, any> = {
  telegram: require("../../../../assets/images/icons/social-media/telegram.png"),
  instagram: require("../../../../assets/images/icons/social-media/instagram.png"),
  facebook: require("../../../../assets/images/icons/social-media/facebook.png"),
  x: require("../../../../assets/images/icons/social-media/x.png"),
};

interface ControlType {
  control: Control<z.infer<typeof CaptionDetailsSchema>>;
}

interface InputProps extends ControlType {
  label: string;
  name: keyof z.infer<typeof CaptionDetailsSchema>;
  style?: StyleProp<TextStyle>;
  [key: string]: any;
}

export interface PlatformViewProps {
  platform: SocialMedia;
  active: boolean;
  onPress: (platform: SocialMedia) => void;
}

const Input = ({ name, label, control, style, ...props }: InputProps) => {
  return (
    <View>
      <Text style={inputStyle.labelText}>{label}</Text>
      <Controller
        name={name}
        control={control}
        render={({
          field: { value, onChange, onBlur },
          formState: { errors },
        }) => (
          <React.Fragment>
            <TextInput
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              style={[
                inputStyle.inputText,
                style,
                { marginBottom: errors[name] ? 0 : 12 },
              ]}
              {...props}
            />
            {errors[name]?.message && (
              <Text
                style={[
                  inputStyle.errorText,
                  { marginBottom: errors[name] ? 12 : 0 },
                ]}
              >
                {errors[name]?.message.toString()}
              </Text>
            )}
          </React.Fragment>
        )}
      />
    </View>
  );
};

const PlatformSelector = ({ control }: ControlType) => {
  const {
    fieldState: { error },
    field: { value: selectedPlatforms, onChange },
  } = useController({
    control,
    name: "platforms",
  });

  const handleSelectPlatform = (platform: SocialMedia) => {
    if (selectedPlatforms.includes(platform)) {
      onChange(selectedPlatforms.filter((p) => p !== platform));
    } else {
      onChange([...selectedPlatforms, platform]);
    }
  };

  return (
    <View>
      <Text style={[inputStyle.labelText]}>Select Platforms</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[platformStyle.scrollView]}
      >
        {(["telegram", "facebook", "instagram", "x"] as SocialMedia[]).map(
          (platform) => {
            const active = selectedPlatforms.includes(platform);

            return (
              <TouchableOpacity
                key={platform}
                activeOpacity={0.7}
                style={[
                  platformStyle.platformView,
                  {
                    backgroundColor:
                      Colors.dark.header + (active ? "ff" : "99"),
                    opacity: !active ? 1 : 0.35,
                    marginBottom: error ? 0 : 16,
                  },
                ]}
                onPress={() => handleSelectPlatform(platform)}
              >
                <Image
                  source={
                    platformImages[platform as keyof typeof platformImages]
                  }
                  style={platformStyle.platformImage}
                  resizeMode="contain"
                />
                <Text style={platformStyle.platformName}>{platform}</Text>
              </TouchableOpacity>
            );
          },
        )}
      </ScrollView>
      {error && (
        <Text style={[inputStyle.errorText, { marginBottom: error ? 16 : 0 }]}>
          {error.message}
        </Text>
      )}
    </View>
  );
};

export default function CaptionEditorForm({
  images,
  control,
  captureRef,
}: ControlType & {
  images: { url: string; imageType: "full" | "group" | "card" }[];
  captureRef: RefObject<(() => Promise<string>) | null>;
}) {
  return (
    <View>
      <View style={styles.imgView}>
        <ProductPreview
          images={images}
          onCapture={(fn: () => Promise<string>) => (captureRef.current = fn)}
        />
      </View>
      <PlatformSelector control={control} />
      <Input
        name="caption"
        multiline
        control={control}
        numberOfLines={8}
        autoCorrect={true}
        textContentType="none"
        autoCapitalize="sentences"
        label="Add Caption"
        placeholder="Write your caption here..."
        placeholderTextColor={Colors.dark.text + "99"}
        style={{ height: 180, textAlignVertical: "top" }}
      />
      <Input
        name="tags"
        multiline
        control={control}
        numberOfLines={4}
        autoCorrect={false}
        autoCapitalize="none"
        textContentType="none"
        label="Tags (Optional)"
        placeholder="Add some tags..."
        placeholderTextColor={Colors.dark.text + "99"}
        style={{ height: 80, textAlignVertical: "top" }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  imgView: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    backgroundColor: Colors.dark.header,
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
  },
});

const inputStyle = StyleSheet.create({
  labelText: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.dark.text,
  },
  inputText: {
    width: "100%",
    color: "#bebebe",
    paddingLeft: 14,
    paddingRight: 14,
    fontSize: 14,
    borderRadius: 8,
    textAlignVertical: "top",
    backgroundColor: Colors.dark.header,
  },
  errorText: {
    color: "rgb(199, 40, 40)",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
});

const platformStyle = StyleSheet.create({
  scrollView: {
    gap: 12,
    flexDirection: "row",
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
    backgroundColor: Colors.dark.header,
  },
  platformImage: {
    width: 30,
    height: 30,
  },
  platformName: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: "500",
    textTransform: "capitalize",
  },
});
