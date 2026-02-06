/**
 * Inline One-Pager Validator for Assistant UI
 * @module validator-inline
 *
 * Lightweight validation for inline scoring after Phase 3 completion.
 * Scoring Dimensions:
 * 1. Problem Clarity (30 pts) - Problem statement, cost of inaction, customer focus
 * 2. Solution Quality (25 pts) - Solution addresses problem, measurable goals
 * 3. Scope Discipline (25 pts) - In/out scope, success metrics
 * 4. Completeness (20 pts) - Required sections, stakeholders, timeline
 */

import { getSlopPenalty, calculateSlopScore } from './slop-detection.js';

// Re-export for direct access
export { calculateSlopScore };

// Problem detection patterns
const PROBLEM_PATTERNS = {
  section: /^#+\s*(problem|challenge|pain.?point|context|why)/im,
  language: /\b(problem|challenge|pain.?point|issue|struggle|difficult|frustrat)\b/gi,
  cost: /\b(cost|impact|consequence|risk|without|if.?not|delay)\b/gi,
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|\$|user)/gi,
  business: /\b(business|customer|user|market|revenue|profit|value)\b/gi
};

// Solution patterns
const SOLUTION_PATTERNS = {
  section: /^#+\s*(solution|proposal|approach|recommendation)/im,
  language: /\b(solution|approach|proposal|implement|build|create|develop)\b/gi,
  measurable: /\b(measure|metric|kpi|track|achieve|target|goal)\b/gi
};

