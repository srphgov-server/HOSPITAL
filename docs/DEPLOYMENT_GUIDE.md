# Hospital Management Information System (HMIS)
## Google Sheets Database & Google Apps Script Backend Architecture

### Overview
This enterprise-grade Hospital Management Information System (HMIS) is designed for a medium-to-large hospital supporting **20 configurable clinical departments/clinics**, centralized patient Electronic Medical Records (EMR), outpatient & inpatient journeys, diagnostic services, operating theaters, supply logistics, and financial reconciliation.

---

### Key Components

1. **Backend (Google Apps Script API)**
   - ackend/DbSchema.gs: Schema definitions for 50+ relational tables across 4 Hubs.
   - ackend/DbService.gs: Google Sheets ORM with atomic locks, batching, and audit logging.
   - ackend/AuthService.gs: RBAC authentication and session token verification.
   - ackend/ClinicalServices.gs: Unique MRN generation, duplicate checking, OPD queues, SOAP notes, IPD bed map, and FEFO pharmacy dispensing.
   - ackend/DiagnosticSupportServices.gs: Laboratory, Radiology, Operating Theater (WHO checklist), Oxygen Center, and Laundry services.
   - ackend/SeedDataService.gs: Complete master data seeder for 20 clinical clinics, 30+ doctors/staff, beds, lab tests, medicines, and sample patients.
   - ackend/Code.gs: Web App router handling doGet and doPost requests.

2. **Frontend (Modern Responsive Web App)**
   - rontend/index.html: Tailwind CSS, Lucide icons, responsive drawer, and global search.
   - rontend/i18n.js: Complete bilingual dictionary for English and Khmer (ភាសាខ្មែរ).
   - rontend/app.js: Dynamic SPA router, interactive bed map, live OPD queue, and billing desk.

3. **Tests & Verification**
   - 	ests/integration_test.js: Automated test suite covering the entire patient lifecycle from registration through consultation, bed admission, FEFO pharmacy, billing, and audit logs.

---

### How to Deploy to Google Apps Script

1. Create a new Google Spreadsheet on your Google Drive.
2. Go to **Extensions -> Apps Script**.
3. Create script files corresponding to the .gs files in ackend/ (DbSchema.gs, DbService.gs, AuthService.gs, ClinicalServices.gs, DiagnosticSupportServices.gs, SeedDataService.gs, Code.gs).
4. Click **Deploy -> New Deployment**.
5. Select **Web App**, set **Execute as: Me** and **Who has access: Anyone**.
6. Copy the published Web App URL and paste it into the **Administration** screen in the frontend app (rontend/index.html).

---

### How to Run Locally

You can launch the frontend directly using any static web server:
`ash
npx serve frontend -p 3000
`
Or open rontend/index.html directly in any modern browser.
