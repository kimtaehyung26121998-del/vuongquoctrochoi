import assert from 'node:assert/strict'
import {loadUrl} from './load-module.mjs'
const {classifyPose}=await import(loadUrl('src/ai/poseClassifier.ts'))
const {classifyPose:oldClassifier}=await import(loadUrl('backups/before-answer-engine-20261015_085218/src/ai/poseClassifier.ts'))
function landmarks({width=.2,torso=.3,level=.6,tilt=0}={}){
  const points=Array.from({length:33},()=>({x:.5,y:.5,visibility:1,presence:1}))
  const mid=.5,top=.3,dx=torso*tilt
  const raw={0:[mid,top-torso*.5],11:[mid-width/2,top],12:[mid+width/2,top],
    23:[mid+dx-width*.35,top+torso],24:[mid+dx+width*.35,top+torso],
    13:[mid-width*1.05,top+torso*.5],14:[mid+width*1.05,top+torso*.5],
    15:[mid+dx*level-width*.35,top+torso*level],16:[mid+dx*level+width*.35,top+torso*level]}
  for(const [id,[x,y]] of Object.entries(raw))points[id]={x,y,visibility:1,presence:1}
  return points
}
const overlap=landmarks({level:.6})
assert.equal(oldClassifier(overlap).pose,'B','Tái hiện D chống eo cao bị classifier cũ chốt B')
assert.equal(classifyPose(overlap).pose,'D')
let samples=0
for(const width of [.16,.2,.28])for(const torso of [.24,.3,.36])for(const tilt of [-.12,0,.12]){
  for(const [level,expected] of [[-.1,'B'],[.2,'B'],[.35,'B'],[.47,'UNKNOWN'],[.6,'D'],[.8,'D'],[1,'D']]){
    for(const mirror of [false,true]){
      const points=landmarks({width,torso,level,tilt}).map(p=>({...p,x:mirror?1-p.x:p.x}))
      assert.equal(classifyPose(points).pose,expected,JSON.stringify({width,torso,tilt,level,mirror}))
      samples++
    }
  }
}
const hidden=landmarks();hidden[15].visibility=.1
assert.equal(classifyPose(hidden).pose,'UNKNOWN','Thiếu cổ tay không suy đoán B/D')
// Hai tay hạ dưới hông, khuỷu hơi dang: trước đây rơi vào D trước NGHỈ.
let restSamples=0
for(const width of [.16,.2,.28])for(const torso of [.24,.3,.36])for(const level of [1.12,1.25,1.4])for(const tilt of [-.12,0,.12])for(const mirror of [false,true]){
  const points=landmarks({width,torso,level,tilt}).map(p=>({...p,x:mirror?1-p.x:p.x}))
  assert.equal(classifyPose(points).pose,'NEUTRAL','Tay dưới hông phải là nghỉ, không chốt D: '+JSON.stringify({width,torso,level,tilt,mirror}))
  restSamples++
}
for(const id of [15,16,23,24]){
  const points=landmarks({level:1.25});points[id].visibility=.1
  assert.equal(classifyPose(points).pose,'UNKNOWN','Không tự mở nghỉ khi thiếu cổ tay/hông')
}
console.log(`PASS: ${restSamples} mẫu tay hạ/khuỷu dang được nhận NGHỈ; thiếu cổ tay/hông không tự mở khóa.`)
console.log(`PASS: tái hiện D→B cũ; ${samples} mẫu B/D/vùng đệm, tỷ lệ thân/vai, nghiêng nhẹ và phản chiếu; thiếu khớp không đoán.`)
