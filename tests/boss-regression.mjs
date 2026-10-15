import assert from 'node:assert/strict'
import fs from 'node:fs'
import crypto from 'node:crypto'
import React from 'react'
import {act,create} from 'react-test-renderer'
import {createModuleLoader,loadUrl} from './load-module.mjs'
import {unlockRoute} from './unlock-route.mjs'
const {BOSS_STAGE:config,ADVENTURE_STAGES}=await import(loadUrl('src/adventure/stages.ts'))
const {createStageReducer,initialStage,stageScore}=await import(loadUrl('src/adventure/stageState.ts'))
const {recordBossAttempt,getBossProgress,BOSS_MIN_POOL_SIZE}=await import(loadUrl('src/stages/boss/bossModel.ts'))
const {bossAttemptFor}=await import(loadUrl('src/stages/boss/bossState.ts'))
const progressApi=await import(loadUrl('src/adventure/stageProgress.ts'))
assert.ok(config.ready);assert.ok(config.questions.length>=BOSS_MIN_POOL_SIZE)
assert.equal(new Set(config.questions.map(q=>q.id)).size,9)
assert.deepEqual(config.questions.map(q=>Number(q.choices[q.answer])),[63,4,20,74,57,20,60,92,18])
for(const q of config.questions)assert.equal(new Set(Object.values(q.choices)).size,4)
assert.deepEqual(ADVENTURE_STAGES.slice(0,3).map(q=>q.questions.map(x=>x.id)),[['q01','q02','q03'],['q04','q05','q06'],['q07','q08','q09']])
const reduce=createStageReducer(config)
const start=()=>reduce(reduce({...initialStage},{type:'START'}),{type:'READY'})
const submit=(state,kind)=>reduce(state,kind==='timeout'?{type:'TIMEOUT',index:state.index}:{type:'ANSWER',index:state.index,source:'webcam',choice:kind==='correct'?config.questions[state.index].answer:['A','B','C','D'].find(c=>c!==config.questions[state.index].answer)})
let leaves=0
function visit(state){
  for(const kind of ['correct','wrong','timeout']){
    const before=getBossProgress(state.bossAttempts??[])
    let s=submit(state,kind)
    const progress=getBossProgress(s.bossAttempts)
    assert.equal(s.phase,'feedback');assert.equal(s.bossAttempts.length,state.index+1)
    assert.equal(progress.hits,before.hits+(kind==='correct'?1:0))
    assert.equal(stageScore(s),progress.hits*10)
    assert.equal(reduce(s,{type:'TIMEOUT',index:s.index}),s)
    assert.equal(reduce(s,{type:'ANSWER',index:s.index,source:'manual',choice:config.questions[s.index].answer}),s)
    assert.deepEqual(recordBossAttempt(s.bossAttempts,s.bossAttempts.at(-1)),s.bossAttempts)
    const paused=reduce(s,{type:'PAUSE'})
    assert.equal(reduce(paused,{type:'ADVANCE'}),paused)
    s=reduce(reduce(s,{type:'ADVANCE'}),{type:'ADVANCE'})
    if(progress.defeated){
      assert.equal(s.phase,'crossing')
      s=reduce(s,{type:'ADVANCE'});assert.equal(s.phase,'finish');assert.equal(stageScore(s),30)
      const replay=reduce(s,{type:'REPLAY'})
      assert.equal(replay.index,0);assert.equal(replay.battle,1);assert.equal(stageScore(replay),0)
      assert.notEqual(bossAttemptFor(s,config,'A').submissionId,bossAttemptFor(replay,config,'A').submissionId)
      leaves++
    }else if(state.index===config.questions.length-1){
      assert.equal(s.phase,'practice-complete');assert.ok(stageScore(s)<30)
      assert.equal(reduce(s,{type:'ADVANCE'}),s)
      assert.equal(reduce(s,{type:'REPLAY'}).phase,'thinking')
      leaves++
    }else{
      assert.equal(s.phase,'thinking');assert.equal(s.index,state.index+1)
      assert.notEqual(config.questions[s.index].id,config.questions[state.index].id,'Không lặp câu vừa hiện lời giải')
      visit(reduce(s,{type:'READY'}))
    }
  }
}
visit(start())
const one=submit(start(),'wrong').bossAttempts[0]
assert.deepEqual(recordBossAttempt([one],{...one,submissionId:'different'}),[one],'Một question instance chỉ nhận một đáp án')
assert.equal(recordBossAttempt([],{...one,submissionId:''}).length,0)
assert.equal(recordBossAttempt([],{...one,result:'timeout',choice:'A'}).length,0)
let correction=submit(start(),'wrong')
correction=reduce(correction,{type:'CAMERA_RETRY'})
assert.equal(correction.cameraCorrections,1);assert.equal(correction.bossAttempts.length,0)
correction=reduce(correction,{type:'ADVANCE'})
assert.equal(correction.index,1);assert.equal(stageScore(correction),0)
console.log(`PASS: Boss ${leaves} nhánh đến thắng/hết pool, chỉ đúng gây sát thương/điểm; chống trùng, pause, đổi câu, replay và hủy lỗi webcam.`)

