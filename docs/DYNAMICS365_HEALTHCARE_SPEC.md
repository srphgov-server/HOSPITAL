# Microsoft Dynamics 365 Healthcare Management System Prototype
## Technical Specification, Data Model, Google Sheets Architecture & Microsoft Dataverse Migration Guide

---

## 1. Executive Summary & System Objectives
This prototype demonstrates a centralized **Healthcare Management System (HMS)** designed with the user experience, ergonomics, and relational architecture of **Microsoft Dynamics 365 Customer Engagement (Model-driven Apps)** and **Microsoft Cloud for Healthcare**.

### Core System Objectives:
* **Patient Management & 360&deg; Clinical Profile**: Demographic recording, medical summary, allergies alerts, chronic condition tracking, and an interactive chronological timeline combining all clinical and financial encounters.
* **Appointment Scheduling**: Dual-view calendar and grid scheduling with built-in doctor collision and double-booking prevention.
* **Clinical Care & Encounters**: Structured patient visits, vital signs tracking with automated BMI calculation, clinical notes, ICD-10 diagnoses, and doctor follow-up orders.
* **Diagnostics & Pharmacy**: Laboratory test catalogs, laboratory result reporting with reference ranges and interpretations, electronic prescriptions with dosage/frequency instructions, and pharmacy dispensing with inventory stock deduction.
* **Financials & Revenue Cycle**: Invoice creation with tax/discount calculation, cashier payments with overpayment prevention rules, and balance realization tracking.
* **Dashboards & Executive Intelligence**: Real-time KPI summary cards, analytical charts (status breakdowns, departmental volume, revenue realization), and triage subgrids.
* **Decoupled Architecture**: Seamless abstraction between UI, Business Logic, and the Data Access Layer (DAL), currently operating on Google Sheets / local seed cache, fully prepared for future migration to Microsoft Dataverse without UI refactoring.

---

## 2. Application Architecture

```
+-----------------------------------------------------------------------------------------+
|                                    PRESENTATION LAYER                                   |
|                                                                                         |
|  +---------------------+  +---------------------------------+  +---------------------+  |
|  | Dynamics Top Header |  | Dynamics Command Ribbon         |  | Breadcrumb Trail    |  |
|  | (#002050 Dark Navy, |  | (+ New, Edit, Deactivate,       |  | (Healthcare >       |  |
|  |  Global Search,     |  |  Refresh, Export to CSV,        |  |  Patients > Active) |  |
|  |  Role Switcher)     |  |  Print, Switch View)            |  |                     |  |
|  +---------------------+  +---------------------------------+  +---------------------+  |
|                                                                                         |
|  +---------------------+  +----------------------------------------------------------+  |
|  | Left Navigation     |  | Model-driven Entity Views & Forms                        |  |
|  | Sitemap (Workplace, |  | - Sortable & Filterable Data Grids                       |  |
|  |  Clinical Care,     |  | - Record Forms with Header KPI Tiles                     |  |
|  |  Pharmacy & Labs,   |  | - Business Process Flow (BPF) Stage Tracker              |  |
|  |  Financials,        |  | - Form Tabs (Summary, Clinical, Timeline, Related, Admin)|  |
|  |  Management)        |  | - Interactive Chronological Activity Timeline            |  |
|  +---------------------+  | - Executive KPI Dashboards with SVG Visual Charts        |  |
|                           +----------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                  BUSINESS LOGIC LAYER                                   |
|                                                                                         |
|  +-------------------------------+  +------------------------------------------------+  |
|  | Role-Based Access Control     |  | Clinical & Operational Business Rules Engine   |  |
|  | (Administrator, Receptionist, |  | - Patient Number (MRN) Uniqueness Guard        |  |
|  |  Doctor, Nurse, Pharmacist,   |  | - Doctor Collision & Double-Booking Prevention |  |
|  |  Accountant)                  |  | - Invoice Balance Auto-Math (Total - Paid)     |  |
|  +-------------------------------+  | - Payment Overpayment Prevention Rule          |  |
|                                     | - Mandatory Clinical Association Validation    |  |
|                                     +------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                            DATA ACCESS LAYER (DAL - REPOSITORY)                         |
|                                                                                         |
|  Interface: find(), findById(), create(), update(), delete(), query(), exportToCsv()    |
+-----------------------------------------------------------------------------------------+
                    |                                                   |
                    v                                                   v
+---------------------------------------+           +-------------------------------------+
|      Google Sheets Data Provider      |           |     Microsoft Dataverse Provider    |
| (Google Apps Script Web App / REST)   |           | (Future Enterprise OData v4 Web API)|
| - 16 Relational Sheets                |           | - Custom Healthcare Tables &        |
| - Primary Keys & Foreign Key Relations|           |   Common Data Model (CDM) Schema    |
+---------------------------------------+           +-------------------------------------+
```

