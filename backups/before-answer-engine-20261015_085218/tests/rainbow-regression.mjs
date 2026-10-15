import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {loadUrl} from './load-module.mjs'
const {RAINBOW_STAGE:config,ADVENTURE_STAGES}=await import(loadUrl('src/adventure/stages.ts'))
const {createStageReducer,initialStage,stageScore}=await import(loadUrl('src/adventure/stageState.ts'))
const {StageClock}=await import(loadUrl('src/adventure/stageClock.ts'))
const progressApi=await import(loadUrl('src/adventure/stageProgress.ts'))
const {completeStage,emptyProgress,isUnlocked,parseProgress,readProgress,writeProgress}=progressApi
const reduce=createStageReducer(config)
assert.equal(config.questions.length,3)
assert.deepEqual(config.questions.map(q=>q.id),['q04','q05','q06'])
assert.equal(config.questions.map(q=>q.answer).join(''),'DAB')
assert.deepEqual(ADVENTURE_STAGES.map(s=>s.id),['forest','rainbow','island','castle'])
function start(){return reduce(reduce({...initialStage,results:[]},{type:'START'}),{type:'READY'})}
function answer(state,kind){
  return kind==='unanswered'?reduce(state,{type:'TIMEOUT',index:state.index}):reduce(state,{type:'ANSWER',index:state.index,source:'webcam',choice:kind==='correct'?config.questions[state.index].answer:['A','B','C','D'].find(c=>c!==config.questions[state.index].answer)})
}
// 27 tổ hợp: đúng/sai/chưa nhận được đáp án. Cả ba đều phải hoàn thành đủ đoạn.
for(const first of ['correct','wrong','unanswered'])for(const second of ['correct','wrong','unanswered'])for(const third of ['correct','wrong','unanswered']){
  let s=start()
  const kinds=[first,second,third]
  for(const [index,kind] of kinds.entries()){
    assert.equal(s.index,index);assert.equal(s.phase,'answering')
    assert.equal(reduce(s,{type:'TIMEOUT',index:index-1}),s,'Bỏ sự kiện hết giờ của câu cũ')
    s=answer(s,kind)
    assert.equal(s.results.length,index+1);assert.equal(s.results[index].kind,kind)
    assert.equal(reduce(s,{type:'ANSWER',index,source:'manual',choice:config.questions[index].answer}),s,'Không cộng trùng từ webcam/click')
    assert.equal(reduce(s,{type:'TIMEOUT',index}),s,'Không chấm thêm hết giờ sau đáp án')
    const paused=reduce(s,{type:'PAUSE'})
    assert.equal(reduce(paused,{type:'ADVANCE'}),paused)
    assert.equal(reduce(paused,{type:'CAMERA_RETRY'}),paused)
    s=reduce(s,{type:'ADVANCE'});assert.equal(s.phase,'next')
    s=reduce(s,{type:'ADVANCE'})
    if(index<2){assert.equal(s.phase,'thinking');s=reduce(s,{type:'READY'})}
  }
  assert.equal(s.phase,'crossing');assert.equal(s.results.length,3)
  s=reduce(s,{type:'ADVANCE'});assert.equal(s.phase,'finish')
  assert.equal(stageScore(s),kinds.filter(k=>k==='correct').length*10)
  assert.equal(reduce(s,{type:'ADVANCE'}),s)
  const replay=reduce(s,{type:'REPLAY'})
  assert.equal(replay.phase,'thinking');assert.equal(stageScore(replay),0);assert.equal(replay.results.length,0)
}
let paused=reduce(start(),{type:'PAUSE'})
assert.equal(reduce(paused,{type:'TIMEOUT',index:0}),paused)
assert.equal(reduce(paused,{type:'ANSWER',index:0,choice:'D',source:'webcam'}),paused)
let correction=answer(start(),'wrong')
correction=reduce(correction,{type:'CAMERA_RETRY'})
assert.equal(correction.results.length,0);assert.equal(correction.cameraCorrections,1);assert.equal(correction.phase,'thinking')
correction=answer(reduce(correction,{type:'READY'}),'correct')
assert.equal(stageScore(correction),10)
assert.equal(reduce(correction,{type:'CAMERA_RETRY'}),correction)
const manualWrong=reduce(start(),{type:'ANSWER',index:0,choice:'A',source:'manual'})
assert.equal(reduce(manualWrong,{type:'CAMERA_RETRY'}),manualWrong)
console.log('PASS: 27 tổ hợp đúng/sai/hết giờ, ba đoạn, tổng kết, chấm trùng, pause và camera chọn nhầm.')

