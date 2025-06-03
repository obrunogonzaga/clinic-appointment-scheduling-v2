import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// Expected DasaExp spreadsheet columns
const EXPECTED_COLUMNS = [
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

export const processExcelFile = async (file) => {
  try {
    const data = await readFile(file);
    const validated = validateData(data);
    const processed = extractScheduleData(validated);
    return { success: true, data: processed };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        let parsedData;

        if (file.name.toLowerCase().endsWith('.csv')) {
          // Parse CSV
          const result = Papa.parse(data, {
            header: true,
            skipEmptyLines: true,
            encoding: 'UTF-8'
          });
          
          if (result.errors.length > 0) {
            throw new Error(`Erro ao ler CSV: ${result.errors[0].message}`);
          }
          
          parsedData = result.data;
        } else {
          // Parse Excel
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          parsedData = XLSX.utils.sheet_to_json(worksheet);
        }

        resolve(parsedData);
      } catch (error) {
        reject(new Error(`Erro ao processar arquivo: ${error.message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Erro ao ler o arquivo'));
    };

    if (file.name.toLowerCase().endsWith('.csv')) {
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.readAsBinaryString(file);
    }
  });
};

const validateData = (data) => {
  if (!data || data.length === 0) {
    throw new Error('Arquivo vazio ou sem dados válidos');
  }

  // Check if we have the expected columns
  const firstRow = data[0];
  const columns = Object.keys(firstRow);
  
  // Check for essential columns
  const essentialColumns = ['Nome da Sala', 'Nome do Paciente', 'Data/Hora Início'];
  const missingColumns = essentialColumns.filter(col => !columns.includes(col));
  
  if (missingColumns.length > 0) {
    throw new Error(`Colunas obrigatórias não encontradas: ${missingColumns.join(', ')}`);
  }

  return data;
};

const extractScheduleData = (rawData) => {
  const result = {
    totalRecords: rawData.length,
    validRecords: 0,
    errors: 0,
    warnings: 0,
    cars: {},
    issues: []
  };

  rawData.forEach((row, index) => {
    try {
      // Extract car information from "Nome da Sala"
      const roomName = row['Nome da Sala'] || '';
      const carMatch = roomName.match(/CARRO\s+(\d+)/i);
      
      if (!carMatch) {
        result.warnings++;
        result.issues.push({
          type: 'warning',
          row: index + 1,
          message: `Linha ${index + 1}: Não foi possível identificar o carro em "${roomName}"`
        });
        return;
      }

      const carNumber = `CARRO ${carMatch[1]}`;
      
      // Initialize car if not exists
      if (!result.cars[carNumber]) {
        result.cars[carNumber] = [];
      }

      // Extract patient information
      const patient = extractPatientInfo(row, index + 1);
      
      if (patient) {
        result.cars[carNumber].push(patient);
        result.validRecords++;
      } else {
        result.errors++;
      }

    } catch (error) {
      result.errors++;
      result.issues.push({
        type: 'error',
        row: index + 1,
        message: `Linha ${index + 1}: ${error.message}`
      });
    }
  });

  // Add summary issues
  if (result.validRecords > 0) {
    result.issues.unshift({
      type: 'success',
      message: `${result.validRecords} agendamentos processados com sucesso`
    });
  }

  if (result.warnings > 0) {
    result.issues.unshift({
      type: 'warning',
      message: `${result.warnings} registros com avisos`
    });
  }

  if (result.errors > 0) {
    result.issues.unshift({
      type: 'error',
      message: `${result.errors} registros com erros`
    });
  }

  return result;
};

const extractPatientInfo = (row, rowNumber) => {
  try {
    const patientName = row['Nome do Paciente'];
    const startTime = row['Data/Hora Início'];
    const endTime = row['Data/Hora Fim'];
    
    if (!patientName || !startTime) {
      throw new Error('Nome do paciente ou horário não informado');
    }

    // Parse date and time
    const startDate = parseDateTime(startTime);
    const endDate = parseDateTime(endTime);
    
    if (!startDate) {
      throw new Error('Formato de data/hora inválido');
    }

    // Calculate duration
    const duration = endDate ? Math.round((endDate - startDate) / (1000 * 60)) : 40; // default 40 min

    // Extract CPF
    const cpf = extractCPF(row['Documento(s) Paciente'] || '');
    
    // Extract phone
    const phone = extractPhone(row['Contato(s) Paciente'] || '');
    
    // Extract and format address
    const address = formatAddress(row['Endereço Coleta'] || '');
    
    // Extract exams
    const exams = extractExams(row['Nomes dos Exames'] || '');
    
    // Extract health plan info (if available)
    const healthPlan = extractHealthPlan(row);

    return {
      id: `patient_${rowNumber}`,
      patientName: patientName.trim(),
      time: formatTime(startDate),
      date: formatDate(startDate),
      duration: duration,
      address: address,
      phone: phone,
      cpf: cpf,
      exams: exams,
      healthPlan: healthPlan,
      status: row['Status Confirmação'] || 'Não Confirmado',
      rawData: row // Keep original data for reference
    };

  } catch (error) {
    throw new Error(`Erro ao processar paciente: ${error.message}`);
  }
};

const parseDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return null;
  
  // Try different date formats
  const formats = [
    /(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/, // DD/MM/YYYY HH:MM:SS
    /(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})/, // DD/MM/YYYY HH:MM
    /(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})/, // YYYY-MM-DD HH:MM:SS
  ];

  for (const format of formats) {
    const match = dateTimeStr.match(format);
    if (match) {
      if (format === formats[0] || format === formats[1]) {
        // DD/MM/YYYY format
        const [, day, month, year, hour, minute, second = 0] = match;
        return new Date(year, month - 1, day, hour, minute, second);
      } else {
        // YYYY-MM-DD format
        const [, year, month, day, hour, minute, second = 0] = match;
        return new Date(year, month - 1, day, hour, minute, second);
      }
    }
  }

  return null;
};

const extractCPF = (documentStr) => {
  const cpfMatch = documentStr.match(/CPF:\s*(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})/);
  if (cpfMatch) {
    const cpf = cpfMatch[1].replace(/\D/g, '');
    return `${cpf.slice(0,3)}.${cpf.slice(3,6)}.${cpf.slice(6,9)}-${cpf.slice(9,11)}`;
  }
  return null;
};

const extractPhone = (contactStr) => {
  const phoneMatch = contactStr.match(/Celular:\s*(\d{2})\s*(\d{8,9})/);
  if (phoneMatch) {
    const [, ddd, number] = phoneMatch;
    return `(${ddd}) ${number.slice(0,-4)}-${number.slice(-4)}`;
  }
  return null;
};

const formatAddress = (addressStr) => {
  if (!addressStr) return '';
  
  // Capitalize each word
  return addressStr
    .toLowerCase()
    .split(',')
    .map(part => part.trim())
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(', ');
};

const extractExams = (examsStr) => {
  if (!examsStr) return [];
  
  return examsStr
    .split(',')
    .map(exam => exam.trim())
    .filter(exam => exam.length > 0);
};

const extractHealthPlan = (row) => {
  // This would need to be customized based on the actual spreadsheet format
  // For now, return a default value
  return 'Não informado';
};

const formatTime = (date) => {
  return date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });
};

const formatDate = (date) => {
  return date.toLocaleDateString('pt-BR');
};

export default {
  processExcelFile
};