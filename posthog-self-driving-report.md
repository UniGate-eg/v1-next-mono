# PostHog Self-driving setup report

## Summary

PostHog Self-driving is configured for UniGate: Session Replay, Error Tracking, and Support are enabled, and the health, error, support, GitHub, Linear, and Sentry signal sources are armed as applicable. The GitHub Issues warehouse source now syncs the repository's `issues` table. Findings should start appearing in the [Self-driving inbox](https://eu.posthog.com/project/266074/inbox) within about 30 minutes.

## AI data processing

Approved by the wizard's organization-level gate.

## GitHub

Connected during this setup. The existing GitHub App integration was used to connect `UniGate-eg/v1-next-mono`; its Issues warehouse source is `01a06d97-c983-0000-bd4c-f9649c0d46e2` and the first sync started.

## Products enabled

| Product | Result | Notes |
| --- | --- | --- |
| Session Replay | Already enabled | Web client initialization was checked; it does not disable session recording. No recordings were available at setup time. |
| Error Tracking | Already enabled | Web client initialization has exception capture enabled. |
| Support (Conversations) | Enabled | Tickets will arrive only after an inbound email, inbox, or Slack channel is connected in PostHog. |

## Signal sources

| `source_product` | `source_type` | Action |
| --- | --- | --- |
| `signals_scout` | `cross_source_issue` | Enabled by the server default; no opt-out row was created. |
| `health_checks` | `health_issue` | Enabled. |
| `error_tracking` | `issue_created` | Enabled. |
| `error_tracking` | `issue_reopened` | Enabled. |
| `error_tracking` | `issue_spiking` | Enabled. |
| `conversations` | `ticket` | Enabled. |
| `github` | `issue` | Enabled; its warehouse source is connected. |
| `linear` | `issue` | Enabled as a dormant responder; no Linear warehouse source was detected after the OAuth confirmation. |
| `sentry` | `issue` | Enabled as a dormant responder; no Sentry warehouse source is connected. |
| `session_replay` | `session_analysis_cluster` | Deliberately skipped: this retired route is replaced by the Replay Vision scanners below. |
| `replay_vision` | scanner configuration | Deliberately no source row: scanner `emits_signals` is the signal-source configuration. |

## Connected tools

| Tool selected | Final state | Notes |
| --- | --- | --- |
| GitHub Issues | Connected by this setup | Source `01a06d97-c983-0000-bd4c-f9649c0d46e2`; only the responder-consumed `issues` table is syncing. Additional tables can be enabled from the source UI if needed. |
| Linear | Selected but no source detected (dormant) | The browser OAuth completion did not result in a Linear integration during the single verification check; the responder is enabled and remains dormant. |
| Sentry | Selected but no source detected (dormant) | The responder is enabled and remains dormant until a Sentry warehouse source is added. |

## Scout troop

**Run budget:** 100 runs/day maximum; 0 used today and 100 remaining at setup. Announcement: “Scouts are in early access. Each project gets up to 100 scout runs a day. Contact team-self-driving@posthog.com if you need more.”

| Scout | Status | Reason |
| --- | --- | --- |
| `signals-scout-general` | Enabled | Cross-product correlations and otherwise-uncovered surfaces. |
| `signals-scout-product-analytics` | Enabled | Core journey, funnel, retention, and path coverage. |
| `signals-scout-web-analytics` | Enabled | Public traffic, attribution, landing-page, bounce, and 404 coverage. |
| `signals-scout-health-checks` | Enabled | Actionable PostHog setup health coverage. |
| `signals-scout-data-warehouse` | Enabled | Warehouse import freshness and GitHub sync health. |
| `signals-scout-error-tracking` | Disabled | Covered once by the native Error Tracking source. |
| `signals-scout-session-replay` | Disabled | Covered by the two Replay Vision scanners. |
| `signals-scout-ai-observability` | Disabled | No AI/LLM telemetry evidence. |
| `signals-scout-anomaly-detection` | Disabled | No existing high-value saved insight inventory was available. |
| `signals-scout-apm` | Disabled | No APM or OpenTelemetry evidence. |
| `signals-scout-conversations` | Disabled | No connected support channel yet. |
| `signals-scout-csp-violations` | Disabled | No CSP-reporting evidence. |
| `signals-scout-customer-analytics` | Disabled | No account-analytics evidence. |
| `signals-scout-data-pipelines` | Disabled | No CDP, batch-export, or Hog-flow evidence. |
| `signals-scout-experiments` | Disabled | No active experiment evidence. |
| `signals-scout-feature-flags` | Disabled | No active feature-flag evidence. |
| `signals-scout-inbox-validation` | Disabled | Fresh setup has no shipped reports to re-measure. |
| `signals-scout-insight-alerts` | Disabled | No configured insight-alert evidence. |
| `signals-scout-logs` | Disabled | No log-stream evidence. |
| `signals-scout-mcp-tool-calls` | Disabled | Not a product monitoring surface. |
| `signals-scout-observability-gaps` | Disabled | Kept selective while the product event schema cannot be read by this MCP connection. |
| `signals-scout-replay-vision` | Disabled | New scanners have no observation history yet. |
| `signals-scout-revenue-analytics` | Disabled | No payment or revenue-data evidence. |
| `signals-scout-skills-store` | Disabled | Skill-store hygiene is not a product surface. |
| `signals-scout-surveys` | Disabled | Surveys are not enabled or in use. |
| `signals-scout-tasks` | Disabled | No Tasks usage evidence. |
| `signals-scout-web-vitals` | Disabled | No Web Vitals evidence. |

