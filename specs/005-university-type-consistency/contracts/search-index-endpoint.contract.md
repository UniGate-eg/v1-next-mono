# Contract: Search Index Endpoint

**Purpose**: one fresh catalog for every client surface (FR-015). It replaces client fetches of the static `public/search-index.json`.

## Request

```http
GET /api/universities/search-index
```

No parameters and no authentication, since the data is public and published-only.

## Response

`200 OK`, `Content-Type: application/json`

Body: `SlimSearchToken[]`, the exact shape returned by `universityRepository.findForSearch()` today (published institutions only), with `type: UniversityType` guaranteed valid.

`500` with `{ "error": "Failed to load universities" }` if the repository throws. The client hook surfaces this as `error`, the same as today.

## Caching and freshness

| Aspect | Value |
|---|---|
| Server data cache | `unstable_cache(findForSearch, ["search-index"], { revalidate: 3600, tags: ["universities", "universities-list", "search-index"] })` |
| Invalidated by | `CacheInvalidator.invalidateUniversity/invalidateGlobalLists` (admin edits: `universities-list`, `search-index`); `NextCacheInvalidationService.invalidateCatalogCaches` (ETL reset: `universities`) |
| Upper staleness bound | 3600 s (SC-007) |

## Consumers

| Consumer | Change |
|---|---|
| `src/hooks/useUniversitySearch.ts` | `fetch("/search-index.json")` → `fetch("/api/universities/search-index")` |
| `src/app/compare/page.tsx`, `src/app/dashboard/page.tsx` | No code change; they benefit through the hook |
| Server pages (`/`, `/universities`, `/majors`) | Unchanged. They still read the repository first and fall back to `public/search-index.json` only if the DB fails |
