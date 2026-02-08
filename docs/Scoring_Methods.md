# Business Justification Assistant Scoring Methods

This document describes the scoring methodology used by the Business Justification Validator.

## Overview

The validator scores business justifications on a **100-point scale** across four pillars that reflect executive decision-making criteria. The scoring emphasizes quantification, alternatives analysis, and addressal of stakeholder concerns.

## Scoring Taxonomy

| Dimension | Points | What It Measures |
|-----------|--------|------------------|
| **Strategic Evidence** | 30 | Problem statement, quantified metrics, business focus, sources |
| **Financial Justification** | 25 | ROI calculation, payback period, TCO analysis |
| **Options Analysis** | 25 | Do-nothing scenario, alternatives, recommendation |
| **Execution Completeness** | 20 | Executive summary, risks, stakeholder concerns |

## Dimension Details

### 1. Strategic Evidence (30 pts)

**Scoring Breakdown:**
- Problem section with quantified metrics (3+ metrics): 12 pts
- Problem section with some quantification: 8 pts
- Problem section without quantification: 4 pts
- Business focus language: +5 pts
- Before/after baseline metrics: +5 pts
- External sources cited (Gartner, Forrester, etc.): +8 pts
- Internal data referenced: +4 pts

**Detection Patterns:**
```javascript
problemSection: /^#+\s*(problem|challenge|pain.?point|context|why)/im
quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer|transaction)/gi
sources: /\b(gartner|forrester|mckinsey|dora|according.to|research|study|survey|benchmark)/gi
beforeAfter: /\b(currently|today|from|baseline).*\b(to|target|goal)\b/gi
```

### 2. Financial Justification (25 pts)

**Scoring Breakdown:**
- ROI calculation with explicit formula: 10 pts
- ROI mentioned without formula: 5 pts
- Payback period with specific timeframe: 8 pts
- Payback mentioned without timeframe: 4 pts
- TCO analysis present: 7 pts

**ROI Formula Detection:**
```javascript
roiFormula: /\(.*benefit.*-.*cost.*\).*\/.*cost|\d+%.*roi|roi.*=.*\d+%|\$[\d,]+.*\/.*\$[\d,]+/gi
paybackTime: /\d+\s*(month|week|quarter|year|day).*payback|payback.*\d+\s*(month|week|quarter|year)/gi
```

### 3. Options Analysis (25 pts)

**Scoring Breakdown:**
- Do-nothing scenario quantified: 10 pts
- Do-nothing mentioned: 5 pts
- 3+ alternatives compared: 10 pts
- 2 alternatives: 6 pts
- Clear recommendation: 5 pts

**Detection Patterns:**
```javascript
doNothing: /\b(do.?nothing|status.?quo|no.?action|inaction|if.we.don't|current.path|option.?a)\b/gi
alternatives: /\b(alternative|option|approach|scenario|build.vs.buy|option.?[abc123])\b/gi
recommendation: /\b(recommend|recommendation|proposed|chosen|selected|preferred|we.propose)\b/gi
```

### 4. Execution Completeness (20 pts)

**Scoring Breakdown:**
- Executive summary present: 6 pts
- Risks section with mitigation: 8 pts
- Risks mentioned without mitigation: 4 pts
- Stakeholder concerns addressed: 6 pts

**Extended Stakeholder Patterns (from adversarial review):**
```javascript
stakeholderConcerns: /\b(finance|fp&a|hr|people.?team|legal|compliance|equity|liability|approval|cfo|cto|ceo|vp|director)\b/gi
```

## Adversarial Robustness

| Gaming Attempt | Why It Fails |
|----------------|--------------|
| Vague "significant savings" | Quantified pattern requires actual numbers |
| ROI without formula | roiFormula pattern requires explicit calculation |
| Generic "alternatives considered" | Alternative counting requires distinct options |
| "Minimal risk" statements | Risk section detection requires mitigation language |
| Missing FP&A concerns | Extended stakeholder patterns flag finance gaps |

## Calibration Notes

### Quantification Is King
A business justification without numbers is not a justification—it's an opinion. The validator heavily weights quantified evidence (percentages, dollar amounts, timeframes).

### Do-Nothing Is Required
Every justification must articulate what happens if we do nothing. "Continue as is" needs quantified pain: "$X/month wasted", "Y hours lost weekly".

### Stakeholder Reality Check
Extended patterns include FP&A, People Team, Legal, C-suite concerns. Missing these = missing real approval gates.

## Score Interpretation

| Score Range | Grade | Interpretation |
|-------------|-------|----------------|
| 80-100 | A | Investment-ready - clear ROI, risks addressed |
| 60-79 | B | Promising - needs financial tightening |
| 40-59 | C | Incomplete - major gaps in justification |
| 20-39 | D | Weak - reframe around business outcomes |
| 0-19 | F | Not a justification - restart with data |

