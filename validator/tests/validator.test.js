/**
 * Business Justification Validator tests - Comprehensive scoring tests
 * Tests all exported functions for scoring business justification documents
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
    test('scores minimal business justification correctly', () => {
      const result = validateOnePager(fixtures.minimal.content);
      expect(result.totalScore).toBeGreaterThanOrEqual(fixtures.minimal.expectedMinScore);
      expect(result.totalScore).toBeLessThanOrEqual(fixtures.minimal.expectedMaxScore);
    });

    test('scores complete business justification correctly', () => {
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

    test('total score equals sum of dimension scores minus slop penalty', () => {
      const result = validateOnePager(fixtures.complete.content);
      const sum = result.problemClarity.score + result.solution.score +
                  result.scope.score + result.completeness.score;
      const slopDeduction = result.slopDetection?.deduction || 0;
      expect(result.totalScore).toBe(sum - slopDeduction);
    });
  });
});

// ============================================================================
// scoreProblemClarity tests (now aliases scoreStrategicEvidence - 4-pillar taxonomy)
// ============================================================================
describe('scoreProblemClarity', () => {
  test('maxScore is 30', () => {
    const result = scoreProblemClarity('');
    expect(result.maxScore).toBe(30);
  });

  test('awards points for quantified problem section', () => {
    // New 4-pillar taxonomy: Strategic Evidence requires quantified data
    const withQuantified = scoreProblemClarity('# Problem\nWe lose 40% of customers annually, costing $2M.');
    const withoutQuantified = scoreProblemClarity('# Problem\nWe have a problem.');
    expect(withQuantified.score).toBeGreaterThan(withoutQuantified.score);
  });

  test('awards points for cited sources', () => {
    // New 4-pillar taxonomy: Strategic Evidence rewards credible sources
    const withSource = scoreProblemClarity('# Problem\nAccording to Gartner 2024, we lose 40% annually.');
    const withoutSource = scoreProblemClarity('# Problem\nWe lose 40% annually.');
    expect(withSource.score).toBeGreaterThan(withoutSource.score);
  });

  test('awards points for business focus with before/after', () => {
    // New 4-pillar taxonomy: Strategic Evidence rewards business focus + before/after
    // Need both "business focus" keywords AND "before/after" keywords for full points
    const withBeforeAfter = scoreProblemClarity('# Problem\nOur customers currently wait 5 min (before). Target: 2 min (after). This impacts customer satisfaction.');
    const withoutBeforeAfter = scoreProblemClarity('# Problem\nOur business has slow systems.');
    expect(withBeforeAfter.score).toBeGreaterThan(withoutBeforeAfter.score);
  });
});

// ============================================================================
// scoreSolutionQuality tests (now aliases scoreFinancialJustification - 4-pillar taxonomy)
// ============================================================================
describe('scoreSolutionQuality', () => {
  test('maxScore is 25', () => {
    const result = scoreSolutionQuality('');
    expect(result.maxScore).toBe(25);
  });

  test('awards points for ROI calculation', () => {
    // New 4-pillar taxonomy: Financial Justification rewards ROI
    const withROI = scoreSolutionQuality('# Financial\nROI: (100000 - 50000) / 50000 = 100%');
    const withoutROI = scoreSolutionQuality('# Solution\nWe will implement a new approach.');
    expect(withROI.score).toBeGreaterThan(withoutROI.score);
  });

  test('awards points for payback period', () => {
    // New 4-pillar taxonomy: Financial Justification rewards payback period
    const withPayback = scoreSolutionQuality('Payback period is 6 months with monthly savings of $10K.');
    const withoutPayback = scoreSolutionQuality('We will make things better.');
    expect(withPayback.score).toBeGreaterThan(withoutPayback.score);
  });
});

// ============================================================================
// scoreScopeDiscipline tests (now aliases scoreOptionsAnalysis - 4-pillar taxonomy)
// ============================================================================
describe('scoreScopeDiscipline', () => {
  test('maxScore is 25', () => {
    const result = scoreScopeDiscipline('');
    expect(result.maxScore).toBe(25);
  });

  test('awards points for do-nothing scenario', () => {
    // New 4-pillar taxonomy: Options Analysis rewards do-nothing scenario
    const withDoNothing = scoreScopeDiscipline('# Options\n## Do Nothing\nContinue losing $50K annually. Cost of inaction: $150K over 3 years.');
    const withoutDoNothing = scoreScopeDiscipline('Some content without options.');
    expect(withDoNothing.score).toBeGreaterThan(withoutDoNothing.score);
  });

  test('awards points for alternatives', () => {
    // New 4-pillar taxonomy: Options Analysis rewards alternatives
    const withAlternatives = scoreScopeDiscipline('# Options\n## Alternative 1\nMinimal investment.\n## Alternative 2\nFull solution.');
    const withoutAlternatives = scoreScopeDiscipline('Some content.');
    expect(withAlternatives.score).toBeGreaterThan(withoutAlternatives.score);
  });

  test('awards points for recommendation', () => {
    // New 4-pillar taxonomy: Options Analysis rewards clear recommendation
    const withRec = scoreScopeDiscipline('## Recommendation\nOption 2 is recommended because it has the best ROI.');
    const withoutRec = scoreScopeDiscipline('Some content.');
    expect(withRec.score).toBeGreaterThan(withoutRec.score);
  });
});

// ============================================================================
// scoreCompleteness tests (now aliases scoreExecutionCompleteness - 4-pillar taxonomy)
// ============================================================================
describe('scoreCompleteness', () => {
  test('maxScore is 20', () => {
    const result = scoreCompleteness('');
    expect(result.maxScore).toBe(20);
  });

  test('awards points for executive summary', () => {
    // New 4-pillar taxonomy: Execution Completeness rewards executive summary
    const withExecSummary = scoreCompleteness('# Executive Summary\nRequest $50K to save $100K annually.');
    const withoutExecSummary = scoreCompleteness('Some content.');
    expect(withExecSummary.score).toBeGreaterThan(withoutExecSummary.score);
  });

  test('awards points for risks section', () => {
    // New 4-pillar taxonomy: Execution Completeness rewards risks with mitigation
    const withRisks = scoreCompleteness('# Risks\n1. Timeline risk - Mitigation: buffer weeks\n2. Budget risk - Mitigation: contingency fund');
    const withoutRisks = scoreCompleteness('Some content.');
    expect(withRisks.score).toBeGreaterThan(withoutRisks.score);
  });

  test('awards points for stakeholder concerns', () => {
    // New 4-pillar taxonomy: Execution Completeness rewards addressing Finance/HR/Legal
    const withConcerns = scoreCompleteness('# Stakeholders\nFinance: Budget approved. HR: Training plan ready. Legal: No compliance issues.');
    const withoutConcerns = scoreCompleteness('Some content.');
    expect(withConcerns.score).toBeGreaterThan(withoutConcerns.score);
  });
});

// ============================================================================
// Detection function tests
// ============================================================================
describe('detectProblemStatement', () => {
  test('detects problem section', () => {
    const result = detectProblemStatement('# Problem\nWe have an issue.');
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
    const result = detectSolution('# Solution\nWe will build a new system.');
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
    const result = detectSuccessMetrics('# Success Metrics\nReduce errors by 50%.');
    expect(result.hasMetricsSection).toBe(true);
  });

  test('detects quantified metrics', () => {
    const result = detectSuccessMetrics('Target: 99.9% uptime, 200ms response time.');
    expect(result.hasQuantified).toBe(true);
  });
});

describe('detectSections', () => {
  test('finds present sections', () => {
    const result = detectSections('# Problem\n# Solution\n# Goals');
    expect(result.found.length).toBeGreaterThan(0);
  });

  test('identifies missing sections', () => {
    const result = detectSections('# Problem\nSome content.');
    expect(result.missing.length).toBeGreaterThan(0);
  });
});

describe('detectSections - Plain Text Heading Detection', () => {
  // Tests for ^(#+\s*)? regex pattern that allows plain text headings (Word/Google Docs imports)

  test('detects Problem section without markdown prefix', () => {
    const text = 'Problem\nWe have a challenge with X.';
    const result = detectSections(text);
    expect(result.found.some((s) => s.name === 'Problem/Challenge')).toBe(true);
  });

  test('detects Solution section without markdown prefix', () => {
    const text = 'Solution\nOur approach is to build Y.';
    const result = detectSections(text);
    expect(result.found.some((s) => s.name === 'Solution/Proposal')).toBe(true);
  });

  test('detects Financial section without markdown prefix', () => {
    const text = 'Financial Justification\n- ROI: 150%\n- Payback: 6 months';
    const result = detectSections(text);
    expect(result.found.some((s) => s.name === 'Financial Justification')).toBe(true);
  });

  test('detects Options section without markdown prefix', () => {
    const text = 'Options Analysis\nOption A: Build. Option B: Buy.';
    const result = detectSections(text);
    expect(result.found.some((s) => s.name === 'Options Analysis')).toBe(true);
  });

  test('handles mixed markdown and plain text headings', () => {
    const text = '# Problem\nSome issue.\n\nSolution\nThe fix is this.';
    const result = detectSections(text);
    expect(result.found.some((s) => s.name === 'Problem/Challenge')).toBe(true);
    expect(result.found.some((s) => s.name === 'Solution/Proposal')).toBe(true);
  });

  test('handles Word/Google Docs pasted content without markdown', () => {
    const text = `Problem
Our customers face challenges with X.

Solution
We propose building Y.

Financial Justification
- ROI: 150%
- Payback: 6 months

Options Analysis
Option A: Build. Option B: Buy.`;
    const result = detectSections(text);
    expect(result.found.some((s) => s.name === 'Problem/Challenge')).toBe(true);
    expect(result.found.some((s) => s.name === 'Solution/Proposal')).toBe(true);
    expect(result.found.some((s) => s.name === 'Financial Justification')).toBe(true);
    expect(result.found.some((s) => s.name === 'Options Analysis')).toBe(true);
  });
});

describe('detectStakeholders', () => {
  test('detects stakeholder section', () => {
    const result = detectStakeholders('# Stakeholders\nOwner: Product Team.');
    expect(result.hasStakeholderSection).toBe(true);
  });

  test('detects role definitions', () => {
    const result = detectStakeholders('Responsible: Engineering. Accountable: PM.');
    expect(result.hasRoles).toBe(true);
  });
});

describe('detectTimeline', () => {
  test('detects timeline section', () => {
    const result = detectTimeline('# Timeline\nQ1: Design. Q2: Build.');
    expect(result.hasTimelineSection).toBe(true);
  });

  test('detects phasing', () => {
    const result = detectTimeline('Phase 1: Research. Phase 2: Implementation.');
    expect(result.hasPhasing).toBe(true);
  });
});
