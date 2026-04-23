function scoreRow(row) {
  const attempts = row.attempts || 0;
  const misses = row.misses || 0;
  const avgLatency = row.avgLatencyMs || 0;
  if (attempts === 0) {
    return 0;
  }
  const errorWeight = misses / attempts;
  const latencyWeight = Math.min(avgLatency / 1500, 1);
  return errorWeight * 0.75 + latencyWeight * 0.25;
}

export function updateWeakspot(weakspots, symbol, isCorrect, latencyMs) {
  const row = weakspots[symbol] || { attempts: 0, misses: 0, avgLatencyMs: 0, lastSeen: Date.now() };
  row.attempts += 1;
  if (!isCorrect) {
    row.misses += 1;
  }
  row.avgLatencyMs = row.avgLatencyMs === 0 ? latencyMs : Math.round((row.avgLatencyMs * 0.7) + (latencyMs * 0.3));
  row.lastSeen = Date.now();
  weakspots[symbol] = row;
  return weakspots;
}

export function pickWeakspotSymbol(weakspots, fallbackPool) {
  const list = Object.entries(weakspots)
    .map(([symbol, row]) => ({ symbol, score: scoreRow(row) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!list.length) {
    return fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
  }
  return list[0].symbol;
}

export function getTopWeakspot(weakspots) {
  const entries = Object.entries(weakspots);
  if (!entries.length) {
    return "-";
  }
  const top = entries
    .map(([symbol, row]) => ({ symbol, score: scoreRow(row) }))
    .sort((a, b) => b.score - a.score)[0];
  return top?.symbol || "-";
}
