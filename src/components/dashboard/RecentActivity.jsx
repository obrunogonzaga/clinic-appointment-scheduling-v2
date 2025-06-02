import React from 'react';
import { CheckCircle, TrendingUp, UserCheck, AlertTriangle } from 'lucide-react';

const RecentActivity = () => {
  const activities = [
    { 
      action: 'Planilha processada', 
      time: '10 min', 
      icon: CheckCircle, 
      color: 'text-green-600' 
    },
    { 
      action: 'CARRO 2 - Rota otimizada', 
      time: '25 min', 
      icon: TrendingUp, 
      color: 'text-blue-600' 
    },
    { 
      action: '3 pacientes confirmados', 
      time: '1h', 
      icon: UserCheck, 
      color: 'text-green-600' 
    },
    { 
      action: 'Conflito de horário detectado', 
      time: '2h', 
      icon: AlertTriangle, 
      color: 'text-yellow-600' 
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <h3 className="text-xl font-bold text-gray-800">Atividade Recente</h3>
          <div className="ml-3 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors">
          Ver todas
        </button>
      </div>
      <div className="space-y-3">
        {activities.map((activity, idx) => (
          <div key={idx} className="group flex items-center space-x-4 p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 rounded-xl transition-all duration-300 cursor-pointer border border-transparent hover:border-blue-100">
            <div className={`p-2 rounded-lg bg-gray-100 group-hover:bg-white transition-colors duration-300 group-hover:shadow-sm`}>
              <activity.icon className={`${activity.color} group-hover:scale-110 transition-transform duration-300`} size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 group-hover:text-gray-900">{activity.action}</p>
              <p className="text-xs text-gray-500 group-hover:text-gray-600 mt-1">{activity.time} atrás</p>
            </div>
            <div className="w-2 h-2 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;