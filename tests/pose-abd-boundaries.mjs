import assert from 'node:assert/strict'
import {loadUrl} from './load-module.mjs'
const {classifyPose}=await import(loadUrl('src/ai/poseClassifier.ts'))
function body({width=.2,torso=.3,pose='B_HIGH',mirror=false}={}){
  const top=.4,mid=.5,nose=top-torso*.5
  const raw={0:[mid,nose],11:[mid-width/2,top],12:[mid+width/2,top],23:[mid-width*.35,top+torso],24:[mid+width*.35,top+torso]}
  const shapes={
    B_HIGH:{13:[mid-width,top+torso*.08],14:[mid+width,top+torso*.08],15:[mid-width*.5,nose+torso*.02],16:[mid+width*.5,nose+torso*.02]},
    A:{13:[mid-width*.8,top-torso*.25],14:[mid+width*.8,top-torso*.25],15:[mid-width*.2,nose-torso*.25],16:[mid+width*.2,nose-torso*.25]},
    D:{13:[mid-width,top+torso*.5],14:[mid+width,top+torso*.5],15:[mid-width*.35,top+torso*.95],16:[mid+width*.35,top+torso*.95]},
    REST:{13:[mid-width*.78,top+torso*.48],14:[mid+width*.78,top+torso*.48],15:[mid-width*1.06,top+torso*.96],16:[mid+width*1.06,top+torso*.96]},
  }
  const points=Array.from({length:33},()=>({x:mid,y:top,visibility:1,presence:1}))
  for(const [id,[x,y]] of Object.entries({...raw,...shapes[pose]}))points[id]={x:mirror?1-x:x,y,visibility:1,presence:1}
  return points
}
let count=0
for(const width of [.16,.2,.28])for(const torso of [.24,.3,.36])for(const mirror of [false,true]){
  for(const [pose,expected] of [['B_HIGH','B'],['A','A'],['D','D'],['REST','NEUTRAL']]){
    assert.equal(classifyPose(body({width,torso,pose,mirror})).pose,expected,`${pose}: ${width}/${torso}/${mirror}`)
    count++
  }
}
const hidden=body({pose:'REST'});hidden[15].visibility=.1
assert.equal(classifyPose(hidden).pose,'UNKNOWN')
console.log(`PASS: ${count} mẫu B giơ hơi cao, A trên đầu, D gập khuỷu và tay buông; không đoán khi thiếu khớp.`)
