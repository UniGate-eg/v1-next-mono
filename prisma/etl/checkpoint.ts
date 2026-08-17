import * as fs from "fs";
import * as path from "path";

const CHECKPOINT_FILE = path.join(process.cwd(), "prisma", "etl", ".etl-checkpoint.json");

interface CheckpointState {
  processedSlugs: string[];
  lastRun: string | null;
}

export class CheckpointManager {
  private state: CheckpointState;

  constructor() {
    this.state = this.loadState();
  }

  private loadState(): CheckpointState {
    if (fs.existsSync(CHECKPOINT_FILE)) {
      try {
        const data = fs.readFileSync(CHECKPOINT_FILE, "utf8");
        return JSON.parse(data);
      } catch (err) {
        console.error("Failed to parse checkpoint file, starting fresh.");
      }
    }
    return { processedSlugs: [], lastRun: null };
  }

  private saveState() {
    fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(this.state, null, 2), "utf8");
  }

  public isProcessed(slug: string): boolean {
    return this.state.processedSlugs.includes(slug);
  }

  public markProcessed(slug: string) {
    if (!this.isProcessed(slug)) {
      this.state.processedSlugs.push(slug);
      this.state.lastRun = new Date().toISOString();
      this.saveState();
    }
  }

  public reset() {
    this.state = { processedSlugs: [], lastRun: null };
    if (fs.existsSync(CHECKPOINT_FILE)) {
      fs.unlinkSync(CHECKPOINT_FILE);
    }
  }
}
