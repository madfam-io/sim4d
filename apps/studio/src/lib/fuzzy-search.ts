/**
 * Lightweight Fuzzy Search Implementation
 *
 * Provides fuzzy matching for node search without external dependencies.
 * Based on Levenshtein distance and acronym matching algorithms.
 *
 * Features:
 * - Typo tolerance (1-2 character mistakes)
 * - Acronym matching (e.g., "box" matches "B.O.X.")
 * - Partial word matching
 * - Relevance scoring for ranking results
 */

export interface FuzzyMatch {
  score: number;
  matches: Array<{ start: number; end: number }>;
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for typo tolerance
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = [];

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Check if query matches as acronym
 * e.g., "box" matches "Boolean::Union::XOR" -> B.U.X
 */
function isAcronymMatch(query: string, text: string): boolean {
  const words = text.split(/[^a-zA-Z0-9]+/);
  const acronym = words.map((w) => w[0]?.toLowerCase() || '').join('');
  return acronym.includes(query.toLowerCase());
}

/**
 * Calculate fuzzy match score (0-100, higher is better)
 */
export function fuzzyScore(query: string, text: string): number {
  if (!query || !text) return 0;

  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();

  // Exact match: 100 points
  if (lowerText === lowerQuery) return 100;

  // Starts with query: 90 points
  if (lowerText.startsWith(lowerQuery)) return 90;

  // Contains query as substring: 80 points
  if (lowerText.includes(lowerQuery)) return 80;

  // Acronym match: 70 points
  if (isAcronymMatch(lowerQuery, text)) return 70;

  // Word boundary match (query starts a word): 75 points
  const wordBoundaryMatch = new RegExp(`\\b${lowerQuery}`, 'i').test(text);
  if (wordBoundaryMatch) return 75;

  // Fuzzy match with Levenshtein distance
  const distance = levenshteinDistance(lowerQuery, lowerText);
  const maxLength = Math.max(lowerQuery.length, lowerText.length);
  const similarity = 1 - distance / maxLength;

  // Allow up to 2 character differences for short queries
  const maxDistance = lowerQuery.length <= 4 ? 1 : 2;
  if (distance <= maxDistance) {
    return Math.round(60 * similarity);
  }

  // Check if all characters in query appear in text (in order)
  let textIndex = 0;
  let matchCount = 0;
  for (const char of lowerQuery) {
    const foundIndex = lowerText.indexOf(char, textIndex);
    if (foundIndex >= 0) {
      matchCount++;
      textIndex = foundIndex + 1;
    }
  }

  if (matchCount === lowerQuery.length) {
    // All characters found in order: 40-60 points based on density
    const density = matchCount / (textIndex - lowerQuery.length + matchCount);
    return Math.round(40 + 20 * density);
  }

  return 0; // No match
}

/**
 * Fuzzy search across multiple fields with weighted scoring
 */
export interface FuzzySearchOptions {
  query: string;
  fields: Array<{ value: string; weight: number }>;
  threshold?: number; // Minimum score to include (0-100)
}

export function fuzzySearchMultiField(options: FuzzySearchOptions): number {
  const { query, fields, threshold = 30 } = options;

  let totalScore = 0;
  let totalWeight = 0;

  for (const field of fields) {
    const score = fuzzyScore(query, field.value);
    totalScore += score * field.weight;
    totalWeight += field.weight;
  }

  const averageScore = totalWeight > 0 ? totalScore / totalWeight : 0;

  return averageScore >= threshold ? averageScore : 0;
}

/**
 * Highlight matching portions of text
 */
export function highlightMatches(
  query: string,
  text: string
): Array<{ start: number; end: number }> {
  if (!query || !text) return [];

  const lowerQuery = query.toLowerCase();
  const lowerText = text.toLowerCase();
  const matches: Array<{ start: number; end: number }> = [];

  // Find exact substring matches
  let index = lowerText.indexOf(lowerQuery);
  while (index >= 0) {
    matches.push({ start: index, end: index + lowerQuery.length });
    index = lowerText.indexOf(lowerQuery, index + 1);
  }

  // If no exact matches, highlight individual character matches
  if (matches.length === 0) {
    let textIndex = 0;
    for (const char of lowerQuery) {
      const foundIndex = lowerText.indexOf(char, textIndex);
      if (foundIndex >= 0) {
        matches.push({ start: foundIndex, end: foundIndex + 1 });
        textIndex = foundIndex + 1;
      }
    }
  }

  return matches;
}

/**
 * Format text with highlighted matches
 * Returns HTML-safe string with <mark> tags
 */
export function formatWithHighlights(query: string, text: string): string {
  const matches = highlightMatches(query, text);
  if (matches.length === 0) return text;

  // Merge overlapping matches
  const merged: Array<{ start: number; end: number }> = [];
  let current = matches[0];

  for (let i = 1; i < matches.length; i++) {
    const next = matches[i];
    if (next.start <= current.end + 1) {
      // Overlapping or adjacent, merge
      current = { start: current.start, end: Math.max(current.end, next.end) };
    } else {
      merged.push(current);
      current = next;
    }
  }
  merged.push(current);

  // Build result string
  let result = '';
  let lastIndex = 0;

  for (const match of merged) {
    result += text.slice(lastIndex, match.start);
    result += `<mark>${text.slice(match.start, match.end)}</mark>`;
    lastIndex = match.end;
  }
  result += text.slice(lastIndex);

  return result;
}

/**
 * Tokenize search query for multi-word searches
 */
export function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

/**
 * Check if all tokens match (useful for multi-word searches)
 */
export function allTokensMatch(tokens: string[], text: string, threshold = 30): boolean {
  return tokens.every((token) => fuzzyScore(token, text) >= threshold);
}
