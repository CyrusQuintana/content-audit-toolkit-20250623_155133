const SETTINGS = {
  sheetName: 'Content Data',
  idColumn: 'Content ID',
  titleColumn: 'Title',
  contentColumn: 'Content',
  aiFileUrlColumn: 'AI File URL',
  aiFolderId: 'PASTE_YOUR_AI_FOLDER_ID_HERE' // replace with a valid folder ID
};

function addMissingAiFiles() {
  if (!SETTINGS.aiFolderId || SETTINGS.aiFolderId.indexOf('PASTE_YOUR_AI_FOLDER_ID_HERE') === 0) {
    throw new Error('Please set a valid folder ID in SETTINGS.aiFolderId before running this function.');
  }

  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(SETTINGS.sheetName);
  if (!sheet) throw new Error(`Sheet "${SETTINGS.sheetName}" not found.`);

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const colIdx = {};
  ['idColumn', 'titleColumn', 'contentColumn', 'aiFileUrlColumn'].forEach(key => {
    const header = SETTINGS[key];
    const idx = headers.indexOf(header);
    if (idx === -1) throw new Error(`Column "${header}" not found.`);
    colIdx[key] = idx + 1;
  });

  const lastRow = sheet.getLastRow();
  const numRows = lastRow - 1;
  if (numRows < 1) return;

  // Read only up to defined headers
  const data = sheet.getRange(2, 1, numRows, headers.length).getValues();
  const urlCol = colIdx.aiFileUrlColumn;
  const urlRange = sheet.getRange(2, urlCol, numRows, 1);
  const urlValues = urlRange.getValues();

  const folder = DriveApp.getFolderById(SETTINGS.aiFolderId);
  const failed = [];

  data.forEach((row, i) => {
    try {
      if (urlValues[i][0]) return; // already has URL

      const title = row[colIdx.titleColumn - 1] || `Row ${i + 2}`;
      const content = row[colIdx.contentColumn - 1] || '';
      const doc = DocumentApp.create(`${title} ? AI Analysis`);
      const body = doc.getBody();
      body.appendParagraph('AI Analysis for Content').setHeading(DocumentApp.ParagraphHeading.HEADING2);
      body.appendParagraph(content);
      doc.saveAndClose();

      const file = DriveApp.getFileById(doc.getId());
      folder.addFile(file);
      DriveApp.getRootFolder().removeFile(file);

      urlValues[i][0] = doc.getUrl();
    } catch (e) {
      failed.push({ row: i + 2, error: e.toString() });
    }
  });

  // Write back updated URLs in one batch
  const createdCount = urlValues.reduce((count, r) => count + (r[0] ? 1 : 0), 0);
  if (createdCount > 0) {
    urlRange.setValues(urlValues);
    SpreadsheetApp.flush();
    ss.toast(`${createdCount} AI file(s) created and linked.`);
  }

  if (failed.length) {
    failed.forEach(f => Logger.log(`Row ${f.row} failed: ${f.error}`));
    ss.toast(`${failed.length} row(s) failed to process. Check Logs for details.`, 'Errors', 10);
  }
}