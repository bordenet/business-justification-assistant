/**
 * Prompt generation for LLM-based Business Justification scoring
 *
 * UNIFIED 4-PILLAR TAXONOMY (must match validator.js exactly):
 * 1. Strategic Evidence (30 pts)
 * 2. Financial Justification (25 pts)
 * 3. Options & Alternatives (25 pts)
 * 4. Execution Completeness (20 pts)
 */

/**
 * Generate comprehensive LLM scoring prompt
 * @param {string} justificationContent - The business justification content to score
 * @returns {string} Complete prompt for LLM scoring
 */
export function generateLLMScoringPrompt(justificationContent) {
  return `You are an expert Finance/HR Business Partner evaluating a Business Justification document.

Score this Business Justification using the following rubric (0-100 points total):

## SCORING RUBRIC

### 1. Strategic Evidence (30 points)
- **Quantitative Data (12 pts)**: Numbers, percentages, metrics backing every claim (80/20 quant/qual)
- **Credible Sources (10 pts)**: Industry benchmarks (DORA, Radford, Gartner), internal data with dates/sample sizes
- **Before/After Comparisons (8 pts)**: Baseline vs target metrics, counterfactual analysis

### 2. Financial Justification (25 points)
- **ROI Calculation (10 pts)**: Explicit formula: (Benefit - Cost) / Cost × 100 with inputs
- **Payback Period (8 pts)**: Time to recoup investment (target: <12 months)
- **TCO Analysis (7 pts)**: 3-year view including hidden costs (implementation, training, ops, opportunity cost)

### 3. Options & Alternatives (25 points)
- **Multiple Options (10 pts)**: At least 3 options: do-nothing, minimal investment, full investment
- **Do-Nothing Scenario (10 pts)**: Quantified cost/risk of inaction
- **Clear Recommendation (5 pts)**: Which option and why, with trade-off comparison

### 4. Execution Completeness (20 points)
- **Executive Summary (6 pts)**: TL;DR lets stranger understand the ask in 30 seconds
- **Risks & Mitigation (7 pts)**: Key risks identified with mitigation strategies
- **Stakeholder Concerns (7 pts)**: Finance (ROI/payback), HR (equity/compliance), Legal (risk/liability) addressed

## CALIBRATION GUIDANCE
- Be HARSH. Most business justifications score 40-60. Only exceptional ones score 80+.
- A score of 70+ means ready for executive approval.
- Deduct points for EVERY claim without quantified evidence.
- Deduct points for vague sourcing ("industry standard", "best practice").
- Deduct points for missing options analysis or do-nothing scenario.
- Deduct points for sunk cost reasoning ("we've already invested X").
- Reward specific ROI calculations with explicit formulas and inputs.
- Reward explicit risk identification and mitigation.
- Reward multiple stakeholder perspective consideration.

## BUSINESS JUSTIFICATION TO EVALUATE

\`\`\`
${justificationContent}
\`\`\`

## REQUIRED OUTPUT FORMAT

Provide your evaluation in this exact format:

**TOTAL SCORE: [X]/100**

### Strategic Evidence: [X]/30
[2-3 sentence justification]

### Financial Justification: [X]/25
[2-3 sentence justification]

### Options & Alternatives: [X]/25
[2-3 sentence justification]

### Execution Completeness: [X]/20
[2-3 sentence justification]

### Top 3 Issues
1. [Most critical issue]
2. [Second issue]
3. [Third issue]

### Top 3 Strengths
1. [Strongest aspect]
2. [Second strength]
3. [Third strength]`;
}

/**
 * Generate critique prompt for detailed feedback
 * @param {string} justificationContent - The business justification content to critique
 * @param {Object} currentResult - Current validation results
 * @returns {string} Complete prompt for critique
 */
export function generateCritiquePrompt(justificationContent, currentResult) {
  const issuesList = [
    ...(currentResult.strategicEvidence?.issues || currentResult.problemClarity?.issues || []),
    ...(currentResult.financialJustification?.issues || currentResult.solution?.issues || []),
    ...(currentResult.optionsAnalysis?.issues || currentResult.scope?.issues || []),
    ...(currentResult.executionCompleteness?.issues || currentResult.completeness?.issues || [])
  ].slice(0, 5).map(i => `- ${i}`).join('\n');

  return `You are a senior Finance/HR Business Partner providing detailed feedback on a Business Justification.

## CURRENT VALIDATION RESULTS
Total Score: ${currentResult.totalScore}/100
- Strategic Evidence: ${currentResult.strategicEvidence?.score || currentResult.problemClarity?.score || 0}/30
- Financial Justification: ${currentResult.financialJustification?.score || currentResult.solution?.score || 0}/25
- Options & Alternatives: ${currentResult.optionsAnalysis?.score || currentResult.scope?.score || 0}/25
- Execution Completeness: ${currentResult.executionCompleteness?.score || currentResult.completeness?.score || 0}/20

Key issues detected:
${issuesList || '- None detected by automated scan'}

## BUSINESS JUSTIFICATION TO CRITIQUE

\`\`\`
${justificationContent}
\`\`\`

## YOUR TASK

Provide:
1. **Executive Summary** (2-3 sentences on overall business justification quality)
2. **Detailed Critique** by the 4 pillars:
   - Strategic Evidence: What works, what needs improvement
   - Financial Justification: ROI, payback, TCO analysis
   - Options & Alternatives: Do-nothing, alternatives, recommendation
   - Execution Completeness: Summary, risks, stakeholder concerns
3. **Revised Business Justification** - A complete rewrite addressing all issues

Be specific. Show exact rewrites. Keep it concise (2-3 pages max). Make it ready for executive approval.`;
}

/**
 * Generate rewrite prompt
 * @param {string} justificationContent - The business justification content to rewrite
 * @param {Object} currentResult - Current validation results
 * @returns {string} Complete prompt for rewrite
 */
export function generateRewritePrompt(justificationContent, currentResult) {
  return `You are a senior Finance/HR Business Partner rewriting a Business Justification to achieve a score of 85+.

## CURRENT SCORE: ${currentResult.totalScore}/100

## ORIGINAL BUSINESS JUSTIFICATION

\`\`\`
${justificationContent}
\`\`\`

## REWRITE REQUIREMENTS

Create a complete, polished Business Justification that:
1. Is concise (2-3 pages max, executive-focused)
2. Has a TL;DR/Executive Summary that lets a stranger approve in 30 seconds
3. Includes quantified evidence for EVERY claim (80/20 quant/qual split)
4. Cites credible sources (industry benchmarks, internal data with dates/sample sizes)
5. Has explicit ROI calculation with formula, inputs, and result
6. Shows payback period and 3-year TCO analysis
7. Includes at least 3 options: do-nothing, minimal investment, full investment
8. Has explicit do-nothing scenario with sensitivity analysis
9. Addresses stakeholder concerns: Finance (ROI), HR (equity), Legal (risk)
10. Identifies key risks with mitigation strategies
11. Avoids sunk cost reasoning, vague sourcing, and unsubstantiated claims

Output ONLY the rewritten Business Justification in markdown format. No commentary.`;
}

/**
 * Clean AI response to extract markdown content
 * @param {string} response - Raw AI response
 * @returns {string} Cleaned markdown content
 */
export function cleanAIResponse(response) {
  // Remove common prefixes
  let cleaned = response.replace(/^(Here's|Here is|I've|I have|Below is)[^:]*:\s*/i, '');

  // Extract content from markdown code blocks if present
  const codeBlockMatch = cleaned.match(/```(?:markdown)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1];
  }

  return cleaned.trim();
}
