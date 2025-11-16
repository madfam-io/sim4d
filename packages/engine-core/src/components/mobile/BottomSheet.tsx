import React, { useRef, useEffect, useState, useCallback } from 'react';
import './BottomSheet.css';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: number;
  snapPoints?: number[];
  showHandle?: boolean;
  backdrop?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  children,
  height = 400,
  snapPoints = [80, 400],
  showHandle = true,
  backdrop = true,
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [currentHeight, setCurrentHeight] = useState(snapPoints[0]);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragStartHeight = useRef(0);

  // Handle drag to resize
  const handleDragStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      setIsDragging(true);
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      dragStartY.current = clientY;
      dragStartHeight.current = currentHeight;
      e.preventDefault();
    },
    [currentHeight]
  );

  const handleDrag = useCallback(
    (e: TouchEvent | MouseEvent) => {
      if (!isDragging) return;

      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaY = dragStartY.current - clientY;
      const newHeight = Math.max(
        snapPoints[0],
        Math.min(window.innerHeight * 0.9, dragStartHeight.current + deltaY)
      );

      setCurrentHeight(newHeight);
    },
    [isDragging, snapPoints]
  );

  const handleDragEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    // Snap to nearest point
    let nearestSnap = snapPoints[0];
    let minDistance = Math.abs(currentHeight - snapPoints[0]);

    snapPoints.forEach((point) => {
      const distance = Math.abs(currentHeight - point);
      if (distance < minDistance) {
        minDistance = distance;
        nearestSnap = point;
      }
    });

    // Close if dragged below minimum
    if (currentHeight < snapPoints[0] * 0.5) {
      onClose();
    } else {
      setCurrentHeight(nearestSnap);
    }
  }, [isDragging, currentHeight, snapPoints, onClose]);

  // Add global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      const handleGlobalMove = (e: TouchEvent | MouseEvent) => handleDrag(e);
      const handleGlobalEnd = () => handleDragEnd();

      window.addEventListener('touchmove', handleGlobalMove, { passive: false });
      window.addEventListener('mousemove', handleGlobalMove);
      window.addEventListener('touchend', handleGlobalEnd);
      window.addEventListener('mouseup', handleGlobalEnd);

      return () => {
        window.removeEventListener('touchmove', handleGlobalMove);
        window.removeEventListener('mousemove', handleGlobalMove);
        window.removeEventListener('touchend', handleGlobalEnd);
        window.removeEventListener('mouseup', handleGlobalEnd);
      };
    }
  }, [isDragging, handleDrag, handleDragEnd]);

  // Set initial height when opened
  useEffect(() => {
    if (isOpen) {
      setCurrentHeight(height || snapPoints[1] || snapPoints[0]);
    }
  }, [isOpen, height, snapPoints]);

  if (!isOpen) return null;

  return (
    <>
      {backdrop && (
        <div
          className="bottom-sheet-backdrop"
          onClick={onClose}
          style={{ opacity: isDragging ? 0.3 : 0.5 }}
        />
      )}
      <div
        ref={sheetRef}
        className={`bottom-sheet ${isDragging ? 'dragging' : ''}`}
        style={{
          height: currentHeight,
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
        }}
      >
        {showHandle && (
          <div
            className="bottom-sheet-handle"
            onTouchStart={handleDragStart}
            onMouseDown={handleDragStart}
          >
            <div className="handle-bar" />
          </div>
        )}
        <div className="bottom-sheet-content">{children}</div>
      </div>
    </>
  );
};
