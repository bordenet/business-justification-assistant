# Business Justification Assistant

AI-powered assistant for creating persuasive business justifications—headcount requests, promotion cases, budget/opex requests, role reclassifications, and options comparisons.

[![Star this repo](https://img.shields.io/github/stars/bordenet/business-justification-assistant?style=social)](https://github.com/bordenet/business-justification-assistant)

**Try it**: [Assistant](https://bordenet.github.io/business-justification-assistant/) · [Validator](https://bordenet.github.io/business-justification-assistant/validator/)

[![CI](https://github.com/bordenet/business-justification-assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/business-justification-assistant/actions)
[![codecov](https://codecov.io/gh/bordenet/business-justification-assistant/branch/main/graph/badge.svg)](https://codecov.io/gh/bordenet/business-justification-assistant)

---

## Quick Start

1. Open the [demo](https://bordenet.github.io/business-justification-assistant/)
2. Select a template (Headcount, Promotion, Budget/Opex, Role Reclassification, or Options Comparison)
3. Fill in the context—problem statement, cost of inaction, proposed solution, success metrics
4. Copy prompt → paste into Claude → paste response back
5. Repeat for review (Gemini) and synthesis (Claude)
6. Export as Markdown

## What It Does

- **Draft → Review → Synthesize**: Claude writes, Gemini critiques, Claude refines
- **Pre-built templates**: 5 justification types with guided fields
- **Persuasive data focus**: Emphasizes quantitative evidence, benchmarks, and counterfactuals
- **Browser storage**: Data stays in IndexedDB, nothing leaves your machine
- **No login**: Just open and use
- **Dark mode**: Toggle in the UI

## How the Phases Work

**Phase 1** — You provide context (problem, cost of inaction, proposed solution, metrics). Claude drafts your business justification with persuasive evidence structure.

**Phase 2** — Gemini reviews the draft: Are claims backed by data? Is the ROI clear? What objections will stakeholders raise?

**Phase 3** — Claude takes the original draft plus Gemini's critique and produces a final, polished justification.

---

## Scoring Methodology

The validator scores business justifications on a 100-point scale across four pillars. This scoring system is calibrated for persuasive technical documents where claims must be substantiated with quantitative evidence.

### Scoring Taxonomy

| Pillar | Weight | Rationale |
|--------|--------|-----------|
| **Strategic Evidence** | 30 pts | Validates that claims are backed by data, not assertions |
| **Financial Justification** | 25 pts | Ensures ROI, payback period, and TCO are explicit |
| **Options & Alternatives** | 25 pts | Enforces the 3-option structure (do-nothing, minimal, full) |
| **Execution Completeness** | 20 pts | Validates stakeholder concerns and risk mitigation |

### Why These Weights?

**Strategic Evidence (30 pts)** is the highest-weighted pillar because business justifications live or die on credibility. A justification with compelling narrative but weak data will be rejected by finance. The validator measures:
- **Quantitative data** (12 pts): Numbers, percentages, metrics backing every claim (80/20 quant/qual ratio)
- **Credible sources** (10 pts): Industry benchmarks (DORA, Radford, Gartner), internal data with dates/sample sizes
- **Before/after comparisons** (8 pts): Baseline vs target metrics, counterfactual analysis

**Financial Justification (25 pts)** addresses the reality that approvers think in financial terms. The validator requires:
- **ROI calculation** (10 pts): Explicit formula: `(Benefit - Cost) / Cost × 100` with inputs
- **Payback period** (8 pts): Time to recoup investment (target: <12 months)
- **TCO analysis** (7 pts): 3-year view including hidden costs (implementation, training, ops, opportunity cost)

**Options & Alternatives (25 pts)** enforces the standard business case structure. Presenting only one option signals advocacy, not analysis. The validator requires:
- **Multiple options** (10 pts): At least 3 options: do-nothing, minimal investment, full investment
- **Do-nothing scenario** (10 pts): Quantified cost/risk of inaction
- **Clear recommendation** (5 pts): Which option and why, with trade-off comparison

**Execution Completeness (20 pts)** ensures the justification addresses stakeholder concerns proactively:
- **Executive summary** (6 pts): TL;DR lets a stranger understand the ask in 30 seconds
- **Risks & mitigation** (7 pts): Key risks identified with mitigation strategies
- **Stakeholder concerns** (7 pts): Finance (ROI/payback), HR (equity/compliance), Legal (risk/liability)

### Adversarial Robustness

The scoring system is designed to resist common manipulation strategies:

| Gaming Attempt | Why It Fails |
|----------------|--------------|
| Citing "industry best practices" without sources | Credible sources require named benchmarks with dates |
| Presenting ROI without showing calculation | ROI formula must be explicit with visible inputs |
| Omitting the do-nothing option | 3-option structure is mandatory; missing options = 0 pts |
| Burying risks in appendices | Risk section presence and quality are scored directly |
| Using variable names in ROI formulas | Regex requires actual numbers or explicit `(Benefit - Cost)` format |

### Calibration Notes

The **3-option requirement** is the most distinctive feature. Research on decision-making shows that single-option proposals trigger skepticism ("What are you hiding?"). The do-nothing/minimal/full structure forces authors to articulate the cost of inaction and the marginal value of additional investment.

The **ROI formula detection** uses pattern matching that requires explicit calculation format. This prevents authors from claiming "positive ROI" without showing their work. The validator accepts variable-based formulas (e.g., `(annual_savings - investment) / investment`) but penalizes missing formula entirely.

---

## Template Types

| Template | Use Case |
|----------|----------|
| **Headcount Request** | New hire budget approval |
| **Promotion Request** | Engineering promotions, title changes |
| **Budget/Opex Request** | Tool purchases, infrastructure spend |
| **Role Reclassification** | Job family changes, level adjustments |
| **Options Comparison** | Comparing 2-3 approaches with recommendation |

---

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
git clone https://github.com/bordenet/business-justification-assistant.git
cd business-justification-assistant
npm install
```

### Testing

```bash
npm test        # Run all tests
npm run lint    # Run linting
npm run lint:fix # Fix lint issues
```

---

## Paired Architecture

Every project has a **paired architecture**:

- **assistant/** - 3-phase AI workflow for creating documents
- **validator/** - Document scoring and validation tool

---

## Project Structure

```
business-justification-assistant/
├── index.html              # Main entry point
├── js/                     # JavaScript modules
│   ├── app.js              # Application entry
│   ├── workflow.js         # Phase orchestration
│   ├── storage.js          # IndexedDB operations
│   ├── document-specific-templates.js  # 5 justification templates
│   └── ...
├── assistant/              # Assistant web app
│   ├── index.html
│   └── js/
├── validator/              # Validator web app
│   ├── index.html
│   └── js/
├── tests/                  # Jest test files
├── prompts/                # AI prompt templates
│   ├── phase1.md
│   ├── phase2.md
│   └── phase3.md
└── About.md                # Perplexity research documentation
```

---

## Research Foundation

This tool was designed based on extensive research into business justification best practices. See [About.md](About.md) for the full research documentation, including:

- Business justification structure and executive expectations
- Headcount, promotion, budget, and reclassification patterns
- Persuasive data and evidence (80/20 quant/qual split, benchmarks, counterfactuals)
- Common anti-patterns and how to avoid them

---

## Part of Genesis Tools

Built with [Genesis](https://github.com/bordenet/genesis). Related tools:

- [Acceptance Criteria Assistant](https://github.com/bordenet/acceptance-criteria-assistant)
- [Architecture Decision Record](https://github.com/bordenet/architecture-decision-record)
- [Business Justification Assistant](https://github.com/bordenet/business-justification-assistant)
- [JD Assistant](https://github.com/bordenet/jd-assistant)
- [One-Pager](https://github.com/bordenet/one-pager)
- [Power Statement Assistant](https://github.com/bordenet/power-statement-assistant)
- [PR/FAQ Assistant](https://github.com/bordenet/pr-faq-assistant)
- [Product Requirements Assistant](https://github.com/bordenet/product-requirements-assistant)
- [Strategic Proposal](https://github.com/bordenet/strategic-proposal)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT - See [LICENSE](LICENSE)
