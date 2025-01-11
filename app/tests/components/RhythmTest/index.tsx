/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Music } from 'lucide-react';

// 1. DEFINIZIONI DEI TIPI
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
    mozAudioContext: typeof AudioContext;
    oAudioContext: typeof AudioContext;
    msAudioContext: typeof AudioContext;
  }
}

interface RhythmTestProps {
  onComplete: (result: { precision: number; level: number }) => void;
}

interface Note {
  note: number;
  duration: number;
  gain?: number;
}

interface AudioResources {
  context: AudioContext;
  masterGain: GainNode;
  oscillators: OscillatorNode[];
  gains: GainNode[];
}

// 2. COSTANTI
const ATTACK_TIME = 0.05;
const RELEASE_TIME = 0.05;
const DEFAULT_GAIN = 0.3;
const AUDIO_START_DELAY = 0.1;

// 3. MELODIE (come nell'originale)
const MELODIES: Note[][] = [
  [
    { note: 440, duration: 500, gain: 0.3 },
    { note: 523.25, duration: 500, gain: 0.3 },
    { note: 659.25, duration: 500, gain: 0.3 },
    { note: 783.99, duration: 500, gain: 0.3 },
  ],
  // ... altre melodie come nell'originale
];

const RhythmTest: React.FC<RhythmTestProps> = ({ onComplete }) => {
  // 4. STATI
  const [audioResources, setAudioResources] = useState<AudioResources | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'start' | 'listen' | 'replay' | 'results'>('start');
  const [precision, setPrecision] = useState(100);
  const [pulseScale, setPulseScale] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [precisions, setPrecisions] = useState<number[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 5. REFS
  const startTimeRef = useRef<number | null>(null);
  const audioCleanupRef = useRef<(() => void) | null>(null);

  // 6. COMPUTAZIONI
  const currentMelody = MELODIES[currentLevel];
  const totalDuration = currentMelody.reduce((acc, { duration }) => acc + duration, 0);
  const isLastLevel = currentLevel === MELODIES.length - 1;

  // 7. GESTIONE AUDIO
  const initAudioContext = useCallback(async (): Promise<AudioResources> => {
    try {
      const AudioContextConstructor = 
        window.AudioContext || 
        window.webkitAudioContext || 
        window.mozAudioContext || 
        window.oAudioContext || 
        window.msAudioContext;

      if (!AudioContextConstructor) {
        throw new Error('Web Audio API non supportata in questo browser');
      }

      const context = new AudioContextConstructor();
      
      if (context.state === 'suspended') {
        await context.resume();
      }

      const masterGain = context.createGain();
      masterGain.connect(context.destination);
      
      return {
        context,
        masterGain,
        oscillators: [],
        gains: [],
      };
    } catch (error) {
      console.error('Errore inizializzazione audio:', error);
      setErrorMessage('Errore nell\'inizializzazione del sistema audio');
      throw error;
    }
  }, []);

  const cleanupAudio = useCallback(() => {
    if (audioResources) {
      try {
        audioResources.oscillators.forEach(osc => {
          osc.stop();
          osc.disconnect();
        });
        audioResources.gains.forEach(gain => gain.disconnect());
        
        if (audioCleanupRef.current) {
          audioCleanupRef.current();
          audioCleanupRef.current = null;
        }
        
        audioResources.context.close();
        setAudioResources(null);
      } catch (error) {
        console.error('Errore durante la pulizia audio:', error);
      }
    }
  }, [audioResources]);

  const setupAudioResources = useCallback(async () => {
    try {
      return await initAudioContext();
    } catch (error) {
      console.error('Errore setup risorse audio:', error);
      throw error;
    }
  }, [initAudioContext]);

  const playMelody = useCallback(async (isDemo: boolean = false) => {
    try {
      await cleanupAudio();
      
      const resources = audioResources || await setupAudioResources();
      if (!audioResources) setAudioResources(resources);

      if (resources.context.state !== 'running') {
        await resources.context.resume();
      }

      let startTime = resources.context.currentTime + AUDIO_START_DELAY;
      const newOscillators: OscillatorNode[] = [];
      const newGains: GainNode[] = [];

      currentMelody.forEach(({ note, duration, gain = DEFAULT_GAIN }, index) => {
        if (note === 0) {
          startTime += duration / 1000;
          return;
        }

        const osc = resources.context.createOscillator();
        const gainNode = resources.context.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, startTime);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(gain, startTime + ATTACK_TIME);
        gainNode.gain.linearRampToValueAtTime(gain, startTime + (duration / 1000) - RELEASE_TIME);
        gainNode.gain.linearRampToValueAtTime(0, startTime + duration / 1000);

        osc.connect(gainNode);
        gainNode.connect(resources.masterGain);

        newOscillators.push(osc);
        newGains.push(gainNode);

        osc.start(startTime);
        osc.stop(startTime + duration / 1000);

        setTimeout(() => {
          setPulseScale(1.3);
          setTimeout(() => setPulseScale(1), 100);
        }, index * duration);

        startTime += duration / 1000;
      });

      resources.oscillators = newOscillators;
      resources.gains = newGains;

      setIsPlaying(true);
      startTimeRef.current = performance.now();

      if (isDemo) {
        const stopTimeout = setTimeout(() => {
          setIsPlaying(false);
          setPhase('replay');
          cleanupAudio();
        }, totalDuration);

        audioCleanupRef.current = () => clearTimeout(stopTimeout);
      }
    } catch (error) {
      console.error('Errore durante la riproduzione:', error);
      setErrorMessage('Errore durante la riproduzione audio');
      setIsPlaying(false);
    }
  }, [audioResources, cleanupAudio, currentMelody, setupAudioResources, totalDuration]);

  // 8. GESTIONE INTERAZIONI
  const startDemo = useCallback(async () => {
    try {
      setPhase('listen');
      await playMelody(true);
    } catch (error) {
      console.error('Errore avvio demo:', error);
      setErrorMessage('Errore nell\'avvio della demo');
    }
  }, [playMelody]);

  const stopReplay = useCallback(() => {
    if (!startTimeRef.current || !audioResources) return;

    try {
      const duration = performance.now() - startTimeRef.current;
      const deviation = Math.abs(duration - totalDuration);
      const maxDeviation = totalDuration * 0.3;

      const calculatedPrecision = Math.max(0, 100 * (1 - Math.pow(deviation / maxDeviation, 2)));
      const finalPrecision = Math.min(Math.max(Math.round(calculatedPrecision), 0), 100);

      setPrecisions(prev => [...prev, finalPrecision]);
      const averagePrecision = [...precisions, finalPrecision].reduce((a, b) => a + b, 0) / (precisions.length + 1);
      setPrecision(averagePrecision);

      setIsPlaying(false);
      setPhase('results');
      cleanupAudio();

      if (isLastLevel) {
        onComplete({ 
          precision: averagePrecision,
          level: currentLevel
        });
      }
    } catch (error) {
      console.error('Errore durante lo stop:', error);
      setErrorMessage('Errore durante il calcolo della precisione');
    }
  }, [audioResources, cleanupAudio, currentLevel, isLastLevel, onComplete, precisions, totalDuration]);

  const nextLevel = useCallback(() => {
    try {
      if (currentLevel < MELODIES.length - 1) {
        cleanupAudio();
        setCurrentLevel(prev => prev + 1);
        setPhase('start');
        setPrecision(100);
        setPrecisions([]);
        setErrorMessage(null);
      }
    } catch (error) {
      console.error('Errore passaggio livello:', error);
      setErrorMessage('Errore nel passaggio al livello successivo');
    }
  }, [cleanupAudio, currentLevel]);

  // 9. EFFETTI
  useEffect(() => {
    const initAudio = async () => {
      try {
        if (typeof window !== 'undefined') {
          const resources = await setupAudioResources();
          setAudioResources(resources);
        }
      } catch (error) {
        console.error('Errore inizializzazione componente:', error);
        setErrorMessage('Errore nell\'inizializzazione del componente');
      }
    };

    initAudio();

    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio, setupAudioResources]);

  // 10. RENDERING
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Music className="w-8 h-8 text-indigo-600" />
          <h2 className="text-xl font-bold">
            Test del Ritmo - Livello {currentLevel + 1}/{MELODIES.length}
          </h2>
        </div>
        <div className="text-lg font-semibold">
          Precisione: {precision.toFixed(1)}%
        </div>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {errorMessage}
        </div>
      )}

      <div className="mb-6">
        <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-200"
            style={{ width: `${precision}%` }}
          />
        </div>
      </div>

      <div className="relative mb-6 w-64 h-64 mx-auto">
        <div
          className={`
            absolute inset-0 border-4 rounded-full
            transition-all duration-100 ease-out
            ${isPlaying ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'}
          `}
          style={{
            transform: `scale(${pulseScale})`,
          }}
        />
      </div>

      <div className="flex justify-center gap-4">
        {phase === 'start' && (
          <button
            onClick={startDemo}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium 
                     hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 
                     focus:ring-indigo-500 focus:ring-offset-2"
            disabled={!!errorMessage}
          >
            Inizia Test
          </button>
        )}

        {phase === 'replay' && !isPlaying && (
          <button
            onClick={() => playMelody(false)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium 
                     hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 
                     focus:ring-green-500 focus:ring-offset-2"
            disabled={!!errorMessage}
          >
            Riproduci
          </button>
        )}

        {phase === 'replay' && isPlaying && (
          <button
            onClick={stopReplay}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium 
                     hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 
                     focus:ring-red-500 focus:ring-offset-2"
          >
            Stop
          </button>
        )}

        {phase === 'results' && !isLastLevel && (
          <button
            onClick={nextLevel}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium 
                     hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 
                     focus:ring-green-500 focus:ring-offset-2"
            disabled={!!errorMessage}
          >
            Livello Successivo
          </button>
        )}
      </div>

      <div className="mt-4 text-center text-sm text-gray-600">
        {phase === 'listen' && "Ascolta attentamente la melodia"}
        {phase === 'replay' && !isPlaying && "Riproduci la melodia quando sei pronto"}
        {phase === 'replay' && isPlaying && "Ferma quando pensi che la melodia dovrebbe finire"}
        {phase === 'results' && (
          currentLevel === MELODIES.length - 1 
            ? "Test completato! Hai superato tutti i livelli!" 
            : "Livello completato! Prosegui al successivo"
        )}
      </div>

      <div className="mt-8 text-sm text-gray-600">
        <h3 className="font-semibold mb-2">Istruzioni:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Ascolta attentamente la melodia di esempio per familiarizzare con il ritmo</li>
          <li>Quando ti senti pronto, premi "Riproduci" per iniziare la tua riproduzione</li>
          <li>Premi "Stop" quando ritieni che la melodia dovrebbe terminare</li>
          <li>Il sistema calcolerà la tua precisione basandosi sulla differenza temporale</li>
          <li>Completa tutti i livelli per migliorare il tuo punteggio complessivo</li>
          <li>In caso di problemi audio, verifica che il browser abbia i permessi necessari</li>
        </ul>
      </div>
    </div>
  );
};

// Esporta il componente
export default RhythmTest;
