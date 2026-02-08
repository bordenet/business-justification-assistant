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

## Related Files

- `validator/js/validator.js` - Implementation of scoring functions
- `validator/js/prompts.js` - LLM scoring prompt (aligned)
- `shared/prompts/phase1.md` - User-facing instructions (source of truth)
