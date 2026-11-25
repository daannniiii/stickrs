import { useState } from "react";
import { useCatalog } from "../context/CatalogContext";

const INITIAL_SHOW = 7;

export default function FilterPanel({
  selectedCategories,
  onToggle,
  onRemoveTag,
  onClearAll,
}) {
  const { categories } = useCatalog();
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const visibleCategories = showAll
    ? categories
    : categories.slice(0, INITIAL_SHOW);

  const activeTags = categories.filter((c) =>
    selectedCategories.includes(c.id)
  );

  return (
    <aside className="filter-panel">
      {/* Active filter tags */}
      {activeTags.length > 0 && (
        <div className="filter-tags-section">
          <div className="filter-tags-header">
            <span className="filter-label">Filter:</span>
            <button className="remove-all-btn" onClick={onClearAll}>
              Remove all
            </button>
          </div>
          <div className="filter-tags">
            {activeTags.map((tag) => (
              <span key={tag.id} className="filter-tag">
                Categories: {tag.label}
                <button
                  className="filter-tag-remove"
                  onClick={() => onRemoveTag(tag.id)}
                  aria-label={`Remove ${tag.label} filter`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <hr className="filter-divider" />
        </div>
      )}

      {/* Categories section */}
      <div className="filter-group">
        <button
          className="filter-group-header"
          onClick={() => setExpanded((p) => !p)}
        >
          <span>
            Categories
            {selectedCategories.length > 0 && (
              <span className="active-count"> ({selectedCategories.length})</span>
            )}
          </span>
          <span className={`chevron ${expanded ? "up" : "down"}`}>
            {expanded ? "∧" : "∨"}
          </span>
        </button>

        {expanded && (
          categories.length === 0 ? (
            <p className="cat-count" style={{ fontSize: "13px", padding: "4px 0" }}>
              No categories added yet.
            </p>
          ) : (
            <ul className="filter-list">
              {visibleCategories.map((cat) => {
                const checked = selectedCategories.includes(cat.id);
                return (
                  <li key={cat.id} className="filter-item">
                    <label className="filter-item-label">
                      <span
                        className={`custom-checkbox ${checked ? "checked" : ""}`}
                        onClick={() => onToggle(cat.id)}
                        role="checkbox"
                        aria-checked={checked}
                        tabIndex={0}
                        onKeyDown={(e) =>
                          (e.key === "Enter" || e.key === " ") && onToggle(cat.id)
                        }
                      >
                        {checked && (
                          <svg
                            viewBox="0 0 12 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="check-icon"
                          >
                            <path
                              d="M1 5L4.5 8.5L11 1"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </span>
                      <span
                        className={`cat-name ${checked ? "cat-name--active" : ""}`}
                        onClick={() => onToggle(cat.id)}
                      >
                        {cat.label}{" "}
                        <span className="cat-count">({cat.count})</span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )
        )}

        {expanded && categories.length > INITIAL_SHOW && (
          <button
            className="show-more-btn"
            onClick={() => setShowAll((p) => !p)}
          >
            {showAll ? "− Show less" : "+ Show more"}
          </button>
        )}
      </div>
    </aside>
  );
}
