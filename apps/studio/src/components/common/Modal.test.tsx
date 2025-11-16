import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('renders with title', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Content</div>
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={onClose} title="Test">
        <div>Content</div>
      </Modal>
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const onClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={onClose} title="Test">
        <div>Content</div>
      </Modal>
    );

    // Modal is rendered via portal to document.body
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when modal content is clicked', () => {
    const onClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={onClose} title="Test">
        <div>Content</div>
      </Modal>
    );

    const content = document.querySelector('.modal-content');
    if (content) {
      fireEvent.click(content);
    }

    expect(onClose).not.toHaveBeenCalled();
  });

  it('handles ESC key press', () => {
    const onClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={onClose} title="Test">
        <div>Content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('applies custom className', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test" className="custom-modal">
        <div>Content</div>
      </Modal>
    );

    const modal = document.querySelector('.modal-content');
    expect(modal).toHaveClass('custom-modal');
  });

  it('supports different sizes', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'] as const;

    sizes.forEach((size) => {
      const { unmount } = render(
        <Modal isOpen={true} onClose={() => {}} title="Test" size={size}>
          <div>Content</div>
        </Modal>
      );

      const modal = document.querySelector('.modal-content');
      expect(modal).toHaveClass(
        `max-w-${size === 'sm' ? 'md' : size === 'md' ? 'lg' : size === 'lg' ? '2xl' : '4xl'}`
      );
      unmount();
    });
  });

  it('can disable backdrop close', () => {
    const onClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={onClose} title="Test" closeOnBackdrop={false}>
        <div>Content</div>
      </Modal>
    );

    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(onClose).not.toHaveBeenCalled();
  });

  it('can disable ESC close', () => {
    const onClose = vi.fn();

    render(
      <Modal isOpen={true} onClose={onClose} title="Test" closeOnEscape={false}>
        <div>Content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('hides close button when disabled', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test" showCloseButton={false}>
        <div>Content</div>
      </Modal>
    );

    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('sets body overflow hidden when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test">
        <div>Content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('cleans up on unmount', () => {
    const { unmount } = render(
      <Modal isOpen={true} onClose={() => {}} title="Test">
        <div>Content</div>
      </Modal>
    );

    expect(() => unmount()).not.toThrow();
    expect(document.body.style.overflow).toBe('');
  });

  it('has correct accessibility attributes', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Content</div>
      </Modal>
    );

    const modal = document.querySelector('.modal-content');
    expect(modal).toHaveAttribute('role', 'dialog');
    expect(modal).toHaveAttribute('aria-modal', 'true');
    expect(modal).toHaveAttribute('aria-labelledby', 'modal-title');
  });
});
