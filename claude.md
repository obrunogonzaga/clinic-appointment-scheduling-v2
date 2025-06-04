# Development Guide - Laboratory Scheduling System

## 🎨 IMPORTANT: Reference Mockup

**⚠️ ATTENTION**: There is a complete React mockup file in this folder that should be used as a visual and functional reference for all development.

### How to use the mockup:
1. **Open the mockup file** to view the complete interface
2. **Copy components** directly when appropriate
3. **Maintain the same structure** of Tailwind classes and styles
4. **Preserve the interaction logic** (drag & drop, modals, etc.)
5. **Use the same icons** from Lucide React as in the mockup

### What the mockup contains:
- Complete layout with sidebar and header
- Dashboard with KPIs and widgets
- 3-step flow for upload/processing/visualization
- Google Calendar style calendar with drag & drop
- Patient details modal
- Notification system
- All styles and animations

**Tip**: Start by extracting components from the mockup and organizing them in the suggested folder structure below. This will ensure visual and functional consistency with the approved design.

**Note**: All UI text and content should be in Portuguese (pt-BR) as per business requirements.

---

## 📋 Project Overview

Web system to automate processing of home collection scheduling spreadsheets, eliminating repetitive manual work and optimizing visit distribution among drivers.

### Main Objective
Transform a DasaExp system spreadsheet into a visual Google Calendar-style schedule, allowing manual adjustments via drag & drop and processed data export.

## 🎯 Core Features

### 1. Main Dashboard
- **Real-time KPIs**: visits today, confirmation rate, active cars, average time
- **Quick actions**: import spreadsheet, confirm patients, generate reports
- **Activity timeline**: latest system actions
- **Car status**: fleet overview

### 2. Schedule Module (3 steps)
#### Step 1 - Upload
- Drag & drop interface for Excel/CSV files
- Format validation
- Uploaded file preview

#### Step 2 - Processing
- Spreadsheet reading and parsing
- Home collection identification (pattern "AD-SF-FQ-AC-AV CENTER")
- Data extraction: CPF, phone, address, exams
- Grouping by driver/car
- Processing statistics

#### Step 3 - Visualization
- Google Calendar style layout
- Columns per car/driver
- Events positioned by time
- Drag & drop between cars
- Patient details modal
- Optimized schedule export

### 3. Additional Modules
- **Patients**: comprehensive patient management system
- **Drivers**: fleet management
- **Reports**: analysis and exports
- **Settings**: system preferences

### 4. Patients Module (Comprehensive System)
#### 4.1 Patient Database & Search
- **Master Patient Registry**: Central database of all patients from processed schedules
- **Advanced Search Engine**: Multi-field search by name, CPF, phone, address, health plan
- **Smart Filtering System**: Filter by confirmation status, date ranges, assigned car, location zones
- **Quick Statistics Dashboard**: Total patients, confirmed today, pending confirmations, recurring patients

#### 4.2 Patient Profile Management
- **Complete Patient Profiles**: Full medical and contact information management
- **Collection History Tracking**: Comprehensive history of past appointments, exam results, attendance patterns
- **Health Plan Integration**: Detailed plan information, coverage details, authorization requirements
- **Multi-Contact Management**: Multiple phone numbers, email addresses, preferred contact methods and times

#### 4.3 Operational Management Features
- **Confirmation Status Tracking**: Call attempt logs, confirmation timestamps, operator notes
- **Route & Assignment View**: Real-time view of car/driver assignments with estimated arrival times
- **Special Requirements Management**: Accessibility needs, elderly care protocols, difficult access notes
- **Communication Hub**: Integrated SMS/WhatsApp messaging for appointment confirmations and reminders

#### 4.4 Analytics & Business Intelligence
- **Patient Behavior Analytics**: Frequency patterns, preferred appointment times, seasonal trends analysis
- **Confirmation Rate Analysis**: Success rates by patient demographics, geographic areas, time slots
- **Collection Success Metrics**: No-show tracking, rescheduling patterns, completion rates
- **Geographic Intelligence**: Patient concentration mapping for optimized route planning and resource allocation

#### 4.5 Schedule Integration Features
- **Live Schedule Synchronization**: Real-time view of patient's current appointment status and location in queue
- **Drag & Drop Rescheduling**: Quick patient rescheduling directly from patient profile to available time slots
- **Bulk Operations Management**: Mass confirmation actions, bulk SMS campaigns, group rescheduling tools
- **Conflict Resolution Tools**: Handle double bookings, address verification issues, appointment overlap management

#### 4.6 Advanced Patient Features
- **Recurring Patient Management**: Identify and manage patients with regular collection schedules
- **Family Group Management**: Link family members for coordinated scheduling and communication
- **Priority Patient System**: VIP patients, special needs, urgent collections with priority scheduling
- **Collection Preferences**: Time preferences, specific driver requests, location notes, special instructions

