import { useMemo, useState } from 'react';
import { useResilientNodeDiscovery } from './useResilientNodeDiscovery';
import { useCuratedNodeFilter } from './useCuratedNodeFilter';
import type { CurationMode } from './useCuratedNodeFilter';

export interface NodeFilters {
  categories: string[];
  tags: string[];
  complexity: ('beginner' | 'intermediate' | 'advanced')[];
  showFavoritesOnly: boolean;
  showRecentOnly: boolean;
}

export type SortOption = 'name' | 'category' | 'recent' | 'popularity';
export type ViewMode = 'grid' | 'list' | 'compact';

export interface UseNodePaletteOptions {
  initialFilters?: Partial<NodeFilters>;
  initialSort?: SortOption;
  initialView?: ViewMode;
  enableAdvancedFeatures?: boolean;
  initialCurationMode?: CurationMode;
}

export function useNodePalette({
  initialFilters = {},
  initialSort = 'name',
  initialView = 'list',
  enableAdvancedFeatures = true,
  initialCurationMode = 'curated',
}: UseNodePaletteOptions = {}) {
  const {
    nodes: discoveredNodes,
    categoryTree,
    searchNodes,
    discoveryStatus,
    errors,
    isReady,
    nodeCount,
  } = useResilientNodeDiscovery();

  const { curationMode, setCurationMode, filterNodes, curatedStats, isFiltering } =
    useCuratedNodeFilter({ initialMode: initialCurationMode });

  const isCatalogReady = discoveryStatus === 'complete';
  const isCatalogFallback = discoveryStatus === 'fallback';
  const isCatalogInitializing = discoveryStatus === 'discovering';

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<NodeFilters>({
    categories: [],
    tags: [],
    complexity: [],
    showFavoritesOnly: false,
    showRecentOnly: false,
    ...initialFilters,
  });

  const [sortBy, setSortBy] = useState(initialSort);
  const [viewMode, setViewMode] = useState(initialView);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const registry = useMemo(
    () => ({
      getNodeMetadata: (nodeType: string) => {
        const node = discoveredNodes.find((n) => n.type === nodeType);
        return (
          node?.metadata || {
            label: nodeType.split('::').pop() || nodeType,
            description: `${nodeType} node for CAD operations`,
            category: nodeType.split('::')[0] || 'General',
            tags: [nodeType.split('::')[0]?.toLowerCase() || 'general'],
            complexity: 'beginner' as const,
          }
        );
      },
    }),
    [discoveredNodes]
  );

  const allCategories = useMemo(() => {
    if (!isCatalogReady) return [] as string[];
    return Object.keys(categoryTree);
  }, [categoryTree, isCatalogReady]);

  const allTags = useMemo(() => {
    if (!isCatalogReady) return [] as string[];
    const tags = new Set<string>();
    discoveredNodes.forEach((node) => {
      node.metadata?.tags?.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [discoveredNodes, isCatalogReady]);

  const statistics = useMemo(() => {
    const nodesByCategory = isCatalogReady
      ? Object.fromEntries(
          Object.entries(categoryTree).map(([cat, data]) => [cat, data.nodes.length])
        )
      : {};

    return {
      totalNodes: isCatalogReady ? nodeCount : 0,
      rawNodeCount: nodeCount,
      totalCategories: isCatalogReady ? allCategories.length : 0,
      nodesByCategory,
      discoveryStatus,
      discoveryErrors: errors,
      isCatalogReady,
      isCatalogFallback,
    };
  }, [
    isCatalogReady,
    isCatalogFallback,
    nodeCount,
    categoryTree,
    allCategories.length,
    discoveryStatus,
    errors,
  ]);

  const filteredNodes = useMemo(() => {
    if (!isReady || !isCatalogReady || discoveredNodes.length === 0) {
      return [] as typeof discoveredNodes;
    }

    // Start with search results or all nodes
    let filtered = searchQuery.trim() ? searchNodes(searchQuery) : [...discoveredNodes];

    // Apply curation filter first (reduces set significantly)
    filtered = filterNodes(filtered);

    if (selectedCategory) {
      filtered = filtered.filter((node) => {
        const nodeCategory = node.metadata?.category || node.category;
        return nodeCategory === selectedCategory;
      });
    }

    if (filters.categories.length > 0) {
      filtered = filtered.filter((node) => {
        const nodeCategory = node.metadata?.category || node.category;
        return filters.categories.includes(nodeCategory);
      });
    }

    if (filters.tags.length > 0) {
      filtered = filtered.filter((node) => {
        const nodeTags = node.metadata?.tags || [];
        return filters.tags.some((tag) => nodeTags.includes(tag));
      });
    }

    if (filters.complexity.length > 0) {
      filtered = filtered.filter((node) => {
        const nodeComplexity = node.metadata?.complexity || 'beginner';
        return filters.complexity.includes(nodeComplexity);
      });
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name': {
          const aLabel = a.metadata?.label || a.type;
          const bLabel = b.metadata?.label || b.type;
          return aLabel.localeCompare(bLabel);
        }
        case 'category': {
          const aCategory = a.metadata?.category || a.category;
          const bCategory = b.metadata?.category || b.category;
          return aCategory.localeCompare(bCategory);
        }
        case 'recent':
        case 'popularity':
          return 0;
        default: {
          const aLabel = a.metadata?.label || a.type;
          const bLabel = b.metadata?.label || b.type;
          return aLabel.localeCompare(bLabel);
        }
      }
    });

    return filtered;
  }, [
    isReady,
    isCatalogReady,
    discoveredNodes,
    searchQuery,
    searchNodes,
    selectedCategory,
    filters,
    sortBy,
    filterNodes,
  ]);

  const filteredCount = filteredNodes.length;
  const totalNodeCount = isCatalogReady ? nodeCount : 0;
  const effectiveCategoryTree = isCatalogReady ? categoryTree : {};

  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      categories: [],
      tags: [],
      complexity: [],
      showFavoritesOnly: false,
      showRecentOnly: false,
    });
    setSelectedCategory(null);
  };

  return {
    registry,
    isReady,
    discoveryStatus,
    discoveryErrors: errors,
    isCatalogReady,
    isCatalogFallback,
    isCatalogInitializing,
    categoryTree: effectiveCategoryTree,
    allCategories,
    allTags,
    statistics,
    searchQuery,
    filters,
    sortBy,
    viewMode,
    selectedCategory,
    expandedCategories,
    filteredNodes,
    filteredCount,
    totalNodeCount,
    curationMode,
    curatedStats,
    isFiltering,
    setSearchQuery,
    setFilters,
    setSortBy,
    setViewMode,
    setSelectedCategory,
    toggleCategoryExpansion,
    clearFilters,
    setCurationMode,
  };
}
