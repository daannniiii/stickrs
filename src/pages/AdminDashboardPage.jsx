import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCatalog } from "../context/CatalogContext";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUpload";

export default function AdminDashboardPage() {
  const { isAdmin, token, logout } = useAuth();
  const {
    products,
    categories,
    loading,
    getProductTags,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    renameCategory,
    deleteCategory,
  } = useCatalog();
  const navigate = useNavigate();

  // Add-product form state
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [inventoryCount, setInventoryCount] = useState(1);
  const [selectedTags, setSelectedTags] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // New-tag & rename-tag state
  const [newTagName, setNewTagName] = useState("");
  const [tagError, setTagError] = useState("");
  const [renamingTagId, setRenamingTagId] = useState(null);
  const [renameTagLabel, setRenameTagLabel] = useState("");

  // Product list search & inline editing
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editInventory, setEditInventory] = useState(0);
  const [editTags, setEditTags] = useState([]);

  useEffect(() => {
    if (!isAdmin) navigate("/admin/login", { replace: true });
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const { url, publicId } = await uploadToCloudinary(file, token);
      setImageUrl(url);
      setImagePublicId(publicId);
    } catch (err) {
      setUploadError(err.message || "Failed to upload image to Cloudinary.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteUploadedImage = async () => {
    if (!imageUrl) return;
    setUploadError("");
    setDeletingImage(true);
    try {
      await deleteFromCloudinary({ publicId: imagePublicId, imageUrl }, token);
      setImageUrl("");
      setImagePublicId("");
    } catch (err) {
      setUploadError(err.message || "Failed to delete image from Cloudinary.");
    } finally {
      setDeletingImage(false);
    }
  };

  const toggleTagSelection = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const handleCreateTag = async (e) => {
    e.preventDefault();
    setTagError("");
    if (!newTagName.trim()) return;
    try {
      const id = await addCategory(newTagName);
      setSelectedTags((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setNewTagName("");
    } catch (err) {
      setTagError(err.message || "Failed to create tag.");
    }
  };

  const startRenameTag = (cat) => {
    setTagError("");
    setRenamingTagId(cat.id);
    setRenameTagLabel(cat.label);
  };

  const handleSaveRenameTag = async (e, id) => {
    e.preventDefault();
    setTagError("");
    if (!renameTagLabel.trim()) return;
    try {
      await renameCategory(id, renameTagLabel);
      setRenamingTagId(null);
      setRenameTagLabel("");
    } catch (err) {
      setTagError(err.message || "Failed to rename tag.");
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if (!name.trim() || !imageUrl.trim()) return;
    const tagsToUse =
      selectedTags.length > 0
        ? selectedTags
        : categories[0]
          ? [categories[0].id]
          : [];
    setSaving(true);
    try {
      await addProduct({
        name,
        image: imageUrl,
        inventoryCount: Number(inventoryCount) || 0,
        tags: tagsToUse,
      });
      setName("");
      setImageUrl("");
      setImagePublicId("");
      setInventoryCount(1);
      setSelectedTags([]);
      setFormSuccess("Product saved to Neon Postgres!");
      setTimeout(() => setFormSuccess(""), 3000);
    } catch (err) {
      setFormError(err.message || "Failed to add product.");
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (product) => {
    setEditingId(product.id);
    setEditName(product.name);
    setEditInventory(product.inventoryCount ?? 0);
    setEditTags(getProductTags(product));
  };

  const toggleEditTag = (tagId) => {
    setEditTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  const saveEdit = async (id) => {
    if (!editName.trim()) return;
    try {
      await updateProduct(id, {
        name: editName.trim(),
        inventoryCount: Number(editInventory) || 0,
        tags: editTags,
      });
      setEditingId(null);
    } catch (err) {
      alert(err.message || "Failed to update product.");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="admin-dashboard">
      {/* Top Bar */}
      <div className="admin-topbar">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="admin-subtitle">
            Upload images to Cloudinary, manage products & inventory in Neon Postgres, and configure filter tags.
          </p>
        </div>
        <div className="admin-topbar-actions">
          <button
            className="btn-outline-danger"
            onClick={() => {
              logout();
              navigate("/");
            }}
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="admin-grid">
        {/* Left Column: Add Product + Manage Tags */}
        <div className="admin-col-left">
          <section className="admin-card">
            <h2 className="admin-card-title">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="admin-form">
              <div className="form-group">
                <label className="form-label" htmlFor="product-name">
                  Product Name
                </label>
                <input
                  id="product-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Gojo Satoru Sticker"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="product-inventory">
                  Inventory Count
                </label>
                <input
                  id="product-inventory"
                  type="number"
                  min="0"
                  className="form-input"
                  value={inventoryCount}
                  onChange={(e) => setInventoryCount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Product Image (Cloudinary)</label>
                <label className="upload-dropzone">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    hidden
                    disabled={uploading || deletingImage}
                  />
                  {uploading ? (
                    <span>Uploading to Cloudinary...</span>
                  ) : (
                    <span>📁 Click to upload image to Cloudinary</span>
                  )}
                </label>
                {uploadError && <p className="form-error">{uploadError}</p>}

                <input
                  type="url"
                  className="form-input"
                  placeholder="Or paste image URL directly"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImagePublicId("");
                  }}
                  required
                />

                {imageUrl && (
                  <div className="image-preview-wrapper">
                    <div className="image-preview-box">
                      <img src={imageUrl} alt="Preview" />
                    </div>
                    <div className="image-preview-actions">
                      <button
                        type="button"
                        className="btn-outline-danger btn-sm"
                        onClick={handleDeleteUploadedImage}
                        disabled={deletingImage}
                      >
                        {deletingImage ? "Deleting..." : "🗑 Delete Image"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Assign Tags / Categories</label>
                <div className="tag-picker">
                  {categories.map((cat) => {
                    const active = selectedTags.includes(cat.id);
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        className={`tag-pill ${active ? "tag-pill--active" : ""}`}
                        onClick={() => toggleTagSelection(cat.id)}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {formError && <p className="form-error">{formError}</p>}
              {formSuccess && <p className="form-success">{formSuccess}</p>}

              <button
                type="submit"
                className="btn-primary btn-full"
                disabled={uploading || deletingImage || saving}
              >
                {saving ? "Saving..." : "+ Add Product"}
              </button>
            </form>
          </section>

          {/* Manage Filter Tags */}
          <section className="admin-card">
            <h2 className="admin-card-title">Manage Filter Tags</h2>
            <form onSubmit={handleCreateTag} className="tag-add-row">
              <input
                type="text"
                className="form-input"
                placeholder="New tag name (e.g. Music)"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
              <button type="submit" className="btn-primary">
                Add Tag
              </button>
            </form>
            {tagError && <p className="form-error">{tagError}</p>}

            <ul className="admin-tag-list">
              {categories.map((cat) => {
                const isRenaming = renamingTagId === cat.id;
                return (
                  <li key={cat.id} className="admin-tag-item">
                    {isRenaming ? (
                      <form
                        onSubmit={(e) => handleSaveRenameTag(e, cat.id)}
                        className="admin-tag-rename-row"
                      >
                        <input
                          type="text"
                          className="form-input form-input--sm"
                          value={renameTagLabel}
                          onChange={(e) => setRenameTagLabel(e.target.value)}
                          autoFocus
                          required
                        />
                        <button type="submit" className="btn-primary btn-sm">
                          Save
                        </button>
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => setRenamingTagId(null)}
                        >
                          Cancel
                        </button>
                      </form>
                    ) : (
                      <>
                        <span>
                          <strong>{cat.label}</strong>{" "}
                          <span className="cat-count">({cat.count})</span>
                        </span>
                        <div className="admin-tag-actions">
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={() => startRenameTag(cat)}
                            title={`Rename ${cat.label}`}
                          >
                            Rename
                          </button>
                          <button
                            type="button"
                            className="btn-icon-danger"
                            onClick={() => deleteCategory(cat.id)}
                            title={`Delete ${cat.label}`}
                          >
                            ✕
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        {/* Right Column: Manage Products */}
        <section className="admin-card admin-col-right">
          <div className="admin-products-header">
            <h2 className="admin-card-title">
              Products ({filteredProducts.length})
            </h2>
            <input
              type="search"
              className="form-input admin-search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="admin-subtitle">Loading products from Neon Postgres...</p>
          ) : (
            <div className="admin-product-list">
              {filteredProducts.map((product) => {
                const pTags = getProductTags(product);
                const isEditing = editingId === product.id;

                return (
                  <div key={product.id} className="admin-product-row">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="admin-product-thumb"
                    />

                    <div className="admin-product-details">
                      {isEditing ? (
                        <div className="admin-edit-box">
                          <input
                            type="text"
                            className="form-input"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                          <div className="form-group">
                            <label className="form-label">Inventory Count</label>
                            <input
                              type="number"
                              min="0"
                              className="form-input"
                              value={editInventory}
                              onChange={(e) => setEditInventory(e.target.value)}
                            />
                          </div>
                          <div className="tag-picker">
                            {categories.map((cat) => {
                              const active = editTags.includes(cat.id);
                              return (
                                <button
                                  type="button"
                                  key={cat.id}
                                  className={`tag-pill tag-pill--sm ${
                                    active ? "tag-pill--active" : ""
                                  }`}
                                  onClick={() => toggleEditTag(cat.id)}
                                >
                                  {cat.label}
                                </button>
                              );
                            })}
                          </div>
                          <div className="admin-edit-actions">
                            <button
                              type="button"
                              className="btn-primary btn-sm"
                              onClick={() => saveEdit(product.id)}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              className="btn-secondary btn-sm"
                              onClick={() => setEditingId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="admin-product-name">
                            {product.name}{" "}
                            <span className="cat-count">
                              #{product.id} · Stock: {product.inventoryCount ?? 0}
                              {product.createdAt
                                ? ` · Added ${new Date(product.createdAt).toLocaleDateString()}`
                                : ""}
                            </span>
                          </p>
                          <div className="admin-product-tags">
                            {pTags.map((tid) => {
                              const cat = categories.find((c) => c.id === tid);
                              return (
                                <span key={tid} className="badge-tag">
                                  {cat ? cat.label : tid}
                                </span>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>

                    {!isEditing && (
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => startEditing(product)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-outline-danger btn-sm"
                          onClick={() => deleteProduct(product.id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
