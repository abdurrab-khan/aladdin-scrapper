import manager from "./utils/catalogManager.js";
import { scrapeProducts } from "./crawler/scrapper.js";
import { randomDelay } from "./crawler/utils/utils.js";
import SupabaseClient from "./db/supabase.js";

async function main() {
  try {
    const selection = manager.run();
    const supabaseClient = SupabaseClient;

    for(const s of selection) {
      const products = await scrapeProducts(s);

      if(products && products.length > 0) {
          await supabaseClient.saveProducts(products); 
      }

      console.log(`\n🎉 Finished scraping for selection: ${s.category}\n`);

      // Adding a delay between different selections to avoid overwhelming the server
      await new Promise(res => setTimeout(res, randomDelay(120, 300))); // Delay between 2 to 5 minutes
    }

  } catch (error) {
    console.error("❌  Error in main:", (error as Error).message ?? error);
  }
}

main();
