import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────
   GLOBAL STYLES  (injected once via <style> tag)
───────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  /* surfaces */
  --bg:          #0b0f1a;
  --surface:     #111827;
  --surface-2:   #182030;
  --surface-3:   #1e2d42;
  --surface-4:   #243350;

  /* borders */
  --border:      #1e2d47;
  --border-2:    #2d4366;

  /* text — high contrast */
  --text:        #e8edf5;
  --text-muted:  #8fa3bf;
  --text-faint:  #4d6680;

  /* accent — green (primary active) */
  --green:       #2ecc71;
  --green-dim:   #1a7a44;
  --green-bg:    #081a10;

  /* accent — amber (commands / cron) */
  --amber:       #f5a623;
  --amber-dim:   #7a4f0a;
  --amber-bg:    #1a1005;

  /* accent — blue (IP / network) */
  --blue:        #4da6ff;
  --blue-dim:    #1a4a7a;
  --blue-bg:     #051020;

  /* accent — red (errors) */
  --red:         #ff5f5f;
  --red-dim:     #7a1a1a;
  --red-bg:      #1a0505;

  /* accent — purple (RAID) */
  --purple:      #b78fff;
  --purple-dim:  #4a2a7a;
  --purple-bg:   #100a1f;

  /* accent — teal (DNS / nslookup) */
  --teal:        #2dd4bf;
  --teal-dim:    #0d6b60;
  --teal-bg:     #041512;

  /* typography */
  --font-sans: 'IBM Plex Sans', sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;

  /* layout */
  --sidebar-w:   220px;
  --header-h:    54px;

  /* type scale */
  --xs:   0.75rem;
  --sm:   0.875rem;
  --base: 1rem;
  --md:   1.0625rem;
  --lg:   1.1875rem;
  --xl:   1.375rem;
  --2xl:  1.75rem;
  --3xl:  2.25rem;
}

html { font-size: 15px; }

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-sans);
  font-size: var(--base);
  line-height: 1.65;
  min-height: 100vh;
  overflow-x: hidden;
}

body::before {
  content: '';
  position: fixed; inset: 0;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px,
    rgba(0,0,0,0.018) 2px, rgba(0,0,0,0.018) 4px);
  pointer-events: none;
  z-index: 9999;
}

/* inputs / selects / textareas */
input, select, textarea {
  font-family: var(--font-sans);
  font-size: var(--base);
}

button { cursor: pointer; font-family: var(--font-sans); }

/* scrollbar */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--surface); }
::-webkit-scrollbar-thumb { background: var(--border-2); border-radius: 3px; }