## LLM Scoring

The validator uses a **dual-scoring architecture**: JavaScript pattern matching provides fast, deterministic scoring, while LLM evaluation adds semantic understanding. Both systems use aligned rubrics but may diverge on edge cases.

### Three LLM Prompts

| Prompt | Purpose | When Used |
|--------|---------|-----------|
| **Scoring Prompt** | Evaluate justification against rubric, return dimension scores | Initial validation |
| **Critique Prompt** | Generate clarifying questions to improve weak areas | After scoring |
| **Rewrite Prompt** | Produce improved justification targeting 85+ score | User-requested rewrite |

### LLM Scoring Rubric

The LLM uses the same 4-pillar taxonomy as JavaScript, with identical point allocations:

| Dimension | Points | LLM Focus |
|-----------|--------|-----------|
| Strategic Evidence | 30 | Quantitative data (80/20 quant/qual), credible sources (DORA, Gartner), before/after comparisons |
| Financial Justification | 25 | Explicit ROI formula with inputs, payback period (<12 months target), 3-year TCO analysis |
| Options & Alternatives | 25 | At least 3 options (do-nothing, minimal, full), quantified do-nothing cost, clear recommendation |
| Execution Completeness | 20 | TL;DR lets stranger understand in 30 seconds, risks with mitigation, stakeholder concerns addressed |

### LLM Calibration Guidance

The LLM prompt includes explicit calibration signals:

**Reward signals:**
- Specific ROI calculations with explicit formulas and inputs
- Explicit risk identification and mitigation strategies
- Multiple stakeholder perspective consideration (Finance, HR, Legal)
- Payback period with specific timeframe

**Penalty signals:**
- Every claim without quantified evidence
- Vague sourcing: "industry standard", "best practice"
- Missing options analysis or do-nothing scenario
- Sunk cost reasoning: "we've already invested X"

**Calibration baseline:** "Be HARSH. Most business justifications score 40-60. Only exceptional ones score 80+."

### LLM Critique Prompt

The critique prompt receives the current JS validation scores and generates improvement questions:

```
Score Summary: [totalScore]/100
- Strategic Evidence: [X]/30
- Financial Justification: [X]/25
- Options & Alternatives: [X]/25
- Execution Completeness: [X]/20
```

Output includes:
- Top 3 issues (specific gaps)
- 3-5 clarifying questions focused on weakest dimensions
- Quick wins (fixes that don't require user input)
- Focus areas: ROI calculation, alternatives analysis, stakeholder concerns

### LLM Rewrite Prompt

The rewrite prompt targets an 85+ score with specific requirements:
- Concise (2-3 pages max, executive-focused)
- TL;DR/Executive Summary that lets a stranger approve in 30 seconds
- Quantified evidence for EVERY claim (80/20 quant/qual split)
- Credible sources (industry benchmarks, internal data with dates/sample sizes)
- Explicit ROI calculation with formula, inputs, and result
- Payback period and 3-year TCO analysis
- At least 3 options: do-nothing, minimal investment, full investment
- Explicit do-nothing scenario with sensitivity analysis
- Addressed stakeholder concerns: Finance (ROI), HR (equity), Legal (risk)
- Identified key risks with mitigation strategies
- No sunk cost reasoning, vague sourcing, or unsubstantiated claims

### JS vs LLM Score Divergence

| Scenario | JS Score | LLM Score | Explanation |
|----------|----------|-----------|-------------|
| ROI mentioned without formula | May score partial | Lower | LLM requires explicit calculation |
| Generic "alternatives considered" | May pass patterns | Lower | LLM evaluates option depth |
| "Minimal risk" statements | May pass | Lower | LLM requires mitigation strategies |
| Industry sources without specifics | May pass | Lower | LLM penalizes "best practice" vagueness |

### LLM-Specific Adversarial Notes

| Gaming Attempt | Why LLM Catches It |
|----------------|-------------------|
| Vague "significant savings" | LLM requires actual dollar amounts |
| ROI without formula breakdown | LLM demands: (Benefit - Cost) / Cost × 100 |
| Generic "alternatives considered" | LLM requires distinct options with trade-offs |
| "Minimal risk" claims | LLM requires named risks with mitigation |
| Missing FP&A perspective | LLM checks for Finance stakeholder concerns |

## Related Files

- `validator/js/validator.js` - Implementation of scoring functions
- `validator/js/prompts.js` - LLM scoring prompt (aligned)
- `shared/prompts/phase1.md` - User-facing instructions (source of truth)
