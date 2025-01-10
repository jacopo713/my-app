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

interface Stats {
  totalResponses: number;
  correctResponses: number;
}

interface StroopResults {
  score: number;
  accuracy: number;
  averageReactionTime: number;
  totalResponses: number;
  correctResponses: number;
  interferenceScore: number;
  responsesPerMinute: string;
}

const Statistics = memo(({ responses }: { responses: Response[] }) => {
  const stats: Stats = {
    totalResponses: responses.length,
    correctResponses: responses.filter(r => r.correct).length
  };

  return (
    <div className="mt-6 text-sm text-gray-600">
      <div key={stats.totalResponses} className="transition-all duration-200 ease-in-out">
        Risposte: {stats.totalResponses} | Corrette: {stats.correctResponses}
      </div>
    </div>
  );
});

Statistics.displayName = "Statistics";

const StroopTest = ({ onComplete }: { onComplete?: (results: StroopResults) => void }) => {
  const [timer, setTimer] = useState(60);
  const [currentStimulus, setCurrentStimulus] = useState<Stimulus | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [responseStartTime, setResponseStartTime] = useState<number | null>(null);
  const timerRef = useRef(timer);

  const colors: ColorKey[] = useMemo(() => ["rosso", "blu", "verde", "arancione"], []);

  const generateStimulus = useCallback((type: "congruent" | "incongruent"): Stimulus => {
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
  }, [colors]);

  const generateNextStimulus = useCallback(() => {
    const types: ("congruent" | "incongruent")[] = ["congruent", "incongruent"];
    const type = types[Math.floor(Math.random() * types.length)];
    const newStimulus = generateStimulus(type);
    setCurrentStimulus(newStimulus);
    setResponseStartTime(Date.now());
  }, [generateStimulus]);

  const calculateResults = useCallback(() => {
    const correct = responses.filter((r) => r.correct).length;
    const accuracy = responses.length > 0 ? correct / responses.length : 0;
    const avgTime = responses.length > 0
      ? responses.reduce((acc, r) => acc + r.reactionTime, 0) / responses.length
      : 0;

    const incongruentResponses = responses.filter((r) => r.stimulus.type === "incongruent");
    const congruentResponses = responses.filter((r) => r.stimulus.type === "congruent");

    const interferenceScore =
      incongruentResponses.length > 0 && congruentResponses.length > 0
        ? (incongruentResponses.reduce((acc, r) => acc + r.reactionTime, 0) / incongruentResponses.length) -
          (congruentResponses.reduce((acc, r) => acc + r.reactionTime, 0) / congruentResponses.length)
        : 0;

    return {
      score: Math.round(accuracy * 100),
      accuracy,
      averageReactionTime: avgTime,
      totalResponses: responses.length,
      correctResponses: correct,
      interferenceScore,
      responsesPerMinute: responses.length.toFixed(1),
    };
  }, [responses]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          console.log("Timer tick:", prev); // Debug
          if (prev <= 1) {
            clearInterval(interval);
            setIsRunning(false);
            if (onComplete) {
              onComplete(calculateResults());
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        console.log("Clearing interval"); // Debug
        clearInterval(interval);
      }
    };
  }, [isRunning, timer, onComplete, calculateResults]);

  useEffect(() => {
    if (isRunning && !currentStimulus) {
      generateNextStimulus();
    }
  }, [isRunning, currentStimulus, generateNextStimulus]);

  const handleResponse = useCallback((selectedColor: ColorKey) => {
    if (!currentStimulus || !isRunning || !responseStartTime) return;

    const response: Response = {
      stimulus: currentStimulus,
      selectedColor,
      correct: selectedColor === currentStimulus.color,
      reactionTime: Date.now() - responseStartTime,
    };

    setResponses((prev) => [...prev, response]);
    generateNextStimulus();
  }, [currentStimulus, isRunning, responseStartTime, generateNextStimulus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6" />
          <h2 className="text-xl font-bold">Test di Stroop</h2>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span className="font-mono">{formatTime(timer)}</span>
        </div>
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

      <Statistics responses={responses} />
    </div>
  );
};

export default StroopTest;
