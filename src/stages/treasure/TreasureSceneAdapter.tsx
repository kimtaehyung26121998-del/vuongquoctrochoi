import {memo,useMemo} from 'react'
import type {AdventureStageConfig} from '../../adventure/stages'
import type {StageState} from '../../adventure/stageState'
import TreasureIslandScene from './TreasureIslandScene'
import {recordTreasureOutcome,type TreasureOutcome,type TreasurePhase,type TreasureRound} from './treasureModel'

// Chỉ chiếu kết quả đã chốt từ engine; không có state/đồng hồ/camera thứ hai.
// CAMERA_RETRY xóa kết quả nhầm ở engine, cảnh tự bỏ vật phẩm tương ứng.
export function treasureOutcomes(state:StageState,config:AdventureStageConfig):TreasureOutcome[]{
  return state.results.reduce<TreasureOutcome[]>((outcomes,result,index)=>recordTreasureOutcome(outcomes,{
    questionId:config.questions[index]!.id,round:index as TreasureRound,
    choice:result.choice,isCorrect:result.kind==='correct',
  }),[])
}
function TreasureSceneAdapter({state,config}:{state:StageState;config:AdventureStageConfig}){
  const phase:TreasurePhase=state.phase==='finish'?'complete':state.phase==='next'||state.phase==='crossing'?'feedback':state.phase==='practice-complete'?'intro':state.phase
  const outcomes=useMemo(()=>treasureOutcomes(state,config),[state.results,config])
  return <TreasureIslandScene compact round={state.index as TreasureRound} phase={phase}
    outcomes={outcomes} paused={state.paused}/>
}
export default memo(TreasureSceneAdapter)
