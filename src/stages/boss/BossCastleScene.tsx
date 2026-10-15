import { memo, useMemo, type CSSProperties } from 'react'
import { bossFeedbackText, getBossProgress, type BossAttempt, type BossPhase } from './bossModel'
import './bossCastle.css'

export interface BossCastleSceneProps {
  /** Read-only state supplied by the existing shared Game Engine. */
  phase: BossPhase
  attempts: readonly BossAttempt[]
  paused?: boolean
  compact?: boolean
  /** Host engine already renders feedback and the final result panel. */
  embedded?: boolean
  onSkipAnimation?: () => void
}

/** VISUAL-ONLY. Never initialize MediaPipe, submit an answer or add points here. */
function BossCastleSceneInner({
  phase,
  attempts,
  paused = false,
  compact = false,
  embedded = false,
  onSkipAnimation,
}: BossCastleSceneProps) {
  const progress = useMemo(() => getBossProgress(attempts), [attempts])
  const lastAttempt = attempts[attempts.length - 1]
  const isFeedback = phase === 'feedback' && !!lastAttempt
  const victory = phase === 'complete' && progress.defeated
  const practiceComplete = phase === 'practice-complete' || (phase === 'complete' && !progress.defeated)
  const arenaStyle = { '--boss-hits': progress.hits } as CSSProperties
  return (
    <section
      className={[
        'mk-boss', compact && 'mk-boss--compact', paused && 'mk-boss--paused',
        isFeedback && lastAttempt?.result === 'correct' && 'mk-boss--impact',
        victory && 'mk-boss--victory',
      ].filter(Boolean).join(' ')}
      aria-label="Lâu Đài Boss"
      data-phase={phase}
      data-boss-hits={progress.hits}
      style={arenaStyle}
    >
      <div className="mk-boss__stars" aria-hidden="true" />
      <header className="mk-boss__heading">
        <div>
          <span className="mk-boss__eyebrow">MÀN 4 / 4 · TRẬN CHIẾN CUỐI CÙNG</span>
          <h2>LÂU ĐÀI BOSS</h2>
          <p>Giải đúng để phá 3 lớp khiên phép thuật!</p>
        </div>
        <div className="mk-boss__round-tag" aria-live="polite">
          <strong>{progress.hits}/3</strong><span>khiên đã phá</span>
        </div>
      </header>

      <div className="mk-boss__health" aria-label={`Boss còn ${progress.remainingHp} trên ${progress.maxHp} lớp khiên`}>
        <div className="mk-boss__health-copy"><span>KHIÊN PHÉP THUẬT</span><strong>{progress.remainingHp} / {progress.maxHp}</strong></div>
        <div className="mk-boss__health-track">
          <div className="mk-boss__health-fill" style={{ width: `${(progress.remainingHp / progress.maxHp) * 100}%` }} />
        </div>
        <div className="mk-boss__health-icons" aria-hidden="true">
          {[0, 1, 2].map(i => <span key={i} className={i < progress.hits ? 'mk-boss__shield--broken' : ''}>◆</span>)}
        </div>
      </div>

      <div className="mk-boss__arena">
        <div className="mk-boss__castle" aria-hidden="true" />
        <div className="mk-boss__portal" aria-hidden="true" />
        <div className="mk-boss__floor" aria-hidden="true" />
        <div className="mk-boss__hero">
          <img src="/assets/mascot/owl_cheer.png" alt="Cú mèo đang chuẩn bị thi triển phép thuật" />
          <div className="mk-boss__hero-label">Đội Toán Nhí</div>
        </div>
        <div className="mk-boss__beam" aria-hidden="true" />
        <div className="mk-boss__monster">
          <span className="mk-boss__monster-halo" aria-hidden="true" />
          <img src="/assets/items/boss.png" alt="Boss tím tinh nghịch đang bảo vệ lâu đài" />
          <span className="mk-boss__monster-label">BOSS TINH NGHỊCH</span>
        </div>
        <div className="mk-boss__impact-spark" aria-hidden="true">✦</div>
        <div className="mk-boss__magic-notes" aria-hidden="true">✦　✧　✦</div>
      </div>

      <div className="mk-boss__footer">
        <div className="mk-boss__attempts">Đã thử <b>{progress.attempted}</b> câu · Đúng <b>{progress.hits}</b> · Sai <b>{progress.wrong}</b> · Hết giờ <b>{progress.timeout}</b></div>
        <div className="mk-boss__legend">Chỉ câu đúng mới phá được khiên. Sai không mất điểm đã đạt.</div>
      </div>

      {isFeedback && !embedded && (
        <div className={`mk-boss__feedback mk-boss__feedback--${lastAttempt.result}`} role="status" aria-live="polite">
          <strong>{lastAttempt.result === 'correct' ? 'ĐÁNH TRÚNG!' : 'TIẾP TỤC CỐ GẮNG!'}</strong>
          <span>{bossFeedbackText(lastAttempt)}</span>
          {onSkipAnimation && <button type="button" onClick={onSkipAnimation}>Bỏ qua hiệu ứng</button>}
        </div>
      )}

      {(victory || practiceComplete) && !embedded && (
        <div className={`mk-boss__result ${victory ? 'mk-boss__result--win' : ''}`} role="status" aria-live="polite">
          <img src={victory ? '/assets/items/trophy.png' : '/assets/mascot/owl_thinking.png'} alt="" />
          <div>
            <small>{victory ? 'CHÚC MỪNG!' : 'CẦN LUYỆN TẬP THÊM'}</small>
            <h3>{victory ? 'Vương quốc đã được giải cứu!' : 'Boss vẫn còn khiên phép thuật'}</h3>
            <p>{victory ? `Em đã phá cả 3 khiên qua ${progress.attempted} lần thử.` : `Em đã phá ${progress.hits}/3 khiên. Hãy thêm câu hỏi hoặc chơi lại để chiến thắng.`}</p>
          </div>
        </div>
      )}
      {paused && <div className="mk-boss__pause" role="status">Đang tạm dừng</div>}
    </section>
  )
}

export const BossCastleScene = memo(BossCastleSceneInner)
export default BossCastleScene
