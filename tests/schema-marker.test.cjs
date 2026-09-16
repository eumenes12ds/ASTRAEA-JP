const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { test } = require('node:test');
const _ = require('lodash');
const z = require('zod');
const root = path.resolve(__dirname, '..');
const canonical = '使用しないので気にしないでください';
const legacy = '没有用别管这个';
const source = fs.readFileSync(path.join(root, 'static/mvu_beta/index.js'), 'utf8');
const vendor = fs.readFileSync(path.join(root, 'static/vendor/mvu-zod-stagedog-4b3ce613.esm.js'), 'utf8');

function reader() {
  const start = source.indexOf('function de(e,t,n=!1)');
  const end = source.indexOf('function he(', start);
  assert(start >= 0 && end > start);
  const errors = [];
  const sandbox = vm.createContext({ _, e: structuredClone, console: { log() {}, error(x) { errors.push(x); } } });
  vm.runInContext("const ue='$__META_EXTENSIBLE__$';function ae(e){return'array'===e.type}function re(e){return'object'===e.type}" + source.slice(start, end), sandbox);
  return { infer: sandbox.de, reconcile: sandbox.me, errors };
}

function writer() {
  const handlers = {};
  const sandbox = vm.createContext({ _, z, console: { info() {} }, registerVariableSchema() {}, eventOn(name, fn) { handlers[name] = fn; } });
  const code = vendor.replace(/import\b[^;]+;/g, '').replace(/export\{s as registerMvuSchema\};/, 'globalThis.registerMvuSchema=s;');
  vm.runInContext(code, sandbox);
  sandbox.registerMvuSchema(z.object({}));
  return handlers.mag_variable_update_ended_for_zod;
}

for (const marker of [canonical, legacy]) {
  test(`reader accepts ${marker === canonical ? 'Japanese' : 'historical Chinese'} marker`, () => {
    const r = reader();
    assert.equal(r.infer({ 世界: { 時間: '18:45' } }, marker).type, 'any');
    assert.equal(r.infer([{ コスト: '攻撃: 30SP' }], marker).type, 'any');
    assert.deepEqual(r.errors, []);
  });
  test(`writer emits Japanese after ${marker === canonical ? 'Japanese' : 'historical Chinese'} input`, () => {
    const value = { stat_data: { 世界: { 時間: '18:45' } }, schema: marker, display_data: {}, delta_data: {} };
    const before = structuredClone(value.stat_data);
    writer()(value);
    assert.equal(value.schema, canonical);
    assert.deepEqual(value.stat_data, before);
    assert(!Object.hasOwn(value, 'display_data') && !Object.hasOwn(value, 'delta_data'));
  });
}

test('reconciliation normalizes the old marker without changing game data', () => {
  const r = reader(), value = { stat_data: { 世界: { 時間: '18:45', 場所: '詰所' } }, schema: legacy };
  const before = structuredClone(value.stat_data);
  r.reconcile(value);
  assert.equal(value.schema, canonical);
  assert.deepEqual(value.stat_data, before);
  assert.deepEqual(r.errors, []);
});

test('ordinary object schemas retain strict configuration and field inference', () => {
  const r = reader(), value = { stat_data: { HP: 12, labels: ['休憩'] }, schema: { type: 'object', properties: {}, strictSet: true } };
  r.reconcile(value);
  assert.equal(value.schema.type, 'object');
  assert.equal(value.schema.strictSet, true);
  assert.equal(value.schema.properties.HP.type, 'number');
  assert.equal(value.schema.properties.labels.elementType.type, 'string');
  assert.deepEqual(r.errors, []);
});

test('genuine schema mismatch remains visible', () => {
  const r = reader();
  r.infer({ HP: 12 }, { type: 'number' });
  assert.equal(r.errors.length, 1);
  assert.match(r.errors[0], /expected object schema but got number/);
});

test('new state is written with the canonical marker', () => {
  const value = { stat_data: {} };
  writer()(value);
  assert.equal(value.schema, canonical);
  const r = reader();
  r.reconcile(value);
  assert.equal(value.schema, canonical);
  assert.deepEqual(r.errors, []);
});

test('historical state and actual model JSONPatch replay', { skip: !process.env.MVU_TEST_CHAT_FILE }, () => {
  const rows = fs.readFileSync(process.env.MVU_TEST_CHAT_FILE, 'utf8').trim().split(/\r?\n/).map(JSON.parse);
  const last = rows.findLast(x => x.extra?.kiosk_token_usage?.generationId === '870ab616-79cf-4af4-a962-8fd2cd96eafe');
  assert(last);
  const i = rows.indexOf(last), value = structuredClone(rows[i - 1].variables[0]);
  const saved = last.variables[last.swipe_id || 0];
  const patches = JSON.parse(last.mes.match(/<JSONPatch>\s*([\s\S]*?)\s*<\/JSONPatch>/)[1]);
  const r = reader();
  r.reconcile(value);
  assert.equal(value.schema, canonical);
  for (const patch of patches) {
    assert.equal(patch.op, 'replace');
    const keys = patch.path.split('/').slice(1).map(k => k.replace(/~1/g, '/').replace(/~0/g, '~'));
    _.set(value.stat_data, keys, patch.value);
    assert.deepEqual(_.get(value.stat_data, keys), _.get(saved.stat_data, keys));
  }
  r.reconcile(value);
  writer()(value);
  assert.equal(value.schema, canonical);
  assert.deepEqual(r.errors, []);
});
