import CryptoJS from 'crypto-js';

// Puzzle Types
export const PUZZLE_TYPES = {
  SUDOKU: 'sudoku',
  PATTERN: 'pattern',
  SEQUENCE: 'sequence',
  DEDUCTION: 'deduction',
  BINARY: 'binary'
};

// Generate unique puzzle based on date seed
export const generatePuzzleSeed = (date) => {
  const dateStr = date.toISOString().split('T')[0];
  return CryptoJS.SHA256(dateStr).toString();
};

// Get puzzle type for specific date
export const getPuzzleTypeForDate = (date) => {
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const types = Object.values(PUZZLE_TYPES);
  return types[dayOfYear % types.length];
};

// Sudoku Puzzle Generator
export const generateSudokuPuzzle = (seed, size = 9) => {
  // Create a deterministic PRNG from the seed so variants are repeatable per-seed
  const random = mulberry32(hashToNumber(seed + '-' + size));

  // Determine block dimensions for supported sizes
  // For 3x3 we'll use blocks 1x3 (simple), for 6x6 use 2x3, for 9x9 use 3x3
  const sizeMap = {
    3: { r: 1, c: 3 },
    6: { r: 2, c: 3 },
    9: { r: 3, c: 3 }
  };
  const dims = sizeMap[size] || sizeMap[9];
  const N = size;

  // Helpers
  const deepCopy = (g) => g.map(r => r.slice());
  const shuffleArrayInPlace = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Backtracking generator for a full valid Sudoku-like grid
  const generateFullGrid = () => {
    const grid = Array.from({ length: N }, () => Array(N).fill(0));
    const numbers = Array.from({ length: N }, (_, i) => i + 1);

    const isValid = (r, c, val) => {
      for (let i = 0; i < N; i++) if (grid[r][i] === val) return false;
      for (let i = 0; i < N; i++) if (grid[i][c] === val) return false;
      const br = Math.floor(r / dims.r) * dims.r;
      const bc = Math.floor(c / dims.c) * dims.c;
      for (let i = 0; i < dims.r; i++) for (let j = 0; j < dims.c; j++) if (grid[br + i][bc + j] === val) return false;
      return true;
    };

    const positions = [];
    for (let i = 0; i < N * N; i++) positions.push(i);

    const tryFill = (idx = 0) => {
      if (idx >= positions.length) return true;
      const r = Math.floor(positions[idx] / N);
      const c = positions[idx] % N;
      const order = shuffleArrayInPlace(numbers.slice());
      for (const val of order) {
        if (isValid(r, c, val)) {
          grid[r][c] = val;
          if (tryFill(idx + 1)) return true;
          grid[r][c] = 0;
        }
      }
      return false;
    };

    // Shuffle positions to introduce variety
    shuffleArrayInPlace(positions);
    if (!tryFill(0)) return null;
    // Reorder rows/cols back into normal order for nicer puzzles
    return grid;
  };

  // Transpose helper (works for NxN)
  const transpose = (g) => {
    const out = Array.from({ length: N }, () => Array.from({ length: N }, () => 0));
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) out[i][j] = g[j][i];
    return out;
  };

  // Generate full solved grid
  const solved = generateFullGrid();
  if (!solved) {
    // fallback small fixed solution for N=3
    const fallback = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => ((i + j) % N) + 1));
    return { puzzle: fallback, solution: fallback, difficulty: 'easy' };
  }

  // Remove cells to create puzzle
  const totalCells = N * N;
  // removal heuristic: proportion by size
  const baseRemovalPct = size === 9 ? 0.5 : size === 6 ? 0.45 : 0.4;
  const removals = Math.max(1, Math.floor(totalCells * baseRemovalPct));
  const positions = Array.from({ length: totalCells }, (_, i) => i);
  shuffleArrayInPlace(positions);
  const puzzleGrid = deepCopy(solved);
  for (let k = 0; k < removals; k++) {
    const pos = positions[k];
    const r = Math.floor(pos / N);
    const c = pos % N;
    puzzleGrid[r][c] = 0;
  }

  return {
    puzzle: puzzleGrid,
    solution: solved,
    difficulty: size === 9 ? 'medium' : 'easy'
  };
};

