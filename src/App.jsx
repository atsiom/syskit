import { useState, useEffect, useRef } from "react";
import atsiomLogo from "./assets/atsiom-logo.png";
import Home from "./components/Home.jsx";
import ChmodCalculator from "./components/ChmodCalculator.jsx";
import CrontabCalculator from "./components/CrontabCalculator.jsx";
import CIDRCalculator from "./components/CIDRCalculator.jsx";
import RAIDCalculator from "./components/RAIDCalculator.jsx";
import SedGenerator from "./components/SedGenerator.jsx";
import AwkGenerator from "./components/AwkGenerator.jsx";
import IPInfoMap from "./components/IPInfoMap.jsx";
import NsLookup from "./components/NsLookup.jsx";
import EpochConverter from "./components/EpochConverter.jsx";
import DnsPropagation from "./components/DnsPropagation.jsx";
import UrlEncoder from "./components/UrlEncoder.jsx";
import Base64Codec from "./components/Base64Codec.jsx";
import RegexTester from "./components/RegexTester.jsx";
import JwtDecoder from "./components/JwtDecoder.jsx";
import Disclaimer from "./components/Disclaimer.jsx";

const SITE_URL = "https://syskit.atsiom.com";

const TOOL_META = {
  chmod:     { title: "chmod calculator — syskit",      desc: "Calculate Unix file permission bits and generate the chmod command. Set owner, group, and other permissions interactively." },
  cron:      { title: "cron expression builder — syskit", desc: "Build cron expressions visually and preview the human-readable schedule. Supports standard 5-field crontab syntax." },
  cidr:      { title: "CIDR subnet calculator — syskit", desc: "Subnet calculator — compute usable hosts, network address, broadcast, and full IP range from any CIDR notation." },
  raid:      { title: "RAID calculator — syskit",        desc: "Compute usable storage, fault tolerance, and efficiency for RAID 0, 1, 5, 6, and 10. Plan your storage configuration." },
  sed:       { title: "sed command generator — syskit",  desc: "Generate sed substitution and deletion commands interactively. Build one-liners without memorizing the syntax." },
  awk:       { title: "awk one-liner builder — syskit",  desc: "Build awk one-liners for field extraction and pattern filtering. Generate ready-to-run commands from a visual interface." },
  ipinfo:    { title: "IP geolocation lookup — syskit",  desc: "Geo-locate any IP address with ISP details and a live map. Look up city, country, ASN, and network info instantly." },
  nslookup:  { title: "DNS lookup — syskit",             desc: "Query A, AAAA, MX, TXT, NS, and CNAME records via DNS-over-HTTPS. No installation required — runs in your browser." },
  epoch:     { title: "Unix epoch converter — syskit",   desc: "Convert Unix timestamps to human-readable dates and back. Supports seconds, milliseconds, and custom time zones." },
  dnsprop:   { title: "DNS propagation checker — syskit",desc: "Check DNS propagation across multiple global resolvers. See if your DNS changes have reached different regions." },
  urlencode: { title: "URL encoder / decoder — syskit",  desc: "Percent-encode and decode URLs and query strings. Convert special characters for safe use in HTTP requests." },
  base64:    { title: "Base64 encoder / decoder — syskit",desc: "Encode plain text to Base64 and decode Base64 strings. Supports Unicode input and output." },
  regex:     { title: "regex tester — syskit",           desc: "Test regular expressions with live match highlighting. Supports global, case-insensitive, multiline, and dotAll flags." },
  jwt:       { title: "JWT decoder — syskit",            desc: "Inspect JWT header and payload claims without verifying the signature. Decode tokens and view expiry, issuer, and custom claims." },
  disclaimer:{ title: "Disclaimer — syskit",             desc: "Terms of use and disclaimer for syskit developer tools." },
};

const HOME_META = {
  title: "syskit — developer tools for the browser",
  desc: "Free browser-based tools for developers and sysadmins. chmod calculator, cron builder, CIDR subnet calculator, RAID planner, regex tester, JWT decoder, Base64, URL encode, DNS lookup, and more. No sign-up, no tracking.",
};

function updatePageMeta(toolId) {
  const meta = toolId ? TOOL_META[toolId] : null;
  const { title, desc } = meta ?? HOME_META;
  const path = toolId ? `/${toolId}` : "/";
  const url = SITE_URL + path;

  document.title = title;

  const setMeta = (sel, content) => { const el = document.querySelector(sel); if (el) el.setAttribute("content", content); };
  const setId   = (id, val, attr = "content") => { const el = document.getElementById(id); if (el) el.setAttribute(attr, val); };

  setMeta('meta[name="description"]', desc);
  setId("canonical", url, "href");
  setId("og-url",   url);
  setId("og-title", title);
  setId("og-desc",  desc);
  setId("tw-title", title);
  setId("tw-desc",  desc);
}

