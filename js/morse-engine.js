export function flattenMorseTable(tableData) {
  return {
    ...tableData.letters,
    ...tableData.numbers,
    ...tableData.punctuation
  };
}

export function buildReverseMap(map) {
  const reverse = {};
  for (const [symbol, code] of Object.entries(map)) {
    reverse[code] = symbol;
  }
  return reverse;
}

export function encodeTextToMorse(text, map) {
  const chars = String(text || "").toUpperCase().split("");
  const tokens = [];
  for (const ch of chars) {
    if (ch === " ") {
      tokens.push("/");
      continue;
    }
    if (map[ch]) {
      tokens.push(map[ch]);
    }
  }
  return tokens.join(" ");
}

export function decodeMorseToText(morseText, reverseMap) {
  const tokens = String(morseText || "").trim().split(/\s+/).filter(Boolean);
  let out = "";
  for (const token of tokens) {
    if (token === "/") {
      out += " ";
      continue;
    }
    out += reverseMap[token] || "?";
  }
  return out;
}

export function getTiming(wpm = 15, effectiveWpm = 8) {
  const safeWpm = Math.max(5, Number(wpm) || 15);
  const safeEff = Math.max(5, Number(effectiveWpm) || 8);
  const ditMs = 1200 / safeWpm;
  const standardCharGap = ditMs * 3;
  const standardWordGap = ditMs * 7;

  const effDit = 1200 / safeEff;
  const farnsworthCharGap = Math.max(standardCharGap, effDit * 3);
  const farnsworthWordGap = Math.max(standardWordGap, effDit * 7);

  return {
    ditMs,
    dahMs: ditMs * 3,
    intraGapMs: ditMs,
    charGapMs: farnsworthCharGap,
    wordGapMs: farnsworthWordGap,
    classifyThresholdMs: ditMs * 2.1
  };
}

export function morseToTimeline(morseText, timing) {
  const events = [];
  const tokens = String(morseText || "").trim().split(/\s+/).filter(Boolean);
  for (let tokenIndex = 0; tokenIndex < tokens.length; tokenIndex += 1) {
    const token = tokens[tokenIndex];
    if (token === "/") {
      events.push({ type: "gap", durationMs: timing.wordGapMs });
      continue;
    }

    for (let i = 0; i < token.length; i += 1) {
      const unit = token[i];
      events.push({ type: "on", durationMs: unit === "-" ? timing.dahMs : timing.ditMs });
      if (i < token.length - 1) {
        events.push({ type: "gap", durationMs: timing.intraGapMs });
      }
    }

    const nextToken = tokens[tokenIndex + 1];
    if (nextToken && nextToken !== "/") {
      events.push({ type: "gap", durationMs: timing.charGapMs });
    }
  }
  return events;
}

export function keyingDurationsToMorse(presses, timing) {
  return presses
    .map((ms) => (ms >= timing.classifyThresholdMs ? "-" : "."))
    .join("");
}

export function sanitizeSymbolInput(value) {
  return String(value || "").trim().toUpperCase();
}
