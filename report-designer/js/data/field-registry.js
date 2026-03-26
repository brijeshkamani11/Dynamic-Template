/**
 * AVAILABLE FIELDS REGISTRY
 * ─────────────────────────
 * Each field has:
 *   id        : unique ID used internally in the designer
 *   label     : friendly name shown to user
 *   dataField : backend key (R####F####) — hidden from non-technical users
 *   defaultCaption : suggested caption when dropped
 *   category  : grouping for the field palette
 *
 * In production: this list will come from an API call
 * based on the selected Report ID.
 */

const FIELD_REGISTRY = [
  // ── ACCOUNT / PARTY ──────────────────────────────
  { id: "f001", label: "Party Name",     dataField: "R0001F0001", defaultCaption: "Party Name",  category: "Account" },
  { id: "f002", label: "City",           dataField: "R0001F0002", defaultCaption: "City",         category: "Account" },
  { id: "f003", label: "Bill No",        dataField: "R0001F0003", defaultCaption: "Bill No",      category: "Account" },
  { id: "f004", label: "Account Group",  dataField: "R0001F0004", defaultCaption: "Group",        category: "Account" },
  { id: "f005", label: "Amount",         dataField: "R0001F0005", defaultCaption: "Amount",       category: "Account" },
  { id: "f006", label: "Balance",        dataField: "R0001F0006", defaultCaption: "Balance",      category: "Account" },
  // ── TRANSACTION ──────────────────────────────────
  { id: "f007", label: "Voucher No",     dataField: "R0001F0007", defaultCaption: "Vou No.",      category: "Transaction" },
  { id: "f008", label: "Voucher Type",   dataField: "R0001F0008", defaultCaption: "Type",         category: "Transaction" },
  { id: "f009", label: "Date",           dataField: "R0001F0009", defaultCaption: "Date",         category: "Transaction" },
  { id: "f010", label: "Narration",      dataField: "R0001F0010", defaultCaption: "Narration",    category: "Transaction" },
  { id: "f011", label: "Debit Amount",   dataField: "R0001F0011", defaultCaption: "Debit",        category: "Transaction" },
  { id: "f012", label: "Credit Amount",  dataField: "R0001F0012", defaultCaption: "Credit",       category: "Transaction" },
  // ── GST ──────────────────────────────────────────
  { id: "f013", label: "GST Ass. Amount",dataField: "R0001F0013", defaultCaption: "GST Ass. Amt", category: "GST" },
  { id: "f014", label: "SGST",           dataField: "R0001F0014", defaultCaption: "SGST",         category: "GST" },
  { id: "f015", label: "CGST",           dataField: "R0001F0015", defaultCaption: "CGST",         category: "GST" },
  { id: "f016", label: "IGST",           dataField: "R0001F0016", defaultCaption: "IGST",         category: "GST" },
  { id: "f017", label: "CESS",           dataField: "R0001F0017", defaultCaption: "CESS",         category: "GST" },
  { id: "f018", label: "Total Expense",  dataField: "R0001F0018", defaultCaption: "Total Exp.",   category: "GST" },
  // ── STOCK ─────────────────────────────────────────
  { id: "f019", label: "Product Name",   dataField: "R0001F0019", defaultCaption: "Product",      category: "Stock" },
  { id: "f020", label: "Product Group",  dataField: "R0001F0020", defaultCaption: "Group",        category: "Stock" },
  { id: "f021", label: "Quantity",       dataField: "R0001F0021", defaultCaption: "Qty",          category: "Stock" },
  { id: "f022", label: "Rate",           dataField: "R0001F0022", defaultCaption: "Rate",         category: "Stock" },
  { id: "f023", label: "Prod. Amount",   dataField: "R0001F0023", defaultCaption: "Prod. Amount", category: "Stock" },
  { id: "f024", label: "UOM",            dataField: "R0001F0024", defaultCaption: "UOM",          category: "Stock" },
  // ── ORDER ─────────────────────────────────────────
  { id: "f025", label: "Order No",       dataField: "R0001F0025", defaultCaption: "Order No",     category: "Order" },
  { id: "f026", label: "Order Date",     dataField: "R0001F0026", defaultCaption: "Order Date",   category: "Order" },
  { id: "f027", label: "Order Qty",      dataField: "R0001F0027", defaultCaption: "Order Qty",    category: "Order" },
  { id: "f028", label: "Delivered Qty",  dataField: "R0001F0028", defaultCaption: "Delivered Qty",category: "Order" },
  { id: "f029", label: "Pending Qty",    dataField: "R0001F0029", defaultCaption: "Pending Qty",  category: "Order" },
  // ── OUTSTANDING ───────────────────────────────────
  { id: "f030", label: "Due Days",       dataField: "R0001F0030", defaultCaption: "D. Days",      category: "Outstanding" },
  { id: "f031", label: "Bill Amount",    dataField: "R0001F0031", defaultCaption: "Bill Amount",  category: "Outstanding" },
  { id: "f032", label: "Pending Amount", dataField: "R0001F0032", defaultCaption: "Pen. Amount",  category: "Outstanding" },
];

/**
 * SAMPLE DATA for live preview
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
