import { useState, useEffect, useCallback, useRef } from "react";
import { Clock } from "lucide-react";

interface SchulteTableProps {
  onComplete: (results: SchulteResults) => void;
}

interface SchulteResults {
  score: number;
  accuracy: number;
  averageTime: number;
  gridSizes: number[];
  completionTimes: number[];
  percentile: number;
}

interface LevelResult {
  time: number;
  size: number;
}

export default function SchulteTable({ onComplete }: SchulteTableProps) {
  // Gestione degli stati principali
  const [numbers, setNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [testLevel, setTestLevel] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [levelResults, setLevelResults] = useState<LevelResult[]>([]);

  // Riferimento al contesto audio
  const audioContextRef = useRef<AudioContext | null>(null);

  // Configurazione del gioco
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
  const sizes = [2, 4, 6];  // Uniformato per tutti i dispositivi
  const currentSize = sizes[testLevel];
  const maxTimePerLevel = 300;

  // Inizializzazione del contesto audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Generazione dei numeri casuali
  const generateNumbers = useCallback(() => {
    const totalNumbers = currentSize * currentSize;
    const nums = Array.from({ length: totalNumbers }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    return nums;
  }, [currentSize]);

  // Effetto per la generazione dei numeri all'avvio del gioco
  useEffect(() => {
    if (gameStarted) {
      setNumbers(generateNumbers());
    }
  }, [gameStarted, generateNumbers]);

  // Gestione del timer di gioco
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !isCompleted) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, isCompleted]);

  // Funzione per il feedback sonoro
  const playSwishSound = useCallback(() => {
    if (!audioContextRef.current) return;

    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(400, audioContextRef.current.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      200,
      audioContextRef.current.currentTime + 0.1
    );

    gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContextRef.current.currentTime + 0.1
    );

    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    oscillator.start();
    oscillator.stop(audioContextRef.current.currentTime + 0.1);
  }, []);

  // Formattazione del tempo
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Gestione dell'avvio del livello
  const startNextLevel = useCallback(() => {
    setCurrentNumber(1);
    setTimer(0);
    setGameStarted(true);
    setShowInstructions(false);
    setIsCompleted(false);
  }, []);

  // Gestione del click sui numeri
  const handleNumberClick = useCallback((number: number) => {
    if (!gameStarted || isCompleted) return;

    if (number === currentNumber) {
      playSwishSound();

      if (number === currentSize * currentSize) {
        const currentResult = { time: timer, size: currentSize };
        setLevelResults(prev => [...prev, currentResult]);
        setGameStarted(false);
        setIsCompleted(true);
        
        if (testLevel === sizes.length - 1) {
          const updatedResults = [...levelResults, currentResult];
          const averageTime = updatedResults.reduce((acc, curr) => acc + curr.time, 0) / updatedResults.length;
          const normalizedScore = Math.round((1 - averageTime / maxTimePerLevel) * 1000);
          
          onComplete({
            score: normalizedScore,
            accuracy: 100,
            averageTime,
            gridSizes: updatedResults.map(r => r.size),
            completionTimes: updatedResults.map(r => r.time),
            percentile: Math.round((normalizedScore / 1000) * 100)
          });
        } else {
          setTimeout(() => {
            setTestLevel(prev => prev + 1);
            setCurrentNumber(1);
            setIsCompleted(false);
            setGameStarted(true);
            setTimer(0);
          }, 2000);
        }
      } else {
        setCurrentNumber(prev => prev + 1);
      }
    }
  }, [gameStarted, isCompleted, currentNumber, currentSize, timer, testLevel, levelResults, sizes.length, onComplete, playSwishSound]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-4">
        {showInstructions ? (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Test di Attenzione - Tabella di Schulte
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 text-gray-700">Istruzioni:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Completerai tre livelli di difficoltà crescente</li>
                <li>In ogni livello, trova e clicca i numeri in ordine crescente</li>
                <li>Mantieni lo sguardo fisso al centro della griglia</li>
                <li>Utilizza la visione periferica per individuare i numeri</li>
                <li>La velocità e la precisione sono entrambe importanti</li>
              </ul>
            </div>
            <button
              onClick={startNextLevel}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Inizia il Test
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex justify-between items-center w-full mb-2">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="font-mono text-lg text-gray-800">
                  {formatTime(timer)}
                </span>
              </div>
              <div className="text-gray-600">
                Livello {testLevel + 1}/3 ({currentSize}x{currentSize})
              </div>
            </div>

            <div className="w-11/12 mx-auto">
              <div
                className="grid w-full"
                style={{
                  gridTemplateColumns: `repeat(${currentSize}, minmax(0, 1fr))`,
                  gap: "1px",
                }}
              >
                {numbers.map((number, index) => (
                  <button
                    key={index}
                    onClick={() => handleNumberClick(number)}
                    className={`
                      aspect-square flex items-center justify-center
                      text-sm sm:text-base lg:text-lg font-bold rounded-lg
                      transition-colors duration-200
                      ${
                        number < currentNumber
                          ? "bg-green-100 text-green-700 border border-green-500"
                          : "bg-white hover:bg-gray-100 border border-gray-200"
                      }
                      ${!gameStarted ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                    `}
                    disabled={!gameStarted || isCompleted}
                  >
                    {number}
                  </button>
                ))}
              </div>
            </div>

            {isCompleted && testLevel < sizes.length - 1 && (
              <div className="mt-4 text-center text-gray-600">
                Preparati per il prossimo livello...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
