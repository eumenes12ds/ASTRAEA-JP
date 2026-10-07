import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

// The deployed v1.5.12 module has no maintained unbundled source. Apply only
// audited anchors to those exact bytes; never regenerate its embedded rules.
const input = process.argv[2];
const output = process.argv[3];
assert(input && output, 'Usage: node scripts/patch-astraea-auto-regex-noop.mjs INPUT OUTPUT');
const before = fs.readFileSync(input);
assert.equal(crypto.createHash('sha256').update(before).digest('hex'),
    'e63f9dc3cb2c9d5708354ed62d0490cb5db03f1686934a7675bf56004eb29db7', 'Expected deployed v1.5.12 source');
let source = before.toString('utf8');
const edits = [
    ['await updateTavernRegexesWith(e=>(e.forEach(e=>n.add(e.script_name)),e))',
        'getTavernRegexes().forEach(e=>n.add(e.script_name))'],
    ['let s=!1,i=null,a=null,c=null,r=null;',
        'let s=!1,i=SillyTavern.getContext().chatId??null,a=null,c=null,r=null;'],
];
for (const [old, replacement] of edits) {
    assert.equal(source.split(old).length, 2, 'Expected one audited anchor');
    source = source.replace(old, replacement);
}
const writes = (source.match(/updateTavernRegexesWith\(/g) || []).length;
assert.equal(writes, 3, 'Expected cleanup, registration and removal writes');
source = source.replaceAll('updateTavernRegexesWith(', 'fateUpdateRegexesIfChanged(');
const helper = `// v1.5.12 maintenance: preserve refreshes for real changes only.
async function fateUpdateRegexesIfChanged(updater) {
  const current = getTavernRegexes();
  const next = await updater(_.cloneDeep(current));
  if (!_.isEqual(current, next)) {
    await replaceTavernRegexes(next);
  }
  return next;
}
`;
// Reverse every edit to prove the remaining rules, names and matching logic
// are byte-for-byte the deployed version.
let reversed = source.replaceAll('fateUpdateRegexesIfChanged(', 'updateTavernRegexesWith(');
for (const [old, replacement] of edits) reversed = reversed.replace(replacement, old);
assert.equal(reversed, before.toString('utf8'));
fs.writeFileSync(output, helper + source, 'utf8');
console.log(JSON.stringify({inputSha256:crypto.createHash('sha256').update(before).digest('hex'),
    outputSha256:crypto.createHash('sha256').update(helper+source).digest('hex'),
    beforeBytes:before.length,afterBytes:Buffer.byteLength(helper+source),guardedWriteSites:writes,
    readOnlyEnumeration:true,currentChatInitialized:true,unrelatedBytesPreserved:true}));
