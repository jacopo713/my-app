import { useState, useEffect, useCallback } from "react";
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
  const [numbers, setNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [testLevel, setTestLevel] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [levelResults, setLevelResults] = useState<LevelResult[]>([]);

  // Dimensioni delle griglie per PC e telefono
  const sizesPC = [2, 4, 6]; // PC: 2x2, 4x4, 6x6
  const sizesMobile = [2, 4, 9]; // Telefono: 2x2, 4x4, 4x9
  const isMobile = window.innerWidth <= 768; // Rileva se è un dispositivo mobile

  // Usa le dimensioni corrette in base al dispositivo
  const sizes = isMobile ? sizesMobile : sizesPC;
  const currentSize = sizes[testLevel]; // Dimensione corrente
  const maxTimePerLevel = 300;

  // Funzione per generare i numeri in modo casuale
  const generateNumbers = useCallback((): number[] => {
    const totalNumbers = isMobile && testLevel === 2 ? 4 * 9 : currentSize * currentSize; // 4x9 solo per il terzo livello su telefono
    const nums = Array.from({ length: totalNumbers }, (_, i) => i + 1); // Genera i numeri da 1 a N
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]]; // Mescola i numeri
    }
    return nums;
  }, [currentSize, isMobile, testLevel]);

  // Effetto per rigenerare i numeri quando il livello cambia
  useEffect(() => {
    if (gameStarted) {
      setNumbers(generateNumbers());
    }
  }, [testLevel, gameStarted, generateNumbers]);

  // Funzione per avviare il prossimo livello
  const startNextLevel = useCallback(() => {
    setCurrentNumber(1); // Resetta il numero corrente
    setTimer(0); // Resetta il timer
    setGameStarted(true); // Avvia il gioco
    setShowInstructions(false); // Nasconde le istruzioni
    setIsCompleted(false); // Resetta lo stato di completamento
  }, []);

  // Funzione per gestire il completamento di un livello
  const handleLevelComplete = useCallback(() => {
    console.log("Livello completato:", currentSize, "x", currentSize);
    const currentResult = { time: timer, size: currentSize };
    setLevelResults((prev) => [...prev, currentResult]);

    if (testLevel === sizes.length - 1) {
      // Fine del test
      const updatedResults = [...levelResults, currentResult];
      const averageTime =
        updatedResults.reduce((acc, curr) => acc + curr.time, 0) / updatedResults.length;
      const normalizedScore = Math.round((1 - averageTime / maxTimePerLevel) * 1000);

      onComplete({
        score: normalizedScore,
        accuracy: 100,
        averageTime,
        gridSizes: updatedResults.map((r) => r.size),
        completionTimes: updatedResults.map((r) => r.time),
        percentile: Math.round((normalizedScore / 1000) * 100),
      });
    } else {
      // Passa al livello successivo
      setTestLevel((prev) => prev + 1); // Aggiorna il livello
      setTimeout(startNextLevel, 1000); // Avvia il prossimo livello dopo 1 secondo
    }
  }, [timer, currentSize, testLevel, levelResults, sizes.length, startNextLevel, onComplete]);

  // Funzione per gestire il clic sui numeri
  const handleNumberClick = useCallback(
    (number: number) => {
      if (!gameStarted || isCompleted) return;

      if (number === currentNumber) {
        if (number === (isMobile && testLevel === 2 ? 36 : currentSize * currentSize)) {
          // Se l'utente ha cliccato l'ultimo numero, completa il livello
          setGameStarted(false);
          setIsCompleted(true);
          handleLevelComplete();
        } else {
          // Passa al numero successivo
          setCurrentNumber((prev) => prev + 1);
        }
      }
    },
    [gameStarted, isCompleted, currentNumber, currentSize, handleLevelComplete, isMobile, testLevel]
  );

  // Funzione per formattare il tempo in minuti e secondi
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Effetto per gestire il timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !isCompleted) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, isCompleted]);

  return (
    <div
      className="flex justify-center items-center bg-gray-50 p-4"
      style={{
        minHeight: "calc(100vh - 64px)", // Sottrae l'altezza della navbar (64px)
      }}
    >
      <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
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
            {/* Timer e livello più vicini alla griglia */}
            <div className={`flex justify-between items-center w-full ${isMobile && testLevel === 2 ? "mb-0" : "mb-2"}`}>
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-gray-600" />
                <span className="font-mono text-lg text-gray-800">
                  {formatTime(timer)}
                </span>
              </div>
              <div className="text-gray-600">
                Livello {testLevel + 1}/3 ({isMobile && testLevel === 2 ? "4x9" : `${currentSize}x${currentSize}`})
              </div>
            </div>

            {/* Griglia con adattamento dinamico su mobile */}
            <div
              className="grid gap-1.5 w-full"
              style={{
                gridTemplateColumns: `repeat(${isMobile && testLevel === 2 ? 4 : currentSize}, minmax(0, 1fr))`,
              }}
            >
              {numbers.map((number, index) => (
                <button
                  key={index}
                  onClick={() => handleNumberClick(number)}
                  className={`
                    w-full aspect-square flex items-center justify-center
                    text-base sm:text-lg font-bold rounded-lg
                    transition-colors duration-200
                    ${
                      number < currentNumber
                        ? "bg-green-100 text-green-700 border-2 border-green-500"
                        : "bg-white hover:bg-gray-100 border-2 border-gray-200"
                    }
                    ${!gameStarted && "cursor-not-allowed opacity-50"}
                  `}
                  disabled={!gameStarted || isCompleted}
                >
                  {number}
                </button>
              ))}
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
