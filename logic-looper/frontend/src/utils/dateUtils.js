import dayjs from 'dayjs';

export const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD');
};

export const getTodayDate = () => {
  return new Date();
};

export const isToday = (date) => {
  const today = new Date();
  const dateObj = new Date(date);
  return today.toDateString() === dateObj.toDateString();
};

export const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

export const calculateStreak = (lastPlayedDate) => {
  if (!lastPlayedDate) return 0;
  
  const lastDate = dayjs(lastPlayedDate);
  const today = dayjs();
  const diffDays = today.diff(lastDate, 'day');
  
  if (diffDays === 0) return 1; // Played today
  if (diffDays === 1) return 2; // Played yesterday
  return 0; // Streak broken
};

export const getNextMidnight = () => {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return tomorrow;
};

export const timeUntilMidnight = () => {
  const now = new Date();
  const midnight = getNextMidnight();
  return midnight - now;
};

export const secondsToHMS = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};