// Pattern Matching Generator
export const generatePatternPuzzle = (seed) => {
  const random = mulberry32(hashToNumber(seed));
  
  const patternSize = 5;
  const grid = Array(patternSize).fill(null).map(() => Array(patternSize).fill(0));
  
  // Create a random pattern
  for (let i = 0; i < patternSize; i++) {
    for (let j = 0; j < patternSize; j++) {
      grid[i][j] = random() > 0.5 ? 1 : 0;
    }
  }
  
  // Define rules
  const rules = [
    'Each row must have exactly 3 cells filled',
    'Each column must have exactly 3 cells filled',
    'No two adjacent cells can both be filled'
  ];
  
  return {
    puzzle: Array(patternSize).fill(null).map(() => Array(patternSize).fill(0)),
    solution: grid,
    rules,
    difficulty: 'medium'
  };
};

// Sequence Puzzle Generator
export const generateSequencePuzzle = (seed) => {
  const random = mulberry32(hashToNumber(seed));
  
  const sequence = [];
  let current = Math.floor(random() * 10) + 1;
  const operation = Math.floor(random() * 4);
  
  for (let i = 0; i < 6; i++) {
    sequence.push(current);
    switch (operation) {
      case 0: current += Math.floor(random() * 5) + 1; break;
      case 1: current -= Math.floor(random() * 3) + 1; break;
      case 2: current *= 2; break;
      case 3: current = Math.floor(current / 2); break;
    }
  }
  
  // Hide last 2 numbers
  const visible = sequence.slice(0, 4);
  const hidden = sequence.slice(4);
  
  return {
    visible,
    hidden,
    solution: sequence,
    difficulty: 'medium'
  };
};

// Deduction Puzzle Generator
export const generateDeductionPuzzle = (seed) => {
  const random = mulberry32(hashToNumber(seed));
  
  const entities = ['Alice', 'Bob', 'Charlie', 'Diana'];
  const attributes = {
    color: ['Red', 'Blue', 'Green', 'Yellow'],
    number: [1, 2, 3, 4],
    animal: ['Cat', 'Dog', 'Bird', 'Fish']
  };
  
  // Generate solution
  const solution = entities.map((entity, idx) => ({
    entity,
    color: attributes.color[idx],
    number: attributes.number[idx],
    animal: attributes.animal[idx]
  }));
  
  // Shuffle solution
  shuffleArray(solution, mulberry32(hashToNumber(seed)));
  
  const clues = [
    'Alice\'s number is higher than 2',
    'The cat owner has a red item',
    'Bob\'s animal is not a dog'
  ];
  
  return {
    entities,
    attributes,
    clues,
    solution,
    difficulty: 'hard'
  };
};

// Binary Logic Generator
export const generateBinaryPuzzle = (seed) => {
  const random = mulberry32(hashToNumber(seed));
  
  const grid = Array(6).fill(null).map(() => Array(6).fill(0));
  
  // Fill grid with 0s and 1s
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 6; j++) {
      grid[i][j] = random() > 0.5 ? 1 : 0;
    }
  }
  
  // Create puzzle by removing numbers
  const puzzle = Array(6).fill(null).map(() => Array(6).fill(-1));
  let filled = 0;
  
  while (filled < 18) {
    const row = Math.floor(random() * 6);
    const col = Math.floor(random() * 6);
    if (puzzle[row][col] === -1) {
      puzzle[row][col] = grid[row][col];
      filled++;
    }
  }
  
  return {
    puzzle,
    solution: grid,
    rules: [
      'Fill with 0s and 1s',
      'No more than 2 consecutive same numbers',
      'Equal number of 0s and 1s per row/column'
    ],
    difficulty: 'medium'
  };
};

// Validate Sudoku Solution
export const validateSudoku = (solution) => {
  // Check rows
  for (let row = 0; row < 9; row++) {
    const seen = new Set();
    for (let col = 0; col < 9; col++) {
      const num = solution[row][col];
      if (num === 0 || seen.has(num)) return false;
      seen.add(num);
    }
  }
  
  // Check columns
  for (let col = 0; col < 9; col++) {
    const seen = new Set();
    for (let row = 0; row < 9; row++) {
      const num = solution[row][col];
      if (num === 0 || seen.has(num)) return false;
      seen.add(num);
    }
  }
  
  // Check 3x3 boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const seen = new Set();
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const num = solution[boxRow * 3 + i][boxCol * 3 + j];
          if (num === 0 || seen.has(num)) return false;
          seen.add(num);
        }
      }
    }
  }
  
  return true;
};

