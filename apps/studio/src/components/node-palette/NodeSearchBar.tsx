import React, { useState, useRef, useEffect } from 'react';
import { NodeFilters, SortOption, ViewMode } from '../../hooks/useNodePalette';

interface NodeSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: NodeFilters;
  onFiltersChange: (filters: NodeFilters) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  availableCategories: string[];
  availableTags: string[];
  resultCount: number;
  totalCount: number;
  isSearching?: boolean;
  disabled?: boolean;
  statusText?: string;
}

export function NodeSearchBar({
  searchTerm,
  onSearchChange,
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  availableCategories,
  availableTags,
  resultCount,
  totalCount,
  isSearching = false,
  disabled = false,
  statusText,
}: NodeSearchBarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setIsFilterOpen(false);
        setIsSortOpen(false);
        setIsViewOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (disabled) {
      setIsFilterOpen(false);
      setIsSortOpen(false);
      setIsViewOpen(false);
    }
  }, [disabled]);

  const handleClearSearch = () => {
    if (disabled) return;
    onSearchChange('');
    searchInputRef.current?.focus();
  };

  const handleFilterChange = (key: keyof NodeFilters, value: unknown) => {
    onFiltersChange({ ...filters, [key]: value } as NodeFilters);
  };

  const toggleCategoryFilter = (category: string) => {
    const categories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    handleFilterChange('categories', categories);
  };

  const toggleTagFilter = (tag: string) => {
    const tags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    handleFilterChange('tags', tags);
  };

  const hasActiveFilters =
    !disabled &&
    (filters.categories.length > 0 ||
      filters.tags.length > 0 ||
      filters.complexity.length > 0 ||
      filters.showFavoritesOnly ||
      filters.showRecentOnly);

  const placeholderText = disabled
    ? statusText || 'Node catalogue is initializing…'
    : `Search ${totalCount} nodes...`;

  const resultSummary = statusText
    ? statusText
    : searchTerm || hasActiveFilters
      ? `Showing ${resultCount} of ${totalCount} nodes`
      : `${totalCount} nodes available`;

  return (
    <div className={`node-search-bar ${disabled ? 'disabled' : ''}`}>
      <div className="search-input-container">
        <div className="search-icon">
          {isSearching ? <div className="search-spinner" /> : <span>🔍</span>}
        </div>
        <input
          ref={searchInputRef}
          type="text"
          className="search-input"
          placeholder={placeholderText}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={disabled}
        />
        {searchTerm && (
          <button
            className="search-clear"
            onClick={handleClearSearch}
            title="Clear search"
            disabled={disabled}
          >
            ×
          </button>
        )}
      </div>

      <div className="search-controls">
        <div className="dropdown-container">
          <button
            className={`control-button ${hasActiveFilters ? 'active' : ''}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            disabled={disabled}
          >
            Filter{' '}
            {hasActiveFilters && (
              <span className="filter-count">
                {filters.categories.length + filters.tags.length + filters.complexity.length}
              </span>
            )}
            <span className="dropdown-arrow">▾</span>
          </button>

          {isFilterOpen && !disabled && (
            <div className="dropdown-menu filter-dropdown">
              <div className="dropdown-section">
                <h4>Categories</h4>
                <div className="filter-options">
                  {availableCategories.slice(0, 8).map((category) => (
                    <label key={category} className="filter-option">
                      <input
                        type="checkbox"
                        checked={filters.categories.includes(category)}
                        onChange={() => toggleCategoryFilter(category)}
                        disabled={disabled}
                      />
                      <span>{category}</span>
                    </label>
                  ))}
                  {availableCategories.length > 8 && (
                    <div className="more-filters">+{availableCategories.length - 8} more</div>
                  )}
                </div>
              </div>

              <div className="dropdown-section">
                <h4>Complexity</h4>
                <div className="filter-options">
                  {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                    <label key={level} className="filter-option">
                      <input
                        type="checkbox"
                        checked={filters.complexity.includes(level)}
                        onChange={(e) => {
                          const complexity = e.target.checked
                            ? [...filters.complexity, level]
                            : filters.complexity.filter((c) => c !== level);
                          handleFilterChange('complexity', complexity);
                        }}
                        disabled={disabled}
                      />
                      <span className="capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="dropdown-section">
                <h4>Tags</h4>
                <div className="filter-options">
                  {availableTags.slice(0, 10).map((tag) => (
                    <label key={tag} className="filter-option">
                      <input
                        type="checkbox"
                        checked={filters.tags.includes(tag)}
                        onChange={() => toggleTagFilter(tag)}
                        disabled={disabled}
                      />
                      <span>{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="dropdown-section">
                <h4>Special</h4>
                <div className="filter-options">
                  <label className="filter-option">
                    <input
                      type="checkbox"
                      checked={filters.showFavoritesOnly}
                      onChange={(e) => handleFilterChange('showFavoritesOnly', e.target.checked)}
                      disabled={disabled}
                    />
                    <span>⭐ Favorites only</span>
                  </label>
                  <label className="filter-option">
                    <input
                      type="checkbox"
                      checked={filters.showRecentOnly}
                      onChange={(e) => handleFilterChange('showRecentOnly', e.target.checked)}
                      disabled={disabled}
                    />
                    <span>🕐 Recent only</span>
                  </label>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="dropdown-actions">
                  <button
                    className="clear-filters-btn"
                    onClick={() =>
                      onFiltersChange({
                        categories: [],
                        tags: [],
                        complexity: [],
                        showFavoritesOnly: false,
                        showRecentOnly: false,
                      })
                    }
                    disabled={disabled}
                  >
                    Clear All
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="dropdown-container">
          <button
            className="control-button"
            onClick={() => setIsSortOpen(!isSortOpen)}
            disabled={disabled}
          >
            Sort:{' '}
            {sortBy === 'name'
              ? 'Name'
              : sortBy === 'category'
                ? 'Category'
                : sortBy === 'popularity'
                  ? 'Popularity'
                  : sortBy === 'recent'
                    ? 'Recent'
                    : 'Relevance'}
            <span className="dropdown-arrow">▾</span>
          </button>

          {isSortOpen && !disabled && (
            <div className="dropdown-menu sort-dropdown">
              {[
                { value: 'name', label: 'Name' },
                { value: 'category', label: 'Category' },
                { value: 'popularity', label: 'Popularity' },
                { value: 'recent', label: 'Recent' },
                { value: 'relevance', label: 'Relevance' },
              ].map((option) => (
                <button
                  key={option.value}
                  className={`dropdown-option ${sortBy === option.value ? 'selected' : ''}`}
                  onClick={() => {
                    onSortChange(option.value as SortOption);
                    setIsSortOpen(false);
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="dropdown-container">
          <button
            className="control-button"
            onClick={() => setIsViewOpen(!isViewOpen)}
            disabled={disabled}
          >
            View: {viewMode === 'grid' ? '⊞ Grid' : viewMode === 'list' ? '☰ List' : '≡ Compact'}
            <span className="dropdown-arrow">▾</span>
          </button>

          {isViewOpen && !disabled && (
            <div className="dropdown-menu view-dropdown">
              {[
                { value: 'grid', label: '⊞ Grid', desc: 'Visual cards' },
                { value: 'list', label: '☰ List', desc: 'Detailed rows' },
                { value: 'compact', label: '≡ Compact', desc: 'Dense layout' },
              ].map((option) => (
                <button
                  key={option.value}
                  className={`dropdown-option ${viewMode === option.value ? 'selected' : ''}`}
                  onClick={() => {
                    onViewModeChange(option.value as ViewMode);
                    setIsViewOpen(false);
                  }}
                >
                  <div className="view-option">
                    <span>{option.label}</span>
                    <small>{option.desc}</small>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="search-status">
        <span className="result-count">{resultSummary}</span>
      </div>
    </div>
  );
}
