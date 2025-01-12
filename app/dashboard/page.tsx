'use client';

import React, { useState } from 'react';
import { Brain, ChevronRight } from 'lucide-react';

const DailyTraining = () => {
  const [loadingExerciseId, setLoadingExerciseId] = useState(null);

  const exercises = [
    {
      id: 1,
      name: "Test di Stroop",
      description: "Migliora la tua resistenza all&apos;interferenza cognitiva", {/* eslint-disable-next-line react/no-unescaped-entities */}
<p>Migliora la tua resistenza all'interferenza cognitiva</p>
      duration: "10 minuti",
      priority: "Alta",
      result: "Resistenza Mentale: 780/1000"
    },
    {
      id: 2,
      name: "Memoria a Breve Termine",
      description: "Esercizi per potenziare la memoria di lavoro",
      duration: "15 minuti",
      priority: "Media",
      result: "Memoria Sequenziale: 650/1000"
    },
    {
      id: 3,
      name: "Attenzione Visiva",
      description: "Migliora la tua capacità di attenzione selettiva",
      duration: "12 minuti",
      priority: "Mantieni",
      result: "Concentrazione: 820/1000"
    }
  ];

  const startExercise = (exerciseId) => {
    setLoadingExerciseId(exerciseId);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-500" />
          Allenamento Personalizzato del Giorno
        </h2>
      </div>
      <div className="space-y-4">
        {exercises.map((exercise) => (
          <div key={exercise.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{exercise.name}</h3>
                <p className="text-gray-600">{exercise.description}</p>
                <div className="flex gap-4 mt-2 text-sm items-center">
                  <span className="text-gray-500">⏱ {exercise.duration}</span>
                  <span className={`${
                    exercise.priority === 'Alta' ? 'text-red-500' :
                    exercise.priority === 'Media' ? 'text-yellow-500' :
                    'text-gray-500'
                  }`}>
                    {exercise.priority === 'Mantieni' ? 'Mantieni' : `Priorità: ${exercise.priority}`}
                  </span>
                  <span className="text-blue-600 text-xs">
                    {exercise.result}
                  </span>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0 min-w-[200px] flex justify-end">
                {loadingExerciseId === exercise.id ? (
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="animate-pulse">
                      L'algoritmo sta elaborando...
                    </span>
                  </div>
                ) : (
                  <button 
                    onClick={() => startExercise(exercise.id)}
                    className="px-4 py-2 border rounded-lg flex items-center gap-1 hover:bg-gray-50"
                  >
                    Inizia
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const mockUser = {
    displayName: "Mario Rossi",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Ciao, {mockUser.displayName}!
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DailyTraining />
          </div>
        </div>
      </div>
    </div>
  );
}
