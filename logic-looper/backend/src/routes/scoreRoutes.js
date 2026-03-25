import express from 'express';
import { saveDailyScore, getUserDailyScore, getLeaderboard, getUserStats, updateUserStats } from '../models/Score.js';

const router = express.Router();

// Save daily score
router.post('/', async (req, res) => {
  try {
    const { userId, date, puzzleId, solved, score, timeTaken } = req.body;
    
    if (!userId || !date) {
      return res.status(400).json({ error: 'userId and date are required' });
    }
    
    const dailyScore = await saveDailyScore({
      userId,
      date,
      puzzleId,
      solved,
      score,
      timeTaken
    });
    
    res.json({ success: true, score: dailyScore });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get daily score
router.get('/:userId/:date', async (req, res) => {
  try {
    const { userId, date } = req.params;
    const score = await getUserDailyScore(userId, date);
    
    res.json({ 
      success: true, 
      score: score || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get leaderboard
router.get('/leaderboard/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit) : 100;
    
    const leaderboard = await getLeaderboard(date, limit);
    
    res.json({
      success: true,
      leaderboard: leaderboard.map((entry, idx) => ({
        rank: idx + 1,
        user: entry.user,
        score: entry.score,
        timeTaken: entry.timeTaken
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user stats
router.get('/stats/:userId', async (req, res) => {
  try {
    const stats = await getUserStats(req.params.userId);
    
    if (!stats) {
      return res.status(404).json({ error: 'Stats not found' });
    }
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user stats
router.post('/stats/:userId', async (req, res) => {
  try {
    const { puzzlesSolved, avgSolveTime, totalAttempts } = req.body;
    
    const stats = await updateUserStats(req.params.userId, {
      puzzlesSolved,
      avgSolveTime,
      totalAttempts
    });
    
    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
