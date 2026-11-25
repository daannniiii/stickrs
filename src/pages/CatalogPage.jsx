import { useState, useMemo } from "react";
import FilterPanel from "../components/FilterPanel";
import ProductGrid from "../components/ProductGrid";
import { useCatalog } from "../context/CatalogContext";
import { useFilters } from "../hooks/useFilters";

export default function CatalogPage() {
  const { products, loading, error, getProductTags } = useCatalog();
  const { selectedCategories, toggleCategory, removeCategory, clearAll } =
    useFilters();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    if (selectedCategories.length === 0) return products;
    return products.filter((p) =>
      getProductTags(p).some((tag) => selectedCategories.includes(tag))
    );
  }, [products, selectedCategories, getProductTags]);

  return (
    <main className="catalog-layout">
      {/* Mobile filter toggle */}
      <div className="mobile-filter-bar">
        <button
          className="mobile-filter-btn"
          onClick={() => setSidebarOpen((p) => !p)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            viewBox="0 0 16 16"
          >
            <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7a.5.5 0 0 1-.5-.5zm-2-3a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z" />
          </svg>
          Filters
          {selectedCategories.length > 0 && (
            <span className="filter-badge">{selectedCategories.length}</span>
          )}
        </button>
        <span className="product-count-mobile">
          {filteredProducts.length} products
        </span>
      </div>

      <div className="catalog-body">
        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`sidebar-wrapper ${sidebarOpen ? "sidebar-open" : ""}`}>
          <FilterPanel
            selectedCategories={selectedCategories}
            onToggle={toggleCategory}
            onRemoveTag={removeCategory}
            onClearAll={clearAll}
          />
        </div>

        {/* Product section */}
        <section className="product-section">
          <div className="product-section-header">
            <h2 className="section-title">All Products</h2>
            <span className="product-count">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "product" : "products"}
            </span>
          </div>

          {loading ? (
            <div className="empty-state">
              <p>Loading catalog...</p>
            </div>
          ) : error ? (
            <div className="empty-state">
              <p className="form-error">{error}</p>
            </div>
          ) : (
            <ProductGrid products={filteredProducts} />
          )}
        </section>
      </div>
    </main>
  );
}
