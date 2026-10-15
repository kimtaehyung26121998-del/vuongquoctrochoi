import {memo,type CSSProperties} from 'react'
import type {AdventureStageConfig} from './stages'
import type {StageState} from './stageState'
const arcs=['M170 240 Q280 153 390 124','M390 124 Q500 95 610 124','M610 124 Q720 153 830 240']
const colors=['#ff788e','#ffaf65','#ffe67b','#93e6a4','#73d9f2','#a7a2fa','#dfb0f1']
const positions=[{x:8,y:47},{x:33,y:9},{x:57,y:9},{x:79,y:47}]
function RainbowScene({state,config}:{state:StageState;config:AdventureStageConfig}){
  const count=state.results.filter(result=>result.kind==='correct').length
  const result=state.results[state.index]
  const feedback=state.phase==='feedback'
  const positive=feedback&&result?.kind==='correct'
  const previous=positions[Math.max(0,count-1)]!,current=positions[count]!
  const style={'--fly-from-x':`${previous.x}%`,'--fly-from-y':`${previous.y}%`,'--fly-x':`${current.x}%`,'--fly-y':`${current.y}%`,backgroundImage:`linear-gradient(#c4eafb28,#b3c6ff38),url('${config.background}')`} as CSSProperties
  return <div className="rainbow-scene" style={style} aria-label={`Cầu vồng đã nối ${count} trên 3 đoạn`}>
    <div className="sky-caption"><b>{config.goal}</b><span>{count} / 3 đoạn</span></div>
    <div className="sky-cloud cloud-one"/><div className="sky-cloud cloud-two"/><div className="sky-cloud cloud-three"/>
    <div className="floating-island island-start"/><div className="floating-island island-middle"/><div className="floating-island island-end"/>
    <svg className="rainbow-path" viewBox="0 0 1000 320" preserveAspectRatio="none" aria-hidden="true">
      {arcs.map((arc,index)=><g key={index} className={'rainbow-segment '+(state.results[index]?.kind==='correct'?'segment-lit':'segment-sleeping')+(positive&&index===count-1?' segment-awakening':'')}>
        {colors.map((color,n)=><path key={color} d={arc} transform={`translate(0,${n*5})`} fill="none" stroke={color} strokeWidth="6"/>)}
      </g>)}
    </svg>
    <div key={`${count}:${state.phase==='crossing'?'cross':'step'}`} className={'sky-traveler '+(positive?'sky-flying ':'')+(state.phase==='crossing'?'sky-crossing':state.phase==='finish'?'sky-finished':'')}><img src={positive||state.phase==='finish'?'/assets/mascot/owl_cheer.png':feedback&&result?.kind==='wrong'?'/assets/mascot/owl_thinking.png':'/assets/mascot/owl_happy.png'} alt="Cú mèo bay qua cầu vồng"/></div>
    <img className="sky-gem" src={config.gem} alt="Pha lê cầu vồng"/>
    <img className="sky-wand" src="/assets/items/magic_wand.png" alt=""/>
    {positive&&<div className="sky-particles" key={count} aria-hidden="true">{Array.from({length:12},(_,n)=><img key={n} style={{'--particle':n} as CSSProperties} src="/assets/ui/star.png" alt=""/>)}</div>}
    <div className="sky-dialog" role="status">{state.phase==='finish'?'Chào Đảo Kho Báu! Cảm ơn người bạn toán học của Cú!':state.phase==='crossing'?'Cầu vồng đã nối liền! Cùng bay sang đảo nào!':feedback?result?.kind==='correct'?'Phép thuật của em làm bầu trời bừng sáng!':result?.kind==='unanswered'?'Chưa nhận được đáp án. Thử lại câu này để nối cầu nhé!':'Đáp án vừa chọn chưa đúng. Thử lại câu này để nối cầu nhé!':'Ba phép toán, một chuyến bay trên những tầng mây.'}</div>
  </div>
}
export default memo(RainbowScene)
