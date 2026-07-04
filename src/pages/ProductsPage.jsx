import { useEffect, useState, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ProductModal from "../components/ProductModal";
import ConfirmDialog from "../components/ConfirmDialog";

const PAGE_SIZE = 8;

export default function ProductsPage() {
  const { isAdmin } = useAuth();

  const [data, setData] = useState({
    content: [],
    totalPages: 0,
    totalElements: 0,
    page: 0,
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalProduct, setModalProduct] = useState(undefined); // undefined = closed, null = new, obj = edit
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/products", {
        params: {
          search: debouncedSearch,
          page,
          size: PAGE_SIZE,
          sortBy,
          sortDir,
        },
      });
      setData(data);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page, sortBy, sortDir]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const handleSave = async (form) => {
    if (modalProduct && modalProduct.id) {
      await api.put(`/products/${modalProduct.id}`, form);
    } else {
      await api.post("/products", form);
    }
    setModalProduct(undefined);
    fetchProducts();
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      alert("Failed to delete product");
      setDeleteTarget(null);
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await api.get("/products/export", {
        params: { format },
        responseType: "blob",
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = format === "csv" ? "products.csv" : "products.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to export products");
    }
  };

  const arrow = (field) =>
    sortBy === field ? (sortDir === "asc" ? "▲" : "▼") : "";

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
      </div>

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search by name or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="actions-group">
          <button
            className="btn btn-outline btn-sm"
            onClick={() => handleExport("json")}
          >
            Export JSON
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => handleExport("csv")}
          >
            Export CSV
          </button>
          {isAdmin && (
            <button
              className="btn btn-accent"
              onClick={() => setModalProduct(null)}
            >
              + Add Product
            </button>
          )}
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <table>
        <thead>
          <tr>
            <th onClick={() => toggleSort("name")}>
              Product Name <span className="sort-arrow">{arrow("name")}</span>
            </th>
            <th onClick={() => toggleSort("category")}>
              Category <span className="sort-arrow">{arrow("category")}</span>
            </th>
            <th onClick={() => toggleSort("price")}>
              Price <span className="sort-arrow">{arrow("price")}</span>
            </th>
            <th onClick={() => toggleSort("quantity")}>
              Quantity <span className="sort-arrow">{arrow("quantity")}</span>
            </th>
            <th className="no-sort">Status</th>
            {isAdmin && <th className="no-sort">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={isAdmin ? 6 : 5} className="empty-state">
                Loading...
              </td>
            </tr>
          ) : data.content.length === 0 ? (
            <tr>
              <td colSpan={isAdmin ? 6 : 5} className="empty-state">
                No products found.
              </td>
            </tr>
          ) : (
            data.content.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="product-name-cell">
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="product-thumb"
                      />
                    )}
                    {p.name}
                  </div>
                </td>
                <td>{p.category || "—"}</td>
                <td>KSh {Number(p.price).toLocaleString()}</td>
                <td>{p.quantity}</td>
                <td>
                  <span
                    className={`badge ${p.status === "In Stock" ? "badge-in-stock" : "badge-out-of-stock"}`}
                  >
                    {p.status}
                  </span>
                </td>
                {isAdmin && (
                  <td className="row-actions">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setModalProduct(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => setDeleteTarget(p)}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <div className="pagination">
        <span>
          Page {data.totalElements === 0 ? 0 : page + 1} of {data.totalPages}{" "}
          &middot; {data.totalElements} total
        </span>
        <div className="controls">
          <button
            className="btn btn-outline btn-sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            Prev
          </button>
          <button
            className="btn btn-outline btn-sm"
            disabled={page + 1 >= data.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {modalProduct !== undefined && (
        <ProductModal
          product={modalProduct}
          onClose={() => setModalProduct(undefined)}
          onSave={handleSave}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Product?"
          message={`Are you sure you want to delete "${deleteTarget.name}"?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
