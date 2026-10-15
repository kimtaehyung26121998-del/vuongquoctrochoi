import { memo } from 'react'
import BossCastleScene, { type BossCastleSceneProps } from './BossCastleScene'
import { type BossChoice } from './bossModel'

export interface BossPublicQuestion {
  id: string
  prompt: string
  choices: Record<BossChoice, string>
  explanation?: string
}

export interface BossCastleStageProps extends BossCastleSceneProps {
  /** Current public question; undefined on completed screen. */
  question?: BossPublicQuestion
  secondsLeft: number
  /** Forward ALL submissions to existing single shared Engine. */
  onManualAnswer?: (choice: BossChoice) => void
  /** Values only from a CONFIRMED submission; do not derive from raw pose. */
  selectedAnswer?: BossChoice | null
  correctAnswerForFeedback?: BossChoice
  /** Number of the current QUESTION attempt (not damage dealt). */
  questionNumber: number
}

/** Use only if current game UI does not already show a shared quiz panel. */
function BossCastleStageInner({
  question, secondsLeft, onManualAnswer, selectedAnswer,
  correctAnswerForFeedback, questionNumber, ...scene
}: BossCastleStageProps) {
  const answering = scene.phase === 'answering' && !scene.paused
  const feedback = scene.phase === 'feedback'
  return (
    <div className="mk-boss-stage">
      <BossCastleScene {...scene} compact />
      {question && !['complete', 'practice-complete'].includes(scene.phase) && (
        <section className="mk-boss-stage__quiz" aria-label="Câu hỏi toán chiến đấu Boss">
          <div className="mk-boss-stage__quiz-topline">
            <span>THỬ THÁCH {questionNumber}</span>
            <span aria-live="polite">{scene.phase === 'thinking' ? 'Suy nghĩ' : scene.phase === 'answering' ? 'Tạo dáng A/B/C/D' : 'Kết quả'} {['thinking', 'answering'].includes(scene.phase) && `· ${secondsLeft}s`}</span>
          </div>
          <h3>{question.prompt}</h3>
          <div className="mk-boss-stage__answers">
            {(['A', 'B', 'C', 'D'] as const).map(letter => (
              <button
                type="button" key={letter}
                disabled={!answering || !onManualAnswer}
                onClick={() => onManualAnswer?.(letter)}
                className={[
                  'mk-boss-stage__answer',
                  feedback && letter === correctAnswerForFeedback && 'mk-boss-stage__answer--correct',
                  feedback && letter === selectedAnswer && selectedAnswer !== correctAnswerForFeedback && 'mk-boss-stage__answer--wrong',
                ].filter(Boolean).join(' ')}
              >
                <b>{letter}</b><span>{question.choices[letter]}</span>
              </button>
            ))}
          </div>
          <p className="mk-boss-stage__hint">{answering ? 'Đứng trước webcam và giữ một tư thế trong 1 giây.' : 'Robot đang cổ vũ! Sẵn sàng cho thử thách tiếp theo.'}</p>
          {feedback && question.explanation && <p className="mk-boss-stage__explanation"><strong>Cùng xem cách giải:</strong> {question.explanation}</p>}
        </section>
      )}
    </div>
  )
}
export const BossCastleStage = memo(BossCastleStageInner)
export default BossCastleStage
