import {memo} from 'react'
import {STAGES} from '../data/questions'

/** Chỉ hiển thị hành trình; không thay đổi mở khóa hoặc tiến trình game. */
export default memo(function JourneyTrail({current}:{current:number}){
  return <div className="journey-trail" aria-label={`Hành trình: màn ${current+1} trên 4`}>
    {STAGES.map((stage,index)=><div key={stage.name} className={'journey-stop '+(index===current?'journey-current':index<current?'journey-passed':'')} aria-current={index===current?'step':undefined}>
      <img src={stage.gem} alt=""/><span>{String(index+1).padStart(2,'0')}</span>
    </div>)}
  </div>
})
