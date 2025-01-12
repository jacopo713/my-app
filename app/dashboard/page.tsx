type LeaderboardKey = 'global' | 'raven' | 'eyehand'; // Definisci un tipo per le chiavi valide

const Leaderboard = () => {
  const [selectedTest, setSelectedTest] = useState<LeaderboardKey>('global'); // Usa il tipo per selectedTest
  const [isOpen, setIsOpen] = useState(false);

  const testConfigs = [
    { id: 'global', label: 'Punteggio Globale', icon: Trophy },
    { id: 'raven', label: 'Ragionamento Astratto', icon: Brain },
    { id: 'eyehand', label: 'Coordinazione Visiva', icon: Eye },
    { id: 'stroop', label: 'Interferenza Cognitiva', icon: ActivitySquare },
    { id: 'speedreading', label: 'Lettura Veloce', icon: BookOpen },
    { id: 'memory', label: 'Memoria a Breve Termine', icon: Lightbulb },
    { id: 'schulte', label: 'Attenzione Visiva', icon: Eye },
    { id: 'rhythm', label: 'Coordinazione Ritmica', icon: Music }
  ];

  const selectedConfig = testConfigs.find(test => test.id === selectedTest);
  const SelectedIcon = selectedConfig?.icon || Trophy;

  const leaderboardData: Record<LeaderboardKey, { username: string; score: number; rank: number }[]> = {
    global: [
      { username: "Mario R.", score: 950, rank: 1 },
      { username: "Laura B.", score: 920, rank: 2 },
      { username: "Marco V.", score: 890, rank: 3 },
      { username: "Sofia M.", score: 860, rank: 4 },
      { username: "Luca P.", score: 830, rank: 5 }
    ],
    raven: [
      { username: "Paolo M.", score: 980, rank: 1 },
      { username: "Anna V.", score: 940, rank: 2 },
      { username: "Luca B.", score: 900, rank: 3 },
      { username: "Elena R.", score: 870, rank: 4 },
      { username: "Marco S.", score: 840, rank: 5 }
    ],
    eyehand: [
      { username: "Giulia T.", score: 960, rank: 1 },
      { username: "Marco L.", score: 930, rank: 2 },
      { username: "Sara P.", score: 880, rank: 3 },
      { username: "Andrea B.", score: 850, rank: 4 },
      { username: "Chiara M.", score: 820, rank: 5 }
    ]
  };

  const currentData = leaderboardData[selectedTest] || leaderboardData.global;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full mb-4 p-2 flex items-center justify-between border rounded-lg hover:bg-gray-50"
        >
          <div className="flex items-center gap-2">
            <SelectedIcon className="w-5 h-5 text-yellow-500" />
            <span className="font-bold">{selectedConfig?.label}</span>
          </div>
          <svg 
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
            {testConfigs.map((test) => {
              const Icon = test.icon;
              return (
                <button
                  key={test.id}
                  onClick={() => {
                    setSelectedTest(test.id as LeaderboardKey); // Assicurati che test.id sia di tipo LeaderboardKey
                    setIsOpen(false);
                  }}
                  className={`w-full p-2 flex items-center gap-2 hover:bg-gray-50 ${
                    selectedTest === test.id ? 'bg-gray-50' : ''
                  }`}
                >
                  <Icon className="w-5 h-5 text-yellow-500" />
                  <span>{test.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {currentData.map((entry) => (
          <div key={entry.rank} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <span className={`w-6 h-6 flex items-center justify-center rounded-full ${
                entry.rank === 1 ? 'bg-yellow-100 text-yellow-600' :
                entry.rank === 2 ? 'bg-gray-100 text-gray-600' :
                entry.rank === 3 ? 'bg-orange-100 text-orange-600' :
                'bg-blue-50 text-blue-600'
              } font-semibold`}>
                {entry.rank}
              </span>
              <span className="font-medium">{entry.username}</span>
            </div>
            <span className="font-semibold text-gray-700">{entry.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
