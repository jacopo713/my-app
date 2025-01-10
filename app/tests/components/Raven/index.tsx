import { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';

interface RavenTestProps {
  onComplete: (results: { score: number; accuracy: number }) => void;
}

interface Pattern {
  type: string;
  rotation: number;
  size: number;
  fill: string;
}

interface Question {
  grid: (Pattern | null)[][];  // 2x3 grid
  correctAnswer: Pattern;
  options: Pattern[];  // 4 options
  level: number;
}

const LEVELS = {
  EASY: { shapes: ['circle', 'square'], rotations: [0, 90, 180, 270] },
  MEDIUM: { shapes: ['circle', 'square', 'triangle'], rotations: [0, 90, 180, 270] },
  HARD: { shapes: ['circle', 'square', 'triangle'], rotations: [0, 45, 90, 135, 180, 225, 270, 315] }
};

const generatePattern = (level: number): Pattern => {
  const config = level <= 3 ? LEVELS.EASY : level <= 7 ? LEVELS.MEDIUM : LEVELS.HARD;
  
  return {
    type: config.shapes[Math.floor(Math.random() * config.shapes.length)],
    rotation: config.rotations[Math.floor(Math.random() * config.rotations.length)],
    size: 1,
    fill: '#2563eb'
  };
};

const generateLogicalPattern = (row: number, col: number, level: number): Pattern => {
  const basePattern = generatePattern(level);
  
  // Logica progressiva semplificata come nel test originale
  if (level <= 3) {
    // Pattern semplici: solo rotazione
    basePattern.rotation = (basePattern.rotation + col * 90) % 360;
  } else if (level <= 6) {
    // Pattern medi: rotazione e tipo
    basePattern.rotation = (basePattern.rotation + (row + col) * 90) % 360;
    const shapeIndex = (row + col) % LEVELS.MEDIUM.shapes.length;
    basePattern.type = LEVELS.MEDIUM.shapes[shapeIndex];
  } else {
    // Pattern complessi: rotazioni più sofisticate
    basePattern.rotation = (basePattern.rotation + (row * col * 45)) % 360;
  }
  
  return basePattern;
};

const generateQuestion = (level: number): Question => {
  // Genera una griglia 2x3
  const grid: (Pattern | null)[][] = Array(2).fill(null).map((_, row) => 
    Array(3).fill(null).map((_, col) => {
      if (row === 1 && col === 2) return null; // Spazio per la risposta
      return generateLogicalPattern(row, col, level);
    })
  );

  const correctAnswer = generateLogicalPattern(1, 2, level);
  const options = [correctAnswer];

  // Genera 3 distrattori logici
  for (let i = 0; i < 3; i++) {
    const distractorPattern = {...correctAnswer};
    switch (i) {
      case 0:
        distractorPattern.rotation = (distractorPattern.rotation + 90) % 360;
        break;
      case 1:
        distractorPattern.type = LEVELS.MEDIUM.shapes[
          (LEVELS.MEDIUM.shapes.indexOf(distractorPattern.type) + 1) % LEVELS.MEDIUM.shapes.length
        ];
        break;
      case 2:
        distractorPattern.rotation = (distractorPattern.rotation + 180) % 360;
        break;
    }
    options.push(distractorPattern);
  }

  return {
    grid,
    correctAnswer,
    options: options.sort(() => Math.random() - 0.5),
    level
  };
};

const RavenTest: React.FC<RavenTestProps> = ({ onComplete }) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [question, setQuestion] = useState<Question | null>(null);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    setQuestion(generateQuestion(currentLevel));
  }, [currentLevel]);

  const handleAnswer = (answerIndex: number) => {
    if (showFeedback) return;
    
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);
    
    const isCorrect = question?.options[answerIndex] === question?.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentLevel < 10) {
        setCurrentLevel(prev => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        onComplete({
          score: score + (isCorrect ? 1 : 0),
          accuracy: ((score + (isCorrect ? 1 : 0)) / 10) * 100
        });
      }
    }, 1000);
  };

  if (!question) return null;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold">Matrici di Raven - {currentLevel}/10</h2>
        </div>
        <div className="text-sm text-gray-600">
          Punteggio: {score}/{currentLevel - 1}
        </div>
      </div>

      {/* 2x3 grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {question.grid.map((row, rowIndex) => (
          <div key={rowIndex} className="space-y-4">
            {row.map((pattern, colIndex) => (
              <div key={`${rowIndex}-${colIndex}`}
                   className="w-24 h-24 border border-gray-200 rounded-lg flex items-center justify-center">
                {pattern ? (
                  <PatternShape pattern={pattern} />
                ) : (
                  <span className="text-2xl text-gray-300">?</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* 4 options */}
      <div className="grid grid-cols-2 gap-4">
        {question.options.map((pattern, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            disabled={showFeedback}
            className={`p-4 border-2 rounded-lg transition-all ${
              selectedAnswer === null
                ? 'hover:bg-blue-50 hover:border-blue-500'
                : selectedAnswer === index
                ? showFeedback && pattern === question.correctAnswer
                  ? 'bg-green-50 border-green-500'
                  : 'bg-red-50 border-red-500'
                : 'opacity-50'
            }`}
          >
            <PatternShape pattern={pattern} />
          </button>
        ))}
      </div>
    </div>
  );
};

const PatternShape: React.FC<{ pattern: Pattern }> = ({ pattern }) => {
  const size = 40;
  const centerPoint = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        transform: `rotate(${pattern.rotation}deg)`
      }}
    >
      {pattern.type === 'circle' && (
        <circle
          cx={centerPoint}
          cy={centerPoint}
          r={size / 2.5}
          fill={pattern.fill}
        />
      )}
      {pattern.type === 'square' && (
        <rect
          x={size * 0.2}
          y={size * 0.2}
          width={size * 0.6}
          height={size * 0.6}
          fill={pattern.fill}
        />
      )}
      {pattern.type === 'triangle' && (
        <polygon
          points={`${centerPoint},${size * 0.2} ${size * 0.8},${size * 0.8} ${size * 0.2},${size * 0.8}`}
          fill={pattern.fill}
        />
      )}
    </svg>
  );
};

export default RavenTest;
