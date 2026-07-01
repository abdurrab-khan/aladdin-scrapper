import zod from "zod";

export const CaptionDetailsSchema = zod.object({
  ids: zod.array(zod.string()).min(1, "At least one product ID is required"),
  caption: zod.string().min(1, "To Post, caption is required"),
  platforms: zod
    .array(zod.enum(["x", "facebook", "instagram", "telegram"]))
    .min(1, "At least one platform must be selected"),
  productUrls: zod
    .array(zod.url())
    .min(1, "At least one product URL is required"),
  tags: zod.string().optional(),
});

export type CaptionType = zod.infer<typeof CaptionDetailsSchema>;
