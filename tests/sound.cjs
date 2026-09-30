const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const frequencies=[],voices=[],gains=[],events={};let resumes=0,pauses=0;
const param=()=>({value:0,setValueAtTime(n){this.value=n},setTargetAtTime(n){this.value=n},exponentialRampToValueAtTime(n){this.value=n}});
class Context{constructor(){this.currentTime=0;this.state='running';this.destination={};}createGain(){const gain={gain:param(),connect(){}};gains.push(gain);return gain;}createOscillator(){const frequency=param();frequency.setValueAtTime=n=>frequencies.push(n);return {frequency,connect(){},start(){},stop(){}};}resume(){resumes++;this.state='running';return Promise.resolve();}suspend(){this.state='suspended';}}
class Voice{play(){voices.push(this.src);return Promise.resolve();}pause(){pauses++;}}
const button={setAttribute(){}};
const s={window:{AudioContext:Context},Audio:Voice,document:{getElementById:()=>button,addEventListener:(name,fn)=>events[name]=fn,hidden:false}};
vm.createContext(s);vm.runInContext(fs.readFileSync(path.join(__dirname,'../sound.js'),'utf8'),s);
const run=x=>vm.runInContext(x,s);
run('Sound.answer(false)');assert.deepEqual(frequencies,[280],'Wrong answer has only a soft descending cue');assert.deepEqual(voices,['audio/welcome.mp3']);
frequencies.length=0;run('Sound.answer(true)');assert.deepEqual(frequencies,[523.25,659.25,783.99],'Correct answer has recovery chime');assert.equal(voices.length,1,'Welcome does not replay');
run('Sound.toggle()');assert.equal(run('Sound.enabled'),false);assert.equal(gains[0].gain.value,0);const total=frequencies.length;run('Sound.answer(true);Sound.playVoice("hp100")');assert.equal(frequencies.length,total);assert.equal(voices.length,1);
run('Sound.toggle();Sound.playVoice("hp20");Sound.hush();Sound.tick(5)');assert.equal(gains[1].gain.value,0,'Ending fades music');assert.equal(voices.at(-1),'audio/hp20.mp3');
run('Sound.playVoice("goodnight");Sound.reset()');assert.equal(voices.at(-1),'audio/goodnight.mp3');assert.ok(pauses>0);assert.ok(resumes>0);
console.log('Audio triggers, mute, unmute, one-time welcome, ending music fade and reset passed.');
