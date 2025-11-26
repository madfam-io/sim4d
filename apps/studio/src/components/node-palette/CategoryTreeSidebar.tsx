import React, { useState } from 'react';
// import type { CategoryTree } from '@sim4d/nodes-core';

// Temporary fallback type until build issues are resolved
type CategoryTree = Record<string, { nodes: any[]; subcategories: Record<string, any[]> }>;

interface CategoryTreeSidebarProps {
  categoryTree: CategoryTree;
  selectedCategory: string | null;
  expandedCategories: Set<string>;
  onCategorySelect: (category: string) => void;
  onCategoryExpand: (category: string, expanded: boolean) => void;
  searchQuery?: string;
  compact?: boolean;
}

interface CategoryNodeProps {
  category: string;
  nodeCount: number;
  subcategories: Record<string, any[]>;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onExpand: (expanded: boolean) => void;
  searchHighlight?: string;
  level?: number;
  compact?: boolean;
}

function HighlightText({ text, highlight }: { text: string; highlight?: string }) {
  if (!highlight?.trim()) {
    return <span>{text}</span>;
  }

  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="search-highlight">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  );
}

function CategoryNode({
  category,
  nodeCount,
  subcategories,
  isSelected,
  isExpanded,
  onSelect,
  onExpand,
  searchHighlight,
  level = 0,
  compact = false,
}: CategoryNodeProps) {
  const hasSubcategories = Object.keys(subcategories).length > 0;

  // Category icons mapping
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      Architecture: '🏢',
      MechanicalEngineering: '⚙️',
      Analysis: '📊',
      Interoperability: '🔗',
      Algorithmic: '🤖',
      Features: '🔧',
      Solid: '📦',
      Sketch: '✏️',
      Boolean: '⚪',
      Transform: '🔄',
      Manufacturing: '🏭',
      Assembly: '🧩',
      SheetMetal: '📋',
      Advanced: '⚡',
      Surface: '🌊',
      Mesh: '🕸️',
      Import: '📥',
      Simulation: '🔬',
      Specialized: '🎯',
      Mathematics: '📐',
      Data: '💾',
      Fields: '🌐',
      Patterns: '🔢',
      Fabrication: '🛠️',
    };
    return iconMap[category] || '📂';
  };

  return (
    <div className={`category-node level-${level} ${compact ? 'compact' : ''}`}>
      <div
        className={`category-header ${isSelected ? 'selected' : ''} ${compact ? 'compact' : ''}`}
        onClick={onSelect}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
      >
        <div className="category-main">
          {hasSubcategories && (
            <button
              className={`expand-toggle ${isExpanded ? 'expanded' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                onExpand(!isExpanded);
              }}
              title={isExpanded ? 'Collapse category' : 'Expand category'}
            >
              <span className="chevron">▶</span>
            </button>
          )}

          <span className="category-icon">{getCategoryIcon(category)}</span>

          <span className="category-name">
            <HighlightText text={category} highlight={searchHighlight} />
          </span>
        </div>

        <span className="node-count" title={`${nodeCount} nodes in this category`}>
          {nodeCount}
        </span>
      </div>

      {hasSubcategories && isExpanded && (
        <div className="subcategories">
          {Object.entries(subcategories)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([subcat, nodes]) => (
              <CategoryNode
                key={subcat}
                category={subcat}
                nodeCount={nodes.length}
                subcategories={{}} // subcategories don't have further nesting
                isSelected={false} // subcategories aren't selectable in this version
                isExpanded={false}
                onSelect={() => {}} // subcategories aren't selectable
                onExpand={() => {}}
                searchHighlight={searchHighlight}
                level={level + 1}
                compact={compact}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTreeSidebar({
  categoryTree,
  selectedCategory,
  expandedCategories,
  onCategorySelect,
  onCategoryExpand,
  searchQuery,
  compact = false,
}: CategoryTreeSidebarProps) {
  const [showAll, setShowAll] = useState(false);

  const toggleCategoryExpansion = (category: string) => {
    const isExpanded = expandedCategories.has(category);
    onCategoryExpand(category, !isExpanded);
  };

  const collapseAll = () => {
    Object.keys(categoryTree).forEach((category) => {
      if (expandedCategories.has(category)) {
        onCategoryExpand(category, false);
      }
    });
  };

  const expandAll = () => {
    Object.keys(categoryTree).forEach((category) => {
      if (!expandedCategories.has(category)) {
        onCategoryExpand(category, true);
      }
    });
  };

  // Sort categories by node count (descending) and then alphabetically
  const sortedCategories = Object.entries(categoryTree).sort(([aName, aData], [bName, bData]) => {
    // First sort by node count (descending)
    const countDiff = bData.nodes.length - aData.nodes.length;
    if (countDiff !== 0) return countDiff;

    // Then sort alphabetically
    return aName.localeCompare(bName);
  });

  // Show only top categories initially, with option to expand
  const visibleCategories = showAll ? sortedCategories : sortedCategories.slice(0, 8);
  const hasMoreCategories = sortedCategories.length > 8;

  return (
    <div className={`category-tree-sidebar ${compact ? 'compact' : ''}`}>
      <div className="category-tree-header">
        <div className="header-title">
          <h4>Categories</h4>
          <span className="category-count">{Object.keys(categoryTree).length} categories</span>
        </div>

        <div className="header-actions">
          <button className="action-btn" onClick={expandAll} title="Expand all categories">
            ⬇
          </button>
          <button className="action-btn" onClick={collapseAll} title="Collapse all categories">
            ⬆
          </button>
        </div>
      </div>

      <div className="category-tree-content">
        <div className="categories-list">
          {visibleCategories.map(([category, data]) => (
            <CategoryNode
              key={category}
              category={category}
              nodeCount={data.nodes.length}
              subcategories={data.subcategories}
              isSelected={selectedCategory === category}
              isExpanded={expandedCategories.has(category)}
              onSelect={() => onCategorySelect(category)}
              onExpand={(expanded) => onCategoryExpand(category, expanded)}
              searchHighlight={searchQuery}
              compact={compact}
            />
          ))}
        </div>

        {hasMoreCategories && (
          <div className="show-more-container">
            <button className="show-more-btn" onClick={() => setShowAll(!showAll)}>
              {showAll ? <>⬆ Show Less</> : <>⬇ Show {sortedCategories.length - 8} More</>}
            </button>
          </div>
        )}

        {selectedCategory && (
          <div className="selected-category-info">
            <div className="info-header">
              <span className="category-icon">
                {(() => {
                  const iconMap: Record<string, string> = {
                    Architecture: '🏢',
                    MechanicalEngineering: '⚙️',
                    Analysis: '📊',
                  };
                  return iconMap[selectedCategory] || '📂';
                })()}
              </span>
              <span className="category-name">{selectedCategory}</span>
            </div>
            <div className="info-stats">
              {categoryTree[selectedCategory] && (
                <>
                  <div className="stat">
                    <span className="stat-label">Nodes:</span>
                    <span className="stat-value">
                      {categoryTree[selectedCategory].nodes.length}
                    </span>
                  </div>
                  {Object.keys(categoryTree[selectedCategory].subcategories).length > 0 && (
                    <div className="stat">
                      <span className="stat-label">Subcategories:</span>
                      <span className="stat-value">
                        {Object.keys(categoryTree[selectedCategory].subcategories).length}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
            <button
              className="clear-selection-btn"
              onClick={() => onCategorySelect('')}
              title="Clear category selection"
            >
              ✕ Clear Selection
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
