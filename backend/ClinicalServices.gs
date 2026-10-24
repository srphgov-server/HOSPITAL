/**
 * HMIS Clinical and Administrative Services
 * Patient Registration, OPD, IPD, Bed Map, Labs, Imaging, Pharmacy, OT, Oxygen, Laundry, Billing
 */

const PatientService = {
  /**
   * Generate Next MRN: MRN-YYYY-XXXXX
   */
  generateMRN: function() {
    const year = new Date().getFullYear();
    const patients = DbService.find('patients');
    const seq = (patients.length + 1).toString().padStart(5, '0');
    return `MRN-${year}-${seq}`;
  },

  /**
   * Register or search duplicate patient
   */
  registerPatient: function(patientData, userContext) {
    // Duplicate check by phone or national_id
    if (patientData.phone) {
      const existingPhone = DbService.find('patients', { phone: patientData.phone });
      if (existingPhone.length > 0) {
        return { success: false, duplicate: true, message: 'Patient with this phone already exists', patient: existingPhone[0] };
      }
    }
    if (patientData.national_id) {
      const existingId = DbService.find('patients', { national_id: patientData.national_id });
      if (existingId.length > 0) {
        return { success: false, duplicate: true, message: 'Patient with this National ID already exists', patient: existingId[0] };
      }
    }

    patientData.mrn = this.generateMRN();
    patientData.status = 'ACTIVE';
    const created = DbService.insert('patients', patientData, userContext);
    return { success: true, patient: created };
  },

  searchPatients: function(query) {
    const all = DbService.find('patients');
    if (!query || query.trim() === '') return all.slice(0, 50);
    const q = query.toLowerCase();
    return all.filter(p => 
      (p.mrn && p.mrn.toLowerCase().includes(q)) ||
      (p.full_name && p.full_name.toLowerCase().includes(q)) ||
      (p.phone && p.phone.includes(q)) ||
      (p.national_id && p.national_id.toLowerCase().includes(q))
    ).slice(0, 50);
  }
};

const OPDService = {
  /**
   * Create OPD Encounter and generate Queue Token
   */
  checkInPatient: function(patientId, departmentId, doctorId, encounterType, userContext) {
    const today = new Date().toISOString().slice(0, 10);
    const existingTokens = DbService.find('queue_tokens');
    const tokenSeq = existingTokens.filter(t => t.created_at && t.created_at.startsWith(today)).length + 1;
    const tokenNumber = `T-${tokenSeq.toString().padStart(3, '0')}`;

    const encounter = DbService.insert('encounters', {
      encounter_no: `ENC-${Date.now()}`,
      patient_id: patientId,
      encounter_type: encounterType || 'OPD',
      department_id: departmentId,
      attending_doctor_id: doctorId || '',
      status: 'WAITING',
      start_time: new Date().toISOString()
    }, userContext);

    const token = DbService.insert('queue_tokens', {
      token_number: tokenNumber,
      encounter_id: encounter.id,
      patient_id: patientId,
      department_id: departmentId,
      station_type: 'OPD_CONSULTATION',
      counter_or_room: 'Room 1',
      status: 'WAITING',
      called_at: ''
    }, userContext);

    return { success: true, encounter: encounter, token: token };
  },

  recordVitals: function(vitalsData, userContext) {
    const vitals = DbService.insert('vital_signs', vitalsData, userContext);
    return { success: true, vitals: vitals };
  },

  saveClinicalNotes: function(notesData, userContext) {
    const notes = DbService.insert('clinical_notes', notesData, userContext);
    // Update encounter status
    if (notesData.encounter_id) {
      DbService.update('encounters', notesData.encounter_id, { status: 'COMPLETED', end_time: new Date().toISOString() }, userContext);
    }
    return { success: true, notes: notes };
  }
};

const IPDService = {
  /**
   * Visual Bed Map: Get all wards, rooms, and live bed occupancy
   */
  getBedMap: function() {
    const wards = DbService.find('wards');
    const rooms = DbService.find('rooms');
    const beds = DbService.find('beds');
    const patients = DbService.find('patients');

    const patientMap = {};
    patients.forEach(p => patientMap[p.id] = p);

    return wards.map(w => {
      const wardRooms = rooms.filter(r => r.ward_id === w.id);
      return {
        ...w,
        rooms: wardRooms.map(r => {
          const roomBeds = beds.filter(b => b.room_id === r.id);
          return {
            ...r,
            beds: roomBeds.map(b => ({
              ...b,
              patient: b.current_patient_id ? patientMap[b.current_patient_id] : null
            }))
          };
        })
      };
    });
  },

  admitPatient: function(admissionData, userContext) {
    const bed = DbService.findById('beds', admissionData.bed_id);
    if (!bed || bed.status !== 'AVAILABLE') {
      return { success: false, message: 'Selected bed is not available' };
    }

    const admission = DbService.insert('ipd_admissions', {
      ...admissionData,
      admission_no: `ADM-${Date.now()}`,
      admission_date: new Date().toISOString(),
      status: 'ACTIVE'
    }, userContext);

    // Occupy bed
    DbService.update('beds', bed.id, {
      status: 'OCCUPIED',
      current_patient_id: admissionData.patient_id,
      current_admission_id: admission.id
    }, userContext);

    return { success: true, admission: admission };
  },

  transferBed: function(admissionId, newBedId, reason, userContext) {
    const admission = DbService.findById('ipd_admissions', admissionId);
    if (!admission) return { success: false, message: 'Admission not found' };

    const oldBedId = admission.bed_id;
    const newBed = DbService.findById('beds', newBedId);
    if (!newBed || newBed.status !== 'AVAILABLE') {
      return { success: false, message: 'Target bed is not available' };
    }

    // Release old bed to CLEANING
    DbService.update('beds', oldBedId, {
      status: 'CLEANING',
      current_patient_id: '',
      current_admission_id: ''
    }, userContext);

    // Occupy new bed
    DbService.update('beds', newBedId, {
      status: 'OCCUPIED',
      current_patient_id: admission.patient_id,
      current_admission_id: admission.id
    }, userContext);

    // Update admission record
    DbService.update('ipd_admissions', admission.id, {
      ward_id: newBed.ward_id,
      room_id: newBed.room_id,
      bed_id: newBedId
    }, userContext);

    // Record transfer log
    DbService.insert('bed_transfers', {
      admission_id: admission.id,
      from_bed_id: oldBedId,
      to_bed_id: newBedId,
      transfer_reason: reason,
      authorized_by: userContext ? userContext.username : 'SYSTEM',
      transferred_at: new Date().toISOString()
    }, userContext);

    return { success: true };
  },

  dischargePatient: function(admissionId, dischargeData, userContext) {
    const admission = DbService.findById('ipd_admissions', admissionId);
    if (!admission) return { success: false, message: 'Admission not found' };

    // Free bed
    if (admission.bed_id) {
      DbService.update('beds', admission.bed_id, {
        status: 'CLEANING',
        current_patient_id: '',
        current_admission_id: '',
        last_cleaned_at: new Date().toISOString()
      }, userContext);
    }

    DbService.update('ipd_admissions', admissionId, {
      ...dischargeData,
      status: 'DISCHARGED',
      discharge_date: new Date().toISOString()
    }, userContext);

    return { success: true };
  }
};

