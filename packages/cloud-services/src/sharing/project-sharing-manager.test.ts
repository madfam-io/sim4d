import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { SharingConfig } from './project-sharing-manager';
import { ProjectSharingManager } from './project-sharing-manager';
import type { ShareLink, ProjectMetadata, VersionVector } from '@sim4d/cloud-api/src/types';

const shareLink: ShareLink = {
  id: 'share-1',
  projectId: 'project-1',
  createdBy: 'owner',
  createdAt: new Date(),
  expiresAt: undefined,
  accessLevel: 'viewer',
  isPublic: false,
  allowAnonymous: false,
  maxUses: undefined,
  currentUses: 0,
  isActive: true,
};

const config: SharingConfig = {
  apiEndpoint: 'https://example.com',
  apiKey: 'test',
  maxSharesPerProject: 5,
  defaultLinkExpiration: 7,
  allowAnonymousAccess: false,
  requireEmailVerification: true,
  requestTimeout: 2000,
};

const projectMetadata: ProjectMetadata = {
  id: 'project-1',
  name: 'Project',
  ownerId: 'owner',
  visibility: 'private',
  collaborators: [],
  tags: [],
  cloudMetadata: {
    projectId: 'project-1',
    ownerId: 'owner',
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    deviceId: 'server',
  },
  description: '',
  lastModified: new Date(),
  size: 0,
  nodeCount: 0,
};

const makeApiMock = () => ({
  createShareLink: vi.fn(async () => ({ ...shareLink })),
  updateShareLink: vi.fn(async (_id: string, updates: Partial<ShareLink>) => ({
    ...shareLink,
    ...updates,
  })),
  getShareLink: vi.fn(async () => ({ ...shareLink })),
  getShareAnalytics: vi.fn(async () => ({
    totalAccesses: 5,
    uniqueUsers: 3,
    lastAccessed: new Date().toISOString(),
    accessHistory: [],
  })),
  logShareAccess: vi.fn(async () => {}),
  sendInvitation: vi.fn(async () => {}),
  getProject: vi.fn(async () => ({ ...projectMetadata })),
  getCollaborators: vi.fn(async () => []),
  addCollaborator: vi.fn(async () => {}),
  updateCollaborator: vi.fn(async () => {}),
  removeCollaborator: vi.fn(async () => {}),
  getUser: vi.fn(async (userId: string) => ({
    id: userId,
    email: `${userId}@example.com`,
    name: userId,
    isEmailVerified: true,
    preferences: {
      theme: 'dark',
      notifications: { email: true, push: false },
      privacy: { analytics: true, personalized: false },
    },
    subscription: { plan: 'pro', status: 'active', renewsAt: new Date(), cancelAt: null },
    teams: [],
    createdAt: new Date(),
    lastLoginAt: new Date(),
  })),
});

describe('ProjectSharingManager', () => {
  beforeEach(() => {
    process.env.SIM4D_ENABLE_PROJECT_SHARING = 'true';
  });

  it('creates share links via API client and caches the result', async () => {
    const api = makeApiMock();
    const manager = new ProjectSharingManager(config, api as any);

    const result = await manager.createShareLink('project-1', 'owner', { accessLevel: 'editor' });

    expect(api.createShareLink).toHaveBeenCalledWith(
      'project-1',
      expect.objectContaining({
        createdBy: 'owner',
        accessLevel: 'editor',
      })
    );
    expect(result.accessLevel).toBe('editor');
    expect((manager as any).shareCache.get(result.id)).toEqual(result);
  });

  it('sends invitations with requester context', async () => {
    const api = makeApiMock();
    const manager = new ProjectSharingManager(config, api as any);

    await manager.sendInvitations({
      requestedBy: 'owner',
      projectId: 'project-1',
      targetUsers: ['owner'],
      targetEmails: ['invitee@example.com'],
      role: 'viewer',
      message: 'Join us!',
    });

    expect(api.getProject).toHaveBeenCalledWith('project-1');
    expect(api.sendInvitation).toHaveBeenCalledWith(
      'project-1',
      expect.objectContaining({
        userIds: ['owner'],
        emails: ['invitee@example.com'],
        role: 'viewer',
      })
    );
  });

  it('tracks access via share link and grants collaborator access for authenticated users', async () => {
    const api = makeApiMock();
    const manager = new ProjectSharingManager(config, api as any);

    api.getShareLink.mockResolvedValue({ ...shareLink, allowAnonymous: false });

    const result = await manager.accessViaShareLink('share-1', {
      userId: 'guest',
      ipAddress: '127.0.0.1',
      userAgent: 'vitest',
    });

    expect(api.logShareAccess).toHaveBeenCalledWith(
      'share-1',
      expect.objectContaining({ userId: 'guest' })
    );
    expect(api.updateShareLink).toHaveBeenCalled();
    expect(api.addCollaborator).toHaveBeenCalledWith(
      'project-1',
      expect.objectContaining({ userId: 'guest' })
    );
    expect(result.temporaryAccess).toBe(false);
  });

  it('returns share analytics from the API client', async () => {
    const api = makeApiMock();
    const manager = new ProjectSharingManager(config, api as any);

    api.getShareLink.mockResolvedValue({ ...shareLink });

    const analytics = await manager.getShareAnalytics('share-1', 'owner');

    expect(api.getShareAnalytics).toHaveBeenCalledWith('share-1');
    expect(analytics.totalAccesses).toBe(5);
    expect(analytics.uniqueUsers).toBe(3);
  });
});
