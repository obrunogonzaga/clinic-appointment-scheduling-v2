import React, { useState, useEffect } from 'react';
import { 
  Users, ChevronLeft, ChevronRight, Grid, List, 
  SortAsc, SortDesc, Download, Plus, RefreshCw,
  Filter, Eye, Phone, MessageSquare
} from 'lucide-react';
import PatientCard from './PatientCard';

const PatientList = ({ 
  patients = [], 
  loading = false, 
  onPatientClick,
  onQuickAction,
  searchFilters = {},
  totalCount = 0
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // grid, list, compact
  const [sortBy, setSortBy] = useState('name'); // name, date, frequency, status
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [selectedPatients, setSelectedPatients] = useState([]);
  const [itemsPerPage] = useState(12);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchFilters]);

  // Sorting logic
  const sortedPatients = React.useMemo(() => {
    const sorted = [...patients].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.personalInfo?.name?.toLowerCase() || '';
          bValue = b.personalInfo?.name?.toLowerCase() || '';
          break;
        case 'date':
          aValue = new Date(a.nextScheduledDate || a.updatedAt);
          bValue = new Date(b.nextScheduledDate || b.updatedAt);
          break;
        case 'frequency':
          const frequencyOrder = { frequent: 3, regular: 2, occasional: 1 };
          aValue = frequencyOrder[a.analytics?.frequency] || 0;
          bValue = frequencyOrder[b.analytics?.frequency] || 0;
          break;
        case 'status':
          aValue = a.status || 'ativo';
          bValue = b.status || 'ativo';
          break;
        default:
          aValue = a.personalInfo?.name?.toLowerCase() || '';
          bValue = b.personalInfo?.name?.toLowerCase() || '';
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return sorted;
  }, [patients, sortBy, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPatients = sortedPatients.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleSelectPatient = (patientId) => {
    setSelectedPatients(prev => 
      prev.includes(patientId) 
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPatients.length === currentPatients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(currentPatients.map(p => p.id));
    }
  };

  const handleBulkAction = (action) => {
    if (selectedPatients.length === 0) return;
    onQuickAction?.(selectedPatients, action);
    setSelectedPatients([]);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-gray-600">Carregando pacientes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-fade-in-up" style={{animationDelay: '0.1s'}}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Lista de Pacientes
                </h2>
                <p className="text-sm text-gray-600">
                  {sortedPatients.length} de {totalCount || sortedPatients.length} pacientes
                  {Object.keys(searchFilters).some(key => searchFilters[key] !== 'all' && searchFilters[key] !== '') && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Filtrado
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Bulk Actions */}
            {selectedPatients.length > 0 && (
              <div className="flex items-center space-x-2 mr-4 px-3 py-2 bg-blue-50 rounded-lg">
                <span className="text-sm text-blue-800 font-medium">
                  {selectedPatients.length} selecionado{selectedPatients.length > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => handleBulkAction('call')}
                  className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors btn-interactive"
                >
                  <Phone className="w-3 h-3 inline mr-1" />
                  Ligar
                </button>
                <button
                  onClick={() => handleBulkAction('message')}
                  className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors btn-interactive"
                >
                  <MessageSquare className="w-3 h-3 inline mr-1" />
                  SMS
                </button>
              </div>
            )}

            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} transition-colors btn-interactive`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'} transition-colors btn-interactive`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Export Button */}
            <button
              onClick={() => onQuickAction?.(selectedPatients.length > 0 ? selectedPatients : 'all', 'export')}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors btn-interactive"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Ordenar por:</span>
            <div className="flex space-x-2">
              {[
                { key: 'name', label: 'Nome' },
                { key: 'date', label: 'Data' },
                { key: 'frequency', label: 'Frequência' },
                { key: 'status', label: 'Status' }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleSort(option.key)}
                  className={`flex items-center px-3 py-1 rounded text-sm transition-colors btn-interactive ${
                    sortBy === option.key 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {option.label}
                  {sortBy === option.key && (
                    sortOrder === 'asc' ? (
                      <SortAsc className="w-3 h-3 ml-1" />
                    ) : (
                      <SortDesc className="w-3 h-3 ml-1" />
                    )
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Select All */}
          {viewMode !== 'grid' && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedPatients.length === currentPatients.length && currentPatients.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Selecionar todos</span>
            </div>
          )}
        </div>
      </div>

      {/* Patient List */}
      <div className="p-6">
        {currentPatients.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum paciente encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Tente ajustar os filtros de busca ou adicionar novos pacientes.
            </p>
            <button 
              onClick={() => onQuickAction?.('new', 'create')}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors btn-interactive mx-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Paciente
            </button>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentPatients.map((patient, index) => (
                  <div 
                    key={patient.id} 
                    className="animate-fade-in-up"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <PatientCard
                      patient={patient}
                      onClick={onPatientClick}
                      onQuickAction={onQuickAction}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-3">
                {currentPatients.map((patient, index) => (
                  <div 
                    key={patient.id}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 animate-fade-in-up"
                    style={{animationDelay: `${index * 0.05}s`}}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPatients.includes(patient.id)}
                      onChange={() => handleSelectPatient(patient.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <PatientCard
                      patient={patient}
                      onClick={onPatientClick}
                      onQuickAction={onQuickAction}
                      compact={true}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Mostrando {startIndex + 1} - {Math.min(startIndex + itemsPerPage, sortedPatients.length)} de {sortedPatients.length} pacientes
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 text-sm text-gray-600 disabled:text-gray-400 hover:bg-gray-100 rounded transition-colors btn-interactive disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 text-sm rounded transition-colors btn-interactive ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 text-sm text-gray-600 disabled:text-gray-400 hover:bg-gray-100 rounded transition-colors btn-interactive disabled:cursor-not-allowed"
              >
                Próxima
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientList;