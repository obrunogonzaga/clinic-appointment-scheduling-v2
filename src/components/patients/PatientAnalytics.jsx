import React, { useState } from 'react';
import { 
  BarChart3, PieChart, TrendingUp, TrendingDown, MapPin, 
  Calendar, Clock, Users, Activity, Phone, MessageSquare,
  Target, Award, AlertTriangle, CheckCircle, Filter,
  Download, RefreshCw, Eye, ChevronDown, ChevronUp
} from 'lucide-react';

const PatientAnalytics = ({ patients = [] }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [expandedCards, setExpandedCards] = useState([]);

  // Calculate comprehensive analytics
  const calculateAnalytics = () => {
    const total = patients.length;
    
    // Demographics
    const genderDistribution = {
      male: patients.filter(p => p.personalInfo?.gender === 'M').length,
      female: patients.filter(p => p.personalInfo?.gender === 'F').length
    };
    
    const ageGroups = {
      '18-30': 0,
      '31-45': 0,
      '46-60': 0,
      '60+': 0
    };
    
    patients.forEach(p => {
      if (p.personalInfo?.birthDate) {
        const age = new Date().getFullYear() - new Date(p.personalInfo.birthDate).getFullYear();
        if (age <= 30) ageGroups['18-30']++;
        else if (age <= 45) ageGroups['31-45']++;
        else if (age <= 60) ageGroups['46-60']++;
        else ageGroups['60+']++;
      }
    });

    // Confirmation metrics
    const confirmationRates = patients.map(p => p.confirmationTracking?.confirmationRate || 0);
    const avgConfirmationRate = confirmationRates.length > 0 
      ? confirmationRates.reduce((a, b) => a + b, 0) / confirmationRates.length 
      : 0;

    const confirmationByMethod = {
      phone: { total: 0, successful: 0 },
      sms: { total: 0, successful: 0 },
      whatsapp: { total: 0, successful: 0 },
      email: { total: 0, successful: 0 }
    };

    patients.forEach(p => {
      p.confirmationTracking?.confirmationAttempts?.forEach(attempt => {
        if (confirmationByMethod[attempt.method]) {
          confirmationByMethod[attempt.method].total++;
          if (attempt.status === 'confirmed') {
            confirmationByMethod[attempt.method].successful++;
          }
        }
      });
    });

    // Geographic insights
    const neighborhoodData = {};
    patients.forEach(p => {
      const neighborhood = p.contactInfo?.address?.neighborhood;
      if (neighborhood) {
        if (!neighborhoodData[neighborhood]) {
          neighborhoodData[neighborhood] = {
            count: 0,
            confirmed: 0,
            avgConfirmationTime: 0,
            riskDistribution: { low: 0, medium: 0, high: 0 }
          };
        }
        neighborhoodData[neighborhood].count++;
        if (p.status === 'confirmed') neighborhoodData[neighborhood].confirmed++;
        
        const risk = p.analytics?.riskScore || 'low';
        neighborhoodData[neighborhood].riskDistribution[risk]++;
      }
    });

    // Frequency patterns
    const frequencyDistribution = {
      frequent: patients.filter(p => p.analytics?.frequency === 'frequent').length,
      regular: patients.filter(p => p.analytics?.frequency === 'regular').length,
      occasional: patients.filter(p => p.analytics?.frequency === 'occasional').length
    };

    // Seasonal trends (mock data - in real app would be calculated from historical data)
    const seasonalTrends = {
      spring: { collections: 245, growth: 8.5 },
      summer: { collections: 198, growth: -12.3 },
      autumn: { collections: 287, growth: 15.2 },
      winter: { collections: 221, growth: -2.1 }
    };

    // Peak demand analysis
    const peakDemandTimes = {
      'monday': { demand: 1.20, collections: 156 },
      'tuesday': { demand: 1.10, collections: 142 },
      'wednesday': { demand: 1.05, collections: 136 },
      'thursday': { demand: 1.15, collections: 148 },
      'friday': { demand: 1.25, collections: 162 },
      'saturday': { demand: 0.80, collections: 104 },
      'sunday': { demand: 0.45, collections: 58 }
    };

    // Health plan analysis
    const healthPlanPerformance = {};
    patients.forEach(p => {
      const plan = p.healthPlan?.provider || 'Sem Convênio';
      if (!healthPlanPerformance[plan]) {
        healthPlanPerformance[plan] = {
          count: 0,
          confirmed: 0,
          avgCollections: 0,
          revenue: 0 // mock data
        };
      }
      healthPlanPerformance[plan].count++;
      if (p.status === 'confirmed') healthPlanPerformance[plan].confirmed++;
      healthPlanPerformance[plan].avgCollections += p.analytics?.totalCollections || 0;
      healthPlanPerformance[plan].revenue += (p.analytics?.totalCollections || 0) * 85; // mock price
    });

    Object.keys(healthPlanPerformance).forEach(plan => {
      const data = healthPlanPerformance[plan];
      data.avgCollections = data.count > 0 ? data.avgCollections / data.count : 0;
      data.confirmationRate = data.count > 0 ? data.confirmed / data.count : 0;
    });

    // Risk analysis
    const riskAnalysis = {
      low: patients.filter(p => p.analytics?.riskScore === 'low').length,
      medium: patients.filter(p => p.analytics?.riskScore === 'medium').length,
      high: patients.filter(p => p.analytics?.riskScore === 'high').length
    };

    // Predictive insights (mock data)
    const predictiveInsights = {
      churnRisk: {
        high: patients.filter(p => 
          (p.confirmationTracking?.confirmationRate || 1) < 0.6 && 
          p.analytics?.riskScore === 'high'
        ).length,
        medium: patients.filter(p => 
          (p.confirmationTracking?.confirmationRate || 1) < 0.8 && 
          p.analytics?.riskScore === 'medium'
        ).length
      },
      growthOpportunities: {
        regularToFrequent: patients.filter(p => 
          p.analytics?.frequency === 'regular' && 
          p.analytics?.riskScore === 'low'
        ).length,
        occasionalToRegular: patients.filter(p => 
          p.analytics?.frequency === 'occasional' && 
          p.confirmationTracking?.confirmationRate > 0.8
        ).length
      }
    };

    return {
      total,
      genderDistribution,
      ageGroups,
      avgConfirmationRate,
      confirmationByMethod,
      neighborhoodData,
      frequencyDistribution,
      seasonalTrends,
      peakDemandTimes,
      healthPlanPerformance,
      riskAnalysis,
      predictiveInsights
    };
  };

  const analytics = calculateAnalytics();

  // Format percentage
  const formatPercentage = (value) => `${(value * 100).toFixed(1)}%`;

  // Format currency
  const formatCurrency = (value) => `R$ ${value.toLocaleString('pt-BR')}`;

  // Toggle card expansion
  const toggleCard = (cardId) => {
    setExpandedCards(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId)
        : [...prev, cardId]
    );
  };

  // Metric cards configuration
  const metricCards = {
    overview: [
      {
        title: 'Visão Geral',
        icon: BarChart3,
        color: 'bg-blue-600',
        metrics: [
          { label: 'Total de Pacientes', value: analytics.total, format: 'number' },
          { label: 'Taxa de Confirmação Média', value: analytics.avgConfirmationRate, format: 'percentage' },
          { label: 'Pacientes Ativos', value: analytics.total - analytics.riskAnalysis.high, format: 'number' },
          { label: 'Risco Alto', value: analytics.riskAnalysis.high, format: 'number' }
        ]
      }
    ],
    demographics: [
      {
        title: 'Demografia',
        icon: Users,
        color: 'bg-purple-600',
        metrics: [
          { label: 'Masculino', value: analytics.genderDistribution.male / analytics.total, format: 'percentage' },
          { label: 'Feminino', value: analytics.genderDistribution.female / analytics.total, format: 'percentage' },
          { label: 'Idade Média', value: 45.3, format: 'number', suffix: ' anos' },
          { label: 'Faixa Predominante', value: '31-45 anos', format: 'text' }
        ]
      }
    ],
    confirmation: [
      {
        title: 'Confirmações',
        icon: CheckCircle,
        color: 'bg-green-600',
        metrics: Object.entries(analytics.confirmationByMethod).map(([method, data]) => ({
          label: method.toUpperCase(),
          value: data.total > 0 ? data.successful / data.total : 0,
          format: 'percentage',
          detail: `${data.successful}/${data.total}`
        }))
      }
    ],
    geographic: [
      {
        title: 'Análise Geográfica',
        icon: MapPin,
        color: 'bg-orange-600',
        metrics: Object.entries(analytics.neighborhoodData)
          .sort(([,a], [,b]) => b.count - a.count)
          .slice(0, 4)
          .map(([neighborhood, data]) => ({
            label: neighborhood,
            value: data.count,
            format: 'number',
            detail: `${formatPercentage(data.confirmed / data.count)} confirmação`
          }))
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Analytics Avançado de Pacientes</h3>
          <p className="text-sm text-gray-600 mt-1">
            Insights detalhados sobre comportamento e performance
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="week">Última Semana</option>
            <option value="month">Último Mês</option>
            <option value="quarter">Último Trimestre</option>
            <option value="year">Último Ano</option>
          </select>
          
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Download size={18} />
            <span>Exportar</span>
          </button>
        </div>
      </div>

      {/* Metric Selector */}
      <div className="flex space-x-2 border-b border-gray-200">
        {Object.keys(metricCards).map((metric) => (
          <button
            key={metric}
            onClick={() => setSelectedMetric(metric)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              selectedMetric === metric
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {metric === 'overview' && 'Visão Geral'}
            {metric === 'demographics' && 'Demografia'}
            {metric === 'confirmation' && 'Confirmações'}
            {metric === 'geographic' && 'Geografia'}
          </button>
        ))}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metricCards[selectedMetric]?.map((card, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <card.icon className="text-white" size={20} />
                  </div>
                  <h4 className="font-semibold text-gray-800">{card.title}</h4>
                </div>
                <button
                  onClick={() => toggleCard(`${selectedMetric}-${index}`)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {expandedCards.includes(`${selectedMetric}-${index}`) ? 
                    <ChevronUp size={20} /> : <ChevronDown size={20} />
                  }
                </button>
              </div>
              
              <div className="space-y-3">
                {card.metrics.slice(0, expandedCards.includes(`${selectedMetric}-${index}`) ? undefined : 3).map((metric, metricIndex) => (
                  <div key={metricIndex} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{metric.label}</span>
                    <div className="text-right">
                      <span className="font-semibold text-gray-800">
                        {metric.format === 'percentage' ? formatPercentage(metric.value) :
                         metric.format === 'currency' ? formatCurrency(metric.value) :
                         metric.format === 'text' ? metric.value :
                         `${metric.value}${metric.suffix || ''}`}
                      </span>
                      {metric.detail && (
                        <p className="text-xs text-gray-500">{metric.detail}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Advanced Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Frequency Distribution Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <Activity className="mr-2 text-indigo-600" size={20} />
            Distribuição de Frequência
          </h4>
          <div className="space-y-4">
            {Object.entries(analytics.frequencyDistribution).map(([frequency, count]) => {
              const percentage = (count / analytics.total) * 100;
              return (
                <div key={frequency}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {frequency === 'frequent' ? 'Frequente' :
                       frequency === 'regular' ? 'Regular' : 'Ocasional'}
                    </span>
                    <span className="text-sm text-gray-600">{count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        frequency === 'frequent' ? 'bg-green-500' :
                        frequency === 'regular' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Peak Demand Times */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <Clock className="mr-2 text-purple-600" size={20} />
            Picos de Demanda Semanal
          </h4>
          <div className="space-y-3">
            {Object.entries(analytics.peakDemandTimes).map(([day, data]) => {
              const dayNames = {
                monday: 'Segunda',
                tuesday: 'Terça',
                wednesday: 'Quarta',
                thursday: 'Quinta',
                friday: 'Sexta',
                saturday: 'Sábado',
                sunday: 'Domingo'
              };
              
              return (
                <div key={day} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {dayNames[day]}
                  </span>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      {data.demand > 1 ? (
                        <TrendingUp className="text-green-500 mr-1" size={16} />
                      ) : (
                        <TrendingDown className="text-red-500 mr-1" size={16} />
                      )}
                      <span className="text-sm font-semibold">
                        {(data.demand * 100).toFixed(0)}%
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {data.collections} coletas
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Health Plan Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <Award className="mr-2 text-green-600" size={20} />
            Performance por Convênio
          </h4>
          <div className="space-y-4">
            {Object.entries(analytics.healthPlanPerformance)
              .sort(([,a], [,b]) => b.count - a.count)
              .slice(0, 5)
              .map(([plan, data]) => (
                <div key={plan} className="border border-gray-100 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">{plan}</span>
                    <span className="text-sm text-gray-600">{data.count} pacientes</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Confirmação: </span>
                      <span className="font-medium">{formatPercentage(data.confirmationRate)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Receita: </span>
                      <span className="font-medium">{formatCurrency(data.revenue)}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Predictive Insights */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
            <Target className="mr-2 text-red-600" size={20} />
            Insights Preditivos
          </h4>
          <div className="space-y-4">
            <div className="bg-red-50 rounded-lg p-4">
              <h5 className="font-medium text-red-800 mb-2 flex items-center">
                <AlertTriangle className="mr-2" size={16} />
                Risco de Churn
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-red-700">Alto Risco:</span>
                  <span className="font-medium">{analytics.predictiveInsights.churnRisk.high} pacientes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">Médio Risco:</span>
                  <span className="font-medium">{analytics.predictiveInsights.churnRisk.medium} pacientes</span>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <h5 className="font-medium text-green-800 mb-2 flex items-center">
                <TrendingUp className="mr-2" size={16} />
                Oportunidades de Crescimento
              </h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Regular → Frequente:</span>
                  <span className="font-medium">{analytics.predictiveInsights.growthOpportunities.regularToFrequent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Ocasional → Regular:</span>
                  <span className="font-medium">{analytics.predictiveInsights.growthOpportunities.occasionalToRegular}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
          <Eye className="mr-2 text-blue-600" size={20} />
          Recomendações Estratégicas
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-800 mb-2">Otimização de Confirmação</h5>
            <p className="text-sm text-gray-600">
              Foque em ligações telefônicas que têm {formatPercentage(0.95)} de taxa de sucesso, 
              especialmente para pacientes de alto risco.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-800 mb-2">Expansão Geográfica</h5>
            <p className="text-sm text-gray-600">
              Copacabana e Ipanema mostram alta densidade. Considere adicionar 
              mais carros nessas regiões.
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4">
            <h5 className="font-medium text-gray-800 mb-2">Retenção de Pacientes</h5>
            <p className="text-sm text-gray-600">
              {analytics.predictiveInsights.churnRisk.high} pacientes em risco de churn. 
              Implemente campanha de reengajamento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientAnalytics;