/**
 * Local Procedural Challenge Engine
 * Generates dynamic math, memory, and logic puzzles on-device
 * when the device is offline or network session creation fails.
 */

export function generateLocalChallenge(category = 'math', difficulty = 'medium') {
  const normalizedCategory = (category || 'math').toLowerCase();

  switch (normalizedCategory) {
    case 'math':
      return generateMathPuzzle(difficulty);
    case 'logic':
      return generateLogicPuzzle(difficulty);
    case 'riddle':
      return generateRiddlePuzzle(difficulty);
    case 'memory':
    default:
      return generateMemoryPuzzle(difficulty);
  }
}

function generateMathPuzzle(difficulty) {
  let num1, num2, num3, answer, prompt;
  
  if (difficulty === 'beginner' || difficulty === 'easy') {
    num1 = Math.floor(Math.random() * 20) + 10;
    num2 = Math.floor(Math.random() * 20) + 5;
    answer = num1 + num2;
    prompt = `What is ${num1} + ${num2}?`;
  } else if (difficulty === 'hard' || difficulty === 'expert') {
    num1 = Math.floor(Math.random() * 15) + 5;
    num2 = Math.floor(Math.random() * 10) + 2;
    num3 = Math.floor(Math.random() * 30) + 10;
    answer = num1 * num2 + num3;
    prompt = `What is (${num1} × ${num2}) + ${num3}?`;
  } else {
    // Medium (default)
    num1 = Math.floor(Math.random() * 12) + 6;
    num2 = Math.floor(Math.random() * 8) + 3;
    answer = num1 * num2;
    prompt = `What is ${num1} × ${num2}?`;
  }

  return {
    id: `local-math-${Date.now()}`,
    title: 'Offline Math Challenge',
    category: 'math',
    difficulty: difficulty || 'medium',
    prompt,
    correct_answer: String(answer),
    hints: ['Double check your multiplication/addition.'],
    is_local: true,
  };
}

function generateLogicPuzzle(difficulty) {
  const puzzles = [
    {
      prompt: 'If ALL BLOOPS ARE FOOS, and ALL FOOS ARE LAAS, are ALL BLOOPS LAAS?',
      answer: 'YES',
      hint: 'Think of nested circles (Bloops inside Foos inside Laas).',
    },
    {
      prompt: 'What comes next in the sequence: 2, 4, 8, 16, __?',
      answer: '32',
      hint: 'Each number doubles the previous one.',
    },
    {
      prompt: 'Which number is odd: 12, 24, 37, 48, 60?',
      answer: '37',
      hint: 'Check division by 2.',
    },
  ];

  const puzzle = puzzles[Math.floor(Math.random() * puzzles.length)];
  return {
    id: `local-logic-${Date.now()}`,
    title: 'Offline Logic Challenge',
    category: 'logic',
    difficulty: difficulty || 'medium',
    prompt: puzzle.prompt,
    correct_answer: puzzle.answer,
    hints: [puzzle.hint],
    is_local: true,
  };
}

function generateRiddlePuzzle(difficulty) {
  const riddles = [
    {
      prompt: 'The more of this there is, the less you see. What is it?',
      answer: 'DARKNESS',
      hint: 'It occurs when light goes away.',
    },
    {
      prompt: 'What has to be broken before you can use it?',
      answer: 'EGG',
      hint: 'You crack it for breakfast.',
    },
    {
      prompt: 'What gets wetter as it dries?',
      answer: 'TOWEL',
      hint: 'You use it after a shower.',
    },
  ];

  const riddle = riddles[Math.floor(Math.random() * riddles.length)];
  return {
    id: `local-riddle-${Date.now()}`,
    title: 'Offline Riddle Challenge',
    category: 'riddle',
    difficulty: difficulty || 'medium',
    prompt: riddle.prompt,
    correct_answer: riddle.answer,
    hints: [riddle.hint],
    is_local: true,
  };
}

function generateMemoryPuzzle(difficulty) {
  const sequenceLength = difficulty === 'hard' ? 5 : 4;
  const digits = Array.from({ length: sequenceLength }, () => Math.floor(Math.random() * 9) + 1);
  const sequenceStr = digits.join(' ');
  const answer = digits.join('');

  return {
    id: `local-memory-${Date.now()}`,
    title: 'Offline Memory Challenge',
    category: 'memory',
    difficulty: difficulty || 'medium',
    prompt: `Memorize this code: [ ${sequenceStr} ]. Enter the digits without spaces:`,
    correct_answer: answer,
    hints: ['Enter numbers directly in sequence.'],
    is_local: true,
  };
}
