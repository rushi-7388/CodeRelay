import { useEffect, useState } from "react";
import { getApiCandidates } from "../lib/relayBalancer";
import { config } from "../lib/config";

export default function RelayBalanceIndicator() {
  const [latency, setLatency] = useState(null);

  useEffect(() => {
    const api = config.apiUrl;
    if (!api) return;
    const origin = api.replace(/\/api\/?$/, "");
    const start = performance.now();
    fetch(`${origin}/health/live`, { credentials: "omit" })
      .then((r) => (r.ok ? Math.round(performance.now() - start) : null))
      .then(setLatency)
      .catch(() => setLatency(null));
  }, []);

  if (!import.meta.env.DEV) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[100] text-[10px] font-mono px-3 py-1.5 rounded-full bg-black/60 border border-emerald-500/30 text-emerald-300 backdrop-blur-md"
      title={`Pool: ${getApiCandidates().join(", ")}`}
    >
      Relay Balance · {config.apiUrl?.replace(/^https?:\/\//, "")}
      {latency != null ? ` · ${latency}ms` : ""}
    </div>
  );
}
