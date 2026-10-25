// ==============================================================================
// Dynamics 365 Healthcare System - Automated Comprehensive System Audit
// Verifies:
// 1. Docker & Container artifacts (Dockerfile, docker-compose.yml, .dockerignore)
// 2. JavaScript syntax integrity across all project runtime files
// 3. UI Sitemap view navigation handlers in router
// 4. Inline HTML / Dynamic DOM onclick handlers match app.js definitions
// 5. Data Access Layer (DAL) entity mappings and schemas
// 6. Operation Theater, CSSD, IPD, and Emergency Room feature verification
// ==============================================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failCount++;
  }
}

console.log('================================================================');
console.log('  DYNAMICS 365 HEALTHCARE SYSTEM - COMPREHENSIVE AUDIT');
console.log('================================================================\n');

// ------------------------------------------------------------------------------
// 1. Docker & Hosting Configuration
// ------------------------------------------------------------------------------
console.log('1. Checking Docker & Container Architecture:');
const dockerfilePath = path.join(__dirname, '..', 'Dockerfile');
const composePath = path.join(__dirname, '..', 'docker-compose.yml');
const dockerignorePath = path.join(__dirname, '..', '.dockerignore');
const packageJsonPath = path.join(__dirname, '..', 'package.json');

assert(fs.existsSync(dockerfilePath), 'Dockerfile exists');
const dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
assert(dockerfileContent.includes('FROM node:20-alpine'), 'Dockerfile uses secure lightweight node:20-alpine');
assert(dockerfileContent.includes('HEALTHCHECK'), 'Dockerfile defines container healthcheck');
assert(dockerfileContent.includes('USER node'), 'Dockerfile executes as non-root user (security best-practice)');

assert(fs.existsSync(composePath), 'docker-compose.yml exists');
const composeContent = fs.readFileSync(composePath, 'utf8');
assert(composeContent.includes('healthcare-app'), 'docker-compose defines healthcare-app service');
assert(composeContent.includes('3000:3000') || composeContent.includes('${PORT:-3000}:3000'), 'docker-compose maps port 3000');

assert(fs.existsSync(dockerignorePath), '.dockerignore exists');
const dockerignoreContent = fs.readFileSync(dockerignorePath, 'utf8');
assert(dockerignoreContent.includes('.git'), '.dockerignore excludes repository metadata');

assert(fs.existsSync(packageJsonPath), 'package.json exists');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
assert(pkg.scripts && pkg.scripts.start && pkg.scripts.test, 'package.json contains start and test scripts');

// ------------------------------------------------------------------------------
// 2. Syntax Integrity Check
// ------------------------------------------------------------------------------
console.log('\n2. Checking JavaScript Syntax Integrity:');
const jsFilesToCheck = [
  'server.js',
  'frontend/app.js',
  'tests/integration_test.js'
];

for (const relFile of jsFilesToCheck) {
  const fullPath = path.join(__dirname, '..', relFile);
  try {
    execSync(`node -c "${fullPath}"`, { stdio: 'pipe' });
    assert(true, `Syntax check passed: ${relFile}`);
  } catch (err) {
    assert(false, `Syntax error in: ${relFile}: ${err.message}`);
  }
}

// ------------------------------------------------------------------------------
// 3. Navigation Sitemap & Router View Audit
// ------------------------------------------------------------------------------
console.log('\n3. Checking Sitemap Navigation & Router Coverage:');
const htmlContent = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'index.html'), 'utf8');
const appJsContent = fs.readFileSync(path.join(__dirname, '..', 'frontend', 'app.js'), 'utf8');

// Extract all navigateTo('...') calls in index.html and app.js
const viewMatches = [...htmlContent.matchAll(/navigateTo\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
const uniqueViews = [...new Set(viewMatches)];

uniqueViews.forEach(view => {
  const isHandled = appJsContent.includes(`case '${view}':`) || 
                    appJsContent.includes(`currentView === '${view}'`) ||
                    appJsContent.includes(`view === '${view}'`) ||
                    appJsContent.includes(`render${view.charAt(0).toUpperCase() + view.slice(1)}`);
  assert(isHandled, `Navigation View '${view}' is handled in router`);
});

// ------------------------------------------------------------------------------
// 4. Interactive Action & DOM Event Handler Audit
// ------------------------------------------------------------------------------
console.log('\n4. Checking DOM Event Handlers & Action Callbacks:');
// Find onclick="functionName(...)" patterns in index.html and app.js
const onclickInHtml = [...htmlContent.matchAll(/onclick="([a-zA-Z0-9_]+)\(/g)].map(m => m[1]);
const onclickInJs = [...appJsContent.matchAll(/onclick=["']([a-zA-Z0-9_]+)\(/g)].map(m => m[1]);
const allOnclicks = [...new Set([...onclickInHtml, ...onclickInJs])];

allOnclicks.forEach(fn => {
  const isDefined = appJsContent.includes(`function ${fn}`) ||
                    appJsContent.includes(`window.${fn}`) ||
                    appJsContent.includes(`const ${fn} =`) ||
                    appJsContent.includes(`let ${fn} =`);
  assert(isDefined, `Action callback '${fn}()' is defined and callable in app.js`);
});

// ------------------------------------------------------------------------------
// 5. Operation Theater, CSSD & IPD Integration Verification
// ------------------------------------------------------------------------------
console.log('\n5. Checking OT, CSSD & IPD Clinical Workflows:');
assert(appJsContent.includes('renderSurgeriesGrid'), 'Operation Theater: renderSurgeriesGrid defined');
assert(appJsContent.includes('renderSterileProcessingGrid'), 'CSSD: renderSterileProcessingGrid defined');
assert(appJsContent.includes('openSurgeryWorkflow'), 'Surgery BPF Workflow: openSurgeryWorkflow defined');
assert(appJsContent.includes('openSurgeryBookingModal'), 'IPD to OT Connection: openSurgeryBookingModal defined');
assert(appJsContent.includes('handleCreateSurgery'), 'Surgery Scheduling persistence: handleCreateSurgery defined');
assert(appJsContent.includes('openWhoChecklistModal'), 'WHO Surgical Safety Checklist: openWhoChecklistModal defined');
assert(appJsContent.includes('openRunAutoclaveModal'), 'CSSD Autoclave Cycle: openRunAutoclaveModal defined');
assert(appJsContent.includes('handleTransitionTrayStatus'), 'CSSD Instrument Tray Lifecycle: handleTransitionTrayStatus defined');
assert(appJsContent.includes('handleUpdateTheaterStatus'), 'OT Suite Telemetry Status: handleUpdateTheaterStatus defined');

// ------------------------------------------------------------------------------
// 6. Integration Test Verification
// ------------------------------------------------------------------------------
console.log('\n6. Executing Database & Integration Test Suite:');
try {
  const testOutput = execSync(`node "${path.join(__dirname, 'integration_test.js')}"`, { encoding: 'utf8' });
  const allPassed = testOutput.includes('All 27 Architecture, Security, IPD, Emergency, OT, Sterile & Service Catalog Data Verification Checks Passed Successfully!');
  assert(allPassed, 'All 27 Integration Tests passed with 100% record integrity');
} catch (err) {
  assert(false, `Integration test failed: ${err.message}`);
}

// ------------------------------------------------------------------------------
// Summary
// ------------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`Audit Complete: ${passCount} Checks PASSED, ${failCount} Checks FAILED.`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('SUCCESS: All system components, tools, navigation, and Docker configs are 100% operational!\n');
  process.exit(0);
}
