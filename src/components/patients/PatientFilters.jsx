import React, { useState } from 'react';
import { 
  Filter, X, ChevronDown, Calendar, MapPin, Heart, Activity, 
  Car, CheckCircle, AlertTriangle, Tag, Users, TrendingUp,
  Clock, Building2
} from 'lucide-react';

const PatientFilters = ({ filters, onChange, onReset, patientCounts = {} }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    from: '',
    to: ''
  });

  // Filter options
  const statusOptions = [
    { value: 'all', label: 'Todos', icon: Users, color: 'text-gray-600' },
    { value: 'confirmed', label: 'Confirmados', icon: CheckCircle, color: 'text-green-600' },
    { value: 'pending', label: 'Pendentes', icon: Clock, color: 'text-yellow-600' },
    { value: 'cancelled', label: 'Cancelados', icon: X, color: 'text-red-600' }
  ];

  const carOptions = [
    { value: 'all', label: 'Todos os Carros' },
    { value: 'CARRO 1', label: 'CARRO 1' },
    { value: 'CARRO 2', label: 'CARRO 2' },
    { value: 'CARRO 3', label: 'CARRO 3' },
    { value: 'CARRO 4', label: 'CARRO 4' }
  ];

  const confirmationRateOptions = [
    { value: 'all', label: 'Todas as Taxas' },
    { value: 'high', label: 'Alta (>90%)', color: 'text-green-600' },
    { value: 'medium', label: 'Média (60-90%)', color: 'text-yellow-600' },
    { value: 'low', label: 'Baixa (<60%)', color: 'text-red-600' }
  ];

  const riskScoreOptions = [
    { value: 'all', label: 'Todos os Riscos' },
    { value: 'low', label: 'Baixo', color: 'text-green-600' },
    { value: 'medium', label: 'Médio', color: 'text-yellow-600' },
    { value: 'high', label: 'Alto', color: 'text-red-600' }
  ];

  const frequencyOptions = [
    { value: 'all', label: 'Todas as Frequências' },
    { value: 'frequent', label: 'Frequente (7+ vezes/ano)', icon: TrendingUp },
    { value: 'regular', label: 'Regular (3-6 vezes/ano)', icon: Activity },
    { value: 'occasional', label: 'Ocasional (1-2 vezes/ano)', icon: Clock }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'Todas as Datas' },
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: 'Esta Semana' },
    { value: 'month', label: 'Este Mês' },
    { value: 'custom', label: 'Personalizado' }
  ];

  const locationOptions = [
    { value: 'all', label: 'Todos os Bairros' },
    { value: 'copacabana', label: 'Copacabana' },
    { value: 'ipanema', label: 'Ipanema' },
    { value: 'leblon', label: 'Leblon' },
    { value: 'recreio', label: 'Recreio dos Bandeirantes' },
    { value: 'tijuca', label: 'Tijuca' },
    { value: 'barra', label: 'Barra da Tijuca' }
  ];

  const healthPlanOptions = [
    { value: 'all', label: 'Todos os Convênios' },
    { value: 'bradesco', label: 'Bradesco Saúde' },
    { value: 'unimed', label: 'Unimed' },
    { value: 'amil', label: 'Amil' },
    { value: 'sulamerica', label: 'SulAmérica' },
    { value: 'golden', label: 'Golden Cross' }
  ];

  const tagOptions = [
    { value: 'vip', label: 'VIP', color: 'bg-purple-100 text-purple-800' },
    { value: 'elderly', label: 'Idoso', color: 'bg-blue-100 text-blue-800' },
    { value: 'priority', label: 'Prioritário', color: 'bg-red-100 text-red-800' },
    { value: 'regular', label: 'Regular', color: 'bg-green-100 text-green-800' },
    { value: 'family_group', label: 'Grupo Familiar', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'difficult_access', label: 'Acesso Difícil', color: 'bg-orange-100 text-orange-800' }
  ];

  // Handle filter changes
  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    
    // Handle custom date range
    if (filterKey === 'dateRange' && value === 'custom') {
      newFilters.customDateFrom = customDateRange.from;
      newFilters.customDateTo = customDateRange.to;
    } else if (filterKey === 'dateRange' && value !== 'custom') {
      delete newFilters.customDateFrom;
      delete newFilters.customDateTo;
    }
    
    onChange(newFilters);
  };

  // Handle tag selection
  const handleTagToggle = (tag) => {
    const currentTags = filters.tags || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    handleFilterChange('tags', newTags);
  };

  // Handle custom date range
  const handleCustomDateChange = (field, value) => {
    const newRange = { ...customDateRange, [field]: value };
    setCustomDateRange(newRange);
    
    if (filters.dateRange === 'custom') {
      onChange({
        ...filters,
        customDateFrom: newRange.from,
        customDateTo: newRange.to
      });
    }
  };

  // Count active filters
  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'tags') return value && value.length > 0;
    if (key === 'customDateFrom' || key === 'customDateTo') return false;
    return value && value !== 'all';
  }).length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="text-gray-600" size={20} />
          <h3 className="text-lg font-semibold">Filtros</h3>
          {activeFilterCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded-full">
              {activeFilterCount} {activeFilterCount === 1 ? 'ativo' : 'ativos'}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {activeFilterCount > 0 && (
            <button
              onClick={onReset}
              className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
            >
              <X size={16} />
              <span>Limpar</span>
            </button>
          )}
          
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <ChevronDown 
              size={16} 
              className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`} 
            />
            <span>{showAdvanced ? 'Menos' : 'Mais'} filtros</span>
          </button>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="inline mr-1" size={14} />
            Período
          </label>
          <select
            value={filters.dateRange || 'all'}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <MapPin className="inline mr-1" size={14} />
            Bairro
          </label>
          <select
            value={filters.location || 'all'}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {locationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Health Plan Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Building2 className="inline mr-1" size={14} />
            Convênio
          </label>
          <select
            value={filters.healthPlan || 'all'}
            onChange={(e) => handleFilterChange('healthPlan', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {healthPlanOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Custom Date Range */}
      {filters.dateRange === 'custom' && (
        <div className="mt-4 grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Inicial
            </label>
            <input
              type="date"
              value={customDateRange.from}
              onChange={(e) => handleCustomDateChange('from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Final
            </label>
            <input
              type="date"
              value={customDateRange.to}
              onChange={(e) => handleCustomDateChange('to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="mt-6 space-y-4 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Car Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Car className="inline mr-1" size={14} />
                Carro Atribuído
              </label>
              <select
                value={filters.car || 'all'}
                onChange={(e) => handleFilterChange('car', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {carOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Confirmation Rate Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <CheckCircle className="inline mr-1" size={14} />
                Taxa de Confirmação
              </label>
              <select
                value={filters.confirmationRate || 'all'}
                onChange={(e) => handleFilterChange('confirmationRate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {confirmationRateOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Risk Score Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <AlertTriangle className="inline mr-1" size={14} />
                Score de Risco
              </label>
              <select
                value={filters.riskScore || 'all'}
                onChange={(e) => handleFilterChange('riskScore', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {riskScoreOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Frequency Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Activity className="inline mr-1" size={14} />
                Frequência
              </label>
              <select
                value={filters.frequency || 'all'}
                onChange={(e) => handleFilterChange('frequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {frequencyOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Tag className="inline mr-1" size={14} />
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map(tag => (
                <button
                  key={tag.value}
                  onClick={() => handleTagToggle(tag.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                    filters.tags?.includes(tag.value)
                      ? tag.color
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Statistics */}
          {patientCounts && Object.keys(patientCounts).length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Resultados:</strong> {patientCounts.filtered || 0} de {patientCounts.total || 0} pacientes
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientFilters;