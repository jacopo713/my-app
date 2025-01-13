// ... (altre importazioni e codice)

export default function TestPage() {
  // ... (altri stati e funzioni)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      {/* ... (altro codice) */}

      {/* Contenuto principale con margine superiore e inferiore */}
      <div className="mt-16 mb-20">
        {renderCurrentPhase()}
      </div>

      {/* Pulsante fisso in basso per avviare il test */}
      {!testStarted && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-100 shadow-lg z-20">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => {
                if (phase === "intro") {
                  // Se siamo nella fase di introduzione, passa alla fase successiva (raven)
                  setPhase("raven");
                  setProgress(15); // Imposta il progresso al 15%
                } else if (!testStarted) {
                  // Se il test non è ancora iniziato, avvia il test corrente
                  setTestStarted(true);
                }
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 rounded-xl 
                font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:translate-y-px
                flex items-center justify-center gap-2"
            >
              <span className="text-lg">Inizia il Test</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Pulsante per passare velocemente alla fase successiva */}
      <button
        onClick={handleFastForward}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-30"
      >
        <FastForward className="w-6 h-6" />
      </button>

      {/* Messaggio di iscrizione (se necessario) */}
      {showSubscriptionPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Iscriviti per continuare</h2>
            <p className="text-gray-600 mb-6">
              Per accedere ai risultati completi dei test e alle funzionalità premium, iscriviti ora.
            </p>
            <button
              onClick={() => router.push('/register')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Iscriviti ora
            </button>
            <button
              onClick={() => setShowSubscriptionPrompt(false)}
              className="w-full mt-4 text-gray-600 hover:text-gray-800"
            >
              Continua senza iscrizione
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
