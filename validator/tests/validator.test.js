/**
 * One-Pager Validator tests - Comprehensive scoring tests
 * Tests all exported functions for scoring one-pager documents
 */

import {
  validateOnePager,
  scoreProblemClarity,
  scoreSolutionQuality,
  scoreScopeDiscipline,
  scoreCompleteness,
  detectProblemStatement,
  detectCostOfInaction,
  detectSolution,
  detectScope,
  detectSuccessMetrics,
  detectSections,
  detectStakeholders,
  detectTimeline
} from '../js/validator.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fixtures = JSON.parse(
  readFileSync(join(__dirname, '../testdata/scoring-fixtures.json'), 'utf-8')
);

// ============================================================================
// validateOnePager tests
// ============================================================================
describe('validateOnePager', () => {
  describe('empty/invalid input', () => {
    test('returns zero score for empty string', () => {
      const result = validateOnePager('');
      expect(result.totalScore).toBe(0);
    });

    test('returns zero score for null', () => {
      const result = validateOnePager(null);
      expect(result.totalScore).toBe(0);
    });

    test('returns zero score for undefined', () => {
      const result = validateOnePager(undefined);
      expect(result.totalScore).toBe(0);
    });

    test('returns all dimensions with issues for empty input', () => {
      const result = validateOnePager('');
      expect(result.problemClarity.issues).toContain('No content to validate');
      expect(result.solution.issues).toContain('No content to validate');
      expect(result.scope.issues).toContain('No content to validate');
      expect(result.completeness.issues).toContain('No content to validate');
    });
  });

  describe('fixture-based scoring', () => {
    test('scores minimal one-pager correctly', () => {
      const result = validateOnePager(fixtures.minimal.content);
      expect(result.totalScore).toBeGreaterThanOrEqual(fixtures.minimal.expectedMinScore);
      expect(result.totalScore).toBeLessThanOrEqual(fixtures.minimal.expectedMaxScore);
    });

    test('scores complete one-pager correctly', () => {
      const result = validateOnePager(fixtures.complete.content);
      expect(result.totalScore).toBeGreaterThanOrEqual(fixtures.complete.expectedMinScore);
      expect(result.totalScore).toBeLessThanOrEqual(fixtures.complete.expectedMaxScore);
    });
  });

  describe('score structure', () => {
    test('returns all required dimensions', () => {
      const result = validateOnePager('# Problem\nSome content');
      expect(result).toHaveProperty('totalScore');
      expect(result).toHaveProperty('problemClarity');
      expect(result).toHaveProperty('solution');
      expect(result).toHaveProperty('scope');
      expect(result).toHaveProperty('completeness');
    });

    test('each dimension has score, maxScore, issues, strengths', () => {
      const result = validateOnePager('# Problem\nSome content');
      for (const dim of ['problemClarity', 'solution', 'scope', 'completeness']) {
        expect(result[dim]).toHaveProperty('score');
        expect(result[dim]).toHaveProperty('maxScore');
        expect(result[dim]).toHaveProperty('issues');
        expect(result[dim]).toHaveProperty('strengths');
      }
    });

    test('total score equals sum of dimension scores', () => {
      const result = validateOnePager(fixtures.complete.content);
      const sum = result.problemClarity.score + result.solution.score +
                  result.scope.score + result.completeness.score;
      expect(result.totalScore).toBe(sum);
    });
  });
});

// ============================================================================
// scoreProblemClarity tests
// ============================================================================
describe('scoreProblemClarity', () => {
  test('maxScore is 30', () => {
    const result = scoreProblemClarity('');
    expect(result.maxScore).toBe(30);
  });

  test('awards points for problem section', () => {
    const withSection = scoreProblemClarity('# Problem\nWe have a problem with customer churn.');
    const withoutSection = scoreProblemClarity('We have a problem with customer churn.');
    expect(withSection.score).toBeGreaterThan(withoutSection.score);
  });

  test('awards points for cost of inaction', () => {
    const withCost = scoreProblemClarity('# Problem\nWithout action, we risk losing 40% of revenue.');
    const withoutCost = scoreProblemClarity('# Problem\nWe have a problem.');
    expect(withCost.score).toBeGreaterThan(withoutCost.score);
  });

  test('awards points for business focus', () => {
    const withBusiness = scoreProblemClarity('# Problem\nCustomers are struggling with our product, impacting revenue.');
    const withoutBusiness = scoreProblemClarity('# Problem\nThe system is slow.');
    expect(withBusiness.score).toBeGreaterThan(withoutBusiness.score);
  });
});

