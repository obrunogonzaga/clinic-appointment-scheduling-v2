import React, { useState } from 'react';
import { 
  Phone, MessageSquare, Clock, CheckCircle, XCircle, 
  AlertCircle, User, Calendar, Plus, Edit2, Save, X,
  TrendingUp, TrendingDown, Activity, PhoneCall,
  Mail, Send, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

const ConfirmationTracker = ({ patient, onUpdate }) => {
  const [isAddingAttempt, setIsAddingAttempt] = useState(false);
  const [newAttempt, setNewAttempt] = useState({
    method: 'phone',
    notes: ''
  });
  const [processing, setProcessing] = useState(false);

  // Get confirmation tracking data
  const tracking = patient?.confirmationTracking || {
    confirmationRate: 0,
    totalAppointments: 0,
    confirmedAppointments: 0,
    averageConfirmationTime: '0h',
    confirmationAttempts: []
  };

  // Method configurations
  const methodConfig = {
    phone: {
      label: 'Telefone',
      icon: Phone,
      color: 'text-blue-600 bg-blue-100'
    },
    sms: {
      label: 'SMS',
      icon: MessageSquare,
      color: 'text-green-600 bg-green-100'
    },
    whatsapp: {
      label: 'WhatsApp',
      icon: Send,
      color: 'text-green-600 bg-green-100'
    },
    email: {
      label: 'E-mail',
      icon: Mail,
      color: 'text-purple-600 bg-purple-100'
    }
  };

  // Status configurations
  const statusConfig = {
    confirmed: {
      label: 'Confirmado',
      color: 'text-green-600 bg-green-100',
      icon: CheckCircle
    },
    no_response: {
      label: 'Sem Resposta',
      color: 'text-yellow-600 bg-yellow-100',
      icon: AlertCircle
    },
    cancelled: {
      label: 'Cancelado',
      color: 'text-red-600 bg-red-100',
      icon: XCircle
    },
    rescheduled: {
      label: 'Reagendado',
      color: 'text-blue-600 bg-blue-100',
      icon: Calendar
    }
  };

  // Calculate metrics
  const calculateMetrics = () => {
    const attempts = tracking.confirmationAttempts || [];
    const successfulAttempts = attempts.filter(a => a.status === 'confirmed').length;
    const methodStats = {};
    
    attempts.forEach(attempt => {
      if (!methodStats[attempt.method]) {
        methodStats[attempt.method] = { total: 0, successful: 0 };
      }
      methodStats[attempt.method].total++;
      if (attempt.status === 'confirmed') {
        methodStats[attempt.method].successful++;
      }
    });

    return {
      totalAttempts: attempts.length,
      successfulAttempts,
      successRate: attempts.length > 0 ? (successfulAttempts / attempts.length) * 100 : 0,
      methodStats
    };
  };

  const metrics = calculateMetrics();

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Add new confirmation attempt
  const handleAddAttempt = async (status) => {
    if (!newAttempt.notes && status !== 'confirmed') {
      toast.error('Por favor, adicione uma observação');
      return;
    }

    setProcessing(true);
    
    try {
      const attempt = {
        date: new Date().toISOString(),
        method: newAttempt.method,
        status: status,
        operator: 'Operador Atual', // In real app, get from auth context
        notes: newAttempt.notes
      };

      // Update patient data
      const updatedPatient = {
        ...patient,
        confirmationTracking: {
          ...tracking,
          confirmationAttempts: [...(tracking.confirmationAttempts || []), attempt],
          confirmedAppointments: status === 'confirmed' 
            ? tracking.confirmedAppointments + 1 
            : tracking.confirmedAppointments,
          confirmationRate: status === 'confirmed'
            ? ((tracking.confirmedAppointments + 1) / tracking.totalAppointments)
            : tracking.confirmationRate
        }
      };

      // Update patient status if confirmed
      if (status === 'confirmed') {
        updatedPatient.status = 'confirmed';
      }

      // Call update function
      if (onUpdate) {
        await onUpdate(updatedPatient);
      }

      // Show success message
      toast.success(
        status === 'confirmed' 
          ? 'Confirmação registrada com sucesso!'
          : 'Tentativa registrada'
      );

      // Reset form
      setIsAddingAttempt(false);
      setNewAttempt({ method: 'phone', notes: '' });
    } catch (error) {
      toast.error('Erro ao registrar tentativa');
    } finally {
      setProcessing(false);
    }
  };

  // Quick confirm action
  const handleQuickConfirm = () => {
    handleAddAttempt('confirmed');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Rastreamento de Confirmações</h3>
          <p className="text-sm text-gray-600 mt-1">
            Taxa de confirmação: {(tracking.confirmationRate * 100).toFixed(0)}%
          </p>
        </div>
        
        {!isAddingAttempt && (
          <button
            onClick={() => setIsAddingAttempt(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Nova Tentativa</span>
          </button>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {tracking.totalAppointments}
              </p>
              <p className="text-sm text-gray-600">Total de Consultas</p>
            </div>
            <Calendar className="text-gray-400" size={24} />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">
                {tracking.confirmedAppointments}
              </p>
              <p className="text-sm text-gray-600">Confirmadas</p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {tracking.averageConfirmationTime}
              </p>
              <p className="text-sm text-gray-600">Tempo Médio</p>
            </div>
            <Clock className="text-blue-500" size={24} />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {metrics.successRate.toFixed(0)}%
              </p>
              <p className="text-sm text-gray-600">Taxa de Sucesso</p>
              <div className="flex items-center mt-1">
                {metrics.successRate > 70 ? (
                  <TrendingUp className="text-green-500 mr-1" size={14} />
                ) : (
                  <TrendingDown className="text-red-500 mr-1" size={14} />
                )}
                <span className={`text-xs ${
                  metrics.successRate > 70 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metrics.totalAttempts} tentativas
                </span>
              </div>
            </div>
            <Activity className="text-purple-500" size={24} />
          </div>
        </div>
      </div>

      {/* Method Performance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h4 className="font-semibold text-gray-800 mb-4">Desempenho por Método</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(methodConfig).map(([method, config]) => {
            const stats = metrics.methodStats[method] || { total: 0, successful: 0 };
            const successRate = stats.total > 0 
              ? (stats.successful / stats.total) * 100 
              : 0;
            
            return (
              <div key={method} className="text-center">
                <div className={`inline-flex p-3 rounded-lg ${config.color} mb-2`}>
                  <config.icon size={24} />
                </div>
                <p className="font-medium text-gray-800">{config.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {successRate.toFixed(0)}%
                </p>
                <p className="text-xs text-gray-600">
                  {stats.successful}/{stats.total} sucesso
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Attempt Form */}
      {isAddingAttempt && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-800">Registrar Nova Tentativa</h4>
            <button
              onClick={() => {
                setIsAddingAttempt(false);
                setNewAttempt({ method: 'phone', notes: '' });
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Contato
              </label>
              <select
                value={newAttempt.method}
                onChange={(e) => setNewAttempt({ ...newAttempt, method: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Object.entries(methodConfig).map(([method, config]) => (
                  <option key={method} value={method}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observações
              </label>
              <textarea
                value={newAttempt.notes}
                onChange={(e) => setNewAttempt({ ...newAttempt, notes: e.target.value })}
                placeholder="Detalhes da ligação, mensagem enviada, etc..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => handleAddAttempt('no_response')}
                disabled={processing}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {processing ? <Loader2 className="animate-spin" size={18} /> : <AlertCircle size={18} />}
                <span>Sem Resposta</span>
              </button>
              
              <button
                onClick={() => handleAddAttempt('confirmed')}
                disabled={processing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {processing ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                <span>Confirmado</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation History */}
      <div>
        <h4 className="font-semibold text-gray-800 mb-3">Histórico de Tentativas</h4>
        <div className="space-y-3">
          {tracking.confirmationAttempts && tracking.confirmationAttempts.length > 0 ? (
            [...tracking.confirmationAttempts].reverse().map((attempt, index) => {
              const method = methodConfig[attempt.method] || methodConfig.phone;
              const status = statusConfig[attempt.status] || statusConfig.no_response;
              
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${method.color}`}>
                        <method.icon size={18} />
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-gray-800">{method.label}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {formatTimestamp(attempt.date)}
                        </p>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          <User className="inline mr-1" size={14} />
                          {attempt.operator}
                        </p>
                        
                        {attempt.notes && (
                          <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2 rounded">
                            {attempt.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <PhoneCall className="mx-auto text-gray-400 mb-3" size={40} />
              <p className="text-gray-500">Nenhuma tentativa registrada</p>
              <p className="text-sm text-gray-400 mt-1">
                Clique em "Nova Tentativa" para começar
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {patient?.status !== 'confirmed' && (
        <div className="bg-green-50 rounded-lg border border-green-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Confirmação Rápida</p>
              <p className="text-sm text-gray-600 mt-1">
                Paciente confirmou a coleta por telefone?
              </p>
            </div>
            <button
              onClick={handleQuickConfirm}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <CheckCircle size={18} />
              <span>Confirmar Agora</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmationTracker;