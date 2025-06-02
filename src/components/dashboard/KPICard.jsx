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
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${getChangeColor(changeType)}`}>
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${iconBgColor}`}>
            <Icon className={iconColor} size={24} />
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;