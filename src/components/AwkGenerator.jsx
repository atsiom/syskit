import { useState } from "react";
import { Card, PageHeader, CopyButton, s } from "./shared/index.jsx";

export default function AwkGenerator() {
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

      <Card title="Configuration">
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

        <div style={{ height: 1, background: "var(--border)", margin: "1.2rem 0" }} />

        <div style={{ fontSize: "var(--xs)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: "0.6rem" }}>Generated command</div>
        <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "14px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <code style={{ fontFamily: "var(--font-mono)", fontSize: "var(--md)", fontWeight: 600, color: "var(--amber)", wordBreak: "break-all", flex: 1 }}>{command}</code>
          <CopyButton text={command} />
        </div>
      </Card>

      <Card title="Live preview">
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
