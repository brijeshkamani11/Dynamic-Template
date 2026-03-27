/**
 * AVAILABLE FIELDS REGISTRY
 * ─────────────────────────
 * Each field has:
 *   id        : unique ID used internally in the designer
 *   label     : friendly name shown to user
 *   dataField : backend key (R####F####) — hidden from non-technical users
 *   defaultCaption : suggested caption when dropped
 *   category  : grouping for the field palette
 *   groupable : true if this field can be used as a row-group field (Stage A)
 *
 * In production: this list will come from an API call
 * based on the selected Report ID.
 */

const FIELD_REGISTRY = [
  // ── ACCOUNT / PARTY ──────────────────────────────
  { id: "f001", label: "Party Name",     dataField: "R0001F0001", defaultCaption: "Party Name",  category: "Account",     groupable: true },
  { id: "f002", label: "City",           dataField: "R0001F0002", defaultCaption: "City",         category: "Account",     groupable: true },
  { id: "f003", label: "Bill No",        dataField: "R0001F0003", defaultCaption: "Bill No",      category: "Account",     groupable: false },
  { id: "f004", label: "Account Group",  dataField: "R0001F0004", defaultCaption: "Group",        category: "Account",     groupable: true },
  { id: "f005", label: "Amount",         dataField: "R0001F0005", defaultCaption: "Amount",       category: "Account",     groupable: false },
  { id: "f006", label: "Balance",        dataField: "R0001F0006", defaultCaption: "Balance",      category: "Account",     groupable: false },
  // ── TRANSACTION ──────────────────────────────────
  { id: "f007", label: "Voucher No",     dataField: "R0001F0007", defaultCaption: "Vou No.",      category: "Transaction", groupable: false },
  { id: "f008", label: "Voucher Type",   dataField: "R0001F0008", defaultCaption: "Type",         category: "Transaction", groupable: true },
  { id: "f009", label: "Date",           dataField: "R0001F0009", defaultCaption: "Date",         category: "Transaction", groupable: false },
  { id: "f010", label: "Narration",      dataField: "R0001F0010", defaultCaption: "Narration",    category: "Transaction", groupable: false },
  { id: "f011", label: "Debit Amount",   dataField: "R0001F0011", defaultCaption: "Debit",        category: "Transaction", groupable: false },
  { id: "f012", label: "Credit Amount",  dataField: "R0001F0012", defaultCaption: "Credit",       category: "Transaction", groupable: false },
  // ── GST ──────────────────────────────────────────
  { id: "f013", label: "GST Ass. Amount",dataField: "R0001F0013", defaultCaption: "GST Ass. Amt", category: "GST",         groupable: false },
  { id: "f014", label: "SGST",           dataField: "R0001F0014", defaultCaption: "SGST",         category: "GST",         groupable: false },
  { id: "f015", label: "CGST",           dataField: "R0001F0015", defaultCaption: "CGST",         category: "GST",         groupable: false },
  { id: "f016", label: "IGST",           dataField: "R0001F0016", defaultCaption: "IGST",         category: "GST",         groupable: false },
  { id: "f017", label: "CESS",           dataField: "R0001F0017", defaultCaption: "CESS",         category: "GST",         groupable: false },
  { id: "f018", label: "Total Expense",  dataField: "R0001F0018", defaultCaption: "Total Exp.",   category: "GST",         groupable: false },
  // ── STOCK ─────────────────────────────────────────
  { id: "f019", label: "Product Name",   dataField: "R0001F0019", defaultCaption: "Product",      category: "Stock",       groupable: true },
  { id: "f020", label: "Product Group",  dataField: "R0001F0020", defaultCaption: "Group",        category: "Stock",       groupable: true },
  { id: "f021", label: "Quantity",       dataField: "R0001F0021", defaultCaption: "Qty",          category: "Stock",       groupable: false },
  { id: "f022", label: "Rate",           dataField: "R0001F0022", defaultCaption: "Rate",         category: "Stock",       groupable: false },
  { id: "f023", label: "Prod. Amount",   dataField: "R0001F0023", defaultCaption: "Prod. Amount", category: "Stock",       groupable: false },
  { id: "f024", label: "UOM",            dataField: "R0001F0024", defaultCaption: "UOM",          category: "Stock",       groupable: false },
  // ── ORDER ─────────────────────────────────────────
  { id: "f025", label: "Order No",       dataField: "R0001F0025", defaultCaption: "Order No",     category: "Order",       groupable: false },
  { id: "f026", label: "Order Date",     dataField: "R0001F0026", defaultCaption: "Order Date",   category: "Order",       groupable: false },
  { id: "f027", label: "Order Qty",      dataField: "R0001F0027", defaultCaption: "Order Qty",    category: "Order",       groupable: false },
  { id: "f028", label: "Delivered Qty",  dataField: "R0001F0028", defaultCaption: "Delivered Qty",category: "Order",       groupable: false },
  { id: "f029", label: "Pending Qty",    dataField: "R0001F0029", defaultCaption: "Pending Qty",  category: "Order",       groupable: false },
  // ── OUTSTANDING ───────────────────────────────────
  { id: "f030", label: "Due Days",       dataField: "R0001F0030", defaultCaption: "D. Days",      category: "Outstanding", groupable: false },
  { id: "f031", label: "Bill Amount",    dataField: "R0001F0031", defaultCaption: "Bill Amount",  category: "Outstanding", groupable: false },
  { id: "f032", label: "Pending Amount", dataField: "R0001F0032", defaultCaption: "Pen. Amount",  category: "Outstanding", groupable: false },
];

