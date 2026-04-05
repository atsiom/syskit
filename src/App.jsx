import { useState, useEffect, useRef } from "react";
import atsiomLogo from "./assets/atsiom-logo.png";
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
        padding: "2px 0",
      }}
    >
      <span style={{ fontSize: 16, lineHeight: 1, color: isDark ? "var(--text-faint)" : "var(--amber)", transition: "color 0.2s" }}>☀</span>
      <span style={{
        display: "inline-flex", alignItems: "center",
        width: 40, height: 22, borderRadius: 11,
        background: isDark ? "var(--green-dim)" : "var(--surface-3)",
        border: "1px solid var(--border-2)",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}>
        <span style={{
          position: "absolute", left: isDark ? 20 : 2,
          width: 16, height: 16, borderRadius: "50%",
          background: isDark ? "var(--green)" : "var(--text-muted)",
          transition: "left 0.2s, background 0.2s", flexShrink: 0,
        }} />
      </span>
      <span style={{ fontSize: 16, lineHeight: 1, color: isDark ? "var(--blue)" : "var(--text-faint)", transition: "color 0.2s" }}>☾</span>
    </button>
  );
}


export default function App() {
  const [activeTool, setActiveTool] = useState(getToolFromPath);
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


  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const scrollRef = useRef(null);
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; }, [activeTool]);

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
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--lg)", fontWeight: 400, color: "var(--green)", letterSpacing: "0.04em" }}>syskit<span style={{ color: "var(--text-faint)" }}>:</span></span>
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, padding: "0.75rem 0.5rem", overflowY: "auto" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", fontWeight: 400, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-faint)", padding: "0.5rem 0.75rem 0.5rem", marginBottom: 4 }}>Tools</div>
          {TOOLS.map((tool) => {
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
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
        <header style={{ height: "var(--header-h)", flexShrink: 0, background: "var(--surface)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 2.5rem", gap: 10 }}>
          <span style={{ fontSize: "var(--md)", fontWeight: 600, color: "var(--text)" }}>
            {activeMeta?.label}
          </span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--text-faint)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "2px 9px" }}>
            {activeMeta?.badge}
          </span>
          <div style={{ flex: 1 }} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </header>

        {/* Scrollable content */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "2rem 2.5rem 0" }}>
          <div style={{ width: "100%", maxWidth: 960, margin: "0 auto", paddingBottom: "5rem" }}>
            <ActiveComponent key={activeTool} />
          </div>
        </div>
      </div>
    </div>
  );
}
