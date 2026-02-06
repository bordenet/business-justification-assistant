# About Business Justification Assistant

> **Research Date:** 2026-02-06
> **Research Method:** Perplexity.ai deep research prompts
> **Genesis Template:** hello-world (from genesis/genesis/examples/)

## What This Tool Does

The Business Justification Assistant helps organizations create compelling, evidence-based justification documents for:

- **Headcount Requests** - New hires, backfills, additional FTEs
- **Promotion Requests** - Manager-submitted engineering promotions
- **Budget/Opex Requests** - Software licenses, tools, infrastructure
- **Role Reclassifications** - Job level or band changes
- **Options Comparisons** - Do-nothing vs minimal vs full investment analysis

The key differentiator from other genesis tools (like one-pager) is the emphasis on **persuasive data and evidence** that resonates with decision-makers.

---

## Perplexity Research Journey

This section documents the research prompts and key findings that shaped this tool's design.

### Prompt 1: Business Justification Structure & Best Practices

**Prompt:**
```
What are the essential components of a compelling business justification document? Include:
1. Standard sections (executive summary, problem statement, options analysis, ROI, risks)
2. What makes each section effective
3. How to structure for different audiences (executives vs. technical reviewers)
4. Examples of strong vs weak business justifications
```

**Key Takeaways:**
- **5 Core Sections:** Executive Summary (TL;DR), Problem Statement, Options Analysis, ROI/Financials, Risks & Mitigation
- **Lean vs Full:** Lean 1-pager for <$50K; full business case for >$100K investments
- **Executive attention span:** 30s to decide to read further; TL;DR + clear ask upfront is critical
- **80/20 Rule:** Spend 80% effort on data/evidence, 20% on narrative

### Prompt 2: New Headcount Request Justification

**Prompt:**
```
How do engineering managers effectively justify requests for new headcount? Include:
1. Capacity planning calculations (FTE utilization, demand vs supply)
2. ROI frameworks for headcount (cost of hire vs value delivered)
3. Common mistakes that get headcount requests rejected
4. What finance and HR partners look for in headcount justifications
```

**Key Takeaways:**
- **Utilization target:** 70-80% is healthy; >90% = burnout risk, attrition risk
- **ROI formula:** (ARR enabled by hire) / (Total Comp including 30% benefits)
- **Red flags for rejection:** Vague scope, no alternatives considered, missing capacity data
- **Finance cares about:** Payback period (<12mo ideal), headcount efficiency ratios, ARR/FTE

### Prompt 3: Engineering Promotion Request Justification

**Prompt:**
```
What makes an effective engineering promotion justification packet (manager-submitted)?
1. Evidence categories (scope, impact, leadership, technical depth)
2. How to quantify engineering contributions
3. Ladder alignment and level comparisons
4. Supporting documentation (peer feedback, project outcomes, metrics)
```

**Key Takeaways:**
- **Evidence categories:** Scope (breadth), Impact (outcomes), Leadership (multiplier effect), Technical depth
- **Quantification patterns:** "Led X resulting in Y% improvement in Z metric"
- **Sustained performance:** 6+ months operating at target level before promotion
- **Advocate quotes:** Skip-level and cross-team partner statements carry weight

### Prompt 4: Budget/Opex Request Justification

**Prompt:**
```
How to justify software license purchases or tool investments to finance leadership?
1. TCO calculation methodology (3-year view, hidden costs)
2. ROI frameworks specific to software tools
3. Build vs buy analysis structure
4. Procurement red flags that slow approvals
```

**Key Takeaways:**
- **TCO components:** License + implementation + training + ongoing ops + opportunity cost of alternatives
- **3-year view:** Standard for opex; shows payback and sustaining costs
- **ROI formula:** (Time saved × hourly cost) + (Errors avoided × cost/error) - TCO
- **Build vs buy:** Always include "build in-house" as an option even if clearly inferior
- **Procurement accelerators:** Security review pre-done, SOC2 compliance confirmed, data residency documented

### Prompt 5: Role Reclassification Justification

**Prompt:**
```
What evidence is needed for a successful role reclassification request?
1. How to document scope changes over time
2. Internal equity comparisons (comparable roles at target level)
3. Market data sources and how to use them
4. Timing considerations (when to submit, policy windows)
```

**Key Takeaways:**
- **Scope documentation:** Before/after table showing sustained (6+ months) changes in reports, budget, decision authority
- **Internal comparators:** Identify 2-3 peer roles at target band with similar scope
- **Market data sources:** Radford, Mercer, Levels.fyi; cite specific percentile
- **Timing:** Align with compensation review cycles; check policy windows with HR

### Prompt 6: Persuasive Data & Evidence Patterns

**Prompt:**
```
What makes data and evidence persuasive in corporate business justifications?
1. Quantitative vs qualitative evidence effectiveness
2. Industry benchmarks and credible sources
3. Internal metrics that resonate with executives
4. Before/after and counterfactual analysis patterns
5. Visual presentation of data (tables, charts, formatting)
```

**Key Takeaways:**
- **Quant vs Qual (80/20):** Quantitative leads, qualitative contextualizes; every claim backed by data
- **Credible sources:** DORA, Bessemer, OpenView (SaaS); Radford, Mercer, Levels.fyi (comp); Gartner, Deloitte (IT/Finance)
- **Exec-resonant metrics:** ARR impact, retention (customer & employee), utilization, NPS
- **Before/after pattern:** Include dates, sample size, source; control for confounders
- **Counterfactuals:** "What if no action?" with sensitivity analysis
- **Visual rules:** Tables 3-5 rows max, bars for before/after, lines for trends, headline each chart

### Prompt 7: Red Flags & Anti-Patterns

**Prompt:**
```
What are the most common mistakes and anti-patterns in business justification documents that cause rejection?
1. Structural problems (too long, too vague, missing sections)
2. Data quality issues (cherry-picking, incomplete analysis)
3. Reasoning fallacies (correlation vs causation, sunk cost)
4. Missing stakeholder concerns (finance, HR, legal)
5. How to self-review before submission
```

**Key Takeaways:**
- **Structural problems:** Too long (>2-3 pages without TL;DR), buried ask, missing options analysis
- **Data issues:** Cherry-picking best-case, unstated assumptions, vague sourcing
- **Reasoning fallacies:** Sunk cost ("we've invested $X already"), correlation≠causation, status quo bias
- **Missing stakeholders:** Finance wants ROI/payback; HR wants equity/compliance; Legal wants risk/liability
- **Self-review checklist:** 30s test (does TL;DR let stranger approve?), peer mock-review, data audit, logic scan

---

## How Research Shaped the Tool

The Perplexity research directly informed:

1. **Template Selection** - The 6 templates match the most common justification types identified in research
2. **Pre-filled Content** - Each template includes the evidence patterns and data structures recommended
3. **Anti-slop Focus** - Templates enforce specific, quantified language instead of vague claims
4. **Options Analysis** - Every template includes alternatives considered (do-nothing, build vs buy, etc.)
5. **ROI Frameworks** - Built-in TCO tables, payback calculations, and success metrics

---

## Genesis Ecosystem

This tool is part of the [genesis-tools](https://github.com/bordenet/genesis) ecosystem of AI-assisted document creation tools. All tools share:

- 3-phase AI workflow (draft → refine → export)
- 100% client-side, privacy-first architecture
- No server, no account, no data collection
- Cross-linking via Related Projects dropdown