// Scope patterns
const SCOPE_PATTERNS = {
  inScope: /\b(in.scope|included|we.will|we.are)\b/gi,
  outOfScope: /\b(out.of.scope|not.included|excluded|won't|outside.scope)\b/gi,
  section: /^#+\s*(scope|boundaries)/im
};

// Required sections
const REQUIRED_SECTIONS = [
  { pattern: /^#+\s*(problem|challenge|context)/im, name: 'Problem', weight: 2 },
  { pattern: /^#+\s*(solution|proposal|approach)/im, name: 'Solution', weight: 2 },
  { pattern: /^#+\s*(goal|objective|benefit)/im, name: 'Goals', weight: 2 },
  { pattern: /^#+\s*(scope)/im, name: 'Scope', weight: 2 },
  { pattern: /^#+\s*(success|metric|kpi)/im, name: 'Metrics', weight: 1 },
  { pattern: /^#+\s*(stakeholder|team|owner)/im, name: 'Stakeholders', weight: 1 },
  { pattern: /^#+\s*(timeline|milestone)/im, name: 'Timeline', weight: 1 }
];

function scoreProblemClarity(text) {
  let score = 0;
  const issues = [];

  const hasSection = PROBLEM_PATTERNS.section.test(text);
  const hasLanguage = PROBLEM_PATTERNS.language.test(text);
  const hasCost = PROBLEM_PATTERNS.cost.test(text);
  const hasQuantified = PROBLEM_PATTERNS.quantified.test(text);
  const hasBusiness = PROBLEM_PATTERNS.business.test(text);

  if (hasSection && hasLanguage) score += 10;
  else if (hasLanguage) { score += 6; issues.push('Add dedicated problem section'); }
  else issues.push('Missing problem statement');

  if (hasCost && hasQuantified) score += 10;
  else if (hasCost) { score += 5; issues.push('Quantify cost of inaction'); }
  else issues.push('Missing cost of inaction');

  if (hasBusiness) score += 10;
  else issues.push('Add customer/business focus');

  return { score: Math.min(30, score), maxScore: 30, issues };
}

function scoreSolutionQuality(text) {
  let score = 0;
  const issues = [];

  const hasSection = SOLUTION_PATTERNS.section.test(text);
  const hasLanguage = SOLUTION_PATTERNS.language.test(text);
  const hasMeasurable = SOLUTION_PATTERNS.measurable.test(text);
  const hasGoals = /\b(goal|objective|benefit|outcome)\b/gi.test(text);

  if (hasSection && hasLanguage) score += 10;
  else if (hasLanguage) { score += 6; issues.push('Add dedicated solution section'); }
  else issues.push('Missing solution');

  if (hasMeasurable && hasGoals) score += 10;
  else if (hasGoals) { score += 5; issues.push('Add measurable metrics'); }
  else issues.push('Define measurable goals');

  // High-level check (5 pts)
  const hasImplementation = /\b(code|function|class|method|api|database|sql)\b/gi.test(text);
  if (!hasImplementation) score += 5;
  else issues.push('Remove implementation details');

  return { score: Math.min(25, score), maxScore: 25, issues };
}

function scoreScopeDiscipline(text) {
  let score = 0;
  const issues = [];

  const hasInScope = SCOPE_PATTERNS.inScope.test(text);
  const hasOutOfScope = SCOPE_PATTERNS.outOfScope.test(text);
  const hasSection = SCOPE_PATTERNS.section.test(text);
  const hasMetrics = /\b(success|metric|kpi|measure)\b/gi.test(text);
  const hasQuantified = /\d+\s*(%|day|week|month|\$|user)/gi.test(text);

  if (hasInScope && hasSection) score += 8;
  else if (hasInScope) { score += 4; issues.push('Add scope section'); }
  else issues.push('Define in-scope items');

  if (hasOutOfScope) score += 9;
  else issues.push('Define out-of-scope items');

  if (hasMetrics && hasQuantified) score += 8;
  else if (hasMetrics) { score += 4; issues.push('Quantify success metrics'); }
  else issues.push('Add success metrics');

  return { score: Math.min(25, score), maxScore: 25, issues };
}

function scoreCompleteness(text) {
  let score = 0;
  const issues = [];

  // Section coverage (8 pts)
  let sectionScore = 0;
  const missing = [];
  for (const section of REQUIRED_SECTIONS) {
    if (section.pattern.test(text)) sectionScore += section.weight;
    else missing.push(section.name);
  }
  const maxSectionScore = REQUIRED_SECTIONS.reduce((sum, s) => sum + s.weight, 0);
  if (sectionScore / maxSectionScore >= 0.85) score += 8;
  else if (sectionScore / maxSectionScore >= 0.70) { score += 5; issues.push(`Missing: ${missing.join(', ')}`); }
  else { score += 2; issues.push(`Missing: ${missing.join(', ')}`); }

  // Stakeholders (6 pts)
  const hasStakeholders = /\b(stakeholder|owner|lead|team|responsible)\b/gi.test(text);
  if (hasStakeholders) score += 6;
  else issues.push('Identify stakeholders');

  // Timeline (6 pts)
  const hasTimeline = /\b(week|month|quarter|q[1-4]|phase|milestone)\b/gi.test(text);
  if (hasTimeline) score += 6;
  else issues.push('Add timeline');

  return { score: Math.min(20, score), maxScore: 20, issues };
}

/**
 * Validate a document and return inline scoring results
 * @param {string} text - Document content
 * @returns {Object} Validation results with total score and category breakdowns
 */
export function validateDocument(text) {
  if (!text || typeof text !== 'string' || text.trim().length < 50) {
    return {
      totalScore: 0,
      problemClarity: { score: 0, maxScore: 30, issues: ['No content to validate'] },
      solution: { score: 0, maxScore: 25, issues: ['No content to validate'] },
      scope: { score: 0, maxScore: 25, issues: ['No content to validate'] },
      completeness: { score: 0, maxScore: 20, issues: ['No content to validate'] }
    };
  }

  const problemClarity = scoreProblemClarity(text);
  const solution = scoreSolutionQuality(text);
  const scope = scoreScopeDiscipline(text);
  const completeness = scoreCompleteness(text);

  // AI slop detection
  const slopPenalty = getSlopPenalty(text);
  let slopDeduction = 0;
  const slopIssues = [];

  if (slopPenalty.penalty > 0) {
    slopDeduction = Math.min(5, Math.floor(slopPenalty.penalty * 0.6));
    if (slopPenalty.issues.length > 0) {
      slopIssues.push(...slopPenalty.issues.slice(0, 2));
    }
  }

  const totalScore = Math.max(0,
    problemClarity.score + solution.score + scope.score + completeness.score - slopDeduction
  );

  return {
    totalScore,
    problemClarity,
    solution,
    scope,
    completeness,
    slopDetection: {
      ...slopPenalty,
      deduction: slopDeduction,
      issues: slopIssues
    }
  };
}

/**
 * Get color class for score
 * @param {number} score - Score value (0-100)
 * @returns {string} Tailwind color name
 */
export function getScoreColor(score) {
  if (score >= 70) return 'green';
  if (score >= 50) return 'yellow';
  if (score >= 30) return 'orange';
  return 'red';
}

/**
 * Get human-readable label for score
 * @param {number} score - Score value (0-100)
 * @returns {string} Label text
 */
export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Ready';
  if (score >= 50) return 'Needs Work';
  if (score >= 30) return 'Draft';
  return 'Incomplete';
}
