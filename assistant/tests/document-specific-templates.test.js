/**
 * Tests for document-specific-templates.js module
 *
 * Tests the document template definitions and retrieval functions.
 * This test file follows the genesis pattern for document-specific templates.
 */

import { DOCUMENT_TEMPLATES, getTemplate, getAllTemplates } from '../js/document-specific-templates.js';

describe('DOCUMENT_TEMPLATES', () => {
  test('should have 5 templates defined', () => {
    expect(Object.keys(DOCUMENT_TEMPLATES)).toHaveLength(5);
  });

  test('should have blank template', () => {
    expect(DOCUMENT_TEMPLATES.blank).toBeDefined();
    expect(DOCUMENT_TEMPLATES.blank.id).toBe('blank');
    expect(DOCUMENT_TEMPLATES.blank.name).toBe('Blank');
    expect(DOCUMENT_TEMPLATES.blank.problemStatement).toBe('');
    expect(DOCUMENT_TEMPLATES.blank.context).toBe('');
  });

  test('should have statusUpdate template', () => {
    expect(DOCUMENT_TEMPLATES.statusUpdate).toBeDefined();
    expect(DOCUMENT_TEMPLATES.statusUpdate.id).toBe('statusUpdate');
    expect(DOCUMENT_TEMPLATES.statusUpdate.name).toBe('Status Update');
    expect(DOCUMENT_TEMPLATES.statusUpdate.icon).toBe('📊');
  });

  test('should have featurePitch template', () => {
    expect(DOCUMENT_TEMPLATES.featurePitch).toBeDefined();
    expect(DOCUMENT_TEMPLATES.featurePitch.id).toBe('featurePitch');
    expect(DOCUMENT_TEMPLATES.featurePitch.name).toBe('Feature Pitch');
    expect(DOCUMENT_TEMPLATES.featurePitch.icon).toBe('🚀');
  });

  test('should have budgetAsk template', () => {
    expect(DOCUMENT_TEMPLATES.budgetAsk).toBeDefined();
    expect(DOCUMENT_TEMPLATES.budgetAsk.id).toBe('budgetAsk');
    expect(DOCUMENT_TEMPLATES.budgetAsk.name).toBe('Budget Ask');
    expect(DOCUMENT_TEMPLATES.budgetAsk.icon).toBe('💰');
  });

  test('should have incidentRetro template', () => {
    expect(DOCUMENT_TEMPLATES.incidentRetro).toBeDefined();
    expect(DOCUMENT_TEMPLATES.incidentRetro.id).toBe('incidentRetro');
    expect(DOCUMENT_TEMPLATES.incidentRetro.name).toBe('Incident Retro');
    expect(DOCUMENT_TEMPLATES.incidentRetro.icon).toBe('⚠️');
  });

  test('all templates should have required fields', () => {
    const requiredFields = [
      'id', 'name', 'icon', 'description',
      'problemStatement', 'costOfDoingNothing', 'context',
      'proposedSolution', 'keyGoals', 'scopeInScope', 'scopeOutOfScope',
      'successMetrics', 'keyStakeholders', 'timelineEstimate'
    ];

    Object.values(DOCUMENT_TEMPLATES).forEach(template => {
      requiredFields.forEach(field => {
        expect(template[field]).toBeDefined();
        expect(typeof template[field]).toBe('string');
      });
    });
  });
});

describe('getTemplate', () => {
  test('should return template by ID', () => {
    const template = getTemplate('blank');
    expect(template).toBe(DOCUMENT_TEMPLATES.blank);
  });

  test('should return statusUpdate template', () => {
    const template = getTemplate('statusUpdate');
    expect(template.name).toBe('Status Update');
  });

  test('should return featurePitch template', () => {
    const template = getTemplate('featurePitch');
    expect(template.name).toBe('Feature Pitch');
  });

  test('should return null for invalid ID', () => {
    expect(getTemplate('nonexistent')).toBeNull();
    expect(getTemplate('')).toBeNull();
    expect(getTemplate(null)).toBeNull();
  });

  test('should return null for undefined', () => {
    expect(getTemplate(undefined)).toBeNull();
  });
});

describe('getAllTemplates', () => {
  test('should return array of all templates', () => {
    const templates = getAllTemplates();
    expect(Array.isArray(templates)).toBe(true);
    expect(templates).toHaveLength(5);
  });

  test('should include all template objects', () => {
    const templates = getAllTemplates();
    const ids = templates.map(t => t.id);
    expect(ids).toContain('blank');
    expect(ids).toContain('statusUpdate');
    expect(ids).toContain('featurePitch');
    expect(ids).toContain('budgetAsk');
    expect(ids).toContain('incidentRetro');
  });

  test('each template should have name and icon', () => {
    const templates = getAllTemplates();
    templates.forEach(template => {
      expect(template.name).toBeDefined();
      expect(template.icon).toBeDefined();
    });
  });
});
