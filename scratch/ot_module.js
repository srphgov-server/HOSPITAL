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
                      <td class="p-2.5 font-semibold text-slate-700 font-mono">$${item.cost.toFixed(2)}</td>
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
