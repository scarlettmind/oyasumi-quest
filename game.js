'use strict';
const $=id=>document.getElementById(id),canvas=$('room'),ctx=canvas.getContext('2d');
const rooms=new Image(),hero=new Image(),actions=new Image();
rooms.src='room.png';hero.src='pink-hero.png';actions.src='hero-actions.png';
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const HOTEL='https://www.j-hotel.or.jp/hotel-review/feature/hr753-01/',NEUTRAL='https://www.neutralworks.jp/journal/20221118people/';
const questions=[
 {id:'coffee',x:130,label:'テーブルの飲み物',topic:'寝る前のカフェイン',title:'寝る前の一杯。いつものあなたは？',desc:'テーブルでひと休み。飲み物を選ぼう。',answers:[{label:'カフェイン入りのコーヒー',points:0,action:'カップを持ち上げて、ひと口。'},{label:'カフェインのない飲み物',points:20,action:'今夜はカフェインのない一杯に。'}],tipTitle:'寝る前のカフェインを見直そう。',tip:'就寝前は、カフェインの入っていない飲み物を選んでみましょう。',source:HOTEL},
 {id:'phone',x:535,label:'ベッドのそば',topic:'寝る前のSNS・ゲーム',title:'寝る時間になっても、SNSやゲームを続ける？',desc:'通知が届いた。いつもの自分なら？',answers:[{label:'つい続ける',points:0,action:'画面が光る。スクロールしているうちに、30分…。'},{label:'ここで終える',points:20,action:'画面を消して、スマホを置いた。'}],tipTitle:'寝る前のSNS・ゲームに区切りを。',tip:'終える時刻を決めて、眠る時間を残しましょう。',source:HOTEL},
 {id:'light',x:647,label:'部屋の明かり',topic:'寝る前の照明',title:'寝る前に過ごす部屋の明かりは？',desc:'寝室だけでなく、寝る前にいる部屋も。',answers:[{label:'昼間と同じくらい明るい',points:0,action:'明かりはそのまま。部屋はまだ明るい。'},{label:'明るさを落としている',points:20,action:'明るさを落とす。部屋が、やさしい夜の色に。'}],tipTitle:'寝る前から、明かりを控えめに。',tip:'寝室だけでなく、寝る前に過ごす部屋の照明も見直しましょう。',source:HOTEL},
 {id:'temperature',x:590,label:'寝室の温度',topic:'夜中の暑さ・寒さ',title:'夜中に暑さ・寒さが気になる部屋。どうしている？',desc:'今夜の空調や寝具は、どうしよう。',answers:[{label:'気になるけれど、そのまま',points:0,action:'室温はそのまま。少し落ち着かない…。'},{label:'朝まで快適になるよう調整する',points:20,action:'空調と寝具を調整。朝まで快適な部屋に。'}],tipTitle:'暑さ・寒さを我慢しない寝室に。',tip:'寝具と空調を調整して、自分にとって快適な室温を朝まで保ちましょう。',source:NEUTRAL},
 {id:'tv',x:388,label:'テレビの前',topic:'睡眠時間の確保',title:'明日は早起き。続きを見ると睡眠時間が短くなるけれど？',desc:'あと一話。いつもの自分なら、どうする？',answers:[{label:'眠る時間を削って見る',points:0,action:'ソファに座って、もう一話。45分が過ぎていく…。'},{label:'続きは明日にする',points:20,action:'テレビを消した。続きは、明日の楽しみに。'}],tipTitle:'睡眠時間を、後回しにしない。',tip:'続きを見るために眠る時間を削らず、自分に必要な睡眠時間を確保しましょう。',source:NEUTRAL}
];
let W=360,H=310,last=0,ready=false,state;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
function resize(){const r=canvas.getBoundingClientRect();H=Math.max(170,Math.round(r.height*W/r.width));canvas.width=W;canvas.height=H;ctx.imageSmoothingEnabled=false;}
new ResizeObserver(resize).observe(canvas);
function closeDialog(){if($('overlay').open)$('overlay').close();state.paused=false;}
function reset(){
 if($('overlay').open)$('overlay').close();
 state={mode:'enter',step:0,hp:0,answers:[],playerX:-35,targetX:130,camera:0,timer:0,anim:0,paused:false,dim:0,dimTarget:0,done:false,activeAction:null,minutes:1320,recoveryIndex:-1,tvOn:false,temperatureSet:false};
 $('effect').textContent='';$('clock').textContent='22:00';$('phase').textContent='おかえり';$('scene-label').textContent='あなたの部屋';$('caption').textContent='おかえりなさい。今日は、どんな夜にする？';$('question-label').textContent='今夜の冒険';$('question').textContent='まずは、お部屋へ。';$('description').textContent='選ぶと主人公が動く。回復HPは、最後のお楽しみ。';$('choices').innerHTML='<div class="waiting">お部屋に入っています…</div>';$('honesty').textContent='いい答えより、いつもの答えを。';hud();
}
function hud(){
 const revealing=['recover','result'].includes(state.mode);
 $('hp').textContent=revealing?Math.round(state.hp):'—';$('hp-bar').style.width=(revealing?state.hp:0)+'%';$('hp-status').textContent=revealing?'今回の回復HP':'回復HPは最後に';$('meter').classList.toggle('pending',!revealing);$('meter').setAttribute('aria-label',revealing?`回復HP ${Math.round(state.hp)} / 100`:'回復HPは最後に発表');
 $('steps').innerHTML=questions.map((_,i)=>`<i class="${i<state.answers.length?'done':i===state.step?'current':''}" aria-label="${i+1}問目${i<state.answers.length?'回答済み':''}"></i>`).join('');
}
function clockText(){const m=Math.floor(state.minutes);return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
function showQuestion(){
 state.mode='question';state.activeAction=null;const q=questions[state.step];
 $('question-label').textContent=`${state.step+1} / 5　いつものあなたなら？`;$('question').textContent=q.title;$('description').textContent=q.desc;$('scene-label').textContent=q.label;$('phase').textContent='あなたの夜';$('clock').textContent=clockText();$('caption').textContent='いつもの自分に近い方を、タップ。';$('honesty').textContent='いい答えより、いつもの答えを。';
 $('choices').innerHTML=q.answers.map((a,i)=>`<button class="choice" data-answer="${i}">${a.label}</button>`).join('');document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answer(Number(b.dataset.answer)));hud();
}
function answer(index){
 if(!ready||state.mode!=='question'||state.paused||![0,1].includes(index))throw Error('今は回答できません。');
 const q=questions[state.step],a=q.answers[index];
 state.answers.push({id:q.id,title:q.title,topic:q.topic,label:a.label,points:a.points,tipTitle:q.tipTitle,tip:q.tip,source:q.source});state.mode='act';state.timer=0;
 state.activeAction={id:q.id,index,startX:state.playerX,startMinutes:state.minutes,extraMinutes:index===0?(q.id==='phone'?30:q.id==='tv'?45:0):0};
 if(q.id==='light')state.dimTarget=index===1?.58:0;if(q.id==='temperature')state.temperatureSet=index===1;if(q.id==='tv')state.tvOn=index===0;
 $('caption').textContent=a.action;$('honesty').textContent='あなたの選択を、記録しました。';document.querySelectorAll('[data-answer]').forEach(b=>{b.disabled=true;b.classList.toggle('selected',Number(b.dataset.answer)===index);});hud();return snapshot();
}
function actionDuration(){return state.activeAction?.id==='tv'&&state.activeAction.index===0?4.8:state.activeAction?.id==='phone'&&state.activeAction.index===0?4:2.8;}
function next(){
 state.minutes=Math.round(state.minutes)+5;state.step++;state.activeAction=null;state.timer=0;$('effect').textContent='';
 if(state.step>=questions.length){state.mode='finishwalk';state.targetX=550;state.tvOn=false;$('choices').innerHTML='<div class="waiting">ベッドへ…</div>';$('caption').textContent='５つの選択を記録。そろそろ、おやすみなさい。';}
 else{state.targetX=questions[state.step].x;state.mode='walk';$('caption').textContent='次の場面へ、てくてく。';$('choices').innerHTML='<div class="waiting">次の場面へ…</div>';}
 $('clock').textContent=clockText();
}
function startRecovery(){state.mode='recover';state.timer=0;state.recoveryIndex=-1;state.dimTarget=.68;$('phase').textContent='おやすみ';$('question-label').textContent='５つの選択を振り返ろう';$('question').textContent='今夜、いくつ回復できた？';$('description').textContent='あなたの選択から、回復HPを発表。';$('choices').innerHTML='<div class="waiting">回復HPを集計中…</div>';hud();}
function finish(){
 state.hp=state.answers.reduce((sum,a)=>sum+a.points,0);state.done=true;state.mode='result';$('phase').textContent='結果発表';$('clock').textContent='07:00';$('caption').textContent=state.hp===100?'５つの習慣で、100 HP回復！':'今夜から、できそうなことをひとつ。';$('question').textContent='おつかれさまでした。';$('description').textContent='５つの睡眠習慣を振り返りました。';$('choices').innerHTML='<button class="choice" id="view-result">結果をもう一度見る</button><button class="choice" id="replay">もう一度あそぶ</button>';$('view-result').onclick=showResult;$('replay').onclick=reset;hud();showResult();
}
function showResult(){
 const tips=state.answers.filter(a=>a.points===0),perfect=tips.length===0;
 openDialog(`<div class="dialog-banner">柳沢先生と振り返ろう</div><img class="portrait" src="yanagisawa.jpg" alt="柳沢正史氏の写真"><div class="dialog-body"><p class="photo-credit">写真：筑波大学 IIIS</p><h2 id="dialog-title">${perfect?'よい睡眠習慣を選べましたね。':'今夜から、できることをひとつ。'}</h2><p class="authored-note">ゲーム用メッセージ（ご本人の発言ではありません）</p><div class="result-score">+${state.hp}<span> / 100 回復HP</span></div><p>${perfect?'５つすべてで、睡眠を大切にする選択ができました。この調子で続けていきましょう。':`あなたの回答から、見直せることが${tips.length}つありました。`}</p>${tips.length?`<ol class="advice-list">${tips.map(a=>`<li><h3>${a.tipTitle}</h3><p class="your-choice">あなたの回答：${a.label}</p><p>${a.tip}</p></li>`).join('')}</ol>`:''}<details><summary>５つの回答と回復HPを見る</summary><ol class="answers">${state.answers.map(a=>`<li>${a.title}<br><strong>${a.label}</strong><span class="answer-points">+${a.points} HP</span></li>`).join('')}</ol></details><button id="again">もう一度あそぶ</button><button id="share" class="secondary">結果をコピー</button><button id="close-result" class="text-button">部屋に戻る</button><p id="copy-note" class="share-note" aria-live="polite"></p><small>回復HPは、睡眠習慣を振り返るためのゲーム内スコアです。実際の睡眠の質や回復量を示すものではありません。<br>質問・助言は公開インタビューをもとにした改編です。柳沢氏ご本人・所属機関の監修や推薦ではありません。</small><details class="sources"><summary>参考にしたインタビュー</summary><p><a href="${HOTEL}" target="_blank" rel="noopener">日本ホテル協会 HOTEL REVIEW 753</a><br><a href="${NEUTRAL}" target="_blank" rel="noopener">NEUTRALWORKS. 柳沢正史インタビュー</a></p></details></div>`);
 $('again').onclick=reset;$('close-result').onclick=closeDialog;$('share').onclick=async()=>{const text=`おやすみクエスト：今回の回復HP +${state.hp}/100。５つの睡眠習慣を振り返りました。ゲーム内スコアです。\nhttps://scarlettmind.github.io/oyasumi-quest/`;try{await navigator.clipboard.writeText(text);$('copy-note').textContent='コピーしました。';}catch{$('copy-note').textContent=text;}};
}
function openDialog(html){state.paused=true;$('dialog-content').innerHTML=html;if(!$('overlay').open)$('overlay').showModal();$('overlay').scrollTop=0;}
function update(dt){
 if(!ready||state.paused)return;state.anim+=dt;state.dim+=(state.dimTarget-state.dim)*Math.min(1,dt*3);
 if(['enter','walk','finishwalk'].includes(state.mode)){const diff=state.targetX-state.playerX;state.playerX+=Math.sign(diff)*Math.min(Math.abs(diff),dt*155);if(Math.abs(diff)<2){if(state.mode==='finishwalk'){state.mode='sleep';state.timer=0;$('caption').textContent='おやすみなさい。今夜の選択を振り返ろう。';}else showQuestion();}}
 else if(state.mode==='act'){
  state.timer+=dt;const a=state.activeAction,duration=actionDuration();if(a.id==='tv'&&a.index===0)state.playerX=a.startX+(272-a.startX)*clamp(state.timer,0,1);
  const progress=clamp((state.timer-(a.id==='tv'?1:.4))/(duration-1),0,1);state.minutes=a.startMinutes+Math.floor(a.extraMinutes*progress);$('clock').textContent=clockText();if(a.extraMinutes)$('effect').textContent=`+${Math.floor(a.extraMinutes*progress)} 分`;
  if(state.timer>=duration){state.minutes=a.startMinutes+a.extraMinutes;next();}
 }else if(state.mode==='sleep'){state.timer+=dt;if(state.timer>1.1)startRecovery();}
 else if(state.mode==='recover'){
  state.timer+=dt;const i=Math.min(4,Math.floor(state.timer/.95));if(i!==state.recoveryIndex){state.recoveryIndex=i;const a=state.answers[i];$('caption').textContent=`${a.topic}　+${a.points} HP`;$('effect').textContent=`+${a.points} HP`;}
  const prior=state.answers.slice(0,i).reduce((n,a)=>n+a.points,0);state.hp=prior+state.answers[i].points*clamp((state.timer-i*.95)/.65,0,1);hud();if(state.timer>5.6){$('effect').textContent='';finish();}
 }
 state.camera+=(clamp(state.playerX-145,0,360)-state.camera)*Math.min(1,dt*6);
}
// Source rectangles isolate each generated pose. Clipping removes adjacent poses
// where the remote and sleeping frames overlap horizontally in the sprite sheet.
const actionRects=[[14,196,320,450],[351,196,320,450],[688,196,311,450],[1003,290,355,356],[1357,196,380,450],[1690,420,482,247]];
function sprite(pose,x,bottom,flip=false,height=79){
 let image=hero,rect;if(typeof pose==='number'){image=actions;rect=actionRects[pose];}else{const cell=hero.naturalWidth/3;rect=pose==='walk'?[cell+95,140,450,610]:[110,140,440,610];}
 const scale=height/rect[3],width=rect[2]*scale;ctx.save();ctx.translate(x,bottom);if(flip)ctx.scale(-1,1);ctx.translate(-width/2,-height);ctx.scale(scale,scale);
 if(pose===4){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(380,0);ctx.lineTo(380,280);ctx.lineTo(320,280);ctx.lineTo(320,450);ctx.lineTo(0,450);ctx.closePath();ctx.clip();}
 if(pose===5){ctx.beginPath();ctx.moveTo(60,0);ctx.lineTo(482,0);ctx.lineTo(482,247);ctx.lineTo(0,247);ctx.lineTo(0,75);ctx.lineTo(60,75);ctx.closePath();ctx.clip();}
 ctx.drawImage(image,...rect,0,0,rect[2],rect[3]);ctx.restore();
}
function draw(){
 ctx.clearRect(0,0,W,H);ctx.fillStyle='#302946';ctx.fillRect(0,0,W,H);if(!ready)return;
 const top=H-400,floor=top+342,cam=state.camera,px=state.playerX-cam;ctx.drawImage(rooms,0,0,rooms.naturalWidth,rooms.naturalHeight*.88,-cam,top,720,422);
 const a=state.activeAction,t=state.timer;
 if(state.tvOn){ctx.fillStyle='#abc5ec';ctx.fillRect(390-cam,top+269,32,21);ctx.fillStyle='#657eaf';ctx.fillRect(390-cam,top+279+Math.sin(state.anim*2)*3,32,7);ctx.fillStyle='rgba(158,186,244,.10)';ctx.fillRect(240-cam,top+265,185,62);}
 let pose='stand',bottom=floor,flip=false,height=79;const walking=['enter','walk','finishwalk'].includes(state.mode)||(a?.id==='tv'&&a.index===0&&t<1);
 if(walking){pose=Math.floor(state.anim*7)%2?'walk':'stand';flip=state.targetX<state.playerX||(a?.id==='tv');if(!reducedMotion)bottom+=Math.sin(state.anim*14)*1.3;}
 else if(a?.id==='coffee'){pose=t>.65&&t<1.9?1:0;}
 else if(a?.id==='phone'){pose=a.index===0||t<1?2:'stand';}
 else if(a?.id==='tv'&&a.index===0){pose=3;height=63;bottom=top+326;}
 else if(a?.id==='tv'||a?.id==='temperature'&&a.index===1||a?.id==='light'&&a.index===1){pose=4;}
 else if(['sleep','recover','result'].includes(state.mode)){pose=5;height=38;bottom=top+297;}
 sprite(pose,px,bottom,flip,height);
 if(a?.id==='phone'&&a.index===0){ctx.fillStyle='#b9dfff25';ctx.fillRect(px-23,bottom-68,49,54);ctx.fillStyle='#e0eeff';ctx.font='10px monospace';ctx.fillText('スクロール',px-24,bottom-86);ctx.fillStyle='#d2edff';ctx.fillRect(px+11,bottom-42,7,9);ctx.fillStyle='#6a98c9';ctx.fillRect(px+12,bottom-40+(Math.floor(state.anim*3)%3),5,2);}
 if(a?.id==='temperature'){ctx.font='12px "DotGothic16",sans-serif';ctx.fillStyle='#fff0d5';ctx.textAlign='center';ctx.fillText(a.index===1?'快適に調整':'そのまま',px,bottom-95);ctx.textAlign='left';}
 if(state.dim>.01){ctx.fillStyle=`rgba(12,13,44,${state.dim})`;ctx.fillRect(0,0,W,H);}
 if(['sleep','recover','result'].includes(state.mode)){ctx.fillStyle='#ffe7e8';ctx.font='13px "DotGothic16",sans-serif';ctx.fillText('Z z',px+37,bottom-38-(reducedMotion?0:Math.sin(state.anim*2)*3));}
}
function loop(t){const dt=Math.min((t-last)/1000||0,.04);last=t;update(dt);draw();requestAnimationFrame(loop);}
function snapshot(){return {mode:state.mode,step:state.step,hp:state.hp,answers:state.answers,paused:state.paused,done:state.done,ready,minutes:state.minutes,dim:state.dim,activeAction:state.activeAction};}
$('restart').onclick=reset;
$('info').onclick=()=>openDialog(`<div class="dialog-body"><h2 id="dialog-title">あそびかた</h2><p>部屋の５つの場面で、いつもの自分に近い答えを選んでください。選択に合わせて主人公が動きます。</p><p>回復HPは５問のあとに発表。ひとつの習慣につき20 HP、合計100 HPです。見直せる習慣には、それぞれのアドバイスが届きます。</p><p>HPはゲーム内のスコアで、実際の睡眠の質や回復量ではありません。同じ配点でも、各習慣の影響が同じという意味ではありません。</p><button id="close-info">ゲームに戻る</button><small>本作は非公式コンセプト。質問・助言は公開インタビューをもとにした改編です。柳沢氏ご本人・所属機関の監修や推薦ではありません。<br><a href="${HOTEL}" target="_blank" rel="noopener">参考：HOTEL REVIEW 753</a><br><a href="${NEUTRAL}" target="_blank" rel="noopener">参考：NEUTRALWORKS.</a><br><a href="https://wpi-iiis.tsukuba.ac.jp/japanese/research/member/detail/masashiyanagisawa/" target="_blank" rel="noopener">写真出典：筑波大学 IIIS</a><br><a href="https://airweave.jp/labo/sleep_diagnosis/light.shtml" target="_blank" rel="noopener">着想元：エアウィーヴ睡眠診断</a></small></div>`);
$('dialog-content').addEventListener('click',e=>{if(e.target.id==='close-info')closeDialog();});
$('overlay').addEventListener('cancel',e=>{e.preventDefault();closeDialog();});
function assetsReady(){if([rooms,hero,actions].every(im=>im.complete&&im.naturalWidth)){ready=true;$('loading').style.display='none';}}
for(const im of [rooms,hero,actions]){im.onload=assetsReady;im.onerror=()=>{$('loading').textContent='読み込めませんでした。再読み込みしてください。';};}
resize();reset();assetsReady();requestAnimationFrame(loop);
if(document.modelContext?.registerTool){const definitions=[
 {name:'read_sleep_game',description:'Read the sleep habit game state',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:snapshot},
 {name:'answer_sleep_question',description:'Answer current sleep habit question, option 0 or 1. Available only in question mode.',inputSchema:{type:'object',properties:{option:{type:'integer',enum:[0,1]}},required:['option'],additionalProperties:false},execute:({option})=>answer(option)},
 {name:'restart_sleep_game',description:'Reset the game and all answers',inputSchema:{type:'object',properties:{},additionalProperties:false},execute:()=>{reset();return snapshot();}}
 ];for(const tool of definitions){try{Promise.resolve(document.modelContext.registerTool(tool)).catch(()=>{});}catch{}}}
