import {useCallback,useRef,useState} from 'react'
import LegacyApp from './LegacyApp'
import ForestAdventure from './ForestAdventure'
import AdventureStage from './adventure/AdventureStage'
import {createQuestionDeck} from './data/arithmeticBank'
import type {StageIndex} from './data/questions'
import {ADVENTURE_STAGES,RAINBOW_STAGE,TREASURE_STAGE,BOSS_STAGE,type StageId} from './adventure/stages'
import {completeStage,emptyProgress,isUnlocked,type StageResult} from './adventure/stageProgress'
import './forest.css'
import './adventure/rainbow.css'

export default function App(){
  const [mode,setMode]=useState<'map'|'forest'|'rainbow'|'island'|'castle'|'legacy'>('map')
  const [progress,setProgress]=useState(emptyProgress)
  const questionDeck=useRef<ReturnType<typeof createQuestionDeck>|null>(null)
  if(!questionDeck.current)questionDeck.current=createQuestionDeck()
  const drawForest=useCallback(()=>questionDeck.current!.draw(0,3),[])
  const drawRainbow=useCallback(()=>questionDeck.current!.draw(1,3),[])
  const drawIsland=useCallback(()=>questionDeck.current!.draw(2,3),[])
  const drawBoss=useCallback(()=>questionDeck.current!.draw(3,9),[])
  const drawPractice=useCallback(()=>questionDeck.current!.draw(0,12).map((question,index)=>({...question,stage:Math.floor(index/3) as StageIndex})),[])
  const progressRef=useRef(progress);progressRef.current=progress
  const saveCompletion=useCallback((id:StageId,result:StageResult)=>{
    const progress=completeStage(progressRef.current,id,result)
    if(progress===progressRef.current)return
    progressRef.current=progress
    setProgress(progress)
  },[])
  const finishForest=useCallback((result:StageResult)=>saveCompletion('forest',result),[saveCompletion])
  const finishRainbow=useCallback((result:StageResult)=>saveCompletion('rainbow',result),[saveCompletion])
  const finishTreasure=useCallback((result:StageResult)=>saveCompletion('island',result),[saveCompletion])
  const finishBoss=useCallback((result:StageResult)=>saveCompletion('castle',result),[saveCompletion])
  const toMap=useCallback(()=>setMode('map'),[])
  if(mode==='forest')return <ForestAdventure onExit={toMap} onComplete={finishForest} questionFactory={drawForest}/>
  if(mode==='rainbow'&&isUnlocked(progress,'rainbow'))return <AdventureStage config={RAINBOW_STAGE} onExit={toMap} onComplete={finishRainbow} questionFactory={drawRainbow}/>
  if(mode==='island'&&isUnlocked(progress,'island'))return <AdventureStage config={TREASURE_STAGE} onExit={toMap} onComplete={finishTreasure} questionFactory={drawIsland}/>
  if(mode==='castle'&&isUnlocked(progress,'castle'))return <AdventureStage config={BOSS_STAGE} onExit={toMap} onComplete={finishBoss} questionFactory={drawBoss}/>
  if(mode==='legacy')return <><button className="return-menu" onClick={toMap}>← Bản đồ phiêu lưu</button><LegacyApp questionFactory={drawPractice}/></>
  return <main className="world-map">
    <header className="map-header"><div><span>VƯƠNG QUỐC TOÁN HỌC</span><h1>Bản đồ phiêu lưu</h1><p>Từ khu rừng xanh đến lâu đài phép thuật. Mỗi hành trình mở ra một vùng đất mới.</p></div><img src="/assets/mascot/robot_guide.png" alt="Robot dẫn đường"/></header>
    <ol className="world-route">{ADVENTURE_STAGES.map(stage=>{
      const unlocked=isUnlocked(progress,stage.id),result=progress.completed[stage.id]
      const status=!unlocked?'Đang khóa':result?'Đã hoàn thành':stage.ready?'Sẵn sàng khám phá':'Đã mở khóa · Đang chuẩn bị'
      return <li key={stage.id} className={(unlocked?'unlocked ':'locked ')+(result?'completed':'')}><button className="map-stage" disabled={!unlocked} onClick={()=>setMode(stage.id)} aria-label={`${stage.number}. ${stage.title}. ${status}`}>
        <div className="map-stage-picture"><img src={stage.background} alt=""/><span className="map-number">{String(stage.number).padStart(2,'0')}</span><img className="map-gem" src={stage.gem} alt=""/></div>
        <div className="map-stage-copy"><small>{status}</small><h2>{stage.title}</h2>{result?<p>{result.score} điểm · {result.stars}/3 sao <span aria-hidden="true">★</span></p>:<p>{unlocked?stage.id==='castle'?'Phá 3 lớp khiên phép thuật →':'3 phép toán đang chờ em →':'Hoàn thành màn trước để mở khóa'}</p>}</div>
      </button></li>
    })}</ol>
    <footer className="map-footer"><button className="btn secondary" onClick={()=>setMode('legacy')}>Luyện webcam & kiểm thử 12 câu ngẫu nhiên</button><p>50 câu cộng không nhớ, trừ không mượn. Mỗi lượt rút câu ngẫu nhiên.<br/>Mỗi lần vào hoặc tải lại trang, bắt đầu từ màn Rừng. Hoàn thành màn trước để mở màn sau.<br/>Camera không ghi hoặc gửi video lên máy chủ.</p></footer>
  </main>
}
