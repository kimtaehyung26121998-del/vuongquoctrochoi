import type {CSSProperties} from 'react'

export function WorkRobot({kind}:{kind:'hammer'|'shovel'}){
  return <div className={`work-robot work-robot--${kind}`} role="img" aria-label={kind==='hammer'?'Robot nâng búa và đóng đinh dựng cầu':'Robot cầm xẻng đào đất bằng hai tay'}>
    {[0,1,2,3].map(frame=><img key={frame} className={`work-frame work-frame--${frame}`} src={`/assets/mascot/robot_${kind}_${frame}.png`} alt="" aria-hidden="true" style={{'--frame':frame} as CSSProperties}/>)}
  </div>
}

export function WorkDust(){
  return <div className="work-dust" aria-hidden="true">{Array.from({length:9},(_,n)=><i key={n} style={{'--dust':n} as CSSProperties}/>)}</div>
}
