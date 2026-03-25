import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { setPuzzle } from '../store/puzzleSlice';
import { generateSudokuPuzzle, generatePatternPuzzle, generateSequencePuzzle, PUZZLE_TYPES } from '../utils/puzzleGenerator';
import { useRef } from 'react';
import { Flame, Star } from 'lucide-react';

const Header = () => {
  try {
    const user = useSelector(state => state.user);
    const puzzle = useSelector(state => state.puzzle);

    return (
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{ marginBottom: '2rem' }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem'
        }}>
          <h1 style={{
            fontSize: '2.25rem',
            fontWeight: 'bold',
            color: 'white'
          }}>
            ✨ Logic Looper
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {user.streak > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#f97316',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '9999px'
              }}>
                <Flame size={24} />
                <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{user.streak}</span>
              </div>
            )}
            {user.totalPoints > 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#eab308',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '9999px'
              }}>
                <Star size={24} />
                <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{user.totalPoints}</span>
              </div>
            )}
          </div>
          {process.env.NODE_ENV !== 'production' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DevCycleButton />
            </div>
          )}
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '0.75rem',
          padding: '1rem',
          color: 'white'
        }}>
          <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
            Today's Puzzle: <span style={{ fontWeight: 'bold', fontSize: '1.125rem', textTransform: 'capitalize' }}>{puzzle.type || 'Loading...'}</span>
          </p>
          {puzzle.difficulty && (
            <p style={{
              fontSize: '0.875rem',
              marginTop: '0.5rem',
              fontWeight: '600',
              color: puzzle.difficulty === 'easy' ? '#bbf7d0' :
                     puzzle.difficulty === 'medium' ? '#fef3c7' :
                     '#fecaca'
            }}>
              Difficulty: {puzzle.difficulty.toUpperCase()}
            </p>
          )}
        </div>
      </motion.div>
    );
  } catch (error) {
    return (
      <div style={{
        background: 'rgba(255, 0, 0, 0.3)',
        color: 'white',
        padding: '1rem',
        borderRadius: '0.5rem',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        fontSize: '12px',
        marginBottom: '1rem'
      }}>
        <p>Error in Header:</p>
        <p>{error.message}</p>
      </div>
    );
  }
};

const DevCycleButton = () => {
  const dispatch = useDispatch();
  const idxRef = useRef(0);
  const types = [PUZZLE_TYPES.SUDOKU, PUZZLE_TYPES.PATTERN, PUZZLE_TYPES.SEQUENCE];

  const handleClick = () => {
    const type = types[idxRef.current % types.length];
    idxRef.current += 1;

    let puzzleObj;
    const seed = 'dev-seed';
    switch (type) {
      case PUZZLE_TYPES.SUDOKU:
        puzzleObj = generateSudokuPuzzle(seed);
        break;
      case PUZZLE_TYPES.PATTERN:
        puzzleObj = generatePatternPuzzle(seed);
        break;
      case PUZZLE_TYPES.SEQUENCE:
        puzzleObj = generateSequencePuzzle(seed);
        break;
      default:
        puzzleObj = generateSudokuPuzzle(seed);
    }

    dispatch(setPuzzle({ ...puzzleObj, type }));
  };

  return (
    <button
      onClick={handleClick}
      style={{ padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: 'none', background: '#10b981', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
    >
      Dev: Cycle Puzzle
    </button>
  );
};

export default Header;
