import { createDecodeRound } from "./training-decode.js";
import { createEncodeRound } from "./training-encode.js";

export function createMixedRound(profile, symbolPool, morseMap) {
  const rounds = profile.progress.rounds || 0;
  const shouldDecode = rounds % 2 === 0;
  return shouldDecode ? createDecodeRound(symbolPool) : createEncodeRound(symbolPool, morseMap);
}
