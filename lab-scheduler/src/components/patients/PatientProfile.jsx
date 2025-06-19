import React, { useState } from 'react';
import { 
  User, Edit2, Save, X, Phone, Mail, MapPin, Calendar,
  Clock, Car, Activity, Heart, Shield, Star, Tag,
  ChevronRight, ChevronDown, AlertTriangle, CheckCircle,
  MessageSquare, FileText, Download, History, Settings,
  Users, Award, TrendingUp, Target, Eye
} from 'lucide-react';
import CollectionHistory from './CollectionHistory';
import ConfirmationTracker from './ConfirmationTracker';
import CommunicationHub from './CommunicationHub';
import PatientAnalytics from './PatientAnalytics';
import toast from 'react-hot-toast';

const PatientProfile = ({ patient, onUpdate, onAction, onClose }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [editedPatient, setEditedPatient] = useState(patient);
  const [expandedSections, setExpandedSections] = useState(['basic']);

  // Tabs configuration
  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: User },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'communication', label: 'Comunicação', icon: MessageSquare },
    { id: 'confirmation', label: 'Confirmações', icon: CheckCircle },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  // Handle save changes
  const handleSave = async () => {
    try {
      if (onUpdate) {
        await onUpdate(editedPatient);
      }
      setEditMode(false);
      toast.success('Informações atualizadas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar alterações');
    }
  };

  // Handle cancel edit
  const handleCancel = () => {
    setEditedPatient(patient);
    setEditMode(false);
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Format phone
  const formatPhone = (phone) => {
    if (!phone) return '-';
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  // Get risk color
  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Overview Tab Content
  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Patient Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{patient?.personalInfo?.name}</h2>
              <p className="text-blue-100">
                {patient?.personalInfo?.cpf} • {patient?.personalInfo?.gender === 'M' ? 'Masculino' : 'Feminino'}
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(patient?.status)}`}>
                  {patient?.status === 'confirmed' ? 'Confirmado' : 
                   patient?.status === 'pending' ? 'Pendente' : 'Cancelado'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(patient?.analytics?.riskScore)}`}>
                  Risco {patient?.analytics?.riskScore === 'high' ? 'Alto' : 
                          patient?.analytics?.riskScore === 'medium' ? 'Médio' : 'Baixo'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <button
              onClick={() => setEditMode(!editMode)}
              className="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors flex items-center space-x-2"
            >
              <Edit2 size={18} />
              <span>Editar</span>
            </button>
          </div>
        </div>
      </div>

      {editMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="text-yellow-600" size={20} />
              <span className="text-yellow-800 font-medium">Modo de Edição Ativo</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <Save size={16} />
                <span>Salvar</span>
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
              >
                <X size={16} />
                <span>Cancelar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {patient?.analytics?.totalCollections || 0}
              </p>
              <p className="text-sm text-gray-600">Coletas Realizadas</p>
            </div>
            <Activity className="text-blue-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {((patient?.confirmationTracking?.confirmationRate || 0) * 100).toFixed(0)}%
              </p>
              <p className="text-sm text-gray-600">Taxa de Confirmação</p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {patient?.analytics?.averageExamsPerVisit?.toFixed(1) || '0'}
              </p>
              <p className="text-sm text-gray-600">Exames por Visita</p>
            </div>
            <FileText className="text-purple-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-800">
                {patient?.analytics?.frequency === 'frequent' ? 'Alto' :
                 patient?.analytics?.frequency === 'regular' ? 'Médio' : 'Baixo'}
              </p>
              <p className="text-sm text-gray-600">Nível de Frequência</p>
            </div>
            <TrendingUp className="text-orange-500" size={24} />
          </div>
        </div>
      </div>

      {/* Information Sections */}
      <div className="space-y-4">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200">
          <button
            onClick={() => toggleSection('basic')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <User className="text-gray-600" size={20} />
              <h3 className="font-semibold text-gray-800">Informações Básicas</h3>
            </div>
            {expandedSections.includes('basic') ? 
              <ChevronDown size={20} /> : <ChevronRight size={20} />
            }
          </button>
          
          {expandedSections.includes('basic') && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                  {editMode ? (
                    <input
                      type="text"
                      value={editedPatient?.personalInfo?.name || ''}
                      onChange={(e) => setEditedPatient({
                        ...editedPatient,
                        personalInfo: { ...editedPatient.personalInfo, name: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-800">{patient?.personalInfo?.name || '-'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                  {editMode ? (
                    <input
                      type="date"
                      value={editedPatient?.personalInfo?.birthDate || ''}
                      onChange={(e) => setEditedPatient({
                        ...editedPatient,
                        personalInfo: { ...editedPatient.personalInfo, birthDate: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-800">{formatDate(patient?.personalInfo?.birthDate)}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                  {editMode ? (
                    <input
                      type="email"
                      value={editedPatient?.personalInfo?.email || ''}
                      onChange={(e) => setEditedPatient({
                        ...editedPatient,
                        personalInfo: { ...editedPatient.personalInfo, email: e.target.value }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-800">{patient?.personalInfo?.email || '-'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <p className="text-gray-800">
                    {formatPhone(patient?.contactInfo?.phones?.[0]?.number)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-lg border border-gray-200">
          <button
            onClick={() => toggleSection('address')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <MapPin className="text-gray-600" size={20} />
              <h3 className="font-semibold text-gray-800">Endereço</h3>
            </div>
            {expandedSections.includes('address') ? 
              <ChevronDown size={20} /> : <ChevronRight size={20} />
            }
          </button>
          
          {expandedSections.includes('address') && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
                  <p className="text-gray-800">{patient?.contactInfo?.address?.street || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                  <p className="text-gray-800">{patient?.contactInfo?.address?.neighborhood || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                  <p className="text-gray-800">{patient?.contactInfo?.address?.city || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                  <p className="text-gray-800">{patient?.contactInfo?.address?.zipCode || '-'}</p>
                </div>
              </div>
              {patient?.contactInfo?.address?.accessNotes && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observações de Acesso</label>
                  <p className="text-gray-800 bg-white p-3 rounded border border-gray-200">
                    {patient.contactInfo.address.accessNotes}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Health Plan Information */}
        <div className="bg-white rounded-lg border border-gray-200">
          <button
            onClick={() => toggleSection('healthplan')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Shield className="text-gray-600" size={20} />
              <h3 className="font-semibold text-gray-800">Plano de Saúde</h3>
            </div>
            {expandedSections.includes('healthplan') ? 
              <ChevronDown size={20} /> : <ChevronRight size={20} />
            }
          </button>
          
          {expandedSections.includes('healthplan') && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Operadora</label>
                  <p className="text-gray-800">{patient?.healthPlan?.provider || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número da Carteirinha</label>
                  <p className="text-gray-800">{patient?.healthPlan?.cardNumber || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Plano</label>
                  <p className="text-gray-800">{patient?.healthPlan?.planType || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cobertura</label>
                  <div className="flex flex-wrap gap-1">
                    {patient?.healthPlan?.coverage?.map((item, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {item}
                      </span>
                    )) || '-'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Schedule Information */}
        <div className="bg-white rounded-lg border border-gray-200">
          <button
            onClick={() => toggleSection('schedule')}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Calendar className="text-gray-600" size={20} />
              <h3 className="font-semibold text-gray-800">Agendamento</h3>
            </div>
            {expandedSections.includes('schedule') ? 
              <ChevronDown size={20} /> : <ChevronRight size={20} />
            }
          </button>
          
          {expandedSections.includes('schedule') && (
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Próxima Coleta</label>
                  <p className="text-gray-800">{formatDate(patient?.nextScheduledDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Carro Atribuído</label>
                  <p className="text-gray-800">{patient?.assignedCar || 'Não atribuído'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Última Coleta</label>
                  <p className="text-gray-800">{formatDate(patient?.analytics?.lastCollectionDate)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Padrão Sazonal</label>
                  <p className="text-gray-800 capitalize">{patient?.analytics?.seasonalPattern || '-'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {patient?.tags && patient.tags.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Tag className="text-gray-600" size={20} />
              <h3 className="font-semibold text-gray-800">Tags</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {patient.tags.map((tag, index) => (
                <span
                  key={index}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    tag === 'vip' ? 'bg-purple-100 text-purple-800' :
                    tag === 'elderly' ? 'bg-blue-100 text-blue-800' :
                    tag === 'priority' ? 'bg-red-100 text-red-800' :
                    tag === 'regular' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Perfil do Paciente</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon size={16} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'history' && <CollectionHistory patient={patient} />}
          {activeTab === 'communication' && <CommunicationHub patient={patient} onUpdate={onUpdate} onAction={onAction} />}
          {activeTab === 'confirmation' && <ConfirmationTracker patient={patient} onUpdate={onUpdate} />}
          {activeTab === 'analytics' && <PatientAnalytics patients={[patient]} />}
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;