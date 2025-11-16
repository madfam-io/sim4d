/**
 * Permission Service
 * Role-based access control and permission management for BrepFlow cloud services
 */

import EventEmitter from 'events';
import {
  ProjectId,
  UserId,
  TeamId,
  ProjectRole,
  TeamRole,
  ProjectPermission,
  TeamPermission,
  CollaboratorAccess,
  TeamMember,
} from '@brepflow/cloud-api/src/types';

export interface PermissionConfig {
  defaultRoles: {
    project: ProjectRole;
    team: TeamRole;
  };
  roleHierarchy: {
    project: Record<ProjectRole, number>;
    team: Record<TeamRole, number>;
  };
  caching: {
    enabled: boolean;
    ttl: number; // ms
  };
  audit: {
    enabled: boolean;
    logPermissionChecks: boolean;
    logRoleChanges: boolean;
  };
}

export interface PermissionContext {
  userId: UserId;
  projectId?: ProjectId;
  teamId?: TeamId;
  resourceType: 'project' | 'team' | 'plugin' | 'user';
  action: string;
  resource?: string;
}

export interface PermissionResult {
  granted: boolean;
  reason?: string;
  requiredRole?: string;
  currentRole?: string;
  conflictingRule?: string;
}

export interface RoleAssignment {
  userId: UserId;
  role: ProjectRole | TeamRole;
  assignedBy: UserId;
  assignedAt: Date;
  expiresAt?: Date;
  conditions?: Record<string, any>;
}

export interface PermissionAuditLog {
  id: string;
  userId: UserId;
  action: string;
  resource: string;
  granted: boolean;
  reason: string;
  timestamp: Date;
  context: Record<string, any>;
}

export class PermissionService extends EventEmitter {
  private config: PermissionConfig;
  private permissionCache = new Map<string, { result: PermissionResult; expires: number }>();
  private roleCache = new Map<string, { roles: string[]; expires: number }>();
  private auditLog: PermissionAuditLog[] = [];

  constructor(config: PermissionConfig) {
    super();
    this.config = config;
  }

  /**
   * Permission Checking
   */
  async checkPermission(context: PermissionContext): Promise<PermissionResult> {
    const cacheKey = this.generatePermissionCacheKey(context);

    // Check cache
    if (this.config.caching.enabled) {
      const cached = this.permissionCache.get(cacheKey);
      if (cached && cached.expires > Date.now()) {
        if (this.config.audit.logPermissionChecks) {
          this.logPermissionCheck(context, cached.result);
        }
        return cached.result;
      }
    }

    // Perform permission check
    const result = await this.performPermissionCheck(context);

    // Cache result
    if (this.config.caching.enabled) {
      this.permissionCache.set(cacheKey, {
        result,
        expires: Date.now() + this.config.caching.ttl,
      });
    }

    // Log audit
    if (this.config.audit.logPermissionChecks) {
      this.logPermissionCheck(context, result);
    }

    return result;
  }

  async checkMultiplePermissions(contexts: PermissionContext[]): Promise<PermissionResult[]> {
    const results = await Promise.all(contexts.map((context) => this.checkPermission(context)));

    return results;
  }

  async hasAnyPermission(
    userId: UserId,
    permissions: Array<{ action: string; resource: string; resourceType: string }>
  ): Promise<boolean> {
    for (const permission of permissions) {
      const context: PermissionContext = {
        userId,
        action: permission.action,
        resource: permission.resource,
        resourceType: permission.resourceType as any,
      };

      const result = await this.checkPermission(context);
      if (result.granted) {
        return true;
      }
    }

    return false;
  }

  /**
   * Project Permissions
   */
  async checkProjectPermission(
    userId: UserId,
    projectId: ProjectId,
    action: 'read' | 'write' | 'delete' | 'share' | 'export' | 'admin',
    resource: 'project' | 'nodes' | 'parameters' | 'geometry' | 'comments' = 'project'
  ): Promise<PermissionResult> {
    return this.checkPermission({
      userId,
      projectId,
      resourceType: 'project',
      action,
      resource,
    });
  }

  async getUserProjectRole(userId: UserId, projectId: ProjectId): Promise<ProjectRole | null> {
    const project = await this.getProjectMetadata(projectId);
    if (!project) return null;

    // Check if user is owner
    if (project.ownerId === userId) {
      return 'owner';
    }

    // Check collaborators
    const collaborator = project.collaborators.find((c) => c.userId === userId);
    return collaborator?.role || null;
  }

