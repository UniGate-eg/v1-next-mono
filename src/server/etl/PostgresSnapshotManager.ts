import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import { ISnapshotManager, SnapshotManifest } from "./interfaces/ISnapshotManager";

export class PostgresSnapshotManager implements ISnapshotManager {
  private backupBaseDir: string;

  constructor(private prisma: PrismaClient, backupDir?: string) {
    this.backupBaseDir = backupDir || path.join(process.cwd(), "backups");
    if (!fs.existsSync(this.backupBaseDir)) {
      fs.mkdirSync(this.backupBaseDir, { recursive: true });
    }
  }

  async createSnapshot(): Promise<SnapshotManifest> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const snapshotId = `snapshot-${timestamp}`;
    const snapshotDir = path.join(this.backupBaseDir, snapshotId);

    if (!fs.existsSync(snapshotDir)) {
      fs.mkdirSync(snapshotDir, { recursive: true });
    }

    console.log(`📦 Creating pre-reset snapshot in ${snapshotDir}...`);

    // Fetch existing records
    const [universities, faculties, degreePrograms, accreditations, bookmarks, suggestions] = await Promise.all([
      this.prisma.university.findMany(),
      this.prisma.faculty.findMany(),
      this.prisma.degreeProgram.findMany(),
      this.prisma.accreditation.findMany(),
      this.prisma.bookmark.findMany(),
      this.prisma.suggestion.findMany()
    ]);

    const snapshotData = {
      timestamp: new Date().toISOString(),
      universities,
      faculties,
      degreePrograms,
      accreditations,
      bookmarks,
      suggestions
    };

    const snapshotJson = JSON.stringify(snapshotData, null, 2);
    const dataFilePath = path.join(snapshotDir, "snapshot.json");
    fs.writeFileSync(dataFilePath, snapshotJson, "utf8");

    // Compute SHA-256 Checksum
    const hash = crypto.createHash("sha256").update(snapshotJson).digest("hex");

    const manifest: SnapshotManifest = {
      id: snapshotId,
      timestamp: new Date().toISOString(),
      filePath: dataFilePath,
      recordCounts: {
        universities: universities.length,
        faculties: faculties.length,
        degreePrograms: degreePrograms.length,
        accreditations: accreditations.length,
        bookmarks: bookmarks.length,
        suggestions: suggestions.length
      },
      sha256Checksum: hash
    };

    fs.writeFileSync(path.join(snapshotDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

    console.log(`✔ Snapshot created successfully: ${snapshotId} (${universities.length} universities, ${degreePrograms.length} programs)`);
    return manifest;
  }

  async listSnapshots(): Promise<SnapshotManifest[]> {
    if (!fs.existsSync(this.backupBaseDir)) return [];
    const entries = fs.readdirSync(this.backupBaseDir);
    const manifests: SnapshotManifest[] = [];

    for (const entry of entries) {
      const manifestPath = path.join(this.backupBaseDir, entry, "manifest.json");
      if (fs.existsSync(manifestPath)) {
        try {
          const content = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
          manifests.push(content);
        } catch {
          // ignore corrupted manifest
        }
      }
    }

    return manifests.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async restoreSnapshot(snapshotId: string): Promise<{ success: boolean; message: string }> {
    const snapshotDir = path.join(this.backupBaseDir, snapshotId);
    const dataFilePath = path.join(snapshotDir, "snapshot.json");
    const manifestPath = path.join(snapshotDir, "manifest.json");

    if (!fs.existsSync(dataFilePath) || !fs.existsSync(manifestPath)) {
      throw new Error(`Snapshot '${snapshotId}' not found in ${this.backupBaseDir}`);
    }

    const manifest: SnapshotManifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const rawData = fs.readFileSync(dataFilePath, "utf8");

    // Verify SHA-256 Checksum
    const hash = crypto.createHash("sha256").update(rawData).digest("hex");
    if (hash !== manifest.sha256Checksum) {
      throw new Error(`Snapshot integrity failure: checksum mismatch for ${snapshotId}`);
    }

    const data = JSON.parse(rawData);

    console.log(`🔄 Restoring ${manifest.recordCounts.universities} universities from ${snapshotId}...`);

    await this.prisma.$transaction(async (tx) => {
      // 1. Purge existing catalog data
      await tx.degreeProgram.deleteMany();
      await tx.faculty.deleteMany();
      await tx.accreditation.deleteMany();
      await tx.institutionAssignment.deleteMany();
      await tx.university.deleteMany();

      // 2. Re-insert universities
      if (data.universities && data.universities.length > 0) {
        await tx.university.createMany({ data: data.universities });
      }

      // 3. Re-insert faculties
      if (data.faculties && data.faculties.length > 0) {
        await tx.faculty.createMany({ data: data.faculties });
      }

      // 4. Re-insert degree programs
      if (data.degreePrograms && data.degreePrograms.length > 0) {
        await tx.degreeProgram.createMany({ data: data.degreePrograms });
      }

      // 5. Re-insert accreditations
      if (data.accreditations && data.accreditations.length > 0) {
        await tx.accreditation.createMany({ data: data.accreditations });
      }
    }, { timeout: 60000 });

    return {
      success: true,
      message: `Successfully restored ${manifest.recordCounts.universities} universities and ${manifest.recordCounts.degreePrograms} programs from ${snapshotId}`
    };
  }
}
