export function getAvailableSymbols(lessonData, level) {
  const maxLevel = Math.max(1, Math.min(level, lessonData.levels.length));
  const symbols = [];
  for (const lesson of lessonData.levels) {
    if (lesson.id <= maxLevel) {
      symbols.push(...lesson.symbols);
    }
  }
  return [...new Set(symbols)];
}

export function evaluateLevelChange(profile, lessonData) {
  const history = profile.sessionHistory || [];
  const recent = history.slice(-10);
  if (recent.length < 6) {
    return profile.progress.level;
  }

  const accuracy = recent.reduce((sum, row) => sum + row.accuracy, 0) / recent.length;
  const currLevel = profile.progress.level;
  const lesson = lessonData.levels.find((entry) => entry.id === currLevel);

  if (lesson && accuracy >= lesson.unlockAccuracy && currLevel < lessonData.levels.length) {
    return currLevel + 1;
  }

  if (accuracy < 0.6 && currLevel > 1) {
    return currLevel - 1;
  }

  return currLevel;
}
