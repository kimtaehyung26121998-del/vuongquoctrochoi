import assert from 'node:assert/strict'
import path from 'node:path'
import {pathToFileURL} from 'node:url'
import React from 'react'
import {act,create} from 'react-test-renderer'
import {createModuleLoader} from './load-module.mjs'
const moduleUrl=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64')
const realLoader=createModuleLoader({'@mediapipe/tasks-vision':pathToFileURL(path.resolve('tests/mock-vision.mjs')).href})
const realCamera=realLoader('src/ai/useAnswerCamera.ts')
const load=createModuleLoader({
  '../ai/useAnswerCamera':moduleUrl(`import {useAnswerCamera as real} from '${realCamera}';export function useAnswerCamera(open,onAnswer){const camera=real(open,onAnswer);globalThis.bossCameraFlow.camera=camera;return camera}`),
  './useStageClock':moduleUrl('export function useStageClock(key,duration,paused,done){Object.assign(globalThis.bossCameraFlow,{key,duration,paused,done});return Math.ceil((duration??0)/1000)}'),
})
const {default:Engine}=await import(load('src/adventure/AdventureStage.tsx'))
const {BOSS_STAGE:config}=await import(load('src/adventure/stages.ts'))
const original={navigator:Object.getOwnPropertyDescriptor(globalThis,'navigator'),raf:globalThis.requestAnimationFrame,cancel:globalThis.cancelAnimationFrame,Audio:globalThis.Audio,act:globalThis.IS_REACT_ACT_ENVIRONMENT,error:console.error}
let renderer,t=0,frameId=0
const frames=new Map(),completed=[]
globalThis.cameraTest={streams:0,stops:0,resolvers:0,detectors:0,closes:0,inferences:0,landmarks:undefined}
globalThis.bossCameraFlow={}
globalThis.IS_REACT_ACT_ENVIRONMENT=true
globalThis.Audio=class{play(){return Promise.resolve()}pause(){}}
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{mediaDevices:{async getUserMedia(){globalThis.cameraTest.streams++;return {getTracks:()=>[{stop(){globalThis.cameraTest.stops++}}]}}}}})
globalThis.requestAnimationFrame=fn=>{const id=++frameId;frames.set(id,fn);return id}
globalThis.cancelAnimationFrame=id=>frames.delete(id)
console.error=(...args)=>{if(!String(args[0]).includes('react-test-renderer is deprecated'))original.error(...args)}
const video={videoWidth:960,videoHeight:540,readyState:2,currentTime:0,srcObject:null,async play(){},pause(){}}
function landmarks(pose){
  const base={0:[.5,.2],11:[.4,.35],12:[.6,.35],13:[.4,.5],14:[.6,.5],15:[.4,.76],16:[.6,.76],23:[.43,.65],24:[.57,.65]}
  const shapes={A:{13:[.32,.25],14:[.68,.25],15:[.48,.15],16:[.52,.15]},B:{13:[.28,.42],14:[.72,.42],15:[.36,.32],16:[.64,.32]},C:{0:[.65,.2],11:[.55,.35],12:[.75,.35],13:[.35,.4],14:[.82,.45],15:[.45,.15],16:[.8,.6]},D:{13:[.28,.5],14:[.72,.5],15:[.43,.65],16:[.57,.65]},NEUTRAL:{13:[.32,.5],14:[.68,.5],15:[.43,.72],16:[.57,.72]}}
  const points=Array.from({length:33},()=>({x:.5,y:.5,visibility:1,presence:1}))
  for(const [id,[x,y]] of Object.entries({...base,...shapes[pose]}))points[id]={x,y,visibility:1,presence:1}
  return points
}
async function hold(pose,ms){
  for(let n=0;n<ms;n+=100){
    t+=100;video.currentTime+=.1;globalThis.cameraTest.landmarks=landmarks(pose)
    const pending=[...frames.values()];frames.clear();assert.equal(pending.length,1)
    await act(async()=>pending[0](t))
  }
}
const hit=()=>renderer.root.find(n=>n.props['aria-label']==='Lâu Đài Boss').props['data-boss-hits']
const fire=async()=>{assert.equal(globalThis.bossCameraFlow.paused,false);await act(async()=>globalThis.bossCameraFlow.done())}
const next=async()=>{await fire();await fire();await fire()}
try{
  await act(async()=>{renderer=create(React.createElement(Engine,{config,onExit(){},onComplete:r=>completed.push(r)}),{createNodeMock:n=>n.type==='video'?video:n.type==='canvas'?{getContext:()=>null}:n.type==='audio'?{play:()=>Promise.resolve(),pause(){}}:null})})
  const begin=renderer.root.findAllByType('button').find(n=>n.children.includes('Bật webcam & đấu Boss →'))
  await act(async()=>begin.props.onClick())
  assert.equal(globalThis.bossCameraFlow.camera.status,'running')
  await hold('C',1200);assert.equal(hit(),0,'Không chấm trong thinking')
  await fire();await hold('C',1100)
  assert.ok(globalThis.bossCameraFlow.key.startsWith('feedback:0:'))
  assert.equal(hit(),0,'C ở câu 1 là sai')
  await next();await hold('C',1500)
  assert.equal(globalThis.bossCameraFlow.camera.confirmed,null)
  assert.equal(hit(),0,'Giữ nguyên C không được tự chốt cho câu 2')
  assert.equal(globalThis.bossCameraFlow.paused,true,'Đồng hồ Boss phải chờ nghỉ, không chạy đến hết giờ khi bị khóa lặp')
  assert.ok(renderer.root.findAll(n=>n.type==='span').some(n=>n.children.some(c=>typeof c==='string'&&c.includes('Đồng hồ đang chờ'))))
  await hold('NEUTRAL',800)
  assert.equal(globalThis.bossCameraFlow.paused,false)
  await hold('C',1100)
  assert.ok(globalThis.bossCameraFlow.key.startsWith('feedback:1:'))
  assert.equal(hit(),1,'C sau nghỉ phải được chốt và gây 1 sát thương ở câu 2')
  await hold('C',1200);assert.equal(hit(),1,'Không chấm trùng trong feedback')
  await next();await hold('D',1100)
  assert.equal(hit(),2,'Đổi chữ D phải được chốt ở câu kế')
  await next();await hold('NEUTRAL',800);await hold('D',1100)
  assert.equal(hit(),2,'D ở câu 4 là sai, không gây sát thương')
  await next();await hold('A',1100)
  assert.ok(globalThis.bossCameraFlow.key.startsWith('feedback:4:'),'Sau sai, đổi chữ phải nhận ngay, không có khóa riêng')
  assert.equal(hit(),2,'Sai liên tiếp không gây sát thương')
  await next()
  await hold('NEUTRAL',800)
  assert.equal(globalThis.bossCameraFlow.paused,false)
  await fire() // Hết giờ thực sự sau khi đã mở lượt.
  assert.equal(hit(),2)
  await next()
  await hold('NEUTRAL',800)
  await hold(config.questions[6].answer,1100)
  assert.equal(hit(),3,'Sau sai/hết giờ, nghỉ đủ rồi đáp án đúng nhận ngay câu kế')
  await next()
  assert.deepEqual(completed,[{score:30,stars:3}])
  assert.equal(globalThis.cameraTest.streams,1);assert.equal(globalThis.cameraTest.detectors,1)
  console.log('PASS: Boss + hook thật: sau sai đổi chữ nhận ngay, cùng chữ cần nghỉ và giữ đồng hồ; sai liên tiếp/timeout không nuốt câu kế, không chấm lặp/tạo lại model.')
}finally{
  if(renderer)await act(async()=>renderer.unmount())
  if(original.navigator)Object.defineProperty(globalThis,'navigator',original.navigator);else delete globalThis.navigator
  globalThis.requestAnimationFrame=original.raf;globalThis.cancelAnimationFrame=original.cancel;globalThis.Audio=original.Audio
  globalThis.IS_REACT_ACT_ENVIRONMENT=original.act;console.error=original.error
  delete globalThis.cameraTest;delete globalThis.bossCameraFlow
}
