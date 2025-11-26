/**
 * Core identifier types for Sim4D
 * Using branded types for type safety
 */

/**
 * Branded type helper
 */
type Brand<K, T> = K & { __brand: T };

/**
 * Node identifier
 */
export type NodeId = Brand<string, 'NodeId'>;

/**
 * Edge identifier
 */
export type EdgeId = Brand<string, 'EdgeId'>;

/**
 * Socket identifier
 */
export type SocketId = Brand<string, 'SocketId'>;

/**
 * Handle identifier for geometry references
 */
export type HandleId = Brand<string, 'HandleId'>;

/**
 * Graph identifier
 */
export type GraphId = Brand<string, 'GraphId'>;

/**
 * User identifier
 */
export type UserId = Brand<string, 'UserId'>;

/**
 * Session identifier
 */
export type SessionId = Brand<string, 'SessionId'>;

/**
 * Project identifier
 */
export type ProjectId = Brand<string, 'ProjectId'>;

/**
 * Helper functions for creating branded types
 */
export const NodeId = (id: string): NodeId => id as NodeId;
export const EdgeId = (id: string): EdgeId => id as EdgeId;
export const SocketId = (id: string): SocketId => id as SocketId;
export const HandleId = (id: string): HandleId => id as HandleId;
export const GraphId = (id: string): GraphId => id as GraphId;
export const UserId = (id: string): UserId => id as UserId;
export const SessionId = (id: string): SessionId => id as SessionId;
export const ProjectId = (id: string): ProjectId => id as ProjectId;
