/**
 * Business Justification Validator - Scoring Logic
 *
 * UNIFIED 4-PILLAR TAXONOMY (aligned with prompts.js and phase prompts):
 * 1. Strategic Evidence (30 pts) - Quantitative data, credible sources, before/after comparisons
 * 2. Financial Justification (25 pts) - Clear ROI, payback period, TCO analysis
 * 3. Options & Alternatives (25 pts) - 3+ options, do-nothing scenario, clear recommendation
 * 4. Execution Completeness (20 pts) - Executive summary, risks, stakeholder concerns addressed
 *
 * CRITICAL: These category names MUST match exactly across:
 * - validator.js (this file)
 * - validator-inline.js
 * - prompts.js
 * - phase2.md review criteria
 */

import { calculateSlopScore, getSlopPenalty } from './slop-detection.js';

// Re-export for direct access
export { calculateSlopScore };

// ============================================================================
// PILLAR 1: Strategic Evidence Patterns (30 pts)
// ============================================================================
const EVIDENCE_PATTERNS = {
  problemSection: /^#+\s*(problem|challenge|pain.?point|context|why|current.?state)/im,
  problemLanguage: /\b(problem|challenge|pain.?point|issue|struggle|difficult|frustrat|current.?state|today|existing)\b/gi,
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer|transaction|k\b|m\b)/gi,
  businessFocus: /\b(business|customer|user|market|revenue|profit|competitive|strategic|value)\b/gi,
  sources: /\b(gartner|forrester|mckinsey|dora|radford|idc|according.to|research|study|survey|benchmark|internal.data)\b/gi,
  beforeAfter: /\b(before|after|from.+to|baseline|current|target|improvement|reduction|increase)\b/gi
};

// ============================================================================
// PILLAR 2: Financial Justification Patterns (25 pts)
// ============================================================================
const FINANCIAL_PATTERNS = {
  financialSection: /^#+\s*(financial|roi|return|investment|cost|budget|tco|payback)/im,
  roiCalculation: /\b(roi|return.on.investment|benefit.?.cost|cost.?.benefit|net.present.value|npv)\b/gi,
  // Improved ROI formula detection from adversarial review:
  // Matches: (benefit - cost) / cost, ROI = 150%, $X/$Y, savings/investment
  // Extended: Also matches variable names like (Total Savings - Implementation) / Implementation
  roiFormula: /(\d+\s*[-−–]\s*\d+)\s*[\/÷]\s*\d+|roi\s*[=:]\s*\d+|\(.*benefit.*[-−–].*cost.*\)\s*[\/÷]|savings\s*[\/÷]\s*investment|\$[\d,]+\s*[\/÷]\s*\$[\d,]+|\([^)]+[-−–][^)]+\)\s*[\/÷]\s*\S+/gi,
  paybackPeriod: /\b(payback|break.?even|recoup|recover.+investment|months?.to.recover)\b/gi,
  paybackTime: /\b(\d+\s*(month|year|week)s?)\b/gi,
  tcoAnalysis: /\b(tco|total.cost.of.ownership|3.?year|three.?year|implementation.cost|training.cost|operational.cost|opportunity.cost|hidden.cost)\b/gi,
  dollarAmounts: /\$\s*[\d,]+(\.\d{2})?|\d+\s*(million|thousand|k|m)\s*(dollar)?s?/gi
};

