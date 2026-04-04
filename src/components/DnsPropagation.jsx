import { useState } from "react";
import { Card, PageHeader, Spinner, s } from "./shared/index.jsx";

const DNS_SERVERS = [
  { name: "Google",            location: "US / Global",    doh: "https://dns.google/resolve" },
  { name: "Cloudflare",        location: "Global",         doh: "https://cloudflare-dns.com/dns-query" },
  { name: "Cloudflare Family", location: "Global",         doh: "https://family.cloudflare-dns.com/dns-query" },
  { name: "AliDNS",            location: "China / Asia",   doh: "https://dns.alidns.com/resolve" },
  { name: "DNSPod",            location: "China / Global", doh: "https://doh.pub/dns-query" },
  { name: "RethinkDNS",        location: "Global",         doh: "https://basic.rethinkdns.com/dns-query" },
  { name: "NextDNS",           location: "Global",         doh: "https://dns.nextdns.io/dns-query" },
  { name: "AdGuard",           location: "Global",         doh: "https://dns.adguard-dns.com/dns-query" },
  { name: "dns.sb",            location: "Global",         doh: "https://doh.dns.sb/dns-query" },
  { name: "OpenDNS",           location: "US",             doh: "https://doh.opendns.com/dns-query" },
  { name: "Quad9",             location: "Global",         doh: "https://dns.quad9.net/dns-query" },
  { name: "Mullvad",           location: "Sweden",         doh: "https://doh.mullvad.net/dns-query" },
];

const RECORD_TYPES = ["A", "AAAA", "MX", "NS", "TXT", "CNAME"];

const STATUS_MAP = {
  0: "NOERROR", 1: "FORMERR", 2: "SERVFAIL", 3: "NXDOMAIN", 4: "NOTIMP", 5: "REFUSED",
};

