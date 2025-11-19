/**
 * Authentication Service
 * Comprehensive authentication and session management for BrepFlow cloud services
 */

import EventEmitter from 'events';
import { createHash, randomBytes, pbkdf2, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import {
  UserId,
  User,
  UserPreferences,
  SubscriptionInfo,
  TeamMembership,
} from '@brepflow/cloud-api/src/types';

const pbkdf2Async = promisify(pbkdf2);

export interface AuthConfig {
  jwt: {
    secret: string;
    accessTokenExpiry: string; // e.g., '15m'
    refreshTokenExpiry: string; // e.g., '7d'
    issuer: string;
    audience: string;
  };
  password: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    saltRounds: number;
    maxAttempts: number;
    lockoutDuration: number; // ms
  };
  mfa: {
    enabled: boolean;
    totpIssuer: string;
    backupCodesCount: number;
    recoveryCodeLength: number;
  };
  oauth: {
    providers: {
      google?: { clientId: string; clientSecret: string };
      github?: { clientId: string; clientSecret: string };
      microsoft?: { clientId: string; clientSecret: string };
    };
    callbackUrl: string;
  };
  security: {
    maxSessions: number;
    sessionTimeout: number; // ms
    requireEmailVerification: boolean;
    allowedDomains?: string[];
    blockedDomains?: string[];
    ipWhitelisting: boolean;
    deviceTracking: boolean;
  };
}

export interface AuthCredentials {
  email: string;
  password: string;
  mfaCode?: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  agreeToTerms: boolean;
  inviteCode?: string;
}

export interface AuthSession {
  id: string;
  userId: UserId;
  deviceId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
  metadata: {
    location?: string;
    deviceType?: 'desktop' | 'mobile' | 'tablet';
    trusted: boolean;
  };
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  refreshExpiresIn: number;
}

export interface MfaSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
  setupComplete: boolean;
}

export interface SecurityEvent {
  id: string;
  userId: UserId;
  type:
    | 'login'
    | 'logout'
    | 'password_change'
    | 'mfa_enabled'
    | 'suspicious_login'
    | 'account_locked';
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class AuthenticationService extends EventEmitter {
  private config: AuthConfig;
  private sessions = new Map<string, AuthSession>();
  private loginAttempts = new Map<
    string,
    { count: number; lastAttempt: Date; lockedUntil?: Date }
  >();
  private mfaSecrets = new Map<UserId, { secret: string; backupCodes: string[] }>();
  private securityEvents: SecurityEvent[] = [];
  private refreshTokens = new Map<string, { userId: UserId; expiresAt: Date; deviceId: string }>();

  constructor(config: AuthConfig) {
    super();
    this.config = config;
    this.startSessionCleanup();
  }

  /**
   * User Registration
   */
  async register(
    data: RegisterData
  ): Promise<{ user: User; tokens: AuthTokens; requiresEmailVerification: boolean }> {
    // Validate registration data
    await this.validateRegistrationData(data);

    // Check if user already exists
    const existingUser = await this.findUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User already exists with this email address');
    }

    // Validate invite code if provided
    if (data.inviteCode) {
      await this.validateInviteCode(data.inviteCode);
    }

    // Hash password
    const passwordHash = await this.hashPassword(data.password);

    // Create user
    const user = await this.createUser({
      email: data.email,
      name: data.name,
      passwordHash,
      isEmailVerified: !this.config.security.requireEmailVerification,
      preferences: this.getDefaultUserPreferences(),
      subscription: this.getDefaultSubscription(),
      teams: [],
    });

    // Generate tokens
    const deviceId = this.generateDeviceId();
    const tokens = await this.generateTokens(user.id, deviceId);

    // Create session
    await this.createSession(user.id, deviceId, 'unknown', 'registration');

    // Send email verification if required
    const requiresEmailVerification = this.config.security.requireEmailVerification;
    if (requiresEmailVerification) {
      await this.sendEmailVerification(user);
    }

    // Log security event
    this.logSecurityEvent({
      userId: user.id,
      type: 'login',
      ipAddress: 'unknown',
      userAgent: 'registration',
      details: { method: 'registration', emailVerificationRequired: requiresEmailVerification },
      severity: 'low',
    });

    this.emit('user-registered', { user, requiresEmailVerification });

    return { user, tokens, requiresEmailVerification };
  }