let base=progressApi.emptyProgress()
for(const id of ['forest','rainbow','island'])base=progressApi.completeStage(base,id,{score:30,stars:3})
assert.equal(progressApi.isUnlocked(base,'castle'),true)
assert.equal(progressApi.completeStage(base,'castle',{score:20,stars:2}),base)
const completed=progressApi.completeStage(base,'castle',{score:30,stars:3})
assert.deepEqual(progressApi.parseProgress(JSON.stringify(completed)),completed)
assert.deepEqual(completed.completed.island,base.completed.island)

const manifest=JSON.parse(fs.readFileSync('tests/boss-protected-files.json','utf8'))
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex')
for(const [file,expected] of Object.entries(manifest.files))assert.equal(hash(fs.readFileSync(file)),expected,file+' không được thay đổi khi tích hợp Boss')
const nonBossReducer=fs.readFileSync('src/adventure/stageState.ts','utf8').split('  return function reduce')[1]
assert.equal(hash(nonBossReducer),manifest.nonBossReducerSha256)
for(const file of ['/assets/items/boss.png','/assets/items/trophy.png','/audio/music/04_lau_dai_boss.ogg','/audio/sfx/adventure/boss_hit.wav','/audio/sfx/adventure/boss_defeated.wav'])assert.ok(fs.existsSync('public'+file))
console.log('PASS: lưu Boss 30 điểm, giữ tiến độ cũ; SHA-256 camera/reducer và các file được bảo vệ đạt baseline; asset đủ.')

// Component engine thật; chỉ mô phỏng camera và đồng hồ để điều khiển sự kiện.
const moduleUrl=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64')
const load=createModuleLoader({
  './ForestAdventure':moduleUrl('export default function Forest(){return null}'),
  '../ai/useAnswerCamera':moduleUrl('export function useAnswerCamera(open){globalThis.bossTest.open=open;return globalThis.bossTest.camera}'),
  './useStageClock':moduleUrl('export function useStageClock(key,duration,paused,done){Object.assign(globalThis.bossTest,{key,duration,paused,done});return Math.ceil((duration??0)/1000)}'),
})
const {default:Engine}=await import(load('src/adventure/AdventureStage.tsx'))
const {default:App}=await import(load('src/App.tsx'))
const original={Audio:globalThis.Audio,window:globalThis.window,act:globalThis.IS_REACT_ACT_ENVIRONMENT,error:console.error}
let renderer,stopped=0
const sounds=[],finishes=[]
const camera={status:'error',pose:'UNKNOWN',progress:0,confirmed:null,needsNeutral:false,message:'Mô phỏng',videoRef:React.createRef(),canvasRef:React.createRef(),start(){},stop(){stopped++},debugEnabled:false,setDebugEnabled(){}}
globalThis.bossTest={camera}
globalThis.Audio=class{constructor(src){this.src=src}play(){sounds.push(this.src);return Promise.resolve()}pause(){}}
globalThis.IS_REACT_ACT_ENVIRONMENT=true
console.error=(...args)=>{if(!String(args[0]).includes('react-test-renderer is deprecated'))original.error(...args)}
const tree=()=>React.createElement(Engine,{config,onExit(){},onComplete:r=>finishes.push(r)})
const text=node=>node.children.map(c=>typeof c==='string'?c:text(c)).join('')
const click=async label=>{
  const b=renderer.root.findAllByType('button').find(n=>text(n).includes(label))
  assert.ok(b,label);assert.ok(!b.props.disabled);await act(async()=>b.props.onClick())
}
const choice=letter=>renderer.root.findAllByType('button').find(n=>n.props['aria-label']?.startsWith('Đáp án '+letter+':'))
const fire=async()=>{assert.equal(globalThis.bossTest.paused,false);await act(async()=>globalThis.bossTest.done())}
const hits=()=>renderer.root.find(n=>n.props['aria-label']==='Lâu Đài Boss').props['data-boss-hits']
const next=async()=>{await click('tiếp tục');await fire();await fire()}
try{
  await act(async()=>{renderer=create(tree(),{createNodeMock:n=>n.type==='audio'?{play:()=>Promise.resolve(),pause(){}}:null})})
  await click('Bật webcam & đấu Boss');await fire()
  const video=renderer.root.findByType('video')
  assert.equal(renderer.root.findAllByProps({className:'boss-victory'}).length,0,'Chưa thắng chưa có màn chúc mừng')
  assert.equal(renderer.root.findAllByType('button').filter(n=>n.props['aria-label']?.startsWith('Đáp án ')).length,4)
  await click('Tạm dừng');assert.equal(globalThis.bossTest.open,false)
  assert.equal(choice('B').props.disabled,true)
  await click('Tiếp tục')
  const before=sounds.length
  await act(async()=>{choice('A').props.onClick();choice('A').props.onClick()})
  assert.equal(hits(),0);assert.equal(sounds.length,before+1)
  assert.ok(text(renderer.root).includes('Boss không mất khiên, không cộng điểm'))
  assert.ok(text(renderer.root).includes(config.questions[0].explanation),'Boss dùng câu mới nên vẫn giải thích câu sai')
  const skip=renderer.root.findAllByType('label').find(n=>text(n).includes('Bỏ hoạt hình')).findByType('input')
  await act(async()=>skip.props.onChange({target:{checked:true}}))
  assert.equal(globalThis.bossTest.duration,3500,'Bỏ hoạt hình vẫn giữ lời giải câu sai')
  assert.equal(hits(),0,'Bỏ hoạt hình không gây sát thương')
  await act(async()=>skip.props.onChange({target:{checked:false}}))
  await click('Câu thay thế');await fire();await fire()
  assert.ok(text(renderer.root).includes(config.questions[1].prompt))
  camera.pose='NEUTRAL';camera.armed=true
  await act(async()=>renderer.update(tree()))
  camera.pose='C'
  camera.confirmed={id:1,pose:'C'}
  await act(async()=>renderer.update(tree()))
  assert.equal(hits(),1)
  await act(async()=>renderer.update(tree()))
  assert.equal(sounds.filter(s=>s.endsWith('boss_hit.wav')).length,1)
  await next()
  await fire() // Timeout câu 3, không gây sát thương.
  assert.equal(hits(),1)
  assert.ok(!renderer.root.find(n=>n.props['aria-label']==='Lâu Đài Boss').props.className.includes('mk-boss--impact'))
  await click('Câu thay thế');await fire();await fire()
  await act(async()=>choice('A').props.onClick());assert.equal(hits(),2)
  await next()
  await act(async()=>choice('B').props.onClick());assert.equal(hits(),3)
  assert.equal(finishes.length,0,'Chờ feedback/hoạt hình trước khi lưu hoàn thành')
  await next()
  assert.deepEqual(finishes,[{score:30,stars:3}])
  assert.ok(text(renderer.root).includes('Vương quốc đã được giải cứu'))
  const victory=renderer.root.findByProps({className:'boss-victory'})
  assert.ok(text(victory).includes('Chúc mừng bạn đãtiêu diệt Boss!'))
  assert.equal(victory.findAllByProps({className:'victory-trophy'}).length,1)
  assert.equal(victory.findAllByProps({className:'victory-burst'}).length,6)
  assert.equal(renderer.root.findAllByType('main').find(n=>n.props.className?.includes('boss-app')).props.hidden,true)
  assert.equal(sounds.filter(s=>s.endsWith('boss_hit.wav')).length,2)
  assert.equal(sounds.filter(s=>s.endsWith('boss_defeated.wav')).length,1)
  assert.equal(renderer.root.findByType('video'),video)
  await act(async()=>renderer.update(tree()));assert.equal(finishes.length,1)

  await click('Chơi lại Boss');await click('Tắt tiếng');await fire()
  assert.equal(renderer.root.findAllByProps({className:'boss-victory'}).length,0,'Chơi lại đóng màn chúc mừng')
  const mutedSounds=sounds.length
  for(let index=0;index<config.questions.length;index++){
    await fire() // Timeout mọi câu đến hết pool.
    await click('Câu thay thế');await fire()
    if(index<config.questions.length-1)await fire()
  }
  assert.equal(sounds.length,mutedSounds)
  assert.ok(text(renderer.root).includes('Boss vẫn còn khiên'))
  assert.equal(renderer.root.findAllByProps({className:'boss-victory'}).length,0,'Hết pool chưa thắng không có cúp chiến thắng')
  assert.equal(finishes.length,1,'Hết pool không gọi hoàn thành')
  assert.equal(stopped,2)
  assert.ok(renderer.root.findAllByType('button').some(n=>text(n)==='Về bản đồ'))
  await click('Luyện tập lại');await fire();assert.equal(hits(),0)
  assert.equal(globalThis.bossTest.open,true)
  await act(async()=>renderer.unmount());renderer=null

  const memory=new Map(),localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)}
  progressApi.writeProgress(localStorage,base);globalThis.window={localStorage}
  await act(async()=>{renderer=create(React.createElement(App))})
  await unlockRoute(renderer,act,3)
  await click('Lâu đài Boss');assert.ok(text(renderer.root).includes('Cùng Cú phá ba lớp khiên Boss'))
  await click('← Bản đồ');assert.ok(text(renderer.root).includes('Bản đồ phiêu lưu'))
  console.log('PASS: Engine Boss manual/webcam/timeout, pause/mute, 4 đáp án, audio một lần, video cố định, thắng đúng 3 hit, hết pool/luyện lại và map.')
}finally{
  if(renderer)await act(async()=>renderer.unmount())
  globalThis.Audio=original.Audio;globalThis.window=original.window
  globalThis.IS_REACT_ACT_ENVIRONMENT=original.act;console.error=original.error
  delete globalThis.bossTest
}
