# Content Audit Toolkit (content-audit-toolkit-20250623_155133)

A Google Sheets?based toolkit that scans content data, applies configurable audit rules, and outputs a summary report with charts and export options. Provides an interactive sidebar UI and custom menu integration.

Project plan and notes  
? Plan document: https://docs.google.com/document/d/16zW_cFB-4i2T9lw-NMCyE3mUHXBe23AOlkfJZPr8cAM/  
? Project plan title: CONTENT AUDIT TOOLKIT PROJECT PLAN  

---

## Table of Contents

1. [Overview](#overview)  
2. [Features](#features)  
3. [Architecture](#architecture)  
4. [Installation](#installation)  
5. [Usage](#usage)  
6. [Components](#components)  
7. [Dependencies](#dependencies)  
8. [Missing or Unspecified Items](#missing-or-unspecified-items)  
9. [License & Contributing](#license--contributing)

---

## Overview

The **Content Audit Toolkit** is a Google Apps Script?powered add-on for Google Sheets. It enables you to:

- Scan content data in any sheet  
- Apply a set of configurable audit rules  
- Generate a new report sheet with color-coded results  
- Insert native Google Sheets charts summarizing key metrics  
- Export the report as CSV directly from a custom sidebar  

---

## Features

- **Custom Menu Integration** on spreadsheet open (`onOpen` trigger)  
- **Interactive Sidebar UI** with dropdowns, checkboxes, buttons  
- **Configurable Audit Rules** stored in a hidden configuration sheet  
- **Modular .gs Files** for core logic, utilities, charting, and export  
- **Report Generation** in a new sheet with embedded charts  
- **CSV Export** via CloudExport  
- **Error Handling & Notifications**  

---

## Architecture

- **Google Apps Script backend** (`.gs` files)  
  - `Code.gs` ? menu creation, main audit runner  
  - `Config.gs` ? rule definitions and user settings  
  - `Utilities.gs` ? helper functions (logging, sheet ops)  
  - `Charts.gs` ? builds and inserts native charts  
  - `CloudExport.gs` ? prepares and downloads CSV  
- **Custom Sidebar**  
  - `Sidebar.html` ? HTML template  
  - `Sidebar.js` ? client-side logic, `google.script.run` calls  
  - `Styles.css` ? layout, typography, responsive styles  
- **Hidden Configuration Sheet** for persisting user settings and rules  

---

## Installation

1. Open your Google Sheet.  
2. Select **Extensions ? Apps Script**.  
3. In the Apps Script editor, replace the default files with the toolkit files (see [Components](#components)).  
4. Save and **Deploy** > **Test deployments**.  
5. Back in the sheet, reload. You should see **Audit Toolkit** in the menu bar.

---

## Usage

1. **Open the Sidebar**  
   - Menu: **Audit Toolkit ? Open Sidebar**  
2. **Configure Audit Parameters**  
   - Select sheet, date ranges, rule sets, output options  
3. **Run Audit**  
   - Click **Run Audit**  
   - The sidebar sends parameters to `Code.gs` via `google.script.run`  
   - Upon completion, a new sheet named `Audit Report` is created  
4. **Review Results & Charts**  
   - Color-coded results in the sheet  
   - Summary charts inserted below  
5. **Export CSV**  
   - Click **Export CSV** in the sidebar  
   - CSV download is triggered by `CloudExport.gs`

### Example Code Snippet

```javascript
// Code.gs
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Audit Toolkit')
    .addItem('Open Sidebar', 'openSidebar')
    .addToUi();
}

function openSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('Content Audit Toolkit');
  SpreadsheetApp.getUi().showSidebar(html);
}
```

---

## Components

The following files compose the toolkit:

### Google Apps Script (.gs)

- **Code.gs**  
  Main entry, menu creation, audit orchestration  
- **Config.gs**  
  Defines default audit rules and settings  
- **Utilities.gs**  
  Shared helper functions (sheet lookup, logging)  
- **Charts.gs**  
  Functions to create and insert charts  
- **CloudExport.gs**  
  Prepares and triggers CSV download  

### Client-side (HTML/CSS/JS)

- **Sidebar.html**  
  Markup for the interactive sidebar  
- **Sidebar.js**  
  Handles UI events and calls server functions  
- **Styles.css**  
  Styles for layout, typography, responsive behavior  

### Plan-Confirmation Components

These were identified during plan confirmation?some may be placeholders or require integration:

| Title                       | Type  | Status | Notes                                                       |
|-----------------------------|-------|--------|-------------------------------------------------------------|
| addMissingAiFile            | .gs   | Fail   | Placeholder added to match AI plan structure                |
| config                      | .gs   | Pass   | AI-listed file confirmation                                 |
| planConfirmationFileAdder   | .gs   | Pass   | Matches plan structure                                      |
| insertMissingAiFile         | .gs   | Fail   | Placeholder                                                 |
| addAiListedFile             | .gs   | Pass   | Matches plan structure                                      |
| confirmMissingFileEntry     | .html | Pass   | Placeholder UI                                              |
| addMissingAiFile            | .js   | Fail   | Placeholder                                                 |
| missingFileConfirmation     | .css  | Pass   | Placeholder styles                                          |

---

## Dependencies

- Google Workspace account with edit access to a Sheet  
- Google Apps Script (built-in in Google Sheets)  
- No external libraries required by default  

---

## Missing or Unspecified Items

- **Sidebar Controls**: Ensure all dropdowns, checkboxes, buttons are implemented  
- **Styles.css**: Verify layout, typography, mobile/responsive support  
- **ID/Label Consistency**: Match menu items in `Code.gs` with element IDs in `Sidebar.html`/`.js`  
- **Unit Tests**: None included?consider adding your own tests  
- **Localization**: No i18n files?add if multi-language support is needed  

---

## License & Contributing

This toolkit is provided ?as is.? You are free to adapt, extend, and integrate into your own Sheets.  
Feel free to submit issues or pull requests to refine functionality, add tests, or improve UI/UX.

---

For more details, see the [Project Plan](https://docs.google.com/document/d/16zW_cFB-4i2T9lw-NMCyE3mUHXBe23AOlkfJZPr8cAM/).