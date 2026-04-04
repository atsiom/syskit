import { useState, useRef, useEffect } from "react";

/* ─────────────────────────────────────────────────────────────
   SHARED STYLE TOKENS
───────────────────────────────────────────────────────────── */
export const s = {
  card: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    marginBottom: "1rem",
    position: "relative",
  },
  cardBody: {
    padding: "1.2rem 1.5rem",
  },
  input: {
    width: "100%",
    padding: "10px 14px",
    background: "var(--surface-2)",
    border: "2px solid var(--border-2)",
    borderRadius: 10,
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
    border: "2px solid var(--border-2)",
    borderRadius: 10,
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
    borderRadius: 8,
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
    borderRadius: 8,
    padding: "8px 12px",
    marginTop: 10,
  },
};

/* ─────────────────────────────────────────────────────────────
   SHARED COMPONENTS
───────────────────────────────────────────────────────────── */

// Card wraps children with an optional title header bar
export function Card({ children, title, style, bodyStyle }) {
  return (
    <div style={{ ...s.card, ...style }}>
      {title && (
        <div style={{
          padding: "0.55rem 1.5rem",
          background: "var(--surface-2)",
          borderBottom: "1px solid var(--border)",
          borderRadius: "12px 12px 0 0",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--xs)",
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--text-faint)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}>
          {title}
        </div>
      )}
      <div style={{ ...s.cardBody, ...bodyStyle }}>
        {children}
      </div>
    </div>
  );
}

// CardLabel is now a section divider inside a card body (no line)
export function CardLabel({ children }) {
  return (
    <div style={{
      fontFamily: "var(--font-mono)",
      fontSize: "var(--xs)",
      fontWeight: 600,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--text-faint)",
      marginBottom: "0.8rem",
      display: "flex",
      alignItems: "center",
      gap: 8,
    }}>
      {children}
    </div>
  );
}

export function PageHeader({ title, badge, description }) {
  const capitalize = (str) => str.replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <div style={{ marginBottom: "1.6rem" }}>
      <h1 style={{ fontSize: "var(--xl)", fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 5, display: "flex", alignItems: "center", gap: 10 }}>
        {capitalize(title)}
        {badge && (
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--text-faint)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "2px 9px" }}>
            {badge}
          </span>
        )}
      </h1>
      {description && <p style={{ fontSize: "var(--sm)", color: "var(--text-muted)" }}>{description}</p>}
    </div>
  );
}

export function PresetRow({ presets, onSelect }) {
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

export function Spinner() {
  return (
    <div style={{ width: 18, height: 18, border: "2px solid var(--border)", borderTopColor: "var(--green)", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block", flexShrink: 0 }} />
  );
}

export function CopyButton({ text, style }) {
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
        borderRadius: 8, cursor: "pointer", transition: "all 0.15s", ...style,
      }}
    >
      {copied ? "copied!" : "copy"}
    </button>
  );
}

export function DataTable({ rows, highlightKeys = [], warnKeys = [] }) {
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

// CustomSelect: styled dropdown that replaces native <select>
// options: array of strings OR array of { label, value }
export function CustomSelect({ options, value, onChange, color = "var(--purple)" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const normalize = (o) => typeof o === "object" ? o : { label: o, value: o };
  const selected = options.map(normalize).find((o) => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%", height: 42, padding: "0 14px",
          background: "var(--surface-2)", border: "2px solid var(--border-2)",
          borderRadius: 10, color, fontFamily: "var(--font-mono)", fontWeight: 600,
          fontSize: "var(--md)", display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 8, cursor: "pointer",
          transition: "border-color 0.13s",
        }}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected?.label ?? value}
        </span>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s", opacity: 0.6 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 200,
          background: "var(--surface)", border: "1px solid var(--border-2)",
          borderRadius: 10, overflow: "hidden",
          boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
        }}>
          {options.map(normalize).map((o) => {
            const isActive = o.value === value;
            return (
              <button
                key={String(o.value)}
                onClick={() => { onChange(o.value); setOpen(false); }}
                style={{
                  width: "100%", padding: "9px 14px", border: "none",
                  borderBottom: "1px solid var(--border)",
                  background: isActive ? "var(--green-bg)" : "transparent",
                  color: isActive ? "var(--green)" : "var(--text-muted)",
                  fontFamily: "var(--font-mono)", fontSize: "var(--sm)",
                  textAlign: "left", cursor: "pointer", transition: "background 0.1s",
                }}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Stepper: custom +/- number input with editable center
export function Stepper({ value, onChange, min, max, step = 1, color = "var(--purple)" }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => { setDraft(String(value)); }, [value]);

  const dec = () => onChange(Math.max(min, parseFloat((value - step).toFixed(10))));
  const inc = () => onChange(Math.min(max, parseFloat((value + step).toFixed(10))));

  const commit = () => {
    const n = parseFloat(draft);
    if (!isNaN(n)) onChange(Math.min(max, Math.max(min, Math.round(n))));
    else setDraft(String(value));
  };

  const btnStyle = {
    width: 34, height: 42,
    background: "var(--surface-3)",
    border: "none",
    color: "var(--text-muted)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--lg)",
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    transition: "background 0.12s, color 0.12s",
    userSelect: "none",
  };
  return (
    <div style={{ display: "flex", alignItems: "stretch", border: "2px solid var(--border-2)", borderRadius: 8, overflow: "hidden" }}>
      <button onClick={dec} style={{ ...btnStyle, borderRight: "1px solid var(--border)" }}>−</button>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        style={{
          flex: 1, minWidth: 60, border: "none", outline: "none",
          background: "var(--surface-2)", fontFamily: "var(--font-mono)",
          fontWeight: 600, fontSize: "var(--lg)", color, textAlign: "center",
        }}
      />
      <button onClick={inc} style={{ ...btnStyle, borderLeft: "1px solid var(--border)" }}>+</button>
    </div>
  );
}
