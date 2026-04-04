import { useState } from "react";
import { Card, PageHeader, s } from "./shared/index.jsx";

export default function ChmodCalculator() {
  const [bits, setBits] = useState({ ur: 0, uw: 0, ux: 0, gr: 0, gw: 0, gx: 0, or: 0, ow: 0, ox: 0 });
  const [copied, setCopied] = useState(false);

  const toggle = (key) => setBits((prev) => ({ ...prev, [key]: prev[key] ^ 1 }));

  const ownerOctal  = bits.ur * 4 + bits.uw * 2 + bits.ux;
  const groupOctal  = bits.gr * 4 + bits.gw * 2 + bits.gx;
  const othersOctal = bits.or * 4 + bits.ow * 2 + bits.ox;

  const symChars = [
    bits.ur ? "r" : "-", bits.uw ? "w" : "-", bits.ux ? "x" : "-",
    bits.gr ? "r" : "-", bits.gw ? "w" : "-", bits.gx ? "x" : "-",
    bits.or ? "r" : "-", bits.ow ? "w" : "-", bits.ox ? "x" : "-",
  ].join("");

  const command = `chmod ${ownerOctal}${groupOctal}${othersOctal} file`;

  const describePerms = (r, w, x) =>
    [r ? "read" : "", w ? "write" : "", x ? "execute" : ""].filter(Boolean).join(", ") || "none";

  const desc = [
    ownerOctal  > 0 ? `Owner: ${describePerms(bits.ur, bits.uw, bits.ux)}`  : "",
    groupOctal  > 0 ? `Group: ${describePerms(bits.gr, bits.gw, bits.gx)}`  : "",
    othersOctal > 0 ? `Others: ${describePerms(bits.or, bits.ow, bits.ox)}` : "",
  ].filter(Boolean).join(" · ") || "No permissions assigned.";

  const copyCmd = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const PermGroup = ({ heading, keys }) => (
    <div>
      <div style={{ fontSize: "var(--xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", textAlign: "center", paddingBottom: 7, borderBottom: "1px solid var(--border)", marginBottom: 9 }}>
        {heading}
      </div>
      <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "10px 13px" }}>
        {keys.map(({ key, label }) => {
          const isOn = bits[key];
          return (
            <div
              key={key}
              onClick={() => toggle(key)}
              style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 0", cursor: "pointer", userSelect: "none" }}
            >
              <div style={{
                width: 18, height: 18, border: `1px solid ${isOn ? "var(--green)" : "var(--border-2)"}`,
                borderRadius: 6, background: isOn ? "var(--green-bg)" : "var(--bg)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, transition: "all 0.11s", fontFamily: "var(--font-mono)",
                fontSize: 11, fontWeight: 700, color: isOn ? "var(--green)" : "transparent",
              }}>✓</div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--sm)", color: isOn ? "var(--green)" : "var(--text-muted)", transition: "color 0.11s" }}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="page-enter">
      <PageHeader title="chmod calculator" badge="permissions" description="Toggle permission bits to compute the octal mode and symbolic notation." />

      <Card title="Permission bits">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: "1.2rem" }}>
          <PermGroup heading="Owner (u)" keys={[{ key: "ur", label: "r — read" }, { key: "uw", label: "w — write" }, { key: "ux", label: "x — execute" }]} />
          <PermGroup heading="Group (g)"  keys={[{ key: "gr", label: "r — read" }, { key: "gw", label: "w — write" }, { key: "gx", label: "x — execute" }]} />
          <PermGroup heading="Others (o)" keys={[{ key: "or", label: "r — read" }, { key: "ow", label: "w — write" }, { key: "ox", label: "x — execute" }]} />
        </div>
      </Card>

      <Card title="Octal value">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: "1.1rem" }}>
          {[["owner", ownerOctal], ["group", groupOctal], ["others", othersOctal]].map(([lbl, val]) => (
            <div key={lbl} style={{ background: val > 0 ? "var(--green-bg)" : "var(--surface-2)", border: `1px solid ${val > 0 ? "var(--green-dim)" : "var(--border)"}`, borderRadius: 8, padding: "16px 10px", textAlign: "center", transition: "all 0.2s" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--3xl)", fontWeight: 400, color: "var(--green)", lineHeight: 1, display: "block" }}>{val}</span>
              <div style={{ fontSize: "var(--xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-faint)", marginTop: 5 }}>{lbl}</div>
            </div>
          ))}
        </div>

        <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, padding: "13px 17px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)" }}>Command</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                onClick={copyCmd}
                title="Click to copy"
                style={{ fontFamily: "var(--font-mono)", fontSize: "var(--lg)", fontWeight: 600, color: "var(--amber)", cursor: "pointer" }}
              >
                {command}
              </span>
              <span style={{ display: copied ? "inline-block" : "none", fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--green)", background: "var(--green-bg)", border: "1px solid var(--green-dim)", borderRadius: 6, padding: "1px 6px" }}>
                copied
              </span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)" }}>Symbolic</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--md)", fontWeight: 500, color: "var(--blue)", letterSpacing: "0.06em" }}>-{symChars}</span>
          </div>
        </div>
        <div style={{ fontSize: "var(--sm)", color: "var(--text-muted)" }}>{desc}</div>
      </Card>
    </div>
  );
}
