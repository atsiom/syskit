import { Card, PageHeader } from "./shared/index.jsx";

const SECTIONS = [
  {
    label: "No Warranty",
    body: "All tools provided by SYSKIT are offered as-is, without any warranty of accuracy, completeness, or fitness for a particular purpose. Results are computed client-side or via public third-party APIs and may contain errors.",
  },
  {
    label: "Network & DNS Tools",
    body: "IP geolocation data is sourced from ipinfo.io and may be inaccurate. DNS queries are forwarded to Cloudflare's DNS-over-HTTPS resolver. These tools are intended for informational and diagnostic use only.",
  },
  {
    label: "No Data Collection",
    body: "SYSKIT does not collect, store, or transmit any personally identifiable information. All computation happens locally in your browser. Theme preference is stored only in your browser's localStorage.",
  },
  {
    label: "Third-Party Services",
    body: "Some features rely on external APIs (ipinfo.io, Cloudflare DoH, OpenStreetMap tile servers). Use of these services is subject to their respective terms and privacy policies. SYSKIT has no affiliation with these providers.",
  },
  {
    label: "Not Professional Advice",
    body: "Nothing in SYSKIT constitutes professional networking, security, or storage advice. Always verify critical configurations (RAID arrays, firewall rules, DNS changes) with qualified professionals before acting on them.",
  },
  {
    label: "Open Source",
    body: "SYSKIT is an open-source project. Contributions, bug reports, and feedback are welcome. The source code is provided under the MIT license.",
  },
];

export default function Disclaimer() {
  return (
    <div className="page-enter">
      <PageHeader
        title="Disclaimer"
        badge="legal"
        description="Please read before using SYSKIT tools in production or critical environments."
      />

      <Card title="Terms of Use">
        {SECTIONS.map(({ label, body }, i) => (
          <div
            key={label}
            style={{
              paddingBottom: i < SECTIONS.length - 1 ? "1.1rem" : 0,
              marginBottom: i < SECTIONS.length - 1 ? "1.1rem" : 0,
              borderBottom: i < SECTIONS.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: "0.4rem" }}>
              {label}
            </div>
            <p style={{ fontSize: "var(--sm)", color: "var(--text-muted)", lineHeight: 1.75 }}>{body}</p>
          </div>
        ))}
      </Card>

      <Card>
        <p style={{ fontSize: "var(--xs)", fontFamily: "var(--font-mono)", color: "var(--text-faint)", textAlign: "center", lineHeight: 1.8 }}>
          By using SYSKIT you acknowledge that you have read and understood this disclaimer.
          <br />
          SYSKIT · built with React + Vite
        </p>
      </Card>
    </div>
  );
}
