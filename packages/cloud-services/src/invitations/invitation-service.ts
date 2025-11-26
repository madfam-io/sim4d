/**
 * Invitation Service
 * Manages project and team invitations with email notifications and expiration
 */

import EventEmitter from 'events';
import {
  ProjectId,
  UserId,
  TeamId,
  ProjectRole,
  TeamRole,
  ShareInvitation,
} from '@sim4d/cloud-api/src/types';

export interface InvitationConfig {
  defaultExpiration: number; // ms
  maxInvitations: number;
  emailService: {
    enabled: boolean;
    provider: 'smtp' | 'sendgrid' | 'ses' | 'mailgun';
    templates: {
      projectInvitation: string;
      teamInvitation: string;
      reminder: string;
    };
  };
  validation: {
    requireEmailVerification: boolean;
    allowedDomains?: string[];
    blockedDomains?: string[];
  };
}

export interface InvitationRequest {
  type: 'project' | 'team';
  resourceId: ProjectId | TeamId;
  inviterUserId: UserId;
  targetEmails: string[];
  role: ProjectRole | TeamRole;
  message?: string;
  expiresAt?: Date;
  customData?: Record<string, unknown>;
}

export interface InvitationResponse {
  invitationId: string;
  accepted: boolean;
  declinedReason?: string;
  respondedAt: Date;
  userCreated?: boolean;
}

export interface PendingInvitation {
  id: string;
  type: 'project' | 'team';
  resourceId: string;
  fromUserId: UserId;
  toEmail: string;
  toUserId?: UserId;
  role: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  createdAt: Date;
  expiresAt: Date;
  respondedAt?: Date;
  remindersSent: number;
  customData?: Record<string, unknown>;
}

