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
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Link2, Trash2, Copy, LogOut, Eye, Plus, ExternalLink, QrCode } from "lucide-react";
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
  const [customCode, setCustomCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  // Copy success indicator state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Active QR code overlay state
  const [activeQrCode, setActiveQrCode] = useState<string | null>(null);

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
        custom_code: customCode || undefined,
      });
      // Prepend new link to the top of the list (newest first)
      setLinks((prev) => [data, ...prev]);
      setNewUrl("");
      setNewTitle("");
      setCustomCode("");
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
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="dashboard">
      <div className="bg-noise"></div>
      
      {/* Header */}
      <header className="dash-header">
        <RouterLink to="/" className="dash-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Link2 className="nav-logo-icon" /> LinkDrop
        </RouterLink>
        <button onClick={handleLogout} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <LogOut size={14} /> Logout
        </button>
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
            <input
              type="text"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              placeholder="Custom short code (optional)"
              className="code-input"
            />
            {createError && <div className="error-banner">{createError}</div>}
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? "Creating..." : <><Plus size={16} /> Shorten</>}
            </button>
          </form>
        </section>

        {/* Links list */}
        <section className="links-section">
          <h2>Your links {!loading && links.length > 0 && <span className="count-badge">{links.length}</span>}</h2>

          {loading && <div className="loading">Loading database telemetry...</div>}
          {error && <div className="error-banner">{error}</div>}

          {!loading && links.length === 0 && (
            <div className="empty-state">
              No links created in this partition yet. Create your first link above.
            </div>
          )}

          <div className="links-list">
            {links.map((link) => {
              const shortUrl = `${BASE_URL}/${link.short_code}`;
              return (
                <div key={link.id} className="link-card-container" style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div className="link-card">
                    <div className="link-main">
                      <div className="link-title-row" style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <span className="link-title">{link.title || link.original_url}</span>
                      </div>
                      <div className="link-original">{link.original_url}</div>
                    </div>
                    <div className="link-actions">
                      <a
                        href={`${BASE_URL}/${link.short_code}`}
                        target="_blank"
                        rel="noreferrer"
                        className="short-url"
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        /{link.short_code} <ExternalLink size={12} />
                      </a>
                      <span className="click-count">
                        <Eye size={14} style={{ marginRight: "4px" }} /> {link.clicks} clicks
                      </span>
                      <button
                        onClick={() => copyToClipboard(link.short_code)}
                        className="btn-ghost"
                        title="Copy link"
                        style={{ minWidth: "75px", textAlign: "center" }}
                      >
                        {copiedCode === link.short_code ? "Copied!" : <><Copy size={12} style={{ marginRight: "4px" }} /> Copy</>}
                      </button>
                      <button
                        onClick={() => setActiveQrCode(activeQrCode === link.short_code ? null : link.short_code)}
                        className={`btn-ghost ${activeQrCode === link.short_code ? "active" : ""}`}
                        title="QR Code"
                        style={{ display: "flex", alignItems: "center", gap: "4px", background: activeQrCode === link.short_code ? "rgba(201, 168, 76, 0.15)" : "", borderColor: activeQrCode === link.short_code ? "var(--accent)" : "" }}
                      >
                        <QrCode size={12} /> QR
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="btn-danger"
                        title="Delete"
                        style={{ display: "flex", alignItems: "center", gap: "4px" }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Expanded QR Code Box */}
                  {activeQrCode === link.short_code && (
                    <div className="qr-expand-box" style={{ background: "var(--bg-card)", border: "1px solid var(--accent)", borderRadius: "var(--radius-md)", padding: "1.5rem", display: "flex", alignItems: "center", gap: "2rem", marginTop: "0.25rem", animation: "fadeIn 0.25s ease" }}>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=c9a84c&bgcolor=0d0d12&data=${encodeURIComponent(shortUrl)}`} 
                        alt="QR Code" 
                        style={{ width: "120px", height: "120px", border: "1px solid var(--border)", borderRadius: "4px", background: "#0D0D12" }}
                      />
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--text)" }}>SVG QR Code for /{link.short_code}</h4>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>Scan to redirect directly to the original target URL.</p>
                        <a 
                          href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=c9a84c&bgcolor=0d0d12&data=${encodeURIComponent(shortUrl)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-ghost"
                          style={{ display: "inline-flex", alignSelf: "flex-start", alignItems: "center", gap: "6px", fontSize: "0.8rem", textDecoration: "none" }}
                        >
                          Open High-Res QR
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}

