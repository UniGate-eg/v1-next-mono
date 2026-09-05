export interface SnapshotManifest {
  id: string;
  timestamp: string;
  filePath: string;
  recordCounts: {
    universities: number;
    faculties: number;
    degreePrograms: number;
    accreditations: number;
    bookmarks: number;
    suggestions: number;
  };
  sha256Checksum: string;
}

export interface ISnapshotManager {
  createSnapshot(): Promise<SnapshotManifest>;
  restoreSnapshot(snapshotId: string): Promise<{ success: boolean; message: string }>;
  listSnapshots(): Promise<SnapshotManifest[]>;
}
