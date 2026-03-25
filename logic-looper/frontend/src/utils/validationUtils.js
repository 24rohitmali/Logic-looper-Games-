import { validateSudoku } from '../utils/puzzleGenerator.js';

// Sudoku validation
export const validateSudokuSolution = (userSolution, correctSolution) => {
  if (!validateSudoku(userSolution)) {
    return { valid: false, message: 'Invalid Sudoku solution' };
  }
  
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (userSolution[i][j] !== correctSolution[i][j]) {
        return { valid: false, message: 'Solution does not match' };
      }
    }
  }
  
  return { valid: true, message: 'Correct!' };
};

// Pattern puzzle validation
export const validatePatternSolution = (userSolution, correctSolution) => {
  if (!userSolution || !correctSolution) {
    return { valid: false, message: 'Missing solution data' };
  }

  // Compare each cell
  for (let i = 0; i < userSolution.length; i++) {
    for (let j = 0; j < userSolution[i].length; j++) {
      if (userSolution[i][j] !== correctSolution[i][j]) {
        return { valid: false, message: `Pattern mismatch at row ${i + 1}, column ${j + 1}` };
      }
    }
  }
  
  return { valid: true, message: 'Correct pattern!' };
};

// Sequence puzzle validation
export const validateSequenceSolution = (userAnswer, correctSequence) => {
  if (!userAnswer || !correctSequence) {
    return { valid: false, message: 'Missing sequence data' };
  }

  // User answer can be an array of numbers or single number
  if (Array.isArray(userAnswer)) {
    for (let i = 0; i < userAnswer.length; i++) {
      if (userAnswer[i] !== correctSequence[i]) {
        return { valid: false, message: `Wrong number at position ${i + 1}` };
      }
    }
  } else {
    // Single answer - check if it matches the last element
    if (userAnswer !== correctSequence[correctSequence.length - 1]) {
      return { valid: false, message: 'Incorrect sequence answer' };
    }
  }
  
  return { valid: true, message: 'Correct sequence!' };
};

// Deduction puzzle validation
export const validateDeductionSolution = (userSolution, correctSolution) => {
  if (!userSolution || !correctSolution) {
    return { valid: false, message: 'Missing deduction data' };
  }

  // Validate each entity's attributes
  for (let i = 0; i < correctSolution.length; i++) {
    const correct = correctSolution[i];
    const user = userSolution.find(u => u.entity === correct.entity);
    
    if (!user) {
      return { valid: false, message: `Missing solution for ${correct.entity}` };
    }

    if (user.color !== correct.color || 
        user.number !== correct.number || 
        user.animal !== correct.animal) {
      return { valid: false, message: `Incorrect solution for ${correct.entity}` };
    }
  }
  
  return { valid: true, message: 'Correct deduction!' };
};

// Binary puzzle validation
export const validateBinarySolution = (userSolution, correctSolution) => {
  if (!userSolution || !correctSolution) {
    return { valid: false, message: 'Missing binary solution data' };
  }

  // Compare each cell
  for (let i = 0; i < userSolution.length; i++) {
    for (let j = 0; j < userSolution[i].length; j++) {
      if (userSolution[i][j] !== correctSolution[i][j]) {
        return { valid: false, message: `Wrong value at row ${i + 1}, column ${j + 1}` };
      }
    }
  }

  // Validate binary rules: no more than 2 consecutive same numbers
  for (let i = 0; i < userSolution.length; i++) {
    // Check row
    let consecutive = 1;
    for (let j = 1; j < userSolution[i].length; j++) {
      if (userSolution[i][j] === userSolution[i][j - 1]) {
        consecutive++;
        if (consecutive > 2) {
          return { valid: false, message: `Row ${i + 1} has more than 2 consecutive same numbers` };
        }
      } else {
        consecutive = 1;
      }
    }
  }

  // Check columns
  for (let j = 0; j < userSolution[0].length; j++) {
    let consecutive = 1;
    for (let i = 1; i < userSolution.length; i++) {
      if (userSolution[i][j] === userSolution[i - 1][j]) {
        consecutive++;
        if (consecutive > 2) {
          return { valid: false, message: `Column ${j + 1} has more than 2 consecutive same numbers` };
        }
      } else {
        consecutive = 1;
      }
    }
  }
  
  return { valid: true, message: 'Correct binary solution!' };
};

// Universal puzzle validator - dispatches to correct validator based on puzzle type
export const validatePuzzleSolution = (puzzleType, userSolution, correctSolution) => {
  switch (puzzleType) {
    case 'sudoku':
      return validateSudokuSolution(userSolution, correctSolution);
    case 'pattern':
      return validatePatternSolution(userSolution, correctSolution);
    case 'sequence':
      return validateSequenceSolution(userSolution, correctSolution);
    case 'deduction':
      return validateDeductionSolution(userSolution, correctSolution);
    case 'binary':
      return validateBinarySolution(userSolution, correctSolution);
    default:
      return { valid: false, message: `Unknown puzzle type: ${puzzleType}` };
  }
};

export const calculateScore = (timeSeconds, difficulty, hintUsed) => {
  let baseScore = 100;
  
  // Apply difficulty multiplier
  const difficultyMultiplier = {
    easy: 1.0,
    medium: 1.5,
    hard: 2.0
  };
  
  baseScore *= difficultyMultiplier[difficulty] || 1.5;
  
  // Speed bonus (solve in under 5 minutes)
  if (timeSeconds < 300) {
    baseScore += 50;
  }
  
  // Hint penalty
  if (hintUsed) {
    baseScore *= 0.8;
  }
  
  return Math.round(baseScore);
};

export const calculateStreakStatus = (lastPlayedDate) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (!lastPlayedDate) return { active: false, days: 0 };
  
  const lastDate = new Date(lastPlayedDate);
  
  if (lastDate.toDateString() === today.toDateString()) {
    return { active: true, days: 1 };
  }
  
  if (lastDate.toDateString() === yesterday.toDateString()) {
    return { active: true, days: 2 };
  }
  
  return { active: false, days: 0 };
};