// ============================================================================
// PILLAR 3: Options & Alternatives Patterns (25 pts)
// ============================================================================
const OPTIONS_PATTERNS = {
  optionsSection: /^#+\s*(option|alternative|approach|scenario|comparison)/im,
  doNothing: /\b(do.?nothing|status.?quo|no.?action|inaction|if.we.don't|without.this|current.path|option.?a)\b/gi,
  alternatives: /\b(alternative|option|approach|scenario|build.vs.buy|buy.vs.build|option.?[abc123]|path.?[abc123])\b/gi,
  recommendation: /\b(recommend|recommendation|proposed|chosen|selected|preferred|our.choice|we.propose)\b/gi,
  comparison: /\b(compare|comparison|versus|vs\.?|trade.?off|pros?.and.cons?|advantage|disadvantage)\b/gi,
  minimalInvestment: /\b(minimal|minimum|low.?cost|basic|mvp|phase.?1|incremental)\b/gi,
  // Added from adversarial review: detect "Full Investment" and similar labels for Option C
  fullInvestment: /\b(full.?investment|full.?option|strategic.?transformation|target.?state|recommended.?approach|option.?c|comprehensive|enterprise.?solution)\b/gi
};

// ============================================================================
// PILLAR 4: Execution Completeness Patterns (20 pts)
// ============================================================================
const EXECUTION_PATTERNS = {
  executiveSummary: /^#+\s*(executive.?summary|summary|tl;?dr|overview)/im,
  risksSection: /^#+\s*(risk|mitigation|contingency)/im,
  riskLanguage: /\b(risk|mitigation|contingency|fallback|if.+fails|worst.case)\b/gi,
  stakeholderSection: /^#+\s*(stakeholder|team|owner|raci|responsible)/im,
  // Extended stakeholder concerns from adversarial review - includes FP&A, People Team
  stakeholderConcerns: /\b(finance|fp&a|fp.?&.?a|financial.planning|hr|people.?team|people.?ops|legal|compliance|equity|liability|approval|sign.?off|cfo|cto|ceo|vp|director)\b/gi,
  timelineSection: /^#+\s*(timeline|milestone|phase|schedule|roadmap)/im,
  scopeSection: /^#+\s*(scope|boundaries|in.scope|out.of.scope)/im
};

// Legacy patterns for backward compatibility
const REQUIRED_SECTIONS = [
  { pattern: /^#+\s*(problem|challenge|pain.?point|context)/im, name: 'Problem/Challenge', weight: 2 },
  { pattern: /^#+\s*(option|alternative|scenario)/im, name: 'Options Analysis', weight: 2 },
  { pattern: /^#+\s*(financial|roi|tco|payback)/im, name: 'Financial Justification', weight: 2 },
  { pattern: /^#+\s*(solution|proposal|approach|recommendation)/im, name: 'Solution/Proposal', weight: 2 },
  { pattern: /^#+\s*(scope|in.scope|out.of.scope)/im, name: 'Scope Definition', weight: 1 },
  { pattern: /^#+\s*(stakeholder|team|owner)/im, name: 'Stakeholders/Team', weight: 1 },
  { pattern: /^#+\s*(risk|mitigation)/im, name: 'Risks/Mitigation', weight: 1 },
  { pattern: /^#+\s*(timeline|milestone|phase)/im, name: 'Timeline/Milestones', weight: 1 }
];

// Legacy pattern aliases for backward compatibility
const STAKEHOLDER_PATTERNS = {
  stakeholderSection: EXECUTION_PATTERNS.stakeholderSection,
  stakeholderLanguage: /\b(stakeholder|owner|lead|team|responsible|accountable|raci|sponsor|approver)\b/gi,
  roleDefinition: /\b(responsible|accountable|consulted|informed|raci)\b/gi
};

const TIMELINE_PATTERNS = {
  timelineSection: EXECUTION_PATTERNS.timelineSection,
  datePatterns: /\b(week|month|quarter|q[1-4]|phase|milestone|sprint|release|v\d+)\b/gi,
  phasing: /\b(phase|stage|wave|iteration|sprint|release)\b/gi
};

const SCOPE_PATTERNS = {
  inScope: /\b(in.scope|included|within.scope|we.will|we.are|we.provide|we.deliver)\b/gi,
  outOfScope: /\b(out.of.scope|not.included|excluded|we.will.not|won't|outside.scope|future|phase.2|post.mvp|not.in.v1)\b/gi,
  scopeSection: EXECUTION_PATTERNS.scopeSection
};

const METRICS_PATTERNS = {
  smart: /\b(specific|measurable|achievable|relevant|time.bound|smart)\b/gi,
  quantified: EVIDENCE_PATTERNS.quantified,
  metricsSection: /^#+\s*(success|metric|kpi|measure|success.metric)/im,
  metricsLanguage: /\b(metric|kpi|measure|target|goal|achieve|reach|improve|reduce|increase)\b/gi
};

const SOLUTION_PATTERNS = {
  solutionSection: /^#+\s*(solution|proposal|approach|recommendation|how)/im,
  solutionLanguage: /\b(solution|approach|proposal|implement|build|create|develop|enable|provide|deliver)\b/gi,
  measurable: /\b(measure|metric|kpi|track|monitor|quantify|achieve|reach|target|goal)\b/gi,
  highlevel: /\b(overview|summary|high.?level|architecture|design|flow|process|workflow)\b/gi,
  avoidImplementation: /\b(code|function|class|method|api|database|sql|algorithm|library|framework)\b/gi
};

// ============================================================================
// Detection Functions (aligned to 4-pillar taxonomy)
// ============================================================================

/**
 * Detect strategic evidence in text (Pillar 1)
 * @param {string} text - Text to analyze
 * @returns {Object} Strategic evidence detection results
 */
export function detectStrategicEvidence(text) {
  const hasProblemSection = EVIDENCE_PATTERNS.problemSection.test(text);
  const problemMatches = text.match(EVIDENCE_PATTERNS.problemLanguage) || [];
  const quantifiedMatches = text.match(EVIDENCE_PATTERNS.quantified) || [];
  const businessMatches = text.match(EVIDENCE_PATTERNS.businessFocus) || [];
  const sourceMatches = text.match(EVIDENCE_PATTERNS.sources) || [];
  const beforeAfterMatches = text.match(EVIDENCE_PATTERNS.beforeAfter) || [];

  return {
    hasProblemSection,
    hasProblemLanguage: problemMatches.length > 0,
    isQuantified: quantifiedMatches.length > 0,
    quantifiedCount: quantifiedMatches.length,
    hasBusinessFocus: businessMatches.length > 0,
    hasSources: sourceMatches.length > 0,
    sourceCount: sourceMatches.length,
    hasBeforeAfter: beforeAfterMatches.length > 0,
    indicators: [
      hasProblemSection && 'Dedicated problem section',
      problemMatches.length > 0 && 'Problem framing language',
      quantifiedMatches.length > 0 && `${quantifiedMatches.length} quantified metrics`,
      businessMatches.length > 0 && 'Business/customer focus',
      sourceMatches.length > 0 && `${sourceMatches.length} credible sources cited`,
      beforeAfterMatches.length > 0 && 'Before/after comparisons'
    ].filter(Boolean)
  };
}

/**
 * Detect financial justification in text (Pillar 2)
 * @param {string} text - Text to analyze
 * @returns {Object} Financial justification detection results
 */
export function detectFinancialJustification(text) {
  const hasFinancialSection = FINANCIAL_PATTERNS.financialSection.test(text);
  const roiMatches = text.match(FINANCIAL_PATTERNS.roiCalculation) || [];
  const roiFormulaMatches = text.match(FINANCIAL_PATTERNS.roiFormula) || [];
  const paybackMatches = text.match(FINANCIAL_PATTERNS.paybackPeriod) || [];
  const paybackTimeMatches = text.match(FINANCIAL_PATTERNS.paybackTime) || [];
  const tcoMatches = text.match(FINANCIAL_PATTERNS.tcoAnalysis) || [];
  const dollarMatches = text.match(FINANCIAL_PATTERNS.dollarAmounts) || [];

  return {
    hasFinancialSection,
    hasROI: roiMatches.length > 0,
    hasROIFormula: roiFormulaMatches.length > 0,
    hasPayback: paybackMatches.length > 0,
    hasPaybackTime: paybackTimeMatches.length > 0,
    hasTCO: tcoMatches.length > 0,
    hasDollarAmounts: dollarMatches.length > 0,
    dollarCount: dollarMatches.length,
    indicators: [
      hasFinancialSection && 'Dedicated financial section',
      roiMatches.length > 0 && 'ROI calculation mentioned',
      roiFormulaMatches.length > 0 && 'Explicit ROI formula present',
      paybackMatches.length > 0 && 'Payback period discussed',
      paybackTimeMatches.length > 0 && 'Specific payback timeline',
      tcoMatches.length > 0 && 'TCO/3-year analysis present',
      dollarMatches.length > 0 && `${dollarMatches.length} dollar amounts specified`
    ].filter(Boolean)
  };
}

/**
 * Detect options analysis in text (Pillar 3)
 * @param {string} text - Text to analyze
 * @returns {Object} Options analysis detection results
 */
export function detectOptionsAnalysis(text) {
  const hasOptionsSection = OPTIONS_PATTERNS.optionsSection.test(text);
  const doNothingMatches = text.match(OPTIONS_PATTERNS.doNothing) || [];
  const alternativeMatches = text.match(OPTIONS_PATTERNS.alternatives) || [];
  const recommendationMatches = text.match(OPTIONS_PATTERNS.recommendation) || [];
  const comparisonMatches = text.match(OPTIONS_PATTERNS.comparison) || [];
  const minimalMatches = text.match(OPTIONS_PATTERNS.minimalInvestment) || [];
  const fullMatches = text.match(OPTIONS_PATTERNS.fullInvestment) || [];

  return {
    hasOptionsSection,
    hasDoNothing: doNothingMatches.length > 0,
    doNothingCount: doNothingMatches.length,
    hasAlternatives: alternativeMatches.length > 0,
    alternativeCount: alternativeMatches.length,
    hasRecommendation: recommendationMatches.length > 0,
    hasComparison: comparisonMatches.length > 0,
    hasMinimalOption: minimalMatches.length > 0,
    hasFullOption: fullMatches.length > 0,
    indicators: [
      hasOptionsSection && 'Dedicated options section',
      doNothingMatches.length > 0 && 'Do-nothing scenario analyzed',
      alternativeMatches.length > 0 && `${alternativeMatches.length} alternatives considered`,
      recommendationMatches.length > 0 && 'Clear recommendation present',
      comparisonMatches.length > 0 && 'Comparison/trade-off analysis',
      minimalMatches.length > 0 && 'Minimal investment option considered',
      fullMatches.length > 0 && 'Full investment option considered'
    ].filter(Boolean)
  };
}

/**
 * Detect execution completeness in text (Pillar 4)
 * @param {string} text - Text to analyze
 * @returns {Object} Execution completeness detection results
 */
export function detectExecutionCompleteness(text) {
  const hasExecSummary = EXECUTION_PATTERNS.executiveSummary.test(text);
  const hasRisksSection = EXECUTION_PATTERNS.risksSection.test(text);
  const riskMatches = text.match(EXECUTION_PATTERNS.riskLanguage) || [];
  const hasStakeholderSection = EXECUTION_PATTERNS.stakeholderSection.test(text);
  const stakeholderConcernMatches = text.match(EXECUTION_PATTERNS.stakeholderConcerns) || [];
  const hasTimelineSection = EXECUTION_PATTERNS.timelineSection.test(text);
  const hasScopeSection = EXECUTION_PATTERNS.scopeSection.test(text);

  return {
    hasExecSummary,
    hasRisksSection,
    hasRiskLanguage: riskMatches.length > 0,
    riskCount: riskMatches.length,
    hasStakeholderSection,
    hasStakeholderConcerns: stakeholderConcernMatches.length > 0,
    stakeholderConcernCount: stakeholderConcernMatches.length,
    hasTimelineSection,
    hasScopeSection,
    indicators: [
      hasExecSummary && 'Executive summary present',
      hasRisksSection && 'Dedicated risks section',
      riskMatches.length > 0 && `${riskMatches.length} risk/mitigation mentions`,
      hasStakeholderSection && 'Stakeholders identified',
      stakeholderConcernMatches.length > 0 && 'Finance/HR/Legal concerns addressed',
      hasTimelineSection && 'Timeline defined',
      hasScopeSection && 'Scope boundaries set'
    ].filter(Boolean)
  };
}

// Legacy detection functions for backward compatibility
export function detectProblemStatement(text) {
  return detectStrategicEvidence(text);
}

export function detectCostOfInaction(text) {
  const costMatches = text.match(OPTIONS_PATTERNS.doNothing) || [];
  const quantifiedMatches = text.match(EVIDENCE_PATTERNS.quantified) || [];
  const hasCostSection = /^#+\s*(cost|impact|consequence|risk|why.now|urgency|inaction)/im.test(text);

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

export function detectSolution(text) {
  const hasSolutionSection = /^#+\s*(solution|proposal|approach|recommendation|how)/im.test(text);
  const solutionMatches = text.match(/\b(solution|approach|proposal|implement|build|create|develop|enable|provide|deliver)\b/gi) || [];
  const measurableMatches = text.match(/\b(measure|metric|kpi|track|monitor|quantify|achieve|reach|target|goal)\b/gi) || [];
  const highlevelMatches = text.match(/\b(overview|summary|high.?level|architecture|design|flow|process|workflow)\b/gi) || [];
  const implementationMatches = text.match(/\b(code|function|class|method|api|database|sql|algorithm|library|framework)\b/gi) || [];

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
// Scoring Functions (aligned to 4-pillar taxonomy)
// ============================================================================

/**
 * Score Strategic Evidence (30 pts max) - Pillar 1
 * Quantitative data, credible sources, before/after comparisons
 * @param {string} text - Business justification content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreStrategicEvidence(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 30;

  const evidence = detectStrategicEvidence(text);

  // Problem statement with quantified metrics (0-12 pts)
  if (evidence.hasProblemSection && evidence.isQuantified && evidence.quantifiedCount >= 3) {
    score += 12;
    strengths.push(`Strong quantified problem statement (${evidence.quantifiedCount} metrics)`);
  } else if (evidence.hasProblemSection && evidence.isQuantified) {
    score += 8;
    issues.push('Add more quantified metrics - aim for 80/20 quant/qual ratio');
  } else if (evidence.hasProblemLanguage) {
    score += 4;
    issues.push('Problem statement lacks quantified data - add specific numbers');
  } else {
    issues.push('Problem statement missing or unclear - define with specific metrics');
  }

  // Credible sources cited (0-10 pts)
  if (evidence.hasSources && evidence.sourceCount >= 2) {
    score += 10;
    strengths.push(`${evidence.sourceCount} credible sources cited`);
  } else if (evidence.hasSources) {
    score += 5;
    issues.push('Add more sources - cite industry benchmarks or internal data with dates');
  } else {
    issues.push('No sources cited - add Gartner, Forrester, internal data, or other benchmarks');
  }

  // Business/customer focus with before/after (0-8 pts)
  if (evidence.hasBusinessFocus && evidence.hasBeforeAfter) {
    score += 8;
    strengths.push('Clear business focus with before/after comparison');
  } else if (evidence.hasBusinessFocus) {
    score += 4;
    issues.push('Add before/after comparison to show baseline vs target');
  } else {
    issues.push('Strengthen business/customer focus - explain why this matters to stakeholders');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

/**
 * Score Financial Justification (25 pts max) - Pillar 2
 * ROI, payback period, TCO analysis
 * @param {string} text - Business justification content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreFinancialJustification(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const financial = detectFinancialJustification(text);

  // ROI calculation with explicit formula (0-10 pts)
  if (financial.hasROI && financial.hasROIFormula) {
    score += 10;
    strengths.push('ROI calculation with explicit formula');
  } else if (financial.hasROI) {
    score += 5;
    issues.push('ROI mentioned but missing explicit formula - use (Benefit - Cost) / Cost × 100');
  } else {
    issues.push('ROI calculation missing - add return on investment analysis');
  }

  // Payback period stated (0-8 pts)
  if (financial.hasPayback && financial.hasPaybackTime) {
    score += 8;
    strengths.push('Payback period specified with timeline');
  } else if (financial.hasPayback) {
    score += 4;
    issues.push('Payback period mentioned but no specific timeline - target <12 months');
  } else {
    issues.push('Payback period missing - state time to recoup investment');
  }

  // 3-year TCO analysis (0-7 pts)
  if (financial.hasTCO && financial.hasDollarAmounts) {
    score += 7;
    strengths.push('TCO analysis with dollar amounts');
  } else if (financial.hasTCO) {
    score += 4;
    issues.push('TCO mentioned but lacks specific dollar amounts');
  } else {
    issues.push('TCO missing - add 3-year view including implementation, training, ops costs');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

/**
 * Score Options & Alternatives (25 pts max) - Pillar 3
 * 3+ options, do-nothing scenario, clear recommendation
 * @param {string} text - Business justification content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreOptionsAnalysis(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  const options = detectOptionsAnalysis(text);

  // Do-nothing scenario quantified (0-10 pts)
  if (options.hasDoNothing && options.doNothingCount >= 2) {
    score += 10;
    strengths.push('Do-nothing scenario thoroughly analyzed');
  } else if (options.hasDoNothing) {
    score += 6;
    issues.push('Do-nothing scenario mentioned - quantify the cost/risk of inaction');
  } else {
    issues.push('Do-nothing scenario missing - explain what happens if we do nothing');
  }

  // Multiple alternatives considered (0-10 pts)
  // Accept either minimal or full investment option to award full points (from adversarial review)
  const hasInvestmentOption = options.hasMinimalOption || options.hasFullOption;
  if (options.hasAlternatives && options.alternativeCount >= 3 && hasInvestmentOption) {
    score += 10;
    strengths.push(`${options.alternativeCount} alternatives analyzed with investment options`);
  } else if (options.hasAlternatives && options.alternativeCount >= 2) {
    score += 6;
    issues.push('Add minimal or full investment option as alternative');
  } else if (options.hasAlternatives) {
    score += 3;
    issues.push('Only one alternative - add at least 3 options (do-nothing, minimal, full)');
  } else {
    issues.push('Alternatives missing - analyze at least 3 options');
  }

  // Clear recommendation with comparison (0-5 pts)
  if (options.hasRecommendation && options.hasComparison) {
    score += 5;
    strengths.push('Clear recommendation with trade-off analysis');
  } else if (options.hasRecommendation) {
    score += 3;
    issues.push('Recommendation present - add pros/cons comparison');
  } else {
    issues.push('Recommendation missing - state which option and why');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

/**
 * Score Execution Completeness (20 pts max) - Pillar 4
 * Executive summary, risks, stakeholder concerns addressed
 * @param {string} text - Business justification content
 * @returns {Object} Score result with issues and strengths
 */
export function scoreExecutionCompleteness(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 20;

  const execution = detectExecutionCompleteness(text);

  // Executive summary present and complete (0-6 pts)
  if (execution.hasExecSummary) {
    score += 6;
    strengths.push('Executive summary present');
  } else {
    issues.push('Executive summary missing - add TL;DR readable in 30 seconds');
  }

  // Risks identified with mitigation (0-7 pts)
  if (execution.hasRisksSection && execution.hasRiskLanguage && execution.riskCount >= 3) {
    score += 7;
    strengths.push(`${execution.riskCount} risks identified with mitigation strategies`);
  } else if (execution.hasRisksSection) {
    score += 4;
    issues.push('Risks section present - add more risks with mitigation strategies');
  } else {
    issues.push('Risks section missing - identify risks and mitigation strategies');
  }

  // Stakeholder concerns addressed (0-7 pts)
  if (execution.hasStakeholderSection && execution.hasStakeholderConcerns) {
    score += 7;
    strengths.push('Stakeholder concerns (Finance/HR/Legal) addressed');
  } else if (execution.hasStakeholderSection) {
    score += 4;
    issues.push('Stakeholders identified - address Finance, HR, Legal concerns');
  } else {
    issues.push('Stakeholder section missing - identify and address stakeholder concerns');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths };
}

// Legacy scoring function aliases for backward compatibility
export function scoreProblemClarity(text) {
  return scoreStrategicEvidence(text);
}

export function scoreSolutionQuality(text) {
  return scoreFinancialJustification(text);
}

export function scoreScopeDiscipline(text) {
  return scoreOptionsAnalysis(text);
}

export function scoreCompleteness(text) {
  return scoreExecutionCompleteness(text);
}

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validate a business justification and return comprehensive scoring results
 * Uses unified 4-pillar taxonomy aligned with prompts.js and phase prompts:
 * 1. Strategic Evidence (30 pts)
 * 2. Financial Justification (25 pts)
 * 3. Options & Alternatives (25 pts)
 * 4. Execution Completeness (20 pts)
 *
 * @param {string} text - Business justification content
 * @returns {Object} Complete validation results
 */
export function validateOnePager(text) {
  if (!text || typeof text !== 'string') {
    return {
      totalScore: 0,
      strategicEvidence: { score: 0, maxScore: 30, issues: ['No content to validate'], strengths: [] },
      financialJustification: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      optionsAnalysis: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      executionCompleteness: { score: 0, maxScore: 20, issues: ['No content to validate'], strengths: [] },
      // Legacy property names for backward compatibility
      problemClarity: { score: 0, maxScore: 30, issues: ['No content to validate'], strengths: [] },
      solution: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      scope: { score: 0, maxScore: 25, issues: ['No content to validate'], strengths: [] },
      completeness: { score: 0, maxScore: 20, issues: ['No content to validate'], strengths: [] }
    };
  }

  // Score using unified 4-pillar taxonomy
  const strategicEvidence = scoreStrategicEvidence(text);
  const financialJustification = scoreFinancialJustification(text);
  const optionsAnalysis = scoreOptionsAnalysis(text);
  const executionCompleteness = scoreExecutionCompleteness(text);

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
    strategicEvidence.score + financialJustification.score +
    optionsAnalysis.score + executionCompleteness.score - slopDeduction
  );

  return {
    totalScore,
    // Primary property names (unified 4-pillar taxonomy)
    strategicEvidence,
    financialJustification,
    optionsAnalysis,
    executionCompleteness,
    // Legacy property names for backward compatibility
    problemClarity: strategicEvidence,
    solution: financialJustification,
    scope: optionsAnalysis,
    completeness: executionCompleteness,
    // Dimension mappings for app.js compatibility
    dimension1: strategicEvidence,
    dimension2: financialJustification,
    dimension3: optionsAnalysis,
    dimension4: executionCompleteness,
    // CUSTOMIZE: Include slopDetection in return for transparency
    slopDetection: {
      ...slopPenalty,
      deduction: slopDeduction,
      issues: slopIssues
    }
  };
}
