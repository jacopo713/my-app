// app/tests/components/Raven/index.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Brain } from 'lucide-react';

interface RavenTestProps {
  onComplete: (results: { score: number; accuracy: number }) => void;
}

interface Pattern {
  type: 'circle' | 'square' | 'triangle';
  rotation: number;
  size: number;
}

interface Question {
  patterns: Pattern[][];
  correctAnswer: number;
  options: Pattern[];
}

const TOTAL_QUESTIONS = 10;

const RavenTest = ({ onComplete }: RavenTestProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const generatePattern = useCallback((): Pattern => {
    const types: Pattern['type'][] = ['circle', 'square', 'triangle'];
    return {
      type: types[Math.floor(Math.random() * types.length)],
      rotation: Math.floor(Math.random() * 4) * 90,
      size: Math.floor(Math.random() * 2) + 1
    };
  }, []);

  useEffect(() => {
    const newQuestions: Question[] = Array(TOTAL_QUESTIONS).fill(null).map(() => {
      const basePattern = generatePattern();
      const patterns: Pattern[][] = Array(3).fill(null).map(() => 
        Array(3).fill(null).map(() => ({
          ...basePattern,
          rotation: (basePattern.rotation + Math.floor(Math.random() * 4) * 90) % 360
        }))
      );

      const correctAnswer = patterns[2][2];
      const options = [
        correctAnswer,
        ...Array(3).fill(null).map(generatePattern)
      ];

      return {
        patterns,
        correctAnswer: 0,
        options: options.sort(() => Math.random() - 0.5)
      };
    });

    setQuestions(newQuestions);
  }, [generatePattern]);

  const handleAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    setShowFeedback(true);

    if (answerIndex === questions[currentQuestion].correctAnswer) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentQuestion < TOTAL_QUESTIONS - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowFeedback(false);
      } else {
        onComplete({
          score: Math.round((score / TOTAL_QUESTIONS) * 1000),
          accuracy: (score / TOTAL_QUESTIONS) * 100
        });
      }
    }, 1000);
  };

  if (questions.length === 0) return null;

  const currentQ = questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold">Matrici di Raven - {currentQuestion + 1}/{TOTAL_QUESTIONS}</h2>
        </div>
        <div className="text-sm text-gray-600">
          Punteggio: {score}/{currentQuestion}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {currentQ.patterns.map((row, i) => (
          <div key={i} className="grid grid-cols-3 gap-2">
            {row.map((pattern, j) => (
              <div
                key={`${i}-${j}`}
                className="aspect-square border border-gray-200 rounded-lg flex items-center justify-center"
              >
                {i === 2 && j === 2 ? (
                  <span className="text-2xl text-gray-300">?</span>
                ) : (
                  <PatternShape pattern={pattern} />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {currentQ.options.map((pattern, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index)}
            disabled={selectedAnswer !== null}
            className={`p-4 border-2 rounded-lg transition-all ${
              selectedAnswer === null
                ? 'hover:bg-blue-50 hover:border-blue-500'
                : selectedAnswer === index
                ? showFeedback && index === currentQ.correctAnswer
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
}

const PatternShape = ({ pattern }: { pattern: Pattern }) => {
  const size = pattern.size * 20;
  const centerPoint = size / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="transform transition-transform"
      style={{ transform: `rotate(${pattern.rotation}deg)` }}
    >
      {pattern.type === 'circle' && (
        <circle
          cx={centerPoint}
          cy={centerPoint}
          r={size * 0.4}
          className="fill-blue-500"
        />
      )}
      {pattern.type === 'square' && (
        <rect
          x={size * 0.1}
          y={size * 0.1}
          width={size * 0.8}
          height={size * 0.8}
          className="fill-blue-500"
        />
      )}
      {pattern.type === 'triangle' && (
        <polygon
          points={`${centerPoint},${size * 0.1} ${size * 0.9},${size * 0.9} ${size * 0.1},${size * 0.9}`}
          className="fill-blue-500"
        />
      )}
    </svg>
  );
};

export default RavenTest;
