import { configureStore } from '@reduxjs/toolkit';
import puzzleReducer from './puzzleSlice';
import userReducer from './userSlice';

export const store = configureStore({
  reducer: {
    puzzle: puzzleReducer,
    user: userReducer
  }
});

export default store;
