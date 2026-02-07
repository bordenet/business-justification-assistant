/**
 * Tests for validator-inline.js
 */
import { validateDocument, getScoreColor, getScoreLabel } from '../../shared/js/validator-inline.js';

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
      const goodOnePager = `
# Problem Statement
Our customers struggle with manual data entry, causing 500+ hours wasted per month.
The cost of inaction is $50,000 annually in lost productivity.
This impacts our business revenue and customer satisfaction.

## Solution
We will build an automated data pipeline that reduces manual effort by 80%.
Our approach delivers measurable goals including faster processing and fewer errors.

## Goals and Benefits
- Reduce processing time by 75%
- Improve data accuracy to 99%
- Save $40,000 per year

## Scope
### In Scope
- We will automate the ingestion process
- We will provide real-time monitoring

### Out of Scope
- We will not modify the legacy database
- Phase 2: Advanced analytics (future)

## Success Metrics
- Measure: 90% reduction in manual tasks
- KPI: Less than 1% error rate
- Target: Full deployment in Q2

## Stakeholders
- Product Owner: Jane Doe (responsible)
- Engineering Lead: John Smith (accountable)
- Team: Core Platform

## Timeline
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

    test('should identify missing out-of-scope', () => {
      const noOutOfScope = `
# Problem
There is a big problem affecting our users and costing the business money.

## Scope
- In scope: We will do good things
- We will deliver value
      `.repeat(2);
      const result = validateDocument(noOutOfScope);
      expect(result.scope.issues.some(i => i.toLowerCase().includes('out-of-scope'))).toBe(true);
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