/**
 * SAMPLE DATA for live preview (single record)
 * These are dummy values shown in the mobile preview panel
 */
const SAMPLE_DATA = {
  "R0001F0001": "ABC Private Ltd.",
  "R0001F0002": "Ahmedabad",
  "R0001F0003": "A/1",
  "R0001F0004": "Sundry Debtors",
  "R0001F0005": 2848.36,
  "R0001F0006": 88374.49,
  "R0001F0007": "GT/10",
  "R0001F0008": "Sale",
  "R0001F0009": "01/04/2026",
  "R0001F0010": "Being goods sold",
  "R0001F0011": 5000.00,
  "R0001F0012": 0.00,
  "R0001F0013": 137037.18,
  "R0001F0014": "34.43",
  "R0001F0015": "34.43",
  "R0001F0016": "0.00",
  "R0001F0017": "0.00",
  "R0001F0018": "-84.00",
  "R0001F0019": "EQ Prd 5%",
  "R0001F0020": "G1",
  "R0001F0021": "100.00",
  "R0001F0022": "50.00",
  "R0001F0023": "5000.00",
  "R0001F0024": "KG",
  "R0001F0025": "SO/1005",
  "R0001F0026": "05/05/2024",
  "R0001F0027": "100.00",
  "R0001F0028": "10.00",
  "R0001F0029": "90.00",
  "R0001F0030": "1",
  "R0001F0031": "4725.00",
  "R0001F0032": "1575.30",
};

/**
 * MOCK GROUPED DATA — simulates backend grouped records for drill-down preview.
 * Keyed by dataField. Each provides distinct values to group by, and multiple
 * detail records for terminal-level rendering.
 */
