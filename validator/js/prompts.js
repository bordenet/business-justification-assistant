/**
 * Prompt generation for LLM-based Business Justification scoring
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

### 1. Evidence Quality (30 points)
- **Quantitative Data (12 pts)**: Numbers, percentages, metrics backing every claim (80/20 quant/qual)
- **Credible Sources (10 pts)**: Industry benchmarks (DORA, Radford, Gartner), internal data with dates/sample sizes
- **Before/After Comparisons (8 pts)**: Counterfactual analysis ("What if no action?"), control for confounders

### 2. ROI/Financial Clarity (25 points)
- **Clear ROI Calculation (10 pts)**: Explicit formula, inputs, and result
- **Payback Period (8 pts)**: Time to recoup investment (<12mo ideal)
- **TCO Analysis (7 pts)**: 3-year view including hidden costs (implementation, training, ops, opportunity cost)

### 3. Options Analysis (25 points)
- **Alternatives Considered (10 pts)**: At least 3 options including do-nothing and build vs buy
- **Do-Nothing Scenario (8 pts)**: Explicit cost/risk of inaction with sensitivity analysis
- **Clear Recommendation (7 pts)**: Unambiguous ask with justification for chosen option

### 4. Completeness (20 points)
- **Executive Summary (7 pts)**: TL;DR lets stranger understand the ask in 30 seconds
- **Risks & Mitigation (7 pts)**: Key risks identified with mitigation strategies
- **Stakeholder Concerns (6 pts)**: Finance (ROI/payback), HR (equity/compliance), Legal (risk/liability) addressed

## CALIBRATION GUIDANCE
- Be HARSH. Most business justifications score 40-60. Only exceptional ones score 80+.
- A score of 70+ means ready for executive approval.
- Deduct points for EVERY claim without quantified evidence.
- Deduct points for vague sourcing ("industry standard", "best practice").
- Deduct points for missing options analysis or do-nothing scenario.
- Deduct points for sunk cost reasoning ("we've already invested X").
- Reward specific ROI calculations with clear inputs.
- Reward explicit risk identification and mitigation.
- Reward multiple stakeholder perspective consideration.

## BUSINESS JUSTIFICATION TO EVALUATE

\`\`\`
${justificationContent}
\`\`\`

## REQUIRED OUTPUT FORMAT

Provide your evaluation in this exact format:

**TOTAL SCORE: [X]/100**

### Evidence Quality: [X]/30
[2-3 sentence justification]

### ROI/Financial Clarity: [X]/25
[2-3 sentence justification]

### Options Analysis: [X]/25
[2-3 sentence justification]

### Completeness: [X]/20
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
    ...(currentResult.evidenceQuality?.issues || currentResult.problemClarity?.issues || []),
    ...(currentResult.roiClarity?.issues || currentResult.solution?.issues || []),
    ...(currentResult.optionsAnalysis?.issues || currentResult.scope?.issues || []),
    ...(currentResult.completeness?.issues || [])
  ].slice(0, 5).map(i => `- ${i}`).join('\n');

  return `You are a senior Finance/HR Business Partner providing detailed feedback on a Business Justification.

## CURRENT VALIDATION RESULTS
Total Score: ${currentResult.totalScore}/100
- Evidence Quality: ${currentResult.evidenceQuality?.score || currentResult.problemClarity?.score || 0}/30
- ROI/Financial Clarity: ${currentResult.roiClarity?.score || currentResult.solution?.score || 0}/25
- Options Analysis: ${currentResult.optionsAnalysis?.score || currentResult.scope?.score || 0}/25
- Completeness: ${currentResult.completeness?.score || 0}/20

Key issues detected:
${issuesList || '- None detected by automated scan'}

## BUSINESS JUSTIFICATION TO CRITIQUE

\`\`\`
${justificationContent}
\`\`\`

## YOUR TASK

Provide:
1. **Executive Summary** (2-3 sentences on overall business justification quality)
2. **Detailed Critique** by dimension:
   - What works well
   - What needs improvement
   - Specific suggestions with examples
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