export default function DnsPropagation() {
  const [domain, setDomain] = useState("");
  const [recordType, setRecordType] = useState("A");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    if (!domain.trim()) return;
    const d = domain.trim();
    setLoading(true);
    setResults(DNS_SERVERS.map((srv) => ({ ...srv, status: "checking", answers: [], dnsStatus: null, latency: null })));

    await Promise.all(
      DNS_SERVERS.map(async (server, idx) => {
        const t0 = Date.now();
        try {
          const res = await fetch(
            `${server.doh}?name=${encodeURIComponent(d)}&type=${recordType}`,
            { headers: { Accept: "application/dns-json" }, signal: AbortSignal.timeout(8000) }
          );
          const data = await res.json();
          const latency = Date.now() - t0;
          const hasAnswers = Array.isArray(data.Answer) && data.Answer.length > 0;
          setResults((prev) => prev.map((r, i) =>
            i === idx
              ? { ...r, status: data.Status === 0 && hasAnswers ? "ok" : data.Status === 3 ? "nxdomain" : "norecord", answers: data.Answer || [], dnsStatus: data.Status, latency }
              : r
          ));
        } catch {
          setResults((prev) => prev.map((r, i) =>
            i === idx ? { ...r, status: "error", answers: [], dnsStatus: null, latency: Date.now() - t0 } : r
          ));
        }
      })
    );
    setLoading(false);
  };

  // Consistency check: all ok servers return same answer set
  const okResults    = results.filter((r) => r.status === "ok");
  const answerSets   = okResults.map((r) => r.answers.map((a) => a.data).sort().join("|"));
  const isConsistent = answerSets.length > 1 && answerSets.every((a) => a === answerSets[0]);
  const propagatedCount = okResults.length;
  const totalChecked    = results.filter((r) => r.status !== "checking").length;

  const STATUS_COLOR  = { ok: "var(--green)", nxdomain: "var(--amber)", norecord: "var(--amber)", error: "var(--red)", checking: "var(--text-faint)" };
  const STATUS_BG     = { ok: "var(--green-bg)", nxdomain: "var(--amber-bg)", norecord: "var(--surface-3)", error: "var(--red-bg)", checking: "var(--surface-3)" };
  const STATUS_BORDER = { ok: "var(--green-dim)", nxdomain: "var(--amber-dim)", norecord: "var(--border)", error: "var(--red-dim)", checking: "var(--border)" };
  const STATUS_LABEL  = { ok: "propagated", nxdomain: "NXDOMAIN", norecord: "no record", error: "timeout / error", checking: "checking…" };

  return (
    <div className="page-enter">
      <PageHeader title="DNS propagation" badge="checker" description="Check if a DNS record has propagated across global public resolvers." />

      <Card title="Query">
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, marginBottom: "1rem" }}>
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && check()}
            placeholder="Enter domain name…"
            style={{ ...s.monoInput, color: "var(--teal)", fontSize: "var(--lg)", textTransform: "uppercase" }}
          />
          <button
            onClick={check}
            disabled={loading}
            style={{ padding: "10px 22px", background: "var(--green-bg)", border: "1px solid var(--green-dim)", borderRadius: 12, color: "var(--green)", fontFamily: "var(--font-mono)", fontSize: "var(--md)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}
          >
            {loading ? <Spinner /> : null} Check
          </button>
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {RECORD_TYPES.map((t) => (
            <button key={t} onClick={() => setRecordType(t)}
              style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", padding: "5px 11px", background: recordType === t ? "var(--green-bg)" : "var(--surface-2)", border: `1px solid ${recordType === t ? "var(--green-dim)" : "var(--border)"}`, borderRadius: 8, color: recordType === t ? "var(--green)" : "var(--text-muted)", cursor: "pointer", transition: "all 0.12s" }}>
              {t}
            </button>
          ))}
        </div>
      </Card>

      {/* Summary banner */}
      {results.length > 0 && totalChecked > 0 && (
        <Card style={{
          border: `1px solid ${propagatedCount === 0 ? "var(--red-dim)" : isConsistent ? "var(--green-dim)" : "var(--amber-dim)"}`,
          background: propagatedCount === 0 ? "var(--red-bg)" : isConsistent ? "var(--green-bg)" : "var(--amber-bg)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: propagatedCount === 0 ? "var(--red)" : isConsistent ? "var(--green)" : "var(--amber)", fontWeight: 500, fontSize: "var(--md)" }}>
              <span>{propagatedCount === 0 ? "✗" : isConsistent ? "✓" : "⚠"}</span>
              <span>
                {propagatedCount === 0
                  ? `Not found on any resolver`
                  : isConsistent
                  ? `Fully propagated — ${propagatedCount}/${totalChecked} resolvers agree`
                  : `Partially propagated — ${propagatedCount}/${totalChecked} resolvers have the record`}
              </span>
            </div>
            {loading && <Spinner />}
          </div>
        </Card>
      )}

      {/* Per-resolver results */}
      {results.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {results.map((r, idx) => (
            <Card key={idx} style={{ marginBottom: 0, border: `1px solid ${STATUS_BORDER[r.status]}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: r.answers.length ? "0.7rem" : 0 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "var(--sm)", color: "var(--text)" }}>{r.name}</div>
                  <div style={{ fontSize: "var(--xs)", color: "var(--text-faint)", fontFamily: "var(--font-mono)" }}>{r.location}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                  {r.status === "checking"
                    ? <Spinner />
                    : <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", padding: "2px 8px", background: STATUS_BG[r.status], border: `1px solid ${STATUS_BORDER[r.status]}`, borderRadius: 8, color: STATUS_COLOR[r.status] }}>
                        {STATUS_LABEL[r.status]}
                      </span>
                  }
                  {r.latency !== null && (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--text-faint)" }}>{r.latency}ms</span>
                  )}
                </div>
              </div>

              {r.answers.map((ans, ai) => (
                <div key={ai} style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--green)", padding: "4px 0", borderTop: "1px solid var(--border)", wordBreak: "break-all" }}>
                  {ans.data}
                  {ans.TTL != null && <span style={{ color: "var(--text-faint)", marginLeft: 8 }}>TTL {ans.TTL}s</span>}
                </div>
              ))}

              {r.status === "error" && (
                <div style={{ fontSize: "var(--xs)", color: "var(--red)", fontFamily: "var(--font-mono)", marginTop: 4 }}>
                  Request timed out or failed
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
