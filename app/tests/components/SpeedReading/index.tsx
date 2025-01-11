import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';

// Esporta l'interfaccia
export interface SpeedReadingTrainerProps {
  onComplete?: (results: { wpm: number; accuracy: number; score: number }) => void;
}

// Componente ottimizzato per le statistiche con centramento
const Statistics = memo(({ cycleCount, wpm }: { cycleCount: number; wpm: number }) => (
  <div className="flex justify-between items-center mb-4 max-w-md mx-auto w-full px-4">
    <div className="text-gray-600 font-medium" key={cycleCount}>
      Ciclo: {cycleCount}/20
    </div>
    <div className="font-medium" key={wpm}>
      <span className="text-gray-600">Velocità:</span>
      <span className="text-blue-600 font-bold ml-2">{wpm} WPM</span>
    </div>
  </div>
));

Statistics.displayName = 'Statistics';

const SpeedReadingTrainer: React.FC<SpeedReadingTrainerProps> = ({ onComplete }) => {
  // Usa useMemo per memorizzare l'array WORDS
  const WORDS = useMemo(() => [
    "ETERNAMENTE", "TRAPPOLA", "SCRITTA", "MESCOLATE", 
    "CAMICETTA", "ACCAPPATOIO", "EDITTO", "PIACERE",
    "SOSTANZA", "BELLEZZA", "ARMONIA", "SERENITÀ"
  ], []); // L'array di dipendenze è vuoto, quindi WORDS non cambierà mai

  const [isStarted, setIsStarted] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(-1);
  const [currentSequence, setCurrentSequence] = useState<string[]>([]);
  const [showingQuestion, setShowingQuestion] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [cycleCount, setCycleCount] = useState(0);
  const [wpm, setWpm] = useState(100); // Cambiato da 50 a 100
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');

  const generateSequence = useCallback(() => {
    const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 9);
  }, [WORDS]); // Aggiunto WORDS come dipendenza

  const generateOptions = useCallback((correct: string): string[] => {
    const otherWords = WORDS.filter(w => w !== correct);
    const shuffledOthers = otherWords.sort(() => Math.random() - 0.5).slice(0, 3);
    const allOptions = [...shuffledOthers, correct];
    return allOptions.sort(() => Math.random() - 0.5);
  }, [WORDS]); // Aggiunto WORDS come dipendenza

  const showNextWord = useCallback(() => {
    if (currentPosition >= 8) {
      setCurrentPosition(-1);
      setShowingQuestion(true);
      const lastWord = currentSequence[8];
      setCorrectAnswer(lastWord);
      setOptions(generateOptions(lastWord));
      return;
    }

    // Seleziona una posizione casuale tra quelle rimanenti
    const availablePositions = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter(pos => !currentSequence[pos]);
    if (availablePositions.length === 0) {
      setCurrentPosition(-1);
      setShowingQuestion(true);
      const lastWord = currentSequence[8];
      setCorrectAnswer(lastWord);
      setOptions(generateOptions(lastWord));
      return;
    }

    const randomPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];
    setCurrentPosition(randomPosition);
  }, [currentPosition, currentSequence, generateOptions]);

  useEffect(() => {
    if (!isStarted || showingQuestion || currentSequence.length === 0) return;

    const wordInterval = (60 * 1000) / wpm;
    const timeoutId = setTimeout(
      showNextWord, 
      currentPosition === -1 ? 1000 : wordInterval
    );

    return () => clearTimeout(timeoutId);
  }, [isStarted, currentPosition, wpm, showingQuestion, currentSequence, showNextWord]);

  const handleAnswer = useCallback((selectedWord: string) => {
    const isCorrect = selectedWord === correctAnswer;
    const newScore = isCorrect ? score + 1 : score;
    const newWpm = isCorrect ? Math.min(1000, wpm + 50) : Math.max(50, wpm - 50);
    const newCycleCount = cycleCount + 1;
    
    setScore(newScore);
    setWpm(newWpm);
    setFeedback(isCorrect ? 'Corretto! 🎉' : `Sbagliato! La parola era: ${correctAnswer}`);
    
    if (newCycleCount >= 20) {
      setIsStarted(false);
      setFeedback(`Test completato! Punteggio: ${newScore}/20`);
      onComplete?.({
        wpm: newWpm,
        accuracy: (newScore / 20) * 100,
        score: newScore,
      });
    } else {
      setCycleCount(newCycleCount);
      setShowingQuestion(false);
      setCurrentPosition(-1);
      setCurrentSequence(generateSequence());
    }
  }, [correctAnswer, cycleCount, generateSequence, onComplete, score, wpm]);

  const startTraining = useCallback(() => {
    const initialSequence = generateSequence();
    setIsStarted(true);
    setCycleCount(0);
    setWpm(100); // Cambiato da 50 a 100
    setScore(0);
    setCurrentPosition(-1);
    setCurrentSequence(initialSequence);
    setShowingQuestion(false);
    setFeedback('');
    setCorrectAnswer('');
  }, [generateSequence]);

  return (
    <div className="flex flex-col h-full p-4">
      <Statistics cycleCount={cycleCount} wpm={wpm} />
      
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-xl">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="space-y-12">
              {[0, 1, 2].map((row) => (
                <div key={row} className="flex justify-between">
                  {[0, 1, 2].map((col) => {
                    const position = row * 3 + col;
                    return (
                      <div key={`${row}-${col}`} className="relative w-24">
                        <div className="w-full text-center">
                          <span className="inline-block w-16 border-b-2 border-gray-300"></span>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span 
                            className={`text-xl font-bold transition-all duration-200 
                              ${position === currentPosition ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
                          >
                            {position === currentPosition ? currentSequence[position] : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        {showingQuestion && (
          <div className="max-w-xl mx-auto mb-4">
            <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
              Quale parola hai visto per ultima?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {options.map((word, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(word)}
                  className="p-4 bg-white rounded-xl hover:bg-blue-50 
                           border border-gray-200 transition-all duration-200
                           font-medium text-gray-700 shadow-sm hover:shadow
                           hover:border-blue-200 active:scale-95"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center">
          {!isStarted && (
            <button
              onClick={startTraining}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl 
                       hover:bg-blue-700 transition-all duration-200 
                       font-medium shadow-lg hover:shadow-xl active:scale-95"
            >
              {cycleCount === 0 ? 'Inizia' : 'Ricomincia'}
            </button>
          )}
        </div>

        {feedback && (
          <div 
            className={`mt-4 text-center p-3 rounded-lg font-medium
              ${feedback.includes("Corretto") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            {feedback}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeedReadingTrainer;
