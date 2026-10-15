import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {pathToFileURL} from 'node:url'
import React from 'react'
import {act,create} from 'react-test-renderer'
import {createModuleLoader} from './load-module.mjs'
const load=createModuleLoader({'@mediapipe/tasks-vision':pathToFileURL(path.resolve('tests/mock-vision.mjs')).href})
const {usePoseCamera}=await import(load('src/ai/usePoseCamera.ts'))
const {useAnswerCamera}=await import(load('src/ai/useAnswerCamera.ts'))
const {CameraDiagnosticsProbe}=await import(load('src/ai/cameraDiagnostics.ts'))
const {createStageReducer,initialStage,stageScore}=await import(load('src/adventure/stageState.ts'))
const {RAINBOW_STAGE}=await import(load('src/adventure/stages.ts'))
function landmarks(pose){
  const base={0:[.5,.2],11:[.4,.35],12:[.6,.35],13:[.4,.5],14:[.6,.5],15:[.4,.76],16:[.6,.76],23:[.43,.65],24:[.57,.65]}
  const shapes={A:{13:[.32,.25],14:[.68,.25],15:[.48,.15],16:[.52,.15]},B:{13:[.28,.42],14:[.72,.42],15:[.36,.32],16:[.64,.32]},C:{0:[.65,.2],11:[.55,.35],12:[.75,.35],13:[.35,.4],14:[.82,.45],15:[.45,.15],16:[.8,.6]},D:{13:[.28,.5],14:[.72,.5],15:[.43,.65],16:[.57,.65]},NEUTRAL:{}}
  if(pose==='UNKNOWN')return undefined
  if(pose==='D_WAIST')shapes.D_WAIST={...shapes.D,15:[.43,.52],16:[.57,.52]}
  if(pose==='D_NARROW')shapes.D_NARROW={13:[.38,.5],14:[.62,.5],15:[.43,.59],16:[.57,.59]}
  if(pose==='A_RELAXED')shapes.A_RELAXED={13:[.3,.30],14:[.7,.30],15:[.4,.15],16:[.6,.15]}
  if(pose==='B_HIGH')shapes.B_HIGH={13:[.3,.37],14:[.7,.37],15:[.4,.205],16:[.6,.205]}
  if(pose==='REST_ARMS')shapes.REST_ARMS={13:[.344,.494],14:[.656,.494],15:[.288,.638],16:[.712,.638]}
  const points=Array.from({length:33},()=>({x:.5,y:.5,visibility:1,presence:1}))
  for(const [id,[x,y]] of Object.entries({...base,...shapes[pose]}))points[id]={x,y,visibility:1,presence:1}
  return points
}
const backup='backups/before-answer-engine-20261015_085218'
// Classifier B/D, luật retry và mở khóa thay đổi theo yêu cầu người dùng.
// Giữ bất biến vòng MediaPipe, stabilizer/auto-arm, đồng hồ và màn Rừng.
for(const relative of ['src/ai/stabilizer.ts','src/data/questions.ts','src/adventure/useStageClock.ts','src/adventure/useStageAudio.ts','src/adventure/stageClock.ts','src/forest.css','src/styles.css','src/adventure/rainbow.css']){
  assert.equal(fs.readFileSync(relative,'utf8'),fs.readFileSync(path.join(backup,relative),'utf8'),relative+' phải giữ nguyên')
}
console.log('PASS: stabilizer, auto-arm, bộ đề, CSS hai màn và đồng hồ/âm thanh chung giữ nguyên.')
const originalNavigator=Object.getOwnPropertyDescriptor(globalThis,'navigator')
const originalRAF=globalThis.requestAnimationFrame,originalCancel=globalThis.cancelAnimationFrame
const originalAct=globalThis.IS_REACT_ACT_ENVIRONMENT
const originalError=console.error
// React 19 deprecates this testing package; keep unexpected errors visible.
console.error=(...args)=>{if(!String(args[0]).includes('react-test-renderer is deprecated'))originalError(...args)}
globalThis.IS_REACT_ACT_ENVIRONMENT=true
let frames=new Map(),frameId=0,t=0
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{mediaDevices:{async getUserMedia(){globalThis.cameraTest.streams++;return {getTracks:()=>[{stop(){globalThis.cameraTest.stops++}}]}}}}})
globalThis.requestAnimationFrame=callback=>{const id=++frameId;frames.set(id,callback);return id}
globalThis.cancelAnimationFrame=id=>frames.delete(id)
let renderer,camera,props,video,events,lastEvent,renders
function Harness({open,legacy=false,noise=0,edgeFrame=false}){
  renders++
  camera=legacy?usePoseCamera(open,false):useAnswerCamera(open)
  // Mô phỏng RAF đến ngay sau commit, trước passive effects của cửa sổ mới.
  React.useLayoutEffect(()=>{if(open&&edgeFrame)pumpFrame('B')},[open,edgeFrame])
  React.useEffect(()=>{if(camera.confirmed&&camera.confirmed.id!==lastEvent){lastEvent=camera.confirmed.id;events.push(camera.confirmed)}},[camera.confirmed])
  return React.createElement('section',{'data-noise':noise},React.createElement('video',{ref:camera.videoRef}),React.createElement('canvas',{ref:camera.canvasRef}))
}
async function mount({open=true,legacy=false}={}){
  frames=new Map();t=0;events=[];lastEvent=0;renders=0
  globalThis.cameraTest={streams:0,stops:0,resolvers:0,detectors:0,closes:0,inferences:0,landmarks:undefined}
  video={videoWidth:960,videoHeight:540,readyState:2,currentTime:0,srcObject:null,async play(){},pause(){}}
  props={open,legacy,noise:0}
  await act(async()=>{renderer=create(React.createElement(Harness,props),{createNodeMock:element=>element.type==='video'?video:element.type==='canvas'?{getContext:()=>null}:null})})
  await act(async()=>{await camera.start()})
  assert.equal(camera.status,'running')
}
async function update(changes){props={...props,...changes};await act(async()=>{renderer.update(React.createElement(Harness,props))})}
async function tick(pose,delta=100){
  await act(async()=>pumpFrame(pose,delta))
}
function pumpFrame(pose,delta=100){
  t+=delta;video.currentTime+=delta/1000;globalThis.cameraTest.landmarks=landmarks(pose)
  const pending=[...frames.values()];frames.clear()
  assert.equal(pending.length,1,'Chỉ có một vòng RAF nhận diện')
  pending[0](t)
}
async function hold(pose,ms){for(let n=0;n<ms;n+=100)await tick(pose,Math.min(100,ms-n))}
async function unmount(){await act(async()=>renderer.unmount());assert.equal(frames.size,0);assert.equal(globalThis.cameraTest.detectors,1);assert.equal(globalThis.cameraTest.closes,1)}
try{
  await mount()
  await hold('A',1100);assert.equal(events.length,1)
  await update({open:false});await hold('NEUTRAL',800)
  await hold('B',1500)
  await update({open:true,edgeFrame:true})
  assert.equal(events.length,1,'Không chốt nhầm bằng thời gian giữ trong thinking ở khe commit/passive effect')
  await hold('B',1100)
  assert.equal(events.length,2,'Câu mới phải nhận B sau đủ 1 giây, không bị khóa bởi một xác nhận đã mất')
  assert.equal(camera.needsNeutral,false)
  await unmount()
  console.log('PASS: RAF tại ranh giới mở câu không tạo xác nhận mất/khóa oan; đủ 1 giây trong câu mới mới chốt.')
  // Tái hiện nguyên nhân của màn 2 cũ: autoArm=false khóa lần tạo dáng đầu.
  await mount({legacy:true})
  await hold('A',1500);assert.equal(events.length,0)
  await hold('NEUTRAL',600);await hold('A',1100);assert.equal(events.length,1)
  await unmount()
  console.log('PASS: tái hiện lỗi cũ: A giữ 1500ms chưa chốt vì autoArm=false, phải nghỉ rồi tạo lại.')

  for(const pose of ['A','A_RELAXED','B','B_HIGH','C','D','D_WAIST','D_NARROW']){
    await mount();await tick(pose);await hold(pose,900)
    assert.equal(events.length,0)
    const before=camera.progress
    // Render lại, mở debug và nhiều render phụ không được reset tiến độ.
    for(let n=1;n<=10;n++)await update({noise:n})
    assert.equal(camera.progress,before)
    await act(async()=>camera.setDebugEnabled(true))
    await tick(pose);assert.equal(events.length,1);assert.equal(events[0].pose,pose.startsWith('D_')?'D':pose==='A_RELAXED'?'A':pose==='B_HIGH'?'B':pose)
    assert.equal(camera.diagnostics.holdingMs,1000)
    assert.equal(globalThis.cameraTest.streams,1);assert.equal(globalThis.cameraTest.detectors,1)
    assert.equal(camera.videoRef.current,video)
    await hold(pose,600);assert.equal(events.length,1)
    await unmount()
  }
  console.log('PASS: A/B/C/D lần đầu chốt tại 1000ms; render lại/bật debug không reset giữ dáng; không chấm lặp.')

  await mount();await hold('REST_ARMS',1600)
  assert.equal(camera.pose,'NEUTRAL');assert.equal(events.length,0,'Tay buông không chốt nhầm D')
  await hold('B_HIGH',1100)
  assert.equal(events.length,1);assert.equal(events[0].pose,'B','B cao vẫn chốt B')
  await update({open:false});await hold('REST_ARMS',800)
  await update({open:true});await hold('B_HIGH',1100)
  assert.equal(events.length,2);assert.equal(events[1].pose,'B','Tay buông mở lượt để chọn lại B')
  await unmount()

  await mount({open:false})
  await hold('C',1800);assert.equal(events.length,0)
  await update({open:true});await tick('C');await hold('C',900);assert.equal(events.length,0)
  await tick('C');assert.equal(events.length,1,'Dáng sớm được giữ tiếp, đủ 1 giây trong answering mới chốt')
  await update({open:false});await hold('C',800);assert.equal(events.length,1)
  await update({open:true});await hold('C',1500);assert.equal(events.length,1)
  assert.equal(camera.needsNeutral,true,'Cùng chữ chưa thả phải hướng dẫn nghỉ')
  await hold('NEUTRAL',600);await hold('C',1100);assert.equal(events.length,2)
  // Nghỉ trong feedback cũng được ghi nhận; không bắt nghỉ lần nữa khi mở lượt.
  await update({open:false});await hold('NEUTRAL',600)
  await update({open:true});await hold('C',1100);assert.equal(events.length,3)
  assert.equal(globalThis.cameraTest.streams,1);assert.equal(globalThis.cameraTest.detectors,1)
  await unmount()
  console.log('PASS: dáng sớm, hai câu cùng chữ, nghỉ trong feedback và chuyển pha không tạo lại camera/model.')

  await mount();await hold('A',500);await hold('B',1000)
  assert.equal(events.length,0);await tick('B');assert.equal(events[0].pose,'B')
  await unmount()
  await mount();await hold('D',600)
  await update({open:false});await hold('D',1800);assert.equal(events.length,0)
  await update({open:true});await hold('D',1000);assert.equal(events.length,0)
  await tick('D');assert.equal(events.length,1)
  await unmount()
  await mount();await hold('UNKNOWN',20000);assert.equal(events.length,0)
  const reduce=createStageReducer(RAINBOW_STAGE)
  let s=reduce(reduce({...initialStage},{type:'START'}),{type:'READY'})
  s=reduce(s,{type:'TIMEOUT',index:0});assert.equal(s.phase,'feedback');assert.equal(stageScore(s),0)
  assert.equal(reduce(s,{type:'ANSWER',index:0,choice:'D',source:'webcam'}),s)
  await unmount()
  console.log('PASS: đổi dáng giữa chừng, pause/resume, hết giờ không có dáng và đáp án đến muộn không cộng điểm.')

  await mount()
  // 60 RAF/giây không đồng nghĩa 60 suy luận hoặc 60 cập nhật React mỗi giây.
  const beforeRenders=renders
  await tick('NEUTRAL')
  for(let n=0;n<120;n++)await tick('NEUTRAL',16.67)
  assert.ok(globalThis.cameraTest.inferences<=32,'Suy luận được giới hạn xấp xỉ 15fps')
  assert.ok(renders-beforeRenders<globalThis.cameraTest.inferences,'Dáng ổn định không render theo mỗi suy luận')
  assert.equal(camera.diagnostics,null,'Debug mặc định tắt, không publish số liệu kỹ thuật')
  await act(async()=>camera.setDebugEnabled(true));await hold('A',600)
  assert.equal(camera.diagnostics.pose,'A');assert.ok(camera.diagnostics.fps>10&&camera.diagnostics.fps<=16)
  await act(async()=>camera.setDebugEnabled(false));assert.equal(camera.diagnostics,null)
  await unmount()
  const probe=new CameraDiagnosticsProbe(),state={armed:true,progress:0,blockedRepeat:false,confirmed:null}
  probe.sample('A',100,true,state,'ok')
  const diagnostic=probe.sample('A',600,true,{...state,blockedRepeat:true},'ok')
  assert.equal(diagnostic.holdingMs,500);assert.equal(diagnostic.waitingForNeutral,true)
  console.log('PASS: throttle suy luận/UI, debug mặc định tắt, số liệu FPS/giữ dáng/chờ nghỉ và dọn RAF/model.')
}finally{
  if(renderer&&frames.size)await act(async()=>renderer.unmount())
  if(originalNavigator)Object.defineProperty(globalThis,'navigator',originalNavigator);else delete globalThis.navigator
  globalThis.requestAnimationFrame=originalRAF;globalThis.cancelAnimationFrame=originalCancel
  globalThis.IS_REACT_ACT_ENVIRONMENT=originalAct;console.error=originalError
  delete globalThis.cameraTest
}
