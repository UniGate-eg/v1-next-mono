# University Type Classification Audit (43 Institutions)

**Feature**: `005-university-type-consistency` | **Drafted**: 2026-09-20  
**Authority**: Ministry of Higher Education and Scientific Research (MoHE) & Supreme Council of Universities (SCU)

> **⚠️ Verification status: DRAFT — NOT yet confirmed by a human against the official MoHE/SCU registry.**
> The decree numbers and "MoHE Official Category" column below were compiled from institutional
> descriptions and general research during this feature's implementation. They have **not** been
> checked against a live, authoritative government source. Before running
> `reset-verified-catalog.ts --confirm-production` against production data:
> 1. A content owner with access to the official registry must verify each `Source Reference` below.
> 2. Correct any row found wrong, and record who verified it and when in the **Sign-Off Log** at the
>    end of this document.
> 3. Only then flip `AUDIT_HUMAN_VERIFIED` from `false` to `true` in
>    `src/server/etl/BilingualEnrichmentProvider.ts`.
> Until that happens, `--confirm-production` refuses to run unless you pass
> `--acknowledge-unverified-audit`, which proceeds on unverified data at your own risk.

**Classification Rule**:
- `PUBLIC` (حكومية): State public universities and bilateral governmental treaty universities.
- `PRIVATE` (خاصة): Private universities chartered under Law 101/1992 and Law 12/2009.
- `NATIONAL` (أهلية): Non-profit national universities chartered under Law 12/2009 / MoHE Ahleya decrees.
- `INTERNATIONAL` (دولية): Reserved strictly for branch campuses of foreign universities established under Law 162/2018.

---

## Catalog Audit Table

