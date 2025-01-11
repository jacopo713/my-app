'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Eye, Scale } from 'lucide-react'; // Importa le icone qui

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

export interface RavenTestProps {
  onComplete: (results: { score: number; accuracy: number }) => void;
}

// ... (resto del codice rimane invariato)

const RavenTest: React.FC<RavenTestProps> = ({ onComplete }) => {
  const [level, setLevel] = useState(1);
  const [matrix, setMatrix] = useState<Array<Array<ShapeProps | null>>>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isAnswerSelected, setIsAnswerSelected] = useState(false);

  useEffect(() => {
    const newMatrix = generatePattern(level);
    setMatrix(newMatrix);

    const correct = getCorrectAnswer(newMatrix, level);
    const fourAnswers = generateAnswers(correct, level);
    setAnswers(fourAnswers);

    setSelectedAnswer(null);
    setIsAnswerSelected(false);
  }, [level]);

  const handleAnswer = (idx: number) => {
    if (isAnswerSelected) return;
    setSelectedAnswer(idx);
    setIsAnswerSelected(true);

    const isCorrect = answers[idx].isCorrect;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      if (level < 13) {
        setLevel(prev => prev + 1);
      } else {
        const finalScore = score + (isCorrect ? 1 : 0);
        const ravenScore = (finalScore / 13) * 1000; // Punteggio su 1000
        const percentile = (finalScore / 13) * 100; // Percentile
        onComplete({
          score: ravenScore,
          accuracy: percentile,
        });
      }
    }, 800);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 bg-white rounded-xl shadow-lg">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <Brain className="w-6 h-6 text-blue-600" /> {/* Usa l'icona Brain qui */}
          <h2 className="text-xl font-bold">
            Matrici Progressive - Livello {level}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <Scale className="w-5 h-5 text-blue-600" /> {/* Usa l'icona Scale qui */}
          <div className="space-x-2">
            <span className="font-mono">Livello {level}/13</span>
            <span className="font-mono">Punteggio: {score}</span>
          </div>
        </div>
      </div>

      {/* ... (resto del codice rimane invariato) */}
    </div>
  );
};

export default RavenTest; // Esporta correttamente il componente
