import { useState, useEffect, useRef } from "react";
import { Card, PageHeader, DataTable, Spinner, s } from "./shared/index.jsx";

function fetchIPInfo(ip) {
  const url = ip ? `https://ipinfo.io/${encodeURIComponent(ip)}/json` : "https://ipinfo.io/json";
  return fetch(url).then((r) => r.json());
}

export default function IPInfoMap() {
  const [query, setQuery] = useState("loading…");
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const load = (ip) => {
    setLoading(true);
    setError("");
    setInfo(null);
    if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    fetchIPInfo(ip)
      .then((data) => {
        if (data.error) throw new Error(data.error.message || "Lookup failed");
        setInfo(data);
        if (data.ip) setQuery(data.ip);
        setLoading(false);
      })
      .catch((e) => { setError(e.message || "Could not fetch IP info."); setLoading(false); });
  };

  // Load own IP on mount
  useEffect(() => { load(""); }, []);

  const [lat, lng] = info?.loc ? info.loc.split(",").map(Number) : [null, null];

  const zoomIn  = () => mapInstance.current?.zoomIn();
  const zoomOut = () => mapInstance.current?.zoomOut();

  useEffect(() => {
    if (!lat || !lng) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css";
    document.head.appendChild(link);

    const initMap = () => {
      if (!mapRef.current || mapInstance.current) return;
      const map = new window.maplibregl.Map({
        container: mapRef.current,
        style: {
          version: 8,
          sources: { osm: { type: "raster", tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"], tileSize: 256, attribution: "© OpenStreetMap" } },
          layers: [{ id: "osm", type: "raster", source: "osm" }],
        },
        center: [lng, lat],
        zoom: 10,
      });
      const el = document.createElement("div");
      el.style.cssText = "width:20px;height:20px;position:relative;";
      const dot = document.createElement("div");
      dot.style.cssText = "width:14px;height:14px;background:var(--green);border-radius:50%;border:2px solid #fff;position:absolute;top:3px;left:3px;z-index:2;box-shadow:0 0 0 2px var(--green);";
      const ring = document.createElement("div");
      ring.style.cssText = "width:40px;height:40px;border:2px solid var(--green);border-radius:50%;position:absolute;top:-10px;left:-10px;animation:ripple 1.8s ease-out infinite;opacity:0.7;";
      el.appendChild(ring);
      el.appendChild(dot);
      new window.maplibregl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
      mapInstance.current = map;
    };

    if (window.maplibregl) {
      initMap();
    } else {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js";
      script.onload = initMap;
      document.head.appendChild(script);
    }

    return () => {
      if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current = null; }
    };
  }, [lat, lng]);

  const handleSearch = () => {
    const ip = query.trim();
    load(ip);
  };

  return (
    <div className="page-enter">
      <PageHeader title="IP info" badge="network" description="Lookup geolocation and network details for any IP address." />

      <Card title="Lookup">
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Enter IP address, or leave empty for your own IP…"
            style={{ ...s.monoInput, color: "var(--blue)", fontSize: "var(--md)" }}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{ padding: "10px 22px", background: "var(--green-bg)", border: "1px solid var(--green-dim)", borderRadius: 12, color: "var(--green)", fontFamily: "var(--font-mono)", fontSize: "var(--md)", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}
          >
            {loading ? <Spinner /> : null} Lookup
          </button>
        </div>
      </Card>

      {error && <div style={s.errBox}>{error}</div>}

      {info && (
        <>
          <Card title="Address details">
            <DataTable
              highlightKeys={["IP address"]}
              rows={[
                ["IP address", info.ip || "—"],
                ["Hostname",   info.hostname || "—"],
                ["City",       info.city || "—"],
                ["Region",     info.region || "—"],
                ["Country",    info.country || "—"],
                ["ISP / Org",  info.org || "—"],
                ["Postal",     info.postal || "—"],
                ["Timezone",   info.timezone || "—"],
                ["Coordinates", lat && lng ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : "—"],
              ]}
            />
          </Card>

          {lat && lng && (
            <Card style={{ overflow: "hidden", position: "relative" }} bodyStyle={{ padding: 0 }}>
              <div ref={mapRef} style={{ width: "100%", height: 340 }} />
              <div style={{ position: "absolute", top: 10, right: 10, zIndex: 10, display: "flex", flexDirection: "column", background: "var(--surface)", border: "1px solid var(--border-2)", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.35)" }}>
                <button onClick={zoomIn}  style={{ width: 36, height: 36, background: "transparent", border: "none", color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: "var(--lg)", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
                <div style={{ height: 1, background: "var(--border-2)", margin: "0 6px" }} />
                <button onClick={zoomOut} style={{ width: 36, height: 36, background: "transparent", border: "none", color: "var(--text)", fontFamily: "var(--font-mono)", fontSize: "var(--lg)", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
