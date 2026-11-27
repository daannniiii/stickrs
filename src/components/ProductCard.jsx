import { useState, useRef } from "react";
import { useCatalog } from "../context/CatalogContext";

export default function ProductCard({ product, onSelect }) {
  const [imgError, setImgError] = useState(false);
  const { categories, getProductTags } = useCatalog();
  const productTags = getProductTags(product);

  const longPressTimerRef = useRef(null);
  const isLongPressRef = useRef(false);

  const handleTouchStart = () => {
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onSelect?.(product);
    }, 450);
  };

  const clearLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleClick = () => {
    // If it was already triggered by long press, skip regular click
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    onSelect?.(product);
  };

  return (
    <div
      className="product-card"
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={clearLongPress}
      onTouchMove={clearLongPress}
      onTouchCancel={clearLongPress}
      onContextMenu={(e) => {
        // Prevent default mobile download/context menu and open zoom instead
        e.preventDefault();
        onSelect?.(product);
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(product);
        }
      }}
    >
      <div className="product-image-wrapper">
        {imgError ? (
          <div className="product-image-placeholder">
            <span>🖼️</span>
          </div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            className="product-image no-save-img"
            loading="lazy"
            draggable={false}
            onError={() => setImgError(true)}
          />
        )}
      </div>
      <div className="product-info">
        <p className="product-name">{product.name}</p>
        {productTags.length > 0 && (
          <div className="product-card-tags">
            {productTags.map((tid) => {
              const cat = categories.find((c) => c.id === tid);
              return (
                <span key={tid} className="badge-tag">
                  {cat ? cat.label : tid}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
