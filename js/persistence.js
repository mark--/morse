export function pushSession(profile, row) {
  profile.sessionHistory = profile.sessionHistory || [];
  profile.sessionHistory.push(row);
  if (profile.sessionHistory.length > 200) {
    profile.sessionHistory = profile.sessionHistory.slice(-200);
  }
}

export function updateProgress(profile, isCorrect) {
  const progress = profile.progress;
  progress.rounds += 1;
  if (isCorrect) {
    progress.correct += 1;
  }
  progress.accuracy = progress.rounds ? progress.correct / progress.rounds : 0;
}