## 🗂️ File Structure

```
project/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Header.jsx
│   │   │   └── Layout.jsx
│   │   ├── dashboard/
│   │   │   ├── KPICard.jsx
│   │   │   ├── QuickActions.jsx
│   │   │   ├── RecentActivity.jsx
│   │   │   └── CarStatus.jsx
│   │   ├── schedule/
│   │   │   ├── StepIndicator.jsx
│   │   │   ├── UploadStep.jsx
│   │   │   ├── ProcessingStep.jsx
│   │   │   ├── CalendarView.jsx
│   │   │   ├── CalendarEvent.jsx
│   │   │   └── EventDetailsModal.jsx
│   │   ├── patients/
│   │   │   ├── PatientSearch.jsx
│   │   │   ├── PatientList.jsx
│   │   │   ├── PatientCard.jsx
│   │   │   ├── PatientProfile.jsx
│   │   │   ├── PatientModal.jsx
│   │   │   ├── PatientFilters.jsx
│   │   │   ├── PatientStats.jsx
│   │   │   ├── CollectionHistory.jsx
│   │   │   ├── ConfirmationTracker.jsx
│   │   │   ├── CommunicationHub.jsx
│   │   │   ├── PatientAnalytics.jsx
│   │   │   └── BulkOperations.jsx
│   │   └── common/
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── Modal.jsx
│   │       ├── SearchInput.jsx
│   │       ├── FilterDropdown.jsx
│   │       └── StatusBadge.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Schedule.jsx
│   │   ├── Patients.jsx
│   │   ├── Drivers.jsx
│   │   ├── Reports.jsx
│   │   └── Settings.jsx
│   ├── services/
│   │   ├── fileProcessor.js
│   │   ├── dataExtractor.js
│   │   └── calendarOptimizer.js
│   ├── utils/
│   │   ├── dateHelpers.js
│   │   ├── formatters.js
│   │   └── validators.js
│   ├── hooks/
│   │   ├── useFileUpload.js
│   │   ├── useDragDrop.js
│   │   └── useNotifications.js
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── AppContext.jsx
│   ├── styles/
│   │   └── globals.css
│   ├── App.jsx
│   └── main.jsx
├── public/
├── package.json
├── vite.config.js
├── .gitignore
├── .env.example
└── README.md
```

## 💻 Technology Stack

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React DnD** or HTML5 Drag and Drop API
- **SheetJS** for Excel processing
- **Papa Parse** for CSV processing
- **date-fns** for date manipulation

### Support Libraries
- **react-hot-toast** for notifications
- **recharts** for charts (dashboard)
- **react-hook-form** for forms
- **zod** for validation

## 📝 Data Structure

### Input Spreadsheet (DasaExp)
```javascript
{
  "ID Sala": "2",
  "Nome da Sala": "AD-SF-FQ-AC-AV CENTER 2 CARRO 2 - UND84",
  "Data/Hora Início": "10/05/2025 07:00:00",
  "Data/Hora Fim": "10/05/2025 11:00:00",
  "Nome do Paciente": "Ana Costa Silva",
  "Códigos dos Exames": "1851, 1451, 1956",
  "Nomes dos Exames": "IGA, IGFBP3, T4 LIVRE",
  "Total Exames": "21",
  "Endereço Coleta": "rua das palmeiras,230,recreio dos bandeirantes,rio de janeiro",
  "Pedido Médico": "Não encontrado",
  "Canal Efetivação": "NAV",
  "Status Confirmação": "Não Confirmado",
  "Canal Confirmação": "-",
  "Documento(s) Paciente": "CPF: 12345678901",
  "Contato(s) Paciente": "Celular: 21 987654321, Email: ana.costa@email.com",
  "Nascimento": "15/03/1985"
}
```

### Processed Data
```javascript
{
  "CARRO 1": [
    {
      id: 1,
      patientName: "Ana Costa Silva",
      time: "07:00",
      duration: 40,
      address: "Rua das Palmeiras, 230 - Recreio",
      phone: "(21) 98765-4321",
      cpf: "123.456.789-01",
      exams: ["IGA", "IGFBP3", "T4 LIVRE"],
      healthPlan: "Bradesco Saúde",
      cardNumber: "123456789",
      status: "Não Confirmado",
      date: "2025-05-10"
    }
  ]
}
```

