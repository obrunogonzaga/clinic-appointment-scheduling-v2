import React, { useState } from 'react';
import { 
  MessageSquare, Phone, Send, Mail, Clock, CheckCircle, 
  AlertCircle, User, Calendar, Plus, Edit2, X, Copy,
  Smartphone, MessageCircle, PhoneCall, Loader2, 
  History, Filter, Search, Download, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';

const CommunicationHub = ({ patient, onUpdate, onAction }) => {
  const [activeTab, setActiveTab] = useState('send');
  const [messageType, setMessageType] = useState('sms');
  const [messageTemplate, setMessageTemplate] = useState('appointment_reminder');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [sending, setSending] = useState(false);
  const [filterHistory, setFilterHistory] = useState('all');
  const [searchHistory, setSearchHistory] = useState('');

  // Message templates
  const messageTemplates = {
    appointment_reminder: {
      name: 'Lembrete de Coleta',
      sms: `Olá {nome}, sua coleta está agendada para {data} às {hora}. Local: {endereco}. Para confirmar, responda SIM.`,
      whatsapp: `🔬 *Lembrete de Coleta*\n\nOlá {nome}!\n\nSua coleta domiciliar está agendada para:\n📅 *{data}*\n⏰ *{hora}*\n📍 *{endereco}*\n\nPara confirmar, responda *SIM*.\n\nEquipe DASA`,
      email: `Prezado(a) {nome},\n\nLembramos que sua coleta domiciliar está agendada para {data} às {hora}.\n\nEndereço: {endereco}\n\nPara confirmar o agendamento, responda este e-mail.\n\nAtenciosamente,\nEquipe DASA`
    },
    appointment_confirmation: {
      name: 'Confirmação de Agendamento',
      sms: `{nome}, sua coleta foi confirmada para {data} às {hora}. Nosso técnico chegará no horário. Dúvidas? Ligue (21) 3003-3230.`,
      whatsapp: `✅ *Coleta Confirmada*\n\nOlá {nome}!\n\nSua coleta foi confirmada:\n📅 *{data}*\n⏰ *{hora}*\n\nNosso técnico chegará no horário agendado.\n\n📞 Dúvidas? (21) 3003-3230`,
      email: `Prezado(a) {nome},\n\nConfirmamos sua coleta domiciliar para {data} às {hora}.\n\nNosso técnico chegará no horário agendado.\n\nPara dúvidas, entre em contato: (21) 3003-3230\n\nAtenciosamente,\nEquipe DASA`
    },
    appointment_reschedule: {
      name: 'Reagendamento',
      sms: `{nome}, precisamos reagendar sua coleta. Nova data: {data} às {hora}. Para confirmar, responda SIM.`,
      whatsapp: `📅 *Reagendamento*\n\nOlá {nome}!\n\nPrecisamos reagendar sua coleta:\n📅 *Nova data: {data}*\n⏰ *{hora}*\n\nPara confirmar, responda *SIM*.\n\nEquipe DASA`,
      email: `Prezado(a) {nome},\n\nInformamos que precisamos reagendar sua coleta.\n\nNova data: {data} às {hora}\n\nPara confirmar, responda este e-mail.\n\nAtenciosamente,\nEquipe DASA`
    },
    results_ready: {
      name: 'Resultados Prontos',
      sms: `{nome}, seus resultados estão prontos! Acesse o portal DASA ou retire na unidade. Código: {codigo}`,
      whatsapp: `📋 *Resultados Prontos*\n\nOlá {nome}!\n\nSeus exames estão prontos!\n\n🌐 Acesse: portal.dasa.com.br\n🏥 Retire na unidade\n🔑 Código: *{codigo}*`,
      email: `Prezado(a) {nome},\n\nInformamos que seus resultados de exames estão prontos.\n\nAcesse o portal DASA ou retire na unidade.\nCódigo de acesso: {codigo}\n\nAtenciosamente,\nEquipe DASA`
    },
    custom: {
      name: 'Mensagem Personalizada',
      sms: '',
      whatsapp: '',
      email: ''
    }
  };

  // Communication history (mock data - in real app, would come from API)
  const communicationHistory = [
    {
      id: 1,
      type: 'sms',
      direction: 'outbound',
      message: 'Olá Ana, sua coleta está agendada para 15/01/2025 às 08:30.',
      timestamp: '2025-01-14T15:30:00Z',
      status: 'delivered',
      operator: 'Sistema'
    },
    {
      id: 2,
      type: 'whatsapp',
      direction: 'inbound',
      message: 'SIM',
      timestamp: '2025-01-14T16:45:00Z',
      status: 'received',
      operator: 'Paciente'
    },
    {
      id: 3,
      type: 'phone',
      direction: 'outbound',
      message: 'Ligação para confirmação - Paciente confirmou',
      timestamp: '2025-01-13T14:20:00Z',
      status: 'completed',
      operator: 'Maria Santos',
      duration: '2m 30s'
    }
  ];

  // Contact methods from patient data
  const contactMethods = [
    {
      type: 'phone',
      value: patient?.contactInfo?.phones?.[0]?.number || '',
      label: 'Telefone Principal',
      primary: true
    },
    {
      type: 'sms',
      value: patient?.contactInfo?.phones?.[0]?.number || '',
      label: 'SMS',
      primary: true
    },
    {
      type: 'whatsapp',
      value: patient?.contactInfo?.phones?.[0]?.number || '',
      label: 'WhatsApp',
      primary: true
    },
    {
      type: 'email',
      value: patient?.personalInfo?.email || '',
      label: 'E-mail',
      primary: false
    }
  ].filter(method => method.value);

  // Message type configuration
  const messageTypeConfig = {
    sms: {
      label: 'SMS',
      icon: MessageSquare,
      color: 'text-green-600 bg-green-100',
      maxLength: 160
    },
    whatsapp: {
      label: 'WhatsApp',
      icon: MessageCircle,
      color: 'text-green-600 bg-green-100',
      maxLength: 1000
    },
    email: {
      label: 'E-mail',
      icon: Mail,
      color: 'text-blue-600 bg-blue-100',
      maxLength: 2000
    },
    phone: {
      label: 'Telefone',
      icon: Phone,
      color: 'text-purple-600 bg-purple-100',
      maxLength: 0
    }
  };

  // Get current template message
  const getCurrentMessage = () => {
    if (messageTemplate === 'custom') {
      return customMessage;
    }
    return messageTemplates[messageTemplate]?.[messageType] || '';
  };

  // Replace placeholders in message
  const replacePlaceholders = (message) => {
    const placeholders = {
      nome: patient?.personalInfo?.name || '[Nome]',
      data: patient?.nextScheduledDate ? new Date(patient.nextScheduledDate).toLocaleDateString('pt-BR') : '[Data]',
      hora: '[Horário]',
      endereco: patient?.contactInfo?.address?.street ? 
        `${patient.contactInfo.address.street}, ${patient.contactInfo.address.neighborhood}` : '[Endereço]',
      codigo: '[Código]'
    };

    let processedMessage = message;
    Object.entries(placeholders).forEach(([key, value]) => {
      processedMessage = processedMessage.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    return processedMessage;
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Send message
  const handleSendMessage = async () => {
    const message = getCurrentMessage();
    if (!message.trim()) {
      toast.error('Por favor, digite uma mensagem');
      return;
    }

    if (!selectedContacts.length) {
      toast.error('Selecione pelo menos um contato');
      return;
    }

    setSending(true);

    try {
      // Simulate sending message
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call action handler
      if (onAction) {
        await onAction(patient.id, messageType, {
          message: replacePlaceholders(message),
          contacts: selectedContacts,
          template: messageTemplate
        });
      }

      toast.success(`${messageTypeConfig[messageType].label} enviado com sucesso!`);
      
      // Reset form
      setCustomMessage('');
      setSelectedContacts([]);
      setMessageTemplate('appointment_reminder');
    } catch (error) {
      toast.error('Erro ao enviar mensagem');
    } finally {
      setSending(false);
    }
  };

  // Make phone call
  const handlePhoneCall = async (contact) => {
    if (onAction) {
      await onAction(patient.id, 'call', { contact });
    }
    toast.success(`Iniciando ligação para ${contact.value}`);
  };

  // Copy message to clipboard
  const handleCopyMessage = () => {
    const message = replacePlaceholders(getCurrentMessage());
    navigator.clipboard.writeText(message);
    toast.success('Mensagem copiada para a área de transferência');
  };

  // Filter communication history
  const filteredHistory = communicationHistory.filter(item => {
    if (filterHistory !== 'all' && item.type !== filterHistory) return false;
    if (searchHistory && !item.message.toLowerCase().includes(searchHistory.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Central de Comunicação</h3>
          <p className="text-sm text-gray-600 mt-1">
            Envie mensagens e gerencie comunicações com o paciente
          </p>
        </div>
        
        <button
          onClick={() => setActiveTab(activeTab === 'send' ? 'history' : 'send')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          {activeTab === 'send' ? <History size={18} /> : <Send size={18} />}
          <span>{activeTab === 'send' ? 'Ver Histórico' : 'Enviar Mensagem'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('send')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'send'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Enviar Mensagem
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Histórico de Comunicação
          </button>
        </div>
      </div>

      {/* Send Message Tab */}
      {activeTab === 'send' && (
        <div className="space-y-6">
          {/* Contact Methods */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Contatos Disponíveis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {contactMethods.map((contact, index) => {
                const config = messageTypeConfig[contact.type];
                const isSelected = selectedContacts.includes(contact);
                
                return (
                  <div
                    key={index}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      if (contact.type === 'phone') {
                        handlePhoneCall(contact);
                      } else {
                        setSelectedContacts(
                          isSelected
                            ? selectedContacts.filter(c => c !== contact)
                            : [...selectedContacts, contact]
                        );
                        setMessageType(contact.type);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${config.color}`}>
                          <config.icon size={18} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{contact.label}</p>
                          <p className="text-sm text-gray-600">{contact.value}</p>
                        </div>
                      </div>
                      
                      {contact.type === 'phone' ? (
                        <PhoneCall className="text-green-600" size={20} />
                      ) : (
                        isSelected && <CheckCircle className="text-blue-600" size={20} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Message Composition */}
          {selectedContacts.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-700">Compor Mensagem</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {messageTypeConfig[messageType].label}
                  </span>
                  <div className={`p-1 rounded ${messageTypeConfig[messageType].color}`}>
                    <messageTypeConfig[messageType].icon size={16} />
                  </div>
                </div>
              </div>

              {/* Template Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo de Mensagem
                </label>
                <select
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {Object.entries(messageTemplates).map(([key, template]) => (
                    <option key={key} value={key}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Content */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Mensagem
                  </label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleCopyMessage}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                    >
                      <Copy size={14} />
                      <span>Copiar</span>
                    </button>
                    {messageTypeConfig[messageType].maxLength > 0 && (
                      <span className="text-xs text-gray-500">
                        {(messageTemplate === 'custom' ? customMessage : getCurrentMessage()).length}/
                        {messageTypeConfig[messageType].maxLength}
                      </span>
                    )}
                  </div>
                </div>
                
                {messageTemplate === 'custom' ? (
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Digite sua mensagem personalizada..."
                    rows={6}
                    maxLength={messageTypeConfig[messageType].maxLength}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="bg-white p-4 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-700 whitespace-pre-line">
                      {replacePlaceholders(getCurrentMessage())}
                    </p>
                  </div>
                )}
              </div>

              {/* Send Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSendMessage}
                  disabled={sending || !getCurrentMessage().trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {sending ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Enviar {messageTypeConfig[messageType].label}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Communication History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* History Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Buscar no histórico..."
                  value={searchHistory}
                  onChange={(e) => setSearchHistory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <select
              value={filterHistory}
              onChange={(e) => setFilterHistory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos os Tipos</option>
              <option value="sms">SMS</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">E-mail</option>
              <option value="phone">Telefone</option>
            </select>
          </div>

          {/* History List */}
          <div className="space-y-3">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item) => {
                const config = messageTypeConfig[item.type];
                const isInbound = item.direction === 'inbound';
                
                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-lg border ${
                      isInbound ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${config.color}`}>
                          <config.icon size={18} />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="font-medium text-gray-800">
                              {config.label}
                            </p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isInbound ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {isInbound ? 'Recebido' : 'Enviado'}
                            </span>
                            {item.status === 'delivered' && (
                              <CheckCircle className="text-green-500" size={14} />
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-2">
                            {item.message}
                          </p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>{formatTimestamp(item.timestamp)}</span>
                            <span>{item.operator}</span>
                            {item.duration && <span>{item.duration}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-500">Nenhuma comunicação encontrada</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationHub;