import { useState } from "react";

export default function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="product-card">
      <div className="product-image-wrapper">
        {imgError ? (
          <div className="product-image-placeholder">
            <span>🖼️</span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            className="product-image"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className="product-info">
        <p className="product-name">{product.name}</p>
      </div>
    </div>
  );
}
