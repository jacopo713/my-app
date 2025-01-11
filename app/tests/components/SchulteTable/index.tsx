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

  // Dimensioni delle griglie ottimizzate
  const sizesPC = [2, 4, 6]; // PC: 2x2, 4x4, 6x6
  const sizesMobile = [2, 4, 6]; // Telefono: 2x2, 4x4, 4x6 (modificato da 4x9)
  const isMobile = window.innerWidth <= 768;

  const sizes = isMobile ? sizesMobile : sizesPC;
  const currentSize = sizes[testLevel];
  const maxTimePerLevel = 300;

  // Funzione modificata per gestire la nuova griglia 4x6
  const generateNumbers = useCallback((): number[] => {
    const totalNumbers = isMobile && testLevel === 2 ? 4 * 6 : currentSize * currentSize; // Modificato da 4*9 a 4*6
    const nums = Array.from({ length: totalNumbers }, (_, i) => i + 1);
    for (let i = nums.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
    return nums;
  }, [currentSize, isMobile, testLevel]);

  // ... [Altri stati e funzioni rimangono invariati]

  return (
    <div
      className="flex justify-center items-center bg-gray-50 p-4"
      style={{
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-4"> {/* Ridotto da max-w-4xl */}
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
                Livello {testLevel + 1}/3 ({isMobile && testLevel === 2 ? "4x6" : `${currentSize}x${currentSize}`})
              </div>
            </div>

            <div className="w-9/12 mx-auto"> {/* Contenitore aggiunto per ridurre del 30% */}
              <div
                className="grid w-full"
                style={{
                  gridTemplateColumns: `repeat(${isMobile && testLevel === 2 ? 4 : currentSize}, minmax(0, 1fr))`,
                  gap: "1px",
                }}
              >
                {numbers.map((number, index) => (
                  <button
                    key={index}
                    onClick={() => handleNumberClick(number)}
                    className={`
                      aspect-square flex items-center justify-center
                      text-xs sm:text-sm font-bold rounded-lg
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