---

## 3. Relational Data Model & ERD

The prototype is built on 16 normalized relational entities:

```
[Departments] 1 ----- * [Doctors] 1 ----- * [Appointments] * ----- 1 [Patients]
                             |                     |                       |
                             |                     |                       |
                             +-----------+         v                       |
                                         |      [Visits] 1 ----------------+
                                         |         |
                                         v         +------- 1:1 --- [VitalSigns]
                                   [Diagnoses]     |
                                                   +------- 1:* --- [Prescriptions] 1 --- * [PrescriptionItems]
                                                   |
                                                   +------- 1:* --- [LaboratoryResults] * --- 1 [LaboratoryTests]
                                                   |
                                                   +------- 1:1 --- [Invoices] 1 --- * [Payments]
                                                   |
                                                   +------- 1:* --- [FollowUps]
```

### Entity Schema & Attribute Definitions

| Entity | Primary Key | Key Foreign Keys | Key Attributes |
| :--- | :--- | :--- | :--- |
| **`Patients`** | `PatientID` | `AssignedDoctorID` &rarr; `Doctors` | `PatientNumber`, `FirstName`, `LastName`, `Gender`, `DateOfBirth`, `Age`, `PhoneNumber`, `Email`, `Address`, `BloodType`, `Allergies`, `MedicalConditions`, `PatientStatus` |
| **`Doctors`** | `DoctorID` | `DepartmentID` &rarr; `Departments` | `DoctorName`, `Gender`, `Specialization`, `LicenseNumber`, `Phone`, `Email`, `Availability`, `Status` |
| **`Departments`**| `DepartmentID`| `HeadDoctorID` &rarr; `Doctors` | `DepartmentName`, `DepartmentCode`, `Building`, `Floor`, `ConsultationFee`, `Status` |
| **`Appointments`**| `AppointmentID`| `PatientID`, `DoctorID`, `DepartmentID` | `AppointmentNumber`, `AppointmentDate`, `StartTime`, `EndTime`, `AppointmentType`, `ReasonForVisit`, `Status` |
| **`Visits`** | `VisitID` | `PatientID`, `DoctorID`, `AppointmentID` | `VisitDate`, `ChiefComplaint`, `ClinicalNotes`, `DiagnosisSummary`, `TreatmentPlan`, `FollowUpDate`, `VisitStatus` |
| **`VitalSigns`** | `VitalSignID` | `VisitID`, `PatientID` | `Temperature`, `BloodPressure`, `HeartRate`, `RespiratoryRate`, `OxygenSaturation`, `Weight`, `Height`, `BMI`, `RecordedBy` |
| **`Diagnoses`** | `DiagnosisID` | `PatientID`, `VisitID`, `DoctorID` | `Diagnosis`, `DiagnosisCode` (ICD-10), `DiagnosisDate`, `Severity`, `Notes` |
| **`Medications`**| `MedicationID`| - | `MedicationName`, `GenericName`, `Category`, `DosageForm`, `Strength`, `StockQuantity`, `ReorderLevel`, `UnitPrice`, `Status` |
| **`Prescriptions`**| `PrescriptionID`| `PatientID`, `DoctorID`, `VisitID` | `PrescriptionNumber`, `PrescriptionDate`, `Status`, `Instructions`, `DispensedBy`, `DispensedAt` |
| **`PrescriptionItems`**| `PrescriptionItemID`| `PrescriptionID`, `MedicationID` | `MedicationName`, `Dosage`, `Frequency`, `Duration`, `Quantity`, `Route`, `Status` |
| **`LaboratoryTests`**| `TestID`| - | `TestName`, `TestCode`, `Category`, `Description`, `NormalRange`, `Cost`, `Status` |
| **`LaboratoryResults`**| `ResultID`| `PatientID`, `VisitID`, `DoctorID`, `TestID` | `TestName`, `TestDate`, `Result`, `ReferenceRange`, `Interpretation`, `Status`, `TechnicianName` |
| **`Invoices`** | `InvoiceID` | `PatientID`, `VisitID` | `InvoiceNumber`, `InvoiceDate`, `TotalAmount`, `Discount`, `Tax`, `AmountPaid`, `Balance`, `PaymentStatus` |
| **`Payments`** | `PaymentID` | `InvoiceID`, `PatientID` | `PaymentDate`, `Amount`, `PaymentMethod`, `ReferenceNumber`, `ReceivedBy` |
| **`FollowUps`** | `FollowUpID` | `PatientID`, `DoctorID`, `RelatedVisitID` | `FollowUpDate`, `Reason`, `Status`, `Notes` |
| **`Users`** | `UserID` | `DoctorID`, `DepartmentID` | `Username`, `FullName`, `Email`, `Role`, `Status` |