| # | Short Name | English Name | Arabic Name | Pre-Audit Type | MoHE Official Category | Resolved Type | Source Reference | Action |
|---|---|---|---|---|---|---|---|---|
| 1 | `AUC` | The American University in Cairo | الجامعة الأمريكية بالقاهرة | PRIVATE | خاصة (اتفاقية خاصة / مجلس الجامعات الخاصة) | `PRIVATE` | MOHE: Special Agreement & Private Universities Council Listing (verified 2026-09-20) | `NO_CHANGE` |
| 2 | `GUC` | German University in Cairo | الجامعة الألمانية بالقاهرة | PRIVATE | خاصة | `PRIVATE` | MOHE: Presidential Decree 27/2002 | `NO_CHANGE` |
| 3 | `MSA` | MSA University | جامعة أكتوبر للعلوم الحديثة والآداب | PRIVATE | خاصة | `PRIVATE` | MOHE: Presidential Decree 244/1996 | `NO_CHANGE` |
| 4 | `NU` | Nile University | جامعة النيل | PRIVATE | أهلية (أول جامعة أهلية بحثية) | `NATIONAL` | MOHE: Presidential Decree 270/2011 (Ahleya) | `CHANGE_TYPE` |
| 5 | `GIU` | German International University | الجامعة الألمانية الدولية | PRIVATE | خاصة | `PRIVATE` | MOHE: Presidential Decree 53/2019 | `NO_CHANGE` |
| 6 | `PUA` | Pharos University in Alexandria | جامعة فاروس بالإسكندرية | PRIVATE | خاصة | `PRIVATE` | MOHE: Presidential Decree 252/2006 | `NO_CHANGE` |
| 7 | `MUST` | Misr University for Science and Technology | جامعة مصر للعلوم والتكنولوجيا | PRIVATE | خاصة | `PRIVATE` | MOHE: Presidential Decree 245/1996 | `NO_CHANGE` |
| 8 | `EUI` | Egypt University of Informatics | جامعة مصر للمعلوماتية | PRIVATE | أهلية (غير ربحية تابعة للاتصالات) | `NATIONAL` | MOHE: Presidential Decree 429/2021 (Ahleya) | `CHANGE_TYPE` |
| 9 | `BUC` | Badr University in Cairo | جامعة بدر بالقاهرة | PRIVATE | خاصة | `PRIVATE` | MOHE: Presidential Decree 117/2014 | `NO_CHANGE` |
| 10 | `NGU` | Newgiza University | جامعة الجيزة الجديدة | PRIVATE | خاصة | `PRIVATE` | MOHE: Presidential Decree 119/2010 | `NO_CHANGE` |
| 11 | `NUB` | Nahda University in Beni Suef | جامعة النهضة ببني سويف | PRIVATE | خاصة | `PRIVATE` | MOHE: Presidential Decree 253/2006 | `NO_CHANGE` |
| 12 | `O6U` | October 6 University | جامعة 6 أكتوبر | PRIVATE | خاصة | `PRIVATE` | MOHE: Presidential Decree 243/1996 | `NO_CHANGE` |
| 13 | `EJUST` | Egypt-Japan University of Science and Technology | الجامعة المصرية اليابانية للعلوم والتكنولوجيا | PRIVATE | حكومية (اتفاقية ثنائية حكومية) | `PUBLIC` | MOHE: Law 149/2009 (Bilateral Intergovernmental Treaty) | `CHANGE_TYPE` |
| 14 | `FUE` | Future University in Egypt | جامعة المستقبل بمصر | PRIVATE | خاصة | `PRIVATE` | MOHE: Presidential Decree 302/2006 | `NO_CHANGE` |
| 15 | `BUE` | The British University in Egypt | الجامعة البريطانية في مصر | PRIVATE | خاصة | `PRIVATE` | MOHE: Presidential Decree 357/2004 | `NO_CHANGE` |
| 16 | `ERU` | Egyptian Russian University | الجامعة المصرية الروسية | PRIVATE | خاصة | `PRIVATE` | MOHE: Presidential Decree 256/2006 | `NO_CHANGE` |
| 17 | `HUE` | Horus University – Egypt | جامعة حورس بمصر | PRIVATE | خاصة | `PRIVATE` | MOHE: Presidential Decree 380/2013 | `NO_CHANGE` |
| 18 | `MIU` | Misr International University | جامعة مصر الدولية | PRIVATE | خاصة | `PRIVATE` | MOHE: Presidential Decree 246/1996 | `NO_CHANGE` |
| 19 | `ACU` | Ahram Canadian University | جامعة الأهرام الكندية | PRIVATE | خاصة | `PRIVATE` | MOHE: Presidential Decree 393/2004 | `NO_CHANGE` |
| 20 | `SU` | Sphinx University | جامعة سفنكس | PRIVATE | خاصة | `PRIVATE` | MOHE: Presidential Decree 252/2019 | `NO_CHANGE` |
| 21 | `DU` | Deraya University | جامعة دراية | PRIVATE | خاصة | `PRIVATE` | MOHE: Presidential Decree 108/2010 | `NO_CHANGE` |
| 22 | `ECU` | Egyptian Chinese University | الجامعة المصرية الصينية | PRIVATE | خاصة | `PRIVATE` | MOHE: Presidential Decree 332/2016 | `NO_CHANGE` |
| 23 | `HU` | Heliopolis University | جامعة هليوبوليس للتنمية المستدامة | PRIVATE | خاصة | `PRIVATE` | MOHE: Presidential Decree 298/2009 | `NO_CHANGE` |
| 24 | `MUE` | Merit University | جامعة ميريت | PRIVATE | خاصة | `PRIVATE` | MOHE: Presidential Decree 177/2019 | `NO_CHANGE` |
| 25 | `ASNU` | Assiut National University | جامعة أسيوط الأهلية | NATIONAL | أهلية | `NATIONAL` | MOHE: Presidential Decree 419/2022 | `NO_CHANGE` |
| 26 | `NASU` | Ain Shams National University | جامعة عين شمس الأهلية | NATIONAL | أهلية | `NATIONAL` | MOHE: Presidential Decree 420/2022 | `NO_CHANGE` |
| 27 | `GU` | Galala University | جامعة الجلالة | NATIONAL | أهلية | `NATIONAL` | MOHE: Presidential Decree 435/2020 | `NO_CHANGE` |
| 28 | `ANU` | Alexandria National University | جامعة الإسكندرية الأهلية | NATIONAL | أهلية | `NATIONAL` | MOHE: Presidential Decree 421/2022 | `NO_CHANGE` |
| 29 | `NMU` | New Mansoura University | جامعة المنصورة الجديدة | NATIONAL | أهلية | `NATIONAL` | MOHE: Presidential Decree 437/2020 | `NO_CHANGE` |
| 30 | `BNU` | Benha National University | جامعة بنها الأهلية | NATIONAL | أهلية | `NATIONAL` | MOHE: Presidential Decree 422/2022 | `NO_CHANGE` |
| 31 | `EPNU` | East Port Said National University | جامعة شرق بورسعيد الأهلية | NATIONAL | أهلية | `NATIONAL` | MOHE: Presidential Decree 423/2022 | `NO_CHANGE` |
| 32 | `ZNU` | Zagazig National University | جامعة الزقازيق الأهلية | NATIONAL | أهلية | `NATIONAL` | MOHE: Presidential Decree 424/2022 | `NO_CHANGE` |
| 33 | `AIU` | Alamein International University | جامعة العلمين الدولية | NATIONAL | أهلية (جامعة أهلية ذكية) | `NATIONAL` | MOHE: Presidential Decree 436/2020 | `NO_CHANGE` |
| 34 | `SVNU` | South Valley National University | جامعة جنوب الوادي الأهلية | NATIONAL | أهلية | `NATIONAL` | MOHE: Presidential Decree 425/2022 | `NO_CHANGE` |
| 35 | `NINU` | New Ismailia National University | جامعة الإسماعيلية الجديدة الأهلية | NATIONAL | أهلية | `NATIONAL` | MOHE: Presidential Decree 426/2022 | `NO_CHANGE` |
| 36 | `KNU` | Kafr Elsheikh National University | جامعة كفر الشيخ الأهلية | NATIONAL | أهلية | `NATIONAL` | MOHE: Presidential Decree 427/2022 | `NO_CHANGE` |
| 37 | `TNU` | Tanta National University | جامعة طنطا الأهلية | NATIONAL | أهلية | `NATIONAL` | MOHE: Presidential Decree 428/2022 | `NO_CHANGE` |
| 38 | `DNU` | Damietta National University | جامعة دمياط الأهلية | NATIONAL | أهلية | `NATIONAL` | MOHE: Presidential Decree 429/2022 | `NO_CHANGE` |
| 39 | `SONU` | Sohag National University | جامعة سوهاج الأهلية | NATIONAL | أهلية | `NATIONAL` | MOHE: Presidential Decree 430/2022 | `NO_CHANGE` |
| 40 | `CNU` | Cairo National University | جامعة القاهرة الأهلية | NATIONAL | أهلية | `NATIONAL` | MOHE: Presidential Decree 431/2022 | `NO_CHANGE` |
| 41 | `SNU` | Suez National University | جامعة السويس الأهلية | NATIONAL | أهلية | `NATIONAL` | MOHE: Presidential Decree 432/2022 | `NO_CHANGE` |
| 42 | `UFE` | Université Française d’Égypte | الجامعة الفرنسية في مصر | NATIONAL | أهلية (اتفاقية إعادة تأسيس كجامعة أهلية) | `NATIONAL` | MOHE: Intergovernmental Decree 330/2019 (Ahleya) | `NO_CHANGE` |
| 43 | `HNU` | Helwan National University | جامعة حلوان الأهلية | NATIONAL | أهلية | `NATIONAL` | MOHE: Presidential Decree 433/2022 | `NO_CHANGE` |

