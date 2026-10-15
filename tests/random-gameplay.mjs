import assert from 'node:assert/strict'
import React from 'react'
import {act,create} from 'react-test-renderer'
import {createModuleLoader,loadUrl} from './load-module.mjs'
const {ARITHMETIC_BANK:bank,createQuestionDeck}=await import(loadUrl('src/data/arithmeticBank.ts'))
const {RAINBOW_STAGE,TREASURE_STAGE,BOSS_STAGE}=await import(loadUrl('src/adventure/stages.ts'))
const moduleUrl=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64')
const cameraModule=moduleUrl('export function useAnswerCamera(){return globalThis.randomGame.camera} export const usePoseCamera=useAnswerCamera')
const load=createModuleLoader({
  './ai/useAnswerCamera':cameraModule,'../ai/useAnswerCamera':cameraModule,'./ai/usePoseCamera':cameraModule,
  './useStageClock':moduleUrl('export function useStageClock(key,duration,paused,done){Object.assign(globalThis.randomGame,{key,duration,paused,done});return Math.ceil((duration??0)/1000)}'),
})
const {default:Forest}=await import(load('src/ForestAdventure.tsx'))
const {default:Engine}=await import(load('src/adventure/AdventureStage.tsx'))
const {default:Practice}=await import(load('src/LegacyApp.tsx'))
const original={window:globalThis.window,Audio:globalThis.Audio,act:globalThis.IS_REACT_ACT_ENVIRONMENT,error:console.error}
const timers=new Map(),intervals=new Map()
let id=0,renderer
globalThis.window={setTimeout(fn,ms){const key=++id;timers.set(key,{fn,ms});return key},clearTimeout:key=>timers.delete(key),setInterval(fn){const key=++id;intervals.set(key,fn);return key},clearInterval:key=>intervals.delete(key)}
globalThis.Audio=class{play(){return Promise.resolve()}pause(){}}
globalThis.IS_REACT_ACT_ENVIRONMENT=true
console.error=(...args)=>{if(!String(args[0]).includes('react-test-renderer is deprecated'))original.error(...args)}
const camera={status:'error',pose:'UNKNOWN',progress:0,confirmed:null,needsNeutral:false,message:'Mô phỏng',videoRef:React.createRef(),canvasRef:React.createRef(),start(){},stop(){},debugEnabled:false,setDebugEnabled(){}}
globalThis.randomGame={camera}
const text=node=>node.children.map(c=>typeof c==='string'?c:text(c)).join('')
const click=async label=>{
  const b=renderer.root.findAllByType('button').find(n=>text(n).includes(label))
  assert.ok(b,label);assert.ok(!b.props.disabled);await act(async()=>b.props.onClick())
}
const answer=async letter=>{
  const b=renderer.root.findAllByType('button').find(n=>n.props['aria-label']?.startsWith('Đáp án '+letter+':'))
  assert.ok(!b.props.disabled);await act(async()=>b.props.onClick())
}
const mount=async element=>{await act(async()=>{renderer=create(element,{createNodeMock:n=>n.type==='audio'?{play:()=>Promise.resolve(),pause(){}}:null})})}
const unmount=async()=>{await act(async()=>renderer.unmount());renderer=null;assert.equal(timers.size,0);assert.equal(intervals.size,0)}
const forestTimer=async ms=>{assert.equal(timers.size,1);const [key,timer]=[...timers][0];assert.equal(timer.ms,ms);timers.delete(key);await act(async()=>timer.fn())}
const sharedTimer=async()=>{assert.equal(globalThis.randomGame.paused,false);await act(async()=>globalThis.randomGame.done())}
const fixed=(start,stage,count=3)=>bank.slice(start,start+count).map(q=>({...q,stage}))
try{
  let calls=0
  const results=[]
  const factory=()=>{calls++;return fixed(calls===1?2:5,0)}
  await mount(React.createElement(Forest,{questionFactory:factory,onExit(){},onComplete:r=>results.push(r)}))
  assert.equal(calls,0,'Không rút câu trong render/intro')
  await click('Bật webcam & vào rừng');assert.equal(calls,1)
  assert.ok(text(renderer.root).includes(bank[2].prompt))
  await forestTimer(3000)
  await answer('A') // Bộ gốc q01 đúng A, bộ mới câu này đúng C.
  assert.equal(text(renderer.root.findByProps({className:'forest-score'})),'0điểm')
  await forestTimer(1200);assert.equal(calls,1,'Retry không rút câu khác')
  for(const [index,q] of fixed(2,0).entries()){
    await answer(q.answer);await forestTimer(3200);await forestTimer(250)
    if(index<2)await forestTimer(3000)
  }
  assert.deepEqual(results,[{score:30,stars:2}])
  await click('Chơi lại');assert.equal(calls,2)
  assert.ok(text(renderer.root).includes(bank[5].prompt))
  await click('Tắt tiếng');assert.equal(calls,2,'Render phụ không xáo câu')
  await unmount()

  for(const config of [RAINBOW_STAGE,TREASURE_STAGE,BOSS_STAGE]){
    let batches=0,active
    const finish=[]
    const deck=createQuestionDeck(()=>.23)
    const questionFactory=()=>{batches++;active=deck.draw(config.number-1,config.id==='castle'?9:3);return active}
    await mount(React.createElement(Engine,{config,questionFactory,onExit(){},onComplete:r=>finish.push(r)}))
    await click('Bật webcam &');assert.equal(batches,1)
    const video=renderer.root.findByType('video')
    await sharedTimer()
    for(let index=0;index<3;index++){
      assert.ok(text(renderer.root).includes(active[index].prompt))
      await answer(active[index].answer)
      await sharedTimer();await sharedTimer();await sharedTimer()
    }
    assert.deepEqual(finish,[{score:30,stars:3}])
    const oldIds=active.map(q=>q.id)
    await click('Chơi lại');assert.equal(batches,2)
    assert.ok(active.every(q=>!oldIds.includes(q.id)))
    assert.ok(text(renderer.root).includes(active[0].prompt))
    assert.equal(renderer.root.findByType('video'),video)
    await unmount()
  }
  let practiceCalls=0
  const practice=()=>{practiceCalls++;return fixed(0,0,12)}
  await mount(React.createElement(Practice,{questionFactory:practice}))
  await click('Chơi 12 câu toán')
  assert.equal(practiceCalls,1)
  assert.ok(text(renderer.root).includes(bank[0].prompt))
  assert.ok(!text(renderer.root).includes('38 + 27 = ?'))
  await unmount()

  // Kiểm tra đường vào thật trên App truyền factory cho cả 5 chế độ và dùng cùng bộ bài.
  const capture=moduleUrl('export default function Scene(props){globalThis.randomRoutes[props.config?.id??"forest"]=props;return null}')
  const appLoader=createModuleLoader({
    './ForestAdventure':capture,'./adventure/AdventureStage':capture,
    './LegacyApp':moduleUrl('export default function Practice(props){globalThis.randomRoutes.practice=props;return null}'),
  })
  const {default:App}=await import(appLoader('src/App.tsx'))
  globalThis.randomRoutes={}
  const completed={version:1,completed:{forest:{score:30,stars:3},rainbow:{score:30,stars:3},island:{score:30,stars:3}}}
  globalThis.window.localStorage={getItem:()=>JSON.stringify(completed),setItem(){}}
  await mount(React.createElement(App))
  const drawn=[]
  for(const [stage,name] of ['Rừng phép tính','Cầu vồng thử thách','Đảo kho báu','Lâu đài Boss'].entries()){
    await click(name)
    const props=globalThis.randomRoutes[['forest','rainbow','island','castle'][stage]]
    const questions=props.questionFactory()
    assert.equal(questions.length,stage===3?9:3)
    assert.ok(questions.every(q=>q.stage===stage&&bank.some(source=>source.id===q.id)))
    drawn.push(...questions)
    await act(async()=>props.onComplete({score:30,stars:3}))
    await act(async()=>props.onExit())
  }
  await click('Luyện webcam & kiểm thử 12 câu ngẫu nhiên')
  const practiceSet=globalThis.randomRoutes.practice.questionFactory()
  assert.deepEqual(practiceSet.map(q=>q.stage),[0,0,0,1,1,1,2,2,2,3,3,3])
  drawn.push(...practiceSet)
  assert.equal(new Set(drawn.map(q=>q.id)).size,30,'Cả bản đồ và phòng luyện dùng chung bộ bài không trùng')
  await unmount()
  console.log('PASS: Cả 4 màn + phòng luyện rút câu mới khi chơi/chơi lại, chấm theo câu mới, retry/render không xáo, webcam không remount; App dùng chung bộ 50 câu.')
}finally{
  if(renderer)await act(async()=>renderer.unmount())
  globalThis.window=original.window;globalThis.Audio=original.Audio;globalThis.IS_REACT_ACT_ENVIRONMENT=original.act;console.error=original.error
  delete globalThis.randomGame;delete globalThis.randomRoutes
}
