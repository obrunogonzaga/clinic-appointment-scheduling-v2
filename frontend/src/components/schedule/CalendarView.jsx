import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Phone, User, FileText, Car, Calendar, ArrowLeft, RotateCcw, Move, Edit3, Save, X, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CalendarView = ({ processedData, onBack }) => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [draggedPatient, setDraggedPatient] = useState(null);
  const [scheduleData, setScheduleData] = useState(processedData);
  const [hasChanges, setHasChanges] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedPatient, setEditedPatient] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Track if schedule has been modified
  useEffect(() => {
    setHasChanges(JSON.stringify(scheduleData) !== JSON.stringify(processedData));
  }, [scheduleData, processedData]);


  if (!processedData || !processedData.cars || typeof processedData.cars !== 'object' || Object.keys(processedData.cars).length === 0) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="w-12 h-12 text-red-500 mr-3" />
            <h2 className="text-2xl font-bold text-gray-800">
              Nenhum Dado Disponível
            </h2>
          </div>
          <p className="text-gray-600 mb-4">
            {processedData?.errors > 0 
              ? 'Erro ao processar o arquivo. Verifique o formato e tente novamente.'
              : 'Nenhum agendamento foi encontrado no arquivo processado.'
            }
          </p>
          {processedData?.issues && processedData.issues.length > 0 && (
            <div className="mt-4 space-y-2">
              {processedData.issues.filter(issue => issue.type === 'error').map((issue, index) => (
                <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3 text-left">
                  <div className="flex items-center text-red-800">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span className="text-sm font-medium">{issue.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={onBack}
            className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar ao Upload
          </button>
        </div>
      </div>
    );
  }

  const cars = Object.keys(processedData.cars || {});
  const timeSlots = generateTimeSlots();

  const getPatientAtTime = (carNumber, timeSlot) => {
    const carData = scheduleData.cars[carNumber];
    
    // Ensure carData is an array
    if (!Array.isArray(carData)) {
      return null;
    }
    
    return carData.find(patient => {
      const patientTime = patient.time;
      return patientTime === timeSlot;
    });
  };

  // Drag and Drop handlers
  const handleDragStart = (e, patient, sourceCarNumber) => {
    setDraggedPatient({ patient, sourceCarNumber });
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
    e.target.style.opacity = '0.7';
    e.target.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    e.target.classList.remove('dragging');
    setDraggedPatient(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetCarNumber, targetTimeSlot) => {
    e.preventDefault();
    
    if (!draggedPatient) return;
    
    const { patient, sourceCarNumber } = draggedPatient;
    
    // Don't allow dropping on occupied slots
    const existingPatient = getPatientAtTime(targetCarNumber, targetTimeSlot);
    if (existingPatient && existingPatient.id !== patient.id) {
      toast.error('Este horário já está ocupado!');
      return;
    }
    
    // Don't allow dropping on the same slot
    if (sourceCarNumber === targetCarNumber && patient.time === targetTimeSlot) {
      return;
    }
    
    // Update the schedule data
    const newScheduleData = { ...scheduleData };
    
    // Remove patient from source car
    newScheduleData.cars[sourceCarNumber] = newScheduleData.cars[sourceCarNumber].filter(
      p => p.id !== patient.id
    );
    
    // Add patient to target car with new time
    const updatedPatient = { ...patient, time: targetTimeSlot };
    if (!newScheduleData.cars[targetCarNumber]) {
      newScheduleData.cars[targetCarNumber] = [];
    }
    newScheduleData.cars[targetCarNumber].push(updatedPatient);
    
    setScheduleData(newScheduleData);
    setDraggedPatient(null);
    
    // Show success toast
    const carChange = sourceCarNumber !== targetCarNumber;
    const timeChange = patient.time !== targetTimeSlot;
    
    if (carChange && timeChange) {
      toast.success(`${patient.patientName} movido para ${targetCarNumber} às ${targetTimeSlot}`);
    } else if (carChange) {
      toast.success(`${patient.patientName} movido para ${targetCarNumber}`);
    } else if (timeChange) {
      toast.success(`Horário de ${patient.patientName} alterado para ${targetTimeSlot}`);
    }
  };

  const handleSlotDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drop-zone-active');
  };

  const handleSlotDragLeave = (e) => {
    e.currentTarget.classList.remove('drop-zone-active');
  };

  const handleReset = () => {
    setScheduleData(processedData);
    setHasChanges(false);
    toast.success('Agenda restaurada para o estado original');
  };

  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    setEditedPatient({ ...patient });
    setEditMode(false);
  };

  const handleEditMode = () => {
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      // Update the patient in the schedule data
      const newScheduleData = { ...scheduleData };
      Object.keys(newScheduleData.cars).forEach(carNumber => {
        const carData = newScheduleData.cars[carNumber];
        const patientIndex = carData.findIndex(p => p.id === editedPatient.id);
        if (patientIndex !== -1) {
          carData[patientIndex] = { ...editedPatient };
        }
      });
      
      setScheduleData(newScheduleData);
      setSelectedPatient(editedPatient);
      setEditMode(false);
      toast.success(`Dados de ${editedPatient.patientName} atualizados`);
    } catch (error) {
      toast.error('Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedPatient({ ...selectedPatient });
    setEditMode(false);
  };

  const handleDeletePatient = async () => {
    if (window.confirm('Tem certeza que deseja remover este agendamento?')) {
      setDeleting(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      try {
        const patientName = selectedPatient.patientName;
        const newScheduleData = { ...scheduleData };
        Object.keys(newScheduleData.cars).forEach(carNumber => {
          newScheduleData.cars[carNumber] = newScheduleData.cars[carNumber].filter(
            p => p.id !== selectedPatient.id
          );
        });
        
        setScheduleData(newScheduleData);
        setSelectedPatient(null);
        setEditMode(false);
        toast.success(`Agendamento de ${patientName} removido`);
      } catch (error) {
        toast.error('Erro ao remover agendamento');
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleConfirmPatient = async () => {
    setConfirming(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const newScheduleData = { ...scheduleData };
      Object.keys(newScheduleData.cars).forEach(carNumber => {
        const carData = newScheduleData.cars[carNumber];
        const patientIndex = carData.findIndex(p => p.id === selectedPatient.id);
        if (patientIndex !== -1) {
          carData[patientIndex] = { 
            ...carData[patientIndex], 
            status: 'Confirmado' 
          };
        }
      });
      
      setScheduleData(newScheduleData);
      setSelectedPatient({ ...selectedPatient, status: 'Confirmado' });
      toast.success(`${selectedPatient.patientName} confirmado com sucesso`);
    } catch (error) {
      toast.error('Erro ao confirmar paciente');
    } finally {
      setConfirming(false);
    }
  };

  const closeModal = () => {
    setSelectedPatient(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors btn-interactive"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Voltar
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Agenda de Coletas
              </h1>
              <p className="text-gray-600">
                {Object.values(scheduleData.cars).flat().length} agendamentos em {cars.length} carros
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {hasChanges && (
              <button
                onClick={handleReset}
                className="flex items-center px-3 py-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors btn-interactive"
                title="Desfazer alterações"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Desfazer
              </button>
            )}
            
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

      {/* Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-6 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
        <div className="flex items-center">
          <Move className="w-5 h-5 text-blue-600 mr-3" />
          <div>
            <h3 className="text-blue-800 font-medium">Arrastar e Soltar</h3>
            <p className="text-blue-600 text-sm">
              Clique e arraste os pacientes para reorganizar entre carros e horários. 
              {hasChanges && <span className="font-medium"> Você tem alterações não salvas.</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 card-hover animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center">
            <Car className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-blue-800 font-semibold">{cars.length}</p>
              <p className="text-blue-600 text-sm">Carros Ativos</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 card-hover animate-fade-in-up" style={{animationDelay: '0.3s'}}>
          <div className="flex items-center">
            <User className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-green-800 font-semibold">{Object.values(scheduleData.cars).flat().length}</p>
              <p className="text-green-600 text-sm">Pacientes</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 card-hover animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-yellow-800 font-semibold">
                {Math.round(Object.values(scheduleData.cars).flat().length * 40 / 60)}h
              </p>
              <p className="text-yellow-600 text-sm">Tempo Total</p>
            </div>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 card-hover animate-fade-in-up" style={{animationDelay: '0.5s'}}>
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
      <div className="bg-white rounded-lg shadow-md overflow-hidden animate-fade-in-up" style={{animationDelay: '0.6s'}}>
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
                    {(scheduleData.cars[carNumber] || []).length} pacientes
                  </div>
                </div>
              </div>

              {/* Time Slots */}
              {timeSlots.map((slot) => {
                const patient = getPatientAtTime(carNumber, slot);
                return (
                  <div
                    key={`${carNumber}-${slot}`}
                    className="h-20 border-b border-gray-100 p-2 relative transition-colors duration-200"
                    onDragOver={handleSlotDragOver}
                    onDragLeave={handleSlotDragLeave}
                    onDrop={(e) => handleDrop(e, carNumber, slot)}
                  >
                    {patient ? (
                      <div
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, patient, carNumber)}
                        onDragEnd={handleDragEnd}
                        className="bg-blue-100 hover:bg-blue-200 border border-blue-300 rounded-lg p-2 h-full cursor-move transition-all duration-200 hover:shadow-md card-hover"
                        onClick={() => handlePatientClick(patient)}
                        title="Arrastar para mover para outro carro/horário"
                      >
                        <div className="text-xs font-medium text-blue-800 truncate">
                          {patient.patientName}
                        </div>
                        <div className="text-xs text-blue-600 mt-1 flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span className="truncate">{patient.address}</span>
                        </div>
                        <div className="text-xs text-blue-500 mt-1 flex items-center justify-between">
                          <span>{patient.exams.length} exames</span>
                          <span className="text-gray-400">⋮⋮</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-300 text-xs border-2 border-dashed border-transparent rounded-lg transition-all duration-200">
                        <span className="opacity-0 group-hover:opacity-100">
                          Soltar aqui
                        </span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9000] p-4 animate-fade-in-scale">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto animate-fade-in-scale">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {editMode ? 'Editar Paciente' : 'Detalhes do Paciente'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do Paciente
                    </label>
                    {editMode ? (
                      <input
                        type="text"
                        value={editedPatient.patientName}
                        onChange={(e) => setEditedPatient({...editedPatient, patientName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
                      />
                    ) : (
                      <div className="flex items-center text-gray-800">
                        <User className="w-4 h-4 mr-2 text-gray-500" />
                        {selectedPatient.patientName}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horário
                    </label>
                    {editMode ? (
                      <input
                        type="time"
                        value={editedPatient.time}
                        onChange={(e) => setEditedPatient({...editedPatient, time: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
                      />
                    ) : (
                      <div className="flex items-center text-gray-800">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        {selectedPatient.time} ({selectedPatient.duration} min)
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefone
                    </label>
                    {editMode ? (
                      <input
                        type="tel"
                        value={editedPatient.phone || ''}
                        onChange={(e) => setEditedPatient({...editedPatient, phone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
                        placeholder="(XX) XXXXX-XXXX"
                      />
                    ) : (
                      <div className="flex items-center text-gray-800">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        {selectedPatient.phone || 'Não informado'}
                      </div>
                    )}
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
                  {editMode ? (
                    <textarea
                      value={editedPatient.address || ''}
                      onChange={(e) => setEditedPatient({...editedPatient, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
                      rows="2"
                    />
                  ) : (
                    <div className="flex items-center text-gray-800">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      {selectedPatient.address}
                    </div>
                  )}
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
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedPatient.status === 'Confirmado' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedPatient.status}
                    </span>
                    {selectedPatient.status !== 'Confirmado' && !editMode && (
                      <button
                        onClick={handleConfirmPatient}
                        disabled={confirming || saving || deleting}
                        className="flex items-center px-3 py-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed btn-interactive"
                      >
                        {confirming ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        )}
                        {confirming ? 'Confirmando...' : 'Confirmar'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-between">
                <div className="flex space-x-2">
                  {!editMode && (
                    <button
                      onClick={handleDeletePatient}
                      disabled={deleting || saving || confirming}
                      className="flex items-center px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed btn-interactive"
                    >
                      {deleting ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      {deleting ? 'Removendo...' : 'Remover'}
                    </button>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  {editMode ? (
                    <>
                      <button
                        onClick={handleCancelEdit}
                        disabled={saving}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed btn-interactive"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed btn-interactive"
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {saving ? 'Salvando...' : 'Salvar'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={closeModal}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors btn-interactive"
                      >
                        Fechar
                      </button>
                      <button
                        onClick={handleEditMode}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors btn-interactive"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Editar
                      </button>
                    </>
                  )}
                </div>
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