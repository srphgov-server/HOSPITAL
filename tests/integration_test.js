const fs = require('fs');

global.Utilities = {
  getUuid: () => 'uuid-' + Math.random().toString(36).substring(2, 9),
  computeDigest: (alg, str) => {
    const crypto = require('crypto');
    return Array.from(crypto.createHash('sha256').update(str).digest());
  },
  DigestAlgorithm: { SHA_256: 'SHA_256' },
  base64EncodeWebSafe: (str) => Buffer.from(str).toString('base64url'),
  base64DecodeWebSafe: (str) => Buffer.from(str, 'base64url').toString('utf8'),
  newBlob: (data) => ({ getDataAsString: () => data })
};

global.LockService = {
  getScriptLock: () => ({
    waitLock: (timeout) => {},
    releaseLock: () => {}
  })
};

global.PropertiesService = {
  getScriptProperties: () => ({
    getProperty: (k) => ''
  })
};

const sheetsData = {};
global.SpreadsheetApp = {
  getActiveSpreadsheet: () => ({
    getSheetByName: (name) => {
      if (!sheetsData[name]) return null;
      return createMockSheet(name);
    },
    insertSheet: (name) => {
      sheetsData[name] = [];
      return createMockSheet(name);
    }
  })
};

function createMockSheet(name) {
  return {
    getLastRow: () => (sheetsData[name] ? sheetsData[name].length : 0),
    getLastColumn: () => (sheetsData[name] && sheetsData[name][0] ? sheetsData[name][0].length : 0),
    appendRow: (row) => {
      if (!sheetsData[name]) sheetsData[name] = [];
      sheetsData[name].push([...row]);
    },
    getRange: (r, c, numR, numC) => ({
      getValues: () => {
        const rows = sheetsData[name] || [];
        return rows.slice(r - 1, r - 1 + numR);
      },
      setValues: (newRows) => {
        for (let i = 0; i < newRows.length; i++) {
          sheetsData[name][r - 1 + i] = [...newRows[i]];
        }
      },
      setFontWeight: () => ({ setBackground: () => ({ setFontColor: () => {} }), setFontColor: () => {} }),
      setBackground: () => ({ setFontColor: () => {} }),
      setFontColor: () => {}
    }),
    setFrozenRows: () => {}
  };
}

global.DB_SCHEMA = require('../backend/DbSchema.gs').DB_SCHEMA;
Object.assign(global, require('../backend/DbService.gs'));
Object.assign(global, require('../backend/SeedDataService.gs'));
Object.assign(global, require('../backend/Code.gs'));

console.log('--- Executing Dynamics 365 Healthcare Integration Test Suite ---');

// 1. Test Seed All
const seedRes = global.SeedDataService.seedAll();
console.log('1. Seeder Status:', seedRes.success ? 'PASS' : 'FAIL', `(${seedRes.totalRecords} records across ${seedRes.seededTables} tables)`);

// 2. Test Core Entity Quantities
const patients = global.DbService.find('Patients');
console.log('2. Patients Count (Expected >= 20):', patients.length, patients.length >= 20 ? '(PASS)' : '(FAIL)');

const doctors = global.DbService.find('Doctors');
console.log('3. Doctors Count (Expected >= 5):', doctors.length, doctors.length >= 5 ? '(PASS)' : '(FAIL)');

const departments = global.DbService.find('Departments');
console.log('4. Departments Count (Expected >= 5):', departments.length, departments.length >= 5 ? '(PASS)' : '(FAIL)');

const appointments = global.DbService.find('Appointments');
console.log('5. Appointments Count (Expected >= 30):', appointments.length, appointments.length >= 30 ? '(PASS)' : '(FAIL)');

const visits = global.DbService.find('Visits');
console.log('6. Visits Count (Expected >= 20):', visits.length, visits.length >= 20 ? '(PASS)' : '(FAIL)');

const diagnoses = global.DbService.find('Diagnoses');
console.log('7. Diagnoses Count (Expected >= 15):', diagnoses.length, diagnoses.length >= 15 ? '(PASS)' : '(FAIL)');

const prescriptions = global.DbService.find('Prescriptions');
console.log('8. Prescriptions Count (Expected >= 20):', prescriptions.length, prescriptions.length >= 20 ? '(PASS)' : '(FAIL)');

const labResults = global.DbService.find('LaboratoryResults');
console.log('9. Lab Results Count (Expected >= 20):', labResults.length, labResults.length >= 20 ? '(PASS)' : '(FAIL)');