/* animations */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: none; }
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.25; }
}
@keyframes ripple {
  0%   { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(4); opacity: 0; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.page-enter { animation: fadeUp 0.22s ease both; }

/* MapLibre reset */
.maplibregl-map { font-family: var(--font-sans); }
`;

/* ─────────────────────────────────────────────────────────────
   SHARED UI PRIMITIVES
───────────────────────────────────────────────────────────── */
const s = {
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "1.2rem 1.5rem",
    marginBottom: "1rem",
    position: "relative",
    overflow: "hidden",
  },
  cardHighlight: {
    position: "absolute", top: 0, left: 0, right: 0, height: 1,
    background: "linear-gradient(90deg,transparent,var(--border-2),transparent)",
  },
  label: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--xs)",
    fontWeight: 600,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--text-faint)",
    marginBottom: "0.9rem",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  labelLine: { flex: 1, height: 1, background: "var(--border)" },
  input: {
    width: "100%",
    padding: "10px 14px",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    color: "var(--text)",
    outline: "none",
    fontSize: "var(--md)",
    fontFamily: "var(--font-sans)",
    transition: "border-color 0.13s",
  },
  monoInput: {
    width: "100%",
    padding: "10px 14px",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    color: "var(--amber)",
    outline: "none",
    fontSize: "var(--lg)",
    fontFamily: "var(--font-mono)",
    fontWeight: 600,
    transition: "border-color 0.13s",
  },
  presetBtn: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--xs)",
    padding: "4px 10px",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: 4,
    color: "var(--text-muted)",
    cursor: "pointer",
    transition: "all 0.12s",
  },
  errBox: {
    fontFamily: "var(--font-mono)",
    fontSize: "var(--sm)",
    color: "var(--red)",
    background: "var(--red-bg)",
    border: "1px solid var(--red-dim)",
    borderRadius: 4,
    padding: "8px 12px",
    marginTop: 10,
  },
};

function Card({ children, style }) {
  return (
    <div style={{ ...s.card, ...style }}>
      <div style={s.cardHighlight} />
      {children}
    </div>
  );
}

function CardLabel({ children }) {
  return (
    <div style={s.label}>
      {children}
      <span style={s.labelLine} />
    </div>
  );
}

function PageHeader({ title, badge, description }) {
  return (
    <div style={{ marginBottom: "1.6rem", paddingBottom: "1rem", borderBottom: "1px solid var(--border)" }}>
      <h1 style={{ fontSize: "var(--xl)", fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 5, display: "flex", alignItems: "center", gap: 10 }}>
        {title}
        {badge && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--text-faint)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 4, padding: "2px 9px" }}>
            {badge}
          </span>
        )}
      </h1>
      {description && <p style={{ fontSize: "var(--sm)", color: "var(--text-muted)" }}>{description}</p>}
    </div>
  );
}

function PresetRow({ presets, onSelect }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
      {presets.map((p) => (
        <button
          key={p.label}
          onClick={() => onSelect(p.value)}
          onMouseEnter={() => setHovered(p.label)}
          onMouseLeave={() => setHovered(null)}
          style={{
            ...s.presetBtn,
            background: hovered === p.label ? "var(--surface-3)" : "var(--surface-2)",
            borderColor: hovered === p.label ? "var(--border-2)" : "var(--border)",
            color: hovered === p.label ? "var(--text)" : "var(--text-muted)",
          }}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ width: 18, height: 18, border: "2px solid var(--border)", borderTopColor: "var(--green)", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
  );
}

function CopyButton({ text, style }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button
      onClick={copy}
      style={{
        fontFamily: "var(--font-mono)", fontSize: "var(--xs)", padding: "3px 9px",
        background: copied ? "var(--green-bg)" : "var(--surface-3)",
        border: `1px solid ${copied ? "var(--green-dim)" : "var(--border)"}`,
        color: copied ? "var(--green)" : "var(--text-muted)",
        borderRadius: 4, cursor: "pointer", transition: "all 0.15s", ...style,
      }}
    >
      {copied ? "copied!" : "copy"}
    </button>
  );
}

function DataTable({ rows, highlightKeys = [], warnKeys = [] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        {rows.map(([label, value]) => {
          const isHighlight = highlightKeys.includes(label);
          const isWarn = warnKeys.includes(label);
          return (
            <tr key={label} style={{ borderBottom: "1px solid var(--border)" }}>
              <td style={{ padding: "9px 5px", fontSize: "var(--xs)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-faint)", width: "44%" }}>
                {label}
              </td>
              <td style={{ padding: "9px 5px", fontFamily: "var(--font-mono)", fontSize: "var(--md)", fontWeight: 500, color: isHighlight ? "var(--green)" : isWarn ? "var(--amber)" : "var(--blue)", wordBreak: "break-all" }}>
                {value}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ─────────────────────────────────────────────────────────────
   1. CHMOD COMPONENT
───────────────────────────────────────────────────────────── */
function ChmodCalculator() {
  const [bits, setBits] = useState({ ur: 0, uw: 0, ux: 0, gr: 0, gw: 0, gx: 0, or: 0, ow: 0, ox: 0 });
  const [copied, setCopied] = useState(false);

  const toggle = (key) => setBits((prev) => ({ ...prev, [key]: prev[key] ^ 1 }));

  const ownerOctal  = bits.ur * 4 + bits.uw * 2 + bits.ux;
  const groupOctal  = bits.gr * 4 + bits.gw * 2 + bits.gx;
  const othersOctal = bits.or * 4 + bits.ow * 2 + bits.ox;

  const symChars = [
    bits.ur ? "r" : "-", bits.uw ? "w" : "-", bits.ux ? "x" : "-",
    bits.gr ? "r" : "-", bits.gw ? "w" : "-", bits.gx ? "x" : "-",
    bits.or ? "r" : "-", bits.ow ? "w" : "-", bits.ox ? "x" : "-",
  ].join("");

  const command = `chmod ${ownerOctal}${groupOctal}${othersOctal} file`;

  const describePerms = (r, w, x) =>
    [r ? "read" : "", w ? "write" : "", x ? "execute" : ""].filter(Boolean).join(", ") || "none";

  const desc = [
    ownerOctal  > 0 ? `Owner: ${describePerms(bits.ur, bits.uw, bits.ux)}`  : "",
    groupOctal  > 0 ? `Group: ${describePerms(bits.gr, bits.gw, bits.gx)}`  : "",
    othersOctal > 0 ? `Others: ${describePerms(bits.or, bits.ow, bits.ox)}` : "",
  ].filter(Boolean).join(" · ") || "No permissions assigned.";

  const copyCmd = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const PermGroup = ({ heading, keys }) => (
    <div>
      <div style={{ fontSize: "var(--xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", textAlign: "center", paddingBottom: 7, borderBottom: "1px solid var(--border)", marginBottom: 9 }}>
        {heading}
      </div>
      <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 13px" }}>
        {keys.map(({ key, label }) => {
          const isOn = bits[key];
          return (
            <div
              key={key}
              onClick={() => toggle(key)}
              style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 0", cursor: "pointer", userSelect: "none" }}
            >
              <div style={{
                width: 18, height: 18, border: `1px solid ${isOn ? "var(--green)" : "var(--border-2)"}`,
                borderRadius: 3, background: isOn ? "var(--green-bg)" : "var(--bg)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all 0.11s", fontFamily: "var(--font-mono)",
                fontSize: 11, fontWeight: 700, color: isOn ? "var(--green)" : "transparent",
              }}>✓</div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--sm)", color: isOn ? "var(--green)" : "var(--text-muted)", transition: "color 0.11s" }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="page-enter">
      <PageHeader title="chmod calculator" badge="permissions" description="Toggle permission bits to compute the octal mode and symbolic notation." />

      <Card>
        <CardLabel>Permission bits</CardLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: "1.2rem" }}>
          <PermGroup heading="Owner (u)" keys={[{ key: "ur", label: "r — read" }, { key: "uw", label: "w — write" }, { key: "ux", label: "x — execute" }]} />
          <PermGroup heading="Group (g)"  keys={[{ key: "gr", label: "r — read" }, { key: "gw", label: "w — write" }, { key: "gx", label: "x — execute" }]} />
          <PermGroup heading="Others (o)" keys={[{ key: "or", label: "r — read" }, { key: "ow", label: "w — write" }, { key: "ox", label: "x — execute" }]} />
        </div>
      </Card>

      <Card>
        <CardLabel>Octal value</CardLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: "1.1rem" }}>
          {[["owner", ownerOctal], ["group", groupOctal], ["others", othersOctal]].map(([lbl, val]) => (
            <div key={lbl} style={{ background: val > 0 ? "var(--green-bg)" : "var(--surface-2)", border: `1px solid ${val > 0 ? "var(--green-dim)" : "var(--border)"}`, borderRadius: 6, padding: "16px 10px", textAlign: "center", transition: "all 0.2s" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--3xl)", fontWeight: 700, color: "var(--green)", lineHeight: 1, display: "block" }}>{val}</span>
              <div style={{ fontSize: "var(--xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-faint)", marginTop: 5 }}>{lbl}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "13px 17px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)" }}>Command</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                onClick={copyCmd}
                title="Click to copy"
                style={{ fontFamily: "var(--font-mono)", fontSize: "var(--lg)", fontWeight: 600, color: "var(--amber)", cursor: "pointer" }}
              >
                {command}
              </span>
              <span style={{ display: copied ? "inline-block" : "none", fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--green)", background: "var(--green-bg)", border: "1px solid var(--green-dim)", borderRadius: 3, padding: "1px 6px" }}>
                copied
              </span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)" }}>Symbolic</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--md)", fontWeight: 500, color: "var(--blue)", letterSpacing: "0.06em" }}>-{symChars}</span>
          </div>
        </div>
        <div style={{ fontSize: "var(--sm)", color: "var(--text-muted)" }}>{desc}</div>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. CRONTAB COMPONENT
───────────────────────────────────────────────────────────── */
const CRON_PRESETS = [
  { label: "every minute",   value: "* * * * *" },
  { label: "hourly",         value: "0 * * * *" },
  { label: "daily midnight", value: "0 0 * * *" },
  { label: "weekdays 9am",   value: "0 9 * * 1-5" },
  { label: "every 5 min",    value: "*/5 * * * *" },
  { label: "every 15 min",   value: "*/15 * * * *" },
  { label: "monthly 1st",    value: "0 0 1 * *" },
  { label: "sunday 2am",     value: "0 2 * * 0" },
];

function CrontabCalculator() {
  const [fields, setFields] = useState({ minute: "*", hour: "*", dom: "*", month: "*", dow: "*" });
  const [error, setError] = useState("");

  const fieldOrder = ["minute", "hour", "dom", "month", "dow"];
  const fieldLabels = { minute: "Minute", hour: "Hour", dom: "Day / mo", month: "Month", dow: "Day / wk" };

  const VALID = /^(\*|\*\/\d+|\d+(-\d+)?(,\d+(-\d+)?)*)$/;

  const setPreset = (expr) => {
    const [minute, hour, dom, month, dow] = expr.split(" ");
    setFields({ minute, hour, dom, month, dow });
  };

  const allValid = fieldOrder.every((f) => VALID.test(fields[f]));
  const expression = fieldOrder.map((f) => fields[f]).join(" ");

  const describe = () => {
    const { minute: m, hour: h, dom, month, dow } = fields;
    if ([m, h, dom, month, dow].every((f) => f === "*")) return "Runs every minute, every day";
    if (/^\*\/(\d+)$/.test(m) && h === "*" && dom === "*" && month === "*" && dow === "*") return `Runs every ${m.split("/")[1]} minute(s) continuously`;
    if (m === "0" && h === "*") return "Runs at the top of every hour";
    if (m === "0" && h === "0" && dom === "*" && month === "*" && dow === "*") return "Runs every day at 00:00 (midnight)";
    if (m === "0" && /^\d+$/.test(h) && dom === "*" && month === "*" && dow === "1-5") return `Runs weekdays (Mon–Fri) at ${h.padStart(2, "0")}:00`;
    if (m === "0" && /^\d+$/.test(h) && dom === "*" && month === "*" && dow === "*") return `Runs every day at ${h.padStart(2, "0")}:00`;
    if (m === "0" && h === "0" && dom === "1" && month === "*" && dow === "*") return "Runs at midnight on the 1st of every month";
    return `Scheduled: ${expression}`;
  };

  const cronMatches = (val, v) => {
    if (val === "*") return true;
    if (/^\*\/\d+$/.test(val)) return v % parseInt(val.split("/")[1]) === 0;
    const expanded = [];
    val.split(",").forEach((p) => {
      if (p.includes("-")) { const [a, b] = p.split("-").map(Number); for (let i = a; i <= b; i++) expanded.push(i); }
      else expanded.push(Number(p));
    });
    return expanded.includes(v);
  };

  const nextRuns = () => {
    if (!allValid) return [];
    const { minute: m, hour: h, dom, month, dow } = fields;
    const results = [];
    let cursor = new Date();
    cursor.setSeconds(0, 0);
    cursor = new Date(cursor.getTime() + 60_000);
    let iter = 0;
    while (results.length < 5 && iter < 150_000) {
      iter++;
      if (cronMatches(m, cursor.getMinutes()) && cronMatches(h, cursor.getHours()) && cronMatches(dom, cursor.getDate()) && cronMatches(month, cursor.getMonth() + 1) && cronMatches(dow, cursor.getDay())) {
        results.push(new Date(cursor));
      }
      cursor = new Date(cursor.getTime() + 60_000);
    }
    return results;
  };

  const relTime = (d) => {
    const s = Math.round((d - Date.now()) / 1000);
    if (s < 60) return `in ${s}s`;
    if (s < 3600) return `in ${Math.round(s / 60)}m`;
    if (s < 86400) return `in ${Math.round(s / 3600)}h`;
    return `in ${Math.round(s / 86400)}d`;
  };

  const runs = nextRuns();

  return (
    <div className="page-enter">
      <PageHeader title="crontab calculator" badge="scheduler" description="Build cron expressions and preview the next scheduled runs in local time." />

      <Card>
        <CardLabel>Cron fields</CardLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 9, marginBottom: "1rem" }}>
          {fieldOrder.map((f) => {
            const isInvalid = !VALID.test(fields[f]);
            return (
              <div key={f}>
                <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "var(--xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: 6 }}>
                  {fieldLabels[f]}
                </label>
                <input
                  value={fields[f]}
                  onChange={(e) => setFields((prev) => ({ ...prev, [f]: e.target.value }))}
                  style={{ ...s.monoInput, textAlign: "center", padding: "11px 6px", borderColor: isInvalid ? "var(--red-dim)" : "var(--border)", color: isInvalid ? "var(--red)" : "var(--amber)" }}
                />
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: "var(--xs)", fontFamily: "var(--font-mono)", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7 }}>Quick presets</div>
        <PresetRow presets={CRON_PRESETS} onSelect={setPreset} />
        {!allValid && <div style={s.errBox}>Invalid field — use *, */n, numbers, ranges (1-5), or lists (1,3,5).</div>}
      </Card>

      <Card style={{ opacity: allValid ? 1 : 0.45 }}>
        <CardLabel>Result</CardLabel>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xl)", fontWeight: 700, color: "var(--amber)", letterSpacing: "0.08em", marginBottom: 5 }}>{expression}</div>
        <div style={{ fontSize: "var(--md)", color: "var(--text-muted)", marginBottom: "1rem" }}>{allValid ? describe() : "—"}</div>
        <div style={{ height: 1, background: "var(--border)", marginBottom: "1rem" }} />
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 9 }}>Next 5 runs (local time)</div>
        {runs.length > 0 ? runs.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: i < runs.length - 1 ? "1px solid var(--border)" : "none", fontFamily: "var(--font-mono)", fontSize: "var(--sm)" }}>
            <span style={{ fontSize: "var(--xs)", color: "var(--text-faint)", width: 14, textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
            <span style={{ color: "var(--green)" }}>{r.toLocaleString()}</span>
            <span style={{ color: "var(--text-faint)", fontSize: "var(--xs)", marginLeft: "auto" }}>{relTime(r)}</span>
          </div>
        )) : (
          <div style={{ color: "var(--text-faint)", fontSize: "var(--sm)" }}>
            {allValid ? "Expression too sparse to compute." : "Fix the fields above."}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. CIDR COMPONENT
───────────────────────────────────────────────────────────── */
function CIDRCalculator() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const ipToInt = (ip) => {
    const p = ip.split(".").map(Number);
    if (p.length !== 4 || p.some((o) => isNaN(o) || o < 0 || o > 255)) throw new Error("Invalid IP address");
    return ((p[0] << 24) | (p[1] << 16) | (p[2] << 8) | p[3]) >>> 0;
  };
  const intToIp = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
  const intToBin = (n) => n.toString(2).padStart(32, "0").replace(/(.{8})(?=.)/g, "$1.");

  const calc = (raw) => {
    setInput(raw);
    if (!raw) { setResult(null); setError(""); return; }
    const m = raw.match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/);
    if (!m) { setError("Use CIDR format: 192.168.1.0/24"); setResult(null); return; }
    try {
      const ipInt = ipToInt(m[1]);
      const prefix = parseInt(m[2]);
      if (prefix < 0 || prefix > 32) throw new Error("Prefix must be 0–32");
      const maskInt  = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0;
      const wildInt  = (~maskInt) >>> 0;
      const netInt   = (ipInt & maskInt) >>> 0;
      const bcastInt = (netInt | wildInt) >>> 0;
      const firstInt = prefix === 32 ? netInt : (netInt + 1) >>> 0;
      const lastInt  = prefix === 32 ? bcastInt : prefix === 31 ? bcastInt : (bcastInt - 1) >>> 0;
      const hosts    = prefix >= 31 ? (prefix === 32 ? 1 : 2) : Math.pow(2, 32 - prefix) - 2;
      const octets   = m[1].split(".").map(Number);
      const getClass = (f) => f < 128 ? "A" : f < 192 ? "B" : f < 224 ? "C" : f < 240 ? "D (Multicast)" : "E (Reserved)";
      const getType  = (o) => {
        if (o[0] === 10) return "Private — RFC 1918";
        if (o[0] === 172 && o[1] >= 16 && o[1] <= 31) return "Private — RFC 1918";
        if (o[0] === 192 && o[1] === 168) return "Private — RFC 1918";
        if (o[0] === 127) return "Loopback";
        if (o[0] === 169 && o[1] === 254) return "Link-local (APIPA)";
        if (o[0] === 100 && o[1] >= 64 && o[1] < 128) return "Shared / CGN — RFC 6598";
        return "Public (routable)";
      };
      setError("");
      setResult({ network: intToIp(netInt), broadcast: intToIp(bcastInt), mask: intToIp(maskInt), wild: intToIp(wildInt), first: intToIp(firstInt), last: intToIp(lastInt), hosts: hosts.toLocaleString(), prefix: `/${prefix}`, ipClass: getClass(octets[0]), type: getType(octets), binary: intToBin(maskInt), hostPct: Math.min(100, Math.max(0.5, prefix / 32 * 100)), prefixLen: prefix });
    } catch (e) { setError(e.message); setResult(null); }
  };

  const CIDR_PRESETS = [
    { label: "192.168.1.0/24", value: "192.168.1.0/24" },
    { label: "10.0.0.0/8",     value: "10.0.0.0/8" },
    { label: "172.16.0.0/12",  value: "172.16.0.0/12" },
    { label: "k8s svc /12",    value: "10.96.0.0/12" },
    { label: "pod net /16",    value: "10.244.0.0/16" },
    { label: "CGN /10",        value: "100.64.0.0/10" },
  ];

  return (
    <div className="page-enter">
      <PageHeader title="CIDR calculator" badge="networking" description="Expand any IPv4 CIDR block into full network details and host range." />
      <Card>
        <CardLabel>Network address (CIDR notation)</CardLabel>
        <input value={input} onChange={(e) => calc(e.target.value)} placeholder="192.168.1.0/24" style={{ ...s.monoInput, borderColor: error ? "var(--red-dim)" : "var(--border)", color: error && input ? "var(--red)" : "var(--blue)", fontSize: "var(--xl)" }} />
        <PresetRow presets={CIDR_PRESETS} onSelect={(v) => calc(v)} />
        {error && <div style={s.errBox}>{error}</div>}
      </Card>

      {result && (
        <Card>
          <CardLabel>Network details</CardLabel>
          <DataTable
            highlightKeys={["Network address", "First usable host", "Last usable host"]}
            warnKeys={["Usable hosts"]}
            rows={[
              ["Network address",  result.network],
              ["Broadcast address",result.broadcast],
              ["Subnet mask",      result.mask],
              ["Wildcard mask",    result.wild],
              ["First usable host",result.first],
              ["Last usable host", result.last],
              ["Usable hosts",     result.hosts],
              ["CIDR prefix",      result.prefix],
              ["IP class",         result.ipClass],
              ["Type",             result.type],
              ["Binary mask",      result.binary],
            ]}
          />
          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Host space utilisation</div>
            <div style={{ height: 5, background: "var(--surface-3)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${result.hostPct.toFixed(1)}%`, background: "linear-gradient(90deg,var(--green),var(--blue))", borderRadius: 3, transition: "width 0.4s cubic-bezier(.4,0,.2,1)" }} />
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--text-faint)", marginTop: 5 }}>
              /{result.prefixLen} → {result.hosts} hosts ({32 - result.prefixLen} host bits, {result.prefixLen} network bits)
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   4. RAID COMPONENT
───────────────────────────────────────────────────────────── */
const RAID_SPECS = {
  0:  { name:"RAID 0",  min:2,  fault:0, read:"Excellent (n× speed)",       write:"Excellent (n× speed)",       rebuild:"None — zero redundancy" },
  1:  { name:"RAID 1",  min:2,  fault:1, read:"Good (read from any mirror)", write:"Same as single drive",       rebuild:"Low" },
  5:  { name:"RAID 5",  min:3,  fault:1, read:"Good",                        write:"Good (parity overhead)",     rebuild:"High — all drives read" },
  6:  { name:"RAID 6",  min:4,  fault:2, read:"Good",                        write:"Moderate (double parity)",   rebuild:"Very high" },
  10: { name:"RAID 10", min:4,  fault:1, read:"Excellent",                   write:"Good",                       rebuild:"Low to moderate" },
  50: { name:"RAID 50", min:6,  fault:1, read:"Excellent",                   write:"Good",                       rebuild:"Moderate" },
  60: { name:"RAID 60", min:8,  fault:2, read:"Excellent",                   write:"Moderate",                   rebuild:"High" },
  Z2: { name:"RAIDZ2",  min:4,  fault:2, read:"Good",                        write:"Moderate",                   rebuild:"Moderate (variable stripe)" },
};

