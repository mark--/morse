import {
  flattenMorseTable,
  buildReverseMap,
  getTiming,
  sanitizeSymbolInput
} from "./morse-engine.js";
import { AudioOutput } from "./audio-output.js";
import { VisualOutput } from "./visual-output.js";
import { KeyboardKeying } from "./input-keyboard.js";
import { MouseKeying } from "./input-mouse.js";
import { createDecodeRound, renderDecodeTimeline, scoreDecodeRound } from "./training-decode.js";
import { createEncodeRound, scoreEncodeRound } from "./training-encode.js";
import { createMixedRound } from "./training-mixed.js";
import { getAvailableSymbols, evaluateLevelChange } from "./progression.js";
import { updateWeakspot, getTopWeakspot, pickWeakspotSymbol } from "./weakspots.js";
import { pushSession, updateProgress } from "./persistence.js";
import {
  loadStore,
  saveStore,
  getActiveProfile,
  setActiveProfile,
  createProfile,
  renameProfile,
  deleteProfile,
  replaceActiveProfile,
  exportProfile,
  importIntoStore
} from "./profiles.js";
import { applyTranslations, normalizeLanguage, t } from "./i18n.js";

const ui = {
  profileSelect: document.getElementById("profile-select"),
  profileNew: document.getElementById("profile-new"),
  profileRename: document.getElementById("profile-rename"),
  profileDelete: document.getElementById("profile-delete"),
  languageSelect: document.getElementById("language-select"),
  modeSelect: document.getElementById("mode-select"),
  outputSelect: document.getElementById("output-select"),
  audioStyle: document.getElementById("audio-style"),
  visualStyle: document.getElementById("visual-style"),
  difficultySelect: document.getElementById("difficulty-select"),
  wpm: document.getElementById("wpm"),
  effectiveWpm: document.getElementById("effective-wpm"),
  startBtn: document.getElementById("start-btn"),
  stopBtn: document.getElementById("stop-btn"),
  submitAnswer: document.getElementById("submit-answer"),
  clearKeying: document.getElementById("clear-keying"),
  textAnswer: document.getElementById("text-answer"),
  promptLabel: document.getElementById("prompt-label"),
  hintLine: document.getElementById("hint-line"),
  led: document.getElementById("led-indicator"),
  flash: document.getElementById("flash-overlay"),
  keyPad: document.getElementById("key-pad"),
  liveKeying: document.getElementById("live-keying"),
  statLevel: document.getElementById("stat-level"),
  statDifficulty: document.getElementById("stat-difficulty"),
  statAccuracy: document.getElementById("stat-accuracy"),
  statRounds: document.getElementById("stat-rounds"),
  statWeak: document.getElementById("stat-weak"),
  exportData: document.getElementById("export-data"),
  importData: document.getElementById("import-data"),
  docsLink: document.getElementById("docs-link"),
  docsFrame: document.getElementById("docs-frame")
};

const state = {
  store: loadStore(),
  profile: null,
  lessonData: null,
  morseMap: null,
  reverseMap: null,
  wordLists: { en: [], de: [] },
  currentRound: null,
  roundStartedAt: 0,
  keyboardPresses: [],
  mousePresses: [],
  language: "en",
  decodeAutoLoopActive: false,
  nextRoundTimer: null,
  isSubmitting: false
};

const audio = new AudioOutput();
const visual = new VisualOutput(ui.led, ui.flash);
const keyboard = new KeyboardKeying(window);
const mouse = new MouseKeying(ui.keyPad);

keyboard.onUpdate = (presses) => {
  state.keyboardPresses = presses;
  renderLiveKeying();
};

mouse.onUpdate = (presses) => {
  state.mousePresses = presses;
  renderLiveKeying();
};

function getKeyingPresses() {
  return state.mousePresses.length ? state.mousePresses : state.keyboardPresses;
}

function clearKeying() {
  keyboard.clear();
  mouse.clear();
  state.keyboardPresses = [];
  state.mousePresses = [];
  renderLiveKeying();
}

function currentTiming() {
  return getTiming(Number(ui.wpm.value), Number(ui.effectiveWpm.value));
}

function getDecodeDifficulty(level) {
  if (level <= 2) {
    return { length: 1, useWord: false, i18nKey: "difficulty.single" };
  }
  if (level <= 4) {
    return { length: 2, useWord: false, i18nKey: "difficulty.pair" };
  }
  if (level === 5) {
    return { length: 3, useWord: false, i18nKey: "difficulty.group" };
  }
  return { length: 1, useWord: true, i18nKey: "difficulty.word" };
}