const clock=new StageClock(20000)
clock.resume(1000);assert.equal(clock.left(5000),16000)
clock.pause(5000);assert.equal(clock.left(100000),16000)
clock.resume(100000);clock.resume(101000);assert.equal(clock.left(102000),14000)
clock.pause(102000);clock.resume(200000);assert.equal(clock.left(214000),0)
assert.equal(clock.left(999999),0)
console.log('PASS: đồng hồ 20 giây giữ thời gian còn lại qua pause/resume, không reset khi render lại.')

let progress=emptyProgress()
assert.equal(isUnlocked(progress,'forest'),true)
for(const id of ['rainbow','island','castle'])assert.equal(isUnlocked(progress,id),false)
assert.equal(completeStage(progress,'rainbow',{score:30,stars:3}),progress)
progress=completeStage(progress,'forest',{score:30,stars:2})
assert.equal(isUnlocked(progress,'rainbow'),true);assert.equal(isUnlocked(progress,'island'),false)
progress=completeStage(progress,'rainbow',{score:0,stars:0})
assert.equal(isUnlocked(progress,'island'),true,'Hoàn thành dù 0 điểm vẫn mở màn 3')
assert.equal(isUnlocked(progress,'castle'),false)
assert.equal(completeStage(progress,'island',{score:30,stars:3}),progress,'Màn đang chuẩn bị không thể bị ghi hoàn thành')
assert.deepEqual(parseProgress('{bad'),emptyProgress())
assert.deepEqual(parseProgress(JSON.stringify({version:1,completed:{rainbow:{score:30,stars:3}}})),emptyProgress())
assert.deepEqual(parseProgress(JSON.stringify({version:1,completed:{forest:{score:999,stars:3}}})),emptyProgress())
assert.equal(completeStage(progress,'rainbow',{score:20,stars:3}),progress)
progress=completeStage(progress,'rainbow',{score:30,stars:3})
progress=completeStage(progress,'rainbow',{score:10,stars:1})
assert.deepEqual(progress.completed.rainbow,{score:30,stars:3})
const memory=new Map(),storage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value)}
assert.equal(writeProgress(storage,progress),true)
assert.deepEqual(readProgress(storage).progress,progress)
assert.equal(isUnlocked(readProgress(storage).progress,'island'),true)
assert.equal(readProgress({getItem(){throw Error('Storage denied')}}).saved,false)
assert.equal(writeProgress({setItem(){throw Error('Quota exceeded')}},progress),false)
console.log('PASS: mở khóa tuần tự, 0 điểm, giữ thành tích tốt nhất, tải lại storage, storage hỏng/bị chặn.')

