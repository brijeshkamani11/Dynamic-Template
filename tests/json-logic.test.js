const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadScripts() {
  const context = {
    console,
    setTimeout,
    clearTimeout,
    Math,
    Date,
    JSON,
    // Runtime stubs used by imported functions
    showToast: () => {},
    renderAll: () => {},
    renderPalette: () => {},
    syncUIFromState: () => {},
    computeTapValues: () => {},
    confirm: () => true,
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    document: {
      getElementById: () => ({
        style: {},
        textContent: '',
        value: '',
        checked: false,
        addEventListener: () => {},
        querySelector: () => null,
      }),
      querySelector: () => null,
      querySelectorAll: () => [],
      createElement: () => ({
        className: '',
        textContent: '',
        appendChild: () => {},
        addEventListener: () => {},
        style: {},
      }),
    },
    window: {},
    FIELD_REGISTRY: [
      { id: 'f001', dataField: 'R0001F0001', defaultCaption: 'Party Name' },
    ],
  };
  vm.createContext(context);

  const files = [
    path.join(__dirname, '..', 'report-designer/js/state.js'),
    path.join(__dirname, '..', 'report-designer/js/modules/json-modal.js'),
  ];

  for (const f of files) {
    vm.runInContext(fs.readFileSync(f, 'utf8'), context, { filename: f });
  }

  return context;
}

function readGlobal(ctx, expr) {
  return vm.runInContext(expr, ctx);
}

test('validateImportJSON rejects full JSON columns without dataField', () => {
  const ctx = loadScripts();

  const payload = {
    layoutType: 'grid',
    fieldConfigs: [
      {
        columnConfig: [
          { col: 1, caption: 'Only display, no field', display: { layout: 'inline' } },
        ],
      },
    ],
  };

  const result = ctx.validateImportJSON(payload);
  assert.equal(result.valid, false);
  assert.match(result.error, /missing a dataField/i);
});

test('hydrateFromLayoutJSON sets layout mode and placeholder cell', () => {
  const ctx = loadScripts();

  const payload = {
    layoutType: 'grid',
    mode: 'layout',
    fieldConfigs: [
      {
        isExpandedRow: false,
        columnCount: 1,
        columnConfig: [
          {
            col: 1,
            placeholderId: 'ph_1',
            placeholderLabel: 'Party placeholder',
            caption: 'Party',
          },
        ],
      },
    ],
  };

  const ok = ctx.hydrateFromLayoutJSON(payload);
  assert.equal(ok, true);
  const state = readGlobal(ctx, 'state');
  assert.equal(state.designerMode, 'layout');
  assert.equal(state.rows.length, 1);
  assert.equal(state.rows[0].cols[0].placeholderId, 'ph_1');
  assert.equal(state.rows[0].cols[0].dataField, undefined);
});

test('buildCellDisplayConfig merges base, defaults, and overrides', () => {
  const ctx = loadScripts();
  const display = ctx.buildCellDisplayConfig('metric', { valueFontSize: 18 });

  assert.equal(display.layout, 'stacked');
  assert.equal(display.captionPosition, 'below');
  assert.equal(display.valueFontSize, 18);
  assert.equal(display.captionFontSize, 9);
});
