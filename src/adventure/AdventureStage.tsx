import {useCallback,useEffect,useLayoutEffect,useMemo,useReducer,useRef,useState} from 'react'
import type {Confirmed} from '../ai/usePoseCamera'
import {useAnswerCamera} from '../ai/useAnswerCamera'
import CameraDebug from '../ai/CameraDebug'
import {POSE_NAMES} from '../ai/poseClassifier'
import type {Choice,Question} from '../data/questions'
import type {AdventureStageConfig} from './stages'
import type {StageResult} from './stageProgress'
import {createStageReducer,initialStage,stageScore} from './stageState'
import {useStageClock} from './useStageClock'
import {useStageAudio} from './useStageAudio'
import RainbowScene from './RainbowScene'
import TreasureSceneAdapter from '../stages/treasure/TreasureSceneAdapter'
import BossSceneAdapter from '../stages/boss/BossSceneAdapter'
import BossVictoryScreen from '../stages/boss/BossVictoryScreen'
import {bossAttemptFor} from '../stages/boss/bossState'
import {bossAudioForAttempt,getBossProgress} from '../stages/boss/bossModel'
const LETTERS=['A','B','C','D'] as const
const SCENES={rainbow:RainbowScene,island:TreasureSceneAdapter,castle:BossSceneAdapter}
export default function AdventureStage({config:stageConfig,onExit,onComplete,questionFactory}:{config:AdventureStageConfig;onExit:()=>void;onComplete:(result:StageResult)=>void;questionFactory?:()=>Question[]}){
  const [questions,setQuestions]=useState(stageConfig.questions)
  const config=useMemo(()=>({...stageConfig,questions}),[stageConfig,questions])
  const reducer=useMemo(()=>createStageReducer(config),[config])
  const [state,dispatch]=useReducer(reducer,initialStage)
  const [muted,setMuted]=useState(false)
  const [skipMotion,setSkipMotion]=useState(false)
  const stateRef=useRef(state)
  useLayoutEffect(()=>{stateRef.current=state},[state])
  const lastHandled=useRef(0),submitted=useRef(false),notified=useRef(false)
  const answering=state.phase==='answering'&&!state.paused
  const boss=config.id==='castle'
  const practiceComplete=state.phase==='practice-complete'
  const terminal=state.phase==='finish'||practiceComplete
  // Cùng Answer Engine với màn Rừng; không khóa nghỉ trước đáp án đầu tiên.
  const {music,play,startMusic}=useStageAudio(muted,state.paused,state.phase!=='intro'&&!terminal)
  const question=config.questions[state.index]!
  const result=state.results[state.index]
  const revealSolution=boss||result?.kind==='correct'
  const score=stageScore(state),stars=score/10
  const finished=state.phase==='finish'
  const treasure=config.scene==='island'
  const Scene=SCENES[config.scene as keyof typeof SCENES]

  useLayoutEffect(()=>{if(state.phase==='answering')submitted.current=false},[state.phase,state.index])
  const settle=useCallback((choice:Choice|null,source:'webcam'|'manual'|'timeout')=>{
    const current=stateRef.current
    if(current.phase!=='answering'||current.paused||submitted.current)return false
    submitted.current=true
    if(choice===null)dispatch({type:'TIMEOUT',index:current.index})
    else dispatch({type:'ANSWER',choice,source:source==='webcam'?'webcam':'manual',index:current.index})
    const correct=choice===config.questions[current.index]!.answer
    if(config.id==='castle'){
      const attempt=bossAttemptFor(current,config,choice)
      const defeated=correct&&getBossProgress(current.bossAttempts??[]).hits===2
      play(bossAudioForAttempt(attempt,defeated).replace('/audio/sfx/',''))
      return true
    }
    play(correct?'quiz/answer_correct.wav':choice===null?'quiz/time_up.wav':'quiz/answer_wrong_gentle.wav')
    if(config.scene==='island'){
      // Vật phẩm chỉ được trao khi trả lời đúng, không phát thưởng lúc thử lại.
      if(current.index===2&&correct){play('adventure/chest_open.wav');play('rewards/collect_crystal.wav')}
      else if(correct)play('rewards/collect_star.wav')
    }else if(correct)play('adventure/portal_open.wav')
    return true
  },[config,play])
  const receiveAnswer=useCallback((event:Confirmed)=>{
    if(event.id!==lastHandled.current&&settle(event.pose,'webcam'))lastHandled.current=event.id
  },[settle])
  const camera=useAnswerCamera(answering,receiveAnswer)
  // Chỉ chờ nghỉ khi stabilizer thực sự chặn lặp, không khóa sau mọi câu sai.
  const waitingForRelease=boss&&answering&&camera.status==='running'&&camera.needsNeutral
  useEffect(()=>{
    const event=camera.confirmed
    if(event&&answering)receiveAnswer(event)
  },[camera.confirmed,answering,receiveAnswer])
  // Đảo/Boss chuyển câu nhanh sau đáp án đúng; sai/hết giờ vẫn có nhịp phản hồi.
  const feedbackMs=treasure||boss?(result?.kind==='correct'?1500:3500):7000
  const duration=state.phase==='thinking'?3000:state.phase==='answering'?config.answerMs:state.phase==='feedback'?feedbackMs:state.phase==='next'?(treasure||boss?150:250):state.phase==='crossing'?(treasure||boss?1200:2600):null
  // Bỏ chuyển động vẫn giữ nhịp phản hồi cho câu sai/hết giờ.
  const motionPhase=state.phase==='next'||state.phase==='crossing'||(state.phase==='feedback'&&result?.kind==='correct')
  const seconds=useStageClock(`${state.phase}:${state.index}:${state.cameraCorrections}`,skipMotion&&motionPhase?0:duration,state.paused||waitingForRelease||(state.phase==='answering'&&camera.status==='loading'),()=>{
    if(state.phase==='answering')settle(null,'timeout')
    else dispatch({type:state.phase==='thinking'?'READY':'ADVANCE'})
  })
  useEffect(()=>{
    if(!terminal||notified.current)return
    notified.current=true;camera.stop()
    if(finished){play('rewards/level_complete.wav');onComplete({score,stars})}
  },[terminal,finished,score,stars,camera.stop,play,onComplete])
  const begin=()=>{
    if(questionFactory)setQuestions(questionFactory())
    notified.current=false;submitted.current=false;dispatch({type:terminal?'REPLAY':'START'})
    startMusic();play('ui/ui_start.wav')
    if(camera.status!=='running'&&camera.status!=='loading')void camera.start()
  }
  return <><main hidden={boss&&finished} className={'forest-app rainbow-app '+(treasure?'treasure-app ':'')+(boss?'boss-app ':'')+(state.paused?'rainbow-paused ':'')+(skipMotion?'rainbow-skip':'')}>
    <audio ref={music} src={config.music} loop preload="none"/>
    <header className="forest-header"><button className="forest-back" onClick={onExit}>← Bản đồ</button><div><span className="forest-eyebrow">VƯƠNG QUỐC TOÁN HỌC · MÀN {config.number}</span><h1>{config.title}</h1></div><div className="forest-score"><img src="/assets/ui/star.png" alt=""/>{score}<small>điểm</small></div><button className="forest-back" onClick={()=>setMuted(v=>!v)}>{muted?'Bật tiếng':'Tắt tiếng'}</button></header>
    <div className="forest-layout"><section className="forest-main">
      {Scene&&<Scene state={state} config={config}/>}
      <section className="forest-question rainbow-question">
        {state.phase==='intro'?<div className="forest-intro"><span className="forest-eyebrow">{boss?'TRẬN CHIẾN CUỐI CÙNG':treasure?config.goal:'CHUYẾN BAY TRÊN MÂY'}</span><h2>{boss?'Cùng Cú phá ba lớp khiên Boss':treasure?'Cùng Cú khám phá Đảo Kho Báu':'Đánh thức ba sắc cầu vồng'}</h2><p>{boss?'Boss có ba lớp khiên. Mỗi câu đúng phá một lớp, sai không gây sát thương. Em có chín câu để thử sức!':config.intro}</p><p className="rainbow-instructions">Mỗi câu có {config.answerMs/1000} giây. Đúng +10 điểm và 1 sao. {boss?'Sai hoặc hết giờ sẽ chuyển sang câu hỏi mới.':'Sai hoặc hết giờ sẽ làm lại câu đó.'} Đúng đủ 3 câu mới hoàn thành màn. Giữ dáng 1 giây để chọn. Nếu chọn lại cùng chữ ở lượt sau, hạ tay nghỉ khi được hướng dẫn.</p><button className="btn primary" onClick={begin}>{boss?'Bật webcam & đấu Boss →':treasure?'Bật webcam & khám phá →':'Bật webcam & cất cánh →'}</button></div>
        :practiceComplete?<div className="forest-finish"><img src="/assets/mascot/owl_thinking.png" alt="Cú cùng em luyện tập"/><div><span className="forest-eyebrow">HẾT NGÂN HÀNG CÂU HỎI</span><h2>Boss vẫn còn khiên</h2><p>Em đã phá {score/10}/3 lớp khiên, đạt {score} điểm. Lượt này chưa hoàn thành màn.</p><p>Cùng luyện tập và thử lại từ đầu nhé!</p><button className="btn primary" onClick={begin}>Luyện tập lại</button> <button className="btn secondary" onClick={onExit}>Về bản đồ</button></div></div>:finished?<div className="forest-finish"><img src="/assets/items/trophy.png" alt="Cúp hoàn thành"/><div><span className="forest-eyebrow">HOÀN THÀNH MÀN {config.number}</span><h2>{boss?'Vương quốc đã được giải cứu!':treasure?'Kho báu đã được khám phá!':'Cầu vồng đã nối liền!'}</h2><div className="rainbow-result-stars" aria-label={`${stars} trên 3 sao`}>{[0,1,2].map(n=><img key={n} src="/assets/ui/star.png" className={n<stars?'':'unearned'} alt={n<stars?'Sao đạt được':'Sao chưa đạt'}/>)}</div><p><b>{score} điểm · {stars}/3 sao</b>{boss?' · Đã phá 3/3 khiên, hoàn thành cả bốn màn!':<> · Đã mở khóa {treasure?'Lâu Đài Boss':'Đảo Kho Báu'}</>}</p><p>{boss?'Em và Cú đã vượt qua Rừng, Cầu Vồng, Đảo Kho Báu và Lâu Đài Boss.':config.completeText}</p><button className="btn primary" onClick={onExit}>{boss?'Về bản đồ →':treasure?'Xem Lâu Đài Boss →':'Xem Đảo Kho Báu →'}</button> <button className="btn secondary" onClick={begin}>Chơi lại</button></div></div>
        :<><div className="forest-question-meta"><span>{boss?'LƯỢT':'CÂU'} {state.index+1} / {config.questions.length}</span><span>{state.paused?'Đang tạm dừng':state.phase==='thinking'?'Suy nghĩ trước khi tạo dáng':waitingForRelease?'Đồng hồ đang chờ — hạ hai tay nghỉ 0,5 giây':answering?`Còn ${seconds} giây`:state.phase==='crossing'?(boss?'Boss đã hết khiên!':treasure?'Cú đang cất pha lê':'Cú đang bay sang đảo'):revealSolution?'Cùng khám phá lời giải':'Cùng thử lại câu này'}</span></div>
          <h2>{question.prompt}</h2>
          <div className="forest-answers">{LETTERS.map(letter=><button key={letter} className={'forest-answer '+(answering&&camera.pose===letter?'pose-active ':'')+(state.phase==='feedback'&&revealSolution&&question.answer===letter?'answer-correct ':'')+(state.phase==='feedback'&&result?.kind==='wrong'&&result.choice===letter?'answer-retry':'')} disabled={!answering} onClick={()=>settle(letter,'manual')} aria-label={`Đáp án ${letter}: ${question.choices[letter]}`}><b>{letter}</b><span>{question.choices[letter]}</span><img src={`/assets/characters/pose_${letter.toLowerCase()}.png`} alt=""/></button>)}</div>
          <div className="forest-feedback rainbow-feedback" role="status">
            {state.phase==='feedback'?<><strong>{result?.kind==='correct'?'Chính xác! +10 điểm, +1 sao.':result?.kind==='unanswered'?(boss?'Chưa ghi nhận đáp án. Boss không mất khiên, không cộng điểm; cùng thử câu mới.':treasure?'Chưa ghi nhận đáp án. Không cộng điểm; cùng thử lại câu này nhé.':'Chưa ghi nhận đáp án. Không kết luận em làm sai toán; em hãy thử lại.'):(boss?'Chưa đúng. Boss không mất khiên, không cộng điểm; xem lời giải và thử câu thay thế nhé!':`Đáp án ${result?.choice} chưa đúng. Em hãy thử lại câu này nhé!`)}</strong>{revealSolution&&<span>{question.explanation}</span>}<div className="rainbow-feedback-actions">{result?.source==='webcam'&&result.kind==='wrong'&&<button className="btn secondary" disabled={state.paused} onClick={()=>dispatch({type:'CAMERA_RETRY'})}>{boss?'Webcam chọn nhầm — đổi câu':'Webcam chọn nhầm — chọn lại'}</button>}<button className="btn secondary" disabled={state.paused} onClick={()=>dispatch({type:boss||result?.kind==='correct'?'ADVANCE':'RETRY'})}>{result?.kind==='correct'?'Đã hiểu, tiếp tục / bỏ hoạt hình →':boss?'Câu thay thế →':'Thử lại câu này →'}</button></div></>:<span>{state.paused?'Camera tiếp tục chạy; đồng hồ và chốt đáp án đã tạm dừng.':state.phase==='answering'?((waitingForRelease||camera.needsNeutral)?(boss?'Đồng hồ đang chờ: hạ hai tay nghỉ 0,5 giây, rồi tạo dáng và giữ đủ 1 giây để chọn.':'Hạ hai tay nghỉ 0,5 giây để chọn lại cùng chữ.'):'Giữ dáng A/B/C/D 1 giây để chọn. Giáo viên có thể bấm đáp án để hỗ trợ.'):'Cú đang chuẩn bị phép thuật. Camera chưa chốt đáp án.'}</span>}
          </div>
        </>}
      </section>
    </section><aside className="forest-sidebar">
      <section className="forest-camera"><div className="forest-question-meta"><b>WEBCAM</b><span className={'status '+camera.status}>{camera.status==='running'?'● Đang chạy':camera.status==='loading'?'Đang tải AI…':camera.status==='error'?'Chưa kết nối':'Chưa bật'}</span></div>
        <div className="video-wrap"><video ref={camera.videoRef} autoPlay muted playsInline/><canvas ref={camera.canvasRef}/>{camera.status!=='running'&&<div className="video-placeholder"><img src="/assets/ui/webcam.png" alt=""/><p>{camera.status==='loading'?'Đang tải mô hình…':'Em có thể dùng đáp án thủ công'}</p></div>}</div>
        <div className="pose-detected"><span>TƯ THẾ</span><strong>{camera.pose==='UNKNOWN'?'—':camera.pose==='NEUTRAL'?'NGHỈ':camera.pose}</strong></div>
        <div className="hold-head"><span>{answering&&(waitingForRelease||camera.needsNeutral)?'Hạ tay nghỉ để mở khóa':'Giữ dáng 1 giây'}</span><b>{Math.round(camera.progress*100)}%</b></div><div className="progress-track"><div className="answer-hold-fill" style={{transform:`scaleX(${camera.progress})`}}/></div>
        <p className="camera-message" role="status">{camera.needsNeutral?'Chưa mở lượt: buông hai bàn tay xuống dưới hông, giữ nghỉ 0,5 giây. Nếu chưa hiện NGHỈ, lùi ra để camera thấy rõ cả cổ tay và hông. '+camera.message:camera.message}</p>
        {camera.status==='error'&&<p className="forest-note">Kiểm tra quyền camera và Internet tải WASM/model từ CDN. Vẫn có thể bấm đáp án. Hết giờ chỉ có nghĩa là chưa ghi nhận được lựa chọn.</p>}
        {!terminal&&<button className="btn secondary" disabled={camera.status==='loading'} onClick={()=>camera.status==='running'?camera.stop():void camera.start()}>{camera.status==='running'?'Tắt webcam':'Bật / thử lại webcam'}</button>}
      </section>
      <section className="forest-pose-guide"><h3>Bí kíp tạo dáng</h3><div>{LETTERS.map(letter=><figure key={letter}><img src={`/assets/characters/pose_${letter.toLowerCase()}.png`} alt={POSE_NAMES[letter]}/><figcaption>{letter}</figcaption></figure>)}</div><p>A: trên đầu · B: gần vai<br/>C: nghiêng, tay trên tay dưới · D: chống hông</p></section>
      <div className="forest-tools"><button className="btn secondary" disabled={state.phase==='intro'||terminal} onClick={()=>{play(state.paused?'ui/ui_resume.wav':'ui/ui_pause.wav');dispatch({type:'PAUSE'})}}>{state.paused?'▶ Tiếp tục':'Ⅱ Tạm dừng'}</button><label><input type="checkbox" checked={skipMotion} onChange={event=>setSkipMotion(event.target.checked)}/> Bỏ hoạt hình</label>{state.phase==='crossing'&&<button className="btn secondary" disabled={state.paused} onClick={()=>dispatch({type:'ADVANCE'})}>{boss?'Xem chiến thắng →':treasure?'Bỏ qua hiệu ứng pha lê →':'Bỏ qua chuyến bay →'}</button>}</div>
      <CameraDebug camera={camera} phase={state.paused?'paused':state.phase}/>
      <p className="forest-note">Một học sinh mỗi lượt. Video chỉ xử lý trong trình duyệt, không ghi hoặc gửi lên máy chủ.</p>
    </aside></div>
  </main>{boss&&finished&&<BossVictoryScreen score={score} muted={muted} onToggleSound={()=>setMuted(v=>!v)} onMap={onExit} onReplay={begin}/>}</>
}
