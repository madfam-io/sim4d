/**
 * Project Sharing Manager
 * Handles project sharing, permissions, and collaboration
 */

import EventEmitter from 'events';
import {
  ProjectId,
  UserId,
  TeamId,
  ShareId,
  ShareLink,
  ShareRequest,
  ShareInvitation,
  CollaboratorAccess,
  ProjectRole,
  ProjectPermission,
  User,
} from '@brepflow/cloud-api/src/types';
import { CloudApiClient } from '../api/cloud-api-client';

const isSharingEnabled = (): boolean => {
  if (
    typeof process !== 'undefined' &&
    process.env &&
    'BREPFLOW_ENABLE_PROJECT_SHARING' in process.env
  ) {
    return process.env.BREPFLOW_ENABLE_PROJECT_SHARING === 'true';
  }

  if (
    typeof globalThis !== 'undefined' &&
    '__BREPFLOW_ENABLE_PROJECT_SHARING__' in (globalThis as any)
  ) {
    return Boolean((globalThis as any).__BREPFLOW_ENABLE_PROJECT_SHARING__);
  }

  return false;
};

export interface SharingConfig {
  apiEndpoint: string;
  apiKey?: string;
  maxSharesPerProject: number;
  defaultLinkExpiration: number; // days
  allowAnonymousAccess: boolean;
  requireEmailVerification: boolean;
  requestTimeout?: number;
}

export interface ShareAnalytics {
  shareId: ShareId;
  totalAccesses: number;
  uniqueUsers: number;
  lastAccessed: Date;
  accessHistory: ShareAccess[];
}

export interface ShareAccess {
  userId?: UserId;
  email?: string;
  accessedAt: Date;
  ipAddress: string;
  userAgent: string;
  location?: {
    country: string;
    city: string;
  };
}

type ExtendedShareRequest = ShareRequest & { requestedBy?: UserId };

export class ProjectSharingManager extends EventEmitter {
  private config: SharingConfig;
  private shareCache = new Map<ShareId, ShareLink>();
  private invitationCache = new Map<string, ShareInvitation>();
  private apiClient: CloudApiClient;

  constructor(config: SharingConfig, apiClient?: CloudApiClient) {
    super();
    if (!isSharingEnabled()) {
      throw new Error(
        'Project sharing is disabled. Set BREPFLOW_ENABLE_PROJECT_SHARING=true (or globalThis.__BREPFLOW_ENABLE_PROJECT_SHARING__ = true) to enable this experimental feature.'
      );
    }
    this.config = config;
    this.apiClient =
      apiClient ??
      new CloudApiClient({
        baseUrl: config.apiEndpoint,
        apiKey: config.apiKey || '',
        userId: 'system',
        timeout: config.requestTimeout ?? 10000,
        retryAttempts: 2,
        cacheEnabled: true,
        cacheTTL: 30_000,
      });
  }

  /**
   * Create a shareable link for a project
   */
  async createShareLink(
    projectId: ProjectId,
    createdBy: UserId,
    options: {
      accessLevel?: ProjectRole;
      expiresAt?: Date;
      isPublic?: boolean;
      allowAnonymous?: boolean;
      maxUses?: number;
      description?: string;
    } = {}
  ): Promise<ShareLink> {
    try {
      // Validate permissions
      await this.validateUserPermission(createdBy, projectId, 'share');

      const allowAnonymous = options.allowAnonymous ?? this.config.allowAnonymousAccess;
      if (allowAnonymous && this.config.requireEmailVerification) {
        throw new Error('Anonymous access is disabled while email verification is required');
      }

      const shareLink = await this.apiClient.createShareLink(projectId, {
        createdBy,
        accessLevel: options.accessLevel || 'viewer',
        expiresAt: options.expiresAt || this.getDefaultExpiration(),
        isPublic: options.isPublic ?? false,
        allowAnonymous,
        maxUses: options.maxUses,
        description: options.description,
      });

      this.shareCache.set(shareLink.id, shareLink);

      this.emit('share-link-created', { shareLink, options });

      return shareLink;
    } catch (error) {
      this.emit('share-error', { projectId, error: error.message });
      throw error;
    }
  }

  /**
   * Send invitations to specific users/emails
   */
  async sendInvitations(request: ExtendedShareRequest): Promise<ShareInvitation[]> {
    try {
      // Validate permissions
      const requester = request.requestedBy || request.targetUsers[0];
      await this.validateUserPermission(requester, request.projectId, 'share');

      await this.apiClient.sendInvitation(request.projectId, {
        userIds: request.targetUsers,
        emails: request.targetEmails,
        role: request.role,
        message: request.message,
        expiresAt: request.expiresAt,
      });

      const invitations: ShareInvitation[] = [];

      // Process user invitations
      for (const userId of request.targetUsers) {
        const invitation = await this.createUserInvitation(requester, request, userId);
        invitations.push(invitation);
      }

      // Process email invitations
      for (const email of request.targetEmails) {
        const invitation = await this.createEmailInvitation(requester, request, email);
        invitations.push(invitation);
      }

      // Send invitation notifications
      await this.sendInvitationNotifications(invitations);

      this.emit('invitations-sent', { request, invitations });

      return invitations;
    } catch (error) {
      this.emit('invitation-error', { request, error: error.message });
      throw error;
    }
  }

  /**
   * Accept a project invitation
   */
  async acceptInvitation(invitationId: string, userId: UserId): Promise<CollaboratorAccess> {
    try {
      const invitation = await this.getInvitation(invitationId);

      if (!invitation) {
        throw new Error('Invitation not found');
      }

      if (invitation.status !== 'pending') {
        throw new Error(`Invitation is ${invitation.status}`);
      }

      if (invitation.expiresAt < new Date()) {
        throw new Error('Invitation has expired');
      }

      // Update invitation status
      invitation.status = 'accepted';
      invitation.toUserId = userId;
      await this.updateInvitation(invitation);

      // Add user as collaborator
      const collaborator: CollaboratorAccess = {
        userId,
        role: invitation.role,
        addedAt: new Date(),
        addedBy: invitation.fromUserId,
        permissions: this.getRolePermissions(invitation.role),
      };

      await this.addCollaborator(invitation.projectId, collaborator);

      this.emit('invitation-accepted', { invitation, collaborator });

      return collaborator;
    } catch (error) {
      this.emit('invitation-error', { invitationId, error: error.message });
      throw error;
    }
  }

  /**
   * Decline a project invitation
   */
  async declineInvitation(invitationId: string, userId: UserId): Promise<void> {
    try {
      const invitation = await this.getInvitation(invitationId);

      if (!invitation) {
        throw new Error('Invitation not found');
      }

      if (invitation.toUserId && invitation.toUserId !== userId) {
        throw new Error('Unauthorized to decline this invitation');
      }

      invitation.status = 'declined';
      await this.updateInvitation(invitation);

      this.emit('invitation-declined', { invitation });
    } catch (error) {
      this.emit('invitation-error', { invitationId, error: error.message });
      throw error;
    }
  }

