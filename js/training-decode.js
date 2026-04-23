import { encodeTextToMorse, morseToTimeline } from "./morse-engine.js";

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function randomGroup(symbolPool, length) {
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += pickRandom(symbolPool);
  }
  return out;
}

function pickWord(wordPool, fallbackSymbols) {
  if (!wordPool?.length) {
    return randomGroup(fallbackSymbols, 4);
  }
  return pickRandom(wordPool);
}

export function createDecodeRound(symbolPool, options = {}) {
  const length = options.length || 1;
  const useWord = Boolean(options.useWord);
  const wordPool = options.wordPool || [];
  const symbol = useWord ? pickWord(wordPool, symbolPool) : randomGroup(symbolPool, length);
  return {
    mode: "decode",
    target: symbol,
    prompt: symbol
  };
}

export function renderDecodeTimeline(round, morseMap, timing) {
  const morseText = encodeTextToMorse(round.prompt, morseMap);
  return {
    morseText,
    timeline: morseToTimeline(morseText, timing)
  };
}

export function scoreDecodeRound(round, answer, latencyMs) {
  const clean = String(answer || "").trim().toUpperCase();
  const isCorrect = clean === round.target;
  return {
    isCorrect,
    expected: round.target,
    got: clean,
    latencyMs
  };
}
