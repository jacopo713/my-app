import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Brain } from "lucide-react";

// ... (interfaces e types invariati)

const StroopTest = ({ onComplete }: { onComplete?: (results: StroopResults) => void }) => {
  const [timer, setTimer] = useState(60);
  const [currentStimulus, setCurrentStimulus] = useState<Stimulus | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [stats, setStats] = useState({
    correct: 0,
    total: 0,
  });

  const responseStartTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const colors = useMemo(() => ["rosso", "blu", "verde", "arancione"] as const, []);

  // Timer completamente isolato
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          
          // Calcolo risultati solo alla fine
          if (onComplete) {
            const results = {
              score: Math.round((stats.correct / 112) * 1000),
              accuracy: Math.round((stats.correct / stats.total) * 100),
              averageReactionTime: Math.round(
                responses.reduce((acc, r) => acc + r.reactionTime, 0) / responses.length
              ),
              responsesPerMinute: ((stats.total / 60) * 60).toFixed(1),
              interferenceScore: Math.round(
                responses.filter(r => r.stimulus.type === "incongruent")
                  .reduce((acc, r) => acc + r.reactionTime, 0) / 
                responses.filter(r => r.stimulus.type === "incongruent").length -
                responses.filter(r => r.stimulus.type === "congruent")
                  .reduce((acc, r) => acc + r.reactionTime, 0) / 
                responses.filter(r => r.stimulus.type === "congruent").length
              ),
            };
            onComplete(results);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []); // Nessuna dipendenza per il timer

  // Generazione stimolo semplificata
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

  // Gestione stimolo iniziale
  useEffect(() => {
    if (!currentStimulus) {
      setCurrentStimulus(generateStimulus());
      responseStartTimeRef.current = Date.now();
    }
  }, [currentStimulus, generateStimulus]);

  // Gestione risposta semplificata
  const handleResponse = useCallback((selectedColor: ColorKey) => {
    if (!currentStimulus || !responseStartTimeRef.current) return;

    const correct = selectedColor === currentStimulus.color;
    
    setResponses(prev => [...prev, {
      stimulus: currentStimulus,
      selectedColor,
      correct,
      reactionTime: Date.now() - responseStartTimeRef.current,
    }]);

    setStats(prev => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1
    }));

    setCurrentStimulus(generateStimulus());
    responseStartTimeRef.current = Date.now();
  }, [currentStimulus, generateStimulus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Rendering semplificato
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
