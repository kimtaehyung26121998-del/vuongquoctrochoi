import assert from 'node:assert/strict'

// Mô phỏng callback hoàn thành của màn chơi; luật chấm được kiểm tra riêng.
export async function unlockRoute(renderer,act,count){
  for(let index=0;index<count;index++){
    const button=renderer.root.findAllByProps({className:'map-stage'})[index]
    assert.equal(button.props.disabled,false)
    await act(async()=>button.props.onClick())
    const scene=renderer.root.findAll(node=>typeof node.type==='function'&&typeof node.props.onComplete==='function')[0]
    assert.ok(scene)
    await act(async()=>{scene.props.onComplete({score:30,stars:3});scene.props.onExit()})
  }
}
