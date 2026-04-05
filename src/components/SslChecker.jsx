import { useState } from "react";
import { Card, PageHeader, DataTable, Spinner, s } from "./shared/index.jsx";

const labelStyle = {
  display: "block", fontSize: "var(--xs)", fontFamily: "var(--font-mono)",
  textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: 6,
};

function daysUntil(dateStr) {
  return Math.floor((new Date(dateStr) - Date.now()) / 86400000);
}

function fmtDate(dateStr) {
  return new Date(dateStr).toUTCString().replace(" GMT", " UTC");
}

function parseSANs(nameValue) {
  return [...new Set(
    nameValue.split(/[\n,]/).map((s) => s.replace(/^DNS:/, "").trim()).filter(Boolean)
  )].sort();
}

// Issuer string from crt.sh is like "C=US, O=Let's Encrypt, CN=R3"
function parseField(str, key) {
  const m = str?.match(new RegExp(`(?:^|,\\s*)${key}=([^,]+)`));
  return m ? m[1].trim() : null;
}

// Check if the domain's HTTPS is reachable (cert valid right now)
async function liveCheck(domain) {
  try {
    await fetch(`https://${domain}`, { mode: "no-cors", signal: AbortSignal.timeout(6000) });
    return "valid";
  } catch (e) {
    // net::ERR_CERT_* errors come through as TypeError
    return "unreachable";
  }
}

