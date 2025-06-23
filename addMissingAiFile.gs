const AI_FOLDER_ID = 'REPLACE_WITH_AI_FOLDER_ID';

function sanitizeFileName(name) {
  // Remove characters not allowed in Drive file names: \ / ? % * : | " < > and control chars
  return name.replace(/[\\\/\?\%\*\:\|\"<>\r\n]+/g, '').trim();
}

function addMissingAiFile() {
  if (!AI_FOLDER_ID || AI_FOLDER_ID === 'REPLACE_WITH_AI_FOLDER_ID') {
    throw new Error('AI_FOLDER_ID is not configured. Please set AI_FOLDER_ID in addMissingAiFile.gs before running.');
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetName = 'Audit';
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error('Sheet "' + sheetName + '" not found');
  }

  const HEADER_ROW = 1;
  const FIRST_DATA_ROW = HEADER_ROW + 1;
  const headers = sheet.getRange(HEADER_ROW, 1, 1, sheet.getLastColumn()).getValues()[0];
  const slugIdx = headers.indexOf('Content ID');
  const aiUrlIdx = headers.indexOf('URL');
  if (slugIdx === -1 || aiUrlIdx === -1) {
    throw new Error('Required columns "Content ID" or "URL" not found in header row');
  }
  const SLUG_COL = slugIdx + 1;
  const AI_URL_COL = aiUrlIdx + 1;
  const numRows = sheet.getLastRow() - HEADER_ROW;
  if (numRows < 1) {
    return; // no data
  }
  const COL_COUNT = AI_URL_COL - SLUG_COL + 1;

  const data = sheet.getRange(FIRST_DATA_ROW, SLUG_COL, numRows, COL_COUNT).getValues();
  const folder = DriveApp.getFolderById(AI_FOLDER_ID);
  const newUrls = [];

  data.forEach(function(row) {
    const slug = row[0];
    const existingUrl = row[AI_URL_COL - SLUG_COL];
    if (slug && !existingUrl) {
      const safeSlug = sanitizeFileName(slug);
      const fileName = 'AI Suggestions - ' + safeSlug;
      const doc = DocumentApp.create(fileName);
      const file = DriveApp.getFileById(doc.getId());
      folder.addFile(file);
      DriveApp.getRootFolder().removeFile(file);
      newUrls.push([doc.getUrl()]);
    } else {
      newUrls.push([existingUrl]);
    }
  });

  sheet.getRange(FIRST_DATA_ROW, AI_URL_COL, numRows, 1).setValues(newUrls);
}