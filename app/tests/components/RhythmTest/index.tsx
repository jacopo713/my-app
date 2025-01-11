/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Music } from 'lucide-react';

// Definizioni dei tipi
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

interface RhythmTestProps {
  onComplete: (result: { precision: number; level: number }) => void;
}

interface Note {
  note: number;    // Frequenza della nota (Hz). Se è 0, rappresenta una pausa.
  duration: number; // Durata della nota in millisecondi.
  gain?: number;   // Volume della nota (facoltativo).
}

interface AudioResources {
  context: AudioContext;
  masterGain: GainNode;
  oscillators: OscillatorNode[];
  gains: GainNode[];
}

// Costanti per la gestione audio
const ATTACK_TIME = 0.05;
const RELEASE_TIME = 0.05;
const DEFAULT_GAIN = 0.3;

// Definizione delle melodie con difficoltà crescente (6 livelli)
const MELODIES: Note[][] = [
  // Livello 1: Melodia base
  [
    { note: 440, duration: 500, gain: 0.3 },    // A4
    { note: 523.25, duration: 500, gain: 0.3 }, // C5
    { note: 659.25, duration: 500, gain: 0.3 }, // E5
    { note: 783.99, duration: 500, gain: 0.3 }, // G5
  ],
  // Livello 2: Melodia con ritmo più complesso
  [
    { note: 440, duration: 400, gain: 0.3 },
    { note: 523.25, duration: 300, gain: 0.3 },
    { note: 659.25, duration: 500, gain: 0.3 },
    { note: 783.99, duration: 200, gain: 0.3 },
    { note: 659.25, duration: 400, gain: 0.3 },
  ],
  // Livello 3: Melodia con pause
  [
    { note: 440, duration: 300, gain: 0.3 },
    { note: 0, duration: 200 },  // Pausa
    { note: 523.25, duration: 300, gain: 0.3 },
    { note: 659.25, duration: 400, gain: 0.3 },
    { note: 0, duration: 200 },  // Pausa
    { note: 783.99, duration: 300, gain: 0.3 },
  ],
  // Livello 4: Melodia con ritmo accelerato e variazioni
  [
    { note: 440, duration: 250, gain: 0.35 },
    { note: 493.88, duration: 250, gain: 0.35 },
    { note: 523.25, duration: 250, gain: 0.35 },
    { note: 587.33, duration: 250, gain: 0.35 },
    { note: 659.25, duration: 250, gain: 0.35 },
    { note: 698.46, duration: 250, gain: 0.35 },
  ],
  // Livello 5: Melodia con intervalli maggiori e pause più brevi
  [
    { note: 440, duration: 220, gain: 0.35 },
    { note: 523.25, duration: 220, gain: 0.35 },
    { note: 0, duration: 150 },
    { note: 587.33, duration: 220, gain: 0.35 },
    { note: 659.25, duration: 220, gain: 0.35 },
    { note: 0, duration: 150 },
    { note: 783.99, duration: 220, gain: 0.35 },
  ],
  // Livello 6: Melodia complessa con rapidi cambi e variazioni dinamiche
  [
    { note: 440, duration: 200, gain: 0.4 },
    { note: 493.88, duration: 200, gain: 0.4 },
    { note: 523.25, duration: 200, gain: 0.4 },
    { note: 587.33, duration: 200, gain: 0.4 },
    { note: 659.25, duration: 200, gain: 0.4 },
    { note: 698.46, duration: 200, gain: 0.4 },
    { note: 783.99, duration: 200, gain: 0.4 },
    { note: 880, duration: 200, gain: 0.4 },
  ],
];

const RhythmTest: React.FC<RhythmTestProps> = ({ onComplete }) => {
  const [audioResources, setAudioResources] = useState<AudioResources | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'start' | 'listen' | 'replay' | 'results'>('start');
  const [precision, setPrecision] = useState(100);
  const [pulseScale, setPulseScale] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [precisions, setPrecisions] = useState<number[]>([]);

  const startTimeRef = useRef<number | null>(null);
  const audioCleanupRef = useRef<(() => void) | null>(null);

  const currentMelody = MELODIES[currentLevel];
  const totalDuration = currentMelody.reduce((acc, { duration }) => acc + duration, 0);
  const isLastLevel = currentLevel === MELODIES.length - 1;

  // Inizializzazione del contesto audio
  const initAudioContext = useCallback((): AudioResources => {
    const AudioContextConstructor: typeof AudioContext =
      window.AudioContext || ((window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    const context = new AudioContextConstructor();
    const masterGain = context.createGain();
    masterGain.connect(context.destination);
    return {
      context,
      masterGain,
      oscillators: [],
      gains: [],
    };
  }, []);

  const setupAudioResources = useCallback(() => {
    const resources = initAudioContext();
    return resources;
  }, [initAudioContext]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const resources = setupAudioResources();
      setAudioResources(resources);
    }
    return () => {
      cleanupAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanupAudio = useCallback(() => {
    if (audioResources) {
      audioResources.oscillators.forEach((osc) => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {
          console.warn('Errore durante la pulizia dell\'oscillatore:', e);
        }
      });
      audioResources.gains.forEach((gain) => gain.disconnect());
      if (audioCleanupRef.current) {
        audioCleanupRef.current();
        audioCleanupRef.current = null;
      }
      audioResources.context.close();
      setAudioResources(null);
    }
  }, [audioResources]);

  const playMelody = useCallback(async (isDemo: boolean = false) => {
    cleanupAudio();
    const resources = audioResources || setupAudioResources();
    if (!audioResources) setAudioResources(resources);

    await resources.context.resume();
    let startTime = resources.context.currentTime;
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
      // Aggiungiamo un buffer di 100ms al totalDuration per far completare la melodia
      const stopTimeout = setTimeout(() => {
        setIsPlaying(false);
        setPhase('replay');
        // Chiamo cleanupAudio dopo un breve ritardo per lasciare terminare l'audio
        setTimeout(() => cleanupAudio(), 100);
      }, totalDuration + 100);
      audioCleanupRef.current = () => clearTimeout(stopTimeout);
    }
  }, [audioResources, cleanupAudio, currentMelody, setupAudioResources, totalDuration]);

  const startDemo = useCallback(() => {
    setPhase('listen');
    playMelody(true);
  }, [playMelody]);

  const stopReplay = useCallback(() => {
    if (!startTimeRef.current || !audioResources) return;
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
  }, [audioResources, cleanupAudio, currentLevel, isLastLevel, onComplete, precisions, totalDuration]);

  const nextLevel = useCallback(() => {
    if (currentLevel < MELODIES.length - 1) {
      cleanupAudio();
      setCurrentLevel(prev => prev + 1);
      setPhase('start');
      setPrecision(100);
      setPrecisions([]);
    }
  }, [cleanupAudio, currentLevel]);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

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

        {phase === 'results' && currentLevel < MELODIES.length - 1 && (
          <button
            onClick={nextLevel}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium 
                     hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 
                     focus:ring-green-500 focus:ring-offset-2"
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
          <li>Ascolta attentamente la melodia di esempio</li>
          <li>Quando sei pronto, premi "Riproduci" per iniziare la tua riproduzione</li>
          <li>Premi "Stop" quando pensi che la melodia dovrebbe terminare</li>
          <li>La tua precisione sarà calcolata in base alla differenza temporale</li>
          <li>Completa tutti i livelli per migliorare il tuo punteggio finale</li>
        </ul>
      </div>
    </div>
  );
};

export default RhythmTest;

