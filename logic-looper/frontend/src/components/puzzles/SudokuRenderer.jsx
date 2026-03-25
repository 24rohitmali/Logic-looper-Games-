import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { updateSolution } from '../../store/puzzleSlice';

const SudokuRenderer = ({ puzzle }) => {
  const dispatch = useDispatch();

  console.log('%c🎮 SudokuRenderer received:', 'color: teal; font-weight: bold', puzzle);
  console.log('Has puzzle.puzzle:', !!puzzle?.puzzle, 'Grid rows:', puzzle?.puzzle?.length);
  
  const puzzleData = useMemo(() => {
    if (!puzzle || !puzzle.puzzle) {
      console.error('%c❌ SudokuRenderer: Invalid puzzle data:', 'color: red', puzzle);
      return null;
    }
    console.log('%c✅ SudokuRenderer: Valid puzzle data obtained', 'color: green');
    return puzzle.puzzle;
  }, [puzzle]);

  const [grid, setGrid] = useState(() => {
    if (!puzzleData) return [];
    return puzzleData.map(row => [...row]);
  });
  const [selectedCell, setSelectedCell] = useState(null);
  const currentSolution = useSelector(state => state.puzzle.currentSolution);
  const suppressDispatchRef = useRef(false);

  // Reset grid when puzzle data changes
  useEffect(() => {
    if (puzzleData && puzzleData.length > 0) {
      setGrid(puzzleData.map(row => [...row]));
      setSelectedCell(null);
      console.log('%c🔄 SudokuRenderer: Grid reset for new puzzle', 'color: teal');
    }
  }, [puzzleData]);

  // Update Redux state whenever grid changes
  useEffect(() => {
    if (grid.length > 0) {
      if (suppressDispatchRef.current) {
        suppressDispatchRef.current = false;
      } else {
        dispatch(updateSolution(grid));
        console.log('%c🎮 Sudoku grid updated:', 'color: purple', grid);
      }
    }
  }, [grid, dispatch]);

  // Sync from external solution/hint updates
  useEffect(() => {
    if (!currentSolution || !currentSolution.length) return;
    if (!grid || !grid.length) {
      suppressDispatchRef.current = true;
      setGrid(currentSolution.map(r => [...r]));
      return;
    }
    // shallow compare
    let same = true;
    if (currentSolution.length !== grid.length) same = false;
    else {
      for (let i = 0; i < currentSolution.length && same; i++) {
        for (let j = 0; j < currentSolution[i].length; j++) {
          if (currentSolution[i][j] !== grid[i][j]) { same = false; break; }
        }
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
        <p>Error: No puzzle data</p>
      </div>
    );
  }

  const handleCellClick = (row, col) => {
    if (puzzleData[row][col] !== 0) return;
    setSelectedCell({ row, col });
  };

  const handleNumberInput = (num) => {
    if (!selectedCell) return;
    const newGrid = grid.map(row => [...row]);
    newGrid[selectedCell.row][selectedCell.col] = num;
    setGrid(newGrid);
  };

  const N = puzzleData[0].length;
  const cellSize = N <= 3 ? 56 : N <= 6 ? 40 : 36;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>Sudoku Puzzle</h2>
      
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ backgroundColor: '#1f2937', padding: '0.5rem', borderRadius: '0.5rem' }}>
          {grid.map((row, rowIdx) => (
            <div key={rowIdx} style={{ display: 'flex' }}>
              {row.map((cell, colIdx) => {
                const isOriginal = puzzleData[rowIdx][colIdx] !== 0;
                const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
                const isWrong = !isOriginal && cell !== 0 && puzzle.solution && cell !== puzzle.solution[rowIdx][colIdx];
                return (
                  <motion.button
                    key={`${rowIdx}-${colIdx}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCellClick(rowIdx, colIdx)}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      margin: '0.125rem',
                      fontWeight: 'bold',
                      fontSize: N <= 3 ? '1.25rem' : N <= 6 ? '1rem' : '1.125rem',
                      borderRadius: '0.25rem',
                      border: isWrong ? '2px solid #ef4444' : 'none',
                      cursor: isOriginal ? 'not-allowed' : 'pointer',
                      backgroundColor: isOriginal ? '#4b5563' : isWrong ? '#fca5a5' : isSelected ? '#4f46e5' : 'white',
                      color: isOriginal || isSelected ? 'white' : isWrong ? '#991b1b' : '#1f2937',
                      transition: 'all 0.2s'
                    }}
                    title={isWrong ? '❌ Wrong number' : ''}
                  >
                    {cell !== 0 ? cell : ''}
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${N}, 1fr)`, gap: '0.5rem' }}>
        {Array.from({ length: N }, (_, i) => i + 1).map(num => (
          <motion.button
            key={num}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleNumberInput(num)}
            style={{
              backgroundColor: '#4f46e5',
              color: 'white',
              fontWeight: 'bold',
              padding: '0.5rem',
              borderRadius: '0.25rem',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#4338ca'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#4f46e5'}
          >
            {num}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default SudokuRenderer;
