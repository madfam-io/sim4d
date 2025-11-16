# Enhanced Node Palette Component Specifications

## Component Architecture

### Main Component Structure

```tsx
// Enhanced Node Palette Root Component
export interface EnhancedNodePaletteProps {
  registry: EnhancedNodeRegistry;
  onNodeSelect: (nodeType: string, position: Point) => void;
  onFavoriteToggle: (nodeType: string) => void;
  recentNodes: string[];
  favoriteNodes: string[];
  className?: string;
}

export function EnhancedNodePalette({
  registry,
  onNodeSelect,
  onFavoriteToggle,
  recentNodes,
  favoriteNodes,
  className,
}: EnhancedNodePaletteProps) {
  // Implementation
}
```

## Sub-Components

### 1. SearchFilterBar Component

```tsx
interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filters: NodeFilters;
  onFiltersChange: (filters: NodeFilters) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  totalResults: number;
}

interface NodeFilters {
  categories: string[];
  tags: string[];
  complexity: ('beginner' | 'intermediate' | 'advanced')[];
  showFavoritesOnly: boolean;
  showRecentOnly: boolean;
}

type SortOption = 'name' | 'category' | 'usage' | 'recent' | 'relevance';
type ViewMode = 'grid' | 'list' | 'compact';

function SearchFilterBar({
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  // ... other props
}: SearchFilterBarProps) {
  return (
    <div className="search-filter-bar">
      <SearchInput
        value={searchQuery}
        onChange={onSearchChange}
        placeholder="Search 868+ nodes..."
        autoComplete={true}
      />
      <FilterDropdown
        filters={filters}
        onChange={onFiltersChange}
        availableCategories={availableCategories}
        availableTags={availableTags}
      />
      <SortDropdown value={sortBy} onChange={onSortChange} options={sortOptions} />
      <ViewModeToggle
        value={viewMode}
        onChange={onViewModeChange}
        modes={['grid', 'list', 'compact']}
      />
    </div>
  );
}
```

### 2. QuickAccessToolbar Component

```tsx
interface QuickAccessToolbarProps {
  favoriteNodes: string[];
  recentNodes: string[];
  suggestedNodes: string[];
  onNodeSelect: (nodeType: string) => void;
  onTabChange: (tab: 'favorites' | 'recent' | 'suggested') => void;
  activeTab: string;
}

function QuickAccessToolbar({
  favoriteNodes,
  recentNodes,
  suggestedNodes,
  onNodeSelect,
  onTabChange,
  activeTab,
}: QuickAccessToolbarProps) {
  return (
    <div className="quick-access-toolbar">
      <TabBar activeTab={activeTab} onTabChange={onTabChange}>
        <Tab id="favorites" icon="⭐" label="Favorites" count={favoriteNodes.length} />
        <Tab id="recent" icon="🕐" label="Recent" count={recentNodes.length} />
        <Tab id="suggested" icon="💡" label="Suggested" count={suggestedNodes.length} />
      </TabBar>
      <ScrollableNodeList
        nodes={getActiveTabNodes(activeTab, favoriteNodes, recentNodes, suggestedNodes)}
        onNodeSelect={onNodeSelect}
        layout="horizontal"
        compact={true}
      />
    </div>
  );
}
```

### 3. CategoryTreeSidebar Component

