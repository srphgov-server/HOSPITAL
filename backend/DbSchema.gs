/**
 * Microsoft Dynamics 365 Model-driven Healthcare Management System
 * Relational Database Schema for Google Sheets & Microsoft Dataverse Alignment
 */

const DB_SCHEMA = {
  // 1. Patients Table
  Patients: [
    'PatientID',
    'PatientNumber',
    'FirstName',
    'LastName',
    'Gender',
    'DateOfBirth',
    'Age',
    'PhoneNumber',
    'Email',
    'Address',
    'EmergencyContactName',
    'EmergencyContactPhone',
    'BloodType',
    'Allergies',
    'MedicalConditions',
    'RegistrationDate',
    'PatientStatus',      // Active | Inactive | Deceased
    'AssignedDoctorID',
    'Notes',
    'CreatedAt',
    'UpdatedAt'
  ],

  // 2. Doctors Table
  Doctors: [
    'DoctorID',
    'DoctorName',
    'Gender',
    'Specialization',
    'DepartmentID',
    'LicenseNumber',
    'Phone',
    'Email',
    'Availability',       // e.g. Mon-Fri 08:00-16:00
    'Status',             // Active | Inactive
    'CreatedAt'
  ],

  // 3. Departments Table
  Departments: [
    'DepartmentID',
    'DepartmentName',
    'DepartmentCode',
    'HeadDoctorID',
    'Building',
    'Floor',
    'Status',
    'ConsultationFee',
    'CreatedAt'
  ],

  // 4. Appointments Table
  Appointments: [
    'AppointmentID',
    'AppointmentNumber',
    'PatientID',
    'DoctorID',
    'DepartmentID',
    'AppointmentDate',
    'StartTime',
    'EndTime',
    'AppointmentType',    // General | Follow-up | Specialist | Emergency | Checkup
    'ReasonForVisit',
    'Status',             // Scheduled | Confirmed | Checked In | In Progress | Completed | Cancelled | No Show
    'Notes',
    'CreatedAt',
    'UpdatedAt'
  ],

  // 5. Visits / Encounters Table
  Visits: [
    'VisitID',
    'PatientID',
    'AppointmentID',
    'DoctorID',
    'VisitDate',
    'ChiefComplaint',
    'ClinicalNotes',
    'DiagnosisSummary',
    'TreatmentPlan',
    'FollowUpDate',
    'VisitStatus',        // Arrived | In Consultation | Completed | Cancelled
    'OpdStage',           // Triage | Consultation | Investigation | Prescription | Discharge | Completed
    'NeedsInvestigation', // Yes | No
    'DischargeDisposition', // Discharged Home | Admit to IPD | Follow-up | Specialist Referral
    'DischargeNotes',
    'CreatedAt',
    'UpdatedAt'
  ],

  // 6. Vital Signs Table
  VitalSigns: [
    'VitalSignID',
    'VisitID',
    'PatientID',
    'Temperature',       // Celsius (e.g. 36.8)
    'BloodPressure',     // mmHg (e.g. 120/80)
    'HeartRate',         // bpm (e.g. 72)
    'RespiratoryRate',   // breaths/min (e.g. 16)
    'OxygenSaturation',  // % (e.g. 98)
    'Weight',            // kg (e.g. 68.5)
    'Height',            // cm (e.g. 172)
    'BMI',               // calculated
    'RecordedBy',
    'RecordedAt',
    'Notes'
  ],

  // 7. Diagnoses Table
  Diagnoses: [
    'DiagnosisID',
    'PatientID',
    'VisitID',
    'DoctorID',
    'Diagnosis',
    'DiagnosisCode',     // ICD-10 code (e.g. I10, E11.9)
    'DiagnosisDate',
    'Severity',          // Mild | Moderate | Severe | Critical
    'Notes',
    'CreatedAt'
  ],

  // 8. Medications Table (Inventory)
  Medications: [
    'MedicationID',
    'MedicationName',
    'GenericName',
    'Category',          // Antibiotics | Analgesics | Antihypertensive | Antidiabetic | etc.
    'DosageForm',        // Tablet | Capsule | Syrup | Injection | Inhaler
    'Strength',          // e.g. 500mg, 10mg
    'Unit',              // box | strip | bottle | ampoule
    'StockQuantity',
    'ReorderLevel',
    'UnitPrice',
    'Status',            // In Stock | Low Stock | Out of Stock | Discontinued
    'CreatedAt'
  ],

  // 9. Prescriptions Table
  Prescriptions: [
    'PrescriptionID',
    'PrescriptionNumber',
    'PatientID',
    'DoctorID',
    'VisitID',
    'PrescriptionDate',
    'Status',            // Draft | Active | Dispensed | Cancelled
    'Instructions',
    'DispensedBy',
    'DispensedAt',
    'CreatedAt',
    'UpdatedAt'
  ],

  // 10. Prescription Items Table
  PrescriptionItems: [
    'PrescriptionItemID',
    'PrescriptionID',
    'MedicationID',
    'MedicationName',
    'Dosage',
    'Frequency',         // Once daily | Twice daily | 3 times daily | Every 8 hours | As needed
    'Duration',          // e.g. 5 days, 14 days, 30 days
    'Quantity',
    'Route',             // Oral | Intravenous | Topical | Inhalation | Sublingual
    'Instructions',
    'Status',            // Pending | Dispensed
    'CreatedAt'
  ],

  // 11. Laboratory Tests Master Table
  LaboratoryTests: [
    'TestID',
    'TestName',
    'TestCode',
    'Category',          // Hematology | Biochemistry | Microbiology | Immunology | Imaging
    'Description',
    'NormalRange',
    'Unit',
    'Cost',
    'Status',            // Active | Inactive
    'CreatedAt'
  ],

  // 12. Laboratory Results Table
  LaboratoryResults: [
    'ResultID',
    'PatientID',
    'VisitID',
    'DoctorID',
    'TestID',
    'TestName',
    'TestDate',
    'Result',
    'ReferenceRange',
    'Interpretation',    // Normal | Abnormal | Critical High | Critical Low
    'Status',            // Requested | Sample Collected | Processing | Completed | Cancelled
    'Notes',
    'TechnicianName',
    'CreatedAt',
    'UpdatedAt'
  ],

  // 13. Invoices Table
  Invoices: [
    'InvoiceID',
    'InvoiceNumber',
    'PatientID',
    'VisitID',
    'InvoiceDate',
    'TotalAmount',
    'Discount',
    'Tax',
    'AmountPaid',
    'Balance',           // TotalAmount - AmountPaid
    'PaymentStatus',     // Unpaid | Partially Paid | Paid | Cancelled
    'Notes',
    'CreatedAt',
    'UpdatedAt'
  ],

  // 14. Payments Table
  Payments: [
    'PaymentID',
    'InvoiceID',
    'PatientID',
    'PaymentDate',
    'Amount',
    'PaymentMethod',     // Cash | Bank Transfer | Credit Card | Other
    'ReferenceNumber',
    'Notes',
    'ReceivedBy',
    'CreatedAt'
  ],

  // 15. Follow-ups Table
  FollowUps: [
    'FollowUpID',
    'PatientID',
    'DoctorID',
    'RelatedVisitID',
    'FollowUpDate',
    'Reason',
    'Status',            // Pending | Completed | Cancelled
    'Notes',
    'CreatedAt',
    'UpdatedAt'
  ],

  // 16. Users Table (System Roles & Security)
  Users: [
    'UserID',
    'Username',
    'PasswordHash',
    'FullName',
    'Email',
    'Role',              // Administrator | Receptionist | Doctor | Nurse | Pharmacist | Accountant
    'DoctorID',          // If role is Doctor
    'DepartmentID',
    'Status',            // Active | Inactive
    'CreatedAt'
  ],

  // 17. Security Roles Table
  SecurityRoles: [
    'RoleID',
    'RoleName',
    'Description',
    'Scope',             // Organization | Business Unit | User
    'AllowedViewsJson',
    'PrivilegesJson',
    'Status',
    'CreatedAt'
  ],

  // 18. Beds / Wards Table (Inpatient Bed Management)
  Beds: [
    'BedID',
    'BedNumber',
    'WardName',          // Intensive Care Unit (ICU) | General Medical Ward A | Surgical Ward B | Private Deluxe Ward | Pediatric Ward
    'DepartmentID',
    'BedType',           // ICU | Standard General | Private Single | Semi-Private
    'DailyRate',
    'Status',            // Available | Occupied | Cleaning | Maintenance
    'CurrentAdmissionID',
    'CreatedAt',
    'UpdatedAt'
  ],

  // 19. Inpatient Admissions Table (IPD Encounters)
  Admissions: [
    'AdmissionID',
    'AdmissionNumber',
    'PatientID',
    'DoctorID',
    'DepartmentID',
    'BedID',
    'AdmissionDate',
    'AdmissionType',      // Emergency | Elective | OPD Transfer | Referral
    'SourceEncounterID',  // Link to OPD Visit if transferred
    'AdmittingDiagnosis',
    'CurrentCondition',   // Stable | Guarded | Serious | Critical
    'IpdStage',           // Admission | DailyRounds | Orders | MAR | Discharge | Completed
    'ExpectedDischargeDate',
    'ActualDischargeDate',
    'DischargeDisposition', // Discharged Home | Transfer to ICU | Specialist Referral | Deceased | LAMA
    'DischargeSummary',
    'TotalDays',
    'Status',             // Admitted | Discharged | Cancelled
    'CreatedAt',
    'UpdatedAt'
  ],

  // 20. Daily Inpatient Rounds Table (Doctor SOAP & Nursing Care)
  DailyRounds: [
    'RoundID',
    'AdmissionID',
    'PatientID',
    'DoctorID',
    'RoundDate',
    'RoundType',          // Physician Round | Nursing Assessment | Multi-Disciplinary
    'Subjective',         // Patient complaints, overnight report
    'Objective',          // Vitals summary, exam findings, I/O fluid balance
    'Assessment',         // Clinical impression, trajectory
    'Plan',               // Updated orders, diet, step-down plan
    'RecordedBy',
    'CreatedAt'
  ],

  // 21. Emergency Encounters Table (ED / ER Clinical Triage & Resuscitation)
  EmergencyEncounters: [
    'EncounterID',
    'EncounterNumber',
    'PatientID',
    'DoctorID',
    'TriageNurse',
    'ArrivalDate',
    'ArrivalTime',
    'ArrivalMode',          // Ambulance (EMS) | Walk-in | Wheelchair | Police / Transfer
    'AcuityLevel',          // ESI-1 Resuscitation | ESI-2 Emergent | ESI-3 Urgent | ESI-4 Less Urgent | ESI-5 Non-Urgent
    'ChiefComplaint',
    'BayID',
    'ErStage',              // Triage | PrimarySurvey | StatOrders | Stabilization | Disposition
    'GcsScore',             // Glasgow Coma Scale (3-15)
    'CurrentCondition',     // Critical | Emergent | Urgent | Stable
    'PrimaryDiagnosis',
    'AbcdeAirway',
    'AbcdeBreathing',
    'AbcdeCirculation',
    'AbcdeDisability',
    'AbcdeExposure',
    'ResuscitationNotes',
    'Disposition',          // Admit to IPD | Emergency Surgery / OR | Cath Lab | Transfer to Trauma Center | Discharged Home
    'DispositionNotes',
    'Status',               // Active | Stabilized | Admitted to IPD | Discharged | Transferred
    'TotalFee',
    'CreatedAt',
    'UpdatedAt'
  ],

  // 22. Emergency Bays Table (Trauma, Resuscitation & Acute Bays)
  EmergencyBays: [
    'BayID',
    'BayNumber',
    'BayName',
    'BayType',              // Resuscitation | Trauma | Acute Care | Fast Track | Pediatric | Isolation | Observation
    'Status',               // Occupied | Available | Sanitizing | Maintenance
    'CurrentEncounterID',
    'HourlyRate',
    'EquipmentList',
    'CreatedAt',
    'UpdatedAt'
  ],

  // 23. Operation Theaters Table (OR Suites)
  OperationTheaters: [
    'TheaterID',
    'TheaterNumber',
    'Name',
    'RoomType',             // Laminar Airflow Cleanroom | Hybrid Suite | Ortho Clean Suite | Endoscopy Suite
    'Status',               // Available | In Surgery | Turnover / Sanitizing | Maintenance
    'CurrentSurgeryID',
    'LeadNurse',
    'EquipmentList',
    'CleanlinessLevel',     // ISO Class 5 | ISO Class 7
    'CreatedAt',
    'UpdatedAt'
  ],

  // 24. Surgeries Table (OR Scheduling & Operations)
  Surgeries: [
    'SurgeryID',
    'SurgeryNumber',
    'PatientID',
    'AdmissionID',
    'ProcedureName',
    'ICD10Code',
    'Category',             // Elective | Urgent | Emergency STAT
    'ScheduledDate',
    'StartTime',
    'EndTime',
    'DurationMinutes',
    'TheaterID',
    'LeadSurgeonID',
    'LeadSurgeonName',
    'AssistantSurgeon',
    'Anesthesiologist',
    'AnesthesiaType',       // General (GETA) | Spinal | Epidural | MAC + Sedation | Regional Nerve Block
    'ScrubNurse',
    'CirculatingNurse',
    'PreOpDiagnosis',
    'PostOpDiagnosis',
    'MaterialsRequired',    // Surgical consumables, implants, mesh, sutures
    'SterileTraysRequired', // CSSD sterile sets linked
    'BloodUnitsCrossmatched',
    'WhoSafetyChecklist',   // Sign-in, time-out, sign-out compliance
    'AldreteScore',         // PACU recovery score (0-10)
    'PacuStatus',           // Monitored | Ready for Ward | Transferred to IPD | Transferred to ICU
    'SurgeryStage',         // PreOp | Scheduling | IntraOp | PACU | Completed
    'Status',               // Scheduled | Pre-Op Ready | In Surgery | PACU Recovery | Completed | Cancelled
    'OperativeNotes',
    'CreatedAt',
    'UpdatedAt'
  ],

  // 25. Sterile Trays Table (CSSD / Central Sterile Services Department)
  SterileTrays: [
    'TrayID',
    'TrayNumber',
    'TrayName',
    'Department',
    'TotalInstruments',
    'SterilizationMethod',  // High-Pressure Steam Autoclave | Low-Temp H2O2 Plasma | EtO Gas
    'SterilizationDate',
    'ExpiryDate',
    'CycleNumber',
    'ChemicalIndicator',    // Pass | Fail
    'BiologicalIndicator',  // Pass | Fail
    'Status',               // Sterile - Ready for OR | In Use | Decontamination & Washing | Packaging & Autoclaving
    'AssignedSurgeryID',
    'TechnicianName',
    'CreatedAt',
    'UpdatedAt'
  ]
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DB_SCHEMA };
}