### Patient Database Structure
```javascript
// Master Patient Record
{
  id: "patient_12345",
  personalInfo: {
    name: "Ana Costa Silva",
    cpf: "123.456.789-01",
    birthDate: "1985-03-15",
    gender: "F",
    email: "ana.costa@email.com",
    preferredContactMethod: "sms", // sms, whatsapp, email, phone
    preferredContactTime: { start: "09:00", end: "18:00" }
  },
  contactInfo: {
    phones: [
      { number: "(21) 98765-4321", type: "mobile", primary: true },
      { number: "(21) 3456-7890", type: "home", primary: false }
    ],
    address: {
      street: "Rua das Palmeiras, 230",
      neighborhood: "Recreio dos Bandeirantes",
      city: "Rio de Janeiro",
      state: "RJ",
      zipCode: "22795-080",
      coordinates: { lat: -23.0123, lng: -43.4567 },
      accessNotes: "Portão azul, 2º andar"
    }
  },
  healthPlan: {
    provider: "Bradesco Saúde",
    cardNumber: "123456789",
    planType: "Premium",
    coverage: ["laboratory", "home_collection"],
    authorizationRequired: false,
    copay: 0
  },
  collectionHistory: [
    {
      id: "collection_001",
      date: "2025-01-05",
      time: "08:30",
      car: "CARRO 1",
      driver: "João Silva",
      status: "completed", // scheduled, confirmed, in_progress, completed, cancelled, no_show
      exams: ["Hemograma", "Glicose", "Colesterol"],
      duration: 35,
      confirmationTimestamp: "2025-01-04T15:30:00Z",
      completionTimestamp: "2025-01-05T08:35:00Z",
      notes: "Coleta realizada sem intercorrências"
    }
  ],
  preferences: {
    preferredTimes: ["morning", "afternoon"], // morning, afternoon, evening
    specialRequirements: "Paciente idoso - cuidado especial",
    accessibilityNeeds: false,
    preferredDriver: null,
    fastingExams: true,
    homeAccessDifficulty: "easy" // easy, moderate, difficult
  },
  confirmationTracking: {
    totalAppointments: 15,
    confirmedAppointments: 13,
    confirmationRate: 0.87,
    averageConfirmationTime: "24h", // time before appointment
    lastConfirmationDate: "2025-01-04T15:30:00Z",
    confirmationAttempts: [
      {
        date: "2025-01-04T14:00:00Z",
        method: "sms",
        status: "no_response",
        operator: "Sistema"
      },
      {
        date: "2025-01-04T15:30:00Z",
        method: "phone",
        status: "confirmed",
        operator: "Maria Santos",
        notes: "Paciente confirmou horário"
      }
    ]
  },
  analytics: {
    frequency: "regular", // occasional, regular, frequent
    seasonalPattern: "winter_higher", // consistent, winter_higher, summer_higher
    noShowRate: 0.05,
    rescheduleRate: 0.10,
    averageExamsPerVisit: 3.2,
    totalCollections: 15,
    lastCollectionDate: "2025-01-05",
    nextScheduledDate: "2025-02-15",
    riskScore: "low" // low, medium, high (based on no-show probability)
  },
  familyGroup: {
    groupId: "family_silva_001",
    members: [
      { patientId: "patient_12346", relation: "spouse", name: "Carlos Silva" },
      { patientId: "patient_12347", relation: "child", name: "Pedro Silva" }
    ],
    coordinatedScheduling: true
  },
  tags: ["vip", "elderly", "regular", "easy_access"],
  status: "active", // active, inactive, deceased, moved
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2025-01-05T09:00:00Z",
  lastActivity: "2025-01-05T08:35:00Z"
}
```

### Patient Analytics Data Structure
```javascript
// Patient Analytics Dashboard
{
  overview: {
    totalPatients: 2847,
    activePatients: 2654,
    newPatientsThisMonth: 47,
    averageAge: 45.3,
    genderDistribution: { male: 0.42, female: 0.58 }
  },
  confirmationMetrics: {
    overallConfirmationRate: 0.89,
    confirmationByMethod: {
      sms: 0.75,
      phone: 0.95,
      whatsapp: 0.88,
      email: 0.65
    },
    confirmationByTimeSlot: {
      "07:00-09:00": 0.92,
      "09:00-12:00": 0.88,
      "12:00-15:00": 0.85,
      "15:00-18:00": 0.91
    },
    averageConfirmationTime: "18h"
  },
  geographicInsights: {
    topNeighborhoods: [
      { name: "Copacabana", patients: 234, avgCollectionTime: 35 },
      { name: "Ipanema", patients: 189, avgCollectionTime: 28 },
      { name: "Leblon", patients: 156, avgCollectionTime: 32 }
    ],
    routeOptimization: {
      clustersIdentified: 12,
      potentialTimeSavings: "2.5h/day",
      recommendedCarReallocation: [
        { from: "Zone A", to: "Zone C", estimatedImprovement: "15%" }
      ]
    }
  },
  behaviorPatterns: {
    frequencyDistribution: {
      occasional: 0.35, // 1-2 times/year
      regular: 0.45,    // 3-6 times/year  
      frequent: 0.20    // 7+ times/year
    },
    seasonalTrends: {
      spring: 1.05,  // multiplier vs baseline
      summer: 0.85,
      autumn: 1.15,
      winter: 0.95
    },
    peakDemandTimes: {
      monday: 1.20,
      tuesday: 1.10,
      wednesday: 1.05,
      thursday: 1.15,
      friday: 1.25,
      saturday: 0.80,
      sunday: 0.45
    }
  }
}
```

