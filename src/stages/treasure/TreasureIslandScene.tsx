import { memo, useMemo, type CSSProperties } from 'react'
import {
  getTreasureProgress,
  TREASURE_STEPS,
  type TreasureOutcome,
  type TreasurePhase,
  type TreasureRound,
} from './treasureModel'
import './treasureIsland.css'
import {WorkRobot,WorkDust} from '../../adventure/WorkEffects'
import WorldAtmosphere from '../../adventure/WorldAtmosphere'

export interface TreasureIslandSceneProps {
  /** Current question index in this stage: 0, 1 or 2. */
  round: TreasureRound
  /** Read-only game-engine phase. No camera logic in this component. */
  phase: TreasurePhase
  /** Confirmed results. At most one entry per question, ordered by round. */
  outcomes: readonly TreasureOutcome[]
  paused?: boolean
  /** Rendered outside the stage scenery by the existing game-engine quiz UI. */
  compact?: boolean
  /** Optional: existing 'skip animation' action. Do not render a dead button. */
  onSkipAnimation?: () => void
}

/**
 * Visual-only scene for stage 3. This component must NOT initialize webcam,
 * subscribe to pose detections, submit an answer, or award score.
 * All those operations belong to the working shared useAnswerCamera/Game Engine.
 */
function TreasureIslandSceneInner({
  round,
  phase,
  outcomes,
  paused = false,
  compact = false,
  onSkipAnimation,
}: TreasureIslandSceneProps) {
  const progress = useMemo(() => getTreasureProgress(outcomes), [outcomes])
  const step = TREASURE_STEPS[round] ?? TREASURE_STEPS[0]!
  const lastOutcome = outcomes.find((outcome) => outcome.round === round)
  const canShowFeedback = phase === 'feedback' && !!lastOutcome
  // Show the victory panel only after the shared engine finishes feedback.
  const stageComplete = phase === 'complete' && progress.completed
  const assisted = !!lastOutcome && !lastOutcome.isCorrect
  const moving=canShowFeedback&&lastOutcome.isCorrect
  const routeStyle={
    '--treasure-route-from':Math.max(0,progress.correct-1)/3,
    '--treasure-route-to':progress.correct/3,
  } as CSSProperties

  return (
    <section
      aria-label="Đảo Kho Báu"
      className={[
        'treasure-island',
        compact ? 'treasure-island--compact' : '',
        paused ? 'treasure-island--paused' : '',
        stageComplete ? 'treasure-island--complete' : '',
      ].filter(Boolean).join(' ')}
      data-treasure-round={round + 1}
      data-treasure-phase={phase}
    >
      <WorldAtmosphere/>
      <div className="treasure-island__sky" aria-hidden="true" />
      <div className="treasure-island__sea" aria-hidden="true" />
      <div className="treasure-island__island" aria-hidden="true" />

      <header className="treasure-island__header">
        <div>
          <span className="treasure-island__eyebrow">ĐẢO KHO BÁU · CHẶNG {round + 1} / 3</span>
          <h2>{stageComplete ? 'Hành trình pha lê vàng' : step.label}</h2>
          <p>{stageComplete ? 'Kho báu đã được khám phá!' : step.instructions}</p>
        </div>
        <div className="treasure-island__counter" aria-live="polite">
          <strong>{progress.correct}<small>/3</small></strong>
          <span>câu đúng · {progress.correct * 10} điểm</span>
        </div>
      </header>

      <div className="treasure-island__playfield">
        <svg className="treasure-island__landscape" viewBox="0 0 960 250" preserveAspectRatio="none" aria-hidden="true">
          <ellipse cx="495" cy="200" rx="395" ry="36" fill="#073f59" opacity=".15"/>
          <path d="M92 177Q120 139 247 148Q339 120 439 147Q564 111 702 140Q839 131 891 181Q878 217 731 219H237Q113 214 92 177Z" fill="#f5ce87"/>
          <path d="M111 170Q199 134 302 156Q414 130 481 151Q610 121 729 151Q829 141 872 173Q786 202 664 190Q556 211 427 188Q269 213 111 170Z" fill="#ffe7ad"/>
          <path d="M151 156Q165 95 153 61" fill="none" stroke="#ab7645" strokeWidth="12" strokeLinecap="round"/>
          <path d="M154 65Q100 29 70 74Q114 60 154 65Q146 8 103 13Q137 34 154 65Q177 9 216 26Q178 36 154 65Q205 33 242 78Q194 62 154 65Q109 69 104 102Q136 82 154 65Z" fill="#278d70"/>
          <path d="M829 152Q811 109 823 82" fill="none" stroke="#bc8b55" strokeWidth="8" strokeLinecap="round"/>
          <path d="M823 85Q789 51 758 75Q791 74 823 85Q818 43 790 44Q812 63 823 85Q843 46 874 63Q842 69 823 85Q860 68 886 97Q854 87 823 85Z" fill="#389e7a"/>
          <path d="M270 184Q420 142 668 174" fill="none" stroke="#d09f58" strokeWidth="3" strokeDasharray="6 10" strokeLinecap="round"/>
        </svg>
        <div
          key={progress.correct}
          className={'treasure-island__owl'+(moving?' treasure-island__owl--moving '+(round<2?'robot-digging':'robot-unlocking'):'')}
          style={routeStyle}
          data-route-step={progress.correct}
          data-at-chest={progress.completed}
        >
          <img src={assisted ? '/assets/mascot/robot_thinking.png' : stageComplete ? '/assets/mascot/robot_cheer.png' : '/assets/mascot/robot_neutral.png'} alt="Robot hướng dẫn chuyến phiêu lưu" />
          {moving&&round<2&&<><WorkRobot kind="shovel"/><WorkDust/><img className="dug-reward" src={TREASURE_STEPS[round]!.item} alt={round===0?'Đào được mảnh bản đồ':'Đào được chìa khóa vàng'}/></>}
          {progress.hasKey&&<img className={'held-key'+(moving&&round===1?' held-key--found':'')} src="/assets/treasure/golden_key.svg" alt="Robot cầm sẵn chìa khóa vàng"/>}
          <span>{assisted ? 'Cùng xem lại nhé!' : lastOutcome?.isCorrect ? 'Đúng rồi! +10' : 'Khám phá nào!'}</span>
        </div>
        <div className="treasure-island__trail" aria-hidden="true" />
        <div className="treasure-island__loot">
          <img
            className={`treasure-island__chest ${progress.chestOpened ? 'treasure-island__chest--open' : ''}`}
            src={progress.chestOpened ? '/assets/items/chest_open.png' : '/assets/items/chest_closed.png'}
            alt={progress.chestOpened ? 'Rương kho báu đã mở' : 'Rương kho báu đang khóa'}
          />
          {moving&&round===2&&<img className="treasure-island__chest opening-chest-cover" src="/assets/items/chest_closed.png" alt=""/>}
          {progress.chestOpened && (
            <img className="treasure-island__crystal" src="/assets/items/crystal_yellow.png" alt="Pha lê vàng" />
          )}
        </div>
        {outcomes.some(outcome => outcome.round === 2 && outcome.isCorrect) && <div className="treasure-island__sparkles" aria-hidden="true">✦ ✧ ✦ ✧ ✦</div>}
      </div>

      <div className="treasure-island__inventory" aria-label="Hành trình khám phá">
        {TREASURE_STEPS.map((item, index) => {
          const outcome = outcomes.find((value) => value.round === index)
          const obtained = !!outcome
          return (
            <div
              className={[
                'treasure-island__objective',
                outcome?.isCorrect ? 'treasure-island__objective--done' : '',
                round === index && !stageComplete ? 'treasure-island__objective--current' : '',
                outcome && !outcome.isCorrect ? 'treasure-island__objective--assisted' : '',
              ].filter(Boolean).join(' ')}
              key={item.id}
            >
              <div className="treasure-island__objective-art">
                <img src={item.item} alt="" />
              </div>
              <div className="treasure-island__objective-copy">
                <small>THỬ THÁCH {index + 1}</small>
                <b>{item.label}</b>
                <span>{!obtained ? (round === index ? 'Đang khám phá' : 'Chưa khám phá') : (outcome.isCorrect ? 'Đúng · +10 điểm' : outcome.choice === null ? 'Chưa trả lời · +0 điểm' : 'Chưa đúng · +0 điểm')}</span>
              </div>
              <div className="treasure-island__objective-symbol" aria-label={outcome?.isCorrect ? 'Trả lời đúng' : obtained ? 'Cần thử lại, không cộng điểm' : 'Chưa trả lời'}>
                {outcome?.isCorrect ? '✓' : obtained ? '↻' : String(index + 1).padStart(2, '0')}
              </div>
            </div>
          )
        })}
      </div>
      <div className="treasure-island__journey-note">
        <span>{progress.correct}/3 thử thách đã vượt qua</span>
        <span>Đúng +10 điểm · Chưa đúng thì thử lại</span>
      </div>

      {canShowFeedback && !compact && (
        <div
          className={`treasure-island__feedback ${lastOutcome.isCorrect ? 'treasure-island__feedback--success' : 'treasure-island__feedback--assist'}`}
          role="status"
          aria-live="polite"
        >
          <b>{lastOutcome.isCorrect ? step.success : step.gentleFallback}</b>
          <span>{lastOutcome.isCorrect ? 'Nhận thêm một ngôi sao phép thuật!' : 'Không cộng điểm. Hãy đọc lời giải cùng Robot nhé!'}</span>
          {onSkipAnimation && <button type="button" onClick={onSkipAnimation}>Bỏ qua hiệu ứng</button>}
        </div>
      )}

      {stageComplete && !compact && (
        <div className="treasure-island__victory" role="status" aria-live="polite">
          <img src="/assets/items/crystal_yellow.png" alt="Viên pha lê vàng" />
          <div>
            <small>CHÚC MỪNG NHÀ THÁM HIỂM!</small>
            <h3>Đã khám phá Đảo Kho Báu</h3>
            <p>{progress.correct}/3 câu đúng • {progress.stars} ngôi sao • Mở khóa Lâu Đài Boss</p>
          </div>
        </div>
      )}
      {paused && <div className="treasure-island__pause-mask" role="status">Tạm dừng</div>}
    </section>
  )
}

export const TreasureIslandScene = memo(TreasureIslandSceneInner)
export default TreasureIslandScene
