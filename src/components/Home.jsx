import { useState } from "react";
import { s } from "./shared/index.jsx";
import atsiomLogo from "../assets/atsiom-logo.png";

const TOOL_DESC = {
  chmod:     "Calculate Unix file permission bits and generate the chmod command.",
  cron:      "Build cron expressions and preview the human-readable schedule.",
  cidr:      "Subnet calculator — usable hosts, network address, and IP range.",
  raid:      "Compute usable storage, fault tolerance, and efficiency for RAID levels.",
  sed:       "Generate sed substitution and deletion commands interactively.",
  awk:       "Build awk one-liners for field extraction and pattern filtering.",
  ipinfo:    "Geo-locate any IP address with ISP details and a live map.",
  nslookup:  "Query A, AAAA, MX, TXT, NS, and CNAME records via DNS-over-HTTPS.",
  epoch:     "Convert Unix timestamps to human-readable time and back.",
  dnsprop:   "Check DNS propagation across multiple global resolvers.",
  urlencode: "Percent-encode and decode URLs and query strings.",
  base64:    "Encode plain text to Base64 and decode Base64 strings.",
  regex:     "Test regular expressions with live match highlighting.",
  jwt:       "Inspect JWT header and payload claims without verifying the signature.",
};

const BADGE_COLOR = {
  permissions:      "var(--amber)",
  scheduler:        "var(--green)",
  networking:       "var(--blue)",
  storage:          "var(--purple)",
  "stream editor":  "var(--teal)",
  "text processor": "var(--green)",
  network:          "var(--blue)",
  DNS:              "var(--amber)",
  time:             "var(--teal)",
  checker:          "var(--green)",
  encoding:         "var(--purple)",
  pattern:          "var(--red)",
  auth:             "var(--amber)",
};

export default function Home({ tools, onSelect }) {
  const [search, setSearch]   = useState("");
  const [hovered, setHovered] = useState(null);

  const visible = tools
    .filter((t) => t.id !== "disclaimer")
    .filter((t) => {
      const q = search.toLowerCase();
      if (!q) return true;
      return (
        t.label.toLowerCase().includes(q) ||
        t.badge.toLowerCase().includes(q) ||
        (TOOL_DESC[t.id] ?? "").toLowerCase().includes(q)
      );
    });

  return (
    <div>

      {/* ── Hero ── */}
      <div style={{ textAlign: "center", padding: "2rem 1rem 2.5rem" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--2xl)", fontWeight: 400, color: "var(--green)", letterSpacing: "0.04em", marginBottom: 10 }}>
          syskit<span style={{ color: "var(--text-faint)" }}>:</span>
        </div>
        <p style={{ fontSize: "var(--md)", color: "var(--text-muted)", marginBottom: "1.8rem", maxWidth: 420, margin: "0 auto 1.8rem" }}>
          Browser-based tools for developers and sysadmins. No accounts, no tracking.
        </p>

        {/* Search */}
        <div style={{ maxWidth: 440, margin: "0 auto", position: "relative" }}>
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-faint)", pointerEvents: "none" }}
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools…"
            autoFocus
            style={{ ...s.input, paddingLeft: 36, fontSize: "var(--md)", textAlign: "center" }}
          />
        </div>
      </div>

      {/* ── Tool grid ── */}
      <div className="tool-grid" style={{ marginBottom: "3.5rem" }}>
        {visible.map((tool) => {
          const color = BADGE_COLOR[tool.badge] ?? "var(--text-muted)";
          const isHov = hovered === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onSelect(tool.id)}
              onMouseEnter={() => setHovered(tool.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start",
                padding: "1.1rem 1.2rem", gap: 10, width: "100%",
                background: isHov ? "var(--surface-2)" : "var(--surface)",
                border: `1px solid ${isHov ? color : "var(--border)"}`,
                borderRadius: 12, cursor: "pointer", textAlign: "left",
                transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--sm)", fontWeight: 600, color, background: "var(--surface-2)", border: `1px solid var(--border)`, borderRadius: 8, padding: "3px 10px" }}>
                  {tool.glyph}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-faint)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "2px 7px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {tool.badge}
                </span>
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--md)", fontWeight: 500, color: isHov ? "var(--text)" : "var(--text-muted)", marginBottom: 4, transition: "color 0.13s" }}>
                  {tool.label}
                </div>
                <div style={{ fontSize: "var(--sm)", color: "var(--text-faint)", lineHeight: 1.55 }}>
                  {TOOL_DESC[tool.id] ?? ""}
                </div>
              </div>
            </button>
          );
        })}

        {visible.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem 1rem", color: "var(--text-faint)", fontFamily: "var(--font-mono)", fontSize: "var(--sm)" }}>
            No tools match &ldquo;{search}&rdquo;
          </div>
        )}
      </div>

      {/* ── About ── */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "2rem", marginBottom: "4rem" }}>
        <h2 style={{ fontFamily: "var(--font-mono)", fontSize: "var(--lg)", fontWeight: 500, color: "var(--text)", marginBottom: "1.1rem" }}>
          What is syskit?
        </h2>
        <p style={{ fontSize: "var(--md)", color: "var(--text-muted)", lineHeight: 1.85, marginBottom: "0.9rem" }}>
          syskit is a free toolkit for people who work with servers, code, or networks.
          Things like Unix permissions, cron schedules, subnets, and timestamps are useful all the time —
          but easy to forget. syskit puts everything in one place so you can look things up and get answers fast.
        </p>
        <p style={{ fontSize: "var(--md)", color: "var(--text-muted)", lineHeight: 1.85, marginBottom: "0.9rem" }}>
          Everything runs directly in your browser. Nothing is sent to a server,
          there are no accounts to create, and no data is collected. It even works offline once the page has loaded.
        </p>
        <p style={{ fontSize: "var(--md)", color: "var(--text-muted)", lineHeight: 1.85 }}>
          Built and maintained by{" "}
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, verticalAlign: "middle" }}>
            <img src={atsiomLogo} alt="Atsiom" style={{ width: 18, height: 18, borderRadius: 4, objectFit: "cover" }} />
            <span style={{ color: "var(--text)", fontWeight: 500 }}>Atsiom LLC</span>
          </span>.
        </p>
      </div>

    </div>
  );
}
