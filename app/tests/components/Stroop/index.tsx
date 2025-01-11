import { useState, useEffect, useCallback, memo, useMemo, useRef } from "react";
import { Clock, Brain } from "lucide-react";

// ... (resto delle interfacce e costanti invariate)

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

  const colors: ColorKey[] = useMemo(() => ["rosso", "blu", "verde", "arancione"], []);

  // ... (generateStimulus e calculateResults invariati)

  // Timer ottimizzato
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 1) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          if (onComplete) {
            onComplete(calculateResults());
          }
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]); // Solo isRunning come dipendenza

  // Gestione stimolo iniziale ottimizzata
  useEffect(() => {
    if (isRunning && !currentStimulus) {
      const type = Math.random() < 0.5 ? "congruent" : "incongruent";
      const newStimulus = generateStimulus(type);
      setCurrentStimulus(newStimulus);
      responseStartTimeRef.current = Date.now();
    }
  }, [isRunning, currentStimulus, generateStimulus]);

  const handleResponse = useCallback(
    (selectedColor: ColorKey) => {
      if (!currentStimulus || !isRunning || !responseStartTimeRef.current) return;

      const correct = selectedColor === currentStimulus.color;
      
      const response: Response = {
        stimulus: currentStimulus,
        selectedColor,
        correct,
        reactionTime: Date.now() - responseStartTimeRef.current,
      };

      const type = Math.random() < 0.5 ? "congruent" : "incongruent";
      const newStimulus = generateStimulus(type);

      setResponses(prev => [...prev, response]);
      setStats(prev => ({
        correct: prev.correct + (correct ? 1 : 0),
        total: prev.total + 1
      }));
      setCurrentStimulus(newStimulus);
      responseStartTimeRef.current = Date.now();
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
