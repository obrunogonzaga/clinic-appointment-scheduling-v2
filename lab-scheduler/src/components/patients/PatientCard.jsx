import React from 'react';
import { 
  User, Phone, MapPin, Calendar, Clock, Heart, 
  CheckCircle, AlertCircle, Star, MoreVertical,
  Activity, Zap, TrendingUp
} from 'lucide-react';

const PatientCard = ({ patient, onClick, onQuickAction, compact = false }) => {
  // Status color mapping
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
      case 'confirmado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
      case 'concluído':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Risk score color mapping
  const getRiskColor = (riskScore) => {
    switch (riskScore?.toLowerCase()) {
      case 'low':
      case 'baixo':
        return 'text-green-600';
      case 'medium':
      case 'médio':
        return 'text-yellow-600';
      case 'high':
      case 'alto':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  // Frequency badge
  const getFrequencyBadge = (frequency) => {
    switch (frequency?.toLowerCase()) {
      case 'frequent':
      case 'frequente':
        return { icon: Star, color: 'text-yellow-600', label: 'VIP' };
      case 'regular':
        return { icon: Activity, color: 'text-blue-600', label: 'Regular' };
      case 'occasional':
      case 'eventual':
        return { icon: TrendingUp, color: 'text-gray-600', label: 'Eventual' };
      default:
        return null;
    }
  };

  const frequencyBadge = getFrequencyBadge(patient?.analytics?.frequency);

  if (compact) {
    return (
      <div 
        className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200 cursor-pointer card-hover"
        onClick={() => onClick(patient)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 truncate">{patient.personalInfo?.name}</h3>
              <p className="text-sm text-gray-500">{patient.personalInfo?.cpf}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {patient.nextScheduledDate && (
              <span className="text-xs text-gray-500">
                {new Date(patient.nextScheduledDate).toLocaleDateString('pt-BR')}
              </span>
            )}
            <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(patient.status)}`}>
              {patient.status || 'Ativo'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden card-hover">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {patient.personalInfo?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'PA'}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{patient.personalInfo?.name}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{patient.personalInfo?.cpf}</span>
                {patient.personalInfo?.birthDate && (
                  <span>{new Date().getFullYear() - new Date(patient.personalInfo.birthDate).getFullYear()} anos</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Frequency Badge */}
            {frequencyBadge && (
              <div className="flex items-center space-x-1">
                <frequencyBadge.icon className={`w-4 h-4 ${frequencyBadge.color}`} />
                <span className={`text-xs font-medium ${frequencyBadge.color}`}>
                  {frequencyBadge.label}
                </span>
              </div>
            )}
            
            {/* Tags */}
            {patient.tags?.includes('vip') && (
              <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
            )}
            
            {/* More Actions */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAction?.(patient.id, 'menu');
              }}
              className="p-1 hover:bg-gray-100 rounded transition-colors btn-interactive"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div 
        className="p-4 cursor-pointer" 
        onClick={() => onClick(patient)}
      >
        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">
              {patient.contactInfo?.phones?.[0]?.number || 'Não informado'}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700 truncate">
              {patient.contactInfo?.address?.neighborhood || 'Endereço não informado'}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Heart className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">
              {patient.healthPlan?.provider || 'Particular'}
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Activity className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700">
              {patient.analytics?.totalCollections || 0} coletas
            </span>
          </div>
        </div>

        {/* Statistics */}
        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>Taxa confirmação: {Math.round((patient.confirmationTracking?.confirmationRate || 0) * 100)}%</span>
            </div>
            <div className="flex items-center space-x-1">
              <Zap className={`w-3 h-3 ${getRiskColor(patient.analytics?.riskScore)}`} />
              <span>Risco: {patient.analytics?.riskScore || 'Baixo'}</span>
            </div>
          </div>
          {patient.analytics?.lastCollectionDate && (
            <span>
              Última coleta: {new Date(patient.analytics.lastCollectionDate).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>

        {/* Next Appointment */}
        {patient.nextScheduledDate && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Próxima coleta: {new Date(patient.nextScheduledDate).toLocaleDateString('pt-BR')}
              </span>
            </div>
            <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(patient.status)}`}>
              {patient.status || 'Agendado'}
            </span>
          </div>
        )}

        {/* Special Requirements */}
        {patient.preferences?.specialRequirements && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            {patient.preferences.specialRequirements}
          </div>
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAction?.(patient.id, 'call');
              }}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors btn-interactive"
            >
              <Phone className="w-3 h-3 inline mr-1" />
              Ligar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAction?.(patient.id, 'message');
              }}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors btn-interactive"
            >
              Mensagem
            </button>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>Atualizado {new Date(patient.updatedAt).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientCard;