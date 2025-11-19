/**
 * HTML Sanitization Tests
 * SECURITY: Validate XSS prevention across all sanitization functions
 */

import { describe, it, expect } from 'vitest';
import {
  sanitizeHTML,
  sanitizeText,
  sanitizeNodeName,
  sanitizeNodeDescription,
  sanitizeLogMessage,
  sanitizeErrorMessage,
  sanitizeURL,
  sanitizeObject,
  containsSuspiciousPatterns,
} from '../sanitization';

describe('HTML Sanitization', () => {
  describe('sanitizeHTML', () => {
    it('should remove script tags', () => {
      const dirty = '<script>alert("xss")</script>Hello';
      const clean = sanitizeHTML(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('Hello');
    });

    it('should remove onclick handlers', () => {
      const dirty = '<div onclick="alert(\'xss\')">Click me</div>';
      const clean = sanitizeHTML(dirty);
      expect(clean).not.toContain('onclick');
      expect(clean).toContain('Click me');
    });

    it('should remove javascript: protocol', () => {
      const dirty = '<a href="javascript:alert(\'xss\')">Link</a>';
      const clean = sanitizeHTML(dirty, { allowLinks: true });
      expect(clean).not.toContain('javascript:');
    });

    it('should allow safe formatting tags', () => {
      const dirty = '<strong>Bold</strong> and <em>italic</em>';
      const clean = sanitizeHTML(dirty, { allowFormatting: true });
      expect(clean).toContain('<strong>');
      expect(clean).toContain('<em>');
    });

    it('should enforce max length', () => {
      const dirty = 'A'.repeat(1000);
      const clean = sanitizeHTML(dirty, { maxLength: 100 });
      expect(clean.length).toBe(100);
    });

    it('should strip all tags when requested', () => {
      const dirty = '<b>Bold</b> <script>bad</script> text';
      const clean = sanitizeHTML(dirty, { stripAllTags: true });
      expect(clean).not.toContain('<');
      expect(clean).toContain('Bold');
      expect(clean).toContain('text');
    });
  });

  describe('sanitizeText', () => {
    it('should escape HTML entities', () => {
      const dirty = '<script>alert("xss")</script>';
      const clean = sanitizeText(dirty);
      expect(clean).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;');
    });

    it('should escape ampersands', () => {
      const dirty = 'A & B';
      const clean = sanitizeText(dirty);
      expect(clean).toBe('A &amp; B');
    });

    it('should escape quotes', () => {
      const dirty = 'He said "hello"';
      const clean = sanitizeText(dirty);
      expect(clean).toContain('&quot;');
    });

    it('should enforce max length', () => {
      const dirty = 'A'.repeat(1000);
      const clean = sanitizeText(dirty, 50);
      expect(clean.length).toBe(50);
    });
  });

  describe('sanitizeNodeName', () => {
    it('should strip all HTML from node names', () => {
      const dirty = '<b>Math</b> Node';
      const clean = sanitizeNodeName(dirty);
      expect(clean).not.toContain('<');
      expect(clean).toContain('Math');
    });

    it('should limit node name length', () => {
      const dirty = 'A'.repeat(200);
      const clean = sanitizeNodeName(dirty);
      expect(clean.length).toBeLessThanOrEqual(100);
    });

    it('should remove script attempts', () => {
      const dirty = 'Box<script>alert("xss")</script>';
      const clean = sanitizeNodeName(dirty);
      expect(clean).not.toContain('script');
      expect(clean).toContain('Box');
    });
  });

  describe('sanitizeNodeDescription', () => {
    it('should allow basic formatting', () => {
      const dirty = 'Creates a <strong>box</strong> shape';
      const clean = sanitizeNodeDescription(dirty);
      expect(clean).toContain('<strong>');
    });

    it('should remove links by default', () => {
      const dirty = 'See <a href="http://example.com">docs</a>';
      const clean = sanitizeNodeDescription(dirty);
      expect(clean).not.toContain('<a');
      expect(clean).toContain('docs');
    });

    it('should allow lists', () => {
      const dirty = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const clean = sanitizeNodeDescription(dirty);
      expect(clean).toContain('<ul>');
      expect(clean).toContain('<li>');
    });

    it('should limit description length', () => {
      const dirty = 'A'.repeat(2000);
      const clean = sanitizeNodeDescription(dirty);
      expect(clean.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('sanitizeLogMessage', () => {
    it('should escape HTML in log messages', () => {
      const dirty = '<script>console.log("evil")</script>';
      const clean = sanitizeLogMessage(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).toContain('&lt;script&gt;');
    });

    it('should limit log message length', () => {
      const dirty = 'L'.repeat(2000);
      const clean = sanitizeLogMessage(dirty);
      expect(clean.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('sanitizeErrorMessage', () => {
    it('should sanitize Error objects', () => {
      const error = new Error('<script>alert("xss")</script>');
      const clean = sanitizeErrorMessage(error);
      expect(clean).not.toContain('<script>');
    });

    it('should sanitize string errors', () => {
      const error = '<b>Fatal error</b>';
      const clean = sanitizeErrorMessage(error);
      expect(clean).not.toContain('<b>');
      expect(clean).toContain('Fatal error');
    });

    it('should limit error message length', () => {
      const error = new Error('E'.repeat(1000));
      const clean = sanitizeErrorMessage(error);
      expect(clean.length).toBeLessThanOrEqual(500);
    });
  });

  describe('sanitizeURL', () => {
    it('should allow http URLs', () => {
      const url = 'http://example.com';
      const clean = sanitizeURL(url);
      expect(clean).toBe(url);
    });

    it('should allow https URLs', () => {
      const url = 'https://example.com';
      const clean = sanitizeURL(url);
      expect(clean).toBe(url);
    });

    it('should allow mailto URLs', () => {
      const url = 'mailto:user@example.com';
      const clean = sanitizeURL(url);
      expect(clean).toBe(url);
    });

    it('should block javascript: protocol', () => {
      const url = 'javascript:alert("xss")';
      const clean = sanitizeURL(url);
      expect(clean).toBe('');
    });

    it('should block data: protocol', () => {
      const url = 'data:text/html,<script>alert("xss")</script>';
      const clean = sanitizeURL(url);
      expect(clean).toBe('');
    });

    it('should allow relative URLs', () => {
      const url = '/docs/api';
      const clean = sanitizeURL(url);
      expect(clean).toBe(url);
    });

    it('should handle case variations of javascript:', () => {
      const urls = ['JavaScript:alert(1)', 'JAVASCRIPT:alert(1)', 'jAvAsCrIpT:alert(1)'];

      urls.forEach((url) => {
        const clean = sanitizeURL(url);
        expect(clean).toBe('');
      });
    });
  });

  describe('sanitizeObject', () => {
    it('should sanitize all string values', () => {
      const dirty = {
        name: '<script>bad</script>Name',
        description: '<b>Description</b>',
        count: 42,
      };

      const clean = sanitizeObject(dirty);
      expect(clean.name).not.toContain('<script>');
      expect(clean.description).not.toContain('<b>');
      expect(clean.count).toBe(42);
    });

    it('should recursively sanitize nested objects', () => {
      const dirty = {
        metadata: {
          title: '<script>evil</script>',
          tags: ['<b>tag1</b>', 'tag2'],
        },
      };

      const clean = sanitizeObject(dirty);
      expect(clean.metadata.title).not.toContain('<script>');
    });

    it('should preserve non-string values', () => {
      const data = {
        string: 'text',
        number: 42,
        boolean: true,
        null: null,
        undefined: undefined,
      };

      const clean = sanitizeObject(data);
      expect(clean.number).toBe(42);
      expect(clean.boolean).toBe(true);
      expect(clean.null).toBe(null);
    });
  });

  describe('containsSuspiciousPatterns', () => {
    it('should detect script tags', () => {
      expect(containsSuspiciousPatterns('<script>')).toBe(true);
      expect(containsSuspiciousPatterns('<SCRIPT>')).toBe(true);
    });

    it('should detect javascript: protocol', () => {
      expect(containsSuspiciousPatterns('javascript:alert(1)')).toBe(true);
      expect(containsSuspiciousPatterns('JAVASCRIPT:alert(1)')).toBe(true);
    });

    it('should detect event handlers', () => {
      expect(containsSuspiciousPatterns('onclick=')).toBe(true);
      expect(containsSuspiciousPatterns('onload=')).toBe(true);
      expect(containsSuspiciousPatterns('onerror=')).toBe(true);
    });

    it('should detect iframe tags', () => {
      expect(containsSuspiciousPatterns('<iframe>')).toBe(true);
    });

    it('should detect object/embed tags', () => {
      expect(containsSuspiciousPatterns('<object>')).toBe(true);
      expect(containsSuspiciousPatterns('<embed>')).toBe(true);
    });

    it('should detect data URLs', () => {
      expect(containsSuspiciousPatterns('data:text/html')).toBe(true);
    });

    it('should not flag safe content', () => {
      expect(containsSuspiciousPatterns('Hello World')).toBe(false);
      expect(containsSuspiciousPatterns('<strong>Bold</strong>')).toBe(false);
    });
  });

  describe('XSS Attack Vectors', () => {
    const xssVectors = [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      '<svg/onload=alert("XSS")>',
      '<iframe src="javascript:alert(\'XSS\')">',
      '<object data="javascript:alert(\'XSS\')">',
      '<embed src="javascript:alert(\'XSS\')">',
      '<a href="javascript:alert(\'XSS\')">Click</a>',
      '<form action="javascript:alert(\'XSS\')">',
      '<input onfocus=alert("XSS") autofocus>',
      '<select onfocus=alert("XSS") autofocus>',
      '<textarea onfocus=alert("XSS") autofocus>',
      '<body onload=alert("XSS")>',
      '<img src="x" onerror="alert(\'XSS\')">',
      '<div style="background:url(javascript:alert(\'XSS\'))">',
    ];
    /* eslint-enable no-secrets/no-secrets */

    xssVectors.forEach((vector, index) => {
      it(`should neutralize XSS vector ${index + 1}: ${vector.substring(0, 30)}...`, () => {
        const clean = sanitizeHTML(vector);

        // Verify no script execution possible
        expect(clean).not.toMatch(/<script/i);
        expect(clean).not.toMatch(/javascript:/i);
        expect(clean).not.toMatch(/on\w+\s*=/i);
        expect(clean).not.toMatch(/<iframe/i);
        expect(clean).not.toMatch(/<object/i);
        expect(clean).not.toMatch(/<embed/i);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      expect(sanitizeHTML('')).toBe('');
      expect(sanitizeText('')).toBe('');
      expect(sanitizeURL('')).toBe('');
    });

    it('should handle null/undefined', () => {
      expect(sanitizeHTML(null as any)).toBe('');
      expect(sanitizeHTML(undefined as any)).toBe('');
      expect(sanitizeText(null as any)).toBe('');
    });

    it('should handle non-string input', () => {
      expect(sanitizeHTML(123 as any)).toBe('');
      expect(sanitizeText({ foo: 'bar' } as any)).toBe('');
    });

    it('should handle deeply nested HTML', () => {
      const nested = '<div><div><div><script>alert("xss")</script></div></div></div>';
      const clean = sanitizeHTML(nested);
      expect(clean).not.toContain('<script>');
    });

    it('should handle malformed HTML', () => {
      const malformed = '<div><script>alert("xss")</div>';
      const clean = sanitizeHTML(malformed);
      expect(clean).not.toContain('<script>');
    });

    it('should handle Unicode and special characters', () => {
      const unicode = 'Hello 世界 🌍 ñ';
      const clean = sanitizeText(unicode);
      expect(clean).toContain('世界');
      expect(clean).toContain('🌍');
    });
  });
});
