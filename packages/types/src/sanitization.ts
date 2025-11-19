/**
 * HTML Sanitization Utilities
 * SECURITY: Prevents XSS attacks by sanitizing user-generated content
 */

import DOMPurify from 'dompurify';

/**
 * Sanitization configuration for different contexts
 */
export interface SanitizationConfig {
  /** Allow basic formatting tags (b, i, em, strong, code, pre) */
  allowFormatting?: boolean;
  /** Allow links (a tags with href) */
  allowLinks?: boolean;
  /** Allow lists (ul, ol, li) */
  allowLists?: boolean;
  /** Maximum length of sanitized output (0 = unlimited) */
  maxLength?: number;
  /** Strip all HTML tags (text only) */
  stripAllTags?: boolean;
}

/**
 * Default safe configuration - formatting only, no links
 */
const DEFAULT_CONFIG: SanitizationConfig = {
  allowFormatting: true,
  allowLinks: false,
  allowLists: false,
  maxLength: 10000,
  stripAllTags: false,
};

/**
 * Sanitize HTML content for safe rendering in the browser
 *
 * SECURITY: Use this for ALL user-generated content before rendering:
 * - Node names and descriptions
 * - Template metadata
 * - Console log outputs
 * - Error messages
 * - Comments and annotations
 *
 * @param dirty - Untrusted HTML string
 * @param config - Sanitization configuration
 * @returns Safe HTML string
 */
export function sanitizeHTML(dirty: string, config: SanitizationConfig = {}): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  // Strip all tags if requested
  if (mergedConfig.stripAllTags) {
    return sanitizeText(dirty);
  }

  // Build allowed tags list
  const allowedTags: string[] = [];
  if (mergedConfig.allowFormatting) {
    allowedTags.push('b', 'i', 'em', 'strong', 'code', 'pre', 'span');
  }
  if (mergedConfig.allowLinks) {
    allowedTags.push('a');
  }
  if (mergedConfig.allowLists) {
    allowedTags.push('ul', 'ol', 'li');
  }

  // Build allowed attributes list
  const allowedAttrs: string[] = [];
  if (mergedConfig.allowLinks) {
    allowedAttrs.push('href', 'target', 'rel');
  }

  // Sanitize with DOMPurify
  const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttrs,
    KEEP_CONTENT: true, // Keep text content even if tags are removed
    ALLOW_DATA_ATTR: false, // No data attributes
    ALLOW_ARIA_ATTR: true, // Allow ARIA for accessibility
    SAFE_FOR_TEMPLATES: true, // Extra safety for template contexts
  });

  // Enforce max length if specified
  if (mergedConfig.maxLength && mergedConfig.maxLength > 0) {
    return clean.substring(0, mergedConfig.maxLength);
  }

  return clean;
}

/**
 * Sanitize plain text by escaping HTML entities
 *
 * SECURITY: Use this when you want to display user input as plain text,
 * ensuring no HTML interpretation occurs.
 *
 * @param text - Untrusted text string
 * @param maxLength - Maximum length (0 = unlimited)
 * @returns Escaped text safe for HTML rendering
 */
export function sanitizeText(text: string, maxLength: number = 0): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let sanitized = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');

  // Enforce max length if specified
  if (maxLength && maxLength > 0) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Sanitize node name for safe display
 * Allows basic formatting but no links or scripts
 *
 * @param name - Node name from user or template
 * @returns Sanitized node name
 */
export function sanitizeNodeName(name: string): string {
  return sanitizeHTML(name, {
    allowFormatting: false, // No formatting in node names
    stripAllTags: true, // Plain text only
    maxLength: 100,
  });
}

/**
 * Sanitize node description for safe display
 * Allows basic formatting and lists
 *
 * @param description - Node description from user or template
 * @returns Sanitized description
 */
export function sanitizeNodeDescription(description: string): string {
  return sanitizeHTML(description, {
    allowFormatting: true,
    allowLinks: false, // No links in descriptions
    allowLists: true,
    maxLength: 1000,
  });
}

/**
 * Sanitize console log message
 * Plain text only, no HTML
 *
 * @param message - Console log message from script execution
 * @returns Sanitized message
 */
export function sanitizeLogMessage(message: string): string {
  return sanitizeText(message, 1000);
}

/**
 * Sanitize error message for display to user
 * Plain text with limited length to prevent log flooding
 *
 * @param error - Error message or Error object
 * @returns Sanitized error message
 */
export function sanitizeErrorMessage(error: string | Error): string {
  const message = error instanceof Error ? error.message : String(error);
  return sanitizeText(message, 500);
}

/**
 * Sanitize template metadata
 * Allows formatting and lists but no links
 *
 * @param metadata - Template metadata string
 * @returns Sanitized metadata
 */
export function sanitizeTemplateMetadata(metadata: string): string {
  return sanitizeHTML(metadata, {
    allowFormatting: true,
    allowLinks: false,
    allowLists: true,
    maxLength: 2000,
  });
}

/**
 * Sanitize URL for safe href usage
 * Only allows http(s) and mailto protocols
 *
 * SECURITY: Prevents javascript:, data:, and other dangerous protocols
 *
 * @param url - URL to sanitize
 * @returns Safe URL or empty string if invalid
 */
export function sanitizeURL(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Trim whitespace
  const trimmed = url.trim();

  // Check for allowed protocols
  const allowedProtocols = /^(https?:\/\/|mailto:)/i;

  if (!allowedProtocols.test(trimmed)) {
    // If no protocol, assume it's a relative URL (also safe)
    if (!trimmed.includes(':')) {
      return trimmed;
    }
    // Otherwise, it's a dangerous protocol
    return '';
  }

  // Additional check: no javascript: in any case variation
  if (/javascript:/i.test(trimmed)) {
    return '';
  }

  return trimmed;
}

/**
 * Batch sanitize multiple strings
 * Useful for sanitizing template objects or node metadata
 *
 * @param data - Object with string values to sanitize
 * @param sanitizer - Sanitization function to apply
 * @returns Object with sanitized values
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  data: T,
  sanitizer: (value: string) => string = sanitizeText
): T {
  const sanitized: any = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizer(value);
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>, sanitizer);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * SECURITY: Validation utility to check if string contains potential XSS
 * Returns true if suspicious patterns detected
 *
 * Use this for early detection and logging, but ALWAYS sanitize regardless
 *
 * @param input - Input to check
 * @returns true if suspicious patterns detected
 */
export function containsSuspiciousPatterns(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const suspiciousPatterns = [
    /<script[\s>]/i, // Script tags
    /javascript:/i, // JavaScript protocol
    /on\w+\s*=/i, // Event handlers (onclick, onload, etc.)
    /<iframe[\s>]/i, // iframes
    /<object[\s>]/i, // Objects
    /<embed[\s>]/i, // Embeds
    /data:text\/html/i, // Data URLs
    /<svg[\s>].*?on\w+/i, // SVG with events
  ];

  return suspiciousPatterns.some((pattern) => pattern.test(input));
}

/**
 * SECURITY: Log suspicious input for security monitoring
 *
 * @param input - Suspicious input
 * @param context - Context where input was detected
 */
export function logSuspiciousInput(input: string, context: string): void {
  console.warn('[SECURITY] Suspicious input detected', {
    context,
    inputLength: input.length,
    inputPreview: input.substring(0, 100),
    timestamp: new Date().toISOString(),
  });
}
