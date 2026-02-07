/**
 * Tests for validator-inline.js
 */
import {
  validateDocument,
  getScoreColor,
  getScoreLabel,
  scoreProblemClarity,
  scoreSolutionQuality,
  scoreScopeDiscipline,
  scoreCompleteness,
  detectProblemStatement,
  detectCostOfInaction,
  detectSolution,
  detectMeasurableGoals,
  detectScope,
  detectSuccessMetrics,
  detectStakeholders,
  detectTimeline
} from '../../shared/js/validator-inline.js';

describe('Inline One-Pager Validator', () => {
  describe('validateDocument', () => {
    test('should return zero scores for empty content', () => {
      const result = validateDocument('');
      expect(result.totalScore).toBe(0);
      expect(result.problemClarity.score).toBe(0);
      expect(result.solution.score).toBe(0);
      expect(result.scope.score).toBe(0);
      expect(result.completeness.score).toBe(0);
    });

    test('should return low scores for short content', () => {
      const result = validateDocument('Too short');
      // Short content gets minimal scores from pattern matching
      expect(result.totalScore).toBeLessThan(10);
    });

    test('should return zero scores for null', () => {
      const result = validateDocument(null);
      expect(result.totalScore).toBe(0);
    });

    test('should score a well-structured one-pager', () => {
      // This fixture includes all 4 pillars: Strategic Evidence, Financial Justification,
      // Options Analysis, and Execution Completeness
      const goodOnePager = `
# Executive Summary
Request $30K to automate data entry, saving $50K annually. ROI: 167%. Payback: 7 months.

# Problem Statement
Our customers struggle with manual data entry, causing 500+ hours wasted per month.
According to Gartner 2024, industry average is 100 hours. This costs $50,000 annually
in lost productivity (source: Q3 Ops Report). Before: 500 hours. After: 100 hours target.

# Financial Justification
## ROI Calculation
- Annual benefit: $50K saved
- Cost: $30K implementation
- ROI: (50,000 - 30,000) / 30,000 × 100 = 67%

## Payback Period
Monthly savings of $4.2K, payback achieved in 7 months.

## 3-Year TCO
- Year 1: $30K + $5K ops = $35K
- Years 2-3: $5K/year
- Total: $45K vs $150K benefit

# Options Analysis
## Option 1: Do Nothing
Continue losing $50K annually. Risk: team burnout, customer churn.

## Option 2: Minimal ($10K)
Partial automation, 40% reduction. Basic phase 1 only.

## Option 3: Full Solution ($30K) - RECOMMENDED
Full automation, 80% reduction. Best ROI.

# Risks
1. Integration risk - Mitigation: phased rollout
2. Training risk - Mitigation: documentation

# Stakeholders
- Finance: Budget approved, payback acceptable
- HR: Training plan in place
- Owner: Jane Doe (responsible)
- Lead: John Smith (accountable)

# Timeline
- Phase 1 (Q1): Design and prototype
- Phase 2 (Q2): Development and testing
- Milestone: Production launch by end of Q2
      `;
      const result = validateDocument(goodOnePager);
      expect(result.totalScore).toBeGreaterThan(60);
      expect(result.problemClarity.score).toBeGreaterThan(15);
      expect(result.solution.score).toBeGreaterThanOrEqual(10);
    });

    test('should identify missing problem section', () => {
      const noProblem = `
# Solution
We will build something great.

## Scope
- In scope: Everything good
      `.repeat(2);
      const result = validateDocument(noProblem);
      expect(result.problemClarity.issues.some(i => i.toLowerCase().includes('problem'))).toBe(true);
    });

    test('should identify missing options analysis', () => {
      // New 4-pillar taxonomy: scope now checks for Options Analysis (do-nothing, alternatives)
      const noOptions = `
# Problem
There is a big problem affecting our users and costing the business money.

## Solution
We will fix it with our approach.
      `.repeat(2);
      const result = validateDocument(noOptions);
      // Should flag missing do-nothing scenario or alternatives
      expect(result.scope.issues.some(i =>
        i.toLowerCase().includes('do-nothing') ||
        i.toLowerCase().includes('alternative') ||
        i.toLowerCase().includes('option')
      )).toBe(true);
    });
  });

  describe('getScoreColor', () => {
    test('should return green for scores >= 70', () => {
      expect(getScoreColor(70)).toBe('green');
      expect(getScoreColor(85)).toBe('green');
      expect(getScoreColor(100)).toBe('green');
    });

    test('should return yellow for scores 50-69', () => {
      expect(getScoreColor(50)).toBe('yellow');
      expect(getScoreColor(65)).toBe('yellow');
    });

    test('should return orange for scores 30-49', () => {
      expect(getScoreColor(30)).toBe('orange');
      expect(getScoreColor(45)).toBe('orange');
    });

    test('should return red for scores < 30', () => {
      expect(getScoreColor(0)).toBe('red');
      expect(getScoreColor(29)).toBe('red');
    });
  });

  describe('getScoreLabel', () => {
    test('should return Excellent for scores >= 80', () => {
      expect(getScoreLabel(80)).toBe('Excellent');
      expect(getScoreLabel(100)).toBe('Excellent');
    });

    test('should return Ready for scores 70-79', () => {
      expect(getScoreLabel(70)).toBe('Ready');
      expect(getScoreLabel(79)).toBe('Ready');
    });

    test('should return Needs Work for scores 50-69', () => {
      expect(getScoreLabel(50)).toBe('Needs Work');
      expect(getScoreLabel(69)).toBe('Needs Work');
    });

    test('should return Draft for scores 30-49', () => {
      expect(getScoreLabel(30)).toBe('Draft');
      expect(getScoreLabel(49)).toBe('Draft');
    });

    test('should return Incomplete for scores < 30', () => {
      expect(getScoreLabel(0)).toBe('Incomplete');
      expect(getScoreLabel(29)).toBe('Incomplete');
    });
  });
});

