import assert from 'node:assert/strict'
import path from 'node:path'
import {pathToFileURL} from 'node:url'
import React from 'react'
import {act,create} from 'react-test-renderer'
import {createModuleLoader} from './load-module.mjs'

const url=s=>'data:text/javascript;base64,'+Buffer.from(s).toString('base64')
const real=createModuleLoader({'@mediapipe/tasks-vision':pathToFileURL(path.resolve('tests/mock-vision.mjs')).href})
const camera=url(`import {useLayoutEffect} from '${import.meta.resolve('react')}';import {useAnswerCamera as real} from '${real('src/ai/useAnswerCamera.ts')}';export function useAnswerCamera(open,onAnswer){const camera=real(open,event=>{if(!globalThis.delivery.inFrame)throw new Error('Đáp án phải được chuyển trong cùng RAF');globalThis.delivery.events.push(event);onAnswer(event)});useLayoutEffect(()=>{if(open)globalThis.delivery.frame()},[open]);return camera}`)
const load=createModuleLoader({
  './ai/useAnswerCamera':camera,'../ai/useAnswerCamera':camera,
  './useStageClock':url('export function useStageClock(key,duration,paused,done){Object.assign(globalThis.delivery,{key,paused,done});return Math.ceil((duration??0)/1000)}'),
})
const {default:Forest}=await import(load('src/ForestAdventure.tsx'))
const {default:Engine}=await import(load('src/adventure/AdventureStage.tsx'))
const {RAINBOW_STAGE,TREASURE_STAGE,BOSS_STAGE}=await import(load('src/adventure/stages.ts'))
const {FOREST_QUESTIONS}=await import(load('src/forestState.ts'))
const original={window:globalThis.window,navigator:Object.getOwnPropertyDescriptor(globalThis,'navigator'),raf:globalThis.requestAnimationFrame,cancel:globalThis.cancelAnimationFrame,Audio:globalThis.Audio,act:globalThis.IS_REACT_ACT_ENVIRONMENT,error:console.error}
let renderer,t=0,frameId=0,timerId=0,edgePose='A'
const frames=new Map(),timers=new Map()
const video={videoWidth:960,videoHeight:540,readyState:2,currentTime:0,async play(){},pause(){}}
function landmarks(pose){
  const base={0:[.5,.2],11:[.4,.35],12:[.6,.35],13:[.4,.5],14:[.6,.5],15:[.4,.76],16:[.6,.76],23:[.43,.65],24:[.57,.65]}
  const shapes={A:{13:[.32,.25],14:[.68,.25],15:[.48,.15],16:[.52,.15]},B:{13:[.28,.42],14:[.72,.42],15:[.36,.32],16:[.64,.32]},C:{0:[.65,.2],11:[.55,.35],12:[.75,.35],13:[.35,.4],14:[.82,.45],15:[.45,.15],16:[.8,.6]},D:{13:[.28,.5],14:[.72,.5],15:[.43,.65],16:[.57,.65]},NEUTRAL:{13:[.32,.5],14:[.68,.5],15:[.43,.72],16:[.57,.72]}}
  const points=Array.from({length:33},()=>({x:.5,y:.5,visibility:1,presence:1}))
  for(const [id,[x,y]] of Object.entries({...base,...shapes[pose]}))points[id]={x,y,visibility:1,presence:1}
  return points
}
function frame(pose=edgePose){
  if(!frames.size)return
  t+=100;video.currentTime+=.1;globalThis.cameraTest.landmarks=landmarks(pose)
  const pending=[...frames.values()];frames.clear();assert.equal(pending.length,1)
  const before=globalThis.delivery.events.length
  globalThis.delivery.inFrame=true
  pending[0](t)
  globalThis.delivery.inFrame=false
  // Timeout tới ngay sau khung hình chốt, trước khi React render feedback.
  // Đáp án đã nhận phải thắng, không bị thay bằng kết quả hết giờ.
  if(globalThis.delivery.events.length>before&&globalThis.delivery.key?.startsWith('answering:'))globalThis.delivery.done()
}
async function hold(pose,ms){for(let n=0;n<ms;n+=100)await act(async()=>frame(pose))}
const text=node=>node.children.map(c=>typeof c==='string'?c:text(c)).join('')
globalThis.IS_REACT_ACT_ENVIRONMENT=true
globalThis.Audio=class{play(){return Promise.resolve()}pause(){}}
globalThis.window={setTimeout(fn,ms){const id=++timerId;timers.set(id,{fn,ms});return id},clearTimeout:id=>timers.delete(id)}
globalThis.requestAnimationFrame=fn=>{const id=++frameId;frames.set(id,fn);return id}
globalThis.cancelAnimationFrame=id=>frames.delete(id)
Object.defineProperty(globalThis,'navigator',{configurable:true,value:{mediaDevices:{async getUserMedia(){globalThis.cameraTest.streams++;return {getTracks:()=>[{stop(){globalThis.cameraTest.stops++}}]}}}}})
console.error=(...args)=>{if(!String(args[0]).includes('react-test-renderer is deprecated'))original.error(...args)}
try{
  for(const config of [null,RAINBOW_STAGE,TREASURE_STAGE,BOSS_STAGE]){
   for(const retry of [false,true]){
    const questions=config?.questions??FOREST_QUESTIONS,completed=[]
    edgePose=questions[0].answer
    globalThis.delivery={frame:()=>frame(),events:[]}
    globalThis.cameraTest={streams:0,stops:0,resolvers:0,detectors:0,closes:0,inferences:0,landmarks:undefined}
    const scene=React.createElement(config?Engine:Forest,{...(config?{config}:{}),onExit(){},onComplete:r=>completed.push(r)})
    await act(async()=>{renderer=create(React.createElement(React.StrictMode,null,scene),{createNodeMock:n=>n.type==='video'?video:n.type==='canvas'?{getContext:()=>null}:n.type==='audio'?{play:()=>Promise.resolve(),pause(){}}:null})})
    const start=renderer.root.findAllByType('button').find(n=>text(n).includes('Bật webcam &'))
    await act(async()=>start.props.onClick())
    const fire=async()=>{
      if(config){assert.equal(globalThis.delivery.paused,false);await act(async()=>globalThis.delivery.done())}
      else {assert.equal(timers.size,1);const [id,timer]=[...timers][0];timers.delete(id);await act(async()=>timer.fn())}
    }
    await fire()
    let first=0
    if(retry){
      let last
      for(let attempt=0;attempt<2;attempt++){
        const index=config?.id==='castle'?attempt:0
        const wrong=['A','B','C','D'].find(letter=>letter!==questions[index].answer&&letter!==last)
        await hold(wrong,1100);last=wrong
        assert.equal(text(renderer.root.findByProps({className:'forest-score'})),'0điểm','Sai không cộng điểm')
        assert.ok(renderer.root.findAllByType('button').some(n=>n.props.className?.includes('answer-retry')),'Đáp án sai phải vào feedback ngay')
        await hold(wrong,1200)
        assert.equal(globalThis.delivery.events.length,attempt+1,'Giữ dáng trong feedback không chốt lặp')
        if(attempt===1)await hold('NEUTRAL',800)
        await fire()
        if(config?.id==='castle')await fire()
        if(config)await fire()
      }
      if(config?.id==='castle')first=2
    }
    for(let index=0;index<3;index++){
      await hold(questions[first+index].answer,1100)
      assert.equal(text(renderer.root.findByProps({className:'forest-score'})),`${(index+1)*10}điểm`,`${config?.id??'forest'} nhận câu ${index+1}`)
      assert.ok(text(renderer.root).includes('Chính xác!'))
      await hold('NEUTRAL',800)
      await fire();await fire()
      if(index<2){
        edgePose=questions[first+index+1].answer
        await hold(edgePose,1500) // Giữ sớm trong thinking, rồi RAF đến ngay khi mở lượt.
      }
      if(index<2||config)await fire()
    }
    assert.equal(completed.length,1)
    assert.equal(completed[0].score,30)
    assert.equal(globalThis.delivery.events.length,retry?5:3,'Mỗi lần chốt chuyển thẳng tới engine đúng một lần')
    assert.equal(globalThis.cameraTest.streams,1)
    assert.equal(globalThis.cameraTest.detectors,1)
    await act(async()=>renderer.unmount());renderer=null
    assert.equal(frames.size,0);assert.equal(timers.size,0)
    console.log(`PASS: ${config?.id??'forest'} ${retry?'sai liên tiếp rồi đúng':'đúng liên tiếp'}: StrictMode, callback cùng RAF, nhận đủ 3 câu, không chấm trùng, một camera/model.`)
   }
  }
}finally{
  if(renderer)await act(async()=>renderer.unmount())
  globalThis.window=original.window;globalThis.Audio=original.Audio;globalThis.requestAnimationFrame=original.raf;globalThis.cancelAnimationFrame=original.cancel
  if(original.navigator)Object.defineProperty(globalThis,'navigator',original.navigator);else delete globalThis.navigator
  globalThis.IS_REACT_ACT_ENVIRONMENT=original.act;console.error=original.error
  delete globalThis.cameraTest;delete globalThis.delivery
}
