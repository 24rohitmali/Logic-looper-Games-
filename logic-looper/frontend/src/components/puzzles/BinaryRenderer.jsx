import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSolution } from '../../store/puzzleSlice';

const BinaryRenderer = ({ puzzle }) => {
  const dispatch = useDispatch();

  if (!puzzle) return <div>Loading binary puzzle...</div>;

  const rows = puzzle.puzzle.length;
  const cols = puzzle.puzzle[0].length;

  const normalize = (v) => (v === -1 ? null : v);

  const [grid, setGrid] = useState(() => puzzle.puzzle.map(r => r.map(c => normalize(c))));
  const currentSolution = useSelector(state => state.puzzle.currentSolution);
  const suppressDispatchRef = useRef(false);

  useEffect(() => {
    // dispatch current solution to Redux whenever grid changes
    if (suppressDispatchRef.current) {
      suppressDispatchRef.current = false;
    } else {
      dispatch(updateSolution(grid));
    }
  }, [grid, dispatch]);

  // Sync from Redux (hints/external updates)
  useEffect(() => {
    if (!currentSolution || !currentSolution.length) return;
    // normalize and compare
    let same = currentSolution.length === grid.length;
    if (same) {
      for (let i = 0; i < currentSolution.length && same; i++) {
        for (let j = 0; j < currentSolution[i].length; j++) {
          if (currentSolution[i][j] !== grid[i][j]) { same = false; break; }
        }
      }
    }
    if (!same) {
      suppressDispatchRef.current = true;
      setGrid(currentSolution.map(r => r.map(c => c === null ? null : c)));
    }
  }, [currentSolution]);

  const handleCellClick = (r, c) => {
    setGrid(prev => {
      const copy = prev.map(row => row.slice());
      const val = copy[r][c];
      // cycle: null -> 0 -> 1 -> null
      const next = val === null ? 0 : val === 0 ? 1 : null;
      copy[r][c] = next;
      return copy;
    });
  };

  return (
    <div style={{ color: 'white' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Binary Logic Puzzle</h2>
      {puzzle.rules && (
        <ul style={{ marginBottom: '1rem' }}>
          {puzzle.rules.map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      )}

      <div style={{ display: 'inline-block', background: 'rgba(0,0,0,0.15)', padding: '0.5rem', borderRadius: '8px' }}>
        {grid.map((row, ri) => (
          <div key={ri} style={{ display: 'flex' }}>
            {row.map((cell, ci) => (
              <button
                key={ci}
                onClick={() => handleCellClick(ri, ci)}
                style={{
                  width: 36,
                  height: 36,
                  margin: 4,
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: cell === null ? 'transparent' : cell === 0 ? '#1f2937' : '#06b6d4',
                  color: 'white',
                  cursor: 'pointer'
                }}
                aria-label={`cell-${ri}-${ci}`}
              >
                {cell === null ? '' : cell}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '0.75rem', fontSize: '0.9rem', opacity: 0.9 }}>
        <p>Click a cell to cycle: empty → 0 → 1 → empty.</p>
        <p>Grid size: {rows}x{cols} — Difficulty: {puzzle.difficulty || 'unknown'}</p>
      </div>
    </div>
  );
};

export default BinaryRenderer;