---

## 4. Google Sheets Database Schema

Each entity corresponds to a distinct worksheet tab inside the Google Spreadsheet:

1. **`Patients`**: Columns: `PatientID`, `PatientNumber`, `FirstName`, `LastName`, `Gender`, `DateOfBirth`, `Age`, `PhoneNumber`, `Email`, `Address`, `EmergencyContactName`, `EmergencyContactPhone`, `BloodType`, `Allergies`, `MedicalConditions`, `RegistrationDate`, `PatientStatus`, `AssignedDoctorID`, `Notes`, `CreatedAt`, `UpdatedAt`
2. **`Doctors`**: Columns: `DoctorID`, `DoctorName`, `Gender`, `Specialization`, `DepartmentID`, `LicenseNumber`, `Phone`, `Email`, `Availability`, `Status`, `CreatedAt`
3. **`Departments`**: Columns: `DepartmentID`, `DepartmentName`, `DepartmentCode`, `HeadDoctorID`, `Building`, `Floor`, `Status`, `ConsultationFee`, `CreatedAt`
4. **`Appointments`**: Columns: `AppointmentID`, `AppointmentNumber`, `PatientID`, `DoctorID`, `DepartmentID`, `AppointmentDate`, `StartTime`, `EndTime`, `AppointmentType`, `ReasonForVisit`, `Status`, `Notes`, `CreatedAt`, `UpdatedAt`
5. **`Visits`**: Columns: `VisitID`, `PatientID`, `AppointmentID`, `DoctorID`, `VisitDate`, `ChiefComplaint`, `ClinicalNotes`, `DiagnosisSummary`, `TreatmentPlan`, `FollowUpDate`, `VisitStatus`, `CreatedAt`, `UpdatedAt`
6. **`VitalSigns`**: Columns: `VitalSignID`, `VisitID`, `PatientID`, `Temperature`, `BloodPressure`, `HeartRate`, `RespiratoryRate`, `OxygenSaturation`, `Weight`, `Height`, `BMI`, `RecordedBy`, `RecordedAt`, `Notes`
7. **`Diagnoses`**: Columns: `DiagnosisID`, `PatientID`, `VisitID`, `DoctorID`, `Diagnosis`, `DiagnosisCode`, `DiagnosisDate`, `Severity`, `Notes`, `CreatedAt`
8. **`Medications`**: Columns: `MedicationID`, `MedicationName`, `GenericName`, `Category`, `DosageForm`, `Strength`, `Unit`, `StockQuantity`, `ReorderLevel`, `UnitPrice`, `Status`, `CreatedAt`
9. **`Prescriptions`**: Columns: `PrescriptionID`, `PrescriptionNumber`, `PatientID`, `DoctorID`, `VisitID`, `PrescriptionDate`, `Status`, `Instructions`, `DispensedBy`, `DispensedAt`, `CreatedAt`, `UpdatedAt`
10. **`PrescriptionItems`**: Columns: `PrescriptionItemID`, `PrescriptionID`, `MedicationID`, `MedicationName`, `Dosage`, `Frequency`, `Duration`, `Quantity`, `Route`, `Instructions`, `Status`, `CreatedAt`
11. **`LaboratoryTests`**: Columns: `TestID`, `TestName`, `TestCode`, `Category`, `Description`, `NormalRange`, `Unit`, `Cost`, `Status`, `CreatedAt`
12. **`LaboratoryResults`**: Columns: `ResultID`, `PatientID`, `VisitID`, `DoctorID`, `TestID`, `TestName`, `TestDate`, `Result`, `ReferenceRange`, `Interpretation`, `Status`, `Notes`, `TechnicianName`, `CreatedAt`, `UpdatedAt`
13. **`Invoices`**: Columns: `InvoiceID`, `InvoiceNumber`, `PatientID`, `VisitID`, `InvoiceDate`, `TotalAmount`, `Discount`, `Tax`, `AmountPaid`, `Balance`, `PaymentStatus`, `Notes`, `CreatedAt`, `UpdatedAt`
14. **`Payments`**: Columns: `PaymentID`, `InvoiceID`, `PatientID`, `PaymentDate`, `Amount`, `PaymentMethod`, `ReferenceNumber`, `Notes`, `ReceivedBy`, `CreatedAt`
15. **`FollowUps`**: Columns: `FollowUpID`, `PatientID`, `DoctorID`, `RelatedVisitID`, `FollowUpDate`, `Reason`, `Status`, `Notes`, `CreatedAt`, `UpdatedAt`
16. **`Users`**: Columns: `UserID`, `Username`, `PasswordHash`, `FullName`, `Email`, `Role`, `DoctorID`, `DepartmentID`, `Status`, `CreatedAt`

