import React, { useState, useMemo } from 'react';
import {
  TEMPLATE_REGISTRY,
  getTemplatesByDifficulty,
  getTemplatesByCategory,
  getRecommendedTemplates,
  type Template,
} from '../../templates/template-registry';
import './TemplateGallery.css';

export interface TemplateGalleryProps {
  onTemplateSelect: (template: Template) => void;
  onClose?: () => void;
  showRecommended?: boolean;
}

type DifficultyFilter = 'all' | 'beginner' | 'intermediate' | 'advanced';
type CategoryFilter = 'all' | 'mechanical' | 'architectural' | 'product' | 'learning';

/**
 * TemplateGallery Component
 *
 * Displays available example templates organized by difficulty and category.
 * Users can browse, filter, and load templates with one click.
 */
export function TemplateGallery({
  onTemplateSelect,
  onClose,
  showRecommended = true,
}: TemplateGalleryProps) {
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Filter templates based on current filters
  const filteredTemplates = useMemo(() => {
    let templates = TEMPLATE_REGISTRY;

    // Apply difficulty filter
    if (difficultyFilter !== 'all') {
      templates = getTemplatesByDifficulty(difficultyFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      templates = templates.filter((t) => t.category === categoryFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.name.toLowerCase().includes(lowerQuery) ||
          t.description.toLowerCase().includes(lowerQuery) ||
          t.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
      );
    }

    return templates;
  }, [difficultyFilter, categoryFilter, searchQuery]);

  const recommendedTemplates = useMemo(() => getRecommendedTemplates(), []);

  const handleTemplateClick = (template: Template) => {
    setSelectedTemplate(template);
  };

  const handleLoadTemplate = () => {
    if (selectedTemplate) {
      onTemplateSelect(selectedTemplate);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'var(--difficulty-beginner, #4caf50)';
      case 'intermediate':
        return 'var(--difficulty-intermediate, #ff9800)';
      case 'advanced':
        return 'var(--difficulty-advanced, #f44336)';
      default:
        return 'var(--text-secondary, #666)';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '🌱';
      case 'intermediate':
        return '⚙️';
      case 'advanced':
        return '🚀';
      default:
        return '📦';
    }
  };

  return (
    <div className="template-gallery">
      {/* Header */}
      <div className="gallery-header">
        <div className="header-content">
          <h2 className="gallery-title">Example Templates</h2>
          <p className="gallery-subtitle">
            Start with a ready-made example or learn from curated templates
          </p>
        </div>
        {onClose && (
          <button className="close-button" onClick={onClose} title="Close gallery">
            ✕
          </button>
        )}
      </div>

      {/* Recommended Section */}
      {showRecommended &&
        !searchQuery &&
        difficultyFilter === 'all' &&
        categoryFilter === 'all' && (
          <div className="recommended-section">
            <h3 className="section-title">
              <span className="title-icon">⭐</span>
              Recommended for Getting Started
            </h3>
            <div className="template-grid recommended-grid">
              {recommendedTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                  onClick={() => handleTemplateClick(template)}
                >
                  <div className="template-header">
                    <div
                      className="template-difficulty"
                      style={{ color: getDifficultyColor(template.difficulty) }}
                    >
                      <span className="difficulty-icon">
                        {getDifficultyIcon(template.difficulty)}
                      </span>
                      <span className="difficulty-label">{template.difficulty}</span>
                    </div>
                    <div className="template-time">⏱️ {template.estimatedTime}</div>
                  </div>
                  <h4 className="template-name">{template.name}</h4>
                  <p className="template-description">{template.description}</p>
                  <div className="template-tags">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Filters */}
      <div className="gallery-filters">
        <div className="filter-group">
          <label className="filter-label">Difficulty</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${difficultyFilter === 'all' ? 'active' : ''}`}
              onClick={() => setDifficultyFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${difficultyFilter === 'beginner' ? 'active' : ''}`}
              onClick={() => setDifficultyFilter('beginner')}
            >
              🌱 Beginner
            </button>
            <button
              className={`filter-btn ${difficultyFilter === 'intermediate' ? 'active' : ''}`}
              onClick={() => setDifficultyFilter('intermediate')}
            >
              ⚙️ Intermediate
            </button>
            <button
              className={`filter-btn ${difficultyFilter === 'advanced' ? 'active' : ''}`}
              onClick={() => setDifficultyFilter('advanced')}
            >
              🚀 Advanced
            </button>
          </div>
        </div>

        <div className="filter-group">
          <label className="filter-label">Category</label>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${categoryFilter === 'all' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('all')}
            >
              All
            </button>
            <button
              className={`filter-btn ${categoryFilter === 'learning' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('learning')}
            >
              📚 Learning
            </button>
            <button
              className={`filter-btn ${categoryFilter === 'mechanical' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('mechanical')}
            >
              ⚙️ Mechanical
            </button>
            <button
              className={`filter-btn ${categoryFilter === 'product' ? 'active' : ''}`}
              onClick={() => setCategoryFilter('product')}
            >
              📦 Product
            </button>
          </div>
        </div>

        <div className="search-group">
          <input
            type="text"
            className="search-input"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* All Templates Grid */}
      <div className="all-templates-section">
        <h3 className="section-title">All Templates ({filteredTemplates.length})</h3>
        {filteredTemplates.length === 0 ? (
          <div className="no-templates">
            <div className="no-templates-icon">🔍</div>
            <p>No templates found matching your filters.</p>
            <button
              className="reset-filters-btn"
              onClick={() => {
                setDifficultyFilter('all');
                setCategoryFilter('all');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="template-grid">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                onClick={() => handleTemplateClick(template)}
              >
                <div className="template-header">
                  <div
                    className="template-difficulty"
                    style={{ color: getDifficultyColor(template.difficulty) }}
                  >
                    <span className="difficulty-icon">
                      {getDifficultyIcon(template.difficulty)}
                    </span>
                    <span className="difficulty-label">{template.difficulty}</span>
                  </div>
                  <div className="template-time">⏱️ {template.estimatedTime}</div>
                </div>
                <h4 className="template-name">{template.name}</h4>
                <p className="template-description">{template.description}</p>
                <div className="template-meta">
                  <span className="node-count">{template.nodeCount} nodes</span>
                </div>
                <div className="template-tags">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Template Details Panel */}
      {selectedTemplate && (
        <div className="template-details-panel">
          <div className="details-header">
            <h3>{selectedTemplate.name}</h3>
            <button className="close-details-btn" onClick={() => setSelectedTemplate(null)}>
              ✕
            </button>
          </div>
          <div className="details-content">
            <p className="details-description">{selectedTemplate.description}</p>

            <div className="details-meta">
              <div className="meta-item">
                <strong>Difficulty:</strong> {getDifficultyIcon(selectedTemplate.difficulty)}{' '}
                {selectedTemplate.difficulty}
              </div>
              <div className="meta-item">
                <strong>Time:</strong> ⏱️ {selectedTemplate.estimatedTime}
              </div>
              <div className="meta-item">
                <strong>Nodes:</strong> {selectedTemplate.nodeCount}
              </div>
            </div>

            {selectedTemplate.learningObjectives && (
              <div className="learning-objectives">
                <strong>What you'll learn:</strong>
                <ul>
                  {selectedTemplate.learningObjectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="nodes-used">
              <strong>Nodes used:</strong>
              <div className="node-chips">
                {selectedTemplate.usesNodes.map((node) => (
                  <span key={node} className="node-chip">
                    {node.split('::').pop()}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="details-actions">
            <button className="load-template-btn" onClick={handleLoadTemplate}>
              Load Template
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
