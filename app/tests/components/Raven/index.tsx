'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Scale } from 'lucide-react';

/** ------------------------
 *  TIPI E INTERFACCE
 * ------------------------**/
interface ShapeProps {
  type: string; // 'circle' | 'square' | 'triangle' | 'diamond'
  rotation?: number;
  size?: number;
  color?: string;
  opacity?: number;
  scale?: number;
}

interface Answer extends ShapeProps {
  isCorrect: boolean;
}

interface RavenTestResults {
  score: number;      // ad es. 9
  accuracy: number;   // es. 69 (int %)
}

interface RavenTestProps {
  onComplete: (results: RavenTestResults) => void;
}

/** ------------------------
 *  SHAPE COMPONENT
 * ------------------------**/
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

/** ------------------------
 *  FUNZIONI DI UTILITÀ
 * ------------------------**/

// Rotazione visiva (un cerchio ruotato appare lo stesso)
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

// Controllo se due shape sono "visivamente identiche"
function areVisuallyIdentical(a: ShapeProps, b: ShapeProps): boolean {
  if (a.type !== b.type) return false;
  if (a.color !== b.color) return false;
  if (a.opacity !== b.opacity) return false;
  if (a.scale !== b.scale) return false;

  const normA = normalizeVisualRotation(a.type, a.rotation ?? 0);
  const normB = normalizeVisualRotation(b.type, b.rotation ?? 0);

  return normA === normB;
}

// Creiamo una singola "Answer" random
function createRandomAnswer(
  shapes: string[],
  rotations: number[],
  colors: string[],
  opacities: number[],
  scales: number[],
  isCorrect: boolean
): Answer {
  return {
    type: shapes[Math.floor(Math.random() * shapes.length)],
    rotation: rotations[Math.floor(Math.random() * rotations.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
    opacity: opacities[Math.floor(Math.random() * opacities.length)],
    scale: scales[Math.floor(Math.random() * scales.length)],
    isCorrect,
  };
}

/** ------------------------
 *  RAVEN TEST COMPONENT
 * ------------------------**/
/**
 * Esempio semplificato con 13 livelli, ognuno con 3x3, ultima cella "?" e 4 possibili risposte.
 * Punteggio finale = #risposte corrette. Calcolo percentile lineare => (score/13)*100.
 */
const RavenTest: React.FC<RavenTestProps> = ({ onComplete }) => {
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);

  const [matrix, setMatrix] = useState<Array<Array<ShapeProps | null>>>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSelected, setIsAnswerSelected] = useState(false);

  // Config semplificata (forme, rotazioni, etc.)
  const shapes = ['circle', 'square', 'triangle', 'diamond'];
  const rotations = [0, 30, 45, 60, 90, 120, 180, 270];
  const colors = ['#2563eb', '#dc2626', '#059669', '#6b21a8', '#0f766e'];
  const opacities = [1, 0.8, 0.6, 0.4];
  const scales = [0.6, 0.8, 1, 1.2];

  // Genera la matrice 3x3 con ultima cella nulla
  function generateMatrix(level: number) {
    const newMatrix = Array(3)
      .fill(null)
      .map(() => Array<ShapeProps | null>(3).fill(null));

    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (i === 2 && j === 2) continue; // lascia "?"
        // Un pattern semplice (es. shape=shapes[(i+j) % 2]) e via
        newMatrix[i][j] = {
          type: shapes[(i + j) % 2],
          rotation: rotations[(i * j) % 4], // meno rotazioni
          color: colors[(i + j) % 2],       // 2 colori
          opacity: 1,
          scale: 1,
        };
      }
    }
    return newMatrix;
  }

  // Trova la shape corretta x [2,2]
  function getCorrectAnswer(matrix: Array<Array<ShapeProps | null>>): ShapeProps {
    // Se [2,2] è vuota => costruiamo una forma coerente
    return matrix[2][2] ?? {
      type: 'circle',
      rotation: 0,
      color: '#2563eb',
      opacity: 1,
      scale: 1,
    };
  }

  // Genera 1 corretta + 3 distrattori
  function generateAnswers(correct: ShapeProps): Answer[] {
    const allAnswers: Answer[] = [{ ...correct, isCorrect: true }];
    let attempts = 0;

    while (allAnswers.length < 6 && attempts < 20) {
      const newAnswer = createRandomAnswer(shapes, rotations, colors, opacities, scales, false);

      // Minimizza differenze
      newAnswer.rotation = ((newAnswer.rotation ?? 0) + 45) % 360;

      if (allAnswers.some(ans => areVisuallyIdentical(ans, newAnswer))) {
        attempts++;
        continue;
      }
      allAnswers.push(newAnswer);
    }

    // Scelta 4 finali
    const finalAnswers = allAnswers.sort(() => Math.random() - 0.5).slice(0, 4);
    return finalAnswers.sort(() => Math.random() - 0.5);
  }

  // Calcolo percentile lineare
  function computePercentile(finalScore: number): number {
    const raw = (finalScore / 13) * 100;    // es. 9/13 => 69.23
    return Math.round(raw);                // 69
  }

  // Ad ogni cambio di livello => rigenera
  useEffect(() => {
    const newMatrix = generateMatrix(level);
    setMatrix(newMatrix);

    const correct = getCorrectAnswer(newMatrix);
    const fourAnswers = generateAnswers(correct);
    setAnswers(fourAnswers);

    setSelectedAnswer(null);
    setIsAnswerSelected(false);
  }, [level]);

  function handleAnswer(index: number) {
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
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 bg-white rounded-xl shadow-lg">
      {/* HEADER */}
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

      {/* GRIGLIA 3x3 */}
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

      {/* 4 RISPOSTE */}
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

/** ------------------------
 *  COMPONENTE RISULTATI
 * ------------------------**/
function ResultsTest({ results }: { results: { score: number; accuracy: number } }) {
  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold mb-4">Risultati del Test</h2>
      <p className="mb-2">Punteggio: {results.score}</p>
      <p className="mb-2">Precisione: {results.accuracy}%</p>
      {/* Nessuna traccia di "1°" */}
    </div>
  );
}

/** ------------------------
 *  PAGINA CHE USA RavenTest
 * ------------------------**/
export default function TestPage() {
  const [testResults, setTestResults] = useState<RavenTestResults | null>(null);

  return (
    <div className="p-4">
      {!testResults ? (
        <RavenTest onComplete={(res) => setTestResults(res)} />
      ) : (
        <ResultsTest results={testResults} />
      )}
    </div>
  );
}

