import {useCallback,useRef,useState} from 'react'
import LegacyApp from './LegacyApp'
import ForestAdventure from './ForestAdventure'
import AdventureStage from './adventure/AdventureStage'
import {ADVENTURE_STAGES,getStage,RAINBOW_STAGE,type StageId} from './adventure/stages'
import {completeStage,emptyProgress,isUnlocked,readProgress,writeProgress,type StageResult} from './adventure/stageProgress'
import './forest.css'
import './adventure/rainbow.css'

function loadLocalProgress(){
  if(typeof window==='undefined')return {progress:emptyProgress(),saved:true}
  try{return readProgress(window.localStorage)}catch{return {progress:emptyProgress(),saved:false}}
}
export default function App(){
  const [mode,setMode]=useState<'map'|'forest'|'rainbow'|'legacy'>('map')
  const [stored,setStored]=useState(loadLocalProgress)
  const [preview,setPreview]=useState<StageId|null>(null)
  const progressRef=useRef(stored.progress);progressRef.current=stored.progress
  const saveCompletion=useCallback((id:StageId,result:StageResult)=>{
    const progress=completeStage(progressRef.current,id,result)
    if(progress===progressRef.current)return
    progressRef.current=progress
    let saved=false
    try{saved=writeProgress(window.localStorage,progress)}catch{/* Vẫn chơi được trong phiên này. */}
    setStored({progress,saved})
  },[])
  const finishForest=useCallback((result:StageResult)=>saveCompletion('forest',result),[saveCompletion])
  const finishRainbow=useCallback((result:StageResult)=>saveCompletion('rainbow',result),[saveCompletion])
  const toMap=useCallback(()=>setMode('map'),[])
  if(mode==='forest')return <ForestAdventure onExit={toMap} onComplete={finishForest}/>
  if(mode==='rainbow'&&isUnlocked(stored.progress,'rainbow'))return <AdventureStage config={RAINBOW_STAGE} onExit={toMap} onComplete={finishRainbow}/>
  if(mode==='legacy')return <><button className="return-menu" onClick={toMap}>← Bản đồ phiêu lưu</button><LegacyApp/></>
  return <main className="world-map">
    <header className="map-header"><div><span>VƯƠNG QUỐC TOÁN HỌC</span><h1>Bản đồ phiêu lưu</h1><p>Từ khu rừng xanh đến lâu đài phép thuật. Mỗi hành trình mở ra một vùng đất mới.</p></div><img src="/assets/mascot/owl_cheer.png" alt="Cú mèo dẫn đường"/></header>
    <ol className="world-route">{ADVENTURE_STAGES.map(stage=>{
      const unlocked=isUnlocked(stored.progress,stage.id),result=stored.progress.completed[stage.id]
      const status=!unlocked?'Đang khóa':result?'Đã hoàn thành':stage.ready?'Sẵn sàng khám phá':'Đã mở khóa · Đang chuẩn bị'
      return <li key={stage.id} className={(unlocked?'unlocked ':'locked ')+(result?'completed':'')}><button className="map-stage" disabled={!unlocked} onClick={()=>{setPreview(null);if(stage.id==='forest'||stage.id==='rainbow')setMode(stage.id);else setPreview(stage.id)}} aria-label={`${stage.number}. ${stage.title}. ${status}`}>
        <div className="map-stage-picture"><img src={stage.background} alt=""/><span className="map-number">{String(stage.number).padStart(2,'0')}</span><img className="map-gem" src={stage.gem} alt=""/></div>
        <div className="map-stage-copy"><small>{status}</small><h2>{stage.title}</h2>{result?<p>{result.score} điểm · {result.stars}/3 sao <span aria-hidden="true">★</span></p>:<p>{unlocked?stage.ready?'3 phép toán đang chờ em →':'Vùng đất tiếp theo trong hành trình':'Hoàn thành màn trước để mở khóa'}</p>}</div>
      </button></li>
    })}</ol>
    {preview&&<section className="map-preview" aria-label="Thông tin màn tiếp theo"><img src={getStage(preview).gem} alt=""/><div><h2>{getStage(preview).title} đã mở khóa!</h2><p>Nội dung phiêu lưu của vùng đất này đang được chuẩn bị. Em có thể chơi lại hai màn đầu để luyện thêm.</p></div><button className="btn secondary" onClick={()=>setPreview(null)}>Đóng</button></section>}
    <footer className="map-footer"><button className="btn secondary" onClick={()=>setMode('legacy')}>Luyện webcam & kiểm thử 12 câu cũ</button><p>Tiến trình được lưu trên trình duyệt này. Một học sinh mỗi lượt.<br/>Camera xử lý tại máy, không ghi hoặc gửi video lên máy chủ.</p>{!stored.saved&&<p className="storage-warning" role="status">Trình duyệt đang chặn lưu cục bộ. Tiến trình chỉ được giữ trong phiên đang mở.</p>}</footer>
  </main>
}
