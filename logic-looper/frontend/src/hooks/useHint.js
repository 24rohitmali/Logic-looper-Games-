import { useDispatch, useSelector } from 'react-redux';
import { useHint as useHintAction, updateSolution } from '../store/puzzleSlice';

export const useHint = () => {
  const dispatch = useDispatch();
  const hints = useSelector(state => state.puzzle.hints);
  const currentPuzzle = useSelector(state => state.puzzle.currentPuzzle);
  const currentSolution = useSelector(state => state.puzzle.currentSolution);

  const useHintClick = () => {
    if (hints <= 0) return;

    try {
      // Decrease hint count
      dispatch(useHintAction());

      // Provide a simple, generic hint per puzzle type
      if (!currentPuzzle) return;

      const type = currentPuzzle.type;

      if (type === 'sudoku') {
        // Ensure we have a solution grid from the generator
        const solved = currentPuzzle.solution;
        if (!solved) return;

        // Initialize working grid from currentSolution or from puzzle if missing
        const work = (currentSolution && currentSolution.length) ? currentSolution.map(r => [...r]) : currentPuzzle.puzzle.map(r => [...r]);

        // Reveal first empty cell from solution
        let revealed = false;
        for (let r = 0; r < work.length && !revealed; r++) {
          for (let c = 0; c < work[r].length && !revealed; c++) {
            if (work[r][c] === 0 || work[r][c] === null) {
              work[r][c] = solved[r][c];
              revealed = true;
            }
          }
        }
        if (revealed) dispatch(updateSolution(work));
      } else if (type === 'pattern') {
        const solution = currentPuzzle.solution;
        if (!solution) return;
        const work = (currentSolution && currentSolution.length) ? currentSolution.map(r => [...r]) : currentPuzzle.puzzle.map(r => [...r]);
        let revealed = false;
        for (let r = 0; r < solution.length && !revealed; r++) {
          for (let c = 0; c < solution[r].length && !revealed; c++) {
            if (work[r][c] !== solution[r][c]) {
              work[r][c] = solution[r][c];
              revealed = true;
            }
          }
        }
        if (revealed) dispatch(updateSolution(work));
      } else if (type === 'sequence') {
        const visible = currentPuzzle.visible || [];
        const hidden = currentPuzzle.hidden || [];
        const work = Array.isArray(currentSolution) && currentSolution.length ? [...currentSolution] : Array(hidden.length).fill('');
        // reveal first empty hidden value
        for (let i = 0; i < work.length; i++) {
          if (!work[i] || work[i] === '') {
            work[i] = hidden[i] != null ? String(hidden[i]) : '';
            break;
          }
        }
        dispatch(updateSolution(work));
      } else if (type === 'binary') {
        const solution = currentPuzzle.solution;
        if (!solution) return;
        const work = (currentSolution && currentSolution.length) ? currentSolution.map(r => [...r]) : currentPuzzle.puzzle.map(r => r.map(c => (c === -1 ? null : c)));
        let revealed = false;
        for (let r = 0; r < solution.length && !revealed; r++) {
          for (let c = 0; c < solution[r].length && !revealed; c++) {
            if (work[r][c] === null || work[r][c] === undefined) {
              work[r][c] = solution[r][c];
              revealed = true;
            }
          }
        }
        if (revealed) dispatch(updateSolution(work));
      } else if (type === 'deduction') {
        // For deduction, reveal one attribute value from solution mapping
        const sol = currentPuzzle.solution;
        if (!sol || !Array.isArray(sol) || sol.length === 0) return;
        const work = Array.isArray(currentSolution) && currentSolution.length ? currentSolution.map(r => ({ ...r })) : sol.map(s => ({ entity: s.entity, ...Object.fromEntries(Object.keys(s).filter(k => k !== 'entity').map(k => [k, ''])) }));
        // find first missing attr and fill from solution
        let revealed = false;
        for (let i = 0; i < work.length && !revealed; i++) {
          const keys = Object.keys(sol[i]).filter(k => k !== 'entity');
          for (const k of keys) {
            if (!work[i][k]) {
              work[i][k] = sol[i][k];
              revealed = true;
              break;
            }
          }
        }
        if (revealed) dispatch(updateSolution(work));
      }

    } catch (err) {
      console.error('useHint failed:', err);
    }
  };

  return { useHintClick, hints };
};
