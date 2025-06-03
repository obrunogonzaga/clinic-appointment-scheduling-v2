import React, { useState } from 'react';
import { 
  X, User, Phone, Mail, MapPin, Calendar, Heart, CreditCard, 
  Clock, AlertCircle, Activity, MessageSquare, Edit2, Save, 
  XCircle, CheckCircle, FileText, Car, TrendingUp, Users,
  PhoneCall, Send, History, Star, Shield, Home
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import toast from 'react-hot-toast';

const PatientModal = ({ patient, isOpen, onClose, onUpdate, onAction }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(patient || {});
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationNotes, setConfirmationNotes] = useState('');

  if (!isOpen || !patient) return null;

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(patient);
  };

  const handleSave = () => {
    onUpdate(editedData);
    setIsEditing(false);
    toast.success('Informações do paciente atualizadas com sucesso!');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedData(patient);
  };

  const handleConfirmationSubmit = () => {
    onAction(patient.id, 'confirm', { notes: confirmationNotes });
    setShowConfirmationModal(false);
    setConfirmationNotes('');
    toast.success('Confirmação registrada com sucesso!');
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const formatTime = (date) => {
    if (!date) return '-';
    return format(new Date(date), 'HH:mm', { locale: ptBR });
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRiskColor = (risk) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-red-600'
    };
    return colors[risk] || 'text-gray-600';
  };

  const tabs = [
    { id: 'info', label: 'Informações', icon: User },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'health', label: 'Plano de Saúde', icon: Heart },
    { id: 'analytics', label: 'Análises', icon: TrendingUp },
    { id: 'communication', label: 'Comunicação', icon: MessageSquare }
  ];

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-fade-in-scale">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{patient.personalInfo?.name}</h2>
                  <div className="flex items-center space-x-4 mt-1 text-blue-100">
                    <span className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-1" />
                      {patient.personalInfo?.cpf}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(patient.personalInfo?.birthDate)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="p-2 bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Save className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </>
                )}
                <button
                  onClick={onClose}
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Status and Tags */}
            <div className="flex items-center space-x-2 mt-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(patient.status)}`}>
                {patient.status === 'confirmed' ? 'Confirmado' : 
                 patient.status === 'pending' ? 'Pendente' :
                 patient.status === 'cancelled' ? 'Cancelado' : 'Concluído'}
              </span>
              {patient.tags?.map((tag) => (
                <span key={tag} className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  {tag === 'vip' && <Star className="w-3 h-3 inline mr-1" />}
                  {tag === 'elderly' && <Users className="w-3 h-3 inline mr-1" />}
                  {tag === 'priority' && <Shield className="w-3 h-3 inline mr-1" />}
                  {tag === 'difficult_access' && <Home className="w-3 h-3 inline mr-1" />}
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-gray-50">
            <div className="flex space-x-1 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-3 font-medium text-sm transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-blue-600'
                      : 'text-gray-600 border-transparent hover:text-gray-800'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 280px)' }}>
            {/* Info Tab */}
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Informações de Contato</h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-start">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Telefones</p>
                        {patient.contactInfo?.phones?.map((phone, idx) => (
                          <p key={idx} className="font-medium">
                            {phone.number} {phone.primary && <span className="text-xs text-blue-600">(Principal)</span>}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Mail className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">E-mail</p>
                        {isEditing ? (
                          <input
                            type="email"
                            value={editedData.personalInfo?.email || ''}
                            onChange={(e) => setEditedData({
                              ...editedData,
                              personalInfo: { ...editedData.personalInfo, email: e.target.value }
                            })}
                            className="w-full px-2 py-1 border rounded"
                          />
                        ) : (
                          <p className="font-medium">{patient.personalInfo?.email || '-'}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">Endereço</p>
                        <p className="font-medium">{patient.contactInfo?.address?.street}</p>
                        <p className="text-sm">{patient.contactInfo?.address?.neighborhood}, {patient.contactInfo?.address?.city}</p>
                        {patient.contactInfo?.address?.accessNotes && (
                          <p className="text-xs text-gray-500 mt-1">
                            <AlertCircle className="w-3 h-3 inline mr-1" />
                            {patient.contactInfo?.address?.accessNotes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Preferências</h4>
                    <div className="space-y-2 text-sm">
                      <p>
                        <Clock className="w-4 h-4 inline mr-1 text-blue-600" />
                        Melhor horário: {patient.personalInfo?.preferredContactTime?.start} às {patient.personalInfo?.preferredContactTime?.end}
                      </p>
                      <p>
                        <MessageSquare className="w-4 h-4 inline mr-1 text-blue-600" />
                        Contato preferido: {patient.personalInfo?.preferredContactMethod === 'sms' ? 'SMS' : 
                                          patient.personalInfo?.preferredContactMethod === 'whatsapp' ? 'WhatsApp' :
                                          patient.personalInfo?.preferredContactMethod === 'phone' ? 'Telefone' : 'E-mail'}
                      </p>
                      {patient.preferences?.specialRequirements && (
                        <p className="text-orange-700">
                          <AlertCircle className="w-4 h-4 inline mr-1" />
                          {patient.preferences.specialRequirements}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Collection Stats */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Estatísticas de Coleta</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-gray-800">{patient.analytics?.totalCollections || 0}</p>
                      <p className="text-sm text-gray-600">Total de Coletas</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                      <p className="text-3xl font-bold text-gray-800">
                        {patient.confirmationTracking?.confirmationRate 
                          ? `${Math.round(patient.confirmationTracking.confirmationRate * 100)}%` 
                          : '-'}
                      </p>
                      <p className="text-sm text-gray-600">Taxa de Confirmação</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Score de Risco</span>
                      <span className={`font-semibold ${getRiskColor(patient.analytics?.riskScore)}`}>
                        {patient.analytics?.riskScore === 'low' ? 'Baixo' :
                         patient.analytics?.riskScore === 'medium' ? 'Médio' : 'Alto'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Frequência</span>
                      <span className="font-semibold">
                        {patient.analytics?.frequency === 'occasional' ? 'Ocasional' :
                         patient.analytics?.frequency === 'regular' ? 'Regular' : 'Frequente'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Taxa de No-Show</span>
                      <span className="font-semibold">
                        {patient.analytics?.noShowRate 
                          ? `${Math.round(patient.analytics.noShowRate * 100)}%` 
                          : '-'}
                      </span>
                    </div>
                  </div>

                  {/* Next Appointment */}
                  {patient.nextScheduledDate && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600 font-medium">Próxima Coleta</p>
                          <p className="text-lg font-semibold text-blue-900">
                            {formatDate(patient.nextScheduledDate)}
                          </p>
                          {patient.assignedCar && (
                            <p className="text-sm text-blue-700 mt-1">
                              <Car className="w-4 h-4 inline mr-1" />
                              {patient.assignedCar}
                            </p>
                          )}
                        </div>
                        <Calendar className="w-8 h-8 text-blue-400" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Histórico de Coletas</h3>
                
                {patient.collectionHistory && patient.collectionHistory.length > 0 ? (
                  <div className="space-y-3">
                    {patient.collectionHistory.map((collection) => (
                      <div key={collection.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(collection.status)}`}>
                                {collection.status === 'completed' ? 'Concluída' :
                                 collection.status === 'cancelled' ? 'Cancelada' :
                                 collection.status === 'no_show' ? 'Não Compareceu' : 
                                 collection.status}
                              </span>
                              <span className="text-sm text-gray-600">
                                {formatDate(collection.date)} às {collection.time}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-gray-600">Carro:</span> {collection.car}
                              </div>
                              <div>
                                <span className="text-gray-600">Motorista:</span> {collection.driver}
                              </div>
                              <div className="md:col-span-2">
                                <span className="text-gray-600">Exames:</span> {collection.exams.join(', ')}
                              </div>
                              {collection.notes && (
                                <div className="md:col-span-2 mt-2 p-2 bg-yellow-50 rounded">
                                  <FileText className="w-4 h-4 inline mr-1 text-yellow-600" />
                                  {collection.notes}
                                </div>
                              )}
                            </div>
                          </div>
                          <Activity className="w-5 h-5 text-gray-400 ml-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Nenhum histórico de coleta disponível</p>
                  </div>
                )}
              </div>
            )}

            {/* Health Plan Tab */}
            {activeTab === 'health' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Informações do Plano de Saúde</h3>
                
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Operadora</p>
                      <p className="font-semibold text-lg">{patient.healthPlan?.provider}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Número do Cartão</p>
                      <p className="font-semibold text-lg">{patient.healthPlan?.cardNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tipo de Plano</p>
                      <p className="font-semibold">{patient.healthPlan?.planType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Coparticipação</p>
                      <p className="font-semibold">
                        {patient.healthPlan?.copay ? `R$ ${patient.healthPlan.copay}` : 'Sem coparticipação'}
                      </p>
                    </div>
                  </div>
                  
                  {patient.healthPlan?.coverage && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">Coberturas</p>
                      <div className="flex flex-wrap gap-2">
                        {patient.healthPlan.coverage.map((item) => (
                          <span key={item} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                            {item === 'laboratory' ? 'Laboratório' :
                             item === 'home_collection' ? 'Coleta Domiciliar' : item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Análises e Insights</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                    <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-2xl font-bold text-blue-900">{patient.analytics?.totalCollections || 0}</p>
                    <p className="text-sm text-blue-700">Coletas Realizadas</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-2xl font-bold text-green-900">
                      {patient.confirmationTracking?.confirmationRate 
                        ? `${Math.round(patient.confirmationTracking.confirmationRate * 100)}%` 
                        : '-'}
                    </p>
                    <p className="text-sm text-green-700">Taxa de Confirmação</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                    <Clock className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-2xl font-bold text-purple-900">
                      {patient.analytics?.averageExamsPerVisit || '-'}
                    </p>
                    <p className="text-sm text-purple-700">Média de Exames</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-3">Padrões de Comportamento</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Padrão Sazonal</span>
                      <span className="font-medium">
                        {patient.analytics?.seasonalPattern === 'consistent' ? 'Consistente' :
                         patient.analytics?.seasonalPattern === 'winter_higher' ? 'Maior no Inverno' :
                         patient.analytics?.seasonalPattern === 'summer_higher' ? 'Maior no Verão' : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Taxa de Reagendamento</span>
                      <span className="font-medium">
                        {patient.analytics?.rescheduleRate 
                          ? `${Math.round(patient.analytics.rescheduleRate * 100)}%` 
                          : '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Tempo Médio de Confirmação</span>
                      <span className="font-medium">{patient.confirmationTracking?.averageConfirmationTime || '-'}</span>
                    </div>
                  </div>
                </div>

                {patient.familyGroup && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      <Users className="w-5 h-5 inline mr-1" />
                      Grupo Familiar
                    </h4>
                    <div className="space-y-2">
                      {patient.familyGroup.members.map((member) => (
                        <div key={member.patientId} className="flex items-center justify-between text-sm">
                          <span>{member.name}</span>
                          <span className="text-blue-600">
                            {member.relation === 'spouse' ? 'Cônjuge' :
                             member.relation === 'child' ? 'Filho(a)' : member.relation}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Communication Tab */}
            {activeTab === 'communication' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Histórico de Comunicação</h3>
                
                {patient.confirmationTracking?.confirmationAttempts && patient.confirmationTracking.confirmationAttempts.length > 0 ? (
                  <div className="space-y-3">
                    {patient.confirmationTracking.confirmationAttempts.map((attempt, idx) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              {attempt.method === 'sms' && <MessageSquare className="w-4 h-4 text-blue-600" />}
                              {attempt.method === 'phone' && <PhoneCall className="w-4 h-4 text-green-600" />}
                              {attempt.method === 'whatsapp' && <Send className="w-4 h-4 text-green-500" />}
                              <span className="font-medium">
                                {attempt.method === 'sms' ? 'SMS' :
                                 attempt.method === 'phone' ? 'Ligação' :
                                 attempt.method === 'whatsapp' ? 'WhatsApp' : attempt.method}
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs ${
                                attempt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                attempt.status === 'no_response' ? 'bg-gray-100 text-gray-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {attempt.status === 'confirmed' ? 'Confirmado' :
                                 attempt.status === 'no_response' ? 'Sem Resposta' : attempt.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">
                              {formatDate(attempt.date)} às {formatTime(attempt.date)}
                            </p>
                            <p className="text-sm text-gray-600">
                              Operador: {attempt.operator}
                            </p>
                            {attempt.notes && (
                              <p className="text-sm mt-2 p-2 bg-yellow-50 rounded">
                                {attempt.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Nenhuma comunicação registrada</p>
                  </div>
                )}
                
                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-3">Ações Rápidas</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      onClick={() => onAction(patient.id, 'call')}
                      className="flex items-center justify-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <PhoneCall className="w-4 h-4 mr-2" />
                      Ligar
                    </button>
                    <button
                      onClick={() => onAction(patient.id, 'sms')}
                      className="flex items-center justify-center p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      SMS
                    </button>
                    <button
                      onClick={() => onAction(patient.id, 'whatsapp')}
                      className="flex items-center justify-center p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      WhatsApp
                    </button>
                    <button
                      onClick={() => setShowConfirmationModal(true)}
                      className="flex items-center justify-center p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Última atualização: {formatDate(patient.updatedAt)} às {formatTime(patient.updatedAt)}
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => onAction(patient.id, 'schedule')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ver na Agenda
                </button>
                <button
                  onClick={() => onAction(patient.id, 'export')}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Exportar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in-scale">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirmar Coleta</h3>
            <p className="text-gray-600 mb-4">
              Confirmar coleta para {patient.personalInfo?.name} em {formatDate(patient.nextScheduledDate)}?
            </p>
            <textarea
              value={confirmationNotes}
              onChange={(e) => setConfirmationNotes(e.target.value)}
              placeholder="Observações (opcional)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
              rows={3}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowConfirmationModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmationSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientModal;