'use strict';
// Original synthesized background music and game sound effects only.
// No credentials, runtime AI requests, or answer data leave the browser.
const Sound=(()=>{
 let context,master,music,enabled=true,unlocked=false,nextBeat=0,beat=0;
 const melody=[72,76,79,76,74,77,81,77,72,76,79,83,81,79,76,null];
 function label(){const b=document.getElementById('sound');const playing=enabled&&unlocked&&context?.state==='running';b.textContent=playing?'音あり':'音ON';b.setAttribute('aria-pressed',String(!!playing));b.setAttribute('aria-label',playing?'音声をオフにする':'音声をオンにする');}
 function tone(freq,start,length,volume=.1,type='triangle',bus=master,endFreq){
  if(!context||!enabled)return;
  const osc=context.createOscillator(),gain=context.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,start);if(endFreq)osc.frequency.exponentialRampToValueAtTime(endFreq,start+length);
  gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume),start+.015);gain.gain.exponentialRampToValueAtTime(.0001,start+length);
  osc.connect(gain);gain.connect(bus);osc.start(start);osc.stop(start+length+.03);
 }
 function unlock(){
  if(!enabled)return;
  try{
   if(window.navigator?.audioSession){try{window.navigator.audioSession.type='playback';}catch{}}
   if(!context){context=new (window.AudioContext||window.webkitAudioContext)();master=context.createGain();master.gain.value=.3;master.connect(context.destination);music=context.createGain();music.gain.value=.32;music.connect(master);}
   const started=()=>{unlocked=context.state==='running';if(unlocked&&nextBeat<context.currentTime)nextBeat=context.currentTime+.05;label();return unlocked;};
   if(context.state==='running'){started();return Promise.resolve(unlocked);}
   return context.resume().then(started).catch(()=>{unlocked=false;label();return false;});
  }catch{unlocked=false;label();return Promise.resolve(false);}
 }
 function tick(step){
  if(!context||!enabled||!unlocked||context.state!=='running')return;
  const now=context.currentTime;
  music.gain.setTargetAtTime(.32*(1-Math.min(step,5)*.12),now,.4);
  if(nextBeat<now-.5)nextBeat=now;
  if(nextBeat<now+.12){const n=melody[beat%melody.length];const tempo=.39+Math.min(step,5)*.065;
   if(n!==null)tone(440*Math.pow(2,(n-69)/12),nextBeat,tempo*.85,.25,'triangle',music);
   if(beat%4===0)tone(130.81,nextBeat,tempo*2,.1,'sine',music);
   beat++;nextBeat+=tempo;
  }
 }
 function answer(correct){
  if(!enabled)return;const ready=unlock();if(!context)return;
  if(context.state!=='running'){ready?.then(ok=>{if(ok&&enabled&&!document.hidden)answer(correct);});return;}const now=context.currentTime+.02;
  if(correct)[523.25,659.25,783.99].forEach((f,i)=>tone(f,now+i*.09,.22,.18));
  else tone(280,now,.3,.12,'sine',master,150);
 }
 function toggle(){if(!unlocked||context?.state!=='running'){enabled=true;if(master&&context)master.gain.setValueAtTime(.3,context.currentTime);unlock();label();return;}enabled=!enabled;if(!enabled){if(master&&context)master.gain.setValueAtTime(0,context.currentTime);}else{if(master&&context)master.gain.setValueAtTime(.3,context.currentTime);unlock();}label();}
 function reset(){beat=0;if(context)nextBeat=context.currentTime+.2;}
 const gesture=e=>{if(e.target?.closest?.('#sound'))return;if(enabled)unlock();};
 document.addEventListener('click',gesture);
 document.addEventListener('touchend',gesture,{passive:true});
 document.addEventListener('keydown',gesture);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){context?.suspend();label();}else if(enabled&&unlocked)unlock();});
 return {unlock,tick,answer,toggle,label,reset,get enabled(){return enabled;}};
})();