function getDecodeDifficultyFromSelection(selection, level) {
  if (selection === "single") {
    return { length: 1, useWord: false, i18nKey: "difficulty.single" };
  }
  if (selection === "pair") {
    return { length: 2, useWord: false, i18nKey: "difficulty.pair" };
  }
  if (selection === "group") {
    return { length: 3, useWord: false, i18nKey: "difficulty.group" };
  }
  if (selection === "word") {
    return { length: 1, useWord: true, i18nKey: "difficulty.word" };
  }
  return getDecodeDifficulty(level);
}

function getWordPool(symbolPool) {
  const localeWords = state.wordLists[state.language] || state.wordLists.de || state.wordLists.en || [];
  const letterSet = new Set(symbolPool.filter((symbol) => /^[A-Z]$/.test(symbol)));
  return localeWords.filter((word) => {
    if (word.length < 3 || word.length > 8) {
      return false;
    }
    for (const ch of word) {
      if (!letterSet.has(ch)) {
        return false;
      }
    }
    return true;
  });
}

function clearNextRoundTimer() {
  if (state.nextRoundTimer) {
    window.clearTimeout(state.nextRoundTimer);
    state.nextRoundTimer = null;
  }
}

function queueNextDecodeRound(delayMs = 140) {
  if (!state.decodeAutoLoopActive || ui.modeSelect.value !== "decode") {
    return;
  }
  clearNextRoundTimer();
  state.nextRoundTimer = window.setTimeout(() => {
    state.nextRoundTimer = null;
    startRound();
  }, delayMs);
}

function getSymbolPool(mode) {
  const available = getAvailableSymbols(state.lessonData, state.profile.progress.level);
  if (mode === "weakspot" && Object.keys(state.profile.weakspots || {}).length) {
    const target = pickWeakspotSymbol(state.profile.weakspots, available);
    return [target, ...available.filter((item) => item !== target).slice(0, 5)];
  }
  return available;
}

function renderProfiles() {
  ui.profileSelect.innerHTML = "";
  for (const profile of state.store.profiles) {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = profile.name;
    if (profile.id === state.store.activeProfileId) {
      option.selected = true;
    }
    ui.profileSelect.appendChild(option);
  }
}

function saveActiveProfile() {
  replaceActiveProfile(state.store, state.profile);
  saveStore(state.store);
}

function syncSettingsFromProfile() {
  const settings = state.profile.settings;
  ui.modeSelect.value = settings.mode;
  ui.outputSelect.value = settings.output;
  ui.audioStyle.value = settings.audioStyle;
  ui.visualStyle.value = settings.visualStyle;
  ui.difficultySelect.value = settings.decodeDifficulty || "auto";
  state.language = normalizeLanguage(settings.language);
  ui.languageSelect.value = state.language;
  ui.wpm.value = settings.wpm;
  ui.effectiveWpm.value = settings.effectiveWpm;
}

function syncSettingsToProfile() {
  state.profile.settings = {
    mode: ui.modeSelect.value,
    output: ui.outputSelect.value,
    audioStyle: ui.audioStyle.value,
    visualStyle: ui.visualStyle.value,
    decodeDifficulty: ui.difficultySelect.value,
    language: normalizeLanguage(ui.languageSelect.value),
    wpm: Number(ui.wpm.value),
    effectiveWpm: Number(ui.effectiveWpm.value)
  };
  state.language = state.profile.settings.language;
}

function renderStats() {
  const level = state.profile.progress.level;
  const lesson = state.lessonData.levels.find((entry) => entry.id === level);
  const selectedDifficulty = state.profile.settings.decodeDifficulty || "auto";
  const decodeDifficulty = getDecodeDifficultyFromSelection(selectedDifficulty, level);
  const localizedLessonName = typeof lesson?.name === "string"
    ? lesson.name
    : (lesson?.name?.[state.language] || lesson?.name?.en || "");
  const autoPrefix = selectedDifficulty === "auto" ? `${t(state.language, "difficulty.auto")}: ` : "";
  ui.statLevel.textContent = localizedLessonName ? `${level} (${localizedLessonName})` : String(level);
  ui.statDifficulty.textContent = `${autoPrefix}${t(state.language, decodeDifficulty.i18nKey)}`;
  ui.statAccuracy.textContent = `${Math.round((state.profile.progress.accuracy || 0) * 100)}%`;
  ui.statRounds.textContent = String(state.profile.progress.rounds || 0);
  ui.statWeak.textContent = getTopWeakspot(state.profile.weakspots || {});
}

function renderLiveKeying() {
  const timing = currentTiming();
  const sequence = getKeyingPresses().map((ms) => (ms >= timing.classifyThresholdMs ? "-" : ".")).join("");
  ui.liveKeying.textContent = sequence ? t(state.language, "trainer.keying", { sequence }) : "";
}

