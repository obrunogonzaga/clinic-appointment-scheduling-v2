// MongoDB initialization script
// This script runs when MongoDB container starts for the first time

// Switch to the lab_scheduler database
db = db.getSiblingDB('lab_scheduler');

// Create collections with indexes
print('Creating lab_scheduler database and collections...');

// Create patients collection with indexes
db.createCollection('patients');
db.patients.createIndex({ "personal_info.cpf": 1 }, { unique: true });
db.patients.createIndex({ "personal_info.name": "text" });
db.patients.createIndex({ "status": 1 });
db.patients.createIndex({ "tags": 1 });
db.patients.createIndex({ "address.neighborhood": 1 });
db.patients.createIndex({ "address.coordinates": "2dsphere" });
db.patients.createIndex({ "analytics.risk_score": 1 });
db.patients.createIndex({ "created_at": 1 });

print('Patients collection created with indexes');

// Create appointments collection with indexes
db.createCollection('appointments');
db.appointments.createIndex({ "patient_id": 1 });
db.appointments.createIndex({ "car_id": 1 });
db.appointments.createIndex({ "scheduled_date": 1 });
db.appointments.createIndex({ "status": 1 });
db.appointments.createIndex({ "scheduled_date": 1, "car_id": 1 });
db.appointments.createIndex({ "confirmation.status": 1 });

print('Appointments collection created with indexes');

// Create cars collection with indexes
db.createCollection('cars');
db.cars.createIndex({ "name": 1 }, { unique: true });
db.cars.createIndex({ "active": 1 });
db.cars.createIndex({ "zones": 1 });
db.cars.createIndex({ "driver.name": 1 });

print('Cars collection created with indexes');

// Insert sample data for development
print('Inserting sample data...');

// Sample cars
db.cars.insertMany([
  {
    name: "CARRO 1",
    license_plate: "ABC-1234",
    model: "Fiat Uno",
    driver: {
      name: "João Silva",
      phone: "21999887766",
      license_number: "12345678901",
      active: true
    },
    capacity: 8,
    active: true,
    zones: ["Copacabana", "Ipanema", "Leblon"],
    working_hours: {
      start_time: "07:00",
      end_time: "18:00",
      break_start: "12:00",
      break_duration: 60
    },
    total_collections: 0,
    average_collection_time: 0.0,
    completion_rate: 1.0,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    name: "CARRO 2",
    license_plate: "DEF-5678",
    model: "Honda Civic",
    driver: {
      name: "Maria Santos",
      phone: "21988776655",
      license_number: "10987654321",
      active: true
    },
    capacity: 10,
    active: true,
    zones: ["Barra da Tijuca", "Recreio", "Jacarepaguá"],
    working_hours: {
      start_time: "06:30",
      end_time: "17:30",
      break_start: "12:30",
      break_duration: 60
    },
    total_collections: 0,
    average_collection_time: 0.0,
    completion_rate: 1.0,
    created_at: new Date(),
    updated_at: new Date()
  }
]);

print('Sample cars inserted');

// Sample patients
db.patients.insertMany([
  {
    personal_info: {
      name: "Ana Costa Silva",
      cpf: "12345678901",
      birth_date: new Date("1985-03-15"),
      gender: "F",
      email: "ana.costa@email.com"
    },
    contacts: [
      {
        type: "mobile",
        value: "21987654321",
        primary: true
      },
      {
        type: "home",
        value: "2133334444",
        primary: false
      }
    ],
    address: {
      street: "Rua das Palmeiras, 230",
      neighborhood: "Recreio dos Bandeirantes",
      city: "Rio de Janeiro",
      state: "RJ",
      zip_code: "22795-080",
      coordinates: [-23.0123, -43.4567],
      access_notes: "Portão azul, 2º andar"
    },
    health_plan: {
      provider: "Bradesco Saúde",
      card_number: "123456789",
      plan_type: "Premium",
      coverage: ["laboratory", "home_collection"],
      authorization_required: false,
      copay: 0.0
    },
    preferences: {
      preferred_times: ["morning"],
      special_requirements: "Paciente idoso - cuidado especial",
      accessibility_needs: false,
      preferred_driver: null,
      fasting_exams: true,
      home_access_difficulty: "easy"
    },
    tags: ["regular", "elderly", "easy_access"],
    status: "active",
    collection_history: [],
    confirmation_attempts: [],
    confirmation_rate: 0.0,
    analytics: {
      frequency: "regular",
      seasonal_pattern: "consistent",
      no_show_rate: 0.05,
      reschedule_rate: 0.10,
      average_exams_per_visit: 3.2,
      total_collections: 15,
      last_collection_date: new Date("2025-01-05"),
      next_scheduled_date: null,
      risk_score: "low"
    },
    created_at: new Date(),
    updated_at: new Date(),
    last_activity: new Date()
  },
  {
    personal_info: {
      name: "Carlos Oliveira",
      cpf: "10987654321",
      birth_date: new Date("1978-07-22"),
      gender: "M",
      email: "carlos.oliveira@email.com"
    },
    contacts: [
      {
        type: "mobile",
        value: "21976543210",
        primary: true
      }
    ],
    address: {
      street: "Av. das Américas, 1500",
      neighborhood: "Barra da Tijuca",
      city: "Rio de Janeiro",
      state: "RJ",
      zip_code: "22640-100",
      coordinates: [-23.0045, -43.3654]
    },
    health_plan: {
      provider: "Unimed",
      card_number: "987654321",
      plan_type: "Standard",
      coverage: ["laboratory"],
      authorization_required: true,
      copay: 25.0
    },
    preferences: {
      preferred_times: ["afternoon"],
      fasting_exams: true,
      home_access_difficulty: "moderate"
    },
    tags: ["occasional"],
    status: "active",
    collection_history: [],
    confirmation_attempts: [],
    confirmation_rate: 0.0,
    analytics: {
      frequency: "occasional",
      no_show_rate: 0.0,
      reschedule_rate: 0.2,
      average_exams_per_visit: 2.0,
      total_collections: 3,
      risk_score: "medium"
    },
    created_at: new Date(),
    updated_at: new Date(),
    last_activity: new Date()
  }
]);

print('Sample patients inserted');

print('MongoDB initialization completed successfully!');
print('Database: lab_scheduler');
print('Collections: patients, appointments, cars');
print('Sample data inserted for development');