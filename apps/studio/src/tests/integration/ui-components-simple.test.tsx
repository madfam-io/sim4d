import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

// Import enhanced UI components
import { Button, IconButton } from '../../components/ui/Button';
import { Panel } from '../../components/ui/Panel';
import { PanelSection } from '../../components/ui/PanelSection';
import { Input } from '../../components/ui/Input';
import { NumberInput, CoordinateInput } from '../../components/ui/NumberInput';

describe('UI Components Tests', () => {
  describe('Button Component', () => {
    it('renders button with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('renders all button variants', () => {
      const { container } = render(
        <div>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
      );

      expect(container.querySelector('.btn-primary')).toBeInTheDocument();
      expect(container.querySelector('.btn-secondary')).toBeInTheDocument();
      expect(container.querySelector('.btn-tertiary')).toBeInTheDocument();
      expect(container.querySelector('.btn-ghost')).toBeInTheDocument();
      expect(container.querySelector('.btn-danger')).toBeInTheDocument();
    });

    it('handles click events', () => {
      const onClick = vi.fn();
      render(<Button onClick={onClick}>Click me</Button>);

      fireEvent.click(screen.getByText('Click me'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('disables button when loading', () => {
      render(<Button loading={true}>Loading</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('renders IconButton with aria-label', () => {
      render(<IconButton icon="settings" aria-label="Settings" />);
      expect(screen.getByLabelText('Settings')).toBeInTheDocument();
    });
  });

  describe('Panel Component', () => {
    it('renders panel with title', () => {
      render(<Panel title="Test Panel">Content</Panel>);
      expect(screen.getByText('Test Panel')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders panel with subtitle', () => {
      render(
        <Panel title="Test Panel" subtitle="Test Subtitle">
          Content
        </Panel>
      );
      expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });
  });

  describe('PanelSection Component', () => {
    it('renders section with title', () => {
      render(<PanelSection title="Section Title">Section Content</PanelSection>);
      expect(screen.getByText('Section Title')).toBeInTheDocument();
      expect(screen.getByText('Section Content')).toBeInTheDocument();
    });

    it('toggles collapse state', () => {
      render(
        <PanelSection title="Collapsible" collapsible defaultCollapsed={false}>
          Content
        </PanelSection>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();

      // Click to collapse
      fireEvent.click(screen.getByText('Collapsible'));
      expect(screen.queryByText('Content')).not.toBeInTheDocument();
    });
  });

  describe('Input Component', () => {
    it('renders input with label', () => {
      render(<Input label="Test Label" />);
      expect(screen.getByText('Test Label')).toBeInTheDocument();
    });

    it('handles value changes', () => {
      const onChange = vi.fn();
      render(<Input value="test" onChange={onChange} />);

      const input = screen.getByDisplayValue('test');
      fireEvent.change(input, { target: { value: 'new value' } });

      expect(onChange).toHaveBeenCalled();
    });

    it('shows error state', () => {
      const { container } = render(<Input errorText="Error message" />);
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(container.querySelector('.form-input-error')).toBeInTheDocument();
    });
  });

  describe('NumberInput Component', () => {
    it('renders number input', () => {
      render(<NumberInput label="Width" value={100} />);
      expect(screen.getByText('Width')).toBeInTheDocument();
    });

    it('handles value changes', () => {
      const onValueChange = vi.fn();
      render(<NumberInput value={100} onValueChange={onValueChange} />);

      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '200' } });

      expect(onValueChange).toHaveBeenCalledWith(200);
    });

    it('clamps values to min/max', () => {
      const onValueChange = vi.fn();
      render(<NumberInput value={50} min={0} max={100} onValueChange={onValueChange} />);

      const input = screen.getByRole('spinbutton');
      fireEvent.change(input, { target: { value: '150' } });

      expect(onValueChange).toHaveBeenCalledWith(100); // Clamped to max
    });
  });

  describe('CoordinateInput Component', () => {
    it('renders three inputs for x, y, z', () => {
      render(<CoordinateInput value={{ x: 10, y: 20, z: 30 }} />);

      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs).toHaveLength(3);
    });

    it('handles coordinate changes', () => {
      const onChange = vi.fn();
      render(<CoordinateInput value={{ x: 10, y: 20, z: 30 }} onChange={onChange} />);

      const inputs = screen.getAllByRole('spinbutton');
      fireEvent.change(inputs[0], { target: { value: '15' } });

      expect(onChange).toHaveBeenCalledWith({ x: 15, y: 20, z: 30 });
    });
  });
});