export default function SslChecker() {
  const [domain, setDomain]   = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [cert, setCert]       = useState(null);
  const [live, setLive]       = useState(null); // "valid" | "unreachable" | null

  const isValidDomain = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(domain.trim());

  const check = async () => {
    if (!isValidDomain) return;
    const d = domain.trim().toLowerCase();

    setLoading(true);
    setError("");
    setCert(null);
    setLive(null);

    try {
      // Kick off live check in parallel — doesn't block cert data display
      liveCheck(d).then(setLive);

      // crt.sh returns actual X.509 cert data from CT logs
      const res = await fetch(
        `https://crt.sh/?q=${encodeURIComponent(d)}&output=json`,
        { signal: AbortSignal.timeout(12000) }
      );
      if (!res.ok) throw new Error(`crt.sh returned HTTP ${res.status}`);

      const data = await res.json();
      if (!data?.length) {
        setError("No certificates found for this domain in the certificate transparency logs.");
        return;
      }

      const now = new Date();

      // Filter: exact CN or SAN match, non-expired
      const relevant = data.filter((c) => {
        const matchesDomain =
          c.common_name?.toLowerCase() === d ||
          c.common_name?.toLowerCase() === `*.${d.split(".").slice(1).join(".")}` ||
          c.name_value?.toLowerCase().split(/[\n,]/).some((n) =>
            n.replace(/^dns:/i, "").trim() === d
          );
        return matchesDomain && new Date(c.not_after) > now;
      });

      // Fall back to all non-expired certs if no exact match (e.g. wildcard)
      const pool = relevant.length ? relevant : data.filter((c) => new Date(c.not_after) > now);

      if (!pool.length) {
        setError("No valid (non-expired) certificates found for this domain.");
        return;
      }

      // Most recently issued = currently deployed
      pool.sort((a, b) => new Date(b.not_before) - new Date(a.not_before));
      setCert(pool[0]);
    } catch (e) {
      if (e.name === "TimeoutError" || e.name === "AbortError") {
        setError("Request timed out — crt.sh may be slow, please try again.");
      } else {
        setError(e.message || "Failed to retrieve certificate data.");
      }
    } finally {
      setLoading(false);
    }
  };

  const days     = cert ? daysUntil(cert.not_after) : null;
  const expired  = days !== null && days < 0;
  const warn     = !expired && days !== null && days <= 30;

  const expiryColor  = expired ? "var(--red)"   : warn ? "var(--amber)"  : "var(--green)";
  const expiryBg     = expired ? "var(--red-bg)": warn ? "rgba(245,158,11,0.08)" : "var(--green-bg)";
  const expiryBorder = expired ? "var(--red-dim)": warn ? "var(--amber-dim)" : "var(--green-dim)";
  const expiryLabel  = days === null ? null : expired ? `Expired ${Math.abs(days)}d ago` : `${days}d remaining`;

  const sans = cert ? parseSANs(cert.name_value ?? "") : [];

  const issuerCN  = cert ? (parseField(cert.issuer_name, "CN") ?? cert.issuer_name) : null;
  const issuerOrg = cert ? parseField(cert.issuer_name, "O") : null;

  return (
    <div className="page-enter">
      <PageHeader title="SSL/TLS checker" badge="ssl" description="Inspect certificate details, expiry, issuer, and SANs for any domain." />

      <Card title="Domain">
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && check()}
            placeholder="example.com"
            spellCheck={false}
            style={{ ...s.monoInput, color: "var(--blue)", fontSize: "var(--lg)", textTransform: "lowercase" }}
          />
          <button
            onClick={check}
            disabled={loading || !isValidDomain}
            style={{ padding: "10px 22px", background: "var(--green-bg)", border: "1px solid var(--green-dim)", borderRadius: 12, color: "var(--green)", fontFamily: "var(--font-mono)", fontSize: "var(--md)", cursor: isValidDomain ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", opacity: isValidDomain ? 1 : 0.4, transition: "opacity 0.15s" }}
          >
            {loading ? <Spinner /> : null} Check
          </button>
        </div>
        {error && <div style={{ ...s.errBox, marginTop: 12 }}>{error}</div>}
      </Card>

      {cert && (
        <Card title={cert.common_name}>
          {/* Badges */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: "1rem" }}>
            {expiryLabel && (
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", padding: "3px 10px", background: expiryBg, border: `1px solid ${expiryBorder}`, borderRadius: 8, color: expiryColor }}>
                {expiryLabel}
              </span>
            )}
            <span style={{
              fontFamily: "var(--font-mono)", fontSize: "var(--xs)", padding: "3px 10px", borderRadius: 8,
              background: live === "valid" ? "var(--green-bg)" : live === "unreachable" ? "var(--red-bg)" : "var(--surface-3)",
              border: `1px solid ${live === "valid" ? "var(--green-dim)" : live === "unreachable" ? "var(--red-dim)" : "var(--border-2)"}`,
              color: live === "valid" ? "var(--green)" : live === "unreachable" ? "var(--red)" : "var(--text-faint)",
            }}>
              {live === "valid" ? "HTTPS reachable" : live === "unreachable" ? "HTTPS unreachable" : "checking…"}
            </span>
          </div>

          <DataTable
            highlightKeys={["Common name", "Expires"]}
            warnKeys={expired || warn ? ["Expires"] : []}
            rows={[
              ["Common name", cert.common_name],
              ["Issuer CN",   issuerCN ?? "—"],
              issuerOrg ? ["Issuer org", issuerOrg] : null,
              ["Issued",      fmtDate(cert.not_before)],
              ["Expires",     fmtDate(cert.not_after)],
              ["Serial",      cert.serial_number],
            ].filter(Boolean)}
          />

          {sans.length > 0 && (
            <>
              <div style={{ height: 1, background: "var(--border)", margin: "1rem 0" }} />
              <label style={labelStyle}>Subject Alternative Names ({sans.length})</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {sans.map((san, i) => (
                  <span key={i} style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", padding: "2px 8px", background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6, color: "var(--teal)" }}>
                    {san}
                  </span>
                ))}
              </div>
            </>
          )}

          <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--text-faint)", marginTop: "1rem" }}>
            Certificate data sourced from <span style={{ color: "var(--text-muted)" }}>crt.sh</span> certificate transparency logs.
          </div>
        </Card>
      )}
    </div>
  );
}
