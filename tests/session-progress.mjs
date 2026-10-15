import assert from 'node:assert/strict'
import React from 'react'
import {act,create} from 'react-test-renderer'
import {createModuleLoader} from './load-module.mjs'

const url=source=>'data:text/javascript;base64,'+Buffer.from(source).toString('base64')
const scene=url('export default function Scene(props){globalThis.sessionScene=props;return null}')
const load=createModuleLoader({'./ForestAdventure':scene,'./adventure/AdventureStage':scene,'./LegacyApp':scene})
const {default:App}=await import(load('src/App.tsx'))
const original={window:globalThis.window,act:globalThis.IS_REACT_ACT_ENVIRONMENT,error:console.error}
let renderer,reads=0,writes=0
globalThis.IS_REACT_ACT_ENVIRONMENT=true
console.error=(...args)=>{if(!String(args[0]).includes('react-test-renderer is deprecated'))original.error(...args)}
globalThis.window={localStorage:{
  getItem(){reads++;return JSON.stringify({version:1,completed:Object.fromEntries(['forest','rainbow','island','castle'].map(id=>[id,{score:30,stars:3}]))})},
  setItem(){writes++},
}}
const mount=async()=>{await act(async()=>{renderer=create(React.createElement(App))})}
const unmount=async()=>{await act(async()=>renderer.unmount());renderer=null}
const route=()=>renderer.root.findAllByProps({className:'map-stage'})
const check=flags=>assert.deepEqual(route().map(node=>!node.props.disabled),flags)
const enter=async index=>{assert.equal(route()[index].props.disabled,false);await act(async()=>route()[index].props.onClick());return globalThis.sessionScene}
const exit=async props=>{await act(async()=>props.onExit())}
try{
  await mount();check([true,false,false,false])
  let props=await enter(0)
  await exit(props);check([true,false,false,false]) // Thoát giữa chừng.
  props=await enter(0)
  await act(async()=>props.onComplete({score:20,stars:2}))
  await exit(props);check([true,false,false,false]) // Chưa đủ câu đúng.
  for(let index=0;index<4;index++){
    props=await enter(index)
    await act(async()=>props.onComplete({score:30,stars:3}))
    await exit(props)
    check([0,1,2,3].map(i=>i<=index+1))
  }
  // Đã hoàn thành vẫn giữ khi vào lại màn cũ rồi về bản đồ.
  await exit(await enter(0));check([true,true,true,true])
  await unmount()
  await mount();check([true,false,false,false]) // Mở lại/tải lại trang.
  const practice=renderer.root.findAllByType('button').find(node=>node.props.className==='btn secondary')
  await act(async()=>practice.props.onClick())
  assert.equal(globalThis.sessionScene.onComplete,undefined)
  await act(async()=>renderer.root.findByProps({className:'return-menu'}).props.onClick())
  check([true,false,false,false])
  await unmount()
  Object.defineProperty(globalThis.window,'localStorage',{get(){throw new Error('Storage bị chặn')}})
  await mount();check([true,false,false,false])
  props=await enter(0)
  await act(async()=>props.onComplete({score:30,stars:3}))
  await exit(props);check([true,true,false,false])
  assert.equal(reads,0);assert.equal(writes,0)
  console.log('PASS: Mỗi lượt mở trang khóa màn 2–4; đủ điểm mới mở tuần tự, giữ khi về bản đồ, mở lại reset; bỏ qua storage cũ/bị chặn, phòng luyện không mở khóa.')
}finally{
  if(renderer)await unmount()
  globalThis.window=original.window;globalThis.IS_REACT_ACT_ENVIRONMENT=original.act;console.error=original.error
  delete globalThis.sessionScene
}
