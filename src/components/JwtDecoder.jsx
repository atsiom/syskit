import { useState, useMemo } from "react";
import { Card, PageHeader, CopyButton, s } from "./shared/index.jsx";

const labelStyle = {
  display: "block", fontSize: "var(--xs)", fontFamily: "var(--font-mono)",
  textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: 6,
};

function b64urlDecode(str) {
  // Convert base64url to base64
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - b64.length % 4) % 4);
  return decodeURIComponent(
    atob(padded).split("").map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
  );
}

function JsonView({ data }) {
  const entries = Object.entries(data);
  return (
    <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--sm)", lineHeight: 1.8 }}>
      {entries.map(([k, v], i) => {
        let display = typeof v === "object" ? JSON.stringify(v) : String(v);
        // human-readable timestamps for common claims
        let hint = null;
        if ((k === "exp" || k === "iat" || k === "nbf") && typeof v === "number") {
          hint = new Date(v * 1000).toUTCString();
        }
        return (
          <div key={k} style={{ padding: "6px 0", borderBottom: i < entries.length - 1 ? "1px solid var(--border)" : "none", display: "flex", gap: 10, alignItems: "flex-start", flexWrap: "wrap" }}>
            <span style={{ color: "var(--purple)", minWidth: 100, flexShrink: 0 }}>{k}</span>
            <div style={{ flex: 1 }}>
              <span style={{ color: "var(--green)", wordBreak: "break-all" }}>{display}</span>
              {hint && <div style={{ color: "var(--text-faint)", fontSize: "var(--xs)", marginTop: 2 }}>{hint}</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const ALG_COLORS = {
  HS: "var(--green)", RS: "var(--blue)", ES: "var(--teal)", PS: "var(--purple)",
};

export default function JwtDecoder() {
  const [token, setToken] = useState("");

  const result = useMemo(() => {
    const t = token.trim();
    if (!t) return null;
    const parts = t.split(".");
    if (parts.length !== 3) return { error: "Invalid JWT — expected 3 dot-separated parts." };
    try {
      const header  = JSON.parse(b64urlDecode(parts[0]));
      const payload = JSON.parse(b64urlDecode(parts[1]));
      return { header, payload, signature: parts[2] };
    } catch {
      return { error: "Failed to decode JWT — check that the token is valid Base64url JSON." };
    }
  }, [token]);

  const alg = result?.header?.alg ?? "";
  const algColor = ALG_COLORS[alg.slice(0, 2)] ?? "var(--amber)";

  const now = Math.floor(Date.now() / 1000);
  const exp = result?.payload?.exp;
  const isExpired = typeof exp === "number" && exp < now;
  const expiresIn = typeof exp === "number"
    ? exp < now
      ? `Expired ${Math.floor((now - exp) / 60)} min ago`
      : `Expires in ${Math.floor((exp - now) / 60)} min`
    : null;

  return (
    <div className="page-enter">
      <PageHeader title="JWT decoder" badge="auth" description="Inspect JWT header and payload claims without verifying the signature." />

      <Card title="Token">
        <label style={labelStyle}>JSON Web Token</label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          rows={4}
          placeholder="Paste a JWT (eyJ…)…"
          spellCheck={false}
          style={{ ...s.monoInput, resize: "vertical", fontSize: "var(--sm)", color: "var(--purple)", wordBreak: "break-all" }}
        />
        {token && (
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={() => setToken("")}
              style={{ ...s.presetBtn, padding: "6px 14px", fontSize: "var(--xs)" }}>
              Clear
            </button>
          </div>
        )}

        {result?.error && <div style={{ ...s.errBox, marginTop: 12 }}>{result.error}</div>}

        {result && !result.error && (
          <>
            <div style={{ height: 1, background: "var(--border)", margin: "1.2rem 0" }} />

            {/* Status badges */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1.2rem" }}>
              {alg && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", padding: "3px 10px", background: "var(--surface-3)", border: `1px solid var(--border-2)`, borderRadius: 8, color: algColor }}>
                  alg: {alg}
                </span>
              )}
              {result.header?.typ && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", padding: "3px 10px", background: "var(--surface-3)", border: "1px solid var(--border-2)", borderRadius: 8, color: "var(--text-muted)" }}>
                  typ: {result.header.typ}
                </span>
              )}
              {expiresIn && (
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", padding: "3px 10px", background: isExpired ? "var(--red-bg)" : "var(--green-bg)", border: `1px solid ${isExpired ? "var(--red-dim)" : "var(--green-dim)"}`, borderRadius: 8, color: isExpired ? "var(--red)" : "var(--green)" }}>
                  {expiresIn}
                </span>
              )}
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", padding: "3px 10px", background: "var(--amber-bg, rgba(245,158,11,0.08))", border: "1px solid var(--amber-dim)", borderRadius: 8, color: "var(--amber)" }}>
                signature not verified
              </span>
            </div>
          </>
        )}
      </Card>

      {result && !result.error && (
        <>
          <Card title="Header">
            <JsonView data={result.header} />
            <div style={{ height: 1, background: "var(--border)", margin: "1rem 0" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={labelStyle}>Raw</span>
              <CopyButton text={JSON.stringify(result.header, null, 2)} />
            </div>
            <pre style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--text-faint)", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {JSON.stringify(result.header, null, 2)}
            </pre>
          </Card>

          <Card title="Payload">
            <JsonView data={result.payload} />
            <div style={{ height: 1, background: "var(--border)", margin: "1rem 0" }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={labelStyle}>Raw</span>
              <CopyButton text={JSON.stringify(result.payload, null, 2)} />
            </div>
            <pre style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--text-faint)", margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {JSON.stringify(result.payload, null, 2)}
            </pre>
          </Card>

          <Card title="Signature">
            <label style={labelStyle}>Base64url-encoded signature</label>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10, background: "var(--surface-2)", border: "2px solid var(--border-2)", borderRadius: 10, padding: "12px 14px" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--sm)", color: "var(--text-faint)", wordBreak: "break-all", flex: 1 }}>{result.signature}</span>
              <CopyButton text={result.signature} />
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--amber)", marginTop: 8 }}>
              Signature is displayed as-is and has not been verified against any key.
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
