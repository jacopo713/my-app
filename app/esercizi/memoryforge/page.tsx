'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Brain, ArrowLeft, Play, Home } from 'lucide-react';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';

interface GameState {
  level: number;
  score: number;
  sequence: number[];
  userSequence: number[];
  phase: 'observation' | 'reproduction' | 'feedback';
  isPlaying: boolean;
  mistakes: number;
  highScore: number;
  maxLevel: number;
}

const MemoryForgePage = () => {
  const router = useRouter();
  const { user } = useAuth();
  
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    score: 0,
    sequence: [],
    userSequence: [],
    phase: 'observation',
    isPlaying: false,
    mistakes: 0,
    highScore: 0,
    maxLevel: 1
  });

  const [showSequence, setShowSequence] = useState<number | null>(null);

  // Caricamento dati utente
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, 'memoryForgeStats', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setGameState(prev => ({
            ...prev,
            highScore: data.highScore || 0,
            maxLevel: data.maxLevel || 1
          }));
        }
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
      }
    };

    loadUserData();
  }, [user]);

  // Salvataggio dati
  const saveUserData = useCallback(async (score: number, level: number) => {
    if (!user) return;

    try {
      const docRef = doc(db, 'memoryForgeStats', user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const currentData = docSnap.data();
        await updateDoc(docRef, {
          highScore: Math.max(currentData.highScore || 0, score),
          maxLevel: Math.max(currentData.maxLevel || 1, level),
          lastPlayed: new Date().toISOString()
        });
      } else {
        await setDoc(docRef, {
          highScore: score,
          maxLevel: level,
          lastPlayed: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Errore nel salvataggio dei dati:', error);
    }
  }, [user]);

  // Parametri di difficoltà
  const getDifficultyParams = useCallback((level: number) => {
    return {
      sequenceLength: Math.min(3 + Math.floor(level / 2), 12),
      observationTime: Math.max(1000 - (level * 50), 400),
      gridSize: Math.min(4 + Math.floor(level / 3), 6)
    };
  }, []);

  // Generazione sequenza
  const generateSequence = useCallback((level: number) => {
    const { sequenceLength, gridSize } = getDifficultyParams(level);
    const maxNumber = gridSize * gridSize;
    const sequence: number[] = [];
    const used = new Set<number>();

    while (sequence.length < sequenceLength) {
      const num = Math.floor(Math.random() * maxNumber);
      if (!used.has(num)) {
        sequence.push(num);
        used.add(num);
      }
    }

    return sequence;
  }, [getDifficultyParams]);

  // Gestione progressione livelli
  const handleLevelProgression = useCallback(async (success: boolean) => {
    setGameState(prev => {
      const newScore = success ? prev.score + (prev.level * 100) : prev.score;
      const newLevel = success 
        ? (newScore >= (prev.level * 1000) ? prev.level + 1 : prev.level)
        : (prev.mistakes >= 2 ? Math.max(1, prev.level - 1) : prev.level);
      
      const newMistakes = success ? 0 : prev.mistakes + 1;

      if (newScore > prev.highScore || newLevel > prev.maxLevel) {
        saveUserData(newScore, newLevel);
      }

      return {
        ...prev,
        score: newScore,
        level: newLevel,
        mistakes: newMistakes,
        phase: 'feedback',
        highScore: Math.max(prev.highScore, newScore),
        maxLevel: Math.max(prev.maxLevel, newLevel)
      };
    });
  }, [saveUserData]);

  // Gestione click cella
  const handleCellClick = useCallback((index: number) => {
    if (gameState.phase !== 'reproduction') return;

    setGameState(prev => {
      const newUserSequence = [...prev.userSequence, index];
      
      if (newUserSequence.length === prev.sequence.length) {
        const isCorrect = newUserSequence.every(
          (num, i) => num === prev.sequence[i]
        );
        handleLevelProgression(isCorrect);
        return {
          ...prev,
          userSequence: newUserSequence,
          isPlaying: false
        };
      }

      return {
        ...prev,
        userSequence: newUserSequence
      };
    });
  }, [gameState.phase, handleLevelProgression]);

  // Avvio nuovo round
  const startNewRound = useCallback(() => {
    const newSequence = generateSequence(gameState.level);
    setGameState(prev => ({
      ...prev,
      sequence: newSequence,
      userSequence: [],
      phase: 'observation',
      isPlaying: true
    }));

    let currentIndex = 0;
    const { observationTime } = getDifficultyParams(gameState.level);

    const showNextNumber = () => {
      if (currentIndex < newSequence.length) {
        setShowSequence(newSequence[currentIndex]);
        setTimeout(() => {
          setShowSequence(null);
          currentIndex++;
          setTimeout(showNextNumber, 200);
        }, observationTime);
      } else {
        setGameState(prev => ({ ...prev, phase: 'reproduction' }));
      }
    };

    showNextNumber();
  }, [gameState.level, generateSequence, getDifficultyParams]);

  const { gridSize } = getDifficultyParams(gameState.level);

  return (
    <ProtectedRoute>
      <div className="w-screen h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center p-4 bg-white shadow">
          <div className="flex items-center gap-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold">Memory Forge</h1>
              <p className="text-xs text-gray-600">Potenzia la tua memoria</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>
        </header>

        {/* Corpo principale */}
        <main className="flex-grow p-4 flex flex-col justify-between overflow-auto">
          <div>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-xs text-gray-600">Livello</div>
                <div className="text-2xl font-bold text-blue-600">{gameState.level}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-xs text-gray-600">Punteggio</div>
                <div className="text-2xl font-bold text-green-600">{gameState.score}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-xs text-gray-600">Record</div>
                <div className="text-2xl font-bold text-purple-600">{gameState.highScore}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <div className="text-xs text-gray-600">Livello Max</div>
                <div className="text-2xl font-bold text-orange-600">{gameState.maxLevel}</div>
              </div>
            </div>

            {/* Griglia di gioco centrata */}
            <div className="w-full max-w-3xl mx-auto mb-6">
              <div 
                className="grid gap-2"
                style={{ 
                  gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`
                }}
              >
                {Array.from({ length: gridSize * gridSize }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleCellClick(index)}
                    disabled={gameState.phase !== 'reproduction'}
                    className={`
                      aspect-square rounded-lg transition-all duration-200
                      ${showSequence === index 
                        ? 'bg-blue-500' 
                        : gameState.userSequence.includes(index)
                          ? 'bg-green-200'
                          : 'bg-gray-100 hover:bg-gray-200'}
                      ${gameState.phase === 'reproduction' 
                        ? 'cursor-pointer' 
                        : 'cursor-not-allowed'}
                    `}
                  />
                ))}
              </div>
            </div>

            {/* Controlli e feedback */}
            <div className="text-center space-y-4 mb-4">
              {!gameState.isPlaying && (
                <button
                  onClick={startNewRound}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  {gameState.phase === 'feedback' ? (
                    <>
                      <ArrowLeft className="w-5 h-5" />
                      Prossima Sequenza
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      Inizia
                    </>
                  )}
                </button>
              )}

              {gameState.phase === 'observation' && (
                <div className="text-lg text-gray-600">
                  Memorizza la sequenza...
                </div>
              )}

              {gameState.phase === 'reproduction' && (
                <div className="text-lg text-gray-600">
                  Riproduci la sequenza!
                </div>
              )}

              {gameState.phase === 'feedback' && (
                <div className={`text-lg font-semibold
                  ${gameState.mistakes === 0 
                    ? 'text-green-600' 
                    : 'text-red-600'}`}
                >
                  {gameState.mistakes === 0 
                    ? '✨ Ottimo lavoro! Continua così!' 
                    : '❌ Sequenza errata. Riprova!'}
                </div>
              )}
            </div>
          </div>

          {/* Istruzioni posizionate in basso a sinistra */}
          <div className="text-sm text-gray-600">
            <h3 className="font-semibold mb-2">Come giocare:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Osserva attentamente la sequenza di celle illuminate</li>
              <li>Riproduci la sequenza nello stesso ordine</li>
              <li>Guadagna 1000 punti per avanzare di livello</li>
              <li>La difficoltà aumenta con il livello</li>
              <li>Due errori consecutivi ti faranno perdere un livello</li>
            </ul>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default MemoryForgePage;

