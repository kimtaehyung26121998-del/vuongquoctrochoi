import assert from 'node:assert/strict'
import fs from 'node:fs'
import React from 'react'
import {act,create} from 'react-test-renderer'
import {renderToStaticMarkup} from 'react-dom/server'
import {createModuleLoader,loadUrl} from './load-module.mjs'
import {unlockRoute} from './unlock-route.mjs'

const {TREASURE_STAGE:config,ADVENTURE_STAGES}=await import(loadUrl('src/adventure/stages.ts'))
const {ADVENTURE_STAGES:oldStages}=await import(loadUrl('backups/before-answer-engine-20261015_085218/src/adventure/stages.ts'))
const robotCopy=stage=>({...stage,intro:stage.id==='rainbow'?'Ba đoạn cầu vồng đang ngủ quên. Dùng phép toán để thiên thần hóa phép tạo cầu vồng qua những hòn đảo trên mây!':stage.intro.replaceAll('Cú ','Robot '),completeText:stage.id==='rainbow'?'Cầu vồng đã nối liền! Em và Robot đã tới Đảo Kho Báu nhờ phép thuật của thiên thần.':stage.completeText.replaceAll('Cú ','Robot ')})
assert.deepEqual(ADVENTURE_STAGES.slice(0,2),oldStages.slice(0,2).map(robotCopy),'Cấu hình Rừng/Cầu Vồng giữ nguyên ngoài tên nhân vật')
assert.deepEqual(config.questions.map(q=>q.id),['q07','q08','q09'])
assert.equal(config.ready,true)
const {createStageReducer,initialStage,stageScore}=await import(loadUrl('src/adventure/stageState.ts'))
const {treasureOutcomes}=await import(loadUrl('src/stages/treasure/TreasureSceneAdapter.tsx'))
const {getTreasureProgress,recordTreasureOutcome}=await import(loadUrl('src/stages/treasure/treasureModel.ts'))
const {completeStage,emptyProgress,isUnlocked,readProgress,writeProgress}=await import(loadUrl('src/adventure/stageProgress.ts'))
const {default:Stage}=await import(loadUrl('src/adventure/AdventureStage.tsx'))
const reduce=createStageReducer(config)
let base=completeStage(emptyProgress(),'forest',{score:30,stars:3})
base=completeStage(base,'rainbow',{score:30,stars:3})
for(const a of ['correct','wrong','unanswered'])for(const b of ['correct','wrong','unanswered'])for(const c of ['correct','wrong','unanswered']){
  let state=reduce(reduce(initialStage,{type:'START'}),{type:'READY'})
  const kinds=[a,b,c]
  for(const [index,kind] of kinds.entries()){
    assert.equal(isUnlocked(base,'castle'),false)
    state=reduce(state,kind==='unanswered'?{type:'TIMEOUT',index}:{type:'ANSWER',index,source:'manual',choice:kind==='correct'?config.questions[index].answer:'B'})
    assert.equal(reduce(state,{type:'TIMEOUT',index}),state)
    const outcomes=treasureOutcomes(state,config)
    assert.equal(outcomes.length,index+1)
    assert.deepEqual(recordTreasureOutcome(outcomes,outcomes[index]),outcomes)
    let progress=getTreasureProgress(outcomes)
    assert.equal(progress.hasMap,index>0||kind==='correct')
    assert.equal(progress.hasKey,index>1||index===1&&kind==='correct')
    assert.equal(progress.chestOpened,index===2&&kind==='correct')
    if(kind!=='correct'){
      assert.equal(progress.correct,index)
      state=reduce(state,{type:'ADVANCE'})
      assert.equal(state.index,index);assert.equal(state.phase,'thinking')
      assert.equal(state.results.length,index)
      state=reduce(state,{type:'READY'})
      state=reduce(state,{type:'ANSWER',index,source:'manual',choice:config.questions[index].answer})
      progress=getTreasureProgress(treasureOutcomes(state,config))
      assert.equal(progress.correct,index+1)
    }
    if(index===2){
      const saved={...initialStage}
      Object.assign(initialStage,state)
      const html=renderToStaticMarkup(React.createElement(Stage,{config,onExit(){},onComplete(){}}))
      Object.assign(initialStage,saved)
      assert.ok(html.includes('chest_open.png'),'Rương mở ngay trong feedback cuối')
      assert.ok(html.includes(config.questions[2].explanation))
      assert.equal((html.match(/class="forest-answer /g)||[]).length,4,'Chỉ có một bộ đáp án')
      assert.equal((html.match(/<video/g)||[]).length,1)
      assert.ok(!html.includes('treasure-island__victory'),'Chưa tổng kết trong feedback')
    }
    state=reduce(reduce(state,{type:'ADVANCE'}),{type:'ADVANCE'})
    if(index<2)state=reduce(state,{type:'READY'})
  }
  state=reduce(state,{type:'ADVANCE'})
  assert.equal(state.phase,'finish')
  const score=30
  assert.equal(stageScore(state),score)
  const complete=completeStage(base,'island',{score,stars:score/10})
  assert.equal(isUnlocked(complete,'castle'),true,'Chỉ đúng cả 3 mới hoàn thành và mở Boss')
  assert.deepEqual(complete.completed.forest,base.completed.forest)
  assert.deepEqual(complete.completed.rainbow,base.completed.rainbow)
  const memory=new Map(),storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)}
  assert.equal(writeProgress(storage,complete),true)
  assert.equal(isUnlocked(readProgress(storage).progress,'castle'),true)
}
console.log('PASS: Kho Báu 27 tổ hợp, sai/hết giờ phải làm lại; vật phẩm/rương chỉ nhận khi đúng, đủ 3 câu mới mở Boss.')

// Phân biệt câu đã đi qua với câu đúng: sai không có dấu tích/thưởng.
const {default:TreasureScene}=await import(loadUrl('src/stages/treasure/TreasureIslandScene.tsx'))
for(const kind of ['wrong','unanswered']){
  const outcomes=config.questions.map((q,round)=>({questionId:q.id,round,choice:kind==='wrong'?'B':null,isCorrect:false}))
  const html=renderToStaticMarkup(React.createElement(TreasureScene,{round:2,phase:'feedback',outcomes,compact:true}))
  assert.ok(html.includes('câu đúng · 0 điểm'),'Bộ đếm câu đúng không tăng khi sai')
  assert.ok(html.includes('0/3 thử thách đã vượt qua'),'Sai không tăng tiến độ hành trình')
  assert.equal((html.match(/objective--done/g)||[]).length,0,'Sai/hết giờ không có trạng thái đúng')
  assert.equal((html.match(/objective--assisted/g)||[]).length,3)
  assert.ok(html.includes(kind==='wrong'?'Chưa đúng · +0 điểm':'Chưa trả lời · +0 điểm'))
  assert.ok(!html.includes('treasure-island__sparkles'),'Không tung sao thưởng khi Robot hỗ trợ')
  assert.ok(!html.includes('chest_open.png'),'Sai không được mở rương')
  assert.ok(html.includes('robot_thinking.png'),'Robot hướng dẫn xem lại, không reo mừng đáp án sai')
}
console.log('PASS: Sai/hết giờ hiển thị 0 điểm, không dấu tích đúng hoặc sao thưởng; tách rõ tiến độ hành trình và số câu đúng.')

// Kiểm tra đường đi qua cảnh thật: sai/timeout/retry giữ cùng điểm đứng.
{
  for(let passed=0;passed<3;passed++){
    const earned=config.questions.slice(0,passed).map((q,round)=>({questionId:q.id,round,choice:q.answer,isCorrect:true}))
    const props={round:passed,phase:'answering',outcomes:earned,compact:true}
    const still=renderToStaticMarkup(React.createElement(TreasureScene,props))
    assert.ok(still.includes(`data-route-step="${passed}"`))
    assert.ok(!still.includes('owl--moving'))
    for(const choice of ['B',null]){
      const wrong={questionId:config.questions[passed].id,round:passed,choice,isCorrect:false}
      const html=renderToStaticMarkup(React.createElement(TreasureScene,{...props,phase:'feedback',outcomes:[...earned,wrong]}))
      assert.ok(html.includes(`data-route-step="${passed}"`),'Sai không tiến lên')
      assert.ok(!html.includes('owl--moving'),'Không phát lại hoạt ảnh khi sai')
      assert.ok(html.includes('data-at-chest="false"'))
    }
    const correct={questionId:config.questions[passed].id,round:passed,choice:config.questions[passed].answer,isCorrect:true}
    const html=renderToStaticMarkup(React.createElement(TreasureScene,{...props,phase:'feedback',outcomes:[...earned,correct]}))
    assert.ok(html.includes(`data-route-step="${passed+1}"`),'Đúng tiến đúng một bước')
    assert.ok(html.includes('owl--moving'))
    if(passed===2){
      assert.ok(html.includes('--treasure-route-to:1'),'Đáp án cuối đến điểm cuối đường đi')
      assert.ok(html.includes('data-at-chest="true"'))
      const finish=renderToStaticMarkup(React.createElement(TreasureScene,{...props,phase:'complete',outcomes:[...earned,correct]}))
      assert.ok(finish.includes('--treasure-route-to:1'),'Tổng kết giữ Robot ở rương')
      assert.ok(!finish.includes('owl--moving'),'Tổng kết không bay lại từ đầu')
    }
  }
  console.log('PASS: Robot tiến 3 bước chỉ khi đúng, sai/timeout đứng yên, câu cuối tới rương và ở lại khi tổng kết.')
}

// Tích hợp component thật với sự kiện đã chốt và đồng hồ có thể điều khiển.
// Đây là kiểm thử mô phỏng, không sử dụng webcam thật.
const reactUrl=import.meta.resolve('react')
const moduleUrl=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64')
const load=createModuleLoader({
  './ForestAdventure':moduleUrl('export default function Forest(){return null}'),
  '../ai/useAnswerCamera':moduleUrl(`export function useAnswerCamera(open){globalThis.treasureTest.open=open;return globalThis.treasureTest.camera}`),
  './useStageClock':moduleUrl(`export function useStageClock(key,duration,paused,done){Object.assign(globalThis.treasureTest,{key,duration,paused,done});return Math.ceil((duration??0)/1000)}`),
})
const {default:Engine}=await import(load('src/adventure/AdventureStage.tsx'))
const {default:App}=await import(load('src/App.tsx'))
const original={Audio:globalThis.Audio,window:globalThis.window,act:globalThis.IS_REACT_ACT_ENVIRONMENT,error:console.error}
globalThis.IS_REACT_ACT_ENVIRONMENT=true
console.error=(...args)=>{if(!String(args[0]).includes('react-test-renderer is deprecated'))original.error(...args)}
let renderer
const sounds=[],completions=[]
globalThis.Audio=class{constructor(src){this.src=src}play(){sounds.push(this.src);return Promise.resolve()}pause(){}}
const camera={status:'error',pose:'UNKNOWN',progress:0,confirmed:null,needsNeutral:false,message:'Camera mô phỏng',videoRef:React.createRef(),canvasRef:React.createRef(),start(){},stop(){},debugEnabled:false,setDebugEnabled(){}}
globalThis.treasureTest={camera}
const text=node=>node.children.map(c=>typeof c==='string'?c:text(c)).join('')
const button=label=>renderer.root.findAllByType('button').find(n=>text(n).includes(label))
const click=async label=>{const b=button(label);assert.ok(b,label);assert.ok(!b.props.disabled,label);await act(async()=>b.props.onClick())}
const advance=async()=>{assert.equal(globalThis.treasureTest.paused,false);await act(async()=>globalThis.treasureTest.done())}
const renderEngine=()=>React.createElement(Engine,{config,onExit(){},onComplete:r=>completions.push(r)})
const choice=letter=>renderer.root.findAllByType('button').find(n=>n.props['aria-label']?.startsWith('Đáp án '+letter+':'))
try{
  await act(async()=>{renderer=create(renderEngine(),{createNodeMock:n=>n.type==='audio'?{play:()=>Promise.resolve(),pause(){}}:null})})
  await click('Bật webcam & khám phá')
  assert.equal(globalThis.treasureTest.open,false)
  await advance();assert.equal(globalThis.treasureTest.open,true)
  const video=renderer.root.findByType('video')
  const manual=choice('C').props.onClick
  await act(async()=>{manual();manual()})
  assert.equal(globalThis.treasureTest.duration,1500,'Đúng: phản hồi chỉ 1,5 giây')
  assert.equal(sounds.filter(s=>s.endsWith('collect_star.wav')).length,1,'Hai click chỉ phát thưởng một lần')
  await click('Đã hiểu')
  assert.equal(globalThis.treasureTest.duration,150,'Chuyển cảnh giữa câu chỉ 150ms')
  await advance();await advance()
  await click('Tạm dừng');assert.equal(globalThis.treasureTest.open,false);assert.equal(globalThis.treasureTest.paused,true)
  assert.equal(choice('D').props.disabled,true)
  await click('Tiếp tục');assert.equal(globalThis.treasureTest.open,true)
  camera.confirmed={id:1,pose:'B'}
  await act(async()=>renderer.update(renderEngine()))
  assert.equal(globalThis.treasureTest.duration,3500,'Sai: có 3,5 giây phản hồi/sửa webcam')
  assert.ok(!text(renderer.root).includes(config.questions[1].explanation),'Sai không lộ lời giải')
  assert.equal(renderer.root.findAllByType('button').filter(n=>n.props.className?.includes('answer-correct')).length,0)
  await click('Webcam chọn nhầm')
  assert.equal(renderer.root.findAll(n=>n.props.className?.includes('objective--done')).length,1,'Bỏ kết quả webcam nhầm')
  await advance()
  await act(async()=>choice('D').props.onClick())
  await click('Đã hiểu');await advance();await advance()
  assert.equal(completions.length,0,'Không mở khóa sớm')
  await click('Tắt tiếng')
  const soundCount=sounds.length
  await advance() // Hết giờ câu 3.
  assert.equal(globalThis.treasureTest.duration,3500,'Hết giờ: phản hồi 3,5 giây')
  assert.ok(!text(renderer.root).includes(config.questions[2].explanation),'Hết giờ không lộ lời giải')
  assert.equal(renderer.root.findAllByType('button').filter(n=>n.props.className?.includes('answer-correct')).length,0)
  assert.equal(sounds.length,soundCount,'Mute cả âm mở rương/pha lê')
  assert.equal(renderer.root.findAllByType('img').filter(n=>n.props.src==='/assets/items/chest_open.png').length,0)
  await click('Thử lại câu này');await advance()
  await act(async()=>choice('B').props.onClick())
  await advance() // Tự hết phản hồi sai phải quay lại đúng câu 3.
  assert.equal(completions.length,0)
  assert.ok(text(renderer.root).includes(config.questions[2].prompt))
  await advance()
  await act(async()=>choice('A').props.onClick())
  assert.equal(renderer.root.findAllByType('img').filter(n=>n.props.src==='/assets/items/chest_open.png').length,1)
  await click('Đã hiểu');await advance()
  assert.equal(globalThis.treasureTest.duration,1200,'Cảnh kết thúc rút còn 1,2 giây')
  await advance()
  assert.deepEqual(completions,[{score:30,stars:3}])
  assert.ok(text(renderer.root).includes('Đã mở khóa Lâu Đài Boss'))
  assert.equal(renderer.root.findByType('video'),video,'Video không remount qua các pha')
  await act(async()=>renderer.update(renderEngine()))
  assert.equal(completions.length,1)
  await click('Chơi lại');await click('Bật tiếng');await advance()
  for(const letter of ['C','D','A']){
    await act(async()=>choice(letter).props.onClick())
    await click('Đã hiểu');await advance()
    await advance()
  }
  assert.equal(sounds.filter(s=>s.endsWith('chest_open.wav')).length,1)
  assert.equal(sounds.filter(s=>s.endsWith('collect_crystal.wav')).length,1)
  assert.deepEqual(completions.at(-1),{score:30,stars:3})
  const rewardCount=sounds.filter(s=>s.includes('/rewards/collect_')).length
  await click('Chơi lại');await advance()
  for(let round=0;round<3;round++){
    await act(async()=>choice('B').props.onClick())
    assert.equal(completions.length,2,'Lặp câu sai không được hoàn thành màn')
    assert.ok(text(renderer.root).includes(config.questions[0].prompt),'Vẫn ở câu đầu chưa giải đúng')
    await click('Thử lại câu này');await advance()
  }
  assert.equal(text(renderer.root.findByProps({className:'forest-score'})),'0điểm')
  assert.equal(sounds.filter(s=>s.includes('/rewards/collect_')).length,rewardCount,'Sai không phát âm thưởng sao/pha lê')
  await act(async()=>renderer.unmount());renderer=null

  let stored=completeStage(base,'island',{score:30,stars:3})
  const memory=new Map()
  const localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)}
  writeProgress(localStorage,stored);globalThis.window={localStorage}
  await act(async()=>{renderer=create(React.createElement(App))})
  assert.equal(renderer.root.findAllByType('button').filter(n=>n.props.className==='map-stage'&&n.props.disabled).length,3)
  await unlockRoute(renderer,act,3)
  assert.equal(renderer.root.findAllByType('button').filter(n=>n.props.className==='map-stage'&&n.props.disabled).length,0)
  await click('Đảo kho báu')
  assert.ok(text(renderer.root).includes('Cùng Robot khám phá Đảo Kho Báu'))
  await click('← Bản đồ')
  await click('Lâu đài Boss')
  assert.ok(text(renderer.root).includes('Cùng Robot phá ba lớp khiên Boss'))
  await act(async()=>renderer.unmount());renderer=null
  console.log('PASS: Engine thật: manual/webcam/timeout, chặn click trùng, camera retry, pause/resume, mute, audio một lần, replay, video cố định, map vào Kho Báu/Boss.')
}finally{
  if(renderer)await act(async()=>renderer.unmount())
  globalThis.Audio=original.Audio;globalThis.window=original.window
  globalThis.IS_REACT_ACT_ENVIRONMENT=original.act;console.error=original.error
  delete globalThis.treasureTest
}
for(const file of ['public/assets/treasure/map_fragment.svg','public/assets/treasure/golden_key.svg','public/audio/music/03_dao_kho_bau.ogg','public/audio/sfx/adventure/chest_open.wav','public/audio/sfx/rewards/collect_crystal.wav'])assert.ok(fs.existsSync(file),file)
