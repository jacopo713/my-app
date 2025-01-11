import { useState, useEffect, useCallback, useMemo } from "react";
import { Brain } from "lucide-react";

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
  accuracy: number;
  averageReactionTime: number;
  responsesPerMinute: string;
  interferenceScore: number;
}

const StroopTest = ({ onComplete }: { onComplete?: (results: StroopResults) => void }) => {
  const [timer, setTimer] = useState(60);
  const [currentStimulus, setCurrentStimulus] = useState<Stimulus | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [stats, setStats] = useState({
    correct: 0,
    total: 0,
  });

  const colors = useMemo(() => ["rosso", "blu", "verde", "arancione"] as const, []);
  const startTimeRef = useState(() => Date.now())[0];

  const calculateResults = useCallback(() => {
    if (responses.length === 0) return null;

    const avgTime = responses.reduce((acc, r) => acc + r.reactionTime, 0) / responses.length;
    const incongruentResponses = responses.filter(r => r.stimulus.type === "incongruent");
    const congruentResponses = responses.filter(r => r.stimulus.type === "congruent");

    const interferenceScore = 
      (incongruentResponses.length > 0 && congruentResponses.length > 0)
        ? (incongruentResponses.reduce((acc, r) => acc + r.reactionTime, 0) / incongruentResponses.length) -
          (congruentResponses.reduce((acc, r) => acc + r.reactionTime, 0) / congruentResponses.length)
        : 0;

    return {
      score: Math.round((stats.correct / 112) * 1000),
      accuracy: Math.round((stats.correct / stats.total) * 100),
      averageReactionTime: Math.round(avgTime),
      responsesPerMinute: ((stats.total / 60) * 60).toFixed(1),
      interferenceScore: Math.round(interferenceScore)
    };
  }, [responses, stats.correct, stats.total]);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef) / 1000);
      const remaining = Math.max(0, 60 - elapsed);
      
      setTimer(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
        const results = calculateResults();
        if (results && onComplete) {
          onComplete(results);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTimeRef, onComplete, calculateResults]);

  const generateStimulus = useCallback(() => {
    const wordIndex = Math.floor(Math.random() * colors.length);
    const word = colors[wordIndex];
    const type = Math.random() < 0.5 ? "congruent" : "incongruent";
    const colorIndex = type === "congruent" 
      ? wordIndex 
      : (wordIndex + 1 + Math.floor(Math.random() * (colors.length - 1))) % colors.length;

    return {
      word,
      color: colors[colorIndex],
      type,
      timestamp: Date.now(),
    };
  }, [colors]);

  useEffect(() => {
    if (!currentStimulus && timer > 0) {
      setCurrentStimulus(generateStimulus());
    }
  }, [currentStimulus, timer, generateStimulus]);

  const handleResponse = useCallback((selectedColor: ColorKey) => {
    if (!currentStimulus || timer <= 0) return;

    const correct = selectedColor === currentStimulus.color;
    const response: Response = {
      stimulus: currentStimulus,
      selectedColor,
      correct,
      reactionTime: Date.now() - currentStimulus.timestamp,
    };

    setResponses(prev => [...prev, response]);
    setStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));
    setCurrentStimulus(generateStimulus());
  }, [currentStimulus, timer, generateStimulus]);

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
        <div className="font-mono">{formatTime(timer)}</div>
      </div>

      {currentStimulus && timer > 0 && (
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

          <div className="mt-6 text-center text-sm text-gray-600">
            Risposte corrette: {stats.correct}/{stats.total} 
            ({stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%)
          </div>
        </>
      )}
    </div>
  );
};

export default StroopTest;
