import React from 'react';
import { useSelection } from '../hooks';

export interface SelectionHighlightProps {
  nodeId?: string;
  edgeId?: string;
  className?: string;
}

export function SelectionHighlight({ nodeId, edgeId, className = '' }: SelectionHighlightProps) {
  const { otherSelections } = useSelection();

  // Find if any other user has selected this node or edge
  const selectingUsers = otherSelections.filter((selection) => {
    if (nodeId) {
      return selection.nodeIds.includes(nodeId);
    }
    if (edgeId) {
      return selection.edgeIds.includes(edgeId);
    }
    return false;
  });

  if (selectingUsers.length === 0) {
    return null;
  }

  // Use the first user's color for highlight
  const highlightColor = selectingUsers[0].userColor;

  return (
    <div
      className={`selection-highlight ${className}`}
      style={{
        position: 'absolute',
        inset: -2,
        border: `2px solid ${highlightColor}`,
        borderRadius: '4px',
        pointerEvents: 'none',
        animation: 'selection-pulse 2s ease-in-out infinite',
      }}
    >
      {selectingUsers.length > 1 && (
        <div
          style={{
            position: 'absolute',
            top: -20,
            left: 0,
            backgroundColor: highlightColor,
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 500,
          }}
        >
          {selectingUsers.map((u) => u.userName).join(', ')}
        </div>
      )}

      <style>{`
        @keyframes selection-pulse {
          0%,
          100% {
            opacity: 0.8;
          }
          50% {
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
}
