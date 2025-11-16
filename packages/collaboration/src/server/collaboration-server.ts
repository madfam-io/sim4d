import { Server, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  User,
  Document,
  Operation,
  Presence,
} from '../types';
import { SessionManager } from './session-manager';
import { DocumentStore } from './document-store';
import { PresenceManager } from './presence-manager';
import { OperationalTransform } from '../ot/operational-transform';
import crypto from 'crypto'; // For CSRF token generation

export interface CollaborationServerOptions {
  // SECURITY: No more wildcard CORS - must specify allowed origins
  corsOrigin: string | string[]; // REQUIRED, no default
  maxConnectionsPerDocument?: number;
  operationHistoryLimit?: number;
  presenceTimeout?: number;

  // SECURITY: New options for CSRF protection
  csrfTokenSecret?: string; // Secret for HMAC-based CSRF tokens
  enableRateLimiting?: boolean; // Enable per-IP rate limiting
  maxConnectionsPerIP?: number; // Max connections per IP (default: 10)
}

// SECURITY: Rate limiting tracker
interface RateLimitTracker {
  connections: number;
  lastReset: number;
  blacklisted: boolean;
}

export class CollaborationServer {
  private io: Server<ClientToServerEvents, ServerToClientEvents>;
  private sessionManager: SessionManager;
  private documentStore: DocumentStore;
  private presenceManager: PresenceManager;
  private ot: OperationalTransform;

  // SECURITY: CSRF and rate limiting
  private csrfTokenSecret: string;
  private connectionLimits: Map<string, RateLimitTracker> = new Map();
  private enableRateLimiting: boolean;
  private maxConnectionsPerIP: number;
  private allowedOrigins: Set<string>;

