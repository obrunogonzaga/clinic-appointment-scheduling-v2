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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Atividade Recente</h3>
      <div className="space-y-3">
        {activities.map((activity, idx) => (
          <div key={idx} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
            <activity.icon className={activity.color} size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium">{activity.action}</p>
              <p className="text-xs text-gray-500">{activity.time} atrás</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;