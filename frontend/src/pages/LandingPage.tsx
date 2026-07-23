import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Link2, Zap, ArrowRight, Terminal, QrCode } from "lucide-react";
import gsap from "gsap";

export default function LandingPage() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("access_token");

  // State to toggle between Midnight Luxe and Clean Utility layouts
  const [isCleanUtility, setIsCleanUtility] = useState(false);

  // State for Card 1: Diagnostic Shuffler (Midnight Luxe)
  const [shuffledCards, setShuffledCards] = useState([
    { id: 1, label: "Routing: Custom Alias", val: "/portfolio -> GH Page", status: "Active" },
    { id: 2, label: "Redirection Layer: L1", val: "DB Cache HIT", status: "8ms Latency" },
    { id: 3, label: "Traffic Cryptography", val: "SSL/TLS Enforced", status: "100% Secure" },
  ]);

  // State for Card 2: Telemetry Typewriter (Midnight Luxe)
  const [terminalText, setTerminalText] = useState("");
  const terminalLines = [
    "systemctl start linkdrop-routing...",
    "establishing connection to Supabase pooler:6543...",
    "connection secure. listening for incoming links...",
    "REQUEST: GET /portfolio from 103.45.2.1",
    "RESOLVED: target=https://github.com/Twenitrix/Link-drop via Custom Code",
    "STATUS: 307 Temporary Redirect | Latency: 8.4ms",
    "analytics and click counts incremented successfully.",
  ];

  // Card 1 Auto-Shuffling Logic
  useEffect(() => {
    if (isCleanUtility) return;
    const timer = setInterval(() => {
      setShuffledCards((prev) => [prev[1], prev[2], prev[0]]);
    }, 3000);
    return () => clearInterval(timer);
  }, [isCleanUtility]);

  // Card 2 Typewriter Logic
  useEffect(() => {
    if (isCleanUtility) return;
    let lineIdx = 0;
    let charIdx = 0;
    let currentLine = "";
    let isDeleting = false;
    let typeTimer: any;

    const tick = () => {
      const fullText = terminalLines[lineIdx];

      if (!isDeleting) {
        currentLine = fullText.substring(0, charIdx + 1);
        charIdx++;

        if (charIdx === fullText.length) {
          isDeleting = true;
          typeTimer = setTimeout(tick, 2000); // hold line
          return;
        }
      } else {
        currentLine = fullText.substring(0, charIdx - 1);
        charIdx--;

        if (charIdx === 0) {
          isDeleting = false;
          lineIdx = (lineIdx + 1) % terminalLines.length;
        }
      }

      setTerminalText(currentLine);
      typeTimer = setTimeout(tick, isDeleting ? 30 : 60);
    };

    typeTimer = setTimeout(tick, 500);
    return () => clearTimeout(typeTimer);
  }, [isCleanUtility]);

  // GSAP Entrance Animations
  const heroRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isCleanUtility) return;
    const ctx = gsap.context(() => {
      gsap.from(".fade-up", {
        y: 40,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: "power3.out",
      });
      gsap.from(".navbar-island", {
        y: -30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
    }, heroRef);
    return () => ctx.revert();
  }, [isCleanUtility]);

  // ── RENDER CLEAN UTILITY LAYOUT ─────────────────────────────────────────────
  if (isCleanUtility) {
    return (
      <div className="landing-container clean-utility">
        <div className="bg-noise"></div>

        {/* Minimal Navbar */}
        <nav className="navbar-simple">
          <div className="nav-logo">
            <Link2 className="nav-logo-icon" style={{ color: "var(--accent)" }} />
            <span>LinkDrop</span>
          </div>
          <div className="nav-actions">
            {isLoggedIn ? (
              <button onClick={() => navigate("/dashboard")} className="btn-accent-nav">
                Dashboard <ArrowRight size={14} />
              </button>
            ) : (
              <>
                <Link to="/login" className="btn-ghost-nav">Sign In</Link>
                <Link to="/register" className="btn-accent-nav">Register</Link>
              </>
            )}
          </div>
        </nav>

        {/* Direct shortening utility hero */}
        <header className="utility-hero">
          <span className="hero-tagline">MINIMAL ROUTING PROTOCOL</span>
          <h1>Shorten links instantly.</h1>
          <p>A fast, clean interface to redirect URLs and track link traffic metrics on the fly.</p>
          
          <div className="utility-shorten-box">
            <input 
              type="url" 
              placeholder="Paste your long URL here (https://...)" 
              className="utility-input" 
              readOnly
              onClick={() => navigate("/register")}
            />
            <button onClick={() => navigate("/register")} className="utility-btn">
              Get Started <ArrowRight size={16} />
            </button>
          </div>
          <span className="utility-hint">Free account required to save custom short codes and generate QR codes.</span>
        </header>

        {/* Clean minimal features */}
        <section className="utility-features">
          <div className="utility-feature">
            <div className="utility-feature-icon"><Zap size={20} /></div>
            <h3>Instant redirection</h3>
            <p>Propagates immediately. Click links resolve globally in milliseconds.</p>
          </div>
          <div className="utility-feature">
            <div className="utility-feature-icon"><Terminal size={20} /></div>
            <h3>Custom short codes</h3>
            <p>Replace generic identifiers with branded vanity aliases like /portfolio.</p>
          </div>
          <div className="utility-feature">
            <div className="utility-feature-icon"><QrCode size={20} /></div>
            <h3>Sleek QR Codes</h3>
            <p>Generate styled QR codes instantly for digital and offline distribution.</p>
          </div>
        </section>

        {/* Minimal Footer */}
        <footer className="utility-footer">
          <p>© {new Date().getFullYear()} LinkDrop. Clean and light link shortening.</p>
        </footer>

        {/* Layout Toggle Controller (Localhost only) */}
        <div className="design-toggle-pill">
          <button onClick={() => setIsCleanUtility(false)}>
            ⇆ Switch to Midnight Luxe Layout
          </button>
        </div>
      </div>
    );
  }

  // ── RENDER MIDNIGHT LUXE LAYOUT ─────────────────────────────────────────────
  return (
    <div ref={heroRef} className="landing-container">
      {/* Global SVG Noise Overlay */}
      <div className="bg-noise"></div>

      {/* Floating Island Navbar */}
      <nav className="navbar-island navbar-island-float">
        <Link to="/" className="nav-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Link2 className="nav-logo-icon" />
          <span>LinkDrop</span>
        </Link>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#philosophy">Manifesto</a>
          <a href="#protocol">Protocol</a>
        </div>
        <div className="nav-actions">
          {isLoggedIn ? (
            <button onClick={() => navigate("/dashboard")} className="btn-accent-nav">
              Dashboard <ArrowRight size={14} />
            </button>
          ) : (
            <>
              <Link to="/login" className="btn-ghost-nav">Sign In</Link>
              <Link to="/register" className="btn-accent-nav">Register</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-bg-overlay"></div>
        <div className="hero-content">
          <span className="hero-tagline fade-up">THE SYSTEM PROTOCOL FOR GLOBAL ROUTING</span>
          <h1 className="hero-title fade-up">
            Instant URL redirection <br />
            meets <span className="hero-drama">Absolute latency control.</span>
          </h1>
          <p className="hero-description fade-up">
            A high-performance link shortening gateway connected directly to the database edge. 
            Zero routing overhead, custom short code support, and clean, database-backed analytical telemetry.
          </p>
          <div className="hero-ctas fade-up">
            {isLoggedIn ? (
              <button onClick={() => navigate("/dashboard")} className="btn-magnetic btn-accent-large">
                Manage your links
                <span className="btn-hover-slide"></span>
              </button>
            ) : (
              <>
                <button onClick={() => navigate("/register")} className="btn-magnetic btn-accent-large">
                  Create a free account
                  <span className="btn-hover-slide"></span>
                </button>
                <a href="#features" className="btn-magnetic btn-outline-large">
                  Explore architecture
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="section features-section">
        <div className="section-header">
          <span className="section-pretitle">SYSTEM CAPABILITIES</span>
          <h2 className="section-title">Functional Telemetry</h2>
          <p className="section-desc">More than static links. We operate high-performance routing cells.</p>
        </div>

        <div className="features-grid">
          {/* Card 1: Diagnostic Shuffler */}
          <div className="feature-card">
            <div className="feature-card-header">
              <Zap className="feature-icon" />
              <div>
                <h3>Instant Routing Cell</h3>
                <p>Redirects execute at local edge speeds.</p>
              </div>
            </div>
            <div className="feature-card-visual shuffler-visual">
              {shuffledCards.map((c, idx) => (
                <div 
                  key={c.id} 
                  className={`shuffled-item shuffled-item-${idx}`}
                  style={{
                    transform: `translateY(${idx * 22}px) scale(${1 - idx * 0.05})`,
                    zIndex: 10 - idx,
                    opacity: 1 - idx * 0.25,
                  }}
                >
                  <div className="shuffled-item-header">
                    <span className="mono-text">{c.label}</span>
                    <span className={`status-pill status-${c.status.replace(/ /g, '-').toLowerCase()}`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="shuffled-item-body">{c.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Telemetry Typewriter */}
          <div className="feature-card">
            <div className="feature-card-header">
              <Terminal className="feature-icon" />
              <div>
                <h3>Real-Time Telemetry</h3>
                <p>Track every single hit, referrer, and source.</p>
              </div>
            </div>
            <div className="feature-card-visual terminal-visual">
              <div className="terminal-header">
                <span className="terminal-dot red"></span>
                <span className="terminal-dot yellow"></span>
                <span className="terminal-dot green"></span>
                <span className="terminal-title">linkdropd.service</span>
              </div>
              <div className="terminal-body mono-text">
                <span className="txt-champagne">$ </span>{terminalText}
                <span className="cursor-blink">|</span>
              </div>
            </div>
          </div>

          {/* Card 3: Bespoke QR Code Matrix */}
          <div className="feature-card">
            <div className="feature-card-header">
              <QrCode className="feature-icon" />
              <div>
                <h3>Sleek QR Code Matrix</h3>
                <p>Automated QR code compilation for instant distribution.</p>
              </div>
            </div>
            <div className="feature-card-visual scheduler-visual" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0D0D12' }}>
              <div style={{ padding: '1.25rem', border: '1px solid var(--accent)', borderRadius: '8px', background: 'rgba(201, 168, 76, 0.05)', position: 'relative', overflow: 'hidden' }}>
                {/* Visual tech matrix representing a QR code scan */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', width: '80px', height: '80px', opacity: 0.85 }}>
                  <div style={{ background: 'var(--accent)', borderRadius: '2px' }}></div>
                  <div style={{ background: 'var(--accent)', borderRadius: '2px' }}></div>
                  <div style={{ background: 'transparent' }}></div>
                  <div style={{ background: 'var(--accent)', borderRadius: '2px' }}></div>
                  <div style={{ background: 'var(--accent)', borderRadius: '2px' }}></div>
                  
                  <div style={{ background: 'var(--accent)', borderRadius: '2px' }}></div>
                  <div style={{ background: 'transparent' }}></div>
                  <div style={{ background: 'var(--accent)', borderRadius: '2px' }}></div>
                  <div style={{ background: 'transparent' }}></div>
                  <div style={{ background: 'var(--accent)', borderRadius: '2px' }}></div>
                  
                  <div style={{ background: 'transparent' }}></div>
                  <div style={{ background: 'var(--accent)', borderRadius: '2px' }}></div>
                  <div style={{ background: 'var(--accent)', borderRadius: '2px' }}></div>
                  <div style={{ background: 'var(--accent)', borderRadius: '2px' }}></div>
                  <div style={{ background: 'transparent' }}></div>
                  
                  <div style={{ background: 'var(--accent)', borderRadius: '2px' }}></div>
                  <div style={{ background: 'transparent' }}></div>
                  <div style={{ background: 'var(--accent)', borderRadius: '2px' }}></div>
                  <div style={{ background: 'transparent' }}></div>
                  <div style={{ background: 'var(--accent)', borderRadius: '2px' }}></div>
                  
                  <div style={{ background: 'var(--accent)', borderRadius: '2px' }}></div>
                  <div style={{ background: 'var(--accent)', borderRadius: '2px' }}></div>
                  <div style={{ background: 'transparent' }}></div>
                  <div style={{ background: 'var(--accent)', borderRadius: '2px' }}></div>
                  <div style={{ background: 'var(--accent)', borderRadius: '2px' }}></div>
                </div>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '2px', background: 'var(--accent)', boxShadow: '0 0 10px var(--accent)', animation: 'scan 2s ease-in-out infinite' }}></div>
              </div>
              <span className="mono-text" style={{ fontSize: '0.75rem', marginTop: '0.8rem', color: 'var(--accent)', letterSpacing: '0.1em' }}>QR-CODE-MATRIX // READY</span>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section id="philosophy" className="philosophy-section">
        <div className="philosophy-bg-image"></div>
        <div className="philosophy-overlay"></div>
        <div className="philosophy-content">
          <div className="manifesto-card">
            <span className="manifesto-tag">THE MANIFESTO</span>
            <p className="manifesto-muted">
              Most redirect platforms focus on bloated user interfaces, excessive tracker pixels, and ad-laden interstitial screens.
            </p>
            <p className="manifesto-primary">
              We focus on: <span className="hero-drama">Sub-10ms redirects.</span> Pure connection pooling, direct SQL routing, and secure SSL handshakes without tracking pixels.
            </p>
          </div>
        </div>
      </section>

      {/* Protocol Section (Sticky Stacking Archive) */}
      <section id="protocol" className="protocol-section">
        <div className="section-header center-header">
          <span className="section-pretitle">THE LIFECYCLE</span>
          <h2 className="section-title text-center">Three Steps of Redirection</h2>
          <p className="section-desc text-center">How LinkDrop converts your links into modular routing cells.</p>
        </div>

        <div className="protocol-stack">
          {/* Card 1 */}
          <div className="protocol-card bg-obsidian-card">
            <div className="protocol-card-content">
              <span className="protocol-step mono-text">01 // INGESTION</span>
              <h3>Submit target URL</h3>
              <p>
                Provide any valid HTTP or HTTPS address. Our validation system checks the schema rules, sanitizes the path, and reserves a unique database partition.
              </p>
            </div>
            <div className="protocol-card-animation">
              {/* Rotating circles SVG */}
              <svg viewBox="0 0 100 100" className="svg-rotate-circles">
                <circle cx="50" cy="50" r="40" stroke="var(--border)" strokeWidth="0.5" fill="none" />
                <circle cx="50" cy="50" r="30" stroke="var(--accent)" strokeWidth="1" strokeDasharray="10 20" fill="none" className="spin-reverse" />
                <circle cx="50" cy="50" r="20" stroke="var(--accent-hover)" strokeWidth="1.5" strokeDasharray="50 10" fill="none" className="spin-normal" />
                <circle cx="50" cy="50" r="5" fill="var(--accent)" />
              </svg>
            </div>
          </div>

          {/* Card 2 */}
          <div className="protocol-card bg-obsidian-card">
            <div className="protocol-card-content">
              <span className="protocol-step mono-text">02 // ALLOCATION</span>
              <h3>Generate Partition Alias</h3>
              <p>
                A high-entropy short-code key or a custom brand alias is allocated. This key resolves directly inside the Supabase database partition.
              </p>
            </div>
            <div className="protocol-card-animation">
              {/* Scanning Grid SVG */}
              <div className="svg-scanning-grid">
                <div className="scan-line"></div>
                <div className="dot-grid">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <span key={i} className="grid-dot"></span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="protocol-card bg-obsidian-card">
            <div className="protocol-card-content">
              <span className="protocol-step mono-text">03 // DELIVERY</span>
              <h3>Edge-cached Redirection</h3>
              <p>
                When a user visits your link, the router interceptor pulls it from the database cache, logs click telemetry, and issues an instant 307 Temporary Redirect.
              </p>
            </div>
            <div className="protocol-card-animation">
              {/* EKG waveform SVG */}
              <svg viewBox="0 0 200 100" className="svg-ekg-wave">
                <path 
                  d="M 10 50 L 50 50 L 60 20 L 70 80 L 80 50 L 120 50 L 130 10 L 140 90 L 150 50 L 190 50" 
                  stroke="var(--accent)" 
                  strokeWidth="2" 
                  fill="none" 
                  className="ekg-path"
                />
                <line x1="10" y1="50" x2="190" y2="50" stroke="var(--border)" strokeWidth="0.5" strokeDasharray="5 5" />
              </svg>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="footer-section">
        <div className="footer-content">
          <div className="footer-brand">
            <Link to="/" className="nav-logo" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Link2 className="nav-logo-icon" />
              <span>LinkDrop</span>
            </Link>
            <p className="footer-tagline">Minimalist link management for modern builders.</p>
            <div className="operational-indicator">
              <span className="pulse-dot green-pulse"></span>
              <span className="mono-text">SYSTEM OPERATIONAL // AP-NE-2 REGION</span>
            </div>
          </div>
          
          <div className="footer-grid">
            <div className="footer-col">
              <h5>PRODUCT</h5>
              <a href="#features">Features</a>
              <a href="#philosophy">Manifesto</a>
              <a href="#protocol">Protocol</a>
            </div>
            <div className="footer-col">
              <h5>DEVELOPER</h5>
              <a href="https://github.com/Twenitrix/Link-drop" target="_blank" rel="noreferrer">GitHub Repo</a>
              <a href="https://supabase.com" target="_blank" rel="noreferrer">Supabase</a>
              <a href="https://vercel.com" target="_blank" rel="noreferrer">Vercel</a>
            </div>
            <div className="footer-col">
              <h5>LEGAL</h5>
              <a href="#privacy">Privacy Protocol</a>
              <a href="#terms">Terms of Service</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} LinkDrop. Built for the open-source web.</p>
        </div>
      </footer>

      {/* Layout Toggle Controller (Localhost only) */}
      <div className="design-toggle-pill">
        <button onClick={() => setIsCleanUtility(true)}>
          ⇆ Switch to Clean Utility Layout
        </button>
      </div>
    </div>
  );
}
