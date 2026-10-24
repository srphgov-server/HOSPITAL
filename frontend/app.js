/**
 * Microsoft Dynamics 365 Model-driven Healthcare Management System
 * Core Frontend Application & Data Access Layer (DAL)
 */

// ==========================================
// 1. CONFIGURATION & STATE
// ==========================================
const APP_CONFIG = {
  appName: 'Sieam Reap Provincial Referral Hospital',
  version: '2.0.0-PROTOTYPE',
  storageKey: 'd365_hms_data_v2',
  settingsKey: 'd365_hms_settings_v2',
  appsScriptUrl: '',
  spreadsheetId: '',
  useGoogleSheetsSync: false
};

// Application State
const appState = {
  currentRole: 'Administrator', // Administrator | Receptionist | Doctor | Nurse | Pharmacist | Accountant
  currentView: 'dashboard',    // Active module id
  selectedEntity: null,        // Currently opened record object
  activeRecordType: null,      // Entity name for current record form
  currentTab: 'summary',       // Active tab in record form
  selectedViewFilter: 'default', // Active system view filter
  searchTerm: '',              // Active search query in grids
  sortColumn: null,            // Current sorted column
  sortDirection: 'asc',        // asc | desc
  calendarMode: 'week',        // week | day
  demoStep: 1,                 // Guided tour step
  isTourActive: false
};

// User Personas Definition
const USER_PERSONAS = {
  Administrator: {
    fullName: 'Alex Mercer',
    email: 'admin@metrohealth.demo',
    avatar: 'A',
    roleName: 'System Administrator',
    color: 'bg-slate-700',
    allowedViews: ['dashboard', 'patients', 'appointments', 'visits', 'emergency', 'emergency_bays', 'admissions', 'beds', 'surgeries', 'sterile_processing', 'medical_history', 'diagnoses', 'prescriptions', 'medications', 'laboratory_tests', 'laboratory_results', 'billing', 'payments', 'doctors', 'departments', 'followups', 'reports', 'users', 'security_roles', 'administration']
  },
  Receptionist: {
    fullName: 'Lisa Hernandez',
    email: 'reception@metrohealth.demo',
    avatar: 'L',
    roleName: 'Front Desk Receptionist',
    color: 'bg-sky-600',
    allowedViews: ['dashboard', 'patients', 'appointments', 'visits', 'emergency', 'emergency_bays', 'admissions', 'beds', 'surgeries', 'billing', 'payments']
  },
  Doctor: {
    fullName: 'Dr. Sarah Jenkins, MD',
    email: 'sjenkins@metrohealth.demo',
    avatar: 'S',
    roleName: 'Attending Physician',
    doctorId: 'DOC-001',
    color: 'bg-blue-600',
    allowedViews: ['dashboard', 'patients', 'appointments', 'visits', 'emergency', 'emergency_bays', 'admissions', 'beds', 'surgeries', 'sterile_processing', 'medical_history', 'diagnoses', 'prescriptions', 'laboratory_results', 'followups']
  },
  Nurse: {
    fullName: 'Joyce Chen, RN',
    email: 'jchen@metrohealth.demo',
    avatar: 'J',
    roleName: 'Clinical Triage Nurse',
    color: 'bg-teal-600',
    allowedViews: ['dashboard', 'patients', 'appointments', 'visits', 'emergency', 'emergency_bays', 'admissions', 'beds', 'surgeries', 'sterile_processing', 'laboratory_results', 'followups']
  },
  Pharmacist: {
    fullName: 'Todd Bradley, PharmD',
    email: 'tbradley@metrohealth.demo',
    avatar: 'T',
    roleName: 'Chief Pharmacist',
    color: 'bg-amber-600',
    allowedViews: ['dashboard', 'prescriptions', 'medications']
  },
  Accountant: {
    fullName: 'Rachel Green, CPA',
    email: 'rgreen@metrohealth.demo',
    avatar: 'R',
    roleName: 'Billing & Cashier Specialist',
    color: 'bg-emerald-600',
    allowedViews: ['dashboard', 'billing', 'payments', 'reports', 'admissions']
  }
};

// ==========================================
// 2. DATA ACCESS LAYER (REPOSITORY PATTERN)
// Swappable to Microsoft Dataverse or Google Sheets
// ==========================================
const DAL = {
  db: {},

  init: function() {
    // Load config from localStorage if available
    const savedConfig = localStorage.getItem(APP_CONFIG.settingsKey);
    if (savedConfig) {
      try {
        Object.assign(APP_CONFIG, JSON.parse(savedConfig));
      } catch (e) { console.error(e); }
    }

    // Load data from localStorage or seed
    const savedData = localStorage.getItem(APP_CONFIG.storageKey);
    if (savedData) {
      try {
        this.db = JSON.parse(savedData);
        // Ensure new Emergency module tables exist in active storage
        if (!this.db.EmergencyBays || this.db.EmergencyBays.length === 0 || !this.db.EmergencyEncounters) {
          const sample = this.generateSampleData();
          this.db.EmergencyBays = sample.EmergencyBays;
          this.db.EmergencyEncounters = sample.EmergencyEncounters;
          this.persist();
        }
        // Ensure IPD sample orders exist in active storage
        if (this.db.LaboratoryResults && !this.db.LaboratoryResults.some(r => r.VisitID && r.VisitID.startsWith('ADM-'))) {
          const sampleIpdOrders = [
            {
              ResultID: 'RES-IPD-001',
              PatientID: 'PAT-002',
              VisitID: 'ADM-001',
              DoctorID: 'DOC-002',
              TestID: 'LAB-006',
              TestName: 'Cardiac Troponin I',
              TestDate: '2026-03-18',
              Result: '0.85 ng/mL (Elevated - Acute Myocardial Injury)',
              ReferenceRange: '< 0.04 ng/mL',
              Interpretation: 'Abnormal',
              Status: 'Completed',
              Notes: '[IPD Order - ADM-001] Priority: STAT (Urgent Bedside) | Bed: ICU-101. Indication: Rule out NSTEMI',
              TechnicianName: 'Inpatient Core Diagnostics',
              CreatedAt: '2026-03-18T10:30:00Z',
              UpdatedAt: '2026-03-18T11:15:00Z'
            },
            {
              ResultID: 'RES-IPD-002',
              PatientID: 'PAT-002',
              VisitID: 'ADM-001',
              DoctorID: 'DOC-002',
              TestID: 'LAB-011',
              TestName: '2D Echocardiography (Echo)',
              TestDate: '2026-03-19',
              Result: 'Pending Analysis',
              ReferenceRange: 'LVEF 55-65%, intact valve motion',
              Interpretation: 'Normal',
              Status: 'Requested',
              Notes: '[IPD Order - ADM-001] Priority: Urgent | Bed: ICU-101. Indication: Assess wall motion and ejection fraction',
              TechnicianName: 'Cardiovascular Imaging Lab',
              CreatedAt: '2026-03-19T08:00:00Z',
              UpdatedAt: '2026-03-19T08:00:00Z'
            },
            {
              ResultID: 'RES-IPD-003',
              PatientID: 'PAT-001',
              VisitID: 'ADM-002',
              DoctorID: 'DOC-001',
              TestID: 'LAB-001',
              TestName: 'Complete Blood Count (CBC)',
              TestDate: '2026-03-19',
              Result: 'WBC: 8.2 x10^3/uL, Hgb: 13.8 g/dL, Plt: 260 x10^3/uL',
              ReferenceRange: 'WBC: 4.5-11.0 x10^3/uL',
              Interpretation: 'Normal',
              Status: 'Completed',
              Notes: '[IPD Order - ADM-002] Priority: Routine | Bed: MED-201. Indication: Monitor for infection / eosinophilia',
              TechnicianName: 'Inpatient Core Diagnostics',
              CreatedAt: '2026-03-19T15:00:00Z',
              UpdatedAt: '2026-03-19T16:00:00Z'
            },
            {
              ResultID: 'RES-IPD-004',
              PatientID: 'PAT-001',
              VisitID: 'ADM-002',
              DoctorID: 'DOC-001',
              TestID: 'LAB-002',
              TestName: 'Comprehensive Metabolic Panel (CMP)',
              TestDate: '2026-03-20',
              Result: 'Pending Analysis',
              ReferenceRange: 'Glucose: 70-99 mg/dL, Creatinine: 0.7-1.3 mg/dL',
              Interpretation: 'Normal',
              Status: 'Requested',
              Notes: '[IPD Order - ADM-002] Priority: Routine | Bed: MED-201. Indication: Baseline electrolytes and kidney function',
              TechnicianName: 'Inpatient Core Diagnostics',
              CreatedAt: '2026-03-20T08:00:00Z',
              UpdatedAt: '2026-03-20T08:00:00Z'
            }
          ];
          this.db.LaboratoryResults = (this.db.LaboratoryResults || []).concat(sampleIpdOrders);
          this.persist();
        }
        // Ensure Operation Theaters, Surgeries, and Sterile Trays exist in active storage
        if (!this.db.OperationTheaters || !this.db.Surgeries || !this.db.SterileTrays || this.db.Surgeries.length === 0) {
          const sample = this.generateSampleData();
          this.db.OperationTheaters = sample.OperationTheaters;
          this.db.Surgeries = sample.Surgeries;
          this.db.SterileTrays = sample.SterileTrays;
          this.persist();
        }
      } catch (e) {
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  },

  seedInitialData: function() {
    // Built-in realistic sample seed data generator
    this.db = this.generateSampleData();
    this.persist();
  },

  persist: function() {
    try {
      localStorage.setItem(APP_CONFIG.storageKey, JSON.stringify(this.db));
      this.updateSyncIndicator(true);
    } catch (e) {
      console.warn('Storage persist error:', e);
    }
  },

  find: function(entityName, criteria = {}) {
    const list = this.db[entityName] || [];
    return list.filter(item => {
      for (const [key, val] of Object.entries(criteria)) {
        if (val !== undefined && item[key] !== val) return false;
      }
      return true;
    });
  },

  findById: function(entityName, id) {
    const pk = this.getPrimaryKey(entityName);
    const list = this.db[entityName] || [];
    return list.find(item => String(item[pk]) === String(id)) || null;
  },

  create: function(entityName, recordObj) {
    if (!this.db[entityName]) this.db[entityName] = [];
    const pk = this.getPrimaryKey(entityName);
    
    if (!recordObj[pk]) {
      const prefix = entityName.substring(0, 3).toUpperCase();
      const num = this.db[entityName].length + 1;
      recordObj[pk] = `${prefix}-${String(num).padStart(3, '0')}`;
    }
    const now = new Date().toISOString();
    recordObj.CreatedAt = now;
    recordObj.UpdatedAt = now;

    this.db[entityName].unshift(recordObj);
    this.persist();

    // Trigger Google Sheets sync if configured
    if (APP_CONFIG.useGoogleSheetsSync && APP_CONFIG.appsScriptUrl) {
      this.syncWithGoogleSheets('createRecord', entityName, recordObj);
    }

    return recordObj;
  },

  update: function(entityName, id, updates) {
    const pk = this.getPrimaryKey(entityName);
    const list = this.db[entityName] || [];
    const index = list.findIndex(item => String(item[pk]) === String(id));
    
    if (index !== -1) {
      const updated = Object.assign({}, list[index], updates, { UpdatedAt: new Date().toISOString() });
      list[index] = updated;
      this.persist();

      if (APP_CONFIG.useGoogleSheetsSync && APP_CONFIG.appsScriptUrl) {
        this.syncWithGoogleSheets('updateRecord', entityName, updated, id);
      }
      return updated;
    }
    return null;
  },

  delete: function(entityName, id) {
    // Soft delete / deactivate in Dynamics 365 style
    const rec = this.findById(entityName, id);
    if (!rec) return false;

    if (rec.PatientStatus !== undefined) {
      return this.update(entityName, id, { PatientStatus: 'Inactive' });
    } else if (rec.Status !== undefined) {
      return this.update(entityName, id, { Status: 'Inactive' });
    } else {
      const pk = this.getPrimaryKey(entityName);
      this.db[entityName] = (this.db[entityName] || []).filter(item => String(item[pk]) !== String(id));
      this.persist();
      return true;
    }
  },

  getPrimaryKey: function(entityName) {
    const pkMap = {
      Patients: 'PatientID',
      Doctors: 'DoctorID',
      Departments: 'DepartmentID',
      Appointments: 'AppointmentID',
      Visits: 'VisitID',
      VitalSigns: 'VitalSignID',
      Diagnoses: 'DiagnosisID',
      Medications: 'MedicationID',
      Prescriptions: 'PrescriptionID',
      PrescriptionItems: 'PrescriptionItemID',
      LaboratoryTests: 'TestID',
      LaboratoryResults: 'ResultID',
      Invoices: 'InvoiceID',
      Payments: 'PaymentID',
      FollowUps: 'FollowUpID',
      Users: 'UserID',
      SecurityRoles: 'RoleID',
      Beds: 'BedID',
      Admissions: 'AdmissionID',
      DailyRounds: 'RoundID',
      EmergencyEncounters: 'EncounterID',
      EmergencyBays: 'BayID',
      OperationTheaters: 'TheaterID',
      Surgeries: 'SurgeryID',
      SterileTrays: 'TrayID'
    };
    return pkMap[entityName] || 'id';
  },

  // Google Sheets Cloud Synchronization
  syncWithGoogleSheets: async function(action, entityName, payload, recordId = null) {
    if (!APP_CONFIG.appsScriptUrl) return;
    try {
      this.updateSyncIndicator(false, 'Syncing...');
      const res = await fetch(APP_CONFIG.appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({
          action: action,
          table: entityName,
          payload: payload,
          id: recordId,
          userContext: {
            username: appState.currentRole.toLowerCase(),
            role: appState.currentRole
          }
        })
      });
      const data = await res.json();
      this.updateSyncIndicator(true, 'Synced');
      return data;
    } catch (e) {
      console.warn('Google Sheets sync notice:', e);
      this.updateSyncIndicator(true, 'Local Cache');
    }
  },

  updateSyncIndicator: function(isOnline, text = '') {
    const el = document.getElementById('sync-status-indicator');
    if (el) {
      el.className = isOnline ? 'w-2 h-2 rounded-full bg-emerald-400' : 'w-2 h-2 rounded-full bg-amber-400 animate-ping';
      if (text) el.title = `Google Sheets Sync: ${text}`;
    }
  },

  // Export current entity to CSV
  exportToCsv: function(entityName) {
    const data = this.find(entityName);
    if (!data || data.length === 0) {
      showToast('No records to export', 'warning');
      return;
    }
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];
    for (const row of data) {
      const values = headers.map(header => {
        const val = row[header] !== undefined && row[header] !== null ? String(row[header]) : '';
        return `"${val.replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(','));
    }
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${entityName}_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${data.length} records to CSV`, 'success');
  },

  // Sample data generation matching prototype requirement
  generateSampleData: function() {
    const departments = [
      { DepartmentID: 'DEP-001', DepartmentName: 'General Medicine', DepartmentCode: 'GEN-MED', HeadDoctorID: 'DOC-001', Building: 'Pavilion A', Floor: '1st Floor', Status: 'Active', ConsultationFee: 40.00, CreatedAt: '2026-01-01T08:00:00Z' },
      { DepartmentID: 'DEP-002', DepartmentName: 'Cardiology', DepartmentCode: 'CARD', HeadDoctorID: 'DOC-002', Building: 'Heart Center B', Floor: '2nd Floor', Status: 'Active', ConsultationFee: 65.00, CreatedAt: '2026-01-01T08:00:00Z' },
      { DepartmentID: 'DEP-003', DepartmentName: 'Pediatrics', DepartmentCode: 'PED', HeadDoctorID: 'DOC-003', Building: 'Children Wing C', Floor: '1st Floor', Status: 'Active', ConsultationFee: 45.00, CreatedAt: '2026-01-01T08:00:00Z' },
      { DepartmentID: 'DEP-004', DepartmentName: 'Orthopedics', DepartmentCode: 'ORTHO', HeadDoctorID: 'DOC-004', Building: 'Surgical Wing D', Floor: '3rd Floor', Status: 'Active', ConsultationFee: 60.00, CreatedAt: '2026-01-01T08:00:00Z' },
      { DepartmentID: 'DEP-005', DepartmentName: 'Endocrinology', DepartmentCode: 'ENDO', HeadDoctorID: 'DOC-005', Building: 'Pavilion A', Floor: '2nd Floor', Status: 'Active', ConsultationFee: 55.00, CreatedAt: '2026-01-01T08:00:00Z' }
    ];

    const doctors = [
      { DoctorID: 'DOC-001', DoctorName: 'Dr. Sarah Jenkins, MD', Gender: 'Female', Specialization: 'Internal Medicine', DepartmentID: 'DEP-001', LicenseNumber: 'MED-NY-84920', Phone: '+1 (555) 234-5678', Email: 'sjenkins@metrohealth.demo', Availability: 'Mon-Fri 08:00-16:00', Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { DoctorID: 'DOC-002', DoctorName: 'Dr. Marcus Vance, MD', Gender: 'Male', Specialization: 'Interventional Cardiology', DepartmentID: 'DEP-002', LicenseNumber: 'CARD-NY-73192', Phone: '+1 (555) 345-6789', Email: 'mvance@metrohealth.demo', Availability: 'Mon-Thu 09:00-17:00', Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { DoctorID: 'DOC-003', DoctorName: 'Dr. Elena Rostova, MD', Gender: 'Female', Specialization: 'Pediatric Care', DepartmentID: 'DEP-003', LicenseNumber: 'PED-NY-56291', Phone: '+1 (555) 456-7890', Email: 'erostova@metrohealth.demo', Availability: 'Tue-Sat 08:30-16:30', Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { DoctorID: 'DOC-004', DoctorName: 'Dr. David Kim, MD', Gender: 'Male', Specialization: 'Orthopedic Surgery', DepartmentID: 'DEP-004', LicenseNumber: 'ORTH-NY-67312', Phone: '+1 (555) 567-8901', Email: 'dkim@metrohealth.demo', Availability: 'Mon-Wed-Fri 08:00-17:00', Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { DoctorID: 'DOC-005', DoctorName: 'Dr. Amara Okafor, MD', Gender: 'Female', Specialization: 'Metabolic Disorders', DepartmentID: 'DEP-005', LicenseNumber: 'ENDO-NY-91043', Phone: '+1 (555) 678-9012', Email: 'aokafor@metrohealth.demo', Availability: 'Mon-Fri 09:00-15:00', Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' }
    ];

    const patients = [
      { PatientID: 'PAT-001', PatientNumber: 'MRN-2026-0001', FirstName: 'Eleanor', LastName: 'Vance', Gender: 'Female', DateOfBirth: '1984-03-15', Age: 42, PhoneNumber: '+1 (555) 101-0001', Email: 'eleanor.vance@example.com', Address: '742 Evergreen Terrace, Springfield', EmergencyContactName: 'Robert Vance', EmergencyContactPhone: '+1 (555) 101-9001', BloodType: 'A+', Allergies: 'Penicillin, Sulfa drugs', MedicalConditions: 'Hypertension, Mild Asthma', RegistrationDate: '2026-01-05', PatientStatus: 'Active', AssignedDoctorID: 'DOC-001', Notes: 'Requires BP check at each visit.', CreatedAt: '2026-01-05T09:00:00Z', UpdatedAt: '2026-01-05T09:00:00Z' },
      { PatientID: 'PAT-002', PatientNumber: 'MRN-2026-0002', FirstName: 'James', LastName: 'Wilson', Gender: 'Male', DateOfBirth: '1968-11-20', Age: 57, PhoneNumber: '+1 (555) 101-0002', Email: 'jwilson@example.com', Address: '124 Conch Street, Riverdale', EmergencyContactName: 'Clara Wilson', EmergencyContactPhone: '+1 (555) 101-9002', BloodType: 'O+', Allergies: 'None Known', MedicalConditions: 'Coronary Artery Disease, Hyperlipidemia', RegistrationDate: '2026-01-08', PatientStatus: 'Active', AssignedDoctorID: 'DOC-002', Notes: 'Post-angioplasty annual follow-up.', CreatedAt: '2026-01-08T10:15:00Z', UpdatedAt: '2026-01-08T10:15:00Z' },
      { PatientID: 'PAT-003', PatientNumber: 'MRN-2026-0003', FirstName: 'Liam', LastName: 'Cooper', Gender: 'Male', DateOfBirth: '2018-06-04', Age: 8, PhoneNumber: '+1 (555) 101-0003', Email: 'cooper.family@example.com', Address: '45 Elm Street, Oakridge', EmergencyContactName: 'Hannah Cooper (Mother)', EmergencyContactPhone: '+1 (555) 101-9003', BloodType: 'B+', Allergies: 'Peanuts', MedicalConditions: 'Pediatric Asthma', RegistrationDate: '2026-01-10', PatientStatus: 'Active', AssignedDoctorID: 'DOC-003', Notes: 'Carries EpiPen.', CreatedAt: '2026-01-10T11:00:00Z', UpdatedAt: '2026-01-10T11:00:00Z' },
      { PatientID: 'PAT-004', PatientNumber: 'MRN-2026-0004', FirstName: 'Sophia', LastName: 'Martinez', Gender: 'Female', DateOfBirth: '1995-09-12', Age: 30, PhoneNumber: '+1 (555) 101-0004', Email: 'smartinez@example.com', Address: '88 Maple Ave, Fairview', EmergencyContactName: 'Carlos Martinez', EmergencyContactPhone: '+1 (555) 101-9004', BloodType: 'AB+', Allergies: 'NSAIDs (Ibuprofen)', MedicalConditions: 'ACL Sprain (Right Knee)', RegistrationDate: '2026-01-12', PatientStatus: 'Active', AssignedDoctorID: 'DOC-004', Notes: 'Rehabilitation athlete.', CreatedAt: '2026-01-12T14:30:00Z', UpdatedAt: '2026-01-12T14:30:00Z' },
      { PatientID: 'PAT-005', PatientNumber: 'MRN-2026-0005', FirstName: 'Arthur', LastName: 'Pendelton', Gender: 'Male', DateOfBirth: '1955-02-28', Age: 71, PhoneNumber: '+1 (555) 101-0005', Email: 'apendelton@example.com', Address: '302 Pine Crest, Sunnyvale', EmergencyContactName: 'Mary Pendelton', EmergencyContactPhone: '+1 (555) 101-9005', BloodType: 'O-', Allergies: 'Latex', MedicalConditions: 'Type 2 Diabetes Mellitus, Neuropathy', RegistrationDate: '2026-01-15', PatientStatus: 'Active', AssignedDoctorID: 'DOC-005', Notes: 'Monitors HbA1c quarterly.', CreatedAt: '2026-01-15T08:45:00Z', UpdatedAt: '2026-01-15T08:45:00Z' },
      { PatientID: 'PAT-006', PatientNumber: 'MRN-2026-0006', FirstName: 'Chloe', LastName: 'Bennett', Gender: 'Female', DateOfBirth: '1990-04-18', Age: 36, PhoneNumber: '+1 (555) 101-0006', Email: 'cbennett@example.com', Address: '15 Beacon Hill, Boston', EmergencyContactName: 'Thomas Bennett', EmergencyContactPhone: '+1 (555) 101-9006', BloodType: 'A-', Allergies: 'Codeine', MedicalConditions: 'Migraine with Aura', RegistrationDate: '2026-01-18', PatientStatus: 'Active', AssignedDoctorID: 'DOC-001', Notes: '', CreatedAt: '2026-01-18T09:20:00Z', UpdatedAt: '2026-01-18T09:20:00Z' },
      { PatientID: 'PAT-007', PatientNumber: 'MRN-2026-0007', FirstName: 'Lucas', LastName: 'Torres', Gender: 'Male', DateOfBirth: '1982-12-05', Age: 43, PhoneNumber: '+1 (555) 101-0007', Email: 'ltorres@example.com', Address: '512 Sunset Blvd, Los Angeles', EmergencyContactName: 'Elena Torres', EmergencyContactPhone: '+1 (555) 101-9007', BloodType: 'O+', Allergies: 'None', MedicalConditions: 'Essential Hypertension', RegistrationDate: '2026-01-20', PatientStatus: 'Active', AssignedDoctorID: 'DOC-002', Notes: '', CreatedAt: '2026-01-20T10:00:00Z', UpdatedAt: '2026-01-20T10:00:00Z' },
      { PatientID: 'PAT-008', PatientNumber: 'MRN-2026-0008', FirstName: 'Maya', LastName: 'Lin', Gender: 'Female', DateOfBirth: '2015-08-30', Age: 10, PhoneNumber: '+1 (555) 101-0008', Email: 'linfamily@example.com', Address: '77 Cedar Lane, Brookline', EmergencyContactName: 'David Lin (Father)', EmergencyContactPhone: '+1 (555) 101-9008', BloodType: 'B-', Allergies: 'Amoxicillin', MedicalConditions: 'Seasonal Rhinitis', RegistrationDate: '2026-01-22', PatientStatus: 'Active', AssignedDoctorID: 'DOC-003', Notes: '', CreatedAt: '2026-01-22T13:10:00Z', UpdatedAt: '2026-01-22T13:10:00Z' },
      { PatientID: 'PAT-009', PatientNumber: 'MRN-2026-0009', FirstName: 'Harrison', LastName: 'Ford', Gender: 'Male', DateOfBirth: '1950-07-13', Age: 76, PhoneNumber: '+1 (555) 101-0009', Email: 'hford@example.com', Address: '900 Summit Ridge, Aspen', EmergencyContactName: 'Calista Ford', EmergencyContactPhone: '+1 (555) 101-9009', BloodType: 'A+', Allergies: 'Aspirin', MedicalConditions: 'Osteoarthritis (Left Hip)', RegistrationDate: '2026-01-25', PatientStatus: 'Active', AssignedDoctorID: 'DOC-004', Notes: 'Needs walking cane assistance.', CreatedAt: '2026-01-25T11:30:00Z', UpdatedAt: '2026-01-25T11:30:00Z' },
      { PatientID: 'PAT-010', PatientNumber: 'MRN-2026-0010', FirstName: 'Zoe', LastName: 'Kravitz', Gender: 'Female', DateOfBirth: '1988-12-01', Age: 37, PhoneNumber: '+1 (555) 101-0010', Email: 'zkravitz@example.com', Address: '44 Hudson Yards, Manhattan', EmergencyContactName: 'Lenny Kravitz', EmergencyContactPhone: '+1 (555) 101-9010', BloodType: 'AB-', Allergies: 'None', MedicalConditions: 'Hypothyroidism (Hashimoto)', RegistrationDate: '2026-01-28', PatientStatus: 'Active', AssignedDoctorID: 'DOC-005', Notes: 'Daily levothyroxine.', CreatedAt: '2026-01-28T15:45:00Z', UpdatedAt: '2026-01-28T15:45:00Z' },
      { PatientID: 'PAT-011', PatientNumber: 'MRN-2026-0011', FirstName: 'Benjamin', LastName: 'Hayes', Gender: 'Male', DateOfBirth: '1979-05-19', Age: 47, PhoneNumber: '+1 (555) 101-0011', Email: 'bhayes@example.com', Address: '61 Willow Creek, Portland', EmergencyContactName: 'Sarah Hayes', EmergencyContactPhone: '+1 (555) 101-9011', BloodType: 'O+', Allergies: 'Shellfish', MedicalConditions: 'GERD, Sleep Apnea', RegistrationDate: '2026-02-01', PatientStatus: 'Active', AssignedDoctorID: 'DOC-001', Notes: '', CreatedAt: '2026-02-01T09:10:00Z', UpdatedAt: '2026-02-01T09:10:00Z' },
      { PatientID: 'PAT-012', PatientNumber: 'MRN-2026-0012', FirstName: 'Nadia', LastName: 'Petrova', Gender: 'Female', DateOfBirth: '1963-09-08', Age: 62, PhoneNumber: '+1 (555) 101-0012', Email: 'npetrova@example.com', Address: '120 Magnolia St, Atlanta', EmergencyContactName: 'Ivan Petrov', EmergencyContactPhone: '+1 (555) 101-9012', BloodType: 'B+', Allergies: 'Ciprofloxacin', MedicalConditions: 'Atrial Fibrillation', RegistrationDate: '2026-02-03', PatientStatus: 'Active', AssignedDoctorID: 'DOC-002', Notes: 'On oral anticoagulant.', CreatedAt: '2026-02-03T10:40:00Z', UpdatedAt: '2026-02-03T10:40:00Z' },
      { PatientID: 'PAT-013', PatientNumber: 'MRN-2026-0013', FirstName: 'Ethan', LastName: 'Hunt', Gender: 'Male', DateOfBirth: '2020-03-14', Age: 6, PhoneNumber: '+1 (555) 101-0013', Email: 'huntfamily@example.com', Address: '33 Valley Way, Seattle', EmergencyContactName: 'Julia Hunt (Mother)', EmergencyContactPhone: '+1 (555) 101-9013', BloodType: 'A+', Allergies: 'Egg whites', MedicalConditions: 'Eczema / Atopic Dermatitis', RegistrationDate: '2026-02-05', PatientStatus: 'Active', AssignedDoctorID: 'DOC-003', Notes: 'Pediatric checkups on schedule.', CreatedAt: '2026-02-05T14:15:00Z', UpdatedAt: '2026-02-05T14:15:00Z' },
      { PatientID: 'PAT-014', PatientNumber: 'MRN-2026-0014', FirstName: 'Gabriel', LastName: 'Santos', Gender: 'Male', DateOfBirth: '1998-01-24', Age: 28, PhoneNumber: '+1 (555) 101-0014', Email: 'gsantos@example.com', Address: '210 Ocean Drive, Miami', EmergencyContactName: 'Maria Santos', EmergencyContactPhone: '+1 (555) 101-9014', BloodType: 'O+', Allergies: 'None', MedicalConditions: 'Meniscal Tear (Right Knee)', RegistrationDate: '2026-02-08', PatientStatus: 'Active', AssignedDoctorID: 'DOC-004', Notes: '', CreatedAt: '2026-02-08T08:50:00Z', UpdatedAt: '2026-02-08T08:50:00Z' },
      { PatientID: 'PAT-015', PatientNumber: 'MRN-2026-0015', FirstName: 'Miriam', LastName: 'Al-Mansoor', Gender: 'Female', DateOfBirth: '1972-10-30', Age: 53, PhoneNumber: '+1 (555) 101-0015', Email: 'mmansoor@example.com', Address: '58 Park Row, Chicago', EmergencyContactName: 'Tariq Mansoor', EmergencyContactPhone: '+1 (555) 101-9015', BloodType: 'A-', Allergies: 'Metformin (GI intolerance)', MedicalConditions: 'Type 2 Diabetes, Diabetic Retinopathy', RegistrationDate: '2026-02-10', PatientStatus: 'Active', AssignedDoctorID: 'DOC-005', Notes: 'Insulin basal-bolus regimen.', CreatedAt: '2026-02-10T11:20:00Z', UpdatedAt: '2026-02-10T11:20:00Z' },
      { PatientID: 'PAT-016', PatientNumber: 'MRN-2026-0016', FirstName: 'Oliver', LastName: 'Queen', Gender: 'Male', DateOfBirth: '1985-07-29', Age: 41, PhoneNumber: '+1 (555) 101-0016', Email: 'oqueen@example.com', Address: '100 Starling Way, Star City', EmergencyContactName: 'Felicity Smoak', EmergencyContactPhone: '+1 (555) 101-9016', BloodType: 'O-', Allergies: 'None', MedicalConditions: 'Chronic Lower Back Pain', RegistrationDate: '2026-02-12', PatientStatus: 'Active', AssignedDoctorID: 'DOC-004', Notes: '', CreatedAt: '2026-02-12T13:00:00Z', UpdatedAt: '2026-02-12T13:00:00Z' },
      { PatientID: 'PAT-017', PatientNumber: 'MRN-2026-0017', FirstName: 'Grace', LastName: 'Kim', Gender: 'Female', DateOfBirth: '1993-02-17', Age: 33, PhoneNumber: '+1 (555) 101-0017', Email: 'grace.kim@example.com', Address: '88 Rose Lane, Austin', EmergencyContactName: 'Brian Kim', EmergencyContactPhone: '+1 (555) 101-9017', BloodType: 'B+', Allergies: 'Cephalosporins', MedicalConditions: 'Generalized Anxiety Disorder', RegistrationDate: '2026-02-15', PatientStatus: 'Active', AssignedDoctorID: 'DOC-001', Notes: '', CreatedAt: '2026-02-15T09:40:00Z', UpdatedAt: '2026-02-15T09:40:00Z' },
      { PatientID: 'PAT-018', PatientNumber: 'MRN-2026-0018', FirstName: 'Walter', LastName: 'White', Gender: 'Male', DateOfBirth: '1959-09-07', Age: 67, PhoneNumber: '+1 (555) 101-0018', Email: 'wwhite@example.com', Address: '308 Negra Arroyo Lane, Albuquerque', EmergencyContactName: 'Skyler White', EmergencyContactPhone: '+1 (555) 101-9018', BloodType: 'A+', Allergies: 'None', MedicalConditions: 'COPD, Stage 1 Hypertension', RegistrationDate: '2026-02-18', PatientStatus: 'Active', AssignedDoctorID: 'DOC-001', Notes: 'Pulmonary function test required.', CreatedAt: '2026-02-18T10:15:00Z', UpdatedAt: '2026-02-18T10:15:00Z' },
      { PatientID: 'PAT-019', PatientNumber: 'MRN-2026-0019', FirstName: 'Diana', LastName: 'Prince', Gender: 'Female', DateOfBirth: '1987-03-22', Age: 39, PhoneNumber: '+1 (555) 101-0019', Email: 'dprince@example.com', Address: '1 Gateway Center, Washington DC', EmergencyContactName: 'Steve Trevor', EmergencyContactPhone: '+1 (555) 101-9019', BloodType: 'O+', Allergies: 'None Known', MedicalConditions: 'Annual Preventive Health', RegistrationDate: '2026-02-20', PatientStatus: 'Active', AssignedDoctorID: 'DOC-001', Notes: 'Executive physical screening.', CreatedAt: '2026-02-20T11:45:00Z', UpdatedAt: '2026-02-20T11:45:00Z' },
      { PatientID: 'PAT-020', PatientNumber: 'MRN-2026-0020', FirstName: 'Victor', LastName: 'Stone', Gender: 'Male', DateOfBirth: '1996-08-11', Age: 30, PhoneNumber: '+1 (555) 101-0020', Email: 'vstone@example.com', Address: '700 Detroit Ave, Detroit', EmergencyContactName: 'Silas Stone', EmergencyContactPhone: '+1 (555) 101-9020', BloodType: 'AB+', Allergies: 'Adhesive tape', MedicalConditions: 'Prosthetic Rehabilitation, Nerve Trauma', RegistrationDate: '2026-02-22', PatientStatus: 'Active', AssignedDoctorID: 'DOC-004', Notes: 'Physiotherapy protocol.', CreatedAt: '2026-02-22T14:00:00Z', UpdatedAt: '2026-02-22T14:00:00Z' },
      { PatientID: 'PAT-021', PatientNumber: 'MRN-2026-0021', FirstName: 'Clara', LastName: 'Oswald', Gender: 'Female', DateOfBirth: '1991-11-23', Age: 34, PhoneNumber: '+1 (555) 101-0021', Email: 'coswald@example.com', Address: '42 Baker Street, London/NY', EmergencyContactName: 'Danny Pink', EmergencyContactPhone: '+1 (555) 101-9021', BloodType: 'O+', Allergies: 'None', MedicalConditions: 'Iron Deficiency Anemia', RegistrationDate: '2026-02-25', PatientStatus: 'Active', AssignedDoctorID: 'DOC-001', Notes: '', CreatedAt: '2026-02-25T15:20:00Z', UpdatedAt: '2026-02-25T15:20:00Z' },
      { PatientID: 'PAT-022', PatientNumber: 'MRN-2026-0022', FirstName: 'Henry', LastName: 'Cavill', Gender: 'Male', DateOfBirth: '1983-05-05', Age: 43, PhoneNumber: '+1 (555) 101-0022', Email: 'hcavill@example.com', Address: '55 Jersey Road, Kansas', EmergencyContactName: 'Natalie Viscuso', EmergencyContactPhone: '+1 (555) 101-9022', BloodType: 'O-', Allergies: 'None', MedicalConditions: 'Hamstring Strain', RegistrationDate: '2026-03-01', PatientStatus: 'Inactive', AssignedDoctorID: 'DOC-004', Notes: 'Discharged from care.', CreatedAt: '2026-03-01T08:30:00Z', UpdatedAt: '2026-03-01T08:30:00Z' }
    ];

    const laboratoryTests = [
      { TestID: 'LAB-001', TestName: 'Complete Blood Count (CBC)', TestCode: 'CBC', Category: 'Hematology', Description: 'RBC, WBC, Platelets, Hemoglobin, Hematocrit', NormalRange: 'WBC: 4.5-11.0 x10^3/uL, Hgb: 13.5-17.5 g/dL', Unit: 'Various', Cost: 25.00, Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { TestID: 'LAB-002', TestName: 'Comprehensive Metabolic Panel (CMP)', TestCode: 'CMP', Category: 'Biochemistry', Description: '14 tests including glucose, calcium, electrolytes, kidney & liver enzymes', NormalRange: 'Glucose: 70-99 mg/dL, Creatinine: 0.7-1.3 mg/dL', Unit: 'mg/dL', Cost: 45.00, Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { TestID: 'LAB-003', TestName: 'Lipid Panel', TestCode: 'LIPID', Category: 'Biochemistry', Description: 'Total Cholesterol, HDL, LDL, Triglycerides', NormalRange: 'Total Chol < 200 mg/dL, LDL < 100 mg/dL', Unit: 'mg/dL', Cost: 35.00, Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { TestID: 'LAB-004', TestName: 'Hemoglobin A1c (HbA1c)', TestCode: 'HBA1C', Category: 'Biochemistry', Description: 'Glycated hemoglobin indicator for 3-month average blood sugar', NormalRange: '< 5.7% (Normal), 5.7-6.4% (Prediabetes)', Unit: '%', Cost: 30.00, Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { TestID: 'LAB-005', TestName: 'Thyroid Stimulating Hormone (TSH)', TestCode: 'TSH', Category: 'Immunology', Description: 'Pituitary hormone regulating thyroid function', NormalRange: '0.4 - 4.0 mIU/L', Unit: 'mIU/L', Cost: 35.00, Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { TestID: 'LAB-006', TestName: 'Cardiac Troponin I', TestCode: 'TROP-I', Category: 'Hematology', Description: 'Cardiac marker for myocardial infarction / acute coronary syndrome', NormalRange: '< 0.04 ng/mL', Unit: 'ng/mL', Cost: 50.00, Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { TestID: 'LAB-007', TestName: 'Urinalysis Routine', TestCode: 'UA', Category: 'Microbiology', Description: 'Physical, chemical, and microscopic exam of urine', NormalRange: 'Clear, Protein: Neg, Glucose: Neg', Unit: 'Score', Cost: 18.00, Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { TestID: 'LAB-008', TestName: 'Chest X-Ray (PA & Lateral)', TestCode: 'XR-CHEST', Category: 'Imaging', Description: 'Radiographic examination of chest, lungs, and cardiac silhouette', NormalRange: 'Normal lung fields and cardiac size', Unit: 'Study', Cost: 65.00, Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { TestID: 'LAB-009', TestName: 'Brain CT Scan (Non-Contrast)', TestCode: 'CT-BRAIN', Category: 'Imaging', Description: 'Axial computed tomography of brain and cranium', NormalRange: 'No acute intracranial hemorrhage or mass effect', Unit: 'Study', Cost: 350.00, Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { TestID: 'LAB-010', TestName: 'Chest/Abdomen CT Scan', TestCode: 'CT-CHEST-ABD', Category: 'Imaging', Description: 'High-resolution CT scanning of thorax and abdomen', NormalRange: 'Unremarkable mediastinum and abdominal viscera', Unit: 'Study', Cost: 480.00, Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { TestID: 'LAB-011', TestName: '2D Echocardiography (Echo)', TestCode: 'ECHO-2D', Category: 'Cardiology', Description: 'Transthoracic ultrasound evaluation of heart valves and ejection fraction', NormalRange: 'LVEF 55-65%, intact valve motion', Unit: 'Study', Cost: 220.00, Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { TestID: 'LAB-012', TestName: 'Abdominal Ultrasound', TestCode: 'US-ABD', Category: 'Imaging', Description: 'Sonographic imaging of gallbladder, liver, kidneys, and pancreas', NormalRange: 'Normal abdominal sonographic anatomy', Unit: 'Study', Cost: 110.00, Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { TestID: 'LAB-013', TestName: 'Knee X-Ray (2 Views)', TestCode: 'XR-KNEE', Category: 'Imaging', Description: 'AP and Lateral radiograph of knee joint', NormalRange: 'No acute fracture or dislocation', Unit: 'Study', Cost: 80.00, Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' }
    ];

    const medications = [
      { MedicationID: 'MED-001', MedicationName: 'Lisinopril 10mg', GenericName: 'Lisinopril', Category: 'Antihypertensive', DosageForm: 'Tablet', Strength: '10mg', Unit: 'box', StockQuantity: 420, ReorderLevel: 100, UnitPrice: 12.50, Status: 'In Stock', CreatedAt: '2026-01-01T08:00:00Z' },
      { MedicationID: 'MED-002', MedicationName: 'Atorvastatin 20mg', GenericName: 'Atorvastatin Calcium', Category: 'Lipid-lowering', DosageForm: 'Tablet', Strength: '20mg', Unit: 'box', StockQuantity: 310, ReorderLevel: 80, UnitPrice: 18.00, Status: 'In Stock', CreatedAt: '2026-01-01T08:00:00Z' },
      { MedicationID: 'MED-003', MedicationName: 'Metformin 500mg', GenericName: 'Metformin Hydrochloride', Category: 'Antidiabetic', DosageForm: 'Tablet', Strength: '500mg', Unit: 'box', StockQuantity: 550, ReorderLevel: 120, UnitPrice: 9.00, Status: 'In Stock', CreatedAt: '2026-01-01T08:00:00Z' },
      { MedicationID: 'MED-004', MedicationName: 'Albuterol Inhaler 90mcg', GenericName: 'Albuterol Sulfate', Category: 'Bronchodilator', DosageForm: 'Inhaler', Strength: '90mcg', Unit: 'inhaler', StockQuantity: 45, ReorderLevel: 50, UnitPrice: 32.00, Status: 'Low Stock', CreatedAt: '2026-01-01T08:00:00Z' },
      { MedicationID: 'MED-005', MedicationName: 'Levothyroxine 50mcg', GenericName: 'Levothyroxine Sodium', Category: 'Thyroid Hormone', DosageForm: 'Tablet', Strength: '50mcg', Unit: 'box', StockQuantity: 280, ReorderLevel: 70, UnitPrice: 14.00, Status: 'In Stock', CreatedAt: '2026-01-01T08:00:00Z' },
      { MedicationID: 'MED-006', MedicationName: 'Amoxicillin/Clavulanate 875mg', GenericName: 'Amoxicillin-Clavulanic Acid', Category: 'Antibiotics', DosageForm: 'Tablet', Strength: '875/125mg', Unit: 'box', StockQuantity: 190, ReorderLevel: 60, UnitPrice: 22.00, Status: 'In Stock', CreatedAt: '2026-01-01T08:00:00Z' },
      { MedicationID: 'MED-007', MedicationName: 'Meloxicam 15mg', GenericName: 'Meloxicam', Category: 'NSAID / Anti-inflammatory', DosageForm: 'Tablet', Strength: '15mg', Unit: 'box', StockQuantity: 210, ReorderLevel: 50, UnitPrice: 15.00, Status: 'In Stock', CreatedAt: '2026-01-01T08:00:00Z' },
      { MedicationID: 'MED-008', MedicationName: 'Amlodipine 5mg', GenericName: 'Amlodipine Besylate', Category: 'Calcium Channel Blocker', DosageForm: 'Tablet', Strength: '5mg', Unit: 'box', StockQuantity: 380, ReorderLevel: 90, UnitPrice: 11.00, Status: 'In Stock', CreatedAt: '2026-01-01T08:00:00Z' },
      { MedicationID: 'MED-009', MedicationName: 'Omeprazole 20mg', GenericName: 'Omeprazole Delayed-Release', Category: 'Proton Pump Inhibitor', DosageForm: 'Capsule', Strength: '20mg', Unit: 'box', StockQuantity: 400, ReorderLevel: 100, UnitPrice: 13.50, Status: 'In Stock', CreatedAt: '2026-01-01T08:00:00Z' },
      { MedicationID: 'MED-010', MedicationName: 'Hydrochlorothiazide 25mg', GenericName: 'HCTZ', Category: 'Diuretic', DosageForm: 'Tablet', Strength: '25mg', Unit: 'box', StockQuantity: 18, ReorderLevel: 50, UnitPrice: 8.50, Status: 'Low Stock', CreatedAt: '2026-01-01T08:00:00Z' }
    ];

    const appointments = [];
    const apptStatuses = ['Completed', 'Checked In', 'Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Completed'];
    const apptTypes = ['General', 'Follow-up', 'Specialist', 'Checkup'];
    const timeSlots = [
      { s: '08:30', e: '09:00' }, { s: '09:15', e: '09:45' }, { s: '10:00', e: '10:30' },
      { s: '11:00', e: '11:30' }, { s: '13:30', e: '14:00' }, { s: '14:30', e: '15:00' }
    ];

    for (let i = 1; i <= 32; i++) {
      const pat = patients[(i - 1) % patients.length];
      const doc = doctors[(i - 1) % doctors.length];
      const dateOffset = Math.floor((i - 1) / 4) - 4;
      const date = new Date(2026, 2, 20 + dateOffset);
      const dateStr = date.toISOString().split('T')[0];
      const slot = timeSlots[(i - 1) % timeSlots.length];

      appointments.push({
        AppointmentID: 'APT-' + String(i).padStart(3, '0'),
        AppointmentNumber: 'APT-2026-' + String(i).padStart(4, '0'),
        PatientID: pat.PatientID,
        DoctorID: doc.DoctorID,
        DepartmentID: doc.DepartmentID,
        AppointmentDate: dateStr,
        StartTime: slot.s,
        EndTime: slot.e,
        AppointmentType: apptTypes[(i - 1) % apptTypes.length],
        ReasonForVisit: 'Consultation for ' + (pat.MedicalConditions || 'routine review'),
        Status: apptStatuses[(i - 1) % apptStatuses.length],
        Notes: 'Patient advised to arrive 15 minutes prior for vitals assessment.',
        CreatedAt: '2026-02-15T08:00:00Z',
        UpdatedAt: '2026-02-15T08:00:00Z'
      });
    }

    const visits = [];
    const vitals = [];
    for (let i = 1; i <= 22; i++) {
      const apt = appointments[i - 1];
      const pat = patients.find(p => p.PatientID === apt.PatientID) || patients[0];
      const visitId = 'VIS-' + String(i).padStart(3, '0');
      const vDate = apt.AppointmentDate;
      const vStatus = i <= 18 ? 'Completed' : (i === 19 ? 'In Consultation' : 'Arrived');

      visits.push({
        VisitID: visitId,
        PatientID: pat.PatientID,
        AppointmentID: apt.AppointmentID,
        DoctorID: apt.DoctorID,
        VisitDate: vDate,
        ChiefComplaint: pat.MedicalConditions ? 'Follow-up regarding ' + pat.MedicalConditions : 'Regular checkup evaluation',
        ClinicalNotes: 'Patient examined in clinic. Alert and oriented. Cardiovascular exam regular rate, chest clear to auscultation. Treatment regimen evaluated.',
        DiagnosisSummary: pat.MedicalConditions || 'Essential Wellness Exam',
        TreatmentPlan: 'Continue prescribed medications, lifestyle modifications, and follow-up in designated period.',
        FollowUpDate: '2026-04-' + String(10 + (i % 15)).padStart(2, '0'),
        VisitStatus: vStatus,
        OpdStage: i <= 16 ? 'Completed' : (i === 17 ? 'Discharge' : (i === 18 ? 'Prescription' : (i === 19 ? 'Investigation' : (i === 20 ? 'Consultation' : 'Triage')))),
        NeedsInvestigation: (i % 2 === 1) ? 'Yes' : 'No',
        DischargeDisposition: i <= 18 ? 'Discharged Home' : '',
        DischargeNotes: i <= 18 ? 'Patient stable, discharged with follow-up instructions.' : '',
        CreatedAt: vDate + 'T09:00:00Z',
        UpdatedAt: vDate + 'T10:00:00Z'
      });

      const sys = 118 + (i % 22);
      const dia = 74 + (i % 14);
      const hr = 68 + (i % 18);
      const temp = (36.4 + (i % 6) * 0.1).toFixed(1);
      const spo2 = 97 + (i % 3);
      const wt = 62 + (i % 25);
      const ht = 168 + (i % 12);
      const bmi = (wt / ((ht / 100) * (ht / 100))).toFixed(1);

      vitals.push({
        VitalSignID: 'VIT-' + String(i).padStart(3, '0'),
        VisitID: visitId,
        PatientID: pat.PatientID,
        Temperature: temp,
        BloodPressure: sys + '/' + dia,
        HeartRate: hr,
        RespiratoryRate: 16 + (i % 4),
        OxygenSaturation: spo2,
        Weight: wt,
        Height: ht,
        BMI: bmi,
        RecordedBy: 'Joyce Chen, RN',
        RecordedAt: vDate + 'T09:10:00Z',
        Notes: 'Vitals stable on arrival.'
      });
    }

    const diagnosisCatalog = [
      { code: 'I10', name: 'Essential (primary) hypertension', sev: 'Moderate' },
      { code: 'E11.9', name: 'Type 2 diabetes mellitus without complications', sev: 'Moderate' },
      { code: 'J45.909', name: 'Unspecified asthma, uncomplicated', sev: 'Mild' },
      { code: 'M17.11', name: 'Primary osteoarthritis, right knee', sev: 'Moderate' },
      { code: 'E03.9', name: 'Hypothyroidism, unspecified', sev: 'Mild' },
      { code: 'E78.5', name: 'Hyperlipidemia, unspecified', sev: 'Mild' },
      { code: 'K21.9', name: 'Gastro-esophageal reflux disease without esophagitis', sev: 'Mild' },
      { code: 'I48.91', name: 'Unspecified atrial fibrillation', sev: 'Severe' },
      { code: 'S83.241A', name: 'Tear of meniscus, current injury, right knee', sev: 'Severe' },
      { code: 'D50.9', name: 'Iron deficiency anemia, unspecified', sev: 'Mild' }
    ];

    const diagnoses = [];
    for (let i = 1; i <= 18; i++) {
      const vis = visits[i - 1];
      const item = diagnosisCatalog[(i - 1) % diagnosisCatalog.length];
      diagnoses.push({
        DiagnosisID: 'DX-' + String(i).padStart(3, '0'),
        PatientID: vis.PatientID,
        VisitID: vis.VisitID,
        DoctorID: vis.DoctorID,
        Diagnosis: item.name,
        DiagnosisCode: item.code,
        DiagnosisDate: vis.VisitDate,
        Severity: item.sev,
        Notes: 'Diagnostic criteria verified by clinical presentation and laboratory confirmation.',
        CreatedAt: vis.VisitDate + 'T09:30:00Z'
      });
    }

    const prescriptions = [];
    const prescriptionItems = [];
    for (let i = 1; i <= 22; i++) {
      const vis = visits[(i - 1) % visits.length];
      const rxId = 'RX-' + String(i).padStart(3, '0');
      const med = medications[(i - 1) % medications.length];
      const rxStatus = i <= 15 ? 'Dispensed' : (i <= 20 ? 'Active' : 'Draft');

      prescriptions.push({
        PrescriptionID: rxId,
        PrescriptionNumber: 'PRX-2026-' + String(i).padStart(4, '0'),
        PatientID: vis.PatientID,
        DoctorID: vis.DoctorID,
        VisitID: vis.VisitID,
        PrescriptionDate: vis.VisitDate,
        Status: rxStatus,
        Instructions: 'Take with water after meals. Report any allergic reaction immediately.',
        DispensedBy: rxStatus === 'Dispensed' ? 'Todd Bradley, PharmD' : '',
        DispensedAt: rxStatus === 'Dispensed' ? vis.VisitDate + 'T11:30:00Z' : '',
        CreatedAt: vis.VisitDate + 'T09:45:00Z',
        UpdatedAt: vis.VisitDate + 'T10:00:00Z'
      });

      prescriptionItems.push({
        PrescriptionItemID: 'RXI-' + String(i).padStart(3, '0'),
        PrescriptionID: rxId,
        MedicationID: med.MedicationID,
        MedicationName: med.MedicationName,
        Dosage: med.Strength,
        Frequency: (i % 2 === 0) ? 'Once daily in the morning' : 'Twice daily with meals',
        Duration: '30 days',
        Quantity: 30,
        Route: 'Oral',
        Instructions: 'Compliance advised. Do not discontinue abruptly without medical advice.',
        Status: rxStatus === 'Dispensed' ? 'Dispensed' : 'Pending',
        CreatedAt: vis.VisitDate + 'T09:45:00Z'
      });
    }

    const laboratoryResults = [];
    const labStatuses = ['Completed', 'Completed', 'Completed', 'Processing', 'Sample Collected', 'Requested'];
    for (let i = 1; i <= 22; i++) {
      const vis = visits[(i - 1) % visits.length];
      const test = laboratoryTests[(i - 1) % laboratoryTests.length];
      const status = labStatuses[(i - 1) % labStatuses.length];
      let resVal = 'Normal values detected';
      let interp = 'Normal';

      if (test.TestCode === 'HBA1C') {
        resVal = (6.1 + (i % 4) * 0.4).toFixed(1) + '%';
        interp = parseFloat(resVal) > 6.5 ? 'Abnormal' : 'Normal';
      } else if (test.TestCode === 'LIPID') {
        resVal = 'Total Chol: ' + (185 + (i % 30)) + ' mg/dL, LDL: ' + (110 + (i % 25)) + ' mg/dL';
        interp = 'Abnormal';
      } else if (test.TestCode === 'CBC') {
        resVal = 'WBC: 6.8 x10^3/uL, Hgb: 14.2 g/dL, Plt: 240 x10^3/uL';
        interp = 'Normal';
      }

      laboratoryResults.push({
        ResultID: 'RES-' + String(i).padStart(3, '0'),
        PatientID: vis.PatientID,
        VisitID: vis.VisitID,
        DoctorID: vis.DoctorID,
        TestID: test.TestID,
        TestName: test.TestName,
        TestDate: vis.VisitDate,
        Result: status === 'Completed' ? resVal : 'Pending Analysis',
        ReferenceRange: test.NormalRange,
        Interpretation: status === 'Completed' ? interp : '',
        Status: status,
        Notes: 'Automated analyzer verified on Roche Cobas / Sysmex.',
        TechnicianName: status === 'Completed' ? 'James Peterson, MT' : '',
        CreatedAt: vis.VisitDate + 'T09:50:00Z',
        UpdatedAt: vis.VisitDate + 'T14:20:00Z'
      });
    }

    // Dedicated Inpatient (IPD) Diagnostic Orders
    const ipdDiagnosticOrders = [
      {
        ResultID: 'RES-IPD-001',
        PatientID: 'PAT-002',
        VisitID: 'ADM-001',
        DoctorID: 'DOC-002',
        TestID: 'LAB-006',
        TestName: 'Cardiac Troponin I',
        TestDate: '2026-03-18',
        Result: '0.85 ng/mL (Elevated - Acute Myocardial Injury)',
        ReferenceRange: '< 0.04 ng/mL',
        Interpretation: 'Abnormal',
        Status: 'Completed',
        Notes: '[IPD Order - ADM-001] Priority: STAT (Urgent Bedside) | Bed: ICU-101. Indication: Rule out NSTEMI',
        TechnicianName: 'Inpatient Core Diagnostics',
        CreatedAt: '2026-03-18T10:30:00Z',
        UpdatedAt: '2026-03-18T11:15:00Z'
      },
      {
        ResultID: 'RES-IPD-002',
        PatientID: 'PAT-002',
        VisitID: 'ADM-001',
        DoctorID: 'DOC-002',
        TestID: 'LAB-011',
        TestName: '2D Echocardiography (Echo)',
        TestDate: '2026-03-19',
        Result: 'Pending Analysis',
        ReferenceRange: 'LVEF 55-65%, intact valve motion',
        Interpretation: 'Normal',
        Status: 'Requested',
        Notes: '[IPD Order - ADM-001] Priority: Urgent | Bed: ICU-101. Indication: Assess wall motion and ejection fraction',
        TechnicianName: 'Cardiovascular Imaging Lab',
        CreatedAt: '2026-03-19T08:00:00Z',
        UpdatedAt: '2026-03-19T08:00:00Z'
      },
      {
        ResultID: 'RES-IPD-003',
        PatientID: 'PAT-001',
        VisitID: 'ADM-002',
        DoctorID: 'DOC-001',
        TestID: 'LAB-001',
        TestName: 'Complete Blood Count (CBC)',
        TestDate: '2026-03-19',
        Result: 'WBC: 8.2 x10^3/uL, Hgb: 13.8 g/dL, Plt: 260 x10^3/uL',
        ReferenceRange: 'WBC: 4.5-11.0 x10^3/uL',
        Interpretation: 'Normal',
        Status: 'Completed',
        Notes: '[IPD Order - ADM-002] Priority: Routine | Bed: MED-201. Indication: Monitor for infection / eosinophilia',
        TechnicianName: 'Inpatient Core Diagnostics',
        CreatedAt: '2026-03-19T15:00:00Z',
        UpdatedAt: '2026-03-19T16:00:00Z'
      },
      {
        ResultID: 'RES-IPD-004',
        PatientID: 'PAT-001',
        VisitID: 'ADM-002',
        DoctorID: 'DOC-001',
        TestID: 'LAB-002',
        TestName: 'Comprehensive Metabolic Panel (CMP)',
        TestDate: '2026-03-20',
        Result: 'Pending Analysis',
        ReferenceRange: 'Glucose: 70-99 mg/dL, Creatinine: 0.7-1.3 mg/dL',
        Interpretation: 'Normal',
        Status: 'Requested',
        Notes: '[IPD Order - ADM-002] Priority: Routine | Bed: MED-201. Indication: Baseline electrolytes and kidney function',
        TechnicianName: 'Inpatient Core Diagnostics',
        CreatedAt: '2026-03-20T08:00:00Z',
        UpdatedAt: '2026-03-20T08:00:00Z'
      }
    ];
    ipdDiagnosticOrders.forEach(ord => laboratoryResults.push(ord));

    const invoices = [];
    const payments = [];
    const payMethods = ['Credit Card', 'Cash', 'Bank Transfer', 'Credit Card'];

    for (let i = 1; i <= 18; i++) {
      const vis = visits[i - 1];
      const total = 90.00 + (i * 15.00);
      const discount = (i % 3 === 0) ? 10.00 : 0.00;
      const tax = parseFloat(((total - discount) * 0.05).toFixed(2));
      const netTotal = parseFloat((total - discount + tax).toFixed(2));
      
      let paid = 0;
      let payStatus = 'Unpaid';
      if (i <= 12) {
        paid = netTotal;
        payStatus = 'Paid';
      } else if (i <= 16) {
        paid = parseFloat((netTotal * 0.5).toFixed(2));
        payStatus = 'Partially Paid';
      }
      const balance = parseFloat((netTotal - paid).toFixed(2));

      const invId = 'INV-' + String(i).padStart(3, '0');
      invoices.push({
        InvoiceID: invId,
        InvoiceNumber: 'INV-2026-' + String(i).padStart(4, '0'),
        PatientID: vis.PatientID,
        VisitID: vis.VisitID,
        InvoiceDate: vis.VisitDate,
        TotalAmount: netTotal,
        Discount: discount,
        Tax: tax,
        AmountPaid: paid,
        Balance: balance,
        PaymentStatus: payStatus,
        Notes: 'Includes consultation fee, diagnostic tests, and pharmaceuticals.',
        CreatedAt: vis.VisitDate + 'T10:30:00Z',
        UpdatedAt: vis.VisitDate + 'T11:00:00Z'
      });

      if (paid > 0) {
        payments.push({
          PaymentID: 'PAY-' + String(i).padStart(3, '0'),
          InvoiceID: invId,
          PatientID: vis.PatientID,
          PaymentDate: vis.VisitDate,
          Amount: paid,
          PaymentMethod: payMethods[(i - 1) % payMethods.length],
          ReferenceNumber: 'TXN-9948-' + String(i).padStart(3, '0'),
          Notes: 'Payment receipt generated by cashier.',
          ReceivedBy: 'Rachel Green, CPA',
          CreatedAt: vis.VisitDate + 'T11:00:00Z'
        });
      }
    }

    const followUps = [];
    const followUpReasons = [
      'Post-medication blood pressure titration review',
      'HbA1c monitoring and dietary lifestyle consultation',
      'Follow-up knee rehabilitation and range of motion check',
      'Asthma control test and inhaler technique review',
      'Thyroid hormone panel follow-up',
      'Routine cardiovascular progress assessment'
    ];

    for (let i = 1; i <= 12; i++) {
      const vis = visits[i - 1];
      const status = i <= 4 ? 'Completed' : (i <= 10 ? 'Pending' : 'Cancelled');
      followUps.push({
        FollowUpID: 'FLW-' + String(i).padStart(3, '0'),
        PatientID: vis.PatientID,
        DoctorID: vis.DoctorID,
        RelatedVisitID: vis.VisitID,
        FollowUpDate: '2026-04-' + String(5 + (i * 2)).padStart(2, '0'),
        Reason: followUpReasons[(i - 1) % followUpReasons.length],
        Status: status,
        Notes: 'Patient notified via SMS and portal confirmation.',
        CreatedAt: vis.VisitDate + 'T10:15:00Z',
        UpdatedAt: vis.VisitDate + 'T10:15:00Z'
      });
    }

    const users = [
      { UserID: 'USR-001', Username: 'admin', FullName: 'Alex Mercer', Email: 'admin@metrohealth.demo', Role: 'Administrator', DoctorID: '', DepartmentID: 'DEP-001', Status: 'Active', LastLogin: '2026-03-21 08:30', CreatedAt: '2026-01-01T08:00:00Z' },
      { UserID: 'USR-002', Username: 'reception', FullName: 'Lisa Hernandez', Email: 'reception@metrohealth.demo', Role: 'Receptionist', DoctorID: '', DepartmentID: 'DEP-001', Status: 'Active', LastLogin: '2026-03-21 07:55', CreatedAt: '2026-01-01T08:00:00Z' },
      { UserID: 'USR-003', Username: 'dr.jenkins', FullName: 'Dr. Sarah Jenkins, MD', Email: 'sjenkins@metrohealth.demo', Role: 'Doctor', DoctorID: 'DOC-001', DepartmentID: 'DEP-001', Status: 'Active', LastLogin: '2026-03-21 08:15', CreatedAt: '2026-01-01T08:00:00Z' },
      { UserID: 'USR-004', Username: 'dr.vance', FullName: 'Dr. Marcus Vance, MD', Email: 'mvance@metrohealth.demo', Role: 'Doctor', DoctorID: 'DOC-002', DepartmentID: 'DEP-002', Status: 'Active', LastLogin: '2026-03-20 16:40', CreatedAt: '2026-01-01T08:00:00Z' },
      { UserID: 'USR-005', Username: 'dr.rostova', FullName: 'Dr. Elena Rostova, MD', Email: 'erostova@metrohealth.demo', Role: 'Doctor', DoctorID: 'DOC-003', DepartmentID: 'DEP-003', Status: 'Active', LastLogin: '2026-03-20 14:10', CreatedAt: '2026-01-01T08:00:00Z' },
      { UserID: 'USR-006', Username: 'nurse.joyce', FullName: 'Joyce Chen, RN', Email: 'jchen@metrohealth.demo', Role: 'Nurse', DoctorID: '', DepartmentID: 'DEP-001', Status: 'Active', LastLogin: '2026-03-21 07:30', CreatedAt: '2026-01-01T08:00:00Z' },
      { UserID: 'USR-007', Username: 'pharma.todd', FullName: 'Todd Bradley, PharmD', Email: 'tbradley@metrohealth.demo', Role: 'Pharmacist', DoctorID: '', DepartmentID: 'DEP-001', Status: 'Active', LastLogin: '2026-03-21 08:05', CreatedAt: '2026-01-01T08:00:00Z' },
      { UserID: 'USR-008', Username: 'acct.rachel', FullName: 'Rachel Green, CPA', Email: 'rgreen@metrohealth.demo', Role: 'Accountant', DoctorID: '', DepartmentID: 'DEP-001', Status: 'Active', LastLogin: '2026-03-20 17:20', CreatedAt: '2026-01-01T08:00:00Z' },
      { UserID: 'USR-009', Username: 'lab.tech', FullName: 'James Peterson, MT', Email: 'jpeterson@metrohealth.demo', Role: 'Nurse', DoctorID: '', DepartmentID: 'DEP-001', Status: 'Active', LastLogin: '2026-03-21 08:00', CreatedAt: '2026-01-01T08:00:00Z' }
    ];

    const securityRoles = [
      { RoleID: 'ROL-001', RoleName: 'Administrator', Description: 'Full administrative control over all healthcare modules, security, user administration, and system configurations.', Scope: 'Organization', UserCount: 1, AllowedViews: ['dashboard', 'patients', 'appointments', 'visits', 'medical_history', 'diagnoses', 'prescriptions', 'medications', 'laboratory_tests', 'laboratory_results', 'billing', 'payments', 'doctors', 'departments', 'followups', 'reports', 'users', 'security_roles', 'administration'] },
      { RoleID: 'ROL-002', RoleName: 'Receptionist', Description: 'Patient front desk registration, appointment queue management, check-in, and billing receipt viewing.', Scope: 'Business Unit', UserCount: 1, AllowedViews: ['dashboard', 'patients', 'appointments', 'visits', 'billing', 'payments'] },
      { RoleID: 'ROL-003', RoleName: 'Doctor', Description: 'Physician consultation encounters, patient medical history, diagnosis coding, prescribing, and diagnostic test orders.', Scope: 'User / Clinic', UserCount: 3, AllowedViews: ['dashboard', 'patients', 'appointments', 'visits', 'medical_history', 'diagnoses', 'prescriptions', 'laboratory_results', 'followups'] },
      { RoleID: 'ROL-004', RoleName: 'Nurse', Description: 'Clinical triage, vital signs capture, appointment queue management, and diagnostic sample review.', Scope: 'Business Unit', UserCount: 2, AllowedViews: ['dashboard', 'patients', 'appointments', 'visits', 'laboratory_results', 'followups'] },
      { RoleID: 'ROL-005', RoleName: 'Pharmacist', Description: 'Formulary dispensing, electronic prescription fulfillment, and medication inventory stock control.', Scope: 'Business Unit', UserCount: 1, AllowedViews: ['dashboard', 'prescriptions', 'medications'] },
      { RoleID: 'ROL-006', RoleName: 'Accountant', Description: 'Patient invoicing, payment processing, cashier receipts, and revenue realization financial reports.', Scope: 'Organization', UserCount: 1, AllowedViews: ['dashboard', 'billing', 'payments', 'reports'] }
    ];

    return {
      Departments: departments,
      Doctors: doctors,
      Users: users,
      SecurityRoles: securityRoles,
      Patients: patients,
      LaboratoryTests: laboratoryTests,
      Medications: medications,
      Appointments: appointments,
      Visits: visits,
      VitalSigns: vitals,
      Diagnoses: diagnoses,
      Prescriptions: prescriptions,
      PrescriptionItems: prescriptionItems,
      LaboratoryResults: laboratoryResults,
      Invoices: invoices,
      Payments: payments,
      FollowUps: followUps,
      Beds: [
        { BedID: 'BED-001', BedNumber: 'ICU-01', WardName: 'Intensive Care Unit (ICU)', DepartmentID: 'DEP-002', BedType: 'ICU', DailyRate: 250.00, Status: 'Occupied', CurrentAdmissionID: 'ADM-001', CreatedAt: '2026-01-01T08:00:00Z' },
        { BedID: 'BED-002', BedNumber: 'ICU-02', WardName: 'Intensive Care Unit (ICU)', DepartmentID: 'DEP-002', BedType: 'ICU', DailyRate: 250.00, Status: 'Available', CurrentAdmissionID: '', CreatedAt: '2026-01-01T08:00:00Z' },
        { BedID: 'BED-003', BedNumber: 'ICU-03', WardName: 'Intensive Care Unit (ICU)', DepartmentID: 'DEP-002', BedType: 'ICU', DailyRate: 250.00, Status: 'Cleaning', CurrentAdmissionID: '', CreatedAt: '2026-01-01T08:00:00Z' },
        { BedID: 'BED-004', BedNumber: 'GW-A-101', WardName: 'General Medical Ward A', DepartmentID: 'DEP-001', BedType: 'Standard General', DailyRate: 60.00, Status: 'Occupied', CurrentAdmissionID: 'ADM-002', CreatedAt: '2026-01-01T08:00:00Z' },
        { BedID: 'BED-005', BedNumber: 'GW-A-102', WardName: 'General Medical Ward A', DepartmentID: 'DEP-001', BedType: 'Standard General', DailyRate: 60.00, Status: 'Available', CurrentAdmissionID: '', CreatedAt: '2026-01-01T08:00:00Z' },
        { BedID: 'BED-006', BedNumber: 'GW-A-103', WardName: 'General Medical Ward A', DepartmentID: 'DEP-001', BedType: 'Standard General', DailyRate: 60.00, Status: 'Available', CurrentAdmissionID: '', CreatedAt: '2026-01-01T08:00:00Z' },
        { BedID: 'BED-007', BedNumber: 'GW-A-104', WardName: 'General Medical Ward A', DepartmentID: 'DEP-001', BedType: 'Standard General', DailyRate: 60.00, Status: 'Maintenance', CurrentAdmissionID: '', CreatedAt: '2026-01-01T08:00:00Z' },
        { BedID: 'BED-008', BedNumber: 'SW-B-201', WardName: 'Surgical Ward B', DepartmentID: 'DEP-004', BedType: 'Standard General', DailyRate: 85.00, Status: 'Occupied', CurrentAdmissionID: 'ADM-003', CreatedAt: '2026-01-01T08:00:00Z' },
        { BedID: 'BED-009', BedNumber: 'SW-B-202', WardName: 'Surgical Ward B', DepartmentID: 'DEP-004', BedType: 'Standard General', DailyRate: 85.00, Status: 'Available', CurrentAdmissionID: '', CreatedAt: '2026-01-01T08:00:00Z' },
        { BedID: 'BED-010', BedNumber: 'SW-B-203', WardName: 'Surgical Ward B', DepartmentID: 'DEP-004', BedType: 'Standard General', DailyRate: 85.00, Status: 'Available', CurrentAdmissionID: '', CreatedAt: '2026-01-01T08:00:00Z' },
        { BedID: 'BED-011', BedNumber: 'PVT-301', WardName: 'Private Deluxe Ward', DepartmentID: 'DEP-001', BedType: 'Private Single', DailyRate: 180.00, Status: 'Occupied', CurrentAdmissionID: 'ADM-004', CreatedAt: '2026-01-01T08:00:00Z' },
        { BedID: 'BED-012', BedNumber: 'PVT-302', WardName: 'Private Deluxe Ward', DepartmentID: 'DEP-005', BedType: 'Private Single', DailyRate: 180.00, Status: 'Available', CurrentAdmissionID: '', CreatedAt: '2026-01-01T08:00:00Z' },
        { BedID: 'BED-013', BedNumber: 'PED-401', WardName: 'Pediatric Ward', DepartmentID: 'DEP-003', BedType: 'Semi-Private', DailyRate: 70.00, Status: 'Occupied', CurrentAdmissionID: 'ADM-005', CreatedAt: '2026-01-01T08:00:00Z' },
        { BedID: 'BED-014', BedNumber: 'PED-402', WardName: 'Pediatric Ward', DepartmentID: 'DEP-003', BedType: 'Semi-Private', DailyRate: 70.00, Status: 'Available', CurrentAdmissionID: '', CreatedAt: '2026-01-01T08:00:00Z' }
      ],
      Admissions: [
        {
          AdmissionID: 'ADM-001',
          AdmissionNumber: 'IPD-2026-0001',
          PatientID: 'PAT-002',
          DoctorID: 'DOC-002',
          DepartmentID: 'DEP-002',
          BedID: 'BED-001',
          AdmissionDate: '2026-03-18',
          AdmissionType: 'Emergency',
          SourceEncounterID: 'VIS-002',
          AdmittingDiagnosis: 'Acute Coronary Syndrome, Unstable Angina',
          CurrentCondition: 'Serious',
          IpdStage: 'Orders',
          ExpectedDischargeDate: '2026-03-24',
          ActualDischargeDate: '',
          DischargeDisposition: '',
          DischargeSummary: '',
          TotalDays: 4,
          Status: 'Admitted',
          CreatedAt: '2026-03-18T10:00:00Z'
        },
        {
          AdmissionID: 'ADM-002',
          AdmissionNumber: 'IPD-2026-0002',
          PatientID: 'PAT-001',
          DoctorID: 'DOC-001',
          DepartmentID: 'DEP-001',
          BedID: 'BED-004',
          AdmissionDate: '2026-03-19',
          AdmissionType: 'OPD Transfer',
          SourceEncounterID: 'VIS-001',
          AdmittingDiagnosis: 'Hypertensive Urgency with Acute Asthma Exacerbation',
          CurrentCondition: 'Stable',
          IpdStage: 'DailyRounds',
          ExpectedDischargeDate: '2026-03-23',
          ActualDischargeDate: '',
          DischargeDisposition: '',
          DischargeSummary: '',
          TotalDays: 3,
          Status: 'Admitted',
          CreatedAt: '2026-03-19T14:30:00Z'
        },
        {
          AdmissionID: 'ADM-003',
          AdmissionNumber: 'IPD-2026-0003',
          PatientID: 'PAT-004',
          DoctorID: 'DOC-004',
          DepartmentID: 'DEP-004',
          BedID: 'BED-008',
          AdmissionDate: '2026-03-20',
          AdmissionType: 'Elective',
          SourceEncounterID: 'VIS-004',
          AdmittingDiagnosis: 'Arthroscopic Right Meniscal Repair Post-Op',
          CurrentCondition: 'Guarded',
          IpdStage: 'MAR',
          ExpectedDischargeDate: '2026-03-22',
          ActualDischargeDate: '',
          DischargeDisposition: '',
          DischargeSummary: '',
          TotalDays: 2,
          Status: 'Admitted',
          CreatedAt: '2026-03-20T08:15:00Z'
        },
        {
          AdmissionID: 'ADM-004',
          AdmissionNumber: 'IPD-2026-0004',
          PatientID: 'PAT-005',
          DoctorID: 'DOC-005',
          DepartmentID: 'DEP-005',
          BedID: 'BED-011',
          AdmissionDate: '2026-03-20',
          AdmissionType: 'OPD Transfer',
          SourceEncounterID: 'VIS-005',
          AdmittingDiagnosis: 'Severe Diabetic Ketoacidosis with Electrolyte Imbalance',
          CurrentCondition: 'Guarded',
          IpdStage: 'DailyRounds',
          ExpectedDischargeDate: '2026-03-25',
          ActualDischargeDate: '',
          DischargeDisposition: '',
          DischargeSummary: '',
          TotalDays: 2,
          Status: 'Admitted',
          CreatedAt: '2026-03-20T11:00:00Z'
        },
        {
          AdmissionID: 'ADM-005',
          AdmissionNumber: 'IPD-2026-0005',
          PatientID: 'PAT-003',
          DoctorID: 'DOC-003',
          DepartmentID: 'DEP-003',
          BedID: 'BED-013',
          AdmissionDate: '2026-03-21',
          AdmissionType: 'Emergency',
          SourceEncounterID: 'VIS-003',
          AdmittingDiagnosis: 'Pediatric Status Asthmaticus',
          CurrentCondition: 'Stable',
          IpdStage: 'DailyRounds',
          ExpectedDischargeDate: '2026-03-23',
          ActualDischargeDate: '',
          DischargeDisposition: '',
          DischargeSummary: '',
          TotalDays: 1,
          Status: 'Admitted',
          CreatedAt: '2026-03-21T09:00:00Z'
        },
        {
          AdmissionID: 'ADM-006',
          AdmissionNumber: 'IPD-2026-0006',
          PatientID: 'PAT-009',
          DoctorID: 'DOC-004',
          DepartmentID: 'DEP-004',
          BedID: 'BED-008',
          AdmissionDate: '2026-02-10',
          AdmissionType: 'Elective',
          SourceEncounterID: 'VIS-009',
          AdmittingDiagnosis: 'Total Hip Arthroplasty (Left)',
          CurrentCondition: 'Stable',
          IpdStage: 'Completed',
          ExpectedDischargeDate: '2026-02-14',
          ActualDischargeDate: '2026-02-14',
          DischargeDisposition: 'Discharged Home',
          DischargeSummary: 'Patient tolerated hip replacement surgery well. Mobilizing with walker.',
          TotalDays: 4,
          Status: 'Discharged',
          CreatedAt: '2026-02-10T09:00:00Z'
        },
        {
          AdmissionID: 'ADM-007',
          AdmissionNumber: 'IPD-2026-0007',
          PatientID: 'PAT-012',
          DoctorID: 'DOC-002',
          DepartmentID: 'DEP-002',
          BedID: 'BED-001',
          AdmissionDate: '2026-02-15',
          AdmissionType: 'Emergency',
          SourceEncounterID: 'VIS-012',
          AdmittingDiagnosis: 'Atrial Fibrillation with Rapid Ventricular Response',
          CurrentCondition: 'Stable',
          IpdStage: 'Completed',
          ExpectedDischargeDate: '2026-02-18',
          ActualDischargeDate: '2026-02-18',
          DischargeDisposition: 'Discharged Home',
          DischargeSummary: 'Sinus rhythm restored with medical cardioversion. Maintained on oral anticoagulation.',
          TotalDays: 3,
          Status: 'Discharged',
          CreatedAt: '2026-02-15T15:00:00Z'
        }
      ],
      DailyRounds: [
        {
          RoundID: 'RND-001',
          AdmissionID: 'ADM-001',
          PatientID: 'PAT-002',
          DoctorID: 'DOC-002',
          RoundDate: '2026-03-19',
          RoundType: 'Physician Round',
          Subjective: 'Patient reports mild substernal chest discomfort overnight, resolved with sublingual nitroglycerin.',
          Objective: 'BP: 132/84 mmHg, HR: 74 bpm, SpO2: 98% on 2L NC. Cardiac telemetry shows normal sinus rhythm without ST deviation.',
          Assessment: 'ACS post-stabilization, high-risk CAD. Troponin trend downward.',
          Plan: 'Continue dual antiplatelet therapy, statin, ACE inhibitor. Schedule 2D Echo for afternoon.',
          RecordedBy: 'Dr. Marcus Vance, MD',
          CreatedAt: '2026-03-19T08:30:00Z'
        },
        {
          RoundID: 'RND-002',
          AdmissionID: 'ADM-001',
          PatientID: 'PAT-002',
          DoctorID: 'DOC-002',
          RoundDate: '2026-03-20',
          RoundType: 'Physician Round',
          Subjective: 'No chest pain reported. Sleeping well, appetite returning.',
          Objective: 'BP: 124/78 mmHg, HR: 68 bpm, SpO2: 99% on room air. Echo shows LVEF 55%, mild hypokinesis.',
          Assessment: 'Clinically improving, hemodynamically stable.',
          Plan: 'Wean oxygen, transfer from ICU to step-down ward planned for tomorrow.',
          RecordedBy: 'Dr. Marcus Vance, MD',
          CreatedAt: '2026-03-20T09:00:00Z'
        },
        {
          RoundID: 'RND-003',
          AdmissionID: 'ADM-002',
          PatientID: 'PAT-001',
          DoctorID: 'DOC-001',
          RoundDate: '2026-03-20',
          RoundType: 'Physician Round',
          Subjective: 'Breathing much easier today. No wheezing on exertion.',
          Objective: 'BP: 138/88 mmHg, HR: 76 bpm, Temp: 36.7C, SpO2: 98%. Lungs clear bilaterally.',
          Assessment: 'Hypertensive urgency resolved. Asthma exacerbation in remission.',
          Plan: 'Step down nebulizer to MDI inhaler. Monitor BP morning and evening.',
          RecordedBy: 'Dr. Sarah Jenkins, MD',
          CreatedAt: '2026-03-20T09:30:00Z'
        },
        {
          RoundID: 'RND-004',
          AdmissionID: 'ADM-003',
          PatientID: 'PAT-004',
          DoctorID: 'DOC-004',
          RoundDate: '2026-03-21',
          RoundType: 'Physician Round',
          Subjective: 'Post-op Day 1 right knee arthroscopy. Pain 3/10 on oral analgesics.',
          Objective: 'Knee dressing clean, dry, intact. Distal neurovascular status intact. Quad firing active.',
          Assessment: 'Uncomplicated post-op recovery.',
          Plan: 'Initiate crutch ambulation with PT. Discharge anticipated tomorrow morning.',
          RecordedBy: 'Dr. David Kim, MD',
          CreatedAt: '2026-03-21T08:00:00Z'
        }
      ],
      EmergencyBays: [
        {
          BayID: 'BAY-001',
          BayNumber: 'RESUS-01',
          BayName: 'Trauma Resuscitation Bay 1 (STAT Red)',
          BayType: 'Resuscitation',
          Status: 'Occupied',
          CurrentEncounterID: 'ER-001',
          HourlyRate: 150.00,
          EquipmentList: 'Crash Cart, Defibrillator, Mechanical Ventilator, Suction, Arterial Line Setup',
          CreatedAt: '2026-01-01T08:00:00Z',
          UpdatedAt: '2026-03-21T08:00:00Z'
        },
        {
          BayID: 'BAY-002',
          BayNumber: 'TRAUMA-02',
          BayName: 'Trauma Bay 2 (Shock & Surgical)',
          BayType: 'Trauma',
          Status: 'Occupied',
          CurrentEncounterID: 'ER-002',
          HourlyRate: 150.00,
          EquipmentList: 'Rapid Infuser, C-Spine Immobilization, Bedside Ultrasound, Chest Tube Tray',
          CreatedAt: '2026-01-01T08:00:00Z',
          UpdatedAt: '2026-03-21T08:00:00Z'
        },
        {
          BayID: 'BAY-003',
          BayNumber: 'CARD-03',
          BayName: 'Acute Cardiac Bay 3 (Telemetry Monitor)',
          BayType: 'Acute Care',
          Status: 'Occupied',
          CurrentEncounterID: 'ER-003',
          HourlyRate: 110.00,
          EquipmentList: '12-Lead ECG, Central Cardiac Telemetry, Transcutaneous Pacing, Defibrillator',
          CreatedAt: '2026-01-01T08:00:00Z',
          UpdatedAt: '2026-03-21T08:00:00Z'
        },
        {
          BayID: 'BAY-004',
          BayNumber: 'ACUTE-04',
          BayName: 'Acute Medical Bay 4',
          BayType: 'Acute Care',
          Status: 'Available',
          CurrentEncounterID: '',
          HourlyRate: 90.00,
          EquipmentList: 'Vital Signs Monitor, O2 Delivery, IV Infusion Pump, Nebulizer Setup',
          CreatedAt: '2026-01-01T08:00:00Z',
          UpdatedAt: '2026-03-21T08:00:00Z'
        },
        {
          BayID: 'BAY-005',
          BayNumber: 'FAST-05',
          BayName: 'Rapid Care / Fast Track Bay 5',
          BayType: 'Fast Track',
          Status: 'Occupied',
          CurrentEncounterID: 'ER-004',
          HourlyRate: 60.00,
          EquipmentList: 'Suture Kit, Splinting Cart, Local Anesthesia, Dermabond, Exam Light',
          CreatedAt: '2026-01-01T08:00:00Z',
          UpdatedAt: '2026-03-21T08:00:00Z'
        },
        {
          BayID: 'BAY-006',
          BayNumber: 'PED-06',
          BayName: 'Pediatric Emergency Bay 6',
          BayType: 'Pediatric',
          Status: 'Available',
          CurrentEncounterID: '',
          HourlyRate: 85.00,
          EquipmentList: 'Broselow Pediatric Tape, Pediatric Crash Cart, Warmers, O2 Hood',
          CreatedAt: '2026-01-01T08:00:00Z',
          UpdatedAt: '2026-03-21T08:00:00Z'
        },
        {
          BayID: 'BAY-007',
          BayNumber: 'ISOL-07',
          BayName: 'Negative Pressure Isolation Bay 7',
          BayType: 'Isolation',
          Status: 'Sanitizing',
          CurrentEncounterID: '',
          HourlyRate: 130.00,
          EquipmentList: 'HEPA Negative Pressure Ventilation, PPE Station, Dedicated Monitored Bay',
          CreatedAt: '2026-01-01T08:00:00Z',
          UpdatedAt: '2026-03-21T08:00:00Z'
        },
        {
          BayID: 'BAY-008',
          BayNumber: 'OBS-08',
          BayName: 'Emergency Observation Unit Bay 8',
          BayType: 'Observation',
          Status: 'Available',
          CurrentEncounterID: '',
          HourlyRate: 75.00,
          EquipmentList: 'Semi-Private Recliner Bed, Vitals Monitor, Infusion Stand',
          CreatedAt: '2026-01-01T08:00:00Z',
          UpdatedAt: '2026-03-21T08:00:00Z'
        }
      ],
      EmergencyEncounters: [
        {
          EncounterID: 'ER-001',
          EncounterNumber: 'ED-2026-0001',
          PatientID: 'PAT-002',
          DoctorID: 'DOC-002',
          TriageNurse: 'Joyce Chen, RN',
          ArrivalDate: '2026-03-21',
          ArrivalTime: '08:15 AM',
          ArrivalMode: 'Ambulance (EMS)',
          AcuityLevel: 'ESI-1 Resuscitation',
          ChiefComplaint: 'Acute retrosternal crushing chest pain, diaphoresis, severe shortness of breath',
          BayID: 'BAY-001',
          ErStage: 'StatOrders',
          GcsScore: 14,
          CurrentCondition: 'Critical',
          PrimaryDiagnosis: 'Acute ST-Elevation Myocardial Infarction (STEMI)',
          AbcdeAirway: 'Patent, nasal cannula 4L O2',
          AbcdeBreathing: 'Bilateral basal crackles, tachypneic RR 26',
          AbcdeCirculation: 'Weak rapid pulse HR 115, BP 90/60, Cold clammy skin',
          AbcdeDisability: 'GCS 14 (E4 V4 M6), pupils equal and reactive',
          AbcdeExposure: 'No external trauma, diaphoretic',
          ResuscitationNotes: 'Aspirin 325mg chewed, Ticagrelor 180mg given. 2x 18G IV lines placed. STAT Troponin drawn. Cardiac cath lab activated.',
          Disposition: 'Cath Lab',
          DispositionNotes: 'Immediate transfer to Interventional Cath Lab for primary PCI.',
          Status: 'Active',
          TotalFee: 480.00,
          CreatedAt: '2026-03-21T08:15:00Z',
          UpdatedAt: '2026-03-21T08:45:00Z'
        },
        {
          EncounterID: 'ER-002',
          EncounterNumber: 'ED-2026-0002',
          PatientID: 'PAT-004',
          DoctorID: 'DOC-004',
          TriageNurse: 'Joyce Chen, RN',
          ArrivalDate: '2026-03-21',
          ArrivalTime: '08:40 AM',
          ArrivalMode: 'Ambulance (EMS)',
          AcuityLevel: 'ESI-2 Emergent',
          ChiefComplaint: 'High-speed motor vehicle collision, blunt trauma to chest and left flank',
          BayID: 'BAY-002',
          ErStage: 'PrimarySurvey',
          GcsScore: 13,
          CurrentCondition: 'Emergent',
          PrimaryDiagnosis: 'Blunt Polytrauma, Suspected Splenic Laceration',
          AbcdeAirway: 'Intact with rigid C-collar in situ',
          AbcdeBreathing: 'Decreased breath sounds left lower zone, RR 24',
          AbcdeCirculation: 'Tachycardia HR 122, BP 100/65, Cap refill 3s',
          AbcdeDisability: 'GCS 13 (E3 V4 M6), confused to time',
          AbcdeExposure: 'Seatbelt ecchymosis over chest wall and left upper quadrant',
          ResuscitationNotes: '1000mL Normal Saline running wide open. Trauma team paged. Bedside FAST ultrasound positive for free fluid in splenorenal recess.',
          Disposition: 'Emergency Surgery / OR',
          DispositionNotes: 'Immediate emergent exploratory laparotomy.',
          Status: 'Active',
          TotalFee: 520.00,
          CreatedAt: '2026-03-21T08:40:00Z',
          UpdatedAt: '2026-03-21T09:10:00Z'
        },
        {
          EncounterID: 'ER-003',
          EncounterNumber: 'ED-2026-0003',
          PatientID: 'PAT-001',
          DoctorID: 'DOC-001',
          TriageNurse: 'Joyce Chen, RN',
          ArrivalDate: '2026-03-21',
          ArrivalTime: '09:05 AM',
          ArrivalMode: 'Walk-in (Assisted)',
          AcuityLevel: 'ESI-2 Emergent',
          ChiefComplaint: 'Severe occipital headache, blurred vision, orthopnea, BP 210/120',
          BayID: 'BAY-003',
          ErStage: 'Stabilization',
          GcsScore: 15,
          CurrentCondition: 'Emergent',
          PrimaryDiagnosis: 'Hypertensive Emergency with Flash Pulmonary Edema',
          AbcdeAirway: 'Clear and patent',
          AbcdeBreathing: 'Bilateral diffuse wheezing and rales, SpO2 91% room air',
          AbcdeCirculation: 'Bounding pulse HR 102, BP 210/120 mmHg',
          AbcdeDisability: 'GCS 15, no focal neurological deficits',
          AbcdeExposure: 'Warm, 1+ bilateral ankle edema',
          ResuscitationNotes: 'IV Nitroglycerin infusion started at 20 mcg/min, IV Furosemide 40mg given, BiPAP initiated.',
          Disposition: 'Admit to IPD',
          DispositionNotes: 'Admit to Inpatient ICU for continuous BP titration and monitoring.',
          Status: 'Active',
          TotalFee: 390.00,
          CreatedAt: '2026-03-21T09:05:00Z',
          UpdatedAt: '2026-03-21T09:50:00Z'
        },
        {
          EncounterID: 'ER-004',
          EncounterNumber: 'ED-2026-0004',
          PatientID: 'PAT-005',
          DoctorID: 'DOC-001',
          TriageNurse: 'Lisa Hernandez',
          ArrivalDate: '2026-03-21',
          ArrivalTime: '09:30 AM',
          ArrivalMode: 'Walk-in',
          AcuityLevel: 'ESI-4 Less Urgent',
          ChiefComplaint: 'Deep 6cm laceration across volar aspect of right forearm from broken mirror',
          BayID: 'BAY-005',
          ErStage: 'Disposition',
          GcsScore: 15,
          CurrentCondition: 'Stable',
          PrimaryDiagnosis: 'Right Forearm Laceration, Tendons & Neurovascular Bundle Intact',
          AbcdeAirway: 'Patent, speaking comfortably',
          AbcdeBreathing: 'Clear bilaterally, RR 16, SpO2 99%',
          AbcdeCirculation: 'Good distal radial pulse, sensation intact in median/ulnar/radial distributions',
          AbcdeDisability: 'Alert and fully oriented (GCS 15)',
          AbcdeExposure: 'Clean wound edge, 6cm length, no foreign body',
          ResuscitationNotes: 'Copious irrigation with 500mL sterile saline. Local anesthesia with 1% Lidocaine. Layered closure with 8x 4-0 Ethilon sutures. Tetanus toxoid booster administered.',
          Disposition: 'Discharged Home',
          DispositionNotes: 'Discharged home. Wound care instructions given. Suture removal scheduled in 10 days.',
          Status: 'Active',
          TotalFee: 165.00,
          CreatedAt: '2026-03-21T09:30:00Z',
          UpdatedAt: '2026-03-21T10:15:00Z'
        },
        {
          EncounterID: 'ER-005',
          EncounterNumber: 'ED-2026-0005',
          PatientID: 'PAT-003',
          DoctorID: 'DOC-003',
          TriageNurse: 'Joyce Chen, RN',
          ArrivalDate: '2026-03-20',
          ArrivalTime: '14:20 PM',
          ArrivalMode: 'Walk-in',
          AcuityLevel: 'ESI-3 Urgent',
          ChiefComplaint: 'High fever 39.2C, severe RLQ abdominal pain with positive McBurney sign',
          BayID: 'BAY-006',
          ErStage: 'Disposition',
          GcsScore: 15,
          CurrentCondition: 'Urgent',
          PrimaryDiagnosis: 'Acute Appendicitis with Localized Peritonitis',
          AbcdeAirway: 'Patent',
          AbcdeBreathing: 'Shallow breathing due to abdominal guarding, RR 20',
          AbcdeCirculation: 'HR 108, BP 115/72',
          AbcdeDisability: 'GCS 15, alert and oriented',
          AbcdeExposure: 'Rigidity and rebound tenderness right lower quadrant',
          ResuscitationNotes: 'IV Ceftriaxone + Metronidazole administered. Ultrasound confirmed non-compressible 9mm appendix with appendicolith.',
          Disposition: 'Admit to IPD',
          DispositionNotes: 'Admitted to Inpatient Surgical Ward B for appendectomy.',
          Status: 'Admitted to IPD',
          TotalFee: 310.00,
          CreatedAt: '2026-03-20T14:20:00Z',
          UpdatedAt: '2026-03-20T16:00:00Z'
        },
        {
          EncounterID: 'ER-006',
          EncounterNumber: 'ED-2026-0006',
          PatientID: 'PAT-006',
          DoctorID: 'DOC-001',
          TriageNurse: 'Lisa Hernandez',
          ArrivalDate: '2026-03-20',
          ArrivalTime: '18:10 PM',
          ArrivalMode: 'Walk-in',
          AcuityLevel: 'ESI-3 Urgent',
          ChiefComplaint: 'Intractable hemimigraine with persistent emesis and photophobia x 12 hours',
          BayID: 'BAY-004',
          ErStage: 'Disposition',
          GcsScore: 15,
          CurrentCondition: 'Stable',
          PrimaryDiagnosis: 'Refractory Migraine Cephalea (Status Migrainosus)',
          AbcdeAirway: 'Patent',
          AbcdeBreathing: 'Lungs clear, RR 16, SpO2 99%',
          AbcdeCirculation: 'HR 78, BP 128/80',
          AbcdeDisability: 'GCS 15, cranial nerves II-XII grossly intact',
          AbcdeExposure: 'Afebrile, darkened quiet bay provided',
          ResuscitationNotes: 'IV migraine cocktail: 1L NS + Ketorolac 30mg + Metoclopramide 10mg + Diphenhydramine 25mg. Symptoms completely resolved after 90 mins.',
          Disposition: 'Discharged Home',
          DispositionNotes: 'Discharged home in stable condition with oral prophylactic instructions.',
          Status: 'Discharged',
          TotalFee: 145.00,
          CreatedAt: '2026-03-20T18:10:00Z',
          UpdatedAt: '2026-03-20T20:30:00Z'
        },
        {
          EncounterID: 'ER-007',
          EncounterNumber: 'ED-2026-0007',
          PatientID: 'PAT-007',
          DoctorID: 'DOC-002',
          TriageNurse: 'Joyce Chen, RN',
          ArrivalDate: '2026-03-20',
          ArrivalTime: '21:00 PM',
          ArrivalMode: 'Ambulance (EMS)',
          AcuityLevel: 'ESI-1 Resuscitation',
          ChiefComplaint: 'Severe anaphylaxis, diffuse hives, lip & laryngeal edema, inspiratory stridor after hornet sting',
          BayID: 'BAY-001',
          ErStage: 'Disposition',
          GcsScore: 12,
          CurrentCondition: 'Critical',
          PrimaryDiagnosis: 'Severe Anaphylactic Shock with Airway Compromise',
          AbcdeAirway: 'Laryngeal stridor, impending airway compromise',
          AbcdeBreathing: 'Marked sternal retraction, SpO2 86% on room air',
          AbcdeCirculation: 'Profound hypotension BP 75/40, thready HR 135',
          AbcdeDisability: 'GCS 12 (E3 V4 M5), lethargic',
          AbcdeExposure: 'Generalized urticaria, facial and tongue swelling',
          ResuscitationNotes: 'Immediate IM Epinephrine 0.5mg x2, High-flow 100% O2 via NRB, IV Methylprednisolone 125mg, IV Diphenhydramine 50mg, IV Famotidine 20mg, 2L warm crystalloid bolus.',
          Disposition: 'Admit to IPD',
          DispositionNotes: 'Direct admission to ICU bed for continued airway monitoring.',
          Status: 'Admitted to IPD',
          TotalFee: 495.00,
          CreatedAt: '2026-03-20T21:00:00Z',
          UpdatedAt: '2026-03-20T23:15:00Z'
        },
        {
          EncounterID: 'ER-008',
          EncounterNumber: 'ED-2026-0008',
          PatientID: 'PAT-008',
          DoctorID: 'DOC-001',
          TriageNurse: 'Lisa Hernandez',
          ArrivalDate: '2026-03-19',
          ArrivalTime: '16:45 PM',
          ArrivalMode: 'Walk-in',
          AcuityLevel: 'ESI-5 Non-Urgent',
          ChiefComplaint: 'Superficial boiling water scald to dorsal left hand, blister intact, pain 4/10',
          BayID: 'BAY-005',
          ErStage: 'Disposition',
          GcsScore: 15,
          CurrentCondition: 'Stable',
          PrimaryDiagnosis: 'Partial Thickness Thermal Scald, Left Hand (1% TBSA)',
          AbcdeAirway: 'Patent',
          AbcdeBreathing: 'Clear',
          AbcdeCirculation: 'HR 72, BP 122/76',
          AbcdeDisability: 'Alert GCS 15',
          AbcdeExposure: '3x4cm blister on dorsum of left hand, no circumferential injury',
          ResuscitationNotes: 'Cooled with sterile water, Silver Sulfadiazine cream applied with non-adherent dressing and loose sterile wrap. Oral Ibuprofen dispensed.',
          Disposition: 'Discharged Home',
          DispositionNotes: 'Discharged home. Outpatient burn clinic review in 48 hours.',
          Status: 'Discharged',
          TotalFee: 95.00,
          CreatedAt: '2026-03-19T16:45:00Z',
          UpdatedAt: '2026-03-19T17:40:00Z'
        }
      ],

      OperationTheaters: [
        {
          TheaterID: 'OT-001',
          TheaterNumber: 'OR Suite 1',
          Name: 'OT-1 (General & Laparoscopy Suite)',
          RoomType: 'Laminar Airflow Cleanroom (ISO Class 5)',
          Status: 'In Surgery',
          CurrentSurgeryID: 'SURG-001',
          LeadNurse: 'Joyce Chen, RN',
          EquipmentList: '4K Laparoscopy Tower, C-Arm Fluoroscope, Anesthesia Workstation, Electrosurgical Unit (ESU), Bair Hugger Warming System',
          CleanlinessLevel: 'Ultra-Clean ISO Class 5 (< 10 CFU/m³)',
          CreatedAt: '2026-01-01T08:00:00Z',
          UpdatedAt: '2026-03-20T08:30:00Z'
        },
        {
          TheaterID: 'OT-002',
          TheaterNumber: 'OR Suite 2',
          Name: 'OT-2 (Orthopedic & Trauma Suite)',
          RoomType: 'Ultra-Clean Ortho Suite (ISO Class 5)',
          Status: 'Available',
          CurrentSurgeryID: '',
          LeadNurse: 'David Miller, BSN',
          EquipmentList: 'Dual C-Arm Fluoroscopy, Orthopedic Traction Table, Stryker Power Tools, Arthroscopy Tower, Radiolucent OR Table',
          CleanlinessLevel: 'Ultra-Clean ISO Class 5 (< 10 CFU/m³)',
          CreatedAt: '2026-01-01T08:00:00Z',
          UpdatedAt: '2026-03-20T08:00:00Z'
        },
        {
          TheaterID: 'OT-003',
          TheaterNumber: 'OR Suite 3',
          Name: 'OT-3 (Cardiothoracic & Vascular Suite)',
          RoomType: 'Hybrid Cardiovascular Suite (ISO Class 5)',
          Status: 'Available',
          CurrentSurgeryID: '',
          LeadNurse: 'Emily Watson, RN',
          EquipmentList: 'Heart-Lung Bypass Machine (CPB), Intra-Aortic Balloon Pump (IABP), Transesophageal Echo (TEE), Advanced Hemodynamic Monitor',
          CleanlinessLevel: 'Ultra-Clean ISO Class 5 (< 10 CFU/m³)',
          CreatedAt: '2026-01-01T08:00:00Z',
          UpdatedAt: '2026-03-20T08:00:00Z'
        },
        {
          TheaterID: 'OT-004',
          TheaterNumber: 'OR Suite 4',
          Name: 'OT-4 (Minimally Invasive & Emergency Suite)',
          RoomType: 'High-Acuity Emergency OR (ISO Class 5)',
          Status: 'Turnover / Sanitizing',
          CurrentSurgeryID: '',
          LeadNurse: 'Joyce Chen, RN',
          EquipmentList: 'Rapid Infuser, Video Laryngoscope, Mobile Laparoscopy Cart, Cell Saver, Level 1 Blood Warmer',
          CleanlinessLevel: 'Ultra-Clean ISO Class 5 (< 10 CFU/m³)',
          CreatedAt: '2026-01-01T08:00:00Z',
          UpdatedAt: '2026-03-20T09:15:00Z'
        }
      ],

      Surgeries: [
        {
          SurgeryID: 'SURG-001',
          SurgeryNumber: 'OR-2026-0001',
          PatientID: 'PAT-002',
          AdmissionID: 'ADM-001',
          ProcedureName: 'Laparoscopic Cholecystectomy',
          ICD10Code: '0FT44ZZ',
          Category: 'Elective',
          ScheduledDate: '2026-03-20',
          StartTime: '08:30',
          EndTime: '10:45',
          DurationMinutes: 135,
          TheaterID: 'OT-001',
          LeadSurgeonID: 'DOC-001',
          LeadSurgeonName: 'Dr. Sarah Jenkins, MD, FACS',
          AssistantSurgeon: 'Dr. Michael Chang, MD',
          Anesthesiologist: 'Dr. Robert Lang, MD, FASA',
          AnesthesiaType: 'General Endotracheal Anesthesia (GETA)',
          ScrubNurse: 'Joyce Chen, RN',
          CirculatingNurse: 'David Miller, BSN',
          PreOpDiagnosis: 'Acute Cholecystitis with Symptomatic Cholelithiasis',
          PostOpDiagnosis: 'Acute Gangrenous Cholecystitis, Completely Excised',
          MaterialsRequired: 'Laparoscopic Trocar 10mm & 5mm Kit, Hem-o-lok Polymer Clips (Medium-Large), 2-0 Vicryl Suture, 4-0 Monocryl Subcuticular, Endocatch Specimen Bag (10mm), Harmonic Scalpel Blade, 0.9% Normal Saline Irrigation (3000mL)',
          SterileTraysRequired: 'Laparoscopic Tower & Instruments Set [CSSD-TRAY-002], Major Laparotomy Backup Set [CSSD-TRAY-001]',
          BloodUnitsCrossmatched: '2 Units PRBC Type O+ crossmatched & on standby in Blood Bank',
          WhoSafetyChecklist: 'Sign In: Completed & Verified | Time Out: Completed & Verified | Sign Out: In Progress',
          AldreteScore: 0,
          PacuStatus: 'Scheduled for PACU',
          SurgeryStage: 'IntraOp',
          Status: 'In Surgery',
          OperativeNotes: '4-port standard laparoscopy. Calot triangle identified. Critical view of safety achieved. Cystic duct and artery clipped with Hem-o-lok and divided. Gallbladder dissected from liver bed with harmonic scalpel. Hemostasis secured. Specimen retrieved via Endocatch bag.',
          CreatedAt: '2026-03-18T14:00:00Z',
          UpdatedAt: '2026-03-20T08:30:00Z'
        },
        {
          SurgeryID: 'SURG-002',
          SurgeryNumber: 'OR-2026-0002',
          PatientID: 'PAT-006',
          AdmissionID: 'ADM-004',
          ProcedureName: 'Emergency Laparoscopic Appendectomy',
          ICD10Code: '0DTJ4ZZ',
          Category: 'Emergency STAT',
          ScheduledDate: '2026-03-20',
          StartTime: '11:15',
          EndTime: '12:30',
          DurationMinutes: 75,
          TheaterID: 'OT-001',
          LeadSurgeonID: 'DOC-001',
          LeadSurgeonName: 'Dr. Sarah Jenkins, MD, FACS',
          AssistantSurgeon: 'Dr. Elena Rostova, MD',
          Anesthesiologist: 'Dr. Robert Lang, MD, FASA',
          AnesthesiaType: 'General Endotracheal Anesthesia (GETA)',
          ScrubNurse: 'Joyce Chen, RN',
          CirculatingNurse: 'Emily Watson, RN',
          PreOpDiagnosis: 'Acute Suppurative Appendicitis with Early Perforation Risk',
          PostOpDiagnosis: 'Pending Operative Confirmation',
          MaterialsRequired: 'Laparoscopic Appendectomy Pack, 10mm Hasson Cannula, 5mm Trocars x2, Endoloop PDS II Ligatures (0 gauge), Endobag, Bipolar Cautery Cable',
          SterileTraysRequired: 'Major Laparotomy Surgical Set [CSSD-TRAY-001]',
          BloodUnitsCrossmatched: 'Type & Screen Confirmed (1 Unit PRBC Reserve)',
          WhoSafetyChecklist: 'Sign In: Completed | Time Out: Pending | Sign Out: Pending',
          AldreteScore: 0,
          PacuStatus: 'Pre-Op Transfer',
          SurgeryStage: 'PreOp',
          Status: 'Pre-Op Ready',
          OperativeNotes: 'Pre-operative surgical and anesthesia consent signed. NPO 8 hours verified. IV Cefoxitin 2g given in pre-op holding. Awaiting OR 1 turnover.',
          CreatedAt: '2026-03-20T07:30:00Z',
          UpdatedAt: '2026-03-20T09:00:00Z'
        },
        {
          SurgeryID: 'SURG-003',
          SurgeryNumber: 'OR-2026-0003',
          PatientID: 'PAT-004',
          AdmissionID: 'ADM-003',
          ProcedureName: 'Open Reduction and Internal Fixation (ORIF) Femur',
          ICD10Code: '0QS804Z',
          Category: 'Urgent',
          ScheduledDate: '2026-03-20',
          StartTime: '13:00',
          EndTime: '15:30',
          DurationMinutes: 150,
          TheaterID: 'OT-002',
          LeadSurgeonID: 'DOC-004',
          LeadSurgeonName: 'Dr. David Kim, MD',
          AssistantSurgeon: 'Dr. Marcus Vance, MD',
          Anesthesiologist: 'Dr. Frank Castle, MD',
          AnesthesiaType: 'Combined Spinal-Epidural (CSE)',
          ScrubNurse: 'David Miller, BSN',
          CirculatingNurse: 'Joyce Chen, RN',
          PreOpDiagnosis: 'Displaced Midshaft Femoral Shaft Fracture (Right)',
          PostOpDiagnosis: 'Pending Intra-Operative Fixation',
          MaterialsRequired: 'Synthes Titanium Distal Femoral LCP Plate (8-hole), 4.5mm Cortical Screws & 5.0mm Locking Screws, Bone Graft Substitute (5cc), C-Arm Sterile Drapes, Surgical Suction Tubing x2',
          SterileTraysRequired: 'Orthopedic Major Bone & Joint Set [CSSD-TRAY-003]',
          BloodUnitsCrossmatched: '2 Units Packed RBCs crossmatched in blood bank',
          WhoSafetyChecklist: 'Sign In: Pending | Time Out: Pending | Sign Out: Pending',
          AldreteScore: 0,
          PacuStatus: 'Pre-Op Holding',
          SurgeryStage: 'Scheduling',
          Status: 'Scheduled',
          OperativeNotes: 'Surgical site marked on right lower extremity. Skeletal traction maintained in ward. Awaiting transport to OR 2.',
          CreatedAt: '2026-03-19T16:00:00Z',
          UpdatedAt: '2026-03-20T08:00:00Z'
        },
        {
          SurgeryID: 'SURG-004',
          SurgeryNumber: 'OR-2026-0004',
          PatientID: 'PAT-007',
          AdmissionID: 'ADM-005',
          ProcedureName: 'Coronary Artery Bypass Graft (CABG x3: LIMA-LAD, SVG-OM, SVG-RCA)',
          ICD10Code: '0210093',
          Category: 'Elective',
          ScheduledDate: '2026-03-19',
          StartTime: '07:30',
          EndTime: '12:15',
          DurationMinutes: 285,
          TheaterID: 'OT-003',
          LeadSurgeonID: 'DOC-002',
          LeadSurgeonName: 'Dr. Marcus Vance, MD',
          AssistantSurgeon: 'Dr. Sarah Jenkins, MD',
          Anesthesiologist: 'Dr. Robert Lang, MD, FASA',
          AnesthesiaType: 'Cardiac General Anesthesia + High-Dose Opioid',
          ScrubNurse: 'Emily Watson, RN',
          CirculatingNurse: 'Joyce Chen, RN',
          PreOpDiagnosis: 'Triple Vessel Coronary Artery Disease with 90% LAD Stenosis',
          PostOpDiagnosis: 'Completed Triple Vessel Coronary Bypass Grafts, Excellent Grafts Flow',
          MaterialsRequired: 'Cardiopulmonary Bypass Circuit Pack, Sternal Wire Pack (Stainless Steel #5), 7-0 & 8-0 Prolene Microvascular Sutures, Hemostatic Gelfoam Pads, Mediastinal & Pleural Chest Tubes (32 Fr x2)',
          SterileTraysRequired: 'Cardiothoracic Sternotomy & Bypass Set [CSSD-TRAY-004], Vascular Micro-Surgical Set [CSSD-TRAY-006]',
          BloodUnitsCrossmatched: '4 Units PRBC, 2 Units FFP, 1 Single Donor Platelet pool',
          WhoSafetyChecklist: 'Sign In: Completed & Verified | Time Out: Completed & Verified | Sign Out: Completed & Verified',
          AldreteScore: 9,
          PacuStatus: 'Transferred to ICU',
          SurgeryStage: 'Completed',
          Status: 'Completed',
          OperativeNotes: 'Median sternotomy. Heparinized. CPB initiated via ascending aorta and right atrium. LIMA harvested and anastomosed to LAD. Saphenous vein grafts to OM and RCA. Weaned from bypass smoothly. Sternal closure with 6 wires.',
          CreatedAt: '2026-03-17T11:00:00Z',
          UpdatedAt: '2026-03-19T14:30:00Z'
        },
        {
          SurgeryID: 'SURG-005',
          SurgeryNumber: 'OR-2026-0005',
          PatientID: 'PAT-014',
          AdmissionID: 'ADM-008',
          ProcedureName: 'Diagnostic Arthroscopy & Partial Medial Meniscectomy (Right Knee)',
          ICD10Code: '0SBC4ZZ',
          Category: 'Elective',
          ScheduledDate: '2026-03-19',
          StartTime: '14:00',
          EndTime: '15:15',
          DurationMinutes: 75,
          TheaterID: 'OT-002',
          LeadSurgeonID: 'DOC-004',
          LeadSurgeonName: 'Dr. David Kim, MD',
          AssistantSurgeon: 'Dr. Michael Chang, MD',
          Anesthesiologist: 'Dr. Frank Castle, MD',
          AnesthesiaType: 'Spinal Anesthesia with Bupivacaine 0.5%',
          ScrubNurse: 'David Miller, BSN',
          CirculatingNurse: 'Emily Watson, RN',
          PreOpDiagnosis: 'Complex Bucket-Handle Tear of Right Medial Meniscus',
          PostOpDiagnosis: 'Excised Degenerate Meniscal Flap, Stable Articular Cartilage',
          MaterialsRequired: 'Arthroscopy Tubing & Fluid Inflow Set, 4mm 30-degree Arthroscope Sheath, Mechanical Shaver Blade (3.5mm), Meniscal Punch Forceps, 3000mL Saline Arthroscopic Wash Bags x4',
          SterileTraysRequired: 'Orthopedic Major Bone & Joint Set [CSSD-TRAY-003]',
          BloodUnitsCrossmatched: 'None Required (Type & Screen in file)',
          WhoSafetyChecklist: 'Sign In: Completed & Verified | Time Out: Completed & Verified | Sign Out: Completed & Verified',
          AldreteScore: 10,
          PacuStatus: 'Discharged to IPD Ward',
          SurgeryStage: 'Completed',
          Status: 'Completed',
          OperativeNotes: 'Anterolateral and anteromedial arthroscopy portals created. Knee joint explored. Complex tear of posterior horn of medial meniscus identified. Shaver and punch used to resect unstable fragment. Portals closed with 4-0 nylon.',
          CreatedAt: '2026-03-18T10:00:00Z',
          UpdatedAt: '2026-03-19T16:00:00Z'
        },
        {
          SurgeryID: 'SURG-006',
          SurgeryNumber: 'OR-2026-0006',
          PatientID: 'PAT-005',
          AdmissionID: 'ADM-002',
          ProcedureName: 'Left Inguinal Hernioplasty with Mesh',
          ICD10Code: '0YU60JZ',
          Category: 'Elective',
          ScheduledDate: '2026-03-21',
          StartTime: '09:00',
          EndTime: '10:30',
          DurationMinutes: 90,
          TheaterID: 'OT-001',
          LeadSurgeonID: 'DOC-001',
          LeadSurgeonName: 'Dr. Sarah Jenkins, MD, FACS',
          AssistantSurgeon: 'Dr. Elena Rostova, MD',
          Anesthesiologist: 'Dr. Robert Lang, MD, FASA',
          AnesthesiaType: 'Monitored Anesthesia Care (MAC) + Ilioinguinal Field Block',
          ScrubNurse: 'Joyce Chen, RN',
          CirculatingNurse: 'David Miller, BSN',
          PreOpDiagnosis: 'Symptomatic Left Indirect Inguinal Hernia',
          PostOpDiagnosis: 'Pending Operative Procedure',
          MaterialsRequired: 'Polypropylene Surgical Mesh (7.5 x 15cm), 2-0 Prolene Sutures, 3-0 Vicryl Suture, Marcaine 0.5% with Epinephrine (20mL), Skin Stapler (35 Regular)',
          SterileTraysRequired: 'Major Laparotomy Surgical Set [CSSD-TRAY-001]',
          BloodUnitsCrossmatched: 'Type & Screen Confirmed',
          WhoSafetyChecklist: 'Sign In: Pending | Time Out: Pending | Sign Out: Pending',
          AldreteScore: 0,
          PacuStatus: 'Pre-Op Booking',
          SurgeryStage: 'Scheduling',
          Status: 'Scheduled',
          OperativeNotes: 'Elective hernia repair scheduled for Saturday morning. Cardiopulmonary clearance obtained.',
          CreatedAt: '2026-03-19T14:00:00Z',
          UpdatedAt: '2026-03-19T14:00:00Z'
        }
      ],

      SterileTrays: [
        {
          TrayID: 'CSSD-TRAY-001',
          TrayNumber: 'CSSD-SET-01',
          TrayName: 'Major Laparotomy Surgical Set',
          Department: 'General Surgery',
          TotalInstruments: 42,
          SterilizationMethod: 'High-Pressure Steam Autoclave (134°C, 3.5 min)',
          SterilizationDate: '2026-03-19',
          ExpiryDate: '2026-04-19',
          CycleNumber: 'AUTOCLAVE-CYC-2026-088',
          ChemicalIndicator: 'Pass',
          BiologicalIndicator: 'Pass',
          Status: 'Sterile - Ready for OR',
          AssignedSurgeryID: '',
          TechnicianName: 'Maria Santos, CRCST',
          CreatedAt: '2026-01-01T08:00:00Z',
          UpdatedAt: '2026-03-19T11:00:00Z'
        },
        {
          TrayID: 'CSSD-TRAY-002',
          TrayNumber: 'CSSD-SET-02',
          TrayName: 'Laparoscopic Tower & Instruments Set',
          Department: 'Minimally Invasive',
          TotalInstruments: 28,
          SterilizationMethod: 'Low-Temp Hydrogen Peroxide Gas Plasma',
          SterilizationDate: '2026-03-20',
          ExpiryDate: '2026-04-20',
          CycleNumber: 'PLASMA-CYC-2026-042',
          ChemicalIndicator: 'Pass',
          BiologicalIndicator: 'Pass',
          Status: 'In Use (OT-1)',
          AssignedSurgeryID: 'SURG-001',
          TechnicianName: 'Maria Santos, CRCST',
          CreatedAt: '2026-01-01T08:00:00Z',
          UpdatedAt: '2026-03-20T08:00:00Z'
        },
        {
          TrayID: 'CSSD-TRAY-003',
          TrayNumber: 'CSSD-SET-03',
          TrayName: 'Orthopedic Major Bone & Joint Set',
          Department: 'Orthopedics',
          TotalInstruments: 54,
          SterilizationMethod: 'High-Pressure Steam Autoclave (134°C, 3.5 min)',
          SterilizationDate: '2026-03-19',
          ExpiryDate: '2026-04-19',
          CycleNumber: 'AUTOCLAVE-CYC-2026-089',
          ChemicalIndicator: 'Pass',
          BiologicalIndicator: 'Pass',
          Status: 'Sterile - Ready for OR',
          AssignedSurgeryID: 'SURG-003',
          TechnicianName: 'Carlos Mendez, CST',
          CreatedAt: '2026-01-01T08:00:00Z',
          UpdatedAt: '2026-03-19T14:30:00Z'
        },
        {
          TrayID: 'CSSD-TRAY-004',
          TrayNumber: 'CSSD-SET-04',
          TrayName: 'Cardiothoracic Sternotomy & Bypass Set',
          Department: 'Cardiothoracic',
          TotalInstruments: 62,
          SterilizationMethod: 'High-Pressure Steam Autoclave (134°C, 3.5 min)',
          SterilizationDate: '2026-03-18',
          ExpiryDate: '2026-04-18',
          CycleNumber: 'AUTOCLAVE-CYC-2026-085',
          ChemicalIndicator: 'Pass',
          BiologicalIndicator: 'Pass',
          Status: 'Sterile - Ready for OR',
          AssignedSurgeryID: '',
          TechnicianName: 'Maria Santos, CRCST',
          CreatedAt: '2026-01-01T08:00:00Z',
          UpdatedAt: '2026-03-18T16:00:00Z'
        },
        {
          TrayID: 'CSSD-TRAY-005',
          TrayNumber: 'CSSD-SET-05',
          TrayName: 'Emergency Trauma & Hemostasis Pack',
          Department: 'Trauma / Emergency',
          TotalInstruments: 36,
          SterilizationMethod: 'High-Pressure Steam Autoclave (134°C, 3.5 min)',
          SterilizationDate: '2026-03-20',
          ExpiryDate: '2026-04-20',
          CycleNumber: 'AUTOCLAVE-CYC-2026-091',
          ChemicalIndicator: 'Pass',
          BiologicalIndicator: 'Pass',
          Status: 'Sterile - Ready for OR',
          AssignedSurgeryID: '',
          TechnicianName: 'Carlos Mendez, CST',
          CreatedAt: '2026-01-01T08:00:00Z',
          UpdatedAt: '2026-03-20T06:00:00Z'
        },
        {
          TrayID: 'CSSD-TRAY-006',
          TrayNumber: 'CSSD-SET-06',
          TrayName: 'Vascular Micro-Surgical Set',
          Department: 'Vascular',
          TotalInstruments: 48,
          SterilizationMethod: 'Low-Temp Hydrogen Peroxide Gas Plasma',
          SterilizationDate: '2026-03-19',
          ExpiryDate: '2026-04-19',
          CycleNumber: 'PLASMA-CYC-2026-041',
          ChemicalIndicator: 'Pass',
          BiologicalIndicator: 'Pass',
          Status: 'Sterile - Ready for OR',
          AssignedSurgeryID: '',
          TechnicianName: 'Maria Santos, CRCST',
          CreatedAt: '2026-01-01T08:00:00Z',
          UpdatedAt: '2026-03-19T09:30:00Z'
        },
        {
          TrayID: 'CSSD-TRAY-007',
          TrayNumber: 'CSSD-SET-07',
          TrayName: 'Minor Surgical Debridement & Suture Tray',
          Department: 'Outpatient / ER',
          TotalInstruments: 18,
          SterilizationMethod: 'High-Pressure Steam Autoclave (134°C, 3.5 min)',
          SterilizationDate: '2026-03-20',
          ExpiryDate: '2026-04-20',
          CycleNumber: 'AUTOCLAVE-CYC-2026-092',
          ChemicalIndicator: 'Pass',
          BiologicalIndicator: 'Pass',
          Status: 'Sterile - Ready for OR',
          AssignedSurgeryID: '',
          TechnicianName: 'Carlos Mendez, CST',
          CreatedAt: '2026-01-01T08:00:00Z',
          UpdatedAt: '2026-03-20T07:15:00Z'
        },
        {
          TrayID: 'CSSD-TRAY-008',
          TrayNumber: 'CSSD-SET-08',
          TrayName: 'Endo-Gastrointestinal Scope & Biopsy Pack',
          Department: 'Gastroenterology',
          TotalInstruments: 12,
          SterilizationMethod: 'High-Level Automated Endoscope Reprocessor (AER)',
          SterilizationDate: '2026-03-20',
          ExpiryDate: '2026-03-27',
          CycleNumber: 'AER-CYC-2026-015',
          ChemicalIndicator: 'Pass',
          BiologicalIndicator: 'Pass',
          Status: 'Decontamination & Washing',
          AssignedSurgeryID: '',
          TechnicianName: 'Maria Santos, CRCST',
          CreatedAt: '2026-01-01T08:00:00Z',
          UpdatedAt: '2026-03-20T09:45:00Z'
        }
      ]
    };
  }
};

// ==========================================
// 3. BUSINESS RULES ENGINE
// ==========================================
const BusinessRules = {
  // Validate Patient Creation & Edit
  validatePatient: function(patientData, isEdit = false, currentId = null) {
    if (!patientData.FirstName || !patientData.LastName) {
      return { valid: false, message: 'First Name and Last Name are required.' };
    }
    if (!patientData.PatientNumber) {
      return { valid: false, message: 'Patient Number (MRN) is required.' };
    }
    // Check Patient Number Uniqueness
    const allPatients = DAL.find('Patients');
    const duplicate = allPatients.find(p => 
      p.PatientNumber.trim().toUpperCase() === patientData.PatientNumber.trim().toUpperCase() &&
      (!isEdit || p.PatientID !== currentId)
    );
    if (duplicate) {
      return { valid: false, message: `Patient Number "${patientData.PatientNumber}" already exists! It must be unique.` };
    }
    return { valid: true };
  },

  // Validate Appointment Scheduling (Double-Booking Prevention Rule)
  validateAppointment: function(apptData, isEdit = false, currentId = null) {
    if (!apptData.PatientID) {
      return { valid: false, message: 'Appointment must reference an existing patient.' };
    }
    if (!apptData.DoctorID) {
      return { valid: false, message: 'Appointment must reference a doctor.' };
    }
    const doctor = DAL.findById('Doctors', apptData.DoctorID);
    if (!doctor || doctor.Status !== 'Active') {
      return { valid: false, message: 'Appointment must reference an ACTIVE doctor.' };
    }
    if (!apptData.AppointmentDate || !apptData.StartTime) {
      return { valid: false, message: 'Appointment Date and Start Time are required.' };
    }

    // Double-Booking Collision Check: Same doctor cannot have two active appointments at the same time
    const allAppts = DAL.find('Appointments');
    const collision = allAppts.find(a => 
      a.DoctorID === apptData.DoctorID &&
      a.AppointmentDate === apptData.AppointmentDate &&
      a.StartTime === apptData.StartTime &&
      a.Status !== 'Cancelled' &&
      (!isEdit || a.AppointmentID !== currentId)
    );

    if (collision) {
      const docName = doctor.DoctorName || apptData.DoctorID;
      return { 
        valid: false, 
        message: `Double-Booking Collision! ${docName} already has an active appointment scheduled on ${apptData.AppointmentDate} at ${apptData.StartTime}. Please choose a different time slot.` 
      };
    }

    return { valid: true };
  },

  // Validate Visit / Encounter
  validateVisit: function(visitData) {
    if (!visitData.PatientID) return { valid: false, message: 'Visit must be associated with a patient.' };
    if (!visitData.DoctorID) return { valid: false, message: 'Visit must be associated with an attending doctor.' };
    return { valid: true };
  },

  // Validate Prescription
  validatePrescription: function(rxData) {
    if (!rxData.PatientID) return { valid: false, message: 'Prescription must reference a patient.' };
    if (!rxData.DoctorID) return { valid: false, message: 'Prescription must be authorized by a doctor.' };
    return { valid: true };
  },

  // Validate Payment (Overpayment Prevention Rule)
  validatePayment: function(invoiceId, paymentAmount) {
    const invoice = DAL.findById('Invoices', invoiceId);
    if (!invoice) return { valid: false, message: 'Target invoice not found.' };

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      return { valid: false, message: 'Payment amount must be greater than zero.' };
    }

    const currentBalance = parseFloat(invoice.Balance || (invoice.TotalAmount - invoice.AmountPaid));
    if (amount > (currentBalance + 0.001)) {
      return {
        valid: false,
        message: `Payment amount ($${amount.toFixed(2)}) cannot exceed the outstanding invoice balance of $${currentBalance.toFixed(2)}.`
      };
    }
    return { valid: true, invoice: invoice };
  },

  // Validate Follow-up
  validateFollowUp: function(followUpData) {
    if (!followUpData.PatientID || !followUpData.DoctorID) {
      return { valid: false, message: 'Follow-up requires patient and doctor association.' };
    }
    if (!followUpData.FollowUpDate) {
      return { valid: false, message: 'Follow-up Date is required.' };
    }
    return { valid: true };
  }
};

// ==========================================
// 4. NAVIGATION, VIEWS & ROUTING
// ==========================================

function navigateTo(viewId) {
  // Enforce Role-Based Navigation
  const roleInfo = USER_PERSONAS[appState.currentRole];
  if (roleInfo && !roleInfo.allowedViews.includes(viewId) && viewId !== 'dashboard') {
    showToast(`Access Restricted: The "${appState.currentRole}" role does not have permission to access ${viewId}.`, 'warning');
    return;
  }

  appState.currentView = viewId;
  appState.selectedEntity = null;
  appState.activeRecordType = null;
  appState.searchTerm = '';
  appState.selectedViewFilter = 'default';

  // Update left navigation highlight
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('bg-[#e1dfdd]', 'font-semibold', 'text-blue-700');
  });
  const activeBtn = document.getElementById(`nav-${viewId}`);
  if (activeBtn) {
    activeBtn.classList.add('bg-[#e1dfdd]', 'font-semibold', 'text-blue-700');
  }

  // Update Ribbon Breadcrumb
  const bcEntity = document.getElementById('breadcrumb-entity');
  if (bcEntity) {
    bcEntity.textContent = formatEntityTitle(viewId);
  }

  // Render view
  renderMainView();
  renderRibbon();
}

function formatEntityTitle(str) {
  if (typeof i18n !== 'undefined' && i18n.currentLang === 'kh') {
    const key = `nav_${str}`;
    const tr = i18n.t(key);
    if (tr && tr !== key) return tr;
  }
  if (str === 'emergency') return 'Emergency (ER / ED) Encounters';
  if (str === 'emergency_bays') return 'Emergency Trauma & Bays';
  if (str === 'surgeries' || str === 'operation_theater') return 'Operation Theater (OT / OR)';
  if (str === 'sterile_processing' || str === 'cssd') return 'Central Sterile Processing (CSSD)';
  return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function refreshIcons(container) {
  if (typeof lucide === 'undefined' || !lucide.createIcons) return;
  try {
    if (container && container.nodeType === 1) {
      lucide.createIcons({ root: container });
      return;
    }
  } catch (e) {}
  lucide.createIcons();
}

function renderRibbon() {
  const container = document.getElementById('ribbon-actions');
  if (!container) return;

  const t = (k, def) => (typeof i18n !== 'undefined' ? i18n.t(k, def) : def);

  if (appState.activeRecordType && appState.selectedEntity) {
    // Record Form Ribbon
    container.innerHTML = `
      <button onclick="saveRecordForm()" class="flex items-center gap-1.5 px-3 py-1.5 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold rounded shadow-xs transition">
        <i data-lucide="save" class="w-3.5 h-3.5"></i>
        <span>${t('ribbon_save_close', 'Save & Close')}</span>
      </button>
      <button onclick="navigateTo('${appState.currentView}')" class="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-[#e1dfdd] text-slate-700 text-xs font-medium rounded transition">
        <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
        <span>${t('ribbon_back_list', 'Back to List')}</span>
      </button>
      <div class="h-4 w-[1px] bg-slate-300 mx-1"></div>
      <button onclick="deactivateCurrentRecord()" class="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-rose-50 text-rose-700 text-xs font-medium rounded transition">
        <i data-lucide="slash" class="w-3.5 h-3.5"></i>
        <span>${t('ribbon_deactivate', 'Deactivate')}</span>
      </button>
      <button onclick="printRecord()" class="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-[#e1dfdd] text-slate-700 text-xs font-medium rounded transition">
        <i data-lucide="printer" class="w-3.5 h-3.5"></i>
        <span>${t('ribbon_print', 'Print')}</span>
      </button>
    `;
  } else {
    // Dedicated Dashboard Ribbon
    if (appState.currentView === 'dashboard') {
      const isKh = typeof i18n !== 'undefined' && i18n.currentLang === 'kh';
      container.innerHTML = `
        <button onclick="refreshCurrentView()" class="flex items-center gap-1.5 px-3 py-1.5 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold rounded shadow-xs transition">
          <i data-lucide="rotate-cw" class="w-3.5 h-3.5"></i>
          <span>${isKh ? 'ផ្ទុកទិន្នន័យឡើងវិញ' : 'Refresh Dashboard'}</span>
        </button>
        <div class="h-4 w-[1px] bg-slate-300 mx-1"></div>
        <button onclick="quickCreate('patient')" class="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-[#e1dfdd] text-slate-700 text-xs font-medium rounded transition">
          <i data-lucide="user-plus" class="w-3.5 h-3.5 text-blue-600"></i>
          <span>${isKh ? '+ អ្នកជំងឺ' : '+ New Patient'}</span>
        </button>
        <button onclick="quickCreate('appointment')" class="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-[#e1dfdd] text-slate-700 text-xs font-medium rounded transition">
          <i data-lucide="calendar-plus" class="w-3.5 h-3.5 text-indigo-600"></i>
          <span>${isKh ? '+ ការណាត់ជួប' : '+ New Appointment'}</span>
        </button>
        <button onclick="quickCreate('emergency')" class="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-[#e1dfdd] text-slate-700 text-xs font-medium rounded transition">
          <i data-lucide="siren" class="w-3.5 h-3.5 text-rose-600"></i>
          <span>${isKh ? '+ សង្គ្រោះបន្ទាន់' : '+ ER Triage'}</span>
        </button>
        <button onclick="quickCreate('admission')" class="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-[#e1dfdd] text-slate-700 text-xs font-medium rounded transition">
          <i data-lucide="hotel" class="w-3.5 h-3.5 text-purple-600"></i>
          <span>${isKh ? '+ សម្រាកពេទ្យ' : '+ IPD Admission'}</span>
        </button>
        <button onclick="quickCreate('surgery')" class="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-[#e1dfdd] text-slate-700 text-xs font-medium rounded transition">
          <i data-lucide="scissors" class="w-3.5 h-3.5 text-amber-600"></i>
          <span>${isKh ? '+ កក់វះកាត់' : '+ Surgery'}</span>
        </button>
        <div class="h-4 w-[1px] bg-slate-300 mx-1"></div>
        <button onclick="startGuidedDemo()" class="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded transition border border-emerald-200">
          <i data-lucide="play-circle" class="w-3.5 h-3.5 text-emerald-600"></i>
          <span>${isKh ? 'ទស្សនកិច្ចគំរូ' : 'Guided Demo'}</span>
        </button>
        <button onclick="openSyncSettingsModal()" class="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-[#e1dfdd] text-slate-700 text-xs font-medium rounded transition">
          <i data-lucide="sheet" class="w-3.5 h-3.5 text-emerald-600"></i>
          <span>Cloud Sync</span>
        </button>
      `;
      refreshIcons(container);
      return;
    }

    // Entity Grid Ribbon
    const entityName = getEntityForView(appState.currentView);
    const canCreate = ['Patients', 'Appointments', 'Visits', 'Prescriptions', 'LaboratoryResults', 'Invoices', 'Payments', 'FollowUps', 'Users', 'SecurityRoles', 'Admissions', 'Beds', 'EmergencyEncounters', 'EmergencyBays', 'Surgeries', 'SterileTrays'].includes(entityName);

    const isKh = typeof i18n !== 'undefined' && i18n.currentLang === 'kh';
    const newRecordLabel = isKh 
      ? `+ ${t('ribbon_new', 'ថ្មី')} ${formatEntityTitle(appState.currentView)}`
      : `New ${appState.currentView === 'users' ? 'User' : (appState.currentView === 'security_roles' ? 'Role' : (appState.currentView === 'admissions' ? 'Admission' : (appState.currentView === 'beds' ? 'Bed' : (appState.currentView === 'emergency' ? 'ER Triage Intake' : (appState.currentView === 'emergency_bays' ? 'ER Bay' : (appState.currentView === 'surgeries' ? 'Surgery Booking' : (appState.currentView === 'sterile_processing' ? 'Sterile Tray' : (formatEntityTitle(appState.currentView).slice(0, -1) || 'Record'))))))))}`;

    container.innerHTML = `
      ${canCreate ? `
        <button onclick="openCreateModal('${appState.currentView === 'surgeries' ? 'surgery' : (appState.currentView === 'sterile_processing' ? 'sterile_tray' : appState.currentView)}')" class="flex items-center gap-1.5 px-3 py-1.5 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold rounded shadow-xs transition">
          <i data-lucide="plus" class="w-3.5 h-3.5"></i>
          <span>${newRecordLabel}</span>
        </button>
      ` : ''}
      <button onclick="refreshCurrentView()" class="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-[#e1dfdd] text-slate-700 text-xs font-medium rounded transition">
        <i data-lucide="rotate-cw" class="w-3.5 h-3.5"></i>
        <span>${t('ribbon_refresh', 'Refresh')}</span>
      </button>
      ${entityName ? `
        <button onclick="DAL.exportToCsv('${entityName}')" class="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-[#e1dfdd] text-slate-700 text-xs font-medium rounded transition">
          <i data-lucide="file-spreadsheet" class="w-3.5 h-3.5 text-emerald-700"></i>
          <span>${t('ribbon_export', 'Export to Excel')}</span>
        </button>
      ` : ''}
      ${appState.currentView === 'appointments' ? `
        <div class="h-4 w-[1px] bg-slate-300 mx-1"></div>
        <button onclick="toggleCalendarView()" class="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded transition">
          <i data-lucide="calendar-days" class="w-3.5 h-3.5"></i>
          <span>${appState.calendarMode ? t('ribbon_switch_grid', 'Switch to Grid') : t('ribbon_switch_calendar', 'Switch to Calendar')}</span>
        </button>
      ` : ''}
    `;
  }
  refreshIcons(container);
}

function getEntityForView(viewId) {
  const map = {
    patients: 'Patients',
    appointments: 'Appointments',
    visits: 'Visits',
    medical_history: 'Visits',
    diagnoses: 'Diagnoses',
    prescriptions: 'Prescriptions',
    medications: 'Medications',
    laboratory_tests: 'LaboratoryTests',
    laboratory_results: 'LaboratoryResults',
    billing: 'Invoices',
    payments: 'Payments',
    doctors: 'Doctors',
    departments: 'Departments',
    followups: 'FollowUps',
    users: 'Users',
    security_roles: 'SecurityRoles',
    administration: 'Users',
    admissions: 'Admissions',
    beds: 'Beds',
    emergency: 'EmergencyEncounters',
    emergency_bays: 'EmergencyBays',
    surgeries: 'Surgeries',
    operation_theater: 'Surgeries',
    sterile_processing: 'SterileTrays',
    cssd: 'SterileTrays',
    operation_theaters: 'OperationTheaters'
  };
  return map[viewId] || null;
}

// ==========================================
// 5. VIEW RENDERERS
// ==========================================
function renderMainView() {
  const main = document.getElementById('main-content');
  if (!main) return;

  if (appState.activeRecordType && appState.selectedEntity) {
    if (appState.activeRecordType === 'Patients') {
      main.innerHTML = renderPatientProfile(appState.selectedEntity);
    } else {
      main.innerHTML = renderGenericRecordForm(appState.activeRecordType, appState.selectedEntity);
    }
    refreshIcons(main);
    return;
  }

  switch (appState.currentView) {
    case 'dashboard':
      main.innerHTML = renderDashboard();
      break;
    case 'patients':
      main.innerHTML = renderPatientsGrid();
      break;
    case 'appointments':
      main.innerHTML = appState.calendarMode ? renderAppointmentsCalendar() : renderAppointmentsGrid();
      break;
    case 'visits':
      main.innerHTML = renderVisitsGrid();
      break;
    case 'medical_history':
      main.innerHTML = renderMedicalHistoryGrid();
      break;
    case 'diagnoses':
      main.innerHTML = renderDiagnosesGrid();
      break;
    case 'prescriptions':
      main.innerHTML = renderPrescriptionsGrid();
      break;
    case 'medications':
      main.innerHTML = renderMedicationsGrid();
      break;
    case 'laboratory_tests':
      main.innerHTML = renderLabTestsGrid();
      break;
    case 'laboratory_results':
      main.innerHTML = renderLabResultsGrid();
      break;
    case 'billing':
      main.innerHTML = renderBillingGrid();
      break;
    case 'payments':
      main.innerHTML = renderPaymentsGrid();
      break;
    case 'doctors':
      main.innerHTML = renderDoctorsGrid();
      break;
    case 'departments':
      main.innerHTML = renderDepartmentsGrid();
      break;
    case 'followups':
      main.innerHTML = renderFollowupsGrid();
      break;
    case 'reports':
      main.innerHTML = renderReportsView();
      break;
    case 'users':
      main.innerHTML = renderUsersGrid();
      break;
    case 'security_roles':
      main.innerHTML = renderSecurityRolesGrid();
      break;
    case 'administration':
      main.innerHTML = renderAdministrationView();
      break;
    case 'admissions':
      main.innerHTML = renderAdmissionsGrid();
      break;
    case 'beds':
      main.innerHTML = renderBedsGrid();
      break;
    case 'emergency':
      main.innerHTML = renderEmergencyGrid();
      break;
    case 'emergency_bays':
      main.innerHTML = renderEmergencyBaysGrid();
      break;
    case 'surgeries':
    case 'operation_theater':
      main.innerHTML = renderSurgeriesGrid();
      break;
    case 'sterile_processing':
    case 'cssd':
      main.innerHTML = renderSterileProcessingGrid();
      break;
    default:
      main.innerHTML = `<div class="p-8 text-center text-slate-500">View not found</div>`;
  }
  refreshIcons(main);
}

// ==========================================
// 6. DASHBOARD (DYNAMICS 365 MODEL-DRIVEN STYLE)
// ==========================================
function renderDashboard() {
  const patients = DAL.find('Patients') || [];
  const appointments = DAL.find('Appointments') || [];
  const visits = DAL.find('Visits') || [];
  const invoices = DAL.find('Invoices') || [];
  const labResults = DAL.find('LaboratoryResults') || [];
  const prescriptions = DAL.find('Prescriptions') || [];
  const followups = DAL.find('FollowUps') || [];
  const admissions = DAL.find('Admissions') || [];
  const beds = DAL.find('Beds') || [];
  const emergencies = DAL.find('EmergencyEncounters') || [];
  const surgeries = DAL.find('Surgeries') || [];
  const doctors = DAL.find('Doctors') || [];

  // KPI Calculations
  const totalPatients = patients.length;
  const todayStr = '2026-03-20'; // Current prototype simulation date
  const todayAppts = appointments.filter(a => a.AppointmentDate === todayStr || a.Status === 'Checked In').length;
  const completedVisits = visits.filter(v => v.VisitStatus === 'Completed').length;
  const pendingAppts = appointments.filter(a => ['Scheduled', 'Confirmed', 'Checked In'].includes(a.Status)).length;
  
  const totalOutstanding = invoices.reduce((acc, inv) => acc + (parseFloat(inv.Balance) || 0), 0);
  const totalCollected = invoices.reduce((acc, inv) => acc + (parseFloat(inv.AmountPaid) || 0), 0);
  const pendingLabs = labResults.filter(l => ['Requested', 'Sample Collected', 'Processing'].includes(l.Status)).length;
  const activeRx = prescriptions.filter(p => p.Status === 'Active').length;
  const upcomingFollowups = followups.filter(f => f.Status === 'Pending').length;

  // Acute & Inpatient Telemetry
  const totalBeds = beds.length || 14;
  const occupiedBeds = beds.filter(b => b.Status === 'Occupied').length;
  const bedOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
  const activeEmergencies = emergencies.filter(e => e.Status !== 'Discharged').length;
  const scheduledSurgeries = surgeries.filter(s => s.Status === 'Scheduled' || s.Status === 'In Progress' || s.Status === 'Pre-Op Ready').length;

  const t = (k, def) => (typeof i18n !== 'undefined' ? i18n.t(k, def) : def);
  const isKh = typeof i18n !== 'undefined' && i18n.currentLang === 'kh';
  const asOfDate = isKh ? '២០ មីនា ២០២៦' : 'March 20, 2026';

  // Dynamic Department Stats mapped through Doctors
  const docToDeptMap = {};
  doctors.forEach(d => {
    docToDeptMap[d.DoctorID] = d.DepartmentID;
  });

  const deptCountMap = {
    'DEP-001': { name: isKh ? 'វេជ្ជសាស្ត្រទូទៅ' : 'General Medicine', color: 'bg-teal-500', count: 0 },
    'DEP-002': { name: isKh ? 'ជំងឺបេះដូង' : 'Cardiology', color: 'bg-sky-500', count: 0 },
    'DEP-003': { name: isKh ? 'កុមារ' : 'Pediatrics', color: 'bg-purple-500', count: 0 },
    'DEP-004': { name: isKh ? 'ឆ្អឹង និងសន្លាក់' : 'Orthopedics', color: 'bg-indigo-500', count: 0 },
    'DEP-005': { name: isKh ? 'ក្រពេញ និងទឹកនោមផ្អែម' : 'Endocrinology', color: 'bg-amber-500', count: 0 }
  };
  visits.forEach(v => {
    const deptId = v.DepartmentID || docToDeptMap[v.DoctorID] || 'DEP-001';
    if (deptCountMap[deptId]) {
      deptCountMap[deptId].count++;
    } else {
      deptCountMap['DEP-001'].count++;
    }
  });

  // Filtered operational queues
  const todayApptsQueue = appointments
    .filter(a => a.AppointmentDate === todayStr || ['Scheduled', 'Confirmed', 'Checked In'].includes(a.Status))
    .slice(0, 5);

  const activeErQueue = emergencies
    .filter(e => e.Status === 'Active' || !['Discharged', 'Admitted to IPD'].includes(e.Status))
    .slice(0, 5);

  const activeAdmissionsQueue = admissions
    .filter(a => a.Status === 'Admitted')
    .slice(0, 5);

  const pendingLabsQueue = labResults
    .filter(l => ['Requested', 'Sample Collected', 'Processing'].includes(l.Status))
    .slice(0, 5);

  return `
    <div class="space-y-4">
      <!-- Dashboard Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 class="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>${t('executive_overview', 'Healthcare Executive Overview')}</span>
            <span class="text-xs font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">${t('system_dashboard', 'System Dashboard')}</span>
          </h1>
          <p class="text-xs text-slate-500">${t('overview_subtitle', 'Real-time operational KPIs, clinical pipeline, and acute telemetry.')}</p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs text-slate-500 font-medium">${t('as_of_today', 'As of Today:')} <strong class="text-slate-700">${asOfDate}</strong></span>
          <button onclick="startGuidedDemo()" class="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow-sm transition">
            <i data-lucide="play-circle" class="w-3.5 h-3.5"></i> ${t('guided_demo', 'Guided Demo')}
          </button>
        </div>
      </div>

      <!-- Real-Time Hospital Acute Telemetry Bar -->
      <div class="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-lg p-3 shadow-sm border border-slate-700/50 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span class="font-bold uppercase tracking-wider text-[11px] text-emerald-400">${isKh ? 'ស្ថានភាពមន្ទីរពេទ្យ:' : 'Hospital Status:'}</span>
            <span class="font-semibold text-slate-200">${isKh ? 'ដំណើរការប្រក្រតី (កម្រិតបៃតង)' : 'Normal Operations (Green Tier)'}</span>
          </div>
        </div>
        <div class="flex items-center gap-4 flex-wrap text-[11px]">
          <div class="flex items-center gap-1.5 text-slate-300">
            <i data-lucide="hotel" class="w-3.5 h-3.5 text-purple-400"></i>
            <span>${isKh ? 'អត្រាគ្រែសម្រាក:' : 'IPD Beds:'} <strong class="text-white">${occupiedBeds}/${totalBeds} (${bedOccupancyRate}%)</strong></span>
          </div>
          <div class="flex items-center gap-1.5 text-slate-300">
            <i data-lucide="siren" class="w-3.5 h-3.5 text-rose-400"></i>
            <span>${isKh ? 'សង្គ្រោះបន្ទាន់:' : 'ER Acute:'} <strong class="text-rose-300">${activeEmergencies} ${isKh ? 'ករណីសកម្ម' : 'Active'}</strong></span>
          </div>
          <div class="flex items-center gap-1.5 text-slate-300">
            <i data-lucide="scissors" class="w-3.5 h-3.5 text-amber-400"></i>
            <span>${isKh ? 'បន្ទប់វះកាត់:' : 'OR Suites:'} <strong class="text-amber-300">1 In Surgery &bull; 2 Ready</strong></span>
          </div>
          <div class="flex items-center gap-1.5 text-slate-300">
            <i data-lucide="sparkles" class="w-3.5 h-3.5 text-emerald-400"></i>
            <span>${isKh ? 'ឧបករណ៍មាប់មគ CSSD:' : 'Sterile Trays:'} <strong class="text-emerald-300">8 Ready (100%)</strong></span>
          </div>
        </div>
      </div>

      <!-- Quick Action Shortcuts -->
      <div class="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto custom-scrollbar text-xs">
        <span class="text-slate-400 font-semibold px-2 uppercase text-[10px] tracking-wider shrink-0">${isKh ? 'សកម្មភាពរហ័ស:' : 'Quick Actions:'}</span>
        <button onclick="quickCreate('patient')" class="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded font-semibold flex items-center gap-1.5 shrink-0 transition">
          <i data-lucide="user-plus" class="w-3.5 h-3.5"></i> ${isKh ? 'អ្នកជំងឺថ្មី' : 'New Patient'}
        </button>
        <button onclick="quickCreate('appointment')" class="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded font-semibold flex items-center gap-1.5 shrink-0 transition">
          <i data-lucide="calendar-plus" class="w-3.5 h-3.5"></i> ${isKh ? 'ការណាត់ជួប' : 'New Appointment'}
        </button>
        <button onclick="quickCreate('emergency')" class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded font-semibold flex items-center gap-1.5 shrink-0 transition">
          <i data-lucide="siren" class="w-3.5 h-3.5"></i> ${isKh ? 'សង្គ្រោះបន្ទាន់' : 'ER Triage Intake'}
        </button>
        <button onclick="quickCreate('visit')" class="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded font-semibold flex items-center gap-1.5 shrink-0 transition">
          <i data-lucide="stethoscope" class="w-3.5 h-3.5"></i> ${isKh ? 'ពិគ្រោះ OPD' : 'Start OPD Process'}
        </button>
        <button onclick="quickCreate('admission')" class="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded font-semibold flex items-center gap-1.5 shrink-0 transition">
          <i data-lucide="hotel" class="w-3.5 h-3.5"></i> ${isKh ? 'សម្រាកពេទ្យ' : 'IPD Admission'}
        </button>
        <button onclick="quickCreate('surgery')" class="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded font-semibold flex items-center gap-1.5 shrink-0 transition">
          <i data-lucide="scissors" class="w-3.5 h-3.5"></i> ${isKh ? 'កក់បន្ទប់វះកាត់' : 'Schedule Surgery'}
        </button>
      </div>

      <!-- 8 Key Operational & Clinical KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <!-- KPI 1: Total Patients -->
        <div onclick="navigateTo('patients')" class="bg-white p-3 rounded-lg border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-sm cursor-pointer transition">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-[11px] font-semibold uppercase tracking-wider">${t('total_patients', 'Total Patients')}</span>
            <div class="p-1.5 bg-blue-50 text-blue-600 rounded"><i data-lucide="users" class="w-4 h-4"></i></div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-slate-900">${totalPatients}</span>
            <span class="text-[11px] text-emerald-600 font-semibold">+12% ${t('this_month', 'this mo.')}</span>
          </div>
        </div>

        <!-- KPI 2: Today's Appointments -->
        <div onclick="navigateTo('appointments')" class="bg-white p-3 rounded-lg border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-sm cursor-pointer transition">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-[11px] font-semibold uppercase tracking-wider">${t('today_appts', "Today's Appointments")}</span>
            <div class="p-1.5 bg-indigo-50 text-indigo-600 rounded"><i data-lucide="calendar" class="w-4 h-4"></i></div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-slate-900">${todayAppts}</span>
            <span class="text-[11px] text-indigo-600 font-semibold">${t('active_queue', 'Active queue')}</span>
          </div>
        </div>

        <!-- KPI 3: Inpatient Bed Occupancy -->
        <div onclick="navigateTo('beds')" class="bg-white p-3 rounded-lg border border-slate-200 shadow-xs hover:border-purple-400 hover:shadow-sm cursor-pointer transition">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-[11px] font-semibold uppercase tracking-wider">${isKh ? 'អត្រាគ្រែសម្រាក' : 'IPD Bed Occupancy'}</span>
            <div class="p-1.5 bg-purple-50 text-purple-600 rounded"><i data-lucide="hotel" class="w-4 h-4"></i></div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-slate-900">${occupiedBeds} <span class="text-xs text-slate-400 font-normal">/ ${totalBeds}</span></span>
            <span class="text-[11px] text-purple-600 font-semibold">${bedOccupancyRate}% ${isKh ? 'ប្រើប្រាស់' : 'Occupied'}</span>
          </div>
        </div>

        <!-- KPI 4: Emergency ER Queue -->
        <div onclick="navigateTo('emergency')" class="bg-white p-3 rounded-lg border border-slate-200 shadow-xs hover:border-rose-400 hover:shadow-sm cursor-pointer transition">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-[11px] font-semibold uppercase tracking-wider">${isKh ? 'ករណីសង្គ្រោះបន្ទាន់' : 'Active ER Cases'}</span>
            <div class="p-1.5 bg-rose-50 text-rose-600 rounded"><i data-lucide="siren" class="w-4 h-4"></i></div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-slate-900">${activeEmergencies}</span>
            <span class="text-[11px] text-rose-600 font-semibold">${isKh ? 'ក្នុងកម្រិត ESI' : 'In triage/treatment'}</span>
          </div>
        </div>

        <!-- KPI 5: Completed OPD Visits -->
        <div onclick="navigateTo('visits')" class="bg-white p-3 rounded-lg border border-slate-200 shadow-xs hover:border-teal-400 hover:shadow-sm cursor-pointer transition">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-[11px] font-semibold uppercase tracking-wider">${t('completed_visits', 'Completed Visits')}</span>
            <div class="p-1.5 bg-teal-50 text-teal-600 rounded"><i data-lucide="check-circle-2" class="w-4 h-4"></i></div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-slate-900">${completedVisits}</span>
            <span class="text-[11px] text-teal-600 font-semibold">${t('fully_documented', 'Fully documented')}</span>
          </div>
        </div>

        <!-- KPI 6: Operation Theater Surgeries -->
        <div onclick="navigateTo('surgeries')" class="bg-white p-3 rounded-lg border border-slate-200 shadow-xs hover:border-amber-400 hover:shadow-sm cursor-pointer transition">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-[11px] font-semibold uppercase tracking-wider">${isKh ? 'ការវះកាត់ថ្ងៃនេះ' : 'OT Surgeries'}</span>
            <div class="p-1.5 bg-amber-50 text-amber-600 rounded"><i data-lucide="scissors" class="w-4 h-4"></i></div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-slate-900">${scheduledSurgeries}</span>
            <span class="text-[11px] text-amber-600 font-semibold">${isKh ? 'ក្នុងកាលវិភាគ OT' : 'Scheduled cases'}</span>
          </div>
        </div>

        <!-- KPI 7: Pending Lab Orders -->
        <div onclick="navigateTo('laboratory_results')" class="bg-white p-3 rounded-lg border border-slate-200 shadow-xs hover:border-cyan-400 hover:shadow-sm cursor-pointer transition">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-[11px] font-semibold uppercase tracking-wider">${t('critical_lab_alerts', 'Pending Lab Orders')}</span>
            <div class="p-1.5 bg-cyan-50 text-cyan-600 rounded"><i data-lucide="flask-conical" class="w-4 h-4"></i></div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-slate-900">${pendingLabs}</span>
            <span class="text-[11px] text-cyan-600 font-semibold">${isKh ? 'ក្នុងជួរតេស្ត' : 'In laboratory queue'}</span>
          </div>
        </div>

        <!-- KPI 8: Outstanding Balance -->
        <div onclick="navigateTo('billing')" class="bg-white p-3 rounded-lg border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-sm cursor-pointer transition">
          <div class="flex items-center justify-between text-slate-500">
            <span class="text-[11px] font-semibold uppercase tracking-wider">${t('outstanding_balance', 'Outstanding Balance')}</span>
            <div class="p-1.5 bg-emerald-50 text-emerald-600 rounded"><i data-lucide="dollar-sign" class="w-4 h-4"></i></div>
          </div>
          <div class="mt-2 flex items-baseline gap-2">
            <span class="text-2xl font-bold text-slate-900">$${totalOutstanding.toFixed(2)}</span>
            <span class="text-[11px] text-rose-600 font-semibold">${isKh ? 'មិនទាន់ទូទាត់' : 'Unpaid & partial'}</span>
          </div>
        </div>
      </div>

      <!-- Dynamics Interactive Visual Charts Section -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <!-- Chart 1: Appointments by Status -->
        <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="pie-chart" class="w-3.5 h-3.5 text-blue-600"></i> ${isKh ? 'ការណាត់ជួបតាមស្ថានភាព' : 'Appointments by Status'}
            </h3>
            <span class="text-[10px] text-slate-400">Total: ${appointments.length}</span>
          </div>
          <div class="space-y-2 text-xs">
            ${renderStatusBar('Completed', appointments.filter(a => a.Status === 'Completed').length, appointments.length, 'bg-emerald-500')}
            ${renderStatusBar('Checked In / In Progress', appointments.filter(a => ['Checked In', 'In Progress'].includes(a.Status)).length, appointments.length, 'bg-blue-500')}
            ${renderStatusBar('Scheduled / Confirmed', appointments.filter(a => ['Scheduled', 'Confirmed'].includes(a.Status)).length, appointments.length, 'bg-indigo-500')}
            ${renderStatusBar('Cancelled / No Show', appointments.filter(a => ['Cancelled', 'No Show'].includes(a.Status)).length, appointments.length, 'bg-rose-400')}
          </div>
        </div>

        <!-- Chart 2: Visits by Department (Dynamically Computed via Doctor mappings) -->
        <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="bar-chart-2" class="w-3.5 h-3.5 text-teal-600"></i> ${isKh ? 'ការពិគ្រោះតាមផ្នែក' : 'Visits by Department'}
            </h3>
            <span class="text-[10px] text-slate-400">Total: ${visits.length}</span>
          </div>
          <div class="space-y-2 text-xs">
            ${Object.values(deptCountMap).map(d => renderStatusBar(d.name, d.count, visits.length, d.color)).join('')}
          </div>
        </div>

        <!-- Chart 3: Financial & Invoice Status -->
        <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="receipt" class="w-3.5 h-3.5 text-emerald-600"></i> ${isKh ? 'ការទូទាត់ប្រាក់' : 'Payment Realization'}
            </h3>
            <span class="text-[10px] text-slate-400">${invoices.length} Invoices</span>
          </div>
          <div class="space-y-2 text-xs">
            ${renderStatusBar('Fully Paid', invoices.filter(i => i.PaymentStatus === 'Paid').length, invoices.length, 'bg-emerald-600')}
            ${renderStatusBar('Partially Paid', invoices.filter(i => i.PaymentStatus === 'Partially Paid').length, invoices.length, 'bg-amber-500')}
            ${renderStatusBar('Unpaid', invoices.filter(i => i.PaymentStatus === 'Unpaid').length, invoices.length, 'bg-rose-500')}
          </div>
          <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
            <span class="text-slate-500">${isKh ? 'ប្រាក់ចំណូលទទួលបាន:' : 'Collected Revenue:'}</span>
            <span class="text-emerald-700 font-bold">$${totalCollected.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <!-- Quick Triage Subgrids (Today's Appts, Emergency Queue, Inpatient Admissions, Pending Labs) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <!-- Subgrid 1: Today's Appointments Queue -->
        <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div class="px-4 py-2.5 bg-[#f8f9fa] border-b border-slate-200 flex items-center justify-between">
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="calendar" class="w-3.5 h-3.5 text-indigo-600"></i> ${isKh ? 'ជួរណាត់ជួបថ្ងៃនេះ' : "Today's Appointments Queue"}
            </h3>
            <button onclick="navigateTo('appointments')" class="text-xs text-blue-600 hover:underline font-semibold">View All &rarr;</button>
          </div>
          <div class="divide-y divide-slate-100 text-xs max-h-64 overflow-y-auto custom-scrollbar">
            ${todayApptsQueue.map(a => {
              const p = patients.find(pat => pat.PatientID === a.PatientID) || {};
              const d = DAL.findById('Doctors', a.DoctorID) || {};
              return `
                <div class="p-2.5 flex items-center justify-between hover:bg-slate-50 transition">
                  <div class="flex items-center gap-2.5">
                    <span class="font-mono font-bold text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">${a.StartTime}</span>
                    <div>
                      <p ${p.PatientID ? `onclick="openPatientRecord('${p.PatientID}')"` : ''} class="font-semibold text-slate-900 hover:text-blue-600 hover:underline cursor-pointer transition">${p.FirstName || ''} ${p.LastName || ''}</p>
                      <p class="text-[11px] text-slate-500">${d.DoctorName || a.DoctorID} &bull; ${a.AppointmentType}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    ${getStatusBadge(a.Status)}
                    ${a.Status === 'Scheduled' || a.Status === 'Confirmed' ? `
                      <button onclick="quickCheckIn('${a.AppointmentID}')" class="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold">Check In</button>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Subgrid 2: Active Emergency Room Triage Queue -->
        <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div class="px-4 py-2.5 bg-[#f8f9fa] border-b border-slate-200 flex items-center justify-between">
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="siren" class="w-3.5 h-3.5 text-rose-600"></i> ${isKh ? 'ជួរអ្នកជំងឺសង្គ្រោះបន្ទាន់' : 'Emergency Room (ER) Active Triage'}
            </h3>
            <button onclick="navigateTo('emergency')" class="text-xs text-rose-600 hover:underline font-semibold">View All &rarr;</button>
          </div>
          <div class="divide-y divide-slate-100 text-xs max-h-64 overflow-y-auto custom-scrollbar">
            ${activeErQueue.map(e => {
              const p = patients.find(pat => pat.PatientID === e.PatientID) || {};
              const bay = DAL.findById('EmergencyBays', e.BayID) || {};
              return `
                <div class="p-2.5 flex items-center justify-between hover:bg-rose-50/40 transition">
                  <div class="flex items-center gap-2.5">
                    <span class="font-bold text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">ESI-${e.EsiLevel || '2'}</span>
                    <div>
                      <p ${p.PatientID ? `onclick="openPatientRecord('${p.PatientID}')"` : ''} class="font-semibold text-slate-900 hover:text-rose-600 hover:underline cursor-pointer transition">${p.FirstName || ''} ${p.LastName || ''} <span class="text-slate-400 font-normal">(${e.EncounterNumber})</span></p>
                      <p class="text-[11px] text-slate-500">${bay.BayNumber || 'Bay Pending'} &bull; ${e.ChiefComplaint || 'Emergency Assessment'}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <button onclick="openEmergencyWorkflow('${e.EncounterID}')" class="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-semibold flex items-center gap-1">
                      <span>Triage</span> &rarr;
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Subgrid 3: Inpatient Admissions & Ward Occupancy -->
        <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div class="px-4 py-2.5 bg-[#f8f9fa] border-b border-slate-200 flex items-center justify-between">
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="hotel" class="w-3.5 h-3.5 text-purple-600"></i> ${isKh ? 'អ្នកជំងឺសម្រាកពេទ្យសកម្ម' : 'Active Inpatient (IPD) Admissions'}
            </h3>
            <button onclick="navigateTo('admissions')" class="text-xs text-purple-600 hover:underline font-semibold">View All &rarr;</button>
          </div>
          <div class="divide-y divide-slate-100 text-xs max-h-64 overflow-y-auto custom-scrollbar">
            ${activeAdmissionsQueue.map(adm => {
              const p = patients.find(pat => pat.PatientID === adm.PatientID) || {};
              const b = DAL.findById('Beds', adm.BedID) || {};
              return `
                <div class="p-2.5 flex items-center justify-between hover:bg-purple-50/40 transition">
                  <div>
                    <p ${p.PatientID ? `onclick="openPatientRecord('${p.PatientID}')"` : ''} class="font-semibold text-slate-900 hover:text-purple-600 hover:underline cursor-pointer transition">${p.FirstName || ''} ${p.LastName || ''} <span class="text-slate-400 font-normal">(${b.BedNumber || 'Bed Pending'})</span></p>
                    <p class="text-[11px] text-slate-500">${adm.AdmittingDiagnosis || 'Inpatient Care'} &bull; ${adm.TotalDays || 1} days</p>
                  </div>
                  <div class="flex items-center gap-2">
                    <button onclick="openIpdWorkflow('${adm.AdmissionID}')" class="px-2 py-0.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-semibold flex items-center gap-1">
                      <span>Rounds</span> &rarr;
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Subgrid 4: Pending Laboratory Results -->
        <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
          <div class="px-4 py-2.5 bg-[#f8f9fa] border-b border-slate-200 flex items-center justify-between">
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="flask-conical" class="w-3.5 h-3.5 text-cyan-600"></i> ${isKh ? 'លទ្ធផលមន្ទីរពិសោធន៍កំពុងរង់ចាំ' : 'Pending Laboratory Orders'}
            </h3>
            <button onclick="navigateTo('laboratory_results')" class="text-xs text-cyan-600 hover:underline font-semibold">View All &rarr;</button>
          </div>
          <div class="divide-y divide-slate-100 text-xs max-h-64 overflow-y-auto custom-scrollbar">
            ${pendingLabsQueue.map(l => {
              const p = patients.find(pat => pat.PatientID === l.PatientID) || {};
              return `
                <div class="p-2.5 flex items-center justify-between hover:bg-slate-50 transition">
                  <div>
                    <p class="font-semibold text-slate-900">${l.TestName}</p>
                    <p class="text-[11px] text-slate-500">Patient: <span ${p.PatientID ? `onclick="openPatientRecord('${p.PatientID}')"` : ''} class="font-semibold text-slate-700 hover:text-blue-600 hover:underline cursor-pointer">${p.FirstName || ''} ${p.LastName || ''}</span> &bull; Req: ${l.TestDate}</p>
                  </div>
                  <div class="flex items-center gap-2">
                    ${getStatusBadge(l.Status)}
                    <button onclick="openEnterLabResultModal('${l.ResultID}')" class="px-2 py-0.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-[11px] font-semibold">Enter Result</button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Operational Theater (OT) Suites & CSSD Live Status -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div class="px-4 py-2.5 bg-[#f8f9fa] border-b border-slate-200 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i data-lucide="scissors" class="w-4 h-4 text-rose-600"></i>
            <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider">${isKh ? 'ស្ថានភាពបន្ទប់វះកាត់ និងសម្ភារៈមាប់មគ (OT & CSSD)' : 'Operation Theater Suites & Central Sterile (CSSD) Live Status'}</h3>
          </div>
          <div class="flex items-center gap-3">
            <button onclick="navigateTo('surgeries')" class="text-xs text-blue-600 hover:underline font-semibold">${isKh ? 'កាលវិភាគវះកាត់ទាំងអស់ &rarr;' : 'All OT Schedules &rarr;'}</button>
            <span class="text-slate-300">|</span>
            <button onclick="navigateTo('sterile_processing')" class="text-xs text-emerald-600 hover:underline font-semibold">${isKh ? 'គ្រប់គ្រង CSSD &rarr;' : 'Manage CSSD &rarr;'}</button>
          </div>
        </div>
        <div class="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <!-- OR Suite 1 -->
          <div class="p-3 rounded-lg border border-rose-200 bg-rose-50/30 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="font-bold text-slate-800">OR Suite 1 (General/Lap)</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 animate-pulse">In Surgery</span>
              </div>
              <p class="font-semibold text-slate-900 text-[11px]">Appendectomy (STAT)</p>
              <p class="text-[10px] text-slate-500">Surgeon: Dr. Jenkins &bull; Anesth: Dr. Lang</p>
              <p class="text-[10px] text-slate-400 mt-1">Tray: CSSD-TRAY-001 (Sterile)</p>
            </div>
            <div class="mt-2.5 pt-2 border-t border-rose-100 flex items-center justify-between">
              <span class="text-[10px] text-rose-600 font-medium">Time Out Verified</span>
              <button onclick="openSurgeryWorkflow('SURG-002')" class="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-semibold">Workflow</button>
            </div>
          </div>

          <!-- OR Suite 2 -->
          <div class="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="font-bold text-slate-800">OR Suite 2 (Ortho Suite)</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Available</span>
              </div>
              <p class="font-semibold text-slate-900 text-[11px]">Next: ORIF Femur (13:00)</p>
              <p class="text-[10px] text-slate-500">Surgeon: Dr. David Kim &bull; Dual C-Arm</p>
              <p class="text-[10px] text-slate-400 mt-1">Tray: CSSD-TRAY-003 (Reserved)</p>
            </div>
            <div class="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
              <span class="text-[10px] text-emerald-600 font-medium">Pre-Op Ready</span>
              <button onclick="openSurgeryWorkflow('SURG-003')" class="px-2 py-0.5 bg-slate-700 hover:bg-slate-800 text-white rounded text-[10px] font-semibold">Details</button>
            </div>
          </div>

          <!-- OR Suite 3 -->
          <div class="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="font-bold text-slate-800">OR Suite 3 (Cardiac Suite)</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Available</span>
              </div>
              <p class="font-semibold text-slate-900 text-[11px]">Cleanroom ISO Class 5</p>
              <p class="text-[10px] text-slate-500">Cardiopulmonary Bypass (CPB) Ready</p>
              <p class="text-[10px] text-slate-400 mt-1">Trays: CSSD-TRAY-004/006</p>
            </div>
            <div class="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
              <span class="text-[10px] text-slate-500 font-medium">Turnover Verified</span>
              <button onclick="openSurgeryBookingModal()" class="px-2 py-0.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-semibold">+ Book</button>
            </div>
          </div>

          <!-- OR Suite 4 -->
          <div class="p-3 rounded-lg border border-amber-200 bg-amber-50/30 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <span class="font-bold text-slate-800">OR Suite 4 (Emergency OR)</span>
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">Turnover Sanitizing</span>
              </div>
              <p class="font-semibold text-slate-900 text-[11px]">Rapid Decontamination</p>
              <p class="text-[10px] text-slate-500">Nurse: Joyce Chen &bull; Airflow Cycle</p>
              <p class="text-[10px] text-slate-400 mt-1">Completion: ~15 mins</p>
            </div>
            <div class="mt-2.5 pt-2 border-t border-amber-200 flex items-center justify-between">
              <span class="text-[10px] text-amber-600 font-medium">Sanitizing Cycle</span>
              <button onclick="handleUpdateTheaterStatus('OT-004', 'Available')" class="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-semibold">Mark Ready</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderStatusBar(label, count, total, colorClass) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return `
    <div>
      <div class="flex justify-between text-slate-600 mb-0.5">
        <span>${label}</span>
        <span class="font-semibold text-slate-800">${count} (${pct}%)</span>
      </div>
      <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
        <div class="${colorClass} h-2 rounded-full" style="width: ${pct}%"></div>
      </div>
    </div>
  `;
}

// ==========================================
// 7. PATIENTS MODULE & DYNAMICS PROFILE VIEW
// ==========================================
function renderPatientsGrid() {
  const allPatients = DAL.find('Patients');
  const filtered = filterAndSortRecords(allPatients, ['FirstName', 'LastName', 'PatientNumber', 'PhoneNumber', 'Email', 'MedicalConditions']);

  return `
    <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-135px)]">
      <!-- Grid Header Bar -->
      <div class="p-3 bg-[#f8f9fa] border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <i data-lucide="users" class="w-4 h-4 text-blue-600"></i>
          <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Patients</span>
          <select onchange="handleViewFilterChange(this.value)" class="text-xs border border-slate-300 rounded px-2 py-1 bg-white font-medium text-slate-700">
            <option value="default" ${appState.selectedViewFilter === 'default' ? 'selected' : ''}>Active Patients (${allPatients.filter(p => p.PatientStatus === 'Active').length})</option>
            <option value="all" ${appState.selectedViewFilter === 'all' ? 'selected' : ''}>All Patients (${allPatients.length})</option>
            <option value="inactive" ${appState.selectedViewFilter === 'inactive' ? 'selected' : ''}>Inactive Patients (${allPatients.filter(p => p.PatientStatus === 'Inactive').length})</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <input type="text" placeholder="Filter patients..." value="${appState.searchTerm}" onkeyup="handleGridSearch(event)" class="text-xs border border-slate-300 rounded px-3 py-1 bg-white outline-none focus:border-blue-500 w-48">
          <span class="text-xs text-slate-500 font-medium">${filtered.length} records</span>
        </div>
      </div>

      <!-- Data Grid Table -->
      <div class="flex-1 overflow-auto custom-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-300 z-10 select-none">
            <tr>
              <th class="p-2.5 w-10 text-center"><input type="checkbox"></th>
              <th onclick="sortGrid('PatientNumber')" class="p-2.5 cursor-pointer hover:bg-slate-200">Patient Number ${renderSortIcon('PatientNumber')}</th>
              <th onclick="sortGrid('FirstName')" class="p-2.5 cursor-pointer hover:bg-slate-200">Full Name ${renderSortIcon('FirstName')}</th>
              <th class="p-2.5">Gender / Age</th>
              <th class="p-2.5">Phone Number</th>
              <th class="p-2.5">Blood Type</th>
              <th class="p-2.5">Allergies</th>
              <th class="p-2.5">Medical Conditions</th>
              <th class="p-2.5">Assigned Doctor</th>
              <th class="p-2.5">Status</th>
              <th class="p-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${filtered.map(pat => {
              const doc = DAL.findById('Doctors', pat.AssignedDoctorID) || {};
              return `
                <tr class="hover:bg-blue-50/50 transition cursor-pointer" onclick="openPatientRecord('${pat.PatientID}')">
                  <td class="p-2.5 text-center" onclick="event.stopPropagation()"><input type="checkbox"></td>
                  <td class="p-2.5 font-mono font-bold text-blue-700">${pat.PatientNumber}</td>
                  <td class="p-2.5 font-semibold text-slate-900">${pat.FirstName} ${pat.LastName}</td>
                  <td class="p-2.5 text-slate-600">${pat.Gender} / ${pat.Age} yrs</td>
                  <td class="p-2.5 text-slate-600">${pat.PhoneNumber}</td>
                  <td class="p-2.5 font-semibold text-slate-700">${pat.BloodType}</td>
                  <td class="p-2.5 text-rose-600 font-medium">${pat.Allergies || 'None'}</td>
                  <td class="p-2.5 text-slate-600 truncate max-w-xs">${pat.MedicalConditions || 'None'}</td>
                  <td class="p-2.5 text-slate-700 font-medium">${doc.DoctorName || pat.AssignedDoctorID || 'Unassigned'}</td>
                  <td class="p-2.5">${getStatusBadge(pat.PatientStatus)}</td>
                  <td class="p-2.5 text-right" onclick="event.stopPropagation()">
                    <button onclick="openPatientRecord('${pat.PatientID}')" class="px-2 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded text-[11px] font-semibold transition">Open</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      <!-- Status Footer -->
      <div class="p-2 bg-[#f8f9fa] border-t border-slate-200 text-[11px] text-slate-500 flex justify-between">
        <span>Active Model-driven View: Dynamics 365 Patient Entities</span>
        <span>Page 1 of 1</span>
      </div>
    </div>
  `;
}

function openPatientRecord(patientId) {
  const pat = DAL.findById('Patients', patientId);
  if (!pat) return;
  appState.selectedEntity = pat;
  appState.activeRecordType = 'Patients';
  appState.currentTab = 'summary';
  renderMainView();
  renderRibbon();
}

function renderPatientProfile(pat) {
  const doc = DAL.findById('Doctors', pat.AssignedDoctorID) || {};
  const relatedAppts = DAL.find('Appointments', { PatientID: pat.PatientID });
  const relatedVisits = DAL.find('Visits', { PatientID: pat.PatientID });
  const relatedDiagnoses = DAL.find('Diagnoses', { PatientID: pat.PatientID });
  const relatedRx = DAL.find('Prescriptions', { PatientID: pat.PatientID });
  const relatedLabs = DAL.find('LaboratoryResults', { PatientID: pat.PatientID });
  const relatedInvoices = DAL.find('Invoices', { PatientID: pat.PatientID });
  const relatedPayments = DAL.find('Payments', { PatientID: pat.PatientID });
  const relatedFollowups = DAL.find('FollowUps', { PatientID: pat.PatientID });

  return `
    <div class="space-y-3 pb-8">
      <!-- DYNAMICS RECORD HEADER -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-sm">
            ${pat.FirstName.charAt(0)}${pat.LastName.charAt(0)}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-xl font-bold text-slate-900">${pat.FirstName} ${pat.LastName}</h1>
              <span class="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">${pat.PatientNumber}</span>
            </div>
            <p class="text-xs text-slate-500">Registered: ${pat.RegistrationDate} &bull; ${pat.Gender}, ${pat.Age} years old &bull; DOB: ${pat.DateOfBirth}</p>
          </div>
        </div>

        <!-- Dynamics Top KPI Header Tiles -->
        <div class="flex items-center gap-4 text-xs border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-4">
          <div>
            <p class="text-[10px] text-slate-400 font-semibold uppercase">Status Reason</p>
            <p class="font-bold text-slate-800">${getStatusBadge(pat.PatientStatus)}</p>
          </div>
          <div>
            <p class="text-[10px] text-slate-400 font-semibold uppercase">Blood Group</p>
            <p class="font-bold text-slate-800 text-sm">${pat.BloodType}</p>
          </div>
          <div>
            <p class="text-[10px] text-slate-400 font-semibold uppercase">Assigned Doctor</p>
            <p class="font-semibold text-blue-700">${doc.DoctorName || 'Unassigned'}</p>
          </div>
          <div>
            <p class="text-[10px] text-slate-400 font-semibold uppercase">Encounters</p>
            <p class="font-bold text-slate-800 text-sm">${relatedVisits.length} visits</p>
          </div>
        </div>
      </div>

      <!-- BUSINESS PROCESS FLOW (BPF) STAGE TRACKER -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-xs p-2.5 overflow-x-auto custom-scrollbar">
        <div class="flex items-center min-w-[700px] text-xs font-semibold">
          <div class="bpf-step completed flex-1 py-1.5 px-4 flex items-center justify-center gap-1.5 text-white">
            <i data-lucide="check" class="w-3.5 h-3.5"></i> 1. Identify & Register
          </div>
          <div class="bpf-step completed flex-1 py-1.5 px-4 flex items-center justify-center gap-1.5 text-white">
            <i data-lucide="check" class="w-3.5 h-3.5"></i> 2. Schedule & Check-in
          </div>
          <div class="bpf-step active flex-1 py-1.5 px-4 flex items-center justify-center gap-1.5 text-white">
            <i data-lucide="activity" class="w-3.5 h-3.5"></i> 3. Clinical Consultation
          </div>
          <div class="bpf-step flex-1 py-1.5 px-4 flex items-center justify-center gap-1.5 text-slate-600">
            4. Diagnostics & Rx
          </div>
          <div class="bpf-step flex-1 py-1.5 px-4 flex items-center justify-center gap-1.5 text-slate-600">
            5. Billing & Discharge
          </div>
        </div>
      </div>

      <!-- FORM TABS (Summary, Clinical Profile, Timeline, Related Records, Admin) -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        <div class="flex border-b border-slate-200 bg-[#f8f9fa] px-4 text-xs font-semibold text-slate-600 select-none">
          <button onclick="setPatientTab('summary')" class="py-2.5 px-4 border-b-2 transition ${appState.currentTab === 'summary' ? 'border-[#0078d4] text-[#0078d4]' : 'border-transparent hover:text-slate-900'}">Summary</button>
          <button onclick="setPatientTab('clinical')" class="py-2.5 px-4 border-b-2 transition ${appState.currentTab === 'clinical' ? 'border-[#0078d4] text-[#0078d4]' : 'border-transparent hover:text-slate-900'}">Clinical Profile</button>
          <button onclick="setPatientTab('timeline')" class="py-2.5 px-4 border-b-2 transition ${appState.currentTab === 'timeline' ? 'border-[#0078d4] text-[#0078d4]' : 'border-transparent hover:text-slate-900'}">Timeline & Activities (${relatedVisits.length + relatedAppts.length + relatedRx.length})</button>
          <button onclick="setPatientTab('related')" class="py-2.5 px-4 border-b-2 transition ${appState.currentTab === 'related' ? 'border-[#0078d4] text-[#0078d4]' : 'border-transparent hover:text-slate-900'}">Related Records</button>
          <button onclick="setPatientTab('admin')" class="py-2.5 px-4 border-b-2 transition ${appState.currentTab === 'admin' ? 'border-[#0078d4] text-[#0078d4]' : 'border-transparent hover:text-slate-900'}">Administration</button>
        </div>

        <div class="p-5">
          ${renderPatientTabContent(pat, doc, relatedAppts, relatedVisits, relatedDiagnoses, relatedRx, relatedLabs, relatedInvoices, relatedPayments, relatedFollowups)}
        </div>
      </div>
    </div>
  `;
}

function setPatientTab(tabName) {
  appState.currentTab = tabName;
  renderMainView();
}

function renderPatientTabContent(pat, doc, appts, visits, diagnoses, rx, labs, invoices, payments, followups) {
  switch (appState.currentTab) {
    case 'summary':
      return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <!-- General Information Card -->
          <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <h3 class="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <i data-lucide="user" class="w-4 h-4 text-blue-600"></i> General Demographics
            </h3>
            <div class="grid grid-cols-2 gap-y-2">
              <span class="text-slate-500">First Name:</span><span class="font-semibold text-slate-800">${pat.FirstName}</span>
              <span class="text-slate-500">Last Name:</span><span class="font-semibold text-slate-800">${pat.LastName}</span>
              <span class="text-slate-500">Gender:</span><span class="font-semibold text-slate-800">${pat.Gender}</span>
              <span class="text-slate-500">Date of Birth:</span><span class="font-semibold text-slate-800">${pat.DateOfBirth} (${pat.Age} yrs)</span>
              <span class="text-slate-500">Phone:</span><span class="font-semibold text-slate-800">${pat.PhoneNumber}</span>
              <span class="text-slate-500">Email:</span><span class="font-semibold text-slate-800">${pat.Email || 'N/A'}</span>
              <span class="text-slate-500">Residential Address:</span><span class="font-semibold text-slate-800">${pat.Address || 'N/A'}</span>
            </div>
          </div>

          <!-- Emergency Contact & Primary Care -->
          <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
            <h3 class="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
              <i data-lucide="phone-call" class="w-4 h-4 text-emerald-600"></i> Emergency Contact & Care Team
            </h3>
            <div class="grid grid-cols-2 gap-y-2">
              <span class="text-slate-500">Emergency Contact:</span><span class="font-semibold text-slate-800">${pat.EmergencyContactName || 'N/A'}</span>
              <span class="text-slate-500">Emergency Phone:</span><span class="font-semibold text-slate-800">${pat.EmergencyContactPhone || 'N/A'}</span>
              <span class="text-slate-500">Attending Physician:</span><span class="font-semibold text-blue-700">${doc.DoctorName || 'Not Assigned'}</span>
              <span class="text-slate-500">Department:</span><span class="font-semibold text-slate-800">General Medicine</span>
              <span class="text-slate-500">Special Notes:</span><span class="font-semibold text-slate-800">${pat.Notes || 'None'}</span>
            </div>
          </div>
        </div>
      `;

    case 'clinical':
      return `
        <div class="space-y-4 text-xs">
          <!-- Alert Banner for Allergies -->
          <div class="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-3">
            <i data-lucide="alert-triangle" class="w-5 h-5 text-rose-600 flex-shrink-0"></i>
            <div>
              <p class="font-bold text-rose-800">Critical Medical Allergies:</p>
              <p class="text-rose-700 font-semibold">${pat.Allergies || 'No Known Drug Allergies (NKDA)'}</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Medical Conditions -->
            <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <h3 class="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <i data-lucide="activity" class="w-4 h-4 text-rose-600"></i> Active Medical Conditions
              </h3>
              <p class="text-slate-700 leading-relaxed">${pat.MedicalConditions || 'No chronic conditions documented.'}</p>
            </div>

            <!-- Active Medications -->
            <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
              <h3 class="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <i data-lucide="pill" class="w-4 h-4 text-amber-600"></i> Current Prescriptions & Medications
              </h3>
              ${rx.length > 0 ? `
                <ul class="space-y-1 divide-y divide-slate-200">
                  ${rx.map(r => `
                    <li class="pt-1 flex justify-between">
                      <span class="font-semibold text-slate-800">${r.PrescriptionNumber} (${r.PrescriptionDate})</span>
                      <span>${getStatusBadge(r.Status)}</span>
                    </li>
                  `).join('')}
                </ul>
              ` : '<p class="text-slate-500">No active prescriptions.</p>'}
            </div>
          </div>
        </div>
      `;

    case 'timeline':
      // Combine timeline events: Visits, Appointments, Diagnoses, Prescriptions, Labs, Payments
      const events = [
        ...appts.map(a => ({ type: 'Appointment', date: a.AppointmentDate, title: `Appointment: ${a.ReasonForVisit}`, subtitle: `Status: ${a.Status} &bull; Time: ${a.StartTime}`, icon: 'calendar', color: 'text-indigo-600 bg-indigo-50' })),
        ...visits.map(v => ({ type: 'Visit', date: v.VisitDate, title: `Clinical Encounter: ${v.ChiefComplaint}`, subtitle: `Diagnosis: ${v.DiagnosisSummary} &bull; Status: ${v.VisitStatus}`, icon: 'stethoscope', color: 'text-teal-600 bg-teal-50' })),
        ...diagnoses.map(d => ({ type: 'Diagnosis', date: d.DiagnosisDate, title: `Diagnosis: ${d.Diagnosis} [${d.DiagnosisCode}]`, subtitle: `Severity: ${d.Severity}`, icon: 'activity', color: 'text-rose-600 bg-rose-50' })),
        ...rx.map(r => ({ type: 'Prescription', date: r.PrescriptionDate, title: `Prescription Issued: ${r.PrescriptionNumber}`, subtitle: `Status: ${r.Status} &bull; ${r.Instructions}`, icon: 'pill', color: 'text-amber-600 bg-amber-50' })),
        ...labs.map(l => ({ type: 'Lab Test', date: l.TestDate, title: `Lab Result: ${l.TestName}`, subtitle: `Result: ${l.Result} &bull; Interpretation: ${l.Interpretation || 'Pending'}`, icon: 'flask-conical', color: 'text-purple-600 bg-purple-50' })),
        ...payments.map(p => ({ type: 'Payment', date: p.PaymentDate, title: `Payment Received: $${p.Amount.toFixed(2)}`, subtitle: `Method: ${p.PaymentMethod} &bull; Ref: ${p.ReferenceNumber}`, icon: 'credit-card', color: 'text-emerald-600 bg-emerald-50' }))
      ];
      // Sort chronologically descending
      events.sort((a, b) => new Date(b.date) - new Date(a.date));

      return `
        <div class="space-y-3 text-xs max-w-2xl">
          <div class="flex items-center justify-between border-b border-slate-200 pb-2">
            <span class="font-bold text-slate-800 uppercase tracking-wider">Patient Chronological Timeline (${events.length} entries)</span>
          </div>
          <div class="relative border-l-2 border-slate-200 ml-3 pl-4 space-y-4">
            ${events.map(ev => `
              <div class="relative">
                <div class="absolute -left-[23px] top-0.5 p-1 rounded-full ${ev.color} border border-slate-300">
                  <i data-lucide="${ev.icon}" class="w-3 h-3"></i>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-semibold">${ev.date} &bull; ${ev.type}</span>
                  <p class="font-bold text-slate-900">${ev.title}</p>
                  <p class="text-slate-600 text-[11px]">${ev.subtitle}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;

    case 'related':
      return `
        <div class="space-y-6 text-xs">
          <!-- Subgrid: Visits -->
          <div>
            <h4 class="font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <i data-lucide="stethoscope" class="w-3.5 h-3.5 text-teal-600"></i> Encounters & Visits (${visits.length})
            </h4>
            ${renderSubgridTable(['Visit Date', 'Chief Complaint', 'Diagnosis', 'Status'], visits.map(v => [v.VisitDate, v.ChiefComplaint, v.DiagnosisSummary, getStatusBadge(v.VisitStatus)]))}
          </div>

          <!-- Subgrid: Prescriptions -->
          <div>
            <h4 class="font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <i data-lucide="file-text" class="w-3.5 h-3.5 text-amber-600"></i> Prescriptions (${rx.length})
            </h4>
            ${renderSubgridTable(['Rx Number', 'Date', 'Instructions', 'Status'], rx.map(r => [r.PrescriptionNumber, r.PrescriptionDate, r.Instructions, getStatusBadge(r.Status)]))}
          </div>

          <!-- Subgrid: Invoices & Billing -->
          <div>
            <h4 class="font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <i data-lucide="receipt" class="w-3.5 h-3.5 text-emerald-600"></i> Billing Invoices (${invoices.length})
            </h4>
            ${renderSubgridTable(['Invoice #', 'Date', 'Total Amount', 'Amount Paid', 'Balance', 'Status'], invoices.map(i => [i.InvoiceNumber, i.InvoiceDate, `$${i.TotalAmount.toFixed(2)}`, `$${i.AmountPaid.toFixed(2)}`, `$${i.Balance.toFixed(2)}`, getStatusBadge(i.PaymentStatus)]))}
          </div>
        </div>
      `;

    case 'admin':
      return `
        <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-2 max-w-lg">
          <h3 class="font-bold text-slate-900 border-b border-slate-200 pb-1.5">System Audit & Record Metadata</h3>
          <div class="grid grid-cols-2 gap-y-2">
            <span class="text-slate-500">Entity Record ID:</span><span class="font-mono text-slate-800">${pat.PatientID}</span>
            <span class="text-slate-500">Record Created At:</span><span class="text-slate-800">${pat.CreatedAt || '2026-01-05'}</span>
            <span class="text-slate-500">Last Modified At:</span><span class="text-slate-800">${pat.UpdatedAt || '2026-01-05'}</span>
            <span class="text-slate-500">Owner / System Unit:</span><span class="text-slate-800">Metro General Hospital / EMR</span>
          </div>
        </div>
      `;
  }
}

function renderSubgridTable(headers, rows) {
  if (rows.length === 0) {
    return `<div class="p-3 bg-slate-50 border border-slate-200 rounded text-slate-500 text-xs">No records found.</div>`;
  }
  return `
    <div class="border border-slate-200 rounded-lg overflow-hidden">
      <table class="w-full text-left text-xs">
        <thead class="bg-slate-100 text-slate-700 text-[11px] uppercase tracking-wider border-b border-slate-200">
          <tr>
            ${headers.map(h => `<th class="p-2 font-semibold">${h}</th>`).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">
          ${rows.map(row => `
            <tr class="hover:bg-slate-50">
              ${row.map(col => `<td class="p-2 text-slate-700">${col}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ==========================================
// 8. APPOINTMENTS MODULE (LIST & CALENDAR)
// ==========================================
function renderAppointmentsGrid() {
  const allAppts = DAL.find('Appointments');
  const filtered = filterAndSortRecords(allAppts, ['AppointmentNumber', 'AppointmentDate', 'AppointmentType', 'Status', 'ReasonForVisit']);

  return `
    <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-135px)]">
      <div class="p-3 bg-[#f8f9fa] border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <i data-lucide="calendar" class="w-4 h-4 text-indigo-600"></i>
          <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Appointments</span>
          <select onchange="handleViewFilterChange(this.value)" class="text-xs border border-slate-300 rounded px-2 py-1 bg-white font-medium text-slate-700">
            <option value="default">All Appointments (${allAppts.length})</option>
            <option value="scheduled">Scheduled / Confirmed (${allAppts.filter(a => ['Scheduled', 'Confirmed'].includes(a.Status)).length})</option>
            <option value="completed">Completed (${allAppts.filter(a => a.Status === 'Completed').length})</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <input type="text" placeholder="Filter appointments..." value="${appState.searchTerm}" onkeyup="handleGridSearch(event)" class="text-xs border border-slate-300 rounded px-3 py-1 bg-white outline-none focus:border-blue-500 w-48">
          <button onclick="toggleCalendarView()" class="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded text-xs font-semibold">Calendar View</button>
        </div>
      </div>

      <div class="flex-1 overflow-auto custom-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-300 z-10 select-none">
            <tr>
              <th class="p-2.5">Appointment #</th>
              <th class="p-2.5">Patient</th>
              <th class="p-2.5">Doctor</th>
              <th class="p-2.5">Date & Time</th>
              <th class="p-2.5">Type</th>
              <th class="p-2.5">Reason for Visit</th>
              <th class="p-2.5">Status</th>
              <th class="p-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${filtered.map(a => {
              const p = DAL.findById('Patients', a.PatientID) || {};
              const d = DAL.findById('Doctors', a.DoctorID) || {};
              return `
                <tr class="hover:bg-slate-50 transition">
                  <td class="p-2.5 font-mono font-bold text-indigo-700">${a.AppointmentNumber}</td>
                  <td class="p-2.5 font-semibold text-slate-900">${p.FirstName || ''} ${p.LastName || ''} (${p.PatientNumber || a.PatientID})</td>
                  <td class="p-2.5 text-slate-700 font-medium">${d.DoctorName || a.DoctorID}</td>
                  <td class="p-2.5 text-slate-600 font-mono">${a.AppointmentDate} @ ${a.StartTime}-${a.EndTime}</td>
                  <td class="p-2.5 text-slate-600">${a.AppointmentType}</td>
                  <td class="p-2.5 text-slate-600 truncate max-w-xs">${a.ReasonForVisit}</td>
                  <td class="p-2.5">${getStatusBadge(a.Status)}</td>
                  <td class="p-2.5 text-right space-x-1">
                    ${['Scheduled', 'Confirmed'].includes(a.Status) ? `
                      <button onclick="quickCheckIn('${a.AppointmentID}')" class="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-semibold hover:bg-blue-700">Check In</button>
                    ` : ''}
                    <button onclick="openRescheduleModal('${a.AppointmentID}')" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold">Reschedule</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderAppointmentsCalendar() {
  const allAppts = DAL.find('Appointments');
  // Days of current demo week
  const days = ['2026-03-16', '2026-03-17', '2026-03-18', '2026-03-19', '2026-03-20', '2026-03-21', '2026-03-22'];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return `
    <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-135px)]">
      <div class="p-3 bg-[#f8f9fa] border-b border-slate-200 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i data-lucide="calendar-days" class="w-4 h-4 text-indigo-600"></i>
          <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Weekly Schedule View (March 16 - 22, 2026)</span>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="toggleCalendarView()" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold">Grid View</button>
          <button onclick="openCreateModal('appointments')" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold">+ Book Appointment</button>
        </div>
      </div>

      <!-- Calendar 7-Day Columns -->
      <div class="flex-1 grid grid-cols-7 divide-x divide-slate-200 overflow-y-auto custom-scrollbar">
        ${days.map((day, idx) => {
          const dayAppts = allAppts.filter(a => a.AppointmentDate === day);
          const isToday = day === '2026-03-20';
          return `
            <div class="flex flex-col min-w-[120px] ${isToday ? 'bg-blue-50/30' : 'bg-white'}">
              <div class="p-2 border-b border-slate-200 text-center ${isToday ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-700'}">
                <p class="text-[11px] font-semibold uppercase">${dayNames[idx]}</p>
                <p class="text-sm font-bold">${day.split('-')[2]}</p>
              </div>
              <div class="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar">
                ${dayAppts.map(a => {
                  const p = DAL.findById('Patients', a.PatientID) || {};
                  const d = DAL.findById('Doctors', a.DoctorID) || {};
                  return `
                    <div class="p-2 rounded border border-slate-200 bg-white shadow-2xs hover:border-blue-400 text-[11px] space-y-1">
                      <div class="flex justify-between items-center font-mono text-[10px] text-slate-500">
                        <span>${a.StartTime}</span>
                        ${getStatusBadge(a.Status)}
                      </div>
                      <p class="font-bold text-slate-900 truncate">${p.FirstName || ''} ${p.LastName || ''}</p>
                      <p class="text-[10px] text-slate-600 truncate">${d.DoctorName || a.DoctorID}</p>
                      ${['Scheduled', 'Confirmed'].includes(a.Status) ? `
                        <button onclick="quickCheckIn('${a.AppointmentID}')" class="w-full mt-1 py-0.5 bg-blue-600 text-white rounded text-[10px] font-semibold">Check In</button>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
                ${dayAppts.length === 0 ? '<p class="text-[10px] text-slate-400 text-center pt-4">No slots</p>' : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function toggleCalendarView() {
  appState.calendarMode = !appState.calendarMode;
  renderMainView();
  renderRibbon();
}

function quickCheckIn(appointmentId) {
  const appt = DAL.findById('Appointments', appointmentId);
  if (!appt) return;

  DAL.update('Appointments', appointmentId, { Status: 'Checked In' });

  // Auto-generate Visit / Encounter for the checked in patient
  const newVisit = {
    PatientID: appt.PatientID,
    AppointmentID: appt.AppointmentID,
    DoctorID: appt.DoctorID,
    VisitDate: appt.AppointmentDate,
    ChiefComplaint: appt.ReasonForVisit,
    ClinicalNotes: 'Patient checked in at front desk. Awaiting nurse triage.',
    DiagnosisSummary: '',
    TreatmentPlan: '',
    FollowUpDate: '',
    VisitStatus: 'Arrived'
  };
  DAL.create('Visits', newVisit);

  showToast(`Patient checked in! Visit record created.`, 'success');
  renderMainView();
}

// ==========================================
// 9. VISITS & CLINICAL MODULES
// ==========================================
// 9. VISITS & CLINICAL MODULES (OPD PROCESS)
// ==========================================
function getOpdStageBadge(stage, needsInvestigation) {
  const s = String(stage || 'Triage').trim();
  switch (s) {
    case 'Triage':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 gap-1"><i data-lucide="thermometer" class="w-3 h-3"></i> 1. Triage & Vitals</span>`;
    case 'Consultation':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 gap-1"><i data-lucide="stethoscope" class="w-3 h-3"></i> 2. Consultation</span>`;
    case 'Investigation':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 gap-1"><i data-lucide="scan" class="w-3 h-3"></i> 3. Investigation</span>`;
    case 'Prescription':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 gap-1"><i data-lucide="pill" class="w-3 h-3"></i> 4. Prescription</span>`;
    case 'Discharge':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 gap-1"><i data-lucide="check-circle" class="w-3 h-3"></i> 5. Discharge</span>`;
    case 'Completed':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300 gap-1"><i data-lucide="check" class="w-3 h-3 text-emerald-600"></i> Completed</span>`;
    default:
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">${s}</span>`;
  }
}

function renderVisitsGrid() {
  const allVisits = DAL.find('Visits');
  const filtered = filterAndSortRecords(allVisits, ['VisitID', 'ChiefComplaint', 'DiagnosisSummary', 'VisitStatus', 'OpdStage']);

  return `
    <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-135px)]">
      <div class="p-3 bg-[#f8f9fa] border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <i data-lucide="stethoscope" class="w-4 h-4 text-teal-600"></i>
          <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Outpatient Department (OPD) Encounters</span>
          <span class="text-[11px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">${allVisits.length} visits</span>
        </div>
        <div class="flex items-center gap-2">
          <input type="text" placeholder="Filter encounters..." value="${appState.searchTerm}" onkeyup="handleGridSearch(event)" class="text-xs border border-slate-300 rounded px-3 py-1 bg-white outline-none focus:border-blue-500 w-48">
          <button onclick="openNewVisitModal()" class="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs transition">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>Start OPD Encounter</span>
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-auto custom-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-300 z-10 select-none">
            <tr>
              <th class="p-2.5">Visit ID</th>
              <th class="p-2.5">Patient</th>
              <th class="p-2.5">Attending Doctor</th>
              <th class="p-2.5">Date</th>
              <th class="p-2.5">Chief Complaint</th>
              <th class="p-2.5">OPD Process Stage</th>
              <th class="p-2.5">Diagnosis</th>
              <th class="p-2.5">Status</th>
              <th class="p-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${filtered.map(v => {
              const p = DAL.findById('Patients', v.PatientID) || {};
              const d = DAL.findById('Doctors', v.DoctorID) || {};
              const stage = v.OpdStage || (v.VisitStatus === 'Completed' ? 'Completed' : (v.VisitStatus === 'In Consultation' ? 'Consultation' : 'Triage'));
              return `
                <tr class="hover:bg-slate-50 transition">
                  <td class="p-2.5 font-mono font-bold text-teal-700">${v.VisitID}</td>
                  <td class="p-2.5 font-semibold text-slate-900">${p.FirstName || ''} ${p.LastName || ''}</td>
                  <td class="p-2.5 text-slate-700">${d.DoctorName || v.DoctorID}</td>
                  <td class="p-2.5 text-slate-600 font-mono">${v.VisitDate}</td>
                  <td class="p-2.5 text-slate-600 truncate max-w-xs">${v.ChiefComplaint || 'Routine assessment'}</td>
                  <td class="p-2.5">${getOpdStageBadge(stage, v.NeedsInvestigation)}</td>
                  <td class="p-2.5 text-slate-800 font-semibold">${v.DiagnosisSummary || 'In Progress'}</td>
                  <td class="p-2.5">${getStatusBadge(v.VisitStatus)}</td>
                  <td class="p-2.5 text-right space-x-1 whitespace-nowrap">
                    <button onclick="openOpdWorkflow('${v.VisitID}')" class="px-2.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded text-[11px] font-semibold flex-inline items-center gap-1 shadow-2xs transition" title="Open Dynamics 365 OPD Clinical Workflow">
                      <i data-lucide="git-branch" class="w-3 h-3 inline-block"></i> OPD Process
                    </button>
                    <button onclick="openVitalsModal('${v.VisitID}')" class="px-2 py-1 bg-teal-50 border border-teal-200 text-teal-700 rounded text-[11px] font-semibold hover:bg-teal-100 transition">Vitals</button>
                    <button onclick="openConsultationModal('${v.VisitID}')" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition">Consult</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderMedicalHistoryGrid() {
  return renderVisitsGrid();
}

// ==========================================
// 9B. INPATIENT DEPARTMENT (IPD) PROCESS GRIDS
// ==========================================
function getIpdStageBadge(stage) {
  const s = String(stage || 'BedAssignment').trim();
  switch (s) {
    case 'BedAssignment':
    case 'Admission':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 gap-1"><i data-lucide="bed" class="w-3 h-3"></i> 1. Bed Assignment</span>`;
    case 'DailyRounds':
    case 'Rounds':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 gap-1"><i data-lucide="clipboard-list" class="w-3 h-3"></i> 2. Daily Rounds (SOAP)</span>`;
    case 'Investigations':
    case 'Orders':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 gap-1"><i data-lucide="microscope" class="w-3 h-3"></i> 3. IPD Orders</span>`;
    case 'MAR':
    case 'Medications':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300 gap-1"><i data-lucide="pill" class="w-3 h-3"></i> 4. Inpatient MAR</span>`;
    case 'Discharge':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 gap-1"><i data-lucide="log-out" class="w-3 h-3"></i> 5. Discharge Clearance</span>`;
    case 'Discharged':
    case 'Completed':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-300 gap-1"><i data-lucide="check-check" class="w-3 h-3 text-emerald-600"></i> Discharged</span>`;
    default:
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">${s}</span>`;
  }
}

function getInterpretationBadge(interp) {
  const i = String(interp || 'Normal').trim();
  switch (i) {
    case 'Normal':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Normal</span>`;
    case 'Abnormal':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">Abnormal</span>`;
    case 'Critical High':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white border border-rose-700 animate-pulse">Critical High</span>`;
    case 'Critical Low':
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white border border-purple-700 animate-pulse">Critical Low</span>`;
    default:
      return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">${i}</span>`;
  }
}

function renderAdmissionsGrid() {
  const allAdmissions = DAL.find('Admissions');
  const allBeds = DAL.find('Beds');
  const activeAdmissions = allAdmissions.filter(a => a.Status === 'Admitted');
  const dischargedAdmissions = allAdmissions.filter(a => a.Status === 'Discharged');
  const occupiedBeds = allBeds.filter(b => b.Status === 'Occupied');
  const occupancyRate = allBeds.length > 0 ? Math.round((occupiedBeds.length / allBeds.length) * 100) : 0;

  const filtered = filterAndSortRecords(allAdmissions, ['AdmissionID', 'AdmissionNumber', 'AdmittingDiagnosis', 'CurrentCondition', 'IpdStage', 'Status']);

  return `
    <div class="space-y-4">
      <!-- IPD KPI Summary Bar -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Inpatients</div>
            <div class="text-xl font-bold text-blue-700 mt-0.5">${activeAdmissions.length}</div>
            <div class="text-[10px] text-slate-400">Under Active Bed Care</div>
          </div>
          <div class="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <i data-lucide="bed" class="w-5 h-5"></i>
          </div>
        </div>

        <div class="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Discharged</div>
            <div class="text-xl font-bold text-emerald-700 mt-0.5">${dischargedAdmissions.length}</div>
            <div class="text-[10px] text-slate-400">Completed Stays</div>
          </div>
          <div class="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <i data-lucide="user-check" class="w-5 h-5"></i>
          </div>
        </div>

        <div class="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Occupancy Rate</div>
            <div class="text-xl font-bold text-indigo-700 mt-0.5">${occupancyRate}%</div>
            <div class="text-[10px] text-slate-400">${occupiedBeds.length} of ${allBeds.length} Beds Occupied</div>
          </div>
          <div class="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <i data-lucide="pie-chart" class="w-5 h-5"></i>
          </div>
        </div>

        <div class="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Available Beds</div>
            <div class="text-xl font-bold text-teal-700 mt-0.5">${allBeds.filter(b => b.Status === 'Available').length}</div>
            <div class="text-[10px] text-slate-400">Ready for Admission</div>
          </div>
          <div class="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <i data-lucide="check-circle-2" class="w-5 h-5"></i>
          </div>
        </div>
      </div>

      <!-- Main Admissions Table -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-235px)]">
        <div class="p-3 bg-[#f8f9fa] border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <i data-lucide="building-2" class="w-4 h-4 text-blue-700"></i>
            <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Inpatient Department (IPD) Admissions</span>
            <span class="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">${allAdmissions.length} admissions</span>
          </div>
          <div class="flex items-center gap-2">
            <input type="text" placeholder="Search admissions, beds, diagnosis..." value="${appState.searchTerm}" onkeyup="handleGridSearch(event)" class="text-xs border border-slate-300 rounded px-3 py-1 bg-white outline-none focus:border-blue-500 w-52">
            <button onclick="openNewAdmissionModal()" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs transition">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>New IPD Admission</span>
            </button>
            <button onclick="navigateTo('beds')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 border border-slate-300 transition" title="Manage Hospital Beds">
              <i data-lucide="layout-grid" class="w-3.5 h-3.5"></i>
              <span>Bed Layout</span>
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-auto custom-scrollbar">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-300 z-10 select-none">
              <tr>
                <th class="p-2.5">Admission ID</th>
                <th class="p-2.5">Patient</th>
                <th class="p-2.5">Ward & Bed</th>
                <th class="p-2.5">Attending Doctor</th>
                <th class="p-2.5">Admitted Date</th>
                <th class="p-2.5">Days</th>
                <th class="p-2.5">Admitting Diagnosis</th>
                <th class="p-2.5">Condition</th>
                <th class="p-2.5">IPD Process Stage</th>
                <th class="p-2.5">Status</th>
                <th class="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              ${filtered.map(a => {
                const pat = DAL.findById('Patients', a.PatientID) || {};
                const doc = DAL.findById('Doctors', a.DoctorID) || {};
                const bed = DAL.findById('Beds', a.BedID) || {};
                const days = a.TotalDays || Math.max(1, Math.ceil((new Date() - new Date(a.AdmissionDate)) / (1000 * 60 * 60 * 24)));
                const condColor = {
                  'Stable': 'bg-emerald-100 text-emerald-800 border-emerald-300',
                  'Guarded': 'bg-blue-100 text-blue-800 border-blue-300',
                  'Serious': 'bg-amber-100 text-amber-800 border-amber-300',
                  'Critical': 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                }[a.CurrentCondition] || 'bg-slate-100 text-slate-700 border-slate-200';

                const allResults = DAL.find('LaboratoryResults') || [];
                const orders = allResults.filter(r => 
                  r.VisitID === a.AdmissionID || 
                  (r.PatientID === a.PatientID && (
                    (a.SourceEncounterID && r.VisitID === a.SourceEncounterID) || 
                    (r.Notes && r.Notes.includes(a.AdmissionID)) ||
                    (r.Notes && r.Notes.includes('[IPD Order]'))
                  ))
                );
                const ordersCount = orders.length;
                const pendingOrders = orders.filter(o => o.Status !== 'Completed').length;

                const allSurgeries = DAL.find('Surgeries') || [];
                const admSurgeries = allSurgeries.filter(s => s.AdmissionID === a.AdmissionID || s.PatientID === a.PatientID);
                const hasActiveSurgery = admSurgeries.some(s => ['Scheduled', 'Pre-Op Ready', 'In Surgery', 'PACU Recovery'].includes(s.Status));

                return `
                  <tr class="hover:bg-slate-50 transition">
                    <td class="p-2.5 font-mono font-bold text-blue-700">${a.AdmissionNumber || a.AdmissionID}</td>
                    <td class="p-2.5 font-semibold text-slate-900">${pat.FirstName || ''} ${pat.LastName || ''} <span class="text-[10px] text-slate-400 font-mono">(${pat.PatientNumber || ''})</span></td>
                    <td class="p-2.5">
                      <span class="inline-flex items-center gap-1 font-semibold text-slate-800">
                        <i data-lucide="bed" class="w-3.5 h-3.5 text-blue-600"></i> ${bed.BedNumber || a.BedID}
                      </span>
                      <div class="text-[10px] text-slate-500">${bed.WardName || 'Hospital Ward'}</div>
                    </td>
                    <td class="p-2.5 text-slate-700">${doc.DoctorName || a.DoctorID}</td>
                    <td class="p-2.5 text-slate-600 font-mono">${a.AdmissionDate}</td>
                    <td class="p-2.5 font-mono font-bold text-indigo-700">${days}d</td>
                    <td class="p-2.5 text-slate-800 truncate max-w-xs font-medium">${a.AdmittingDiagnosis || 'General Inpatient Care'}</td>
                    <td class="p-2.5">
                      <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${condColor}">
                        ${a.CurrentCondition || 'Stable'}
                      </span>
                    </td>
                    <td class="p-2.5">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        ${getIpdStageBadge(a.IpdStage || (a.Status === 'Discharged' ? 'Discharged' : 'DailyRounds'))}
                        ${ordersCount > 0 ? `
                          <span class="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${pendingOrders > 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}" title="${ordersCount} Inpatient Orders (${pendingOrders} Pending)">
                            <i data-lucide="microscope" class="w-3 h-3 text-amber-700"></i> ${ordersCount} ${pendingOrders > 0 ? `<span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>` : ''}
                          </span>
                        ` : ''}
                        ${admSurgeries.length > 0 ? `
                          <span onclick="openSurgeryWorkflow('${admSurgeries[0].SurgeryID}'); event.stopPropagation();" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition ${hasActiveSurgery ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse hover:bg-rose-200' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}" title="Surgery: ${admSurgeries[0].ProcedureName} (${admSurgeries[0].Status})">
                            <i data-lucide="scissors" class="w-3 h-3 text-rose-600"></i> ${admSurgeries[0].Status}
                          </span>
                        ` : ''}
                      </div>
                    </td>
                    <td class="p-2.5">${getStatusBadge(a.Status)}</td>
                    <td class="p-2.5 text-right space-x-1 whitespace-nowrap">
                      <button onclick="openIpdWorkflow('${a.AdmissionID}')" class="px-2.5 py-1 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded text-[11px] font-semibold inline-flex items-center gap-1 shadow-2xs transition" title="Open Dynamics 365 IPD Clinical Workflow">
                        <i data-lucide="git-branch" class="w-3 h-3"></i> IPD Process
                      </button>
                      <button onclick="openSurgeryBookingModal('${a.AdmissionID}')" class="px-2 py-1 bg-rose-50 border border-rose-300 text-rose-800 hover:bg-rose-100 rounded text-[11px] font-semibold inline-flex items-center gap-1 shadow-2xs transition" title="Request Operation Theater / Book Surgery">
                        <i data-lucide="scissors" class="w-3 h-3 text-rose-600"></i> ${admSurgeries.length > 0 ? 'OT: ' + admSurgeries[0].Status : 'OT Request'}
                      </button>
                      <button onclick="openIpdWorkflow('${a.AdmissionID}', 'Investigations')" class="px-2 py-1 bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 rounded text-[11px] font-semibold inline-flex items-center gap-1 shadow-2xs transition" title="Direct Inpatient Diagnostic Orders">
                        <i data-lucide="microscope" class="w-3 h-3"></i> IPD Order ${ordersCount > 0 ? `<span class="px-1 py-0.2 rounded-full text-[9px] font-bold ${pendingOrders > 0 ? 'bg-amber-500 text-white animate-pulse' : 'bg-emerald-600 text-white'}">${ordersCount}</span>` : ''}
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderBedsGrid() {
  const allBeds = DAL.find('Beds');
  const allAdmissions = DAL.find('Admissions');
  const allPatients = DAL.find('Patients');

  // Filter state for ward & status
  if (!window._bedWardFilter) window._bedWardFilter = 'ALL';
  if (!window._bedStatusFilter) window._bedStatusFilter = 'ALL';

  const wards = ['ALL', 'Intensive Care Unit (ICU)', 'General Medical Ward A', 'Surgical Ward B', 'Private Deluxe Ward', 'Pediatric Ward'];
  const statuses = ['ALL', 'Available', 'Occupied', 'Cleaning', 'Maintenance'];

  let filteredBeds = allBeds;
  if (window._bedWardFilter !== 'ALL') {
    filteredBeds = filteredBeds.filter(b => b.WardName === window._bedWardFilter);
  }
  if (window._bedStatusFilter !== 'ALL') {
    filteredBeds = filteredBeds.filter(b => b.Status === window._bedStatusFilter);
  }
  if (appState.searchTerm) {
    const q = appState.searchTerm.toLowerCase();
    filteredBeds = filteredBeds.filter(b => (b.BedNumber && b.BedNumber.toLowerCase().includes(q)) || (b.WardName && b.WardName.toLowerCase().includes(q)) || (b.BedType && b.BedType.toLowerCase().includes(q)));
  }

  const occupiedCount = allBeds.filter(b => b.Status === 'Occupied').length;
  const availableCount = allBeds.filter(b => b.Status === 'Available').length;
  const cleaningCount = allBeds.filter(b => b.Status === 'Cleaning' || b.Status === 'Maintenance').length;

  return `
    <div class="space-y-4">
      <!-- Bed Management Header & Actions -->
      <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <i data-lucide="layout-grid" class="w-6 h-6"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-800">Hospital Ward & Bed Management</h3>
            <p class="text-[11px] text-slate-500">Real-time occupancy tracking, bed rates, and inpatient bed assignment</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 gap-1">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span> ${availableCount} Available
          </span>
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 gap-1">
            <span class="w-2 h-2 rounded-full bg-rose-500"></span> ${occupiedCount} Occupied
          </span>
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 gap-1">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span> ${cleaningCount} Cleaning / Maint.
          </span>
          <button onclick="openNewBedModal()" class="px-3 py-1.5 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs transition">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Hospital Bed
          </button>
          <button onclick="navigateTo('admissions')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 border border-slate-300 transition">
            <i data-lucide="users" class="w-3.5 h-3.5"></i> Inpatient Admissions
          </button>
        </div>
      </div>

      <!-- Filters Toolbar -->
      <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="font-bold text-slate-600 mr-1 flex items-center gap-1"><i data-lucide="filter" class="w-3.5 h-3.5"></i> Ward:</span>
          ${wards.map(w => {
            const label = w === 'ALL' ? 'All Wards' : w.replace('Intensive Care Unit (ICU)', 'ICU').replace('General Medical Ward A', 'Med-A').replace('Surgical Ward B', 'Surg-B').replace('Private Deluxe Ward', 'Deluxe').replace('Pediatric Ward', 'Pediatric');
            const isActive = window._bedWardFilter === w;
            return `
              <button onclick="window._bedWardFilter='${w}'; renderMainView();" class="px-2.5 py-1 rounded text-xs font-semibold transition ${isActive ? 'bg-blue-600 text-white shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                ${label}
              </button>
            `;
          }).join('')}
        </div>

        <div class="flex items-center gap-2">
          <span class="font-bold text-slate-600">Status:</span>
          <select onchange="window._bedStatusFilter=this.value; renderMainView();" class="border border-slate-300 rounded px-2 py-1 text-xs outline-none bg-white">
            ${statuses.map(st => `<option value="${st}" ${window._bedStatusFilter === st ? 'selected' : ''}>${st === 'ALL' ? 'All Statuses' : st}</option>`).join('')}
          </select>
          <input type="text" placeholder="Filter beds..." value="${appState.searchTerm}" onkeyup="handleGridSearch(event)" class="border border-slate-300 rounded px-2.5 py-1 text-xs outline-none w-36">
        </div>
      </div>

      <!-- Bed Cards Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        ${filteredBeds.map(b => {
          const isOccupied = b.Status === 'Occupied';
          const isAvailable = b.Status === 'Available';
          const isCleaning = b.Status === 'Cleaning' || b.Status === 'Maintenance';
          const adm = isOccupied ? allAdmissions.find(a => a.BedID === b.BedID && a.Status === 'Admitted') : null;
          const pat = adm ? allPatients.find(p => p.PatientID === adm.PatientID) : null;

          const cardBorder = isOccupied ? 'border-rose-300 bg-rose-50/20' : (isAvailable ? 'border-emerald-300 bg-emerald-50/20' : 'border-amber-300 bg-amber-50/20');
          const badgeClass = isOccupied ? 'bg-rose-100 text-rose-800 border-rose-300' : (isAvailable ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300');

          return `
            <div class="bg-white rounded-lg border ${cardBorder} shadow-2xs p-4 flex flex-col justify-between hover:shadow-md transition">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="font-mono font-bold text-sm text-slate-900 flex items-center gap-1.5">
                    <i data-lucide="bed" class="w-4 h-4 ${isOccupied ? 'text-rose-600' : (isAvailable ? 'text-emerald-600' : 'text-amber-600')}"></i>
                    ${b.BedNumber}
                  </span>
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${badgeClass}">
                    ${b.Status}
                  </span>
                </div>

                <div class="text-xs font-semibold text-slate-700">${b.WardName}</div>
                <div class="text-[11px] text-slate-500 mb-2">${b.BedType} &bull; <span class="font-mono font-semibold text-slate-800">$${parseFloat(b.DailyRate).toFixed(0)}/day</span></div>

                ${isOccupied && pat ? `
                  <div class="p-2.5 bg-rose-50/80 rounded border border-rose-200 text-xs space-y-1 mb-3">
                    <div class="font-bold text-rose-950 flex items-center justify-between">
                      <span>${pat.FirstName} ${pat.LastName}</span>
                      <span class="text-[10px] font-mono text-rose-700">${pat.PatientNumber}</span>
                    </div>
                    <div class="text-[11px] text-rose-800 truncate">Dx: ${adm.AdmittingDiagnosis || 'Inpatient Care'}</div>
                    <div class="text-[10px] text-rose-600 font-mono">Admitted: ${adm.AdmissionDate}</div>
                  </div>
                ` : `
                  <div class="p-2.5 ${isAvailable ? 'bg-emerald-50/60 border-emerald-200 text-emerald-800' : 'bg-amber-50/60 border-amber-200 text-amber-800'} rounded border text-xs mb-3">
                    ${isAvailable ? `
                      <div class="font-semibold flex items-center gap-1"><i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600"></i> Sanitized & Ready</div>
                      <div class="text-[10px] text-emerald-700">Immediate occupancy available</div>
                    ` : `
                      <div class="font-semibold flex items-center gap-1"><i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-600"></i> Housekeeping / Maintenance</div>
                      <div class="text-[10px] text-amber-700">Being sanitized and prepared</div>
                    `}
                  </div>
                `}
              </div>

              <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-xs">
                ${isOccupied && adm ? `
                  <button onclick="openIpdWorkflow('${adm.AdmissionID}')" class="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-[11px] flex items-center justify-center gap-1 transition">
                    <i data-lucide="git-branch" class="w-3 h-3"></i> IPD Workflow
                  </button>
                ` : isAvailable ? `
                  <button onclick="openNewAdmissionModal(null, null, null, null, '${b.BedID}')" class="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-[11px] flex items-center justify-center gap-1 transition">
                    <i data-lucide="user-plus" class="w-3 h-3"></i> Admit Patient
                  </button>
                ` : `
                  <button onclick="quickChangeBedStatus('${b.BedID}', 'Available')" class="flex-1 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded font-semibold text-[11px] flex items-center justify-center gap-1 transition">
                    <i data-lucide="check" class="w-3 h-3"></i> Mark Ready
                  </button>
                `}
                
                <div class="relative inline-block">
                  <select onchange="quickChangeBedStatus('${b.BedID}', this.value)" class="text-[10px] font-semibold border border-slate-300 rounded px-1.5 py-1 text-slate-600 bg-white outline-none" title="Quick change status">
                    <option value="" disabled selected>Status</option>
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Cleaning">Cleaning</option>
                    <option value="Maintenance">Maint.</option>
                  </select>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderDiagnosesGrid() {
  const diagnoses = DAL.find('Diagnoses');
  const filtered = filterAndSortRecords(diagnoses, ['Diagnosis', 'DiagnosisCode', 'Severity', 'DiagnosisDate']);

  return `
    <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-135px)]">
      <div class="p-3 bg-[#f8f9fa] border-b border-slate-200 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i data-lucide="activity" class="w-4 h-4 text-rose-600"></i>
          <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Clinical Diagnoses (ICD Catalog)</span>
        </div>
        <button onclick="openCreateModal('diagnoses')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold">+ Add Diagnosis</button>
      </div>

      <div class="flex-1 overflow-auto custom-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-300 z-10">
            <tr>
              <th class="p-2.5">Diagnosis ID</th>
              <th class="p-2.5">Patient</th>
              <th class="p-2.5">ICD-10 Code</th>
              <th class="p-2.5">Clinical Condition</th>
              <th class="p-2.5">Severity</th>
              <th class="p-2.5">Date</th>
              <th class="p-2.5">Doctor</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${filtered.map(d => {
              const p = DAL.findById('Patients', d.PatientID) || {};
              const doc = DAL.findById('Doctors', d.DoctorID) || {};
              return `
                <tr class="hover:bg-slate-50">
                  <td class="p-2.5 font-mono text-slate-600">${d.DiagnosisID}</td>
                  <td class="p-2.5 font-semibold text-slate-900">${p.FirstName || ''} ${p.LastName || ''}</td>
                  <td class="p-2.5 font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded inline-block my-1.5">${d.DiagnosisCode}</td>
                  <td class="p-2.5 font-semibold text-slate-800">${d.Diagnosis}</td>
                  <td class="p-2.5">${getStatusBadge(d.Severity)}</td>
                  <td class="p-2.5 text-slate-600">${d.DiagnosisDate}</td>
                  <td class="p-2.5 text-slate-700">${doc.DoctorName || d.DoctorID}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ==========================================
// 10. PHARMACY & LABS MODULES
// ==========================================
function renderPrescriptionsGrid() {
  const rxList = DAL.find('Prescriptions');
  const filtered = filterAndSortRecords(rxList, ['PrescriptionNumber', 'Status', 'Instructions', 'PrescriptionDate']);

  return `
    <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-135px)]">
      <div class="p-3 bg-[#f8f9fa] border-b border-slate-200 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i data-lucide="file-text" class="w-4 h-4 text-amber-600"></i>
          <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Prescriptions & Pharmacy</span>
        </div>
        <button onclick="openCreateModal('prescriptions')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold">+ New Prescription</button>
      </div>

      <div class="flex-1 overflow-auto custom-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-300 z-10">
            <tr>
              <th class="p-2.5">Prescription #</th>
              <th class="p-2.5">Patient</th>
              <th class="p-2.5">Doctor</th>
              <th class="p-2.5">Date</th>
              <th class="p-2.5">Instructions</th>
              <th class="p-2.5">Status</th>
              <th class="p-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${filtered.map(r => {
              const p = DAL.findById('Patients', r.PatientID) || {};
              const d = DAL.findById('Doctors', r.DoctorID) || {};
              return `
                <tr class="hover:bg-slate-50">
                  <td class="p-2.5 font-mono font-bold text-amber-700">${r.PrescriptionNumber}</td>
                  <td class="p-2.5 font-semibold text-slate-900">${p.FirstName || ''} ${p.LastName || ''}</td>
                  <td class="p-2.5 text-slate-700">${d.DoctorName || r.DoctorID}</td>
                  <td class="p-2.5 text-slate-600">${r.PrescriptionDate}</td>
                  <td class="p-2.5 text-slate-600 truncate max-w-xs">${r.Instructions}</td>
                  <td class="p-2.5">${getStatusBadge(r.Status)}</td>
                  <td class="p-2.5 text-right">
                    ${r.Status === 'Active' ? `
                      <button onclick="dispensePrescription('${r.PrescriptionID}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold">Dispense</button>
                    ` : `<span class="text-[11px] text-slate-400 font-semibold">${r.DispensedBy || 'Completed'}</span>`}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function dispensePrescription(rxId) {
  const rx = DAL.findById('Prescriptions', rxId);
  if (!rx) return;

  DAL.update('Prescriptions', rxId, {
    Status: 'Dispensed',
    DispensedBy: appState.currentRole === 'Pharmacist' ? 'Todd Bradley, PharmD' : 'Pharmacist Staff',
    DispensedAt: new Date().toISOString()
  });

  // Deduct stock for prescription item
  const items = DAL.find('PrescriptionItems', { PrescriptionID: rxId });
  for (const it of items) {
    const med = DAL.findById('Medications', it.MedicationID);
    if (med && med.StockQuantity > 0) {
      const newStock = Math.max(0, med.StockQuantity - (it.Quantity || 1));
      const newStatus = newStock === 0 ? 'Out of Stock' : (newStock <= med.ReorderLevel ? 'Low Stock' : 'In Stock');
      DAL.update('Medications', it.MedicationID, { StockQuantity: newStock, Status: newStatus });
    }
  }

  showToast(`Prescription ${rx.PrescriptionNumber} dispensed! Inventory updated.`, 'success');
  renderMainView();
}

function renderMedicationsGrid() {
  const meds = DAL.find('Medications');
  const filtered = filterAndSortRecords(meds, ['MedicationName', 'GenericName', 'Category', 'Status']);

  return `
    <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-135px)]">
      <div class="p-3 bg-[#f8f9fa] border-b border-slate-200 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i data-lucide="pill" class="w-4 h-4 text-orange-600"></i>
          <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Medication Inventory</span>
        </div>
      </div>

      <div class="flex-1 overflow-auto custom-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-300 z-10">
            <tr>
              <th class="p-2.5">Medication Name</th>
              <th class="p-2.5">Generic Name</th>
              <th class="p-2.5">Category</th>
              <th class="p-2.5">Strength / Form</th>
              <th class="p-2.5">Unit Price</th>
              <th class="p-2.5">Stock Level</th>
              <th class="p-2.5">Reorder Level</th>
              <th class="p-2.5">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${filtered.map(m => `
              <tr class="hover:bg-slate-50">
                <td class="p-2.5 font-semibold text-slate-900">${m.MedicationName}</td>
                <td class="p-2.5 text-slate-600">${m.GenericName}</td>
                <td class="p-2.5 text-slate-600">${m.Category}</td>
                <td class="p-2.5 text-slate-700">${m.Strength} (${m.DosageForm})</td>
                <td class="p-2.5 font-semibold text-slate-900">$${m.UnitPrice.toFixed(2)}</td>
                <td class="p-2.5 font-bold ${m.StockQuantity <= m.ReorderLevel ? 'text-rose-600' : 'text-slate-800'}">${m.StockQuantity} ${m.Unit}</td>
                <td class="p-2.5 text-slate-500 font-mono">${m.ReorderLevel}</td>
                <td class="p-2.5">${getStatusBadge(m.Status)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderLabTestsGrid() {
  const tests = DAL.find('LaboratoryTests');
  return `
    <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-135px)]">
      <div class="p-3 bg-[#f8f9fa] border-b border-slate-200 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i data-lucide="flask-conical" class="w-4 h-4 text-purple-600"></i>
          <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Laboratory Tests Master</span>
        </div>
      </div>
      <div class="flex-1 overflow-auto custom-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-300 z-10">
            <tr>
              <th class="p-2.5">Test Code</th>
              <th class="p-2.5">Test Name</th>
              <th class="p-2.5">Category</th>
              <th class="p-2.5">Description</th>
              <th class="p-2.5">Normal Reference Range</th>
              <th class="p-2.5">Standard Cost</th>
              <th class="p-2.5">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${tests.map(t => `
              <tr class="hover:bg-slate-50">
                <td class="p-2.5 font-mono font-bold text-purple-700">${t.TestCode}</td>
                <td class="p-2.5 font-semibold text-slate-900">${t.TestName}</td>
                <td class="p-2.5 text-slate-600">${t.Category}</td>
                <td class="p-2.5 text-slate-600 truncate max-w-xs">${t.Description}</td>
                <td class="p-2.5 text-slate-700 font-mono">${t.NormalRange}</td>
                <td class="p-2.5 font-semibold text-slate-900">$${t.Cost.toFixed(2)}</td>
                <td class="p-2.5">${getStatusBadge(t.Status)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderLabResultsGrid() {
  const results = DAL.find('LaboratoryResults');
  const filtered = filterAndSortRecords(results, ['ResultID', 'TestName', 'Result', 'Status', 'Interpretation']);

  return `
    <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-135px)]">
      <div class="p-3 bg-[#f8f9fa] border-b border-slate-200 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i data-lucide="microscope" class="w-4 h-4 text-violet-600"></i>
          <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Laboratory Results</span>
        </div>
        <button onclick="openCreateModal('lab_results')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold">+ Request Lab Test</button>
      </div>

      <div class="flex-1 overflow-auto custom-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-300 z-10">
            <tr>
              <th class="p-2.5">Result ID</th>
              <th class="p-2.5">Patient</th>
              <th class="p-2.5">Test Name</th>
              <th class="p-2.5">Result Value</th>
              <th class="p-2.5">Reference Range</th>
              <th class="p-2.5">Interpretation</th>
              <th class="p-2.5">Status</th>
              <th class="p-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${filtered.map(r => {
              const p = DAL.findById('Patients', r.PatientID) || {};
              return `
                <tr class="hover:bg-slate-50">
                  <td class="p-2.5 font-mono text-slate-600">${r.ResultID}</td>
                  <td class="p-2.5 font-semibold text-slate-900">${p.FirstName || ''} ${p.LastName || ''}</td>
                  <td class="p-2.5 font-semibold text-violet-700">${r.TestName}</td>
                  <td class="p-2.5 font-mono text-slate-800">${r.Result}</td>
                  <td class="p-2.5 text-slate-500 font-mono text-[11px]">${r.ReferenceRange}</td>
                  <td class="p-2.5">${getStatusBadge(r.Interpretation || 'Pending')}</td>
                  <td class="p-2.5">${getStatusBadge(r.Status)}</td>
                  <td class="p-2.5 text-right">
                    ${r.Status !== 'Completed' ? `
                      <button onclick="openEnterLabResultModal('${r.ResultID}')" class="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-[11px] font-semibold">Enter Result</button>
                    ` : `<span class="text-[11px] text-slate-400 font-medium">${r.TechnicianName || 'Verified'}</span>`}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ==========================================
// 11. FINANCIAL & BILLING MODULES
// ==========================================
function renderBillingGrid() {
  const invoices = DAL.find('Invoices');
  const filtered = filterAndSortRecords(invoices, ['InvoiceNumber', 'PaymentStatus', 'InvoiceDate']);

  return `
    <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-135px)]">
      <div class="p-3 bg-[#f8f9fa] border-b border-slate-200 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i data-lucide="receipt" class="w-4 h-4 text-emerald-700"></i>
          <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Billing & Invoices</span>
        </div>
        <button onclick="openCreateModal('invoices')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold">+ Create Invoice</button>
      </div>

      <div class="flex-1 overflow-auto custom-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-300 z-10">
            <tr>
              <th class="p-2.5">Invoice #</th>
              <th class="p-2.5">Patient</th>
              <th class="p-2.5">Invoice Date</th>
              <th class="p-2.5">Total Amount</th>
              <th class="p-2.5">Amount Paid</th>
              <th class="p-2.5">Balance Due</th>
              <th class="p-2.5">Status</th>
              <th class="p-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${filtered.map(i => {
              const p = DAL.findById('Patients', i.PatientID) || {};
              return `
                <tr class="hover:bg-slate-50">
                  <td class="p-2.5 font-mono font-bold text-emerald-700">${i.InvoiceNumber}</td>
                  <td class="p-2.5 font-semibold text-slate-900">${p.FirstName || ''} ${p.LastName || ''}</td>
                  <td class="p-2.5 text-slate-600">${i.InvoiceDate}</td>
                  <td class="p-2.5 font-semibold text-slate-900">$${i.TotalAmount.toFixed(2)}</td>
                  <td class="p-2.5 text-emerald-700 font-semibold">$${i.AmountPaid.toFixed(2)}</td>
                  <td class="p-2.5 font-bold ${i.Balance > 0 ? 'text-rose-600' : 'text-slate-500'}">$${i.Balance.toFixed(2)}</td>
                  <td class="p-2.5">${getStatusBadge(i.PaymentStatus)}</td>
                  <td class="p-2.5 text-right">
                    ${i.Balance > 0 ? `
                      <button onclick="openRecordPaymentModal('${i.InvoiceID}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-semibold">Pay</button>
                    ` : `<span class="text-[11px] text-emerald-600 font-bold">Settled</span>`}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderPaymentsGrid() {
  const payments = DAL.find('Payments');
  const filtered = filterAndSortRecords(payments, ['PaymentID', 'PaymentMethod', 'ReferenceNumber', 'PaymentDate']);

  return `
    <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-135px)]">
      <div class="p-3 bg-[#f8f9fa] border-b border-slate-200 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i data-lucide="credit-card" class="w-4 h-4 text-teal-700"></i>
          <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Payment Transactions</span>
        </div>
      </div>

      <div class="flex-1 overflow-auto custom-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-300 z-10">
            <tr>
              <th class="p-2.5">Payment ID</th>
              <th class="p-2.5">Invoice #</th>
              <th class="p-2.5">Patient</th>
              <th class="p-2.5">Date</th>
              <th class="p-2.5">Amount Paid</th>
              <th class="p-2.5">Payment Method</th>
              <th class="p-2.5">Reference #</th>
              <th class="p-2.5">Received By</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${filtered.map(p => {
              const pat = DAL.findById('Patients', p.PatientID) || {};
              const inv = DAL.findById('Invoices', p.InvoiceID) || {};
              return `
                <tr class="hover:bg-slate-50">
                  <td class="p-2.5 font-mono text-slate-600">${p.PaymentID}</td>
                  <td class="p-2.5 font-mono font-semibold text-emerald-700">${inv.InvoiceNumber || p.InvoiceID}</td>
                  <td class="p-2.5 font-semibold text-slate-900">${pat.FirstName || ''} ${pat.LastName || ''}</td>
                  <td class="p-2.5 text-slate-600">${p.PaymentDate}</td>
                  <td class="p-2.5 font-bold text-emerald-700">$${p.Amount.toFixed(2)}</td>
                  <td class="p-2.5 font-semibold text-slate-800">${p.PaymentMethod}</td>
                  <td class="p-2.5 font-mono text-slate-600">${p.ReferenceNumber}</td>
                  <td class="p-2.5 text-slate-600">${p.ReceivedBy || 'Cashier'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ==========================================
// 12. DOCTORS, DEPARTMENTS & FOLLOW-UPS
// ==========================================
function renderDoctorsGrid() {
  const doctors = DAL.find('Doctors');
  return `
    <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-135px)]">
      <div class="p-3 bg-[#f8f9fa] border-b border-slate-200 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i data-lucide="user-check" class="w-4 h-4 text-blue-700"></i>
          <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Physicians & Medical Staff</span>
        </div>
      </div>
      <div class="flex-1 overflow-auto custom-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-300 z-10">
            <tr>
              <th class="p-2.5">Doctor ID</th>
              <th class="p-2.5">Doctor Name</th>
              <th class="p-2.5">Specialization</th>
              <th class="p-2.5">Department</th>
              <th class="p-2.5">License Number</th>
              <th class="p-2.5">Contact Info</th>
              <th class="p-2.5">Availability</th>
              <th class="p-2.5">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${doctors.map(d => {
              const dept = DAL.findById('Departments', d.DepartmentID) || {};
              return `
                <tr class="hover:bg-slate-50">
                  <td class="p-2.5 font-mono font-bold text-blue-700">${d.DoctorID}</td>
                  <td class="p-2.5 font-semibold text-slate-900">${d.DoctorName}</td>
                  <td class="p-2.5 text-slate-700">${d.Specialization}</td>
                  <td class="p-2.5 text-slate-700 font-medium">${dept.DepartmentName || d.DepartmentID}</td>
                  <td class="p-2.5 font-mono text-slate-600">${d.LicenseNumber}</td>
                  <td class="p-2.5 text-slate-600">${d.Phone} &bull; ${d.Email}</td>
                  <td class="p-2.5 font-semibold text-slate-700">${d.Availability}</td>
                  <td class="p-2.5">${getStatusBadge(d.Status)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderDepartmentsGrid() {
  const depts = DAL.find('Departments');
  return `
    <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-135px)]">
      <div class="p-3 bg-[#f8f9fa] border-b border-slate-200 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i data-lucide="building-2" class="w-4 h-4 text-cyan-700"></i>
          <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Hospital Clinical Departments</span>
        </div>
      </div>
      <div class="flex-1 overflow-auto custom-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-300 z-10">
            <tr>
              <th class="p-2.5">Code</th>
              <th class="p-2.5">Department Name</th>
              <th class="p-2.5">Location</th>
              <th class="p-2.5">Head Physician</th>
              <th class="p-2.5">Consultation Fee</th>
              <th class="p-2.5">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${depts.map(d => {
              const head = DAL.findById('Doctors', d.HeadDoctorID) || {};
              return `
                <tr class="hover:bg-slate-50">
                  <td class="p-2.5 font-mono font-bold text-cyan-700">${d.DepartmentCode}</td>
                  <td class="p-2.5 font-semibold text-slate-900">${d.DepartmentName}</td>
                  <td class="p-2.5 text-slate-600">${d.Building}, ${d.Floor}</td>
                  <td class="p-2.5 text-slate-700 font-medium">${head.DoctorName || 'Director'}</td>
                  <td class="p-2.5 font-semibold text-slate-900">$${d.ConsultationFee.toFixed(2)}</td>
                  <td class="p-2.5">${getStatusBadge(d.Status)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderFollowupsGrid() {
  const followups = DAL.find('FollowUps');
  const filtered = filterAndSortRecords(followups, ['FollowUpDate', 'Reason', 'Status']);

  return `
    <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-135px)]">
      <div class="p-3 bg-[#f8f9fa] border-b border-slate-200 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i data-lucide="bell-ring" class="w-4 h-4 text-rose-600"></i>
          <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Patient Follow-ups</span>
        </div>
        <button onclick="openCreateModal('followups')" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold">+ Schedule Follow-up</button>
      </div>

      <div class="flex-1 overflow-auto custom-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-300 z-10">
            <tr>
              <th class="p-2.5">Follow-up ID</th>
              <th class="p-2.5">Patient</th>
              <th class="p-2.5">Doctor</th>
              <th class="p-2.5">Target Date</th>
              <th class="p-2.5">Clinical Reason</th>
              <th class="p-2.5">Status</th>
              <th class="p-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${filtered.map(f => {
              const p = DAL.findById('Patients', f.PatientID) || {};
              const d = DAL.findById('Doctors', f.DoctorID) || {};
              return `
                <tr class="hover:bg-slate-50">
                  <td class="p-2.5 font-mono text-slate-600">${f.FollowUpID}</td>
                  <td class="p-2.5 font-semibold text-slate-900">${p.FirstName || ''} ${p.LastName || ''}</td>
                  <td class="p-2.5 text-slate-700">${d.DoctorName || f.DoctorID}</td>
                  <td class="p-2.5 font-bold text-slate-800">${f.FollowUpDate}</td>
                  <td class="p-2.5 text-slate-600 truncate max-w-xs">${f.Reason}</td>
                  <td class="p-2.5">${getStatusBadge(f.Status)}</td>
                  <td class="p-2.5 text-right">
                    ${f.Status === 'Pending' ? `
                      <button onclick="completeFollowup('${f.FollowUpID}')" class="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700">Complete</button>
                    ` : `<span class="text-[11px] text-slate-400">Done</span>`}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function completeFollowup(id) {
  DAL.update('FollowUps', id, { Status: 'Completed' });
  showToast('Follow-up marked as completed!', 'success');
  renderMainView();
}

// ==========================================
// 13. REPORTS & ADMINISTRATION
// ==========================================
function renderReportsView() {
  const visits = DAL.find('Visits');
  const invoices = DAL.find('Invoices');
  const totalRev = invoices.reduce((acc, i) => acc + (parseFloat(i.AmountPaid) || 0), 0);

  return `
    <div class="space-y-4">
      <div class="p-4 bg-white rounded-lg border border-slate-200 shadow-xs flex justify-between items-center">
        <div>
          <h2 class="text-base font-bold text-slate-900">Dynamics 365 Healthcare Reports</h2>
          <p class="text-xs text-slate-500">Summary analytics and financial statements.</p>
        </div>
        <button onclick="window.print()" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1.5">
          <i data-lucide="printer" class="w-3.5 h-3.5"></i> Print Full Report
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 bg-white rounded-lg border border-slate-200 shadow-xs space-y-3">
          <h3 class="font-bold text-xs uppercase tracking-wider text-slate-700">Clinical Encounters Summary</h3>
          <div class="text-xs space-y-1.5">
            <div class="flex justify-between border-b pb-1"><span>Total Patient Visits:</span><span class="font-bold">${visits.length}</span></div>
            <div class="flex justify-between border-b pb-1"><span>Completed Consultations:</span><span class="font-bold text-emerald-600">${visits.filter(v => v.VisitStatus === 'Completed').length}</span></div>
            <div class="flex justify-between border-b pb-1"><span>In Consultation:</span><span class="font-bold text-blue-600">${visits.filter(v => v.VisitStatus === 'In Consultation').length}</span></div>
          </div>
        </div>

        <div class="p-4 bg-white rounded-lg border border-slate-200 shadow-xs space-y-3">
          <h3 class="font-bold text-xs uppercase tracking-wider text-slate-700">Financial Revenue Statement</h3>
          <div class="text-xs space-y-1.5">
            <div class="flex justify-between border-b pb-1"><span>Invoices Issued:</span><span class="font-bold">${invoices.length}</span></div>
            <div class="flex justify-between border-b pb-1"><span>Total Invoiced:</span><span class="font-bold">$${invoices.reduce((acc, i) => acc + (parseFloat(i.TotalAmount) || 0), 0).toFixed(2)}</span></div>
            <div class="flex justify-between border-b pb-1"><span>Total Collected:</span><span class="font-bold text-emerald-700">$${totalRev.toFixed(2)}</span></div>
            <div class="flex justify-between border-b pb-1"><span>Outstanding Receivables:</span><span class="font-bold text-rose-600">$${invoices.reduce((acc, i) => acc + (parseFloat(i.Balance) || 0), 0).toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// 13. REPORTS, USERS & SECURITY ROLES
// ==========================================

function renderUsersGrid() {
  const users = DAL.find('Users');
  const filtered = filterAndSortRecords(users, ['FullName', 'Username', 'Email', 'Role', 'Status']);

  return `
    <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-135px)]">
      <!-- Grid Header Bar -->
      <div class="p-3 bg-[#f8f9fa] border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <i data-lucide="user-cog" class="w-4 h-4 text-blue-700"></i>
          <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">System Users & Accounts</span>
          <select onchange="handleViewFilterChange(this.value)" class="text-xs border border-slate-300 rounded px-2 py-1 bg-white font-medium text-slate-700">
            <option value="default">Active Users (${users.filter(u => u.Status === 'Active').length})</option>
            <option value="all">All Users (${users.length})</option>
            <option value="inactive">Inactive Users (${users.filter(u => u.Status === 'Inactive').length})</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <input type="text" placeholder="Filter users..." value="${appState.searchTerm}" onkeyup="handleGridSearch(event)" class="text-xs border border-slate-300 rounded px-3 py-1 bg-white outline-none focus:border-blue-500 w-48">
          <button onclick="openCreateUserModal()" class="px-2.5 py-1 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs">
            <i data-lucide="user-plus" class="w-3.5 h-3.5"></i>
            <span>Add User</span>
          </button>
        </div>
      </div>

      <!-- Data Grid Table -->
      <div class="flex-1 overflow-auto custom-scrollbar">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-300 z-10 select-none">
            <tr>
              <th class="p-2.5 w-10 text-center"><input type="checkbox"></th>
              <th class="p-2.5">User ID</th>
              <th class="p-2.5">Full Name & Username</th>
              <th class="p-2.5">Email</th>
              <th class="p-2.5">Security Role</th>
              <th class="p-2.5">Department</th>
              <th class="p-2.5">Doctor Association</th>
              <th class="p-2.5">Status</th>
              <th class="p-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${filtered.map(u => {
              const dept = DAL.findById('Departments', u.DepartmentID) || {};
              const doc = u.DoctorID ? (DAL.findById('Doctors', u.DoctorID) || {}) : null;
              return `
                <tr class="hover:bg-slate-50 transition">
                  <td class="p-2.5 text-center"><input type="checkbox"></td>
                  <td class="p-2.5 font-mono font-bold text-slate-600">${u.UserID}</td>
                  <td class="p-2.5">
                    <div class="flex items-center gap-2">
                      <div class="w-7 h-7 rounded-full bg-slate-700 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                        ${u.FullName.charAt(0)}
                      </div>
                      <div>
                        <p class="font-bold text-slate-900">${u.FullName}</p>
                        <p class="text-[11px] text-slate-500 font-mono">@${u.Username}</p>
                      </div>
                    </div>
                  </td>
                  <td class="p-2.5 text-slate-600">${u.Email}</td>
                  <td class="p-2.5">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${getRoleBadgeClass(u.Role)}">
                      ${u.Role}
                    </span>
                  </td>
                  <td class="p-2.5 text-slate-700">${dept.DepartmentName || 'General'}</td>
                  <td class="p-2.5 text-slate-600">${doc ? doc.DoctorName : '-'}</td>
                  <td class="p-2.5">${getStatusBadge(u.Status)}</td>
                  <td class="p-2.5 text-right space-x-1">
                    <button onclick="loginAsUser('${u.Username}')" class="px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded text-[11px] font-semibold hover:bg-blue-100 transition" title="Switch active session persona to this user">
                      Login As
                    </button>
                    <button onclick="openEditUserModal('${u.UserID}')" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition">
                      Edit
                    </button>
                    <button onclick="toggleUserStatus('${u.UserID}')" class="px-2 py-1 ${u.Status === 'Active' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'} rounded text-[11px] font-semibold transition">
                      ${u.Status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
      <!-- Status Footer -->
      <div class="p-2 bg-[#f8f9fa] border-t border-slate-200 text-[11px] text-slate-500 flex justify-between">
        <span>Microsoft Dynamics 365 Identity & Access Management</span>
        <span>Showing ${filtered.length} of ${users.length} users</span>
      </div>
    </div>
  `;
}

function getRoleBadgeClass(role) {
  switch (role) {
    case 'Administrator': return 'bg-slate-800 text-white';
    case 'Doctor': return 'bg-blue-100 text-blue-800 border border-blue-300';
    case 'Receptionist': return 'bg-sky-100 text-sky-800 border border-sky-300';
    case 'Nurse': return 'bg-teal-100 text-teal-800 border border-teal-300';
    case 'Pharmacist': return 'bg-amber-100 text-amber-800 border border-amber-300';
    case 'Accountant': return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
    default: return 'bg-slate-100 text-slate-700';
  }
}

function renderSecurityRolesGrid() {
  const roles = DAL.find('SecurityRoles');
  const users = DAL.find('Users');

  return `
    <div class="space-y-4 pb-8">
      <!-- Header Banner -->
      <div class="p-4 bg-white rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <i data-lucide="shield-check" class="w-5 h-5 text-cyan-700"></i>
            <span>Dynamics 365 Security Roles & Privileges</span>
          </h2>
          <p class="text-xs text-slate-500">Configure role-based access control (RBAC), sitemap visibility, and entity CRUD privileges.</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="navigateTo('users')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1">
            <i data-lucide="user-cog" class="w-3.5 h-3.5"></i> Manage Users
          </button>
        </div>
      </div>

      <!-- Security Roles Grid Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${roles.map(r => {
          const roleUsers = users.filter(u => u.Role === r.RoleName);
          const allowedCount = (USER_PERSONAS[r.RoleName] && USER_PERSONAS[r.RoleName].allowedViews) ? USER_PERSONAS[r.RoleName].allowedViews.length : (r.AllowedViews ? r.AllowedViews.length : 6);
          return `
            <div class="bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col justify-between hover:border-blue-400 transition">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${getRoleBadgeClass(r.RoleName)}">
                    ${r.RoleName}
                  </span>
                  <span class="text-[10px] font-semibold text-slate-500 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
                    Scope: ${r.Scope || 'Organization'}
                  </span>
                </div>
                <p class="text-xs text-slate-600 leading-relaxed mb-3">${r.Description}</p>
                <div class="bg-slate-50 p-2.5 rounded border border-slate-100 text-[11px] text-slate-700 space-y-1 mb-4">
                  <div class="flex justify-between">
                    <span class="text-slate-500">Assigned Users:</span>
                    <strong class="text-slate-900">${roleUsers.length} user${roleUsers.length !== 1 ? 's' : ''}</strong>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-500">Accessible Modules:</span>
                    <strong class="text-blue-700">${allowedCount} views</strong>
                  </div>
                </div>
              </div>
              <div class="pt-3 border-t border-slate-100 flex gap-2">
                <button onclick="openRolePrivilegesModal('${r.RoleName}')" class="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs transition">
                  <i data-lucide="sliders" class="w-3.5 h-3.5"></i> Configure Privileges
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

const ALL_MODULES = [
  { id: 'dashboard', label: 'Executive Dashboard', category: 'Workplace' },
  { id: 'patients', label: 'Patients & EMR', category: 'Clinical Care' },
  { id: 'appointments', label: 'Appointments & Scheduling', category: 'Clinical Care' },
  { id: 'visits', label: 'Visits & Encounters', category: 'Clinical Care' },
  { id: 'medical_history', label: 'Medical History Records', category: 'Clinical Care' },
  { id: 'diagnoses', label: 'Clinical Diagnoses (ICD-10)', category: 'Clinical Care' },
  { id: 'prescriptions', label: 'Prescriptions & Orders', category: 'Pharmacy & Labs' },
  { id: 'medications', label: 'Medication Inventory', category: 'Pharmacy & Labs' },
  { id: 'laboratory_tests', label: 'Laboratory Test Master', category: 'Pharmacy & Labs' },
  { id: 'laboratory_results', label: 'Laboratory Diagnostic Results', category: 'Pharmacy & Labs' },
  { id: 'billing', label: 'Billing & Invoices', category: 'Financials' },
  { id: 'payments', label: 'Cashier Payments & Receipts', category: 'Financials' },
  { id: 'doctors', label: 'Doctors & Staff Directory', category: 'Management' },
  { id: 'departments', label: 'Hospital Clinical Departments', category: 'Management' },
  { id: 'followups', label: 'Patient Follow-up Tracking', category: 'Management' },
  { id: 'reports', label: 'Executive & Operational Reports', category: 'Management' },
  { id: 'users', label: 'Users & Account Administration', category: 'System Security' },
  { id: 'security_roles', label: 'Security Roles & Privileges', category: 'System Security' },
  { id: 'administration', label: 'System Configuration & Cloud Sync', category: 'System Security' }
];

function openRolePrivilegesModal(roleName) {
  const role = USER_PERSONAS[roleName];
  if (!role) return;

  const currentAllowed = role.allowedViews || [];

  openModal(`
    <div class="px-6 py-4 bg-[#002050] text-white flex justify-between items-center">
      <div class="flex items-center gap-2">
        <i data-lucide="shield-check" class="w-5 h-5 text-cyan-400"></i>
        <div>
          <h3 class="font-bold text-sm">Configure Privileges: Security Role "${roleName}"</h3>
          <p class="text-[11px] text-slate-300">Microsoft Dynamics 365 Privilege Matrix & Sitemap Visibility</p>
        </div>
      </div>
      <button onclick="closeModal()" class="text-slate-300 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
    </div>

    <form onsubmit="handleSaveRolePrivileges(event, '${roleName}')" class="p-6 space-y-4 overflow-y-auto max-h-[75vh] custom-scrollbar text-xs">
      <div class="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900 leading-relaxed">
        <strong>Role-Based Access Control (RBAC):</strong><br>
        Check the modules and privileges granted to the <strong>${roleName}</strong> persona. Users assigned this role will only be able to view, access, and execute actions permitted below.
      </div>

      <div class="border border-slate-200 rounded-lg overflow-hidden">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-100 text-slate-700 text-[11px] uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th class="p-2.5">Module / Entity</th>
              <th class="p-2.5">Category</th>
              <th class="p-2.5 text-center">Allow Access</th>
              <th class="p-2.5 text-center">Privilege Level</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 bg-white">
            ${ALL_MODULES.map(m => {
              const isChecked = currentAllowed.includes(m.id);
              return `
                <tr class="hover:bg-slate-50">
                  <td class="p-2.5 font-bold text-slate-800">${m.label}</td>
                  <td class="p-2.5 text-slate-500 font-medium">${m.category}</td>
                  <td class="p-2.5 text-center">
                    <input type="checkbox" name="module_${m.id}" value="${m.id}" ${isChecked ? 'checked' : ''} class="w-4 h-4 rounded text-blue-600 cursor-pointer">
                  </td>
                  <td class="p-2.5 text-center">
                    <span class="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${isChecked ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}">
                      ${isChecked ? 'Read / Write / Create' : 'None'}
                    </span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <div class="pt-4 border-t flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded text-slate-600">Cancel</button>
        <button type="submit" class="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 shadow-sm">Save Privileges</button>
      </div>
    </form>
  `);
}

function handleSaveRolePrivileges(e, roleName) {
  e.preventDefault();
  const form = e.target;
  const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
  const allowed = Array.from(checkboxes).map(cb => cb.value);

  if (!allowed.includes('dashboard')) allowed.unshift('dashboard');

  if (USER_PERSONAS[roleName]) {
    USER_PERSONAS[roleName].allowedViews = allowed;
  }

  const roles = DAL.find('SecurityRoles');
  const existing = roles.find(r => r.RoleName === roleName);
  if (existing) {
    DAL.update('SecurityRoles', existing.RoleID, {
      AllowedViews: allowed,
      AllowedViewsJson: JSON.stringify(allowed)
    });
  }

  if (appState.currentRole === roleName) {
    handleRoleSwitch(roleName, false);
  }

  closeModal();
  showToast(`Security Role "${roleName}" privileges updated successfully!`, 'success');
  renderMainView();
}

function openCreateUserModal() {
  const depts = DAL.find('Departments');
  const docs = DAL.find('Doctors');
  const roles = DAL.find('SecurityRoles');

  openModal(`
    <div class="px-6 py-4 bg-[#002050] text-white flex justify-between items-center">
      <h3 class="font-bold text-sm flex items-center gap-2">
        <i data-lucide="user-plus" class="w-4 h-4 text-blue-400"></i> Create System User
      </h3>
      <button onclick="closeModal()" class="text-slate-300 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
    </div>
    <form onsubmit="handleCreateUser(event)" class="p-6 space-y-4 text-xs">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Username (Login ID) *</label>
          <input type="text" id="usr-username" required placeholder="e.g. dr.watson" class="w-full border border-slate-300 rounded p-2 font-mono">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Full Name *</label>
          <input type="text" id="usr-fullname" required placeholder="e.g. Dr. John Watson, MD" class="w-full border border-slate-300 rounded p-2">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Email Address *</label>
          <input type="email" id="usr-email" required placeholder="jwatson@metrohealth.demo" class="w-full border border-slate-300 rounded p-2">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Security Role *</label>
          <select id="usr-role" required onchange="handleUserRoleSelectionChange(this.value)" class="w-full border border-slate-300 rounded p-2 font-semibold text-blue-800">
            ${roles.map(r => `<option value="${r.RoleName}">${r.RoleName}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Clinical Department</label>
          <select id="usr-dept" class="w-full border border-slate-300 rounded p-2">
            <option value="">-- None / General --</option>
            ${depts.map(d => `<option value="${d.DepartmentID}">${d.DepartmentName}</option>`).join('')}
          </select>
        </div>
        <div id="usr-doc-group" style="display: none;">
          <label class="block font-semibold text-slate-700 mb-1">Link to Doctor Entity</label>
          <select id="usr-doctor" class="w-full border border-slate-300 rounded p-2">
            <option value="">-- None --</option>
            ${docs.map(d => `<option value="${d.DoctorID}">${d.DoctorName} (${d.Specialization})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Initial Password</label>
          <input type="password" id="usr-pass" value="demo123" required class="w-full border border-slate-300 rounded p-2 font-mono">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Status</label>
          <select id="usr-status" class="w-full border border-slate-300 rounded p-2">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>
      <div class="pt-4 border-t flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded text-slate-600">Cancel</button>
        <button type="submit" class="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">Create User</button>
      </div>
    </form>
  `);
}

function handleCreateUser(e) {
  e.preventDefault();
  const username = document.getElementById('usr-username').value.trim().toLowerCase();
  const fullName = document.getElementById('usr-fullname').value.trim();
  const email = document.getElementById('usr-email').value.trim();
  const role = document.getElementById('usr-role').value;
  const dept = document.getElementById('usr-dept').value;
  const docId = document.getElementById('usr-doctor') ? document.getElementById('usr-doctor').value : '';
  const status = document.getElementById('usr-status').value;

  const allUsers = DAL.find('Users');
  if (allUsers.some(u => u.Username.toLowerCase() === username)) {
    showToast(`Username "${username}" already exists. Please choose a unique username.`, 'error');
    return;
  }

  const newCount = allUsers.length + 1;
  const newUser = {
    UserID: `USR-${String(newCount).padStart(3, '0')}`,
    Username: username,
    FullName: fullName,
    Email: email,
    Role: role,
    DepartmentID: dept,
    DoctorID: docId,
    Status: status,
    LastLogin: 'Never'
  };

  DAL.create('Users', newUser);
  closeModal();
  showToast(`User ${fullName} (@${username}) created successfully!`, 'success');
  renderMainView();
}

function openEditUserModal(userId) {
  const user = DAL.findById('Users', userId);
  if (!user) return;
  const depts = DAL.find('Departments');
  const docs = DAL.find('Doctors');
  const roles = DAL.find('SecurityRoles');

  openModal(`
    <div class="px-6 py-4 bg-[#002050] text-white flex justify-between items-center">
      <h3 class="font-bold text-sm flex items-center gap-2">
        <i data-lucide="edit" class="w-4 h-4 text-blue-400"></i> Edit User: ${user.FullName}
      </h3>
      <button onclick="closeModal()" class="text-slate-300 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
    </div>
    <form onsubmit="handleEditUser(event, '${userId}')" class="p-6 space-y-4 text-xs">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Username (Login ID)</label>
          <input type="text" value="${user.Username}" disabled class="w-full border border-slate-200 rounded p-2 bg-slate-100 font-mono text-slate-600">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Full Name *</label>
          <input type="text" id="edit-usr-fullname" value="${user.FullName}" required class="w-full border border-slate-300 rounded p-2">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Email Address *</label>
          <input type="email" id="edit-usr-email" value="${user.Email}" required class="w-full border border-slate-300 rounded p-2">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Security Role *</label>
          <select id="edit-usr-role" required class="w-full border border-slate-300 rounded p-2 font-semibold text-blue-800">
            ${roles.map(r => `<option value="${r.RoleName}" ${user.Role === r.RoleName ? 'selected' : ''}>${r.RoleName}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Clinical Department</label>
          <select id="edit-usr-dept" class="w-full border border-slate-300 rounded p-2">
            <option value="">-- None / General --</option>
            ${depts.map(d => `<option value="${d.DepartmentID}" ${user.DepartmentID === d.DepartmentID ? 'selected' : ''}>${d.DepartmentName}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Link to Doctor Entity</label>
          <select id="edit-usr-doctor" class="w-full border border-slate-300 rounded p-2">
            <option value="">-- None --</option>
            ${docs.map(d => `<option value="${d.DoctorID}" ${user.DoctorID === d.DoctorID ? 'selected' : ''}>${d.DoctorName} (${d.Specialization})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Status</label>
          <select id="edit-usr-status" class="w-full border border-slate-300 rounded p-2">
            <option value="Active" ${user.Status === 'Active' ? 'selected' : ''}>Active</option>
            <option value="Inactive" ${user.Status === 'Inactive' ? 'selected' : ''}>Inactive</option>
          </select>
        </div>
      </div>
      <div class="pt-4 border-t flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded text-slate-600">Cancel</button>
        <button type="submit" class="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">Save Changes</button>
      </div>
    </form>
  `);
}

function handleEditUser(e, userId) {
  e.preventDefault();
  DAL.update('Users', userId, {
    FullName: document.getElementById('edit-usr-fullname').value.trim(),
    Email: document.getElementById('edit-usr-email').value.trim(),
    Role: document.getElementById('edit-usr-role').value,
    DepartmentID: document.getElementById('edit-usr-dept').value,
    DoctorID: document.getElementById('edit-usr-doctor').value,
    Status: document.getElementById('edit-usr-status').value
  });
  closeModal();
  showToast('User account updated successfully!', 'success');
  renderMainView();
}

function toggleUserStatus(userId) {
  const user = DAL.findById('Users', userId);
  if (!user) return;
  const newStatus = user.Status === 'Active' ? 'Inactive' : 'Active';
  DAL.update('Users', userId, { Status: newStatus });
  showToast(`User ${user.FullName} marked as ${newStatus}.`, 'info');
  renderMainView();
}

function loginAsUser(username) {
  const user = DAL.find('Users').find(u => u.Username === username);
  if (!user) return;

  DAL.update('Users', user.UserID, { LastLogin: new Date().toLocaleString() });

  handleRoleSwitch(user.Role, false);

  const nameDisplay = document.getElementById('user-name-display');
  const roleDisplay = document.getElementById('user-role-display');
  const avatar = document.getElementById('user-avatar-badge');
  if (nameDisplay) nameDisplay.textContent = user.FullName;
  if (roleDisplay) roleDisplay.textContent = `${user.Role} (@${user.Username})`;
  if (avatar) avatar.textContent = user.FullName.charAt(0);

  showToast(`Switched active session to: ${user.FullName} (${user.Role})`, 'success');
  navigateTo('dashboard');
}

function handleUserRoleSelectionChange(roleName) {
  const docGroup = document.getElementById('usr-doc-group');
  if (docGroup) {
    docGroup.style.display = (roleName === 'Doctor') ? 'block' : 'none';
  }
}

function renderAdministrationView() {
  return `
    <div class="space-y-4 max-w-3xl">
      <div class="p-4 bg-white rounded-lg border border-slate-200 shadow-xs">
        <h2 class="text-base font-bold text-slate-900 mb-1">System Configuration & Security Administration</h2>
        <p class="text-xs text-slate-500 mb-4">Manage system users, role privileges, Google Sheets connector, and synchronization settings.</p>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div onclick="navigateTo('users')" class="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-400 cursor-pointer transition">
            <div class="flex items-center gap-2 mb-1">
              <i data-lucide="user-cog" class="w-4 h-4 text-blue-700"></i>
              <span class="font-bold text-xs text-slate-800">User Management</span>
            </div>
            <p class="text-[11px] text-slate-500">Manage user accounts, assign roles, and view login sessions.</p>
          </div>
          <div onclick="navigateTo('security_roles')" class="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-400 cursor-pointer transition">
            <div class="flex items-center gap-2 mb-1">
              <i data-lucide="shield-check" class="w-4 h-4 text-cyan-700"></i>
              <span class="font-bold text-xs text-slate-800">Security Roles & Permissions</span>
            </div>
            <p class="text-[11px] text-slate-500">Configure role privilege matrices and sitemap module access.</p>
          </div>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Current Active Architecture</label>
            <p class="text-slate-600 bg-slate-50 p-2 rounded border border-slate-200 font-mono">
              Presentation Layer: Microsoft Dynamics 365 Model-driven SPA<br>
              Business Logic: Multi-tenant RBAC & Clinical Validation Rules<br>
              Data Access Layer: Swappable IRepository Pattern (Google Sheets & Dataverse ready)
            </p>
          </div>

          <div class="pt-2 flex gap-3">
            <button onclick="openSyncSettingsModal()" class="px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5">
              <i data-lucide="sheet" class="w-3.5 h-3.5"></i> Google Sheets Connection
            </button>
            <button onclick="resetPrototypeData()" class="px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded text-xs font-semibold hover:bg-rose-100 flex items-center gap-1.5">
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Reset Sample Data
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function resetPrototypeData() {
  if (confirm('Reset database to clean initial sample dataset?')) {
    DAL.seedInitialData();
    showToast('Database reset to fresh sample records!', 'success');
    renderMainView();
  }
}

// ==========================================
// 14. MODALS & FORMS (DYNAMICS STYLE)
// ==========================================
function openModal(htmlContent, sizeClass = '') {
  const container = document.getElementById('modal-container');
  const backdrop = document.getElementById('modal-backdrop');
  if (container && backdrop) {
    const size = sizeClass || 'max-w-5xl';
    container.className = `bg-white rounded-xl shadow-2xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-slate-300 animate-in fade-in zoom-in duration-100 ${size}`;
    container.innerHTML = htmlContent;
    backdrop.classList.remove('hidden');
    refreshIcons(container);
  }
}

function closeModal() {
  const backdrop = document.getElementById('modal-backdrop');
  const container = document.getElementById('modal-container');
  if (backdrop) backdrop.classList.add('hidden');
  if (container) container.innerHTML = '';
}

// Quick Create Dispatcher
function quickCreate(type) {
  closeQuickCreateMenu();
  openCreateModal(type);
}

function toggleQuickCreateMenu() {
  const menu = document.getElementById('quick-create-dropdown');
  if (menu) menu.classList.toggle('hidden');
}

function closeQuickCreateMenu() {
  const menu = document.getElementById('quick-create-dropdown');
  if (menu) menu.classList.add('hidden');
}

function openCreateModal(entityType) {
  if (entityType === 'user' || entityType === 'users') {
    openCreateUserModal();
    return;
  }
  if (entityType === 'security_role' || entityType === 'security_roles') {
    openRolePrivilegesModal('Administrator');
    return;
  }
  if (entityType === 'visit' || entityType === 'visits') {
    openNewVisitModal();
    return;
  }
  if (entityType === 'admission' || entityType === 'admissions') {
    openNewAdmissionModal();
    return;
  }
  if (entityType === 'bed' || entityType === 'beds') {
    openNewBedModal();
    return;
  }
  if (entityType === 'emergency' || entityType === 'emergencies' || entityType === 'emergency_encounter') {
    openNewEmergencyModal();
    return;
  }
  if (entityType === 'emergency_bay' || entityType === 'emergency_bays') {
    openNewEmergencyBayModal();
    return;
  }
  if (entityType === 'surgery' || entityType === 'surgeries') {
    openSurgeryBookingModal();
    return;
  }
  if (entityType === 'sterile_tray' || entityType === 'sterile_trays' || entityType === 'sterile_processing') {
    openNewSterileTrayModal();
    return;
  }

  const patients = DAL.find('Patients');
  const doctors = DAL.find('Doctors');

  if (entityType === 'patient' || entityType === 'patients') {
    const nextNum = `MRN-2026-${String(patients.length + 1).padStart(4, '0')}`;
    openModal(`
      <div class="px-6 py-4 bg-[#002050] text-white flex justify-between items-center">
        <h3 class="font-bold text-sm flex items-center gap-2"><i data-lucide="user-plus" class="w-4 h-4 text-blue-400"></i> Register New Patient</h3>
        <button onclick="closeModal()" class="text-slate-300 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
      </div>
      <form onsubmit="handleCreatePatient(event)" class="p-6 space-y-4 overflow-y-auto max-h-[75vh] custom-scrollbar text-xs">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Patient Number (MRN) *</label>
            <input type="text" id="new-pat-number" value="${nextNum}" required class="w-full border border-slate-300 rounded p-2 font-mono font-semibold">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Assigned Doctor</label>
            <select id="new-pat-doctor" class="w-full border border-slate-300 rounded p-2">
              <option value="">-- Select Doctor --</option>
              ${doctors.map(d => `<option value="${d.DoctorID}">${d.DoctorName} (${d.Specialization})</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">First Name *</label>
            <input type="text" id="new-pat-first" required class="w-full border border-slate-300 rounded p-2">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Last Name *</label>
            <input type="text" id="new-pat-last" required class="w-full border border-slate-300 rounded p-2">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Gender *</label>
            <select id="new-pat-gender" required class="w-full border border-slate-300 rounded p-2">
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Date of Birth *</label>
            <input type="date" id="new-pat-dob" value="1990-01-01" required class="w-full border border-slate-300 rounded p-2">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Phone Number *</label>
            <input type="text" id="new-pat-phone" placeholder="+1 (555) 000-0000" required class="w-full border border-slate-300 rounded p-2">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Blood Type</label>
            <select id="new-pat-blood" class="w-full border border-slate-300 rounded p-2">
              <option value="O+">O+</option>
              <option value="A+">A+</option>
              <option value="B+">B+</option>
              <option value="AB+">AB+</option>
              <option value="O-">O-</option>
              <option value="A-">A-</option>
              <option value="B-">B-</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
          <div class="col-span-2">
            <label class="block font-semibold text-slate-700 mb-1">Known Allergies</label>
            <input type="text" id="new-pat-allergies" placeholder="e.g. Penicillin, Peanuts (or None Known)" class="w-full border border-slate-300 rounded p-2">
          </div>
          <div class="col-span-2">
            <label class="block font-semibold text-slate-700 mb-1">Medical Conditions</label>
            <input type="text" id="new-pat-conditions" placeholder="e.g. Hypertension, Asthma" class="w-full border border-slate-300 rounded p-2">
          </div>
        </div>
        <div class="pt-4 border-t flex justify-end gap-2">
          <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded text-slate-600">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">Save Patient</button>
        </div>
      </form>
    `);
  } else if (entityType === 'appointment' || entityType === 'appointments') {
    openModal(`
      <div class="px-6 py-4 bg-[#002050] text-white flex justify-between items-center">
        <h3 class="font-bold text-sm flex items-center gap-2"><i data-lucide="calendar-plus" class="w-4 h-4 text-indigo-400"></i> Book Appointment</h3>
        <button onclick="closeModal()" class="text-slate-300 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
      </div>
      <form onsubmit="handleCreateAppointment(event)" class="p-6 space-y-4 text-xs">
        <div class="space-y-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Select Patient *</label>
            <select id="new-apt-patient" required class="w-full border border-slate-300 rounded p-2">
              <option value="">-- Choose Patient --</option>
              ${patients.map(p => `<option value="${p.PatientID}">${p.FirstName} ${p.LastName} (${p.PatientNumber})</option>`).join('')}
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Attending Doctor *</label>
            <select id="new-apt-doctor" required class="w-full border border-slate-300 rounded p-2">
              <option value="">-- Choose Doctor --</option>
              ${doctors.map(d => `<option value="${d.DoctorID}">${d.DoctorName} (${d.Specialization})</option>`).join('')}
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Appointment Date *</label>
              <input type="date" id="new-apt-date" value="2026-03-20" required class="w-full border border-slate-300 rounded p-2">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Start Time *</label>
              <select id="new-apt-time" required class="w-full border border-slate-300 rounded p-2">
                <option value="08:30">08:30 AM</option>
                <option value="09:15">09:15 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="13:30">01:30 PM</option>
                <option value="14:30">02:30 PM</option>
                <option value="15:30">03:30 PM</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Appointment Type</label>
            <select id="new-apt-type" class="w-full border border-slate-300 rounded p-2">
              <option value="General">General Consultation</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Specialist">Specialist Review</option>
              <option value="Checkup">Wellness Checkup</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Reason for Visit</label>
            <input type="text" id="new-apt-reason" placeholder="e.g. Chronic cough, BP review" required class="w-full border border-slate-300 rounded p-2">
          </div>
        </div>
        <div class="pt-4 border-t flex justify-end gap-2">
          <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded text-slate-600">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">Schedule</button>
        </div>
      </form>
    `);
  } else if (entityType === 'payment') {
    const invoices = DAL.find('Invoices').filter(i => i.Balance > 0);
    openModal(`
      <div class="px-6 py-4 bg-[#002050] text-white flex justify-between items-center">
        <h3 class="font-bold text-sm flex items-center gap-2"><i data-lucide="credit-card" class="w-4 h-4 text-emerald-400"></i> Record Cashier Payment</h3>
        <button onclick="closeModal()" class="text-slate-300 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
      </div>
      <form onsubmit="handleRecordPayment(event)" class="p-6 space-y-4 text-xs">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Select Outstanding Invoice *</label>
          <select id="pay-invoice-id" onchange="updatePaymentDueDisplay(this.value)" required class="w-full border border-slate-300 rounded p-2">
            <option value="">-- Select Invoice --</option>
            ${invoices.map(i => {
              const p = DAL.findById('Patients', i.PatientID) || {};
              return `<option value="${i.InvoiceID}">${i.InvoiceNumber} - ${p.FirstName} ${p.LastName} (Balance: $${i.Balance.toFixed(2)})</option>`;
            }).join('')}
          </select>
        </div>
        <div id="payment-due-banner" class="p-2 bg-slate-50 border rounded text-slate-700 font-medium">Select an invoice above to view balance due.</div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Amount to Pay ($) *</label>
            <input type="number" step="0.01" id="pay-amount" required class="w-full border border-slate-300 rounded p-2 font-bold">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Payment Method *</label>
            <select id="pay-method" required class="w-full border border-slate-300 rounded p-2">
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div class="pt-4 border-t flex justify-end gap-2">
          <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded text-slate-600">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700">Submit Payment</button>
        </div>
      </form>
    `);
  } else {
    showToast(`Quick create for ${entityType} is available in its module.`, 'info');
  }
}

function handleCreatePatient(e) {
  e.preventDefault();
  const patData = {
    PatientNumber: document.getElementById('new-pat-number').value.trim(),
    FirstName: document.getElementById('new-pat-first').value.trim(),
    LastName: document.getElementById('new-pat-last').value.trim(),
    Gender: document.getElementById('new-pat-gender').value,
    DateOfBirth: document.getElementById('new-pat-dob').value,
    Age: 2026 - parseInt(document.getElementById('new-pat-dob').value.split('-')[0]),
    PhoneNumber: document.getElementById('new-pat-phone').value.trim(),
    BloodType: document.getElementById('new-pat-blood').value,
    Allergies: document.getElementById('new-pat-allergies').value.trim(),
    MedicalConditions: document.getElementById('new-pat-conditions').value.trim(),
    AssignedDoctorID: document.getElementById('new-pat-doctor').value,
    RegistrationDate: new Date().toISOString().split('T')[0],
    PatientStatus: 'Active'
  };

  const validation = BusinessRules.validatePatient(patData);
  if (!validation.valid) {
    showToast(validation.message, 'error');
    return;
  }

  const created = DAL.create('Patients', patData);
  closeModal();
  showToast(`Patient ${created.FirstName} ${created.LastName} registered successfully!`, 'success');
  navigateTo('patients');
}

function handleCreateAppointment(e) {
  e.preventDefault();
  const apptData = {
    PatientID: document.getElementById('new-apt-patient').value,
    DoctorID: document.getElementById('new-apt-doctor').value,
    AppointmentDate: document.getElementById('new-apt-date').value,
    StartTime: document.getElementById('new-apt-time').value,
    EndTime: calculateEndTime(document.getElementById('new-apt-time').value),
    AppointmentType: document.getElementById('new-apt-type').value,
    ReasonForVisit: document.getElementById('new-apt-reason').value.trim(),
    Status: 'Scheduled'
  };

  const validation = BusinessRules.validateAppointment(apptData);
  if (!validation.valid) {
    showToast(validation.message, 'error');
    return;
  }

  const aptCount = DAL.find('Appointments').length + 1;
  apptData.AppointmentNumber = `APT-2026-${String(aptCount).padStart(4, '0')}`;

  DAL.create('Appointments', apptData);
  closeModal();
  showToast(`Appointment booked for ${apptData.AppointmentDate} at ${apptData.StartTime}!`, 'success');
  navigateTo('appointments');
}

function calculateEndTime(startStr) {
  const parts = startStr.split(':');
  let hr = parseInt(parts[0]);
  let min = parseInt(parts[1]) + 30;
  if (min >= 60) {
    hr++;
    min -= 60;
  }
  return `${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

// ==========================================
// 15. DYNAMICS 365 OPD PROCESS WORKFLOW ENGINE
// ==========================================
// Workflow Stages:
// Stage 1: Triage & Vital Signs
// Stage 2: Consultation (Doctor Assessment & ICD-10)
// Stage 3: Investigation (Decision Yes/No -> Order Services: X-Ray, CT Scan, Echo, Labo)
// Stage 4: Prescription (Medication Orders & Stock Depletion)
// Stage 5: Discharge (Disposition, Summary, Follow-up & Automated Billing)

function openNewVisitModal() {
  const patients = DAL.find('Patients');
  const doctors = DAL.find('Doctors');
  const visits = DAL.find('Visits');
  const nextNum = `VIS-2026-${String(visits.length + 1).padStart(4, '0')}`;
  const today = new Date().toISOString().split('T')[0];

  openModal(`
    <div class="px-6 py-4 bg-[#002050] text-white flex justify-between items-center">
      <h3 class="font-bold text-sm flex items-center gap-2"><i data-lucide="stethoscope" class="w-4 h-4 text-teal-400"></i> New Outpatient (OPD) Encounter Registration</h3>
      <button onclick="closeModal()" class="text-slate-300 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
    </div>
    <form onsubmit="handleStartNewOpdEncounter(event)" class="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh] custom-scrollbar">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Encounter Number (Generated)</label>
          <input type="text" id="new-opd-id" value="${nextNum}" readonly class="w-full border border-slate-300 rounded p-2 font-mono font-bold bg-slate-50 text-teal-800">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Encounter Date *</label>
          <input type="date" id="new-opd-date" value="${today}" required class="w-full border border-slate-300 rounded p-2 font-mono">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Select Patient *</label>
          <select id="new-opd-patient" required class="w-full border border-slate-300 rounded p-2">
            <option value="">-- Choose Patient --</option>
            ${patients.map(p => `<option value="${p.PatientID}">${p.FirstName} ${p.LastName} (${p.PatientNumber}) &bull; ${p.Gender}, Age ${p.Age}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Attending Physician *</label>
          <select id="new-opd-doctor" required class="w-full border border-slate-300 rounded p-2">
            <option value="">-- Choose Attending Doctor --</option>
            ${doctors.map(d => `<option value="${d.DoctorID}">${d.DoctorName} (${d.Specialization})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Encounter Type *</label>
          <select id="new-opd-type" class="w-full border border-slate-300 rounded p-2">
            <option value="Initial Consultation" selected>Initial Consultation</option>
            <option value="Follow-up Review">Follow-up Review</option>
            <option value="Urgent / Walk-in">Urgent / Walk-in</option>
            <option value="Pre-operative Clearance">Pre-operative Clearance</option>
            <option value="Routine Health Check">Routine Health Check</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Initial Triage Acuity *</label>
          <select id="new-opd-acuity" class="w-full border border-slate-300 rounded p-2 font-medium">
            <option value="Level 4 - Less Urgent" selected>Level 4 - Less Urgent (Standard OPD Consultation)</option>
            <option value="Level 3 - Urgent">Level 3 - Urgent (Moderate Distress / Severe Pain)</option>
            <option value="Level 2 - Emergent">Level 2 - Emergent (High Risk / Vital Instability)</option>
            <option value="Level 1 - Resuscitation">Level 1 - Resuscitation (Immediate Life Threat)</option>
            <option value="Level 5 - Non-Urgent">Level 5 - Non-Urgent (Refill / Review)</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block font-semibold text-slate-700 mb-1">Chief Complaint & Presenting Symptoms *</label>
        <textarea id="new-opd-complaint" rows="3" required placeholder="Document presenting symptoms, onset, characteristics, and patient concerns..." class="w-full border border-slate-300 rounded p-2"></textarea>
      </div>

      <div class="pt-4 border-t flex justify-between items-center">
        <span class="text-[11px] text-slate-500">Creates encounter and launches OPD Clinical Process Workflow.</span>
        <div class="flex gap-2">
          <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="submit" class="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded flex items-center gap-1.5 shadow-sm">
            <i data-lucide="play" class="w-4 h-4"></i> Start Encounter & Launch Workflow
          </button>
        </div>
      </div>
    </form>
  `);
}

function handleStartNewOpdEncounter(e) {
  e.preventDefault();
  const patId = document.getElementById('new-opd-patient').value;
  const docId = document.getElementById('new-opd-doctor').value;
  const complaint = document.getElementById('new-opd-complaint').value.trim();
  const visitDate = document.getElementById('new-opd-date').value;
  const acuity = document.getElementById('new-opd-acuity') ? document.getElementById('new-opd-acuity').value : 'Level 4 - Less Urgent';

  const allVisits = DAL.find('Visits');
  const visitCount = allVisits.length + 1;
  const newVisitId = `VIS-${String(visitCount).padStart(3, '0')}`;

  const visitObj = {
    VisitID: newVisitId,
    PatientID: patId,
    DoctorID: docId,
    VisitDate: visitDate,
    ChiefComplaint: complaint,
    ClinicalNotes: '',
    DiagnosisSummary: '',
    TreatmentPlan: '',
    VisitStatus: 'Arrived',
    OpdStage: 'Triage',
    TriageAcuity: acuity,
    NeedsInvestigation: 'Pending',
    DischargeDisposition: '',
    DischargeNotes: ''
  };

  DAL.create('Visits', visitObj);
  closeModal();
  showToast(`Encounter ${newVisitId} created! Starting Stage 1: Triage & Vital Signs.`, 'success');
  renderMainView();
  openOpdWorkflow(newVisitId, 'Triage');
}

function openVitalsModal(visitId) {
  openOpdWorkflow(visitId, 'Triage');
}

function openConsultationModal(visitId) {
  openOpdWorkflow(visitId, 'Consultation');
}

function openOpdWorkflow(visitId, stageOverride) {
  const visit = DAL.findById('Visits', visitId);
  if (!visit) {
    showToast('Encounter record not found.', 'error');
    return;
  }
  const pat = DAL.findById('Patients', visit.PatientID) || {};
  const doc = DAL.findById('Doctors', visit.DoctorID) || {};
  const vitals = DAL.find('VitalSigns', { VisitID: visitId })[0] || {};
  const investigations = DAL.find('LaboratoryResults', { VisitID: visitId });
  const prescriptions = DAL.find('Prescriptions', { VisitID: visitId });
  let rxItems = [];
  prescriptions.forEach(rx => {
    rxItems = rxItems.concat(DAL.find('PrescriptionItems', { PrescriptionID: rx.PrescriptionID }));
  });

  // Determine stage to view
  const activeStage = stageOverride || visit.OpdStage || (visit.VisitStatus === 'Completed' ? 'Discharge' : 'Triage');

  const stages = [
    { id: 'Triage', num: '1', title: 'Triage & Vitals', icon: 'thermometer' },
    { id: 'Consultation', num: '2', title: 'Consultation', icon: 'stethoscope' },
    { id: 'Investigation', num: '3', title: 'Investigation Orders', icon: 'microscope' },
    { id: 'Prescription', num: '4', title: 'Pharmacy Rx', icon: 'pill' },
    { id: 'Discharge', num: '5', title: 'Discharge Clearance', icon: 'log-out' }
  ];

  function getBpfClass(stageId) {
    const stageIndex = stages.findIndex(s => s.id === stageId);
    const activeIndex = stages.findIndex(s => s.id === activeStage);
    if (stageId === 'Investigation' && visit.NeedsInvestigation === 'No' && stageId !== activeStage) {
      return 'bg-slate-100 text-slate-400 hover:bg-slate-200 line-through opacity-75';
    }
    if (stageId === activeStage) {
      return 'bg-[#002050] text-white font-bold shadow-md border-b-2 border-amber-400';
    } else if (stageIndex < activeIndex || visit.VisitStatus === 'Completed') {
      return 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold';
    } else {
      return 'bg-slate-50 text-slate-500 hover:bg-slate-100 font-medium';
    }
  }

  let stageHtml = '';
  switch (activeStage) {
    case 'Triage':
      stageHtml = renderOpdStage1_Triage(visit, pat, doc, vitals);
      break;
    case 'Consultation':
      stageHtml = renderOpdStage2_Consultation(visit, pat, doc, vitals);
      break;
    case 'Investigation':
      stageHtml = renderOpdStage3_Investigation(visit, pat, doc, investigations);
      break;
    case 'Prescription':
      stageHtml = renderOpdStage4_Prescription(visit, pat, doc, prescriptions, rxItems);
      break;
    case 'Discharge':
      stageHtml = renderOpdStage5_Discharge(visit, pat, doc, investigations, prescriptions, rxItems);
      break;
    default:
      stageHtml = renderOpdStage1_Triage(visit, pat, doc, vitals);
  }

  openModal(`
    <div class="flex flex-col h-[90vh] max-w-5xl w-full mx-auto bg-slate-50 rounded-lg overflow-hidden shadow-2xl">
      <!-- D365 Model-driven Record Header -->
      <div class="bg-[#002050] text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-teal-600/60 border border-teal-400 flex items-center justify-center font-bold text-base">
            <i data-lucide="stethoscope" class="w-5 h-5 text-teal-200"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs uppercase tracking-wider text-teal-300 font-semibold">OPD Clinical Encounter</span>
              <span class="text-xs bg-teal-900/80 px-2 py-0.5 rounded font-mono text-teal-200">${visit.VisitID}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${visit.VisitStatus === 'Completed' ? 'bg-slate-600 text-slate-200' : 'bg-emerald-500 text-white animate-pulse'}">${visit.VisitStatus}</span>
            </div>
            <h2 class="text-base font-bold text-white flex items-center gap-2">
              ${pat.FirstName || 'Patient'} ${pat.LastName || ''}
              <span class="text-xs font-normal text-slate-300">(${pat.PatientNumber || ''} &bull; ${pat.Gender || ''}, ${pat.DateOfBirth || (pat.Age ? 'Age ' + pat.Age : '')})</span>
            </h2>
          </div>
        </div>

        <div class="flex items-center gap-5 text-xs text-right">
          <div class="hidden sm:block">
            <div class="text-[10px] text-teal-300 uppercase">Clinic / Department</div>
            <div class="font-bold text-white text-xs">${doc.DepartmentName || doc.Specialization || 'Outpatient Clinic'}</div>
          </div>
          <div class="hidden sm:block">
            <div class="text-[10px] text-teal-300 uppercase">Attending Doctor</div>
            <div class="font-bold text-white text-xs">${doc.DoctorName || visit.DoctorID}</div>
          </div>
          <div class="hidden sm:block">
            <div class="text-[10px] text-teal-300 uppercase">Encounter Date</div>
            <div class="font-bold font-mono text-emerald-300 text-xs">${visit.VisitDate || 'Today'}</div>
          </div>
          <button onclick="closeModal(); renderMainView();" class="text-slate-300 hover:text-white p-1 rounded-md hover:bg-white/10 transition">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
      </div>

      <!-- Dynamics 365 Model-driven BPF Chevron Bar -->
      <div class="bg-white border-b border-slate-200 shadow-xs flex items-stretch overflow-x-auto select-none text-xs">
        ${stages.map((st, i) => `
          <div onclick="${st.id === 'Investigation' && visit.NeedsInvestigation === 'No' ? 'showToast(\'Investigation was marked No (Skipped) by physician\', \'info\'); openOpdWorkflow(\'' + visit.VisitID + '\', \'Investigation\')' : 'openOpdWorkflow(\'' + visit.VisitID + '\', \'' + st.id + '\')'}" class="bpf-step cursor-pointer ${getBpfClass(st.id)} flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition whitespace-nowrap">
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${activeStage === st.id ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-700'}">${st.num}</span>
            <i data-lucide="${st.icon}" class="w-3.5 h-3.5"></i>
            <span class="text-xs font-semibold">${st.title}</span>
            ${st.id === 'Investigation' && visit.NeedsInvestigation === 'No' ? '<span class="text-[10px] bg-slate-200 text-slate-600 px-1 py-0.2 rounded font-normal">Skipped</span>' : ''}
          </div>
        `).join('')}
      </div>

      <!-- Active Stage View Body -->
      <div class="flex-1 overflow-y-auto p-5 custom-scrollbar bg-[#f8f9fa]">
        ${stageHtml}
      </div>
    </div>
  `);
}

function renderOpdStageContent(stage, visit, pat, doc, vitals, investigations, prescriptions, rxItems) {
  switch (stage) {
    case 'Triage':
      return renderOpdStage1_Triage(visit, pat, doc, vitals);
    case 'Consultation':
      return renderOpdStage2_Consultation(visit, pat, doc, vitals);
    case 'Investigation':
      return renderOpdStage3_Investigation(visit, pat, doc, investigations);
    case 'Prescription':
      return renderOpdStage4_Prescription(visit, pat, doc, prescriptions, rxItems);
    case 'Discharge':
      return renderOpdStage5_Discharge(visit, pat, doc, investigations, prescriptions, rxItems);
    default:
      return renderOpdStage1_Triage(visit, pat, doc, vitals);
  }
}

// ----------------------------------------------------
// STAGE 1: TRIAGE & VITAL SIGNS
// ----------------------------------------------------
function renderOpdStage1_Triage(visit, pat, doc, vitals) {
  const currentBmi = vitals.BMI || (vitals.Weight && vitals.Height ? (vitals.Weight / ((vitals.Height / 100) * (vitals.Height / 100))).toFixed(1) : '22.8');

  return `
    <div class="space-y-4 max-w-4xl mx-auto text-xs">
      <!-- Stage Banner -->
      <div class="p-3.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-blue-950">
        <div class="flex items-center gap-2">
          <i data-lucide="thermometer" class="w-5 h-5 text-blue-600"></i>
          <div>
            <h4 class="font-bold text-sm">Stage 1: Patient Triage & Vital Signs Capture</h4>
            <p class="text-[11px] text-blue-800">Nurse checks in patient, records baseline physiological parameters, and evaluates triage acuity.</p>
          </div>
        </div>
        <span class="px-2.5 py-1 bg-blue-200 text-blue-900 rounded font-semibold text-[11px]">${visit.TriageAcuity || 'Triage Intake'}</span>
      </div>

      <form onsubmit="handleSaveOpdStage1(event, '${visit.VisitID}')" class="space-y-4">
        <!-- Triage & Baseline Vitals Card -->
        <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <h5 class="font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
            <span class="flex items-center gap-2"><i data-lucide="activity" class="w-4 h-4 text-blue-600"></i> Baseline Physiological Parameters & Acuity</span>
            <span class="text-xs font-mono font-bold text-emerald-700">BMI: ${currentBmi}</span>
          </h5>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Triage Acuity Level *</label>
              <select id="opd-triage-level" required class="w-full border border-slate-300 rounded p-2 font-medium">
                <option value="Level 4 - Less Urgent" selected>Level 4 - Less Urgent (Standard OPD Consultation)</option>
                <option value="Level 3 - Urgent">Level 3 - Urgent (Moderate Distress / Severe Pain)</option>
                <option value="Level 2 - Emergent">Level 2 - Emergent (High Risk / Vital Instability)</option>
                <option value="Level 1 - Resuscitation">Level 1 - Resuscitation (Immediate Life Threat)</option>
                <option value="Level 5 - Non-Urgent">Level 5 - Non-Urgent (Routine Refill / Follow-up)</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Presenting Chief Complaint *</label>
              <input type="text" id="opd-triage-complaint" value="${visit.ChiefComplaint || ''}" required placeholder="Primary reason for consultation..." class="w-full border border-slate-300 rounded p-2">
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Temperature (&deg;C) *</label>
              <input type="number" step="0.1" id="opd-vit-temp" value="${vitals.Temperature || '36.8'}" required class="w-full border border-slate-300 rounded p-2 font-mono">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Blood Pressure (mmHg) *</label>
              <input type="text" id="opd-vit-bp" value="${vitals.BloodPressure || '120/80'}" placeholder="120/80" required class="w-full border border-slate-300 rounded p-2 font-mono">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Heart Rate (bpm) *</label>
              <input type="number" id="opd-vit-hr" value="${vitals.HeartRate || '72'}" required class="w-full border border-slate-300 rounded p-2 font-mono">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Oxygen Saturation (%) *</label>
              <input type="number" id="opd-vit-spo2" value="${vitals.OxygenSaturation || '98'}" required class="w-full border border-slate-300 rounded p-2 font-mono">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Resp. Rate (bpm)</label>
              <input type="number" id="opd-vit-rr" value="${vitals.RespiratoryRate || '16'}" class="w-full border border-slate-300 rounded p-2 font-mono">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Weight (kg) *</label>
              <input type="number" step="0.5" id="opd-vit-wt" value="${vitals.Weight || '68'}" oninput="calculateLiveOpdBmi()" required class="w-full border border-slate-300 rounded p-2 font-mono">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Height (cm) *</label>
              <input type="number" id="opd-vit-ht" value="${vitals.Height || '172'}" oninput="calculateLiveOpdBmi()" required class="w-full border border-slate-300 rounded p-2 font-mono">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Calculated BMI</label>
              <div id="opd-bmi-display" class="w-full border border-slate-200 bg-slate-50 rounded p-2 font-mono font-bold flex items-center justify-between">
                <span>${currentBmi}</span>
                <span class="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">Normal</span>
              </div>
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Triage Nurse Clinical Assessment Notes</label>
            <textarea id="opd-vit-notes" rows="2" placeholder="Patient arrived alert and oriented..." class="w-full border border-slate-300 rounded p-2">${vitals.Notes || 'Patient stable on arrival for outpatient consultation.'}</textarea>
          </div>
        </div>

        <!-- Action Bar -->
        <div class="pt-3 border-t flex justify-between items-center">
          <span class="text-[11px] text-slate-500">Source: Registered via Outpatient Reception</span>
          <div class="flex gap-2">
            <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded flex items-center gap-1.5 shadow-sm transition">
              <i data-lucide="save" class="w-3.5 h-3.5"></i> Save Stage 1 Details
            </button>
            <button type="button" onclick="openOpdWorkflow('${visit.VisitID}', 'Consultation')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded flex items-center gap-1.5 shadow-sm transition">
              <span>Next: Stage 2 Consultation</span> <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      </form>
    </div>
  `;
}

function calculateLiveOpdBmi() {
  const wt = parseFloat(document.getElementById('opd-vit-wt').value) || 0;
  const ht = parseFloat(document.getElementById('opd-vit-ht').value) || 0;
  const display = document.getElementById('opd-bmi-display');
  if (!display || ht <= 0 || wt <= 0) return;

  const bmi = (wt / ((ht / 100) * (ht / 100))).toFixed(1);
  let badge = 'bg-emerald-100 text-emerald-800';
  let cat = 'Normal';
  if (bmi < 18.5) { badge = 'bg-blue-100 text-blue-800'; cat = 'Underweight'; }
  else if (bmi >= 25 && bmi < 30) { badge = 'bg-amber-100 text-amber-800'; cat = 'Overweight'; }
  else if (bmi >= 30) { badge = 'bg-rose-100 text-rose-800'; cat = 'Obese'; }

  display.innerHTML = `<span>${bmi}</span><span class="text-[10px] px-1.5 py-0.5 rounded font-bold ${badge}">${cat}</span>`;
}

function handleSaveOpdStage1(e, visitId) {
  e.preventDefault();
  const visit = DAL.findById('Visits', visitId);
  const wt = parseFloat(document.getElementById('opd-vit-wt').value);
  const ht = parseFloat(document.getElementById('opd-vit-ht').value);
  const bmi = (wt / ((ht / 100) * (ht / 100))).toFixed(1);
  const complaint = document.getElementById('opd-triage-complaint').value.trim();

  const vitalsObj = {
    VisitID: visitId,
    PatientID: visit.PatientID,
    Temperature: document.getElementById('opd-vit-temp').value,
    BloodPressure: document.getElementById('opd-vit-bp').value,
    HeartRate: parseInt(document.getElementById('opd-vit-hr').value),
    RespiratoryRate: parseInt(document.getElementById('opd-vit-rr').value),
    OxygenSaturation: parseInt(document.getElementById('opd-vit-spo2').value),
    Weight: wt,
    Height: ht,
    BMI: bmi,
    RecordedBy: appState.currentRole === 'Nurse' ? 'Joyce Chen, RN' : 'Triage Nurse',
    RecordedAt: new Date().toISOString(),
    Notes: document.getElementById('opd-vit-notes').value.trim()
  };

  const existing = DAL.find('VitalSigns', { VisitID: visitId });
  if (existing.length > 0) {
    DAL.update('VitalSigns', existing[0].VitalSignID, vitalsObj);
  } else {
    DAL.create('VitalSigns', vitalsObj);
  }

  DAL.update('Visits', visitId, {
    ChiefComplaint: complaint,
    OpdStage: 'Consultation',
    VisitStatus: 'In Consultation'
  });

  showToast(`Stage 1 Complete: Vitals saved (BMI: ${bmi}). Now in Consultation!`, 'success');
  openOpdWorkflow(visitId, 'Consultation');
}

// ----------------------------------------------------
// STAGE 2: CONSULTATION (DOCTOR ASSESSMENT & DECISION)
// ----------------------------------------------------
function renderOpdStage2_Consultation(visit, pat, doc, vitals) {
  const needsInv = visit.NeedsInvestigation === 'Yes';
  const existingDx = DAL.find('Diagnoses', { VisitID: visit.VisitID })[0] || {};

  return `
    <div class="space-y-4 max-w-4xl mx-auto text-xs">
      <!-- Stage Banner -->
      <div class="p-3.5 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between text-purple-950">
        <div class="flex items-center gap-2">
          <i data-lucide="stethoscope" class="w-5 h-5 text-purple-600"></i>
          <div>
            <h4 class="font-bold text-sm">Stage 2: Physician Clinical Consultation</h4>
            <p class="text-[11px] text-purple-800">Doctor examines patient, documents symptoms, specifies ICD-10 diagnosis, and determines investigation requirement.</p>
          </div>
        </div>
        <span class="px-2.5 py-1 bg-purple-200 text-purple-900 rounded font-semibold text-[11px]">Doctor Office</span>
      </div>

      <!-- Baseline Vitals Strip -->
      <div class="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between flex-wrap gap-2 text-xs">
        <span class="font-bold text-slate-800 flex items-center gap-1.5"><i data-lucide="activity" class="w-4 h-4 text-purple-600"></i> Baseline Vitals from Stage 1:</span>
        <div class="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <span class="bg-slate-100 border px-2 py-0.5 rounded text-slate-700">BP: <strong class="text-slate-900 font-bold">${vitals.BloodPressure || '120/80'}</strong> mmHg</span>
          <span class="bg-slate-100 border px-2 py-0.5 rounded text-slate-700">HR: <strong class="text-slate-900 font-bold">${vitals.HeartRate || '72'}</strong> bpm</span>
          <span class="bg-slate-100 border px-2 py-0.5 rounded text-slate-700">Temp: <strong class="text-slate-900 font-bold">${vitals.Temperature || '36.8'}</strong>&deg;C</span>
          <span class="bg-slate-100 border px-2 py-0.5 rounded text-slate-700">SpO2: <strong class="text-slate-900 font-bold">${vitals.OxygenSaturation || '98'}</strong>%</span>
          <span class="bg-slate-100 border px-2 py-0.5 rounded text-slate-700">BMI: <strong class="text-slate-900 font-bold">${vitals.BMI || '22.5'}</strong></span>
        </div>
      </div>

      <form onsubmit="handleSaveOpdStage2(event, '${visit.VisitID}')" class="space-y-4">
        <!-- Examination & Diagnosis Card -->
        <div class="bg-white p-5 rounded-lg border border-purple-200 shadow-2xs space-y-3">
          <h5 class="font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
            <span class="flex items-center gap-1.5"><i data-lucide="plus-circle" class="w-4 h-4 text-purple-600"></i> Record Clinical Examination & Consultation Notes</span>
            <span class="text-xs text-slate-500 font-mono">${visit.VisitDate || 'Today'}</span>
          </h5>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Clinical Examination & Doctor's Notes *</label>
            <textarea id="opd-doc-notes" rows="3" required placeholder="History of illness, physical examination, heart/lung auscultation..." class="w-full border border-slate-300 rounded p-2">${visit.ClinicalNotes || 'Patient alert and responsive. Cardiopulmonary auscultation reveals clear breath sounds, normal heart sounds without murmurs. Abdomen soft, non-tender.'}</textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="md:col-span-2">
              <label class="block font-semibold text-slate-700 mb-1">Primary Clinical Diagnosis *</label>
              <input type="text" id="opd-doc-diagnosis" value="${visit.DiagnosisSummary || existingDx.Diagnosis || ''}" required placeholder="e.g. Essential Hypertension, Acute Bronchitis" class="w-full border border-slate-300 rounded p-2 font-semibold">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">ICD-10 Code *</label>
              <input type="text" id="opd-doc-icd" value="${existingDx.DiagnosisCode || 'I10'}" required placeholder="e.g. I10, E11.9" class="w-full border border-slate-300 rounded p-2 font-mono font-bold">
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Condition Severity</label>
              <select id="opd-doc-severity" class="w-full border border-slate-300 rounded p-2">
                <option value="Mild">Mild</option>
                <option value="Moderate" selected>Moderate</option>
                <option value="Severe">Severe</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Provisional Treatment Plan</label>
              <input type="text" id="opd-doc-treatment" value="${visit.TreatmentPlan || 'Lifestyle modifications, pharmacotherapy, and clinical follow-up.'}" class="w-full border border-slate-300 rounded p-2">
            </div>
          </div>

          <!-- Clinical Decision: Investigation Required? -->
          <div class="p-3 bg-indigo-50 border border-indigo-200 rounded-lg space-y-2 mt-2">
            <h6 class="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
              <i data-lucide="help-circle" class="w-4 h-4 text-indigo-600"></i> Clinical Pathway Decision: Are Diagnostic Investigations Required?
            </h6>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <label id="choice-yes-container" class="flex items-start gap-2.5 p-3 rounded border-2 cursor-pointer transition ${needsInv ? 'border-indigo-600 bg-white shadow-xs' : 'border-slate-200 bg-white/70 hover:border-slate-300'}">
                <input type="radio" name="opd-inv-choice" id="choice-inv-yes" value="Yes" ${needsInv ? 'checked' : ''} onchange="toggleOpdInvestigationChoice('Yes')" class="mt-0.5 text-indigo-600">
                <div>
                  <span class="font-bold text-slate-900 block text-xs flex items-center gap-1.5">
                    <i data-lucide="scan" class="w-3.5 h-3.5 text-purple-600"></i> YES - Order Diagnostic Services
                  </span>
                  <span class="text-[11px] text-slate-600 block mt-0.5">Proceed to Stage 3 to order Imaging (X-Ray, CT, Echo) or Laboratory tests.</span>
                </div>
              </label>

              <label id="choice-no-container" class="flex items-start gap-2.5 p-3 rounded border-2 cursor-pointer transition ${!needsInv && visit.NeedsInvestigation === 'No' ? 'border-emerald-600 bg-white shadow-xs' : 'border-slate-200 bg-white/70 hover:border-slate-300'}">
                <input type="radio" name="opd-inv-choice" id="choice-inv-no" value="No" ${!needsInv && visit.NeedsInvestigation === 'No' ? 'checked' : ''} onchange="toggleOpdInvestigationChoice('No')" class="mt-0.5 text-emerald-600">
                <div>
                  <span class="font-bold text-slate-900 block text-xs flex items-center gap-1.5">
                    <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-600"></i> NO - No Investigation Needed
                  </span>
                  <span class="text-[11px] text-slate-600 block mt-0.5">Evaluation is conclusive. Skip Stage 3 and jump directly to Stage 4: Prescription.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <!-- Action Bar -->
        <div class="pt-4 border-t flex justify-between items-center">
          <button type="button" onclick="openOpdWorkflow('${visit.VisitID}', 'Triage')" class="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50 flex items-center gap-1">
            <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i> Back to Triage
          </button>
          <button type="submit" id="btn-save-stage2" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded flex items-center gap-1.5 shadow-sm transition">
            <span id="btn-stage2-text">${needsInv ? 'Next: Stage 3 Investigation' : (visit.NeedsInvestigation === 'No' ? 'Next: Stage 4 Prescription' : 'Confirm Choice & Next')}</span> <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </form>
    </div>
  `;
}

function toggleOpdInvestigationChoice(choice) {
  const containerYes = document.getElementById('choice-yes-container');
  const containerNo = document.getElementById('choice-no-container');
  const btnText = document.getElementById('btn-stage2-text');

  if (choice === 'Yes') {
    if (containerYes) containerYes.className = 'flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition border-indigo-600 bg-white shadow-xs';
    if (containerNo) containerNo.className = 'flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition border-slate-200 bg-white/70 hover:border-slate-300';
    if (btnText) btnText.innerHTML = 'Proceed to Order Services (Stage 3) ➔';
  } else {
    if (containerNo) containerNo.className = 'flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition border-emerald-600 bg-white shadow-xs';
    if (containerYes) containerYes.className = 'flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition border-slate-200 bg-white/70 hover:border-slate-300';
    if (btnText) btnText.innerHTML = 'Skip to Prescription (Stage 4) ➔';
  }
}

function handleSaveOpdStage2(e, visitId) {
  e.preventDefault();
  const visit = DAL.findById('Visits', visitId);
  const notes = document.getElementById('opd-doc-notes').value.trim();
  const diagDesc = document.getElementById('opd-doc-diagnosis').value.trim();
  const icd = document.getElementById('opd-doc-icd').value.trim();
  const severity = document.getElementById('opd-doc-severity').value;
  const treatment = document.getElementById('opd-doc-treatment').value.trim();

  // Check investigation radio choice
  const invYes = document.getElementById('choice-inv-yes').checked;
  const choice = invYes ? 'Yes' : 'No';

  // Save Diagnosis record
  const existingDx = DAL.find('Diagnoses', { VisitID: visitId });
  if (existingDx.length > 0) {
    DAL.update('Diagnoses', existingDx[0].DiagnosisID, {
      Diagnosis: diagDesc,
      DiagnosisCode: icd,
      Severity: severity,
      Notes: 'Updated in OPD Consultation.'
    });
  } else {
    DAL.create('Diagnoses', {
      PatientID: visit.PatientID,
      VisitID: visitId,
      DoctorID: visit.DoctorID,
      Diagnosis: diagDesc,
      DiagnosisCode: icd,
      DiagnosisDate: visit.VisitDate,
      Severity: severity,
      Notes: 'Documented during clinical examination.'
    });
  }

  if (choice === 'Yes') {
    // ROUTE TO STAGE 3 (INVESTIGATION)
    DAL.update('Visits', visitId, {
      ClinicalNotes: notes,
      DiagnosisSummary: diagDesc,
      TreatmentPlan: treatment,
      NeedsInvestigation: 'Yes',
      OpdStage: 'Investigation'
    });
    showToast('Investigation indicated! Routing to Stage 3: Order Diagnostic Services.', 'info');
    openOpdWorkflow(visitId, 'Investigation');
  } else {
    // BYPASS STAGE 3 DIRECTLY TO STAGE 4 (PRESCRIPTION)
    DAL.update('Visits', visitId, {
      ClinicalNotes: notes,
      DiagnosisSummary: diagDesc,
      TreatmentPlan: treatment,
      NeedsInvestigation: 'No',
      OpdStage: 'Prescription'
    });
    showToast('No investigations needed. Bypassing Stage 3 directly to Stage 4: Prescription!', 'success');
    openOpdWorkflow(visitId, 'Prescription');
  }
}

// ----------------------------------------------------
// STAGE 3: INVESTIGATION (ORDER SERVICES: X-RAY, CT SCAN, ECHO, LABO)
// ----------------------------------------------------
function renderOpdStage3_Investigation(visit, pat, doc, investigations) {
  const masterTests = DAL.find('LaboratoryTests');

  return `
    <div class="space-y-4 max-w-4xl mx-auto text-xs">
      <!-- Stage Banner -->
      <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-amber-950">
        <div class="flex items-center gap-2">
          <i data-lucide="scan" class="w-5 h-5 text-amber-600"></i>
          <div>
            <h4 class="font-bold text-sm">Stage 3: Diagnostic Investigation Orders</h4>
            <p class="text-[11px] text-amber-800">Order Radiology Imaging (X-Ray, CT Scan, Ultrasound), Cardiology (Echo), and Pathology Laboratory tests.</p>
          </div>
        </div>
        <span class="px-2.5 py-1 bg-amber-200 text-amber-900 rounded font-semibold text-[11px]">Diagnostic Services (${investigations.length})</span>
      </div>

      <!-- Quick Add Order Service Form -->
      <form onsubmit="handleAddOpdInvestigation(event, '${visit.VisitID}')" class="bg-white p-5 rounded-lg border border-amber-200 shadow-2xs space-y-3">
        <h5 class="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
          <i data-lucide="plus-circle" class="w-4 h-4 text-amber-600"></i> Order New Investigation / Diagnostic Service
        </h5>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="md:col-span-2">
            <label class="block font-semibold text-slate-700 mb-1">Select Diagnostic Service / Test *</label>
            <select id="opd-order-test" required class="w-full border border-slate-300 rounded p-1.5 bg-white">
              <optgroup label="Radiology & Imaging (X-Ray, CT, Ultrasound)">
                ${masterTests.filter(t => t.Category === 'Imaging').map(t => `<option value="${t.TestID}">[${t.Category}] ${t.TestName} ($${parseFloat(t.Cost).toFixed(2)})</option>`).join('')}
              </optgroup>
              <optgroup label="Cardiology (Echocardiogram)">
                ${masterTests.filter(t => t.Category === 'Cardiology').map(t => `<option value="${t.TestID}">[${t.Category}] ${t.TestName} ($${parseFloat(t.Cost).toFixed(2)})</option>`).join('')}
              </optgroup>
              <optgroup label="Laboratory & Pathology (Labo)">
                ${masterTests.filter(t => !['Imaging', 'Cardiology'].includes(t.Category)).map(t => `<option value="${t.TestID}">[${t.Category}] ${t.TestName} ($${parseFloat(t.Cost).toFixed(2)})</option>`).join('')}
              </optgroup>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Priority Order</label>
            <select id="opd-order-priority" class="w-full border border-slate-300 rounded p-1.5 bg-white font-semibold">
              <option value="Routine" selected>Routine (Standard Queue)</option>
              <option value="STAT Urgent">STAT (Immediate / Emergency)</option>
            </select>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
          <div class="flex-1">
            <input type="text" id="opd-order-indication" placeholder="Clinical indication / reason (e.g. Evaluate chest tightness, rule out fracture, verify cardiac murmur)" class="w-full border border-slate-300 rounded p-1.5">
          </div>
          <button type="submit" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded flex items-center justify-center gap-1.5 shadow-sm transition whitespace-nowrap">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Service Order
          </button>
        </div>
      </form>

      <!-- Active Orders Subgrid -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div class="p-3 bg-slate-50 border-b flex justify-between items-center flex-wrap gap-2">
          <span class="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <i data-lucide="layers" class="w-4 h-4 text-amber-600"></i> Ordered Diagnostic Services for this Encounter (${investigations.length})
          </span>
          <span class="text-[11px] bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded font-medium">Total Services Amount: <strong class="font-mono font-bold">$${investigations.reduce((acc, inv) => {
            const master = masterTests.find(m => m.TestID === inv.TestID);
            return acc + (master ? parseFloat(master.Cost) : 35);
          }, 0).toFixed(2)}</strong></span>
        </div>

        ${investigations.length === 0 ? `
          <div class="p-8 text-center text-slate-400 space-y-2">
            <div class="w-10 h-10 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto">
              <i data-lucide="flask-conical" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="font-medium text-slate-700">No investigations have been ordered yet for this encounter.</p>
              <p class="text-[11px] text-slate-400 mt-0.5">Select a diagnostic test above (e.g. Chest X-Ray, CT Scan, 2D Echo, or CBC) and click "Add Service Order".</p>
            </div>
          </div>
        ` : `
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] border-b">
                <tr>
                  <th class="p-2.5">Service / Test Name</th>
                  <th class="p-2.5">Category</th>
                  <th class="p-2.5">Fee</th>
                  <th class="p-2.5">Status</th>
                  <th class="p-2.5">Reported Findings</th>
                  <th class="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                ${investigations.map(inv => {
                  const master = masterTests.find(m => m.TestID === inv.TestID) || {};
                  return `
                    <tr class="hover:bg-slate-50 transition">
                      <td class="p-2.5 font-bold text-slate-900">${inv.TestName}</td>
                      <td class="p-2.5">
                        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${master.Category === 'Imaging' ? 'bg-cyan-100 text-cyan-800' : (master.Category === 'Cardiology' ? 'bg-rose-100 text-rose-800' : 'bg-purple-100 text-purple-800')}">
                          ${master.Category || 'General'}
                        </span>
                      </td>
                      <td class="p-2.5 font-mono text-slate-700 font-bold">$${parseFloat(master.Cost || 35).toFixed(2)}</td>
                      <td class="p-2.5">${getStatusBadge(inv.Status || 'Requested')}</td>
                      <td class="p-2.5 text-slate-700 max-w-sm text-xs">${inv.Result || '<span class="text-slate-400 italic">Pending execution</span>'}</td>
                      <td class="p-2.5 text-right space-x-1.5 whitespace-nowrap">
                        ${inv.Status !== 'Completed' ? `
                          <button onclick="handleSimulateOpdLabResult('${inv.ResultID}', '${visit.VisitID}')" class="px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-semibold transition" title="Simulate mock result input">
                            Simulate Result Ready
                          </button>
                        ` : ''}
                        <button onclick="handleDeleteOpdInvestigation('${inv.ResultID}', '${visit.VisitID}')" class="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded text-[11px] font-semibold transition">Remove</button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- Navigation Bar -->
      <div class="pt-4 border-t flex justify-between items-center">
        <button type="button" onclick="openOpdWorkflow('${visit.VisitID}', 'Consultation')" class="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50 flex items-center gap-1 font-medium transition text-xs">
          <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i> Back to Consultation
        </button>
        <button onclick="handleAdvanceToPrescription('${visit.VisitID}')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded flex items-center gap-1.5 shadow-sm transition text-xs">
          <span>Proceed to Prescription (Stage 4)</span>
          <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `;
}

function handleAddOpdInvestigation(e, visitId) {
  e.preventDefault();
  const visit = DAL.findById('Visits', visitId);
  const testId = document.getElementById('opd-order-test').value;
  const priority = document.getElementById('opd-order-priority').value;
  const indication = document.getElementById('opd-order-indication').value.trim();
  const test = DAL.findById('LaboratoryTests', testId);

  const resCount = DAL.find('LaboratoryResults').length + 1;
  const resultObj = {
    ResultID: `RES-${String(resCount).padStart(3, '0')}`,
    PatientID: visit.PatientID,
    VisitID: visitId,
    DoctorID: visit.DoctorID,
    TestID: testId,
    TestName: test.TestName,
    TestDate: visit.VisitDate,
    Result: 'Pending Analysis / Radiologist Report',
    ReferenceRange: test.NormalRange || 'Normal',
    Interpretation: 'Pending',
    Status: priority === 'STAT Urgent' ? 'Processing' : 'Requested',
    Notes: indication || 'Ordered during OPD consultation',
    TechnicianName: 'Diagnostic Staff'
  };

  DAL.create('LaboratoryResults', resultObj);
  showToast(`Ordered: ${test.TestName} (${priority})`, 'success');
  openOpdWorkflow(visitId, 'Investigation');
}

function handleSimulateOpdLabResult(resultId, visitId) {
  const inv = DAL.findById('LaboratoryResults', resultId);
  if (!inv) return;
  const master = DAL.findById('LaboratoryTests', inv.TestID) || {};

  let simulatedFinding = 'Unremarkable normal study.';
  let interp = 'Normal';

  if (master.TestCode === 'XR-CHEST') {
    simulatedFinding = 'Clear lung parenchymal fields. Cardiac silhouette within normal limits. No effusion.';
  } else if (master.TestCode === 'CT-BRAIN') {
    simulatedFinding = 'No acute intracranial hemorrhage or mass effect. Ventricles and sulci normal for age.';
  } else if (master.TestCode === 'ECHO-2D') {
    simulatedFinding = 'LVEF 60%, normal LV systolic function. Trace mitral regurgitation. Normal wall motion.';
  } else if (master.TestCode === 'US-ABD') {
    simulatedFinding = 'Liver, gallbladder, spleen, and bilateral kidneys normal. No cholelithiasis.';
  } else if (master.TestCode === 'CBC') {
    simulatedFinding = 'WBC: 7.2 x10^3/uL, Hgb: 14.1 g/dL, Platelets: 250 x10^3/uL. Normal count.';
  } else if (master.TestCode === 'LIPID') {
    simulatedFinding = 'Total Chol: 195 mg/dL, HDL: 48 mg/dL, LDL: 118 mg/dL (Mild elevation).';
    interp = 'Abnormal';
  } else if (master.TestCode === 'HBA1C') {
    simulatedFinding = 'HbA1c: 6.4% (Consistent with prediabetes range).';
    interp = 'Abnormal';
  }

  DAL.update('LaboratoryResults', resultId, {
    Status: 'Completed',
    Result: simulatedFinding,
    Interpretation: interp,
    TechnicianName: 'Dr. Diagnostic Radiologist, MD'
  });

  showToast(`Result reported for ${inv.TestName}!`, 'success');
  openOpdWorkflow(visitId, 'Investigation');
}

function handleDeleteOpdInvestigation(resultId, visitId) {
  DAL.delete('LaboratoryResults', resultId);
  showToast('Diagnostic order removed.', 'info');
  openOpdWorkflow(visitId, 'Investigation');
}

function handleAdvanceToPrescription(visitId) {
  DAL.update('Visits', visitId, { OpdStage: 'Prescription' });
  showToast('Advancing to Stage 4: Prescription ordering.', 'info');
  openOpdWorkflow(visitId, 'Prescription');
}

// ----------------------------------------------------
// STAGE 4: PRESCRIPTION (MEDICATIONS & PHARMACY ORDERS)
// ----------------------------------------------------
function renderOpdStage4_Prescription(visit, pat, doc, prescriptions, rxItems) {
  const medications = DAL.find('Medications');
  const investigations = DAL.find('LaboratoryResults', { VisitID: visit.VisitID });
  const completedInvs = investigations.filter(i => i.Status === 'Completed');

  return `
    <div class="space-y-4 max-w-4xl mx-auto text-xs">
      <!-- Stage Banner -->
      <div class="p-3.5 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between text-teal-950">
        <div class="flex items-center gap-2">
          <i data-lucide="pill" class="w-5 h-5 text-teal-600"></i>
          <div>
            <h4 class="font-bold text-sm">Stage 4: Electronic Prescription & Pharmacy Orders</h4>
            <p class="text-[11px] text-teal-800">Prescribe medications from formulary with live stock depletion check. Review previous stages and diagnostic findings.</p>
          </div>
        </div>
        <span class="px-2.5 py-1 bg-teal-200 text-teal-900 rounded font-semibold text-[11px]">Pharmacy Desk (${rxItems.length} Rx)</span>
      </div>

      <!-- Clinical Diagnostic Context Summary -->
      <div class="p-3.5 bg-white rounded-lg border border-slate-200 shadow-2xs grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div class="p-2.5 bg-slate-50 rounded border border-slate-100">
          <span class="text-slate-500 uppercase font-bold text-[10px] block mb-0.5">Diagnosis from Stage 2</span>
          <p class="font-bold text-slate-900 text-xs">${visit.DiagnosisSummary || 'Essential Wellness Evaluation'}</p>
        </div>
        <div class="p-2.5 bg-slate-50 rounded border border-slate-100">
          <span class="text-slate-500 uppercase font-bold text-[10px] block mb-0.5">Investigation Findings (${completedInvs.length} ready)</span>
          <p class="text-slate-700 font-medium text-xs">${completedInvs.length > 0 ? completedInvs.map(i => `<span class="font-semibold text-slate-900">${i.TestName}:</span> ${i.Result}`).join('; ') : (visit.NeedsInvestigation === 'No' ? '<span class="italic text-slate-500">None required (Stage 3 Bypassed)</span>' : '<span class="italic text-slate-500">No completed lab results</span>')}</p>
        </div>
      </div>

      <!-- Add Medication Form -->
      <form onsubmit="handleAddOpdPrescriptionItem(event, '${visit.VisitID}')" class="bg-white p-5 rounded-lg border border-teal-200 shadow-2xs space-y-3">
        <h5 class="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
          <i data-lucide="file-plus" class="w-4 h-4 text-teal-600"></i> Add Medication to Prescription Order
        </h5>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div class="md:col-span-2">
            <label class="block font-semibold text-slate-700 mb-1">Select Medication *</label>
            <select id="opd-rx-med" required class="w-full border border-slate-300 rounded p-1.5 font-medium bg-white">
              ${medications.map(m => `
                <option value="${m.MedicationID}" ${m.StockQuantity < 10 ? 'disabled' : ''}>
                  ${m.MedicationName} (${m.Strength}) &bull; Stock: ${m.StockQuantity} ${m.Unit}s &bull; $${parseFloat(m.UnitPrice).toFixed(2)}
                </option>
              `).join('')}
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Route & Dosage Form</label>
            <select id="opd-rx-route" class="w-full border border-slate-300 rounded p-1.5 bg-white font-medium">
              <option value="Oral" selected>Oral (Tablet / Capsule)</option>
              <option value="Inhalation">Inhalation</option>
              <option value="Sublingual">Sublingual</option>
              <option value="Topical">Topical</option>
              <option value="Intravenous (IV)">Intravenous (IV)</option>
              <option value="Intramuscular (IM)">Intramuscular (IM)</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Frequency *</label>
            <select id="opd-rx-freq" required class="w-full border border-slate-300 rounded p-1.5 font-medium bg-white">
              <option value="Once daily morning" selected>Once daily (Morning)</option>
              <option value="Twice daily with meals">Twice daily (With meals)</option>
              <option value="Three times daily">Three times daily</option>
              <option value="Once daily bedtime">Once daily (Bedtime)</option>
              <option value="As needed for pain (PRN)">As needed (PRN)</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Duration *</label>
            <select id="opd-rx-duration" required class="w-full border border-slate-300 rounded p-1.5 bg-white font-medium">
              <option value="3 days">3 days</option>
              <option value="5 days">5 days</option>
              <option value="7 days">7 days</option>
              <option value="14 days">14 days</option>
              <option value="30 days" selected>30 days</option>
              <option value="60 days">60 days</option>
              <option value="90 days">90 days</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Quantity (Units) *</label>
            <input type="number" id="opd-rx-qty" value="30" min="1" max="180" required class="w-full border border-slate-300 rounded p-1.5 font-mono font-bold">
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">Instructions</label>
            <input type="text" id="opd-rx-inst" value="Take with water after meals." class="w-full border border-slate-300 rounded p-1.5">
          </div>
        </div>

        <div class="flex justify-end pt-1">
          <button type="submit" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded flex items-center gap-1.5 shadow-sm transition">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add Drug to Rx
          </button>
        </div>
      </form>

      <!-- Prescribed Items Table -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div class="p-3 bg-slate-50 border-b flex justify-between items-center flex-wrap gap-2">
          <span class="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <i data-lucide="clipboard-list" class="w-4 h-4 text-teal-600"></i> Prescription Order Line Items (${rxItems.length})
          </span>
          <span class="text-[11px] bg-teal-100 text-teal-900 px-2.5 py-0.5 rounded font-medium">Pharmacy Subtotal: <strong class="font-mono font-bold">$${rxItems.reduce((acc, it) => {
            const med = medications.find(m => m.MedicationID === it.MedicationID);
            return acc + (med ? (parseFloat(med.UnitPrice) * (parseInt(it.Quantity) / 10 || 1)) : 15);
          }, 0).toFixed(2)}</strong></span>
        </div>

        ${rxItems.length === 0 ? `
          <div class="p-8 text-center text-slate-400 space-y-2">
            <div class="w-10 h-10 bg-teal-50 text-teal-500 rounded-full flex items-center justify-center mx-auto">
              <i data-lucide="pill" class="w-5 h-5"></i>
            </div>
            <div>
              <p class="font-medium text-slate-700">No medications prescribed for this visit yet.</p>
              <p class="text-[11px] text-slate-400 mt-0.5">Select a drug from the formulary above and click "Add Drug to Rx".</p>
            </div>
          </div>
        ` : `
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] border-b">
                <tr>
                  <th class="p-2.5">Medication Name</th>
                  <th class="p-2.5">Dosage & Frequency</th>
                  <th class="p-2.5">Duration</th>
                  <th class="p-2.5">Quantity</th>
                  <th class="p-2.5">Instructions</th>
                  <th class="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                ${rxItems.map(it => `
                  <tr class="hover:bg-slate-50 transition">
                    <td class="p-2.5 font-bold text-slate-900">${it.MedicationName}</td>
                    <td class="p-2.5 text-slate-700">${it.Dosage || ''} &bull; ${it.Frequency}</td>
                    <td class="p-2.5 text-slate-600">${it.Duration || '30 days'}</td>
                    <td class="p-2.5 font-mono font-bold text-slate-800">${it.Quantity} units</td>
                    <td class="p-2.5 text-slate-600 max-w-sm text-xs">${it.Instructions || 'Take as directed'}</td>
                    <td class="p-2.5 text-right">
                      <button onclick="handleDeleteOpdPrescriptionItem('${it.PrescriptionItemID}', '${it.PrescriptionID}', '${visit.VisitID}')" class="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded text-[11px] font-semibold transition">Remove</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>

      <!-- Navigation Bar -->
      <div class="pt-4 border-t flex justify-between items-center">
        <button type="button" onclick="openOpdWorkflow('${visit.VisitID}', '${visit.NeedsInvestigation === 'Yes' ? 'Investigation' : 'Consultation'}')" class="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50 flex items-center gap-1 font-medium transition text-xs">
          <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i> Back to ${visit.NeedsInvestigation === 'Yes' ? 'Investigation' : 'Consultation'}
        </button>
        <button onclick="handleAdvanceToDischarge('${visit.VisitID}')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded flex items-center gap-1.5 shadow-sm transition text-xs">
          <span>Proceed to Discharge & Billing (Stage 5)</span>
          <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `;
}

function handleAddOpdPrescriptionItem(e, visitId) {
  e.preventDefault();
  const visit = DAL.findById('Visits', visitId);
  const medId = document.getElementById('opd-rx-med').value;
  const route = document.getElementById('opd-rx-route').value;
  const freq = document.getElementById('opd-rx-freq').value;
  const duration = document.getElementById('opd-rx-duration').value;
  const qty = parseInt(document.getElementById('opd-rx-qty').value) || 30;
  const inst = document.getElementById('opd-rx-inst').value.trim();
  const med = DAL.findById('Medications', medId);

  if (!med) return;

  // Real-time stock check
  if (med.StockQuantity < qty) {
    showToast(`Insufficient stock! Available: ${med.StockQuantity} units.`, 'error');
    return;
  }

  // Find or create prescription header
  let rx = DAL.find('Prescriptions', { VisitID: visitId })[0];
  if (!rx) {
    const rxCount = DAL.find('Prescriptions').length + 1;
    rx = DAL.create('Prescriptions', {
      PrescriptionNumber: `PRX-2026-${String(rxCount).padStart(4, '0')}`,
      PatientID: visit.PatientID,
      DoctorID: visit.DoctorID,
      VisitID: visitId,
      PrescriptionDate: visit.VisitDate,
      Status: 'Active',
      Instructions: 'Dispensed per clinical OPD consultation protocol.'
    });
  }

  // Create Item
  const itemCount = DAL.find('PrescriptionItems').length + 1;
  DAL.create('PrescriptionItems', {
    PrescriptionItemID: `RXI-${String(itemCount).padStart(3, '0')}`,
    PrescriptionID: rx.PrescriptionID,
    MedicationID: medId,
    MedicationName: med.MedicationName,
    Dosage: med.Strength,
    Frequency: freq,
    Duration: duration,
    Quantity: qty,
    Route: route,
    Instructions: inst
  });

  // Deplete stock
  DAL.update('Medications', medId, {
    StockQuantity: med.StockQuantity - qty,
    Status: (med.StockQuantity - qty) <= med.ReorderLevel ? 'Low Stock' : 'In Stock'
  });

  showToast(`Added ${med.MedicationName} (${qty} units). Stock updated.`, 'success');
  openOpdWorkflow(visitId, 'Prescription');
}

function handleDeleteOpdPrescriptionItem(itemId, rxId, visitId) {
  const item = DAL.findById('PrescriptionItems', itemId);
  if (item && item.MedicationID) {
    const med = DAL.findById('Medications', item.MedicationID);
    if (med) {
      DAL.update('Medications', med.MedicationID, {
        StockQuantity: med.StockQuantity + (parseInt(item.Quantity) || 30)
      });
    }
  }
  DAL.delete('PrescriptionItems', itemId);
  showToast('Medication removed and inventory stock restored.', 'info');
  openOpdWorkflow(visitId, 'Prescription');
}

function handleAdvanceToDischarge(visitId) {
  DAL.update('Visits', visitId, { OpdStage: 'Discharge' });
  showToast('Advancing to Stage 5: Discharge & Final Billing.', 'info');
  openOpdWorkflow(visitId, 'Discharge');
}

// ----------------------------------------------------
// STAGE 5: DISCHARGE & CLEARANCE (FINAL BILLING)
// ----------------------------------------------------
function renderOpdStage5_Discharge(visit, pat, doc, investigations, prescriptions, rxItems) {
  const masterTests = DAL.find('LaboratoryTests');
  const masterMeds = DAL.find('Medications');

  // Math for itemized discharge bill
  const consultFee = 50.00;
  const labServicesTotal = investigations.reduce((acc, inv) => {
    const m = masterTests.find(t => t.TestID === inv.TestID);
    return acc + (m ? parseFloat(m.Cost) : 35);
  }, 0);
  const pharmacyTotal = rxItems.reduce((acc, it) => {
    const m = masterMeds.find(med => med.MedicationID === it.MedicationID);
    return acc + (m ? (parseFloat(m.UnitPrice) * (parseInt(it.Quantity) / 10 || 1)) : 15);
  }, 0);
  const totalBill = consultFee + labServicesTotal + pharmacyTotal;
  const isCompleted = visit.VisitStatus === 'Completed';

  return `
    <div class="space-y-4 max-w-4xl mx-auto text-xs">
      <!-- Stage Banner -->
      <div class="p-3.5 ${isCompleted ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'} border rounded-lg flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i data-lucide="${isCompleted ? 'check-check' : 'log-out'}" class="w-5 h-5 ${isCompleted ? 'text-emerald-600' : 'text-rose-600'}"></i>
          <div>
            <h4 class="font-bold text-sm">Stage 5: Patient Discharge & Clearance</h4>
            <p class="text-[11px] ${isCompleted ? 'text-emerald-800' : 'text-rose-800'}">Finalize encounter disposition, record clinical discharge summary, schedule follow-up, and generate invoice.</p>
          </div>
        </div>
        <span class="px-2.5 py-1 ${isCompleted ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'} rounded font-semibold text-[11px]">${isCompleted ? 'Completed' : 'Clearance Desk'}</span>
      </div>

      <form onsubmit="handleFinalizeOpdDischarge(event, '${visit.VisitID}')" class="space-y-4">
        <!-- Disposition & Scheduling -->
        <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <h5 class="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
            <i data-lucide="log-out" class="w-4 h-4 text-rose-600"></i> Clinical Disposition & Patient Care Plan
          </h5>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Discharge Disposition *</label>
              <select id="opd-discharge-disp" required ${isCompleted ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2 font-medium bg-white">
                <option value="Discharged Home" ${visit.DischargeDisposition === 'Discharged Home' ? 'selected' : ''}>Discharged Home (Routine Clearance)</option>
                <option value="Follow-up in OPD Clinic" ${visit.DischargeDisposition === 'Follow-up in OPD Clinic' ? 'selected' : ''}>Follow-up in OPD Clinic</option>
                <option value="Specialist Referral" ${visit.DischargeDisposition === 'Specialist Referral' ? 'selected' : ''}>Referral to Specialist / Higher Center</option>
                <option value="Admit to Inpatient (IPD)" ${visit.DischargeDisposition === 'Admit to Inpatient (IPD)' ? 'selected' : ''}>Admit to Inpatient Department (IPD)</option>
                <option value="Emergency Transfer" ${visit.DischargeDisposition === 'Emergency Transfer' ? 'selected' : ''}>Emergency Ambulance Transfer</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Follow-up Review Date</label>
              <input type="date" id="opd-discharge-followup" value="${visit.FollowUpDate || '2026-04-15'}" ${isCompleted ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2 bg-white">
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Discharge Clinical Summary & Patient Instructions *</label>
            <textarea id="opd-discharge-notes" rows="3" required ${isCompleted ? 'disabled' : ''} placeholder="Patient instructions, red-flag warning signs, compliance advice..." class="w-full border border-slate-300 rounded p-2.5 leading-relaxed">${visit.DischargeNotes || 'Patient clinically stable upon discharge. Advised strict medication adherence, low-sodium diet, and urgent return to ER if symptoms worsen.'}</textarea>
          </div>
        </div>

        <!-- Automated Itemized Billing Card -->
        <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-3">
          <h5 class="font-bold text-slate-800 border-b pb-2 flex items-center justify-between flex-wrap gap-2">
            <span class="flex items-center gap-2"><i data-lucide="receipt" class="w-4 h-4 text-emerald-600"></i> Itemized Discharge Billing Summary</span>
            <span class="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">Total Due: $${totalBill.toFixed(2)}</span>
          </h5>

          <div class="space-y-2 text-xs">
            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-600 font-medium">Physician Clinical Consultation Fee:</span>
              <span class="font-mono font-bold text-slate-900">$${consultFee.toFixed(2)}</span>
            </div>

            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-600 font-medium">Diagnostic Investigations (${investigations.length} order${investigations.length !== 1 ? 's' : ''}):</span>
              <span class="font-mono font-bold text-slate-900">$${labServicesTotal.toFixed(2)}</span>
            </div>
            ${investigations.map(inv => {
              const m = masterTests.find(t => t.TestID === inv.TestID) || {};
              return `
                <div class="flex justify-between pl-3 text-[11px] text-slate-500 py-0.5">
                  <span>&bull; ${inv.TestName}</span>
                  <span class="font-mono font-medium">$${parseFloat(m.Cost || 35).toFixed(2)}</span>
                </div>
              `;
            }).join('')}

            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-600 font-medium">Pharmacy Formulary Prescriptions (${rxItems.length} item${rxItems.length !== 1 ? 's' : ''}):</span>
              <span class="font-mono font-bold text-slate-900">$${pharmacyTotal.toFixed(2)}</span>
            </div>
            ${rxItems.map(it => {
              const m = masterMeds.find(med => med.MedicationID === it.MedicationID);
              const price = m ? (parseFloat(m.UnitPrice) * (parseInt(it.Quantity) / 10 || 1)) : 15;
              return `
                <div class="flex justify-between pl-3 text-[11px] text-slate-500 py-0.5">
                  <span>&bull; ${it.MedicationName} (${it.Quantity} units)</span>
                  <span class="font-mono font-medium">$${price.toFixed(2)}</span>
                </div>
              `;
            }).join('')}

            <div class="flex justify-between pt-2 text-sm font-bold text-slate-900 border-t-2 border-slate-200">
              <span>Total OPD Encounter Balance:</span>
              <span class="text-emerald-700 font-mono font-extrabold text-base">$${totalBill.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- IPD Transfer Quick Bridge -->
        <div class="p-3.5 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2.5">
            <i data-lucide="bed" class="w-5 h-5 text-indigo-600 shrink-0"></i>
            <div>
              <span class="font-bold text-indigo-950 text-xs">Need Inpatient Admission?</span>
              <p class="text-[11px] text-indigo-800">Immediately transfer this patient from Outpatient to Inpatient (IPD) ward & bed.</p>
            </div>
          </div>
          <button type="button" onclick="transferOpdToIpd('${visit.VisitID}')" class="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-sm transition whitespace-nowrap">
            <i data-lucide="log-in" class="w-3.5 h-3.5"></i> Admit to Inpatient (IPD)
          </button>
        </div>

        <!-- Final Action Bar -->
        <div class="pt-4 border-t flex justify-between items-center flex-wrap gap-2">
          <button type="button" onclick="openOpdWorkflow('${visit.VisitID}', 'Prescription')" class="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50 flex items-center gap-1 font-medium transition text-xs">
            <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i> Back to Prescription
          </button>
          <div class="flex items-center gap-2">
            <button type="button" onclick="window.print()" class="px-3 py-1.5 border rounded text-slate-600 hover:bg-slate-50 flex items-center gap-1 font-medium text-xs transition">
              <i data-lucide="printer" class="w-3.5 h-3.5"></i> Print Summary
            </button>
            ${!isCompleted ? `
              <button type="submit" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded flex items-center gap-1.5 shadow-sm transition text-xs">
                <i data-lucide="check" class="w-3.5 h-3.5"></i> Finalize OPD Encounter & Clear Discharge
              </button>
            ` : `
              <span class="px-4 py-2 bg-emerald-100 text-emerald-800 font-bold rounded flex items-center gap-1 text-xs">
                <i data-lucide="check-check" class="w-3.5 h-3.5"></i> Encounter Finalized & Cleared
              </span>
            `}
          </div>
        </div>
      </form>
    </div>
  `;
}

function transferOpdToIpd(visitId) {
  const visit = DAL.findById('Visits', visitId);
  if (!visit) return;
  closeModal();
  openNewAdmissionModal(visit.PatientID, visit.DoctorID, visit.VisitID, visit.DiagnosisSummary || visit.ChiefComplaint);
}

function handleFinalizeOpdDischarge(e, visitId) {
  e.preventDefault();
  const visit = DAL.findById('Visits', visitId);
  const disp = document.getElementById('opd-discharge-disp').value;
  const followup = document.getElementById('opd-discharge-followup').value;
  const notes = document.getElementById('opd-discharge-notes').value.trim();

  const masterTests = DAL.find('LaboratoryTests');
  const masterMeds = DAL.find('Medications');
  const investigations = DAL.find('LaboratoryResults', { VisitID: visitId });
  const prescriptions = DAL.find('Prescriptions', { VisitID: visitId });
  let rxItems = [];
  prescriptions.forEach(rx => {
    rxItems = rxItems.concat(DAL.find('PrescriptionItems', { PrescriptionID: rx.PrescriptionID }));
  });

  const consultFee = 50.00;
  const labServicesTotal = investigations.reduce((acc, inv) => {
    const m = masterTests.find(t => t.TestID === inv.TestID);
    return acc + (m ? parseFloat(m.Cost) : 35);
  }, 0);
  const pharmacyTotal = rxItems.reduce((acc, it) => {
    const m = masterMeds.find(med => med.MedicationID === it.MedicationID);
    return acc + (m ? (parseFloat(m.UnitPrice) * (parseInt(it.Quantity) / 10 || 1)) : 15);
  }, 0);
  const totalBill = consultFee + labServicesTotal + pharmacyTotal;

  // Update Visit
  DAL.update('Visits', visitId, {
    VisitStatus: 'Completed',
    OpdStage: 'Completed',
    DischargeDisposition: disp,
    DischargeNotes: notes,
    FollowUpDate: followup
  });

  // Create Invoice
  const invCount = DAL.find('Invoices').length + 1;
  DAL.create('Invoices', {
    InvoiceNumber: `INV-2026-${String(invCount).padStart(4, '0')}`,
    PatientID: visit.PatientID,
    VisitID: visitId,
    InvoiceDate: visit.VisitDate,
    TotalAmount: totalBill,
    Discount: 0,
    Tax: 0,
    AmountPaid: 0,
    Balance: totalBill,
    PaymentStatus: 'Unpaid',
    Notes: `OPD Discharge Invoice (Consultation: $${consultFee.toFixed(2)}, Investigations: $${labServicesTotal.toFixed(2)}, Pharmacy: $${pharmacyTotal.toFixed(2)})`
  });

  // Create Follow-up if selected
  if (followup) {
    DAL.create('FollowUps', {
      PatientID: visit.PatientID,
      DoctorID: visit.DoctorID,
      RelatedVisitID: visitId,
      FollowUpDate: followup,
      Reason: `OPD Post-Discharge Review: ${visit.DiagnosisSummary || 'Clinical Follow-up'}`,
      Status: 'Pending'
    });
  }

  closeModal();
  showToast(`Encounter ${visitId} finalized! Discharge invoice of $${totalBill.toFixed(2)} generated.`, 'success');
  renderMainView();

  if (disp === 'Admit to Inpatient (IPD)') {
    setTimeout(() => {
      showToast('Encounter completed. Launching Inpatient Bed Assignment...', 'info');
      openNewAdmissionModal(visit.PatientID, visit.DoctorID, visitId, visit.DiagnosisSummary || visit.ChiefComplaint);
    }, 600);
  }
}

function openEnterLabResultModal(resultId) {
  const res = DAL.findById('LaboratoryResults', resultId);
  if (!res) return;
  const pat = DAL.findById('Patients', res.PatientID) || {};

  openModal(`
    <div class="px-6 py-4 bg-[#002050] text-white flex justify-between items-center">
      <h3 class="font-bold text-sm flex items-center gap-2"><i data-lucide="microscope" class="w-4 h-4 text-violet-400"></i> Enter Laboratory Result</h3>
      <button onclick="closeModal()" class="text-slate-300 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
    </div>
    <form onsubmit="handleSaveLabResult(event, '${resultId}')" class="p-6 space-y-4 text-xs">
      <div class="p-2.5 bg-purple-50 border border-purple-200 rounded text-purple-900 font-medium">
        Test: <strong>${res.TestName}</strong> &bull; Patient: <strong>${pat.FirstName} ${pat.LastName}</strong> &bull; Ref Range: <strong>${res.ReferenceRange}</strong>
      </div>
      <div>
        <label class="block font-semibold text-slate-700 mb-1">Result Findings / Values *</label>
        <input type="text" id="lab-res-val" required placeholder="e.g. 5.8% (Normal), WBC 7.2" class="w-full border border-slate-300 rounded p-2 font-mono">
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Clinical Interpretation *</label>
          <select id="lab-res-interp" required class="w-full border border-slate-300 rounded p-2">
            <option value="Normal">Normal</option>
            <option value="Abnormal">Abnormal</option>
            <option value="Critical High">Critical High</option>
            <option value="Critical Low">Critical Low</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Technician Name</label>
          <input type="text" id="lab-tech" value="James Peterson, MT" class="w-full border border-slate-300 rounded p-2">
        </div>
      </div>
      <div class="pt-4 border-t flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded text-slate-600">Cancel</button>
        <button type="submit" class="px-4 py-2 bg-purple-600 text-white font-semibold rounded hover:bg-purple-700">Verify & Complete Result</button>
      </div>
    </form>
  `);
}

function handleSaveLabResult(e, resultId) {
  e.preventDefault();
  DAL.update('LaboratoryResults', resultId, {
    Result: document.getElementById('lab-res-val').value.trim(),
    Interpretation: document.getElementById('lab-res-interp').value,
    TechnicianName: document.getElementById('lab-tech').value.trim(),
    Status: 'Completed'
  });
  closeModal();
  showToast('Laboratory test result verified and saved!', 'success');
  renderMainView();
}

function openRecordPaymentModal(invoiceId) {
  const inv = DAL.findById('Invoices', invoiceId);
  if (!inv) return;
  const pat = DAL.findById('Patients', inv.PatientID) || {};

  openModal(`
    <div class="px-6 py-4 bg-[#002050] text-white flex justify-between items-center">
      <h3 class="font-bold text-sm flex items-center gap-2"><i data-lucide="credit-card" class="w-4 h-4 text-emerald-400"></i> Cashier Payment Checkout</h3>
      <button onclick="closeModal()" class="text-slate-300 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
    </div>
    <form onsubmit="handleSavePayment(event, '${invoiceId}')" class="p-6 space-y-4 text-xs">
      <div class="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 flex justify-between items-center">
        <div>
          <p class="font-bold">Invoice: ${inv.InvoiceNumber}</p>
          <p class="text-[11px] text-emerald-800">Patient: ${pat.FirstName} ${pat.LastName} (${pat.PatientNumber})</p>
        </div>
        <div class="text-right">
          <p class="text-[10px] text-emerald-700 uppercase font-bold">Outstanding Balance</p>
          <p class="text-xl font-bold text-emerald-800">$${inv.Balance.toFixed(2)}</p>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Payment Amount ($) *</label>
          <input type="number" step="0.01" id="pay-amount-input" value="${inv.Balance.toFixed(2)}" max="${inv.Balance}" required class="w-full border border-slate-300 rounded p-2 text-sm font-bold">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Payment Method *</label>
          <select id="pay-method-input" required class="w-full border border-slate-300 rounded p-2">
            <option value="Credit Card">Credit Card</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div>
        <label class="block font-semibold text-slate-700 mb-1">Reference / Transaction Number</label>
        <input type="text" id="pay-ref" value="TXN-${Math.floor(100000 + Math.random() * 900000)}" class="w-full border border-slate-300 rounded p-2 font-mono">
      </div>
      <div class="pt-4 border-t flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded text-slate-600">Cancel</button>
        <button type="submit" class="px-4 py-2 bg-emerald-600 text-white font-semibold rounded hover:bg-emerald-700">Process Receipt</button>
      </div>
    </form>
  `);
}

function handleSavePayment(e, invoiceId) {
  e.preventDefault();
  const amount = parseFloat(document.getElementById('pay-amount-input').value);
  const method = document.getElementById('pay-method-input').value;
  const ref = document.getElementById('pay-ref').value;

  const validation = BusinessRules.validatePayment(invoiceId, amount);
  if (!validation.valid) {
    showToast(validation.message, 'error');
    return;
  }

  const inv = validation.invoice;
  const newPaid = parseFloat(((inv.AmountPaid || 0) + amount).toFixed(2));
  const newBal = parseFloat((inv.TotalAmount - newPaid).toFixed(2));
  const newStatus = newBal <= 0.01 ? 'Paid' : 'Partially Paid';

  DAL.update('Invoices', invoiceId, {
    AmountPaid: newPaid,
    Balance: Math.max(0, newBal),
    PaymentStatus: newStatus
  });

  DAL.create('Payments', {
    InvoiceID: invoiceId,
    PatientID: inv.PatientID,
    PaymentDate: new Date().toISOString().split('T')[0],
    Amount: amount,
    PaymentMethod: method,
    ReferenceNumber: ref,
    ReceivedBy: appState.currentRole === 'Accountant' ? 'Rachel Green, CPA' : 'Cashier Office'
  });

  closeModal();
  showToast(`Payment of $${amount.toFixed(2)} processed! Invoice balance updated to $${Math.max(0, newBal).toFixed(2)}.`, 'success');
  renderMainView();
}

function updatePaymentDueDisplay(invoiceId) {
  const banner = document.getElementById('payment-due-banner');
  const amtInput = document.getElementById('pay-amount');
  if (!banner) return;
  if (!invoiceId) {
    banner.innerHTML = 'Select an invoice above to view balance due.';
    banner.className = 'p-2 bg-slate-50 border rounded text-slate-700 font-medium';
    if (amtInput) amtInput.value = '';
    return;
  }
  const inv = DAL.findById('Invoices', invoiceId);
  if (!inv) return;
  const pat = DAL.findById('Patients', inv.PatientID) || {};
  banner.className = 'p-2.5 bg-blue-50 border border-blue-200 rounded text-slate-800 text-xs flex justify-between items-center';
  banner.innerHTML = `
    <div>
      <span class="font-bold text-blue-900">${inv.InvoiceNumber}</span> - ${pat.FirstName || ''} ${pat.LastName || ''}
      <span class="ml-2 text-slate-500">Total: $${inv.TotalAmount.toFixed(2)} | Paid: $${(inv.AmountPaid || 0).toFixed(2)}</span>
    </div>
    <div class="text-right">
      <span class="text-[10px] text-blue-700 uppercase font-bold block">Balance Due</span>
      <span class="font-bold text-blue-900 text-sm">$${inv.Balance.toFixed(2)}</span>
    </div>
  `;
  if (amtInput) {
    amtInput.value = inv.Balance.toFixed(2);
    amtInput.max = inv.Balance;
  }
}

function handleRecordPayment(e) {
  e.preventDefault();
  const invoiceId = document.getElementById('pay-invoice-id').value;
  const amount = parseFloat(document.getElementById('pay-amount').value);
  const method = document.getElementById('pay-method').value;

  if (!invoiceId) {
    showToast('Please select an outstanding invoice', 'error');
    return;
  }
  const validation = BusinessRules.validatePayment(invoiceId, amount);
  if (!validation.valid) {
    showToast(validation.message, 'error');
    return;
  }

  const inv = validation.invoice;
  const newPaid = parseFloat(((inv.AmountPaid || 0) + amount).toFixed(2));
  const newBal = parseFloat((inv.TotalAmount - newPaid).toFixed(2));
  const newStatus = newBal <= 0.01 ? 'Paid' : 'Partially Paid';

  DAL.update('Invoices', invoiceId, {
    AmountPaid: newPaid,
    Balance: Math.max(0, newBal),
    PaymentStatus: newStatus
  });

  DAL.create('Payments', {
    InvoiceID: invoiceId,
    PatientID: inv.PatientID,
    PaymentDate: new Date().toISOString().split('T')[0],
    Amount: amount,
    PaymentMethod: method,
    ReferenceNumber: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    ReceivedBy: appState.currentRole === 'Accountant' ? 'Rachel Green, CPA' : 'Cashier Office'
  });

  closeModal();
  showToast(`Payment of $${amount.toFixed(2)} recorded successfully!`, 'success');
  renderMainView();
}

function openRescheduleModal(apptId) {
  const appt = DAL.findById('Appointments', apptId);
  if (!appt) return;

  openModal(`
    <div class="px-6 py-4 bg-[#002050] text-white flex justify-between items-center">
      <h3 class="font-bold text-sm flex items-center gap-2"><i data-lucide="clock" class="w-4 h-4 text-indigo-400"></i> Reschedule Appointment ${appt.AppointmentNumber}</h3>
      <button onclick="closeModal()" class="text-slate-300 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
    </div>
    <form onsubmit="handleReschedule(event, '${apptId}')" class="p-6 space-y-4 text-xs">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">New Date *</label>
          <input type="date" id="resched-date" value="${appt.AppointmentDate}" required class="w-full border border-slate-300 rounded p-2">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">New Start Time *</label>
          <select id="resched-time" required class="w-full border border-slate-300 rounded p-2">
            <option value="08:30" ${appt.StartTime === '08:30' ? 'selected' : ''}>08:30 AM</option>
            <option value="09:15" ${appt.StartTime === '09:15' ? 'selected' : ''}>09:15 AM</option>
            <option value="10:00" ${appt.StartTime === '10:00' ? 'selected' : ''}>10:00 AM</option>
            <option value="11:00" ${appt.StartTime === '11:00' ? 'selected' : ''}>11:00 AM</option>
            <option value="13:30" ${appt.StartTime === '13:30' ? 'selected' : ''}>01:30 PM</option>
            <option value="14:30" ${appt.StartTime === '14:30' ? 'selected' : ''}>02:30 PM</option>
          </select>
        </div>
      </div>
      <div class="pt-4 border-t flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded text-slate-600">Cancel</button>
        <button type="submit" class="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">Confirm Reschedule</button>
      </div>
    </form>
  `);
}

function handleReschedule(e, apptId) {
  e.preventDefault();
  const appt = DAL.findById('Appointments', apptId);
  const newDate = document.getElementById('resched-date').value;
  const newTime = document.getElementById('resched-time').value;

  const testAppt = Object.assign({}, appt, { AppointmentDate: newDate, StartTime: newTime });
  const validation = BusinessRules.validateAppointment(testAppt, true, apptId);
  if (!validation.valid) {
    showToast(validation.message, 'error');
    return;
  }

  DAL.update('Appointments', apptId, {
    AppointmentDate: newDate,
    StartTime: newTime,
    EndTime: calculateEndTime(newTime),
    Status: 'Confirmed'
  });
  closeModal();
  showToast(`Appointment rescheduled to ${newDate} at ${newTime}!`, 'success');
  renderMainView();
}

// ==========================================
// 14B. INPATIENT DEPARTMENT (IPD) WORKFLOW & MODALS
// ==========================================
function quickChangeBedStatus(bedId, newStatus) {
  if (!newStatus) return;
  const bed = DAL.findById('Beds', bedId);
  if (!bed) return;

  const updateData = { Status: newStatus };
  if (newStatus === 'Available') {
    updateData.CurrentAdmissionID = null;
  }
  DAL.update('Beds', bedId, updateData);
  showToast(`Bed ${bed.BedNumber} updated to ${newStatus}.`, 'info');
  renderMainView();
}

function openNewBedModal() {
  openModal(`
    <div class="px-6 py-4 bg-[#002050] text-white flex justify-between items-center">
      <h3 class="font-bold text-sm flex items-center gap-2"><i data-lucide="bed" class="w-4 h-4 text-blue-400"></i> Add New Hospital Bed</h3>
      <button onclick="closeModal()" class="text-slate-300 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
    </div>
    <form onsubmit="handleCreateBed(event)" class="p-6 space-y-4 text-xs">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Bed Number *</label>
          <input type="text" id="new-bed-number" required placeholder="e.g. BED-401" class="w-full border border-slate-300 rounded p-2 font-mono">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Ward Name *</label>
          <select id="new-bed-ward" required class="w-full border border-slate-300 rounded p-2">
            <option value="General Medical Ward A">General Medical Ward A</option>
            <option value="Surgical Ward B">Surgical Ward B</option>
            <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
            <option value="Private Deluxe Ward">Private Deluxe Ward</option>
            <option value="Pediatric Ward">Pediatric Ward</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Bed Type *</label>
          <select id="new-bed-type" required class="w-full border border-slate-300 rounded p-2">
            <option value="Standard General">Standard General</option>
            <option value="ICU Bed">ICU Bed</option>
            <option value="Private Single">Private Single</option>
            <option value="Semi-Private">Semi-Private</option>
            <option value="Pediatric Crib">Pediatric Crib</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Daily Bed Rate ($) *</label>
          <input type="number" id="new-bed-rate" value="120" min="0" step="5" required class="w-full border border-slate-300 rounded p-2 font-mono">
        </div>
      </div>
      <div>
        <label class="block font-semibold text-slate-700 mb-1">Initial Status</label>
        <select id="new-bed-status" class="w-full border border-slate-300 rounded p-2">
          <option value="Available">Available</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Maintenance">Maintenance</option>
        </select>
      </div>
      <div class="pt-4 border-t flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50">Cancel</button>
        <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded">Create Bed</button>
      </div>
    </form>
  `);
}

function handleCreateBed(e) {
  e.preventDefault();
  const allBeds = DAL.find('Beds');
  const bedNum = document.getElementById('new-bed-number').value.trim();
  const ward = document.getElementById('new-bed-ward').value;
  const type = document.getElementById('new-bed-type').value;
  const rate = parseFloat(document.getElementById('new-bed-rate').value) || 120;
  const status = document.getElementById('new-bed-status').value;

  const newBedId = `BED-${String(allBeds.length + 1).padStart(3, '0')}`;
  DAL.create('Beds', {
    BedID: newBedId,
    BedNumber: bedNum,
    WardName: ward,
    BedType: type,
    DailyRate: rate,
    Status: status,
    CurrentAdmissionID: null
  });

  closeModal();
  showToast(`Bed ${bedNum} created in ${ward}!`, 'success');
  renderMainView();
}

function openNewAdmissionModal(patientId, doctorId, visitId, diagnosis, preselectedBedId) {
  const patients = DAL.find('Patients');
  const doctors = DAL.find('Doctors');
  const visits = DAL.find('Visits');
  const allBeds = DAL.find('Beds');
  const admissions = DAL.find('Admissions');

  const availableBeds = allBeds.filter(b => b.Status === 'Available' || b.BedID === preselectedBedId);
  const nextNum = `ADM-2026-${String(admissions.length + 1).padStart(4, '0')}`;
  const today = new Date().toISOString().split('T')[0];

  openModal(`
    <div class="px-6 py-4 bg-[#002050] text-white flex justify-between items-center">
      <h3 class="font-bold text-sm flex items-center gap-2"><i data-lucide="bed" class="w-4 h-4 text-blue-400"></i> New Inpatient Admission & Bed Allocation</h3>
      <button onclick="closeModal()" class="text-slate-300 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
    </div>
    <form onsubmit="handleCreateAdmission(event)" class="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh] custom-scrollbar">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Admission Number (Generated)</label>
          <input type="text" id="adm-number" value="${nextNum}" readonly class="w-full border border-slate-300 rounded p-2 font-mono font-bold bg-slate-50 text-blue-800">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Admission Date *</label>
          <input type="date" id="adm-date" value="${today}" required class="w-full border border-slate-300 rounded p-2 font-mono">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Select Patient *</label>
          <select id="adm-patient" required class="w-full border border-slate-300 rounded p-2">
            <option value="">-- Choose Patient --</option>
            ${patients.map(p => `<option value="${p.PatientID}" ${p.PatientID === patientId ? 'selected' : ''}>${p.FirstName} ${p.LastName} (${p.PatientNumber})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Attending Physician *</label>
          <select id="adm-doctor" required class="w-full border border-slate-300 rounded p-2">
            <option value="">-- Choose Attending Doctor --</option>
            ${doctors.map(d => `<option value="${d.DoctorID}" ${d.DoctorID === doctorId ? 'selected' : ''}>${d.DoctorName} (${d.Specialization})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Ward & Bed Allocation *</label>
          <select id="adm-bed" required class="w-full border border-slate-300 rounded p-2 font-medium">
            <option value="">-- Select Available Hospital Bed --</option>
            ${availableBeds.map(b => `<option value="${b.BedID}" ${b.BedID === preselectedBedId ? 'selected' : ''}>${b.WardName} - ${b.BedNumber} (${b.BedType}, $${parseFloat(b.DailyRate).toFixed(0)}/day)</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Admission Type *</label>
          <select id="adm-type" required class="w-full border border-slate-300 rounded p-2">
            <option value="Emergency" ${visitId ? 'selected' : ''}>Emergency Admission</option>
            <option value="Elective">Elective / Scheduled</option>
            <option value="OPD Transfer" ${visitId ? 'selected' : ''}>OPD Transfer</option>
            <option value="Referral">Specialist / External Referral</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Patient Current Condition *</label>
          <select id="adm-condition" required class="w-full border border-slate-300 rounded p-2 font-medium">
            <option value="Stable">Stable (Routine Monitoring)</option>
            <option value="Guarded">Guarded (Frequent Nursing)</option>
            <option value="Serious">Serious (High-Dependency)</option>
            <option value="Critical">Critical (ICU Intensive)</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Source OPD Encounter (Optional)</label>
          <select id="adm-source-visit" class="w-full border border-slate-300 rounded p-2 font-mono">
            <option value="">None / Direct Inpatient</option>
            ${visits.map(v => `<option value="${v.VisitID}" ${v.VisitID === visitId ? 'selected' : ''}>${v.VisitID} (${v.VisitDate} - ${v.ChiefComplaint || 'OPD'})</option>`).join('')}
          </select>
        </div>
      </div>

      <div>
        <label class="block font-semibold text-slate-700 mb-1">Admitting Clinical Diagnosis *</label>
        <input type="text" id="adm-diagnosis" value="${diagnosis || ''}" required placeholder="Primary condition requiring inpatient admission..." class="w-full border border-slate-300 rounded p-2">
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Inpatient Diet Order</label>
          <select id="adm-diet" class="w-full border border-slate-300 rounded p-2">
            <option value="Regular Hospital Diet">Regular Hospital Diet</option>
            <option value="Low Sodium / Cardiac Diet">Low Sodium / Cardiac Diet</option>
            <option value="Diabetic Low-Sugar Diet">Diabetic Low-Sugar Diet</option>
            <option value="Renal Diet">Renal Diet</option>
            <option value="NPO (Nothing by Mouth)">NPO (Nothing by Mouth)</option>
            <option value="Clear Liquid Diet">Clear Liquid Diet</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Nursing Care & Fall Risk Precautions</label>
          <select id="adm-precautions" class="w-full border border-slate-300 rounded p-2">
            <option value="Standard Hospital Precautions">Standard Hospital Precautions</option>
            <option value="High Fall Risk Protocol">High Fall Risk Protocol</option>
            <option value="Contact Isolation">Contact Isolation</option>
            <option value="Droplet / Airborne Precautions">Droplet / Airborne Precautions</option>
            <option value="Strict Bed Rest">Strict Bed Rest</option>
          </select>
        </div>
      </div>

      <div>
        <label class="block font-semibold text-slate-700 mb-1">Initial Nursing & Physician Admission Notes</label>
        <textarea id="adm-notes" rows="2" placeholder="Admission baseline assessment, allergies, emergency contact..." class="w-full border border-slate-300 rounded p-2"></textarea>
      </div>

      <div class="pt-4 border-t flex justify-between items-center">
        <span class="text-[11px] text-slate-500">Assigns bed and launches IPD Clinical Process Workflow.</span>
        <div class="flex gap-2">
          <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="submit" class="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded flex items-center gap-1.5 shadow-sm">
            <i data-lucide="check" class="w-4 h-4"></i> Admit Patient & Assign Bed
          </button>
        </div>
      </div>
    </form>
  `);
}

function handleCreateAdmission(e) {
  e.preventDefault();
  const admNum = document.getElementById('adm-number').value;
  const admDate = document.getElementById('adm-date').value;
  const patientId = document.getElementById('adm-patient').value;
  const doctorId = document.getElementById('adm-doctor').value;
  const bedId = document.getElementById('adm-bed').value;
  const admType = document.getElementById('adm-type').value;
  const condition = document.getElementById('adm-condition').value;
  const sourceVisit = document.getElementById('adm-source-visit').value || '';
  const diagnosis = document.getElementById('adm-diagnosis').value.trim();
  const diet = document.getElementById('adm-diet').value;
  const precautions = document.getElementById('adm-precautions').value;
  const notes = document.getElementById('adm-notes').value.trim();

  const allAdmissions = DAL.find('Admissions');
  const newAdmId = `ADM-${String(allAdmissions.length + 1).padStart(4, '0')}`;

  // 1. Create Admission Record
  DAL.create('Admissions', {
    AdmissionID: newAdmId,
    AdmissionNumber: admNum,
    PatientID: patientId,
    DoctorID: doctorId,
    DepartmentID: 'DEP-001',
    BedID: bedId,
    AdmissionDate: admDate,
    AdmissionType: admType,
    SourceEncounterID: sourceVisit,
    AdmittingDiagnosis: diagnosis,
    CurrentCondition: condition,
    IpdStage: 'BedAssignment',
    ExpectedDischargeDate: '',
    ActualDischargeDate: '',
    DischargeDisposition: '',
    DischargeSummary: '',
    TotalDays: 1,
    Status: 'Admitted'
  });

  // 2. Mark Bed as Occupied
  DAL.update('Beds', bedId, {
    Status: 'Occupied',
    CurrentAdmissionID: newAdmId
  });

  // 3. Create Baseline Admission Round (SOAP Day 1)
  const allRounds = DAL.find('DailyRounds');
  const roundId = `RND-${String(allRounds.length + 1).padStart(4, '0')}`;
  DAL.create('DailyRounds', {
    RoundID: roundId,
    AdmissionID: newAdmId,
    PatientID: patientId,
    DoctorID: doctorId,
    RoundDate: admDate,
    RoundType: 'Physician Round',
    Subjective: `Day 1 Admission. Chief complaint: ${diagnosis}. Initial notes: ${notes || 'Patient received and oriented to inpatient unit.'}`,
    Objective: `Vitals stable on admission. Bed assigned: ${bedId}. Diet: ${diet}. Precautions: ${precautions}.`,
    Assessment: `Admitted for inpatient care and stabilization. Trajectory: ${condition}.`,
    Plan: `Initiate inpatient care protocol, order baseline labs, monitor vitals Q4H, daily SOAP rounds.`,
    RecordedBy: 'Admitting Physician'
  });

  closeModal();
  showToast(`Admission ${admNum} confirmed! Bed ${bedId} assigned.`, 'success');
  renderMainView();
  openIpdWorkflow(newAdmId, 'BedAssignment');
}

function openIpdWorkflow(admissionId, stageOverride) {
  const adm = DAL.findById('Admissions', admissionId);
  if (!adm) {
    showToast('Inpatient record not found.', 'error');
    return;
  }

  const pat = DAL.findById('Patients', adm.PatientID) || {};
  const doc = DAL.findById('Doctors', adm.DoctorID) || {};
  const bed = DAL.findById('Beds', adm.BedID) || {};
  const rounds = DAL.find('DailyRounds', { AdmissionID: admissionId });

  let activeStage = String(stageOverride || adm.IpdStage || 'BedAssignment').trim();
  if (['Investigations', 'Orders', 'IPD Orders', 'IPD Order', 'ipd_orders', 'ipd_order', 'IPDOrder', 'ipd-orders', 'ipd-order', 'DiagnosticOrders', '3'].includes(activeStage)) {
    activeStage = 'Investigations';
  } else if (['BedAssignment', 'Admission', '1'].includes(activeStage)) {
    activeStage = 'BedAssignment';
  } else if (['DailyRounds', 'Rounds', 'SOAP', '2'].includes(activeStage)) {
    activeStage = 'DailyRounds';
  } else if (['MAR', 'Medications', '4'].includes(activeStage)) {
    activeStage = 'MAR';
  } else if (['Discharge', 'Discharged', 'Completed', '5'].includes(activeStage)) {
    activeStage = 'Discharge';
  }

  const daysSoFar = adm.TotalDays || Math.max(1, Math.ceil((new Date() - new Date(adm.AdmissionDate)) / (1000 * 60 * 60 * 24)));

  const stages = [
    { id: 'BedAssignment', num: '1', title: 'Bed Assignment', icon: 'bed' },
    { id: 'DailyRounds', num: '2', title: 'Daily Rounds (SOAP)', icon: 'clipboard-list' },
    { id: 'Investigations', num: '3', title: 'IPD Orders', icon: 'microscope' },
    { id: 'MAR', num: '4', title: 'Inpatient MAR', icon: 'pill' },
    { id: 'Discharge', num: '5', title: 'Discharge Clearance', icon: 'log-out' }
  ];

  function getBpfClass(stageId) {
    const stageIndex = stages.findIndex(s => s.id === stageId);
    const activeIndex = stages.findIndex(s => s.id === activeStage);
    if (stageId === activeStage) {
      return 'bg-[#002050] text-white font-bold shadow-md border-b-2 border-amber-400';
    } else if (stageIndex < activeIndex || adm.Status === 'Discharged') {
      return 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold';
    } else {
      return 'bg-slate-50 text-slate-500 hover:bg-slate-100 font-medium';
    }
  }

  let stageHtml = '';
  switch (activeStage) {
    case 'BedAssignment':
    case 'Admission':
      stageHtml = renderIpdStage1_BedAssignment(adm, pat, doc, bed);
      break;
    case 'DailyRounds':
      stageHtml = renderIpdStage2_DailyRounds(adm, pat, doc, bed, rounds);
      break;
    case 'Investigations':
    case 'Orders':
      stageHtml = renderIpdStage3_Investigations(adm, pat, doc, bed);
      break;
    case 'MAR':
    case 'Medications':
      stageHtml = renderIpdStage4_MAR(adm, pat, doc, bed);
      break;
    case 'Discharge':
    case 'Discharged':
      stageHtml = renderIpdStage5_Discharge(adm, pat, doc, bed, rounds);
      break;
    default:
      stageHtml = renderIpdStage1_BedAssignment(adm, pat, doc, bed);
  }

  openModal(`
    <div class="flex flex-col h-[90vh] max-w-5xl w-full mx-auto bg-slate-50 rounded-lg overflow-hidden shadow-2xl">
      <!-- D365 Model-driven Record Header -->
      <div class="bg-[#002050] text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-blue-600/60 border border-blue-400 flex items-center justify-center font-bold text-base">
            <i data-lucide="building-2" class="w-5 h-5 text-blue-200"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs uppercase tracking-wider text-blue-300 font-semibold">IPD Clinical Encounter</span>
              <span class="text-xs bg-blue-900/80 px-2 py-0.5 rounded font-mono text-blue-200">${adm.AdmissionNumber || adm.AdmissionID}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${adm.Status === 'Discharged' ? 'bg-slate-600 text-slate-200' : 'bg-emerald-500 text-white animate-pulse'}">${adm.Status}</span>
            </div>
            <h2 class="text-base font-bold text-white flex items-center gap-2">
              ${pat.FirstName || 'Patient'} ${pat.LastName || ''}
              <span class="text-xs font-normal text-slate-300">(${pat.PatientNumber || ''} &bull; ${pat.Gender || ''}, ${pat.DateOfBirth || ''})</span>
            </h2>
          </div>
        </div>

        <div class="flex items-center gap-3 text-xs text-right">
          <div class="hidden sm:block">
            <div class="text-[10px] text-blue-300 uppercase">Assigned Ward & Bed</div>
            <div class="font-bold font-mono text-white text-xs">${bed.BedNumber || 'N/A'} (${bed.WardName || 'IPD'})</div>
          </div>
          <div class="hidden sm:block">
            <div class="text-[10px] text-blue-300 uppercase">Attending Doctor</div>
            <div class="font-bold text-white text-xs">${doc.DoctorName || adm.DoctorID}</div>
          </div>
          <div class="hidden sm:block">
            <div class="text-[10px] text-blue-300 uppercase">Length of Stay</div>
            <div class="font-bold font-mono text-emerald-300 text-xs">${daysSoFar} Day${daysSoFar !== 1 ? 's' : ''}</div>
          </div>
          <button onclick="openSurgeryBookingModal('${adm.AdmissionID}')" class="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1 shadow-xs transition" title="Book Operation Theater / Schedule Surgery">
            <i data-lucide="scissors" class="w-3.5 h-3.5"></i>
            <span class="hidden md:inline">OT Request</span>
          </button>
          <button onclick="openIpdWorkflow('${adm.AdmissionID}', 'Investigations')" class="px-2.5 py-1 ${activeStage === 'Investigations' ? 'bg-amber-400 text-slate-950 font-bold shadow-xs' : 'bg-amber-600/90 hover:bg-amber-600 text-white font-semibold'} rounded text-xs inline-flex items-center gap-1 transition" title="Inpatient Diagnostic Orders (Labs & Imaging)">
            <i data-lucide="microscope" class="w-3.5 h-3.5"></i>
            <span class="hidden md:inline">IPD Order</span>
          </button>
          <button onclick="closeModal()" class="text-slate-300 hover:text-white p-1 rounded-md hover:bg-white/10 transition">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
      </div>

      <!-- Dynamics 365 Model-driven BPF Chevron Bar -->
      <div class="bg-white border-b border-slate-200 shadow-xs flex items-stretch overflow-x-auto select-none text-xs">
        ${stages.map((st, i) => `
          <div onclick="openIpdWorkflow('${adm.AdmissionID}', '${st.id}')" class="bpf-step cursor-pointer ${getBpfClass(st.id)} flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition whitespace-nowrap">
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${activeStage === st.id ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-700'}">${st.num}</span>
            <i data-lucide="${st.icon}" class="w-3.5 h-3.5"></i>
            <span class="text-xs font-semibold">${st.title}</span>
          </div>
        `).join('')}
      </div>

      <!-- Active Stage View Body -->
      <div class="flex-1 overflow-y-auto p-5 custom-scrollbar bg-[#f8f9fa]">
        ${stageHtml}
      </div>
    </div>
  `);
}

function renderIpdStage1_BedAssignment(adm, pat, doc, bed) {
  const allBeds = DAL.find('Beds');
  const availableBeds = allBeds.filter(b => b.Status === 'Available' || b.BedID === adm.BedID);
  const isDischarged = adm.Status === 'Discharged';

  return `
    <div class="space-y-4 max-w-4xl mx-auto text-xs">
      <!-- Stage Banner -->
      <div class="p-3.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-blue-950">
        <div class="flex items-center gap-2">
          <i data-lucide="bed" class="w-5 h-5 text-blue-600"></i>
          <div>
            <h4 class="font-bold text-sm">Stage 1: Admission & Bed Assignment</h4>
            <p class="text-[11px] text-blue-800">Verify patient registration, ward allocation, daily room rate, and initial admission baseline condition.</p>
          </div>
        </div>
        <span class="px-2.5 py-1 bg-blue-200 text-blue-900 rounded font-semibold text-[11px]">${adm.AdmissionType || 'Inpatient Admission'}</span>
      </div>

      <form onsubmit="handleUpdateBedAssignment(event, '${adm.AdmissionID}')" class="space-y-4">
        <!-- Bed & Ward Allocation Card -->
        <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <h5 class="font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
            <span class="flex items-center gap-2"><i data-lucide="map-pin" class="w-4 h-4 text-blue-600"></i> Hospital Bed & Ward Assignment</span>
            <span class="text-xs font-mono font-bold text-emerald-700">Rate: $${parseFloat(bed.DailyRate || 120).toFixed(0)}/day</span>
          </h5>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Assigned Bed (Transfer if needed) *</label>
              <select id="stage1-bed" required ${isDischarged ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2 font-medium">
                ${availableBeds.map(b => `<option value="${b.BedID}" ${b.BedID === adm.BedID ? 'selected' : ''}>${b.WardName} - ${b.BedNumber} (${b.BedType}, $${parseFloat(b.DailyRate).toFixed(0)}/day)</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Current Clinical Condition *</label>
              <select id="stage1-condition" required ${isDischarged ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2 font-medium">
                <option value="Stable" ${adm.CurrentCondition === 'Stable' ? 'selected' : ''}>Stable (Routine Monitoring)</option>
                <option value="Guarded" ${adm.CurrentCondition === 'Guarded' ? 'selected' : ''}>Guarded (Frequent Nursing Observation)</option>
                <option value="Serious" ${adm.CurrentCondition === 'Serious' ? 'selected' : ''}>Serious (Step-down / High Dependency)</option>
                <option value="Critical" ${adm.CurrentCondition === 'Critical' ? 'selected' : ''}>Critical (ICU Intensive Protocol)</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Admitted Date</label>
              <input type="date" id="stage1-date" value="${adm.AdmissionDate}" required ${isDischarged ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2 font-mono">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Expected Discharge Target</label>
              <input type="date" id="stage1-expected" value="${adm.ExpectedDischargeDate || ''}" ${isDischarged ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2 font-mono">
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Admitting Clinical Diagnosis *</label>
            <input type="text" id="stage1-diag" value="${adm.AdmittingDiagnosis || ''}" required ${isDischarged ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2">
          </div>
        </div>

        <!-- Action Bar -->
        <div class="pt-3 border-t flex justify-between items-center">
          <span class="text-[11px] text-slate-500">Source: ${adm.SourceEncounterID ? `Linked to OPD Visit ${adm.SourceEncounterID}` : 'Direct Admission'}</span>
          <div class="flex gap-2">
            ${!isDischarged ? `
              <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded flex items-center gap-1.5 shadow-sm transition">
                <i data-lucide="save" class="w-3.5 h-3.5"></i> Save Stage 1 Details
              </button>
            ` : ''}
            <button type="button" onclick="openIpdWorkflow('${adm.AdmissionID}', 'DailyRounds')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded flex items-center gap-1.5 shadow-sm transition">
              <span>Next: Stage 2 Daily Rounds</span> <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
            </button>
          </div>
        </div>
      </form>
    </div>
  `;
}

function handleUpdateBedAssignment(e, admissionId) {
  e.preventDefault();
  const adm = DAL.findById('Admissions', admissionId);
  const oldBedId = adm.BedID;
  const newBedId = document.getElementById('stage1-bed').value;
  const cond = document.getElementById('stage1-condition').value;
  const date = document.getElementById('stage1-date').value;
  const exp = document.getElementById('stage1-expected').value;
  const diag = document.getElementById('stage1-diag').value.trim();

  // If transferred to another bed
  if (newBedId !== oldBedId) {
    DAL.update('Beds', oldBedId, { Status: 'Available', CurrentAdmissionID: null });
    DAL.update('Beds', newBedId, { Status: 'Occupied', CurrentAdmissionID: admissionId });
  }

  DAL.update('Admissions', admissionId, {
    BedID: newBedId,
    CurrentCondition: cond,
    AdmissionDate: date,
    ExpectedDischargeDate: exp,
    AdmittingDiagnosis: diag,
    IpdStage: 'DailyRounds'
  });

  showToast('Admission details and bed assignment updated!', 'success');
  openIpdWorkflow(admissionId, 'DailyRounds');
}

function renderIpdStage2_DailyRounds(adm, pat, doc, bed, rounds) {
  const isDischarged = adm.Status === 'Discharged';
  const today = new Date().toISOString().split('T')[0];

  return `
    <div class="space-y-4 max-w-4xl mx-auto text-xs">
      <!-- Stage Banner -->
      <div class="p-3.5 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between text-purple-950">
        <div class="flex items-center gap-2">
          <i data-lucide="clipboard-list" class="w-5 h-5 text-purple-600"></i>
          <div>
            <h4 class="font-bold text-sm">Stage 2: Daily Clinical Rounds & Nursing Care (SOAP)</h4>
            <p class="text-[11px] text-purple-800">Track physician progress notes, Subjective complaints, Objective vitals, Clinical Assessment, and Treatment Plan.</p>
          </div>
        </div>
        <span class="px-2.5 py-1 bg-purple-200 text-purple-900 rounded font-semibold text-[11px]">${rounds.length} Recorded Rounds</span>
      </div>

      <!-- Add New Daily Round Form -->
      ${!isDischarged ? `
        <div class="bg-white p-5 rounded-lg border border-purple-200 shadow-2xs space-y-3">
          <h5 class="font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
            <span class="flex items-center gap-1.5"><i data-lucide="plus-circle" class="w-4 h-4 text-purple-600"></i> Record Today's Inpatient Round (SOAP)</span>
            <span class="text-xs text-slate-500 font-mono">${today}</span>
          </h5>

          <form onsubmit="handleSaveDailyRound(event, '${adm.AdmissionID}')" class="space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Round Date *</label>
                <input type="date" id="round-date" value="${today}" required class="w-full border border-slate-300 rounded p-1.5 font-mono">
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Round Type *</label>
                <select id="round-type" required class="w-full border border-slate-300 rounded p-1.5">
                  <option value="Physician Round">Physician Clinical Round</option>
                  <option value="Nursing Assessment">Nursing Shift Assessment</option>
                  <option value="Multi-Disciplinary">Multi-Disciplinary Team (MDT)</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Clinician / Nurse Name *</label>
                <input type="text" id="round-recorder" value="${doc.DoctorName || 'Attending Physician'}" required class="w-full border border-slate-300 rounded p-1.5 font-medium">
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="block font-semibold text-blue-900 mb-1 flex items-center gap-1">
                  <span class="w-4 h-4 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[10px]">S</span>
                  Subjective (Patient Symptoms & Overnight Report) *
                </label>
                <textarea id="round-subj" rows="2" required placeholder="Patient reports feeling improved, denies chest pain, slept well..." class="w-full border border-slate-300 rounded p-2"></textarea>
              </div>
              <div>
                <label class="block font-semibold text-teal-900 mb-1 flex items-center gap-1">
                  <span class="w-4 h-4 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-[10px]">O</span>
                  Objective (Vitals, Physical Exam & Fluid Balance) *
                </label>
                <textarea id="round-obj" rows="2" required placeholder="BP 120/78, HR 74, SpO2 98%, Temp 36.8C. Urine output 1200ml/24h. Lungs clear." class="w-full border border-slate-300 rounded p-2"></textarea>
              </div>
              <div>
                <label class="block font-semibold text-purple-900 mb-1 flex items-center gap-1">
                  <span class="w-4 h-4 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-[10px]">A</span>
                  Assessment (Clinical Impression & Progress) *
                </label>
                <textarea id="round-assess" rows="2" required placeholder="Clinical condition stable and improving. Infection parameters subsiding." class="w-full border border-slate-300 rounded p-2"></textarea>
              </div>
              <div>
                <label class="block font-semibold text-amber-900 mb-1 flex items-center gap-1">
                  <span class="w-4 h-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[10px]">P</span>
                  Plan (Therapy Adjustments & Orders) *
                </label>
                <textarea id="round-plan" rows="2" required placeholder="Continue IV antibiotics. Step down to oral if afebrile 24h. Mobilize patient." class="w-full border border-slate-300 rounded p-2"></textarea>
              </div>
            </div>

            <div class="flex justify-end">
              <button type="submit" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded flex items-center gap-1 shadow-sm transition">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i> Log Clinical Round
              </button>
            </div>
          </form>
        </div>
      ` : ''}

      <!-- Historical SOAP Rounds Timeline -->
      <div class="space-y-3">
        <h5 class="font-bold text-slate-800 flex items-center gap-2">
          <i data-lucide="history" class="w-4 h-4 text-purple-600"></i> Chronological Progress Notes & Rounds (${rounds.length})
        </h5>

        ${rounds.length === 0 ? `
          <div class="p-6 bg-white rounded-lg border text-center text-slate-400">No rounds logged yet. Add Day 1 round above.</div>
        ` : rounds.map(r => `
          <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-2">
            <div class="flex items-center justify-between border-b pb-2">
              <div class="flex items-center gap-2">
                <span class="font-bold text-purple-900">${r.RoundType || 'Physician Round'}</span>
                <span class="text-slate-400">&bull;</span>
                <span class="text-slate-600 font-medium">By: ${r.RecordedBy || 'Clinician'}</span>
              </div>
              <span class="font-mono text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded text-[11px]">${r.RoundDate}</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
              <div class="p-2 bg-blue-50/50 rounded border border-blue-100">
                <span class="font-bold text-blue-900 block mb-0.5">Subjective (S):</span>
                <p class="text-slate-700">${r.Subjective || 'No complaints noted.'}</p>
              </div>
              <div class="p-2 bg-teal-50/50 rounded border border-teal-100">
                <span class="font-bold text-teal-900 block mb-0.5">Objective (O):</span>
                <p class="text-slate-700">${r.Objective || 'Vitals stable.'}</p>
              </div>
              <div class="p-2 bg-purple-50/50 rounded border border-purple-100">
                <span class="font-bold text-purple-900 block mb-0.5">Assessment (A):</span>
                <p class="text-slate-700">${r.Assessment || 'Stable condition.'}</p>
              </div>
              <div class="p-2 bg-amber-50/50 rounded border border-amber-100">
                <span class="font-bold text-amber-900 block mb-0.5">Plan (P):</span>
                <p class="text-slate-700">${r.Plan || 'Continue current inpatient regimen.'}</p>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Action Navigation Bar -->
      <div class="pt-4 border-t flex justify-between items-center">
        <button type="button" onclick="openIpdWorkflow('${adm.AdmissionID}', 'BedAssignment')" class="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50 flex items-center gap-1">
          <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i> Back to Bed Assignment
        </button>
        <button type="button" onclick="openIpdWorkflow('${adm.AdmissionID}', 'Investigations')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded flex items-center gap-1.5 shadow-sm transition">
          <span>Next: Stage 3 IPD Orders</span> <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `;
}

function handleSaveDailyRound(e, admissionId) {
  e.preventDefault();
  const date = document.getElementById('round-date').value;
  const type = document.getElementById('round-type').value;
  const recorder = document.getElementById('round-recorder').value;
  const subj = document.getElementById('round-subj').value.trim();
  const obj = document.getElementById('round-obj').value.trim();
  const assess = document.getElementById('round-assess').value.trim();
  const plan = document.getElementById('round-plan').value.trim();

  const adm = DAL.findById('Admissions', admissionId);
  const allRounds = DAL.find('DailyRounds');
  const newRoundId = `RND-${String(allRounds.length + 1).padStart(4, '0')}`;

  DAL.create('DailyRounds', {
    RoundID: newRoundId,
    AdmissionID: admissionId,
    PatientID: adm.PatientID,
    DoctorID: adm.DoctorID,
    RoundDate: date,
    RoundType: type,
    Subjective: subj,
    Objective: obj,
    Assessment: assess,
    Plan: plan,
    RecordedBy: recorder
  });

  DAL.update('Admissions', admissionId, {
    IpdStage: 'DailyRounds'
  });

  showToast('Inpatient SOAP Round logged successfully!', 'success');
  openIpdWorkflow(admissionId, 'DailyRounds');
}

// Complete Stage 3 IPD Orders implementation

function renderIpdStage3_Investigations(adm, pat, doc, bed) {
  const masterTests = DAL.find('LaboratoryTests') || [];
  const allResults = DAL.find('LaboratoryResults') || [];
  const ipdOrders = allResults.filter(r => 
    r.VisitID === adm.AdmissionID || 
    (r.PatientID === adm.PatientID && (
      (adm.SourceEncounterID && r.VisitID === adm.SourceEncounterID) || 
      (r.Notes && r.Notes.includes(adm.AdmissionID)) ||
      (r.Notes && r.Notes.includes('[IPD Order]'))
    ))
  );
  const isDischarged = adm.Status === 'Discharged';
  const completedOrders = ipdOrders.filter(o => o.Status === 'Completed').length;
  const pendingOrders = ipdOrders.filter(o => o.Status !== 'Completed').length;

  return `
    <div class="space-y-4 max-w-4xl mx-auto text-xs">
      <!-- Stage Banner -->
      <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700">
            <i data-lucide="microscope" class="w-5 h-5"></i>
          </div>
          <div>
            <h4 class="font-bold text-sm text-amber-900">Stage 3: Inpatient Diagnostic Investigations & IPD Orders</h4>
            <p class="text-[11px] text-amber-800">Dispatch laboratory tests, imaging scans (X-Ray, CT, Ultrasound, Echo), and track real-time findings.</p>
          </div>
        </div>
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="px-2 py-0.5 bg-amber-200/80 text-amber-900 rounded font-bold text-[11px] border border-amber-300">
            ${ipdOrders.length} Total Orders
          </span>
          <span class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[11px] border border-emerald-300">
            ${completedOrders} Completed
          </span>
          ${pendingOrders > 0 ? `
            <span class="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[11px] border border-rose-300 animate-pulse">
              ${pendingOrders} Pending
            </span>
          ` : ''}
        </div>
      </div>

      <!-- Quick 1-Click Clinical Order Bundles -->
      ${!isDischarged ? `
        <div class="bg-gradient-to-r from-amber-50/80 to-orange-50/80 p-3.5 rounded-lg border border-amber-200 shadow-2xs space-y-2">
          <div class="flex items-center justify-between">
            <span class="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
              <i data-lucide="layers" class="w-4 h-4 text-amber-600"></i> Fast Clinical Order Sets (1-Click Order Bundles)
            </span>
            <span class="text-[10px] text-amber-700 font-medium">Standardized Inpatient Diagnostic Protocols</span>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button type="button" onclick="handleCreateIpdOrderBundle('${adm.AdmissionID}', 'routine')" class="p-2.5 bg-white hover:bg-amber-100/60 border border-amber-300 rounded text-left transition shadow-2xs group cursor-pointer">
              <div class="font-bold text-slate-800 text-[11px] group-hover:text-amber-900 flex items-center justify-between">
                <span>Admission Routine</span>
                <i data-lucide="plus-circle" class="w-3.5 h-3.5 text-amber-600"></i>
              </div>
              <div class="text-[10px] text-slate-500 mt-0.5">CBC, CMP, Urinalysis, Chest X-Ray</div>
            </button>
            <button type="button" onclick="handleCreateIpdOrderBundle('${adm.AdmissionID}', 'cardiac')" class="p-2.5 bg-white hover:bg-amber-100/60 border border-amber-300 rounded text-left transition shadow-2xs group cursor-pointer">
              <div class="font-bold text-slate-800 text-[11px] group-hover:text-amber-900 flex items-center justify-between">
                <span>Cardiac / ACS Workup</span>
                <i data-lucide="plus-circle" class="w-3.5 h-3.5 text-amber-600"></i>
              </div>
              <div class="text-[10px] text-slate-500 mt-0.5">Troponin I, 2D Echo, Lipid Panel</div>
            </button>
            <button type="button" onclick="handleCreateIpdOrderBundle('${adm.AdmissionID}', 'pulmonary')" class="p-2.5 bg-white hover:bg-amber-100/60 border border-amber-300 rounded text-left transition shadow-2xs group cursor-pointer">
              <div class="font-bold text-slate-800 text-[11px] group-hover:text-amber-900 flex items-center justify-between">
                <span>Pulmonary & Sepsis</span>
                <i data-lucide="plus-circle" class="w-3.5 h-3.5 text-amber-600"></i>
              </div>
              <div class="text-[10px] text-slate-500 mt-0.5">Chest X-Ray, CBC, CMP, Urinalysis</div>
            </button>
            <button type="button" onclick="handleCreateIpdOrderBundle('${adm.AdmissionID}', 'imaging')" class="p-2.5 bg-white hover:bg-amber-100/60 border border-amber-300 rounded text-left transition shadow-2xs group cursor-pointer">
              <div class="font-bold text-slate-800 text-[11px] group-hover:text-amber-900 flex items-center justify-between">
                <span>Inpatient CT Imaging</span>
                <i data-lucide="plus-circle" class="w-3.5 h-3.5 text-amber-600"></i>
              </div>
              <div class="text-[10px] text-slate-500 mt-0.5">Brain CT Scan, Chest/Abdomen CT</div>
            </button>
          </div>
        </div>
      ` : ''}

      <!-- Individual Inpatient Diagnostic Order Card -->
      ${!isDischarged ? `
        <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
          <h5 class="font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
            <span class="flex items-center gap-2"><i data-lucide="plus-circle" class="w-4 h-4 text-amber-600"></i> Dispatch Individual Inpatient Order</span>
            <span class="text-[11px] text-slate-500 font-mono font-medium">Ward: ${bed.WardName || 'IPD'} &bull; Bed: ${bed.BedNumber || 'Inpatient'}</span>
          </h5>

          <form onsubmit="handleCreateIpdOrder(event, '${adm.AdmissionID}')" class="space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div class="md:col-span-2">
                <label class="block font-semibold text-slate-700 mb-1">Diagnostic Investigation / Imaging Scan *</label>
                <select id="ipd-order-test" required class="w-full border border-slate-300 rounded p-1.5 font-medium">
                  <option value="">-- Choose Diagnostic Test / Imaging Scan --</option>
                  <optgroup label="Laboratory Tests">
                    ${masterTests.filter(t => t.Category !== 'Imaging' && t.Category !== 'Cardiology').map(t => 
                      `<option value="${t.TestID}">${t.TestName} ($${parseFloat(t.Cost || 35).toFixed(0)}) [${t.Category}]</option>`
                    ).join('')}
                  </optgroup>
                  <optgroup label="Radiology & Imaging Scans">
                    ${masterTests.filter(t => t.Category === 'Imaging').map(t => 
                      `<option value="${t.TestID}">${t.TestName} ($${parseFloat(t.Cost || 65).toFixed(0)}) [Imaging]</option>`
                    ).join('')}
                  </optgroup>
                  <optgroup label="Cardiology Procedures">
                    ${masterTests.filter(t => t.Category === 'Cardiology').map(t => 
                      `<option value="${t.TestID}">${t.TestName} ($${parseFloat(t.Cost || 220).toFixed(0)}) [Cardiology]</option>`
                    ).join('')}
                  </optgroup>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Clinical Priority *</label>
                <select id="ipd-order-priority" required class="w-full border border-slate-300 rounded p-1.5 font-semibold">
                  <option value="STAT (Urgent Bedside)">STAT (Urgent Bedside / Immediate)</option>
                  <option value="Urgent">Urgent (Within 2 Hours)</option>
                  <option value="Routine" selected>Routine Inpatient (Morning Batch)</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Clinical Indication / Reason</label>
                <input type="text" id="ipd-order-reason" placeholder="e.g. Rule out PE, monitor troponin, pre-op..." class="w-full border border-slate-300 rounded p-1.5">
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-1">
              <button type="submit" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded flex items-center gap-1.5 shadow-sm transition">
                <i data-lucide="send" class="w-3.5 h-3.5"></i> Dispatch Order to Lab / Radiology
              </button>
            </div>
          </form>
        </div>
      ` : ''}

      <!-- IPD Orders Table -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div class="p-3 bg-slate-50 border-b flex justify-between items-center">
          <span class="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <i data-lucide="flask-conical" class="w-4 h-4 text-amber-600"></i> Inpatient Diagnostic Orders & Results (${ipdOrders.length})
          </span>
          <span class="text-[11px] text-slate-500 font-mono">Attending MD: ${doc.DoctorName || 'IPD Attending'}</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] border-b">
              <tr>
                <th class="p-2.5">Order ID & Priority</th>
                <th class="p-2.5">Test / Scan Name</th>
                <th class="p-2.5">Order Date</th>
                <th class="p-2.5">Result Findings</th>
                <th class="p-2.5">Ref Range</th>
                <th class="p-2.5">Interpretation</th>
                <th class="p-2.5">Status</th>
                <th class="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              ${ipdOrders.length === 0 ? `
                <tr>
                  <td colspan="8" class="p-8 text-center text-slate-400">
                    <i data-lucide="microscope" class="w-8 h-8 text-slate-300 mx-auto mb-2"></i>
                    <div class="font-semibold text-slate-600">No diagnostic orders placed for this inpatient stay yet.</div>
                    <div class="text-[11px] text-slate-400 mt-1">Select an order bundle above or dispatch an individual test.</div>
                  </td>
                </tr>
              ` : ipdOrders.map(o => {
                const isPending = o.Status !== 'Completed';
                const isStat = (o.Notes && o.Notes.includes('STAT')) || (o.Priority && o.Priority.includes('STAT'));
                const isUrgent = (o.Notes && o.Notes.includes('Urgent')) || (o.Priority && o.Priority.includes('Urgent'));

                let prioBadge = '<span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">Routine</span>';
                if (isStat) {
                  prioBadge = '<span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">STAT</span>';
                } else if (isUrgent) {
                  prioBadge = '<span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">Urgent</span>';
                }

                return `
                  <tr class="hover:bg-slate-50 transition">
                    <td class="p-2.5">
                      <div class="font-mono font-bold text-amber-800">${o.ResultID}</div>
                      <div class="mt-0.5">${prioBadge}</div>
                    </td>
                    <td class="p-2.5">
                      <div class="font-semibold text-slate-900">${o.TestName}</div>
                      ${o.Notes ? `<div class="text-[10px] text-slate-500 truncate max-w-xs" title="${o.Notes}">${o.Notes.replace(/\[IPD Order.*?\]/, '').trim()}</div>` : ''}
                    </td>
                    <td class="p-2.5 font-mono text-slate-600 whitespace-nowrap">${o.TestDate}</td>
                    <td class="p-2.5 font-mono font-semibold ${isPending ? 'text-amber-600 italic' : 'text-slate-800'} max-w-xs">
                      ${o.Result}
                    </td>
                    <td class="p-2.5 font-mono text-[10px] text-slate-500 whitespace-nowrap">${o.ReferenceRange || 'Normal'}</td>
                    <td class="p-2.5">${getInterpretationBadge(o.Interpretation)}</td>
                    <td class="p-2.5">${getStatusBadge(o.Status)}</td>
                    <td class="p-2.5 text-right whitespace-nowrap space-x-1">
                      ${isPending && !isDischarged ? `
                        <button type="button" onclick="handleSimulateIpdOrderResult('${adm.AdmissionID}', '${o.ResultID}')" class="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] shadow-2xs transition inline-flex items-center gap-1" title="Instant Auto-Simulate Verified Diagnostic Result">
                          <i data-lucide="zap" class="w-3 h-3"></i> Simulate Result
                        </button>
                        <button type="button" onclick="openEnterIpdOrderResultModal('${adm.AdmissionID}', '${o.ResultID}')" class="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded font-semibold text-[10px] transition inline-flex items-center gap-1">
                          <i data-lucide="edit-3" class="w-3 h-3"></i> Enter Findings
                        </button>
                        <button type="button" onclick="handleCancelIpdOrder('${adm.AdmissionID}', '${o.ResultID}')" class="px-1.5 py-1 text-slate-400 hover:text-rose-600 transition" title="Cancel Order">
                          <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                        </button>
                      ` : `
                        <button type="button" onclick="openEnterIpdOrderResultModal('${adm.AdmissionID}', '${o.ResultID}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded font-semibold text-[10px] transition inline-flex items-center gap-1">
                          <i data-lucide="eye" class="w-3 h-3"></i> View / Edit
                        </button>
                      `}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Action Navigation Bar -->
      <!-- Surgical Clearance & OT Requests for this Admission -->
      <div class="bg-gradient-to-r from-rose-50/70 to-pink-50/70 p-3.5 rounded-lg border border-rose-200 shadow-2xs space-y-2">
        <div class="flex items-center justify-between">
          <span class="font-bold text-rose-950 flex items-center gap-1.5 text-xs">
            <i data-lucide="scissors" class="w-4 h-4 text-rose-600"></i> Surgical Clearance & Operation Theater (OT) Requests
          </span>
          <button type="button" onclick="openSurgeryBookingModal('${adm.AdmissionID}')" class="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition shadow-2xs">
            <i data-lucide="plus" class="w-3 h-3"></i> Book Surgery / OT Suite
          </button>
        </div>
        ${(() => {
          const allSurgeries = DAL.find('Surgeries') || [];
          const admSurgeries = allSurgeries.filter(s => s.AdmissionID === adm.AdmissionID || s.PatientID === adm.PatientID);
          if (admSurgeries.length === 0) {
            return `<p class="text-[11px] text-rose-800">No active surgical requests for this admission stay. Click <b>"Book Surgery / OT Suite"</b> above to schedule surgery with surgeon, surgical team, materials, and CSSD sterile sets.</p>`;
          }
          return `
            <div class="space-y-2">
              ${admSurgeries.map(surg => `
                <div class="p-2.5 bg-white rounded border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-slate-900">${surg.ProcedureName}</span>
                      <span class="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">${surg.Category}</span>
                      <span class="px-1.5 py-0.2 rounded text-[10px] font-bold ${surg.Status === 'In Surgery' ? 'bg-rose-600 text-white animate-pulse' : 'bg-slate-100 text-slate-700'}">${surg.Status}</span>
                    </div>
                    <div class="text-[10px] text-slate-500 mt-0.5">
                      Suite: <b>${surg.TheaterID}</b> &bull; Date: <b>${surg.ScheduledDate} @ ${surg.StartTime}</b> &bull; Surgeon: <b>${surg.LeadSurgeonName}</b> &bull; Anesth: <b>${surg.AnesthesiaType}</b>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <button type="button" onclick="openSurgeryWorkflow('${surg.SurgeryID}')" class="px-2.5 py-1 bg-gradient-to-r from-rose-700 to-pink-700 hover:from-rose-800 hover:to-pink-800 text-white rounded text-[11px] font-semibold flex items-center gap-1">
                      <i data-lucide="scissors" class="w-3 h-3"></i> OR Workflow
                    </button>
                    <button type="button" onclick="openWhoChecklistModal('${surg.SurgeryID}')" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold">
                      WHO Checklist
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          `;
        })()}
      </div>

      <div class="pt-4 border-t flex justify-between items-center">
        <button type="button" onclick="openIpdWorkflow('${adm.AdmissionID}', 'DailyRounds')" class="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50 flex items-center gap-1">
          <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i> Back to Daily Rounds
        </button>
        <button type="button" onclick="openIpdWorkflow('${adm.AdmissionID}', 'MAR')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded flex items-center gap-1.5 shadow-sm transition">
          <span>Next: Stage 4 Inpatient MAR</span> <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `;
}

function generateNextResultId() {
  const allResults = DAL.find('LaboratoryResults') || [];
  let maxNum = 0;
  allResults.forEach(r => {
    const numPart = parseInt(String(r.ResultID || '').replace(/[^0-9]/g, ''), 10);
    if (!isNaN(numPart) && numPart > maxNum) maxNum = numPart;
  });
  return `RES-${String(Math.max(maxNum + 1, allResults.length + 1)).padStart(4, '0')}`;
}

function handleCreateIpdOrder(e, admissionId) {
  if (e && e.preventDefault) e.preventDefault();
  const testSelect = document.getElementById('ipd-order-test');
  if (!testSelect || !testSelect.value) {
    showToast('Please select a diagnostic test or imaging scan.', 'warning');
    return;
  }
  const testId = testSelect.value;
  const priorityEl = document.getElementById('ipd-order-priority');
  const priority = priorityEl ? priorityEl.value : 'Routine';
  const reasonEl = document.getElementById('ipd-order-reason');
  const reason = reasonEl ? reasonEl.value.trim() : '';

  const adm = DAL.findById('Admissions', admissionId);
  if (!adm) {
    showToast('Inpatient admission record not found.', 'error');
    return;
  }
  const testObj = DAL.findById('LaboratoryTests', testId) || {};
  const bed = DAL.findById('Beds', adm.BedID) || {};
  const newResultId = generateNextResultId();
  const today = new Date().toISOString().split('T')[0];

  DAL.create('LaboratoryResults', {
    ResultID: newResultId,
    PatientID: adm.PatientID,
    VisitID: adm.AdmissionID,
    DoctorID: adm.DoctorID,
    TestID: testId,
    TestName: testObj.TestName || 'Diagnostic Investigation',
    TestDate: today,
    Result: 'Pending Analysis',
    ReferenceRange: testObj.NormalRange || testObj.ReferenceRange || 'Normal',
    Interpretation: 'Normal',
    Status: 'Requested',
    Notes: `[IPD Order - ${adm.AdmissionID}] Priority: ${priority} | Bed: ${bed.BedNumber || 'Inpatient'}. ${reason ? 'Indication: ' + reason : ''}`,
    TechnicianName: 'Hospital Inpatient Diagnostic Services'
  });

  DAL.update('Admissions', admissionId, { IpdStage: 'Investigations' });
  showToast(`Inpatient order for ${testObj.TestName || 'Test'} dispatched (${priority})!`, 'success');
  if (typeof renderMainView === 'function') renderMainView();
  openIpdWorkflow(admissionId, 'Investigations');
}

function handleCreateIpdOrderBundle(admissionId, bundleKey) {
  const adm = DAL.findById('Admissions', admissionId);
  if (!adm) return;
  const bed = DAL.findById('Beds', adm.BedID) || {};
  const allTests = DAL.find('LaboratoryTests') || [];
  const today = new Date().toISOString().split('T')[0];

  let testCodes = [];
  let bundleTitle = '';

  if (bundleKey === 'routine') {
    testCodes = ['CBC', 'CMP', 'UA', 'XR-CHEST'];
    bundleTitle = 'Admission Routine Panel';
  } else if (bundleKey === 'cardiac') {
    testCodes = ['TROP-I', 'ECHO-2D', 'LIPID'];
    bundleTitle = 'Cardiac ACS Workup';
  } else if (bundleKey === 'pulmonary') {
    testCodes = ['XR-CHEST', 'CBC', 'CMP', 'UA'];
    bundleTitle = 'Pulmonary & Sepsis Workup';
  } else if (bundleKey === 'imaging') {
    testCodes = ['CT-BRAIN', 'CT-CHEST-ABD'];
    bundleTitle = 'Inpatient CT Imaging';
  }

  let count = 0;
  testCodes.forEach(code => {
    const testObj = allTests.find(t => t.TestCode === code) || {};
    if (testObj.TestID) {
      const newResultId = generateNextResultId();
      DAL.create('LaboratoryResults', {
        ResultID: newResultId,
        PatientID: adm.PatientID,
        VisitID: adm.AdmissionID,
        DoctorID: adm.DoctorID,
        TestID: testObj.TestID,
        TestName: testObj.TestName,
        TestDate: today,
        Result: 'Pending Analysis',
        ReferenceRange: testObj.NormalRange || testObj.ReferenceRange || 'Normal',
        Interpretation: 'Normal',
        Status: 'Requested',
        Notes: `[IPD Order - ${adm.AdmissionID}] Priority: Urgent | Bundle: ${bundleTitle} | Bed: ${bed.BedNumber || 'Inpatient'}`,
        TechnicianName: 'Hospital Inpatient Diagnostic Services'
      });
      count++;
    }
  });

  DAL.update('Admissions', admissionId, { IpdStage: 'Investigations' });
  showToast(`${bundleTitle} (${count} diagnostic orders) dispatched to Lab & Radiology!`, 'success');
  if (typeof renderMainView === 'function') renderMainView();
  openIpdWorkflow(admissionId, 'Investigations');
}

function handleSimulateIpdOrderResult(admissionId, resultId) {
  const res = DAL.findById('LaboratoryResults', resultId);
  if (!res) return;
  const test = DAL.findById('LaboratoryTests', res.TestID) || {};
  
  let finding = 'Normal values detected';
  let interp = 'Normal';
  
  const code = test.TestCode || '';
  if (code === 'CBC' || res.TestName.includes('CBC') || res.TestName.includes('Blood Count')) {
    finding = 'WBC: 7.4 x10^3/uL, Hgb: 14.1 g/dL, Plt: 238 x10^3/uL, Hct: 42.0%';
    interp = 'Normal';
  } else if (code === 'CMP' || res.TestName.includes('Metabolic') || res.TestName.includes('CMP')) {
    finding = 'Glucose: 94 mg/dL, BUN: 14 mg/dL, Cr: 0.9 mg/dL, Na: 140 mEq/L, K: 4.1 mEq/L';
    interp = 'Normal';
  } else if (code === 'TROP-I' || res.TestName.includes('Troponin')) {
    finding = '0.02 ng/mL (Reference < 0.04 ng/mL, Negative for MI)';
    interp = 'Normal';
  } else if (code === 'LIPID' || res.TestName.includes('Lipid')) {
    finding = 'Total Chol: 182 mg/dL, HDL: 48 mg/dL, LDL: 104 mg/dL, Trig: 145 mg/dL';
    interp = 'Normal';
  } else if (code === 'HBA1C' || res.TestName.includes('HbA1c')) {
    finding = '6.2% (Moderate Glycemic Control)';
    interp = 'Abnormal';
  } else if (code === 'UA' || res.TestName.includes('Urinalysis')) {
    finding = 'Clear Yellow, SpGr 1.015, pH 6.0, Protein: Neg, Gluc: Neg, WBC: 0-2/hpf';
    interp = 'Normal';
  } else if (code === 'XR-CHEST' || res.TestName.includes('Chest X-Ray')) {
    finding = 'No focal consolidation, pneumothorax, or pleural effusion. Cardiomediastinal silhouette normal.';
    interp = 'Normal';
  } else if (code === 'CT-BRAIN' || res.TestName.includes('Brain CT')) {
    finding = 'No acute intracranial hemorrhage, mass effect, or midline shift. Ventricles intact.';
    interp = 'Normal';
  } else if (code === 'CT-CHEST-ABD' || res.TestName.includes('CT Scan')) {
    finding = 'No pulmonary embolism or aortic dissection. Abdominal parenchymal organs unremarkable.';
    interp = 'Normal';
  } else if (code === 'ECHO-2D' || res.TestName.includes('Echo')) {
    finding = 'LVEF estimated at 58%. Normal left ventricular chamber dimensions and intact systolic function.';
    interp = 'Normal';
  } else if (code === 'US-ABD' || res.TestName.includes('Ultrasound')) {
    finding = 'Normal liver echo texture. Gallbladder clear without stones or wall thickening.';
    interp = 'Normal';
  } else if (code === 'XR-KNEE' || res.TestName.includes('Knee')) {
    finding = 'No acute fracture or dislocation. Femoral-tibial alignment anatomic. Post-op status stable.';
    interp = 'Normal';
  } else {
    finding = 'Diagnostic parameters within expected therapeutic hospital reference limits.';
    interp = 'Normal';
  }
  
  DAL.update('LaboratoryResults', resultId, {
    Result: finding,
    Interpretation: interp,
    Status: 'Completed',
    TechnicianName: 'Inpatient Core Diagnostics'
  });
  
  showToast(`Test result for ${res.TestName} verified & reported!`, 'success');
  if (typeof renderMainView === 'function') renderMainView();
  openIpdWorkflow(admissionId, 'Investigations');
}

function openEnterIpdOrderResultModal(admissionId, resultId) {
  const res = DAL.findById('LaboratoryResults', resultId);
  if (!res) return;
  const pat = DAL.findById('Patients', res.PatientID) || {};

  openModal(`
    <div class="px-6 py-4 bg-[#002050] text-white flex justify-between items-center">
      <h3 class="font-bold text-sm flex items-center gap-2"><i data-lucide="microscope" class="w-4 h-4 text-amber-400"></i> Enter / Edit Inpatient Diagnostic Findings</h3>
      <button onclick="openIpdWorkflow('${admissionId}', 'Investigations')" class="text-slate-300 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
    </div>
    <form onsubmit="handleSaveIpdOrderResult(event, '${admissionId}', '${resultId}')" class="p-6 space-y-4 text-xs">
      <div class="p-2.5 bg-amber-50 border border-amber-200 rounded text-amber-900 font-medium">
        Test / Scan: <strong>${res.TestName}</strong> &bull; Patient: <strong>${pat.FirstName || ''} ${pat.LastName || ''}</strong> &bull; Ref Range: <strong>${res.ReferenceRange || 'Normal'}</strong>
      </div>
      <div>
        <label class="block font-semibold text-slate-700 mb-1">Diagnostic Findings & Clinical Values *</label>
        <textarea id="ipd-res-val" required rows="3" placeholder="e.g. LVEF 58%, normal wall motion, clear lung fields..." class="w-full border border-slate-300 rounded p-2 font-mono">${res.Result !== 'Pending Analysis' ? res.Result : ''}</textarea>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Clinical Interpretation *</label>
          <select id="ipd-res-interp" required class="w-full border border-slate-300 rounded p-2 font-medium">
            <option value="Normal" ${res.Interpretation === 'Normal' ? 'selected' : ''}>Normal</option>
            <option value="Abnormal" ${res.Interpretation === 'Abnormal' ? 'selected' : ''}>Abnormal</option>
            <option value="Critical High" ${res.Interpretation === 'Critical High' ? 'selected' : ''}>Critical High</option>
            <option value="Critical Low" ${res.Interpretation === 'Critical Low' ? 'selected' : ''}>Critical Low</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Technician / Performing Clinician</label>
          <input type="text" id="ipd-tech-name" value="${res.TechnicianName || 'Inpatient Core Diagnostics'}" class="w-full border border-slate-300 rounded p-2">
        </div>
      </div>
      <div class="pt-4 border-t flex justify-end gap-2">
        <button type="button" onclick="openIpdWorkflow('${admissionId}', 'Investigations')" class="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50">Cancel</button>
        <button type="submit" class="px-4 py-2 bg-amber-600 text-white font-semibold rounded hover:bg-amber-700">Save & Verify Findings</button>
      </div>
    </form>
  `);
}

function handleSaveIpdOrderResult(e, admissionId, resultId) {
  e.preventDefault();
  const val = document.getElementById('ipd-res-val').value.trim();
  const interp = document.getElementById('ipd-res-interp').value;
  const tech = document.getElementById('ipd-tech-name').value.trim();

  DAL.update('LaboratoryResults', resultId, {
    Result: val,
    Interpretation: interp,
    TechnicianName: tech,
    Status: 'Completed'
  });

  showToast('Inpatient diagnostic findings recorded successfully!', 'success');
  if (typeof renderMainView === 'function') renderMainView();
  openIpdWorkflow(admissionId, 'Investigations');
}

function handleCancelIpdOrder(admissionId, resultId) {
  const res = DAL.findById('LaboratoryResults', resultId);
  if (!res) return;
  
  DAL.update('LaboratoryResults', resultId, {
    Status: 'Cancelled',
    Result: 'Order Cancelled by Attending MD'
  });
  
  showToast(`Order for ${res.TestName} has been cancelled.`, 'info');
  if (typeof renderMainView === 'function') renderMainView();
  openIpdWorkflow(admissionId, 'Investigations');
}

// Global window bindings for IPD Process and Inpatient Orders
window.getInterpretationBadge = getInterpretationBadge;
window.handleCreateIpdOrder = handleCreateIpdOrder;
window.handleCreateIpdOrderBundle = handleCreateIpdOrderBundle;
window.handleSimulateIpdOrderResult = handleSimulateIpdOrderResult;
window.openEnterIpdOrderResultModal = openEnterIpdOrderResultModal;
window.handleSaveIpdOrderResult = handleSaveIpdOrderResult;
window.handleCancelIpdOrder = handleCancelIpdOrder;


function renderIpdStage4_MAR(adm, pat, doc, bed) {
  const masterMeds = DAL.find('Medications');
  const allRx = DAL.find('Prescriptions');
  const allRxItems = DAL.find('PrescriptionItems');
  const isDischarged = adm.Status === 'Discharged';

  const ipdPrescriptions = allRx.filter(rx => rx.PatientID === adm.PatientID && (rx.VisitID === adm.AdmissionID || (adm.SourceEncounterID && rx.VisitID === adm.SourceEncounterID)));
  let rxItems = [];
  ipdPrescriptions.forEach(rx => {
    rxItems = rxItems.concat(allRxItems.filter(it => it.PrescriptionID === rx.PrescriptionID));
  });

  // Track nurse MAR administrations in localStorage
  const marKey = `mar_log_${adm.AdmissionID}`;
  let marLog = {};
  try {
    marLog = JSON.parse(localStorage.getItem(marKey) || '{}');
  } catch (e) {
    marLog = {};
  }

  const shifts = ['08:00 AM (Morning)', '02:00 PM (Afternoon)', '08:00 PM (Evening)', '12:00 AM (Midnight)'];

  return `
    <div class="space-y-4 max-w-4xl mx-auto text-xs">
      <!-- Stage Banner -->
      <div class="p-3.5 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between text-teal-950">
        <div class="flex items-center gap-2">
          <i data-lucide="pill" class="w-5 h-5 text-teal-600"></i>
          <div>
            <h4 class="font-bold text-sm">Stage 4: Inpatient Medication Administration Record (MAR)</h4>
            <p class="text-[11px] text-teal-800">Administer scheduled inpatient doses (IV / Oral / Subcutaneous), chart fluid infusions, and record nursing sign-offs.</p>
          </div>
        </div>
        <span class="px-2.5 py-1 bg-teal-200 text-teal-900 rounded font-semibold text-[11px]">${rxItems.length} Inpatient Prescriptions</span>
      </div>

      <!-- Add New Inpatient Medication Form -->
      ${!isDischarged ? `
        <div class="bg-white p-5 rounded-lg border border-teal-200 shadow-2xs space-y-3">
          <h5 class="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
            <i data-lucide="plus-circle" class="w-4 h-4 text-teal-600"></i> Add Inpatient Medication Order
          </h5>

          <form onsubmit="handleCreateIpdMedOrder(event, '${adm.AdmissionID}')" class="space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Medication *</label>
                <select id="mar-new-med" required class="w-full border border-slate-300 rounded p-1.5">
                  <option value="">-- Select Inpatient Med --</option>
                  ${masterMeds.map(m => `<option value="${m.MedicationID}">${m.MedicationName} (${m.Strength})</option>`).join('')}
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Route & Frequency *</label>
                <select id="mar-new-freq" required class="w-full border border-slate-300 rounded p-1.5 font-medium">
                  <option value="IV Q8H (Every 8h)">IV Q8H (Every 8 hours)</option>
                  <option value="IV Q12H (Every 12h)">IV Q12H (Every 12 hours)</option>
                  <option value="Oral Daily">Oral Once Daily</option>
                  <option value="Oral BID (Twice Daily)">Oral Twice Daily</option>
                  <option value="Subcutaneous Daily">Subcutaneous Once Daily</option>
                  <option value="IV Infusion Continuous">IV Infusion Continuous</option>
                  <option value="PRN (As Needed)">PRN (As Needed for Pain/Fever)</option>
                </select>
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Dosage *</label>
                <input type="text" id="mar-new-dose" value="1 dose" required placeholder="e.g. 1g IV or 500mg" class="w-full border border-slate-300 rounded p-1.5">
              </div>
              <div>
                <label class="block font-semibold text-slate-700 mb-1">Duration (Days) *</label>
                <input type="number" id="mar-new-dur" value="5" min="1" max="30" required class="w-full border border-slate-300 rounded p-1.5 font-mono">
              </div>
            </div>

            <div class="flex justify-end">
              <button type="submit" class="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded flex items-center gap-1.5 shadow-sm transition">
                <i data-lucide="plus" class="w-3.5 h-3.5"></i> Prescribe Inpatient Medication
              </button>
            </div>
          </form>
        </div>
      ` : ''}

      <!-- Interactive MAR Chart -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div class="p-3 bg-slate-50 border-b flex justify-between items-center">
          <span class="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <i data-lucide="activity" class="w-4 h-4 text-teal-600"></i> Active Medication Administration Record (MAR Chart)
          </span>
          <span class="text-[11px] text-teal-700 font-semibold">Nurse Shift Administration</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] border-b">
              <tr>
                <th class="p-2.5">Medication & Dosage</th>
                <th class="p-2.5">Instructions</th>
                ${shifts.map(sh => `<th class="p-2.5 text-center">${sh}</th>`).join('')}
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              ${rxItems.length === 0 ? `
                <tr><td colspan="6" class="p-6 text-center text-slate-400">No active medications scheduled. Add medication above.</td></tr>
              ` : rxItems.map(it => {
                const med = masterMeds.find(m => m.MedicationID === it.MedicationID) || {};
                return `
                  <tr class="hover:bg-slate-50 transition">
                    <td class="p-2.5">
                      <div class="font-bold text-slate-900">${it.MedicationName}</div>
                      <div class="text-[11px] text-slate-500 font-mono">${it.Dosage || 'Standard Dose'} &bull; ${it.Duration || '5 days'}</div>
                    </td>
                    <td class="p-2.5 text-slate-600 font-medium">${it.Instructions || 'Take as prescribed'}</td>
                    ${shifts.map((sh, idx) => {
                      const doseKey = `${it.PrescriptionItemID || it.MedicationName}_slot_${idx}`;
                      const isGiven = !!marLog[doseKey];
                      return `
                        <td class="p-2.5 text-center">
                          ${isGiven ? `
                            <span class="inline-flex items-center gap-1 px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              <i data-lucide="check" class="w-3 h-3 text-emerald-600"></i> Given (${marLog[doseKey]})
                            </span>
                          ` : !isDischarged ? `
                            <button onclick="handleRecordMarDose('${adm.AdmissionID}', '${doseKey}', '${sh.split(' ')[0]}')" class="px-2 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 border border-slate-200 rounded font-semibold text-[10px] text-slate-600 transition">
                              Give Dose
                            </button>
                          ` : `
                            <span class="text-slate-300 text-[10px]">-</span>
                          `}
                        </td>
                      `;
                    }).join('')}
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Action Navigation Bar -->
      <div class="pt-4 border-t flex justify-between items-center">
        <button type="button" onclick="openIpdWorkflow('${adm.AdmissionID}', 'Investigations')" class="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50 flex items-center gap-1">
          <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i> Back to Inpatient Orders
        </button>
        <button type="button" onclick="openIpdWorkflow('${adm.AdmissionID}', 'Discharge')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded flex items-center gap-1.5 shadow-sm transition">
          <span>Next: Stage 5 Discharge Clearance</span> <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
        </button>
      </div>
    </div>
  `;
}

function handleCreateIpdMedOrder(e, admissionId) {
  e.preventDefault();
  const medId = document.getElementById('mar-new-med').value;
  const freq = document.getElementById('mar-new-freq').value;
  const dose = document.getElementById('mar-new-dose').value.trim();
  const dur = document.getElementById('mar-new-dur').value;

  const adm = DAL.findById('Admissions', admissionId);
  const medObj = DAL.findById('Medications', medId) || {};
  const allRx = DAL.find('Prescriptions');
  const allRxItems = DAL.find('PrescriptionItems');
  const today = new Date().toISOString().split('T')[0];

  const rxId = `RX-${String(allRx.length + 1).padStart(4, '0')}`;
  DAL.create('Prescriptions', {
    PrescriptionID: rxId,
    PatientID: adm.PatientID,
    VisitID: adm.AdmissionID,
    DoctorID: adm.DoctorID,
    PrescriptionDate: today,
    Status: 'Active',
    Notes: `Inpatient MAR Order: ${medObj.MedicationName} (${freq})`
  });

  const itemId = `RXI-${String(allRxItems.length + 1).padStart(4, '0')}`;
  DAL.create('PrescriptionItems', {
    PrescriptionItemID: itemId,
    PrescriptionID: rxId,
    MedicationID: medId,
    MedicationName: medObj.MedicationName,
    Dosage: dose,
    Frequency: freq,
    Duration: `${dur} days`,
    Quantity: parseInt(dur) * 3,
    Instructions: `Inpatient administration: ${freq}`
  });

  DAL.update('Admissions', admissionId, { IpdStage: 'MAR' });
  showToast(`Inpatient medication ${medObj.MedicationName} added to MAR!`, 'success');
  openIpdWorkflow(admissionId, 'MAR');
}

function handleRecordMarDose(admissionId, doseKey, timeLabel) {
  const marKey = `mar_log_${admissionId}`;
  let marLog = {};
  try {
    marLog = JSON.parse(localStorage.getItem(marKey) || '{}');
  } catch (e) {
    marLog = {};
  }

  const now = new Date();
  const timeStr = `${timeLabel || ''} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`.trim();
  marLog[doseKey] = timeStr;
  localStorage.setItem(marKey, JSON.stringify(marLog));

  showToast(`Dose administered and charted at ${timeStr}.`, 'success');
  openIpdWorkflow(admissionId, 'MAR');
}

function renderIpdStage5_Discharge(adm, pat, doc, bed, rounds) {
  const masterTests = DAL.find('LaboratoryTests');
  const masterMeds = DAL.find('Medications');
  const allResults = DAL.find('LaboratoryResults');
  const allRx = DAL.find('Prescriptions');
  const allRxItems = DAL.find('PrescriptionItems');
  const isDischarged = adm.Status === 'Discharged';
  const today = new Date().toISOString().split('T')[0];

  const ipdOrders = allResults.filter(r => r.PatientID === adm.PatientID && (r.VisitID === adm.AdmissionID || (adm.SourceEncounterID && r.VisitID === adm.SourceEncounterID) || (r.Notes && r.Notes.includes('[IPD Order]'))));
  const ipdRx = allRx.filter(rx => rx.PatientID === adm.PatientID && (rx.VisitID === adm.AdmissionID || (adm.SourceEncounterID && rx.VisitID === adm.SourceEncounterID)));
  let rxItems = [];
  ipdRx.forEach(rx => {
    rxItems = rxItems.concat(allRxItems.filter(it => it.PrescriptionID === rx.PrescriptionID));
  });

  // Calculate Length of Stay (Days)
  const dischargeDateStr = adm.ActualDischargeDate || today;
  const days = Math.max(1, Math.ceil((new Date(dischargeDateStr) - new Date(adm.AdmissionDate)) / (1000 * 60 * 60 * 24)));

  // Detailed Inpatient Bill Math
  const dailyBedRate = parseFloat(bed.DailyRate || 120);
  const totalBedCharges = days * dailyBedRate;
  const physicianRoundFee = rounds.length * 40.00;
  const diagnosticsTotal = ipdOrders.reduce((acc, o) => {
    const t = masterTests.find(m => m.TestID === o.TestID);
    return acc + (t ? parseFloat(t.Cost) : 40.00);
  }, 0);
  const pharmacyTotal = rxItems.reduce((acc, it) => {
    const m = masterMeds.find(med => med.MedicationID === it.MedicationID);
    return acc + (m ? (parseFloat(m.UnitPrice) * (parseInt(it.Quantity) / 10 || 1)) : 20.00);
  }, 0);

  const totalInpatientBill = totalBedCharges + physicianRoundFee + diagnosticsTotal + pharmacyTotal;

  return `
    <div class="space-y-4 max-w-4xl mx-auto text-xs">
      <!-- Stage Banner -->
      <div class="p-3.5 ${isDischarged ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-rose-50 border-rose-200 text-rose-950'} border rounded-lg flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i data-lucide="${isDischarged ? 'check-check' : 'log-out'}" class="w-5 h-5 ${isDischarged ? 'text-emerald-600' : 'text-rose-600'}"></i>
          <div>
            <h4 class="font-bold text-sm">Stage 5: Inpatient Discharge Clearance & Final Hospital Billing</h4>
            <p class="text-[11px] ${isDischarged ? 'text-emerald-800' : 'text-rose-800'}">Calculate total length of stay, itemize bed days + clinical care + diagnostics + pharmacy, and release the hospital bed.</p>
          </div>
        </div>
        <span class="px-2.5 py-1 ${isDischarged ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'} rounded font-semibold text-[11px]">
          ${isDischarged ? 'Discharge Finalized' : 'Clearance Pending'}
        </span>
      </div>

      <form onsubmit="handleFinalizeIpdDischarge(event, '${adm.AdmissionID}')" class="space-y-4">
        <!-- Discharge Plan Card -->
        <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <h5 class="font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
            <i data-lucide="file-text" class="w-4 h-4 text-rose-600"></i> Clinical Discharge Disposition & Patient Plan
          </h5>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Discharge Disposition *</label>
              <select id="ipd-disch-disp" required ${isDischarged ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2 font-medium">
                <option value="Discharged Home" ${adm.DischargeDisposition === 'Discharged Home' ? 'selected' : ''}>Discharged Home (Condition Improved)</option>
                <option value="Specialist Referral" ${adm.DischargeDisposition === 'Specialist Referral' ? 'selected' : ''}>Specialist Clinic Follow-up</option>
                <option value="Transfer to ICU" ${adm.DischargeDisposition === 'Transfer to ICU' ? 'selected' : ''}>Transfer to Intensive Care Unit (ICU)</option>
                <option value="Rehabilitation Center" ${adm.DischargeDisposition === 'Rehabilitation Center' ? 'selected' : ''}>Rehabilitation / Step-down Center</option>
                <option value="LAMA (Left Against Advice)" ${adm.DischargeDisposition === 'LAMA (Left Against Advice)' ? 'selected' : ''}>LAMA (Left Against Medical Advice)</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Discharge Date *</label>
              <input type="date" id="ipd-disch-date" value="${dischargeDateStr}" required ${isDischarged ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2 font-mono">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Post-Discharge Follow-up Date</label>
              <input type="date" id="ipd-disch-followup" value="2026-04-20" ${isDischarged ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2 font-mono">
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Inpatient Discharge Summary & Instructions *</label>
            <textarea id="ipd-disch-summary" rows="3" required ${isDischarged ? 'disabled' : ''} placeholder="Clinical course, condition on discharge, discharge medications, dietary restrictions, warning signs..." class="w-full border border-slate-300 rounded p-2">${adm.DischargeSummary || `Patient admitted with ${adm.AdmittingDiagnosis}. Received inpatient medical care, daily physician rounds, and medication therapy. Patient showed steady clinical improvement. Discharged in stable condition with take-home prescriptions and follow-up advice.`}</textarea>
          </div>
        </div>

        <!-- Comprehensive Itemized Inpatient Bill Card -->
        <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-3">
          <h5 class="font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
            <span class="flex items-center gap-1.5"><i data-lucide="receipt" class="w-4 h-4 text-emerald-600"></i> Itemized Inpatient Billing Statement</span>
            <span class="text-xs font-mono font-bold text-emerald-700">Total IPD Due: $${totalInpatientBill.toFixed(2)}</span>
          </h5>

          <div class="space-y-2 text-xs">
            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-600 font-medium">Hospital Bed Care (${bed.WardName} - Bed ${bed.BedNumber}):</span>
              <span class="font-mono font-bold text-slate-800">${days} days &times; $${dailyBedRate.toFixed(2)}/day = $${totalBedCharges.toFixed(2)}</span>
            </div>

            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-600 font-medium">Physician Daily Rounds (${rounds.length} round${rounds.length !== 1 ? 's' : ''}):</span>
              <span class="font-mono font-bold text-slate-800">$${physicianRoundFee.toFixed(2)}</span>
            </div>

            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-600 font-medium">Diagnostic Investigations & Imaging (${ipdOrders.length} order${ipdOrders.length !== 1 ? 's' : ''}):</span>
              <span class="font-mono font-bold text-slate-800">$${diagnosticsTotal.toFixed(2)}</span>
            </div>
            ${ipdOrders.map(o => {
              const t = masterTests.find(m => m.TestID === o.TestID) || {};
              return `
                <div class="flex justify-between pl-4 text-[11px] text-slate-500">
                  <span>&bull; ${o.TestName}</span>
                  <span class="font-mono">$${parseFloat(t.Cost || 40).toFixed(2)}</span>
                </div>
              `;
            }).join('')}

            <div class="flex justify-between py-1 border-b border-slate-100">
              <span class="text-slate-600 font-medium">Pharmacy & MAR Medications (${rxItems.length} medication${rxItems.length !== 1 ? 's' : ''}):</span>
              <span class="font-mono font-bold text-slate-800">$${pharmacyTotal.toFixed(2)}</span>
            </div>
            ${rxItems.map(it => {
              const m = masterMeds.find(med => med.MedicationID === it.MedicationID);
              const price = m ? (parseFloat(m.UnitPrice) * (parseInt(it.Quantity) / 10 || 1)) : 20.00;
              return `
                <div class="flex justify-between pl-4 text-[11px] text-slate-500">
                  <span>&bull; ${it.MedicationName} (${it.Dosage})</span>
                  <span class="font-mono">$${price.toFixed(2)}</span>
                </div>
              `;
            }).join('')}

            <div class="flex justify-between pt-2.5 text-sm font-bold text-slate-900 border-t-2 border-slate-200">
              <span>Total Inpatient Stay Balance:</span>
              <span class="text-emerald-700 font-mono font-bold">$${totalInpatientBill.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Bed Release Notice -->
        <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-blue-950">
          <div class="flex items-center gap-2">
            <i data-lucide="info" class="w-4 h-4 text-blue-600"></i>
            <span>Upon discharge clearance, <strong>Bed ${bed.BedNumber}</strong> will automatically be released back to <strong>Available</strong> status for sanitization and new admissions.</span>
          </div>
        </div>

        <!-- Action Bar -->
        <div class="pt-4 border-t flex justify-between items-center">
          <button type="button" onclick="openIpdWorkflow('${adm.AdmissionID}', 'MAR')" class="px-4 py-2 border rounded text-slate-600 hover:bg-slate-50 flex items-center gap-1">
            <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i> Back to Inpatient MAR
          </button>
          <div class="flex items-center gap-2">
            <button type="button" onclick="window.print()" class="px-3 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 font-semibold">
              <i data-lucide="printer" class="w-3.5 h-3.5"></i> Print IPD Summary
            </button>
            ${!isDischarged ? `
              <button type="submit" class="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded flex items-center gap-1.5 shadow-sm transition">
                <i data-lucide="check" class="w-4 h-4"></i> Finalize Discharge & Release Bed
              </button>
            ` : `
              <span class="px-4 py-2 bg-emerald-100 text-emerald-800 font-bold rounded flex items-center gap-1">
                <i data-lucide="check-check" class="w-4 h-4"></i> Inpatient Stay Finalized & Bed Released
              </span>
            `}
          </div>
        </div>
      </form>
    </div>
  `;
}

function handleFinalizeIpdDischarge(e, admissionId) {
  e.preventDefault();
  const adm = DAL.findById('Admissions', admissionId);
  const bed = DAL.findById('Beds', adm.BedID) || {};
  const rounds = DAL.find('DailyRounds', { AdmissionID: admissionId });

  const disp = document.getElementById('ipd-disch-disp').value;
  const dischDate = document.getElementById('ipd-disch-date').value;
  const followup = document.getElementById('ipd-disch-followup').value;
  const summary = document.getElementById('ipd-disch-summary').value.trim();

  // Math for length of stay
  const days = Math.max(1, Math.ceil((new Date(dischDate) - new Date(adm.AdmissionDate)) / (1000 * 60 * 60 * 24)));
  const dailyBedRate = parseFloat(bed.DailyRate || 120);
  const totalBedCharges = days * dailyBedRate;
  const physicianRoundFee = rounds.length * 40.00;

  const masterTests = DAL.find('LaboratoryTests');
  const masterMeds = DAL.find('Medications');
  const allResults = DAL.find('LaboratoryResults');
  const allRx = DAL.find('Prescriptions');
  const allRxItems = DAL.find('PrescriptionItems');

  const ipdOrders = allResults.filter(r => r.PatientID === adm.PatientID && (r.VisitID === adm.AdmissionID || (adm.SourceEncounterID && r.VisitID === adm.SourceEncounterID) || (r.Notes && r.Notes.includes('[IPD Order]'))));
  const ipdRx = allRx.filter(rx => rx.PatientID === adm.PatientID && (rx.VisitID === adm.AdmissionID || (adm.SourceEncounterID && rx.VisitID === adm.SourceEncounterID)));
  let rxItems = [];
  ipdRx.forEach(rx => {
    rxItems = rxItems.concat(allRxItems.filter(it => it.PrescriptionID === rx.PrescriptionID));
  });

  const diagnosticsTotal = ipdOrders.reduce((acc, o) => {
    const t = masterTests.find(m => m.TestID === o.TestID);
    return acc + (t ? parseFloat(t.Cost) : 40.00);
  }, 0);
  const pharmacyTotal = rxItems.reduce((acc, it) => {
    const m = masterMeds.find(med => med.MedicationID === it.MedicationID);
    return acc + (m ? (parseFloat(m.UnitPrice) * (parseInt(it.Quantity) / 10 || 1)) : 20.00);
  }, 0);
  const totalInpatientBill = totalBedCharges + physicianRoundFee + diagnosticsTotal + pharmacyTotal;

  // 1. Update Admission Record
  DAL.update('Admissions', admissionId, {
    Status: 'Discharged',
    IpdStage: 'Discharged',
    ActualDischargeDate: dischDate,
    TotalDays: days,
    DischargeDisposition: disp,
    DischargeSummary: summary
  });

  // 2. Release Hospital Bed back to Available
  if (adm.BedID) {
    DAL.update('Beds', adm.BedID, {
      Status: 'Available',
      CurrentAdmissionID: null
    });
  }

  // 3. Generate Inpatient Invoice
  const invCount = DAL.find('Invoices').length + 1;
  DAL.create('Invoices', {
    InvoiceNumber: `INV-2026-${String(invCount).padStart(4, '0')}`,
    PatientID: adm.PatientID,
    VisitID: admissionId,
    InvoiceDate: dischDate,
    TotalAmount: totalInpatientBill,
    Discount: 0,
    Tax: 0,
    AmountPaid: 0,
    Balance: totalInpatientBill,
    PaymentStatus: 'Unpaid',
    Notes: `IPD Hospital Stay Invoice: ${days} days in ${bed.WardName || 'IPD'} (Bed $${totalBedCharges.toFixed(2)}, Rounds $${physicianRoundFee.toFixed(2)}, Diagnostics $${diagnosticsTotal.toFixed(2)}, Pharmacy $${pharmacyTotal.toFixed(2)})`
  });

  // 4. Create Follow-up if selected
  if (followup) {
    DAL.create('FollowUps', {
      PatientID: adm.PatientID,
      DoctorID: adm.DoctorID,
      RelatedVisitID: admissionId,
      FollowUpDate: followup,
      Reason: `IPD Post-Discharge Follow-up: ${adm.AdmittingDiagnosis || 'Inpatient recovery'}`,
      Status: 'Pending'
    });
  }

  closeModal();
  showToast(`Inpatient stay ${adm.AdmissionNumber || admissionId} cleared! Bed ${bed.BedNumber || ''} released. Invoice of $${totalInpatientBill.toFixed(2)} generated.`, 'success');
  renderMainView();
}

// ==========================================
// 14C. EMERGENCY DEPARTMENT (ED / ER) WORKFLOW & MODALS
// ==========================================

function getEsiBadge(esi) {
  const level = parseInt(esi) || 3;
  const badges = {
    1: '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black bg-rose-600 text-white animate-pulse shadow-xs border border-rose-700">ESI 1 &bull; Resuscitation</span>',
    2: '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-amber-600 text-white shadow-xs border border-amber-700">ESI 2 &bull; Emergent</span>',
    3: '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-yellow-400 text-slate-950 border border-yellow-500">ESI 3 &bull; Urgent</span>',
    4: '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-600 text-white border border-emerald-700">ESI 4 &bull; Less Urgent</span>',
    5: '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-600 text-white border border-blue-700">ESI 5 &bull; Non-Urgent</span>'
  };
  return badges[level] || badges[3];
}

function getEmergencyStageBadge(stage) {
  const badges = {
    'Triage': '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300"><i data-lucide="heart-pulse" class="w-3 h-3"></i> 1. Triage & ESI</span>',
    'PrimarySurvey': '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300"><i data-lucide="clipboard-check" class="w-3 h-3"></i> 2. Primary Survey</span>',
    'StatOrders': '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300"><i data-lucide="flask-conical" class="w-3 h-3"></i> 3. STAT Orders</span>',
    'Stabilization': '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300"><i data-lucide="activity" class="w-3 h-3"></i> 4. Stabilization</span>',
    'Disposition': '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300"><i data-lucide="arrow-right-left" class="w-3 h-3"></i> 5. Disposition</span>',
    'Completed': '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800"><i data-lucide="check-circle" class="w-3 h-3"></i> Discharged</span>',
    'Transferred': '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 text-indigo-800"><i data-lucide="building-2" class="w-3 h-3"></i> Admitted to IPD</span>'
  };
  return badges[stage] || `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">${stage}</span>`;
}

function calculateErGcs() {
  const eye = parseInt(document.getElementById('gcs-eye')?.value || 4);
  const verbal = parseInt(document.getElementById('gcs-verbal')?.value || 5);
  const motor = parseInt(document.getElementById('gcs-motor')?.value || 6);
  const total = eye + verbal + motor;
  
  const gcsInput = document.getElementById('stage1-gcs');
  if (gcsInput) gcsInput.value = total;

  const badge = document.getElementById('gcs-score-badge');
  if (badge) {
    if (total <= 8) {
      badge.className = 'px-2.5 py-1 rounded text-xs font-bold bg-rose-600 text-white animate-pulse';
      badge.innerHTML = `GCS ${total}/15 &bull; Severe Coma (Intubation Risk)`;
    } else if (total <= 12) {
      badge.className = 'px-2.5 py-1 rounded text-xs font-bold bg-amber-500 text-slate-950';
      badge.innerHTML = `GCS ${total}/15 &bull; Moderate Impairment`;
    } else {
      badge.className = 'px-2.5 py-1 rounded text-xs font-bold bg-emerald-600 text-white';
      badge.innerHTML = `GCS ${total}/15 &bull; Mild / Intact`;
    }
  }
}

function renderEmergencyGrid() {
  const allEmergency = DAL.find('EmergencyEncounters') || [];
  const allBays = DAL.find('EmergencyBays') || [];
  
  const activeEncounters = allEmergency.filter(e => e.Status !== 'Discharged' && e.Status !== 'Transferred');
  const criticalCount = allEmergency.filter(e => (parseInt(e.EsiLevel) === 1 || parseInt(e.EsiLevel) === 2) && e.Status !== 'Discharged');
  const availableBays = allBays.filter(b => b.Status === 'Available');
  const transferredCount = allEmergency.filter(e => e.Status === 'Transferred' || (e.Disposition && e.Disposition.includes('IPD')));

  if (!window._erEsiFilter) window._erEsiFilter = 'ALL';

  let filtered = allEmergency;
  if (window._erEsiFilter !== 'ALL') {
    filtered = filtered.filter(e => parseInt(e.EsiLevel) === parseInt(window._erEsiFilter));
  }
  if (appState.searchTerm) {
    const q = appState.searchTerm.toLowerCase();
    filtered = filtered.filter(e => 
      (e.EncounterNumber && e.EncounterNumber.toLowerCase().includes(q)) ||
      (e.ChiefComplaint && e.ChiefComplaint.toLowerCase().includes(q)) ||
      (e.PrimaryDiagnosis && e.PrimaryDiagnosis.toLowerCase().includes(q)) ||
      (e.Status && e.Status.toLowerCase().includes(q)) ||
      (e.EmergencyStage && e.EmergencyStage.toLowerCase().includes(q))
    );
  }

  filtered.sort((a, b) => {
    const aActive = (a.Status !== 'Discharged' && a.Status !== 'Transferred') ? 0 : 1;
    const bActive = (b.Status !== 'Discharged' && b.Status !== 'Transferred') ? 0 : 1;
    if (aActive !== bActive) return aActive - bActive;
    return (parseInt(a.EsiLevel) || 5) - (parseInt(b.EsiLevel) || 5);
  });

  return `
    <div class="space-y-4">
      <!-- ER KPI Summary Bar -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div class="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active ER Patients</div>
            <div class="text-xl font-bold text-rose-700 mt-0.5">${activeEncounters.length}</div>
            <div class="text-[10px] text-slate-400">Currently in Emergency Dept</div>
          </div>
          <div class="w-9 h-9 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <i data-lucide="siren" class="w-5 h-5 animate-pulse"></i>
          </div>
        </div>

        <div class="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">ESI 1 & 2 Critical</div>
            <div class="text-xl font-bold text-amber-600 mt-0.5">${criticalCount.length}</div>
            <div class="text-[10px] text-slate-400">Resuscitation & Emergent</div>
          </div>
          <div class="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <i data-lucide="alert-triangle" class="w-5 h-5"></i>
          </div>
        </div>

        <div class="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">ER Bays Available</div>
            <div class="text-xl font-bold text-emerald-700 mt-0.5">${availableBays.length} / ${allBays.length}</div>
            <div class="text-[10px] text-slate-400">Ready for Immediate Intake</div>
          </div>
          <div class="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <i data-lucide="check-circle-2" class="w-5 h-5"></i>
          </div>
        </div>

        <div class="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <div class="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Direct IPD Transfers</div>
            <div class="text-xl font-bold text-blue-700 mt-0.5">${transferredCount.length}</div>
            <div class="text-[10px] text-slate-400">Admitted to Hospital Wards</div>
          </div>
          <div class="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <i data-lucide="building-2" class="w-5 h-5"></i>
          </div>
        </div>
      </div>

      <!-- Main Emergency Encounters Table -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-235px)]">
        <div class="p-3 bg-[#f8f9fa] border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <i data-lucide="siren" class="w-4 h-4 text-rose-600"></i>
            <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Emergency Department (ER / ED) Encounters</span>
            <span class="text-[11px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">${allEmergency.length} Total</span>
          </div>

          <!-- Acuity Pills -->
          <div class="flex flex-wrap items-center gap-1.5 text-xs">
            <span class="font-bold text-slate-500 text-[11px]">Acuity:</span>
            ${['ALL', '1', '2', '3', '4', '5'].map(esi => `
              <button onclick="window._erEsiFilter = '${esi}'; renderMainView();" class="px-2 py-0.5 rounded text-[11px] font-semibold transition ${window._erEsiFilter === esi ? 'bg-[#002050] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}">
                ${esi === 'ALL' ? 'All ESI' : 'ESI ' + esi}
              </button>
            `).join('')}
          </div>

          <div class="flex items-center gap-2">
            <input type="text" placeholder="Search ER encounters, chief complaint..." value="${appState.searchTerm}" onkeyup="handleGridSearch(event)" class="text-xs border border-slate-300 rounded px-3 py-1 bg-white outline-none focus:border-rose-500 w-52">
            <button onclick="openNewEmergencyModal()" class="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs transition">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>+ New ER Intake</span>
            </button>
            <button onclick="navigateTo('emergency_bays')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 border border-slate-300 transition" title="View ER Trauma & Bay Board">
              <i data-lucide="layout-grid" class="w-3.5 h-3.5"></i>
              <span>ER Bays</span>
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-auto custom-scrollbar">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-300 z-10 select-none">
              <tr>
                <th class="p-2.5">Triage # & Time</th>
                <th class="p-2.5">Patient Demographics</th>
                <th class="p-2.5">Acuity (ESI)</th>
                <th class="p-2.5">Assigned ER Bay</th>
                <th class="p-2.5">Attending MD & Arrival</th>
                <th class="p-2.5">Chief Complaint</th>
                <th class="p-2.5">Triage Vitals</th>
                <th class="p-2.5">ER Stage</th>
                <th class="p-2.5">Status</th>
                <th class="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              ${filtered.map(e => {
                const pat = DAL.findById('Patients', e.PatientID) || {};
                const doc = DAL.findById('Doctors', e.DoctorID) || {};
                const bay = DAL.findById('EmergencyBays', e.BayID) || {};
                const isTransferred = e.Status === 'Transferred';
                const isDischarged = e.Status === 'Discharged';

                return `
                  <tr class="hover:bg-slate-50 transition">
                    <td class="p-2.5">
                      <div class="font-mono font-bold text-rose-700">${e.EncounterNumber || e.EncounterID}</div>
                      <div class="text-[10px] text-slate-500 font-mono">${e.ArrivalTime || '10:00 AM'}</div>
                    </td>
                    <td class="p-2.5 font-semibold text-slate-900">
                      <div>${pat.FirstName || 'Patient'} ${pat.LastName || ''}</div>
                      <div class="text-[10px] text-slate-500 font-normal">${pat.Gender || ''}, ${pat.DateOfBirth || ''} &bull; <span class="font-mono">${pat.PatientNumber || ''}</span></div>
                    </td>
                    <td class="p-2.5">
                      ${getEsiBadge(e.EsiLevel)}
                    </td>
                    <td class="p-2.5">
                      <span class="inline-flex items-center gap-1 font-semibold text-slate-800">
                        <i data-lucide="layout-grid" class="w-3.5 h-3.5 text-rose-600"></i> ${bay.BayNumber || e.BayID || 'Unassigned'}
                      </span>
                      <div class="text-[10px] text-slate-500">${bay.BayName || bay.Zone || 'ER Zone'}</div>
                    </td>
                    <td class="p-2.5 text-slate-700">
                      <div class="font-medium">${doc.DoctorName || 'ER Attending'}</div>
                      <div class="text-[10px] text-slate-500 flex items-center gap-1">
                        <i data-lucide="${e.ArrivalMode === 'Ambulance (EMS)' ? 'ambulance' : 'user'}" class="w-3 h-3 text-slate-400"></i> ${e.ArrivalMode || 'Walk-in'}
                      </div>
                    </td>
                    <td class="p-2.5 text-slate-800 max-w-xs">
                      <div class="font-medium truncate" title="${e.ChiefComplaint || ''}">${e.ChiefComplaint || 'Emergency Assessment'}</div>
                      ${e.PrimaryDiagnosis ? `<div class="text-[10px] text-blue-700 truncate font-semibold">${e.PrimaryDiagnosis}</div>` : ''}
                    </td>
                    <td class="p-2.5 font-mono text-[11px] text-slate-600">
                      <div>BP: <strong class="text-slate-900">${e.BloodPressure || '120/80'}</strong> &bull; HR: <strong class="text-slate-900">${e.HeartRate || '75'}</strong></div>
                      <div>SpO2: <strong class="text-slate-900">${e.SpO2 || '98'}%</strong> &bull; GCS: <strong class="text-slate-900">${e.GlasgowComaScale || '15'}</strong></div>
                    </td>
                    <td class="p-2.5">${getEmergencyStageBadge(e.EmergencyStage || 'Triage')}</td>
                    <td class="p-2.5">${getStatusBadge(e.Status)}</td>
                    <td class="p-2.5 text-right space-x-1 whitespace-nowrap">
                      <button onclick="openEmergencyWorkflow('${e.EncounterID}')" class="px-2.5 py-1 bg-gradient-to-r from-rose-700 to-amber-700 hover:from-rose-800 hover:to-amber-800 text-white rounded text-[11px] font-semibold inline-flex items-center gap-1 shadow-2xs transition" title="Open Dynamics 365 ER Clinical Workflow">
                        <i data-lucide="git-branch" class="w-3 h-3"></i> ER Process
                      </button>
                      ${!isTransferred && !isDischarged ? `
                        <button onclick="transferErToIpd('${e.EncounterID}')" class="px-2 py-1 bg-blue-50 border border-blue-300 text-blue-700 rounded text-[11px] font-semibold hover:bg-blue-100 transition shadow-2xs inline-flex items-center gap-1" title="Direct Admit to IPD Inpatient Ward">
                          <i data-lucide="building-2" class="w-3 h-3"></i> Admit IPD
                        </button>
                      ` : ''}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function renderEmergencyBaysGrid() {
  const allBays = DAL.find('EmergencyBays') || [];
  const allEmergency = DAL.find('EmergencyEncounters') || [];

  if (!window._erBayZoneFilter) window._erBayZoneFilter = 'ALL';
  if (!window._erBayStatusFilter) window._erBayStatusFilter = 'ALL';

  const zones = ['ALL', 'Red Zone (Resuscitation)', 'Yellow Zone (Acute)', 'Green Zone (Fast Track)'];
  const statuses = ['ALL', 'Available', 'Occupied', 'Cleaning', 'Maintenance'];

  let filteredBays = allBays;
  if (window._erBayZoneFilter !== 'ALL') {
    filteredBays = filteredBays.filter(b => b.Zone === window._erBayZoneFilter);
  }
  if (window._erBayStatusFilter !== 'ALL') {
    filteredBays = filteredBays.filter(b => b.Status === window._erBayStatusFilter);
  }
  if (appState.searchTerm) {
    const q = appState.searchTerm.toLowerCase();
    filteredBays = filteredBays.filter(b => 
      (b.BayNumber && b.BayNumber.toLowerCase().includes(q)) ||
      (b.BayName && b.BayName.toLowerCase().includes(q)) ||
      (b.BayType && b.BayType.toLowerCase().includes(q)) ||
      (b.EquipmentList && b.EquipmentList.toLowerCase().includes(q))
    );
  }

  const occupiedCount = allBays.filter(b => b.Status === 'Occupied').length;
  const availableCount = allBays.filter(b => b.Status === 'Available').length;
  const cleaningCount = allBays.filter(b => b.Status === 'Cleaning' || b.Status === 'Maintenance').length;

  return `
    <div class="space-y-4">
      <!-- ER Bay Management Header & Actions -->
      <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
            <i data-lucide="layout-grid" class="w-6 h-6"></i>
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-800">ER Trauma & Resuscitation Bays</h3>
            <p class="text-[11px] text-slate-500">Real-time emergency bay status, life-support equipment, and rapid trauma intake</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 gap-1">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span> ${availableCount} Available
          </span>
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 gap-1">
            <span class="w-2 h-2 rounded-full bg-rose-500"></span> ${occupiedCount} Occupied
          </span>
          <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 gap-1">
            <span class="w-2 h-2 rounded-full bg-amber-500"></span> ${cleaningCount} Cleaning / Prep
          </span>
          <button onclick="openNewEmergencyBayModal()" class="px-3 py-1.5 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs transition">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i> Add ER Bay
          </button>
          <button onclick="navigateTo('emergency')" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 border border-slate-300 transition">
            <i data-lucide="siren" class="w-3.5 h-3.5"></i> Emergency Encounters
          </button>
        </div>
      </div>

      <!-- Filters Toolbar -->
      <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="font-bold text-slate-600 mr-1 flex items-center gap-1"><i data-lucide="filter" class="w-3.5 h-3.5"></i> Zone:</span>
          ${zones.map(z => `
            <button onclick="window._erBayZoneFilter = '${z}'; renderMainView();" class="px-2.5 py-1 rounded font-medium transition ${window._erBayZoneFilter === z ? 'bg-[#002050] text-white font-bold shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              ${z === 'ALL' ? 'All Zones' : z}
            </button>
          `).join('')}
        </div>

        <div class="flex flex-wrap items-center gap-1.5">
          <span class="font-bold text-slate-600 mr-1">Status:</span>
          ${statuses.map(st => `
            <button onclick="window._erBayStatusFilter = '${st}'; renderMainView();" class="px-2.5 py-1 rounded font-medium transition ${window._erBayStatusFilter === st ? 'bg-slate-800 text-white font-bold shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              ${st === 'ALL' ? 'All Status' : st}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- ER Bays Grid Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        ${filteredBays.map(b => {
          const enc = b.CurrentEncounterID ? DAL.findById('EmergencyEncounters', b.CurrentEncounterID) : allEmergency.find(e => e.BayID === b.BayID && e.Status !== 'Discharged' && e.Status !== 'Transferred');
          const pat = enc ? DAL.findById('Patients', enc.PatientID) : null;
          
          let statusBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
          let statusDot = 'bg-emerald-500';
          if (b.Status === 'Occupied') {
            statusBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
            statusDot = 'bg-rose-500 animate-pulse';
          } else if (b.Status === 'Cleaning') {
            statusBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
            statusDot = 'bg-amber-500';
          } else if (b.Status === 'Maintenance') {
            statusBadgeClass = 'bg-slate-200 text-slate-800 border-slate-300';
            statusDot = 'bg-slate-500';
          }

          let zoneBg = 'bg-slate-50 border-slate-200';
          if (b.Zone && b.Zone.includes('Red')) zoneBg = 'bg-rose-50/40 border-rose-200';
          else if (b.Zone && b.Zone.includes('Yellow')) zoneBg = 'bg-amber-50/40 border-amber-200';
          else if (b.Zone && b.Zone.includes('Green')) zoneBg = 'bg-emerald-50/40 border-emerald-200';

          return `
            <div class="rounded-lg border shadow-2xs flex flex-col justify-between overflow-hidden bg-white transition hover:shadow-md ${zoneBg}">
              <!-- Card Top -->
              <div class="p-3.5 border-b border-slate-100">
                <div class="flex items-center justify-between mb-1.5">
                  <span class="font-mono font-bold text-sm text-slate-900">${b.BayNumber}</span>
                  <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadgeClass}">
                    <span class="w-1.5 h-1.5 rounded-full ${statusDot}"></span> ${b.Status}
                  </span>
                </div>
                <div class="font-bold text-xs text-slate-800">${b.BayName}</div>
                <div class="text-[10px] text-slate-500 flex items-center justify-between mt-1">
                  <span>${b.Zone || 'ER Zone'} &bull; ${b.BayType || 'Acute'}</span>
                  <span class="font-mono font-semibold text-emerald-700">${parseFloat(b.HourlyRate || 250).toFixed(0)}/hr</span>
                </div>
              </div>

              <!-- Card Middle: Occupant or Equipment -->
              <div class="p-3.5 space-y-2 flex-1 text-xs">
                ${enc && pat ? `
                  <div class="p-2.5 bg-rose-50 border border-rose-200 rounded-md space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Active ER Patient</span>
                      ${getEsiBadge(enc.EsiLevel)}
                    </div>
                    <div class="font-bold text-slate-900 text-xs">${pat.FirstName} ${pat.LastName}</div>
                    <div class="text-[10px] text-slate-500 font-mono">${enc.EncounterNumber} &bull; Arr: ${enc.ArrivalTime || 'Recent'}</div>
                    <div class="text-[10px] text-rose-900 truncate font-medium mt-0.5">${enc.ChiefComplaint || 'Emergency Patient'}</div>
                  </div>
                ` : `
                  <div class="p-3 bg-emerald-50/60 border border-emerald-100 rounded-md text-center py-4">
                    <i data-lucide="check-circle" class="w-6 h-6 text-emerald-500 mx-auto mb-1"></i>
                    <div class="text-[11px] font-semibold text-emerald-800">Bay Clean & Available</div>
                    <div class="text-[10px] text-slate-400">Ready for Immediate Patient Placement</div>
                  </div>
                `}

                <!-- Equipment Badges -->
                <div>
                  <div class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Available Equipment</div>
                  <div class="flex flex-wrap gap-1">
                    ${(b.EquipmentList || 'Crash Cart, Monitor, Oxygen').split(',').map(eq => `
                      <span class="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">${eq.trim()}</span>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Card Bottom Controls -->
              <div class="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-1 text-[11px]">
                <div class="flex items-center gap-1">
                  <select onchange="quickChangeEmergencyBayStatus('${b.BayID}', this.value)" class="text-[11px] border border-slate-300 rounded px-1.5 py-0.5 bg-white font-medium">
                    <option value="Available" ${b.Status === 'Available' ? 'selected' : ''}>Set Available</option>
                    <option value="Occupied" ${b.Status === 'Occupied' ? 'selected' : ''}>Set Occupied</option>
                    <option value="Cleaning" ${b.Status === 'Cleaning' ? 'selected' : ''}>Set Cleaning</option>
                    <option value="Maintenance" ${b.Status === 'Maintenance' ? 'selected' : ''}>Set Maint.</option>
                  </select>
                </div>

                <div class="flex items-center gap-1">
                  ${enc ? `
                    <button onclick="openEmergencyWorkflow('${enc.EncounterID}')" class="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-bold shadow-2xs transition">
                      Workflow
                    </button>
                    <button onclick="transferErToIpd('${enc.EncounterID}')" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold shadow-2xs transition" title="Admit to Inpatient">
                      Admit IPD
                    </button>
                  ` : `
                    <button onclick="openNewEmergencyModal(null, '${b.BayID}')" class="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold shadow-2xs transition">
                      + Intake
                    </button>
                  `}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function openNewEmergencyModal(prefillPatientId, prefillBayId) {
  const patients = DAL.find('Patients') || [];
  const doctors = DAL.find('Doctors') || [];
  const allBays = DAL.find('EmergencyBays') || [];
  const encounters = DAL.find('EmergencyEncounters') || [];

  const availableBays = allBays.filter(b => b.Status === 'Available' || b.BayID === prefillBayId);
  const nextNum = `ER-2026-${String(encounters.length + 1).padStart(4, '0')}`;
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  openModal(`
    <div class="px-6 py-4 bg-[#002050] text-white flex justify-between items-center">
      <h3 class="font-bold text-sm flex items-center gap-2"><i data-lucide="siren" class="w-4 h-4 text-rose-400 animate-pulse"></i> New Emergency Department Triage Intake</h3>
      <button onclick="closeModal()" class="text-slate-300 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
    </div>
    <form onsubmit="handleSaveEmergencyIntake(event)" class="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh] custom-scrollbar">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">ER Triage Number</label>
          <input type="text" id="er-number" value="${nextNum}" readonly class="w-full border border-slate-300 rounded p-2 font-mono font-bold bg-slate-50 text-rose-800">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Arrival Time *</label>
          <input type="text" id="er-arrival-time" value="${now}" required class="w-full border border-slate-300 rounded p-2 font-mono">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Arrival Mode *</label>
          <select id="er-arrival-mode" required class="w-full border border-slate-300 rounded p-2 font-medium">
            <option value="Ambulance (EMS)">Ambulance (EMS Lights & Siren)</option>
            <option value="Walk-in">Walk-in / Private Vehicle</option>
            <option value="Helicopter / Medevac">Helicopter / Medevac</option>
            <option value="Police Escort">Police / First Responder Escort</option>
            <option value="Internal Transfer">Internal Hospital Transfer</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Select Patient *</label>
          <select id="er-patient" required class="w-full border border-slate-300 rounded p-2 font-medium">
            <option value="">-- Choose Registered Patient --</option>
            ${patients.map(p => `<option value="${p.PatientID}" ${p.PatientID === prefillPatientId ? 'selected' : ''}>${p.FirstName} ${p.LastName} (${p.PatientNumber})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Emergency Acuity (ESI Level) *</label>
          <select id="er-esi" required class="w-full border border-rose-300 bg-rose-50/30 rounded p-2 font-bold text-rose-900">
            <option value="1">ESI 1 - Resuscitation (Immediate Life Threat)</option>
            <option value="2">ESI 2 - Emergent (High Risk / Severe Pain / Altered Mental)</option>
            <option value="3" selected>ESI 3 - Urgent (Multiple Resources Needed)</option>
            <option value="4">ESI 4 - Less Urgent (Single Resource Needed)</option>
            <option value="5">ESI 5 - Non-Urgent (Routine ER Assessment)</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">ER Bay Allocation *</label>
          <select id="er-bay" required class="w-full border border-slate-300 rounded p-2 font-medium">
            <option value="">-- Select Available Bay --</option>
            ${availableBays.map(b => `<option value="${b.BayID}" ${b.BayID === prefillBayId ? 'selected' : ''}>${b.BayNumber} - ${b.BayName} (${b.Zone || b.BayType})</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Attending ER Physician *</label>
          <select id="er-doctor" required class="w-full border border-slate-300 rounded p-2">
            <option value="">-- Select Attending Doctor --</option>
            ${doctors.map(d => `<option value="${d.DoctorID}">${d.DoctorName} (${d.Specialization})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Initial Glasgow Coma Scale (GCS 3-15)</label>
          <input type="number" id="er-gcs" min="3" max="15" value="15" class="w-full border border-slate-300 rounded p-2 font-mono">
        </div>
      </div>

      <div>
        <label class="block font-semibold text-slate-700 mb-1">Chief Complaint & Presenting Problem *</label>
        <textarea id="er-complaint" required rows="2" placeholder="e.g. Acute severe substernal chest pressure with radiation to jaw, diaphoresis..." class="w-full border border-slate-300 rounded p-2"></textarea>
      </div>

      <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
        <span class="font-bold text-slate-800 flex items-center gap-1.5"><i data-lucide="activity" class="w-4 h-4 text-rose-600"></i> Baseline Triage Vital Signs</span>
        <div class="grid grid-cols-2 md:grid-cols-5 gap-2">
          <div>
            <label class="text-[10px] text-slate-500">BP (mmHg)</label>
            <input type="text" id="er-bp" value="130/80" placeholder="120/80" class="w-full border border-slate-300 rounded p-1.5 font-mono">
          </div>
          <div>
            <label class="text-[10px] text-slate-500">Heart Rate (bpm)</label>
            <input type="number" id="er-hr" value="88" placeholder="75" class="w-full border border-slate-300 rounded p-1.5 font-mono">
          </div>
          <div>
            <label class="text-[10px] text-slate-500">SpO2 (%)</label>
            <input type="number" id="er-spo2" value="98" placeholder="98" class="w-full border border-slate-300 rounded p-1.5 font-mono">
          </div>
          <div>
            <label class="text-[10px] text-slate-500">Temp (°C)</label>
            <input type="text" id="er-temp" value="37.0" placeholder="36.8" class="w-full border border-slate-300 rounded p-1.5 font-mono">
          </div>
          <div>
            <label class="text-[10px] text-slate-500">Resp Rate (/min)</label>
            <input type="number" id="er-rr" value="18" placeholder="16" class="w-full border border-slate-300 rounded p-1.5 font-mono">
          </div>
        </div>
      </div>

      <div>
        <label class="block font-semibold text-slate-700 mb-1">Triage Nurse Notes & Suspected Flags</label>
        <input type="text" id="er-notes" placeholder="e.g. Allergies: Penicillin; STEMI Alert activated; C-Collar immobilized" class="w-full border border-slate-300 rounded p-2">
      </div>

      <div class="pt-4 border-t flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded text-slate-600 font-semibold hover:bg-slate-50">Cancel</button>
        <button type="submit" class="px-4 py-2 bg-rose-600 text-white font-bold rounded hover:bg-rose-700 flex items-center gap-1.5 shadow-sm">
          <i data-lucide="siren" class="w-4 h-4"></i> Complete ER Intake & Assign Bay
        </button>
      </div>
    </form>
  `);
}

function handleSaveEmergencyIntake(e) {
  e.preventDefault();
  const num = document.getElementById('er-number').value;
  const patientId = document.getElementById('er-patient').value;
  const doctorId = document.getElementById('er-doctor').value;
  const bayId = document.getElementById('er-bay').value;
  const arrivalTime = document.getElementById('er-arrival-time').value;
  const arrivalMode = document.getElementById('er-arrival-mode').value;
  const esi = parseInt(document.getElementById('er-esi').value);
  const gcs = parseInt(document.getElementById('er-gcs').value) || 15;
  const complaint = document.getElementById('er-complaint').value;
  const bp = document.getElementById('er-bp').value;
  const hr = parseInt(document.getElementById('er-hr').value) || 80;
  const spo2 = parseInt(document.getElementById('er-spo2').value) || 98;
  const temp = document.getElementById('er-temp').value || '37.0';
  const rr = parseInt(document.getElementById('er-rr').value) || 18;
  const notes = document.getElementById('er-notes').value;

  const newEnc = DAL.create('EmergencyEncounters', {
    EncounterNumber: num,
    PatientID: patientId,
    DoctorID: doctorId,
    BayID: bayId,
    ArrivalTime: arrivalTime,
    ArrivalMode: arrivalMode,
    EsiLevel: esi,
    ChiefComplaint: complaint,
    PrimaryDiagnosis: '',
    EmergencyStage: 'Triage',
    Status: 'Active',
    BloodPressure: bp,
    HeartRate: hr,
    Temperature: temp,
    SpO2: spo2,
    RespiratoryRate: rr,
    GlasgowComaScale: gcs,
    PrimarySurveyABCDE: 'Pending Primary Survey',
    StatOrders: '12-Lead ECG, Blood Type & Screen',
    Interventions: 'IV access 18G, Cardiac Monitor applied',
    Disposition: 'Under Emergency Care',
    EstimatedCost: 250,
    Notes: notes,
    CreatedDate: new Date().toISOString().split('T')[0]
  });

  if (bayId) {
    DAL.update('EmergencyBays', bayId, {
      Status: 'Occupied',
      CurrentEncounterID: newEnc.EncounterID
    });
  }

  closeModal();
  showToast(`ER Encounter ${num} registered! Patient assigned to Bay. Opening ER Clinical Workflow...`, 'success');
  renderMainView();
  openEmergencyWorkflow(newEnc.EncounterID);
}

function openNewEmergencyBayModal() {
  const bays = DAL.find('EmergencyBays') || [];
  const nextNum = `BAY-${String(bays.length + 1).padStart(3, '0')}`;

  openModal(`
    <div class="px-6 py-4 bg-[#002050] text-white flex justify-between items-center">
      <h3 class="font-bold text-sm flex items-center gap-2"><i data-lucide="layout-grid" class="w-4 h-4 text-blue-400"></i> Add New ER Bay / Trauma Station</h3>
      <button onclick="closeModal()" class="text-slate-300 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
    </div>
    <form onsubmit="handleCreateEmergencyBay(event)" class="p-6 space-y-4 text-xs">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Bay Number *</label>
          <input type="text" id="new-bay-number" value="${nextNum}" required class="w-full border border-slate-300 rounded p-2 font-mono">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Bay Name *</label>
          <input type="text" id="new-bay-name" required placeholder="e.g. Trauma Station Delta" class="w-full border border-slate-300 rounded p-2">
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Bay Type *</label>
          <select id="new-bay-type" required class="w-full border border-slate-300 rounded p-2">
            <option value="Resuscitation">Resuscitation (Code / Shock)</option>
            <option value="Trauma">Trauma Bay (Major / Polytrauma)</option>
            <option value="Cardiac">Cardiac Station (STEMI / Dysrhythmia)</option>
            <option value="Acute Care">Acute Care Bay</option>
            <option value="Fast Track">Fast Track (Ambulatory Minor)</option>
            <option value="Pediatric">Pediatric Emergency</option>
            <option value="Isolation">Negative Pressure Isolation</option>
            <option value="Observation">Observation Unit</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">ER Zone *</label>
          <select id="new-bay-zone" required class="w-full border border-slate-300 rounded p-2">
            <option value="Red Zone (Resuscitation)">Red Zone (Resuscitation)</option>
            <option value="Yellow Zone (Acute)">Yellow Zone (Acute Care)</option>
            <option value="Green Zone (Fast Track)">Green Zone (Fast Track)</option>
          </select>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Hourly Rate ($) *</label>
          <input type="number" id="new-bay-rate" value="280" required class="w-full border border-slate-300 rounded p-2 font-mono">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Initial Status</label>
          <select id="new-bay-status" class="w-full border border-slate-300 rounded p-2">
            <option value="Available">Available</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
      </div>
      <div>
        <label class="block font-semibold text-slate-700 mb-1">Available Equipment List</label>
        <input type="text" id="new-bay-equip" value="Ventilator, Defibrillator, Multiparameter Monitor, Suction, Oxygen" class="w-full border border-slate-300 rounded p-2">
      </div>
      <div class="pt-4 border-t flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded text-slate-600">Cancel</button>
        <button type="submit" class="px-4 py-2 bg-[#0078d4] text-white font-semibold rounded hover:bg-[#106ebe]">Save Bay</button>
      </div>
    </form>
  `);
}

function handleCreateEmergencyBay(e) {
  e.preventDefault();
  const num = document.getElementById('new-bay-number').value;
  const name = document.getElementById('new-bay-name').value;
  const type = document.getElementById('new-bay-type').value;
  const zone = document.getElementById('new-bay-zone').value;
  const rate = parseFloat(document.getElementById('new-bay-rate').value) || 250;
  const status = document.getElementById('new-bay-status').value;
  const equip = document.getElementById('new-bay-equip').value;

  DAL.create('EmergencyBays', {
    BayNumber: num,
    BayName: name,
    BayType: type,
    Zone: zone,
    HourlyRate: rate,
    EquipmentList: equip,
    Status: status,
    CurrentEncounterID: null
  });

  closeModal();
  showToast(`ER Bay ${num} (${name}) created successfully!`, 'success');
  renderMainView();
}

function quickChangeEmergencyBayStatus(bayId, newStatus) {
  if (!newStatus) return;
  const bay = DAL.findById('EmergencyBays', bayId);
  if (!bay) return;

  const updateData = { Status: newStatus };
  if (newStatus === 'Available') {
    updateData.CurrentEncounterID = null;
  }
  DAL.update('EmergencyBays', bayId, updateData);
  showToast(`ER Bay ${bay.BayNumber} updated to ${newStatus}.`, 'info');
  renderMainView();
}

function openEmergencyWorkflow(encounterId, stageOverride) {
  const enc = DAL.findById('EmergencyEncounters', encounterId);
  if (!enc) {
    showToast('Emergency record not found', 'error');
    return;
  }

  const pat = DAL.findById('Patients', enc.PatientID) || {};
  const doc = DAL.findById('Doctors', enc.DoctorID) || {};
  const bay = DAL.findById('EmergencyBays', enc.BayID) || {};

  const stages = [
    { id: 'Triage', num: 1, title: 'Triage & ESI', icon: 'heart-pulse' },
    { id: 'PrimarySurvey', num: 2, title: 'Primary Survey', icon: 'clipboard-check' },
    { id: 'StatOrders', num: 3, title: 'STAT Orders', icon: 'flask-conical' },
    { id: 'Stabilization', num: 4, title: 'Stabilization', icon: 'activity' },
    { id: 'Disposition', num: 5, title: 'Disposition', icon: 'arrow-right-left' }
  ];

  const activeStage = stageOverride || enc.EmergencyStage || 'Triage';

  function getBpfClass(stageId) {
    const stageIndex = stages.findIndex(s => s.id === stageId);
    const activeIndex = stages.findIndex(s => s.id === activeStage);
    if (stageId === activeStage) {
      return 'bg-[#002050] text-white font-bold shadow-md border-b-2 border-rose-500';
    } else if (stageIndex < activeIndex || enc.Status === 'Discharged' || enc.Status === 'Transferred') {
      return 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold';
    } else {
      return 'bg-slate-50 text-slate-500 hover:bg-slate-100 font-medium';
    }
  }

  let stageHtml = '';
  switch (activeStage) {
    case 'Triage':
      stageHtml = renderEmergencyStage1_Triage(enc, pat, doc, bay);
      break;
    case 'PrimarySurvey':
      stageHtml = renderEmergencyStage2_PrimarySurvey(enc, pat, doc, bay);
      break;
    case 'StatOrders':
      stageHtml = renderEmergencyStage3_StatOrders(enc, pat, doc, bay);
      break;
    case 'Stabilization':
      stageHtml = renderEmergencyStage4_Stabilization(enc, pat, doc, bay);
      break;
    case 'Disposition':
    case 'Completed':
    case 'Transferred':
      stageHtml = renderEmergencyStage5_Disposition(enc, pat, doc, bay);
      break;
    default:
      stageHtml = renderEmergencyStage1_Triage(enc, pat, doc, bay);
  }

  openModal(`
    <div class="flex flex-col h-[90vh] max-w-5xl w-full mx-auto bg-slate-50 rounded-lg overflow-hidden shadow-2xl">
      <!-- D365 Model-driven Record Header -->
      <div class="bg-[#002050] text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-rose-600/70 border border-rose-400 flex items-center justify-center font-bold text-base shadow-sm">
            <i data-lucide="siren" class="w-5 h-5 text-rose-100 animate-pulse"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs uppercase tracking-wider text-rose-300 font-semibold">Emergency Encounter</span>
              <span class="text-xs bg-slate-800 px-2 py-0.5 rounded font-mono text-rose-200">${enc.EncounterNumber || enc.EncounterID}</span>
              ${getEsiBadge(enc.EsiLevel)}
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${enc.Status === 'Discharged' ? 'bg-slate-600 text-slate-200' : (enc.Status === 'Transferred' ? 'bg-indigo-600 text-white' : 'bg-rose-600 text-white animate-pulse')}">${enc.Status}</span>
            </div>
            <h2 class="text-base font-bold text-white flex items-center gap-2 mt-0.5">
              ${pat.FirstName || 'Patient'} ${pat.LastName || ''}
              <span class="text-xs font-normal text-slate-300">(${pat.PatientNumber || ''} &bull; ${pat.Gender || ''}, ${pat.DateOfBirth || ''})</span>
            </h2>
          </div>
        </div>

        <div class="flex items-center gap-5 text-xs text-right">
          <div class="hidden sm:block">
            <div class="text-[10px] text-blue-300 uppercase">ER Bay & Zone</div>
            <div class="font-bold font-mono text-white text-xs">${bay.BayNumber || 'Bay Unassigned'} (${bay.Zone || 'ER'})</div>
          </div>
          <div class="hidden sm:block">
            <div class="text-[10px] text-blue-300 uppercase">Attending ER MD</div>
            <div class="font-bold text-white text-xs">${doc.DoctorName || 'ER Attending'}</div>
          </div>
          <div class="hidden sm:block">
            <div class="text-[10px] text-blue-300 uppercase">Arrival Mode</div>
            <div class="font-bold text-amber-300 text-xs">${enc.ArrivalMode || 'Walk-in'} @ ${enc.ArrivalTime || 'Recent'}</div>
          </div>
          <button onclick="closeModal()" class="text-slate-300 hover:text-white p-1 rounded-md hover:bg-white/10 transition">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
      </div>

      <!-- Dynamics 365 Model-driven BPF Chevron Bar -->
      <div class="bg-white border-b border-slate-200 shadow-xs flex items-stretch overflow-x-auto select-none text-xs">
        ${stages.map((st) => `
          <div onclick="openEmergencyWorkflow('${enc.EncounterID}', '${st.id}')" class="bpf-step cursor-pointer ${getBpfClass(st.id)} flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition whitespace-nowrap">
            <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${activeStage === st.id ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-700'}">${st.num}</span>
            <i data-lucide="${st.icon}" class="w-3.5 h-3.5"></i>
            <span class="text-xs font-semibold">${st.title}</span>
          </div>
        `).join('')}
      </div>

      <!-- Active Stage View Body -->
      <div class="flex-1 overflow-y-auto p-5 custom-scrollbar bg-[#f8f9fa]">
        ${stageHtml}
      </div>
    </div>
  `);
}

function renderEmergencyStage1_Triage(enc, pat, doc, bay) {
  const isFinalized = enc.Status === 'Discharged' || enc.Status === 'Transferred';
  const gcs = parseInt(enc.GlasgowComaScale) || 15;

  return `
    <div class="space-y-4 max-w-4xl mx-auto text-xs">
      <!-- Stage Banner -->
      <div class="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-rose-950">
        <div class="flex items-center gap-2">
          <i data-lucide="heart-pulse" class="w-5 h-5 text-rose-600"></i>
          <div>
            <h4 class="font-bold text-sm">Stage 1: Triage Assessment & ESI Stratification</h4>
            <p class="text-[11px] text-rose-800">Assign Emergency Severity Index (ESI), calculate Glasgow Coma Scale (GCS), and capture vital signs.</p>
          </div>
        </div>
        <div>
          ${getEsiBadge(enc.EsiLevel)}
        </div>
      </div>

      <form onsubmit="handleUpdateEmergencyTriage(event, '${enc.EncounterID}')" class="space-y-4">
        <!-- ESI & Acuity Selection Card -->
        <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <h5 class="font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
            <span class="flex items-center gap-2"><i data-lucide="alert-circle" class="w-4 h-4 text-rose-600"></i> Emergency Severity Index (ESI) Stratification</span>
            <span class="text-[11px] text-slate-500 font-mono">Standard 5-Level ESI Algorithm</span>
          </h5>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Acuity Level (ESI 1 - 5) *</label>
              <select id="stage1-esi" required ${isFinalized ? 'disabled' : ''} class="w-full border border-rose-300 rounded p-2 font-bold text-rose-900 bg-rose-50/20">
                <option value="1" ${parseInt(enc.EsiLevel) === 1 ? 'selected' : ''}>ESI 1 - Immediate Resuscitation (Life-Threatening)</option>
                <option value="2" ${parseInt(enc.EsiLevel) === 2 ? 'selected' : ''}>ESI 2 - Emergent (High Risk / Severe Distress / Lethargic)</option>
                <option value="3" ${parseInt(enc.EsiLevel) === 3 ? 'selected' : ''}>ESI 3 - Urgent (Multiple Diagnostic Resources Required)</option>
                <option value="4" ${parseInt(enc.EsiLevel) === 4 ? 'selected' : ''}>ESI 4 - Less Urgent (Single Diagnostic Resource)</option>
                <option value="5" ${parseInt(enc.EsiLevel) === 5 ? 'selected' : ''}>ESI 5 - Non-Urgent (No Resources Needed / Clinical Exam Only)</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Mode of ER Arrival</label>
              <select id="stage1-arrival" ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2">
                <option value="Ambulance (EMS)" ${enc.ArrivalMode === 'Ambulance (EMS)' ? 'selected' : ''}>Ambulance (EMS)</option>
                <option value="Walk-in" ${enc.ArrivalMode === 'Walk-in' ? 'selected' : ''}>Walk-in / Private Transport</option>
                <option value="Helicopter / Medevac" ${enc.ArrivalMode === 'Helicopter / Medevac' ? 'selected' : ''}>Helicopter / Medevac</option>
                <option value="Police Escort" ${enc.ArrivalMode === 'Police Escort' ? 'selected' : ''}>Police Escort</option>
                <option value="Internal Transfer" ${enc.ArrivalMode === 'Internal Transfer' ? 'selected' : ''}>Internal Hospital Transfer</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Chief Complaint & Onset Time *</label>
            <input type="text" id="stage1-complaint" value="${enc.ChiefComplaint || ''}" required ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2">
          </div>
        </div>

        <!-- Interactive Glasgow Coma Scale (GCS) Calculator Card -->
        <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <div class="flex items-center justify-between border-b pb-2">
            <h5 class="font-bold text-slate-800 flex items-center gap-2">
              <i data-lucide="brain" class="w-4 h-4 text-purple-600"></i> Interactive Glasgow Coma Scale (GCS) Calculator
            </h5>
            <div id="gcs-score-badge" class="px-2.5 py-1 rounded text-xs font-bold ${gcs <= 8 ? 'bg-rose-600 text-white animate-pulse' : (gcs <= 12 ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white')}">
              GCS ${gcs}/15 &bull; ${gcs <= 8 ? 'Severe Coma (Intubation Risk)' : (gcs <= 12 ? 'Moderate Impairment' : 'Mild / Intact')}
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Eye Opening Response (1-4)</label>
              <select id="gcs-eye" onchange="calculateErGcs()" ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2">
                <option value="4" selected>4 - Spontaneous Eye Opening</option>
                <option value="3">3 - To Speech / Sound</option>
                <option value="2">2 - To Pressure / Pain</option>
                <option value="1">1 - None / Unresponsive</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Verbal Response (1-5)</label>
              <select id="gcs-verbal" onchange="calculateErGcs()" ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2">
                <option value="5" selected>5 - Oriented & Converses</option>
                <option value="4">4 - Confused Conversation</option>
                <option value="3">3 - Inappropriate Words</option>
                <option value="2">2 - Incomprehensible Sounds</option>
                <option value="1">1 - None / Mute</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Motor Response (1-6)</label>
              <select id="gcs-motor" onchange="calculateErGcs()" ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2">
                <option value="6" selected>6 - Obeys Commands</option>
                <option value="5">5 - Localizes Pain</option>
                <option value="4">4 - Normal Flexion (Withdrawal)</option>
                <option value="3">3 - Abnormal Flexion (Decorticate)</option>
                <option value="2">2 - Extension (Decerebrate)</option>
                <option value="1">1 - None / Flaccid</option>
              </select>
            </div>
          </div>
          <input type="hidden" id="stage1-gcs" value="${gcs}">
        </div>

        <!-- Baseline Triage Vitals Card -->
        <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <h5 class="font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
            <span class="flex items-center gap-2"><i data-lucide="activity" class="w-4 h-4 text-emerald-600"></i> Baseline Triage Vital Signs</span>
            <span class="text-[11px] text-slate-500 font-mono">Measured by Triage RN</span>
          </h5>

          <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">BP (mmHg)</label>
              <input type="text" id="stage1-bp" value="${enc.BloodPressure || '120/80'}" ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2 font-mono">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Heart Rate (bpm)</label>
              <input type="number" id="stage1-hr" value="${enc.HeartRate || 80}" ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2 font-mono">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">SpO2 (%)</label>
              <input type="number" id="stage1-spo2" value="${enc.SpO2 || 98}" ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2 font-mono">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Temp (°C)</label>
              <input type="text" id="stage1-temp" value="${enc.Temperature || '37.0'}" ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2 font-mono">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Resp Rate (/min)</label>
              <input type="number" id="stage1-rr" value="${enc.RespiratoryRate || 18}" ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2 font-mono">
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Triage Nursing Notes & Initial Allergies</label>
            <input type="text" id="stage1-notes" value="${enc.Notes || ''}" placeholder="e.g. NKDA; Severe trauma alert; IV 18G left antecubital placed" ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2">
          </div>
        </div>

        <!-- Action Footer -->
        <div class="flex items-center justify-between pt-2">
          <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded text-slate-600 font-semibold hover:bg-slate-100">Close</button>
          ${!isFinalized ? `
            <button type="submit" class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition">
              <span>Save & Proceed to Primary Survey (ABCDE)</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
          ` : `
            <button type="button" onclick="openEmergencyWorkflow('${enc.EncounterID}', 'PrimarySurvey')" class="px-4 py-2 bg-slate-800 text-white rounded font-semibold flex items-center gap-1.5">
              <span>View Primary Survey</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
          `}
        </div>
      </form>
    </div>
  `;
}

function handleUpdateEmergencyTriage(e, encounterId) {
  e.preventDefault();
  const esi = parseInt(document.getElementById('stage1-esi').value);
  const arrival = document.getElementById('stage1-arrival').value;
  const complaint = document.getElementById('stage1-complaint').value;
  const gcs = parseInt(document.getElementById('stage1-gcs').value) || 15;
  const bp = document.getElementById('stage1-bp').value;
  const hr = parseInt(document.getElementById('stage1-hr').value) || 80;
  const spo2 = parseInt(document.getElementById('stage1-spo2').value) || 98;
  const temp = document.getElementById('stage1-temp').value || '37.0';
  const rr = parseInt(document.getElementById('stage1-rr').value) || 18;
  const notes = document.getElementById('stage1-notes').value;

  DAL.update('EmergencyEncounters', encounterId, {
    EsiLevel: esi,
    ArrivalMode: arrival,
    ChiefComplaint: complaint,
    GlasgowComaScale: gcs,
    BloodPressure: bp,
    HeartRate: hr,
    SpO2: spo2,
    Temperature: temp,
    RespiratoryRate: rr,
    Notes: notes,
    EmergencyStage: 'PrimarySurvey'
  });

  showToast('Stage 1 Triage saved! Advanced to Primary Survey (ABCDE).', 'success');
  openEmergencyWorkflow(encounterId, 'PrimarySurvey');
}

function renderEmergencyStage2_PrimarySurvey(enc, pat, doc, bay) {
  const isFinalized = enc.Status === 'Discharged' || enc.Status === 'Transferred';

  return `
    <div class="space-y-4 max-w-4xl mx-auto text-xs">
      <!-- Stage Banner -->
      <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-amber-950">
        <div class="flex items-center gap-2">
          <i data-lucide="clipboard-check" class="w-5 h-5 text-amber-600"></i>
          <div>
            <h4 class="font-bold text-sm">Stage 2: Primary Survey (ATLS ABCDE Protocol)</h4>
            <p class="text-[11px] text-amber-800">Perform systematic trauma resuscitation: Airway, Breathing, Circulation, Disability, and Exposure assessment.</p>
          </div>
        </div>
        <span class="px-2.5 py-1 bg-amber-200 text-amber-900 rounded font-semibold text-[11px]">Resuscitation Protocol</span>
      </div>

      <form onsubmit="handleUpdateEmergencyPrimarySurvey(event, '${enc.EncounterID}')" class="space-y-4">
        <!-- ABCDE Protocol Grid -->
        <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <h5 class="font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
            <span class="flex items-center gap-2"><i data-lucide="shield-alert" class="w-4 h-4 text-amber-600"></i> ABCDE Checklist & Resuscitation Interventions</span>
            <span class="text-xs text-slate-500 font-mono">Current GCS: ${enc.GlasgowComaScale || 15}/15</span>
          </h5>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Airway & C-Spine -->
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div class="font-bold text-slate-900 flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">A</span>
                <span>Airway & Cervical Spine Protection</span>
              </div>
              <div>
                <select id="survey-airway" ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-1.5 font-medium">
                  <option value="Patent & Clear">Patent & Clear (Speaking normally)</option>
                  <option value="Compromised - Suctioned">Compromised - Secretions Suctioned</option>
                  <option value="Intubated - ETT Secured">Intubated - Endotracheal Tube Secured</option>
                  <option value="C-Collar Immobilized">C-Collar Applied & Maintained</option>
                </select>
              </div>
            </div>

            <!-- Breathing & Ventilation -->
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div class="font-bold text-slate-900 flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">B</span>
                <span>Breathing & Adequate Ventilation</span>
              </div>
              <div>
                <select id="survey-breathing" ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-1.5 font-medium">
                  <option value="Bilateral Breath Sounds Equal">Bilateral Breath Sounds Equal (No wheeze)</option>
                  <option value="Supplemental O2 High Flow">Supplemental O2 (High-Flow NRB Mask)</option>
                  <option value="Tension Pneumothorax Excluded">Tension Pneumothorax Excluded (Trachea midline)</option>
                  <option value="Mechanical Ventilation Initiated">Mechanical Ventilation Initiated</option>
                </select>
              </div>
            </div>

            <!-- Circulation & Hemorrhage Control -->
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div class="font-bold text-slate-900 flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">C</span>
                <span>Circulation & Hemorrhage Control</span>
              </div>
              <div>
                <select id="survey-circ" ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-1.5 font-medium">
                  <option value="Pulses Strong & Regular">Pulses Strong & Regular (CRT &lt; 2s)</option>
                  <option value="Two Large-Bore IVs Established">Two Large-Bore 18G IVs Established</option>
                  <option value="Direct Pressure Hemorrhage Controlled">External Bleeding Controlled with Pressure</option>
                  <option value="IV Fluid Resuscitation Bolus">Active IV Fluid Resuscitation (Normal Saline)</option>
                </select>
              </div>
            </div>

            <!-- Disability & Exposure -->
            <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div class="font-bold text-slate-900 flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">D/E</span>
                <span>Disability (Neuro) & Exposure / Hypothermia</span>
              </div>
              <div>
                <select id="survey-disability" ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-1.5 font-medium">
                  <option value="Pupils Equal & Reactive (PERRL)">Pupils Equal & Reactive to Light (PERRL)</option>
                  <option value="Fingerstick Glucose Normal">Point-of-Care Blood Glucose Normal (105 mg/dL)</option>
                  <option value="Bair Hugger Warm Blanket Applied">Full Exposure Inspected & Bair Hugger Applied</option>
                  <option value="Spine Cleared Log-Roll Negative">Log-Roll Completed & Spine Non-Tender</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Primary Survey Findings & Clinical Narrative *</label>
            <textarea id="survey-findings" rows="3" required ${isFinalized ? 'disabled' : ''} placeholder="e.g. Airway intact, breath sounds clear bilaterally. Radial pulses palpable. Abdomen soft, FAST exam negative for free fluid. Pupils 3mm brisk bilaterally. No signs of open fractures..." class="w-full border border-slate-300 rounded p-2">${enc.PrimarySurveyABCDE && enc.PrimarySurveyABCDE !== 'Pending Primary Survey' ? enc.PrimarySurveyABCDE : 'Airway patent. Bilateral breath sounds present and symmetrical. Peripheral pulses palpable, warm peripheries. Pupils equal and reactive. Full body examined, warmed with thermal blankets.'}</textarea>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Immediate Resuscitation Interventions Administered</label>
            <input type="text" id="survey-interventions" value="${enc.Interventions || 'IV access 18G placed, cardiac telemetry connected, 1L Normal Saline bolus started'}" ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2">
          </div>
        </div>

        <!-- Action Footer -->
        <div class="flex items-center justify-between pt-2">
          <button type="button" onclick="openEmergencyWorkflow('${enc.EncounterID}', 'Triage')" class="px-4 py-2 border rounded text-slate-600 font-semibold hover:bg-slate-100 flex items-center gap-1.5">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Triage
          </button>
          ${!isFinalized ? `
            <button type="submit" class="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition">
              <span>Save & Proceed to STAT Orders & Labs</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
          ` : `
            <button type="button" onclick="openEmergencyWorkflow('${enc.EncounterID}', 'StatOrders')" class="px-4 py-2 bg-slate-800 text-white rounded font-semibold flex items-center gap-1.5">
              <span>View STAT Orders</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
          `}
        </div>
      </form>
    </div>
  `;
}

function handleUpdateEmergencyPrimarySurvey(e, encounterId) {
  e.preventDefault();
  const findings = document.getElementById('survey-findings').value;
  const interventions = document.getElementById('survey-interventions').value;

  DAL.update('EmergencyEncounters', encounterId, {
    PrimarySurveyABCDE: findings,
    Interventions: interventions,
    EmergencyStage: 'StatOrders'
  });

  showToast('Stage 2 Primary Survey completed! Proceeding to STAT Orders.', 'success');
  openEmergencyWorkflow(encounterId, 'StatOrders');
}

function renderEmergencyStage3_StatOrders(enc, pat, doc, bay) {
  const isFinalized = enc.Status === 'Discharged' || enc.Status === 'Transferred';
  const ordersList = (enc.StatOrders || '').split(',').map(s => s.trim()).filter(Boolean);

  return `
    <div class="space-y-4 max-w-4xl mx-auto text-xs">
      <!-- Stage Banner -->
      <div class="p-3.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-blue-950">
        <div class="flex items-center gap-2">
          <i data-lucide="flask-conical" class="w-5 h-5 text-blue-600"></i>
          <div>
            <h4 class="font-bold text-sm">Stage 3: Rapid STAT Diagnostic Orders & Imaging</h4>
            <p class="text-[11px] text-blue-800">Order urgent trauma labs, point-of-care ultrasound (FAST), CT scans, and 12-lead ECG with real-time results.</p>
          </div>
        </div>
        <span class="px-2.5 py-1 bg-blue-200 text-blue-900 rounded font-semibold text-[11px]">Priority: STAT (Immediate)</span>
      </div>

      <!-- Quick STAT Order Creator -->
      ${!isFinalized ? `
        <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
          <h5 class="font-bold text-slate-800 flex items-center justify-between">
            <span class="flex items-center gap-2"><i data-lucide="plus-circle" class="w-4 h-4 text-blue-600"></i> Add STAT Emergency Order</span>
            <span class="text-[10px] text-slate-400">Instant ER Diagnostic Processing</span>
          </h5>
          <form onsubmit="handleCreateErStatOrder(event, '${enc.EncounterID}')" class="flex flex-col sm:flex-row gap-2">
            <select id="stat-order-name" required class="flex-1 border border-slate-300 rounded p-2 font-medium">
              <option value="Bedside FAST Ultrasound (Trauma Protocol)">Bedside FAST Ultrasound (Trauma Protocol)</option>
              <option value="STAT 12-Lead ECG">STAT 12-Lead Electrocardiogram (ECG)</option>
              <option value="Cardiac Biomarkers (High-Sensitivity Troponin I, CK-MB)">Cardiac Biomarkers (High-Sensitivity Troponin I, CK-MB)</option>
              <option value="Trauma Panel (Type & Screen, CBC, Coagulation PT/INR, Lactate)">Trauma Panel (Type & Screen, CBC, PT/INR, Lactate)</option>
              <option value="Arterial Blood Gas (ABG) & Electrolytes">Arterial Blood Gas (ABG) & Electrolytes</option>
              <option value="CT Trauma Scan (Head, Cervical Spine, Chest, Abdomen)">CT Trauma Scan (Head, C-Spine, Chest, Abdomen)</option>
              <option value="STAT Chest & Pelvis X-Ray">STAT Chest & Pelvis Portable X-Ray</option>
            </select>
            <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded flex items-center gap-1 shadow-2xs whitespace-nowrap">
              <i data-lucide="send" class="w-3.5 h-3.5"></i> Order STAT Test
            </button>
          </form>
        </div>
      ` : ''}

      <!-- Current STAT Orders Table -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div class="p-3 bg-slate-50 border-b flex items-center justify-between">
          <span class="font-bold text-slate-800 flex items-center gap-2">
            <i data-lucide="activity" class="w-4 h-4 text-rose-600"></i> Active STAT Orders & Diagnostic Findings
          </span>
          <span class="text-[11px] font-mono text-slate-500">${ordersList.length} Order(s) Logged</span>
        </div>

        <div class="divide-y divide-slate-100 p-2">
          ${ordersList.length > 0 ? ordersList.map((ord, idx) => {
            const isCompleted = ord.includes('[COMPLETED]') || ord.includes('Done');
            const cleanName = ord.replace('[COMPLETED]', '').replace('[PENDING]', '').trim();

            return `
              <div class="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition rounded">
                <div class="space-y-1">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-slate-900">${cleanName}</span>
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${isCompleted ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'}">
                      ${isCompleted ? 'Completed & Verified' : 'In Progress (STAT)'}
                    </span>
                  </div>
                  <div class="text-[11px] text-slate-600">
                    ${isCompleted ? `Verified diagnostic findings recorded in patient encounter record.` : `Specimen drawn & being processed in ER Satellite Lab.`}
                  </div>
                </div>

                <div>
                  ${!isCompleted && !isFinalized ? `
                    <button onclick="handleSimulateErStatLabResult('${enc.EncounterID}', '${cleanName}')" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold shadow-2xs flex items-center gap-1 transition">
                      <i data-lucide="check" class="w-3.5 h-3.5"></i> Simulate Instant Result
                    </button>
                  ` : `
                    <span class="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 font-mono">
                      <i data-lucide="check-circle-2" class="w-3.5 h-3.5"></i> Reported
                    </span>
                  `}
                </div>
              </div>
            `;
          }).join('') : `
            <div class="p-6 text-center text-slate-400">
              <i data-lucide="flask-conical" class="w-8 h-8 mx-auto mb-2 text-slate-300"></i>
              <div>No STAT orders placed yet for this encounter.</div>
            </div>
          `}
        </div>
      </div>

      <!-- Action Footer -->
      <div class="flex items-center justify-between pt-2">
        <button type="button" onclick="openEmergencyWorkflow('${enc.EncounterID}', 'PrimarySurvey')" class="px-4 py-2 border rounded text-slate-600 font-semibold hover:bg-slate-100 flex items-center gap-1.5">
          <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Primary Survey
        </button>
        ${!isFinalized ? `
          <button type="button" onclick="openEmergencyWorkflow('${enc.EncounterID}', 'Stabilization')" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition">
            <span>Proceed to Stabilization & Monitoring</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        ` : `
          <button type="button" onclick="openEmergencyWorkflow('${enc.EncounterID}', 'Stabilization')" class="px-4 py-2 bg-slate-800 text-white rounded font-semibold flex items-center gap-1.5">
            <span>View Stabilization</span>
            <i data-lucide="arrow-right" class="w-4 h-4"></i>
          </button>
        `}
      </div>
    </div>
  `;
}

function handleCreateErStatOrder(e, encounterId) {
  e.preventDefault();
  const testName = document.getElementById('stat-order-name').value;
  const enc = DAL.findById('EmergencyEncounters', encounterId);
  if (!enc) return;

  const currentOrders = enc.StatOrders ? enc.StatOrders.split(',').map(s => s.trim()).filter(Boolean) : [];
  currentOrders.push(`${testName} [PENDING]`);

  DAL.update('EmergencyEncounters', encounterId, {
    StatOrders: currentOrders.join(', ')
  });

  showToast(`STAT Order "${testName}" submitted to ER Laboratory!`, 'success');
  openEmergencyWorkflow(encounterId, 'StatOrders');
}

function handleSimulateErStatLabResult(encounterId, testName) {
  const enc = DAL.findById('EmergencyEncounters', encounterId);
  if (!enc) return;

  const currentOrders = enc.StatOrders ? enc.StatOrders.split(',').map(s => s.trim()).filter(Boolean) : [];
  const updatedOrders = currentOrders.map(o => {
    if (o.includes(testName)) {
      return `${testName} [COMPLETED]`;
    }
    return o;
  });

  DAL.update('EmergencyEncounters', encounterId, {
    StatOrders: updatedOrders.join(', ')
  });

  showToast(`Instant Result reported for "${testName}": Normal Sinus / Free of acute pathology!`, 'success');
  openEmergencyWorkflow(encounterId, 'StatOrders');
}

function renderEmergencyStage4_Stabilization(enc, pat, doc, bay) {
  const isFinalized = enc.Status === 'Discharged' || enc.Status === 'Transferred';

  return `
    <div class="space-y-4 max-w-4xl mx-auto text-xs">
      <!-- Stage Banner -->
      <div class="p-3.5 bg-purple-50 border border-purple-200 rounded-lg flex items-center justify-between text-purple-950">
        <div class="flex items-center gap-2">
          <i data-lucide="activity" class="w-5 h-5 text-purple-600"></i>
          <div>
            <h4 class="font-bold text-sm">Stage 4: Patient Stabilization & Telemetry Monitoring</h4>
            <p class="text-[11px] text-purple-800">Track serial vital signs, cardiac rhythm telemetry, and coordinate urgent specialist consults.</p>
          </div>
        </div>
        <span class="px-2.5 py-1 bg-purple-200 text-purple-900 rounded font-semibold text-[11px]">Observation Phase</span>
      </div>

      <form onsubmit="handleUpdateEmergencyStabilization(event, '${enc.EncounterID}')" class="space-y-4">
        <!-- Telemetry & Cardiac Rhythm Card -->
        <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <h5 class="font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
            <span class="flex items-center gap-2"><i data-lucide="heart" class="w-4 h-4 text-rose-600"></i> Cardiac Monitor & Telemetry Status</span>
            <span class="text-[11px] text-emerald-700 font-mono font-bold flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Telemetry Active
            </span>
          </h5>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Cardiac Rhythm Strip *</label>
              <select id="stage4-rhythm" ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2 font-medium">
                <option value="Normal Sinus Rhythm (NSR)" selected>Normal Sinus Rhythm (NSR 78 bpm)</option>
                <option value="Sinus Tachycardia">Sinus Tachycardia (112 bpm)</option>
                <option value="Atrial Fibrillation with RVR">Atrial Fibrillation with Rapid Ventricular Response</option>
                <option value="ST-Segment Elevation (STEMI Alert)">ST-Segment Elevation (STEMI Alert)</option>
                <option value="Premature Ventricular Contractions (PVCs)">Frequent PVCs / Ectopy</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Urgent Specialist Consult Requested</label>
              <select id="stage4-consult" ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2 font-medium">
                <option value="None / Managed by ER MD">None / Managed by Emergency MD</option>
                <option value="On-Call Cardiologist (Cath Lab Alert)">On-Call Cardiologist (Cath Lab Alert)</option>
                <option value="Trauma General Surgeon">Trauma General Surgeon</option>
                <option value="Orthopedic Surgeon on-call">Orthopedic Surgeon on-call</option>
                <option value="Neurology / Stroke Team">Neurology / Stroke Team</option>
                <option value="ICU Intensivist Bed Consult">ICU Intensivist Bed Consult</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Clinical Response to Resuscitation & Serial Re-evaluation *</label>
            <textarea id="stage4-notes" rows="3" required ${isFinalized ? 'disabled' : ''} placeholder="e.g. Patient pain decreased from 9/10 to 3/10 following IV analgesia. Blood pressure stabilized at 128/82. SpO2 maintained at 99% on 2L nasal cannula..." class="w-full border border-slate-300 rounded p-2">Patient has shown clinical stabilization following initial resuscitation. Vitals normalized within safe limits. Pain controlled. Mentation alert and oriented x 4.</textarea>
          </div>
        </div>

        <!-- Serial Vitals Re-check Card -->
        <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <h5 class="font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
            <span class="flex items-center gap-2"><i data-lucide="activity" class="w-4 h-4 text-purple-600"></i> Updated Stabilized Vitals</span>
            <span class="text-[11px] text-slate-500 font-mono">Triage vs Current</span>
          </h5>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Current BP (mmHg)</label>
              <input type="text" id="stage4-bp" value="${enc.BloodPressure || '120/80'}" ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2 font-mono">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Current Heart Rate (bpm)</label>
              <input type="number" id="stage4-hr" value="${enc.HeartRate || 75}" ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2 font-mono">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Current SpO2 (%)</label>
              <input type="number" id="stage4-spo2" value="${enc.SpO2 || 99}" ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2 font-mono">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Current GCS Score</label>
              <input type="number" id="stage4-gcs" min="3" max="15" value="${enc.GlasgowComaScale || 15}" ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2 font-mono">
            </div>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="flex items-center justify-between pt-2">
          <button type="button" onclick="openEmergencyWorkflow('${enc.EncounterID}', 'StatOrders')" class="px-4 py-2 border rounded text-slate-600 font-semibold hover:bg-slate-100 flex items-center gap-1.5">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to STAT Orders
          </button>
          ${!isFinalized ? `
            <button type="submit" class="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition">
              <span>Save & Proceed to Disposition & Handover</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
          ` : `
            <button type="button" onclick="openEmergencyWorkflow('${enc.EncounterID}', 'Disposition')" class="px-4 py-2 bg-slate-800 text-white rounded font-semibold flex items-center gap-1.5">
              <span>View Disposition</span>
              <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </button>
          `}
        </div>
      </form>
    </div>
  `;
}

function handleUpdateEmergencyStabilization(e, encounterId) {
  e.preventDefault();
  const bp = document.getElementById('stage4-bp').value;
  const hr = parseInt(document.getElementById('stage4-hr').value) || 75;
  const spo2 = parseInt(document.getElementById('stage4-spo2').value) || 99;
  const gcs = parseInt(document.getElementById('stage4-gcs').value) || 15;
  const notes = document.getElementById('stage4-notes').value;

  DAL.update('EmergencyEncounters', encounterId, {
    BloodPressure: bp,
    HeartRate: hr,
    SpO2: spo2,
    GlasgowComaScale: gcs,
    Notes: notes,
    EmergencyStage: 'Disposition'
  });

  showToast('Patient stabilization verified! Proceeding to Final Disposition.', 'success');
  openEmergencyWorkflow(encounterId, 'Disposition');
}

function renderEmergencyStage5_Disposition(enc, pat, doc, bay) {
  const isFinalized = enc.Status === 'Discharged' || enc.Status === 'Transferred';
  const isTransferred = enc.Status === 'Transferred';

  // Cost breakdown
  const bayRate = parseFloat(bay.HourlyRate || 250);
  const triageFee = 150;
  const statFee = 180;
  const medFee = 85;
  const totalCost = bayRate + triageFee + statFee + medFee;

  return `
    <div class="space-y-4 max-w-4xl mx-auto text-xs">
      <!-- Stage Banner -->
      <div class="p-3.5 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between text-teal-950">
        <div class="flex items-center gap-2">
          <i data-lucide="arrow-right-left" class="w-5 h-5 text-teal-600"></i>
          <div>
            <h4 class="font-bold text-sm">Stage 5: Final Disposition, Clinical Handover & Billing</h4>
            <p class="text-[11px] text-teal-800">Select clinical disposition: Direct Inpatient Admission (IPD), ICU Transfer, or Home Discharge with itemized ER billing.</p>
          </div>
        </div>
        <span class="px-2.5 py-1 bg-teal-200 text-teal-900 rounded font-semibold text-[11px]">${enc.Status}</span>
      </div>

      <!-- Direct Transfer to IPD Highlight Banner -->
      <div class="p-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-lg shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <i data-lucide="building-2" class="w-5 h-5 text-blue-300"></i>
            <h5 class="font-bold text-sm">Direct Admission to Inpatient Department (IPD)</h5>
          </div>
          <p class="text-[11px] text-blue-200 leading-relaxed">
            Patient requires continuing inpatient hospitalization. Click below to seamlessly bridge patient data into the IPD Inpatient Admission workflow.
          </p>
        </div>
        ${!isTransferred && !isFinalized ? `
          <button type="button" onclick="transferErToIpd('${enc.EncounterID}')" class="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 transition whitespace-nowrap">
            <i data-lucide="arrow-right-circle" class="w-4 h-4"></i> Direct Admit to IPD
          </button>
        ` : (isTransferred ? `
          <div class="px-3 py-1.5 bg-blue-800/80 rounded border border-blue-400 text-blue-200 font-bold flex items-center gap-1.5">
            <i data-lucide="check" class="w-4 h-4 text-emerald-400"></i> Admitted to Inpatient (IPD)
          </div>
        ` : '')}
      </div>

      <form onsubmit="handleFinalizeEmergencyDischarge(event, '${enc.EncounterID}')" class="space-y-4">
        <!-- Disposition & Diagnosis Card -->
        <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <h5 class="font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
            <span class="flex items-center gap-2"><i data-lucide="clipboard" class="w-4 h-4 text-teal-600"></i> Emergency Discharge & Primary Diagnosis</span>
            <span class="text-xs text-slate-500 font-mono">ER Attending: ${doc.DoctorName || 'Dr. ER'}</span>
          </h5>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Final ER Disposition *</label>
              <select id="stage5-disposition" required ${isFinalized ? 'disabled' : ''} class="w-full border border-slate-300 rounded p-2 font-medium">
                <option value="Discharged Home (Stable)" ${enc.Disposition === 'Discharged Home (Stable)' ? 'selected' : ''}>Discharged Home (Stable / Prescriptions Provided)</option>
                <option value="Admitted to Inpatient (IPD)" ${enc.Disposition && enc.Disposition.includes('IPD') ? 'selected' : ''}>Admitted to Inpatient Ward (IPD)</option>
                <option value="Admitted to ICU / CCU" ${enc.Disposition === 'Admitted to ICU / CCU' ? 'selected' : ''}>Admitted to Intensive Care Unit (ICU)</option>
                <option value="Transferred to Operating Room (OR)" ${enc.Disposition === 'Transferred to Operating Room (OR)' ? 'selected' : ''}>Transferred to Operating Room (Emergency Surgery)</option>
                <option value="Transferred to Tertiary Center" ${enc.Disposition === 'Transferred to Tertiary Center' ? 'selected' : ''}>Transferred to Level 1 Trauma Center</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Primary Emergency Diagnosis *</label>
              <input type="text" id="stage5-diagnosis" value="${enc.PrimaryDiagnosis || enc.ChiefComplaint || ''}" required ${isFinalized ? 'disabled' : ''} placeholder="e.g. Acute Coronary Syndrome (NSTEMI)" class="w-full border border-slate-300 rounded p-2">
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Discharge Instructions, Medication Advice & Warning Signs</label>
            <textarea id="stage5-instructions" rows="2" ${isFinalized ? 'disabled' : ''} placeholder="e.g. Rest for 48 hours. Take prescribed medications. Return immediately to ER if chest pain recurs, shortness of breath, or syncope..." class="w-full border border-slate-300 rounded p-2">Follow up with primary physician in 3-5 days. Return to Emergency Room immediately if severe symptoms recur.</textarea>
          </div>
        </div>

        <!-- Itemized ER Bill Preview Card -->
        <div class="bg-white p-5 rounded-lg border border-slate-200 shadow-2xs space-y-3">
          <h5 class="font-bold text-slate-800 border-b pb-2 flex items-center justify-between">
            <span class="flex items-center gap-2"><i data-lucide="receipt" class="w-4 h-4 text-emerald-600"></i> Itemized Emergency Department Invoice Preview</span>
            <span class="text-sm font-bold text-emerald-700 font-mono">Total ER Charges: ${totalCost.toFixed(2)}</span>
          </h5>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div class="p-2.5 bg-slate-50 border rounded">
              <span class="text-slate-500 block text-[10px]">ER Triage & MD Care</span>
              <span class="font-bold text-slate-800 font-mono">${triageFee.toFixed(2)}</span>
            </div>
            <div class="p-2.5 bg-slate-50 border rounded">
              <span class="text-slate-500 block text-[10px]">ER Bay Fee (${bay.BayNumber || 'Bay'})</span>
              <span class="font-bold text-slate-800 font-mono">${bayRate.toFixed(2)}</span>
            </div>
            <div class="p-2.5 bg-slate-50 border rounded">
              <span class="text-slate-500 block text-[10px]">STAT Diagnostics & Labs</span>
              <span class="font-bold text-slate-800 font-mono">${statFee.toFixed(2)}</span>
            </div>
            <div class="p-2.5 bg-slate-50 border rounded">
              <span class="text-slate-500 block text-[10px]">Medications & IV Fluids</span>
              <span class="font-bold text-slate-800 font-mono">${medFee.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="flex items-center justify-between pt-2">
          <button type="button" onclick="openEmergencyWorkflow('${enc.EncounterID}', 'Stabilization')" class="px-4 py-2 border rounded text-slate-600 font-semibold hover:bg-slate-100 flex items-center gap-1.5">
            <i data-lucide="arrow-left" class="w-4 h-4"></i> Back to Stabilization
          </button>
          ${!isFinalized ? `
            <button type="submit" class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition">
              <i data-lucide="check-circle-2" class="w-4 h-4"></i>
              <span>Finalize ER Discharge & Release Bay</span>
            </button>
          ` : `
            <button type="button" onclick="closeModal()" class="px-4 py-2 bg-slate-800 text-white rounded font-semibold">
              Done & Close
            </button>
          `}
        </div>
      </form>
    </div>
  `;
}

function handleFinalizeEmergencyDischarge(e, encounterId) {
  e.preventDefault();
  const enc = DAL.findById('EmergencyEncounters', encounterId);
  if (!enc) return;
  const pat = DAL.findById('Patients', enc.PatientID) || {};
  const bay = DAL.findById('EmergencyBays', enc.BayID) || {};

  const disposition = document.getElementById('stage5-disposition') ? document.getElementById('stage5-disposition').value : 'Discharged Home (Stable)';
  const diagnosis = document.getElementById('stage5-diagnosis') ? document.getElementById('stage5-diagnosis').value : enc.PrimaryDiagnosis;
  const instructions = document.getElementById('stage5-instructions') ? document.getElementById('stage5-instructions').value : '';

  const bayFee = parseFloat(bay.HourlyRate || 250);
  const triageFee = 150;
  const medFee = 85;
  const statFee = 180;
  const totalErBill = bayFee + triageFee + medFee + statFee;

  DAL.update('EmergencyEncounters', encounterId, {
    EmergencyStage: 'Completed',
    Status: 'Discharged',
    Disposition: disposition,
    PrimaryDiagnosis: diagnosis,
    Notes: (enc.Notes ? enc.Notes + '\n' : '') + `Discharge Instructions: ${instructions}`,
    DispositionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    EstimatedCost: totalErBill
  });

  if (enc.BayID) {
    DAL.update('EmergencyBays', enc.BayID, {
      Status: 'Cleaning',
      CurrentEncounterID: null
    });
  }

  const invoices = DAL.find('Invoices') || [];
  const invNumber = `INV-2026-ER${String(invoices.length + 1).padStart(4, '0')}`;
  DAL.create('Invoices', {
    InvoiceNumber: invNumber,
    PatientID: enc.PatientID,
    VisitID: encounterId,
    InvoiceDate: new Date().toISOString().split('T')[0],
    DueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    TotalAmount: totalErBill,
    AmountPaid: 0,
    Balance: totalErBill,
    PaymentStatus: 'Unpaid'
  });

  closeModal();
  showToast(`ER Encounter ${enc.EncounterNumber} completed! Bay ${bay.BayNumber || ''} released for sanitation. Generated Invoice ${invNumber} for ${totalErBill.toFixed(2)}.`, 'success');
  renderMainView();
}

function transferErToIpd(encounterId) {
  const enc = DAL.findById('EmergencyEncounters', encounterId);
  if (!enc) return;
  const pat = DAL.findById('Patients', enc.PatientID) || {};

  DAL.update('EmergencyEncounters', encounterId, {
    EmergencyStage: 'Disposition',
    Status: 'Transferred',
    Disposition: 'Admitted to Inpatient (IPD)',
    DispositionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  if (enc.BayID) {
    DAL.update('EmergencyBays', enc.BayID, {
      Status: 'Cleaning',
      CurrentEncounterID: null
    });
  }

  closeModal();
  showToast(`Emergency patient ${pat.FirstName} ${pat.LastName} transferred to Inpatient Department! Initiating IPD Admission...`, 'success');
  
  openNewAdmissionModal(enc.PatientID, enc.DoctorID, enc.EncounterID, enc.PrimaryDiagnosis || enc.ChiefComplaint);
}


// ==========================================
// 17. OPERATION THEATER (OT / OR) & CSSD STERILE PROCESSING MODULE
// ==========================================

function renderSurgeriesGrid() {
  const allSurgeries = DAL.find('Surgeries') || [];
  const allTheaters = DAL.find('OperationTheaters') || [];
  const allTrays = DAL.find('SterileTrays') || [];

  const inSurgery = allSurgeries.filter(s => s.Status === 'In Surgery').length;
  const preOp = allSurgeries.filter(s => s.Status === 'Pre-Op Ready' || s.Status === 'Scheduled').length;
  const inPacu = allSurgeries.filter(s => s.Status === 'PACU Recovery').length;
  const completed = allSurgeries.filter(s => s.Status === 'Completed').length;
  const emergencyStat = allSurgeries.filter(s => s.Category === 'Emergency STAT').length;

  if (!window._surgeryStatusFilter) window._surgeryStatusFilter = 'ALL';
  if (!window._surgeryTheaterFilter) window._surgeryTheaterFilter = 'ALL';

  let filtered = allSurgeries;
  if (window._surgeryStatusFilter !== 'ALL') {
    filtered = filtered.filter(s => s.Status === window._surgeryStatusFilter);
  }
  if (window._surgeryTheaterFilter !== 'ALL') {
    filtered = filtered.filter(s => s.TheaterID === window._surgeryTheaterFilter);
  }

  filtered = filterAndSortRecords(filtered, ['SurgeryNumber', 'ProcedureName', 'LeadSurgeonName', 'Anesthesiologist', 'PreOpDiagnosis', 'ICD10Code']);

  return `
    <div class="space-y-4">
      <!-- OT KPI Summary Bar -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <div class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Active OR Suites</div>
          <div class="text-xl font-bold text-[#002050] mt-0.5">${allTheaters.length} Suites</div>
          <div class="text-[10px] text-emerald-600 font-medium">${allTheaters.filter(t => t.Status === 'Available').length} Available</div>
        </div>

        <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <div class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">In Surgery</div>
          <div class="text-xl font-bold text-rose-600 mt-0.5 flex items-center gap-1.5">
            <span>${inSurgery}</span>
            ${inSurgery > 0 ? '<span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>' : ''}
          </div>
          <div class="text-[10px] text-slate-400">Under Active Operative Care</div>
        </div>

        <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <div class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Pre-Op & Booked</div>
          <div class="text-xl font-bold text-indigo-700 mt-0.5">${preOp}</div>
          <div class="text-[10px] text-slate-400">Ready for Theater Entry</div>
        </div>

        <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <div class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">PACU Recovery</div>
          <div class="text-xl font-bold text-amber-600 mt-0.5">${inPacu}</div>
          <div class="text-[10px] text-slate-400">Post-Anesthesia Monitoring</div>
        </div>

        <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <div class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Completed Today</div>
          <div class="text-xl font-bold text-emerald-700 mt-0.5">${completed}</div>
          <div class="text-[10px] text-slate-400">Procedures Done</div>
        </div>

        <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <div class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Emergency STAT</div>
          <div class="text-xl font-bold text-rose-700 mt-0.5">${emergencyStat}</div>
          <div class="text-[10px] text-slate-400">High-Acuity Priority</div>
        </div>
      </div>

      <!-- Live Operating Theater Suites Board -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-2xs p-3.5">
        <div class="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <div class="flex items-center gap-2">
            <i data-lucide="layout-grid" class="w-4 h-4 text-rose-600"></i>
            <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Live Operating Theater (OR) Suites Status</h3>
          </div>
          <span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono font-medium">Real-Time Theater Occupancy & Airflow Telemetry</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          ${allTheaters.map(t => {
            const statusConfig = {
              'In Surgery': { badge: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse', icon: 'scissors', label: 'In Surgery' },
              'Available': { badge: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: 'check-circle-2', label: 'Available / Ready' },
              'Turnover / Sanitizing': { badge: 'bg-amber-100 text-amber-800 border-amber-300', icon: 'sparkles', label: 'Turnover / Sanitizing' },
              'Maintenance': { badge: 'bg-slate-100 text-slate-700 border-slate-300', icon: 'wrench', label: 'Maintenance' }
            }[t.Status] || { badge: 'bg-slate-100 text-slate-700 border-slate-200', icon: 'help-circle', label: t.Status };

            const activeSurg = allSurgeries.find(s => s.SurgeryID === t.CurrentSurgeryID || (s.TheaterID === t.TheaterID && s.Status === 'In Surgery'));
            const surgPat = activeSurg ? (DAL.findById('Patients', activeSurg.PatientID) || {}) : null;

            return `
              <div class="border rounded-lg p-3 ${t.Status === 'In Surgery' ? 'bg-rose-50/50 border-rose-200 shadow-xs' : 'bg-slate-50/60 border-slate-200'} flex flex-col justify-between space-y-2.5 transition">
                <div class="flex items-start justify-between gap-1">
                  <div>
                    <h4 class="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full ${t.Status === 'In Surgery' ? 'bg-rose-500 animate-ping' : (t.Status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500')}"></span>
                      ${t.TheaterNumber}: ${t.Name.split('(')[0].trim()}
                    </h4>
                    <div class="text-[10px] text-slate-500 mt-0.5">${t.RoomType}</div>
                  </div>
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold border ${statusConfig.badge} whitespace-nowrap">
                    ${statusConfig.label}
                  </span>
                </div>

                ${activeSurg ? `
                  <div class="p-2 bg-white rounded border border-rose-200 text-[11px] space-y-1 shadow-2xs">
                    <div class="flex items-center justify-between text-[10px] text-rose-700 font-semibold">
                      <span>Procedure in Progress:</span>
                      <span class="font-mono bg-rose-100 px-1 py-0.2 rounded">${activeSurg.StartTime}</span>
                    </div>
                    <div class="font-bold text-slate-900 truncate" title="${activeSurg.ProcedureName}">${activeSurg.ProcedureName}</div>
                    <div class="text-[10px] text-slate-600 flex items-center justify-between">
                      <span>Patient: <b>${surgPat ? `${surgPat.FirstName} ${surgPat.LastName}` : 'Patient'}</b></span>
                      <span class="text-rose-600 font-medium">${activeSurg.Category}</span>
                    </div>
                    <div class="text-[10px] text-slate-500 flex items-center justify-between">
                      <span>Surgeon: <b>${activeSurg.LeadSurgeonName.split(',')[0]}</b></span>
                      <span>Anesth: <b>${activeSurg.AnesthesiaType.split('(')[0].trim()}</b></span>
                    </div>
                  </div>
                ` : `
                  <div class="p-2 bg-white/70 rounded border border-slate-200 text-[11px] text-slate-500 min-h-[64px] flex flex-col justify-center">
                    <p class="text-[10px] text-slate-400 flex items-center gap-1"><i data-lucide="check" class="w-3 h-3 text-emerald-600"></i> Lead Nurse: ${t.LeadNurse}</p>
                    <p class="text-[10px] text-slate-400 truncate mt-0.5" title="${t.EquipmentList}">Equip: ${t.EquipmentList.substring(0, 40)}...</p>
                  </div>
                `}

                <div class="pt-2 border-t border-slate-200 flex items-center justify-between gap-1">
                  ${activeSurg ? `
                    <button onclick="openSurgeryWorkflow('${activeSurg.SurgeryID}', 'IntraOp')" class="w-full py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-semibold flex items-center justify-center gap-1 shadow-2xs transition">
                      <i data-lucide="activity" class="w-3 h-3"></i> Monitor Intra-Op
                    </button>
                  ` : `
                    <button onclick="openSurgeryBookingModal('', '', '${t.TheaterID}')" class="flex-1 py-1 bg-white hover:bg-blue-50 border border-slate-300 text-blue-700 rounded text-[10px] font-semibold transition">
                      Book Suite
                    </button>
                    <button onclick="handleUpdateTheaterStatus('${t.TheaterID}', '${t.Status === 'Available' ? 'Turnover / Sanitizing' : 'Available'}')" class="py-1 px-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-600 rounded text-[10px] font-medium transition" title="Toggle Clean / Turnover">
                      ${t.Status === 'Available' ? 'Sanitize' : 'Set Ready'}
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- Main Surgeries Schedule Table Container -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-270px)]">
        <!-- Table Toolbar -->
        <div class="p-3 bg-[#f8f9fa] border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div class="flex items-center gap-2 flex-wrap">
            <i data-lucide="scissors" class="w-4 h-4 text-rose-600"></i>
            <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Surgery Schedule & OR Master Register</span>
            <span class="text-[11px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">${filtered.length} surgeries</span>
            
            <div class="h-4 w-[1px] bg-slate-300 mx-1 hidden sm:block"></div>

            <!-- Status Filter Pills -->
            <div class="flex items-center gap-1">
              ${['ALL', 'In Surgery', 'Pre-Op Ready', 'Scheduled', 'PACU Recovery', 'Completed'].map(st => `
                <button onclick="window._surgeryStatusFilter = '${st}'; renderMainView();" class="px-2 py-0.5 rounded text-[10px] font-medium transition ${window._surgeryStatusFilter === st ? 'bg-[#002050] text-white font-bold shadow-2xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
                  ${st}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="flex items-center gap-2">
            <select onchange="window._surgeryTheaterFilter = this.value; renderMainView();" class="text-xs border border-slate-300 rounded px-2 py-1 bg-white font-medium text-slate-700">
              <option value="ALL" ${window._surgeryTheaterFilter === 'ALL' ? 'selected' : ''}>All OR Suites</option>
              ${allTheaters.map(t => `<option value="${t.TheaterID}" ${window._surgeryTheaterFilter === t.TheaterID ? 'selected' : ''}>${t.TheaterNumber}</option>`).join('')}
            </select>
            <input type="text" placeholder="Search procedure, surgeon, MRN..." value="${appState.searchTerm}" onkeyup="handleGridSearch(event)" class="text-xs border border-slate-300 rounded px-3 py-1 bg-white outline-none focus:border-blue-500 w-48">
            <button onclick="openSurgeryBookingModal()" class="px-2.5 py-1 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs transition">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>Book Surgery</span>
            </button>
            <button onclick="navigateTo('sterile_processing')" class="px-2.5 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100 rounded text-xs font-semibold flex items-center gap-1 transition" title="Central Sterile Processing">
              <i data-lucide="sparkles" class="w-3.5 h-3.5 text-emerald-600"></i>
              <span>CSSD Trays</span>
            </button>
          </div>
        </div>

        <!-- Table Data -->
        <div class="flex-1 overflow-auto custom-scrollbar">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-300 z-10 select-none">
              <tr>
                <th class="p-2.5">Surgery # / Priority</th>
                <th class="p-2.5">Patient & Admission</th>
                <th class="p-2.5">Date & Time / Suite</th>
                <th class="p-2.5">Procedure & Code</th>
                <th class="p-2.5">Lead Surgeon & Team</th>
                <th class="p-2.5">Anesthesia</th>
                <th class="p-2.5">Materials & CSSD Trays</th>
                <th class="p-2.5">WHO Safety Checklist</th>
                <th class="p-2.5">Stage & Status</th>
                <th class="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              ${filtered.map(s => {
                const pat = DAL.findById('Patients', s.PatientID) || {};
                const theater = DAL.findById('OperationTheaters', s.TheaterID) || {};
                const adm = s.AdmissionID ? (DAL.findById('Admissions', s.AdmissionID) || {}) : null;

                const catBadge = {
                  'Emergency STAT': 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse font-bold',
                  'Urgent': 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
                  'Elective': 'bg-blue-100 text-blue-800 border-blue-200 font-semibold'
                }[s.Category] || 'bg-slate-100 text-slate-700';

                const statusColor = {
                  'In Surgery': 'bg-rose-500 text-white font-bold animate-pulse',
                  'Pre-Op Ready': 'bg-indigo-600 text-white font-semibold',
                  'Scheduled': 'bg-blue-600 text-white font-semibold',
                  'PACU Recovery': 'bg-amber-500 text-white font-bold',
                  'Completed': 'bg-emerald-600 text-white font-semibold',
                  'Cancelled': 'bg-slate-400 text-white'
                }[s.Status] || 'bg-slate-200 text-slate-800';

                const whoChecklist = s.WhoSafetyChecklist || '';
                const signInDone = whoChecklist.includes('Sign In: Completed');
                const timeOutDone = whoChecklist.includes('Time Out: Completed');
                const signOutDone = whoChecklist.includes('Sign Out: Completed');

                return `
                  <tr class="hover:bg-slate-50 transition cursor-pointer" onclick="openSurgeryWorkflow('${s.SurgeryID}')">
                    <td class="p-2.5">
                      <div class="font-mono font-bold text-rose-700">${s.SurgeryNumber}</div>
                      <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] border ${catBadge}">
                        ${s.Category}
                      </span>
                    </td>
                    <td class="p-2.5">
                      <div class="font-semibold text-slate-900">${pat.FirstName || ''} ${pat.LastName || ''}</div>
                      <div class="text-[10px] text-slate-500 font-mono">
                        ${pat.PatientNumber || ''} &bull; ${pat.Gender || ''}, ${pat.Age || ''}y
                        ${adm ? `&bull; <span class="text-blue-700 font-bold">${adm.AdmissionNumber || adm.AdmissionID}</span>` : ''}
                      </div>
                    </td>
                    <td class="p-2.5">
                      <div class="font-semibold text-slate-800 font-mono text-[11px]">${s.ScheduledDate} @ ${s.StartTime}</div>
                      <div class="text-[10px] text-slate-500">
                        <span class="font-bold text-slate-700">${theater.TheaterNumber || s.TheaterID}</span> (${s.DurationMinutes}m)
                      </div>
                    </td>
                    <td class="p-2.5">
                      <div class="font-bold text-slate-900">${s.ProcedureName}</div>
                      <div class="text-[10px] text-slate-500 font-mono">ICD-10-PCS: ${s.ICD10Code || 'N/A'}</div>
                    </td>
                    <td class="p-2.5">
                      <div class="font-semibold text-slate-900 flex items-center gap-1">
                        <i data-lucide="user-check" class="w-3 h-3 text-blue-600"></i> ${s.LeadSurgeonName || s.LeadSurgeonID}
                      </div>
                      <div class="text-[10px] text-slate-500">
                        Asst: ${s.AssistantSurgeon || 'None'} &bull; Scrub: ${s.ScrubNurse || 'RN'}
                      </div>
                    </td>
                    <td class="p-2.5">
                      <div class="font-medium text-slate-800">${s.AnesthesiaType.split('(')[0].trim()}</div>
                      <div class="text-[10px] text-slate-500">${s.Anesthesiologist || 'Anesthesia Team'}</div>
                    </td>
                    <td class="p-2.5 max-w-[200px]" onclick="event.stopPropagation()">
                      <div class="text-[10px] text-slate-700 truncate" title="${s.MaterialsRequired || 'Standard surgical pack'}">
                        <i data-lucide="package" class="w-3 h-3 inline text-amber-600"></i> ${s.MaterialsRequired || 'Standard pack'}
                      </div>
                      <div class="text-[10px] text-emerald-700 truncate font-semibold mt-0.5" title="${s.SterileTraysRequired || 'Sterile set'}">
                        <i data-lucide="shield-check" class="w-3 h-3 inline text-emerald-600"></i> ${s.SterileTraysRequired || 'Standard sterile tray'}
                      </div>
                    </td>
                    <td class="p-2.5" onclick="event.stopPropagation()">
                      <div class="flex items-center gap-1 text-[9px] font-bold">
                        <span class="px-1 py-0.2 rounded border ${signInDone ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-500'}" title="Sign In (Before Induction)">Sign In</span>
                        <span class="px-1 py-0.2 rounded border ${timeOutDone ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-500'}" title="Time Out (Before Incision)">Time Out</span>
                        <span class="px-1 py-0.2 rounded border ${signOutDone ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-500'}" title="Sign Out (Before OR Exit)">Sign Out</span>
                      </div>
                    </td>
                    <td class="p-2.5">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] ${statusColor}">
                        ${s.Status}
                      </span>
                      ${s.AldreteScore > 0 ? `<div class="text-[9px] font-bold text-amber-700 mt-0.5">Aldrete: ${s.AldreteScore}/10</div>` : ''}
                    </td>
                    <td class="p-2.5 text-right space-x-1 whitespace-nowrap" onclick="event.stopPropagation()">
                      <button onclick="openSurgeryWorkflow('${s.SurgeryID}')" class="px-2.5 py-1 bg-gradient-to-r from-rose-700 to-pink-700 hover:from-rose-800 hover:to-pink-800 text-white rounded text-[11px] font-semibold inline-flex items-center gap-1 shadow-2xs transition" title="Launch Dynamics 365 Surgical BPF">
                        <i data-lucide="scissors" class="w-3 h-3"></i> OR Workflow
                      </button>
                      <button onclick="openWhoChecklistModal('${s.SurgeryID}')" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-semibold transition" title="WHO Safety Checklist">
                        WHO
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// STERILE PROCESSING (CSSD) VIEW
// ==========================================

function renderSterileProcessingGrid() {
  const allTrays = DAL.find('SterileTrays') || [];
  const allTheaters = DAL.find('OperationTheaters') || [];
  const readyTrays = allTrays.filter(t => t.Status.includes('Ready') || t.Status.includes('Sterile')).length;
  const inUseTrays = allTrays.filter(t => t.Status.includes('In Use')).length;
  const decontamTrays = allTrays.filter(t => t.Status.includes('Decontamination') || t.Status.includes('Washing')).length;

  if (!window._cssdActiveTab) window._cssdActiveTab = 'trays';

  const consumables = [
    { name: 'Laparoscopic Trocar 10mm & 5mm Kit', category: 'Minimally Invasive', stock: 24, min: 10, unit: 'kits', cost: 65.00 },
    { name: 'Endocatch Tissue Specimen Retrieval Bag', category: 'Minimally Invasive', stock: 32, min: 15, unit: 'units', cost: 28.00 },
    { name: 'Hem-o-lok Polymer Ligating Clips (M/L)', category: 'Hemostasis', stock: 85, min: 30, unit: 'cartridges', cost: 18.50 },
    { name: 'Polypropylene Surgical Mesh (7.5x15cm)', category: 'Implants', stock: 18, min: 8, unit: 'sheets', cost: 120.00 },
    { name: 'Synthes Titanium Distal Femoral LCP Plates', category: 'Orthopedic Implants', stock: 12, min: 5, unit: 'plates', cost: 450.00 },
    { name: 'Vicryl 2-0 Braided Absorbable Suture (Pack of 36)', category: 'Sutures', stock: 45, min: 20, unit: 'boxes', cost: 55.00 },
    { name: 'Prolene 7-0 Microvascular Non-Absorbable Suture', category: 'Cardiovascular', stock: 22, min: 10, unit: 'boxes', cost: 85.00 },
    { name: '0.9% Normal Saline Sterile OR Wash (3000mL)', category: 'Fluids', stock: 60, min: 25, unit: 'bags', cost: 12.00 }
  ];

  return `
    <div class="space-y-4">
      <!-- CSSD KPI Summary Bar -->
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <div class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Instrument Sets</div>
          <div class="text-xl font-bold text-emerald-700 mt-0.5">${allTrays.length} Trays</div>
          <div class="text-[10px] text-slate-400">Tracked in CSSD Registry</div>
        </div>

        <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <div class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Sterile & Ready for OR</div>
          <div class="text-xl font-bold text-emerald-600 mt-0.5 flex items-center gap-1.5">
            <span>${readyTrays}</span>
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div class="text-[10px] text-emerald-700 font-medium">Ready in Sterile OR Core</div>
        </div>

        <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <div class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">In Use in Surgeries</div>
          <div class="text-xl font-bold text-rose-600 mt-0.5">${inUseTrays}</div>
          <div class="text-[10px] text-slate-400">Active Theater Cases</div>
        </div>

        <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <div class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">In Decontamination</div>
          <div class="text-xl font-bold text-amber-600 mt-0.5">${decontamTrays}</div>
          <div class="text-[10px] text-slate-400">Ultrasonic Wash & Prep</div>
        </div>

        <div class="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div class="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Biological Indicator</div>
          <div class="text-xl font-bold text-blue-700 mt-0.5">100% Pass</div>
          <div class="text-[10px] text-emerald-600 font-medium">Geobacillus Tested (0 Fails)</div>
        </div>
      </div>

      <!-- Main CSSD Workspace -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[calc(100vh-235px)]">
        <!-- Tab Bar & Actions -->
        <div class="p-3 bg-[#f8f9fa] border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div class="flex items-center gap-2">
            <i data-lucide="sparkles" class="w-4 h-4 text-emerald-600"></i>
            <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Central Sterile Services Department (CSSD)</span>
            
            <div class="h-4 w-[1px] bg-slate-300 mx-1"></div>

            <div class="flex items-center bg-slate-200/80 p-0.5 rounded text-xs font-semibold">
              <button onclick="window._cssdActiveTab = 'trays'; renderMainView();" class="px-2.5 py-1 rounded transition ${window._cssdActiveTab === 'trays' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}">
                Sterile Instrument Trays (${allTrays.length})
              </button>
              <button onclick="window._cssdActiveTab = 'cycles'; renderMainView();" class="px-2.5 py-1 rounded transition ${window._cssdActiveTab === 'cycles' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}">
                Autoclave Cycles
              </button>
              <button onclick="window._cssdActiveTab = 'consumables'; renderMainView();" class="px-2.5 py-1 rounded transition ${window._cssdActiveTab === 'consumables' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}">
                Surgical Consumables & Implants
              </button>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="openNewSterileTrayModal()" class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs transition">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i>
              <span>New Instrument Set</span>
            </button>
            <button onclick="openRunAutoclaveModal()" class="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-2xs transition">
              <i data-lucide="play" class="w-3.5 h-3.5"></i>
              <span>Run Autoclave Batch</span>
            </button>
            <button onclick="navigateTo('surgeries')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-xs font-semibold flex items-center gap-1 transition">
              <i data-lucide="scissors" class="w-3.5 h-3.5 text-rose-600"></i>
              <span>OT Schedule</span>
            </button>
          </div>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-auto custom-scrollbar p-3">
          ${window._cssdActiveTab === 'trays' ? `
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-300 z-10 select-none">
                <tr>
                  <th class="p-2.5">Tray ID & Number</th>
                  <th class="p-2.5">Instrument Set Name</th>
                  <th class="p-2.5">Department</th>
                  <th class="p-2.5">Instruments</th>
                  <th class="p-2.5">Sterilization Method</th>
                  <th class="p-2.5">Cycle # & Expiry</th>
                  <th class="p-2.5">Indicator Tests</th>
                  <th class="p-2.5">Status</th>
                  <th class="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                ${allTrays.map(tray => {
                  const isReady = tray.Status.includes('Ready') || tray.Status.includes('Sterile');
                  const isInUse = tray.Status.includes('In Use');
                  const isDecontam = tray.Status.includes('Decontamination');

                  const statusColor = isInUse ? 'bg-rose-100 text-rose-800 border-rose-300' : 
                                      (isReady ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-amber-100 text-amber-800 border-amber-300');

                  return `
                    <tr class="hover:bg-slate-50 transition">
                      <td class="p-2.5 font-mono font-bold text-emerald-800">
                        ${tray.TrayID}
                        <div class="text-[10px] text-slate-400 font-normal">${tray.TrayNumber}</div>
                      </td>
                      <td class="p-2.5">
                        <div class="font-bold text-slate-900">${tray.TrayName}</div>
                        <div class="text-[10px] text-slate-500">Tech: ${tray.TechnicianName || 'CSSD Specialist'}</div>
                      </td>
                      <td class="p-2.5 text-slate-700 font-medium">${tray.Department}</td>
                      <td class="p-2.5 font-bold font-mono text-slate-800">${tray.TotalInstruments} pcs</td>
                      <td class="p-2.5 text-slate-700 truncate max-w-xs" title="${tray.SterilizationMethod}">
                        <i data-lucide="shield" class="w-3 h-3 inline text-blue-600"></i> ${tray.SterilizationMethod.split('(')[0]}
                      </td>
                      <td class="p-2.5 font-mono text-[11px]">
                        <span class="text-blue-700 font-semibold">${tray.CycleNumber}</span>
                        <div class="text-[10px] text-slate-500">Exp: ${tray.ExpiryDate}</div>
                      </td>
                      <td class="p-2.5">
                        <div class="flex items-center gap-1 text-[10px]">
                          <span class="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold" title="Class 5 Chemical Integrator: Pass">Chem: OK</span>
                          <span class="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold" title="Biological Spore Indicator: Pass">Bio: OK</span>
                        </div>
                      </td>
                      <td class="p-2.5">
                        <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${statusColor}">
                          ${tray.Status}
                        </span>
                        ${tray.AssignedSurgeryID ? `<div class="text-[9px] font-mono text-rose-700 mt-0.5">Linked: ${tray.AssignedSurgeryID}</div>` : ''}
                      </td>
                      <td class="p-2.5 text-right space-x-1 whitespace-nowrap">
                        ${isReady ? `
                          <button onclick="handleTransitionTrayStatus('${tray.TrayID}', 'In Use (OT-1)')" class="px-2 py-1 bg-white hover:bg-rose-50 border border-slate-300 text-rose-700 rounded text-[10px] font-semibold transition" title="Dispatch to Operating Room">
                            Dispatch to OR
                          </button>
                        ` : ''}
                        ${isInUse ? `
                          <button onclick="handleTransitionTrayStatus('${tray.TrayID}', 'Decontamination & Washing')" class="px-2 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 rounded text-[10px] font-semibold transition" title="Send to Decontamination Wash">
                            To Wash
                          </button>
                        ` : ''}
                        ${isDecontam ? `
                          <button onclick="openRunAutoclaveModal('${tray.TrayID}')" class="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold transition" title="Autoclave & Sterilize">
                            Autoclave
                          </button>
                        ` : ''}
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          ` : (window._cssdActiveTab === 'cycles' ? `
            <div class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span class="font-bold text-slate-800 text-sm flex items-center gap-1.5"><i data-lucide="flame" class="w-4 h-4 text-orange-600"></i> Autoclave Chamber 1</span>
                    <span class="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">Ready</span>
                  </div>
                  <div class="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div class="flex justify-between"><span>Type:</span> <b class="text-slate-800">Pre-Vacuum Steam</b></div>
                    <div class="flex justify-between"><span>Cycle Param:</span> <b class="text-slate-800">134°C @ 30.5 psi (3.5 min)</b></div>
                    <div class="flex justify-between"><span>Last Batch:</span> <b class="font-mono text-slate-800">AUTOCLAVE-CYC-2026-092</b></div>
                    <div class="flex justify-between"><span>Bowie-Dick Test:</span> <b class="text-emerald-700">Pass (Confirmed)</b></div>
                  </div>
                  <button onclick="openRunAutoclaveModal()" class="w-full mt-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs transition">Start Chamber 1 Batch</button>
                </div>

                <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span class="font-bold text-slate-800 text-sm flex items-center gap-1.5"><i data-lucide="zap" class="w-4 h-4 text-purple-600"></i> Plasma Sterilizer 2</span>
                    <span class="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 font-bold">Idle</span>
                  </div>
                  <div class="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div class="flex justify-between"><span>Type:</span> <b class="text-slate-800">Low-Temp H2O2 Plasma</b></div>
                    <div class="flex justify-between"><span>Cycle Param:</span> <b class="text-slate-800">50°C Vapor Gas (45 min)</b></div>
                    <div class="flex justify-between"><span>Last Batch:</span> <b class="font-mono text-slate-800">PLASMA-CYC-2026-042</b></div>
                    <div class="flex justify-between"><span>Load Capacity:</span> <b class="text-slate-800">Scopes & Electronics</b></div>
                  </div>
                  <button onclick="openRunAutoclaveModal()" class="w-full mt-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded text-xs transition">Start Plasma Cycle</button>
                </div>

                <div class="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span class="font-bold text-slate-800 text-sm flex items-center gap-1.5"><i data-lucide="droplets" class="w-4 h-4 text-teal-600"></i> Automated Endoscope Reprocessor</span>
                    <span class="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold">Ready</span>
                  </div>
                  <div class="mt-3 space-y-1.5 text-xs text-slate-600">
                    <div class="flex justify-between"><span>Type:</span> <b class="text-slate-800">Glutaraldehyde / Peracetic Acid</b></div>
                    <div class="flex justify-between"><span>Leak Testing:</span> <b class="text-emerald-700">Automated Pressure OK</b></div>
                    <div class="flex justify-between"><span>Last Batch:</span> <b class="font-mono text-slate-800">AER-CYC-2026-015</b></div>
                    <div class="flex justify-between"><span>Filter Status:</span> <b class="text-slate-800">0.2 micron HEPA Clean</b></div>
                  </div>
                  <button onclick="openRunAutoclaveModal()" class="w-full mt-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded text-xs transition">Run AER Disinfection</button>
                </div>
              </div>
            </div>
          ` : `
            <!-- Consumables & Implants Registry -->
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-[#f3f2f1] text-slate-700 uppercase tracking-wider text-[11px] sticky top-0 border-b border-slate-300 z-10 select-none">
                <tr>
                  <th class="p-2.5">Item Name & Description</th>
                  <th class="p-2.5">Category</th>
                  <th class="p-2.5">Current Stock</th>
                  <th class="p-2.5">Reorder Min</th>
                  <th class="p-2.5">Unit Cost</th>
                  <th class="p-2.5">Stock Status</th>
                  <th class="p-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                ${consumables.map((item, idx) => {
                  const isLow = item.stock <= item.min;
                  return `
                    <tr class="hover:bg-slate-50 transition">
                      <td class="p-2.5 font-bold text-slate-900">${item.name}</td>
                      <td class="p-2.5 text-slate-600">${item.category}</td>
                      <td class="p-2.5 font-bold font-mono text-base ${isLow ? 'text-rose-600' : 'text-slate-900'}">${item.stock} ${item.unit}</td>
                      <td class="p-2.5 text-slate-500 font-mono">${item.min} ${item.unit}</td>
                      <td class="p-2.5 font-semibold text-slate-700 font-mono">${item.cost.toFixed(2)}</td>
                      <td class="p-2.5">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold ${isLow ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}">
                          ${isLow ? 'Reorder Required' : 'Adequate'}
                        </span>
                      </td>
                      <td class="p-2.5 text-right">
                        <button onclick="handleReplenishConsumable(${idx})" class="px-2.5 py-1 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-800 rounded text-[10px] font-semibold transition">
                          + Restock 20
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          `)}
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// DYNAMICS 365 SURGICAL BUSINESS PROCESS FLOW (BPF) MODAL
// ==========================================

function openSurgeryWorkflow(surgeryId, stageOverride) {
  const surg = DAL.findById('Surgeries', surgeryId);
  if (!surg) {
    showToast('Surgery record not found.', 'error');
    return;
  }

  const pat = DAL.findById('Patients', surg.PatientID) || {};
  const doc = DAL.findById('Doctors', surg.LeadSurgeonID) || {};
  const theater = DAL.findById('OperationTheaters', surg.TheaterID) || {};
  const allTrays = DAL.find('SterileTrays') || [];

  const activeStage = stageOverride || surg.SurgeryStage || 'IntraOp';

  const stages = [
    { id: 'PreOp', num: '1', title: 'Pre-Op Clearance', icon: 'clipboard-check' },
    { id: 'Scheduling', num: '2', title: 'Theater & Team', icon: 'users' },
    { id: 'IntraOp', num: '3', title: 'Intra-Op & WHO Checklist', icon: 'activity' },
    { id: 'PACU', num: '4', title: 'PACU & Recovery', icon: 'heart-pulse' }
  ];

  function getBpfClass(stageId) {
    const stageIndex = stages.findIndex(s => s.id === stageId);
    const activeIndex = stages.findIndex(s => s.id === activeStage);
    if (stageId === activeStage) {
      return 'bg-gradient-to-r from-rose-800 to-[#002050] text-white font-bold shadow-md border-b-2 border-rose-400';
    } else if (stageIndex < activeIndex || surg.Status === 'Completed') {
      return 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold';
    } else {
      return 'bg-slate-50 text-slate-500 hover:bg-slate-100 font-medium';
    }
  }

  let stageHtml = '';
  switch (activeStage) {
    case 'PreOp':
      stageHtml = renderSurgeryStage1_PreOp(surg, pat, theater, doc);
      break;
    case 'Scheduling':
      stageHtml = renderSurgeryStage2_Team(surg, pat, theater, doc, allTrays);
      break;
    case 'IntraOp':
      stageHtml = renderSurgeryStage3_IntraOp(surg, pat, theater, doc);
      break;
    case 'PACU':
      stageHtml = renderSurgeryStage4_PACU(surg, pat, theater, doc);
      break;
    default:
      stageHtml = renderSurgeryStage3_IntraOp(surg, pat, theater, doc);
  }

  openModal(`
    <div class="flex flex-col h-[90vh] max-w-5xl w-full mx-auto bg-slate-50 rounded-lg overflow-hidden shadow-2xl">
      <!-- D365 Model-driven Record Header -->
      <div class="bg-[#002050] text-white px-6 py-3 flex items-center justify-between shadow-md">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-rose-600/70 border border-rose-400 flex items-center justify-center font-bold text-base shadow-sm">
            <i data-lucide="scissors" class="w-5 h-5 text-white"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs uppercase tracking-wider text-rose-300 font-semibold">Operation Theater (OT) Process</span>
              <span class="text-xs bg-rose-950 px-2 py-0.5 rounded font-mono text-rose-200 border border-rose-800">${surg.SurgeryNumber}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold ${surg.Status === 'In Surgery' ? 'bg-rose-500 text-white animate-pulse' : 'bg-emerald-600 text-white'}">${surg.Status}</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/10 text-slate-200">${surg.Category}</span>
            </div>
            <h2 class="text-base font-bold text-white flex items-center gap-2 mt-0.5">
              ${surg.ProcedureName}
              <span class="text-xs font-normal text-slate-300">(${pat.FirstName || ''} ${pat.LastName || ''} &bull; ${pat.PatientNumber || ''})</span>
            </h2>
          </div>
        </div>

        <div class="flex items-center gap-5 text-xs text-right">
          <div class="hidden sm:block">
            <div class="text-[10px] text-blue-300 uppercase">Assigned Suite</div>
            <div class="font-bold font-mono text-white text-xs">${theater.TheaterNumber || surg.TheaterID}</div>
          </div>
          <div class="hidden sm:block">
            <div class="text-[10px] text-blue-300 uppercase">Lead Surgeon</div>
            <div class="font-bold text-white text-xs">${surg.LeadSurgeonName ? surg.LeadSurgeonName.split(',')[0] : 'Surgeon'}</div>
          </div>
          <div class="hidden sm:block">
            <div class="text-[10px] text-blue-300 uppercase">Anesthesia</div>
            <div class="font-bold text-emerald-300 text-xs">${surg.AnesthesiaType.split('(')[0].trim()}</div>
          </div>
          <button onclick="closeModal()" class="text-slate-300 hover:text-white p-1 rounded-md hover:bg-white/10 transition">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>
      </div>

      <!-- Business Process Flow Stage Tracker Bar -->
      <div class="bg-white border-b border-slate-200 shadow-2xs overflow-x-auto custom-scrollbar select-none">
        <div class="flex min-w-[720px] text-xs">
          ${stages.map((st, idx) => `
            <div onclick="openSurgeryWorkflow('${surg.SurgeryID}', '${st.id}')" class="bpf-step cursor-pointer ${getBpfClass(st.id)} flex-1 py-2.5 px-3 flex items-center justify-center gap-1.5 transition whitespace-nowrap">
              <span class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${st.id === activeStage ? 'bg-amber-400 text-slate-900' : 'bg-slate-200 text-slate-700'}">${st.num}</span>
              <i data-lucide="${st.icon}" class="w-3.5 h-3.5"></i>
              <span>${st.title}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Stage Form Body Container -->
      <div class="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar">
        ${stageHtml}
      </div>
    </div>
  `);
  lucide.createIcons();
}

function renderSurgeryStage1_PreOp(surg, pat, theater, doc) {
  const isCompleted = surg.Status === 'Completed';

  return `
    <div class="space-y-4 max-w-4xl mx-auto text-xs">
      <div class="p-3.5 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between text-indigo-950">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-lg bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-700 font-bold">
            <i data-lucide="clipboard-check" class="w-5 h-5"></i>
          </div>
          <div>
            <h4 class="font-bold text-sm text-indigo-900">Stage 1: Pre-Operative Assessment & Surgical Clearance</h4>
            <p class="text-[11px] text-indigo-800">Ensure informed surgical and anesthesia consent, NPO fasting adherence, blood availability, and site marking.</p>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-white text-indigo-900 border border-indigo-300">
          Pre-Op Protocol Check
        </span>
      </div>

      <!-- Critical Allergies & Vitals Banner -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="p-3 bg-rose-50 border border-rose-200 rounded text-rose-900">
          <span class="font-bold flex items-center gap-1.5"><i data-lucide="alert-triangle" class="w-4 h-4 text-rose-600"></i> Documented Allergies:</span>
          <p class="mt-1 font-semibold text-rose-800 text-xs">${pat.Allergies || 'No Known Drug Allergies (NKDA)'}</p>
        </div>
        <div class="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900">
          <span class="font-bold flex items-center gap-1.5"><i data-lucide="droplet" class="w-4 h-4 text-blue-600"></i> Blood Standby & Group:</span>
          <p class="mt-1 font-semibold text-blue-800 text-xs">Blood Group: <b>${pat.BloodType || 'Unknown'}</b> &bull; ${surg.BloodUnitsCrossmatched || 'Type & Screen in file'}</p>
        </div>
      </div>

      <form onsubmit="handleUpdatePreOpClearance(event, '${surg.SurgeryID}')" class="space-y-4">
        <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
          <h5 class="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b pb-1.5 flex items-center gap-1.5">
            <i data-lucide="check-square" class="w-3.5 h-3.5 text-blue-600"></i> Pre-Operative Verification Checklist
          </h5>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
            <label class="flex items-center gap-2 p-2 bg-slate-50 border rounded cursor-pointer hover:bg-slate-100">
              <input type="checkbox" id="chk-consent" checked class="w-4 h-4 text-blue-600 rounded">
              <span><b>Informed Surgical Consent Signed</b> (Witnessed)</span>
            </label>
            <label class="flex items-center gap-2 p-2 bg-slate-50 border rounded cursor-pointer hover:bg-slate-100">
              <input type="checkbox" id="chk-anes-consent" checked class="w-4 h-4 text-blue-600 rounded">
              <span><b>Informed Anesthesia Consent Signed</b></span>
            </label>
            <label class="flex items-center gap-2 p-2 bg-slate-50 border rounded cursor-pointer hover:bg-slate-100">
              <input type="checkbox" id="chk-npo" checked class="w-4 h-4 text-blue-600 rounded">
              <span><b>NPO (Nil Per Os) Confirmed</b> (Fasted >= 6-8 hrs)</span>
            </label>
            <label class="flex items-center gap-2 p-2 bg-slate-50 border rounded cursor-pointer hover:bg-slate-100">
              <input type="checkbox" id="chk-site-mark" checked class="w-4 h-4 text-blue-600 rounded">
              <span><b>Surgical Site Marked</b> by Lead Surgeon</span>
            </label>
            <label class="flex items-center gap-2 p-2 bg-slate-50 border rounded cursor-pointer hover:bg-slate-100">
              <input type="checkbox" id="chk-ecg-labs" checked class="w-4 h-4 text-blue-600 rounded">
              <span><b>Pre-Op ECG, CBC & Coagulation Reviewed</b></span>
            </label>
            <label class="flex items-center gap-2 p-2 bg-slate-50 border rounded cursor-pointer hover:bg-slate-100">
              <input type="checkbox" id="chk-iv-access" checked class="w-4 h-4 text-blue-600 rounded">
              <span><b>Patent Large-Bore IV Line (18G/16G) Verified</b></span>
            </label>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-2">
            <label class="block font-bold text-slate-700">Pre-Operative Clinical Diagnosis</label>
            <textarea id="preop-diag" rows="2" class="w-full border rounded p-2 text-xs focus:ring-1 focus:ring-blue-500">${surg.PreOpDiagnosis || ''}</textarea>
          </div>
          <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-2">
            <label class="block font-bold text-slate-700">Pre-Op Antibiotic Prophylaxis & Instructions</label>
            <textarea id="preop-inst" rows="2" class="w-full border rounded p-2 text-xs focus:ring-1 focus:ring-blue-500" placeholder="e.g. IV Cefazolin 2g within 60 min prior to skin incision, TED hose applied...">${surg.OperativeNotes || ''}</textarea>
          </div>
        </div>

        <div class="pt-3 border-t flex justify-end gap-2">
          <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded text-xs shadow-xs transition flex items-center gap-1.5">
            <i data-lucide="check" class="w-4 h-4"></i> Save Pre-Op Clearance & Advance to Team Confirmation
          </button>
        </div>
      </form>
    </div>
  `;
}

function renderSurgeryStage2_Team(surg, pat, theater, doc, allTrays) {
  const doctors = DAL.find('Doctors') || [];
  const theaters = DAL.find('OperationTheaters') || [];

  return `
    <div class="space-y-4 max-w-4xl mx-auto text-xs">
      <div class="p-3.5 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between text-blue-950">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-lg bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700 font-bold">
            <i data-lucide="users" class="w-5 h-5"></i>
          </div>
          <div>
            <h4 class="font-bold text-sm text-blue-900">Stage 2: Operating Theater & Surgical Team Confirmation</h4>
            <p class="text-[11px] text-blue-800">Assign operating room suite, confirm lead surgeon, anesthesiologist, nurses, and requisition sterile instrument trays.</p>
          </div>
        </div>
      </div>

      <form onsubmit="handleConfirmSurgicalTeam(event, '${surg.SurgeryID}')" class="space-y-4">
        <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-4">
          <h5 class="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b pb-1.5 flex items-center gap-1.5">
            <i data-lucide="user-check" class="w-3.5 h-3.5 text-blue-600"></i> Surgical & Anesthesia Team Roster
          </h5>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Operating Theater Suite *</label>
              <select id="team-theater" required class="w-full border rounded p-2 bg-white font-semibold">
                ${theaters.map(t => `<option value="${t.TheaterID}" ${t.TheaterID === surg.TheaterID ? 'selected' : ''}>${t.TheaterNumber}: ${t.Name.split('(')[0]}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Lead Attending Surgeon *</label>
              <select id="team-lead" required class="w-full border rounded p-2 bg-white font-semibold">
                ${doctors.map(d => `<option value="${d.DoctorID}" ${d.DoctorID === surg.LeadSurgeonID ? 'selected' : ''}>${d.DoctorName} (${d.Specialization})</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Assistant Surgeon</label>
              <input type="text" id="team-asst" value="${surg.AssistantSurgeon || ''}" class="w-full border rounded p-2">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Attending Anesthesiologist *</label>
              <input type="text" id="team-anes" value="${surg.Anesthesiologist || ''}" required class="w-full border rounded p-2">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Anesthesia Technique *</label>
              <select id="team-anes-type" required class="w-full border rounded p-2 bg-white">
                <option value="General Endotracheal Anesthesia (GETA)" ${surg.AnesthesiaType.includes('General') ? 'selected' : ''}>General Endotracheal (GETA)</option>
                <option value="Spinal Anesthesia" ${surg.AnesthesiaType.includes('Spinal') ? 'selected' : ''}>Spinal Anesthesia</option>
                <option value="Epidural Anesthesia" ${surg.AnesthesiaType.includes('Epidural') ? 'selected' : ''}>Epidural Anesthesia</option>
                <option value="Monitored Anesthesia Care (MAC) + Sedation" ${surg.AnesthesiaType.includes('MAC') ? 'selected' : ''}>MAC + Conscious Sedation</option>
                <option value="Regional Nerve Block" ${surg.AnesthesiaType.includes('Regional') ? 'selected' : ''}>Regional Nerve Block</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Scrub Nurse & Circulator</label>
              <div class="grid grid-cols-2 gap-1">
                <input type="text" id="team-scrub" value="${surg.ScrubNurse || ''}" placeholder="Scrub" class="w-full border rounded p-1.5 text-xs">
                <input type="text" id="team-circ" value="${surg.CirculatingNurse || ''}" placeholder="Circulator" class="w-full border rounded p-1.5 text-xs">
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
          <h5 class="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b pb-1.5 flex items-center gap-1.5">
            <i data-lucide="package" class="w-3.5 h-3.5 text-amber-600"></i> Surgical Materials & Sterile Trays Requisition
          </h5>
          <div class="space-y-2">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Required Consumables, Implants & Sutures</label>
              <textarea id="team-materials" rows="2" class="w-full border rounded p-2 text-xs focus:ring-1 focus:ring-blue-500">${surg.MaterialsRequired || ''}</textarea>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Linked CSSD Sterile Instrument Trays</label>
              <input type="text" id="team-trays" value="${surg.SterileTraysRequired || ''}" class="w-full border rounded p-2 text-xs font-mono text-emerald-800 bg-emerald-50/50">
            </div>
          </div>
        </div>

        <div class="pt-3 border-t flex justify-end gap-2">
          <button type="submit" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded text-xs shadow-xs transition flex items-center gap-1.5">
            <i data-lucide="check" class="w-4 h-4"></i> Confirm Team & Enter Operating Theater
          </button>
        </div>
      </form>
    </div>
  `;
}

function renderSurgeryStage3_IntraOp(surg, pat, theater, doc) {
  const whoChecklist = surg.WhoSafetyChecklist || '';
  const signInDone = whoChecklist.includes('Sign In: Completed');
  const timeOutDone = whoChecklist.includes('Time Out: Completed');
  const signOutDone = whoChecklist.includes('Sign Out: Completed');

  return `
    <div class="space-y-4 max-w-4xl mx-auto text-xs">
      <div class="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-rose-950">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-lg bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-700 font-bold">
            <i data-lucide="activity" class="w-5 h-5"></i>
          </div>
          <div>
            <h4 class="font-bold text-sm text-rose-900">Stage 3: Intra-Operative & WHO Surgical Safety Checklist</h4>
            <p class="text-[11px] text-rose-800">Mandatory sign-in, time-out prior to incision, intra-operative documentation, and instrument/sponge sign-out tally.</p>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white animate-pulse">
          ${surg.Status === 'In Surgery' ? 'ACTIVE SURGERY IN PROGRESS' : surg.Status}
        </span>
      </div>

      <!-- WHO Surgical Safety Checklist Interactive Card -->
      <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <h5 class="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i> World Health Organization (WHO) Surgical Safety Checklist
          </h5>
          <span class="text-[10px] text-slate-500 font-medium">Safe Surgery Saves Lives Protocol</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-700">
          <!-- Sign In -->
          <div class="p-3 bg-slate-50 border rounded-lg space-y-2">
            <div class="flex items-center justify-between font-bold text-xs pb-1 border-b">
              <span class="text-blue-900">1. Sign In</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded ${signInDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${signInDone ? 'Verified' : 'Pending'}</span>
            </div>
            <div class="text-[10px] text-slate-500 italic">Before induction of anesthesia with nurse & anesthesia team</div>
            <label class="flex items-center gap-1.5 text-[11px]"><input type="checkbox" ${signInDone ? 'checked' : ''} class="who-check rounded"> Patient confirmed identity & consent</label>
            <label class="flex items-center gap-1.5 text-[11px]"><input type="checkbox" ${signInDone ? 'checked' : ''} class="who-check rounded"> Surgical site marked</label>
            <label class="flex items-center gap-1.5 text-[11px]"><input type="checkbox" ${signInDone ? 'checked' : ''} class="who-check rounded"> Anesthesia machine & meds check</label>
            <label class="flex items-center gap-1.5 text-[11px]"><input type="checkbox" ${signInDone ? 'checked' : ''} class="who-check rounded"> Pulse oximeter on patient & functioning</label>
            <label class="flex items-center gap-1.5 text-[11px]"><input type="checkbox" ${signInDone ? 'checked' : ''} class="who-check rounded"> Airway / aspiration risk assessed</label>
          </div>

          <!-- Time Out -->
          <div class="p-3 bg-slate-50 border rounded-lg space-y-2">
            <div class="flex items-center justify-between font-bold text-xs pb-1 border-b">
              <span class="text-indigo-900">2. Time Out</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded ${timeOutDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${timeOutDone ? 'Verified' : 'Pending'}</span>
            </div>
            <div class="text-[10px] text-slate-500 italic">Before skin incision with entire team verbally confirming</div>
            <label class="flex items-center gap-1.5 text-[11px]"><input type="checkbox" ${timeOutDone ? 'checked' : ''} class="who-check rounded"> Team introduced by name & role</label>
            <label class="flex items-center gap-1.5 text-[11px]"><input type="checkbox" ${timeOutDone ? 'checked' : ''} class="who-check rounded"> Patient name, procedure & site confirmed</label>
            <label class="flex items-center gap-1.5 text-[11px]"><input type="checkbox" ${timeOutDone ? 'checked' : ''} class="who-check rounded"> Antibiotic prophylaxis given within 60m</label>
            <label class="flex items-center gap-1.5 text-[11px]"><input type="checkbox" ${timeOutDone ? 'checked' : ''} class="who-check rounded"> Anticipated critical steps & blood loss</label>
            <label class="flex items-center gap-1.5 text-[11px]"><input type="checkbox" ${timeOutDone ? 'checked' : ''} class="who-check rounded"> Essential imaging displayed</label>
          </div>

          <!-- Sign Out -->
          <div class="p-3 bg-slate-50 border rounded-lg space-y-2">
            <div class="flex items-center justify-between font-bold text-xs pb-1 border-b">
              <span class="text-rose-900">3. Sign Out</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded ${signOutDone ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${signOutDone ? 'Verified' : 'Pending'}</span>
            </div>
            <div class="text-[10px] text-slate-500 italic">Before patient leaves operating room</div>
            <label class="flex items-center gap-1.5 text-[11px]"><input type="checkbox" ${signOutDone ? 'checked' : ''} class="who-check rounded"> Name of procedure recorded</label>
            <label class="flex items-center gap-1.5 text-[11px]"><input type="checkbox" ${signOutDone ? 'checked' : ''} class="who-check rounded"> Instrument, sponge & needle count correct</label>
            <label class="flex items-center gap-1.5 text-[11px]"><input type="checkbox" ${signOutDone ? 'checked' : ''} class="who-check rounded"> Specimen labeled (patient name & site)</label>
            <label class="flex items-center gap-1.5 text-[11px]"><input type="checkbox" ${signOutDone ? 'checked' : ''} class="who-check rounded"> Any equipment problems addressed</label>
            <label class="flex items-center gap-1.5 text-[11px]"><input type="checkbox" ${signOutDone ? 'checked' : ''} class="who-check rounded"> Key post-op recovery concerns reviewed</label>
          </div>
        </div>
      </div>

      <!-- Operative Notes & Completion Form -->
      <form onsubmit="handleCompleteSurgeryProcedure(event, '${surg.SurgeryID}')" class="space-y-4">
        <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
          <h5 class="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b pb-1.5 flex items-center gap-1.5">
            <i data-lucide="file-text" class="w-3.5 h-3.5 text-blue-600"></i> Operative Findings & Surgical Notes
          </h5>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Post-Operative Diagnosis</label>
              <input type="text" id="op-postdiag" value="${surg.PostOpDiagnosis || surg.PreOpDiagnosis}" required class="w-full border rounded p-2 text-xs">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Estimated Blood Loss (mL)</label>
              <input type="number" id="op-ebl" value="50" required class="w-full border rounded p-2 text-xs font-bold font-mono">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Crystalloid / Colloid IV Infused (mL)</label>
              <input type="number" id="op-fluids" value="1200" required class="w-full border rounded p-2 text-xs font-mono">
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-700 mb-1">Detailed Operative Summary</label>
            <textarea id="op-notes" rows="3" required class="w-full border rounded p-2 text-xs focus:ring-1 focus:ring-blue-500">${surg.OperativeNotes || ''}</textarea>
          </div>
        </div>

        <div class="pt-3 border-t flex justify-between items-center">
          <div class="flex items-center gap-2">
            <button type="button" onclick="showToast('Surgical count verified: 100% Sponges, Needles and Instruments accounted for.', 'success')" class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-semibold text-xs transition">
              Verify Counts OK
            </button>
          </div>
          <button type="submit" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded text-xs shadow-xs transition flex items-center gap-1.5">
            <i data-lucide="log-out" class="w-4 h-4"></i> Complete Surgery & Transfer Patient to PACU
          </button>
        </div>
      </form>
    </div>
  `;
}

function renderSurgeryStage4_PACU(surg, pat, theater, doc) {
  const aldrete = surg.AldreteScore || 9;
  const isReady = aldrete >= 9;

  return `
    <div class="space-y-4 max-w-4xl mx-auto text-xs">
      <div class="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-amber-950">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 font-bold">
            <i data-lucide="heart-pulse" class="w-5 h-5"></i>
          </div>
          <div>
            <h4 class="font-bold text-sm text-amber-900">Stage 4: Post-Anesthesia Care Unit (PACU) Recovery & Handover</h4>
            <p class="text-[11px] text-amber-800">Monitor post-anesthetic emergence, calculate Aldrete score, and transfer patient back to assigned Inpatient Bed or ICU.</p>
          </div>
        </div>
        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200/90 text-amber-950 border border-amber-300">
          Aldrete Score: ${aldrete} / 10
        </span>
      </div>

      <!-- Aldrete Recovery Scoring System Card -->
      <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
        <div class="flex items-center justify-between border-b pb-2">
          <h5 class="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <i data-lucide="calculator" class="w-4 h-4 text-blue-600"></i> Modified Aldrete Recovery Score Assessment
          </h5>
          <span class="text-[10px] font-bold ${isReady ? 'text-emerald-700' : 'text-amber-700'}">
            ${isReady ? 'Score >= 9: Qualified for Ward Transfer' : 'Score < 9: Continued PACU Monitoring Required'}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-slate-700">
          <div class="p-2.5 bg-slate-50 border rounded space-y-1">
            <span class="font-bold text-slate-900 block text-[11px]">1. Activity</span>
            <select id="ald-act" onchange="calculateAldrete()" class="w-full border rounded p-1 text-xs bg-white">
              <option value="2" selected>Moves all 4 extremities (2)</option>
              <option value="1">Moves 2 extremities (1)</option>
              <option value="0">Unable to move (0)</option>
            </select>
          </div>
          <div class="p-2.5 bg-slate-50 border rounded space-y-1">
            <span class="font-bold text-slate-900 block text-[11px]">2. Respiration</span>
            <select id="ald-resp" onchange="calculateAldrete()" class="w-full border rounded p-1 text-xs bg-white">
              <option value="2" selected>Deep breaths, coughs (2)</option>
              <option value="1">Dyspnea / limited breathing (1)</option>
              <option value="0">Apneic (0)</option>
            </select>
          </div>
          <div class="p-2.5 bg-slate-50 border rounded space-y-1">
            <span class="font-bold text-slate-900 block text-[11px]">3. Circulation</span>
            <select id="ald-circ" onchange="calculateAldrete()" class="w-full border rounded p-1 text-xs bg-white">
              <option value="2" selected>BP +/- 20% of pre-op (2)</option>
              <option value="1">BP +/- 20-50% (1)</option>
              <option value="0">BP +/- >50% (0)</option>
            </select>
          </div>
          <div class="p-2.5 bg-slate-50 border rounded space-y-1">
            <span class="font-bold text-slate-900 block text-[11px]">4. Consciousness</span>
            <select id="ald-cons" onchange="calculateAldrete()" class="w-full border rounded p-1 text-xs bg-white">
              <option value="2" selected>Fully awake & oriented (2)</option>
              <option value="1">Arousable on calling (1)</option>
              <option value="0">Unresponsive (0)</option>
            </select>
          </div>
          <div class="p-2.5 bg-slate-50 border rounded space-y-1">
            <span class="font-bold text-slate-900 block text-[11px]">5. O2 Saturation</span>
            <select id="ald-o2" onchange="calculateAldrete()" class="w-full border rounded p-1 text-xs bg-white">
              <option value="2" selected>SpO2 > 92% room air (2)</option>
              <option value="1">Needs O2 to keep > 90% (1)</option>
              <option value="0">SpO2 < 90% with O2 (0)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Post-Op Orders & Ward Handover -->
      <form onsubmit="handleDischargeFromPacu(event, '${surg.SurgeryID}')" class="space-y-4">
        <div class="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-3">
          <h5 class="font-bold text-slate-800 uppercase tracking-wider text-[11px] border-b pb-1.5 flex items-center gap-1.5">
            <i data-lucide="log-out" class="w-3.5 h-3.5 text-blue-600"></i> Ward Handover & Post-Op Orders
          </h5>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Transfer Destination *</label>
              <select id="pacu-dest" required class="w-full border rounded p-2 bg-white font-semibold">
                <option value="IPD Ward" selected>Return to Assigned Inpatient Bed (${surg.AdmissionID || 'IPD'})</option>
                <option value="Intensive Care Unit (ICU)">Transfer to Intensive Care Unit (ICU)</option>
                <option value="Day Surgery Discharge">Discharge Home (Ambulatory)</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Post-Op Analgesia Plan</label>
              <input type="text" id="pacu-pain" value="IV Acetaminophen 1g q6h + Morphine 2mg IV PRN breakthrough pain" required class="w-full border rounded p-2 text-xs">
            </div>
            <div>
              <label class="block font-semibold text-slate-700 mb-1">Diet & Activity Orders</label>
              <input type="text" id="pacu-diet" value="Sips of water after 2 hours; clear liquids as tolerated; bed rest x 4 hrs" required class="w-full border rounded p-2 text-xs">
            </div>
          </div>
        </div>

        <div class="pt-3 border-t flex justify-end gap-2">
          <button type="submit" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs shadow-xs transition flex items-center gap-1.5">
            <i data-lucide="check-circle" class="w-4 h-4"></i> Complete PACU Handover & Transfer to Inpatient Bed
          </button>
        </div>
      </form>
    </div>
  `;
}

function calculateAldrete() {
  const act = parseInt(document.getElementById('ald-act').value) || 0;
  const resp = parseInt(document.getElementById('ald-resp').value) || 0;
  const circ = parseInt(document.getElementById('ald-circ').value) || 0;
  const cons = parseInt(document.getElementById('ald-cons').value) || 0;
  const o2 = parseInt(document.getElementById('ald-o2').value) || 0;
  const total = act + resp + circ + cons + o2;
  showToast(`Updated Aldrete Recovery Score: ${total} / 10 ${total >= 9 ? '(Eligible for Ward Transfer)' : '(PACU Monitoring)'}`, total >= 9 ? 'success' : 'info');
}

// ==========================================
// SURGERY BOOKING MODAL (FROM IPD OR DIRECT)
// ==========================================

function openSurgeryBookingModal(prefillAdmissionId = '', prefillPatientId = '', prefillTheaterId = '') {
  const patients = DAL.find('Patients') || [];
  const admissions = DAL.find('Admissions') || [];
  const doctors = DAL.find('Doctors') || [];
  const theaters = DAL.find('OperationTheaters') || [];
  const allSurgeries = DAL.find('Surgeries') || [];
  const allTrays = DAL.find('SterileTrays') || [];

  const nextNum = `OR-2026-${String(allSurgeries.length + 1).padStart(4, '0')}`;
  const preAdmission = prefillAdmissionId ? DAL.findById('Admissions', prefillAdmissionId) : null;
  const activePatientId = preAdmission ? preAdmission.PatientID : (prefillPatientId || (patients[0] ? patients[0].PatientID : ''));

  openModal(`
    <div class="px-6 py-4 bg-[#002050] text-white flex justify-between items-center">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center font-bold">
          <i data-lucide="scissors" class="w-4 h-4 text-white"></i>
        </div>
        <div>
          <h3 class="font-bold text-sm">Schedule Operation Theater / Surgery Booking</h3>
          <p class="text-[11px] text-slate-300">Book surgical suite, assign surgical team, materials & sterile instrument sets</p>
        </div>
      </div>
      <button onclick="closeModal()" class="text-slate-300 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
    </div>

    <form onsubmit="handleCreateSurgery(event)" class="p-6 space-y-4 overflow-y-auto max-h-[78vh] custom-scrollbar text-xs">
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Surgery Number *</label>
          <input type="text" id="new-surg-number" value="${nextNum}" required class="w-full border rounded p-2 font-mono font-bold text-rose-700 bg-slate-50">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Patient *</label>
          <select id="new-surg-patient" required class="w-full border rounded p-2 bg-white">
            ${patients.map(p => `<option value="${p.PatientID}" ${p.PatientID === activePatientId ? 'selected' : ''}>${p.FirstName} ${p.LastName} (${p.PatientNumber})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Linked IPD Admission</label>
          <select id="new-surg-admission" class="w-full border rounded p-2 bg-white">
            <option value="">-- Outpatient / None --</option>
            ${admissions.map(a => `<option value="${a.AdmissionID}" ${a.AdmissionID === prefillAdmissionId ? 'selected' : ''}>${a.AdmissionNumber || a.AdmissionID} - Bed ${a.BedID}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="sm:col-span-2">
          <label class="block font-semibold text-slate-700 mb-1">Procedure Name *</label>
          <input type="text" id="new-surg-proc" value="${preAdmission ? `Surgical treatment for ${preAdmission.AdmittingDiagnosis}` : 'Laparoscopic Cholecystectomy'}" required class="w-full border rounded p-2 font-bold text-slate-900">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">ICD-10-PCS Code</label>
          <input type="text" id="new-surg-icd" value="0FT44ZZ" class="w-full border rounded p-2 font-mono">
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Surgical Category *</label>
          <select id="new-surg-cat" required class="w-full border rounded p-2 bg-white font-semibold">
            <option value="Elective">Elective</option>
            <option value="Urgent">Urgent</option>
            <option value="Emergency STAT">Emergency STAT</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Scheduled Date *</label>
          <input type="date" id="new-surg-date" value="${new Date().toISOString().split('T')[0]}" required class="w-full border rounded p-2">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Scheduled Start Time *</label>
          <input type="time" id="new-surg-time" value="09:00" required class="w-full border rounded p-2">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Est. Duration (Minutes) *</label>
          <input type="number" id="new-surg-duration" value="90" required class="w-full border rounded p-2 font-mono">
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Operating Theater Suite *</label>
          <select id="new-surg-theater" required class="w-full border rounded p-2 bg-white font-semibold">
            ${theaters.map(t => `<option value="${t.TheaterID}" ${t.TheaterID === prefillTheaterId ? 'selected' : ''}>${t.TheaterNumber}: ${t.Name.split('(')[0]} (${t.Status})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Lead Attending Surgeon *</label>
          <select id="new-surg-lead" required class="w-full border rounded p-2 bg-white">
            ${doctors.map(d => `<option value="${d.DoctorID}">${d.DoctorName} (${d.Specialization})</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Assistant Surgeon</label>
          <input type="text" id="new-surg-asst" value="Dr. Michael Chang, MD" class="w-full border rounded p-2">
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Anesthesiologist *</label>
          <input type="text" id="new-surg-anes" value="Dr. Robert Lang, MD, FASA" required class="w-full border rounded p-2">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Anesthesia Technique *</label>
          <select id="new-surg-anes-type" required class="w-full border rounded p-2 bg-white">
            <option value="General Endotracheal Anesthesia (GETA)" selected>General Endotracheal (GETA)</option>
            <option value="Spinal Anesthesia">Spinal Anesthesia</option>
            <option value="Epidural Anesthesia">Epidural Anesthesia</option>
            <option value="Monitored Anesthesia Care (MAC) + Sedation">MAC + Sedation</option>
            <option value="Regional Nerve Block">Regional Nerve Block</option>
          </select>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Blood Standby Requisition</label>
          <input type="text" id="new-surg-blood" value="2 Units PRBC crossmatched & on standby in Blood Bank" class="w-full border rounded p-2 text-xs">
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Surgical Materials & Consumables Required</label>
          <textarea id="new-surg-materials" rows="2" class="w-full border rounded p-2 text-xs">Laparoscopic Trocar 10mm & 5mm Kit, Hem-o-lok Polymer Clips, 2-0 Vicryl Suture, Endocatch Bag, 0.9% Normal Saline (3000mL)</textarea>
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">CSSD Sterile Instrument Trays Needed</label>
          <select id="new-surg-trays" multiple class="w-full border rounded p-2 text-xs bg-white h-[68px]">
            ${allTrays.map(t => `<option value="${t.TrayName} [${t.TrayID}]" ${t.TrayID === 'CSSD-TRAY-002' ? 'selected' : ''}>${t.TrayName} (${t.Status})</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="pt-3 border-t flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded text-slate-600">Cancel</button>
        <button type="submit" class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded shadow-xs transition flex items-center gap-1.5">
          <i data-lucide="check" class="w-4 h-4"></i> Dispatch Surgery Booking
        </button>
      </div>
    </form>
  `);
  lucide.createIcons();
}

function handleCreateSurgery(e) {
  e.preventDefault();
  const surgeryNumber = document.getElementById('new-surg-number').value.trim();
  const patientId = document.getElementById('new-surg-patient').value;
  const admissionId = document.getElementById('new-surg-admission').value;
  const proc = document.getElementById('new-surg-proc').value.trim();
  const icd = document.getElementById('new-surg-icd').value.trim();
  const cat = document.getElementById('new-surg-cat').value;
  const date = document.getElementById('new-surg-date').value;
  const time = document.getElementById('new-surg-time').value;
  const duration = parseInt(document.getElementById('new-surg-duration').value) || 90;
  const theaterId = document.getElementById('new-surg-theater').value;
  const leadDocId = document.getElementById('new-surg-lead').value;
  const asst = document.getElementById('new-surg-asst').value.trim();
  const anes = document.getElementById('new-surg-anes').value.trim();
  const anesType = document.getElementById('new-surg-anes-type').value;
  const blood = document.getElementById('new-surg-blood').value.trim();
  const materials = document.getElementById('new-surg-materials').value.trim();

  const traySelect = document.getElementById('new-surg-trays');
  const selectedTrays = Array.from(traySelect.selectedOptions).map(o => o.value).join(', ');

  const doc = DAL.findById('Doctors', leadDocId) || {};
  const pat = DAL.findById('Patients', patientId) || {};

  const allSurgeries = DAL.find('Surgeries') || [];
  const newCount = allSurgeries.length + 1;
  const newId = `SURG-${String(newCount).padStart(3, '0')}`;

  const newSurg = {
    SurgeryID: newId,
    SurgeryNumber: surgeryNumber,
    PatientID: patientId,
    AdmissionID: admissionId || '',
    ProcedureName: proc,
    ICD10Code: icd,
    Category: cat,
    ScheduledDate: date,
    StartTime: time,
    EndTime: '',
    DurationMinutes: duration,
    TheaterID: theaterId,
    LeadSurgeonID: leadDocId,
    LeadSurgeonName: doc.DoctorName || 'Surgeon',
    AssistantSurgeon: asst,
    Anesthesiologist: anes,
    AnesthesiaType: anesType,
    ScrubNurse: 'Joyce Chen, RN',
    CirculatingNurse: 'David Miller, BSN',
    PreOpDiagnosis: proc,
    PostOpDiagnosis: '',
    MaterialsRequired: materials,
    SterileTraysRequired: selectedTrays,
    BloodUnitsCrossmatched: blood,
    WhoSafetyChecklist: 'Sign In: Pending | Time Out: Pending | Sign Out: Pending',
    AldreteScore: 0,
    PacuStatus: 'Pre-Op Booking',
    SurgeryStage: 'PreOp',
    Status: cat === 'Emergency STAT' ? 'Pre-Op Ready' : 'Scheduled',
    OperativeNotes: `Scheduled surgical booking for ${proc}.`,
    CreatedAt: new Date().toISOString(),
    UpdatedAt: new Date().toISOString()
  };

  DAL.create('Surgeries', newSurg);

  // If tied to Inpatient Admission, update admission with Surgery status
  if (admissionId) {
    DAL.update('Admissions', admissionId, {
      SurgeryStatus: 'Scheduled',
      CurrentSurgeryID: newId
    });
  }

  closeModal();
  showToast(`Surgery ${surgeryNumber} (${proc}) scheduled successfully!`, 'success');
  navigateTo('surgeries');
}

function handleUpdatePreOpClearance(e, surgeryId) {
  e.preventDefault();
  const diag = document.getElementById('preop-diag').value;
  const notes = document.getElementById('preop-inst').value;

  DAL.update('Surgeries', surgeryId, {
    PreOpDiagnosis: diag,
    OperativeNotes: notes,
    SurgeryStage: 'Scheduling',
    Status: 'Pre-Op Ready',
    UpdatedAt: new Date().toISOString()
  });

  showToast('Stage 1 Pre-Op Clearance confirmed! Advanced to Stage 2.', 'success');
  openSurgeryWorkflow(surgeryId, 'Scheduling');
}

function handleConfirmSurgicalTeam(e, surgeryId) {
  e.preventDefault();
  const theaterId = document.getElementById('team-theater').value;
  const leadDocId = document.getElementById('team-lead').value;
  const asst = document.getElementById('team-asst').value;
  const anes = document.getElementById('team-anes').value;
  const anesType = document.getElementById('team-anes-type').value;
  const scrub = document.getElementById('team-scrub').value;
  const circ = document.getElementById('team-circ').value;
  const materials = document.getElementById('team-materials').value;
  const trays = document.getElementById('team-trays').value;

  const doc = DAL.findById('Doctors', leadDocId) || {};

  DAL.update('Surgeries', surgeryId, {
    TheaterID: theaterId,
    LeadSurgeonID: leadDocId,
    LeadSurgeonName: doc.DoctorName || 'Surgeon',
    AssistantSurgeon: asst,
    Anesthesiologist: anes,
    AnesthesiaType: anesType,
    ScrubNurse: scrub,
    CirculatingNurse: circ,
    MaterialsRequired: materials,
    SterileTraysRequired: trays,
    SurgeryStage: 'IntraOp',
    Status: 'In Surgery',
    UpdatedAt: new Date().toISOString()
  });

  // Set Theater status to In Surgery
  DAL.update('OperationTheaters', theaterId, {
    Status: 'In Surgery',
    CurrentSurgeryID: surgeryId
  });

  showToast('Surgical Team Confirmed & Patient Entered Operating Room! Initiating Stage 3 Intra-Op.', 'success');
  openSurgeryWorkflow(surgeryId, 'IntraOp');
}

function handleCompleteSurgeryProcedure(e, surgeryId) {
  e.preventDefault();
  const postDiag = document.getElementById('op-postdiag').value;
  const ebl = parseInt(document.getElementById('op-ebl').value) || 0;
  const fluids = parseInt(document.getElementById('op-fluids').value) || 0;
  const notes = document.getElementById('op-notes').value;

  const surg = DAL.findById('Surgeries', surgeryId) || {};

  DAL.update('Surgeries', surgeryId, {
    PostOpDiagnosis: postDiag,
    OperativeNotes: `${notes} (EBL: ${ebbl || ebl}mL, IV Infused: ${fluids}mL)`,
    WhoSafetyChecklist: 'Sign In: Completed & Verified | Time Out: Completed & Verified | Sign Out: Completed & Verified',
    SurgeryStage: 'PACU',
    Status: 'PACU Recovery',
    PacuStatus: 'PACU Monitored',
    AldreteScore: 9,
    UpdatedAt: new Date().toISOString()
  });

  // Mark room as turnover
  if (surg.TheaterID) {
    DAL.update('OperationTheaters', surg.TheaterID, {
      Status: 'Turnover / Sanitizing',
      CurrentSurgeryID: null
    });
  }

  showToast('Procedure successfully completed! Patient transferred to PACU.', 'success');
  openSurgeryWorkflow(surgeryId, 'PACU');
}

function handleDischargeFromPacu(e, surgeryId) {
  e.preventDefault();
  const dest = document.getElementById('pacu-dest').value;
  const pain = document.getElementById('pacu-pain').value;
  const diet = document.getElementById('pacu-diet').value;

  const surg = DAL.findById('Surgeries', surgeryId) || {};

  DAL.update('Surgeries', surgeryId, {
    Status: 'Completed',
    SurgeryStage: 'Completed',
    PacuStatus: dest,
    AldreteScore: 10,
    OperativeNotes: `${surg.OperativeNotes || ''} | Handover: ${dest}. Analgesia: ${pain}. Diet: ${diet}.`,
    UpdatedAt: new Date().toISOString()
  });

  // If patient has an IPD admission, update admission record
  if (surg.AdmissionID) {
    DAL.update('Admissions', surg.AdmissionID, {
      SurgeryStatus: 'Completed',
      CurrentCondition: 'Stable'
    });
  }

  closeModal();
  showToast(`PACU recovery finalized! Patient safely transferred to ${dest}.`, 'success');
  renderMainView();
}

function openWhoChecklistModal(surgeryId) {
  const surg = DAL.findById('Surgeries', surgeryId);
  if (!surg) return;

  openModal(`
    <div class="px-6 py-4 bg-[#002050] text-white flex justify-between items-center">
      <h3 class="font-bold text-sm flex items-center gap-2"><i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i> WHO Surgical Safety Checklist: ${surg.SurgeryNumber}</h3>
      <button onclick="closeModal()" class="text-slate-300 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
    </div>
    <div class="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto custom-scrollbar">
      <div class="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-950">
        <p class="font-bold">Procedure: ${surg.ProcedureName}</p>
        <p class="text-[11px] text-emerald-800">Lead Surgeon: ${surg.LeadSurgeonName} &bull; Anesthesiologist: ${surg.Anesthesiologist}</p>
      </div>

      <div class="space-y-3">
        <div class="p-3 bg-slate-50 border rounded space-y-1.5">
          <p class="font-bold text-blue-900 uppercase">1. Before Induction (Sign In)</p>
          <label class="flex items-center gap-2"><input type="checkbox" checked class="rounded text-blue-600"> Patient confirmed identity, surgical site, procedure, and consent</label>
          <label class="flex items-center gap-2"><input type="checkbox" checked class="rounded text-blue-600"> Surgical site marked / Not applicable</label>
          <label class="flex items-center gap-2"><input type="checkbox" checked class="rounded text-blue-600"> Anesthesia safety check completed (machine, suction, emergency drugs)</label>
          <label class="flex items-center gap-2"><input type="checkbox" checked class="rounded text-blue-600"> Pulse oximeter on patient and functioning</label>
        </div>

        <div class="p-3 bg-slate-50 border rounded space-y-1.5">
          <p class="font-bold text-indigo-900 uppercase">2. Before Skin Incision (Time Out)</p>
          <label class="flex items-center gap-2"><input type="checkbox" checked class="rounded text-blue-600"> Confirm all team members have introduced themselves by name and role</label>
          <label class="flex items-center gap-2"><input type="checkbox" checked class="rounded text-blue-600"> Confirm patient's name, procedure, and where incision will be made</label>
          <label class="flex items-center gap-2"><input type="checkbox" checked class="rounded text-blue-600"> Has antibiotic prophylaxis been given within the last 60 minutes?</label>
          <label class="flex items-center gap-2"><input type="checkbox" checked class="rounded text-blue-600"> Surgeon reviews anticipated critical steps, operative duration, and blood loss</label>
        </div>

        <div class="p-3 bg-slate-50 border rounded space-y-1.5">
          <p class="font-bold text-rose-900 uppercase">3. Before Patient Leaves Room (Sign Out)</p>
          <label class="flex items-center gap-2"><input type="checkbox" checked class="rounded text-blue-600"> Nurse verbally confirms: Name of the procedure that has been recorded</label>
          <label class="flex items-center gap-2"><input type="checkbox" checked class="rounded text-blue-600"> Instrument, sponge and needle counts are confirmed correct</label>
          <label class="flex items-center gap-2"><input type="checkbox" checked class="rounded text-blue-600"> How the specimen is labeled (including patient name)</label>
          <label class="flex items-center gap-2"><input type="checkbox" checked class="rounded text-blue-600"> Surgeon and anesthetist review key concerns for recovery and management</label>
        </div>
      </div>

      <div class="pt-4 border-t flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded text-slate-600">Close</button>
        <button type="button" onclick="showToast('WHO Safety Checklist verified and archived to surgical log.', 'success'); closeModal();" class="px-4 py-2 bg-emerald-600 text-white font-semibold rounded">Save & Confirm Checklist</button>
      </div>
    </div>
  `);
  lucide.createIcons();
}

// ==========================================
// CSSD STERILE PROCESSING ACTION HANDLERS
// ==========================================

function handleTransitionTrayStatus(trayId, nextStatus) {
  DAL.update('SterileTrays', trayId, {
    Status: nextStatus,
    UpdatedAt: new Date().toISOString()
  });
  showToast(`Instrument Tray ${trayId} transitioned to "${nextStatus}".`, 'success');
  renderMainView();
}

function openRunAutoclaveModal(trayId = '') {
  openModal(`
    <div class="px-6 py-4 bg-[#002050] text-white flex justify-between items-center">
      <h3 class="font-bold text-sm flex items-center gap-2"><i data-lucide="play" class="w-4 h-4 text-blue-400"></i> Run Autoclave Sterilization Batch</h3>
      <button onclick="closeModal()" class="text-slate-300 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
    </div>
    <form onsubmit="handleRunAutoclaveCycle(event, '${trayId}')" class="p-6 space-y-4 text-xs">
      <div>
        <label class="block font-semibold text-slate-700 mb-1">Sterilization Chamber *</label>
        <select id="ac-chamber" required class="w-full border rounded p-2 bg-white">
          <option value="Steam Autoclave Chamber 1 (134°C, 3.5 min)">Steam Autoclave Chamber 1 (134°C, 3.5 min)</option>
          <option value="Hydrogen Peroxide Gas Plasma Sterilizer 2 (50°C)">H2O2 Plasma Sterilizer 2 (50°C)</option>
          <option value="Automated Endoscope Reprocessor (AER)">Automated Endoscope Reprocessor (AER)</option>
        </select>
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Sterilization Tech Name *</label>
          <input type="text" id="ac-tech" value="Maria Santos, CRCST" required class="w-full border rounded p-2">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Batch Cycle ID</label>
          <input type="text" id="ac-cycle" value="AUTOCLAVE-CYC-2026-${Math.floor(100 + Math.random() * 900)}" required class="w-full border rounded p-2 font-mono">
        </div>
      </div>
      <div class="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900 space-y-1">
        <p class="font-bold">Biological & Chemical Indicator Simulation:</p>
        <p class="text-[11px] text-blue-800">Class 5 Chemical Integrator strip and Geobacillus stearothermophilus biological vial will be incubated automatically.</p>
      </div>
      <div class="pt-3 border-t flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded text-slate-600">Cancel</button>
        <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded">Run Sterilization Cycle</button>
      </div>
    </form>
  `);
  lucide.createIcons();
}

function handleRunAutoclaveCycle(e, trayId) {
  e.preventDefault();
  const tech = document.getElementById('ac-tech').value;
  const cycle = document.getElementById('ac-cycle').value;

  if (trayId) {
    DAL.update('SterileTrays', trayId, {
      Status: 'Sterile - Ready for OR',
      CycleNumber: cycle,
      TechnicianName: tech,
      ChemicalIndicator: 'Pass',
      BiologicalIndicator: 'Pass',
      SterilizationDate: new Date().toISOString().split('T')[0],
      ExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      UpdatedAt: new Date().toISOString()
    });
  } else {
    // Transition all decontam trays to sterile
    const allTrays = DAL.find('SterileTrays') || [];
    allTrays.forEach(t => {
      if (t.Status.includes('Decontamination') || t.Status.includes('Washing')) {
        DAL.update('SterileTrays', t.TrayID, {
          Status: 'Sterile - Ready for OR',
          CycleNumber: cycle,
          ChemicalIndicator: 'Pass',
          BiologicalIndicator: 'Pass',
          SterilizationDate: new Date().toISOString().split('T')[0],
          ExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
      }
    });
  }

  closeModal();
  showToast(`Autoclave Cycle ${cycle} successfully completed! Trays verified Sterile - Ready for OR.`, 'success');
  renderMainView();
}

function handleReplenishConsumable(itemIndex) {
  showToast('Consumable restock requisition dispatched to Central Supply! Added +20 units.', 'success');
}

function handleUpdateTheaterStatus(theaterId, newStatus) {
  DAL.update('OperationTheaters', theaterId, {
    Status: newStatus,
    UpdatedAt: new Date().toISOString()
  });
  showToast(`Theater ${theaterId} updated to "${newStatus}".`, 'info');
  renderMainView();
}

function openNewSterileTrayModal() {
  const allTrays = DAL.find('SterileTrays') || [];
  const nextId = `CSSD-TRAY-${String(allTrays.length + 1).padStart(3, '0')}`;

  openModal(`
    <div class="px-6 py-4 bg-[#002050] text-white flex justify-between items-center">
      <h3 class="font-bold text-sm flex items-center gap-2"><i data-lucide="sparkles" class="w-4 h-4 text-emerald-400"></i> Register New CSSD Instrument Set</h3>
      <button onclick="closeModal()" class="text-slate-300 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
    </div>
    <form onsubmit="handleCreateSterileTray(event)" class="p-6 space-y-4 text-xs">
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Tray ID *</label>
          <input type="text" id="new-tray-id" value="${nextId}" required class="w-full border rounded p-2 font-mono font-bold bg-slate-50">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Department *</label>
          <select id="new-tray-dept" required class="w-full border rounded p-2 bg-white">
            <option value="General Surgery">General Surgery</option>
            <option value="Orthopedics">Orthopedics</option>
            <option value="Cardiothoracic">Cardiothoracic</option>
            <option value="Minimally Invasive">Minimally Invasive</option>
            <option value="Trauma / Emergency">Trauma / Emergency</option>
            <option value="Vascular">Vascular</option>
          </select>
        </div>
      </div>
      <div>
        <label class="block font-semibold text-slate-700 mb-1">Instrument Set Name *</label>
        <input type="text" id="new-tray-name" placeholder="e.g. Major Vascular Shunt Set" required class="w-full border rounded p-2">
      </div>
      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Total Instruments (pieces) *</label>
          <input type="number" id="new-tray-count" value="36" required class="w-full border rounded p-2">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Sterilization Method *</label>
          <select id="new-tray-method" required class="w-full border rounded p-2 bg-white">
            <option value="High-Pressure Steam Autoclave (134°C, 3.5 min)">High-Pressure Steam Autoclave</option>
            <option value="Low-Temp Hydrogen Peroxide Gas Plasma">H2O2 Gas Plasma</option>
            <option value="High-Level Automated Endoscope Reprocessor">AER Disinfection</option>
          </select>
        </div>
      </div>
      <div class="pt-3 border-t flex justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 border rounded text-slate-600">Cancel</button>
        <button type="submit" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded">Save Instrument Set</button>
      </div>
    </form>
  `);
  lucide.createIcons();
}

function handleCreateSterileTray(e) {
  e.preventDefault();
  const id = document.getElementById('new-tray-id').value.trim();
  const dept = document.getElementById('new-tray-dept').value;
  const name = document.getElementById('new-tray-name').value.trim();
  const count = parseInt(document.getElementById('new-tray-count').value) || 20;
  const method = document.getElementById('new-tray-method').value;

  const newTray = {
    TrayID: id,
    TrayNumber: `CSSD-SET-${Math.floor(10 + Math.random() * 90)}`,
    TrayName: name,
    Department: dept,
    TotalInstruments: count,
    SterilizationMethod: method,
    SterilizationDate: new Date().toISOString().split('T')[0],
    ExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    CycleNumber: `AUTOCLAVE-CYC-2026-${Math.floor(100 + Math.random() * 900)}`,
    ChemicalIndicator: 'Pass',
    BiologicalIndicator: 'Pass',
    Status: 'Sterile - Ready for OR',
    AssignedSurgeryID: '',
    TechnicianName: 'Maria Santos, CRCST',
    CreatedAt: new Date().toISOString(),
    UpdatedAt: new Date().toISOString()
  };

  DAL.create('SterileTrays', newTray);
  closeModal();
  showToast(`Sterile instrument set "${name}" added to CSSD inventory!`, 'success');
  renderMainView();
}


// ==========================================
// 15. GOOGLE SHEETS SETTINGS MODAL
// ==========================================
function openSyncSettingsModal() {
  openModal(`
    <div class="px-6 py-4 bg-[#002050] text-white flex justify-between items-center">
      <h3 class="font-bold text-sm flex items-center gap-2"><i data-lucide="sheet" class="w-4 h-4 text-emerald-400"></i> Google Sheets Data Source Configuration</h3>
      <button onclick="closeModal()" class="text-slate-300 hover:text-white"><i data-lucide="x" class="w-4 h-4"></i></button>
    </div>
    <div class="p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh] custom-scrollbar">
      <div class="p-3 bg-blue-50 border border-blue-200 rounded text-blue-900 leading-relaxed">
        <strong>Google Sheets & Dataverse Compatibility Mode:</strong><br>
        This prototype is currently running with the fast client-side active repository preloaded with 260+ sample records.
        To synchronize live with your Google Sheets spreadsheet, paste your Google Apps Script Web App URL below.
      </div>
      <div class="space-y-3">
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Google Apps Script Web App URL</label>
          <input type="url" id="cfg-sheet-url" value="${APP_CONFIG.appsScriptUrl || ''}" placeholder="https://script.google.com/macros/s/.../exec" class="w-full border border-slate-300 rounded p-2 font-mono">
        </div>
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Google Spreadsheet ID (Optional)</label>
          <input type="text" id="cfg-sheet-id" value="${APP_CONFIG.spreadsheetId || ''}" placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms" class="w-full border border-slate-300 rounded p-2 font-mono">
        </div>
        <div class="flex items-center gap-2">
          <input type="checkbox" id="cfg-enable-sync" ${APP_CONFIG.useGoogleSheetsSync ? 'checked' : ''} class="rounded text-blue-600">
          <label for="cfg-enable-sync" class="font-semibold text-slate-700 cursor-pointer">Enable Live Background Sync with Google Sheets</label>
        </div>
      </div>
      <div class="p-3 bg-slate-50 border border-slate-200 rounded space-y-2">
        <h4 class="font-bold text-slate-800">Available Synchronization Actions</h4>
        <div class="flex flex-wrap gap-2">
          <button onclick="testGoogleSheetsConnection()" class="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded flex items-center gap-1">
            <i data-lucide="wifi" class="w-3.5 h-3.5"></i> Test Connection
          </button>
          <button onclick="pushAllToGoogleSheets()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded flex items-center gap-1">
            <i data-lucide="upload-cloud" class="w-3.5 h-3.5"></i> Export Local Data to Google Sheets
          </button>
          <button onclick="pullAllFromGoogleSheets()" class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded flex items-center gap-1">
            <i data-lucide="download-cloud" class="w-3.5 h-3.5"></i> Pull Live from Google Sheets
          </button>
        </div>
        <div id="sync-test-result" class="text-[11px] font-mono text-slate-600 pt-1"></div>
      </div>
      <div class="pt-4 border-t flex justify-end gap-2">
        <button onclick="closeModal()" class="px-4 py-2 border rounded text-slate-600">Close</button>
        <button onclick="saveSyncSettings()" class="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">Save Configuration</button>
      </div>
    </div>
  `);
}

function saveSyncSettings() {
  APP_CONFIG.appsScriptUrl = document.getElementById('cfg-sheet-url').value.trim();
  APP_CONFIG.spreadsheetId = document.getElementById('cfg-sheet-id').value.trim();
  APP_CONFIG.useGoogleSheetsSync = document.getElementById('cfg-enable-sync').checked;
  localStorage.setItem(APP_CONFIG.settingsKey, JSON.stringify(APP_CONFIG));
  closeModal();
  showToast('Google Sheets settings saved!', 'success');
}

async function testGoogleSheetsConnection() {
  const url = document.getElementById('cfg-sheet-url').value.trim();
  const out = document.getElementById('sync-test-result');
  if (!url) {
    if (out) out.innerHTML = '<span class="text-amber-600">Please enter a Web App URL first.</span>';
    return;
  }
  if (out) out.innerHTML = '<span class="text-blue-600 animate-pulse">Pinging Google Apps Script endpoint...</span>';
  try {
    const res = await fetch(url + '?action=status');
    const data = await res.json();
    if (out) out.innerHTML = `<span class="text-emerald-600 font-bold">&check; Connection Successful! Status: ${data.status} &bull; System: ${data.system}</span>`;
  } catch (e) {
    if (out) out.innerHTML = `<span class="text-rose-600 font-bold">&cross; Connection test failed: ${e.message}</span>`;
  }
}

async function pushAllToGoogleSheets() {
  const url = document.getElementById('cfg-sheet-url').value.trim();
  if (!url) {
    showToast('Please specify the Google Apps Script Web App URL first.', 'warning');
    return;
  }
  showToast('Pushing 260+ records to Google Sheets...', 'info');
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'seedAll' })
    });
    const json = await res.json();
    showToast('Google Sheets initialized with all 16 tables!', 'success');
  } catch (e) {
    showToast('Sync request error: ' + e.message, 'error');
  }
}

async function pullAllFromGoogleSheets() {
  const url = document.getElementById('cfg-sheet-url').value.trim();
  if (!url) {
    showToast('Please specify the Google Apps Script Web App URL first.', 'warning');
    return;
  }
  showToast('Fetching latest records from Google Sheets...', 'info');
  try {
    const res = await fetch(url + '?action=getAllData');
    const json = await res.json();
    if (json.success && json.data) {
      Object.assign(DAL.db, json.data);
      DAL.persist();
      showToast('Local cache updated with live Google Sheets data!', 'success');
      renderMainView();
    }
  } catch (e) {
    showToast('Failed to pull from Google Sheets: ' + e.message, 'error');
  }
}

// ==========================================
// 16. GUIDED END-TO-END DEMO WORKFLOW
// ==========================================
const DEMO_STEPS = [
  {
    step: 1,
    role: 'Receptionist',
    view: 'patients',
    title: 'Step 1: Receptionist - Patient Registration',
    text: 'Switch persona to <strong>Receptionist</strong>. Click <strong>+ New Patient</strong> in the top ribbon to register a new patient or locate Eleanor Vance (MRN-2026-0001).'
  },
  {
    step: 2,
    role: 'Receptionist',
    view: 'appointments',
    title: 'Step 2: Receptionist - Appointment & Check-In',
    text: 'Navigate to <strong>Appointments</strong>. Demonstrate booking an appointment and clicking <strong>Check In</strong>. Notice that double-booking rules automatically prevent conflicting schedules.'
  },
  {
    step: 3,
    role: 'Nurse',
    view: 'visits',
    title: 'Step 3: Nurse - OPD Triage & Vital Signs',
    text: 'Switch persona to <strong>Nurse</strong>. In <strong>OPD Encounters</strong>, click <strong>OPD Process</strong> on any arrived patient to enter Stage 1: Triage Acuity, Blood Pressure, Heart Rate, and automated BMI.'
  },
  {
    step: 4,
    role: 'Doctor',
    view: 'visits',
    title: 'Step 4: Doctor - Consultation & Investigation Decision',
    text: 'Switch persona to <strong>Doctor</strong>. In Stage 2 Consultation, document clinical exam, ICD-10 diagnosis, and test the <strong>Branching Decision</strong>: choose <strong>YES</strong> to order diagnostic services (X-Ray, CT, Echo, Labo) or <strong>NO</strong> to skip directly to Prescription.'
  },
  {
    step: 5,
    role: 'Doctor',
    view: 'visits',
    title: 'Step 5: Diagnostics - Order Services (X-Ray, CT, Echo, Labo)',
    text: 'In Stage 3 Investigation, order Radiology Imaging (Chest X-Ray, Brain CT), Cardiology (2D Echo), or Laboratory tests. Click <strong>Simulate Result Ready</strong> to view instant radiologist/pathologist findings!'
  },
  {
    step: 6,
    role: 'Pharmacist',
    view: 'prescriptions',
    title: 'Step 6: Pharmacist & Doctor - Prescription & Stock Check',
    text: 'In Stage 4 Prescription, order medications from the hospital formulary. Notice live inventory stock validation and automated stock quantity depletion upon ordering.'
  },
  {
    step: 7,
    role: 'Accountant',
    view: 'visits',
    title: 'Step 7: Discharge Clearance & Automated Consolidated Invoice',
    text: 'In Stage 5 Discharge, set patient disposition, schedule clinical follow-up, and click <strong>Finalize OPD Encounter</strong> to generate the itemized invoice (Consultation + Investigation services + Pharmacy drugs).'
  }
];

function startGuidedDemo() {
  appState.isTourActive = true;
  appState.demoStep = 1;
  const panel = document.getElementById('guided-tour-panel');
  if (panel) panel.classList.remove('hidden');
  applyDemoStep(appState.demoStep);
}

function stopGuidedDemo() {
  appState.isTourActive = false;
  const panel = document.getElementById('guided-tour-panel');
  if (panel) panel.classList.add('hidden');
}

function nextDemoStep() {
  if (appState.demoStep < DEMO_STEPS.length) {
    appState.demoStep++;
    applyDemoStep(appState.demoStep);
  } else {
    stopGuidedDemo();
    navigateTo('dashboard');
    showToast('Guided Tour Complete! Viewing Executive Healthcare Dashboard.', 'success');
  }
}

function prevDemoStep() {
  if (appState.demoStep > 1) {
    appState.demoStep--;
    applyDemoStep(appState.demoStep);
  }
}

function applyDemoStep(stepNumber) {
  const step = DEMO_STEPS[stepNumber - 1];
  if (!step) return;

  // Switch role persona
  if (step.role !== 'Laboratory') {
    handleRoleSwitch(step.role, false);
  }
  // Navigate to target view
  navigateTo(step.view);

  // Update guided tour UI
  const content = document.getElementById('guided-tour-content');
  const counter = document.getElementById('guided-tour-counter');
  if (content) {
    content.innerHTML = `
      <h5 class="font-bold text-slate-900 text-xs">${step.title}</h5>
      <p class="text-[11px] text-slate-600 leading-relaxed">${step.text}</p>
    `;
  }
  if (counter) {
    counter.textContent = `Step ${stepNumber} of ${DEMO_STEPS.length}`;
  }
  lucide.createIcons();
}

// ==========================================
// 17. GLOBAL SEARCH & FILTERING UTILITIES
// ==========================================
let _globalSearchTimer = null;
function handleGlobalSearch(e) {
  const inputVal = e.target.value;
  const clearBtn = document.getElementById('clear-search-btn');

  if (clearBtn) {
    clearBtn.classList.toggle('hidden', inputVal.trim().length === 0);
  }

  if (e.key === 'Escape') {
    clearGlobalSearch();
    return;
  }

  if (e.key === 'Enter') {
    clearTimeout(_globalSearchTimer);
    executeGlobalSearch(inputVal);
    return;
  }

  clearTimeout(_globalSearchTimer);
  _globalSearchTimer = setTimeout(() => {
    executeGlobalSearch(inputVal);
  }, 120);
}

function executeGlobalSearch(rawQuery) {
  const query = (rawQuery || '').trim().toLowerCase();
  const dropdown = document.getElementById('search-results-dropdown');
  if (!dropdown) return;

  if (query.length < 2) {
    dropdown.classList.add('hidden');
    dropdown.innerHTML = '';
    return;
  }

  // Multi-entity search across Patients, Doctors, Appointments, Invoices
  const patients = DAL.find('Patients').filter(p => 
    `${p.FirstName} ${p.LastName}`.toLowerCase().includes(query) ||
    p.PatientNumber.toLowerCase().includes(query) ||
    (p.PhoneNumber && p.PhoneNumber.includes(query))
  );
  const doctors = DAL.find('Doctors').filter(d => 
    d.DoctorName.toLowerCase().includes(query) ||
    d.Specialization.toLowerCase().includes(query)
  );
  const appointments = DAL.find('Appointments').filter(a => 
    a.AppointmentNumber.toLowerCase().includes(query) ||
    a.ReasonForVisit.toLowerCase().includes(query)
  );
  const invoices = DAL.find('Invoices').filter(i => 
    i.InvoiceNumber.toLowerCase().includes(query)
  );
  const emergencies = (DAL.find('EmergencyEncounters') || []).filter(e =>
    (e.EncounterNumber && e.EncounterNumber.toLowerCase().includes(query)) ||
    (e.ChiefComplaint && e.ChiefComplaint.toLowerCase().includes(query)) ||
    (e.PrimaryDiagnosis && e.PrimaryDiagnosis.toLowerCase().includes(query))
  );

  const totalResults = patients.length + doctors.length + appointments.length + invoices.length + emergencies.length;
  if (totalResults === 0) {
    dropdown.innerHTML = `<div class="p-3 text-xs text-slate-500">No records found matching "${query}"</div>`;
    dropdown.classList.remove('hidden');
    return;
  }

  dropdown.innerHTML = `
    <div class="p-2 bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-500 tracking-wider">Search Results (${totalResults})</div>
    <div class="divide-y divide-slate-100 text-xs">
      ${patients.map(p => `
        <div onclick="openPatientRecord('${p.PatientID}'); clearGlobalSearch();" class="p-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center">
          <div>
            <span class="font-bold text-slate-900">${p.FirstName} ${p.LastName}</span>
            <span class="text-slate-500 text-[11px]"> &bull; ${p.PatientNumber} &bull; ${p.PhoneNumber}</span>
          </div>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">Patient</span>
        </div>
      `).join('')}
      ${emergencies.map(e => `
        <div onclick="openEmergencyWorkflow('${e.EncounterID}'); clearGlobalSearch();" class="p-2 hover:bg-rose-50 cursor-pointer flex justify-between items-center">
          <div>
            <span class="font-bold text-slate-900">${e.EncounterNumber}</span>
            <span class="text-slate-500 text-[11px]"> &bull; ESI-${e.EsiLevel} &bull; ${e.ChiefComplaint || 'Emergency'}</span>
          </div>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-semibold">Emergency</span>
        </div>
      `).join('')}
      ${doctors.map(d => `
        <div onclick="navigateTo('doctors'); clearGlobalSearch();" class="p-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center">
          <div>
            <span class="font-bold text-slate-900">${d.DoctorName}</span>
            <span class="text-slate-500 text-[11px]"> &bull; ${d.Specialization}</span>
          </div>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-semibold">Doctor</span>
        </div>
      `).join('')}
      ${appointments.map(a => `
        <div onclick="navigateTo('appointments'); clearGlobalSearch();" class="p-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center">
          <div>
            <span class="font-bold text-slate-900">${a.AppointmentNumber}</span>
            <span class="text-slate-500 text-[11px]"> &bull; ${a.AppointmentDate} @ ${a.StartTime}</span>
          </div>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-semibold">Appointment</span>
        </div>
      `).join('')}
      ${invoices.map(i => `
        <div onclick="navigateTo('billing'); clearGlobalSearch();" class="p-2 hover:bg-blue-50 cursor-pointer flex justify-between items-center">
          <div>
            <span class="font-bold text-slate-900">${i.InvoiceNumber}</span>
            <span class="text-slate-500 text-[11px]"> &bull; Balance: $${i.Balance.toFixed(2)}</span>
          </div>
          <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">Invoice</span>
        </div>
      `).join('')}
    </div>
  `;
  dropdown.classList.remove('hidden');
}

function clearGlobalSearch() {
  const input = document.getElementById('global-search-input');
  const dropdown = document.getElementById('search-results-dropdown');
  const clearBtn = document.getElementById('clear-search-btn');
  if (input) input.value = '';
  if (dropdown) dropdown.classList.add('hidden');
  if (clearBtn) clearBtn.classList.add('hidden');
}

let _gridSearchTimer = null;
function handleGridSearch(e) {
  const val = e.target.value;
  clearTimeout(_gridSearchTimer);
  if (e.key === 'Enter') {
    appState.searchTerm = val.trim().toLowerCase();
    renderMainView();
    restoreGridSearchFocus();
    return;
  }
  _gridSearchTimer = setTimeout(() => {
    appState.searchTerm = val.trim().toLowerCase();
    renderMainView();
    restoreGridSearchFocus();
  }, 120);
}

function restoreGridSearchFocus() {
  const activeInput = document.querySelector('input[onkeyup*="handleGridSearch"]');
  if (activeInput) {
    activeInput.focus();
    const len = activeInput.value.length;
    activeInput.setSelectionRange(len, len);
  }
}

function filterAndSortRecords(list, searchFields = []) {
  let result = [...list];

  // System view filtering
  if (appState.selectedViewFilter === 'scheduled') {
    result = result.filter(r => ['Scheduled', 'Confirmed'].includes(r.Status));
  } else if (appState.selectedViewFilter === 'completed') {
    result = result.filter(r => r.Status === 'Completed' || r.VisitStatus === 'Completed');
  } else if (appState.selectedViewFilter === 'inactive') {
    result = result.filter(r => r.PatientStatus === 'Inactive' || r.Status === 'Inactive');
  } else if (appState.selectedViewFilter === 'default' && result.length > 0 && result[0].PatientStatus !== undefined) {
    result = result.filter(r => r.PatientStatus === 'Active');
  }

  // Text search filter
  if (appState.searchTerm) {
    result = result.filter(item => {
      for (const field of searchFields) {
        if (item[field] && String(item[field]).toLowerCase().includes(appState.searchTerm)) {
          return true;
        }
      }
      return false;
    });
  }

  // Sorting
  if (appState.sortColumn) {
    const col = appState.sortColumn;
    const dir = appState.sortDirection === 'asc' ? 1 : -1;
    result.sort((a, b) => {
      const vA = a[col] !== undefined ? a[col] : '';
      const vB = b[col] !== undefined ? b[col] : '';
      if (typeof vA === 'number' && typeof vB === 'number') return (vA - vB) * dir;
      return String(vA).localeCompare(String(vB)) * dir;
    });
  }

  return result;
}

function sortGrid(colName) {
  if (appState.sortColumn === colName) {
    appState.sortDirection = appState.sortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    appState.sortColumn = colName;
    appState.sortDirection = 'asc';
  }
  renderMainView();
}

function renderSortIcon(colName) {
  if (appState.sortColumn !== colName) return '';
  return appState.sortDirection === 'asc' ? '&uarr;' : '&darr;';
}

function handleViewFilterChange(val) {
  appState.selectedViewFilter = val;
  renderMainView();
}

function refreshCurrentView() {
  renderMainView();
  showToast('View refreshed.', 'info');
}

// ==========================================
// 18. ROLE SWITCHER & UI HELPERS
// ==========================================
function handleRoleSwitch(roleName, showNotification = true) {
  if (!USER_PERSONAS[roleName]) return;
  appState.currentRole = roleName;

  const role = USER_PERSONAS[roleName];
  const selector = document.getElementById('role-selector');
  if (selector) selector.value = roleName;

  const avatar = document.getElementById('user-avatar-badge');
  if (avatar) {
    avatar.textContent = role.avatar;
    avatar.className = `w-7 h-7 rounded-full ${role.color} text-white font-bold text-xs flex items-center justify-center border border-white/20`;
  }

  const nameDisplay = document.getElementById('user-name-display');
  const roleDisplay = document.getElementById('user-role-display');
  if (nameDisplay) nameDisplay.textContent = role.fullName;
  if (roleDisplay) roleDisplay.textContent = role.roleName;

  // Filter Left Nav Sitemap based on role permissions
  document.querySelectorAll('#sidebar .nav-btn').forEach(btn => {
    const viewId = btn.id.replace('nav-', '');
    if (role.allowedViews.includes(viewId)) {
      btn.classList.remove('hidden');
    } else {
      btn.classList.add('hidden');
    }
  });

  if (showNotification) {
    showToast(`Switched active role persona to: ${roleName}`, 'info');
  }

  // If current view not allowed, redirect to dashboard
  if (!role.allowedViews.includes(appState.currentView)) {
    navigateTo('dashboard');
  } else {
    renderMainView();
  }
}

function getStatusBadge(status) {
  const s = String(status || '').trim();
  let color = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = s;

  if (typeof i18n !== 'undefined' && i18n.currentLang === 'kh') {
    const statusMap = {
      'Active': 'សកម្ម',
      'Inactive': 'អសកម្ម',
      'Completed': 'បានបញ្ចប់',
      'Paid': 'បានបង់ប្រាក់',
      'Partially Paid': 'បានបង់ខ្លះ',
      'Unpaid': 'មិនទាន់បង់',
      'Scheduled': 'បានកំណត់',
      'Confirmed': 'បានបញ្ជាក់',
      'Checked In': 'បានចុះឈ្មោះ',
      'In Consultation': 'កំពុងពិគ្រោះ',
      'Pending': 'កំពុងរង់ចាំ',
      'In Progress': 'កំពុងដំណើរការ',
      'Cancelled': 'បានបោះបង់',
      'No Show': 'មិនបានមក',
      'Available': 'ទំនេរ',
      'Occupied': 'មានអ្នកជំងឺ',
      'Cleaning': 'កំពុងសម្អាត',
      'Maintenance': 'កំពុងជួសជុល',
      'Discharged': 'ចេញពីពេទ្យ',
      'Admitted': 'សម្រាកព្យាបាល',
      'Normal': 'ធម្មតា',
      'High': 'ខ្ពស់',
      'Critical': 'អាសន្ន',
      'Critical High': 'ខ្ពស់កម្រិតអាសន្ន',
      'Critical Low': 'ទាបកម្រិតអាសន្ន',
      'Abnormal': 'មិនប្រក្រតី',
      'Low Stock': 'ខ្វះស្តុក',
      'In Stock': 'មានក្នុងស្តុក',
      'Out of Stock': 'ដាច់ស្តុក'
    };
    if (statusMap[s]) label = statusMap[s];
  }

  if (['Active', 'In Stock', 'Completed', 'Paid', 'Normal'].includes(s)) {
    color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['Scheduled', 'Confirmed', 'Processing', 'Sample Collected', 'Partially Paid', 'Moderate'].includes(s)) {
    color = 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (['Checked In', 'In Consultation', 'Low Stock', 'Draft', 'Pending'].includes(s)) {
    color = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['Cancelled', 'No Show', 'Inactive', 'Deceased', 'Unpaid', 'Out of Stock', 'Severe', 'Critical High', 'Critical Low', 'Abnormal'].includes(s)) {
    color = 'bg-rose-50 text-rose-700 border-rose-200';
  }

  return `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${color}">${label}</span>`;
}

function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  let bg = 'bg-slate-900 text-white';
  let icon = 'info';
  if (type === 'success') {
    bg = 'bg-emerald-700 text-white';
    icon = 'check-circle';
  } else if (type === 'error') {
    bg = 'bg-rose-700 text-white';
    icon = 'alert-circle';
  } else if (type === 'warning') {
    bg = 'bg-amber-600 text-white';
    icon = 'alert-triangle';
  }

  toast.className = `fixed bottom-5 left-1/2 -translate-x-1/2 z-50 transform transition-all duration-200 flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold ${bg}`;
  toast.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4"></i><span>${message}</span>`;
  refreshIcons(toast);

  setTimeout(() => {
    toast.className += ' translate-y-20 opacity-0';
  }, 3500);
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.toggle('hidden');
}

function openGenericRecord(entityName, recordId) {
  const rec = DAL.findById(entityName, recordId);
  if (!rec) {
    showToast(`Record ${recordId} not found in ${entityName}`, 'error');
    return;
  }
  appState.selectedEntity = rec;
  appState.activeRecordType = entityName;
  renderMainView();
  renderRibbon();
}

function renderGenericRecordForm(entityName, record) {
  const pk = DAL.getPrimaryKey(entityName);
  const id = record[pk] || 'NEW';
  const entityTitle = formatEntityTitle(entityName);
  
  // Choose an icon based on entity
  let icon = 'file-text';
  if (entityName === 'Appointments') icon = 'calendar';
  else if (entityName === 'Visits') icon = 'stethoscope';
  else if (entityName === 'Diagnoses') icon = 'clipboard-check';
  else if (entityName === 'Prescriptions') icon = 'pill';
  else if (entityName === 'Medications') icon = 'package';
  else if (entityName === 'LaboratoryTests' || entityName === 'LaboratoryResults') icon = 'flask-conical';
  else if (entityName === 'Invoices') icon = 'receipt';
  else if (entityName === 'Payments') icon = 'credit-card';
  else if (entityName === 'Doctors') icon = 'user-check';
  else if (entityName === 'Departments') icon = 'building-2';
  else if (entityName === 'FollowUps') icon = 'phone-call';
  else if (entityName === 'Users') icon = 'users';
  else if (entityName === 'SecurityRoles') icon = 'shield';
  else if (entityName === 'Admissions') icon = 'hospital';
  else if (entityName === 'Beds') icon = 'bed';
  else if (entityName === 'EmergencyEncounters') icon = 'siren';
  else if (entityName === 'EmergencyBays') icon = 'layout-grid';

  // Get status or status-like field
  const statusVal = record.Status || record.PaymentStatus || record.BedStatus || record.VisitStatus || record.PatientStatus || null;
  const statusBadge = statusVal ? getStatusBadge(statusVal) : '';

  // Get primary title field
  const titleField = record.PatientNumber || record.AppointmentNumber || record.VisitNumber || record.PrescriptionNumber || record.InvoiceNumber || record.AdmissionNumber || record.EncounterNumber || record.BedNumber || record.BayNumber || record.FullName || record.DoctorName || record.DepartmentName || record.RoleName || record.TestName || id;

  // Build field inputs
  const allPatients = DAL.find('Patients') || [];
  const allDoctors = DAL.find('Doctors') || [];
  const allBeds = DAL.find('Beds') || [];

  const keys = Object.keys(record);

  const fieldsHtml = keys.map(key => {
    const val = record[key];
    const isPk = key === pk;

    if (isPk) {
      return `
        <div>
          <label class="block text-slate-500 font-semibold text-[11px] mb-1 flex items-center gap-1">
            <i data-lucide="lock" class="w-3 h-3 text-slate-400"></i> ${key} (Primary Key)
          </label>
          <input type="text" name="${key}" value="${val || ''}" readonly disabled class="w-full bg-slate-100 border border-slate-200 text-slate-600 rounded px-2.5 py-1.5 font-mono text-xs cursor-not-allowed">
        </div>
      `;
    }

    if (key === 'PatientID') {
      return `
        <div>
          <label class="block text-slate-700 font-semibold text-[11px] mb-1 flex items-center gap-1">
            <i data-lucide="user" class="w-3 h-3 text-blue-500"></i> Patient
          </label>
          <select name="${key}" class="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
            <option value="">-- Select Patient --</option>
            ${allPatients.map(p => `<option value="${p.PatientID}" ${p.PatientID === val ? 'selected' : ''}>${p.PatientNumber} - ${p.FirstName} ${p.LastName}</option>`).join('')}
          </select>
        </div>
      `;
    }

    if (key === 'DoctorID' || key === 'AssignedDoctorID') {
      return `
        <div>
          <label class="block text-slate-700 font-semibold text-[11px] mb-1 flex items-center gap-1">
            <i data-lucide="user-check" class="w-3 h-3 text-teal-500"></i> Doctor / Physician
          </label>
          <select name="${key}" class="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500">
            <option value="">-- Select Doctor --</option>
            ${allDoctors.map(d => `<option value="${d.DoctorID}" ${d.DoctorID === val ? 'selected' : ''}>${d.DoctorName} (${d.Specialization || 'Physician'})</option>`).join('')}
          </select>
        </div>
      `;
    }

    if (key === 'BedID') {
      return `
        <div>
          <label class="block text-slate-700 font-semibold text-[11px] mb-1 flex items-center gap-1">
            <i data-lucide="bed" class="w-3 h-3 text-indigo-500"></i> Assigned Bed
          </label>
          <select name="${key}" class="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500">
            <option value="">-- Select Bed --</option>
            ${allBeds.map(b => `<option value="${b.BedID}" ${b.BedID === val ? 'selected' : ''}>${b.BedNumber} (${b.WardName} - ${b.RoomType})</option>`).join('')}
          </select>
        </div>
      `;
    }

    // Long text / textarea fields
    const isTextArea = ['Notes', 'Remarks', 'Instructions', 'MedicalConditions', 'Allergies', 'ChiefComplaint', 'DiagnosisSummary', 'Findings', 'TriageAssessment', 'Impression', 'TreatmentSummary', 'Description', 'ClinicalSummary', 'DischargeSummary'].includes(key);
    if (isTextArea) {
      return `
        <div class="col-span-full">
          <label class="block text-slate-700 font-semibold text-[11px] mb-1">${key}</label>
          <textarea name="${key}" rows="3" class="w-full bg-white border border-slate-300 rounded p-2 text-xs focus:ring-1 focus:ring-blue-500">${val !== undefined && val !== null ? String(val) : ''}</textarea>
        </div>
      `;
    }

    // Date fields
    const isDate = key.endsWith('Date') || key === 'DateOfBirth' || key === 'AdmitDate' || key === 'DischargeDate';
    if (isDate) {
      return `
        <div>
          <label class="block text-slate-700 font-semibold text-[11px] mb-1 flex items-center gap-1">
            <i data-lucide="calendar" class="w-3 h-3 text-slate-400"></i> ${key}
          </label>
          <input type="date" name="${key}" value="${val || ''}" class="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500">
        </div>
      `;
    }

    // Number fields
    if (typeof val === 'number') {
      return `
        <div>
          <label class="block text-slate-700 font-semibold text-[11px] mb-1">${key}</label>
          <input type="number" step="any" name="${key}" value="${val !== undefined && val !== null ? val : ''}" class="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500">
        </div>
      `;
    }

    // Status or known select
    if (['Status', 'PaymentStatus', 'BedStatus', 'VisitStatus', 'PatientStatus', 'Priority', 'Gender'].includes(key)) {
      let options = [];
      if (key === 'Status' || key === 'VisitStatus' || key === 'PatientStatus') {
        options = ['Active', 'Inactive', 'Scheduled', 'In Progress', 'Completed', 'Discharged', 'Cancelled', 'Admitted', 'Triage'];
      } else if (key === 'PaymentStatus') {
        options = ['Paid', 'Partially Paid', 'Pending', 'Overdue'];
      } else if (key === 'BedStatus') {
        options = ['Occupied', 'Available', 'Cleaning', 'Maintenance'];
      } else if (key === 'Priority') {
        options = ['Routine', 'Urgent', 'STAT'];
      } else if (key === 'Gender') {
        options = ['Male', 'Female', 'Other'];
      }
      if (!options.includes(val) && val) options.push(val);

      return `
        <div>
          <label class="block text-slate-700 font-semibold text-[11px] mb-1">${key}</label>
          <select name="${key}" class="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 font-semibold">
            ${options.map(opt => `<option value="${opt}" ${opt === val ? 'selected' : ''}>${opt}</option>`).join('')}
          </select>
        </div>
      `;
    }

    // Standard string input
    return `
      <div>
        <label class="block text-slate-700 font-semibold text-[11px] mb-1">${key}</label>
        <input type="text" name="${key}" value="${val !== undefined && val !== null ? String(val) : ''}" class="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-blue-500">
      </div>
    `;
  }).join('');

  return `
    <div class="space-y-4 pb-12">
      <!-- Breadcrumb & Header Bar -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-lg bg-[#002050] text-white flex items-center justify-center shadow-xs">
            <i data-lucide="${icon}" class="w-5 h-5 text-blue-300"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-slate-500 font-semibold uppercase tracking-wider">${entityTitle}</span>
              <span class="text-slate-300">&bull;</span>
              <h1 class="text-base font-bold text-slate-900">${titleField}</h1>
              ${statusBadge}
            </div>
            <p class="text-[11px] text-slate-500">Record ID: <span class="font-mono font-semibold text-slate-700">${id}</span></p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button type="button" onclick="saveRecordForm()" class="flex items-center gap-1.5 px-3 py-1.5 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold rounded shadow-xs transition">
            <i data-lucide="save" class="w-3.5 h-3.5"></i>
            <span>Save & Close</span>
          </button>
          <button type="button" onclick="navigateTo('${appState.currentView}')" class="flex items-center gap-1.5 px-2.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded transition">
            <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
            <span>Back to List</span>
          </button>
        </div>
      </div>

      <!-- Main Form Container -->
      <div class="bg-white rounded-lg border border-slate-200 shadow-xs p-5">
        <form id="generic-record-form" onsubmit="event.preventDefault(); saveRecordForm();" class="space-y-6">
          <div class="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h2 class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <i data-lucide="sliders" class="w-4 h-4 text-blue-600"></i> General Information & Attributes
            </h2>
            <span class="text-[11px] text-slate-500">Dynamics 365 Model-driven Form</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${fieldsHtml}
          </div>

          <div class="pt-5 border-t border-slate-200 flex items-center justify-between">
            <button type="button" onclick="deactivateCurrentRecord()" class="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> Deactivate Record
            </button>
            <div class="flex items-center gap-2">
              <button type="button" onclick="navigateTo('${appState.currentView}')" class="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="submit" class="px-4 py-1.5 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold rounded shadow-xs flex items-center gap-1.5">
                <i data-lucide="check" class="w-3.5 h-3.5"></i> Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;
}

function saveRecordForm() {
  if (!appState.activeRecordType || !appState.selectedEntity) return;

  const form = document.getElementById('generic-record-form');
  if (!form) {
    showToast(`${appState.activeRecordType} record saved.`, 'success');
    appState.activeRecordType = null;
    appState.selectedEntity = null;
    renderMainView();
    renderRibbon();
    return;
  }

  const formData = new FormData(form);
  const updatedData = {};
  const orig = appState.selectedEntity;
  const pk = DAL.getPrimaryKey(appState.activeRecordType);
  const id = orig[pk];

  for (const [key, value] of formData.entries()) {
    if (key === pk) continue;
    if (typeof orig[key] === 'number') {
      updatedData[key] = value === '' ? 0 : Number(value);
    } else {
      updatedData[key] = value;
    }
  }

  DAL.update(appState.activeRecordType, id, updatedData);
  showToast(`${formatEntityTitle(appState.activeRecordType)} record updated successfully!`, 'success');
  appState.activeRecordType = null;
  appState.selectedEntity = null;
  renderMainView();
  renderRibbon();
}

function printRecord() {
  window.print();
}

function deactivateCurrentRecord() {
  if (!appState.activeRecordType || !appState.selectedEntity) return;
  const pk = DAL.getPrimaryKey(appState.activeRecordType);
  const id = appState.selectedEntity[pk];
  if (confirm(`Are you sure you want to deactivate this ${appState.activeRecordType} record?`)) {
    DAL.delete(appState.activeRecordType, id);
    showToast('Record deactivated.', 'info');
    navigateTo(appState.currentView);
  }
}

// ==========================================
// 19. BILINGUAL LANGUAGE SYSTEM (ENGLISH & KHMER ភាសាខ្មែរ)
// ==========================================
function applyTranslations() {
  const currentLang = (typeof i18n !== 'undefined' && i18n.currentLang) || 'en';
  document.documentElement.lang = (currentLang === 'kh' ? 'km' : 'en');

  if (currentLang === 'kh') {
    document.body.classList.add('lang-kh');
  } else {
    document.body.classList.remove('lang-kh');
  }

  // Update button toggle states
  const btnEn = document.getElementById('lang-btn-en');
  const btnKh = document.getElementById('lang-btn-kh');
  if (btnEn && btnKh) {
    if (currentLang === 'kh') {
      btnKh.className = 'px-2 py-0.5 rounded text-[11px] font-bold transition bg-emerald-600 text-white shadow-xs';
      btnEn.className = 'px-2 py-0.5 rounded text-[11px] font-bold transition text-slate-300 hover:text-white';
    } else {
      btnEn.className = 'px-2 py-0.5 rounded text-[11px] font-bold transition bg-blue-600 text-white shadow-xs';
      btnKh.className = 'px-2 py-0.5 rounded text-[11px] font-bold transition text-slate-300 hover:text-white';
    }
  }

  const langSelect = document.getElementById('language-selector');
  if (langSelect) langSelect.value = currentLang;

  // Translate all [data-i18n] text
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (typeof i18n !== 'undefined') {
      const text = i18n.t(key);
      if (text && text !== key) {
        el.textContent = text;
      }
    }
  });

  // Translate all [data-i18n-placeholder]
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (typeof i18n !== 'undefined') {
      const ph = i18n.t(key);
      if (ph && ph !== key) {
        el.placeholder = ph;
      }
    }
  });

  // Translate all [data-i18n-title]
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (typeof i18n !== 'undefined') {
      const title = i18n.t(key);
      if (title && title !== key) {
        el.title = title;
      }
    }
  });

  // Update Ribbon Breadcrumb
  const bcEntity = document.getElementById('breadcrumb-entity');
  if (bcEntity) {
    bcEntity.textContent = formatEntityTitle(appState.currentView);
  }
}

function handleLanguageSwitch(lang) {
  if (typeof i18n !== 'undefined') {
    i18n.setLang(lang);
  }
  applyTranslations();
  renderRibbon();
  renderMainView();
  
  const toastMsg = lang === 'kh' 
    ? 'បានប្តូរភាសាទៅជា ភាសាខ្មែរ (Khmer)' 
    : 'Language switched to English';
  showToast(toastMsg, 'success');
}

function switchLanguage(lang) {
  handleLanguageSwitch(lang);
}

// Global expose
window.handleLanguageSwitch = handleLanguageSwitch;
window.switchLanguage = switchLanguage;
window.applyTranslations = applyTranslations;

// ==========================================
// 20. APP INITIALIZATION
// ==========================================
function initApp() {
  DAL.init();
  applyTranslations();
  handleRoleSwitch('Administrator', false);
  navigateTo('dashboard');
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }

  // Close search and menus on click outside
  document.addEventListener('click', (e) => {
    const searchDropdown = document.getElementById('search-results-dropdown');
    const searchInput = document.getElementById('global-search-input');
    if (searchDropdown && searchInput && !searchDropdown.contains(e.target) && e.target !== searchInput) {
      searchDropdown.classList.add('hidden');
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
