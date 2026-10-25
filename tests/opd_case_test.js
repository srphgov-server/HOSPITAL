const fs = require('fs');
const path = require('path');
const vm = require('vm');

// 1. Mock browser DOM and environment
global.window = global;
global.document = {
  documentElement: { lang: 'en' },
  body: { classList: { add: () => {}, remove: () => {} } },
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  getElementById: (id) => {
    return {
      value: '',
      innerHTML: '',
      className: '',
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      }
    };
  }
};
global.localStorage = {
  store: {},
  getItem: function(key) { return this.store[key] || null; },
  setItem: function(key, val) { this.store[key] = String(val); },
  removeItem: function(key) { delete this.store[key]; },
  clear: function() { this.store = {}; }
};

// 2. Load i18n and app.js
const i18nContent = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'i18n.js'), 'utf8');
vm.runInThisContext(i18nContent);

const appJsContent = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'app.js'), 'utf8');
vm.runInThisContext(appJsContent);

console.log('================================================================');
console.log('  OPD CLINICAL ENCOUNTER CASE CLASSIFICATION TEST SUITE');
console.log('================================================================\n');

let pass = 0;
let fail = 0;
function test(desc, cond) {
  if (cond) {
    console.log(`  [PASS] ${desc}`);
    pass++;
  } else {
    console.error(`  [FAIL] ${desc}`);
    fail++;
  }
}

// 1. Database Init and Seed Data
DAL.init();
const allVisits = DAL.find('Visits');
test('Visits seeded in database', allVisits.length >= 20);

// 2. Check CaseType field existence
const newCases = allVisits.filter(v => v.CaseType === 'New Case');
const oldCases = allVisits.filter(v => v.CaseType === 'Old Case');

test('New Cases exist in Visits dataset', newCases.length > 0);
test('Old Cases exist in Visits dataset', oldCases.length > 0);
test('Total Visits equals New Cases + Old Cases', (newCases.length + oldCases.length) === allVisits.length);

console.log(`\n  OPD Encounters Breakdown: Total=${allVisits.length}, New Cases=${newCases.length}, Old Cases=${oldCases.length}`);

// 3. Verify Old Cases have PreviousVisitID link
const oldCasesWithLink = oldCases.filter(v => v.PreviousVisitID && v.PreviousVisitID.length > 0);
test('Old Cases have PreviousVisitID linkage', oldCasesWithLink.length > 0);

// 4. Test Case Type Filter Logic
appState.opdCaseFilter = 'new';
let filteredNew = allVisits.filter(v => v.CaseType === 'New Case');
test('Filter by "new" returns only New Cases', filteredNew.every(v => v.CaseType === 'New Case') && filteredNew.length === newCases.length);

appState.opdCaseFilter = 'old';
let filteredOld = allVisits.filter(v => v.CaseType === 'Old Case');
test('Filter by "old" returns only Old Cases', filteredOld.every(v => v.CaseType === 'Old Case') && filteredOld.length === oldCases.length);

// 5. Test Quick Check-In Auto-Detect Case Type
const apptNewPatient = { AppointmentID: 'APT-TEST-001', PatientID: 'PAT-NON-EXISTENT', DoctorID: 'DOC-001', AppointmentDate: '2026-03-25', ReasonForVisit: 'General check' };
const apptOldPatient = { AppointmentID: 'APT-TEST-002', PatientID: oldCases[0].PatientID, DoctorID: 'DOC-001', AppointmentDate: '2026-03-25', ReasonForVisit: 'Follow up' };

DAL.create('Appointments', apptNewPatient);
DAL.create('Appointments', apptOldPatient);

quickCheckIn(apptNewPatient.AppointmentID);
const createdNewVisit = DAL.find('Visits', { AppointmentID: apptNewPatient.AppointmentID })[0];
test('Quick check-in for new patient creates New Case encounter', createdNewVisit && createdNewVisit.CaseType === 'New Case');

quickCheckIn(apptOldPatient.AppointmentID);
const createdOldVisit = DAL.find('Visits', { AppointmentID: apptOldPatient.AppointmentID })[0];
test('Quick check-in for returning patient creates Old Case encounter with prior link', createdOldVisit && createdOldVisit.CaseType === 'Old Case' && createdOldVisit.PreviousVisitID.length > 0);

// 6. Test i18n Translations
test('i18n English contains case_type', i18n.translations.en.case_type === 'Case Type');
test('i18n English contains new_case and old_case', i18n.translations.en.new_case_short === 'New Case' && i18n.translations.en.old_case_short === 'Old Case');
test('i18n Khmer contains case_type (ប្រភេទករណី)', i18n.translations.kh.case_type === 'ប្រភេទករណី');
test('i18n Khmer contains new_case and old_case', i18n.translations.kh.new_case_short === 'ករណីថ្មី' && i18n.translations.kh.old_case_short === 'ករណីចាស់');

// 7. Test UI Grid Rendering
const gridHtml = renderVisitsGrid();
test('renderVisitsGrid includes Case Classification header', gridHtml.includes('Case Classification'));
test('renderVisitsGrid includes New Cases filter pill', gridHtml.includes('New Cases'));
test('renderVisitsGrid includes Old Cases filter pill', gridHtml.includes('Old Cases'));
test('renderVisitsGrid renders New Case badge', gridHtml.includes('New Case'));
test('renderVisitsGrid renders Old Case badge', gridHtml.includes('Old Case'));

// 8. Test OPD Workflow Stages Rendering
const testOldVisit = oldCases[0];
const pat = DAL.findById('Patients', testOldVisit.PatientID);
const doc = DAL.findById('Doctors', testOldVisit.DoctorID);
const vitals = DAL.find('VitalSigns', { VisitID: testOldVisit.VisitID })[0] || {};

const stage1Html = renderOpdStage1_Triage(testOldVisit, pat, doc, vitals);
test('Stage 1 Triage displays Old Case indicator for returning patient', stage1Html.includes('Old Case') || stage1Html.includes('Returning Patient'));

const stage2Html = renderOpdStage2_Consultation(testOldVisit, pat, doc, vitals);
test('Stage 2 Consultation displays Returning Patient Clinical History timeline', stage2Html.includes('Returning Patient Clinical History') || stage2Html.includes('Prior Diagnosis'));

console.log('\n================================================================');
console.log(`Results: ${pass} PASSED, ${fail} FAILED`);
console.log('================================================================\n');

if (fail > 0) process.exit(1);
process.exit(0);
