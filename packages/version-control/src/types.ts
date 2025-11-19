/**
 * BrepFlow Git-like Version Control Types
 * Semantic versioning for parametric CAD models
 */

import type { Graph, Node, Edge, Vec3 } from '@brepflow/types';

// Core version control types

export interface CADCommit {
  id: string; // SHA-256 hash of commit content
  parent: string[]; // Parent commit IDs (multiple for merge commits)
  author: CommitAuthor;
  timestamp: number;
  message: string;

  // CAD-specific content
  graphSnapshot: string; // Hash of full graph state
  graphDelta: GraphDelta; // Changes from parent
  geometryRefs: Map<string, string>; // Node ID -> geometry hash

  // Metadata
  thumbnail?: string; // Base64 preview image
  statistics: CommitStats;
  tags?: string[];
}

export interface CommitAuthor {
  name: string;
  email: string;
  timestamp: number;
}

export interface GraphDelta {
  addedNodes: NodeChange[];
  modifiedNodes: NodeChange[];
  deletedNodes: string[];

  addedEdges: EdgeChange[];
  deletedEdges: string[];

  parameterChanges: ParameterChange[];

  // Operation that caused the change (for better commit messages)
  operations: Operation[];
}

export interface NodeChange {
  nodeId: string;
  nodeType: string;
  before?: Node;
  after?: Node;
  geometryChanged: boolean;
  affectedNodes: string[]; // Downstream dependencies
}

export interface EdgeChange {
  edgeId: string;
  source: string;
  target: string;
  sourcePort?: string;
  targetPort?: string;
}

export interface ParameterChange {
  nodeId: string;
  parameter: string;
  valueBefore: unknown;
  valueAfter: unknown;
  unit?: string;

  // For numeric parameters
  delta?: number;
  percentChange?: number;
}

export interface Operation {
  type: 'create' | 'modify' | 'delete' | 'move' | 'connect' | 'parameter';
  description: string;
  nodeIds: string[];
  timestamp: number;
}

export interface CommitStats {
  nodeCount: number;
  edgeCount: number;
  addedNodes: number;
  modifiedNodes: number;
  deletedNodes: number;

  // Geometry stats
  faceCount: number;
  vertexCount: number;
  volume?: number;
  surfaceArea?: number;
  boundingBox?: { min: Vec3; max: Vec3 };

  // Performance metrics
  evaluationTime?: number;
  geometrySize: number; // Total size of geometry data
}

// Branch and reference types

export interface Branch {
  name: string;
  head: string; // Commit ID
  upstream?: string; // Remote branch
  description?: string;
  protected: boolean;

  // CAD-specific
  designPhase?: 'concept' | 'development' | 'review' | 'production';
  manufacturingReady?: boolean;
}

export interface Tag {
  name: string;
  commit: string;
  tagger: CommitAuthor;
  message?: string;

  // CAD-specific tags
  release?: ReleaseInfo;
  milestone?: MilestoneInfo;
}

export interface ReleaseInfo {
  version: string;
  manufacturingVersion?: string;
  tolerance?: number;
  material?: string;
  approvals: Approval[];
}

export interface MilestoneInfo {
  phase: string;
  requirements: string[];
  completed: boolean;
}

export interface Approval {
  department: 'engineering' | 'manufacturing' | 'quality' | 'management';
  approver: string;
  timestamp: number;
  notes?: string;
}

// Merge and conflict types

export interface MergeResult {
  success: boolean;
  commit?: CADCommit;
  conflicts: MergeConflict[];
  autoMerged: GraphDelta;

  // Geometry validation
  geometryValid: boolean;
  validationErrors?: ValidationError[];
}

export interface MergeConflict {
  type: 'parameter' | 'node' | 'edge' | 'geometry' | 'topology';
  nodeId?: string;
  parameter?: string;

  base?: unknown;
  ours: unknown;
  theirs: unknown;

  // Suggested resolutions
  suggestions?: ConflictResolution[];

  // Severity
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}

export interface ConflictResolution {
  strategy: 'use-ours' | 'use-theirs' | 'merge' | 'custom';
  description: string;
  value?: unknown;
  confidence: number; // 0-1, how confident we are this is correct
}

export interface ValidationError {
  type: 'invalid-geometry' | 'broken-reference' | 'cyclic-dependency' | 'missing-input';
  nodeId?: string;
  message: string;
  severity: 'warning' | 'error';
}

// Diff types

export interface SemanticDiff {
  commits: {
    from: string;
    to: string;
  };

  // Node-level changes
  nodes: {
    added: NodeDiff[];
    modified: NodeDiff[];
    deleted: NodeDiff[];
  };

  // Parameter changes
  parameters: ParameterDiff[];

  // Topology changes
  topology: {
    edgesAdded: Edge[];
    edgesRemoved: Edge[];
    connectivityChanged: boolean;
  };

  // Geometry changes
  geometry: GeometryDiff;

  // Human-readable summary
  summary: DiffSummary;
}

export interface NodeDiff {
  nodeId: string;
  nodeType: string;
  before?: Node;
  after?: Node;

  // What changed
  changes: {
    parameters?: ParameterDiff[];
    position?: { before: Vec3; after: Vec3 };
    connections?: { added: string[]; removed: string[] };
  };

  // Impact analysis
  impact: {
    downstreamNodes: string[];
    geometryChanged: boolean;
    breakingChange: boolean;
  };
}

export interface ParameterDiff {
  nodeId: string;
  parameter: string;
  before: unknown;
  after: unknown;

  // For numeric values
  absoluteChange?: number;
  percentChange?: number;

  // Visual representation hint
  visualType?: 'dimension' | 'angle' | 'count' | 'boolean' | 'selection';
}

export interface GeometryDiff {
  volumeChange: number;
  surfaceAreaChange: number;
  boundingBoxChange: {
    before: { min: Vec3; max: Vec3 };
    after: { min: Vec3; max: Vec3 };
  };

  // Visual diff data
  addedFaces: number;
  removedFaces: number;
  modifiedFaces: number;

  // Detailed mesh diff for visualization
  meshDiff?: {
    added: Float32Array; // Added triangles
    removed: Float32Array; // Removed triangles
    modified: Float32Array; // Modified triangles
  };
}

export interface DiffSummary {
  title: string;
  description: string;

  changes: string[]; // Human-readable change descriptions

  statistics: {
    nodesAdded: number;
    nodesModified: number;
    nodesDeleted: number;
    parametersChanged: number;
    geometryImpact: 'none' | 'minor' | 'major';
  };

  breakingChanges: string[];
  improvements: string[];
}

// Repository types

export interface Repository {
  path: string;
  head: string; // Current commit
  branch: string; // Current branch

  config: RepoConfig;
  remotes: Map<string, Remote>;

  // Cached data
  commitCache: Map<string, CADCommit>;
  geometryCache: Map<string, ArrayBuffer>;
}

export interface RepoConfig {
  core: {
    repositoryVersion: number;
    fileMode: boolean;
    bare: boolean;
    logAllRefUpdates: boolean;
  };

  user: {
    name: string;
    email: string;
  };

  cad: {
    geometryCompression: 'none' | 'zlib' | 'brotli';
    deltaCompression: boolean;
    shallowClone: boolean;
    maxGeometrySize: number; // MB
    autoCommit: boolean;
    semanticDiff: boolean;
  };

  merge: {
    strategy: 'recursive' | 'octopus' | 'ours' | 'cad-aware';
    conflictStyle: 'merge' | 'diff3';
    autoResolveParams: boolean;
  };
}

export interface Remote {
  name: string;
  url: string;
  fetch: string;
  push?: string;

  // CAD-specific
  geometryUrl?: string; // Separate URL for large geometry files
  credentials?: RemoteCredentials;
}

export interface RemoteCredentials {
  type: 'basic' | 'token' | 'ssh';
  username?: string;
  password?: string;
  token?: string;
  sshKey?: string;
}

// History and log types

export interface LogEntry {
  commit: CADCommit;
  refs: string[]; // Branch/tag names pointing to this commit

  // Graph for log visualization
  graph: {
    column: number; // Column in graph visualization
    parents: number[]; // Indices of parent commits in log
    children: number[]; // Indices of child commits
  };
}

export interface BlameInfo {
  nodeId: string;
  lines: BlameLine[];
}

export interface BlameLine {
  commit: string;
  author: string;
  timestamp: number;
  line: string; // The actual parameter/value
  originalNodeId?: string; // If node was renamed
}

// Stash types

export interface Stash {
  id: string;
  message: string;
  timestamp: number;

  // Working directory changes
  workingDirectory: GraphDelta;

  // Staged changes
  staged: GraphDelta;

  // Base commit
  baseCommit: string;
}

// Hooks

export interface Hook {
  name: 'pre-commit' | 'post-commit' | 'pre-merge' | 'post-merge' | 'pre-push';
  script: string;
  enabled: boolean;
}

export interface HookContext {
  repository: Repository;
  commits?: CADCommit[];
  branch?: Branch;
  remote?: Remote;

  // CAD-specific validation
  validation?: {
    geometryCheck: boolean;
    interferenceCheck: boolean;
    manufacturabilityCheck: boolean;
  };
}
