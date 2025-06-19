import React, { useState, useEffect } from 'react';
import { Settings, Check, AlertCircle, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ProcessingStep = ({ uploadedFile, onProcessingComplete, onBack, onNext, processFile }) => {
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);
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
    setError(null);
    
    try {
      // Process file with real data
      const result = await processFile(uploadedFile);
      
      if (result.success) {
        // Update steps based on real processing
        for (let i = 0; i < processingSteps.length; i++) {
          setProcessingSteps(prev => prev.map((step, index) => ({
            ...step,
            status: index === i ? 'processing' : index < i ? 'completed' : 'pending'
          })));
          
          await new Promise(resolve => setTimeout(resolve, 300));
          
          setProcessingSteps(prev => prev.map((step, index) => ({
            ...step,
            status: index <= i ? 'completed' : 'pending'
          })));
        }

        // Transform real data for display
        const processedData = result.data;
        const carStats = Object.entries(processedData.cars).map(([carName, patients]) => ({
          name: carName,
          visits: patients.length,
          confirmed: patients.filter(p => p.status === 'Confirmado').length,
          pending: patients.filter(p => p.status !== 'Confirmado').length
        }));

        const displayResults = {
          ...processedData,
          cars: carStats
        };

        setResults(displayResults);
        setProcessing(false);
        setCompleted(true);
        onProcessingComplete(processedData);
        toast.success(`Processamento concluído! ${processedData.validRecords} agendamentos processados.`);
      } else {
        throw new Error(result.error || 'Erro ao processar arquivo');
      }
    } catch (error) {
      console.error('Processing error:', error);
      setError(error.message);
      setProcessing(false);
      
      // Mark all steps as error
      setProcessingSteps(prev => prev.map(step => ({
        ...step,
        status: 'pending'
      })));
      
      toast.error(`Erro no processamento: ${error.message}`);
    }
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Check className="text-green-600" size={20} />;
      case 'processing':
        return <Loader2 className="text-blue-600 animate-spin" size={20} />;
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

        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="text-red-600 mr-3" size={24} />
              <div>
                <h3 className="font-semibold text-red-800">Erro no processamento</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {results && !error && (
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
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição por Carros</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.cars.map((car, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border">
                    <h4 className="font-semibold text-gray-800">{car.name}</h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total de visitas:</span>
                        <span className="font-medium">{car.visits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-600">Confirmadas:</span>
                        <span className="font-medium text-green-800">{car.confirmed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-600">Pendentes:</span>
                        <span className="font-medium text-yellow-800">{car.pending}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Issues */}
            <div className="space-y-2">
              {results.issues.map((issue, index) => (
                <div
                  key={index}
                  className={`flex items-center p-3 rounded-lg ${
                    issue.type === 'success' ? 'bg-green-50 border border-green-200' :
                    issue.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}
                >
                  {issue.type === 'warning' && <AlertCircle className="text-yellow-600 mr-3" size={20} />}
                  {issue.type === 'success' && <Check className="text-green-600 mr-3" size={20} />}
                  {issue.type === 'info' && <AlertCircle className="text-blue-600 mr-3" size={20} />}
                  <span className="text-sm font-medium">{issue.message}</span>
                </div>
              ))}
            </div>
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
          
          {completed && (
            <button
              onClick={onNext}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center font-semibold"
            >
              Visualizar Agenda
              <ChevronRight className="ml-2" size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessingStep;