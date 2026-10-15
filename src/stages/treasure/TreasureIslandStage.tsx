import { memo } from 'react'
import TreasureIslandScene, { type TreasureIslandSceneProps } from './TreasureIslandScene'
import type { TreasureChoice } from './treasureModel'

export interface TreasurePublicQuestion {
  id: string
  prompt: string
  choices: Record<TreasureChoice, string>
  explanation?: string
}

export interface TreasureIslandStageProps extends TreasureIslandSceneProps {
  /** Provided by the *existing* question engine. No separate question bank. */
  question: TreasurePublicQuestion
  secondsLeft: number
  /** Controlled by the shared game engine, not stage internals. */
  onManualAnswer?: (choice: TreasureChoice) => void
  /** Optional correct letter ONLY for displaying feedback. */
  correctAnswerForFeedback?: TreasureChoice
  /** For highlighting a selected answer after engine confirms it. */
  selectedAnswer?: TreasureChoice | null
}

/**
 * Full visual stage, including 4 choices. Input via webcam is externally
 * confirmed and routed by shared useAnswerCamera. Manual buttons are fallback.
 */
function TreasureIslandStageInner({
  question,
  secondsLeft,
  onManualAnswer,
  correctAnswerForFeedback,
  selectedAnswer,
  ...sceneProps
}: TreasureIslandStageProps) {
  const { phase, paused } = sceneProps
  const answering = phase === 'answering' && !paused
  const feedback = phase === 'feedback'
  return (
    <div className="treasure-stage">
      <TreasureIslandScene {...sceneProps} compact />
      {phase !== 'complete' && (
        <section className="treasure-stage__quiz" aria-label="Câu hỏi toán Đảo Kho Báu">
          <div className="treasure-stage__topline">
            <strong>CÂU {sceneProps.round + 1}/3 • ĐẢO KHO BÁU</strong>
            <span aria-live="polite">
              {phase === 'thinking' ? 'Đang suy nghĩ' : phase === 'answering' ? 'Tạo dáng giữ 1 giây' : phase === 'feedback' ? 'Kết quả' : 'Chuẩn bị'}
              {(phase === 'thinking' || phase === 'answering') && ` • ${secondsLeft}s`}
            </span>
          </div>
          <h3>{question.prompt}</h3>
          <div className="treasure-stage__answers">
            {(['A', 'B', 'C', 'D'] as const).map((letter) => (
              <button
                type="button"
                key={letter}
                disabled={!answering || !onManualAnswer}
                onClick={() => onManualAnswer?.(letter)}
                className={[
                  'treasure-stage__answer',
                  feedback && letter === correctAnswerForFeedback ? 'treasure-stage__answer--correct' : '',
                  feedback && selectedAnswer === letter && selectedAnswer !== correctAnswerForFeedback ? 'treasure-stage__answer--wrong' : '',
                ].filter(Boolean).join(' ')}
                aria-label={`Đáp án ${letter}: ${question.choices[letter]}`}
              >
                <span>{letter}</span>
                {question.choices[letter]}
              </button>
            ))}
          </div>
          {feedback && question.explanation && (
            <p className="treasure-stage__explanation"><strong>Giải thích:</strong> {question.explanation}</p>
          )}
          {phase === 'answering' && <p className="treasure-stage__hint">Đứng trước webcam, tạo dáng A/B/C/D và giữ khoảng 1 giây. Các nút chọn chỉ là phương án dự phòng cho giáo viên.</p>}
        </section>
      )}
    </div>
  )
}

export const TreasureIslandStage = memo(TreasureIslandStageInner)
export default TreasureIslandStage
