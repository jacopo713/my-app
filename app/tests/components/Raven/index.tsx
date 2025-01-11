{results.raven && (
  <div className="p-4 bg-blue-50 rounded-lg">
    <div className="flex items-center gap-2 mb-2">
      <Brain className="w-6 h-6 text-blue-500" />
      <h3 className="font-bold">Ragionamento Astratto</h3>
    </div>
    <p>Punteggio: {Math.round(results.raven.score)}/1000</p>
    {results.raven.percentile && (
      <p>Percentile: {Math.round(results.raven.percentile)}°</p>
    )}
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
  </div>
)}
