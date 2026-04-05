import { useState } from "react";
import { Card, PageHeader, CopyButton, s } from "./shared/index.jsx";

const labelStyle = {
  display: "block", fontSize: "var(--xs)", fontFamily: "var(--font-mono)",
  textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: 6,
};

function ResultBox({ label, value, color, error }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{
        background: "var(--surface-2)", border: `2px solid ${error ? "var(--red-dim)" : "var(--border-2)"}`,
        borderRadius: 10, padding: "12px 14px",
        display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, minHeight: 52,
      }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: "var(--sm)", fontWeight: 500,
          color: error ? "var(--red)" : value ? color : "var(--text-faint)",
          wordBreak: "break-all", flex: 1, lineHeight: 1.6,
        }}>
          {value || "—"}
        </span>
        {value && !error && <CopyButton text={value} />}
      </div>
    </div>
  );
}

export default function UrlEncoder() {
  const [encoded, setEncoded] = useState("");
  const [decoded, setDecoded] = useState("");

  const decodedResult = (() => {
    try { return encoded ? decodeURIComponent(encoded) : ""; } catch (e) { return `Error: ${e.message}`; }
  })();

  const encodedResult = (() => {
    try { return decoded ? encodeURIComponent(decoded) : ""; } catch { return ""; }
  })();

  const decodeError = decodedResult.startsWith("Error:");

  return (
    <div className="page-enter">
      <PageHeader title="URL encode / decode" badge="encoding" description="Decode percent-encoded URLs or encode plain text into URL-safe format." />

      <Card title="Decode">
        <label style={labelStyle}>Encoded URL</label>
        <textarea
          value={encoded}
          onChange={(e) => setEncoded(e.target.value)}
          rows={3}
          placeholder="Paste a percent-encoded URL or string…"
          style={{ ...s.monoInput, resize: "vertical", fontSize: "var(--sm)", color: "var(--amber)" }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 10, marginBottom: "1.2rem" }}>
          <button onClick={() => setEncoded("")}
            style={{ ...s.presetBtn, padding: "6px 14px", fontSize: "var(--xs)" }}>
            Clear
          </button>
          {decodedResult && !decodeError && (
            <button onClick={() => { setDecoded(decodedResult); setEncoded(""); }}
              style={{ ...s.presetBtn, padding: "6px 14px", fontSize: "var(--xs)" }}>
              Use as encode input
            </button>
          )}
        </div>

        <div style={{ height: 1, background: "var(--border)", marginBottom: "1.2rem" }} />

        <ResultBox label="Decoded output" value={decodedResult} color="var(--green)" error={decodeError} />
      </Card>

      <Card title="Encode">
        <label style={labelStyle}>Plain text / URL</label>
        <textarea
          value={decoded}
          onChange={(e) => setDecoded(e.target.value)}
          rows={3}
          placeholder="Paste plain text or a URL to encode…"
          style={{ ...s.monoInput, resize: "vertical", fontSize: "var(--sm)", color: "var(--teal)" }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 10, marginBottom: "1.2rem" }}>
          <button onClick={() => setDecoded("")}
            style={{ ...s.presetBtn, padding: "6px 14px", fontSize: "var(--xs)" }}>
            Clear
          </button>
          {encodedResult && (
            <button onClick={() => { setEncoded(encodedResult); setDecoded(""); }}
              style={{ ...s.presetBtn, padding: "6px 14px", fontSize: "var(--xs)" }}>
              Use as decode input
            </button>
          )}
        </div>

        <div style={{ height: 1, background: "var(--border)", marginBottom: "1.2rem" }} />

        <ResultBox label="Encoded output" value={encodedResult} color="var(--amber)" />
      </Card>
    </div>
  );
}
