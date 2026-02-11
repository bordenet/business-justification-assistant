/**
 * Prompts Module Tests
 */

import { jest } from '@jest/globals';
import {
  WORKFLOW_CONFIG,
  generatePhase1Prompt,
  generatePhase2Prompt,
  generatePhase3Prompt,
  getPhaseMetadata,
  preloadPromptTemplates,
  replaceTemplateVars
} from '../../shared/js/prompts.js';

// Mock fetch for loading prompt templates
// Handles both shared/prompts/ (root) and ../shared/prompts/ (assistant/) paths
global.fetch = jest.fn(async (url) => {
  const templates = {
    'phase1.md': 'Phase 1: Document titled {{TITLE}}. Context: {{CONTEXT}}. Problems: {{PROBLEMS}}. Additional context: {{ADDITIONAL_CONTEXT}}.',
    'phase2.md': 'Phase 2: Review for {{TITLE}}. Previous output: {{PHASE1_OUTPUT}}',
    'phase3.md': 'Phase 3: Final synthesis for {{TITLE}}. Phase 1: {{PHASE1_OUTPUT}}. Phase 2: {{PHASE2_OUTPUT}}'
  };
  // Extract filename from path (handles both old and new paths)
  const filename = url.split('/').pop();
  return {
    ok: true,
    text: async () => templates[filename] || 'Default template'
  };
});

describe('WORKFLOW_CONFIG', () => {
  test('should have 3 phases', () => {
    expect(WORKFLOW_CONFIG.phaseCount).toBe(3);
    expect(WORKFLOW_CONFIG.phases).toHaveLength(3);
  });

  test('should have correct phase structure', () => {
    WORKFLOW_CONFIG.phases.forEach((phase, index) => {
      expect(phase.number).toBe(index + 1);
      expect(phase.name).toBeDefined();
      expect(phase.aiModel).toBeDefined();
      expect(phase.description).toBeDefined();
      expect(phase.icon).toBeDefined();
      expect(phase.aiUrl).toBeDefined();
    });
  });

  test('should use Claude for Phase 1 and 3, Gemini for Phase 2', () => {
    expect(WORKFLOW_CONFIG.phases[0].aiModel).toBe('Claude');
    expect(WORKFLOW_CONFIG.phases[1].aiModel).toBe('Gemini');
    expect(WORKFLOW_CONFIG.phases[2].aiModel).toBe('Claude');
  });
});

describe('getPhaseMetadata', () => {
  test('should return correct metadata for each phase', () => {
    const phase1 = getPhaseMetadata(1);
    expect(phase1.name).toBe('Initial Draft');
    expect(phase1.icon).toBe('📝');

    const phase2 = getPhaseMetadata(2);
    expect(phase2.name).toBe('Adversarial Review');
    expect(phase2.icon).toBe('🔄');

    const phase3 = getPhaseMetadata(3);
    expect(phase3.name).toBe('Final Synthesis');
    expect(phase3.icon).toBe('✨');
  });

  test('should return undefined for invalid phase', () => {
    expect(getPhaseMetadata(0)).toBeUndefined();
    expect(getPhaseMetadata(4)).toBeUndefined();
    expect(getPhaseMetadata(-1)).toBeUndefined();
  });
});

describe('preloadPromptTemplates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should preload all phase templates', async () => {
    await preloadPromptTemplates();

    // Verify fetch was called 3 times (once per phase)
    expect(global.fetch).toHaveBeenCalledTimes(3);
    // Verify paths end with phase filenames (works with shared/ pattern)
    const calls = global.fetch.mock.calls.map(c => c[0]);
    expect(calls.some(url => url.endsWith('phase1.md'))).toBe(true);
    expect(calls.some(url => url.endsWith('phase2.md'))).toBe(true);
    expect(calls.some(url => url.endsWith('phase3.md'))).toBe(true);
  });
});

describe('generatePhase1Prompt', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should generate prompt with all form data', async () => {
    // Uses generic field names matching the genericized hello-world template
    const formData = {
      title: 'Test Document Title',
      context: 'Background context for the document',
      problems: 'Key problems to address',
      additionalContext: 'Extra context information'
    };

    const prompt = await generatePhase1Prompt(formData);

    expect(prompt).toContain('Test Document Title');
    expect(prompt).toContain('Background context for the document');
    expect(prompt).toContain('Key problems to address');
    expect(prompt).toContain('Extra context information');
  });

  test('should handle missing form data with placeholders', async () => {
    const formData = {
      title: 'Test Title'
    };

    const prompt = await generatePhase1Prompt(formData);

    expect(prompt).toContain('Test Title');
    expect(prompt).toContain('[Not provided]');
  });
});

describe('generatePhase2Prompt', () => {
  test('should include phase 1 output', async () => {
    // Uses generic field names matching the genericized hello-world template
    const formData = {
      title: 'Test Document'
    };

    const prompt = await generatePhase2Prompt(formData, 'Phase 1 generated content');

    expect(prompt).toContain('Phase 1 generated content');
    expect(prompt).toContain('Test Document');
  });
});

describe('generatePhase3Prompt', () => {
  test('should include both phase 1 and phase 2 outputs', async () => {
    // Uses generic field names matching the genericized hello-world template
    const formData = {
      title: 'Final Test Document'
    };

    const prompt = await generatePhase3Prompt(formData, 'Phase 1 content', 'Phase 2 critique');

    expect(prompt).toContain('Final Test Document');
    expect(prompt).toContain('Phase 1 content');
    expect(prompt).toContain('Phase 2 critique');
  });
});

describe('replaceTemplateVars - Placeholder Safety Check', () => {
  test('should replace known variables', () => {
    const template = 'Hello {{NAME}}, welcome to {{PROJECT}}';
    const vars = { NAME: 'World', PROJECT: 'Business Justification' };

    const result = replaceTemplateVars(template, vars);

    expect(result).toBe('Hello World, welcome to Business Justification');
  });

  test('should remove unsubstituted UPPER_CASE placeholders', () => {
    const template = 'Hello {{NAME}}, your {{UNKNOWN_FIELD}} is ready';
    const vars = { NAME: 'World' };

    const result = replaceTemplateVars(template, vars);

    expect(result).toBe('Hello World, your  is ready');
    expect(result).not.toContain('{{UNKNOWN_FIELD}}');
  });

  test('should handle phase output placeholders when not provided', () => {
    const template = '{{PHASE1_OUTPUT}} and {{PHASE2_OUTPUT}}';
    const vars = { PHASE1_OUTPUT: 'Draft content here' };

    const result = replaceTemplateVars(template, vars);

    expect(result).toContain('Draft content here');
    expect(result).not.toContain('{{PHASE2_OUTPUT}}');
  });
});
