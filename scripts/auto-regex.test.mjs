import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';

const require = createRequire(new URL('../package.json', import.meta.url));
const lodash = require('lodash');
const source = fs.readFileSync(new URL('../static/auto_regex/index.js', import.meta.url), 'utf8');

function fixture(initial = [], variables = {}) {
    let rules = structuredClone(initial);
    const writes = [], events = new Map(), timers = [], boot = [], errors = [];
    const context = vm.createContext({
        _: lodash, console: {info(){},log(){},warn(){},error(...args){errors.push(String(args[0]));}},
        getTavernRegexes: () => structuredClone(rules),
        replaceTavernRegexes: async next => { rules = structuredClone(next); writes.push(structuredClone(next)); },
        getVariables: () => structuredClone(variables),
        insertOrAssignVariables: changes => Object.assign(variables, changes),
        replaceVariables: changes => { variables = structuredClone(changes); },
        getChatMessages: () => [{message: 'Ordinary text with no adaptive decoration.'}],
        SillyTavern: {getContext: () => ({chatId: 'saved-chat'})},
        tavern_events: {CHAT_CHANGED: 'chat_changed', MESSAGE_RECEIVED: 'message_received'},
        eventOn: (name, callback) => events.set(name, callback),
        setTimeout: callback => { timers.push(callback); return timers.length; },
        clearTimeout: () => {},
        // Decode the module's existing embedded catalog without using a network.
        fetch: async url => {
            assert.match(String(url), /^data:application\/json;base64,/);
            return {ok:true,json:async()=>JSON.parse(Buffer.from(String(url).split(',')[1],'base64').toString())};
        },
        toastr: {error: message => errors.push(message)},
    });
    context.window = context;
    context.$ = value => {
        if (typeof value === 'function') { boot.push(value); return; }
        return {on(name,callback){events.set(name,callback);}};
    };
    vm.runInContext(source,context,{timeout:5000});
    return {context,writes,events,timers,errors,boot:async()=>{for(const fn of boot)await fn();},rules:()=>rules};
}

const base = [{id:'stable',script_name:'Stable',enabled:true,scope:'character',source:{ai_output:true,user_input:false}}];

test('unchanged rules, including reordered object fields, do not write or refresh', async () => {
    const f=fixture(base);
    await f.context.fateUpdateRegexesIfChanged(rules=>rules);
    await f.context.fateUpdateRegexesIfChanged(rules=>rules.map(r=>({scope:r.scope,source:{user_input:false,ai_output:true},enabled:r.enabled,script_name:r.script_name,id:r.id})));
    assert.equal(f.writes.length,0);
    assert.deepEqual(f.rules(),base);
});

test('real enable, add and remove changes each reach the original write API', async () => {
    const f=fixture(base);
    await f.context.fateUpdateRegexesIfChanged(rules=>{rules[0].enabled=false;return rules;});
    assert.equal(f.writes.length,1);assert.equal(f.rules()[0].enabled,false);
    await f.context.fateUpdateRegexesIfChanged(rules=>[...rules,{id:'added',script_name:'Added',scope:'global',enabled:true}]);
    assert.equal(f.writes.length,2);assert.equal(f.rules().length,2);
    await f.context.fateUpdateRegexesIfChanged(rules=>rules.filter(r=>r.id!=='added'));
    assert.equal(f.writes.length,3);assert.equal(f.rules().length,1);
    assert.equal(base[0].enabled,true,'updater must not mutate its input snapshot');
});

test('failed updater preserves rules and rejects without issuing a write', async () => {
    const f=fixture(base);
    await assert.rejects(f.context.fateUpdateRegexesIfChanged(async rules=>{rules.length=0;throw Error('fixture failure');}),/fixture failure/);
    assert.equal(f.writes.length,0);assert.deepEqual(f.rules(),base);
});

test('full initialization and unchanged chat notification do not write; true chat switch still synchronizes', async () => {
    const resident={id:'1f619452-dea9-4361-afdc-852faf5ec6e2',script_name:'Resident',enabled:true,scope:'character'};
    const f=fixture([resident]);await f.boot();assert.deepEqual(f.errors,[]);assert.equal(f.writes.length,0);
    await f.events.get('chat_changed')('saved-chat');assert.equal(f.timers.length,0);
    await f.events.get('chat_changed')('another-chat');assert.equal(f.timers.length,1);
    await f.timers[0]();assert.equal(f.writes.length,0);assert.deepEqual(f.rules(),[resident]);assert.deepEqual(f.errors,[]);
});

test('initial cleanup still removes retired rules and preserves resident rules', async () => {
    const resident={id:'1f619452-dea9-4361-afdc-852faf5ec6e2',script_name:'Resident',enabled:true,scope:'character'};
    const retired={id:'3d8f13e3-698a-43ce-a453-645ed40f0a5f',script_name:'Retired',enabled:true,scope:'character'};
    const f=fixture([resident,retired]);await f.boot();assert.deepEqual(f.errors,[]);
    assert.equal(f.writes.length,1);assert.deepEqual(f.rules(),[resident]);
});
