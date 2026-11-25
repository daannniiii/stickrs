import { useState, useCallback } from "react";

export function useFilters() {
  const [selectedCategories, setSelectedCategories] = useState([]);

  const toggleCategory = useCallback((id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }, []);

  const removeCategory = useCallback((id) => {
    setSelectedCategories((prev) => prev.filter((c) => c !== id));
  }, []);

  const clearAll = useCallback(() => {
    setSelectedCategories([]);
  }, []);

  return { selectedCategories, toggleCategory, removeCategory, clearAll };
}