  /**
   * Authentication
   */
  async login(
    credentials: AuthCredentials,
    context: { ipAddress: string; userAgent: string }
  ): Promise<{
    user: User;
    tokens: AuthTokens;
    requiresMfa: boolean;
    mfaSession?: string;
  }> {
    const { email, password, mfaCode, rememberMe } = credentials;
    const { ipAddress, userAgent } = context;

    // Check rate limiting
    await this.checkRateLimit(email, ipAddress);

    // Find user
    const user = await this.findUserByEmail(email);
    if (!user) {
      await this.recordFailedLogin(email, ipAddress);
      throw new Error('Invalid email or password');
    }

    // Verify password
    const passwordValid = await this.verifyPassword(password, user.passwordHash);
    if (!passwordValid) {
      await this.recordFailedLogin(email, ipAddress);
      throw new Error('Invalid email or password');
    }

    // Check if account is locked
    if (user.accountLocked && user.lockedUntil && user.lockedUntil > new Date()) {
      throw new Error('Account is temporarily locked due to too many failed login attempts');
    }

    // Check email verification
    if (this.config.security.requireEmailVerification && !user.isEmailVerified) {
      throw new Error(
        'Email verification required. Please check your email for verification link.'
      );
    }

    // Check MFA requirement
    const mfaEnabled = user.mfaEnabled || false;
    if (mfaEnabled && !mfaCode) {
      const mfaSession = await this.createMfaSession(user.id, ipAddress, userAgent);
      return {
        user,
        tokens: {} as AuthTokens, // Empty tokens until MFA is completed
        requiresMfa: true,
        mfaSession,
      };
    }

    // Verify MFA if provided
    if (mfaEnabled && mfaCode) {
      const mfaValid = await this.verifyMfaCode(user.id, mfaCode);
      if (!mfaValid) {
        await this.recordFailedLogin(email, ipAddress);
        throw new Error('Invalid MFA code');
      }
    }

    // Detect suspicious login
    await this.detectSuspiciousLogin(user.id, ipAddress, userAgent);

    // Generate tokens
    const deviceId = this.generateDeviceId();
    const tokens = await this.generateTokens(user.id, deviceId, rememberMe);

    // Create session
    await this.createSession(user.id, deviceId, ipAddress, userAgent);

    // Clear failed login attempts
    this.loginAttempts.delete(email);
    this.loginAttempts.delete(ipAddress);

    // Update last login
    await this.updateLastLogin(user.id, ipAddress);

    // Log security event
    this.logSecurityEvent({
      userId: user.id,
      type: 'login',
      ipAddress,
      userAgent,
      details: { method: 'password', mfaUsed: mfaEnabled },
      severity: 'low',
    });

    this.emit('user-logged-in', { user, ipAddress, userAgent });

    return { user, tokens, requiresMfa: false };
  }

  async loginWithOAuth(
    provider: 'google' | 'github' | 'microsoft',
    authCode: string,
    context: { ipAddress: string; userAgent: string }
  ): Promise<{ user: User; tokens: AuthTokens; isNewUser: boolean }> {
    const { ipAddress, userAgent } = context;

    // Exchange auth code for user info
    const userInfo = await this.exchangeOAuthCode(provider, authCode);

    // Find or create user
    let user = await this.findUserByEmail(userInfo.email);
    let isNewUser = false;

    if (!user) {
      // Create new user from OAuth info
      user = await this.createUser({
        email: userInfo.email,
        name: userInfo.name,
        avatar: userInfo.avatar,
        isEmailVerified: true, // OAuth providers verify emails
        oauthProviders: [provider],
        preferences: this.getDefaultUserPreferences(),
        subscription: this.getDefaultSubscription(),
        teams: [],
      });
      isNewUser = true;
    } else {
      // Link OAuth provider if not already linked
      if (!user.oauthProviders?.includes(provider)) {
        user.oauthProviders = [...(user.oauthProviders || []), provider];
        await this.updateUser(user.id, { oauthProviders: user.oauthProviders });
      }
    }

    // Generate tokens
    const deviceId = this.generateDeviceId();
    const tokens = await this.generateTokens(user.id, deviceId);

    // Create session
    await this.createSession(user.id, deviceId, ipAddress, userAgent);

    // Log security event
    this.logSecurityEvent({
      userId: user.id,
      type: 'login',
      ipAddress,
      userAgent,
      details: { method: 'oauth', provider, isNewUser },
      severity: 'low',
    });

    this.emit(isNewUser ? 'user-registered' : 'user-logged-in', { user, provider, ipAddress });

    return { user, tokens, isNewUser };
  }

  /**
   * Multi-Factor Authentication
   */
  async setupMfa(userId: UserId): Promise<MfaSetup> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (user.mfaEnabled) {
      throw new Error('MFA is already enabled for this user');
    }

    // Generate TOTP secret
    const secret = this.generateTotpSecret();
    const qrCode = await this.generateQrCode(user.email, secret);