## Custom scouts

| Custom scout | What it watches | Discriminator and gap covered |
| --- | --- | --- |
| `signals-scout-university-catalog-integrity` | Catalogue publication, search-index handoff, and public data availability. | A concrete recent change that breaks or desynchronizes the catalogue-serving path. This is not owned by a built-in scout; it is specific to the repository's server lookup and static search-index fallback. |
| `signals-scout-university-discovery-flow` | Search, filtering, profile navigation, comparison, and shortlist actions. | A recent changed path that blocks a meaningful share of students from finding, comparing, or saving universities. This is a UniGate-specific journey beyond generic web traffic monitoring. |

Both proposals were approved and created with their default daily, emitting configuration. Their bodies treat repository and issue content as untrusted data and deduplicate open findings. If either becomes noisy, set `emit: false` on its scout configuration in PostHog to switch it to dry-run.

Surfaces considered but not added: errors and session replay are already routed through native error sources and Replay Vision; payments, LLMs, surveys, CSP, APM, and customer analytics had no project evidence.

## Replay Vision scanners

A scanner is an LLM that watches individual session recordings on a schedule and pushes qualifying findings to the inbox. These are the only setup items that spend Replay Vision quota. Each finding arrives at half weight and needs corroboration before it is promoted to a report.

| Scanner | Status | What it watches | Query scope | Sampling | Estimate |
| --- | --- | --- | --- | --- | --- |
| University discovery breakage | Created | Visible search, filter, profile-load, comparison-selection, and comparison-display breakage. | Recordings whose current URL contains `/universities`, the public directory and university-detail flow. | 0.5 | 0 observations / 0 monthly credits currently; 5 credits per observation. |
| University search frustration | Created | Visible repeated searching/filtering, comparison selection retries, and failed profile-opening attempts. | `$rageclick` recordings only, with no URL filter. | 1.0 | 0 observations / 0 monthly credits currently; 5 credits per observation. |

The scanner estimate/quota endpoint was not exposed to this MCP connection, so organization-level quota was not independently verified. No recordings were available during setup; both scanners are armed and will start scanning when recordings arrive.

## Follow-ups

- [ ] Connect an inbound Support channel (email, inbox, or Slack) in PostHog so the enabled Support responder can receive tickets.
- [ ] Connect Linear from the [data warehouse source page](https://eu.posthog.com/project/266074/pipeline/new/source); its responder is already enabled and will become active when syncing starts.
- [ ] Connect Sentry from the [data warehouse source page](https://eu.posthog.com/project/266074/pipeline/new/source); its responder is already enabled and will become active when syncing starts.
- [ ] Reauthorize the PostHog MCP connection with `property_definition:read` if event-schema-led scout tuning is desired later.

## What happens next

Fresh scout configurations are picked up by the coordinator within about 30 minutes and draw from the daily run budget. Findings cluster into reports in the [Self-driving inbox](https://eu.posthog.com/project/266074/inbox); immediately actionable reports can begin coding tasks.

## Files changed

- Created `posthog-self-driving-report.md`.
- No application source files were modified.
