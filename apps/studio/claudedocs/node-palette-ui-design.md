# Node Palette UI/UX Design Specification

## Overview

Design for a comprehensive Node Palette interface that makes the 868+ generated nodes discoverable and accessible in BrepFlow Studio. This design bridges the accessibility gap between the enhanced node registry system and the Studio UI.

## Current State Analysis

### Existing NodePanel.tsx

- **Limitations**: Static hardcoded categories (~50 nodes)
- **Categories**: 6 basic categories (Sketch, Solid, Boolean, Features, Transform, I/O)
- **Features**: Basic search, drag-drop, accordion categories
- **Gap**: 95% of generated nodes are invisible to users

### Enhanced Node Registry Available

- **Scale**: 868+ nodes across 24+ categories
- **Organization**: Hierarchical with categories and subcategories
- **Search**: Multi-index search (name, tags, description, category)
- **Metadata**: Rich metadata with descriptions, examples, documentation

## Design Goals

### Primary Objectives

1. **Discoverability**: Make all 868+ nodes easily discoverable
2. **Usability**: Intuitive navigation and search across large node library
3. **Performance**: Smooth interaction with large datasets
4. **Context**: Help users understand when and how to use nodes
5. **Efficiency**: Quick access to frequently used nodes

### User Experience Principles

- **Progressive Disclosure**: Show overview → details on demand
- **Intelligent Defaults**: Surface most relevant nodes first
- **Context Awareness**: Suggest nodes based on current workflow
- **Visual Hierarchy**: Clear information architecture
- **Accessibility**: Keyboard navigation, screen reader support

## UI Architecture

### Layout Structure

```
┌─ Node Palette Panel ─────────────────────────────────┐
│ ┌─ Search & Filter Bar ─────────────────────────────┐ │
│ │ [🔍 Search] [Filter▾] [Sort▾] [View▾]             │ │
│ └───────────────────────────────────────────────────┘ │
│ ┌─ Quick Access Toolbar ────────────────────────────┐ │
│ │ [★ Favorites] [📋 Recent] [🎯 Suggested]          │ │
│ └───────────────────────────────────────────────────┘ │
│ ┌─ Main Content Area ───────────────────────────────┐ │
│ │ ┌─ Category Tree ─┐ ┌─ Node Grid/List ──────────┐ │ │
│ │ │ 📂 Architecture  │ │ [Node] [Node] [Node]      │ │ │
│ │ │   ├─ Buildings   │ │ [Node] [Node] [Node]      │ │ │
│ │ │   └─ Structures  │ │ [Node] [Node] [Node]      │ │ │
│ │ │ 📂 Mechanical    │ │                           │ │ │
│ │ │ 📂 Analysis      │ │ Showing 24 of 156 nodes  │ │ │
│ │ └─────────────────┘ └───────────────────────────┘ │ │
│ └───────────────────────────────────────────────────┘ │
│ ┌─ Node Details Panel ──────────────────────────────┐ │
│ │ 📝 Description | 🏷️ Tags | 📖 Examples           │ │
│ └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```tsx
NodePalette
├── SearchFilterBar
│   ├── SearchInput (with auto-complete)
│   ├── FilterDropdown (category, tags, complexity)
│   ├── SortDropdown (name, category, usage, recent)
│   └── ViewToggle (grid, list, compact)
├── QuickAccessToolbar
│   ├── FavoritesSection
│   ├── RecentNodesSection
│   └── SuggestedNodesSection
├── MainContentArea
│   ├── CategoryTreeSidebar
│   │   ├── CategoryNode (recursive)
│   │   └── CategoryCounter
│   └── NodeDisplayArea
│       ├── NodeGrid (default view)
│       ├── NodeList (detailed view)
│       └── NodeCompact (minimal view)
└── NodeDetailsPanel
    ├── NodeDescription
    ├── NodeMetadata (tags, category, complexity)
    ├── NodeExamples
    └── NodeDocumentation
