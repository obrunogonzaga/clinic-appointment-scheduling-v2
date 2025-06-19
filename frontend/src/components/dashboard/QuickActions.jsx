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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800">Ações Rápidas</h3>
        <div className="ml-3 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="group relative p-6 border border-gray-200 rounded-xl hover:border-blue-300 transition-all duration-300 text-center hover:shadow-lg hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50 hover:from-blue-50 hover:to-white"
          >
            <div className="relative z-10">
              <div className={`mx-auto mb-4 p-3 rounded-xl bg-gray-100 group-hover:bg-white transition-colors duration-300 w-fit`}>
                <action.icon className={`${action.iconColor} group-hover:scale-110 transition-transform duration-300`} size={32} />
              </div>
              <p className="font-semibold text-gray-800 mb-2">{action.title}</p>
              <p className="text-sm text-gray-500 group-hover:text-gray-600">{action.description}</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 rounded-xl transition-all duration-300"></div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;