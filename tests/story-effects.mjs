import assert from 'node:assert/strict'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {loadUrl} from './load-module.mjs'

const {default:Rainbow}=await import(loadUrl('src/adventure/RainbowScene.tsx'))
const {RAINBOW_STAGE}=await import(loadUrl('src/adventure/stages.ts'))
const {default:Treasure}=await import(loadUrl('src/stages/treasure/TreasureIslandScene.tsx'))
const render=(Component,props)=>renderToStaticMarkup(React.createElement(Component,props))
const base={phase:'answering',index:0,results:[],paused:false,cameraCorrections:0}
let html=render(Rainbow,{state:base,config:RAINBOW_STAGE})
assert.ok(!/angel|Thiên thần|thiên thần/.test(html))
assert.ok(!html.includes('angel-magic-trail'))
assert.ok(html.includes('alt="Robot qua cầu vồng"'),'Robot vẫn là người đi qua cầu')
assert.ok(!html.includes('sky-helper'))
for(const kind of ['correct','wrong','unanswered']){
  html=render(Rainbow,{state:{...base,phase:'feedback',results:[{kind,choice:kind==='unanswered'?null:'A',source:'manual'}]},config:RAINBOW_STAGE})
  assert.ok(!/angel|Thiên thần|thiên thần/.test(html))
  assert.equal(html.includes('segment-awakening'),kind==='correct')
  assert.equal(html.includes('sky-particles'),kind==='correct')
}
const outcome=(round,isCorrect=true)=>({questionId:'test'+round,round,isCorrect,choice:'A'})
for(const round of [0,1,2]){
  const previous=Array.from({length:round},(_,n)=>outcome(n))
  html=render(Treasure,{round,phase:'feedback',outcomes:[...previous,outcome(round)],compact:true})
  assert.equal(html.includes('work-robot--shovel'),round<2)
  assert.equal(html.includes('dug-reward'),round<2)
  assert.equal(html.includes('held-key'),round>=1)
  assert.equal(html.includes('robot-unlocking'),round===2)
  assert.equal(html.includes('opening-chest-cover'),round===2)
  const wrong=render(Treasure,{round,phase:'feedback',outcomes:[...previous,outcome(round,false)],compact:true})
  assert.ok(!wrong.includes('work-robot--shovel')&&!wrong.includes('robot-unlocking')&&!wrong.includes('dug-reward'))
}
html=render(Treasure,{round:2,phase:'answering',outcomes:[outcome(0),outcome(1)],compact:true})
assert.ok(html.includes('held-key'),'Câu 3 robot giữ chìa khóa đã đào ở câu 2')
assert.ok(!html.includes('chest_open.png'),'Chưa đúng câu 3 thì rương còn đóng')
console.log('PASS: Rainbow without angel; correct-answer effects and treasure animations preserved.')
