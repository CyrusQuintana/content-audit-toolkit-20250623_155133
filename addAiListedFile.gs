const SHEET_NAME = 'AI Files';
const SHEET_HEADERS = ['Timestamp', 'File Name', 'File ID', 'URL', 'Mime Type'];

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Content Audit Toolkit')
    .addItem('Add AI Listed File', 'showAddAiListedFileSidebar')
    .addToUi();
}

function showAddAiListedFileSidebar() {
  var ui = SpreadsheetApp.getUi();
  var htmlOutput;
  try {
    htmlOutput = HtmlService.createHtmlOutputFromFile('AddAiListedFileDialog');
  } catch (e) {
    htmlOutput = HtmlService.createHtmlOutput(
      '<div style="font-family:Arial,sans-serif;padding:10px;">' +
      '<strong>Error:</strong> Dialog file <code>AddAiListedFileDialog.html</code> not found.' +
      '</div>'
    );
  }
  htmlOutput.setTitle('Add AI Listed File');
  ui.showSidebar(htmlOutput);
}

function addAiListedFile(file) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    // Validate input
    var fileId = file.id || file.fileId;
    var fileName = file.name || file.fileName;
    if (!fileId || !fileName) {
      return { status: 'ERROR', message: 'Missing required file ID or file name.' };
    }
    var url = file.url || 'https://drive.google.com/open?id=' + fileId;
    var mimeType = file.mimeType || '';
    // Get or create sheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet();
      sheet.setName(SHEET_NAME);
      sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setValues([SHEET_HEADERS]);
      sheet.getRange(1, 1, 1, SHEET_HEADERS.length).setFontWeight('bold');
    }
    // Append data row
    var timestamp = new Date();
    var nextRow = sheet.getLastRow() + 1;
    var rowValues = [[timestamp, fileName, fileId, url, mimeType]];
    sheet.getRange(nextRow, 1, 1, SHEET_HEADERS.length).setValues(rowValues);
    return { status: 'SUCCESS', message: 'AI listed file added.' };
  } catch (err) {
    console.error('Error in addAiListedFile:', err);
    return { status: 'ERROR', message: err.message };
  } finally {
    try {
      lock.releaseLock();
    } catch (releaseErr) {
      // ignore
    }
  }
}