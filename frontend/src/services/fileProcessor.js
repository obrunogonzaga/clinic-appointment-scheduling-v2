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
    if (!file) {
      throw new Error('Nenhum arquivo foi fornecido');
    }
    
    if (!file.name.toLowerCase().match(/\.(xlsx|xls|csv)$/)) {
      throw new Error('Formato de arquivo não suportado. Use .xlsx, .xls ou .csv');
    }
    
    const data = await readFile(file);
    const validated = validateData(data);
    const processed = extractScheduleData(validated);
    
    if (processed.validRecords === 0) {
      throw new Error('Nenhum agendamento válido foi encontrado no arquivo');
    }
    
    return { success: true, data: processed };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      data: {
        totalRecords: 0,
        validRecords: 0,
        errors: 1,
        warnings: 0,
        cars: {},
        issues: [{ type: 'error', message: error.message }]
      }
    };
  }
};

const readFile = (file) => {
  return new Promise((resolve, reject) => {
    console.log('Starting to read file:', file.name);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        console.log('File loaded successfully, size:', e.target.result.length);
        const data = e.target.result;
        let parsedData;

        if (file.name.toLowerCase().endsWith('.csv')) {
          console.log('Parsing CSV file...');
          // Parse CSV
          const result = Papa.parse(data, {
            header: true,
            skipEmptyLines: true,
            encoding: 'UTF-8'
          });
          
          console.log('CSV parse result:', {
            rows: result.data.length,
            errors: result.errors.length,
            meta: result.meta
          });
          
          if (result.errors.length > 0) {
            console.error('CSV parsing errors:', result.errors);
            throw new Error(`Erro ao ler CSV: ${result.errors[0].message}`);
          }
          
          parsedData = result.data;
        } else {
          console.log('Parsing Excel file...');
          // Parse Excel
          const workbook = XLSX.read(data, { type: 'array' });
          console.log('Excel workbook info:', {
            sheetNames: workbook.SheetNames,
            numberOfSheets: workbook.SheetNames.length
          });
          
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          parsedData = XLSX.utils.sheet_to_json(worksheet, {
            raw: false, // Use formatted strings instead of raw values
            dateNF: 'dd/mm/yyyy hh:mm:ss' // Date format
          });
          
          console.log('Excel parsed data:', {
            rows: parsedData.length,
            columns: parsedData.length > 0 ? Object.keys(parsedData[0]) : []
          });
        }

        console.log('File parsing completed. Total rows:', parsedData.length);
        if (parsedData.length > 0) {
          console.log('First row sample:', parsedData[0]);
          console.log('Available columns:', Object.keys(parsedData[0]));
        }
        
        resolve(parsedData);
      } catch (error) {
        console.error('Error processing file:', error);
        reject(new Error(`Erro ao processar arquivo: ${error.message}`));
      }
    };

    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      reject(new Error('Erro ao ler o arquivo'));
    };

    if (file.name.toLowerCase().endsWith('.csv')) {
      console.log('Reading file as text (CSV)...');
      reader.readAsText(file, 'UTF-8');
    } else {
      console.log('Reading file as array buffer (Excel)...');
      reader.readAsArrayBuffer(file);
    }
  });
};

const validateData = (data) => {
  console.log('Validating data...');
  
  if (!data || data.length === 0) {
    console.error('Data validation failed: empty data');
    throw new Error('Arquivo vazio ou sem dados válidos');
  }

  console.log('Total rows to validate:', data.length);
  
  // Check if we have the expected columns
  const firstRow = data[0];
  const columns = Object.keys(firstRow);
  
  console.log('Found columns:', columns);
  console.log('Expected columns:', EXPECTED_COLUMNS);
  
  // Check for essential columns
  const essentialColumns = ['Nome da Sala', 'Nome do Paciente', 'Data/Hora Início'];
  const missingColumns = essentialColumns.filter(col => !columns.includes(col));
  
  if (missingColumns.length > 0) {
    console.error('Missing essential columns:', missingColumns);
    console.log('Available columns:', columns);
    throw new Error(`Colunas obrigatórias não encontradas: ${missingColumns.join(', ')}. Colunas disponíveis: ${columns.join(', ')}`);
  }

  console.log('Data validation passed');
  return data;
};

