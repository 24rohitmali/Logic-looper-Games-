import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPuzzle: null,
  solved: false,
  startTime: null,
  currentSolution: null,
  hints: 3,
  timeElapsed: 0
};

const puzzleSlice = createSlice({
  name: 'puzzle',
  initialState,
  reducers: {
    setPuzzle: (state, action) => {
      state.currentPuzzle = action.payload;
      state.solved = false;
      state.startTime = Date.now();
      state.currentSolution = null;
      state.timeElapsed = 0;
    },
    updateSolution: (state, action) => {
      state.currentSolution = action.payload;
    },
    solvePuzzle: (state) => {
      state.solved = true;
      state.timeElapsed = Math.floor((Date.now() - state.startTime) / 1000);
    },
    useHint: (state) => {
      if (state.hints > 0) {
        state.hints -= 1;
      }
    },
    resetHints: (state) => {
      state.hints = 3;
    },
    updateTimeElapsed: (state, action) => {
      state.timeElapsed = action.payload;
    }
  }
});

export const {
  setPuzzle,
  updateSolution,
  solvePuzzle,
  useHint,
  resetHints,
  updateTimeElapsed
} = puzzleSlice.actions;

export default puzzleSlice.reducer;
