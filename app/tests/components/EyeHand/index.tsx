// app/tests/components/EyeHand/index.tsx
'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import { Clock, Target } from "lucide-react";

interface Position {
  x: number;
  y: number;
}

interface Results {
  accuracy: number;
  averageDeviation: number;
  score: number;
}


const TimerDisplay = memo(({ seconds }: { seconds: number }) => {
  const [displayTime, setDisplayTime] = useState(seconds);

  useEffect(() => {
    setDisplayTime(seconds);
  }, [seconds]);

  const getTimerColor = () => {
    if (displayTime <= 5) return "text-red-500";
    if (displayTime <= 10) return "text-yellow-500";
    return "text-gray-700";
  };

  return (
    <div className="flex items-center gap-2">
      <Clock className={`w-5 h-5 ${getTimerColor()}`} />
      <span className={`font-mono font-semibold ${getTimerColor()}`}>
        {Math.floor(displayTime / 60)}:{(displayTime % 60).toString().padStart(2, "0")}
      </span>
    </div>
  );
});

TimerDisplay.displayName = "TimerDisplay";

const EyeHandTest: React.FC<EyeHandTestProps> = ({ onComplete }) => {
  const [gameState, setGameState] = useState({
    timer: 30,
    startTime: 0,
    isRunning: true,
  });

  const [position, setPosition] = useState<Position>({ x: 150, y: 150 });
  const [cursorPos, setCursorPos] = useState<Position>({ x: 0, y: 0 });
  const [currentPrecision, setCurrentPrecision] = useState<number>(0);
  const [deviations, setDeviations] = useState<number[]>([]);
  const [precisions, setPrecisions] = useState<number[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isTouch, setIsTouch] = useState(false);
  const [totalMeasurements, setTotalMeasurements] = useState(0);
  const [averagePrecision, setAveragePrecision] = useState(0);

  const requestRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTouchRef = useRef<Position | null>(null);
  const lastPrecisionRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const lastPositionRef = useRef<Position>(position);
  const precisionsRef = useRef<number[]>(precisions);
  const deviationsRef = useRef<number[]>(deviations);

  useEffect(() => {
    precisionsRef.current = precisions;
  }, [precisions]);

  useEffect(() => {
    deviationsRef.current = deviations;
  }, [deviations]);

  const calculateAveragePrecision = useCallback((precisionArray: number[]) => {
    if (precisionArray.length === 0) return 0;
    const sum = precisionArray.reduce((a, b) => a + b, 0);
    return sum / precisionArray.length;
  }, []);

  useEffect(() => {
    const newAverage = calculateAveragePrecision(precisions);
    setAveragePrecision(newAverage);
  }, [precisions, calculateAveragePrecision]);

  useEffect(() => {
    const detectMobile = () => {
      const isMobileDevice = 
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 ||
        /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };

    detectMobile();
    window.addEventListener('resize', detectMobile);
    return () => window.removeEventListener('resize', detectMobile);
  }, []);

  const calculatePrecision = useCallback((x: number, y: number): number => {
    if (!containerRef.current) return 0;

    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = Math.min(Math.max(0, x - rect.left), rect.width);
    const relativeY = Math.min(Math.max(0, y - rect.top), rect.height);

    const deviation = Math.sqrt(
      Math.pow(relativeX - position.x, 2) + Math.pow(relativeY - position.y, 2)
    );

    const baseRadius = isMobile ? 25 : 35;
    const normalizedDeviation = deviation / baseRadius;

    let precision: number;
    
    if (normalizedDeviation <= 1) {
      precision = 100 * (1 - normalizedDeviation * 0.6);
    } else {
      precision = Math.max(0, 40 * Math.exp(-(normalizedDeviation - 1) * 0.7));
    }

    precision = lastPrecisionRef.current * 0.3 + precision * 0.7;
    lastPrecisionRef.current = precision;

    return Math.max(0, Math.min(100, precision));
  }, [position, isMobile]);

  const handleMovement = useCallback((clientX: number, clientY: number) => {
    const now = Date.now();
    const minUpdateInterval = isMobile ? 24 : 16;
    if (now - lastUpdateRef.current < minUpdateInterval) return;
    lastUpdateRef.current = now;

    if (!containerRef.current || !gameState.isRunning) return;

    const rect = containerRef.current.getBoundingClientRect();
    const relativeX = Math.min(Math.max(0, clientX - rect.left), rect.width);
    const relativeY = Math.min(Math.max(0, clientY - rect.top), rect.height);

    const precision = calculatePrecision(clientX, clientY);
    
    setCursorPos({ x: relativeX, y: relativeY });
    setCurrentPrecision(precision);

    const minMovement = isMobile ? 2 : 1;
    if (precision > 0 && (
      Math.abs(relativeX - cursorPos.x) > minMovement || 
      Math.abs(relativeY - cursorPos.y) > minMovement
    )) {
      const deviation = Math.sqrt(
        Math.pow(relativeX - position.x, 2) + 
        Math.pow(relativeY - position.y, 2)
      );
      
      setDeviations(prev => [...prev, deviation]);
      setPrecisions(prev => [...prev, precision]);
      setTotalMeasurements(prev => prev + 1);
    }
  }, [calculatePrecision, position, cursorPos, isMobile, gameState.isRunning]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    setIsTouch(true);
    lastPrecisionRef.current = 0;
    handleMovement(touch.clientX, touch.clientY);
  }, [handleMovement]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length !== 1 || !lastTouchRef.current) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - lastTouchRef.current.x;
    const deltaY = touch.clientY - lastTouchRef.current.y;

    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
      handleMovement(touch.clientX, touch.clientY);
    }
  }, [handleMovement]);

  const handleTouchEnd = useCallback(() => {
    lastTouchRef.current = null;
    setIsTouch(false);
    lastPrecisionRef.current = 0;
    setCurrentPrecision(0);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMobile && !isTouch) {
      handleMovement(e.clientX, e.clientY);
    }
  }, [handleMovement, isMobile, isTouch]);

  const animateTarget = useCallback((timestamp: number) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const deltaTime = lastTimeRef.current ? (timestamp - lastTimeRef.current) * 0.001 : 0;
    lastTimeRef.current = timestamp;

    const elapsed = (timestamp - startTimeRef.current) * 0.001;
    
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const radius = Math.min(containerWidth, containerHeight) * 0.3;
    const centerX = containerWidth / 2;
    const centerY = containerHeight / 2;

    const targetX = centerX + Math.sin(elapsed) * radius;
    const targetY = centerY + Math.cos(elapsed) * radius;

    const smoothingFactor = isMobile ? Math.min(1, deltaTime * 12) : Math.min(1, deltaTime * 25);
    const newX = lastPositionRef.current.x + (targetX - lastPositionRef.current.x) * smoothingFactor;
    const newY = lastPositionRef.current.y + (targetY - lastPositionRef.current.y) * smoothingFactor;

    lastPositionRef.current = { x: newX, y: newY };
    setPosition(lastPositionRef.current);

    if (gameState.isRunning) {
      requestRef.current = requestAnimationFrame(animateTarget);
    }
  }, [isMobile, gameState.isRunning]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animateTarget);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animateTarget]);

  useEffect(() => {
    const timerWorker = new Worker(
      URL.createObjectURL(
        new Blob(
          [
            `
            let interval;
            self.onmessage = function(e) {
              if (e.data === 'start') {
                const startTime = Date.now();
                interval = setInterval(() => {
                  const elapsed = Math.floor((Date.now() - startTime) / 1000);
                  const remaining = Math.max(0, 30 - elapsed);
                  self.postMessage(remaining);
                  if (remaining <= 0) {
                    clearInterval(interval);
                  }
                }, 100);
              } else if (e.data === 'stop') {
                clearInterval(interval);
              }
            };
            `
          ],
          { type: 'application/javascript' }
        )
      )
    );

    timerWorker.onmessage = (e) => {
      setGameState(prev => ({ 
        ...prev, 
        timer: e.data,
        isRunning: e.data > 0 
      }));

      if (e.data <= 0) {
        const finalAveragePrecision = calculateAveragePrecision(precisionsRef.current);
        const validDeviations = deviationsRef.current.filter(d => d > 0);
        const averageDeviation = validDeviations.length > 0 
          ? validDeviations.reduce((a, b) => a + b, 0) / validDeviations.length 
          : 0;

        const score = finalAveragePrecision * 10;

        if (onComplete) {
          onComplete({
            accuracy: finalAveragePrecision,
            averageDeviation,
            score: score,
            type: 'eyehand', // Aggiungi il type in minuscolo
          });
        }
      }
    };

    if (gameState.isRunning) {
      timerWorker.postMessage('start');
    }

    return () => {
      timerWorker.postMessage('stop');
      timerWorker.terminate();
    };
  }, [calculateAveragePrecision, onComplete, gameState.isRunning]);

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-lg">
      <div className="flex flex-row items-center justify-between pb-4">
        <div className="text-2xl font-bold">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            Test di Coordinazione
          </div>
        </div>
        <TimerDisplay seconds={gameState.timer} />
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>Precisione Media: {averagePrecision.toFixed(1)}%</span>
          <span>Misurazioni: {totalMeasurements}</span>
        </div>
        
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-200 ease-out"
            style={{ 
              width: `${currentPrecision}%`,
              transitionProperty: 'width, background-color',
              transitionDuration: isMobile ? '300ms' : '200ms'
            }}
          />
        </div>
      </div>

      <div
        ref={containerRef}
        className="relative bg-white rounded-lg shadow-lg aspect-square w-full touch-none select-none"
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {gameState.isRunning && (
          <>
            <div
              className="absolute w-16 h-16 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 shadow-lg"
              style={{
                left: position.x,
                top: position.y,
                transition: isMobile ? 'transform 100ms ease-out' : 'none'
              }}
            />
            <div
              className="absolute w-20 h-20 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ 
                left: cursorPos.x, 
                top: cursorPos.y,
                opacity: isTouch ? 0.9 : 0.6,
                transition: isMobile ? 'all 100ms ease-out' : 'none'
              }}
            >
              <div className="w-full h-full border-4 border-blue-500 rounded-full" />
              <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </>
        )}
      </div>
    </div>
  );
};


export interface EyeHandTestProps {
  onComplete: (results: Results) => void;
}
export default EyeHandTest;

