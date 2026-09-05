import { PrismaClient } from "@prisma/client";
import { PostgresSnapshotManager } from "./PostgresSnapshotManager";

export class SnapshotRollbackService {
  private snapshotManager: PostgresSnapshotManager;

  constructor(prisma: PrismaClient) {
    this.snapshotManager = new PostgresSnapshotManager(prisma);
  }

  async executeRollback(snapshotId: string): Promise<{ success: boolean; message: string }> {
    console.log(`⚠️ Initiating Disaster Recovery Rollback to snapshot: ${snapshotId}...`);
    return this.snapshotManager.restoreSnapshot(snapshotId);
  }

  async listAvailableSnapshots() {
    return this.snapshotManager.listSnapshots();
  }
}
