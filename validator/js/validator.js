/**
 * One-Pager Validator - Scoring Logic
 *
 * Scoring Dimensions:
 * 1. Problem Clarity (30 pts) - Problem statement, cost of inaction, customer focus
 * 2. Solution Quality (25 pts) - Solution addresses problem, measurable goals, high-level
 * 3. Scope Discipline (25 pts) - In/out scope, success metrics, SMART criteria
 * 4. Completeness (20 pts) - Required sections, stakeholders, timeline
 *
 * CUSTOMIZE: Import slop detection for AI-generated content detection
 */

import { calculateSlopScore, getSlopPenalty } from './slop-detection.js';

// Re-export for direct access
export { calculateSlopScore };

// ============================================================================
// Constants
// ============================================================================

const REQUIRED_SECTIONS = [
  { pattern: /^#+\s*(problem|challenge|pain.?point|context)/im, name: 'Problem/Challenge', weight: 2 },
  { pattern: /^#+\s*(solution|proposal|approach|recommendation)/im, name: 'Solution/Proposal', weight: 2 },
  { pattern: /^#+\s*(goal|objective|benefit|outcome)/im, name: 'Goals/Benefits', weight: 2 },
  { pattern: /^#+\s*(scope|in.scope|out.of.scope|boundary|boundaries)/im, name: 'Scope Definition', weight: 2 },
  { pattern: /^#+\s*(success|metric|kpi|measure|success.metric)/im, name: 'Success Metrics', weight: 1 },
  { pattern: /^#+\s*(stakeholder|team|owner|raci|responsible)/im, name: 'Stakeholders/Team', weight: 1 },
  { pattern: /^#+\s*(timeline|milestone|phase|schedule|roadmap)/im, name: 'Timeline/Milestones', weight: 1 }
];

// Problem clarity patterns
const PROBLEM_PATTERNS = {
  problemSection: /^#+\s*(problem|challenge|pain.?point|context|why)/im,
  problemLanguage: /\b(problem|challenge|pain.?point|issue|struggle|difficult|frustrat|current.?state|today|existing)\b/gi,
  costOfInaction: /\b(cost|impact|consequence|risk|without|if.?not|delay|postpone|inaction|doing.?nothing|status.?quo)\b/gi,
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer|transaction)/gi,
  businessFocus: /\b(business|customer|user|market|revenue|profit|competitive|strategic|value)\b/gi
};

// Solution patterns
const SOLUTION_PATTERNS = {
  solutionSection: /^#+\s*(solution|proposal|approach|recommendation|how)/im,
  solutionLanguage: /\b(solution|approach|proposal|implement|build|create|develop|enable|provide|deliver)\b/gi,
  measurable: /\b(measure|metric|kpi|track|monitor|quantify|achieve|reach|target|goal)\b/gi,
  highlevel: /\b(overview|summary|high.?level|architecture|design|flow|process|workflow)\b/gi,
  avoidImplementation: /\b(code|function|class|method|api|database|sql|algorithm|library|framework)\b/gi
};

// Scope patterns
const SCOPE_PATTERNS = {
  inScope: /\b(in.scope|included|within.scope|we.will|we.are|we.provide|we.deliver)\b/gi,
  outOfScope: /\b(out.of.scope|not.included|excluded|we.will.not|won't|outside.scope|future|phase.2|post.mvp|not.in.v1)\b/gi,
  scopeSection: /^#+\s*(scope|boundaries|in.scope|out.of.scope)/im
};

// Success metrics patterns
const METRICS_PATTERNS = {
  smart: /\b(specific|measurable|achievable|relevant|time.bound|smart)\b/gi,
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer|transaction|request|response)/gi,
  metricsSection: /^#+\s*(success|metric|kpi|measure|success.metric)/im,
  metricsLanguage: /\b(metric|kpi|measure|target|goal|achieve|reach|improve|reduce|increase)\b/gi
};

// Stakeholder patterns
const STAKEHOLDER_PATTERNS = {
  stakeholderSection: /^#+\s*(stakeholder|team|owner|raci|responsible|responsible.accountable)/im,
  stakeholderLanguage: /\b(stakeholder|owner|lead|team|responsible|accountable|raci|sponsor|approver)\b/gi,
  roleDefinition: /\b(responsible|accountable|consulted|informed|raci)\b/gi
};

// Timeline patterns
const TIMELINE_PATTERNS = {
  timelineSection: /^#+\s*(timeline|milestone|phase|schedule|roadmap)/im,
  datePatterns: /\b(week|month|quarter|q[1-4]|phase|milestone|sprint|release|v\d+)\b/gi,
  phasing: /\b(phase|stage|wave|iteration|sprint|release)\b/gi
};

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Detect problem statement in text
 * @param {string} text - Text to analyze
 * @returns {Object} Problem detection results
 */
export function detectProblemStatement(text) {
  const hasProblemSection = PROBLEM_PATTERNS.problemSection.test(text);
  const problemMatches = text.match(PROBLEM_PATTERNS.problemLanguage) || [];
  const costMatches = text.match(PROBLEM_PATTERNS.costOfInaction) || [];
  const quantifiedMatches = text.match(PROBLEM_PATTERNS.quantified) || [];
  const businessMatches = text.match(PROBLEM_PATTERNS.businessFocus) || [];

  return {
    hasProblemSection,
    hasProblemLanguage: problemMatches.length > 0,
    hasCostOfInaction: costMatches.length > 0,
    isQuantified: quantifiedMatches.length > 0,
    quantifiedCount: quantifiedMatches.length,
    hasBusinessFocus: businessMatches.length > 0,
    indicators: [
      hasProblemSection && 'Dedicated problem section',
      problemMatches.length > 0 && 'Problem framing language',
      costMatches.length > 0 && 'Cost of inaction mentioned',
      quantifiedMatches.length > 0 && `${quantifiedMatches.length} quantified metrics`,
      businessMatches.length > 0 && 'Business/customer focus'
    ].filter(Boolean)
  };
}

/**
 * Detect cost of inaction in text
 * @param {string} text - Text to analyze
 * @returns {Object} Cost of inaction detection results
 */
export function detectCostOfInaction(text) {
  const costMatches = text.match(PROBLEM_PATTERNS.costOfInaction) || [];
  const quantifiedMatches = text.match(PROBLEM_PATTERNS.quantified) || [];
  const hasCostSection = /^#+\s*(cost|impact|consequence|risk|why.now|urgency)/im.test(text);

  return {
    hasCostLanguage: costMatches.length > 0,
    costCount: costMatches.length,
    isQuantified: quantifiedMatches.length > 0,
    quantifiedCount: quantifiedMatches.length,
    hasCostSection,
    indicators: [
      costMatches.length > 0 && `${costMatches.length} cost/impact references`,
      quantifiedMatches.length > 0 && `${quantifiedMatches.length} quantified values`,
      hasCostSection && 'Dedicated cost/impact section'
    ].filter(Boolean)
  };
}

/**
 * Detect solution in text
 * @param {string} text - Text to analyze
 * @returns {Object} Solution detection results
 */
export function detectSolution(text) {
  const hasSolutionSection = SOLUTION_PATTERNS.solutionSection.test(text);
  const solutionMatches = text.match(SOLUTION_PATTERNS.solutionLanguage) || [];
  const measurableMatches = text.match(SOLUTION_PATTERNS.measurable) || [];
  const highlevelMatches = text.match(SOLUTION_PATTERNS.highlevel) || [];
  const implementationMatches = text.match(SOLUTION_PATTERNS.avoidImplementation) || [];

  return {
    hasSolutionSection,
    hasSolutionLanguage: solutionMatches.length > 0,
    hasMeasurable: measurableMatches.length > 0,
    isHighLevel: highlevelMatches.length > 0 && implementationMatches.length === 0,
    hasImplementationDetails: implementationMatches.length > 0,
    indicators: [
      hasSolutionSection && 'Dedicated solution section',
      solutionMatches.length > 0 && 'Solution language present',
      measurableMatches.length > 0 && 'Measurable outcomes mentioned',
      highlevelMatches.length > 0 && 'High-level approach described',
      implementationMatches.length === 0 && 'No implementation details (good)'
    ].filter(Boolean)
  };
}

/**
 * Detect measurable goals in text
 * @param {string} text - Text to analyze
 * @returns {Object} Measurable goals detection results
 */
export function detectMeasurableGoals(text) {
  const measurableMatches = text.match(SOLUTION_PATTERNS.measurable) || [];
  const quantifiedMatches = text.match(SOLUTION_PATTERNS.measurable) || [];
  const goalMatches = text.match(/\b(goal|objective|benefit|outcome|result)\b/gi) || [];

  return {
    hasMeasurable: measurableMatches.length > 0,
    measurableCount: measurableMatches.length,
    hasQuantified: quantifiedMatches.length > 0,
    hasGoals: goalMatches.length > 0,
    goalCount: goalMatches.length,
    indicators: [
      measurableMatches.length > 0 && `${measurableMatches.length} measurable terms`,
      goalMatches.length > 0 && `${goalMatches.length} goal/objective mentions`,
      quantifiedMatches.length > 0 && 'Quantified metrics present'
    ].filter(Boolean)
  };
}

/**
 * Detect scope definitions in text
 * @param {string} text - Text to analyze
 * @returns {Object} Scope detection results
 */
export function detectScope(text) {
  const inScopeMatches = text.match(SCOPE_PATTERNS.inScope) || [];
  const outOfScopeMatches = text.match(SCOPE_PATTERNS.outOfScope) || [];
  const hasScopeSection = SCOPE_PATTERNS.scopeSection.test(text);

  return {
    hasInScope: inScopeMatches.length > 0,
    inScopeCount: inScopeMatches.length,
    hasOutOfScope: outOfScopeMatches.length > 0,
    outOfScopeCount: outOfScopeMatches.length,
    hasBothBoundaries: inScopeMatches.length > 0 && outOfScopeMatches.length > 0,
    hasScopeSection,
    indicators: [
      inScopeMatches.length > 0 && 'In-scope items defined',
      outOfScopeMatches.length > 0 && 'Out-of-scope items defined',
      hasScopeSection && 'Dedicated scope section'
    ].filter(Boolean)
  };
}

/**
 * Detect success metrics in text
 * @param {string} text - Text to analyze
 * @returns {Object} Success metrics detection results
 */
export function detectSuccessMetrics(text) {
  const smartMatches = text.match(METRICS_PATTERNS.smart) || [];
  const quantifiedMatches = text.match(METRICS_PATTERNS.quantified) || [];
  const metricsMatches = text.match(METRICS_PATTERNS.metricsLanguage) || [];
  const hasMetricsSection = METRICS_PATTERNS.metricsSection.test(text);

  return {
    hasMetricsSection,
    hasSmart: smartMatches.length > 0,
    smartCount: smartMatches.length,
    hasQuantified: quantifiedMatches.length > 0,
    quantifiedCount: quantifiedMatches.length,
    hasMetrics: metricsMatches.length > 0,
    metricsCount: metricsMatches.length,
    indicators: [
      hasMetricsSection && 'Dedicated metrics section',
      smartMatches.length > 0 && 'SMART criteria mentioned',
      quantifiedMatches.length > 0 && `${quantifiedMatches.length} quantified metrics`,
      metricsMatches.length > 0 && `${metricsMatches.length} metric references`
    ].filter(Boolean)
  };
}

/**
 * Detect sections in text
 * @param {string} text - Text to analyze
 * @returns {Object} Sections found and missing
 */
export function detectSections(text) {
  const found = [];
  const missing = [];

  for (const section of REQUIRED_SECTIONS) {
    if (section.pattern.test(text)) {
      found.push({ name: section.name, weight: section.weight });
    } else {
      missing.push({ name: section.name, weight: section.weight });
    }
  }

  return { found, missing };
}

/**
 * Detect stakeholders in text
 * @param {string} text - Text to analyze
 * @returns {Object} Stakeholder detection results
 */
export function detectStakeholders(text) {
  const stakeholderMatches = text.match(STAKEHOLDER_PATTERNS.stakeholderLanguage) || [];
  const roleMatches = text.match(STAKEHOLDER_PATTERNS.roleDefinition) || [];
  const hasStakeholderSection = STAKEHOLDER_PATTERNS.stakeholderSection.test(text);

  return {
    hasStakeholderSection,
    hasStakeholders: stakeholderMatches.length > 0,
    stakeholderCount: stakeholderMatches.length,
    hasRoles: roleMatches.length > 0,
    roleCount: roleMatches.length,
    indicators: [
      hasStakeholderSection && 'Dedicated stakeholder section',
      stakeholderMatches.length > 0 && `${stakeholderMatches.length} stakeholder references`,
      roleMatches.length > 0 && 'Roles/responsibilities defined'
    ].filter(Boolean)
  };
}

/**
 * Detect timeline in text
 * @param {string} text - Text to analyze
 * @returns {Object} Timeline detection results
 */
export function detectTimeline(text) {
  const dateMatches = text.match(TIMELINE_PATTERNS.datePatterns) || [];
  const phasingMatches = text.match(TIMELINE_PATTERNS.phasing) || [];
  const hasTimelineSection = TIMELINE_PATTERNS.timelineSection.test(text);

  return {
    hasTimelineSection,
    hasTimeline: dateMatches.length > 0,
    dateCount: dateMatches.length,
    hasPhasing: phasingMatches.length > 0,
    phasingCount: phasingMatches.length,
    indicators: [
      hasTimelineSection && 'Dedicated timeline section',
      dateMatches.length > 0 && `${dateMatches.length} timeline references`,
      phasingMatches.length > 0 && `${phasingMatches.length} phases/milestones`
    ].filter(Boolean)
  };
}

// ============================================================================
// Scoring Functions
// ============================================================================

/**
 * Score problem clarity (30 pts max)
 * @param {string} text - One-pager content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreProblemClarity(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 30;

  // Problem statement exists and is specific (0-10 pts)
  const problemDetection = detectProblemStatement(text);
  if (problemDetection.hasProblemSection && problemDetection.hasProblemLanguage) {
    score += 10;
    strengths.push('Clear problem statement with dedicated section');
  } else if (problemDetection.hasProblemLanguage) {
    score += 6;
    issues.push('Problem mentioned but lacks dedicated section');
  } else {
    issues.push('Problem statement missing or unclear - define the specific problem');
  }

  // Cost of doing nothing present and quantified (0-10 pts)
  const costDetection = detectCostOfInaction(text);
  if (costDetection.hasCostLanguage && costDetection.isQuantified) {
    score += 10;
    strengths.push('Cost of inaction quantified with specific metrics');
  } else if (costDetection.hasCostLanguage) {
    score += 5;
    issues.push('Cost of inaction mentioned but not quantified - add numbers/percentages');
  } else {
    issues.push('Missing cost of inaction - explain impact of not solving this problem');
  }

  // Problem is customer/business focused (0-10 pts)
  if (problemDetection.hasBusinessFocus) {
    score += 10;
    strengths.push('Problem clearly tied to customer/business value');
  } else {
    issues.push('Strengthen customer/business focus - explain why this matters to stakeholders');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

/**
 * Score solution quality (25 pts max)
 * @param {string} text - One-pager content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreSolutionQuality(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  // Solution addresses stated problem (0-10 pts)
  const solutionDetection = detectSolution(text);
  const problemDetection = detectProblemStatement(text);

  if (solutionDetection.hasSolutionSection && problemDetection.hasProblemLanguage) {
    score += 10;
    strengths.push('Solution clearly addresses stated problem');
  } else if (solutionDetection.hasSolutionLanguage) {
    score += 6;
    issues.push('Solution present but connection to problem could be clearer');
  } else {
    issues.push('Solution section missing or unclear');
  }

  // Key goals/benefits are measurable (0-10 pts)
  const goalsDetection = detectMeasurableGoals(text);
  if (goalsDetection.hasMeasurable && goalsDetection.hasGoals) {
    score += 10;
    strengths.push('Goals are measurable and well-defined');
  } else if (goalsDetection.hasGoals) {
    score += 5;
    issues.push('Goals defined but not measurable - add specific metrics');
  } else {
    issues.push('Goals/benefits missing - define what success looks like');
  }

  // Solution is high-level, not implementation (0-5 pts)
  if (solutionDetection.isHighLevel && !solutionDetection.hasImplementationDetails) {
    score += 5;
    strengths.push('Solution stays at appropriate high-level');
  } else if (solutionDetection.hasImplementationDetails) {
    issues.push('Solution includes too much implementation detail - keep it high-level');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

/**
 * Score scope discipline (25 pts max)
 * @param {string} text - One-pager content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreScopeDiscipline(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  // In-scope clearly defined (0-8 pts)
  const scopeDetection = detectScope(text);
  if (scopeDetection.hasInScope && scopeDetection.hasScopeSection) {
    score += 8;
    strengths.push('In-scope items clearly defined');
  } else if (scopeDetection.hasInScope) {
    score += 4;
    issues.push('In-scope items mentioned but lack dedicated section');
  } else {
    issues.push('In-scope not clearly defined - list what you WILL do');
  }

  // Out-of-scope explicitly stated (0-9 pts)
  if (scopeDetection.hasOutOfScope) {
    score += 9;
    strengths.push('Out-of-scope explicitly defined');
  } else {
    issues.push('Out-of-scope missing - explicitly state what you WON\'T do');
  }

  // Success metrics are SMART (0-8 pts)
  const metricsDetection = detectSuccessMetrics(text);
  if (metricsDetection.hasMetricsSection && metricsDetection.hasQuantified) {
    score += 8;
    strengths.push('Success metrics are SMART and quantified');
  } else if (metricsDetection.hasMetrics) {
    score += 4;
    issues.push('Metrics present but not SMART - make them Specific, Measurable, Achievable, Relevant, Time-bound');
  } else {
    issues.push('Success metrics missing - define how you\'ll measure success');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

/**
 * Score completeness (20 pts max)
 * @param {string} text - One-pager content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreCompleteness(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 20;

  // All required sections present (0-8 pts)
  const sections = detectSections(text);
  const sectionScore = sections.found.reduce((sum, s) => sum + s.weight, 0);
  const maxSectionScore = REQUIRED_SECTIONS.reduce((sum, s) => sum + s.weight, 0);
  const sectionPercentage = sectionScore / maxSectionScore;

  if (sectionPercentage >= 0.85) {
    score += 8;
    strengths.push(`${sections.found.length}/${REQUIRED_SECTIONS.length} required sections present`);
  } else if (sectionPercentage >= 0.70) {
    score += 5;
    issues.push(`Missing sections: ${sections.missing.map(s => s.name).join(', ')}`);
  } else {
    score += 2;
    issues.push(`Only ${sections.found.length} of ${REQUIRED_SECTIONS.length} sections present`);
  }

  // Stakeholders clearly identified (0-6 pts)
  const stakeholderDetection = detectStakeholders(text);
  if (stakeholderDetection.hasStakeholderSection && stakeholderDetection.hasRoles) {
    score += 6;
    strengths.push('Stakeholders and roles clearly identified');
  } else if (stakeholderDetection.hasStakeholders) {
    score += 3;
    issues.push('Stakeholders mentioned but roles not clearly defined');
  } else {
    issues.push('Stakeholders not identified - list who\'s involved and their roles');
  }

  // Timeline is realistic and phased (0-6 pts)
  const timelineDetection = detectTimeline(text);
  if (timelineDetection.hasTimelineSection && timelineDetection.hasPhasing) {
    score += 6;
    strengths.push('Timeline is phased and realistic');
  } else if (timelineDetection.hasTimeline) {
    score += 3;
    issues.push('Timeline present but lacks clear phasing');
  } else {
    issues.push('Timeline missing - provide realistic milestones and phases');
  }

  return {
    score: Math.min(score, maxScore),
    maxScore,
    issues,
    strengths
  };
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validate a one-pager and return comprehensive scoring results
 * @param {string} text - One-pager content
 * @returns {Object} Complete validation results
 */
export function validateOnePager(text) {
  if (!text || typeof text !== 'string') {
    return {
      totalScore: 0,
      problemClarity: { score: 0, maxScore: 30, issues: ['No content to validate'], strengths: [] },
      solution: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      scope: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      completeness: { score: 0, maxScore: 20, issues: ['No content to validate'], strengths: [] }
    };
  }

  const problemClarity = scoreProblemClarity(text);
  const solution = scoreSolutionQuality(text);
  const scope = scoreScopeDiscipline(text);
  const completeness = scoreCompleteness(text);

  // CUSTOMIZE: AI slop detection - adjust penalty weight for your document type
  const slopPenalty = getSlopPenalty(text);
  let slopDeduction = 0;
  const slopIssues = [];

  if (slopPenalty.penalty > 0) {
    // CUSTOMIZE: Adjust max penalty (5) and multiplier (0.6) for your document type
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
    // CUSTOMIZE: Include slopDetection in return for transparency
    slopDetection: {
      ...slopPenalty,
      deduction: slopDeduction,
      issues: slopIssues
    }
  };
}
