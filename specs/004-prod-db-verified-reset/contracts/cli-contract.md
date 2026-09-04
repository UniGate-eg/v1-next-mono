# CLI Contract: Verified Database Reset & Ingestion Pipeline

**Command**: `npx tsx prisma/etl/reset-verified-catalog.ts`

## Options & Flags

| Flag | Type | Description | Default |
|:---|:---|:---|:---|
| `--dry-run` | boolean | Parses workbooks, validates schemas, and checks referential integrity without writing to DB | `false` |
| `--confirm-production` | boolean | Mandatory flag required when running against production environment | `false` |
| `--backup-only` | boolean | Creates pre-flight database snapshot and exits without performing reset | `false` |
| `--rollback <snapshotId>` | string | Restores database catalog from the specified pre-flight snapshot | `none` |
| `--skip-cache-invalidation`| boolean | Skips triggering Next.js ISR cache revalidation | `false` |

## Exit Codes

| Code | Meaning |
|:---|:---|
| `0` | Success: Pipeline completed all phases and verified post-ingestion state |
| `1` | Validation Error: Schema mismatch or referential integrity error in source files |
| `2` | Safety Check Failed: Production environment detected without `--confirm-production` |
| `3` | Transaction Aborted: Database error during atomic reset/ingestion; rollback completed |
| `4` | Snapshot Failure: Failed to generate pre-reset backup |

## JSON Output Protocol

When invoked with `--json`, output streams structured progress:
```json
{
  "timestamp": "2026-09-04T12:00:00.000Z",
  "phase": "INGESTION_COMPLETE",
  "metrics": {
    "universitiesIngested": 43,
    "facultiesIngested": 381,
    "programsIngested": 1448,
    "snapshotId": "snapshot-20260904-120000",
    "durationMs": 4250
  }
}
```
