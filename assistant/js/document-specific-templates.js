/**
 * Document-Specific Templates for One-Pager
 * Pre-filled content for common one-pager use cases
 * @module document-specific-templates
 */

/**
 * @typedef {Object} OnePagerTemplate
 * @property {string} id - Unique template identifier
 * @property {string} name - Display name
 * @property {string} icon - Emoji icon
 * @property {string} description - Short description
 * @property {string} problemStatement - Pre-filled problem statement
 * @property {string} costOfDoingNothing - Pre-filled cost of inaction
 * @property {string} context - Pre-filled context
 * @property {string} proposedSolution - Pre-filled proposed solution
 * @property {string} keyGoals - Pre-filled key goals
 * @property {string} scopeInScope - Pre-filled in-scope items
 * @property {string} scopeOutOfScope - Pre-filled out-of-scope items
 * @property {string} successMetrics - Pre-filled success metrics
 * @property {string} keyStakeholders - Pre-filled stakeholders
 * @property {string} timelineEstimate - Pre-filled timeline
 */

/** @type {Record<string, OnePagerTemplate>} */
export const DOCUMENT_TEMPLATES = {
  blank: {
    id: 'blank',
    name: 'Blank',
    icon: '📄',
    description: 'Start from scratch',
    problemStatement: '',
    costOfDoingNothing: '',
    context: '',
    proposedSolution: '',
    keyGoals: '',
    scopeInScope: '',
    scopeOutOfScope: '',
    successMetrics: '',
    keyStakeholders: '',
    timelineEstimate: ''
  },
  statusUpdate: {
    id: 'statusUpdate',
    name: 'Status Update',
    icon: '📊',
    description: 'Weekly progress snapshot',
    problemStatement: '[Project Name] - Weekly Status Update for [Week/Date]',
    costOfDoingNothing: 'Stakeholders lack visibility into current progress and blockers',
    context: 'Current roadmap phase: [Phase]\nPrevious week accomplishments: [List]',
    proposedSolution: 'Key activities this week:\n- [Activity 1]\n- [Activity 2]\n- [Activity 3]',
    keyGoals: '- Complete [milestone]\n- Unblock [dependency]\n- Prepare for [upcoming work]',
    scopeInScope: 'This week\'s committed deliverables',
    scopeOutOfScope: 'Deferred items and future phases',
    successMetrics: '- [X] tasks completed\n- [Y] blockers resolved\n- On track for [target date]',
    keyStakeholders: 'Owner: [Name]\nReviewer: [Name]\nInformed: [Team/Group]',
    timelineEstimate: 'Next milestone: [Date]\nTarget completion: [Date]'
  },
  featurePitch: {
    id: 'featurePitch',
    name: 'Feature Pitch',
    icon: '🚀',
    description: 'Propose a new feature',
    problemStatement: 'Customers are experiencing [pain point] when trying to [action], resulting in [negative outcome]',
    costOfDoingNothing: '$[X] lost revenue per [period]\n[Y]% customer churn attributed to this gap\n[Z] support tickets per month',
    context: 'Market gap: [Competitor analysis]\nCustomer feedback: [Data source]\nStrategic alignment: [Initiative]',
    proposedSolution: 'Build [feature] that enables [capability] by [approach]',
    keyGoals: '- Reduce [pain metric] by [X]%\n- Increase [positive metric] by [Y]%\n- Enable [new capability]',
    scopeInScope: '- Core functionality\n- Integration with [system]\n- [Platform] support',
    scopeOutOfScope: '- Advanced analytics (Phase 2)\n- [Other platform] support\n- Legacy migration',
    successMetrics: '- [Metric 1]: Target [value]\n- [Metric 2]: Target [value]\n- Customer satisfaction: [NPS target]',
    keyStakeholders: 'Sponsor: [Exec]\nProduct: [PM]\nEngineering: [Lead]\nDesign: [Designer]',
    timelineEstimate: 'Discovery: [X] weeks\nBuild: [Y] weeks\nLaunch: [Target quarter]'
  },
  budgetAsk: {
    id: 'budgetAsk',
    name: 'Budget Ask',
    icon: '💰',
    description: 'Request resources/budget',
    problemStatement: 'Current capacity constraint: [describe bottleneck]\nImpact: Unable to deliver [X] due to [limitation]',
    costOfDoingNothing: 'Delayed roadmap by [X] months\n$[Y] opportunity cost\n[Z] team burnout risk',
    context: 'Current state: [Team size, tools, infrastructure]\nDemand: [Growth projections, commitments]',
    proposedSolution: 'Request: $[amount] for [headcount/tools/infrastructure]\nBreakdown:\n- [Item 1]: $[cost]\n- [Item 2]: $[cost]',
    keyGoals: '- Unlock [capability]\n- Reduce [bottleneck] by [X]%\n- Enable [strategic initiative]',
    scopeInScope: 'FY[Year] investment\n[Specific roles/tools/resources]',
    scopeOutOfScope: 'Future fiscal years\nContingent requests',
    successMetrics: 'ROI: [X]% in [timeframe]\nPayback period: [months]\nCapacity increase: [Y]%',
    keyStakeholders: 'Requestor: [Name]\nApprover: [Finance/Exec]\nBeneficiary: [Team]',
    timelineEstimate: 'Decision needed: [Date]\nOnboarding/setup: [Duration]\nFull productivity: [Date]'
  },
  incidentRetro: {
    id: 'incidentRetro',
    name: 'Incident Retro',
    icon: '⚠️',
    description: 'Post-incident summary',
    problemStatement: '[Incident ID]: [Brief description of what happened]\nImpact: [X] customers affected for [duration]',
    costOfDoingNothing: 'Risk of recurrence: [High/Medium/Low]\nPotential impact: [Describe worst case]\nReputation damage: [Describe]',
    context: 'Timeline:\n- [Time]: Issue detected\n- [Time]: Investigation began\n- [Time]: Root cause identified\n- [Time]: Resolution deployed',
    proposedSolution: 'Immediate fixes:\n- [Fix 1]\n- [Fix 2]\n\nLong-term prevention:\n- [Action 1]\n- [Action 2]',
    keyGoals: '- Prevent recurrence\n- Reduce MTTR by [X]%\n- Improve detection capabilities',
    scopeInScope: 'This incident\'s root cause and direct contributing factors',
    scopeOutOfScope: 'Unrelated system improvements\nBroader architectural changes (separate initiative)',
    successMetrics: '- MTTR reduced to [X] minutes\n- Similar incidents: 0 in next [period]\n- Detection time: [target]',
    keyStakeholders: 'Incident Commander: [Name]\nOn-call: [Names]\nReview Board: [Names]',
    timelineEstimate: 'Immediate actions: [X] days\nFollow-up items: [Y] weeks\nRetro review: [Date]'
  }
};

/**
 * Get a template by ID
 * @param {string} templateId - The template ID
 * @returns {OnePagerTemplate|null} The template or null if not found
 */
export function getTemplate(templateId) {
  return DOCUMENT_TEMPLATES[templateId] || null;
}

/**
 * Get all templates as an array
 * @returns {OnePagerTemplate[]} Array of all templates
 */
export function getAllTemplates() {
  return Object.values(DOCUMENT_TEMPLATES);
}
