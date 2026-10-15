import type {Choice} from '../data/questions'
import type {AdventureStageConfig} from './stages'
import {createBossReducer} from '../stages/boss/bossState'
import type {BossAttempt} from '../stages/boss/bossModel'
export type StagePhase='intro'|'thinking'|'answering'|'feedback'|'next'|'crossing'|'finish'|'practice-complete'
export type ResultKind='correct'|'wrong'|'unanswered'
export interface AnswerResult {choice:Choice|null;source:'webcam'|'manual'|'timeout';kind:ResultKind}
export interface StageState {phase:StagePhase;index:number;results:AnswerResult[];paused:boolean;cameraCorrections:number;bossAttempts?:BossAttempt[];battle?:number}
export const initialStage:StageState={phase:'intro',index:0,results:[],paused:false,cameraCorrections:0}
export type StageAction=
  |{type:'START'|'READY'|'ADVANCE'|'PAUSE'|'REPLAY'|'CAMERA_RETRY'|'RETRY'}
  |{type:'ANSWER';choice:Choice;source:'webcam'|'manual';index:number}
  |{type:'TIMEOUT';index:number}
export const stageScore=(state:StageState)=>state.results.filter(r=>r.kind==='correct').length*10
export function createStageReducer(config:AdventureStageConfig){
  if(config.id==='castle')return createBossReducer(config)
  return function reduce(state:StageState,action:StageAction):StageState{
    if(action.type==='REPLAY')return state.phase==='finish'?{...initialStage,phase:'thinking'}:state
    if(action.type==='PAUSE')return state.phase==='intro'||state.phase==='finish'?state:{...state,paused:!state.paused}
    if(state.paused)return state
    switch(action.type){
      case 'START':return state.phase==='intro'?{...state,phase:'thinking'}:state
      case 'READY':return state.phase==='thinking'?{...state,phase:'answering'}:state
      case 'ANSWER':case 'TIMEOUT':{
        if(state.phase!=='answering'||action.index!==state.index||state.results.length!==state.index)return state
        const choice=action.type==='TIMEOUT'?null:action.choice
        const result:AnswerResult={choice,source:action.type==='TIMEOUT'?'timeout':action.source,kind:choice===null?'unanswered':choice===config.questions[state.index]!.answer?'correct':'wrong'}
        return {...state,phase:'feedback',results:[...state.results,result]}
      }
      case 'RETRY':case 'CAMERA_RETRY':{
        const last=state.results[state.index]
        const allowed=last&&last.kind!=='correct'&&(action.type==='RETRY'||last.source==='webcam'&&last.kind==='wrong')
        return state.phase==='feedback'&&allowed?{...state,phase:'thinking',results:state.results.slice(0,-1),cameraCorrections:state.cameraCorrections+(action.type==='CAMERA_RETRY'?1:0)}:state
      }
      case 'ADVANCE':
        if(state.phase==='feedback')return state.results[state.index]?.kind==='correct'?{...state,phase:'next'}:{...state,phase:'thinking',results:state.results.slice(0,-1)}
        if(state.phase==='next')return state.index===config.questions.length-1?{...state,phase:'crossing'}:{...state,phase:'thinking',index:state.index+1}
        if(state.phase==='crossing'&&state.results.length===config.questions.length&&state.results.every(result=>result.kind==='correct'))return {...state,phase:'finish'}
        return state
      default:return state
    }
  }
}
