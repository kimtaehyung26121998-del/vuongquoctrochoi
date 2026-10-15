import assert from 'node:assert/strict'
import {loadUrl} from './load-module.mjs'
const {classifyPose}=await import(loadUrl('src/ai/poseClassifier.ts'))

function sample({width=.2,torso=.3,wristLevel=-.80,spread=.9,elbowLevel=-.1,tilt=0,mirror=false}={}){
  const points=Array.from({length:33},()=>({x:.5,y:.5,visibility:1,presence:1}))
  const top=.4,mid=.5,dx=torso*tilt
  const raw={0:[mid,top-torso*.5],11:[mid-width/2,top],12:[mid+width/2,top],23:[mid+dx-width*.35,top+torso],24:[mid+dx+width*.35,top+torso],13:[mid-width,top+torso*elbowLevel],14:[mid+width,top+torso*elbowLevel],15:[mid-width*spread/2,top+torso*wristLevel],16:[mid+width*spread/2,top+torso*wristLevel]}
  for(const [id,[x,y]] of Object.entries(raw))points[id]={x:mirror?1-x:x,y,visibility:1,presence:1}
  return points
}
let total=0
for(const width of [.16,.2,.26])for(const torso of [.25,.3,.36])for(const mirror of [false,true])for(const tilt of [-.1,0,.1]){
  for(const spread of [.3,.8,1.1])for(const elbowLevel of [-.4,-.02,.08]){
    assert.equal(classifyPose(sample({width,torso,spread,elbowLevel,mirror,tilt})).pose,'A','Tay cao trên đầu, không bắt buộc cổ tay chạm sát hoặc khuỷu luôn cao hơn vai')
    total++
  }
  for(const wristLevel of [-.48,-.1,.05,.3]){
    assert.equal(classifyPose(sample({width,torso,wristLevel,spread:1,elbowLevel:.3,mirror,tilt})).pose,'B','Tay gần vai vẫn phải là B')
    total++
  }
  const transition=sample({width,torso,wristLevel:-.59,spread:1,elbowLevel:.1,mirror,tilt})
  assert.equal(classifyPose(transition).pose,'UNKNOWN','Vùng tay chuyển từ vai lên đầu không được chốt B')
  const tooWide=sample({width,torso,spread:2,mirror,tilt})
  assert.notEqual(classifyPose(tooWide).pose,'B','Tay cao nhưng quá rộng không rơi xuống B')
}
for(const id of [13,14,15,16]){
  const hidden=sample();hidden[id].visibility=.1
  assert.equal(classifyPose(hidden).pose,'UNKNOWN','Không đoán A khi mất khuỷu/cổ tay')
}
console.log(`PASS: ${total} mẫu A/B theo tỷ lệ cơ thể/phản chiếu/nghiêng nhẹ; có vùng đệm khi nâng tay, không đoán khi mất khớp.`)
