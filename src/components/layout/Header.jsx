import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  RefreshCw, Bell, User, CheckCircle, AlertCircle
} from 'lucide-react';

const Header = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const location = useLocation();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { id: 'schedule', label: 'Agenda', path: '/schedule' },
    { id: 'patients', label: 'Pacientes', path: '/patients' },
    { id: 'drivers', label: 'Motoristas', path: '/drivers' },
    { id: 'reports', label: 'Relatórios', path: '/reports' },
    { id: 'settings', label: 'Configurações', path: '/settings' }
  ];

  const notifications = [
    { id: 1, type: 'warning', message: '5 pacientes aguardando confirmação', time: '5 min' },
    { id: 2, type: 'success', message: 'Agenda do CARRO 2 otimizada', time: '15 min' },
    { id: 3, type: 'info', message: 'Nova planilha disponível para download', time: '1h' }
  ];

  const currentPath = location.pathname === '/' ? '/dashboard' : location.pathname;
  const currentItem = menuItems.find(item => item.path === currentPath);

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {currentItem?.label || 'Dashboard'}
          </h2>
          <p className="text-sm text-gray-500 mt-1 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 group"
          >
            <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl relative transition-all duration-200 group"
            >
              <Bell size={18} className="group-hover:animate-swing" />
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-lg"></span>
              <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200/50 z-50 overflow-hidden">
                <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50 to-purple-50">
                  <h3 className="font-bold text-gray-800">Notificações</h3>
                  <p className="text-xs text-gray-500 mt-1">{notifications.length} novas</p>
                </div>
                <div className="max-h-96 overflow-y-auto custom-scrollbar">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-4 border-b border-gray-100/50 hover:bg-gray-50/50 transition-colors duration-200 group cursor-pointer">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          notif.type === 'warning' ? 'bg-yellow-100' :
                          notif.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
                        } group-hover:scale-110 transition-transform duration-200`}>
                          {notif.type === 'warning' && <AlertCircle className="text-yellow-600" size={16} />}
                          {notif.type === 'success' && <CheckCircle className="text-green-600" size={16} />}
                          {notif.type === 'info' && <Bell className="text-blue-600" size={16} />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">{notif.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.time} atrás</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-800">Fabiano Oliveira</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group">
                <User size={20} className="text-white group-hover:scale-110 transition-transform duration-200" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;