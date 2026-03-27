/**
 * MCloud Mobile Template Card Designer — Dummy Format Library
 * ────────────────────────────────────────────────────────────
 * Sample template/format combinations for Copy Existing Format flow.
 * In production: replaced by API fetch.
 */

const DUMMY_FORMAT_LIBRARY = {
  R0001: {
    templateName: "Account Ledger",
    formats: {
      F0001: {
        formatName: "Ledger — Compact",
        json: {
          layoutType: "grid",
          gridSize: { rows: 2 },
          indicator: { isShow: true, dataField: "R0001F0006" },
          mOnTap: "expand",
          mOnDoubleTap: "",
          templateId: "R0001",
          formatId: "F0001",
          reportDisplayName: "Account Ledger",
          fieldConfigs: [
            {
              isExpandedRow: false,
              columnCount: 2,
              columnConfig: [
                { dataField: "R0001F0001", col: 1, caption: "Party Name", iconCaption: "person", style: { fontWeight: "bold", fontSize: 13 } },
                { dataField: "R0001F0006", col: 2, caption: "Balance", textAlign: "right", style: { fontWeight: "bold", color: "0xFF1565C0" } }
              ]
            },
            {
              isExpandedRow: false,
              columnCount: 2,
              columnConfig: [
                { dataField: "R0001F0002", col: 1, caption: "City", iconCaption: "location" },
                { dataField: "R0001F0003", col: 2, caption: "Bill No" }
              ]
            },
            {
              isExpandedRow: true,
              columnCount: 2,
              columnConfig: [
                { dataField: "R0001F0009", col: 1, caption: "Date", iconCaption: "date" },
                { dataField: "R0001F0010", col: 2, caption: "Narration" }
              ]
            }
          ]
        }
      },
      F0002: {
        formatName: "Ledger — Grouped by City",
        json: {
          layoutType: "grid",
          gridSize: { rows: 1 },
          indicator: { isShow: false, dataField: "" },
          mOnTap: "navigate",
          mOnDoubleTap: "",
          templateId: "R0001",
          formatId: "F0002",
          reportDisplayName: "Account Ledger",
          groupFields: [
            { level: 1, fieldId: "f002", dataField: "R0001F0002", label: "City" }
          ],
          drillConfig: { enabled: true, levelCount: 2, terminalLevel: 2 },
          fieldConfigs: [
            {
              isExpandedRow: false,
              columnCount: 3,
              columnConfig: [
                { dataField: "R0001F0001", col: 1, caption: "Party Name", style: { fontWeight: "bold" } },
                { dataField: "R0001F0005", col: 2, caption: "Amount", textAlign: "right" },
                { dataField: "R0001F0006", col: 3, caption: "Balance", textAlign: "right", style: { color: "0xFF1565C0" } }
              ]
            }
          ]
        }
      }
    }
  },
  R0002: {
    templateName: "Day Book",
    formats: {
      F0001: {
        formatName: "Day Book — Standard",
        json: {
          layoutType: "grid",
          gridSize: { rows: 2 },
          indicator: { isShow: true, dataField: "R0001F0011" },
          mOnTap: "expand",
          mOnDoubleTap: "",
          templateId: "R0002",
          formatId: "F0001",
          reportDisplayName: "Day Book",
          fieldConfigs: [
            {
              isExpandedRow: false,
              columnCount: 3,
              columnConfig: [
                { dataField: "R0001F0009", col: 1, caption: "Date", iconCaption: "date", style: { fontWeight: "bold" } },
                { dataField: "R0001F0008", col: 2, caption: "Type" },
                { dataField: "R0001F0007", col: 3, caption: "Vou No." }
              ]
            },
            {
              isExpandedRow: false,
              columnCount: 2,
              columnConfig: [
                { dataField: "R0001F0001", col: 1, caption: "Party Name" },
                { dataField: "R0001F0011", col: 2, caption: "Debit", textAlign: "right", style: { color: "0xFF22C55E" } }
              ]
            },
            {
              isExpandedRow: true,
              columnCount: 1,
              columnConfig: [
                { dataField: "R0001F0010", col: 1, caption: "Narration", maxLine: 2 }
              ]
            }
          ]
        }
      },
      F0002: {
        formatName: "Day Book — Grouped by Voucher Type",
        json: {
          layoutType: "grid",
          gridSize: { rows: 2 },
          indicator: { isShow: false, dataField: "" },
          mOnTap: "navigate",
          mOnDoubleTap: "",
          templateId: "R0002",
          formatId: "F0002",
          reportDisplayName: "Day Book",
          groupFields: [
            { level: 1, fieldId: "f008", dataField: "R0001F0008", label: "Voucher Type" }
          ],
          drillConfig: { enabled: true, levelCount: 2, terminalLevel: 2 },
          fieldConfigs: [
            {
              isExpandedRow: false,
              columnCount: 2,
              columnConfig: [
                { dataField: "R0001F0009", col: 1, caption: "Date", iconCaption: "date" },
                { dataField: "R0001F0007", col: 2, caption: "Vou No." }
              ]
            },
            {
              isExpandedRow: false,
              columnCount: 2,
              columnConfig: [
                { dataField: "R0001F0001", col: 1, caption: "Party Name", style: { fontWeight: "bold" } },
                { dataField: "R0001F0011", col: 2, caption: "Debit", textAlign: "right" }
              ]
            }
          ]
        }
      }
    }
  },
  R0003: {
    templateName: "Outstanding Report",
    formats: {
      F0001: {
        formatName: "Outstanding — Summary",
        json: {
          layoutType: "grid",
          gridSize: { rows: 2 },
          indicator: { isShow: true, dataField: "R0001F0032" },
          mOnTap: "expand",
          mOnDoubleTap: "",
          templateId: "R0003",
          formatId: "F0001",
          reportDisplayName: "Outstanding Report",
          fieldConfigs: [
            {
              isExpandedRow: false,
              columnCount: 2,
              columnConfig: [
                { dataField: "R0001F0001", col: 1, caption: "Party Name", iconCaption: "person", style: { fontWeight: "bold" } },
                { dataField: "R0001F0032", col: 2, caption: "Pending Amt", textAlign: "right", style: { color: "0xFFEF4444" } }
              ]
            },
            {
              isExpandedRow: false,
              columnCount: 3,
              columnConfig: [
                { dataField: "R0001F0002", col: 1, caption: "City", iconCaption: "location" },
                { dataField: "R0001F0030", col: 2, caption: "Due Days", textAlign: "center" },
                { dataField: "R0001F0031", col: 3, caption: "Bill Amt", textAlign: "right" }
              ]
            }
          ]
        }
      },
      F0002: {
        formatName: "Outstanding — Grouped by City",
        json: {
          layoutType: "grid",
          gridSize: { rows: 1 },
          indicator: { isShow: true, dataField: "R0001F0032" },
          mOnTap: "navigate",
          mOnDoubleTap: "",
          templateId: "R0003",
          formatId: "F0002",
          reportDisplayName: "Outstanding Report",
          groupFields: [
            { level: 1, fieldId: "f002", dataField: "R0001F0002", label: "City" }
          ],
          drillConfig: { enabled: true, levelCount: 2, terminalLevel: 2 },
          fieldConfigs: [
            {
              isExpandedRow: false,
              columnCount: 3,
              columnConfig: [
                { dataField: "R0001F0001", col: 1, caption: "Party", style: { fontWeight: "bold" } },
                { dataField: "R0001F0030", col: 2, caption: "Days", textAlign: "center" },
                { dataField: "R0001F0032", col: 3, caption: "Pending", textAlign: "right", style: { color: "0xFFEF4444" } }
              ]
            }
          ]
        }
      }
    }
  }
};
