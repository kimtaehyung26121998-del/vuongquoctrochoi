import {ADVENTURE_STAGES,type StageId} from './stages'
export const PROGRESS_KEY='vuong-quoc-toan-hoc.adventure.v1'
export interface StageResult {score:number;stars:number}
export interface Progress {version:1;completed:Partial<Record<StageId,StageResult>>}
export const emptyProgress=():Progress=>({version:1,completed:{}})
export function isUnlocked(progress:Progress,id:StageId):boolean{
  const index=ADVENTURE_STAGES.findIndex(s=>s.id===id)
  return index>=0&&ADVENTURE_STAGES.slice(0,index).every(s=>!!progress.completed[s.id])
}
export function parseProgress(raw:string|null):Progress{
  const clean=emptyProgress()
  try{
    const value=JSON.parse(raw??'null')
    if(value?.version!==1||!value.completed||typeof value.completed!=='object')return clean
    // Chỉ nhận chuỗi hoàn thành liên tục và điểm hợp lệ; không tin cờ mở khóa từ storage.
    for(const stage of ADVENTURE_STAGES){
      const result=value.completed[stage.id]
      if(!stage.ready||!result||!Number.isInteger(result.score)||!Number.isInteger(result.stars)||result.score<0||result.score>30||result.score%10!==0||result.stars<0||result.stars>3||result.stars>result.score/10)break
      clean.completed[stage.id]={score:result.score,stars:result.stars}
    }
  }catch{/* Storage rỗng/hỏng: khởi đầu từ Rừng. */}
  return clean
}
export function completeStage(progress:Progress,id:StageId,result:StageResult):Progress{
  const stage=ADVENTURE_STAGES.find(s=>s.id===id)
  if(!stage?.ready||!isUnlocked(progress,id)||!Number.isInteger(result.score)||!Number.isInteger(result.stars)||result.score<0||result.score>30||result.score%10!==0||result.stars<0||result.stars>result.score/10)return progress
  const old=progress.completed[id]
  return {...progress,completed:{...progress.completed,[id]:{score:Math.max(old?.score??0,result.score),stars:Math.max(old?.stars??0,result.stars)}}}
}
export function readProgress(storage:Pick<Storage,'getItem'>):{progress:Progress;saved:boolean}{
  try{return {progress:parseProgress(storage.getItem(PROGRESS_KEY)),saved:true}}
  catch{return {progress:emptyProgress(),saved:false}}
}
export function writeProgress(storage:Pick<Storage,'setItem'>,progress:Progress):boolean{
  try{storage.setItem(PROGRESS_KEY,JSON.stringify(progress));return true}catch{return false}
}