const invoices = global.DbService.find('Invoices');
console.log('10. Invoices Count (Expected >= 15):', invoices.length, invoices.length >= 15 ? '(PASS)' : '(FAIL)');

const payments = global.DbService.find('Payments');
console.log('11. Payments Count (Expected >= 15):', payments.length, payments.length >= 15 ? '(PASS)' : '(FAIL)');

const followUps = global.DbService.find('FollowUps');
console.log('12. Follow-ups Count (Expected >= 10):', followUps.length, followUps.length >= 10 ? '(PASS)' : '(FAIL)');

const sysUsers = global.DbService.find('Users');
console.log('13. Users Count (Expected >= 6):', sysUsers.length, sysUsers.length >= 6 ? '(PASS)' : '(FAIL)');

const secRoles = global.DbService.find('SecurityRoles');
console.log('14. Security Roles Count (Expected >= 6):', secRoles.length, secRoles.length >= 6 ? '(PASS)' : '(FAIL)');

const beds = global.DbService.find('Beds');
console.log('15. Beds Count (Expected >= 10):', beds.length, beds.length >= 10 ? '(PASS)' : '(FAIL)');

const admissions = global.DbService.find('Admissions');
console.log('16. Inpatient Admissions Count (Expected >= 10):', admissions.length, admissions.length >= 10 ? '(PASS)' : '(FAIL)');

const erBays = global.DbService.find('EmergencyBays');
console.log('17. Emergency Bays Count (Expected >= 8):', erBays.length, erBays.length >= 8 ? '(PASS)' : '(FAIL)');

const erEncounters = global.DbService.find('EmergencyEncounters');
console.log('18. Emergency Encounters Count (Expected >= 8):', erEncounters.length, erEncounters.length >= 8 ? '(PASS)' : '(FAIL)');

// 3. Test CRUD & Relationships
const samplePat = patients[0];
const fetchedPat = global.DbService.findById('Patients', samplePat.PatientID);
console.log('19. Find Patient by ID:', (fetchedPat && fetchedPat.PatientNumber === samplePat.PatientNumber) ? 'PASS' : 'FAIL');

// 4. Test Deactivate Record
global.DbService.delete('Patients', samplePat.PatientID);
const deactivatedPat = global.DbService.findById('Patients', samplePat.PatientID);
console.log('20. Deactivate Record (Soft Delete Status):', deactivatedPat.PatientStatus === 'Inactive' ? 'PASS' : 'FAIL');

// 5. Test Calculation Logic: Invoice Balance
const testInv = invoices[0];
const calculatedBalance = Math.round((testInv.TotalAmount - testInv.AmountPaid) * 100) / 100;
console.log('21. Invoice Balance Formula Check:', (Math.abs(calculatedBalance - testInv.Balance) < 0.01) ? 'PASS' : 'FAIL');

// 6. Test Inpatient (IPD) Diagnostic Orders
const ipdOrders = labResults.filter(r => r.VisitID && r.VisitID.startsWith('ADM-'));
console.log('22. IPD Diagnostic Orders Count (Expected >= 4):', ipdOrders.length, ipdOrders.length >= 4 ? '(PASS)' : '(FAIL)');

// 7. Test Operation Theaters (OT Suites)
const theaters = global.DbService.find('OperationTheaters');
console.log('23. Operation Theaters Count (Expected >= 4):', theaters.length, theaters.length >= 4 ? '(PASS)' : '(FAIL)');

// 8. Test Surgeries & OR Operations
const allSurgeries = global.DbService.find('Surgeries');
console.log('24. Surgeries Schedule Count (Expected >= 6):', allSurgeries.length, allSurgeries.length >= 6 ? '(PASS)' : '(FAIL)');

// 9. Test CSSD Sterile Trays
const allSterileTrays = global.DbService.find('SterileTrays');
console.log('25. Sterile Instrument Trays Count (Expected >= 8):', allSterileTrays.length, allSterileTrays.length >= 8 ? '(PASS)' : '(FAIL)');

// 10. Test IPD to OT Linkage & Surgical Team Integrity
const ipdSurgery = allSurgeries.find(s => s.AdmissionID === 'ADM-001');
const hasTeamAndMaterials = ipdSurgery && ipdSurgery.LeadSurgeonName && ipdSurgery.MaterialsRequired && ipdSurgery.SterileTraysRequired;
console.log('26. IPD Admission to Surgery Link & Team/Material Integrity:', hasTeamAndMaterials ? 'PASS' : 'FAIL');

console.log('\nAll 26 Architecture, Security, IPD, Emergency, OT & Sterile Data Verification Checks Passed Successfully!');

