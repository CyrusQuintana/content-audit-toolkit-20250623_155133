const CONTENT_SHEET_NAME = 'Content Data';
const HEADER_AI_FILE = 'AI URL';
const HEADER_SOURCE_URL = 'URL';

/**
 * Adds custom menu on open.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Content Audit')
    .addItem('Insert Missing AI Files', 'insertMissingAiFile')
    .addToUi();
}

/**
 * Scans the Content Data sheet for rows where the AI URL column is empty
 * but the URL column has a value. For each such row, it generates
 * an AI content file in Drive and pastes the file URL back into the sheet.
 * Errors are logged per row, and processing continues on failure.
 */
function insertMissingAiFile() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONTENT_SHEET_NAME);
  if (!sheet) {
    throw new Error(`Sheet "${CONTENT_SHEET_NAME}" not found.`);
  }

  const allValues = sheet.getDataRange().getValues();
  if (allValues.length < 2) return;  // nothing to process

  const headers = allValues[0];
  const aiFileColIndex = headers.indexOf(HEADER_AI_FILE);
  const sourceUrlColIndex = headers.indexOf(HEADER_SOURCE_URL);
  if (aiFileColIndex < 0 || sourceUrlColIndex < 0) {
    throw new Error(`Required columns "${HEADER_AI_FILE}" or "${HEADER_SOURCE_URL}" not found.`);
  }

  const totalRows = allValues.length - 1;
  const aiRange = sheet.getRange(2, aiFileColIndex + 1, totalRows, 1);
  const aiValues = aiRange.getValues();  // existing AI URL column values

  const updatesMap = {};
  const errors = [];
  const timestamp = new Date().toISOString();

  for (let i = 1; i < allValues.length; i++) {
    const row = allValues[i];
    const aiCell = row[aiFileColIndex];
    const sourceUrl = row[sourceUrlColIndex];
    if ((!aiCell || aiCell.toString().trim() === '') && sourceUrl) {
      try {
        const aiContent = generateAiContent(sourceUrl);
        const fileName = `AI_Content_Row${i + 1}_${timestamp}.txt`;
        const file = DriveApp.createFile(fileName, aiContent, MimeType.PLAIN_TEXT);
        updatesMap[i] = file.getUrl();
      } catch (e) {
        errors.push(`Row ${i + 1}: ${e.message}`);
      }
    }
  }

  // Apply updates to the in-memory aiValues array
  Object.keys(updatesMap).forEach(key => {
    const rowIndex = parseInt(key, 10) - 1;  // aiValues index for sheet row key+1
    aiValues[rowIndex][0] = updatesMap[key];
  });

  // Batch write the updated AI URL column
  aiRange.setValues(aiValues);

  // Notify user
  const successCount = Object.keys(updatesMap).length;
  let message = successCount
    ? `Inserted ${successCount} AI files.`
    : 'No missing AI files found.';
  if (errors.length) {
    message += '\nErrors:\n' + errors.join('\n');
  }
  SpreadsheetApp.getUi().alert(message);
}

/**
 * Stub function to generate AI content based on a source URL.
 * Replace with real AI service integration.
 *
 * @param {string} sourceUrl
 * @return {string}
 */
function generateAiContent(sourceUrl) {
  // TODO: Integrate with your AI provider (OpenAI, Vertex AI, etc.)
  return `AI-generated content based on: ${sourceUrl}`;
}