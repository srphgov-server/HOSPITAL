/**
 * SeedDataService for Microsoft Dynamics 365 Healthcare Prototype
 * Generates rich, realistic fictional clinical and operational records.
 */

const SeedDataService = {
  getSeedData: function() {
    // 1. Departments (5+)
    const departments = [
      { DepartmentID: 'DEP-001', DepartmentName: 'General Medicine', DepartmentCode: 'GEN-MED', HeadDoctorID: 'DOC-001', Building: 'Pavilion A', Floor: '1st Floor', Status: 'Active', ConsultationFee: 40.00, CreatedAt: '2026-01-01T08:00:00Z' },
      { DepartmentID: 'DEP-002', DepartmentName: 'Cardiology', DepartmentCode: 'CARD', HeadDoctorID: 'DOC-002', Building: 'Heart Center B', Floor: '2nd Floor', Status: 'Active', ConsultationFee: 65.00, CreatedAt: '2026-01-01T08:00:00Z' },
      { DepartmentID: 'DEP-003', DepartmentName: 'Pediatrics', DepartmentCode: 'PED', HeadDoctorID: 'DOC-003', Building: 'Children Wing C', Floor: '1st Floor', Status: 'Active', ConsultationFee: 45.00, CreatedAt: '2026-01-01T08:00:00Z' },
      { DepartmentID: 'DEP-004', DepartmentName: 'Orthopedics', DepartmentCode: 'ORTHO', HeadDoctorID: 'DOC-004', Building: 'Surgical Wing D', Floor: '3rd Floor', Status: 'Active', ConsultationFee: 60.00, CreatedAt: '2026-01-01T08:00:00Z' },
      { DepartmentID: 'DEP-005', DepartmentName: 'Endocrinology', DepartmentCode: 'ENDO', HeadDoctorID: 'DOC-005', Building: 'Pavilion A', Floor: '2nd Floor', Status: 'Active', ConsultationFee: 55.00, CreatedAt: '2026-01-01T08:00:00Z' }
    ];

    // 2. Doctors (5+)
    const doctors = [
      { DoctorID: 'DOC-001', DoctorName: 'Dr. Sarah Jenkins, MD', Gender: 'Female', Specialization: 'Internal Medicine', DepartmentID: 'DEP-001', LicenseNumber: 'MED-NY-84920', Phone: '+1 (555) 234-5678', Email: 'sjenkins@metrohealth.demo', Availability: 'Mon-Fri 08:00-16:00', Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { DoctorID: 'DOC-002', DoctorName: 'Dr. Marcus Vance, MD', Gender: 'Male', Specialization: 'Interventional Cardiology', DepartmentID: 'DEP-002', LicenseNumber: 'CARD-NY-73192', Phone: '+1 (555) 345-6789', Email: 'mvance@metrohealth.demo', Availability: 'Mon-Thu 09:00-17:00', Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { DoctorID: 'DOC-003', DoctorName: 'Dr. Elena Rostova, MD', Gender: 'Female', Specialization: 'Pediatric Care', DepartmentID: 'DEP-003', LicenseNumber: 'PED-NY-56291', Phone: '+1 (555) 456-7890', Email: 'erostova@metrohealth.demo', Availability: 'Tue-Sat 08:30-16:30', Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { DoctorID: 'DOC-004', DoctorName: 'Dr. David Kim, MD', Gender: 'Male', Specialization: 'Orthopedic Surgery', DepartmentID: 'DEP-004', LicenseNumber: 'ORTH-NY-67312', Phone: '+1 (555) 567-8901', Email: 'dkim@metrohealth.demo', Availability: 'Mon-Wed-Fri 08:00-17:00', Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { DoctorID: 'DOC-005', DoctorName: 'Dr. Amara Okafor, MD', Gender: 'Female', Specialization: 'Metabolic Disorders', DepartmentID: 'DEP-005', LicenseNumber: 'ENDO-NY-91043', Phone: '+1 (555) 678-9012', Email: 'aokafor@metrohealth.demo', Availability: 'Mon-Fri 09:00-15:00', Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' }
    ];

    // 3. System Users (6 roles)
    const users = [
      { UserID: 'USR-001', Username: 'admin', PasswordHash: 'demo123', FullName: 'Alex Mercer', Email: 'admin@metrohealth.demo', Role: 'Administrator', DoctorID: '', DepartmentID: 'DEP-001', Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { UserID: 'USR-002', Username: 'reception', PasswordHash: 'demo123', FullName: 'Lisa Hernandez', Email: 'reception@metrohealth.demo', Role: 'Receptionist', DoctorID: '', DepartmentID: 'DEP-001', Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { UserID: 'USR-003', Username: 'dr.jenkins', PasswordHash: 'demo123', FullName: 'Dr. Sarah Jenkins', Email: 'sjenkins@metrohealth.demo', Role: 'Doctor', DoctorID: 'DOC-001', DepartmentID: 'DEP-001', Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { UserID: 'USR-004', Username: 'nurse.joyce', PasswordHash: 'demo123', FullName: 'Joyce Chen, RN', Email: 'jchen@metrohealth.demo', Role: 'Nurse', DoctorID: '', DepartmentID: 'DEP-001', Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { UserID: 'USR-005', Username: 'pharma.todd', PasswordHash: 'demo123', FullName: 'Todd Bradley, PharmD', Email: 'tbradley@metrohealth.demo', Role: 'Pharmacist', DoctorID: '', DepartmentID: 'DEP-001', Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { UserID: 'USR-006', Username: 'acct.rachel', PasswordHash: 'demo123', FullName: 'Rachel Green, CPA', Email: 'rgreen@metrohealth.demo', Role: 'Accountant', DoctorID: '', DepartmentID: 'DEP-001', Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' }
    ];

    // Security Roles
    const securityRoles = [
      { RoleID: 'ROL-001', RoleName: 'Administrator', Description: 'Full administrative control over all healthcare modules, security, and data.', Scope: 'Organization', Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { RoleID: 'ROL-002', RoleName: 'Receptionist', Description: 'Patient front desk registration, appointment queue management, and check-in.', Scope: 'Business Unit', Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { RoleID: 'ROL-003', RoleName: 'Doctor', Description: 'Clinical examination, consultation notes, diagnoses, prescriptions, and lab orders.', Scope: 'User / Clinic', Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { RoleID: 'ROL-004', RoleName: 'Nurse', Description: 'Triage assessment, vital signs capture, encounter assistance, and lab queue review.', Scope: 'Business Unit', Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { RoleID: 'ROL-005', RoleName: 'Pharmacist', Description: 'Formulary dispensing, electronic prescription fulfillment, and stock management.', Scope: 'Business Unit', Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' },
      { RoleID: 'ROL-006', RoleName: 'Accountant', Description: 'Patient invoicing, payment receipt generation, and revenue realization reporting.', Scope: 'Organization', Status: 'Active', CreatedAt: '2026-01-01T08:00:00Z' }
    ];

    // 4. Patients (25 realistic records)
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

    // 5. Laboratory Tests Master
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

    // 6. Medications Master (Inventory)
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

    // 7. Appointments (32 records)
    const appointments = [];
    const apptStatuses = ['Completed', 'Checked In', 'Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Completed'];
    const apptTypes = ['General', 'Follow-up', 'Specialist', 'Checkup'];
    const timeSlots = [
      { s: '08:30', e: '09:00' }, { s: '09:15', e: '09:45' }, { s: '10:00', e: '10:30' },
      { s: '11:00', e: '11:30' }, { s: '13:30', e: '14:00' }, { s: '14:30', e: '15:00' }
    ];

    for (let i = 1; i <= 32; i++) {
      const patIdx = (i - 1) % patients.length;
      const docIdx = (i - 1) % doctors.length;
      const dateOffset = Math.floor((i - 1) / 4) - 4; // creates appointments around recent days
      const date = new Date(2026, 2, 20 + dateOffset); // around March 2026
      const dateStr = date.toISOString().split('T')[0];
      const slot = timeSlots[(i - 1) % timeSlots.length];
      const status = apptStatuses[(i - 1) % apptStatuses.length];

      appointments.push({
        AppointmentID: 'APT-' + String(i).padStart(3, '0'),
        AppointmentNumber: 'APT-2026-' + String(i).padStart(4, '0'),
        PatientID: patients[patIdx].PatientID,
        DoctorID: doctors[docIdx].DoctorID,
        DepartmentID: doctors[docIdx].DepartmentID,
        AppointmentDate: dateStr,
        StartTime: slot.s,
        EndTime: slot.e,
        AppointmentType: apptTypes[(i - 1) % apptTypes.length],
        ReasonForVisit: 'Consultation for ' + (patients[patIdx].MedicalConditions || 'routine review'),
        Status: status,
        Notes: 'Patient advised to arrive 15 minutes prior for vitals assessment.',
        CreatedAt: '2026-02-15T08:00:00Z',
        UpdatedAt: '2026-02-15T08:00:00Z'
      });
    }

    // 8. Visits / Encounters (22 records)
    const visits = [];
    const vitals = [];
    for (let i = 1; i <= 22; i++) {
      const apt = appointments[i - 1];
      const pat = patients.find(p => p.PatientID === apt.PatientID) || patients[0];
      const visitId = 'VIS-' + String(i).padStart(3, '0');
      const vDate = apt.AppointmentDate;
      const vStatus = i <= 18 ? 'Completed' : (i === 19 ? 'In Consultation' : 'Arrived');

      const isOldCase = i > 10 && (i % 2 === 0);
      const priorVisitId = isOldCase ? ('VIS-' + String(i - 8).padStart(3, '0')) : '';
      const caseType = isOldCase ? 'Old Case' : 'New Case';

      visits.push({
        VisitID: visitId,
        PatientID: pat.PatientID,
        AppointmentID: apt.AppointmentID,
        DoctorID: apt.DoctorID,
        VisitDate: vDate,
        CaseType: caseType,
        PreviousVisitID: priorVisitId,
        ChiefComplaint: isOldCase ? ('Follow-up re-evaluation for ' + (pat.MedicalConditions || 'chronic condition')) : (pat.MedicalConditions ? 'Initial evaluation for ' + pat.MedicalConditions : 'Regular checkup evaluation'),
        ClinicalNotes: isOldCase ? 'Patient returned for clinical follow-up. Vital signs re-assessed. Progress evaluated against prior treatment plan.' : 'Patient examined in clinic. Alert and oriented. Cardiovascular exam regular rate, chest clear to auscultation. Treatment regimen evaluated.',
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

      // Vital Signs for each visit
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

    // 9. Diagnoses (18 records)
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

    // 10. Prescriptions & Prescription Items (22 records)
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

    // 11. Laboratory Results (22 records)
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
        Result: '0.85 ng/mL (Elevated - Consistent with Myocardial Injury)',
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

    // 12. Invoices & Payments (18 records)
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

    // 13. Follow-ups (12 records)
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

    // 16. Beds & Wards (14 realistic beds across 5 wards)
    const beds = [
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
    ];

    // 17. Inpatient Admissions (10 records: 5 active, 5 discharged)
    const admissions = [
      {
        AdmissionID: 'ADM-001',
        AdmissionNumber: 'IPD-2026-0001',
        PatientID: 'PAT-002', // James Wilson
        DoctorID: 'DOC-002',  // Dr. Marcus Vance (Cardiology)
        DepartmentID: 'DEP-002',
        BedID: 'BED-001',
        AdmissionDate: '2026-03-18T10:00:00Z',
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
        PatientID: 'PAT-001', // Eleanor Vance
        DoctorID: 'DOC-001',  // Dr. Sarah Jenkins (Internal Med)
        DepartmentID: 'DEP-001',
        BedID: 'BED-004',
        AdmissionDate: '2026-03-19T14:30:00Z',
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
        PatientID: 'PAT-004', // Sophia Martinez
        DoctorID: 'DOC-004',  // Dr. David Kim (Orthopedics)
        DepartmentID: 'DEP-004',
        BedID: 'BED-008',
        AdmissionDate: '2026-03-20T08:15:00Z',
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
        PatientID: 'PAT-005', // Arthur Pendelton
        DoctorID: 'DOC-005',  // Dr. Amara Okafor (Endo)
        DepartmentID: 'DEP-005',
        BedID: 'BED-011',
        AdmissionDate: '2026-03-20T11:00:00Z',
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
        PatientID: 'PAT-003', // Liam Cooper (Pediatrics)
        DoctorID: 'DOC-003',  // Dr. Elena Rostova
        DepartmentID: 'DEP-003',
        BedID: 'BED-013',
        AdmissionDate: '2026-03-21T09:00:00Z',
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
      // 5 Discharged Historical Inpatients
      {
        AdmissionID: 'ADM-006',
        AdmissionNumber: 'IPD-2026-0006',
        PatientID: 'PAT-009',
        DoctorID: 'DOC-004',
        DepartmentID: 'DEP-004',
        BedID: 'BED-008',
        AdmissionDate: '2026-02-10T09:00:00Z',
        AdmissionType: 'Elective',
        SourceEncounterID: 'VIS-009',
        AdmittingDiagnosis: 'Total Hip Arthroplasty (Left)',
        CurrentCondition: 'Stable',
        IpdStage: 'Completed',
        ExpectedDischargeDate: '2026-02-14',
        ActualDischargeDate: '2026-02-14T11:00:00Z',
        DischargeDisposition: 'Discharged Home',
        DischargeSummary: 'Patient tolerated hip replacement surgery well. Mobilizing with walker. Surgical incision clean and dry.',
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
        AdmissionDate: '2026-02-15T15:00:00Z',
        AdmissionType: 'Emergency',
        SourceEncounterID: 'VIS-012',
        AdmittingDiagnosis: 'Atrial Fibrillation with Rapid Ventricular Response',
        CurrentCondition: 'Stable',
        IpdStage: 'Completed',
        ExpectedDischargeDate: '2026-02-18',
        ActualDischargeDate: '2026-02-18T10:30:00Z',
        DischargeDisposition: 'Discharged Home',
        DischargeSummary: 'Sinus rhythm restored with medical cardioversion. Maintained on oral anticoagulation.',
        TotalDays: 3,
        Status: 'Discharged',
        CreatedAt: '2026-02-15T15:00:00Z'
      },
      {
        AdmissionID: 'ADM-008',
        AdmissionNumber: 'IPD-2026-0008',
        PatientID: 'PAT-014',
        DoctorID: 'DOC-004',
        DepartmentID: 'DEP-004',
        BedID: 'BED-009',
        AdmissionDate: '2026-02-20T10:00:00Z',
        AdmissionType: 'Elective',
        SourceEncounterID: 'VIS-014',
        AdmittingDiagnosis: 'Meniscectomy Recovery',
        CurrentCondition: 'Stable',
        IpdStage: 'Completed',
        ExpectedDischargeDate: '2026-02-22',
        ActualDischargeDate: '2026-02-22T14:00:00Z',
        DischargeDisposition: 'Discharged Home',
        DischargeSummary: 'Good weight bearing tolerance. Physical therapy protocol prescribed.',
        TotalDays: 2,
        Status: 'Discharged',
        CreatedAt: '2026-02-20T10:00:00Z'
      },
      {
        AdmissionID: 'ADM-009',
        AdmissionNumber: 'IPD-2026-0009',
        PatientID: 'PAT-018',
        DoctorID: 'DOC-001',
        DepartmentID: 'DEP-001',
        BedID: 'BED-005',
        AdmissionDate: '2026-02-25T11:00:00Z',
        AdmissionType: 'Emergency',
        SourceEncounterID: 'VIS-018',
        AdmittingDiagnosis: 'COPD Exacerbation with Hypoxemia',
        CurrentCondition: 'Stable',
        IpdStage: 'Completed',
        ExpectedDischargeDate: '2026-03-01',
        ActualDischargeDate: '2026-03-01T09:30:00Z',
        DischargeDisposition: 'Discharged Home',
        DischargeSummary: 'Bronchospasm resolved with bronchodilators and systemic steroids. SpO2 96% on room air.',
        TotalDays: 4,
        Status: 'Discharged',
        CreatedAt: '2026-02-25T11:00:00Z'
      },
      {
        AdmissionID: 'ADM-010',
        AdmissionNumber: 'IPD-2026-0010',
        PatientID: 'PAT-015',
        DoctorID: 'DOC-005',
        DepartmentID: 'DEP-005',
        BedID: 'BED-012',
        AdmissionDate: '2026-03-05T08:30:00Z',
        AdmissionType: 'OPD Transfer',
        SourceEncounterID: 'VIS-015',
        AdmittingDiagnosis: 'Hyperosmolar Hyperglycemic State',
        CurrentCondition: 'Stable',
        IpdStage: 'Completed',
        ExpectedDischargeDate: '2026-03-08',
        ActualDischargeDate: '2026-03-08T12:00:00Z',
        DischargeDisposition: 'Discharged Home',
        DischargeSummary: 'Glycemic control optimized with basal-bolus insulin. Outpatient diabetes education complete.',
        TotalDays: 3,
        Status: 'Discharged',
        CreatedAt: '2026-03-05T08:30:00Z'
      }
    ];

    // 18. Daily Inpatient Rounds (SOAP clinical notes)
    const dailyRounds = [
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
      },
      {
        RoundID: 'RND-005',
        AdmissionID: 'ADM-005',
        PatientID: 'PAT-003',
        DoctorID: 'DOC-003',
        RoundDate: '2026-03-21',
        RoundType: 'Physician Round',
        Subjective: 'Child cheerful, oral fluid intake adequate. Mild cough.',
        Objective: 'RR: 22, SpO2: 97% on room air. Rare end-expiratory wheeze.',
        Assessment: 'Pediatric asthma exacerbation resolving well.',
        Plan: 'Continue oral prednisone and inhaled albuterol. Discharge teaching for parents.',
        RecordedBy: 'Dr. Elena Rostova, MD',
        CreatedAt: '2026-03-21T10:15:00Z'
      }
    ];

    const emergencyBays = [
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
    ];

    const emergencyEncounters = [
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
    ];

    // 23. Operation Theaters (4 Operating Suites)
    const operationTheaters = [
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
    ];

    // 24. Surgeries (6 Operating Cases)
    const surgeries = [
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
    ];

    // 25. Sterile Trays & Sets (CSSD - Central Sterile Services Department)
    const sterileTrays = [
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
    ];

    // 26. Services Catalog (Hospital Master Fee Schedule: IPD Fees, Investigation Order Fees, OPD/ER, OT, Nursing)
    const services = [
      // --- IPD Fees & Inpatient Care ---
      { ServiceID: 'SRV-001', ServiceCode: 'IPD-BED-ICU', ServiceName: 'Intensive Care Unit (ICU) Daily Bed & Critical Care Rate', Category: 'IPD & Inpatient Care', SubCategory: 'Ward Bed Fee', DepartmentID: 'DEP-002', DepartmentName: 'Cardiology / Intensive Care', Price: 250.00, Cost: 120.00, BillingUnit: 'Per Day', TaxRate: 0.05, Status: 'Active', Description: 'Daily inpatient ICU bed accommodation including bedside telemetry, infusion monitoring, and critical care nursing.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-002', ServiceCode: 'IPD-BED-GEN', ServiceName: 'General Medical Ward Daily Bed Rate (Pavilion A)', Category: 'IPD & Inpatient Care', SubCategory: 'Ward Bed Fee', DepartmentID: 'DEP-001', DepartmentName: 'General Medicine', Price: 60.00, Cost: 25.00, BillingUnit: 'Per Day', TaxRate: 0.05, Status: 'Active', Description: 'Standard multi-occupancy general inpatient medical bed with round-the-clock nursing care and linen service.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-003', ServiceCode: 'IPD-BED-SURG', ServiceName: 'Surgical Ward Inpatient Bed Daily Rate (Wing B)', Category: 'IPD & Inpatient Care', SubCategory: 'Ward Bed Fee', DepartmentID: 'DEP-004', DepartmentName: 'Orthopedics & Surgery', Price: 85.00, Cost: 38.00, BillingUnit: 'Per Day', TaxRate: 0.05, Status: 'Active', Description: 'Post-operative surgical ward accommodation with wound monitoring and specialized post-op nursing care.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-004', ServiceCode: 'IPD-BED-PVT', ServiceName: 'Private Deluxe Single Suite Inpatient Daily Rate', Category: 'IPD & Inpatient Care', SubCategory: 'Ward Bed Fee', DepartmentID: 'DEP-001', DepartmentName: 'General Medicine', Price: 180.00, Cost: 75.00, BillingUnit: 'Per Day', TaxRate: 0.05, Status: 'Active', Description: 'Private en-suite room with dedicated patient amenities, companion sofa bed, and personalized inpatient care.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-005', ServiceCode: 'IPD-BED-PED', ServiceName: 'Pediatric Semi-Private Ward Inpatient Daily Rate', Category: 'IPD & Inpatient Care', SubCategory: 'Ward Bed Fee', DepartmentID: 'DEP-003', DepartmentName: 'Pediatrics', Price: 70.00, Cost: 30.00, BillingUnit: 'Per Day', TaxRate: 0.05, Status: 'Active', Description: 'Child-friendly pediatric inpatient bed with parental cot facility and pediatric nursing supervision.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-006', ServiceCode: 'IPD-DOC-RND', ServiceName: 'Attending Physician Daily Inpatient Ward Round', Category: 'IPD & Inpatient Care', SubCategory: 'Physician Rounds', DepartmentID: 'DEP-001', DepartmentName: 'General Medicine', Price: 40.00, Cost: 15.00, BillingUnit: 'Per Round', TaxRate: 0.00, Status: 'Active', Description: 'Daily clinical evaluation, chart review, treatment regimen adjustment, and bedside examination by attending doctor.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-007', ServiceCode: 'IPD-ICU-CRIT', ServiceName: 'Intensivist Critical Care Monitoring Round (ICU)', Category: 'IPD & Inpatient Care', SubCategory: 'Physician Rounds', DepartmentID: 'DEP-002', DepartmentName: 'Cardiology / Intensive Care', Price: 95.00, Cost: 40.00, BillingUnit: 'Per Round', TaxRate: 0.00, Status: 'Active', Description: 'Advanced ICU hemodynamics, ventilator weaning, inotropic titrations, and multisystem critical care round.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-008', ServiceCode: 'IPD-ADM-INT', ServiceName: 'Inpatient Hospital Admission Intake & Setup Fee', Category: 'IPD & Inpatient Care', SubCategory: 'Admission Processing', DepartmentID: 'DEP-001', DepartmentName: 'Patient Admissions', Price: 50.00, Cost: 18.00, BillingUnit: 'Per Admission', TaxRate: 0.05, Status: 'Active', Description: 'Initial clinical triage admission processing, ID wristband encoding, IPD chart opening, and electronic nursing assignment.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-009', ServiceCode: 'IPD-NURS-24H', ServiceName: '24-Hour Specialized Inpatient Nursing Care Fee', Category: 'IPD & Inpatient Care', SubCategory: 'Nursing Care', DepartmentID: 'DEP-001', DepartmentName: 'Nursing Administration', Price: 35.00, Cost: 12.00, BillingUnit: 'Per Day', TaxRate: 0.00, Status: 'Active', Description: 'Continuous 24-hour ward nursing supervision, vital signs charting, MAR administration, and patient safety care.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },

      // --- Investigation Order Fees (Radiology, Cardiology & Laboratory) ---
      { ServiceID: 'SRV-010', ServiceCode: 'INV-LAB-CBC', ServiceName: 'Complete Blood Count (CBC) with Differential', Category: 'Diagnostic Investigation', SubCategory: 'Laboratory Pathology', DepartmentID: 'DEP-001', DepartmentName: 'Pathology Diagnostics', Price: 25.00, Cost: 8.00, BillingUnit: 'Per Order', TaxRate: 0.00, Status: 'Active', Description: 'Automated 5-part differential hematology analyzer: WBC, RBC, Hgb, Hct, MCV, MCH, Platelet count.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-011', ServiceCode: 'INV-LAB-CMP', ServiceName: 'Comprehensive Metabolic Panel (CMP - 14 Parameters)', Category: 'Diagnostic Investigation', SubCategory: 'Laboratory Pathology', DepartmentID: 'DEP-001', DepartmentName: 'Clinical Biochemistry', Price: 45.00, Cost: 14.00, BillingUnit: 'Per Order', TaxRate: 0.00, Status: 'Active', Description: 'Biochemistry panel: Glucose, BUN, Creatinine, Electrolytes (Na/K/Cl/CO2), Calcium, Total Protein, Albumin, Bilirubin, AST, ALT, ALP.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-012', ServiceCode: 'INV-LAB-LIP', ServiceName: 'Lipid Profile & Atherogenic Risk Panel', Category: 'Diagnostic Investigation', SubCategory: 'Laboratory Pathology', DepartmentID: 'DEP-002', DepartmentName: 'Clinical Biochemistry', Price: 35.00, Cost: 10.00, BillingUnit: 'Per Order', TaxRate: 0.00, Status: 'Active', Description: 'Total Cholesterol, HDL Cholesterol, Direct LDL, Triglycerides, and Non-HDL risk assessment.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-013', ServiceCode: 'INV-LAB-HBA1C', ServiceName: 'Hemoglobin A1c (HbA1c) Glycated Blood Sugar', Category: 'Diagnostic Investigation', SubCategory: 'Laboratory Pathology', DepartmentID: 'DEP-005', DepartmentName: 'Clinical Biochemistry', Price: 30.00, Cost: 9.00, BillingUnit: 'Per Order', TaxRate: 0.00, Status: 'Active', Description: 'HPLC quantitative determination of HbA1c for quarterly glycemic control monitoring in diabetes.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-014', ServiceCode: 'INV-LAB-TSH', ServiceName: 'Thyroid Stimulating Hormone (TSH) Sensitive', Category: 'Diagnostic Investigation', SubCategory: 'Laboratory Pathology', DepartmentID: 'DEP-005', DepartmentName: 'Immunology & Hormones', Price: 35.00, Cost: 11.00, BillingUnit: 'Per Order', TaxRate: 0.00, Status: 'Active', Description: 'Third-generation chemiluminescent immunoassay for screening thyroid dysfunctions (hyper/hypothyroidism).', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-015', ServiceCode: 'INV-LAB-TROP', ServiceName: 'Cardiac Troponin I Quantitative STAT Order', Category: 'Diagnostic Investigation', SubCategory: 'Laboratory Pathology', DepartmentID: 'DEP-002', DepartmentName: 'Pathology Diagnostics', Price: 50.00, Cost: 16.00, BillingUnit: 'Per Order', TaxRate: 0.00, Status: 'Active', Description: 'High-sensitivity bedside/core lab immunoassay for acute myocardial necrosis, NSTEMI, and cardiac ischemia.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-016', ServiceCode: 'INV-LAB-UA', ServiceName: 'Urinalysis Automated & Microscopic Examination', Category: 'Diagnostic Investigation', SubCategory: 'Laboratory Pathology', DepartmentID: 'DEP-001', DepartmentName: 'Pathology Diagnostics', Price: 18.00, Cost: 5.00, BillingUnit: 'Per Order', TaxRate: 0.00, Status: 'Active', Description: 'Urine chemistry dipstick (pH, protein, glucose, ketones, blood, nitrites, leukocyte esterase) + spun sediment microscopy.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-017', ServiceCode: 'INV-RAD-XCHEST', ServiceName: 'Chest X-Ray Digital Radiography (PA & Lateral)', Category: 'Diagnostic Investigation', SubCategory: 'Radiology Imaging', DepartmentID: 'DEP-001', DepartmentName: 'Diagnostic Radiology', Price: 65.00, Cost: 22.00, BillingUnit: 'Per Study', TaxRate: 0.05, Status: 'Active', Description: 'Dual-view digital radiography of the thorax, lung parenchymal opacities, pleural spaces, and cardiothoracic ratio.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-018', ServiceCode: 'INV-RAD-CTBRAIN', ServiceName: 'Brain CT Scan (Computed Tomography Non-Contrast)', Category: 'Diagnostic Investigation', SubCategory: 'Radiology Imaging', DepartmentID: 'DEP-001', DepartmentName: 'Diagnostic Radiology', Price: 350.00, Cost: 110.00, BillingUnit: 'Per Study', TaxRate: 0.05, Status: 'Active', Description: 'Multislice axial CT of head and cranium to evaluate stroke, trauma, intracranial hemorrhage, and mass effect.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-019', ServiceCode: 'INV-RAD-CTABD', ServiceName: 'Chest & Abdomen Helical CT Scan with Contrast', Category: 'Diagnostic Investigation', SubCategory: 'Radiology Imaging', DepartmentID: 'DEP-001', DepartmentName: 'Diagnostic Radiology', Price: 480.00, Cost: 160.00, BillingUnit: 'Per Study', TaxRate: 0.05, Status: 'Active', Description: 'High-resolution IV-contrast enhanced computed tomography of the thoracic cage, mediastinum, liver, spleen, kidneys, and pelvis.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-020', ServiceCode: 'INV-CARD-ECHO', ServiceName: '2D Transthoracic Echocardiography (Echo + Doppler)', Category: 'Diagnostic Investigation', SubCategory: 'Cardiology Diagnostics', DepartmentID: 'DEP-002', DepartmentName: 'Cardiovascular Imaging', Price: 220.00, Cost: 70.00, BillingUnit: 'Per Study', TaxRate: 0.05, Status: 'Active', Description: 'Comprehensive ultrasound evaluation of myocardial wall motion, ejection fraction (LVEF), valve regurgitation/stenosis.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-021', ServiceCode: 'INV-RAD-USABD', ServiceName: 'Abdominal Complete Ultrasound Sonography', Category: 'Diagnostic Investigation', SubCategory: 'Radiology Imaging', DepartmentID: 'DEP-001', DepartmentName: 'Diagnostic Radiology', Price: 110.00, Cost: 35.00, BillingUnit: 'Per Study', TaxRate: 0.05, Status: 'Active', Description: 'Real-time B-mode ultrasound examination of hepatobiliary system, gallbladder cholelithiasis, pancreas, and renal parenchyma.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-022', ServiceCode: 'INV-RAD-XKNEE', ServiceName: 'Knee Joint X-Ray (AP, Lateral & Skyline Views)', Category: 'Diagnostic Investigation', SubCategory: 'Radiology Imaging', DepartmentID: 'DEP-004', DepartmentName: 'Diagnostic Radiology', Price: 80.00, Cost: 26.00, BillingUnit: 'Per Study', TaxRate: 0.05, Status: 'Active', Description: 'Weight-bearing orthogonal digital radiograph of knee for fracture, osteoarthritis grading, and joint effusion.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-023', ServiceCode: 'INV-CARD-ECG', ServiceName: '12-Lead Electrocardiogram (ECG / EKG) with Analysis', Category: 'Diagnostic Investigation', SubCategory: 'Cardiology Diagnostics', DepartmentID: 'DEP-002', DepartmentName: 'Cardiovascular Imaging', Price: 35.00, Cost: 10.00, BillingUnit: 'Per Study', TaxRate: 0.00, Status: 'Active', Description: 'Standard 12-lead surface electrogram recording for rhythm disturbance, ST-elevation, bundle branch blocks, and QT intervals.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-024', ServiceCode: 'INV-LAB-DENGUE', ServiceName: 'Dengue NS1 Antigen & IgG/IgM Rapid Duo Order', Category: 'Diagnostic Investigation', SubCategory: 'Laboratory Pathology', DepartmentID: 'DEP-001', DepartmentName: 'Pathology Diagnostics', Price: 28.00, Cost: 9.00, BillingUnit: 'Per Order', TaxRate: 0.00, Status: 'Active', Description: 'Immuno-chromatographic dual cassette rapid test for early dengue NS1 antigen and secondary acute IgG/IgM serology.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },

      // --- OPD, Emergency & Consultation Fees ---
      { ServiceID: 'SRV-025', ServiceCode: 'OPD-CONS-GEN', ServiceName: 'General Physician Outpatient Consultation Fee', Category: 'OPD & Emergency', SubCategory: 'Consultation Fee', DepartmentID: 'DEP-001', DepartmentName: 'General Medicine', Price: 40.00, Cost: 12.00, BillingUnit: 'Per Consultation', TaxRate: 0.00, Status: 'Active', Description: 'Primary outpatient medical history examination, prescription review, and diagnostic referral by general practitioner.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-026', ServiceCode: 'OPD-CONS-SPEC', ServiceName: 'Specialist Clinical Consultation Fee (Cardiology / Orthopedics)', Category: 'OPD & Emergency', SubCategory: 'Consultation Fee', DepartmentID: 'DEP-002', DepartmentName: 'Cardiology', Price: 65.00, Cost: 20.00, BillingUnit: 'Per Consultation', TaxRate: 0.00, Status: 'Active', Description: 'In-depth specialist medical examination, diagnostic interpretation, and customized treatment planning.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-027', ServiceCode: 'ER-TRI-ACUTE', ServiceName: 'Emergency Department Triage & Resuscitation Intake Fee', Category: 'OPD & Emergency', SubCategory: 'Emergency Care', DepartmentID: 'DEP-001', DepartmentName: 'Emergency Department', Price: 150.00, Cost: 55.00, BillingUnit: 'Per Encounter', TaxRate: 0.05, Status: 'Active', Description: 'Immediate emergency physician triage assessment, trauma stabilization, oxygen setup, and emergency pathway intake.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-028', ServiceCode: 'ER-BAY-STAT', ServiceName: 'ER Resuscitation Bay Occupancy & Monitoring (Hourly)', Category: 'OPD & Emergency', SubCategory: 'Emergency Care', DepartmentID: 'DEP-001', DepartmentName: 'Emergency Department', Price: 250.00, Cost: 90.00, BillingUnit: 'Per Hour', TaxRate: 0.05, Status: 'Active', Description: 'Acute bay occupancy with continuous defibrillator, suction, multiparameter monitor, and bedside emergency nurse.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },

      // --- Surgical & OT Procedures ---
      { ServiceID: 'SRV-029', ServiceCode: 'SURG-OT-MAJ', ServiceName: 'Major Operating Theater Surgical Suite Facility Fee', Category: 'Surgical & OT', SubCategory: 'Operating Theater', DepartmentID: 'DEP-004', DepartmentName: 'Operation Theater', Price: 600.00, Cost: 220.00, BillingUnit: 'Per Procedure', TaxRate: 0.05, Status: 'Active', Description: 'Use of laminar airflow sterile OR cleanroom, surgical lighting, electrocautery generator, and perioperative nursing team.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-030', ServiceCode: 'SURG-ANES-GEN', ServiceName: 'General Anesthesia (GETA) Delivery & Monitoring', Category: 'Surgical & OT', SubCategory: 'Anesthesia Service', DepartmentID: 'DEP-004', DepartmentName: 'Anesthesiology', Price: 280.00, Cost: 95.00, BillingUnit: 'Per Procedure', TaxRate: 0.00, Status: 'Active', Description: 'Endotracheal intubation, volatile anesthetic administration, muscle relaxation monitoring, and PACU reversal.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-031', ServiceCode: 'SURG-CSSD-SET', ServiceName: 'CSSD Sterile Instrument Tray Processing Fee', Category: 'Surgical & OT', SubCategory: 'Sterile Processing', DepartmentID: 'DEP-004', DepartmentName: 'Central Sterile Supply (CSSD)', Price: 45.00, Cost: 15.00, BillingUnit: 'Per Set', TaxRate: 0.05, Status: 'Active', Description: 'High-pressure vacuum steam autoclave sterilization, biological indicator spore validation, and tamper-evident pouching.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },

      // --- Nursing & Clinical Procedures ---
      { ServiceID: 'SRV-032', ServiceCode: 'PROC-IV-INF', ServiceName: 'Intravenous (IV) Line Cannulation & Infusion Set Fee', Category: 'Nursing & Therapy', SubCategory: 'Clinical Procedure', DepartmentID: 'DEP-001', DepartmentName: 'Nursing Administration', Price: 25.00, Cost: 7.50, BillingUnit: 'Per Procedure', TaxRate: 0.05, Status: 'Active', Description: 'Aseptic peripheral vein cannulation, IV catheter placement, extension line, and infusion administration setup.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-033', ServiceCode: 'PROC-WND-DRS', ServiceName: 'Surgical Wound Debridement & Sterile Dressing', Category: 'Nursing & Therapy', SubCategory: 'Clinical Procedure', DepartmentID: 'DEP-004', DepartmentName: 'Orthopedics & Surgery', Price: 35.00, Cost: 12.00, BillingUnit: 'Per Treatment', TaxRate: 0.05, Status: 'Active', Description: 'Aseptic post-op wound cleansing, chlorhexidine disinfection, exudate inspection, and sterile hydrocellular dressing.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' },
      { ServiceID: 'SRV-034', ServiceCode: 'PROC-NEB-TH', ServiceName: 'Aerosol Nebulization Therapy Administration', Category: 'Nursing & Therapy', SubCategory: 'Clinical Procedure', DepartmentID: 'DEP-001', DepartmentName: 'General Medicine', Price: 20.00, Cost: 6.00, BillingUnit: 'Per Treatment', TaxRate: 0.05, Status: 'Active', Description: 'Medical jet nebulization of bronchodilators/corticosteroids with compressed medical air and respiratory supervision.', CreatedAt: '2026-01-01T08:00:00Z', UpdatedAt: '2026-01-01T08:00:00Z' }
    ];

    return {
      Departments: departments,
      Doctors: doctors,
      Users: users,
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
      SecurityRoles: securityRoles,
      Beds: beds,
      Admissions: admissions,
      DailyRounds: dailyRounds,
      EmergencyBays: emergencyBays,
      EmergencyEncounters: emergencyEncounters,
      OperationTheaters: operationTheaters,
      Surgeries: surgeries,
      SterileTrays: sterileTrays,
      Services: services
    };
  },

  seedAll: function() {
    const data = this.getSeedData();
    let totalRecords = 0;
    for (const [table, records] of Object.entries(data)) {
      const sheet = DbService.getOrCreateSheet(table);
      for (const rec of records) {
        DbService.insert(table, rec);
        totalRecords++;
      }
    }
    return { success: true, seededTables: Object.keys(data).length, totalRecords: totalRecords };
  }
};

if (typeof module !== 'undefined') {
  module.exports = { SeedDataService };
}
