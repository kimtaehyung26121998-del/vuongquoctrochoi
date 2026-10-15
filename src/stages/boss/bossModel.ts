/** Battle rules only. Webcam detection, submit locks and real scoring belong to shared Game Engine. */
export type BossChoice = 'A' | 'B' | 'C' | 'D'
export type BossPhase = 'intro' | 'thinking' | 'answering' | 'feedback' | 'complete' | 'practice-complete'
export type BossAttemptResult = 'correct' | 'wrong' | 'timeout'

export interface BossAttempt {
  /** Unique ID generated once by shared Engine when a submission is confirmed. */
  submissionId: string
  /** One unique question instance per attempt (even when content is reused). */
  questionInstanceId: string
  /** Webcam or manual choice; null only for timeout. */
  choice: BossChoice | null
  result: BossAttemptResult
}

export const BOSS_MAX_HP = 3
export const BOSS_MIN_POOL_SIZE = 6

/**
 * Idempotent outcome recording. One question-instance can be submitted once.
 * A wrong answer or timeout is a recorded ATTEMPT, never a successful HIT.
 * In particular: 3 attempts != defeated boss.
 */
export function recordBossAttempt(current: readonly BossAttempt[], next: BossAttempt): BossAttempt[] {
  const copy = [...current]
  if (!next.submissionId || !next.questionInstanceId) return copy
  if (copy.some(item => item.submissionId === next.submissionId || item.questionInstanceId === next.questionInstanceId)) return copy
  if (getBossProgress(copy).defeated) return copy
  if (!['correct', 'wrong', 'timeout'].includes(next.result)) return copy
  if (next.result === 'timeout' && next.choice !== null) return copy
  if (next.result !== 'timeout' && !(['A', 'B', 'C', 'D'] as const).includes(next.choice as BossChoice)) return copy
  return [...copy, next]
}

export function getBossProgress(attempts: readonly BossAttempt[]) {
  const successes = attempts.filter(a => a.result === 'correct').length
  const hits = Math.min(successes, BOSS_MAX_HP)
  const wrong = attempts.filter(a => a.result === 'wrong').length
  const timeout = attempts.filter(a => a.result === 'timeout').length
  return {
    hits,
    maxHp: BOSS_MAX_HP,
    remainingHp: BOSS_MAX_HP - hits,
    defeated: hits >= BOSS_MAX_HP,
    attempted: attempts.length,
    wrong,
    timeout,
    accuracy: attempts.length ? Math.round((successes / attempts.length) * 100) : 0,
  }
}

export function bossFeedbackText(attempt?: BossAttempt) {
  if (!attempt) return 'Sẵn sàng đối đầu với Boss!'
  if (attempt.result === 'correct') return 'Phép thuật trúng đích! Khiên Boss đã nứt!'
  if (attempt.result === 'timeout') return 'Hết giờ! Boss vẫn còn khiên. Cùng thử câu mới nhé!'
  return 'Chưa chính xác. Boss vẫn còn khiên. Hãy xem gợi ý và thử câu mới!'
}

/** Use only in the confirmed-answer handler, never inside render/useEffect. */
export function bossAudioForAttempt(attempt: BossAttempt, wasDefeated: boolean): string {
  if (attempt.result !== 'correct') return attempt.result === 'timeout'
    ? '/audio/sfx/quiz/time_up.wav'
    : '/audio/sfx/quiz/answer_wrong_gentle.wav'
  return wasDefeated
    ? '/audio/sfx/adventure/boss_defeated.wav'
    : '/audio/sfx/adventure/boss_hit.wav'
}

export const BOSS_MUSIC = '/audio/music/04_lau_dai_boss_violet.ogg'

/**
 * Suggestion for the host: use a DIFFERENT question after a miss so children
 * cannot brute-force a displayed correction. Never reset the hit count.
 */
export function suggestNextBossAction(attempts: readonly BossAttempt[], remainingQuestions: number) {
  const progress = getBossProgress(attempts)
  if (progress.defeated) return 'victory' as const
  if (remainingQuestions <= 0) return 'practice-complete' as const
  return 'next-question' as const
}
