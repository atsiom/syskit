import { useState } from "react";
import { Card, PageHeader, Spinner, s } from "./shared/index.jsx";

const RECORD_TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CNAME", "SOA", "PTR", "SRV", "CAA"];
const STATUS_LABELS = { 0: "NOERROR", 1: "FORMERR", 2: "SERVFAIL", 3: "NXDOMAIN", 4: "NOTIMP", 5: "REFUSED" };

async function fetchRecord(domain, type) {
  const res = await fetch(
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=${type}`,
    { headers: { Accept: "application/dns-json" }, signal: AbortSignal.timeout(8000) }
  );
  return res.json();
}

export default function NsLookup() {
  const [domain, setDomain] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [allResults, setAllResults] = useState(null); // always fetched on lookup
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastDomain, setLastDomain] = useState("");

  const lookup = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setError("");
    setAllResults(null);
    setLastDomain(domain.trim());

    try {
      const responses = await Promise.all(
        RECORD_TYPES.map((t) =>
          fetchRecord(domain.trim(), t)
            .then((r) => ({ type: t, ...r }))
            .catch(() => ({ type: t, Status: -1, Answer: [] }))
        )
      );
      setAllResults(responses);
    } catch {
      setError("DNS lookup failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  // Filter records for the active tab
  const visibleResults = allResults
    ? activeTab === "ALL"
      ? allResults
      : allResults.filter((r) => r.type === activeTab)
    : null;

  const AnswerRows = ({ answers, type }) => {
    if (!answers?.length) return <div style={{ color: "var(--text-faint)", fontSize: "var(--sm)" }}>No records found</div>;
    return answers.map((r, i) => (
      <div key={i} style={{ padding: "7px 0", borderBottom: i < answers.length - 1 ? "1px solid var(--border)" : "none" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--sm)", color: "var(--green)", wordBreak: "break-all" }}>{r.data}</div>
        {r.TTL != null && (
          <div style={{ fontSize: "var(--xs)", color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginTop: 2 }}>
            {type} · TTL {r.TTL}s
          </div>
        )}
      </div>
    ));
  };

  const tabs = ["ALL", ...RECORD_TYPES];

  return (
    <div className="page-enter">
      <PageHeader title="nslookup" badge="DNS lookup" description="Query all DNS records for a domain. Filter by type using the tabs below." />

      <Card title="Query">
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginBottom: "1rem" }}>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookup()}
            placeholder="Enter domain name…"
            style={{ ...s.monoInput, color: "var(--blue)", fontSize: "var(--lg)" }}
          />
          <button
            onClick={lookup}
            disabled={loading}
            style={{ padding: "10px 22px", background: "var(--green-bg)", border: "1px solid var(--green-dim)", borderRadius: 12, color: "var(--green)", fontFamily: "var(--font-mono)", fontSize: "var(--md)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}
          >
            {loading ? <Spinner /> : null} Lookup
          </button>
        </div>

        {/* Tab bar */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {tabs.map((t) => {
            const isActive = activeTab === t;
            // count matched records for this tab
            const count = allResults
              ? t === "ALL"
                ? allResults.reduce((n, r) => n + (r.Answer?.length ?? 0), 0)
                : (allResults.find((r) => r.type === t)?.Answer?.length ?? 0)
              : null;
            return (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", padding: "5px 11px", background: isActive ? "var(--green-bg)" : "var(--surface-2)", border: `1px solid ${isActive ? "var(--green-dim)" : "var(--border)"}`, borderRadius: 8, color: isActive ? "var(--green)" : "var(--text-muted)", cursor: "pointer", transition: "all 0.12s", display: "flex", alignItems: "center", gap: 5 }}>
                {t}
                {count !== null && count > 0 && (
                  <span style={{ background: isActive ? "var(--green-dim)" : "var(--surface-3)", color: isActive ? "var(--green)" : "var(--text-faint)", borderRadius: 6, padding: "0 4px", fontSize: 10 }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {error && <div style={s.errBox}>{error}</div>}
      </Card>

      {/* Results */}
      {visibleResults && (
        activeTab === "ALL" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {visibleResults.map(({ type, Status, Answer }) => {
              const hasRecords = Answer?.length > 0;
              return (
                <Card key={type} title={type} style={{ marginBottom: 0, opacity: hasRecords ? 1 : 0.45 }}>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: hasRecords ? "0.5rem" : 0 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", padding: "2px 7px", background: hasRecords ? "var(--green-bg)" : "var(--surface-3)", border: `1px solid ${hasRecords ? "var(--green-dim)" : "var(--border)"}`, borderRadius: 8, color: hasRecords ? "var(--green)" : "var(--text-faint)" }}>
                      {Status === -1 ? "error" : STATUS_LABELS[Status] ?? `${Status}`}
                    </span>
                  </div>
                  <AnswerRows answers={Answer} type={type} />
                </Card>
              );
            })}
          </div>
        ) : (
          visibleResults.map(({ type, Status, Answer, Authority, AD }) => (
            <Card key={type} title={`${lastDomain} — ${type}`}>
              <div style={{ display: "flex", gap: 8, marginBottom: "0.8rem", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", padding: "2px 8px", background: Status === 0 ? "var(--green-bg)" : "var(--red-bg)", border: `1px solid ${Status === 0 ? "var(--green-dim)" : "var(--red-dim)"}`, borderRadius: 8, color: Status === 0 ? "var(--green)" : "var(--red)" }}>
                  {STATUS_LABELS[Status] ?? `Status ${Status}`}
                </span>
                {AD && <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", padding: "2px 8px", background: "var(--green-bg)", border: "1px solid var(--green-dim)", borderRadius: 8, color: "var(--green)" }}>DNSSEC</span>}
              </div>
              <AnswerRows answers={Answer} type={type} />
              {Authority?.length > 0 && (
                <>
                  <div style={{ height: 1, background: "var(--border)", margin: "1rem 0" }} />
                  <div style={{ fontSize: "var(--xs)", fontFamily: "var(--font-mono)", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Authority</div>
                  <AnswerRows answers={Authority} type={type} />
                </>
              )}
            </Card>
          ))
        )
      )}
    </div>
  );
}
