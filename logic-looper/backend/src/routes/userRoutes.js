import express from 'express';
import { createUser, getUserByEmail, getUserById, updateUserStreak, addPointsToUser } from '../models/User.js';

const router = express.Router();

// Create or login user
router.post('/register', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    let user = await getUserByEmail(email);
    
    if (!user) {
      user = await createUser({ email, name });
    }
    
    res.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        streak: user.streak,
        totalPoints: user.totalPoints
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await getUserById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        streak: user.streak,
        totalPoints: user.totalPoints,
        stats: user.stats
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update streak
router.post('/:id/streak', async (req, res) => {
  try {
    const { streak } = req.body;
    const user = await updateUserStreak(req.params.id, streak);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        streak: user.streak,
        lastPlayed: user.lastPlayed
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add points
router.post('/:id/points', async (req, res) => {
  try {
    const { points } = req.body;
    const user = await addPointsToUser(req.params.id, points);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        totalPoints: user.totalPoints
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
