# ADVERSARIAL REVIEW: business-justification-assistant

## CONTEXT

You are an expert prompt engineer performing an **ADVERSARIAL review** of LLM prompts for a Business Justification assistant tool. This tool helps create business cases for executive approval with financial rigor.

This tool uses a **3-phase LLM chain** plus **dual scoring systems**:
1. **Phase 1 (Claude)** - Generates initial business justification
2. **Phase 2 (Gemini)** - Reviews for financial completeness
3. **Phase 3 (Claude)** - Synthesizes final document
4. **LLM Scoring (prompts.js)** - Sends document to LLM for evaluation
5. **JavaScript Scoring (validator.js)** - Deterministic regex/pattern matching

---

## ⚠️ CRITICAL ALIGNMENT CHAIN

These 5 components **MUST be perfectly aligned**:

| Component | Purpose | Risk if Misaligned |
|-----------|---------|-------------------|
| phase1.md | Generates business case | LLM produces content validator can't detect |
| phase2.md | Reviews for rigor | Different criteria than scoring rubric |
| phase3.md | Final synthesis | Quality gate doesn't match validator |
| prompts.js | LLM scoring rubric | Scores dimensions validator doesn't check |
| validator.js | JavaScript scoring | Misses patterns prompts.js rewards |

---

## CURRENT TAXONOMY (4 dimensions, 100 pts total)

| Dimension | prompts.js | validator.js | Weight Description |
|-----------|------------|--------------|-------------------|
| Strategic Evidence | 30 pts | 30 pts | Quantitative data, credible sources, before/after |
| Financial Justification | 25 pts | 25 pts | ROI calculation, payback period, TCO |
| Options & Alternatives | 25 pts | 25 pts | 3 options, do-nothing scenario, recommendation |
| Execution Completeness | 20 pts | 20 pts | Executive summary, risks, stakeholder concerns |

---

## COMPONENT 1: phase1.md (Claude - Initial Draft)

See: `shared/prompts/phase1.md` (167 lines)

**Key Elements:**
- AI Slop Prevention Rules (banned vague language, filler phrases, buzzwords)
- Quantification requirements (baseline → target format)
- Hedge pattern avoidance ("it depends", "in some cases")

---

## COMPONENT 4: prompts.js (LLM Scoring Rubric)

See: `validator/js/prompts.js` (187 lines)

**Scoring Rubric:**

### 1. Strategic Evidence (30 points)
- Quantitative Data (12 pts): Numbers, percentages, metrics (80/20 quant/qual)
- Credible Sources (10 pts): Industry benchmarks (DORA, Radford, Gartner)
- Before/After Comparisons (8 pts): Baseline vs target, counterfactual analysis

### 2. Financial Justification (25 points)
- ROI Calculation (10 pts): Explicit formula: (Benefit - Cost) / Cost × 100
- Payback Period (8 pts): Time to recoup (<12 months target)
- TCO Analysis (7 pts): 3-year view with hidden costs

### 3. Options & Alternatives (25 points)
- Multiple Options (10 pts): At least 3: do-nothing, minimal, full
- Do-Nothing Scenario (10 pts): Quantified cost/risk of inaction
- Clear Recommendation (5 pts): Which option and why

### 4. Execution Completeness (20 points)
- Executive Summary (6 pts): TL;DR in 30 seconds
- Risks & Mitigation (7 pts): Key risks with strategies
- Stakeholder Concerns (7 pts): Finance, HR, Legal addressed

---

# YOUR ADVERSARIAL REVIEW TASK

## SPECIFIC QUESTIONS TO ANSWER

### 1. ROI FORMULA DETECTION
prompts.js requires explicit ROI formula. Does validator.js detect:
- "(Benefit - Cost) / Cost × 100" pattern?
- ROI percentage calculations?

Look for: `ROI`, `return`, `formula`, `percent`

### 2. THREE OPTIONS REQUIREMENT
prompts.js requires 3 options (do-nothing, minimal, full). Does validator.js:
- ✅ Detect option enumeration?
- ✅ Specifically detect "do-nothing" scenario?

Look for: `option`, `alternative`, `do.?nothing`, `status.?quo`

### 3. PAYBACK PERIOD
prompts.js allocates 8 pts for payback period. Does validator.js detect:
- Payback timeframe?
- "months to recoup" language?

Look for: `payback`, `recoup`, `break.?even`

### 4. TCO (Total Cost of Ownership)
prompts.js allocates 7 pts for TCO. Does validator.js detect:
- 3-year view?
- Hidden costs (implementation, training, ops)?

Look for: `TCO`, `total.?cost`, `hidden.?cost`, `year`

### 5. CREDIBLE SOURCES
prompts.js rewards industry benchmarks. Does validator.js detect:
- DORA, Radford, Gartner, Forrester?
- Specific source citations?

### 6. STAKEHOLDER CONCERNS
prompts.js lists Finance, HR, Legal. Does validator.js detect each?

### 7. SLOP DETECTION
Does validator.js import and apply slop penalties?

```bash
grep -n "getSlopPenalty\|calculateSlopScore\|slop" validator.js
```

---

## DELIVERABLES

### 1. CRITICAL FAILURES
For each issue: Issue, Severity, Evidence, Fix

### 2. ALIGNMENT TABLE
| Component | Dimension | Weight | Aligned? | Issue |

### 3. GAMING VULNERABILITIES
- Fake ROI numbers without formula
- Mentioning "do-nothing" without quantifying
- Citing sources without actual data

### 4. RECOMMENDED FIXES (P0/P1/P2)

---

**VERIFY CLAIMS. Evidence before assertions.**
