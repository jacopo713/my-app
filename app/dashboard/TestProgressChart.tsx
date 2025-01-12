// app/components/dashboard/TestProgressChart.tsx
'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TestResult {
  score?: number;
  accuracy?: number;
  timestamp?: string;
}

interface TestProgressChartProps {
  data: TestResult[];
}

export default function TestProgressChart({ data }: TestProgressChartProps) {
  // Formatta i dati per il grafico
  const chartData = data.map((test) => ({
    date: test.timestamp ? new Date(test.timestamp).toLocaleDateString() : 'N/A',
    score: test.score || 0,
    accuracy: test.accuracy || 0,
  }));

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="accuracy" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
