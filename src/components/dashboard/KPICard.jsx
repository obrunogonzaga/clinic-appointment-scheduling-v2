import React from 'react';

const KPICard = ({ title, value, change, changeType, icon: Icon, iconColor, iconBgColor }) => {
  const getChangeColor = (type) => {
    switch (type) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'neutral':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="relative bg-white p-6 rounded-xl shadow-sm border border-gray-100 card-hover group overflow-hidden">
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mb-2">{value}</p>
          {change && (
            <p className={`text-xs font-medium ${getChangeColor(changeType)} flex items-center`}>
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-4 rounded-xl ${iconBgColor} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
            <Icon className={iconColor} size={24} />
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 rounded-xl transition-all duration-300"></div>
    </div>
  );
};

export default KPICard;