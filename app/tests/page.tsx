case "results":
  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Risultati del Test</h2>
        <div className="space-y-6">
          {results.raven && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-6 h-6 text-blue-500" />
                <h3 className="font-bold">Ragionamento Astratto</h3>
              </div>
              <p>Punteggio: {Math.round(results.raven.score)}/1000</p>
              {results.raven.percentile && <p>Percentile: {results.raven.percentile}°</p>}
              <p>Type: {results.raven.type}</p> {/* Debug: verifica il type */}
            </div>
          )}
          {results.eyeHand && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-6 h-6 text-green-500" />
                <h3 className="font-bold">Coordinazione Visiva</h3>
              </div>
              <p>Punteggio: {Math.round(results.eyeHand.score)}</p>
              <p>Percentile: {Math.round(results.eyeHand.accuracy)}°</p>
              <p>Type: {results.eyeHand.type}</p> {/* Debug: verifica il type */}
            </div>
          )}
          {/* Aggiungi controlli simili per gli altri test */}
        </div>
        {/* Pulsanti per la navigazione */}
        {user ? (
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Torna alla Dashboard
          </button>
        ) : (
          <button
            onClick={() => router.push('/register')}
            className="mt-6 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Per vedere i risultati, iscriviti
          </button>
        )}
      </div>
    </div>
  );
