import { useState, useMemo } from "react";
import { Card, PageHeader, CopyButton, s } from "./shared/index.jsx";

const FLAG_OPTS = [
  { key: "g", label: "Global",       desc: "find all matches" },
  { key: "i", label: "Insensitive",  desc: "case-insensitive" },
  { key: "m", label: "Multiline",    desc: "^ and $ match line boundaries" },
  { key: "s", label: "Dot-all",      desc: ". matches newlines" },
];

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState({ g: true, i: false, m: false, s: false });
  const [testStr, setTestStr] = useState("The quick brown fox\njumps over the lazy dog.\nFox and dog.");

  const toggleFlag = (k) => setFlags((f) => ({ ...f, [k]: !f[k] }));

  const flagStr = FLAG_OPTS.filter((f) => flags[f.key]).map((f) => f.key).join("");

  const { regex, error, matches } = useMemo(() => {
    if (!pattern) return { regex: null, error: null, matches: [] };
    try {
      const r = new RegExp(pattern, flagStr);
      const m = [];
      if (flags.g) {
        let match;
        r.lastIndex = 0;
        while ((match = r.exec(testStr)) !== null) {
          m.push({ index: match.index, length: match[0].length, value: match[0], groups: match.slice(1) });
          if (!flags.g) break;
        }
      } else {
        const match = r.exec(testStr);
        if (match) m.push({ index: match.index, length: match[0].length, value: match[0], groups: match.slice(1) });
      }
      return { regex: r, error: null, matches: m };
    } catch (e) {
      return { regex: null, error: e.message, matches: [] };
    }
  }, [pattern, flagStr, testStr]);

  // Build highlighted segments from the test string
  const highlighted = useMemo(() => {
    if (!matches.length || !testStr) return null;
    const segments = [];
    let cursor = 0;
    for (const m of matches) {
      if (m.index > cursor) segments.push({ text: testStr.slice(cursor, m.index), match: false });
      segments.push({ text: m.value, match: true });
      cursor = m.index + m.length;
    }
    if (cursor < testStr.length) segments.push({ text: testStr.slice(cursor), match: false });
    return segments;
  }, [matches, testStr]);

  const labelStyle = {
    display: "block", fontSize: "var(--xs)", fontFamily: "var(--font-mono)",
    textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: 6,
  };

  return (
    <div className="page-enter">
      <PageHeader title="regex tester" badge="pattern" description="Test regular expressions with live match highlighting and group details." />

      <Card title="Pattern">
        {/* Pattern input + flags */}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: "1rem" }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Regular expression</label>
            <div style={{ display: "flex", alignItems: "center", background: "var(--surface-2)", border: `2px solid ${error ? "var(--red-dim)" : "var(--border-2)"}`, borderRadius: 10, overflow: "hidden", transition: "border-color 0.13s" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--lg)", color: "var(--text-faint)", padding: "0 10px", flexShrink: 0 }}>/</span>
              <input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="pattern…"
                spellCheck={false}
                style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontFamily: "var(--font-mono)", fontSize: "var(--lg)", fontWeight: 600, color: "var(--purple)", padding: "10px 0" }}
              />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--lg)", color: "var(--text-faint)", padding: "0 4px", flexShrink: 0 }}>/</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--md)", color: "var(--amber)", padding: "0 10px 0 4px", minWidth: 28, flexShrink: 0 }}>{flagStr || " "}</span>
            </div>
            {error && <div style={{ ...s.errBox, marginTop: 6 }}>{error}</div>}
          </div>
        </div>

        {/* Flags */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: "1rem" }}>
          {FLAG_OPTS.map(({ key, label, desc }) => (
            <label key={key} onClick={() => toggleFlag(key)}
              style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", userSelect: "none",
                       fontSize: "var(--sm)", color: flags[key] ? "var(--green)" : "var(--text-muted)" }}>
              <div style={{ width: 17, height: 17, border: `1px solid ${flags[key] ? "var(--green)" : "var(--border-2)"}`, borderRadius: 3, background: flags[key] ? "var(--green-bg)" : "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: flags[key] ? "var(--green)" : "transparent", fontFamily: "var(--font-mono)", fontWeight: 700, flexShrink: 0 }}>✓</div>
              <span style={{ fontFamily: "var(--font-mono)" }}>{key}</span>
              <span style={{ color: "var(--text-faint)", fontSize: "var(--xs)" }}>— {desc}</span>
            </label>
          ))}
        </div>

        {/* Test string */}
        <label style={labelStyle}>Test string</label>
        <textarea
          value={testStr}
          onChange={(e) => setTestStr(e.target.value)}
          rows={5}
          spellCheck={false}
          style={{ ...s.monoInput, resize: "vertical", fontSize: "var(--sm)", color: "var(--text-muted)" }}
        />

        <div style={{ height: 1, background: "var(--border)", margin: "1.2rem 0" }} />

        {/* Match highlight preview */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Match preview</label>
          {matches.length > 0 && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", background: "var(--green-bg)", border: "1px solid var(--green-dim)", borderRadius: 8, padding: "2px 9px", color: "var(--green)" }}>
              {matches.length} match{matches.length !== 1 ? "es" : ""}
            </span>
          )}
          {pattern && !error && matches.length === 0 && (
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", background: "var(--surface-3)", border: "1px solid var(--border)", borderRadius: 8, padding: "2px 9px", color: "var(--text-faint)" }}>
              no matches
            </span>
          )}
        </div>

        <pre style={{
          fontFamily: "var(--font-mono)", fontSize: "var(--sm)", lineHeight: 1.7,
          background: "var(--surface-2)", border: "1px solid var(--border)",
          borderRadius: 10, padding: "12px 14px",
          whiteSpace: "pre-wrap", wordBreak: "break-word", minHeight: "4rem",
          color: "var(--text-muted)", margin: 0,
        }}>
          {!pattern || !testStr
            ? <span style={{ color: "var(--text-faint)" }}>Enter a pattern and test string above…</span>
            : highlighted
              ? highlighted.map((seg, i) =>
                  seg.match
                    ? <mark key={i} style={{ background: "rgba(184,143,255,0.28)", color: "var(--purple)", borderRadius: 3, padding: "1px 0" }}>{seg.text}</mark>
                    : <span key={i}>{seg.text}</span>
                )
              : <span style={{ color: "var(--text-faint)" }}>No matches</span>
          }
        </pre>
      </Card>

      {/* Match details */}
      {matches.length > 0 && (
        <Card title="Match details">
          {matches.map((m, i) => (
            <div key={i} style={{ padding: "10px 0", borderBottom: i < matches.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: m.groups.filter(Boolean).length ? 6 : 0 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--text-faint)", minWidth: 24 }}>#{i + 1}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--sm)", color: "var(--purple)", background: "rgba(184,143,255,0.12)", border: "1px solid var(--purple-dim)", borderRadius: 6, padding: "2px 8px" }}>{m.value}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--text-faint)" }}>index {m.index}–{m.index + m.length - 1}</span>
                <CopyButton text={m.value} style={{ marginLeft: "auto" }} />
              </div>
              {m.groups.filter(Boolean).map((g, gi) => (
                <div key={gi} style={{ display: "flex", gap: 8, marginLeft: 34, marginTop: 4 }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--text-faint)" }}>group {gi + 1}:</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--amber)" }}>{g}</span>
                </div>
              ))}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
