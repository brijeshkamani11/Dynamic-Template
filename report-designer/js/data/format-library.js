/**
 * MCloud Mobile Template Card Designer — Dummy Format Library
 * ────────────────────────────────────────────────────────────
 * Sample template/format combinations for Copy Existing Format flow.
 * Phase 1 update: now includes advanced formats demonstrating rowStyle,
 * colSpan, indicator, icon+text combos, and multi-row card hierarchy.
 * In production: replaced by API fetch.
 *
 * rowStyle keys: background, borderColor, borderWidth, cornerRadius,
 *                paddingVertical, paddingHorizontal, showDivider,
 *                dividerColor, dividerStyle
 * colSpan: per-cell, default 1
 */

const DUMMY_FORMAT_LIBRARY = {

  // ═══════════════════════════════════════════════════════════
  // R0001 — Account Ledger  (5 formats)
  // ═══════════════════════════════════════════════════════════
  R0001: {
    templateName: "Account Ledger",
    formats: {

      // ── F0001: Compact (original, kept as-is) ──────────────
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
                { dataField: "R0001F0001", col: 1, caption: "Party Name", iconCaption: "person",
                  style: { fontWeight: "bold", fontSize: 13 } },
                { dataField: "R0001F0006", col: 2, caption: "Balance", textAlign: "right",
                  style: { fontWeight: "bold", color: "0xFF1565C0" } }
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

      // ── F0002: Grouped by City (original, kept as-is) ──────
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
                { dataField: "R0001F0001", col: 1, caption: "Party Name",
                  style: { fontWeight: "bold" } },
                { dataField: "R0001F0005", col: 2, caption: "Amount", textAlign: "right" },
                { dataField: "R0001F0006", col: 3, caption: "Balance", textAlign: "right",
                  style: { color: "0xFF1565C0" } }
              ]
            }
          ]
        }
      },

      // ── F0003: Rich Card — header row bg + dividers + expanded style ──
      // Demonstrates: rowStyle background, paddingV/H, showDivider,
      //               bold header row, expanded row with different bg,
      //               indicator, icon+text
      F0003: {
        formatName: "Ledger — Rich Card",
        json: {
          layoutType: "grid",
          gridSize: { rows: 3 },
          indicator: { isShow: true, dataField: "R0001F0006" },
          mOnTap: "expand",
          mOnDoubleTap: "",
          templateId: "R0001",
          formatId: "F0003",
          reportDisplayName: "Account Ledger",
          fieldConfigs: [
            {
              // Header row: light-blue background, bold party + balance
              isExpandedRow: false,
              columnCount: 2,
              rowStyle: {
                background: "#e8f0fe",
                paddingVertical: 6,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#c5cae9"
              },
              columnConfig: [
                { dataField: "R0001F0001", col: 1, caption: "Party", iconCaption: "person",
                  style: { fontWeight: "bold", fontSize: 13, color: "0xFF1565C0" } },
                { dataField: "R0001F0006", col: 2, caption: "Balance", textAlign: "right",
                  style: { fontWeight: "bold", fontSize: 13 } }
              ]
            },
            {
              // Body row: city + bill no, subtle divider
              isExpandedRow: false,
              columnCount: 2,
              rowStyle: {
                paddingVertical: 4,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#e8edf8"
              },
              columnConfig: [
                { dataField: "R0001F0002", col: 1, caption: "City", iconCaption: "location" },
                { dataField: "R0001F0003", col: 2, caption: "Bill No", textAlign: "right" }
              ]
            },
            {
              // Body row: amount + account group
              isExpandedRow: false,
              columnCount: 2,
              rowStyle: {
                paddingVertical: 4,
                paddingHorizontal: 8
              },
              columnConfig: [
                { dataField: "R0001F0004", col: 1, caption: "Group" },
                { dataField: "R0001F0005", col: 2, caption: "Amount", textAlign: "right",
                  style: { color: "0xFF22C55E" } }
              ]
            },
            {
              // Expanded footer: date + narration, tinted background
              isExpandedRow: true,
              columnCount: 2,
              rowStyle: {
                background: "#f0f4ff",
                paddingVertical: 5,
                paddingHorizontal: 8,
                borderWidth: 1,
                borderColor: "#c5cae9",
                cornerRadius: 4
              },
              columnConfig: [
                { dataField: "R0001F0009", col: 1, caption: "Date", iconCaption: "date" },
                { dataField: "R0001F0010", col: 2, caption: "Narration", maxLine: 2 }
              ]
            }
          ]
        }
      },

      // ── F0004: GST Detail — colSpan party header + 3-col GST table ──
      // Demonstrates: colSpan (wide party name row), 3-col GST rows,
      //               header row background, border+cornerRadius
      F0004: {
        formatName: "Ledger — GST Detail",
        json: {
          layoutType: "grid",
          gridSize: { rows: 3 },
          indicator: { isShow: true, dataField: "R0001F0006" },
          mOnTap: "expand",
          mOnDoubleTap: "",
          templateId: "R0001",
          formatId: "F0004",
          reportDisplayName: "Account Ledger",
          fieldConfigs: [
            {
              // Row 1: Vou No (left) + Date (right) — header with background
              isExpandedRow: false,
              columnCount: 2,
              rowStyle: {
                background: "#e3f2fd",
                paddingVertical: 5,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#bbdefb"
              },
              columnConfig: [
                { dataField: "R0001F0007", col: 1, caption: "Vou No", iconCaption: "invoice",
                  style: { fontWeight: "bold", color: "0xFF1565C0" } },
                { dataField: "R0001F0009", col: 2, caption: "Date", iconCaption: "date",
                  textAlign: "right" }
              ]
            },
            {
              // Row 2: Party Name — full-width colSpan=2
              isExpandedRow: false,
              columnCount: 2,
              rowStyle: {
                paddingVertical: 5,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#e0e0e0"
              },
              columnConfig: [
                { dataField: "R0001F0001", col: 1, colSpan: 2, caption: "Party Name",
                  style: { fontWeight: "bold", fontSize: 13 } }
              ]
            },
            {
              // Row 3: GST Ass. Amt | SGST | CGST
              isExpandedRow: false,
              columnCount: 3,
              rowStyle: {
                paddingVertical: 4,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#eeeeee"
              },
              columnConfig: [
                { dataField: "R0001F0013", col: 1, caption: "GST Ass. Amt",
                  style: { fontWeight: "bold" } },
                { dataField: "R0001F0014", col: 2, caption: "SGST", textAlign: "right" },
                { dataField: "R0001F0015", col: 3, caption: "CGST", textAlign: "right" }
              ]
            },
            {
              // Row 4: IGST | CESS | Total Expense
              isExpandedRow: false,
              columnCount: 3,
              rowStyle: {
                paddingVertical: 4,
                paddingHorizontal: 8
              },
              columnConfig: [
                { dataField: "R0001F0016", col: 1, caption: "IGST" },
                { dataField: "R0001F0017", col: 2, caption: "CESS", textAlign: "right" },
                { dataField: "R0001F0018", col: 3, caption: "Total Exp.", textAlign: "right",
                  style: { color: "0xFFEF4444", fontWeight: "bold" } }
              ]
            },
            {
              // Expanded: Narration full-width
              isExpandedRow: true,
              columnCount: 1,
              rowStyle: {
                background: "#fafafa",
                paddingVertical: 5,
                paddingHorizontal: 8
              },
              columnConfig: [
                { dataField: "R0001F0010", col: 1, caption: "Narration", maxLine: 3 }
              ]
            }
          ]
        }
      },

      // ── F0005: Transaction Timeline — date•type header + DR/CR amounts ──
      // Demonstrates: colSpan header (date+type merged), colored debit/credit,
      //               bold type label, red/green amount styling, indicator
      F0005: {
        formatName: "Ledger — Transaction View",
        json: {
          layoutType: "grid",
          gridSize: { rows: 2 },
          indicator: { isShow: true, dataField: "R0001F0011" },
          mOnTap: "expand",
          mOnDoubleTap: "",
          templateId: "R0001",
          formatId: "F0005",
          reportDisplayName: "Account Ledger",
          fieldConfigs: [
            {
              // Row 1: Date (colSpan=2 in a 3-col row) + Vou No right
              isExpandedRow: false,
              columnCount: 3,
              rowStyle: {
                background: "#f3e5f5",
                paddingVertical: 5,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#e1bee7"
              },
              columnConfig: [
                { dataField: "R0001F0009", col: 1, colSpan: 2, caption: "Date",
                  iconCaption: "date", style: { fontWeight: "bold", color: "0xFF7B1FA2" } },
                { dataField: "R0001F0007", col: 3, caption: "Vou No", textAlign: "right",
                  style: { color: "0xFF7B1FA2" } }
              ]
            },
            {
              // Row 2: Party | Debit | Credit — 3 cols, amounts colored
              isExpandedRow: false,
              columnCount: 3,
              rowStyle: {
                paddingVertical: 5,
                paddingHorizontal: 8
              },
              columnConfig: [
                { dataField: "R0001F0001", col: 1, caption: "Party", style: { fontWeight: "bold" } },
                { dataField: "R0001F0011", col: 2, caption: "Debit", textAlign: "right",
                  style: { color: "0xFFEF4444" } },
                { dataField: "R0001F0012", col: 3, caption: "Credit", textAlign: "right",
                  style: { color: "0xFF22C55E" } }
              ]
            },
            {
              // Expanded: Type + Narration
              isExpandedRow: true,
              columnCount: 2,
              rowStyle: {
                background: "#fce4ec",
                paddingVertical: 4,
                paddingHorizontal: 8
              },
              columnConfig: [
                { dataField: "R0001F0008", col: 1, caption: "Type",
                  style: { fontWeight: "bold" } },
                { dataField: "R0001F0010", col: 2, caption: "Narration", maxLine: 2 }
              ]
            }
          ]
        }
      }

    }
  },

  // ═══════════════════════════════════════════════════════════
  // R0002 — Day Book  (4 formats)
  // ═══════════════════════════════════════════════════════════
  R0002: {
    templateName: "Day Book",
    formats: {

      // ── F0001: Standard (original, kept as-is) ─────────────
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
                { dataField: "R0001F0009", col: 1, caption: "Date", iconCaption: "date",
                  style: { fontWeight: "bold" } },
                { dataField: "R0001F0008", col: 2, caption: "Type" },
                { dataField: "R0001F0007", col: 3, caption: "Vou No." }
              ]
            },
            {
              isExpandedRow: false,
              columnCount: 2,
              columnConfig: [
                { dataField: "R0001F0001", col: 1, caption: "Party Name" },
                { dataField: "R0001F0011", col: 2, caption: "Debit", textAlign: "right",
                  style: { color: "0xFF22C55E" } }
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

      // ── F0002: Grouped by Voucher Type (original, kept as-is) ──
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
                { dataField: "R0001F0001", col: 1, caption: "Party Name",
                  style: { fontWeight: "bold" } },
                { dataField: "R0001F0011", col: 2, caption: "Debit", textAlign: "right" }
              ]
            }
          ]
        }
      },

      // ── F0003: Colored Header — date header + wide party + DR/CR split ──
      // Demonstrates: rowStyle with background on header, colSpan wide party,
      //               red/green debit/credit side-by-side, dividers between rows
      F0003: {
        formatName: "Day Book — Colored Header",
        json: {
          layoutType: "grid",
          gridSize: { rows: 3 },
          indicator: { isShow: true, dataField: "R0001F0011" },
          mOnTap: "expand",
          mOnDoubleTap: "",
          templateId: "R0002",
          formatId: "F0003",
          reportDisplayName: "Day Book",
          fieldConfigs: [
            {
              // Row 1: Date | Type | Vou No — colored header
              isExpandedRow: false,
              columnCount: 3,
              rowStyle: {
                background: "#e8f5e9",
                paddingVertical: 6,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#c8e6c9"
              },
              columnConfig: [
                { dataField: "R0001F0009", col: 1, caption: "Date", iconCaption: "date",
                  style: { fontWeight: "bold", color: "0xFF2E7D32" } },
                { dataField: "R0001F0008", col: 2, caption: "Type", textAlign: "center",
                  style: { color: "0xFF2E7D32" } },
                { dataField: "R0001F0007", col: 3, caption: "Vou No", textAlign: "right",
                  style: { color: "0xFF2E7D32" } }
              ]
            },
            {
              // Row 2: Party name spanning 3 cols
              isExpandedRow: false,
              columnCount: 3,
              rowStyle: {
                paddingVertical: 5,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#eeeeee"
              },
              columnConfig: [
                { dataField: "R0001F0001", col: 1, colSpan: 3, caption: "Party",
                  iconCaption: "person", style: { fontWeight: "bold", fontSize: 12 } }
              ]
            },
            {
              // Row 3: Debit (red) | Credit (green) — 2 cols
              isExpandedRow: false,
              columnCount: 2,
              rowStyle: {
                paddingVertical: 5,
                paddingHorizontal: 8
              },
              columnConfig: [
                { dataField: "R0001F0011", col: 1, caption: "Debit", textAlign: "right",
                  style: { color: "0xFFEF4444", fontWeight: "bold" } },
                { dataField: "R0001F0012", col: 2, caption: "Credit", textAlign: "right",
                  style: { color: "0xFF22C55E", fontWeight: "bold" } }
              ]
            },
            {
              // Expanded: full-width narration
              isExpandedRow: true,
              columnCount: 1,
              rowStyle: {
                background: "#f1f8e9",
                paddingVertical: 5,
                paddingHorizontal: 8,
                borderWidth: 1,
                borderColor: "#c8e6c9",
                cornerRadius: 4
              },
              columnConfig: [
                { dataField: "R0001F0010", col: 1, caption: "Narration", maxLine: 3 }
              ]
            }
          ]
        }
      },

      // ── F0004: Full 3-Column — all amounts, border on body, colSpan narration ──
      // Demonstrates: border on body row, cornerRadius, colSpan for narration,
      //               compact 3-col amounts, no indicator
      F0004: {
        formatName: "Day Book — 3-Column Full",
        json: {
          layoutType: "grid",
          gridSize: { rows: 2 },
          indicator: { isShow: false, dataField: "" },
          mOnTap: "expand",
          mOnDoubleTap: "",
          templateId: "R0002",
          formatId: "F0004",
          reportDisplayName: "Day Book",
          fieldConfigs: [
            {
              // Row 1: Vou No | Type | Date — plain header
              isExpandedRow: false,
              columnCount: 3,
              rowStyle: {
                paddingVertical: 5,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#e0e0e0"
              },
              columnConfig: [
                { dataField: "R0001F0007", col: 1, caption: "Vou No", iconCaption: "invoice",
                  style: { fontWeight: "bold" } },
                { dataField: "R0001F0008", col: 2, caption: "Type", textAlign: "center" },
                { dataField: "R0001F0009", col: 3, caption: "Date", iconCaption: "date",
                  textAlign: "right" }
              ]
            },
            {
              // Row 2: Party | Debit | Credit — bordered
              isExpandedRow: false,
              columnCount: 3,
              rowStyle: {
                paddingVertical: 5,
                paddingHorizontal: 8,
                borderWidth: 1,
                borderColor: "#e0e0e0",
                cornerRadius: 6
              },
              columnConfig: [
                { dataField: "R0001F0001", col: 1, caption: "Party",
                  style: { fontWeight: "bold" } },
                { dataField: "R0001F0011", col: 2, caption: "Dr", textAlign: "right",
                  style: { color: "0xFFEF4444" } },
                { dataField: "R0001F0012", col: 3, caption: "Cr", textAlign: "right",
                  style: { color: "0xFF22C55E" } }
              ]
            },
            {
              // Expanded: narration (colSpan 3)
              isExpandedRow: true,
              columnCount: 3,
              rowStyle: {
                background: "#fafafa",
                paddingVertical: 4,
                paddingHorizontal: 8
              },
              columnConfig: [
                { dataField: "R0001F0010", col: 1, colSpan: 3, caption: "Narration", maxLine: 2 }
              ]
            }
          ]
        }
      }

    }
  },

  // ═══════════════════════════════════════════════════════════
  // R0003 — Outstanding Report  (4 formats)
  // ═══════════════════════════════════════════════════════════
  R0003: {
    templateName: "Outstanding Report",
    formats: {

      // ── F0001: Summary (original, kept as-is) ──────────────
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
                { dataField: "R0001F0001", col: 1, caption: "Party Name", iconCaption: "person",
                  style: { fontWeight: "bold" } },
                { dataField: "R0001F0032", col: 2, caption: "Pending Amt", textAlign: "right",
                  style: { color: "0xFFEF4444" } }
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

      // ── F0002: Grouped by City (original, kept as-is) ──────
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
                { dataField: "R0001F0001", col: 1, caption: "Party",
                  style: { fontWeight: "bold" } },
                { dataField: "R0001F0030", col: 2, caption: "Days", textAlign: "center" },
                { dataField: "R0001F0032", col: 3, caption: "Pending", textAlign: "right",
                  style: { color: "0xFFEF4444" } }
              ]
            }
          ]
        }
      },

      // ── F0003: Invoice Detail — header bg + colSpan name + due-days row ──
      // Demonstrates: amber/warning row background for overdue look, colSpan 2,
      //               bold pending amount, icon+text combos, expanded bill detail
      F0003: {
        formatName: "Outstanding — Invoice Detail",
        json: {
          layoutType: "grid",
          gridSize: { rows: 3 },
          indicator: { isShow: true, dataField: "R0001F0032" },
          mOnTap: "expand",
          mOnDoubleTap: "",
          templateId: "R0003",
          formatId: "F0003",
          reportDisplayName: "Outstanding Report",
          fieldConfigs: [
            {
              // Row 1: Party name (colSpan 2) — amber header (overdue feel)
              isExpandedRow: false,
              columnCount: 2,
              rowStyle: {
                background: "#fff8e1",
                paddingVertical: 6,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#ffe082"
              },
              columnConfig: [
                { dataField: "R0001F0001", col: 1, colSpan: 2, caption: "Party",
                  iconCaption: "person", style: { fontWeight: "bold", fontSize: 13 } }
              ]
            },
            {
              // Row 2: City (icon) | Due Days (center, red if overdue) | Bill Amt
              isExpandedRow: false,
              columnCount: 3,
              rowStyle: {
                paddingVertical: 5,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#eeeeee"
              },
              columnConfig: [
                { dataField: "R0001F0002", col: 1, caption: "City", iconCaption: "location" },
                { dataField: "R0001F0030", col: 2, caption: "D. Days", textAlign: "center",
                  style: { fontWeight: "bold", color: "0xFFEF4444" } },
                { dataField: "R0001F0031", col: 3, caption: "Bill Amt", textAlign: "right" }
              ]
            },
            {
              // Row 3: Pending amount — prominent, right-aligned
              isExpandedRow: false,
              columnCount: 2,
              rowStyle: {
                paddingVertical: 5,
                paddingHorizontal: 8
              },
              columnConfig: [
                { dataField: "R0001F0004", col: 1, caption: "Group" },
                { dataField: "R0001F0032", col: 2, caption: "Pending", textAlign: "right",
                  style: { fontWeight: "bold", color: "0xFFEF4444", fontSize: 13 } }
              ]
            },
            {
              // Expanded: Bill No + Date
              isExpandedRow: true,
              columnCount: 2,
              rowStyle: {
                background: "#fffde7",
                paddingVertical: 5,
                paddingHorizontal: 8,
                borderWidth: 1,
                borderColor: "#ffe082",
                cornerRadius: 4
              },
              columnConfig: [
                { dataField: "R0001F0003", col: 1, caption: "Bill No", iconCaption: "invoice" },
                { dataField: "R0001F0009", col: 2, caption: "Date", iconCaption: "date",
                  textAlign: "right" }
              ]
            }
          ]
        }
      },

      // ── F0004: Status Bands — bold header + 3-col amounts, bordered body ──
      // Demonstrates: prominent amounts in 3-col, bordered row,
      //               colSpan for party, no indicator, clean amount layout
      F0004: {
        formatName: "Outstanding — Status Bands",
        json: {
          layoutType: "grid",
          gridSize: { rows: 2 },
          indicator: { isShow: false, dataField: "" },
          mOnTap: "expand",
          mOnDoubleTap: "",
          templateId: "R0003",
          formatId: "F0004",
          reportDisplayName: "Outstanding Report",
          fieldConfigs: [
            {
              // Row 1: Party (colSpan 2) + City — header divider
              isExpandedRow: false,
              columnCount: 3,
              rowStyle: {
                paddingVertical: 6,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#e0e0e0"
              },
              columnConfig: [
                { dataField: "R0001F0001", col: 1, colSpan: 2, caption: "Party",
                  iconCaption: "person", style: { fontWeight: "bold" } },
                { dataField: "R0001F0002", col: 3, caption: "City", iconCaption: "location",
                  textAlign: "right" }
              ]
            },
            {
              // Row 2: Due Days | Bill Amt | Pending — 3 cols, bordered
              isExpandedRow: false,
              columnCount: 3,
              rowStyle: {
                paddingVertical: 5,
                paddingHorizontal: 8,
                borderWidth: 1,
                borderColor: "#ffccbc",
                cornerRadius: 6,
                background: "#fff3e0"
              },
              columnConfig: [
                { dataField: "R0001F0030", col: 1, caption: "D.Days",
                  style: { fontWeight: "bold", color: "0xFFE65100" } },
                { dataField: "R0001F0031", col: 2, caption: "Bill Amt", textAlign: "right" },
                { dataField: "R0001F0032", col: 3, caption: "Pending", textAlign: "right",
                  style: { fontWeight: "bold", color: "0xFFEF4444" } }
              ]
            },
            {
              // Expanded: Bill No + Group
              isExpandedRow: true,
              columnCount: 2,
              rowStyle: {
                background: "#fafafa",
                paddingVertical: 4,
                paddingHorizontal: 8
              },
              columnConfig: [
                { dataField: "R0001F0003", col: 1, caption: "Bill No" },
                { dataField: "R0001F0004", col: 2, caption: "Group", textAlign: "right" }
              ]
            }
          ]
        }
      }

    }
  },

  // ═══════════════════════════════════════════════════════════
  // R0004 — Stock / Order Report  (4 formats)  ← NEW TEMPLATE
  // ═══════════════════════════════════════════════════════════
  R0004: {
    templateName: "Stock / Order",
    formats: {

      // ── F0001: Stock Compact — product + qty/rate/amount ──────
      // Demonstrates: stock icon, 3-col amounts, right-align amount,
      //               simple card with divider, indicator
      F0001: {
        formatName: "Stock — Compact",
        json: {
          layoutType: "grid",
          gridSize: { rows: 2 },
          indicator: { isShow: true, dataField: "R0001F0023" },
          mOnTap: "expand",
          mOnDoubleTap: "",
          templateId: "R0004",
          formatId: "F0001",
          reportDisplayName: "Stock / Order",
          fieldConfigs: [
            {
              // Row 1: Product name (bold, stock icon) + Amount right
              isExpandedRow: false,
              columnCount: 2,
              rowStyle: {
                paddingVertical: 6,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#e0e0e0"
              },
              columnConfig: [
                { dataField: "R0001F0019", col: 1, caption: "Product", iconCaption: "stock",
                  style: { fontWeight: "bold", fontSize: 12 } },
                { dataField: "R0001F0023", col: 2, caption: "Amount", textAlign: "right",
                  style: { fontWeight: "bold" } }
              ]
            },
            {
              // Row 2: Qty | Rate | UOM — 3 cols
              isExpandedRow: false,
              columnCount: 3,
              rowStyle: {
                paddingVertical: 4,
                paddingHorizontal: 8
              },
              columnConfig: [
                { dataField: "R0001F0021", col: 1, caption: "Qty", textAlign: "center" },
                { dataField: "R0001F0022", col: 2, caption: "Rate", textAlign: "right" },
                { dataField: "R0001F0024", col: 3, caption: "UOM", textAlign: "right" }
              ]
            }
          ]
        }
      },

      // ── F0002: Stock Grouped — product group drill + detail card ──
      // Demonstrates: group-level drill, bold product, 3-col amounts,
      //               level visibility (L2 only for detail cols)
      F0002: {
        formatName: "Stock — Grouped by Product Group",
        json: {
          layoutType: "grid",
          gridSize: { rows: 2 },
          indicator: { isShow: false, dataField: "" },
          mOnTap: "navigate",
          mOnDoubleTap: "",
          templateId: "R0004",
          formatId: "F0002",
          reportDisplayName: "Stock / Order",
          groupFields: [
            { level: 1, fieldId: "f020", dataField: "R0001F0020", label: "Product Group" }
          ],
          drillConfig: { enabled: true, levelCount: 2, terminalLevel: 2 },
          fieldConfigs: [
            {
              // Row 1: Product name (bold) + amount — both levels
              isExpandedRow: false,
              columnCount: 2,
              rowStyle: {
                paddingVertical: 5,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#e8f5e9"
              },
              columnConfig: [
                { dataField: "R0001F0019", col: 1, caption: "Product", iconCaption: "stock",
                  style: { fontWeight: "bold" } },
                { dataField: "R0001F0023", col: 2, caption: "Amount", textAlign: "right",
                  style: { color: "0xFF2E7D32" } }
              ]
            },
            {
              // Row 2: Qty | Rate | UOM — terminal level only
              isExpandedRow: false,
              columnCount: 3,
              rowStyle: {
                paddingVertical: 4,
                paddingHorizontal: 8
              },
              columnConfig: [
                { dataField: "R0001F0021", col: 1, caption: "Qty", levelVisibility: [2],
                  textAlign: "center" },
                { dataField: "R0001F0022", col: 2, caption: "Rate", levelVisibility: [2],
                  textAlign: "right" },
                { dataField: "R0001F0024", col: 3, caption: "UOM", levelVisibility: [2],
                  textAlign: "right" }
              ]
            }
          ]
        }
      },

      // ── F0003: Order Summary — SO header + party wide + qty/delivery status ──
      // Demonstrates: invoice icon header row with bg, wide colSpan party,
      //               3-col order qty / delivered / pending, green/red delivered
      F0003: {
        formatName: "Order — Summary",
        json: {
          layoutType: "grid",
          gridSize: { rows: 3 },
          indicator: { isShow: false, dataField: "" },
          mOnTap: "expand",
          mOnDoubleTap: "",
          templateId: "R0004",
          formatId: "F0003",
          reportDisplayName: "Stock / Order",
          fieldConfigs: [
            {
              // Row 1: Order No (invoice icon) | Order Date (date icon) — header bg
              isExpandedRow: false,
              columnCount: 2,
              rowStyle: {
                background: "#e8eaf6",
                paddingVertical: 6,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#c5cae9"
              },
              columnConfig: [
                { dataField: "R0001F0025", col: 1, caption: "Order No", iconCaption: "invoice",
                  style: { fontWeight: "bold", color: "0xFF283593" } },
                { dataField: "R0001F0026", col: 2, caption: "Order Date", iconCaption: "date",
                  textAlign: "right", style: { color: "0xFF283593" } }
              ]
            },
            {
              // Row 2: Party name colSpan=2 (full width)
              isExpandedRow: false,
              columnCount: 2,
              rowStyle: {
                paddingVertical: 5,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#eeeeee"
              },
              columnConfig: [
                { dataField: "R0001F0001", col: 1, colSpan: 2, caption: "Party",
                  iconCaption: "person", style: { fontWeight: "bold" } }
              ]
            },
            {
              // Row 3: Order Qty | Delivered | Pending — 3 cols
              isExpandedRow: false,
              columnCount: 3,
              rowStyle: {
                paddingVertical: 5,
                paddingHorizontal: 8
              },
              columnConfig: [
                { dataField: "R0001F0027", col: 1, caption: "Ord Qty", textAlign: "center" },
                { dataField: "R0001F0028", col: 2, caption: "Delivered", textAlign: "center",
                  style: { color: "0xFF22C55E" } },
                { dataField: "R0001F0029", col: 3, caption: "Pending", textAlign: "right",
                  style: { color: "0xFFEF4444", fontWeight: "bold" } }
              ]
            }
          ]
        }
      },

      // ── F0004: Order Status View — bordered card, large pending qty ──
      // Demonstrates: bordered card row, background on status row,
      //               colSpan for order info header, clear qty layout
      F0004: {
        formatName: "Order — Status View",
        json: {
          layoutType: "grid",
          gridSize: { rows: 2 },
          indicator: { isShow: true, dataField: "R0001F0029" },
          mOnTap: "expand",
          mOnDoubleTap: "",
          templateId: "R0004",
          formatId: "F0004",
          reportDisplayName: "Stock / Order",
          fieldConfigs: [
            {
              // Row 1: Order No (colSpan 2) + Date right — 3 cols
              isExpandedRow: false,
              columnCount: 3,
              rowStyle: {
                background: "#e3f2fd",
                paddingVertical: 5,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#bbdefb"
              },
              columnConfig: [
                { dataField: "R0001F0025", col: 1, colSpan: 2, caption: "Order No",
                  iconCaption: "invoice", style: { fontWeight: "bold", color: "0xFF0277BD" } },
                { dataField: "R0001F0026", col: 3, caption: "Date", iconCaption: "date",
                  textAlign: "right" }
              ]
            },
            {
              // Row 2: Party + Pending qty — bordered highlight
              isExpandedRow: false,
              columnCount: 2,
              rowStyle: {
                paddingVertical: 5,
                paddingHorizontal: 8,
                borderWidth: 1,
                borderColor: "#bbdefb",
                cornerRadius: 6
              },
              columnConfig: [
                { dataField: "R0001F0001", col: 1, caption: "Party",
                  style: { fontWeight: "bold" } },
                { dataField: "R0001F0029", col: 2, caption: "Pending Qty", textAlign: "right",
                  style: { fontWeight: "bold", color: "0xFFEF4444", fontSize: 13 } }
              ]
            },
            {
              // Expanded: Qty breakdown
              isExpandedRow: true,
              columnCount: 3,
              rowStyle: {
                background: "#e3f2fd",
                paddingVertical: 4,
                paddingHorizontal: 8
              },
              columnConfig: [
                { dataField: "R0001F0027", col: 1, caption: "Ordered" },
                { dataField: "R0001F0028", col: 2, caption: "Delivered", textAlign: "center",
                  style: { color: "0xFF22C55E" } },
                { dataField: "R0001F0029", col: 3, caption: "Remaining", textAlign: "right",
                  style: { color: "0xFFEF4444" } }
              ]
            }
          ]
        }
      }

    }
  },

  // ═══════════════════════════════════════════════════════════
  // R0005 — GST Report  (3 formats)  ← NEW TEMPLATE
  // ═══════════════════════════════════════════════════════════
  R0005: {
    templateName: "GST Report",
    formats: {

      // ── F0001: GST Basic — vou+date header + party wide + GST table ──
      // Demonstrates: 2-row GST breakdown, colSpan party name,
      //               red Total Expense, header background, dividers
      F0001: {
        formatName: "GST — Basic View",
        json: {
          layoutType: "grid",
          gridSize: { rows: 4 },
          indicator: { isShow: true, dataField: "R0001F0013" },
          mOnTap: "expand",
          mOnDoubleTap: "",
          templateId: "R0005",
          formatId: "F0001",
          reportDisplayName: "GST Report",
          fieldConfigs: [
            {
              // Row 1: Vou No + Date — header bg
              isExpandedRow: false,
              columnCount: 2,
              rowStyle: {
                background: "#fce4ec",
                paddingVertical: 5,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#f8bbd0"
              },
              columnConfig: [
                { dataField: "R0001F0007", col: 1, caption: "Vou No", iconCaption: "invoice",
                  style: { fontWeight: "bold", color: "0xFFAD1457" } },
                { dataField: "R0001F0009", col: 2, caption: "Date", iconCaption: "date",
                  textAlign: "right", style: { color: "0xFFAD1457" } }
              ]
            },
            {
              // Row 2: Party name (colSpan 2, full width)
              isExpandedRow: false,
              columnCount: 2,
              rowStyle: {
                paddingVertical: 5,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#e0e0e0"
              },
              columnConfig: [
                { dataField: "R0001F0001", col: 1, colSpan: 2, caption: "Party",
                  iconCaption: "person", style: { fontWeight: "bold", fontSize: 12 } }
              ]
            },
            {
              // Row 3: GST Ass. Amt | SGST | CGST
              isExpandedRow: false,
              columnCount: 3,
              rowStyle: {
                paddingVertical: 4,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#eeeeee"
              },
              columnConfig: [
                { dataField: "R0001F0013", col: 1, caption: "GST Ass. Amt",
                  style: { fontWeight: "bold" } },
                { dataField: "R0001F0014", col: 2, caption: "SGST", textAlign: "right" },
                { dataField: "R0001F0015", col: 3, caption: "CGST", textAlign: "right" }
              ]
            },
            {
              // Row 4: IGST | CESS | Total Exp (red)
              isExpandedRow: false,
              columnCount: 3,
              rowStyle: {
                paddingVertical: 4,
                paddingHorizontal: 8
              },
              columnConfig: [
                { dataField: "R0001F0016", col: 1, caption: "IGST" },
                { dataField: "R0001F0017", col: 2, caption: "CESS", textAlign: "right" },
                { dataField: "R0001F0018", col: 3, caption: "Total Exp.", textAlign: "right",
                  style: { color: "0xFFEF4444", fontWeight: "bold" } }
              ]
            }
          ]
        }
      },

      // ── F0002: GST Full Detail — 3-col header + all GST rows + narration ──
      // Demonstrates: 3-col header, max Phase 1 complexity, expanded narration,
      //               corner radius on GST body, blue header vs pink GST rows
      F0002: {
        formatName: "GST — Full Detail",
        json: {
          layoutType: "grid",
          gridSize: { rows: 4 },
          indicator: { isShow: true, dataField: "R0001F0018" },
          mOnTap: "expand",
          mOnDoubleTap: "",
          templateId: "R0005",
          formatId: "F0002",
          reportDisplayName: "GST Report",
          fieldConfigs: [
            {
              // Row 1: Vou No | Type | Date — 3-col header
              isExpandedRow: false,
              columnCount: 3,
              rowStyle: {
                background: "#e8f0fe",
                paddingVertical: 6,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#c5cae9"
              },
              columnConfig: [
                { dataField: "R0001F0007", col: 1, caption: "Vou No", iconCaption: "invoice",
                  style: { fontWeight: "bold", color: "0xFF1565C0" } },
                { dataField: "R0001F0008", col: 2, caption: "Type", textAlign: "center",
                  style: { color: "0xFF1565C0" } },
                { dataField: "R0001F0009", col: 3, caption: "Date", iconCaption: "date",
                  textAlign: "right", style: { color: "0xFF1565C0" } }
              ]
            },
            {
              // Row 2: Party (colSpan 2) + Balance right
              isExpandedRow: false,
              columnCount: 3,
              rowStyle: {
                paddingVertical: 5,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#e0e0e0"
              },
              columnConfig: [
                { dataField: "R0001F0001", col: 1, colSpan: 2, caption: "Party",
                  iconCaption: "person", style: { fontWeight: "bold", fontSize: 13 } },
                { dataField: "R0001F0005", col: 3, caption: "Amount", textAlign: "right" }
              ]
            },
            {
              // Row 3: GST Ass. | SGST | CGST — with border
              isExpandedRow: false,
              columnCount: 3,
              rowStyle: {
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderWidth: 1,
                borderColor: "#f8bbd0",
                cornerRadius: 4,
                showDivider: true,
                dividerColor: "#fce4ec"
              },
              columnConfig: [
                { dataField: "R0001F0013", col: 1, caption: "GST Ass. Amt",
                  style: { fontWeight: "bold" } },
                { dataField: "R0001F0014", col: 2, caption: "SGST", textAlign: "right" },
                { dataField: "R0001F0015", col: 3, caption: "CGST", textAlign: "right" }
              ]
            },
            {
              // Row 4: IGST | CESS | Total Exp (red bold)
              isExpandedRow: false,
              columnCount: 3,
              rowStyle: {
                paddingVertical: 4,
                paddingHorizontal: 8
              },
              columnConfig: [
                { dataField: "R0001F0016", col: 1, caption: "IGST" },
                { dataField: "R0001F0017", col: 2, caption: "CESS", textAlign: "right" },
                { dataField: "R0001F0018", col: 3, caption: "Total Exp.", textAlign: "right",
                  style: { fontWeight: "bold", fontSize: 13, color: "0xFFEF4444" } }
              ]
            },
            {
              // Expanded: Narration full-width
              isExpandedRow: true,
              columnCount: 3,
              rowStyle: {
                background: "#f3e5f5",
                paddingVertical: 5,
                paddingHorizontal: 8,
                borderWidth: 1,
                borderColor: "#e1bee7",
                cornerRadius: 4
              },
              columnConfig: [
                { dataField: "R0001F0010", col: 1, colSpan: 3, caption: "Narration", maxLine: 3 }
              ]
            }
          ]
        }
      },

      // ── F0003: GST by Party — grouped + summary ──────────────
      // Demonstrates: group drill (Party), GST summary compact,
      //               level visibility (terminal only for GST rows)
      F0003: {
        formatName: "GST — Grouped by Party",
        json: {
          layoutType: "grid",
          gridSize: { rows: 2 },
          indicator: { isShow: false, dataField: "" },
          mOnTap: "navigate",
          mOnDoubleTap: "",
          templateId: "R0005",
          formatId: "F0003",
          reportDisplayName: "GST Report",
          groupFields: [
            { level: 1, fieldId: "f001", dataField: "R0001F0001", label: "Party" }
          ],
          drillConfig: { enabled: true, levelCount: 2, terminalLevel: 2 },
          fieldConfigs: [
            {
              // Row 1: Party (L1 only) | Date (L2 only) — level visibility
              isExpandedRow: false,
              columnCount: 2,
              rowStyle: {
                paddingVertical: 5,
                paddingHorizontal: 8,
                showDivider: true,
                dividerColor: "#e0e0e0"
              },
              columnConfig: [
                { dataField: "R0001F0001", col: 1, caption: "Party", levelVisibility: [1],
                  style: { fontWeight: "bold" } },
                { dataField: "R0001F0009", col: 2, caption: "Date", iconCaption: "date",
                  levelVisibility: [2], textAlign: "right" }
              ]
            },
            {
              // Row 2: GST Ass. Amt | Total Exp — 2 cols
              isExpandedRow: false,
              columnCount: 2,
              rowStyle: {
                paddingVertical: 4,
                paddingHorizontal: 8
              },
              columnConfig: [
                { dataField: "R0001F0013", col: 1, caption: "GST Ass. Amt" },
                { dataField: "R0001F0018", col: 2, caption: "Total Exp.", textAlign: "right",
                  style: { color: "0xFFEF4444" } }
              ]
            }
          ]
        }
      }

    }
  }

};