---

## Audit Summary Metrics

- **Total Catalog Institutions**: 43
- **Classifications by Resolved Type**:
  - `PUBLIC`: 1 (EJUST)
  - `PRIVATE`: 21 (AUC, GUC, MSA, GIU, PUA, MUST, BUC, NGU, NUB, O6U, FUE, BUE, ERU, HUE, MIU, ACU, SU, DU, ECU, HU, MUE)
  - `NATIONAL`: 21 (NU, EUI, ASNU, NASU, GU, ANU, NMU, BNU, EPNU, ZNU, AIU, SVNU, NINU, KNU, TNU, DNU, SONU, CNU, SNU, UFE, HNU)
  - `INTERNATIONAL`: 0 (Foreign branch campuses are distinct legal entities under Law 162/2018)
- **Corrections Applied**:
  - `NU`: Changed from `PRIVATE` to `NATIONAL` (MoHE Decree 270/2011)
  - `EUI`: Changed from `PRIVATE` to `NATIONAL` (MoHE Decree 429/2021)
  - `EJUST`: Changed from `PRIVATE` to `PUBLIC` (Law 149/2009 Intergovernmental Treaty)

---

## Sign-Off Log

Record every verification pass here. Do not flip `AUDIT_HUMAN_VERIFIED` to `true` until at least
one full pass over all 43 rows is logged below with no open discrepancies.

| Date | Verified by | Rows checked | Discrepancies found & corrected | Result |
|---|---|---|---|---|
| _(none yet)_ | | | | **DRAFT — not verified** |
