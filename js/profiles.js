const STORAGE_KEY = "morsen.v1";

function defaultProfileBaseName() {
  const language = String(globalThis.navigator?.language || "en").toLowerCase();
  return language.startsWith("de") ? "Funker" : "Operator";
}

function newProfile(name = "Operator") {
  return {
    id: crypto.randomUUID(),
    name,
    created: Date.now(),
    lastAccessed: Date.now(),
    settings: {
      mode: "decode",
      output: "audio-light",
      audioStyle: "classic",
      visualStyle: "led",
      decodeDifficulty: "auto",
      language: "de",
      wpm: 15,
      effectiveWpm: 8
    },
    progress: {
      level: 1,
      rounds: 0,
      correct: 0,
      accuracy: 0
    },
    weakspots: {},
    sessionHistory: []
  };
}

function createDefaultStore() {
  const profile = newProfile(`${defaultProfileBaseName()} 1`);
  return {
    schemaVersion: 1,
    activeProfileId: profile.id,
    profiles: [profile]
  };
}

export function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return createDefaultStore();
    }
    const parsed = JSON.parse(raw);
    if (!parsed || !Array.isArray(parsed.profiles) || !parsed.profiles.length) {
      return createDefaultStore();
    }
    for (const profile of parsed.profiles) {
      profile.settings = profile.settings || {};
      if (!profile.settings.language) {
        profile.settings.language = "de";
      }
      if (!profile.settings.decodeDifficulty) {
        profile.settings.decodeDifficulty = "auto";
      }
    }
    return parsed;
  } catch {
    return createDefaultStore();
  }
}

export function saveStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function getActiveProfile(store) {
  const active = store.profiles.find((p) => p.id === store.activeProfileId);
  return active || store.profiles[0];
}

export function setActiveProfile(store, profileId) {
  store.activeProfileId = profileId;
  const active = getActiveProfile(store);
  active.lastAccessed = Date.now();
  return store;
}

export function createProfile(store, name) {
  const fallback = `${defaultProfileBaseName()} ${store.profiles.length + 1}`;
  const profile = newProfile(name || fallback);
  store.profiles.push(profile);
  store.activeProfileId = profile.id;
  return profile;
}

export function renameProfile(store, profileId, name) {
  const target = store.profiles.find((p) => p.id === profileId);
  if (target && name.trim()) {
    target.name = name.trim();
  }
}

export function deleteProfile(store, profileId) {
  if (store.profiles.length <= 1) {
    return;
  }
  const index = store.profiles.findIndex((p) => p.id === profileId);
  if (index >= 0) {
    store.profiles.splice(index, 1);
  }
  if (!store.profiles.some((p) => p.id === store.activeProfileId)) {
    store.activeProfileId = store.profiles[0].id;
  }
}

export function replaceActiveProfile(store, profile) {
  const idx = store.profiles.findIndex((p) => p.id === profile.id);
  if (idx >= 0) {
    store.profiles[idx] = profile;
  }
}

export function exportProfile(profile) {
  return JSON.stringify(profile, null, 2);
}

export function importIntoStore(store, payload) {
  const profile = JSON.parse(payload);
  if (!profile.id || !profile.name) {
    throw new Error("Invalid profile payload");
  }
  store.profiles.push(profile);
  store.activeProfileId = profile.id;
}