// ============================================================================
// Scoring Function Tests
// ============================================================================

describe('Scoring Functions', () => {
  describe('scoreProblemClarity', () => {
    test('should return maxScore of 30', () => {
      const result = scoreProblemClarity('Problem statement');
      expect(result.maxScore).toBe(30);
    });

    test('should score higher for clear problems', () => {
      const content = `
# Problem Statement
Our customers struggle with manual data entry.
The cost of inaction is $50,000 annually in lost productivity.
This impacts our business revenue and customer satisfaction.
      `.repeat(2);
      const result = scoreProblemClarity(content);
      expect(result.score).toBeGreaterThan(0);
    });
  });

  describe('scoreSolutionQuality', () => {
    // Now aliases scoreFinancialJustification - 4-pillar taxonomy
    test('should return maxScore of 25', () => {
      const result = scoreSolutionQuality('Solution proposal');
      expect(result.maxScore).toBe(25);
    });

    test('should score higher for financial justification', () => {
      // New 4-pillar taxonomy: scoreSolutionQuality now checks for ROI, payback, TCO
      const content = `
## Financial Justification
ROI calculation: (100000 - 50000) / 50000 = 100%
Payback period is 6 months with $10K monthly savings.
TCO over 3 years: $150K implementation + $50K ops.
      `.repeat(2);
      const result = scoreSolutionQuality(content);
      expect(result.score).toBeGreaterThan(0);
    });
  });

  describe('scoreScopeDiscipline', () => {
    // Now aliases scoreOptionsAnalysis - 4-pillar taxonomy
    test('should return maxScore of 25', () => {
      const result = scoreScopeDiscipline('Scope definition');
      expect(result.maxScore).toBe(25);
    });

    test('should score higher for options analysis', () => {
      // New 4-pillar taxonomy: scoreScopeDiscipline now checks for do-nothing, alternatives
      const content = `
## Options Analysis
### Do Nothing
Continue losing $50K annually. Cost of inaction over 3 years: $150K.

### Alternative 1: Minimal Investment
Basic improvements only.

### Alternative 2: Full Solution - RECOMMENDED
Complete solution with best ROI.
      `.repeat(2);
      const result = scoreScopeDiscipline(content);
      expect(result.score).toBeGreaterThan(0);
    });
  });

  describe('scoreCompleteness', () => {
    // Now aliases scoreExecutionCompleteness - 4-pillar taxonomy
    test('should return maxScore of 20', () => {
      const result = scoreCompleteness('Complete document');
      expect(result.maxScore).toBe(20);
    });

    test('should score higher for execution completeness', () => {
      // New 4-pillar taxonomy: scoreCompleteness now checks for exec summary, risks, stakeholder concerns
      const content = `
## Executive Summary
Request $50K to save $100K annually. ROI: 100%.

## Risks
1. Timeline risk - Mitigation: buffer weeks
2. Budget risk - Mitigation: contingency fund

## Stakeholders
Finance: Budget approved. HR: Training plan. Legal: Compliance cleared.
      `.repeat(2);
      const result = scoreCompleteness(content);
      expect(result.score).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// Detection Function Tests
// ============================================================================

describe('Detection Functions', () => {
  describe('detectProblemStatement', () => {
    // Now aliases detectStrategicEvidence in 4-pillar taxonomy
    test('should detect problem section', () => {
      const content = '# Problem Statement\nUsers struggle with data entry.';
      const result = detectProblemStatement(content);
      expect(result.hasProblemSection).toBe(true);
    });

    test('should detect business focus', () => {
      // 4-pillar taxonomy: detectProblemStatement (via detectStrategicEvidence) detects business focus
      const content = 'This impacts our customer satisfaction and business revenue significantly.';
      const result = detectProblemStatement(content);
      expect(result.hasBusinessFocus).toBe(true);
    });

    test('should detect quantified problems', () => {
      const content = 'We waste 500 hours per month on manual tasks.';
      const result = detectProblemStatement(content);
      expect(result.isQuantified).toBe(true);
    });
  });

  describe('detectCostOfInaction', () => {
    test('should detect cost language', () => {
      // Pattern matches: do-nothing, status quo, inaction, without this, etc.
      const content = 'If we do nothing, we continue losing revenue. The status quo is unsustainable.';
      const result = detectCostOfInaction(content);
      expect(result.hasCostLanguage).toBe(true);
    });

    test('should detect quantified costs', () => {
      // Pattern requires format like "500 hours" or "50%" or "100 million"
      const content = 'Without action, we lose 500 hours per month and 100 thousand dollars.';
      const result = detectCostOfInaction(content);
      expect(result.isQuantified).toBe(true);
    });
  });

  describe('detectSolution', () => {
    test('should detect solution section', () => {
      const content = '## Solution\nWe will build an automated pipeline.';
      const result = detectSolution(content);
      expect(result.hasSolutionSection).toBe(true);
    });

    test('should detect measurable solutions', () => {
      // Pattern looks for measure|metric|kpi|track|monitor|quantify|achieve|reach|target|goal
      const content = 'Our approach will achieve measurable targets and track metrics.';
      const result = detectSolution(content);
      expect(result.hasMeasurable).toBe(true);
    });
  });

  describe('detectMeasurableGoals', () => {
    test('should detect measurable terms', () => {
      // Pattern looks for measure|metric|kpi|track|monitor|quantify|achieve|reach|target|goal
      const content = 'We will measure success and track KPIs to reach our targets.';
      const result = detectMeasurableGoals(content);
      expect(result.hasMeasurable).toBe(true);
    });

    test('should detect goal language', () => {
      const content = 'Our goal is to achieve a 50% reduction. The objective is improved efficiency.';
      const result = detectMeasurableGoals(content);
      expect(result.hasGoals).toBe(true);
    });
  });

  describe('detectScope', () => {
    test('should detect in-scope items', () => {
      const content = 'In scope: We will automate data ingestion.';
      const result = detectScope(content);
      expect(result.hasInScope).toBe(true);
    });

    test('should detect out-of-scope items', () => {
      const content = 'Out of scope: Legacy system modifications will not be included.';
      const result = detectScope(content);
      expect(result.hasOutOfScope).toBe(true);
    });

    test('should detect both boundaries', () => {
      const content = 'In scope: New automation. Out of scope: Legacy changes.';
      const result = detectScope(content);
      expect(result.hasBothBoundaries).toBe(true);
    });
  });

  describe('detectSuccessMetrics', () => {
    test('should detect metrics section', () => {
      const content = '## Success Metrics\nKPI: 90% reduction in errors.';
      const result = detectSuccessMetrics(content);
      expect(result.hasMetricsSection).toBe(true);
    });

    test('should detect quantified metrics', () => {
      const content = 'We will measure success by 50% improvement in speed.';
      const result = detectSuccessMetrics(content);
      expect(result.hasQuantified).toBe(true);
    });
  });

  describe('detectStakeholders', () => {
    test('should detect stakeholder language', () => {
      const content = 'Stakeholders include the product owner and engineering lead.';
      const result = detectStakeholders(content);
      expect(result.hasStakeholders).toBe(true);
    });

    test('should detect role definitions', () => {
      const content = 'Product Owner: Jane Doe (responsible). Engineering Lead: John Smith (accountable).';
      const result = detectStakeholders(content);
      expect(result.hasRoles).toBe(true);
    });
  });

  describe('detectTimeline', () => {
    test('should detect timeline dates', () => {
      const content = 'Phase 1 starts in Q1 2024. Launch by March 2024.';
      const result = detectTimeline(content);
      expect(result.hasTimeline).toBe(true);
    });

    test('should detect phasing', () => {
      const content = 'Phase 1: Design. Phase 2: Development. Milestone: Launch.';
      const result = detectTimeline(content);
      expect(result.hasPhasing).toBe(true);
    });
  });
});
