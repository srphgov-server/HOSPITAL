/**
 * Microsoft Dynamics 365 Healthcare System - Google Apps Script Web App API Gateway
 * Provides RESTful endpoints for CRUD, Seeding, and Bidirectional Synchronization with Frontend.
 */

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'status';
  const table = e && e.parameter && e.parameter.table;

  if (action === 'seed') {
    return jsonResponse(SeedDataService.seedAll());
  }

  if (action === 'getAllData') {
    // Return all 16 tables for client synchronization
    const result = {};
    for (const tableName of Object.keys(DB_SCHEMA)) {
      result[tableName] = DbService.find(tableName);
    }
    return jsonResponse({ success: true, data: result });
  }

  if (action === 'getTable' && table && DB_SCHEMA[table]) {
    return jsonResponse({ success: true, data: DbService.find(table) });
  }

  if (action === 'getSchema') {
    return jsonResponse({ success: true, schema: DB_SCHEMA });
  }

  return jsonResponse({
    status: 'online',
    system: 'Dynamics 365 Healthcare Prototype API',
    engine: 'Google Apps Script / Google Sheets',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const table = body.table;
    const payload = body.payload || {};
    const id = body.id;
    const userContext = body.userContext || { username: 'demo_user' };

    switch (action) {
      case 'seedAll':
        return jsonResponse(SeedDataService.seedAll());

      case 'createRecord':
        if (!table || !DB_SCHEMA[table]) {
          return jsonResponse({ success: false, error: 'Invalid or unknown table ' + table }, 400);
        }
        const created = DbService.insert(table, payload, userContext);
        return jsonResponse({ success: true, data: created });

      case 'updateRecord':
        if (!table || !DB_SCHEMA[table] || !id) {
          return jsonResponse({ success: false, error: 'Table name and record ID are required' }, 400);
        }
        const updated = DbService.update(table, id, payload, userContext);
        return jsonResponse({ success: true, data: updated });

      case 'deleteRecord':
      case 'deactivateRecord':
        if (!table || !DB_SCHEMA[table] || !id) {
          return jsonResponse({ success: false, error: 'Table name and record ID are required' }, 400);
        }
        const deleted = DbService.delete(table, id, userContext);
        return jsonResponse({ success: true, data: deleted });

      case 'syncBatch':
        // Batch synchronization endpoint
        const syncResults = {};
        if (payload.creates && Array.isArray(payload.creates)) {
          for (const item of payload.creates) {
            DbService.insert(item.table, item.data, userContext);
          }
        }
        if (payload.updates && Array.isArray(payload.updates)) {
          for (const item of payload.updates) {
            DbService.update(item.table, item.id, item.data, userContext);
          }
        }
        return jsonResponse({ success: true, message: 'Batch synced successfully' });

      default:
        return jsonResponse({ success: false, error: 'Unknown action: ' + action }, 400);
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.message, stack: err.stack }, 500);
  }
}

function jsonResponse(obj, statusCode = 200) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

if (typeof module !== 'undefined') {
  module.exports = { doGet, doPost, jsonResponse };
}
