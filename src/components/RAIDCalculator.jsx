import { useState, useEffect } from "react";
import { Card, CardLabel, PageHeader, DataTable, Stepper, CustomSelect, s } from "./shared/index.jsx";

const RAID_SPECS = {
  0:  { name:"RAID 0",  min:2,  fault:0, read:"Excellent (n× speed)",       write:"Excellent (n× speed)",       rebuild:"None — zero redundancy" },
  1:  { name:"RAID 1",  min:2,  fault:1, read:"Good (read from any mirror)", write:"Same as single drive",       rebuild:"Low" },
  5:  { name:"RAID 5",  min:3,  fault:1, read:"Good",                        write:"Good (parity overhead)",     rebuild:"High — all drives read" },
  6:  { name:"RAID 6",  min:4,  fault:2, read:"Good",                        write:"Moderate (double parity)",   rebuild:"Very high" },
  10: { name:"RAID 10", min:4,  fault:1, read:"Excellent",                   write:"Good",                       rebuild:"Low to moderate" },
  50: { name:"RAID 50", min:6,  fault:1, read:"Excellent",                   write:"Good",                       rebuild:"Moderate" },
  60: { name:"RAID 60", min:8,  fault:2, read:"Excellent",                   write:"Moderate",                   rebuild:"High" },
  Z2: { name:"RAIDZ2",  min:4,  fault:2, read:"Good",                        write:"Moderate",                   rebuild:"Moderate (variable stripe)" },
};

// Well-known drive capacities per unit
const CAPACITY_PRESETS = {
  GB:  [120, 240, 256, 500, 512, 1000, 2000, 4000, 8000, 16000, 20000],
  TB:  [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 24],
  TiB: [1, 2, 4, 8, 16, 32],
  GiB: [120, 240, 256, 512, 1024, 2048, 4096, 8192],
};

const FS_OVERHEAD_OPTIONS = [
  { label: "None — raw capacity",  value: 1    },
  { label: "~3% (XFS / Btrfs)",    value: 0.97 },
  { label: "~5% (ext4)",           value: 0.95 },
  { label: "~7% typical",          value: 0.93 },
  { label: "~10% (ZFS default)",   value: 0.90 },
  { label: "~15% (heavily used)",  value: 0.85 },
];

// Stepper that cycles through a preset list, with editable center input
function PresetStepper({ presets, value, onChange, color = "var(--purple)" }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => { setDraft(String(value)); }, [value]);

  // find next preset strictly above / below current value (or typed value)
  const dec = () => {
    const below = presets.filter((p) => p < value);
    if (below.length) onChange(below[below.length - 1]);
  };
  const inc = () => {
    const above = presets.filter((p) => p > value);
    if (above.length) onChange(above[0]);
  };

  const commit = () => {
    const n = parseFloat(draft);
    if (!isNaN(n) && n > 0) onChange(n);
    else setDraft(String(value));
  };

  const atMin = value <= presets[0];
  const atMax = value >= presets[presets.length - 1];

  const btnStyle = {
    width: 34, height: 42,
    background: "var(--surface-3)",
    border: "none",
    color: "var(--text-muted)",
    fontFamily: "var(--font-mono)",
    fontSize: "var(--lg)",
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
    userSelect: "none",
  };
  return (
    <div style={{ display: "flex", alignItems: "stretch", border: "2px solid var(--border-2)", borderRadius: 8, overflow: "hidden" }}>
      <button onClick={dec} disabled={atMin}
        style={{ ...btnStyle, borderRight: "1px solid var(--border)", opacity: atMin ? 0.35 : 1 }}>−</button>
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && commit()}
        style={{
          flex: 1, minWidth: 70, border: "none", outline: "none",
          background: "var(--surface-2)", fontFamily: "var(--font-mono)",
          fontWeight: 600, fontSize: "var(--lg)", color, textAlign: "center",
        }}
      />
      <button onClick={inc} disabled={atMax}
        style={{ ...btnStyle, borderLeft: "1px solid var(--border)", opacity: atMax ? 0.35 : 1 }}>+</button>
    </div>
  );
}