  constructor(httpServer: HTTPServer, options: CollaborationServerOptions) {
    // SECURITY: Validate required options
    if (!options.corsOrigin) {
      throw new Error('CRITICAL SECURITY: corsOrigin is required. Wildcard CORS is not allowed.');
    }

    // Normalize origins to Set for fast lookup
    this.allowedOrigins = new Set(
      Array.isArray(options.corsOrigin) ? options.corsOrigin : [options.corsOrigin]
    );

    // Validate no wildcard origins
    if (this.allowedOrigins.has('*')) {
      throw new Error(
        'CRITICAL SECURITY: Wildcard CORS (*) is not allowed. Specify explicit origins.'
      );
    }

    this.csrfTokenSecret = options.csrfTokenSecret || this.generateSecret();
    this.enableRateLimiting = options.enableRateLimiting !== false; // Default: enabled
    this.maxConnectionsPerIP = options.maxConnectionsPerIP || 10;

    this.io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
      cors: {
        origin: (origin, callback) => {
          // SECURITY: Custom origin validator
          this.validateOrigin(origin, callback);
        },
        methods: ['GET', 'POST'],
        credentials: true, // Required for CSRF tokens in cookies
      },
      // SECURITY: Additional Socket.IO options
      allowEIO3: false, // Disable old Engine.IO protocol
      pingTimeout: 60000,
      pingInterval: 25000,
      upgradeTimeout: 10000,
      maxHttpBufferSize: 1e6, // 1MB max message size
    });

    this.sessionManager = new SessionManager();
    this.documentStore = new DocumentStore({
      operationHistoryLimit: options.operationHistoryLimit,
    });
    this.presenceManager = new PresenceManager({
      timeout: options.presenceTimeout,
    });
    this.ot = new OperationalTransform();

    this.setupMiddleware();
    this.setupHandlers();
    this.startRateLimitCleanup();
  }

  /**
   * SECURITY: Generate cryptographically secure secret
   */
  private generateSecret(): string {
    return crypto.randomBytes(32).toString('base64');
  }

  /**
   * SECURITY: Custom origin validator
   */
  private validateOrigin(
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ): void {
    // Allow requests with no origin (like Postman, curl for development)
    // In production, you might want to block these
    if (!origin) {
      if (process.env.NODE_ENV === 'production') {
        console.warn('SECURITY: Connection attempt with no Origin header blocked');
        return callback(new Error('No origin header'), false);
      }
      return callback(null, true);
    }

    // Validate against whitelist
    if (this.allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    // Log blocked attempt
    console.warn(`SECURITY: Blocked CORS attempt from unauthorized origin: ${origin}`);
    callback(new Error('Origin not allowed'), false);
  }

  /**
   * SECURITY: Setup authentication and CSRF middleware
   */
  private setupMiddleware(): void {
    this.io.use(async (socket, next) => {
      try {
        // 1. Rate limiting check
        if (this.enableRateLimiting) {
          const clientIP = this.getClientIP(socket);
          if (!this.checkRateLimit(clientIP)) {
            console.warn(`SECURITY: Rate limit exceeded for IP: ${clientIP}`);
            return next(new Error('Rate limit exceeded'));
          }
        }

        // 2. CSRF token validation
        const csrfToken = socket.handshake.auth.csrfToken as string | undefined;
        if (!csrfToken || !this.validateCSRFToken(csrfToken)) {
          console.warn(`SECURITY: Invalid or missing CSRF token from ${socket.handshake.address}`);
          return next(new Error('Invalid CSRF token'));
        }

        // 3. Origin header validation (additional check beyond CORS)
        const origin = socket.handshake.headers.origin;
        if (origin && !this.allowedOrigins.has(origin)) {
          console.warn(`SECURITY: Invalid origin in handshake: ${origin}`);
          return next(new Error('Invalid origin'));
        }

        // 4. Optional: User authentication (if using session cookies or JWT)
        // const userId = socket.handshake.auth.userId;
        // if (!userId || !await this.validateUser(userId)) {
        //   return next(new Error('Authentication required'));
        // }

        // All checks passed
        next();
      } catch (error) {
        console.error('SECURITY: Middleware error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * SECURITY: Get client IP address (respects X-Forwarded-For behind proxy)
   */
  private getClientIP(socket: Socket): string {
    const forwardedFor = socket.handshake.headers['x-forwarded-for'];
    if (typeof forwardedFor === 'string') {
      return forwardedFor.split(',')[0].trim();
    }
    return socket.handshake.address;
  }

  /**
   * SECURITY: Check and update rate limit for IP
   */
  private checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const tracker = this.connectionLimits.get(ip);

    // Check if IP is blacklisted
    if (tracker?.blacklisted) {
      return false;
    }

    // Reset counter every hour
    const RESET_INTERVAL = 60 * 60 * 1000; // 1 hour

    if (!tracker || now - tracker.lastReset > RESET_INTERVAL) {
      this.connectionLimits.set(ip, {
        connections: 1,
        lastReset: now,
        blacklisted: false,
      });
      return true;
    }

    // Check if limit exceeded
    if (tracker.connections >= this.maxConnectionsPerIP) {
      // Blacklist after 3x limit violations
      const violations = tracker.connections - this.maxConnectionsPerIP;
      if (violations >= this.maxConnectionsPerIP * 3) {
        tracker.blacklisted = true;
        console.warn(`SECURITY: IP blacklisted for excessive connections: ${ip}`);
      }
      return false;
    }

    tracker.connections++;
    return true;
  }

  /**
   * SECURITY: Generate CSRF token
   * Can be called from API endpoint: GET /api/collaboration/csrf-token
   */
  public generateCSRFToken(sessionId: string): string {
    const timestamp = Date.now().toString();
    const data = `${sessionId}:${timestamp}`;
    const hmac = crypto.createHmac('sha256', this.csrfTokenSecret);
    hmac.update(data);
    const signature = hmac.digest('base64');

    // Token format: sessionId:timestamp:signature
    return `${sessionId}:${timestamp}:${signature}`;
  }

  /**
   * SECURITY: Validate CSRF token
   */
  private validateCSRFToken(token: string): boolean {
    try {
      const parts = token.split(':');
      if (parts.length !== 3) {
        return false;
      }

      const [sessionId, timestamp, signature] = parts;

      // Check token age (max 1 hour)
      const tokenAge = Date.now() - parseInt(timestamp, 10);
      const MAX_TOKEN_AGE = 60 * 60 * 1000; // 1 hour
      if (tokenAge > MAX_TOKEN_AGE || tokenAge < 0) {
        console.warn('SECURITY: CSRF token expired or invalid timestamp');
        return false;
      }

      // Verify signature
      const data = `${sessionId}:${timestamp}`;
      const hmac = crypto.createHmac('sha256', this.csrfTokenSecret);
      hmac.update(data);
      const expectedSignature = hmac.digest('base64');

      // Timing-safe comparison
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'base64'),
        Buffer.from(expectedSignature, 'base64')
      );
    } catch (error) {
      console.error('SECURITY: CSRF token validation error:', error);
      return false;
    }
  }

  /**
   * SECURITY: Cleanup rate limit trackers periodically
   */
  private startRateLimitCleanup(): void {
    if (!this.enableRateLimiting) return;

    setInterval(
      () => {
        const now = Date.now();
        const CLEANUP_AGE = 2 * 60 * 60 * 1000; // 2 hours

        for (const [ip, tracker] of this.connectionLimits.entries()) {
          if (now - tracker.lastReset > CLEANUP_AGE && !tracker.blacklisted) {
            this.connectionLimits.delete(ip);
          }
        }
      },
      60 * 60 * 1000
    ); // Run every hour
  }

  private setupHandlers(): void {
    this.io.on('connection', (socket) => {
      const clientIP = this.getClientIP(socket);
      console.log(`Client connected: ${socket.id} from ${clientIP}`);

      // SECURITY: Decrement rate limit on disconnect
      socket.on('disconnect', async () => {
        if (this.enableRateLimiting) {
          const tracker = this.connectionLimits.get(clientIP);
          if (tracker) {
            tracker.connections = Math.max(0, tracker.connections - 1);
          }
        }
        await this.handleDisconnect(socket);
      });

      // SECURITY: Validate and sanitize all incoming data
      socket.on('document:join', async (documentId: string, user: User) => {
        // Validate documentId format
        if (!this.isValidDocumentId(documentId)) {
          socket.emit('error', new Error('Invalid document ID'));
          return;
        }
        // Validate user object
        if (!this.isValidUser(user)) {
          socket.emit('error', new Error('Invalid user data'));
          return;
        }
        await this.handleJoinDocument(socket, documentId, user);
      });

      socket.on('document:leave', async () => {
        await this.handleLeaveDocument(socket);
      });

      socket.on('operation:submit', async (operation: Operation) => {
        // SECURITY: Validate operation before processing
        if (!this.isValidOperation(operation)) {
          socket.emit('error', new Error('Invalid operation'));
          return;
        }
        await this.handleOperation(socket, operation);
      });

      socket.on('presence:cursor', async (cursor) => {
        await this.handlePresenceUpdate(socket, 'cursor', cursor);
      });

      socket.on('presence:selection', async (selection) => {
        await this.handlePresenceUpdate(socket, 'selection', selection);
      });

      socket.on('presence:viewport', async (viewport) => {
        await this.handlePresenceUpdate(socket, 'viewport', viewport);
      });

      socket.on('presence:editing', async (nodeId) => {
        await this.handlePresenceUpdate(socket, 'isEditing', nodeId);
      });

      socket.on('document:request-sync', async () => {
        await this.handleSyncRequest(socket);
      });
    });
  }

  /**
   * SECURITY: Validate document ID format
   */
  private isValidDocumentId(documentId: unknown): documentId is string {
    return (
      typeof documentId === 'string' &&
      documentId.length > 0 &&
      documentId.length < 256 &&
      /^[a-zA-Z0-9_-]+$/.test(documentId) // Only alphanumeric, underscore, dash
    );
  }

  /**
   * SECURITY: Validate user object
   */
  private isValidUser(user: unknown): user is User {
    if (typeof user !== 'object' || user === null) return false;
    const u = user as any;
    return (
      typeof u.id === 'string' &&
      u.id.length > 0 &&
      u.id.length < 256 &&
      typeof u.name === 'string' &&
      u.name.length > 0 &&
      u.name.length < 100
    );
  }

  /**
   * SECURITY: Validate operation object
   */
  private isValidOperation(operation: unknown): operation is Operation {
    if (typeof operation !== 'object' || operation === null) return false;
    const op = operation as any;

    // Basic validation - extend based on Operation type definition
    return (
      typeof op.type === 'string' &&
      op.type.length > 0 &&
      op.type.length < 50 &&
      typeof op.timestamp === 'number' &&
      op.timestamp > 0
    );
  }

  private async handleJoinDocument(socket: Socket, documentId: string, user: User): Promise<void> {
    // Create session
    const session = this.sessionManager.createSession({
      userId: user.id,
      documentId,
      connectionId: socket.id,
    });

    // Join socket room for document
    await socket.join(documentId);

    // Get or create document
    let document = await this.documentStore.getDocument(documentId);
    if (!document) {
      document = await this.documentStore.createDocument(documentId);
    }

    // Add user to presence
    const presence: Presence = {
      user,
      cursor: undefined,
      selection: undefined,
      viewport: undefined,
      isEditing: null,
    };
    this.presenceManager.addPresence(documentId, user.id, presence);

    // Send initial document state to joining user
    socket.emit('document:sync', document);

    // Notify other users of new presence
    socket.to(documentId).emit('presence:join', presence);

    // Send current presence list to joining user
    const presenceList = this.presenceManager.getPresence(documentId);
    socket.emit('presence:update', presenceList);

    console.log(`User ${user.name} joined document ${documentId}`);
  }

  private async handleLeaveDocument(socket: Socket): Promise<void> {
    const session = this.sessionManager.getSessionByConnectionId(socket.id);
    if (!session) return;

    const { userId, documentId } = session;

    // Remove session
    this.sessionManager.removeSession(session.id);

    // Remove presence
    this.presenceManager.removePresence(documentId, userId);

    // Leave socket room
    await socket.leave(documentId);

    // Notify other users
    socket.to(documentId).emit('presence:leave', userId);

    console.log(`User ${userId} left document ${documentId}`);
  }

  private async handleOperation(socket: Socket, operation: Operation): Promise<void> {
    const session = this.sessionManager.getSessionByConnectionId(socket.id);
    if (!session) return;

    const { documentId } = session;
    const document = await this.documentStore.getDocument(documentId);
    if (!document) return;

    // Apply operational transformation
    const transformedOperation = this.ot.transform(operation, document.operations);

    // Apply operation to document
    const updatedDocument = await this.documentStore.applyOperation(
      documentId,
      transformedOperation
    );

    // Broadcast to all users in document (including sender)
    this.io.to(documentId).emit('operation:broadcast', transformedOperation);

    // Check for conflicts
    const conflicts = this.ot.detectConflicts(transformedOperation, document.operations);
    if (conflicts.length > 0) {
      conflicts.forEach((conflict) => {
        socket.emit('conflict:detected', conflict);
      });
    }
  }

  private async handlePresenceUpdate(
    socket: Socket,
    type: keyof Presence,
    data: any
  ): Promise<void> {
    const session = this.sessionManager.getSessionByConnectionId(socket.id);
    if (!session) return;

    const { userId, documentId } = session;
    const presence = this.presenceManager.updatePresence(documentId, userId, type, data);

    if (presence) {
      // Broadcast presence update to other users
      socket.to(documentId).emit('presence:update', [presence]);
    }
  }

  private async handleSyncRequest(socket: Socket): Promise<void> {
    const session = this.sessionManager.getSessionByConnectionId(socket.id);
    if (!session) return;

    const document = await this.documentStore.getDocument(session.documentId);
    if (document) {
      socket.emit('document:sync', document);
    }
  }

  private async handleDisconnect(socket: Socket): Promise<void> {
    const session = this.sessionManager.getSessionByConnectionId(socket.id);
    if (!session) return;

    await this.handleLeaveDocument(socket);
    console.log(`Client disconnected: ${socket.id}`);
  }

  public async close(): Promise<void> {
    await this.io.close();
  }
}
