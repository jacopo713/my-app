'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Brain, Scale } from 'lucide-react';

interface ShapeProps {
  type: string;
  rotation?: number;
  size?: number;
  color?: string;
  opacity?: number;
  scale?: number;
}

interface Answer extends ShapeProps {
  isCorrect: boolean;
}


const Shape: React.FC<ShapeProps> = ({
  type,
  rotation = 0,
  size = 20,
  color = 'currentColor',
  opacity = 1,
  scale = 1,
}) => {
  const center = size / 2;
  const adjustedSize = size * scale;
  const baseSize = adjustedSize * 0.35;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g transform={`rotate(${rotation}, ${center}, ${center})`} opacity={opacity}>
        {type === 'circle' && (
          <circle cx={center} cy={center} r={baseSize} fill={color} />
        )}
        {type === 'square' && (
          <rect
            x={center - baseSize}
            y={center - baseSize}
            width={baseSize * 2}
            height={baseSize * 2}
            fill={color}
          />
        )}
        {type === 'triangle' && (
          <polygon
            points={`
              ${center},${center - baseSize}
              ${center + baseSize},${center + baseSize}
              ${center - baseSize},${center + baseSize}
            `}
            fill={color}
          />
        )}
        {type === 'diamond' && (
          <polygon
            points={`
              ${center},${center - baseSize}
              ${center + baseSize},${center}
              ${center},${center + baseSize}
              ${center - baseSize},${center}
            `}
            fill={color}
          />
        )}
      </g>
    </svg>
  );
};

function normalizeVisualRotation(shape: string, rotation: number): number {
  switch (shape) {
    case 'circle':
      return 0;
    case 'square':
    case 'diamond':
      return rotation % 90;
    case 'triangle':
      return rotation % 120;
    default:
      return rotation;
  }
}

function areVisuallyIdentical(a: ShapeProps, b: ShapeProps): boolean {
  if (a.type !== b.type) return false;
  if (a.color !== b.color) return false;
  if (a.opacity !== b.opacity) return false;
  if (a.scale !== b.scale) return false;

  const normA = normalizeVisualRotation(a.type, a.rotation ?? 0);
  const normB = normalizeVisualRotation(b.type, b.rotation ?? 0);

  return normA === normB;
}

const RavenTest: React.FC<RavenTestProps> = ({ onComplete }) => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [matrix, setMatrix] = useState<Array<Array<ShapeProps | null>>>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSelected, setIsAnswerSelected] = useState(false);

  // Memorizziamo le configurazioni per evitare warning ESLint
  const config = useMemo(() => ({
    shapes: ['circle', 'square', 'triangle', 'diamond'],
    rotations: [0, 30, 45, 60, 90, 120, 180, 270],
    colors: ['#2563eb', '#dc2626', '#059669', '#6b21a8', '#0f766e'],
    opacities: [1, 0.8, 0.6, 0.4],
    scales: [0.6, 0.8, 1, 1.2],
  }), []);

  const generateMatrix = useCallback(() => {
    const newMatrix = Array(3)
      .fill(null)
      .map(() => Array<ShapeProps | null>(3).fill(null));

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (i === 2 && j === 2) continue;
        newMatrix[i][j] = {
          type: config.shapes[(i + j) % 2],
          rotation: config.rotations[(i * j) % 4],
          color: config.colors[(i + j) % 2],
          opacity: 1,
          scale: 1,
        };
      }
    }
    return newMatrix;
  }, [config]);

  const getCorrectAnswer = useCallback((matrix: Array<Array<ShapeProps | null>>): ShapeProps => {
    return matrix[2][2] ?? {
      type: 'circle',
      rotation: 0,
      color: '#2563eb',
      opacity: 1,
      scale: 1,
    };
  }, []);

  const createRandomAnswer = useCallback((isCorrect: boolean): Answer => {
    return {
      type: config.shapes[Math.floor(Math.random() * config.shapes.length)],
      rotation: config.rotations[Math.floor(Math.random() * config.rotations.length)],
      color: config.colors[Math.floor(Math.random() * config.colors.length)],
      opacity: config.opacities[Math.floor(Math.random() * config.opacities.length)],
      scale: config.scales[Math.floor(Math.random() * config.scales.length)],
      isCorrect,
    };
  }, [config]);

  const generateAnswers = useCallback((correct: ShapeProps): Answer[] => {
    const allAnswers: Answer[] = [{ ...correct, isCorrect: true }];
    let attempts = 0;

    while (allAnswers.length < 6 && attempts < 20) {
      const newAnswer = createRandomAnswer(false);
      newAnswer.rotation = ((newAnswer.rotation ?? 0) + 45) % 360;

      if (allAnswers.some(ans => areVisuallyIdentical(ans, newAnswer))) {
        attempts++;
        continue;
      }
      allAnswers.push(newAnswer);
    }

    const finalAnswers = allAnswers.sort(() => Math.random() - 0.5).slice(0, 4);
    return finalAnswers.sort(() => Math.random() - 0.5);
  }, [createRandomAnswer]);

  const computePercentile = useCallback((finalScore: number): number => {
    const raw = (finalScore / 13) * 100;
    return Math.round(raw);
  }, []);

  useEffect(() => {
    const newMatrix = generateMatrix();
    setMatrix(newMatrix);

    const correct = getCorrectAnswer(newMatrix);
    const fourAnswers = generateAnswers(correct);
    setAnswers(fourAnswers);

    setSelectedAnswer(null);
    setIsAnswerSelected(false);
  }, [level, generateMatrix, getCorrectAnswer, generateAnswers]);

  const handleAnswer = useCallback((index: number) => {
    if (isAnswerSelected) return;
    setSelectedAnswer(index);
    setIsAnswerSelected(true);

    const chosen = answers[index];
    if (chosen.isCorrect) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      if (level < 13) {
        setLevel(l => l + 1);
      } else {
        const finalScore = chosen.isCorrect ? score + 1 : score;
        const percentile = computePercentile(finalScore);
        onComplete({
          score: finalScore,
          accuracy: percentile,
        });
      }
    }, 700);
  }, [isAnswerSelected, answers, level, score, computePercentile, onComplete]);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 bg-white rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <Brain className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold">
            Matrici Progressive - Livello {level}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <Scale className="w-5 h-5 text-blue-600" />
          <div className="space-x-2">
            <span className="font-mono">Livello {level}/13</span>
            <span className="font-mono">Punteggio: {score}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {matrix.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}-${j}`}
              className="w-16 h-16 md:w-24 md:h-24 flex items-center justify-center border border-gray-200 rounded-lg"
            >
              {cell ? (
                <Shape {...cell} size={40} />
              ) : (
                <span className="text-2xl text-gray-400">?</span>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Possibili soluzioni:</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {answers.map((answer, idx) => {
            const isSelected = idx === selectedAnswer;
            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={isAnswerSelected}
                className={`p-4 border rounded-lg flex flex-col items-center justify-center
                  ${
                    isSelected
                      ? answer.isCorrect
                        ? 'bg-green-50 border-green-500'
                        : 'bg-red-50 border-red-500'
                      : 'hover:bg-gray-50'
                  }
                  ${
                    isAnswerSelected && !isSelected
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }
                `}
              >
                <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                  <Shape {...answer} size={40} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};


export interface RavenTestProps {
  onComplete: (results: { score: number; accuracy: number }) => void;
}

export default RavenTest;