export default function RAIDCalculator() {
  const [level, setLevel] = useState(0);
  const [drives, setDrives] = useState(4);
  const [unit, setUnit] = useState("TB");
  const [driveSize, setDriveSize] = useState(4); // default 4 TB
  const [overhead, setOverhead] = useState(1);

  // When unit changes, snap to nearest preset in new unit
  const handleUnitChange = (newUnit) => {
    const presets = CAPACITY_PRESETS[newUnit];
    // pick closest preset value
    const closest = presets.reduce((a, b) => Math.abs(b - driveSize) < Math.abs(a - driveSize) ? b : a);
    setUnit(newUnit);
    setDriveSize(closest);
  };

  const specs    = RAID_SPECS[level];
  const raw      = drives * driveSize;
  const presets  = CAPACITY_PRESETS[unit];

  let usableRaw = 0, dataDrives = 0, parityDrives = 0;
  let calcError = "";

  if (drives < specs.min) {
    calcError = `${specs.name} requires at least ${specs.min} drives.`;
  } else if (level === 10 && drives % 2 !== 0) {
    calcError = "RAID 10 requires an even number of drives.";
  } else {
    if (level === 0)    { dataDrives = drives;     parityDrives = 0;              usableRaw = raw; }
    if (level === 1)    { dataDrives = 1;           parityDrives = drives - 1;    usableRaw = driveSize; }
    if (level === 5)    { dataDrives = drives - 1;  parityDrives = 1;             usableRaw = (drives - 1) * driveSize; }
    if (level === 6)    { dataDrives = drives - 2;  parityDrives = 2;             usableRaw = (drives - 2) * driveSize; }
    if (level === 10)   { dataDrives = drives / 2;  parityDrives = drives / 2;    usableRaw = (drives / 2) * driveSize; }
    if (level === 50)   { const g = Math.max(2, Math.floor(drives / 3)); parityDrives = g; dataDrives = drives - g; usableRaw = dataDrives * driveSize; }
    if (level === 60)   { const g = Math.max(2, Math.floor(drives / 4)); parityDrives = g * 2; dataDrives = drives - parityDrives; usableRaw = dataDrives * driveSize; }
    if (level === "Z2") { dataDrives = drives - 2;  parityDrives = 2;             usableRaw = (drives - 2) * driveSize; }
  }

  const usable    = usableRaw * overhead;
  const ohCap     = raw - usable;
  const eff       = raw > 0 ? (usableRaw / raw * 100) : 0;
  const fmt       = (v) => v >= 1000 ? `${(v / 1000).toFixed(2)} P` : v >= 1 ? v.toFixed(2) : `${(v * 1024).toFixed(1)} m`;
  const usablePct = raw > 0 ? Math.min(100, usableRaw / raw * 100) : 0;
  const parityPct = raw > 0 ? Math.min(100, (raw - usableRaw) / raw * 100) : 0;

  const LEVELS     = [0, 1, 5, 6, 10, 50, 60, "Z2"];
  const LEVEL_DESC = { 0:"Striping", 1:"Mirroring", 5:"Dist. parity", 6:"Dual parity", 10:"Mirror+stripe", 50:"RAID 5+stripe", 60:"RAID 6+stripe", Z2:"ZFS dual-p" };

  const labelStyle = { fontFamily: "var(--font-mono)", fontSize: "var(--xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginBottom: 5 };

  return (
    <div className="page-enter">
      <PageHeader title="RAID calculator" badge="storage" description="Compute usable capacity, fault tolerance, and efficiency for common RAID levels." />

      <Card title="RAID level">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginBottom: "1.2rem" }}>
          {LEVELS.map((l) => {
            const isActive = l === level;
            return (
              <button key={l} onClick={() => setLevel(l)}
                style={{ padding: "11px 7px", background: isActive ? "var(--green-bg)" : "var(--surface-2)", border: `1px solid ${isActive ? "var(--green-dim)" : "var(--border)"}`, borderRadius: 10, cursor: "pointer", textAlign: "center", transition: "all 0.13s", fontFamily: "var(--font-mono)" }}>
                <span style={{ fontSize: "var(--md)", fontWeight: 700, color: isActive ? "var(--green)" : "var(--text-muted)", display: "block", lineHeight: 1, marginBottom: 3 }}>{RAID_SPECS[l].name}</span>
                <span style={{ fontSize: "var(--xs)", color: isActive ? "var(--green-dim)" : "var(--text-faint)", fontFamily: "var(--font-sans)" }}>{LEVEL_DESC[l]}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {/* Number of drives */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={labelStyle}>Number of drives</label>
            <Stepper value={drives} onChange={setDrives} min={1} max={64} step={1} />
          </div>

          {/* Capacity unit */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={labelStyle}>Capacity unit</label>
            <CustomSelect options={["GB", "TB", "TiB", "GiB"]} value={unit} onChange={handleUnitChange} />
          </div>

          {/* Drive capacity */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={labelStyle}>Drive capacity ({unit})</label>
            <PresetStepper presets={presets} value={driveSize} onChange={setDriveSize} />
          </div>

          {/* FS overhead */}
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            <label style={labelStyle}>FS overhead</label>
            <CustomSelect options={FS_OVERHEAD_OPTIONS} value={overhead} onChange={(v) => setOverhead(parseFloat(v))} />
          </div>
        </div>
        {calcError && <div style={s.errBox}>{calcError}</div>}
      </Card>

      {!calcError && (
        <Card title="Capacity summary">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: "1rem" }}>
            {[
              { label: "Usable",    value: fmt(usable),  color: "var(--green)",  border: "var(--green-dim)" },
              { label: "Overhead",  value: fmt(ohCap),   color: "var(--amber)",  border: "var(--amber-dim)" },
              { label: "Raw total", value: fmt(raw),     color: "var(--purple)", border: "var(--purple-dim)" },
            ].map(({ label, value, color, border }) => (
              <div key={label} style={{ background: "var(--surface-2)", border: `1px solid ${border}`, borderRadius: 8, padding: "13px 10px", textAlign: "center" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--3xl)", fontWeight: 700, color, lineHeight: 1, display: "block" }}>{value}</span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "var(--sm)", color: "var(--text-faint)" }}>{unit}</span>
                <div style={{ fontSize: "var(--xs)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--text-faint)", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--xs)", color: "var(--text-faint)", fontFamily: "var(--font-mono)", marginBottom: 5 }}>
              <span>Usable {usablePct.toFixed(0)}%</span>
              <span>Overhead {parityPct.toFixed(0)}%</span>
            </div>
            <div style={{ height: 8, background: "var(--surface-3)", borderRadius: 4, overflow: "hidden", position: "relative" }}>
              <div style={{ height: "100%", width: `${usablePct.toFixed(1)}%`, background: "linear-gradient(90deg,var(--green),#22c97a)", borderRadius: 4, transition: "width 0.4s cubic-bezier(.4,0,.2,1)" }} />
              <div style={{ position: "absolute", top: 0, right: 0, height: "100%", width: `${parityPct.toFixed(1)}%`, background: "var(--amber)", opacity: 0.5, transition: "width 0.4s" }} />
            </div>
          </div>

          <CardLabel>Details</CardLabel>
          <DataTable
            highlightKeys={["Usable drives", "Fault tolerance"]}
            warnKeys={["Parity / mirror drives"]}
            rows={[
              ["RAID level",             specs.name],
              ["Configuration",          `${drives} × ${driveSize} ${unit}`],
              ["Usable drives",          `${dataDrives} (data)`],
              ["Parity / mirror drives", `${parityDrives} drive${parityDrives === 1 ? "" : "s"}`],
              ["Fault tolerance",        specs.fault === 0 ? "None" : `${specs.fault} simultaneous failure${specs.fault > 1 ? "s" : ""}`],
              ["Storage efficiency",     `${eff.toFixed(1)}%`],
              ["FS overhead applied",    `${((1 - overhead) * 100).toFixed(0)}%`],
              ["Min drives required",    specs.min],
              ["Read performance",       specs.read],
              ["Write performance",      specs.write],
              ["Rebuild risk",           specs.rebuild],
            ]}
          />
        </Card>
      )}
    </div>
  );
}
