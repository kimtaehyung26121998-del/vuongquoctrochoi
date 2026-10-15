import assert from 'node:assert/strict'
import React from 'react'
import {act,create} from 'react-test-renderer'
import {createModuleLoader} from './load-module.mjs'

const original={window:globalThis.window,Audio:globalThis.Audio,act:globalThis.IS_REACT_ACT_ENVIRONMENT,error:console.error}
const timers=new Map(),completions=[]
let nextId=0,renderer,open=false
const camera={status:'error',pose:'UNKNOWN',progress:0,confirmed:null,needsNeutral:false,message:'Mô phỏng',videoRef:React.createRef(),canvasRef:React.createRef(),start(){},stop(){},debugEnabled:false,setDebugEnabled(){}}
globalThis.forestRetryTest={camera,setOpen:value=>{open=value}}
globalThis.window={setTimeout(callback,ms){const id=++nextId;timers.set(id,{callback,ms});return id},clearTimeout:id=>timers.delete(id)}
globalThis.Audio=class{play(){return Promise.resolve()}pause(){}}
globalThis.IS_REACT_ACT_ENVIRONMENT=true
console.error=(...args)=>{if(!String(args[0]).includes('react-test-renderer is deprecated'))original.error(...args)}
const fakeCamera='data:text/javascript;base64,'+Buffer.from('export function useAnswerCamera(open){globalThis.forestRetryTest.setOpen(open);return globalThis.forestRetryTest.camera}').toString('base64')
const load=createModuleLoader({'./ai/useAnswerCamera':fakeCamera})
const {default:Forest}=await import(load('src/ForestAdventure.tsx'))
const text=node=>node.children.map(c=>typeof c==='string'?c:text(c)).join('')
const click=async label=>{
  const button=renderer.root.findAllByType('button').find(n=>text(n).includes(label))
  assert.ok(button,label);assert.ok(!button.props.disabled)
  await act(async()=>button.props.onClick())
}
const answer=async letter=>{
  const button=renderer.root.findAllByType('button').find(n=>n.props['aria-label']?.startsWith('Đáp án '+letter+':'))
  assert.ok(!button.props.disabled)
  await act(async()=>{button.props.onClick();button.props.onClick()})
}
const fire=async expectedMs=>{
  assert.equal(timers.size,1)
  const [id,timer]=[...timers][0]
  if(expectedMs!==undefined)assert.equal(timer.ms,expectedMs)
  timers.delete(id);await act(async()=>timer.callback())
}
try{
  await act(async()=>{renderer=create(React.createElement(Forest,{onExit(){},onComplete:r=>completions.push(r)}),{createNodeMock:n=>n.type==='audio'?{play:()=>Promise.resolve(),pause(){}}:null})})
  await click('Bật webcam & vào rừng');await fire(3000)
  const video=renderer.root.findByType('video')
  assert.equal(open,true)
  await answer('B');assert.equal(open,false)
  assert.ok(text(renderer.root).includes('Đáp án B chưa đúng'))
  assert.ok(!text(renderer.root).includes('38 + 20 = 58; 58 + 7 = 65.'))
  assert.equal(renderer.root.findAllByType('button').filter(n=>n.props.className?.includes('answer-correct')).length,0,'Không tô đáp án đúng khi sai')
  assert.equal(text(renderer.root.findByProps({className:'forest-score'})),'0điểm')
  assert.ok(text(renderer.root).includes('38 + 27 = ?'))
  assert.equal([...timers.values()][0].ms,1200)
  await click('Tạm dừng');assert.equal(timers.size,0)
  await click('Tiếp tục');assert.equal(timers.size,1)
  await fire();assert.equal(open,true)
  assert.equal(timers.size,0,'Mở trả lời ngay, không có 3 giây thinking giữa lượt thử lại')
  for(let retry=0;retry<3;retry++){
    await answer('B');assert.equal(open,false)
    assert.ok(text(renderer.root).includes('38 + 27 = ?'))
    assert.equal(completions.length,0)
    await fire(1200)
    assert.equal(open,true)
    assert.equal(timers.size,0,'Sai liên tiếp vẫn được mở lại cùng câu')
  }
  for(const [index,letter] of ['A','B','C'].entries()){
    await answer(letter);await fire(3200);await fire(250)
    if(index<2)await fire(3000)
  }
  assert.deepEqual(completions,[{score:30,stars:2}])
  assert.equal(renderer.root.findByType('video'),video)
  assert.equal(timers.size,0)
  console.log('PASS: Rừng sai tự thử lại sau 1,2 giây, không chờ thinking; lặp sai/pause/click trùng không tăng điểm, đủ 3 câu mới hoàn thành, video cố định.')
}finally{
  if(renderer)await act(async()=>renderer.unmount())
  globalThis.window=original.window;globalThis.Audio=original.Audio
  globalThis.IS_REACT_ACT_ENVIRONMENT=original.act;console.error=original.error
  delete globalThis.forestRetryTest
}
