import React from 'react';
import { useCursor } from '../hooks';

export interface CursorsProps {
  containerRef?: React.RefObject<HTMLElement>;
  showNames?: boolean;
  smoothing?: boolean;
}

export function Cursors({ containerRef, showNames = true, smoothing = true }: CursorsProps) {
  const { otherCursors } = useCursor();

  return (
    <>
      {otherCursors.map((cursor) => (
        <Cursor
          key={cursor.userId}
          x={cursor.x}
          y={cursor.y}
          color={cursor.userColor}
          name={showNames ? cursor.userName : undefined}
          smoothing={smoothing}
        />
      ))}
    </>
  );
}

interface CursorProps {
  x: number;
  y: number;
  color: string;
  name?: string;
  smoothing?: boolean;
}

function Cursor({ x, y, color, name, smoothing }: CursorProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        pointerEvents: 'none',
        zIndex: 1000,
        transition: smoothing ? 'all 50ms linear' : undefined,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <svg
        width="24"
        height="36"
        viewBox="0 0 24 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
          fill={color}
          stroke="white"
        />
      </svg>
      {name && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            left: 12,
            backgroundColor: color,
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          {name}
        </div>
      )}
    </div>
  );
}
