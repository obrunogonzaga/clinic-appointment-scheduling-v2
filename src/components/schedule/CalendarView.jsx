import React, { useState } from 'react';
import { Clock, MapPin, Phone, User, FileText, Car, Calendar, ArrowLeft } from 'lucide-react';

const CalendarView = ({ processedData, onBack }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);


  if (!processedData || !processedData.cars || typeof processedData.cars !== 'object') {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Agenda - Visualização
          </h2>
          <p className="text-gray-600">
            Nenhum dado processado disponível para visualização.
          </p>
        </div>
      </div>
    );
  }

  const cars = Object.keys(processedData.cars || {});
  const timeSlots = generateTimeSlots();

  const getPatientAtTime = (carNumber, timeSlot) => {
    const carData = processedData.cars[carNumber];
    
    // Ensure carData is an array
    if (!Array.isArray(carData)) {
      return null;
    }
    
    return carData.find(patient => {
      const patientTime = patient.time;
      return patientTime === timeSlot;
    });
  };

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
  };

  const closeModal = () => {
    setSelectedPatient(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Agenda de Coletas
              </h1>
              <p className="text-gray-600">
                {processedData.validRecords} agendamentos em {cars.length} carros
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
              <div className="flex items-center text-blue-800">
                <Calendar className="w-5 h-5 mr-2" />
                <span className="font-medium">
                  {new Date().toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Car className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-blue-800 font-semibold">{cars.length}</p>
              <p className="text-blue-600 text-sm">Carros Ativos</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <User className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-green-800 font-semibold">{processedData.validRecords}</p>
              <p className="text-green-600 text-sm">Pacientes</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-yellow-800 font-semibold">
                {Math.round(processedData.validRecords * 40 / 60)}h
              </p>
              <p className="text-yellow-600 text-sm">Tempo Total</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-purple-800 font-semibold">{processedData.warnings + processedData.errors}</p>
              <p className="text-purple-600 text-sm">Avisos/Erros</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-5 min-h-96">
          {/* Time Column */}
          <div className="bg-gray-50 border-r border-gray-200">
            <div className="h-16 border-b border-gray-200 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">Horário</span>
            </div>
            {timeSlots.map((slot) => (
              <div
                key={slot}
                className="h-20 border-b border-gray-100 flex items-center justify-center text-sm text-gray-600"
              >
                {slot}
              </div>
            ))}
          </div>

          {/* Car Columns */}
          {cars.map((carNumber) => (
            <div key={carNumber} className="border-r border-gray-200 last:border-r-0">
              {/* Car Header */}
              <div className="h-16 bg-blue-50 border-b border-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="flex items-center text-blue-800 font-semibold">
                    <Car className="w-4 h-4 mr-2" />
                    {carNumber}
                  </div>
                  <div className="text-xs text-blue-600">
                    {processedData.cars[carNumber].length} pacientes
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              {timeSlots.map((slot) => {
                const patient = getPatientAtTime(carNumber, slot);
                return (
                  <div
                    key={`${carNumber}-${slot}`}
                    className="h-20 border-b border-gray-100 p-2 relative"
                  >
                    {patient && (
                      <div
                        className="bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-lg p-2 h-full cursor-pointer transition-all duration-200 hover:shadow-md"
                        onClick={() => handlePatientClick(patient)}
                      >
                        <div className="text-xs font-medium text-blue-800 truncate">
                          {patient.patientName}
                        </div>
                        <div className="text-xs text-blue-600 mt-1 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate">{patient.address}</span>
                        </div>
                        <div className="text-xs text-blue-500 mt-1">
                          {patient.exams.length} exames
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Patient Details Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Detalhes do Paciente
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Paciente
                    </label>
                    <div className="flex items-center text-gray-800">
                      <User className="w-4 h-4 mr-2 text-gray-500" />
                      {selectedPatient.patientName}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horário
                    </label>
                    <div className="flex items-center text-gray-800">
                      <Clock className="w-4 h-4 mr-2 text-gray-500" />
                      {selectedPatient.time} ({selectedPatient.duration} min)
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    <div className="flex items-center text-gray-800">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      {selectedPatient.phone || 'Não informado'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CPF
                    </label>
                    <div className="flex items-center text-gray-800">
                      <FileText className="w-4 h-4 mr-2 text-gray-500" />
                      {selectedPatient.cpf || 'Não informado'}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <div className="flex items-center text-gray-800">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    {selectedPatient.address}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exames ({selectedPatient.exams.length})
                  </label>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex flex-wrap gap-2">
                      {selectedPatient.exams.map((exam, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {exam}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedPatient.status === 'Confirmado' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedPatient.status}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Fechar
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Editar Agendamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Generate time slots from 7:00 to 18:00
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 7; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  return slots;
};

export default CalendarView;