  async getProjectCollaborators(projectId: ProjectId): Promise<CollaboratorAccess[]> {
    const project = await this.getProjectMetadata(projectId);
    return project?.collaborators || [];
  }

  async addProjectCollaborator(
    projectId: ProjectId,
    userId: UserId,
    role: ProjectRole,
    addedBy: UserId,
    permissions?: ProjectPermission[]
  ): Promise<void> {
    // Check if requester has permission to add collaborators
    const requesterPermission = await this.checkProjectPermission(addedBy, projectId, 'admin');
    if (!requesterPermission.granted) {
      throw new Error('Insufficient permissions to add collaborators');
    }

    const collaborator: CollaboratorAccess = {
      userId,
      role,
      addedAt: new Date(),
      addedBy,
      permissions: permissions || this.getDefaultPermissionsForRole(role),
    };

    await this.saveProjectCollaborator(projectId, collaborator);

    // Clear cache
    this.invalidateUserProjectCache(userId, projectId);

    this.emit('collaborator-added', { projectId, userId, role, addedBy });

    if (this.config.audit.logRoleChanges) {
      this.logRoleChange({
        type: 'project',
        userId,
        projectId,
        newRole: role,
        changedBy: addedBy,
        timestamp: new Date(),
      });
    }
  }

  async removeProjectCollaborator(
    projectId: ProjectId,
    userId: UserId,
    removedBy: UserId
  ): Promise<void> {
    // Check permissions
    const requesterPermission = await this.checkProjectPermission(removedBy, projectId, 'admin');
    if (!requesterPermission.granted) {
      throw new Error('Insufficient permissions to remove collaborators');
    }

    // Don't allow removing owner
    const project = await this.getProjectMetadata(projectId);
    if (project?.ownerId === userId) {
      throw new Error('Cannot remove project owner');
    }

    await this.deleteProjectCollaborator(projectId, userId);

    // Clear cache
    this.invalidateUserProjectCache(userId, projectId);

    this.emit('collaborator-removed', { projectId, userId, removedBy });

    if (this.config.audit.logRoleChanges) {
      this.logRoleChange({
        type: 'project',
        userId,
        projectId,
        newRole: null,
        changedBy: removedBy,
        timestamp: new Date(),
      });
    }
  }

