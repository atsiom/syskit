import { useState, useEffect } from "react";
import { Card, CardLabel, PageHeader, DataTable, s } from "./shared/index.jsx";

export default function EpochConverter() {
  const [epoch, setEpoch] = useState(() => Math.floor(Date.now() / 1000).toString());
  const [dateInput, setDateInput] = useState("");
  const [liveEpoch, setLiveEpoch] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const interval = setInterval(() => setLiveEpoch(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  const parsedMs = epoch ? (epoch.length >= 13 ? parseInt(epoch) : parseInt(epoch) * 1000) : null;
  const dateObj  = parsedMs && !isNaN(parsedMs) ? new Date(parsedMs) : null;

  const fromDate = () => {
    try {
      const d = new Date(dateInput);
      if (isNaN(d)) return;
      setEpoch(Math.floor(d.getTime() / 1000).toString());
    } catch {}
  };

  const pad = (v, n = 2) => String(v).padStart(n, "0");

  const formatRows = dateObj
    ? [
        ["Unix timestamp (s)",  Math.floor(parsedMs / 1000).toString()],
        ["Unix timestamp (ms)", parsedMs.toString()],
        ["UTC",                `${dateObj.toUTCString()}`],
        ["Local time",         `${dateObj.toLocaleString()}`],
        ["ISO 8601",           `${dateObj.toISOString()}`],
        ["Date (local)",       `${dateObj.getFullYear()}-${pad(dateObj.getMonth()+1)}-${pad(dateObj.getDate())}`],
        ["Time (local)",       `${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`],
        ["Day of week",        ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dateObj.getDay()]],
        ["Week of year",       `Week ${Math.ceil((dateObj - new Date(dateObj.getFullYear(), 0, 1)) / 604800000)}`],
        ["Timezone offset",    `UTC${dateObj.getTimezoneOffset() <= 0 ? "+" : "-"}${pad(Math.abs(Math.floor(dateObj.getTimezoneOffset() / 60)))}:${pad(Math.abs(dateObj.getTimezoneOffset() % 60))}`],
      ]
    : [];

  return (
    <div className="page-enter">
      <PageHeader title="epoch converter" badge="time" description="Convert between Unix timestamps and human-readable date/time formats." />

      <Card>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: "0.8rem", flexWrap: "wrap" }}>
          <span style={{ fontSize: "var(--xs)", fontFamily: "var(--font-mono)", color: "var(--text-faint)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Current Unix time:</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--md)", fontWeight: 700, color: "var(--green)" }}>{liveEpoch}</span>
          <button onClick={() => setEpoch(liveEpoch.toString())}
            style={{ ...s.presetBtn, marginLeft: 4 }}>use now</button>
        </div>

        <CardLabel>Epoch timestamp</CardLabel>
        <input value={epoch} onChange={(e) => setEpoch(e.target.value)} placeholder="Unix timestamp (s or ms)"
          style={{ ...s.monoInput, color: "var(--amber)", fontSize: "var(--xl)" }} />

        <div style={{ height: 1, background: "var(--border)", margin: "1.2rem 0" }} />
        <CardLabel>From date/time</CardLabel>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="datetime-local" value={dateInput} onChange={(e) => setDateInput(e.target.value)}
            style={{ ...s.input, flex: 1 }} />
          <button onClick={fromDate}
            style={{ padding: "10px 18px", background: "var(--green-bg)", border: "1px solid var(--green-dim)", borderRadius: 6, color: "var(--green)", fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "var(--sm)", cursor: "pointer", whiteSpace: "nowrap" }}>
            → Epoch
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
          {[
            { label: "Now",          value: () => Math.floor(Date.now() / 1000) },
            { label: "Start of day", value: () => { const d = new Date(); d.setHours(0,0,0,0); return Math.floor(d/1000); } },
            { label: "Start of week",value: () => { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()-d.getDay()); return Math.floor(d/1000); } },
            { label: "1 day ago",    value: () => Math.floor(Date.now() / 1000) - 86400 },
            { label: "1 week ago",   value: () => Math.floor(Date.now() / 1000) - 604800 },
            { label: "1 year ago",   value: () => Math.floor(Date.now() / 1000) - 31536000 },
          ].map(({ label, value }) => (
            <button key={label} onClick={() => setEpoch(value().toString())} style={{ ...s.presetBtn }}>{label}</button>
          ))}
        </div>
      </Card>

      {dateObj && (
        <Card title="Converted values">
          <DataTable highlightKeys={["Unix timestamp (s)", "Local time", "ISO 8601"]} rows={formatRows} />
        </Card>
      )}
      {epoch && !dateObj && (
        <div style={s.errBox}>Invalid timestamp — enter a valid Unix epoch (seconds or milliseconds).</div>
      )}
    </div>
  );
}
