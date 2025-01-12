import TestProgressChart from '@/app/dashboard/TestProgressChart';

const DashboardPage = () => {
  const testResults = [
    { score: 750, accuracy: 85, percentile: 85 },
    { score: 820, accuracy: 92, averageDeviation: 0.15 },
    { score: 680, percentile: 75, interferenceScore: 0.25 },
    { wpm: 450, percentile: 88 },
    { score: 890, percentile: 92, evaluation: "Eccellente" },
    { score: 780, averageTime: 15.2, percentile: 82 },
    { precision: 95, level: 8 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <TestProgressChart data={testResults} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
