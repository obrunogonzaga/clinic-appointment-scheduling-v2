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
    <div className={`bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white transition-all duration-300 ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    } min-h-screen relative shadow-xl`}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10"></div>
      
      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between mb-8">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-xl">
                <Building2 size={28} className="text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  LabScheduler
                </h1>
                <p className="text-xs text-gray-400">Sistema de Agendamento</p>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="mx-auto p-2 bg-blue-500/20 rounded-xl">
              <Building2 size={24} className="text-blue-400" />
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-all duration-200"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`group w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                currentPath === item.path
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                  : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
              }`}
            >
              <item.icon size={20} className={`${
                currentPath === item.path ? 'text-white' : 'group-hover:scale-110 transition-transform duration-200'
              }`} />
              {!sidebarCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
              {currentPath === item.path && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl"></div>
              )}
            </button>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700/50">
        <button className="w-full flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-white rounded-xl hover:bg-gray-800/50 transition-all duration-200 group">
          <LogOut size={20} className="group-hover:scale-110 transition-transform duration-200" />
          {!sidebarCollapsed && <span className="font-medium">Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;