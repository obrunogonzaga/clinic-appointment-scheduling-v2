import React from 'react';
import { Calendar, UserCheck, Car, Clock } from 'lucide-react';
import KPICard from '../components/dashboard/KPICard';
import QuickActions from '../components/dashboard/QuickActions';
import RecentActivity from '../components/dashboard/RecentActivity';
import CarStatus from '../components/dashboard/CarStatus';

const Dashboard = () => {
  const kpiData = [
    {
      title: 'Visitas Hoje',
      value: '45',
      change: '+12% vs ontem',
      changeType: 'positive',
      icon: Calendar,
      iconColor: 'text-blue-600',
      iconBgColor: 'bg-blue-100'
    },
    {
      title: 'Taxa de Confirmação',
      value: '73%',
      change: '17 pendentes',
      changeType: 'warning',
      icon: UserCheck,
      iconColor: 'text-green-600',
      iconBgColor: 'bg-green-100'
    },
    {
      title: 'Carros Ativos',
      value: '3/4',
      change: '75% utilização',
      changeType: 'neutral',
      icon: Car,
      iconColor: 'text-purple-600',
      iconBgColor: 'bg-purple-100'
    },
    {
      title: 'Tempo Médio/Visita',
      value: '38min',
      change: '-2min vs média',
      changeType: 'positive',
      icon: Clock,
      iconColor: 'text-orange-600',
      iconBgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi, index) => (
          <KPICard key={index} {...kpi} />
        ))}
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity and Car Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <CarStatus />
      </div>
    </div>
  );
};

export default Dashboard;