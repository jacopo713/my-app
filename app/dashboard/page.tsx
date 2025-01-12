'use client';

import React, { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';
import TestProgressChart from '@/app/dashboard/TestProgressChart';
import { useAuth } from '@/app/contexts/AuthContext';
import { getAllUserTests } from '@/app/lib/firebase';
import ProtectedRoute from '@/app/components/auth/ProtectedRoute';

// Componente Modal per visualizzare i risultati
const StatsModal = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-4xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <TestProgressChart data={data} />
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestResults = async () => {
      if (user) {
        try {
          const results = await getAllUserTests(user.uid);
          setTestResults(results.map(result => ({
            ...result,
            type: result.type || result.id.replace('Test', '').toLowerCase(),
          })));
        } catch (error) {
          console.error('Error fetching test results:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchTestResults();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <div className="text-lg text-gray-600">Caricamento risultati...</div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Ciao, {user?.displayName || 'User'}!
            </h1>
            <button 
              onClick={() => setShowResults(true)}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 shadow-sm transition-colors"
            >
              <Brain className="w-5 h-5 text-blue-500" />
              <span className="font-medium">Vedi i tuoi livelli cognitivi</span>
            </button>
          </div>

          <div className="mb-8">
            <TestProgressChart data={testResults} />
          </div>

          {/* Modal per visualizzare i risultati */}
          <StatsModal 
            isOpen={showResults}
            onClose={() => setShowResults(false)}
            data={testResults}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
