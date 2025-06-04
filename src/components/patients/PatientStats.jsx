import React from 'react';
import { 
  Users, UserCheck, Clock, Calendar, TrendingUp, AlertTriangle,
  Phone, MapPin, Car, Activity, PieChart, BarChart3
} from 'lucide-react';

const PatientStats = ({ patients = [] }) => {
  // Calculate statistics
  const calculateStats = () => {
    const total = patients.length;
    const confirmed = patients.filter(p => p.status === 'confirmed').length;
    const pending = patients.filter(p => p.status === 'pending').length;
    const todayDate = new Date().toDateString();
    const todayPatients = patients.filter(p => {
      const scheduleDate = p.nextScheduledDate ? new Date(p.nextScheduledDate).toDateString() : null;
      return scheduleDate === todayDate;
    }).length;

    // Confirmation rates
    const confirmationRates = patients.map(p => p.confirmationTracking?.confirmationRate || 0);
    const avgConfirmationRate = confirmationRates.length > 0
      ? (confirmationRates.reduce((a, b) => a + b, 0) / confirmationRates.length)
      : 0;

    // Risk distribution
    const riskDistribution = {
      low: patients.filter(p => p.analytics?.riskScore === 'low').length,
      medium: patients.filter(p => p.analytics?.riskScore === 'medium').length,
      high: patients.filter(p => p.analytics?.riskScore === 'high').length
    };

    // Frequency distribution
    const frequencyDistribution = {
      frequent: patients.filter(p => p.analytics?.frequency === 'frequent').length,
      regular: patients.filter(p => p.analytics?.frequency === 'regular').length,
      occasional: patients.filter(p => p.analytics?.frequency === 'occasional').length
    };

    // Top neighborhoods
    const neighborhoodCounts = {};
    patients.forEach(p => {
      const neighborhood = p.contactInfo?.address?.neighborhood;
      if (neighborhood) {
        neighborhoodCounts[neighborhood] = (neighborhoodCounts[neighborhood] || 0) + 1;
      }
    });
    const topNeighborhoods = Object.entries(neighborhoodCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    // Car assignments
    const carAssignments = {};
    patients.forEach(p => {
      const car = p.assignedCar || 'Não Atribuído';
      carAssignments[car] = (carAssignments[car] || 0) + 1;
    });

    // Health plan distribution
    const healthPlanCounts = {};
    patients.forEach(p => {
      const plan = p.healthPlan?.provider || 'Sem Convênio';
      healthPlanCounts[plan] = (healthPlanCounts[plan] || 0) + 1;
    });
    const topHealthPlans = Object.entries(healthPlanCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return {
      total,
      confirmed,
      pending,
      todayPatients,
      avgConfirmationRate,
      riskDistribution,
      frequencyDistribution,
      topNeighborhoods,
      carAssignments,
      topHealthPlans
    };
  };

  const stats = calculateStats();

  // KPI Card Component
  const KPICard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-600 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className={`mr-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`} size={14} />
              <span className={`text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 ${color} rounded-lg`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );

  // Distribution Card Component
  const DistributionCard = ({ title, data, icon: Icon, colors }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <Icon className="text-gray-400" size={20} />
      </div>
      <div className="space-y-3">
        {Object.entries(data).map(([key, value], index) => {
          const percentage = stats.total > 0 ? ((value / stats.total) * 100).toFixed(1) : 0;
          return (
            <div key={key}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600 capitalize">{key}</span>
                <span className="text-sm font-medium">{value} ({percentage}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${colors[index % colors.length]}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Top Items Card Component
  const TopItemsCard = ({ title, items, icon: Icon, valueLabel = 'pacientes' }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <Icon className="text-gray-400" size={20} />
      </div>
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map(([name, count], index) => (
            <div key={name} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className={`text-lg font-bold ${
                  index === 0 ? 'text-yellow-500' : 
                  index === 1 ? 'text-gray-400' : 
                  'text-orange-600'
                } mr-3`}>
                  {index + 1}º
                </span>
                <span className="text-sm text-gray-700">{name}</span>
              </div>
              <span className="text-sm font-medium text-gray-600">
                {count} {valueLabel}
              </span>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">Nenhum dado disponível</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total de Pacientes"
          value={stats.total}
          subtitle={`${stats.confirmed} confirmados`}
          icon={Users}
          color="bg-blue-600"
        />
        
        <KPICard
          title="Agendados Hoje"
          value={stats.todayPatients}
          subtitle={`${stats.pending} pendentes`}
          icon={Calendar}
          color="bg-green-600"
        />
        
        <KPICard
          title="Taxa de Confirmação"
          value={`${(stats.avgConfirmationRate * 100).toFixed(0)}%`}
          subtitle="Média geral"
          icon={UserCheck}
          color="bg-purple-600"
          trend={5}
        />
        
        <KPICard
          title="Pacientes em Risco"
          value={stats.riskDistribution.high}
          subtitle={`${((stats.riskDistribution.high / stats.total) * 100).toFixed(0)}% do total`}
          icon={AlertTriangle}
          color="bg-red-600"
        />
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DistributionCard
          title="Distribuição por Risco"
          data={stats.riskDistribution}
          icon={AlertTriangle}
          colors={['bg-green-500', 'bg-yellow-500', 'bg-red-500']}
        />
        
        <DistributionCard
          title="Frequência de Coletas"
          data={stats.frequencyDistribution}
          icon={Activity}
          colors={['bg-blue-500', 'bg-indigo-500', 'bg-purple-500']}
        />
        
        <TopItemsCard
          title="Top Bairros"
          items={stats.topNeighborhoods}
          icon={MapPin}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Distribuição por Carro</h3>
            <Car className="text-gray-400" size={20} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(stats.carAssignments).map(([car, count]) => (
              <div key={car} className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-800">{count}</p>
                <p className="text-sm text-gray-600">{car}</p>
              </div>
            ))}
          </div>
        </div>
        
        <TopItemsCard
          title="Top Convênios"
          items={stats.topHealthPlans}
          icon={BarChart3}
        />
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold text-blue-600">
              {stats.confirmed}
            </p>
            <p className="text-sm text-gray-600">Confirmados</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-yellow-600">
              {stats.pending}
            </p>
            <p className="text-sm text-gray-600">Pendentes</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-green-600">
              {stats.riskDistribution.low}
            </p>
            <p className="text-sm text-gray-600">Baixo Risco</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-purple-600">
              {stats.frequencyDistribution.frequent}
            </p>
            <p className="text-sm text-gray-600">Frequentes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientStats;