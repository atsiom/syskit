import { useState } from "react";
import { Card, CardLabel, PageHeader, PresetRow, CopyButton, s } from "./shared/index.jsx";

const CRON_PRESETS = [
  { label: "every minute",   value: "* * * * *" },
  { label: "hourly",         value: "0 * * * *" },
  { label: "daily midnight", value: "0 0 * * *" },
  { label: "weekdays 9am",   value: "0 9 * * 1-5" },
  { label: "every 5 min",    value: "*/5 * * * *" },
  { label: "every 15 min",   value: "*/15 * * * *" },
  { label: "monthly 1st",    value: "0 0 1 * *" },
  { label: "sunday 2am",     value: "0 2 * * 0" },
];

export default function CrontabCalculator() {
  const [fields, setFields] = useState({ minute: "*", hour: "*", dom: "*", month: "*", dow: "*" });

  const fieldOrder = ["minute", "hour", "dom", "month", "dow"];
  const fieldLabels = { minute: "Minute", hour: "Hour", dom: "Day / mo", month: "Month", dow: "Day / wk" };

  const VALID = /^(\*|\*\/\d+|\d+(-\d+)?(,\d+(-\d+)?)*)$/;

  const setPreset = (expr) => {
    const [minute, hour, dom, month, dow] = expr.split(" ");
    setFields({ minute, hour, dom, month, dow });
  };

  const allValid = fieldOrder.every((f) => VALID.test(fields[f]));
  const expression = fieldOrder.map((f) => fields[f]).join(" ");

  const describe = () => {
    const { minute: m, hour: h, dom, month, dow } = fields;
    if ([m, h, dom, month, dow].every((f) => f === "*")) return "Runs every minute, every day";
    if (/^\*\/(\d+)$/.test(m) && h === "*" && dom === "*" && month === "*" && dow === "*") return `Runs every ${m.split("/")[1]} minute(s) continuously`;
    if (m === "0" && h === "*") return "Runs at the top of every hour";
    if (m === "0" && h === "0" && dom === "*" && month === "*" && dow === "*") return "Runs every day at 00:00 (midnight)";
    if (m === "0" && /^\d+$/.test(h) && dom === "*" && month === "*" && dow === "1-5") return `Runs weekdays (Mon–Fri) at ${h.padStart(2, "0")}:00`;
    if (m === "0" && /^\d+$/.test(h) && dom === "*" && month === "*" && dow === "*") return `Runs every day at ${h.padStart(2, "0")}:00`;
    if (m === "0" && h === "0" && dom === "1" && month === "*" && dow === "*") return "Runs at midnight on the 1st of every month";
    return `Scheduled: ${expression}`;
  };

  const cronMatches = (val, v) => {
    if (val === "*") return true;
    if (/^\*\/\d+$/.test(val)) return v % parseInt(val.split("/")[1]) === 0;
    const expanded = [];
    val.split(",").forEach((p) => {
      if (p.includes("-")) { const [a, b] = p.split("-").map(Number); for (let i = a; i <= b; i++) expanded.push(i); }
      else expanded.push(Number(p));
    });
    return expanded.includes(v);
  };

  const nextRuns = () => {
    if (!allValid) return [];
    const { minute: m, hour: h, dom, month, dow } = fields;
    const results = [];
    let cursor = new Date();
    cursor.setSeconds(0, 0);
    cursor = new Date(cursor.getTime() + 60_000);
    let iter = 0;
    while (results.length < 5 && iter < 150_000) {
      iter++;
      if (cronMatches(m, cursor.getMinutes()) && cronMatches(h, cursor.getHours()) && cronMatches(dom, cursor.getDate()) && cronMatches(month, cursor.getMonth() + 1) && cronMatches(dow, cursor.getDay())) {
        results.push(new Date(cursor));
      }
      cursor = new Date(cursor.getTime() + 60_000);
    }
    return results;
  };

  const relTime = (d) => {
    const sec = Math.round((d - Date.now()) / 1000);
    if (sec < 60) return `in ${sec}s`;
    if (sec < 3600) return `in ${Math.round(sec / 60)}m`;
    if (sec < 86400) return `in ${Math.round(sec / 3600)}h`;
    return `in ${Math.round(sec / 86400)}d`;
  };

  const runs = nextRuns();

  return (
    <div className="page-enter">
      <PageHeader title="crontab calculator" badge="scheduler" description="Build cron expressions and preview the next scheduled runs in local time." />

      <Card title="Cron fields">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 9, marginBottom: "1rem" }}>
          {fieldOrder.map((f) => {
            const isInvalid = !VALID.test(fields[f]);
            return (
              <div key={f}>
                <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "var(--xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: 6 }}>
                  {fieldLabels[f]}
                </label>
                <input
                  value={fields[f]}
                  onChange={(e) => setFields((prev) => ({ ...prev, [f]: e.target.value }))}
                  style={{ ...s.monoInput, textAlign: "center", padding: "11px 6px", borderColor: isInvalid ? "var(--red-dim)" : "var(--border)", color: isInvalid ? "var(--red)" : "var(--amber)" }}
                />
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: "var(--xs)", fontFamily: "var(--font-mono)", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7 }}>Quick presets</div>
        <PresetRow presets={CRON_PRESETS} onSelect={setPreset} />
        {!allValid && <div style={s.errBox}>Invalid field — use *, */n, numbers, ranges (1-5), or lists (1,3,5).</div>}
      </Card>

      <Card style={{ opacity: allValid ? 1 : 0.45 }} title="Result">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 5 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xl)", fontWeight: 700, color: "var(--amber)", letterSpacing: "0.08em" }}>{expression}</span>
          <CopyButton text={expression} />
        </div>
        <div style={{ fontSize: "var(--md)", color: "var(--text-muted)", marginBottom: "1rem" }}>{allValid ? describe() : "—"}</div>
        <div style={{ height: 1, background: "var(--border)", marginBottom: "1rem" }} />
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--xs)", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 9 }}>Next 5 runs (local time)</div>
        {runs.length > 0 ? runs.map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: i < runs.length - 1 ? "1px solid var(--border)" : "none", fontFamily: "var(--font-mono)", fontSize: "var(--sm)" }}>
            <span style={{ fontSize: "var(--xs)", color: "var(--text-faint)", width: 14, textAlign: "right", flexShrink: 0 }}>{i + 1}</span>
            <span style={{ color: "var(--green)" }}>{r.toLocaleString()}</span>
            <span style={{ color: "var(--text-faint)", fontSize: "var(--xs)", marginLeft: "auto" }}>{relTime(r)}</span>
          </div>
        )) : (
          <div style={{ color: "var(--text-faint)", fontSize: "var(--sm)" }}>
            {allValid ? "Expression too sparse to compute." : "Fix the fields above."}
          </div>
        )}
      </Card>
    </div>
  );
}
