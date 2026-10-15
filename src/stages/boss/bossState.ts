import type {AdventureStageConfig} from '../../adventure/stages'
import type {StageAction,StageState,AnswerResult} from '../../adventure/stageState'
import {getBossProgress,recordBossAttempt,suggestNextBossAction,type BossAttempt} from './bossModel'

export function bossAttemptFor(state:StageState,config:AdventureStageConfig,choice:BossAttempt['choice']):BossAttempt{
  const question=config.questions[state.index]!
  const instance=`castle:${state.battle??0}:${state.index}:${question.id}`
  return {submissionId:instance+':answer',questionInstanceId:instance,choice,
    result:choice===null?'timeout':choice===question.answer?'correct':'wrong'}
}

// Chỉ engine chốt kết quả mới đi qua reducer này. Scene không ghi điểm/HP.
export function createBossReducer(config:AdventureStageConfig){
  return (state:StageState,action:StageAction):StageState=>{
    const terminal=state.phase==='finish'||state.phase==='practice-complete'
    if(action.type==='REPLAY')return terminal?{phase:'thinking',index:0,results:[],paused:false,cameraCorrections:0,bossAttempts:[],battle:(state.battle??0)+1}:state
    if(action.type==='PAUSE')return state.phase==='intro'||terminal?state:{...state,paused:!state.paused}
    if(state.paused)return state
    const attempts=state.bossAttempts??[]
    switch(action.type){
      case 'START':return state.phase==='intro'?{...state,phase:'thinking',bossAttempts:[]}:state
      case 'READY':return state.phase==='thinking'?{...state,phase:'answering'}:state
      case 'ANSWER':case 'TIMEOUT':{
        if(state.phase!=='answering'||action.index!==state.index||state.results.length!==state.index)return state
        const choice=action.type==='TIMEOUT'?null:action.choice
        const attempt=bossAttemptFor(state,config,choice)
        const recorded=recordBossAttempt(attempts,attempt)
        if(recorded.length===attempts.length)return state
        const result:AnswerResult={choice,source:action.type==='TIMEOUT'?'timeout':action.source,
          kind:attempt.result==='timeout'?'unanswered':attempt.result}
        return {...state,phase:'feedback',results:[...state.results,result],bossAttempts:recorded}
      }
      case 'CAMERA_RETRY':{
        const last=state.results[state.index]
        // Bỏ thống kê lỗi nhận diện, nhưng đổi câu vì lời giải đã hiện.
        return state.phase==='feedback'&&last?.source==='webcam'&&last.kind==='wrong'?
          {...state,phase:'next',bossAttempts:attempts.slice(0,-1),cameraCorrections:state.cameraCorrections+1}:state
      }
      case 'RETRY':case 'ADVANCE':{
        if(state.phase==='feedback')return {...state,phase:'next'}
        if(state.phase==='next'){
          const next=suggestNextBossAction(attempts,config.questions.length-state.index-1)
          return next==='victory'?{...state,phase:'crossing'}:next==='practice-complete'?{...state,phase:'practice-complete'}:{...state,phase:'thinking',index:state.index+1}
        }
        if(state.phase==='crossing'&&getBossProgress(attempts).defeated)return {...state,phase:'finish'}
        return state
      }
      default:return state
    }
  }
}
