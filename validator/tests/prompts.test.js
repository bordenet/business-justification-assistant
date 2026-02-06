/**
 * Tests for validator/js/prompts.js
 * Tests prompt generation functions for LLM-based Business Justification scoring
 */

import { describe, test, expect } from '@jest/globals';
import {
  generateLLMScoringPrompt,
  generateCritiquePrompt,
  generateRewritePrompt,
  cleanAIResponse
} from '../js/prompts.js';

describe('prompts.js', () => {
  const sampleContent = `# Business Justification: New CRM System
## Executive Summary
Requesting $150K to implement Salesforce CRM to replace our legacy system.
## Current State
Manual tracking in spreadsheets leads to 20% lost leads and 10 hours/week wasted per sales rep.
## Proposed Solution
Implement Salesforce Sales Cloud with custom integrations.
## Financial Analysis
- One-time cost: $150K
- Annual savings: $200K (reduced manual work + improved conversion)
- ROI: 133% in year 1`;

  describe('generateLLMScoringPrompt', () => {
    test('should generate a prompt containing the content', () => {
      const prompt = generateLLMScoringPrompt(sampleContent);
      expect(prompt).toContain(sampleContent);
    });

    test('should include scoring rubric sections', () => {
      const prompt = generateLLMScoringPrompt(sampleContent);
      expect(prompt).toContain('SCORING RUBRIC');
      expect(prompt).toContain('/100');
    });

    test('should include calibration guidance', () => {
      const prompt = generateLLMScoringPrompt(sampleContent);
      expect(prompt).toContain('CALIBRATION');
    });
  });

  describe('generateCritiquePrompt', () => {
    const mockResult = {
      totalScore: 65,
      evidenceQuality: { score: 18, issues: ['Missing data sources'] },
      roiClarity: { score: 20, issues: [] },
      optionsAnalysis: { score: 15, issues: ['No alternatives considered'] }
    };

    test('should generate a prompt containing the content', () => {
      const prompt = generateCritiquePrompt(sampleContent, mockResult);
      expect(prompt).toContain(sampleContent);
    });

    test('should include current validation results', () => {
      const prompt = generateCritiquePrompt(sampleContent, mockResult);
      expect(prompt).toContain('65');
    });

    test('should handle missing result fields gracefully', () => {
      const minimalResult = { totalScore: 50 };
      const prompt = generateCritiquePrompt(sampleContent, minimalResult);
      expect(prompt).toContain('50');
    });
  });

  describe('generateRewritePrompt', () => {
    const mockResult = { totalScore: 45 };

    test('should generate a prompt containing the content', () => {
      const prompt = generateRewritePrompt(sampleContent, mockResult);
      expect(prompt).toContain(sampleContent);
    });

    test('should include current score', () => {
      const prompt = generateRewritePrompt(sampleContent, mockResult);
      expect(prompt).toContain('45');
    });
  });

  describe('cleanAIResponse', () => {
    test('should remove common prefixes', () => {
      const response = "Here's the evaluation:\nSome content";
      expect(cleanAIResponse(response)).toBe('Some content');
    });

    test('should extract content from markdown code blocks', () => {
      const response = '```markdown\nExtracted content\n```';
      expect(cleanAIResponse(response)).toBe('Extracted content');
    });

    test('should handle code blocks without language specifier', () => {
      const response = '```\nExtracted content\n```';
      expect(cleanAIResponse(response)).toBe('Extracted content');
    });

    test('should trim whitespace', () => {
      const response = '  Some content with spaces  ';
      expect(cleanAIResponse(response)).toBe('Some content with spaces');
    });

    test('should handle responses without prefixes or code blocks', () => {
      const response = 'Plain response text';
      expect(cleanAIResponse(response)).toBe('Plain response text');
    });
  });
});