// ============================================================================
// scoreSolutionQuality tests
// ============================================================================
describe('scoreSolutionQuality', () => {
  test('maxScore is 25', () => {
    const result = scoreSolutionQuality('');
    expect(result.maxScore).toBe(25);
  });

  test('awards points for solution section with problem context', () => {
    // Solution scoring requires problem context to award full points
    const withContext = scoreSolutionQuality('# Problem\nWe have issues.\n# Solution\nWe will implement a new approach.');
    const withoutContext = scoreSolutionQuality('# Solution\nWe will implement a new approach.');
    expect(withContext.score).toBeGreaterThan(withoutContext.score);
  });

  test('awards points for measurable goals', () => {
    const withGoals = scoreSolutionQuality('# Solution\nOur goal is to achieve 50% improvement, measured by KPIs.');
    const withoutGoals = scoreSolutionQuality('# Solution\nWe will make things better.');
    expect(withGoals.score).toBeGreaterThan(withoutGoals.score);
  });

// ============================================================================
// scoreScopeDiscipline tests
// ============================================================================
describe('scoreScopeDiscipline', () => {
  test('maxScore is 25', () => {
    const result = scoreScopeDiscipline('');
    expect(result.maxScore).toBe(25);
  });

  test('awards points for in-scope items', () => {
    // "In scope" must match as a phrase, and needs scope section for full points
    const withInScope = scoreScopeDiscipline('# Scope\\nWe will deliver this feature. We are including dashboard.');
    const withoutInScope = scoreScopeDiscipline('Some content without scope.');
    expect(withInScope.score).toBeGreaterThan(withoutInScope.score);
  });

  test('awards points for out-of-scope items', () => {
    const withOutOfScope = scoreScopeDiscipline('Out of scope: mobile apps, third-party integrations.');
    const withoutOutOfScope = scoreScopeDiscipline('Some content.');
    expect(withOutOfScope.score).toBeGreaterThan(withoutOutOfScope.score);
  });

  test('awards points for success metrics', () => {
    const withMetrics = scoreScopeDiscipline('# Success Metrics\\nReduce latency by 50%.');
    const withoutMetrics = scoreScopeDiscipline('Some content.');
    expect(withMetrics.score).toBeGreaterThan(withoutMetrics.score);
  });
});

// ============================================================================
// scoreCompleteness tests
// ============================================================================
describe('scoreCompleteness', () => {
  test('maxScore is 20', () => {
    const result = scoreCompleteness('');
    expect(result.maxScore).toBe(20);
  });

  test('awards points for stakeholder section', () => {
    const withStakeholders = scoreCompleteness('# Stakeholders\\nOwner: John. Team: Engineering.');
    const withoutStakeholders = scoreCompleteness('Some content.');
    expect(withStakeholders.score).toBeGreaterThan(withoutStakeholders.score);
  });

  test('awards points for timeline section', () => {
    const withTimeline = scoreCompleteness('# Timeline\\nPhase 1: Q1. Phase 2: Q2.');
    const withoutTimeline = scoreCompleteness('Some content.');
    expect(withTimeline.score).toBeGreaterThan(withoutTimeline.score);
  });
});

// ============================================================================
// Detection function tests
// ============================================================================
describe('detectProblemStatement', () => {
  test('detects problem section', () => {
    const result = detectProblemStatement('# Problem\\nWe have an issue.');
    expect(result.hasProblemSection).toBe(true);
  });

  test('detects problem language', () => {
    const result = detectProblemStatement('The challenge is that customers struggle with onboarding.');
    expect(result.hasProblemLanguage).toBe(true);
  });

  test('detects quantified metrics', () => {
    const result = detectProblemStatement('We lose 40% of customers in the first month.');
    expect(result.isQuantified).toBe(true);
  });

  test('detects business focus', () => {
    const result = detectProblemStatement('This impacts customer satisfaction and revenue.');
    expect(result.hasBusinessFocus).toBe(true);
  });
});

describe('detectCostOfInaction', () => {
  test('detects cost language', () => {
    const result = detectCostOfInaction('Without this, we risk losing market share.');
    expect(result.hasCostLanguage).toBe(true);
  });

  test('detects quantified cost', () => {
    const result = detectCostOfInaction('Delay will cost us $1 million per month.');
    expect(result.isQuantified).toBe(true);
  });
});

describe('detectSolution', () => {
  test('detects solution section', () => {
    const result = detectSolution('# Solution\\nWe will build a new system.');
    expect(result.hasSolutionSection).toBe(true);
  });

  test('detects solution language', () => {
    const result = detectSolution('Our approach is to implement automated testing.');
    expect(result.hasSolutionLanguage).toBe(true);
  });

  test('detects implementation details', () => {
    const result = detectSolution('We will use a REST API with PostgreSQL database.');
    expect(result.hasImplementationDetails).toBe(true);
  });
});

describe('detectScope', () => {
  test('detects in-scope items', () => {
    const result = detectScope('In scope: user authentication, dashboard.');
    expect(result.hasInScope).toBe(true);
  });

  test('detects out-of-scope items', () => {
    const result = detectScope('Out of scope: mobile app, third-party integrations.');
    expect(result.hasOutOfScope).toBe(true);
  });

  test('detects both boundaries', () => {
    const result = detectScope('In scope: web app. Out of scope: mobile.');
    expect(result.hasBothBoundaries).toBe(true);
  });
});

describe('detectSuccessMetrics', () => {
  test('detects metrics section', () => {
    const result = detectSuccessMetrics('# Success Metrics\\nReduce errors by 50%.');
    expect(result.hasMetricsSection).toBe(true);
  });

  test('detects quantified metrics', () => {
    const result = detectSuccessMetrics('Target: 99.9% uptime, 200ms response time.');
    expect(result.hasQuantified).toBe(true);
  });
});

describe('detectSections', () => {
  test('finds present sections', () => {
    const result = detectSections('# Problem\\n# Solution\\n# Goals');
    expect(result.found.length).toBeGreaterThan(0);
  });

  test('identifies missing sections', () => {
    const result = detectSections('# Problem\\nSome content.');
    expect(result.missing.length).toBeGreaterThan(0);
  });
});

describe('detectStakeholders', () => {
  test('detects stakeholder section', () => {
    const result = detectStakeholders('# Stakeholders\\nOwner: Product Team.');
    expect(result.hasStakeholderSection).toBe(true);
  });

  test('detects role definitions', () => {
    const result = detectStakeholders('Responsible: Engineering. Accountable: PM.');
    expect(result.hasRoles).toBe(true);
  });
});

describe('detectTimeline', () => {
  test('detects timeline section', () => {
    const result = detectTimeline('# Timeline\\nQ1: Design. Q2: Build.');
    expect(result.hasTimelineSection).toBe(true);
  });

  test('detects phasing', () => {
    const result = detectTimeline('Phase 1: Research. Phase 2: Implementation.');
    expect(result.hasPhasing).toBe(true);
  });
});
});
