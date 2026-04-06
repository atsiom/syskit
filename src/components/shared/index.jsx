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

function ShareButton() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setOpen(false);
    setTimeout(() => setCopied(false), 1800);
  };

  const items = [
    {
      id: "copy", label: "Copy link", action: copyLink,
      icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
    },
    {
      id: "x", label: "Share on X",
      action: () => { window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`, "_blank"); setOpen(false); },
      icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    },
    {
      id: "linkedin", label: "Share on LinkedIn",
      action: () => { window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, "_blank"); setOpen(false); },
      icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
    },
  ];

  return (
    <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "5px 10px", height: 30,
          background: open || copied ? "var(--green-bg)" : "var(--surface-2)",
          border: `1px solid ${open || copied ? "var(--green-dim)" : "var(--border)"}`,
          color: open || copied ? "var(--green)" : "var(--text-muted)",
          borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
        }}
      >
        {copied
          ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
        }
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)" }}>
          {copied ? "copied!" : "share"}
        </span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", right: 0, zIndex: 300,
          background: "var(--surface)", border: "1px solid var(--border-2)",
          borderRadius: 10, overflow: "hidden", minWidth: 185,
          boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
        }}>
          {items.map((item, i) => (
            <button
              key={item.id}
              onMouseDown={item.action}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                width: "100%", padding: "9px 14px", border: "none",
                borderBottom: i < items.length - 1 ? "1px solid var(--border)" : "none",
                background: hoveredItem === item.id ? "var(--surface-3)" : "transparent",
                color: hoveredItem === item.id ? "var(--text)" : "var(--text-muted)",
                fontFamily: "var(--font-sans)", fontSize: "var(--sm)",
                display: "flex", alignItems: "center", gap: 9,
                textAlign: "left", cursor: "pointer", transition: "background 0.1s, color 0.1s",
              }}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PageHeader({ title, badge, description }) {
  const capitalize = (str) => str.replace(/\b\w/g, (c) => c.toUpperCase());
  return (
    <div style={{ marginBottom: "1.6rem" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 5 }}>
        <h1 style={{ fontSize: "var(--xl)", fontWeight: 600, letterSpacing: "-0.02em", margin: 0, display: "flex", alignItems: "center", gap: 10 }}>
          {capitalize(title)}
          {badge && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--text-faint)", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "2px 9px" }}>
              {badge}
            </span>
          )}
        </h1>
        <div style={{ flex: 1 }} />
        <ShareButton />
      </div>
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

// Checkbox: dot-style toggle, clicking anywhere in the row toggles it
export function Checkbox({ checked, onChange, label, description, size = 17 }) {
  return (
    <div onClick={onChange} style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", userSelect: "none", fontSize: "var(--sm)", color: checked ? "var(--green)" : "var(--text-muted)" }}>
      <div style={{ width: size, height: size, border: `1px solid ${checked ? "var(--green)" : "var(--border-2)"}`, borderRadius: 3, background: checked ? "var(--green-bg)" : "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.11s" }}>
        {checked && <div style={{ width: Math.round(size * 0.42), height: Math.round(size * 0.42), borderRadius: "50%", background: "var(--green)" }} />}
      </div>
      {label && <span style={{ fontFamily: "var(--font-mono)" }}>{label}</span>}
      {description && <span style={{ color: "var(--text-faint)", fontSize: "var(--xs)" }}>{description}</span>}
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
        {rows.map(([label, value], i) => {
          const isHighlight = highlightKeys.includes(label);
          const isWarn = warnKeys.includes(label);
          return (
            <tr key={label} style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none" }}>
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
  const [hovered, setHovered] = useState(null);
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
                onMouseEnter={() => setHovered(o.value)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  width: "100%", padding: "9px 14px", border: "none",
                  borderBottom: "1px solid var(--border)",
                  background: isActive ? "var(--green-bg)" : hovered === o.value ? "var(--surface-3)" : "transparent",
                  color: isActive ? "var(--green)" : hovered === o.value ? "var(--text)" : "var(--text-muted)",
                  fontFamily: "var(--font-mono)", fontSize: "var(--sm)",
                  textAlign: "left", cursor: "pointer", transition: "background 0.1s, color 0.1s",
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
