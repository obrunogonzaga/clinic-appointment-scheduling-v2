import * as XLSX from 'xlsx';

// Generate a sample Excel file with the expected DasaExp format
export const generateSampleExcelFile = () => {
  const sampleData = [
    {
      'ID Sala': '001',
      'Nome da Sala': 'CARRO 1 - Coleta Domiciliar',
      'Data/Hora Início': '20/01/2025 08:00:00',
      'Data/Hora Fim': '20/01/2025 08:40:00',
      'Nome do Paciente': 'Maria Silva Santos',
      'Códigos dos Exames': 'HEM001,BIO002',
      'Nomes dos Exames': 'Hemograma Completo, Glicemia',
      'Total Exames': '2',
      'Endereço Coleta': 'Rua das Flores, 123, Centro, São Paulo, SP',
      'Pedido Médico': 'PM123456',
      'Canal Efetivação': 'WhatsApp',
      'Status Confirmação': 'Confirmado',
      'Canal Confirmação': 'WhatsApp',
      'Documento(s) Paciente': 'CPF: 123.456.789-00',
      'Contato(s) Paciente': 'Celular: 11 98765-4321',
      'Nascimento': '15/03/1980'
    },
    {
      'ID Sala': '001',
      'Nome da Sala': 'CARRO 1 - Coleta Domiciliar',
      'Data/Hora Início': '20/01/2025 09:00:00',
      'Data/Hora Fim': '20/01/2025 09:40:00',
      'Nome do Paciente': 'João Pedro Oliveira',
      'Códigos dos Exames': 'HEM001,URI001,BIO003',
      'Nomes dos Exames': 'Hemograma, Urina Tipo I, Colesterol Total',
      'Total Exames': '3',
      'Endereço Coleta': 'Av. Paulista, 1500, Bela Vista, São Paulo, SP',
      'Pedido Médico': 'PM123457',
      'Canal Efetivação': 'Telefone',
      'Status Confirmação': 'Não Confirmado',
      'Canal Confirmação': '',
      'Documento(s) Paciente': 'CPF: 987.654.321-00',
      'Contato(s) Paciente': 'Celular: 11 91234-5678',
      'Nascimento': '22/07/1975'
    },
    {
      'ID Sala': '002',
      'Nome da Sala': 'CARRO 2 - Coleta Domiciliar',
      'Data/Hora Início': '20/01/2025 08:30:00',
      'Data/Hora Fim': '20/01/2025 09:10:00',
      'Nome do Paciente': 'Ana Carolina Souza',
      'Códigos dos Exames': 'TSH001,T4L001',
      'Nomes dos Exames': 'TSH, T4 Livre',
      'Total Exames': '2',
      'Endereço Coleta': 'Rua Augusta, 200, Consolação, São Paulo, SP',
      'Pedido Médico': 'PM123458',
      'Canal Efetivação': 'App',
      'Status Confirmação': 'Confirmado',
      'Canal Confirmação': 'App',
      'Documento(s) Paciente': 'CPF: 456.789.123-00',
      'Contato(s) Paciente': 'Celular: 11 95555-5555',
      'Nascimento': '10/12/1990'
    },
    {
      'ID Sala': '003',
      'Nome da Sala': 'CARRO 3 - Coleta Especial',
      'Data/Hora Início': '20/01/2025 07:00:00',
      'Data/Hora Fim': '20/01/2025 07:40:00',
      'Nome do Paciente': 'Carlos Eduardo Lima',
      'Códigos dos Exames': 'COVID001',
      'Nomes dos Exames': 'PCR COVID-19',
      'Total Exames': '1',
      'Endereço Coleta': 'Alameda Santos, 1000, Jardins, São Paulo, SP',
      'Pedido Médico': 'PM123459',
      'Canal Efetivação': 'WhatsApp',
      'Status Confirmação': 'Confirmado',
      'Canal Confirmação': 'WhatsApp',
      'Documento(s) Paciente': 'CPF: 789.123.456-00',
      'Contato(s) Paciente': 'Celular: 11 99999-9999',
      'Nascimento': '05/05/1985'
    }
  ];

  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Create worksheet from data
  const ws = XLSX.utils.json_to_sheet(sampleData);
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Agendamentos');
  
  // Generate binary string
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
  
  // Convert to blob
  const buf = new ArrayBuffer(wbout.length);
  const view = new Uint8Array(buf);
  for (let i = 0; i < wbout.length; i++) {
    view[i] = wbout.charCodeAt(i) & 0xFF;
  }
  
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Create download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'agendamentos_exemplo_dasaexp.xlsx';
  link.click();
  
  // Cleanup
  window.URL.revokeObjectURL(url);
};

// Generate a sample CSV file
export const generateSampleCSVFile = () => {
  const headers = [
    'ID Sala',
    'Nome da Sala',
    'Data/Hora Início',
    'Data/Hora Fim',
    'Nome do Paciente',
    'Códigos dos Exames',
    'Nomes dos Exames',
    'Total Exames',
    'Endereço Coleta',
    'Pedido Médico',
    'Canal Efetivação',
    'Status Confirmação',
    'Canal Confirmação',
    'Documento(s) Paciente',
    'Contato(s) Paciente',
    'Nascimento'
  ];
  
  const rows = [
    headers,
    ['001', 'CARRO 1 - Coleta Domiciliar', '20/01/2025 08:00:00', '20/01/2025 08:40:00', 'Maria Silva Santos', 'HEM001,BIO002', 'Hemograma Completo, Glicemia', '2', 'Rua das Flores, 123, Centro, São Paulo, SP', 'PM123456', 'WhatsApp', 'Confirmado', 'WhatsApp', 'CPF: 123.456.789-00', 'Celular: 11 98765-4321', '15/03/1980'],
    ['001', 'CARRO 1 - Coleta Domiciliar', '20/01/2025 09:00:00', '20/01/2025 09:40:00', 'João Pedro Oliveira', 'HEM001,URI001,BIO003', 'Hemograma, Urina Tipo I, Colesterol Total', '3', 'Av. Paulista, 1500, Bela Vista, São Paulo, SP', 'PM123457', 'Telefone', 'Não Confirmado', '', 'CPF: 987.654.321-00', 'Celular: 11 91234-5678', '22/07/1975'],
    ['002', 'CARRO 2 - Coleta Domiciliar', '20/01/2025 08:30:00', '20/01/2025 09:10:00', 'Ana Carolina Souza', 'TSH001,T4L001', 'TSH, T4 Livre', '2', 'Rua Augusta, 200, Consolação, São Paulo, SP', 'PM123458', 'App', 'Confirmado', 'App', 'CPF: 456.789.123-00', 'Celular: 11 95555-5555', '10/12/1990'],
    ['003', 'CARRO 3 - Coleta Especial', '20/01/2025 07:00:00', '20/01/2025 07:40:00', 'Carlos Eduardo Lima', 'COVID001', 'PCR COVID-19', '1', 'Alameda Santos, 1000, Jardins, São Paulo, SP', 'PM123459', 'WhatsApp', 'Confirmado', 'WhatsApp', 'CPF: 789.123.456-00', 'Celular: 11 99999-9999', '05/05/1985']
  ];
  
  // Convert to CSV format
  const csvContent = rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  
  // Create blob
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'agendamentos_exemplo_dasaexp.csv';
  link.click();
  
  // Cleanup
  window.URL.revokeObjectURL(url);
};