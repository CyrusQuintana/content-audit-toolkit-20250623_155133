var PLAN_SHEET_NAME = 'Project Plan';
var CONFIRMATION_COLUMN_HEADER = 'Confirmation File';

function onOpen_planConfirmationFileAdder() {
  SpreadsheetApp.getUi()
    .createMenu('Plan Tools')
    .addItem('Add Confirmation File (Selected)', 'addPlanConfirmationFileForSelected')
    .addItem('Batch Add Confirmation Files', 'batchAddPlanConfirmationFiles')
    .addToUi();
}

function addPlanConfirmationFileForSelected() {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getActiveSheet();
  if (sheet.getName() !== PLAN_SHEET_NAME) {
    SpreadsheetApp.getUi().alert('Please select a row in the "' + PLAN_SHEET_NAME + '" sheet.');
    return;
  }
  var row = sheet.getActiveRange().getRow();
  try {
    var url = addPlanConfirmationFile(row);
    SpreadsheetApp.getUi().alert('Confirmation file created:\n' + url);
  } catch (e) {
    SpreadsheetApp.getUi().alert('Error: ' + e.message);
  }
}

function batchAddPlanConfirmationFiles() {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(PLAN_SHEET_NAME);
  if (!sheet) throw new Error('Sheet "' + PLAN_SHEET_NAME + '" not found.');
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var headerMap = {};
  for (var i = 0; i < headers.length; i++) {
    headerMap[headers[i]] = i + 1;
  }
  var lastRow = sheet.getLastRow();
  for (var row = 2; row <= lastRow; row++) {
    try {
      createPlanConfirmationFile(row, sheet, headerMap);
    } catch (e) {
      Logger.log('Row ' + row + ' skipped: ' + e.message);
    }
  }
  SpreadsheetApp.getUi().alert('Batch processing complete.');
}

function addPlanConfirmationFile(rowIndex) {
  var ss = SpreadsheetApp.getActive();
  var sheet = ss.getSheetByName(PLAN_SHEET_NAME);
  if (!sheet) throw new Error('Sheet "' + PLAN_SHEET_NAME + '" not found.');
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var headerMap = {};
  for (var i = 0; i < headers.length; i++) {
    headerMap[headers[i]] = i + 1;
  }
  return createPlanConfirmationFile(rowIndex, sheet, headerMap);
}

function createPlanConfirmationFile(rowIndex, sheet, headerMap) {
  var ss = SpreadsheetApp.getActive();
  var linkCol = headerMap[CONFIRMATION_COLUMN_HEADER];
  if (!linkCol) throw new Error('Header "' + CONFIRMATION_COLUMN_HEADER + '" not found.');
  var existing = sheet.getRange(rowIndex, linkCol).getValue();
  if (existing) return existing;
  function getDisplay(name) {
    var col = headerMap[name];
    if (!col) return '';
    return sheet.getRange(rowIndex, col).getDisplayValue();
  }
  var planNameRaw = getDisplay('Plan Name') || 'Untitled Plan';
  var planName = planConfirmationFileAdder_sanitizeFileName(planNameRaw);
  var planDesc = getDisplay('Plan Description');
  var timezone = ss.getSpreadsheetTimeZone();
  var startDateVal = headerMap['Start Date'] ? sheet.getRange(rowIndex, headerMap['Start Date']).getValue() : '';
  var endDateVal = headerMap['End Date'] ? sheet.getRange(rowIndex, headerMap['End Date']).getValue() : '';
  var assignedTo = getDisplay('Assigned To');
  var timestamp = Utilities.formatDate(new Date(), timezone, 'yyyy-MM-dd');
  var fileName = 'Plan Confirmation - ' + planName + ' (' + timestamp + ')';
  var doc = DocumentApp.create(fileName);
  var body = doc.getBody();
  body.appendParagraph('Plan Confirmation').setHeading(DocumentApp.ParagraphHeading.HEADING1);
  body.appendParagraph('Plan Name: ' + planNameRaw);
  if (planDesc) body.appendParagraph('Description: ' + planDesc);
  if (startDateVal instanceof Date && !isNaN(startDateVal)) {
    body.appendParagraph('Start Date: ' + Utilities.formatDate(startDateVal, timezone, 'yyyy-MM-dd'));
  } else if (startDateVal) {
    body.appendParagraph('Start Date: ' + startDateVal);
  }
  if (endDateVal instanceof Date && !isNaN(endDateVal)) {
    body.appendParagraph('End Date: ' + Utilities.formatDate(endDateVal, timezone, 'yyyy-MM-dd'));
  } else if (endDateVal) {
    body.appendParagraph('End Date: ' + endDateVal);
  }
  if (assignedTo) body.appendParagraph('Assigned To: ' + assignedTo);
  doc.saveAndClose();
  var CONFIRMATION_FOLDER_ID = PropertiesService.getScriptProperties().getProperty('CONFIRMATION_FOLDER_ID');
  if (!CONFIRMATION_FOLDER_ID) throw new Error('CONFIRMATION_FOLDER_ID not set in Script Properties.');
  var file = DriveApp.getFileById(doc.getId());
  var folder = DriveApp.getFolderById(CONFIRMATION_FOLDER_ID);
  folder.addFile(file);
  DriveApp.getRootFolder().removeFile(file);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  var url = doc.getUrl();
  sheet.getRange(rowIndex, linkCol).setValue(url);
  return url;
}

function planConfirmationFileAdder_sanitizeFileName(name) {
  return name.replace(/[\/\\\?\%\*\:\|\"<>\.]/g, '_').trim();
}