```tsx
interface CategoryTreeSidebarProps {
  categoryTree: CategoryTree;
  selectedCategory: string | null;
  expandedCategories: Set<string>;
  onCategorySelect: (category: string) => void;
  onCategoryExpand: (category: string, expanded: boolean) => void;
  searchQuery: string; // for highlighting matches
}

function CategoryTreeSidebar({
  categoryTree,
  selectedCategory,
  expandedCategories,
  onCategorySelect,
  onCategoryExpand,
  searchQuery,
}: CategoryTreeSidebarProps) {
  return (
    <div className="category-tree-sidebar">
      <div className="category-tree-header">
        <h3>Categories</h3>
        <button onClick={() => collapseAll()}>Collapse All</button>
      </div>
      <div className="category-tree-content">
        {Object.entries(categoryTree).map(([category, data]) => (
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
          />
        ))}
      </div>
    </div>
  );
}

interface CategoryNodeProps {
  category: string;
  nodeCount: number;
  subcategories: Record<string, NodeDefinition[]>;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onExpand: (expanded: boolean) => void;
  searchHighlight: string;
  level?: number; // for nested categories
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
}: CategoryNodeProps) {
  const hasSubcategories = Object.keys(subcategories).length > 0;

  return (
    <div className={`category-node level-${level}`}>
      <div className={`category-header ${isSelected ? 'selected' : ''}`} onClick={onSelect}>
        {hasSubcategories && (
          <button
            className={`expand-toggle ${isExpanded ? 'expanded' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onExpand(!isExpanded);
            }}
          >
            <ChevronIcon />
          </button>
        )}
        <CategoryIcon category={category} />
        <span className="category-name">
          <HighlightText text={category} highlight={searchHighlight} />
        </span>
        <span className="node-count">{nodeCount}</span>
      </div>

      {hasSubcategories && isExpanded && (
        <div className="subcategories">
          {Object.entries(subcategories).map(([subcat, nodes]) => (
            <CategoryNode
              key={subcat}
              category={subcat}
              nodeCount={nodes.length}
              subcategories={{}} // subcategories don't have further nesting
              isSelected={selectedCategory === subcat}
              isExpanded={false}
              onSelect={() => onCategorySelect(subcat)}
              onExpand={() => {}}
              searchHighlight={searchHighlight}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### 4. NodeDisplayArea Component

```tsx
interface NodeDisplayAreaProps {
  nodes: NodeDefinition[];
  viewMode: ViewMode;
  onNodeSelect: (nodeType: string) => void;
  onNodeHover: (nodeType: string | null) => void;
  selectedNode: string | null;
  favoriteNodes: string[];
  onFavoriteToggle: (nodeType: string) => void;
  searchQuery: string;
  loading?: boolean;
  error?: string;
}

function NodeDisplayArea({
  nodes,
  viewMode,
  onNodeSelect,
  onNodeHover,
  selectedNode,
  favoriteNodes,
  onFavoriteToggle,
  searchQuery,
  loading,
  error,
}: NodeDisplayAreaProps) {
  if (loading) {
    return <NodeDisplayLoading />;
  }

  if (error) {
    return <NodeDisplayError error={error} />;
  }

  if (nodes.length === 0) {
    return <NodeDisplayEmpty searchQuery={searchQuery} />;
  }

  const commonProps = {
    nodes,
    onNodeSelect,
    onNodeHover,
    selectedNode,
    favoriteNodes,
    onFavoriteToggle,
    searchQuery,
  };

  switch (viewMode) {
    case 'grid':
      return <NodeGrid {...commonProps} />;
    case 'list':
      return <NodeList {...commonProps} />;
    case 'compact':
      return <NodeCompactList {...commonProps} />;
    default:
      return <NodeGrid {...commonProps} />;
  }
}
```

### 5. Node Display Modes

#### Grid View Component

```tsx
interface NodeGridProps {
  nodes: NodeDefinition[];
  onNodeSelect: (nodeType: string) => void;
  onNodeHover: (nodeType: string | null) => void;
  selectedNode: string | null;
  favoriteNodes: string[];
  onFavoriteToggle: (nodeType: string) => void;
  searchQuery: string;
}

function NodeGrid({
  nodes,
  onNodeSelect,
  onNodeHover,
  selectedNode,
  favoriteNodes,
  onFavoriteToggle,
  searchQuery,
}: NodeGridProps) {
  return (
    <div className="node-grid">
      <VirtualizedGrid
        items={nodes}
        itemHeight={96} // Height of each node card
        itemWidth={88} // Width of each node card
        overscan={5} // Render extra items for smooth scrolling
        renderItem={({ index, style }) => (
          <div style={style}>
            <NodeCard
              node={nodes[index]}
              isSelected={selectedNode === nodes[index].type}
              isFavorite={favoriteNodes.includes(nodes[index].type)}
              onSelect={() => onNodeSelect(nodes[index].type)}
              onHover={() => onNodeHover(nodes[index].type)}
              onFavoriteToggle={() => onFavoriteToggle(nodes[index].type)}
              searchHighlight={searchQuery}
            />
          </div>
        )}
      />
    </div>
  );
}

interface NodeCardProps {
  node: NodeDefinition;
  isSelected: boolean;
  isFavorite: boolean;
  onSelect: () => void;
  onHover: () => void;
  onFavoriteToggle: () => void;
  searchHighlight: string;
}

function NodeCard({
  node,
  isSelected,
  isFavorite,
  onSelect,
  onHover,
  onFavoriteToggle,
  searchHighlight,
}: NodeCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const metadata = useNodeMetadata(node);

  return (
    <div
      className={`node-card ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/reactflow', node.type);
        setIsDragging(true);
      }}
      onDragEnd={() => setIsDragging(false)}
      onClick={onSelect}
      onMouseEnter={onHover}
      onMouseLeave={() => onHover()}
    >
      <div className="node-card-header">
        <NodeIcon nodeType={node.type} size={24} />
        <button
          className={`favorite-button ${isFavorite ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle();
          }}
        >
          <StarIcon filled={isFavorite} />
        </button>
      </div>

      <div className="node-card-content">
        <div className="node-title">
          <HighlightText text={metadata.label} highlight={searchHighlight} />
        </div>
        <div className="node-category">{metadata.category}</div>
      </div>

      {metadata.tags.length > 0 && (
        <div className="node-tags">
          {metadata.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="node-tag">
              {tag}
            </span>
          ))}
          {metadata.tags.length > 2 && (
            <span className="node-tag-more">+{metadata.tags.length - 2}</span>
          )}
        </div>
      )}
    </div>
  );
}
```

#### List View Component

```tsx
function NodeList({
  nodes,
  onNodeSelect,
  onNodeHover,
  selectedNode,
  favoriteNodes,
  onFavoriteToggle,
  searchQuery,
}: NodeGridProps) {
  return (
    <div className="node-list">
      <VirtualizedList
        items={nodes}
        itemHeight={56} // Height of each list item
        overscan={10}
        renderItem={({ index, style }) => (
          <div style={style}>
            <NodeListItem
              node={nodes[index]}
              isSelected={selectedNode === nodes[index].type}
              isFavorite={favoriteNodes.includes(nodes[index].type)}
              onSelect={() => onNodeSelect(nodes[index].type)}
              onHover={() => onNodeHover(nodes[index].type)}
              onFavoriteToggle={() => onFavoriteToggle(nodes[index].type)}
              searchHighlight={searchQuery}
            />
          </div>
        )}
      />
    </div>
  );
}

function NodeListItem({
  node,
  isSelected,
  isFavorite,
  onSelect,
  onHover,
  onFavoriteToggle,
  searchHighlight,
}: NodeCardProps) {
  const metadata = useNodeMetadata(node);

  return (
    <div
      className={`node-list-item ${isSelected ? 'selected' : ''}`}
      draggable
      onDragStart={(e) => e.dataTransfer.setData('application/reactflow', node.type)}
      onClick={onSelect}
      onMouseEnter={onHover}
    >
      <NodeIcon nodeType={node.type} size={20} />

      <div className="node-info">
        <div className="node-name">
          <HighlightText text={metadata.label} highlight={searchHighlight} />
        </div>
        <div className="node-description">
          <HighlightText text={metadata.description} highlight={searchHighlight} />
        </div>
      </div>

      <div className="node-metadata">
        <span className="node-category-badge">{metadata.category}</span>
        {metadata.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="node-tag-badge">
            {tag}
          </span>
        ))}
      </div>

      <button
        className={`favorite-button ${isFavorite ? 'active' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onFavoriteToggle();
        }}
      >
        <StarIcon filled={isFavorite} size={16} />
      </button>
    </div>
  );
}
```

### 6. NodeDetailsPanel Component

```tsx
interface NodeDetailsPanelProps {
  selectedNode: string | null;
  registry: EnhancedNodeRegistry;
  onExampleClick: (example: string) => void;
  onDocumentationClick: (url: string) => void;
}

function NodeDetailsPanel({
  selectedNode,
  registry,
  onExampleClick,
  onDocumentationClick,
}: NodeDetailsPanelProps) {
  if (!selectedNode) {
    return (
      <div className="node-details-panel empty">
        <div className="empty-state">
          <InfoIcon size={24} />
          <p>Hover over a node to see details</p>
        </div>
      </div>
    );
  }

  const node = registry.getNode(selectedNode);
  const metadata = registry.getNodeMetadata(selectedNode);

  if (!node || !metadata) {
    return (
      <div className="node-details-panel error">
        <p>Node details not available</p>
      </div>
    );
  }

  return (
    <div className="node-details-panel">
      <div className="details-header">
        <NodeIcon nodeType={node.type} size={28} />
        <div className="details-title">
          <h4>{metadata.label}</h4>
          <p className="details-type">{node.type}</p>
        </div>
      </div>

      <div className="details-content">
        <div className="details-section">
          <h5>Description</h5>
          <p className="description-text">{metadata.description}</p>
        </div>

        {metadata.tags.length > 0 && (
          <div className="details-section">
            <h5>Tags</h5>
            <div className="tag-list">
              {metadata.tags.map((tag) => (
                <span key={tag} className="detail-tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {metadata.examples && metadata.examples.length > 0 && (
          <div className="details-section">
            <h5>Examples</h5>
            <div className="example-list">
              {metadata.examples.map((example, index) => (
                <button
                  key={index}
                  className="example-button"
                  onClick={() => onExampleClick(example)}
                >
                  📖 {example}
                </button>
              ))}
            </div>
          </div>
        )}

        {metadata.documentation && (
          <div className="details-section">
            <h5>Documentation</h5>
            <button
              className="documentation-button"
              onClick={() => onDocumentationClick(metadata.documentation!)}
            >
              📚 View Documentation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Utility Components

### VirtualizedGrid Component

```tsx
interface VirtualizedGridProps<T> {
  items: T[];
  itemHeight: number;
  itemWidth: number;
  overscan?: number;
  renderItem: (props: { index: number; style: React.CSSProperties }) => React.ReactNode;
}

function VirtualizedGrid<T>({
  items,
  itemHeight,
  itemWidth,
  overscan = 5,
  renderItem,
}: VirtualizedGridProps<T>) {
  // Implementation using react-window or similar
  // This handles efficient rendering of large lists
}
```

### HighlightText Component

```tsx
interface HighlightTextProps {
  text: string;
  highlight: string;
  className?: string;
}

function HighlightText({ text, highlight, className }: HighlightTextProps) {
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>;
  }

  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
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
```

## Custom Hooks

### useNodePalette Hook

```tsx
interface UseNodePaletteOptions {
  registry: EnhancedNodeRegistry;
  initialFilters?: Partial<NodeFilters>;
  initialSort?: SortOption;
  initialView?: ViewMode;
}

function useNodePalette({
  registry,
  initialFilters = {},
  initialSort = 'name',
  initialView = 'grid',
}: UseNodePaletteOptions) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<NodeFilters>({
    categories: [],
    tags: [],
    complexity: [],
    showFavoritesOnly: false,
    showRecentOnly: false,
    ...initialFilters,
  });
  const [sortBy, setSortBy] = useState<SortOption>(initialSort);
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Search and filter logic
  const filteredNodes = useMemo(() => {
    let nodes = searchQuery ? registry.searchNodes(searchQuery) : registry.getAllNodes();

    // Apply filters
    if (filters.categories.length > 0) {
      nodes = nodes.filter((node) => filters.categories.includes(node.category));
    }

    if (filters.tags.length > 0) {
      nodes = nodes.filter((node) => {
        const metadata = registry.getNodeMetadata(node.type);
        return metadata?.tags.some((tag) => filters.tags.includes(tag));
      });
    }

    // Apply sorting
    nodes = sortNodes(nodes, sortBy, registry);

    return nodes;
  }, [searchQuery, filters, sortBy, registry]);

  return {
    // State
    searchQuery,
    filters,
    sortBy,
    viewMode,
    selectedCategory,
    expandedCategories,

    // Data
    filteredNodes,
    categoryTree: registry.getCategoryTree(),
    totalNodeCount: registry.getNodeCount(),

    // Actions
    setSearchQuery,
    setFilters,
    setSortBy,
    setViewMode,
    setSelectedCategory,
    toggleCategoryExpansion: (category: string) => {
      setExpandedCategories((prev) => {
        const next = new Set(prev);
        if (next.has(category)) {
          next.delete(category);
        } else {
          next.add(category);
        }
        return next;
      });
    },
  };
}
```

### useNodeSearch Hook

```tsx
function useNodeSearch(registry: EnhancedNodeRegistry) {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.length > 0) {
        // Generate search suggestions based on query
        const allNodes = registry.getAllNodes();
        const suggestions = generateSearchSuggestions(query, allNodes);
        setSuggestions(suggestions);
      } else {
        setSuggestions([]);
      }
    }, 300),
    [registry]
  );

  const performSearch = useCallback(
    (query: string) => {
      // Add to search history
      setSearchHistory((prev) => {
        const updated = [query, ...prev.filter((q) => q !== query)];
        return updated.slice(0, 10); // Keep only last 10 searches
      });

      // Perform the search
      return registry.searchNodes(query);
    },
    [registry]
  );

  return {
    searchHistory,
    suggestions,
    performSearch,
    debouncedSearch,
  };
}
```

This comprehensive component specification provides the foundation for implementing the Enhanced Node Palette that will make all 868+ nodes discoverable and accessible through an intuitive, performant interface.
