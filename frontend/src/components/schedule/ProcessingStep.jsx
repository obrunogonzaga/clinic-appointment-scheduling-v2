import React, { useState, useEffect } from 'react';
import { Settings, Check, AlertCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { processExcelFile } from '../../services/fileProcessor';

const ProcessingStep = ({ uploadedFile, onProcessingComplete, onBack, onNext }) => {
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [processingSteps, setProcessingSteps] = useState([
    { id: 1, label: 'Lendo arquivo', status: 'pending' },
    { id: 2, label: 'Validando formato', status: 'pending' },
    { id: 3, label: 'Extraindo dados', status: 'pending' },
    { id: 4, label: 'Identificando carros', status: 'pending' },
    { id: 5, label: 'Processando agendamentos', status: 'pending' },
    { id: 6, label: 'Validando informações', status: 'pending' }
  ]);
  const [results, setResults] = useState(null);

  // Simulate processing when component mounts
  useEffect(() => {
    if (uploadedFile && !completed) {
      startProcessing();
    }
  }, [uploadedFile, completed]);

  const startProcessing = async () => {
    setProcessing(true);
    console.log('Starting file processing for:', uploadedFile?.name);
    
    try {
      let fileProcessingResult = null;
      
      // Process each step with actual file processing
      for (let i = 0; i < processingSteps.length; i++) {
        console.log(`Processing step ${i + 1}: ${processingSteps[i].label}`);
        
        // Update current step to processing
        setProcessingSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index === i ? 'processing' : index < i ? 'completed' : 'pending'
        })));
        
        // Process the actual file on specific steps
        if (i === 2 && uploadedFile) { // "Extraindo dados" step
          console.log('Processing Excel/CSV file...');
          console.log('File details:', {
            name: uploadedFile.name,
            size: uploadedFile.size,
            type: uploadedFile.type
          });
          
          const result = await processExcelFile(uploadedFile);
          console.log('File processing result:', result);
          
          if (!result.success) {
            console.error('File processing failed:', result.error);
            throw new Error(result.error || 'Erro ao processar arquivo');
          }
          
          fileProcessingResult = result.data;
          setResults(result.data);
        }
        
        // Wait for realistic processing time
        await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
        
        // Complete current step
        setProcessingSteps(prev => prev.map((step, index) => ({
          ...step,
          status: index <= i ? 'completed' : 'pending'
        })));
      }

      // Use the file processing result we stored
      const finalResults = fileProcessingResult || results;
      
      if (!finalResults) {
        console.error('No data was processed from the file');
        throw new Error('Nenhum dado foi processado do arquivo');
      }

      console.log('Processing completed successfully:', finalResults);
      setProcessing(false);
      setCompleted(true);
      onProcessingComplete(finalResults);
      toast.success(`Processamento concluído! ${finalResults.validRecords} agendamentos processados.`);
      
    } catch (error) {
      console.error('Error during processing:', error);
      console.error('Error stack:', error.stack);
      
      setProcessing(false);
      
      // Mark current step as failed
      setProcessingSteps(prev => prev.map((step, index) => {
        const currentIndex = prev.findIndex(s => s.status === 'processing');
        return {
          ...step,
          status: index === currentIndex ? 'error' : step.status
        };
      }));
      
      const errorResults = {
        totalRecords: 0,
        validRecords: 0,
        errors: 1,
        warnings: 0,
        cars: {},
        issues: [
          { type: 'error', message: error.message },
          { type: 'error', message: `Detalhes: ${error.stack || 'Nenhum detalhe adicional disponível'}` }
        ]
      };
      
      setResults(errorResults);
      toast.error(`Erro no processamento: ${error.message}`);
    }
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Check className="text-green-600" size={20} />;
      case 'processing':
        return <Loader2 className="text-blue-600 animate-spin" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-600" size={20} />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStepBgColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'processing':
        return 'bg-blue-50 border-blue-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <div className="relative">
            <Settings className={`mx-auto mb-4 ${processing ? 'animate-spin' : ''}`} size={48} 
              color={completed ? '#059669' : processing ? '#2563eb' : '#6b7280'} />
            {processing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {completed ? 'Processamento Concluído' : processing ? 'Processando Dados' : 'Iniciando Processamento'}
          </h2>
          <p className="text-gray-600 mb-2">
            {uploadedFile?.name}
          </p>
          {processing && (
            <div className="flex items-center justify-center">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {processing && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progresso</span>
              <span>{Math.round((processingSteps.filter(s => s.status === 'completed').length / processingSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ 
                  width: `${(processingSteps.filter(s => s.status === 'completed').length / processingSteps.length) * 100}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Processing Steps */}
        <div className="space-y-3 mb-8">
          {processingSteps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center p-4 rounded-lg border transition-all duration-300 ${getStepBgColor(step.status)}`}
            >
              <div className="mr-3">
                {getStepIcon(step.status)}
              </div>
              <span className={`font-medium ${
                step.status === 'completed' ? 'text-green-800' :
                step.status === 'processing' ? 'text-blue-800' :
                step.status === 'error' ? 'text-red-800' :
                'text-gray-600'
              }`}>
                {step.label}
              </span>
              {step.status === 'processing' && (
                <div className="ml-auto">
                  <div className="w-6 h-1 bg-blue-200 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-blue-600 animate-pulse" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Results Summary */}
        {results && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{results.totalRecords}</p>
                <p className="text-sm text-blue-800">Total de Registros</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{results.validRecords}</p>
                <p className="text-sm text-green-800">Registros Válidos</p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-yellow-600">{results.warnings}</p>
                <p className="text-sm text-yellow-800">Avisos</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{results.errors}</p>
                <p className="text-sm text-red-800">Erros</p>
              </div>
            </div>

            {/* Cars Summary */}
            {results.cars && Object.keys(results.cars).length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição por Carros</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(results.cars).map(([carName, patients]) => {
                    const confirmed = patients.filter(p => p.status === 'Confirmado').length;
                    const pending = patients.length - confirmed;
                    
                    return (
                      <div key={carName} className="bg-white rounded-lg p-4 border">
                        <h4 className="font-semibold text-gray-800">{carName}</h4>
                        <div className="mt-2 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total de visitas:</span>
                            <span className="font-medium">{patients.length}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-green-600">Confirmadas:</span>
                            <span className="font-medium text-green-800">{confirmed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-yellow-600">Pendentes:</span>
                            <span className="font-medium text-yellow-800">{pending}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Issues */}
            <div className="space-y-2">
              {results.issues.map((issue, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    issue.type === 'success' ? 'bg-green-50 border border-green-200' :
                    issue.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                    issue.type === 'error' ? 'bg-red-50 border border-red-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}
                >
                  <div className="flex items-start">
                    {issue.type === 'warning' && <AlertCircle className="text-yellow-600 mr-3 mt-0.5" size={20} />}
                    {issue.type === 'success' && <Check className="text-green-600 mr-3 mt-0.5" size={20} />}
                    {issue.type === 'info' && <AlertCircle className="text-blue-600 mr-3 mt-0.5" size={20} />}
                    {issue.type === 'error' && <AlertCircle className="text-red-600 mr-3 mt-0.5" size={20} />}
                    <div className="flex-1">
                      <span className={`text-sm font-medium block ${
                        issue.type === 'error' ? 'text-red-800' :
                        issue.type === 'warning' ? 'text-yellow-800' :
                        issue.type === 'success' ? 'text-green-800' :
                        'text-blue-800'
                      }`}>
                        {issue.message}
                      </span>
                      {issue.row && (
                        <span className="text-xs text-gray-600 mt-1 block">
                          Linha {issue.row}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Error Details Section */}
            {results.errors > 0 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-red-800 font-semibold mb-2">Detalhes do Erro</h4>
                <p className="text-sm text-red-700 mb-2">
                  Verifique o console do navegador (F12) para mais detalhes sobre o erro.
                </p>
                <div className="text-xs text-red-600 font-mono bg-red-100 p-2 rounded">
                  {results.issues.filter(i => i.type === 'error').map((error, idx) => (
                    <div key={idx} className="mb-1">{error.message}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            disabled={processing}
            className="flex items-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="mr-2" size={20} />
            Voltar
          </button>
          
          {completed && results && results.validRecords > 0 && (
            <button
              onClick={onNext}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center font-semibold"
            >
              Visualizar Agenda
              <ChevronRight className="ml-2" size={20} />
            </button>
          )}
          
          {completed && results && results.validRecords === 0 && (
            <button
              onClick={onBack}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center font-semibold"
            >
              <ChevronLeft className="mr-2" size={20} />
              Tentar Novamente
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessingStep;