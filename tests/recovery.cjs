const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const noop=()=>{},els={};
const el=id=>els[id]??={style:{},dataset:{},classList:{add:noop,remove:noop,toggle:noop},textContent:'',innerHTML:'',open:false,setAttribute:noop,addEventListener:noop,getBoundingClientRect:()=>({width:390,height:240}),getContext:()=>new Proxy({},{get:()=>noop}),showModal(){this.open=true},close(){this.open=false}};
const audioEvents=[];
const sandbox={Sound:{reset:()=>audioEvents.length=0,label:noop,toggle:noop,tick:noop,answer:correct=>audioEvents.push(['answer',correct]),playVoice:name=>audioEvents.push(['voice',name]),hush:()=>audioEvents.push(['hush']),stopVoice:noop,enabled:true},document:{getElementById:el,querySelectorAll:()=>[]},window:{matchMedia:()=>({matches:false})},Image:class{},ResizeObserver:class{observe(){}},requestAnimationFrame:noop,navigator:{clipboard:{writeText:async()=>{}}}};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../game.js'),'utf8'),sandbox);
const run=s=>vm.runInContext(s,sandbox);run('ready=true');
function tick(){run('update(.04)');assert.equal(run('state.hp'),run('state.answers.reduce((n,a)=>n+a.points,0)'),'Animation must never add points');assert.ok(run('state.playerX>=40&&state.playerX<=610'),'Character stays inside room');assert.ok(run('state.playerX-state.camera>25&&state.playerX-state.camera<335'),'Character stays away from screen edges');assert.ok(run('state.camera>=0&&state.camera<=360'));}
function until(mode){for(let i=0;i<2000;i++){if(run('state.mode')===mode)return;tick();}throw Error('Did not reach '+mode);}
assert.deepEqual(Array.from(run('questions.map(q=>q.id)')),['coffee','tv','phone','light','temperature']);
assert.ok(run('questions.every((q,i)=>i===0||q.x>questions[i-1].x)'),'Questions follow a left-to-right route');
for(let mask=0;mask<32;mask++){
 run('reset()');let count=0;
 for(let i=0;i<5;i++){
  until('question');const option=(mask>>i)&1;count+=option;run(`answer(${option})`);
  assert.equal(run('state.hp'),count*20,'Only correct choices contribute HP');assert.equal(els.hp.textContent,count*20);assert.throws(()=>run('answer(0)'));
  assert.equal(els.effect.textContent,option?'+20 HP':'回復なし');assert.equal(audioEvents.filter(e=>e[0]==='answer').at(-1)[1],Boolean(option));
  if(run('state.activeAction.id')==='phone'&&option===0){const before=run('state.minutes');for(let j=0;j<30;j++)tick();assert.ok(run('state.minutes')>before,'Phone advances clock');}
  if(run('state.activeAction.id')==='light'&&option===1){for(let j=0;j<30;j++)tick();assert.ok(run('state.dim')>.5,'Lights visibly dim');}
  if(run('state.activeAction.id')==='tv'&&option===0){for(let j=0;j<30;j++)tick();assert.equal(run('state.playerY'),326,'Sit on couch');assert.equal(run('state.tvOn'),true);}
 }
 until('recover');assert.equal(run('state.answers.length'),5);
 until('result');assert.equal(run('state.hp'),count*20);
 assert.deepEqual(audioEvents.filter(e=>e[0]==='voice').map(e=>e[1]),[`hp${count*20}`,'goodnight'],'Only one score voice and one ending voice');
 assert.equal(audioEvents.filter(e=>e[0]==='answer').length,5);
 const html=els['dialog-content'].innerHTML;
 assert.equal((html.match(/<h3>/g)||[]).length,5-count,'Every and only flagged advice shown');
 assert.equal(html.includes('よい睡眠習慣を選べましたね。'),count===5);
 assert.ok(!html.includes('あなたの回答：'),'Advice never repeats answers');
 for(let i=0;i<5;i++)assert.equal(html.includes('<h3>'+run(`questions[${i}].tipTitle`)+'</h3>'),!((mask>>i)&1));
}
run('reset()');until('question');assert.throws(()=>run('answer(2)'));run('state.paused=true');assert.throws(()=>run('answer(1)'));const x=run('state.playerX');run('update(3)');assert.equal(run('state.playerX'),x);run('reset()');assert.equal(run('state.answers.length'),0);assert.equal(run('state.hp'),0);assert.equal(run('state.dim'),0);assert.equal(els.outro.hidden,true);
console.log('32 combinations passed. Wrong choices add 0; correct choices add 20 once. Every animation preserves score. All routes stay in bounds and finish. Advice, score voice, ending voice, duplicate guards and reset passed.');