---

## 5. Screen & Page Catalog

| Screen Name | Route / View ID | Description |
| :--- | :--- | :--- |
| **Executive Dashboard** | `dashboard` | 8 Dynamics KPI summary cards, interactive charts, and quick-action subgrids for rapid daily triage. |
| **Patients Grid** | `patients` | View selector (`Active`, `All`, `Inactive`), search, sortable columns, deactivation, and export to Excel/CSV. |
| **Patient Profile 360 Form** | `patient-form` | Header KPI tiles, Business Process Flow chevrons, tabs for Summary, Clinical Profile, Chronological Timeline, and Related Subgrids. |
| **Appointments Schedule** | `appointments` | Grid view and 7-day visual calendar view with double-booking prevention and 1-click check-in. |
| **Visits / Encounters** | `visits` | Clinical encounter tracker with access to vitals entry and physician consultation. |
| **Vital Signs Form** | `vitals-modal` | Temperature, BP, HR, RR, SpO2, Weight, Height, and automated BMI calculator. |
| **Clinical Consultation Form** | `consult-modal`| Chief complaint evaluation, notes, ICD-10 diagnosis selector, prescription writer, lab orderer, and follow-up scheduler. |
| **Prescriptions & Pharmacy** | `prescriptions` | Prescription order list with 1-click dispensing and inventory decrementing. |
| **Medication Inventory** | `medications` | Drug master inventory grid with stock levels, reorder threshold alerts, and unit pricing. |
| **Laboratory Test Master** | `laboratory_tests`| Test catalog with codes, specimen types, normal ranges, and pricing. |
| **Laboratory Results Form** | `laboratory_results`| Order triage, technician result entry, reference comparison, and critical flags. |
| **Billing & Invoices** | `billing` | Consolidated billing grid with automatic calculation of total, discount, tax, paid, and balance. |
| **Cashier Payment Receipt** | `payments` | Payment transaction history with overpayment guard and receipt printing. |
| **Patient Follow-ups** | `followups` | Care coordination follow-up scheduler with completion tracking. |
| **Doctors & Staff** | `doctors` | Physician directory with specialization, license number, and availability hours. |
| **Departments** | `departments` | Hospital department directory with buildings, floors, and standard fees. |
| **Reports & Analytics** | `reports` | Printable financial statements and clinical encounter distribution summaries. |
| **System Administration** | `administration`| Google Sheets connector settings, sync status, and database reset controls. |

---

## 6. User Roles & Permission Matrix

The application includes an active **Persona Switcher** in the top bar allowing instant demonstration of role-based security:

| Feature / View | Administrator | Receptionist | Doctor | Nurse | Pharmacist | Accountant |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Dashboard** | Full Access | Full Access | Full Access | Full Access | Full Access | Full Access |
| **Patients** | View / Create / Edit | View / Create / Edit | View Profiles | View Profiles | View Names | View Names |
| **Appointments** | Manage All | Schedule / Check-in | View Assigned | View Queue | - | - |
| **Visits & Encounters** | Full Access | Check-in Status | Consult / Document | Record Vitals | - | - |
| **Vital Signs** | View All | View | View | Record / Edit | - | - |
| **Diagnoses & Notes** | View All | - | Create / Edit | View | - | - |
| **Prescriptions** | View All | - | Prescribe | View | Dispense / Stock | - |
| **Medications** | Manage All | - | View Formulary | View | Inventory Stock | - |
| **Laboratory Results**| View All | - | Order / Review | View Orders | - | - |
| **Billing & Invoices**| Full Access | View Invoices | - | - | - | Create / Edit |
| **Payments** | Full Access | View Payments | - | - | - | Collect & Receipt |
| **Follow-ups** | Full Access | View | Schedule / Review | View | - | - |
| **Administration** | Full Access | - | - | - | - | - |

