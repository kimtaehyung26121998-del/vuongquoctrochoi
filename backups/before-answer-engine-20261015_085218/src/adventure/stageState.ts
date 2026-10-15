import type {Choice} from '../data/questions'
import type {AdventureStageConfig} from './stages'
export type StagePhase='intro'|'thinking'|'answering'|'feedback'|'next'|'crossing'|'finish'
export type ResultKind='correct'|'wrong'|'unanswered'
export interface AnswerResult {choice:Choice|null;source:'webcam'|'manual'|'timeout';kind:ResultKind}
export interface StageState {phase:StagePhase;index:number;results:AnswerResult[];paused:boolean;cameraCorrections:number}
export const initialStage:StageState={phase:'intro',index:0,results:[],paused:false,cameraCorrections:0}
export type StageAction=
  |{type:'START'|'READY'|'ADVANCE'|'PAUSE'|'REPLAY'|'CAMERA_RETRY'}
  |{type:'ANSWER';choice:Choice;source:'webcam'|'manual';index:number}
  |{type:'TIMEOUT';index:number}
export const stageScore=(state:StageState)=>state.results.filter(r=>r.kind==='correct').length*10
export function createStageReducer(config:AdventureStageConfig){
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
      case 'CAMERA_RETRY':{
        const last=state.results[state.index]
        return state.phase==='feedback'&&last?.source==='webcam'&&last.kind==='wrong'?{...state,phase:'thinking',results:state.results.slice(0,-1),cameraCorrections:state.cameraCorrections+1}:state
      }
      case 'ADVANCE':
        if(state.phase==='feedback')return {...state,phase:'next'}
        if(state.phase==='next')return state.index===config.questions.length-1?{...state,phase:'crossing'}:{...state,phase:'thinking',index:state.index+1}
        if(state.phase==='crossing')return {...state,phase:'finish'}
        return state
      default:return state
    }
  }
}
