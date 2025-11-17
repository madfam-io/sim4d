import { useState, useCallback } from 'react';
import type { NodeInstance } from '@brepflow/types';
import { createChildLogger } from '../lib/logging/logger-instance';

const logger = createChildLogger({ module: 'useClipboard' });

interface ClipboardData {
  nodes: NodeInstance[];
  timestamp: number;
  source: 'brepflow';
}

export function useClipboard() {
  const [clipboardData, setClipboardData] = useState<ClipboardData | null>(null);

  const copyNodes = useCallback((nodes: NodeInstance[]) => {
    if (nodes.length === 0) return;

    // Create a deep copy of nodes with new IDs for pasting
    const nodesToCopy = nodes.map((node) => ({
      ...node,
      // Keep original ID for reference mapping but will generate new IDs on paste
      originalId: node.id,
    }));

    const data: ClipboardData = {
      nodes: nodesToCopy,
      timestamp: Date.now(),
      source: 'brepflow',
    };

    setClipboardData(data);

    // Also try to copy to system clipboard as JSON
    try {
      navigator.clipboard.writeText(JSON.stringify(data));
    } catch (error) {
      logger.warn('Failed to copy to system clipboard:', error);
    }

    logger.debug(`📋 Copied ${nodes.length} nodes to clipboard`);
  }, []);

  const pasteNodes = useCallback(
    (position?: { x: number; y: number }) => {
      if (!clipboardData) return [];

      const basePosition = position || { x: 100, y: 100 };
      const offset = 50; // Offset for pasted nodes

      // Generate new IDs and update positions
      const pastedNodes = clipboardData.nodes.map((node, index) => ({
        ...node,
        id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        position: {
          x: basePosition.x + index * offset,
          y: basePosition.y + index * offset,
        },
        // Remove the originalId as it was just for reference
        originalId: undefined,
      }));

      logger.debug(`📋 Pasted ${pastedNodes.length} nodes at position`, basePosition);
      return pastedNodes;
    },
    [clipboardData]
  );

  const hasClipboardData = useCallback(() => {
    return clipboardData !== null && clipboardData.nodes.length > 0;
  }, [clipboardData]);

  const clearClipboard = useCallback(() => {
    setClipboardData(null);
  }, []);

  return {
    copyNodes,
    pasteNodes,
    hasClipboardData,
    clearClipboard,
    clipboardNodeCount: clipboardData?.nodes.length || 0,
  };
}
