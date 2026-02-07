# Phase 1: Initial Draft (Claude Sonnet 4.5)

<!--
CUSTOMIZATION: Replace {{DOCUMENT_TYPE}}, {{TITLE}}, {{CONTEXT}}, {{PROBLEMS}} with your actual form fields.
REFERENCE: https://github.com/bordenet/product-requirements-assistant/blob/main/prompts/phase1.md
-->

You are a principal-level expert helping create a {{DOCUMENT_TYPE}} document.

## Context

**Document Title:** {{TITLE}}
**Problems to Address:** {{PROBLEMS}}
**Additional Context:** {{CONTEXT}}

## Your Task

Generate a comprehensive {{DOCUMENT_TYPE}} that is specific, measurable, and actionable.

---

## ⚠️ CRITICAL: AI Slop Prevention Rules

### Rule 1: Banned Vague Language

❌ **NEVER use these vague terms without specific quantification:**

| Banned Term | Replace With |
|-------------|--------------|
| "improve" | "increase from X to Y" or "reduce from X to Y" |
| "enhance" | specific capability added |
| "optimize" | exact metric and improvement amount |
| "user-friendly" | "reduce clicks from X to Y" or "complete in <N seconds" |
| "efficient" | "process N items in <X seconds" |
| "scalable" | "handle N users with <X ms latency" |
| "better/faster/easier" | specific baseline → target |
| "significant/substantial" | exact percentage or number |
| "seamless/robust/comprehensive" | specific capabilities |

### Rule 2: Banned Filler Phrases

❌ **DELETE these entirely - they add no meaning:**

- "It's important to note that..."
- "In today's fast-paced world..."
- "At the end of the day..."
- "Let's dive in / Let's explore..."
- "First and foremost..."
- "Needless to say..."
- "As we all know..."
- "In order to..." (just use "to")
- "Due to the fact that..." (just use "because")

### Rule 3: Banned Buzzwords

❌ **Replace with plain language:**

| Buzzword | Plain Alternative |
|----------|-------------------|
| leverage | use |
| utilize | use |
| synergy | cooperation, combined benefit |
| holistic | complete, whole |
| paradigm | model, approach |
| disruptive/transformative | specific change described |
| cutting-edge/bleeding-edge | specific technology named |
| game-changing/revolutionary | specific improvement quantified |
| best-in-class/world-class | specific benchmark met |
| actionable | (delete - all actions should be actionable) |

### Rule 4: Banned Hedge Patterns

❌ **Commit to positions - avoid weasel words:**

- "It depends..." → State the conditions clearly
- "In some cases..." → Specify which cases
- "Generally speaking..." → State the rule and exceptions
- "Could potentially..." → Either it will or it won't
- "Arguably..." → Make the argument or don't

### Rule 5: Specificity Requirements

✅ **ALWAYS provide:**

- **Baselines + Targets**: "reduce from 5 hours/week to 30 minutes/week"
- **Quantified outcomes**: "increase NPS from 42 to 48"
- **Measurable criteria**: "process 100K transactions/day with <100ms p95"
- **Named integrations**: "Epic FHIR API", "Stripe Payment Intents"
- **Concrete examples**: Real scenarios, not hypotheticals

---

## Document Structure

Create a well-structured {{DOCUMENT_TYPE}} with clear sections:

```markdown
# {Document Title}

## 1. Executive Summary
{2-3 sentences: problem, solution, expected impact with metrics}

## 2. Problem Statement
### 2.1 Current State
{What's happening today? Quantify the pain.}
### 2.2 Impact
{Who is affected? How many? What does it cost?}

## 3. Goals and Objectives
### 3.1 Business Goals
{High-level outcomes with success criteria}
### 3.2 User Goals
{What will users achieve?}
### 3.3 Success Metrics
{Metric | Baseline | Target | Timeline | Measurement Method}

## 4. Proposed Solution
{High-level description - the "what", not the "how"}

## 5. Scope
### 5.1 In Scope
### 5.2 Out of Scope
### 5.3 Future Considerations

## 6. Requirements
### 6.1 Functional Requirements (numbered: FR1, FR2...)
### 6.2 Non-Functional Requirements (numbered: NFR1, NFR2...)
### 6.3 Constraints

## 7. Stakeholders
{Role | Impact | Needs | Success Criteria}

## 8. Timeline and Milestones

## 9. Risks and Mitigation

## 10. Open Questions
```

---

## Self-Check Before Output

Before providing your response, verify:

- [ ] Zero banned vague terms (improve, enhance, optimize without metrics)
- [ ] Zero filler phrases (important to note, let's dive in)
- [ ] Zero buzzwords (leverage, synergy, holistic, cutting-edge)
- [ ] All metrics have baseline + target + timeline
- [ ] All requirements are numbered and testable
- [ ] Specific names used (APIs, tools, stakeholders)

---

## Interactive Refinement

If the context is incomplete, ask 3-5 clarifying questions FIRST. Wait for answers before generating the document.

Generate the {{DOCUMENT_TYPE}} now based on the context provided.
