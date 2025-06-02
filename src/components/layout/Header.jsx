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
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {currentItem?.label || 'Dashboard'}
          </h2>
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.location.reload()}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw size={20} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg relative"
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold">Notificações</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                      <div className="flex items-start space-x-3">
                        {notif.type === 'warning' && <AlertCircle className="text-yellow-500" size={20} />}
                        {notif.type === 'success' && <CheckCircle className="text-green-500" size={20} />}
                        {notif.type === 'info' && <Bell className="text-blue-500" size={20} />}
                        <div className="flex-1">
                          <p className="text-sm">{notif.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.time} atrás</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium">Fabiano Oliveira</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <User size={20} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;