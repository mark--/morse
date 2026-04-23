import { encodeTextToMorse, keyingDurationsToMorse } from "./morse-engine.js";

export function createEncodeRound(symbolPool, morseMap) {
  const symbol = symbolPool[Math.floor(Math.random() * symbolPool.length)];
  return {
    mode: "encode",
    target: symbol,
    expectedMorse: encodeTextToMorse(symbol, morseMap)
  };
}

export function scoreEncodeRound(round, presses, timing, latencyMs) {
  const inputMorse = keyingDurationsToMorse(presses, timing);
  const expected = round.expectedMorse.replace(/\s+/g, "");
  const isCorrect = inputMorse === expected;
  return {
    isCorrect,
    expected,
    got: inputMorse,
    latencyMs
  };
}
