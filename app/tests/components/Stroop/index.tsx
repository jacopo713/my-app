import { useState, useEffect, useCallback, memo, useMemo, useRef } from "react";
import { Clock, Brain } from "lucide-react";

const colorValues = {
  rosso: "#EF4444",
  blu: "#3B82F6",
  verde: "#10B981",
  arancione: "#F59E0B",
};

type ColorKey = keyof typeof colorValues;

interface Stimulus {
  word: ColorKey;
  color: ColorKey;
  type: "congruent" | "incongruent";
  timestamp: number;
}

interface Response {
  stimulus: Stimulus;
  selectedColor: ColorKey;
  correct: boolean;
  reactionTime: number;
}

interface StroopResults {
  score: number;
  accuracy: number; // Precisione come numero
  averageReactionTime: number; // Tempo medio come numero
  responsesPerMinute: string; // Risposte al minuto come stringa
  interferenceScore: number; // Punteggio di interferenza come numero
}

// Componente Timer ottimizzato
const Timer = memo(({ value }: { value: number }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2">
      <Clock className="w-5 h-5" />
      <span className="font-mono">{formatTime(value)}</span>
    </div>
  );
});

Timer.displayName = "Timer";

const StroopTest = ({ onComplete }: { onComplete?: (results: StroopResults) => void }) => {
  const [timer, setTimer] = useState(60);
  const [currentStimulus, setCurrentStimulus] = useState<Stimulus | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isRunning, setIsRunning] = useState(true);

  const responseStartTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  const colors: ColorKey[] = useMemo(() => ["rosso", "blu", "verde", "arancione"], []);

  // Genera un singolo stimolo
  const generateStimulus = useCallback(
    (type: "congruent" | "incongruent"): Stimulus => {
      const wordIndex = Math.floor(Math.random() * colors.length);
      const word = colors[wordIndex];
      let colorIndex;

      if (type === "congruent") {
        colorIndex = wordIndex;
      } else {
        do {
          colorIndex = Math.floor(Math.random() * colors.length);
        } while (colorIndex === wordIndex);
      }

      return {
        word,
        color: colors[colorIndex],
        type,
        timestamp: Date.now(),
      };
    },
    [colors]
  );

  // Calcola i risultati
  const calculateResults = useCallback(() => {
    const correctResponses = responses.filter((r) => r.correct).length;
    const totalResponses = responses.length;
    const accuracy = totalResponses > 0 ? (correctResponses / totalResponses) * 100 : 0; // Calcola l'accuracy
    const avgTime =
      totalResponses > 0
        ? responses.reduce((acc, r) => acc + r.reactionTime, 0) / totalResponses
        : 0;

    const responsesPerMinute = (totalResponses / (60 - timer)) * 60;

    const incongruentResponses = responses.filter((r) => r.stimulus.type === "incongruent");
    const congruentResponses = responses.filter((r) => r.stimulus.type === "congruent");

    const interferenceScore =
      incongruentResponses.length > 0 && congruentResponses.length > 0
        ? (incongruentResponses.reduce((acc, r) => acc + r.reactionTime, 0) / incongruentResponses.length) -
          (congruentResponses.reduce((acc, r) => acc + r.reactionTime, 0) / congruentResponses.length)
        : 0;

    return {
      score: Math.round((correctResponses / 112) * 1000), // Punteggio basato su 112 risposte corrette (massimo 1000)
      accuracy: Math.round(accuracy), // Precisione in percentuale
      averageReactionTime: avgTime, // Tempo medio come numero
      responsesPerMinute: responsesPerMinute.toFixed(1), // Risposte al minuto formattate
      interferenceScore: interferenceScore, // Punteggio di interferenza come numero
    };
  }, [responses, timer]);

  // Gestione timer
  useEffect(() => {
    if (!isRunning) return;

    const startTime = Date.now();
    const originalTimer = timer;

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const newValue = originalTimer - elapsed;

      if (newValue <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        setIsRunning(false);
        setTimer(0);
        if (onComplete) {
          onComplete(calculateResults());
        }
      } else {
        setTimer(newValue);
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning, timer, onComplete, calculateResults]);

  // Gestione dello stimolo iniziale
  useEffect(() => {
    if (isRunning && !currentStimulus) {
      const newStimulus = generateStimulus(Math.random() < 0.5 ? "congruent" : "incongruent");
      setCurrentStimulus(newStimulus);
      responseStartTimeRef.current = Date.now();
    }
  }, [isRunning, currentStimulus, generateStimulus]);

  // Gestione della risposta
  const handleResponse = useCallback(
    (selectedColor: ColorKey) => {
      if (!currentStimulus || !isRunning || !responseStartTimeRef.current) return;

      const response: Response = {
        stimulus: currentStimulus,
        selectedColor,
        correct: selectedColor === currentStimulus.color,
        reactionTime: Date.now() - responseStartTimeRef.current,
      };

      const newStimulus = generateStimulus(Math.random() < 0.5 ? "congruent" : "incongruent");

      setResponses((prev) => {
        const newResponses = [...prev, response];
        setCurrentStimulus(newStimulus);
        responseStartTimeRef.current = Date.now();
        return newResponses;
      });
    },
    [currentStimulus, isRunning, generateStimulus]
  );

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6" />
          <h2 className="text-xl font-bold">Test di Stroop</h2>
        </div>
        <Timer value={timer} />
      </div>

      {currentStimulus && isRunning && (
        <>
          <div className="text-center py-12 mb-6">
            <span
              className="text-4xl font-bold"
              style={{ color: colorValues[currentStimulus.color] }}
            >
              {currentStimulus.word.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleResponse(color)}
                className="p-4 rounded-lg border-2 hover:bg-gray-50 transition-colors"
                style={{ borderColor: colorValues[color] }}
              >
                {color.toUpperCase()}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default StroopTest;
