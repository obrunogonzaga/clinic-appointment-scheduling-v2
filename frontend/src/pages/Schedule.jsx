import React, { useState } from 'react';
import StepIndicator from '../components/schedule/StepIndicator';
import UploadStep from '../components/schedule/UploadStep';
import ProcessingStep from '../components/schedule/ProcessingStep';
import CalendarView from '../components/schedule/CalendarView';

const Schedule = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processedData, setProcessedData] = useState(null);

  const handleFileUpload = (file) => {
    setUploadedFile(file);
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProcessingComplete = (results) => {
    // The ProcessingStep now handles the file processing internally
    // We just need to store the results
    if (results) {
      setProcessedData(results);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <UploadStep
            onFileUpload={handleFileUpload}
            uploadedFile={uploadedFile}
            onNext={handleNext}
          />
        );
      case 2:
        return (
          <ProcessingStep
            uploadedFile={uploadedFile}
            onProcessingComplete={handleProcessingComplete}
            onBack={handleBack}
            onNext={handleNext}
          />
        );
      case 3:
        return (
          <CalendarView
            processedData={processedData}
            onBack={() => {
              setCurrentStep(1);
              setUploadedFile(null);
              setProcessedData(null);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <StepIndicator currentStep={currentStep} />
      {renderStep()}
    </div>
  );
};

export default Schedule;