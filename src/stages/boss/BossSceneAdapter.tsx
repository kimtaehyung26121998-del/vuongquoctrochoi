import {memo} from 'react'
import type {StageState} from '../../adventure/stageState'
import BossCastleScene from './BossCastleScene'
import type {BossPhase} from './bossModel'

function BossSceneAdapter({state}:{state:StageState}){
  const phase:BossPhase=state.phase==='finish'?'complete':state.phase==='next'||state.phase==='crossing'?'feedback':state.phase
  return <BossCastleScene compact embedded phase={phase} attempts={state.bossAttempts??[]} paused={state.paused}/>
}
export default memo(BossSceneAdapter)
