// Achievements System
export const ACHIEVEMENTS = {
  FIRST_SOLVE: {
    id: 'first_solve',
    name: 'Getting Started',
    description: 'Solve your first puzzle',
    icon: '🎯',
    condition: (stats) => stats.totalSolved >= 1
  },
  TEN_SOLVES: {
    id: 'ten_solves',
    name: 'Puzzle Master',
    description: 'Solve 10 puzzles',
    icon: '⭐',
    condition: (stats) => stats.totalSolved >= 10
  },
  FIFTY_SOLVES: {
    id: 'fifty_solves',
    name: 'Mega Master',
    description: 'Solve 50 puzzles',
    icon: '🏆',
    condition: (stats) => stats.totalSolved >= 50
  },
  HUNDRED_SOLVES: {
    id: 'hundred_solves',
    name: 'Legendary',
    description: 'Solve 100 puzzles',
    icon: '👑',
    condition: (stats) => stats.totalSolved >= 100
  },
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Solve a puzzle in under 30 seconds',
    icon: '⚡',
    condition: (stats) => stats.fastestTime < 30
  },
  STREAK_3: {
    id: 'streak_3',
    name: 'On Fire',
    description: 'Build a 3-day streak',
    icon: '🔥',
    condition: (stats) => stats.currentStreak >= 3
  },
  STREAK_7: {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Build a 7-day streak',
    icon: '🌟',
    condition: (stats) => stats.currentStreak >= 7
  },
  STREAK_30: {
    id: 'streak_30',
    name: 'Monthly Legend',
    description: 'Build a 30-day streak',
    icon: '🎖️',
    condition: (stats) => stats.currentStreak >= 30
  },
  PERFECT_GAME: {
    id: 'perfect_game',
    name: 'Perfect Score',
    description: 'Solve a puzzle without using hints',
    icon: '💯',
    condition: (stats) => stats.perfectGames >= 1
  },
  NO_HINTS_10: {
    id: 'no_hints_10',
    name: 'Hint-Free Expert',
    description: 'Solve 10 puzzles without hints',
    icon: '🧠',
    condition: (stats) => stats.perfectGames >= 10
  }
};

export const calculateStats = (progressData) => {
  const stats = {
    totalSolved: 0,
    fastestTime: Infinity,
    currentStreak: 0,
    perfectGames: 0,
    totalScore: 0,
    averageScore: 0,
    longestStreak: 0
  };

  if (!progressData || progressData.length === 0) return stats;

  const solved = progressData.filter((p) => p.solved);
  stats.totalSolved = solved.length;
  stats.totalScore = solved.reduce((acc, p) => acc + (p.score || 0), 0);
  stats.averageScore = stats.totalSolved > 0 ? Math.round(stats.totalScore / stats.totalSolved) : 0;

  solved.forEach((p) => {
    stats.fastestTime = Math.min(stats.fastestTime, p.timeElapsed || Infinity);
    if ((p.hintsUsed || 0) === 0) stats.perfectGames++;
  });

  // Calculate streaks
  if (solved.length > 0) {
    const sortedByDate = solved.sort((a, b) => new Date(b.date) - new Date(a.date));
    let currentStreak = 0;
    let longestStreak = 0;
    let lastDate = null;

    for (const progress of sortedByDate) {
      const progressDate = new Date(progress.date);
      if (!lastDate) {
        currentStreak = 1;
        longestStreak = 1;
        lastDate = progressDate;
      } else {
        const diffDays = (lastDate - progressDate) / (1000 * 60 * 60 * 24);
        if (Math.abs(diffDays - 1) < 0.1) {
          currentStreak++;
          longestStreak = Math.max(longestStreak, currentStreak);
        } else {
          break;
        }
        lastDate = progressDate;
      }
    }

    stats.currentStreak = currentStreak;
    stats.longestStreak = longestStreak;
  }

  return stats;
};

export const getUnlockedAchievements = (progressData) => {
  const stats = calculateStats(progressData);
  const unlocked = [];

  Object.values(ACHIEVEMENTS).forEach((achievement) => {
    if (achievement.condition(stats)) {
      unlocked.push({
        ...achievement,
        unlockedStats: {
          progress: stats[achievement.id] || 0,
          required: achievement.name
        }
      });
    }
  });

  return unlocked;
};
