import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getAllProgressData, getStreakData } from '../utils/progressTracker';
import { calculateStats, getUnlockedAchievements } from '../utils/achievements';

const StatsDashboard = () => {
  const [stats, setStats] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streakData, setStreakData] = useState({ streak: 0, lastDate: null });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const progressData = await getAllProgressData();
      const calculatedStats = calculateStats(progressData);
      const unlockedAchievements = getUnlockedAchievements(progressData);
      const streakInfo = await getStreakData();

      setStats(calculatedStats);
      setAchievements(unlockedAchievements);
      setStreakData(streakInfo);
      generateHeatmapData(progressData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateHeatmapData = (progressData) => {
    const heatmap = {};
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

    // Initialize all days in the past year
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      heatmap[dateStr] = { solved: false, score: 0 };
    }

    // Fill in actual progress
    progressData.forEach((p) => {
      if (heatmap[p.date]) {
        heatmap[p.date] = { solved: p.solved, score: p.score || 0 };
      }
    });

    setHeatmapData(Object.entries(heatmap).map(([date, data]) => ({ date, ...data })));
  };

  if (loading) {
    return (
      <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>
        Loading stats...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        color: 'white',
        padding: '1.5rem',
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '0.75rem',
        marginBottom: '2rem'
      }}
    >
      {/* Overall Stats */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>📊 Your Stats</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{ background: 'rgba(249, 115, 22, 0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.875rem', opacity: 0.75 }}>Current Streak</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{streakData.streak} 🔥</div>
          </div>
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.875rem', opacity: 0.75 }}>Puzzles Solved</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.totalSolved} ✅</div>
          </div>
          <div style={{ background: 'rgba(34, 197, 94, 0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.875rem', opacity: 0.75 }}>Average Score</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.averageScore} 🎯</div>
          </div>
          <div style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
            <div style={{ fontSize: '0.875rem', opacity: 0.75 }}>Fastest Time</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{Math.round(stats.fastestTime)}s ⚡</div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>🏆 Achievements</h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '1rem'
          }}>
            {achievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  textAlign: 'center',
                  cursor: 'pointer'
                }}
                title={achievement.description}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{achievement.icon}</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>{achievement.name}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Heatmap */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>📈 Activity</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(53, 1fr)',
          gap: '2px',
          padding: '1rem 0'
        }}>
          {heatmapData.map((day) => (
            <div
              key={day.date}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '2px',
                backgroundColor: day.solved 
                  ? `hsl(120, 100%, ${100 - (day.score / 1000) * 50}%)`
                  : '#374151',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title={`${day.date}: ${day.solved ? `✅ Score: ${day.score}` : '❌ Not solved'}`}
              onMouseEnter={(e) => {
                e.target.style.transform = 'scale(1.5)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'scale(1)';
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '0.5rem' }}>
          Green = Solved | Gray = Not attempted
        </div>
      </div>
    </motion.div>
  );
};

export default StatsDashboard;
