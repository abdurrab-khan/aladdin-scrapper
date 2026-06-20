import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");

interface CaptionDetails {
  ids: string[];
  caption: string;
  platforms: string[];
  tags?: string;
  productUrls: string[];
  productImage: string; // This will be the public URL after upload
}

serve(async (req) => {
  try {
    const productDetails: CaptionDetails = await req.json();
    const { caption, tags, platforms, productImage } = productDetails;

    if (!platforms.includes("telegram")) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Telegram not selected, skipping.",
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 200,
        },
      );
    }

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error(
        "Telegram configuration missing in environment variables.",
      );
    }

    const fullCaption = `${caption}\n\n${tags || ""}`.trim();

    // Send to Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;

    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        photo: productImage,
        caption: fullCaption,
        parse_mode: "HTML",
      }),
    });

    const result = await response.json();

    if (!result.ok) {
      throw new Error(`Telegram API Error: ${result.description}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Successfully posted to Telegram",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 200,
      },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unknown error occurred while posting",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        status: 400,
      },
    );
  }
});