function applyLanguageToUi() {
  applyTranslations(document, state.language);
  if (state.language === "de") {
    ui.docsLink.href = "docs/reference.de.html";
    ui.docsFrame.src = "docs/reference.de.html";
  } else {
    ui.docsLink.href = "docs/reference.html";
    ui.docsFrame.src = "docs/reference.html";
  }
}

function stopPlayback() {
  audio.stop();
  visual.stop();
}

function stopTraining() {
  state.decodeAutoLoopActive = false;
  clearNextRoundTimer();
  stopPlayback();
  state.currentRound = null;
}

async function playRoundSignal(round) {
  const timing = currentTiming();
  if (round.mode !== "decode") {
    return;
  }

  const { morseText, timeline } = renderDecodeTimeline(round, state.morseMap, timing);
  ui.hintLine.textContent = t(state.language, "trainer.signal", { morse: morseText });

  const output = ui.outputSelect.value;
  if (output.includes("audio")) {
    audio.play(timeline, ui.audioStyle.value);
  }
  if (output.includes("light")) {
    visual.play(timeline, ui.visualStyle.value);
  }
}

function createRound() {
  syncSettingsToProfile();
  const mode = ui.modeSelect.value;
  const pool = getSymbolPool(mode);

  if (mode === "decode") {
    const decodeDifficulty = getDecodeDifficultyFromSelection(
      state.profile.settings.decodeDifficulty || "auto",
      state.profile.progress.level
    );
    return createDecodeRound(pool, {
      length: decodeDifficulty.length,
      useWord: decodeDifficulty.useWord,
      wordPool: getWordPool(pool)
    });
  }
  if (mode === "encode") {
    return createEncodeRound(pool, state.morseMap);
  }
  if (mode === "weakspot") {
    const weightedPool = getSymbolPool("weakspot");
    return createDecodeRound(weightedPool);
  }
  return createMixedRound(state.profile, pool, state.morseMap);
}

async function startRound() {
  clearKeying();
  clearNextRoundTimer();
  stopPlayback();

  const round = createRound();
  state.currentRound = round;
  state.roundStartedAt = performance.now();

  if (round.mode === "decode") {
    ui.promptLabel.textContent = t(state.language, "trainer.listenWatch");
    ui.hintLine.textContent = t(state.language, "trainer.typeDecoded");
    await playRoundSignal(round);
    return;
  }

  ui.promptLabel.textContent = t(state.language, "trainer.transmit", { target: round.target });
  ui.hintLine.textContent = t(state.language, "trainer.useSpace");
}

function submitRound() {
  if (!state.currentRound || state.isSubmitting) {
    return;
  }
  state.isSubmitting = true;

  const round = state.currentRound;
  const latencyMs = Math.round(performance.now() - state.roundStartedAt);
  const timing = currentTiming();

  let score;
  if (round.mode === "decode") {
    const answer = sanitizeSymbolInput(ui.textAnswer.value);
    score = scoreDecodeRound(round, answer, latencyMs);
  } else {
    const presses = getKeyingPresses();
    score = scoreEncodeRound(round, presses, timing, latencyMs);
  }

  updateProgress(state.profile, score.isCorrect);
  updateWeakspot(state.profile.weakspots, round.target, score.isCorrect, score.latencyMs);
  pushSession(state.profile, {
    timestamp: Date.now(),
    mode: round.mode,
    target: round.target,
    got: score.got,
    expected: score.expected,
    accuracy: score.isCorrect ? 1 : 0,
    latencyMs: score.latencyMs
  });

  state.profile.progress.level = evaluateLevelChange(state.profile, state.lessonData);
  saveActiveProfile();
  renderStats();
  state.currentRound = null;

  ui.promptLabel.textContent = score.isCorrect
    ? t(state.language, "trainer.correct")
    : t(state.language, "trainer.wrong");
  if (score.isCorrect) {
    ui.hintLine.textContent = t(state.language, "trainer.got", {
      got: score.got || t(state.language, "trainer.empty"),
      latency: score.latencyMs
    });
  } else {
    ui.hintLine.textContent = t(state.language, "trainer.correctWas", {
      expected: score.expected,
      got: score.got || t(state.language, "trainer.empty"),
      latency: score.latencyMs
    });
  }
  ui.textAnswer.value = "";
  clearKeying();

  if (round.mode === "decode") {
    queueNextDecodeRound(score.isCorrect ? 220 : 1600);
  }

  state.isSubmitting = false;
}

function maybeAutoSubmitDecode() {
  if (!state.currentRound || state.currentRound.mode !== "decode") {
    return;
  }
  const currentAnswer = sanitizeSymbolInput(ui.textAnswer.value);
  const expectedLength = state.currentRound.target.length;
  if (currentAnswer.length >= expectedLength) {
    submitRound();
  }
}

