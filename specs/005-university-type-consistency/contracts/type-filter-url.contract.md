# Contract: Type Filter URL Parameter

**Applies to**: `/universities` (directory). Links are produced by the footer, home page, majors explorer "View in Directory", and any future surface.

## Canonical form

```text
/universities?type=<TYPES>
TYPES := TYPE ("," TYPE)*
TYPE  := "PUBLIC" | "PRIVATE" | "NATIONAL" | "INTERNATIONAL"
```

- Producers MUST build the value with `toTypeParam()` and MUST NOT hand-write values.
- Values are ordered in display order with no duplicates.

## Accepted input (backward compatibility)

The directory MUST accept and normalise with `normalizeTypeParam()`:

| Incoming | Treated as |
|---|---|
| `?type=National` (existing home link) | `NATIONAL` |
| `?type=private` | `PRIVATE` |
| `?type=أهلية` | `NATIONAL` |
| `?type=PRIVATE,TECHNOLOGICAL` | `PRIVATE` (unknown dropped, no error) |
| `?type=FOO` | no type filter (all institutions) |

The directory does not rewrite the URL on load. It rewrites the URL only when the user changes filters, and it always writes the canonical form.

## Directory behaviour

| ID | Condition | Required behaviour |
|---|---|---|
| U1 | Param resolves to ≥1 type with ≥1 institution | Those chips are selected, and results are institutions whose `type` is exactly one of them |
| U2 | User clicks a selected chip | That type is removed from the filter; the URL updates to canonical form (param removed when empty) |
| U3 | Param resolves only to types with 0 institutions | Bilingual empty state: EN "No {label} universities are listed yet." / AR "لا توجد جامعات {label} مدرجة حالياً." with a "View all universities / عرض كل الجامعات" action that clears the type filter |
| U4 | Chip rendering | One chip per type from `countByType(catalog)`, zero-count types hidden, label via module, count shown |
| U5 | Language switch | Filter state is unchanged; chip labels and active-filter tags switch language |
| U6 | Multiple types selected | Results include institutions of any selected type, and each chip toggles independently |

## Producers to update

| File | Current | Canonical |
|---|---|---|
| `src/components/layout/Footer.tsx:86-104` | `PUBLIC`, `PRIVATE`, `NATIONAL`, `INTERNATIONAL` | Unchanged values, built via `toTypeParam` |
| `src/app/(marketing)/MarketingHomeClient.tsx:710` | `National` | `NATIONAL` |
