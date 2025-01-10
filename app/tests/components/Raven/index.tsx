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
  opacity: number;
}

interface Question {
  grid: Pattern[][];
  correctAnswer: Pattern;
  options: Pattern[];
  level: number;
}

// Configurazione dei livelli di difficoltà
const LEVELS = {
  EASY: { shapes: ['circle', 'square'], rotations: [0, 90, 180, 270] },
  MEDIUM: { shapes: ['circle', 'square', 'triangle'], rotations: [0, 45, 90, 135, 180, 225, 270, 315] },
  HARD: { shapes: ['circle', 'square', 'triangle', 'diamond'], rotations: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] }
};

const generatePattern = (level: number): Pattern => {
  const config = level <= 3 ? LEVELS.EASY : level <= 7 ? LEVELS.MEDIUM : LEVELS.HARD;
  
  return {
    type: config.shapes[Math.floor(Math.random() * config.shapes.length)],
    rotation: config.rotations[Math.floor(Math.random() * config.rotations.length)],
    size: level <= 5 ? 1 : Math.random() * 0.5 + 0.75, // Varia dimensione dopo livello 5
    fill: level <= 4 ? '#2563eb' : ['#2563eb', '#dc2626', '#059669'][Math.floor(Math.random() * 3)], // Varia colore dopo livello 4
    opacity: level <= 6 ? 1 : [1, 0.8, 0.6][Math.floor(Math.random() * 3)] // Varia opacità dopo livello 6
  };
};

const generateLogicalPattern = (row: number, col: number, level: number): Pattern => {
  const basePattern = generatePattern(level);
  
  // Logiche progressive basate sul livello
  if (level <= 3) {
    // Pattern semplici: solo rotazione orizzontale
    basePattern.rotation = (basePattern.rotation + col * 90) % 360;
  } else if (level <= 6) {
    // Pattern medi: rotazione e tipo forme
    basePattern.rotation = (basePattern.rotation + (row + col) * 45) % 360;
    const shapeIndex = (row + col) % LEVELS.MEDIUM.shapes.length;
    basePattern.type = LEVELS.MEDIUM.shapes[shapeIndex];
  } else {
    // Pattern complessi: tutte le proprietà variano
    basePattern.rotation = (basePattern.rotation + (row * col * 30)) % 360;
    basePattern.size = 0.75 + (Math.sin(row + col) * 0.25);
    basePattern.opacity = 0.6 + (Math.cos(row + col) * 0.4);
  }
  
  return basePattern;
};

const generateQuestion = (level: number): Question => {
  const grid: Pattern[][] = Array(3).fill(null).map((_, row) => 
    Array(3).fill(null).map((_, col) => {
      if (row === 2 && col === 2) return null; // Spazio per la risposta
      return generateLogicalPattern(row, col, level);
    })
  );

  // Genera la risposta corretta seguendo la logica del pattern
  const correctAnswer = generateLogicalPattern(2, 2, level);

  // Genera distrattori che sembrano plausibili
  const options = [correctAnswer];
  for (let i = 0; i < 3; i++) {
    const distractorPattern = {...correctAnswer};
    switch (i) {
      case 0:
        distractorPattern.rotation = (distractorPattern.rotation + 45) % 360;
        break;
      case 1:
        distractorPattern.size = distractorPattern.size * 1.25;
        break;
      case 2:
        distractorPattern.opacity = Math.max(0.4, distractorPattern.opacity - 0.2);
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

      <div className="grid grid-cols-3 gap-4 mb-8">
        {question.grid.map((row, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-3 gap-2">
            {row.map((pattern, colIndex) => (
              <div key={`${rowIndex}-${colIndex}`}
                   className="aspect-square border border-gray-200 rounded-lg flex items-center justify-center">
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

      {currentLevel >= 7 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            {currentLevel === 7 && "Pattern avanzati: osserva come variano forme e rotazioni"}
            {currentLevel === 8 && "Pattern avanzati: nota le relazioni tra dimensioni e posizioni"}
            {currentLevel === 9 && "Pattern avanzati: analizza i cambiamenti di opacità e scala"}
            {currentLevel === 10 && "Pattern avanzati: integra tutte le variazioni osservate"}
          </p>
        </div>
      )}
    </div>
  );
};

const PatternShape: React.FC<{ pattern: Pattern }> = ({ pattern }) => {
  const size = 40 * pattern.size;
  const centerPoint = 20;

  return (
    <svg
      width={40}
      height={40}
      viewBox="0 0 40 40"
      style={{
        transform: `rotate(${pattern.rotation}deg)`,
        opacity: pattern.opacity
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
          x={centerPoint - size/2.5}
          y={centerPoint - size/2.5}
          width={size/1.25}
          height={size/1.25}
          fill={pattern.fill}
        />
      )}
      {pattern.type === 'triangle' && (
        <polygon
          points={`
            ${centerPoint},${centerPoint - size/2}
            ${centerPoint + size/2},${centerPoint + size/2}
            ${centerPoint - size/2},${centerPoint + size/2}
          `}
          fill={pattern.fill}
        />
      )}
      {pattern.type === 'diamond' && (
        <polygon
          points={`
            ${centerPoint},${centerPoint - size/2}
            ${centerPoint + size/2},${centerPoint}
            ${centerPoint},${centerPoint + size/2}
            ${centerPoint - size/2},${centerPoint}
          `}
          fill={pattern.fill}
        />
      )}
    </svg>
  );
};

export default RavenTest;
