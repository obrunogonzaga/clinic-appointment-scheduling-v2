import React, { useState } from 'react';
import { 
  CheckSquare, Square, CheckCircle, X, Send, Phone, 
  Calendar, Car, MapPin, Download, Upload, Filter,
  Users, MessageSquare, Mail, Loader2, AlertTriangle,
  FileText, Clock, Search, ChevronDown, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

const BulkOperations = ({ patients = [], onBulkAction, onPatientUpdate }) => {
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [operation, setOperation] = useState('');
  const [operationData, setOperationData] = useState({});
  const [processing, setProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [filterCriteria, setFilterCriteria] = useState({
    status: 'all',
    car: 'all',
    confirmationRate: 'all',
    riskScore: 'all',
    dateRange: 'all'
  });

  // Available bulk operations
  const bulkOperations = {
    confirm_all: {
      label: 'Confirmar Coletas',
      description: 'Confirmar coletas selecionadas em massa',
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100',
      requiresData: false
    },
    send_sms: {
      label: 'Enviar SMS',
      description: 'Enviar SMS para pacientes selecionados',
      icon: MessageSquare,
      color: 'text-blue-600 bg-blue-100',
      requiresData: true
    },
    send_whatsapp: {
      label: 'Enviar WhatsApp',
      description: 'Enviar WhatsApp para pacientes selecionados',
      icon: Send,
      color: 'text-green-600 bg-green-100',
      requiresData: true
    },
    make_calls: {
      label: 'Programar Ligações',
      description: 'Programar ligações para os pacientes',
      icon: Phone,
      color: 'text-purple-600 bg-purple-100',
      requiresData: true
    },
    reschedule: {
      label: 'Reagendar Coletas',
      description: 'Reagendar coletas em massa',
      icon: Calendar,
      color: 'text-orange-600 bg-orange-100',
      requiresData: true
    },
    reassign_car: {
      label: 'Reatribuir Carro',
      description: 'Alterar carro atribuído para coletas',
      icon: Car,
      color: 'text-indigo-600 bg-indigo-100',
      requiresData: true
    },
    export_data: {
      label: 'Exportar Dados',
      description: 'Exportar dados dos pacientes selecionados',
      icon: Download,
      color: 'text-gray-600 bg-gray-100',
      requiresData: true
    },
    update_tags: {
      label: 'Atualizar Tags',
      description: 'Adicionar ou remover tags em massa',
      icon: Settings,
      color: 'text-yellow-600 bg-yellow-100',
      requiresData: true
    }
  };

  // Filter patients based on criteria
  const getFilteredPatients = () => {
    return patients.filter(patient => {
      if (filterCriteria.status !== 'all' && patient.status !== filterCriteria.status) {
        return false;
      }
      
      if (filterCriteria.car !== 'all' && patient.assignedCar !== filterCriteria.car) {
        return false;
      }
      
      if (filterCriteria.confirmationRate !== 'all') {
        const rate = patient.confirmationTracking?.confirmationRate || 0;
        if (filterCriteria.confirmationRate === 'high' && rate <= 0.9) return false;
        if (filterCriteria.confirmationRate === 'medium' && (rate < 0.6 || rate > 0.9)) return false;
        if (filterCriteria.confirmationRate === 'low' && rate >= 0.6) return false;
      }
      
      if (filterCriteria.riskScore !== 'all' && patient.analytics?.riskScore !== filterCriteria.riskScore) {
        return false;
      }
      
      if (filterCriteria.dateRange !== 'all') {
        const today = new Date();
        const scheduleDate = patient.nextScheduledDate ? new Date(patient.nextScheduledDate) : null;
        
        if (filterCriteria.dateRange === 'today') {
          if (!scheduleDate || scheduleDate.toDateString() !== today.toDateString()) return false;
        } else if (filterCriteria.dateRange === 'week') {
          const weekFromNow = new Date(today);
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          if (!scheduleDate || scheduleDate < today || scheduleDate > weekFromNow) return false;
        }
      }
      
      return true;
    });
  };

  const filteredPatients = getFilteredPatients();

  // Handle patient selection
  const handlePatientSelect = (patientId, selected) => {
    if (selected) {
      setSelectedPatients([...selectedPatients, patientId]);
    } else {
      setSelectedPatients(selectedPatients.filter(id => id !== patientId));
    }
  };

  // Select all filtered patients
  const handleSelectAll = () => {
    const allIds = filteredPatients.map(p => p.id);
    const isAllSelected = allIds.every(id => selectedPatients.includes(id));
    
    if (isAllSelected) {
      setSelectedPatients(selectedPatients.filter(id => !allIds.includes(id)));
    } else {
      setSelectedPatients([...new Set([...selectedPatients, ...allIds])]);
    }
  };

  // Select by criteria
  const handleSelectByCriteria = (criteria) => {
    let criteriaPatients = [];
    
    switch (criteria) {
      case 'pending':
        criteriaPatients = filteredPatients.filter(p => p.status === 'pending');
        break;
      case 'high_risk':
        criteriaPatients = filteredPatients.filter(p => p.analytics?.riskScore === 'high');
        break;
      case 'low_confirmation':
        criteriaPatients = filteredPatients.filter(p => 
          (p.confirmationTracking?.confirmationRate || 0) < 0.6
        );
        break;
      case 'today':
        const today = new Date().toDateString();
        criteriaPatients = filteredPatients.filter(p => 
          p.nextScheduledDate && new Date(p.nextScheduledDate).toDateString() === today
        );
        break;
    }
    
    const newIds = criteriaPatients.map(p => p.id);
    setSelectedPatients([...new Set([...selectedPatients, ...newIds])]);
  };

  // Execute bulk operation
  const handleExecuteOperation = async () => {
    if (!operation) {
      toast.error('Selecione uma operação');
      return;
    }
    
    if (selectedPatients.length === 0) {
      toast.error('Selecione pelo menos um paciente');
      return;
    }
    
    const operationConfig = bulkOperations[operation];
    if (operationConfig.requiresData && !validateOperationData()) {
      return;
    }
    
    setProcessing(true);
    
    try {
      // Simulate operation execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call bulk action handler
      if (onBulkAction) {
        await onBulkAction(selectedPatients, operation, operationData);
      }
      
      toast.success(`${operationConfig.label} executado para ${selectedPatients.length} pacientes`);
      
      // Reset form
      setSelectedPatients([]);
      setOperation('');
      setOperationData({});
      setShowPreview(false);
    } catch (error) {
      toast.error('Erro ao executar operação');
    } finally {
      setProcessing(false);
    }
  };

  // Validate operation data
  const validateOperationData = () => {
    switch (operation) {
      case 'send_sms':
      case 'send_whatsapp':
        if (!operationData.message) {
          toast.error('Digite a mensagem');
          return false;
        }
        break;
      case 'reschedule':
        if (!operationData.newDate || !operationData.newTime) {
          toast.error('Selecione a nova data e horário');
          return false;
        }
        break;
      case 'reassign_car':
        if (!operationData.newCar) {
          toast.error('Selecione o novo carro');
          return false;
        }
        break;
      case 'export_data':
        if (!operationData.format) {
          toast.error('Selecione o formato de exportação');
          return false;
        }
        break;
    }
    return true;
  };

  // Render operation configuration
  const renderOperationConfig = () => {
    if (!operation || !bulkOperations[operation].requiresData) return null;
    
    switch (operation) {
      case 'send_sms':
      case 'send_whatsapp':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensagem
              </label>
              <textarea
                value={operationData.message || ''}
                onChange={(e) => setOperationData({...operationData, message: e.target.value})}
                placeholder="Digite a mensagem..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modelo
              </label>
              <select
                value={operationData.template || ''}
                onChange={(e) => {
                  const templates = {
                    reminder: 'Lembrete: Sua coleta está agendada para {data} às {hora}.',
                    confirmation: 'Sua coleta foi confirmada para {data} às {hora}.',
                    reschedule: 'Sua coleta foi reagendada para {data} às {hora}.'
                  };
                  setOperationData({
                    ...operationData, 
                    template: e.target.value,
                    message: templates[e.target.value] || ''
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Mensagem personalizada</option>
                <option value="reminder">Lembrete de coleta</option>
                <option value="confirmation">Confirmação</option>
                <option value="reschedule">Reagendamento</option>
              </select>
            </div>
          </div>
        );
        
      case 'reschedule':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nova Data
              </label>
              <input
                type="date"
                value={operationData.newDate || ''}
                onChange={(e) => setOperationData({...operationData, newDate: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Novo Horário
              </label>
              <input
                type="time"
                value={operationData.newTime || ''}
                onChange={(e) => setOperationData({...operationData, newTime: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );
        
      case 'reassign_car':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Novo Carro
            </label>
            <select
              value={operationData.newCar || ''}
              onChange={(e) => setOperationData({...operationData, newCar: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione o carro</option>
              <option value="CARRO 1">CARRO 1</option>
              <option value="CARRO 2">CARRO 2</option>
              <option value="CARRO 3">CARRO 3</option>
              <option value="CARRO 4">CARRO 4</option>
            </select>
          </div>
        );
        
      case 'export_data':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formato
              </label>
              <select
                value={operationData.format || ''}
                onChange={(e) => setOperationData({...operationData, format: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione o formato</option>
                <option value="csv">CSV</option>
                <option value="xlsx">Excel (XLSX)</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dados a Incluir
              </label>
              <select
                value={operationData.dataType || ''}
                onChange={(e) => setOperationData({...operationData, dataType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione os dados</option>
                <option value="basic">Dados básicos</option>
                <option value="complete">Dados completos</option>
                <option value="contact">Apenas contatos</option>
              </select>
            </div>
          </div>
        );
        
      case 'update_tags':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ação
              </label>
              <select
                value={operationData.tagAction || ''}
                onChange={(e) => setOperationData({...operationData, tagAction: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Selecione a ação</option>
                <option value="add">Adicionar tags</option>
                <option value="remove">Remover tags</option>
                <option value="replace">Substituir tags</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {['vip', 'elderly', 'priority', 'regular', 'family_group', 'difficult_access'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      const currentTags = operationData.tags || [];
                      const newTags = currentTags.includes(tag)
                        ? currentTags.filter(t => t !== tag)
                        : [...currentTags, tag];
                      setOperationData({...operationData, tags: newTags});
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      (operationData.tags || []).includes(tag)
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Operações em Massa</h3>
          <p className="text-sm text-gray-600 mt-1">
            Execute ações para múltiplos pacientes simultaneamente
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {selectedPatients.length} selecionados
          </span>
          {selectedPatients.length > 0 && (
            <button
              onClick={() => setSelectedPatients([])}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Limpar seleção
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-gray-700 mb-3">Filtros de Seleção</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
          <select
            value={filterCriteria.status}
            onChange={(e) => setFilterCriteria({...filterCriteria, status: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="confirmed">Confirmados</option>
            <option value="pending">Pendentes</option>
          </select>
          
          <select
            value={filterCriteria.car}
            onChange={(e) => setFilterCriteria({...filterCriteria, car: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos os Carros</option>
            <option value="CARRO 1">CARRO 1</option>
            <option value="CARRO 2">CARRO 2</option>
            <option value="CARRO 3">CARRO 3</option>
            <option value="CARRO 4">CARRO 4</option>
          </select>
          
          <select
            value={filterCriteria.confirmationRate}
            onChange={(e) => setFilterCriteria({...filterCriteria, confirmationRate: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Taxa de Confirmação</option>
            <option value="high">Alta (>90%)</option>
            <option value="medium">Média (60-90%)</option>
            <option value="low">Baixa (<60%)</option>
          </select>
          
          <select
            value={filterCriteria.riskScore}
            onChange={(e) => setFilterCriteria({...filterCriteria, riskScore: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Score de Risco</option>
            <option value="low">Baixo</option>
            <option value="medium">Médio</option>
            <option value="high">Alto</option>
          </select>
          
          <select
            value={filterCriteria.dateRange}
            onChange={(e) => setFilterCriteria({...filterCriteria, dateRange: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Período</option>
            <option value="today">Hoje</option>
            <option value="week">Esta Semana</option>
          </select>
        </div>
        
        {/* Quick Selection Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleSelectByCriteria('pending')}
            className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm hover:bg-yellow-200 transition-colors"
          >
            Selecionar Pendentes
          </button>
          <button
            onClick={() => handleSelectByCriteria('high_risk')}
            className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200 transition-colors"
          >
            Selecionar Alto Risco
          </button>
          <button
            onClick={() => handleSelectByCriteria('low_confirmation')}
            className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm hover:bg-orange-200 transition-colors"
          >
            Baixa Confirmação
          </button>
          <button
            onClick={() => handleSelectByCriteria('today')}
            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors"
          >
            Coletas Hoje
          </button>
        </div>
      </div>

      {/* Patient Selection List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={handleSelectAll}
                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
              >
                {filteredPatients.every(p => selectedPatients.includes(p.id)) ? (
                  <CheckSquare size={18} />
                ) : (
                  <Square size={18} />
                )}
                <span>Selecionar Todos ({filteredPatients.length})</span>
              </button>
            </div>
            <span className="text-sm text-gray-500">
              {filteredPatients.length} pacientes encontrados
            </span>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {filteredPatients.map((patient) => {
            const isSelected = selectedPatients.includes(patient.id);
            
            return (
              <div
                key={patient.id}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  isSelected ? 'bg-blue-50' : ''
                }`}
                onClick={() => handlePatientSelect(patient.id, !isSelected)}
              >
                <div className="flex items-center space-x-3">
                  {isSelected ? (
                    <CheckSquare className="text-blue-600" size={20} />
                  ) : (
                    <Square className="text-gray-400" size={20} />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800">
                        {patient.personalInfo?.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          patient.status === 'confirmed' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {patient.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                        </span>
                        {patient.assignedCar && (
                          <span className="text-xs text-gray-500">
                            {patient.assignedCar}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <span>{patient.contactInfo?.phones?.[0]?.number}</span>
                      {patient.nextScheduledDate && (
                        <span>
                          {new Date(patient.nextScheduledDate).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                      <span className={`px-1 py-0.5 rounded text-xs ${
                        patient.analytics?.riskScore === 'high' ? 'bg-red-100 text-red-700' :
                        patient.analytics?.riskScore === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {patient.analytics?.riskScore === 'high' ? 'Alto Risco' :
                         patient.analytics?.riskScore === 'medium' ? 'Médio Risco' : 'Baixo Risco'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bulk Operations */}
      {selectedPatients.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="font-medium text-gray-700 mb-4">
            Operações para {selectedPatients.length} pacientes selecionados
          </h4>
          
          {/* Operation Selection */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {Object.entries(bulkOperations).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setOperation(operation === key ? '' : key)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  operation === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`p-2 rounded-lg ${config.color} w-fit mb-2`}>
                  <config.icon size={20} />
                </div>
                <p className="font-medium text-gray-800 text-sm">{config.label}</p>
                <p className="text-xs text-gray-600 mt-1">{config.description}</p>
              </button>
            ))}
          </div>
          
          {/* Operation Configuration */}
          {operation && (
            <div className="mb-6">
              <h5 className="font-medium text-gray-700 mb-3">
                Configurar: {bulkOperations[operation].label}
              </h5>
              {renderOperationConfig()}
            </div>
          )}
          
          {/* Execute Button */}
          {operation && (
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {showPreview ? 'Ocultar' : 'Visualizar'} Prévia
              </button>
              
              <button
                onClick={handleExecuteOperation}
                disabled={processing}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Executando...</span>
                  </>
                ) : (
                  <>
                    <bulkOperations[operation].icon size={18} />
                    <span>Executar {bulkOperations[operation].label}</span>
                  </>
                )}
              </button>
            </div>
          )}
          
          {/* Preview */}
          {showPreview && operation && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h6 className="font-medium text-gray-700 mb-2">Prévia da Operação</h6>
              <div className="text-sm text-gray-600">
                <p><strong>Operação:</strong> {bulkOperations[operation].label}</p>
                <p><strong>Pacientes:</strong> {selectedPatients.length}</p>
                {operationData.message && (
                  <p><strong>Mensagem:</strong> {operationData.message}</p>
                )}
                {operationData.newDate && operationData.newTime && (
                  <p><strong>Nova data/hora:</strong> {operationData.newDate} às {operationData.newTime}</p>
                )}
                {operationData.newCar && (
                  <p><strong>Novo carro:</strong> {operationData.newCar}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BulkOperations;