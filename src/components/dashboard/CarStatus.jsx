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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Status dos Carros</h3>
      <div className="space-y-4">
        {Object.entries(mockEvents).map(([car, events]) => (
          <div key={car} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Car className="text-gray-600" size={20} />
              <div>
                <p className="font-medium">{car}</p>
                <p className="text-sm text-gray-500">{events.length} visitas agendadas</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-sm text-green-600">Ativo</span>
            </div>
          </div>
        ))}
        
        {/* CARRO 4 - Inativo */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Car className="text-gray-400" size={20} />
            <div>
              <p className="font-medium text-gray-500">CARRO 4</p>
              <p className="text-sm text-gray-400">0 visitas agendadas</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
            <span className="text-sm text-gray-500">Inativo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarStatus;