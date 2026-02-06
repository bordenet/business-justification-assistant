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
