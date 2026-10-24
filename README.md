# Dynamics 365 Model-Driven Healthcare Management System

A full-fidelity, enterprise-grade Hospital Information & Electronic Medical Record (EMR) system built with the Microsoft Dynamics 365 Model-driven Fluent UI design language. Includes end-to-end clinical workflows, multi-stage Business Process Flows (BPF), and complete Docker production containerization.

---

## 🏥 Clinical Modules & Capabilities

### 1. Outpatient Department (OPD)
- **5-Stage Guided Business Process Flow (BPF)**: Registration & Triage &rarr; Consultation & Vitals &rarr; Diagnostic Orders &rarr; Prescription &rarr; Discharge & Billing.
- **Diagnostic Orders & Lab Integration**: Real-time simulation of lab and imaging panels with instant critical alert triggers.
- **Prescription & e-Pharmacy**: Dosage, frequency, route, and automatic inventory allocation.
- **Direct OPD-to-IPD Escalation**: One-click transfer for patients requiring hospitalization.

### 2. Inpatient Department (IPD) & Ward Management
- **Bed Census & Live Occupancy**: Visual tracking of General Wards, Semi-Private, Deluxe, and ICU beds with status transitions (*Available, Occupied, Cleaning, Maintenance*).
- **IPD Order Bundles**: Lab, diagnostic, dietary, and nursing orders associated with active hospital stays.
- **Medication Administration Record (MAR)**: Scheduled medication administration logs with nurse signatures and administration verification.
- **Direct OT Escalation**: Direct surgery scheduling request trigger from IPD admissions.

### 3. Emergency Room (ER) & Trauma Triage
- **Canadian Triage & Acuity Scale (CTAS 1–5)**: Resuscitation (Red), Emergent (Orange), Urgent (Yellow), Less Urgent (Green), Non-Urgent (Blue).
- **Trauma & Resuscitation Bays**: Real-time ER bay management (`BAY-01` through `BAY-08`) with instant reassignment.
- **STAT Orders**: Rapid-turnaround emergency lab panels and point-of-care diagnostics.
- **ER Disposition Engine**: Direct discharge or immediate escalation to Emergency Surgery or Inpatient Admission.

### 4. Operation Theater (OT / OR) Suite Management
- **Live Suite Telemetry Dashboard**: Real-time monitoring of 4 operating suites (`OT-001` through `OT-004`) tracking surgery phase, ambient temp, humidity, pressure, and sterile status.
- **Surgical Team Rostering**: Lead Surgeon, Assistant Surgeon, Anesthesiologist, Anesthesia Technique, Scrub Nurse, and Circulating Nurse.
- **Material & Sterile Set Requisition**: Association of specialized CSSD sterile instrument trays and surgical consumables.
- **4-Stage Surgical BPF**: Pre-Op Clearance & Consent &rarr; Team & Suite Scheduling &rarr; Intra-Op & WHO Checklist &rarr; PACU Recovery.
- **WHO Surgical Safety Checklist**: Digital sign-in, time-out, and sign-out verification adhering to World Health Organization protocols.
- **Aldrete PACU Recovery Score**: Automated calculation across respiration, O2 saturation, consciousness, circulation, and activity prior to ward discharge.

### 5. Central Sterile Services Department (CSSD)
- **Instrument Tray Management**: Sterilization tracking across 8 specialized surgical sets (Orthopedic, Laparotomy, Craniotomy, Cardio-Vascular, etc.).
- **Decontamination & Autoclave Cycles**: Steam sterilizer chamber logs, sterilization temperature, pressure, duration, and cycle validation.
- **Chemical & Biological Indicators**: Pass/Fail quality assurance logging with sterile expiration date tracking.
- **Consumables Inventory**: Stock levels and one-click restock for drape packs, antimicrobial incise drapes, suction sets, and sutures.

### 6. Billing, Invoicing & Payments
- Financial calculations tracking Total Charges, Insurance Co-pays, Balance Due, and payment receipts.
- Automatic aggregation of consultation, bed stay, surgical suite, and pharmacy items.

### 7. Security, Auditing & Role-Based Access Control (RBAC)
- 6 pre-configured clinical personas:
  - **Hospital Administrator** (Full access)
  - **Chief Medical Officer / Physician** (Clinical records, diagnostics, surgeries)
  - **Head Nurse / Triage Officer** (Vitals, bed census, MAR, triage)
  - **Surgeon / OR Lead** (Surgical schedule, intra-op documentation, WHO checklist)
  - **CSSD Technician** (Sterilization batches, autoclave cycles, tray maintenance)
  - **Billing & Patient Accounts Specialist** (Invoicing, payments, financial reports)

---

## 🐳 Docker Deployment & Hosting

The application is containerized with a lightweight, secure Alpine Node.js runtime with built-in healthchecks, zero external npm production dependencies, and non-root execution.

### Prerequisites
- [Docker Engine](https://docs.docker.com/engine/install/) or [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on host.
- Optional: `docker-compose` (included in Docker Desktop).

### Option A: 1-Click Launch with Docker Compose (Recommended)

From the project root directory, run:

```bash
# Start the container in detached mode
docker compose up -d

# View real-time container logs
docker compose logs -f

# Check container health status
docker compose ps
```

The application will be live at: **[http://localhost:3000](http://localhost:3000)**.

To stop the container:
```bash
docker compose down
```

---

### Option B: Build and Run with Docker CLI

```bash
# 1. Build the production Docker image
docker build -t dynamics-healthcare:latest .

# 2. Run container mapping host port 3000 to container port 3000
docker run -d \
  -p 3000:3000 \
  --name dynamics-healthcare-app \
  --restart unless-stopped \
  dynamics-healthcare:latest

# 3. Verify health status
curl http://localhost:3000/health
```

To stop and remove the container:
```bash
docker stop dynamics-healthcare-app && docker rm dynamics-healthcare-app
```

---

## 🩺 Healthcheck & Monitoring Endpoints

The internal HTTP server (`server.js`) exposes container health endpoints:

| Endpoint | Method | Description | Response Example |
| :--- | :--- | :--- | :--- |
| `/health` | `GET` | Container & Load Balancer Healthcheck | `{"status":"healthy","service":"Dynamics 365 Healthcare System","uptime":120.45,"timestamp":"2026-10-20T09:25:00.000Z"}` |
| `/healthz` | `GET` | Kubernetes / Cloud Probe alias | Same as `/health` |
| `/api/health`| `GET` | Microservice gateway health check | Same as `/health` |

---

## 💻 Local Development & Verification

### Running Locally without Docker
```bash
# Start the live development server
npm start
# or: node server.js
```
Access the application at `http://localhost:3000`.

### Running the Test & Audit Suites
```bash
# Run the 26-point database and clinical data integrity test
npm test
# or: node tests/integration_test.js

# Run the 118-point comprehensive system & DOM audit
npm run audit
# or: node tests/system_audit.js
```

---

## 📁 Repository Directory Structure

```text
.
├── backend/
│   ├── AuthService.gs               # Authentication & token verification
│   ├── ClinicalServices.gs          # Patient, Visit, & Clinical data APIs
│   ├── Code.gs                      # Google Apps Script web app router
│   ├── DbSchema.gs                  # Relational schema (25 entity tables)
│   ├── DbService.gs                 # Data persistence layer & ORM
│   ├── DiagnosticSupportServices.gs # Labs, Imaging, & Pharmacy APIs
│   └── SeedDataService.gs           # 340+ enterprise clinical demo records
├── frontend/
│   ├── index.html                   # Dynamics 365 Fluent UI Model-driven layout
│   └── app.js                       # SPA Router, DAL, BPF Engines, OT & CSSD
├── tests/
│   ├── integration_test.js          # 26-step automated data & workflow test suite
│   └── system_audit.js              # 118-step DOM, Syntax, & Docker audit suite
├── Dockerfile                       # Multi-platform production Alpine container
├── docker-compose.yml               # Multi-service production orchestration
├── .dockerignore                    # Build optimization ignore list
├── package.json                     # NPM scripts and project metadata
├── server.js                        # Zero-dependency HTTP server with /health
└── README.md                        # Project documentation
```

---

## 🔒 Security Best Practices
- **Non-root Execution**: Runs as unprivileged Alpine `node` user (UID 1000).
- **Graceful Termination**: Handles POSIX `SIGTERM` and `SIGINT` signals with a 5-second graceful socket teardown window.
- **Zero-Dependency Core**: The HTTP server leverages Node.js standard library (`http`, `fs`, `path`), eliminating supply-chain vulnerabilities.
- **HTTP Security Headers**: Employs `X-Content-Type-Options: nosniff` and controlled CORS configurations.
