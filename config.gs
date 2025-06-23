const CONTENT_AUDIT_CONFIG = {
  SHEETS: {
    SETTINGS: 'Settings',
    RULES: 'Audit Rules',
    DATA: 'Content Data',
    RESULTS: 'Audit Results',
    LOG: 'Audit Logs'
  },
  SETTINGS_HEADERS: [
    ['Key', 'Value', 'Description'],
    ['defaultRuleSeverity', 'warning', 'Default severity level for new rules'],
    ['logEnabled', 'true', 'Enable or disable audit logging']
  ],
  RULES_HEADERS: [
    ['Rule ID', 'Rule Name', 'Enabled', 'Severity', 'Pattern', 'Description']
  ],
  DATA_HEADERS: [
    ['Content ID', 'URL', 'Title', 'Body', 'Last Updated']
  ],
  RESULTS_HEADERS: [
    ['Content ID', 'Rule ID', 'Rule Name', 'Severity', 'Message', 'Timestamp']
  ],
  LOG_HEADERS: [
    ['Timestamp', 'Level', 'Message']
  ],
  MENU: {
    TITLE: 'Content Audit',
    ITEMS: [
      { name: 'Initialize Toolkit', functionName: 'initializeToolkit' },
      { name: 'Run Audit', functionName: 'runAudit' },
      { name: 'Refresh Audit', functionName: 'refreshAudit' },
      { name: 'Settings', functionName: 'openSettingsSidebar' }
    ]
  }
};

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  const menu = ui.createMenu(CONTENT_AUDIT_CONFIG.MENU.TITLE);
  CONTENT_AUDIT_CONFIG.MENU.ITEMS.forEach(item => {
    menu.addItem(item.name, item.functionName);
  });
  menu.addToUi();
}

function initializeToolkit() {
  const ss = SpreadsheetApp.getActive();
  createSheet(ss, CONTENT_AUDIT_CONFIG.SHEETS.SETTINGS, CONTENT_AUDIT_CONFIG.SETTINGS_HEADERS);
  createSheet(ss, CONTENT_AUDIT_CONFIG.SHEETS.RULES, CONTENT_AUDIT_CONFIG.RULES_HEADERS);
  createSheet(ss, CONTENT_AUDIT_CONFIG.SHEETS.DATA, CONTENT_AUDIT_CONFIG.DATA_HEADERS);
  createSheet(ss, CONTENT_AUDIT_CONFIG.SHEETS.RESULTS, CONTENT_AUDIT_CONFIG.RESULTS_HEADERS);
  createSheet(ss, CONTENT_AUDIT_CONFIG.SHEETS.LOG, CONTENT_AUDIT_CONFIG.LOG_HEADERS);
  SpreadsheetApp.getUi().alert('Content Audit Toolkit initialized.');
}

function createSheet(ss, name, headers) {
  if (!ss.getSheetByName(name)) {
    const sheet = ss.insertSheet(name);
    sheet.getRange(1, 1, headers.length, headers[0].length)
         .setValues(headers);
    sheet.setFrozenRows(1);
  }
}

function openSettingsSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('SettingsSidebar')
    .setTitle('Content Audit Settings');
  SpreadsheetApp.getUi().showSidebar(html);
}

function getConfigValue(key) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(CONTENT_AUDIT_CONFIG.SHEETS.SETTINGS);
  if (!sheet) return null;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      return parseValue(data[i][1]);
    }
  }
  return null;
}

function setConfigValue(key, value) {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(CONTENT_AUDIT_CONFIG.SHEETS.SETTINGS);
  if (!sheet) return;
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === key) {
      sheet.getRange(i + 1, 2).setValue(value);
      return;
    }
  }
  sheet.appendRow([key, value, '']);
}

function parseValue(val) {
  if (typeof val !== 'string') return val;
  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();
  if (lower === 'true') return true;
  if (lower === 'false') return false;
  if (trimmed !== '' && !isNaN(trimmed)) return Number(trimmed);
  return val;
}