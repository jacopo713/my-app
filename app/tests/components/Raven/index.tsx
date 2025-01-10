'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Scale } from 'lucide-react';

/** ------------------------
 * 1) CONFIG E TIPI GLOBALI
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

interface RavenTestProps {
  onComplete: (results: { score: number; accuracy: number }) => void;
}

interface Complexity {
  shapes: number;
  rotations: number;
  colors: number;
  opacities: number;
  scales: number;
}

// Matrice di complessità per i 13 livelli
const complexityMatrix: Record<number, Complexity> = {
  1: { shapes: 2, rotations: 1, colors: 1, opacities: 1, scales: 1 },
  2: { shapes: 2, rotations: 2, colors: 1, opacities: 1, scales: 1 },
  3: { shapes: 3, rotations: 2, colors: 2, opacities: 1, scales: 1 },
  4: { shapes: 3, rotations: 4, colors: 2, opacities: 1, scales: 1 },
  5: { shapes: 3, rotations: 4, colors: 3, opacities: 1, scales: 1 },
  6: { shapes: 4, rotations: 4, colors: 3, opacities: 2, scales: 1 },
  7: { shapes: 4, rotations: 6, colors: 3, opacities: 2, scales: 2 },
  8: { shapes: 4, rotations: 8, colors: 4, opacities: 3, scales: 2 },
  9: { shapes: 4, rotations: 8, colors: 4, opacities: 4, scales: 3 },
  10: { shapes: 4, rotations: 10, colors: 4, opacities: 4, scales: 3 },
  11: { shapes: 4, rotations: 12, colors: 5, opacities: 6, scales: 4 },
  12: { shapes: 4, rotations: 13, colors: 6, opacities: 7, scales: 5 },
  13: { shapes: 4, rotations: 14, colors: 6, opacities: 8, scales: 6 },
};

// Config “globale” per le forme
const systemConfig = {
  shapes: ['circle', 'square', 'triangle', 'diamond'],
  rotations: [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 240, 270, 300, 330],
  colors: ['#2563eb', '#dc2626', '#059669', '#7c2d12', '#6b21a8', '#0f766e'],
  opacities: [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3],
  scales: [0.6, 0.8, 1, 1.2, 1.4, 1.6],
};

/** ------------------------
 * 2) FUNZIONI GLOBALI
 * ------------------------**/

// a) Shape e rotazione “visiva”
function normalizeVisualRotation(shape: string, rotation: number): number {
  switch (shape) {
    case 'circle':
      return 0; // ruotare un cerchio non cambia l’aspetto
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

// b) Crea un singolo Answer random
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

// c) Genera la matrice 3x3 (lasciando [2,2] vuota se vuoi)
function generatePattern(level: number): Array<Array<ShapeProps | null>> {
  const c = complexityMatrix[level];
  const newMatrix = Array(3)
    .fill(null)
    .map(() => Array<ShapeProps | null>(3).fill(null));

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (i === 2 && j === 2) continue; // ultima cella ? 
      if (level <= 10) {
        newMatrix[i][j] = {
          type: systemConfig.shapes[(i * 2 + j) % c.shapes],
          rotation: systemConfig.rotations[((i + j) * 2) % c.rotations],
          color: systemConfig.colors[(i + j) % c.colors],
          opacity: level >= 6 ? systemConfig.opacities[(i + j) % c.opacities] : 1,
          scale: level >= 7 ? systemConfig.scales[(i * j) % c.scales] : 1,
        };
      } else {
        // Livelli > 10, aggiungiamo variazioni “complesse”
        const base = {
          type: systemConfig.shapes[(i + j) % c.shapes],
          rotation: systemConfig.rotations[(i * j + level * 3) % c.rotations],
          color: systemConfig.colors[(i * 3 + j + level) % c.colors],
          opacity: level >= 12 ? systemConfig.opacities[(i + j) % c.opacities] : 1,
          scale: level === 13 ? systemConfig.scales[(i * j) % c.scales] : 1,
        };
        newMatrix[i][j] = base;
      }
    }
  }
  return newMatrix;
}

// d) Trova la “risposta corretta” (di default la cella [2,2] se è null)
function getCorrectAnswer(matrix: Array<Array<ShapeProps | null>>, level: number): ShapeProps {
  const c = complexityMatrix[level];
  // Se [2,2] è null, la consideriamo “da completare”
  if (!matrix[2][2]) {
    return {
      type: systemConfig.shapes[(2 * 2) % c.shapes],
      rotation: systemConfig.rotations[((2 + 2) * 2) % c.rotations],
      color: systemConfig.colors[(2 + 2) % c.colors],
      opacity: level >= 6 ? systemConfig.opacities[(2 + 2) % c.opacities] : 1,
      scale: level >= 7 ? systemConfig.scales[(2 * 2) % c.scales] : 1,
    };
  }
  // Altrimenti, [2,2] era già impostata
  return matrix[2][2] as ShapeProps;
}

