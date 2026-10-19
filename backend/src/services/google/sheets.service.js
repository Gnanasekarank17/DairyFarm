const { google } = require('googleapis');
const config = require('../../config');
const logger = require('../../config/logger');

class SheetsService {
  constructor() {
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: config.google.serviceAccountEmail,
        private_key: config.google.privateKey,
      },
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive',
      ],
    });
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
    this.spreadsheetId = config.google.spreadsheetId;
  }

  async getSheet(sheetName) {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: sheetName,
      });
      return response.data.values || [];
    } catch (error) {
      logger.error(`Error reading sheet ${sheetName}:`, error);
      throw error;
    }
  }

  async getRows(sheetName) {
    const values = await this.getSheet(sheetName);
    if (values.length === 0) return [];
    const [headers, ...rows] = values;
    return rows.map((row) => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] || ''; });
      return obj;
    });
  }

  async appendRow(sheetName, rowData) {
    try {
      const headers = await this._getHeaders(sheetName);
      const row = headers.map((h) => rowData[h] ?? '');
      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: sheetName,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [row] },
      });
    } catch (error) {
      logger.error(`Error appending to ${sheetName}:`, error);
      throw error;
    }
  }

  async updateRow(sheetName, rowIndex, rowData) {
    try {
      const headers = await this._getHeaders(sheetName);
      const row = headers.map((h) => rowData[h] ?? '');
      // rowIndex is 0-based data row; +2 accounts for header row and 1-based indexing
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${sheetName}!A${rowIndex + 2}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [row] },
      });
    } catch (error) {
      logger.error(`Error updating row in ${sheetName}:`, error);
      throw error;
    }
  }

  async deleteRow(sheetName, rowIndex) {
    try {
      const sheetId = await this._getSheetId(sheetName);
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: {
          requests: [{
            deleteDimension: {
              range: {
                sheetId,
                dimension: 'ROWS',
                startIndex: rowIndex + 1, // +1 for header
                endIndex: rowIndex + 2,
              },
            },
          }],
        },
      });
    } catch (error) {
      logger.error(`Error deleting row in ${sheetName}:`, error);
      throw error;
    }
  }

  async findRowById(sheetName, id, idField = 'id') {
    const rows = await this.getRows(sheetName);
    const index = rows.findIndex((r) => r[idField] === id);
    return { row: rows[index] || null, index };
  }

  async findRowsByField(sheetName, field, value) {
    const rows = await this.getRows(sheetName);
    return rows.filter((r) => r[field] === value);
  }

  async initializeSheets() {
    const sheetsConfig = [
      {
        name: config.sheets.customers,
        headers: ['id','name','mobile','email','address','dailyQuantity','milkType','ratePerLiter','billingMode','isActive','createdAt','updatedAt'],
      },
      {
        name: config.sheets.deliveries,
        headers: ['id','customerId','date','year','month','deliveredDays','missedDays','deliveryData','totalQuantity','totalAmount','createdAt','updatedAt'],
      },
      {
        name: config.sheets.invoices,
        headers: ['id','invoiceNumber','customerId','customerName','month','year','dailyQuantity','ratePerLiter','deliveredDays','missedDays','totalQuantity','amount','paymentStatus','missedDetails','createdAt','updatedAt'],
      },
      {
        name: config.sheets.payments,
        headers: ['id','invoiceId','customerId','invoiceNumber','amountDue','amountPaid','balance','paymentDate','paymentMode','notes','status','createdAt','updatedAt'],
      },
      {
        name: config.sheets.cowMaster,
        headers: ['id','name','tagNumber','breed','color','dateOfBirth','purchaseDate','purchaseCost','currentStatus','photoUrl','notes','createdAt','updatedAt'],
      },
      {
        name: config.sheets.healthRecords,
        headers: ['id','cowId','recordType','date','description','veterinarian','nextDueDate','documents','notes','createdAt'],
      },
      {
        name: config.sheets.breedingRecords,
        headers: ['id','cowId','matingDate','bullName','breedingMethod','technicianName','notes','createdAt'],
      },
      {
        name: config.sheets.pregnancyRecords,
        headers: ['id','cowId','breedingId','isConfirmed','confirmationDate','veterinarian','expectedCalvingDate','actualCalvingDate','status','notes','createdAt','updatedAt'],
      },
      {
        name: config.sheets.calvingRecords,
        headers: ['id','cowId','pregnancyId','deliveryDate','deliveryType','numberOfCalves','complications','notes','createdAt'],
      },
      {
        name: config.sheets.calfRecords,
        headers: ['id','calvingId','motherCowId','name','gender','birthDate','birthWeight','healthStatus','notes','createdAt'],
      },
      {
        name: config.sheets.milkProduction,
        headers: ['id','cowId','date','morningMilk','eveningMilk','totalMilk','notes','createdAt'],
      },
      {
        name: config.sheets.auditLog,
        headers: ['id','userId','action','module','entityId','previousValue','newValue','reason','comments','ipAddress','timestamp'],
      },
      {
        name: config.sheets.settings,
        headers: ['key','value','updatedAt'],
      },
      {
        name: config.sheets.users,
        headers: ['id','googleId','name','email','role','pushToken','isActive','lastLogin','createdAt'],
      },
    ];

    for (const s of sheetsConfig) {
      await this._ensureSheet(s.name, s.headers);
    }
    logger.info('All sheets initialized');
  }

  async _ensureSheet(name, headers) {
    try {
      const existing = await this.getSheet(name);
      if (existing.length === 0) {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.spreadsheetId,
          range: `${name}!A1`,
          valueInputOption: 'RAW',
          resource: { values: [headers] },
        });
        logger.info(`Initialized headers for sheet: ${name}`);
      }
    } catch (error) {
      // Sheet may not exist; create it
      await this._createSheet(name, headers);
    }
  }

  async _createSheet(name, headers) {
    try {
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.spreadsheetId,
        resource: { requests: [{ addSheet: { properties: { title: name } } }] },
      });
      await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.spreadsheetId,
        range: `${name}!A1`,
        valueInputOption: 'RAW',
        resource: { values: [headers] },
      });
      logger.info(`Created sheet: ${name}`);
    } catch (error) {
      logger.error(`Error creating sheet ${name}:`, error);
    }
  }

  async _getHeaders(sheetName) {
    const values = await this.getSheet(sheetName);
    return values[0] || [];
  }

  async _getSheetId(sheetName) {
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId: this.spreadsheetId,
    });
    const sheet = response.data.sheets.find(
      (s) => s.properties.title === sheetName
    );
    return sheet?.properties?.sheetId;
  }
}

module.exports = new SheetsService();
