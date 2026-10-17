import assert from 'node:assert/strict'
import fs from 'node:fs'
import React from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import postcss from 'postcss'
import {loadUrl} from './load-module.mjs'

const render=(Component,props)=>renderToStaticMarkup(React.createElement(Component,props))
const {default:App}=await import(loadUrl('src/App.tsx'))
const {default:Forest}=await import(loadUrl('src/ForestAdventure.tsx'))
const {initialForest}=await import(loadUrl('src/forestState.ts'))
const {initialStage}=await import(loadUrl('src/adventure/stageState.ts'))
const {default:Stage}=await import(loadUrl('src/adventure/AdventureStage.tsx'))
const {ADVENTURE_STAGES}=await import(loadUrl('src/adventure/stages.ts'))
const {default:Journey}=await import(loadUrl('src/adventure/JourneyTrail.tsx'))

for(let current=0;current<4;current++){
  const html=render(Journey,{current})
  assert.equal((html.match(/aria-current="step"/g)||[]).length,1)
  assert.equal((html.match(/class="journey-stop journey-passed"/g)||[]).length,current)
  assert.equal((html.match(/<img/g)||[]).length,4)
}
const map=render(App,{})
assert.equal((map.match(/class="map-stage"/g)||[]).length,4)
assert.equal((map.match(/disabled=""/g)||[]).length,3,'Mỹ thuật mới không mở khóa màn')
assert.ok(map.includes('0 / 4 pha lê'))
for(const world of ['forest','sky','island','castle']){
  assert.ok(map.includes(`/assets/worlds/${world}.svg`))
  const art=fs.readFileSync(`public/assets/worlds/${world}.svg`,'utf8')
  assert.ok(art.startsWith('<svg')&&art.includes('viewBox="0 0 1600 800"'))
  assert.ok(!/<script|<foreignObject|https?:\/\//.test(art.replace('http://www.w3.org/2000/svg','')),'Cảnh chỉ chứa vector nội bộ')
}

const forestSnapshot={...initialForest}
const stageSnapshot={...initialStage}
try{
  // Dựng component thật ở các pha; không khởi động hoặc ghi hình camera.
  for(const phase of ['intro','thinking','answering','feedback','next','finish']){
    Object.assign(initialForest,forestSnapshot,{phase,selected:phase==='feedback'?'B':null})
    const html=render(Forest,{onExit(){}})
    assert.ok(html.includes('data-stage="forest"')&&html.includes(`data-phase="${phase}"`))
    assert.equal((html.match(/<video/g)||[]).length,1)
    assert.equal((html.match(/<canvas/g)||[]).length,1)
    assert.ok(html.includes('class="world-atmosphere" aria-hidden="true"'))
    if(phase==='answering'){
      assert.equal((html.match(/aria-label="Đáp án [ABCD]:/g)||[]).length,4)
      assert.equal((html.match(/<button[^>]*class="forest-answer [^"]*"[^>]*disabled/g)||[]).length,0)
    }
  }
  for(const config of ADVENTURE_STAGES.slice(1)){
    for(const phase of ['intro','thinking','answering','feedback','crossing','finish']){
      const correct=phase==='feedback'
      const results=correct?[{kind:'correct',choice:config.questions[0].answer,source:'manual'}]:[]
      Object.assign(initialStage,stageSnapshot,{phase,index:0,results,bossAttempts:[]})
      const html=render(Stage,{config,onExit(){},onComplete(){}})
      assert.ok(html.includes(`data-stage="${config.id}"`))
      assert.equal((html.match(/<video/g)||[]).length,1)
      assert.equal((html.match(/<canvas/g)||[]).length,1)
      assert.ok(html.includes('class="world-atmosphere" aria-hidden="true"'))
      if(config.id==='rainbow')assert.ok(!/angel|Thiên thần|thiên thần/.test(html))
      if(phase==='answering')assert.equal((html.match(/aria-label="Đáp án [ABCD]:/g)||[]).length,4)
    }
  }
}finally{
  Object.assign(initialForest,forestSnapshot)
  Object.assign(initialStage,stageSnapshot)
}

const css=fs.readFileSync('src/crystal-kingdom.css','utf8')
const stylesheet=postcss.parse(css)
const assets=new Set()
stylesheet.walkDecls(decl=>{
  for(const match of decl.value.matchAll(/url\(['"]?([^)'" ]+)/g))assets.add(match[1])
})
for(const asset of assets)assert.ok(fs.existsSync('public'+asset),asset)
assert.ok(!/url\(['"]?https?:/.test(css),'Không tải ảnh hoặc font bên ngoài khi chơi')
let reducedMotion=false
stylesheet.walkAtRules('media',rule=>{if(rule.params.includes('prefers-reduced-motion'))reducedMotion=true})
assert.ok(reducedMotion)
assert.ok(css.includes('pointer-events:none'),'Lớp trang trí không bắt thao tác')
function luminance(hex){
  const rgb=hex.match(/[a-f\d]{2}/gi).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4)
  return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722
}
function contrast(a,b){const [high,low]=[luminance(a),luminance(b)].sort((a,b)=>b-a);return (high+.05)/(low+.05)}
for(const badge of ['#c85879','#9c752c','#4074b2','#31816b'])assert.ok(contrast('#ffffff',badge)>=3,'Chữ lớn trên huy hiệu đủ tương phản')
assert.ok(contrast('#c1d3df','#263f55')>=4.5,'Hướng dẫn webcam đủ tương phản')
console.log('PASS: giao diện 4 màn/24 pha, một video/canvas mỗi màn, 4 lựa chọn, mở khóa giữ nguyên, vector nội bộ, CSS hợp lệ, giảm chuyển động và tương phản.')
