import { useState } from "react";
import { Card, PageHeader, CopyButton, s } from "./shared/index.jsx";

export default function SedGenerator() {
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

      <Card title="Mode">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1rem" }}>
          {MODES.map((m) => (
            <button key={m.value} onClick={() => setMode(m.value)}
              style={{ fontFamily: "var(--font-mono)", fontSize: "var(--sm)", padding: "6px 14px", background: mode === m.value ? "var(--green-bg)" : "var(--surface-2)", border: `1px solid ${mode === m.value ? "var(--green-dim)" : "var(--border)"}`, borderRadius: 8, color: mode === m.value ? "var(--green)" : "var(--text-muted)", cursor: "pointer", transition: "all 0.13s" }}>
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

        <div style={{ height: 1, background: "var(--border)", margin: "1.2rem 0" }} />

        <div style={{ fontSize: "var(--xs)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: "0.6rem" }}>Generated command</div>
        <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <code style={{ fontFamily: "var(--font-mono)", fontSize: "var(--md)", fontWeight: 600, color: "var(--amber)", wordBreak: "break-all", flex: 1 }}>{command}</code>
          <CopyButton text={command} />
        </div>
      </Card>

      {mode === "substitute" && (
        <Card title="Live preview">
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
