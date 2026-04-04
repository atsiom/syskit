import { useState } from "react";
import { Card, PageHeader, PresetRow, DataTable, s } from "./shared/index.jsx";

export default function CIDRCalculator() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const ipToInt = (ip) => {
    const p = ip.split(".").map(Number);
    if (p.length !== 4 || p.some((o) => isNaN(o) || o < 0 || o > 255)) throw new Error("Invalid IP address");
    return ((p[0] << 24) | (p[1] << 16) | (p[2] << 8) | p[3]) >>> 0;
  };
  const intToIp = (n) => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
  const intToBin = (n) => n.toString(2).padStart(32, "0").replace(/(.{8})(?=.)/g, "$1.");

  const calc = (raw) => {
    setInput(raw);
    if (!raw) { setResult(null); setError(""); return; }
    const m = raw.match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/);
    if (!m) { setError("Use CIDR format: 192.168.1.0/24"); setResult(null); return; }
    try {
      const ipInt = ipToInt(m[1]);
      const prefix = parseInt(m[2]);
      if (prefix < 0 || prefix > 32) throw new Error("Prefix must be 0–32");
      const maskInt  = prefix === 0 ? 0 : (0xFFFFFFFF << (32 - prefix)) >>> 0;
      const wildInt  = (~maskInt) >>> 0;
      const netInt   = (ipInt & maskInt) >>> 0;
      const bcastInt = (netInt | wildInt) >>> 0;
      const firstInt = prefix === 32 ? netInt : (netInt + 1) >>> 0;
      const lastInt  = prefix === 32 ? bcastInt : prefix === 31 ? bcastInt : (bcastInt - 1) >>> 0;
      const hosts    = prefix >= 31 ? (prefix === 32 ? 1 : 2) : Math.pow(2, 32 - prefix) - 2;
      const octets   = m[1].split(".").map(Number);
      const getClass = (f) => f < 128 ? "A" : f < 192 ? "B" : f < 224 ? "C" : f < 240 ? "D (Multicast)" : "E (Reserved)";
      const getType  = (o) => {
        if (o[0] === 10) return "Private — RFC 1918";
        if (o[0] === 172 && o[1] >= 16 && o[1] <= 31) return "Private — RFC 1918";
        if (o[0] === 192 && o[1] === 168) return "Private — RFC 1918";
        if (o[0] === 127) return "Loopback";
        if (o[0] === 169 && o[1] === 254) return "Link-local (APIPA)";
        if (o[0] === 100 && o[1] >= 64 && o[1] < 128) return "Shared / CGN — RFC 6598";
        return "Public (routable)";
      };
      setError("");
      setResult({ network: intToIp(netInt), broadcast: intToIp(bcastInt), mask: intToIp(maskInt), wild: intToIp(wildInt), first: intToIp(firstInt), last: intToIp(lastInt), hosts: hosts.toLocaleString(), prefix: `/${prefix}`, ipClass: getClass(octets[0]), type: getType(octets), binary: intToBin(maskInt), hostPct: Math.min(100, Math.max(0.5, prefix / 32 * 100)), prefixLen: prefix });
    } catch (e) { setError(e.message); setResult(null); }
  };

  const CIDR_PRESETS = [
    { label: "192.168.1.0/24", value: "192.168.1.0/24" },
    { label: "10.0.0.0/8",     value: "10.0.0.0/8" },
    { label: "172.16.0.0/12",  value: "172.16.0.0/12" },
    { label: "k8s svc /12",    value: "10.96.0.0/12" },
    { label: "pod net /16",    value: "10.244.0.0/16" },
    { label: "CGN /10",        value: "100.64.0.0/10" },
  ];

  return (
    <div className="page-enter">
      <PageHeader title="CIDR calculator" badge="networking" description="Expand any IPv4 CIDR block into full network details and host range." />
      <Card title="Network address (CIDR notation)">
        <input value={input} onChange={(e) => calc(e.target.value)} placeholder="192.168.1.0/24" style={{ ...s.monoInput, borderColor: error ? "var(--red-dim)" : "var(--border)", color: error && input ? "var(--red)" : "var(--blue)", fontSize: "var(--xl)" }} />
        <PresetRow presets={CIDR_PRESETS} onSelect={(v) => calc(v)} />
        {error && <div style={s.errBox}>{error}</div>}
      </Card>

      {result && (
        <Card title="Network details">
          <DataTable
            highlightKeys={["Network address", "First usable host", "Last usable host"]}
            warnKeys={["Usable hosts"]}
            rows={[
              ["Network address",  result.network],
              ["Broadcast address",result.broadcast],
              ["Subnet mask",      result.mask],
              ["Wildcard mask",    result.wild],
              ["First usable host",result.first],
              ["Last usable host", result.last],
              ["Usable hosts",     result.hosts],
              ["CIDR prefix",      result.prefix],
              ["IP class",         result.ipClass],
              ["Type",             result.type],
              ["Binary mask",      result.binary],
            ]}
          />
          <div style={{ marginTop: 14 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Host space utilisation</div>
            <div style={{ height: 5, background: "var(--surface-3)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${result.hostPct.toFixed(1)}%`, background: "linear-gradient(90deg,var(--green),var(--blue))", borderRadius: 3, transition: "width 0.4s cubic-bezier(.4,0,.2,1)" }} />
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--text-faint)", marginTop: 5 }}>
              /{result.prefixLen} → {result.hosts} hosts ({32 - result.prefixLen} host bits, {result.prefixLen} network bits)
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
