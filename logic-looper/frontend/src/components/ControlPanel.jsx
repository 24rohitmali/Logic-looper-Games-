import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Lightbulb, Share2 } from 'lucide-react';
import { useHint } from '../hooks/useHint';
import { secondsToHMS } from '../utils/dateUtils';
import { updateTimeElapsed, solvePuzzle, resetHints, setPuzzle } from '../store/puzzleSlice';
import { PUZZLE_TYPES, generateSudokuPuzzle, generatePuzzleSeed } from '../utils/puzzleGenerator';
import { savePuzzleProgress } from '../utils/progressTracker';
import { generatePuzzle } from '../utils/puzzleGenerator';
import { generateShareLink, getShareMessage } from '../utils/shareUtils';

const ControlPanel = () => {
  try {
    const puzzle = useSelector(state => state.puzzle);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [sudokuSize, setSudokuSize] = useState(9);
    const dispatch = useDispatch();
    const { useHintClick, hints } = useHint();

    // Memoize score calculation to avoid React setState warning
    const finalScore = useMemo(() => {
      const baseScore = 1000;
      const timeBonus = Math.max(0, 300 - timeElapsed);
      const hintsPenalty = (3 - hints) * 50;
      return baseScore + timeBonus - hintsPenalty;
    }, [timeElapsed, hints]);

    useEffect(() => {
      // Don't start timer if puzzle is already solved
      if (puzzle.solved) return;
      
      const interval = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          dispatch(updateTimeElapsed(newTime));
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }, [dispatch, puzzle.solved]);

    const handleSubmit = () => {
      console.log('%c📤 Submit button clicked', 'color: blue; font-weight: bold');
      
      // Calculate score based on time and hints used
      const baseScore = 1000;
      const timeBonus = Math.max(0, 300 - timeElapsed); // Bonus for speed (5 min max)
      const hintsPenalty = (3 - hints) * 50; // Penalty for hints used
      const finalScore = baseScore + timeBonus - hintsPenalty;
      
      console.log('%c🎯 Score Calculation:', 'color: orange; font-weight: bold');
      console.log('Base Score:', baseScore);
      console.log('Time Bonus:', timeBonus);
      console.log('Hints Penalty:', hintsPenalty);
      console.log('Final Score:', finalScore);
      
      // Save progress to IndexedDB
      const today = new Date();
      const progressData = {
        solved: true,
        timeElapsed,
        hintsUsed: 3 - hints,
        score: finalScore,
        solution: puzzle.currentSolution
      };
      
      savePuzzleProgress(today, progressData)
        .then(() => {
          console.log('%c✅ Progress saved to IndexedDB!', 'color: green; font-weight: bold');
        })
        .catch((error) => {
          console.error('Error saving progress:', error);
        });
      
      // Mark puzzle as solved
      dispatch(solvePuzzle());
      console.log('%c✅ Puzzle marked as solved!', 'color: green; font-weight: bold');
    };

    return (
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          marginTop: '2rem',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '0.75rem',
          padding: '1.5rem'
        }}
      >
        {puzzle.solved && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              textAlign: 'center',
              marginBottom: '1.5rem',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              background: 'linear-gradient(135deg, #86efac 0%, #60a5fa 100%)',
              color: 'white'
            }}
          >
            <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              🎉 Puzzle Solved!
            </h2>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              {finalScore}
              {' '}Points
            </p>
            <div style={{ fontSize: '0.875rem', opacity: 0.9, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
              <div>⏱️ Time: {secondsToHMS(timeElapsed)}</div>
              <div>💡 Hints Used: {3 - hints}</div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const shareLink = generateShareLink(puzzle.currentPuzzle.puzzle, puzzle.currentPuzzle.solution, finalScore);
                const message = getShareMessage({ hintsUsed: 3 - hints, timeElapsed, score: finalScore });
                const fullMessage = `${message}\n\nChallenge me: ${shareLink}`;
                
                navigator.clipboard.writeText(fullMessage);
                alert('Challenge link copied! Share it with friends 🎮');
              }}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '0.5rem'
              }}
            >
              📤 Share Challenge
            </motion.button>
          </motion.div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'white', fontSize: '0.875rem', opacity: 0.75 }}>Time Elapsed</p>
            <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'monospace' }}>{secondsToHMS(timeElapsed)}</p>
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'white', fontSize: '0.875rem', opacity: 0.75 }}>Status</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: puzzle.solved ? '#86efac' : '#93c5fd' }}>
              {puzzle.solved ? '✓ Solved!' : 'In Progress'}
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: 'white', fontSize: '0.875rem', opacity: 0.75 }}>Hints Left</p>
            <p style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>{hints}</p>
          </div>
        </div>

        <div style={{ gap: '0.75rem', display: puzzle.solved ? 'none' : 'flex', alignItems: 'center' }}>
          {puzzle.currentPuzzle?.type === PUZZLE_TYPES.SUDOKU && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
              <label style={{ color: 'white', fontWeight: 600 }}>Grid</label>
              <select
                value={sudokuSize}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  setSudokuSize(newSize);
                  // Auto-generate new puzzle with selected size asynchronously
                  setTimeout(() => {
                    try {
                      const seed = generatePuzzleSeed(new Date()) + '-' + Date.now();
                      const newPuzzle = generateSudokuPuzzle(seed, newSize);
                      newPuzzle.type = PUZZLE_TYPES.SUDOKU;
                      dispatch(updateTimeElapsed(0));
                      dispatch(resetHints());
                      dispatch(setPuzzle(newPuzzle));
                      console.log(`%c✅ New ${newSize}×${newSize} Sudoku generated`, 'color: green; font-weight: bold');
                    } catch (err) {
                      console.error('Failed to generate new Sudoku size:', err);
                    }
                  }, 0);
                }}
                style={{ padding: '0.4rem', borderRadius: '0.4rem' }}
              >
                <option value={6}>6×6</option>
                <option value={9}>9×9</option>
              </select>
            </div>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              // Generate asynchronously to keep UI responsive
              setTimeout(() => {
                try {
                  // Create a randomized new puzzle (not daily)
                  let newPuzzle;
                  if (puzzle.currentPuzzle?.type === PUZZLE_TYPES.SUDOKU) {
                    // generate sudoku with selected size
                    const seed = generatePuzzleSeed(new Date()) + '-' + Date.now();
                    newPuzzle = generateSudokuPuzzle(seed, sudokuSize);
                    newPuzzle.type = PUZZLE_TYPES.SUDOKU;
                  } else {
                    newPuzzle = generatePuzzle(new Date(), { randomize: true });
                  }
                  dispatch(updateTimeElapsed(0));
                  dispatch(resetHints());
                  dispatch(setPuzzle(newPuzzle));
                  console.log('%c🔀 New randomized puzzle generated', 'color: teal');
                } catch (err) {
                  console.error('Failed to generate new puzzle:', err);
                }
              }, 0);
            }}
            style={{
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              border: 'none',
              backgroundColor: '#06b6d4',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            🔀 New Game
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={useHintClick}
            disabled={hints === 0}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              border: 'none',
              cursor: hints === 0 ? 'not-allowed' : 'pointer',
              backgroundColor: hints === 0 ? '#9ca3af' : '#eab308',
              color: hints === 0 ? '#6b7280' : 'white',
              opacity: hints === 0 ? 0.5 : 1,
              transition: 'all 0.2s'
            }}
          >
            <Lightbulb size={20} />
            Use Hint
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSubmit}
            style={{
              flex: 1,
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontWeight: 'bold',
              border: 'none',
              backgroundColor: '#4f46e5',
              color: 'white',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#4338ca'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#4f46e5'}
          >
            Submit
          </motion.button>
        </div>
      </motion.div>
    );
  } catch (error) {
    return (
      <div style={{
        background: 'rgba(255, 0, 0, 0.3)',
        color: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        fontSize: '12px',
        marginTop: '2rem'
      }}>
        <p>Error in ControlPanel:</p>
        <p>{error.message}</p>
      </div>
    );
  }
};

export default ControlPanel;
