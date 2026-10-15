import {QUESTIONS,type Choice,type Question} from './data/questions'

export const FOREST_QUESTIONS=QUESTIONS.filter(q=>q.stage===0).slice(0,3)
export type ForestPhase='intro'|'thinking'|'answering'|'feedback'|'next'|'finish'
export type AnswerSource='webcam'|'manual'
export interface ForestState {
  phase:ForestPhase; index:number; built:number; score:number; attempts:number;
  selected:Choice|null; source:AnswerSource|null; paused:boolean; firstTry:number;
  questionAttempts:number; cameraCorrections:number
}
export const initialForest:ForestState={phase:'intro',index:0,built:0,score:0,attempts:0,selected:null,source:null,paused:false,firstTry:0,questionAttempts:0,cameraCorrections:0}
export type ForestAction={type:'START'|'READY'|'ADVANCE'|'RETRY'|'RECOGNITION_RETRY'|'PAUSE'|'REPLAY'}|{type:'ANSWER';answer:Choice;source:AnswerSource}
export function createForestReducer(questions:Question[]=FOREST_QUESTIONS){
return function reduce(state:ForestState,action:ForestAction):ForestState{
  if(action.type==='REPLAY')return {...initialForest,phase:'thinking'}
  if(action.type==='PAUSE')return state.phase==='intro'||state.phase==='finish'?state:{...state,paused:!state.paused}
  if(state.paused)return state
  switch(action.type){
    case 'START':return state.phase==='intro'?{...state,phase:'thinking'}:state
    case 'READY':return state.phase==='thinking'?{...state,phase:'answering'}:state
    case 'ANSWER':{
      if(state.phase!=='answering')return state
      const correct=action.answer===questions[state.index]!.answer
      return {...state,phase:'feedback',selected:action.answer,source:action.source,
        attempts:state.attempts+1,questionAttempts:state.questionAttempts+1,
        built:state.built+(correct?1:0),score:state.score+(correct?10:0),
        firstTry:state.firstTry+(correct&&state.questionAttempts===0?1:0)}
    }
    case 'RECOGNITION_RETRY':
      return state.phase==='feedback'&&state.source==='webcam'&&state.selected!==questions[state.index]!.answer?
        {...state,phase:'answering',selected:null,source:null,attempts:state.attempts-1,questionAttempts:state.questionAttempts-1,cameraCorrections:state.cameraCorrections+1}:state
    case 'RETRY':return state.phase==='feedback'&&state.selected!==questions[state.index]!.answer?{...state,phase:'answering',selected:null,source:null}:state
    case 'ADVANCE':
      if(state.phase==='feedback'&&state.selected===questions[state.index]!.answer)return {...state,phase:'next'}
      if(state.phase==='next')return state.built===questions.length?{...state,phase:'finish'}:{...state,phase:'thinking',index:state.index+1,selected:null,source:null,questionAttempts:0}
      return state
    default:return state
  }
}
}
export const forestReducer=createForestReducer()