// Helper functions
const mulberry32 = (a) => {
  return function() {
    a |= 0; a = a + 0x6d2b79f5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
};

const hashToNumber = (hash) => {
  return parseInt(hash.substring(0, 8), 16);
};

const shuffleArray = (array, random) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const solveSudoku = (grid) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudoku(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
};

const isValidPlacement = (grid, row, col, num) => {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === num) return false;
  }
  
  // Check column
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) return false;
  }
  
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  
  return true;
};

// Main puzzle factory
export const generatePuzzle = (date = new Date(), options = {}) => {
  // options: { randomize: boolean }
  const randomize = !!options.randomize;
  const seed = randomize ? CryptoJS.SHA256(date.toISOString() + Math.random().toString()).toString() : generatePuzzleSeed(date);
  
  // Always show available types
  const allTypes = Object.values(PUZZLE_TYPES);
  console.log('%c📋 Available puzzle types:', 'color: blue', allTypes);
  
  const type = randomize ? (allTypes[Math.floor(Math.random() * allTypes.length)]) : getPuzzleTypeForDate(date);
  
  console.log(`%c🎲 Puzzle factory selected type: ${type} (20% chance of each type)`, 'color: blue; font-weight: bold');
  console.log(`%c💡 Note: Puzzle selected randomly. Sudoku is 1 in 5 chance. Click "New Game" to retry if needed.`, 'color: #FF9800');
  
  let puzzle;
  let selectedType = type;

  try {
    switch (type) {
      case PUZZLE_TYPES.SUDOKU:
        console.log('%c🎯 Generating SUDOKU puzzle...', 'color: green; font-weight: bold');
        puzzle = generateSudokuPuzzle(seed);
        selectedType = PUZZLE_TYPES.SUDOKU;
        break;
      case PUZZLE_TYPES.PATTERN:
        console.log('Generating PATTERN puzzle...');
        puzzle = generatePatternPuzzle(seed);
        selectedType = PUZZLE_TYPES.PATTERN;
        break;
      case PUZZLE_TYPES.SEQUENCE:
        console.log('Generating SEQUENCE puzzle...');
        puzzle = generateSequencePuzzle(seed);
        selectedType = PUZZLE_TYPES.SEQUENCE;
        break;
      case PUZZLE_TYPES.DEDUCTION:
        console.log('Generating DEDUCTION puzzle...');
        puzzle = generateDeductionPuzzle(seed);
        selectedType = PUZZLE_TYPES.DEDUCTION;
        break;
      case PUZZLE_TYPES.BINARY:
        console.log('Generating BINARY puzzle...');
        puzzle = generateBinaryPuzzle(seed);
        selectedType = PUZZLE_TYPES.BINARY;
        break;
      default:
        console.log('Unknown type, defaulting to SUDOKU puzzle...');
        puzzle = generateSudokuPuzzle(seed);
        selectedType = PUZZLE_TYPES.SUDOKU;
    }

    if (!puzzle) {
      throw new Error(`Puzzle generation returned null/undefined for type: ${type}`);
    }

    console.log(`%c✅ ${type.toUpperCase()} puzzle returned from factory:`, 'color: green', puzzle);

    const result = {
      ...puzzle,
      type: selectedType,
      date: date.toISOString().split('T')[0],
      id: seed.substring(0, 8),
      randomized: randomize
    };

    console.log('%c✅ Final puzzle object:', 'color: green', result);
    return result;
  } catch (error) {
    console.error(`%c❌ Error in puzzle generation (${type}):`, 'color: red', error);
    console.error('Stack trace:', error.stack);
    // Fallback to Sudoku
    console.log('%c⚠️ Falling back to SUDOKU puzzle...', 'color: orange');
    try {
      const fallbackPuzzle = generateSudokuPuzzle(seed);
      return {
        ...fallbackPuzzle,
        type: PUZZLE_TYPES.SUDOKU,
        date: date.toISOString().split('T')[0],
        id: seed.substring(0, 8),
        randomized: randomize,
        error: `Failed to generate ${type}, fell back to Sudoku: ${error.message}`
      };
    } catch (fallbackError) {
      console.error('%c❌ Fallback failed:', 'color: red', fallbackError);
      throw new Error(`Failed to generate puzzle: ${error.message}`);
    }
  }
};
