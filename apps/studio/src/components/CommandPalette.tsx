import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGraphStore } from '../store/graph-store';
import { NodeRegistry } from '@sim4d/engine-core';
import { createNodeId } from '@sim4d/types';
import './CommandPalette.css';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  position?: { x: number; y: number };
}

interface SearchResult {
  id: string;
  label: string;
  category: string;
  description?: string;
  type: 'node' | 'command';
  action?: () => void;
}

export function CommandPalette({ isOpen, onClose, position }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addNode, evaluateGraph, clearGraph, undo, redo, canUndo, canRedo } = useGraphStore();

  // Get available node types from registry
  const availableNodes = useMemo(() => {
    const registry = NodeRegistry.getInstance();
    const definitions = registry.getAllDefinitions();

    return Object.entries(definitions).map(([type, def]) => {
      const [category, name] = type.split('::');
      return {
        id: type,
        label: name || type,
        category: category || 'Other',
        description: (def as any).metadata?.description || `Create a ${name} node`,
        type: 'node' as const,
      };
    });
  }, []);

  // Add system commands
  const systemCommands: SearchResult[] = useMemo(
    () => [
      {
        id: 'cmd:evaluate',
        label: 'Evaluate Graph',
        category: 'Commands',
        description: 'Run graph evaluation (Ctrl+E)',
        type: 'command',
        action: evaluateGraph,
      },
      {
        id: 'cmd:undo',
        label: 'Undo',
        category: 'Commands',
        description: 'Undo last action (Ctrl+Z)',
        type: 'command',
        action: () => canUndo() && undo(),
      },
      {
        id: 'cmd:redo',
        label: 'Redo',
        category: 'Commands',
        description: 'Redo last action (Ctrl+Shift+Z)',
        type: 'command',
        action: () => canRedo() && redo(),
      },
      {
        id: 'cmd:clear',
        label: 'Clear Graph',
        category: 'Commands',
        description: 'Remove all nodes and edges',
        type: 'command',
        action: () => {
          if (window.confirm('Clear all nodes and edges?')) {
            clearGraph();
          }
        },
      },
    ],
    [evaluateGraph, undo, redo, canUndo, canRedo, clearGraph]
  );

  // Filter results based on search
  const filteredResults = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) {
      return [...availableNodes, ...systemCommands].slice(0, 20);
    }

    const allItems = [...availableNodes, ...systemCommands];

    // Score each item
    const scored = allItems.map((item) => {
      let score = 0;
      const label = item.label.toLowerCase();
      const category = item.category.toLowerCase();
      const description = item.description?.toLowerCase() || '';

      // Exact match
      if (label === query) score += 100;
      if (category === query) score += 50;

      // Starts with
      if (label.startsWith(query)) score += 80;
      if (category.startsWith(query)) score += 40;

      // Contains
      if (label.includes(query)) score += 60;
      if (category.includes(query)) score += 30;
      if (description.includes(query)) score += 20;

      // Fuzzy match
      const fuzzyScore = fuzzyMatch(query, label);
      score += fuzzyScore * 40;

      return { item, score };
    });

    // Sort by score and take top results
    return scored
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map(({ item }) => item);
  }, [search, availableNodes, systemCommands]);

  // Fuzzy matching function
  function fuzzyMatch(pattern: string, str: string): number {
    pattern = pattern.toLowerCase();
    str = str.toLowerCase();

    let patternIdx = 0;
    let strIdx = 0;
    let score = 0;
    let consecutive = 0;

    while (patternIdx < pattern.length && strIdx < str.length) {
      if (pattern[patternIdx] === str[strIdx]) {
        score += 1 + consecutive;
        consecutive++;
        patternIdx++;
      } else {
        consecutive = 0;
      }
      strIdx++;
    }

    return patternIdx === pattern.length ? score / pattern.length : 0;
  }

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < filteredResults.length - 1 ? prev + 1 : 0));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredResults.length - 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredResults[selectedIndex]) {
            handleSelect(filteredResults[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredResults, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Handle selection
  const handleSelect = (result: SearchResult) => {
    if (result.type === 'command' && result.action) {
      result.action();
    } else if (result.type === 'node') {
      const nodePosition = position || { x: window.innerWidth / 2, y: window.innerHeight / 2 };

      addNode({
        type: result.id,
        position: nodePosition,
        inputs: {},
        params: {},
      });
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="command-palette-backdrop" onClick={onClose} />
      <div
        className="command-palette"
        style={position ? { left: position.x, top: position.y } : undefined}
      >
        <div className="command-palette-header">
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            placeholder="Search nodes and commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="command-palette-hint">↑↓ Navigate • Enter Select • Esc Close</span>
        </div>

        <div className="command-palette-results">
          {filteredResults.length === 0 ? (
            <div className="command-palette-empty">No results found for "{search}"</div>
          ) : (
            filteredResults.map((result, index) => (
              <div
                key={result.id}
                className={`command-palette-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="command-palette-item-icon">
                  {result.type === 'command' ? '⌘' : '◆'}
                </div>
                <div className="command-palette-item-content">
                  <div className="command-palette-item-title">
                    {result.label}
                    <span className="command-palette-item-category">{result.category}</span>
                  </div>
                  {result.description && (
                    <div className="command-palette-item-description">{result.description}</div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
