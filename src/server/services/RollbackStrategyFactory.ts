import { IRollbackStrategy } from "./rollback/IRollbackStrategy";
import { UniversityRollbackStrategy } from "./rollback/UniversityRollbackStrategy";
import { FacultyRollbackStrategy } from "./rollback/FacultyRollbackStrategy";
import { ProgramRollbackStrategy } from "./rollback/ProgramRollbackStrategy";

export class RollbackStrategyFactory {
  private static strategies: Record<string, IRollbackStrategy> = {
    UNIVERSITY: new UniversityRollbackStrategy(),
    FACULTY: new FacultyRollbackStrategy(),
    DEGREE_PROGRAM: new ProgramRollbackStrategy(),
    PROGRAM: new ProgramRollbackStrategy(),
  };

  static forEntityType(entityType: string): IRollbackStrategy {
    const normalized = entityType.toUpperCase().trim();
    const strategy = this.strategies[normalized];
    if (!strategy) {
      throw new Error(`Unsupported rollback entity type: ${entityType}. Available: UNIVERSITY, FACULTY, DEGREE_PROGRAM`);
    }
    return strategy;
  }
}