const TOOLS = [
  { id: "chmod",      label: "chmod",      glyph: "rwx",   Component: ChmodCalculator,   badge: "permissions" },
  { id: "cron",       label: "crontab",    glyph: "*/5",   Component: CrontabCalculator, badge: "scheduler" },
  { id: "cidr",       label: "CIDR",       glyph: "/24",   Component: CIDRCalculator,    badge: "networking" },
  { id: "raid",       label: "RAID",       glyph: "R5",    Component: RAIDCalculator,    badge: "storage" },
  { id: "sed",        label: "sed",        glyph: "s//",   Component: SedGenerator,      badge: "stream editor" },
  { id: "awk",        label: "awk",        glyph: "{$1}",  Component: AwkGenerator,      badge: "text processor" },
  { id: "ipinfo",     label: "IP info",    glyph: "ip",    Component: IPInfoMap,          badge: "network" },
  { id: "nslookup",   label: "nslookup",   glyph: "DNS",   Component: NsLookup,          badge: "DNS" },
  { id: "epoch",      label: "epoch",      glyph: "ts",    Component: EpochConverter,    badge: "time" },
  { id: "dnsprop",    label: "DNS prop",   glyph: "⇢",     Component: DnsPropagation,    badge: "checker" },
  { id: "urlencode",  label: "URL encode", glyph: "%20",   Component: UrlEncoder,        badge: "encoding" },
  { id: "base64",     label: "Base64",     glyph: "b64",   Component: Base64Codec,       badge: "encoding" },
  { id: "regex",      label: "regex",      glyph: ".*",    Component: RegexTester,       badge: "pattern" },
  { id: "jwt",        label: "JWT",        glyph: "{}",    Component: JwtDecoder,        badge: "auth" },
  { id: "disclaimer", label: "Disclaimer", glyph: "§",     Component: Disclaimer,        badge: "legal" },
];

function getToolFromPath() {
  const segments = window.location.pathname.split("/").filter(Boolean);
  if (!segments.length) return null; // home
  const id = segments[segments.length - 1] ?? "";
  return TOOLS.find((t) => t.id === id)?.id ?? null;
}

const THEME_OPTIONS = [
  {
    value: "light", label: "Light",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  },
  {
    value: "dark", label: "Dark",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>,
  },
  {
    value: "system", label: "System",
    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  },
];

