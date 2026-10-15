/**
 * Independent stage model. The webcam/game engine remains the single source of
 * truth for submissions, scores, timeouts and phase transitions.
 */
export type TreasureChoice = 'A' | 'B' | 'C' | 'D'
export type TreasurePhase = 'intro' | 'thinking' | 'answering' | 'feedback' | 'complete'
export type TreasureRound = 0 | 1 | 2

export interface TreasureOutcome {
  /** Stable unique question id (e.g. q07). */
  questionId: string
  /** Which question in the Treasure Island stage. */
  round: TreasureRound
  /** null means timeout / unanswered. */
  choice: TreasureChoice | null
  isCorrect: boolean
}

export interface TreasureStep {
  id: 'map' | 'key' | 'chest'
  label: string
  instructions: string
  item: string
  success: string
  gentleFallback: string
}

export const TREASURE_STEPS: readonly TreasureStep[] = [
  {
    id: 'map',
    label: 'Tìm mảnh bản đồ',
    instructions: 'Giải câu toán để khám phá đường đến rương báu.',
    item: '/assets/treasure/map_fragment.svg',
    success: 'Em đã tìm được bản đồ bí mật!',
    gentleFallback: 'Cùng xem lời giải và thử lại để nhận mảnh bản đồ nhé!',
  },
  {
    id: 'key',
    label: 'Giành chìa khóa vàng',
    instructions: 'Tạo dáng A, B, C hoặc D để mở cánh cổng phép thuật.',
    item: '/assets/treasure/golden_key.svg',
    success: 'Chìa khóa vàng đã thuộc về em!',
    gentleFallback: 'Chìa khóa còn đang khóa. Cùng giải lại câu này nhé!',
  },
  {
    id: 'chest',
    label: 'Mở rương kho báu',
    instructions: 'Vượt qua câu toán cuối cùng để lấy viên pha lê.',
    item: '/assets/items/crystal_yellow.png',
    success: 'Rương báu mở rồi! Viên pha lê đã phát sáng!',
    gentleFallback: 'Rương chưa mở. Cùng thử lại để nhận viên pha lê nhé!',
  },
] as const

/** Last submission wins only if valid stage index; duplicate events do not award twice. */
export function recordTreasureOutcome(
  existing: readonly TreasureOutcome[],
  next: TreasureOutcome,
): TreasureOutcome[] {
  if (next.round < 0 || next.round > 2 || !TREASURE_STEPS[next.round]) return [...existing]
  if (existing.some((result) => result.round === next.round || result.questionId === next.questionId)) {
    return [...existing]
  }
  // Never accept later rounds before earlier ones. Prevents optimistic UI skipping a question.
  if (existing.length !== next.round) return [...existing]
  return [...existing, next]
}

export function getTreasureProgress(results: readonly TreasureOutcome[]) {
  const hasMap=results.some(r=>r.round===0&&r.isCorrect)
  const hasKey=hasMap&&results.some(r=>r.round===1&&r.isCorrect)
  const chestOpened=hasKey&&results.some(r=>r.round===2&&r.isCorrect)
  const correct = results.filter((r) => r.isCorrect).length
  return {
    hasMap,hasKey,chestOpened,
    completed: chestOpened,
    correct,
    stars: correct === 3 ? 3 : correct === 2 ? 2 : correct === 1 ? 1 : 0,
  }
}

export function treasureAudioForResult(result: TreasureOutcome) {
  // Do not play by useEffect in scene, as re-renders could replay audio.
  if (!result.isCorrect) return '/audio/sfx/quiz/answer_wrong_gentle.wav'
  if (result.round === 2) return '/audio/sfx/adventure/chest_open.wav'
  return '/audio/sfx/rewards/collect_star.wav'
}

export const TREASURE_BACKGROUND_MUSIC = '/audio/music/03_dao_kho_bau.ogg'
