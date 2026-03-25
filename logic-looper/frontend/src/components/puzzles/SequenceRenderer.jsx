import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { updateSolution } from '../../store/puzzleSlice';

const SequenceRenderer = ({ puzzle }) => {
  const dispatch = useDispatch();

  const puzzleData = useMemo(() => {
    if (!puzzle || !puzzle.visible) {
      console.error('Invalid sequence puzzle data:', puzzle);
      return null;
    }
    return puzzle;
  }, [puzzle]);

  const [answers, setAnswers] = useState(['', '']);
  const currentSolution = useSelector(state => state.puzzle.currentSolution);
  const suppressDispatchRef = useRef(false);

  // Reset answers when puzzle changes
  useEffect(() => {
    setAnswers(['', '']);
    console.log('%c🔄 SequenceRenderer: Answers reset for new puzzle', 'color: purple');
  }, [puzzleData]);

  // Update Redux state whenever answers change
  useEffect(() => {
    if (suppressDispatchRef.current) {
      suppressDispatchRef.current = false;
    } else {
      dispatch(updateSolution(answers));
      console.log('%c📊 Sequence answers updated:', 'color: purple', answers);
    }
  }, [answers, dispatch]);

  // Sync from Redux (hints / external updates)
  useEffect(() => {
    if (!currentSolution || !currentSolution.length) return;
    // ensure array shape
    const cs = Array.isArray(currentSolution) ? currentSolution : [];
    let same = cs.length === answers.length && cs.every((v, i) => String(v) === String(answers[i]));
    if (!same) {
      suppressDispatchRef.current = true;
      setAnswers(cs.map(v => String(v)));
    }
  }, [currentSolution]);

  if (!puzzleData) {
    return (
      <div style={{ color: 'white', padding: '1rem', background: 'rgba(255,0,0,0.3)', borderRadius: '0.5rem' }}>
        <p>Error: No sequence puzzle data</p>
      </div>
    );
  }

  const handleAnswerChange = (idx, value) => {
    const newAnswers = [...answers];
    newAnswers[idx] = value;
    setAnswers(newAnswers);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-white text-2xl font-bold">Sequence Solver</h2>

      <div className="bg-white/10 p-6 rounded-lg backdrop-blur">
        <p className="text-white text-lg font-mono mb-6">
          {puzzle.visible.join(' → ')} → <span className="text-yellow-300">?</span> → <span className="text-yellow-300">?</span>
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-white text-sm mb-2 block">5th Number</label>
            <input
              type="number"
              value={answers[0]}
              onChange={(e) => handleAnswerChange(0, e.target.value)}
              className="w-full px-4 py-2 rounded bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-white/50 outline-none"
              placeholder="Enter number"
            />
          </div>
          <div>
            <label className="text-white text-sm mb-2 block">6th Number</label>
            <input
              type="number"
              value={answers[1]}
              onChange={(e) => handleAnswerChange(1, e.target.value)}
              className="w-full px-4 py-2 rounded bg-white/20 text-white placeholder-white/50 border border-white/30 focus:border-white/50 outline-none"
              placeholder="Enter number"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequenceRenderer;
