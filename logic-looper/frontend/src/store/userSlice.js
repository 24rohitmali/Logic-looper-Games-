import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  authenticated: false,
  streak: 0,
  totalPoints: 0,
  lastPlayed: null,
  guestMode: false
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.authenticated = true;
      state.guestMode = false;
    },
    setStreak: (state, action) => {
      state.streak = action.payload;
    },
    incrementStreak: (state) => {
      state.streak += 1;
    },
    resetStreak: (state) => {
      state.streak = 0;
    },
    updateTotalPoints: (state, action) => {
      state.totalPoints = action.payload;
    },
    addPoints: (state, action) => {
      state.totalPoints += action.payload;
    },
    setLastPlayed: (state, action) => {
      state.lastPlayed = action.payload;
    },
    setGuestMode: (state) => {
      state.guestMode = true;
      state.authenticated = false;
    },
    logout: (state) => {
      state.user = null;
      state.authenticated = false;
      state.guestMode = false;
    }
  }
});

export const {
  setUser,
  setStreak,
  incrementStreak,
  resetStreak,
  updateTotalPoints,
  addPoints,
  setLastPlayed,
  setGuestMode,
  logout
} = userSlice.actions;

export default userSlice.reducer;