const backup='backups/before-rainbow-20261015_083804'
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
for(const relative of ['src/ai/usePoseCamera.ts','src/ai/poseClassifier.ts','src/ai/stabilizer.ts','src/data/questions.ts','src/LegacyApp.tsx','src/forestState.ts','src/forest.css','src/styles.css'])assert.equal(hash(relative),hash(path.join(backup,relative)),relative+' bị thay đổi')
let forest=fs.readFileSync('src/ForestAdventure.tsx','utf8')
forest=forest.replace("import type {StageResult} from './adventure/stageProgress'\n",'')
forest=forest.replace('export default function ForestAdventure({onExit,onComplete}:{onExit:()=>void;onComplete?:(result:StageResult)=>void}){','export default function ForestAdventure({onExit}:{onExit:()=>void}){')
forest=forest.replace(/  \/\/ Chỉ báo kết quả cho bản đồ; giữ nguyên luật và vòng đời webcam màn Rừng\.\r?\n  useEffect\(\(\)=>\{\r?\n    if\(state.phase==='finish'\)onComplete\?\.\(\{score:state.score,stars:state.firstTry\}\)\r?\n  \},\[state.phase,state.score,state.firstTry,onComplete\]\)\r?\n/,'')
assert.equal(forest,fs.readFileSync(path.join(backup,'src/ForestAdventure.tsx'),'utf8'),'Màn Rừng chỉ được thêm callback hoàn thành')
for(const stage of ADVENTURE_STAGES)for(const asset of [stage.background,stage.gem,stage.music])assert.ok(fs.existsSync('public'+asset),asset)
for(const asset of ['adventure/portal_open.wav','quiz/answer_correct.wav','quiz/answer_wrong_gentle.wav','quiz/time_up.wav','rewards/level_complete.wav','ui/ui_start.wav','ui/ui_pause.wav','ui/ui_resume.wav'])assert.ok(fs.existsSync('public/audio/sfx/'+asset),asset)
console.log('PASS: AI, 12 câu, luật/giao diện Rừng nguyên vẹn; chỉ thêm callback mở khóa; tài nguyên tồn tại.')

const {default:AdventureStage}=await import(loadUrl('src/adventure/AdventureStage.tsx'))
const {default:App}=await import(loadUrl('src/App.tsx'))
const mapHtml=renderToStaticMarkup(React.createElement(App))
assert.ok(mapHtml.includes('Bản đồ phiêu lưu'));assert.ok(mapHtml.includes('kiểm thử 12 câu cũ'))
assert.equal((mapHtml.match(/class="map-stage"/g)||[]).length,4)
assert.equal((mapHtml.match(/disabled=""/g)||[]).length,3)
const savedInitial={...initialStage,results:[...initialStage.results]}
const snapshots=[{...savedInitial}]
let sample=start();snapshots.push(sample)
sample=answer(sample,'wrong');snapshots.push(sample)
sample=reduce(reduce(reduce(sample,{type:'ADVANCE'}),{type:'ADVANCE'}),{type:'READY'})
sample=answer(sample,'unanswered');snapshots.push(sample)
sample=reduce(reduce(reduce(sample,{type:'ADVANCE'}),{type:'ADVANCE'}),{type:'READY'})
sample=answer(sample,'correct');snapshots.push(sample)
sample=reduce(reduce(sample,{type:'ADVANCE'}),{type:'ADVANCE'});snapshots.push(sample)
sample=reduce(sample,{type:'ADVANCE'});snapshots.push(sample)
for(const snapshot of snapshots){
  Object.assign(initialStage,snapshot)
  const html=renderToStaticMarkup(React.createElement(AdventureStage,{config,onExit(){},onComplete(){}}))
  assert.equal((html.match(/<video/g)||[]).length,1)
  assert.equal((html.match(/<canvas/g)||[]).length,1)
  assert.ok(html.includes(config.title))
  if(snapshot.phase==='feedback')assert.ok(html.includes(config.questions[snapshot.index].explanation))
  if(snapshot.phase==='finish'){assert.ok(html.includes('10 điểm'));assert.ok(html.includes('1/3 sao'));assert.ok(html.includes('Đã mở khóa Đảo Kho Báu'))}
}
Object.assign(initialStage,savedInitial)
console.log('PASS: render bản đồ 4 màn và các pha màn Cầu Vồng, video/canvas hiện ở mọi pha, kết quả 10 điểm/1 sao.')
