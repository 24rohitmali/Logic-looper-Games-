import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import SudokuRenderer from './puzzles/SudokuRenderer';
import PatternRenderer from './puzzles/PatternRenderer';
import SequenceRenderer from './puzzles/SequenceRenderer';
import DeductionRenderer from './puzzles/DeductionRenderer';
import BinaryRenderer from './puzzles/BinaryRenderer';
import { PUZZLE_TYPES } from '../utils/puzzleGenerator';

const PuzzleRenderer = () => {
  const puzzle = useSelector(state => state.puzzle.currentPuzzle);
  
  console.log('%c🎨 PuzzleRenderer received puzzle:', 'color: purple; font-weight: bold', puzzle);
  console.log('Puzzle type:', puzzle?.type, 'Puzzle grid length:', puzzle?.puzzle?.length);

  if (!puzzle) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          textAlign: 'center',
          color: 'white',
          paddingTop: '3rem',
          paddingBottom: '3rem',
          fontFamily: 'Arial, sans-serif'
        }}
      >
        <p>Loading puzzle...</p>
      </motion.div>
    );
  }

  try {
    const renderPuzzle = () => {
      switch (puzzle.type) {
        case PUZZLE_TYPES.SUDOKU:
          return <SudokuRenderer puzzle={puzzle} />;
        case PUZZLE_TYPES.PATTERN:
          return <PatternRenderer puzzle={puzzle} />;
        case PUZZLE_TYPES.SEQUENCE:
          return <SequenceRenderer puzzle={puzzle} />;
        case PUZZLE_TYPES.DEDUCTION:
          return <DeductionRenderer puzzle={puzzle} />;
        case PUZZLE_TYPES.BINARY:
          return <BinaryRenderer puzzle={puzzle} />;
        default:
          throw new Error(`Unknown puzzle type: ${puzzle.type}`);
      }
    };

    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        {renderPuzzle()}
      </motion.div>
    );
  } catch (error) {
    console.error('%c❌ PuzzleRenderer Error:', 'color: red; font-weight: bold', error);
    return (
      <div style={{
        background: 'rgba(255, 0, 0, 0.3)',
        color: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        fontSize: '12px'
      }}>
        <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
          🚨 Error rendering puzzle
        </p>
        <p>{error.message}</p>
        <details style={{ marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(0,0,0,0.2)' }}>
          <summary style={{ cursor: 'pointer' }}>Details</summary>
          <pre>{error.stack}</pre>
        </details>
        <p>Error rendering puzzle:</p>
        <p>{error.message}</p>
        <p>{error.stack}</p>
      </div>
    );
  }
};

export default PuzzleRenderer;
