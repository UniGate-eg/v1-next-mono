import { SearchIndexService } from "../src/server/services/SearchIndexService";
import { primary } from "../src/lib/prisma";

async function main() {
  try {
    await SearchIndexService.generateIndex();
    console.log("✅ Successfully generated public/search-index.json");
  } catch (error) {
    console.error("❌ Error generating search index:", error);
    process.exit(1);
  } finally {
    await primary.$disconnect();
  }
}

main();