## 🔧 Step-by-Step Implementation

### Phase 1: Initial Setup (1 day)
1. Create React project with Vite
2. Install dependencies
3. Configure Tailwind CSS
4. Basic folder structure
5. Configure routing

### Phase 2: Base Layout (1 day)
1. Implement navigable Sidebar
2. Create Header with notifications
3. Responsive layout system
4. Page navigation

### Phase 3: Dashboard (1 day)
1. KPI components
2. Quick actions
3. Activity timeline
4. Car status
5. Integration with mocked data

### Phase 4: Upload and Processing (2 days)
1. Drag & drop upload component
2. Excel/CSV file reading
3. Spreadsheet data parser
4. Information extraction (CPF, phone, etc)
5. Driver grouping
6. Validations and error handling

### Phase 5: Calendar Visualization (2 days)
1. Calendar grid
2. Event positioning
3. Implement drag & drop
4. Details modal
5. Edit actions

### Phase 6: Refinements (1 day)
1. Toast notifications
2. Loading states
3. Animations
4. Mobile responsiveness
5. Manual testing

## 🚀 Development Commands

```bash
# Create project
npm create vite@latest lab-scheduler -- --template react
cd lab-scheduler

# Install main dependencies
npm install react-router-dom lucide-react date-fns
npm install xlsx papaparse
npm install react-hot-toast
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Configure Tailwind in tailwind.config.js
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
]

# Add to src/index.css
@tailwind base;
@tailwind components;
@tailwind utilities;

# Run project
npm run dev
```

## 🎨 Code Standards

### Components
```jsx
// Use function components with hooks
const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // side effects
  }, [dependencies]);
  
  return (
    <div className="tailwind-classes">
      {/* content */}
    </div>
  );
};

export default ComponentName;
```

### Services
```javascript
// services/fileProcessor.js
export const processExcelFile = async (file) => {
  try {
    const data = await readExcelFile(file);
    const validated = validateData(data);
    const processed = extractScheduleData(validated);
    return { success: true, data: processed };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
```

### Custom Hooks
```javascript
// hooks/useFileUpload.js
export const useFileUpload = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const upload = async (selectedFile) => {
    setLoading(true);
    try {
      // process file
      setFile(processedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return { file, upload, loading, error };
};
```

## 🔍 Important Points

### Data Processing
1. **Car Identification**: Extract number from "Nome da Sala" field
2. **CPF**: Clean and format from "Documento(s) Paciente" field
3. **Phone**: Extract first valid mobile number
4. **Address**: Capitalize and format correctly
5. **Times**: Convert to Date objects for calculations

### Drag & Drop
1. Validate time conflicts when moving
2. Update state immediately
3. Visual feedback during drag
4. Allow undo actions

### Performance
1. Virtualize large lists
2. Lazy loading of modules
3. Memoization of heavy components
4. Debounce on searches

## 📦 Global State Structure

```javascript
// context/AppContext.jsx
const initialState = {
  user: {
    name: 'Fabiano Oliveira',
    role: 'admin'
  },
  schedule: {
    uploadedFile: null,
    processedData: null,
    currentStep: 1,
    selectedDate: new Date()
  },
  notifications: [],
  cars: {
    total: 4,
    active: 3,
    data: {}
  }
};
```

## 🧪 Test Cases

1. **Upload**: Drag invalid file
2. **Processing**: Spreadsheet with missing data
3. **Calendar**: Time conflicts
4. **Drag & Drop**: Move to occupied time
5. **Responsiveness**: Test on mobile

## 🔐 Security Considerations

1. Validate all inputs
2. Sanitize data before display
3. Don't expose sensitive data in console
4. Implement authentication (future phase)

## 📈 Future Improvements

1. **API Integrations**
   - Google Calendar
   - WhatsApp Business
   - DASA System

2. **Automatic Optimization**
   - Routing algorithm
   - Time suggestions
   - Load balancing

3. **Analytics**
   - Advanced dashboard
   - Custom reports
   - Demand forecasting

4. **Mobile App**
   - Driver app
   - Real-time confirmation
   - GPS tracking

## 💡 Tips for Claude Code

1. Always start with basic setup
2. Test each component in isolation
3. Use mocked data initially
4. Implement one feature at a time
5. Commit frequently
6. Keep code clean and documented