  /**
   * Access a project via share link
   */
  async accessViaShareLink(
    shareId: ShareId,
    accessInfo: {
      userId?: UserId;
      email?: string;
      ipAddress: string;
      userAgent: string;
    }
  ): Promise<{
    projectId: ProjectId;
    accessLevel: ProjectRole;
    temporaryAccess: boolean;
  }> {
    try {
      const shareLink = await this.getShareLink(shareId);

      if (!shareLink) {
        throw new Error('Share link not found');
      }

      if (!shareLink.isActive) {
        throw new Error('Share link is inactive');
      }

      if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
        throw new Error('Share link has expired');
      }

      if (shareLink.maxUses && shareLink.currentUses >= shareLink.maxUses) {
        throw new Error('Share link usage limit exceeded');
      }

      if (!shareLink.allowAnonymous && !accessInfo.userId) {
        throw new Error('Authentication required');
      }

      // Log access
      await this.logShareAccess(shareLink, accessInfo);

      // Update usage count
      shareLink.currentUses++;
      await this.updateShareLink(shareLink);

      // Grant temporary access for anonymous users
      const temporaryAccess = !accessInfo.userId;

      if (accessInfo.userId && !temporaryAccess) {
        // Add as collaborator if authenticated user
        const collaborator: CollaboratorAccess = {
          userId: accessInfo.userId,
          role: shareLink.accessLevel,
          addedAt: new Date(),
          addedBy: shareLink.createdBy,
          permissions: this.getRolePermissions(shareLink.accessLevel),
        };

        await this.addCollaborator(shareLink.projectId, collaborator);
      }

      this.emit('share-link-accessed', { shareLink, accessInfo });

      return {
        projectId: shareLink.projectId,
        accessLevel: shareLink.accessLevel,
        temporaryAccess,
      };
    } catch (error) {
      this.emit('share-access-error', { shareId, error: error.message });
      throw error;
    }
  }

  /**
   * Update collaborator permissions
   */
  async updateCollaboratorRole(
    projectId: ProjectId,
    userId: UserId,
    newRole: ProjectRole,
    updatedBy: UserId
  ): Promise<void> {
    try {
      // Validate permissions
      await this.validateUserPermission(updatedBy, projectId, 'admin');

      const collaborator = await this.getCollaborator(projectId, userId);
      if (!collaborator) {
        throw new Error('Collaborator not found');
      }

      // Update role and permissions
      collaborator.role = newRole;
      collaborator.permissions = this.getRolePermissions(newRole);

      await this.updateCollaborator(projectId, collaborator);

      this.emit('collaborator-updated', { projectId, userId, newRole, updatedBy });
    } catch (error) {
      this.emit('collaborator-error', { projectId, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Remove collaborator from project
   */
  async removeCollaborator(projectId: ProjectId, userId: UserId, removedBy: UserId): Promise<void> {
    try {
      // Validate permissions
      await this.validateUserPermission(removedBy, projectId, 'admin');

      // Cannot remove project owner
      const project = await this.getProject(projectId);
      if (project.ownerId === userId) {
        throw new Error('Cannot remove project owner');
      }

      await this.deleteCollaborator(projectId, userId);

      this.emit('collaborator-removed', { projectId, userId, removedBy });
    } catch (error) {
      this.emit('collaborator-error', { projectId, userId, error: error.message });
      throw error;
    }
  }

  /**
   * Get project collaborators
   */
  async getCollaborators(projectId: ProjectId, requestedBy: UserId): Promise<CollaboratorAccess[]> {
    try {
      await this.validateUserPermission(requestedBy, projectId, 'read');
      return this.fetchCollaborators(projectId);
    } catch (error) {
      this.emit('collaborator-error', { projectId, error: error.message });
      throw error;
    }
  }

  /**
   * Get share analytics
   */
  async getShareAnalytics(shareId: ShareId, requestedBy: UserId): Promise<ShareAnalytics> {
    try {
      const shareLink = await this.getShareLink(shareId);
      if (!shareLink) {
        throw new Error('Share link not found');
      }

      await this.validateUserPermission(requestedBy, shareLink.projectId, 'admin');

      return this.fetchShareAnalytics(shareId);
    } catch (error) {
      this.emit('analytics-error', { shareId, error: error.message });
      throw error;
    }
  }

  /**
   * Revoke share link
   */
  async revokeShareLink(shareId: ShareId, revokedBy: UserId): Promise<void> {
    try {
      const shareLink = await this.getShareLink(shareId);
      if (!shareLink) {
        throw new Error('Share link not found');
      }

      await this.validateUserPermission(revokedBy, shareLink.projectId, 'admin');

      shareLink.isActive = false;
      await this.apiClient.revokeShareLink(shareId);
      await this.updateShareLink(shareLink);

      this.shareCache.delete(shareId);

      this.emit('share-link-revoked', { shareId, revokedBy });
    } catch (error) {
      this.emit('share-error', { shareId, error: error.message });
      throw error;
    }
  }

  // Private methods

  private generateShareId(): ShareId {
    return `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultExpiration(): Date {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + this.config.defaultLinkExpiration);
    return expiration;
  }

  private async createUserInvitation(
    requestedBy: UserId,
    request: ShareRequest,
    userId: UserId
  ): Promise<ShareInvitation> {
    const user = await this.getUser(userId);

    const invitation: ShareInvitation = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId: request.projectId,
      fromUserId: requestedBy,
      toUserId: userId,
      toEmail: user.email,
      role: request.role,
      message: request.message,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: request.expiresAt || this.getDefaultExpiration(),
    };

    await this.saveInvitation(invitation);
    this.invitationCache.set(invitation.id, invitation);

    return invitation;
  }

  private async createEmailInvitation(
    requestedBy: UserId,
    request: ShareRequest,
    email: string
  ): Promise<ShareInvitation> {
    const invitation: ShareInvitation = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      projectId: request.projectId,
      fromUserId: requestedBy,
      toEmail: email,
      role: request.role,
      message: request.message,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: request.expiresAt || this.getDefaultExpiration(),
    };

    await this.saveInvitation(invitation);
    this.invitationCache.set(invitation.id, invitation);

    return invitation;
  }

  private getRolePermissions(role: ProjectRole): ProjectPermission[] {
    const permissions: ProjectPermission[] = [];

    switch (role) {
      case 'owner':
        permissions.push(
          { action: 'admin', resource: 'project', granted: true },
          { action: 'delete', resource: 'project', granted: true },
          { action: 'share', resource: 'project', granted: true },
          { action: 'write', resource: 'nodes', granted: true },
          { action: 'write', resource: 'parameters', granted: true },
          { action: 'export', resource: 'geometry', granted: true }
        );
        break;

      case 'editor':
        permissions.push(
          { action: 'read', resource: 'project', granted: true },
          { action: 'write', resource: 'nodes', granted: true },
          { action: 'write', resource: 'parameters', granted: true },
          { action: 'write', resource: 'comments', granted: true },
          { action: 'export', resource: 'geometry', granted: true }
        );
        break;

      case 'viewer':
        permissions.push(
          { action: 'read', resource: 'project', granted: true },
          { action: 'read', resource: 'nodes', granted: true },
          { action: 'read', resource: 'parameters', granted: true },
          { action: 'write', resource: 'comments', granted: true }
        );
        break;

      case 'commenter':
        permissions.push(
          { action: 'read', resource: 'project', granted: true },
          { action: 'read', resource: 'nodes', granted: true },
          { action: 'write', resource: 'comments', granted: true }
        );
        break;
    }

    return permissions;
  }

  private async sendInvitationNotifications(invitations: ShareInvitation[]): Promise<void> {
    for (const invitation of invitations) {
      try {
        await this.sendInvitationEmail(invitation);
        this.emit('invitation-sent', { invitation });
      } catch (error) {
        this.emit('invitation-send-error', { invitation, error: error.message });
      }
    }
  }

  // API integration methods (to be implemented with actual backend)
  private async validateUserPermission(
    userId: UserId,
    projectId: ProjectId,
    action: string
  ): Promise<void> {
    const project = await this.apiClient.getProject(projectId);

    if (project.ownerId === userId) {
      return;
    }

    const collaborator = project.collaborators?.find((c) => c.userId === userId);
    if (!collaborator) {
      throw new Error(`User ${userId} is not a collaborator on project ${projectId}`);
    }

    const permissionMap: Record<string, ProjectPermission['action']> = {
      read: 'read',
      write: 'write',
      delete: 'delete',
      share: 'share',
      admin: 'admin',
      export: 'export',
    };

    const requiredAction = permissionMap[action] || 'read';
    const hasPermission = collaborator.permissions.some(
      (permission) => permission.action === requiredAction && permission.granted
    );

    if (!hasPermission) {
      throw new Error(`User ${userId} lacks ${requiredAction} permission for project ${projectId}`);
    }
  }

  private async updateShareLink(shareLink: ShareLink): Promise<void> {
    const updated = await this.apiClient.updateShareLink(shareLink.id, shareLink);
    this.shareCache.set(updated.id, updated);
  }

  private async getShareLink(shareId: ShareId): Promise<ShareLink | null> {
    // Check cache first
    if (this.shareCache.has(shareId)) {
      return this.shareCache.get(shareId)!;
    }
    const shareLink = await this.apiClient.getShareLink(shareId);
    if (shareLink) {
      this.shareCache.set(shareLink.id, shareLink);
    }
    return shareLink || null;
  }

  private async saveInvitation(invitation: ShareInvitation): Promise<void> {
    this.invitationCache.set(invitation.id, invitation);
  }

  private async updateInvitation(invitation: ShareInvitation): Promise<void> {
    this.invitationCache.set(invitation.id, invitation);
  }

  private async getInvitation(invitationId: string): Promise<ShareInvitation | null> {
    // Check cache first
    if (this.invitationCache.has(invitationId)) {
      return this.invitationCache.get(invitationId)!;
    }
    return null;
  }

  private async getUser(userId: UserId): Promise<User> {
    return this.apiClient.getUser(userId);
  }

  private async getProject(projectId: ProjectId): Promise<any> {
    return this.apiClient.getProject(projectId);
  }

  private async addCollaborator(
    projectId: ProjectId,
    collaborator: CollaboratorAccess
  ): Promise<void> {
    await this.apiClient.addCollaborator(projectId, collaborator);
  }

  private async updateCollaborator(
    projectId: ProjectId,
    collaborator: CollaboratorAccess
  ): Promise<void> {
    await this.apiClient.updateCollaborator(projectId, collaborator);
  }

  private async deleteCollaborator(projectId: ProjectId, userId: UserId): Promise<void> {
    await this.apiClient.removeCollaborator(projectId, userId);
  }

  private async getCollaborator(
    projectId: ProjectId,
    userId: UserId
  ): Promise<CollaboratorAccess | null> {
    const collaborators = await this.fetchCollaborators(projectId);
    return collaborators.find((collaborator) => collaborator.userId === userId) || null;
  }

  private async fetchCollaborators(projectId: ProjectId): Promise<CollaboratorAccess[]> {
    return this.apiClient.getCollaborators(projectId);
  }

  private async logShareAccess(shareLink: ShareLink, accessInfo: any): Promise<void> {
    await this.apiClient.logShareAccess(shareLink.id, {
      ...accessInfo,
      accessedAt: new Date(),
    });
  }

  private async fetchShareAnalytics(shareId: ShareId): Promise<ShareAnalytics> {
    const analytics = await this.apiClient.getShareAnalytics(shareId);
    return {
      shareId,
      totalAccesses: analytics.totalAccesses ?? 0,
      uniqueUsers: analytics.uniqueUsers ?? 0,
      lastAccessed: analytics.lastAccessed ? new Date(analytics.lastAccessed) : new Date(),
      accessHistory: analytics.accessHistory ?? [],
    };
  }

  private async sendInvitationEmail(invitation: ShareInvitation): Promise<void> {
    // Email delivery is handled by the backend via sendInvitation; this is a no-op
    this.emit('invitation-email-queued', { invitationId: invitation.id });
  }
}