  async updateProjectCollaboratorRole(
    projectId: ProjectId,
    userId: UserId,
    newRole: ProjectRole,
    updatedBy: UserId
  ): Promise<void> {
    // Check permissions
    const requesterPermission = await this.checkProjectPermission(updatedBy, projectId, 'admin');
    if (!requesterPermission.granted) {
      throw new Error('Insufficient permissions to update collaborator roles');
    }

    // Get current role
    const currentRole = await this.getUserProjectRole(userId, projectId);
    if (!currentRole) {
      throw new Error('User is not a collaborator on this project');
    }

    // Don't allow changing owner role
    const project = await this.getProjectMetadata(projectId);
    if (project?.ownerId === userId) {
      throw new Error('Cannot change owner role');
    }

    await this.updateProjectCollaboratorRoleInDb(projectId, userId, newRole);

    // Clear cache
    this.invalidateUserProjectCache(userId, projectId);

    this.emit('collaborator-role-updated', {
      projectId,
      userId,
      oldRole: currentRole,
      newRole,
      updatedBy,
    });

    if (this.config.audit.logRoleChanges) {
      this.logRoleChange({
        type: 'project',
        userId,
        projectId,
        oldRole: currentRole,
        newRole,
        changedBy: updatedBy,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Team Permissions
   */
  async checkTeamPermission(
    userId: UserId,
    teamId: TeamId,
    action: 'read' | 'write' | 'delete' | 'invite' | 'manage' | 'admin',
    resource: 'team' | 'projects' | 'members' | 'billing' | 'settings' = 'team'
  ): Promise<PermissionResult> {
    return this.checkPermission({
      userId,
      teamId,
      resourceType: 'team',
      action,
      resource,
    });
  }

  async getUserTeamRole(userId: UserId, teamId: TeamId): Promise<TeamRole | null> {
    const team = await this.getTeamMetadata(teamId);
    if (!team) return null;

    // Check if user is owner
    if (team.ownerId === userId) {
      return 'owner';
    }

    // Check members
    const member = team.members.find((m) => m.userId === userId);
    return member?.role || null;
  }

  async getTeamMembers(teamId: TeamId): Promise<TeamMember[]> {
    const team = await this.getTeamMetadata(teamId);
    return team?.members || [];
  }

  async addTeamMember(
    teamId: TeamId,
    userId: UserId,
    role: TeamRole,
    invitedBy: UserId,
    permissions?: TeamPermission[]
  ): Promise<void> {
    // Check permissions
    const requesterPermission = await this.checkTeamPermission(invitedBy, teamId, 'invite');
    if (!requesterPermission.granted) {
      throw new Error('Insufficient permissions to invite team members');
    }

    const member: TeamMember = {
      userId,
      role,
      joinedAt: new Date(),
      invitedBy,
      permissions: permissions || this.getDefaultTeamPermissionsForRole(role),
      isActive: true,
    };

    await this.saveTeamMember(teamId, member);

    // Clear cache
    this.invalidateUserTeamCache(userId, teamId);

    this.emit('team-member-added', { teamId, userId, role, invitedBy });

    if (this.config.audit.logRoleChanges) {
      this.logRoleChange({
        type: 'team',
        userId,
        teamId,
        newRole: role,
        changedBy: invitedBy,
        timestamp: new Date(),
      });
    }
  }

  async removeTeamMember(teamId: TeamId, userId: UserId, removedBy: UserId): Promise<void> {
    // Check permissions
    const requesterPermission = await this.checkTeamPermission(removedBy, teamId, 'manage');
    if (!requesterPermission.granted) {
      throw new Error('Insufficient permissions to remove team members');
    }

    // Don't allow removing owner
    const team = await this.getTeamMetadata(teamId);
    if (team?.ownerId === userId) {
      throw new Error('Cannot remove team owner');
    }

    await this.deleteTeamMember(teamId, userId);

    // Clear cache
    this.invalidateUserTeamCache(userId, teamId);

    this.emit('team-member-removed', { teamId, userId, removedBy });

    if (this.config.audit.logRoleChanges) {
      this.logRoleChange({
        type: 'team',
        userId,
        teamId,
        newRole: null,
        changedBy: removedBy,
        timestamp: new Date(),
      });
    }
  }

  /**
   * Permission Evaluation Engine
   */
  private async performPermissionCheck(context: PermissionContext): Promise<PermissionResult> {
    try {
      switch (context.resourceType) {
        case 'project':
          return await this.checkProjectResourcePermission(context);
        case 'team':
          return await this.checkTeamResourcePermission(context);
        case 'plugin':
          return await this.checkPluginPermission(context);
        case 'user':
          return await this.checkUserPermission(context);
        default:
          return {
            granted: false,
            reason: `Unknown resource type: ${context.resourceType}`,
          };
      }
    } catch (error) {
      return {
        granted: false,
        reason: `Permission check failed: ${error.message}`,
      };
    }
  }

  private async checkProjectResourcePermission(
    context: PermissionContext
  ): Promise<PermissionResult> {
    if (!context.projectId) {
      return { granted: false, reason: 'Project ID required for project permissions' };
    }

    const userRole = await this.getUserProjectRole(context.userId, context.projectId);
    if (!userRole) {
      return {
        granted: false,
        reason: 'User is not a collaborator on this project',
        currentRole: 'none',
      };
    }

    // Check role hierarchy
    const requiredLevel = this.getRequiredRoleLevel(context.action, context.resource || 'project');
    const userLevel = this.config.roleHierarchy.project[userRole] || 0;

    if (userLevel >= requiredLevel) {
      return {
        granted: true,
        currentRole: userRole,
      };
    }

    return {
      granted: false,
      reason: `Insufficient role level. Required: ${requiredLevel}, Current: ${userLevel}`,
      currentRole: userRole,
      requiredRole: this.getRoleNameForLevel('project', requiredLevel),
    };
  }

  private async checkTeamResourcePermission(context: PermissionContext): Promise<PermissionResult> {
    if (!context.teamId) {
      return { granted: false, reason: 'Team ID required for team permissions' };
    }

    const userRole = await this.getUserTeamRole(context.userId, context.teamId);
    if (!userRole) {
      return {
        granted: false,
        reason: 'User is not a member of this team',
        currentRole: 'none',
      };
    }

    // Check role hierarchy
    const requiredLevel = this.getRequiredTeamRoleLevel(context.action, context.resource || 'team');
    const userLevel = this.config.roleHierarchy.team[userRole] || 0;

    if (userLevel >= requiredLevel) {
      return {
        granted: true,
        currentRole: userRole,
      };
    }

    return {
      granted: false,
      reason: `Insufficient team role level. Required: ${requiredLevel}, Current: ${userLevel}`,
      currentRole: userRole,
      requiredRole: this.getRoleNameForLevel('team', requiredLevel),
    };
  }

  private async checkPluginPermission(context: PermissionContext): Promise<PermissionResult> {
    // Plugin permissions are generally user-based
    // Users can install/uninstall their own plugins
    // Admin roles can manage all plugins
    return { granted: true }; // Simplified for now
  }

  private async checkUserPermission(context: PermissionContext): Promise<PermissionResult> {
    // User permissions (profile access, settings, etc.)
    // Users can access their own data
    // Admins can access all user data
    return { granted: true }; // Simplified for now
  }

  /**
   * Role and Permission Utilities
   */
  private getRequiredRoleLevel(action: string, resource: string): number {
    const permissionMatrix: Record<string, Record<string, number>> = {
      read: { project: 1, nodes: 1, parameters: 1, geometry: 1, comments: 1 },
      write: { project: 2, nodes: 2, parameters: 2, geometry: 2, comments: 1 },
      delete: { project: 4, nodes: 3, parameters: 3, geometry: 3, comments: 2 },
      share: { project: 3, nodes: 4, parameters: 4, geometry: 4, comments: 4 },
      export: { project: 2, nodes: 2, parameters: 2, geometry: 2, comments: 4 },
      admin: { project: 4, nodes: 4, parameters: 4, geometry: 4, comments: 4 },
    };

    return permissionMatrix[action]?.[resource] || 0;
  }

  private getRequiredTeamRoleLevel(action: string, resource: string): number {
    const permissionMatrix: Record<string, Record<string, number>> = {
      read: { team: 1, projects: 1, members: 1, billing: 3, settings: 2 },
      write: { team: 2, projects: 2, members: 3, billing: 4, settings: 3 },
      delete: { team: 4, projects: 3, members: 3, billing: 4, settings: 4 },
      invite: { team: 2, projects: 2, members: 2, billing: 4, settings: 4 },
      manage: { team: 3, projects: 3, members: 3, billing: 4, settings: 3 },
      admin: { team: 4, projects: 4, members: 4, billing: 4, settings: 4 },
    };

    return permissionMatrix[action]?.[resource] || 0;
  }

  private getRoleNameForLevel(type: 'project' | 'team', level: number): string {
    const hierarchy = this.config.roleHierarchy[type];
    for (const [role, roleLevel] of Object.entries(hierarchy)) {
      if (roleLevel >= level) {
        return role;
      }
    }
    return 'admin';
  }

  private getDefaultPermissionsForRole(role: ProjectRole): ProjectPermission[] {
    const basePermissions: Record<ProjectRole, ProjectPermission[]> = {
      owner: [
        { action: 'read', resource: 'project', granted: true },
        { action: 'write', resource: 'project', granted: true },
        { action: 'delete', resource: 'project', granted: true },
        { action: 'share', resource: 'project', granted: true },
        { action: 'export', resource: 'project', granted: true },
        { action: 'admin', resource: 'project', granted: true },
      ],
      editor: [
        { action: 'read', resource: 'project', granted: true },
        { action: 'write', resource: 'project', granted: true },
        { action: 'export', resource: 'project', granted: true },
      ],
      viewer: [
        { action: 'read', resource: 'project', granted: true },
        { action: 'export', resource: 'project', granted: true },
      ],
      commenter: [
        { action: 'read', resource: 'project', granted: true },
        { action: 'write', resource: 'comments', granted: true },
      ],
    };

    return basePermissions[role] || [];
  }

  private getDefaultTeamPermissionsForRole(role: TeamRole): TeamPermission[] {
    const basePermissions: Record<TeamRole, TeamPermission[]> = {
      owner: [
        { action: 'admin', resource: 'team', granted: true },
        { action: 'admin', resource: 'projects', granted: true },
        { action: 'admin', resource: 'members', granted: true },
        { action: 'admin', resource: 'billing', granted: true },
        { action: 'admin', resource: 'settings', granted: true },
      ],
      admin: [
        { action: 'manage', resource: 'team', granted: true },
        { action: 'manage', resource: 'projects', granted: true },
        { action: 'manage', resource: 'members', granted: true },
        { action: 'read', resource: 'billing', granted: true },
        { action: 'manage', resource: 'settings', granted: true },
      ],
      member: [
        { action: 'read', resource: 'team', granted: true },
        { action: 'read', resource: 'projects', granted: true },
        { action: 'read', resource: 'members', granted: true },
      ],
      guest: [
        { action: 'read', resource: 'team', granted: true },
        { action: 'read', resource: 'projects', granted: true },
      ],
    };

    return basePermissions[role] || [];
  }

  /**
   * Cache Management
   */
  private generatePermissionCacheKey(context: PermissionContext): string {
    return `perm:${context.userId}:${context.resourceType}:${context.projectId || ''}:${context.teamId || ''}:${context.action}:${context.resource || ''}`;
  }

  private invalidateUserProjectCache(userId: UserId, projectId: ProjectId): void {
    const pattern = `perm:${userId}:project:${projectId}:`;
    for (const [key] of this.permissionCache) {
      if (key.startsWith(pattern)) {
        this.permissionCache.delete(key);
      }
    }
  }

  private invalidateUserTeamCache(userId: UserId, teamId: TeamId): void {
    const pattern = `perm:${userId}:team::${teamId}:`;
    for (const [key] of this.permissionCache) {
      if (key.startsWith(pattern)) {
        this.permissionCache.delete(key);
      }
    }
  }

  /**
   * Audit Logging
   */
  private logPermissionCheck(context: PermissionContext, result: PermissionResult): void {
    const logEntry: PermissionAuditLog = {
      id: this.generateAuditId(),
      userId: context.userId,
      action: context.action,
      resource: `${context.resourceType}:${context.projectId || context.teamId || 'global'}:${context.resource || ''}`,
      granted: result.granted,
      reason: result.reason || 'Permission granted',
      timestamp: new Date(),
      context: {
        projectId: context.projectId,
        teamId: context.teamId,
        currentRole: result.currentRole,
        requiredRole: result.requiredRole,
      },
    };

    this.auditLog.push(logEntry);
    this.emit('permission-checked', logEntry);

    // Keep audit log size manageable
    if (this.auditLog.length > 10000) {
      this.auditLog = this.auditLog.slice(-5000);
    }
  }

  private logRoleChange(change: {
    type: 'project' | 'team';
    userId: UserId;
    projectId?: ProjectId;
    teamId?: TeamId;
    oldRole?: string;
    newRole?: string | null;
    changedBy: UserId;
    timestamp: Date;
  }): void {
    this.emit('role-changed', change);
  }

  private generateAuditId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Data Access (to be implemented with actual database)
   */
  private async getProjectMetadata(projectId: ProjectId): Promise<any> {
    // Implementation depends on database service
    throw new Error('Project metadata access implementation required');
  }

  private async getTeamMetadata(teamId: TeamId): Promise<any> {
    // Implementation depends on database service
    throw new Error('Team metadata access implementation required');
  }

  private async saveProjectCollaborator(
    projectId: ProjectId,
    collaborator: CollaboratorAccess
  ): Promise<void> {
    // Implementation depends on database service
    throw new Error('Project collaborator save implementation required');
  }

  private async deleteProjectCollaborator(projectId: ProjectId, userId: UserId): Promise<void> {
    // Implementation depends on database service
    throw new Error('Project collaborator delete implementation required');
  }

  private async updateProjectCollaboratorRoleInDb(
    projectId: ProjectId,
    userId: UserId,
    role: ProjectRole
  ): Promise<void> {
    // Implementation depends on database service
    throw new Error('Project collaborator role update implementation required');
  }

  private async saveTeamMember(teamId: TeamId, member: TeamMember): Promise<void> {
    // Implementation depends on database service
    throw new Error('Team member save implementation required');
  }

  private async deleteTeamMember(teamId: TeamId, userId: UserId): Promise<void> {
    // Implementation depends on database service
    throw new Error('Team member delete implementation required');
  }
}
