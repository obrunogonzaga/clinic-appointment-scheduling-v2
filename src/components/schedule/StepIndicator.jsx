import React from 'react';
import { Check } from 'lucide-react';

const StepIndicator = ({ currentStep = 1 }) => {
  const steps = [
    { number: 1, title: 'Upload', description: 'Arquivo DasaExp' },
    { number: 2, title: 'Processamento', description: 'Validação' },
    { number: 3, title: 'Visualização', description: 'Agenda' }
  ];

  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                currentStep >= step.number
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300 text-gray-500'
              }`}>
                {currentStep > step.number ? (
                  <Check size={20} />
                ) : (
                  <span className="font-semibold">{step.number}</span>
                )}
              </div>
              
              {/* Step Labels */}
              <div className="text-center mt-2">
                <p className={`text-sm font-medium ${
                  currentStep >= step.number ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-400">{step.description}</p>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className={`w-20 h-1 transition-colors duration-300 ${
                currentStep > step.number ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;