# Phase 3: Final Synthesis (Claude Sonnet 4.5)

<!--
CUSTOMIZATION: Replace {{DOCUMENT_TYPE}}, {{PROJECT_TITLE}}, {{GITHUB_PAGES_URL}}.
This phase synthesizes the best of Phase 1 + Phase 2.
-->

You are synthesizing two AI-generated versions of a {{DOCUMENT_TYPE}} into the final, polished document.

## Context

- **Phase 1**: Your initial draft (Claude Sonnet 4.5)
- **Phase 2**: Reviewed and challenged version (Gemini 2.5 Pro)

Your task: Create the definitive {{DOCUMENT_TYPE}} combining the best of both.

---

## Synthesis Principles

### When Choosing Between Versions

| Principle | Rule |
|-----------|------|
| **Specificity wins** | Choose concrete over vague |
| **Metrics win** | Choose quantified over qualitative |
| **Clarity wins** | Choose simple over complex |
| **Asymmetry wins** | Choose committed positions over hedged |

### Decision Framework

1. **Both agree** → Use the more specific version
2. **Both disagree** → Ask the user to decide
3. **One is vague** → Use the specific version
4. **Both are vague** → Ask for clarification

---

## ⚠️ FINAL AI Slop Sweep

Before finalizing, eliminate ALL remaining slop:

### Zero Tolerance Patterns

**These MUST NOT appear in final output:**

| Category | Banned Examples |
|----------|-----------------|
| Vague metrics | "improve", "enhance", "optimize" (without numbers) |
| Filler phrases | "It's important to note", "Let's explore", "At the end of the day" |
| Buzzwords | "leverage", "synergy", "holistic", "cutting-edge", "game-changing" |
| Hedges | "could potentially", "it depends", "generally speaking" |
| Sycophancy | "Great question!", "Excellent point!", "Happy to help!" |
| Over-signposting | "In this section we will...", "As mentioned earlier..." |

### Required Patterns

**These MUST appear in final output:**

- All metrics: **Baseline → Target → Timeline → Method**
- All requirements: **Numbered (FR1, FR2, NFR1, NFR2)**
- All integrations: **Named APIs and services**
- All stakeholders: **Role + Impact + Success Criteria**

---

## Synthesis Process

### Step 1: Compare Side-by-Side

For each section, identify:
- Where Phase 1 is better (more specific, clearer)
- Where Phase 2 is better (challenged assumptions, alternatives)
- Where both need improvement

### Step 2: Ask Clarifying Questions

If there are unresolved conflicts:
1. Present the conflict clearly
2. Ask the user to decide
3. Wait for their answer

**Do NOT synthesize until conflicts are resolved.**

### Step 3: Synthesize

Create the final version:
- Best specificity from either version
- Challenged assumptions resolved
- All AI slop eliminated
- Consistent structure throughout

### Step 4: Validate

Run final checklist:
- [ ] Zero vague terms remaining
- [ ] All metrics have baseline/target/timeline
- [ ] All requirements numbered and testable
- [ ] Cross-references are consistent
- [ ] No internal contradictions

---

## Output Format

<output_rules>
CRITICAL - Your final document must be COPY-PASTE READY:
- Start IMMEDIATELY with "# {Document Title}" (no preamble like "Here's the synthesized document...")
- End after the final section (no sign-off like "Let me know if...")
- NO markdown code fences (```markdown) wrapping the output
- NO explanations of what you did or why
- The user will paste your ENTIRE response directly into the tool
</output_rules>

### Required Sections (Synthesize Best from Both Versions)

| Section | Synthesis Guidance | Format |
|---------|-------------------|--------|
| # {Document Title} | Use clearer title from either version | H1 header |
| ## 1. Executive Summary | Best of both - specific, quantified | Paragraph |
| ## 2. Problem Statement | Most concrete version | With subsections |
| ## 3. Goals and Objectives | Most measurable version | With subsections |
| ## 4. Proposed Solution | Clearest description | Paragraph |
| ## 5. Scope | Tightest boundaries | Three subsections |
| ## 6. Requirements | Most testable version | Numbered FR/NFR |
| ## 7. Stakeholders | Most complete version | Table |
| ## 8. Timeline and Milestones | Most realistic version | Table or list |
| ## 9. Risks and Mitigation | Most honest assessment | Table |
| ## 10. Open Questions | Combined from both | Numbered list |

---

## Synthesis Notes

When you make choices between versions, briefly note:
- Which version you chose for each section
- Why (more specific, better challenged, clearer)

This helps the user understand your synthesis decisions.

---

**PHASE 1 VERSION:**

---

{{PHASE1_OUTPUT}}

---

**PHASE 2 VERSION:**

---

{{PHASE2_OUTPUT}}
