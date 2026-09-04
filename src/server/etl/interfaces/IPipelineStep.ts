/**
 * @file IPipelineStep.ts
 * @description Core pipeline abstractions for the TransactionalResetPipeline.
 *
 * Design Patterns: Chain of Responsibility · Unit of Work · Strategy · DI
 *
 * Each pipeline step is a self-contained unit responsible for one and only one
 * concern (SRP). Steps declare an optional `compensate()` hook that the
 * orchestrator calls in reverse order if any downstream step throws, giving the
 * system saga-style compensation (similar to the Saga pattern used in
 * distributed systems).
 */

import { PrismaClient } from "@prisma/client";

// ---------------------------------------------------------------------------
// Structured Logger (SRE-grade, JSON-parseable by Cloud Logging / Datadog)
// ---------------------------------------------------------------------------

export type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

export interface LogEntry {
  level: LogLevel;
  timestamp: string;   // ISO-8601
  step?: string;       // name of the pipeline step emitting the log
  message: string;
  [key: string]: unknown;
}

export interface PipelineLogger {
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

// ---------------------------------------------------------------------------
// Pipeline Context — shared state bag passed through every step
// ---------------------------------------------------------------------------

export interface PipelineContext {
  /** Prisma client (direct connection, outside transaction) */
  prisma: PrismaClient;
  /** Structured logger shared across all steps */
  logger: PipelineLogger;
  /** Validated data to be ingested */
  validatedData: {
    universities: import("../CatalogValidator").ValidatedUniversity[];
    faculties:    import("../CatalogValidator").ValidatedFaculty[];
    programs:     import("../CatalogValidator").ValidatedProgram[];
  };
  /** CLI flags */
  options: {
    dryRun:           boolean;
    skipSnapshot:     boolean;
    skipRevalidation: boolean;
  };
  // -- mutable outputs written by steps --
  snapshotId?:        string;
  advisoryLockHeld?:  boolean;
  universitiesIngested?: number;
  facultiesIngested?:    number;
  programsIngested?:     number;
  auditPassed?:          boolean;
}

// ---------------------------------------------------------------------------
// IPipelineStep<TContext> — the core interface every step must implement
// ---------------------------------------------------------------------------

/**
 * A single, bounded unit of work in the pipeline.
 *
 * @template TContext - The shared mutable context passed between steps.
 */
export interface IPipelineStep<TContext extends PipelineContext = PipelineContext> {
  /** Human-readable name used in structured logs */
  readonly name: string;

  /**
   * Execute the step's primary logic.
   * Throws on failure — the orchestrator catches and triggers compensation.
   */
  execute(ctx: TContext): Promise<void>;

  /**
   * Optional compensation hook (saga-style rollback).
   * Called in reverse step order if any downstream step fails.
   * Must be idempotent and MUST NOT throw — swallow and log errors here.
   */
  compensate?(ctx: TContext): Promise<void>;
}
