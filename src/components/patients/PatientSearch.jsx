import React, { useState, useEffect } from 'react';
import { Search, Filter, X, User, Phone, MapPin, Calendar, Heart, CreditCard, Mail, Car, AlertCircle, Clock } from 'lucide-react';

const PatientSearch = ({ onSearch, onFilterChange, totalResults = 0 }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [searchType, setSearchType] = useState('all'); // all, name, cpf, phone, address, email
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [advancedSearch, setAdvancedSearch] = useState({
    name: '',
    cpf: '',
    phone: '',
    address: '',
    email: '',
    healthPlanNumber: ''
  });
  const [filters, setFilters] = useState({
    status: 'all', // all, active, inactive, confirmed, pending
    dateRange: 'all', // all, today, week, month, custom
    location: 'all', // all, or specific neighborhoods
    healthPlan: 'all', // all, or specific plans
    frequency: 'all', // all, occasional, regular, frequent
    car: 'all', // all, CARRO 1, CARRO 2, etc
    confirmationRate: 'all', // all, high (>90%), medium (60-90%), low (<60%)
    riskScore: 'all', // all, low, medium, high
    tags: [], // vip, elderly, difficult_access, etc
    customDateFrom: '',
    customDateTo: ''
  });

  // Handle search input with debounce
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, advancedSearch, filters, searchType]);

  const handleSearch = () => {
    const searchData = {
      term: searchTerm,
      searchType: searchType,
      advancedSearch: advancedSearch,
      filters: filters
    };
    onSearch(searchData);
  };

  const handleFilterChange = (filterKey, value) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleAdvancedSearchChange = (field, value) => {
    setAdvancedSearch(prev => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    handleFilterChange('tags', newTags);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchType('all');
    setAdvancedSearch({
      name: '',
      cpf: '',
      phone: '',
      address: '',
      email: '',
      healthPlanNumber: ''
    });
    setFilters({
      status: 'all',
      dateRange: 'all',
      location: 'all',
      healthPlan: 'all',
      frequency: 'all',
      car: 'all',
      confirmationRate: 'all',
      riskScore: 'all',
      tags: [],
      customDateFrom: '',
      customDateTo: ''
    });
  };

  const getActiveFiltersCount = () => {
    const standardFilters = Object.entries(filters).filter(([key, value]) => 
      key !== 'tags' && key !== 'customDateFrom' && key !== 'customDateTo' &&
      value !== 'all' && value !== ''
    ).length;
    
    const dateFilters = (filters.customDateFrom || filters.customDateTo) ? 1 : 0;
    const tagFilters = filters.tags.length;
    const advancedFields = Object.values(advancedSearch).filter(v => v !== '').length;
    
    return standardFilters + dateFilters + tagFilters + advancedFields;
  };

  // Format CPF for display
  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return value;
  };

  // Format phone for display
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 animate-fade-in-up">
      {/* Search Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Busca de Pacientes</h2>
            <p className="text-sm text-gray-600">
              {totalResults > 0 ? `${totalResults} pacientes encontrados` : 'Digite para buscar pacientes'}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center px-4 py-2 rounded-lg transition-colors btn-interactive ${
            showFilters ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filtros
          {getActiveFiltersCount() > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </button>
      </div>

      {/* Search Type Selector */}
      <div className="flex items-center space-x-2 mb-4">
        <label className="text-sm font-medium text-gray-700">Buscar por:</label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'Todos os campos' },
            { value: 'name', label: 'Nome', icon: User },
            { value: 'cpf', label: 'CPF', icon: CreditCard },
            { value: 'phone', label: 'Telefone', icon: Phone },
            { value: 'address', label: 'Endereço', icon: MapPin },
            { value: 'email', label: 'E-mail', icon: Mail }
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => setSearchType(type.value)}
              className={`flex items-center px-3 py-1 rounded-full text-sm transition-colors btn-interactive ${
                searchType === type.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.icon && <type.icon className="w-3 h-3 mr-1" />}
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
          placeholder={
            searchType === 'all' ? "Buscar por nome, CPF, telefone ou endereço..." :
            searchType === 'name' ? "Digite o nome do paciente..." :
            searchType === 'cpf' ? "Digite o CPF (apenas números)..." :
            searchType === 'phone' ? "Digite o telefone..." :
            searchType === 'address' ? "Digite o endereço, bairro ou cidade..." :
            searchType === 'email' ? "Digite o e-mail..." : 
            "Digite para buscar..."
          }
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors btn-interactive"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Advanced Search Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium btn-interactive"
        >
          {showAdvancedSearch ? 'Ocultar busca avançada' : 'Mostrar busca avançada'}
        </button>
      </div>

      {/* Advanced Search Fields */}
      {showAdvancedSearch && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg animate-fade-in-scale">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Nome completo
            </label>
            <input
              type="text"
              value={advancedSearch.name}
              onChange={(e) => handleAdvancedSearchChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
              placeholder="Nome do paciente"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <CreditCard className="w-4 h-4 inline mr-1" />
              CPF
            </label>
            <input
              type="text"
              value={advancedSearch.cpf}
              onChange={(e) => handleAdvancedSearchChange('cpf', formatCPF(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
              placeholder="000.000.000-00"
              maxLength="14"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="w-4 h-4 inline mr-1" />
              Telefone
            </label>
            <input
              type="text"
              value={advancedSearch.phone}
              onChange={(e) => handleAdvancedSearchChange('phone', formatPhone(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
              placeholder="(00) 00000-0000"
              maxLength="15"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <MapPin className="w-4 h-4 inline mr-1" />
              Endereço
            </label>
            <input
              type="text"
              value={advancedSearch.address}
              onChange={(e) => handleAdvancedSearchChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
              placeholder="Rua, bairro ou cidade"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="w-4 h-4 inline mr-1" />
              E-mail
            </label>
            <input
              type="email"
              value={advancedSearch.email}
              onChange={(e) => handleAdvancedSearchChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
              placeholder="email@exemplo.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Heart className="w-4 h-4 inline mr-1" />
              Nº Cartão do Plano
            </label>
            <input
              type="text"
              value={advancedSearch.healthPlanNumber}
              onChange={(e) => handleAdvancedSearchChange('healthPlanNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
              placeholder="Número do cartão"
            />
          </div>
        </div>
      )}

      {/* Quick Search Suggestions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-sm text-gray-600">Busca rápida:</span>
        {[
          { label: 'Confirmados hoje', filter: { status: 'confirmed', dateRange: 'today' } },
          { label: 'Pendentes', filter: { status: 'pending' } },
          { label: 'VIP', filter: { frequency: 'frequent' } },
          { label: 'Copacabana', filter: { location: 'copacabana' } }
        ].map((suggestion) => (
          <button
            key={suggestion.label}
            onClick={() => {
              Object.entries(suggestion.filter).forEach(([key, value]) => {
                handleFilterChange(key, value);
              });
            }}
            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors btn-interactive"
          >
            {suggestion.label}
          </button>
        ))}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4 animate-fade-in-scale">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
              >
                <option value="all">Todos</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
                <option value="confirmed">Confirmado</option>
                <option value="pending">Pendente</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Período
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
              >
                <option value="all">Todos</option>
                <option value="today">Hoje</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mês</option>
                <option value="custom">Personalizado</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin className="w-4 h-4 inline mr-1" />
                Localização
              </label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
              >
                <option value="all">Todas</option>
                <option value="copacabana">Copacabana</option>
                <option value="ipanema">Ipanema</option>
                <option value="leblon">Leblon</option>
                <option value="botafogo">Botafogo</option>
                <option value="recreio">Recreio</option>
              </select>
            </div>

            {/* Health Plan Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Heart className="w-4 h-4 inline mr-1" />
                Plano de Saúde
              </label>
              <select
                value={filters.healthPlan}
                onChange={(e) => handleFilterChange('healthPlan', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
              >
                <option value="all">Todos</option>
                <option value="bradesco">Bradesco Saúde</option>
                <option value="unimed">Unimed</option>
                <option value="amil">Amil</option>
                <option value="sulamerica">SulAmérica</option>
                <option value="particular">Particular</option>
              </select>
            </div>

            {/* Car Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Car className="w-4 h-4 inline mr-1" />
                Carro
              </label>
              <select
                value={filters.car}
                onChange={(e) => handleFilterChange('car', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
              >
                <option value="all">Todos</option>
                <option value="CARRO 1">CARRO 1</option>
                <option value="CARRO 2">CARRO 2</option>
                <option value="CARRO 3">CARRO 3</option>
                <option value="CARRO 4">CARRO 4</option>
              </select>
            </div>

            {/* Frequency Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Clock className="w-4 h-4 inline mr-1" />
                Frequência
              </label>
              <select
                value={filters.frequency}
                onChange={(e) => handleFilterChange('frequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
              >
                <option value="all">Todas</option>
                <option value="occasional">Ocasional (1-2x/ano)</option>
                <option value="regular">Regular (3-6x/ano)</option>
                <option value="frequent">Frequente (7+x/ano)</option>
              </select>
            </div>

            {/* Confirmation Rate Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taxa de Confirmação
              </label>
              <select
                value={filters.confirmationRate}
                onChange={(e) => handleFilterChange('confirmationRate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
              >
                <option value="all">Todas</option>
                <option value="high">Alta (&gt;90%)</option>
                <option value="medium">Média (60-90%)</option>
                <option value="low">Baixa (&lt;60%)</option>
              </select>
            </div>

            {/* Risk Score Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Score de Risco
              </label>
              <select
                value={filters.riskScore}
                onChange={(e) => handleFilterChange('riskScore', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
              >
                <option value="all">Todos</option>
                <option value="low">Baixo</option>
                <option value="medium">Médio</option>
                <option value="high">Alto</option>
              </select>
            </div>
          </div>

          {/* Tags Filter */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'vip', label: 'VIP', color: 'purple' },
                { value: 'elderly', label: 'Idoso', color: 'orange' },
                { value: 'regular', label: 'Regular', color: 'green' },
                { value: 'frequent', label: 'Frequente', color: 'blue' },
                { value: 'difficult_access', label: 'Acesso Difícil', color: 'red' },
                { value: 'priority', label: 'Prioritário', color: 'yellow' },
                { value: 'family_group', label: 'Grupo Familiar', color: 'indigo' }
              ].map((tag) => (
                <button
                  key={tag.value}
                  onClick={() => handleTagToggle(tag.value)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors btn-interactive ${
                    filters.tags.includes(tag.value)
                      ? `bg-${tag.color}-600 text-white`
                      : `bg-${tag.color}-50 text-${tag.color}-700 hover:bg-${tag.color}-100`
                  }`}
                >
                  {tag.label}
                  {filters.tags.includes(tag.value) && (
                    <X className="w-3 h-3 inline ml-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          {filters.dateRange === 'custom' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg animate-fade-in-up">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={filters.customDateFrom}
                  onChange={(e) => handleFilterChange('customDateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Final
                </label>
                <input
                  type="date"
                  value={filters.customDateTo}
                  onChange={(e) => handleFilterChange('customDateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus-ring"
                />
              </div>
            </div>
          )}

          {/* Filter Actions */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {getActiveFiltersCount() > 0 && (
                <span>{getActiveFiltersCount()} filtro{getActiveFiltersCount() > 1 ? 's' : ''} ativo{getActiveFiltersCount() > 1 ? 's' : ''}</span>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={clearSearch}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors btn-interactive"
              >
                Limpar tudo
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors btn-interactive"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientSearch;