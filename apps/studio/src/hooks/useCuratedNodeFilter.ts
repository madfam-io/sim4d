import { useMemo, useState, useCallback } from 'react';
import {
  getCuratedNodeIds,
  getCategoriesBySkillLevel,
  getBeginnerNodes,
  getIntermediateNodes,
  getAdvancedNodes,
  getCuratedCatalogStats,
  // @ts-expect-error - nodes-core doesn't generate .d.ts files yet (dts: false in tsup config)
} from '@brepflow/nodes-core';
import type { NodeDefinition } from '@brepflow/types';

export type CurationMode = 'all' | 'curated' | 'beginner' | 'intermediate' | 'advanced';

export interface UseCuratedNodeFilterOptions {
  initialMode?: CurationMode;
}

/**
 * Hook for filtering nodes based on curated catalog
 *
 * Modes:
 * - all: Show all 1,827+ nodes (default, no filtering)
 * - curated: Show only 60 curated essential nodes
 * - beginner: Show beginner-tier curated nodes only
 * - intermediate: Show beginner + intermediate nodes
 * - advanced: Show all curated nodes (same as 'curated')
 */
export function useCuratedNodeFilter({
  initialMode = 'curated',
}: UseCuratedNodeFilterOptions = {}) {
  const [curationMode, setCurationMode] = useState<CurationMode>(initialMode);

  // Get curated node IDs based on current mode
  const allowedNodeIds = useMemo(() => {
    switch (curationMode) {
      case 'all':
        return null; // null means no filtering
      case 'beginner':
        return new Set(getBeginnerNodes());
      case 'intermediate':
        return new Set(getIntermediateNodes());
      case 'advanced':
      case 'curated':
        return new Set(getAdvancedNodes());
      default:
        return new Set(getCuratedNodeIds());
    }
  }, [curationMode]);

  // Filter function to apply to node lists
  const filterNodes = useCallback(
    (nodes: NodeDefinition[]): NodeDefinition[] => {
      if (curationMode === 'all' || !allowedNodeIds) {
        return nodes; // No filtering in 'all' mode
      }

      return nodes.filter((node) => {
        const nodeId = node.id || node.type;
        return allowedNodeIds.has(nodeId);
      });
    },
    [curationMode, allowedNodeIds]
  );

  // Check if a specific node should be shown
  const isNodeAllowed = useCallback(
    (nodeId: string): boolean => {
      if (curationMode === 'all' || !allowedNodeIds) {
        return true;
      }
      return allowedNodeIds.has(nodeId);
    },
    [curationMode, allowedNodeIds]
  );

  // Get statistics about current curation mode
  const curatedStats = useMemo(() => {
    const stats = getCuratedCatalogStats();

    switch (curationMode) {
      case 'all':
        return {
          ...stats,
          activeNodeCount: null, // Unknown total (1,827+)
          modeName: 'All Nodes',
          modeDescription: 'Full node catalog (1,827+ nodes)',
        };
      case 'beginner':
        return {
          ...stats,
          activeNodeCount: stats.bySkillLevel.beginner,
          modeName: 'Beginner',
          modeDescription: `${stats.bySkillLevel.beginner} essential beginner nodes`,
        };
      case 'intermediate':
        return {
          ...stats,
          activeNodeCount: stats.bySkillLevel.beginner + stats.bySkillLevel.intermediate,
          modeName: 'Intermediate',
          modeDescription: `${stats.bySkillLevel.beginner + stats.bySkillLevel.intermediate} nodes for productive work`,
        };
      case 'advanced':
      case 'curated':
        return {
          ...stats,
          activeNodeCount: stats.totalCuratedNodes,
          modeName: 'Curated',
          modeDescription: `${stats.totalCuratedNodes} essential nodes (${stats.reductionFromFull}% reduction)`,
        };
      default:
        return {
          ...stats,
          activeNodeCount: stats.totalCuratedNodes,
          modeName: 'Curated',
          modeDescription: `${stats.totalCuratedNodes} curated nodes`,
        };
    }
  }, [curationMode]);

  return {
    curationMode,
    setCurationMode,
    filterNodes,
    isNodeAllowed,
    curatedStats,
    isFiltering: curationMode !== 'all',
  };
}
