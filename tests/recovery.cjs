const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},els={};
const el=id=>els[id]??={style:{},classList:{add:noop,remove:noop,toggle:noop},textContent:'',innerHTML:'',open:false,setAttribute:noop,addEventListener:noop,getBoundingClientRect:()=>({width:390,height:240}),getContext:()=>new Proxy({},{get:()=>noop}),showModal(){this.open=true},close(){this.open=false}};
const sandbox={document:{getElementById:el,querySelectorAll:()=>[]},window:{matchMedia:()=>({matches:false})},Image:class{},ResizeObserver:class{observe(){}},requestAnimationFrame:noop,navigator:{clipboard:{writeText:async()=>{}}}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../game.js'),'utf8'),sandbox);
const run=s=>vm.runInContext(s,sandbox);run('ready=true');
function until(mode){for(let i=0;i<2000;i++){if(run('state.mode')===mode)return;run('update(.04)');}throw Error('Did not reach '+mode);}
for(let mask=0;mask<32;mask++){
 run('reset()');let count=0;
 for(let i=0;i<5;i++){
  until('question');const option=(mask>>i)&1;count+=option;run(`answer(${option})`);
  assert.equal(run('state.hp'),0,'No HP change while answering');assert.equal(els.hp.textContent,'—');assert.throws(()=>run('answer(0)'));
  if(i===1&&option===0){const before=run('state.minutes');run('update(1)');assert.ok(run('state.minutes')>before,'Phone advances clock');}
  if(i===2&&option===1){run('update(1)');assert.ok(run('state.dim')>.5,'Lights visibly dim');}
  if(i===4&&option===0){run('update(1.2)');assert.equal(run('state.playerX'),272,'Walk to couch');assert.equal(run('state.tvOn'),true);}
 }
 until('recover');assert.equal(run('state.answers.length'),5);
 until('result');assert.equal(run('state.hp'),count*20);
 const html=els['dialog-content'].innerHTML;
 assert.equal((html.match(/<h3>/g)||[]).length,5-count,'Every and only flagged advice shown');
 assert.equal(html.includes('よい睡眠習慣を選べましたね。'),count===5);
 for(let i=0;i<5;i++)assert.equal(html.includes('<h3>'+run(`questions[${i}].tipTitle`)+'</h3>'),!((mask>>i)&1));
}
run('reset()');until('question');assert.throws(()=>run('answer(2)'));run("state.paused=true");assert.throws(()=>run('answer(1)'));run('reset()');assert.equal(run('state.answers.length'),0);assert.equal(run('state.dim'),0);
console.log('32 answer combinations passed: recovery scoring, full advice mapping, perfect praise, no midgame score, clock, couch, dimming, reset and invalid/duplicate guards.');
