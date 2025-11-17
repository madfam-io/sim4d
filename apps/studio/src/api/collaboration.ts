/**
 * Collaboration API Service
 * Handles CSRF token management and collaboration server communication
 */

export interface CSRFTokenResponse {
  csrfToken: string;
  sessionId: string;
  expiresAt: number;
}

export interface CollaborationConfig {
  serverUrl: string;
  autoRefreshToken?: boolean;
  tokenRefreshThreshold?: number; // milliseconds before expiration to refresh
}

class CollaborationAPI {
  private config: CollaborationConfig;
  private currentToken: CSRFTokenResponse | null = null;
  private refreshTimer: number | null = null;

  constructor(config: CollaborationConfig) {
    this.config = {
      autoRefreshToken: true,
      tokenRefreshThreshold: 5 * 60 * 1000, // 5 minutes before expiration
      ...config,
    };
  }

  /**
   * Fetch a new CSRF token from the server
   */
  async getCSRFToken(force = false): Promise<CSRFTokenResponse> {
    // Return cached token if still valid and not forced
    if (!force && this.currentToken && this.isTokenValid(this.currentToken)) {
      return this.currentToken;
    }

    try {
      const response = await fetch(`${this.config.serverUrl}/api/collaboration/csrf-token`, {
        method: 'GET',
        credentials: 'include', // Include session cookie
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get CSRF token: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Calculate expiration (1 hour from now)
      const expiresAt = Date.now() + 60 * 60 * 1000;

      this.currentToken = {
        csrfToken: data.csrfToken,
        sessionId: data.sessionId,
        expiresAt,
      };

      // Schedule automatic refresh if enabled
      if (this.config.autoRefreshToken) {
        this.scheduleTokenRefresh();
      }

      return this.currentToken;
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
      throw error;
    }
  }

  /**
   * Check if a token is still valid
   */
  private isTokenValid(token: CSRFTokenResponse): boolean {
    return Date.now() < token.expiresAt;
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(): void {
    // Clear existing timer
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!this.currentToken) return;

    // Calculate when to refresh (threshold before expiration)
    const refreshAt = this.currentToken.expiresAt - (this.config.tokenRefreshThreshold || 0);
    const timeUntilRefresh = Math.max(0, refreshAt - Date.now());

    this.refreshTimer = window.setTimeout(async () => {
      try {
        await this.getCSRFToken(true);
        console.log('[Collaboration] CSRF token refreshed automatically');
      } catch (error) {
        console.error('[Collaboration] Failed to refresh CSRF token:', error);
      }
    }, timeUntilRefresh);
  }

  /**
   * Clear the current token and cancel refresh timer
   */
  clearToken(): void {
    this.currentToken = null;
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Get current server URL
   */
  getServerUrl(): string {
    return this.config.serverUrl;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CollaborationConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Export singleton instance
// Default to localhost for development, can be overridden
// In production, use environment variable or empty string (disables collaboration)
const defaultServerUrl =
  import.meta.env['VITE_COLLABORATION_API_URL'] ||
  (import.meta.env['PROD'] ? '' : 'http://localhost:8080');

export const collaborationAPI = new CollaborationAPI({
  serverUrl: defaultServerUrl,
});

// Export class for testing
export { CollaborationAPI };
