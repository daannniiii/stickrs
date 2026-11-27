import { useState, useEffect, useRef, useCallback } from "react";
import { useCatalog } from "../context/CatalogContext";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

export default function ImageLightbox({ product, onClose }) {
  const { categories, getProductTags } = useCatalog();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const longPressTimerRef = useRef(null);
  const isLongPressRef = useRef(false);

  const resetView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback((step = ZOOM_STEP) => {
    setZoom((z) => Math.min(MAX_ZOOM, +(z + step).toFixed(2)));
  }, []);

  const zoomOut = useCallback((step = ZOOM_STEP) => {
    setZoom((z) => {
      const next = Math.max(MIN_ZOOM, +(z - step).toFixed(2));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "+" || e.key === "=") zoomIn();
      if (e.key === "-") zoomOut();
      if (e.key === "0") resetView();
    };
    window.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, zoomIn, zoomOut, resetView]);

  const handleWheel = (e) => {
    e.preventDefault();
    if (e.deltaY < 0) zoomIn();
    else zoomOut();
  };

  const handlePointerDown = (e) => {
    // Check for touch long-press to zoom further instead of context menu
    if (e.pointerType === "touch") {
      isLongPressRef.current = false;
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        // Holding zooms further (e.g. +1.0 or reset if at MAX)
        setZoom((z) => (z >= MAX_ZOOM ? 1.5 : Math.min(MAX_ZOOM, +(z + 1.0).toFixed(2))));
      }, 450);
    }

    if (zoom <= 1) return;
    setDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  };

  const handlePointerMove = (e) => {
    // If pointer moves significantly, cancel long press
    if (longPressTimerRef.current) {
      const dist = Math.hypot(
        e.clientX - dragStartRef.current.x,
        e.clientY - dragStartRef.current.y
      );
      if (dist > 10) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }

    if (!dragging) return;
    setPan({
      x: dragStartRef.current.panX + (e.clientX - dragStartRef.current.x),
      y: dragStartRef.current.panY + (e.clientY - dragStartRef.current.y),
    });
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    setDragging(false);
  };

  const handleDoubleClick = () => {
    if (zoom > 1) resetView();
    else setZoom(2);
  };

  const handleContextMenu = (e) => {
    // Block the browser context menu / "Download image" prompt and zoom further
    e.preventDefault();
    setZoom((z) => (z >= MAX_ZOOM ? 1.5 : Math.min(MAX_ZOOM, +(z + 1.0).toFixed(2))));
  };

  if (!product) return null;

  const productTags = getProductTags(product);

  return (
    <div
      className="lightbox-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      {/* Top Bar */}
      <div className="lightbox-topbar">
        <div className="lightbox-title-group">
          <h3 className="lightbox-title">{product.name}</h3>
          {productTags.length > 0 && (
            <div className="lightbox-tags">
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
          <p className="lightbox-title">
            You can order only on our
            <a href="https://www.instagram.com/stickr.uet"> instagram page</a>
            </p>
        </div>

        <div className="lightbox-controls">
          <button
            type="button"
            className="lightbox-btn"
            onClick={() => zoomOut()}
            disabled={zoom <= MIN_ZOOM}
            title="Zoom out (-)"
          >
            −
          </button>
          <span className="lightbox-zoom-label">{Math.round(zoom * 100)}%</span>
          <button
            type="button"
            className="lightbox-btn"
            onClick={() => zoomIn()}
            disabled={zoom >= MAX_ZOOM}
            title="Zoom in (+)"
          >
            +
          </button>
          <button
            type="button"
            className="lightbox-btn"
            onClick={resetView}
            disabled={zoom === 1 && pan.x === 0 && pan.y === 0}
            title="Reset zoom (0)"
          >
            Reset
          </button>
          <button
            type="button"
            className="lightbox-btn lightbox-close"
            onClick={onClose}
            aria-label="Close fullscreen view"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Image Stage */}
      <div
        className={`lightbox-stage ${zoom > 1 ? "is-zoomed" : ""} ${
          dragging ? "is-dragging" : ""
        }`}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
        onClick={(e) => {
          if (isLongPressRef.current) {
            isLongPressRef.current = false;
            return;
          }
          if (e.target === e.currentTarget && zoom === 1) onClose();
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          className="lightbox-image no-save-img"
          draggable={false}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        />
      </div>

      <p className="lightbox-hint">
        Hold on image or double-click to zoom in • Drag to pan • Esc to close • 
        Our
        <a href="https://www.instagram.com/stickr.uet"> instagram page</a>
      </p>
    </div>
  );
}
