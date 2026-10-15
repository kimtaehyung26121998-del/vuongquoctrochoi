import {useCallback,useEffect,useMemo,useReducer,useRef,useState} from 'react'
import {usePoseCamera} from '../ai/usePoseCamera'
import {POSE_NAMES} from '../ai/poseClassifier'
import type {Choice} from '../data/questions'
import type {AdventureStageConfig} from './stages'
import type {StageResult} from './stageProgress'
import {createStageReducer,initialStage,stageScore} from './stageState'
import {useStageClock} from './useStageClock'
import {useStageAudio} from './useStageAudio'
import RainbowScene from './RainbowScene'
const LETTERS=['A','B','C','D'] as const
const SCENES={rainbow:RainbowScene}
export default function AdventureStage({config,onExit,onComplete}:{config:AdventureStageConfig;onExit:()=>void;onComplete:(result:StageResult)=>void}){
  const reducer=useMemo(()=>createStageReducer(config),[config])
  const [state,dispatch]=useReducer(reducer,initialStage)
  const [muted,setMuted]=useState(false)
  const [skipMotion,setSkipMotion]=useState(false)
  const stateRef=useRef(state);stateRef.current=state
  const lastHandled=useRef(0),submitted=useRef(false),notified=useRef(false)
  const answering=state.phase==='answering'&&!state.paused
  // Không sửa thuật toán AI. false dùng khóa nghỉ có sẵn, yêu cầu hạ tay 500ms
  // mỗi lần mở lượt trả lời; video/canvas luôn giữ nguyên DOM qua mọi pha.
  const camera=usePoseCamera(answering,false)
  const {music,play,startMusic}=useStageAudio(muted,state.paused,state.phase!=='intro'&&state.phase!=='finish')
  const question=config.questions[state.index]!
  const result=state.results[state.index]
  const score=stageScore(state),stars=score/10
  const finished=state.phase==='finish'
  const Scene=SCENES[config.scene as keyof typeof SCENES]

  useEffect(()=>{if(state.phase==='answering')submitted.current=false},[state.phase,state.index])
  const settle=useCallback((choice:Choice|null,source:'webcam'|'manual'|'timeout')=>{
    const current=stateRef.current
    if(current.phase!=='answering'||current.paused||submitted.current)return
    submitted.current=true
    if(choice===null)dispatch({type:'TIMEOUT',index:current.index})
    else dispatch({type:'ANSWER',choice,source:source==='webcam'?'webcam':'manual',index:current.index})
    const correct=choice===config.questions[current.index]!.answer
    play(correct?'quiz/answer_correct.wav':choice===null?'quiz/time_up.wav':'quiz/answer_wrong_gentle.wav')
    if(correct)play('adventure/portal_open.wav')
  },[config,play])
  useEffect(()=>{
    const event=camera.confirmed
    if(!event||event.id===lastHandled.current)return
    lastHandled.current=event.id
    if(answering)settle(event.pose,'webcam')
  },[camera.confirmed,answering,settle])
  const duration=state.phase==='thinking'?3000:state.phase==='answering'?config.answerMs:state.phase==='feedback'?7000:state.phase==='next'?250:state.phase==='crossing'?2600:null
  // Bỏ chuyển động không bỏ mất thời gian đọc lời giải cho câu sai/hết giờ.
  const motionPhase=state.phase==='next'||state.phase==='crossing'||(state.phase==='feedback'&&result?.kind==='correct')
  const seconds=useStageClock(`${state.phase}:${state.index}:${state.cameraCorrections}`,skipMotion&&motionPhase?0:duration,state.paused||(state.phase==='answering'&&camera.status==='loading'),()=>{
    if(state.phase==='answering')settle(null,'timeout')
    else dispatch({type:state.phase==='thinking'?'READY':'ADVANCE'})
  })
  useEffect(()=>{
    if(!finished||notified.current)return
    notified.current=true;camera.stop();play('rewards/level_complete.wav');onComplete({score,stars})
  },[finished,score,stars,camera.stop,play,onComplete])
  const begin=()=>{
    notified.current=false;submitted.current=false;dispatch({type:finished?'REPLAY':'START'})
    startMusic();play('ui/ui_start.wav')
    if(camera.status!=='running'&&camera.status!=='loading')void camera.start()
  }
  return <main className={'forest-app rainbow-app '+(state.paused?'rainbow-paused ':'')+(skipMotion?'rainbow-skip':'')}>
    <audio ref={music} src={config.music} loop preload="none"/>
    <header className="forest-header"><button className="forest-back" onClick={onExit}>← Bản đồ</button><div><span className="forest-eyebrow">VƯƠNG QUỐC TOÁN HỌC · MÀN {config.number}</span><h1>{config.title}</h1></div><div className="forest-score"><img src="/assets/ui/star.png" alt=""/>{score}<small>điểm</small></div><button className="forest-back" onClick={()=>setMuted(v=>!v)}>{muted?'Bật tiếng':'Tắt tiếng'}</button></header>
    <div className="forest-layout"><section className="forest-main">
      {Scene&&<Scene state={state} config={config}/>}
      <section className="forest-question rainbow-question">
        {state.phase==='intro'?<div className="forest-intro"><span className="forest-eyebrow">CHUYẾN BAY TRÊN MÂY</span><h2>Đánh thức ba sắc cầu vồng</h2><p>{config.intro}</p><p className="rainbow-instructions">Mỗi câu có {config.answerMs/1000} giây. Đúng +10 điểm và 1 sao. Sai hoặc hết giờ vẫn được đi tiếp. Hạ tay nghỉ 0,5 giây rồi giữ dáng 1 giây để chọn.</p><button className="btn primary" onClick={begin}>Bật webcam & cất cánh →</button></div>
        :finished?<div className="forest-finish"><img src="/assets/items/trophy.png" alt="Cúp hoàn thành"/><div><span className="forest-eyebrow">HOÀN THÀNH MÀN {config.number}</span><h2>Cầu vồng đã nối liền!</h2><div className="rainbow-result-stars" aria-label={`${stars} trên 3 sao`}>{[0,1,2].map(n=><img key={n} src="/assets/ui/star.png" className={n<stars?'':'unearned'} alt={n<stars?'Sao đạt được':'Sao chưa đạt'}/>)}</div><p><b>{score} điểm · {stars}/3 sao</b> · Đã mở khóa Đảo Kho Báu</p><p>{config.completeText}</p><button className="btn primary" onClick={onExit}>Xem Đảo Kho Báu →</button> <button className="btn secondary" onClick={begin}>Chơi lại</button></div></div>
        :<><div className="forest-question-meta"><span>CÂU {state.index+1} / {config.questions.length}</span><span>{state.paused?'Đang tạm dừng':state.phase==='thinking'?'Suy nghĩ trước khi tạo dáng':answering?`Còn ${seconds} giây`:state.phase==='crossing'?'Cú đang bay sang đảo':'Cùng khám phá lời giải'}</span></div>
          <h2>{question.prompt}</h2>
          <div className="forest-answers">{LETTERS.map(letter=><button key={letter} className={'forest-answer '+(answering&&camera.pose===letter?'pose-active ':'')+(state.phase==='feedback'&&question.answer===letter?'answer-correct ':'')+(state.phase==='feedback'&&result?.kind==='wrong'&&result.choice===letter?'answer-retry':'')} disabled={!answering} onClick={()=>settle(letter,'manual')} aria-label={`Đáp án ${letter}: ${question.choices[letter]}`}><b>{letter}</b><span>{question.choices[letter]}</span><img src={`/assets/characters/pose_${letter.toLowerCase()}.png`} alt=""/></button>)}</div>
          <div className="forest-feedback rainbow-feedback" role="status">
            {state.phase==='feedback'?<><strong>{result?.kind==='correct'?'Chính xác! +10 điểm, +1 sao.':result?.kind==='unanswered'?'Chưa ghi nhận đáp án. Cú nối cầu giúp em; không kết luận em làm sai toán.':'Mình xem cách giải nhé! Cầu vẫn được nối, không cộng điểm.'}</strong><span>{question.explanation}</span><div className="rainbow-feedback-actions">{result?.source==='webcam'&&result.kind==='wrong'&&<button className="btn secondary" disabled={state.paused} onClick={()=>dispatch({type:'CAMERA_RETRY'})}>Webcam chọn nhầm — chọn lại</button>}<button className="btn secondary" disabled={state.paused} onClick={()=>dispatch({type:'ADVANCE'})}>Đã hiểu, tiếp tục / bỏ hoạt hình →</button></div></>:<span>{state.paused?'Camera tiếp tục chạy; đồng hồ và chốt đáp án đã tạm dừng.':state.phase==='answering'?'Hạ hai tay nghỉ 0,5 giây rồi tạo dáng. Giáo viên có thể bấm A/B/C/D để hỗ trợ.':'Cú đang chuẩn bị phép thuật. Camera chưa chốt đáp án.'}</span>}
          </div>
        </>}
      </section>
    </section><aside className="forest-sidebar">
      <section className="forest-camera"><div className="forest-question-meta"><b>WEBCAM</b><span className={'status '+camera.status}>{camera.status==='running'?'● Đang chạy':camera.status==='loading'?'Đang tải AI…':camera.status==='error'?'Chưa kết nối':'Chưa bật'}</span></div>
        <div className="video-wrap"><video ref={camera.videoRef} autoPlay muted playsInline/><canvas ref={camera.canvasRef}/>{camera.status!=='running'&&<div className="video-placeholder"><img src="/assets/ui/webcam.png" alt=""/><p>{camera.status==='loading'?'Đang tải mô hình…':'Em có thể dùng đáp án thủ công'}</p></div>}</div>
        <div className="pose-detected"><span>TƯ THẾ</span><strong>{camera.pose==='UNKNOWN'?'—':camera.pose==='NEUTRAL'?'NGHỈ':camera.pose}</strong></div>
        <div className="hold-head"><span>{answering&&!camera.armed?'Hạ tay nghỉ để mở khóa':'Giữ dáng 1 giây'}</span><b>{Math.round(camera.progress*100)}%</b></div><div className="progress-track"><div style={{width:`${camera.progress*100}%`}}/></div>
        <p className="camera-message" role="status">{camera.message}</p>
        {camera.status==='error'&&<p className="forest-note">Kiểm tra quyền camera và Internet tải WASM/model từ CDN. Vẫn có thể bấm đáp án. Hết giờ chỉ có nghĩa là chưa ghi nhận được lựa chọn.</p>}
        {!finished&&<button className="btn secondary" disabled={camera.status==='loading'} onClick={()=>camera.status==='running'?camera.stop():void camera.start()}>{camera.status==='running'?'Tắt webcam':'Bật / thử lại webcam'}</button>}
      </section>
      <section className="forest-pose-guide"><h3>Bí kíp tạo dáng</h3><div>{LETTERS.map(letter=><figure key={letter}><img src={`/assets/characters/pose_${letter.toLowerCase()}.png`} alt={POSE_NAMES[letter]}/><figcaption>{letter}</figcaption></figure>)}</div><p>A: trên đầu · B: gần vai<br/>C: nghiêng, tay trên tay dưới · D: chống hông</p></section>
      <div className="forest-tools"><button className="btn secondary" disabled={state.phase==='intro'||finished} onClick={()=>{play(state.paused?'ui/ui_resume.wav':'ui/ui_pause.wav');dispatch({type:'PAUSE'})}}>{state.paused?'▶ Tiếp tục':'Ⅱ Tạm dừng'}</button><label><input type="checkbox" checked={skipMotion} onChange={event=>setSkipMotion(event.target.checked)}/> Bỏ hoạt hình</label>{state.phase==='crossing'&&<button className="btn secondary" disabled={state.paused} onClick={()=>dispatch({type:'ADVANCE'})}>Bỏ qua chuyến bay →</button>}</div>
      <p className="forest-note">Một học sinh mỗi lượt. Video chỉ xử lý trong trình duyệt, không ghi hoặc gửi lên máy chủ.</p>
    </aside></div>
  </main>
}
