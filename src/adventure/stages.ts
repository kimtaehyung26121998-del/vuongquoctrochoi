import {QUESTIONS,STAGES,type Question} from '../data/questions'
import {BOSS_QUESTIONS} from '../stages/boss/bossQuestions'
export type StageId='forest'|'rainbow'|'island'|'castle'
export interface AdventureStageConfig {
  id:StageId; title:string; number:number; background:string; gem:string; music:string;
  scene:StageId; ready:boolean; questions:Question[]; answerMs:number;
  intro:string; goal:string; completeText:string;
}
const ids:StageId[]=['forest','rainbow','island','castle']
const music=['01_rung_phep_tinh','02_cau_vong_thu_thach','03_dao_kho_bau','04_lau_dai_boss_violet']
export const ADVENTURE_STAGES:AdventureStageConfig[]=STAGES.map((stage,index)=>({
  id:ids[index]!,title:stage.name,number:index+1,background:stage.asset,gem:stage.gem,
  music:`/audio/music/${music[index]}.ogg`,scene:ids[index]!,ready:true,
  questions:index===3?BOSS_QUESTIONS:QUESTIONS.filter(q=>q.stage===index),answerMs:20000,
  intro:index===1?'Ba đoạn cầu vồng đang ngủ quên. Dùng phép toán để thiên thần hóa phép tạo cầu vồng qua những hòn đảo trên mây!':index===2?'Cùng Robot đào mảnh bản đồ, đào chìa khóa vàng rồi dùng chìa khóa mở rương pha lê. Mỗi phép toán đưa em đến gần kho báu hơn!':'',
  goal:index===1?'ĐÁNH THỨC CẦU VỒNG':index===2?'KHÁM PHÁ KHO BÁU':'',
  completeText:index===1?'Cầu vồng đã nối liền! Em và Robot đã tới Đảo Kho Báu nhờ phép thuật của thiên thần.':index===2?'Em và Robot đã tìm thấy pha lê vàng. Lâu Đài Boss là điểm đến tiếp theo!':'',
}))
export const RAINBOW_STAGE=ADVENTURE_STAGES[1]!
export const TREASURE_STAGE=ADVENTURE_STAGES[2]!
export const BOSS_STAGE=ADVENTURE_STAGES[3]!
export function getStage(id:StageId){return ADVENTURE_STAGES.find(stage=>stage.id===id)!}
