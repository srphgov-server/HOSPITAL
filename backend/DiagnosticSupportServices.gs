/**
 * HMIS Diagnostic & Specialty Support Services
 * Laboratory, Radiology, Operating Theater, Oxygen Center, and Laundry Modules
 */

const DiagnosticService = {
  // Laboratory
  createLabOrder: function(orderData, testIds, userContext) {
    const order = DbService.insert('lab_orders', {
      ...orderData,
      order_no: `LAB-${Date.now()}`,
      order_date: new Date().toISOString(),
      status: 'ORDERED'
    }, userContext);

    testIds.forEach(testId => {
      const test = DbService.findById('lab_tests_master', testId);
      DbService.insert('lab_order_items', {
        order_id: order.id,
        test_id: testId,
        status: 'PENDING',
        price: test ? test.price : 0
      }, userContext);
    });

    return { success: true, order: order };
  },

  recordLabResult: function(resultData, userContext) {
    const result = DbService.insert('lab_results', {
      ...resultData,
      performed_by: userContext ? userContext.username : 'LAB_TECH'
    }, userContext);

    // Update item status
    const items = DbService.find('lab_order_items', { order_id: resultData.order_id, test_id: resultData.test_id });
    if (items.length > 0) {
      DbService.update('lab_order_items', items[0].id, { status: 'COMPLETED' }, userContext);
    }
    return { success: true, result: result };
  },

  // Radiology
  createImagingOrder: function(orderData, userContext) {
    const order = DbService.insert('imaging_orders', {
      ...orderData,
      order_no: `RAD-${Date.now()}`,
      status: 'ORDERED'
    }, userContext);
    return { success: true, order: order };
  },

  submitRadiologyReport: function(reportData, userContext) {
    const report = DbService.insert('imaging_reports', {
      ...reportData,
      radiologist_id: userContext ? userContext.username : 'RADIOLOGIST',
      verified_at: new Date().toISOString(),
      status: 'FINALIZED'
    }, userContext);

    DbService.update('imaging_orders', reportData.order_id, { status: 'REPORTED' }, userContext);
    return { success: true, report: report };
  }
};

const OTService = {
  scheduleSurgery: function(surgeryData, userContext) {
    const existing = DbService.find('ot_schedules', {
      operating_room_id: surgeryData.operating_room_id,
      status: 'SCHEDULED'
    });

    // Check time collision
    const reqStart = new Date(surgeryData.scheduled_start).getTime();
    const reqEnd = new Date(surgeryData.scheduled_end).getTime();

    for (let s of existing) {
      const sStart = new Date(s.scheduled_start).getTime();
      const sEnd = new Date(s.scheduled_end).getTime();
      if ((reqStart >= sStart && reqStart < sEnd) || (reqEnd > sStart && reqEnd <= sEnd)) {
        return { success: false, message: 'Operating Room is already booked for this time window' };
      }
    }

    const schedule = DbService.insert('ot_schedules', {
      ...surgeryData,
      status: 'SCHEDULED'
    }, userContext);

    return { success: true, schedule: schedule };
  },

  saveChecklist: function(checklistData, userContext) {
    const checklist = DbService.insert('ot_checklists', checklistData, userContext);
    return { success: true, checklist: checklist };
  },

  completeOperativeReport: function(reportData, userContext) {
    const report = DbService.insert('operative_reports', {
      ...reportData,
      status: 'COMPLETED'
    }, userContext);

    if (reportData.schedule_id) {
      DbService.update('ot_schedules', reportData.schedule_id, { status: 'COMPLETED' }, userContext);
    }
    return { success: true, report: report };
  }
};

const SupportServices = {
  // Oxygen Management
  requestOxygen: function(reqData, userContext) {
    // Find an available cylinder
    const availableCylinders = DbService.find('oxygen_cylinders', { status: 'AVAILABLE' });
    let assignedCylinderId = '';
    if (availableCylinders.length > 0) {
      assignedCylinderId = availableCylinders[0].id;
      DbService.update('oxygen_cylinders', assignedCylinderId, {
        status: 'ASSIGNED',
        current_location_dept: reqData.department_id || '',
        current_patient_id: reqData.patient_id || ''
      }, userContext);
    }

    const req = DbService.insert('oxygen_requests', {
      ...reqData,
      cylinder_id: assignedCylinderId,
      requested_at: new Date().toISOString(),
      status: assignedCylinderId ? 'ACTIVE' : 'WAITING_CYLINDER'
    }, userContext);

    return { success: true, request: req, cylinderAssigned: !!assignedCylinderId };
  },

  returnOxygenCylinder: function(requestId, litersUsed, userContext) {
    const req = DbService.findById('oxygen_requests', requestId);
    if (!req) return { success: false, message: 'Request not found' };

    DbService.update('oxygen_requests', requestId, {
      status: 'RETURNED',
      ended_at: new Date().toISOString(),
      total_liters_used: litersUsed || 0
    }, userContext);

    if (req.cylinder_id) {
      DbService.update('oxygen_cylinders', req.cylinder_id, {
        status: 'EMPTY',
        current_patient_id: ''
      }, userContext);
    }

    return { success: true, message: 'Cylinder returned and marked as EMPTY' };
  },

  // Laundry / Linen Tracking
  createLaundryBatch: function(batchData, userContext) {
    const batch = DbService.insert('laundry_transactions', {
      ...batchData,
      collected_date: new Date().toISOString(),
      status: 'COLLECTED'
    }, userContext);
    return { success: true, batch: batch };
  },

  updateLaundryStatus: function(batchId, status, quantityDelivered, damagedCount, userContext) {
    const updateObj = { status: status };
    if (status === 'DELIVERED') {
      updateObj.delivered_date = new Date().toISOString();
      if (quantityDelivered !== undefined) updateObj.quantity_delivered = quantityDelivered;
      if (damagedCount !== undefined) updateObj.damaged_count = damagedCount;
    }
    const updated = DbService.update('laundry_transactions', batchId, updateObj, userContext);
    return { success: true, batch: updated };
  }
};

if (typeof module !== 'undefined') {
  module.exports = { DiagnosticService, OTService, SupportServices };
}
