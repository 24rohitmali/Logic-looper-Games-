import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSolution } from '../../store/puzzleSlice';

const DeductionRenderer = ({ puzzle }) => {
  const dispatch = useDispatch();

  if (!puzzle) return <div>Loading deduction puzzle...</div>;

  const { entities = [], attributes = {}, clues = [] } = puzzle;

  // initial assignment: empty selections
  const initial = entities.map(e => ({ entity: e, ...Object.fromEntries(Object.keys(attributes).map(k => [k, ''])) }));

  const [rows, setRows] = useState(initial);
  const currentSolution = useSelector(state => state.puzzle.currentSolution);
  const suppressDispatchRef = useRef(false);

  useEffect(() => {
    // push current answer mapping to Redux for submit
    if (suppressDispatchRef.current) {
      suppressDispatchRef.current = false;
    } else {
      dispatch(updateSolution(rows));
    }
  }, [rows, dispatch]);

  // Sync from Redux (hints/external updates)
  useEffect(() => {
    if (!currentSolution || !currentSolution.length) return;
    // deep compare minimal
    let same = currentSolution.length === rows.length;
    if (same) {
      for (let i = 0; i < currentSolution.length && same; i++) {
        const keys = Object.keys(currentSolution[i]).filter(k => k !== 'entity');
        for (const k of keys) {
          if ((currentSolution[i][k] || '') !== (rows[i][k] || '')) { same = false; break; }
        }
      }
    }
    if (!same) {
      suppressDispatchRef.current = true;
      setRows(currentSolution.map(r => ({ ...r })));
    }
  }, [currentSolution]);

  const handleChange = (idx, attr, value) => {
    setRows(prev => {
      const copy = prev.map(r => ({ ...r }));
      copy[idx][attr] = value;
      return copy;
    });
  };

  return (
    <div style={{ color: 'white' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>Deduction Puzzle</h2>

      {clues.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <h4>Clues</h4>
          <ul>
            {clues.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      )}

      <table style={{ borderCollapse: 'collapse', marginBottom: '0.5rem' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '0.5rem 0.75rem' }}>Entity</th>
            {Object.keys(attributes).map((attr) => (
              <th key={attr} style={{ textAlign: 'left', padding: '0.5rem 0.75rem' }}>{attr}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.entity}>
              <td style={{ padding: '0.5rem 0.75rem' }}>{row.entity}</td>
              {Object.entries(attributes).map(([attr, options]) => (
                <td key={attr} style={{ padding: '0.25rem 0.5rem' }}>
                  <select value={row[attr] || ''} onChange={(e) => handleChange(idx, attr, e.target.value)}>
                    <option value="">—</option>
                    {options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
        <p>Fill each entity's attributes using the dropdowns above. Your current answers are saved automatically.</p>
      </div>
    </div>
  );
};

export default DeductionRenderer;
