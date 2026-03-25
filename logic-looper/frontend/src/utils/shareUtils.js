// Puzzle Share & Challenge System
export const generateShareLink = (puzzle, solution, score) => {
  const encodedData = btoa(JSON.stringify({
    puzzle,
    solution,
    score,
    date: new Date().toISOString().split('T')[0],
    version: 1
  }));
  
  const baseUrl = window.location.origin;
  return `${baseUrl}?challenge=${encodedData}`;
};

export const decodeShareLink = (encoded) => {
  try {
    const decoded = atob(encoded);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Invalid share link:', error);
    return null;
  }
};

export const getShareMessage = (stats) => {
  const messages = {
    perfect: '🎉 I just solved the Logic Looper puzzle PERFECTLY with 0 hints!',
    fast: '⚡ Speedy! Solved in {time} seconds!',
    good: '🎯 Great performance! Scored {score} points!',
    decent: '👍 Puzzle solved! Can you beat my score?',
    struggle: '💪 Finally solved it! Want to give it a try?'
  };

  if (stats.hintsUsed === 0 && stats.timeElapsed < 60) {
    return messages.perfect;
  } else if (stats.timeElapsed < 30) {
    return messages.fast.replace('{time}', stats.timeElapsed);
  } else if (stats.score > 900) {
    return messages.good.replace('{score}', stats.score);
  } else if (stats.score > 700) {
    return messages.decent;
  } else {
    return messages.struggle;
  }
};

export const createLeaderboardEntry = (userId, email, score, timeElapsed, date) => {
  return {
    userId,
    email,
    score,
    timeElapsed,
    date: date || new Date().toISOString().split('T')[0],
    timestamp: Date.now(),
    rank: 0 // To be set by server
  };
};

export const calculateRank = (entries, currentScore) => {
  const sorted = entries.filter((e) => e.date === new Date().toISOString().split('T')[0]).sort((a, b) => b.score - a.score);
  const rank = sorted.findIndex((e) => e.score === currentScore) + 1;
  return rank || sorted.length + 1;
};
