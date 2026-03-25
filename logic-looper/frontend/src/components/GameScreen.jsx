import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import Header from './Header';
import PuzzleRenderer from './PuzzleRenderer';
import ControlPanel from './ControlPanel';
import StatsDashboard from './StatsDashboard';
import AuthModal from './AuthModal';
import { generatePuzzle } from '../utils/puzzleGenerator';
import { setPuzzle, resetHints } from '../store/puzzleSlice';
import { setGuestMode } from '../store/userSlice';
import { getTodayDate, formatDate } from '../utils/dateUtils';
import { initProgressDB } from '../utils/progressTracker';

const GameScreen = () => {
  const [showAuthModal, setShowAuthModal] = useState(!localStorage.getItem('logicLooperUser'));
  const [error, setError] = useState(null);
  const [gameReady, setGameReady] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector(state => state.user);

  useEffect(() => {
    // Initialize Progress Database
    initProgressDB()
      .then(() => {
        console.log('%c✅ Progress DB initialized', 'color: green');
      })
      .catch((err) => {
        console.error('Error initializing Progress DB:', err);
      });
  }, []);

  useEffect(() => {
    try {
      console.log('%c🔄 GameScreen: Generating puzzle...', 'color: blue; font-weight: bold');
      const today = getTodayDate();
      console.log('Today date:', today);
      const todayStr = formatDate(today);
      console.log('Today string:', todayStr);
      
      console.log('%c📦 About to call generatePuzzle (randomized)...', 'color: orange');
      // Generate a randomized puzzle each load so numbers/positions change between opens
      const puzzle = generatePuzzle(today, { randomize: true });
      console.log('%c✅ Puzzle generated successfully:', 'color: green; font-weight: bold', puzzle);
      console.log('Puzzle structure - type:', puzzle?.type, 'has puzzle prop:', !!puzzle?.puzzle, 'puzzle length:', puzzle?.puzzle?.length);
      
      if (!puzzle) {
        throw new Error('Generated puzzle is null or undefined');
      }

      console.log('%c📋 Detailed puzzle structure:', 'color: purple; font-weight: bold');
      console.log('- Type:', puzzle.type);
      console.log('- Has puzzle property:', !!puzzle.puzzle);
      if (puzzle.puzzle) console.log('- Puzzle is array:', Array.isArray(puzzle.puzzle), '- Puzzle length:', puzzle.puzzle.length);
      console.log('- Has solution:', !!puzzle.solution);
      console.log('- Has visible:', !!puzzle.visible);
      console.log('- Has hidden:', !!puzzle.hidden);
      console.log('- Has entities:', !!puzzle.entities);
      console.log('- Has attributes:', !!puzzle.attributes);
      console.log('- Has clues:', !!puzzle.clues);
      console.log('- Has grid:', !!puzzle.grid);

      // Validate required fields depending on puzzle type
      const type = puzzle.type || '';
      // Per-type validation: different puzzle types expose different shapes
      if (type === 'sudoku') {
        if (!puzzle.puzzle || !Array.isArray(puzzle.puzzle) || puzzle.puzzle.length === 0) {
          throw new Error('Generated SUDOKU puzzle invalid: puzzle=' + JSON.stringify(puzzle.puzzle?.slice?.(0, 3)));
        }
        console.log('%c✅ SUDOKU puzzle validated', 'color: green');
      } else if (type === 'pattern') {
        // pattern puzzles may expose `pattern` or `puzzle` depending on generator
        if (!puzzle.pattern && !puzzle.puzzle) {
          throw new Error('Generated PATTERN puzzle missing pattern data');
        }
        console.log('%c✅ PATTERN puzzle validated', 'color: green');
      } else if (type === 'binary') {
        if (!puzzle.puzzle || !Array.isArray(puzzle.puzzle)) {
          throw new Error('Generated BINARY puzzle missing grid data');
        }
        console.log('%c✅ BINARY puzzle validated', 'color: green');
      } else if (type === 'deduction') {
        // deduction puzzles are object-shaped: require entities, attributes, clues, solution
        if (!puzzle.entities || !puzzle.attributes || !puzzle.clues || !puzzle.solution) {
          throw new Error('Generated DEDUCTION puzzle missing required fields: entities=' + !!puzzle.entities + ', attributes=' + !!puzzle.attributes + ', clues=' + !!puzzle.clues + ', solution=' + !!puzzle.solution);
        }
        console.log('%c✅ DEDUCTION puzzle validated', 'color: green');
      } else if (type === 'sequence') {
        if (!puzzle.visible && !puzzle.sequence) {
          throw new Error('Generated SEQUENCE puzzle missing visible/sequence array');
        }
        console.log('%c✅ SEQUENCE puzzle validated', 'color: green');
      }
      
      dispatch(setPuzzle(puzzle));
      console.log('%c✅ Puzzle dispatched to Redux', 'color: green');
      dispatch(resetHints());
      
      localStorage.setItem('lastPuzzleDate', todayStr);
      setGameReady(true);
      console.log('%c✅ GameReady set to true', 'color: green; font-weight: bold');
    } catch (err) {
      console.error('%c❌ GameScreen: Error details:', 'color: red; font-weight: bold');
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Full error:', err);
      console.error('Stack:', err.stack);
      setError({
        message: err.message,
        stack: err.stack
      });
    }
  }, [dispatch]);

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#667eea',
        padding: '2rem',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <h1>⚠️ Game Error</h1>
        <p><strong>Error:</strong> {error.message}</p>
        <details style={{ marginTop: '1rem', padding: '1rem', backgroundColor: 'rgba(0,0,0,0.2)',borderRadius: '0.5rem' }}>
          <summary style={{cursor: 'pointer'}}>Stack Trace</summary>
          <pre style={{marginTop: '0.5rem', fontSize: '0.75rem',overflow: 'auto'}}>{error.stack}</pre>
        </details>
      </div>
    );
  }

  if (!gameReady) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#667eea',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{fontSize: '1.5rem'}}>Setting up your daily puzzle...</div>
      </div>
    );
  }

  const handleGuestMode = () => {
    dispatch(setGuestMode());
    setShowAuthModal(false);
  };

  const handleAuth = (userData) => {
    localStorage.setItem('logicLooperUser', JSON.stringify(userData));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('logicLooperUser');
    setShowAuthModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 50%, #ec4899 100%)',
        padding: '1rem'
      }}
    >
      <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem' }}>
          <button
            onClick={() => setShowStats(!showStats)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: showStats ? '#4f46e5' : 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              backdropFilter: 'blur(10px)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = e.target.style.backgroundColor === '#4f46e5' ? '#4338ca' : 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = showStats ? '#4f46e5' : 'rgba(255, 255, 255, 0.2)'}
          >
            📊 {showStats ? 'Hide' : 'View'} Stats
          </button>
          
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 'bold',
              backdropFilter: 'blur(10px)',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          >
            🚪 Logout
          </button>
        </div>
        {showStats ? (
          <StatsDashboard />
        ) : (
          <>
            <Header />
            <PuzzleRenderer />
            <ControlPanel />
          </>
        )}
      </div>

      {showAuthModal && <AuthModal onGuestMode={handleGuestMode} onAuth={handleAuth} />}
    </motion.div>
  );
};

export default GameScreen;