function ThemeToggle({ theme, onChange }) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = THEME_OPTIONS.find((o) => o.value === theme);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "5px 10px", height: 30,
          background: open ? "var(--surface-3)" : "var(--surface-2)",
          border: "1px solid var(--border)", borderRadius: 8,
          color: "var(--text-muted)", cursor: "pointer", transition: "all 0.15s",
        }}
      >
        {current?.icon}
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)" }}>{current?.label}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ opacity: 0.5, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 300,
          background: "var(--surface)", border: "1px solid var(--border-2)",
          borderRadius: 10, overflow: "hidden", minWidth: 130,
          boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
        }}>
          {THEME_OPTIONS.map((opt, i) => (
            <button
              key={opt.value}
              onMouseDown={() => { onChange(opt.value); setOpen(false); }}
              onMouseEnter={() => setHovered(opt.value)}
              onMouseLeave={() => setHovered(null)}
              style={{
                width: "100%", padding: "9px 14px", border: "none",
                borderBottom: i < THEME_OPTIONS.length - 1 ? "1px solid var(--border)" : "none",
                background: theme === opt.value ? "var(--green-bg)" : hovered === opt.value ? "var(--surface-3)" : "transparent",
                color: theme === opt.value ? "var(--green)" : hovered === opt.value ? "var(--text)" : "var(--text-muted)",
                fontFamily: "var(--font-mono)", fontSize: "var(--sm)",
                display: "flex", alignItems: "center", gap: 9,
                textAlign: "left", cursor: "pointer", transition: "background 0.1s, color 0.1s",
              }}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


export default function App() {
  const [activeTool, setActiveTool] = useState(getToolFromPath);
  const [theme, setTheme] = useState(() => localStorage.getItem("syskit-theme") || "system");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const resolveTheme = (t) =>
    t === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : t;

  useEffect(() => {
    localStorage.setItem("syskit-theme", theme);
    document.documentElement.setAttribute("data-theme", resolveTheme(theme));
  }, [theme]);

  // Re-apply when system preference changes (only relevant when theme === "system")
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (theme === "system") {
        document.documentElement.setAttribute("data-theme", resolveTheme("system"));
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  useEffect(() => {
    if (activeTool === null) {
      if (window.location.pathname !== "/") history.pushState({}, "", "/");
    } else {
      localStorage.setItem("syskit-last-tool", activeTool);
      const segments = window.location.pathname.split("/").filter(Boolean);
      const current = segments[segments.length - 1] ?? "";
      if (current !== activeTool) {
        const base = segments.slice(0, -1).join("/");
        history.pushState({}, "", (base ? "/" + base : "") + "/" + activeTool);
      }
    }
  }, [activeTool]);

  useEffect(() => {
    const onPop = () => setActiveTool(getToolFromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => { updatePageMeta(activeTool); }, [activeTool]);



  const scrollRef = useRef(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [activeTool]);

  const activeMeta = TOOLS.find((t) => t.id === activeTool);
  const ActiveComponent = activeMeta?.Component ?? null;

  const selectTool = (id) => { setActiveTool(id); setSidebarOpen(false); };

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* ── SIDEBAR OVERLAY (mobile) ── */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`app-sidebar${sidebarOpen ? " open" : ""}`} style={{
        width: "var(--sidebar-w)", flexShrink: 0,
        background: "var(--surface)", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        height: "100vh", overflow: "hidden",
      }}>

        {/* Brand */}
        <div style={{ height: "var(--header-h)", display: "flex", alignItems: "center", padding: "0 1.25rem", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <button onClick={() => selectTool(null)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--lg)", fontWeight: 400, color: "var(--green)", letterSpacing: "0.04em" }}>
              syskit<span style={{ color: "var(--text-faint)" }}>:</span>
            </span>
          </button>
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, padding: "0.75rem 0.5rem", overflowY: "auto" }}>
          {/* Home link */}
          <button
            onClick={() => selectTool(null)}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", border: `1px solid ${activeTool === null ? "var(--green-dim)" : "transparent"}`, background: activeTool === null ? "var(--green-bg)" : "transparent", borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "all 0.13s", marginBottom: 6 }}
          >
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", fontWeight: 400, color: activeTool === null ? "var(--green)" : "var(--text-faint)", background: activeTool === null ? "rgba(46,204,113,0.12)" : "var(--surface-2)", border: `1px solid ${activeTool === null ? "var(--green-dim)" : "var(--border)"}`, borderRadius: 8, padding: "2px 6px", flexShrink: 0, minWidth: 40, textAlign: "center", transition: "all 0.13s" }}>~/</span>
            <span style={{ fontSize: "var(--md)", fontWeight: 400, color: activeTool === null ? "var(--green)" : "var(--text-muted)", transition: "color 0.13s" }}>home</span>
          </button>

          <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", fontWeight: 400, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-faint)", padding: "0.5rem 0.75rem 0.5rem", marginBottom: 4 }}>Tools</div>
          {TOOLS.map((tool) => {
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => selectTool(tool.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", border: `1px solid ${isActive ? "var(--green-dim)" : "transparent"}`, background: isActive ? "var(--green-bg)" : "transparent", borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "all 0.13s", marginBottom: 2 }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", fontWeight: 400, color: isActive ? "var(--green)" : "var(--text-faint)", background: isActive ? "rgba(46,204,113,0.12)" : "var(--surface-2)", border: `1px solid ${isActive ? "var(--green-dim)" : "var(--border)"}`, borderRadius: 8, padding: "2px 6px", flexShrink: 0, minWidth: 40, textAlign: "center", transition: "all 0.13s" }}>
                  {tool.glyph}
                </span>
                <span style={{ fontSize: "var(--md)", fontWeight: 400, color: isActive ? "var(--green)" : "var(--text-muted)", transition: "color 0.13s" }}>
                  {tool.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Brand footer */}
        <div style={{ padding: "0.85rem 1.25rem", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <img src={atsiomLogo} alt="Atsiom" style={{ width: 28, height: 28, objectFit: "cover", borderRadius: 6, flexShrink: 0 }} />
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", fontWeight: 500, color: "var(--text-muted)", letterSpacing: "0.06em" }}>ATSIOM LLC</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)", letterSpacing: "0.04em" }}>syskit tools</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>

        {/* Header */}
        <header className="app-header" style={{ height: "var(--header-h)", flexShrink: 0, background: "var(--surface)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 2.5rem", gap: 10 }}>

          {/* LEFT — hamburger + brand (mobile only, CSS shows these) */}
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen((v) => !v)}
            style={{ display: "none", alignItems: "center", justifyContent: "center", width: 34, height: 34, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, flexShrink: 0 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <button className="mobile-brand" onClick={() => selectTool(null)}
            style={{ display: "none", background: "none", border: "none", padding: 0, fontFamily: "var(--font-mono)", fontSize: "var(--lg)", fontWeight: 400, color: "var(--green)", letterSpacing: "0.04em", cursor: "pointer" }}>
            syskit<span style={{ color: "var(--text-faint)" }}>:</span>
          </button>

          {/* CENTER — tool name + badge, desktop only, only when a tool is active */}
          {activeTool !== null && activeMeta && (
            <span className="header-tool-info">
              <span style={{ fontSize: "var(--md)", fontWeight: 600, color: "var(--text)" }}>{activeMeta.label}</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--text-faint)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "2px 9px" }}>
                {activeMeta.badge}
              </span>
            </span>
          )}

          {/* RIGHT — spacer + theme toggle */}
          <div style={{ flex: 1 }} />
          <ThemeToggle theme={theme} onChange={setTheme} />
        </header>

        {/* Scrollable content */}
        <div ref={scrollRef} className="app-content" style={{ flex: 1, overflowY: "auto", padding: "2rem 2.5rem 0" }}>
          <div style={{ width: "100%", maxWidth: 960, margin: "0 auto", paddingBottom: "5rem" }}>
            {activeTool === null
              ? <Home key="home" tools={TOOLS} onSelect={selectTool} />
              : ActiveComponent ? <ActiveComponent key={activeTool} /> : null
            }
          </div>
        </div>
      </div>
    </div>
  );
}
