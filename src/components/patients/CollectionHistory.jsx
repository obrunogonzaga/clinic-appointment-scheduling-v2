import React, { useState } from 'react';
import { 
  Calendar, Clock, Car, User, FileText, CheckCircle, 
  XCircle, AlertCircle, ChevronDown, ChevronUp, MapPin,
  Activity, Phone, Download, Filter, Search
} from 'lucide-react';

const CollectionHistory = ({ patient, collections = [] }) => {
  const [expandedCollection, setExpandedCollection] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');

  // Get collections from patient or use prop
  const allCollections = patient?.collectionHistory || collections;

  // Filter and sort collections
  const filteredCollections = allCollections
    .filter(collection => {
      // Status filter
      if (filterStatus !== 'all' && collection.status !== filterStatus) {
        return false;
      }
      
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        return (
          collection.exams?.some(exam => exam.toLowerCase().includes(term)) ||
          collection.driver?.toLowerCase().includes(term) ||
          collection.car?.toLowerCase().includes(term) ||
          collection.notes?.toLowerCase().includes(term)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  // Status configuration
  const statusConfig = {
    completed: {
      label: 'Concluído',
      color: 'text-green-600 bg-green-100',
      icon: CheckCircle
    },
    cancelled: {
      label: 'Cancelado',
      color: 'text-red-600 bg-red-100',
      icon: XCircle
    },
    no_show: {
      label: 'Não Compareceu',
      color: 'text-orange-600 bg-orange-100',
      icon: AlertCircle
    },
    scheduled: {
      label: 'Agendado',
      color: 'text-blue-600 bg-blue-100',
      icon: Calendar
    },
    in_progress: {
      label: 'Em Andamento',
      color: 'text-yellow-600 bg-yellow-100',
      icon: Clock
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format time
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate statistics
  const statistics = {
    total: allCollections.length,
    completed: allCollections.filter(c => c.status === 'completed').length,
    cancelled: allCollections.filter(c => c.status === 'cancelled').length,
    noShow: allCollections.filter(c => c.status === 'no_show').length,
    avgDuration: allCollections
      .filter(c => c.duration)
      .reduce((acc, c) => acc + c.duration, 0) / allCollections.filter(c => c.duration).length || 0,
    avgExamsPerVisit: allCollections
      .filter(c => c.exams)
      .reduce((acc, c) => acc + c.exams.length, 0) / allCollections.filter(c => c.exams).length || 0
  };

  // Export history
  const handleExport = () => {
    // In a real app, this would generate a CSV or PDF
    console.log('Exporting collection history...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Histórico de Coletas</h3>
          <p className="text-sm text-gray-600 mt-1">
            {statistics.total} coletas registradas
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Download size={18} />
          <span>Exportar</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-gray-800">{statistics.total}</p>
          <p className="text-sm text-gray-600">Total</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-green-600">{statistics.completed}</p>
          <p className="text-sm text-gray-600">Concluídas</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-red-600">{statistics.cancelled}</p>
          <p className="text-sm text-gray-600">Canceladas</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-orange-600">{statistics.noShow}</p>
          <p className="text-sm text-gray-600">Não Compareceu</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-2xl font-bold text-blue-600">{statistics.avgExamsPerVisit.toFixed(1)}</p>
          <p className="text-sm text-gray-600">Média Exames</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por exame, motorista, carro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Todos os Status</option>
            <option value="completed">Concluídas</option>
            <option value="cancelled">Canceladas</option>
            <option value="no_show">Não Compareceu</option>
            <option value="scheduled">Agendadas</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="date-desc">Mais Recentes</option>
            <option value="date-asc">Mais Antigas</option>
            <option value="status">Por Status</option>
          </select>
        </div>
      </div>

      {/* Collection List */}
      <div className="space-y-4">
        {filteredCollections.length > 0 ? (
          filteredCollections.map((collection) => {
            const status = statusConfig[collection.status] || statusConfig.scheduled;
            const isExpanded = expandedCollection === collection.id;
            
            return (
              <div
                key={collection.id}
                className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                {/* Collection Header */}
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedCollection(isExpanded ? null : collection.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${status.color}`}>
                        <status.icon size={20} />
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-3">
                          <h4 className="font-semibold text-gray-800">
                            {formatDate(collection.date)}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Clock className="mr-1" size={14} />
                            {formatTime(collection.time)}
                          </span>
                          <span className="flex items-center">
                            <Car className="mr-1" size={14} />
                            {collection.car}
                          </span>
                          <span className="flex items-center">
                            <User className="mr-1" size={14} />
                            {collection.driver}
                          </span>
                          {collection.duration && (
                            <span className="flex items-center">
                              <Activity className="mr-1" size={14} />
                              {collection.duration} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-right mr-2">
                        <p className="text-sm font-medium text-gray-800">
                          {collection.exams?.length || 0} exames
                        </p>
                      </div>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Exams */}
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                          <FileText className="mr-2" size={16} />
                          Exames Realizados
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {collection.exams?.map((exam, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                            >
                              {exam}
                            </span>
                          )) || <span className="text-gray-500">Nenhum exame registrado</span>}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2 flex items-center">
                          <Clock className="mr-2" size={16} />
                          Linha do Tempo
                        </h5>
                        <div className="space-y-1 text-sm">
                          {collection.confirmationTimestamp && (
                            <p className="text-gray-600">
                              <span className="font-medium">Confirmado:</span>{' '}
                              {formatTimestamp(collection.confirmationTimestamp)}
                            </p>
                          )}
                          {collection.completionTimestamp && (
                            <p className="text-gray-600">
                              <span className="font-medium">Concluído:</span>{' '}
                              {formatTimestamp(collection.completionTimestamp)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {collection.notes && (
                      <div className="mt-4">
                        <h5 className="font-medium text-gray-700 mb-1">Observações</h5>
                        <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                          {collection.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-12">
            <Activity className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500">Nenhuma coleta encontrada</p>
            {(searchTerm || filterStatus !== 'all') && (
              <p className="text-sm text-gray-400 mt-2">
                Tente ajustar os filtros de busca
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionHistory;