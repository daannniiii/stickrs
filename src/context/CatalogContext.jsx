import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

const CatalogContext = createContext(null);

function getProductTags(product) {
  const set = new Set();
  if (product.category) set.add(product.category);
  if (Array.isArray(product.tags)) {
    product.tags.forEach((t) => t && set.add(t));
  }
  return Array.from(set);
}

async function parseJsonSafe(res) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      text?.slice(0, 140) || `Server returned HTTP ${res.status} (non-JSON response)`
    );
  }
}

export function CatalogProvider({ children }) {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshCatalog = useCallback(async () => {
    setError("");
    try {
      const [prodRes, tagRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/tags"),
      ]);
      const prodData = await parseJsonSafe(prodRes);
      const tagData = await parseJsonSafe(tagRes);

      if (!prodRes.ok) throw new Error(prodData.error || "Failed to load products");
      if (!tagRes.ok) throw new Error(tagData.error || "Failed to load tags");

      setProducts(prodData.products || []);
      setCategories(tagData.tags || []);
    } catch (err) {
      setError(err.message || "Failed to load catalog from database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCatalog();
  }, [refreshCatalog]);

  const authHeaders = useCallback(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const addProduct = useCallback(
    async ({ name, image, inventoryCount = 0, tags = [] }) => {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name, image, inventoryCount, tags }),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data.error || "Failed to add product");
      await refreshCatalog();
      return data.product;
    },
    [authHeaders, refreshCatalog]
  );

  const updateProduct = useCallback(
    async (id, updates) => {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ id, ...updates }),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data.error || "Failed to update product");
      await refreshCatalog();
      return data.product;
    },
    [authHeaders, refreshCatalog]
  );

  const deleteProduct = useCallback(
    async (id) => {
      const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data.error || "Failed to delete product");
      await refreshCatalog();
    },
    [authHeaders, refreshCatalog]
  );

  const addCategory = useCallback(
    async (label) => {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ label }),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data.error || "Failed to create tag");
      await refreshCatalog();
      return data.tag.id;
    },
    [authHeaders, refreshCatalog]
  );

  const renameCategory = useCallback(
    async (id, label) => {
      const res = await fetch("/api/tags", {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ id, label }),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data.error || "Failed to rename tag");
      await refreshCatalog();
      return data.tag;
    },
    [authHeaders, refreshCatalog]
  );

  const deleteCategory = useCallback(
    async (id) => {
      const res = await fetch(`/api/tags?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await parseJsonSafe(res);
      if (!res.ok) throw new Error(data.error || "Failed to delete tag");
      await refreshCatalog();
    },
    [authHeaders, refreshCatalog]
  );

  return (
    <CatalogContext.Provider
      value={{
        products,
        categories,
        loading,
        error,
        getProductTags,
        refreshCatalog,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        renameCategory,
        deleteCategory,
      }}
    >
      {children}
    </CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used inside CatalogProvider");
  return ctx;
}
