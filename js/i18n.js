const TRANSLATIONS = {
  en: {
    "app.title": "Morsen Trainer",
    "header.eyebrow": "Morse Trainer",
    "profile.label": "Profile",
    "profile.choose": "Choose profile",
    "profile.new": "New",
    "profile.rename": "Rename",
    "profile.delete": "Delete",
    "language.label": "Language",
    "language.select": "Select language",
    "language.en": "English",
    "language.de": "Deutsch",
    "controls.aria": "Training controls",
    "controls.mode": "Mode",
    "controls.output": "Output",
    "controls.audioStyle": "Audio Style",
    "controls.visualStyle": "Visual Style",
    "controls.difficulty": "Difficulty",
    "controls.wpm": "WPM",
    "controls.farnsworth": "Farnsworth",
    "controls.farnsworthHelp": "Farnsworth keeps character speed high but adds longer gaps between characters/words to make copying easier.",
    "controls.start": "Start Round",
    "controls.stop": "Stop",
    "mode.decode": "Decode",
    "mode.encode": "Encode",
    "mode.mixed": "Mixed",
    "mode.weakspot": "Weak Spot",
    "output.audioLight": "Audio + Light",
    "output.audio": "Audio only",
    "output.light": "Light only",
    "audio.classic": "Classic Tone",
    "audio.softClick": "Soft Click",
    "audio.hardClick": "Hard Click",
    "visual.led": "Single LED",
    "visual.flash": "Screen Pulse",
    "trainer.pressStart": "Press Start",
    "trainer.decodeHint": "Decode mode: listen/watch and type the symbol.",
    "trainer.signalIndicator": "Signal indicator",
    "trainer.holdToKey": "Hold to key (mouse/touch)",
    "trainer.answer": "Answer",
    "trainer.submit": "Submit",
    "trainer.clearKeying": "Clear Keying",
    "trainer.listenWatch": "Listen / Watch",
    "trainer.typeDecoded": "Type the decoded symbol, then submit.",
    "trainer.transmit": "Transmit: {target}",
    "trainer.useSpace": "Use space key or hold the key pad, then submit.",
    "trainer.correct": "Correct",
    "trainer.wrong": "Wrong",
    "trainer.expected": "Expected {expected}",
    "trainer.correctWas": "Correct was {expected}. You entered {got} in {latency}ms",
    "trainer.got": "Got {got} in {latency}ms",
    "trainer.signal": "Signal: {morse}",
    "trainer.keying": "Keying: {sequence}",
    "trainer.empty": "(empty)",
    "status.aria": "Training status",
    "status.session": "Session",
    "status.level": "Level",
    "status.difficulty": "Difficulty",
    "status.accuracy": "Accuracy",
    "status.rounds": "Rounds",
    "status.weakSpot": "Weak Spot",
    "status.export": "Export Profile",
    "status.import": "Import",
    "docs.title": "Morse Reference",
    "docs.open": "Open Full Docs",
    "docs.iframeTitle": "Morse reference",
    "dialog.profileName": "Profile name",
    "dialog.newProfileDefault": "Operator {num}",
    "dialog.renameProfile": "New profile name",
    "dialog.deleteProfile": "Delete profile {name}?",
    "dialog.importFailed": "Import failed. Invalid profile JSON.",
    "difficulty.single": "Single character",
    "difficulty.pair": "Two characters",
    "difficulty.group": "Character group",
    "difficulty.word": "Word copy",
    "boot.failed": "Startup failed",
    "boot.console": "Check console for details."
  },
  de: {
    "app.title": "Morsen Trainer",
    "header.eyebrow": "Morse Trainer",
    "profile.label": "Profil",
    "profile.choose": "Profil auswaehlen",
    "profile.new": "Neu",
    "profile.rename": "Umbenennen",
    "profile.delete": "Loeschen",
    "language.label": "Sprache",
    "language.select": "Sprache auswaehlen",
    "language.en": "English",
    "language.de": "Deutsch",
    "controls.aria": "Training Steuerung",
    "controls.mode": "Modus",
    "controls.output": "Ausgabe",
    "controls.audioStyle": "Audio Stil",
    "controls.visualStyle": "Visueller Stil",
    "controls.difficulty": "Schwierigkeit",
    "controls.wpm": "WPM",
    "controls.farnsworth": "Farnsworth",
    "controls.farnsworthHelp": "Farnsworth haelt die Zeichengeschwindigkeit hoch, verlaengert aber die Abstaende zwischen Zeichen/Woertern und macht das Mitschreiben leichter.",
    "controls.start": "Runde starten",
    "controls.stop": "Stopp",
    "mode.decode": "Dekodieren",
    "mode.encode": "Kodieren",
    "mode.mixed": "Gemischt",
    "mode.weakspot": "Schwachstelle",
    "output.audioLight": "Audio + Licht",
    "output.audio": "Nur Audio",
    "output.light": "Nur Licht",
    "audio.classic": "Klassischer Ton",
    "audio.softClick": "Sanfter Klick",
    "audio.hardClick": "Harter Klick",
    "visual.led": "Einzelne LED",
    "visual.flash": "Bildschirm Puls",
    "trainer.pressStart": "Start druecken",
    "trainer.decodeHint": "Dekodiermodus: zuhoeren/zuschauen und das Zeichen tippen.",
    "trainer.signalIndicator": "Signalanzeige",
    "trainer.holdToKey": "Zum Tasten halten (Maus/Touch)",
    "trainer.answer": "Antwort",
    "trainer.submit": "Senden",
    "trainer.clearKeying": "Tastung loeschen",
    "trainer.listenWatch": "Zuhoeren / Zuschauen",
    "trainer.typeDecoded": "Dekodiertes Zeichen eingeben und senden.",
    "trainer.transmit": "Senden: {target}",
    "trainer.useSpace": "Leertaste oder Tastenflaeche halten, dann senden.",
    "trainer.correct": "Richtig",
    "trainer.wrong": "Falsch",
    "trainer.expected": "Erwartet {expected}",
    "trainer.correctWas": "Richtig waere {expected}. Deine Eingabe {got} in {latency}ms",
    "trainer.got": "Erhalten {got} in {latency}ms",
    "trainer.signal": "Signal: {morse}",
    "trainer.keying": "Tastung: {sequence}",
    "trainer.empty": "(leer)",
    "status.aria": "Trainingsstatus",
    "status.session": "Sitzung",
    "status.level": "Level",
    "status.difficulty": "Schwierigkeit",
    "status.accuracy": "Genauigkeit",
    "status.rounds": "Runden",
    "status.weakSpot": "Schwachstelle",
    "status.export": "Profil exportieren",
    "status.import": "Importieren",
    "docs.title": "Morse Referenz",
    "docs.open": "Vollstaendige Doku oeffnen",
    "docs.iframeTitle": "Morse Referenz",
    "dialog.profileName": "Profilname",
    "dialog.newProfileDefault": "Funker {num}",
    "dialog.renameProfile": "Neuer Profilname",
    "dialog.deleteProfile": "Profil {name} loeschen?",
    "dialog.importFailed": "Import fehlgeschlagen. Ungueltige Profil JSON.",
    "difficulty.single": "Einzelnes Zeichen",
    "difficulty.pair": "Zwei Zeichen",
    "difficulty.group": "Zeichengruppe",
    "difficulty.word": "Worttraining",
    "boot.failed": "Start fehlgeschlagen",
    "boot.console": "Konsole fuer Details pruefen."
  }
};

export function normalizeLanguage(language) {
  return language === "de" ? "de" : "en";
}

export function t(language, key, vars = {}) {
  const lang = normalizeLanguage(language);
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  let template = dict[key] || TRANSLATIONS.en[key] || key;
  for (const [name, value] of Object.entries(vars)) {
    template = template.replaceAll(`{${name}}`, String(value));
  }
  return template;
}

export function applyTranslations(root, language) {
  const lang = normalizeLanguage(language);
  root.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(lang, node.dataset.i18n);
  });

  root.querySelectorAll("[data-i18n-aria-label]").forEach((node) => {
    node.setAttribute("aria-label", t(lang, node.dataset.i18nAriaLabel));
  });

  root.querySelectorAll("[data-i18n-title]").forEach((node) => {
    node.setAttribute("title", t(lang, node.dataset.i18nTitle));
  });

  document.documentElement.lang = lang;
}
