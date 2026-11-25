import ProductCard from "./ProductCard";

export default function ProductGrid({ products }) {
  if (products.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try adjusting or clearing your filters.</p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
