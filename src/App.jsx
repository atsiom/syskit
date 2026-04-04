import { useState, useEffect } from "react";
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
import Disclaimer from "./components/Disclaimer.jsx";

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
  { id: "disclaimer", label: "Disclaimer", glyph: "§",     Component: Disclaimer,        badge: "legal" },
];

function getToolFromPath() {
  const id = window.location.pathname.replace(/^\//, "").split("/")[0];
  return TOOLS.find((t) => t.id === id)?.id ?? "chmod";
}

function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  return (
    <button
      onClick={onToggle}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
      style={{
        display: "flex", alignItems: "center", gap: 7,
        background: "none", border: "none", cursor: "pointer",
        marginLeft: "auto", padding: "2px 0",
      }}
    >
      <span style={{ fontSize: 13, lineHeight: 1, color: isDark ? "var(--text-faint)" : "var(--amber)", transition: "color 0.2s" }}>☀</span>
      <span style={{
        display: "inline-flex", alignItems: "center",
        width: 36, height: 20, borderRadius: 10,
        background: isDark ? "var(--green-dim)" : "var(--surface-3)",
        border: "1px solid var(--border-2)",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}>
        <span style={{
          position: "absolute", left: isDark ? 18 : 2,
          width: 14, height: 14, borderRadius: "50%",
          background: isDark ? "var(--green)" : "var(--text-muted)",
          transition: "left 0.2s, background 0.2s", flexShrink: 0,
        }} />
      </span>
      <span style={{ fontSize: 12, lineHeight: 1, color: isDark ? "var(--blue)" : "var(--text-faint)", transition: "color 0.2s" }}>☾</span>
    </button>
  );
}

function ShareButton() {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button
      onClick={copy}
      title="Copy link to this tool"
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 30, height: 30,
        background: copied ? "var(--green-bg)" : "var(--surface-2)",
        border: `1px solid ${copied ? "var(--green-dim)" : "var(--border)"}`,
        color: copied ? "var(--green)" : "var(--text-muted)",
        borderRadius: 8, cursor: "pointer", transition: "all 0.15s", flexShrink: 0,
      }}
    >
      {copied ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>
      )}
    </button>
  );
}

export default function App() {
  const [activeTool, setActiveTool] = useState(getToolFromPath);
  const [localTime, setLocalTime] = useState(new Date().toLocaleTimeString());
  const [localDate, setLocalDate] = useState(new Date().toLocaleDateString());
  const [theme, setTheme] = useState(() => localStorage.getItem("syskit-theme") || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("syskit-theme", theme);
  }, [theme]);

  useEffect(() => {
    const current = window.location.pathname.replace(/^\//, "").split("/")[0];
    if (current !== activeTool) {
      history.pushState({}, "", "/" + activeTool);
    }
  }, [activeTool]);

  useEffect(() => {
    const onPop = () => setActiveTool(getToolFromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLocalTime(now.toLocaleTimeString());
      setLocalDate(now.toLocaleDateString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const activeMeta = TOOLS.find((t) => t.id === activeTool);
  const ActiveComponent = activeMeta?.Component || ChmodCalculator;

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: "var(--sidebar-w)", flexShrink: 0,
        background: "var(--surface)", borderRight: "1px solid var(--border)",
        display: "flex", flexDirection: "column",
        height: "100vh", overflow: "hidden",
      }}>

        {/* Brand */}
        <div style={{ height: "var(--header-h)", display: "flex", alignItems: "center", padding: "0 1.25rem", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--lg)", fontWeight: 700, color: "var(--green)", letterSpacing: "0.04em" }}>syskit<span style={{ color: "var(--text-faint)" }}>:</span></span>
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, padding: "0.75rem 0.5rem", overflowY: "auto" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-faint)", padding: "0.5rem 0.75rem 0.5rem", marginBottom: 4 }}>Tools</div>
          {TOOLS.map((tool) => {
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", border: `1px solid ${isActive ? "var(--green-dim)" : "transparent"}`, background: isActive ? "var(--green-bg)" : "transparent", borderRadius: 10, cursor: "pointer", textAlign: "left", transition: "all 0.13s", marginBottom: 2 }}
              >
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", fontWeight: 700, color: isActive ? "var(--green)" : "var(--text-faint)", background: isActive ? "rgba(46,204,113,0.12)" : "var(--surface-2)", border: `1px solid ${isActive ? "var(--green-dim)" : "var(--border)"}`, borderRadius: 8, padding: "2px 6px", flexShrink: 0, minWidth: 40, textAlign: "center", transition: "all 0.13s" }}>
                  {tool.glyph}
                </span>
                <span style={{ fontSize: "var(--md)", fontWeight: 500, color: isActive ? "var(--green)" : "var(--text-muted)", transition: "color 0.13s" }}>
                  {tool.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Clock footer */}
        <div style={{ padding: "0.85rem 1.25rem", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", animation: "pulse 2.5s ease-in-out infinite", flexShrink: 0, marginTop: 6 }} />
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--sm)", color: "var(--text-muted)", fontWeight: 500 }}>{localTime}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--text-faint)" }}>{localDate} local</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, height: "100vh", overflow: "hidden" }}>

        {/* Header */}
        <header style={{ height: "var(--header-h)", flexShrink: 0, background: "var(--surface)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 2.5rem", gap: 10 }}>
          <span style={{ fontSize: "var(--md)", fontWeight: 600, color: "var(--text)" }}>
            {activeMeta?.label}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--text-faint)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "2px 9px" }}>
            {activeMeta?.badge}
          </span>
          <ShareButton />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </header>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "2rem 2.5rem 0" }}>
          <div style={{ width: "100%", maxWidth: 960, margin: "0 auto", paddingBottom: "5rem" }}>
            <ActiveComponent key={activeTool} />
          </div>
        </div>
      </div>
    </div>
  );
}
