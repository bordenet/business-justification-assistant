/**
 * Business Justification Prompts Module (TEMPLATE - CUSTOMIZE FOR YOUR DOMAIN)
 * @module prompts
 *
 * Manages workflow configuration and prompt generation.
 * Prompts are stored in prompts/ directory as markdown files.
 *
 * ⚠️ CUSTOMIZATION REQUIRED:
 * 1. Update phase descriptions for your document type
 * 2. Update generatePhase*Prompt() variable mappings to match YOUR form fields
 * 3. Update prompts/*.md files with domain-specific content
 */

export const WORKFLOW_CONFIG = {
  phaseCount: 3,
  phases: [
    {
      number: 1,
      name: 'Initial Draft',
      icon: '📝',
      aiModel: 'Claude',
      aiUrl: 'https://claude.ai/new',
      description: 'Generate initial document from user input' // CUSTOMIZE: describe your Phase 1
    },
    {
      number: 2,
      name: 'Adversarial Review',
      icon: '🔄',
      aiModel: 'Gemini',
      aiUrl: 'https://gemini.google.com/app',
      description: 'Critique and identify improvements' // CUSTOMIZE: describe your Phase 2
    },
    {
      number: 3,
      name: 'Final Synthesis',
      icon: '✨',
      aiModel: 'Claude',
      aiUrl: 'https://claude.ai/new',
      description: 'Synthesize feedback into final document' // CUSTOMIZE: describe your Phase 3
    }
  ]
};

// Cache for loaded prompt templates
const promptCache = {};

/**
 * Detect base path for shared assets based on current location
 * Works from both root (/) and assistant/ subdirectory
 */
function getSharedBasePath() {
  const path = window.location.pathname;
  // If we're in /assistant/, go up one level to reach /shared/
  if (path.includes('/assistant/') || path.endsWith('/assistant')) {
    return '../shared/';
  }
  // If we're at root, shared/ is a direct child
  return 'shared/';
}

/**
 * Load prompt template from markdown file
 * @param {number} phaseNumber - Phase number (1, 2, or 3)
 * @returns {Promise<string>} Prompt template
 */
async function loadPromptTemplate(phaseNumber) {
  if (promptCache[phaseNumber]) {
    return promptCache[phaseNumber];
  }

  try {
    const basePath = getSharedBasePath();
    const response = await fetch(`${basePath}prompts/phase${phaseNumber}.md`);
    if (!response.ok) {
      throw new Error(`Failed to load prompt template for phase ${phaseNumber}`);
    }
    const template = await response.text();
    promptCache[phaseNumber] = template;
    return template;
  } catch (error) {
    console.error(`Error loading prompt template for phase ${phaseNumber}:`, error);
    throw error;
  }
}

/**
 * Preload all prompt templates to avoid network delay on first click.
 * This ensures clipboard operations happen within Safari's transient activation window.
 * Call this when the app initializes or when entering a project view.
 * @returns {Promise<void>}
 */
export async function preloadPromptTemplates() {
  const phases = Array.from({ length: WORKFLOW_CONFIG.phaseCount }, (_, i) => i + 1);
  await Promise.all(phases.map(phase => loadPromptTemplate(phase)));
}

/**
 * Replace template variables with actual values
 * Uses {{VAR_NAME}} syntax (double braces, SCREAMING_SNAKE_CASE)
 * @param {string} template - Template string
 * @param {Object} vars - Variables to replace
 * @returns {string} Processed template
 */
function replaceTemplateVars(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value || '[Not provided]');
  }
  return result;
}

/**
 * Phase 1 Prompt: Initial Draft Generation
 *
 * ⚠️ CUSTOMIZATION REQUIRED:
 * Replace these placeholder variable mappings with YOUR form field names.
 * The keys (TITLE, CONTEXT, etc.) must match {{VARIABLE}} placeholders in prompts/phase1.md
 *
 * @param {Object} formData - Form data from project
 * @returns {Promise<string>} Generated prompt
 */
export async function generatePhase1Prompt(formData) {
  const template = await loadPromptTemplate(1);
  // CUSTOMIZE: Map YOUR form fields to template variables
  // Example: If your form has 'jobTitle', add: JOB_TITLE: formData.jobTitle || ''
  return replaceTemplateVars(template, {
    TITLE: formData.title || '',
    CONTEXT: formData.context || '',
    PROBLEMS: formData.problems || '',
    ADDITIONAL_CONTEXT: formData.additionalContext || ''
  });
}

/**
 * Phase 2 Prompt: Adversarial Review
 *
 * ⚠️ CUSTOMIZATION REQUIRED:
 * Add any form fields needed for the adversarial review prompt.
 * PHASE1_OUTPUT is always required - it contains the Phase 1 result.
 *
 * @param {Object} formData - Form data from project
 * @param {string} phase1Output - Output from phase 1
 * @returns {Promise<string>} Generated prompt
 */
export async function generatePhase2Prompt(formData, phase1Output) {
  const template = await loadPromptTemplate(2);
  // CUSTOMIZE: Add any form fields needed for Phase 2 review
  return replaceTemplateVars(template, {
    TITLE: formData.title || '',
    PHASE1_OUTPUT: phase1Output
  });
}

/**
 * Phase 3 Prompt: Final Synthesis
 *
 * ⚠️ CUSTOMIZATION REQUIRED:
 * Add any form fields needed for the final synthesis prompt.
 * PHASE1_OUTPUT and PHASE2_OUTPUT are always required.
 *
 * @param {Object} formData - Form data from project
 * @param {string} phase1Output - Output from phase 1
 * @param {string} phase2Output - Output from phase 2
 * @returns {Promise<string>} Generated prompt
 */
export async function generatePhase3Prompt(formData, phase1Output, phase2Output) {
  const template = await loadPromptTemplate(3);
  // CUSTOMIZE: Add any form fields needed for Phase 3 synthesis
  return replaceTemplateVars(template, {
    TITLE: formData.title || '',
    PHASE1_OUTPUT: phase1Output,
    PHASE2_OUTPUT: phase2Output
  });
}

/**
 * Get phase metadata
 * @param {number} phaseNumber - Phase number
 * @returns {Object|undefined} Phase metadata
 */
export function getPhaseMetadata(phaseNumber) {
  return WORKFLOW_CONFIG.phases.find(p => p.number === phaseNumber);
}
