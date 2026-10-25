/**
 * Microsoft Dynamics 365 Model-driven Healthcare Management System
 * HMIS Comprehensive Bilingual Dictionary (English & Khmer - ភាសាខ្មែរ)
 * Sieam Reap Provincial Referral Hospital (មន្ទីរពេទ្យបង្អែកខេត្តសៀមរាប)
 */
const i18n = {
  currentLang: (typeof localStorage !== 'undefined' && (localStorage.getItem('d365_hms_lang') || localStorage.getItem('hmis_lang'))) || 'en',
  
  translations: {
    en: {
      // Hospital Branding & Header
      hospital_name: "Sieam Reap Provincial Referral Hospital",
      system_title: "Healthcare Management System",
      prototype_badge: "Prototype",
      search_placeholder: "Search records (Patient name, MRN, Doctor, Invoice, Appointment #)...",
      demo_tour_btn: "Run Demo Tour",
      quick_create: "Quick Create",
      role_label: "Role:",
      lang_label: "Language:",
      lang_en: "English",
      lang_kh: "ភាសាខ្មែរ",
      area_healthcare: "Area: Healthcare",
      proto_notice: "PROTOTYPE NOTICE",
      proto_desc: "Sieam Reap Provincial Referral Hospital - Model-driven Architecture Prototype for Healthcare Workflows. Backed by Google Sheets / Dataverse-ready Repository. All patient data fictional.",
      demo_tour_link: "Step-by-Step Demo Tour",

      // Sitemap Navigation Groups
      group_workplace: "Workplace",
      group_clinical_care: "Clinical Care",
      group_surgical_sterile: "Surgical & Sterile",
      group_pharmacy_labs: "Pharmacy & Labs",
      group_financials: "Financials",
      group_management: "Management",

      // Sitemap Navigation Views
      nav_dashboard: "Dashboard",
      nav_patients: "Patients",
      nav_appointments: "Appointments",
      nav_visits: "OPD Encounters & Workflow",
      nav_admissions: "Inpatient (IPD) Admissions",
      nav_emergency: "Emergency (ER / ED)",
      nav_emergency_bays: "ER Trauma & Bays",
      nav_beds: "Beds & Ward Management",
      nav_medical_history: "Medical History",
      nav_diagnoses: "Diagnoses",
      nav_surgeries: "Operation Theater (OT)",
      nav_sterile_processing: "CSSD & Sterile Sets",
      nav_prescriptions: "Prescriptions",
      nav_medications: "Medications",
      nav_laboratory_tests: "Laboratory Tests",
      nav_laboratory_results: "Laboratory Results",
      nav_billing: "Billing & Invoices",
      nav_payments: "Payments",
      nav_doctors: "Doctors",
      nav_departments: "Departments",
      nav_services: "Service List & Fees",
      nav_followups: "Follow-ups",
      nav_reports: "Reports",
      nav_users: "Users",
      nav_security_roles: "Security Roles",
      nav_administration: "Administration",

      // Quick Create Menu Items
      qc_patient: "New Patient",
      qc_appointment: "New Appointment",
      qc_visit: "Start OPD Process",
      qc_admission: "New IPD Admission",
      qc_emergency: "New ER Triage Intake",
      qc_prescription: "New Prescription",
      qc_lab_result: "New Lab Result",
      qc_payment: "Record Payment",
      qc_followup: "New Follow-up",
      qc_surgery: "Schedule Surgery / OT",
      qc_sterile_tray: "New Sterile Tray (CSSD)",
      qc_user: "New User",
      qc_service: "New Service / Fee",

      // Ribbon Actions
      ribbon_save_close: "Save & Close",
      ribbon_back_list: "Back to List",
      ribbon_deactivate: "Deactivate",
      ribbon_print: "Print",
      ribbon_refresh: "Refresh Data",
      ribbon_export: "Export to Excel",
      ribbon_new: "New",
      ribbon_switch_grid: "Switch to Grid",
      ribbon_switch_calendar: "Switch to Calendar",

      // User Personas & Roles
      role_admin: "System Administrator",
      role_receptionist: "Front Desk Receptionist",
      role_doctor: "Attending Physician",
      role_nurse: "Clinical Triage Nurse",
      role_pharmacist: "Chief Pharmacist",
      role_accountant: "Billing & Cashier Specialist",

      // Dashboard
      executive_overview: "Healthcare Executive Overview",
      system_dashboard: "System Dashboard",
      overview_subtitle: "Real-time operational KPIs, clinical pipeline, and financial performance.",
      as_of_today: "As of Today:",
      guided_demo: "Guided Demo",
      total_patients: "Total Patients",
      today_appts: "Today's Appointments",
      completed_visits: "Completed Visits",
      pending_appts: "Pending Appts",
      outstanding_balance: "Outstanding Balance",
      critical_lab_alerts: "Pending Lab Orders",
      active_prescriptions: "Active Prescriptions",
      upcoming_followups: "Upcoming Follow-ups",
      active_er_cases: "Active ER Cases",
      bed_occupancy: "Bed Occupancy Rate",
      active_theatres: "Active Operating Theaters",
      active_queue: "Active queue",
      fully_documented: "Fully documented",
      scheduled_checkin: "Scheduled / check-in",
      this_month: "this month",
      all_documented: "All documented",
      in_workflow: "In clinical workflow",
      ready_to_dispense: "Ready to dispense",
      due_in_7_days: "Due in 7 days",

      // Common Fields & Table Headers
      mrn: "Medical Record No (MRN)",
      full_name: "Full Name",
      phone: "Phone Number",
      dob: "Date of Birth",
      gender: "Gender",
      gender_male: "Male",
      gender_female: "Female",
      gender_other: "Other",
      blood_group: "Blood Group",
      national_id: "National ID",
      address: "Residential Address",
      allergies: "Known Allergies",
      status: "Status",
      action: "Action",
      actions: "Actions",
      doctor: "Doctor",
      department: "Department",
      date: "Date",
      time: "Time",
      amount: "Amount",
      balance: "Balance Due",
      diagnosis: "Diagnosis",
      medication: "Medication",
      dosage: "Dosage",
      instructions: "Instructions",
      case_type: "Case Type",
      new_case: "New Case (ករណីថ្មី)",
      old_case: "Old Case (ករណីចាស់)",
      new_case_short: "New Case",
      old_case_short: "Old Case",
      new_case_desc: "First visit for this condition / initial OPD presentation",
      old_case_desc: "Patient used to come for visit / follow-up / repeat consultation",
      returning_patient: "Returning Patient (Used to visit)",
      first_time_patient: "First-time Patient",
      past_visits: "Previous Visits",
      prior_encounters: "Prior Clinical Encounters",
      filter_all_cases: "All Cases",
      filter_new_cases: "New Cases",
      filter_old_cases: "Old Cases (Re-visits)",

      // Statuses
      status_active: "Active",
      status_inactive: "Inactive",
      status_completed: "Completed",
      status_pending: "Pending",
      status_in_progress: "In Progress",
      status_scheduled: "Scheduled",
      status_cancelled: "Cancelled",
      status_available: "Available",
      status_occupied: "Occupied",
      status_cleaning: "Cleaning",
      status_maintenance: "Maintenance",

      // Buttons
      save: "Save",
      cancel: "Cancel",
      close: "Close",
      edit: "Edit",
      delete: "Delete",
      view: "View",
      search: "Search",
      filter: "Filter",
      export: "Export",
      print: "Print",
      confirm: "Confirm",
      prev: "Prev",
      next: "Next",

      // Toast Notifications
      toast_lang_switched: "Language switched to English"
    },

    kh: {
      // Hospital Branding & Header
      hospital_name: "មន្ទីរពេទ្យបង្អែកខេត្តសៀមរាប",
      system_title: "ប្រព័ន្ធគ្រប់គ្រងមន្ទីរពេទ្យ",
      prototype_badge: "សាកល្បង",
      search_placeholder: "ស្វែងរកកំណត់ត្រា (ឈ្មោះអ្នកជំងឺ, MRN, គ្រូពេទ្យ, វិក្កយបត្រ...)...",
      demo_tour_btn: "ដំណើរការទស្សនកិច្ចសាកល្បង",
      quick_create: "បង្កើតរហ័ស",
      role_label: "តួនាទី:",
      lang_label: "ភាសា:",
      lang_en: "English",
      lang_kh: "ភាសាខ្មែរ",
      area_healthcare: "ផ្នែក: សុខាភិបាល",
      proto_notice: "ដំណឹងសាកល្បង",
      proto_desc: "មន្ទីរពេទ្យបង្អែកខេត្តសៀមរាប - ប្រព័ន្ធគំរូស្ថាបត្យកម្មគ្រប់គ្រងលំហូរការងារសុខាភិបាល តភ្ជាប់ជាមួយ Google Sheets / Dataverse។ ទិន្នន័យទាំងអស់ជាទិន្នន័យសាកល្បង។",
      demo_tour_link: "ការណែនាំជាជំហានៗ",

      // Sitemap Navigation Groups
      group_workplace: "កន្លែងធ្វើការ",
      group_clinical_care: "ការព្យាបាលគ្លីនិក",
      group_surgical_sterile: "បន្ទប់វះកាត់ & មាប់មគ",
      group_pharmacy_labs: "ឱសថស្ថាន & មន្ទីរពិសោធន៍",
      group_financials: "ហិរញ្ញវត្ថុ & វិក្កយបត្រ",
      group_management: "ការគ្រប់គ្រងប្រព័ន្ធ",

      // Sitemap Navigation Views
      nav_dashboard: "ផ្ទាំងគ្រប់គ្រងទូទៅ",
      nav_patients: "អ្នកជំងឺ",
      nav_appointments: "ការណាត់ជួប",
      nav_visits: "ការពិនិត្យ OPD & លំហូរការងារ",
      nav_admissions: "សម្រាកព្យាបាល (IPD)",
      nav_emergency: "សង្គ្រោះបន្ទាន់ (ER / ED)",
      nav_emergency_bays: "គ្រែសង្គ្រោះបន្ទាន់ & របួសធ្ងន់",
      nav_beds: "ការគ្រប់គ្រងគ្រែ & អគារ",
      nav_medical_history: "ប្រវត្តិវេជ្ជសាស្ត្រ",
      nav_diagnoses: "រោគវិនិច្ឆ័យ",
      nav_surgeries: "បន្ទប់វះកាត់ (OT)",
      nav_sterile_processing: "មាប់មគ & ឧបករណ៍វះកាត់ (CSSD)",
      nav_prescriptions: "វេជ្ជបញ្ជា",
      nav_medications: "ឱសថ & ឃ្លាំងថ្នាំ",
      nav_laboratory_tests: "តេស្តមន្ទីរពិសោធន៍",
      nav_laboratory_results: "លទ្ធផលមន្ទីរពិសោធន៍",
      nav_billing: "ការចេញវិក្កយបត្រ",
      nav_payments: "ការទូទាត់ប្រាក់",
      nav_doctors: "គ្រូពេទ្យ",
      nav_departments: "ផ្នែក / ដេប៉ាតឺម៉ង់",
      nav_services: "បញ្ជីសេវា & តម្លៃសេវា",
      nav_followups: "ការតាមដានបន្ត",
      nav_reports: "របាយការណ៍",
      nav_users: "អ្នកប្រើប្រាស់",
      nav_security_roles: "តួនាទីសុវត្ថិភាព",
      nav_administration: "ការគ្រប់គ្រងប្រព័ន្ធ",

      // Quick Create Menu Items
      qc_patient: "អ្នកជំងឺថ្មី",
      qc_appointment: "ការណាត់ជួបថ្មី",
      qc_visit: "ចាប់ផ្តើមពិនិត្យ OPD",
      qc_admission: "សម្រាកព្យាបាល IPD ថ្មី",
      qc_emergency: "សង្គ្រោះបន្ទាន់ថ្មី (Triage)",
      qc_prescription: "វេជ្ជបញ្ជាថ្មី",
      qc_lab_result: "លទ្ធផលតេស្តថ្មី",
      qc_payment: "កត់ត្រាការបង់ប្រាក់",
      qc_followup: "ការតាមដានថ្មី",
      qc_surgery: "កាលវិភាគវះកាត់ (OT)",
      qc_sterile_tray: "កញ្ចប់ឧបករណ៍មាប់មគថ្មី",
      qc_user: "អ្នកប្រើប្រាស់ថ្មី",
      qc_service: "សេវាព្យាបាលថ្មី",

      // Ribbon Actions
      ribbon_save_close: "រក្សាទុក & បិទ",
      ribbon_back_list: "ត្រឡប់ទៅបញ្ជី",
      ribbon_deactivate: "បិទដំណើរការ",
      ribbon_print: "បោះពុម្ព",
      ribbon_refresh: "ផ្ទុកឡើងវិញ",
      ribbon_export: "ទាញចេញជា Excel",
      ribbon_new: "ថ្មី",
      ribbon_switch_grid: "ប្តូរទៅជាតារាង",
      ribbon_switch_calendar: "ប្តូរទៅជាប្រតិទិន",

      // User Personas & Roles
      role_admin: "អ្នកគ្រប់គ្រងប្រព័ន្ធ",
      role_receptionist: "បុគ្គលិកទទួលភ្ញៀវ",
      role_doctor: "វេជ្ជបណ្ឌិតព្យាបាល",
      role_nurse: "គិលានុបដ្ឋាក/យិកា",
      role_pharmacist: "ប្រធានឱសថការី",
      role_accountant: "គណនេយ្យករ & បេឡាធិការ",

      // Dashboard
      executive_overview: "ទិដ្ឋភាពទូទៅនៃប្រតិបត្តិការមន្ទីរពេទ្យ",
      system_dashboard: "ផ្ទាំងគ្រប់គ្រងប្រព័ន្ធ",
      overview_subtitle: "សូចនាករប្រតិបត្តិការជាក់ស្តែង លំហូរការងារគ្លីនិក និងស្ថានភាពហិរញ្ញវត្ថុ។",
      as_of_today: "គិតត្រឹមថ្ងៃនេះ:",
      guided_demo: "ការណែនាំសាកល្បង",
      total_patients: "អ្នកជំងឺសរុប",
      today_appts: "ការណាត់ជួបថ្ងៃនេះ",
      completed_visits: "ការពិនិត្យបានបញ្ចប់",
      pending_appts: "ការណាត់ជួបកំពុងរង់ចាំ",
      outstanding_balance: "សមតុល្យនៅសល់",
      critical_lab_alerts: "បញ្ជាតេស្តកំពុងដំណើរការ",
      active_prescriptions: "វេជ្ជបញ្ជាសកម្ម",
      upcoming_followups: "ការតាមដានខាងមុខ",
      active_er_cases: "ករណីសង្គ្រោះបន្ទាន់",
      bed_occupancy: "អត្រាគ្រែសម្រាក (IPD)",
      active_theatres: "បន្ទប់វះកាត់កំពុងដំណើរការ",
      active_queue: "ជួររង់ចាំសកម្ម",
      fully_documented: "បានកត់ត្រាពេញលេញ",
      scheduled_checkin: "បានកក់ / ចុះឈ្មោះ",
      this_month: "ខែនេះ",
      all_documented: "បានកត់ត្រាទាំងអស់",
      in_workflow: "កំពុងដំណើរការ",
      ready_to_dispense: "រង់ចាំបើកថ្នាំ",
      due_in_7_days: "កំណត់ក្នុង ៧ ថ្ងៃ",

      // Common Fields & Table Headers
      mrn: "លេខកូដវេជ្ជសាស្ត្រ (MRN)",
      full_name: "ឈ្មោះពេញ",
      phone: "លេខទូរស័ព្ទ",
      dob: "ថ្ងៃខែឆ្នាំកំណើត",
      gender: "ភេទ",
      gender_male: "ប្រុស",
      gender_female: "ស្រី",
      gender_other: "ផ្សេងទៀត",
      blood_group: "ក្រុមឈាម",
      national_id: "អត្តសញ្ញាណប័ណ្ណ",
      address: "អាសយដ្ឋានបច្ចុប្បន្ន",
      allergies: "អាឡែហ្ស៊ីដែលដឹង",
      status: "ស្ថានភាព",
      action: "សកម្មភាព",
      actions: "សកម្មភាព",
      doctor: "វេជ្ជបណ្ឌិត",
      department: "ផ្នែក / ដេប៉ាតឺម៉ង់",
      date: "កាលបរិច្ឆេទ",
      time: "ម៉ោង",
      amount: "ចំនួនទឹកប្រាក់",
      balance: "សមតុល្យនៅខ្វះ",
      diagnosis: "រោគវិនិច្ឆ័យ",
      medication: "ឈ្មោះថ្នាំ",
      dosage: "កម្រិតថ្នាំ",
      instructions: "ការណែនាំប្រើប្រាស់",
      case_type: "ប្រភេទករណី",
      new_case: "ករណីថ្មី (New Case)",
      old_case: "ករណីចាស់ (Old Case)",
      new_case_short: "ករណីថ្មី",
      old_case_short: "ករណីចាស់",
      new_case_desc: "មកពិនិត្យលើកដំបូងសម្រាប់បញ្ហាសុខភាពនេះ",
      old_case_desc: "អ្នកជំងឺធ្លាប់មកពិនិត្យពីមុន / មកពិនិត្យតាមដានបន្ត",
      returning_patient: "អ្នកជំងឺធ្លាប់មកពិនិត្យពីមុន",
      first_time_patient: "អ្នកជំងឺមកលើកដំបូង",
      past_visits: "ប្រវត្តិការពិនិត្យពីមុន",
      prior_encounters: "កំណត់ត្រាការពិនិត្យកន្លងមក",
      filter_all_cases: "ករណីទាំងអស់",
      filter_new_cases: "ករណីថ្មី",
      filter_old_cases: "ករណីចាស់ (ធ្លាប់មកពិនិត្យ)",

      // Statuses
      status_active: "សកម្ម",
      status_inactive: "អសកម្ម",
      status_completed: "បានបញ្ចប់",
      status_pending: "កំពុងរង់ចាំ",
      status_in_progress: "កំពុងដំណើរការ",
      status_scheduled: "បានកំណត់ពេល",
      status_cancelled: "បានបោះបង់",
      status_available: "ទំនេរ",
      status_occupied: "មានអ្នកជំងឺ",
      status_cleaning: "កំពុងសម្អាត",
      status_maintenance: "កំពុងជួសជុល",

      // Buttons
      save: "រក្សាទុក",
      cancel: "បោះបង់",
      close: "បិទ",
      edit: "កែប្រែ",
      delete: "លុប",
      view: "មើល",
      search: "ស្វែងរក",
      filter: "តម្រង",
      export: "ទាញចេញ",
      print: "បោះពុម្ព",
      confirm: "បញ្ជាក់",
      prev: "ថយក្រោយ",
      next: "បន្ទាប់",

      // Toast Notifications
      toast_lang_switched: "បានប្តូរភាសាទៅជា ភាសាខ្មែរ (Khmer)"
    }
  },

  /**
   * Translate key with optional fallback
   */
  t: function(key, fallback) {
    const lang = this.currentLang || 'en';
    if (this.translations[lang] && this.translations[lang][key] !== undefined) {
      return this.translations[lang][key];
    }
    if (this.translations['en'] && this.translations['en'][key] !== undefined) {
      return this.translations['en'][key];
    }
    return fallback !== undefined ? fallback : key;
  },

  /**
   * Switch and persist active language
   */
  setLang: function(lang) {
    this.currentLang = (lang === 'kh' ? 'kh' : 'en');
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('d365_hms_lang', this.currentLang);
        localStorage.setItem('hmis_lang', this.currentLang);
      }
    } catch (e) {
      console.warn('LocalStorage unavailable for i18n:', e);
    }
  }
};

// Export for node test environments if applicable
if (typeof module !== 'undefined' && module.exports) {
  module.exports = i18n;
}