```

## Search & Discovery Features

### Advanced Search System

```tsx
interface SearchState {
  query: string;
  filters: {
    categories: string[];
    tags: string[];
    complexity: 'beginner' | 'intermediate' | 'advanced'[];
    recentlyUsed: boolean;
    favorites: boolean;
  };
  sorting: 'name' | 'category' | 'usage' | 'recent';
  view: 'grid' | 'list' | 'compact';
}
```

### Search Features

- **Fuzzy Search**: Typo-tolerant search across names and descriptions
- **Auto-complete**: Suggest completions as user types
- **Search Scopes**: Search within specific categories or across all
- **Saved Searches**: Save frequently used search queries
- **Search History**: Quick access to previous searches

### Filter & Sort Options

- **Category Filters**: Multi-select category filtering
- **Tag Filters**: Filter by functional tags (modeling, analysis, etc.)
- **Complexity Filters**: Beginner/Intermediate/Advanced
- **Usage Filters**: Recent, Favorites, Most Used
- **Sort Options**: Alphabetical, Category, Usage Frequency, Recent

## Node Display Modes

### Grid View (Default)

```
┌──────────┐ ┌──────────┐ ┌──────────┐
│   [🔧]   │ │   [📐]   │ │   [⚙️]   │
│   Fillet │ │  Extrude │ │  Boolean │
│  Feature │ │   Solid  │ │   Union  │
└──────────┘ └──────────┘ └──────────┘
```

- **Card-based**: Icon + name + category
- **Visual**: Emphasizes icons and visual recognition
- **Compact**: Shows more nodes per screen

### List View (Detailed)

```
🔧 Fillet                        Feature      Creates rounded edges
📐 Extrude                       Solid        Creates 3D solid from 2D profile
⚙️ Boolean Union                 Boolean      Combines multiple solids
```

- **Information-rich**: Icon + name + category + description
- **Scannable**: Easy to read through large lists
- **Searchable**: Better for text-based discovery

### Compact View (Minimal)

```
🔧 Fillet  📐 Extrude  ⚙️ Union  🔄 Revolve  📏 Measure
🎯 Array   🔀 Mirror   📊 Analyze 🏗️ Frame   ⚡ Optimize
```

- **Dense**: Maximum nodes visible at once
- **Quick**: Fast browsing and selection
- **Expert**: For users familiar with node library

## Interactive Features

### Drag & Drop Enhancement

- **Visual Feedback**: Enhanced drag states with preview
- **Drop Zones**: Visual indicators for valid drop targets
- **Smart Positioning**: Intelligent node placement on canvas
- **Connection Hints**: Show potential connections while dragging

### Node Preview System

- **Hover Preview**: Show node details on hover
- **Parameter Preview**: Preview common parameters
- **Usage Examples**: Show typical use cases
- **Connection Preview**: Show typical input/output connections

### Context-Aware Suggestions

```tsx
interface SuggestionContext {
  selectedNodes: NodeId[];
  canvasContext: 'empty' | 'sketch' | 'solid' | 'analysis';
  recentNodes: string[];
  userLevel: 'beginner' | 'intermediate' | 'expert';
}
```

## Category Tree Design

### Hierarchical Structure (24 Categories)

```
📂 Architecture (84 nodes)
   ├── 🏢 Buildings (24 nodes)
   ├── 🌉 Structures (31 nodes)
   └── 🏗️ Infrastructure (29 nodes)

📂 MechanicalEngineering (97 nodes)
   ├── ⚙️ Gears (18 nodes)
   ├── 🔩 Fasteners (23 nodes)
   ├── 🔧 Tools (19 nodes)
   └── 📐 Fixtures (37 nodes)

📂 Analysis (76 nodes)
   ├── 📊 Measurement (31 nodes)
   ├── 🔍 Inspection (24 nodes)
   └── 📈 Simulation (21 nodes)

[... 21 more categories]
```

### Tree Interactions

- **Expandable Nodes**: Click to expand/collapse categories
- **Node Counters**: Show node count per category
- **Lazy Loading**: Load subcategories on demand
- **Search Integration**: Highlight matching categories
- **Keyboard Navigation**: Arrow keys for tree navigation

## Accessibility & Usability

### Keyboard Support

- **Tab Navigation**: Through all interactive elements
- **Arrow Keys**: Category tree navigation
- **Enter/Space**: Select and expand items
- **Escape**: Close details, clear search
- **Quick Keys**: Ctrl+F for search, Ctrl+1/2/3 for view modes

### Screen Reader Support

- **Semantic HTML**: Proper heading structure and landmarks
- **ARIA Labels**: Descriptive labels for interactive elements
- **Live Regions**: Announce search results and state changes
- **Focus Management**: Clear focus indicators and logical flow

### Performance Optimizations

- **Virtualization**: Render only visible nodes for large lists
- **Debounced Search**: Prevent excessive search API calls
- **Lazy Loading**: Load node details on demand
- **Memoization**: Cache search results and node metadata
- **Web Workers**: Move heavy search operations off main thread

## Technical Implementation

### Data Integration

```tsx
interface NodePaletteProps {
  registry: EnhancedNodeRegistry;
  onNodeSelect: (nodeType: string, position: Point) => void;
  onFavoriteToggle: (nodeType: string) => void;
  recentNodes: string[];
  favoriteNodes: string[];
}

