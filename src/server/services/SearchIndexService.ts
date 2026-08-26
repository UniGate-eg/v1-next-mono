import fs from "fs";
import path from "path";
import { universityRepository } from "../../lib/di";

export class SearchIndexService {
  private static get indexPath() {
    return path.join(process.cwd(), "public", "search-index.json");
  }

  static async generateIndex(repo = universityRepository): Promise<void> {
    console.log("Generating search index...");
    const tokens = await repo.findForSearch();
    
    // Ensure public directory exists
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(this.indexPath, JSON.stringify(tokens), "utf8");
    console.log(`Search index generated with ${tokens.length} entries at ${this.indexPath}`);
  }
}
