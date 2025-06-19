import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Calendar, Users, Car, BarChart3, Settings, 
  Menu, LogOut, Building2
} from 'lucide-react';

const Sidebar = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'schedule', label: 'Agenda', icon: Calendar, path: '/schedule' },
    { id: 'patients', label: 'Pacientes', icon: Users, path: '/patients' },
    { id: 'drivers', label: 'Motoristas', icon: Car, path: '/drivers' },
    { id: 'reports', label: 'Relatórios', icon: BarChart3, path: '/reports' },
    { id: 'settings', label: 'Configurações', icon: Settings, path: '/settings' }
  ];

  const currentPath = location.pathname === '/' ? '/dashboard' : location.pathname;

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    } min-h-screen shadow-lg`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Building2 size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">LabScheduler</h1>
                <p className="text-xs text-gray-300">Sistema de Agendamento</p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="mx-auto p-2 bg-blue-600 rounded-lg">
              <Building2 size={20} className="text-white" />
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                currentPath === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
        <button className="w-full flex items-center space-x-3 px-3 py-3 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800">
          <LogOut size={20} />
          {!sidebarCollapsed && <span className="font-medium">Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;