---

## 7. Business Rules Specifications

1. **Patient Number Uniqueness**: Every patient record must have a unique Medical Record Number (`PatientNumber`). Duplicate MRNs trigger an immediate validation error.
2. **Doctor Collision / Double-Booking Prevention**: An active doctor cannot be scheduled for two non-cancelled appointments at the exact same date and start time slot. The system validates doctor availability and displays a collision warning.
3. **Doctor Active Status Check**: Appointments can only be booked with doctors whose status is `Active`.
4. **Mandatory Patient & Doctor Association**: Completed visits and clinical prescriptions must be explicitly linked to a valid patient ID and an authorized doctor ID.
5. **Invoice Balance Formula**:
   $$\text{Balance} = (\text{TotalAmount} - \text{Discount} + \text{Tax}) - \text{AmountPaid}$$
6. **Payment Overpayment Prevention**: A payment transaction cannot exceed the outstanding invoice balance.
7. **Automated BMI Calculation**:
   $$\text{BMI} = \frac{\text{Weight (kg)}}{(\text{Height (m)})^2}$$
8. **Pharmacy Stock Depletion**: When a prescription item is dispensed by the pharmacist, the corresponding medication's `StockQuantity` is decremented in real time. If stock falls at or below `ReorderLevel`, the status is updated to `Low Stock`.

---

## 8. Sample Data Inventory

The system comes pre-seeded with 262 realistic fictional records:
* **Patients**: 22 diverse patient profiles with realistic medical conditions, allergies, and emergency contacts.
* **Doctors**: 5 licensed physicians across Internal Medicine, Interventional Cardiology, Pediatrics, Orthopedic Surgery, and Endocrinology.
* **Departments**: 5 departments (General Medicine, Cardiology, Pediatrics, Orthopedics, Endocrinology) with location metadata and fee schedules.
* **Appointments**: 32 appointment records spanning scheduled, confirmed, checked-in, and completed states.
* **Visits / Encounters**: 22 clinical visits with documentation and notes.
* **Vital Signs**: 22 vital sign recordings with temperature, BP, HR, RR, SpO2, and BMI calculations.
* **Diagnoses**: 18 ICD-10 diagnoses (Hypertension, Type 2 Diabetes, Asthma, Knee Osteoarthritis, etc.) with severity levels.
* **Medications**: 10 essential medications with stock quantities and reorder thresholds.
* **Prescriptions & Items**: 22 electronic prescriptions and prescription items.
* **Laboratory Tests & Results**: 8 master laboratory tests and 22 diagnostic results.
* **Invoices & Payments**: 18 invoices and 16 cashier payments verifying balance realizations.
* **Follow-ups**: 12 clinical follow-up records.

---

## 9. Google Sheets Setup Instructions

Follow these steps to link the frontend application to a live Google Sheets spreadsheet:

