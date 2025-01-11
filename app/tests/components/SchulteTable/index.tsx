import { useState, useEffect, useCallback } from "react";
import { Clock } from "lucide-react";

export default function SchulteTable({ onComplete }: SchulteTableProps) {
  // ... [Stati e logica precedente rimangono invariati]

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-4">
        {showInstructions ? (
          <div className="space-y-6">
            {/* ... Contenuto istruzioni invariato ... */}
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

            <div className="w-9/12 mx-auto">
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