function attachEvents() {
  keyboard.attach(" ");
  mouse.attach();

  ui.startBtn.addEventListener("click", () => {
    state.decodeAutoLoopActive = ui.modeSelect.value === "decode";
    startRound();
  });
  ui.stopBtn.addEventListener("click", stopTraining);
  ui.submitAnswer.addEventListener("click", submitRound);
  ui.clearKeying.addEventListener("click", clearKeying);

  ui.textAnswer.addEventListener("input", () => {
    maybeAutoSubmitDecode();
  });

  ui.textAnswer.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitRound();
    }
  });

  ui.profileSelect.addEventListener("change", () => {
    setActiveProfile(state.store, ui.profileSelect.value);
    state.profile = getActiveProfile(state.store);
    syncSettingsFromProfile();
    applyLanguageToUi();
    renderStats();
    saveStore(state.store);
  });

  ui.profileNew.addEventListener("click", () => {
    const fallback = t(state.language, "dialog.newProfileDefault", { num: state.store.profiles.length + 1 });
    const name = prompt(t(state.language, "dialog.profileName"), fallback);
    if (!name) {
      return;
    }
    createProfile(state.store, name);
    state.profile = getActiveProfile(state.store);
    renderProfiles();
    syncSettingsFromProfile();
    applyLanguageToUi();
    renderStats();
    saveStore(state.store);
  });

  ui.profileRename.addEventListener("click", () => {
    const name = prompt(t(state.language, "dialog.renameProfile"), state.profile.name);
    if (!name) {
      return;
    }
    renameProfile(state.store, state.profile.id, name);
    state.profile = getActiveProfile(state.store);
    renderProfiles();
    saveStore(state.store);
  });

  ui.profileDelete.addEventListener("click", () => {
    if (!confirm(t(state.language, "dialog.deleteProfile", { name: state.profile.name }))) {
      return;
    }
    deleteProfile(state.store, state.profile.id);
    state.profile = getActiveProfile(state.store);
    renderProfiles();
    syncSettingsFromProfile();
    applyLanguageToUi();
    renderStats();
    saveStore(state.store);
  });

  ui.languageSelect.addEventListener("change", () => {
    syncSettingsToProfile();
    applyLanguageToUi();
    if (!state.currentRound) {
      ui.promptLabel.textContent = t(state.language, "trainer.pressStart");
      ui.hintLine.textContent = t(state.language, "trainer.decodeHint");
    }
    renderStats();
    renderLiveKeying();
    saveActiveProfile();
  });

  for (const element of [ui.modeSelect, ui.outputSelect, ui.audioStyle, ui.visualStyle, ui.difficultySelect, ui.wpm, ui.effectiveWpm]) {
    element.addEventListener("change", () => {
      syncSettingsToProfile();
      if (element === ui.modeSelect && ui.modeSelect.value !== "decode") {
        state.decodeAutoLoopActive = false;
        clearNextRoundTimer();
      }
      saveActiveProfile();
    });
  }

  ui.exportData.addEventListener("click", () => {
    const blob = new Blob([exportProfile(state.profile)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${state.profile.name.replace(/\s+/g, "_").toLowerCase()}-morsen-profile.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  ui.importData.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const payload = await file.text();
    try {
      importIntoStore(state.store, payload);
      state.profile = getActiveProfile(state.store);
      renderProfiles();
      syncSettingsFromProfile();
      applyLanguageToUi();
      renderStats();
      saveStore(state.store);
    } catch {
      alert(t(state.language, "dialog.importFailed"));
    }
    ui.importData.value = "";
  });
}

async function boot() {
  const [morseResponse, lessonResponse, wordResponse] = await Promise.all([
    fetch("data/morse-table.json"),
    fetch("data/lessons.json"),
    fetch("data/word-list.json")
  ]);

  const morseData = await morseResponse.json();
  const wordData = await wordResponse.json();
  state.lessonData = await lessonResponse.json();
  state.morseMap = flattenMorseTable(morseData);
  state.reverseMap = buildReverseMap(state.morseMap);
  const words = wordData?.words || {};
  state.wordLists = {
    en: Array.isArray(words.en) ? words.en.map((item) => String(item).toUpperCase()) : [],
    de: Array.isArray(words.de) ? words.de.map((item) => String(item).toUpperCase()) : []
  };

  state.profile = getActiveProfile(state.store);
  renderProfiles();
  syncSettingsFromProfile();
  applyLanguageToUi();
  renderStats();

  attachEvents();
}

boot().catch((error) => {
  console.error(error);
  ui.promptLabel.textContent = t(state.language, "boot.failed");
  ui.hintLine.textContent = t(state.language, "boot.console");
});