    // Generate backup codes
    const backupCodes = this.generateBackupCodes();

    // Store temporarily (not yet enabled)
    this.mfaSecrets.set(userId, { secret, backupCodes });

    return {
      secret,
      qrCode,
      backupCodes,
      setupComplete: false,
    };
  }

  async enableMfa(userId: UserId, totpCode: string): Promise<{ backupCodes: string[] }> {
    const mfaData = this.mfaSecrets.get(userId);
    if (!mfaData) {
      throw new Error('MFA setup not initiated. Please start MFA setup first.');
    }

    // Verify TOTP code
    const isValid = await this.verifyTotpCode(mfaData.secret, totpCode);
    if (!isValid) {
      throw new Error('Invalid TOTP code. Please try again.');
    }

    // Enable MFA for user
    await this.updateUser(userId, {
      mfaEnabled: true,
      mfaSecret: mfaData.secret,
      mfaBackupCodes: mfaData.backupCodes,
    });

    // Clean up temporary storage
    this.mfaSecrets.delete(userId);

    // Log security event
    this.logSecurityEvent({
      userId,
      type: 'mfa_enabled',
      ipAddress: 'unknown',
      userAgent: 'setup',
      details: {},
      severity: 'medium',
    });

    this.emit('mfa-enabled', { userId });

    return { backupCodes: mfaData.backupCodes };
  }

  async disableMfa(userId: UserId, currentPassword: string, mfaCode?: string): Promise<void> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const passwordValid = await this.verifyPassword(currentPassword, user.passwordHash);
    if (!passwordValid) {
      throw new Error('Invalid current password');
    }

    // Verify MFA code if MFA is currently enabled
    if (user.mfaEnabled && mfaCode) {
      const mfaValid = await this.verifyMfaCode(userId, mfaCode);
      if (!mfaValid) {
        throw new Error('Invalid MFA code');
      }
    }

    // Disable MFA
    await this.updateUser(userId, {
      mfaEnabled: false,
      mfaSecret: null,
      mfaBackupCodes: null,
    });

    // Log security event
    this.logSecurityEvent({
      userId,
      type: 'mfa_enabled', // Using same type with different details
      ipAddress: 'unknown',
      userAgent: 'settings',
      details: { action: 'disabled' },
      severity: 'medium',
    });

    this.emit('mfa-disabled', { userId });
  }

  /**
   * Session Management
   */
  async validateToken(
    token: string
  ): Promise<{ valid: boolean; userId?: UserId; sessionId?: string }> {
    try {
      const payload = await this.verifyJwt(token);

      const session = this.sessions.get(payload.sessionId);
      if (!session || !session.isActive || session.expiresAt < new Date()) {
        return { valid: false };
      }

      // Update last activity
      session.lastActivity = new Date();

      return { valid: true, userId: payload.userId, sessionId: payload.sessionId };
    } catch (error) {
      return { valid: false };
    }
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const tokenData = this.refreshTokens.get(refreshToken);
    if (!tokenData || tokenData.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    // Generate new tokens
    const newTokens = await this.generateTokens(tokenData.userId, tokenData.deviceId);

    // Remove old refresh token
    this.refreshTokens.delete(refreshToken);

    return newTokens;
  }

  async logout(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;

      // Log security event
      this.logSecurityEvent({
        userId: session.userId,
        type: 'logout',
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        details: { sessionId },
        severity: 'low',
      });

      this.emit('user-logged-out', { userId: session.userId, sessionId });
    }
  }

  async logoutAllSessions(userId: UserId): Promise<void> {
    const userSessions = Array.from(this.sessions.values()).filter((s) => s.userId === userId);

    for (const session of userSessions) {
      session.isActive = false;
    }

    // Remove all refresh tokens for user
    for (const [token, data] of this.refreshTokens) {
      if (data.userId === userId) {
        this.refreshTokens.delete(token);
      }
    }

    this.emit('user-logged-out-all', { userId, sessionCount: userSessions.length });
  }

  async getUserSessions(userId: UserId): Promise<AuthSession[]> {
    return Array.from(this.sessions.values())
      .filter((s) => s.userId === userId && s.isActive)
      .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
  }

  /**
   * Password Management
   */
  async changePassword(
    userId: UserId,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const passwordValid = await this.verifyPassword(currentPassword, user.passwordHash);
    if (!passwordValid) {
      throw new Error('Invalid current password');
    }

    // Validate new password
    this.validatePassword(newPassword);

    // Hash new password
    const newPasswordHash = await this.hashPassword(newPassword);

    // Update password
    await this.updateUser(userId, { passwordHash: newPasswordHash });

    // Invalidate all sessions except current one
    await this.logoutAllSessions(userId);

    // Log security event
    this.logSecurityEvent({
      userId,
      type: 'password_change',
      ipAddress: 'unknown',
      userAgent: 'settings',
      details: {},
      severity: 'medium',
    });

    this.emit('password-changed', { userId });
  }

  async resetPassword(email: string): Promise<void> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      // Don't reveal if email exists
      return;
    }

    // Generate reset token
    const resetToken = this.generateSecureToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await this.storePasswordResetToken(user.id, resetToken, expiresAt);

    // Send reset email
    await this.sendPasswordResetEmail(user, resetToken);

    this.emit('password-reset-requested', { userId: user.id, email });
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    const resetData = await this.getPasswordResetToken(token);
    if (!resetData || resetData.expiresAt < new Date()) {
      throw new Error('Invalid or expired reset token');
    }

    // Validate new password
    this.validatePassword(newPassword);

    // Hash new password
    const passwordHash = await this.hashPassword(newPassword);

    // Update password
    await this.updateUser(resetData.userId, { passwordHash });

    // Invalidate reset token
    await this.deletePasswordResetToken(token);

    // Invalidate all sessions
    await this.logoutAllSessions(resetData.userId);

    // Log security event
    this.logSecurityEvent({
      userId: resetData.userId,
      type: 'password_change',
      ipAddress: 'unknown',
      userAgent: 'password-reset',
      details: { method: 'reset' },
      severity: 'medium',
    });

    this.emit('password-reset-completed', { userId: resetData.userId });
  }

  /**
   * Security Monitoring
   */
  async getSecurityEvents(userId: UserId, limit: number = 50): Promise<SecurityEvent[]> {
    return this.securityEvents
      .filter((event) => event.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async detectAnomalousActivity(userId: UserId): Promise<{
    riskScore: number;
    anomalies: string[];
    recommendations: string[];
  }> {
    const userSessions = await this.getUserSessions(userId);
    const recentEvents = await this.getSecurityEvents(userId, 100);

    let riskScore = 0;
    const anomalies: string[] = [];
    const recommendations: string[] = [];

    // Check for multiple simultaneous sessions
    if (userSessions.length > 3) {
      riskScore += 20;
      anomalies.push('Multiple simultaneous sessions detected');
      recommendations.push('Review active sessions and terminate unknown devices');
    }

    // Check for logins from new locations
    const uniqueLocations = new Set(userSessions.map((s) => s.metadata.location).filter(Boolean));
    if (uniqueLocations.size > 5) {
      riskScore += 15;
      anomalies.push('Logins from multiple geographic locations');
      recommendations.push('Enable MFA for additional security');
    }

    // Check for rapid successive logins
    const recentLogins = recentEvents.filter(
      (e) => e.type === 'login' && e.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    if (recentLogins.length > 10) {
      riskScore += 25;
      anomalies.push('Unusually high login frequency');
      recommendations.push('Check for unauthorized access attempts');
    }

    return { riskScore, anomalies, recommendations };
  }

  /**
   * Private Implementation Methods
   */
  private async validateRegistrationData(data: RegisterData): Promise<void> {
    if (!data.email || !data.password || !data.name || !data.agreeToTerms) {
      throw new Error('Missing required registration fields');
    }

    if (!this.isValidEmail(data.email)) {
      throw new Error('Invalid email format');
    }

    this.validatePassword(data.password);

    if (!data.agreeToTerms) {
      throw new Error('Must agree to terms and conditions');
    }

    // Check domain restrictions
    if (this.config.security.allowedDomains) {
      const domain = data.email.split('@')[1];
      if (!this.config.security.allowedDomains.includes(domain)) {
        throw new Error('Email domain not allowed');
      }
    }

    if (this.config.security.blockedDomains) {
      const domain = data.email.split('@')[1];
      if (this.config.security.blockedDomains.includes(domain)) {
        throw new Error('Email domain blocked');
      }
    }
  }

  private validatePassword(password: string): void {
    const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSymbols } =
      this.config.password;

    if (password.length < minLength) {
      throw new Error(`Password must be at least ${minLength} characters long`);
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (requireNumbers && !/\d/.test(password)) {
      throw new Error('Password must contain at least one number');
    }

    if (requireSymbols && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new Error('Password must contain at least one symbol');
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(32);
    const hash = await pbkdf2Async(password, salt, 100000, 64, 'sha512');
    return `${salt.toString('hex')}:${hash.toString('hex')}`;
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const [saltHex, hashHex] = hash.split(':');
    const salt = Buffer.from(saltHex, 'hex');
    const expectedHash = Buffer.from(hashHex, 'hex');
    const actualHash = await pbkdf2Async(password, salt, 100000, 64, 'sha512');

    return timingSafeEqual(expectedHash, actualHash);
  }

  private generateDeviceId(): string {
    return randomBytes(16).toString('hex');
  }

  private generateSecureToken(): string {
    return randomBytes(32).toString('hex');
  }

  private generateTotpSecret(): string {
    return randomBytes(20).toString('base32');
  }

  private generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < this.config.mfa.backupCodesCount; i++) {
      codes.push(randomBytes(4).toString('hex').toUpperCase());
    }
    return codes;
  }

  private logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      id: randomBytes(16).toString('hex'),
      ...event,
      timestamp: new Date(),
    };

    this.securityEvents.push(securityEvent);

    // Keep only last 10000 events
    if (this.securityEvents.length > 10000) {
      this.securityEvents = this.securityEvents.slice(-5000);
    }

    this.emit('security-event', securityEvent);
  }

  private startSessionCleanup(): void {
    setInterval(
      () => {
        const now = new Date();
        for (const [sessionId, session] of this.sessions) {
          if (!session.isActive || session.expiresAt < now) {
            this.sessions.delete(sessionId);
          }
        }

        // Clean up expired refresh tokens
        for (const [token, data] of this.refreshTokens) {
          if (data.expiresAt < now) {
            this.refreshTokens.delete(token);
          }
        }
      },
      60 * 60 * 1000
    ); // Run every hour
  }

  // Data access methods (to be implemented with actual database/services)
  private async findUserByEmail(email: string): Promise<unknown> {
    return null;
  }
  private async findUserById(userId: UserId): Promise<unknown> {
    return null;
  }
  private async createUser(
    userData: Omit<User, 'id' | 'createdAt' | 'lastLoginAt'>
  ): Promise<User> {
    throw new Error('Not implemented');
  }
  private async updateUser(userId: UserId, updates: Partial<User>): Promise<void> {}
  private async updateLastLogin(userId: UserId, ipAddress: string): Promise<void> {}
  private async createSession(
    userId: UserId,
    deviceId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<AuthSession> {
    throw new Error('Not implemented');
  }
  private async createMfaSession(
    userId: UserId,
    ipAddress: string,
    userAgent: string
  ): Promise<string> {
    return 'mfa-session';
  }
  private async checkRateLimit(email: string, ipAddress: string): Promise<void> {}
  private async recordFailedLogin(identifier: string, ipAddress: string): Promise<void> {}
  private async verifyMfaCode(userId: UserId, code: string): Promise<boolean> {
    return false;
  }
  private async detectSuspiciousLogin(
    userId: UserId,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {}
  private async generateTokens(
    userId: UserId,
    deviceId: string,
    rememberMe?: boolean
  ): Promise<AuthTokens> {
    throw new Error('Not implemented');
  }
  private async verifyJwt(token: string): Promise<unknown> {
    throw new Error('Not implemented');
  }
  private async verifyTotpCode(secret: string, code: string): Promise<boolean> {
    return false;
  }
  private async generateQrCode(email: string, secret: string): Promise<string> {
    return '';
  }
  private async validateInviteCode(code: string): Promise<void> {}
  private async sendEmailVerification(user: User): Promise<void> {}
  private async exchangeOAuthCode(provider: string, code: string): Promise<unknown> {
    return {};
  }
  private async storePasswordResetToken(
    userId: UserId,
    token: string,
    expiresAt: Date
  ): Promise<void> {}
  private async getPasswordResetToken(token: string): Promise<unknown> {
    return null;
  }
  private async deletePasswordResetToken(token: string): Promise<void> {}
  private async sendPasswordResetEmail(user: User, token: string): Promise<void> {}

  private getDefaultUserPreferences(): UserPreferences {
    return {
      theme: 'system',
      notifications: {
        email: true,
        browser: true,
        projectShared: true,
        projectUpdated: true,
        collaboratorJoined: true,
        commentAdded: true,
      },
      privacy: {
        profileVisibility: 'team',
        showEmail: false,
        allowProjectDiscovery: true,
      },
      editor: {
        autoSave: true,
        autoSync: true,
        conflictResolution: 'auto',
        gridSnap: true,
        showGrid: true,
      },
    };
  }

  private getDefaultSubscription(): SubscriptionInfo {
    return {
      tier: 'free',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      quotas: {
        maxProjects: 3,
        maxStorageGB: 1,
        maxCollaborators: 3,
        maxPlugins: 10,
        computeHours: 10,
        apiCallsPerMonth: 1000,
        maxTeamMembers: 0,
      },
    };
  }
}