const PharmacyService = {
  /**
   * FEFO Dispensing: Deduct inventory batches according to First-Expired-First-Out
   */
  dispensePrescription: function(prescriptionId, userContext) {
    const pItems = DbService.find('prescription_items', { prescription_id: prescriptionId });
    if (pItems.length === 0) return { success: false, message: 'No prescription items found' };

    for (let item of pItems) {
      const qtyNeeded = item.prescribed_qty - (item.dispensed_qty || 0);
      if (qtyNeeded <= 0) continue;

      // Find available batches sorted by expiry_date ascending (FEFO)
      const batches = DbService.find('medicine_batches', { medicine_id: item.medicine_id })
        .filter(b => Number(b.quantity_on_hand) > 0)
        .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date));

      let remaining = qtyNeeded;
      for (let batch of batches) {
        if (remaining <= 0) break;
        const take = Math.min(Number(batch.quantity_on_hand), remaining);
        const newBatchQty = Number(batch.quantity_on_hand) - take;
        
        DbService.update('medicine_batches', batch.id, { quantity_on_hand: newBatchQty }, userContext);
        DbService.insert('dispensing_records', {
          prescription_item_id: item.id,
          batch_id: batch.id,
          quantity_dispensed: take,
          dispensed_by: userContext ? userContext.username : 'PHARMACIST',
          dispensed_at: new Date().toISOString()
        }, userContext);

        remaining -= take;
      }

      DbService.update('prescription_items', item.id, {
        dispensed_qty: item.prescribed_qty - remaining,
        status: remaining === 0 ? 'DISPENSED' : 'PARTIALLY_DISPENSED'
      }, userContext);
    }

    DbService.update('prescriptions', prescriptionId, { status: 'DISPENSED' }, userContext);
    return { success: true, message: 'Prescription dispensed successfully under FEFO rules.' };
  }
};

const BillingService = {
  /**
   * Generate Invoice and process payment
   */
  createInvoice: function(patientId, encounterId, items, discountAmount = 0, userContext) {
    const subtotal = items.reduce((sum, itm) => sum + (Number(itm.quantity) * Number(itm.unit_price)), 0);
    const payable = Math.max(0, subtotal - discountAmount);

    const invoice = DbService.insert('invoices', {
      invoice_no: `INV-${Date.now()}`,
      patient_id: patientId,
      encounter_id: encounterId || '',
      subtotal: subtotal,
      discount_amount: discountAmount,
      insurance_covered_amount: 0,
      patient_payable_amount: payable,
      paid_amount: 0,
      balance_due: payable,
      status: 'ISSUED'
    }, userContext);

    items.forEach(itm => {
      DbService.insert('invoice_items', {
        invoice_id: invoice.id,
        service_category: itm.service_category || 'SERVICE',
        service_id: itm.service_id || '',
        item_description: itm.item_description,
        quantity: itm.quantity,
        unit_price: itm.unit_price,
        total_price: Number(itm.quantity) * Number(itm.unit_price)
      }, userContext);
    });

    return { success: true, invoice: invoice };
  },

  recordPayment: function(invoiceId, amountPaid, paymentMethod, userContext) {
    const invoice = DbService.findById('invoices', invoiceId);
    if (!invoice) return { success: false, message: 'Invoice not found' };

    const newPaid = Number(invoice.paid_amount) + Number(amountPaid);
    const newBalance = Math.max(0, Number(invoice.patient_payable_amount) - newPaid);
    const status = newBalance === 0 ? 'PAID' : 'PARTIAL';

    DbService.update('invoices', invoiceId, {
      paid_amount: newPaid,
      balance_due: newBalance,
      status: status
    }, userContext);

    const payment = DbService.insert('payments', {
      receipt_no: `REC-${Date.now()}`,
      invoice_id: invoiceId,
      patient_id: invoice.patient_id,
      amount_paid: amountPaid,
      payment_method: paymentMethod || 'CASH',
      cashier_id: userContext ? userContext.username : 'CASHIER',
      paid_at: new Date().toISOString()
    }, userContext);

    return { success: true, invoiceStatus: status, balanceDue: newBalance, payment: payment };
  }
};

if (typeof module !== 'undefined') {
  module.exports = { PatientService, OPDService, IPDService, PharmacyService, BillingService };
}
