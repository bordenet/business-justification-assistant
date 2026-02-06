/**
 * Document-Specific Templates for Business Justification Assistant
 * Pre-filled content for common business justification use cases
 * @module document-specific-templates
 */

/**
 * @typedef {Object} BusinessJustificationTemplate
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

/** @type {Record<string, BusinessJustificationTemplate>} */
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
  headcountRequest: {
    id: 'headcountRequest',
    name: 'Headcount Request',
    icon: '👥',
    description: 'Justify a new hire or additional headcount',
    problemStatement: 'Current team capacity: [X] FTEs at [Y]% utilization\nBlocked deliverables: [List specific projects/features]\nImpact: Unable to deliver [roadmap item] due to [capacity/skill gap]',
    costOfDoingNothing: 'Opportunity cost: $[X] ARR delayed [Y] months\nBurnout risk: Team at [Z]% utilization (target: 70-80%)\nAttrition risk: [N] team members flagged as flight risk\nReplacement cost per attrition: $[200k+ typical]',
    context: 'Current state:\n- Team size: [N] FTEs\n- Utilization: [X]% (8k avail hrs/yr; demand [Y]k)\n- Skills gap: [Specific skills needed]\n\nDemand drivers:\n- [OKR/Initiative 1]\n- [OKR/Initiative 2]',
    proposedSolution: 'Request: [N] [Role Title] at [Level]\nTotal Comp: $[X] (base + equity + bonus + 30% benefits)\nRamp timeline: [X] months to full productivity\n\nAlternatives considered:\n| Option | Cost | Pros | Cons |\n|--------|------|------|------|\n| Do nothing | $0 | No spend | [Risks] |\n| Contractor | $[X] | Fast | No IP, temp |\n| **Hire FTE** | $[Y] | Long-term | Ramp time |',
    keyGoals: '- Reduce utilization from [X]% to [Y]% (target: 70-80%)\n- Unblock [specific deliverable] worth $[Z] ARR\n- Increase velocity from [X] to [Y] features/quarter',
    scopeInScope: 'FY[Year] Q[N] hire\nRole: [Title] at [Level]\nTeam: [Team name]\nManager: [Name]',
    scopeOutOfScope: 'Future headcount beyond this request\nOrg restructuring\nContractor conversions',
    successMetrics: 'ROI: $[X] ARR / $[Y] TC = [Z]x return\nPayback: <12 months\n90-day ramp milestones:\n- Day 30: [Milestone]\n- Day 60: [Milestone]\n- Day 90: [Milestone]',
    keyStakeholders: 'Requestor: [Hiring Manager]\nApprover: [VP/Director]\nFinance: [Finance Partner]\nRecruiting: [Recruiter]',
    timelineEstimate: 'Decision needed: [Date]\nReq open: [Date]\nTarget start: [Date]\nFull productivity: [Date]'
  },
  promotionRequest: {
    id: 'promotionRequest',
    name: 'Promotion Request',
    icon: '📈',
    description: 'Justify an engineering promotion (manager-submitted)',
    problemStatement: '[Employee Name] has been operating at [Target Level] scope for [X] months\nCurrent level: [Current Level]\nProposed level: [Target Level]',
    costOfDoingNothing: 'Retention risk: High performer at risk of external offers\nEquity concern: Performing at [Target Level] but compensated at [Current Level]\nTeam morale: Visible inequity affects peer motivation',
    context: '**Performance at Target Level (sustained [X] months):**\n\n| Dimension | [Current Level] Expectation | Evidence at [Target Level] |\n|-----------|---------------------------|---------------------------|\n| Scope | Single team/project | Cross-team: [Examples] |\n| Impact | Team metrics | Org metrics: [Examples] |\n| Leadership | Mentors juniors | Raises bar broadly: [Examples] |',
    proposedSolution: '**Promotion Packet Summary:**\n\n**Scope Evidence:**\n- [Project 1]: [Scope description, teams affected]\n- [Project 2]: [Scope description, teams affected]\n\n**Impact Evidence:**\n| Project | Metric | Outcome |\n|---------|--------|--------|\n| [Project] | [Metric] | [Quantified result] |\n\n**Leadership Evidence:**\n- Mentored [N] engineers to [outcome]\n- Established [standard/process] adopted by [scope]\n\n**Advocate Quotes:**\n- [Skip-level]: "[Quote]"\n- [Cross-team partner]: "[Quote]"',
    keyGoals: '- Recognize sustained [Target Level] performance\n- Align compensation with contribution\n- Retain high performer',
    scopeInScope: 'This promotion cycle\n[Employee Name] only\nLevel change: [Current] → [Target]',
    scopeOutOfScope: 'Compensation adjustment (separate process)\nTeam restructuring\nOther promotion candidates',
    successMetrics: 'Ladder alignment: 80%+ criteria met at [Target Level]\nSustained performance: [X]+ months at level\nPeer validation: [N] advocate statements',
    keyStakeholders: 'Candidate: [Employee Name]\nManager: [Your Name]\nSkip-level: [Name]\nHR Partner: [Name]\nCalibration Committee: [Names]',
    timelineEstimate: 'Packet submission: [Date]\nCalibration: [Date]\nDecision: [Date]\nEffective date: [Date]'
  },
  budgetOpexRequest: {
    id: 'budgetOpexRequest',
    name: 'Budget/Opex Request',
    icon: '💰',
    description: 'Justify a software license or tool purchase',
    problemStatement: 'Current tool/process: [Describe status quo]\nLimitation: [Specific capability gap]\nImpact: [Quantified pain - hours lost, errors, etc.]',
    costOfDoingNothing: 'Productivity loss: [X] eng-hours/month × $[Y]/hr = $[Z]/month\nError rate: [X]% → $[Y] in rework/incidents\nOpportunity cost: [Feature/capability] blocked',
    context: '**Current State:**\n- Tool: [Current tool or "manual process"]\n- Users: [N] engineers\n- Pain points: [List]\n\n**Evaluation Criteria:**\n- Cost (TCO 3yr)\n- Time-to-value\n- Integration with [existing stack]\n- Security/compliance (SOC2, data residency)',
    proposedSolution: '**TCO Analysis (3-year):**\n\n| Category | Year 1 | Year 2 | Year 3 | Total |\n|----------|--------|--------|--------|-------|\n| License | $[X] | $[X] | $[X] | $[3X] |\n| Training/Setup | $[Y] | $0 | $0 | $[Y] |\n| Ops/Support | $[Z] | $[Z] | $[Z] | $[3Z] |\n| **TCO** | **$[sum]** | **$[sum]** | **$[sum]** | **$[total]** |\n\n**Alternatives Comparison:**\n\n| Option | TCO 3yr | Time Saved | Risk | Score |\n|--------|---------|------------|------|-------|\n| Status quo | $[X] | Baseline | High | 4/10 |\n| Competitor A | $[Y] | +[N]hr/mo | Med | 6/10 |\n| **Recommended** | $[Z] | +[N]hr/mo | Low | 9/10 |\n| Build in-house | $[W] | +[N]hr/mo | High | 3/10 |',
    keyGoals: '- Reduce [pain metric] by [X]%\n- Save [Y] eng-hours/month\n- Enable [new capability]',
    scopeInScope: 'FY[Year] opex\n[Tool name] license for [N] users\nIntegration with [systems]',
    scopeOutOfScope: 'Enterprise-wide rollout (Phase 2)\nCustom development\nData migration from [legacy system]',
    successMetrics: 'ROI: ([Benefits] - [TCO]) / [TCO] = [X]%\nPayback: <12 months\nTime saved: [X] hrs/month measured via [method]\nError reduction: [X]% measured via [method]',
    keyStakeholders: 'Requestor: [Your Name]\nFinance Approver: [Name]\nEng Leadership: [Name]\nSecurity/Compliance: [Name]\nProcurement: [Name]',
    timelineEstimate: 'Decision needed: [Date] (aligns with Q[N] budget)\nProcurement: [X] weeks\nSetup/Training: [Y] weeks\nFull adoption: [Date]'
  },
  roleReclassification: {
    id: 'roleReclassification',
    name: 'Role Reclassification',
    icon: '🔄',
    description: 'Justify changing a job level or band',
    problemStatement: 'Role: [Job Title]\nCurrent band: [Current Level/Band]\nProposed band: [Target Level/Band]\nReason: Job scope has materially changed over [X] months',
    costOfDoingNothing: 'Internal equity issue: Role scope matches [Target Band] but compensated at [Current Band]\nMarket misalignment: Current band [X]% below market midpoint for comparable scope\nRetention risk: Incumbent may seek external opportunities at correct level',
    context: '**Scope Change Documentation:**\n\n| Dimension | Before (6+ months ago) | After (current, sustained) |\n|-----------|----------------------|---------------------------|\n| Reports | [N] ICs | [M] ICs + [P] managers |\n| Budget | $[X] | $[Y] |\n| Decision authority | [Describe] | [Describe] |\n| Complexity | [Describe] | [Describe] |\n\n**Market Data:**\n- Source: [Radford/Mercer/Levels.fyi]\n- Comparable roles: [List]\n- Market midpoint: $[X]\n- Current comp: $[Y] ([Z]% of midpoint)',
    proposedSolution: '**Reclassification Request:**\n\nFrom: [Current Title] at [Current Band]\nTo: [New Title] at [Target Band]\n\n**Evidence of Permanent Scope Change:**\n1. [Specific duty change - sustained X months]\n2. [Specific duty change - sustained X months]\n3. [Specific duty change - sustained X months]\n\n**Internal Comparators:**\n| Role | Band | Scope | This Role Comparison |\n|------|------|-------|---------------------|\n| [Peer Role 1] | [Band] | [Scope] | Similar/Greater |\n| [Peer Role 2] | [Band] | [Scope] | Similar/Greater |',
    keyGoals: '- Align job band with actual scope\n- Achieve internal equity with comparable roles\n- Align with market data',
    scopeInScope: 'This role only\nBand change: [Current] → [Target]\nEffective: [Date]',
    scopeOutOfScope: 'Compensation adjustment (separate process per policy)\nOrg restructuring\nOther role reclassifications',
    successMetrics: 'Scope alignment: Role duties match [Target Band] job description\nInternal equity: Comparable to [N] peer roles at [Target Band]\nMarket alignment: Within [X]% of market midpoint',
    keyStakeholders: 'Manager: [Your Name]\nHR Partner: [Name]\nCompensation: [Name]\nFinance: [Name]',
    timelineEstimate: 'Submission: [Date]\nHR Review: [X] weeks\nDecision: [Date]\nEffective date: [Date] (aligned with [policy window])'
  },
  optionsComparison: {
    id: 'optionsComparison',
    name: 'Options Comparison',
    icon: '⚖️',
    description: 'Compare do-nothing, minimal, and full investment options',
    problemStatement: 'Decision required: [Describe the decision]\nContext: [Why this decision is needed now]',
    costOfDoingNothing: '**Option A: Do Nothing**\nCost: $0 direct investment\nRisk: [Describe risks]\nOutcome: [Describe what happens]',
    context: '**Decision Context:**\n- Strategic alignment: [OKR/Initiative]\n- Urgency: [Why now]\n- Constraints: [Budget, timeline, resources]',
    proposedSolution: '**Options Analysis:**\n\n| Criteria | Do Nothing | Minimal | Full Investment |\n|----------|------------|---------|----------------|\n| Cost | $0 | $[X] | $[Y] |\n| Benefit | [Describe] | [Describe] | [Describe] |\n| Risk | High | Medium | Low |\n| Timeline | N/A | [X] weeks | [Y] weeks |\n| ROI | Negative | [X]% | [Y]% |\n\n**Recommendation:** [Option] because [rationale]',
    keyGoals: '- Make informed decision with clear tradeoffs\n- Align investment with risk tolerance\n- Achieve [specific outcome]',
    scopeInScope: 'This decision only\nFY[Year] scope\n[Specific boundaries]',
    scopeOutOfScope: 'Future phases\nRelated but separate decisions\n[Specific exclusions]',
    successMetrics: 'Decision criteria met: [List]\nROI achieved: [Target]\nRisk mitigated: [Specific risks addressed]',
    keyStakeholders: 'Decision maker: [Name]\nAdvisor: [Name]\nImplementer: [Name]',
    timelineEstimate: 'Decision needed: [Date]\nImplementation start: [Date]\nFirst checkpoint: [Date]'
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
