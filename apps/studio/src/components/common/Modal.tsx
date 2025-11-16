import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../icons/IconSystem';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnEscape = true,
  closeOnBackdrop = true,
  className = '',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus first focusable element in modal
      const firstFocusable = modalRef.current?.querySelector(
        'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      firstFocusable?.focus();
    } else {
      // Restore focus to previously focused element
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent) => {
      if (closeOnBackdrop && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose]
  );

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  const modal = (
    <div
      className="modal-backdrop"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--spacing-4)',
      }}
    >
      <div
        ref={modalRef}
        className={`modal-content ${sizeClasses[size]} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{
          background: 'var(--color-surface-primary)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-modal)',
          border: '1px solid var(--color-border)',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalFadeIn 0.2s ease-out',
        }}
      >
        {/* Header */}
        <div
          className="modal-header"
          style={{
            padding: 'var(--spacing-4) var(--spacing-4) var(--spacing-3)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '60px',
          }}
        >
          <h2
            id="modal-title"
            className="modal-title"
            style={{
              margin: 0,
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--line-height-tight)',
            }}
          >
            {title}
          </h2>
          {showCloseButton && (
            <button
              type="button"
              onClick={onClose}
              className="modal-close-button"
              aria-label="Close modal"
              style={{
                background: 'transparent',
                border: 'none',
                padding: 'var(--spacing-2)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all var(--transition-fast)',
                marginRight: '-var(--spacing-2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-surface-tertiary)';
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
              }}
            >
              <Icon name="close" size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div
          className="modal-body"
          style={{
            padding: 'var(--spacing-4)',
            overflow: 'auto',
            flex: 1,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;
if (!document.head.querySelector('style[data-modal-styles]')) {
  style.setAttribute('data-modal-styles', 'true');
  document.head.appendChild(style);
}