// e) Genera le 4 risposte (1 corretta + 3 distrattori)
function generateAnswers(correct: ShapeProps, level: number): Answer[] {
  const c = complexityMatrix[level];
  const allAnswers: Answer[] = [
    { ...correct, isCorrect: true },
  ];

  let attempts = 0;
  while (allAnswers.length < 6 && attempts < 20) {
    const newAnswer = createRandomAnswer(
      systemConfig.shapes,
      systemConfig.rotations,
      systemConfig.colors,
      systemConfig.opacities,
      systemConfig.scales,
      false
    );

    // Piccola variazione se livello <= 10
    if (level <= 10) {
      newAnswer.rotation = ((newAnswer.rotation ?? 0) + 45) % 360;
      newAnswer.color =
        systemConfig.colors[
          (systemConfig.colors.indexOf(newAnswer.color!) + 1) % c.colors
        ];
    }

    // Evita duplicati visivi
    if (allAnswers.some(ans => areVisuallyIdentical(ans, newAnswer))) {
      attempts++;
      continue;
    }
    allAnswers.push(newAnswer);
  }

  // Teniamo le prime 4 (1 corretta + 3 distrattori)
  const finalAnswers = allAnswers
    .sort(() => Math.random() - 0.5)
    .slice(0, 4);
  
  // Shuffle finale
  return finalAnswers.sort(() => Math.random() - 0.5);
}

/** ------------------------
 * 3) SHAPE COMPONENT (UI)
 * ------------------------**/
const ShapeComponent: React.FC<ShapeProps> = ({
  type,
  rotation = 0,
  size = 20,
  color = 'currentColor',
  opacity = 1,
  scale = 1,
}) => {
  // Stesso identico shape dell’originale
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
 * 4) COMPONENTE PRINCIPALE
 * ------------------------**/
const RavenTest: React.FC<RavenTestProps> = ({ onComplete }) => {
  const [level, setLevel] = useState(1);
  const [matrix, setMatrix] = useState<Array<Array<ShapeProps | null>>>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswerSelected, setIsAnswerSelected] = useState(false);

  // Effetto che si triggera solo quando "level" cambia
  useEffect(() => {
    // 1. Genera la matrice 3x3 per questo livello
    const newMatrix = generatePattern(level);
    setMatrix(newMatrix);

    // 2. Trova la risposta corretta
    const correct = getCorrectAnswer(newMatrix, level);
    // 3. Genera le 4 risposte finali
    const fourAnswers = generateAnswers(correct, level);
    setAnswers(fourAnswers);

    // 4. Reset selezione per questo step
    setSelectedAnswer(null);
    setIsAnswerSelected(false);

    // IMPORTANTE: Nessun'altra dipendenza, così le soluzioni non cambiano
  }, [level]);

  function handleAnswer(idx: number) {
    if (isAnswerSelected) return;
    setSelectedAnswer(idx);
    setIsAnswerSelected(true);

    const isCorrect = answers[idx].isCorrect;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // Passa al livello successivo o conclude
    setTimeout(() => {
      if (level < 13) {
        setLevel(prev => prev + 1);
      } else {
        const finalScore = score + (isCorrect ? 1 : 0);
        onComplete({
          score: finalScore,
          accuracy: finalScore / 13,
        });
      }
    }, 800);
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
                <ShapeComponent {...cell} size={40} />
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
            const selected = idx === selectedAnswer;
            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={isAnswerSelected}
                className={`p-4 border rounded-lg flex flex-col items-center justify-center
                  ${
                    selected
                      ? answer.isCorrect
                        ? 'bg-green-50 border-green-500'
                        : 'bg-red-50 border-red-500'
                      : 'hover:bg-gray-50'
                  }
                  ${
                    isAnswerSelected && !selected
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }
                `}
              >
                <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                  <ShapeComponent {...answer} size={40} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Extra Info per i livelli alti */}
      {level > 10 && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
          <p className="text-sm text-purple-800 font-medium">
            Livello Avanzato {level - 10}/3
          </p>
        </div>
      )}
    </div>
  );
};

export default RavenTest;

