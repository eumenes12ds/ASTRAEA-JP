const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {test}=require('node:test'),{createRequire}=require('node:module');
const root=process.env.ASTRAEA_SOURCE_ROOT||path.resolve(__dirname,'..');
const req=createRequire(root+'/package.json'),ts=req('typescript'),vue=req('vue'),pinia=req('pinia'),_=req('lodash');
function moduleFrom(file,imports={},globals={}) {
  const output=ts.transpileModule(fs.readFileSync(root+'/'+file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports={};vm.runInNewContext(output,{exports,require:n=>imports[n]||req(n),_,console,toastr:{success(){},info(){},warning(){},error(){}},...globals},{filename:file});return exports;
}
function character() {
  pinia.setActivePinia(pinia.createPinia());
  return moduleFrom('src/custom_start/core/store/character.ts',{'../data/base-info':{
    ATTRIBUTES:['筋力','敏捷','耐久','知力','精神'],INITIAL_REINCARNATION_POINTS:1000,MAX_BASE_POINTS_PER_ATTR:6,MAX_BASE_POINTS_TOTAL:25,
    getIdentityCosts:vue.computed(()=>({'平民':0})),getRaceCosts:vue.computed(()=>({'人間':0})),calculateAPByLevel:n=>n-1,getTierAttributeBonus:()=>0,
  },'../data/skills':{getSkills:()=>({})}}).useCharacterStore();
}
test('initial budget, direct update and reset remain 1000; spending still works',()=>{
 const s=character();assert.equal(s.character.reincarnationPoints,1000);assert.equal(s.rollInitialPoints,undefined);
 for(const n of [888888,9999,0,-100,'10000',null]){s.updateCharacterField('reincarnationPoints',n);assert.equal(s.character.reincarnationPoints,1000);}
 s.updateCharacterField('name','[dev] [test]');assert.equal(s.character.reincarnationPoints,1000);
 s.updateCharacterField('money',10000);assert.equal(s.consumedPoints,100);assert.equal(s.character.reincarnationPoints-s.consumedPoints,900);
 s.resetCharacter();assert.equal(s.character.reincarnationPoints,1000);assert.equal(s.consumedPoints,0);
});
test('real preset importer normalizes old rolled budgets without dropping selected purchases',()=>{
 const s=character(),{applyPresetToStore}=moduleFrom('src/custom_start/core/utils/preset-manager.ts');
 for(const points of [888888,10000,500]){const p={name:'legacy',character:{...JSON.parse(JSON.stringify(s.character)),reincarnationPoints:points,money:12000,name:'旧設定'},equipments:[{name:'fixture',cost:25}],items:[],skills:[],partners:[],assets:[],background:null};
 applyPresetToStore(p,s);assert.equal(s.character.reincarnationPoints,1000);assert.equal(s.character.name,'旧設定');assert.equal(s.consumedPoints,145);assert.equal(p.character.reincarnationPoints,points);}
});
test('saved true cannot restore editing, setter cannot enable it, explicit saves write false',async()=>{
 const saved=[];const m=moduleFrom('src/status/core/stores/editor-setting.store.ts',{}, {getVariables:()=>({status_edit_enabled:true}),insertOrAssignVariables:async(v)=>saved.push(v)});
 const s=m.useEditorSettingStore;s.getState().loadSettings();assert.equal(s.getState().editEnabled,false);s.getState().setEditEnabled(true);assert.equal(s.getState().editEnabled,false);await s.getState().saveSettings();assert.equal(saved.length,1);assert.equal(saved[0].status_edit_enabled,false);
});
