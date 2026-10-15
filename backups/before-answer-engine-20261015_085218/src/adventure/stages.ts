import {QUESTIONS,STAGES,type Question} from '../data/questions'
export type StageId='forest'|'rainbow'|'island'|'castle'
export interface AdventureStageConfig {
  id:StageId; title:string; number:number; background:string; gem:string; music:string;
  scene:StageId; ready:boolean; questions:Question[]; answerMs:number;
  intro:string; goal:string; completeText:string;
}
const ids:StageId[]=['forest','rainbow','island','castle']
const music=['01_rung_phep_tinh','02_cau_vong_thu_thach','03_dao_kho_bau','04_lau_dai_boss']
export const ADVENTURE_STAGES:AdventureStageConfig[]=STAGES.map((stage,index)=>({
  id:ids[index]!,title:stage.name,number:index+1,background:stage.asset,gem:stage.gem,
  music:`/audio/music/${music[index]}.ogg`,scene:ids[index]!,ready:index<2,
  questions:QUESTIONS.filter(q=>q.stage===index),answerMs:20000,
  intro:index===1?'Ba đoạn cầu vồng đang ngủ quên. Dùng phép toán đánh thức chúng và cùng Cú bay qua những hòn đảo trên mây!':'',
  goal:index===1?'ĐÁNH THỨC CẦU VỒNG':'',
  completeText:index===1?'Cầu vồng đã nối liền! Em và Cú đã tới Đảo Kho Báu.':'',
}))
export const RAINBOW_STAGE=ADVENTURE_STAGES[1]!
export function getStage(id:StageId){return ADVENTURE_STAGES.find(stage=>stage.id===id)!}
