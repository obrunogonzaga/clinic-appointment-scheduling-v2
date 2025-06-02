import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, Phone, BarChart3 } from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'import',
      title: 'Importar Planilha',
      description: 'Processar nova agenda DasaExp',
      icon: FileSpreadsheet,
      iconColor: 'text-blue-600',
      onClick: () => navigate('/schedule')
    },
    {
      id: 'confirm',
      title: 'Confirmar Pacientes',
      description: '17 aguardando confirmação',
      icon: Phone,
      iconColor: 'text-green-600',
      onClick: () => console.log('Confirmar pacientes')
    },
    {
      id: 'report',
      title: 'Gerar Relatório',
      description: 'Exportar dados da semana',
      icon: BarChart3,
      iconColor: 'text-purple-600',
      onClick: () => navigate('/reports')
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            <action.icon className={`mx-auto mb-2 ${action.iconColor}`} size={32} />
            <p className="font-medium">{action.title}</p>
            <p className="text-sm text-gray-500 mt-1">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;