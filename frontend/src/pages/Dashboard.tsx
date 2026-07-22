// pages/Dashboard.tsx — The main app page after login
//
// Concepts used here:
//   useEffect    = run code after the component mounts (fetch initial data)
//   useState     = track links list, form values, loading states
//   async/await  = handle API calls without callback hell
//
// State management note: for a bigger app you'd use React Query or Zustand.
// Here we keep it simple with useState + useEffect to focus on the concepts.

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { linksApi, type Link } from "../api/client";

const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:8000" : window.location.origin);

export default function Dashboard() {
  const navigate = useNavigate();
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create form state
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Fetch links when component mounts
  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const { data } = await linksApi.getAll();
      setLinks(data);
    } catch {
      setError("Failed to load links");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreating(true);

    try {
      const { data } = await linksApi.create({
        original_url: newUrl,
        title: newTitle || undefined,
      });
      // Prepend new link to the top of the list (newest first)
      setLinks((prev) => [data, ...prev]);
      setNewUrl("");
      setNewTitle("");
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setCreateError(detail.map((d: any) => d.msg).join(", "));
      } else {
        setCreateError(detail || "Failed to create link");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this link?")) return;
    try {
      await linksApi.delete(id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
    } catch {
      alert("Failed to delete link");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const copyToClipboard = (code: string) => {
    const shortUrl = `${BASE_URL}/${code}`;
    navigator.clipboard.writeText(shortUrl);
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dash-header">
        <span className="dash-logo">🔗 LinkDrop</span>
        <button onClick={handleLogout} className="btn-ghost">Logout</button>
      </header>

      <main className="dash-content">
        {/* Create form */}
        <section className="create-section">
          <h2>Shorten a URL</h2>
          <form onSubmit={handleCreate} className="create-form">
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://some-very-long-url.com/path/to/something"
              required
              className="url-input"
            />
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Title (optional)"
              className="title-input"
            />
            {createError && <div className="error-banner">{createError}</div>}
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? "Creating..." : "Shorten →"}
            </button>
          </form>
        </section>

        {/* Links list */}
        <section className="links-section">
          <h2>Your links <span className="count-badge">{links.length}</span></h2>

          {loading && <div className="loading">Loading...</div>}
          {error && <div className="error-banner">{error}</div>}

          {!loading && links.length === 0 && (
            <div className="empty-state">
              No links yet. Create your first one above ↑
            </div>
          )}

          <div className="links-list">
            {links.map((link) => (
              <div key={link.id} className="link-card">
                <div className="link-main">
                  <div className="link-title">{link.title || link.original_url}</div>
                  <div className="link-original">{link.original_url}</div>
                </div>
                <div className="link-actions">
                  <a
                    href={`${BASE_URL}/${link.short_code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="short-url"
                  >
                    /{link.short_code}
                  </a>
                  <span className="click-count">👁 {link.clicks}</span>
                  <button
                    onClick={() => copyToClipboard(link.short_code)}
                    className="btn-ghost"
                    title="Copy link"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="btn-danger"
                    title="Delete"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
