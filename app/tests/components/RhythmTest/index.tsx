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
  note: number;    // Frequenza della nota (0 per le pause)
  duration: number; // Durata in millisecondi
  gain?: number;   // Guadagno (volume) da riprodurre
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

// Definizione delle melodie con difficoltà crescente
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
  // Livello 4: Melodia con note più lunghe e pause più brevi
  [
    { note: 440, duration: 600, gain: 0.3 },
    { note: 0, duration: 100 },  // Pausa
    { note: 523.25, duration: 400, gain: 0.3 },
    { note: 659.25, duration: 500, gain: 0.3 },
    { note: 0, duration: 100 },  // Pausa
    { note: 783.99, duration: 600, gain: 0.3 },
  ],
  // Livello 5: Melodia con ritmo più veloce e pause più frequenti
  [
    { note: 440, duration: 200, gain: 0.3 },
    { note: 0, duration: 100 },  // Pausa
    { note: 523.25, duration: 300, gain: 0.3 },
    { note: 0, duration: 100 },  // Pausa
    { note: 659.25, duration: 400, gain: 0.3 },
    { note: 0, duration: 100 },  // Pausa
    { note: 783.99, duration: 500, gain: 0.3 },
  ],
  // Livello 6: Melodia con note più complesse e ritmo irregolare
  [
    { note: 440, duration: 300, gain: 0.3 },
    { note: 523.25, duration: 200, gain: 0.3 },
    { note: 659.25, duration: 400, gain: 0.3 },
    { note: 783.99, duration: 300, gain: 0.3 },
    { note: 659.25, duration: 200, gain: 0.3 },
    { note: 523.25, duration: 400, gain: 0.3 },
    { note: 440, duration: 300, gain: 0.3 },
  ],
  // Livello 7: Melodia con note più lunghe e pause più brevi
  [
    { note: 440, duration: 700, gain: 0.3 },
    { note: 0, duration: 50 },  // Pausa
    { note: 523.25, duration: 500, gain: 0.3 },
    { note: 659.25, duration: 600, gain: 0.3 },
    { note: 0, duration: 50 },  // Pausa
    { note: 783.99, duration: 700, gain: 0.3 },
  ],
  // Livello 8: Melodia con ritmo molto veloce e pause più brevi
  [
    { note: 440, duration: 150, gain: 0.3 },
    { note: 0, duration: 50 },  // Pausa
    { note: 523.25, duration: 200, gain: 0.3 },
    { note: 0, duration: 50 },  // Pausa
    { note: 659.25, duration: 250, gain: 0.3 },
    { note: 0, duration: 50 },  // Pausa
    { note: 783.99, duration: 300, gain: 0.3 },
  ],
  // Livello 9: Melodia con note molto complesse e ritmo irregolare
  [
    { note: 440, duration: 250, gain: 0.3 },
    { note: 523.25, duration: 150, gain: 0.3 },
    { note: 659.25, duration: 350, gain: 0.3 },
    { note: 783.99, duration: 200, gain: 0.3 },
    { note: 659.25, duration: 150, gain: 0.3 },
    { note: 523.25, duration: 300, gain: 0.3 },
    { note: 440, duration: 250, gain: 0.3 },
  ],
  // Livello 10: Melodia finale con ritmo molto complesso e pause brevi
  [
    { note: 440, duration: 200, gain: 0.3 },
    { note: 0, duration: 50 },  // Pausa
    { note: 523.25, duration: 150, gain: 0.3 },
    { note: 0, duration: 50 },  // Pausa
    { note: 659.25, duration: 300, gain: 0.3 },
    { note: 0, duration: 50 },  // Pausa
    { note: 783.99, duration: 200, gain: 0.3 },
    { note: 0, duration: 50 },  // Pausa
    { note: 659.25, duration: 150, gain: 0.3 },
    { note: 0, duration: 50 },  // Pausa
    { note: 523.25, duration: 250, gain: 0.3 },
  ]
];