function RAIDCalculator() {
  const [level, setLevel] = useState(0);
  const [drives, setDrives] = useState(4);
  const [driveSize, setDriveSize] = useState(4);
  const [unit, setUnit] = useState("TB");
  const [overhead, setOverhead] = useState(0.93);
  const [error, setError] = useState("");

  const specs = RAID_SPECS[level];
  const raw   = drives * driveSize;

  let usableRaw = 0, dataDrives = 0, parityDrives = 0;
  let calcError = "";

  if (drives < specs.min) {
    calcError = `${specs.name} requires at least ${specs.min} drives.`;
  } else if (level === 10 && drives % 2 !== 0) {
    calcError = "RAID 10 requires an even number of drives.";
  } else {
    if (level === 0)  { dataDrives = drives;     parityDrives = 0;                       usableRaw = raw; }
    if (level === 1)  { dataDrives = 1;          parityDrives = drives - 1;              usableRaw = driveSize; }
    if (level === 5)  { dataDrives = drives - 1; parityDrives = 1;                       usableRaw = (drives - 1) * driveSize; }
    if (level === 6)  { dataDrives = drives - 2; parityDrives = 2;                       usableRaw = (drives - 2) * driveSize; }
    if (level === 10) { dataDrives = drives / 2; parityDrives = drives / 2;              usableRaw = (drives / 2) * driveSize; }
    if (level === 50) { const g = Math.max(2, Math.floor(drives / 3)); parityDrives = g; dataDrives = drives - g; usableRaw = dataDrives * driveSize; }
    if (level === 60) { const g = Math.max(2, Math.floor(drives / 4)); parityDrives = g * 2; dataDrives = drives - parityDrives; usableRaw = dataDrives * driveSize; }
    if (level === "Z2") { dataDrives = drives - 2; parityDrives = 2; usableRaw = (drives - 2) * driveSize; }
  }

  const usable   = usableRaw * overhead;
  const ohCap    = raw - usable;
  const eff      = raw > 0 ? (usableRaw / raw * 100) : 0;
  const fmt      = (v) => v >= 1000 ? `${(v / 1000).toFixed(2)} P` : v >= 1 ? v.toFixed(2) : `${(v * 1024).toFixed(1)} m`;
  const usablePct = raw > 0 ? Math.min(100, usableRaw / raw * 100) : 0;
  const parityPct = raw > 0 ? Math.min(100, (raw - usableRaw) / raw * 100) : 0;

  const LEVELS = [0, 1, 5, 6, 10, 50, 60, "Z2"];
  const LEVEL_DESC = { 0:"Striping", 1:"Mirroring", 5:"Dist. parity", 6:"Dual parity", 10:"Mirror+stripe", 50:"RAID 5+stripe", 60:"RAID 6+stripe", Z2:"ZFS dual-p" };

  return (
    <div className="page-enter">
      <PageHeader title="RAID calculator" badge="storage" description="Compute usable capacity, fault tolerance, and efficiency for common RAID levels." />

      <Card>
        <CardLabel>RAID level</CardLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: "1rem" }}>
          {LEVELS.map((l) => {
            const isActive = l === level;
            return (
              <button
                key={l}
                onClick={() => setLevel(l)}
                style={{ padding: "11px 7px", background: isActive ? "var(--green-bg)" : "var(--surface-2)", border: `1px solid ${isActive ? "var(--green-dim)" : "var(--border)"}`, borderRadius: 6, cursor: "pointer", textAlign: "center", transition: "all 0.13s", fontFamily: "var(--font-mono)" }}
              >
                <span style={{ fontSize: "var(--md)", fontWeight: 700, color: isActive ? "var(--green)" : "var(--text-muted)", display: "block", lineHeight: 1, marginBottom: 3 }}>{RAID_SPECS[l].name}</span>
                <span style={{ fontSize: "var(--xs)", color: isActive ? "var(--green-dim)" : "var(--text-faint)", fontFamily: "var(--font-sans)" }}>{LEVEL_DESC[l]}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { label: "Number of drives", id: "drives", type: "number", value: drives, onChange: (v) => setDrives(parseInt(v) || 0), min: 1, max: 64 },
            { label: "Drive capacity",   id: "size",   type: "number", value: driveSize, onChange: (v) => setDriveSize(parseFloat(v) || 0), min: 0.1, max: 100000, step: 0.1 },
          ].map(({ label, id, type, value, onChange, ...rest }) => (
            <div key={id} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)" }}>{label}</label>
              <input type={type} value={value} onChange={(e) => onChange(e.target.value)} {...rest}
                style={{ ...s.monoInput, color: "var(--purple)", fontSize: "var(--lg)" }} />
            </div>
          ))}
          {[
            { label: "Capacity unit", id: "unit", value: unit, onChange: setUnit, options: ["TB","GB","TiB","GiB"] },
            { label: "FS overhead",   id: "oh",   value: overhead, onChange: (v) => setOverhead(parseFloat(v)), options: [{ label: "None (raw)", value: 1 }, { label: "~7% typical", value: 0.93 }, { label: "~10%", value: 0.90 }, { label: "~15%", value: 0.85 }] },
          ].map(({ label, id, value, onChange, options }) => (
            <div key={id} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <label style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)" }}>{label}</label>
              <select value={value} onChange={(e) => onChange(e.target.value)}
                style={{ ...s.monoInput, color: "var(--purple)", fontSize: "var(--lg)" }}>
                {options.map((o) => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          ))}
        </div>
        {calcError && <div style={s.errBox}>{calcError}</div>}
      </Card>

      {!calcError && (
        <Card>
          <CardLabel>Capacity summary</CardLabel>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: "1rem" }}>
            {[
              { label: "Usable",    value: fmt(usable),  unit, color: "var(--green)",  border: "var(--green-dim)" },
              { label: "Overhead",  value: fmt(ohCap),   unit, color: "var(--amber)",  border: "var(--amber-dim)" },
              { label: "Raw total", value: fmt(raw),     unit, color: "var(--purple)", border: "var(--purple-dim)" },
            ].map(({ label, value, unit: u, color, border }) => (
              <div key={label} style={{ background: "var(--surface-2)", border: `1px solid ${border}`, borderRadius: 6, padding: "13px 10px", textAlign: "center" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--3xl)", fontWeight: 700, color, lineHeight: 1, display: "block" }}>{value}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--sm)", color: "var(--text-faint)" }}>{u}</span>
                <div style={{ fontSize: "var(--xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--xs)", color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginBottom: 5 }}>
              <span>Usable {usablePct.toFixed(0)}%</span>
              <span>Overhead {parityPct.toFixed(0)}%</span>
            </div>
            <div style={{ height: 8, background: "var(--surface-3)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
              <div style={{ height: "100%", width: `${usablePct.toFixed(1)}%`, background: "linear-gradient(90deg,var(--green),#22c97a)", borderRadius: 4, transition: "width 0.4s cubic-bezier(.4,0,.2,1)" }} />
              <div style={{ position: "absolute", top: 0, right: 0, height: "100%", width: `${parityPct.toFixed(1)}%`, background: "var(--amber)", opacity: 0.5, transition: "width 0.4s" }} />
            </div>
          </div>

          <CardLabel>Details</CardLabel>
          <DataTable
            highlightKeys={["Usable drives", "Fault tolerance"]}
            warnKeys={["Parity / mirror drives"]}
            rows={[
              ["RAID level",           specs.name],
              ["Configuration",        `${drives} × ${driveSize} ${unit}`],
              ["Usable drives",        `${dataDrives} (data)`],
              ["Parity / mirror drives", `${parityDrives} drive${parityDrives === 1 ? "" : "s"}`],
              ["Fault tolerance",      specs.fault === 0 ? "None" : `${specs.fault} simultaneous failure${specs.fault > 1 ? "s" : ""}`],
              ["Storage efficiency",   `${eff.toFixed(1)}%`],
              ["Min drives required",  specs.min],
              ["Read performance",     specs.read],
              ["Write performance",    specs.write],
              ["Rebuild risk",         specs.rebuild],
            ]}
          />
        </Card>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   5. SED COMMAND GENERATOR
───────────────────────────────────────────────────────────── */
function SedGenerator() {
  const [mode, setMode] = useState("substitute");
  const [pattern, setPattern] = useState("foo");
  const [replacement, setReplacement] = useState("bar");
  const [flags, setFlags] = useState({ g: true, i: false, p: false, n: false });
  const [lineRange, setLineRange] = useState("");
  const [filename, setFilename] = useState("file.txt");
  const [inPlace, setInPlace] = useState(false);
  const [backup, setBackup] = useState(".bak");
  const [testInput, setTestInput] = useState("Hello foo world\nFoo is foo\nno match here");

  const buildCommand = () => {
    let cmd = "sed ";
    if (flags.n) cmd += "-n ";
    if (inPlace) cmd += `-i${backup} `;
    const rangePrefix = lineRange ? `${lineRange} ` : "";
    if (mode === "substitute") {
      const f = (flags.g ? "g" : "") + (flags.i ? "I" : "") + (flags.p ? "p" : "");
      cmd += `'${rangePrefix}s/${pattern}/${replacement}/${f}'`;
    } else if (mode === "delete") {
      cmd += `'${rangePrefix}/${pattern}/d'`;
    } else if (mode === "print") {
      cmd += `'${rangePrefix}/${pattern}/p'`;
    } else if (mode === "insert") {
      cmd += `'${rangePrefix}i\\${replacement}'`;
    } else if (mode === "append") {
      cmd += `'${rangePrefix}a\\${replacement}'`;
    }
    cmd += ` ${filename}`;
    return cmd;
  };

  const runPreview = () => {
    if (mode !== "substitute") return testInput;
    try {
      const regexFlags = (flags.g ? "g" : "") + (flags.i ? "i" : "");
      const regex = new RegExp(pattern, regexFlags);
      return testInput.split("\n").map((line) => line.replace(regex, replacement)).join("\n");
    } catch { return "— invalid regex —"; }
  };

  const MODES = [
    { value: "substitute", label: "Substitute" },
    { value: "delete",     label: "Delete lines" },
    { value: "print",      label: "Print matches" },
    { value: "insert",     label: "Insert before" },
    { value: "append",     label: "Append after" },
  ];

  const command = buildCommand();

  return (
    <div className="page-enter">
      <PageHeader title="sed generator" badge="stream editor" description="Build sed commands for text substitution, deletion, insertion, and printing." />

      <Card>
        <CardLabel>Mode</CardLabel>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1rem" }}>
          {MODES.map((m) => (
            <button key={m.value} onClick={() => setMode(m.value)}
              style={{ fontFamily: "var(--font-mono)", fontSize: "var(--sm)", padding: "6px 14px", background: mode === m.value ? "var(--green-bg)" : "var(--surface-2)", border: `1px solid ${mode === m.value ? "var(--green-dim)" : "var(--border)"}`, borderRadius: 4, color: mode === m.value ? "var(--green)" : "var(--text-muted)", cursor: "pointer", transition: "all 0.13s" }}>
              {m.label}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={{ display: "block", fontSize: "var(--xs)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: 5 }}>
              {mode === "substitute" || mode === "delete" || mode === "print" ? "Pattern / regex" : "Line range (optional)"}
            </label>
            <input value={pattern} onChange={(e) => setPattern(e.target.value)} style={{ ...s.monoInput, color: "var(--amber)" }} />
          </div>
          {(mode === "substitute" || mode === "insert" || mode === "append") && (
            <div>
              <label style={{ display: "block", fontSize: "var(--xs)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: 5 }}>
                {mode === "substitute" ? "Replacement" : "Text"}
              </label>
              <input value={replacement} onChange={(e) => setReplacement(e.target.value)} style={{ ...s.monoInput, color: "var(--blue)" }} />
            </div>
          )}
          <div>
            <label style={{ display: "block", fontSize: "var(--xs)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: 5 }}>Line range (e.g. 2,5 or /start/,/end/)</label>
            <input value={lineRange} onChange={(e) => setLineRange(e.target.value)} placeholder="empty = all lines" style={{ ...s.monoInput, color: "var(--purple)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "var(--xs)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: 5 }}>Filename</label>
            <input value={filename} onChange={(e) => setFilename(e.target.value)} style={{ ...s.monoInput, color: "var(--text)" }} />
          </div>
        </div>

        {mode === "substitute" && (
          <div style={{ display: "flex", gap: 16, marginTop: "1rem", flexWrap: "wrap" }}>
            {[{ key: "g", label: "Global (-g)" }, { key: "i", label: "Case-insensitive (-I)" }, { key: "p", label: "Print matches (-p)" }, { key: "n", label: "Silent mode (-n)" }].map(({ key, label }) => (
              <label key={key} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: "var(--sm)", color: flags[key] ? "var(--green)" : "var(--text-muted)", userSelect: "none" }}>
                <div onClick={() => setFlags((f) => ({ ...f, [key]: !f[key] }))}
                  style={{ width: 17, height: 17, border: `1px solid ${flags[key] ? "var(--green)" : "var(--border-2)"}`, borderRadius: 3, background: flags[key] ? "var(--green-bg)" : "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: flags[key] ? "var(--green)" : "transparent", fontFamily: "var(--font-mono)", fontWeight: 700, flexShrink: 0 }}>✓</div>
                {label}
              </label>
            ))}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "1rem" }}>
          <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: "var(--sm)", color: inPlace ? "var(--green)" : "var(--text-muted)", userSelect: "none" }}>
            <div onClick={() => setInPlace((v) => !v)}
              style={{ width: 17, height: 17, border: `1px solid ${inPlace ? "var(--green)" : "var(--border-2)"}`, borderRadius: 3, background: inPlace ? "var(--green-bg)" : "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: inPlace ? "var(--green)" : "transparent", fontFamily: "var(--font-mono)", fontWeight: 700, flexShrink: 0 }}>✓</div>
            In-place edit (-i)
          </label>
          {inPlace && (
            <input value={backup} onChange={(e) => setBackup(e.target.value)} placeholder=".bak"
              style={{ ...s.monoInput, width: 100, fontSize: "var(--sm)" }} />
          )}
        </div>
      </Card>

      <Card>
        <CardLabel>Generated command</CardLabel>
        <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "14px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <code style={{ fontFamily: "var(--font-mono)", fontSize: "var(--md)", fontWeight: 600, color: "var(--amber)", wordBreak: "break-all", flex: 1 }}>{command}</code>
          <CopyButton text={command} />
        </div>
      </Card>

      {mode === "substitute" && (
        <Card>
          <CardLabel>Live preview</CardLabel>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: "var(--xs)", fontFamily: "var(--font-mono)", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Input</div>
              <textarea value={testInput} onChange={(e) => setTestInput(e.target.value)} rows={5}
                style={{ ...s.monoInput, fontSize: "var(--sm)", resize: "vertical", color: "var(--text-muted)" }} />
            </div>
            <div>
              <div style={{ fontSize: "var(--xs)", fontFamily: "var(--font-mono)", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Output</div>
              <pre style={{ fontFamily: "var(--font-mono)", fontSize: "var(--sm)", color: "var(--green)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 14px", minHeight: "5rem", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {runPreview()}
              </pre>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   6. AWK COMMAND GENERATOR
───────────────────────────────────────────────────────────── */
function AwkGenerator() {
  const [separator, setSeparator] = useState(",");
  const [outputSep, setOutputSep] = useState(",");
  const [printFields, setPrintFields] = useState("1,2,3");
  const [filterField, setFilterField] = useState("1");
  const [filterOp, setFilterOp] = useState("==");
  const [filterValue, setFilterValue] = useState("foo");
  const [useFilter, setUseFilter] = useState(false);
  const [beginBlock, setBeginBlock] = useState("");
  const [endBlock, setEndBlock] = useState("");
  const [customBody, setCustomBody] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [filename, setFilename] = useState("file.csv");
  const [testInput, setTestInput] = useState("name,age,city\nAlice,30,Dhaka\nBob,25,Dhaka\nCarol,35,London");

  const buildCommand = () => {
    const fs  = separator === "\\t" ? "\\t" : separator;
    const ofs = outputSep === "\\t" ? "\\t" : outputSep;
    const parts = [];
    if (beginBlock) parts.push(`BEGIN{FS="${fs}";OFS="${ofs}";${beginBlock}}`);
    else parts.push(`BEGIN{FS="${fs}";OFS="${ofs}"}`);

    if (useCustom && customBody) {
      parts.push(`{${customBody}}`);
    } else {
      const fields = printFields.split(",").map((f) => `$${f.trim()}`).join(",");
      const body   = `{print ${fields}}`;
      if (useFilter) parts.push(`$${filterField}${filterOp}"${filterValue}"${body}`);
      else parts.push(body);
    }
    if (endBlock) parts.push(`END{${endBlock}}`);
    return `awk '${parts.join(" ")}' ${filename}`;
  };

  const runPreview = () => {
    if (useCustom) return "(custom body — preview not available)";
    const sep = separator === "\\t" ? "\t" : separator;
    const ofs = outputSep === "\\t" ? "\t" : outputSep;
    return testInput.split("\n").filter((line) => {
      if (!line) return false;
      if (!useFilter) return true;
      const cols = line.split(sep);
      const col  = cols[(parseInt(filterField) || 1) - 1] || "";
      if (filterOp === "==") return col === filterValue;
      if (filterOp === "!=") return col !== filterValue;
      if (filterOp === "~")  { try { return new RegExp(filterValue).test(col); } catch { return false; } }
      if (filterOp === "!~") { try { return !new RegExp(filterValue).test(col); } catch { return true; } }
      return true;
    }).map((line) => {
      const cols = line.split(sep);
      const selected = printFields.split(",").map((f) => cols[(parseInt(f.trim()) || 1) - 1] || "");
      return selected.join(ofs);
    }).join("\n");
  };

  const command = buildCommand();

  return (
    <div className="page-enter">
      <PageHeader title="awk generator" badge="text processor" description="Build awk commands for field extraction, filtering, and data transformation." />

      <Card>
        <CardLabel>Configuration</CardLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "var(--xs)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: 5 }}>Input separator (FS)</label>
            <input value={separator} onChange={(e) => setSeparator(e.target.value)} placeholder="," style={{ ...s.monoInput, color: "var(--amber)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "var(--xs)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: 5 }}>Output separator (OFS)</label>
            <input value={outputSep} onChange={(e) => setOutputSep(e.target.value)} placeholder="," style={{ ...s.monoInput, color: "var(--blue)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "var(--xs)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: 5 }}>Print fields (comma-separated, $NF for last)</label>
            <input value={printFields} onChange={(e) => setPrintFields(e.target.value)} placeholder="1,2,3" style={{ ...s.monoInput, color: "var(--purple)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "var(--xs)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: 5 }}>Filename</label>
            <input value={filename} onChange={(e) => setFilename(e.target.value)} style={{ ...s.monoInput, color: "var(--text)" }} />
          </div>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: "var(--sm)", color: useFilter ? "var(--green)" : "var(--text-muted)", userSelect: "none", marginBottom: useFilter ? "0.8rem" : 0 }}>
          <div onClick={() => setUseFilter((v) => !v)}
            style={{ width: 17, height: 17, border: `1px solid ${useFilter ? "var(--green)" : "var(--border-2)"}`, borderRadius: 3, background: useFilter ? "var(--green-bg)" : "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: useFilter ? "var(--green)" : "transparent", fontFamily: "var(--font-mono)", fontWeight: 700, flexShrink: 0 }}>✓</div>
          Enable row filter
        </label>

        {useFilter && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 8, marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "var(--xs)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: 5 }}>Field #</label>
              <input value={filterField} onChange={(e) => setFilterField(e.target.value)} style={{ ...s.monoInput, color: "var(--amber)" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "var(--xs)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: 5 }}>Operator</label>
              <select value={filterOp} onChange={(e) => setFilterOp(e.target.value)} style={{ ...s.monoInput, color: "var(--purple)" }}>
                {["==", "!=", "~", "!~", ">", "<", ">=", "<="].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "var(--xs)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: 5 }}>Value</label>
              <input value={filterValue} onChange={(e) => setFilterValue(e.target.value)} style={{ ...s.monoInput, color: "var(--blue)" }} />
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: "0.8rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "var(--xs)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: 5 }}>BEGIN block (optional)</label>
            <input value={beginBlock} onChange={(e) => setBeginBlock(e.target.value)} placeholder='e.g. print "header"' style={{ ...s.monoInput, color: "var(--teal)" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "var(--xs)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: 5 }}>END block (optional)</label>
            <input value={endBlock} onChange={(e) => setEndBlock(e.target.value)} placeholder='e.g. print "total: " NR' style={{ ...s.monoInput, color: "var(--teal)" }} />
          </div>
        </div>
      </Card>

      <Card>
        <CardLabel>Generated command</CardLabel>
        <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "14px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <code style={{ fontFamily: "var(--font-mono)", fontSize: "var(--md)", fontWeight: 600, color: "var(--amber)", wordBreak: "break-all", flex: 1 }}>{command}</code>
          <CopyButton text={command} />
        </div>
      </Card>

      <Card>
        <CardLabel>Live preview</CardLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <div style={{ fontSize: "var(--xs)", fontFamily: "var(--font-mono)", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Input</div>
            <textarea value={testInput} onChange={(e) => setTestInput(e.target.value)} rows={6}
              style={{ ...s.monoInput, fontSize: "var(--sm)", resize: "vertical", color: "var(--text-muted)" }} />
          </div>
          <div>
            <div style={{ fontSize: "var(--xs)", fontFamily: "var(--font-mono)", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Output</div>
            <pre style={{ fontFamily: "var(--font-mono)", fontSize: "var(--sm)", color: "var(--green)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, padding: "10px 14px", minHeight: "6rem", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {runPreview()}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   7. IP INFO + MAP COMPONENT
───────────────────────────────────────────────────────────── */
function IPInfoMap() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetch("https://ip.me", { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((data) => { setInfo(data); setLoading(false); })
      .catch(() => {
        fetch("https://ipapi.co/json/")
          .then((r) => r.json())
          .then((data) => { setInfo(data); setLoading(false); })
          .catch(() => { setError("Could not fetch IP info."); setLoading(false); });
      });
  }, []);

  // Load MapLibre dynamically
  useEffect(() => {
    if (!info?.latitude && !info?.lat) return;
    const lat = info.latitude || info.lat;
    const lng = info.longitude || info.lng || info.lon;
    if (!lat || !lng) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js";
    script.onload = () => {
      if (!mapRef.current || mapInstance.current) return;
      const map = new window.maplibregl.Map({
        container: mapRef.current,
        style: {
          version: 8,
          sources: {
            "osm": { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: "© OpenStreetMap" }
          },
          layers: [{ id: "osm", type: "raster", source: "osm" }]
        },
        center: [lng, lat],
        zoom: 10,
      });

      // Custom radiating marker
      const el = document.createElement("div");
      el.style.cssText = `width:20px;height:20px;position:relative;`;
      const dot = document.createElement("div");
      dot.style.cssText = `width:14px;height:14px;background:var(--green);border-radius:50%;border:2px solid #fff;position:absolute;top:3px;left:3px;z-index:2;box-shadow:0 0 0 2px var(--green);`;
      const ring = document.createElement("div");
      ring.style.cssText = `width:40px;height:40px;border:2px solid var(--green);border-radius:50%;position:absolute;top:-10px;left:-10px;animation:ripple 1.8s ease-out infinite;opacity:0.7;`;
      el.appendChild(ring);
      el.appendChild(dot);
      new window.maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
      mapInstance.current = map;
    };
    document.head.appendChild(script);

    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, [info]);

  const lat  = info?.latitude  || info?.lat;
  const lng  = info?.longitude || info?.lng || info?.lon;
  const city = info?.city;
  const region = info?.region || info?.region_name;
  const country = info?.country_name || info?.country;
  const isp  = info?.org || info?.isp;
  const ip   = info?.ip;
  const tz   = info?.timezone;

  return (
    <div className="page-enter">
      <PageHeader title="IP info" badge="network" description="Your current public IP address, geolocation, and ISP details." />

      {loading && (
        <Card>
          <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-muted)" }}>
            <Spinner /> Fetching IP information…
          </div>
        </Card>
      )}

      {error && <div style={s.errBox}>{error}</div>}

      {info && (
        <>
          <Card>
            <CardLabel>Address details</CardLabel>
            <DataTable
              highlightKeys={["IP address"]}
              rows={[
                ["IP address", ip || "—"],
                ["City",       city || "—"],
                ["Region",     region || "—"],
                ["Country",    country || "—"],
                ["ISP / Org",  isp || "—"],
                ["Timezone",   tz || "—"],
                ["Coordinates", lat && lng ? `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}` : "—"],
              ]}
            />
          </Card>

          {lat && lng && (
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <div ref={mapRef} style={{ width: "100%", height: 340 }} />
            </Card>
          )}
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   8. NSLOOKUP / DNS RECORD LOOKUP
───────────────────────────────────────────────────────────── */
function NsLookup() {
  const [domain, setDomain] = useState("example.com");
  const [recordType, setRecordType] = useState("A");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const RECORD_TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA", "PTR", "SRV", "CAA"];

  const lookup = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const res  = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain.trim())}&type=${recordType}`, { headers: { Accept: "application/dns-json" } });
      const data = await res.json();
      setResults(data);
    } catch {
      setError("DNS lookup failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const formatAnswer = (ans) => {
    if (!ans || !ans.length) return null;
    return ans.map((r, i) => {
      const ttl = r.TTL ? `TTL ${r.TTL}s` : "";
      return (
        <div key={i} style={{ padding: "9px 5px", borderBottom: i < ans.length - 1 ? "1px solid var(--border)" : "none" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--md)", color: "var(--green)", wordBreak: "break-all" }}>{r.data}</div>
          <div style={{ fontSize: "var(--xs)", color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginTop: 2 }}>{recordType} record · {ttl}</div>
        </div>
      );
    });
  };

  const STATUS_LABELS = { 0: "NOERROR", 1: "FORMERR", 2: "SERVFAIL", 3: "NXDOMAIN", 4: "NOTIMP", 5: "REFUSED" };

  return (
    <div className="page-enter">
      <PageHeader title="nslookup" badge="DNS lookup" description="Query DNS records for any domain using Cloudflare's DNS-over-HTTPS API." />

      <Card>
        <CardLabel>Query</CardLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginBottom: "1rem" }}>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookup()}
            placeholder="example.com"
            style={{ ...s.monoInput, color: "var(--blue)", fontSize: "var(--lg)" }}
          />
          <button
            onClick={lookup}
            disabled={loading}
            style={{ padding: "10px 22px", background: "var(--green-bg)", border: "1px solid var(--green-dim)", borderRadius: 6, color: "var(--green)", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "var(--md)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}
          >
            {loading ? <Spinner /> : null} Lookup
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {RECORD_TYPES.map((t) => (
            <button key={t} onClick={() => setRecordType(t)}
              style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", padding: "5px 11px", background: recordType === t ? "var(--green-bg)" : "var(--surface-2)", border: `1px solid ${recordType === t ? "var(--green-dim)" : "var(--border)"}`, borderRadius: 4, color: recordType === t ? "var(--green)" : "var(--text-muted)", cursor: "pointer", transition: "all 0.12s" }}>
              {t}
            </button>
          ))}
        </div>
        {error && <div style={s.errBox}>{error}</div>}
      </Card>

      {results && (
        <Card>
          <CardLabel>Results for {domain} ({recordType})</CardLabel>
          <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap" }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", padding: "3px 9px", background: results.Status === 0 ? "var(--green-bg)" : "var(--red-bg)", border: `1px solid ${results.Status === 0 ? "var(--green-dim)" : "var(--red-dim)"}`, borderRadius: 4, color: results.Status === 0 ? "var(--green)" : "var(--red)" }}>
              {STATUS_LABELS[results.Status] || `Status ${results.Status}`}
            </span>
            {results.TC && <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", padding: "3px 9px", background: "var(--amber-bg)", border: "1px solid var(--amber-dim)", borderRadius: 4, color: "var(--amber)" }}>Truncated</span>}
            {results.AD && <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", padding: "3px 9px", background: "var(--green-bg)", border: "1px solid var(--green-dim)", borderRadius: 4, color: "var(--green)" }}>DNSSEC</span>}
          </div>

          {results.Answer && results.Answer.length > 0
            ? formatAnswer(results.Answer)
            : <div style={{ color: "var(--text-muted)", fontSize: "var(--sm)" }}>No {recordType} records found for <strong style={{ color: "var(--text)" }}>{domain}</strong>.</div>}

          {results.Authority && results.Authority.length > 0 && (
            <>
              <div style={{ height: 1, background: "var(--border)", margin: "1rem 0" }} />
              <div style={{ fontSize: "var(--xs)", fontFamily: "var(--font-mono)", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Authority</div>
              {formatAnswer(results.Authority)}
            </>
          )}
        </Card>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   9. EPOCH CONVERTER
───────────────────────────────────────────────────────────── */
function EpochConverter() {
  const [epoch, setEpoch] = useState(() => Math.floor(Date.now() / 1000).toString());
  const [dateInput, setDateInput] = useState("");
  const [liveEpoch, setLiveEpoch] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => setLiveEpoch(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  const parsedMs = epoch ? (epoch.length >= 13 ? parseInt(epoch) : parseInt(epoch) * 1000) : null;
  const dateObj  = parsedMs && !isNaN(parsedMs) ? new Date(parsedMs) : null;

  const fromDate = () => {
    try {
      const d = new Date(dateInput);
      if (isNaN(d)) return;
      setEpoch(Math.floor(d.getTime() / 1000).toString());
    } catch {}
  };

  const pad = (v, n = 2) => String(v).padStart(n, "0");

  const formatRows = dateObj
    ? [
        ["Unix timestamp (s)",  Math.floor(parsedMs / 1000).toString()],
        ["Unix timestamp (ms)", parsedMs.toString()],
        ["UTC",                `${dateObj.toUTCString()}`],
        ["Local time",         `${dateObj.toLocaleString()}`],
        ["ISO 8601",           `${dateObj.toISOString()}`],
        ["Date (local)",       `${dateObj.getFullYear()}-${pad(dateObj.getMonth()+1)}-${pad(dateObj.getDate())}`],
        ["Time (local)",       `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`],
        ["Day of week",        ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dateObj.getDay()]],
        ["Week of year",       `Week ${Math.ceil((dateObj - new Date(dateObj.getFullYear(), 0, 1)) / 604800000)}`],
        ["Timezone offset",    `UTC${dateObj.getTimezoneOffset() <= 0 ? "+" : "-"}${pad(Math.abs(Math.floor(dateObj.getTimezoneOffset() / 60)))}:${pad(Math.abs(dateObj.getTimezoneOffset() % 60))}`],
      ]
    : [];

  return (
    <div className="page-enter">
      <PageHeader title="epoch converter" badge="time" description="Convert between Unix timestamps and human-readable date/time formats." />

      <Card>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: "0.8rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "var(--xs)", fontFamily: "var(--font-mono)", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Current Unix time:</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--md)", fontWeight: 700, color: "var(--green)" }}>{liveEpoch}</span>
          <button onClick={() => setEpoch(liveEpoch.toString())}
            style={{ ...s.presetBtn, marginLeft: 4 }}>use now</button>
        </div>

        <CardLabel>Epoch timestamp</CardLabel>
        <input value={epoch} onChange={(e) => setEpoch(e.target.value)} placeholder="Unix timestamp (s or ms)"
          style={{ ...s.monoInput, color: "var(--amber)", fontSize: "var(--xl)" }} />

        <div style={{ height: 1, background: "var(--border)", margin: "1.2rem 0" }} />
        <CardLabel>From date/time</CardLabel>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="datetime-local" value={dateInput} onChange={(e) => setDateInput(e.target.value)}
            style={{ ...s.input, flex: 1 }} />
          <button onClick={fromDate}
            style={{ padding: "10px 18px", background: "var(--green-bg)", border: "1px solid var(--green-dim)", borderRadius: 6, color: "var(--green)", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "var(--sm)", cursor: "pointer", whiteSpace: "nowrap" }}>
            → Epoch
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          {[
            { label: "Now",          value: () => Math.floor(Date.now() / 1000) },
            { label: "Start of day", value: () => { const d = new Date(); d.setHours(0,0,0,0); return Math.floor(d/1000); } },
            { label: "Start of week",value: () => { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-d.getDay()); return Math.floor(d/1000); } },
            { label: "1 day ago",    value: () => Math.floor(Date.now() / 1000) - 86400 },
            { label: "1 week ago",   value: () => Math.floor(Date.now() / 1000) - 604800 },
            { label: "1 year ago",   value: () => Math.floor(Date.now() / 1000) - 31536000 },
          ].map(({ label, value }) => (
            <button key={label} onClick={() => setEpoch(value().toString())} style={{ ...s.presetBtn }}>{label}</button>
          ))}
        </div>
      </Card>

      {dateObj && (
        <Card>
          <CardLabel>Converted values</CardLabel>
          <DataTable highlightKeys={["Unix timestamp (s)", "Local time", "ISO 8601"]} rows={formatRows} />
        </Card>
      )}
      {epoch && !dateObj && (
        <div style={s.errBox}>Invalid timestamp — enter a valid Unix epoch (seconds or milliseconds).</div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   10. DNS PROPAGATION CHECKER
───────────────────────────────────────────────────────────── */
const DNS_SERVERS = [
  { name: "Cloudflare",   doh: "https://cloudflare-dns.com/dns-query", flag: "🌐" },
  { name: "Google",       doh: "https://dns.google/resolve",           flag: "🔵" },
  { name: "Quad9",        doh: "https://dns.quad9.net/dns-query",      flag: "🛡️" },
  { name: "OpenDNS",      doh: "https://doh.opendns.com/dns-query",    flag: "🔶" },
];

function DnsPropagation() {
  const [domain, setDomain] = useState("example.com");
  const [recordType, setRecordType] = useState("A");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const checkPropagation = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setResults(DNS_SERVERS.map((s) => ({ ...s, status: "checking", answers: [], error: null, latency: null })));

    await Promise.all(
      DNS_SERVERS.map(async (server, idx) => {
        const start = Date.now();
        try {
          const res  = await fetch(`${server.doh}?name=${encodeURIComponent(domain.trim())}&type=${recordType}`, { headers: { Accept: "application/dns-json" } });
          const data = await res.json();
          const latency = Date.now() - start;
          setResults((prev) => prev.map((r, i) => i === idx ? { ...r, status: data.Status === 0 ? "ok" : "nxdomain", answers: data.Answer || [], latency } : r));
        } catch (e) {
          const latency = Date.now() - start;
          setResults((prev) => prev.map((r, i) => i === idx ? { ...r, status: "error", answers: [], error: "Request failed", latency } : r));
        }
      })
    );
    setLoading(false);
  };

  const STATUS_COLORS = { checking: "var(--text-faint)", ok: "var(--green)", nxdomain: "var(--amber)", error: "var(--red)" };
  const STATUS_BG     = { checking: "var(--surface-3)", ok: "var(--green-bg)", nxdomain: "var(--amber-bg)", error: "var(--red-bg)" };
  const STATUS_BORDER = { checking: "var(--border)", ok: "var(--green-dim)", nxdomain: "var(--amber-dim)", error: "var(--red-dim)" };
  const STATUS_LABELS = { checking: "checking…", ok: "propagated", nxdomain: "NXDOMAIN", error: "error" };

  const RECORD_TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CNAME"];

  // Check if all results match — propagation is consistent
  const allAnswers = results.filter((r) => r.status === "ok").map((r) => r.answers.map((a) => a.data).sort().join("|"));
  const isConsistent = allAnswers.length > 0 && allAnswers.every((a) => a === allAnswers[0]);

  return (
    <div className="page-enter">
      <PageHeader title="DNS propagation" badge="checker" description="Check if a DNS record has propagated across multiple resolvers worldwide." />

      <Card>
        <CardLabel>Domain to check</CardLabel>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginBottom: "1rem" }}>
          <input value={domain} onChange={(e) => setDomain(e.target.value)} onKeyDown={(e) => e.key === "Enter" && checkPropagation()}
            placeholder="example.com" style={{ ...s.monoInput, color: "var(--teal)", fontSize: "var(--lg)" }} />
          <button onClick={checkPropagation} disabled={loading}
            style={{ padding: "10px 22px", background: "var(--green-bg)", border: "1px solid var(--green-dim)", borderRadius: 6, color: "var(--green)", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "var(--md)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
            {loading ? <Spinner /> : null} Check
          </button>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {RECORD_TYPES.map((t) => (
            <button key={t} onClick={() => setRecordType(t)}
              style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", padding: "5px 11px", background: recordType === t ? "var(--green-bg)" : "var(--surface-2)", border: `1px solid ${recordType === t ? "var(--green-dim)" : "var(--border)"}`, borderRadius: 4, color: recordType === t ? "var(--green)" : "var(--text-muted)", cursor: "pointer", transition: "all 0.12s" }}>
              {t}
            </button>
          ))}
        </div>
      </Card>

      {results.length > 0 && (
        <>
          {results.filter((r) => r.status === "ok").length > 1 && (
            <Card style={{ border: `1px solid ${isConsistent ? "var(--green-dim)" : "var(--amber-dim)"}`, background: isConsistent ? "var(--green-bg)" : "var(--amber-bg)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "var(--md)", fontWeight: 500, color: isConsistent ? "var(--green)" : "var(--amber)" }}>
                <span style={{ fontSize: "1.2rem" }}>{isConsistent ? "✓" : "⚠"}</span>
                {isConsistent ? "DNS is fully propagated — all servers return the same record." : "Propagation incomplete — servers return different records."}
              </div>
            </Card>
          )}

          {results.map((r, idx) => (
            <Card key={idx} style={{ border: `1px solid ${STATUS_BORDER[r.status]}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: r.answers.length ? "0.8rem" : 0, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "1.1rem" }}>{r.flag}</span>
                  <span style={{ fontWeight: 600, fontSize: "var(--md)" }}>{r.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {r.latency !== null && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--text-faint)" }}>{r.latency}ms</span>
                  )}
                  {r.status === "checking" ? (
                    <Spinner />
                  ) : (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", padding: "3px 9px", background: STATUS_BG[r.status], border: `1px solid ${STATUS_BORDER[r.status]}`, borderRadius: 4, color: STATUS_COLORS[r.status] }}>
                      {STATUS_LABELS[r.status]}
                    </span>
                  )}
                </div>
              </div>

              {r.answers.length > 0 && r.answers.map((ans, ai) => (
                <div key={ai} style={{ fontFamily: "var(--font-mono)", fontSize: "var(--sm)", color: "var(--green)", padding: "5px 0", borderTop: ai === 0 ? "1px solid var(--border)" : "none", wordBreak: "break-all" }}>
                  {ans.data}
                  <span style={{ color: "var(--text-faint)", marginLeft: 10, fontSize: "var(--xs)" }}>TTL {ans.TTL}s</span>
                </div>
              ))}
              {r.error && <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--sm)", color: "var(--red)", marginTop: 4 }}>{r.error}</div>}
            </Card>
          ))}
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   APP SHELL — SIDEBAR + ROUTING
───────────────────────────────────────────────────────────── */
const TOOLS = [
  { id: "chmod",       label: "chmod",      glyph: "rwx",  Component: ChmodCalculator,  badge: "permissions" },
  { id: "cron",        label: "crontab",    glyph: "*/5",  Component: CrontabCalculator, badge: "scheduler" },
  { id: "cidr",        label: "CIDR",       glyph: "/24",  Component: CIDRCalculator,   badge: "networking" },
  { id: "raid",        label: "RAID",       glyph: "R5",   Component: RAIDCalculator,   badge: "storage" },
  { id: "sed",         label: "sed",        glyph: "s//",  Component: SedGenerator,     badge: "stream editor" },
  { id: "awk",         label: "awk",        glyph: "{$1}", Component: AwkGenerator,     badge: "text processor" },
  { id: "ipinfo",      label: "IP info",    glyph: "ip",   Component: IPInfoMap,        badge: "network" },
  { id: "nslookup",    label: "nslookup",   glyph: "DNS",  Component: NsLookup,         badge: "DNS" },
  { id: "epoch",       label: "epoch",      glyph: "ts",   Component: EpochConverter,   badge: "time" },
  { id: "dnsprop",     label: "DNS prop",   glyph: "⇢",    Component: DnsPropagation,   badge: "checker" },
];

export default function App() {
  const [activeTool, setActiveTool] = useState("chmod");
  const [localTime, setLocalTime] = useState(new Date().toLocaleTimeString());
  const [localDate, setLocalDate] = useState(new Date().toLocaleDateString());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setLocalTime(now.toLocaleTimeString());
      setLocalDate(now.toLocaleDateString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const ActiveComponent = TOOLS.find((t) => t.id === activeTool)?.Component || ChmodCalculator;

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div style={{ display: "flex", minHeight: "100vh" }}>

        {/* ── SIDEBAR ── */}
        <aside style={{ width: "var(--sidebar-w, 220px)", flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 100, "--sidebar-w": "220px" }}>

          {/* Brand / header — same height as sticky page header */}
          <div style={{ height: "var(--header-h, 54px)", display: "flex", alignItems: "center", padding: "0 1.25rem", borderBottom: "1px solid var(--border)", flexShrink: 0, gap: 10 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--lg)", fontWeight: 700, color: "var(--green)", letterSpacing: "-0.03em" }}>syskit</span>
            <span style={{ fontSize: "var(--xs)", fontWeight: 500, color: "var(--text-faint)", letterSpacing: "0.08em", textTransform: "uppercase" }}>v3</span>
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
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", border: `1px solid ${isActive ? "var(--green-dim)" : "transparent"}`, background: isActive ? "var(--green-bg)" : "transparent", borderRadius: 6, cursor: "pointer", textAlign: "left", transition: "all 0.13s", marginBottom: 2 }}
                >
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", fontWeight: 700, color: isActive ? "var(--green)" : "var(--text-faint)", background: isActive ? "rgba(46,204,113,0.12)" : "var(--surface-2)", border: `1px solid ${isActive ? "var(--green-dim)" : "var(--border)"}`, borderRadius: 4, padding: "2px 6px", flexShrink: 0, minWidth: 40, textAlign: "center", transition: "all 0.13s" }}>
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
        <div style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column" }}>

          {/* Sticky page header — aligned with sidebar header */}
          <header style={{ height: "var(--header-h, 54px)", background: "var(--surface)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", padding: "0 2.5rem", position: "sticky", top: 0, zIndex: 50, flexShrink: 0, gap: 12 }}>
            <span style={{ fontSize: "var(--md)", fontWeight: 600, color: "var(--text)" }}>
              {TOOLS.find((t) => t.id === activeTool)?.label}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--text-faint)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 4, padding: "2px 9px" }}>
              {TOOLS.find((t) => t.id === activeTool)?.badge}
            </span>
          </header>

          {/* Centered content column */}
          <div style={{ flex: 1, padding: "2rem 2.5rem 5rem", display: "flex", justifyContent: "center" }}>
            <div style={{ width: "100%", maxWidth: 800 }}>
              <ActiveComponent key={activeTool} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
