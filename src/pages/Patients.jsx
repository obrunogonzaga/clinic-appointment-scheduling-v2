import React, { useState, useEffect } from 'react';
import PatientSearch from '../components/patients/PatientSearch';
import PatientList from '../components/patients/PatientList';
import toast from 'react-hot-toast';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({});
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Mock patient data - In real app, this would come from an API
  const mockPatients = [
    {
      id: "patient_001",
      personalInfo: {
        name: "Ana Costa Silva",
        cpf: "123.456.789-01",
        birthDate: "1985-03-15",
        gender: "F",
        email: "ana.costa@email.com",
        preferredContactMethod: "sms"
      },
      contactInfo: {
        phones: [
          { number: "(21) 98765-4321", type: "mobile", primary: true }
        ],
        address: {
          street: "Rua das Palmeiras, 230",
          neighborhood: "Recreio dos Bandeirantes",
          city: "Rio de Janeiro",
          zipCode: "22795-080"
        }
      },
      healthPlan: {
        provider: "Bradesco Saúde",
        cardNumber: "123456789",
        planType: "Premium"
      },
      confirmationTracking: {
        confirmationRate: 0.89,
        totalAppointments: 12,
        confirmedAppointments: 11
      },
      analytics: {
        frequency: "regular",
        riskScore: "low",
        totalCollections: 12,
        lastCollectionDate: "2025-01-05",
        noShowRate: 0.05
      },
      nextScheduledDate: "2025-01-15",
      status: "confirmed",
      tags: ["regular"],
      updatedAt: "2025-01-06T10:00:00Z"
    },
    {
      id: "patient_002", 
      personalInfo: {
        name: "Carlos Roberto Santos",
        cpf: "987.654.321-09",
        birthDate: "1978-07-22",
        gender: "M",
        email: "carlos.santos@email.com"
      },
      contactInfo: {
        phones: [
          { number: "(21) 99887-6543", type: "mobile", primary: true }
        ],
        address: {
          neighborhood: "Copacabana",
          city: "Rio de Janeiro"
        }
      },
      healthPlan: {
        provider: "Unimed",
        planType: "Standard"
      },
      confirmationTracking: {
        confirmationRate: 0.95,
        totalAppointments: 20,
        confirmedAppointments: 19
      },
      analytics: {
        frequency: "frequent",
        riskScore: "low",
        totalCollections: 20,
        lastCollectionDate: "2025-01-03"
      },
      nextScheduledDate: "2025-01-20",
      status: "confirmed",
      tags: ["vip", "frequent"],
      updatedAt: "2025-01-05T15:30:00Z"
    },
    {
      id: "patient_003",
      personalInfo: {
        name: "Maria Fernanda Oliveira", 
        cpf: "456.789.123-45",
        birthDate: "1992-11-08",
        gender: "F"
      },
      contactInfo: {
        phones: [
          { number: "(21) 97654-3210", type: "mobile", primary: true }
        ],
        address: {
          neighborhood: "Ipanema",
          city: "Rio de Janeiro"
        }
      },
      healthPlan: {
        provider: "Amil",
        planType: "Premium"
      },
      confirmationTracking: {
        confirmationRate: 0.75,
        totalAppointments: 8,
        confirmedAppointments: 6
      },
      analytics: {
        frequency: "occasional",
        riskScore: "medium",
        totalCollections: 8,
        lastCollectionDate: "2024-12-20"
      },
      nextScheduledDate: "2025-01-25",
      status: "pending",
      tags: ["occasional"],
      preferences: {
        specialRequirements: "Paciente com dificuldade de acesso - 3º andar sem elevador"
      },
      updatedAt: "2025-01-04T09:15:00Z"
    }
  ];

  // Simulate loading and fetch patients
  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPatients(mockPatients);
      setFilteredPatients(mockPatients);
      setLoading(false);
    };

    loadPatients();
  }, []);

  // Handle search and filtering
  const handleSearch = (searchData) => {
    let filtered = patients;

    // Text search
    if (searchData.term) {
      const term = searchData.term.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.personalInfo?.name?.toLowerCase().includes(term) ||
        patient.personalInfo?.cpf?.includes(term) ||
        patient.contactInfo?.phones?.[0]?.number?.includes(term) ||
        patient.contactInfo?.address?.neighborhood?.toLowerCase().includes(term)
      );
    }

    // Apply filters
    const filters = searchData.filters;
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(patient => patient.status === filters.status);
    }

    if (filters.location !== 'all') {
      filtered = filtered.filter(patient => 
        patient.contactInfo?.address?.neighborhood?.toLowerCase().includes(filters.location)
      );
    }

    if (filters.healthPlan !== 'all') {
      filtered = filtered.filter(patient => 
        patient.healthPlan?.provider?.toLowerCase().includes(filters.healthPlan)
      );
    }

    if (filters.frequency !== 'all') {
      filtered = filtered.filter(patient => 
        patient.analytics?.frequency === filters.frequency
      );
    }

    setFilteredPatients(filtered);
  };

  // Handle patient selection
  const handlePatientClick = (patient) => {
    setSelectedPatient(patient);
    toast.success(`Visualizando perfil de ${patient.personalInfo?.name}`);
    // In real app, this would open a detailed patient modal or navigate to patient profile
  };

  // Handle quick actions
  const handleQuickAction = (patientId, action) => {
    if (Array.isArray(patientId)) {
      // Bulk action
      toast.success(`Ação "${action}" aplicada a ${patientId.length} pacientes`);
    } else {
      // Single patient action
      const patient = patients.find(p => p.id === patientId);
      const patientName = patient?.personalInfo?.name || 'paciente';
      
      switch (action) {
        case 'call':
          toast.success(`Iniciando ligação para ${patientName}`);
          break;
        case 'message':
          toast.success(`Enviando mensagem para ${patientName}`);
          break;
        case 'export':
          toast.success('Exportando dados dos pacientes...');
          break;
        case 'create':
          toast.success('Abrindo formulário de novo paciente...');
          break;
        default:
          toast.info(`Ação "${action}" para ${patientName}`);
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Search Component */}
      <PatientSearch
        onSearch={handleSearch}
        onFilterChange={(filters) => setSearchFilters(filters)}
        totalResults={filteredPatients.length}
      />

      {/* Patient List */}
      <PatientList
        patients={filteredPatients}
        loading={loading}
        onPatientClick={handlePatientClick}
        onQuickAction={handleQuickAction}
        searchFilters={searchFilters}
        totalCount={patients.length}
      />

      {/* Selected Patient Debug Info */}
      {selectedPatient && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm animate-fade-in-scale">
          <h4 className="font-semibold">Paciente Selecionado</h4>
          <p className="text-sm">{selectedPatient.personalInfo?.name}</p>
          <p className="text-xs opacity-75">{selectedPatient.personalInfo?.cpf}</p>
          <button
            onClick={() => setSelectedPatient(null)}
            className="mt-2 px-3 py-1 bg-blue-500 rounded text-xs hover:bg-blue-400 transition-colors btn-interactive"
          >
            Fechar
          </button>
        </div>
      )}
    </div>
  );
};

export default Patients;