const RhythmTest: React.FC<RhythmTestProps> = ({ onComplete }) => {
  // Stati del componente
  const [audioResources, setAudioResources] = useState<AudioResources | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [phase, setPhase] = useState<'start' | 'listen' | 'replay' | 'results'>('start');
  const [precision, setPrecision] = useState(100);
  const [pulseScale, setPulseScale] = useState(1);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [precisions, setPrecisions] = useState<number[]>([]);

  // Refs per gestione timing
  const startTimeRef = useRef<number | null>(null);
  const audioCleanupRef = useRef<(() => void) | null>(null);

  // Ottiene la melodia corrente e la sua durata
  const currentMelody = MELODIES[currentLevel];
  const totalDuration = currentMelody.reduce((acc, { duration }) => acc + duration, 0);
  const isLastLevel = currentLevel === MELODIES.length - 1;

  // Inizializzazione contesto audio
  const initAudioContext = useCallback((): AudioResources => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContextClass();
    const masterGain = context.createGain();
    masterGain.connect(context.destination);
    return {
      context,
      masterGain,
      oscillators: [],
      gains: [],
    };
  }, []);

  // Pulizia risorse audio
  const cleanupAudio = useCallback(() => {
    if (audioResources) {
      audioResources.oscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (e) {
          console.warn("Errore durante la pulizia dell'oscillatore:", e);
        }
      });
      audioResources.gains.forEach(gain => gain.disconnect());
      if (audioCleanupRef.current) {
        audioCleanupRef.current();
        audioCleanupRef.current = null;
      }
      audioResources.context.close();
      setAudioResources(null);
    }
  }, [audioResources]);

  // Riproduzione della melodia
  const playMelody = useCallback(async (isDemo: boolean = false) => {
    cleanupAudio();
    const resources = audioResources || initAudioContext();
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

      // Configurazione ADSR
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

      // Effetto visivo: incremento del pulse in corrispondenza della nota riprodotta
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
      // Per la modalità demo, al termine della melodia si passa alla fase "replay"
      const stopTimeout = setTimeout(() => {
        setIsPlaying(false);
        setPhase('replay');
        cleanupAudio();
      }, totalDuration);

      audioCleanupRef.current = () => clearTimeout(stopTimeout);
    }
  }, [audioResources, cleanupAudio, currentMelody, initAudioContext, totalDuration]);

  // Gestori eventi
  const startDemo = useCallback(() => {
    setPhase('listen');
    playMelody(true);
  }, [playMelody]);

  const stopReplay = useCallback(() => {
    if (!startTimeRef.current || !audioResources) return;

    const duration = performance.now() - startTimeRef.current;
    const deviation = Math.abs(duration - totalDuration);
    // Tolleranza ulteriormente ridotta: massimo errore accettato pari al 10% della durata totale
    const maxDeviation = totalDuration * 0.1;
    
    // Penalizzazione non lineare più marcata: usa esponente 2.5
    const calculatedPrecision = Math.max(0, 100 * (1 - Math.pow(deviation / maxDeviation, 2.5)));
    const finalPrecision = Math.min(Math.max(Math.round(calculatedPrecision), 0), 100);

    // Aggiungo il punteggio della riproduzione corrente ed aggiorno la media
    setPrecisions(prev => [...prev, finalPrecision]);
    const newPrecisions = [...precisions, finalPrecision];
    const averagePrecision = newPrecisions.reduce((a, b) => a + b, 0) / newPrecisions.length;
    setPrecision(averagePrecision);

    setIsPlaying(false);
    setPhase('results');
    cleanupAudio();

    // Se siamo all'ultimo livello, comunico il risultato finale
    if (isLastLevel) {
      onComplete({
        precision: averagePrecision,
        level: currentLevel
      });
    }
  }, [audioResources, cleanupAudio, currentLevel, isLastLevel, onComplete, precisions, totalDuration]);

  const nextLevel = useCallback(() => {
    if (!isLastLevel) {
      cleanupAudio();
      setCurrentLevel(prev => prev + 1);
      setPhase('start');
      setPrecision(100);
      setPrecisions([]);
    }
  }, [cleanupAudio, isLastLevel]);

  // Cleanup quando il componente viene smontato
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
          className={`absolute inset-0 border-4 rounded-full transition-all duration-100 ease-out ${
            isPlaying ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200'
          }`}
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

        {phase === 'results' && !isLastLevel && (
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
          isLastLevel
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
          <li>
            La precisione è calcolata in base alla differenza temporale con una tolleranza pari al 10%
            della durata totale e con una penalizzazione esponenziale (esponente 2.5)
          </li>
          <li>Completa tutti i livelli per migliorare il tuo punteggio finale</li>
        </ul>
      </div>
    </div>
  );
};

export default RhythmTest;