const extractScheduleData = (rawData) => {
  console.log('Starting to extract schedule data from', rawData.length, 'rows');
  
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
      console.log(`Row ${index + 1}: Room name = "${roomName}"`);
      
      const carMatch = roomName.match(/CARRO\s+(\d+)/i);
      
      if (!carMatch) {
        console.warn(`Row ${index + 1}: Could not find car number in "${roomName}"`);
        result.warnings++;
        result.issues.push({
          type: 'warning',
          row: index + 1,
          message: `Linha ${index + 1}: Não foi possível identificar o carro em "${roomName}"`
        });
        return;
      }

      const carNumber = `CARRO ${carMatch[1]}`;
      console.log(`Row ${index + 1}: Identified car: ${carNumber}`);
      
      // Initialize car if not exists
      if (!result.cars[carNumber]) {
        result.cars[carNumber] = [];
        console.log(`Created new car group: ${carNumber}`);
      }

      // Extract patient information
      const patient = extractPatientInfo(row, index + 1);
      
      if (patient) {
        result.cars[carNumber].push(patient);
        result.validRecords++;
        console.log(`Row ${index + 1}: Successfully added patient ${patient.patientName} to ${carNumber}`);
      } else {
        result.errors++;
        console.error(`Row ${index + 1}: Failed to extract patient info`);
      }

    } catch (error) {
      console.error(`Row ${index + 1}: Error processing row:`, error);
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

  console.log('Schedule data extraction complete:', {
    totalRecords: result.totalRecords,
    validRecords: result.validRecords,
    errors: result.errors,
    warnings: result.warnings,
    carsFound: Object.keys(result.cars),
    issuesCount: result.issues.length
  });

  return result;
};

const extractPatientInfo = (row, rowNumber) => {
  try {
    console.log(`Extracting patient info for row ${rowNumber}`);
    
    const patientName = row['Nome do Paciente'];
    const startTime = row['Data/Hora Início'];
    const endTime = row['Data/Hora Fim'];
    
    console.log(`Row ${rowNumber} data:`, {
      patientName,
      startTime,
      endTime
    });
    
    if (!patientName || !startTime) {
      console.error(`Row ${rowNumber}: Missing patient name or start time`);
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
  if (!dateTimeStr) {
    console.warn('parseDateTime: No date string provided');
    return null;
  }
  
  console.log('Parsing date/time:', dateTimeStr);
  
  // Convert to string if it's not already
  const dateStr = dateTimeStr.toString().trim();
  
  // Try different date formats
  const formats = [
    /(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/, // DD/MM/YYYY HH:MM:SS
    /(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})/, // DD/MM/YYYY HH:MM
    /(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2}):(\d{2})/, // YYYY-MM-DD HH:MM:SS
    /(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY (without time)
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      let parsedDate;
      if (format === formats[0] || format === formats[1]) {
        // DD/MM/YYYY format
        const [, day, month, year, hour = 0, minute = 0, second = 0] = match;
        parsedDate = new Date(year, month - 1, day, hour, minute, second);
      } else if (format === formats[2]) {
        // YYYY-MM-DD format
        const [, year, month, day, hour = 0, minute = 0, second = 0] = match;
        parsedDate = new Date(year, month - 1, day, hour, minute, second);
      } else if (format === formats[3]) {
        // DD/MM/YYYY without time
        const [, day, month, year] = match;
        parsedDate = new Date(year, month - 1, day, 0, 0, 0);
      }
      
      console.log('Successfully parsed date:', parsedDate);
      return parsedDate;
    }
  }

  // Try to parse as a standard date string as fallback
  try {
    const fallbackDate = new Date(dateStr);
    if (!isNaN(fallbackDate.getTime())) {
      console.log('Parsed using Date constructor:', fallbackDate);
      return fallbackDate;
    }
  } catch (e) {
    console.error('Failed to parse date with Date constructor:', e);
  }

  console.error('Could not parse date/time string:', dateStr);
  return null;
};

const extractCPF = (documentStr) => {
  if (!documentStr) return null;
  
  const cpfMatch = documentStr.match(/CPF:\s*(\d{11}|\d{3}\.\d{3}\.\d{3}-\d{2})/);
  if (cpfMatch) {
    const cpf = cpfMatch[1].replace(/\D/g, '');
    return `${cpf.slice(0,3)}.${cpf.slice(3,6)}.${cpf.slice(6,9)}-${cpf.slice(9,11)}`;
  }
  return null;
};

const extractPhone = (contactStr) => {
  if (!contactStr) return null;
  
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