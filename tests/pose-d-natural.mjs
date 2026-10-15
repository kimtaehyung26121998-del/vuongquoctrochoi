import assert from 'node:assert/strict'
import {loadUrl} from './load-module.mjs'
const {classifyPose}=await import(loadUrl('src/ai/poseClassifier.ts'))
function points({width=.2,torso=.3,elbow=.65,waist=.8,mirror=false,rest=false}={}){
  const mid=.5,top=.3
  const raw={0:[mid,top-torso*.5],11:[mid-width*.5,top],12:[mid+width*.5,top],23:[mid-width*.35,top+torso],24:[mid+width*.35,top+torso],13:[mid-width*elbow,top+torso*.5],14:[mid+width*elbow,top+torso*.5],15:[mid-width*(rest?elbow*2-.5:.35),top+torso*waist],16:[mid+width*(rest?elbow*2-.5:.35),top+torso*waist]}
  const result=Array.from({length:33},()=>({x:mid,y:.5,visibility:1,presence:1}))
  for(const [id,[x,y]] of Object.entries(raw))result[id]={x:mirror?1-x:x,y,visibility:1,presence:1}
  return result
}
let total=0
for(const width of [.16,.2,.28])for(const torso of [.24,.3,.36])for(const elbow of [.60,.70,.85])for(const waist of [.65,.80])for(const mirror of [false,true]){
  assert.equal(classifyPose(points({width,torso,elbow,waist,mirror})).pose,'D','Chống hông khuỷu dang vừa: '+JSON.stringify({width,torso,elbow,waist,mirror}))
  total++
}
for(const elbow of [.52,.6,.8])for(const mirror of [false,true]){
  const rest=points({elbow,waist:1,mirror,rest:true})
  assert.equal(classifyPose(rest).pose,'NEUTRAL','Tay buông gần thẳng vẫn là NGHỈ')
}
console.log(`PASS: ${total} mẫu D chống hông khuỷu dang vừa; tay buông gần thẳng không thành D.`)
