/**
 * Microsoft Dynamics 365 Healthcare System - Google Sheets Database Service (DbService)
 * Generic CRUD and Relational Access for Google Sheets backed by DB_SCHEMA.
 */

const DbService = {
  /**
   * Get Spreadsheet instance
   */
  getSpreadsheet: function() {
    return SpreadsheetApp.getActiveSpreadsheet();
  },

  /**
   * Ensure sheet exists with proper header row according to DB_SCHEMA
   */
  getOrCreateSheet: function(tableName) {
    const ss = this.getSpreadsheet();
    let sheet = ss.getSheetByName(tableName);
    const headers = DB_SCHEMA[tableName];

    if (!sheet) {
      sheet = ss.insertSheet(tableName);
      if (headers && headers.length > 0) {
        sheet.appendRow(headers);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#002050').setFontColor('#ffffff');
        sheet.setFrozenRows(1);
      }
    } else if (headers && sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold').setBackground('#002050').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
    return sheet;
  },

  /**
   * Get Primary Key column name for a given table (defaults to headers[0])
   */
  getPrimaryKeyName: function(tableName) {
    const headers = DB_SCHEMA[tableName];
    if (headers && headers.length > 0) {
      return headers[0];
    }
    return 'id';
  },

  /**
   * Query records matching criteria
   */
  find: function(tableName, criteria = {}) {
    const sheet = this.getOrCreateSheet(tableName);
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow <= 1) return [];

    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

    const results = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const record = {};
      for (let j = 0; j < headers.length; j++) {
        record[headers[j]] = row[j];
      }
      record._rowIndex = i + 2;

      // Filter matches
      let match = true;
      for (const [key, value] of Object.entries(criteria)) {
        if (value !== undefined && record[key] !== value) {
          match = false;
          break;
        }
      }
      if (match) results.push(record);
    }
    return results;
  },

  /**
   * Find single record by primary key id
   */
  findById: function(tableName, id) {
    const pk = this.getPrimaryKeyName(tableName);
    const query = {};
    query[pk] = id;
    const records = this.find(tableName, query);
    return records.length > 0 ? records[0] : null;
  },

  /**
   * Insert new record atomically
   */
  insert: function(tableName, recordObj, userContext = null) {
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(10000);
      const sheet = this.getOrCreateSheet(tableName);
      const headers = DB_SCHEMA[tableName] || sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const pk = this.getPrimaryKeyName(tableName);

      if (!recordObj[pk]) {
        recordObj[pk] = 'REC-' + Utilities.getUuid().substring(0, 8).toUpperCase();
      }
      const now = new Date().toISOString();
      if (!recordObj.CreatedAt && headers.indexOf('CreatedAt') !== -1) recordObj.CreatedAt = now;
      if (!recordObj.UpdatedAt && headers.indexOf('UpdatedAt') !== -1) recordObj.UpdatedAt = now;

      const rowValues = headers.map(header => {
        const val = recordObj[header];
        if (val === undefined || val === null) return '';
        if (typeof val === 'object') return JSON.stringify(val);
        return val;
      });

      sheet.appendRow(rowValues);
      return recordObj;
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Update record by id
   */
  update: function(tableName, id, updateObj, userContext = null) {
    const lock = LockService.getScriptLock();
    try {
      lock.waitLock(10000);
      const sheet = this.getOrCreateSheet(tableName);
      const lastRow = sheet.getLastRow();
      const lastCol = sheet.getLastColumn();
      if (lastRow <= 1) return null;

      const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
      const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
      const pk = this.getPrimaryKeyName(tableName);

      const pkColIdx = headers.indexOf(pk);
      if (pkColIdx === -1) throw new Error('Primary key ' + pk + ' not found in ' + tableName);

      for (let i = 0; i < data.length; i++) {
        if (String(data[i][pkColIdx]) === String(id)) {
          const rowIndex = i + 2;
          const oldRecord = {};
          for (let j = 0; j < headers.length; j++) {
            oldRecord[headers[j]] = data[i][j];
          }

          const newRecord = Object.assign({}, oldRecord, updateObj);
          if (headers.indexOf('UpdatedAt') !== -1) {
            newRecord.UpdatedAt = new Date().toISOString();
          }

          const newRowValues = headers.map(header => {
            const val = newRecord[header];
            if (val === undefined || val === null) return '';
            if (typeof val === 'object') return JSON.stringify(val);
            return val;
          });

          sheet.getRange(rowIndex, 1, 1, headers.length).setValues([newRowValues]);
          return newRecord;
        }
      }
      return null;
    } finally {
      lock.releaseLock();
    }
  },

  /**
   * Deactivate / Soft delete or delete record
   */
  delete: function(tableName, id, userContext = null) {
    const pk = this.getPrimaryKeyName(tableName);
    // If status column exists, deactivate
    const headers = DB_SCHEMA[tableName] || [];
    if (headers.indexOf('Status') !== -1) {
      return this.update(tableName, id, { Status: 'Inactive' }, userContext);
    }
    if (headers.indexOf('PatientStatus') !== -1) {
      return this.update(tableName, id, { PatientStatus: 'Inactive' }, userContext);
    }
    return this.update(tableName, id, { Status: 'Cancelled' }, userContext);
  }
};

if (typeof module !== 'undefined') {
  module.exports = { DbService };
}
