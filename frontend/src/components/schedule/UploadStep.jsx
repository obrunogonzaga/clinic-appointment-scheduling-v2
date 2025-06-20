import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, Check, AlertCircle, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { generateSampleExcelFile, generateSampleCSVFile } from '../../utils/generateSampleExcel';

const UploadStep = ({ onFileUpload, uploadedFile, onNext }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    setError(null);
    
    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];
    
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
      const errorMsg = 'Formato de arquivo inválido. Aceitos: .xlsx, .xls, .csv';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = 'Arquivo muito grande. Tamanho máximo: 10MB';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    onFileUpload(file);
    toast.success(`Arquivo ${file.name} carregado com sucesso!`);
  };

  const removeFile = () => {
    onFileUpload(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-6">
          <FileSpreadsheet className="mx-auto mb-4 text-blue-600" size={48} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Upload da Planilha DasaExp
          </h2>
          <p className="text-gray-600">
            Selecione ou arraste o arquivo da planilha de agendamento
          </p>
        </div>
        
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : error
              ? 'border-red-300 bg-red-50'
              : uploadedFile
              ? 'border-green-300 bg-green-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploadedFile ? (
            <div className="space-y-4">
              <Check className="mx-auto text-green-600" size={48} />
              <div>
                <p className="text-lg font-semibold text-green-800">Arquivo carregado!</p>
                <p className="text-sm text-gray-600">{uploadedFile.name}</p>
                <p className="text-xs text-gray-500">{formatFileSize(uploadedFile.size)}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
              >
                <X size={16} className="mr-1" />
                Remover
              </button>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <AlertCircle className="mx-auto text-red-500" size={48} />
              <div>
                <p className="text-lg font-semibold text-red-800">Erro no arquivo</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className={`mx-auto transition-colors ${
                dragActive ? 'text-blue-600' : 'text-gray-400'
              }`} size={48} />
              <div>
                <p className="text-lg font-medium text-gray-700">
                  {dragActive ? 'Solte o arquivo aqui' : 'Clique para selecionar ou arraste o arquivo'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Formatos aceitos: .xlsx, .xls, .csv (máx. 10MB)
                </p>
              </div>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Sample Files Section */}
        {!uploadedFile && (
          <div className="mt-6 border-t pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Precisa de um arquivo de exemplo?
            </h3>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={generateSampleExcelFile}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Exemplo Excel
              </button>
              <button
                onClick={generateSampleCSVFile}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar Exemplo CSV
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Arquivos de exemplo no formato DasaExp com dados fictícios
            </p>
          </div>
        )}

        {/* File Info and Actions */}
        {uploadedFile && (
          <div className="mt-6 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">Informações do Arquivo:</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Nome:</span>
                  <p className="font-medium">{uploadedFile.name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Tamanho:</span>
                  <p className="font-medium">{formatFileSize(uploadedFile.size)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Tipo:</span>
                  <p className="font-medium">{uploadedFile.type || 'Detectado pela extensão'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Última modificação:</span>
                  <p className="font-medium">
                    {new Date(uploadedFile.lastModified).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onNext}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center font-semibold"
              >
                Processar Arquivo
                <FileSpreadsheet className="ml-2" size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadStep;