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
    } min-h-screen`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-8">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <Building2 size={32} className="text-blue-400" />
              <div>
                <h1 className="text-xl font-bold">LabScheduler</h1>
                <p className="text-xs text-gray-400">Sistema de Agendamento</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-gray-400 hover:text-white"
          >
            <Menu size={24} />
          </button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                currentPath === item.path
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
        <button className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800">
          <LogOut size={20} />
          {!sidebarCollapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;