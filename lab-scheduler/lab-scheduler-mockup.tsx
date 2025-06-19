import React, { useState, useRef } from 'react';
import { 
  Calendar, Upload, FileSpreadsheet, Check, AlertCircle, ChevronRight, ChevronLeft, 
  Settings, Download, Phone, MapPin, User, Clock, Car, GripVertical, X, Plus, 
  Edit2, Save, Search, Menu, Bell, LogOut, Home, Users, BarChart3, ClipboardList,
  Activity, Filter, RefreshCw, CheckCircle, XCircle, AlertTriangle, Briefcase,
  Building2, PieChart, TrendingUp, UserCheck, CalendarDays
} from 'lucide-react';

const LabSchedulerDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Estados do processo de upload
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [showEventDetails, setShowEventDetails] = useState(null);
  const fileInputRef = useRef(null);

  // Mock data
  const mockEvents = {
    'CARRO 1': [
      {
        id: 1,
        patientName: 'Ana Costa Silva',
        time: '07:00',
        duration: 40,
        address: 'Rua das Palmeiras, 230 - Recreio',
        phone: '(21) 98765-4321',
        exams: ['IGA', 'IGFBP3', 'T4 LIVRE'],
        status: 'Não Confirmado',
        cpf: '123.456.789-01',
        healthPlan: 'Bradesco Saúde',
        cardNumber: '123456789',
        color: '#FF6B6B'
      },
      {
        id: 2,
        patientName: 'Elena Silva Castro',
        time: '07:40',
        duration: 40,
        address: 'Rua das Orquídeas, 78 - Tijuca',
        phone: '(21) 94567-8901',
        exams: ['COLESTEROL', 'CREATININA'],
        status: 'Confirmado',
        cpf: '567.890.123-45',
        healthPlan: 'Unimed',
        cardNumber: '987654321',
        color: '#4ECDC4'
      }
    ],
    'CARRO 2': [
      {
        id: 4,
        patientName: 'Bruno Santos Lima',
        time: '07:00',
        duration: 40,
        address: 'Av. das Américas, 1840 - Barra',
        phone: '(21) 91234-5678',
        exams: ['HEMOGRAMA', 'FERRITINA'],
        status: 'Confirmado',
        cpf: '234.567.890-12',
        healthPlan: 'Bradesco Saúde',
        cardNumber: '234567890',
        color: '#4ECDC4'
      }
    ],
    'CARRO 3': [
      {
        id: 6,
        patientName: 'Henrique Lima Santos',
        time: '08:20',
        duration: 40,
        address: 'Rua Barão de Ipanema, 567 - Copacabana',
        phone: '(21) 97890-1234',
        exams: ['HEMOGLOBINA GLICADA', 'GLICOSE'],
        status: 'Não Confirmado',
        cpf: '890.123.456-78',
        healthPlan: 'Golden Cross',
        cardNumber: '890123456',
        color: '#FF6B6B'
      }
    ]
  };

  const notifications = [
    { id: 1, type: 'warning', message: '5 pacientes aguardando confirmação', time: '5 min' },
    { id: 2, type: 'success', message: 'Agenda do CARRO 2 otimizada', time: '15 min' },
    { id: 3, type: 'info', message: 'Nova planilha disponível para download', time: '1h' }
  ];

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'schedule', label: 'Agenda', icon: Calendar },
    { id: 'patients', label: 'Pacientes', icon: Users },
    { id: 'drivers', label: 'Motoristas', icon: Car },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings }
  ];

  // Handlers
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      setTimeout(() => {
        setProcessedData(mockEvents);
      }, 1000);
    }
  };

  const handleDragStart = (event, car) => {
    setDraggedEvent({ event, car });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetCar) => {
    e.preventDefault();
    if (draggedEvent && targetCar !== draggedEvent.car) {
      console.log(`Movendo ${draggedEvent.event.patientName} de ${draggedEvent.car} para ${targetCar}`);
    }
    setDraggedEvent(null);
  };

  // Components
  const Sidebar = () => (
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
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                currentView === item.id
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

  const Header = () => (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {menuItems.find(item => item.id === currentView)?.label || 'Dashboard'}
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

  const DashboardView = () => (
    <div className="p-6 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Visitas Hoje</p>
              <p className="text-3xl font-bold text-gray-800">45</p>
              <p className="text-xs text-green-600 mt-1">+12% vs ontem</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Taxa de Confirmação</p>
              <p className="text-3xl font-bold text-gray-800">73%</p>
              <p className="text-xs text-yellow-600 mt-1">17 pendentes</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Carros Ativos</p>
              <p className="text-3xl font-bold text-gray-800">3/4</p>
              <p className="text-xs text-blue-600 mt-1">75% utilização</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Car className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tempo Médio/Visita</p>
              <p className="text-3xl font-bold text-gray-800">38min</p>
              <p className="text-xs text-green-600 mt-1">-2min vs média</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setCurrentView('schedule')}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileSpreadsheet className="mx-auto mb-2 text-blue-600" size={32} />
            <p className="font-medium">Importar Planilha</p>
            <p className="text-sm text-gray-500 mt-1">Processar nova agenda DasaExp</p>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Phone className="mx-auto mb-2 text-green-600" size={32} />
            <p className="font-medium">Confirmar Pacientes</p>
            <p className="text-sm text-gray-500 mt-1">17 aguardando confirmação</p>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <BarChart3 className="mx-auto mb-2 text-purple-600" size={32} />
            <p className="font-medium">Gerar Relatório</p>
            <p className="text-sm text-gray-500 mt-1">Exportar dados da semana</p>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Atividade Recente</h3>
          <div className="space-y-3">
            {[
              { action: 'Planilha processada', time: '10 min', icon: CheckCircle, color: 'text-green-600' },
              { action: 'CARRO 2 - Rota otimizada', time: '25 min', icon: TrendingUp, color: 'text-blue-600' },
              { action: '3 pacientes confirmados', time: '1h', icon: UserCheck, color: 'text-green-600' },
              { action: 'Conflito de horário detectado', time: '2h', icon: AlertTriangle, color: 'text-yellow-600' }
            ].map((activity, idx) => (
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

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Status dos Carros</h3>
          <div className="space-y-4">
            {Object.entries(mockEvents).map(([car, events]) => (
              <div key={car} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Car className="text-gray-600" size={20} />
                  <div>
                    <p className="font-medium">{car}</p>
                    <p className="text-sm text-gray-500">{events.length} visitas agendadas</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-green-600">Ativo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Step Indicator
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {[1, 2, 3].map((step) => (
          <React.Fragment key={step}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
              currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {currentStep > step ? <Check size={20} /> : step}
            </div>
            {step < 3 && (
              <div className={`w-20 h-1 ${
                currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );

  // Upload Step
  const UploadStep = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          <FileSpreadsheet className="inline mr-2" size={28} />
          Upload da Planilha DasaExp
        </h2>
        
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
        >
          <Upload size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-lg mb-2">Clique para selecionar ou arraste o arquivo</p>
          <p className="text-sm text-gray-500">Formatos aceitos: .xlsx, .xls, .csv</p>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {uploadedFile && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <Check className="text-green-600 mr-2" size={20} />
              <span className="font-medium">{uploadedFile.name}</span>
            </div>
            <button
              onClick={() => setCurrentStep(2)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              Processar
              <ChevronRight className="ml-2" size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Processing Step
  const ProcessingStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          <Settings className="inline mr-2 animate-spin" size={28} />
          Processando Dados
        </h2>

        <div className="space-y-4">
          <div className="flex items-center p-4 bg-blue-50 rounded-lg">
            <Check className="text-blue-600 mr-3" size={20} />
            <span>45 agendamentos encontrados</span>
          </div>
          
          <div className="flex items-center p-4 bg-blue-50 rounded-lg">
            <Check className="text-blue-600 mr-3" size={20} />
            <span>3 carros identificados (CARRO 1, CARRO 2, CARRO 3)</span>
          </div>
          
          <div className="flex items-center p-4 bg-blue-50 rounded-lg">
            <Check className="text-blue-600 mr-3" size={20} />
            <span>38 coletas domiciliares processadas</span>
          </div>

          <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
            <AlertCircle className="text-yellow-600 mr-3" size={20} />
            <span>17 pacientes aguardando confirmação</span>
          </div>
        </div>

        <div className="mt-8 flex justify-between">
          <button
            onClick={() => setCurrentStep(1)}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
          >
            <ChevronLeft className="mr-2" size={20} />
            Voltar
          </button>
          
          <button
            onClick={() => setCurrentStep(3)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            Visualizar Agenda
            <ChevronRight className="ml-2" size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  // Event Details Modal
  const EventDetailsModal = ({ event, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">{event.patientName}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Clock className="mr-2 text-gray-500" size={16} />
            <span>{event.time} - {event.duration} minutos</span>
          </div>

          <div className="flex items-center text-sm">
            <MapPin className="mr-2 text-gray-500" size={16} />
            <span>{event.address}</span>
          </div>

          <div className="flex items-center text-sm">
            <Phone className="mr-2 text-gray-500" size={16} />
            <span>{event.phone}</span>
          </div>

          <div className="flex items-center text-sm">
            <User className="mr-2 text-gray-500" size={16} />
            <span>CPF: {event.cpf}</span>
          </div>

          <div className="border-t pt-3">
            <p className="font-semibold mb-2">Exames:</p>
            <div className="flex flex-wrap gap-2">
              {event.exams.map((exam, idx) => (
                <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {exam}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="text-sm"><strong>Convênio:</strong> {event.healthPlan}</p>
            <p className="text-sm"><strong>Carteirinha:</strong> {event.cardNumber}</p>
          </div>

          <div className="border-t pt-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
              event.status === 'Confirmado' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {event.status}
            </span>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
            <Edit2 className="inline mr-2" size={16} />
            Editar
          </button>
          <button className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors">
            <Phone className="inline mr-2" size={16} />
            Ligar
          </button>
        </div>
      </div>
    </div>
  );

  // Calendar Event Component
  const CalendarEvent = ({ event, car }) => (
    <div
      draggable
      onDragStart={(e) => handleDragStart(event, car)}
      onClick={() => setShowEventDetails(event)}
      className={`p-2 rounded cursor-move hover:shadow-md transition-shadow ${
        event.status === 'Confirmado' ? 'bg-green-100 border-green-300' : 'bg-yellow-100 border-yellow-300'
      } border`}
      style={{ marginBottom: '4px' }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <GripVertical className="inline mr-1 text-gray-400" size={14} />
          <span className="font-medium text-sm">{event.time}</span>
          <p className="text-xs font-semibold mt-1">{event.patientName}</p>
          <p className="text-xs text-gray-600">{event.address.split(' - ')[1]}</p>
        </div>
        {event.status === 'Não Confirmado' && (
          <AlertCircle className="text-yellow-600" size={16} />
        )}
      </div>
    </div>
  );

  // Calendar View
  const CalendarView = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          <Calendar className="inline mr-2" size={28} />
          Agenda - 10/05/2025
        </h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Search className="inline mr-2" size={16} />
              Buscar
            </button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              <Download className="inline mr-2" size={16} />
              Exportar
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus className="inline mr-2" size={16} />
              Nova Visita
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-4 gap-4">
        {/* Time Column */}
        <div className="border-r pr-4">
          <div className="font-semibold mb-4 text-center">Horários</div>
          {['07:00', '08:00', '09:00', '10:00', '11:00'].map((time) => (
            <div key={time} className="h-20 border-t pt-1 text-sm text-gray-500">
              {time}
            </div>
          ))}
        </div>

        {/* Cars Columns */}
        {Object.entries(mockEvents).map(([car, events]) => (
          <div
            key={car}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, car)}
            className="relative"
          >
            <div className="font-semibold mb-4 text-center flex items-center justify-center">
              <Car className="mr-2" size={20} />
              {car}
            </div>
            
            <div className="relative">
              {['07:00', '08:00', '09:00', '10:00', '11:00'].map((_, idx) => (
                <div key={idx} className="h-20 border-t" />
              ))}
              
              {/* Events positioned absolutely */}
              <div className="absolute top-0 left-0 right-0">
                {events.map((event) => {
                  const hour = parseInt(event.time.split(':')[0]);
                  const minutes = parseInt(event.time.split(':')[1]);
                  const topPosition = ((hour - 7) * 80) + (minutes / 60 * 80);
                  
                  return (
                    <div
                      key={event.id}
                      style={{ 
                        position: 'absolute',
                        top: `${topPosition}px`,
                        left: '4px',
                        right: '4px',
                        height: `${(event.duration / 60) * 80 - 4}px`
                      }}
                    >
                      <CalendarEvent event={event} car={car} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-6 pt-6 border-t grid grid-cols-4 gap-4 text-center">
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-2xl font-bold text-gray-800">11</p>
          <p className="text-sm text-gray-600">Total de Visitas</p>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <p className="text-2xl font-bold text-green-600">6</p>
          <p className="text-sm text-gray-600">Confirmadas</p>
        </div>
        <div className="bg-yellow-50 p-3 rounded">
          <p className="text-2xl font-bold text-yellow-600">5</p>
          <p className="text-sm text-gray-600">Aguardando</p>
        </div>
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-2xl font-bold text-blue-600">3</p>
          <p className="text-sm text-gray-600">Carros Ativos</p>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={() => setCurrentStep(2)}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center"
        >
          <ChevronLeft className="mr-2" size={20} />
          Voltar
        </button>
        
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center">
          <Save className="mr-2" size={20} />
          Salvar Alterações
        </button>
      </div>
    </div>
  );

  // Schedule View (with upload flow)
  const ScheduleView = () => (
    <div className="p-6">
      <StepIndicator />
      
      {currentStep === 1 && <UploadStep />}
      {currentStep === 2 && <ProcessingStep />}
      {currentStep === 3 && <CalendarView />}
    </div>
  );

  // Main content renderer
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'schedule':
        return <ScheduleView />;
      case 'patients':
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">Pacientes</h3>
              <p className="text-gray-500">Visualização de pacientes em desenvolvimento...</p>
            </div>
          </div>
        );
      case 'drivers':
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">Motoristas</h3>
              <p className="text-gray-500">Gestão de motoristas em desenvolvimento...</p>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">Relatórios</h3>
              <p className="text-gray-500">Módulo de relatórios em desenvolvimento...</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-xl font-bold mb-4">Configurações</h3>
              <p className="text-gray-500">Configurações do sistema em desenvolvimento...</p>
            </div>
          </div>
        );
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      
      {showEventDetails && (
        <EventDetailsModal 
          event={showEventDetails} 
          onClose={() => setShowEventDetails(null)} 
        />
      )}
    </div>
  );
};

export default LabSchedulerDashboard;