### Step 1: Create the Google Spreadsheet
1. Go to [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Name the spreadsheet: **`Hospital Management System — Google Sheets DB`**.
3. Copy the Spreadsheet ID from the browser URL:
   `https://docs.google.com/spreadsheets/d/{SPREADSHEET_ID}/edit`

### Step 2: Set Up Google Apps Script
1. In your Google Sheet, click **Extensions &rarr; Apps Script**.
2. Delete any boilerplate code in `Code.gs`.
3. In this repository, copy the contents of:
   - [`backend/DbSchema.gs`](file:///d:/CODING%20LESSION/HOSPITAL/backend/DbSchema.gs) &rarr; Paste into a new script file named `DbSchema.gs`
   - [`backend/DbService.gs`](file:///d:/CODING%20LESSION/HOSPITAL/backend/DbService.gs) &rarr; Paste into a new script file named `DbService.gs`
   - [`backend/SeedDataService.gs`](file:///d:/CODING%20LESSION/HOSPITAL/backend/SeedDataService.gs) &rarr; Paste into a new script file named `SeedDataService.gs`
   - [`backend/Code.gs`](file:///d:/CODING%20LESSION/HOSPITAL/backend/Code.gs) &rarr; Paste into `Code.gs`

### Step 3: Deploy as Web App
1. Click **Deploy &rarr; New deployment**.
2. Select type: **Web app**.
3. Configuration:
   - **Description**: `HMS Dynamics 365 API`
   - **Execute as**: `Me (your Google account)`
   - **Who has access**: `Anyone` (or `Anyone with Google account`)
4. Click **Deploy** and authorize the script permissions.
5. Copy the generated **Web app URL** (e.g., `https://script.google.com/macros/s/.../exec`).

### Step 4: Connect the Frontend
1. Open the application in your browser (`frontend/index.html`).
2. Click the **Google Sheets icon** in the top header or navigate to **Administration &rarr; Google Sheets Connection**.
3. Paste your Web App URL into the **Google Apps Script Web App URL** field.
4. Check **Enable Live Background Sync with Google Sheets**.
5. Click **Export Local Data to Google Sheets** to populate all 16 sheets with headers and sample records automatically!

---

## 10. Instructions for Replacing Google Sheets with Microsoft Dataverse

The architecture utilizes the **Repository Pattern** (`DAL`), making backend migration straightforward. To swap Google Sheets with Microsoft Dataverse in the future:

### Step 1: Create Microsoft Dataverse Tables
Using the [Power Apps Maker Portal](https://make.powerapps.com/):
1. In your target environment, create a custom Solution (e.g., `HealthcareManagement`).
2. Create 16 custom Dataverse tables matching the schema:
   - `ms_patient` (display: *Patient*)
   - `ms_appointment` (display: *Appointment*)
   - `ms_visit` (display: *Visit*)
   - `ms_vitalsign` (display: *Vital Sign*)
   - `ms_diagnosis` (display: *Diagnosis*)
   - `ms_prescription` (display: *Prescription*)
   - `ms_prescriptionitem` (display: *Prescription Item*)
   - `ms_medication` (display: *Medication*)
   - `ms_laboratorytest` (display: *Laboratory Test*)
   - `ms_laboratoryresult` (display: *Laboratory Result*)
   - `ms_invoice` (display: *Invoice*)
   - `ms_payment` (display: *Payment*)
   - `ms_followup` (display: *Follow-up*)
   - `ms_doctor` (display: *Doctor*)
   - `ms_department` (display: *Department*)
3. Configure Many-to-One (N:1) lookup relationships between tables (e.g., Lookup from `ms_appointment` to `ms_patient` and `ms_doctor`).

### Step 2: Register Microsoft Entra ID (Azure AD) App
1. In the [Azure Portal](https://portal.azure.com/), register a new Application: `Healthcare-HMS-Dataverse-Client`.
2. Under **API Permissions**, add permission for **Dynamics CRM / Dataverse**: `user_impersonation`.
3. Create an Application User in the Power Platform Admin Center and assign the `System Administrator` or custom `Healthcare Professional` security role.

### Step 3: Implement the Dataverse Provider in `app.js`
Replace the Google Sheets fetch routines in `DAL` with Dataverse Web API (OData v4) calls:

```javascript
// Example Dataverse Provider Integration
const DataverseProvider = {
  baseUrl: 'https://org8492.crm.dynamics.com/api/data/v9.2/',
  
  async request(entityPlural, method = 'GET', data = null) {
    const token = await getMsalToken(); // MSAL.js browser auth
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=utf-8',
      'OData-MaxVersion': '4.0',
      'OData-Version': '4.0'
    };
    return fetch(`${this.baseUrl}${entityPlural}`, {
      method,
      headers,
      body: data ? JSON.stringify(data) : null
    }).then(res => res.json());
  },

  async find(entityName) {
    const plural = DataverseEntityMap[entityName]; // e.g. ms_patients
    const res = await this.request(plural);
    return res.value;
  },

  async create(entityName, record) {
    const plural = DataverseEntityMap[entityName];
    return this.request(plural, 'POST', record);
  }
};
```

Because all UI grids, forms, and business logic interact exclusively with `DAL.find()`, `DAL.create()`, and `DAL.update()`, **no changes to any UI components, views, or forms are required**.
