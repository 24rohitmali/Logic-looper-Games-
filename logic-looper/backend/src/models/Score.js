import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const saveDailyScore = async (scoreData) => {
  try {
    const score = await prisma.dailyScore.upsert({
      where: {
        userId_date: {
          userId: scoreData.userId,
          date: scoreData.date
        }
      },
      update: {
        puzzleId: scoreData.puzzleId,
        solved: scoreData.solved,
        score: scoreData.score,
        timeTaken: scoreData.timeTaken
      },
      create: {
        userId: scoreData.userId,
        date: scoreData.date,
        puzzleId: scoreData.puzzleId,
        solved: scoreData.solved,
        score: scoreData.score,
        timeTaken: scoreData.timeTaken
      }
    });
    return score;
  } catch (error) {
    throw new Error(`Failed to save score: ${error.message}`);
  }
};

export const getUserDailyScore = async (userId, date) => {
  try {
    const score = await prisma.dailyScore.findUnique({
      where: {
        userId_date: {
          userId,
          date
        }
      }
    });
    return score;
  } catch (error) {
    throw new Error(`Failed to get daily score: ${error.message}`);
  }
};

export const getLeaderboard = async (date, limit = 100) => {
  try {
    const scores = await prisma.dailyScore.findMany({
      where: { date, solved: true },
      orderBy: { score: 'desc' },
      take: limit,
      select: {
        user: {
          select: { id: true, email: true, name: true }
        },
        score: true,
        timeTaken: true
      }
    });
    return scores;
  } catch (error) {
    throw new Error(`Failed to get leaderboard: ${error.message}`);
  }
};

export const getUserStats = async (userId) => {
  try {
    const stats = await prisma.userStats.findUnique({
      where: { userId }
    });
    return stats;
  } catch (error) {
    throw new Error(`Failed to get user stats: ${error.message}`);
  }
};

export const updateUserStats = async (userId, statsData) => {
  try {
    const stats = await prisma.userStats.update({
      where: { userId },
      data: statsData
    });
    return stats;
  } catch (error) {
    throw new Error(`Failed to update stats: ${error.message}`);
  }
};

export default prisma;
