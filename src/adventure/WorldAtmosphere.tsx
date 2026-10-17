import {memo,type CSSProperties} from 'react'

/** Trang trí nhẹ bằng CSS, không đọc camera hay cập nhật state. */
export default memo(function WorldAtmosphere(){
  return <div className="world-atmosphere" aria-hidden="true">
    <div className="world-light"/>
    {Array.from({length:10},(_,index)=><i key={index} style={{'--mote':index} as CSSProperties}/>)}
    <div className="world-vignette"/>
  </div>
})
