<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
  {/* Test di Ragionamento */}
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-1 hover:rotate-1 relative overflow-hidden">
    <div className="absolute -top-4 -right-4 opacity-20">
      <Brain className="w-24 h-24 text-blue-200" />
    </div>
    <div className="flex items-center mb-3">
      <Brain className="w-10 h-10 text-blue-500" />
      <h2 className="text-2xl font-bold ml-3">Test di Ragionamento</h2>
    </div>
    <p className="text-gray-600 text-base">
      Valuta la tua capacità di risolvere problemi complessi
    </p>
  </div>

  {/* Test di Percezione */}
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-1 hover:rotate-1 relative overflow-hidden">
    <div className="absolute -top-4 -right-4 opacity-20">
      <Eye className="w-24 h-24 text-green-200" />
    </div>
    <div className="flex items-center mb-3">
      <Eye className="w-10 h-10 text-green-500" />
      <h2 className="text-2xl font-bold ml-3">Test di Percezione</h2>
    </div>
    <p className="text-gray-600 text-base">
      Misura la tua velocità di elaborazione visiva
    </p>
  </div>

  {/* Test di Memoria */}
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-2xl transition-all transform hover:-translate-y-1 hover:rotate-1 relative overflow-hidden">
    <div className="absolute -top-4 -right-4 opacity-20">
      <Star className="w-24 h-24 text-purple-200" />
    </div>
    <div className="flex items-center mb-3">
      <Star className="w-10 h-10 text-purple-500" />
      <h2 className="text-2xl font-bold ml-3">Test di Memoria</h2>
    </div>
    <p className="text-gray-600 text-base">
      Verifica le tue capacità di memoria e concentrazione
    </p>
  </div>
</div>
