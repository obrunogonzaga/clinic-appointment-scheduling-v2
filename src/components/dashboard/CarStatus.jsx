import React from 'react';
import { Car } from 'lucide-react';

const CarStatus = () => {
  const mockEvents = {
    'CARRO 1': [
      { id: 1, patientName: 'Ana Costa Silva' },
      { id: 2, patientName: 'Elena Silva Castro' }
    ],
    'CARRO 2': [
      { id: 4, patientName: 'Bruno Santos Lima' }
    ],
    'CARRO 3': [
      { id: 6, patientName: 'Henrique Lima Santos' }
    ]
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h3 className="text-xl font-bold text-gray-800">Status dos Carros</h3>
          <div className="ml-3 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Utilização</p>
          <p className="text-lg font-bold text-green-600">75%</p>
        </div>
      </div>
      <div className="space-y-4">
        {Object.entries(mockEvents).map(([car, events]) => (
          <div key={car} className="group flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors duration-300">
                <Car className="text-green-600 group-hover:scale-110 transition-transform duration-300" size={20} />
              </div>
              <div>
                <p className="font-semibold text-gray-800">{car}</p>
                <p className="text-sm text-gray-600">{events.length} visitas agendadas</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-sm font-medium text-green-600">Ativo</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Em rota</p>
              </div>
            </div>
          </div>
        ))}
        
        {/* CARRO 4 - Inativo */}
        <div className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gray-200 rounded-lg group-hover:bg-gray-300 transition-colors duration-300">
              <Car className="text-gray-500 group-hover:scale-110 transition-transform duration-300" size={20} />
            </div>
            <div>
              <p className="font-semibold text-gray-600">CARRO 4</p>
              <p className="text-sm text-gray-500">0 visitas agendadas</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                <span className="text-sm font-medium text-gray-500">Inativo</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">Estacionado</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarStatus;