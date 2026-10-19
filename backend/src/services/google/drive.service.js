const { google } = require('googleapis');
const { Readable } = require('stream');
const config = require('../../config');
const logger = require('../../config/logger');

class DriveService {
  constructor() {
    this.auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: config.google.serviceAccountEmail,
        private_key: config.google.privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/drive'],
    });
    this.drive = google.drive({ version: 'v3', auth: this.auth });
    this.folderId = config.google.driveFolderId;
  }

  async uploadFile(name, mimeType, buffer, subFolder = null) {
    try {
      let parentId = this.folderId;
      if (subFolder) {
        parentId = await this._getOrCreateFolder(subFolder, this.folderId);
      }

      const response = await this.drive.files.create({
        requestBody: {
          name,
          parents: [parentId],
          mimeType,
        },
        media: {
          mimeType,
          body: Readable.from(buffer),
        },
        fields: 'id, webViewLink, webContentLink',
      });

      // Make file readable by anyone with link
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: { role: 'reader', type: 'anyone' },
      });

      return response.data;
    } catch (error) {
      logger.error('Error uploading to Drive:', error);
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      await this.drive.files.delete({ fileId });
    } catch (error) {
      logger.error('Error deleting from Drive:', error);
      throw error;
    }
  }

  async listFiles(subFolder = null) {
    try {
      const parentId = subFolder
        ? await this._getOrCreateFolder(subFolder, this.folderId)
        : this.folderId;

      const response = await this.drive.files.list({
        q: `'${parentId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType, webViewLink, createdTime, size)',
        orderBy: 'createdTime desc',
      });
      return response.data.files;
    } catch (error) {
      logger.error('Error listing Drive files:', error);
      throw error;
    }
  }

  async backupSpreadsheet(spreadsheetId, name) {
    try {
      const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;
      const folderId = await this._getOrCreateFolder('Backups', this.folderId);

      // Copy the spreadsheet to backups folder
      const response = await this.drive.files.copy({
        fileId: spreadsheetId,
        requestBody: {
          name: `${name}_${new Date().toISOString().slice(0, 10)}`,
          parents: [folderId],
        },
      });
      return response.data;
    } catch (error) {
      logger.error('Error backing up spreadsheet:', error);
      throw error;
    }
  }

  async _getOrCreateFolder(name, parentId) {
    try {
      const response = await this.drive.files.list({
        q: `name='${name}' and mimeType='application/vnd.google-apps.folder' and '${parentId}' in parents and trashed=false`,
        fields: 'files(id)',
      });

      if (response.data.files.length > 0) {
        return response.data.files[0].id;
      }

      const folder = await this.drive.files.create({
        requestBody: {
          name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId],
        },
        fields: 'id',
      });
      return folder.data.id;
    } catch (error) {
      logger.error('Error creating Drive folder:', error);
      throw error;
    }
  }
}

module.exports = new DriveService();
