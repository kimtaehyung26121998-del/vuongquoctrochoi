import {useCallback,useEffect,useReducer,useRef,useState,type CSSProperties} from 'react'
import {usePoseCamera} from './ai/usePoseCamera'
import {POSE_NAMES} from './ai/poseClassifier'
import type {Choice} from './data/questions'
import {FOREST_QUESTIONS,forestReducer,initialForest,type AnswerSource} from './forestState'

const LETTERS=['A','B','C','D'] as const
export default function ForestAdventure({onExit}:{onExit:()=>void}){
  const [state,dispatch]=useReducer(forestReducer,initialForest)
  const [muted,setMuted]=useState(false)
  const [skipMotion,setSkipMotion]=useState(false)
  const music=useRef<HTMLAudioElement>(null)
  const sounds=useRef(new Set<HTMLAudioElement>())
  const mutedRef=useRef(muted);mutedRef.current=muted
  const stateRef=useRef(state);stateRef.current=state
  const lastHandled=useRef(0)
  const submitted=useRef(false)
  const answering=state.phase==='answering'&&!state.paused
  // Giữ hook, video và canvas gắn liên tục. enabled chỉ khóa quyền xác nhận;
  // vòng detectForVideo của hook gốc vẫn chạy cả lúc hoạt hình/tạm dừng.
  const camera=usePoseCamera(answering,answering)
  const question=FOREST_QUESTIONS[state.index]!
  const good=state.selected===question.answer
  const celebrating=state.phase==='feedback'&&good
  const failed=state.phase==='feedback'&&!good
  const sfx=useCallback((path:string)=>{
    if(mutedRef.current)return
    const sound=new Audio('/audio/sfx/'+path);sound.volume=.5
    sounds.current.add(sound)
    const release=()=>sounds.current.delete(sound)
    sound.onended=release;sound.onerror=release
    void sound.play().catch(release)
  },[])
  useEffect(()=>()=>{sounds.current.forEach(s=>{s.pause();s.src=''});sounds.current.clear()},[])
  useEffect(()=>{
    const audio=music.current;if(!audio)return
    audio.volume=.18;audio.muted=muted
    if(state.paused||state.phase==='intro'||state.phase==='finish')audio.pause()
    else void audio.play().catch(()=>{})
    if(muted||state.paused){sounds.current.forEach(s=>s.pause());sounds.current.clear()}
  },[muted,state.paused,state.phase])
  useEffect(()=>{if(state.phase==='finish'){camera.stop();sfx('rewards/game_victory.wav')}},[state.phase,camera.stop,sfx])
  useEffect(()=>{if(state.phase==='answering')submitted.current=false},[state.phase,state.index])
  const submit=useCallback((answer:Choice,source:AnswerSource)=>{
    const current=stateRef.current
    if(current.phase!=='answering'||current.paused||submitted.current)return
    submitted.current=true
    dispatch({type:'ANSWER',answer,source})
    const correct=answer===FOREST_QUESTIONS[current.index]!.answer
    sfx(correct?'quiz/answer_correct.wav':'quiz/answer_wrong_gentle.wav')
    if(correct)sfx('adventure/bridge_build.wav')
  },[sfx])
  useEffect(()=>{
    const event=camera.confirmed
    if(!event||event.id===lastHandled.current)return
    lastHandled.current=event.id
    if(answering)submit(event.pose,'webcam')
  },[camera.confirmed,answering,submit])

  // Đồng hồ giữ lại thời gian còn lại khi pause; không phụ thuộc cập nhật pose.
  const clock=useRef({key:'',remaining:0})
  useEffect(()=>{
    const {phase,index,paused}=state
    const duration=phase==='thinking'?3000:phase==='feedback'&&good?3200:phase==='next'?250:null
    if(duration===null)return
    const key=phase+':'+index
    if(clock.current.key!==key)clock.current={key,remaining:duration}
    if(paused)return
    const started=performance.now()
    const timer=window.setTimeout(()=>dispatch({type:phase==='thinking'?'READY':'ADVANCE'}),skipMotion&&phase!=='thinking'?0:clock.current.remaining)
    return()=>{window.clearTimeout(timer);clock.current.remaining=Math.max(0,clock.current.remaining-(performance.now()-started))}
  },[state.phase,state.index,state.paused,good,skipMotion])

  const begin=(replay=false)=>{
    submitted.current=false;clock.current={key:'',remaining:0}
    dispatch({type:replay?'REPLAY':'START'})
    sfx('ui/ui_start.wav')
    if(music.current){music.current.muted=muted;music.current.volume=.18;void music.current.play().catch(()=>{})}
    if(camera.status!=='running'&&camera.status!=='loading')void camera.start()
  }
  const togglePause=()=>{sfx(state.paused?'ui/ui_resume.wav':'ui/ui_pause.wav');dispatch({type:'PAUSE'})}
  const retry=(cameraError=false)=>{clock.current={key:'',remaining:0};dispatch({type:cameraError?'RECOGNITION_RETRY':'RETRY'})}
  const finished=state.phase==='finish'
  const sceneStyle={'--from':`${12+Math.max(0,state.built-1)*23}%`,'--to':`${12+state.built*23}%`} as CSSProperties
  return <main className={'forest-app '+(state.paused?'is-paused ':'')+(skipMotion?'skip-motion':'')}>
    <audio ref={music} src="/audio/music/01_rung_phep_tinh.ogg" loop preload="none"/>
    <header className="forest-header">
      <button className="forest-back" onClick={onExit}>← Chọn chế độ</button>
      <div><span className="forest-eyebrow">VƯƠNG QUỐC TOÁN HỌC · MÀN 01</span><h1>Rừng phép tính</h1></div>
      <div className="forest-score"><img src="/assets/ui/star.png" alt=""/>{state.score}<small>điểm</small></div>
      <button className="forest-back" onClick={()=>setMuted(v=>!v)} aria-label={muted?'Bật âm thanh':'Tắt âm thanh'}>{muted?'Bật tiếng':'Tắt tiếng'}</button>
    </header>
    <div className="forest-layout">
      <section className="forest-main">
        <div className="forest-scene" style={sceneStyle} aria-label={`Cây cầu đã xây ${state.built} trên 3 đoạn`}>
          <div className="scene-caption"><b>CHIẾC CẦU PHÉP THUẬT</b><span>{state.built}/3 đoạn cầu</span></div>
          <div className="river"/>
          <div className="bank bank-left"/><div className="bank bank-right"/>
          <div className="bridge">{[0,1,2].map(n=><div key={n} className={'bridge-piece '+(n<state.built?'built ':'')+(celebrating&&n===state.built-1?'building':'')}><i/><i/><i/><i/></div>)}</div>
          <div key={state.built} className={'traveler '+(celebrating?'walking':'')}><img src={failed?'/assets/mascot/owl_thinking.png':celebrating||finished?'/assets/mascot/owl_cheer.png':'/assets/mascot/owl_happy.png'} alt="Cú mèo trên hành trình qua cầu"/></div>
          <img className="forest-goal" src="/assets/items/crystal_green.png" alt="Pha lê ở bờ bên kia"/>
          {(celebrating||finished)&&<div className="star-burst" aria-hidden="true">{[0,1,2,3,4].map(n=><img key={n} style={{'--n':n} as CSSProperties} src="/assets/ui/star.png" alt=""/>)}</div>}
          <div className={'owl-dialog '+(failed?'gentle-bounce':'')} role="status">{finished?'Chúng mình đã sang bờ bên kia!':celebrating?'Tuyệt vời! Phép tính của em đang xây cầu!':failed?'Mình cùng tìm cách giải nhé. Cú luôn ở bên em!':'Mỗi câu đúng tạo một đoạn cầu. Em giúp Cú nhé!'}</div>
        </div>
        <section className="forest-question" aria-label="Câu hỏi toán">
          {state.phase==='intro'?<div className="forest-intro"><h2>Cùng Cú sửa cây cầu!</h2><p>Giải 3 câu toán bằng dáng A/B/C/D và giữ 1 giây. Hạ hai tay nghỉ giữa các lượt. Mỗi câu đúng +10 điểm, sai có thể thử lại.</p><button className="btn primary" onClick={()=>begin()}>Bật webcam & vào rừng →</button><p className="forest-note">Có thể bấm đáp án khi camera chưa sẵn sàng. Không giới hạn thời gian trả lời.</p></div>
          :finished?<div className="forest-finish" role="status"><img src="/assets/items/trophy.png" alt="Cúp chiến thắng"/><div><span className="forest-eyebrow">HOÀN THÀNH MÀN 01</span><h2>Cây cầu đã nối liền!</h2><p><b>{state.score} điểm</b> · 3/3 đoạn cầu · {state.firstTry}/3 câu đúng ngay lần đầu</p><p>Em và Cú đã cùng vượt qua Rừng phép tính.</p>{state.cameraCorrections>0&&<p className="forest-note">Đã bỏ qua {state.cameraCorrections} lượt webcam chọn nhầm khi tính kết quả.</p>}<button className="btn primary" onClick={()=>begin(true)}>Chơi lại</button> <button className="btn secondary" onClick={onExit}>Chọn chế độ</button></div></div>
          :<><div className="forest-question-meta"><span>PHÉP THUẬT {state.index+1} / 3</span><span>{state.paused?'Đang tạm dừng':state.phase==='thinking'?'Cùng suy nghĩ một chút…':answering?'Giữ dáng 1 giây để chọn':state.phase==='next'?'Cú đang tiến lên…':state.source==='webcam'?'Đã nhận từ tư thế':'Đã chọn thủ công'}</span></div>
            <h2>{question.prompt}</h2>
            <div className="forest-answers">{LETTERS.map(key=><button key={key} disabled={!answering} onClick={()=>submit(key,'manual')} className={'forest-answer '+(answering&&camera.pose===key?'pose-active ':'')+(state.phase==='feedback'&&key===question.answer?'answer-correct ':'')+(failed&&state.selected===key?'answer-retry':'')} aria-label={`Đáp án ${key}: ${question.choices[key]}`}><b>{key}</b><span>{question.choices[key]}</span><img src={`/assets/characters/pose_${key.toLowerCase()}.png`} alt=""/></button>)}</div>
            <div className={'forest-feedback '+(celebrating?'positive':'')} role="status">{state.phase==='feedback'?<><strong>{good?'Chính xác! +10 điểm. Cú tiến thêm một đoạn.':'Mình cùng thử lại nhé — không bị trừ điểm.'}</strong><span>{question.explanation}</span>{failed&&<><button className="btn secondary" disabled={state.paused} onClick={()=>retry()}>Em thử lại nhé</button>{state.source==='webcam'&&<button className="btn secondary" disabled={state.paused} onClick={()=>retry(true)}>Webcam chọn nhầm</button>}</>}{celebrating&&<button className="btn secondary" disabled={state.paused} onClick={()=>dispatch({type:'ADVANCE'})}>Bỏ qua hoạt hình →</button>}</>:<span>{state.paused?'Camera vẫn hiển thị, đáp án đang được khóa.':state.phase==='thinking'?'Em có thời gian suy nghĩ trước khi tạo dáng.':'Hạ hai tay về tư thế nghỉ giữa các lượt. Giáo viên có thể bấm đáp án để hỗ trợ.'}</span>}</div>
          </>}
        </section>
      </section>
      <aside className="forest-sidebar">
        <section className="forest-camera"><div className="forest-question-meta"><b>WEBCAM</b><span className={'status '+camera.status}>{camera.status==='running'?'● Đang chạy':camera.status==='loading'?'Đang tải AI…':camera.status==='error'?'Chưa kết nối':'Chưa bật'}</span></div>
          <div className="video-wrap"><video ref={camera.videoRef} autoPlay muted playsInline/><canvas ref={camera.canvasRef}/>{camera.status!=='running'&&<div className="video-placeholder"><img src="/assets/ui/webcam.png" alt=""/><p>{camera.status==='loading'?'Đang tải AI…':'Sẵn sàng khi em bật camera'}</p></div>}</div>
          <div className="pose-detected"><span>TƯ THẾ</span><strong>{camera.pose==='UNKNOWN'?'—':camera.pose==='NEUTRAL'?'NGHỈ':camera.pose}</strong></div>
          <div className="hold-head"><span>Giữ dáng để chọn</span><b>{Math.round(camera.progress*100)}%</b></div><div className="progress-track"><div style={{width:`${camera.progress*100}%`}}/></div>
          <p className="camera-message" role="status">{camera.message}</p>
          {camera.status==='error'&&<p className="forest-note">Nếu camera đã được cấp quyền, hãy kiểm tra Internet: mô hình và WASM đang tải từ CDN. Em vẫn có thể chọn đáp án bằng chuột.</p>}
          {!finished&&<button className="btn secondary" disabled={camera.status==='loading'} onClick={()=>camera.status==='running'?camera.stop():void camera.start()}>{camera.status==='running'?'Tắt webcam':'Bật / thử lại webcam'}</button>}
        </section>
        <section className="forest-pose-guide"><h3>Bí kíp tạo dáng</h3><div>{LETTERS.map(key=><figure key={key}><img src={`/assets/characters/pose_${key.toLowerCase()}.png`} alt={POSE_NAMES[key]}/><figcaption>{key}</figcaption></figure>)}</div><p>A: trên đầu · B: gần vai<br/>C: nghiêng, tay trên tay dưới · D: chống hông</p></section>
        <div className="forest-tools"><button className="btn secondary" disabled={state.phase==='intro'||finished} onClick={togglePause}>{state.paused?'▶ Tiếp tục':'Ⅱ Tạm dừng'}</button><label><input type="checkbox" checked={skipMotion} onChange={e=>setSkipMotion(e.target.checked)}/> Bỏ hoạt hình</label></div>
        <p className="forest-note">Video chỉ xử lý trong trình duyệt. Không ghi hình, không gửi video lên máy chủ.</p>
      </aside>
    </div>
  </main>
}
