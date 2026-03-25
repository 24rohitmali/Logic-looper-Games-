import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { updateSolution } from '../../store/puzzleSlice';

const PatternRenderer = ({ puzzle }) => {
  const dispatch = useDispatch();

  const puzzleData = useMemo(() => {
    if (!puzzle || !puzzle.puzzle) {
      console.error('Invalid pattern puzzle data:', puzzle);
      return null;
    }
    return puzzle.puzzle;
  }, [puzzle]);

  const [grid, setGrid] = useState(() => {
    if (!puzzleData) return [];
    return puzzleData.map(row => [...row]);
  });
  const currentSolution = useSelector(state => state.puzzle.currentSolution);
  const suppressDispatchRef = useRef(false);

  // Reset grid when puzzle data changes
  useEffect(() => {
    if (puzzleData && puzzleData.length > 0) {
      setGrid(puzzleData.map(row => [...row]));
      console.log('%c🔄 PatternRenderer: Grid reset for new puzzle', 'color: purple');
    }
  }, [puzzleData]);

  // Update Redux state whenever grid changes
  useEffect(() => {
    if (grid.length > 0) {
      if (suppressDispatchRef.current) {
        suppressDispatchRef.current = false;
      } else {
        dispatch(updateSolution(grid));
        console.log('%c🎨 Pattern grid updated:', 'color: purple', grid);
      }
    }
  }, [grid, dispatch]);

  // Sync from Redux (hints / external updates)
  useEffect(() => {
    if (!currentSolution || !currentSolution.length) return;
    // compare sizes
    if (!grid || grid.length !== currentSolution.length) {
      suppressDispatchRef.current = true;
      setGrid(currentSolution.map(r => [...r]));
      return;
    }
    let same = true;
    for (let i = 0; i < currentSolution.length && same; i++) {
      for (let j = 0; j < currentSolution[i].length; j++) {
        if (currentSolution[i][j] !== grid[i][j]) { same = false; break; }
      }
    }
    if (!same) {
      suppressDispatchRef.current = true;
      setGrid(currentSolution.map(r => [...r]));
    }
  }, [currentSolution]);

  if (!puzzleData) {
    return (
      <div style={{ color: 'white', padding: '1rem', background: 'rgba(255,0,0,0.3)', borderRadius: '0.5rem' }}>
        <p>Error: No pattern puzzle data</p>
      </div>
    );
  }

  const handleCellClick = (row, col) => {
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = newGrid[row][col] === 0 ? 1 : 0;
    setGrid(newGrid);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-white text-2xl font-bold">Pattern Matching Puzzle</h2>
      
      <div className="bg-white/10 p-4 rounded-lg backdrop-blur mb-4">
        {puzzle.rules && puzzle.rules.map((rule, idx) => (
          <p key={idx} className="text-white text-sm mb-2">• {rule}</p>
        ))}
      </div>

      <div className="flex justify-center">
        <div className="bg-gray-800 p-2 rounded-lg">
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} className="flex">
              {row.map((cell, colIdx) => (
                <motion.button
                  key={`${rowIdx}-${colIdx}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleCellClick(rowIdx, colIdx)}
                  className={`w-14 h-14 m-0.5 rounded transition border-2 ${
                    cell === 1
                      ? 'bg-indigo-500 border-indigo-600'
                      : 'bg-white/20 border-white/30 hover:border-white/50'
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatternRenderer;