const MOCK_GROUPED_DATA = {
  // City grouping
  "R0001F0002": {
    distinctValues: ["Ahmedabad", "Rajkot", "Surat", "Mumbai"],
    records: [
      { "R0001F0001": "ABC Private Ltd.",   "R0001F0002": "Ahmedabad", "R0001F0003": "A/1",   "R0001F0004": "Sundry Debtors",   "R0001F0005": 2848.36,   "R0001F0006": 88374.49,  "R0001F0007": "GT/10",  "R0001F0008": "Sale",     "R0001F0009": "01/04/2026", "R0001F0010": "Being goods sold",    "R0001F0011": 5000, "R0001F0012": 0 },
      { "R0001F0001": "XYZ Traders",        "R0001F0002": "Ahmedabad", "R0001F0003": "A/2",   "R0001F0004": "Sundry Debtors",   "R0001F0005": 1500.00,   "R0001F0006": 42000.00,  "R0001F0007": "GT/11",  "R0001F0008": "Sale",     "R0001F0009": "02/04/2026", "R0001F0010": "Goods sold on credit","R0001F0011": 3000, "R0001F0012": 0 },
      { "R0001F0001": "Rajkot Steel Works", "R0001F0002": "Rajkot",    "R0001F0003": "R/1",   "R0001F0004": "Sundry Creditors", "R0001F0005": -5200.00,  "R0001F0006": -15400.00, "R0001F0007": "GT/12",  "R0001F0008": "Purchase", "R0001F0009": "03/04/2026", "R0001F0010": "Steel purchased",     "R0001F0011": 0,    "R0001F0012": 5200 },
      { "R0001F0001": "Surat Silk House",   "R0001F0002": "Surat",     "R0001F0003": "S/1",   "R0001F0004": "Sundry Debtors",   "R0001F0005": 8900.00,   "R0001F0006": 120000.00, "R0001F0007": "GT/13",  "R0001F0008": "Sale",     "R0001F0009": "04/04/2026", "R0001F0010": "Silk fabric sold",    "R0001F0011": 8900, "R0001F0012": 0 },
      { "R0001F0001": "Mumbai Imports",     "R0001F0002": "Mumbai",    "R0001F0003": "M/1",   "R0001F0004": "Sundry Creditors", "R0001F0005": -3200.00,  "R0001F0006": -9800.00,  "R0001F0007": "GT/14",  "R0001F0008": "Purchase", "R0001F0009": "05/04/2026", "R0001F0010": "Imported goods",      "R0001F0011": 0,    "R0001F0012": 3200 },
      { "R0001F0001": "Patel & Sons",       "R0001F0002": "Rajkot",    "R0001F0003": "R/2",   "R0001F0004": "Sundry Debtors",   "R0001F0005": 4500.00,   "R0001F0006": 67500.00,  "R0001F0007": "GT/15",  "R0001F0008": "Sale",     "R0001F0009": "06/04/2026", "R0001F0010": "Regular sale",        "R0001F0011": 4500, "R0001F0012": 0 },
    ]
  },
  // Account Group grouping
  "R0001F0004": {
    distinctValues: ["Sundry Debtors", "Sundry Creditors", "Cash-in-Hand", "Bank Accounts"],
    records: null  // shares records with City
  },
  // Party Name grouping
  "R0001F0001": {
    distinctValues: ["ABC Private Ltd.", "XYZ Traders", "Rajkot Steel Works", "Surat Silk House", "Mumbai Imports", "Patel & Sons"],
    records: null
  },
  // Voucher Type grouping
  "R0001F0008": {
    distinctValues: ["Sale", "Purchase", "Receipt", "Payment"],
    records: null
  },
  // Product Group grouping
  "R0001F0020": {
    distinctValues: ["G1", "G2", "G3"],
    records: null
  },
  // Product Name grouping
  "R0001F0019": {
    distinctValues: ["EQ Prd 5%", "GST Prd 12%", "Zero Rated Item"],
    records: null
  },
};

// All mock grouped entries share the same base record set (City's)
(function linkMockRecords() {
  const baseRecords = MOCK_GROUPED_DATA["R0001F0002"].records;
  Object.keys(MOCK_GROUPED_DATA).forEach(k => {
    if (!MOCK_GROUPED_DATA[k].records) {
      MOCK_GROUPED_DATA[k].records = baseRecords;
    }
  });
})();

/**
 * Get mock records for a given drill path.
 * Filters base records by each level's selected group value.
 */
function getMockRecordsForDrill(drillPath) {
  let records = MOCK_GROUPED_DATA["R0001F0002"].records; // base set
  drillPath.forEach(step => {
    records = records.filter(r => r[step.dataField] === step.groupValue);
  });
  return records;
}

/**
 * Get distinct values for a group field, optionally filtered by parent drill path.
 */
function getMockDistinctValues(dataField, drillPath) {
  let records = getMockRecordsForDrill(drillPath);
  const vals = [...new Set(records.map(r => r[dataField]).filter(v => v !== undefined))];
  // If no records match (could happen in deeper drills), fall back to static list
  if (vals.length === 0 && MOCK_GROUPED_DATA[dataField]) {
    return MOCK_GROUPED_DATA[dataField].distinctValues;
  }
  return vals;
}

/**
 * ICON MAP — iconCaption → emoji/symbol for preview rendering
 */
const ICON_MAP = {
  location : "📍",
  amount   : "₹",
  date     : "📅",
  phone    : "📞",
  email    : "✉",
  person   : "👤",
  invoice  : "🧾",
  stock    : "📦",
};