// Integration with enhanced registry
const useNodePalette = () => {
  const registry = EnhancedNodeRegistry.getInstance();
  const [searchState, setSearchState] = useState<SearchState>();
  const [selectedCategory, setSelectedCategory] = useState<string>();

  // Search integration
  const searchResults = useMemo(() => {
    return registry.searchNodes(searchState.query);
  }, [registry, searchState.query]);

  // Category tree data
  const categoryTree = useMemo(() => {
    return registry.getCategoryTree();
  }, [registry]);

  return { searchResults, categoryTree, ... };
};
```

### State Management

```tsx
interface NodePaletteState {
  search: SearchState;
  ui: {
    selectedCategory?: string;
    selectedNode?: string;
    view: 'grid' | 'list' | 'compact';
    showDetails: boolean;
    expandedCategories: Set<string>;
  };
  user: {
    recentNodes: string[];
    favoriteNodes: string[];
    searchHistory: string[];
    preferences: NodePalettePreferences;
  };
}
```

### Performance Considerations

- **Virtual Scrolling**: For large node lists (1000+ items)
- **Search Debouncing**: 300ms delay for search queries
- **Result Pagination**: Load 50 nodes at a time
- **Image Lazy Loading**: Load node icons as needed
- **Memory Management**: Cleanup unused node metadata

## Visual Design Tokens

### Layout

```scss
:root {
  --node-palette-width: 320px;
  --search-bar-height: 48px;
  --quick-access-height: 40px;
  --category-tree-width: 180px;
  --node-card-size: 80px;
  --node-list-height: 48px;
  --details-panel-height: 120px;
}
```

### Typography

```scss
--node-title-font: 'Inter', sans-serif;
--node-title-size: 12px;
--node-title-weight: 500;
--node-description-font: 'Inter', sans-serif;
--node-description-size: 11px;
--node-description-weight: 400;
```

### Colors

```scss
--node-card-bg: var(--color-surface-secondary);
--node-card-hover: var(--color-surface-tertiary);
--node-card-selected: var(--color-primary-100);
--node-icon-color: var(--color-primary-500);
--category-text: var(--color-text-secondary);
--search-highlight: var(--color-accent-200);
```

### Animations

```scss
@keyframes node-card-hover {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-2px);
  }
}

@keyframes category-expand {
  from {
    max-height: 0;
    opacity: 0;
  }
  to {
    max-height: 200px;
    opacity: 1;
  }
}

@keyframes search-highlight {
  from {
    background: transparent;
  }
  to {
    background: var(--search-highlight);
  }
}
```

## User Workflows

### Discovery Workflow

1. **Browse by Category**: Expand Architecture → Buildings
2. **Search by Function**: Type "gear" → see all gear-related nodes
3. **Filter by Context**: Show only "beginner" level nodes
4. **View Details**: Hover over node → see description + examples
5. **Add to Canvas**: Drag node → parameter dialog → place on canvas

### Power User Workflow

1. **Quick Access**: Use favorites toolbar for common nodes
2. **Keyboard Shortcuts**: Ctrl+F → search → arrow keys → Enter
3. **Recent Nodes**: Access recently used nodes from toolbar
4. **Saved Searches**: Quick access to complex filter combinations

### Learning Workflow

1. **Suggested Nodes**: Based on current canvas content
2. **Examples Integration**: Click examples → see usage patterns
3. **Documentation Links**: Link to detailed node documentation
4. **Tutorial Integration**: Guided discovery of node capabilities

## Implementation Phases

### Phase 1: Foundation (Week 1-2)

- [ ] Enhanced NodePanel component with registry integration
- [ ] Basic search functionality with auto-complete
- [ ] Category tree with expand/collapse
- [ ] Grid/List view modes

### Phase 2: Advanced Features (Week 3-4)

- [ ] Advanced filtering and sorting
- [ ] Favorites and recent nodes
- [ ] Node details panel with examples
- [ ] Context-aware suggestions

### Phase 3: Polish & Performance (Week 5-6)

- [ ] Virtual scrolling for large lists
- [ ] Keyboard navigation and accessibility
- [ ] Animation and micro-interactions
- [ ] Performance optimization and testing

### Phase 4: Intelligence (Week 7-8)

- [ ] Usage analytics integration
- [ ] Smart suggestions based on workflow
- [ ] Search result ranking and personalization
- [ ] Tutorial and onboarding integration

## Success Metrics

### Discoverability Metrics

- **Node Coverage**: % of 868+ nodes accessed by users
- **Search Success**: % of searches resulting in node usage
- **Category Usage**: Distribution of node usage across categories
- **Time to Discovery**: Average time to find needed node

### Usability Metrics

- **Task Completion**: % of users successfully adding nodes to canvas
- **User Satisfaction**: Subjective ratings of node palette experience
- **Error Rates**: Frequency of user errors in node selection
- **Learning Curve**: Time for new users to become proficient

### Performance Metrics

- **Load Time**: Time to render full node palette
- **Search Response**: Time from search query to results display
- **Memory Usage**: RAM consumption with full node library
- **Interaction Responsiveness**: Time for UI updates after user actions

## Future Enhancements

### Machine Learning Integration

- **Usage Prediction**: Predict next nodes based on current workflow
- **Personalized Recommendations**: Learn user preferences over time
- **Smart Categorization**: Auto-categorize user-created custom nodes

### Collaboration Features

- **Shared Favorites**: Team-based favorite node collections
- **Usage Analytics**: See popular nodes within organization
- **Custom Categories**: User-defined category organization

### Advanced Visualization

- **Node Relationship Graph**: Show how nodes connect and interact
- **Usage Flow Visualization**: Show common node usage patterns
- **3D Node Preview**: Preview node output in 3D before placement

This comprehensive design transforms the Node Palette from a basic 50-node interface into a powerful discovery tool that makes all 868+ nodes accessible and discoverable, bridging the gap between the enhanced node registry and the Studio UI.
