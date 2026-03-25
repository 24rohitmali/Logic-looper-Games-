import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createUser = async (userData) => {
  try {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        stats: {
          create: {}
        }
      },
      include: {
        stats: true
      }
    });
    return user;
  } catch (error) {
    throw new Error(`Failed to create user: ${error.message}`);
  }
};

export const getUserById = async (id) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        stats: true,
        scores: true
      }
    });
    return user;
  } catch (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }
};

export const getUserByEmail = async (email) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        stats: true,
        scores: true
      }
    });
    return user;
  } catch (error) {
    throw new Error(`Failed to get user: ${error.message}`);
  }
};

export const updateUserStreak = async (userId, streak) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        streak,
        lastPlayed: new Date()
      }
    });
    return user;
  } catch (error) {
    throw new Error(`Failed to update streak: ${error.message}`);
  }
};

export const addPointsToUser = async (userId, points) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: {
          increment: points
        }
      }
    });
    return user;
  } catch (error) {
    throw new Error(`Failed to add points: ${error.message}`);
  }
};

export default prisma;