export class InvitationService extends EventEmitter {
  private config: InvitationConfig;
  private pendingInvitations = new Map<string, PendingInvitation>();
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: InvitationConfig) {
    super();
    this.config = config;
    this.startCleanupTimer();
  }

  /**
   * Send Invitations
   */
  async sendInvitations(request: InvitationRequest): Promise<string[]> {
    const invitationIds: string[] = [];

    // Validate emails
    const validEmails = await this.validateEmails(request.targetEmails);
    if (validEmails.length === 0) {
      throw new Error('No valid email addresses provided');
    }

    // Check invitation limits
    await this.checkInvitationLimits(request.inviterUserId, validEmails.length);

    // Create invitations
    for (const email of validEmails) {
      try {
        const invitationId = await this.createInvitation({
          ...request,
          targetEmails: [email],
        });

        invitationIds.push(invitationId);
      } catch (error) {
        this.emit('invitation-error', {
          email,
          error: error.message,
          request,
        });
      }
    }

    this.emit('invitations-sent', {
      inviterUserId: request.inviterUserId,
      resourceId: request.resourceId,
      type: request.type,
      emailCount: invitationIds.length,
      invitationIds,
    });

    return invitationIds;
  }

  async sendProjectInvitation(
    projectId: ProjectId,
    inviterUserId: UserId,
    targetEmails: string[],
    role: ProjectRole,
    message?: string
  ): Promise<string[]> {
    return this.sendInvitations({
      type: 'project',
      resourceId: projectId,
      inviterUserId,
      targetEmails,
      role,
      message,
    });
  }

  async sendTeamInvitation(
    teamId: TeamId,
    inviterUserId: UserId,
    targetEmails: string[],
    role: TeamRole,
    message?: string
  ): Promise<string[]> {
    return this.sendInvitations({
      type: 'team',
      resourceId: teamId,
      inviterUserId,
      targetEmails,
      role,
      message,
    });
  }

  /**
   * Respond to Invitations
   */
  async acceptInvitation(
    invitationId: string,
    userId?: UserId,
    userCreationData?: {
      name: string;
      password: string;
    }
  ): Promise<InvitationResponse> {
    const invitation = await this.getInvitation(invitationId);
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new Error(`Invitation is ${invitation.status} and cannot be accepted`);
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = 'expired';
      await this.saveInvitation(invitation);
      throw new Error('Invitation has expired');
    }

    // Handle user creation if needed
    let targetUserId = userId;
    let userCreated = false;

    if (!targetUserId) {
      if (userCreationData) {
        targetUserId = await this.createUserFromInvitation(invitation, userCreationData);
        userCreated = true;
      } else {
        // Check if user exists by email
        targetUserId = await this.findUserByEmail(invitation.toEmail);
        if (!targetUserId) {
          throw new Error('User account required to accept invitation');
        }
      }
    }

    // Add user to resource
    if (invitation.type === 'project') {
      await this.addUserToProject(
        invitation.resourceId as ProjectId,
        targetUserId,
        invitation.role as ProjectRole,
        invitation.fromUserId
      );
    } else if (invitation.type === 'team') {
      await this.addUserToTeam(
        invitation.resourceId as TeamId,
        targetUserId,
        invitation.role as TeamRole,
        invitation.fromUserId
      );
    }

    // Update invitation status
    invitation.status = 'accepted';
    invitation.respondedAt = new Date();
    invitation.toUserId = targetUserId;
    await this.saveInvitation(invitation);

    const response: InvitationResponse = {
      invitationId,
      accepted: true,
      respondedAt: invitation.respondedAt,
      userCreated,
    };

    this.emit('invitation-accepted', {
      invitation,
      userId: targetUserId,
      userCreated,
    });

    return response;
  }

  async declineInvitation(invitationId: string, reason?: string): Promise<InvitationResponse> {
    const invitation = await this.getInvitation(invitationId);
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new Error(`Invitation is ${invitation.status} and cannot be declined`);
    }

    invitation.status = 'declined';
    invitation.respondedAt = new Date();
    await this.saveInvitation(invitation);

    const response: InvitationResponse = {
      invitationId,
      accepted: false,
      declinedReason: reason,
      respondedAt: invitation.respondedAt,
    };

    this.emit('invitation-declined', {
      invitation,
      reason,
    });

    return response;
  }

  /**
   * Invitation Management
   */
  async getInvitation(invitationId: string): Promise<PendingInvitation | null> {
    const cached = this.pendingInvitations.get(invitationId);
    if (cached) {
      return cached;
    }

    const invitation = await this.loadInvitationFromDb(invitationId);
    if (invitation) {
      this.pendingInvitations.set(invitationId, invitation);
    }

    return invitation;
  }

  async getUserInvitations(
    userId: UserId,
    status?: 'pending' | 'accepted' | 'declined' | 'expired'
  ): Promise<PendingInvitation[]> {
    return this.loadUserInvitationsFromDb(userId, status);
  }

  async getResourceInvitations(
    type: 'project' | 'team',
    resourceId: string,
    status?: 'pending' | 'accepted' | 'declined' | 'expired'
  ): Promise<PendingInvitation[]> {
    return this.loadResourceInvitationsFromDb(type, resourceId, status);
  }

  async cancelInvitation(invitationId: string, cancelledBy: UserId): Promise<void> {
    const invitation = await this.getInvitation(invitationId);
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.fromUserId !== cancelledBy) {
      // Check if user has permission to cancel
      const hasPermission = await this.checkCancelPermission(invitation, cancelledBy);
      if (!hasPermission) {
        throw new Error('Insufficient permissions to cancel invitation');
      }
    }

    if (invitation.status !== 'pending') {
      throw new Error(`Cannot cancel ${invitation.status} invitation`);
    }

    invitation.status = 'cancelled';
    await this.saveInvitation(invitation);

    this.emit('invitation-cancelled', {
      invitation,
      cancelledBy,
    });
  }

  async resendInvitation(invitationId: string, resentBy: UserId): Promise<void> {
    const invitation = await this.getInvitation(invitationId);
    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new Error(`Cannot resend ${invitation.status} invitation`);
    }

    if (invitation.expiresAt < new Date()) {
      // Extend expiration
      invitation.expiresAt = new Date(Date.now() + this.config.defaultExpiration);
      await this.saveInvitation(invitation);
    }

    // Send email
    if (this.config.emailService.enabled) {
      await this.sendInvitationEmail(invitation, true);
    }

    invitation.remindersSent++;
    await this.saveInvitation(invitation);

    this.emit('invitation-resent', {
      invitation,
      resentBy,
    });
  }

  /**
   * Email Notifications
   */
  private async sendInvitationEmail(
    invitation: PendingInvitation,
    isReminder: boolean = false
  ): Promise<void> {
    if (!this.config.emailService.enabled) {
      return;
    }

    try {
      const inviter = await this.getUserData(invitation.fromUserId);
      const resource = await this.getResourceData(invitation.type, invitation.resourceId);

      const emailData = {
        to: invitation.toEmail,
        from: inviter,
        invitation,
        resource,
        acceptUrl: this.generateAcceptUrl(invitation.id),
        declineUrl: this.generateDeclineUrl(invitation.id),
        isReminder,
      };

      const templateName = isReminder
        ? this.config.emailService.templates.reminder
        : invitation.type === 'project'
          ? this.config.emailService.templates.projectInvitation
          : this.config.emailService.templates.teamInvitation;

      await this.sendEmail(templateName, emailData);

      this.emit('invitation-email-sent', {
        invitationId: invitation.id,
        email: invitation.toEmail,
        isReminder,
      });
    } catch (error) {
      this.emit('email-error', {
        invitationId: invitation.id,
        email: invitation.toEmail,
        error: error.message,
      });
    }
  }

  /**
   * Validation and Utilities
   */
  private async validateEmails(emails: string[]): Promise<string[]> {
    const validEmails: string[] = [];

    for (const email of emails) {
      if (!this.isValidEmail(email)) {
        continue;
      }

      if (this.config.validation.allowedDomains) {
        const domain = email.split('@')[1];
        if (!this.config.validation.allowedDomains.includes(domain)) {
          continue;
        }
      }

      if (this.config.validation.blockedDomains) {
        const domain = email.split('@')[1];
        if (this.config.validation.blockedDomains.includes(domain)) {
          continue;
        }
      }

      validEmails.push(email.toLowerCase());
    }

    return Array.from(new Set(validEmails)); // Remove duplicates
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private async checkInvitationLimits(userId: UserId, count: number): Promise<void> {
    const existingInvitations = await this.getUserSentInvitations(userId, 'pending');

    if (existingInvitations.length + count > this.config.maxInvitations) {
      throw new Error(
        `Invitation limit exceeded. Maximum ${this.config.maxInvitations} pending invitations allowed`
      );
    }
  }

  private async createInvitation(request: InvitationRequest): Promise<string> {
    const invitationId = this.generateInvitationId();
    const expiresAt = request.expiresAt || new Date(Date.now() + this.config.defaultExpiration);

    const invitation: PendingInvitation = {
      id: invitationId,
      type: request.type,
      resourceId: request.resourceId,
      fromUserId: request.inviterUserId,
      toEmail: request.targetEmails[0].toLowerCase(),
      role: request.role as string,
      message: request.message,
      status: 'pending',
      createdAt: new Date(),
      expiresAt,
      remindersSent: 0,
      customData: request.customData,
    };

    // Check if user already exists
    const existingUserId = await this.findUserByEmail(invitation.toEmail);
    if (existingUserId) {
      invitation.toUserId = existingUserId;
    }

    await this.saveInvitation(invitation);

    // Send invitation email
    if (this.config.emailService.enabled) {
      await this.sendInvitationEmail(invitation);
    }

    this.emit('invitation-created', invitation);
    return invitationId;
  }

  /**
   * Cleanup and Maintenance
   */
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(
      () => {
        this.cleanupExpiredInvitations();
      },
      60 * 60 * 1000
    ); // Run every hour
  }

  private async cleanupExpiredInvitations(): Promise<void> {
    const now = new Date();
    const expiredInvitations = await this.getExpiredInvitations();

    for (const invitation of expiredInvitations) {
      if (invitation.status === 'pending') {
        invitation.status = 'expired';
        await this.saveInvitation(invitation);

        this.emit('invitation-expired', invitation);
      }
    }

    // Clean up memory cache
    for (const [id, invitation] of this.pendingInvitations) {
      if (invitation.expiresAt < now && invitation.status === 'expired') {
        this.pendingInvitations.delete(id);
      }
    }
  }

  private generateInvitationId(): string {
    return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAcceptUrl(invitationId: string): string {
    return `${process.env.FRONTEND_URL}/invitations/${invitationId}/accept`;
  }

  private generateDeclineUrl(invitationId: string): string {
    return `${process.env.FRONTEND_URL}/invitations/${invitationId}/decline`;
  }

  /**
   * Data Access Methods (to be implemented with actual services)
   */
  private async loadInvitationFromDb(invitationId: string): Promise<PendingInvitation | null> {
    // Implementation depends on database service
    throw new Error('Invitation database access implementation required');
  }

  private async saveInvitation(invitation: PendingInvitation): Promise<void> {
    // Implementation depends on database service
    this.pendingInvitations.set(invitation.id, invitation);
    // Also save to database
  }

  private async loadUserInvitationsFromDb(
    userId: UserId,
    status?: string
  ): Promise<PendingInvitation[]> {
    // Implementation depends on database service
    throw new Error('User invitations database access implementation required');
  }

  private async loadResourceInvitationsFromDb(
    type: string,
    resourceId: string,
    status?: string
  ): Promise<PendingInvitation[]> {
    // Implementation depends on database service
    throw new Error('Resource invitations database access implementation required');
  }

  private async getUserSentInvitations(
    userId: UserId,
    status: string
  ): Promise<PendingInvitation[]> {
    // Implementation depends on database service
    throw new Error('Sent invitations database access implementation required');
  }

  private async getExpiredInvitations(): Promise<PendingInvitation[]> {
    // Implementation depends on database service
    throw new Error('Expired invitations database access implementation required');
  }

  private async findUserByEmail(email: string): Promise<UserId | null> {
    // Implementation depends on user service
    throw new Error('User lookup implementation required');
  }

  private async createUserFromInvitation(
    invitation: PendingInvitation,
    userData: { name: string; password: string }
  ): Promise<UserId> {
    // Implementation depends on user service
    throw new Error('User creation implementation required');
  }

  private async addUserToProject(
    projectId: ProjectId,
    userId: UserId,
    role: ProjectRole,
    addedBy: UserId
  ): Promise<void> {
    // Implementation depends on permission service
    throw new Error('Project collaboration implementation required');
  }

  private async addUserToTeam(
    teamId: TeamId,
    userId: UserId,
    role: TeamRole,
    addedBy: UserId
  ): Promise<void> {
    // Implementation depends on permission service
    throw new Error('Team membership implementation required');
  }

  private async checkCancelPermission(
    invitation: PendingInvitation,
    userId: UserId
  ): Promise<boolean> {
    // Implementation depends on permission service
    throw new Error('Permission check implementation required');
  }

  private async getUserData(userId: UserId): Promise<unknown> {
    // Implementation depends on user service
    throw new Error('User data access implementation required');
  }

  private async getResourceData(type: string, resourceId: string): Promise<unknown> {
    // Implementation depends on project/team service
    throw new Error('Resource data access implementation required');
  }

  private async sendEmail(templateName: string, data: unknown): Promise<void> {
    // Implementation depends on email service
    throw new Error('Email service implementation required');
  }

  /**
   * Public Cleanup
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}
